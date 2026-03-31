# QA Report: ValidationSettings.jsx
> Path: `src/Settings/components/ValidationSettings.jsx` | Lines: 354 | Last audit: 2026-03-16

## Meta Description
Validation settings tab allowing users to configure file upload warning thresholds (file size, audio/video duration, image dimensions, orientation). Provides master and per-category toggles, numeric inputs with formatted display, and three quick-preset buttons (strict, standard, relaxed). All settings produce warnings only, not hard blocks.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 105-114 | Indentation breaks at line 105 -- `<input>` and subsequent elements drop out of their parent `<div className="settings-field">` nesting level, suggesting a formatting error | Verify JSX nesting is correct and re-indent lines 105-128 |
| 2 | Low | 110 | `parseInt(e.target.value) \|\| 100` means entering "0" falls back to 100 instead of allowing zero | Use `parseInt(e.target.value) ?? 100` or validate minimum separately via `min` attribute |
| 3 | Low | 267-345 | Three quick-preset buttons duplicate large config objects inline (~40 lines each) | Extract preset configs into named constants (e.g., `STRICT_PRESET`, `STANDARD_PRESET`, `RELAXED_PRESET`) |
| 4 | Info | 136-171 | Multiple inline styles for flex layouts on duration input rows | Extract to CSS classes for consistency with the rest of the styling |

## Quality Score: 7/10
