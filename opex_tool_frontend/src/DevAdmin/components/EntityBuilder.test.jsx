import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EntityBuilder from './EntityBuilder';
import * as factory from '../devDataFactory';

// The builders and the executor run for real; only the network-bound
// factory functions are stubbed, so a run exercises the whole tab.
jest.mock('../devDataFactory', () => ({
    createInventoryWithPayload: jest.fn(),
    createItemWithPayload: jest.fn(),
    resolveItemIds: jest.fn(),
    createRecordWithPayload: jest.fn(),
    createMediaRecordFromFile: jest.fn(),
    uploadFile: jest.fn(),
    addMetadataPayload: jest.fn(),
    updateMediaRecord: jest.fn(),
    setSigners: jest.fn(),
    fetchProject: jest.fn(),
    inventoriesOf: (p) => p?.institution?.fond?.inventories || [],
    MEDIA_RECORD_KEYS: { Foto: 'photo_records', Video: 'video_records', 'Skaņas': 'audio_records' },
    describeApiError: (e) => e?.message || 'err',
}));

const projectData = {
    id: 1,
    institution: {
        id: 3,
        fond: {
            id: 2,
            inventories: [
                { id: 10, number: 1, type: 'Tekstuāls', electronic: true, start_date: '2001-01-01', end_date: '2003-12-31',
                  items: [{ id: 100, number: 1, title: 'Pirmā', start_date: '2001-02-01', end_date: '2002-02-01', records: [] }] },
                { id: 11, number: 2, type: 'Foto', electronic: true, start_date: '2005-01-01', end_date: '2006-12-31',
                  items: [{ id: 101, number: 1, title: 'Foto GV', start_date: '2005-02-01', end_date: '2005-12-01', photo_records: [{ id: 900 }] }] },
            ],
        },
    },
};

let client;
const renderTab = (props = { projectData }) => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={client}>
            <EntityBuilder {...props} />
        </QueryClientProvider>
    );
};

const button = (name) => screen.getByRole('button', { name });
const selectByOption = (optionText) => screen.getByText(optionText).closest('select');

beforeEach(() => {
    factory.createInventoryWithPayload.mockImplementation(async (p, f, payload) => ({ id: 500 + (payload.number || 0), number: payload.number }));
    factory.createItemWithPayload.mockImplementation(async () => ({ number: factory.createItemWithPayload.mock.calls.length }));
    factory.resolveItemIds.mockImplementation(async () => new Map([[2, 202], [3, 203], [4, 204]]));
    factory.createRecordWithPayload.mockImplementation(async (p, itemId, payload) => ({ id: 700, date: payload.date }));
    factory.createMediaRecordFromFile.mockResolvedValue({ id: 800 });
    factory.uploadFile.mockResolvedValue({});
    factory.addMetadataPayload.mockResolvedValue({});
    factory.updateMediaRecord.mockResolvedValue({});
    factory.setSigners.mockResolvedValue({});
    factory.fetchProject.mockResolvedValue(projectData);
});

afterEach(() => {
    document.body.innerHTML = '';
});

describe('EntityBuilder without a project', () => {
    test('shows the empty header and keeps creation disabled', () => {
        renderTab({ projectData: null });
        expect(screen.getByText('nav projekta')).toBeTruthy();
        expect(button(/Izveidot 3 US/).disabled).toBe(true);
        expect(button(/^Izpildīt/).disabled).toBe(true);
    });
});

