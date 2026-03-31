# QA Report: recordConstants.js
> Path: `src/Constants/recordConstants.js` | Lines: 405 | Last audit: 2026-03-16

## Meta Description
Record-level validation constants and functions. Defines character limits for all record and metadata fields, a duration regex, allowed access-restriction values, Latvian error messages (including success messages), and validation functions for title, language, registration number, nomenclature number, record date (against item range), access restriction and its conditional date, duration, text record creation, media record creation, and helper utilities for remaining chars, date requirement checks, and record-type determination.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 36 | `DURATION_REGEX = /^\d{1,2}:[0-5]\d:[0-5]\d$/` allows `0:00:00` through `99:59:59`. This differs from `itemConstants.js` which requires exactly 2-digit hours. The two modules have inconsistent duration validation. | Align the regex across both files, or document why they differ. |
| 2 | Low | 44 | `ERROR_MESSAGES` is a generic export name, same as in `itemConstants.js` and `inventoryConstants.js`. | Rename to `RECORD_ERROR_MESSAGES` to avoid confusion on import. |
| 3 | Info | 15-16 | `ACCESS_RESTRICTION_NOTES_MAX_LENGTH` and `USER_RESTRICTION_NOTES_MAX_LENGTH` are both 30 characters, which seems very short for notes fields. | Verify with product requirements; consider increasing. |
| 4 | Info | 252-309 | `validateTextRecordCreate` validates many fields but does not validate field-length constraints for optional fields like `annotation`, `key_words`, `notes`. | Add length checks for all text fields to prevent API errors. |
| 5 | Info | 362-364 | `getRemainingChars` is duplicated identically in `itemConstants.js` and `institutionConstants.js`. | Extract to a shared utility. |

## Quality Score: 8/10
