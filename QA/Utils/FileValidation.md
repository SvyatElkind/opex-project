# QA Report: FileValidation.js
> Path: `src/Utils/FileValidation.js` | Lines: 335 | Last audit: 2026-03-16

## Meta Description
Provides soft (warning-level) file validation utilities for size, image dimensions, orientation, and audio/video duration. Integrates with app-level validation settings to conditionally enable checks. Also exposes helpers to extract image dimensions and media duration from `File` objects using browser APIs. All user-facing messages are in Latvian.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 193 | `file.type.startsWith('image/')` will reject valid image files whose MIME type is empty or misreported by the OS (e.g., `.tiff` on some systems). | Consider also checking file extension as a fallback. |
| 2 | Low | 230 | `document.createElement(...)` for media duration extraction will fail in non-browser environments (SSR, tests). | Guard with `typeof document !== 'undefined'` or note the browser-only constraint. |
| 3 | Low | 223-245 | `getMediaDuration` has no timeout; certain corrupt media files may never fire `onloadedmetadata` or `onerror`, leaving the promise pending indefinitely. | Add a timeout wrapper (e.g., `Promise.race` with a timeout) to prevent hanging. |
| 4 | Info | 135 | Latvian text `"kvalitatīvai apstrādei"` -- grammatical correctness should be verified. | Verify with Latvian language reviewer. |

## Quality Score: 8/10
