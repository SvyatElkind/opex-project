// src/Utils/xlsxReader.js
//
// Minimal read-only .xlsx reader with **no dependencies**.
//
// Why not a library: the obvious npm choice (`xlsx` / SheetJS) is stuck at
// 0.18.5 on npm with a known prototype-pollution CVE whose fix ships only from
// the vendor's own CDN — not acceptable for an archival tool. `exceljs` is a
// megabyte of read/write machinery for a job that is "read one sheet".
//
// An .xlsx is a ZIP of XML. Everything needed is already in the browser:
//   ZIP    → parse the central directory by hand (below)
//   deflate→ DecompressionStream('deflate-raw')
//   XML    → DOMParser
//
// Deliberately NOT supported (each one throws or degrades loudly, never
// silently): encrypted workbooks, ZIP64, compression methods other than
// store/deflate. Formulas are read as their cached values, which is what a
// spreadsheet shows.

const SIGNATURE = {
    EOCD: 0x06054b50,          // End of central directory
    CENTRAL_FILE: 0x02014b50,  // Central directory file header
    LOCAL_FILE: 0x04034b50,    // Local file header
};

// Created on first use, not at module scope: importing this module must never
// throw just because the environment lacks TextDecoder — only *using* it should.
let cachedDecoder = null;
const decodeUtf8 = (bytes) => {
    if (!cachedDecoder) cachedDecoder = new TextDecoder('utf-8');
    return cachedDecoder.decode(bytes);
};

// ─── ZIP ────────────────────────────────────────────────────────────────────

/** Locate the end-of-central-directory record (it is at the end, after an
 *  optional comment, so scan backwards). */
const findEocd = (view) => {
    const maxComment = 0xFFFF;
    const start = Math.max(0, view.byteLength - maxComment - 22);
    for (let offset = view.byteLength - 22; offset >= start; offset--) {
        if (view.getUint32(offset, true) === SIGNATURE.EOCD) return offset;
    }
    return -1;
};

/**
 * Read the ZIP directory into a map of name → {offset, method, size}.
 */
const readZipDirectory = (buffer) => {
    const view = new DataView(buffer);
    const eocd = findEocd(view);
    if (eocd < 0) {
        throw new Error('Fails nav derīgs .xlsx (nav atrasta ZIP struktūra)');
    }

    const entryCount = view.getUint16(eocd + 10, true);
    let offset = view.getUint32(eocd + 16, true);
    const entries = new Map();

    for (let index = 0; index < entryCount; index++) {
        if (view.getUint32(offset, true) !== SIGNATURE.CENTRAL_FILE) break;

        const method = view.getUint16(offset + 10, true);
        const compressedSize = view.getUint32(offset + 20, true);
        const nameLength = view.getUint16(offset + 28, true);
        const extraLength = view.getUint16(offset + 30, true);
        const commentLength = view.getUint16(offset + 32, true);
        const localOffset = view.getUint32(offset + 42, true);
        const name = decodeUtf8(new Uint8Array(buffer, offset + 46, nameLength));

        entries.set(name, { method, compressedSize, localOffset });
        offset += 46 + nameLength + extraLength + commentLength;
    }

    return entries;
};

/**
 * Inflate a raw deflate stream using the browser's own decompressor.
 *
 * Built on ReadableStream + DecompressionStream only (no Blob, no Response):
 * fewer globals to depend on, so this works the same in a browser, in Electron
 * and under test.
 */
const inflateRaw = async (bytes) => {
    if (typeof DecompressionStream === 'undefined' || typeof ReadableStream === 'undefined') {
        throw new Error('Šis pārlūks neatbalsta .xlsx lasīšanu. Saglabājiet failu kā CSV.');
    }

    const source = new ReadableStream({
        start(controller) {
            controller.enqueue(bytes);
            controller.close();
        },
    });

    const reader = source.pipeThrough(new DecompressionStream('deflate-raw')).getReader();
    const chunks = [];
    let length = 0;

    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        length += value.length;
    }

    const output = new Uint8Array(length);
    let offset = 0;
    chunks.forEach(chunk => {
        output.set(chunk, offset);
        offset += chunk.length;
    });

    return output;
};

