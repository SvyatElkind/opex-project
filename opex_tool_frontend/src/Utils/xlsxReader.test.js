/**
 * xlsxReader — end-to-end test against the real example workbook that ships in
 * public/examples/.
 *
 * This one lives in jest rather than the in-app DevAdmin runner because it needs
 * to read a binary fixture from disk, which the browser runner cannot do. It is
 * the only way to prove the hand-rolled ZIP + XML reader actually parses a file
 * Excel produced, so it earns its place: run with `npm test`.
 *
 * The globals below exist in every browser and in Electron; jsdom simply does
 * not provide them, so they are taken from Node here.
 */
import fs from 'fs';
import path from 'path';
import { TextDecoder, TextEncoder } from 'util';
import { DecompressionStream, ReadableStream } from 'node:stream/web';

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
global.DecompressionStream = DecompressionStream;
global.ReadableStream = ReadableStream;

import { parseXlsxFile } from './xlsxReader';
import { mapImportRows } from './importMapper';
import { ROW_TYPE } from '../Constants/importConstants';

const asFile = (absolutePath) => {
  const buffer = fs.readFileSync(absolutePath);
  return {
    name: path.basename(absolutePath),
    arrayBuffer: async () => buffer.buffer.slice(
      buffer.byteOffset, buffer.byteOffset + buffer.byteLength
    ),
  };
};

const EXAMPLE = path.join(__dirname, '..', '..', 'public', 'examples', 'imports_paraugs.xlsx');

describe('xlsxReader against the shipped example workbook', () => {
  let result;

  beforeAll(async () => {
    result = await parseXlsxFile(asFile(EXAMPLE));
  });

  it('picks the DATI sheet, not the instruction sheets', () => {
    expect(result.sheetName).toBe('DATI');
    expect(result.sheetNames).toEqual(['DATI', 'INSTRUKCIJA', 'PARAUGI']);
  });

  it('reads the header row with diacritics intact', () => {
    expect(result.rows[0][0]).toBe('TIPS');
    expect(result.rows[0][2]).toBe('SĒRIJAS_KODS');
    expect(result.rows[0][5]).toBe('DATUMS_LĪDZ');
  });

  it('reads all data rows', () => {
    expect(result.rows).toHaveLength(10); // header + 9 data rows
    expect(result.rows.slice(1).map(r => r[0])).toEqual(
      ['GV', 'DOK', 'DOK', 'DOK', 'GV', 'DOK', 'DOK', 'GV', 'DOK']
    );
  });

  it('reads shared strings and multi-value cells', () => {
    expect(result.rows[1][3]).toBe('Domes sēžu protokoli 2020. gada I ceturksnis');
    expect(result.rows[5][8]).toBe('Latviešu; Angļu');
  });

  it('maps the whole workbook into valid import rows', () => {
    const inventory = { id: 7, number: 5, electronic: true, type: 'Tekstuāls', end_date: '2020-12-31' };
    const mapped = mapImportRows({ rows: result.rows, inventory, existingItems: [] });

    expect(mapped.headerRowIndex).toBe(0);
    expect(mapped.unknownColumns).toHaveLength(0);
    expect(mapped.itemCount).toBe(3);
    expect(mapped.recordCount).toBe(6);
    expect(mapped.entries.filter(e => !e.ok)).toHaveLength(0);
  });

  it('resolves every record to the right parent item row', () => {
    const inventory = { id: 7, number: 5, electronic: true, type: 'Tekstuāls', end_date: '2020-12-31' };
    const mapped = mapImportRows({ rows: result.rows, inventory, existingItems: [] });
    const records = mapped.entries.filter(e => e.type === ROW_TYPE.RECORD);
    expect(records.map(r => r.parent.rowNumber)).toEqual([2, 2, 2, 6, 6, 9]);
  });

  it('produces payloads the API would accept (restricted record keeps its date)', () => {
    const inventory = { id: 7, number: 5, electronic: true, type: 'Tekstuāls', end_date: '2020-12-31' };
    const mapped = mapImportRows({ rows: result.rows, inventory, existingItems: [] });
    const restricted = mapped.entries[mapped.entries.length - 1];
    expect(restricted.payload.access_restriction).toBe('closed');
    expect(restricted.payload.access_restriction_date).toBe('2100-12-31');

    const sensitive = mapped.entries.find(e => e.type === ROW_TYPE.ITEM && e.payload.restriction === 'Sensitīvi dati');
    expect(sensitive.payload.restriction_note.length > 0).toBe(true);
  });
});
