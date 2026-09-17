import { createRng } from './rng';
import {
    INVENTORY_PRESETS, INVENTORY_TYPES, MEDIA_TYPES, STORAGE_TERMS,
    buildInventory, inventoryPlan, validateInventoryPayload, describeInventory,
} from './inventoryBuilder';

const positivePresets = Object.entries(INVENTORY_PRESETS).filter(([, p]) => !p.negative).map(([id]) => id);
const negativePresets = Object.entries(INVENTORY_PRESETS).filter(([, p]) => p.negative).map(([id]) => id);

describe('buildInventory', () => {
    test.each(positivePresets)('preset "%s" passes the create validator', (preset) => {
        for (let i = 0; i < 20; i++) {
            const payload = buildInventory({ preset }, createRng(`${preset}-${i}`));
            const result = validateInventoryPayload(payload);
            expect(result.errors).toEqual({});
            expect(result.isValid).toBe(true);
            expect(INVENTORY_TYPES).toContain(payload.type);
            expect(STORAGE_TERMS).toContain(payload.storage_term);
            expect(payload.start_date <= payload.end_date).toBe(true);
        }
    });

    test.each(negativePresets)('negative preset "%s" fails the create validator', (preset) => {
        const payload = buildInventory({ preset }, createRng(preset));
        expect(validateInventoryPayload(payload).isValid).toBe(false);
    });

    test('sameYear spans exactly one calendar year', () => {
        const p = buildInventory({ preset: 'sameYear' }, createRng(3));
        expect(p.start_date.slice(0, 4)).toBe(p.end_date.slice(0, 4));
        expect(p.start_date.slice(4)).toBe('-01-01');
        expect(p.end_date.slice(4)).toBe('-12-31');
    });

    test('longSpan covers at least 25 years', () => {
        const p = buildInventory({ preset: 'longSpan' }, createRng(5));
        expect(parseInt(p.end_date, 10) - parseInt(p.start_date, 10)).toBeGreaterThanOrEqual(25);
    });

    test('physical preset is not electronic, withSubfond sets a subfond', () => {
        expect(buildInventory({ preset: 'physical' }, createRng(1)).electronic).toBe(false);
        expect(buildInventory({ preset: 'withSubfond' }, createRng(1)).subfond).toBeGreaterThan(0);
        expect(buildInventory({ preset: 'random' }, createRng(1)).subfond).toBe(0);
    });

    test('explicit options win over the preset', () => {
        const p = buildInventory({ preset: 'random', type: 'Foto', electronic: false, storageTerm: STORAGE_TERMS[1], subfond: 4, startYear: 2001, endYear: 2003, number: 9 }, createRng(1));
        expect(p).toMatchObject({ type: 'Foto', electronic: false, storage_term: STORAGE_TERMS[1], subfond: 4, start_date: '2001-01-01', end_date: '2003-12-31', number: 9 });
    });

    test('number is always present - the serializer requires it even though the server overwrites it', () => {
        expect(buildInventory({}, createRng(1)).number).toBe(1);
        expect(buildInventory({ number: 12 }, createRng(1)).number).toBe(12);
    });

    test('is reproducible for a seed', () => {
        expect(buildInventory({}, createRng('same'))).toEqual(buildInventory({}, createRng('same')));
    });
});

describe('inventoryPlan', () => {
    test('even distribution cycles through all four types', () => {
        const types = inventoryPlan(8, { distribution: 'even' }, createRng(1)).map(p => p.type);
        expect(types).toEqual([...INVENTORY_TYPES, ...INVENTORY_TYPES]);
    });

    test('media distribution never produces a textual inventory', () => {
        inventoryPlan(9, { distribution: 'media' }, createRng(2)).forEach(p => {
            expect(MEDIA_TYPES).toContain(p.type);
        });
    });

    test('textual distribution is all Tekstuāls', () => {
        inventoryPlan(5, { distribution: 'textual' }, createRng(2)).forEach(p => expect(p.type).toBe('Tekstuāls'));
    });

    test('weighted distribution honours zero weights', () => {
        inventoryPlan(30, { distribution: { 'Tekstuāls': 1, 'Foto': 0, 'Video': 0, 'Skaņas': 1 } }, createRng(4))
            .forEach(p => expect(['Tekstuāls', 'Skaņas']).toContain(p.type));
    });

    test('electronicMix 0 makes everything physical, 1 everything electronic', () => {
        expect(inventoryPlan(6, { electronicMix: 0 }, createRng(1)).every(p => p.electronic === false)).toBe(true);
        expect(inventoryPlan(6, { electronicMix: 1 }, createRng(1)).every(p => p.electronic === true)).toBe(true);
    });

    test('startNumber stamps consecutive numbers', () => {
        expect(inventoryPlan(3, { startNumber: 7 }, createRng(1)).map(p => p.number)).toEqual([7, 8, 9]);
    });

    test('count 0 or negative yields an empty plan', () => {
        expect(inventoryPlan(0, {}, createRng(1))).toEqual([]);
        expect(inventoryPlan(-2, {}, createRng(1))).toEqual([]);
    });
});

describe('describeInventory', () => {
    test('summarises type, category, years and term', () => {
        const text = describeInventory({ type: 'Foto', electronic: false, start_date: '2001-01-01', end_date: '2004-12-31', storage_term: STORAGE_TERMS[0], subfond: 2 });
        expect(text).toContain('Foto');
        expect(text).toContain('fiz.');
        expect(text).toContain('2001-2004');
        expect(text).toContain('subfonds 2');
    });
});
