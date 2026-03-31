# QA Report: CreateItemNavigable.js
> Path: `src/Item/CreateItemNavigable.js` | Lines: 934 | Last audit: 2026-03-16

## Meta Description
CreateItemNavigable.js is a modal form component (rendered via React Portal) for creating new archival items. It features a two-column layout with a navigation sidebar and scrollable content area with six sections (basic info, dates, technical, description, access, related items). The form supports multi-language tag selection, related item linking, preset-based defaults, and a "create and continue" workflow.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | WARNING | 26 | Prop `OnCreate` uses PascalCase instead of camelCase (`onCreate`), violating React naming conventions and potentially confusing it for a component. | Rename to `onCreate` in both the component and parent. |
| 2 | WARNING | 266 | In `resetForm()`, the next item number is calculated as `relativeInventory.last_gv + 1 + itemsCreated + 1`, which adds an extra `+1` beyond `getInitialFormData()` (line 67: `last_gv + 1`). After creating 0 items, reset produces `last_gv + 2`. | Align the formula: should be `last_gv + 1 + itemsCreated` (the +1 already accounts for the next item). |
| 3 | WARNING | 582-588 | Field errors for series_code, title, and language are rendered twice -- once inline next to each field (lines 496, 512, 578) and again in a section-errors block. | Remove the duplicate section-errors block or the inline errors to avoid showing the same error message twice. |
| 4 | WARNING | 405 | `getAllItemsFromProject()` is called during every render (not memoized). If this function is expensive, it causes unnecessary re-computation. | Wrap in `useMemo` or store in a state variable initialized once. |
| 5 | INFO | 3 | Comment "ADDED: For Portal rendering" is a leftover development note. | Remove the comment. |
| 6 | INFO | 367-372 | `handleRelatedSearchBlur` uses `setTimeout(200ms)` to delay dropdown close, which is a common but fragile pattern. | Consider using `onMouseDown` on dropdown items instead of relying on blur timing. |

## Quality Score: 7/10
