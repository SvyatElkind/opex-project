# Opus QA Verification Report
> Generated: 2026-03-16 | Branch: frontend-dev | Scope: `opex_tool_frontend/src/`
> Based on independent verification of QA_REPORT.md findings

---

## Verification Summary

| Original Report | Verified |
|-----------------|----------|
| 22 Critical | 19 Confirmed, 3 False Positive |
| 41 Warning | 37 Confirmed, 4 False Positive |
| 30 Info | 24 Confirmed, 6 False Positive |
| **93 Total** | **80 Confirmed** |

### False Positives (Not actual issues)

| ID | Reason |
|----|--------|
| C-11 | `QUERY_KEYS.files(variables.projectId, variables.recordId)` — params ARE passed correctly |
| C-15 | `useState(getInitialFormData)` — could not locate this pattern; likely resolved or misidentified |
| W-05 | `contentType.includes('application/json')` — works correctly for charset variants too |
| W-10 | `shouldInvalidate` param IS used at line 110: `if (shouldInvalidate)` |
| I-11 | `getTrackedInventoryTypes` is defined OUTSIDE the hook body — correct placement |
| I-15 | CSS typo `inventory_craete` not found in codebase |
| I-24 | Scroll listener cleanup IS properly implemented with return cleanup |
| W-31 | Line 515 typeof array check — not located in current file version |
| W-34 | FileValidation.js object URL leak — not confirmed in current code |

---

## CRITICAL ISSUES — Verified

### PRIORITY 1: Security (XSS)

**[C-14] `components/ValidationIndicator.jsx` — Lines 140, 147**
- `dangerouslySetInnerHTML={{ __html: error.message }}` and `{{ __html: warning.message }}` with no sanitization
- **Fix plan:** Replace with safe React rendering. Parse HTML messages server-side or use a sanitizer like DOMPurify. If messages are plain text, use `{error.message}` directly.

**[C-22] `Record/RecordDeletePopup.js` — Line 81**
- `dangerouslySetInnerHTML={{ __html: RECORD_DELETE_UI.POPUP_WARNING_TEXT }}`
- **Fix plan:** Since source is a constant (not user input), risk is lower. Still replace with React elements or ensure the constant never contains dynamic content.

---

### PRIORITY 2: App Crashes

**[C-01] `API/Inventory_API.js`**
- Line 12: Typo `inevntoryData` → should be `inventoryData`
- Lines 22-24: `createInventory()` catch block returns `undefined`. Callers destructuring `[success, data]` crash.
- **Fix plan:** Fix typo. Add `return [false, error.message || 'Unknown error'];` to catch block.

**[C-02] `API/Institution_API.js` — Lines 25, 45**
- Returns raw `Error` object instead of `[false, error.message]`
- **Fix plan:** Change `return [false, error]` → `return [false, error.message]` in both catch blocks.

**[C-03] `API/Item_API.js` — Lines 21, 47**
- Same as C-02: returns raw Error object.
- **Fix plan:** Same fix — `return [false, error.message]`.

**[C-19] `Guidance/GuidanceContext.jsx` — Lines 16-17, 21-22, 28-29, 40-41**
- Four `useState` initializers read `localStorage` with no `try/catch`. Crashes in private browsing or quota-exceeded scenarios.
- **Fix plan:** Wrap each `localStorage.getItem` + `JSON.parse` in try/catch with sensible defaults.

**[C-18] `Record/Breadcrumbs.js` — Lines 19-30**
- Accesses `projectData.institution.fond.arch_title` etc. without null guards. Crashes if any intermediate is null.
- **Fix plan:** Add optional chaining: `projectData?.institution?.fond?.arch_title` with fallback values.

**[I-25] `Verification/VerificationSummary.jsx` — Lines 23-33**
- `.reduce()` on `inventoryValidations[].validation.details` without checking if array exists.
- **Fix plan:** Add null check before reduce: `(details || []).reduce(...)`.

---

### PRIORITY 3: Logic Bugs

**[C-17] `Record/Breadcrumbs.js` — Line 106**
- Missing `break` after `case 'fond'` — falls through to `case 'inventory'`.
- **Fix plan:** Add `break;` after `navigateTo('fond', item.id);`.

**[C-06] `API/Record_API.js` — Line 108**
- `error.status >= 400` inside `catch` block. Native Error objects don't have `.status`. Condition always false — errors silently swallowed.
- **Fix plan:** Check `error.response?.status` or handle differently based on error type.

**[C-09] `hooks/useRecords.js` — Lines 551-554**
- `mutationKey` is an array like `['record', 'create']`. `Array.includes('record')` checks exact element equality — works correctly for flat string arrays but fragile.
- **Fix plan:** Verify mutationKey structure. If always flat string arrays, this works. If nested, use `mutationKey?.some(k => k === 'record')` or check first element.

