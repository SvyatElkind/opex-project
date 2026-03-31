# QA Report: apiClient
> Path: `src/services/apiClient.js` | Last audit: 2026-03-24

## Purpose
Centralized HTTP client for all backend API communication. Provides request/response handling, standardized error parsing via `ApiError`, configurable timeouts, request cancellation via `AbortController`, automatic retry with exponential backoff for 5xx/network errors, and convenience methods for all HTTP verbs. All hooks and API modules should use this client instead of raw `fetch()`.

## Props
N/A -- this is a service module, not a component.

## Exports
| Export | Type | Description |
|--------|------|-------------|
| `apiRequest` | `function` | Core request function with retry, timeout, error handling |
| `get` | `function` | GET request shorthand |
| `post` | `function` | POST with JSON body |
| `put` | `function` | PUT with JSON body |
| `patch` | `function` | PATCH with JSON body |
| `del` | `function` | DELETE request |
| `postFormData` | `function` | POST with FormData (file uploads, 5min timeout) |
| `putFormData` | `function` | PUT with FormData (file updates, 5min timeout) |
| `postBinary` | `function` | POST with ArrayBuffer and custom Content-Type (report uploads, 5min timeout) |
| `downloadFile` | `function` | File download with Content-Disposition filename parsing |
| `ApiError` | `class` | Custom error class with `status`, `data`, `parsed`, `fieldErrors` |
| `API_BASE_URL` | `string` | Base URL from `REACT_APP_API_URL` env var or `/api/v1` default |

## Configuration
| Constant | Value | Description |
|----------|-------|-------------|
| `API_BASE_URL` | `process.env.REACT_APP_API_URL` or `/api/v1` | Base URL for all requests |
| `DEFAULT_TIMEOUT` | `30000` (30s) | Standard request timeout |
| `UPLOAD_TIMEOUT` | `300000` (5min) | File upload timeout |
| `DOWNLOAD_TIMEOUT` | `300000` (5min) | File download timeout |
| `RETRY_CONFIG.maxRetries` | `2` | Maximum retry attempts |
| `RETRY_CONFIG.baseDelayMs` | `500` | Base delay for exponential backoff |
| `RETRY_CONFIG.maxDelayMs` | `5000` | Maximum delay cap |
| `RETRY_CONFIG.retryableStatuses` | `[502, 503, 504]` | HTTP statuses that trigger retry |

## Core Function: `apiRequest(endpoint, options, requestConfig)`
1. Constructs full URL: `${API_BASE_URL}${endpoint}`.
2. Determines timeout: FormData/ArrayBuffer body -> `UPLOAD_TIMEOUT`, else `DEFAULT_TIMEOUT`. Override via `requestConfig.timeout`.
3. Retry: enabled by default for GET only (`requestConfig.retry` overrides).
4. Headers: default `Content-Type: application/json`. Removed for FormData (browser sets multipart boundary). Null/undefined headers pruned.
5. Retry loop: up to `maxRetries + 1` attempts with exponential backoff + 25% jitter via `getRetryDelay()`.
6. Per attempt:
   - `createTimeoutController(timeout, externalSignal)` creates AbortController with auto-abort timeout and optional external signal linking.
   - `fetch()` executes.
   - 204 status: returns `{ data: null, status: 204 }` via `isNotFoundStatus()`.
   - `parseResponseBody()`: JSON for `application/json`, text for `text/*`, null otherwise.
   - Error status (>=400): creates `ApiError`, retries if retryable, otherwise throws.
   - Success: returns `{ data, status }`.
7. Network errors: `ApiError` with status 0 and Latvian message.
8. Abort/timeout: `ApiError` with status 0 and Latvian message.
9. All retries exhausted: throws last error or generic failure `ApiError`.

## ApiError Class
- Extends `Error`. Constructor takes `(status, data)`.
- `parseApiError(data)` from `errorService` normalizes the error.
- Properties: `name='ApiError'`, `status`, `data`, `parsed`, `fieldErrors` (from `parsed.fields`).
- `message` derived from `parsed.general || parsed.message || 'API Error'`.

## File Download: `downloadFile(endpoint, filename, config)`
1. Direct `fetch()` (no retry mechanism).
2. On error response: parses JSON for error message, throws `ApiError`.
3. Extracts filename from Content-Disposition header (standard and UTF-8 `filename*=UTF-8''` formats).
4. Falls back to `download_{timestamp}` filename.
5. Creates blob URL, temporary `<a>` element, triggers click, revokes URL.

## Known Limitations
- `isNotFoundStatus` is aliased to `isNoContentStatus` (checks 204, not 404). Semantically misleading.
- Retry only auto-enabled for GET. Failed mutations not retried even for 503.
- `parseResponseBody` returns `null` for non-JSON/text -- binary responses inaccessible via `apiRequest`.
- `downloadFile` does not use retry mechanism.
- Error messages hardcoded in Latvian -- no i18n.
- External signal linking in `createTimeoutController` does not clean up event listener on controller abort.
- `sleep` and `getRetryDelay` internal -- not exported for testing.

## Quality Score: 8/10
