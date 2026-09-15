# 18. DevAdmin — Component Reference

Per-tab reference for the 14 panels plus the shared `CopyButton`. The panel
shell, the puppet engine, the test runner and the data factories are in
[12-devadmin.md](12-devadmin.md); this chapter covers the individual components.

All of it is stripped from `npm run build`.

| Component | Lines | Tab |
|---|---|---|
| `QuickActions.jsx` | 1261 | Actions |
| `QuickCreate.jsx` | 665 | Create |
| `FormInspector.jsx` | 579 | Forms |
| `OPEXProgressMonitor.jsx` | 439 | OPEX |
| `APIMockToggle.jsx` | 414 | Mocks |
| `NetworkMonitor.jsx` | 404 | Network |
| `TestDataGenerator.jsx` | 401 | (inside Actions) |
| `FormPuppet.jsx` | 371 | Puppet |
| `PerformanceProfiler.jsx` | 334 | Perf |
| `ErrorBoundaryTester.jsx` | 329 | Errors |
| `TestDashboard.jsx` | 325 | Tests |
| `ThemeSwitcher.jsx` | 324 | Theme |
| `ProjectStateInspector.jsx` | 261 | State |
| `LocalStorageManager.jsx` | 237 | Storage |
| `CopyButton.jsx` | 228 | shared |
| `ValidationTester.jsx` | 178 | Valid. |

---

## 18.1 `CopyButton.jsx` — shared

```jsx
<CopyButton text="content to copy" />
<CopyButton getText={() => buildReportString()} label="Copy Report" />
```

| Prop | Default | Description |
|---|---|---|
| `text` | — | Static content. |
| `getText` | — | Lazy producer, evaluated on click. Takes precedence over `text`. |
| `label` | `'Copy'` | |
| `style`, `className` | | |

Shows a "copied" state for 1500 ms. `stopPropagation`s so it can sit inside a
clickable row. Falls back to a hidden `<textarea>` + `execCommand` when
`navigator.clipboard` is unavailable — DevAdmin is often opened on
`http://localhost`, which is a secure context, but not on a LAN IP, which is not.

**The point of this component is paste-ready bug reports.** Six formatters ship
alongside it:

| Export | Produces |
|---|---|
| `formatTestReport(results)` | Full test-run summary |
| `formatSingleTest(suiteName, test)` | One test with its assertion diff |
| `formatNetworkRequest(req)` | Method, URL, status, timing, headers, bodies |
| `formatAsCurl(req)` | A runnable `curl` command for the captured request |
| `formatFormReport(form)` | Field-by-field snapshot of a live form |
| `formatErrorLog(logs)` | Error-injection log |

`formatAsCurl` is the fastest way to hand a failing request to whoever owns the
backend.

---

## 18.2 State — `ProjectStateInspector.jsx`

`{ projectData }`

A collapsible JSON tree over the live project. Because
`GET /project/<id>/` returns the whole hierarchy, this is effectively an
inspector for the entire client-side data model: institution → fond →
inventories → items → records → files → metadata.

Use it to confirm which record array is populated (`records` vs
`photo_records` / `video_records` / `audio_records`) — the single most common
source of confusion when a media item "has no records".

---

## 18.3 Network — `NetworkMonitor.jsx`

