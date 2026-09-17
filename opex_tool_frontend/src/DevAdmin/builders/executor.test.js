import { createRng } from './rng';
import { buildScenarioPlan, planFromNodes, composeInventory, composeIntoExistingItem } from './scenarios';
import { runPlan, compareTally, formatRunReport, emptyTally } from './executor';

/**
 * A fake backend that behaves like the real one where it matters:
 *  - inventory POST returns an id
 *  - item POST returns `number` but NO id
 *  - the id map comes from a separate lookup, once per inventory
 */
const makeFakeApi = (overrides = {}) => {
    const calls = [];
    let nextId = 100;
    const itemsByInventory = new Map();
    const record = (name, ...args) => calls.push({ name, args });

    const api = {
        setSigners: async (...args) => { record('setSigners', ...args); return {}; },
        createInventory: async (projectId, fondId, payload) => {
            record('createInventory', projectId, fondId, payload);
            const id = nextId++;
            itemsByInventory.set(id, []);
            return { id, number: payload.number ?? id, type: payload.type };
        },
        createItem: async (projectId, inventoryId, payload) => {
            record('createItem', projectId, inventoryId, payload);
            const list = itemsByInventory.get(inventoryId) || [];
            const number = list.length + 1;
            list.push({ number, id: nextId++ });
            itemsByInventory.set(inventoryId, list);
            return { number, title: payload.title }; // no id, like the real backend
        },
        resolveItemIds: async (projectId, inventoryId) => {
            record('resolveItemIds', projectId, inventoryId);
            return new Map((itemsByInventory.get(inventoryId) || []).map(it => [it.number, it.id]));
        },
        createRecord: async (projectId, itemId, payload) => {
            record('createRecord', projectId, itemId, payload);
            return { id: nextId++, date: payload.date };
        },
        createMediaRecord: async (projectId, itemId, mediaType) => {
            record('createMediaRecord', projectId, itemId, mediaType);
            return { id: nextId++ };
        },
        uploadFile: async (...args) => { record('uploadFile', ...args); return {}; },
        addMetadata: async (...args) => { record('addMetadata', ...args); return {}; },
        updateMediaRecord: async (...args) => { record('updateMediaRecord', ...args); return {}; },
        ...overrides,
    };
    return { api, calls, itemsByInventory };
};

const ctx = { projectId: 1, fondId: 2, institutionId: 3 };

describe('runPlan - dry run', () => {
    test('sends nothing and tallies what a live run would attempt', async () => {
        const plan = buildScenarioPlan('smoke', createRng(1));
        const { api, calls } = makeFakeApi();
        const result = await runPlan(plan, { ...ctx, dryRun: true }, api);
        expect(calls).toHaveLength(0);
        expect(result.dryRun).toBe(true);
        expect(result.tally.inventories).toBe(plan.expected.inventories);
        expect(result.tally.items).toBe(plan.expected.items);
        expect(result.tally.records).toBe(plan.expected.records);
        expect(result.tally.errors).toBe(0);
        expect(compareTally(result).every(r => r.ok)).toBe(true);
    });

    test('reports invalid payloads as errors and negative ones as expected failures', async () => {
        const rng = createRng(2);
        const bad = composeInventory({ preset: 'invalidDates' }, { count: 1 }, { count: 1 }, rng);
        const plan = planFromNodes([bad]);
        const result = await runPlan(plan, { dryRun: true }, makeFakeApi().api);
        expect(result.tally.expectedFailures).toBeGreaterThanOrEqual(1);
        expect(result.errors.some(e => e.stage === 'validate' && e.expected)).toBe(true);
    });
});

