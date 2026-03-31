# QA Report: FallbackConstants.js
> Path: `src/Constants/FallbackConstants.js` | Lines: 135 | Last audit: 2026-03-16

## Meta Description
Defines hardcoded fallback values for when the backend API (`GET /api/v1/values/`) is unavailable. Covers inventory types, storage terms, date indicators, units of measure, restrictions, security levels, and access restrictions. Also provides default values for new records/items and media-type helper arrays. Intended to exactly mirror backend `helpers/constants.py`.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 13-18 | `FALLBACK_INVENTORY_TYPE` duplicates `VVAIS_TYPE_LIST` in `inventoryConstants.js` and `projectConstants.js`. | Import from a single canonical source to prevent drift. |
| 2 | Low | 21-24 | `FALLBACK_STORAGE_TERM` duplicates `VVAIS_STORAGE_TERM_LIST` in `inventoryConstants.js`. | Same as above. |
| 3 | Low | 31-58 | `FALLBACK_DATE_INDICATOR`, `FALLBACK_UNIT_OF_MEASURE`, `FALLBACK_RESTRICTION`, `FALLBACK_SECURITY_LEVEL` all duplicate arrays in `itemConstants.js`. | Consolidate into one file and re-export. |
| 4 | Low | 65-68 | `FALLBACK_ACCESS_RESTRICTION` duplicates `RECORD_ACCESS_RESTRICTION_VALUES` in `recordConstants.js`. | Consolidate. |
| 5 | Low | 116-128 | `REQUIRE_ANNOTATION_TYPES`, `REQUIRE_DURATION_TYPES`, etc. duplicate the same arrays in `itemConstants.js` with slightly different names (plural vs singular). | Unify naming and source. |
| 6 | Info | 75-89 | `FALLBACK_CONSTANTS` structure mirrors the API response shape, which is good for drop-in replacement. | No action needed. |

## Quality Score: 7/10
