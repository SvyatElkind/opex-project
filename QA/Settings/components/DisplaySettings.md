# QA Report: DisplaySettings.jsx
> Path: `src/Settings/components/DisplaySettings.jsx` | Lines: 201 | Last audit: 2026-03-16

## Meta Description
Display settings tab component providing theme selection (light/dark/auto), font size, compact view toggle, breadcrumb visibility, items-per-page, and settings management (import/export/reset). In development mode, renders a button to open the DevAdminPanel via custom event dispatch.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 17, 31 | `window.location.reload()` is called after import and reset, discarding any unsaved changes and providing jarring UX | Update React state in-place rather than forcing a full page reload |
| 2 | Low | 16 | `alert('... Iestatijumi veiksmigi importeti!')` uses native blocking alert with emoji | Replace with Toast notification |
| 3 | Low | 19 | `alert('... Kluda importejot iestatijumus')` uses native alert for error display | Use the app's error display components |
| 4 | Low | 29 | `alert('... Iestatijumi atiestatiti!')` uses native alert for reset confirmation | Replace with Toast notification |
| 5 | Low | 136-153 | Inline styles for button layout (`display: 'flex', gap, flex, marginBottom`) | Extract to CSS classes for maintainability |

## Quality Score: 6/10
