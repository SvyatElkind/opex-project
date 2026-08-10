import React from 'react';
import { render } from '@testing-library/react';
import MultiCreateItemsPopup from './MultiCreateItemsPopup';

// The popup is exercised for its form defaults only — the batch runner, the
// settings store and the toast stack are irrelevant here and pull in
// react-query, so they are stubbed.
jest.mock('../hooks/useBulkOperations', () => ({
    bulkApi: { createItem: jest.fn() },
    useInvalidateAfterBulk: () => jest.fn(),
    useBulkRunner: () => ({
        state: { status: 'idle', done: 0, total: 0, results: [] },
        run: jest.fn(),
        stop: jest.fn(),
    }),
}));

jest.mock('../components/Notification', () => ({
    useNotification: () => ({ notify: { success: jest.fn(), warning: jest.fn(), error: jest.fn() } }),
}));

// No saved preset — this is the out-of-the-box state a new user sees.
jest.mock('../Settings/context/SettingsContext', () => ({
    useSettings: () => ({ getActivePreset: () => null }),
}));

const renderPopup = () => render(
    <MultiCreateItemsPopup
        inventory={{ number: 1, electronic: false }}
        projectId="1"
        inventoryId="1"
        onClose={jest.fn()}
    />
);

/** The popup renders through a portal, so scope lookups to the whole body. */
const sharedFieldByLabel = (label) =>
    Array.from(document.body.querySelectorAll('.multi-create-shared-field'))
        .find(field => field.querySelector('.create-item-nav-field-label')?.textContent.includes(label));

describe('MultiCreateItemsPopup shared-field defaults', () => {
    test('Slepenība defaults to "Publisks"', () => {
        renderPopup();

        const field = sharedFieldByLabel('Slepenība');
        expect(field).toBeDefined();

        const select = field.querySelector('select');
        expect(select).not.toBeNull();
        expect(select.value).toBe('Publisks');
    });

    test('"Publisks" is a real option, not just an unmatched value', () => {
        renderPopup();

        const select = sharedFieldByLabel('Slepenība').querySelector('select');
        const options = Array.from(select.options).map(o => o.value);

        // A stray "—" placeholder would mean the default failed to match an option.
        expect(options).toContain('Publisks');
        expect(options).not.toContain('');
    });

    test('Pieejamība defaults to "Vispārēja"', () => {
        renderPopup();

        const select = sharedFieldByLabel('Pieejamība').querySelector('select');
        expect(select.value).toBe('Vispārēja');
    });
});
