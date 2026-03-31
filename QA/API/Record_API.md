# QA Report: Record_API.js
> Path: `src/API/Record_API.js` | Lines: 496 | Last audit: 2026-03-16

## Meta Description
This file defines the `Record_API` factory function, which is the most comprehensive API module in the project. It provides CRUD operations for textual/database records, media records (photo/video/audio with file upload), file management (multi-file upload, delete), and additional metadata operations. It includes a built-in retry mechanism with exponential backoff, centralized response handling, URL builders, and media record validation. It is consumed by record editor and media management components.

## Issues Found

| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | WARNING | 98-121 | The retry logic checks `error.response?.status` (line 108), but native `fetch` errors do not have a `.response` property. The `fetch` API throws `TypeError` for network failures, not response objects. This means 4xx client errors from `handleAPIResponse` (which returns tuples, not throws) will never trigger the early break. | Rework retry to check the returned tuple or catch `ApiError`-style exceptions that carry status codes. |
| 2 | WARNING | 212-234 | `createMediaRecord` retries file uploads via `createRetryableRequest`. Retrying multipart POST requests can cause duplicate resource creation on the server if the first request succeeded but the response was lost. | Disable retry for POST requests, or implement idempotency keys. |
| 3 | WARNING | 291-339 | `validateMediaRecordData` only validates optional fields when they are present (truthy check). It does not enforce any required fields, despite the JSDoc comments mentioning "Required fields for photo/video/audio". | Either enforce required fields or update the comments to reflect that all fields are optional. |
| 4 | INFO | 495 | `const RecordAPI = Record_API;` is an unnecessary alias. The factory function is simply renamed and exported. | Export `Record_API` directly: `export default Record_API;`. |
| 5 | INFO | 488-491 | Internal utilities (`buildAPIURL`, `handleAPIResponse`, `validateMediaRecordData`) are exposed in the public return object. This leaks implementation details. | Keep utilities private unless they are needed externally; if they are, document why. |
| 6 | INFO | 4 | The file imports `ERROR_MESSAGES` but does not import `API_ENDPOINT`, instead hardcoding `/api/v1` inside `buildAPIURL`. Inconsistent with other API files. | Import and use the shared base URL constant. |

## Quality Score: 6/10
