# QA Report: VerificationModal.jsx
> Path: `src/Verification/VerificationModal.jsx` | Lines: 1261 | Last audit: 2026-03-16

## Meta Description
Large modal component serving as the main verification and export hub. Validates the project via `validateProjectForOPEX`, computes detailed statistics and guide data (inventory breakdown, type distribution, route-specific issues), and renders a tabbed interface with summary stats, a tree view, and route-based guide panels. Contains nested `ExportPopup` and `OpexPopup` sub-components. Integrates with NavigationContext, RoadmapContext, and multiple export hooks.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | High | 456-460 | `useEffect` calls `runValidation()` with `[isOpen, projectData]` dependency, but `runValidation` is not in the dependency array and is not wrapped in `useCallback`. This is a stale-closure risk and will trigger an ESLint exhaustive-deps warning. | Wrap `runValidation` in `useCallback` and include it in the dependency array, or inline the logic. |
| 2 | Medium | 1-900 | File is approximately 900 lines with multiple sub-components (`ExportPopup`, `OpexPopup`), large `useMemo` blocks, and extensive JSX. This makes the file hard to maintain and test. | Extract `ExportPopup`, `OpexPopup`, the stats bar, and the guide tab into separate files. |
| 3 | Medium | 113-216 vs 218-319 | The `stats` useMemo block duplicates iteration logic that also exists in `guideData`. Both iterate over all inventories, items, records, and files. | Consolidate into a single pass or extract a shared data-preparation utility. |
| 4 | Medium | 481-486 | `catch (error)` in `runValidation` swallows the error entirely -- no logging, no user feedback. | Add `console.error(error)` or display an error toast. |
| 5 | Low | 492-493 | `handleNodeClick` is an empty function passed as `onNodeClick` to VerificationTreeView. | Either implement click behavior or remove the prop. |
| 6 | Low | 103 | `activeTab` state defaults to `'parskats'` (Latvian) -- mixing language in state values can be confusing for developers. | Use English keys internally and map to Latvian only in the UI layer. |

## Quality Score: 6/10
