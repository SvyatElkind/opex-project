# 9. Verification & Export

> Directory: [src/Verification/](../src/Verification/)

The Verification modal is the **pre-OPEX gate**: it validates the whole project
tree, shows what is wrong and where, and is the only place from which the three
exports are launched.

Opened from the *Status* button in the top bar (`handleProjectDetails` in
`Project.js`) or by dispatching the `openValidationModal` window event.

---

## 9.1 Module map

| File | Export | Role |
|---|---|---|
| `VerificationModal.jsx` (1405 lines) | default | The modal: 3 tabs, stats, export launchers |
| `VerificationTreeView.jsx` | default | Recursive tree over the project |
| `TreeNode.jsx` | default | One node, with status icon and actions |
| `ErrorPanel.jsx` | default | Side panel listing a node's issues |
| `VerificationSummary.jsx` | default | Compact summary card |
| `index.js` | barrel | Re-exports Modal, Summary, TreeView, TreeNode (**not** ErrorPanel) |

---

## 9.2 `VerificationModal`

```jsx
<VerificationModal
  isOpen onClose
  projectData
  onOpenSigners onOpenRoadmap
  onToast          // (header, paragraph) => void — Project.js's legacy toast
/>
```

### Tabs

| `activeTab` | Label | Content |
|---|---|---|
| `'info'` | Info | Project/institution/fond metadata, timestamps, folder path |
| `'pārskats'` | Pārskats | **Default.** Statistics + the verification tree |
| `'ceļvedis'` | Ceļvedis | Roadmap routes with live progress from `calculateProgress` |

### Statistics (`stats`, memoised)

Combines `validationResult.summary` with a fresh walk of the project tree:

| Field | Source |
|---|---|
| `readyForOPEX`, `totalInventories`, `validInventories`, `inventoriesWithErrors` | `summary` |
| `importedInventories` / `createdInventories` | count of `inventory.from_report` |
| `totalItems` | sum of `details.itemsValidated` |
| `totalRecords` | sum of `item.records.length` — **textual only** |
| `totalFiles`, `totalFileSize` | textual record files **plus** all three media arrays |
| `physicalItems` / `electronicItems` | by `inventory.electronic` |
| `totalErrors` | sum of `details.criticalIssues` |
| `totalWarnings` | sum of `validation.warnings.length` |

> `totalRecords` counts only `item.records`, while `totalFiles` also walks
> `photo_records` / `video_records` / `audio_records`. A photo inventory
> therefore reports files but zero records. `guideData` (the per-inventory
> breakdown table) has the same asymmetry.

File size is read as `file.size || file.file_size || 0` for textual files but
only `file.size` for media files.

### Filters and dismissal

- **`filterMode`** — `'all'` or `'errors'`, a toggle switch above the tree.
- **`showPhysical`** — include non-electronic inventories in the tree.
- **Dismissed warnings** persist to `localStorage['opex_dismissed_warnings']` as
  `{ [projectId]: string[] }`. The key for one warning is
  `` `${issue.label}::${issue.message}` `` — so **editing a message string
  silently un-dismisses every warning users had already dismissed**.

  API: `dismissWarning(key)`, `dismissAllWarnings(warnings)` (deduped through a
  `Set`), `resetDismissedWarnings()`, `isWarningDismissed(issue)`.

- **`stripHtml(html)`** strips tags from validation messages for contexts that
  cannot render markup (tooltips, `title` attributes).

### Export actions

Three buttons, two of them behind a confirmation popup.

| Action | Handler | Hook | Result |
|---|---|---|---|
| **Uzskaites saraksts** (XLSX) | `handleExportInventoryList` | `useExportInventoryList` | Backend writes the file into the project folder; the response path is shown in a toast. |
| **PN akts** (DOCX) | `handleExportAcceptanceReport(electronic)` | `useExportAcceptanceReport` | `ExportPopup` asks Elektroniskais vs Fiziskais → `?electronic=true|false`. |
| **OPEX pakotne** | `handleGenerateOpex(includeLongTerm)` | — | `OpexPopup` asks *Ilgstoši* (`false`) vs *Pastāvīgi* (`true`), then opens `OpexProgressModal`. |

