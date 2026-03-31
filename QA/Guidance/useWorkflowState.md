# QA Report: useWorkflowState.js
> Path: `src/Guidance/useWorkflowState.js` | Lines: 249 | Last audit: 2026-03-16

## Meta Description
Custom hook that determines the current workflow state and cumulative progress (0-100) based on project completeness checks (report uploaded, signers present, inventories/items/records/files created, validation status). Supports roadmap-based filtering by inventory type or number. Returns state label, progress percentage, canExport flag, and missing steps array.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 172-173 | `hasFiles` check uses `.some()` -- it considers files present if ANY record in ANY electronic inventory has files, even if most records lack files. This gives an overly optimistic progress score. | Consider a ratio-based check or at least a warning when file coverage is low. |
| 2 | Low | 196 | `summary.readyForOPEX` is accessed without null-checking `summary`. If `validationResult` exists but `summary` is undefined, this throws. | Add `validationResult?.summary?.readyForOPEX`. |
| 3 | Low | 196-205 | When `readyForOPEX` is true, the function returns with `progress: 100` but `missingSteps` may still contain earlier incomplete items (e.g., "signers"). This could be misleading. | Clear `missingSteps` before returning when ready for export. |

## Quality Score: 8/10
