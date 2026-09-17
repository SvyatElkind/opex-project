import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TestDashboard from './TestDashboard';

// The real registry pulls in suites that use import.meta (jsdom cannot parse
// it), so the runner is replaced with a scripted fake per test.
jest.mock('../testing/index', () => ({
    createTestRunner: () => global.__fakeRunner,
}));

const results = {
    suites: [
        { name: 'Alpha', passed: 1, failed: 0, skipped: 0, duration: 2,
          tests: [{ name: 'adds', status: 'passed', duration: 2 }] },
        { name: 'Beta', passed: 1, failed: 1, skipped: 1, duration: 3,
          tests: [
              { name: 'works', status: 'passed', duration: 1 },
              { name: 'breaks', status: 'failed', duration: 2, error: 'Expected 1 but got 2', expected: '1', actual: '2' },
              { name: 'later', status: 'skipped', duration: 0 },
          ] },
    ],
    totals: { suites: 2, tests: 4, passed: 2, failed: 1, skipped: 1, duration: 1500 },
};

const makeRunner = (overrides = {}) => ({
    getSuiteNames: () => ['Alpha', 'Beta'],
    runAll: jest.fn(async (onProgress) => { onProgress?.('Alpha', 'adds', 'running'); return results; }),
    runSuite: jest.fn(async (name) => ({
        suites: results.suites.filter(s => s.name === name),
        totals: { suites: 1, tests: 1, passed: 1, failed: 0, skipped: 0, duration: 2 },
    })),
    abort: jest.fn(),
    ...overrides,
});

beforeEach(() => {
    global.__fakeRunner = makeRunner();
});

afterEach(() => {
    document.body.innerHTML = '';
    delete global.__fakeRunner;
});

const runButton = () => screen.getByRole('button', { name: /Run Tests/ });

describe('TestDashboard', () => {
    test('lists the registered suites and starts empty', () => {
        render(<TestDashboard />);
        expect(screen.getByText('2 suites registered')).toBeTruthy();
        expect(screen.getByRole('option', { name: 'Alpha' })).toBeTruthy();
        expect(screen.getByRole('option', { name: 'Beta' })).toBeTruthy();
        expect(screen.getByText(/Click "Run Tests"/)).toBeTruthy();
    });

    test('running all suites shows the summary cards and auto-expands the failing suite', async () => {
        render(<TestDashboard />);
        await act(async () => { fireEvent.click(runButton()); });

        expect(global.__fakeRunner.runAll).toHaveBeenCalledTimes(1);
        expect(screen.getByText('FAILURES')).toBeTruthy();
        expect(screen.getByText('1.50s')).toBeTruthy();
        expect(screen.getByText('breaks')).toBeTruthy();                 // Beta expanded
        expect(screen.getByText('Expected 1 but got 2')).toBeTruthy();
        expect(screen.getByText('Expected: 1')).toBeTruthy();
        expect(screen.queryByText('adds')).toBeNull();                    // Alpha collapsed
        expect(screen.getByText('Copy All Failures')).toBeTruthy();
    });

    test('clicking a suite header toggles its tests', async () => {
        render(<TestDashboard />);
        await act(async () => { fireEvent.click(runButton()); });
        // 'Alpha' is also an <option>; scope to the suite header
        fireEvent.click(screen.getByText('Alpha', { selector: '.test-suite-name' }));
        expect(screen.getByText('adds')).toBeTruthy();
        fireEvent.click(screen.getByText('Alpha', { selector: '.test-suite-name' }));
        expect(screen.queryByText('adds')).toBeNull();
    });

    test('the failed filter hides suites without failures and passing rows', async () => {
        render(<TestDashboard />);
        await act(async () => { fireEvent.click(runButton()); });
        fireEvent.click(screen.getByRole('button', { name: /Failed \(1\)/ }));
        expect(screen.queryByText('Alpha', { selector: '.test-suite-name' })).toBeNull();
        expect(screen.getByText('breaks')).toBeTruthy();
        expect(screen.queryByText('works')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: /All \(4\)/ }));
        expect(screen.getByText('Alpha', { selector: '.test-suite-name' })).toBeTruthy();
    });

    test('running one suite goes through runSuite and reports ALL PASSED', async () => {
        render(<TestDashboard />);
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Alpha' } });
        await act(async () => { fireEvent.click(runButton()); });

        expect(global.__fakeRunner.runSuite).toHaveBeenCalledWith('Alpha', expect.any(Function));
        expect(global.__fakeRunner.runAll).not.toHaveBeenCalled();
        expect(screen.getByText('ALL PASSED')).toBeTruthy();
        expect(screen.queryByText('Copy All Failures')).toBeNull();
    });

    test('a runner that throws is shown as an error banner', async () => {
        global.__fakeRunner = makeRunner({ runAll: jest.fn(async () => { throw new Error('registry broken'); }) });
        render(<TestDashboard />);
        await act(async () => { fireEvent.click(runButton()); });
        expect(screen.getByText('registry broken')).toBeTruthy();
        expect(screen.getByText('FAILURES')).toBeTruthy();
    });

    test('the abort button forwards to the runner while a run is in flight', async () => {
        let finish;
        const runAll = jest.fn(() => new Promise(resolve => { finish = () => resolve(results); }));
        global.__fakeRunner = makeRunner({ runAll });
        render(<TestDashboard />);

        act(() => { fireEvent.click(runButton()); });
        expect(screen.getByText('Running...')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: /Abort/ }));
        expect(global.__fakeRunner.abort).toHaveBeenCalledTimes(1);

        await act(async () => { finish(); });
        expect(screen.queryByText('Running...')).toBeNull();
    });
});
