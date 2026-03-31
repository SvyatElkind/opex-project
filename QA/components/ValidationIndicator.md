# QA Report: ValidationIndicator.jsx
> Path: `src/components/ValidationIndicator.jsx` | Lines: 179 | Last audit: 2026-03-16

## Meta Description
Reusable validation status indicator that shows an icon (error/warning/valid/unknown) with optional tooltip, clickable details panel, and issue count badge. Uses refs for click-outside detection and supports configurable size, position, and interactivity props.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 158-174 | The details panel is rendered as a sibling outside `.validation-indicator-wrapper` via a Fragment, which can cause layout and z-index positioning issues in certain parent contexts | Render the details panel inside the wrapper or use a React Portal |
| 2 | Low | 59, 67, 73, 80 | Color values are hardcoded (`#ef4444`, `#f59e0b`, `#10b981`, `#6b7280`) instead of using CSS variables from the theme | Use `var(--color-error)`, `var(--color-warning)`, etc. for theme consistency |
| 3 | Low | 170 | Tooltip renders inside the clickable indicator div, so hovering the tooltip itself may cause flickering on mouse boundaries | Consider rendering the tooltip outside the indicator or adding pointer-events handling |
| 4 | Info | 52-83 | `getIndicatorConfig` is recreated on every render with hardcoded Latvian label strings | Extract config to a constant object and move labels to a constants file |

## Quality Score: 7/10
