# 1. Architecture

## 1.1 What this application is

The OPEX tool is a **local desktop application** for preparing Latvian National
Archive deliverables. A React frontend talks to a Django REST backend running on
the user's own machine at `http://localhost:8000`. **No remote server is
involved** — files and metadata live on the user's disk, and generated exports
are written into a folder the user picked.

The frontend's job is to build and validate a hierarchy — Project → Inventory →
Item → Record → File — and then hand it to the backend to package as OPEX.

---

## 1.2 Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | React 18.3 | function components + hooks throughout; no classes except `PerformanceMonitor` |
| Build | Create React App 5 (`react-scripts`) | not ejected |
| Server state | `@tanstack/react-query` 5 | one dominant query, see 1.5 |
| Client state | React Context ×6 | no Redux, no Zustand |
| Routing | **none** | `NavigationContext` state, not URLs |
| Styling | plain CSS + custom properties | no Tailwind, no CSS-in-JS, no CSS modules |
| Forms | hand-rolled | no Formik, no react-hook-form |
| Dates | `react-datepicker` | wrapped by `Utils/CalendarComponent.js` |
| Selects | `react-select` | themed via a JS style object |
| Virtualisation | `react-window` + `react-virtualized-auto-sizer` | large item lists |
| Icons | FontAwesome 6 Free | class names centralised in `iconConstants.js` |
| Spreadsheets | **hand-written** | `csvParser.js`, `xlsxReader.js`, `docxWriter.js` — zero dependencies, deliberately |
| Testing | Jest (3 files) + a custom in-browser runner (13 suites) | see [12](12-devadmin.md#126-the-in-browser-test-runner) |

`@tanstack/react-query-persist-client` and `react-datetime-picker` are in
`package.json` but unused.

**Scale:** ~66 600 lines of JS/JSX across ~250 files. DevAdmin is ~9 500 of them,
`Constants/helpConstants.js` another ~4 300.

---

## 1.3 Entry points

There is **no `App.js`**. [src/index.js](../src/index.js) is the entry point and
branches on the URL:

```js
const isHelpMode = new URLSearchParams(window.location.search).get('help') === 'true';
```

| Mode | Behaviour |
|---|---|
| **Help** (`?help=true`) | Dynamically `import('./Help/Help')` and render it into `#root` with **no providers**. Code-split, so the help bundle never loads for the main app. |
| **Main app** | Mount the full provider stack around `<Workspace />`. |

A second entry, [src/help.js](../src/help.js), bootstraps the same `Help`
component into a `#help-root` mount for the standalone `public/help.html` page.

Both are wrapped in `React.StrictMode` — effects run twice in development, which
is why several effects here are written to be idempotent.

`index.js` is also where **every stylesheet is imported**, in a load-bearing
order. See [13-styling.md](13-styling.md#131-how-the-cascade-is-set-up).

---

## 1.4 Provider stack

```
QueryClientProvider                  index.js
└─ NotificationProvider              components/Notification.jsx
   └─ SettingsProvider               Settings/context/SettingsContext.jsx
      └─ RoadmapProvider             Roadmap/RoadmapContext.jsx
         └─ GuidanceProvider         Guidance/GuidanceContext.jsx     (needs SettingsProvider)
            └─ ConstantsProvider     context/ConstantsContext.js
               └─ NavigationProvider Navigation/context/NavigationContext.js
                  └─ Workspace       Workspace/Workspace.js
```

Only one ordering constraint is real: `GuidanceProvider` calls `useSettings()`,
so it must be inside `SettingsProvider`. Keep the order anyway.

> **`NavigationProvider` is mounted twice.** `Project.js` mounts a **second**
> one inside `.project_details`, and that is the instance every domain component
> actually consumes. The nesting is deliberate: remounting it when the selected
> project changes resets all navigation state. The outer provider is effectively
> unused. See [10-domain-components.md](10-domain-components.md#two-architectural-quirks).

`Workspace.js` is a thin shell: it calls `useTheme()` and `useAppSettings()` to
apply preferences to `<html>`, shows a loading or error state from
`useProjects()`, and renders `<Project />`.

---

## 1.5 The data model in the client

**The backend returns the entire project tree from one endpoint.**
`GET /api/v1/project/<id>/` yields institution → fond → inventories → items →
records → files → metadata, and the UI is a projection of that object.

Consequences that shape everything else:

1. **One dominant query key** — `['project', 'detail', <id>]`. Nearly every
   mutation invalidates it.
2. **Components read by walking the tree**, not by issuing their own queries.
   `useRecord` / `useMediaRecord` exist for targeted refetches but are secondary.
3. **Optimistic updates rewrite that one cache entry**, which is why
   `useItems.js` and `useInventories.js` contain hand-written tree surgery.
4. **Bulk operations bypass the mutation hooks** — 30 creates would mean 30
   full-tree refetches. `useBulkOperations.js` touches the cache once, at the end.
5. **`NavigationContext` holds a mirror** of the tree, pushed in by
   `ActiveProject.js`, so lookup helpers can decorate entities without prop
   drilling.

React Query defaults (`index.js`): `staleTime` 5 min, `gcTime` 10 min, `retry` 3,
`refetchOnWindowFocus: false`, `refetchOnMount: 'always'`, mutations `retry: 1`.

---

## 1.6 The one rule that shapes the UI

Every screen's layout, the number of records an item may hold, the create
workflow, the required fields and the validation rules all follow from a single
pair of inventory fields:

```
(inventory.type, inventory.electronic) → category → view mode + constraints
```

| type | electronic | category | view mode | records/item |
|---|---|---|---|---|
| `Tekstuāls` | false | `DOCUMENTS` | `SEGMENTED` | 0..∞ |
| `Tekstuāls` | true | `ELECTRONIC_DOCUMENTS` | `SEGMENTED` | 0..∞, each with files |
| `Foto`/`Skaņas`/`Video` | false | `MEDIA` | `COMBINED` | 0..1, no file |
| `Foto`/`Skaņas`/`Video` | true | `ELECTRONIC_MEDIA` | `COMBINED` | 0..1, exactly one file |

This lives in [`Utils/InheritanceUtils.js`](../src/Utils/InheritanceUtils.js) and
is documented in full in [02-domain-model.md](02-domain-model.md). **Read that
chapter before changing anything in `Item/`, `Record/` or `Verification/`.**

---

## 1.7 Directory layout

```
src/
├── index.js                  entry — help vs main app, all CSS imports
├── help.js                   standalone help bundle entry (#help-root)
├── styles/theme.css          the design system (CSS custom properties)
│
├── Workspace/                shell mounted by index.js
├── Project/                  app shell + project CRUD + modal orchestration
├── Inventory/                2nd tier
├── Item/                     3rd tier — canonical multi-section forms
│   └── sections/             7 section-edit popups
├── Record/                   4th tier — records, metadata, files
│   └── sections/             4 section-edit popups
├── Institution/, Fond/       signer management, fond display
│
├── Navigation/               Breadcrumbs, QuickJump, NavigationContext
├── Verification/             pre-OPEX gate: tree, errors, exports
├── Settings/                 preferences UI + SettingsContext
├── Roadmap/                  goal wizard + RoadmapContext
├── Guidance/                 Smart Guide card + workflow engine
├── Help/                     documentation window + DOCX export
├── Toast/                    legacy toast (superseded by Notification)
│
├── API/                      legacy per-domain fetch modules
├── services/                 apiClient, errorService  ← the modern HTTP layer
├── hooks/                    React Query wrappers + small UI hooks
├── context/                  ConstantsContext
├── components/               shared UI (shells + primitives)
├── Constants/                validators, UI strings, help content
│   └── uiStrings/            12 domain files of Latvian text
├── Utils/                    InheritanceUtils, dates, validation, parsers
├── Temp/                     ArchiveData.js — legacy sample data
└── DevAdmin/                 dev-only tooling (stripped from prod builds)
```

---

## 1.8 Cross-cutting patterns

### Two HTTP stacks

`src/services/apiClient.js` (modern, typed errors, retry, timeout) and
`src/API/*_API.js` (legacy, `[ok, payload]` tuples, raw fetch). **All hooks use
the modern one.** Do not extend the legacy modules. See
[03-api-layer.md](03-api-layer.md).

### Full-object payloads

The backend has **no partial-update support**, and `update_related_items()`
silently wipes relation links when `related_item_list` is missing. Always build
payloads with `getItemUpdatePayload` / `getRecordUpdatePayload` /
`getRecordCreatePayload`. A field absent from a PUT is a field being erased.

### Validation lives with its constants

Field length, allowed values, validator and Latvian error message all ship in the
same `Constants/<domain>Constants.js` file. See
[07-constants-validation.md](07-constants-validation.md).

### Dates

Wire format is `YYYY-MM-DD`; display format is `DD.MM.YYYY`. Convert at the form
boundary through `Utils/DateFormatter.js` and never roll your own.

### Modals use portals

Every popup renders through `ReactDOM.createPortal`, locks body scroll (restoring
the original value), and closes on Escape — except mid-batch, where closing would
hide what was already created.

### The window-event bus

Deeply nested components open top-level modals by dispatching `CustomEvent`s on
`window`: `openValidationModal`, `openSignersModal`, `openRoadmapWizard`,
`openUploadReportModal`, `openInventoryCreate`, `openDevAdminPanel`,
`guidanceOpenCreateItem`, `guidanceOpenCreateRecord`, `showSmartGuide`,
`showToast`. Untyped and undiscoverable by search-for-usages — grep for
`dispatchEvent` before adding another. (`showToast` currently has **no
listener**; the event is dispatched and dropped.)

### Latvian everywhere the user can see

All UI text lives in `Constants/uiStrings/`. A literal Latvian string in a
component is a bug. Code, comments and these docs are in English.

---

## 1.9 Where the bodies are buried

A short list of things that will surprise you. Each is explained where it lives.

| Surprise | Where |
|---|---|
| The missing-report gate matches on a **localised error message string** | [10](10-domain-components.md#missing-report-gate) |
| `useProjects` swallows **all** errors and returns `[]` (uvicorn 204 bug) | [04](04-hooks.md#useprojects) |
| `NavigationContext.getInventoryById().statistics` is always zeros (arg-order bug) | [02](02-domain-model.md#getrecordstatisticsitem-inventory--stats) |
| `getAllRecordsFromProject()` cannot see media records, so QuickJump misses them | [05](05-state-management.md#lookup-helpers) |
| `useExportOpex`'s in-flight guard never fires (`{current:false}` instead of `useRef`) | [04](04-hooks.md#export-mutations) |
| `isNotFoundStatus` tests **204**, not 404 | [03](03-api-layer.md#status-helpers) |
| CSS class names are load-bearing for puppet recipes and help zones | [13](13-styling.md#136-css-class-conventions) |
| Four different vocabularies exist for the metadata classes | [07](07-constants-validation.md#validatemetadatametadata-metadatatype--isvalid-errors) |
| `formatFileSize` is implemented four times with different unit labels | [06](06-utilities.md#64-recordvalidationjs--hard-constraints) |
| The Smart Guide button is hard-disabled with `{false && …}` | [10](10-domain-components.md#two-architectural-quirks) |

The full catalogue — 30 items ranked by severity, with evidence and suggested
fixes — is [19 — Known Issues](19-known-issues.md).
