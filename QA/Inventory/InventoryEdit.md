# QA Report: EditInventory (InventoryEdit)
> Path: `src/Inventory/InventoryEdit.js` | Last audit: 2026-03-24

## Purpose
Modal dialog for editing an existing inventory. Has two modes: **limited editing** (when inventory is from a report or has items) and **full editing** (when inventory has no items and is not from a report). In limited mode, type and electronic flag cannot be changed. Rendered from InventoryItem component.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onClose` | `function` | Yes | - | Callback to close the modal |
| `projectId` | `number/string` | Yes | - | Active project ID |
| `inventory` | `object` | Yes | - | Existing inventory object with all fields (`id`, `number`, `type`, `electronic`, `subfond`, `start_date`, `end_date`, `storage_term`, `from_report`, `total_items`) |

## User Interaction Flow
1. Modal opens as backdrop overlay. Clicking outside closes (unless mutation pending).
2. **Limited editing mode** (`isFromReport || hasItems` where `hasItems = (inventory.total_items || 0) > 0`):
   - Blue info message: `INVENTORY_EDIT_UI.REPORT_INFO_MESSAGE` or `INVENTORY_EDIT_UI.ITEMS_EXIST_INFO_MESSAGE`.
   - Editable fields: start_date, end_date (YearPicker), storage_term (react-select), subfond (toggle + number).
   - Type shown as read-only text, electronic checkbox hidden.
   - Submit preserves original `type` and omits `electronic`.
3. **Full editing mode**:
   - Type shown as read-only text (cannot change type after creation).
   - Electronic checkbox editable.
   - All date/storage/subfond fields editable.
4. Form initialized from `inventory` prop in useState initializers.
5. On submit:
   - `validateInventoryUpdate(inventoryData)` from `inventoryConstants`.
   - `updateInventoryMutation.mutateAsync({ projectId, inventoryId: inventory.id, inventoryData })`.
   - On success: `onClose()`.
   - On error: field errors or general error displayed.
6. Escape key closes modal (blocked during pending mutation).
7. Help button links to `chapterId="inventories"`.

## Validation
- `validateInventoryUpdate(inventoryData)` from `Constants/inventoryConstants`.
- `<FieldError>` components per field (start_date, end_date, storage_term).
- `<GeneralError>` for form-level errors.
- `useFormErrors()` hook for error state management.
- Errors cleared per field on change via `clearFieldError`.

## API Integration
- **Hooks**: `useUpdateInventory()` from `hooks/useInventories`, `useProject(projectId)` from `hooks/useProjects`
- **Constants**: `useConstants()` -> `storageTerms`
- **Mutation**: `updateInventoryMutation.mutateAsync({ projectId, inventoryId, inventoryData })`

## Known Limitations
- Type field is always read-only, even in "full edit" mode. Inventory type can never be changed after creation.
- `storageTerm` state initialization falls back to empty string `''` instead of `null`, which may cause react-select display issues.
- Electronic checkbox only editable when `!limitedEditing`, but type is always read-only regardless.
- Uses same CSS file as InventoryCreate (`InventoryCreate.css`) -- shared styles.
- No confirmation dialog before saving changes.
- No unsaved changes warning on close.

## Quality Score: 7/10
