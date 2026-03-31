# QA Report: useTheme.js
> Path: `src/hooks/useTheme.js` | Lines: 51 | Last audit: 2026-03-16

## Meta Description
A theme management hook that reads the theme preference from SettingsContext and applies it to the document root via a `data-theme` attribute. Supports three modes: `light`, `dark`, and `auto` (follows system preference via `matchMedia`). Returns the resolved `activeTheme` and an `isDark` convenience boolean. Clean implementation with proper cleanup of event listeners.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 13 | When theme is `light`, `removeAttribute('data-theme')` is called but no `data-theme="light"` is set. Components using CSS attribute selectors like `[data-theme="light"]` would not match. | Explicitly set `data-theme="light"` for the light theme to enable CSS attribute selectors if needed. |
| 2 | Info | 12-22 | `applyTheme` is defined inside the `useEffect` body and recreated on every effect run. Not a performance concern at this scale, but extracting it would improve testability. | Extract to module scope if unit testing is desired. |
| 3 | Info | 26-34 | The `matchMedia` listener is only added when `theme === 'auto'`. Cleanup runs correctly when switching away from `auto` due to React's effect lifecycle. No issue; noted for documentation. | No action needed. |

## Quality Score: 9/10
