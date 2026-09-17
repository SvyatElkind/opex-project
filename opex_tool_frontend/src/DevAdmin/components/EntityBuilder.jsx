import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import CopyButton from './CopyButton';
import {
  createRng, randomSeed,
  INVENTORY_PRESETS, INVENTORY_DISTRIBUTIONS, STORAGE_TERMS, inventoryPlan,
  describeInventory, validateInventoryPayload, isMediaType,
  ITEM_PRESETS, describeItem, validateItemPayload,
  RECORD_PRESETS, DEFAULT_METADATA_COUNTS, describeRecord, validateTextRecordPayload,
  buildMediaRecordUpdate, metadataTotal,
  SCENARIOS, buildScenarioPlan, planFromNodes,
  composeIntoExistingInventory, composeIntoExistingItem,
  runPlan, formatRunReport, compareTally,
} from '../builders';
import { createFactoryApi } from '../builders/factoryApi';
import { fetchProject, inventoriesOf, MEDIA_RECORD_KEYS, updateMediaRecord, describeApiError } from '../devDataFactory';

/**
 * EntityBuilder - reproducible, preset-driven test data.
 *
 * Where QuickCreate is "N random things, now", this tab is for shaped data:
 * a seed makes every run repeatable, presets name the data profile (a
 * restricted item, a closed record, an inventory the backend must reject),
 * scenarios bundle whole datasets, and every run can be dry-run first - the
 * payloads are validated with the real form validators and nothing is sent.
 *
 * All generation lives in ../builders (pure, unit-tested); this file is UI.
 */

const COUNT_PRESETS = [1, 3, 5, 10, 25];

const panel = {
  background: '#0d1117', borderRadius: 6, padding: '8px 10px', marginBottom: 10,
};
const label = { color: '#6b7280', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' };
const row = { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' };
const select = { fontSize: 11, maxWidth: 220 };
const heading = (color) => ({ color, fontSize: 12, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 });
const smallBtn = { padding: '3px 9px', fontSize: 11 };
const logColor = (type) => (type === 'error' ? '#fca5a5' : type === 'success' ? '#6ee7b7' : type === 'warning' ? '#fcd34d' : '#9ca3af');

const PresetSelect = ({ presets, value, onChange, allowMix }) => (
  <select className="test-suite-select" style={select} value={value} onChange={e => onChange(e.target.value)}>
    {allowMix && <option value="mix">Jaukts (noklusētais sajaukums)</option>}
    {Object.entries(presets).map(([id, p]) => (
      <option key={id} value={id}>{p.negative ? '⚠ ' : ''}{p.label}</option>
    ))}
  </select>
);

const NumberField = ({ value, onChange, min = 0, max = 500, width = 56 }) => (
  <input
    type="number" min={min} max={max} value={value}
    onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value, 10) || min)))}
    className="test-suite-select" style={{ width, fontSize: 11 }}
  />
);

