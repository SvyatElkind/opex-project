# 12. DevAdmin — the developer panel

> Directory: [src/DevAdmin/](../src/DevAdmin/) — ~9500 lines, roughly 14 % of the
> frontend.

A floating, draggable, resizable panel with 14 tabs: state inspection, network
capture, an in-browser test runner, test-data generators, and a form-automation
engine that drives the real UI.

**Open with Ctrl+Shift+D.**

---

## 12.1 The gate — `devMode.js`

```js
export const isDevMode = () =>
  process.env.NODE_ENV === 'development' ||
  process.env.REACT_APP_DEV_MODE === 'true';
```

| Command | Dev mode | Output |
|---|---|---|
| `npm start` | **ON** | dev server |
| `npm run start:prod` | **ON** — `react-scripts start` always forces `NODE_ENV=development` | dev server |
| `npm run build:dev` | **ON** | `build-dev/` |
| `npm run build` | **OFF** | `build/` — DevAdmin tree-shaken out |

Everything DevAdmin-related is behind this check. `Project.js` gates the panel,
the keyboard listener and the roadmap-wizard suppression on it.

> `npm run start:prod` sets `REACT_APP_DEV_MODE=false`, but `NODE_ENV` still wins,
> so DevAdmin remains available. Use `npm run build` when you need it truly gone.

---

## 12.2 `DevAdminPanel.jsx` — the shell

```jsx
<DevAdminPanel onClose projectData selectedProjectId projectsList />
```

`selectedProjectId` and `projectsList` are passed **separately from
`projectData`** on purpose: when a project has no VVAIS report the detail request
400s, so `projectData` is `undefined` even though a project *is* selected.
Without the extra props such a project could neither be used nor deleted from
DevAdmin.

Window chrome: drag by the header (ignoring buttons), resize from any edge,
minimise, default position `{x:80, y:60}` and size `900×600`. A `sizeClass`
(`dev-size-compact` < 600 px, `dev-size-medium` < 900 px, else
`dev-size-large`) lets the CSS scale the contents.

### Tab registry

| # | id | Label | Component | Purpose |
|---|---|---|---|---|
| 1 | `state` | State | `ProjectStateInspector.jsx` | Live project / inventory / item / record state |
| 2 | `network` | Network | `NetworkMonitor.jsx` | Captured fetch calls with timing |
| 3 | `forms` | Forms | `FormInspector.jsx` | Live field state of the active form |
| 4 | `performance` | Perf | `PerformanceProfiler.jsx` | `PerformanceMonitor` stats |
| 5 | `tests` | Tests | `TestDashboard.jsx` | In-browser test runner |
| 6 | `errors` | Errors | `ErrorBoundaryTester.jsx` | Trigger error states |
| 7 | `mocks` | Mocks | `APIMockToggle.jsx` | Mock API responses |
| 8 | `storage` | Storage | `LocalStorageManager.jsx` | Inspect / edit `localStorage` |
| 9 | `validation` | Valid. | `ValidationTester.jsx` | Run validators in isolation |
| 10 | `quickcreate` | Create | `QuickCreate.jsx` | One-click data builders |
| 11 | `theme` | Theme | `ThemeSwitcher.jsx` | Theme override |
| 12 | `actions` | Actions | `QuickActions.jsx` | Bulk generative / destructive actions |
| 13 | `puppet` | Puppet | `FormPuppet.jsx` | Run scripted UI flows |
| 14 | `opex` | OPEX | `OPEXProgressMonitor.jsx` | Watch OPEX generation |

There is also a **Mini Form Inspector** floating widget (`formInspectMode`) that
polls the active form every 600 ms.

`CopyButton.jsx` is a shared "copy this JSON" helper used across tabs.

---

## 12.3 `fetchInterceptor.js` — the shared `window.fetch` wrapper

