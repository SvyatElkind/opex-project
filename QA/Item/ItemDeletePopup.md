# QA Report: ItemDeletePopup.js
> Path: `src/Item/ItemDeletePopup.js` | Lines: 111 | Last audit: 2026-03-16

## Meta Description
ItemDeletePopup.js is a confirmation modal for deleting one or more archival items. It renders via a React Portal and displays a warning message, supports both single and batch delete scenarios, computes record counts with Latvian grammar rules, and uses UI constants from `ITEM_DELETE_UI`.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | WARNING | 30-36, 39-45, 48-53 | `totalRecords`, `getSingleItemRecordCount`, and `formatRecordCount` are all computed but never used in the rendered JSX. Record count information is not displayed anywhere in the modal. | Either display the record count in the modal content (likely intended for user awareness) or remove the dead code. |
| 2 | WARNING | 83 | `dangerouslySetInnerHTML` used to render `POPUP_WARNING_TEXT`. If this constant ever includes user-controlled content, it creates an XSS vulnerability. | If the HTML is static and developer-controlled, add a comment. Otherwise, use JSX instead. |
| 3 | INFO | 55-61 | `handleConfirm` and `handleCancel` are trivial wrappers that just call props directly. | Call `onConfirm`/`onCancel` directly in the `onClick` handlers to reduce boilerplate. |
| 4 | INFO | 51-52 | Latvian grammar threshold at `count < 10` may not cover all cases (e.g., 21, 31 use singular forms in Latvian based on last digit). | Verify the pluralization rules with a native speaker. |

## Quality Score: 7/10
