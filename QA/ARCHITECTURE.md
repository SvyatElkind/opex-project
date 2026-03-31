# OPEX Tool Frontend -- Architecture Documentation

> Last updated: 2026-03-24 | Branch: `frontend-dev`

---

## 1. System Overview

The OPEX Tool Frontend is a web application for Latvian archivists managing digital preservation packages in the **OPEX (Open Preservation Exchange)** format. It provides a structured workflow for organizing archival materials into a strict hierarchy, attaching metadata, validating completeness, and exporting OPEX packages for long-term digital preservation.

**Target users:** Archivists and records managers working with the Latvian National Archives (VVAIS system).

**Core capabilities:**
- Import VVAIS reports to bootstrap project structure
- Navigate and manage a 7-level archival hierarchy
- Attach metadata (actions, addressees, visas, read status) to document records
- Upload and manage files for electronic documents and media records
- Validate data completeness before export
- Export inventory lists, acceptance reports, and OPEX packages

---

## 2. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| UI Framework | React 18 | StrictMode enabled, `ReactDOM.createRoot` |
| Server State | TanStack React Query v5 | `@tanstack/react-query` with devtools |
| HTTP Client | Custom `apiClient.js` | Built on `fetch()` with retry, timeout, AbortController |
| Dropdowns | `react-select` | Used for inventory types, languages, restrictions |
| Date Pickers | `react-datepicker` | Custom `CalendarComponent` and `YearPicker` wrappers |
| Icons | FontAwesome Free | `@fortawesome/fontawesome-free/css/all.min.css` |
| Theming | CSS Custom Properties | `data-theme="dark"` attribute, `theme.css` as root |
| Typography | Libertinus Serif Display | Custom font throughout |
| Build | Create React App | `npm run build`, `npm run build:dev` (includes DevAdmin) |

**Key color palette:** `#596D69` (action/primary), `#744245` (error), `#F1EDE1` (background), `#E1B781` (warning).

---

## 3. Data Hierarchy

The archival data follows a strict 7-level tree. Each project contains exactly one institution, one fond, and then branches into inventories:

```
Project
  +-- Institution (signers: creator, creator_position, signer, signer_position)
  +-- Fond
       +-- Inventory (type + electronic flag = category)
            +-- Item (glabashanas vieniba)
                 +-- Record (ieraksts)
                      +-- File(s)
                      +-- Additional Metadata (actions, addressees, visas, read_status)
```

### Level descriptions

| Level | Latvian Term | Description |
|-------|-------------|-------------|
| **Project** | Projekts | Top-level container. Created empty or populated by importing a VVAIS report (`.xlsx`). |
| **Institution** | Iestade | The organization that owns the records. Has signer/creator fields for official documents. |
| **Fond** | Fonds | A single archival fond per project. Groups inventories. |
| **Inventory** | Apraksts | Classified by `type` (Tekstuals, Foto, Skanas, Video) and `electronic` flag. The combination determines the **category** which controls all downstream behavior. |
| **Item** | Glabashanas vieniba (GV) | A storage unit within an inventory. Has number, title, date range, language, restriction, security level, and more. |
| **Record** | Ieraksts | A document or media entry within an item. Textual records use form-based creation; media records use file-upload-first workflow. |
| **File** | Fails | Physical files attached to electronic document or electronic media records. Not all categories support files. |

---

## 4. Component Architecture

### Provider Wrapping Order (from `src/index.js`)

```
QueryClientProvider
  NotificationProvider
    SettingsProvider
      RoadmapProvider
        GuidanceProvider
          ConstantsProvider
            NavigationProvider
              Workspace
```

### Component Tree

