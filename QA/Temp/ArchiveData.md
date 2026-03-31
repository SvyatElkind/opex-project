# QA Report: ArchiveData.js
> Path: `src/Temp/ArchiveData.js` | Lines: 374 | Last audit: 2026-03-16

## Meta Description
Static mock/seed data file exporting an array of 20 archive entries, each with nested records containing Latvian-language metadata. Located in a `Temp` directory indicating it is not intended for production use.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 1-374 | Test/mock data lives in the source tree under `src/Temp/` with no guard preventing it from being bundled in production | Move to `__tests__/fixtures/` or `__mocks__/`, or gate the import behind `process.env.NODE_ENV` |
| 2 | Low | 221 | Annotation contains duplicate phrase: `"annotation: Interesanta annotation: Interesanta informacija"` -- likely a copy-paste error | Fix the mock data string |
| 3 | Low | 1-374 | Data uses an older field schema (`name`, `fileType`) that may not match the current API schema (e.g., `title`) | Verify field names match the current API contract or update accordingly |
| 4 | Info | 1 | No documentation header explaining the file's purpose or intended usage | Add a brief comment at the top |

## Quality Score: 5/10
