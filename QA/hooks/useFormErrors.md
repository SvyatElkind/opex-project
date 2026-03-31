# QA Report: useFormErrors.js
> Path: `src/hooks/useFormErrors.js` | Lines: 73 | Last audit: 2026-03-16

## Meta Description
A form error management hook that provides state and methods for handling both general and field-level errors from API responses. It integrates with `parseApiError` from the error service and exposes utilities to set, clear, and query errors. Clean, well-documented code with good separation of concerns.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 56 | `hasErrors` is a derived value recalculated on every render rather than memoized. While unlikely to be a performance issue, it breaks the convention of the other memoized callbacks. | Wrap in `useMemo` for consistency: `useMemo(() => generalError \|\| Object.keys(fieldErrors).length > 0, [generalError, fieldErrors])`. |
| 2 | Info | 62-64 | `setGeneralError` and `setFieldErrors` (raw state setters) are exposed alongside the purpose-built `setApiErrors`, `setFieldError`, and `clearErrors`. This gives consumers two ways to set the same state, which could lead to inconsistent usage patterns. | Consider removing the raw setters from the return object, or document when direct setter usage is appropriate. |

## Quality Score: 9/10
