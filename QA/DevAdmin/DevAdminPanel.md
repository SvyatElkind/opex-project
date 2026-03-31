# QA Report: DevAdminPanel.jsx
> Path: `src/DevAdmin/DevAdminPanel.jsx` | Lines: 150 | Last audit: 2026-03-16

## Meta Description
Development-only draggable admin panel rendered via `ReactDOM.createPortal`. Features tabbed navigation (Project State, LocalStorage, Validation, Quick Actions), minimize/restore functionality, and drag-to-reposition via mouse events. Intended to be deleted before production release.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | High | 1-150 | No runtime guard (`if (process.env.NODE_ENV !== 'development') return null`) to prevent accidental rendering in production | Add a production guard at the top of the component |
| 2 | Medium | 52-61 | `useEffect` for drag tracking references `handleMouseMove` and `handleMouseUp` which are recreated each render, causing stale closures | Wrap handlers in `useCallback` or define them inside the effect |
| 3 | Low | 82 | Overlay click handler compares `e.target.className === 'dev-admin-overlay'` as a string, which breaks if CSS modules or additional classes are applied | Use `e.target === e.currentTarget` or `e.target.classList.contains(...)` |
| 4 | Info | 18-20 | Initial position is hardcoded to `{ x: 100, y: 100 }` which may be off-screen on small viewports | Center the panel or clamp to viewport bounds |

## Quality Score: 5/10
