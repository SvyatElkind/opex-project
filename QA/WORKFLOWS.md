# OPEX Tool Frontend -- User Workflows

This document describes every major user workflow in the OPEX Tool Frontend step by step. The application manages archival data in the hierarchy: **Project > Institution > Fond > Inventory > Item > Record > File**.

---

## 1. Project Lifecycle (End-to-End)

The full lifecycle from project creation to OPEX package export:

1. **Create project** -- Click "Jauns projekts", enter a project name (1-20 chars, letters/digits/underscore/hyphen only via `PROJECT_NAME_REGEX`), select a folder path (max 100 chars).
2. **Upload VVAIS report** -- Upload an `.xlsx` file (max 50 MB). The report auto-creates institution, fond, and inventories from the spreadsheet data. Inventories created from the report are flagged `from_report = true`.
3. **Set institution signers** -- Open the Institution signers popup. Fill in four required fields:
   - Izveidotājs (creator, max 30 chars)
   - Izveidotāja amats (creator position, max 200 chars)
   - Parakstītājs (signer, max 30 chars)
   - Parakstītāja amats (signer position, max 200 chars)
4. **Create inventories** -- Optionally create additional inventories (beyond those from the report). Select type, set electronic flag, pick dates, set storage term.
5. **Create items** -- Within each inventory, create items (glabajamas vienibas) with series code, title, dates, and metadata.
6. **Create records** -- Within each item, create textual document records or media records depending on inventory type.
7. **Upload files** -- Attach files to records. Textual records support multiple files; media records require exactly one file.
8. **Verify** -- Open the Verification Modal to run `validateProjectForOPEX()`. Review the tree view of errors/warnings across all inventories.
9. **Export** -- Once verified (zero errors), export:
   - Inventory list (uzskaites saraksts)
   - Acceptance report (PN akts) -- electronic or physical variant
   - OPEX package -- choose storage type: "Ilgstoši glabajamas lietas" or "Pastavigi glabajamas lietas"

---

## 2. Inventory Creation

**Path:** Project view > "Jauns uzskaites saraksts" button

### Steps:
1. Open the create modal (InventoryCreate component).
2. **Select type** (Veids) -- dropdown with four options:
   - `Tekstuāls` (Textual)
   - `Foto` (Photo)
   - `Video`
   - `Skaņas` (Audio)
3. **Set electronic flag** -- checkbox "Elektronisks:" (default: `true`). Determines whether items require file uploads.
4. **Pick dates** -- YearPicker components for start date (Datums no) and end date (Datums līdz). Both are year-based selectors.
5. **Set storage term** (Glabāšanas termiņš) -- dropdown:
   - `Pastāvīgi glabājamās lietas` (Permanent storage)
   - `Ilgstoši glabājamās lietas` (Long-term storage)
6. **Optional: Enable subfond** -- Toggle checkbox "Apakšfonds", then enter a subfond number (min 1).
7. **Submit** -- Validates via `validateInventoryCreate()`. Auto-assigns the next sequential number. On success, modal closes.

### Validation Rules:
- Type is required (`type_required`)
- Storage term is required (`storage_term_required`)
- Inventory number must be between 1-70 (`INVENTORY_MIN_NUM` / `INVENTORY_MAX_NUM`)
- Start date cannot be after end date (`date_order_invalid`)

### Prefill from Roadmap:
If initiated from the Roadmap Wizard, fields are pre-populated with `initialData` (type, electronic flag, storage term, dates). An info banner displays: "Lauki ir aizpildīti automātiski no ceļa kartes."

---

## 3. Inventory Editing

**Path:** Inventory item > Edit button

### Limited Editing Mode

An inventory enters limited editing mode when **either** condition is true:
- `from_report === true` (imported from VVAIS report)
- `total_items > 0` (inventory already has items)

**Locked fields in limited mode:**
- **Type** -- displayed as read-only text, cannot be changed
- **Electronic flag** -- hidden entirely, cannot be toggled

**Editable fields in limited mode:**
- Start date / End date (YearPicker)
- Storage term (dropdown)
- Subfond toggle and number

**Info messages:**
- From report: "Informācija par šo uzskaites sarakstu iegūta no VVAIS. Iespējams rediģēt tikai zemāk esošos laukus."
- Has items: Displays `ITEMS_EXIST_INFO_MESSAGE`

