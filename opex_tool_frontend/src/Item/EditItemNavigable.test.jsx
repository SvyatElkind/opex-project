import React, { createRef } from 'react';
import { render, screen, act } from '@testing-library/react';
import EditItemNavigable from './EditItemNavigable';

// US 1 / GV 1 is linked to US 2 / GV 1. Only the form's relation handling is
// under test: the project items come from the navigation context, and the
// date picker (which pulls in the notification stack) is stubbed out.
const ALL_ITEMS = [
    { id: 11, number: 1, title: 'Pirmā', inventoryNumber: 1 },
    { id: 21, number: 1, title: 'Otrā citā US', inventoryNumber: 2 },
];

jest.mock('../Navigation/context/NavigationContext', () => ({
    useNavigation: () => ({ getAllItemsFromProject: () => ALL_ITEMS }),
}));

jest.mock('../Utils/CalendarComponent', () => () => null);

// The section nav highlights the visible section with IntersectionObserver,
// which jsdom does not provide.
beforeAll(() => {
    global.IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
});

afterAll(() => {
    delete global.IntersectionObserver;
});

const VALID_ITEM = {
    id: 11,
    number: 1,
    series_code: '1',
    title: 'Pirmā',
    start_date: '2020-01-01',
    end_date: '2020-12-31',
    language: 'latviešu',
};

const INVENTORY = { number: 1, type: 'Tekstuāls', end_date: null };

const renderForm = (item) => {
    const ref = createRef();
    const onUpdate = jest.fn().mockResolvedValue();
    render(
        <EditItemNavigable
            ref={ref}
            item={item}
            inventory={INVENTORY}
            onUpdate={onUpdate}
            onClose={jest.fn()}
        />
    );
    return { ref, onUpdate };
};

describe('EditItemNavigable related items', () => {
    it('saves the links from the project-detail field `related_item`', async () => {
        const { ref, onUpdate } = renderForm({ ...VALID_ITEM, related_item: [21] });

        let saved;
        await act(async () => { saved = await ref.current.triggerSave(); });

        expect(saved).toBe(true);
        expect(onUpdate.mock.calls[0][1].related_item_list).toEqual([21]);
    });

    // Right after a save the cache holds the PUT response, which names the
    // field `related_items`. The form used to start from [] there, so saving
    // any other change (e.g. the title) wiped the link on the backend.
    it('keeps links when the cached item only has `related_items`', async () => {
        const { ref, onUpdate } = renderForm({ ...VALID_ITEM, related_items: [21] });

        expect(screen.getByText('Otrā citā US')).toBeTruthy();

        let saved;
        await act(async () => { saved = await ref.current.triggerSave(); });

        expect(saved).toBe(true);
        expect(onUpdate.mock.calls[0][1].related_item_list).toEqual([21]);
    });
});
