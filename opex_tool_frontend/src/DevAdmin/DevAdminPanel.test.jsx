import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

// Every tab body is stubbed: this file covers the shell (tabs, keyboard,
// minimise, presets, close), not the fifteen panels behind it.
jest.mock('./components/ProjectStateInspector', () => () => require('react').createElement('div', { 'data-testid': 'tab-state' }));
jest.mock('./components/LocalStorageManager', () => () => require('react').createElement('div', { 'data-testid': 'tab-storage' }));
jest.mock('./components/ValidationTester', () => () => require('react').createElement('div', { 'data-testid': 'tab-validation' }));
jest.mock('./components/QuickActions', () => (props) => require('react').createElement('div', { 'data-testid': 'tab-actions', 'data-project': props.selectedProjectId }));
jest.mock('./components/TestDashboard', () => () => require('react').createElement('div', { 'data-testid': 'tab-tests' }));
jest.mock('./components/NetworkMonitor', () => () => require('react').createElement('div', { 'data-testid': 'tab-network' }));
jest.mock('./components/FormInspector', () => () => require('react').createElement('div', { 'data-testid': 'tab-forms' }));
jest.mock('./components/PerformanceProfiler', () => () => require('react').createElement('div', { 'data-testid': 'tab-performance' }));
jest.mock('./components/ErrorBoundaryTester', () => () => require('react').createElement('div', { 'data-testid': 'tab-errors' }));
jest.mock('./components/APIMockToggle', () => () => require('react').createElement('div', { 'data-testid': 'tab-mocks' }));
jest.mock('./components/QuickCreate', () => () => require('react').createElement('div', { 'data-testid': 'tab-quickcreate' }));
jest.mock('./components/ThemeSwitcher', () => () => require('react').createElement('div', { 'data-testid': 'tab-theme' }));
jest.mock('./components/FormPuppet', () => () => require('react').createElement('div', { 'data-testid': 'tab-puppet' }));
jest.mock('./components/OPEXProgressMonitor', () => () => require('react').createElement('div', { 'data-testid': 'tab-opex' }));
jest.mock('./components/EntityBuilder', () => () => require('react').createElement('div', { 'data-testid': 'tab-builder' }));

import DevAdminPanel from './DevAdminPanel';

const TAB_LABELS = ['State', 'Network', 'Forms', 'Perf', 'Tests', 'Errors', 'Mocks', 'Storage',
    'Valid.', 'Create', 'Builder', 'Theme', 'Actions', 'Puppet', 'OPEX'];

const tabs = () => Array.from(document.querySelectorAll('.dev-tab'));
const tabByLabel = (label) => tabs().find(t => t.textContent.trim() === label);

beforeAll(() => {
    // jsdom has no layout: the panel scrolls the active tab into view.
    Element.prototype.scrollIntoView = jest.fn();
});

afterEach(() => {
    document.body.innerHTML = '';
});

describe('DevAdminPanel shell', () => {
    test('renders all fifteen tabs in order and opens on State', () => {
        render(<DevAdminPanel onClose={jest.fn()} />);
        expect(tabs().map(t => t.textContent.trim())).toEqual(TAB_LABELS);
        expect(tabByLabel('State').className).toContain('active');
        expect(screen.getByTestId('tab-state')).toBeTruthy();
        expect(screen.queryByTestId('tab-builder')).toBeNull();
    });

    test('clicking a tab switches the content', () => {
        render(<DevAdminPanel onClose={jest.fn()} />);
        fireEvent.click(tabByLabel('Builder'));
        expect(screen.getByTestId('tab-builder')).toBeTruthy();
        expect(screen.queryByTestId('tab-state')).toBeNull();
        expect(tabByLabel('Builder').className).toContain('active');
    });

    test('Ctrl+] and Ctrl+[ cycle through the tabs, wrapping around', () => {
        render(<DevAdminPanel onClose={jest.fn()} />);
        fireEvent.keyDown(document, { key: ']', ctrlKey: true });
        expect(screen.getByTestId('tab-network')).toBeTruthy();
        fireEvent.keyDown(document, { key: '[', ctrlKey: true });
        fireEvent.keyDown(document, { key: '[', ctrlKey: true });
        expect(screen.getByTestId('tab-opex')).toBeTruthy(); // wrapped from State to the last tab
    });

    test('Escape closes the panel', () => {
        const onClose = jest.fn();
        render(<DevAdminPanel onClose={onClose} />);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('clicking the dimmed overlay closes, clicking inside the window does not', () => {
        const onClose = jest.fn();
        render(<DevAdminPanel onClose={onClose} />);
        fireEvent.click(document.querySelector('.dev-admin-header'));
        expect(onClose).not.toHaveBeenCalled();
        fireEvent.click(document.querySelector('.dev-admin-overlay'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('minimise collapses to a pill and clicking the pill restores the panel', () => {
        render(<DevAdminPanel onClose={jest.fn()} />);
        fireEvent.click(screen.getByTitle('Minimize'));
        expect(document.querySelector('.dev-admin-window')).toBeNull();
        const pill = document.querySelector('.dev-admin-minimized');
        expect(pill).toBeTruthy();
        fireEvent.click(pill);
        expect(document.querySelector('.dev-admin-window')).toBeTruthy();
    });

    test('size presets resize the window and the footer reports it', () => {
        render(<DevAdminPanel onClose={jest.fn()} />);
        expect(document.querySelector('.dev-footer-size').textContent).toBe('900x600');
        fireEvent.click(screen.getByTitle('Large'));
        expect(document.querySelector('.dev-footer-size').textContent).toBe('1200x750');
        expect(document.querySelector('.dev-admin-window').className).toContain('dev-size-large');
        fireEvent.click(screen.getByTitle('Compact'));
        expect(document.querySelector('.dev-admin-window').className).toContain('dev-size-medium');
    });

    test('dragging the header moves the window', () => {
        render(<DevAdminPanel onClose={jest.fn()} />);
        const win = document.querySelector('.dev-admin-window');
        expect(win.style.left).toBe('80px');
        fireEvent.mouseDown(document.querySelector('.dev-admin-header'), { clientX: 100, clientY: 100 });
        act(() => { fireEvent.mouseMove(document, { clientX: 150, clientY: 130 }); });
        fireEvent.mouseUp(document);
        expect(win.style.left).toBe('130px');
        expect(win.style.top).toBe('90px');
    });

    test('passes the selected project id through to Actions even without project data', () => {
        render(<DevAdminPanel onClose={jest.fn()} projectData={undefined} selectedProjectId={42} projectsList={[]} />);
        fireEvent.click(tabByLabel('Actions'));
        expect(screen.getByTestId('tab-actions').getAttribute('data-project')).toBe('42');
    });

    test('the close button calls onClose', () => {
        const onClose = jest.fn();
        render(<DevAdminPanel onClose={onClose} />);
        fireEvent.click(screen.getByTitle('Close (Esc)'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