### Full Editing Mode

When `from_report === false` AND `total_items === 0`:
- Type is shown as read-only (set at creation) but electronic flag can be toggled
- All date and storage term fields are editable
- Subfond toggle and number are editable

### Why Fields Are Locked:
- **Type lock**: Changing inventory type after items/records exist would invalidate existing data (e.g., switching from Tekstuāls to Foto would break textual records).
- **Electronic flag lock** (limited mode): Toggling electronic status would change file requirements for existing items.
- **Report data lock**: VVAIS-imported data is authoritative and should not be manually altered.

---

## 4. Item Creation

**Path:** Inventory view > "Jauna glabājamā vienība" button

### Form Sections:
The EditItemNavigable form is divided into six navigable sections:
1. **Pamata informācija** (Basic) -- series code, number, title
2. **Datumi** (Dates) -- start/end dates, date indicator, date note
3. **Tehniskie dati** (Technical) -- size, unit of measure
4. **Apraksts** (Description) -- annotation, notes, language, systematisation
5. **Pieejamība** (Access) -- restriction, security level, restriction note
6. **Saistītie** (Related) -- related items from the same project

### Key Fields:

**Series code** (Sērijas kods):
- Format: `^(?!0\d*$)(\d{1,2}\.)*\d{1,2}$`
- Valid examples: `1`, `1.2`, `1.2.3`
- Invalid: `01`, `1.2.03` (no leading zeros)
- Max length: 20 characters

**Date picker with indicator** (Datuma indikators):
- Three precision levels: `year`, `month`, `day`
- Uses CalendarComponent with visual indicator showing current precision
- Affects how dates are stored and displayed

**Required vs conditional fields:**
- Title (`nosaukums`) -- always required (max 1000 chars)
- Number (`numurs`) -- always required, auto-assigned sequentially
- Language (`valoda`) -- required for all types EXCEPT `Foto` (controlled by `NOT_REQUIRE_LANGUAGE_TYPE`)
- Annotation (`saturs`) -- required for media types: `Foto`, `Skaņas`, `Video` (controlled by `REQUIRE_ANNOTATION_TYPE`)
- Restriction note -- required when restriction is `Ierobežota` or `Sensitīvi dati`
- Start date -- required
- End date -- required

**Available languages** (multi-select):
`latviešu, krievu, angļu, vācu, franču, spāņu, itāļu, poļu, lietuviešu, igauņu, somu, zviedru, norvēģu, dāņu, holandiešu, portugāļu, grieķu, turku, arābu, ķīniešu, japāņu, korejiešu, hindi, hebrejsku, čehu, slovāku, rumāņu, bulgāru, ungāru, ukraiņu, serbu, horvātu, cita`

**Unit of measure options** (Apjoma mērvienība):
- `Lapas` (Pages)
- `Dokumenti` (Documents)
- `Glabājamās vienības` (Storage units)

**Restriction options** (Pieejamība):
- `Vispārēja` (General)
- `Ierobežota` (Restricted)
- `Sensitīvi dati` (Sensitive data)

**Security level options** (Slepenība):
- `Publisks`, `Iekšējs`, `Konfidenciāls`, `Slepens`, `Sevišķi slepens`

---

## 5. Record Creation -- Textual (Tekstuāls)

**Path:** Item view (textual electronic inventory) > "Dokumenta pievienošana" button

### Form Sections:
The CreateDocumentRecord form has four navigable sections:
1. **Pamata informācija** (Basic) -- title, date, reg_nr, group
2. **Dokumenta dati** (Document) -- sent_date, sent_reg_nr, nomenclature_nr, language multi-select
3. **Apraksts** (Description) -- annotation, keywords, notes, tech_info
4. **Pieejamība** (Access) -- access_restriction (open/closed), restriction date, restriction notes

### Key Fields:

| Field | Max Length | Required |
|-------|-----------|----------|
| title (Nosaukums) | 500 | Yes |
| date (Datums) | -- | Yes |
| reg_nr (Reģ. Nr.) | 30 | No |
| group (Grupa) | 30 | No |
| sent_reg_nr (Nos. reģ. Nr.) | 30 | No |
| nomenclature_nr (Nomenklat. Nr.) | 30 | No |
| language (Valoda) | 200 | Conditional (not for Foto) |
| key_words (Atslēgvārdi) | 200 | No (warning if missing) |
| annotation (Anotācija) | 500 | No (warning if missing) |
| notes (Piezīmes) | 500 | No |
| tech_info (Tehn. info) | 500 | No |
| access_restriction | 10 | No |
| access_restriction_notes | 30 | Conditional |
| access_restriction_date | -- | Required when restriction = `closed` |
| user_restriction_notes | 30 | No |

