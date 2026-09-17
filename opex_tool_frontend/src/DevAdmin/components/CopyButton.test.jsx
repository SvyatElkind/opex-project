import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CopyButton, {
    formatTestReport, formatSingleTest, formatNetworkRequest, formatAsCurl, formatFormReport, formatErrorLog,
} from './CopyButton';

describe('report formatters', () => {
    const results = {
        totals: { passed: 3, failed: 1, skipped: 0, duration: 1234 },
        suites: [
            { name: 'Clean', failed: 0, tests: [{ name: 'a', status: 'passed' }] },
            { name: 'Dirty', failed: 1, tests: [
                { name: 'b', status: 'passed' },
                { name: 'c', status: 'failed', error: 'Expected 1 but got 2', expected: '1', actual: '2' },
            ] },
        ],
    };

    test('formatTestReport lists only suites with failures, with the diff', () => {
        const text = formatTestReport(results);
        expect(text).toContain('Status: FAILURES DETECTED');
        expect(text).toContain('Passed: 3 | Failed: 1 | Skipped: 0');
        expect(text).toContain('Duration: 1.23s');
        expect(text).toContain('--- Dirty (1 failed) ---');
        expect(text).toContain('FAIL: c');
        expect(text).toContain('Expected: 1');
        expect(text).toContain('Actual: 2');
        expect(text).not.toContain('Clean');
        expect(text).not.toContain('FAIL: b');
    });

    test('formatTestReport says ALL PASSED and tolerates a missing result', () => {
        expect(formatTestReport({ totals: { passed: 1, failed: 0, skipped: 0, duration: 10 }, suites: [] })).toContain('ALL PASSED');
        expect(formatTestReport(null)).toBe('');
    });

    test('formatSingleTest includes duration, error and diff when present', () => {
        const text = formatSingleTest('Suite X', { name: 't', status: 'failed', duration: 12.345, error: 'boom', expected: '"a"', actual: '"b"' });
        expect(text).toBe(['Suite: Suite X', 'Test: t', 'Status: failed', 'Duration: 12.3ms', 'Error: boom', 'Expected: "a"', 'Actual: "b"'].join('\n'));
        expect(formatSingleTest('S', { name: 't', status: 'passed' })).toContain('Duration: N/A');
    });

    test('formatNetworkRequest renders bodies, error and headers as sections', () => {
        const text = formatNetworkRequest({
            method: 'POST', url: '/api/v1/project/', status: 400, statusText: 'Bad Request', duration: 42,
            timestamp: Date.now(), isFormData: false,
            requestBody: { name: 'x' }, responseBody: 'nope', error: 'Rejected',
            responseHeaders: { 'content-type': 'application/json' },
        });
        expect(text).toContain('POST /api/v1/project/');
        expect(text).toContain('Status: 400 Bad Request');
        expect(text).toContain('FormData: No');
        expect(text).toContain('-- Request Body --\n{\n  "name": "x"\n}');
        expect(text).toContain('-- Response Body --\nnope');
        expect(text).toContain('-- Error --\nRejected');
        expect(text).toContain('content-type: application/json');
    });

    test('formatNetworkRequest omits empty sections', () => {
        const text = formatNetworkRequest({ method: 'GET', url: '/x', duration: 1, timestamp: 0 });
        expect(text).toContain('Status: N/A');
        expect(text).not.toContain('Request Body');
        expect(text).not.toContain('Response Headers');
    });

    test('formatAsCurl builds a runnable command with headers and an escaped JSON body', () => {
        const curl = formatAsCurl({
            method: 'PUT', url: 'http://localhost:8000/api/v1/item/1/',
            requestHeaders: { 'Content-Type': 'application/json', Accept: undefined },
            requestBody: { title: "O'Neil" }, isFormData: false,
        });
        expect(curl.startsWith("curl -X PUT \\\n  'http://localhost:8000/api/v1/item/1/'")).toBe(true);
        expect(curl).toContain("-H 'Content-Type: application/json'");
        expect(curl).not.toContain('Accept');
        expect(curl).toContain("-d '{\"title\":\"O\\'Neil\"}'");
    });

    test('formatAsCurl uses -F for form data', () => {
        const curl = formatAsCurl({ method: 'POST', url: '/up', isFormData: true, requestBody: { files: 'a.pdf', note: 'x' } });
        expect(curl).toContain("-F 'files=a.pdf'");
        expect(curl).toContain("-F 'note=x'");
        expect(curl).not.toContain('-d');
    });

    test('formatFormReport labels each field by its state', () => {
        const text = formatFormReport({
            name: 'Item form', totalFields: 4, filledFields: 1, emptyRequired: 1, invalidFields: 1,
            fields: [
                { name: 'title', type: 'text', required: true, isEmpty: false, valid: true, value: 'A', maxLength: 10, currentLength: 1 },
                { name: 'code', type: 'text', required: true, isEmpty: true, valid: true, value: '' },
                { name: 'notes', type: 'textarea', required: false, isEmpty: true, valid: true, value: '' },
                { name: 'date', type: 'date', required: false, isEmpty: false, valid: false, value: 'x', validationMessage: 'Bad date' },
                { name: 'off', type: 'text', disabled: true, isEmpty: true, valid: true, value: '' },
            ],
        });
        expect(text).toContain('Fields: 4 | Filled: 1 | Empty Required: 1 | Invalid: 1');
        expect(text).toContain('[OK] title (text) *: "A"');
        expect(text).toContain('Length: 1/10');
        expect(text).toContain('[EMPTY (required)] code (text) *: ""');
        expect(text).toContain('[empty] notes (textarea): ""');
        expect(text).toContain('[INVALID] date (date): "x"');
        expect(text).toContain('Error: Bad date');
        expect(text).toContain('[DISABLED] off');
        expect(formatFormReport(null)).toBe('');
    });

    test('formatErrorLog prefixes entries by type', () => {
        const text = formatErrorLog([
            { timestamp: '10:00', type: 'error', message: 'e' },
            { timestamp: '10:01', type: 'warning', message: 'w' },
            { timestamp: '10:02', type: 'success', message: 's' },
            { timestamp: '10:03', type: 'info', message: 'i' },
        ]);
        expect(text).toContain('Entries: 4');
        expect(text).toContain('[10:00] ERR e');
        expect(text).toContain('[10:01] WRN w');
        expect(text).toContain('[10:02] OK  s');
        expect(text).toContain('[10:03] INF i');
        expect(formatErrorLog([])).toBe('');
    });
});

