/**
 * Entity Builder Tests (in-browser)
 *
 * The DevAdmin builders (DevAdmin/builders/) generate reproducible, preset
 * driven test data. These checks mirror the Jest suites in builders/*.test.js
 * so the same guarantees can be confirmed from the Tests tab without a
 * terminal:
 * - a seed reproduces the same data
 * - every positive preset passes the real form validators, every negative one fails
 * - scenarios estimate correctly and validate end to end
 * - the executor dry-runs without touching the network and resolves item ids
 *   once per inventory when run live (against a fake api)
 */

import {
  createRng,
  INVENTORY_PRESETS, buildInventory, inventoryPlan, validateInventoryPayload,
  ITEM_PRESETS, buildItem, itemPlan, validateItemPayload,
  RECORD_PRESETS, buildTextRecord, buildMetadataSet, buildMediaRecordUpdate, validateTextRecordPayload, metadataTotal,
  SCENARIOS, buildScenarioPlan, validatePlan, estimatePlan, planFromNodes, composeInventory,
  runPlan, compareTally, formatRunReport,
} from '../../builders';

const builderTests = ({ describe, it, expect }) => {

  const inventory = { id: 1, number: 1, type: 'Tekstuāls', electronic: true, start_date: '2005-01-01', end_date: '2009-12-31' };
  const item = { id: 10, number: 1, start_date: '2006-01-01', end_date: '2007-12-31' };

  const presetIds = (presets, negative) =>
    Object.entries(presets).filter(([, p]) => !!p.negative === negative).map(([id]) => id);

  // ═══════════════════════════════════════════════════════════════════════════
  // REPRODUCIBILITY
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Seeded generation', () => {
    it('the same seed gives the same inventory, item and record', () => {
      const a = createRng('seed-1');
      const b = createRng('seed-1');
      expect(buildInventory({}, a)).toEqual(buildInventory({}, b));
      expect(buildItem(inventory, { preset: 'full', sequence: 1 }, a))
        .toEqual(buildItem(inventory, { preset: 'full', sequence: 1 }, b));
      expect(buildTextRecord(item, { preset: 'closed', sequence: 1 }, a))
        .toEqual(buildTextRecord(item, { preset: 'closed', sequence: 1 }, b));
    });

    it('different seeds give different data', () => {
      expect(buildItem(inventory, {}, createRng('x')).title).not.toBe(buildItem(inventory, {}, createRng('y')).title);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INVENTORY PRESETS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Inventory builder', () => {
    presetIds(INVENTORY_PRESETS, false).forEach(preset => {
      it(`preset "${preset}" is valid`, () => {
        for (let i = 0; i < 10; i++) {
          expect(validateInventoryPayload(buildInventory({ preset }, createRng(`${preset}${i}`))).isValid).toBe(true);
        }
      });
    });

    presetIds(INVENTORY_PRESETS, true).forEach(preset => {
      it(`negative preset "${preset}" is rejected by the validator`, () => {
        expect(validateInventoryPayload(buildInventory({ preset }, createRng(preset))).isValid).toBe(false);
      });
    });

    it('even distribution cycles all four types', () => {
      const types = inventoryPlan(4, { distribution: 'even' }, createRng(1)).map(p => p.type);
      expect(types).toEqual(['Tekstuāls', 'Foto', 'Video', 'Skaņas']);
    });

    it('media distribution never yields Tekstuāls', () => {
      inventoryPlan(6, { distribution: 'media' }, createRng(1)).forEach(p => expect(p.type).not.toBe('Tekstuāls'));
    });

    it('always carries number - the serializer requires it even though the server overwrites it', () => {
      expect(buildInventory({}, createRng(1))).toHaveProperty('number', 1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ITEM PRESETS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item builder', () => {
    ['Tekstuāls', 'Foto', 'Video', 'Skaņas'].forEach(type => {
      const inv = { ...inventory, type };
      presetIds(ITEM_PRESETS, false).forEach(preset => {
        it(`${type}: preset "${preset}" is valid`, () => {
          for (let i = 0; i < 5; i++) {
            const result = validateItemPayload(buildItem(inv, { preset, sequence: i }, createRng(`${type}${preset}${i}`)), inv);
            expect(result.errors).toEqual({});
          }
        });
      });
    });

    it('negative presets fail validation', () => {
      expect(validateItemPayload(buildItem(inventory, { preset: 'invalidSeriesCode' }, createRng(1)), inventory).isValid).toBe(false);
      expect(validateItemPayload(buildItem(inventory, { preset: 'datesOutsideInventory' }, createRng(1)), inventory).isValid).toBe(false);
      const foto = { ...inventory, type: 'Foto' };
      expect(validateItemPayload(buildItem(foto, { preset: 'missingAnnotation' }, createRng(1)), foto).isValid).toBe(false);
    });

    it('dates stay inside the inventory period for every indicator', () => {
      ['year', 'month', 'day'].forEach(indicator => {
        for (let i = 0; i < 20; i++) {
          const p = buildItem(inventory, { dateIndicator: indicator }, createRng(`${indicator}${i}`));
          expect(p.start_date >= inventory.start_date).toBeTruthy();
          expect(p.end_date <= inventory.end_date).toBeTruthy();
          expect(p.start_date <= p.end_date).toBeTruthy();
        }
      });
    });

    it('restricted items carry the mandatory restriction note', () => {
      const p = buildItem(inventory, { preset: 'restricted' }, createRng(2));
      expect(p.restriction).not.toBe('Vispārēja');
      expect(p.restriction_note.length).toBeGreaterThan(0);
    });

    it('itemPlan numbers titles sequentially and uniquely', () => {
      const plan = itemPlan(inventory, 8, { startSequence: 3 }, createRng(1));
      expect(plan).toHaveLength(8);
      expect(new Set(plan.map(p => p.title)).size).toBe(8);
      expect(plan[0].title).toMatch(/nr\. 3$/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORD PRESETS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record builder', () => {
    presetIds(RECORD_PRESETS, false).forEach(preset => {
      it(`preset "${preset}" is valid`, () => {
        for (let i = 0; i < 10; i++) {
          expect(validateTextRecordPayload(buildTextRecord(item, { preset, sequence: i }, createRng(`${preset}${i}`)), item).errors).toEqual({});
        }
      });
    });

    presetIds(RECORD_PRESETS, true).forEach(preset => {
      it(`negative preset "${preset}" is rejected by the validator`, () => {
        expect(validateTextRecordPayload(buildTextRecord(item, { preset }, createRng(preset)), item).isValid).toBe(false);
      });
    });

    it('never sends null for a CharField', () => {
      const p = buildTextRecord(item, { preset: 'minimal' }, createRng(1));
      Object.entries(p).forEach(([key, value]) => {
        if (key !== 'access_restriction_date') expect(value).not.toBeNull();
      });
    });

    it('closed records carry a restriction date after the record date', () => {
      const p = buildTextRecord(item, { preset: 'closed' }, createRng(1));
      expect(p.access_restriction).toBe('closed');
      expect(p.access_restriction_date > p.date).toBeTruthy();
    });

    it('metadata sets honour the requested counts', () => {
      const set = buildMetadataSet({ date: '2006-06-06' }, { visa: 2, addressee: 1, action: 0, read_status: 3 }, createRng(1));
      expect(metadataTotal(set)).toBe(6);
      expect(set.action).toHaveLength(0);
    });

    it('media enrichment matches the per-type serializer requirements', () => {
      const foto = buildMediaRecordUpdate('Foto', {}, createRng(1));
      expect(foto).toHaveProperty('color');
      expect(foto).toHaveProperty('horizontal_resolution');
      expect(foto).not.toHaveProperty('duration');
      const video = buildMediaRecordUpdate('Video', {}, createRng(1));
      expect(video.duration).toMatch(/^\d{2}:[0-5]\d:[0-5]\d$/);
      const audio = buildMediaRecordUpdate('Skaņas', {}, createRng(1));
      expect(Object.keys(audio)).toEqual(['duration']);
      expect(buildMediaRecordUpdate('Tekstuāls', {}, createRng(1))).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Scenarios', () => {
    SCENARIOS.forEach(scenario => {
      it(`"${scenario.id}" builds a fully valid plan`, () => {
        const plan = buildScenarioPlan(scenario.id, createRng(scenario.id));
        const v = validatePlan(plan);
        expect(v.issues).toEqual([]);
        expect(v.valid).toBe(true);
        expect(plan.expected).toEqual(estimatePlan(plan));
      });
    });

    it('smoke: 4 US, 8 GV, 8 Dok.', () => {
      const e = buildScenarioPlan('smoke', createRng(1)).expected;
      expect(e.inventories).toBe(4);
      expect(e.items).toBe(8);
      expect(e.records).toBe(8);
      expect(e.textRecords).toBe(2);
      expect(e.mediaRecords).toBe(6);
    });

    it('physical: no records at all', () => {
      expect(buildScenarioPlan('physical', createRng(1)).expected.records).toBe(0);
    });

    it('negative nodes are reported as expected issues, not errors', () => {
      const node = composeInventory({ preset: 'invalidDates' }, { count: 1 }, { count: 1 }, createRng(1));
      const v = validatePlan(planFromNodes([node]));
      expect(v.issues).toEqual([]);
      expect(v.expectedIssues.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTOR
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Executor', () => {
    const fakeApi = () => {
      const calls = [];
      let nextId = 100;
      const items = new Map();
      return {
        calls,
        api: {
          setSigners: async () => { calls.push('setSigners'); return {}; },
          createInventory: async (p, f, payload) => { calls.push('createInventory'); const id = nextId++; items.set(id, []); return { id, number: payload.number, type: payload.type }; },
          createItem: async (p, invId) => { calls.push('createItem'); const list = items.get(invId); const number = list.length + 1; list.push({ number, id: nextId++ }); return { number }; },
          resolveItemIds: async (p, invId) => { calls.push('resolveItemIds'); return new Map(items.get(invId).map(it => [it.number, it.id])); },
          createRecord: async (p, itemId) => { calls.push(`createRecord:${itemId}`); return { id: nextId++ }; },
          createMediaRecord: async () => { calls.push('createMediaRecord'); return { id: nextId++ }; },
          uploadFile: async () => { calls.push('uploadFile'); return {}; },
          addMetadata: async () => { calls.push('addMetadata'); return {}; },
          updateMediaRecord: async () => { calls.push('updateMediaRecord'); return {}; },
        },
      };
    };

    it('dry run sends nothing and matches the estimate', async () => {
      const plan = buildScenarioPlan('smoke', createRng(1));
      const { api, calls } = fakeApi();
      const result = await runPlan(plan, { dryRun: true }, api);
      expect(calls).toHaveLength(0);
      expect(compareTally(result).every(r => r.ok)).toBe(true);
    });

    it('live run resolves item ids once per inventory and records go to resolved ids', async () => {
      const plan = buildScenarioPlan('smoke', createRng(2));
      const { api, calls } = fakeApi();
      const result = await runPlan(plan, { projectId: 1, fondId: 2, institutionId: 3 }, api);
      expect(result.tally.errors).toBe(0);
      expect(compareTally(result).every(r => r.ok)).toBe(true);
      expect(calls.filter(c => c === 'resolveItemIds')).toHaveLength(4);
      // every record went to an id ≥ 100 handed out by the fake, never to undefined
      calls.filter(c => c.startsWith('createRecord:')).forEach(c => {
        expect(c).not.toContain('undefined');
      });
    });

    it('a rejected negative node is an expected failure', async () => {
      const node = composeInventory({ preset: 'invalidDates' }, { count: 0 }, {}, createRng(3));
      const { api } = fakeApi();
      api.createInventory = async () => { throw new Error('400'); };
      const result = await runPlan(planFromNodes([node]), { projectId: 1, fondId: 2 }, api);
      expect(result.tally.errors).toBe(0);
      expect(result.tally.expectedFailures).toBe(1);
    });

    it('formatRunReport is paste-ready', async () => {
      const plan = buildScenarioPlan('physical', createRng(4));
      const { api } = fakeApi();
      const result = await runPlan(plan, { projectId: 1, fondId: 2 }, api);
      const text = formatRunReport(result);
      expect(text).toContain('Builder run');
      expect(text).toContain('LIVE');
      expect(text).toContain('OK');
    });
  });
};

export default builderTests;
