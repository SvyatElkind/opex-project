# QA Report: helpConstants.js
> Path: `src/Constants/helpConstants.js` | Lines: 3290 | Last audit: 2026-03-16

## Meta Description
Massive constants file defining the entire help documentation content as a structured array of chapters, sections, and content blocks (paragraphs, lists, images, notes, headings). All text is in Latvian. Supports rendering via a generic help renderer component. Covers getting started, description processes, projects, inventories, items, records, navigation, and more.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | entire file | At 3290 lines this is an extremely large JS constant. Changing any section requires editing this monolithic file, and it increases the main bundle size significantly. | Consider moving help content to JSON files loaded on demand, or split by chapter into separate modules with lazy loading. |
| 2 | Low | 120-121 | Section title `"ka aprakstit tekstualos dokumentus"` starts with lowercase, inconsistent with other titles that use title case. | Capitalize: `"Ka Aprakstit Tekstualos Dokumentus"`. |
| 3 | Low | 122-133 | The "textual" section under "Aprakstisanas Process" reuses the exact "system requirements" list from the "Getting Started" chapter. Appears to be placeholder content that was never replaced. | Replace with actual textual-document description content. |
| 4 | Low | 115 | Chapter id `help-to` is vague and inconsistent with other chapter naming conventions. | Rename to a more descriptive id such as `description-process`. |
| 5 | Info | 25-29 | Image paths like `/help-images/workspace-overview.png` are hardcoded. If the build output or asset path changes, all references break. | Consider importing images or using a constant for the base path. |

## Quality Score: 6/10
