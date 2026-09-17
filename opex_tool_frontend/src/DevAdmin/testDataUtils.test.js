import {
    pick, randInt, pad, randomDate, randomPerson, randomItemName, generateSeriesCode,
    buildVisa, buildAddressee, buildAction, buildReadStatus,
    generateMetadataForRecord, metadataSummary, metadataTotal,
    ITEM_TYPE_NAMES, LANGUAGES,
} from './testDataUtils';
import { SERIES_CODE_REGEX } from '../Constants/itemConstants';

describe('primitives', () => {
    test('pick returns a member, randInt stays in range, pad zero-fills', () => {
        const pool = ['a', 'b', 'c'];
        for (let i = 0; i < 50; i++) expect(pool).toContain(pick(pool));
        for (let i = 0; i < 200; i++) {
            const n = randInt(2, 5);
            expect(n).toBeGreaterThanOrEqual(2);
            expect(n).toBeLessThanOrEqual(5);
        }
        expect(pad(3)).toBe('03');
        expect(pad(12)).toBe('12');
    });

    test('randomDate yields an ISO date inside the window', () => {
        const start = new Date('2020-01-01');
        const end = new Date('2020-01-31');
        for (let i = 0; i < 50; i++) {
            const d = randomDate(start, end);
            expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(d >= '2020-01-01' && d <= '2020-01-31').toBe(true);
        }
    });

    test('randomPerson is "First Last" without diacritics (puppet-typeable)', () => {
        for (let i = 0; i < 30; i++) {
            const name = randomPerson();
            expect(name).toMatch(/^[A-Za-z]+ [A-Za-z]+$/);
        }
    });

    test('randomItemName draws from the type pool and falls back to textual', () => {
        expect(ITEM_TYPE_NAMES.Foto).toContain(randomItemName('Foto'));
        expect(ITEM_TYPE_NAMES.Tekstuals).toContain(randomItemName('unknown-type'));
        expect(LANGUAGES.length).toBeGreaterThan(0);
    });

    test('generateSeriesCode always satisfies the backend regex', () => {
        for (let i = 0; i < 300; i++) expect(generateSeriesCode()).toMatch(SERIES_CODE_REGEX);
    });
});

describe('metadata builders', () => {
    test('buildVisa / buildReadStatus carry person, date and a note', () => {
        expect(buildVisa('2020-05-05')).toMatchObject({ person: expect.any(String), date: '2020-05-05', notes: expect.any(String) });
        expect(buildReadStatus('2020-05-05')).toMatchObject({ person: expect.any(String), date: '2020-05-05', notes: expect.any(String) });
    });

    test('buildAddressee picks a department', () => {
        expect(buildAddressee().addressee.length).toBeGreaterThan(3);
    });

    test('buildAction sets a due date 1-30 days after creation', () => {
        for (let i = 0; i < 30; i++) {
            const a = buildAction('2020-05-05');
            expect(a.created_date).toBe('2020-05-05');
            const days = Math.round((new Date(a.due_date) - new Date('2020-05-05')) / 86400000);
            expect(days).toBeGreaterThanOrEqual(1);
            expect(days).toBeLessThanOrEqual(30);
            expect(a.notes).toBe('');
        }
    });
});

describe('generateMetadataForRecord', () => {
    test('counts successes per class, failures overall, and passes the singular API class', async () => {
        const calls = [];
        const addFn = jest.fn(async (projectId, recordId, payload, cls) => {
            calls.push(cls);
            return [cls !== 'action', payload]; // every action "fails"
        });

        const { created, failed } = await generateMetadataForRecord(addFn, 1, 2, '2020-01-01');

        const perClass = (c) => calls.filter(x => x === c).length;
        expect(created.visas).toBe(perClass('visa'));
        expect(created.addressees).toBe(perClass('addressee'));
        expect(created.read_statuses).toBe(perClass('read_status'));
        expect(created.actions).toBe(0);
        expect(failed).toBe(perClass('action'));
        expect(metadataTotal(created)).toBe(calls.length - failed);
        calls.forEach(c => expect(['visa', 'addressee', 'action', 'read_status']).toContain(c));
    });

    test('a throwing addFn counts as a failure instead of aborting', async () => {
        const addFn = jest.fn(async () => { throw new Error('offline'); });
        const { created, failed } = await generateMetadataForRecord(addFn, 1, 2, '2020-01-01');
        expect(metadataTotal(created)).toBe(0);
        expect(failed).toBe(addFn.mock.calls.length);
    });

    test('metadataSummary reads naturally', () => {
        expect(metadataSummary({ visas: 1, addressees: 2, actions: 3, read_statuses: 4 }))
            .toBe('1 vizas, 2 adresati, 3 uzdevumi, 4 iepazisanas');
    });
});
