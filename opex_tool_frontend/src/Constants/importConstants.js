// src/Constants/importConstants.js
//
// The import file format: one table where every row declares its own type.
// CSV has no sheets, so "items on one sheet, records on another" cannot work —
// instead each row carries TIPS (GV = item, DOK = record) and SAITE (which item
// a record belongs to). See CSV_IMPORT_PLAN.md §3.
//
// This module is pure data + tiny helpers: the column dictionary, the allowed
// values, and header normalisation. All parsing lives in Utils/importMapper.js.

import { ITEM_CREATE_FORM_UI } from './Constants';

/** Row types, with the aliases we accept in the TIPS column. */
export const ROW_TYPE = { ITEM: 'item', RECORD: 'record' };

const ROW_TYPE_ALIASES = {
    GV: ROW_TYPE.ITEM,
    ITEM: ROW_TYPE.ITEM,
    VIENIBA: ROW_TYPE.ITEM,
    DOK: ROW_TYPE.RECORD,
    RECORD: ROW_TYPE.RECORD,
    DOKUMENTS: ROW_TYPE.RECORD,
    IERAKSTS: ROW_TYPE.RECORD,
};

/** Hard ceiling — a browser is not a batch processing tool. */
export const MAX_IMPORT_ROWS = 1000;
/** Above this we warn about how long it will take. */
export const WARN_IMPORT_ROWS = 200;
/** Preview table cap, so a 900-row file does not freeze the popup. */
export const PREVIEW_ROW_LIMIT = 200;

/** Reference prefix that points at an item that already exists: "GV:12". */
export const EXISTING_ITEM_PREFIX = 'GV:';

// ─── Value kinds ────────────────────────────────────────────────────────────

export const KIND = {
    TEXT: 'text',
    DATE: 'date',
    INT: 'int',
    ENUM: 'enum',
    LIST: 'list',      // multi-value, ';' or ',' separated → joined with ', '
};

// ─── Allowed values ─────────────────────────────────────────────────────────

const ITEM_RESTRICTIONS = Object.values(ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA);
const ITEM_SECURITY = Object.values(ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA);
const ITEM_UNITS = Object.values(ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA);

/** Date precision: file value → date_indicator. */
export const PRECISION_MAP = {
    DIENA: 'day',
    DAY: 'day',
    MENESIS: 'month',
    MONTH: 'month',
    GADS: 'year',
    YEAR: 'year',
};

/** Record access restriction: file value → API value. */
export const RECORD_ACCESS_MAP = {
    VISPAREJA: 'open',
    OPEN: 'open',
    ATVERTS: 'open',
    IEROBEZOTA: 'closed',
    CLOSED: 'closed',
    SLEGTS: 'closed',
};

// ─── Column dictionary ──────────────────────────────────────────────────────
//
// `item` / `record` describe what the column means for that row type. A column
// present for only one type is simply ignored on the other. Some headers are
// deliberately shared (NOSAUKUMS, VALODA, PIEZĪMES, PIEEJAMĪBA) to keep the
// table narrow — the row type decides which field they write.

export const IMPORT_COLUMNS = [
    { canonical: 'TIPS', special: 'type' },
    { canonical: 'SAITE', special: 'link', aliases: ['ATSLĒGA', 'SAITE_UZ_GV'] },

    // ── Item columns
    { canonical: 'SĒRIJAS_KODS', item: { field: 'series_code', kind: KIND.TEXT } },
    {
        canonical: 'NOSAUKUMS',
        item: { field: 'title', kind: KIND.TEXT },
        record: { field: 'title', kind: KIND.TEXT },
    },
    { canonical: 'DATUMS_NO', item: { field: 'start_date', kind: KIND.DATE, snap: 'start' } },
    { canonical: 'DATUMS_LĪDZ', item: { field: 'end_date', kind: KIND.DATE, snap: 'end' } },
    { canonical: 'DATUMA_PRECIZITĀTE', item: { field: 'date_indicator', kind: KIND.ENUM, map: PRECISION_MAP } },
    { canonical: 'DATUMA_PIEZĪMES', item: { field: 'date_note', kind: KIND.TEXT } },
    {
        canonical: 'VALODA',
        item: { field: 'language', kind: KIND.LIST },
        record: { field: 'language', kind: KIND.LIST },
    },
    { canonical: 'SATURS', item: { field: 'annotation', kind: KIND.TEXT } },
    {
        canonical: 'PIEZĪMES',
        item: { field: 'notes', kind: KIND.TEXT },
        record: { field: 'notes', kind: KIND.TEXT },
    },
    { canonical: 'SISTEMATIZĀCIJA', item: { field: 'sistematisation', kind: KIND.TEXT } },
    { canonical: 'APJOMS', item: { field: 'size', kind: KIND.INT } },
    { canonical: 'APJOMA_MĒRVIENĪBA', item: { field: 'unit_of_measure', kind: KIND.ENUM, values: ITEM_UNITS } },
    {
        canonical: 'PIEEJAMĪBA',
        item: { field: 'restriction', kind: KIND.ENUM, values: ITEM_RESTRICTIONS },
        record: { field: 'access_restriction', kind: KIND.ENUM, map: RECORD_ACCESS_MAP },
    },
    { canonical: 'PIEEJAMĪBAS_PAMATOJUMS', item: { field: 'restriction_note', kind: KIND.TEXT } },
    { canonical: 'SLEPENĪBA', item: { field: 'security_level', kind: KIND.ENUM, values: ITEM_SECURITY } },
    { canonical: 'SLEPENĪBAS_PIEZĪMES', item: { field: 'security_level_note', kind: KIND.TEXT } },
    { canonical: 'KOPIJA', item: { field: 'copy', kind: KIND.TEXT } },
    { canonical: 'ARHĪVA_VĒSTURE', item: { field: 'archival_history', kind: KIND.TEXT } },

    // ── Record columns
    { canonical: 'DATUMS', record: { field: 'date', kind: KIND.DATE, snap: 'start' } },
    { canonical: 'REĢ_NR', record: { field: 'reg_nr', kind: KIND.TEXT }, aliases: ['REGISTRĀCIJAS_NR'] },
    { canonical: 'IZVEIDOŠANAS_DATUMS', record: { field: 'created_date', kind: KIND.DATE, snap: 'start' } },
    { canonical: 'NOSŪTĪŠANAS_DATUMS', record: { field: 'sent_date', kind: KIND.DATE, snap: 'start' } },
    { canonical: 'NOSŪTĪTĀJA_REĢ_NR', record: { field: 'sent_reg_nr', kind: KIND.TEXT } },
    { canonical: 'LIETAS_NR', record: { field: 'nomenclature_nr', kind: KIND.TEXT }, aliases: ['NOMENKLATŪRAS_NR'] },
    { canonical: 'GRUPA', record: { field: 'group', kind: KIND.TEXT } },
    { canonical: 'ATSLĒGVĀRDI', record: { field: 'key_words', kind: KIND.LIST } },
    { canonical: 'ANOTĀCIJA', record: { field: 'annotation', kind: KIND.TEXT } },
    { canonical: 'TEHNISKĀ_INFORMĀCIJA', record: { field: 'tech_info', kind: KIND.TEXT } },
    { canonical: 'IEROBEŽOJUMA_DATUMS', record: { field: 'access_restriction_date', kind: KIND.DATE, snap: 'start' } },
    { canonical: 'IEROBEŽOJUMA_PIEZĪMES', record: { field: 'access_restriction_notes', kind: KIND.TEXT } },
    { canonical: 'LIETOŠANAS_NOSACĪJUMI', record: { field: 'user_restriction_notes', kind: KIND.TEXT } },
];

