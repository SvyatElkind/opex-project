/**
 * Bulk Operation Tests
 *
 * Covers the logic behind multi create / multi edit (bulkConstants.js):
 * - shared vs mixed value detection
 * - override building per entity (replace / append / clear modes)
 * - the safety rule that unticked fields are never written
 * - required-but-empty detection before anything is sent
 * - cross-field rules (record open ⇒ no restriction date)
 * - paste parsing, pattern expansion, file name → title
 * - full-payload rebuilding (the reason bulk edit is safe at all)
 */

import {
  BULK_MODES,
  MIXED,
  applyDescriptor,
  buildOverrides,
  commonValue,
  countAffected,
  descriptorKeys,
  expandPattern,
  fileNameToTitle,
  findEmptyRequiredFields,
  flattenFields,
  getItemBulkFields,
  getRecordBulkFields,
  languageToTags,
  parsePastedRows,
} from '../../../Constants/bulkConstants';

import { getItemUpdatePayload } from '../../../Constants/itemConstants';
import { getRecordCreatePayload } from '../../../Constants/recordConstants';

const bulkOperationTests = ({ describe, it, expect }) => {

  const inventory = { id: 1, number: 5, electronic: true, type: 'Tekstuāls', end_date: '2020-12-31' };

  const itemA = {
    id: 1, number: 3, series_code: '1.2', title: 'A', language: 'Latviešu',
    notes: 'Piezīme A', restriction: 'Vispārēja', start_date: '2020-01-01', end_date: '2020-06-30',
    related_item: [7, 8],
  };
  const itemB = {
    id: 2, number: 4, series_code: '1.2', title: 'B', language: 'Krievu',
    notes: '', restriction: 'Vispārēja', start_date: '2020-01-01', end_date: '2020-06-30',
    related_item: [],
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MIXED VALUE DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Shared vs mixed values', () => {
    it('reports the shared value when every entity agrees', () => {
      expect(commonValue([itemA, itemB], 'series_code')).toBe('1.2');
    });

    it('reports MIXED when entities differ', () => {
      expect(commonValue([itemA, itemB], 'language')).toBe(MIXED);
    });

    it('treats null and empty string as the same value', () => {
      const withNull = { notes: null };
      const withEmpty = { notes: '' };
      expect(commonValue([withNull, withEmpty], 'notes')).toBe('');
    });

    it('returns empty string for an empty selection', () => {
      expect(commonValue([], 'notes')).toBe('');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // OVERRIDE BUILDING — THE SAFETY MODEL
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Override building', () => {
    const fields = getItemBulkFields(inventory);

    it('writes nothing when no field is ticked', () => {
      const overrides = buildOverrides(fields, itemA, { notes: 'X' }, {}, new Set());
      expect(Object.keys(overrides)).toHaveLength(0);
    });

    it('writes only the ticked field', () => {
      const overrides = buildOverrides(fields, itemA, { notes: 'Jauns' }, {}, new Set(['notes']));
      expect(overrides.notes).toBe('Jauns');
      expect(overrides.series_code).toBe(undefined);
    });

    it('replace mode overwrites the entity value', () => {
      const overrides = buildOverrides(
        fields, itemA, { notes: 'Jauns' }, { notes: BULK_MODES.REPLACE }, new Set(['notes'])
      );
      expect(overrides.notes).toBe('Jauns');
    });

    it('append mode keeps the entity value and adds to it', () => {
      const overrides = buildOverrides(
        fields, itemA, { notes: 'Papildus' }, { notes: BULK_MODES.APPEND }, new Set(['notes'])
      );
      expect(overrides.notes).toBe('Piezīme A\nPapildus');
    });

    it('append mode on an empty entity value does not add a separator', () => {
      const overrides = buildOverrides(
        fields, itemB, { notes: 'Papildus' }, { notes: BULK_MODES.APPEND }, new Set(['notes'])
      );
      expect(overrides.notes).toBe('Papildus');
    });

    it('clear mode writes an empty string, never null', () => {
      const overrides = buildOverrides(
        fields, itemA, { notes: 'ignored' }, { notes: BULK_MODES.CLEAR }, new Set(['notes'])
      );
      expect(overrides.notes).toBe('');
    });

    it('date group writes all three date fields together', () => {
      const values = { start_date: '2020-02-01', end_date: '2020-03-01', date_indicator: 'month' };
      const overrides = buildOverrides(fields, itemA, values, {}, new Set(['dates']));
      expect(overrides.start_date).toBe('2020-02-01');
      expect(overrides.end_date).toBe('2020-03-01');
      expect(overrides.date_indicator).toBe('month');
    });

    it('access group writes restriction and its note together', () => {
      const values = { restriction: 'Ierobežota', restriction_note: 'Pamatojums' };
      const overrides = buildOverrides(fields, itemA, values, {}, new Set(['access']));
      expect(overrides.restriction).toBe('Ierobežota');
      expect(overrides.restriction_note).toBe('Pamatojums');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MIXED SENTINEL MUST NEVER REACH A PAYLOAD
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MIXED sentinel handling', () => {
    const fields = getItemBulkFields({ electronic: false });

    it('a ticked text field left on MIXED writes an empty string, not the symbol', () => {
      const overrides = buildOverrides(fields, itemA, { sistematisation: MIXED }, {}, new Set(['sistematisation']));
      expect(overrides.sistematisation).toBe('');
    });

    it('survives JSON serialisation (a symbol value would vanish)', () => {
      const overrides = buildOverrides(fields, itemA, { sistematisation: MIXED }, {}, new Set(['sistematisation']));
      const roundTripped = JSON.parse(JSON.stringify(overrides));
      expect('sistematisation' in roundTripped).toBeTruthy();
    });

    it('a ticked number field left on MIXED becomes 0 instead of throwing', () => {
      const overrides = buildOverrides(fields, itemA, { size: MIXED }, {}, new Set(['size']));
      expect(overrides.size).toBe(0);
    });

    it('a ticked date field left on MIXED does not leak the symbol', () => {
      const values = { start_date: MIXED, end_date: MIXED, date_indicator: MIXED };
      const overrides = buildOverrides(fields, itemA, values, {}, new Set(['dates']));
      expect(overrides.start_date).toBe('');
      expect(overrides.date_indicator).toBe('day');
    });

    it('required fields still on MIXED are reported as empty and block the save', () => {
      expect(findEmptyRequiredFields(fields, { series_code: MIXED }, new Set(['series_code']))).toHaveLength(1);
      expect(findEmptyRequiredFields(fields, { start_date: MIXED, end_date: MIXED }, new Set(['dates']))).toHaveLength(1);
      expect(findEmptyRequiredFields(fields, { language: MIXED }, new Set(['language']))).toHaveLength(1);
    });

    it('append mode on a MIXED value keeps the entity value unchanged', () => {
      const overrides = buildOverrides(
        fields, itemA, { notes: MIXED }, { notes: BULK_MODES.APPEND }, new Set(['notes'])
      );
      expect(overrides.notes).toBe('Piezīme A');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LANGUAGE TAGS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Language handling', () => {
    it('splits a stored language string into tags', () => {
      expect(languageToTags('Latviešu, Krievu')).toEqual(['Latviešu', 'Krievu']);
    });

    it('handles semicolon and slash separators', () => {
      expect(languageToTags('Latviešu; Krievu / Angļu')).toHaveLength(3);
    });

    it('returns an empty array for empty input', () => {
      expect(languageToTags('')).toHaveLength(0);
      expect(languageToTags(null)).toHaveLength(0);
    });

    it('replace mode sends the chosen tags as a comma-separated string', () => {
      const descriptor = { type: 'languageTags', keys: ['language'] };
      const result = applyDescriptor(descriptor, itemA, { language: ['Angļu', 'Vācu'] }, BULK_MODES.REPLACE);
      expect(result.language).toBe('Angļu, Vācu');
    });

    it('append mode unions with the entity languages and skips duplicates', () => {
      const descriptor = { type: 'languageTags', keys: ['language'] };
      const result = applyDescriptor(descriptor, itemA, { language: ['latviešu', 'Angļu'] }, BULK_MODES.APPEND);
      expect(result.language).toBe('Latviešu, Angļu');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // REQUIRED-BUT-EMPTY GUARD
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Required field guard', () => {
    const fields = getItemBulkFields(inventory);

    it('flags a ticked but empty required field', () => {
      const empty = findEmptyRequiredFields(fields, { series_code: '' }, new Set(['series_code']));
      expect(empty).toHaveLength(1);
    });

    it('does not flag an unticked empty field', () => {
      const empty = findEmptyRequiredFields(fields, { series_code: '' }, new Set());
      expect(empty).toHaveLength(0);
    });

    it('flags a half-filled date range', () => {
      const empty = findEmptyRequiredFields(fields, { start_date: '2020-01-01', end_date: '' }, new Set(['dates']));
      expect(empty).toHaveLength(1);
    });

    it('accepts a complete date range', () => {
      const values = { start_date: '2020-01-01', end_date: '2020-02-01', date_indicator: 'day' };
      expect(findEmptyRequiredFields(fields, values, new Set(['dates']))).toHaveLength(0);
    });

    it('flags an empty language selection', () => {
      const empty = findEmptyRequiredFields(fields, { language: [] }, new Set(['language']));
      expect(empty).toHaveLength(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORD CROSS-FIELD RULE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record access restriction rule', () => {
    const fields = getRecordBulkFields();

    it('open access forces the restriction date to null', () => {
      const values = { access_restriction: 'open', access_restriction_date: '2030-01-01' };
      const overrides = buildOverrides(fields, {}, values, {}, new Set(['access']));
      expect(overrides.access_restriction).toBe('open');
      expect(overrides.access_restriction_date).toBeNull();
    });

    it('closed access keeps the restriction date', () => {
      const values = { access_restriction: 'closed', access_restriction_date: '2030-01-01' };
      const overrides = buildOverrides(fields, {}, values, {}, new Set(['access']));
      expect(overrides.access_restriction_date).toBe('2030-01-01');
    });

    it('open access blanks the restriction notes rather than skipping them', () => {
      const values = { access_restriction: 'open', access_restriction_notes: 'vecs' };
      const overrides = buildOverrides(fields, {}, values, {}, new Set(['access']));
      expect(overrides.access_restriction_notes).toBe('');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // AFFECTED COUNT (review step)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Affected count', () => {
    const fields = getItemBulkFields(inventory);
    const notesField = fields.find(f => f.id === 'notes');

    it('counts only entities whose value actually changes', () => {
      const entities = [{ notes: 'Same' }, { notes: 'Different' }];
      const count = countAffected(entities, fields, { notes: 'Same' }, {}, new Set(['notes']), notesField);
      expect(count).toBe(1);
    });

    it('counts zero when every entity already has the value', () => {
      const entities = [{ notes: 'Same' }, { notes: 'Same' }];
      const count = countAffected(entities, fields, { notes: 'Same' }, {}, new Set(['notes']), notesField);
      expect(count).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL PAYLOAD REBUILD
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Full payload rebuild', () => {
    it('keeps the entity own values for unticked fields', () => {
      const fields = getItemBulkFields(inventory);
      const overrides = buildOverrides(fields, itemA, { notes: 'Jauns' }, {}, new Set(['notes']));
      const payload = getItemUpdatePayload(itemA, inventory, overrides);

      expect(payload.notes).toBe('Jauns');
      expect(payload.title).toBe('A');
      expect(payload.series_code).toBe('1.2');
    });

    it('always carries related_item_list so relations are not wiped', () => {
      const payload = getItemUpdatePayload(itemA, inventory, {});
      expect(payload.related_item_list).toEqual([7, 8]);
    });

    it('reads related items from the PUT response shape too', () => {
      const fromPutResponse = { ...itemA, related_item: undefined, related_items: [9] };
      const payload = getItemUpdatePayload(fromPutResponse, inventory, {});
      expect(payload.related_item_list).toEqual([9]);
    });

    it('record create payload sends empty strings, never null, for blank text', () => {
      const payload = getRecordCreatePayload({ title: 'T', date: '2020-01-01' });
      expect(payload.annotation).toBe('');
      expect(payload.group).toBe('');
      expect(payload.sent_reg_nr).toBe('');
    });

    it('record create payload keeps access_restriction_date nullable', () => {
      const payload = getRecordCreatePayload({ title: 'T' });
      expect(payload.access_restriction_date).toBeNull();
    });

    it('record create payload joins language arrays', () => {
      const payload = getRecordCreatePayload({ language: ['latviešu', 'angļu'] });
      expect(payload.language).toBe('latviešu, angļu');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ROW HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Paste parsing', () => {
    it('turns each line into a row', () => {
      const rows = parsePastedRows('Pirmais\nOtrais\nTrešais', ['title']);
      expect(rows).toHaveLength(3);
      expect(rows[1].title).toBe('Otrais');
    });

    it('skips blank lines', () => {
      const rows = parsePastedRows('Pirmais\n\n  \nOtrais', ['title']);
      expect(rows).toHaveLength(2);
    });

    it('splits tab-separated columns from a spreadsheet', () => {
      const rows = parsePastedRows('Nosaukums\t1-15/1', ['title', 'reg_nr']);
      expect(rows[0].title).toBe('Nosaukums');
      expect(rows[0].reg_nr).toBe('1-15/1');
    });

    it('leaves missing columns empty', () => {
      const rows = parsePastedRows('Tikai nosaukums', ['title', 'reg_nr']);
      expect(rows[0].reg_nr).toBe('');
    });
  });

  describe('Pattern expansion', () => {
    it('replaces {n} with a running number', () => {
      const values = expandPattern('Protokols {n}', 1, 3);
      expect(values).toEqual(['Protokols 1', 'Protokols 2', 'Protokols 3']);
    });

    it('honours the start number', () => {
      expect(expandPattern('Nr. {n}', 5, 2)).toEqual(['Nr. 5', 'Nr. 6']);
    });

    it('replaces every occurrence of {n}', () => {
      expect(expandPattern('{n}/{n}', 2, 1)).toEqual(['2/2']);
    });

    it('caps runaway counts', () => {
      expect(expandPattern('X {n}', 1, 100000)).toHaveLength(500);
    });

    it('returns nothing for a zero count', () => {
      expect(expandPattern('X {n}', 1, 0)).toHaveLength(0);
    });
  });

  describe('File name to title', () => {
    it('strips the extension', () => {
      expect(fileNameToTitle('Sēdes protokols.pdf')).toBe('Sēdes protokols');
    });

    it('keeps dots inside the name', () => {
      expect(fileNameToTitle('2020.01.15 protokols.docx')).toBe('2020.01.15 protokols');
    });

    it('handles a name without an extension', () => {
      expect(fileNameToTitle('protokols')).toBe('protokols');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FIELD DESCRIPTORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Field descriptors', () => {
    it('never exposes number or title for bulk item editing', () => {
      const keys = flattenFields(getItemBulkFields(inventory)).flatMap(f => f.keys || []);
      expect(keys.includes('number')).toBeFalsy();
      expect(keys.includes('title')).toBeFalsy();
    });

    it('never exposes title or reg_nr for bulk record editing', () => {
      const keys = flattenFields(getRecordBulkFields()).flatMap(f => f.keys || []);
      expect(keys.includes('title')).toBeFalsy();
      expect(keys.includes('reg_nr')).toBeFalsy();
    });

    it('offers size and unit only for physical inventories', () => {
      const physical = getItemBulkFields({ electronic: false }).map(f => f.id);
      const electronic = getItemBulkFields({ electronic: true }).map(f => f.id);
      expect(physical.includes('size')).toBeTruthy();
      expect(electronic.includes('size')).toBeFalsy();
    });

    it('resolves group keys through descriptorKeys', () => {
      const access = getItemBulkFields(inventory).find(f => f.id === 'access');
      expect(descriptorKeys(access)).toEqual(['restriction', 'restriction_note']);
    });
  });
};

export default bulkOperationTests;
