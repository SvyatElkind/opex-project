/**
 * Plan executor.
 *
 * Takes a plan (scenarios.js), an `api` object and a context, and either
 * dry-runs it (validate every payload, send nothing) or creates it entity by
 * entity, tallying what was actually made against what was expected.
 *
 * The `api` is injected so the executor is pure: builders/factoryApi.js binds
 * it to devDataFactory for the live panel, tests pass a fake.
 *
 *   api.createInventory(projectId, fondId, payload)        → { id, number, ... }
 *   api.createItem(projectId, inventoryId, payload)        → { number, id? }
 *   api.resolveItemIds(projectId, inventoryId)             → Map(number → id)
 *   api.createRecord(projectId, itemId, payload)           → { id, date, ... }
 *   api.createMediaRecord(projectId, itemId, mediaType)    → { id, ... }
 *   api.uploadFile(projectId, recordId, inventoryType)
 *   api.addMetadata(projectId, recordId, cls, payload)
 *   api.updateMediaRecord(projectId, recordId, mediaType, payload)
 *   api.setSigners(projectId, institutionId, payload)
 *
 * Item ids: the item POST response has `number` but no `id` (ItemSerializer
 * lists its fields explicitly). After an inventory's items are created the
 * executor asks for the number → id map ONCE and stamps the ids in - one
 * extra GET per inventory instead of one per item.
 */

import { estimatePlan, validatePlan } from './scenarios';
import { METADATA_CLASSES } from './recordBuilder';

const noop = () => {};

export const emptyTally = () => ({
  inventories: 0, items: 0, records: 0, textRecords: 0, mediaRecords: 0,
  files: 0, metadata: 0, mediaUpdates: 0, signers: 0,
  errors: 0, expectedFailures: 0, unexpectedSuccesses: 0,
});

const errorMessage = (e) => {
  const fields = e?.fieldErrors;
  if (fields && typeof fields === 'object') {
    const parts = Object.entries(fields)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`);
    if (parts.length) return parts.join(' | ');
  }
  if (e?.data && typeof e.data === 'object') {
    const parts = Object.entries(e.data)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`);
    if (parts.length) return parts.join(' | ');
  }
  return e?.message || String(e);
};

/**
 * Run a plan.
 *
 * @param {object} plan   from buildScenarioPlan / planFromNodes
 * @param {object} ctx    { projectId, fondId, institutionId, dryRun, skipInvalid }
 * @param {object} api    see module comment
 * @param {object} hooks  { onProgress(message, type), shouldStop() }
 */
