# QA Report: RoadmapContext.jsx
> Path: `src/Roadmap/RoadmapContext.jsx` | Lines: 301 | Last audit: 2026-03-16

## Meta Description
Context provider managing multiple project roadmap routes per project, persisted in localStorage. Supports CRUD operations, status tracking (in_progress/completed/archived), legacy single-roadmap compatibility, data migration from the old format, and progress calculation against goals.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 25 | `Math.random().toString(36).substr(2, 9)` uses the deprecated `substr` method | Replace with `.substring(2, 11)` |
| 2 | Medium | 67-73 | The save `useEffect` writes to localStorage on every `roadmaps` state change, including the initial empty `{}` state before the load effect runs, which can overwrite saved data | Add a `loaded` ref flag to skip the save on the initial hydration |
| 3 | Low | 179 | `setRoadmap` reads `roadmaps` from closure state (stale closure risk) despite having it in the `useCallback` dependency array | Use the `setRoadmaps(prev => ...)` functional updater pattern consistently instead of reading `roadmaps` directly |
| 4 | Info | 220-273 | `calculateProgress` is a pure function with no dependency on context state | Extract as a standalone utility for easier testing and reuse |

## Quality Score: 7/10
