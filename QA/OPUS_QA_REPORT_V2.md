# Opus QA Report V2 — Post-Fix Audit
> Generated: 2026-03-16 | Branch: frontend-dev | Scope: `opex_tool_frontend/src/`
> Fresh audit after fixing 80 issues from V1 report

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 5 |
| WARNING | 28 |
| INFO | 15 |
| **TOTAL** | **48** |

Down from 93 (V1) to 48. All 22 original critical issues resolved; 5 new ones found.

---

## CRITICAL ISSUES

### [C-01] `Item/EditItemNavigable.js:92` — useState passes function reference instead of calling it
- `setFormData(getInitialFormData)` passes the function as a lazy initializer. If `getInitialFormData` expects arguments, they are silently ignored. Verify intent — if this is a deliberate lazy init pattern (valid React API), it's fine. If the function needs `item` as a parameter, it's a bug.
- **Fix:** Confirm `getInitialFormData` signature. If it takes args: `setFormData(getInitialFormData(item))`.

### [C-02] `Item/ItemDeletePopup.js:83` — dangerouslySetInnerHTML
- `dangerouslySetInnerHTML={{ __html: ITEM_DELETE_UI.POPUP_WARNING_TEXT }}`
- Same pattern that was fixed in RecordDeletePopup — missed this file.
- **Fix:** Replace with `{ITEM_DELETE_UI.POPUP_WARNING_TEXT}`.

### [C-03] `Verification/ErrorPanel.jsx:24` — dangerouslySetInnerHTML
- Uses `dangerouslySetInnerHTML` for error messages without sanitization. XSS risk if error content includes user input.
- **Fix:** Use safe React text rendering or sanitize with DOMPurify.

### [C-04] `Items.js:957` — console.log rendered in JSX
- `console.log('Rendering Record component...')` is called inside JSX return, executing on every render and polluting the console. While not a crash, it indicates debugging code was left in the render path.
- **Fix:** Remove the console.log call.

### [C-05] `Project_API.js:18-19` — HTTP 500 returns as success
- `if (response.status === 500) { return [true, []]; }` — treats server errors as empty success. Callers have no way to know the API failed.
- **Fix:** Return `[false, ERROR_MESSAGES.BACKEND_SERVER_ERROR]` or at minimum log and surface the error.

---

## WARNING ISSUES

### Console Statements (remaining)

| ID | File | Lines | Count |
|----|------|-------|-------|
| W-01 | Constants_API.js | 29, 52, 55, 87, 102 | 5 |
| W-02 | Institution_API.js | 19 | 1 |
| W-03 | Project.js | 112, 330, 346-348, 354, 356, 372 | 7 |
| W-04 | Items.js | 245, 274, 280, 285, 292-295, 299, 305, 312, 319-335, 344, 352, 375, 384, 406, 657, 673 | 20+ |
| W-05 | Item.js | 247, 262, 272, 306-337, 345-390 | 15+ |
| W-06 | EditMediaRecordMetadata.js | 123 | 1 |
| W-07 | EditDocumentRecord.js | 555 | 1 |
| W-08 | CreateDocumentRecord.js | 528 | 1 |
| W-09 | RecordMetadata.js | 149, 165 | 2 |
| W-10 | RecordsList.js | 242 | 1 |
| W-11 | useMetadata.js | 131, 158, 185 | 3 |
| W-12 | PerformanceMonitor.js | 24, 43, 47, 100, 105, 137, 138, 144 | 8 |
| W-13 | VerificationTreeView.jsx | 108, 172 | 2 |
| W-14 | TreeNode.jsx | 402 | 1 |
| W-15 | Guidance/useNextActions.js | 90, 118, 151 | 3 |
| W-16 | SettingsContext.jsx | 77 | 1 |
| W-17 | ConstantsContext.js | 43 | 1 |

**Fix plan:** Remove all debug console.log/group. Keep console.error only in genuine error paths where there's no other feedback mechanism.

### UX Issues — alert()/confirm()

| ID | File | Lines | Issue |
|----|------|-------|-------|
| W-18 | RecordFiles.js | 183, 237, 323 | `alert()` for upload/delete errors |
| W-19 | RecordMetadata.js | 155 | `window.confirm()` for delete |
| W-20 | RecordMetadata.js | 166 | `alert()` for delete error |
| W-21 | CalendarComponent.js | 172, 185 | `alert()` for date validation |
| W-22 | Settings.jsx | 29, 34 | `alert()` for save confirmation |
| W-23 | DisplaySettings.jsx | 16, 19, 29 | `alert()` for import/reset |
| W-24 | FormDefaults.jsx | 29, 50, 55, 76 | `alert()` for preset operations |

