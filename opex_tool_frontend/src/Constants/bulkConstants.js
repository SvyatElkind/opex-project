// src/Constants/bulkConstants.js
//
// Field descriptors that drive BOTH bulk popups (BulkEditPopup and
// MultiCreatePopup). One descriptor list per entity — the popups know how to
// render a descriptor, they know nothing about Items or Records.
//
// Descriptor shape:
//   id            unique key inside the popup (also the mode/checkbox key)
//   label         Latvian label
//   keys          model field names this descriptor writes (usually one)
//   type          'text' | 'textarea' | 'number' | 'select' | 'date'
//                 | 'languageTags' | 'itemDates' | 'group'
//   children      for type 'group' — descriptors rendered under ONE checkbox
//   modes         subset of BULK_MODES this field offers (default: replace only)
//   separator     used by 'append' mode
//   requiredIfEnabled  block the save if the field is ticked but left empty
//   disabledWhen  (values) => boolean — for cross-field rules (open ⇒ no date)
//   hint          small helper text under the control

import { ITEM_CREATE_FORM_UI, RECORD_CREATE_FORM_UI } from './Constants';

export const BULK_MODES = {
    REPLACE: 'replace',
    APPEND: 'append',
    CLEAR: 'clear',
};

/** Max selection before we warn the user about the number of requests. */
export const BULK_SELECTION_WARN_THRESHOLD = 50;

const asOptions = (obj) => Object.values(obj).map(v => ({ value: v, label: v }));

// ─── Item descriptors ───────────────────────────────────────────────────────

/**
 * Bulk-editable item fields.
 * Deliberately excluded: `number` (server-assigned, unique per inventory),
 * `title` (unique per item — bulk rename is a separate, later feature) and
 * `related_item_list` (symmetrical M2M, too easy to destroy in bulk).
 */