Both `NetworkMonitor` and `APIMockToggle` need to wrap `window.fetch`. If each
stored its own `originalFetch`, **whichever unmounted first would silently
discard the other's wrapper**. This module solves that with one reference to the
real fetch and a middleware stack.

```js
const id = addMiddleware(async (args, next) => {
  return next(args);        // pass through
  // — or —
  return new Response(…);   // short-circuit
});
removeMiddleware(id);       // on unmount
```

| Export | Description |
|---|---|
| `addMiddleware(fn)` | Registers `(args, next) => Promise<Response>`; returns an id. Installs the wrapper on first use. |
| `removeMiddleware(id)` | Unregisters, and **restores the original `window.fetch` when the stack empties**. |
| `getOriginalFetch()` | The un-wrapped fetch — use it to avoid recursion inside a middleware. |

Middleware runs in insertion order.

---

## 12.4 The Form Puppet

Drives the real React forms by simulating user interaction. Three files:
the engine (primitives), the recipes (scripts), and the UI.

### `formPuppetEngine.js` — primitives

**The core trick.** React tracks `<input>` values through its fiber and ignores
direct `element.value = x` assignments. The engine captures the **native** value
setters once at module load and uses them to bypass React's interception:

```js
const nativeInputSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype, 'value'
).set;

nativeInputSetter.call(input, newValue);
input.dispatchEvent(new Event('input', { bubbles: true }));
```

There is a matching `nativeTextareaSetter`.

| Export | Signature | Notes |
|---|---|---|
| `sleep(ms)` | | |
| `isoToDisplayDate(str)` | `YYYY-MM-DD → DD.MM.YYYY` | Passes anything else through unchanged. |
| `waitForSelector(selector, timeoutMs = 5000)` | `Promise<Element>` | `MutationObserver` on `document.body`, `{childList, subtree}`. Rejects on timeout. |
| `waitForSelectorGone(selector, timeoutMs = 5000)` | `Promise<void>` | |
| `setReactValue(el, value, { charDelay = 0 })` | async | Instant fill, or character-by-character when `charDelay > 0`. Fires `input` per character and a final `change`. |
| `setSelectValue(el, value)` | | Native `<select>` — plain assignment plus `change`. |
| `setDateValue(el, isoStr)` | async | Auto-detects native `<input type="date">` vs a react-datepicker text input (via `closest('.react-datepicker__input-container')`). For the datepicker it converts to `DD.MM.YYYY`, sets, blurs to commit, then waits **150 ms** for react-datepicker to settle. |
| `setCheckbox(el, bool)` | | Clicks only when the state differs. |
| `selectReactSelectOption(containerSelector, labelText, delayMs = 300)` | async | `mousedown` on `[class*="-control"]` to open, then clicks the `[class*="-option"]` whose trimmed text matches. Throws when the container or option is missing. |
| `addTagValue(el, value, { charDelay })` | async | Types, then clicks a matching dropdown option if one appeared, else presses Enter; clears the input afterwards. |
| `highlightElement(el, durationMs = 600)` | | Green outline flash; restores the original `cssText`. |
| `scrollIntoView(el)` | | |
| `runPuppetSteps(steps, onStep, opts)` | async | See below. |
| `verifyFormState(steps)` | | Diffs each step's `expect` against the live DOM. |
| `formatPuppetLog(name, result)` | | Paste-ready report. |

**`runPuppetSteps(steps, onStep, { delayBetween = 400, abortSignal })`**

Returns `{ completed, failed, errors, log, totalMs, verification }`.

- `onStep(index, label, status)` where `status` ∈ `'running' | 'done' | 'error'`.
- A failing step is **recorded and the run continues** — it never throws.
- `abortSignal.aborted` is checked before each step.
- Per-step duration is measured with `performance.now()`.
- `verifyFormState` runs automatically at the end.

**`verifyFormState(steps)`** — each step may carry
`expect: { selector, value, name? }` or an array of them. Checkboxes compare
`String(el.checked)`; a missing element yields `'(not found)'`. Returns
`{ checks, passed, failed }` with actual values truncated to 120 chars.

