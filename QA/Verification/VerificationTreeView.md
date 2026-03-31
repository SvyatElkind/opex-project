# QA Report: VerificationTreeView.jsx
> Path: `src/Verification/VerificationTreeView.jsx` | Lines: 269 | Last audit: 2026-03-16

## Meta Description
Renders a hierarchical tree view of the project's validation state (inventories > items > records). Supports expand/collapse, filter modes (all/issues/errors), electronic vs. physical inventory toggle, and a side error panel. Calls InheritanceUtils validation functions (`validateRecord`, `validateItem`, `validateInventory`) to compute per-node validation status. Consumed by VerificationModal.

## Issues Found
| # | Severity | Line(s) | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | Medium | 16 | `expandedNodes` is initialized with `new Set(expandAll ? ['all'] : [])`. If `expandAll` prop changes after mount, the initial state is stale. The `isExpanded` function (line 42) checks `expandAll` on each render, mitigating this, but the Set state becomes misleading. | Add a `useEffect` to sync `expandedNodes` when `expandAll` changes, or rely purely on the prop check in `isExpanded`. |
| 2 | Medium | 133 | Records are only rendered for `isElectronicTextual` inventories. Electronic media items (photo/video/audio) never show child record nodes even if they have records. | Clarify whether this is intentional via a comment. If media records should be visible, extend the condition. |
| 3 | Low | 179-181 | `activeInventories` filter uses `inventory.date || (inventory.items && inventory.items.length > 0)`. Inventories without a date and without items are silently excluded. | Consider showing empty inventories with a visual indicator instead of hiding them. |
| 4 | Low | 69 | `recordNodeId` uses array index (`recordIndex`). If records are reordered, stale expanded/selected state may persist. | Use `record.id` in the node ID if available. |

## Quality Score: 7/10
