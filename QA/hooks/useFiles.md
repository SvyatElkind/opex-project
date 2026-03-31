# QA Report: useFiles.js
> Path: `src/hooks/useFiles.js` | Last audit: 2026-03-24

## Purpose

Provides hooks for file upload and deletion on textual/electronic document records. Files are the lowest level of the data hierarchy, attached to records in inventories that support file uploads (Electronic Documents and Electronic Media categories). Used by `RecordFiles.js` for managing files attached to records.

## Hooks Exported

### `useUploadFiles()`
- **What:** Uploads multiple files to a textual record via multipart FormData.
- **Mutation parameters:** `{ projectId, recordId, files }` where `files` is an array of `File` objects.
- **Endpoint:** `POST /project/{projectId}/record/{recordId}/multiple_files/`
- **Implementation:** Creates a `FormData` object and appends each file with the key `'files'` (same key for all files). Uses `postFormData()` from `apiClient` which sets a 5-minute upload timeout.
- **On settled:** Invalidates three query keys (always, regardless of success/failure):
  - `QUERY_KEYS.project(projectId)` -- refresh project tree to update file counts
  - `QUERY_KEYS.record(projectId, recordId)` -- refresh the parent record
  - `QUERY_KEYS.files(projectId, recordId)` -- refresh the files list

### `useDeleteFile()`
- **What:** Deletes a single file by its ID.
- **Mutation parameters:** `{ projectId, fileId, recordId }`.
- **Endpoint:** `DELETE /project/{projectId}/file/{fileId}/`
- **Note:** `recordId` is NOT used in the API call itself -- it is only used for cache invalidation.
- **On settled:** Invalidates (always, regardless of success/failure):
  - `QUERY_KEYS.project(projectId)` -- always
  - `QUERY_KEYS.record(projectId, recordId)` -- only if `recordId` is provided in the variables

## Error Handling

Both hooks use `onSettled` for cache invalidation. This is the correct pattern for file operations because:
1. Even on failure, partial state changes may have occurred on the server (e.g., some files uploaded before an error).
2. The UI should always reflect the latest server state after any file operation attempt.

No client-side validation is performed in these hooks. File validation (type checking, size limits, image dimensions, media duration) is handled upstream by `FileValidation.js` and `RecordValidation.js` before the hooks are called.

**Error propagation:** Errors from `apiClient` propagate to the caller via React Query's standard mechanism. The hooks do not catch, transform, or log errors.

## Cache Strategy

**Query keys used (from centralized `QUERY_KEYS` in `Constants/Constants.js`):**
- `QUERY_KEYS.project(projectId)` -- `['project', 'detail', projectId]`
- `QUERY_KEYS.record(projectId, recordId)` -- `['record', projectId, recordId]`
- `QUERY_KEYS.files(projectId, recordId)` -- `['files', projectId, recordId]`

**Good practice:** This file uses the centralized `QUERY_KEYS` from `Constants/Constants.js` and the object-syntax `{ queryKey: ... }` for invalidation, which is the correct React Query v5 pattern. This contrasts favorably with `useItems.js` and `useInventories.js` which hardcode their keys.

**Invalidation pattern:** Uses `onSettled` (always runs) for all invalidations. No optimistic updates -- file operations wait for server confirmation.

**Note on `QUERY_KEYS.files`:** The `useUploadFiles` hook invalidates `QUERY_KEYS.files(projectId, recordId)`, but there does not appear to be a corresponding `useQuery` that reads from this key elsewhere in the hooks layer. The invalidation is harmless but has no effect unless a component elsewhere sets up a query with this key.

## Known Limitations

1. **No upload progress tracking** -- There is no mechanism to report upload progress to the UI. For large multi-file uploads, users have no feedback beyond a loading state. `fetch()` does not support progress events; `XMLHttpRequest` would be needed.
2. **No file replacement** -- Only upload and delete operations. To replace a file, the caller must delete the old file and then re-upload, which is two separate operations with no atomicity guarantee.
3. **No batch file deletion** -- Unlike `useRecords.js` which has `useBatchDeleteRecords`, there is no batch file deletion hook. Users must delete files one at a time.
4. **Optional `recordId` in delete** -- `useDeleteFile` accepts `recordId` in the mutation variables but uses it only conditionally for cache invalidation. If `recordId` is omitted, the record query is not invalidated, potentially leaving stale file counts in the record detail view.
5. **No read hook** -- There is no `useFiles()` query hook for fetching a record's file list independently. File data is accessed through the parent record query returned by `useRecord()`.
6. **Phantom files invalidation** -- `useUploadFiles` invalidates `QUERY_KEYS.files(...)` but no query appears to use this key, making this invalidation a no-op.
7. **No file size or count limits** -- The hooks accept any number of files of any size. The only limit is the 5-minute upload timeout from `apiClient`.

## Quality Score: 7/10

Clean, focused implementation with correct React Query v5 patterns. Uses centralized `QUERY_KEYS` (unlike several other hook files). Proper `onSettled` usage ensures cache consistency even on failures. Deductions for: no upload progress tracking, no batch operations, phantom files invalidation, and the optional `recordId` ambiguity. The file is appropriately small (62 lines) for its scope.