```
Workspace (src/Workspace/Workspace.js)
  +-- Project (src/Project/Project.js)
       +-- ProjectDetails (src/Project/ProjectDetails.js)
       |    +-- UploadPopup (VVAIS report import)
       |    +-- WarningPopup
       +-- Institution (src/Institution/Institution.js)
       +-- Fond (src/Fond/Fond.js)
       +-- Inventories (src/Inventory/Inventories.js)
       |    +-- InventoryItem (src/Inventory/InventoryItem.js)
       |    +-- InventoryCreate (src/Inventory/InventoryCreate.js)
       |    +-- InventoryEdit (src/Inventory/InventoryEdit.js)
       |    +-- InventoryPeriodPopup (src/Inventory/InventoryPeriodPopup.js)
       +-- Items (src/Item/Items.js)
       |    +-- Item (src/Item/Item.js)
       |    +-- EditItemNavigable (src/Item/EditItemNavigable.js)
       |    +-- ItemDeletePopup / ItemNotFoundPopup
       +-- Record (src/Record/Record.js)
       |    +-- CreateDocumentRecord / CreateMediaRecord
       |    +-- EditDocumentRecord / EditMediaRecordMetadata
       |    +-- RecordsList (src/Record/RecordsList.js)
       |    +-- RecordFiles (src/Record/RecordFiles.js)
       |    +-- RecordMetadata (src/Record/RecordMetadata.js)
       |    +-- RecordDeletePopup
       +-- Navigation
       |    +-- Breadcrumbs (src/Navigation/components/Breadcrumbs.js)
       |    +-- Sidebar (src/Navigation/components/Sidebar.js)
       |    +-- QuickJump (src/Navigation/components/QuickJump.js)
       +-- Verification
       |    +-- VerificationModal (src/Verification/VerificationModal.jsx)
       |    +-- VerificationTreeView / VerificationSummary / TreeNode / ErrorPanel
       +-- Settings (src/Settings/Settings.jsx)
       |    +-- DisplaySettings (src/Settings/components/DisplaySettings.jsx)
       +-- Guidance (Smart Guide)
       |    +-- GuidanceContext + useNextActions
       +-- Roadmap
            +-- RoadmapWizard (src/Roadmap/RoadmapWizard.jsx)
```

### No React Router

Navigation is managed entirely through `NavigationContext` -- there is no URL-based routing. The context tracks `currentInventory`, `currentItem`, and `currentRecord` as state, with a `navigationHistory` array for back-navigation. The `navigateTo(type, id, parentId, itemId, options)` function is the universal navigation mechanism.

---

## 5. State Management

### Server State -- React Query

All API data flows through TanStack React Query v5, configured in `src/index.js`:

```
Default staleTime: 5 minutes
Default gcTime: 10 minutes
Default retry: 3 (queries), 1 (mutations)
refetchOnWindowFocus: false
refetchOnMount: 'always'
```

Query keys are centralized in `src/Constants/Constants.js` under `QUERY_KEYS`:
- `['projects']` -- project list
- `['project', 'detail', projectId]` -- single project (includes full nested tree)
- `['record', projectId, recordId]` -- individual record
- `['mediaRecord', projectId, recordId]` -- media record
- `['metadata', projectId, recordId]` -- record metadata
- `['files', projectId, recordId]` -- record files

**Known issue:** `useProjects.js` defines a local `projectKeys` factory with base `['projects']` (plural), producing detail keys like `['projects', 'detail', id]`. Other hooks (`useItems`, `useInventories`, `useInstitutions`) use `['project', 'detail', id]` (singular). This key mismatch means cross-hook invalidations may not work correctly.

### Client State -- React Context

| Context | File | Purpose | Persistence |
|---------|------|---------|-------------|
| **SettingsContext** | `src/Settings/context/SettingsContext.jsx` | Theme, font size, form presets, validation thresholds, compact view | `localStorage` key: `opex_settings` |
| **NavigationContext** | `src/Navigation/context/NavigationContext.js` | Current inventory/item/record selection, breadcrumbs, navigation history, project data cache | In-memory only |
| **ConstantsContext** | `src/context/ConstantsContext.js` | API-fetched dropdown options (inventory types, storage terms, restrictions, security levels) with hardcoded fallbacks | In-memory (fetched on mount) |
| **GuidanceContext** | `src/Guidance/GuidanceContext.jsx` | Smart guide visibility, minimized state, dismissed actions, filter settings | `localStorage` keys: `guidanceVisible`, `guidanceMinimized`, `guidanceSettings`, `dismissedGuidanceActions` |
| **RoadmapContext** | `src/Roadmap/RoadmapContext.jsx` | Per-project route/goal tracking, progress calculation, multi-route support | `localStorage` key: `opex_project_roadmaps` |
| **NotificationContext** | `src/components/Notification.jsx` | Toast notifications and confirm dialogs | In-memory only |

### SettingsContext Details

