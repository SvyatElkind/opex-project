# QA Report: ValidationWarning.jsx
> Path: `src/components/ValidationWarning.jsx` | Lines: 113 | Last audit: 2026-03-16

## Meta Description
File exports three validation-related components: `ValidationWarning` (full warning panel with dismiss/proceed actions), `InlineValidationWarning` (compact inline variant for forms), and `ValidationBadge` (clickable count badge). All display Latvian-language UI text and use FontAwesome icons.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 101-109 | `ValidationBadge` uses `onClick` on a `<div>` without keyboard accessibility (`tabIndex`, `role="button"`, `onKeyDown`) | Use a `<button>` element instead for proper keyboard and screen reader support |
| 2 | Low | 43-62 | When both `onDismiss` and `onProceed` are null/undefined, the `.validation-warning-actions` div still renders (empty) | Add a conditional to hide the actions div entirely when neither callback is provided |
| 3 | Info | 26-31 | Warning list items use array `index` as key; acceptable for display-only lists that are not reordered | Use a stable `id` field if available on warning objects |

## Quality Score: 8/10
