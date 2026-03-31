# QA Report: Item.js
> Path: `src/Item/Item.js` | Lines: 1336 | Last audit: 2026-03-16

## Meta Description
Item.js is the main detail view component for a single archival storage unit (GV). It supports two rendering modes -- a "combined view" for electronic media (photo/video/audio) and a "segmented view" for documents -- with item pagination, jump-to navigation, keyboard navigation (ArrowLeft/ArrowRight to move between items), record management, and modals for create/edit/delete operations. It relies heavily on `InheritanceUtils` for UI configuration based on inventory type.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | CRITICAL | 1172-1174 | `inventoryItems[currentIndex]` can be undefined if `currentIndex` is -1 (item not found in inventory), causing a runtime crash when accessing `.number` in the pagination header. | Add a guard: `if (currentIndex === -1) return null;` or display an error state before rendering the pagination header. |
| 2 | WARNING | 326 | `window.confirm` used for media record delete confirmation instead of the custom `ItemDeletePopup` component used elsewhere, creating inconsistent UX. | Replace `window.confirm` with a dedicated confirmation popup for consistency. |
| 3 | WARNING | 272, 349 | `alert()` used for error feedback (`'Neizdevās dzēst vienību'`, `'Neizdevās dzēst ierakstu'`). These are hardcoded Latvian strings and inconsistent with the `GeneralError` component pattern used elsewhere. | Replace `alert()` calls with a proper error state and move strings to constants. |
| 4 | WARNING | 340, 360, 376 | `queryClient.invalidateQueries` called with array syntax which is deprecated in TanStack Query v5. | Use object syntax: `queryClient.invalidateQueries({ queryKey: [...] })`. |
| 5 | WARNING | 386-774, 776-1145 | Massive duplication between `renderCombinedView()` and `renderSegmentedView()` -- the overview sections (basic info, dates, technical, access, annotation, notes, related items) are copy-pasted verbatim (~600 duplicated lines). | Extract shared sections into a reusable sub-component (e.g., `ItemOverviewSections`). |
| 6 | INFO | 1196 | Deprecated `onKeyPress` event handler used. React 17+ recommends `onKeyDown`. | Replace `onKeyPress` with `onKeyDown`. |
| 7 | INFO | 460, 468, 476, etc. | Inline styles (`style={{ display: 'flex', ... }}`) repeated dozens of times across segment content divs. | Move the repeated flex layout style to a CSS class. |
| 8 | INFO | 13-14 | `useRecord` imported from `'../hooks/useRecords'` which is already imported on line 12. The two import lines can be merged. | Combine into a single import statement. |

## Keyboard Navigation (ArrowLeft / ArrowRight)
- **Lines 106-147**: Keyboard handler for navigating between items using ArrowLeft (previous) and ArrowRight (next) keys.
- When the **edit modal is open** (`showEditItem`): triggers save via `editItemRef` (useImperativeHandle). If save succeeds, closes the modal and navigates. If validation fails, errors are shown in the modal and navigation is blocked.
- When **not editing**: navigates directly to the adjacent item.
- Only blocked when other modals are open (create record, edit metadata, delete popup, etc.) or an input element is focused.
- Reuses the existing `prevItem`/`nextItem` sibling data already computed for the pagination buttons.

## Edit Modal Navigation
- **Lines 149-165**: `handleEditNavigate` callback passed to `EditItemNavigable` as `onNavigate`. Closes the edit modal, navigates to the target item, and sets `reopenEditRef` flag so the edit modal reopens for the new item.
- Passes `prevItem`/`nextItem` and `onNavigate` to `EditItemNavigable` for prev/next button rendering in the modal header.

## Quality Score: 5/10
