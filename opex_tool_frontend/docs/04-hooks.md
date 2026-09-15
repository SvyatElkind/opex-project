# 4. Hooks Reference

> Directory: [src/hooks/](../src/hooks/)

Fifteen hook modules. Most are thin React Query wrappers over
[`apiClient`](03-api-layer.md); four (`useFormErrors`, `useTheme`,
`useAppSettings`, `useScrollDirection`) are pure client-side.

**Business logic does not live here.** It lives in components,
`Utils/InheritanceUtils.js`, and the `Constants/*Constants.js` validators.

---

## 4.0 The cache model in one paragraph

There is effectively **one server-state query**: `['project', 'detail', <id>]`.
The backend returns the entire project tree — institution → fond → inventories →
items → records → files → metadata — in a single `GET /project/<id>/`. Almost
every mutation therefore invalidates that one key, and components read their data
by walking the tree rather than by issuing their own queries. `useRecord`,
`useMediaRecord` and `useMetadataMethods` exist for targeted refetches but are
secondary.

```
['projects']                        → project list (id + name only)
['project','detail',<pid>]          → THE tree
['record',<pid>,<rid>]              → single record detail
['mediaRecord',<pid>,<rid>]
['metadataMethods',<pid>,<rid>]
['files',<pid>,<rid>]
```

Keys are produced by `QUERY_KEYS` in
[Constants/Constants.js](../src/Constants/Constants.js). `useProjects.js` also
defines a **local** `projectKeys` factory; the two agree by construction
(`projectKeys.detail(id)` ≡ `QUERY_KEYS.project(id)` ≡ `['project','detail',id]`)
and a comment in the file warns that they must be kept in sync.

---

## 4.1 `useProjects.js`

### `useProjects()`

`useQuery(['projects'])` → `GET /project/`.

- `staleTime: 30000` (overrides the 5-minute global default).
- **Swallows every error and returns `[]`.** The comment explains why: uvicorn's
  h11 layer crashes when Django returns `204 No Content` for an empty project
  list, surfacing as a network error. An empty list is indistinguishable from a
  real outage here.

### `useProject(projectId)`

`useQuery(['project','detail',projectId])` → `GET /project/<pid>/`.

- `enabled: !!projectId`; returns `null` when the id is falsy.
- Custom `retry`: **no retry** when the error message contains
  `"Nav importēta VVAIS atskaite"` — that is an expected state (the project
  exists but has no report yet), not a failure. Otherwise up to 2 attempts.

### Mutations

| Hook | `mutate(vars)` | Endpoint | Cache effect |
|---|---|---|---|
| `useCreateProject()` | `projectData` | `POST /project/` | invalidates `['projects']` |
| `useRenameProject()` | `{ projectId, newName }` | `PUT /project/<pid>/` body `{name}` | invalidates list + detail |
| `useDeleteProject()` | `projectId` | `DELETE /project/<pid>/` | `removeQueries(detail)` + invalidates list |
| `useUploadReport()` | `{ projectId, file }` | `POST /project/<pid>/add_report/` | invalidates detail |

`useUploadReport` reads the `File` with `FileReader.readAsArrayBuffer` and posts
the raw buffer with `Content-Type: application/octet-stream` and
`Content-Disposition: attachment; filename="…"`. **There is deliberately no size
limit** — archival reports can be arbitrarily large.

### Export mutations

`extractExportPath(data)` is a private helper: the backend answers
`{ success: [humanMessage, savedPath] }`, so it returns `success[1]`, or
`success` itself if it is a bare string, else `null`.

| Hook | `mutate(vars)` | Returns |
|---|---|---|
| `useExportInventoryList()` | `projectId` | `{ success: true, path }` — backend writes the XLSX (*Uzskaites saraksts*) into the project folder |
| `useExportAcceptanceReport()` | `{ projectId, electronic = true }` | `{ success: true, path }` — DOCX (*PN akts*) |
| `useExportOpex()` | `{ projectId, includeLongTerm = false }` | `{ started: true }` or `{ alreadyRunning: true }` |

> **Bug worth knowing.** `useExportOpex` declares `const pendingRef = { current: false }`
> *inside the hook body* — a fresh object on every render, not a `useRef`. The
> in-flight guard therefore never actually fires across renders. In practice the
> UI (`VerificationModal`) prevents double submission, and the WebSocket-driven
> path in `useOpexProgress` is used instead for the real flow.

---

## 4.2 `useInventories.js`

Mutations only — inventories are read from the project tree.

