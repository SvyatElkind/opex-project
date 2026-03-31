# QA Report: Project
> Path: `src/Project/Project.js` | Last audit: 2026-03-24

## Purpose
Top-level application component that manages the project workspace. Handles project selection (tabs), CRUD operations (create, rename, delete), report upload, and orchestrates all major UI panels: verification modal, institution signers popup, settings, dev admin panel, roadmap wizard, and smart guide. Acts as the main entry point for the entire OPEX tool UI.

## Props
None -- this is a top-level component with no props.

## User Interaction Flow
1. **Loading**: Fetches all projects via `useProjects()`. If empty and no interaction yet, auto-opens `ProjectPopup` for creation.
2. **Empty state**: Shows decorative empty state with "Create Project" button and help icon.
3. **Project tabs**: Each project shown as a tab button with name, info tooltip (created_at via `formatTimestamp`, folder), and action buttons (rename via pencil, delete via trash) on the active tab.
4. **Tab selection**: `handleActivateTab(projectId)` sets `selectedProjectId`. First project auto-selected on load.
5. **Create project**: "+" button or empty state button opens `ProjectPopup`. Interaction tracked via `hasInteractedWithCreatePopup`.
6. **Rename project**: Pencil icon opens `RenameProjectPopup`. Calls `renameProjectMutation.mutateAsync({ projectId, newName })`.
7. **Delete project**: Trash icon opens `WarningPopup`. Calls `deleteProjectMutation.mutateAsync(projectToDelete.id)`.
8. **Missing report state**: If `projectError.message` includes "Nav importēta VVAIS atskite.", shows missing-report banner with upload button and delete option. Upload popup auto-opens once.
9. **Upload report**: `UploadPopup` for VVAIS report file. On success, `refetchProject()` and toast notification.
10. **Active project view**: When project has data and report is present:
    - `NavigationProvider` wraps `ProjectNavigation`, `ActiveProject`, `VerificationModal`, and `SmartGuideCard`.
    - Right-side menu: Signers button (with `missingSigners` indicator), Status/Verification button, Smart Guide button, Settings button, Help button.
11. **Verification modal**: Opened via "Status" button or `openValidationModal` custom event. Passes `onOpenSigners` callback.
12. **Institution signers**: `InstitutionSignersPopup` opened via button or `openSignersModal` event. Outside NavigationProvider.
13. **Settings**: Opens `Settings` modal.
14. **Dev admin panel**: Opens via Ctrl+Shift+D or `openDevAdminPanel` event (dev mode only via `isDevMode()`).
15. **Roadmap wizard**: Auto-opens 1s after report upload if no roadmap exists (`!hasRoadmap(selectedProjectId)`). Also triggered by `openRoadmapWizard` event with optional `editingRouteId`.
16. **Toast notifications**: Displayed for success operations via `handleToast()` with `TOAST_CONFIG.TIMER` auto-dismiss.
17. **Scroll direction**: `useScrollDirection(100)` tracks scroll for tab group visibility.
18. **Clipboard**: Info icon copies project folder path via `navigator.clipboard.writeText()`.

## Validation
- `validateProjectForOPEX(activeProjectData)` memoized via useMemo for smart guide and workflow state.
- `useWorkflowState(activeProjectData, validationResult, projectRoadmap)` computes `missingSteps` including `'signers'`.
- No form validation in this component (delegated to popup components).

## API Integration
- **Hooks**: `useProjects()`, `useProject(selectedProjectId)`, `useRenameProject()`, `useDeleteProject()` from `hooks/useProjects`
- **Roadmap**: `useRoadmap()` -> `hasRoadmap()`, `getRoadmap()`
- **Scroll**: `useScrollDirection(100)` from `hooks/useScrollDirection`
- **Workflow**: `useWorkflowState()` from `Guidance/useWorkflowState`
- **Events listened**: `openDevAdminPanel`, `openValidationModal`, `openSignersModal`, `openRoadmapWizard`, `showSmartGuide`

## Known Limitations
- Auto-open popup flags (`hasInteractedWithCreatePopup`, `hasInteractedWithUploadPopup`) reset in useEffects that may fire unexpectedly when conditions change.
- Roadmap wizard auto-open uses a 1-second `setTimeout` hardcoded delay.
- `hasShownRoadmapWizard` resets on project switch, causing wizard to re-appear for projects without roadmaps.
- `toastVisable` has a typo (should be `toastVisible`).
- `formatTimestamp` uses UTC methods but display format suggests local time intent.
- Tab group animation state management (`tabGroupVisible`, `tabGroupAnimating`, spacer ref) is complex.
- 20+ state variables in a single component -- significant complexity.
- `isMissingReport` check uses string matching on error message, which is fragile.

## Quality Score: 6/10
