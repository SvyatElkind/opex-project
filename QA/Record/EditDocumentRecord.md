# QA Report: EditDocumentRecord
> Path: `src/Record/EditDocumentRecord.js` | Last audit: 2026-03-24

## Purpose
Full-screen modal (React Portal) for editing an existing textual/document record. Opened from the Record view component when the user clicks "Edit" on a non-media record. Uses `forwardRef` and `useImperativeHandle` (though the imperative API is not actively used in the current codebase). Supports record-to-record navigation via prev/next buttons while the edit form is open.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onClose` | `function` | Yes | - | Callback to close the modal |
| `onUpdate` | `function` | Yes | - | Callback invoked after successful save |
| `record` | `object` | Yes | - | Existing record data to pre-populate form |
| `item` | `object` | Yes | - | Parent item (for date range validation and restriction checks) |
| `inventory` | `object` | Yes | - | Parent inventory (for `InheritanceUtils.getInheritanceInfo()`) |
| `projectId` | `number/string` | Yes | - | Active project ID |
| `prevRecord` | `object/null` | No | - | Previous record in list (for navigation arrow) |
| `nextRecord` | `object/null` | No | - | Next record in list (for navigation arrow) |
| `onNavigate` | `function` | No | - | Callback `(direction)` for navigating between records (-1 = prev, 1 = next) |

## User Interaction Flow
1. Modal opens, form pre-populated from `record` prop via `getInitialFormData(record)`.
2. Same four-section layout as CreateDocumentRecord: Basic, Document, Description, Access.
3. IntersectionObserver tracks active section in sidebar nav.
4. Language editing: multi-select tag picker with search; existing languages parsed from comma-separated string via `parseLanguageToArray()`.
5. Keywords: initialized from `record.key_words` (comma-split), managed as tag array.
6. Date range validation: checks against parent item dates, shows warning and blocks save if out of range.
7. Access restriction mismatch warning (informational, does not block save).
8. Navigation arrows: prev/next buttons allow navigating to sibling records. `onNavigate(direction)` is called, and parent (Record.js) handles closing/reopening the edit popup for the target record.
9. On submit: `validateTextRecordCreate()` runs, then `updateRecordMutation.mutateAsync({ projectId, recordId: record.id, data })`.
10. On success: `onUpdate()` callback fires, triggering query invalidation in parent.
11. `useEffect` re-initializes form data when `record.id` changes (for navigation between records).
12. Escape key closes the modal.

## Validation
- Same validation pipeline as CreateDocumentRecord:
  - `validateTextRecordCreate()` for full form validation
  - `validateRecordDate()` for real-time date checking
  - `validateAccessRestriction()` and `validateAccessRestrictionDate()` for access fields
- Max length constants imported from `recordConstants`.
- `getRemainingChars()` for character counter display.
- `isAccessRestrictionDateRequired()` determines conditional requirement.

## API Integration
- **Hook**: `useUpdateRecord()` from `hooks/useRecords`
- **Mutation call**: `updateRecordMutation.mutateAsync({ projectId, recordId: record.id, data })`
- **Settings**: `useSettings()` for preset access (though presets are less relevant in edit mode)

## Known Limitations
- `forwardRef` + `useImperativeHandle` is defined but not currently used by parent components.
- When navigating between records, the form re-initializes via `useEffect([record?.id])` -- if the record prop reference changes without ID change, the form will not reset.
- Same hardcoded language list as CreateDocumentRecord.
- `checkDateInRange` and `checkAccessRestrictionMismatch` are called in the `useEffect` for record re-init, but use stale closure for `item` if item also changes simultaneously.
- Portal cleanup follows the same pattern as CreateDocumentRecord.

## Quality Score: 7/10