/** Read one entry out of the archive as text. */
const readEntryText = async (buffer, entries, name) => {
    const entry = entries.get(name);
    if (!entry) return null;

    const view = new DataView(buffer);
    if (view.getUint32(entry.localOffset, true) !== SIGNATURE.LOCAL_FILE) {
        throw new Error(`Bojāta .xlsx struktūra (${name})`);
    }

    const nameLength = view.getUint16(entry.localOffset + 26, true);
    const extraLength = view.getUint16(entry.localOffset + 28, true);
    const dataStart = entry.localOffset + 30 + nameLength + extraLength;
    const raw = new Uint8Array(buffer, dataStart, entry.compressedSize);

    if (entry.method === 0) return decodeUtf8(raw);
    if (entry.method === 8) return decodeUtf8(await inflateRaw(raw));

    throw new Error(`Neatbalstīts saspiešanas veids .xlsx failā (${entry.method})`);
};

// ─── XML helpers ────────────────────────────────────────────────────────────

const parseXml = (text, what) => {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.querySelector('parsererror')) {
        throw new Error(`Neizdevās nolasīt .xlsx daļu: ${what}`);
    }
    return doc;
};

/** Element children by local name, namespace-agnostic. */
const childrenByName = (element, localName) =>
    Array.from(element.children).filter(child => child.localName === localName);

const firstByName = (element, localName) =>
    Array.from(element.children).find(child => child.localName === localName) || null;

// ─── Cell values ────────────────────────────────────────────────────────────

/** "BC12" → 28 (0-based column index). */
const columnIndexFromRef = (ref) => {
    const letters = String(ref || '').replace(/[^A-Z]/gi, '').toUpperCase();
    let index = 0;
    for (let position = 0; position < letters.length; position++) {
        index = index * 26 + (letters.charCodeAt(position) - 64);
    }
    return Math.max(0, index - 1);
};

/** Built-in numFmt ids that mean "this number is a date". */
const DATE_FORMAT_IDS = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 30, 36, 45, 46, 47, 50, 57]);

/**
 * Excel stores dates as a day count. Convert to an ISO date string — the
 * importer's date parser then treats it like any other date.
 *
 * The 1900 system has Excel's famous non-existent 29 Feb 1900: serials above 59
 * are shifted by one day, which is why the epoch differs below 60.
 */
const serialToIsoDate = (serial, date1904) => {
    if (!Number.isFinite(serial)) return null;

    const days = Math.floor(serial);
    const epoch = date1904
        ? Date.UTC(1904, 0, 1)
        : Date.UTC(1899, 11, days < 60 ? 31 : 30);
    const millis = epoch + days * 86400000;
    const date = new Date(millis);
    if (Number.isNaN(date.getTime())) return null;

    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

/** Style index → is that style a date format? */
const readDateStyles = (stylesXml) => {
    const isDate = [];
    if (!stylesXml) return isDate;

    const doc = parseXml(stylesXml, 'styles.xml');
    const root = doc.documentElement;

    // Custom formats: keep those whose code contains y/m/d outside quotes.
    const customDateIds = new Set();
    const numFmts = firstByName(root, 'numFmts');
    if (numFmts) {
        childrenByName(numFmts, 'numFmt').forEach(numFmt => {
            const code = (numFmt.getAttribute('formatCode') || '').replace(/\[[^\]]*\]|"[^"]*"/g, '');
            if (/[ymd]/i.test(code)) {
                customDateIds.add(Number(numFmt.getAttribute('numFmtId')));
            }
        });
    }

    const cellXfs = firstByName(root, 'cellXfs');
    if (!cellXfs) return isDate;

    childrenByName(cellXfs, 'xf').forEach((xf, index) => {
        const numFmtId = Number(xf.getAttribute('numFmtId') || 0);
        isDate[index] = DATE_FORMAT_IDS.has(numFmtId) || customDateIds.has(numFmtId);
    });

    return isDate;
};

/** Shared strings table (each <si> may be split into <r> runs). */
const readSharedStrings = (xml) => {
    if (!xml) return [];
    const doc = parseXml(xml, 'sharedStrings.xml');
    return childrenByName(doc.documentElement, 'si').map(si => {
        const direct = firstByName(si, 't');
        if (direct) return direct.textContent;
        return childrenByName(si, 'r')
            .map(run => (firstByName(run, 't')?.textContent) || '')
            .join('');
    });
};

// ─── Workbook structure ─────────────────────────────────────────────────────

