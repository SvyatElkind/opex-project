# QA Report: projectConstants.js
> Path: `src/Constants/projectConstants.js` | Lines: 186 | Last audit: 2026-03-16

## Meta Description
Project-level validation constants and functions. Defines character limits for project name and folder path, a name regex pattern, allowed report file format (`.xlsx`), VVAIS type/storage-term lists, Latvian error messages, and validation functions for project name, folder path, report file, and remaining-character counters. Exports both named and default.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 18 | `PROJECT_NAME_REGEX = /^[\w\-]+$/` -- `\w` in JS matches only `[A-Za-z0-9_]`, silently rejecting Latvian diacritics (e.g., `ā`, `ē`, `ī`). If project names should support Latvian characters, the regex is too restrictive. | Clarify whether diacritics are intended to be blocked; if not, use `/^[\p{L}\d_-]+$/u`. |
| 2 | Low | 33-34 | `VVAIS_TYPE_LIST` and `VVAIS_STORAGE_TERM_LIST` are duplicated from `inventoryConstants.js`. | Import from a single canonical source. |
| 3 | Low | 10 | `PROJECT_FOLDER_MAX_LENGTH` of 100 may be too short for deeply nested Windows paths (e.g., `C:\Users\username\Documents\Projects\...`). | Consider increasing or removing the hard limit for folder paths. |
| 4 | Info | 81-82 | `typeof name !== 'string'` check is unreachable because line 77 already returns for falsy values, and any truthy non-string would throw on `name.trim()` at line 85. | Move the type check before the emptiness check for correctness. |

## Quality Score: 8/10
