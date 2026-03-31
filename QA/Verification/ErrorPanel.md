# QA Report: ErrorPanel.jsx
> Path: `src/Verification/ErrorPanel.jsx` | Lines: 88 | Last audit: 2026-03-16

## Meta Description
Side panel component that displays errors and warnings for a selected tree node. Renders a header with error/warning counts, a navigate button, and a close button. Each error/warning message is cleaned of trailing parenthesized identifiers and HTML tags via `renderMessage`. Receives `errorData` (with entity, level, validation, label, breadcrumb) from the parent tree view.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 7 | `breadcrumb`, `entity`, and `level` are destructured from `errorData` but never used in the component's rendered output. | Either render the breadcrumb trail for context or remove the unused destructured variables. |
| 2 | Low | 53 | `<div className="error-icon"></div>` is an empty div -- presumably styled with CSS pseudo-elements or background. This is inconsistent with the rest of the codebase which uses `<i>` icon elements. | Replace with `<i className="fas fa-times-circle"></i>` for explicit error icons. |
| 3 | Low | 66 | Same issue -- `<div className="warning-icon"></div>` is an empty div. | Replace with `<i className="fas fa-exclamation-triangle"></i>`. |
| 4 | Low | 15-17 | `renderMessage` strips HTML with a basic regex `/<[^>]+>/g` which does not handle edge cases like `>` inside attribute values or self-closing tags. | For robustness, use DOMParser or a small sanitization library, though the current approach is adequate for known validation message formats. |

## Quality Score: 8/10