| Hook | `mutate(vars)` | Endpoint |
|---|---|---|
| `useCreateInventory()` | `{ projectId, fondId, inventoryData }` | `POST /project/<pid>/inventory/?fond_id=<fid>` |
| `useUpdateInventory()` | `{ projectId, inventoryId, inventoryData }` | `PUT /project/<pid>/inventory/<invid>/` |
| `useDeleteInventory()` | `{ projectId, inventoryId }` | `DELETE …` |

`useUpdateInventory` is the one inventory hook with an **optimistic update**:

1. `onMutate` cancels in-flight detail queries, snapshots the project, then
   rewrites `institution.fond.inventories[]` in place, merging `inventoryData`
   but **preserving `id` and `number`** (the backend owns those).
2. `onError` restores the snapshot from context.
3. `onSettled` invalidates the detail key regardless of outcome.

> **Caveat.** The optimistic writer mutates nested objects
> (`updatedProject.institution.fond.inventories = …` on a shallow copy), so the
> previous cache object is partially aliased. The rollback still works because
> the snapshot is taken before the write, but do not copy this pattern.

---

## 4.3 `useItems.js`

All three mutations are optimistic and all operate on the single project-detail
cache entry.

### `useCreateItem(shouldInvalidate = true)`

`mutate({ itemData, projectId, inventoryId })` → `POST /project/<pid>/item/?inventory_id=<invid>`

- `onMutate` inserts a placeholder item with
  `id: 'temp_<epochMs>_<random>'` and `isOptimistic: true`, bumps
  `items_per_period`, and raises `last_gv` to `max(last_gv, itemData.number)`.
- `onSuccess` replaces the placeholder — matched by `isOptimistic && number === itemData.number` —
  with the server payload and clears the flag.
- **`shouldInvalidate = false`** suppresses the final `invalidateQueries`. Callers
  that create many items in a row (multi-create popup) pass `false` and invalidate
  once when the popup closes, avoiding N refetches of the whole tree.

### `useUpdateItem()`

`mutate({ itemData, projectId, itemId })` → `PUT /project/<pid>/item/<itid>/`.
Optimistically merges `itemData` into the matching item across **all**
inventories, rolls back on error, replaces with server data and invalidates on
success.

### `useDeleteItem()`

`mutate({ projectId, itemId })`. Optimistically filters the item out and
decrements `items_per_period` (floored at 0). Always invalidates.

### `useInvalidateProject()`

Returns `(projectId) => void` that invalidates `['project','detail',projectId]`.
Use it when you have written through a non-hook path and need the tree refreshed.

---

## 4.4 `useRecords.js`

The busiest hook module. Internal helpers first:

- **`API_ENDPOINTS`** — the same six URL builders as `Record_API.buildAPIURL`,
  but **relative** (no `/api/v1` prefix, because `apiClient` prepends it).
- **`invalidateRelatedQueries(queryClient, projectId, recordId, itemId)`** —
  invalidates, conditionally: `project(pid)` always; `record`, `mediaRecord`
  and `metadata` when `recordId` is given; `records` and `mediaRecords` lists
  when `itemId` is given.
- **`validateMediaRecordData(recordData, recordType)`** — a verbatim copy of the
  validator in `Record_API.js`. Two copies of the same rules; change both.

### Queries

| Hook | Key | Endpoint | Options |
|---|---|---|---|
| `useRecord(projectId, recordId)` | `QUERY_KEYS.record` | `GET …/record/<rid>/` | `staleTime` 5 min, `gcTime` 10 min, `retry` 2, `enabled` on both ids |
| `useMediaRecord(projectId, recordId)` | `QUERY_KEYS.mediaRecord` | `GET …/media_record/<rid>/` | same |
| `useMetadataMethods(projectId, recordId)` | `QUERY_KEYS.metadataMethods` | `GET …/additional_metadata/?class=methods` | `staleTime` **15 min**, `gcTime` 30 min |

### Mutations

| Hook | `mutate(vars)` | Notes |
|---|---|---|
| `useCreateRecord()` | `{ recordData, projectId, itemId }` | `onSettled` invalidates with `data.id` when the server returned one. |
| `useUpdateRecord()` | `{ recordData, projectId, recordId }` | `onSuccess` writes the response straight into the record cache before invalidating. |
| `useDeleteRecord()` | `{ projectId, recordId }` | `onSuccess` removes the record query entirely. |
| `useCreateMediaRecord()` | `{ file, projectId, itemId, metadata = null, skipFileValidation = false }` | See below. |
| `useUpdateMediaRecord()` | `{ recordData, projectId, recordId, recordType }` | Throws `ApiError(400)` if `recordType` missing or `validateMediaRecordData` fails — **before** any request. |
| `useDeleteMediaRecord()` | `{ projectId, recordId, recordType }` | `recordType` mandatory. |
| `useBatchDeleteRecords()` | `{ recordIds, projectId, isMediaRecords = false, recordType = null }` | See below. |