const EntityBuilder = ({ projectData }) => {
  const queryClient = useQueryClient();
  const api = useMemo(() => createFactoryApi(), []);

  const [seed, setSeed] = useState(() => randomSeed());
  const [runIndex, setRunIndex] = useState(0);
  const [dryRun, setDryRun] = useState(false);
  const [skipInvalid, setSkipInvalid] = useState(false);
  const [count, setCount] = useState(3);

  const [invPreset, setInvPreset] = useState('random');
  const [invDistribution, setInvDistribution] = useState('even');
  const [invElectronic, setInvElectronic] = useState(true);
  const [invStorage, setInvStorage] = useState('');

  const [selInvId, setSelInvId] = useState('');
  const [itemPreset, setItemPreset] = useState('mix');
  const [itemIndicator, setItemIndicator] = useState('');

  const [selItemId, setSelItemId] = useState('');
  const [recPreset, setRecPreset] = useState('mix');
  const [filesPerRecord, setFilesPerRecord] = useState(1);
  const [metaCounts, setMetaCounts] = useState({ ...DEFAULT_METADATA_COUNTS });
  const [withMetadata, setWithMetadata] = useState(true);
  const [enrichMedia, setEnrichMedia] = useState(true);

  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);

  const [preview, setPreview] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const stopRef = useRef(false);

  const projectId = projectData?.id;
  const fondId = projectData?.institution?.fond?.id;
  const institutionId = projectData?.institution?.id;
  const inventories = projectData?.institution?.fond?.inventories || [];
  const selectedInventory = inventories.find(inv => inv.id === parseInt(selInvId, 10)) || null;
  const items = selectedInventory?.items || [];
  const selectedItem = items.find(it => it.id === parseInt(selItemId, 10)) || null;

  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }].slice(-300));
  }, []);

  const refreshProject = useCallback(() => {
    if (projectId) queryClient.invalidateQueries({ queryKey: ['project', 'detail', projectId] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  }, [queryClient, projectId]);

  // Every action gets its own reproducible rng: "<seed>#<run>". The pair is
  // logged so any dataset can be rebuilt from the log line alone.
  const nextRng = () => {
    const effective = `${seed}#${runIndex + 1}`;
    setRunIndex(i => i + 1);
    return { rng: createRng(effective), effective };
  };

  const scenarioEstimate = useMemo(() => {
    try {
      return buildScenarioPlan(scenarioId, createRng(`${seed}#preview`)).expected;
    } catch {
      return null;
    }
  }, [scenarioId, seed]);

  // ─── Plan preview ───────────────────────────────────────────────────────

  const showPreview = (title, entries, plan) => {
    setPreview({ title, entries, json: JSON.stringify(plan, null, 2) });
  };

  const inventoryNodes = (rng) => {
    const payloads = inventoryPlan(count, {
      preset: invPreset,
      distribution: invDistribution,
      electronic: invPreset === 'physical' ? false : invElectronic,
      storageTerm: invStorage || undefined,
    }, rng);
    return payloads.map(payload => ({
      payload, items: [], expectFailure: !!INVENTORY_PRESETS[invPreset]?.negative,
    }));
  };

  const previewInventories = () => {
    const { rng, effective } = nextRng();
    const nodes = inventoryNodes(rng);
    showPreview(`${nodes.length} US (seed ${effective})`, nodes.map(n => {
      const v = validateInventoryPayload(n.payload);
      return { text: describeInventory(n.payload), valid: v.isValid, errors: v.errors, expectFailure: n.expectFailure };
    }), planFromNodes(nodes, { seed: effective }));
  };

  const itemNodes = (rng) => {
    if (!selectedInventory) return null;
    return composeIntoExistingInventory(selectedInventory, {
      count,
      preset: itemPreset === 'mix' ? undefined : itemPreset,
      dateIndicator: itemIndicator || undefined,
      startSequence: (selectedInventory.items?.length || 0) + 1,
    }, { count: 0 }, rng);
  };

  const previewItems = () => {
    const { rng, effective } = nextRng();
    const node = itemNodes(rng);
    if (!node) { addLog('Izvēlieties US', 'error'); return; }
    // itemPlan is what composeIntoExistingInventory used; re-validate here for display.
    showPreview(`${node.items.length} GV -> US #${selectedInventory.number} (seed ${effective})`, node.items.map(it => {
      const v = validateItemPayload(it.payload, selectedInventory);
      return { text: describeItem(it.payload), valid: v.isValid, errors: v.errors, expectFailure: it.expectFailure };
    }), planFromNodes([node], { seed: effective }));
  };

  const recordNodes = (rng) => {
    if (!selectedInventory || !selectedItem) return null;
    const media = isMediaType(selectedInventory.type);
    return composeIntoExistingItem(selectedInventory, selectedItem, {
      count: media ? 1 : count,
      preset: recPreset === 'mix' ? undefined : recPreset,
      files: filesPerRecord,
      metadataCounts: withMetadata ? metaCounts : null,
      enrich: enrichMedia,
    }, rng);
  };

  const previewRecords = () => {
    const { rng, effective } = nextRng();
    const node = recordNodes(rng);
    if (!node) { addLog('Izvēlieties GV', 'error'); return; }
    const records = node.items[0].records;
    showPreview(`${records.length} Dok. -> GV #${selectedItem.number} (seed ${effective})`, records.map(r => {
      if (r.kind === 'media') {
        return { text: `Mediju ieraksts (datne) ${r.mediaUpdate ? '+ ' + JSON.stringify(r.mediaUpdate) : ''}`, valid: true, errors: {} };
      }
      const v = validateTextRecordPayload(r.payload, selectedItem);
      return {
        text: `${describeRecord(r.payload)} | ${r.files} datnes | ${metadataTotal(r.metadata)} metadati`,
        valid: v.isValid, errors: v.errors, expectFailure: r.expectFailure,
      };
    }), planFromNodes([node], { seed: effective }));
  };

  // ─── Execution ──────────────────────────────────────────────────────────

  const execute = async (title, plan, effective) => {
    if (isRunning) return;
    setIsRunning(true);
    stopRef.current = false;
    addLog(`=== ${title} | seed ${effective} | ${dryRun ? 'sausais mēģinājums' : 'dzīvā izpilde'} ===`);
    try {
      const result = await runPlan(
        plan,
        { projectId, fondId, institutionId, dryRun, skipInvalid },
        api,
        { onProgress: addLog, shouldStop: () => stopRef.current },
      );
      setLastResult(result);
      const t = result.tally;
      addLog(
        `${result.dryRun ? 'Pārbaudīts' : 'Izveidots'}: ${t.inventories} US, ${t.items} GV, ${t.records} Dok., `
        + `${t.files} datnes, ${t.metadata} metadati` + (t.mediaUpdates ? `, ${t.mediaUpdates} mediju papild.` : '')
        + ` | kļūdas ${t.errors}` + (t.expectedFailures ? `, gaidītās ${t.expectedFailures}` : '')
        + (t.unexpectedSuccesses ? `, NEGAIDĪTI pieņemts ${t.unexpectedSuccesses}` : '')
        + (result.stopped ? ' | apturēts' : ''),
        t.errors || t.unexpectedSuccesses ? 'warning' : 'success',
      );
    } catch (e) {
      addLog(`Neizdevās: ${e.message}`, 'error');
    } finally {
      if (!dryRun) refreshProject();
      setIsRunning(false);
    }
  };

  const createInventories = () => {
    if (!fondId) { addLog('Nav fonda - augšupielādējiet VVAIS atskaiti', 'error'); return; }
    const { rng, effective } = nextRng();
    execute(`${count} US (${INVENTORY_PRESETS[invPreset].label})`, planFromNodes(inventoryNodes(rng), { seed: effective }), effective);
  };

  const createItems = () => {
    const { rng, effective } = nextRng();
    const node = itemNodes(rng);
    if (!node) { addLog('Izvēlieties US', 'error'); return; }
    if (!selectedInventory.start_date || !selectedInventory.end_date) {
      addLog(`US #${selectedInventory.number} nav perioda - serveris GV noraidīs`, 'warning');
    }
    execute(`${node.items.length} GV -> US #${selectedInventory.number}`, planFromNodes([node], { seed: effective }), effective);
  };

  const createRecords = () => {
    const { rng, effective } = nextRng();
    const node = recordNodes(rng);
    if (!node) { addLog('Izvēlieties GV', 'error'); return; }
    execute(`${node.items[0].records.length} Dok. -> GV #${selectedItem.number}`, planFromNodes([node], { seed: effective }), effective);
  };

  const dryRunScenario = async () => {
    const { rng, effective } = nextRng();
    const plan = buildScenarioPlan(scenarioId, rng);
    if (isRunning) return;
    setIsRunning(true);
    addLog(`=== Scenārijs "${plan.name}" - sausais mēģinājums | seed ${effective} ===`);
    try {
      const result = await runPlan(plan, { dryRun: true }, api, { onProgress: addLog });
      setLastResult(result);
    } finally {
      setIsRunning(false);
    }
  };

  const runScenario = async () => {
    if (!fondId) { addLog('Nav fonda - augšupielādējiet VVAIS atskaiti', 'error'); return; }
    const { rng, effective } = nextRng();
    let startNumber = inventories.length + 1;
    try {
      const fresh = await fetchProject(projectId);
      startNumber = (inventoriesOf(fresh).length || 0) + 1;
    } catch { /* cached count is fine */ }
    const plan = buildScenarioPlan(scenarioId, rng, { startNumber });
    execute(`Scenārijs "${plan.name}"`, plan, effective);
  };

  /**
   * Enrich existing media records that the file probe left without technical
   * fields (colour, resolution, duration). Walks the selected inventory.
   */
  const enrichExistingMedia = async () => {
    if (!selectedInventory || !isMediaType(selectedInventory.type)) { addLog('Izvēlieties mediju US', 'error'); return; }
    if (isRunning) return;
    setIsRunning(true);
    stopRef.current = false;
    const { rng, effective } = nextRng();
    const key = MEDIA_RECORD_KEYS[selectedInventory.type];
    addLog(`=== Papildina mediju ierakstus US #${selectedInventory.number} | seed ${effective} ===`);
    let done = 0;
    let skipped = 0;
    let failed = 0;
    try {
      for (const item of selectedInventory.items || []) {
        for (const rec of item[key] || []) {
          if (stopRef.current) break;
          const missing = !rec.color && !rec.duration && !rec.horizontal_resolution;
          if (!missing) { skipped++; continue; }
          const payload = buildMediaRecordUpdate(selectedInventory.type, {}, rng);
          if (dryRun) { addLog(`[sauss] Dok. #${rec.id}: ${JSON.stringify(payload)}`, 'info'); done++; continue; }
          try {
            await updateMediaRecord(projectId, rec.id, selectedInventory.type, payload);
            done++;
          } catch (e) {
            failed++;
            addLog(`Dok. #${rec.id}: ${describeApiError(e)}`, 'error');
          }
        }
      }
      addLog(`Mediju papildinājumi: ${done} atjaunināti, ${skipped} jau aizpildīti, ${failed} kļūdas`, failed ? 'warning' : 'success');
    } finally {
      if (!dryRun) refreshProject();
      setIsRunning(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  const hasProject = !!projectData;

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>Entity Builder</h3>
        <div className="dev-panel-actions">
          <span style={{ color: '#9ca3af', fontSize: 12 }}>
            {hasProject ? `${inventories.length} US` : 'nav projekta'}
          </span>
        </div>
      </div>

      {/* Seed + global switches */}
      <div style={{ ...panel, ...row }}>
        <span style={label}>Seed:</span>
        <input
          type="text" value={seed} onChange={e => { setSeed(e.target.value); setRunIndex(0); }}
          className="test-suite-select" style={{ width: 110, fontSize: 11, fontFamily: 'monospace' }}
          title="Tas pats seed vienmēr dod tos pašus datus. Katra darbība saņem seed#N - skat. žurnālu."
        />
        <button className="dev-btn" style={smallBtn} onClick={() => { setSeed(randomSeed()); setRunIndex(0); }} title="Jauns seed">
          <i className="fas fa-dice"></i>
        </button>
        <span style={{ width: 1, height: 18, background: '#374151' }} />
        <span style={label}>Skaits:</span>
        {COUNT_PRESETS.map(n => (
          <button key={n} className="dev-btn" onClick={() => setCount(n)}
                  style={{ padding: '2px 8px', fontSize: 11, borderColor: count === n ? '#3b82f6' : undefined, color: count === n ? '#60a5fa' : undefined }}>
            {n}
          </button>
        ))}
        <NumberField value={count} onChange={setCount} min={1} max={500} />
        <span style={{ width: 1, height: 18, background: '#374151' }} />
        <label style={{ color: '#fcd34d', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
               title="Pārbauda datus ar formu validatoriem, neko nesūta">
          <input type="checkbox" checked={dryRun} onChange={e => setDryRun(e.target.checked)} />
          Sausais mēģinājums
        </label>
        <label style={{ color: '#9ca3af', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
               title="Nesūtīt datus, kas neiztur klienta validāciju (negatīvie profili tad netiek pārbaudīti pret serveri)">
          <input type="checkbox" checked={skipInvalid} onChange={e => setSkipInvalid(e.target.checked)} />
          Izlaist nederīgos
        </label>
        {isRunning && (
          <button className="dev-btn" onClick={() => { stopRef.current = true; addLog('Apturēšana...', 'warning'); }}
                  style={{ ...smallBtn, borderColor: '#ef4444', color: '#fca5a5' }}>
            <i className="fas fa-stop"></i><span>Apturēt</span>
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Inventories */}
        <div style={panel}>
          <div style={heading('#60a5fa')}><i className="fas fa-list"></i> Uzskaites saraksti</div>
          <div style={{ ...row, marginBottom: 6 }}>
            <PresetSelect presets={INVENTORY_PRESETS} value={invPreset} onChange={setInvPreset} />
            <select className="test-suite-select" style={select} value={invDistribution} onChange={e => setInvDistribution(e.target.value)}>
              {Object.entries(INVENTORY_DISTRIBUTIONS).map(([id, d]) => <option key={id} value={id}>{d.label}</option>)}
            </select>
          </div>
          <div style={{ ...row, marginBottom: 6 }}>
            <label style={{ color: '#9ca3af', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={invElectronic} disabled={invPreset === 'physical'}
                     onChange={e => setInvElectronic(e.target.checked)} />
              Elektronisks
            </label>
            <select className="test-suite-select" style={select} value={invStorage} onChange={e => setInvStorage(e.target.value)}>
              <option value="">Termiņš: nejaušs</option>
              {STORAGE_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ color: '#6b7280', fontSize: 10, marginBottom: 6 }}>{INVENTORY_PRESETS[invPreset].description}</div>
          <div style={row}>
            <button className="dev-btn" style={smallBtn} onClick={previewInventories} disabled={isRunning}>
              <i className="fas fa-eye"></i><span>Priekšskatīt</span>
            </button>
            <button className="dev-btn" style={smallBtn} onClick={createInventories} disabled={isRunning || !fondId}>
              <i className="fas fa-plus"></i><span>Izveidot {count} US</span>
            </button>
          </div>
        </div>

        {/* Items */}
        <div style={panel}>
          <div style={heading('#34d399')}><i className="fas fa-folder"></i> Glabājamās vienības</div>
          <div style={{ ...row, marginBottom: 6 }}>
            <select className="test-suite-select" style={{ ...select, flex: 1 }} value={selInvId}
                    onChange={e => { setSelInvId(e.target.value); setSelItemId(''); }}>
              <option value="">US...</option>
              {inventories.map(inv => (
                <option key={inv.id} value={inv.id}>
                  #{inv.number} {inv.type}{inv.electronic ? '' : ' (fiz.)'} - {inv.items?.length || 0} GV
                  {!inv.start_date ? ' - bez perioda' : ''}
                </option>
              ))}
            </select>
          </div>
          <div style={{ ...row, marginBottom: 6 }}>
            <PresetSelect presets={ITEM_PRESETS} value={itemPreset} onChange={setItemPreset} allowMix />
            <select className="test-suite-select" style={select} value={itemIndicator} onChange={e => setItemIndicator(e.target.value)}>
              <option value="">Datumi: pēc profila</option>
              <option value="year">year</option>
              <option value="month">month</option>
              <option value="day">day</option>
            </select>
          </div>
          <div style={{ color: '#6b7280', fontSize: 10, marginBottom: 6 }}>
            {itemPreset === 'mix' ? 'Minimāls 5 : pilns 3 : ierobežots 1 : klasificēts 1' : ITEM_PRESETS[itemPreset].description}
          </div>
          <div style={row}>
            <button className="dev-btn" style={smallBtn} onClick={previewItems} disabled={isRunning || !selectedInventory}>
              <i className="fas fa-eye"></i><span>Priekšskatīt</span>
            </button>
            <button className="dev-btn" style={smallBtn} onClick={createItems} disabled={isRunning || !selectedInventory}>
              <i className="fas fa-plus"></i><span>Izveidot {count} GV</span>
            </button>
          </div>
        </div>

        {/* Records */}
        <div style={panel}>
          <div style={heading('#fbbf24')}><i className="fas fa-file-alt"></i> Dokumenti</div>
          <div style={{ ...row, marginBottom: 6 }}>
            <select className="test-suite-select" style={{ ...select, flex: 1 }} value={selItemId} onChange={e => setSelItemId(e.target.value)}>
              <option value="">GV...</option>
              {items.map(it => (
                <option key={it.id} value={it.id}>GV #{it.number} - {(it.title || '').slice(0, 24)}</option>
              ))}
            </select>
          </div>
          {selectedInventory && isMediaType(selectedInventory.type) ? (
            <div style={{ ...row, marginBottom: 6 }}>
              <span style={{ color: '#9ca3af', fontSize: 11 }}>Mediju US: viena datne = viens ieraksts.</span>
              <label style={{ color: '#9ca3af', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <input type="checkbox" checked={enrichMedia} onChange={e => setEnrichMedia(e.target.checked)} />
                Papildināt (krāsa / izšķirtspēja / ilgums)
              </label>
            </div>
          ) : (
            <>
              <div style={{ ...row, marginBottom: 6 }}>
                <PresetSelect presets={RECORD_PRESETS} value={recPreset} onChange={setRecPreset} allowMix />
                <span style={label}>Datnes:</span>
                <NumberField value={filesPerRecord} onChange={setFilesPerRecord} max={10} />
              </div>
              <div style={{ ...row, marginBottom: 6 }}>
                <label style={{ color: '#9ca3af', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" checked={withMetadata} onChange={e => setWithMetadata(e.target.checked)} />
                  Metadati
                </label>
                {withMetadata && ['visa', 'addressee', 'action', 'read_status'].map(cls => (
                  <label key={cls} style={{ color: '#9ca3af', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                    {cls}
                    <NumberField value={metaCounts[cls]} onChange={v => setMetaCounts(c => ({ ...c, [cls]: v }))} max={10} width={44} />
                  </label>
                ))}
              </div>
            </>
          )}
          <div style={row}>
            <button className="dev-btn" style={smallBtn} onClick={previewRecords} disabled={isRunning || !selectedItem}>
              <i className="fas fa-eye"></i><span>Priekšskatīt</span>
            </button>
            <button className="dev-btn" style={smallBtn} onClick={createRecords} disabled={isRunning || !selectedItem}>
              <i className="fas fa-plus"></i>
              <span>Izveidot {selectedInventory && isMediaType(selectedInventory.type) ? 1 : count} Dok.</span>
            </button>
            {selectedInventory && isMediaType(selectedInventory.type) && (
              <button className="dev-btn" style={smallBtn} onClick={enrichExistingMedia} disabled={isRunning}
                      title="Aizpilda krāsu / izšķirtspēju / ilgumu esošajiem mediju ierakstiem, kuriem tie tukši">
                <i className="fas fa-wand-magic-sparkles"></i><span>Papildināt esošos</span>
              </button>
            )}
          </div>
        </div>

        {/* Scenarios */}
        <div style={{ ...panel, background: 'linear-gradient(135deg, #1e3a5f, #172554)' }}>
          <div style={heading('#c7d2fe')}><i className="fas fa-project-diagram"></i> Scenāriji</div>
          <div style={{ ...row, marginBottom: 6 }}>
            <select className="test-suite-select" style={{ ...select, flex: 1, maxWidth: 'none' }} value={scenarioId} onChange={e => setScenarioId(e.target.value)}>
              {SCENARIOS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ color: '#c7d2fe', fontSize: 10, marginBottom: 6, lineHeight: 1.4 }}>
            {SCENARIOS.find(s => s.id === scenarioId)?.description}
          </div>
          {scenarioEstimate && (
            <div style={{ color: '#e0e7ff', fontSize: 11, marginBottom: 6 }}>
              {scenarioEstimate.inventories} US, {scenarioEstimate.items} GV, {scenarioEstimate.records} Dok.,{' '}
              {scenarioEstimate.files} datnes, {scenarioEstimate.metadata} metadati
              {scenarioEstimate.mediaUpdates ? `, ${scenarioEstimate.mediaUpdates} mediju papild.` : ''}
              {' '}| ~{scenarioEstimate.requests} pieprasījumi
            </div>
          )}
          <div style={row}>
            <button className="dev-btn" style={{ ...smallBtn, borderColor: '#fff4', color: '#fff' }} onClick={dryRunScenario} disabled={isRunning}>
              <i className="fas fa-vial"></i><span>Sausais mēģinājums</span>
            </button>
            <button className="dev-btn" style={{ ...smallBtn, borderColor: '#fff4', color: '#fff', fontWeight: 600 }} onClick={runScenario} disabled={isRunning || !fondId}>
              <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-play'}`}></i><span>Izpildīt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div style={{ ...panel, marginTop: 10 }}>
          <div style={{ ...row, justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#e5e7eb', fontSize: 12, fontWeight: 600 }}>Priekšskatījums: {preview.title}</span>
            <div style={row}>
              <CopyButton getText={() => preview.json} label="Copy JSON" />
              <button className="dev-btn" style={smallBtn} onClick={() => setPreview(null)}><i className="fas fa-times"></i></button>
            </div>
          </div>
          <div style={{ maxHeight: 160, overflow: 'auto', fontFamily: 'monospace', fontSize: 11 }}>
            {preview.entries.map((e, i) => (
              <div key={i} style={{ color: e.valid ? '#9ca3af' : e.expectFailure ? '#fcd34d' : '#fca5a5', padding: '1px 0' }}>
                <span style={{ marginRight: 6 }}>{e.valid ? '✓' : e.expectFailure ? '⚠' : '✗'}</span>
                {e.text}
                {!e.valid && <span style={{ color: '#6b7280' }}> - {Object.entries(e.errors).map(([k, v]) => `${k}: ${v}`).join('; ')}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last run */}
      {lastResult && (
        <div style={{ ...panel, marginTop: 10 }}>
          <div style={{ ...row, justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#e5e7eb', fontSize: 12, fontWeight: 600 }}>
              Rezultāts: {lastResult.name} {lastResult.dryRun ? '(sauss)' : ''} - seed {String(lastResult.seed)}
            </span>
            <CopyButton getText={() => formatRunReport(lastResult)} label="Copy Report" />
          </div>
          <table style={{ fontSize: 11, color: '#9ca3af', borderCollapse: 'collapse' }}>
            <tbody>
              {compareTally(lastResult).filter(r => r.expected || r.actual).map(r => (
                <tr key={r.key}>
                  <td style={{ paddingRight: 12 }}>{r.key}</td>
                  <td style={{ paddingRight: 12, textAlign: 'right' }}>{r.expected}</td>
                  <td style={{ paddingRight: 12, textAlign: 'right', color: r.ok ? '#6ee7b7' : '#fca5a5' }}>{r.actual}</td>
                  <td>{r.ok ? 'OK' : '!!'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {lastResult.errors.length > 0 && (
            <div style={{ marginTop: 6, maxHeight: 120, overflow: 'auto', fontFamily: 'monospace', fontSize: 10 }}>
              {lastResult.errors.map((e, i) => (
                <div key={i} style={{ color: e.expected ? '#fcd34d' : '#fca5a5' }}>
                  [{e.expected ? 'gaidīts' : 'kļūda'}] {e.stage} {e.path}: {e.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Log */}
      <div style={{ ...panel, marginTop: 10, maxHeight: 180, overflow: 'auto', fontFamily: 'monospace', fontSize: 11 }}>
        {logs.length === 0 ? (
          <div style={{ color: '#4b5563', textAlign: 'center', padding: 12 }}>
            Izvēlieties profilu un nospiediet "Priekšskatīt" vai "Izveidot"...
          </div>
        ) : logs.map((l, i) => (
          <div key={i} style={{ color: logColor(l.type), padding: '1px 0' }}>
            <span style={{ color: '#4b556366', marginRight: 4 }}>{l.time}</span>{l.msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntityBuilder;
