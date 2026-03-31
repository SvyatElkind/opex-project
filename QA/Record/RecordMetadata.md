# QA Report: RecordMetadata
> Path: `src/Record/RecordMetadata.js` | Last audit: 2026-03-24

## Purpose
CRUD interface for record metadata: Actions (Darbības), Addressees (Adresāti), Visas (Vīzas), and Read Status (Lasīšanas statuss). Displayed in the Record component on the Metadata tab (document records only). Uses a card-based layout with inline create/edit forms.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `recordId` | `number` | Yes | - | Record ID for metadata API calls |
| `projectId` | `number/string` | Yes | - | Project ID for API calls |
| `recordData` | `object` | Yes | - | Record object containing `actions`, `addressees`, `visas`, `read_status` arrays |
| `activeSection` | `string` | Yes | - | Currently active metadata section key (`'actions'`, `'addressees'`, `'visas'`, `'read_status'`) |
| `onSectionChange` | `function` | Yes | - | Callback to change active section (driven by parent Record component's tab buttons) |

## User Interaction Flow
1. Parent Record component controls which section is active via `activeSection` prop.
2. **Section configuration** defines four metadata types with their fields:
   - **Actions**: author (required), responsible_person (required), task (required), due_date (required, date), created_date (required, date), notes (textarea)
   - **Addressees**: addressee (required)
   - **Visas**: person (required), date (required, date), notes (textarea)
   - **Read Status**: person (required), date (required, date), notes (textarea)
3. **Empty state**: If no items in current section, shows section icon + message + "Pievienot" button.
4. **Card list**: Each metadata item rendered as a card showing field labels and values. Date fields formatted with `toLocaleDateString('lv-LV')`.
5. **Add card**: An "Add" card appears at the top of the list (when not creating/editing) that opens the create form on click.
6. **Create**: Clicking "Add" sets `isCreating=true`, shows form card at top with all section fields. Required fields marked with asterisk.
7. **Edit**: Clicking edit icon on a card replaces that card with an inline edit form pre-populated with item data.
8. **Save**: `validateForm()` checks all required fields have non-empty trimmed values. On pass, calls `createMetadataMutation.mutateAsync()` or `updateMetadataMutation.mutateAsync()`.
9. **Delete**: Clicking delete icon triggers `showConfirm()` notification dialog (title: "Dzēst ierakstu?", variant: danger). On confirm, calls `deleteMetadataMutation.mutateAsync()`.
10. **Cancel**: Resets form state and closes create/edit mode.
11. **Form-level error**: `errors._form` displayed as alert above form fields.

## Validation
- Required field check: `field.required && !formData[field.name]?.trim()` -- simple empty string check.
- Error message format: `"{field.label} ir obligāts"` (Latvian: "is required").
- No max-length validation.
- No date format validation (relies on native date input type).

## API Integration
- **Hooks**: `useCreateMetadata()`, `useUpdateMetadata()`, `useDeleteMetadata()` from `hooks/useMetadata`
- **Create**: `createMetadataMutation.mutateAsync({ projectId, recordId, metadataType: activeSection, data: formData })`
- **Update**: `updateMetadataMutation.mutateAsync({ projectId, recordId, metadataType: activeSection, metadataId: editingItem.id, data: formData })`
- **Delete**: `deleteMetadataMutation.mutateAsync({ projectId, recordId, metadataType: activeSection, metadataId: item.id })`
- **Notifications**: `useNotification()` -> `notify.error()` for delete errors, `showConfirm()` for delete confirmation.

## Known Limitations
- Validation is minimal -- only checks for non-empty required fields. No format validation for dates, no max length checks.
- Only one item can be created or edited at a time (mutual exclusion via `isCreating`/`editingItem` state).
- Delete confirmation uses a custom `showConfirm()` notification rather than a dedicated popup component.
- Form data is reset on cancel but not on section switch -- switching sections while editing loses changes without warning.
- No optimistic updates -- UI waits for mutation to complete before updating.
- The `onSectionChange` prop is accepted but never called within this component (sections controlled entirely by parent).

## Quality Score: 6/10
