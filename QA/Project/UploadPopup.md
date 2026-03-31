# QA Report: UploadPopup.js
> Path: `src/Project/UploadPopup.js` | Lines: 303 | Last audit: 2026-03-16

## Meta Description
Report file upload popup with drag-and-drop, file validation (format and size), simulated progress bar, and success/error messaging. Uses the raw `Project_API` directly instead of a React Query mutation hook. Supports only XLSX format with a 50MB size limit. Displays inline file details with a remove option.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 2 | Uses `Project_API` directly instead of a React Query mutation — inconsistent with the rest of the app | Migrate to a `useUploadReport` mutation hook for consistency and automatic cache invalidation |
| 2 | Medium | 119-131 | Upload progress is simulated with `setInterval` incrementing by 10 every 100ms — not reflective of actual upload progress | Use XMLHttpRequest or fetch with progress events for real tracking |
| 3 | Low | 139 | Response check `Array.isArray(result) && result[0] === true` — unusual tuple-style API response | Document or normalize the API response format |
| 4 | Low | 156-158 | `setTimeout` in `finally` block delays `setIsLoading(false)` by 1000ms | Remove the timeout; set loading to false immediately |
| 5 | Low | 213 | Hardcoded "XLSX" text shown regardless of actual file extension | Use the file's actual extension for display |

## Quality Score: 6/10
