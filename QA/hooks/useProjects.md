# QA Report: useProjects.js
> Path: `src/hooks/useProjects.js` | Last audit: 2026-03-24

## Purpose

Provides hooks for project-level operations including CRUD, VVAIS report upload, and export functionality (inventory list, acceptance report, OPEX package generation). Used by `Workspace.js`, `Project.js`, `ProjectDetails.js`, `UploadPopup.js`, and export-related UI components.

## Hooks Exported

### `useProjects()`
- **What:** Fetches the list of all projects.
- **Parameters:** None.
- **Returns:** React Query result with `data` as an array of projects (falls back to `[]` if API returns falsy).
- **Endpoint:** `GET /project/`
- **Options:** `staleTime: 30s`.

### `useProject(projectId)`
- **What:** Fetches a single project with its full nested hierarchy (institution, fond, inventories, items, records, files).
- **Parameters:** `projectId` (string/number).
- **Returns:** React Query result. Returns `null` if `projectId` is falsy.
- **Endpoint:** `GET /project/{projectId}/`
- **Options:** `enabled: !!projectId`.
- **Custom retry logic:** Does not retry if the error message includes the Latvian string `"Nav importeta VVAIS atskaite"` (expected state when no report has been uploaded -- not an error). Otherwise retries once (`failureCount < 2`).

### `useCreateProject()`
- **What:** Creates a new project.
- **Mutation parameters:** `projectData` (object).
- **Endpoint:** `POST /project/`
- **On success:** Invalidates the projects list query.

### `useRenameProject()`
- **What:** Renames an existing project.
- **Mutation parameters:** `{ projectId, newName }`.
- **Endpoint:** `PUT /project/{projectId}/` with body `{ name: newName }`.
- **On success:** Invalidates both the projects list and the specific project detail.

### `useDeleteProject()`
- **What:** Deletes a project.
- **Mutation parameters:** `projectId` (scalar, not wrapped in object).
- **Endpoint:** `DELETE /project/{projectId}/`
- **On success:** Removes project from cache via `removeQueries`, then invalidates projects list.

### `useUploadReport()`
- **What:** Uploads a VVAIS report file (typically `.xlsx`) to populate a project's structure.
- **Mutation parameters:** `{ projectId, file }`.
- **Endpoint:** `POST /project/{projectId}/add_report/` with binary body.
- **Implementation:** Reads file as `ArrayBuffer` via `FileReader.readAsArrayBuffer()`. Sends with `Content-Type: application/octet-stream` and `Content-Disposition: attachment; filename="{name}"` headers.
- **Client-side guard:** Rejects files larger than 50 MB with a Latvian error message before reading.
- **On success:** Invalidates project detail query.

### `useExportInventoryList()`
- **What:** Downloads the inventory list document.
- **Mutation parameters:** `projectId`.
- **Endpoint:** `GET /project/{projectId}/export/inventories/` (via `downloadFile` helper).
- **Returns:** `{ success: true }` on completion.
- **Guard:** Throws if `projectId` is falsy.

### `useExportAcceptanceReport()`
- **What:** Downloads the acceptance report document.
- **Mutation parameters:** `{ projectId, electronic = true }`.
- **Endpoint:** `GET /project/{projectId}/export/acceptance_report/?electronic={electronic}` (via `downloadFile`).
- **Returns:** `{ success: true }` on completion.

### `useExportOpex()`
- **What:** Triggers OPEX package generation on the server.
- **Mutation parameters:** `{ projectId, includeLongTerm = false }`.
- **Endpoint:** `GET /project/{projectId}/export/opex_package/?long={includeLongTerm}`
- **Concurrency guard:** Uses a `pendingRef` object (`{ current: false }`) to prevent concurrent OPEX generation requests. Returns `{ alreadyRunning: true }` if a request is already in-flight. The flag is reset in a `finally` block.
- **Returns:** `{ started: true }` on success.

## Error Handling

