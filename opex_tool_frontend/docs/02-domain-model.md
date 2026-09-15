# 2. Domain Model & the Inheritance Engine

> Primary file: [src/Utils/InheritanceUtils.js](../src/Utils/InheritanceUtils.js) (1565 lines)

This chapter describes **what the data is** and **the single rule that shapes
every screen in the app**: the `(inventory.type, inventory.electronic)` pair.

---

## 2.1 The hierarchy

```
Project  (Projekts)
└── Institution  (Iestāde)          — creator/signer metadata
    └── Fond  (Fonds)
        └── Inventory[]  (Uzskaites saraksts)
            └── Item[]  (Glabāšanas vienība, "GV")
                ├── records[]        — textual records (Dokuments)
                │   ├── files[]
                │   └── metadata: actions[], addressees[], visas[], read_status[]
                ├── photo_records[]  — media records, one file each
                ├── video_records[]
                └── audio_records[]
```

A single `GET /api/v1/project/<id>/` returns this entire tree. Everything the UI
renders is a projection of that one object.

### Latvian ↔ English terms

| Latvian | English | Code field |
|---|---|---|
| Projekts | Project | `project` |
| Iestāde | Institution | `institution` |
| Fonds | Fond (archival fonds) | `fond` |
| Uzskaites saraksts | Inventory / accounting list | `inventory` |
| Glabāšanas vienība (GV) | Item / storage unit | `item` |
| Dokuments | Record | `record` |
| Datne / fails | File | `file` |
| Viza | Visa (endorsement) | `visa` |
| Adresāts | Addressee | `addressee` |
| Darbība | Action | `action` |
| Iepazīšanās statuss | Read status | `read_status` |
| Pastāvīgi glabājamās lietas | Permanent retention | `storage_term` |
| Ilgstoši glabājamās lietas | Long-term retention | `storage_term` |
| Uzskaites saraksts (eksports) | Inventory list XLSX | export |
| PN akts | Acceptance report DOCX | export |

---

## 2.2 Entity field reference

Fields are listed as the backend serialises them. Latvian labels come from
[Constants/uiStrings/](../src/Constants/uiStrings/).

### Project

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `name` | string | |
| `institution` | object | Populated only on the detail endpoint. |
| `isMissingReport` | bool | Client-side flag — when true the VVAIS report has not been uploaded and **all editing is blocked**. |

### Institution

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `name`, `code`, `address` | string | From the VVAIS report. |
| `creator` | string | Document creator's name. |
| `creator_position` | string | |
| `signer` | string | Signer's name. |
| `signer_position` | string | |
| `fond` | object | |

All four signer fields must be non-empty before OPEX generation is allowed —
see `validateProjectForOPEX`.

### Fond

| Field | Type |
|---|---|
| `id`, `number`, `name` | |
| `inventories` | array |

### Inventory (*Uzskaites saraksts*)

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `number` | int | Inventory number within the fond. |
| `type` | enum | `'Tekstuāls' \| 'Foto' \| 'Skaņas' \| 'Video'` |
| `electronic` | bool | **Half of the category key.** |
| `storage_term` | enum | `'Pastāvīgi glabājamās lietas' \| 'Ilgstoši glabājamās lietas'` |
| `subfond` | int | Default `0`. |
| `start_date` / `end_date` | date | Period covered. |
| `period_from` / `period_to` | year | Used by `YearPicker`. |
| `last_gv` | int | Highest item number issued. New items default to `last_gv + 1`. |
| `items_per_period` | int | Item count; maintained optimistically by `useItems`. |
| `from_report` | bool | `true` = came from the VVAIS report, `false` = user-created. Affects validation. |
| `items` | array | |

