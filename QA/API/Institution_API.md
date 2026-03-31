# QA Report: Institution_API.js
> Path: `src/API/Institution_API.js` | Lines: 50 | Last audit: 2026-03-16

## Meta Description
This file defines the `Institution_API` factory function, which returns methods for managing institution signer data within a project. It provides `addSigners` (PUT) and `updateSignerField` (PUT) operations against the `/project/<id>/institution/<id>/` endpoint. It is consumed by components that handle institution signer assignment and editing.

## Issues Found

| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | WARNING | 7-13 | `createRequestOptions` is duplicated across Institution_API, Inventory_API, Item_API, and Project_API with identical logic. This violates DRY. | Extract into a shared utility (e.g., `apiClient.js` already exists) or a common helper module. |
| 2 | WARNING | 15-26, 28-45 | `addSigners` and `updateSignerField` both call the same PUT endpoint with the same URL pattern and nearly identical logic. The only difference is that `updateSignerField` explicitly picks four fields. This is effectively duplicated code. | Merge into a single `updateInstitution` method, or have `addSigners` delegate to `updateSignerField`. |
| 3 | INFO | 8-9 | Inconsistent indentation: `headers` and `body` inside `createRequestOptions` are indented one level too deep compared to `method`. | Fix indentation to match surrounding code style. |
| 4 | INFO | 5 | The factory function pattern (calling `Institution_API()` to get methods) adds unnecessary overhead compared to simply exporting the functions directly, especially since there is no closure state. | Export functions directly or document why the factory pattern is needed. |

## Quality Score: 6/10