### Access Restriction Logic:
- When `access_restriction = 'open'`: date field is hidden/disabled
- When `access_restriction = 'closed'`: date field becomes required (`access_restriction_date_required`)
- Setting date when restriction is `open` triggers error (`access_restriction_date_not_allowed`)

### Preset Support:
Form defaults are populated from active settings preset:
- `recordLanguage` -> initial language selection
- `keyWords` -> initial keywords value
- `notes` -> initial notes value
- `accessRestriction` -> initial access restriction

---

## 6. Record Creation -- Media (Foto/Video/Skaņas)

**Path:** Item view (media electronic inventory) > Create media record button

### Two-Step Workflow:

**Step 1: File Upload**
1. Drag-and-drop zone or file browser button
2. Only one file accepted per media record
3. File is uploaded immediately via `createMediaRecordMutation`
4. Backend auto-extracts metadata (resolution, color, duration) when possible
5. If all metadata auto-extracted successfully, the modal closes automatically

**Step 2: Metadata Entry** (only if auto-extraction is incomplete)
1. Pre-filled with any auto-extracted values (marked with "Auto" badge)
2. Manual entry for missing fields

### Required Metadata by Type:

| Field | Foto | Video | Skaņas |
|-------|------|-------|--------|
| color (Krāsa) | Required | Required | -- |
| horizontal_resolution | Required | Required | -- |
| vertical_resolution | Required | Required | -- |
| duration (Ilgums) | -- | Required | Required |

**Color options:** `grayscale` (Pelēktonis), `color` (Krāsains)

**Duration format:** `HH:MM:SS` (validated by `DURATION_REGEX: /^\d{1,2}:[0-5]\d:[0-5]\d$/`)

### File Type Validation:
Backend validates file types against inventory type:
- **Foto:** `.jpg, .jpeg, .png, .gif, .tiff, .bmp`
- **Video:** `.mp4, .avi, .mov, .wmv, .mkv`
- **Skaņas:** `.mp3, .wav, .aac, .ogg, .m4a`

On file type mismatch (400 response), the record IS created (file uploaded) but an error message is shown and user proceeds to metadata step.

---

## 7. File Management

**Path:** Record view > Files tab/section (RecordFiles component)

### Upload:
- **Textual records:** Multiple files allowed. Click "Add File" or drag-and-drop.
- **Media records:** Exactly one file per record (enforced by `ELECTRONIC_MEDIA_NO_FILE` rule).
- Drag-and-drop supported with visual feedback (isDragging state).
- File size displayed in formatted units (B/KB/MB/GB).

### File Display:
- **Table view:** Columns for name, extension, size, upload date
- **Card view:** Visual file cards with icons based on extension
- Side panel slides in from right showing file details when selected

### Delete:
- Confirmation popup (FileDeletePopup) before deletion
- Multi-select supported via checkboxes (`selectedFileIds` Set)
- Batch delete for multiple selected files
- Media files cannot be deleted independently (`cannot_delete_media_file`)

### Validation Warnings:
- Files over 500 MB trigger `FILE_LARGE_SIZE` warning
- Files under 2 KB (textual) trigger `TEXTUAL_FILE_SMALL_SIZE` warning
- Zero-size files trigger `FILE_ZERO_SIZE` error

---

## 8. Metadata Management

**Path:** Record view > Metadata section (RecordMetadata component)

Four metadata categories, each with CRUD operations:

### 8.1 Darbības (Actions)
Fields:
- `author` (Autors) -- required, text
- `responsible_person` (Atbildīgā persona) -- required, text
- `task` (Uzdevums) -- required, text
- `due_date` (Termiņš) -- required, date
- `created_date` (Izveidošanas datums) -- required, date
- `notes` (Piezīmes) -- optional, textarea

### 8.2 Adresāti (Addressees)
Fields:
- `addressee` (Adresāts) -- required, text

### 8.3 Vīzas (Visas)
Fields:
- `person` (Persona) -- required, text
- `date` (Datums) -- required, date
- `notes` (Piezīmes) -- optional, textarea

