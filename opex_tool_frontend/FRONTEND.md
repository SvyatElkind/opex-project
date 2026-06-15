# OPEX Frontend — Developer Guide

The OPEX tool is a **local desktop application** for managing Latvian National Archive
deliverables. The React frontend talks to a local Django REST backend on
`http://localhost:8000` (proxied during `npm start`); no remote server is involved.
Files and metadata live on the user's machine.

This document is the entry point for working on the React app under `opex_tool_frontend/`.
It assumes React + React Query familiarity but no prior knowledge of this codebase.

---

## TL;DR

- **Stack**: React 18 + Create React App, React Query for server state, Context API
  for client/UI state. No Redux, no Tailwind, no CSS-in-JS.
- **Domain hierarchy**: `Project → Inventory → Item → Record → File`. Records also
  have metadata children (visa, action, addressee, read_status).
- **Forms**: Multi-section sticky-nav forms (`*Navigable.js`) with shared validation
  in `src/Constants/*Constants.js` and error state via `useFormErrors`.
- **DevAdmin**: A floating dev panel (Ctrl+Shift+D) with form-puppet automation,
  test-data generators, in-browser test runner, network inspector, and more. Gated
  by `isDevMode()` — built into `npm run build:dev` only.

---

## Quick Start

```bash
cd opex_tool_frontend
npm install
npm start                 # dev server, dev mode ON
npm run build             # production build -> build/      (DevAdmin stripped, no test fixtures)
npm run build:dev         # dev build        -> build-dev/  (DevAdmin enabled + test fixtures)
```

The two builds write to separate folders. The backend chooses which to serve
via `OPEX_BUILD` in `opex_project/settings.py` (`'production'` | `'dev'`) — see
[START.md](../START.md).

Backend must be running on `http://localhost:8000` (the dev server proxies API
calls there — see [package.json](package.json) `"proxy"` field).

The `manifest:public` script (runs automatically before start/build) generates
`public/files/manifest.json` listing files in `public/files/` so the puppet's
QuickCreate feature can attach real test fixtures.

---

## Top-Level Layout

```
src/
├── index.js                         # Entry — picks Help vs main, builds providers
├── help.js                          # Standalone Help bundle entry (#help-root)
├── styles/theme.css                 # CSS custom properties (the design system)
├── Workspace/                       # Main shell mounted by index.js
├── Project/                         # Top-level Project list + modal orchestration
├── Inventory/                       # 2nd-tier: inventory CRUD
├── Item/                            # 3rd-tier: item CRUD (multi-section forms)
├── Record/                          # 4th-tier: record CRUD + metadata + files
├── Verification/                    # Pre-OPEX validation modal + tree
├── Navigation/                      # Breadcrumbs, QuickJump, NavigationContext
├── Settings/                        # Settings UI + presets context
├── Roadmap/                         # Roadmap wizard + context
├── Guidance/                        # Smart guidance cards
├── Help/                            # In-app contextual help
├── Institution/, Fond/              # Institution signers, fond management
├── Toast/                           # Toast.js — used by Project shell directly
├── API/                             # HTTP modules per domain
├── hooks/                           # React Query wrappers + small UI hooks
├── components/                      # Shared UI (Notification, ErrorDisplay, …)
├── context/                         # ConstantsContext (API-fetched domain enums)
├── Constants/                       # Validation rules, UI strings, query keys
├── Utils/                           # InheritanceUtils, DateFormatter, validators
├── services/                        # apiClient, errorService
└── DevAdmin/                        # Dev-only tooling (see DevAdmin section)
```

`Toast/Toast.js` is used directly by `Project.js` for one-off toast messages
that don't go through `NotificationProvider` (e.g. results of dev-shortcut
actions).

---

## Architecture

### Entry & Provider Stack

There is no `App.js`. [src/index.js](src/index.js) is the entry point and decides
between two render paths based on `?help=true` in the URL:

