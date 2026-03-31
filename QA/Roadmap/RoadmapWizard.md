# QA Report: RoadmapWizard.jsx
> Path: `src/Roadmap/RoadmapWizard.jsx` | Lines: 675 | Last audit: 2026-03-16

## Meta Description
Multi-step wizard for creating/editing project roadmap routes. Supports two modes (expert: 2 steps, guided: 5 steps) covering expertise level, document format/type, inventory selection, goal setting, and summary with route management. Persists wizard session to localStorage and allows creating multiple routes per project.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | High | 472-477 | `useEffect` in `StepInventorySelection` has `updateField` in the dependency array; since `updateField` is not memoized with `useCallback`, this can cause an infinite re-render loop | Memoize `updateField` with `useCallback` in the parent, or remove it from the dependency array |
| 2 | Medium | 65-71 | Wizard saves session data to localStorage on every `roadmapData` change without debouncing | Debounce the write or save only on step transitions |
| 3 | Low | 466 | `React.useState` is used instead of destructured `useState` for `selectionMode`, inconsistent with the rest of the file | Use the destructured `useState` import |
| 4 | Low | 651-665 | Edit button dispatches `openRoadmapWizard` custom event from within the wizard itself, which could cause recursive wizard opening | Guard the event listener against re-opening if the wizard is already open |
| 5 | Info | 277-675 | Five sub-components are defined in the same 675-line file | Consider extracting each step to its own file for maintainability |

## Quality Score: 6/10