Manages user preferences with `localStorage` persistence. Key features:
- **Form presets** -- Named configurations (language, restriction, security level, keywords, notes) that can be created, duplicated, deleted, and set as active.
- **Validation thresholds** -- Configurable warning thresholds for file size (min/max), duration (min/max), image dimensions (min/max width/height), and preferred orientation.
- **Import/Export** -- Settings can be exported as JSON and imported from file.
- **Defaults:** `itemsPerPage: 25`, `theme: 'auto'`, `fontSize: 'medium'`, `compactView: false`, `showBreadcrumbs: true`.

### NavigationContext Details

Manages hierarchical navigation without URL routing. Key features:
- **Smart back navigation** -- `navigateBackSmart()` uses category information to determine the correct back-navigation level.
- **Project data cache** -- Stores the full project data tree via `updateProjectData()`, enabling lookup functions like `getItemById()`, `getRecordById()`, `getAllItemsFromProject()`, `getAllRecordsFromProject()`.
- **Breadcrumbs** -- `getCurrentBreadcrumbPath()` builds the trail from current navigation state.
- **Validation** -- `validateNavigationState()` checks for orphan states (e.g., record without item) and provides auto-fix functions.
- **Tab persistence** -- `activeTab` is tracked via `useRef` and state for preservation across navigation.

### RoadmapContext Details

Manages per-project work routes stored in `localStorage`. Key features:
- **Multi-route support** -- Each project can have multiple routes with independent goals and status.
- **Route statuses** -- `IN_PROGRESS`, `COMPLETED`, `ARCHIVED`.
- **Progress calculation** -- `calculateProgress(projectData, route)` computes item/record/file counts against targets.
- **Legacy migration** -- `migrateData()` converts old single-roadmap format to the new array format.
- **Legacy compatibility** -- `setRoadmap()`, `completeRoadmap()`, `deleteRoadmap()` bridge the old API.

---

## 6. API Layer

### Architecture

```
Components
    |
    v
Custom Hooks (src/hooks/use*.js)
    |
    v
apiClient.js (src/services/apiClient.js)
    |
    v
fetch() --> Backend API (REACT_APP_API_URL || '/api/v1')
```

### apiClient.js (`src/services/apiClient.js`)

The centralized HTTP layer. All hooks use this instead of raw `fetch()`.

**Features:**
- Convenience methods: `get()`, `post()`, `put()`, `patch()`, `del()`, `postFormData()`, `putFormData()`, `postBinary()`
- `ApiError` class with parsed field errors (uses `errorService.js` for error parsing)
- Request timeout: 30s default, 5min for uploads/downloads
- Automatic retry with exponential backoff + jitter for 502/503/504 and network errors (GET only by default, configurable via `requestConfig.retry`)
- `AbortController` integration for cancellation (supports external signals)
- `downloadFile()` helper that creates blob URLs and triggers browser download with filename extraction from `Content-Disposition`
- Content-Type auto-detection: removes `Content-Type` header for `FormData` so browser sets multipart boundary
- Handles `204 No Content` responses by returning `{ data: null, status: 204 }`
- Error messages in Latvian for user-facing timeout and network errors

**Retry configuration:**
- Max retries: 2
- Base delay: 500ms with exponential backoff
- Max delay: 5000ms
- Jitter: 0-25% of calculated delay
- Retryable statuses: 502, 503, 504

### Hooks Layer

| Hook File | Purpose |
|-----------|---------|
| `useProjects.js` | Project CRUD, report upload, exports (inventory list, acceptance report, OPEX package) |
| `useItems.js` | Item CRUD with full optimistic updates (create/update/delete) |
| `useInventories.js` | Inventory CRUD with optimistic updates on update |
| `useInstitutions.js` | Institution signer field updates |
| `useRecords.js` | Record CRUD (standard + media), metadata CRUD, batch delete, prefetch, validation |
| `useFiles.js` | Multi-file upload, single file delete |
| `useMetadata.js` | Additional metadata CRUD (actions, addressees, visas, read_status) |

### Legacy API Files (still present)

Files in `src/API/` (e.g., `Constants_API.js`, `Institution_API.js`, `Inventory_API.js`, `Item_API.js`, `Project_API.js`, `Record_API.js`) are older direct-fetch implementations. `Constants_API.js` is still actively used by `ConstantsContext` for fetching dropdown constants. The others are retained for backward compatibility and test use.

---

## 7. Form System

### Modal-Based Forms

