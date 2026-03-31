# QA Report: HelpButton.js
> Path: `src/Help/HelpButton.js` | Lines: 59 | Last audit: 2026-03-16

## Meta Description
Reusable button component that opens help documentation in a new window via `openHelp()`. Supports optional chapter targeting, custom text, icon-only mode, and additional CSS classes. Includes JSDoc and usage examples in comments after the export.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 2 | `HELP_CHAPTER_IDS` is imported but never used in the component body -- only referenced in post-export comments | Remove the unused import to keep the bundle clean |
| 2 | Info | 41-58 | Usage examples after `export default` are bundled into production code | Move examples to a README, Storybook story, or standalone documentation file |

## Quality Score: 9/10
