// src/Utils/importMapper.js
//
// Turns a raw cell grid (from csvParser or xlsxReader) into validated rows that
// are ready to POST. Pure functions only — no React, no network — which is what
// makes the whole import testable without a UI.
//
// Every row ends up with: what it is (item/record), what it will send (payload),
// which item it belongs to (parent), and whether it passes the same validation
// the manual forms use. Rows that fail are kept with a reason instead of being
// dropped, so the preview can show the user exactly what the file got wrong.

import {
    EXISTING_ITEM_PREFIX,
    KIND,
    REQUIRED_COLUMNS,
    ROW_TYPE,
    findColumn,
    normaliseValue,
    parseRowType,
} from '../Constants/importConstants';
import { validateItemCreate } from '../Constants/itemConstants';
import { getRecordCreatePayload, validateTextRecordCreate } from '../Constants/recordConstants';
import { ITEM_CREATE_FORM_UI, IMPORT_UI } from '../Constants/Constants';

const fill = (template, values) =>
    Object.entries(values).reduce(
        (text, [key, value]) => text.replace(new RegExp(`\\{${key}\\}`, 'g'), value),
        template
    );

// ─── Header row ─────────────────────────────────────────────────────────────

/**
 * Find the header row. It is usually row 1, but a file may carry a title or a
 * note above the table, so look for the first row where at least two cells are
 * known column names.
 *
 * @returns {number} row index, or -1
 */
export const findHeaderRow = (rows) => {
    const limit = Math.min(rows.length, 20);
    for (let index = 0; index < limit; index++) {
        const known = rows[index].filter(cell => findColumn(cell)).length;
        if (known >= 2) return index;
    }
    return -1;
};

/**
 * Map header cells to column definitions.
 *
 * @param {string[]} headerRow
 * @param {object} manual - { [columnIndex]: canonicalName } user assignments
 */
export const buildHeaderMap = (headerRow, manual = {}) => {
    const columns = [];      // index → definition | null
    const unknown = [];      // { index, name }

    headerRow.forEach((cell, index) => {
        const name = String(cell ?? '').trim();
        const assigned = manual[index];
        const definition = assigned ? findColumn(assigned) : findColumn(name);

        columns[index] = definition || null;
        if (!definition && name !== '') unknown.push({ index, name });
    });

    const present = new Set(
        columns.filter(Boolean).map(column => column.canonical)
    );

    return { columns, unknown, present };
};

/** Which required columns are missing for a row type that the file contains. */
export const missingRequiredColumns = (present, rowType) =>
    (REQUIRED_COLUMNS[rowType] || []).filter(canonical => !present.has(canonical));

// ─── Value coercion ─────────────────────────────────────────────────────────

const pad = (value) => String(value).padStart(2, '0');
const lastDayOfMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/**
 * Parse the date formats users actually type, plus the ISO strings the xlsx
 * reader produces from real Excel date cells.
 *
 * Year- and month-precision values are snapped the same way CalendarComponent
 * snaps them in the forms (start → first day, end → last day); the backend
 * DateField only accepts full dates.
 *
 * @returns {{ value: string, precision: 'day'|'month'|'year' }|null}
 */
export const parseImportDate = (raw, snap = 'start') => {
    const text = String(raw ?? '').trim();
    if (!text) return null;

    const isEnd = snap === 'end';

    // 2020-01-15 / 2020-1-5  (also what xlsxReader emits)
    let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
        const [, year, month, day] = match;
        return { value: `${year}-${pad(month)}-${pad(day)}`, precision: 'day' };
    }

    // 15.01.2020 / 15/01/2020 / 15-01-2020
    match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (match) {
        const [, day, month, year] = match;
        if (Number(month) < 1 || Number(month) > 12 || Number(day) < 1 || Number(day) > 31) return null;
        return { value: `${year}-${pad(month)}-${pad(day)}`, precision: 'day' };
    }

    // 2020-01 / 01.2020 / 01/2020
    match = text.match(/^(\d{4})-(\d{1,2})$/) || null;
    let year = null;
    let month = null;
    if (match) {
        year = Number(match[1]);
        month = Number(match[2]);
    } else {
        match = text.match(/^(\d{1,2})[./](\d{4})$/);
        if (match) {
            month = Number(match[1]);
            year = Number(match[2]);
        }
    }
    if (year && month) {
        if (month < 1 || month > 12) return null;
        const day = isEnd ? lastDayOfMonth(year, month) : 1;
        return { value: `${year}-${pad(month)}-${pad(day)}`, precision: 'month' };
    }

    // 2020
    match = text.match(/^(\d{4})$/);
    if (match) {
        return {
            value: isEnd ? `${match[1]}-12-31` : `${match[1]}-01-01`,
            precision: 'year',
        };
    }

    return null;
};

