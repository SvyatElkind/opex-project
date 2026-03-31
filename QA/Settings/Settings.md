# QA Report: Settings.jsx
> Path: `src/Settings/Settings.jsx` | Lines: 108 | Last audit: 2026-03-16

## Meta Description
Modal settings panel rendered via `ReactDOM.createPortal` to `document.body`. Contains a tabbed interface (Display, Forms, Validation) with local state for unsaved changes, a save/cancel footer with unsaved-changes confirmation, and overlay click-to-close behavior.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 29 | `alert('... Iestatijumi saglabati!')` uses a blocking browser alert for save confirmation | Replace with the app's Toast component or an inline success message |
| 2 | Medium | 12 | `localSettings` is initialized from `settings` once; if context settings change externally while the modal is open, local state becomes stale | Re-sync `localSettings` when the modal opens via `useEffect` keyed on `settings` |
| 3 | Low | 74-79 | `FormDefaults` receives no `settings`/`onChange` props unlike the other tabs -- it uses `useSettings()` directly, creating an inconsistent data flow pattern | Either pass props consistently to all tabs or have all tabs use context directly |
| 4 | Low | 43 | Clicking the overlay calls `handleCancel` which may show a confirm dialog -- potentially unexpected UX for overlay click | Consider closing without confirmation on overlay click, or add a visual hint |

## Quality Score: 7/10
