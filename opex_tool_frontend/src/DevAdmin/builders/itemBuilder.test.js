import { createRng } from './rng';
import { INVENTORY_TYPES } from './inventoryBuilder';
import {
    ITEM_PRESETS, DEFAULT_ITEM_MIX, LANGUAGES,
    buildItem, itemPlan, validateItemPayload, describeItem, seriesCode,
} from './itemBuilder';
import { SERIES_CODE_REGEX } from '../../Constants/itemConstants';

const inventoryOf = (type, extra = {}) => ({
    id: 1, number: 1, type, electronic: true, start_date: '2005-01-01', end_date: '2009-12-31', ...extra,
});

const positivePresets = Object.entries(ITEM_PRESETS).filter(([, p]) => !p.negative).map(([id]) => id);
const negativePresets = Object.entries(ITEM_PRESETS).filter(([, p]) => p.negative).map(([id]) => id);

describe('buildItem - validity', () => {
    const cases = [];
    INVENTORY_TYPES.forEach(type => positivePresets.forEach(preset => cases.push([type, preset])));

    test.each(cases)('%s inventory, preset "%s" passes validateItemCreate', (type, preset) => {
        const inventory = inventoryOf(type);
        for (let i = 0; i < 10; i++) {
            const payload = buildItem(inventory, { preset, sequence: i + 1 }, createRng(`${type}-${preset}-${i}`));
            const result = validateItemPayload(payload, inventory);
            expect(result.errors).toEqual({});
            expect(result.isValid).toBe(true);
        }
    });

    test('negative presets fail validation on media and textual inventories', () => {
        negativePresets.forEach(preset => {
            // missingAnnotation only bites media types; the others bite everywhere
            const type = preset === 'missingAnnotation' ? 'Foto' : 'Tekstuāls';
            const inventory = inventoryOf(type);
            const payload = buildItem(inventory, { preset }, createRng(preset));
            expect(validateItemPayload(payload, inventory).isValid).toBe(false);
        });
    });

    test('dates always stay inside the inventory period, whatever the indicator', () => {
        const inventory = inventoryOf('Tekstuāls', { start_date: '2011-03-15', end_date: '2012-08-20' });
        ['year', 'month', 'day'].forEach(indicator => {
            for (let i = 0; i < 30; i++) {
                const p = buildItem(inventory, { dateIndicator: indicator }, createRng(`${indicator}${i}`));
                expect(p.start_date >= inventory.start_date).toBe(true);
                expect(p.end_date <= inventory.end_date).toBe(true);
                expect(p.start_date <= p.end_date).toBe(true);
                expect(p.date_indicator).toBe(indicator);
            }
        });
    });

    test('year precision aligns to whole years, month precision to whole months', () => {
        const inventory = inventoryOf('Tekstuāls', { start_date: '2000-01-01', end_date: '2010-12-31' });
        const y = buildItem(inventory, { preset: 'yearPrecision' }, createRng(9));
        expect(y.start_date.slice(4)).toBe('-01-01');
        expect(y.end_date.slice(4)).toBe('-12-31');

        const m = buildItem(inventory, { preset: 'monthPrecision' }, createRng(9));
        expect(m.start_date.slice(8)).toBe('01');
        const [, mm, dd] = m.end_date.split('-').map(Number);
        expect([28, 29, 30, 31]).toContain(dd);
        expect(mm).toBeGreaterThanOrEqual(1);
    });
});

