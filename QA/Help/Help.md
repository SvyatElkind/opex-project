# QA Report: Help.js
> Path: `src/Help/Help.js` | Lines: 182 | Last audit: 2026-03-16

## Meta Description
Full-page help documentation viewer with a chapter/section sidebar navigation and a content area that renders multiple content types (paragraph, list, image, note, code, heading). Uses URL hash for deep linking to specific chapters. Content is driven by the `HELP_CHAPTERS` constant.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 66-69 | Image error handler uses `e.target.nextSibling` DOM traversal which is fragile and can break if the DOM structure changes | Use a React state flag per image to conditionally render the placeholder instead of direct DOM manipulation |
| 2 | Low | 34 | Setting `window.location.hash` directly causes a full browser navigation event and may trigger unwanted scroll behavior | Use `history.replaceState` or a React-based routing mechanism |
| 3 | Low | 97-106 | Heading content type uses inline styles instead of a CSS class, inconsistent with all other content types | Extract to a CSS class (e.g., `.help-content-heading`) |
| 4 | Info | 41 | `renderContent` uses array `index` as key, which can cause issues if content is reordered dynamically | Use a stable identifier if content items have one |

## Quality Score: 7/10