export const getItemBulkFields = (inventory) => {
    const fields = [
        {
            id: 'series_code',
            label: ITEM_CREATE_FORM_UI.FIELD_SĒRIJAS_KODS,
            keys: ['series_code'],
            type: 'text',
            placeholder: ITEM_CREATE_FORM_UI.PLACEHOLDER_SĒRIJAS_KODS,
            helpEntity: 'item',
            helpField: 'series_code',
            requiredIfEnabled: true,
        },
        {
            id: 'dates',
            label: ITEM_CREATE_FORM_UI.SECTION_DATES,
            keys: ['start_date', 'end_date', 'date_indicator'],
            type: 'itemDates',
            requiredIfEnabled: true,
        },
        {
            id: 'date_note',
            label: ITEM_CREATE_FORM_UI.FIELD_DATUMA_PIEZĪMES,
            keys: ['date_note'],
            type: 'text',
            placeholder: ITEM_CREATE_FORM_UI.PLACEHOLDER_DATUMA_PIEZĪMES,
            helpEntity: 'item',
            helpField: 'date_note',
            modes: [BULK_MODES.REPLACE, BULK_MODES.CLEAR],
        },
        {
            id: 'language',
            label: ITEM_CREATE_FORM_UI.FIELD_VALODA,
            keys: ['language'],
            type: 'languageTags',
            options: ITEM_CREATE_FORM_UI.LANGUAGES,
            helpEntity: 'item',
            helpField: 'language',
            modes: [BULK_MODES.REPLACE, BULK_MODES.APPEND],
            requiredIfEnabled: true,
        },
        {
            id: 'annotation',
            label: ITEM_CREATE_FORM_UI.FIELD_SATURS,
            keys: ['annotation'],
            type: 'textarea',
            placeholder: ITEM_CREATE_FORM_UI.PLACEHOLDER_SATURS,
            helpEntity: 'item',
            helpField: 'annotation',
            modes: [BULK_MODES.REPLACE, BULK_MODES.APPEND, BULK_MODES.CLEAR],
            separator: '\n',
        },
        {
            id: 'notes',
            label: ITEM_CREATE_FORM_UI.FIELD_PIEZĪMES,
            keys: ['notes'],
            type: 'textarea',
            placeholder: ITEM_CREATE_FORM_UI.PLACEHOLDER_PIEZĪMES,
            helpEntity: 'item',
            helpField: 'notes',
            modes: [BULK_MODES.REPLACE, BULK_MODES.APPEND, BULK_MODES.CLEAR],
            separator: '\n',
        },
        {
            id: 'access',
            label: ITEM_CREATE_FORM_UI.SECTION_ACCESS,
            type: 'group',
            hint: 'Ja pieejamība nav "Vispārēja", pamatojums ir obligāts.',
            children: [
                {
                    id: 'restriction',
                    label: ITEM_CREATE_FORM_UI.FIELD_PIEEJAMĪBA,
                    keys: ['restriction'],
                    type: 'select',
                    options: asOptions(ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA),
                    helpEntity: 'item',
                    helpField: 'restriction',
                    // Blank would silently clear the value on every selected
                    // item, which is never what a bulk edit is for.
                    requiredIfEnabled: true,
                },
                {
                    id: 'restriction_note',
                    label: ITEM_CREATE_FORM_UI.FIELD_PIEEJAMĪBAS_PIEZĪMES,
                    keys: ['restriction_note'],
                    type: 'textarea',
                    placeholder: ITEM_CREATE_FORM_UI.PLACEHOLDER_PIEEJAMĪBAS_PIEZĪMES,
                    helpEntity: 'item',
                    helpField: 'restriction_note',
                    rows: 2,
                },
            ],
        },
        {
            id: 'security',
            label: ITEM_CREATE_FORM_UI.FIELD_SLEPENĪBA,
            type: 'group',
            children: [
                {
                    id: 'security_level',
                    label: ITEM_CREATE_FORM_UI.FIELD_SLEPENĪBA,
                    keys: ['security_level'],
                    type: 'select',
                    options: asOptions(ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA),
                    helpEntity: 'item',
                    helpField: 'security_level',
                    requiredIfEnabled: true,
                },
                {
                    id: 'security_level_note',
                    label: ITEM_CREATE_FORM_UI.FIELD_SLEPENĪBAS_PIEZĪMES,
                    keys: ['security_level_note'],
                    type: 'textarea',
                    placeholder: ITEM_CREATE_FORM_UI.PLACEHOLDER_SLEPENĪBAS_PIEZĪMES,
                    helpEntity: 'item',
                    helpField: 'security_level_note',
                    rows: 2,
                },
            ],
        },
        {
            id: 'sistematisation',
            label: ITEM_CREATE_FORM_UI.FIELD_SISTEMATIZĀCIJA,
            keys: ['sistematisation'],
            type: 'text',
            placeholder: ITEM_CREATE_FORM_UI.PLACEHOLDER_SISTEMATIZĀCIJA,
            helpEntity: 'item',
            helpField: 'sistematisation',
            modes: [BULK_MODES.REPLACE, BULK_MODES.CLEAR],
        },
        {
            id: 'copy',
            label: ITEM_CREATE_FORM_UI.FIELD_KOPIJA,
            keys: ['copy'],
            type: 'text',
            placeholder: ITEM_CREATE_FORM_UI.PLACEHOLDER_KOPIJA,
            helpEntity: 'item',
            helpField: 'copy',
            modes: [BULK_MODES.REPLACE, BULK_MODES.CLEAR],
        },
        {
            id: 'archival_history',
            label: ITEM_CREATE_FORM_UI.FIELD_ARHĪVA_VĒSTURE,
            keys: ['archival_history'],
            type: 'text',
            placeholder: ITEM_CREATE_FORM_UI.PLACEHOLDER_ARHĪVA_VĒSTURE,
            helpEntity: 'item',
            helpField: 'archival_history',
            modes: [BULK_MODES.REPLACE, BULK_MODES.CLEAR],
        },
    ];

    // Size/unit only exist for physical inventories — same rule as the big form.
    if (inventory && !inventory.electronic) {
        fields.splice(3, 0, {
            id: 'size',
            label: ITEM_CREATE_FORM_UI.FIELD_APJOMS,
            type: 'group',
            children: [
                {
                    id: 'size_value',
                    label: ITEM_CREATE_FORM_UI.FIELD_APJOMS,
                    keys: ['size'],
                    type: 'number',
                    helpEntity: 'item',
                    helpField: 'size',
                },
                {
                    id: 'unit_of_measure',
                    label: ITEM_CREATE_FORM_UI.FIELD_APJOMA_MĒRVIENĪBA,
                    keys: ['unit_of_measure'],
                    type: 'select',
                    options: asOptions(ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA),
                    helpEntity: 'item',
                    helpField: 'unit_of_measure',
                    requiredIfEnabled: true,
                },
            ],
        });
    }

    return fields;
};