export const runPlan = async (plan, ctx = {}, api = {}, hooks = {}) => {
  const onProgress = hooks.onProgress || noop;
  const shouldStop = hooks.shouldStop || (() => false);
  const started = Date.now();

  const result = {
    dryRun: !!ctx.dryRun,
    scenarioId: plan.scenarioId,
    name: plan.name,
    seed: plan.seed,
    expected: plan.expected || estimatePlan(plan),
    validation: validatePlan(plan),
    tally: emptyTally(),
    errors: [],
    created: { inventories: [], items: [], records: [] },
    stopped: false,
    durationMs: 0,
  };

  const fail = (stage, path, e, node) => {
    const entry = { stage, path, message: errorMessage(e), expected: !!node?.expectFailure };
    result.errors.push(entry);
    if (entry.expected) result.tally.expectedFailures++;
    else result.tally.errors++;
    onProgress(`${entry.expected ? 'Gaidīta kļūda' : 'Kļūda'} (${stage} ${path}): ${entry.message}`,
      entry.expected ? 'info' : 'error');
  };

  const succeeded = (node) => {
    if (node?.expectFailure) {
      result.tally.unexpectedSuccesses++;
      onProgress('Negatīvs profils tomēr tika pieņemts - serveris nenoraidīja', 'warning');
    }
  };

  if (result.dryRun) {
    // Nothing is sent: the tally is what a live run would attempt.
    const e = result.expected;
    Object.assign(result.tally, {
      inventories: e.inventories, items: e.items, records: e.records,
      textRecords: e.textRecords, mediaRecords: e.mediaRecords, files: e.files,
      metadata: e.metadata, mediaUpdates: e.mediaUpdates, signers: e.signers,
    });
    result.validation.issues.forEach(issue => {
      result.errors.push({ stage: 'validate', path: issue.path, message: JSON.stringify(issue.errors), expected: false });
      result.tally.errors++;
    });
    result.validation.expectedIssues.forEach(issue => {
      result.errors.push({ stage: 'validate', path: issue.path, message: JSON.stringify(issue.errors), expected: true });
      result.tally.expectedFailures++;
    });
    onProgress(`Sausais mēģinājums: ${result.validation.checked} datu kopas pārbaudītas, `
      + `${result.validation.issues.length} kļūdas, ${result.validation.expectedIssues.length} gaidītas kļūdas`,
      result.validation.issues.length ? 'warning' : 'success');
    result.durationMs = Date.now() - started;
    return result;
  }

  // skipInvalid keeps everything the client validators reject off the wire,
  // negative profiles included - so it also disables "does the server reject
  // this too?" checks. Leave it off to probe the backend.
  const invalidPaths = new Set(
    [...result.validation.issues, ...result.validation.expectedIssues].map(i => i.path),
  );

  if (plan.signers && ctx.institutionId && api.setSigners) {
    try {
      await api.setSigners(ctx.projectId, ctx.institutionId, plan.signers);
      result.tally.signers++;
      onProgress('Parakstītāji iestatīti', 'success');
    } catch (e) {
      fail('signers', 'iestāde', e);
    }
  }

  for (let i = 0; i < plan.inventories.length; i++) {
    if (shouldStop()) { result.stopped = true; break; }
    const invNode = plan.inventories[i];
    const invPath = `US[${i}]`;

    let inventory;
    if (invNode.existing) {
      inventory = invNode.existing;
    } else {
      if (ctx.skipInvalid && invalidPaths.has(invPath)) {
        onProgress(`${invPath} izlaists - neiztur validāciju`, 'warning');
        continue;
      }
      try {
        const res = await api.createInventory(ctx.projectId, ctx.fondId, invNode.payload);
        succeeded(invNode);
        // The POST response can be thin; the payload is what we know is true.
        inventory = { ...invNode.payload, ...res, type: invNode.payload.type };
        result.tally.inventories++;
        result.created.inventories.push({ id: inventory.id, number: inventory.number, type: inventory.type });
        onProgress(`US #${inventory.number ?? '?'} ${inventory.type} izveidots (ID ${inventory.id})`, 'success');
      } catch (e) {
        fail('inventory', invPath, e, invNode);
        continue;
      }
    }

    // Items first, then one id lookup, then everything below them.
    const createdItems = [];
    for (let j = 0; j < invNode.items.length; j++) {
      if (shouldStop()) { result.stopped = true; break; }
      const itemNode = invNode.items[j];
      const itemPath = `${invPath}.GV[${j}]`;

      if (itemNode.existing) {
        createdItems.push({ node: itemNode, path: itemPath, res: { ...itemNode.existing } });
        continue;
      }
      if (ctx.skipInvalid && invalidPaths.has(itemPath)) {
        onProgress(`${itemPath} izlaists - neiztur validāciju`, 'warning');
        continue;
      }
      try {
        const res = await api.createItem(ctx.projectId, inventory.id, itemNode.payload);
        succeeded(itemNode);
        result.tally.items++;
        createdItems.push({ node: itemNode, path: itemPath, res: { ...itemNode.payload, ...res } });
      } catch (e) {
        fail('item', itemPath, e, itemNode);
      }
    }
    if (result.stopped) break;

    const needIds = createdItems.filter(c => c.res.id === undefined || c.res.id === null);
    if (needIds.length && api.resolveItemIds) {
      try {
        const map = await api.resolveItemIds(ctx.projectId, inventory.id);
        needIds.forEach(c => { c.res.id = map.get(c.res.number); });
      } catch (e) {
        fail('item-id', invPath, e);
      }
    }

    for (const created of createdItems) {
      if (shouldStop()) { result.stopped = true; break; }
      const { node: itemNode, path: itemPath, res: item } = created;
      if (!itemNode.existing) {
        result.created.items.push({ id: item.id, number: item.number, inventoryId: inventory.id });
      }
      if (item.id === undefined || item.id === null) {
        fail('item-id', itemPath, new Error(`GV #${item.number ?? '?'} - id nav atrasts projektā`));
        continue;
      }

      for (let k = 0; k < itemNode.records.length; k++) {
        if (shouldStop()) { result.stopped = true; break; }
        const rec = itemNode.records[k];
        const recPath = `${itemPath}.Dok[${k}]`;

        if (rec.kind === 'media') {
          let media;
          try {
            media = await api.createMediaRecord(ctx.projectId, item.id, inventory.type);
            succeeded(rec);
            result.tally.records++;
            result.tally.mediaRecords++;
            result.tally.files++;
            result.created.records.push({ id: media?.id, itemId: item.id, kind: 'media' });
          } catch (e) {
            fail('media-record', recPath, e, rec);
            continue;
          }
          if (rec.mediaUpdate && media?.id && api.updateMediaRecord) {
            try {
              await api.updateMediaRecord(ctx.projectId, media.id, inventory.type, rec.mediaUpdate);
              result.tally.mediaUpdates++;
            } catch (e) {
              fail('media-update', recPath, e);
            }
          }
          continue;
        }

        if (ctx.skipInvalid && invalidPaths.has(recPath)) {
          onProgress(`${recPath} izlaists - neiztur validāciju`, 'warning');
          continue;
        }
        let record;
        try {
          record = await api.createRecord(ctx.projectId, item.id, rec.payload);
          succeeded(rec);
          result.tally.records++;
          result.tally.textRecords++;
          result.created.records.push({ id: record?.id, itemId: item.id, kind: 'text' });
        } catch (e) {
          fail('record', recPath, e, rec);
          continue;
        }
        if (!record?.id) {
          fail('record-id', recPath, new Error('Dokumenta atbildē nav id'));
          continue;
        }

        for (let f = 0; f < rec.files; f++) {
          try {
            await api.uploadFile(ctx.projectId, record.id, inventory.type);
            result.tally.files++;
          } catch (e) {
            fail('file', `${recPath}.datne[${f}]`, e);
          }
        }

        if (rec.metadata) {
          for (const cls of METADATA_CLASSES) {
            for (const payload of rec.metadata[cls] || []) {
              try {
                await api.addMetadata(ctx.projectId, record.id, cls, payload);
                result.tally.metadata++;
              } catch (e) {
                fail('metadata', `${recPath}.${cls}`, e);
              }
            }
          }
        }
      }
      onProgress(`GV #${item.number ?? '?'} pabeigta (${itemNode.records.length} dok.)`, 'info');
    }
  }

  result.durationMs = Date.now() - started;
  return result;
};

