# QA Report: Sidebar.js
> Path: `src/Navigation/components/Sidebar.js` | Lines: 85 | Last audit: 2026-03-16

## Meta Description
A project sidebar navigator that lists all projects and expands the active one to show its fond, inventories, and items. Marked as likely dead code by a TODO comment on line 1. Destructures `currentProject` and `sidebarOpen` from NavigationContext, which do not exist in the current provider. The component never renders visible content.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Critical | 1, 8-13 | Component destructures `currentProject` and `sidebarOpen` from `useNavigation()`, but NavigationContext does not expose these values. `sidebarOpen` is always `undefined`, so the guard on line 18 (`if (!sidebarOpen) return null`) causes the component to always return null. This is confirmed dead code per the TODO on line 1. | Remove the file entirely, or rewrite it to use the current NavigationContext API (`currentProjectId`, etc.). |
| 2 | High | 4, 16 | Imports `useProjects` and `useProject` from `../../hooks/useProjects`. `useProject(currentProject)` is called with `undefined`, which may trigger an unnecessary API call with an undefined ID on every render where the module is imported. | Remove the dead code to avoid wasteful API calls. |
| 3 | Medium | 30 | `project.id === currentProject` comparison always evaluates to false since `currentProject` is undefined. Active project highlighting never works. | Dependent on fixing issue #1. |

## Quality Score: 2/10