describe('EntityBuilder with a project', () => {
    test('previews inventory payloads with per-payload validation', () => {
        renderTab();
        fireEvent.click(screen.getAllByRole('button', { name: /Priekšskatīt/ })[0]);
        expect(screen.getByText(/Priekšskatījums: 3 US/)).toBeTruthy();
        const marks = Array.from(document.querySelectorAll('span')).filter(s => s.textContent === '✓');
        expect(marks.length).toBe(3);
        expect(screen.getByText('Copy JSON')).toBeTruthy();
    });

    test('a negative preset is previewed with a warning mark, not an error', () => {
        renderTab();
        fireEvent.change(selectByOption('Nejaušs'), { target: { value: 'invalidDates' } });
        fireEvent.click(screen.getAllByRole('button', { name: /Priekšskatīt/ })[0]);
        const warnings = Array.from(document.querySelectorAll('span')).filter(s => s.textContent === '⚠');
        expect(warnings.length).toBe(3);
    });

    test('a dry run reports without calling the factory', async () => {
        renderTab();
        fireEvent.click(screen.getByLabelText(/Sausais mēģinājums/));
        await act(async () => { fireEvent.click(button(/Izveidot 3 US/)); });

        expect(await screen.findByText(/Rezultāts: Pielāgots \(sauss\)/)).toBeTruthy();
        expect(factory.createInventoryWithPayload).not.toHaveBeenCalled();
        expect(screen.getByText('Copy Report')).toBeTruthy();
    });

    test('creating inventories calls the factory once per payload and refreshes the project cache', async () => {
        renderTab();
        const invalidate = jest.spyOn(client, 'invalidateQueries');
        await act(async () => { fireEvent.click(button(/Izveidot 3 US/)); });

        expect(await screen.findByText(/Rezultāts: Pielāgots/)).toBeTruthy();
        expect(factory.createInventoryWithPayload).toHaveBeenCalledTimes(3);
        expect(factory.createInventoryWithPayload.mock.calls[0][0]).toBe(1); // projectId
        expect(factory.createInventoryWithPayload.mock.calls[0][1]).toBe(2); // fondId
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['project', 'detail', 1] });
        const row = screen.getByText('inventories').closest('tr');
        expect(row.textContent).toContain('OK');
    });

    test('items go into the selected inventory and ids are resolved once', async () => {
        renderTab();
        fireEvent.change(selectByOption(/#1 Tekstuāls/), { target: { value: '10' } });
        await act(async () => { fireEvent.click(button(/Izveidot 3 GV/)); });

        expect(await screen.findByText(/Rezultāts: Pielāgots/)).toBeTruthy();
        expect(factory.createItemWithPayload).toHaveBeenCalledTimes(3);
        factory.createItemWithPayload.mock.calls.forEach(c => expect(c[1]).toBe(10));
        expect(factory.resolveItemIds).toHaveBeenCalledTimes(1);
        expect(factory.createInventoryWithPayload).not.toHaveBeenCalled();
    });

    test('records go into the selected item with files and metadata', async () => {
        renderTab();
        fireEvent.change(selectByOption(/#1 Tekstuāls/), { target: { value: '10' } });
        fireEvent.change(selectByOption(/GV #1 - Pirmā/), { target: { value: '100' } });
        await act(async () => { fireEvent.click(button(/Izveidot 3 Dok\./)); });

        expect(await screen.findByText(/Rezultāts: Pielāgots/)).toBeTruthy();
        expect(factory.createRecordWithPayload).toHaveBeenCalledTimes(3);
        factory.createRecordWithPayload.mock.calls.forEach(c => expect(c[1]).toBe(100));
        expect(factory.uploadFile).toHaveBeenCalledTimes(3);          // 1 file per record
        expect(factory.addMetadataPayload).toHaveBeenCalledTimes(12); // 4 classes x 3 records
    });

    test('a media inventory creates one file-backed record and enriches it', async () => {
        renderTab();
        fireEvent.change(selectByOption(/#2 Foto/), { target: { value: '11' } });
        fireEvent.change(selectByOption(/GV #1 - Foto GV/), { target: { value: '101' } });
        await act(async () => { fireEvent.click(button(/Izveidot 1 Dok\./)); });

        expect(await screen.findByText(/Rezultāts: Pielāgots/)).toBeTruthy();
        expect(factory.createMediaRecordFromFile).toHaveBeenCalledWith(1, 101, 'Foto');
        expect(factory.updateMediaRecord).toHaveBeenCalledTimes(1);
        expect(factory.updateMediaRecord.mock.calls[0].slice(0, 3)).toEqual([1, 800, 'Foto']);
    });

    test('a scenario dry run reports by scenario name', async () => {
        renderTab();
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Sausais mēģinājums/ })); });
        expect(await screen.findByText(/Rezultāts: Smoke - pa vienam no katra \(sauss\)/)).toBeTruthy();
        expect(factory.createInventoryWithPayload).not.toHaveBeenCalled();
    });

    test('a live scenario run reads the fresh inventory count and sets signers', async () => {
        renderTab();
        await act(async () => { fireEvent.click(button(/^Izpildīt/)); });
        expect(await screen.findByText(/Rezultāts: Smoke - pa vienam no katra\s+- seed/)).toBeTruthy();
        expect(factory.fetchProject).toHaveBeenCalledWith(1);
        expect(factory.setSigners).toHaveBeenCalledWith(1, 3, expect.objectContaining({ creator: expect.any(String) }));
        // numbering continues after the two existing inventories
        expect(factory.createInventoryWithPayload.mock.calls.map(c => c[2].number)).toEqual([3, 4, 5, 6]);
    });

    test('enriching existing media records skips the ones already filled', async () => {
        const withMixed = JSON.parse(JSON.stringify(projectData));
        withMixed.institution.fond.inventories[1].items[0].photo_records = [
            { id: 900 }, { id: 901, color: 'krāsainā', horizontal_resolution: 100 },
        ];
        renderTab({ projectData: withMixed });
        fireEvent.change(selectByOption(/#2 Foto/), { target: { value: '11' } });
        await act(async () => { fireEvent.click(button(/Papildināt esošos/)); });

        expect(factory.updateMediaRecord).toHaveBeenCalledTimes(1);
        expect(factory.updateMediaRecord.mock.calls[0][1]).toBe(900);
        expect(await screen.findByText(/1 atjaunināti, 1 jau aizpildīti, 0 kļūdas/)).toBeTruthy();
    });

    test('a factory failure is logged and counted, and the run finishes', async () => {
        factory.createInventoryWithPayload
            .mockRejectedValueOnce(Object.assign(new Error('dup'), { fieldErrors: { number: ['exists'] } }))
            .mockResolvedValue({ id: 7, number: 7 });
        renderTab();
        await act(async () => { fireEvent.click(button(/Izveidot 3 US/)); });

        expect(await screen.findByText(/Rezultāts: Pielāgots/)).toBeTruthy();
        expect(screen.getAllByText(/number: exists/).length).toBeGreaterThan(0);
        const row = screen.getByText('inventories').closest('tr');
        expect(row.textContent).toContain('!!');
    });
});