**`useCreateMediaRecord`** builds a `FormData` with the single file under key
`files` (accepting either a `File` or a one-element array). Optional `metadata`
appends `color`, `horizontal_resolution`, `vertical_resolution`, `duration` —
this is the manual-entry path used when the browser cannot probe the media.
`skipFileValidation: true` appends `skip_file_validation=true`, telling the
backend not to reject an unrecognised file type. `retry: false` — uploads are
never retried.

**`useBatchDeleteRecords`** fires all deletes with `Promise.allSettled` and
returns `{ successes, failures, total, partial?, error? }`. It throws only when
*every* delete failed; a partial failure returns normally with `partial: true`
and a Latvian summary in `error`. `onSettled` always invalidates the project.

### Utility hooks

| Hook | Returns |
|---|---|
| `useCachedRecord(projectId, recordId)` | The cached record object, or `undefined`. Reads the cache synchronously; does **not** subscribe, so it will not re-render on change. |
| `useInvalidateRecordQueries()` | `(projectId, recordId, itemId) => void` |
| `useRecordValidation()` | `{ validateRecord(recordData, recordType) }` — delegates to `validateMediaRecordData`, or returns valid when `recordType` is falsy. |
| `usePrefetchRecord()` | `(projectId, recordId) => void` — warms `QUERY_KEYS.record`. |

---

## 4.5 `useMetadata.js`

Metadata = the four sub-record classes attached to a Record.

**`mapMetadataTypeToClass(metadataType)`** translates the UI's plural keys to the
API's singular `class` parameter:

| UI key | API `class` |
|---|---|
| `actions` | `action` |
| `addressees` | `addressee` |
| `visas` | `visa` |
| `read_status` | `read_status` |

Unknown keys pass through unchanged.

| Hook | `mutate(vars)` | Endpoint |
|---|---|---|
| `useCreateMetadata()` | `{ projectId, recordId, metadataType, data }` | `POST …/additional_metadata/?class=<cls>` |
| `useUpdateMetadata()` | `{ projectId, recordId, metadataType, metadataId, data }` | `PUT …/additional_metadata/methods/?class=<cls>&id=<mid>` |
| `useDeleteMetadata()` | `{ projectId, recordId, metadataType, metadataId }` | `DELETE …/methods/?class=<cls>&id=<mid>` |

All three invalidate `project(pid)` and `record(pid, rid)` in `onSettled`.

> `useRecords.js` used to export metadata hooks too; a comment marks them as
> removed. These are the only ones.

---

## 4.6 `useFiles.js`

| Hook | `mutate(vars)` | Endpoint |
|---|---|---|
| `useUploadFiles()` | `{ projectId, recordId, files }` | `POST …/record/<rid>/multiple_files/` — every file appended under the repeated key `files` |
| `useDeleteFile()` | `{ projectId, fileId, recordId? }` | `DELETE /project/<pid>/file/<fid>/` |

`useUploadFiles` invalidates project + record + files keys; `useDeleteFile`
invalidates project, and record only when `recordId` was supplied.

---

## 4.7 `useInstitutions.js`

| Hook | `mutate(vars)` | Endpoint |
|---|---|---|
| `useAddInstitutionSigners()` | `{ projectId, institutionId, signersData }` | `PUT /project/<pid>/institution/<iid>/` |
| `useUpdateInstitutionSignerField()` | `{ projectId, institutionId, updatedData }` | same URL, but the body is narrowed to `creator`, `creator_position`, `signer`, `signer_position` |

Both invalidate `['project','detail',projectId]`.

---

## 4.8 `useBulkOperations.js`

Backs the multi-create, multi-edit and CSV/XLSX import popups. The file's header
comment explains the two design decisions:

1. **Sequential, never `Promise.all`.** The backend assigns
   `item.number = inventory.last_gv + 1` server-side, so parallel creates race
   for the same *glabāšanas vienība* number.
2. **Its own API calls, not `useCreateItem`/`useUpdateItem`.** Those carry
   optimistic updates keyed on a client-supplied `number` the server overwrites,
   and they invalidate the whole tree per call. A 30-item batch would trigger 30
   full-tree refetches.

### `useBulkRunner()`

**Returns** `{ state, run, stop, reset }`.

`state` shape:

```js
{
  status: 'idle' | 'running' | 'done',
  done: number,
  total: number,
  results: Array<{ label: string, ok: boolean, message?: string }>,
  stopped: boolean,
}
```

