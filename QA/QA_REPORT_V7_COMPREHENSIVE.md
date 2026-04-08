# OPEX Frontend — Comprehensive QA Report V7

> **Date:** 2026-04-02 | **Branch:** `frontend-dev` | **Auditor:** Claude Opus 4.6
> **Scope:** Full codebase re-audit + component production goals + architectural improvements

---

## Executive Summary

After reviewing all 12 existing QA documents, 90+ per-component audit reports, and performing a fresh code audit of the current `frontend-dev` branch, this report expands on previous findings with:

1. **Verified bugs** still present in the codebase
2. **Per-component production goals** — what each component needs to be production-ready
3. **Architectural improvements** for code quality, readability, and logic
4. **A production readiness checklist** with clear priorities

### Current State

| Metric | Value |
|--------|-------|
| Previous QA rounds | V1–V6 (93→48→7→3→0→2 issues) |
| Issues fixed to date | ~100 |
| **New issues found (this audit)** | **14** |
| Known issues from V6 (still open) | **2** |
| Known limitations | **3** (low severity) |
| Architectural debt items | **17** |

---

## PART 1: VERIFIED BUGS (Still Present)

### BUG-01: Record.js — Inline Edit Parameter Mismatch [HIGH]

**File:** `src/Record/Record.js` lines 427-438
**Status:** CONFIRMED — still broken

The `handleSaveEdit` function passes `data: editFormData` but mutations expect `recordData`:

```javascript
// Line 427-432 — BROKEN (handleSaveEdit)
await updateMediaRecordMutation.mutateAsync({
    projectId, recordId,
    data: editFormData       // ← WRONG: mutation expects "recordData"
});

// Line 302-306 — CORRECT (saveAndNavigateRecord)
await updateMediaRecordMutation.mutateAsync({
    projectId, recordId,
    recordData: editFormData, // ← CORRECT
    recordType: inheritanceInfo.type
});
```

**Impact:** Clicking "Save" on inline record editing silently fails — `recordData` is `undefined` in the mutation.
**Fix:** Change `data:` to `recordData:` on lines 431 and 437. Add `recordType: inheritanceInfo.type` for media records.

### BUG-02: Record.js — Inconsistent `isMedia` vs `isAnyMedia` [HIGH]

**File:** `src/Record/Record.js` lines 293 vs 301, 419 vs 427
**Status:** CONFIRMED

- `saveAndNavigateRecord` (line 293) validates with `inheritanceInfo.isMedia` but dispatches with `inheritanceInfo.isAnyMedia` (line 301)
- `handleSaveEdit` (line 419) validates with `inheritanceInfo.isMedia` but dispatches with `inheritanceInfo.isMedia` (line 427)

**Impact:** Validation may use wrong check for media vs non-media record forms.
**Fix:** Both functions should use `isAnyMedia` consistently for the dispatch conditional, since `isMedia` only covers physical media while `isAnyMedia` covers both electronic and physical.

### BUG-03: InheritanceUtils.js — Mutates Shared CATEGORY_CONSTRAINTS [HIGH]

**File:** `src/Utils/InheritanceUtils.js` lines 388-400
**Status:** CONFIRMED — still present

```javascript
const constraints = CATEGORY_CONSTRAINTS[category]; // Direct reference, NOT a copy
// Lines 396-399 mutate the shared object:
constraints.acceptedFileTypes = mediaSubtype.acceptedFileTypes;
constraints.acceptAttribute = mediaSubtype.acceptAttribute;
constraints.icon = mediaSubtype.icon;
```

**Impact:** First call to `getInheritanceInfo()` for an electronic media inventory permanently mutates the global `CATEGORY_CONSTRAINTS` object. Subsequent calls for different media types may return stale/wrong file types.
**Fix:** `const constraints = { ...CATEGORY_CONSTRAINTS[category] };` — shallow copy before mutation.

### BUG-04: InventoryEdit.js — storageTerm Initialization [LOW]

**File:** `src/Inventory/InventoryEdit.js` line 81
**Status:** CONFIRMED from V6

`storageTerm` initialized as `''` (empty string) instead of `null` when not found in constants list. React-select with `value=""` may cause controlled component warnings.
**Fix:** Initialize as `null` when not found.

---

## PART 2: NEW ISSUES FOUND