/** Columns that must be present for the given row type to be importable. */
export const REQUIRED_COLUMNS = {
    [ROW_TYPE.ITEM]: ['SĒRIJAS_KODS', 'NOSAUKUMS', 'DATUMS_NO', 'DATUMS_LĪDZ'],
    [ROW_TYPE.RECORD]: ['NOSAUKUMS', 'DATUMS', 'REĢ_NR', 'IZVEIDOŠANAS_DATUMS', 'NOSŪTĪŠANAS_DATUMS', 'LIETAS_NR'],
};

// ─── Header normalisation ───────────────────────────────────────────────────

/**
 * Normalise a header so matching survives what users actually type: different
 * case, spaces instead of underscores, and missing Latvian diacritics
 * ("Sērijas kods" / "SERIJAS_KODS" / "sērijas kods" all match).
 */
export const normaliseHeader = (value) => String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')   // strip combining diacritics
    .toUpperCase()
    .replace(/[\s.]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

/** canonical (normalised) → column definition, including aliases. */
const COLUMN_INDEX = (() => {
    const index = new Map();
    IMPORT_COLUMNS.forEach(column => {
        index.set(normaliseHeader(column.canonical), column);
        (column.aliases || []).forEach(alias => index.set(normaliseHeader(alias), column));
    });
    return index;
})();

export const findColumn = (header) => COLUMN_INDEX.get(normaliseHeader(header)) || null;

/** Normalise a cell value for enum/type lookups (same rules as headers). */
export const normaliseValue = (value) => String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/\s+/g, '_');

export const parseRowType = (value) => ROW_TYPE_ALIASES[normaliseValue(value)] || null;

/** Columns a user can pick from when manually assigning an unknown header. */
export const assignableColumns = (rowTypes) => IMPORT_COLUMNS
    .filter(column => {
        if (column.special) return false;
        if (rowTypes.includes(ROW_TYPE.ITEM) && column.item) return true;
        if (rowTypes.includes(ROW_TYPE.RECORD) && column.record) return true;
        return false;
    })
    .map(column => column.canonical);

/**
 * Signature of the tool's own XLSX export template. That file is a report form
 * with several values merged into one cell, so it cannot be imported — better
 * to recognise it and say so than to fail row by row.
 */
export const looksLikeExportTemplate = (rows) => {
    const flat = rows.slice(0, 12).flat().map(cell => String(cell ?? '')).join(' ').toUpperCase();
    return flat.includes('UZSKAITES SARAKSTS')
        || flat.includes('{GVNOS}')
        || (flat.includes('APRAKSTĪŠANAS') && flat.includes('FONDA'));
};

/** Path to the shipped example files (copied into the build from public/). */
export const EXAMPLE_FILES = {
    xlsx: 'examples/imports_paraugs.xlsx',
    csv: 'examples/imports_paraugs.csv',
    csvItems: 'examples/imports_tikai_vienibas.csv',
    csvRecords: 'examples/imports_tikai_ieraksti.csv',
};

export const exampleUrl = (key) => {
    const base = process.env.PUBLIC_URL || '';
    return `${base}/${EXAMPLE_FILES[key]}`;
};

const importFormat = {
    ROW_TYPE,
    IMPORT_COLUMNS,
    REQUIRED_COLUMNS,
    MAX_IMPORT_ROWS,
    findColumn,
    normaliseHeader,
    normaliseValue,
    parseRowType,
};

export default importFormat;