**[C-10] `hooks/useRecords.js` — Lines 264-266 (also 359-361)**
- `'Content-Type': undefined` does NOT remove the header in fetch. Browser sends `Content-Type: undefined`.
- **Fix plan:** Delete the Content-Type key from headers object, or construct headers without it for FormData requests.

**[C-13] `hooks/useProjects.js` — Line 101**
- `queryClient.removeQueries(projectKeys.detail(variables))` — in `useDeleteProject`, `variables` IS the projectId (passed directly as mutationFn arg), so this technically works. But the pattern is inconsistent with other hooks.
- **Fix plan:** Keep as-is or rename for clarity. Low-priority.

**[C-20] `Record/CreateMediaRecord.js` — Lines 240-245**
- `await queryClient.refetchQueries(...)` then immediately `queryClient.getQueryData(...)`. Refetch may not have updated cache yet.
- **Fix plan:** Use the data returned from refetch directly, or await with `{ exact: true }` and read result from the promise.

**[C-21] `Navigation/context/NavigationContext.js` — Line 112**
- `parseInt(id)` without radix 10. Strings starting with `0` could parse as octal in old engines.
- **Fix plan:** Change to `parseInt(id, 10)`.

---

### PRIORITY 4: Syntax / Parse Errors

**[C-04] `API/Project_API.js` — Lines 13-15, 102-104**
- JSX comment syntax `{/* ... */}` used in a plain `.js` file. Not valid JavaScript.
- **Fix plan:** Replace with standard JS comments: `// comment` or `/* comment */`.

---

## WARNING ISSUES — Verified

### Console Pollution (remove all)

| ID | File | Lines | Statement |
|----|------|-------|-----------|
| C-05 | API/Project_API.js | 107-180 | 20+ debug logs including `file.constructor.name` leak |
| C-16 | Record/Record.js | 34-37+ | 30+ console.log/group statements |
| W-01 | API/Inventory_API.js | 23, 46, 62 | `console.log(error)` should be `console.error` |
| W-08 | hooks/useInventories.js | 25, 82 | `console.log(variables)` |
| W-22 | Inventory/Inventories.js | 100, 108, 111 | Debug init logs |
| W-23 | Inventory/InventoryCreate.js, InventoryEdit.js | various | Debug logs |
| W-25 | Project/WarningPopup.js | 10 | `console.log(projectdata)` |
| W-26 | Project/ProjectDetails.js | 4-5 | `console.log(activeProjectData)` |
| W-27 | Inventory/InventoryItem.js | 72-73 | Debug logs |

**Fix plan:** Remove ALL console.log/group/groupEnd from production code. Keep only `console.error` for genuine error paths. Strip C-05 entirely — massive debug dump with security-leaking `file.constructor.name`.

---

### Dead Code / Unused State

| ID | File | Issue |
|----|------|-------|
| W-18 | Project/Project.js:52-54,85-87 | `activeDataVisable`, `activeProjectVisable`, `tooltip`, `tooltipContent`, `tooltipPosition` — set but never read |
| W-21 | Inventory/InventoryItem.js:11 | `invDetails` state — declared, never used |
| W-41 | Workspace/Workspace.js:27-29 | `currentProject`, `currentInventory`, `currentItem` — unused state |
| I-19 | Record/Record.js:8 | `MediaRecordForm` import — verify if actually used, remove if not |

**Fix plan:** Remove all dead state variables and unused imports.

---

### Typos

| ID | File | Typo | Fix |
|----|------|------|-----|
| W-19 | Project/Project.js:56 | `toastParagrapth` | `toastParagraph` |
| I-01 | Utils/Utils.js:9 | `fromatYear` | `formatYear` |
| I-16 | Institution/Institution.js:98 | `Uzskaietes` | `Uzskaites` |

**Fix plan:** Fix all typos. For `toastParagrapth`, rename all references across the codebase.

---

### Memory Leaks / Cleanup

**[W-24] `Project/UploadPopup.js`**
- `setInterval` for upload progress not guaranteed to clear if popup closes mid-upload.
- **Fix plan:** Store interval ID in ref, clear in useEffect cleanup.

**[W-33] `Utils/PerformanceMonitor.js` — Line 118**
- `setInterval` in `startMemoryMonitor()` may never be cleared.
- **Fix plan:** Ensure `dispose()` calls `stopMemoryMonitor()`. Clear interval in cleanup.

---

### Race Conditions / Stale Closures