**`formatPuppetLog(recipeName, result)`** emits recipe name, ISO timestamp,
result line, user agent, URL, per-step log with durations, the error list, the
verification table, and a **DOM snapshot** of the first visible form among
`.inventory-create-form`, `.create-item-nav-container`,
`.create-record-nav-container`, `.metadata-card-form`.

### `formPuppetRecipes.js` — scripts

2173 lines. A **recipe** is a function returning an array of steps:

```js
{
  label: 'Ievada datumu: 2024-05-12',
  expect: { selector: '[name="date"]', value: '2024-05-12', name: 'date' },
  action: async () => { /* … */ },
}
```

Step labels are Latvian by convention so they read naturally next to the form
they drive.

**Recipe registry — `RECIPES`**

| id | Name | `formSelector` | `openEvent` | `submitSelector` |
|---|---|---|---|---|
| `full_project` | *** PILNS PROJEKTS (0 lidz pilnam) | `body` | — | — |
| `project_create` | Jauns projekts | `.project-popup` | — | `.project-popup .btn-action` |
| `signers` | Parakstitaji (iestade) | `.inst-signers-modal` | `openSignersModal` | `.inst-signers-btn-save` |
| `inventory_create` | Jauns US (Inventars) | `.inventory-create-form` | `openInventoryCreate` | `.inventory-create-submit-button` |
| `item_create` | Jauna GV (Vieniba) | `.create-item-nav-container` | — | `.create-item-nav-btn-primary[type="submit"]` |
| `record_create_doc` | Jauns tekstuals dokuments | `.create-record-nav-container` | — | `.create-record-nav-btn-primary[type="submit"]` |
| `metadata_visa` | Viza (metadati) | `.metadata-card-form` | — | `.metadata-card-btn-save` |
| `metadata_addressee` | Adresats (metadati) | `.metadata-card-form` | — | `.metadata-card-btn-save` |
| `metadata_action` | Darbiba (metadati) | `.metadata-card-form` | — | `.metadata-card-btn-save` |
| `metadata_read_status` | Iepazisanas statuss (metadati) | `.metadata-card-form` | — | `.metadata-card-btn-save` |
| `export_inventory_list` | Eksports: Uzskaites saraksts (US) | `body` | — | — |
| `export_pn_akts` | Eksports: PN akts (Elektroniskais + Fiziskais) | `body` | — | — |
| `generate_opex` | Ģenerē OPEX (Ilgstoši + Pastāvīgi) | `body` | — | — |
| `verification_full` | Verifikācija pilna (US + PN + OPEX) | `body` | — | — |

`formSelector: 'body'` means the recipe handles its own navigation.
`openEvent` is a window event the puppet dispatches to open the form.

**`fullProjectRecipe`** is the zero-to-complete run: create project → upload the
VVAIS xlsx → signers → inventories → items → records → files → metadata. It is
what **Ctrl+Shift+F** executes headlessly.

**Internal helpers**

| Helper | Purpose |
|---|---|
| `findByName(name, container)` | Locate an input by its `name` attribute. |
| `fillDatepicker(input, isoStr)` | focus → clear → type → Tab to commit. |
| `randomDate(startYear = 2020, endYear = 2025)` | |
| `waitGone(selector, timeoutMs = 8000)` | |
| `switchToDokumentiTab()`, `switchRecordTab(label)`, `clickBackBtn()` | Navigation primitives. |
| `clickLastRecordRow()`, `clickLastItemRow()` | Select the newest row. |
| `injectFilesIntoInput(input, files)` | Build a `DataTransfer` and fire `change`. |
| `fetchTestFiles(fileNames)` | Load real fixtures from `public/files/` via the manifest. |
| `openVerificationModal()`, `closeVerificationModal()`, `getVerificationFooterBtn(i)` | Verification-modal control. |
| `waitForButtonNotPending(getButton, timeoutMs = 90000)` | Wait out a pending export. |
| `waitForOpexCompletion(timeoutMs = 600000)` | **10-minute** ceiling for a full OPEX run. |
| `closeOpexProgress()` | |

