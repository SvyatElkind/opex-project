# 7. Constants & Validation

> Directory: [src/Constants/](../src/Constants/)

Two things live here and they are deliberately kept together:

1. **Field constraints and validators** — one `<domain>Constants.js` per entity.
   The max-length constant, the validator that enforces it, and the Latvian
   error message all ship in the same file.
2. **UI strings** — [Constants/uiStrings/](../src/Constants/uiStrings/), one file
   per domain, re-exported through `Constants.js`.

```
Constants/
├── Constants.js             re-export hub + QUERY_KEYS + API_ENDPOINT
├── FallbackConstants.js     offline mirror of GET /values/  → see 05
├── projectConstants.js      project name / folder / report file
├── institutionConstants.js  signer fields
├── inventoryConstants.js    number, type, storage term, dates
├── itemConstants.js         the largest validator set
├── recordConstants.js       record + metadata field limits, payload builders
├── validationRules.js       the verification rule catalogue (documentation data)
├── bulkConstants.js         field descriptors driving the bulk popups
├── importConstants.js       the CSV/XLSX column dictionary  → see 09
├── helpConstants.js         ~4300 lines of help content     → see 11
├── helpZones.js             help anchors per UI zone
├── fieldHelp.js             per-field tooltips
├── guidanceConstants.js     Smart Guide rules
├── roadmapConstants.js      roadmap wizard presets
├── iconConstants.js         FontAwesome class map
└── uiStrings/               12 files of Latvian UI text
```

---

## 7.1 The validator contract

Every domain file follows the same three-tier shape:

```js
// 1. limits & allowed values
export const TITLE_MAX_LENGTH = 1000;
export const ITEM_RESTRICTION_LIST = ['Vispārēja', 'Ierobežota', 'Sensitīvi dati'];

// 2. Latvian messages, keyed by snake_case reason
export const ERROR_MESSAGES = { title_required: 'Nosaukums ir obligāts.', … };

// 3. field validators → string|null, then a composite → { isValid, errors }
export const validateTitle = (title) => string | null;
export const validateItemCreate = (data, inventory) => ({ isValid, errors });
```

**Two different composite return shapes exist** — do not mix them up:

| Shape | Used by |
|---|---|
| `{ isValid: boolean, errors: { field: message } }` | item, record, inventory |
| `{ isValid: boolean, error: string \| null }` | project, institution (single-field validators) |

`errors` maps directly onto `useFormErrors().setFieldErrors`.

Several files export a `getRemainingChars(value, maxLength)` for character
counters — identical implementation in each, not shared.

---

## 7.2 `projectConstants.js`

| Constant | Value |
|---|---|
| `PROJECT_NAME_MIN_LENGTH` / `MAX_LENGTH` | 1 / **20** |
| `PROJECT_FOLDER_MIN_LENGTH` / `MAX_LENGTH` | 1 / 100 |
| `PROJECT_NAME_REGEX` | `/^[A-Za-z0-9_-]+$/` |
| `ALLOWED_REPORT_FORMAT` | `'.xlsx'` |
| `ALLOWED_REPORT_MIME_TYPES` | the OOXML spreadsheet MIME type |

> **Why no diacritics in project names.** The name becomes the project's working
> **folder name on the user's machine**, so `ā ē ī ū ļ ņ š ž č ģ ķ` are excluded
> on purpose. The error message spells this out to the user.

| Function | Returns |
|---|---|
| `validateProjectName(name)` | `{isValid, error}` — required → not-a-string → too short → too long → pattern. |
| `validateProjectFolder(folder)` | required → too long. (Existence is a backend concern.) |
| `validateReportFile(file)` | required → `.xlsx` extension (case-insensitive) → non-zero size. **Extension only — MIME is not checked**, even though the constant exists. |
| `getNameRemainingChars`, `getFolderRemainingChars` | counters |

---

## 7.3 `institutionConstants.js`