- **Help mode** — dynamically imports `Help/Help` and renders it standalone, with
  no providers. (A separate entry, [src/help.js](src/help.js), bootstraps the
  same Help component into a `#help-root` mount for the standalone help bundle.)
- **Main app** — mounts the provider stack:

```
QueryClientProvider
└─ NotificationProvider          (toasts + confirm dialogs)
  └─ SettingsProvider           (UI prefs + form presets)
    └─ RoadmapProvider          (per-project roadmap state)
      └─ GuidanceProvider       (smart-guide visibility)
        └─ ConstantsProvider    (API-fetched domain enums w/ fallback)
          └─ NavigationProvider (project tree + nav state)
            └─ Workspace        (main shell — src/Workspace/Workspace.js)
```

[src/Workspace/Workspace.js](src/Workspace/Workspace.js) is the main shell —
it calls `useTheme()` / `useAppSettings()` to apply CSS custom properties to
`<html>` and renders the project layout.

There is no React Router — navigation between Project → Inventory → Item →
Record is driven by **NavigationContext** state, not URL changes.

### React Query

Configured in [src/index.js](src/index.js) with:
- 5-minute `staleTime`
- 10-minute `gcTime`
- 3 retries
- `refetchOnWindowFocus: false`, `refetchOnMount: 'always'`

Query keys live in [src/Constants/Constants.js](src/Constants/Constants.js)
under `QUERY_KEYS` so invalidation is consistent across hooks.

### Contexts

| Context | File | What it provides |
|---|---|---|
| `NotificationProvider` | [src/components/Notification.jsx](src/components/Notification.jsx) | `notify.success/error/warning/info`, `showConfirm`. Replaces `alert/confirm`. |
| `SettingsProvider` | [src/Settings/context/SettingsContext.jsx](src/Settings/context/SettingsContext.jsx) | UI prefs, form presets, validation thresholds. Persists to `localStorage` under `opex_settings`. |
| `RoadmapProvider` | [src/Roadmap/RoadmapContext.jsx](src/Roadmap/RoadmapContext.jsx) | Per-project roadmap status. |
| `GuidanceProvider` | [src/Guidance/GuidanceContext.jsx](src/Guidance/GuidanceContext.jsx) | Smart-guide cards visibility. |
| `ConstantsProvider` | [src/context/ConstantsContext.js](src/context/ConstantsContext.js) | API-fetched domain enums (inventory types, storage terms, date indicators) with offline fallback. |
| `NavigationProvider` | [src/Navigation/context/NavigationContext.js](src/Navigation/context/NavigationContext.js) | `currentInventory/Item/Record`, `activeTab`, history stack, lookup helpers like `getItemById`. |

### API Layer

Per-domain modules in [src/API/](src/API/):

- [Project_API.js](src/API/Project_API.js) — projects
- [Inventory_API.js](src/API/Inventory_API.js) — inventories
- [Item_API.js](src/API/Item_API.js) — items
- [Record_API.js](src/API/Record_API.js) — records + file uploads
- [Constants_API.js](src/API/Constants_API.js) — domain enums for ConstantsContext
- [Institution_API.js](src/API/Institution_API.js) — institution / signer data

All modules go through [src/services/apiClient.js](src/services/apiClient.js):
`get/post/put/del` wrappers around `fetch`, 30 s default timeout (5 min for
file ops), automatic exponential-backoff retry on 502/503/504, and a typed
`ApiError` carrying parsed Django field errors.

Errors are normalised by [src/services/errorService.js](src/services/errorService.js)
(`parseApiError`) into `{ general, fields }`. Forms then feed those into
[src/hooks/useFormErrors.js](src/hooks/useFormErrors.js) which exposes
`getFieldError`, `setApiErrors`, `clearErrors`.

### Hooks

[src/hooks/](src/hooks/) is mostly thin React Query wrappers:

- `useProjects`, `useProject`, `useInventories`, `useItems`, `useRecords`,
  `useInstitutions`, `useMetadata`, `useFiles` — server state
