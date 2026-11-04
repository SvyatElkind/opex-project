import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecordMetadata from './RecordMetadata';

jest.mock('../hooks/useMetadata', () => ({
    useCreateMetadata: () => ({ mutateAsync: jest.fn(), isPending: false }),
    useUpdateMetadata: () => ({ mutateAsync: jest.fn(), isPending: false }),
    useDeleteMetadata: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));
jest.mock('../components/Notification', () => ({
    useNotification: () => ({ notify: { error: jest.fn() }, showConfirm: jest.fn() }),
}));

const renderEmpty = (activeSection) => render(
    <RecordMetadata
        recordId={1}
        projectId={1}
        recordData={{}}
        activeSection={activeSection}
        onSectionChange={() => {}}
    />
);

// The empty-state text used to be built from the section label
// ("Nav pievienotu lasīšanas statuss"), which is ungrammatical in Latvian.
describe('RecordMetadata empty state', () => {
    it.each([
        ['actions', 'Nav pievienotu darbību'],
        ['addressees', 'Nav pievienotu adresātu'],
        ['visas', 'Nav pievienotu vīzu'],
        ['read_status', 'Nav pievienotu iepazīšanās atzīmju'],
    ])('%s shows its own text and an add button', (section, text) => {
        renderEmpty(section);
        expect(screen.getByText(text)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Pievienot' })).toBeInTheDocument();
    });

    it('does not mention the old "Lasīšanas statuss" name', () => {
        renderEmpty('read_status');
        expect(screen.queryByText(/Lasīšanas/)).not.toBeInTheDocument();
    });
});
