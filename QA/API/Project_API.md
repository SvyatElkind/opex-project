# QA Report: Project_API.js
> Path: `src/API/Project_API.js` | Lines: 156 | Last audit: 2026-03-16

## Meta Description
This file defines the `Project_API` factory function, which returns methods for listing, creating, deleting, renaming, and fetching projects, as well as uploading file attachments (reports). It interacts with the project-level API endpoints. It is the primary API module consumed by workspace and project management components.

## Issues Found

| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | CRITICAL | 17-19 | `connect_api` treats HTTP 500 as a success, returning `[true, []]`. A 500 error indicates a server failure and should be surfaced to the user, not silently swallowed. | Return `[false, ERROR_MESSAGES.BACKEND_SERVER_ERROR]` for 500 responses, or at minimum log a warning. |
| 2 | WARNING | 56 | `delete_project` calls `response.json()` on a successful DELETE. Many DELETE endpoints return 204 No Content, which would throw a parse error. | Handle 204 responses gracefully before attempting to parse JSON. |
| 3 | WARNING | 96-143 | `uploadFileAsAttachment` wraps a `Promise` constructor around async logic (the `reader.onload` callback uses async/await). This is an anti-pattern that can swallow errors. If the inner `fetch` rejects after `reader.onload` fires, the rejection may not propagate correctly in all edge cases. | Refactor to use `FileReader` as a promise utility, then chain the fetch call outside the constructor. |
| 4 | WARNING | 118 | In `uploadFileAsAttachment`, the error-path `response.json()` call (line 118) is not wrapped in try/catch. If the error response isn't JSON, the promise will reject with a parse error instead of the actual HTTP error. | Add try/catch around `response.json()` in the error branch. |
| 5 | INFO | 4-10 | `createRequestOptions` duplicated across API files. | Extract to shared utility. |
| 6 | INFO | 14, 41, 52, 63 | Naming convention mixes `snake_case` (`connect_api`, `create_project`) with the file's `PascalCase` naming. Not idiomatic JavaScript. | Use `camelCase` for function names (e.g., `connectApi`, `createProject`). |

## Quality Score: 4/10