Live request log. Registers a middleware through
[`fetchInterceptor`](12-devadmin.md#123-fetchinterceptorjs--the-shared-windowfetch-wrapper)
rather than wrapping `window.fetch` itself, so it can coexist with the Mocks tab.

Captures method, URL, status, request/response headers, request/response bodies
and duration. Each entry offers `formatNetworkRequest` and `formatAsCurl` copy
buttons.

**First place to look** when a mutation silently does nothing — it will show
either no request at all (a guard returned early) or the 4xx with its parsed
body.

---

## 18.4 Forms — `FormInspector.jsx`

Two modes.

**Catalog** — a static `FORM_CATALOG` describing every form in the app grouped by
hierarchy level, with whether it is currently reachable:

```
Projekts    → Institution / Fond / Inventory forms
Inventārs   → Item forms
Vienība     → Record / Media record forms
Dokuments   → File / Metadata forms
```

**Inspect** — minimises DevAdmin to a floating mini-panel and polls the active
form (every 600 ms) so you can watch `formData` change while typing. Reports
each field's `name`, current value and validation state, copyable via
`formatFormReport`.

It also imports `RECIPES` and `runPuppetSteps`, so a catalog entry can be filled
by its recipe directly from this tab.

> The mini-panel finds "the active form" by the same canonical container
> selectors the puppet uses (`.create-item-nav-container`, etc.). A form without
> one of those classes is invisible to it.

---

## 18.5 Perf — `PerformanceProfiler.jsx`

Three sections:

1. **React Query cache** — query count, and how many are stale / fresh /
   fetching, read from `useQueryClient()`.
2. **Memory** — `performance.memory` (`usedJSHeapSize`, `totalJSHeapSize`,
   `jsHeapSizeLimit`) in MB. Chromium-only; the section is hidden elsewhere.
3. **Component timings** — the `PerformanceMonitor` singleton's stats:
   `count`, `avg`, `min`, `max`, `stdDev` per label.

> Timings only exist for components that call `usePerformance(name)` —
> currently `Items.js`. And `PerformanceMonitor.isEnabled` is
> `NODE_ENV === 'development'`, so this tab is **empty in a `build:dev` build**
> even though the panel itself is present.

---

## 18.6 Tests — `TestDashboard.jsx`

Runs the 13 in-browser suites from `createTestRunner()`.

- Run all, or one suite.
- Live progress with per-test pass/fail and duration.
- Failed assertions show `expected` vs `actual` from `AssertionError`.
- `formatTestReport` / `formatSingleTest` copy buttons.

Not connected to `npm test` — see
[12 §12.6](12-devadmin.md#126-the-in-browser-test-runner).

---

## 18.7 Errors — `ErrorBoundaryTester.jsx`

Deliberate failure injection:

| Trigger | Effect |
|---|---|
| Render error | `CrashComponent` throws during render |
| API errors | Simulated 400 / 401 / 403 / 404 / 500 |
| Corrupt localStorage | Writes invalid JSON to test the `try/catch` recovery in every context |
| Network disconnection | |
| Slow API | |
| Concurrent mutation conflict | Two writes racing on the same entity |

The localStorage corruption test is the most useful one: every context reads its
key inside a `try/catch` with a default, and this is how you verify that a
corrupted `opex_settings` or `opex_project_roadmaps` still boots the app.

Errors are logged and copyable via `formatErrorLog`.

---

## 18.8 Mocks — `APIMockToggle.jsx`

Failure injection at the fetch layer, via `addMiddleware`. State lives in a
module-level `mockState` object so it survives component re-renders:

| Control | `mockState` field | Effect |
|---|---|---|
| Failure rate | `failureRate` (0–100) | Randomly fail that percentage of requests |
| Forced status | `forcedStatus: { code, remaining }` | Force a status on the next N requests, then stop |
| Latency | `latencyMs` | Delay every request |
| Base URL override | `customBaseUrl` | Point the app at a different backend |
| Blocked endpoints | `blockedEndpoints[]` | URL patterns that fail immediately |
| | `interceptCount` | Requests seen |

`getOriginalFetch()` is used where the mock needs to make a real call without
re-entering its own middleware.

This is how you reproduce the retry path (`502`/`503`/`504` are the only
auto-retried statuses) and the `ApiError.status === 0` network branch without
unplugging anything.

---

## 18.9 Storage — `LocalStorageManager.jsx`

Lists every `localStorage` key with its value, and allows edit and delete. The
keys that matter:

| Key | Owner |
|---|---|
| `opex_settings` | SettingsContext |
| `opex_project_roadmaps` | RoadmapContext |
| `guidanceVisible`, `guidanceMinimized`, `dismissedGuidanceActions` | GuidanceContext |
| `opex_dismissed_warnings` | VerificationModal |
| `inventory-favorites-<projectId>` | Inventories |
| `devadmin_project_root` | devDataFactory |

`items_page_<inventoryId>` lives in **sessionStorage**, not localStorage, so it
does not appear here.

Editing `opex_settings` here is the quickest way to reach a settings state the UI
does not expose — but note the contexts only read their key **on mount**, so a
reload is needed for most edits to take effect.

---

## 18.10 Valid. — `ValidationTester.jsx`

`{ projectData }`

Runs `validateProjectForOPEX(projectData)` in isolation and renders the raw
result: `summary`, `errors`, `warnings` and the per-inventory
`inventoryValidations` tree.

Useful because the Verification modal *filters and formats* what it shows —
dismissed warnings are hidden, physical inventories can be excluded, and messages
are re-phrased with breadcrumb context. This tab shows the unprocessed envelope.

---

## 18.11 Create — `QuickCreate.jsx`

One-click test-data builder. From the header comment:

> Chain: Projekts → US (inventory) → GV (item) → Dok. (record) → Datne + metadati.
> Every creator takes a **count**, so seeding 25 items is one click rather than 25.
> Entity ids come from the POST responses (see `devDataFactory`).

Each stage can be run alone, or *Fill Project* chains them all into one realistic
project. Backed by `devDataFactory`'s `createProject` / `createInventory` /
`createItem` / `createRecord` / `uploadFile` / `addMetadata`, with random content
from `testDataUtils`.

File attachment depends on `public/files/manifest.json`; a stale manifest means
records are created with no files. Run `npm run manifest:public`.

---

## 18.12 Theme — `ThemeSwitcher.jsx`

Live CSS-variable editor. Overrides custom properties on `:root` in real time,
with preset themes and a colour picker.

> **Changes are not saved — they reset on refresh.** This is a preview tool, not
> a settings surface. To change the real palette, edit
> [styles/theme.css](../src/styles/theme.css), remembering to update **both** the
> `:root` block and the `[data-theme="dark"]` block.

---

## 18.13 Actions — `QuickActions.jsx`

The largest DevAdmin component (1261 lines). Bulk generative and destructive
operations, plus `TestDataGenerator` embedded as a sub-panel.

`{ projectData, selectedProjectId, projectsList }` — it takes
`selectedProjectId` and `projectsList` separately because a project with no VVAIS
report has no `projectData` (the detail request 400s) yet must still be
deletable.

Typical actions: delete all inventories, delete all items, and bulk-populate
report-sourced inventories with ~100 items each including files and metadata.

> **This is the only DevAdmin component that still uses the legacy
> `*_API.js` modules** (`Inventory_API`, `Item_API`, `Record_API`) — as does
> `TestDataGenerator`. They therefore bypass `apiClient`'s timeout, retry and
> `ApiError` handling, and a failure surfaces as the `[false, message]` tuple
> instead of a thrown error. Worth knowing when a bulk action fails quietly.

### `TestDataGenerator.jsx`

Granular generator with form controls: 10 inventories distributed across all four
types, then items, records and files per inventory. Same legacy-API caveat.

---

## 18.14 Puppet — `FormPuppet.jsx`

UI for the form-automation engine. Covered in
[12 §12.4](12-devadmin.md#124-the-form-puppet).

Recipe dropdown → Play/Stop → speed control (adjusts `delayBetween`) →
auto-submit checkbox (`recipe.submitSelector`) → live progress with per-step
icons → result panel with `formatPuppetLog` copy → collapsible run history.

---

## 18.15 OPEX — `OPEXProgressMonitor.jsx`

A **second, independent** WebSocket client for `ws://localhost:8000/ws/opex_progress/`,
separate from `hooks/useOpexProgress.js`.

Differences from the user-facing modal:

| | `OpexProgressModal` (user) | `OPEXProgressMonitor` (dev) |
|---|---|---|
| Source | `useOpexProgress` | its own socket in the component |
| Shows | phases, percentage, per-inventory progress, ETA | **raw message stream** |
| Also runs | — | `validateProjectForOPEX` alongside, to correlate errors with files |
| Starts the export | yes (from `ws.onopen`) | can attach to a run already in progress |

Use it when the user-facing bar disagrees with reality — it shows exactly what
the backend emitted, including message levels the modal ignores
(`opex_folder_deleted`, `deleting_opex_folder_failed`).

> Two independent socket clients means both can be connected at once. That is
> harmless — the backend broadcasts — but the counters are computed separately
> and can disagree if one attached late.

---

## 18.16 Which tab for which problem

| Symptom | Tab |
|---|---|
| A mutation seems to do nothing | **Network** — is a request even sent? |
| A 400 with an unhelpful message | **Network** → copy as curl → replay |
| A form field will not update | **Forms** (inspect mode) |
| "Why is this flagged in verification?" | **Valid.** — the unfiltered envelope |
| "Why is this *not* flagged?" | **State** — check which record array is populated |
| Reproduce a server error | **Mocks** — forced status |
| Reproduce an offline/timeout state | **Mocks** — blocked endpoint or high latency |
| Verify corrupt-storage recovery | **Errors** |
| App feels slow | **Perf** — cache size, memory, timings |
| Need a populated project fast | **Create** → Fill Project |
| Need to clear a project | **Actions** |
| Regression check before commit | **Tests**, then Ctrl+Shift+F |
| OPEX bar looks wrong | **OPEX** — raw message stream |
| A setting is stuck | **Storage** — edit `opex_settings`, then reload |
