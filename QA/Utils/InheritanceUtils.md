# QA Report: InheritanceUtils.js
> Path: `src/Utils/InheritanceUtils.js` | Lines: 1556 | Last audit: 2026-03-16

## Meta Description
Central business-logic module that defines inventory types, category classifications (Documents, Electronic Documents, Electronic Media, Media), inheritance behaviors (one-to-one vs one-to-many), view modes, and category constraints including workflows, endpoints, field lists, and file-type configs. Provides utility functions for category determination, auto-field extraction from media records, inheritance info lookups, record creation validation, navigation behavior, UI config, item attention status, record statistics, and a full OPEX validation pipeline.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | High | 430-434 | `getInheritanceInfo` directly mutates the shared `CATEGORY_CONSTRAINTS` object (`constraints.acceptedFileTypes = ...`, `constraints.acceptAttribute = ...`, `constraints.icon = ...`). Since `constraints` is a reference to the module-level constant, calling this function for an Electronic Media inventory permanently modifies the constant for all subsequent calls. | Deep-clone or spread `constraints` before mutating: `const constraints = { ...CATEGORY_CONSTRAINTS[category], workflow: { ...CATEGORY_CONSTRAINTS[category].workflow } };` |
| 2 | Medium | 1-1665 | File is 1665 lines long with constants, category configs, utility functions, statistics, and full validation logic all in one module. | Split into separate modules (e.g., `InheritanceConstants.js`, `InheritanceValidation.js`, `InheritanceStats.js`) for maintainability. |
| 3 | Low | 491 | `validateRecordCreation` counts records from `item.records.length`, but media records live under `item.photo_records`, `item.video_records`, `item.audio_records`. For media items this count may always be 0, making the max-records check ineffective. | Use `getRecordStatistics` (which already handles media record arrays) to obtain the true record count. |
| 4 | Low | 491, 514, 548, 583 | Multiple functions call `getInheritanceInfo(inventory)` redundantly -- e.g., `getItemAttentionStatus` calls both `getInheritanceInfo` and `getRecordStatistics` which itself calls `getInheritanceInfo` again. | Pass `inheritanceInfo` as a parameter or cache it to avoid repeated computation and the mutation bug in issue #1. |
| 5 | Low | 67-68 | JSDoc parameter description has garbled diacritics: `TekstuÄls` and `DatubÄze` instead of `Tekstuāls`. | Fix the JSDoc encoding. |
| 6 | Info | 98 | `maxRecords: Infinity` for DOCUMENTS/ELECTRONIC_DOCUMENTS. Serializing to JSON produces `null`. | Not a runtime issue since it is only used for numeric comparison, but document the behavior. |
| 7 | Info | 105 | Emoji characters used for `icon` fields. Rendering depends on OS/font support. | Acceptable, but consider FA icon class fallbacks for consistent rendering. |

## Quality Score: 5/10
