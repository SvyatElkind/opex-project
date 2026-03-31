# QA Report: EditMediaRecordMetadata.js
> Path: `src/Record/EditMediaRecordMetadata.js` | Lines: 329 | Last audit: 2026-03-16

## Meta Description
Modal for editing media record metadata (color, resolution, duration) based on inventory type. Displays auto-extracted field warnings, validates form data using shared validation utilities, and submits updates via the `useUpdateMediaRecord` hook. Renders via React Portal and reuses CreateMediaRecord.css for styling.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 133 | Backdrop click handler checks `e.target.className === 'media-record-modal-backdrop'` — fragile if className changes or has multiple classes | Use `e.target === e.currentTarget` pattern instead |
| 2 | Low | 114-117 | `setTimeout` with 300ms delay before calling `onUpdate`/`onClose` — no cleanup on unmount | Store timeout ref and clear on component unmount |
| 3 | Low | 213 | Resolution fields shown when `inheritanceInfo.type !== 'Skaņas'` — less explicit than the positive check `Foto || Video` used in CreateMediaRecord | Use consistent positive type checks across components |

## Quality Score: 8/10