/** Split a multi-value cell ("Latviešu; Krievu") into a normalised string. */
const parseList = (raw) => String(raw ?? '')
    .split(/[;,/]/)
    .map(part => part.trim())
    .filter(Boolean)
    .join(', ');

const parseEnum = (raw, definition) => {
    const text = String(raw ?? '').trim();
    if (!text) return { value: '' };

    if (definition.map) {
        const mapped = definition.map[normaliseValue(text)];
        return mapped
            ? { value: mapped }
            : { error: Object.keys(definition.map).join(', ') };
    }

    // Value list: match case/diacritic-insensitively but store the canonical form.
    const match = (definition.values || []).find(
        allowed => normaliseValue(allowed) === normaliseValue(text)
    );
    return match ? { value: match } : { error: (definition.values || []).join(', ') };
};

// ─── Row parsing ────────────────────────────────────────────────────────────

/**
 * Read one grid row into { type, link, values, errors } using the header map.
 */
const parseRow = (cells, headerMap, forcedType) => {
    const values = {};
    const errors = [];
    let type = forcedType || null;
    let link = '';
    let precisionGiven = false;

    headerMap.columns.forEach((definition, index) => {
        if (!definition) return;
        const raw = cells[index];

        if (definition.special === 'type') {
            if (!forcedType) {
                const text = String(raw ?? '').trim();
                if (text) {
                    const parsed = parseRowType(text);
                    if (parsed) type = parsed;
                    else errors.push(fill(IMPORT_UI.ROW_ERROR_UNKNOWN_TYPE, { value: text }));
                }
            }
            return;
        }

        if (definition.special === 'link') {
            link = String(raw ?? '').trim();
            return;
        }

        // A column only applies to one row type; ignore it on the other.
        const spec = type === ROW_TYPE.ITEM ? definition.item : definition.record;
        if (!spec) return;

        const text = String(raw ?? '').trim();
        if (text === '') return;

        switch (spec.kind) {
            case KIND.DATE: {
                const parsed = parseImportDate(text, spec.snap);
                if (!parsed) {
                    errors.push(fill(IMPORT_UI.ROW_ERROR_BAD_DATE, { value: text, field: definition.canonical }));
                    return;
                }
                values[spec.field] = parsed.value;
                // Remember the loosest precision seen on the item's own dates.
                if (spec.field === 'start_date' || spec.field === 'end_date') {
                    const rank = { day: 0, month: 1, year: 2 };
                    const current = values.date_indicator;
                    if (!precisionGiven && (!current || rank[parsed.precision] > rank[current])) {
                        values.date_indicator = parsed.precision;
                    }
                }
                return;
            }

            case KIND.INT: {
                const number = Number(String(text).replace(/\s/g, '').replace(',', '.'));
                if (!Number.isFinite(number)) {
                    errors.push(fill(IMPORT_UI.ROW_ERROR_BAD_NUMBER, { value: text, field: definition.canonical }));
                    return;
                }
                values[spec.field] = Math.max(0, Math.round(number));
                return;
            }

            case KIND.ENUM: {
                const result = parseEnum(text, spec);
                if (result.error) {
                    errors.push(fill(IMPORT_UI.ROW_ERROR_BAD_ENUM, {
                        value: text, field: definition.canonical, allowed: result.error,
                    }));
                    return;
                }
                values[spec.field] = result.value;
                if (spec.field === 'date_indicator') precisionGiven = true;
                return;
            }

            case KIND.LIST:
                values[spec.field] = parseList(text);
                return;

            default:
                values[spec.field] = text;
        }
    });

    return { type, link, values, errors };
};

// ─── Payload builders ───────────────────────────────────────────────────────

