# QA Report: roadmapConstants.js
> Path: `src/Constants/roadmapConstants.js` | Lines: 85 | Last audit: 2026-03-16

## Meta Description
Contains all Latvian UI text constants for the Roadmap Wizard feature: wizard titles, expertise-level selection labels, project-type selection, goal-setting labels and placeholders, summary display, navigation buttons, progress display, edit-goals labels, project-type display names, route statuses, and route management messages.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Info | 71 | `TYPE_AUDIO` is `"Audio"` but the application's canonical Latvian term elsewhere is `"Skaņas"`. | Use consistent terminology with `inventoryConstants.js` or add a mapping comment explaining this is a display name. |

## Quality Score: 10/10