describe('buildItem - presets', () => {
    test('minimal Foto item has no language and no optional prose', () => {
        const p = buildItem(inventoryOf('Foto'), { preset: 'minimal' }, createRng(1));
        expect(p.language).toBe('');
        expect(p.notes).toBe('');
        expect(p.copy).toBe('');
        expect(p.annotation).not.toBe(''); // media: annotation is mandatory
    });

    test('minimal textual item still carries a language - the backend requires it', () => {
        const p = buildItem(inventoryOf('Tekstuāls'), { preset: 'minimal' }, createRng(1));
        expect(LANGUAGES).toContain(p.language);
        expect(p.annotation).toBe('');
    });

    test('full preset fills every optional field', () => {
        const p = buildItem(inventoryOf('Tekstuāls'), { preset: 'full' }, createRng(2));
        ['date_note', 'notes', 'annotation', 'sistematisation', 'copy', 'archival_history'].forEach(key => {
            expect(p[key]).not.toBe('');
        });
    });

    test('restricted preset pairs a non-default restriction with its mandatory note', () => {
        const p = buildItem(inventoryOf('Tekstuāls'), { preset: 'restricted' }, createRng(3));
        expect(['Ierobežota', 'Sensitīvi dati']).toContain(p.restriction);
        expect(p.restriction_note).not.toBe('');
    });

    test('classified preset raises the security level and adds a note', () => {
        const p = buildItem(inventoryOf('Tekstuāls'), { preset: 'classified' }, createRng(4));
        expect(p.security_level).not.toBe('Publisks');
        expect(p.security_level_note).not.toBe('');
    });

    test('multiLanguage joins languages with a comma, as the form does', () => {
        const p = buildItem(inventoryOf('Tekstuāls'), { preset: 'multiLanguage' }, createRng(5));
        expect(p.language.split(', ')).toHaveLength(2);
    });

    test('payload carries every field the create form sends', () => {
        const p = buildItem(inventoryOf('Video'), { preset: 'full' }, createRng(6));
        ['series_code', 'title', 'start_date', 'end_date', 'date_indicator', 'date_note', 'size', 'unit_of_measure',
            'notes', 'annotation', 'sistematisation', 'language', 'restriction', 'restriction_note', 'security_level',
            'security_level_note', 'copy', 'archival_history', 'related_item_list'].forEach(key => {
            expect(p).toHaveProperty(key);
        });
        expect(Array.isArray(p.related_item_list)).toBe(true);
    });

    test('relatedItemIds are passed through', () => {
        expect(buildItem(inventoryOf('Tekstuāls'), { relatedItemIds: [4, 5] }, createRng(1)).related_item_list).toEqual([4, 5]);
    });

    test('is reproducible for a seed', () => {
        const inv = inventoryOf('Skaņas');
        expect(buildItem(inv, { preset: 'full', sequence: 3 }, createRng('r')))
            .toEqual(buildItem(inv, { preset: 'full', sequence: 3 }, createRng('r')));
    });
});

describe('seriesCode', () => {
    test('always matches the backend regex', () => {
        const rng = createRng('sc');
        for (let i = 0; i < 200; i++) expect(seriesCode(rng)).toMatch(SERIES_CODE_REGEX);
    });
});

describe('itemPlan', () => {
    test('produces the requested count with unique, sequential titles', () => {
        const plan = itemPlan(inventoryOf('Tekstuāls'), 12, { startSequence: 5 }, createRng(1));
        expect(plan).toHaveLength(12);
        const titles = new Set(plan.map(p => p.title));
        expect(titles.size).toBe(12);
        expect(plan[0].title.endsWith('nr. 5')).toBe(true);
        expect(plan[11].title.endsWith('nr. 16')).toBe(true);
    });

    test('a fixed preset applies to every item', () => {
        itemPlan(inventoryOf('Tekstuāls'), 6, { preset: 'restricted' }, createRng(2))
            .forEach(p => expect(p.restriction).not.toBe('Vispārēja'));
    });

    test('the default mix produces more than one profile over a large plan', () => {
        const plan = itemPlan(inventoryOf('Tekstuāls'), 60, {}, createRng(3));
        const restricted = plan.filter(p => p.restriction !== 'Vispārēja').length;
        const classified = plan.filter(p => p.security_level !== 'Publisks').length;
        const full = plan.filter(p => p.copy !== '').length;
        expect(restricted + classified + full).toBeGreaterThan(0);
        expect(plan.length - restricted - classified - full).toBeGreaterThan(0);
        expect(Object.keys(DEFAULT_ITEM_MIX)).toContain('minimal');
    });

    test('every planned item is valid for its inventory', () => {
        INVENTORY_TYPES.forEach(type => {
            const inventory = inventoryOf(type);
            itemPlan(inventory, 25, {}, createRng(type)).forEach(p => {
                expect(validateItemPayload(p, inventory).isValid).toBe(true);
            });
        });
    });
});

describe('describeItem', () => {
    test('mentions code, title, dates and non-default flags', () => {
        const text = describeItem({ series_code: '1.2', title: 'X', start_date: '2001-01-01', end_date: '2001-12-31', date_indicator: 'year', restriction: 'Ierobežota', security_level: 'Slepens', language: 'latviešu' });
        expect(text).toContain('1.2');
        expect(text).toContain('Ierobežota');
        expect(text).toContain('Slepens');
    });
});
