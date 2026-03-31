# Implementation Backlog
> Items identified during QA cleanup that require architectural changes, not just code cleaning.
> These should be tackled after all files are clean.

## Architecture / Refactoring

- [ ] **Extract shared `createRequestOptions`** from 5 API files into a single utility
- [ ] **Migrate all API files to use `apiClient.js`** — currently `*_API.js` files use raw `fetch` while hooks use `apiClient`
- [ ] **Migrate `useMetadata.js` and `useFiles.js`** from raw `fetch` to `apiClient`
- [ ] **Standardize query key strategy** — mix of hardcoded arrays, local factories, and `QUERY_KEYS` from Constants
- [ ] **Extract shared `formatFileSize`** — duplicated in 5 files (RecordValidation, VerificationModal, TreeNode, RecordFiles, UploadPopup)
- [ ] **Extract shared `formatDate` / `formatDateLocale`** — duplicated in 8+ files, `DateFormatter.js` exists but is underused
- [ ] **Consolidate `CreateDocumentRecord` + `EditDocumentRecord`** — ~95% code duplication (~2200 lines combined)
- [ ] **Consolidate `CreateItemNavigable` + `EditItemNavigable`** — ~80% code duplication
- [ ] **Consolidate `InventoryCreate` + `InventoryEdit`** — significant overlap
- [ ] **Break up `Constants.js`** (1250 lines) — finish migration to domain-specific constant files
- [ ] **Break up `InheritanceUtils.js`** (1665 lines) — split by domain concern
- [ ] **Add `onError` handlers to all 21 mutations** missing them (useFiles, useProjects, useRecords, useInventories)
- [ ] **Replace all `alert()`/`window.confirm()`** with toast/modal components (~15 instances across Settings, RecordFiles, RecordMetadata, CalendarComponent, Item)
- [ ] **Fix DELETE endpoints** — Inventory, Item, Project APIs all call `response.json()` on 204 No Content responses
- [ ] **Fix `errorService.js`** — `isNotFoundStatus` returns true for 204, not 404
- [ ] **Standardize error return pattern** — `Item_API.updateItem` returns raw errorData object; `Project_API.get_project` returns raw errorJson
- [ ] **Fix `InheritanceUtils.getInheritanceInfo`** — mutates shared `CATEGORY_CONSTRAINTS` object (line ~430)
- [ ] **Fix duplicate validation logic** in `RecordValidation.js` between `validateRecordForm` and `validateRecordData`
- [ ] **Replace `window.dispatchEvent(CustomEvent)` pattern** in useNextActions with React context/callbacks
- [ ] **Add PropTypes or TypeScript** to all components
