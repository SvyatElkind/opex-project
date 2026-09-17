import { resolveRelatedItems } from './itemConstants';

// Two inventories whose items point at each other across the boundary:
// US 1 / GV 1 <-> US 2 / GV 1 (the M2M relation is symmetrical).
const makeInventories = () => [
    { id: 5, number: 1, items: [{ id: 11, number: 1, title: 'A', related_item: [21] }, { id: 12, number: 2, title: 'B', related_item: [] }] },
    { id: 6, number: 2, items: [{ id: 21, number: 1, title: 'C', related_item: [11] }] },
];

describe('resolveRelatedItems', () => {
    it('finds a related item that lives in another inventory', () => {
        const inventories = makeInventories();
        const related = resolveRelatedItems(inventories[0].items[0], inventories);

        expect(related).toHaveLength(1);
        expect(related[0]).toMatchObject({ id: 21, title: 'C', inventoryId: 6, inventoryNumber: 2 });
    });

    it('works in the other direction too', () => {
        const inventories = makeInventories();
        const related = resolveRelatedItems(inventories[1].items[0], inventories);

        expect(related.map(i => [i.id, i.inventoryNumber])).toEqual([[11, 1]]);
    });

    it('keeps the order of the id list across inventories', () => {
        const inventories = makeInventories();
        const item = { id: 99, related_item: [21, 12, 11] };

        expect(resolveRelatedItems(item, inventories).map(i => i.id)).toEqual([21, 12, 11]);
    });

    it('reads `related_items` as written by the item PUT response', () => {
        const inventories = makeInventories();
        const item = { id: 11, related_items: [21] };

        expect(resolveRelatedItems(item, inventories).map(i => i.id)).toEqual([21]);
    });

    it('skips ids with no matching item and handles missing input', () => {
        const inventories = makeInventories();

        expect(resolveRelatedItems({ id: 1, related_item: [404, 12] }, inventories).map(i => i.id)).toEqual([12]);
        expect(resolveRelatedItems({ id: 1, related_item: [] }, inventories)).toEqual([]);
        expect(resolveRelatedItems({ id: 1 }, inventories)).toEqual([]);
        expect(resolveRelatedItems({ id: 1, related_item: [11] }, undefined)).toEqual([]);
    });
});
