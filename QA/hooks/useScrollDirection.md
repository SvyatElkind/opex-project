# QA Report: useScrollDirection.js
> Path: `src/hooks/useScrollDirection.js` | Lines: 56 | Last audit: 2026-03-16

## Meta Description
A scroll-direction detection hook that uses `requestAnimationFrame` for throttled scroll event handling. Tracks whether the user has scrolled past a configurable threshold and whether they are scrolling up or down. Uses refs to avoid unnecessary re-renders and only updates state when the direction or scrolled state actually changes. Well-optimized implementation.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 14 | `window.pageYOffset` is deprecated in favor of `window.scrollY`. While still widely supported, it may be removed in future browser versions. | Replace `window.pageYOffset` with `window.scrollY`. |
| 2 | Info | 3 | `threshold` parameter defaults to 100 (pixels) but there is no JSDoc or documentation explaining the unit or behavior. | Add a brief JSDoc comment documenting the parameter. |
| 3 | Info | 3 | Only a default export is provided, while other hooks in the codebase use named exports alongside defaults. Minor inconsistency. | Add a named export alongside the default for consistency. |

## Quality Score: 9/10
