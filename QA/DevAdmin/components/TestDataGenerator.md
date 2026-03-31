# QA Report: TestDataGenerator.jsx
> Path: `src/DevAdmin/components/TestDataGenerator.jsx` | Lines: 411 | Last audit: 2026-03-16

## Meta Description
Dev tool that bulk-generates test data (inventories, items, records) via API calls for the active project. Configurable counts for inventories, items, and records-per-textual-item. Distributes inventories across all types, generates Latvian-language names, random dates, and series codes. Shows progress bar during generation.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | High | 23-25 | `Inventory_API()`, `Item_API()`, `Record_API()` are called at the top level of the component on every render; if these are not React hooks, this creates unnecessary objects each render | Verify these follow hook conventions; if not, memoize with `useMemo` or call inside the generate function |
| 2 | Medium | 201-204 | Direct `fetch('/api/v1/project/...')` bypasses the app's API layer with minimal error handling | Use the existing project API wrapper for consistency and proper error handling |
| 3 | Medium | 75-281 | `generateTestData` is a 200+ line async function with no abort mechanism; if the component unmounts mid-generation, state updates on an unmounted component will occur | Use an AbortController or check a mounted ref before state updates |
| 4 | Low | 28-43 | Utility functions (`randomDate`, `generateSeriesCode`, `randomName`) are defined inside the component and recreated each render | Move outside the component since they have no dependency on props or state |
| 5 | Info | 1 | `useState` imported without `React`; works with new JSX transform but inconsistent with sibling files | Standardize import style |

## Quality Score: 5/10
