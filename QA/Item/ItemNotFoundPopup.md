# QA Report: ItemNotFoundPopup.js
> Path: `src/Item/ItemNotFoundPopup.js` | Lines: 58 | Last audit: 2026-03-16

## Meta Description
ItemNotFoundPopup.js is a small informational modal (React Portal) shown when a user tries to jump to an item number that does not exist in the current inventory. It displays a localized Latvian message with the searched item number and inventory number, and provides a single "Continue" button to dismiss. The overlay supports click-to-close.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | WARNING | 29-37 | All user-facing strings are hardcoded in Latvian directly in JSX rather than using UI constants like other popup components do. | Extract strings to a constants file (e.g., `ITEM_NOT_FOUND_UI` in `Constants.js`) for consistency. |
| 2 | INFO | 24 | Overlay click-to-close pattern is good but lacks keyboard accessibility (no Escape key support). | Add an `onKeyDown` handler for the Escape key to close the modal. |
| 3 | INFO | 37 | `itemNumber` and `inventoryNumber` are interpolated without type enforcement. | Add PropTypes or TypeScript types to ensure correct types. |

## Quality Score: 8/10
