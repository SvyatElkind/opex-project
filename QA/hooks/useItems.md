# QA Report: useItems.js
> Path: `src/hooks/useItems.js` | Last audit: 2026-03-24

## Purpose

Provides hooks for item (storage unit / glabashanas vieniba) CRUD operations with full optimistic update support including snapshot-based rollback. Used by `Items.js`, `Item.js`, `EditItemNavigable.js`, and `ItemDeletePopup.js`.

## Hooks Exported

### `useCreateItem(shouldInvalidate = true)`
- **What:** Creates a new item within an inventory. Implements full optimistic updates with rollback.
- **Parameters:** `shouldInvalidate` (boolean, default `true`) -- controls whether to invalidate the project query on success. Can be set to `false` to defer invalidation until a popup closes.
- **Mutation parameters:** `{ itemData, projectId, inventoryId }`.
- **Endpoint:** `POST /project/{projectId}/item/?inventory_id={inventoryId}`
- **Optimistic update flow:**
  1. `onMutate`: Cancels outgoing refetches, snapshots current project data. Inserts a new item with `isOptimistic: true` flag and a temporary ID (`temp_{timestamp}_{random6chars}`) into the inventory's items array. Also increments `items_per_period` and updates `last_gv` to the max of current `last_gv` and the new item number.
  2. `onError`: Rolls back to the snapshot via `setQueryData`.
  3. `onSuccess`: Replaces the optimistic item (matched by `isOptimistic === true && number === variables.itemData.number`) with real server data. Conditionally invalidates the project query based on `shouldInvalidate`.

### `useUpdateItem()`
- **What:** Updates an existing item with optimistic updates.
- **Mutation parameters:** `{ itemData, projectId, itemId }`.
- **Endpoint:** `PUT /project/{projectId}/item/{itemId}/`
- **Optimistic update flow:**
  1. `onMutate`: Cancels refetches, snapshots. Merges `itemData` into the matching item (by `item.id === itemId`) with `isOptimistic: true`.
  2. `onError`: Rolls back to snapshot.
  3. `onSuccess`: Replaces optimistic data with server response, then invalidates project query.

### `useDeleteItem()`
- **What:** Deletes an item with optimistic removal.
- **Mutation parameters:** `{ projectId, itemId }`.
- **Endpoint:** `DELETE /project/{projectId}/item/{itemId}/`
- **Optimistic update flow:**
  1. `onMutate`: Cancels refetches, snapshots. Filters out the item from its inventory's items array. Decrements `items_per_period` (clamped to 0).
  2. `onError`: Rolls back to snapshot.
  3. `onSuccess`: Always invalidates project query (ensures server consistency after deletion).

### `useInvalidateProject()`
- **What:** Returns a function to manually invalidate the project detail query.
- **Returns:** `(projectId) => void`.
- **Use case:** Called when deferred invalidation is needed (e.g., after closing a batch-create popup where `shouldInvalidate` was set to `false`).

## Error Handling

- **onError (all three mutations):** Full rollback via `setQueryData` using the snapshot captured in `onMutate`. This means the UI reverts to the pre-mutation state if the API call fails.
- **API errors:** Propagate from `apiClient` as `ApiError` to the caller. No in-hook error notifications or toasts.

## Cache Strategy

**Query key used:** `['project', 'detail', projectId]` -- hardcoded, NOT using the centralized `QUERY_KEYS` from Constants.

**Pattern:** All three mutations operate on the same deeply nested project structure (`institution.fond.inventories[].items[]`). They:
1. Cancel in-flight queries via `cancelQueries(['project', 'detail', projectId])`
2. Snapshot the full project data for rollback
3. Directly manipulate the nested items array in the cache
4. Replace optimistic data with real server data on success
5. Invalidate the project query for background revalidation

**Optimistic updates:** All three CRUD operations implement optimistic updates -- create adds immediately with a temp ID, update merges fields immediately, delete removes immediately. This provides instant UI feedback.

## Known Limitations

1. **Hardcoded query keys** -- Uses `['project', 'detail', projectId]` directly instead of `QUERY_KEYS.project(projectId)`. If the key shape changes in Constants, these hooks will break silently. This is also inconsistent with `useRecords.js` and `useFiles.js` which use `QUERY_KEYS`.
2. **Optimistic create matching heuristic** -- The `onSuccess` handler matches optimistic items by `isOptimistic && number`. If two items are created with the same number before the first resolves, the wrong item could be replaced. Matching by the temporary ID would be safer.
3. **`cancelQueries` syntax** -- Uses `cancelQueries(['project', 'detail', projectId])` (v4-style array argument) instead of the v5 object syntax `cancelQueries({ queryKey: [...] })`. This may produce warnings or silent failures in React Query v5.
4. **Deep mutation of nested state** -- All mutations navigate `institution.fond.inventories[].items[]`, which is fragile. If the project data structure changes, all three hooks break.
5. **Redundant field enumeration in create** -- `onMutate` manually lists every item field (number, series_code, title, etc.) and then spreads `...itemData` over them. The explicit listing is redundant and will drift as the schema evolves.
6. **Delete decrements all inventories** -- The `onMutate` for delete decrements `items_per_period` on the inventory that is being mapped, but since it maps ALL inventories and only filters items from the matching one, the decrement correctly only applies where the filter removed an item. However, the intent is not immediately clear from the code.
7. **No batch operations** -- Unlike `useRecords.js` which has `useBatchDeleteRecords`, there is no batch item creation or deletion.

## Quality Score: 7/10

Excellent optimistic update implementation with proper snapshot-based rollback. Provides instant UI feedback for all CRUD operations, which is a significant UX benefit. The `shouldInvalidate` parameter on create is a thoughtful design for batch creation scenarios. Deductions for: hardcoded query keys, potential v5 API incompatibility, fragile deep-nested cache manipulation, and the optimistic item matching heuristic.
