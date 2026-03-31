# QA Report: InstitutionSignersPopup.jsx
> Path: `src/Institution/InstitutionSignersPopup.jsx` | Lines: 257 | Last audit: 2026-03-16

## Meta Description
InstitutionSignersPopup.jsx is a modal form for adding or editing all four institution signer fields (creator name, creator position, signer name, signer position). It features character counters with warnings near limits, field validation via `institutionConstants`, and uses the `useAddInstitutionSigners` mutation hook. It renders with a header showing the institution name and a help button.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | CRITICAL | 222, 234-236 | The form's submit button (line 234) has `type="submit"` but is placed OUTSIDE the `<form>` tag (form closes at line 222, footer starts at line 225). The `type="submit"` has no effect since the button is not inside the form. Pressing Enter submits the form via HTML, but clicking the button relies on `onClick={handleSubmit}` -- two different code paths. | Move the footer buttons inside the `<form>` element, or change the external button to `type="button"`. |
| 2 | WARNING | 67-69 | `setTimeout(() => onClose(), 1500)` delays modal close after success. During this window, the user can still interact with the form or click save again, potentially triggering duplicate submission. | Disable form inputs and buttons after successful save, or close immediately and show a toast. |
| 3 | WARNING | 101-103 | `GeneralError` is conditionally rendered with `{generalError && ...}` while other components pass the prop directly and let the component handle visibility. Minor inconsistency. | Use `<GeneralError message={generalError} onClose={clearErrors} />` without the conditional wrapper. |
| 4 | INFO | 96 | HelpButton uses `chapterId="projects"` but this is the institution signers popup. The help chapter may not be the most relevant. | Consider using a more specific chapter like "institution" if available. |
| 5 | INFO | 1 | File uses `.jsx` extension while most other files in the project use `.js`. | Align file extension convention across the project. |

## Quality Score: 7/10