| Field | Max |
|---|---|
| `INSTITUTION_NAME_MAX_LENGTH` | 500 |
| `REG_NR_MAX_LENGTH` | 15 (regex `/^\d{1,15}$/`) |
| `CREATOR_MAX_LENGTH` / `SIGNER_MAX_LENGTH` | 30 |
| `CREATOR_POSITION_MAX_LENGTH` / `SIGNER_POSITION_MAX_LENGTH` | 200 |

`INSTITUTION_UPDATE_FIELDS = ['creator','creator_position','signer','signer_position']`
— the exact whitelist the signer PUT sends.

`validateCreator`, `validateCreatorPosition`, `validateSigner`,
`validateSignerPosition` each return `{isValid, error}`;
`validateInstitutionUpdate(data)` composes all four into `{isValid, errors}`.

All four are **required** — this is the same condition `validateProjectForOPEX`
checks as `MISSING_SIGNERS`.

---

## 7.4 `inventoryConstants.js`

| Constant | Value |
|---|---|
| `INVENTORY_MIN_NUM` / `MAX_NUM` | **1 / 70** |
| `POSTFIX_MIN_LENGTH` / `MAX_LENGTH` | 1 / 3 |
| `TYPE_MAX_LENGTH` / `STORAGE_TERM_MAX_LENGTH` | 20 / 30 |
| `VVAIS_TYPE_LIST` | `['Foto','Skaņas','Tekstuāls','Video']` |
| `VVAIS_STORAGE_TERM_LIST` | `['Pastāvīgi glabājamās lietas','Ilgstoši glabājamās lietas']` |
| `INVENTORY_MEDIA_TYPE` | `['Foto','Skaņas','Video']` |

| Function | Notes |
|---|---|
| `validateNumber(n)` | Required (0 counts as present), then range 1–70. |
| `validatePostfix(p)` | Only checked when non-empty; length 1–3. The *litera* suffix on an inventory number. |
| `validateType(t)` / `validateStorageTerm(t)` | Required + membership. |
| `validateDateRange(start, end)` | Both required; `start > end` writes `date_order_invalid` onto `end_date`. |
| `validateInventoryCreate(data)` | number + type + storage_term + dates + postfix. |
| `validateInventoryUpdate(data)` | **Only** storage_term and dates — and each only when present. Number and type are immutable after creation. |
| `canDeleteInventory(inv)` | `!inv.from_report`. |
| `getDeleteRestrictionMessage(inv)` | `'Nevar dzēst uzskaites sarakstu no VVAIS atskaites.'` or `null`. |

**Report-sourced inventories cannot be deleted.** They came from the VVAIS
report and the archive expects them to be present.

---

## 7.5 `itemConstants.js`

The largest validator set.

### Limits

| Field | Max |
|---|---|
| `series_code` | 20 |
| `title` | 1000 |
| `notes` | 1000 |
| `date_note` | 1000 |
| `date_indicator` | 5 |
| `unit_of_measure` | 20 |
| `annotation` | 2000 |
| `sistematisation` | 500 |
| `physical_description` | 1000 |
| `language` | 200 |
| `restriction` / `security_level` | 10 |
| `restriction_note` / `security_level_note` | 500 |
| `copy` | 1000 |
| `archival_history` | 2000 |

### Patterns

```js
SERIES_CODE_REGEX = /^(?!0\d*$)(\d{1,2}\.)*\d{1,2}$/
// "1", "1.2", "1.2.3"  — each segment 1–2 digits, no leading-zero-only segment
DURATION_REGEX = /^\d{2}:[0-5]\d:[0-5]\d$/
```

### Allowed values & defaults

```js
DATE_INDICATOR_VALUES  = ['year','month','day']
UNIT_OF_MEASURE_VALUES = ['Lapas','Dokumenti','Glabājamās vienības']
COLOR_FIELD_VALUES     = ['melnbaltā','krāsainā']
ITEM_RESTRICTION_LIST  = ['Vispārēja','Ierobežota','Sensitīvi dati']
ITEM_SECURITY_LEVEL_LIST = ['Publisks','Iekšējs','Konfidenciāls','Slepens','Sevišķi slepens']

DEFAULT_DATE_INDICATOR  = 'day'
DEFAULT_UNIT_OF_MEASURE = 'Lapas'
DEFAULT_RESTRICTION     = 'Vispārēja'
DEFAULT_SECURITY_LEVEL  = 'Publisks'
```

