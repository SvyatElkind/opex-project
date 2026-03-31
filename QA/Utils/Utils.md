# QA Report: Utils.js
> Path: `src/Utils/Utils.js` | Lines: 20 | Last audit: 2026-03-16

## Meta Description
Small utility factory function that returns `formatDate` (formats a Date object to `YYYY-MM-DD`) and `formatYear` (extracts the 4-digit year). Exported as a default factory that must be invoked (`Utils()`) before use. Largely superseded by `DateFormatter.js`.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 1-20 | Module is a legacy duplicate of `DateFormatter.js` which provides a more complete, null-safe, and directly-exported `formatDate`. This module requires factory invocation with no benefit. | Migrate callers to `DateFormatter.js` and remove this file. |
| 2 | Low | 2-8 | `formatDate` does not handle `null`/`undefined` input -- calling `date.getFullYear()` on a non-Date value will throw. | Add an input guard: `if (!date) return '';` |
| 3 | Low | 9-12 | `formatYear` also lacks null-safety and will throw on invalid input. | Same guard as above. |
| 4 | Low | 10 | Missing semicolon after `const y = date.getFullYear()`. | Add semicolon for consistency. |
| 5 | Low | 11 | `formatYear` returns a number (from `getFullYear()`) rather than a string, inconsistent with `formatDate` returning a string. | Return `String(y)` for consistency. |
| 6 | Info | 1 | The factory pattern (`const Utils = () => { ... }`) is unusual for a utility module; every caller must instantiate with no caching. | Prefer plain named exports for tree-shaking and simplicity. |

## Quality Score: 4/10