### NEW-01: Item.js — currentIndex Crash on Missing Item [CRITICAL]

**File:** `src/Item/Item.js`
**Issue:** When `inventoryItems.find()` returns no match, `currentIndex` is `-1`. Accessing `inventoryItems[-1]` returns `undefined`, causing crashes when rendering `.number` in the pagination header.
**Fix:** Guard with `if (currentIndex === -1) return <ItemNotFoundPopup />`.

### NEW-02: Item.js — parseInt Missing Radix [MEDIUM]

**File:** `src/Item/Item.js` line 337
```javascript
const targetItem = inventoryItems.find(i => i.number === parseInt(jumpToNumber));
```
**Fix:** `parseInt(jumpToNumber, 10)`

### NEW-03: Record.js — Missing `inheritanceInfo.isAnyMedia` in Dependency Array [MEDIUM]

**File:** `src/Record/Record.js` line 319
The `saveAndNavigateRecord` callback references `inheritanceInfo.isAnyMedia` (line 301) but the dependency array only includes `inheritanceInfo.isMedia`. Stale closure bug.
**Fix:** Add `inheritanceInfo.isAnyMedia` to the dependency array.

### NEW-04: Sidebar.js — Dead Component [LOW]

**File:** `src/Navigation/components/Sidebar.js`
The component destructures non-existent NavigationContext values (`currentProject`, `sidebarOpen`) and always returns `null`. Dead code.
**Fix:** Remove or rewrite.

### NEW-05: RoadmapWizard.jsx — Potential Infinite Re-render Loop [HIGH]

**File:** `src/Roadmap/RoadmapWizard.jsx`
`updateField` callback used in useEffect dependency array but not wrapped in `useCallback`. Each render creates a new function reference, triggering the effect again.
**Fix:** Wrap `updateField` in `useCallback` or remove from dependency array.

### NEW-06: VerificationTreeView.jsx — Media Records Never Rendered [MEDIUM]

**File:** `src/Verification/VerificationTreeView.jsx`
Electronic media items have records in `photo_records`/`video_records`/`audio_records` arrays, but the tree view only renders `item.records`. Media items appear empty in the verification tree.
**Fix:** Check category and render the appropriate record array.

### NEW-07: SmartGuideCard.jsx — Operator Precedence Bug [MEDIUM]

**File:** `src/Guidance/SmartGuideCard.jsx`
Validation warning check has an operator precedence issue where the logical OR doesn't group correctly with the AND, leading to incorrect filtering of warnings.
**Fix:** Add explicit parentheses.

### NEW-08: RecordsList.js — Batch Delete Errors Swallowed [MEDIUM]

**File:** `src/Record/RecordsList.js`
When batch-deleting records, individual delete failures are caught but not surfaced to the user. Failed deletions silently skip.
**Fix:** Collect errors and display summary toast after batch operation.

### NEW-09: QuickJump.js — Heavy Computation Without Memoization [LOW]

**File:** `src/Navigation/components/QuickJump.js` lines 23-136
Filtering and mapping operations run on every render without `useMemo`.
**Fix:** Wrap computation in `useMemo` keyed on `projectData`.

### NEW-10: NavigationContext.js — getAllRecordsFromProject Unmemoized [LOW]

**File:** `src/Navigation/context/NavigationContext.js` lines 278-311
Flattens entire project tree on every call with no memoization. O(n) operation run repeatedly.
**Fix:** Memoize with `useMemo` or `useCallback`.

---

## PART 3: COMPONENT PRODUCTION GOALS

Each component needs to meet these criteria for production readiness:

### 3.1 Project Management

| Component | Current State | Production Goal |
|-----------|--------------|-----------------|
| **Project.js** | Functional, has dead state vars | Remove `activeDataVisable`, `activeProjectVisable`, `tooltip*` dead state. Fix `toastParagrapth` typo. |
| **ProjectDetails.js** | Working | Remove debug `console.log(activeProjectData)` |
| **UploadPopup.js** | Working, memory leak risk | Store `setInterval` ID in ref, clear in useEffect cleanup. Replace `JSON.stringify(result)` error display. |
| **WarningPopup.js** | Working | Remove `console.log(projectdata)` |

**Production Goal:** Project lifecycle (create → import → manage → delete) works without console noise, dead state, or memory leaks.

