# QA Report: institutionConstants.js
> Path: `src/Constants/institutionConstants.js` | Lines: 201 | Last audit: 2026-03-16

## Meta Description
Institution-level validation constants including character limits for names, registration numbers, creator/signer fields, a regex for registration numbers, required update fields, and Latvian error messages. Provides individual field validators (`validateCreator`, `validateSigner`, etc.), a composite `validateInstitutionUpdate`, and a `getRemainingChars` helper. Exports both named and default.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 10-13 | `CREATOR_MAX_LENGTH` and `SIGNER_MAX_LENGTH` are both 30 characters, which is quite short for full names (e.g., double-barreled surnames). | Consider increasing to 50-100 to accommodate longer names, or verify with backend constraints. |
| 2 | Low | 72 | `validateCreator` checks `creator.length > CREATOR_MAX_LENGTH` against the untrimmed value, but the required check uses `.trim()`. A string with leading/trailing spaces could fail the length check unexpectedly. | Apply `.trim()` before the length check for consistency. |
| 3 | Info | 54 | `empty_fields` message uses `'{}'` as a placeholder but there is no formatting function shown in this file. | Ensure callers replace `{}` before displaying to users. |
| 4 | Info | 176-178 | `getRemainingChars` is duplicated identically in `itemConstants.js` and `recordConstants.js`. | Extract to a shared utility to avoid duplication. |

## Quality Score: 8/10
