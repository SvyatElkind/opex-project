# Implementation Backlog

> Updated: 2026-04-02 | Items identified during QA rounds V1–V7
> Organized by priority: Critical Bugs → Data Integrity → Code Quality → Architecture

---

## Phase 1: Critical Bugs [MUST FIX]

- [ ] **Fix `Record.js` handleSaveEdit** — `data: editFormData` → `recordData: editFormData` + add `recordType` for media (lines 431, 437)
- [ ] **Fix `InheritanceUtils.getInheritanceInfo`** — mutates shared `CATEGORY_CONSTRAINTS` object. Shallow copy before mutation (line 388)
- [ ] **Fix `Item.js` currentIndex crash** — guard against `currentIndex === -1` when item not found in inventory
- [ ] **Fix `VerificationTreeView.jsx` media records** — render `photo_records`/`video_records`/`audio_records` for media items (currently only renders `item.records`)
- [ ] **Fix `RoadmapWizard.jsx` re-render risk** — wrap `updateField` in `useCallback` to prevent infinite loop
- [ ] **Fix `InventoryEdit.js` storageTerm init** — use `null` instead of `''` when not found in constants

---

## Phase 2: Data Integrity & Logic Fixes

- [ ] **Fix `Record.js` isMedia/isAnyMedia consistency** — use `isAnyMedia` for all dispatch conditionals
- [ ] **Fix `Record.js` dependency array** — add `inheritanceInfo.isAnyMedia` to `saveAndNavigateRecord` useCallback deps
- [ ] **Fix `SmartGuideCard.jsx` operator precedence** — add explicit parentheses in validation warning check
- [ ] **Fix `RecordsList.js` batch delete** — surface individual errors to user instead of swallowing
- [ ] **Fix `CreateMediaRecord.js` race condition** — await refetch before reading cache (line 240)
- [ ] **Fix `RecordFiles.js` stale closure** — setTimeout in `closeSidePanel` captures stale state (line 277)
- [ ] **Fix `RecordValidation.js` null check** — `recordData.duration?.trim()` instead of `recordData.duration.trim()`
- [ ] **Fix DELETE endpoints** — Inventory, Item, Project APIs call `response.json()` on 204 No Content
- [ ] **Fix `errorService.js`** — `isNotFoundStatus` returns true for 204, not 404

---

## Phase 3: Error Handling

- [ ] **Add `onError` handlers to all 21 mutations** missing them:
  - useProjects.js: 7 mutations (create, rename, delete, upload, 3x export)
  - useRecords.js: 10 mutations (3x standard CRUD, 3x media CRUD, 3x metadata, batch delete)
  - useFiles.js: 2 mutations (upload, delete)
  - useInventories.js: 2 mutations (create, delete)
  - useInstitutions.js: 2 mutations (update creator, update signer)
- [ ] **Standardize error return pattern** — `Item_API.updateItem` returns raw errorData; `Project_API.get_project` returns raw errorJson
- [ ] **Fix error string matching** — `CreateMediaRecord.js` detects errors via `.includes()` on message text (brittle)

---

## Phase 4: UX Consistency

- [ ] **Replace all `alert()`/`window.confirm()`** with toast/modal (~15 instances):
  - RecordFiles.js (3), RecordMetadata.js (2), CalendarComponent.js (2)
  - Settings.jsx (2), DisplaySettings.jsx (3), FormDefaults.jsx (4)
  - HelpWindow.js (1), Item.js (window.confirm for delete)
- [ ] **Remove all ~70 console.log/group statements** from production code paths
- [ ] **Remove dead code:**
  - Sidebar.js (always returns null)
  - useNextActions.js (never imported, superseded by useGuidanceEngine)
  - Dead state variables in Project.js, Workspace.js, InventoryItem.js
- [ ] **Fix all typos:**
  - `toastParagrapth` → `toastParagraph` (Project.js)
  - `fromatYear` → `formatYear` (Utils.js)
  - `Uzskaietes` → `Uzskaites` (Institution.js)
  - `editPopupVisable` → `editPopupVisible` (InventoryItem.js)
  - `columnSelectVisability` → `columnSelectVisibility` (Items.js)

---

## Phase 5: Architecture / Refactoring

### API Standardization
- [ ] **Migrate `useMetadata.js` and `useFiles.js`** from raw `fetch` to `apiClient`
- [ ] **Migrate all `*_API.js` files** to use `apiClient.js` (or mark as deprecated/test-only)
- [ ] **Standardize query key strategy** — replace all hardcoded arrays and local factories with `QUERY_KEYS` from Constants
- [ ] **Move hardcoded Latvian error strings** in `apiClient.js` to constants
- [ ] **Resolve `useFiles`/`useRecords` export collision** — both export `useUploadFiles` and `useDeleteFile`

