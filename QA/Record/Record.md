# QA Report: Record
> Path: `src/Record/Record.js` | Last audit: 2026-03-24

## Purpose
Main record view component that displays a single record's details with a tabbed interface (Info, Metadata, Files). Supports inline editing for media records, popup editing for document records, deletion, and pagination between sibling records within the same item. Rendered inside Items.js when a record is selected.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `recordId` | `number` | Yes | - | ID of the record to display |
| `projectId` | `number/string` | Yes | - | Active project ID |
| `itemId` | `number` | Yes | - | Parent item ID |
| `inventory` | `object` | Yes | - | Parent inventory object |
| `onBack` | `function` | No | - | Callback for back navigation; falls back to `navigateBackSmart()` |

## User Interaction Flow
1. Component loads, fetches record metadata via `useRecord(projectId, recordId)`.
2. Locates the record in `projectData` (from NavigationContext) by searching all inventories/items/record arrays (records, photo_records, video_records, audio_records).
3. Merges API metadata (actions, addressees, visas, read_status) with main record data from project tree.
4. **Pagination header**: shows current position (e.g., "3/15"), prev/next buttons, and a jump-to input.
5. **Tab bar**:
   - **Info tab** (always visible): For document records, displays read-only card layout with Basic Info, Document Details, Description, and Access sections. For media records, renders `<MediaRecordForm>`.
   - **Metadata tab** (document records only): renders `<RecordMetadata>` with sub-tabs for Actions, Addressees, Visas, Read Status. Badge counts shown on tab buttons.
   - **Files tab**: renders `<RecordFiles>`. Badge shows file count; if no files, shows `ValidationIndicator` (error for electronic docs, warning otherwise).
6. **Files view toggle**: table/card view buttons appear when Files tab is active.
7. **Edit flow**:
   - For **document records**: clicking Edit opens `<EditDocumentRecord>` popup. The popup supports prev/next navigation via `handleEditNavigate` which closes popup, navigates to new record, and re-opens popup via `reopenEditRef`.
   - For **media records**: clicking Edit toggles inline `isEditing` state. Form fields appear in-place with Save/Cancel buttons.
8. **Delete flow**: Delete button opens `<RecordDeletePopup>`. On confirm, `deleteRecordMutation.mutateAsync()` is called, queries invalidated, then navigates back.
9. **Keyboard navigation**: ArrowLeft/ArrowRight navigate between records (unless in input/textarea/select or popups are open). If editing, saves first then navigates via `saveAndNavigateRecord`.
10. **Jump-to**: number input + Enter or button click navigates to the Nth record in the sorted list.
11. **Scroll position preservation**: scroll position is saved before file operations and restored after `projectData` updates via 100ms setTimeout.
12. **Tab persistence**: active tab stored in `sessionStorage` under key `record_active_tab` during record navigation.

## Validation
- Inline media edit: `validateRecordForm(editFormData, inheritanceInfo.isMedia)` + `hasValidationErrors(errors)` from `Utils/RecordValidation`.
- Validation errors displayed inline; error messages from `RECORD_ERROR_MESSAGES`.
- Success/error message auto-dismiss after 3 seconds.

## API Integration
- **Hooks**: `useRecord(projectId, recordId)`, `useUpdateRecord()`, `useUpdateMediaRecord()`, `useDeleteRecord()` from `hooks/useRecords`; `useUploadFiles()`, `useDeleteFile()` from `hooks/useFiles`
- **Navigation**: `useNavigation()` -> `projectData`, `navigateBackSmart()`, `navigateTo()`, `activeTab`, `clearActiveTab`, `getActiveTab`
- **Query invalidation**: `queryClient.invalidateQueries(['project', projectId])` on file operations and delete.

## Known Limitations
- The `mainRecordData` useMemo iterates all inventories/items/records on every projectData change -- O(n*m*k) complexity. Could be slow for large projects.
- `useRecord` API fetch and `projectData` search are redundant data sources; merging logic may produce stale data if one updates before the other.
- Keyboard navigation (ArrowLeft/Right) calls `saveAndNavigateRecord` which sets error but does not block navigation attempt on validation failure.
- The `reopenEditRef` pattern for re-opening edit popup after navigation is fragile and depends on `useEffect([recordId])` timing.
- `onKeyPress` on the jump input is deprecated; should use `onKeyDown`.
- Scroll position restoration uses a 100ms `setTimeout` which may not always work reliably.

## Quality Score: 7/10