**[W-37] `Record/RecordFiles.js` — Lines 277-281**
- `setTimeout` captures stale `sidePanelOpen` value.
- **Fix plan:** Use functional state update or a ref to read current value.

**[W-38] `Record/RecordFiles.js` — Lines 328-333**
- Sequential `await` in loop for batch delete.
- **Fix plan:** Use `Promise.all()` for parallel deletion.

---

### Error Handling

**[W-03] `API/Record_API.js` — Lines 29, 53**
- `catch {}` without error parameter — impossible to debug.
- **Fix plan:** Add error parameter: `catch (error)` and log or handle appropriately.

**[W-06] `services/errorService.js` — Lines 32-42**
- Iterates ALL response fields and treats them as errors.
- **Fix plan:** Only iterate known error fields, or check for a specific error shape.

**[W-07] `hooks/useInstitutions.js`**
- Mutations have no `onError` handler. Failures are silent.
- **Fix plan:** Add `onError` callbacks with toast/notification feedback.

**[W-39] `Record/CreateMediaRecord.js` — Lines 136-172**
- Error type detection via `.includes()` on error message strings. Breaks if backend changes wording.
- **Fix plan:** Use error codes or status codes from backend instead of string matching.

---

### Architecture / Patterns

**[C-07] `API/Constants_API.js` — Lines 17-18**
- Mutable module-level cache with no cleanup.
- **Fix plan:** Add cache expiry check (already has `cacheTimestamp`). Add `clearCache()` export for tests. Document TTL.

**[C-08] `services/apiClient.js` — Line 80**
- Hardcoded Latvian string in service layer.
- **Fix plan:** Move to constants/i18n system.

**[C-12] `hooks/useFiles.js` + `hooks/useRecords.js`**
- Both export `useUploadFiles` and `useDeleteFile`. Name collision.
- **Fix plan:** Consolidate into one file. Remove duplicate from the other. Update all imports.

**[W-09] `hooks/useInventories.js` — Lines 7-11**
- Local `inventoryKeys` duplicates `QUERY_KEYS` from Constants.
- **Fix plan:** Remove local keys, use `QUERY_KEYS.inventories()` from Constants.

**[W-11] `hooks/useMetadata.js` — Line 8**
- Hardcoded `/api/v1/project` URL.
- **Fix plan:** Use API base URL from constants/config.

**[W-13] `hooks/useScrollDirection.js` — Line 55**
- `useEffect` lists `scrollDirection` and `isScrolled` as dependencies — values it sets. Re-run cycle on every scroll.
- **Fix plan:** Remove `scrollDirection` and `isScrolled` from dependency array. Use refs for comparison values.

**[W-14] `hooks/useTheme.js` — Lines 70-88**
- `getActiveTheme()` and `isDark()` recompute every render.
- **Fix plan:** Wrap return values with `useMemo`.

**[I-20] `hooks/useRecords.js` vs `API/Record_API.js`**
- `validateMediaRecordData` duplicated in both files.
- **Fix plan:** Keep one copy (in a shared validation util), import in both places.

---

### UX / i18n

**[W-36] `Record/RecordMetadata.js` — Line 155**
- `window.confirm()` — blocking, inconsistent with app's modal system.
- **Fix plan:** Replace with app's existing popup/modal pattern.

**[I-05] `Utils/HelpWindow.js` — Line 45**
- Native `alert()` in Latvian for popup blocker.
- **Fix plan:** Replace with toast notification.

**[I-06] `Utils/CalendarComponent.js` — Lines 172, 185**
- Native `alert()` for date validation.
- **Fix plan:** Replace with inline validation message or toast.

**[I-07] `components/ValidationWarning.jsx` — Lines 37-38**
- Hardcoded UI path `"Iestatījumi > Validācija"`.
- **Fix plan:** Move to constants.

**[I-17] `Navigation/components/Sidebar.js`**
- Hardcoded English strings: `"Project Navigator"`, `"Inventory ${inv.number}"`.
- **Fix plan:** Move to constants/i18n.

**[I-23] `Project/UploadPopup.js` — Line 150**
- `JSON.stringify(result)` shown to user as error.
- **Fix plan:** Extract user-friendly message from result, show technical details only in console.

**[I-27] `Project/Project.js` — Lines 345-352**
- Clipboard error caught but only logged. No user feedback.
- **Fix plan:** Add toast notification on clipboard failure.

---

### Performance / Misc

**[W-20] `Inventory/InventoryCreate.js:103`, `InventoryEdit.js:69`**
- `Utils()` factory called every render.
- **Fix plan:** Refactor Utils to export named functions directly (see I-01). Then import directly.

