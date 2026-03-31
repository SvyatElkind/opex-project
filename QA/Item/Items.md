# QA Report: Items
> Path: `src/Item/Items.js` | Last audit: 2026-03-24

## Purpose
Main items list/detail view for an inventory. Renders a virtualized table of items using `react-window` FixedSizeList with pagination, column visibility controls, batch selection, and inline navigation to item detail and record views. Acts as the orchestrator for item CRUD operations and record creation modals.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `array` | No | `[]` | Array of item objects for the inventory |
| `projectId` | `number/string` | Yes | - | Active project ID |
| `inventoryId` | `number` | Yes | - | Current inventory ID |
| `inventory` | `object` | Yes | - | Full inventory object (type, electronic, dates, etc.) |
| `onRequestEditInventory` | `function` | No | - | Callback to open inventory edit (when period is missing) |

## User Interaction Flow
1. **List view** (default): virtualized table with configurable columns via `FixedSizeList` + `AutoSizer`.
2. **Columns**: GV Number, Series Code, Title, Dates, Record Count, Secrecy, Language, Notes, Validation. Toggled via column selector popup.
3. **Pagination**: `itemsPerPage` from settings (default 25). Page persisted in `sessionStorage` per inventory (`items_page_{inventoryId}`).
4. **Selection**: checkboxes for multi-select, "select all" in header. Batch delete button with count badge.
5. **Row actions** (per item): Create Record (+), Edit (pencil), Delete (trash) -- each in its own column.
6. **Create item**: "+" button in header opens `CreateItemNavigable` popup. Checks inventory period first; if missing `start_date`/`end_date`, shows `InventoryPeriodPopup` which redirects to inventory edit.
7. **Edit item**: Opens `EditItemNavigable` modal with item data.
8. **Delete item**: Opens `ItemDeletePopup` confirmation. Batch delete supported (sequential deletion).
9. **Create record**: Opens `CreateDocumentRecord` or `CreateMediaRecord` based on `InheritanceUtils.getInheritanceInfo(inventory)`. For electronic media, "+" only shown if no media record exists on the item.
10. **Item click**: Navigates to detail view via `navigateTo('item', item.id, inventoryId)`. For `navigateToRecord` behavior, auto-navigates to the first record after 150ms timeout.
11. **Detail view**: Shows `<Item>` component with back button returning to list.
12. **Record view**: When `currentRecord` is set (from NavigationContext), renders `<Record>` component.
13. **Physical inventories** (`electronic=false`): record count column is hidden.
14. **Media inventories**: record column shows media-type icon instead of count.

## Validation
- Item validation indicators per row: `InheritanceUtils.validateItem(item, inventory)` displayed via `ValidationIndicator`.
- No form validation in this component (delegated to create/edit modals).

## API Integration
- **Hooks**: `useCreateItem(false)`, `useUpdateItem()`, `useDeleteItem()`, `useCreateRecord()`, `useInvalidateProject()` from `hooks/useItems`
- **Performance tracking**: `usePerformance('Items')` with `startMeasure`/`endMeasure` for CRUD operations
- **Settings**: `useSettings()` -> `settings.itemsPerPage`, `settings.dateFormat`
- **Navigation**: `useNavigation()` -> `currentItem`, `currentRecord`, `navigateTo`
- **Notifications**: `useNotification()` -> `notify.error()` for various error cases

## Known Limitations
- `FixedSizeList` `itemSize={48}` is hardcoded. If row content overflows (long titles), it will be clipped.
- Pagination state initialization reads from `sessionStorage` in useState initializer.
- `handleItemClick` uses `setTimeout(150)` for record navigation, which is fragile.
- `columnSelectVisability` has a typo (should be `columnSelectVisibility`).
- Batch delete iterates sequentially with `for...of` loop instead of `Promise.all`.
- The `handleRecordCreated` callback navigates differently for media vs. document records.
- `formatLanguage` truncates multi-language strings to first language + ellipsis.

## Quality Score: 7/10
