# QA Report: CreateDocumentRecord
> Path: `src/Record/CreateDocumentRecord.js` | Last audit: 2026-03-24

## Purpose
Full-screen modal (rendered via React Portal) for creating a new textual/document record under an item. Used within the Items component when the user clicks "Create Record" on a textual/electronic-document inventory item. The form has four navigable sections: Basic, Document Details, Description, and Access.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onClose` | `function` | Yes | - | Callback to close the modal |
| `onCreate` | `function` | Yes | - | Callback with the created record object on success |
| `item` | `object` | Yes | - | Parent item (contains `id`, `start_date`, `end_date`, `date_indicator`, `restriction`, `title`) |
| `inventory` | `object` | Yes | - | Parent inventory (passed to `InheritanceUtils.getInheritanceInfo()`) |
| `projectId` | `number/string` | Yes | - | Active project ID for API calls |

## User Interaction Flow
1. Modal opens as a portal appended to `document.body`.
2. Left sidebar shows four section nav items (Basic, Document, Description, Access). Active section highlights based on `IntersectionObserver` scroll tracking.
3. User fills in form fields:
   - **Basic**: title, date (input type=date), reg_nr, group
   - **Document**: created_date, sent_date, language (multi-select tag picker with search), key_words (tag-based input), sent_reg_nr, nomenclature_nr
   - **Description**: annotation, notes, tech_info
   - **Access**: access_restriction (open/closed), access_restriction_notes, access_restriction_date, user_restriction_notes
4. Language selection: searchable dropdown with 33 predefined languages; supports custom language entry via Enter key.
5. Keywords: entered one at a time, displayed as removable tags, joined as comma-separated string on submit.
6. Date field validates in real-time against parent item date range. If out of range, a warning appears and submission is blocked (`isDateOutOfRange`).
7. Access restriction mismatch with parent item restriction triggers a warning but does not block submission.
8. On submit: client-side validation via `validateTextRecordCreate()`, then `createRecordMutation.mutateAsync()` call.
9. On success: `onCreate(result)` is called, then `onClose()`.
10. Escape key closes the modal (unless submitting).
11. Clicking outside the language dropdown closes it.

## Validation
- **Client-side** via `validateTextRecordCreate(validationData, item)` from `recordConstants`.
- **Real-time field validation**:
  - `date` field: `validateRecordDate(value, item)` + date range check against item dates
  - `access_restriction`: `validateAccessRestriction(value)`
  - `access_restriction_date`: `validateAccessRestrictionDate(value, access_restriction)`
- **Max length constants enforced**: TITLE_MAX_LENGTH, LANGUAGE_MAX_LENGTH, ANNOTATION_MAX_LENGTH, KEY_WORDS_MAX_LENGTH, REG_NR_MAX_LENGTH, SENT_REG_NR_MAX_LENGTH, NOMENCLATURE_NR_MAX_LENGTH, NOTES_MAX_LENGTH, TECH_INFO_MAX_LENGTH, ACCESS_RESTRICTION_NOTES_MAX_LENGTH, USER_RESTRICTION_NOTES_MAX_LENGTH, GROUP_MAX_LENGTH.
- Remaining character count shown via `getRemainingChars()`.
- On validation failure: field errors displayed inline, form scrolls to first error section.
- **API errors**: parsed via `useFormErrors` hook; field-level errors from `error.fieldErrors` or `error.data`.

## API Integration
- **Hook**: `useCreateRecord()` from `hooks/useRecords`
- **Mutation call**: `createRecordMutation.mutateAsync({ projectId, itemId: item.id, recordData })`
- **Settings**: `useSettings()` -> `getActivePreset()` for default values (language, keyWords, notes, accessRestriction)

## Known Limitations
- Language list is hardcoded (33 Latvian language names) rather than fetched from API.
- No file upload capability in this form -- files are managed separately via RecordFiles.
- Date out-of-range check blocks submission entirely, even if the warning is informational.
- Access restriction warning does not block submission but may confuse users.
- Portal container is created in useState initializer but cleanup relies on useEffect -- potential edge case if component unmounts before effect runs.

## Quality Score: 7/10
