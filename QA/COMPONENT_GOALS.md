# OPEX Frontend — Per-Component Production Goals

> **Date:** 2026-04-02 | **Purpose:** Define what "production-ready" means for every component
>
> Each component has a **GOAL** (what it should do), **CURRENT STATE** (what works/doesn't), and **ACTIONS** (what to fix).
> Items marked with `[BLOCKER]` must be fixed before production deployment.

---

## 1. Project Lifecycle

### GOAL
Users can create projects, import VVAIS reports, manage project metadata, and delete projects with confirmation. All operations provide clear feedback via toast notifications.

### Components & Actions

**Project.js** — Main project view and controls
- [ ] Remove 5 dead state variables: `activeDataVisable`, `activeProjectVisable`, `tooltip`, `tooltipContent`, `tooltipPosition`
- [ ] Fix typo: `toastParagrapth` → `toastParagraph` (all references)
- [ ] Remove ~7 console.log statements
- [ ] Ensure clipboard failure shows toast, not just console.error

**ProjectDetails.js** — Project info display
- [ ] Remove `console.log(activeProjectData)` (lines 4-5)

**UploadPopup.js** — VVAIS report upload
- [ ] Store `setInterval` ID in `useRef`, clear in `useEffect` cleanup (prevent memory leak on unmount)
- [ ] Replace `JSON.stringify(result)` error display with user-friendly message
- [ ] Verify max file size check (50 MB) works correctly

**WarningPopup.js** — Delete confirmation
- [ ] Remove `console.log(projectdata)` (line 10)

---

## 2. Institution

### GOAL
Users can view institution details and manage four signer fields (creator, creator_position, signer, signer_position). All four fields are required for OPEX export.

### Components & Actions

**Institution.js**
- [ ] Fix Latvian typo: `"Uzskaietes"` → `"Uzskaites"` (line 98)

**InstitutionSignersPopup.jsx**
- [x] Production-ready — no issues found

---

## 3. Inventory Management

### GOAL
Users can create, edit, and delete inventories. Inventories imported from VVAIS have restricted editing (type locked, electronic flag hidden). Type determines the entire downstream data model (4 categories). Inventory number auto-increments.

### Components & Actions

**Inventories.js** — Inventory list
- [ ] Remove debug logs at lines 100, 108, 111

**InventoryCreate.js** — Create form
- [ ] Remove debug logs (lines 132, 171, 177)
- [ ] Memoize `Utils()` call (currently recreated every render)

**InventoryEdit.js** — Edit form with limited mode
- [ ] `[BLOCKER]` Fix `storageTerm` init: use `null` instead of `''` when not found
- [ ] Remove debug logs (lines 140, 173, 178)
- [ ] Memoize `Utils()` call

**InventoryItem.js** — Individual inventory card
- [ ] Remove unused `invDetails` state (line 11)
- [ ] Remove debug logs (lines 72-73)
- [ ] Fix typo: `editPopupVisable` → `editPopupVisible`

**InventoryPeriodPopup.js** — Date range popup
- [ ] Simplify: pass `onCancel` directly instead of wrapper

**InventoryDelete.js**
- [x] Production-ready

---

## 4. Item Management

### GOAL
Users can create, edit, navigate between, and delete items within inventories. Items have 6 form sections (basic, dates, technical, description, access, related). Combined view (media categories, 1:1) shows item+record together. Segmented view (document categories, 1:N) shows items and records separately. Pagination works for large item sets.

### Components & Actions

**Item.js** — Single item view with inline record
- [ ] `[BLOCKER]` Guard against `currentIndex === -1` crash when item not found
- [ ] Fix `parseInt(jumpToNumber)` → `parseInt(jumpToNumber, 10)` (line 337)
- [ ] Replace `window.confirm()` with `ItemDeletePopup` for consistent UX
- [ ] Replace `alert()` for errors with toast notification
- [ ] Remove ~15 console.log statements

**Items.js** — Items list with table/card views
- [ ] Remove ~20 console.log statements
- [ ] Extract ~600 lines of duplication between `renderCombinedView()` and `renderSegmentedView()`
- [ ] Fix typo: `columnSelectVisability` → `columnSelectVisibility`

**EditItemNavigable.js** — Section-based edit form
- [x] Verified: lazy init pattern is correct
- [x] Production-ready

**CreateItemNavigable.js** — Create form
- [ ] Future: consolidate with EditItemNavigable (~80% overlap)

**ItemDeletePopup.js**
- [x] Production-ready (XSS fix applied)

**ItemNotFoundPopup.js**
- [ ] Simplify: pass `onClose` directly instead of wrapper

---

## 5. Record Management

### GOAL
Users can create, view, edit (inline), navigate between, and delete records. Textual records use form-only creation. Electronic media records use file-upload-first workflow with auto metadata extraction. Each record type shows appropriate fields based on category. Keyboard arrow navigation works between records.

### Components & Actions

**Record.js** — Single record view with inline editing
- [ ] `[BLOCKER]` Fix handleSaveEdit: change `data: editFormData` → `recordData: editFormData` (lines 431, 437)
- [ ] `[BLOCKER]` Add `recordType: inheritanceInfo.type` for media records in handleSaveEdit
- [ ] Fix `isMedia` → `isAnyMedia` consistency (use `isAnyMedia` for dispatch conditionals)
- [ ] Fix dependency array: add `inheritanceInfo.isAnyMedia` (line 319)
- [ ] Remove 50+ console.log/group statements

**RecordsList.js** — Record list with sorting/filtering
- [ ] Surface batch delete errors to user (currently swallowed)
- [ ] Remove debug log (line 242)

**CreateDocumentRecord.js** — Textual record creation
- [ ] Remove debug log (line 528)
- [ ] Future: consolidate with EditDocumentRecord (~95% overlap)

**EditDocumentRecord.js** — Textual record editing
- [ ] Remove debug log (line 555)

**CreateMediaRecord.js** — Media upload → record creation
- [ ] Fix race condition: await refetch before reading cache (line 240)
- [ ] Replace error string matching with error codes

**EditMediaRecordMetadata.js** — Media metadata editing
- [x] Production-ready — recently improved

**RecordFiles.js** — File management (upload, list, delete)
- [ ] Fix stale closure in `closeSidePanel` setTimeout (line 277)
- [ ] Use `Promise.all()` for batch delete instead of sequential await
- [ ] Replace `alert()` with toast (lines 183, 237, 323)

**RecordMetadata.js** — Additional metadata (actions, addressees, visas, read status)
- [ ] Replace `window.confirm()` with app confirm modal (line 155)
- [ ] Replace `alert()` with toast (line 166)
- [ ] Remove debug logs (lines 149, 165)

**RecordValidation.js** — Client-side validation
- [ ] Deduplicate photo/video validation logic (appears 3 times)
- [ ] Fix `recordData.duration.trim()` — add null check

---

## 6. Navigation

### GOAL
Users can navigate the 7-level hierarchy without URL routing. NavigationContext tracks current inventory/item/record. Back-navigation is category-aware. Breadcrumbs show current location. QuickJump enables fast navigation to any entity. Sidebar shows project tree.

### Components & Actions

**NavigationContext.js** — Central navigation state
- [ ] Memoize `getAllRecordsFromProject()` and `getAllItemsFromProject()` with `useMemo`

**Breadcrumbs.js**
- [x] Production-ready

**ProjectNavigation.js**
- [ ] Replace `document.body.style.paddingTop` with CSS custom property

**QuickJump.js**
- [ ] Wrap filtering/mapping in `useMemo` keyed on `projectData`

**Sidebar.js**
- [ ] Remove entirely (dead code — destructures non-existent context values, always returns null)

---

## 7. Verification & Export

### GOAL
Users can verify their entire project tree before export. Verification checks all entities across all 4 categories with 37 validation rules (18 errors, 10 warnings, 6 file rules, 3 aggregated). Tree view shows hierarchical error/warning indicators. Export is blocked until zero errors. Three export types available: inventory list, PN akts (electronic/physical), OPEX package (ilgstoši/pastāvīgi).

### Components & Actions

**VerificationModal.jsx** — Main verification modal with tabs
- [ ] Wrap `runValidation` in `useCallback` (missing from useEffect dependency)
- [ ] Future: extract ExportPopup and OpexPopup to separate files (file is 1261 lines)

**VerificationTreeView.jsx** — Hierarchical tree display
- [ ] `[BLOCKER]` Render media records from `photo_records`/`video_records`/`audio_records` arrays (currently only renders `item.records`)
- [ ] Fix `expandedNodes` Set becoming stale when `expandAll` prop changes
- [ ] Remove debug logs (lines 108, 172)

**VerificationSummary.jsx** — Stats overview
- [ ] Add null check before `.reduce()` on `validation.details`

**TreeNode.jsx** — Individual tree node
- [ ] Memoize getter functions (called on every render)
- [ ] Use stable record IDs instead of array index for node keys
- [ ] Remove debug log (line 402)

**ErrorPanel.jsx**
- [x] Production-ready (XSS fix applied)

---

## 8. Guidance & Roadmap

### GOAL
Users receive actionable, context-aware guidance on what to do next. The guidance engine understands all 4 categories and generates inventory-specific work queues. Progress is tracked per-inventory with visual indicators. Roadmap allows setting goals (item/record/file targets) per route.

### Components & Actions

**useGuidanceEngine.js** — Smart work queue (NEW, well-implemented)
- [x] Category-aware, round-robin distribution — production-ready
- [ ] Wire `nav` property to actual NavigationContext `navigateTo()` calls

**GuidanceContext.jsx** — UI state management
- [ ] Wrap 4 `localStorage.getItem` + `JSON.parse` calls in try/catch
- [ ] Batch 4 separate localStorage `useEffect` hooks into one

**SmartGuideCard.jsx** — Floating guidance card
- [ ] Fix operator precedence in validation warning check
- [ ] Make `currentAction.button` actually navigate (currently passive)
- [ ] Memoize `stripHtml` function (creates DOM element on every call)
- [ ] Show indicator when item list is truncated (silent 10-item cap)

**useWorkflowState.js** — Linear progress calculation
- [ ] Future: integrate with useGuidanceEngine for richer progress tracking

**useNextActions.js** — DEAD CODE
- [ ] Remove entirely (never imported, superseded by useGuidanceEngine)

**RoadmapContext.jsx** — Per-project route tracking
- [x] Production-ready

**RoadmapWizard.jsx** — Route creation wizard
- [ ] `[BLOCKER]` Fix potential infinite re-render: wrap `updateField` in `useCallback`
- [ ] Debounce localStorage writes
- [ ] Future: extract sub-components from 675-line file

**RoadmapInfo.jsx** — Route progress display
- [x] Production-ready

---

## 9. Settings

### GOAL
Users can configure display preferences (theme, font size, compact view, breadcrumbs), form presets (language, restriction, keywords defaults), and validation thresholds (file size, duration, image dimensions). All settings persist to localStorage. Import/export settings as JSON.

### Components & Actions

**Settings.jsx** — Settings modal
- [ ] Replace `alert()` with toast (lines 29, 34)

**SettingsContext.jsx** — Settings state + persistence
- [ ] Remove debug log (line 77)

**DisplaySettings.jsx** — Display tab
- [ ] Replace `alert()` with toast (lines 16, 19, 29)

**FormDefaults.jsx** — Form presets tab
- [ ] Replace `alert()` with toast (lines 29, 50, 55, 76)

**ValidationSettings.jsx**
- [x] Production-ready

---

## 10. Shared Components

### GOAL
Reusable components provide consistent UX across the application. Notifications replace all native browser dialogs. Validation indicators show per-field state. Error boundaries prevent full app crashes.

### Components & Actions

**Notification.jsx** — Toast + confirm dialog provider
- [x] Production-ready — well-architected

**ValidationIndicator.jsx**
- [x] Production-ready (XSS fix applied — no more dangerouslySetInnerHTML)

**ValidationWarning.jsx**
- [ ] Move hardcoded `"Iestatījumi > Validācija"` to constants

**ErrorDisplay.jsx**
- [x] Production-ready

---

## 11. API & Services

### GOAL
All HTTP communication goes through `apiClient.js` with consistent error handling, retry logic, timeout, and AbortController support. Errors are parsed and surfaced to users. Legacy API files are deprecated.

### Components & Actions

**apiClient.js** — Centralized HTTP client
- [ ] Move hardcoded Latvian error string to constants (line 79)

**errorService.js** — Error response parsing
- [ ] Only iterate known error fields (currently iterates all response fields)

**Constants_API.js** — Dropdown constants fetcher
- [x] Still actively used, production-ready

**Legacy API files** (Institution_API, Inventory_API, Item_API, Project_API, Record_API)
- [ ] Future: migrate remaining consumers to apiClient + hooks

---

## 12. Custom Hooks

### GOAL
All data operations go through custom hooks using React Query. Every mutation has error feedback. Query keys are centralized. No raw `fetch()` calls.

### Components & Actions

**useProjects.js**
- [ ] Add `onError` to all 7 mutations with toast notification

**useItems.js**
- [ ] Migrate hardcoded `['project', 'detail', id]` to `QUERY_KEYS`

**useInventories.js**
- [ ] Remove local `inventoryKeys` factory, use centralized `QUERY_KEYS`
- [ ] Add `onError` to create/delete mutations
- [ ] Remove debug logs (lines 25, 82)

**useInstitutions.js**
- [ ] Add `onError` to both mutations
- [ ] Migrate hardcoded query keys

**useRecords.js**
- [ ] Add `onError` to all 10 mutations
- [ ] Fix Content-Type header removal for FormData requests

**useFiles.js**
- [ ] Migrate from raw `fetch()` to `apiClient`
- [ ] Add `onError` to upload/delete
- [ ] Resolve export naming collision with useRecords

**useMetadata.js**
- [ ] Migrate from raw `fetch()` to `apiClient`
- [ ] Remove hardcoded `/api/v1/project` URL
- [ ] Remove debug logs (lines 131, 158, 185)

**useTheme.js**
- [ ] Memoize `getActiveTheme()` and `isDark()` with `useMemo`
- [ ] Remove deprecated `addListener`/`removeListener` fallback

**useScrollDirection.js**
- [ ] Fix useEffect dependency cycle: remove `scrollDirection` and `isScrolled` from deps

---

## 13. DevAdmin & Testing

### GOAL
Development builds include a comprehensive testing and debugging toolkit. 11 test suites cover validation, inheritance, contexts, hooks, API, and workflows. The panel provides state inspection, network monitoring, form debugging, and performance profiling.

### Components & Actions

**DevAdminPanel.jsx**
- [x] Production-ready (excluded from production builds)

**TestRunner.js + 11 test suites**
- [x] All 37 validation rules tested (100% coverage)
- [x] Comprehensive test infrastructure

**All DevAdmin components**
- [x] Production-ready (dev-only)

---

## Summary: BLOCKERS Before Production

| # | Component | Issue | Impact |
|---|-----------|-------|--------|
| 1 | Record.js | `handleSaveEdit` passes wrong param name | Inline editing broken |
| 2 | InheritanceUtils.js | Mutates shared CATEGORY_CONSTRAINTS | Wrong file types for media |
| 3 | Item.js | currentIndex -1 crash | App crash on missing item |
| 4 | VerificationTreeView.jsx | Media records not rendered | Verification incomplete |
| 5 | RoadmapWizard.jsx | Infinite re-render risk | App freeze |
| 6 | InventoryEdit.js | storageTerm init as empty string | React warning |

**Fix these 6 items and the application is production-deployable.** Everything else improves maintainability, UX consistency, and performance but doesn't block core functionality.