### 8.4 Lasīšanas statuss (Read Status)
Fields:
- `person` (Persona) -- required, text
- `date` (Datums) -- required, date
- `notes` (Piezīmes) -- optional, textarea

### Operations:
- **Create:** Toggle `isCreating` state, fill form, submit via `createMetadataMutation`
- **Edit:** Click on existing item, loads into `editingItem` state, update via `updateMetadataMutation`
- **Delete:** Confirmation dialog via `showConfirm()`, then `deleteMetadataMutation`

---

## 9. Verification Flow

**Path:** Project toolbar > "Projekta Statuss" button (VerificationModal)

### Steps:
1. **Open modal** -- VerificationModal opens with tabs: "Pārskats" (Overview) and tree view
2. **Run validation** -- `validateProjectForOPEX()` from InheritanceUtils executes automatically on open
3. **Review results:**
   - **Summary stats:** Total inventories (imported/created), items (electronic/physical), records, files, total file size
   - **Error count / Warning count** displayed prominently
   - **Ready for OPEX** indicator (green checkmark or red X)

### Filter Modes:
- `all` -- Show everything
- `issues` -- Show only items with errors or warnings
- `errors` -- Show only items with errors

### Tree View (VerificationTreeView):
- Hierarchical display: Project > Inventory > Item > Record > File
- Each node shows error/warning indicators
- Click on a node navigates to that entity for fixing
- Errors block OPEX generation; warnings are informational

### Validation Rules Applied:

**Project level:**
- `MISSING_SIGNERS` (ERROR) -- All four signer fields must be filled
- `NO_INVENTORIES` (ERROR) -- At least one inventory required
- `INVENTORY_NOT_READY` (ERROR) -- Aggregated from inventory validations

**Inventory level:**
- `INVENTORY_MISSING_NUMBER` (ERROR)
- `INVENTORY_MISSING_TYPE` (ERROR)
- `INVENTORY_NO_ITEMS` (ERROR) -- User-created inventory with dates but no items

**Item level:**
- `ITEM_MISSING_TITLE` (ERROR)
- `ITEM_MISSING_NUMBER` (ERROR)
- `ITEM_NO_RECORDS` (ERROR) -- Electronic textual items need at least one record
- `ITEM_NO_MEDIA_RECORDS` (ERROR) -- Electronic media items need corresponding media records
- `MEDIA_RECORD_INCOMPLETE` (ERROR) -- Missing required metadata fields by type
- `ITEM_MISSING_NOTES` (WARNING)
- `PHOTO_LOW_HORIZONTAL_RESOLUTION` (WARNING, threshold: 1000px)
- `PHOTO_LOW_VERTICAL_RESOLUTION` (WARNING, threshold: 1000px)
- `VIDEO_SHORT_DURATION` (WARNING, threshold: 60 seconds)
- `AUDIO_SHORT_DURATION` (WARNING, threshold: 60 seconds)

**Record level:**
- `RECORD_MISSING_TITLE` (ERROR)
- `RECORD_MISSING_DATE` (ERROR)
- `ELECTRONIC_DOC_NO_FILES` (ERROR) -- Electronic document needs at least one file
- `ELECTRONIC_MEDIA_NO_FILE` (ERROR) -- Electronic media needs exactly one file
- `RECORD_MISSING_ANNOTATION` (WARNING)
- `RECORD_MISSING_KEYWORDS` (WARNING)

**File level:**
- `FILE_MISSING` (ERROR)
- `FILE_ZERO_SIZE` (ERROR)
- `FILE_TYPE_MISMATCH` (ERROR) -- File extension must match inventory media type
- `FILE_LARGE_SIZE` (WARNING, threshold: 500 MB)
- `TEXTUAL_FILE_SMALL_SIZE` (WARNING, threshold: 2 KB)
- `FILE_MISSING_METADATA` (WARNING)

---

## 10. Export Flow

**Path:** Verification Modal > Export buttons (bottom action bar)

### Prerequisites:
- Project must pass verification (zero errors)
- `summary.readyForOPEX === true`

### Export Options:

**10.1 Export Inventory List**
- Uses `useExportInventoryList()` hook
- Generates a downloadable list of all inventories

