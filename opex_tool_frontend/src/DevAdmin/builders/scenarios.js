/**
 * Named dataset scenarios.
 *
 * A scenario turns a seed into a *plan*: a tree of inventory → item → record
 * nodes with ready-to-send payloads and an `expected` tally. The executor
 * (executor.js) then either dry-runs it (validates every payload, sends
 * nothing) or creates it against the live backend and reports created vs
 * expected.
 *
 * Plan shape:
 *   {
 *     scenarioId, seed, signers | null, expected,
 *     inventories: [{
 *       payload,                    // POST body, or null when `existing` is set
 *       existing: { id, type, start_date, end_date } | undefined,
 *       items: [{
 *         payload, existing: { id } | undefined, expectFailure?,
 *         records: [{
 *           kind: 'text' | 'media',
 *           payload | null,         // text only
 *           files: n,               // extra uploads (text only)
 *           metadata: { visa: [], addressee: [], action: [], read_status: [] } | null,
 *           mediaUpdate: {...} | null,
 *           expectFailure?,
 *         }]
 *       }]
 *     }]
 *   }
 */

import { createRng } from './rng';
import {
  buildInventory, isMediaType, validateInventoryPayload, INVENTORY_PRESETS,
} from './inventoryBuilder';
import { itemPlan, validateItemPayload, ITEM_PRESETS } from './itemBuilder';
import {
  recordPlan, buildMetadataSet, buildMediaRecordUpdate, metadataTotal,
  validateTextRecordPayload, DEFAULT_METADATA_COUNTS, RECORD_PRESETS,
} from './recordBuilder';

const isNegative = (presets, preset) => !!(preset && presets[preset]?.negative);

// ─── Node factories ─────────────────────────────────────────────────────────

export const textRecordNode = (payload, opts = {}, rng = createRng()) => ({
  kind: 'text',
  payload,
  files: Math.max(0, (opts.files ?? 1) | 0),
  metadata: opts.metadataCounts === null
    ? null
    : buildMetadataSet(payload, opts.metadataCounts || DEFAULT_METADATA_COUNTS, rng),
  mediaUpdate: null,
  expectFailure: !!opts.expectFailure || isNegative(RECORD_PRESETS, opts.preset),
});

export const mediaRecordNode = (mediaType, opts = {}, rng = createRng()) => ({
  kind: 'media',
  payload: null,
  files: 0,
  metadata: null,
  mediaUpdate: opts.enrich ? buildMediaRecordUpdate(mediaType, {}, rng) : null,
  expectFailure: !!opts.expectFailure,
});

/**
 * Records for one item, following the category rules:
 *   textual + electronic  → `recordSpec.count` JSON records
 *   media + electronic    → exactly one file-backed record
 *   physical (either)     → none; the backend refuses them
 */
export const recordsForItem = (inventory, itemPayload, recordSpec = {}, rng = createRng()) => {
  if (inventory.electronic === false) return [];
  if (isMediaType(inventory.type)) {
    return recordSpec.count === 0 ? [] : [mediaRecordNode(inventory.type, recordSpec, rng)];
  }
  const count = recordSpec.count ?? 1;
  return recordPlan(itemPayload, count, { preset: recordSpec.preset, mix: recordSpec.mix }, rng)
    .map(payload => textRecordNode(payload, { ...recordSpec, preset: recordSpec.preset }, rng));
};

/**
 * One inventory node with its items and records.
 *
 * @param {object} invOpts     buildInventory options (preset, type, electronic...)
 * @param {object} itemSpec    { count, preset | mix }
 * @param {object} recordSpec  { count, preset | mix, files, metadataCounts | null, enrich }
 */
export const composeInventory = (invOpts = {}, itemSpec = {}, recordSpec = {}, rng = createRng()) => {
  const payload = buildInventory(invOpts, rng);
  // A negative parent can never be created, so nothing below it can either:
  // children inherit expectFailure rather than being reported as errors.
  const inventoryNegative = isNegative(INVENTORY_PRESETS, invOpts.preset);
  const itemNegative = inventoryNegative || isNegative(ITEM_PRESETS, itemSpec.preset);
  const items = itemPlan(payload, itemSpec.count ?? 0, { preset: itemSpec.preset, mix: itemSpec.mix }, rng)
    .map(itemPayload => ({
      payload: itemPayload,
      expectFailure: itemNegative,
      records: recordsForItem(payload, itemPayload, { ...recordSpec, expectFailure: recordSpec.expectFailure || itemNegative }, rng),
    }));
  return { payload, expectFailure: inventoryNegative, items };
};

