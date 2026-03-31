# QA Report: RecordFiles
> Path: `src/Record/RecordFiles.js` | Last audit: 2026-03-24

## Purpose
File management component for a single record. Provides two view modes (table and card), drag-and-drop upload, multi-select for batch deletion, a sliding side panel for file details, and per-file validation indicators. Rendered within the Record component on the Files tab.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `recordId` | `number` | Yes | - | Record ID for file operations |
| `projectId` | `number/string` | Yes | - | Project ID for API calls |
| `files` | `array` | No | `[]` | Array of existing file objects |
| `canUpload` | `boolean` | No | `true` | Whether upload is allowed (false for media records) |
| `viewMode` | `string` | No | `'table'` | View mode: `'table'` or `'card'` |
| `onFileOperationStart` | `function` | No | `null` | Callback before file upload/delete (for scroll preservation) |
| `onFileOperationComplete` | `function` | No | `null` | Callback after file upload/delete (for query invalidation) |
| `category` | `string` | No | `'ELECTRONIC_DOCUMENTS'` | Inheritance category for validation |
| `inventoryType` | `string` | No | `'Tekstuāls'` | Inventory type for terminology and icon selection |

## User Interaction Flow
1. **Empty state**: If no files and `canUpload=true`, shows a dropzone with drag-and-drop support and click-to-browse.
2. **File selection**: Files chosen via input or drag-and-drop are added to `selectedFiles` state (pending upload). Multiple files can be queued.
3. **Pending files bar**: Shows count of files ready to upload with "Upload" and "Clear" buttons.
4. **Upload**: `uploadFilesMutation.mutateAsync({ projectId, recordId, files, onProgress })` is called. Progress tracked via `uploadProgress` state.
5. **Table view**: Grid layout with columns: checkbox, validation indicator, filename (with colored file-type icon), type badge, size, add button (in header), delete button (in header for batch). Pending files shown as special rows at top with "Jauns" badge.
6. **Card view**: Card grid with an "Add" card (if `canUpload`), pending file cards, and existing file cards. Each card shows icon, name, size, type badge, and validation indicator.
7. **File click**: Opens side panel showing file details (name, type, size, SHA-256 checksum) with a delete button.
8. **Multi-select**: Checkboxes in table view allow selecting multiple files. "Select all" checkbox in header. Batch delete button in header activates when files are selected.
9. **Single delete**: Trash icon per file row/card opens `FileDeletePopup`.
10. **Batch delete**: Deletes files sequentially (one `deleteFileMutation.mutateAsync` per file in a loop).
11. **Download**: `handleDownload` opens `/api/v1/project/{projectId}/file/{fileId}/download/` in a new tab.
12. **Drag-and-drop**: Both table and card wrappers support drag-over/drop with visual overlay.
13. **Media terminology**: For Foto/Video/Skaņas inventories, labels change to "foto dokumentu", "video dokumentu", "audio dokumentu" via `getDocumentTerm()`.

## Validation
- Per-file validation via `InheritanceUtils.validateFile(file, category, inventoryType)` shown as `ValidationIndicator` per row/card.
- No upload-time file type or size validation in this component (relies on backend).

## API Integration
- **Hooks**: `useUploadFiles()`, `useDeleteFile()` from `hooks/useFiles`
- **Upload**: `uploadFilesMutation.mutateAsync({ projectId, recordId, files, onProgress })`
- **Delete**: `deleteFileMutation.mutateAsync({ projectId, fileId })`
- **Download URL**: `/api/v1/project/${projectId}/file/${file.id}/download/`
- **Notifications**: `useNotification()` -> `notify.error()` for upload/delete errors.

## Known Limitations
- Batch delete is sequential (not parallel) -- could be slow for many files.
- No client-side file type or size validation before upload.
- Download uses `window.open()` in a new tab rather than the `downloadFile()` helper from apiClient.
- `handleFileSelect` (input change) and `handleFileSelect2` (checkbox) use confusingly similar names.
- Side panel close uses a 300ms `setTimeout` before clearing `selectedFile`, which could cause flash of old content if re-opened quickly.
- The `uploadProgress` state is set but never rendered in the UI -- no progress bar shown.

## Quality Score: 7/10
