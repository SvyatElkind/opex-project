# QA Report: ProjectPopup.js
> Path: `src/Project/ProjectPopup.js` | Lines: 209 | Last audit: 2026-03-16

## Meta Description
Project creation popup with name and directory path inputs, real-time validation, character counters, and Windows path format checking via regex. Uses `useCreateProject` mutation and `useFormErrors` for error handling. Displays both field-level and general errors with constants-driven UI text.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 31 | Windows path regex `dirRegEx` is restrictive and may reject valid UNC paths or paths with certain special characters | Consider a more permissive validation or delegate path validation to the backend |
| 2 | Low | 79-82 | `prepareDir` splits on `\\` and rejoins with `\\` — effectively a no-op | Remove the function or implement actual normalization (e.g., trimming trailing slashes) |
| 3 | Low | 103-104 | Error handling mixes `error.fieldErrors` with `error.message` — assumes a specific error shape | Document expected error shape or add defensive checks |
| 4 | Low | 117 | No overlay click handler to close the popup | Add overlay click-to-close for UX consistency |

## Quality Score: 7/10
