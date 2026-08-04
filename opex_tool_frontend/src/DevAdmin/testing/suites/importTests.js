/**
 * CSV / Excel Import Tests (experimental feature)
 *
 * The import's parser and mapper are pure functions, which is where the real
 * risk lives — a misread delimiter or date silently produces wrong archival
 * descriptions. Covered here:
 * - CSV grammar: delimiters, quotes, embedded newlines, CRLF, blank rows
 * - encoding detection: BOM, strict UTF-8, windows-1257 fallback
 * - header matching: case, spaces, missing diacritics, unknown columns
 * - date formats, including year/month precision snapping
 * - row typing (GV/DOK) and SAITE parent resolution
 * - enum mapping (Ierobežota → closed) and its cross-field rules
 * - payload shape (no nulls in text fields)
 */

import { decodeBytes, parseCsv, sniffDelimiter } from '../../../Utils/csvParser';
import {
    buildHeaderMap,
    buildItemPayload,
    buildRecordPayload,
    findHeaderRow,
    mapImportRows,
    parseImportDate,
} from '../../../Utils/importMapper';
import { ROW_TYPE, findColumn, normaliseHeader, parseRowType } from '../../../Constants/importConstants';

const importTests = ({ describe, it, expect }) => {

    const inventory = { id: 7, number: 5, electronic: true, type: 'Tekstuāls', end_date: '2020-12-31' };
    const existingItems = [
        { id: 101, number: 12, start_date: '2020-01-01', end_date: '2020-12-31' },
        { id: 102, number: 13, start_date: '2020-01-01', end_date: '2020-12-31' },
    ];

    const encode = (text) => new TextEncoder().encode(text).buffer;

    // ═══════════════════════════════════════════════════════════════════════════
    // CSV GRAMMAR
    // ═══════════════════════════════════════════════════════════════════════════

    describe('CSV parsing', () => {
        it('splits on the given delimiter', () => {
            expect(parseCsv('a;b;c', ';')).toEqual([['a', 'b', 'c']]);
        });

        it('keeps a delimiter that sits inside quotes', () => {
            const rows = parseCsv('"Latviešu; Krievu";x', ';');
            expect(rows[0][0]).toBe('Latviešu; Krievu');
            expect(rows[0][1]).toBe('x');
        });

        it('unescapes doubled quotes', () => {
            expect(parseCsv('"say ""hi""";b', ';')[0][0]).toBe('say "hi"');
        });

        it('allows a newline inside a quoted field', () => {
            const rows = parseCsv('"line1\nline2";b', ';');
            expect(rows).toHaveLength(1);
            expect(rows[0][0]).toBe('line1\nline2');
        });

        it('handles CRLF and LF alike', () => {
            expect(parseCsv('a;b\r\nc;d', ';')).toHaveLength(2);
            expect(parseCsv('a;b\nc;d', ';')).toHaveLength(2);
        });

        it('drops entirely empty rows, including a trailing newline', () => {
            expect(parseCsv('a;b\n\n;\nc;d\n', ';')).toHaveLength(2);
        });

        it('keeps a row whose first cell is empty', () => {
            expect(parseCsv(';b;c', ';')[0]).toEqual(['', 'b', 'c']);
        });
    });

    describe('Delimiter sniffing', () => {
        it('detects semicolons (what Latvian Excel writes)', () => {
            expect(sniffDelimiter('TIPS;NOSAUKUMS;DATUMS')).toBe(';');
        });

        it('detects commas', () => {
            expect(sniffDelimiter('TIPS,NOSAUKUMS,DATUMS')).toBe(',');
        });

        it('detects tabs', () => {
            expect(sniffDelimiter('TIPS\tNOSAUKUMS\tDATUMS')).toBe('\t');
        });

        it('ignores delimiters inside quotes when counting', () => {
            expect(sniffDelimiter('"a,b,c,d";x')).toBe(';');
        });

        it('skips leading blank lines', () => {
            expect(sniffDelimiter('\n\nTIPS;A;B')).toBe(';');
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ENCODING — the most common real-world failure
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Encoding detection', () => {
        it('strips a UTF-8 BOM', () => {
            const bytes = new Uint8Array([0xEF, 0xBB, 0xBF, 0x41, 0x42]);
            const result = decodeBytes(bytes.buffer);
            expect(result.text).toBe('AB');
            expect(result.encoding).toBe('UTF-8 (BOM)');
        });

        it('reads plain UTF-8 with diacritics', () => {
            const result = decodeBytes(encode('Sēžu protokoli; Latviešu'));
            expect(result.text).toBe('Sēžu protokoli; Latviešu');
            expect(result.guessed).toBeFalsy();
        });

        it('falls back to windows-1257 for legacy Excel CSV', () => {
            // 0xE7 alone is not valid UTF-8; in windows-1257 it is 'ē'.
            const bytes = new Uint8Array([0x53, 0xE7, 0x7A, 0x75]); // S ē z u
            const result = decodeBytes(bytes.buffer);
            expect(result.encoding).toBe('windows-1257');
            expect(result.guessed).toBeTruthy();
            expect(result.text).toBe('Sēzu');
        });

        it('reports the guess so the UI can warn about mojibake', () => {
            const bytes = new Uint8Array([0xFE]);
            expect(decodeBytes(bytes.buffer).guessed).toBeTruthy();
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // HEADERS
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Header matching', () => {
        it('normalises case, spaces and diacritics', () => {
            expect(normaliseHeader('Sērijas kods')).toBe('SERIJAS_KODS');
            expect(normaliseHeader('  reģ. nr  ')).toBe('REG_NR');
        });

        it('matches a header written without diacritics', () => {
            expect(findColumn('SERIJAS_KODS').canonical).toBe('SĒRIJAS_KODS');
            expect(findColumn('Datums līdz').canonical).toBe('DATUMS_LĪDZ');
        });

        it('matches documented aliases', () => {
            expect(findColumn('NOMENKLATŪRAS_NR').canonical).toBe('LIETAS_NR');
        });

        it('returns null for an unknown header', () => {
            expect(findColumn('PIEVIENOTĀ DATNE')).toBeNull();
        });

        it('finds the header row even with a title row above it', () => {
            const rows = [
                ['Uzskaites saraksta apraksti', '', ''],
                ['TIPS', 'NOSAUKUMS', 'DATUMS_NO'],
                ['GV', 'x', '2020'],
            ];
            expect(findHeaderRow(rows)).toBe(1);
        });

        it('reports unknown columns instead of failing', () => {
            const map = buildHeaderMap(['TIPS', 'NOSAUKUMS', 'KAS_TAS_IR']);
            expect(map.unknown).toHaveLength(1);
            expect(map.unknown[0].name).toBe('KAS_TAS_IR');
        });

        it('honours a manual column assignment', () => {
            const map = buildHeaderMap(['TIPS', 'VIRSRAKSTS'], { 1: 'NOSAUKUMS' });
            expect(map.unknown).toHaveLength(0);
            expect(map.columns[1].canonical).toBe('NOSAUKUMS');
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // DATES
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Date parsing', () => {
        it('reads ISO dates (also what the xlsx reader emits)', () => {
            expect(parseImportDate('2020-01-15').value).toBe('2020-01-15');
        });

        it('reads Latvian dotted dates', () => {
            expect(parseImportDate('15.01.2020').value).toBe('2020-01-15');
        });

        it('reads slashed dates', () => {
            expect(parseImportDate('15/01/2020').value).toBe('2020-01-15');
        });

        it('pads single-digit day and month', () => {
            expect(parseImportDate('5.3.2020').value).toBe('2020-03-05');
        });

        it('snaps a year to 1 January or 31 December', () => {
            expect(parseImportDate('2020', 'start').value).toBe('2020-01-01');
            expect(parseImportDate('2020', 'end').value).toBe('2020-12-31');
        });

        it('snaps a month to its first or last day', () => {
            expect(parseImportDate('02.2020', 'start').value).toBe('2020-02-01');
            expect(parseImportDate('02.2020', 'end').value).toBe('2020-02-29'); // leap year
            expect(parseImportDate('2020-04', 'end').value).toBe('2020-04-30');
        });

        it('reports the precision it read', () => {
            expect(parseImportDate('2020').precision).toBe('year');
            expect(parseImportDate('01.2020').precision).toBe('month');
            expect(parseImportDate('01.01.2020').precision).toBe('day');
        });

        it('rejects nonsense instead of guessing', () => {
            expect(parseImportDate('rīt')).toBeNull();
            expect(parseImportDate('32.01.2020')).toBeNull();
            expect(parseImportDate('15.13.2020')).toBeNull();
            expect(parseImportDate('')).toBeNull();
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ROW TYPES AND PARENT RESOLUTION
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Row typing', () => {
        it('accepts GV/DOK and their aliases, any case', () => {
            expect(parseRowType('GV')).toBe(ROW_TYPE.ITEM);
            expect(parseRowType('gv')).toBe(ROW_TYPE.ITEM);
            expect(parseRowType('item')).toBe(ROW_TYPE.ITEM);
            expect(parseRowType('DOK')).toBe(ROW_TYPE.RECORD);
            expect(parseRowType('Dokuments')).toBe(ROW_TYPE.RECORD);
        });

        it('returns null for an unknown type', () => {
            expect(parseRowType('XYZ')).toBeNull();
        });
    });

    const HEADER = [
        'TIPS', 'SAITE', 'SĒRIJAS_KODS', 'NOSAUKUMS', 'DATUMS_NO', 'DATUMS_LĪDZ', 'VALODA',
        'DATUMS', 'REĢ_NR', 'IZVEIDOŠANAS_DATUMS', 'NOSŪTĪŠANAS_DATUMS', 'LIETAS_NR', 'PIEEJAMĪBA',
        'IEROBEŽOJUMA_DATUMS',
    ];

    const itemRow = (key, title) =>
        ['GV', key, '1.2', title, '01.01.2020', '31.12.2020', 'Latviešu', '', '', '', '', '', '', ''];
    const recordRow = (link, title, overrides = {}) => [
        'DOK', link, '', title, '', '', 'Latviešu',
        overrides.date || '15.01.2020', overrides.reg_nr || '1-15/1',
        '15.01.2020', '16.01.2020', '1-15',
        overrides.access || '', overrides.restrictionDate || '',
    ];

    const mapRows = (rows, options = {}) => mapImportRows({
        rows: [HEADER, ...rows], inventory, existingItems, ...options,
    });

    describe('Parent resolution (SAITE)', () => {
        it('links a record to the item row above it when SAITE is empty', () => {
            const result = mapRows([itemRow('', 'Lieta A'), recordRow('', 'Dok 1')]);
            const record = result.entries[1];
            expect(record.parent.kind).toBe('new');
            expect(record.parent.rowNumber).toBe(2);
            expect(record.ok).toBeTruthy();
        });

        it('links by key regardless of row order distance', () => {
            const result = mapRows([
                itemRow('A', 'Lieta A'),
                itemRow('B', 'Lieta B'),
                recordRow('A', 'Dok pie A'),
            ]);
            expect(result.entries[2].parent.rowNumber).toBe(2);
        });

        it('links to an existing item with GV:12', () => {
            const result = mapRows([recordRow('GV:12', 'Dok')]);
            expect(result.entries[0].parent.kind).toBe('existing');
            expect(result.entries[0].parent.item.id).toBe(101);
        });

        it('fails clearly when GV:<nr> does not exist', () => {
            const result = mapRows([recordRow('GV:999', 'Dok')]);
            expect(result.entries[0].ok).toBeFalsy();
            expect(result.entries[0].message).toContain('999');
        });

        it('fails clearly when a key was never declared', () => {
            const result = mapRows([recordRow('Z', 'Dok')]);
            expect(result.entries[0].ok).toBeFalsy();
        });

        it('rejects a duplicate key rather than linking to the wrong item', () => {
            const result = mapRows([itemRow('A', 'Pirmā'), itemRow('A', 'Otrā')]);
            expect(result.entries[0].ok).toBeTruthy();
            expect(result.entries[1].ok).toBeFalsy();
        });

        it('fails a record with no item above it and no SAITE', () => {
            const result = mapRows([recordRow('', 'Bezvecāka')]);
            expect(result.entries[0].ok).toBeFalsy();
        });

        it('single-item mode attaches every row to that item and ignores TIPS', () => {
            const item = { id: 55, number: 3, start_date: '2020-01-01', end_date: '2020-12-31' };
            const result = mapRows([recordRow('', 'Dok 1'), recordRow('', 'Dok 2')], { item });
            expect(result.recordCount).toBe(2);
            expect(result.entries[0].parent.kind).toBe('current');
            expect(result.entries[0].parent.item.id).toBe(55);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // VALIDATION AND VALUE MAPPING
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Validation during mapping', () => {
        it('accepts a well-formed items+records file', () => {
            const result = mapRows([itemRow('A', 'Lieta A'), recordRow('A', 'Dok 1')]);
            expect(result.itemCount).toBe(1);
            expect(result.recordCount).toBe(1);
            expect(result.validCount).toBe(2);
        });

        it('rejects a record dated outside its parent item range', () => {
            const result = mapRows([
                ['GV', 'A', '1.2', 'Lieta', '01.01.2020', '31.03.2020', 'Latviešu', '', '', '', '', '', '', ''],
                recordRow('A', 'Vēlāks dok', { date: '15.09.2020' }),
            ]);
            expect(result.entries[0].ok).toBeTruthy();
            expect(result.entries[1].ok).toBeFalsy();
        });

        it('rejects an item whose series code breaks the format', () => {
            const rows = [['GV', '', '01', 'Lieta', '01.01.2020', '31.12.2020', 'Latviešu', '', '', '', '', '', '', '']];
            expect(mapRows(rows).entries[0].ok).toBeFalsy();
        });

        it('flags a row with no type', () => {
            const rows = [['', '', '1.2', 'Lieta', '01.01.2020', '31.12.2020', 'Latviešu', '', '', '', '', '', '', '']];
            expect(mapRows(rows).entries[0].ok).toBeFalsy();
        });

        it('flags a bad date value with the column name', () => {
            const rows = [['GV', '', '1.2', 'Lieta', 'vakar', '31.12.2020', 'Latviešu', '', '', '', '', '', '', '']];
            const entry = mapRows(rows).entries[0];
            expect(entry.ok).toBeFalsy();
            expect(entry.message).toContain('DATUMS_NO');
        });

        it('maps Ierobežota to closed and keeps the restriction date', () => {
            const rows = [recordRow('GV:12', 'Dok', { access: 'Ierobežota', restrictionDate: '31.12.2100' })];
            const entry = mapRows(rows).entries[0];
            expect(entry.payload.access_restriction).toBe('closed');
            expect(entry.payload.access_restriction_date).toBe('2100-12-31');
            expect(entry.ok).toBeTruthy();
        });

        it('rejects Ierobežota without a restriction date', () => {
            const rows = [recordRow('GV:12', 'Dok', { access: 'Ierobežota' })];
            expect(mapRows(rows).entries[0].ok).toBeFalsy();
        });

        it('rejects Vispārēja combined with a restriction date', () => {
            const rows = [recordRow('GV:12', 'Dok', { access: 'Vispārēja', restrictionDate: '31.12.2100' })];
            expect(mapRows(rows).entries[0].ok).toBeFalsy();
        });

        it('rejects an unknown enum value and lists what is allowed', () => {
            const rows = [recordRow('GV:12', 'Dok', { access: 'varbūt' })];
            const entry = mapRows(rows).entries[0];
            expect(entry.ok).toBeFalsy();
            expect(entry.message).toContain('PIEEJAMĪBA');
        });

        it('skips record rows when the inventory cannot hold records', () => {
            const result = mapRows([itemRow('A', 'Lieta'), recordRow('A', 'Dok')], { recordsAllowed: false });
            expect(result.itemCount).toBe(1);
            expect(result.recordCount).toBe(0);
            expect(result.entries[1].ok).toBeFalsy();
        });

        it('reports missing required columns for the types present', () => {
            const header = ['TIPS', 'NOSAUKUMS'];
            const result = mapImportRows({
                rows: [header, ['GV', 'Lieta']], inventory, existingItems,
            });
            expect(result.missingForItems).toContain('SĒRIJAS_KODS');
            expect(result.missingForItems).toContain('DATUMS_NO');
        });

        it('returns nothing usable when there is no header row', () => {
            const result = mapImportRows({ rows: [['x', 'y'], ['1', '2']], inventory });
            expect(result.headerRowIndex).toBe(-1);
            expect(result.entries).toHaveLength(0);
        });
    });

    describe('Value mapping details', () => {
        it('joins a multi-value language cell', () => {
            const rows = [['GV', '', '1.2', 'Lieta', '01.01.2020', '31.12.2020', 'Latviešu; Krievu', '', '', '', '', '', '', '']];
            expect(mapRows(rows).entries[0].payload.language).toBe('Latviešu, Krievu');
        });

        it('derives date precision from a year-only date', () => {
            const rows = [['GV', '', '1.2', 'Lieta', '2020', '2020', 'Latviešu', '', '', '', '', '', '', '']];
            const payload = mapRows(rows).entries[0].payload;
            expect(payload.date_indicator).toBe('year');
            expect(payload.start_date).toBe('2020-01-01');
            expect(payload.end_date).toBe('2020-12-31');
        });

        it('lets an explicit precision column win', () => {
            const header = [...HEADER, 'DATUMA_PRECIZITĀTE'];
            const row = ['GV', '', '1.2', 'Lieta', '2020', '2020', 'Latviešu', '', '', '', '', '', '', '', 'diena'];
            const result = mapImportRows({ rows: [header, row], inventory, existingItems });
            expect(result.entries[0].payload.date_indicator).toBe('day');
        });

        it('item payload always carries related_item_list and inventory', () => {
            const payload = buildItemPayload({ title: 'x' }, inventory);
            expect(payload.related_item_list).toEqual([]);
            expect(payload.inventory).toBe(5);
        });

        it('record payload uses empty strings, never null, for blank text', () => {
            const payload = buildRecordPayload({ title: 'x', date: '2020-01-01' });
            expect(payload.annotation).toBe('');
            expect(payload.group).toBe('');
            expect(payload.access_restriction).toBe('open');
            expect(payload.access_restriction_date).toBeNull();
        });

        it('ignores item-only columns on record rows and vice versa', () => {
            const rows = [itemRow('A', 'Lieta'), recordRow('A', 'Dok')];
            const record = mapRows(rows).entries[1];
            expect(record.payload.series_code).toBe(undefined);
            expect(record.payload.title).toBe('Dok');
        });

        it('numbers file rows the way a spreadsheet shows them', () => {
            const result = mapRows([itemRow('A', 'Pirmā'), itemRow('B', 'Otrā')]);
            expect(result.entries[0].rowNumber).toBe(2);
            expect(result.entries[1].rowNumber).toBe(3);
        });
    });
};

export default importTests;
