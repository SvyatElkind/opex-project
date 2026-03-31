# QA Report: InventoryItem.js
> Path: `src/Inventory/InventoryItem.js` | Lines: 144 | Last audit: 2026-03-16

## Meta Description
InventoryItem.js is a container component that renders a single inventory's header (number, date range, badges for type/electronic/subfond/storage term/item count) and its child Items table. It provides edit and delete actions, hides the header when the user is viewing an individual item detail, and delegates item rendering to the `Items` component.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | WARNING | 83-98 | Heavy use of inline styles for header layout (`style={{ display: 'flex', alignItems: 'center', gap: '12px' }}`) and favorite button (`style={{ fontSize: '20px', ... }}`). | Move inline styles to CSS classes for consistency and maintainability. |
| 2 | WARNING | 24-27 | `handleDelete` is a trivial wrapper that just calls `onDelete()`. Adds no logic. | Call `onDelete` directly in the `onClick` handler. |
| 3 | INFO | 55-62 | `formatDate` function defined inside the component but never called. Dead code. | Remove the unused function. |
| 4 | INFO | 32-53 | `formatInventoryDateRange` is defined inside the component body, causing recreation on every render. It is a pure function with no state dependency. | Move outside the component or to a utility module. |
| 5 | INFO | 120 | `inventory.subfond > 0` uses implicit coercion -- `subfond` may be a string "0" from the API. `"0" > 0` is false in JS so it works, but is fragile. | Use explicit conversion: `Number(inventory.subfond) > 0`. |

## Quality Score: 7/10
