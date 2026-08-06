# OPEX Tool — Complete Help Section Specification

> **Purpose of this document:** A full specification of what the Help section should contain — every topic, workflow, concept, and edge case — written for OPUS to investigate, expand, and author the final content. This is NOT the help text itself; it is the blueprint.

> ### ⚠️ CORRECTION PASS (verified against code, 2026-06-03; updated 2026-06-12)
> This blueprint was written from intent, not from the source code. It has been cross-checked against the actual implementation. **Inline `✅ CORRECTION` / `⚠️ VERIFY` callouts mark every place where the original spec was wrong** — author from the corrected value, not the surrounding text. Callouts cite the source file. Uncorrected sections were checked and found accurate.
>
> **2026-06-12 update:** Added notes to §5.3 (stale `.flac`/`.tiff` in helpConstants.js, dead MAX_FILE_SIZE constant) and §8.2 (action note for helpConstants.js `verification-view` section to use the real tab names).

---

## APPLICATION OVERVIEW

The **OPEX Tool** is a desktop application for archivists. Its job is to prepare and package archival collections according to the **OPEX standard** (Open Archival Information Exchange format) used by Latvian national archives. Users work locally — all files stay on their computer.

The core hierarchy of every project:

```
Project
 └── Institution (creator + signer metadata)
 └── Fond (archive fund)
      └── Inventory (Uzskaites saraksts) — one per document type
           └── Item (Glabājamā vienība) — one archival unit
                └── Record (Dokuments) — metadata describing that item
                     └── Files — actual digital files attached to the record
```

The tool moves a user from raw source material (a VVAIS `.xlsx` report or manually entered data) to a valid, exportable OPEX package in a guided sequence of steps.

---

## HELP SECTION STRUCTURE

The help section should be organized into the following chapters. Each chapter is listed with every section it must contain, plus what each section must explain. Content should be written in **Latvian** to match the application language.

---

## CHAPTER 1 — IEVADS (Introduction)

### 1.1 Kas ir OPEX rīks?

- What the tool does in plain language (not technical jargon)
- Who it is for: archivists preparing digital submissions
- What problem it solves: structuring and validating metadata + files before submitting to archives
- The OPEX standard in one paragraph: what it is, why it matters, who requires it

> ⚠️ **VERIFY:** This document expands OPEX as "Open Archival Information Exchange." The published standard is normally "**Open Preservation Exchange**" format. Confirm the correct expansion before publishing.
- The fact that everything is local — no server, no cloud, no internet required for core work
- Languages: the UI is in Latvian; metadata can be multilingual

### 1.2 Darba plūsma augstā līmenī (High-level workflow)

A numbered overview of the complete lifecycle from start to finish:

1. Create a project and set the working directory
2. Upload the VVAIS report (`.xlsx`) — or create inventories manually
3. Review and complete inventory metadata
4. Create items (Glabājamās vienības) in each inventory
5. Create records (Dokumenti) for each item
6. Attach digital files to records
7. Run Verification (Pārbaude) — fix all errors
8. Export the OPEX package

This section must also show a visual diagram concept (text-based if needed) of the hierarchy.

### 1.3 Pirmā palaišana (First launch)

- What the user sees the very first time (empty project list)
- The "Create Project" popup auto-opens
- What inputs are required (project name + directory path)
- Directory path requirements: must be a valid Windows path, must exist or be creatable
- What happens after the first project is created
- Mention the VVAIS upload popup that auto-triggers on a new project

### 1.4 Navigācijas saīsnes (Keyboard shortcuts)

A full table of all keyboard shortcuts:

| Shortcut | Action |
|---|---|
| `Ctrl+K` | Open / focus the Help search bar |
| `Escape` | Close modal / clear search |
| `Ctrl+Shift+S` | Open Settings |
| Arrow keys | Navigate items in lists |

