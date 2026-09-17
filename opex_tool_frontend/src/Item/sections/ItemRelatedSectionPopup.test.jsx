import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ItemRelatedSectionPopup from './ItemRelatedSectionPopup';

// US 1 / GV 1 is linked to US 2 / GV 1. The popup reads the project's items
// through the navigation context, so that is the only thing stubbed.
const ALL_ITEMS = [
    { id: 11, number: 1, title: 'Pirmā', inventoryNumber: 1 },
    { id: 21, number: 1, title: 'Otrā citā US', inventoryNumber: 2 },
];

jest.mock('../../Navigation/context/NavigationContext', () => ({
    useNavigation: () => ({ getAllItemsFromProject: () => ALL_ITEMS }),
}));

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

const renderPopup = (item, onUpdate) => render(
    <ItemRelatedSectionPopup
        item={item}
        inventory={INVENTORY}
        onUpdate={onUpdate}
        onClose={jest.fn()}
        onOpenFullEdit={jest.fn()}
    />
);

describe('ItemRelatedSectionPopup initial selection', () => {
    it('shows links from the project-detail field `related_item`', () => {
        renderPopup({ ...VALID_ITEM, related_item: [21] }, jest.fn());
        expect(screen.getByText('Otrā citā US')).toBeTruthy();
    });

    // Right after a save the cache holds the PUT response, which names the
    // field `related_items`. Starting from an empty list there and saving
    // would wipe the link on the backend.
    it('keeps links when the cached item only has `related_items`', async () => {
        const onUpdate = jest.fn().mockResolvedValue();
        renderPopup({ ...VALID_ITEM, related_items: [21] }, onUpdate);

        expect(screen.getByText('Otrā citā US')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Saglabāt' }));

        await waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
        expect(onUpdate.mock.calls[0][1].related_item_list).toEqual([21]);
    });
});
