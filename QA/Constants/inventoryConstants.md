# QA Report: inventoryConstants.js
> Path: `src/Constants/inventoryConstants.js` | Lines: 251 | Last audit: 2026-03-16

## Meta Description
Inventory-level validation constants and functions. Defines character/number limits, allowed type and storage-term lists, Latvian error messages, and validation functions for inventory number, postfix, type, storage term, date range, creation, update, and deletion eligibility. Also provides a `getDeleteRestrictionMessage` helper for report-sourced inventories.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 57 | Success message `"Uzsakites saraksts ir izdzēsts."` has a typo -- should be `"Uzskaites saraksts ir izdzēsts."`. | Fix the typo. |
| 2 | Low | 26 | Error message `"Uzskates saraksta numuram kopā ar literu jābūt unikālam."` -- typo "Uzskates" should be "Uzskaites". | Fix the typo. |
| 3 | Low | 21 | `ERROR_MESSAGES` is a generic export name that collides with the same name in `itemConstants.js` and `recordConstants.js`. | Rename to `INVENTORY_ERROR_MESSAGES` for clarity. |
| 4 | Info | 13-17 | `VVAIS_TYPE_LIST` and `VVAIS_STORAGE_TERM_LIST` are duplicated in `projectConstants.js`, `FallbackConstants.js`, and `Constants.js`. | Consider a single canonical source. |

## Quality Score: 8/10
