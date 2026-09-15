/**
 * Helpers for editing the cached project object (React Query key
 * `['project', 'detail', id]`) without mutating it.
 *
 * The project is one deeply nested object:
 *
 *     project → institution → fond → inventories[] → items[]
 *
 * Writing straight into it — `copy.institution.fond.inventories = ...` after a
 * shallow `{ ...old }` — looks like it works but does not: `copy.institution`
 * is still the *same* object React Query holds as the previous data, so the
 * assignment edits the previous data too. Two things then break:
 *
 *  1. `setQueryData` runs the new value through structural sharing
 *     (`replaceEqualDeep`). Old and new are now deep-equal, so it keeps the
 *     OLD reference. `useQuery` only notifies when a tracked property such as
 *     `data` changes identity, so nothing re-renders — the new values sit in
 *     the cache unseen until some unrelated render picks them up (switching
 *     inventories and back).
 *  2. The `onMutate` rollback snapshot is the same mutated object, so
 *     `onError` "rolls back" to the optimistic values.
 *
 * Everything below therefore copies each level it touches.
 */

/**
 * Replace a project's inventory list, copying institution and fond on the way.
 * `updater` receives the current inventories array and returns the new one;
 * returning the same array leaves the project untouched.
 */
export function withInventories(project, updater) {
    const inventories = project?.institution?.fond?.inventories;
    if (!Array.isArray(inventories)) return project;

    const nextInventories = updater(inventories);
    if (nextInventories === inventories) return project;

    return {
        ...project,
        institution: {
            ...project.institution,
            fond: {
                ...project.institution.fond,
                inventories: nextInventories,
            },
        },
    };
}

/**
 * Map over a project's inventories. `mapInventory` gets each inventory and
 * returns the replacement (return the original to leave it alone).
 */
export function mapInventories(project, mapInventory) {
    return withInventories(project, (inventories) => inventories.map(mapInventory));
}

/**
 * Map over the items of every inventory. Inventories whose items are all
 * returned unchanged keep their own identity, so untouched inventories stay
 * referentially stable for memoised consumers.
 */
export function mapItems(project, mapItem) {
    return mapInventories(project, (inventory) => {
        const items = inventory.items;
        if (!Array.isArray(items) || items.length === 0) return inventory;

        let changed = false;
        const nextItems = items.map((item) => {
            const nextItem = mapItem(item, inventory);
            if (nextItem !== item) changed = true;
            return nextItem;
        });

        return changed ? { ...inventory, items: nextItems } : inventory;
    });
}