/** Full item create payload — same field set the create form sends. */
export const buildItemPayload = (values, inventory) => ({
    series_code: values.series_code || '',
    title: values.title || '',
    start_date: values.start_date || '',
    end_date: values.end_date || '',
    date_indicator: values.date_indicator || 'day',
    date_note: values.date_note || '',
    size: Number.isFinite(values.size) ? values.size : 0,
    unit_of_measure: values.unit_of_measure || ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.LAPAS,
    notes: values.notes || '',
    annotation: values.annotation || '',
    sistematisation: values.sistematisation || '',
    language: values.language || '',
    restriction: values.restriction || ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA,
    restriction_note: values.restriction_note || '',
    security_level: values.security_level || ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.PUBLISKS,
    security_level_note: values.security_level_note || '',
    copy: values.copy || '',
    archival_history: values.archival_history || '',
    related_item_list: [],
    inventory: inventory?.number,
});

/** Full record create payload — '' for blank text, null only where allowed. */
export const buildRecordPayload = (values) => getRecordCreatePayload({
    ...values,
    access_restriction: values.access_restriction || 'open',
});

// ─── Main entry point ───────────────────────────────────────────────────────

/**
 * Map a raw grid into import rows.
 *
 * @param {object} options
 * @param {string[][]} options.rows          raw cell grid
 * @param {object}     options.inventory     target inventory (for item validation)
 * @param {Array}      options.existingItems items already in that inventory
 * @param {object}     [options.item]        when importing into ONE item: records only
 * @param {boolean}    options.recordsAllowed  false for non-electronic/media lists
 * @param {object}     [options.manualColumns] { columnIndex: canonicalName }
 *
 * @returns {{
 *   headerRowIndex: number, unknownColumns: Array, present: Set,
 *   missingForItems: string[], missingForRecords: string[],
 *   entries: Array, itemCount: number, recordCount: number, validCount: number
 * }}
 */
export const mapImportRows = ({
    rows,
    inventory,
    existingItems = [],
    item = null,
    recordsAllowed = true,
    manualColumns = {},
}) => {
    const headerRowIndex = findHeaderRow(rows);
    if (headerRowIndex < 0) {
        return {
            headerRowIndex: -1, unknownColumns: [], present: new Set(),
            missingForItems: [], missingForRecords: [],
            entries: [], itemCount: 0, recordCount: 0, validCount: 0,
        };
    }

    const headerMap = buildHeaderMap(rows[headerRowIndex], manualColumns);
    const dataRows = rows.slice(headerRowIndex + 1);

    // Single-item mode: every row is a record for that item, TIPS is ignored.
    const forcedType = item ? ROW_TYPE.RECORD : null;

    const existingByNumber = new Map(
        existingItems.map(existing => [Number(existing.number), existing])
    );

    const entries = [];
    const itemsByKey = new Map();     // SAITE key → entry index
    const usedKeys = new Set();
    let lastItemEntry = null;

    dataRows.forEach((cells, offset) => {
        const rowNumber = headerRowIndex + offset + 2;   // 1-based, as shown in Excel
        const parsed = parseRow(cells, headerMap, forcedType);

        if (!parsed.type) {
            entries.push({
                rowNumber, type: null, label: firstNonEmpty(cells),
                ok: false, message: IMPORT_UI.ROW_ERROR_NO_TYPE,
            });
            return;
        }

        // ── Item row
        if (parsed.type === ROW_TYPE.ITEM) {
            const payload = buildItemPayload(parsed.values, inventory);
            const validation = validateItemCreate(payload, inventory);
            const message = parsed.errors[0] || (validation.isValid ? null : Object.values(validation.errors)[0]);

            const entry = {
                rowNumber,
                type: ROW_TYPE.ITEM,
                label: payload.title || firstNonEmpty(cells),
                key: parsed.link || null,
                payload,
                dates: { start_date: payload.start_date, end_date: payload.end_date },
                ok: !message,
                message,
            };

            if (parsed.link) {
                if (usedKeys.has(normaliseValue(parsed.link))) {
                    entry.ok = false;
                    entry.message = fill(IMPORT_UI.ROW_ERROR_DUPLICATE_KEY, { key: parsed.link });
                } else {
                    usedKeys.add(normaliseValue(parsed.link));
                    itemsByKey.set(normaliseValue(parsed.link), entries.length);
                }
            }

            entries.push(entry);
            lastItemEntry = entries.length - 1;
            return;
        }

        // ── Record row
        const entry = {
            rowNumber,
            type: ROW_TYPE.RECORD,
            label: parsed.values.title || firstNonEmpty(cells),
            ok: true,
            message: null,
        };

        if (!recordsAllowed) {
            entries.push({ ...entry, ok: false, message: IMPORT_UI.ROW_ERROR_RECORDS_NOT_SUPPORTED });
            return;
        }

        const parent = resolveParent({
            link: parsed.link,
            item,
            existingByNumber,
            itemsByKey,
            lastItemEntry,
            entries,
        });

        if (parent.error) {
            entries.push({ ...entry, ok: false, message: parent.error });
            return;
        }

        entry.parent = parent.parent;

        // Record dates are validated against the parent's range — which works
        // for a not-yet-created parent too, since its dates are already parsed.
        const parentDates = parent.parent.kind === 'existing'
            ? { start_date: parent.parent.item.start_date, end_date: parent.parent.item.end_date }
            : entries[parent.parent.entryIndex]?.dates || {};

        const payload = buildRecordPayload(parsed.values);
        const validation = validateTextRecordCreate(payload, parentDates);
        const message = parsed.errors[0]
            || (validation.isValid ? null : Object.values(validation.errors)[0])
            || missingRecordFieldMessage(payload);

        entries.push({ ...entry, payload, ok: !message, message });
    });

    const itemCount = entries.filter(entry => entry.type === ROW_TYPE.ITEM && entry.ok).length;
    const recordCount = entries.filter(entry => entry.type === ROW_TYPE.RECORD && entry.ok).length;

    return {
        headerRowIndex,
        unknownColumns: headerMap.unknown,
        present: headerMap.present,
        missingForItems: entries.some(entry => entry.type === ROW_TYPE.ITEM)
            ? missingRequiredColumns(headerMap.present, ROW_TYPE.ITEM) : [],
        missingForRecords: entries.some(entry => entry.type === ROW_TYPE.RECORD)
            ? missingRequiredColumns(headerMap.present, ROW_TYPE.RECORD) : [],
        entries,
        itemCount,
        recordCount,
        validCount: itemCount + recordCount,
    };
};