> ✅ **CORRECTION (verified in code):** This table is partly fictional and partly incomplete. The **real** user-facing shortcuts are:
> | Shortcut | Action | Where |
> |---|---|---|
> | `Ctrl+K` | Focus Help search | Help window — [Help.js:47](opex_tool_frontend/src/Help/Help.js#L47) |
> | `Escape` | Close modal / clear search | Global / modals |
> | `↑` / `↓` | Move between inventory lists | [Inventories.js:155](opex_tool_frontend/src/Inventory/Inventories.js#L155) |
> | `←` / `→` | Move between items | [Item.js:137](opex_tool_frontend/src/Item/Item.js#L137) |
> | `Enter` | Confirm value (e.g. jump-to-item number) | item/record number inputs |
>
> **`Ctrl+Shift+S` (Open Settings) does NOT exist.** The only `Ctrl+Shift+*` handlers are `D`/`F`/`X` and they are **dev-mode only** (gated by `isDevMode()`, [Project.js:286](opex_tool_frontend/src/Project/Project.js#L286)) — do not document them. Settings opens from the top menu, not a shortcut.

---

## CHAPTER 2 — PROJEKTI (Projects)

### 2.1 Kas ir projekts?

- Definition: a project is a single archival submission being prepared
- A project ties together one Institution, one Fond, multiple Inventories, and all their contents
- Projects are isolated — data from one project does not affect another
- Each project has its own working directory on disk

### 2.2 Projekta izveide (Creating a project)

Step-by-step:
1. Click "Jauns projekts" (New project)
2. Enter the project name (required, max 255 characters, cannot be empty)

> ✅ **CORRECTION (verified in code):** Project name max is **20 characters**, not 255 (min 1). Allowed characters: letters, digits, `-`, `_` only. The directory **path** max is **100 characters**. See [projectConstants.js:4-6](opex_tool_frontend/src/Constants/projectConstants.js#L4).
3. Enter the directory path (required):
   - Must be a valid Windows path (e.g., `C:\Arhīvs\Projekts1`)
   - The directory must exist before creating the project OR the application will attempt to create it
   - Spaces and Latvian characters in paths are supported
4. Click "Izveidot" (Create)
5. The project appears in the project list and is auto-selected

**Common mistakes to document:**
- Using a network path (`\\server\...`) — not supported
- Choosing a directory that already contains another project
- Leaving path empty

### 2.3 Projektu saraksts (Project list)

- How to switch between projects (click on project name)
- How to see which project is active (highlighted row)
- The project list loads automatically on startup

### 2.4 Projekta pārdēvēšana (Renaming a project)

- Right-click on project → "Pārdēvēt" (Rename)
- Or use the rename button in the top menu when the project is active
- Only changes the display name, not the directory path
- All data is preserved

### 2.5 Projekta dzēšana (Deleting a project)

- Right-click → "Dzēst" (Delete)
- A confirmation warning popup appears before deletion
- **This is irreversible** — all inventories, items, records, and file references are removed from the database
- The files on disk are NOT automatically deleted (only the database records)
- Document this clearly with a warning callout box

### 2.6 Parakstnieki (Signers)

- What signers are: the official creator and authorized signer of the archival submission
- Fields:
  - Creator name (Izveidotājs) — person who prepared the materials
  - Creator position (Amats)
  - Signer name (Parakstnieks) — authorized official who signs the acceptance report
  - Signer position (Amats)
- How to set signers: top menu → "Parakstnieki"
- Why this matters: required for generating the acceptance report (PN akts)
- Warning if signers are missing when attempting to export

---

## CHAPTER 3 — INVENTĀRI (Inventories)

### 3.1 Kas ir inventārs?

- Definition: an inventory (Uzskaites saraksts) groups archival items by document type
- One inventory = one type of material (e.g., text documents, photos, videos, audio)
- A project can have multiple inventories (unlimited)
- Inventories come from the VVAIS report OR can be created manually

### 3.2 Inventāra veidi (Inventory types)

A table explaining each type:

| Type (LV) | Type (EN) | Description |
|---|---|---|
| Tekstuāls | Textual | Text documents, letters, reports, forms |
| Foto | Photo | Photographic materials |
| Video | Video | Video recordings |
| Skaņas | Audio | Audio recordings |
| Datubāze | Database | Database exports or structured data |

> ✅ **CORRECTION (verified in code):** There are **only 4 inventory types** — `Foto`, `Skaņas`, `Tekstuāls`, `Video`. **"Datubāze" (Database) does not exist** — remove that row. See `VVAIS_TYPE_LIST` in [inventoryConstants.js:13](opex_tool_frontend/src/Constants/inventoryConstants.js#L13).

- Explain that the type controls which metadata fields appear in records
- Explain that media types (Foto, Video, Skaņas) use a different two-step record creation process

### 3.3 VVAIS pārskata augšupielāde (Uploading a VVAIS report)

- What a VVAIS report is: an `.xlsx` export from the VVAIS archival management system containing the inventory and item list
- When the popup appears: automatically on first launch if no inventories exist; also manually from the top menu
- Step-by-step:
  1. The upload popup opens
  2. Drag and drop the `.xlsx` file into the dropzone, or click "Atlasīt failu" to browse
  3. The file type is validated (only `.xlsx` accepted)
  4. Click "Augšupielādēt" (Upload)
  5. The system parses the report and creates inventories and items
  6. A success message appears with counts (e.g., "3 inventories, 42 items created")
- What gets imported: inventory codes, inventory titles, item numbers, item titles, date ranges
- What does NOT get imported: records, files, access restrictions, detailed metadata
- If the report has errors: explain what common VVAIS format errors look like and what to do

### 3.4 Inventāra izveide manuāli (Creating an inventory manually)

When to use: if no VVAIS report exists, or if adding an inventory not in the report.

Fields to fill in:
- **Number/Code** (Numurs): inventory number (required)
- **Title** (Nosaukums): descriptive title (required, max 255 chars)
- **Type** (Veids): one of the 5 types above (required)
- **Electronic flag** (Elektronisks): toggle — is this an electronic inventory?
- **Storage term** (Glabāšanas termiņš): Temporary (Ilgstoši glabājamais) or Permanent (Pastāvīgi glabājamais)
- **Period** (Periods): date range of the inventory content (optional)

### 3.5 Inventāra rediģēšana (Editing an inventory)

- Click on the inventory to open it
- Edit button or inline editing
- Which fields can be changed after creation
- What cannot be changed: inventory type (changing type would invalidate existing records)

### 3.6 Inventāra dzēšana (Deleting an inventory)

- Warning: all items, records, and file references inside will be deleted
- The confirmation warning popup must be acknowledged
- Irreversible action — callout box

### 3.7 Meklēšana un kārtošana (Search and sorting in inventory list)

- Search box filters inventories by name or number
- Sorting options (by name, by number, by type)
- Favorites: click the star icon to pin inventories to the top

---

## CHAPTER 4 — VIENĪBAS (Items)

### 4.1 Kas ir glabājamā vienība?

- Definition: an item (Glabājamā vienība) is one archival unit within an inventory — e.g., one folder, one file, one volume
- An item contains one or more records and associated files
- Items are numbered sequentially within their inventory

### 4.2 Vienības izveide (Creating an item)

The item creation form has 6 sections navigated with Next/Back buttons:

> ✅ **CORRECTION (verified in code):** It is **not** a paged Next/Back wizard. The item form is a **single scrolling form with a section side-menu** — clicking a menu entry scroll-jumps to that section, and validation errors auto-scroll to the first offending section (`scrollToSection`, [CreateItemNavigable.js:152](opex_tool_frontend/src/Item/CreateItemNavigable.js#L152)). Describe it as a scroll-anchored form, not Next/Back paging. The section groupings below are otherwise fine.

**Section 1 — Pamata informācija (Basic)**
- Item number (required, must be unique within inventory)
- Title (required, max 255 chars)
- Series code (Sērijas kods) — optional classification

**Section 2 — Datumi (Dates)**
- Start date (required): the earliest date of content in this item
- End date (required): the latest date of content
- Date granularity: Year / Month / Day (controls display format)
- Validation: end date cannot be before start date

**Section 3 — Tehniskā informācija (Technical)**
- Number of pages/sheets (Lapu skaits) — required for textual inventories
- Unit of measurement (Vienības mērs)
- Physical condition notes (for physical items)

**Section 4 — Apraksts (Description)**
- Annotation (Anotācija): free-text description of the item's content
- Keywords (Atslēgvārdi): tags/subject terms, comma-separated
- Notes (Piezīmes): internal administrative notes

**Section 5 — Piekļuve (Access)**
- Access restriction type:
  - None (Bez ierobežojumiem) — publicly accessible
  - Limited (Ierobežota piekļuve) — restricted access
  - Classified (Konfidenciāli) — fully restricted
- Access restriction notes (visible only if restriction type is not "None")

**Section 6 — Saistītās vienības (Related items)**
- Link related items within the same project
- Search by item number or title
- Linked items display as chips/tags

Form behavior:
- Fields auto-populate from the active Settings preset
- Validation errors shown inline per section
- Cannot advance to next section with unresolved required-field errors

### 4.3 Vienības saraksta skats (Items table view)

- Columns: Number, Title, Date range, Record count, File count, Status indicators
- Compact mode: reduces row height for dense lists
- Virtualized scrolling: handles thousands of items without lag
- Click a row to open the item detail panel
- Double-click to open the full record view

### 4.4 Vienības rediģēšana (Editing an item)

- All fields from creation can be edited
- Changes to date range may trigger warnings if existing records have dates outside the new range
- Explain the date range warning system

### 4.5 Vienības dzēšana (Deleting an item)

- Confirmation required
- Cascades to all records and file references
- Irreversible

---

## CHAPTER 5 — DOKUMENTI (Records)

### 5.1 Kas ir dokuments?

- Definition: a record is the metadata document that describes one archival item's content
- An item can have multiple records (e.g., a folder contains multiple documents, each with a record)
- Records are the primary unit of archival description
- Two families of records: Textual records and Media records (Photo/Video/Audio)

### 5.2 Tekstuāls dokuments — izveide (Creating a textual record)

The record creation form has 4 sections:

**Section 1 — Pamata informācija (Basic)**
- **Title** (Nosaukums): required, max 255 chars, the name of the document
- **Date** (Datums): the document's date; validated against the parent item's date range
  - If outside range: a warning is shown (not a blocking error)
  - Date granularity: Year / Month / Day
- **Registration number** (Reģ. Nr.): the document's own registration/reference number
- **Group** (Grupa): classification group
- **Language** (Valoda): multi-select dropdown; can select multiple languages
  - Default populated from active Settings preset

**Section 2 — Dokumenta informācija (Document info)**
- **Created date** (Izveidošanas datums): when the document was created/drafted
- **Sent date** (Nosūtīšanas datums): when it was sent or submitted
- **Sent registration number** (Nosūtīšanas Reģ. Nr.)
- **Nomenclature number** (Nomenklatūras Nr.): internal reference code

> ✅ **CORRECTION (verified in code):** `group`, `sent_date`, `sent_reg_nr` are real fields ([CreateDocumentRecord.js:76-81](opex_tool_frontend/src/Record/CreateDocumentRecord.js#L76)) — good. But **"Nomenklatūras Nr." was not found in the record form** — verify it exists before documenting it; it is likely not implemented.
- **Document group** (Dokumenta grupa)
- **Technical information** (Tehniskā informācija): physical format, condition notes

**Section 3 — Apraksts (Description)**
- **Annotation** (Anotācija): free-text content summary (may have character limit)

> ✅ **CORRECTION (verified in code):** The character limit for `Anotācija`, `Nosaukums`, `Piezīmes`, and `Tehniskā informācija` is **500 characters each** (not 4000/255 as Appendix A claims) — [recordUI.js:145-156](opex_tool_frontend/src/Constants/uiStrings/recordUI.js#L145).
- **Keywords** (Atslēgvārdi): subject terms/tags
- **Notes** (Piezīmes): internal notes not for public display
- Multi-language support: some fields support entering text in multiple languages simultaneously

**Section 4 — Piekļuve (Access)**
- **Access restriction** (Piekļuves ierobežojums): None / Limited / Classified
- **Expiration date** (Ierobežojuma beigu datums): when the restriction expires (only shown if restriction is active)
- **Restriction notes** (Ierobežojuma piezīmes)

Validation behaviors to document:
- Character counters on long-text fields (shows remaining characters)
- Required fields highlighted in red on attempted save without value
- Date comparison warnings (record date vs. item date range)
- Cannot save if required fields in any section are empty

### 5.3 Multivides dokumenti — izveide (Creating media records — Photo/Video/Audio)

Media records have a different two-step flow:

**Step 1 — Upload files**
- Files must be uploaded before metadata can be added
- Accepted formats depend on inventory type:
  - Photo: `.jpg`, `.jpeg`, `.png`, `.tif`, `.tiff`, `.bmp`
  - Video: `.mp4`, `.mov`, `.avi`, `.mkv`
  - Audio: `.mp3`, `.wav`, `.flac`, `.ogg`

> ✅ **CORRECTION (verified in code):** The enforced allow-lists (MIME) are in [RecordValidation.js:6-13](opex_tool_frontend/src/Utils/RecordValidation.js#L6): **Foto** jpeg/jpg/png/gif/bmp · **Video** mp4/avi/mov/wmv/mkv · **Skaņas (Audio)** mpeg/mp3/wav/aac/ogg/m4a · **Tekstuāls** the photo formats + pdf/txt/doc/docx. Note the discrepancies: `.tiff` (photo) and `.flac` (audio) are listed here and in the current help text but are **not** in the validation allow-list; `.aac`/`.m4a` (audio) and `.wmv` (video) ARE allowed but missing above. Reconcile the help text with the validation constants — they currently disagree.
>
> **STALE CONTENT IN helpConstants.js (verified 2026-06-12):** The `inventory-types` table in `helpConstants.js` (line ~1217) lists `.flac` under Skaņas. This is incorrect — `.flac` is not in `RecordValidation.js` `ALLOWED_FILE_TYPES`. Help content authors must correct this row: remove `.flac`, add `.aac` and `.m4a`. Similarly, `.tiff` should be removed from the Foto row if it appears.
>
> **DEAD CODE NOTE:** `RecordValidation.js` line 3 still defines `MAX_FILE_SIZE: 50 * 1024 * 1024` and line 24 has a `FILE_TOO_LARGE` error string, but this constant is not called in any production upload path — it is only referenced in DevAdmin test suites. It is dead/stale code. Help content must NOT document a 50 MB limit. The active state is: no file-size upload cap exists (all file sizes accepted).
- Drag-and-drop or file picker
- Multiple files can be uploaded at once
- Technical properties auto-extracted: resolution (photos), duration (video/audio), color mode

**Step 2 — Add metadata per file**
- After upload, a metadata form opens for each uploaded file
- Basic fields: title, date, description
- Technical fields: auto-populated from file properties but editable
- Can add keywords and access restrictions per file

### 5.4 Dokumentu saraksts (Records list / table)

- Shown within the item detail view
- Columns: Title, Date, Registration number, Language, File count
- Click record to open full detail
- Pagination for items with many records

### 5.5 Dokumenta rediģēšana (Editing a record)

- All 4 sections are accessible
- EditDocumentRecord form is the same as CreateDocumentRecord but pre-populated
- Changes are saved on "Saglabāt" (Save) button
- Navigating away without saving shows a confirmation dialog (if changes are pending)
- Previous/Next buttons to navigate between records within the same item

### 5.6 Dokumenta dzēšana (Deleting a record)

- Confirmation required
- Removes record and all its file references
- Does not delete the physical files on disk — only the database link
- Batch delete: multi-select checkboxes in records list, then "Delete selected"

---

## CHAPTER 6 — FAILI (Files)

### 6.1 Failu pievienošana dokumentam (Attaching files to a record)

- Files tab is available in the record detail view (tab "Faili")
- Methods to add files:
  1. Click "Pievienot failus" (Add files) button → file picker opens
  2. Drag and drop files onto the dropzone area
- Multiple files can be added at once
- No file size limit — the application accepts files of any size
- File type restrictions: none (all file types accepted)
- Upload progress:
  - Each file shows a progress bar during upload
  - Files appear in the list as soon as upload completes
  - Failed uploads show an error badge; can retry

### 6.2 Failu skati (File views)

Two view modes, toggled by buttons in the file panel header:

**Table view:**
- Columns: icon (by extension), file name, size, upload date
- Click file name to open file details side panel
- Sortable columns

**Card view:**
- Grid of cards, each showing icon, name, size
- Useful when file names are long or many files present

### 6.3 Failu detaļas (File details side panel)

- Opens when clicking a file in table view
- Shows:
  - Full file name
  - File extension
  - File size (formatted: KB, MB, GB)
  - Upload timestamp
  - Full path on disk
- Action buttons:
  - Open file in default application
  - Delete file (confirmation required)

### 6.4 Failu dzēšana (Deleting files)

Individual delete:
- Click the delete icon next to a file
- Confirmation popup appears
- Removes the database reference to the file
- **Does NOT physically delete the file from disk** — only removes the link

Batch delete:
- Use checkboxes to select multiple files
- "Dzēst atlasītos" button appears when items are selected
- Single confirmation for all selected

### 6.5 Failu organizēšana uz diska (How files are stored on disk)

- Files are stored within the project's working directory
- Directory structure mirrors the OPEX hierarchy:
  ```
  WorkingDirectory/
   └── [Fond number]/
        └── [Inventory number]/
             └── [Item number]/
                  └── [File name]
  ```
- Files should not be moved or renamed manually outside the application
- If files are moved, the application will show "File not found" warnings in Verification

---

## CHAPTER 7 — IESTATĪJUMI (Settings)

### 7.1 Iestatījumu atvēršana (Opening Settings)

- Top menu → "Iestatījumi" (Settings) icon
- Keyboard shortcut: `Ctrl+Shift+S`
- Settings modal opens with 3 tabs

> ✅ **CORRECTION (verified in code):** There is **no `Ctrl+Shift+S` shortcut** — Settings opens only from the top menu. Remove the shortcut line.

### 7.2 Attēlojums (Display settings)

- **Theme** (Tēma):
  - Light (Gaišs) — white background, dark text
  - Dark (Tumšs) — dark background, light text
  - Auto (Automātiski) — follows the operating system theme
- **Font size** (Teksta izmērs): Small / Normal / Large
- **Compact view** (Kompakts skats): toggle — reduces spacing between rows in tables; useful for high-density work
- **Default view mode** (Noklusētais skats): Table or Cards for record/file lists

### 7.3 Veidlapu noklusējumi (Form defaults / Presets)

- **Presets** are saved sets of default values that auto-populate forms
- One project can have multiple presets; one preset is "active" at a time

Creating a preset:
1. Click "Jauns iestatījums" (New preset)
2. Name the preset (e.g., "Tekstuālie dokumenti — LV")
3. Set default values:
   - Item language (Vienības valoda)
   - Record language (Dokumenta valoda)
   - Default access restriction type
   - Keywords template (pre-filled keywords added to every new record)
   - Notes template
4. Save preset
5. Mark it as active

Using presets:
- When creating a new item or record, form fields pre-populate from the active preset
- Individual fields can still be overridden — presets are defaults, not locks

### 7.4 Validācijas iestatījumi (Validation settings)

- **Validation strictness** (Validācijas stingrība):
  - Permissive (Mīksts): only critical errors block export
  - Normal (Normāls): standard archival rules enforced (recommended)
  - Strict (Stingrs): all optional fields required; no warnings silently dismissed
- Which validation rules each level affects (provide a table)
- Custom rule toggles for specific fields (if exposed in UI)

> ✅ **CORRECTION (verified in code):** There are **no Permissive/Normal/Strict strictness levels.** The real Validation settings ([ValidationSettings.jsx](opex_tool_frontend/src/Settings/components/ValidationSettings.jsx)) are **warnings only** (they never block export) and consist of:
> - A master on/off toggle, plus per-category toggles (file size, audio/video duration, image dimensions, image orientation).
> - Numeric **warning thresholds**: max/min file size (default 100 MB / 0.01 MB), max/min duration (3600 / 1 s), max/min image dimensions (4000×4000 / 800×600), preferred orientation.
> - Three quick presets: **Stingri Ierobežojumi / Standarta (Noklusējums) / Brīvi Ierobežojumi**.
>
> Document these as quality warnings, and note they are independent of export-blocking validation. (Also: there is **no file-size upload cap** — uploads of any size are accepted.)

---

## CHAPTER 8 — PĀRBAUDE (Verification)

### 8.1 Kāpēc jāveic pārbaude? (Why run verification?)

- OPEX export requires the entire project to be valid
- Errors in metadata prevent export
- Verification shows exactly where problems are and how to fix them
- Run verification multiple times during work — not just at the end

### 8.2 Pārbaudes atvēršana (Opening Verification)

- Top menu → "Pārbaude" button
- The Verification Modal opens with 3 tabs:
  1. **Pārskats** (Overview) — summary statistics
  2. **Detaļas** (Details) — full tree view of issues
  3. **Atskaites** (Reports) — export buttons

> ✅ **CORRECTION (verified in code):** The actual three tabs are **Info (project info)**, **Pārskats** (the overview + validation tree), and **Projekta ceļvedis** (route/roadmap guide) — [VerificationModal.jsx:759-777](opex_tool_frontend/src/Verification/VerificationModal.jsx#L759). There is **no separate "Detaļas" or "Atskaites" tab**; the tree and export buttons live within the Pārskats/Info views. Rewrite 8.2–8.4 around the real tab names. (Export-button placement should be confirmed against the modal when authoring 9.x.)
>
> **ACTION FOR HELP CONTENT AUTHORS:** The implemented `helpConstants.js` section `'verification-view'` (line ~2158) describes the Verification modal without mentioning the three tab names. When authoring or updating that section, use the real tab names: **Info**, **Pārskats**, **Projekta ceļvedis**. Do not refer to "Detaļas" or "Atskaites" — those tabs do not exist.

### 8.3 Pārskats (Overview tab)

What is shown:
- **Readiness status**: "Gatavs OPEX eksportam" (Ready) or "Nav gatavs" (Not ready) with color indicator
- Statistics table:
  - Total inventories (split: imported from VVAIS vs. created manually)
  - Inventories with errors
  - Inventories fully valid
  - Total items
  - Total records (documents)
  - Total files
  - Total file size on disk
  - Electronic items count vs. physical items count
- Quick-action buttons:
  - Go to Details
  - Export reports
  - Export OPEX

### 8.4 Detaļu skats — koku struktūra (Details tab — Tree view)

The tree view shows the full hierarchy:
- **Project** (root node)
  - **Inventory** nodes
    - **Item** nodes
      - **Record** nodes

Each node shows:
- Icon indicating type (inventory/item/record)
- Name/title
- Status icon: ✅ valid / ⚠️ warning / ❌ error
- Badge with error/warning count (only shown if > 0)

Tree controls:
- Click triangle/arrow to expand/collapse a node
- Click node name to navigate directly to that entity in the main app
- **Filter** buttons at top:
  - "Visi" (All) — show everything
  - "Kļūdas" (Errors only) — only show nodes with errors
  - "Problēmas" (Issues) — errors and warnings

### 8.5 Kļūdu panelis (Error panel)

- Click "Rādīt kļūdas" on any node → Error Panel slides in from the right
- Shows:
  - Breadcrumb: Project → Inventory → Item → Record (location of this entity)
  - **Kļūdas** (Errors) section — list of blocking issues (must be fixed to export)
  - **Brīdinājumi** (Warnings) section — non-blocking issues (can be dismissed)
- Each error/warning entry shows:
  - Error code (if applicable)
  - Description in plain language
  - Field name that has the problem
- Action buttons:
  - "Doties uz" (Navigate to) — opens the entity for editing
  - "Noliegt" (Dismiss) — dismiss this individual warning
  - "Noliegt visus" (Dismiss all) — dismiss all warnings for this entity

### 8.6 Brīdinājumu atcelšana (Dismissing warnings)

> ✅ **ACCURATE & HIGH PRIORITY (verified in code):** This feature is real and currently **undocumented in the live help** — author it. Dismissed warnings persist in `localStorage` key `opex_dismissed_warnings`, shared between the Verification view and the SmartGuide card; supports dismiss-one and dismiss-all, with a reset ([SmartGuideCard.jsx:20,59-60](opex_tool_frontend/src/Guidance/SmartGuideCard.jsx#L20), [GuidanceContext.jsx:81-93](opex_tool_frontend/src/Guidance/GuidanceContext.jsx#L81)). Confirm the exact LV button labels and the reset location in the UI when authoring.

- Warnings can be individually dismissed if intentional (e.g., a record with no files because the physical original is not digitized)
- Dismissed warnings persist per project in local settings
- Dismissed warnings are hidden in the tree (no badge)
- To restore: Settings → "Atjaunot noliegumus" (Reset dismissed warnings)
- **Errors cannot be dismissed** — they must be fixed

### 8.7 Biežākās kļūdas un risinājumi (Common errors and fixes)

A table or accordion list of the most common validation errors and how to resolve each:

| Error | Meaning | How to fix |
|---|---|---|
| "Dokuments bez failiem" | A record has no attached files | Upload at least one file to this record |
| "Datums ārpus vienības diapazona" | Record date is outside the item's date range | Change the record date or update the item's date range |
| "Nosaukums tukšs" | Title field is empty | Fill in the required title |
| "Nav parakstnieku" | Signers not configured | Open Parakstnieki and fill in creator/signer details |
| "Nepareizs faila ceļš" | File not found at expected path | File was moved/deleted outside the app; re-upload or remove link |
| "Nav dokumentu" | An item has no records | Create at least one record for this item |
| "Nav elektronisko failu" | Item marked as electronic but no files attached | Attach files or change item to physical |

---

## CHAPTER 9 — EKSPORTS (Export)

### 9.1 Atskaites eksports (Acceptance report export)

What it is: an official "PN akts" (Pieņemšanas-nodošanas akts) — the formal handover document listing all archival materials being transferred.

Prerequisites:
- Signers must be configured (Project → Parakstnieki)
- At least one inventory must exist

Steps:
1. Open Verification modal → "Atskaites" tab
2. Click "Eksportēt PN aktu"
3. Choose type:
   - **Elektroniskais** — report covering electronic (digital) items
   - **Fiziskais** — report covering physical items
4. A file is generated and saved to the project directory
5. A success notification appears with the file path

Output format: `.docx` or `.xlsx` (document the actual format)

> ✅ **CORRECTION (verified in code):** The **PN akts (acceptance report) is `.docx`** (`export_inventories_to_docx`) and the **inventory list (US) is `.xlsx`** (`export_inventories_to_xlsx`) — [project/views.py:183,224](project/views.py#L183).

### 9.2 Inventāra saraksta eksports (Inventory list export)

- Generates a summary list of all inventories in the project
- Useful for cross-checking against the VVAIS system
- Exported as `.xlsx`
- Includes: inventory number, title, type, item count, date range, storage term

### 9.3 OPEX pakotnes ģenerēšana (OPEX package generation)

This is the main output of the tool.

**Before generating:**
- All errors in Verification must be resolved (status must be "Gatavs")
- Warnings can remain (they do not block export)

**Steps:**
1. Open Verification modal → "Atskaites" tab
2. Click "Ģenerēt OPEX"
3. Choose storage term:
   - **Ilgstoši glabājamās** (Long-term storage) — temporary preservation
   - **Pastāvīgi glabājamās** (Permanent storage) — permanent preservation
4. Click "Sākt ģenerēšanu" (Start generation)
5. Progress Modal opens (see 9.4)
6. When complete, OPEX package is in the project directory

**What the OPEX package contains:**
- OPEX metadata XML files for each level (Fond, Inventory, Item, Record)
- All attached files, organized in the hierarchy
- A file manifest
- The acceptance report (if previously generated)

### 9.4 OPEX progress logs (Progress modal)

During generation:
- **Overall progress bar** (0%–100%)
- **Current step** label showing what is being processed
- **Items processed** counter
- **Files processed** counter
- **Total data size** counter (grows as files are copied)
- Estimated time remaining (ETA)

The modal can be:
- **Minimized** — generation continues in the background; a status bar appears at the bottom of the app
- **Closed** — if generation is complete; if generation is in progress, shows a warning

On completion:
- "OPEX ģenerēšana pabeigta" success message
- File path shown
- Modal auto-closes or shows a "Close" button

On error:
- Error message shown with details
- Generation stops
- User must resolve the indicated problem and re-run

---

## CHAPTER 10 — CEĻVEDIS (Smart Guide / Roadmap)

### 10.1 Kas ir Ceļvedis?

- The Roadmap (Ceļvedis) is a built-in project planner that tracks progress toward a completion goal
- Useful for large projects where it's hard to track what still needs to be done
- Multiple routes can be active simultaneously

### 10.2 Ceļveža izveide (Creating a roadmap route)

1. Click "Plāni" (Plans) in the top menu
2. The Roadmap Wizard opens
3. Choose mode:
   - **Guided** (Vadīts) — 5 steps with questions and recommendations
   - **Expert** (Eksperts) — minimal input, quick setup

**Guided mode steps:**
1. Select document types (which inventory types this route covers)
2. Select document format (print / electronic / both)
3. Choose target inventory (or "all inventories")
4. Set completion goals:
   - Target items count
   - Target records count
   - Target files count
5. Review and create

**Expert mode:**
1. Name the route
2. Set numeric targets directly
3. Create

### 10.3 SmartGuide karte (SmartGuide card)

- Appears in the right sidebar when at least one route is active
- Shows per route:
  - Route name
  - Progress bars: Items (n/target), Records (n/target), Files (n/target)
  - What is currently missing (e.g., "5 items need records")
  - Suggested next action ("Add a record to item 14")
- Clicking a suggestion:
  - Navigates to the relevant item/record
  - Opens the relevant create form
  - Auto-focuses the first field

### 10.4 Ceļveža dzēšana (Deleting a route)

- Open Plans → select route → Delete
- Removing a route does not delete any data — only the tracking goal

---

## CHAPTER 11 — PALĪDZĪBA UN PROBLĒMU RISINĀŠANA (Help & Troubleshooting)

### 11.1 Kā lietot palīdzību (Using the Help section)

- Accessing help: click the "?" button in the top bar, or press `F1` (if implemented)

> ✅ **CORRECTION (verified in code):** **`F1` is not implemented** — help opens only via the "?" button. Remove the `F1` reference. (`Ctrl+K` works for search only while the Help window is open.)
- Navigating chapters: left sidebar chapter list
- Navigating sections: Previous/Next buttons at bottom, or click sections in chapter menu
- Search: `Ctrl+K` or click the search bar at the top
  - Search is instant and searches all content
  - Results show the matching text in context
  - Click a result to jump to that section
- Deep links: each section has a URL hash for bookmarking (e.g., `?help=true#chapter-records`)

### 11.2 Biežākās problēmas (Frequently asked questions / troubleshooting)

**Q: The VVAIS upload failed — what do I do?**
- Check that the file is an `.xlsx` file from the VVAIS system
- Make sure the file is not open in Excel during upload
- If the file is corrupted, re-export from VVAIS and try again

**Q: I moved my project files to a new folder. What happens?**
- The database still references the old directory path
- Files will show as missing in Verification
- Solution: Re-upload missing files, or contact support

**Q: OPEX generation is taking very long — is it frozen?**
- Large projects (thousands of files, large file sizes) take time
- The progress modal shows current activity — if numbers are changing, it is not frozen
- Do not close the application during generation

**Q: A record shows a "date outside range" warning but the date is correct. What do I do?**
- Check the item's date range (edit the item)
- If the item's range is wrong, update it
- If the record date is intentionally outside the item range, you can dismiss this specific warning in Verification

**Q: I deleted a record but the file is still on disk. Is this a bug?**
- No — this is intentional. Deleting a record only removes the metadata link; the physical file stays on disk. You must delete the file manually from File Explorer if you want to remove it completely.

**Q: The application opened a blank screen / crashed. What do I do?**
- Restart the application
- Data is saved continuously — no work should be lost
- If the problem persists, check the application logs in the working directory

### 11.3 Kontakti un atbalsts (Contact and support)

- Where to report bugs or request features
- What information to include in a bug report:
  - Application version
  - Steps to reproduce
  - Screenshot of the error
  - Log file location

---

## CHAPTER 12 — GLOSĀRIJS (Glossary)

A-Z reference of all domain terms used in the application:

| Term (LV) | Term (EN) | Definition |
|---|---|---|
| Arhīvs | Archive | The institutional repository for permanent preservation of records |
| Atslēgvārdi | Keywords | Subject terms describing the content of a record |
| Ceļvedis | Roadmap / SmartGuide | The built-in progress tracking and guidance system |
| Datums | Date | The date of a document; validated against item date ranges |
| Eksports | Export | The process of generating an OPEX package or report |
| Elektronisks | Electronic | A digital item or inventory (has attached files) |
| Fonds | Fond | The top-level archive fund grouping all inventories |
| Glabājamā vienība | Item | One archival unit (e.g., a folder or volume) within an inventory |
| Glabāšanas termiņš | Storage term | Whether materials are for permanent or long-term temporary storage |
| Dokuments | Record | The metadata document describing one archival item or document |
| Inventārs | Inventory | A group of archival items, organized by type |
| Iestāde | Institution | The organization responsible for the archival materials |
| OPEX | OPEX | Open Archival Information Exchange — the XML-based format for digital archive submissions |
| Parakstnieks | Signer | The authorized official who signs the acceptance report |
| Pārbaude | Verification | The validation check run before OPEX export |
| Pieņemšanas-nodošanas akts (PN akts) | Acceptance report | The official document listing all materials being transferred |
| Piekļuves ierobežojums | Access restriction | A restriction on public access to a record or item |
| Projekts | Project | A single working context for preparing one archival submission |
| Uzskaites saraksts | Inventory list | Synonym for Inventārs |
| VVAIS | VVAIS | Valsts vienotā arhīvu informācijas sistēma — the national archival information system; source of import reports |

---

## APPENDIX A — FIELD REFERENCE

Complete reference of every input field across all forms, including:
- Field name (LV + EN)
- Form where it appears
- Required / optional
- Data type
- Max length or value range
- Validation rules
- Description

*(This section is for power users and system administrators. It should be formatted as a searchable table or filterable accordion list.)*

### Records (Textual) — All fields

> ✅ **CORRECTION (verified in code):** Max-length values below are wrong. Real limits ([recordUI.js:145-156](opex_tool_frontend/src/Constants/uiStrings/recordUI.js#L145)): **Nosaukums 500**, **Anotācija 500**, **Piezīmes 500**, **Tehniskā informācija 500** (not 255/4000). **Valoda (Language) is REQUIRED**, not optional ([recordConstants.js:77](opex_tool_frontend/src/Constants/recordConstants.js#L77) `language_required`). Verify the `Reģ. Nr.` max before stating 100.

| Field (LV) | Field (EN) | Required | Type | Max | Notes |
|---|---|---|---|---|---|
| Nosaukums | Title | Yes | Text | 255 | Must not be empty |
| Datums | Date | No | Date | — | Compared to item date range; warning if outside |
| Reģ. Nr. | Registration number | No | Text | 100 | Document's own registration code |
| Valoda | Language | No | Multi-select | — | From predefined list; default from preset |
| Anotācija | Annotation | No | Long text | 4000 | Content summary |
| Atslēgvārdi | Keywords | No | Tag input | — | Comma-separated |
| Piezīmes | Notes | No | Long text | 4000 | Internal notes |
| Piekļuves ierobežojums | Access restriction | No | Select | — | None / Limited / Classified |
| Ierobežojuma beigu datums | Restriction expiry | Conditional | Date | — | Required if restriction is active |

### Items — All fields

| Field (LV) | Field (EN) | Required | Type | Max | Notes |
|---|---|---|---|---|---|
| Numurs | Number | Yes | Text | 50 | Unique within inventory |
| Nosaukums | Title | Yes | Text | 255 | — |
| Sākuma datums | Start date | Yes | Date | — | — |
| Beigu datums | End date | Yes | Date | — | Must be ≥ start date |
| Lapu skaits | Page count | Conditional | Integer | — | Required for textual inventories |
| Anotācija | Annotation | No | Long text | 4000 | — |
| Atslēgvārdi | Keywords | No | Tag input | — | — |
| Piezīmes | Notes | No | Long text | 4000 | — |
| Piekļuves ierobežojums | Access restriction | No | Select | — | — |

---

## APPENDIX B — KEYBOARD SHORTCUTS (Full List)

| Shortcut | Context | Action |
|---|---|---|
| `Ctrl+K` | Global | Open / focus Help search |
| `Escape` | Global | Close modal / clear search |
| `Ctrl+Shift+S` | Global | Open Settings |
| `Ctrl+Z` | Forms | Undo last field change |
| Arrow keys | Lists | Navigate rows |
| `Enter` | Lists | Open selected item |
| `Tab` | Forms | Advance to next field |
| `Shift+Tab` | Forms | Go to previous field |

> ✅ **CORRECTION (verified in code):** Use this as the real, complete list. `Ctrl+Shift+S` and `Ctrl+Z` do **not** exist; `Tab`/`Shift+Tab` are browser-native, not app features — drop them unless you explicitly want to mention native behavior.
> | Shortcut | Context | Action |
> |---|---|---|
> | `Ctrl+K` | Help window | Focus the Help search bar — [Help.js:47](opex_tool_frontend/src/Help/Help.js#L47) |
> | `Escape` | Global / modals | Close modal / clear Help search |
> | `↑` / `↓` | Inventory list | Move to previous / next inventory — [Inventories.js:155](opex_tool_frontend/src/Inventory/Inventories.js#L155) |
> | `←` / `→` | Item view | Move to previous / next item — [Item.js:137](opex_tool_frontend/src/Item/Item.js#L137) |
> | `Enter` | Number/search inputs | Confirm value (jump to item, etc.) |
>
> Arrow shortcuts are suppressed while a text input/textarea/select is focused.

---

## APPENDIX C — OPEX STANDARD REFERENCE

A brief technical reference explaining:
- What OPEX XML looks like (one annotated example of a Record OPEX element)
- How the tool maps its data model to OPEX elements
- OPEX version supported (e.g., OPEX 1.1)
- Which Latvian national archive requirements are enforced
- Where to find the official OPEX specification

*(This section is for technical users who need to understand the output format.)*

---

## NOTES FOR OPUS

1. **Language**: All user-facing help text must be written in **Latvian**. Field names and UI labels in the help must exactly match the labels in the application.

2. **Tone**: Instructional and direct. No marketing language. Assume the user knows what an archive is but may not know software jargon.

3. **Warning callouts**: Use visually distinct callout boxes for:
   - **Uzmanību!** (Warning) — irreversible actions (delete)
   - **Svarīgi!** (Important) — common pitfalls
   - **Padoms** (Tip) — shortcuts and efficiency hints

4. **Completeness priority**: Chapter 8 (Verification) and Chapter 9 (Export) are the most critical — they are where users get stuck. Invest the most detail there.

5. **Screenshots**: Each chapter should list what screenshots should accompany it. The help renderer supports a `ui_example` content block — use it for visual representations where screenshots aren't available.

6. **Missing content areas** (requiring investigation of the backend to fully document):
   - Exact OPEX output file structure (need to inspect a generated package)
   - Complete list of VVAIS import fields and which map to which application fields
   - Exact validation rules at each strictness level (need to read `validateProjectForOPEX`)
   - Whether the PN akts export produces `.docx` or `.xlsx` (need to check export hook)
   - Supported file types for photo/video/audio (need to check media validation constants)

> ✅ **PARTIALLY ANSWERED (verified in code):**
> - **PN akts = `.docx`; inventory list (US) = `.xlsx`** — [project/views.py:183,224](project/views.py#L183).
> - **Media file types** — see the corrected list under §5.3, source [RecordValidation.js:6-13](opex_tool_frontend/src/Utils/RecordValidation.js#L6).
> - **There are no strictness levels** — validation settings are warning thresholds (see corrected §7.4). Export-blocking validation lives in `validateProjectForOPEX` — [InheritanceUtils.js](opex_tool_frontend/src/Utils/InheritanceUtils.js).
> - **OPEX XML structure / data-model mapping** — [opex_xml_processor.py](project/helpers/opex_xml_processor.py) and [helpers_export.py](project/helpers/helpers_export.py); the generated ZIP is written to `<project>\opex_export\`. Still worth inspecting a real generated package before writing Appendix C.
> - **VVAIS import field mapping** — still open; trace `import_report_file` ([helpers/local_imports.py] via [project/views.py:153](project/views.py#L153)).

7. **Content structure in code**: Help content is defined in `opex_tool_frontend/src/Constants/helpConstants.js` using a typed content block system. Each block is one of: `paragraph`, `list`, `note`, `code`, `heading`, `table`, `steps`, `accordion`, `ui_example`, `color_palette`. New help chapters must follow this exact schema.

> ✅ **CORRECTION (verified in code):** The block type names are **hyphenated, not underscored** — the renderer's `switch` matches `'ui-example'` and `'color-palette'` ([Help.js:271,297](opex_tool_frontend/src/Help/Help.js#L271)). Writing `ui_example`/`color_palette` renders **nothing** (falls through to the default `null` case). Also note: the `image` block type was **removed** (no screenshots exist) — do not use it; use `ui-example` for visuals. Full valid set: `paragraph`, `list`, `note`, `code`, `heading`, `table`, `steps`, `accordion`, `ui-example`, `color-palette`. A `note` takes `style: 'info' | 'warning' | 'error'`.

8. **Search coverage**: Every important term, error message, and workflow name should appear at least once in the help text so users can find it via Ctrl+K search.