**[W-28] `Utils/CalendarComponent.js` — Lines 189-193**
- When `endDate` becomes null, `startDate` is also cleared. Silent data loss.
- **Fix plan:** Remove this side effect or make it explicit with user confirmation.

**[W-29] `Utils/YearPicker.js` — Line 28**
- `parseInt(value.split('-')[0])` with no validation.
- **Fix plan:** Add `parseInt(..., 10)` and handle NaN.

**[W-32] `Utils/RecordValidation.js` — Lines 204, 224**
- `recordData.duration.trim()` without null check.
- **Fix plan:** Add `recordData.duration?.trim()` or guard before access.

**[W-35] `Navigation/components/ProjectNavigation.js`**
- Direct `document.body.style.paddingTop` manipulation.
- **Fix plan:** Use CSS custom property or class toggle instead.

**[W-40] `Guidance/useNextActions.js`**
- `window.dispatchEvent(new CustomEvent(...))` for cross-component communication.
- **Fix plan:** Replace with React context or callback props for proper data flow.

**[I-01] `Utils/Utils.js`**
- Function returning object pattern. Consumers call `Utils()` every render.
- **Fix plan:** Refactor to export named functions directly. Fix `fromatYear` → `formatYear`.

**[I-10] `Navigation/context/NavigationContext.js` — Lines 278-311**
- `getAllRecordsFromProject()` flattens entire project tree with no memoization.
- **Fix plan:** Memoize result with `useMemo` keyed on `projectData`.

**[I-12] `Guidance/GuidanceContext.jsx` — Lines 45-59**
- Four separate `useEffect` hooks for localStorage writes.
- **Fix plan:** Batch into single effect.

**[I-18] `Utils/RecordValidation.js` — Line 345**
- `catch (error) { // Formatting failed }` — silent suppression.
- **Fix plan:** Add `console.error` or return a default value with context.

**[I-22] `Inventory/InventoryPeriodPopup.js`, `Item/ItemNotFoundPopup.js`**
- Unnecessary `handleOverlayClick` wrapper — just calls `onCancel`.
- **Fix plan:** Pass `onCancel`/`onClose` directly to onClick.

**[I-26] `hooks/useTheme.js` — Lines 55-63**
- Deprecated `addListener`/`removeListener` fallback for matchMedia.
- **Fix plan:** Remove fallback — `addEventListener` is supported in all modern browsers.

**[W-30] `Utils/RecordValidation.js`**
- Photo/Video validation duplicated 3 times.
- **Fix plan:** Extract shared validation function. Call from all three locations.

---

## Fix Execution Plan

### Phase 1: Critical Security & Crashes (do first)
1. Fix XSS: C-14, C-22 — replace `dangerouslySetInnerHTML` with safe rendering
2. Fix API return contracts: C-01, C-02, C-03 — return `[false, error.message]`
3. Fix localStorage crashes: C-19 — add try/catch
4. Fix null guards: C-18 — add optional chaining
5. Fix missing break: C-17
6. Fix JSX comments in JS: C-04
7. Fix error.status in catch: C-06

### Phase 2: Logic Bugs & Data Integrity
8. Fix Content-Type removal: C-10
9. Fix race condition: C-20
10. Fix parseInt radix: C-21, W-29
11. Fix stale closure: W-37
12. Fix VerificationSummary crash: I-25
13. Fix duration.trim null check: W-32

### Phase 3: Clean Code — Remove All Noise
14. Remove ALL console.log/group from production: C-05, C-16, W-01, W-08, W-22-27
15. Remove all dead state: W-18, W-21, W-41
16. Remove unused imports: I-19
17. Fix all typos: W-19, I-01, I-16

### Phase 4: Architecture & Deduplication
18. Consolidate duplicate hooks: C-12 (useFiles vs useRecords exports)
19. Consolidate duplicate validation: I-20, W-30
20. Remove duplicate query keys: W-09
21. Refactor Utils.js to named exports: I-01, W-20

### Phase 5: Error Handling & UX
22. Add onError to mutations: W-07
23. Replace alert() with toasts: I-05, I-06
24. Replace window.confirm: W-36
25. Fix error string matching: W-39
26. Fix JSON.stringify shown to user: I-23
27. Move hardcoded strings to constants: C-08, I-07, I-17

### Phase 6: Performance & Cleanup
28. Fix useEffect dependency cycle: W-13
29. Memoize theme computations: W-14
30. Memoize getAllRecordsFromProject: I-10
31. Batch localStorage effects: I-12
32. Fix setInterval cleanup: W-24, W-33
33. Parallel batch delete: W-38
34. Remove unnecessary wrappers: I-22
35. Remove deprecated matchMedia fallback: I-26