### Item (*Glabāšanas vienība*)

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `number` | int | **Assigned server-side** as `inventory.last_gv + 1`; a client-supplied value is overwritten. This is why bulk creates must be sequential. |
| `title` | string | Required. |
| `series_code` | string | Nomenclature code, e.g. `3.12` or `3.12.7`. |
| `start_date` / `end_date` | date | |
| `date_indicator` | enum | `'year' \| 'month' \| 'day'` — precision of the dates. |
| `unit_of_measure` | enum | `'Lapas' \| 'Dokumenti' \| 'Glabājamās vienības'` |
| `quantity` | int | |
| `language` | string | |
| `restriction` | enum | `'Vispārēja' \| 'Ierobežota' \| 'Sensitīvi dati'` |
| `restriction_notes` | string | Required when `restriction !== 'Vispārēja'`. |
| `security_level` | enum | `'Publisks' \| 'Iekšējs' \| 'Konfidenciāls' \| 'Slepens' \| 'Sevišķi slepens'` |
| `annotation` | string | Required for media types. |
| `sistematisation` | string | |
| `archival_history` | string | |
| `copy` | string/bool | |
| `notes` | string | |
| `records` | array | Textual records. |
| `photo_records`, `video_records`, `audio_records` | array | Media records — **only one of these is ever populated**, chosen by `inventory.type`. |

### Record (*Dokuments*) — textual

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `title` | string | **Required.** |
| `date` | date | **Required** by the verification pass. |
| `reg_nr`, `sent_reg_nr` | string | Registration numbers. |
| `group` | string | |
| `created_date`, `sent_date` | date | |
| `language` | string | |
| `annotation`, `key_words`, `notes` | string | |
| `nomenclature_nr` | string | |
| `format`, `tech_info` | string | Electronic documents only. |
| `access_restriction` | enum | `'open' \| 'closed'` |
| `access_restriction_notes`, `access_restriction_date`, `user_restriction_notes` | | |
| `files` | array | |
| `actions`, `addressees`, `visas`, `read_status` | array | Additional metadata. |

### Media record — photo / video / audio

Shares `title`, `date`, `format`, `tech_info`, `notes`, `annotation`,
`access_restriction`, plus subtype-specific fields:

| Field | Foto | Video | Audio |
|---|:--:|:--:|:--:|
| `color` (`'color'\|'grayscale'`) | ✔ | ✔ | |
| `horizontal_resolution` (int) | ✔ | ✔ | |
| `vertical_resolution` (int) | ✔ | ✔ | |
| `duration` (`HH:MM:SS`) | | ✔ | ✔ |

Media records do **not** support additional metadata classes.

### File

| Field | Type |
|---|---|
| `id` | int |
| `original_name` | string |
| `extension` | string (with dot, e.g. `.pdf`) |
| `size` | int (bytes) |

### Metadata classes

| UI key | API `class` | Typical fields |
|---|---|---|
| `actions` | `action` | task, executor, deadline, completion date |
| `addressees` | `addressee` | name, position, institution |
| `visas` | `visa` | signer, date, note |
| `read_status` | `read_status` | person, date, note |

---

## 2.3 The category system — the core rule

`(type, electronic)` maps to exactly one of four **categories**, and the category
decides the view mode, the record cardinality, the create workflow, the endpoints
and the validation rules.

```js
determineCategory(type, electronic)
```

| `type` | `electronic` | Category | View mode | Records per item |
|---|---|---|---|---|
| `Tekstuāls` | `false` | `DOCUMENTS` | `SEGMENTED` | 0..∞ |
| `Tekstuāls` | `true` | `ELECTRONIC_DOCUMENTS` | `SEGMENTED` | 0..∞, each with files |
| `Foto`/`Skaņas`/`Video` | `false` | `MEDIA` | `COMBINED` | 0..1, no file |
| `Foto`/`Skaņas`/`Video` | `true` | `ELECTRONIC_MEDIA` | `COMBINED` | 0..1, exactly one file |

Anything unrecognised falls back to `DOCUMENTS`.

**View modes**

- `SEGMENTED` — the item detail screen shows an overview panel *and* a separate
  records list. The user creates many records under one item.
- `COMBINED` — item and its single record are shown as one merged form. There is
  no records list.

### `CATEGORY_CONSTRAINTS` — the full table

Each category maps to a descriptor object. These are the actual values.

#### `DOCUMENTS` — Tekstuāls, non-electronic

```
behavior           ONE_TO_MANY          maxRecords  Infinity
viewMode           SEGMENTED            minRecords  0
displayName        'Dokumenti'          icon        📄
color              var(--color-primary)
workflow           step1 CREATE_RECORD_WITH_FORM / step2 NO_FILE_UPLOAD
                   requiresFileUpload false, allowsFileUpload false
primaryFields      title, date, reg_nr, group
requiredFields     title
supportsAdditionalMetadata  true  → action, addressee, visa, read_status
```

