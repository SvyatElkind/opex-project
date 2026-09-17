import { post, apiRequest } from '../services/apiClient';
import {
    resolveItemIds, createItemWithPayload, createItem, fillProject, inventoriesOf, allRecordsOf,
} from './devDataFactory';

// Only the HTTP layer is stubbed; the factory's own logic runs for real.
jest.mock('../services/apiClient', () => ({
    post: jest.fn(),
    put: jest.fn(),
    del: jest.fn(),
    apiRequest: jest.fn(),
    postFormData: jest.fn(),
}));

const project = (items) => ({
    id: 1,
    institution: {
        id: 3,
        fond: {
            id: 2,
            inventories: [
                { id: 10, number: 1, type: 'Tekstuāls', electronic: true, start_date: '2001-01-01', end_date: '2003-12-31', items },
                { id: 11, number: 2, type: 'Foto', electronic: true, items: [{ id: 99, number: 1, photo_records: [{ id: 900 }] }] },
            ],
        },
    },
});

beforeEach(() => {
    post.mockReset();
    apiRequest.mockReset();
});

describe('resolveItemIds', () => {
    test('maps item numbers to ids from one project read', async () => {
        apiRequest.mockResolvedValue({ data: project([{ id: 77, number: 2 }, { id: 78, number: 3 }]) });
        const map = await resolveItemIds(1, 10);
        expect(map.get(2)).toBe(77);
        expect(map.get(3)).toBe(78);
        expect(map.size).toBe(2);
        expect(apiRequest).toHaveBeenCalledTimes(1);
        expect(apiRequest.mock.calls[0][0]).toBe('/project/1/');
    });

    test('returns an empty map for an inventory the project does not contain', async () => {
        apiRequest.mockResolvedValue({ data: project([]) });
        expect((await resolveItemIds(1, 999)).size).toBe(0);
    });
});

describe('createItemWithPayload', () => {
    // The real item POST answers with `number` and no `id` (ItemSerializer lists
    // its fields explicitly) - this is the bug the lookup exists for.
    test('attaches the id the POST response lacks', async () => {
        post.mockResolvedValue({ data: { number: 2, title: 'X' } });
        apiRequest.mockResolvedValue({ data: project([{ id: 77, number: 2 }]) });

        const item = await createItemWithPayload(1, 10, { title: 'X' });
        expect(item).toEqual({ number: 2, title: 'X', id: 77 });
        expect(post).toHaveBeenCalledWith('/project/1/item/?inventory_id=10', { title: 'X' });
    });

    test('skips the lookup when asked, and when the response already has an id', async () => {
        post.mockResolvedValue({ data: { number: 2 } });
        const plain = await createItemWithPayload(1, 10, {}, { resolveId: false });
        expect(plain).toEqual({ number: 2 });
        expect(apiRequest).not.toHaveBeenCalled();

        post.mockResolvedValue({ data: { number: 2, id: 5 } });
        const withId = await createItemWithPayload(1, 10, {});
        expect(withId.id).toBe(5);
        expect(apiRequest).not.toHaveBeenCalled();
    });

    test('createItem builds a payload for the inventory and resolves the id', async () => {
        post.mockResolvedValue({ data: { number: 1 } });
        apiRequest.mockResolvedValue({ data: project([{ id: 70, number: 1 }]) });
        const inventory = { id: 10, type: 'Tekstuāls', start_date: '2001-01-01', end_date: '2003-12-31' };

        const item = await createItem(1, 10, inventory, 1);
        expect(item.id).toBe(70);
        const payload = post.mock.calls[0][1];
        expect(payload.series_code).toMatch(/^\d+(\.\d+)+$/);
        expect(payload.start_date >= '2001-01-01').toBe(true);
    });
});

describe('fillProject', () => {
    test('creates items, reads the project ONCE, then hangs records off the resolved ids', async () => {
        let itemNumber = 0;
        post.mockImplementation(async (url, body) => {
            if (url.includes('/inventory/')) return { data: { id: 10, number: 1, start_date: body.start_date, end_date: body.end_date } };
            if (url.includes('/item/')) { itemNumber++; return { data: { number: itemNumber } }; }
            if (url.includes('/record/')) return { data: { id: 500 + itemNumber, date: body.date } };
            throw new Error(`unexpected POST ${url}`);
        });
        apiRequest.mockResolvedValue({ data: project([{ id: 71, number: 1 }, { id: 72, number: 2 }, { id: 73, number: 3 }]) });

        const tally = await fillProject(1, 2, {
            inventoryCount: 1, itemsPerInventory: 3, recordsPerItem: 1, filesPerRecord: 0,
            withMetadata: false, types: ['Tekstuāls'],
        });

        expect(tally).toMatchObject({ inventories: 1, items: 3, records: 3, files: 0, metadata: 0, errors: 0 });
        expect(apiRequest).toHaveBeenCalledTimes(1);
        const recordUrls = post.mock.calls.map(c => c[0]).filter(u => u.includes('/record/'));
        expect(recordUrls.sort()).toEqual([
            '/project/1/record/?item_id=71',
            '/project/1/record/?item_id=72',
            '/project/1/record/?item_id=73',
        ]);
    });

    test('an item whose id cannot be resolved gets no records and is counted as an error', async () => {
        post.mockImplementation(async (url) => {
            if (url.includes('/inventory/')) return { data: { id: 10, number: 1, start_date: '2001-01-01', end_date: '2002-12-31' } };
            if (url.includes('/item/')) return { data: { number: 1 } };
            return { data: { id: 1 } };
        });
        apiRequest.mockResolvedValue({ data: project([]) }); // project knows no items

        const tally = await fillProject(1, 2, { inventoryCount: 1, itemsPerInventory: 1, recordsPerItem: 2, filesPerRecord: 0, withMetadata: false, types: ['Tekstuāls'] });
        expect(tally.items).toBe(1);
        expect(tally.records).toBe(0);
        expect(tally.errors).toBe(1);
        expect(post.mock.calls.some(c => c[0].includes('/record/'))).toBe(false);
    });
});

describe('traversal helpers', () => {
    test('allRecordsOf covers media record arrays, not just item.records', () => {
        const p = project([{ id: 77, number: 1, records: [{ id: 1 }, { id: 2 }] }]);
        const all = allRecordsOf(p);
        expect(all).toHaveLength(3);
        expect(all.filter(r => r.isMedia)).toHaveLength(1);
        expect(all.find(r => r.isMedia).mediaType).toBe('Foto');
        expect(inventoriesOf(p)).toHaveLength(2);
    });
});