/**
 * Shared fields offered when creating several items at once. Same descriptors
 * as bulk edit (minus the modes, which make no sense for brand-new items) —
 * the unique field (title) lives in the row grid instead.
 */
export const getItemSharedCreateFields = (inventory) =>
    getItemBulkFields(inventory).map(stripModes);

// ─── Record descriptors ─────────────────────────────────────────────────────

const RECORD_ACCESS_OPTIONS = [
    { value: 'open', label: RECORD_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA },
    { value: 'closed', label: RECORD_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.IEROBEŽOTA },
];

/**
 * Bulk-editable record fields.
 * Deliberately excluded: `title` and `reg_nr` (unique per record) and the
 * files themselves.
 */
export const getRecordBulkFields = () => ([
    {
        id: 'date',
        label: RECORD_CREATE_FORM_UI.FIELD_DATUMS,
        keys: ['date'],
        type: 'date',
        helpEntity: 'record',
        helpField: 'date',
        requiredIfEnabled: true,
        hint: 'Datumam jābūt glabājamās vienības datumu robežās.',
    },
    {
        id: 'created_date',
        label: RECORD_CREATE_FORM_UI.FIELD_IZVEIDOŠANAS_DATUMS,
        keys: ['created_date'],
        type: 'date',
        helpEntity: 'record',
        helpField: 'created_date',
        requiredIfEnabled: true,
    },
    {
        id: 'sent_date',
        label: RECORD_CREATE_FORM_UI.FIELD_NOSŪTĪŠANAS_DATUMS,
        keys: ['sent_date'],
        type: 'date',
        helpEntity: 'record',
        helpField: 'sent_date',
        requiredIfEnabled: true,
    },
    {
        id: 'language',
        label: RECORD_CREATE_FORM_UI.FIELD_VALODA,
        keys: ['language'],
        type: 'languageTags',
        options: RECORD_CREATE_FORM_UI.LANGUAGES,
        helpEntity: 'record',
        helpField: 'language',
        modes: [BULK_MODES.REPLACE, BULK_MODES.APPEND],
        requiredIfEnabled: true,
    },
    {
        id: 'group',
        label: RECORD_CREATE_FORM_UI.FIELD_GRUPA,
        keys: ['group'],
        type: 'text',
        placeholder: RECORD_CREATE_FORM_UI.PLACEHOLDER_GRUPA,
        helpEntity: 'record',
        helpField: 'group',
        modes: [BULK_MODES.REPLACE, BULK_MODES.CLEAR],
    },
    {
        id: 'nomenclature_nr',
        label: 'Lietas Nr.',
        keys: ['nomenclature_nr'],
        type: 'text',
        placeholder: RECORD_CREATE_FORM_UI.PLACEHOLDER_NOMENKLATŪRAS_NR,
        helpEntity: 'record',
        helpField: 'nomenclature_nr',
        requiredIfEnabled: true,
    },
    {
        id: 'sent_reg_nr',
        label: 'Nosūtītāja reģ. nr.',
        keys: ['sent_reg_nr'],
        type: 'text',
        placeholder: RECORD_CREATE_FORM_UI.PLACEHOLDER_NOSŪTĪŠANAS_REG_NR,
        helpEntity: 'record',
        helpField: 'sent_reg_nr',
        modes: [BULK_MODES.REPLACE, BULK_MODES.CLEAR],
    },
    {
        id: 'key_words',
        label: RECORD_CREATE_FORM_UI.FIELD_ATSLĒGVĀRDI,
        keys: ['key_words'],
        type: 'text',
        placeholder: RECORD_CREATE_FORM_UI.PLACEHOLDER_ATSLĒGVĀRDI,
        helpEntity: 'record',
        helpField: 'key_words',
        modes: [BULK_MODES.REPLACE, BULK_MODES.APPEND, BULK_MODES.CLEAR],
        separator: ', ',
    },
    {
        id: 'annotation',
        label: RECORD_CREATE_FORM_UI.FIELD_ANOTĀCIJA,
        keys: ['annotation'],
        type: 'textarea',
        placeholder: RECORD_CREATE_FORM_UI.PLACEHOLDER_ANOTĀCIJA,
        helpEntity: 'record',
        helpField: 'annotation',
        modes: [BULK_MODES.REPLACE, BULK_MODES.APPEND, BULK_MODES.CLEAR],
        separator: '\n',
    },
    {
        id: 'notes',
        label: RECORD_CREATE_FORM_UI.FIELD_PIEZĪMES,
        keys: ['notes'],
        type: 'textarea',
        placeholder: RECORD_CREATE_FORM_UI.PLACEHOLDER_PIEZĪMES,
        helpEntity: 'record',
        helpField: 'notes',
        modes: [BULK_MODES.REPLACE, BULK_MODES.APPEND, BULK_MODES.CLEAR],
        separator: '\n',
    },
    {
        id: 'tech_info',
        label: RECORD_CREATE_FORM_UI.FIELD_TEHNISKĀ_INFORMĀCIJA,
        keys: ['tech_info'],
        type: 'textarea',
        placeholder: RECORD_CREATE_FORM_UI.PLACEHOLDER_TEHNISKĀ_INFO,
        helpEntity: 'record',
        helpField: 'tech_info',
        modes: [BULK_MODES.REPLACE, BULK_MODES.APPEND, BULK_MODES.CLEAR],
        separator: '\n',
    },
    {
        id: 'access',
        label: RECORD_CREATE_FORM_UI.FIELD_PIEEJAMĪBA,
        type: 'group',
        hint: '"Ierobežota" prasa ierobežojuma datumu; "Vispārēja" to neatļauj.',
        children: [
            {
                id: 'access_restriction',
                label: RECORD_CREATE_FORM_UI.FIELD_PIEEJAMĪBA,
                keys: ['access_restriction'],
                type: 'select',
                options: RECORD_ACCESS_OPTIONS,
                helpEntity: 'record',
                helpField: 'access_restriction',
                // blank=False on the model — an empty value is a 400, not a
                // no-op, so never let it through.
                requiredIfEnabled: true,
            },
            {
                id: 'access_restriction_date',
                label: RECORD_CREATE_FORM_UI.FIELD_IEROBEŽOJUMA_DATUMS,
                keys: ['access_restriction_date'],
                type: 'date',
                helpEntity: 'record',
                helpField: 'access_restriction_date',
                disabledWhen: (values) => values.access_restriction !== 'closed',
            },
            {
                id: 'access_restriction_notes',
                label: RECORD_CREATE_FORM_UI.FIELD_IEROBEŽOJUMA_PIEZĪMES,
                keys: ['access_restriction_notes'],
                type: 'text',
                placeholder: RECORD_CREATE_FORM_UI.PLACEHOLDER_IEROBEŽOJUMU_PIEZĪMES,
                helpEntity: 'record',
                helpField: 'access_restriction_notes',
                disabledWhen: (values) => values.access_restriction !== 'closed',
            },
            {
                id: 'user_restriction_notes',
                label: RECORD_CREATE_FORM_UI.FIELD_LIETOTĀJA_IEROBEŽOJUMU_PIEZĪMES,
                keys: ['user_restriction_notes'],
                type: 'text',
                placeholder: RECORD_CREATE_FORM_UI.PLACEHOLDER_LIETOTĀJA_IEROBEŽOJUMI,
                helpEntity: 'record',
                helpField: 'user_restriction_notes',
            },
        ],
    },
]);

