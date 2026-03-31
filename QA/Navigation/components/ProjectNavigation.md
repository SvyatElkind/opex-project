# QA Report: ProjectNavigation.js
> Path: `src/Navigation/components/ProjectNavigation.js` | Lines: 75 | Last audit: 2026-03-16

## Meta Description
Top-level navigation header component that composes Breadcrumbs and QuickJump. Implements sticky scroll behavior with a throttled scroll listener using requestAnimationFrame. Directly manipulates `document.body.style.paddingTop` to prevent content jump when the header becomes fixed.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 64 | `useEffect` depends on `isScrolled` and `navigationHeight`, which means the scroll handler is re-registered every time the scroll state toggles. This tears down and re-adds the listener on each scroll state change, defeating the throttle purpose. | Extract `isScrolled` and `navigationHeight` into refs so the effect dependency array can be `[]`, registering the listener only once. |
| 2 | Low | 28-34 | Direct DOM manipulation (`document.body.style.paddingTop`, `classList.add/remove`) bypasses React's rendering model. | Consider using CSS `position: sticky` or a state-driven className on a wrapper element to avoid manual padding. |
| 3 | Low | 7-8 | `selectedProject` prop is destructured but never used in the component. | Remove the unused prop from the destructuring. |

## Quality Score: 7/10
