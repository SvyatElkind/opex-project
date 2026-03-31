# QA Report: ActiveProject.js
> Path: `src/Project/ActiveProject.js` | Lines: 68 | Last audit: 2026-03-16

## Meta Description
Wrapper component that fetches project data via `useProject`, syncs it to the NavigationContext, and renders the Inventories component. Handles loading and error states, with special handling to ignore the "missing report" error (delegated to the parent Project component).

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 33 | Error message check uses `"Nav importēta VVAIS atskaite"` while Project.js line 101 uses `"Nav importēta VVAIS atskite."` (different spelling) — mismatch could cause the error to slip through | Unify the string into a constant shared by both components |
| 2 | Low | 1 | `useState` imported but never used | Remove unused import |
| 3 | Low | 57 | `key` prop on Inventories uses `Date.now()` — forces full remount on every parent re-render | Use a stable key like `projectId` combined with a data version |

## Quality Score: 8/10