/** Expected-vs-actual lines for the counters that matter. */
export const compareTally = (result) => {
  const keys = ['inventories', 'items', 'records', 'files', 'metadata', 'mediaUpdates', 'signers'];
  return keys.map(key => ({
    key,
    expected: result.expected?.[key] ?? 0,
    actual: result.tally?.[key] ?? 0,
    ok: (result.expected?.[key] ?? 0) === (result.tally?.[key] ?? 0),
  }));
};

const LABELS = {
  inventories: 'US', items: 'GV', records: 'Dok.', files: 'Datnes',
  metadata: 'Metadati', mediaUpdates: 'Mediju papildinājumi', signers: 'Parakstītāji',
};

/** Paste-ready text report of a run. */
export const formatRunReport = (result) => {
  const lines = [];
  lines.push(`=== Builder run: ${result.name || result.scenarioId} ===`);
  lines.push(`Seed: ${result.seed ?? '-'} | ${result.dryRun ? 'DRY RUN' : 'LIVE'} | ${result.durationMs} ms`
    + (result.stopped ? ' | APTURĒTS' : ''));
  lines.push('');
  lines.push('Gaidīts / faktiski:');
  compareTally(result).forEach(row => {
    lines.push(`  ${LABELS[row.key].padEnd(22)} ${String(row.expected).padStart(5)} / ${String(row.actual).padStart(5)} ${row.ok ? 'OK' : '!!'}`);
  });
  lines.push('');
  lines.push(`Kļūdas: ${result.tally.errors} | gaidītās kļūdas: ${result.tally.expectedFailures}`
    + ` | negaidīti pieņemts: ${result.tally.unexpectedSuccesses}`);
  result.errors.forEach(e => {
    lines.push(`  [${e.expected ? 'gaidīts' : 'KĻŪDA'}] ${e.stage} ${e.path}: ${e.message}`);
  });
  return lines.join('\n');
};