### 3.2 Institution

| Component | Current State | Production Goal |
|-----------|--------------|-----------------|
| **Institution.js** | Working | Fix Latvian typo `"Uzskaietes"` → `"Uzskaites"` |
| **InstitutionSignersPopup.jsx** | Working | Clean, production-ready |

**Production Goal:** Institution signers flow complete with correct Latvian text.

### 3.3 Inventory Management

| Component | Current State | Production Goal |
|-----------|--------------|-----------------|
| **Inventories.js** | Working, console noise | Remove debug `console.log` at lines 100, 108, 111 |
| **InventoryCreate.js** | Working | Remove debug logs. Memoize `Utils()` call. |
| **InventoryEdit.js** | BUG-04 present | Fix storageTerm init. Remove debug logs. |
| **InventoryItem.js** | Dead state | Remove unused `invDetails` state. Remove debug logs lines 72-73. |
| **InventoryPeriodPopup.js** | Working | Remove unnecessary `handleOverlayClick` wrapper |
| **InventoryDelete.js** | Working | Clean |

**Production Goal:** Full inventory CRUD with limited/full editing modes. Zero console noise. All forms validate correctly. VVAIS-imported inventories are properly locked.

### 3.4 Item Management

| Component | Current State | Production Goal |
|-----------|--------------|-----------------|
| **Items.js** | Working, large file | Extract `renderCombinedView()` / `renderSegmentedView()` duplication (~600 lines shared). Remove 20+ console.log statements. |
| **Item.js** | NEW-01 crash bug | Fix currentIndex crash. Fix parseInt radix. Remove window.confirm/alert() usage. Use ItemDeletePopup consistently. |
| **EditItemNavigable.js** | Working | Verify lazy init pattern. Clean. |
| **CreateItemNavigable.js** | Working | ~80% code overlap with EditItemNavigable — consolidation candidate |
| **ItemDeletePopup.js** | Working | Clean |
| **ItemNotFoundPopup.js** | Working | Remove unnecessary wrapper |

**Production Goal:** Item CRUD with section-based navigation. No crashes on missing items. No alert()/confirm() — use toast/modals. Combined and segmented views work for all 4 categories.

### 3.5 Record Management

| Component | Current State | Production Goal |
|-----------|--------------|-----------------|
| **Record.js** | BUG-01, BUG-02 present | Fix `data` → `recordData` parameter. Fix `isMedia` vs `isAnyMedia`. Fix dependency array. 50+ console statements → 0. |
| **RecordsList.js** | NEW-08 present | Fix batch delete error swallowing. Memoize sort/filter. Fix page reset useEffect. |
| **CreateDocumentRecord.js** | Working | ~95% overlap with EditDocumentRecord — consolidation candidate. Remove debug log line 528. |
| **EditDocumentRecord.js** | Working | Remove debug log line 555. |
| **CreateMediaRecord.js** | Working | Fix race condition on refetch (line 240). Fix error string matching. |
| **EditMediaRecordMetadata.js** | Working | Clean, recently improved |
| **RecordFiles.js** | Working | Fix stale closure in setTimeout (line 277). Use Promise.all for batch delete. Replace alert() with toast. |
| **RecordMetadata.js** | Working | Replace window.confirm with modal. Remove debug logs. |
| **RecordDeletePopup.js** | Working | Clean |
| **RecordValidation.js** | Working | Deduplicate photo/video validation (3x DRY violation). Fix duration.trim() null check. |

**Production Goal:** Full record CRUD for all 4 categories. Inline editing works correctly. Media record two-step workflow (upload → metadata) is seamless. File management (upload, preview, delete, batch) is robust. Zero XSS vectors. Zero console noise.

### 3.6 Navigation

| Component | Current State | Production Goal |
|-----------|--------------|-----------------|
| **NavigationContext.js** | Working, perf issues | Memoize `getAllRecordsFromProject()` and `getAllItemsFromProject()`. |
| **Breadcrumbs.js** | Working | Clean |
| **ProjectNavigation.js** | Working | Replace direct `document.body.style` manipulation with CSS custom property |
| **QuickJump.js** | NEW-09 present | Add useMemo for filtering/mapping |
| **Sidebar.js** | NEW-04 dead code | Remove or rewrite |

