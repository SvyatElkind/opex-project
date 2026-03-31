# QA Report: InventoryCreate
> Path: `src/Inventory/InventoryCreate.js` | Last audit: 2026-03-24

## Purpose
Modal dialog for creating a new inventory (Uzskaites Saraksts) within a project. Supports pre-fill from roadmap data via `initialData` prop. Rendered from the Inventories component when the user clicks the "+" add button.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onClose` | `function` | Yes | - | Callback to close the modal |
| `projectId` | `number/string` | Yes | - | Active project ID |
| `fondId` | `number` | Yes | - | Parent fond ID for the inventory |
| `initialData` | `object/null` | No | `null` | Pre-fill data from roadmap: `{ number, type, electronic, storage_term, start_date, end_date }` |

## User Interaction Flow
1. Modal opens as a backdrop overlay. Clicking backdrop (outside container) closes modal (unless mutation is pending).
2. If `initialData` is provided, a blue info banner shows "Lauki ir aizpildīti automātiski no ceļa kartes."
3. **Form fields**:
   - **Type** (required): `react-select` dropdown populated from `useConstants()` -> `inventoryTypes`. Not searchable.
   - **Electronic** checkbox: default `true` (or from `initialData`).
   - **Date range**: two `YearPicker` components for start and end dates.
   - **Storage term**: `react-select` dropdown from `useConstants()` -> `storageTerms`. Not searchable.
   - **Subfond**: toggle checkbox + number input (min 1). Disabled by default.
4. Inventory number is auto-calculated: `inventoryCount + 1` from `activeProjectData.institution.fond.inventories.length`.
5. On submit:
   - `validateInventoryCreate(inventoryData)` runs client-side validation.
   - On pass: `createInventoryMutation.mutateAsync({ projectId, fondId, inventoryData })`.
   - On success: `onClose()` called.
   - On error: field errors from `error.fieldErrors` or general error from `error.message`.
6. Cancel button or Escape key closes modal (blocked during pending mutation).
7. `initialData` changes trigger `useEffect` to update form fields.
8. Help button links to `chapterId="inventories"`.

## Validation
- `validateInventoryCreate(inventoryData)` from `Constants/inventoryConstants`.
- Field errors displayed via `<FieldError error={getFieldError('fieldName')} />` for type, start_date, end_date, storage_term.
- General error displayed via `<GeneralError message={generalError} />`.
- Errors cleared on field change via `clearFieldError('fieldName')`.

## API Integration
- **Hooks**: `useCreateInventory()` from `hooks/useInventories`, `useProject(projectId)` from `hooks/useProjects`
- **Constants**: `useConstants()` -> `inventoryTypes`, `storageTerms`
- **Mutation**: `createInventoryMutation.mutateAsync({ projectId, fondId, inventoryData })`
- **Error handling**: `useFormErrors()` hook for unified error management.

## Known Limitations
- Inventory number auto-increment (`inventoryCount + 1`) does not account for deleted inventories.
- `react-select` styles reference CSS variables that may not resolve in all contexts.
- No duplicate inventory type check.
- `initialData` useEffect does not reset fields absent from `initialData`.
- Subfond number input allows 0 when toggled on (min attribute is 1 but `parseInt` allows 0).

## Quality Score: 7/10
