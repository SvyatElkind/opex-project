# QA Report: NavigationContext.js
> Path: `src/Navigation/context/NavigationContext.js` | Lines: 429 | Last audit: 2026-03-16

## Meta Description
Central navigation context provider managing hierarchical navigation state (project > inventory > item > record). Provides navigateTo/navigateBack/navigateBackSmart methods, breadcrumb path building, history tracking, tab state management, and navigation state validation. Heavily depends on InheritanceUtils for enriching entities with inheritance and attention metadata. Exports NavigationProvider and useNavigation hook, consumed by virtually all navigation-aware components.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 10, 46-54 | Navigation history grows unboundedly. Every call to `navigateTo` appends a snapshot with no cap, which can cause memory issues in long sessions. | Add a maximum history length (e.g., 50 entries) and trim oldest entries when exceeded. |
| 2 | Medium | 291-293 | `getItemNumber` depends on `getItemById` in its body but the dependency array is empty `[]`. This is a stale-closure bug -- the function will always use the initial `getItemById` which captures the initial `projectData`. | Add `getItemById` to the dependency array: `[getItemById]`. |
| 3 | Medium | 76-77 | `parseInt(id, 10)` coercion for record IDs silently discards non-numeric strings with no warning. If the ID system changes to UUIDs this will break silently. | Add a `console.warn` when `isNaN(recordId)` rather than returning silently. |
| 4 | Low | 22-24 | Refs (`currentInventoryRef`, `currentItemRef`, `currentRecordRef`) are assigned on every render outside of useEffect. This works but is unconventional. | Document the pattern with a comment explaining it is intentional for callback access. |
| 5 | Low | 325-332 | `getNavigationStats` calls `getAllItemsFromProject()` and `getAllRecordsFromProject()` on every invocation, iterating the full project tree twice. | Memoize the counts or cache the results separately. |
| 6 | Low | 87, 116, 215 | Minor formatting inconsistency: missing space before comma in `},[]);`. | Run a formatter (Prettier) for consistent style. |
| 7 | Low | 56-86 | `navigateTo` switch has no `'fond'` case, but Breadcrumbs dispatches `navigateTo('fond', item.id)`. The fond breadcrumb click silently does nothing. | Add a `'fond'` case or document that fond-level navigation is intentionally a no-op. |

## Quality Score: 7/10
