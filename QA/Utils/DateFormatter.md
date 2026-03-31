# QA Report: DateFormatter.js
> Path: `src/Utils/DateFormatter.js` | Lines: 117 | Last audit: 2026-03-16

## Meta Description
Pure utility module that formats dates, date ranges, times, and datetimes according to configurable format strings. Supports three date formats (ISO, European dot, European slash), month/year precision modes, and 12h/24h time display. Exports both named functions and a default object.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 33 | Month-precision format is hardcoded to `MM.YYYY` regardless of the user's chosen format. A user who selected `DD/MM/YYYY` might expect `MM/YYYY`. | Derive the separator from the `format` parameter or document the intentional choice. |
| 2 | Low | 19 | `new Date(dateStr)` is used for parsing. Non-ISO date strings (e.g., `DD.MM.YYYY`) will produce incorrect results or `NaN`. | Document that inputs must be ISO 8601 or Date objects, or add explicit parsing. |
| 3 | Info | 109 | `formatDateTime` always puts a space between date and time; no option to customize the separator. | Minor, but consider a separator parameter for i18n flexibility. |

## Quality Score: 9/10
