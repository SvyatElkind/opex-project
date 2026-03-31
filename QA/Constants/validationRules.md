# QA Report: validationRules.js
> Path: `src/Constants/validationRules.js` | Lines: 360 | Last audit: 2026-03-16

## Meta Description
Defines all validation rules used by the Verification Tree (VerificationModal) organized by hierarchy level: project, inventory, item, record, and file. Each rule has an ID, severity (ERROR or WARNING), Latvian message, English description, affected field(s), and optional conditions/thresholds. Also provides aggregated rules for error bubbling and pre-built `ALL_ERRORS` / `ALL_WARNINGS` summary arrays.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 238-263 | `FILE_TYPE_MISMATCH_PHOTO`, `FILE_TYPE_MISMATCH_VIDEO`, and `FILE_TYPE_MISMATCH_AUDIO` all share the same `id: 'FILE_TYPE_MISMATCH'`. If rules are looked up or deduplicated by ID, only one will survive. | Give each a unique ID matching the constant name (e.g., `FILE_TYPE_MISMATCH_PHOTO`, `FILE_TYPE_MISMATCH_VIDEO`, `FILE_TYPE_MISMATCH_AUDIO`). |
| 2 | Info | 296-312 | Aggregated rules (`FILE_VALIDATION_FAILED`, `RECORD_VALIDATION_FAILED`, `ITEM_VALIDATION_FAILED`) lack `message_lv` fields unlike all other rules. | Add Latvian messages for consistency, even if they are generated dynamically. |
| 3 | Info | 243 | Allowed photo extensions include `.gif` -- GIF is typically animated/low-quality; confirm this is intentional for archival use. | Verify with archival standards whether GIF is acceptable. |
| 4 | Info | 272 | `FILE_LARGE_SIZE` threshold comment says "524,288,000 bytes" but 500 MB in base-10 is 500,000,000 bytes. The label says "MB". | Clarify whether the threshold is 500 MB (500,000,000) or 500 MiB (524,288,000). |

## Quality Score: 9/10