- `useFormErrors` — form error state shape
- `useTheme`, `useAppSettings` — applies SettingsContext to `<html>` (theme,
  fontSize, compactView)
- `useOpexProgress` — long-running OPEX generation status via WebSocket
- `useScrollDirection`, `usePerformance` — small UI / dev hooks

Business logic lives in components and contexts, not hooks.

### Theming

Single source of truth: [src/styles/theme.css](src/styles/theme.css) — all colors,
spacing, typography, borders, shadows are CSS custom properties. Components import
plain `.css` files and reference `var(--...)`. Dark mode is set by
`useTheme()` toggling `data-theme="dark"` on `<html>`.

---

## Domain Modules

The hierarchy is **Project → Inventory → Item → Record → File**, with metadata
records (visa, action, addressee, read_status) hanging off Records.

### Project

[src/Project/Project.js](src/Project/Project.js) is the **app shell**. It owns:

- Project list, selected project tab, auto-select-first behaviour
- Modal orchestration: ProjectPopup, RenameProjectPopup, WarningPopup,
  UploadPopup, VerificationModal, InstitutionSignersPopup, Settings,
  RoadmapWizard, DevAdminPanel
- Top-level keyboard shortcuts:
  - **Ctrl+Shift+D** — toggle DevAdmin panel
  - **Ctrl+Shift+F** — run the full-project puppet at max speed (headless test)
  - **Ctrl+Shift+X** — delete all projects (with confirmation)
- Auto-opens `UploadPopup` if a project has `isMissingReport` flag (the VVAIS
  report upload is mandatory before anything else can happen).

### Inventory

`src/Inventory/` — list + create + edit forms. Key fields: `number`, `type`
(Tekstuāls / Foto / Skaņa / Video), `electronic` (boolean), `storage_term`
(Pastāvīgi / Ilgstoši glabājamās lietas), `period_from`, `period_to`,
`last_gv` (last item number — used for auto-incrementing item numbers).

[InventoryCreate.js](src/Inventory/InventoryCreate.js) uses `react-select` for
the type/storage-term dropdowns and `YearPicker` for period boundaries.

### Item

`src/Item/`:

- [Items.js](src/Item/Items.js) — list view inside the active inventory
- [CreateItemNavigable.js](src/Item/CreateItemNavigable.js),
  [EditItemNavigable.js](src/Item/EditItemNavigable.js) —
  the **canonical multi-section form pattern**: sticky left-side nav with
  6 sections (Basic, Dates, Technical, Description, Access, Related), one
  flat `formData` object, validation runs on submit.
- [Item.js](src/Item/Item.js) — detail view; layout depends on inventory category.

`InheritanceUtils.determineCategory(type, electronic)` maps the inventory's
`(type, electronic)` pair to one of four categories in `CATEGORY_TYPES`, which
then maps to a `VIEW_MODE`:

| Category | View mode | Notes |
|---|---|---|
| `DOCUMENTS` | `SEGMENTED` | Textual, non-electronic |
| `ELECTRONIC_DOCUMENTS` | `SEGMENTED` | Textual, electronic — file uploads required |
| `MEDIA` | `COMBINED` | Photo / audio / video, non-electronic |
| `ELECTRONIC_MEDIA` | `COMBINED` | Photo / audio / video, electronic — one item = one record + one file |

`SEGMENTED` shows item overview alongside a separate records list.
`COMBINED` shows item and its single record together.

The item's `number` defaults to `relativeInventory.last_gv + 1`. Language,
restriction, security level, notes all default from the active form preset.

### Record

`src/Record/`:

- [CreateDocumentRecord.js](src/Record/CreateDocumentRecord.js),
  [EditDocumentRecord.js](src/Record/EditDocumentRecord.js) — text-document
  forms (largest forms in the app)
