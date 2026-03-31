# QA Report: Constants_API.js
> Path: `src/API/Constants_API.js` | Lines: 192 | Last audit: 2026-03-16

## Meta Description
This file provides a caching API service for fetching allowed constant values (dropdowns, enums) from the backend endpoint `GET /api/v1/values/`. It exports both an async `fetchConstants` function (with 5-minute cache and fallback to `FALLBACK_CONSTANTS`) and multiple synchronous convenience getters for specific constant paths (e.g., inventory types, security levels). It is consumed by form components and other modules that need dropdown option lists.

## Issues Found

| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | WARNING | 17-18 | Module-level mutable variables (`cachedConstants`, `cacheTimestamp`) make the cache a hidden singleton. This is not testable and can cause stale data across hot-module reloads during development. | Consider encapsulating cache state in a class or a closure, or expose a dedicated test-reset helper. |
| 2 | INFO | 34-39 | `Content-Type: application/json` header is unnecessary for a GET request with no body. | Remove the header for GET requests to reduce noise. |
| 3 | INFO | 10-11 | `API_BASE_URL` is hardcoded to `/api/v1` while other API files import `API_ENDPOINT` from `Constants`. This inconsistency may cause issues if the base URL changes. | Import the base URL from a shared constant for consistency across all API modules. |
| 4 | INFO | 177-192 | The default export is a plain object duplicating the named exports. Consumers may import both the default and named exports, leading to ambiguity. | Choose one export style (named or default) and use it consistently. |
| 5 | INFO | 52-54 | The catch block silently swallows the error and returns fallback constants without any logging. While the fallback behavior is correct, there is no way to know the API call failed during debugging. | Consider logging the error in development mode or emitting a warning event. |

## Quality Score: 8/10