#### `ELECTRONIC_DOCUMENTS` — Tekstuāls, electronic

```
behavior           ONE_TO_MANY          maxRecords  Infinity
viewMode           SEGMENTED
displayName        'Elektroniskie Dokumenti'   icon 💾
color              var(--color-info)
workflow           step1 CREATE_RECORD_WITH_FORM / step2 ADD_FILES_AFTER
                   requiresFileUpload false, allowsFileUpload true,
                   allowsMultipleFiles true,
                   fileUploadTiming AFTER_RECORD_CREATION
primaryFields      title, date, reg_nr, group, format, tech_info
acceptedFileTypes  ['*/*']
supportsAdditionalMetadata  true
```

#### `ELECTRONIC_MEDIA` — Foto/Skaņas/Video, electronic

```
behavior           ONE_TO_ONE           maxRecords  1
viewMode           COMBINED
displayName        'Elektroniskais Medijs'   icon 🎬 (overridden per subtype)
color              var(--color-success)
workflow           step1 UPLOAD_FILE_FIRST / step2 ADD_METADATA_AFTER
                   requiresFileUpload true, allowsMultipleFiles false,
                   fileUploadTiming BEFORE_RECORD_CREATION
primaryFields      title, date, format, color, tech_info
optionalFields     horizontal_resolution, vertical_resolution, duration,
                   notes, annotation, access_restriction
acceptedFileTypes  set dynamically from MEDIA_SUBTYPE_CONFIG
supportsAdditionalMetadata  false
```

**The file comes first here.** The record does not exist until a file has been
uploaded — `POST /media_record/?item_id=…` creates both at once.

#### `MEDIA` — Foto/Skaņas/Video, non-electronic

```
behavior           ONE_TO_ONE           maxRecords  1
viewMode           COMBINED
displayName        'Medijs'             icon 📼
color              var(--color-secondary)
workflow           step1 CREATE_RECORD_WITH_FORM / step2 NO_FILE_UPLOAD
primaryFields      title, date, format, tech_info
optionalFields     notes, annotation, duration
supportsAdditionalMetadata  false
```

Describes analogue media held physically — a record with descriptive metadata but
no digital file.

### `MEDIA_SUBTYPE_CONFIG`

| Subtype | Icon | `acceptAttribute` | Accepted MIME types | Auto-extractable fields |
|---|---|---|---|---|
| `Foto` | 📷 | `image/*` | jpeg, jpg, png, gif, tiff, bmp | `horizontal_resolution`, `vertical_resolution`, `color` |
| `Video` | 🎥 | `video/*` | mp4, avi, mov, wmv, mkv | `duration`, `horizontal_resolution`, `vertical_resolution`, `color` |
| `Skaņas` | 🎵 | `audio/*` | mpeg, mp3, wav, aac, ogg, m4a | `duration` |

`manualFields` is `[]` for all three — everything is expected to be extracted
from the file by the backend. When extraction fails the UI falls back to manual
entry (`useCreateMediaRecord({ metadata, skipFileValidation: true })`).

---

## 2.4 `InheritanceUtils` function reference

### Enums

```js
INVENTORY_TYPES       { TEXTUAL:'Tekstuāls', PHOTO:'Foto', AUDIO:'Skaņas', VIDEO:'Video' }
CATEGORY_TYPES        { DOCUMENTS, ELECTRONIC_DOCUMENTS, ELECTRONIC_MEDIA, MEDIA }
MEDIA_INVENTORY_TYPES ['Foto','Skaņas','Video']
TEXTUAL_INVENTORY_TYPES ['Tekstuāls']
INHERITANCE_BEHAVIOR  { ONE_TO_MANY, ONE_TO_ONE }
VIEW_MODES            { SEGMENTED, COMBINED }
```

### `determineCategory(type, electronic) → CATEGORY_TYPES`

Pure mapping described above.

### `getInheritanceInfo(inventory) → InheritanceInfo`

**The most-called function in the codebase.** Given an inventory it returns the
category descriptor, flattened, plus a large set of convenience booleans.

A falsy inventory or one without `type` returns the `DOCUMENTS` descriptor —
callers never have to null-check.

**Returns**

