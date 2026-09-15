import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppVersion, { formatAppVersion } from './AppVersion';
import { get } from '../../services/apiClient';
import { APP_VERSION_UI } from '../../Constants/Constants';

// Only the HTTP layer is stubbed: the hook, React Query and the component
// run for real, so the test covers the whole path from response to text.
jest.mock('../../services/apiClient', () => ({
    get: jest.fn(),
}));

const renderStrip = () => {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return render(
        <QueryClientProvider client={client}>
            <AppVersion />
        </QueryClientProvider>
    );
};

beforeEach(() => {
    get.mockReset();
});

describe('AppVersion strip', () => {
    test('shows version, status and date from /version/', async () => {
        get.mockResolvedValue({
            data: { version: '1.1', status: 'Beta', date: '2026.09.09' },
            status: 200,
        });

        renderStrip();

        expect(await screen.findByText(`${APP_VERSION_UI.LABEL} 1.1 · Beta · 2026.09.09`)).toBeTruthy();
        expect(get).toHaveBeenCalledWith('/version/');
    });

    test('says the version is unavailable when the endpoint fails', async () => {
        get.mockRejectedValue(new Error('404'));

        renderStrip();

        expect(await screen.findByText(APP_VERSION_UI.UNAVAILABLE)).toBeTruthy();
    });

    test('formatAppVersion skips missing parts instead of printing blanks', () => {
        expect(formatAppVersion({ version: '1.1' })).toBe('1.1');
        expect(formatAppVersion({ version: '1.1', date: '2026.09.09' })).toBe('1.1 · 2026.09.09');
        expect(formatAppVersion(null)).toBe('');
    });
});