/** Item nodes that go into an inventory that already exists on the server. */
export const composeIntoExistingInventory = (inventory, itemSpec = {}, recordSpec = {}, rng = createRng()) => {
  const items = itemPlan(inventory, itemSpec.count ?? 0, {
    preset: itemSpec.preset, mix: itemSpec.mix, startSequence: itemSpec.startSequence, dateIndicator: itemSpec.dateIndicator,
  }, rng)
    .map(itemPayload => ({
      payload: itemPayload,
      expectFailure: isNegative(ITEM_PRESETS, itemSpec.preset),
      records: recordsForItem(inventory, itemPayload, {
        ...recordSpec, expectFailure: recordSpec.expectFailure || isNegative(ITEM_PRESETS, itemSpec.preset),
      }, rng),
    }));
  return {
    payload: null,
    existing: { id: inventory.id, type: inventory.type, electronic: inventory.electronic, start_date: inventory.start_date, end_date: inventory.end_date },
    items,
  };
};

/** Record nodes that go into an item that already exists on the server. */
export const composeIntoExistingItem = (inventory, item, recordSpec = {}, rng = createRng()) => ({
  payload: null,
  existing: { id: inventory.id, type: inventory.type, electronic: inventory.electronic, start_date: inventory.start_date, end_date: inventory.end_date },
  items: [{
    payload: null,
    existing: { id: item.id, number: item.number, start_date: item.start_date, end_date: item.end_date },
    records: recordsForItem(inventory, item, recordSpec, rng),
  }],
});

// ─── Scenario catalogue ─────────────────────────────────────────────────────

const SIGNERS = {
  creator: 'Anna Bērziņa', creator_position: 'Arhīviste',
  signer: 'Jānis Kalniņš', signer_position: 'Iestādes vadītājs',
};

export const SCENARIOS = [
  {
    id: 'smoke',
    name: 'Smoke - pa vienam no katra',
    description: 'Četri US (visi tipi), 2 GV katrā, viens dokuments ar datni un metadatiem. Ātra pārbaude, ka viss ceļš strādā.',
    signers: true,
    build: (rng) => [
      composeInventory({ type: 'Tekstuāls' }, { count: 2 }, { count: 1, files: 1 }, rng),
      composeInventory({ type: 'Foto' }, { count: 2, preset: 'full' }, {}, rng),
      composeInventory({ type: 'Video' }, { count: 2, preset: 'full' }, {}, rng),
      composeInventory({ type: 'Skaņas' }, { count: 2, preset: 'full' }, {}, rng),
    ],
  },
  {
    id: 'textualDeep',
    name: 'Tekstuāls dziļumā',
    description: 'Viens tekstuāls US, 10 GV (jaukti profili), 5 dokumenti katrā ar 2 datnēm un pilnu metadatu komplektu.',
    signers: true,
    build: (rng) => [
      composeInventory({ type: 'Tekstuāls', preset: 'longSpan' }, { count: 10 },
        { count: 5, files: 2, metadataCounts: { visa: 2, addressee: 1, action: 1, read_status: 2 } }, rng),
    ],
  },
  {
    id: 'mediaMix',
    name: 'Mediju komplekts',
    description: 'Foto, Video un Skaņas US ar 5 pilnām GV katrā; mediju ieraksti papildināti ar krāsu, izšķirtspēju un ilgumu.',
    signers: false,
    build: (rng) => [
      composeInventory({ type: 'Foto' }, { count: 5, preset: 'full' }, { enrich: true }, rng),
      composeInventory({ type: 'Video' }, { count: 5, preset: 'full' }, { enrich: true }, rng),
      composeInventory({ type: 'Skaņas' }, { count: 5, preset: 'full' }, { enrich: true }, rng),
    ],
  },
  {
    id: 'restrictedHeavy',
    name: 'Ierobežota pieeja',
    description: 'Divi tekstuāli US: viens ar ierobežotas pieejas GV, otrs ar klasificētām; visi dokumenti "closed" ar ierobežojuma datumu.',
    signers: true,
    build: (rng) => [
      composeInventory({ type: 'Tekstuāls' }, { count: 6, preset: 'restricted' }, { count: 2, preset: 'closed', files: 1 }, rng),
      composeInventory({ type: 'Tekstuāls' }, { count: 6, preset: 'classified' }, { count: 2, preset: 'closed', files: 1 }, rng),
    ],
  },
  {
    id: 'physical',
    name: 'Fiziski US',
    description: 'Tekstuāls un Foto US ar electronic: false (kategorijas DOCUMENTS / MEDIA), 5 GV katrā, bez dokumentiem - serveris tos neļauj.',
    signers: false,
    build: (rng) => [
      composeInventory({ type: 'Tekstuāls', preset: 'physical' }, { count: 5 }, {}, rng),
      composeInventory({ type: 'Foto', preset: 'physical' }, { count: 5, preset: 'full' }, {}, rng),
    ],
  },
  {
    id: 'verificationEdge',
    name: 'Verifikācijas robežgadījumi',
    description: 'Dati, kas ir derīgi serverim, bet kurus OPEX verifikācijai jāatzīmē: GV bez dokumentiem, dokumenti bez datnēm, tukšs US, mediju ieraksti bez tehniskajiem laukiem.',
    signers: false,
    build: (rng) => [
      composeInventory({ type: 'Tekstuāls' }, { count: 3 }, { count: 0 }, rng),
      composeInventory({ type: 'Tekstuāls' }, { count: 3 }, { count: 2, files: 0, metadataCounts: null }, rng),
      composeInventory({ type: 'Foto' }, { count: 2, preset: 'full' }, { enrich: false }, rng),
      composeInventory({ type: 'Tekstuāls', preset: 'sameYear' }, { count: 0 }, {}, rng),
    ],
  },
  {
    id: 'large',
    name: 'Liels apjoms',
    description: 'Pieci US (pārsvarā tekstuāli) ar 40 GV katrā un 2 dokumentiem uz GV - lapošana, virtualizācija un OPEX ģenerēšanas ilgums.',
    signers: true,
    build: (rng) => [0, 1, 2, 3, 4].map(i => composeInventory(
      { type: i === 3 ? 'Foto' : 'Tekstuāls' },
      { count: 40 },
      { count: 2, files: 1, metadataCounts: { visa: 1, addressee: 0, action: 0, read_status: 0 } },
      rng,
    )),
  },
];