All create/edit forms render as **portal-based modals** (using `ReactDOM.createPortal` to `document.body`). This ensures they overlay above all content regardless of CSS stacking context.

### Form Variants by Category

The category system (see Section 8) determines which form is used:

| Category | Create Form | Edit Form | File Handling |
|----------|-------------|-----------|---------------|
| Documents | `CreateDocumentRecord` | `EditDocumentRecord` | No files |
| Electronic Documents | `CreateDocumentRecord` | `EditDocumentRecord` | Files added after record creation via `RecordFiles` |
| Electronic Media | `CreateMediaRecord` (file upload first) | `EditMediaRecordMetadata` | Single file uploaded during creation |
| Media | `CreateDocumentRecord` (form only) | `EditDocumentRecord` | No files |

### Section Navigation

Edit forms (`EditItemNavigable`, `EditDocumentRecord`) use a section-based layout where the user can jump between form sections (basic info, dates, restrictions, etc.) using a sidebar or tab navigation.

### Validation Flow

1. **Client-side validation** -- `RecordValidation.js` and `FileValidation.js` check required fields, format constraints, and file size/type limits
2. **Settings-based warnings** -- `SettingsContext` provides configurable thresholds (file size, duration, image dimensions)
3. **Hook-level validation** -- `useRecords.js` validates media record data (color values, duration format, resolution integers) before API calls
4. **Server-side validation** -- `ApiError.fieldErrors` maps server-returned field errors back to form fields
5. **Validation indicators** -- `ValidationIndicator.jsx` component shows per-field validation state

---

## 8. Category System

### Overview

The category system is the core architectural decision that governs how items and records behave. It is implemented in `src/Utils/InheritanceUtils.js`.

### The 4 Categories

An inventory's **type** (`Tekstuals`, `Foto`, `Skanas`, `Video`) combined with its **electronic** boolean flag determines one of 4 categories:

| Type | electronic: false | electronic: true |
|------|------------------|-----------------|
| Tekstuals | **DOCUMENTS** | **ELECTRONIC_DOCUMENTS** |
| Foto / Skanas / Video | **MEDIA** | **ELECTRONIC_MEDIA** |

### Category Behavior (`CATEGORY_CONSTRAINTS`)

| Property | DOCUMENTS | ELECTRONIC_DOCUMENTS | ELECTRONIC_MEDIA | MEDIA |
|----------|-----------|---------------------|------------------|-------|
| Inheritance | ONE_TO_MANY | ONE_TO_MANY | ONE_TO_ONE | ONE_TO_ONE |
| Max records/item | Unlimited | Unlimited | 1 | 1 |
| View mode | SEGMENTED | SEGMENTED | COMBINED | COMBINED |
| File upload | No | Yes (after creation) | Yes (before creation) | No |
| Multiple files | No | Yes | No | No |
| Additional metadata | Yes (action, addressee, visa, read_status) | Yes | No | No |
| API endpoint | `/record/` | `/record/` + `/multiple_files/` | `/media_record/` | `/record/` |
| Display name | Dokumenti | Elektroniskie Dokumenti | Elektroniskais Medijs | Medijs |

### Media Subtype Configuration (`MEDIA_SUBTYPE_CONFIG`)

| Subtype | Accepted File Types | Specific Fields |
|---------|-------------------|-----------------|
| Foto | image/jpeg, png, gif, tiff, bmp | horizontal_resolution, vertical_resolution, color |
| Video | video/mp4, avi, mov, wmv, mkv, webm | horizontal_resolution, vertical_resolution, color, duration |
| Skanas (Audio) | audio/mpeg, wav, flac, ogg, aac | duration |

### Key Functions

- `determineCategory(type, electronic)` -- Returns category string from type + electronic flag
- `getInheritanceInfo(inventory)` -- Returns full behavior config for an inventory
- `getNavigationBehavior(inventory, item)` -- Determines UI navigation (segmented vs combined)
- `getItemAttentionStatus(inventory, item)` -- Checks constraint compliance (e.g., ONE_TO_ONE with 0 or >1 records)
- `getRecordStatistics(inventory)` -- Counts items, records, files across an inventory

### Workflow Patterns