### Code Consolidation
- [ ] **Consolidate `CreateDocumentRecord` + `EditDocumentRecord`** — ~95% code duplication (~2200 lines combined)
- [ ] **Consolidate `CreateItemNavigable` + `EditItemNavigable`** — ~80% code duplication
- [ ] **Consolidate `InventoryCreate` + `InventoryEdit`** — significant overlap
- [ ] **Extract `Item.js` view duplication** — ~600 lines shared between `renderCombinedView()` and `renderSegmentedView()`
- [ ] **Extract `VerificationModal.jsx` sub-components** — ExportPopup and OpexPopup to separate files (currently 1261 lines)

### Module Splitting
- [ ] **Break up `InheritanceUtils.js`** (1665 lines) — split into CategoryUtils, ValidationUtils, StatisticsUtils, MediaUtils
- [ ] **Break up `Constants.js`** (1250 lines) — finish migration to domain-specific constant files
- [ ] **Extract shared `formatFileSize`** — duplicated in 5 files
- [ ] **Extract shared `formatDate` / `formatDateLocale`** — duplicated in 8+ files

### Validation Deduplication
- [ ] **Fix duplicate validation logic** in `RecordValidation.js` — photo/video validation appears 3 times
- [ ] **Fix duplicate `validateMediaRecordData`** in `useRecords.js` and `Record_API.js`

---

## Phase 6: Performance

- [ ] **Memoize `NavigationContext` tree traversals** — `getAllRecordsFromProject()`, `getAllItemsFromProject()`
- [ ] **Memoize `QuickJump.js`** — filtering/mapping on every render without `useMemo`
- [ ] **Memoize `TreeNode.jsx`** — multiple getter functions called on every render
- [ ] **Memoize `useTheme.js`** — `getActiveTheme()` and `isDark()` recompute every render
- [ ] **Fix `useScrollDirection.js`** — dependency cycle (scrollDirection/isScrolled in deps)
- [ ] **Fix `useAppSettings.js`** — remove+add all font classes instead of swapping changed class
- [ ] **Use `Promise.all()`** in RecordFiles.js for batch delete (currently sequential)
- [ ] **Debounce RoadmapWizard localStorage writes**
- [ ] **Memoize `SmartGuideCard.jsx` stripHtml** — creates DOM element on every call

---

## Phase 7: Guidance System Evolution

- [ ] **Wire guidance actions to NavigationContext** — `nav` property in useGuidanceEngine should trigger `navigateTo()`
- [ ] **Remove dead `useNextActions.js`** — never imported, superseded by useGuidanceEngine
- [ ] **Replace `window.dispatchEvent(CustomEvent)` pattern** with React context/callbacks
- [ ] **Connect SmartGuideCard buttons to navigation** — "Izveidot GV" should navigate AND open form
- [ ] **Add session resume** — save lastActiveEntity, show "continue where you left off" prompt
- [ ] **Per-inventory progress display** — show each inventory's completion separately
- [ ] **Implement guided mode** — step-by-step wizard for beginners (roadmap mode field exists but is unused)
- [ ] **Backend workflow persistence** — migrate from localStorage to Django model (future)

---

## Phase 8: Quality & Standards

- [ ] **Add PropTypes or TypeScript** to all components
- [ ] **Add focus traps** to all modal components for accessibility
- [ ] **Add consistent Escape key handling** across all popups
- [ ] **Connect upload progress** to fetch progress events (currently spinner-only)
- [ ] **Remove deprecated `matchMedia` fallback** in `useTheme.js`
- [ ] **Document `errorService.js`** expected error shape

---

## Known Limitations (Won't Fix)

1. **L-01:** Upload progress bar not connected to fetch events (UX only, spinner works)
2. **L-02:** FallbackConstants must be manually synced with backend
3. **L-03:** Calendar date edge case when switching indicator types

---

## Statistics

| Phase | Items | Effort | Impact |
|-------|-------|--------|--------|
| Phase 1: Critical Bugs | 6 | Low | BLOCKING |
| Phase 2: Data Integrity | 9 | Low-Medium | High |
| Phase 3: Error Handling | 3 | Medium | High |
| Phase 4: UX Consistency | 4 categories | Medium | Medium |
| Phase 5: Architecture | 14 | High | Long-term |
| Phase 6: Performance | 9 | Medium | Medium |
| Phase 7: Guidance | 8 | High | High UX |
| Phase 8: Quality | 6 | High | Long-term |
