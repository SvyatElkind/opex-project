import React, { useState, useEffect, useCallback, useRef } from 'react';
import CopyButton, { formatFormReport } from './CopyButton';
import { RECIPES } from '../formPuppetRecipes';
import { runPuppetSteps, waitForSelector, sleep } from '../formPuppetEngine';

/**
 * FormInspector — Form catalog + live field inspector
 *
 * Two modes:
 *   1. CATALOG: Shows all app forms, their hierarchy level, and availability
 *   2. INSPECT: Minimizes DevAdmin to a floating mini-panel while a form is tested
 *
 * The form catalog knows which forms exist at each project hierarchy level:
 *   Project → Institution / Fond / Inventory forms
 *   Inventory → Item forms
 *   Item → Record / Media Record forms
 *   Record → File / Metadata forms
 */

// ─── Form Catalog Definition ──────────────────────────────────────────────────

const FORM_CATALOG = [
  {
    group: 'Projekts',
    icon: 'fa-folder',
    level: 'project',
    forms: [
      { id: 'upload_report',    name: 'VVAIS atskaites augšupielāde',  event: 'openUploadReportModal',  requires: 'project',   description: 'Augšupielādē .xlsx atskaiti' },
      { id: 'institution_sign', name: 'Parakstītāji',                  event: 'openSignersModal',       requires: 'project',   description: 'Iestādes parakstītāju dati' },
      { id: 'settings',         name: 'Iestatījumi',                   event: null,                     requires: 'any',       description: 'Tēma, preseti, validācija (atver no rīkjoslas)' },
      { id: 'verification',     name: 'Verifikācija / Eksports',       event: 'openValidationModal',    requires: 'project',   description: 'Pārbauda visu projektu' },
    ]
  },
  {
    group: 'Uzskaites saraksts (US)',
    icon: 'fa-list-alt',
    level: 'project',
    forms: [
      { id: 'inventory_create', name: 'Jauns US',         event: 'openInventoryCreate',  requires: 'project',   description: 'Veids, datumi, termiņš' },
      { id: 'inventory_edit',   name: 'Rediģēt US',       event: null,                   requires: 'inventory', description: 'Ierobežota vai pilna rediģēšana (atver no US)' },
      { id: 'inventory_period', name: 'US perioda popup',  event: null,                   requires: 'inventory', description: 'Datumu diapazons (atver no US)' },
    ]
  },
  {
    group: 'Glabājamā vienība (GV)',
    icon: 'fa-box',
    level: 'inventory',
    forms: [
      { id: 'item_create', name: 'Jauna GV',        event: null,    requires: 'inventory', description: '6 sadaļas (atver no US skata)' },
      { id: 'item_edit',   name: 'Rediģēt GV',      event: null,    requires: 'item',      description: 'Navigējama sadaļu forma (atver no GV)' },
    ]
  },
  {
    group: 'Dokuments',
    icon: 'fa-file-alt',
    level: 'item',
    forms: [
      { id: 'record_create_doc',   name: 'Jauns tekstuāls dokuments',  event: null, requires: 'item_textual',   description: '4 sadaļas (atver no GV skata)' },
      { id: 'record_create_media', name: 'Jauns mediju dokuments',      event: null, requires: 'item_media',     description: '2 soļi: datne → metadati (atver no GV)' },
      { id: 'record_edit_doc',     name: 'Rediģēt dokumentu',          event: null, requires: 'record_textual', description: 'Pilna dokumenta rediģēšana (atver no Dok.)' },
      { id: 'record_edit_media',   name: 'Rediģēt mediju metadatus',   event: null, requires: 'record_media',   description: 'Krāsa, izšķirtspēja, ilgums (atver no Dok.)' },
    ]
  },
  {
    group: 'Datnes un metadati',
    icon: 'fa-paperclip',
    level: 'record',
    forms: [
      { id: 'file_upload',    name: 'Datņu augšupielāde',  event: null,                  requires: 'record_electronic', description: 'Drag & drop vai pārlūks' },
      { id: 'metadata_add',   name: 'Pievienot metadatus',  event: null,                  requires: 'record_textual',    description: 'Darbības, adresāti, vīzas, lasīšana' },
    ]
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const FormInspector = () => {
  const [mode, setMode] = useState('catalog'); // 'catalog' | 'inspect'
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedFields, setExpandedFields] = useState({});
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    FORM_CATALOG.forEach(g => { initial[g.group] = true; });
    return initial;
  });
  const intervalRef = useRef(null);
  const initialValuesRef = useRef({});

  // ─── Determine current navigation level ───────────────────────────────

  const getCurrentAvailability = useCallback(() => {
    // Check what's currently visible in the DOM to infer navigation level
    const available = new Set(['any']);

    // Check for project
    const projectEl = document.querySelector('[class*="project-details"], [class*="Project"], [class*="project-header"]');
    if (projectEl) available.add('project');

    // Check for inventory
    const inventoryEl = document.querySelector('[class*="inventory-item"], [class*="Inventories"], [class*="inventory-list"]');
    if (inventoryEl) available.add('inventory');

    // Check for items
    const itemEl = document.querySelector('[class*="item-view"], [class*="items-table"], [class*="Item"]');
    if (itemEl) {
      available.add('item');
      available.add('item_textual');
      available.add('item_media');
    }

    // Check for records
    const recordEl = document.querySelector('[class*="record-view"], [class*="records-list"], [class*="Record"]');
    if (recordEl) {
      available.add('record');
      available.add('record_textual');
      available.add('record_media');
      available.add('record_electronic');
    }

    return available;
  }, []);

  const [availability, setAvailability] = useState(() => getCurrentAvailability());

  useEffect(() => {
    const timer = setInterval(() => {
      setAvailability(getCurrentAvailability());
    }, 2000);
    return () => clearInterval(timer);
  }, [getCurrentAvailability]);

  // ─── Form Scanning (inspect mode) ─────────────────────────────────────

  const scanForms = useCallback(() => {
    const allForms = document.querySelectorAll('form');
    const portals = document.querySelectorAll('[class*="popup"], [class*="modal"], [class*="overlay"], [class*="Portal"]');

    const inputContainers = new Set();
    allForms.forEach(f => inputContainers.add(f));
    portals.forEach(p => {
      if (p.querySelectorAll('input, select, textarea').length > 0) {
        inputContainers.add(p);
      }
    });

    if (inputContainers.size === 0) {
      const looseInputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
      if (looseInputs.length > 0) {
        inputContainers.add(document.body);
      }
    }

    const formData = [];
    inputContainers.forEach((container, index) => {
      const inputs = container.querySelectorAll('input, select, textarea');
      if (inputs.length === 0) return;

      const fields = [];
      inputs.forEach(input => {
        if (input.type === 'hidden') return;
        if (input.closest('.dev-admin-window')) return;
        if (input.closest('.dev-admin-minimized')) return;
        if (input.closest('.dev-form-mini-inspector')) return;

        const name = input.name || input.id || input.getAttribute('aria-label') ||
                     input.placeholder || `[${input.type || 'text'}]`;
        const value = input.type === 'checkbox' ? input.checked :
                      input.type === 'file' ? (input.files?.length ? `${input.files.length} file(s)` : '') :
                      input.value;

        const valueStr = String(value);
        const fieldKey = `${name}_${input.type}`;

        if (initialValuesRef.current[fieldKey] === undefined) {
          initialValuesRef.current[fieldKey] = valueStr;
        }
        const isDirty = valueStr !== initialValuesRef.current[fieldKey];

        fields.push({
          name,
          value: valueStr,
          type: input.type || input.tagName.toLowerCase(),
          required: input.required || input.getAttribute('aria-required') === 'true',
          disabled: input.disabled,
          readOnly: input.readOnly,
          valid: input.validity?.valid !== false,
          validationMessage: input.validationMessage || '',
          maxLength: input.maxLength > 0 ? input.maxLength : null,
          currentLength: typeof value === 'string' ? value.length : 0,
          isEmpty: !value || (typeof value === 'string' && value.trim() === ''),
          isDirty,
          element: input,
        });
      });

      if (fields.length > 0) {
        const formName = container.getAttribute('name') ||
                        container.getAttribute('id') ||
                        container.getAttribute('class')?.split(' ')[0] ||
                        `Form ${index + 1}`;
        formData.push({
          id: index,
          name: formName,
          fields,
          totalFields: fields.length,
          emptyRequired: fields.filter(f => f.required && f.isEmpty).length,
          invalidFields: fields.filter(f => !f.valid).length,
          filledFields: fields.filter(f => !f.isEmpty).length,
          dirtyFields: fields.filter(f => f.isDirty).length,
        });
      }
    });

    setForms(formData);
    if (formData.length > 0 && selectedForm === null) {
      setSelectedForm(0);
    }
  }, [selectedForm]);

  useEffect(() => {
    if (mode !== 'inspect') return;
    scanForms();
    if (autoRefresh) {
      intervalRef.current = setInterval(scanForms, 500);
      return () => clearInterval(intervalRef.current);
    }
  }, [autoRefresh, scanForms, mode]);

  // ─── Helpers ──────────────────────────────────────────────────────────

  const activeForm = forms.find(f => f.id === selectedForm);

  const resetDirtyTracking = () => {
    initialValuesRef.current = {};
    scanForms();
  };

  const getFieldStatusIcon = (field) => {
    if (field.disabled) return { icon: 'fa-ban', color: '#6b7280' };
    if (!field.valid) return { icon: 'fa-times-circle', color: '#ef4444' };
    if (field.required && field.isEmpty) return { icon: 'fa-exclamation-circle', color: '#f59e0b' };
    if (field.isDirty) return { icon: 'fa-pen', color: '#3b82f6' };
    if (!field.isEmpty) return { icon: 'fa-check-circle', color: '#10b981' };
    return { icon: 'fa-circle', color: '#4b5563' };
  };

  const highlightField = (field) => {
    if (field.element) {
      field.element.style.outline = '3px solid #f59e0b';
      field.element.style.outlineOffset = '2px';
      field.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        field.element.style.outline = '';
        field.element.style.outlineOffset = '';
      }, 2000);
    }
  };

  const isFormAvailable = (form) => {
    if (form.requires === 'any') return true;
    return availability.has(form.requires) || availability.has(form.requires.split('_')[0]);
  };

  const triggerForm = (form) => {
    if (!form.event) return;
    // Tell DevAdminPanel to hide itself and show the MiniFormInspector instead,
    // then fire the form-opening event so the form renders without the overlay blocking it
    window.dispatchEvent(new CustomEvent('startFormInspect', { detail: { event: form.event } }));
  };

  // ─── Render: Catalog Mode ─────────────────────────────────────────────

  const renderCatalog = () => (
    <>
      <div style={{ marginBottom: 12, padding: '8px 12px', background: '#1f2937', borderRadius: 6, fontSize: 12, color: '#9ca3af' }}>
        <i className="fas fa-info-circle" style={{ marginRight: 6, color: '#3b82f6' }}></i>
        Formu katalogs rāda visas lietotnes formas un to pieejamību pašreizējā navigācijas līmenī.
        Nospiediet <strong style={{ color: '#e5e7eb' }}>Testēt</strong>, lai atvērtu formu un pārietu uz inspektēšanas režīmu.
      </div>

      {FORM_CATALOG.map(group => {
        const isExpanded = expandedGroups[group.group];
        const availableCount = group.forms.filter(f => isFormAvailable(f)).length;
        const totalCount = group.forms.length;

        return (
          <div key={group.group} className="test-suite-card" style={{ marginBottom: 6 }}>
            <div
              className="test-suite-header"
              style={{ padding: '8px 12px', cursor: 'pointer' }}
              onClick={() => setExpandedGroups(prev => ({ ...prev, [group.group]: !prev[group.group] }))}
            >
              <div className="test-suite-header-left" style={{ gap: 8, alignItems: 'center' }}>
                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`} style={{ fontSize: 10, color: '#6b7280', width: 10 }}></i>
                <i className={`fas ${group.icon}`} style={{ color: '#f59e0b', fontSize: 14 }}></i>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{group.group}</span>
              </div>
              <div className="test-suite-header-right">
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: availableCount === totalCount ? '#064e3b' : availableCount > 0 ? '#78350f' : '#7f1d1d',
                  color: availableCount === totalCount ? '#6ee7b7' : availableCount > 0 ? '#fcd34d' : '#fca5a5',
                }}>
                  {availableCount}/{totalCount} pieejamas
                </span>
              </div>
            </div>

            {isExpanded && (
              <div style={{ padding: '4px 8px 8px' }}>
                {group.forms.map(form => {
                  const available = isFormAvailable(form);
                  return (
                    <div key={form.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', borderRadius: 4, marginBottom: 2,
                      background: available ? '#1f2937' : '#111827',
                      opacity: available ? 1 : 0.5,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i className={`fas ${available ? 'fa-check-circle' : 'fa-lock'}`}
                             style={{ fontSize: 10, color: available ? '#10b981' : '#6b7280' }}></i>
                          <span style={{ fontSize: 12, fontWeight: 500, color: available ? '#e5e7eb' : '#6b7280' }}>
                            {form.name}
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2, marginLeft: 16 }}>
                          {form.description}
                          {!available && (
                            <span style={{ color: '#ef4444', marginLeft: 6 }}>
                              — nepieciešams: {form.requires.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                        {form.event && (
                          <button
                            className="dev-btn"
                            style={{ padding: '3px 10px', fontSize: 11 }}
                            onClick={(e) => { e.stopPropagation(); triggerForm(form); }}
                            disabled={!available}
                            title={available ? 'Atvērt formu un inspektēt' : 'Forma nav pieejama šajā līmenī'}
                          >
                            <i className="fas fa-play" style={{ marginRight: 4, fontSize: 9 }}></i>
                            Testēt
                          </button>
                        )}
                        {RECIPES[form.id] && (
                          <button
                            className="dev-btn"
                            style={{ padding: '3px 10px', fontSize: 11, color: '#10b981', borderColor: '#10b98144' }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              const recipe = RECIPES[form.id];
                              const formEl = document.querySelector(recipe.formSelector);
                              if (!formEl && recipe.openEvent) {
                                window.dispatchEvent(new CustomEvent(recipe.openEvent));
                                try { await waitForSelector(recipe.formSelector, 3000); } catch { return; }
                              }
                              if (!document.querySelector(recipe.formSelector)) return;
                              await sleep(500);
                              const steps = recipe.getSteps();
                              await runPuppetSteps(steps, null, { delayBetween: 400 });
                            }}
                            disabled={!available}
                            title="Automatiski aizpildit formu ar testa datiem"
                          >
                            <i className="fas fa-robot" style={{ marginRight: 4, fontSize: 9 }}></i>
                            Auto-fill
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  // ─── Render: Inspect Mode ─────────────────────────────────────────────

  const renderInspect = () => (
    <>
      {/* Controls */}
      <div className="test-controls">
        <div className="test-controls-row">
          <button
            className={`dev-btn ${autoRefresh ? 'primary' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <i className={`fas ${autoRefresh ? 'fa-pause' : 'fa-sync'}`}></i>
            <span>{autoRefresh ? 'Live' : 'Paused'}</span>
          </button>
          <button className="dev-btn" onClick={scanForms}>
            <i className="fas fa-search"></i>
            <span>Scan</span>
          </button>
          <button className="dev-btn" onClick={resetDirtyTracking}>
            <i className="fas fa-undo"></i>
            <span>Reset</span>
          </button>
          {activeForm && (
            <CopyButton getText={() => formatFormReport(activeForm)} label="Copy" />
          )}
          {forms.length > 1 && (
            <select
              className="test-suite-select"
              value={selectedForm || 0}
              onChange={(e) => setSelectedForm(Number(e.target.value))}
              style={{ maxWidth: 200 }}
            >
              {forms.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.totalFields} fields)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {activeForm && (
        <div className="result-cards" style={{ marginBottom: 12 }}>
          <div className="result-card info">
            <i className="fas fa-list"></i>
            <div className="card-content"><h4>FIELDS</h4><p className="count">{activeForm.totalFields}</p></div>
          </div>
          <div className="result-card success">
            <i className="fas fa-check"></i>
            <div className="card-content"><h4>FILLED</h4><p className="count">{activeForm.filledFields}</p></div>
          </div>
          <div className={`result-card ${activeForm.emptyRequired > 0 ? 'error' : 'success'}`}>
            <i className="fas fa-asterisk"></i>
            <div className="card-content"><h4>EMPTY REQ.</h4><p className="count">{activeForm.emptyRequired}</p></div>
          </div>
          <div className={`result-card ${activeForm.dirtyFields > 0 ? 'warning' : 'info'}`}>
            <i className="fas fa-pen"></i>
            <div className="card-content"><h4>DIRTY</h4><p className="count">{activeForm.dirtyFields}</p></div>
          </div>
        </div>
      )}

      {/* Field List */}
      <div style={{ maxHeight: 350, overflow: 'auto' }}>
        {forms.length === 0 && (
          <div className="dev-empty-state">
            <i className="fas fa-wpforms"></i>
            <p>Neviena forma nav atvērta</p>
            <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, maxWidth: 300, margin: '4px auto' }}>
              Izmantojiet <strong>Katalogu</strong> un nospiediet <strong>"Testēt"</strong> — DevAdmin aizvērsies, forma atvērsies, un mazais inspektors parādīsies stūrī.
            </p>
            <button className="dev-btn" onClick={() => setMode('catalog')} style={{ marginTop: 8 }}>
              <i className="fas fa-arrow-left"></i> Uz katalogu
            </button>
          </div>
        )}

        {activeForm?.fields.map((field, idx) => {
          const status = getFieldStatusIcon(field);
          const isExpanded = expandedFields[idx];
          return (
            <div key={idx} className="test-suite-card" style={{ marginBottom: 2 }}>
              <div
                className="test-suite-header"
                style={{ padding: '5px 10px', cursor: 'pointer' }}
                onClick={() => setExpandedFields(prev => ({ ...prev, [idx]: !prev[idx] }))}
              >
                <div className="test-suite-header-left" style={{ gap: 8, alignItems: 'center' }}>
                  <i className={`fas ${status.icon}`} style={{ color: status.color, fontSize: 12 }}></i>
                  <span style={{ fontSize: 12, fontWeight: 600, minWidth: 80 }}>
                    {field.name}
                    {field.required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
                  </span>
                  <span style={{
                    fontSize: 10, color: '#9ca3af',
                    background: '#1f2937', padding: '1px 5px', borderRadius: 3
                  }}>
                    {field.type}
                  </span>
                  <span style={{
                    fontSize: 11, color: '#d1d5db', fontFamily: 'monospace',
                    maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {field.value || <span style={{ color: '#4b5563' }}>(empty)</span>}
                  </span>
                </div>
                <div className="test-suite-header-right" style={{ gap: 6 }}>
                  {field.maxLength && (
                    <span style={{
                      fontSize: 10,
                      color: field.currentLength > field.maxLength * 0.9 ? '#f59e0b' : '#6b7280'
                    }}>
                      {field.currentLength}/{field.maxLength}
                    </span>
                  )}
                  <button
                    className="dev-btn"
                    style={{ padding: '2px 6px', fontSize: 10 }}
                    onClick={(e) => { e.stopPropagation(); highlightField(field); }}
                    title="Izcelt lauku lapā"
                  >
                    <i className="fas fa-crosshairs"></i>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="test-suite-body" style={{ padding: '6px 12px', fontSize: 11 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                    <span style={{ color: '#9ca3af' }}>Type:</span><span>{field.type}</span>
                    <span style={{ color: '#9ca3af' }}>Required:</span><span>{field.required ? 'Yes' : 'No'}</span>
                    <span style={{ color: '#9ca3af' }}>Disabled:</span><span>{field.disabled ? 'Yes' : 'No'}</span>
                    <span style={{ color: '#9ca3af' }}>Valid:</span>
                    <span style={{ color: field.valid ? '#10b981' : '#ef4444' }}>{field.valid ? 'Yes' : 'No'}</span>
                    {field.validationMessage && (
                      <>
                        <span style={{ color: '#9ca3af' }}>Error:</span>
                        <span style={{ color: '#fca5a5' }}>{field.validationMessage}</span>
                      </>
                    )}
                    <span style={{ color: '#9ca3af' }}>Value:</span>
                    <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{field.value || '(empty)'}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  // ─── Main Render ──────────────────────────────────────────────────────

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>
          <i className="fas fa-wpforms" style={{ marginRight: 8 }}></i>
          {mode === 'catalog' ? 'Formu katalogs' : 'Formu inspektors'}
        </h3>
        <div className="dev-panel-actions">
          <span style={{ color: '#9ca3af', fontSize: 12, marginRight: 8 }}>
            {mode === 'inspect' ? `${forms.length} forma(s)` : `${FORM_CATALOG.reduce((s, g) => s + g.forms.length, 0)} formas`}
          </span>
          <div className="view-mode-toggle">
            <button
              className={`mode-btn ${mode === 'catalog' ? 'active' : ''}`}
              onClick={() => setMode('catalog')}
            >
              <i className="fas fa-th-list"></i> Katalogs
            </button>
            <button
              className={`mode-btn ${mode === 'inspect' ? 'active' : ''}`}
              onClick={() => setMode('inspect')}
            >
              <i className="fas fa-search"></i> Inspektēt
            </button>
          </div>
        </div>
      </div>

      <div className="dev-panel-body">
        {mode === 'catalog' ? renderCatalog() : renderInspect()}
      </div>
    </div>
  );
};

export default FormInspector;