- [CreateMediaRecord.js](src/Record/CreateMediaRecord.js),
  [EditMediaRecordMetadata.js](src/Record/EditMediaRecordMetadata.js) —
  photo / audio / video records (uses
  [MediaRecordForm.js](src/Record/MediaRecordForm.js) for shared logic)
- [RecordsList.js](src/Record/RecordsList.js) — paginated list with
  filter / sort / search
- [RecordMetadata.js](src/Record/RecordMetadata.js) — tabbed sub-forms in
  this order: `actions`, `addressees`, `visas`, `read_status`. Each tab's
  fields are declared in a `sections` config array and rendered generically
  by a single `renderField` helper that switches on `field.type`
  (`text` / `textarea` / `date`).
- [RecordFiles.js](src/Record/RecordFiles.js) — drag-drop upload, list,
  delete; validation via
  [Utils/FileValidation.js](src/Utils/FileValidation.js).

CSS classes for create/edit forms follow the `*-nav-*` convention
(e.g. `create-record-nav-input`) and are shared between Create and Edit.

### Verification

[src/Verification/VerificationModal.jsx](src/Verification/VerificationModal.jsx)
is the **pre-OPEX gate**. It:

1. Calls `validateProjectForOPEX()` from
   [Utils/InheritanceUtils.js](src/Utils/InheritanceUtils.js).
2. Builds the full hierarchy tree (Project → Inventory → Item → Record → File).
3. Each [TreeNode.jsx](src/Verification/TreeNode.jsx) renders with a
   VALID / WARNING / ERROR status icon.
4. Errors and dismissed warnings are tracked in `localStorage`
   under `opex_dismissed_warnings`.
5. The export popup offers two OPEX variants:
   - `Ilgstoši glabājamās lietas` (long-term retention)
   - `Pastāvīgi glabājamās lietas` (permanent retention)

Each variant calls `useExportOpex` which kicks off backend generation and
streams progress through `useOpexProgress`.

### Other modules

- **Navigation** — `Breadcrumbs`, `QuickJump` (search-and-jump anywhere in the
  active project), `ProjectNavigation` (sticky scroll-aware top bar).
- **Settings** — `Settings.jsx` modal with Display / Forms / Validation tabs.
  `FormDefaults.jsx` manages form presets. State lives in `SettingsContext` and
  is persisted to `localStorage` (`opex_settings`).
- **Help** — `HelpButton` opens a contextual chapter from
  [Constants/helpConstants.js](src/Constants/helpConstants.js) (~3500 lines of
  Latvian help content keyed by `HELP_CHAPTER_IDS`).
- **Roadmap / Guidance** — opt-in workflow nudges; first-run wizard runs once
  per project after the report upload step.
- **Institution / Fond** — institution signer management.

---

## Cross-Cutting Patterns

### Forms

Every create/edit form follows the same shape:

1. Import a domain validator from `Constants/<domain>Constants.js`
   (e.g. `validateRecordCreate`, `validateItemCreate`).
2. Initialise state from props + `getActivePreset()` (Settings).
3. `useFormErrors()` for `getFieldError(name)`, `setApiErrors`, `clearErrors`.
4. The mutation hook (`useCreateItem`, `useUpdateRecord`, …) handles the
   write; errors come back through `parseApiError` and feed into
   `setApiErrors`.
5. `<GeneralAlert>` at the top, `<FieldError>` next to each field
   (see [components/ErrorDisplay.js](src/components/ErrorDisplay.js)).

Multi-section forms additionally:
- Keep `activeSection` state and one ref per section
- Render a sticky left nav listing sections + their icons
- Validate the whole form on submit (not per-section)

### Inheritance

[Utils/InheritanceUtils.js](src/Utils/InheritanceUtils.js) (1500+ lines) is the
business-logic core. It encodes which fields cascade down the hierarchy
(e.g. inventory-level access restriction sets the default for items inside it),
maps `(inventory_type, electronic)` to a category, and runs the master
project validator used by the Verification modal.

### Form Presets

