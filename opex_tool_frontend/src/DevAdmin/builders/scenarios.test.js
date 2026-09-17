import { createRng } from './rng';
import {
    SCENARIOS, getScenario, buildScenarioPlan, estimatePlan, validatePlan, planFromNodes,
    composeInventory, composeIntoExistingInventory, composeIntoExistingItem, recordsForItem,
    textRecordNode, mediaRecordNode,
} from './scenarios';
import { buildItem } from './itemBuilder';
import { buildTextRecord } from './recordBuilder';

const scenarioIds = SCENARIOS.map(s => s.id);

describe('scenario catalogue', () => {
    test('every scenario has an id, a name, a description and a builder', () => {
        SCENARIOS.forEach(s => {
            expect(s.id).toMatch(/^[a-zA-Z]+$/);
            expect(s.name.length).toBeGreaterThan(3);
            expect(s.description.length).toBeGreaterThan(10);
            expect(typeof s.build).toBe('function');
        });
        expect(new Set(scenarioIds).size).toBe(scenarioIds.length);
    });

    test('getScenario finds by id and returns null otherwise', () => {
        expect(getScenario('smoke').id).toBe('smoke');
        expect(getScenario('nope')).toBeNull();
    });

    test.each(scenarioIds)('scenario "%s" builds a plan whose payloads all validate', (id) => {
        const plan = buildScenarioPlan(id, createRng(`${id}-seed`));
        const v = validatePlan(plan);
        expect(v.issues).toEqual([]);
        expect(v.expectedIssues).toEqual([]);
        expect(v.valid).toBe(true);
        expect(v.checked).toBeGreaterThan(0);
        expect(plan.expected).toEqual(estimatePlan(plan));
    });

    test.each(scenarioIds)('scenario "%s" is reproducible for a seed', (id) => {
        const a = buildScenarioPlan(id, createRng('fixed'));
        const b = buildScenarioPlan(id, createRng('fixed'));
        expect(a).toEqual(b);
        expect(a.seed).toBe(b.seed);
    });

    test('buildScenarioPlan throws on an unknown id', () => {
        expect(() => buildScenarioPlan('ghost', createRng(1))).toThrow('ghost');
    });

    test('startNumber stamps consecutive inventory numbers', () => {
        const plan = buildScenarioPlan('smoke', createRng(1), { startNumber: 4 });
        expect(plan.inventories.map(i => i.payload.number)).toEqual([4, 5, 6, 7]);
    });
});

describe('scenario shapes', () => {
    test('smoke: one of each type, two items each, signers on', () => {
        const plan = buildScenarioPlan('smoke', createRng(1));
        expect(plan.inventories.map(i => i.payload.type)).toEqual(['Tekstuāls', 'Foto', 'Video', 'Skaņas']);
        expect(plan.signers).not.toBeNull();
        expect(plan.expected.inventories).toBe(4);
        expect(plan.expected.items).toBe(8);
        // textual: 2 items x 1 record; media: 1 file-backed record per item
        expect(plan.expected.textRecords).toBe(2);
        expect(plan.expected.mediaRecords).toBe(6);
    });

    test('textualDeep: 10 items x 5 records, two files and six metadata each', () => {
        const plan = buildScenarioPlan('textualDeep', createRng(1));
        expect(plan.expected).toMatchObject({ inventories: 1, items: 10, records: 50, files: 100, metadata: 300 });
    });

    test('mediaMix: every record carries an enrichment update', () => {
        const plan = buildScenarioPlan('mediaMix', createRng(1));
        expect(plan.expected.mediaRecords).toBe(15);
        expect(plan.expected.mediaUpdates).toBe(15);
        plan.inventories.forEach(inv => inv.items.forEach(it => {
            expect(it.records).toHaveLength(1);
            expect(it.records[0].kind).toBe('media');
            expect(it.records[0].mediaUpdate).not.toBeNull();
        }));
    });

    test('restrictedHeavy: every item restricted or classified, every record closed', () => {
        const plan = buildScenarioPlan('restrictedHeavy', createRng(1));
        plan.inventories[0].items.forEach(it => expect(it.payload.restriction).not.toBe('Vispārēja'));
        plan.inventories[1].items.forEach(it => expect(it.payload.security_level).not.toBe('Publisks'));
        plan.inventories.forEach(inv => inv.items.forEach(it => it.records.forEach(r => {
            expect(r.payload.access_restriction).toBe('closed');
        })));
    });

    test('physical: no records at all - the backend refuses them', () => {
        const plan = buildScenarioPlan('physical', createRng(1));
        plan.inventories.forEach(inv => {
            expect(inv.payload.electronic).toBe(false);
            inv.items.forEach(it => expect(it.records).toHaveLength(0));
        });
        expect(plan.expected.records).toBe(0);
    });

    test('verificationEdge: items without records, records without files, an empty inventory', () => {
        const plan = buildScenarioPlan('verificationEdge', createRng(1));
        expect(plan.inventories[0].items.every(it => it.records.length === 0)).toBe(true);
        expect(plan.inventories[1].items.every(it => it.records.every(r => r.files === 0 && r.metadata === null))).toBe(true);
        expect(plan.inventories[3].items).toHaveLength(0);
        expect(plan.expected.files).toBe(2); // only the two Foto uploads
    });

    test('large: five inventories of forty items', () => {
        const plan = buildScenarioPlan('large', createRng(1));
        expect(plan.expected.inventories).toBe(5);
        expect(plan.expected.items).toBe(200);
    });
});

