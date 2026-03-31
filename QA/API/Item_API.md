# QA Report: Item_API.js
> Path: `src/API/Item_API.js` | Lines: 58 | Last audit: 2026-03-16

## Meta Description
This file defines the `Item_API` factory function, which returns methods for creating, updating, and deleting item records within a project's inventory. It interacts with the `/project/<id>/item/` endpoint. It is consumed by item management components that perform CRUD operations on archival items.

## Issues Found

| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | CRITICAL | 39-48 | `deleteItem` calls `response.json()` on a successful DELETE response (line 43). If the server returns 204 No Content, this will throw a JSON parse error, causing the method to incorrectly report failure. | Check for 204 status or wrap `response.json()` in a try/catch with a fallback. |
| 2 | WARNING | 29 | `updateItem` calls `response.json()` in the error branch (line 29) without a try/catch. If the error response is not valid JSON, this will throw an unhandled exception. | Wrap in try/catch like `Inventory_API.updateInventory` does. |
| 3 | WARNING | 16 | `createItem` returns `ERROR_MESSAGES.GENERIC_ERROR` on non-ok responses instead of `BACKEND_SERVER_ERROR`, which is inconsistent with other API files that distinguish between server and generic errors. | Use `BACKEND_SERVER_ERROR` for HTTP error responses and `GENERIC_ERROR` for network/catch errors, consistently. |
| 4 | WARNING | 5-11 | `createRequestOptions` duplicated again across API files. | Extract to shared utility. |
| 5 | INFO | 13 | Parameter order `(itemData, projectId, inventoryId)` puts the payload first, while `deleteItem` uses `(projectId, itemId)`. Inconsistent parameter ordering across methods. | Standardize parameter order to `(projectId, ..., data)` across all methods. |

## Quality Score: 4/10