[Settings/context/SettingsContext.jsx](src/Settings/context/SettingsContext.jsx)
holds `formPresets[]` and `activePresetId`. A preset bundles default values for
fields like language, access restriction, security level, keywords, notes.
Forms call `getActivePreset()` and pre-populate from it. Users can create,
duplicate, edit, delete presets, and export/import them as JSON.

### Validation

- Per-field validators live alongside the validator function in each
  `*Constants.js` file (e.g.
  [recordConstants.js](src/Constants/recordConstants.js) exports
  `validateRecordDate`, `validateAccessRestrictionDate`, `TITLE_MAX_LENGTH`,
  `getRemainingChars`, etc.).
- Generic primitives (email, URL, date format) live in
  [Constants/validationRules.js](src/Constants/validationRules.js).
- File / media validation in
  [Utils/FileValidation.js](src/Utils/FileValidation.js) and
  [Utils/RecordValidation.js](src/Utils/RecordValidation.js).
- Settings exposes runtime toggles for size / duration / dimension warnings.

### Date Handling

[Utils/DateFormatter.js](src/Utils/DateFormatter.js) is the single source for
date formatting:

- `parseDate(value)` — string / Date → Date or null
- `formatDate(date, 'DD.MM.YYYY' | 'YYYY-MM-DD' | 'DD/MM/YYYY', dateIndicator?)` —
  with optional `'day' | 'month' | 'year'` precision
- `DATEPICKER_FORMAT = 'dd.MM.yyyy'`,
  `DATE_PLACEHOLDER = 'DD.MM.YYYY'` — react-datepicker tokens

All user-visible dates render as `DD.MM.YYYY`. The wire format on the API is
always `YYYY-MM-DD` — forms convert at the boundary.

---

## DevAdmin

A floating, draggable, resizable dev panel mounted at the project shell. Open
with **Ctrl+Shift+D**. Fully gated by
[src/DevAdmin/devMode.js](src/DevAdmin/devMode.js):

```js
isDevMode() === (NODE_ENV === 'development' || REACT_APP_DEV_MODE === 'true')
```

`npm start` is always dev mode. `npm run build:dev` produces an optimised build
(in `build-dev/`) with DevAdmin still enabled (useful for QA on bundled builds).
`npm run build` strips it (in `build/`).

### Panel layout

[DevAdminPanel.jsx](src/DevAdmin/DevAdminPanel.jsx) hosts 14 tabs in this order
(matches the registry near line 170):

| # | Tab id | Label | Component | Purpose |
|---|---|---|---|---|
| 1 | `state` | State | [ProjectStateInspector.jsx](src/DevAdmin/components/ProjectStateInspector.jsx) | Dump live project / inventory / item / record state |
| 2 | `network` | Network | [NetworkMonitor.jsx](src/DevAdmin/components/NetworkMonitor.jsx) | Inspect intercepted fetch / XHR calls |
| 3 | `forms` | Forms | [FormInspector.jsx](src/DevAdmin/components/FormInspector.jsx) | Live field state of the active form |
| 4 | `performance` | Perf | [PerformanceProfiler.jsx](src/DevAdmin/components/PerformanceProfiler.jsx) | Render-time profiling |
| 5 | `tests` | Tests | [TestDashboard.jsx](src/DevAdmin/components/TestDashboard.jsx) | In-browser test runner over `testing/suites/` |
| 6 | `errors` | Errors | [ErrorBoundaryTester.jsx](src/DevAdmin/components/ErrorBoundaryTester.jsx) | Trigger error states |
| 7 | `mocks` | Mocks | [APIMockToggle.jsx](src/DevAdmin/components/APIMockToggle.jsx) | Toggle mocked vs real API responses |
| 8 | `storage` | Storage | [LocalStorageManager.jsx](src/DevAdmin/components/LocalStorageManager.jsx) | Inspect / edit `localStorage` |
| 9 | `validation` | Valid. | [ValidationTester.jsx](src/DevAdmin/components/ValidationTester.jsx) | Run validators in isolation |
| 10 | `quickcreate` | Create | [QuickCreate.jsx](src/DevAdmin/components/QuickCreate.jsx) | One-click bulk data builders |
| 11 | `theme` | Theme | [ThemeSwitcher.jsx](src/DevAdmin/components/ThemeSwitcher.jsx) | Theme toggle (dev-only override) |
| 12 | `actions` | Actions | [QuickActions.jsx](src/DevAdmin/components/QuickActions.jsx) | Bulk destructive / generative actions |
| 13 | `puppet` | Puppet | [FormPuppet.jsx](src/DevAdmin/components/FormPuppet.jsx) | Run scripted UI flows over the live app |
| 14 | `opex` | OPEX | [OPEXProgressMonitor.jsx](src/DevAdmin/components/OPEXProgressMonitor.jsx) | Watch OPEX generation progress |