| Field | Description |
|---|---|
| `category`, `type`, `electronic` | Identity. |
| `constraints` | A **copy** of the `CATEGORY_CONSTRAINTS` entry. For `ELECTRONIC_MEDIA` its `acceptedFileTypes`, `acceptAttribute` and `icon` are overwritten from `MEDIA_SUBTYPE_CONFIG`. |
| `mediaSubtype` | The `MEDIA_SUBTYPE_CONFIG` entry, or `null` for textual. |
| `behavior`, `maxRecords`, `allowMultiple`, `viewMode`, `description`, `displayName`, `icon`, `color`, `colorRgb`, `workflow`, `endpoints`, `primaryFields`, `requiredFields`, `optionalFields`, `supportsAdditionalMetadata`, `metadataClasses` | Flattened copies of the constraint fields. |
| `isDocuments`, `isElectronicDocuments`, `isElectronicMedia`, `isMedia` | Exact category tests. |
| `isTextual` | `DOCUMENTS \|\| ELECTRONIC_DOCUMENTS` |
| `isAnyMedia` | `MEDIA \|\| ELECTRONIC_MEDIA` |
| `isOneToOne`, `isOneToMany` | Cardinality. |
| `usesSegmentedView`, `usesCombinedView` | View mode. |
| `allowsFileUpload`, `requiresFileUpload` | Workflow shortcuts. |

### `validateRecordCreation(inventory, item) → { allowed, message, reason }`

Compares `item.records.length` against `maxRecords`. `reason` is `'OK'` or
`'MAX_RECORDS_REACHED'`.

> **Known gap.** It counts `item.records` only. For `ELECTRONIC_MEDIA`, records
> live in `photo_records` / `video_records` / `audio_records`, so the count is
> always 0 and the one-record cap is never enforced by this function. The UI
> enforces it separately by checking the media arrays.

### `getNavigationBehavior(inventory, item = null) → { action, reason, message, … }`

Tells the caller where to go after creating a record.

| Condition | `action` | Extra |
|---|---|---|
| combined view | `'navigateToItemCombined'` | `hasRecord` — true if any media array is non-empty |
| segmented view | `'stayAtItemSegmented'` | `recordCount` |
| neither | `'stayAtItem'` | |

### `getItemUIConfig(inventory, item) → object`

Bundles what an item card needs: `showCreateRecordButton`, `maxRecordsAllowed`,
`currentRecordCount`, `canCreateMore`, a `badge` (`{text,color,icon}`), the
`validation` result and the view-mode flags.

### `getItemAttentionStatus(inventory, item) → { level, message, icon, color }`

| Situation | `level` | Message |
|---|---|---|
| no records | `warning` | `Nav dokumentu` ⚠️ |
| one-to-one, 1 record, complete | `success` | `Pabeigts` ✓ |
| one-to-one, 1 record, incomplete | `info` | `Nepieciešams papildināt metadatus` ℹ️ |
| one-to-many | `info` | `<n> dokumenti` 📝 |
| fallback | `info` | `Normāls` |

### `getRecordStatistics(item, inventory) → Stats`

⚠️ **Argument order is `(item, inventory)`** — the opposite of most other
functions in this file.

Branches on category:

- **`ELECTRONIC_MEDIA`** — reads the media array matching `inventory.type`.
  "Complete" means:
  - Foto — `color && horizontal_resolution && vertical_resolution`
  - Video — `color && duration && horizontal_resolution && vertical_resolution`
  - Audio — non-blank `duration`
  Files are counted from each media record's nested `files` array.
- **everything else** — reads `item.records`. "Complete" means `title && date`.
  `hasMediaFiles` is inferred from file extensions
  (`.jpg .jpeg .png .gif .mp4 .avi .mp3 .wav`).

**Returns** `{ totalRecords, completedRecords, draftRecords, filesCount,
totalFileSize, totalFileSizeFormatted, hasMediaFiles, completionRate,
maxRecordsAllowed, canCreateMore }`.

> **Live bug.** `NavigationContext.getInventoryById` calls
> `InheritanceUtils.getRecordStatistics(inventory)` with a single argument. With
> `inventory` undefined the guard clause fires and the returned `statistics` is
> always all-zero. Any UI reading `getInventoryById(id).statistics` is showing
> zeros. Use `getInventoryStatistics(inventory)` instead.