export const getRecordSharedCreateFields = () =>
    getRecordBulkFields().map(stripModes);

// ─── Helpers ────────────────────────────────────────────────────────────────

function stripModes(descriptor) {
    const copy = { ...descriptor, modes: undefined };
    if (copy.children) copy.children = copy.children.map(stripModes);
    return copy;
}

/** Flatten group descriptors into the leaf descriptors that own model keys. */
export const flattenFields = (fields) =>
    fields.flatMap(f => (f.type === 'group' ? f.children : [f]));

/** All model field names a descriptor (or group) writes. */
export const descriptorKeys = (descriptor) =>
    descriptor.type === 'group'
        ? descriptor.children.flatMap(c => c.keys || [])
        : (descriptor.keys || []);

/**
 * The value shared by every entity for `key`, or MIXED if they differ.
 * Used to prefill controls honestly instead of showing entity #1's value.
 */
export const MIXED = Symbol('mixed');

export const commonValue = (entities, key) => {
    if (!entities.length) return '';
    const first = normaliseForCompare(entities[0]?.[key]);
    const allSame = entities.every(e => normaliseForCompare(e?.[key]) === first);
    return allSame ? (entities[0]?.[key] ?? '') : MIXED;
};

const normaliseForCompare = (value) => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
};

/**
 * Strip the MIXED sentinel before a value can reach a payload.
 *
 * MIXED is what a control shows when the selected entities disagree. If the
 * user ticks such a field and never touches the control, the sentinel is still
 * in `values` — and a Symbol is truthy, silently survives `||` and `??`, gets
 * dropped by JSON.stringify (so the field would vanish from a full-object PUT),
 * and throws outright in Number(). Everything that reads `values` for real work
 * must go through here.
 */
