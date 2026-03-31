# QA Report: useMetadata.js
> Path: `src/hooks/useMetadata.js` | Last audit: 2026-03-24

## Purpose

Provides hooks for CRUD operations on additional record metadata. The four metadata types are:
- **Actions** (action) -- actions taken on a document
- **Addressees** (addressee) -- recipients of a document
- **Visas** (visa) -- approval/visa stamps
- **Read status** (read_status) -- document read tracking

These metadata types are only available for **Document** and **Electronic Document** category records (textual inventories with `supportsAdditionalMetadata: true` in `InheritanceUtils.js`). Used by `RecordMetadata.js`.

## Hooks Exported

### `useCreateMetadata()`
- **What:** Creates a new metadata entry on a record.
- **Mutation parameters:** `{ projectId, recordId, metadataType, data }`.
- **Endpoint:** `POST /project/{projectId}/record/{recordId}/additional_metadata/?class={apiClass}`
- **Type mapping:** The `metadataType` parameter (plural, UI-facing) is mapped to the API's singular class name via `mapMetadataTypeToClass`:
  - `'actions'` -> `'action'`
  - `'addressees'` -> `'addressee'`
  - `'visas'` -> `'visa'`
  - `'read_status'` -> `'read_status'` (unchanged)
  - Any other string is passed through unchanged.
- **On settled:** Invalidates project query and record query.

### `useUpdateMetadata()`
- **What:** Updates an existing metadata entry by ID.
- **Mutation parameters:** `{ projectId, recordId, metadataType, metadataId, data }`.
- **Endpoint:** `PUT /project/{projectId}/record/{recordId}/additional_metadata/methods/?class={apiClass}&id={metadataId}`
- **On settled:** Invalidates project query and record query.

### `useDeleteMetadata()`
- **What:** Deletes a metadata entry by ID.
- **Mutation parameters:** `{ projectId, recordId, metadataType, metadataId }`.
- **Endpoint:** `DELETE /project/{projectId}/record/{recordId}/additional_metadata/methods/?class={apiClass}&id={metadataId}`
- **On settled:** Invalidates project query and record query.

## Internal Helpers

### `mapMetadataTypeToClass(metadataType)`
Maps plural UI-facing metadata type names to singular API class parameters:

| Input (UI) | Output (API) |
|------------|-------------|
| `'actions'` | `'action'` |
| `'addressees'` | `'addressee'` |
| `'visas'` | `'visa'` |
| `'read_status'` | `'read_status'` |
| (anything else) | (passed through unchanged) |

### `invalidateMetadataQueries(queryClient, projectId, recordId)`
Helper that invalidates both:
- `QUERY_KEYS.project(projectId)` -- refreshes the full project tree
- `QUERY_KEYS.record(projectId, recordId)` -- refreshes the specific record

## Error Handling

All three hooks use `onSettled` for cache invalidation, ensuring queries are refreshed regardless of mutation outcome. This is the correct defensive pattern -- even if the mutation fails, the cache is refreshed to stay in sync with the server.

No client-side validation is performed. Invalid metadata types or missing IDs will be caught by the server, and the resulting `ApiError` will propagate to the caller via React Query's error mechanism.

**Error propagation:** Errors from `apiClient` (specifically `post`, `put`, `del`) propagate as `ApiError` instances to the caller. The hooks do not catch, transform, or log errors.

## Cache Strategy

**Query keys used (from centralized `QUERY_KEYS` in `Constants/Constants.js`):**
- `QUERY_KEYS.project(projectId)` -- `['project', 'detail', projectId]`
- `QUERY_KEYS.record(projectId, recordId)` -- `['record', projectId, recordId]`

**Good practice:** Uses centralized `QUERY_KEYS` (unlike `useItems.js` and `useInventories.js`) and object-syntax `{ queryKey: ... }` (correct React Query v5 pattern).

**Invalidation pattern:** Consistent `onSettled` across all three hooks. No optimistic updates -- metadata changes wait for server confirmation. This is reasonable given that metadata entries have server-generated IDs and the latency for metadata operations is typically low.

## Known Limitations

1. **CRITICAL: Duplicate hooks with useRecords.js** -- `useRecords.js` also exports `useAddMetadata`, `useUpdateMetadata`, and `useDeleteMetadata` hooks that operate on the same endpoints. The two implementations differ:
   - **Parameter naming:** This file uses `metadataType` (plural, mapped via helper); `useRecords.js` uses `metadataClass` (singular, passed directly).
   - **Invalidation timing:** This file uses `onSettled` (always); `useRecords.js` uses `onSuccess` (only on success).
   - **Validation:** `useRecords.js` throws `ApiError(400)` for missing parameters; this file does not validate.
   - **Which should components use?** This ambiguity could lead to inconsistent behavior if different components import from different files. A canonical location should be chosen and the other removed.

2. **No read hook** -- There is no `useMetadata()` query hook. Metadata is read as part of the record data from `useRecord()` in `useRecords.js`. This means metadata cannot be fetched independently or with its own cache timing.

3. **Passthrough for unknown types** -- `mapMetadataTypeToClass` silently passes through unknown type strings. If a typo is made (e.g., `'adressees'` instead of `'addressees'`), the API call will use the typo as the class parameter and likely fail with a confusing server error.

4. **`data` parameter naming shadow** -- The mutation parameter is named `data`, which shadows the destructured response variable. The code handles this correctly with `data: responseData` aliasing, but the naming is confusing for maintainers.

5. **No batch operations** -- Cannot create or delete multiple metadata entries at once. Each entry requires a separate API call.

6. **No metadata type validation** -- The hooks do not check if the `metadataType` is one of the four valid types before making the API call. Invalid types are sent to the server, wasting a round-trip.

## Quality Score: 6/10

Clean, consistent implementation with proper `onSettled` pattern, centralized `QUERY_KEYS`, and correct React Query v5 syntax. The `mapMetadataTypeToClass` helper is a useful abstraction. Deductions for: the critical duplication with `useRecords.js` (the most significant issue -- this should be resolved by choosing one canonical location), no read hook, no input validation, silent passthrough of unknown types, and no batch operations. The 92-line file size is appropriate for its scope but the overlap with `useRecords.js` questions whether this file should exist independently.
