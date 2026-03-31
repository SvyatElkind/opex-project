# QA Report: usePerformance.js
> Path: `src/hooks/usePerformance.js` | Lines: 80 | Last audit: 2026-03-16

## Meta Description
A performance monitoring hook that wraps the `PerformanceMonitor` utility. It automatically measures component mount/unmount timing via `useEffect` and provides `measureFunction`, `startMeasure`, and `endMeasure` helpers for ad-hoc performance tracking of synchronous and asynchronous operations.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 16-23 | The `useEffect` calls `startMeasure` on mount and `endMeasure` on unmount (cleanup). This measures the component's entire lifetime, not its mount duration. The label says "Mount" which is misleading. | To measure actual mount time, call both `startMeasure` and `endMeasure` inside the effect body (not cleanup). Use the cleanup function for a separate "Unmount" or "Lifetime" measurement. |
| 2 | Low | 31-53 | `measureFunction` returns a new wrapper function on every render because it is not memoized with `useCallback`. If passed as a prop, it will cause unnecessary child re-renders. | Wrap `measureFunction` in `useCallback` (with `componentRef` as the stable dependency). |
| 3 | Low | 59-71 | `startMeasure` and `endMeasure` are similarly not memoized, creating new function references each render. | Wrap in `useCallback` for referential stability. |
| 4 | Info | 77-78 | `getStats` and `logAllStats` are bound to `performanceMonitor` on every render, creating new function references each time. | Move the bindings into a `useMemo` or bind them once at module scope. |

## Quality Score: 6/10