const plain = (value) => (value === MIXED ? '' : value);

/** Split a stored language string into tags. */
export const languageToTags = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value || typeof value !== 'string') return [];
    return value.split(/[,;/]/).map(v => v.trim()).filter(Boolean);
};

/**
 * Apply one descriptor to one entity and return the fields to override.
 * `mode` decides whether the entity's current value is replaced, appended to,
 * or cleared — append needs the entity, which is why this is per-entity.
 */
export const applyDescriptor = (descriptor, entity, values, mode) => {
    const overrides = {};
    const key = descriptor.keys?.[0];

    switch (descriptor.type) {
        case 'itemDates':
            overrides.start_date = plain(values.start_date) || '';
            overrides.end_date = plain(values.end_date) || '';
            overrides.date_indicator = plain(values.date_indicator) || 'day';
            break;

        case 'languageTags': {
            const chosen = languageToTags(plain(values[key]));
            if (mode === BULK_MODES.APPEND) {
                const current = languageToTags(entity?.[key]);
                const merged = [...current];
                chosen.forEach(tag => {
                    if (!merged.some(m => m.toLowerCase() === tag.toLowerCase())) merged.push(tag);
                });
                overrides[key] = merged.join(', ');
            } else {
                overrides[key] = chosen.join(', ');
            }
            break;
        }

        case 'number':
            overrides[key] = Number(plain(values[key])) || 0;
            break;

        case 'date':
            // access_restriction_date is the only nullable date on a record.
            overrides[key] = plain(values[key]) || (key === 'access_restriction_date' ? null : '');
            break;

        default: {
            const next = plain(values[key]) ?? '';
            if (mode === BULK_MODES.CLEAR) {
                overrides[key] = '';
            } else if (mode === BULK_MODES.APPEND) {
                const current = entity?.[key] || '';
                const sep = descriptor.separator || ' ';
                // Appending nothing is a no-op — never leave a dangling
                // separator on the entity's existing text.
                if (!String(next).trim()) overrides[key] = current;
                else overrides[key] = current ? `${current}${sep}${next}` : next;
            } else {
                overrides[key] = next;
            }
            break;
        }
    }

    return overrides;
};

