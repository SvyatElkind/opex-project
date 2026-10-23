import { getRecordCreatePayload, validateTextRecordCreate } from './recordConstants';

// Pieteikums Nr. 12: required document fields are title, date, language,
// reg_nr and nomenclature_nr. created_date / sent_date are optional, and DRF
// rejects '' for a DateField, so an empty one must go out as null.
describe('getRecordCreatePayload', () => {
    it('sends empty optional dates as null, not an empty string', () => {
        const payload = getRecordCreatePayload({ title: 'x', date: '2020-01-01' });
        expect(payload.created_date).toBeNull();
        expect(payload.sent_date).toBeNull();
    });

    it('keeps filled optional dates', () => {
        const payload = getRecordCreatePayload({ created_date: '2020-01-02', sent_date: '2020-01-03' });
        expect(payload.created_date).toBe('2020-01-02');
        expect(payload.sent_date).toBe('2020-01-03');
    });
});

describe('validateTextRecordCreate', () => {
    const valid = {
        title: 'x', date: '2020-01-01', language: 'Latviešu',
        reg_nr: '1/2020', nomenclature_nr: '1-1', access_restriction: 'open',
    };

    it('accepts a document with only the required fields filled', () => {
        expect(validateTextRecordCreate(valid, null).isValid).toBe(true);
    });

    it.each(['title', 'date', 'language', 'reg_nr', 'nomenclature_nr'])('requires %s', (field) => {
        const result = validateTextRecordCreate({ ...valid, [field]: '' }, null);
        expect(result.isValid).toBe(false);
        expect(result.errors[field]).toBeTruthy();
    });
});
