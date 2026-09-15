# 15. Glossary

The codebase mixes Latvian domain vocabulary with English code identifiers, and
several concepts have three or four different names depending on the layer.
This chapter is the decoder ring.

---

## 15.1 Domain terms — Latvian ↔ English ↔ code

| Latvian | English | Code identifier | Notes |
|---|---|---|---|
| Projekts | Project | `project` | Top of the hierarchy; maps to a folder on disk |
| Iestāde | Institution | `institution` | Holds creator/signer metadata |
| Fonds | Fond (archival fonds) | `fond` | Single child of an institution |
| Uzskaites saraksts | Inventory / accounting list | `inventory` | Abbreviated **US** in the UI |
| Glabājamā vienība | Item / storage unit | `item` | Abbreviated **GV** everywhere |
| Dokuments | Record | `record` | Renamed from *ieraksts*; the old alias survives in the import format |
| Datne / fails | File | `file` | |
| Viza | Visa (endorsement) | `visa` / `visas` | Metadata class |
| Adresāts | Addressee | `addressee` / `addressees` | Metadata class |
| Darbība | Action | `action` / `actions` | Metadata class |
| Iepazīšanās statuss / Lasīšanas statuss | Read status | `read_status` | Metadata class — **always singular** |
| Sērijas kods | Series code | `series_code` | Nomenclature code, e.g. `3.12.7` |
| Datējums | Date range | `start_date` / `end_date` | |
| Datuma precizitāte | Date precision | `date_indicator` | `year \| month \| day` |
| Apjoms | Size / extent | `size` | With `unit_of_measure` |
| Apjoma mērvienība | Unit of measure | `unit_of_measure` | `Lapas \| Dokumenti \| Glabājamās vienības` |
| Pieejamība | Access restriction | `restriction` (item) / `access_restriction` (record) | **Different fields, same label** |
| Slepenība | Security level | `security_level` | |
| Sistematizācija | Systematisation | `sistematisation` | Note the spelling in code |
| Anotācija | Annotation | `annotation` | |
| Saturs | Content | `annotation` (on items) | The item form labels `annotation` as *Saturs* |
| Atslēgvārdi | Keywords | `key_words` | |
| Lietas Nr. | Nomenclature number | `nomenclature_nr` | |
| Reģistrācijas Nr. | Registration number | `reg_nr` | |
| Arhīva vēsture | Archival history | `archival_history` | |
| Kopija | Copy | `copy` | |
| Litera | Postfix | `postfix` | 1–3 characters appended to an inventory number |
| Glabāšanas termiņš | Storage term | `storage_term` | |
| Pastāvīgi glabājamās lietas | Permanent retention | `'Pastāvīgi glabājamās lietas'` | |
| Ilgstoši glabājamās lietas | Long-term retention | `'Ilgstoši glabājamās lietas'` | |
| Parakstītāji | Signers | `creator`, `signer` + `_position` | All four required before OPEX |
| Uzskaites saraksts (eksports) | Inventory list export | `useExportInventoryList` | XLSX |
| PN akts / Pieņemšanas-nodošanas akts | Acceptance report | `useExportAcceptanceReport` | DOCX |
| Maršruts | Route | `route` | A roadmap goal set |
| Vadlīnijas | Guidance | `guidance` | The Smart Guide card |
| Priekšiestatījums | Preset | `formPresets` | Form default bundles |
| Pārbaude | Verification | `Verification/` | The pre-OPEX gate |

---

## 15.2 Acronyms and product names

| Term | Meaning |
|---|---|
| **OPEX** | The archival package format this tool produces. Also the product name. |
| **VVAIS** | *Valsts vienotā arhīvu informācijas sistēma* — the national archive information system. Its XLSX report seeds a project's institution, fond and inventories. |
| **US** | *Uzskaites saraksts* — inventory. Shown as `US 3` in the UI. |
| **GV** | *Glabājamā vienība* — item. Used in `last_gv`, `GV:12` import references, `{GVNOS}` template placeholders. |
| **PN akts** | *Pieņemšanas-nodošanas akts* — acceptance/handover report. |
| **DRF** | Django REST Framework — the backend serializer layer whose error shapes `errorService` parses. |

---

## 15.3 The same concept under different names

### Metadata classes — four vocabularies

| Layer | Form | Example |
|---|---|---|
| UI state / `RecordMetadata.sections[].key` | plural | `actions`, `addressees`, `visas`, `read_status` |
| API `?class=` parameter | singular | `action`, `addressee`, `visa`, `read_status` |
| `RecordValidation.validateMetadata` | Capitalised singular | `Action`, `Addressee`, `Visa`, `ReadStatus` |
| Backend response keys | mixed | `actions`, `addressees`, `visas`, **`read_status`** |

`mapMetadataTypeToClass` in `hooks/useMetadata.js` converts UI → API. Nothing
converts to the `validateMetadata` form; call sites hard-code it.

### Media types

| Context | Photo | Audio | Video |
|---|---|---|---|
| `inventory.type` | `Foto` | `Skaņas` | `Video` |
| Media-record API `?type=` | `Foto` | **`Audio`** | `Video` |
| `getRecordTypeForItem` | `photo` | `audio` | `video` |
| Record array on an item | `photo_records` | `audio_records` | `video_records` |

`getAPITypeFromInventory` in `Utils/RecordValidation.js` performs the
`Skaņas → Audio` translation.

### Colour values

