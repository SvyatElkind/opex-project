# QA Report: RecordValidation.js
> Path: `src/Utils/RecordValidation.js` | Lines: 584 | Last audit: 2026-03-16

## Meta Description
Comprehensive record validation module covering file uploads (size, type, single/multi constraints), metadata validation (Action, Addressee, Visa, ReadStatus), record data validation (media-type-specific required fields), duration formatting/validation, and complete form validation. Provides helper functions for file type lookups and error message extraction. All user-facing text is in Latvian.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | High | 401-481 | `validateRecordForm` duplicates the media-specific field checks already performed by `validateRecordData` (lines 181-233). When both run, errors like "Krasa ir obligata foto ierakstiem" appear twice in the output. | Remove the duplicated checks from `validateRecordForm` and rely on `validateRecordData` for media field validation. |
| 2 | Low | 8-9 | MIME types `'video/avi'`, `'video/mov'`, `'video/wmv'`, `'video/mkv'`, `'audio/mp3'`, `'audio/m4a'` are non-standard; browsers typically report `'video/x-msvideo'`, `'video/quicktime'`, `'audio/mpeg'`, `'audio/x-m4a'` respectively. | Update to match actual browser-reported MIME types, or validate by file extension as a fallback. |
| 3 | Low | 3 | `MAX_FILE_SIZE` is 50MB, but `FileValidation.js` defaults to 100MB. The two modules have inconsistent size limits. | Unify the max file size into a single shared constant or make it clear which module governs which use case. |
| 4 | Low | 291 | `formatDuration` with regex `^\d{1,2}:\d{2}(:\d{2})?$` parses `"99:59"` as valid MM:SS yielding 5940 seconds. This may not match user expectations for large values. | Add an upper-bound check or document the expected input range. |
| 5 | Info | 79 | File type validation compares against `file.type` which may be empty string for unknown file types, causing valid files to be rejected. | Add a fallback that checks file extension when `file.type` is empty. |

## Quality Score: 6/10
