import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  INVENTORY_TYPES, STORAGE_TERMS, METADATA_CLASSES,
  createProject, createInventory, createItem, createRecord,
  uploadFile, addMetadata, addAllMetadata,
  fillProject as runFillProject,
  fetchProject, loadManifest, randomProjectName,
  resolveProjectRoot, getStoredProjectRoot, setStoredProjectRoot,
  describeApiError,
} from '../devDataFactory';

/**
 * QuickCreate — one-click test data builder.
 *
 * Chain: Projekts → US (inventory) → GV (item) → Dok. (record) → Datne + metadati.
 *
 * Every creator takes a count, so seeding 25 items is one click rather than 25.
 * Entity ids come from the POST responses (see devDataFactory), so a run costs
 * one request per entity instead of re-fetching the whole project each time.
 */

const COUNT_PRESETS = [1, 5, 10, 25, 50];

const QuickCreate = ({ projectData }) => {
  const queryClient = useQueryClient();
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const stopRef = useRef(false);

  // Selection
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');

  // Creation options
  const [count, setCount] = useState(1);
  const [electronic, setElectronic] = useState(true);
  const [storageTerm, setStorageTerm] = useState(STORAGE_TERMS[0]);
  const [metadataClass, setMetadataClass] = useState('all');

  // Fill config
  const [showFillConfig, setShowFillConfig] = useState(false);
  const [fillConfig, setFillConfig] = useState({
    inventoryCount: 2,
    itemsPerInventory: 3,
    recordsPerItem: 1,
    filesPerRecord: 1,
    withMetadata: true,
  });

  const [manifestFiles, setManifestFiles] = useState(null);
  const [showFileList, setShowFileList] = useState(false);

  // Root folder for new projects — see resolveProjectRoot in devDataFactory.
  const [projectRoot, setProjectRoot] = useState(getStoredProjectRoot());
  const [rootResolved, setRootResolved] = useState(false);

  useEffect(() => { loadManifest().then(setManifestFiles); }, []);

  // Derive a usable root from an existing project when the user hasn't set one.
  useEffect(() => {
    let cancelled = false;
    if (getStoredProjectRoot()) { setRootResolved(true); return undefined; }
    resolveProjectRoot().then(root => {
      if (cancelled) return;
      if (root) setProjectRoot(root);
      setRootResolved(true);
    });
    return () => { cancelled = true; };
  }, []);

  const projectId = projectData?.id;
  const fondId = projectData?.institution?.fond?.id;
  const inventories = projectData?.institution?.fond?.inventories || [];

  const selectedInventory = inventories.find(inv => inv.id === parseInt(selectedInventoryId, 10));
  const items = selectedInventory?.items || [];
  const selectedItem = items.find(it => it.id === parseInt(selectedItemId, 10));
  const records = selectedItem?.records || [];

  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }].slice(-200));
  }, []);

  const refreshProject = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['project', 'detail', projectId] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  }, [queryClient, projectId]);

  /**
   * Wrap a bulk run: guards double-starts, streams a log, and refreshes the
   * cache exactly once at the end instead of after every entity.
   */
  const runBatch = useCallback(async (label, fn) => {
    if (isRunning) return;
    setIsRunning(true);
    stopRef.current = false;
    addLog(`=== ${label} ===`);
    try {
      await fn();
    } catch (e) {
      addLog(`Neizdevās: ${e.message}`, 'error');
    } finally {
      refreshProject();
      setIsRunning(false);
    }
  }, [isRunning, addLog, refreshProject]);

  const stopped = () => stopRef.current;

  // ─── Creators ───────────────────────────────────────────────────────────

  const handleCreateProjects = () => runBatch(`Veido ${count} projektu(s)`, async () => {
    const root = projectRoot || await resolveProjectRoot();
    if (!root) {
      addLog('Nav norādīta projektu saknes mape — ievadiet to laukā "Saknes mape".', 'error');
      addLog('Tai jābūt mapei, kas jau eksistē šajā datorā, piem. C:\\Users\\Jūs\\Documents\\OPEX', 'info');
      return;
    }
    addLog(`Saknes mape: ${root}`, 'info');

    let ok = 0;
    for (let i = 0; i < count; i++) {
      if (stopped()) break;
      try {
        const p = await createProject(randomProjectName(), root);
        ok++;
        addLog(`Projekts "${p.name || '?'}" izveidots (ID: ${p.id})`, 'success');
      } catch (e) {
        addLog(`Kļūda: ${describeApiError(e)}`, 'error');
      }
    }
    if (ok) setStoredProjectRoot(root); // remember a root that actually worked
    addLog(`Izveidoti ${ok}/${count} projekti`, ok ? 'success' : 'error');
  });

  const handleCreateInventories = (type = null) => runBatch(
    `Veido ${count} US${type ? ` (${type})` : ''}`,
    async () => {
      if (!fondId) { addLog('Nav fonda', 'error'); return; }
      // Read the live count once so numbering continues correctly.
      let next = inventories.length + 1;
      try {
        const fresh = await fetchProject(projectId);
        next = (fresh?.institution?.fond?.inventories?.length || 0) + 1;
      } catch { /* fall back to the cached count */ }

      let ok = 0;
      for (let i = 0; i < count; i++) {
        if (stopped()) break;
        try {
          const inv = await createInventory(projectId, fondId, next + i, {
            type: type || undefined,
            electronic,
            storageTerm,
          });
          ok++;
          addLog(`US #${next + i} ${inv.type || type || ''} izveidots (ID: ${inv.id})`, 'success');
        } catch (e) {
          addLog(`Kļūda: ${describeApiError(e)}`, 'error');
        }
      }
      addLog(`Izveidoti ${ok}/${count} US`, ok ? 'success' : 'error');
    }
  );

  const handleCreateItems = () => runBatch(`Veido ${count} GV`, async () => {
    if (!selectedInventory) { addLog('Izvēlieties US', 'error'); return; }
    let next = (selectedInventory.items?.length || 0) + 1;
    let ok = 0;
    for (let i = 0; i < count; i++) {
      if (stopped()) break;
      try {
        const item = await createItem(projectId, selectedInventory.id, selectedInventory, next + i);
        ok++;
        addLog(`GV #${next + i} izveidota (ID: ${item.id})`, 'success');
      } catch (e) {
        addLog(`Kļūda: ${describeApiError(e)}`, 'error');
      }
    }
    addLog(`Izveidotas ${ok}/${count} GV`, ok ? 'success' : 'error');
  });

  const handleCreateRecords = () => runBatch(`Veido ${count} Dok.`, async () => {
    if (!selectedItemId || !selectedInventory) { addLog('Izvēlieties GV', 'error'); return; }
    const isMedia = selectedInventory.type !== 'Tekstuāls';
    if (isMedia && count > 1) {
      addLog('Mediju US: viena GV = viens ieraksts. Veido 1.', 'warning');
    }
    const target = isMedia ? 1 : count;
    let ok = 0;
    for (let i = 0; i < target; i++) {
      if (stopped()) break;
      try {
        const rec = await createRecord(projectId, parseInt(selectedItemId, 10), selectedInventory);
        ok++;
        addLog(`Dok. izveidots (ID: ${rec?.id || '?'})`, 'success');
      } catch (e) {
        addLog(`Kļūda: ${describeApiError(e)}`, 'error');
      }
    }
    addLog(`Izveidoti ${ok}/${target} Dok.`, ok ? 'success' : 'error');
  });

  const handleUploadFiles = () => runBatch(`Augšupielādē ${count} datni(-es)`, async () => {
    if (!selectedRecordId) { addLog('Izvēlieties Dok.', 'error'); return; }
    let ok = 0;
    for (let i = 0; i < count; i++) {
      if (stopped()) break;
      try {
        await uploadFile(projectId, parseInt(selectedRecordId, 10), selectedInventory?.type || 'Tekstuāls');
        ok++;
      } catch (e) {
        addLog(`Kļūda: ${describeApiError(e)}`, 'error');
      }
    }
    addLog(`Augšupielādētas ${ok}/${count} datnes`, ok ? 'success' : 'error');
  });

  const handleAddMetadata = () => runBatch('Pievieno metadatus', async () => {
    if (!selectedRecordId) { addLog('Izvēlieties Dok.', 'error'); return; }
    const recId = parseInt(selectedRecordId, 10);
    const date = records.find(r => r.id === recId)?.date;

    if (metadataClass === 'all') {
      let created = 0;
      let failed = 0;
      for (let i = 0; i < count; i++) {
        if (stopped()) break;
        const res = await addAllMetadata(projectId, recId, date);
        created += res.created;
        failed += res.failed;
      }
      addLog(`Metadati: ${created} izveidoti, ${failed} kļūdas`, failed ? 'warning' : 'success');
      return;
    }

    let ok = 0;
    for (let i = 0; i < count; i++) {
      if (stopped()) break;
      try {
        await addMetadata(projectId, recId, metadataClass, date);
        ok++;
      } catch (e) {
        addLog(`Kļūda: ${describeApiError(e)}`, 'error');
      }
    }
    addLog(`Pievienoti ${ok}/${count} ${metadataClass} metadati`, ok ? 'success' : 'error');
  });

  // ─── Scoped fills ───────────────────────────────────────────────────────

  const handleFillProject = () => runBatch('Aizpilda projektu', async () => {
    if (!fondId) { addLog('Nav fonda', 'error'); return; }
    let start = inventories.length + 1;
    try {
      const fresh = await fetchProject(projectId);
      start = (fresh?.institution?.fond?.inventories?.length || 0) + 1;
    } catch { /* cached count is good enough */ }

    const tally = await runFillProject(
      projectId, fondId,
      { ...fillConfig, electronic, startNumber: start },
      { onProgress: addLog, shouldStop: stopped }
    );
    addLog(
      `Kopā: ${tally.inventories} US, ${tally.items} GV, ${tally.records} Dok., ` +
      `${tally.files} datnes, ${tally.metadata} metadati` +
      (tally.errors ? `, ${tally.errors} kļūdas` : ''),
      tally.errors ? 'warning' : 'success'
    );
  });

  const handleFillInventory = () => runBatch('Aizpilda izvēlēto US', async () => {
    if (!selectedInventory) { addLog('Izvēlieties US', 'error'); return; }
    const inv = selectedInventory;
    const isMedia = inv.type !== 'Tekstuāls';
    let next = (inv.items?.length || 0) + 1;
    const tally = { items: 0, records: 0, files: 0, metadata: 0, errors: 0 };

    for (let i = 0; i < count; i++) {
      if (stopped()) break;
      try {
        const item = await createItem(projectId, inv.id, inv, next + i);
        tally.items++;
        const recordTarget = isMedia ? 1 : fillConfig.recordsPerItem;

        for (let k = 0; k < recordTarget; k++) {
          const rec = await createRecord(projectId, item.id, inv);
          tally.records++;
          if (isMedia) { tally.files++; continue; }
          if (!rec?.id) continue;

          for (let f = 0; f < fillConfig.filesPerRecord; f++) {
            await uploadFile(projectId, rec.id, inv.type);
            tally.files++;
          }
          if (fillConfig.withMetadata) {
            const res = await addAllMetadata(projectId, rec.id, rec.date);
            tally.metadata += res.created;
            tally.errors += res.failed;
          }
        }
        addLog(`GV ${i + 1}/${count} pabeigta`, 'info');
      } catch (e) {
        tally.errors++;
        addLog(`Kļūda: ${describeApiError(e)}`, 'error');
      }
    }
    addLog(
      `US aizpildīts: ${tally.items} GV, ${tally.records} Dok., ${tally.files} datnes, ${tally.metadata} metadati`,
      tally.errors ? 'warning' : 'success'
    );
  });

  // ─── Render ─────────────────────────────────────────────────────────────

  // Root-folder control. New projects need a directory that already exists on
  // this machine; the backend creates <root>/<name> inside it.
  const rootFolderRow = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                  background: '#0d1117', borderRadius: 6, padding: '6px 8px', marginBottom: 10 }}>
      <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
        Saknes mape:
      </span>
      <input
        type="text"
        className="test-suite-select"
        style={{ flex: 1, minWidth: 220, fontSize: 11, fontFamily: 'monospace' }}
        placeholder={rootResolved ? 'C:\\Users\\Jūs\\Documents\\OPEX' : 'Nosaka...'}
        value={projectRoot}
        onChange={e => setProjectRoot(e.target.value)}
        onBlur={e => setStoredProjectRoot(e.target.value.trim())}
        title="Mape, kurā tiks veidotas jauno projektu apakšmapes. Tai jau jāeksistē."
      />
      {projectRoot && (
        <button
          className="dev-btn" style={{ padding: '2px 8px', fontSize: 10 }}
          title="Notīrīt saglabāto saknes mapi"
          onClick={() => { setProjectRoot(''); setStoredProjectRoot(''); }}
        >
          <i className="fas fa-times"></i>
        </button>
      )}
      <span style={{ color: projectRoot ? '#10b981' : '#f59e0b', fontSize: 11 }}>
        <i className={`fas ${projectRoot ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
           style={{ marginRight: 4 }}></i>
        {projectRoot ? 'gatavs' : 'nepieciešams projektu veidošanai'}
      </span>
      <div style={{ flexBasis: '100%', color: '#fcd34d', fontSize: 10, lineHeight: 1.5 }}>
        <i className="fas fa-info-circle" style={{ marginRight: 4 }}></i>
        Jaunizveidotā projektā <strong>nevar</strong> veidot US/GV/Dok., kamēr nav
        augšupielādēta VVAIS atskaite — bez tās projektam nav fonda. Katru atskaiti var
        izmantot tikai vienreiz (iestādes reģ. nr. un nosaukums ir unikāli), tāpēc katram
        jaunam projektam vajag savu atskaites datni.
      </div>
    </div>
  );

  if (!projectData) {
    return (
      <div className="dev-panel-section">
        <div className="dev-empty-state">
          <i className="fas fa-folder-open"></i>
          <p>Atveriet projektu, lai izmantotu pilnu Quick Create</p>
        </div>
        {rootFolderRow}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
          <input
            type="number" min="1" max="50" value={count}
            onChange={e => setCount(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))}
            className="test-suite-select" style={{ width: 62, fontSize: 11 }}
          />
          <button className="dev-btn" onClick={handleCreateProjects} disabled={isRunning}>
            <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-folder-plus'}`}></i>
            <span>Izveidot {count} projektu</span>
          </button>
        </div>
        <div style={{ background: '#0d1117', borderRadius: 6, padding: 6, marginTop: 10,
                      maxHeight: 180, overflow: 'auto', fontFamily: 'monospace', fontSize: 11 }}>
          {logs.map((log, i) => (
            <div key={i} style={{
              padding: '1px 0',
              color: log.type === 'error' ? '#fca5a5'
                : log.type === 'success' ? '#6ee7b7'
                : log.type === 'warning' ? '#fcd34d' : '#9ca3af',
            }}>
              <span style={{ color: '#4b556366', marginRight: 4 }}>{log.time}</span>{log.msg}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totals = inventories.reduce((acc, inv) => {
    const its = inv.items || [];
    acc.items += its.length;
    its.forEach(it => { acc.records += (it.records || []).length; });
    return acc;
  }, { items: 0, records: 0 });

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>Quick Create</h3>
        <div className="dev-panel-actions">
          <button
            className="dev-btn"
            style={{ padding: '2px 8px', fontSize: 10 }}
            title="Pārlādēt manifest.json"
            onClick={() => loadManifest(true).then(files => {
              setManifestFiles(files);
              addLog(files.length ? `Manifest: ${files.length} datnes` : 'Manifest nav — dummy režīms',
                     files.length ? 'success' : 'info');
            })}
          >
            <i className="fas fa-sync"></i>
          </button>
          <span
            style={{
              color: manifestFiles && manifestFiles.length ? '#10b981' : '#f59e0b',
              fontSize: 11, marginRight: 8, cursor: 'pointer',
            }}
            onClick={() => setShowFileList(v => !v)}
          >
            <i className={`fas ${manifestFiles && manifestFiles.length ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
               style={{ marginRight: 4 }}></i>
            {manifestFiles === null ? 'Ielādē...'
              : manifestFiles.length ? `${manifestFiles.length} datnes` : 'dummy'}
          </span>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>
            {inventories.length} US | {totals.items} GV | {totals.records} Dok.
          </span>
        </div>
      </div>

      {showFileList && (
        <div style={{ background: '#0d1117', borderRadius: 6, padding: 8, marginBottom: 10,
                      maxHeight: 130, overflow: 'auto', fontSize: 11 }}>
          {manifestFiles && manifestFiles.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px', fontFamily: 'monospace', color: '#9ca3af' }}>
              {manifestFiles.map((f, i) => <span key={i}>{f}</span>)}
            </div>
          ) : (
            <div style={{ color: '#fcd34d' }}>
              Nav manifest.json — izmanto dummy datnes. Ievietojiet datnes <code>public/files/</code> un
              izpildiet <code>npm run manifest:public</code>.
            </div>
          )}
        </div>
      )}

      {rootFolderRow}

      {/* ── Shared options ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                    background: '#0d1117', borderRadius: 6, padding: '6px 8px', marginBottom: 10 }}>
        <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 600 }}>Skaits:</span>
        {COUNT_PRESETS.map(n => (
          <button
            key={n}
            className="dev-btn"
            onClick={() => setCount(n)}
            style={{
              padding: '2px 9px', fontSize: 11,
              borderColor: count === n ? '#3b82f6' : undefined,
              color: count === n ? '#60a5fa' : undefined,
            }}
          >{n}</button>
        ))}
        <input
          type="number" min="1" max="500" value={count}
          onChange={e => setCount(Math.max(1, Math.min(500, parseInt(e.target.value, 10) || 1)))}
          className="test-suite-select"
          style={{ width: 62, fontSize: 11 }}
        />

        <span style={{ width: 1, height: 18, background: '#374151' }} />

        <label style={{ color: '#9ca3af', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="checkbox" checked={electronic} onChange={e => setElectronic(e.target.checked)} />
          Elektronisks
        </label>
        <select
          className="test-suite-select" style={{ fontSize: 11, maxWidth: 190 }}
          value={storageTerm} onChange={e => setStorageTerm(e.target.value)}
        >
          {STORAGE_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {isRunning && (
          <button className="dev-btn" onClick={() => { stopRef.current = true; addLog('Apturēšana...', 'warning'); }}
                  style={{ padding: '2px 10px', fontSize: 11, borderColor: '#ef4444', color: '#fca5a5' }}>
            <i className="fas fa-stop"></i><span>Apturēt</span>
          </button>
        )}
      </div>

      {/* ── Fill ── */}
      <div style={{ padding: 10, marginBottom: 10, borderRadius: 6,
                    background: 'linear-gradient(135deg, #059669, #047857)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button className="dev-btn" onClick={handleFillProject} disabled={isRunning || !fondId}
                  style={{ borderColor: '#fff4', color: '#fff', fontWeight: 600 }}>
            <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i>
            <span>Fill Project</span>
          </button>
          <button className="dev-btn" onClick={handleFillInventory}
                  disabled={isRunning || !selectedInventoryId}
                  style={{ borderColor: '#fff4', color: '#fff' }}
                  title="Aizpilda izvēlēto US ar 'Skaits' GV (ar Dok., datnēm, metadatiem)">
            <i className="fas fa-layer-group"></i><span>Fill US</span>
          </button>
          <button className="dev-btn" onClick={() => setShowFillConfig(v => !v)}
                  style={{ borderColor: '#fff4', color: '#fff', padding: '4px 8px' }}>
            <i className="fas fa-sliders-h"></i>
          </button>
          <span style={{ color: '#d1fae5', fontSize: 11 }}>
            {fillConfig.inventoryCount} US x {fillConfig.itemsPerInventory} GV x {fillConfig.recordsPerItem} Dok.
            {fillConfig.filesPerRecord ? ` + ${fillConfig.filesPerRecord} datne` : ''}
            {fillConfig.withMetadata ? ' + metadati' : ''}
          </span>
        </div>

        {showFillConfig && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8,
                        paddingTop: 8, borderTop: '1px solid #ffffff33' }}>
            {[
              ['inventoryCount', 'US', 1, 20],
              ['itemsPerInventory', 'GV / US', 1, 100],
              ['recordsPerItem', 'Dok. / GV', 1, 50],
              ['filesPerRecord', 'Datnes / Dok.', 0, 10],
            ].map(([key, label, min, max]) => (
              <label key={key} style={{ color: '#d1fae5', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                {label}
                <input
                  type="number" min={min} max={max} value={fillConfig[key]}
                  onChange={e => setFillConfig(c => ({
                    ...c, [key]: Math.max(min, Math.min(max, parseInt(e.target.value, 10) || min)),
                  }))}
                  className="test-suite-select" style={{ width: 58, fontSize: 11 }}
                />
              </label>
            ))}
            <label style={{ color: '#d1fae5', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={fillConfig.withMetadata}
                     onChange={e => setFillConfig(c => ({ ...c, withMetadata: e.target.checked }))} />
              Metadati
            </label>
          </div>
        )}
      </div>

      {/* ── Individual creators ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
        <button className="dev-btn" onClick={handleCreateProjects} disabled={isRunning}
                style={{ justifyContent: 'flex-start', padding: '8px 10px' }}>
          <i className="fas fa-folder-plus" style={{ color: '#a78bfa', width: 16 }}></i>
          <span>+ {count} Projekts</span>
        </button>

        <button className="dev-btn" onClick={() => handleCreateInventories()} disabled={isRunning || !fondId}
                style={{ justifyContent: 'flex-start', padding: '8px 10px' }}>
          <i className="fas fa-list" style={{ color: '#3b82f6', width: 16 }}></i>
          <span>+ {count} US (random)</span>
        </button>

        <div style={{ display: 'flex', gap: 4 }}>
          <select className="test-suite-select" style={{ flex: 1, fontSize: 11 }}
                  value={selectedInventoryId}
                  onChange={e => { setSelectedInventoryId(e.target.value); setSelectedItemId(''); setSelectedRecordId(''); }}>
            <option value="">US...</option>
            {inventories.map(inv => (
              <option key={inv.id} value={inv.id}>
                #{inv.number} {inv.type}{inv.electronic ? ' (el.)' : ''} — {inv.items?.length || 0} GV
              </option>
            ))}
          </select>
          <button className="dev-btn" onClick={handleCreateItems} disabled={isRunning || !selectedInventoryId}
                  style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
            <i className="fas fa-folder" style={{ color: '#10b981' }}></i><span>+{count} GV</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <select className="test-suite-select" style={{ flex: 1, fontSize: 11 }}
                  value={selectedItemId}
                  onChange={e => { setSelectedItemId(e.target.value); setSelectedRecordId(''); }}>
            <option value="">GV...</option>
            {items.map(it => (
              <option key={it.id} value={it.id}>GV #{it.number} — {(it.title || '').slice(0, 20)}</option>
            ))}
          </select>
          <button className="dev-btn" onClick={handleCreateRecords} disabled={isRunning || !selectedItemId}
                  style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
            <i className="fas fa-file-alt" style={{ color: '#f59e0b' }}></i><span>+{count} Dok.</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4, gridColumn: '1 / -1' }}>
          <select className="test-suite-select" style={{ flex: 1, fontSize: 11 }}
                  value={selectedRecordId} onChange={e => setSelectedRecordId(e.target.value)}>
            <option value="">Dok....</option>
            {records.map(rec => (
              <option key={rec.id} value={rec.id}>
                Dok. #{rec.id} — {(rec.title || rec.reg_nr || '?').slice(0, 24)}
              </option>
            ))}
          </select>
          <button className="dev-btn" onClick={handleUploadFiles} disabled={isRunning || !selectedRecordId}
                  style={{ padding: '6px 10px' }} title={`Augšupielādēt ${count} datni(-es)`}>
            <i className="fas fa-upload" style={{ color: '#8b5cf6' }}></i><span>+{count}</span>
          </button>
          <select className="test-suite-select" style={{ fontSize: 11, maxWidth: 120 }}
                  value={metadataClass} onChange={e => setMetadataClass(e.target.value)}>
            <option value="all">Visi metadati</option>
            {METADATA_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="dev-btn" onClick={handleAddMetadata} disabled={isRunning || !selectedRecordId}
                  style={{ padding: '6px 10px' }} title="Pievienot metadatus">
            <i className="fas fa-tags" style={{ color: '#ec4899' }}></i>
          </button>
        </div>
      </div>

      {/* ── Quick US by type ── */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>
          Ātri {count} US pēc tipa ({electronic ? 'elektronisks' : 'fizisks'}):
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {INVENTORY_TYPES.map(type => (
            <button key={type} className="dev-btn" onClick={() => handleCreateInventories(type)}
                    disabled={isRunning || !fondId} style={{ padding: '4px 10px', fontSize: 11 }}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ── Log ── */}
      <div style={{ background: '#0d1117', borderRadius: 6, padding: 6, maxHeight: 180,
                    overflow: 'auto', fontFamily: 'monospace', fontSize: 11 }}>
        {logs.length === 0 ? (
          <div style={{ color: '#4b5563', textAlign: 'center', padding: 12 }}>
            Nospiediet pogu, lai izveidotu testa datus...
          </div>
        ) : logs.map((log, i) => (
          <div key={i} style={{
            padding: '1px 0',
            color: log.type === 'error' ? '#fca5a5'
              : log.type === 'success' ? '#6ee7b7'
              : log.type === 'warning' ? '#fcd34d' : '#9ca3af',
          }}>
            <span style={{ color: '#4b556366', marginRight: 4 }}>{log.time}</span>{log.msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickCreate;