describe('runPlan - live against a fake backend', () => {
    test('creates the whole smoke scenario and matches the estimate', async () => {
        const plan = buildScenarioPlan('smoke', createRng(3));
        const { api, calls } = makeFakeApi();
        const log = [];
        const result = await runPlan(plan, ctx, api, { onProgress: (m, t) => log.push([m, t]) });

        expect(result.tally.errors).toBe(0);
        expect(compareTally(result).every(r => r.ok)).toBe(true);
        expect(result.tally.signers).toBe(1);
        expect(result.created.inventories).toHaveLength(4);
        expect(result.created.items).toHaveLength(8);
        expect(result.created.records).toHaveLength(8);
        expect(log.length).toBeGreaterThan(0);

        // One id lookup per inventory, never per item
        expect(calls.filter(c => c.name === 'resolveItemIds')).toHaveLength(4);
        expect(calls.filter(c => c.name === 'createItem')).toHaveLength(8);
    });

    test('records are created against the RESOLVED item id, not the POST response', async () => {
        const plan = buildScenarioPlan('textualDeep', createRng(4));
        const { api, calls, itemsByInventory } = makeFakeApi();
        await runPlan(plan, ctx, api);

        const inventoryId = calls.find(c => c.name === 'createItem').args[1];
        const knownIds = new Set(itemsByInventory.get(inventoryId).map(it => it.id));
        const recordCalls = calls.filter(c => c.name === 'createRecord');
        expect(recordCalls).toHaveLength(50);
        recordCalls.forEach(c => expect(knownIds.has(c.args[1])).toBe(true));
    });

    test('media records get their enrichment PUT with the inventory type', async () => {
        const plan = buildScenarioPlan('mediaMix', createRng(5));
        const { api, calls } = makeFakeApi();
        const result = await runPlan(plan, ctx, api);
        const updates = calls.filter(c => c.name === 'updateMediaRecord');
        expect(updates).toHaveLength(15);
        expect(updates.map(u => u.args[2]).sort()).toEqual([...Array(5).fill('Foto'), ...Array(5).fill('Skaņas'), ...Array(5).fill('Video')]);
        expect(result.tally.mediaUpdates).toBe(15);
        expect(result.tally.files).toBe(15);
    });

    test('a failing entity is recorded and the run continues', async () => {
        const plan = buildScenarioPlan('smoke', createRng(6));
        let itemCalls = 0;
        const { api } = makeFakeApi({
            createItem: async () => {
                itemCalls++;
                if (itemCalls === 2) throw Object.assign(new Error('boom'), { fieldErrors: { title: ['Too long'] } });
                return { number: itemCalls };
            },
        });
        // resolveItemIds will not know these numbers → items get no id → their records are skipped
        const result = await runPlan(plan, ctx, api);
        expect(result.tally.items).toBe(7);
        expect(result.errors.some(e => e.stage === 'item' && e.message.includes('title: Too long'))).toBe(true);
        expect(result.tally.inventories).toBe(4);
    });

    test('a negative node that the server rejects counts as an expected failure, not an error', async () => {
        const rng = createRng(7);
        const node = composeInventory({ preset: 'invalidDates' }, { count: 0 }, {}, rng);
        const { api } = makeFakeApi({
            createInventory: async () => { throw new Error('start_date > end_date'); },
        });
        const result = await runPlan(planFromNodes([node]), ctx, api);
        expect(result.tally.errors).toBe(0);
        expect(result.tally.expectedFailures).toBe(1);
        expect(result.errors[0].expected).toBe(true);
    });

    test('a negative node the server ACCEPTS is flagged as an unexpected success', async () => {
        const rng = createRng(8);
        const node = composeInventory({ preset: 'invalidDates' }, { count: 0 }, {}, rng);
        const { api } = makeFakeApi();
        const result = await runPlan(planFromNodes([node]), ctx, api);
        expect(result.tally.unexpectedSuccesses).toBe(1);
    });

    test('skipInvalid keeps client-invalid payloads off the wire', async () => {
        const rng = createRng(9);
        const node = composeInventory({ preset: 'invalidDates' }, { count: 0 }, {}, rng);
        const { api, calls } = makeFakeApi();
        await runPlan(planFromNodes([node]), { ...ctx, skipInvalid: true }, api);
        expect(calls.filter(c => c.name === 'createInventory')).toHaveLength(0);
    });

    test('shouldStop halts between entities and marks the result', async () => {
        const plan = buildScenarioPlan('large', createRng(10));
        const { api } = makeFakeApi();
        let created = 0;
        const base = api.createInventory;
        api.createInventory = async (...args) => { created++; return base(...args); };
        // stop condition flips once three inventories exist
        const result = await runPlan(plan, ctx, api, { shouldStop: () => created >= 3 });
        expect(result.stopped).toBe(true);
        expect(result.tally.inventories).toBe(3);
        expect(result.tally.items).toBeLessThan(plan.expected.items);
    });

    test('existing inventory / item nodes are not re-created', async () => {
        const inventory = { id: 55, number: 3, type: 'Tekstuāls', electronic: true, start_date: '2001-01-01', end_date: '2002-12-31' };
        const item = { id: 66, number: 1, start_date: '2001-03-01', end_date: '2002-03-01' };
        const node = composeIntoExistingItem(inventory, item, { count: 2, files: 1, metadataCounts: null }, createRng(11));
        const { api, calls } = makeFakeApi();
        const result = await runPlan(planFromNodes([node]), ctx, api);
        expect(calls.filter(c => c.name === 'createInventory')).toHaveLength(0);
        expect(calls.filter(c => c.name === 'createItem')).toHaveLength(0);
        expect(calls.filter(c => c.name === 'resolveItemIds')).toHaveLength(0);
        expect(calls.filter(c => c.name === 'createRecord').every(c => c.args[1] === 66)).toBe(true);
        expect(result.tally).toMatchObject({ inventories: 0, items: 0, records: 2, files: 2, errors: 0 });
    });

    test('signers are skipped without an institution id', async () => {
        const plan = buildScenarioPlan('smoke', createRng(12));
        const { api, calls } = makeFakeApi();
        await runPlan(plan, { projectId: 1, fondId: 2 }, api);
        expect(calls.filter(c => c.name === 'setSigners')).toHaveLength(0);
    });
});

describe('reporting', () => {
    test('formatRunReport lists the seed, the counters and every error', async () => {
        const plan = buildScenarioPlan('smoke', createRng('rep'));
        const { api } = makeFakeApi({ uploadFile: async () => { throw new Error('disk full'); } });
        const result = await runPlan(plan, ctx, api);
        const text = formatRunReport(result);
        expect(text).toContain('Builder run');
        expect(text).toContain(String(result.seed));
        expect(text).toContain('LIVE');
        expect(text).toContain('disk full');
        expect(text).toMatch(/Datnes\s+\d+\s+\/\s+\d+ !!/);
    });

    test('emptyTally starts at zero for every counter', () => {
        Object.values(emptyTally()).forEach(v => expect(v).toBe(0));
    });
});