describe('<CopyButton />', () => {
    let writeText;

    beforeEach(() => {
        jest.useFakeTimers();
        writeText = jest.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    });

    afterEach(() => {
        jest.useRealTimers();
        delete navigator.clipboard;
    });

    test('copies the text, shows "Copied" and reverts after 1.5 s', async () => {
        render(<CopyButton text="hello" label="Copy it" />);
        const button = screen.getByRole('button');
        expect(button.textContent).toContain('Copy it');

        await act(async () => { fireEvent.click(button); });

        expect(writeText).toHaveBeenCalledWith('hello');
        expect(button.textContent).toContain('Copied');
        act(() => { jest.advanceTimersByTime(1600); });
        expect(button.textContent).toContain('Copy it');
    });

    test('getText wins over text and is evaluated on click', async () => {
        const getText = jest.fn(() => 'lazy');
        render(<CopyButton text="eager" getText={getText} />);
        expect(getText).not.toHaveBeenCalled();
        await act(async () => { fireEvent.click(screen.getByRole('button')); });
        expect(writeText).toHaveBeenCalledWith('lazy');
    });

    test('does nothing for empty content and does not bubble the click', async () => {
        const parentClick = jest.fn();
        render(<div onClick={parentClick}><CopyButton text="" /></div>);
        await act(async () => { fireEvent.click(screen.getByRole('button')); });
        expect(writeText).not.toHaveBeenCalled();
        expect(parentClick).not.toHaveBeenCalled();
    });

    test('falls back to execCommand when the clipboard API rejects', async () => {
        writeText.mockRejectedValue(new Error('insecure context'));
        document.execCommand = jest.fn().mockReturnValue(true);
        render(<CopyButton text="fallback" />);

        await act(async () => { fireEvent.click(screen.getByRole('button')); });

        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(document.querySelector('textarea')).toBeNull(); // helper node cleaned up
        expect(screen.getByRole('button').textContent).toContain('Copied');
    });

    test('label={false} renders an icon-only button', () => {
        render(<CopyButton text="x" label={false} />);
        expect(screen.getByRole('button').textContent).toBe('');
    });
});