**`run(tasks, options?)`**

| Param | Type | Description |
|---|---|---|
| `tasks` | `Array<{ label, execute }>` | `execute` is an async thunk. |
| `options.append` | `boolean` | Keep the previous run's results and counters. The CSV import uses this: items → project refresh → records, shown as one progress bar. |
| `options.expectedTotal` | `number` | Display a known final total from the start, before later phases are queued. |

Runs tasks one at a time. **Never throws** — a failing task is recorded with
`ok: false` and the run continues. Checks `stopRef` before each task, so `stop()`
takes effect at the next boundary. Returns the final state object.

Progress is published through both `setState` *and* a `stateRef` mirror so an
`append` run can read the previous totals without waiting for a re-render.

**`extractMessage(error)`** (private) prefers the first entry of
`error.fieldErrors` over `error.message` — *"Šis lauks nedrīkst būt tukšs"* is
far more useful than *"API Error"*.

### `bulkApi`

A plain object of `apiClient` calls, deliberately hook-free so it can be used
inside task thunks:

`getProject(projectId)`, `updateItem(projectId, itemId, payload)`,
`createItem(projectId, inventoryId, payload)`,
`updateRecord(projectId, recordId, payload)`,
`createRecord(projectId, itemId, payload)`,
`uploadRecordFiles(projectId, recordId, files)`.

`getProject` exists specifically for the CSV import: the item-create response
carries `number` but not `id`, and a record needs its parent's `id`, so the
importer re-reads the project between phases.

### `useInvalidateAfterBulk()`

Returns `(projectId) => void`, invalidating both `QUERY_KEYS.project(projectId)`
and the literal `['project','detail',projectId]` — belt and braces, since the two
are the same key.

---

## 4.9 `useOpexProgress.js`

Drives the OPEX generation modal. Combines a WebSocket feed with a client-side
map of the project tree so raw file ids from the backend can be rendered as
"file X in record Y of item Z".

### `buildFileLookupMap(projectData, includeLongTerm)` (private)

Walks `institution.fond.inventories`, **skipping**:

- non-electronic inventories (`!inventory.electronic`), and
- when `includeLongTerm` is false, inventories whose
  `storage_term === 'Ilgstoši glabājamās lietas'`.

Record arrays are chosen by inventory type: `Foto → item.photo_records`,
`Skaņas → item.audio_records`, `Video → item.video_records`, everything else →
`item.records`.

Returns `{ [fileId]: { fileId, fileName, recordTitle, itemNumber, itemTitle, inventoryNumber, inventoryType } }`.

### Return value

| Field | Type | Description |
|---|---|---|
| `phase` | `'idle'\|'connecting'\|'exporting'\|'exported'\|'zipping'\|'done'\|'error'` | Lifecycle state. |
| `totalFiles` / `processedFiles` | `number` | `totalFiles` is computed locally from the tree, not reported by the backend. |
| `progressPercent` | `number` | `round(processed/total·100)`, capped at 100. |
| `currentFile` | file-info object \| `null` | |
| `failedFiles` | array | Files whose event had `status === 'copy_error'`. |
| `recentFiles` | array | Last 5, newest first. |
| `inventoryProgress` | `{ [invNumber]: { total, done, errors, type } }` | Per-inventory breakdown. |
| `messages` | array | Raw WS messages plus `_ts` (locale time string). **Capped at the last 500.** |
| `elapsedMs` | `number` | From `opex_export_started` to now (or to the end timestamp). |
| `estimatedRemainingMs` | `number\|null` | Rolling average of the last ≤15 file-event intervals × remaining count. `null` until 3 samples exist. |
| `zippingPercent` | `number` | 0–100 during the zip phase. |
| `zipFileName` | `string\|null` | Set from `data.file_name` on `opex_zipping_finished`. |
| `startExport(projectData, includeLongTerm = true)` | `fn` | See below. |
| `close()` | `fn` | Closes the socket, resets `phase` to `idle`. |

### `startExport` sequence

1. Build the lookup map and per-inventory totals; reset all state.
2. Bail with `phase: 'error'` if `projectData.id` is missing.
3. Open `ws://<hostname>:8000/ws/opex_progress/`.
4. **In `ws.onopen`**, fire `GET /api/v1/project/<pid>/export/opex_package/?long=<bool>`
   with a raw `fetch` (not `apiClient`) — the socket must be listening before the
   backend starts emitting.
5. Resolve the returned promise once the request has been dispatched. Progress
   continues to arrive through `onmessage` afterwards.

### WebSocket message protocol