**Production Goal:** Context-based navigation works for all hierarchy levels. Back-navigation is category-aware. Breadcrumbs, QuickJump, and sidebar all reflect current state. No dead code.

### 3.7 Verification & Export

| Component | Current State | Production Goal |
|-----------|--------------|-----------------|
| **VerificationModal.jsx** | Working, large (1261 lines) | Extract ExportPopup and OpexPopup to separate files. Fix runValidation useCallback. |
| **VerificationTreeView.jsx** | NEW-06 present | Render media records from type-specific arrays. Fix expandedNodes stale Set. |
| **VerificationSummary.jsx** | Working | Add null check before `.reduce()` |
| **TreeNode.jsx** | Working | Memoize getter functions. Fix record node IDs (use stable keys, not array index). |
| **ErrorPanel.jsx** | Working | Clean (XSS fix applied in V1) |

**Production Goal:** Verification validates ALL entities across ALL 4 categories. Tree view shows accurate hierarchy including media records. Export is blocked until zero errors. All three export types (inventory list, PN akts, OPEX) work for both storage types.

### 3.8 Guidance & Roadmap

| Component | Current State | Production Goal |
|-----------|--------------|-----------------|
| **GuidanceContext.jsx** | Working | Batch 4 localStorage useEffects into one. Wrap localStorage reads in try/catch. |
| **useGuidanceEngine.js** | Well-implemented | Category-aware, round-robin queue. Clean. |
| **useWorkflowState.js** | Working but limited | Binary checklist — doesn't track quantity completion |
| **useNextActions.js** | DEAD CODE | Never imported by any component. Wire into SmartGuideCard or remove. |
| **SmartGuideCard.jsx** | NEW-07 present | Fix operator precedence. Memoize stripHtml. Remove 10-item silent truncation. |
| **RoadmapContext.jsx** | Working | Clean |
| **RoadmapWizard.jsx** | NEW-05 present | Fix infinite re-render risk. Debounce localStorage writes. Extract sub-components. |

**Production Goal:** Guidance system provides actionable, category-aware next steps. useGuidanceEngine replaces useNextActions as the primary guidance brain. SmartGuideCard shows current action with a navigation button. Roadmap tracks per-inventory progress. No dead code.

### 3.9 Settings

| Component | Current State | Production Goal |
|-----------|--------------|-----------------|
| **Settings.jsx** | Working | Replace alert() with toast (lines 29, 34) |
| **SettingsContext.jsx** | Working | Remove debug log line 77 |
| **DisplaySettings.jsx** | Working | Replace alert() with toast (lines 16, 19, 29) |

**Production Goal:** Theme, font size, presets, validation thresholds all persist to localStorage. Import/export settings works. No alert().

### 3.10 API & Services

| Component | Current State | Production Goal |
|-----------|--------------|-----------------|
| **apiClient.js** | Working | Move hardcoded Latvian strings to constants. |
| **errorService.js** | Working | Document expected error shape. Only iterate known error fields. |
| **Constants_API.js** | Working | Clean (still actively used by ConstantsContext) |
| **Legacy API files** | Retained | Migrate remaining usages to apiClient. Mark as deprecated. |

**Production Goal:** All API calls go through apiClient.js with consistent error handling, retry, timeout, and AbortController. Legacy API files are only used by tests/DevAdmin. All mutations have onError handlers with user-facing toast notifications.

### 3.11 Custom Hooks

| Hook | Current State | Production Goal |
|------|--------------|-----------------|
| **useProjects.js** | Working | Add onError to all 7 mutations. Fix projectKeys naming (plural vs singular). |
| **useItems.js** | Working | Migrate hardcoded query keys to QUERY_KEYS. |
| **useInventories.js** | Working | Remove local `inventoryKeys` factory (use QUERY_KEYS). Remove debug logs. Add onError to create/delete. |
| **useInstitutions.js** | Working | Add onError handlers. Migrate hardcoded keys. |
| **useRecords.js** | Working | Fix Content-Type header removal for FormData. Add onError to all 10 mutations. |
| **useFiles.js** | Working | Migrate from raw fetch to apiClient. Add onError. Fix export collision with useRecords. |
| **useMetadata.js** | Working | Migrate from raw fetch to apiClient. Remove hardcoded URL. Remove debug logs. |
| **useTheme.js** | Working | Memoize getActiveTheme/isDark. Remove deprecated matchMedia fallback. |
| **useScrollDirection.js** | Working | Fix useEffect dependency cycle (remove scrollDirection/isScrolled from deps). |
| **useAppSettings.js** | Working | Optimize DOM class swapping. |