The Network tab is fed by
[fetchInterceptor.js](src/DevAdmin/fetchInterceptor.js), which patches
`window.fetch` to capture requests / responses / timing for inspection.

There is also a **Mini Form Inspector** floating widget that polls the active
form every 600 ms.

### Form Puppet

The Puppet drives real React forms by simulating user interaction with native
DOM events that React's synthetic event system picks up.

#### Engine — [formPuppetEngine.js](src/DevAdmin/formPuppetEngine.js)

Core trick: React tracks `<input>` value via its fiber and ignores direct
`element.value = x` assignments. The engine grabs the **native** value setter
once at module load and uses it to bypass React's interception:

```js
const nativeInputSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype, 'value'
).set;

nativeInputSetter.call(input, newValue);
input.dispatchEvent(new Event('input', { bubbles: true }));
```

Exported primitives:

- `setReactValue(el, value, { charDelay })` — type instantly or character-by-character
- `setDateValue(el, isoStr)` — auto-detects native `<input type="date">` vs
  react-datepicker text input; converts ISO → `DD.MM.YYYY` and blurs to commit
- `setSelectValue(el, value)` — native `<select>`
- `selectReactSelectOption(containerSelector, label, delay)` — opens a react-select
  menu (handles portal-rendered menus) and clicks the matching option
- `setCheckbox(el, bool)`, `addTagValue(el, value)`
- `waitForSelector` / `waitForSelectorGone` — `MutationObserver`-backed
- `highlightElement`, `scrollIntoView`, `sleep`
- `isoToDisplayDate(yyyymmdd)` — `YYYY-MM-DD` → `DD.MM.YYYY` (also used by recipes)
- `runPuppetSteps(steps, onStep, opts)` — orchestrates a recipe; returns
  `{ completed, failed, errors, log, totalMs, verification }`
- `verifyFormState(steps)` — diff `step.expect` against the live DOM after the run
- `formatPuppetLog(name, result)` — paste-ready debug report

#### Recipes — [formPuppetRecipes.js](src/DevAdmin/formPuppetRecipes.js)

A **recipe** is a function returning an array of steps:

```js
{
  label: 'Ievada datumu: 2024-05-12',   // shown in the UI step list
  expect: { selector: '[name="date"]', value: '2024-05-12', name: 'date' },
  action: async () => { /* ... */ },
}
```

Step labels are Latvian by convention so they read naturally next to the form
they're driving.

The recipe registry near the bottom (`RECIPES` export) maps an id to
`{ name, formSelector, getSteps, … }`. Canonical recipes:

- `project_create`, `signers`, `inventory_create`, `item_create`,
  `record_create_doc`
- `metadata_visa`, `metadata_addressee`, `metadata_action`, `metadata_read_status`
- `export_inventory_list`, `export_pn_akts`, `generate_opex`,
  `verification_full`
- `full_project` — zero-to-complete: project → upload VVAIS xlsx → signers →
  5 inventories × items × metadata. Bound to **Ctrl+Shift+F** as a headless run.

