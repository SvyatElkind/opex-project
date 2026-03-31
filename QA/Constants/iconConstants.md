# QA Report: iconConstants.js
> Path: `src/Constants/iconConstants.js` | Lines: 112 | Last audit: 2026-03-16

## Meta Description
Centralized Font Awesome icon constant maps organized by category: document format, content type, entity (combined format + content type), hierarchy levels, upload/dropzone, stats/counts, and progress indicators. Includes two helper functions (`getEntityIcon`, `getUploadIcon`) that return the appropriate icon class suffix based on inventory type and electronic flag.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Info | 54, 60 | `STATS_ICONS.ITEMS` and `STATS_ICONS.PHYSICAL_ITEMS` both use `'fa-box'` -- may cause visual ambiguity. | Consider using a distinct icon for one of them. |
| 2 | Info | 65-69 | `PROGRESS_ICONS` partially overlaps `STATS_ICONS` (both define ITEMS, RECORDS, FILES icons). | Document the intent difference or consolidate if they serve the same purpose. |
| 3 | Info | 89-91 | `getEntityIcon` default case falls back to `CONTENT_TYPE_ICONS.TEXTUAL` rather than a generic "unknown" icon. | Consider adding an explicit `UNKNOWN` icon for unrecognized types. |

## Quality Score: 9/10
