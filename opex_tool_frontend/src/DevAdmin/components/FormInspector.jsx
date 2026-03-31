import React, { useState, useEffect, useCallback, useRef } from 'react';
import CopyButton, { formatFormReport } from './CopyButton';

/**
 * FormInspector — Real-time form state viewer
 *
 * Monitors all form elements on the page and displays:
 * - Field names, values, types
 * - Dirty state (changed from initial)
 * - Validation errors (HTML5 validity)
 * - Required vs optional fields
 * - Empty required fields
 * - Real-time updates as user types
 */

const FormInspector = () => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedFields, setExpandedFields] = useState({});
  const intervalRef = useRef(null);
  const initialValuesRef = useRef({});

  const scanForms = useCallback(() => {
    const allForms = document.querySelectorAll('form');
    const portals = document.querySelectorAll('[class*="popup"], [class*="modal"], [class*="overlay"], [class*="Portal"]');

    // Also scan portals/modals that might have inputs outside <form>
    const inputContainers = new Set();
    allForms.forEach(f => inputContainers.add(f));
    portals.forEach(p => {
      if (p.querySelectorAll('input, select, textarea').length > 0) {
        inputContainers.add(p);
      }
    });

    // If no forms found, scan the whole document for loose inputs
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
        // Skip hidden inputs and DevAdmin's own inputs
        if (input.type === 'hidden') return;
        if (input.closest('.dev-admin-window')) return;

        const name = input.name || input.id || input.getAttribute('aria-label') ||
                     input.placeholder || `[${input.type || 'text'}]`;
        const value = input.type === 'checkbox' ? input.checked :
                      input.type === 'file' ? (input.files?.length ? `${input.files.length} file(s)` : '') :
                      input.value;

        const valueStr = String(value);
        const fieldKey = `${name}_${input.type}`;

        // Track initial values for dirty detection
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
          initialValue: initialValuesRef.current[fieldKey],
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
    scanForms();
    if (autoRefresh) {
      intervalRef.current = setInterval(scanForms, 500);
      return () => clearInterval(intervalRef.current);
    }
  }, [autoRefresh, scanForms]);

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
      field.element.style.outline = '2px solid #f59e0b';
      field.element.style.outlineOffset = '2px';
      field.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        field.element.style.outline = '';
        field.element.style.outlineOffset = '';
      }, 2000);
    }
  };

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>Form Inspector</h3>
        <div className="dev-panel-actions">
          <span style={{ color: '#9ca3af', fontSize: 13, marginRight: 8 }}>
            {forms.length} form(s) detected
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="test-controls">
        <div className="test-controls-row">
          <button
            className={`dev-btn ${autoRefresh ? 'primary' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <i className={`fas ${autoRefresh ? 'fa-pause' : 'fa-sync'}`}></i>
            <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
          </button>
          <button className="dev-btn" onClick={scanForms}>
            <i className="fas fa-search"></i>
            <span>Scan Now</span>
          </button>
          <button className="dev-btn" onClick={resetDirtyTracking}>
            <i className="fas fa-undo"></i>
            <span>Reset Dirty</span>
          </button>
          {activeForm && (
            <CopyButton
              getText={() => formatFormReport(activeForm)}
              label="Copy Report"
            />
          )}

          {forms.length > 1 && (
            <select
              className="test-suite-select"
              value={selectedForm || 0}
              onChange={(e) => setSelectedForm(Number(e.target.value))}
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
            <div className="card-content">
              <h4>FIELDS</h4>
              <p className="count">{activeForm.totalFields}</p>
            </div>
          </div>
          <div className="result-card success">
            <i className="fas fa-check"></i>
            <div className="card-content">
              <h4>FILLED</h4>
              <p className="count">{activeForm.filledFields}</p>
            </div>
          </div>
          <div className={`result-card ${activeForm.emptyRequired > 0 ? 'error' : 'success'}`}>
            <i className="fas fa-asterisk"></i>
            <div className="card-content">
              <h4>EMPTY REQ.</h4>
              <p className="count">{activeForm.emptyRequired}</p>
            </div>
          </div>
          <div className={`result-card ${activeForm.invalidFields > 0 ? 'error' : 'info'}`}>
            <i className="fas fa-times"></i>
            <div className="card-content">
              <h4>INVALID</h4>
              <p className="count">{activeForm.invalidFields}</p>
            </div>
          </div>
          <div className={`result-card ${activeForm.dirtyFields > 0 ? 'error' : 'info'}`}>
            <i className="fas fa-pen"></i>
            <div className="card-content">
              <h4>DIRTY</h4>
              <p className="count">{activeForm.dirtyFields}</p>
            </div>
          </div>
        </div>
      )}

      {/* Field List */}
      <div style={{ maxHeight: 350, overflow: 'auto' }}>
        {!activeForm && (
          <div className="dev-empty-state">
            <i className="fas fa-wpforms"></i>
            <p>No forms detected on the page</p>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              Open a create/edit form to inspect its fields
            </p>
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
                  <span style={{ fontSize: 12, fontWeight: 600, minWidth: 100 }}>
                    {field.name}
                    {field.required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
                  </span>
                  <span style={{
                    fontSize: 11, color: '#9ca3af',
                    background: '#1f2937', padding: '1px 6px', borderRadius: 3
                  }}>
                    {field.type}
                  </span>
                  <span style={{
                    fontSize: 12, color: '#d1d5db', fontFamily: 'monospace',
                    maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
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
                    title="Highlight field in page"
                  >
                    <i className="fas fa-crosshairs"></i>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="test-suite-body" style={{ padding: '6px 12px', fontSize: 11 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                    <span style={{ color: '#9ca3af' }}>Type:</span>
                    <span>{field.type}</span>
                    <span style={{ color: '#9ca3af' }}>Required:</span>
                    <span>{field.required ? 'Yes' : 'No'}</span>
                    <span style={{ color: '#9ca3af' }}>Disabled:</span>
                    <span>{field.disabled ? 'Yes' : 'No'}</span>
                    <span style={{ color: '#9ca3af' }}>Read Only:</span>
                    <span>{field.readOnly ? 'Yes' : 'No'}</span>
                    <span style={{ color: '#9ca3af' }}>Valid:</span>
                    <span style={{ color: field.valid ? '#10b981' : '#ef4444' }}>
                      {field.valid ? 'Yes' : 'No'}
                    </span>
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
    </div>
  );
};

export default FormInspector;
