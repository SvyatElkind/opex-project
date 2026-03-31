# QA Report: ConstantsContext.js
> Path: `src/context/ConstantsContext.js` | Lines: 183 | Last audit: 2026-03-16

## Meta Description
React context provider that fetches application constants from an API on mount, falling back to hardcoded `FALLBACK_CONSTANTS` on failure. Exposes categorized constants (inventory types, storage terms, item properties, record restrictions) and helper functions (type checks for media, annotation, duration, color, resolution requirements) to all descendants via `useConstants()`.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 55-158 | The `value` object is recreated on every render with new function references, causing all context consumers to re-render unnecessarily | Wrap the value object in `useMemo` to stabilize the reference |
| 2 | Medium | 34-52 | No retry mechanism for the API fetch; if the initial request fails, fallback constants are used permanently until page reload | Add a retry mechanism or expose a `refetch` function in the context value |
| 3 | Low | 67-81 | Each property accessor individually falls back (e.g., `constants.inventory?.type \|\| FALLBACK_CONSTANTS.inventory.type`), which is verbose and could drift as new properties are added | Deep-merge the API response with fallbacks once during fetch |
| 4 | Info | 108-150 | Helper functions reference imported constant arrays directly (not state), so they always use fallback values even when API provides different data | If API constants can override these arrays, helpers should reference the stateful `constants` object |

## Quality Score: 7/10
