# QA Report: useRecords.js
> Path: `src/hooks/useRecords.js` | Last audit: 2026-03-24

## Purpose

Comprehensive hook module for all record and media record operations, including metadata CRUD, batch deletion, caching utilities, prefetching, and client-side validation. Used by `Record.js`, `CreateDocumentRecord.js`, `CreateMediaRecord.js`, `EditDocumentRecord.js`, `EditMediaRecordMetadata.js`, `RecordDeletePopup.js`, `RecordMetadata.js`, and `RecordFiles.js`.

This is the largest hook file in the project (543 lines, 18 exports).

## Hooks Exported

### `useRecord(projectId, recordId)`
- **What:** Fetches a single standard record with metadata.
- **Parameters:** `projectId` (string/number), `recordId` (string/number).
- **Returns:** React Query result (`data`, `isLoading`, `error`, etc.).
- **Endpoint:** `GET /project/{projectId}/record/{recordId}/`
- **Options:** `staleTime: 5min`, `gcTime: 10min`, `retry: 2`, `enabled: !!projectId && !!recordId`.

### `useCreateRecord()`
- **What:** Creates a new standard (textual/document) record.
- **Mutation parameters:** `{ recordData, projectId, itemId }`.
- **Returns:** Mutation result.
- **Endpoint:** `POST /project/{projectId}/record/?item_id={itemId}`
- **On success:** Invalidates project, record, media record, and metadata queries for the item.

### `useUpdateRecord()`
- **What:** Updates a standard record.
- **Mutation parameters:** `{ recordData, projectId, recordId }`.
- **Returns:** Mutation result.
- **Endpoint:** `PUT /project/{projectId}/record/{recordId}/`
- **On success:** Sets query data directly for the record via `setQueryData`, then invalidates related queries.

### `useDeleteRecord()`
- **What:** Deletes a standard record.
- **Mutation parameters:** `{ projectId, recordId }`.
- **Returns:** Mutation result.
- **Endpoint:** `DELETE /project/{projectId}/record/{recordId}/`
- **On success:** Removes the record from query cache via `removeQueries`, then invalidates related queries.

### `useMediaRecord(projectId, recordId)`
- **What:** Fetches a single media record.
- **Parameters:** `projectId`, `recordId`.
- **Returns:** React Query result.
- **Endpoint:** `GET /project/{projectId}/media_record/{recordId}/`
- **Options:** `staleTime: 5min`, `gcTime: 10min`, `retry: 2`.

### `useCreateMediaRecord()`
- **What:** Creates a media record by uploading a file via FormData. Supports optional metadata fields and a `skipFileValidation` flag for manual entry when file type is not recognized.
- **Mutation parameters:** `{ file, projectId, itemId, metadata?, skipFileValidation? }`.
- **Returns:** Mutation result.
- **Endpoint:** `POST /project/{projectId}/media_record/?item_id={itemId}` (multipart FormData via `apiRequest`)
- **Note:** `retry: false` -- file uploads are not retried. If `file` is an array, only the first element is used. Metadata fields (`color`, `horizontal_resolution`, `vertical_resolution`, `duration`) are appended individually to FormData if provided.
- **On success:** Invalidates related queries.

### `useUpdateMediaRecord()`
- **What:** Updates a media record. Requires `recordType` (Foto/Video/Audio). Performs client-side validation via `validateMediaRecordData` before sending.
- **Mutation parameters:** `{ recordData, projectId, recordId, recordType }`.
- **Returns:** Mutation result.
- **Endpoint:** `PUT /project/{projectId}/media_record/{recordId}/?type={recordType}`
- **Validation rules:**
  - Foto: color must be "color" or "grayscale"; resolutions must be integers
  - Video: color must be "color" or "grayscale"; duration must match `HH:MM:SS`; resolutions must be integers
  - Audio: duration must match `HH:MM:SS`
- **On success:** Sets query data directly, then invalidates.

### `useDeleteMediaRecord()`
- **What:** Deletes a media record. Requires `recordType`.
- **Mutation parameters:** `{ projectId, recordId, recordType }`.
- **Returns:** Mutation result.
- **Endpoint:** `DELETE /project/{projectId}/media_record/{recordId}/?type={recordType}`
- **On success:** Removes from cache, invalidates.

### `useMetadataMethods(projectId, recordId)`
- **What:** Fetches available metadata methods for a record.
- **Parameters:** `projectId`, `recordId`.
- **Returns:** React Query result.
- **Endpoint:** `GET /project/{projectId}/record/{recordId}/additional_metadata/?class=methods`
- **Options:** `staleTime: 15min`, `gcTime: 30min` (metadata methods rarely change), `retry: 2`.

### `useAddMetadata()`
- **What:** Adds metadata to a record. Throws `ApiError(400)` if `metadataClass` is missing.
- **Mutation parameters:** `{ projectId, recordId, metadataClass, metadataData }`.
- **Endpoint:** `POST /project/{projectId}/record/{recordId}/additional_metadata/?class={metadataClass}`
- **On success:** Invalidates record and metadata queries.

### `useUpdateMetadata()`
- **What:** Updates existing metadata. Throws `ApiError(400)` if `metadataClass` or `metadataId` is missing.
- **Mutation parameters:** `{ projectId, recordId, metadataClass, metadataId, metadataData }`.
- **Endpoint:** `PUT /project/{projectId}/record/{recordId}/additional_metadata/methods/?class={metadataClass}&id={metadataId}`
- **On success:** Invalidates record and metadata queries.

