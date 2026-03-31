# QA Report: useNextActions.js
> Path: `src/Guidance/useNextActions.js` | Lines: 242 | Last audit: 2026-03-16

## Meta Description
Custom hook that computes a prioritized list of next actions for the user based on project data, validation results, and current workflow state. Actions range from critical (fix errors, upload files) to low priority (review warnings). Falls back to workflow-step suggestions when no critical actions exist. Returns a sorted array by priority.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 17-19 | `errorCount` sums `criticalIssues` from `validationResult.inventoryValidations` without null-guarding `invVal.validation` or `invVal.validation.details`. If any inventory validation entry is malformed, this will throw. | Add optional chaining: `invVal.validation?.details?.criticalIssues || 0`. |
| 2 | Medium | 73-76, 100-103, 131-135 | Three action objects have empty `action: () => {}` callbacks -- "add items to inventories", "add records to items", and "add files to records" do nothing when triggered. These are stubs that were never completed. | Implement the navigation/modal-opening logic or add a visible TODO comment explaining the gap. |
| 3 | Low | 109 | `if (!inv.electronic) return;` skips non-electronic inventories when checking for records without files. This is correct for OPEX but the intent could be clearer. | Add a descriptive comment: "Physical records don't require digital file attachments." |
| 4 | Low | 51 | The "missing signers" check only fires when `currentState === WORKFLOW_STATES.REPORT_UPLOADED`, but signers could be missing at later states too. | Consider showing this action whenever signers are missing, regardless of state. |

## Quality Score: 6/10
