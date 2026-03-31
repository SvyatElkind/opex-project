# QA Report: InventoryDelete.js
> Path: `src/Inventory/InventoryDelete.js` | Lines: 172 | Last audit: 2026-03-16

## Meta Description
InventoryDelete.js is a React Portal-based confirmation modal for deleting an inventory. It features a 3-second countdown timer with SVG circular progress animation before executing deletion, a restriction check for report-based inventories (which cannot be deleted), and uses refs to avoid stale callback closures during the countdown. Consumed by `InventoryItem.js`.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | WARNING | 83-119 | When `isDeleting` is true, both the countdown display AND a "processing" spinner/message are shown simultaneously. The spinner with "Gatavo dzēšanu..." is visible even while the countdown is still active, which is misleading. | Show the spinner only when `countdown === 0` (actually executing), not during the entire countdown. |
| 2 | WARNING | 58-77 | All UI text is hardcoded in Latvian directly in JSX instead of using a constants file. | Move to a UI constants object for consistency with other components. |
| 3 | INFO | 36 | Comment "Removed onConfirm from deps" is a leftover code review note. The ref pattern is correct. | Remove or rephrase the comment to explain the ref pattern rationale. |
| 4 | INFO | 36 | The `countdown` dependency in the effect can cause issues if the parent re-renders and resets the component while deleting. | Consider adding a mounted ref to prevent calling `onConfirmRef.current()` after unmount. |

## Quality Score: 7/10