| Context | Values |
|---|---|
| API / `validateMediaRecordData` | `'color'`, `'grayscale'` |
| `itemConstants.COLOR_FIELD_VALUES` | `'melnbaltā'`, `'krāsainā'` |

The first pair is the wire format; the second is display text.

### The relation list

| Context | Key |
|---|---|
| Project-detail payload | `related_item` |
| Item PUT/POST response | `related_items` |
| Request payload | `related_item_list` |

`getItemUpdatePayload` reads **both** response forms — omitting either causes an
item edited twice in a row to lose all its relations.

---

## 15.4 Code-level vocabulary

### Category system

| Term | Meaning |
|---|---|
| **Category** | One of `DOCUMENTS`, `ELECTRONIC_DOCUMENTS`, `MEDIA`, `ELECTRONIC_MEDIA`, derived from `(type, electronic)` |
| **View mode** | `SEGMENTED` (item + separate records list) or `COMBINED` (item and its single record merged) |
| **Behavior** | `ONE_TO_MANY` or `ONE_TO_ONE` — records per item |
| **Inheritance info** | The object `getInheritanceInfo(inventory)` returns: category, constraints and ~20 convenience booleans |
| **Constraints** | The `CATEGORY_CONSTRAINTS[category]` descriptor: workflow, endpoints, field lists, icons |

### Validation

| Term | Meaning |
|---|---|
| **Envelope** | `{ valid, status, errors, warnings, <child>Validations, details }` — the shape every `InheritanceUtils` validator returns |
| **Issue** | `{ id, message, severity, field?, … }`. `message` may contain HTML |
| **ERROR** | Blocks OPEX generation |
| **WARNING** | Informational; never blocks |
| **Cascade** | `validateFile → validateRecord → validateItem → validateInventory → validateProjectForOPEX` |
| **Cross-section error** | A validation failure on a field the open section popup does not display |
| **Rule catalogue** | `Constants/validationRules.js` — documentation data, not executable |

### Forms

| Term | Meaning |
|---|---|
| **`*Navigable` form** | The canonical multi-section form: sticky left nav, one flat `formData`, validate-on-submit, portal-rendered |
| **Section popup** | A small "edit just this section" modal built on `SectionEditPopup` |
| **Preset** | A `formPresets` entry supplying create-form defaults |
| **Payload builder** | `getItemUpdatePayload` etc. — the single source of truth for a full PUT body |
| **`MIXED`** | A `Symbol` marking a bulk-edit field whose selected entities disagree. Must be stripped by `plain()` before it reaches a payload |

### Import

| Term | Meaning |
|---|---|
| **Grid** | `string[][]` — the raw cell matrix from the CSV or XLSX reader |
| **Entry** | One mapped row: `{ rowNumber, type, payload, parent, ok, message }` |
| **TIPS** | The row-type column: `GV` = item, `DOK` = record |
| **SAITE** | The parent-link column: `GV:12` = existing item, any key = a key declared by an item row, empty = nearest item row above |
| **Phase** | `items → sync → records → finished`; `sync` re-reads the project to learn new item ids |

### DevAdmin

| Term | Meaning |
|---|---|
| **Puppet** | The form-automation engine that drives real React forms via native value setters |
| **Recipe** | An array of `{ label, action, expect? }` steps, registered in `RECIPES` |
| **Step** | One puppet action, with an optional `expect` assertion checked after the run |
| **Middleware** | A `window.fetch` interceptor registered through `fetchInterceptor.addMiddleware` |
| **Suite** | An in-browser test group registered with `runner.registerSuite(name, fn)` |
| **Manifest** | `public/files/manifest.json` — the list of available test fixtures |

---

## 15.5 File-name conventions

| Pattern | Meaning |
|---|---|
| `<Domain>_API.js` | **Legacy** HTTP module returning `[ok, payload]` tuples. Do not extend. |
| `use<Thing>.js` | A hook |
| `<Domain>Constants.js` | Field limits + validators + Latvian messages |
| `<domain>UI.js` | Latvian UI strings |
| `Create<Entity>Navigable.js` / `Edit<Entity>Navigable.js` | Multi-section forms |
| `<Entity><Section>SectionPopup.jsx` | Section-edit popup |
| `Bulk<Entity>Popup.jsx` / `MultiCreate<Entity>Popup.jsx` / `Import<Entity>Popup.jsx` | Domain wrappers around a shared shell |
| `*.test.js` | A **Jest** test (only 3 exist) |
| `DevAdmin/testing/suites/*.js` | An **in-browser** suite, not run by `npm test` |

---

## 15.6 Wire formats

| Data | Format | Note |
|---|---|---|
| Date on the API | `YYYY-MM-DD` | Always |
| Date shown to the user | `DD.MM.YYYY` | Always |
| Month precision displayed | `MM.YYYY` | Regardless of the format setting |
| Year precision displayed | `YYYY` | |
| Duration | `HH:MM:SS` | Regex differs between `itemConstants` (2-digit hours) and `recordConstants` (1–2) |
| Access restriction | `'open'` / `'closed'` | Latvian labels are display-only |
| Colour | `'color'` / `'grayscale'` | |
| Resolution | integer pixels | |
| File size | bytes | Formatted for display by four different local helpers |
| Report upload | raw `ArrayBuffer`, `application/octet-stream`, filename in `Content-Disposition` | No size limit, deliberately |
| Multi-file upload | `multipart/form-data`, repeated field name `files` | |