> `COLOR_FIELD_VALUES` is `['melnbaltā','krāsainā']` here, while
> `Record_API.validateMediaRecordData` and `useRecords` expect
> `['color','grayscale']`. Two vocabularies for the same field — the API values
> are the wire format, the Latvian ones are display labels.

### Conditional requirement tables

```js
REQUIRE_ANNOTATION_TYPE  = ['Foto','Skaņas','Video']
REQUIRE_FORMAT_TYPE      = ['Foto','Skaņas','Video']
REQUIRE_DURATION_TYPE    = ['Skaņas','Video']
REQUIRE_COLOR_TYPE       = ['Foto','Video']
REQUIRE_RESOLUTION_TYPE  = ['Foto','Video']
NOT_REQUIRE_LANGUAGE_TYPE = 'Foto'
```

### Validators

| Function | Rules |
|---|---|
| `validateSeriesCode(code)` | required → ≤20 → regex |
| `validateTitle(title)` | required → ≤1000 |
| `validateItemDateRange(start, end, inventoryEndDate?)` | both required; `start > end` → `date_order_invalid`; `end > inventoryEndDate` → `date_exceeds_inventory`. Returns an **errors object**, not a string. |
| `validateLanguage(lang, inventoryType)` | Skipped entirely for `Foto`; otherwise required + ≤200. |
| `validateAnnotation(ann, inventoryType)` | Required for media types; length checked always. |
| `validateRestrictionNote(note, restriction)` | Required when `restriction !== 'Vispārēja'`; ≤500. |
| `validateDateIndicator`, `validateUnitOfMeasure` | required + membership |
| `validateSecurityLevel`, `validateRestriction` | membership only when non-empty (both optional) |
| `validateRelatedItems(list, currentId)` | Rejects self-reference. |
| `validateItemCreate(data, inventory)` | Composite over all of the above. |
| `validateItemUpdate(data, inventory)` | Alias of create. |

Predicates: `isLanguageRequired(type)`, `isAnnotationRequired(type)`,
`isRestrictionNoteRequired(restriction)`.

### `getItemUpdatePayload(item, inventory, overrides = {})`

**The single source of truth for "what does a full item PUT need".** Read the
doc comment before changing it:

> The backend has no partial-update support, and `update_item()` /
> `update_related_items()` **silently wipes all related-item links** if
> `related_item_list` is missing from the payload. Every caller — the big edit
> form and every section popup — must always send the complete object.

It also handles a field-name mismatch that caused a real bug:

> The project-detail payload calls the relation list `related_item`, but the item
> PUT/POST **response** calls it `related_items` — and `useUpdateItem` writes that
> response straight into the cache. Reading only one of the two means an item
> edited twice in a row would send `[]` and have all its links wiped.

Hence `related_item_list: item.related_item || item.related_items || []`.

Arrays in `language` are joined with `', '` before sending.

### Section-error routing

Because validation always runs against the **whole** object, a section popup can
fail on a field it does not display. Three exports solve this:

- **`ITEM_FIELD_SECTION_LABELS`** — field → section title
  (`Pamata informācija`, `Datējums`, `Tehniskā informācija`, `Saturs`,
  `Piezīmes`, `Pieejamība un slepenība`, `Saistītās glabājamās vienības`).
- **`ITEM_FIELD_LABELS`** — field → Latvian label.
- **`splitItemValidationErrors(errors, ownFields)`** → `{ ownErrors, crossSectionMessage }`.
  Errors on owned fields are attachable to inputs; the **first** error on a
  foreign field becomes one message:
  `Nevar saglabāt: laukā "X" (sadaļa "Y") ir kļūda — <message>`.

---

## 7.6 `recordConstants.js`

### Limits

