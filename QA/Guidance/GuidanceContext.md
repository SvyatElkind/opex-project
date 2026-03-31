# QA Report: GuidanceContext.jsx
> Path: `src/Guidance/GuidanceContext.jsx` | Lines: 129 | Last audit: 2026-03-16

## Meta Description
React context provider managing guidance panel visibility, minimized state, user settings (show mode, position, filter toggles), and dismissed action tracking. All state is persisted to localStorage with try/catch safety. Provides a `shouldShowGuide(hasErrors)` helper to determine visibility based on the configured show mode. Exports useGuidance hook, GuidanceProvider, and the raw context.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Low | 39-43 | Default settings define `showCriticalErrors`, `showMissingData`, `showEmptyContainers`, and `showOptimizations` filter flags, but `shouldShowGuide()` (lines 101-106) does not reference any of them. These settings appear unused. | Either wire the filter flags into the guidance display logic or remove them to avoid confusion. |
| 2 | Low | 56-63 | `dismissedActions` is stored as an array and searched with `prev.includes(actionId)` which is O(n). | Consider using a Set or object map for O(1) lookups, converting to/from array for localStorage serialization. |

## Quality Score: 9/10
