import { toRecordTab } from './Record';

// Item.js passes its own view ('records' / 'overview') in the shared tab slot
// when opening a record; Record used to adopt it and render an empty page.
describe('toRecordTab', () => {
    it('keeps tabs the record page has', () => {
        expect(toRecordTab('info', false)).toBe('info');
        expect(toRecordTab('metadata', false)).toBe('metadata');
        expect(toRecordTab('files', true)).toBe('files');
    });

    it('rejects Item view names so the page falls back to "info"', () => {
        expect(toRecordTab('records', false)).toBeNull();
        expect(toRecordTab('overview', false)).toBeNull();
        expect(toRecordTab(null, false)).toBeNull();
    });

    it('rejects "metadata" for media records, which have no such tab', () => {
        expect(toRecordTab('metadata', true)).toBeNull();
    });
});