/**
 * Fields the record model requires but validateTextRecordCreate does not check.
 * Without this the failure would only appear as a backend 400 mid-import.
 */
const missingRecordFieldMessage = (payload) => {
    if (!payload.created_date) return 'Izveidošanas datums ir obligāts.';
    if (!payload.sent_date) return 'Nosūtīšanas datums ir obligāts.';
    if (!payload.nomenclature_nr) return 'Lietas Nr. ir obligāts.';
    return null;
};

const firstNonEmpty = (cells) =>
    (cells.find(cell => String(cell ?? '').trim() !== '') || '').toString().trim();

/**
 * Work out which item a record row belongs to:
 *   single-item mode → that item
 *   "GV:12"          → an item that already exists
 *   a key            → the item row that declared the same key
 *   empty            → the nearest item row above
 */
const resolveParent = ({ link, item, existingByNumber, itemsByKey, lastItemEntry, entries }) => {
    if (item) {
        return { parent: { kind: 'current', item } };
    }

    const text = String(link || '').trim();

    if (text.toUpperCase().startsWith(EXISTING_ITEM_PREFIX)) {
        const number = Number(text.slice(EXISTING_ITEM_PREFIX.length).trim());
        const existing = existingByNumber.get(number);
        if (!existing) {
            return { error: fill(IMPORT_UI.ROW_ERROR_PARENT_NOT_FOUND, { number: text.slice(EXISTING_ITEM_PREFIX.length).trim() }) };
        }
        return { parent: { kind: 'existing', item: existing } };
    }

    if (text) {
        const entryIndex = itemsByKey.get(normaliseValue(text));
        if (entryIndex === undefined) {
            return { error: fill(IMPORT_UI.ROW_ERROR_PARENT_KEY_NOT_FOUND, { key: text }) };
        }
        return { parent: { kind: 'new', entryIndex, rowNumber: entries[entryIndex].rowNumber } };
    }

    if (lastItemEntry !== null) {
        return { parent: { kind: 'new', entryIndex: lastItemEntry, rowNumber: entries[lastItemEntry].rowNumber } };
    }

    return { error: IMPORT_UI.ROW_ERROR_NO_PARENT };
};

const importMapper = { mapImportRows, parseImportDate, findHeaderRow, buildHeaderMap };

export default importMapper;
