# QA Report: useInventories.js
> Path: `src/hooks/useInventories.js` | Last audit: 2026-03-24

## Purpose

Provides hooks for inventory CRUD operations. Inventories are the classification level that determines the category (Documents, Electronic Documents, Electronic Media, Media) via the combination of `type` and `electronic` flag, controlling all downstream behavior for items and records. Used by `Inventories.js`, `InventoryCreate.js`, `InventoryEdit.js`, and `InventoryItem.js`.

## Hooks Exported

### `useCreateInventory()`
- **What:** Creates a new inventory within a fond.
- **Mutation parameters:** `{ projectId, fondId, inventoryData }`.
- **Endpoint:** `POST /project/{projectId}/inventory/?fond_id={fondId}`
- **On success:** Invalidates project detail query.
- **Note:** No optimistic update -- the user waits for the server response before seeing the new inventory. No JSDoc comment (unlike the other two hooks).

### `useUpdateInventory()`
- **What:** Updates an existing inventory with optimistic updates and snapshot-based rollback.
- **Mutation parameters:** `{ projectId, inventoryId, inventoryData }`.
- **Endpoint:** `PUT /project/{projectId}/inventory/{inventoryId}/`
- **Optimistic update flow:**
  1. `onMutate`: Cancels outgoing refetches via `cancelQueries`. Snapshots project data. Merges `inventoryData` into the matching inventory while **explicitly preserving `id` and `number` fields** to prevent accidental overwrites.
  2. `onError`: Rolls back to snapshot.
  3. `onSuccess`: Invalidates project detail query for revalidation.
- **Guard:** Early return if `old?.institution?.fond?.inventories` is falsy (handles missing data gracefully).

### `useDeleteInventory()`
- **What:** Deletes an inventory.
- **Mutation parameters:** `{ projectId, inventoryId }`.
- **Endpoint:** `DELETE /project/{projectId}/inventory/{inventoryId}/`
- **On settled:** Invalidates project detail query. Uses `onSettled` (runs regardless of success or failure), which is a good defensive pattern.
- **Note:** No optimistic update for deletion -- the inventory remains visible until the server confirms.

## Error Handling

- **useUpdateInventory:** Full rollback via `onError` -- restores the pre-mutation project data snapshot.
- **useCreateInventory:** No error handler; errors propagate to the caller via React Query's standard mechanism.
- **useDeleteInventory:** Uses `onSettled` for cache invalidation, ensuring the project query is refreshed even if the deletion fails. This prevents the UI from getting stuck in a stale state.

## Cache Strategy

**Query key used:** `['project', 'detail', variables.projectId]` -- hardcoded, NOT using centralized `QUERY_KEYS`.

**Invalidation pattern:**
- Create: `onSuccess` invalidation only.
- Update: `onSuccess` invalidation after optimistic update.
- Delete: `onSettled` invalidation (always, regardless of outcome).

**Optimistic updates:** Only implemented for `useUpdateInventory`. The update preserves the inventory's `id` and `number` fields to prevent them from being accidentally overwritten by the `inventoryData` payload. All other fields are merged from `inventoryData`.

## Known Limitations

1. **Inconsistent optimistic update coverage** -- Only update has optimistic updates. Create and delete do not, meaning users must wait for server round-trips for those operations. This is inconsistent with `useItems.js` which implements optimistic updates for all three operations.
2. **Hardcoded query keys** -- Uses `['project', 'detail', variables.projectId]` instead of `QUERY_KEYS.project(projectId)`. Same issue as `useItems.js`.
3. **`cancelQueries` v4 syntax** -- Uses `cancelQueries(['project', 'detail', variables.projectId])` instead of the v5 object syntax.
4. **No client-side validation** -- Unlike `useRecords.js`, there is no validation before sending inventory data. Invalid type/electronic combinations could be sent to the server.
5. **Missing JSDoc on create** -- `useCreateInventory` lacks a JSDoc comment while the other two hooks have them.
6. **No utility hooks** -- Missing features that other hook files provide: no read hook (`useInventory`), no batch operations, no prefetching, no cache utilities.
7. **Protected fields could be broader** -- The optimistic update preserves `id` and `number` but not other server-managed fields like timestamps. While the spread operator handles this correctly in practice, the selective preservation suggests intent that is incompletely applied.

## Quality Score: 6/10

Functional and correct for basic CRUD. The `onSettled` pattern on delete is good defensive coding. The optimistic update on `useUpdateInventory` with field preservation is well-implemented. Deductions for: inconsistent optimistic update coverage, hardcoded query keys, v4 API syntax, no validation, and lack of utility hooks that the other hook files provide. This is the smallest hook file at 93 lines.
