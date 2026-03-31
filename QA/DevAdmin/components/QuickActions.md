# QA Report: QuickActions.jsx
> Path: `src/DevAdmin/components/QuickActions.jsx` | Lines: 887 | Last audit: 2026-03-16

## Meta Description
Comprehensive dev quick-actions panel with 14 action buttons (cache clear, query invalidation, settings reset, localStorage wipe, reload, console logging, memory/network checks, test error, env info copy, test data generator toggle, bulk delete inventories/items, populate report inventories). Includes an action log, environment info table, and embedded TestDataGenerator. The largest dev-admin component at 887 lines.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | High | 17-19 | `Inventory_API()`, `Item_API()`, `Record_API()` are created on every render, potentially instantiating new objects each time | Memoize with `useMemo` or move instantiation outside the component |
| 2 | High | 259-263 | `randomDate` helper can produce invalid dates if `start > end` (when inventory dates are malformed), resulting in `NaN` in date strings | Add a guard: `if (start >= end) return start.toISOString().split('T')[0]` |
| 3 | Medium | 465-466 | Direct `fetch('/api/v1/project/...')` bypasses the app's API layer with no error handling for non-JSON responses | Use the project API hook and handle non-OK responses |
| 4 | Medium | 169-618 | `populateReportInventories` is a 450-line function -- nearly impossible to test or maintain | Decompose into smaller functions: `updateInventoryDates`, `createItemsForInventory`, `createRecordsWithFiles` |
| 5 | Low | 675 | `window.location.reload(true)` -- the `forceReload` parameter is deprecated and ignored in modern browsers | Use `window.location.reload()` without arguments |
| 6 | Low | 621-802 | The `actions` array (14 entries with closures) is recreated on every render | Memoize with `useMemo` or extract static action definitions |

## Quality Score: 4/10
