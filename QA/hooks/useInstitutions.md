# QA Report: useInstitutions.js
> Path: `src/hooks/useInstitutions.js` | Last audit: 2026-03-24

## Purpose

Provides hooks for updating institution signer fields (creator, creator_position, signer, signer_position). Institutions represent the organization that owns the archival records within a project. Used by `Institution.js` for the signers form/popup.

## Hooks Exported

### `useAddInstitutionSigners()`
- **What:** Adds or updates all signer fields on an institution.
- **Mutation parameters:** `{ projectId, institutionId, signersData }`.
- **Endpoint:** `PUT /project/{projectId}/institution/{institutionId}/`
- **Body:** The full `signersData` object is sent directly (typically contains `{ creator, creator_position, signer, signer_position }`).
- **On settled:** Invalidates project detail query `['project', 'detail', variables.projectId]`. Uses `onSettled` which runs on both success and failure.

### `useUpdateInstitutionSignerField()`
- **What:** Updates signer fields on an institution. Despite the singular "Field" in the name, it sends all four signer fields.
- **Mutation parameters:** `{ projectId, institutionId, updatedData }`.
- **Endpoint:** `PUT /project/{projectId}/institution/{institutionId}/`
- **Body:** Explicitly destructures and sends `{ creator, creator_position, signer, signer_position }` from `updatedData`.
- **On settled:** Invalidates project detail query.

## Error Handling

Both hooks use `onSettled` for cache invalidation, which is a defensive pattern ensuring the project data is refreshed even if the API call fails. This prevents the UI from getting stuck showing stale data after a failed mutation.

Actual errors propagate to the caller through React Query's standard error mechanism (`mutation.isError`, `mutation.error`). There are no in-hook error notifications or console logging.

## Cache Strategy

**Query key used:** `['project', 'detail', variables.projectId]` -- hardcoded, NOT using centralized `QUERY_KEYS`.

**Invalidation pattern:** Both hooks invalidate the project detail query via `onSettled`. No optimistic updates -- the UI waits for the server round-trip plus the triggered refetch to show updated signer data.

**Note on key alignment:** These hooks use `['project', 'detail', ...]` (singular), which matches `useItems.js` and `useInventories.js` but does NOT match `useProjects.js` which uses `['projects', 'detail', ...]` (plural). See the `useProjects.md` report for details on this mismatch.

## Known Limitations

1. **Redundant hooks** -- `useAddInstitutionSigners` and `useUpdateInstitutionSignerField` both call the same endpoint (`PUT /project/{id}/institution/{id}/`) with the same HTTP method. The only difference is that `useUpdateInstitutionSignerField` explicitly picks four fields from `updatedData`, while `useAddInstitutionSigners` passes `signersData` directly. These should be consolidated into a single hook.
2. **Misleading name** -- `useUpdateInstitutionSignerField` (singular "Field") actually updates all four fields simultaneously, not a single field. The name suggests partial update semantics.
3. **No optimistic updates** -- For simple text field updates (names and positions), optimistic updates would provide noticeably better UX. The current implementation requires waiting for both the API round-trip and the subsequent project refetch.
4. **Hardcoded query keys** -- Uses `['project', 'detail', variables.projectId]` instead of `QUERY_KEYS.project(projectId)`.
5. **Explicit field picking is fragile** -- `useUpdateInstitutionSignerField` manually destructures `creator`, `creator_position`, `signer`, `signer_position` from `updatedData`. If the API schema adds new institution fields, they will be silently dropped.
6. **No read hook** -- There is no `useInstitution()` query hook. Institution data is accessed only through the parent project query. This is acceptable given the data model (one institution per project) but limits reuse.
7. **No validation** -- Neither hook validates the input before sending. Empty strings or missing fields are sent as-is.
8. **Smallest hook file** -- Only 41 lines with 2 hooks. This is the least developed hook file in the codebase.

## Quality Score: 5/10

Functional and correct for its narrow scope. The `onSettled` pattern is good defensive coding. Deductions for: two nearly identical hooks that should be consolidated, misleading naming, no optimistic updates for simple field updates, hardcoded query keys, fragile explicit field picking, and no input validation. The low hook count and small file size suggest this area has received less development attention.
