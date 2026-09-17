import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Settings from './Settings';
import { get } from '../services/apiClient';

// The tab bodies and the two contexts are stubbed; this pins the header
// composition - the version line lives INSIDE the header, under the title.
jest.mock('./context/SettingsContext', () => ({
    useSettings: () => ({ settings: {}, updateMultipleSettings: jest.fn() }),
}));
jest.mock('../components/Notification', () => ({
    useNotification: () => ({ notify: { success: jest.fn() }, showConfirm: jest.fn() }),
}));
jest.mock('./components/DisplaySettings', () => () => null);
jest.mock('./components/FormDefaults', () => () => null);
jest.mock('./components/ValidationSettings', () => () => null);
jest.mock('./components/GuidanceSettings', () => () => null);
jest.mock('./components/ExperimentalSettings', () => () => null);
jest.mock('../services/apiClient', () => ({ get: jest.fn() }));

const renderSettings = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={client}>
            <Settings onClose={jest.fn()} />
        </QueryClientProvider>
    );
};

afterEach(() => {
    document.body.innerHTML = '';
});

test('the version line sits inside the header, directly under the title', async () => {
    get.mockResolvedValue({ data: { version: '1.1', status: 'Beta', date: '2026.09.09' }, status: 200 });
    renderSettings();

    const header = document.querySelector('.settings-header');
    const titles = header.querySelector('.settings-header-titles');
    expect(titles).toBeTruthy();
    expect(titles.children[0].tagName).toBe('H2');
    expect(titles.children[0].textContent).toContain('Iestatījumi');
    expect(titles.children[1].className).toBe('settings-version');

    expect(await screen.findByText('Versija 1.1 · Beta · 2026.09.09')).toBeTruthy();
    // nothing left between the header and the body
    expect(header.nextElementSibling.className).toBe('settings-body');
});