### `components/FormPuppet.jsx` — the UI

Recipe dropdown, Play/Stop, speed control (instant / normal / slow → adjusts
`delayBetween`), an auto-submit checkbox using `recipe.submitSelector`, a live
progress bar with per-step icons, a result panel with a copy-log button, and a
collapsible run history.

### Puppet gotchas

- Recipes find inputs by `[name="..."]`. **Any `<DatePicker>` a recipe drives
  must have a `name` prop** — react-datepicker does not derive one.
- react-select menus often render in portals at `document.body`; recipes search
  both inside the container and at body level.
- Sleep budgets that matter: `TYPING_DELAY` 25 ms/char, datepicker settle 150 ms,
  default between-step delay 400 ms, modal waits 300–1000 ms.
- Canonical scoping selectors: `.inventory-create-form`,
  `.create-item-nav-container`, `.create-record-nav-container`,
  `.metadata-card-form`, `.project-popup`, `.inst-signers-modal`,
  `.verification-modal`, `.opex-progress-overlay`, `.export-popup`.
  **Renaming any of these breaks the recipes silently** — they will time out
  rather than fail loudly.

---

## 12.5 Test data

### `testDataUtils.js`

Shared random-data helpers used by both the recipes and QuickCreate.

| Export | Description |
|---|---|
| `pick(arr)`, `randInt(min,max)`, `pad(n)` | Primitives. |
| `randomDate(start, end)` | |
| `randomPerson()` | Latvian first + last name. |
| `randomItemName(type)` | Uses `ITEM_TYPE_NAMES`. |
| `generateSeriesCode()` | Backend-regex-conformant codes like `3.12` or `3.12.7`. |
| `buildVisa(date)`, `buildAddressee()`, `buildAction(createdDate)`, `buildReadStatus(date)` | Single metadata builders. |
| `generateMetadataForRecord(addFn, projectId, recordId, recordDate)` | Bulk metadata seeder. |
| `metadataSummary(created)`, `metadataTotal(created)` | Reporting. |

Word banks: `ITEM_TYPE_NAMES`, `VISA_NOTES`, `READ_STATUS_NOTES`,
`ACTION_TASKS`, `ADDRESSEE_NAMES`, `LANGUAGES` (diacritic-free, so they survive
being typed into inputs by the puppet).

### `devDataFactory.js`

Higher-level builders that talk to the API directly.

| Export | Description |
|---|---|
| `INVENTORY_TYPES`, `STORAGE_TERMS`, `METADATA_CLASSES` | Enum copies. |
| `randomProjectName(prefix = 'test')` | |
| `getStoredProjectRoot()` / `setStoredProjectRoot(path)` | `localStorage['devadmin_project_root']`. |
| `parentPath(fullPath)` | |
| `resolveProjectRoot(projects?)` | Derives a root folder from existing projects. |
| `describeApiError(error)` | Human-readable error text. |
| `buildInventoryData`, `buildItemData`, `buildRecordData` | Payload builders. |
| `loadManifest(force = false)` | Reads `public/files/manifest.json`. |
| `getTestFile(inventoryType)` | Picks a fixture matching the type, using `MIME_MAP` / `EXTENSIONS_BY_TYPE`. |
| `createProject`, `createInventory`, `createItem`, `createRecord`, `uploadFile`, `addMetadata` | Direct API calls. |

### The file manifest

`npm run manifest:public` scans `public/files/` and writes
`public/files/manifest.json` as `{ files: [...] }`. It runs automatically before
`start`, `build` and `build:dev`. Run it manually if you add fixtures mid-session
— without it `fetchTestFiles` and `getTestFile` find nothing.

