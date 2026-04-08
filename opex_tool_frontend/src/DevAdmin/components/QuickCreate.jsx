import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { post, apiRequest, postFormData } from '../../services/apiClient';

/**
 * QuickCreate — One-click test data builder
 *
 * Step-by-step entity creation with random valid data:
 *   US (Inventory) → GV (Item) → Dok. (Record) → Datne (File) → Metadata
 *
 * Also: "Fill Project" creates a full chain in one click.
 */

// ─── Random Data Generators ─────────────────────────────────────────────────

const TYPES = ['Tekstuāls', 'Foto', 'Video', 'Skaņas'];
const STORAGE_TERMS = ['Pastāvīgi glabājamās lietas', 'Ilgstoši glabājamās lietas'];
const LANGUAGES = ['latviešu', 'krievu', 'angļu', 'vācu', 'franču'];
const RESTRICTIONS = ['Vispārēja', 'Ierobežota'];
const SECURITY_LEVELS = ['Publisks', 'Iekšējs', 'Konfidenciāls'];
const UNITS = ['Lapas', 'Dokumenti', 'Glabājamās vienības'];
const TITLES = [
  'Korespondence', 'Rīkojumi', 'Protokoli', 'Līgumi', 'Atskaites',
  'Akti', 'Pārskati', 'Instrukcijas', 'Nolikumi', 'Lēmumi',
  'Pavadvēstules', 'Ziņojumi', 'Pieprasījumi', 'Atbildes', 'Reģistri'
];
const NAMES = ['Jānis Bērziņš', 'Anna Kalniņa', 'Pēteris Ozols', 'Līga Liepa', 'Māris Vītoliņš'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randYear = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n) => String(n).padStart(2, '0');

const generateInventoryData = (number) => {
  const type = pick(TYPES);
  const startYear = randYear(2015, 2022);
  const endYear = startYear + randInt(1, 5);
  return {
    number,
    type,
    electronic: true,
    storage_term: pick(STORAGE_TERMS),
    start_date: `${startYear}-01-01`,
    end_date: `${endYear}-12-31`,
  };
};

const generateItemData = (inventory, itemNumber) => {
  const startYear = parseInt(inventory.start_date, 10) || 2020;
  const endYear = parseInt(inventory.end_date, 10) || startYear + 3;
  // Ensure item dates are within inventory date range
  const itemStart = `${startYear}-01-01`;
  const itemEnd = `${endYear}-12-31`;
  const data = {
    series_code: `${itemNumber}`,
    title: `${pick(TITLES)} ${randYear(startYear, endYear)}`,
    start_date: itemStart,
    end_date: itemEnd,
    date_indicator: 'year',
    language: pick(LANGUAGES),
    restriction: 'Vispārēja',
    security_level: 'Publisks',
  };
  // Annotation required for media types (Foto, Video, Skaņas)
  if (['Foto', 'Video', 'Skaņas'].includes(inventory.type)) {
    data.annotation = `Testēšanas ${inventory.type.toLowerCase()} saturs nr. ${itemNumber}`;
  }
  return data;
};

const generateRecordData = (inventory) => {
  const type = inventory.type;
  if (type === 'Tekstuāls') {
    const recDate = `${randYear(2020, 2025)}-${pad(randInt(1, 12))}-${pad(randInt(1, 28))}`;
    return {
      title: `${pick(TITLES)} — ${pick(NAMES)}`,
      date: recDate,
      created_date: recDate,
      sent_date: recDate,
      reg_nr: `${randInt(1, 999)}-${randInt(1, 99)}/${randYear(2020, 2025)}`,
      nomenclature_nr: `${randInt(1, 50)}-${randInt(1, 20)}`,
      language: pick(LANGUAGES),
      access_restriction: 'open',
    };
  }
  // Media records are created via file upload — return null
  return null;
};

