# QA Report: EditItemNavigable
> Path: `src/Item/EditItemNavigable.js` | Last audit: 2026-03-24

## Purpose
Full-screen modal (React Portal) for editing an existing inventory item. Features six navigable sections: Basic, Dates, Technical, Description, Access, and Related Items. Supports `forwardRef` with `useImperativeHandle` exposing `triggerSave()` for parent-initiated saves. Rendered from Items.js when user clicks the edit icon on an item row.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onClose` | `function` | Yes | - | Callback to close the modal |
| `onUpdate` | `function` | Yes | - | Async callback `(itemId, submitData)` that performs the API update |
| `item` | `object` | Yes | - | Existing item data for form pre-population |
| `inventory` | `object` | Yes | - | Parent inventory (for date validation, number) |
| `prevItem` | `object/null` | No | - | Previous item for navigation |
| `nextItem` | `object/null` | No | - | Next item for navigation |
| `onNavigate` | `function` | No | - | Callback `(direction)` for save-and-navigate (-1/1) |

## User Interaction Flow
1. Modal opens via portal. Body scroll is disabled (`overflow: hidden`).
2. Form initialized from `item` data via `getInitialFormData()`.
3. **Six sections** with IntersectionObserver-based sidebar nav:
   - **Basic**: series_code, number (from item), title
   - **Dates**: CalendarComponent for start_date/end_date with date_indicator selector, date_note
   - **Technical**: size (number), unit_of_measure (select: Lapas/Vienības/MB from constants)
   - **Description**: annotation (textarea), sistematisation, notes (textarea)
   - **Access**: language (multi-select tag picker), restriction (select: Vispārēja/Ierobežota), restriction_note, security_level (select: Publisks/etc.), security_level_note, copy, archival_history
   - **Related Items**: search and select related items from all project items (excludes current item)
4. **Language multi-select**: searchable dropdown with predefined languages from `ITEM_CREATE_FORM_UI.LANGUAGES`. Supports custom language entry via Enter key.
5. **Related items**: search input filters by item number or title. Selected items shown as removable tags. Dropdown closed on click-outside.
6. **Date validation**: end date compared against inventory end date. If item end date exceeds inventory end date, general error message shown with formatted dates.
7. **Client-side validation**: `validateItemUpdate(validationData, inventory)` from `itemConstants`. On failure, scrolls to first error section.
8. **Submit**: calls `onUpdate(item.id, submitData)` (provided by parent, which calls `updateItemMutation`).
9. On success: shows success message ("Vienība veiksmīgi atjaunināta"), closes after 1 second delay.
10. **Save-and-navigate**: `handleSaveAndNavigate(direction)` saves first, then calls `onNavigate(direction)` on success.
11. **Imperative handle**: exposes `triggerSave()` via ref for programmatic save.
12. Escape key closes modal.

## Validation
- `validateItemUpdate(validationData, inventory)` from `itemConstants` -- validates all fields.
- Language converted from array to comma-separated string for validation.
- Max length constants: `TITLE_MAX_LENGTH`, `SERIES_CODE_MAX_LENGTH`, `ANNOTATION_MAX_LENGTH`, `NOTES_MAX_LENGTH`, `RESTRICTION_NOTE_MAX_LENGTH`.
- `getRemainingChars()` for character counter display.
- `isLanguageRequired()`, `isAnnotationRequired()`, `isRestrictionNoteRequired()` for conditional requirements based on inventory type.
- On validation failure: field errors set via `setFieldErrors`, form scrolls to first error section via `sectionMap`.
- API errors handled: `error.fieldErrors` for field-level, `error.message` for general.

## API Integration
- Does NOT directly call API hooks. Instead, receives `onUpdate` callback from parent (Items.js) which uses `useUpdateItem()`.
- **Navigation**: `useNavigation()` -> `getAllItemsFromProject()` for related items list.
- **Utilities**: `Utils()` -> `formatDate()` for date handling.
- **Error handling**: `useFormErrors()` hook for error state management.

## Known Limitations
- `allItems` fetched via `getAllItemsFromProject()` returns items across all inventories, not just the current one.
- Language list comes from `ITEM_CREATE_FORM_UI.LANGUAGES` constant (different source than record forms which hardcode the list).
- The 1-second delay on success before closing may frustrate users.
- `filteredLanguages` is computed on every render without memoization.
- Portal container creation and body overflow manipulation could conflict with other modals.
- `getInitialFormData` called once in useState -- if `item` prop changes, form will not re-initialize.

## Quality Score: 7/10