const readSheetIndex = (workbookXml, relsXml) => {
    const workbook = parseXml(workbookXml, 'workbook.xml').documentElement;
    const date1904 = (firstByName(workbook, 'workbookPr')?.getAttribute('date1904') || '0') === '1';

    const relations = new Map();
    if (relsXml) {
        const rels = parseXml(relsXml, 'workbook.xml.rels').documentElement;
        childrenByName(rels, 'Relationship').forEach(rel => {
            relations.set(rel.getAttribute('Id'), rel.getAttribute('Target'));
        });
    }

    const sheetsElement = firstByName(workbook, 'sheets');
    const sheets = sheetsElement ? childrenByName(sheetsElement, 'sheet').map((sheet, order) => {
        // r:id — getAttribute is namespace-agnostic for qualified names here.
        const relationId = sheet.getAttribute('r:id') || sheet.getAttributeNS('*', 'id');
        let target = relations.get(relationId) || `worksheets/sheet${order + 1}.xml`;
        target = target.replace(/^\//, '').replace(/^xl\//, '');
        return { name: sheet.getAttribute('name') || `Lapa ${order + 1}`, path: `xl/${target}` };
    }) : [];

    return { sheets, date1904 };
};

const readSheetRows = (sheetXml, sharedStrings, dateStyles, date1904) => {
    const doc = parseXml(sheetXml, 'sheet.xml');
    const sheetData = firstByName(doc.documentElement, 'sheetData');
    if (!sheetData) return [];

    const rows = [];

    childrenByName(sheetData, 'row').forEach(rowElement => {
        const cells = [];

        childrenByName(rowElement, 'c').forEach(cellElement => {
            const columnIndex = columnIndexFromRef(cellElement.getAttribute('r'));
            const type = cellElement.getAttribute('t');
            const styleIndex = Number(cellElement.getAttribute('s') || -1);
            let value = '';

            if (type === 'inlineStr') {
                const is = firstByName(cellElement, 'is');
                value = is ? (firstByName(is, 't')?.textContent || '') : '';
            } else {
                const raw = firstByName(cellElement, 'v')?.textContent ?? '';
                if (type === 's') {
                    value = sharedStrings[Number(raw)] ?? '';
                } else if (type === 'b') {
                    value = raw === '1' ? 'true' : 'false';
                } else if (type === 'str' || type === 'e') {
                    value = raw;
                } else if (raw !== '') {
                    // Numeric: a date style is the only way to know it is a date.
                    const asDate = dateStyles[styleIndex] ? serialToIsoDate(Number(raw), date1904) : null;
                    value = asDate || raw;
                }
            }

            // Fill gaps so column positions line up with the header row.
            while (cells.length < columnIndex) cells.push('');
            cells[columnIndex] = String(value).trim();
        });

        rows.push(cells);
    });

    return rows.filter(cells => cells.some(cell => String(cell).trim() !== ''));
};

// ─── Public API ─────────────────────────────────────────────────────────────

/** Sheet the importer prefers, if present; otherwise the first one. */
const PREFERRED_SHEETS = ['DATI', 'DATA', 'IMPORTS'];

/**
 * Read one sheet of an .xlsx File/Blob into a raw cell grid.
 *
 * @param {File|Blob} file
 * @returns {Promise<{ rows: string[][], sheetName: string, sheetNames: string[] }>}
 */
export const parseXlsxFile = async (file) => {
    const buffer = await file.arrayBuffer();
    const entries = readZipDirectory(buffer);

    const workbookXml = await readEntryText(buffer, entries, 'xl/workbook.xml');
    if (!workbookXml) {
        throw new Error('Fails nav derīgs .xlsx (nav atrasts xl/workbook.xml)');
    }

    const relsXml = await readEntryText(buffer, entries, 'xl/_rels/workbook.xml.rels');
    const { sheets, date1904 } = readSheetIndex(workbookXml, relsXml);
    if (sheets.length === 0) {
        throw new Error('Excel failā nav nevienas lapas');
    }

    const preferred = sheets.find(sheet => PREFERRED_SHEETS.includes(sheet.name.trim().toUpperCase()));
    const chosen = preferred || sheets[0];

    const sheetXml = await readEntryText(buffer, entries, chosen.path);
    if (!sheetXml) {
        throw new Error(`Neizdevās nolasīt lapu "${chosen.name}"`);
    }

    const [sharedStringsXml, stylesXml] = await Promise.all([
        readEntryText(buffer, entries, 'xl/sharedStrings.xml'),
        readEntryText(buffer, entries, 'xl/styles.xml'),
    ]);

    const rows = readSheetRows(
        sheetXml,
        readSharedStrings(sharedStringsXml),
        readDateStyles(stylesXml),
        date1904
    );

    return { rows, sheetName: chosen.name, sheetNames: sheets.map(sheet => sheet.name) };
};

const xlsxReader = { parseXlsxFile };

export default xlsxReader;