/**
 * Build the complete override object for one entity from every ticked field.
 * `enabled` is a Set of top-level descriptor ids; group children always follow
 * their parent.
 */
export const buildOverrides = (fields, entity, values, modes, enabled) => {
    let overrides = {};

    fields.forEach(field => {
        if (!enabled.has(field.id)) return;

        if (field.type === 'group') {
            field.children.forEach(child => {
                if (child.disabledWhen && child.disabledWhen(values)) {
                    // Cross-field rule (e.g. open ⇒ no restriction date):
                    // write the neutral value rather than skipping the key.
                    const key = child.keys[0];
                    overrides[key] = child.type === 'date' ? null : '';
                    return;
                }
                overrides = { ...overrides, ...applyDescriptor(child, entity, values, modes[child.id]) };
            });
        } else {
            overrides = { ...overrides, ...applyDescriptor(field, entity, values, modes[field.id]) };
        }
    });

    return overrides;
};

/**
 * Fields that are ticked but empty — blocked before anything is sent, so the
 * user never learns about it from a backend error halfway through a batch.
 */
export const findEmptyRequiredFields = (fields, values, enabled) => {
    const empty = [];

    const isEmpty = (descriptor) => {
        // A field still showing MIXED counts as empty: the user ticked it but
        // never chose a value, so there is nothing to write.
        if (descriptor.type === 'itemDates') {
            return !plain(values.start_date) || !plain(values.end_date);
        }
        if (descriptor.type === 'languageTags') {
            return languageToTags(plain(values[descriptor.keys[0]])).length === 0;
        }
        const value = plain(values[descriptor.keys?.[0]]);
        return value === undefined || value === null || String(value).trim() === '';
    };

    fields.forEach(field => {
        if (!enabled.has(field.id)) return;
        const candidates = field.type === 'group' ? field.children : [field];
        candidates.forEach(descriptor => {
            if (!descriptor.requiredIfEnabled) return;
            if (descriptor.disabledWhen && descriptor.disabledWhen(values)) return;
            if (isEmpty(descriptor)) empty.push(descriptor.label);
        });
    });

    return empty;
};

/** How many entities would actually change if `overrides` were applied. */
export const countAffected = (entities, fields, values, modes, enabled, descriptor) => {
    const keys = descriptorKeys(descriptor);
    return entities.filter(entity => {
        const overrides = buildOverrides([descriptor], entity, values, modes, enabled);
        return keys.some(key => normaliseForCompare(entity?.[key]) !== normaliseForCompare(overrides[key]));
    }).length;
};

/** Parse pasted spreadsheet/text content into grid rows. */
export const parsePastedRows = (text, columns) => {
    if (!text) return [];
    return text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
            const cells = line.split('\t');
            const row = {};
            columns.forEach((column, index) => {
                row[column] = (cells[index] || '').trim();
            });
            return row;
        });
};

/** Expand a `{n}` pattern into `count` values starting at `start`. */
export const expandPattern = (pattern, start, count) => {
    const from = Number.isFinite(Number(start)) ? Number(start) : 1;
    const total = Math.max(0, Math.min(Number(count) || 0, 500));
    return Array.from({ length: total }, (_, index) =>
        String(pattern || '').replace(/\{n\}/g, String(from + index))
    );
};

/** Strip the extension from a file name, for "one file = one record". */
export const fileNameToTitle = (fileName) =>
    String(fileName || '').replace(/\.[^./\\]+$/, '').trim();