**10.2 Export Acceptance Report (PN Akts)**
- Opens `ExportPopup` with two options:
  - **Elektroniskais** -- Electronic document acceptance report
  - **Fiziskais** -- Physical document acceptance report
- Uses `useExportAcceptanceReport()` hook with boolean parameter

**10.3 Generate OPEX Package**
- Opens `OpexPopup` with two storage type options:
  - **Ilgstoši glabājamās lietas** (Long-term)
  - **Pastāvīgi glabājamās lietas** (Permanent)
- Uses `useExportOpex()` hook
- Generates the final OPEX XML package with all metadata and file references

---

## 11. Settings

**Path:** Project toolbar > Settings gear icon

### Tabs:

**11.1 Attēlošana (Display)**
- **Theme:** `light`, `dark`, or `auto` (follows system preference)
- **Font size:** `medium` (default), configurable
- **Compact view:** Toggle for denser layout
- **Show breadcrumbs:** Toggle breadcrumb navigation visibility

**11.2 Formas (Forms)**
- **Form presets** -- Named configurations with defaults for:
  - Item language (`itemLanguage`)
  - Record language (`recordLanguage`)
  - Access restriction (`accessRestriction`)
  - Security level (`securityLevel`)
  - Restriction (`restriction`)
  - Keywords (`keyWords`)
  - Notes (`notes`)
- Default preset: "Noklusējums" with Latvian defaults
- Active preset ID tracked in settings

**11.3 Validācija (Validation)**
- **Master toggle:** Enable/disable all validation warnings
- **Specific toggles:**
  - File size warnings (`enableFileSizeWarnings`)
  - Duration warnings (`enableDurationWarnings`)
  - Image dimension warnings (`enableImageDimensionWarnings`)
  - Orientation warnings (`enableOrientationWarnings`)
- **Thresholds:**
  - Max file size: 100 MB (default)
  - Min file size: 0.01 MB (10 KB)
  - Max duration: 3600 seconds (1 hour)
  - Min duration: 1 second
  - Max image dimensions: 4000x4000 px
  - Min image dimensions: 800x600 px
  - Preferred orientation: `any`, `horizontal`, `vertical`, `square`

### Persistence:
- All settings stored in `localStorage` under key `opex_settings`
- Unsaved changes trigger confirmation dialog on close: "Ir nesaglabātas izmaiņas. Vai tiešām aizvērt?"
- Success notification: "Iestatījumi saglabāti!"

---

## 12. Dev Tools

**Path:** `Ctrl+Shift+D` to toggle DevAdmin panel (development builds only)

### Availability:
- **Always available:** `npm start` (development server)
- **Opt-in build:** `npm run build:dev`
- **Never included:** `npm run build` (production)

### Panel Features:
The DevAdminPanel is a draggable, minimizable floating window with 10 tabs:

| Tab | Component | Description |
|-----|-----------|-------------|
| State | ProjectStateInspector | Inspect current project data, React Query cache |
| Network | NetworkMonitor | Monitor API calls, response times, errors |
| Forms | FormInspector | Inspect form state, validation errors, dirty fields |
| Perf | PerformanceProfiler | Component render times, re-render counts |
| Tests | TestDashboard | Run built-in test suites |
| Errors | ErrorBoundaryTester | Trigger error boundaries, test error handling |
| Mocks | APIMockToggle | Enable/disable API mock responses |
| Storage | LocalStorageManager | View/edit/clear localStorage entries |
| Valid. | ValidationTester | Test validation rules with custom data |
| Actions | QuickActions | Quick action buttons for common dev tasks |

### Test Suites (TestDashboard):
Located in `src/DevAdmin/testing/suites/`:
- `validationTests.js` -- Validation rule tests
- `inheritanceTests.js` -- Inheritance utility tests
- `contextTests.js` -- React context tests
- `apiTests.js` -- API client tests
- `apiClientTests.js` -- Low-level API client tests
- `integrationTests.js` -- Integration tests
- `formValidationTests.js` -- Form validation tests
- `formWorkflowTests.js` -- Form workflow tests
- `stateManagementTests.js` -- State management tests
- `hookTests.js` -- Custom hook tests

### Usage:
1. Press `Ctrl+Shift+D` to open the panel
2. Select a tab from the top navigation
3. Panel can be dragged by its header
4. Minimize with the minimize button to save screen space
5. Close with the X button or `Ctrl+Shift+D` again