Useful internal helpers (in the same file):

- `fillDatepicker(input, isoStr)` — focus → clear → type → Tab to commit
- `randomDate`, `randomPerson`, `randomItemName`
- `switchToDokumentiTab`, `clickLastRecordRow`, `clickLastItemRow`,
  `switchRecordTab` — navigation primitives
- `injectFilesIntoInput`, `fetchTestFiles` — load real fixtures from
  `public/files/` via the manifest

#### UI — [components/FormPuppet.jsx](src/DevAdmin/components/FormPuppet.jsx)

- Recipe dropdown + Play / Stop
- Speed control (instant / normal / slow — adjusts `delayBetween`)
- Auto-submit checkbox (uses `recipe.submitSelector` if present)
- Live progress bar with per-step status icons
- Result panel: pass / fail badge, error list, copy-log button
- Collapsible history panel of past runs

### Test data — [testDataUtils.js](src/DevAdmin/testDataUtils.js)

Shared random-data helpers used by both puppet recipes and QuickCreate:

- `pick(arr)`, `randInt(min, max)`, `pad(n)`
- `randomPerson()` — random Latvian first + last name
- `randomItemName(type)`, `randomDate(start, end)`
- `generateSeriesCode()` — backend-regex-conformant codes like `3.12` or `3.12.7`
- `buildVisa(date)`, `buildAddressee()`, `buildAction(createdDate)`,
  `buildReadStatus(date)` — single metadata record builders
- `generateMetadataForRecord(addFn, projectId, recordId, recordDate)` —
  bulk metadata seeder

Latvian-locale word banks: `LANGUAGES`, `ACTION_TASKS`, `ADDRESSEE_NAMES`,
`VISA_NOTES`, `READ_STATUS_NOTES`, `FIRST_NAMES`, `LAST_NAMES`.

### QuickCreate, QuickActions, TestDataGenerator

- **QuickCreate** — one-click data fill: project, individual inventory, item,
  record, file, metadata. The Fill Project button chains them all into one
  realistic project.
- **QuickActions** — bulk delete inventories or items; bulk-populate
  report-sourced inventories with ~100 items each (files + metadata).
- **TestDataGenerator** — granular generator with form-style controls for
  customising the data before creation.

### In-browser Test Runner

[testing/TestRunner.js](src/DevAdmin/testing/TestRunner.js) is a custom
Jest-flavoured runner: `describe` / `it` / `expect` with ~20 matchers
(`toBe`, `toEqual`, `toContain`, `toBeGreaterThan`, `toThrow`, `toMatch`, …).
Suites register via `runner.registerSuite(name, fn)` and run from the Tests
tab. Results show per-test duration and assertion diffs.

Suites under [testing/suites/](src/DevAdmin/testing/suites/):

| File | Coverage |
|---|---|
| `apiTests.js`, `apiClientTests.js` | API client + request/response shapes |
| `contextTests.js` | React context provider / consumer |
| `formValidationTests.js`, `validationTests.js` | Field validators, schemas |
| `formWorkflowTests.js` | Multi-step form state transitions |
| `hookTests.js` | Custom hooks |
| `stateManagementTests.js` | Context state mutations |
| `inheritanceTests.js` | InheritanceUtils logic |
| `integrationTests.js` | Cross-module workflows |
| `e2eWorkflowTests.js` | End-to-end project → upload → verify flows |

### DevAdmin gotchas

- Recipes find inputs by `[name="..."]`. Any `<DatePicker>` driven by the
  puppet **must have a `name` prop** — it's not auto-derived.
- React-select menus often render in portals at `document.body`. Recipes
  search both inside the container and at body level.
- Sleep budgets matter:
  - `TYPING_DELAY` — 25 ms per char (visual)
  - DatePicker settle after blur — 150 ms (in `setDateValue`)
  - Default between-step delay — 400 ms (user-adjustable)
  - Modal waits — 300–1000 ms depending on the form