`npm run build` deletes `build/files/` afterwards, so fixtures never ship in a
production build.

### QuickCreate / QuickActions / TestDataGenerator

- **QuickCreate** — one-click fills: project, inventory, item, record, file,
  metadata. *Fill Project* chains them into one realistic project.
- **QuickActions** (1261 lines) — bulk delete inventories or items; bulk-populate
  report-sourced inventories with ~100 items each including files and metadata.
- **TestDataGenerator** — the same generators with form controls for tuning the
  data first.

---

## 12.6 The in-browser test runner

### `testing/TestRunner.js`

A Jest-flavoured runner: `describe` / `it` / `expect`, plus an
`AssertionError` carrying `expected` and `actual` so the dashboard can render a
diff.

**Matchers** (and their `.not` counterparts): `toBe`, `toEqual` (JSON deep
compare), `toBeTruthy`, `toBeFalsy`, `toBeNull`, `toBeUndefined`, `toBeDefined`,
`toBeGreaterThan`, `toBeGreaterThanOrEqual`, `toBeLessThan`, `toContain`,
`toHaveLength`, `toBeInstanceOf`, `toMatch`, `toThrow`.

> `toEqual` compares `JSON.stringify` output, so it is **order-sensitive for
> object keys** and blind to `undefined` values. It is not Jest's structural
> equality.

Suites register with `runner.registerSuite(name, fn)`.

### `testing/index.js`

`createTestRunner()` returns a runner with all 13 suites registered:

| Registered name | File | Coverage |
|---|---|---|
| API Modules | `apiTests.js` | Legacy `*_API.js` modules |
| Validation Functions | `validationTests.js` | Field validators |
| InheritanceUtils | `inheritanceTests.js` | Category logic + validation cascade |
| Context & State | `contextTests.js` | Provider/consumer behaviour |
| Integration Workflows | `integrationTests.js` | Cross-module flows |
| Hooks & API Client Layer | `hookTests.js` | Custom hooks |
| Form Validation (All Forms) | `formValidationTests.js` | 1436 lines — the largest suite |
| API Client Service | `apiClientTests.js` | `apiClient` + `errorService` |
| Form Workflow E2E | `formWorkflowTests.js` | Multi-step form state |
| State Management Patterns | `stateManagementTests.js` | Context mutations |
| Bulk Operations (Multi Create/Edit) | `bulkOperationTests.js` | `bulkConstants` transforms |
| CSV / Excel Import | `importTests.js` | Parsers + mapper |
| E2E Archival Workflow | `e2eWorkflowTests.js` | Project → upload → verify |

Fixtures live in `testing/assets/` (`Fonds_Iestade_GV.xlsx`,
`Fonds_Iestade_GV_VALSTS_KASE.xlsx`).

Run them from the **Tests** tab (`TestDashboard.jsx`), which shows per-test
duration and assertion diffs.

> **This is separate from Jest.** `npm test` runs the three real Jest files
> (`xlsxReader.test.js`, `helpDocxExport.test.js`,
> `MultiCreateItemsPopup.test.js`). The suites above only run in the browser.

---

## 12.7 Extending DevAdmin

### Add a puppet recipe

1. Write a function returning `[{ label, action, expect? }]`, using the engine
   primitives.
2. Register it in `RECIPES` with an `id`, `name`, and optional `formSelector` /
   `openEvent` / `submitSelector`.
3. It appears in the Puppet dropdown automatically.

### Add a test suite

1. Drop a file in `testing/suites/` using `describe` / `it` / `expect`.
2. Import it in `testing/index.js` and add a `runner.registerSuite(...)` line.
3. Run it from the Tests tab.

### Add a panel tab

1. Create the component in `DevAdmin/components/`.
2. Add `{ id, label, icon }` to `TABS` in `DevAdminPanel.jsx` and a render branch.
3. If it needs to observe network traffic, use `addMiddleware` — never wrap
   `window.fetch` yourself.