// File extension → MIME type mapping
const MIME_MAP = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.bmp': 'image/bmp',
  '.mp4': 'video/mp4', '.avi': 'video/avi', '.mov': 'video/quicktime', '.mkv': 'video/x-matroska',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.aac': 'audio/aac', '.ogg': 'audio/ogg', '.flac': 'audio/flac', '.m4a': 'audio/m4a',
  '.txt': 'text/plain', '.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.edoc': 'application/octet-stream',
};

const FILE_EXTENSIONS_BY_TYPE = {
  'Foto': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
  'Video': ['.mp4', '.avi', '.mov', '.mkv'],
  'Skaņas': ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a'],
  'Tekstuāls': ['.txt', '.pdf', '.docx', '.edoc'],
};

// Cached manifest
let _manifestCache = null;

const loadManifest = async () => {
  if (_manifestCache) return _manifestCache;
  try {
    const resp = await fetch('/files/manifest.json');
    if (resp.ok) {
      const data = await resp.json();
      _manifestCache = data.files || [];
      return _manifestCache;
    }
  } catch {}
  return [];
};

const getFileExtension = (filename) => {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
};

/**
 * Get a real test file from build/files/ matching the inventory type.
 * Falls back to generating a dummy file if no matching files found.
 */
const getTestFile = async (inventoryType) => {
  const manifest = await loadManifest();
  const validExts = FILE_EXTENSIONS_BY_TYPE[inventoryType] || FILE_EXTENSIONS_BY_TYPE['Tekstuāls'];

  // Find matching files from manifest
  const matching = manifest.filter(f => validExts.includes(getFileExtension(f)));

  if (matching.length > 0) {
    const fileName = pick(matching);
    try {
      const resp = await fetch(`/files/${encodeURIComponent(fileName)}`);
      if (resp.ok) {
        const blob = await resp.blob();
        const ext = getFileExtension(fileName);
        const mime = MIME_MAP[ext] || 'application/octet-stream';
        return new File([blob], fileName, { type: mime });
      }
    } catch {}
  }

  // Fallback: generate dummy file
  return generateDummyFile(inventoryType);
};

const generateDummyFile = (inventoryType) => {
  switch (inventoryType) {
    case 'Foto': {
      const png = new Uint8Array([
        137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
        0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222, 0,
        0, 0, 12, 73, 68, 65, 84, 8, 215, 99, 248, 207, 192, 0, 0, 0,
        3, 0, 1, 24, 216, 95, 168, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
      ]);
      return new File([png], `dummy_${Date.now()}.png`, { type: 'image/png' });
    }
    case 'Video':
      return new File([new Uint8Array(100)], `dummy_${Date.now()}.mp4`, { type: 'video/mp4' });
    case 'Skaņas':
      return new File([new Uint8Array(100)], `dummy_${Date.now()}.mp3`, { type: 'audio/mpeg' });
    default:
      return new File([`Test document ${Date.now()}`], `dummy_${Date.now()}.txt`, { type: 'text/plain' });
  }
};

// ─── Component ──────────────────────────────────────────────────────────────