**Production Goal:** All hooks use apiClient.js. All mutations have onError with toast notification. Query keys are centralized through QUERY_KEYS. No raw fetch() outside apiClient. No debug console statements.

### 3.12 Utils

| Utility | Current State | Production Goal |
|---------|--------------|-----------------|
| **InheritanceUtils.js** | BUG-03 present, 1665 lines | Fix CATEGORY_CONSTRAINTS mutation. Split into domain modules: CategoryUtils, ValidationUtils, StatisticsUtils. |
| **RecordValidation.js** | Working | Deduplicate photo/video validation (3x). Fix duration null check. |
| **FileValidation.js** | Working | Clean |
| **Utils.js** | Working | Refactor from factory function to named exports. Fix `fromatYear` typo. |
| **DateUtils.js / StringUtils.js / ArrayUtils.js** | Working | Clean |
| **PerformanceMonitor.js** | Working | Ensure dispose() clears setInterval. Remove excess console.log (8 instances). |
| **HelpWindow.js** | Working | Replace alert() with toast for popup blocker notification. |
| **CalendarComponent.js** | Working | Replace alert() with inline validation. Fix startDate clearing side effect. |

**Production Goal:** InheritanceUtils split into manageable modules. No mutation of shared constants. All utility functions are pure, exported as named functions. No alert(). Zero console noise.

### 3.13 Constants