### `getInventoryStatistics(inventory) → { totalItems, itemsWithRecords, totalRecords, completionRate }`

Correctly counts media arrays for `ELECTRONIC_MEDIA` and `records` otherwise.
`completionRate` is the share of items that have at least one record.

### `getProjectStatistics(project) → { totalInventories, totalItems, totalRecords }`

Sums `getInventoryStatistics` across the fond.

### `getItemCompletionStatus(item, inventory) → { status, message, color, percentage }`

| Condition | `status` | Message |
|---|---|---|
| 0 records | `empty` | `Nav dokumentu` |
| one-to-one, 1 complete record | `complete` | `Pabeigts` |
| `completionRate === 100` | `complete` | `Visi dokumenti pabeigti` |
| `completionRate > 0` | `partial` | `<n>% pabeigts` |
| otherwise | `draft` | `Melnraksts` |

### File helpers

| Function | Description |
|---|---|
| `getFileUploadConfig(inventory)` | `{ acceptAttribute, acceptedFileTypes, maxFiles, requiresUpload, allowsUpload, allowsMultiple, uploadTiming }`. `maxFiles` is **10** when multiple are allowed, else 1. |
| `isFileTypeAllowed(file, inventory)` | MIME test against `acceptedFileTypes`; returns `true` when the list is empty. |
| `calculateMediaFilesTotalSize(files)` | Sum of `file.size`, 0-safe. |
| `formatFileSize(bytes)` | `'1.5 MB'` — base 1024, units B/KB/MB/GB, 2 decimals. Returns `'0 B'` for 0/undefined. |
| `getFieldDisplayName(field)` | Latvian labels for `color`, `horizontal_resolution`, `vertical_resolution`, `duration`; passthrough otherwise. |

### Auto-extraction helpers

| Function | Description |
|---|---|
| `getExpectedAutoFields(mediaType)` | `autoExtractableFields` for the subtype, or `[]`. |
| `checkAutoExtractionComplete(mediaRecord, mediaType)` | `{ complete, populated, missing, failed }`. `failed` is true when *nothing* was extracted but fields were expected — the trigger for the manual-entry fallback. |
| `isFieldAutoExtracted(fieldName, mediaRecord)` | Value is not `null`/`undefined`/`''`. |

---

## 2.5 The validation cascade (pre-OPEX gate)

Four functions nest bottom-up. Every one returns the same envelope:

```js
{
  valid: boolean,                       // no errors
  status: 'VALID' | 'WARNING' | 'ERROR',
  errors: Issue[],
  warnings: Issue[],
  <child>Validations: [...],
  details: { totalIssues, criticalIssues, … }
}
```

`Issue` is `{ id, message, severity, field?, value?, threshold?, … }`. **`message`
may contain HTML** (`<strong>` around numbers and titles) — the Verification UI
renders it with `dangerouslySetInnerHTML`. Never put user input into a message
without escaping.

### `validateFile(file, category, inventoryType)`

| Id | Severity | Condition |
|---|---|---|
| `FILE_MISSING` | ERROR | no `original_name` |
| `FILE_ZERO_SIZE` | ERROR | `size === 0` |
| `FILE_TYPE_MISMATCH` | ERROR | `ELECTRONIC_MEDIA` and the extension does not match the subtype's list |
| `TEXTUAL_FILE_SMALL_SIZE` | WARNING | `ELECTRONIC_DOCUMENTS` and `0 < size < 2048` bytes |
| `FILE_MISSING_METADATA` | WARNING | missing `original_name` or `extension` |

Extension lists used here: images `.jpg .jpeg .png .gif .tiff .bmp`, video
`.mp4 .avi .mov .wmv .mkv`, audio `.mp3 .wav .aac .ogg .m4a`.

### `validateRecord(record, category, inventoryType)`

| Id | Severity | Condition |
|---|---|---|
| `RECORD_MISSING_TITLE` | ERROR | blank `title` |
| `RECORD_MISSING_DATE` | ERROR | no `date` |
| `ELECTRONIC_DOC_NO_FILES` | ERROR | `ELECTRONIC_DOCUMENTS` with zero files |
| `ELECTRONIC_MEDIA_NO_FILE` | ERROR | `ELECTRONIC_MEDIA` with zero files |
| `RECORD_MISSING_ANNOTATION` | WARNING | blank `annotation` |
| `RECORD_MISSING_KEYWORDS` | WARNING | blank `key_words` |
| `FILE_VALIDATION_FAILED` | ERROR | any child file failed; carries `fileErrors` |