> **The OPEX button does not call `useExportOpex`.** `handleGenerateOpex` only
> records the choice and opens `OpexProgressModal`, which uses
> [`useOpexProgress`](04-hooks.md#49-useopexprogressjs) — that hook opens the
> WebSocket *first* and fires the export request from `ws.onopen`, so no progress
> messages are missed. `useExportOpex` is imported but effectively unused here.

Both `ExportPopup` and `OpexPopup` are local components in the same file: overlay
click closes, inner click `stopPropagation`, buttons disabled while pending.
Root class `.export-popup` — a selector the DevAdmin puppet waits on.

Neither export is gated on `readyForOPEX` in the UI; the backend is the enforcer.

The modal also defines its own local `formatFileSize` (with a `TB` unit, unlike
the other three copies) and a `formatDate` using `toLocaleDateString('lv-LV')`.

---

## 9.3 `VerificationTreeView`

```jsx
<VerificationTreeView
  validationResult projectData
  expandAll={false}
  onNodeClick onNavigateToNode
  filterMode="all" showPhysical={false}
  dismissWarning dismissAllWarnings isWarningDismissed
  dismissedWarningCount resetDismissedWarnings
/>
```

Builds **Inventory → Item → Record → File** and re-runs `validateInventory`,
`validateItem` and `validateRecord` per node so each level carries its own status
(the top-level result only aggregates).

```js
MEDIA_RECORD_KEYS = { 'Foto': 'photo_records', 'Video': 'video_records', 'Skaņas': 'audio_records' }
```

`expandedNodes` is a `Set` of node ids, seeded with the sentinel `'all'` when
`expandAll` is set. Selecting a node fills `errorPanelData` for `ErrorPanel`.

Renders an empty state — *"Nav pieejami validācijas dati"* — when either prop is
missing.

## 9.4 `TreeNode`

```jsx
<TreeNode
  nodeId level entity validation
  expanded onToggle onSelect onNavigate
  inventoryNumber onShowErrors hasChildren isSelected
  children
/>
```

`level` ∈ `'inventory' | 'item' | 'record' | 'file'`.

| `level` | Latvian type label | Node label |
|---|---|---|
| `inventory` | Uzskaites Saraksts | `US <number>` (or `US N/A`) |
| `item` | Glabājamā vienība | `<number>. <title>` (`Bez nosaukuma` fallback) |
| `record` | Dokuments | `title` |
| `file` | Fails | `original_name` |

The status icon comes from `STATUS_ICONS[validation.status]`, defaulting to
`ERROR` for an unknown status. `onNavigate` calls the modal's `navigateTo`, which
closes the modal and jumps into the tree.

`hasChildren` is passed explicitly rather than inferred, so an inventory with
zero items still renders as collapsible rather than as a leaf.

## 9.5 `ErrorPanel` / `VerificationSummary`

`ErrorPanel` lists a selected node's errors and warnings with per-warning dismiss
controls. Because messages may contain `<strong>` markup they are rendered as
HTML — see the warning in
[02-domain-model.md](02-domain-model.md#25-the-validation-cascade-pre-opex-gate).

`VerificationSummary({ validationResult, projectData })` is the compact
"N errors / M warnings / ready?" card.

---

## 9.6 The three exports, end to end

### Uzskaites saraksts (inventory list, XLSX)

`GET /project/<pid>/export/inventories/` → `{ success: [message, savedPath] }`.
The backend writes the file into the project folder on the user's disk; the
frontend only reports the path. **Nothing is downloaded through the browser.**

### PN akts (acceptance report, DOCX)

`GET /project/<pid>/export/acceptance_report/?electronic=<bool>` — same
write-to-disk-and-report-path contract. Two variants:

- `electronic=true` — Elektronisko dokumentu akts
- `electronic=false` — Fizisko dokumentu akts

### OPEX package

The only export with live progress.

```
OpexPopup                 user picks storage term
  └─ OpexProgressModal    mounts with { projectData, includeLongTerm }
       └─ useOpexProgress
            1. build fileId → {file, record, item, inventory} lookup from the tree
            2. open ws://<host>:8000/ws/opex_progress/
            3. in ws.onopen → GET /api/v1/project/<pid>/export/opex_package/?long=<bool>
            4. stream file / zipping / project messages into progress state
```

`includeLongTerm` maps to the `?long=` query parameter:

| Choice | `includeLongTerm` | `?long=` | Included |
|---|---|---|---|
| Ilgstoši glabājamās lietas | `false` | `false` | only `Pastāvīgi glabājamās lietas` inventories |
| Pastāvīgi glabājamās lietas | `true` | `true` | both storage terms |

> The button labels read as "which set do I want" while the flag reads as
> "also include long-term". The lookup builder in `useOpexProgress` skips
> `storage_term === 'Ilgstoši glabājamās lietas'` when `includeLongTerm` is
> false — so the two agree, but the naming is inverted from the label.

Only **electronic** inventories contribute files.

Progress phases: `idle → connecting → exporting → exported → zipping → done`,
or `error`. See [04-hooks.md](04-hooks.md#websocket-message-protocol) for the
message protocol.

**Requires uvicorn (ASGI).** Under plain WSGI the socket never opens and the
modal shows *"WebSocket kļūda — pārliecinieties ka backend darbojas ar uvicorn"*.

---

# 9B. Spreadsheet Import (CSV / XLSX)

> Feature flag: `settings.experimental.spreadsheetImport`, **off by default**.
> While off there is no entry point in the UI at all.

Pipeline:

```
File → csvParser.parseCsvFile  ─┐
       xlsxReader.parseXlsxFile ─┴→ string[][] grid
                                     ↓
                        importMapper.mapImportRows
                                     ↓
                    entries: [{ rowNumber, type, payload, parent, ok, message }]
                                     ↓
                        ImportPopup preview  → user approves
                                     ↓
                   useBulkRunner → bulkApi.createItem / createRecord
```

The reader and mapper modules are documented in
[06-utilities.md](06-utilities.md); the popup shell in
[08-shared-components.md](08-shared-components.md#810-importpopupjsx). This
section covers **the file format**.

## 9B.1 One table, self-describing rows

CSV has no sheets, so "items on one sheet, records on another" cannot work.
Instead **every row declares its own type** in a `TIPS` column and its parent in
a `SAITE` column.

### `TIPS` — row type

| Accepted value | Row type |
|---|---|
| `GV`, `ITEM`, `VIENIBA` | item |
| `DOK`, `RECORD`, `DOKUMENTS`, `IERAKSTS` | record |

`IERAKSTS` is kept from before the *ieraksts → dokuments* rename: it is an alias
accepted in files users already have, not text the app shows. Removing it would
break previously working import files.

### `SAITE` — parent link (aliases `ATSLĒGA`, `SAITE_UZ_GV`)

| Value on a record row | Meaning |
|---|---|
| `GV:12` | Attach to the **existing** item numbered 12 |
| any other key | Attach to the item row that declared the same key in its `SAITE` |
| empty | Attach to the nearest item row above |

On an **item** row, `SAITE` declares that row's key. Duplicate keys fail the
second occurrence.

## 9B.2 Column dictionary

Headers are matched case-insensitively, diacritic-insensitively, and with spaces
or dots normalised to underscores — `Sērijas kods`, `SERIJAS_KODS` and
`sērijas kods` all resolve to `SĒRIJAS_KODS`.

**Required columns**

| Row type | Required |
|---|---|
| item | `SĒRIJAS_KODS`, `NOSAUKUMS`, `DATUMS_NO`, `DATUMS_LĪDZ` |
| record | `NOSAUKUMS`, `DATUMS`, `REĢ_NR`, `IZVEIDOŠANAS_DATUMS`, `NOSŪTĪŠANAS_DATUMS`, `LIETAS_NR` |

**Item columns**

| Column | Field | Kind |
|---|---|---|
| `SĒRIJAS_KODS` | `series_code` | text |
| `NOSAUKUMS` ✻ | `title` | text |
| `DATUMS_NO` | `start_date` | date (snap start) |
| `DATUMS_LĪDZ` | `end_date` | date (snap end) |
| `DATUMA_PRECIZITĀTE` | `date_indicator` | enum via `PRECISION_MAP` |
| `DATUMA_PIEZĪMES` | `date_note` | text |
| `VALODA` ✻ | `language` | list |
| `SATURS` | `annotation` | text |
| `PIEZĪMES` ✻ | `notes` | text |
| `SISTEMATIZĀCIJA` | `sistematisation` | text |
| `APJOMS` | `size` | int |
| `APJOMA_MĒRVIENĪBA` | `unit_of_measure` | enum |
| `PIEEJAMĪBA` ✻ | `restriction` | enum |
| `PIEEJAMĪBAS_PAMATOJUMS` | `restriction_note` | text |
| `SLEPENĪBA` | `security_level` | enum |
| `SLEPENĪBAS_PIEZĪMES` | `security_level_note` | text |
| `KOPIJA` | `copy` | text |
| `ARHĪVA_VĒSTURE` | `archival_history` | text |

**Record columns**

| Column | Field | Kind |
|---|---|---|
| `NOSAUKUMS` ✻ | `title` | text |
| `DATUMS` | `date` | date |
| `REĢ_NR` (alias `REGISTRĀCIJAS_NR`) | `reg_nr` | text |
| `IZVEIDOŠANAS_DATUMS` | `created_date` | date |
| `NOSŪTĪŠANAS_DATUMS` | `sent_date` | date |
| `NOSŪTĪTĀJA_REĢ_NR` | `sent_reg_nr` | text |
| `LIETAS_NR` (alias `NOMENKLATŪRAS_NR`) | `nomenclature_nr` | text |
| `GRUPA` | `group` | text |
| `ATSLĒGVĀRDI` | `key_words` | list |
| `ANOTĀCIJA` | `annotation` | text |
| `VALODA` ✻ | `language` | list |
| `PIEZĪMES` ✻ | `notes` | text |
| `TEHNISKĀ_INFORMĀCIJA` | `tech_info` | text |
| `PIEEJAMĪBA` ✻ | `access_restriction` | enum via `RECORD_ACCESS_MAP` |
| `IEROBEŽOJUMA_DATUMS` | `access_restriction_date` | date |
| `IEROBEŽOJUMA_PIEZĪMES` | `access_restriction_notes` | text |
| `LIETOŠANAS_NOSACĪJUMI` | `user_restriction_notes` | text |

✻ **Shared headers.** Five columns are deliberately shared between the two row
types to keep the table narrow — the row type decides which model field they
write. `PIEEJAMĪBA` is the sharpest example: on an item row it writes
`restriction` (`Vispārēja`/`Ierobežota`/`Sensitīvi dati`), on a record row it
writes `access_restriction` (`open`/`closed`).

### Enum vocabularies

```js
PRECISION_MAP     DIENA|DAY → day, MENESIS|MONTH → month, GADS|YEAR → year
RECORD_ACCESS_MAP VISPAREJA|OPEN|ATVERTS → open, IEROBEZOTA|CLOSED|SLEGTS → closed
```

Value lists (`restriction`, `security_level`, `unit_of_measure`) are matched
case- and diacritic-insensitively but **stored in canonical form**.

### Date formats accepted

| Written | Precision | Start snaps to | End snaps to |
|---|---|---|---|
| `2020-01-15`, `15.01.2020`, `15/01/2020`, `15-01-2020` | day | as given | as given |
| `2020-01`, `01.2020`, `01/2020` | month | 1st | last day |
| `2020` | year | Jan 1 | Dec 31 |

Real Excel date cells are converted to `YYYY-MM-DD` by `xlsxReader` before the
mapper sees them.

## 9B.3 Limits and guards

| Constant | Value | Meaning |
|---|---|---|
| `MAX_IMPORT_ROWS` | 1000 | Hard ceiling — a browser is not a batch processor. |
| `WARN_IMPORT_ROWS` | 200 | Above this the popup warns about duration. |
| `PREVIEW_ROW_LIMIT` | 200 | Preview table cap, so a 900-row file does not freeze the popup. |

**`looksLikeExportTemplate(rows)`** detects the tool's own XLSX export being fed
back in. That file is a report form with several values merged into one cell, so
it cannot be imported — better to recognise it and say so than to fail row by
row. It matches `UZSKAITES SARAKSTS`, `{GVNOS}`, or `APRAKSTĪŠANAS` +`FONDA` in
the first 12 rows.

**Example files** ship in `public/examples/` and are referenced through
`exampleUrl(key)`:

| Key | File |
|---|---|
| `xlsx` | `examples/imports_paraugs.xlsx` |
| `csv` | `examples/imports_paraugs.csv` |
| `csvItems` | `examples/imports_tikai_vienibas.csv` |
| `csvRecords` | `examples/imports_tikai_dokumenti.csv` |

## 9B.4 Two-phase execution

Item and record rows cannot be sent in one pass: the item POST response carries
`number` but **not** `id`, and a record needs its parent's `id`.

```
phase 'items'    → POST every approved item row, sequentially
phase 'sync'     → bulkApi.getProject(projectId) — re-read the tree to learn the new ids
phase 'records'  → POST every approved record row against its resolved parent
phase 'finished'
```

`useBulkRunner` is called with `{ append: true }` for the record phase and
`expectedTotal` set up front, so the user sees **one** progress bar across all
three phases.

Creation is sequential throughout, because `Item.add_item()` derives the GV
number from `inventory.last_gv` server-side and parallel POSTs would race.

## 9B.5 Validation before sending

Every row is validated in the browser using **the same validators the manual
forms use** — `validateItemCreate` and `validateTextRecordCreate` — plus
`missingRecordFieldMessage` for three fields the record validator does not cover
(`created_date`, `sent_date`, `nomenclature_nr`).

Record dates are checked against the parent's range, which works for a
not-yet-created parent because its dates were already parsed.

Failing rows are **kept with a reason**, never dropped, so the preview shows
exactly what the file got wrong. Only rows with `ok: true` are sent.