- **useProject:** Smart retry logic that distinguishes between "no report imported" (expected, no retry -- checks for Latvian string `"Nav importeta VVAIS atskaite"`) and other errors (retry once). This prevents unnecessary retries for an expected application state.
- **useUploadReport:** Client-side 50 MB file size check throws a descriptive Latvian error before attempting upload. Uses `FileReader.onerror` handler that rejects with a generic English error.
- **useExportOpex:** Concurrency guard via `pendingRef` with `finally` block for cleanup. Re-throws errors after resetting the flag.
- **Export hooks:** Throw generic `Error` (not `ApiError`) for missing `projectId`.
- **All others:** Errors propagate to caller via React Query's standard error handling.

## Cache Strategy

**Local query key factory:**
```javascript
projectKeys = {
  all: ['projects'],
  lists: () => ['projects', 'list'],
  list: (filters) => ['projects', 'list', { filters }],
  details: () => ['projects', 'detail'],
  detail: (id) => ['projects', 'detail', id],
}
```

**CRITICAL: Query key mismatch.** This local `projectKeys` factory produces detail keys like `['projects', 'detail', id]` (note plural `'projects'`), while other hooks (`useItems.js`, `useInventories.js`, `useInstitutions.js`) use `['project', 'detail', id]` (singular `'project'`). This means:
- When `useItems.js` invalidates `['project', 'detail', projectId]` after creating/updating/deleting an item, it does NOT invalidate the cache entry that `useProject()` reads from (`['projects', 'detail', projectId]`).
- Conversely, when `useProjects.js` invalidates its own detail key, item/inventory hooks are not affected.
- This mismatch could cause stale data after cross-hook mutations.

**Invalidation patterns:**
- `useCreateProject`: Invalidates projects list.
- `useRenameProject`: Invalidates both projects list and specific project detail.
- `useDeleteProject`: Removes project from cache, invalidates projects list.
- `useUploadReport`: Invalidates specific project detail.
- `useExportInventoryList/AcceptanceReport/Opex`: No cache invalidation.

## Known Limitations

1. **Query key mismatch** (HIGH) -- `['projects', 'detail', id]` vs `['project', 'detail', id]` in other hooks. Cross-hook mutations may not refresh the project view. This is the most critical issue across the hooks layer.
2. **`invalidateQueries` v4 syntax** -- Uses `invalidateQueries(projectKeys.lists())` (array argument) instead of the v5 object syntax `invalidateQueries({ queryKey: ... })`. Forward-compatibility risk.
3. **`useUploadReport` memory pressure** -- Reads entire file as `ArrayBuffer` before sending. For files near 50 MB, this doubles memory usage. A streaming approach (FormData or ReadableStream) would be more efficient.
4. **`useExportOpex` concurrency guard fragility** -- `pendingRef` is a plain object (`{ current: false }`), not a React `useRef`. Since the hook creates a new `pendingRef` object each time the parent component re-renders, the guard only works if the returned mutation object is stable (which React Query provides). However, if the hook is called in multiple components, each gets its own guard -- there is no global lock.
5. **`useExportOpex` uses GET for a side-effecting operation** -- Generating an OPEX package is a command (side effect), but it uses `get()` which maps to HTTP GET. This violates REST semantics and could be cached by intermediaries.
6. **Retry logic uses hardcoded Latvian string** -- `"Nav importeta VVAIS atskaite"` is matched with `error?.message?.includes(...)`. This is brittle; if the server changes the message text, the retry logic breaks. Error codes would be more reliable.
7. **No optimistic updates** for any project-level operation.

## Quality Score: 6/10

Good coverage of project operations including exports. Smart retry logic for missing reports is a thoughtful UX touch. The local `projectKeys` factory is well-organized. Deductions for: the critical query key mismatch with other hooks, v4 API syntax, memory-intensive report upload, fragile concurrency guard, and REST semantic violation in OPEX export.
