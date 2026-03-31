# QA Report: RenameProjectPopup.js
> Path: `src/Project/RenameProjectPopup.js` | Lines: 108 | Last audit: 2026-03-16

## Meta Description
Rename popup for projects with real-time name validation, character counter, and auto-focus on the input field. Uses shared validation from `projectConstants` and constants-driven UI text. Conditionally renders based on the `value` prop (which acts as the open/close boolean).

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 10 | Prop `value` used as a boolean toggle is confusing naming | Rename to `isOpen` for clarity |
| 2 | Low | 58 | Label constant `PROJECT_RENAME_UI.RENAME_LABLE` contains a typo ("LABLE" vs "LABEL") | Fix the constant name in the constants file |
| 3 | Low | 48 | No overlay click handler to close the popup | Add overlay click-to-close for UX consistency |

## Quality Score: 8/10
