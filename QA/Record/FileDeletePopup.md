# QA Report: FileDeletePopup.js
> Path: `src/Record/FileDeletePopup.js` | Lines: 128 | Last audit: 2026-03-16

## Meta Description
Delete confirmation popup for files, supporting both single-file and batch-file deletion. Renders via React Portal with overlay click-to-close, a file list preview (capped at 5 items with a "more" indicator), a loading spinner during deletion, and clear cancel/confirm actions. Uses Latvian UI strings inline.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 30-36 | `handleConfirm` and `handleCancel` are trivial wrappers around `onConfirm`/`onCancel` — adds indirection without benefit | Call props directly or remove wrapper functions |
| 2 | Low | 53-89 | UI text strings are hardcoded in Latvian instead of using constants | Move strings to a constants file for consistency with other popup components (e.g., RecordDeletePopup uses `RECORD_DELETE_UI`) |

## Quality Score: 8/10
