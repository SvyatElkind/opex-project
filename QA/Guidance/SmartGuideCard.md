# QA Report: SmartGuideCard.jsx
> Path: `src/Guidance/SmartGuideCard.jsx` | Lines: 527 | Last audit: 2026-03-16

## Meta Description
Main guidance card component displaying active roadmap routes with progress indicators, item-grouped validation issues, and navigation shortcuts. Contains a nested `RouteCard` component and a `getRouteValidationGrouped` helper function. Uses accordion-style expansion for routes and integrates with RoadmapContext, NavigationContext, and GuidanceContext.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 14-20 | `stripHtml` creates a new `<textarea>` DOM element on every call to decode HTML entities. In a list of many errors this is expensive. | Cache the textarea element in module scope (create once, reuse), or use a regex-based entity decoder. |
| 2 | Medium | 412 | Operator precedence issue: `warn.id && warn.id.startsWith('ITEM_') || warn.id === 'RECORD_VALIDATION_FAILED'` evaluates as `(warn.id && warn.id.startsWith('ITEM_')) || (warn.id === 'RECORD_VALIDATION_FAILED')`. Works by accident when `warn.id` is falsy, but is fragile and misleading. | Add explicit parentheses: `(warn.id && (warn.id.startsWith('ITEM_') || warn.id === 'RECORD_VALIDATION_FAILED'))`. |
| 3 | Medium | 519-521 | `result.itemGroups` is truncated to first 10 entries silently. Users with more than 10 items with issues get no UI indication that additional issues exist. | Show a "and N more items with issues" message in the UI. |
| 4 | Low | 45-49 | `useWorkflowState` is called with `routes[0] || null`, only using the first route. If the project has multiple routes with different configurations, only the first influences the export-readiness check. | Clarify whether this is intentional or should consider all active routes. |
| 5 | Low | 153-358 | `RouteCard` is defined as a component inside the same file but is not memoized. It re-renders on every parent state change. | Extract `RouteCard` to its own file or wrap with `React.memo`. |

## Quality Score: 7/10
