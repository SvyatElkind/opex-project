# QA Report: Breadcrumbs.js
> Path: `src/Navigation/components/Breadcrumbs.js` | Lines: 155 | Last audit: 2026-03-16

## Meta Description
Renders a clickable breadcrumb trail reflecting the current navigation hierarchy (project > fond > inventory > item > record). Builds the path from projectData and NavigationContext state, and navigates on click. Uses NAVIGATION_ADDITIONAL_UI constants for Latvian labels and ARIA attributes. Rendered inside ProjectNavigation.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 9-94 | `buildBreadcrumbPath()` is called on every render without memoization, performing multiple `.find()` lookups over inventories, items, and records each time. | Wrap with `useMemo` keyed on `currentInventory`, `currentItem`, `currentRecord`, and `projectData`, or use the context's existing `getCurrentBreadcrumbPath`. |
| 2 | Low | 103-104 | `handleNavigate` dispatches `navigateTo('fond', item.id)` but NavigationContext has no `'fond'` case in its switch statement, making the fond breadcrumb click a no-op. | Either add fond-level navigation support in NavigationContext or remove the fond case from handleNavigate. |
| 3 | Low | 141-142 | The active (last) breadcrumb is still rendered as a clickable `<button>`. Clicking it re-navigates to the current location unnecessarily. | Render the last breadcrumb as a `<span>` or disable the click handler. |

## Quality Score: 8/10