| Group | Field | Max |
|---|---|---|
| Record | `title` | 500 |
| | `language` | 200 |
| | `annotation` / `notes` / `tech_info` | 500 |
| | `key_words` | 200 |
| | `reg_nr` / `sent_reg_nr` / `group` / `nomenclature_nr` | 30 |
| | `access_restriction` | 10 |
| | `access_restriction_notes` / `user_restriction_notes` | 30 |
| Media | `color` | 10 |
| | `duration` | 8 |
| | `resolution` | 20 |
| Metadata | `action_author` / `action_responsible_person` | 50 |
| | `action_task` / `action_notes` | 200 |
| | `addressee` | 200 |
| | `visa_person` / `read_status_person` | 50 |
| | `visa_notes` / `read_status_notes` | 200 |

`DURATION_REGEX = /^\d{1,2}:[0-5]\d:[0-5]\d$/` — note this accepts 1–2 hour
digits, while `itemConstants.DURATION_REGEX` requires exactly 2.

```js
RECORD_ACCESS_RESTRICTION_VALUES  = ['open','closed']
RECORD_ACCESS_RESTRICTION_DEFAULT = 'open'
```

### Validators

| Function | Rules |
|---|---|
| `validateTitle` | required + ≤500 |
| `validateLanguage` | required + ≤200 (unconditional, unlike items) |
| `validateRegNr`, `validateNomenclatureNr` | required + ≤30 |
| `validateRecordDate(date, item)` | required; when the item has both dates, must fall inside `[start_date, end_date]` |
| `validateAccessRestriction(v)` | membership when non-empty |
| `validateAccessRestrictionDate(date, restriction)` | `closed` **requires** a date; `open` **forbids** one |
| `validateDuration(duration, isRequired = false)` | optional-by-default format check |
| `validateTextRecordCreate(data, item)` | Composite over exactly **7** fields: `title, language, reg_nr, nomenclature_nr, date, access_restriction, access_restriction_date` |
| `validateMediaRecordCreate(data, recordType)` | `recordType` is `'photo'\|'video'\|'audio'` (lowercase — a **fourth** vocabulary). Colour + resolution for photo/video, duration for video/audio. |
| `isAccessRestrictionDateRequired(v)` | `v === 'closed'` |
| `getRecordTypeForItem(item)` | `'text'\|'photo'\|'video'\|'audio'`, or `null` for non-electronic |

`RECORD_VALIDATED_FIELDS` names those seven fields explicitly, so callers can
narrow a full payload down to the validation payload.

### Payload builders

**`getRecordUpdatePayload(record, overrides = {})`** and
**`getRecordCreatePayload(values = {})`** — same reasoning as the item version,
plus a null-handling rule spelled out in the source:

> Every `Record` model field is `null=False` except `access_restriction_date`.
> CharFields must fall back to `''`, never `null`, or DRF rejects the request
> with *"This field may not be null."*

Differences between the two:

| Field | Update payload | Create payload |
|---|---|---|
| `created_date`, `sent_date` | `\|\| null` | `\|\| ''` — both are `blank=False` at create time |
| `access_restriction_date` | `\|\| null` | `\|\| null` — the only nullable field, and it **must** be null when the record is open |
| everything else | `\|\| ''` | coerced through `asText()` |

Both join an array `language` with `', '`.

### Section-error routing

`RECORD_FIELD_SECTION_LABELS` (`Pamata informācija`, `Dokumenta detaļas`,
`Apraksts`, `Pieejamība`), `RECORD_FIELD_LABELS`, and
`splitRecordValidationErrors(errors, ownFields)` — identical mechanics to the
item version.

---

## 7.7 `validationRules.js` — the rule catalogue

**This file is documentation-as-data, not executable validation.** The real
checks live in `InheritanceUtils.js`; this catalogue mirrors them so the
Verification UI can show a rule's description, help link and threshold.

Five groups: `PROJECT_RULES`, `INVENTORY_RULES`, `ITEM_RULES`, `RECORD_RULES`,
`FILE_RULES`, plus `AGGREGATED_RULES` for the three roll-up ids
(`FILE_VALIDATION_FAILED`, `RECORD_VALIDATION_FAILED`, `ITEM_VALIDATION_FAILED`).

Rule shape:

