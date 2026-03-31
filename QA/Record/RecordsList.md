# QA Report: RecordsList.js
> Path: `src/Record/RecordsList.js` | Lines: 714 | Last audit: 2026-03-16

## Meta Description
Records list component with table and card views, search, filtering, sorting, pagination, column visibility controls, and batch delete. Supports both internal state and externally-controlled state for embedding in parent tabs. Uses `useSettings` for per-page count and date formatting. Delegates delete confirmation to RecordDeletePopup.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 236-239 | `handleConfirmBatchDelete` catch block silently swallows the error — user gets no feedback on failure | Display an error message via toast or inline error |
| 2 | Low | 155-158 | `new Date(aVal || 0)` for date sorting — `new Date(0)` is 1970-01-01, which sorts empty dates unpredictably | Use `Infinity` / `-Infinity` or handle nulls explicitly before comparison |
| 3 | Low | 177 | `useEffect` depends on `processedRecords.length` — resets page even when length stays the same but content changes | Consider using a stable key derived from filter/sort params |
| 4 | Low | 627 | View toggle uses emoji characters (`'⊞'`, `'☰'`) which may render inconsistently across platforms | Use Font Awesome icons consistent with the rest of the UI |
| 5 | Low | 102-103 | `columnButtonRef` and `columnPopupRef` use `React.useRef` instead of the imported `useRef` | Use the destructured import for consistency |

## Quality Score: 7/10