Each category defines a `workflow` object:
- **CREATE_RECORD_WITH_FORM / NO_FILE_UPLOAD** -- Documents and Media: form-only creation, no files
- **CREATE_RECORD_WITH_FORM / ADD_FILES_AFTER** -- Electronic Documents: create record first, then upload files via `RecordFiles`
- **UPLOAD_FILE_FIRST / ADD_METADATA_AFTER** -- Electronic Media: upload file which auto-extracts metadata, then edit metadata

---

## 9. Notification System

Implemented in `src/components/Notification.jsx`. Replaces all `alert()` and `window.confirm()` calls.

### Usage

```javascript
const { notify, confirm } = useNotification();

// Toast notifications (auto-dismiss after 3 seconds, max 5 visible)
notify.success('Iestatijumi saglabati!');
notify.error('Kluda: ' + error.message);
notify.warning('Bridinajums');
notify.info('Informacija');

// Confirm dialog (returns Promise<boolean>)
const ok = await confirm('Vai tiesham velaties dzest?');
const ok = await confirm({
  title: 'Dzest ierakstu?',
  message: 'Si darbiba ir neatgriezeniska.',
  confirmText: 'Dzest',
  cancelText: 'Atcelt',
  variant: 'danger'  // 'default' | 'danger' | 'warning'
});
```

### Architecture

- `NotificationProvider` wraps the entire app (outermost provider after `QueryClientProvider`)
- `notify` object exposes `.success()`, `.error()`, `.warning()`, `.info()` methods
- `confirm()` / `showConfirm()` returns a `Promise<boolean>` -- the dialog is managed via a `useRef` to the resolve function
- Toasts render via `ReactDOM.createPortal` into `document.body` as a `.notification-toast-stack`
- Maximum 5 toasts visible at once (older ones are trimmed)
- Each toast auto-dismisses after 3 seconds with an exit animation (300ms)
- Confirm dialogs also portal to `document.body` with an overlay backdrop (click-outside dismisses)
- FontAwesome icons per type: `fa-check-circle` (success), `fa-times-circle` (error), `fa-exclamation-triangle` (warning), `fa-info-circle` (info)
- Fallback behavior: if `useNotification()` is called outside the provider, it logs to console instead of crashing

---

## 10. Dev Tools

### DevAdmin Panel (`src/DevAdmin/DevAdminPanel.jsx`)

A floating, draggable development panel with 10 tabs:

| Tab | Component | Purpose |
|-----|-----------|---------|
| State | `ProjectStateInspector` | Inspect current project data tree |
| Network | `NetworkMonitor` | Monitor API requests and responses |
| Forms | `FormInspector` | Inspect active form state |
| Perf | `PerformanceProfiler` | React render profiling |
| Tests | `TestDashboard` | Run integration tests |
| Errors | `ErrorBoundaryTester` | Trigger error boundaries for testing |
| Mocks | `APIMockToggle` | Toggle API mocking |
| Storage | `LocalStorageManager` | View/edit localStorage entries |
| Valid. | `ValidationTester` | Test validation rules |
| Actions | `QuickActions` | Quick development shortcuts |

**Activation:** `Ctrl+Shift+D` keyboard shortcut (development mode only).

The panel renders via `ReactDOM.createPortal` and supports drag-to-move and minimize.

### Build Modes

| Command | DevAdmin | React Query Devtools | Notes |
|---------|----------|---------------------|-------|
| `npm start` | Yes | Yes (bottom-right) | Development server |
| `npm run build:dev` | Yes (opt-in) | No | Development build |
| `npm run build` | No | No | Production build |

### Performance Monitor

`src/Utils/PerformanceMonitor.js` provides render timing and memory usage tracking, integrated into the DevAdmin Performance tab.

### Help System

The application includes a standalone help page accessible via `?help=true` URL parameter. When detected, `src/index.js` dynamically imports and renders the `Help` component instead of the main `Workspace`, skipping all providers.

The `HelpWindow` utility (`src/Utils/HelpWindow.js`) opens help in a separate browser window.

### Additional Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useTheme` | `src/hooks/useTheme.js` | Applies light/dark/auto theme based on SettingsContext and system preference (`prefers-color-scheme`). Sets `data-theme` attribute on `<html>`. |
| `useScrollDirection` | `src/hooks/useScrollDirection.js` | Tracks scroll direction (up/down) and whether page is scrolled past a threshold. Uses `requestAnimationFrame` for performance. |
| `useAppSettings` | `src/hooks/useAppSettings.js` | Applies font size and compact view settings from SettingsContext to the DOM. |
