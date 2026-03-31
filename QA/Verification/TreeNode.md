# QA Report: TreeNode.jsx
> Path: `src/Verification/TreeNode.jsx` | Lines: 378 | Last audit: 2026-03-16

## Meta Description
Generic tree node component used by VerificationTreeView for rendering inventory, item, record, and file nodes. Displays entity metadata (type icon, label, date range, counts, storage type, OPEX readiness badge), validation status indicators, error/warning buttons that open the error panel, and a navigate button. Contains extensive helper functions for label formatting, date formatting, and count computation.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 85-86 | `const itemNumber` and `const itemTitle` declared inside a `case` block without braces. This can cause linting errors regarding lexical declarations in case clauses in strict ESLint configs. | Wrap the `case 'item':` block body in braces `{ }`. |
| 2 | Low | 163-169 | `formatDateDDMMYYYY` creates a `new Date(dateString)` without validating the result. Invalid date strings produce `NaN` values that render as `NaN.NaN.NaN`. Also, dates like `"2025-01-15"` parsed as UTC midnight will display as the previous day in UTC+2/+3 timezones. | Check `isNaN(date.getTime())` and return a fallback. Consider timezone-safe parsing. |
| 3 | Low | 172-176 | `formatYear` has the same missing date validation issue. | Add date validity check. |
| 4 | Low | 5-24 | `STATUS_ICONS` defines `bgColor` for each status but no code in this file uses `bgColor`. | Remove unused properties or use them in inline styles. |
| 5 | Low | 47-53 | `getLevelIcon` only handles `'inventory'` and returns `null` for all other levels. The function is more complex than needed. | Simplify to a ternary or add a comment explaining why only inventory has a level icon. |
| 6 | Low | 211-217 | `formatFileSize` is duplicated here and in VerificationModal. | Extract to a shared utility module. |

## Quality Score: 7/10