| `msg_level` | `status` | Effect |
|---|---|---|
| `file` | any | Look up `data.file`, set `currentFile`, increment `processedFiles`, push to `recentFiles`, bump the inventory counter. |
| `file` | `copy_error` | Additionally push to `failedFiles` and increment that inventory's `errors`. |
| `opex_zipping_progress` | numeric percentage | `zippingPercent = round(status)`. |
| `project` | `opex_export_started` | `phase='exporting'`, stamp `startTime`. |
| `project` | `opex_export_finished` | `phase='exported'`. |
| `project` | `opex_zipping_started` | `phase='zipping'`, `zippingPercent=0`. |
| `project` | `opex_zipping_finished` | `phase='done'`, stamp `endTime`, `zippingPercent=100`, capture `file_name`. |
| `project` | `opex_zipping_failed` | `phase='error'`, stamp `endTime`. |
| `project` | `opex_folder_deleted`, `deleting_opex_folder_failed` | Logged only. |

---

## 4.10 `useFormErrors.js`

Client-side form error state. The other half of the
[`parseApiError`](03-api-layer.md#services-errorservicejs) contract.

```js
const { generalError, getFieldError, setApiErrors, clearErrors } = useFormErrors();
```

| Export | Type | Description |
|---|---|---|
| `generalError` | `string\|null` | Banner-level message. |
| `fieldErrors` | `Object<string,string>` | Field name → message. |
| `setApiErrors(errorData)` | `fn` | Runs `parseApiError` and populates both. Pass the raw response body or an `ApiError`'s `.data`. |
| `setGeneralError(msg)` | setter | |
| `setFieldError(field, msg)` | `fn` | Merges one field. |
| `setFieldErrors(obj)` | setter | Replaces the whole map. |
| `clearErrors()` | `fn` | Resets both. |
| `clearFieldError(field)` | `fn` | Deletes one key. |
| `getFieldError(field)` | `fn` | `string\|null`. Memoised on `fieldErrors`. |
| `hasErrors` | `boolean` | Truthy if either is populated. Note: it is the raw `generalError \|\| count` expression, so it can be a *string*, not a strict boolean. |

Pair with `<GeneralAlert>` and `<FieldError>` from
[components/ErrorDisplay.js](../src/components/ErrorDisplay.js).

---

## 4.11 UI / infrastructure hooks

### `useTheme()`

Reads `settings.theme` (`'light' | 'dark' | 'auto'`) from `SettingsContext` and
writes `data-theme="dark"` onto `<html>` — the attribute every dark-mode rule in
[styles/theme.css](../src/styles/theme.css) keys off.

- `'auto'` follows `window.matchMedia('(prefers-color-scheme: dark)')` and
  subscribes to changes for as long as the setting stays `'auto'`.
- Light mode sets **no attribute** (the default `:root` palette is light).

**Returns** `{ theme, activeTheme, isDark }` where `theme` is the raw setting and
`activeTheme` is the resolved `'light' | 'dark'`.

### `useAppSettings()`

Applies non-colour display preferences to `<html>`:

- `font-size-small` / `font-size-medium` / `font-size-large` class (mutually
  exclusive; the other two are removed first).
- `compact-view` class toggled from `settings.compactView`.

**Returns** `{ fontSize, compactView, showBreadcrumbs }`. `showBreadcrumbs` is
passed through for Navigation components to read; this hook does not act on it.

Both `useTheme` and `useAppSettings` are called once, in
[Workspace.js](../src/Workspace/Workspace.js).

### `useScrollDirection(threshold = 100)`

**Returns** `{ scrollDirection: 'up'|'down', isScrolled: boolean }`.

- Listens on `window` `scroll` with `{ passive: true }`, throttled through
  `requestAnimationFrame`.
- `isScrolled` flips once `pageYOffset > threshold`.
- Direction only changes when scrolled past the threshold **and** the delta
  exceeds 5 px — a deadband against jitter. Below the threshold the direction is
  forced back to `'up'`.
- Mirrors state in refs so the rAF callback never reads stale closures.

Used by the sticky `ProjectNavigation` bar.

### `usePerformance(componentName)`

Wraps the singleton in [Utils/PerformanceMonitor.js](../src/Utils/PerformanceMonitor.js).

- On mount it starts a `"<componentName> - Mount"` measurement and ends it on
  unmount — so the recorded duration is really the component's *lifetime*, not
  its mount cost.
- `measureFunction(fn, operationName)` → wrapped function that times each call
  and correctly awaits promise results via `.finally`, ending the measurement
  even when the function throws.
- `startMeasure(operationName)` / `endMeasure(operationName)` for manual spans.
- `getStats` / `logAllStats` are bound passthroughs to the monitor.