describe('composition helpers', () => {
    const inventory = { id: 7, number: 2, type: 'Tekstuāls', electronic: true, start_date: '2001-01-01', end_date: '2003-12-31' };
    const mediaInventory = { ...inventory, id: 8, type: 'Foto' };

    test('recordsForItem follows the category rules', () => {
        const rng = createRng(1);
        const itemPayload = buildItem(inventory, {}, rng);
        expect(recordsForItem(inventory, itemPayload, { count: 3 }, rng)).toHaveLength(3);
        expect(recordsForItem(mediaInventory, itemPayload, {}, rng)).toHaveLength(1);
        expect(recordsForItem(mediaInventory, itemPayload, { count: 0 }, rng)).toHaveLength(0);
        expect(recordsForItem({ ...inventory, electronic: false }, itemPayload, { count: 3 }, rng)).toHaveLength(0);
    });

    test('composeIntoExistingInventory carries the id and creates no inventory', () => {
        const node = composeIntoExistingInventory(inventory, { count: 4, preset: 'full', startSequence: 10 }, { count: 0 }, createRng(1));
        expect(node.payload).toBeNull();
        expect(node.existing.id).toBe(7);
        expect(node.items).toHaveLength(4);
        expect(node.items[0].payload.title.endsWith('nr. 10')).toBe(true);
        const estimate = estimatePlan(planFromNodes([node]));
        expect(estimate.inventories).toBe(0);
        expect(estimate.items).toBe(4);
        expect(estimate.requests).toBe(5); // 4 POSTs + 1 id lookup
    });

    test('composeIntoExistingItem creates only records', () => {
        const item = { id: 30, number: 1, start_date: '2001-05-01', end_date: '2002-05-01' };
        const node = composeIntoExistingItem(inventory, item, { count: 2, files: 1, metadataCounts: { visa: 1, addressee: 0, action: 0, read_status: 0 } }, createRng(1));
        expect(node.items[0].existing.id).toBe(30);
        expect(node.items[0].records).toHaveLength(2);
        const estimate = estimatePlan(planFromNodes([node]));
        expect(estimate).toMatchObject({ inventories: 0, items: 0, records: 2, files: 2, metadata: 2 });
        expect(estimate.requests).toBe(6);
    });

    test('negative presets mark nodes as expectFailure and validatePlan reports them separately', () => {
        const rng = createRng(1);
        const node = composeInventory({ preset: 'invalidDates', type: 'Tekstuāls' }, { count: 1, preset: 'invalidSeriesCode' }, { count: 1, preset: 'openWithDate' }, rng);
        expect(node.expectFailure).toBe(true);
        expect(node.items[0].expectFailure).toBe(true);
        expect(node.items[0].records[0].expectFailure).toBe(true);
        const v = validatePlan(planFromNodes([node]));
        expect(v.valid).toBe(true);
        expect(v.issues).toEqual([]);
        expect(v.expectedIssues.length).toBeGreaterThanOrEqual(2);
    });

    test('children of a negative inventory inherit expectFailure - they can never be created', () => {
        const node = composeInventory({ preset: 'missingType', type: undefined }, { count: 2 }, { count: 1 }, createRng(5));
        expect(node.expectFailure).toBe(true);
        node.items.forEach(it => {
            expect(it.expectFailure).toBe(true);
            it.records.forEach(r => expect(r.expectFailure).toBe(true));
        });
        expect(validatePlan(planFromNodes([node])).issues).toEqual([]);
    });

    test('textRecordNode and mediaRecordNode carry the shape the executor expects', () => {
        const rng = createRng(2);
        const text = textRecordNode(buildTextRecord({ start_date: '2001-01-01', end_date: '2001-12-31' }, {}, rng), { files: 3 }, rng);
        expect(text).toMatchObject({ kind: 'text', files: 3, mediaUpdate: null, expectFailure: false });
        expect(text.metadata).not.toBeNull();
        const media = mediaRecordNode('Video', { enrich: true }, rng);
        expect(media).toMatchObject({ kind: 'media', payload: null, files: 0, metadata: null });
        expect(media.mediaUpdate.duration).toBeDefined();
    });
});

describe('estimatePlan', () => {
    test('counts requests: entity POSTs, one id lookup per inventory with new items, files, metadata, signers', () => {
        const plan = buildScenarioPlan('smoke', createRng(1));
        const e = plan.expected;
        // 1 signers + 4 US + 8 GV + 4 lookups + 8 records + 2 files + 8 metadata (2 text records x 4 classes)
        expect(e.signers).toBe(1);
        expect(e.requests).toBe(1 + 4 + 8 + 4 + 8 + 2 + 8);
        expect(e.files).toBe(2 + 6); // 2 uploads on text records + 6 media uploads
    });

    test('an empty plan estimates zero everywhere', () => {
        expect(estimatePlan(planFromNodes([]))).toMatchObject({ inventories: 0, items: 0, records: 0, requests: 0 });
    });
});
