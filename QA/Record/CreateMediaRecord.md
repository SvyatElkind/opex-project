# QA Report: CreateMediaRecord
> Path: `src/Record/CreateMediaRecord.js` | Last audit: 2026-03-24

## Purpose
Two-step modal for creating media records (Photo, Video, Audio). Step 1: file upload with drag-and-drop. Step 2: metadata entry for fields the backend could not auto-extract from the uploaded file. Used within the Items component when creating a record on a media-type inventory (Foto, Video, Skaņas).

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onClose` | `function` | Yes | - | Callback to close the modal |
| `onCreate` | `function` | Yes | - | Callback with `{ id: recordId }` on success |
| `item` | `object` | Yes | - | Parent item (provides `item.id` for API call) |
| `inventory` | `object` | Yes | - | Parent inventory (used by `InheritanceUtils.getInheritanceInfo()` to determine media type) |
| `projectId` | `number/string` | Yes | - | Active project ID |

## User Interaction Flow
1. Modal opens at **Step 1: File Upload** (`currentStep === 'file-upload'`).
2. User selects a file via click (opens file browser) or drag-and-drop onto the dropzone.
   - File input `accept` attribute set from `inheritanceInfo.constraints?.acceptAttribute`.
   - Only one file is accepted for media records (drop handler takes `files[0]` only).
3. User clicks "Upload" button to initiate upload.
4. `createMediaRecordMutation.mutateAsync({ projectId, itemId: item.id, file: selectedFiles })` is called.
5. On success:
   - Backend returns created record with `id`/`record_id` and potentially auto-extracted metadata (color, resolution, duration).
   - `InheritanceUtils.checkAutoExtractionComplete(result, mediaType)` determines if all metadata was extracted.
   - If **complete**: modal auto-closes after 500ms, `onCreate()` called.
   - If **incomplete**: proceeds to **Step 2: Metadata** with pre-filled auto-extracted values.
6. On **400 error** (file type mismatch):
   - Backend returns "File is not an video/audio/photo file."
   - Component shows user-friendly error from `MEDIA_RECORD_UI` constants.
   - Despite the error, the record WAS created by the backend. Component fetches project data to find the new record ID, then proceeds to Step 2.
7. **Step 2: Metadata Form**:
   - Fields: `color`, `horizontal_resolution`, `vertical_resolution`, `duration`
   - Duration required for Video and Audio types.
   - Auto-extracted fields are visually indicated via `isAutoExtracted()`.
   - `validateMediaRecordCreate()` runs on submit, then `updateMediaRecordMutation.mutateAsync()` to update the record.
8. On success: `onCreate({ id: createdRecordId })` called, modal closes after 300ms.

## Validation
- **Step 1**: File presence check (`selectedFiles.length === 0` shows error).
- **Step 2**: `validateMediaRecordCreate(validationData, recordType)` from `recordConstants`.
  - `recordType` mapped from Latvian: Foto->photo, Video->video, Skaņas->audio.
  - `validateDuration()` for real-time duration validation.
- Max length constants: `DURATION_MAX_LENGTH`, `RESOLUTION_MAX_LENGTH`.
- `getRemainingChars()` for character counters.

## API Integration
- **Hooks**: `useCreateMediaRecord()`, `useUpdateMediaRecord()` from `hooks/useRecords`
- **Step 1 call**: `createMediaRecordMutation.mutateAsync({ projectId, itemId, file })`
- **Step 2 call**: `updateMediaRecordMutation.mutateAsync({ projectId, recordId, recordData, recordType })`
- **Query client**: `useQueryClient()` for fetching project data after 400 error to recover record ID.
- Uses `ApiError` structure: `error.status`, `error.data`, `error.message`.

## Known Limitations
- The 400-error recovery flow (file type mismatch where record is still created) is a workaround for backend behavior. If the backend changes, this logic will break.
- Only single file upload supported per media record.
- Auto-extraction check relies on `InheritanceUtils.checkAutoExtractionComplete()` which may not cover all edge cases.
- No progress indicator during file upload.
- Duration format is not strictly enforced (no regex for HH:MM:SS pattern in the UI, only in validation).
- Resolution fields accept any integer, no max/min bounds enforced in UI.

## Quality Score: 7/10
