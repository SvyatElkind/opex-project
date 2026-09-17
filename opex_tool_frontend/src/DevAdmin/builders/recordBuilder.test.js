import { createRng } from './rng';
import {
    RECORD_PRESETS, COLORS, METADATA_CLASSES, DEFAULT_METADATA_COUNTS,
    buildTextRecord, buildMetadataSet, buildMediaRecordUpdate, recordPlan,
    validateTextRecordPayload, describeRecord, duration, metadataTotal,
} from './recordBuilder';
import { DURATION_REGEX as RECORD_DURATION_REGEX } from '../../Constants/recordConstants';
import { DURATION_REGEX as ITEM_DURATION_REGEX } from '../../Constants/itemConstants';

const item = { id: 10, number: 3, start_date: '2015-02-01', end_date: '2016-11-30' };

const positivePresets = Object.entries(RECORD_PRESETS).filter(([, p]) => !p.negative).map(([id]) => id);
const negativePresets = Object.entries(RECORD_PRESETS).filter(([, p]) => p.negative).map(([id]) => id);

describe('buildTextRecord', () => {
    test.each(positivePresets)('preset "%s" passes validateTextRecordCreate', (preset) => {
        for (let i = 0; i < 15; i++) {
            const payload = buildTextRecord(item, { preset, sequence: i }, createRng(`${preset}${i}`));
            const result = validateTextRecordPayload(payload, item);
            expect(result.errors).toEqual({});
            expect(result.isValid).toBe(true);
            expect(payload.date >= item.start_date && payload.date <= item.end_date).toBe(true);
        }
    });

    test.each(negativePresets)('negative preset "%s" fails validation', (preset) => {
        const payload = buildTextRecord(item, { preset }, createRng(preset));
        expect(validateTextRecordPayload(payload, item).isValid).toBe(false);
    });

    test('no CharField is ever null - only access_restriction_date may be', () => {
        const payload = buildTextRecord(item, { preset: 'minimal' }, createRng(1));
        Object.entries(payload).forEach(([key, value]) => {
            if (key === 'access_restriction_date') return;
            expect(value).not.toBeNull();
            expect(typeof value).toBe('string');
        });
        expect(payload.access_restriction_date).toBeNull();
    });

    test('closed preset carries a restriction date and notes', () => {
        const p = buildTextRecord(item, { preset: 'closed' }, createRng(2));
        expect(p.access_restriction).toBe('closed');
        expect(p.access_restriction_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(p.access_restriction_date > p.date).toBe(true);
        expect(p.access_restriction_notes).not.toBe('');
    });

    test('full preset fills the optional prose fields', () => {
        const p = buildTextRecord(item, { preset: 'full' }, createRng(3));
        ['annotation', 'key_words', 'sent_reg_nr', 'group', 'notes', 'tech_info'].forEach(key => expect(p[key]).not.toBe(''));
    });

    test('minimal preset leaves the optional prose empty', () => {
        const p = buildTextRecord(item, { preset: 'minimal' }, createRng(3));
        ['annotation', 'key_words', 'sent_reg_nr', 'group', 'notes', 'tech_info'].forEach(key => expect(p[key]).toBe(''));
    });

    test('an explicit date wins over the random one', () => {
        expect(buildTextRecord(item, { date: '2016-01-15' }, createRng(1)).date).toBe('2016-01-15');
    });

    test('is reproducible for a seed', () => {
        expect(buildTextRecord(item, { preset: 'full', sequence: 1 }, createRng('r')))
            .toEqual(buildTextRecord(item, { preset: 'full', sequence: 1 }, createRng('r')));
    });
});

describe('buildMetadataSet', () => {
    test('produces exactly the requested counts per class', () => {
        const set = buildMetadataSet({ date: '2016-05-05' }, { visa: 2, addressee: 0, action: 3, read_status: 1 }, createRng(1));
        expect(set.visa).toHaveLength(2);
        expect(set.addressee).toHaveLength(0);
        expect(set.action).toHaveLength(3);
        expect(set.read_status).toHaveLength(1);
        expect(metadataTotal(set)).toBe(6);
    });

    test('defaults to one of each class', () => {
        const set = buildMetadataSet({ date: '2016-05-05' }, DEFAULT_METADATA_COUNTS, createRng(1));
        METADATA_CLASSES.forEach(cls => expect(set[cls]).toHaveLength(1));
    });

    test('payloads carry the fields each backend serializer requires', () => {
        const set = buildMetadataSet({ date: '2016-05-05' }, undefined, createRng(2));
        expect(set.visa[0]).toMatchObject({ person: expect.any(String), date: expect.any(String), notes: expect.any(String) });
        expect(set.addressee[0]).toMatchObject({ addressee: expect.any(String) });
        expect(set.action[0]).toMatchObject({
            author: expect.any(String), responsible_person: expect.any(String), task: expect.any(String),
            due_date: expect.any(String), created_date: '2016-05-05', notes: '',
        });
        expect(set.action[0].due_date > set.action[0].created_date).toBe(true);
        expect(set.read_status[0]).toMatchObject({ person: expect.any(String), date: expect.any(String) });
    });

    test('tolerates a missing record date and negative counts', () => {
        const set = buildMetadataSet(null, { visa: -3 }, createRng(1));
        expect(set.visa).toHaveLength(0);
        expect(metadataTotal(set)).toBe(0);
        expect(metadataTotal(null)).toBe(0);
    });
});

describe('buildMediaRecordUpdate', () => {
    test('Foto: colour + resolution, no duration', () => {
        const p = buildMediaRecordUpdate('Foto', {}, createRng(1));
        expect(COLORS).toContain(p.color);
        expect(Number.isInteger(p.horizontal_resolution)).toBe(true);
        expect(Number.isInteger(p.vertical_resolution)).toBe(true);
        expect(p).not.toHaveProperty('duration');
    });

    test('Video: colour + duration + resolution', () => {
        const p = buildMediaRecordUpdate('Video', {}, createRng(1));
        expect(COLORS).toContain(p.color);
        expect(p.duration).toMatch(RECORD_DURATION_REGEX);
        expect(p.horizontal_resolution).toBeGreaterThan(0);
    });

    test('Skaņas: duration only', () => {
        const p = buildMediaRecordUpdate('Skaņas', {}, createRng(1));
        expect(Object.keys(p)).toEqual(['duration']);
    });

    test('unknown type yields null', () => {
        expect(buildMediaRecordUpdate('Tekstuāls', {}, createRng(1))).toBeNull();
    });

    test('duration satisfies both the record and the item regex', () => {
        const rng = createRng('dur');
        for (let i = 0; i < 100; i++) {
            const d = duration(rng);
            expect(d).toMatch(RECORD_DURATION_REGEX);
            expect(d).toMatch(ITEM_DURATION_REGEX);
        }
    });
});

describe('recordPlan', () => {
    test('produces the requested count, all valid, with unique titles', () => {
        const plan = recordPlan(item, 15, {}, createRng(1));
        expect(plan).toHaveLength(15);
        expect(new Set(plan.map(p => p.title)).size).toBe(15);
        plan.forEach(p => expect(validateTextRecordPayload(p, item).isValid).toBe(true));
    });

    test('a fixed preset applies to every record', () => {
        recordPlan(item, 5, { preset: 'closed' }, createRng(2)).forEach(p => expect(p.access_restriction).toBe('closed'));
    });
});

describe('describeRecord', () => {
    test('mentions reg nr, date and restriction', () => {
        const text = describeRecord({ reg_nr: '12-3/2016', title: 'T', date: '2016-01-01', access_restriction: 'closed', access_restriction_date: '2030-01-01' });
        expect(text).toContain('12-3/2016');
        expect(text).toContain('closed');
        expect(text).toContain('2030-01-01');
    });
});