**Fix plan:** Replace all `alert()`/`confirm()` with toast notifications or app modal dialogs.

### Missing onError Handlers on Mutations

| ID | File | Hooks missing onError |
|----|------|-----------------------|
| W-25 | useFiles.js | useUploadFiles, useDeleteFile |
| W-26 | useProjects.js | useCreateProject, useRenameProject, useDeleteProject, useUploadReport, useExportInventoryList, useExportAcceptanceReport, useExportOpex (7 hooks) |
| W-27 | useRecords.js | useCreateRecord, useUpdateRecord, useDeleteRecord, useCreateMediaRecord, useUpdateMediaRecord, useDeleteMediaRecord, useAddMetadata, useUpdateMetadata, useDeleteMetadata, useBatchDeleteRecords (10 hooks) |
| W-28 | useInventories.js | useCreateInventory, useDeleteInventory |

**Fix plan:** Add onError callbacks with user-facing toast notifications.

---

## INFO ISSUES

### Error Return Inconsistencies

| ID | File | Line | Issue |
|----|------|------|-------|
| I-01 | Item_API.js | 30 | Returns raw `errorData` object instead of `errorData.message` |
| I-02 | Project_API.js | 82 | Returns raw `errorJson` object instead of extracting message |
| I-03 | Record_API.js | 108 | `error.response?.status` — standard Error objects don't have `.response`, check never triggers |

### Hardcoded Query Keys

| ID | File | Lines | Issue |
|----|------|-------|-------|
| I-04 | useItems.js | 20, 130, 212 | Hardcoded `['project', 'detail', projectId]` instead of QUERY_KEYS |
| I-05 | useInventories.js | 15, 32, 35, 71, 90 | Same hardcoded pattern |
| I-06 | useInstitutions.js | 18, 41 | Same hardcoded pattern |

### Performance

| ID | File | Issue |
|----|------|-------|
| I-07 | RecordFiles.js | `formatFileSize`, `formatDate`, `getFileIcon`, `getFileIconColor` recreated every render — move outside component or memoize |
| I-08 | QuickJump.js:23-136 | Heavy filtering/mapping on every render without useMemo |
| I-09 | NavigationContext.js | `getAllItemsFromProject()` and `getAllRecordsFromProject()` iterate full tree on every call |
| I-10 | TreeNode.jsx:129-167 | Multiple getter functions called on every render |

### Mixed API Client Usage

| ID | File | Issue |
|----|------|-------|
| I-11 | useMetadata.js | Uses raw `fetch()` instead of standardized `apiClient` |
| I-12 | useFiles.js | Uses raw `fetch()` instead of standardized `apiClient` |

### Typos

| ID | File | Line | Typo | Fix |
|----|------|------|------|-----|
| I-13 | InventoryItem.js | 10 | `editPopupVisable` | `editPopupVisible` |
| I-14 | Items.js | 46 | `columnSelectVisability` | `columnSelectVisibility` |

### Other

| ID | File | Issue |
|----|------|-------|
| I-15 | VerificationTreeView.jsx:75-76 | Dynamic `require()` in render — should be static imports at top |

---

## Priority Fix Plan

### Phase 1: Critical (5 items)
1. Fix `dangerouslySetInnerHTML` in ItemDeletePopup.js and ErrorPanel.jsx
2. Verify EditItemNavigable.js:92 lazy init pattern
3. Remove console.log in Items.js JSX render path
4. Fix Project_API HTTP 500 treated as success

### Phase 2: Console Cleanup (all W-01 through W-17)
5. Remove remaining ~70 console statements across Items.js, Item.js, Project.js, PerformanceMonitor.js, Constants_API.js, and others

### Phase 3: UX — Replace alert/confirm (W-18 through W-24)
6. Replace all `alert()`/`window.confirm()` with toast notifications or modals

### Phase 4: Error Handling (W-25 through W-28)
7. Add onError handlers to all 21 mutations missing them

### Phase 5: Code Quality (INFO items)
8. Standardize error returns in Item_API, Project_API
9. Migrate hardcoded query keys to QUERY_KEYS factories
10. Migrate useMetadata.js and useFiles.js to apiClient
11. Fix typos
12. Memoize utility functions in RecordFiles, QuickJump