| File | Current State | Production Goal |
|------|--------------|-----------------|
| **Constants.js** | 1250 lines, partially migrated | Finish migration to domain-specific files. File should only contain QUERY_KEYS and cross-cutting constants. |
| **Domain constant files** | Working | Ensure no duplication across files (VVAIS_TYPE_LIST, REQUIRE_ANNOTATION_TYPE, etc.) |
| **FallbackConstants.js** | Working | Document sync requirements with backend |
| **validationRules.js** | Working, 37 rules, 100% tested | Clean |
| **uiStrings/*.js** | Working | Clean — good i18n pattern |

**Production Goal:** Constants are organized by domain. No duplication. QUERY_KEYS is the single source of truth for cache keys. UI strings are centralized in uiStrings/.

---

## PART 4: ARCHITECTURAL IMPROVEMENTS

### 4.1 Code Consolidation (High Impact)

| Target | Lines Saved | Effort |
|--------|------------|--------|
| Merge `CreateDocumentRecord` + `EditDocumentRecord` | ~1100 | Medium |
| Merge `CreateItemNavigable` + `EditItemNavigable` | ~800 | Medium |
| Merge `InventoryCreate` + `InventoryEdit` | ~400 | Low |
| Extract `Item.js` combined/segmented view duplication | ~600 | Medium |
| Split `InheritanceUtils.js` (1665 lines) into 4 modules | — | Medium |
| Split `Constants.js` (1250 lines) finish migration | — | Low |

### 4.2 Error Handling Standardization

**Current state:** 21 mutations across 5 hooks have no `onError` handler. Failed operations fail silently.

**Goal:** Every mutation has `onError` that calls `notify.error()` with a user-friendly Latvian message.

| Hook | Mutations Missing onError |
|------|--------------------------|
| useProjects.js | 7 (create, rename, delete, upload, 3x export) |
| useRecords.js | 10 (3x CRUD standard, 3x CRUD media, 3x metadata, batch delete) |
| useFiles.js | 2 (upload, delete) |
| useInventories.js | 2 (create, delete) |
| useInstitutions.js | 2 (update creator, update signer) |

### 4.3 alert()/confirm() Elimination

**Current state:** ~15 instances of native `alert()` / `window.confirm()` across the codebase.

| File | Lines | Replace With |
|------|-------|-------------|
| RecordFiles.js | 183, 237, 323 | Toast notification |
| RecordMetadata.js | 155, 166 | App confirm modal + toast |
| CalendarComponent.js | 172, 185 | Inline validation message |
| Settings.jsx | 29, 34 | Toast notification |
| DisplaySettings.jsx | 16, 19, 29 | Toast notification |
| FormDefaults.jsx | 29, 50, 55, 76 | Toast notification |
| HelpWindow.js | 45 | Toast notification |
| Item.js | (window.confirm for delete) | ItemDeletePopup |

### 4.4 Console Statement Cleanup

**Remaining ~70 console.log/group statements across:**

| File | Count |
|------|-------|
| Item.js | ~15 |
| Items.js | ~20 |
| Project.js | ~7 |
| Constants_API.js | 5 |
| PerformanceMonitor.js | 8 |
| VerificationTreeView.jsx | 2 |
| useMetadata.js | 3 |
| useNextActions.js | 3 |
| Various others | ~7 |

**Goal:** Zero `console.log` in production code. Only `console.error` in genuine error paths.

### 4.5 Query Key Standardization

**Current state:** Mix of hardcoded arrays, local factories, and centralized `QUERY_KEYS`.

| Hook | Key Pattern Used | Should Use |
|------|-----------------|------------|
| useProjects.js | Local `projectKeys` factory | `QUERY_KEYS.projects()` |
| useItems.js | Hardcoded `['project', 'detail', id]` | `QUERY_KEYS.project(id)` |
| useInventories.js | Local `inventoryKeys` factory | `QUERY_KEYS` |
| useInstitutions.js | Hardcoded `['project', 'detail', id]` | `QUERY_KEYS.project(id)` |
| useMetadata.js | Hardcoded URL | `QUERY_KEYS` + apiClient |

### 4.6 API Client Migration

**Files still using raw `fetch()`:**
- `useMetadata.js` — raw fetch with hardcoded URL
- `useFiles.js` — raw fetch for upload/delete
- All `src/API/*.js` files — legacy layer

**Goal:** Only `apiClient.js` makes HTTP requests. Legacy API files are test-only.

---

## PART 5: PRODUCTION READINESS CHECKLIST

### Phase 1: Critical Bug Fixes (Must Fix Before Production)

- [ ] **BUG-01:** Record.js — Fix `data` → `recordData` in handleSaveEdit (line 431, 437)
- [ ] **BUG-02:** Record.js — Fix `isMedia` → `isAnyMedia` consistency
- [ ] **BUG-03:** InheritanceUtils.js — Shallow copy CATEGORY_CONSTRAINTS before mutation
- [ ] **NEW-01:** Item.js — Guard against currentIndex === -1 crash
- [ ] **NEW-05:** RoadmapWizard.jsx — Fix infinite re-render risk

### Phase 2: Data Integrity & Logic (Fix for Correct Behavior)

- [ ] **NEW-03:** Record.js — Fix dependency array (add isAnyMedia)
- [ ] **NEW-06:** VerificationTreeView.jsx — Render media records from correct arrays
- [ ] **NEW-07:** SmartGuideCard.jsx — Fix operator precedence
- [ ] **NEW-08:** RecordsList.js — Surface batch delete errors
- [ ] **BUG-04:** InventoryEdit.js — Fix storageTerm initialization

### Phase 3: Code Quality (Fix for Maintainability)

- [ ] Remove all ~70 console.log/group statements
- [ ] Replace all ~15 alert()/confirm() with toast/modal
- [ ] Remove dead code (Sidebar.js, useNextActions.js if superseded)
- [ ] Remove dead state variables (Project.js, Workspace.js, InventoryItem.js)
- [ ] Fix all typos (toastParagrapth, fromatYear, Uzskaietes, editPopupVisable)
- [ ] Add onError handlers to all 21 mutations

### Phase 4: Architecture (Fix for Long-term Health)

- [ ] Standardize query keys through QUERY_KEYS
- [ ] Migrate useMetadata.js + useFiles.js to apiClient
- [ ] Consolidate Create/Edit form pairs (Document, Item, Inventory)
- [ ] Split InheritanceUtils.js into domain modules
- [ ] Finish Constants.js migration to domain files
- [ ] Add PropTypes or TypeScript to all components

### Phase 5: Polish (Nice to Have)

- [ ] Memoize expensive computations (NavigationContext, QuickJump, TreeNode)
- [ ] Fix useScrollDirection dependency cycle
- [ ] Memoize useTheme computations
- [ ] Upload progress bar (currently spinner only)
- [ ] Debounce RoadmapWizard localStorage writes
- [ ] Extract VerificationModal sub-components to separate files

---

## PART 6: GUIDANCE SYSTEM ASSESSMENT

### What's Working Well

The `useGuidanceEngine.js` is a solid implementation:
- Category-aware (understands all 4 types)
- Round-robin action distribution across inventories
- Correct media record key detection (photo_records, video_records, audio_records)
- Clean progress calculation with weighted phases

### What Still Needs Work

1. **useNextActions.js is dead code** — Never imported. Either wire it into SmartGuideCard or remove it. useGuidanceEngine appears to supersede it.

2. **SmartGuideCard doesn't use useGuidanceEngine's `nav` property** — Actions include navigation targets but the card doesn't call `navigateTo()`. The "Labot Tagad" buttons should navigate to the entity AND open the relevant form.

3. **No session resume** — When user returns, guidance recalculates from scratch. No "continue where you left off" prompt.

4. **No step tracking** — Guidance doesn't know what user has completed vs. what simply exists in data. Can't distinguish "user added this" from "VVAIS import created this."

5. **Roadmap guided/expert mode unused** — `mode` field exists but both modes show identical UI.

### Recommended Priority

| Priority | Action | Impact |
|----------|--------|--------|
| P0 | Wire navigation actions to `navigateTo()` | High — actions become clickable |
| P0 | Remove or integrate useNextActions.js | Code cleanliness |
| P1 | Add session resume from lastActiveEntity | High UX improvement |
| P1 | Per-inventory progress display | Medium UX improvement |
| P2 | Implement guided mode step-by-step wizard | Medium UX improvement |
| P3 | Backend persistence for workflow state | Long-term value |

---

## PART 7: OVERALL ASSESSMENT

### Strengths

1. **Comprehensive validation** — 37 rules covering all entity levels, 100% tested
2. **Category system** — InheritanceUtils correctly drives all behavior from inventory type+electronic
3. **useGuidanceEngine** — Well-designed category-aware work queue
4. **DevAdmin panel** — 10-tab development toolkit with built-in test suites
5. **Toast/notification system** — Proper notification architecture replacing native dialogs
6. **Latvian localization** — UI strings organized in uiStrings/ directory
7. **Constants architecture** — Domain-specific constant files, centralized validation rules
8. **API client** — Retry, timeout, abort, error parsing all well-implemented

### Weaknesses

1. **Inline record editing is broken** (BUG-01) — highest priority fix
2. **~70 console statements** remain in production paths
3. **~15 native alert()/confirm()** calls break UX consistency
4. **21 mutations with no onError** — failures are silent
5. **Large files** — InheritanceUtils (1665 lines), Constants (1250 lines), VerificationModal (1261 lines), Item (1336 lines)
6. **Code duplication** — Create/Edit form pairs share 80-95% code
7. **Dead code** — Sidebar.js, useNextActions.js, multiple dead state variables
8. **No PropTypes/TypeScript** — refactoring is error-prone

### Production Readiness Rating

| Area | Score | Blocker? |
|------|-------|----------|
| Core workflow (create→manage→export) | 8.5/10 | BUG-01 blocks inline editing |
| Data integrity | 9/10 | BUG-03 can cause wrong file types |
| Security (XSS) | 10/10 | All dangerouslySetInnerHTML fixed |
| Error handling | 6/10 | 21 silent mutations |
| Code quality | 7/10 | Console noise, dead code, duplication |
| UX consistency | 7/10 | alert()/confirm() still present |
| Performance | 8.5/10 | Some unmemoized expensive operations |
| Accessibility | 6/10 | No focus traps, limited keyboard support |
| Test coverage | 9/10 | 37/37 validation rules, 11 test suites |
| Documentation | 9.5/10 | Excellent QA docs, architecture, user guide |
| **OVERALL** | **8.0/10** | **Fix Phase 1 bugs for production** |

### Verdict

The application is **near production-ready**. Phase 1 (5 bug fixes) is the minimum required before deployment. Phase 2 (5 logic fixes) should follow within the first sprint. Phase 3 (code quality) is important for maintainability but not a deployment blocker.

The guidance system's `useGuidanceEngine` is a strong foundation. The main gap is connecting its output to actual navigation — making the "do this next" buttons navigate and open the right form. This would transform the guidance from a passive dashboard into an active workflow conductor.
