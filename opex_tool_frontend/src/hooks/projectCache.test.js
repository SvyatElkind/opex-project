import { QueryClient } from '@tanstack/react-query';
import { mapInventories, mapItems, withInventories } from './projectCache';

const KEY = ['project', 'detail', 1];

const makeProject = () => ({
    id: 1,
    institution: {
        id: 9,
        fond: {
            id: 7,
            inventories: [
                { id: 5, number: 1, start_date: null, end_date: null, items: [{ id: 11, title: 'A' }] },
                { id: 6, number: 2, start_date: null, end_date: null, items: [{ id: 12, title: 'B' }] },
            ],
        },
    },
});

describe('projectCache helpers', () => {
    it('leaves the source project untouched', () => {
        const project = makeProject();
        const snapshot = JSON.parse(JSON.stringify(project));

        mapInventories(project, (inv) =>
            inv.id === 5 ? { ...inv, start_date: '2020-01-01' } : inv);

        expect(project).toEqual(snapshot);
    });

    it('keeps untouched inventories referentially stable', () => {
        const project = makeProject();
        const next = mapInventories(project, (inv) =>
            inv.id === 5 ? { ...inv, start_date: '2020-01-01' } : inv);

        const [first, second] = next.institution.fond.inventories;
        expect(first).not.toBe(project.institution.fond.inventories[0]);
        expect(second).toBe(project.institution.fond.inventories[1]);
    });

    it('returns the project unchanged when there is no inventory list', () => {
        const empty = { id: 1 };
        expect(withInventories(empty, () => [])).toBe(empty);
    });

    it('mapItems only copies inventories whose items actually changed', () => {
        const project = makeProject();
        const next = mapItems(project, (item) =>
            item.id === 11 ? { ...item, title: 'A2' } : item);

        expect(next.institution.fond.inventories[0].items[0].title).toBe('A2');
        expect(next.institution.fond.inventories[1]).toBe(project.institution.fond.inventories[1]);
        expect(project.institution.fond.inventories[0].items[0].title).toBe('A');
    });

    // The bug this file exists for: an in-place edit leaves React Query's
    // previous data deep-equal to the new data, structural sharing keeps the
    // old reference, and useQuery never notifies — the inventory keeps showing
    // stale values until an unrelated re-render.
    it('changes the cached data reference so useQuery re-renders', () => {
        const client = new QueryClient();
        client.setQueryData(KEY, makeProject());

        const before = client.getQueryData(KEY);
        const rollbackSnapshot = client.getQueryData(KEY);

        client.setQueryData(KEY, (old) =>
            mapInventories(old, (inv) =>
                inv.id === 5 ? { ...inv, start_date: '2020-01-01', end_date: '2021-01-01' } : inv));

        expect(client.getQueryData(KEY)).not.toBe(before);
        expect(client.getQueryData(KEY).institution.fond.inventories[0].start_date).toBe('2020-01-01');
        // The rollback snapshot must still hold the pre-mutation values.
        expect(rollbackSnapshot.institution.fond.inventories[0].start_date).toBeNull();
    });
});