### `validateItem(item, inventory)`

Branching by category:

**`ELECTRONIC_MEDIA`**

| Id | Severity | Condition |
|---|---|---|
| `ITEM_NO_MEDIA_RECORDS` | ERROR | the matching media array is empty |
| `MEDIA_RECORD_INCOMPLETE` | ERROR | missing required subtype fields (listed in Latvian in the message) |
| `PHOTO_LOW_HORIZONTAL_RESOLUTION` / `..._VERTICAL_...` | WARNING | resolution `< 1000` px |
| `VIDEO_SHORT_DURATION` / `AUDIO_SHORT_DURATION` | WARNING | parsed `HH:MM:SS` duration `< 60` s |

**Electronic textual** (`inventory.electronic === true`, not media)

| Id | Severity | Condition |
|---|---|---|
| `ITEM_NO_RECORDS` | ERROR | `item.records` empty |

**Physical items** (`electronic === false`) require **no** records — an item on
its own is valid. This is deliberate and called out in a code comment.

Always checked:

| Id | Severity | Condition |
|---|---|---|
| `ITEM_MISSING_TITLE` | ERROR | blank `title` |
| `ITEM_MISSING_NUMBER` | ERROR | no `number` |
| `ITEM_MISSING_NOTES` | WARNING | blank `notes` — **skipped** for `ELECTRONIC_DOCUMENTS` |
| `RECORD_VALIDATION_FAILED` | ERROR | rolled up from `validateRecord`, re-messaged with item context |

Child records are validated **only when `inventory.electronic` is true**.

### `validateInventory(inventory)`

| Id | Severity | Condition |
|---|---|---|
| `INVENTORY_MISSING_NUMBER` | ERROR | no `number` |
| `INVENTORY_MISSING_TYPE` | ERROR | no `type` |
| `INVENTORY_NO_ITEMS` | ERROR | **all three** of: no items, `from_report === false`, and a `start_date` or `end_date` is set |
| `ITEM_VALIDATION_FAILED` | ERROR | rolled up from `validateItem` with inventory context prefixed |

The three-way condition for `INVENTORY_NO_ITEMS` matters: report-sourced
inventories are allowed to be empty, and a user-created inventory with no dates
is treated as still being drafted.

`details` also aggregates `totalRecords` and `totalFiles` across the subtree.

### `validateProjectForOPEX(project)`

The top-level gate called by
[VerificationModal](../src/Verification/VerificationModal.jsx).

| Id | Severity | Condition |
|---|---|---|
| `MISSING_SIGNERS` | ERROR | any of `creator`, `creator_position`, `signer`, `signer_position` is falsy |
| `NO_INVENTORIES` | ERROR | no `institution.fond.inventories` — **returns early** |
| `INVENTORY_NOT_READY` | ERROR | any inventory validated as ERROR |

**Returns** the standard envelope plus:

```js
summary: {
  readyForOPEX,            // === (errors.length === 0)
  totalInventories,
  validInventories,        // status === 'VALID' (warnings do NOT count)
  inventoriesWithErrors,
  inventoriesWithWarnings,
  totalErrors,
  totalWarnings
}
```

**Warnings never block export** — only `errors` do.

---

## 2.6 Where the category rule surfaces

| Consumer | What it uses the category for |
|---|---|
| `Item/Item.js` | Chooses `SEGMENTED` vs `COMBINED` layout. |
| `Item/Items.js` | Badge colour, icon, attention status per row. |
| `Record/RecordsList.js` | Rendered only in segmented mode. |
| `Record/CreateMediaRecord.js` | Upload-first workflow, subtype-specific fields. |
| `Record/RecordFiles.js` | `acceptAttribute`, single vs multiple. |
| `Verification/*` | The whole validation cascade. |
| `Navigation/context/NavigationContext.js` | Decorates every lookup with `inheritanceInfo`. |
| `hooks/useOpexProgress.js` | Picks which record array to walk when building the file map. |
