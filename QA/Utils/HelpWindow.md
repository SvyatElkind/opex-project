# QA Report: HelpWindow.js
> Path: `src/Utils/HelpWindow.js` | Lines: 95 | Last audit: 2026-03-16

## Meta Description
Utility module for opening the help documentation in a new browser window with configurable dimensions and features. Provides `openHelpWindow`, `openHelpChapter`, and `openHelp` (alias) functions, plus a constant map of chapter IDs. Dispatches a toast event when the popup is blocked.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 42 | Popup-blocked detection (`typeof helpWindow.closed === 'undefined'`) is unreliable across all browsers. Some browsers return a valid `Window` object even when the popup is blocked. | Consider adding a timeout-based check or listening for the window's `load` event. |
| 2 | Info | 67-74 | `HELP_CHAPTER_IDS` only lists 6 chapters. If new chapters are added to `helpConstants.js`, this constant must be manually updated. | Consider deriving chapter IDs from `helpConstants.js` to keep them in sync. |
| 3 | Info | 88 | `openHelp` is just an alias for `openHelpWindow`, creating two identical exports. | Remove the alias or keep only one to avoid confusion in the API surface. |

## Quality Score: 9/10
