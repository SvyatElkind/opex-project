# QA Report: ErrorDisplay.js
> Path: `src/components/ErrorDisplay.js` | Lines: 79 | Last audit: 2026-03-16

## Meta Description
Collection of reusable error/warning/success display components. Exports `GeneralAlert` (configurable type), convenience wrappers (`GeneralError`, `GeneralWarning`, `GeneralSuccess`), `FieldError` for inline field errors, and `FieldErrors` for rendering a list of field-level errors. All are presentational and rely on external CSS classes.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 79 | Default export is a plain object `{ GeneralAlert, ... }` which is unconventional for React and may confuse tree-shaking | Remove the default export and rely solely on named exports |
| 2 | Low | 24 | Close button uses the multiplication sign character (`\u00d7`) which may render inconsistently across fonts | Use a FontAwesome icon (`<i className="fas fa-times">`) for consistency with the rest of the app |
| 3 | Low | 9-28 | No `role="alert"` or `aria-live` attributes on alert elements | Add `role="alert"` for accessibility |
| 4 | Info | 65-76 | `FieldErrors` assumes `errors` is always a flat `{field: message}` object with no type checking | Add PropTypes or document the expected shape |

## Quality Score: 8/10
