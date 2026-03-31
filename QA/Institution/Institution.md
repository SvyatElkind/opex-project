# QA Report: Institution.js
> Path: `src/Institution/Institution.js` | Lines: 157 | Last audit: 2026-03-16

## Meta Description
Institution.js renders the institution signer information section within a project. It displays creator and signer names/positions in a text format with inline editing capability. When all fields are empty, it shows an "Add Signers" button that opens the `InstitutionSignersPopup`. Individual field editing is handled by the `InstitutionSigner` component. Uses a custom tooltip state for hover hints.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | WARNING | 37-38 | `handleSaveField` has an empty `catch` block that silently swallows API errors. The field edit closes (line 40) even on error. | Show an error message to the user and keep the edit modal open on failure. |
| 2 | WARNING | 47-51 | `allFieldsEmpty` checks with strict equality `=== ""` but if any field is `null` or `undefined` (from API), the check will be `false` and the "Add Signers" button will not appear. | Use a more robust check: `!institution.creator && !institution.creator_position && ...`. |
| 3 | WARNING | 59-88 | Hardcoded Latvian UI strings directly in JSX (`'Uzskaites Saraksta Sagatavoja'`, `'Amats'`, `'Rediģēt sagatavotāju'`, etc.) instead of using constants. | Move to `INSTITUTION_CONSTANTS` or a new UI constants section. |
| 4 | WARNING | 124-128 | Tooltip rendered as a plain div with class "tooltip" without positioning logic. It will appear at the end of the parent div, not near the hovered element. | Use a proper tooltip library or add position calculation. |
| 5 | INFO | 80-88, 118-127 | Edit icon buttons duplicate the onClick behavior already on the value spans. Two clickable areas do the same thing. | Consider removing one of the duplicate click targets to simplify. |

## Quality Score: 6/10