const QuickCreate = ({ projectData }) => {
  const queryClient = useQueryClient();
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [manifestFiles, setManifestFiles] = useState(null);
  const [showFileList, setShowFileList] = useState(false);

  // Load manifest on mount
  React.useEffect(() => {
    loadManifest().then(files => setManifestFiles(files));
  }, []);

  const projectId = projectData?.id;
  const fondId = projectData?.institution?.fond?.id;
  const inventories = projectData?.institution?.fond?.inventories || [];

  // Get items for selected inventory
  const selectedInventory = inventories.find(inv => inv.id === parseInt(selectedInventoryId));
  const items = selectedInventory?.items || [];
  const selectedItem = items.find(it => it.id === parseInt(selectedItemId));

  // Get records for selected item
  const records = selectedItem?.records || [];

  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }].slice(-50));
  }, []);

  const refreshProject = useCallback(() => {
    queryClient.invalidateQueries(['project', 'detail', projectId]);
  }, [queryClient, projectId]);

  // ─── Individual Creators ────────────────────────────────────────────────

  const createInventory = async (overrideType = null) => {
    if (!projectId || !fondId) { addLog('Nav aktīva projekta vai fonda', 'error'); return null; }

    // Fetch fresh project to get accurate inventory count
    let currentCount = inventories.length;
    try {
      const { data: freshProject } = await apiRequest(`/project/${projectId}/`, { method: 'GET' });
      currentCount = freshProject?.institution?.fond?.inventories?.length || currentCount;
    } catch (_) { /* use stale count as fallback */ }

    const number = currentCount + 1;
    const invData = generateInventoryData(number);
    if (overrideType) invData.type = overrideType;

    addLog(`Izveido US #${number} (${invData.type})...`);
    try {
      const { data } = await post(`/project/${projectId}/inventory/?fond_id=${fondId}`, invData);
      addLog(`US #${number} izveidots (ID: ${data.id})`, 'success');
      refreshProject();
      return data;
    } catch (e) {
      addLog(`Kļūda: ${e.message}`, 'error');
      return null;
    }
  };

  const createItem = async (inventoryId = null, inventory = null) => {
    const invId = inventoryId || selectedInventoryId;
    const inv = inventory || selectedInventory;
    if (!projectId || !invId || !inv) { addLog('Izvēlieties US', 'error'); return null; }

    const itemNumber = (inv.items?.length || 0) + 1;
    const itemData = generateItemData(inv, itemNumber);

    addLog(`Izveido GV #${itemNumber} US "${inv.type}" iekšā...`);
    try {
      const { data } = await post(`/project/${projectId}/item/?inventory_id=${invId}`, itemData);
      addLog(`GV #${itemNumber} izveidots (ID: ${data.id})`, 'success');
      refreshProject();
      return data;
    } catch (e) {
      addLog(`Kļūda: ${e.message}`, 'error');
      return null;
    }
  };

  const createRecord = async (itemId = null, inventory = null) => {
    const itId = itemId || selectedItemId;
    const inv = inventory || selectedInventory;
    if (!projectId || !itId || !inv) { addLog('Izvēlieties GV', 'error'); return null; }

    if (inv.type === 'Tekstuāls') {
      // Textual record
      const recordData = generateRecordData(inv);
      addLog(`Izveido tekstuālu Dok. GV #${itId} iekšā...`);
      try {
        const { data } = await post(`/project/${projectId}/record/?item_id=${itId}`, recordData);
        addLog(`Dok. izveidots (ID: ${data.id})`, 'success');
        refreshProject();
        return data;
      } catch (e) {
        addLog(`Kļūda: ${e.message}`, 'error');
        return null;
      }
    } else {
      // Media record — upload real test file (or dummy fallback)
      const file = await getTestFile(inv.type);
      const formData = new FormData();
      formData.append('files', file);

      addLog(`Augšupielādē ${inv.type} datni (${file.name})...`);
      try {
        const { data } = await apiRequest(
          `/project/${projectId}/media_record/?item_id=${itId}`,
          { method: 'POST', body: formData, headers: {} }
        );
        addLog(`${inv.type} dok. izveidots (ID: ${data?.id || '?'})`, 'success');
        refreshProject();
        return data;
      } catch (e) {
        addLog(`Kļūda: ${e.message}`, 'error');
        return null;
      }
    }
  };

  const uploadFile = async (recordId = null) => {
    const recId = recordId || selectedRecordId;
    const inv = selectedInventory;
    if (!projectId || !recId) { addLog('Izvēlieties Dok.', 'error'); return null; }

    const file = await getTestFile(inv?.type || 'Tekstuāls');
    const formData = new FormData();
    formData.append('files', file);

    addLog(`Augšupielādē datni "${file.name}"...`);
    try {
      const { data } = await postFormData(
        `/project/${projectId}/record/${recId}/multiple_files/`,
        formData
      );
      addLog(`Datne augšupielādēta`, 'success');
      refreshProject();
      return data;
    } catch (e) {
      addLog(`Kļūda: ${e.message}`, 'error');
      return null;
    }
  };

  const createMetadata = async (recordId = null) => {
    const recId = recordId || selectedRecordId;
    if (!projectId || !recId) { addLog('Izvēlieties Dok.', 'error'); return null; }

    const metadataType = pick(['addressee', 'action']);
    const today = new Date().toISOString().split('T')[0];
    const metadataData = metadataType === 'addressee'
      ? { addressee: pick(NAMES) }
      : {
          task: pick(TITLES),
          author: pick(NAMES),
          responsible_person: pick(NAMES),
          due_date: today,
          created_date: today,
        };

    addLog(`Pievieno ${metadataType} metadatus...`);
    try {
      const { data } = await post(
        `/project/${projectId}/record/${recId}/additional_metadata/?class=${metadataType}`,
        metadataData
      );
      addLog(`Metadati pievienoti`, 'success');
      refreshProject();
      return data;
    } catch (e) {
      addLog(`Kļūda: ${e.message}`, 'error');
      return null;
    }
  };

  // ─── Fill Project (Full Chain) ──────────────────────────────────────────

  const fillProject = async () => {
    if (!projectId || !fondId) { addLog('Nav aktīva projekta', 'error'); return; }
    setIsRunning(true);
    addLog('=== Sāk projekta aizpildīšanu ===', 'info');

    try {
      // Create one inventory of each type
      for (const type of ['Tekstuāls', 'Foto']) {
        const inv = await createInventory(type);
        if (!inv) continue;

        // Wait then refetch to get the full inventory data (with correct id)
        await new Promise(r => setTimeout(r, 500));
        const { data: freshProject } = await apiRequest(`/project/${projectId}/`, { method: 'GET' });
        const freshInv = freshProject?.institution?.fond?.inventories?.find(i => i.id === inv.id);
        if (!freshInv) { addLog(`Nevar atrast US ID: ${inv.id}`, 'error'); continue; }

        // Create 3 items per inventory
        const ITEMS_PER_INV = 3;
        for (let i = 0; i < ITEMS_PER_INV; i++) {
          const itemData = generateItemData(freshInv, i + 1);
          addLog(`Izveido GV #${i + 1} US "${freshInv.type}" iekšā...`);
          let createdItem = null;
          try {
            const { data } = await post(`/project/${projectId}/item/?inventory_id=${freshInv.id}`, itemData);
            createdItem = data;
            addLog(`GV #${i + 1} izveidots`, 'success');
          } catch (e) {
            addLog(`Kļūda GV: ${e.message}`, 'error');
            continue;
          }

          await new Promise(r => setTimeout(r, 300));

          // Refetch to get item with its real ID
          const { data: projAfterItem } = await apiRequest(`/project/${projectId}/`, { method: 'GET' });
          const updatedInv = projAfterItem?.institution?.fond?.inventories?.find(inv2 => inv2.id === freshInv.id);
          const items = updatedInv?.items || [];
          // The latest item is the one we just created (highest number)
          const latestItem = items.length > 0 ? items[items.length - 1] : null;
          if (!latestItem) { addLog('Nevar atrast izveidoto GV', 'error'); continue; }

          // Create record for this item
          if (type === 'Tekstuāls') {
            const record = await createRecord(latestItem.id, updatedInv);
            // Refetch again to get record ID
            if (record) {
              await new Promise(r => setTimeout(r, 300));
              const { data: projAfterRec } = await apiRequest(`/project/${projectId}/`, { method: 'GET' });
              const recInv = projAfterRec?.institution?.fond?.inventories?.find(inv2 => inv2.id === freshInv.id);
              const recItem = recInv?.items?.find(it => it.id === latestItem.id);
              const latestRecord = recItem?.records?.length > 0 ? recItem.records[recItem.records.length - 1] : null;
              if (latestRecord?.id) {
                await new Promise(r => setTimeout(r, 200));
                await uploadFile(latestRecord.id);
                await new Promise(r => setTimeout(r, 200));
                await createMetadata(latestRecord.id);
              }
            }
          } else {
            // Media — record creation includes file upload
            await createRecord(latestItem.id, updatedInv);
          }
        }
      }

      addLog('=== Projekts aizpildīts ===', 'success');
      refreshProject();
    } catch (e) {
      addLog(`Aizpildīšana neizdevās: ${e.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  if (!projectData) {
    return (
      <div className="dev-panel-section">
        <div className="dev-empty-state">
          <i className="fas fa-folder-open"></i>
          <p>Atveriet projektu, lai izmantotu Quick Create</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>Quick Create</h3>
        <div className="dev-panel-actions">
          <button
            className="dev-btn"
            onClick={() => {
              _manifestCache = null;
              setManifestFiles(null);
              loadManifest().then(files => {
                setManifestFiles(files);
                addLog(files.length > 0 ? `Manifest ielādēts: ${files.length} datnes` : 'Manifest nav atrasts — dummy mode', files.length > 0 ? 'success' : 'info');
              });
            }}
            style={{ padding: '2px 8px', fontSize: 10 }}
            title="Pārlādēt manifest.json no build/files/"
          >
            <i className="fas fa-sync"></i>
          </button>
          <span style={{
            color: manifestFiles && manifestFiles.length > 0 ? '#10b981' : '#f59e0b',
            fontSize: 11, marginRight: 8, cursor: 'pointer'
          }}
            onClick={() => setShowFileList(prev => !prev)}
            title="Klikšķiniet, lai redzētu datņu sarakstu"
          >
            <i className={`fas ${manifestFiles && manifestFiles.length > 0 ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
              style={{ marginRight: 4 }}></i>
            {manifestFiles === null ? 'Ielādē...' :
             manifestFiles.length > 0 ? `${manifestFiles.length} test datnes` : 'Nav test datņu (dummy)'}
          </span>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>
            {inventories.length} US | {inventories.reduce((s, i) => s + (i.items?.length || 0), 0)} GV
          </span>
        </div>
      </div>

      {/* Manifest File List (collapsible) */}
      {showFileList && (
        <div style={{
          background: '#0d1117', borderRadius: 6, padding: 8, marginBottom: 12,
          maxHeight: 150, overflow: 'auto', fontSize: 11
        }}>
          {manifestFiles && manifestFiles.length > 0 ? (
            <>
              <div style={{ color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>
                Datnes build/files/ ({manifestFiles.length}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
                {manifestFiles.map((f, i) => {
                  const ext = f.slice(f.lastIndexOf('.')).toLowerCase();
                  const color = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext) ? '#3b82f6' :
                                ['.mp4', '.avi', '.mov', '.mkv'].includes(ext) ? '#8b5cf6' :
                                ['.mp3', '.wav', '.aac', '.ogg', '.flac'].includes(ext) ? '#ec4899' : '#9ca3af';
                  return <span key={i} style={{ color, fontFamily: 'monospace' }}>{f}</span>;
                })}
              </div>
            </>
          ) : (
            <div style={{ color: '#fcd34d', padding: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                <i className="fas fa-info-circle" style={{ marginRight: 6 }}></i>
                Nav atrasts manifest.json — izmanto dummy datnes
              </div>
              <div style={{ color: '#9ca3af', fontSize: 11 }}>
                Lai izmantotu īstas test datnes:<br/>
                1. Ievietojiet datnes mapē <code style={{ color: '#60a5fa' }}>build/files/</code><br/>
                2. Terminālī izpildiet: <code style={{ color: '#60a5fa' }}>npm run manifest</code><br/>
                3. Nospiediet <i className="fas fa-sync"></i> pogu augšā, lai pārlādētu
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fill Project — One Click */}
      <div style={{
        padding: 10, marginBottom: 12, borderRadius: 6,
        background: 'linear-gradient(135deg, #059669, #047857)',
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <button
          className="dev-btn"
          onClick={fillProject}
          disabled={isRunning}
          style={{ borderColor: '#fff4', color: '#fff', fontWeight: 600 }}
        >
          <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i>
          <span>{isRunning ? 'Aizpilda...' : 'Fill Project'}</span>
        </button>
        <span style={{ color: '#d1fae5', fontSize: 12 }}>
          Izveido 2 US (Tekstuāls + Foto) x 3 GV x 1 Dok. + datnes + metadati
        </span>
      </div>

      {/* Individual Creators */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>

        {/* Create Inventory */}
        <button className="dev-btn" onClick={() => createInventory()} disabled={isRunning || !fondId}
          style={{ justifyContent: 'flex-start', padding: '8px 10px' }}>
          <i className="fas fa-list" style={{ color: '#3b82f6', width: 16 }}></i>
          <span>+ US (random tips)</span>
        </button>

        {/* Create Item */}
        <div style={{ display: 'flex', gap: 4 }}>
          <select className="test-suite-select" style={{ flex: 1, fontSize: 11 }}
            value={selectedInventoryId}
            onChange={e => { setSelectedInventoryId(e.target.value); setSelectedItemId(''); setSelectedRecordId(''); }}>
            <option value="">US...</option>
            {inventories.map(inv => (
              <option key={inv.id} value={inv.id}>#{inv.number} {inv.type} ({inv.items?.length || 0} GV)</option>
            ))}
          </select>
          <button className="dev-btn" onClick={() => createItem()} disabled={isRunning || !selectedInventoryId}
            style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
            <i className="fas fa-folder" style={{ color: '#10b981' }}></i>
            <span>+ GV</span>
          </button>
        </div>

        {/* Create Record */}
        <div style={{ display: 'flex', gap: 4 }}>
          <select className="test-suite-select" style={{ flex: 1, fontSize: 11 }}
            value={selectedItemId}
            onChange={e => { setSelectedItemId(e.target.value); setSelectedRecordId(''); }}>
            <option value="">GV...</option>
            {items.map(it => (
              <option key={it.id} value={it.id}>GV #{it.number} — {it.title?.slice(0, 20)}</option>
            ))}
          </select>
          <button className="dev-btn" onClick={() => createRecord()} disabled={isRunning || !selectedItemId}
            style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
            <i className="fas fa-file-alt" style={{ color: '#f59e0b' }}></i>
            <span>+ Dok.</span>
          </button>
        </div>

        {/* Upload File / Add Metadata */}
        <div style={{ display: 'flex', gap: 4 }}>
          <select className="test-suite-select" style={{ flex: 1, fontSize: 11 }}
            value={selectedRecordId}
            onChange={e => setSelectedRecordId(e.target.value)}>
            <option value="">Dok...</option>
            {records.map(rec => (
              <option key={rec.id} value={rec.id}>Dok. #{rec.id} — {rec.title?.slice(0, 20) || rec.reg_nr || '?'}</option>
            ))}
          </select>
          <button className="dev-btn" onClick={() => uploadFile()} disabled={isRunning || !selectedRecordId}
            style={{ padding: '6px 8px' }} title="Augšupielādēt datni">
            <i className="fas fa-upload" style={{ color: '#8b5cf6' }}></i>
          </button>
          <button className="dev-btn" onClick={() => createMetadata()} disabled={isRunning || !selectedRecordId}
            style={{ padding: '6px 8px' }} title="Pievienot metadatus">
            <i className="fas fa-tags" style={{ color: '#ec4899' }}></i>
          </button>
        </div>
      </div>

      {/* Quick Type Buttons */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>Quick US by type:</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {TYPES.map(type => (
            <button key={type} className="dev-btn" onClick={() => createInventory(type)}
              disabled={isRunning || !fondId}
              style={{ padding: '4px 10px', fontSize: 11 }}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Log */}
      <div style={{
        background: '#0d1117', borderRadius: 6, padding: 6,
        maxHeight: 180, overflow: 'auto', fontFamily: 'monospace', fontSize: 11
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#4b5563', textAlign: 'center', padding: 12 }}>
            Nospiediet pogu, lai izveidotu testa datus...
          </div>
        ) : logs.map((log, i) => (
          <div key={i} style={{
            padding: '1px 0',
            color: log.type === 'error' ? '#fca5a5' :
                   log.type === 'success' ? '#6ee7b7' : '#9ca3af'
          }}>
            <span style={{ color: '#4b556366', marginRight: 4 }}>{log.time}</span>
            {log.msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickCreate;
