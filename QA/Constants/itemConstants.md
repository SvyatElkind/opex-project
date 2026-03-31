# QA Report: itemConstants.js
> Path: `src/Constants/itemConstants.js` | Lines: 476 | Last audit: 2026-03-16

## Meta Description
Comprehensive item-level validation module. Defines character limits for all item fields, regex patterns for series codes and durations, allowed-value lists (date indicators, units of measure, colors, restrictions, security levels), conditional-requirement arrays for media types, default values, Latvian error messages, and a full suite of validation functions covering series code, title, date range, language, annotation, restriction, security level, related items, and composite create/update validation.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 26 | `DURATION_REGEX = /^\d{2}:[0-5]\d:[0-5]\d$/` requires exactly 2-digit hours, but the comment says "HH:MM:SS or H:MM:SS". The regex does not accept single-digit hours. | Either update the regex to `/^\d{1,2}:[0-5]\d:[0-5]\d$/` or correct the comment. |
| 2 | Low | 57 | `ERROR_MESSAGES` is exported with a generic name that collides with the same export name in `inventoryConstants.js` and `recordConstants.js`. | Use a more specific name like `ITEM_ERROR_MESSAGES`. |
| 3 | Low | 15-18 | `RESTRICTION_MAX_LENGTH` is 10 and `SECURITY_LEVEL_MAX_LENGTH` is 10, but the longest allowed values exceed these limits (e.g., "Sensitivi dati" = 14 chars, "Sevishki slepens" = 16 chars). These constants appear unused in validation. | Remove the unused max-length constants or correct them to match actual values. |
| 4 | Info | 30-48 | Several allowed-value arrays and conditional-requirement arrays duplicate those in `FallbackConstants.js` under different names (plural vs singular). | Consolidate to a single canonical source and unify naming. |
| 5 | Info | 436-438 | `validateItemUpdate` simply delegates to `validateItemCreate`. This means updates require all fields even if only some changed. | Consider implementing partial validation for update operations if needed. |

## Quality Score: 8/10
