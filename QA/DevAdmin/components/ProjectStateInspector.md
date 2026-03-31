# QA Report: ProjectStateInspector.jsx
> Path: `src/DevAdmin/components/ProjectStateInspector.jsx` | Lines: 168 | Last audit: 2026-03-16

## Meta Description
Dev tool that provides a tree/raw JSON inspector for the current project state. Features expandable tree navigation, raw JSON view, text search filtering, copy-to-clipboard, and JSON download. Shows project summary stats in a footer.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 90-94 | `filterData` stringifies the entire project data on every search keystroke, which is O(n) on potentially large data | Debounce the search input or memoize the filtered result with `useMemo` |
| 2 | Low | 20 | `navigator.clipboard.writeText` is called without a try/catch; clipboard access can be denied in some contexts | Wrap in try/catch with a fallback message |
| 3 | Low | 21 | Uses native `alert('Project state copied to clipboard!')` | Use an inline log message or toast instead |
| 4 | Info | 35-88 | Recursive `renderValue` function is defined inside the component body and recreated on every render | Extract to a stable reference or move outside the component (acceptable for dev tool) |

## Quality Score: 7/10