```js
{
  id, severity: 'ERROR'|'WARNING',
  message_lv,          // may contain {placeholders}
  description,         // English, for developers
  field | fields,
  condition?,          // when the rule applies
  threshold?,
  allowedExtensions?,
  requiredFieldsByType?,
  helpChapter?, helpSection?,   // deep link into the help window
}
```

`ALL_ERRORS` (19 entries) and `ALL_WARNINGS` (10 entries) are flat lists for
rendering a complete reference.

### Drift to be aware of

`FILE_RULES.FILE_LARGE_SIZE` (>500 MB warning) is catalogued here but **has no
implementation** in `InheritanceUtils.validateFile` — the size warning that does
exist is the settings-driven one in `Utils/FileValidation.js`. Treat the
catalogue as a description of intent; `InheritanceUtils.js` is the authority.

`ERROR` blocks OPEX generation, `WARNING` does not. See
[02-domain-model.md](02-domain-model.md#25-the-validation-cascade-pre-opex-gate)
for the executable rules.

---

## 7.8 `bulkConstants.js` — descriptor-driven bulk editing

Field descriptors that drive **both** bulk popups. The popups know how to render
a descriptor; they know nothing about Items or Records.

### Descriptor shape

| Key | Meaning |
|---|---|
| `id` | Unique inside the popup; also the checkbox/mode key. |
| `label` | Latvian label. |
| `keys` | Model field names this descriptor writes (usually one). |
| `type` | `text \| textarea \| number \| select \| date \| languageTags \| itemDates \| group` |
| `children` | For `group` — descriptors under **one** checkbox. |
| `modes` | Subset of `BULK_MODES` this field offers (default: replace only). |
| `separator` | Used by append mode. |
| `requiredIfEnabled` | Block the save if ticked but empty. |
| `disabledWhen(values)` | Cross-field rule (e.g. `open ⇒ no restriction date`). |
| `hint` | Helper text under the control. |
| `helpEntity` / `helpField` | Wires the field to `fieldHelp.js`. |

```js
BULK_MODES = { REPLACE: 'replace', APPEND: 'append', CLEAR: 'clear' }
BULK_SELECTION_WARN_THRESHOLD = 50
```

### Field sets

**`getItemBulkFields(inventory)`** — `series_code`, `dates` (itemDates group),
`date_note`, `language`, `annotation`, `notes`, `access` group
(`restriction` + `restriction_note`), `security` group
(`security_level` + `security_level_note`), `sistematisation`, `copy`,
`archival_history`. A `size` group (`size` + `unit_of_measure`) is **spliced in
at index 3 only for non-electronic inventories** — same rule as the full form.

> Deliberately excluded: `number` (server-assigned), `title` (unique per item),
> `related_item_list` (symmetric M2M — too easy to destroy in bulk).

**`getRecordBulkFields()`** — `date`, `created_date`, `sent_date`, `language`,
and the remaining descriptive/access fields. Excludes `title`, `reg_nr` and files.

**`getItemSharedCreateFields(inventory)` / `getRecordSharedCreateFields()`** —
the same descriptors with `modes` stripped (append/clear make no sense for
brand-new entities). The unique field (`title`) lives in the row grid instead.

### The `MIXED` sentinel

```js
export const MIXED = Symbol('mixed');
export const commonValue = (entities, key) => value | MIXED;
```

`commonValue` returns the shared value when every selected entity agrees, and
`MIXED` when they differ — so controls prefill honestly rather than showing
entity #1's value.

**`plain(value)`** (private) strips the sentinel before it can reach a payload.
The doc comment explains why this is not optional:

> A Symbol is truthy, silently survives `||` and `??`, is **dropped by
> `JSON.stringify`** (so the field would vanish from a full-object PUT), and
> throws outright in `Number()`.

Everything that reads `values` for real work must go through `plain`.

### Transform functions

| Function | Description |
|---|---|
| `flattenFields(fields)` | Expands groups into a flat descriptor list. |
| `descriptorKeys(descriptor)` | All model keys a descriptor touches. |
| `languageToTags(value)` | Splits on `, ; /` into a tag array. |
| `applyDescriptor(descriptor, entity, values, mode)` | One descriptor → override object. Per-entity because append needs the current value. |
| `buildOverrides(fields, entity, values, modes, enabled)` | Full override object from every ticked field. `enabled` is a `Set` of top-level ids; group children follow their parent. |
| `findEmptyRequiredFields(fields, values, enabled)` | Labels of ticked-but-empty required fields — blocked **before** anything is sent, so the user never learns about it from a backend error halfway through a batch. A field still showing `MIXED` counts as empty. |
| `countAffected(entities, fields, values, modes, enabled, descriptor)` | How many entities would actually change — powers the "will affect N" preview. |
| `parsePastedRows(text, columns)` | Tab-separated paste → row objects. |
| `expandPattern(pattern, start, count)` | `{n}` placeholder expansion, **capped at 500**. |
| `fileNameToTitle(fileName)` | Strips the extension — "one file = one record". |

**Per-type behaviour in `applyDescriptor`:**

| `type` | Behaviour |
|---|---|
| `itemDates` | Writes all three of `start_date`, `end_date`, `date_indicator` (defaulting the indicator to `'day'`). |
| `languageTags` | `APPEND` merges case-insensitively with existing tags; otherwise replaces. Always stored as a `', '`-joined string. |
| `number` | `Number(...) \|\| 0`. |
| `date` | Empty → `null` for `access_restriction_date`, `''` for every other date. |
| default | `CLEAR` → `''`; `APPEND` → `current + separator + next`, and **appending an empty value is a no-op** so no dangling separator is left; otherwise replace. |

A `disabledWhen` child writes the **neutral value** (`null` for dates, `''`
otherwise) rather than being skipped — skipping would leave a stale value on a
full-object PUT.

---

## 7.9 `uiStrings/` — Latvian UI text

Twelve files, re-exported through `Constants.js` for backward compatibility. New
code may import either from `Constants.js` or directly from the domain file.

| File | Exports |
|---|---|
| `projectUI.js` | `WORKSPACE_UI`, `PROJECT_UI`, `PROJECT_CREATE_UI`, `PROJECT_RENAME_UI`, `PROJECT_DELETE_UI`, `PROJECT_ERROR`, `PROJECT_REPORT_UI`, `PROJECT_ADDITIONAL_UI` |
| `inventoryUI.js` | `INVENTORY_UI`, `INVENTORY_CREATE_UI`, `INVENTORY_EDIT_UI`, `INVENTORY_DELETE_UI`, `INVENTORY_PERIOD_REQUIRED_UI`, `INVENTORY_CONSTANTS` |
| `itemUI.js` | `ITEM_UI`, `ITEM_CREATE_UI`, `ITEM_EDIT_UI`, `ITEM_DELETE_UI`, `ITEM_ERROR`, `ITEM_ADDITIONAL_UI`, `ITEM_CREATE_FORM_UI` |
| `recordUI.js` | `RECORD_UI`, `RECORD_VALIDATION`, `RECORD_ERROR_MESSAGES`, `RECORD_SUCCESS_MESSAGES`, `RECORD_DELETE_UI`, `MEDIA_RECORD_UI`, `RECORD_CREATE_FORM_UI` |
| `institutionUI.js` | `INSTITUTION_CONSTANTS`, `INSTITUTION_ADDITIONAL_UI` |
| `navigationUI.js` | `NAVIGATION_UI`, `NAVIGATION_ADDITIONAL_UI`, `CALENDAR_UI`, `VIEW_OPTIONS`, `CALENDAR_ERROR` |
| `commonUI.js` | `ERROR_MESSAGES`, `ALERT_MESSAGES`, `COMMON_ACTION_UI`, `COMMON_UI`, `TOAST_CONFIG`, `UI_CONFIG`, `HELP_UI`, `HELP_PICKER_UI` |
| `verificationUI.js` | `VERIFICATION_UI`, `GUIDE_TAB_UI` |
| `opexProgressUI.js` | `OPEX_PROGRESS_UI` |
| `fondUI.js` | `FOND_UI` |
| `bulkUI.js` | `BULK_UI` |
| `importUI.js` | `IMPORT_UI` |

`ITEM_CREATE_FORM_UI` and `RECORD_CREATE_FORM_UI` are the most reused: they hold
not just labels but the **option sets** (`OPTIONS_PIEEJAMĪBA`,
`OPTIONS_SLEPENĪBA`, `OPTIONS_APJOMA_MĒRVIENĪBA`, `LANGUAGES`) that
`bulkConstants.js` and `importConstants.js` build their enums from.

Naming convention inside these objects:

| Prefix | Meaning |
|---|---|
| `FIELD_*` | Input label |
| `PLACEHOLDER_*` | Input placeholder |
| `SECTION_*` | Form section title |
| `OPTIONS_*` | An object of select options |
| `BUTTON_*` / `BTN_*` | Button captions |
| `ERROR_*` / `MSG_*` | Messages |

**All user-visible text belongs in these files.** A literal Latvian string in a
component is a bug waiting to be found by the next translation pass.

`Constants.js` also holds two infrastructure exports:

- **`QUERY_KEYS`** — the React Query key factory, documented in
  [04-hooks.md](04-hooks.md#40-the-cache-model-in-one-paragraph).
- **`API_ENDPOINT`** — `{ API_BASE_URL: '/api/v1/project/', API_BASE_URL_RECORD: 'http://127.0.0.1:8000/api/records/project/' }`.
  Only the legacy `src/API/*_API.js` modules use these. `API_BASE_URL_RECORD` is
  dead — it points at an absolute URL and a path that no longer exists.

---

## 7.10 Other constant modules

| File | Contents | Documented in |
|---|---|---|
| `helpConstants.js` | ~4300 lines of Latvian help chapters keyed by `HELP_CHAPTER_IDS` | [11-help-guidance-settings.md](11-help-guidance-settings.md) |
| `helpZones.js` | Maps UI zones to help chapter/section anchors | [11-help-guidance-settings.md](11-help-guidance-settings.md) |
| `fieldHelp.js` | Per-field tooltip text, keyed `entity.field` — consumed by `components/FieldHelp.jsx` and referenced by `bulkConstants` descriptors via `helpEntity`/`helpField` | [11-help-guidance-settings.md](11-help-guidance-settings.md) |
| `guidanceConstants.js` | Smart Guide rule definitions | [11-help-guidance-settings.md](11-help-guidance-settings.md) |
| `roadmapConstants.js` | Roadmap wizard modes and presets | [11-help-guidance-settings.md](11-help-guidance-settings.md) |
| `iconConstants.js` | FontAwesome class names by semantic name | below |
| `importConstants.js` | CSV/XLSX column dictionary | [09-verification-export.md](09-verification-export.md) |
| `validationRules.csv` | A CSV dump of `validationRules.js`, kept for the QA team. Not imported by any code. | — |

---

## 7.11 Adding a new validated field — checklist

1. **Backend first** — confirm the serializer accepts the field and whether it is
   `null=True` or `blank=True`. That decides `''` vs `null` in the payload builder.
2. Add `<FIELD>_MAX_LENGTH` and any allowed-value list to
   `Constants/<domain>Constants.js`.
3. Add the Latvian message(s) to that file's `ERROR_MESSAGES`.
4. Write `validate<Field>(value, …) → string|null` and call it from the
   composite `validate<Domain>Create`.
5. **Add the field to the payload builder** (`getItemUpdatePayload` /
   `getRecordUpdatePayload` / `getRecordCreatePayload`) — the backend has no
   partial updates, so a field missing from the payload is a field being erased.
6. Add label + placeholder to `Constants/uiStrings/<domain>UI.js`.
7. Add the field to `ITEM_FIELD_LABELS` / `ITEM_FIELD_SECTION_LABELS` (or the
   record equivalents) so section popups can route its errors.
8. Add a descriptor to `bulkConstants.js` if it should be bulk-editable.
9. Add a column to `importConstants.IMPORT_COLUMNS` if it should be importable.
10. Add the input to the `Create*` and `Edit*` forms, plus the relevant section
    popup. Give date inputs a `name` prop so DevAdmin's puppet can drive them.
11. Update the puppet recipe in `DevAdmin/formPuppetRecipes.js`.
