# QA Report: QuickJump.js
> Path: `src/Navigation/components/QuickJump.js` | Lines: 343 | Last audit: 2026-03-16

## Meta Description
Search/jump-to dropdown component that flattens the entire project hierarchy (inventories, items, records) into a searchable list with extended search fields (including file names). Filters results by label, extraInfo, and searchFields. Limits display to 25 items. Manages open/close state, outside-click dismissal, body class toggling, and keyboard (Escape) handling.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 309-316 | The "more results" indicator re-runs the full filter logic inline in JSX (`.filter(...).length > 25`), duplicating the computation already done for `filteredItems`. | Store the unsliced filtered count in a variable and reference it, avoiding a second O(n) pass. |
| 2 | Low | 26-27 | `parseInt(a.number) - parseInt(b.number)` can produce NaN for non-numeric inventory numbers, breaking sort order. | Use `(parseInt(a.number) || 0) - (parseInt(b.number) || 0)` as a fallback. |
| 3 | Low | 184-195 | `document.body.classList.add('dropdown-open')` is a global side effect that could conflict with other components manipulating body classes. | Use a more specific class name (e.g., `quickjump-dropdown-open`) or manage via a shared UI context. |
| 4 | Low | 211-216 | Keyboard handling only supports Escape. No arrow-key navigation for the dropdown items, limiting keyboard accessibility for screen readers. | Add arrow-up/arrow-down navigation and `aria-activedescendant` for full ARIA listbox compliance. |
| 5 | Low | 245 | `getItemCounts()` is called on every render without memoization. | Wrap in `useMemo` keyed on `quickJumpItems`. |

## Quality Score: 7/10