- Canonical scoping selectors used by recipes:
  `.inventory-create-form`, `.create-item-nav-container`,
  `.create-record-nav-container`, `.metadata-card-form`,
  `.project-popup`, `.inst-signers-modal`, `.verification-modal`,
  `.opex-progress-overlay`, `.export-popup`.

---

## Conventions & Gotchas

- **No URL routing.** Navigation state lives in `NavigationContext`. Don't
  reach for `react-router` — it isn't installed.
- **Latvian UI strings** live under
  [Constants/uiStrings/](src/Constants/uiStrings/) (one file per domain). Help
  content is in [Constants/helpConstants.js](src/Constants/helpConstants.js).
- **Wire dates are `YYYY-MM-DD`**, displayed as `DD.MM.YYYY`. Always convert
  through `parseDate` / `formatDate` from
  [Utils/DateFormatter.js](src/Utils/DateFormatter.js) — don't roll your own.
- **CSS class prefixes** for multi-section forms: `*-nav-*`
  (e.g. `create-record-nav-input`, `edit-item-navigable-nav-section`). Reuse
  them; don't invent new ones.
- **Modals use portals** (`ReactDOM.createPortal`) to escape parent overflow /
  z-index. Look at any existing modal before creating one.
- **VVAIS report upload is a hard gate.** A project with `isMissingReport: true`
  blocks all editing until the report is uploaded.
- **`*Navigable.js` is the canonical multi-section form pattern.** Copy from
  `CreateItemNavigable.js` when adding a new one.
- **Validation lives in `Constants/<domain>Constants.js`**, alongside the
  field-length constants. The validator and its error keys ship together.

---

## How to: Common Dev Tasks

### Add a new domain field

1. Backend — confirm the field exists on the API serializer.
2. Add field-length / validator entries to `Constants/<domain>Constants.js`
   (e.g. `MY_FIELD_MAX_LENGTH`, validator branch in `validateRecordCreate`).
3. Add a UI string to `Constants/uiStrings/<domain>UI.js`.
4. Add the input to the relevant `Create*` and `Edit*` form, wired up via
   the existing `handleInputChange` / `useFormErrors` plumbing.
5. If it's a date, use `<DatePicker>` + the helpers in
   [Utils/DateFormatter.js](src/Utils/DateFormatter.js); set `name="my_field"`
   so the puppet can find it.
6. Update or add a puppet recipe step in
   [DevAdmin/formPuppetRecipes.js](src/DevAdmin/formPuppetRecipes.js) so the
   end-to-end run still passes.

### Add a new API endpoint

1. Add the call to the relevant `src/API/<Domain>_API.js` module via
   `apiClient.get/post/put/del`.
2. Add a query-key entry in `Constants/Constants.js` `QUERY_KEYS`.
3. Add a hook in `src/hooks/` that wraps the call with
   `useQuery` / `useMutation`. Mutations should call
   `queryClient.invalidateQueries` against the relevant key.
4. Surface errors via `parseApiError` → `setApiErrors` in the consuming form.

### Add a new puppet recipe

1. In [DevAdmin/formPuppetRecipes.js](src/DevAdmin/formPuppetRecipes.js),
   write a function returning an array of `{ label, action, expect? }` steps.
   Use the engine primitives (`setReactValue`, `setDateValue`,
   `selectReactSelectOption`, `waitForSelector`).
2. Register it in the `RECIPES` export at the bottom of the file with an id,
   `name`, and optional `formSelector` / `submitSelector`.
3. It will appear in the Puppet tab dropdown automatically.

### Add a test suite

1. Drop a file under
   [DevAdmin/testing/suites/](src/DevAdmin/testing/suites/) using the
   `describe` / `it` / `expect` API of
   [TestRunner.js](src/DevAdmin/testing/TestRunner.js).
2. Register it via `runner.registerSuite('my-suite', mySuiteFn)` wherever the
   other suites are wired up.
3. Run from the Tests tab in DevAdmin.
