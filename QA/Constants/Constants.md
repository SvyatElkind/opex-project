# QA Report: Constants.js
> Path: `src/Constants/Constants.js` | Lines: 1250 | Last audit: 2026-03-16

## Meta Description
Monolithic constants file containing all UI text strings (Latvian) for the entire application: Workspace, Project (create/rename/delete/report), Fond, Navigation, Institution, Inventory (create/edit/delete/period-required), Item (create/edit/delete), Record, Calendar, and View Options. Serves as the single source of truth for user-facing labels, placeholders, error messages, and button text.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 1-2 | Duplicate/inconsistent comments: line 1 has `/* --- Worksace Level Constants --- */` (typo "Worksace") and line 2 repeats it with `!---`. | Remove the duplicate and fix the typo to "Workspace". |
| 2 | Low | 32 | `PROJECT_EMPTY_HEADER: "DARI"` contains a special Unicode character (mathematical italic small i). Likely a copy-paste artifact. | Replace with plain ASCII text. |
| 3 | Low | 27 | `PROJECT_ADD_REPORT_BTN: "Pievienot infomāciju par fondu"` -- typo "infomāciju" should be "informāciju". | Fix the typo. |
| 4 | Low | 193-194 | Emoji characters used directly in string constants (`REPORT_INFO_MESSAGE`, `ITEMS_EXIST_INFO_MESSAGE`). Rendering varies across OS/browser. | Consider using icon components instead of emoji for consistent cross-platform rendering. |
| 5 | Low | ~227-231 | `INVENTORY_CONSTANTS.TYPE` and `INVENTORY_CONSTANTS.TERMS` duplicate values already defined in `inventoryConstants.js` (`VVAIS_TYPE_LIST`, `VVAIS_STORAGE_TERM_LIST`). | Import from `inventoryConstants.js` or remove the duplication. |
| 6 | Info | entire file | At 1250 lines the file is very large. Domain-specific constants (project, inventory, item, record) have already been split into separate files. The remaining UI text could follow the same pattern. | Consider splitting remaining UI constants into per-domain files to improve maintainability. |

## Quality Score: 6/10