export const getScenario = (id) => SCENARIOS.find(s => s.id === id) || null;

// ─── Plan helpers ───────────────────────────────────────────────────────────

export const emptyEstimate = () => ({
  inventories: 0, items: 0, records: 0, textRecords: 0, mediaRecords: 0,
  files: 0, metadata: 0, mediaUpdates: 0, signers: 0, requests: 0,
});

/** What a plan will create and roughly how many requests it costs. */
export const estimatePlan = (plan) => {
  const e = emptyEstimate();
  if (plan?.signers) { e.signers = 1; e.requests += 1; }
  (plan?.inventories || []).forEach(inv => {
    if (!inv.existing) { e.inventories++; e.requests++; }
    const newItems = inv.items.filter(it => !it.existing);
    e.items += newItems.length;
    e.requests += newItems.length;
    if (newItems.length) e.requests++; // one project GET to resolve item ids
    inv.items.forEach(item => {
      item.records.forEach(rec => {
        e.records++;
        e.requests++;
        if (rec.kind === 'media') {
          e.mediaRecords++;
          e.files++; // the upload is the record
          if (rec.mediaUpdate) { e.mediaUpdates++; e.requests++; }
        } else {
          e.textRecords++;
          e.files += rec.files;
          e.requests += rec.files;
          const meta = metadataTotal(rec.metadata);
          e.metadata += meta;
          e.requests += meta;
        }
      });
    });
  });
  return e;
};

/**
 * Validate every payload in a plan with the frontend validators. Negative
 * nodes (expectFailure) are expected to fail and are reported separately.
 */
export const validatePlan = (plan) => {
  const issues = [];
  const expectedIssues = [];
  let checked = 0;

  const report = (node, path, result) => {
    if (result.isValid) return;
    const entry = { path, errors: result.errors };
    (node.expectFailure ? expectedIssues : issues).push(entry);
  };

  (plan?.inventories || []).forEach((inv, i) => {
    const invPath = `US[${i}]`;
    const invRef = inv.existing || inv.payload;
    if (inv.payload) { checked++; report(inv, invPath, validateInventoryPayload(inv.payload)); }
    inv.items.forEach((item, j) => {
      const itemPath = `${invPath}.GV[${j}]`;
      const itemRef = item.existing || item.payload;
      if (item.payload) { checked++; report(item, itemPath, validateItemPayload(item.payload, invRef)); }
      item.records.forEach((rec, k) => {
        if (rec.kind !== 'text' || !rec.payload) return;
        checked++;
        report(rec, `${itemPath}.Dok[${k}]`, validateTextRecordPayload(rec.payload, itemRef));
      });
    });
  });

  return { valid: issues.length === 0, checked, issues, expectedIssues };
};

/**
 * Build a plan for a scenario.
 *
 * @param {string} scenarioId
 * @param {object} rng        createRng(seed) - the seed is recorded in the plan
 * @param {object} ctx        { startNumber } first inventory number to stamp
 */
export const buildScenarioPlan = (scenarioId, rng = createRng(), ctx = {}) => {
  const scenario = getScenario(scenarioId);
  if (!scenario) throw new Error(`Nezināms scenārijs: ${scenarioId}`);

  const inventories = scenario.build(rng);
  if (ctx.startNumber !== undefined) {
    inventories.forEach((inv, i) => { if (inv.payload) inv.payload.number = ctx.startNumber + i; });
  }

  const plan = {
    scenarioId,
    name: scenario.name,
    seed: rng.seed,
    signers: scenario.signers ? { ...SIGNERS } : null,
    inventories,
  };
  plan.expected = estimatePlan(plan);
  return plan;
};

/** A plan from arbitrary nodes (the Builder tab's single-entity actions). */
export const planFromNodes = (inventories, opts = {}) => {
  const plan = {
    scenarioId: opts.scenarioId || 'custom',
    name: opts.name || 'Pielāgots',
    seed: opts.seed,
    signers: opts.signers || null,
    inventories,
  };
  plan.expected = estimatePlan(plan);
  return plan;
};