### `useDeleteMetadata()`
- **What:** Deletes metadata. Throws `ApiError(400)` if `metadataClass` or `metadataId` is missing.
- **Mutation parameters:** `{ projectId, recordId, metadataClass, metadataId }`.
- **Endpoint:** `DELETE /project/{projectId}/record/{recordId}/additional_metadata/methods/?class={metadataClass}&id={metadataId}`
- **On success:** Invalidates record and metadata queries.

### `useBatchDeleteRecords()`
- **What:** Deletes multiple records at once using `Promise.allSettled`. Reports partial failures with Latvian messages.
- **Mutation parameters:** `{ recordIds, projectId, isMediaRecords?, recordType? }`.
- **Returns:** `{ successes, failures, total, partial?, error? }`.
- **Error handling:** If all fail, throws `ApiError(500, "Neizdevas dzest N ierakstus")`. If partial, returns result with `partial: true` and error message.
- **On settled:** Always invalidates project query (even on partial failure). Does NOT invalidate item-level queries.

### `useCachedRecord(projectId, recordId)`
- **What:** Returns cached record data synchronously from query cache without triggering a fetch.
- **Returns:** Cached data or `undefined`. This is a snapshot, not reactive.

### `useInvalidateRecordQueries()`
- **What:** Returns a function to manually invalidate record-related queries.
- **Returns:** `(projectId, recordId, itemId) => void`.

### `useRecordOperationsStatus()`
- **What:** Checks if any record/media/file mutation is currently in-flight by filtering mutations with `mutationKey` containing 'record', 'media', or 'file'.
- **Returns:** `{ isLoading: boolean, operationsCount: number }`.

### `useRecordValidation()`
- **What:** Returns a client-side validation function for media record data.
- **Returns:** `{ validateRecord: (recordData, recordType) => { isValid: boolean, errors: string[] } }`.

### `usePrefetchRecord()`
- **What:** Returns a function to prefetch a record into the query cache.
- **Returns:** `(projectId, recordId) => void`.

## Error Handling

- **Create/Update/Delete standard records:** Errors propagate to the caller. The `apiClient` wraps errors as `ApiError` with parsed field errors.
- **Media record mutations:** Throw `ApiError(400)` for missing `recordType` or failed client-side validation before making the API call. `useCreateMediaRecord` also throws for missing file.
- **Batch delete:** Uses `Promise.allSettled` for graceful partial failure handling. Returns success/failure counts.
- **Metadata mutations:** Throw `ApiError(400)` for missing required parameters (`metadataClass`, `metadataId`).
- **Note:** `ApiError` is reused for client-side validation errors, conflating client and server errors.

## Cache Strategy

**Query keys used (from `QUERY_KEYS` in Constants):**
- `QUERY_KEYS.record(projectId, recordId)` -- single record
- `QUERY_KEYS.mediaRecord(projectId, recordId)` -- single media record
- `QUERY_KEYS.records(projectId, itemId)` -- records list for an item
- `QUERY_KEYS.mediaRecords(projectId, itemId)` -- media records list for an item
- `QUERY_KEYS.metadata(projectId, recordId)` -- record metadata
- `QUERY_KEYS.metadataMethods(projectId, recordId)` -- metadata methods
- `QUERY_KEYS.project(projectId)` -- parent project (invalidated on all mutations)

**Invalidation pattern:** The helper `invalidateRelatedQueries()` invalidates the project, specific record, media record, item records list, and metadata queries after every mutation.

**Direct cache updates:** `useUpdateRecord` and `useUpdateMediaRecord` use `setQueryData` to immediately update the cache with the server response, then invalidate for background revalidation.

**Cache removal:** `useDeleteRecord` and `useDeleteMediaRecord` call `removeQueries` to clear the deleted record from cache before invalidation.

## Known Limitations

1. **`useRecordOperationsStatus` is unreliable** -- It filters by `mutationKey` but no mutations in this file set an explicit `mutationKey`. The predicate `mutation.options.mutationKey?.includes(...)` will always return false, so `isMutating` will always be 0.
2. **No optimistic updates** for record creation or deletion (unlike `useItems.js` which has full optimistic update support).
3. **`useBatchDeleteRecords` incomplete invalidation** -- Does not pass `itemId` to `invalidateRelatedQueries` in `onSettled`, so item-level record lists are not directly invalidated after batch delete.
4. **`validateMediaRecordData` only validates Foto, Video, and Audio** -- Any other type string causes a validation failure with "Unknown record type".
5. **Duplicate metadata hooks** -- `useAddMetadata`, `useUpdateMetadata`, and `useDeleteMetadata` here overlap with the hooks in `useMetadata.js`, with different parameter naming and invalidation patterns (this file uses `onSuccess`, `useMetadata.js` uses `onSettled`).
6. **Media record creation file handling** -- Accepts either a single `File` or an array (takes first element), but this is not documented in the function signature.
7. **Default export** at line 524 re-lists all hooks in an object, which is redundant with named exports and prevents tree-shaking.

## Quality Score: 7/10

Solid, comprehensive coverage of all record and media record operations with good use of centralized query keys, cache-direct updates, and a helper for consistent invalidation. Deductions for: unreliable `useRecordOperationsStatus`, missing optimistic updates, duplicate metadata hooks with `useMetadata.js`, and incomplete batch delete invalidation.
