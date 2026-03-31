# QA Report: Inventories
> Path: `src/Inventory/Inventories.js` | Last audit: 2026-03-24

## Purpose
Container component that renders the inventory sidebar list and the selected inventory's detail view. Manages inventory selection, favorites (persisted in localStorage), creation via popup, deletion, and keyboard navigation between inventories. Rendered within ActiveProject when a project has data.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `projectId` | `number/string` | Yes | - | Active project ID |
| `fondId` | `number` | Yes | - | Parent fond ID for inventory creation |
| `inventories` | `array` | Yes | - | Array of inventory objects from project data |

## User Interaction Flow
1. **Sidebar list**: Inventories shown sorted by favorites first, then by number (`parseInt(a.number) - parseInt(b.number)`). Each shows "US {number}{postfix}" text.
2. **Favorites**: Persisted in `localStorage` under key `inventory-favorites-{projectId}`. Toggled via click handler with `e.stopPropagation()`.
3. **Auto-selection**:
   - On mount (no current selection): selects default inventory (favorited first, then one with items, then first in list).
   - On inventory list change (if selected was removed): reselects default.
   - Clicking an inventory calls `navigateTo('inventory', inventory.id)`.
4. **Sidebar visibility**: Hidden when viewing item/record detail (`shouldHideInventoryList = !!(currentItem || currentRecord)`).
5. **Create inventory**: "+" button opens `InventoryCreate` popup. Also triggered by `openInventoryCreate` custom window event (from RoadmapWizard) with `{ inventoryNumber, inventoryType, electronic }` detail.
6. **Delete**: `handleDelete()` calls `deleteInventoryMutation.mutateAsync({ projectId, inventoryId })`.
7. **Keyboard navigation**: ArrowUp/ArrowDown moves between inventories in sorted list. Blocked when in detail view, create popup, or input/textarea/select focus.
8. **Detail view**: Selected inventory rendered via `<InventoryItem>` with `onDelete`, `isFavorite`, `onToggleFavorite` props.
9. **Validation indicators**: Each inventory shows `ValidationIndicator` via `InheritanceUtils.validateInventory(inventory)` (shown when `hasItems || !isFromReport`).

## Validation
- No form validation in this component (delegated to InventoryCreate/EditInventory).
- Per-inventory validation indicators shown in sidebar via `InheritanceUtils.validateInventory()`.

## API Integration
- **Hooks**: `useProject(projectId)` for refetch, `useDeleteInventory()`, `useUpdateInventory()` from `hooks/useInventories`
- **Navigation**: `useNavigation()` -> `currentInventory`, `currentItem`, `currentRecord`, `navigateTo`
- **Notifications**: `useNotification()` -> `notify.error()` for delete errors
- **Events**: Listens for `openInventoryCreate` custom window event.

## Known Limitations
- `findDefaultInventory` captures stale `favorites` from closure; not in useEffect dependency array.
- Auto-selection useEffect has complex branching that may cause unexpected selection changes.
- Delete handler does not show its own confirmation dialog (relies on InventoryItem).
- `navigateToSibling` useCallback depends on `sortedInventories` memo but keyboard useEffect captures it via closure.
- Empty state message "Nav Uzskaites Sarakstu" is hardcoded, not using constants.
- `toggleInvPopup` clears `initialInventoryData` only when closing, not when opening without event data.

## Quality Score: 7/10
