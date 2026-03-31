# QA Report: useAppSettings.js
> Path: `src/hooks/useAppSettings.js` | Lines: 45 | Last audit: 2026-03-16

## Meta Description
Custom React hook that applies application-wide display settings (font size and compact view) to the document root element via CSS classes. It reads from the shared SettingsContext and returns the current fontSize, compactView, and showBreadcrumbs values for downstream consumption.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 26 | User-controlled `settings.fontSize` is interpolated directly into a class name (`font-size-${settings.fontSize}`). No validation ensures the value is one of the expected options. | Validate `fontSize` against an allowlist (`['small', 'medium', 'large']`) before calling `classList.add`. |
| 2 | Low | 22-27 | When `settings.fontSize` is falsy (e.g., `undefined` on first load), existing font-size classes are not removed, potentially leaving stale classes from a previous session. | Move the `classList.remove` call outside the `if` block so stale classes are always cleaned up regardless of the current value. |
| 3 | Info | 15, 44 | Both a named export and a default export point to the same function. This can lead to inconsistent import styles across the codebase. | Pick one export style and use it consistently. |

## Quality Score: 8/10
