# QA Report: WarningPopup.js
> Path: `src/Project/WarningPopup.js` | Lines: 224 | Last audit: 2026-03-16

## Meta Description
Project deletion confirmation popup with a 10-second countdown timer, animated SVG progress circle, and project statistics display (inventories, items count). Uses React Portal, a ref to prevent double-confirmation, and allows cancellation during the countdown. Statistics are memoized from the project data structure.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 7 | Prop name `projectdata` is lowercase — inconsistent with React conventions and the JSX attribute in Project.js also has a spacing issue | Rename to `projectData` |
| 2 | Low | 63 | `projectStats` counts records and files but only inventories and items are displayed in the UI (lines 184-193) | Either display records/files counts or remove the unused counting logic |
| 3 | Low | 75-78 | Countdown reaches 0 and calls `onConfirm()` inside a `useEffect` — if `onConfirm` changes identity, the ref guard may not work | Wrap `onConfirm` in a ref to ensure stable reference |
| 4 | Low | 148 | SVG `strokeDashoffset` uses magic number 283 (circle circumference 2*PI*45) | Extract as a named constant for clarity |

## Quality Score: 7/10
