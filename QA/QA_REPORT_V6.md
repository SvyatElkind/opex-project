# OPEX Frontend — QA Report V6

**Date:** 2026-03-26
**Scope:** Full frontend re-audit after all previous fixes

---

## VERIFIED REAL BUGS (2)

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 1 | `Record/Record.js` | 302-307 | Inline edit passes `{ data: editFormData }` but mutations expect `{ recordData }`. Both `updateRecordMutation` and `updateMediaRecordMutation` destructure `recordData` which is `undefined`. **Inline record saving is broken.** | **HIGH** |
| 2 | `Inventory/InventoryEdit.js` | 81 | `storageTerm` initialized as `''` (string) instead of `null` when inventory storage term not found in constants list. React-select `value=""` may cause controlled component warning. | **LOW** |

---

## FALSE POSITIVES FROM AUDIT (Verified as NOT bugs)

| Claim | Reality |
|-------|---------|
| useProjects.js:102 "wrong variable passed" | `variables` IS the `projectId` directly (`mutationFn: async (projectId)`). Correct. |
| NavigationContext.js "undefined functions" | `getNavigationBehavior`, `getItemAttentionStatus`, `getRecordStatistics` all exist in InheritanceUtils.js (lines 472, 541, 636). |
| InheritanceUtils "no default export" | Line 1525: `export default { ... }`. Has both named and default exports. |
| apiClient.js:195 "204 check wrong" | 204 is always a successful DELETE. Checked before error status. Correct. |
| Items.js pagination "stuck on invalid page" | useEffect at lines 113-120 properly clamps page to valid range. |
| useItems.js "hardcoded query keys" | They produce `['project', 'detail', id]` which matches `QUERY_KEYS.project(id)`. Same result. |
| useRecords.js:176 "missing itemId" | `invalidateRelatedQueries` handles missing `itemId` gracefully (line 56: `if (itemId)`). Not a bug — just invalidates project+record without item-level cache. |

---

## OVERALL STATUS

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 (Record.js inline edit parameter mismatch) |
| Low | 1 (InventoryEdit storageTerm init) |
| **Total** | **2** |

---

## FIX REQUIRED

### Record.js:302-307 — Change `data` to `recordData`

Current:
```javascript
await updateMediaRecordMutation.mutateAsync({
    projectId, recordId, data: editFormData
});
// and
await updateRecordMutation.mutateAsync({
    projectId, recordId, data: editFormData
});
```

Should be:
```javascript
await updateMediaRecordMutation.mutateAsync({
    projectId, recordId, recordData: editFormData, recordType: ...
});
// and
await updateRecordMutation.mutateAsync({
    projectId, recordId, recordData: editFormData
});
```
