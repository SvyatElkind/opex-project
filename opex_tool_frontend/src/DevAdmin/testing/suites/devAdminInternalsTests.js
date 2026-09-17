/**
 * DevAdmin Internals (in-browser)
 *
 * The panel's own plumbing, checked from inside the panel:
 * - the test runner and its matchers (a runner running a runner)
 * - the shared fetch interceptor (chain order, short-circuit, cleanup)
 * - the puppet engine's pure parts and step runner
 * - the paste-ready report formatters
 * - the random test-data helpers and the factory's pure helpers
 *
 * Mirrors the Jest files next to each module (fetchInterceptor.test.js,
 * formPuppetEngine.test.js, testing/TestRunner.test.js, components/
 * CopyButton.test.jsx, testDataUtils.test.js) so the same guarantees can be
 * confirmed without a terminal.
 */

import TestRunner, { expect as runnerExpect, AssertionError } from '../TestRunner';
import { addMiddleware, removeMiddleware, getOriginalFetch } from '../../fetchInterceptor';
import {
  isoToDisplayDate, setReactValue, setCheckbox, verifyFormState, runPuppetSteps, formatPuppetLog,
} from '../../formPuppetEngine';
import {
  formatTestReport, formatSingleTest, formatNetworkRequest, formatAsCurl, formatFormReport, formatErrorLog,
} from '../../components/CopyButton';
import { generateSeriesCode, buildAction, buildVisa, metadataTotal, metadataSummary } from '../../testDataUtils';
import { parentPath, describeApiError, randomProjectName, allRecordsOf, allFilesOf } from '../../devDataFactory';
import { SERIES_CODE_REGEX } from '../../../Constants/itemConstants';

const devAdminInternalsTests = ({ describe, it, expect }) => {

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST RUNNER (a runner running a runner)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('TestRunner', () => {
    it('collects describe > it names and counts passes and failures', async () => {
      const inner = new TestRunner();
      inner.registerSuite('Inner', ({ describe: d, it: t, expect: e }) => {
        d('Group', () => {
          t('passes', () => e(1).toBe(1));
          t('fails', () => e(1).toBe(2));
        });
      });
      const report = await inner.runAll();
      expect(report.totals.tests).toBe(2);
      expect(report.totals.passed).toBe(1);
      expect(report.totals.failed).toBe(1);
      expect(report.suites[0].tests[0].name).toBe('Group > passes');
      expect(report.suites[0].tests[1].expected).toBe('2');
      expect(report.suites[0].tests[1].actual).toBe('1');
    });

    it('times out a test that never settles', async () => {
      const inner = new TestRunner();
      inner.testTimeout = 20;
      inner.registerSuite('Slow', ({ it: t }) => { t('hangs', () => new Promise(() => {})); });
      const report = await inner.runAll();
      expect(report.suites[0].tests[0].status).toBe('failed');
      expect(report.suites[0].tests[0].error).toContain('timed out');
    });

    it('abort() skips what is left', async () => {
      const inner = new TestRunner();
      inner.registerSuite('A', ({ it: t, expect: e }) => {
        t('one', () => e(1).toBe(1));
        t('stop', () => inner.abort());
        t('three', () => e(1).toBe(1));
      });
      const report = await inner.runAll();
      expect(report.totals.skipped).toBe(1);
    });

    it('AssertionError carries expected and actual', () => {
      let caught = null;
      try { runnerExpect({ a: 1 }).toEqual({ a: 2 }); } catch (e) { caught = e; }
      expect(caught instanceof AssertionError).toBeTruthy();
      expect(caught.expected).toEqual({ a: 2 });
      expect(caught.actual).toEqual({ a: 1 });
    });

    it('.not.toBeFalsy and .not.toBeDefined are no longer inverted', () => {
      expect(() => runnerExpect(1).not.toBeFalsy()).not.toThrow();
      expect(() => runnerExpect(0).not.toBeFalsy()).toThrow();
      expect(() => runnerExpect(undefined).not.toBeDefined()).not.toThrow();
      expect(() => runnerExpect(1).not.toBeDefined()).toThrow();
    });

    it('toEqual is JSON-based: key order matters', () => {
      expect(() => runnerExpect({ a: 1, b: 2 }).toEqual({ b: 2, a: 1 })).toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH INTERCEPTOR
  // ═══════════════════════════════════════════════════════════════════════════

  describe('fetchInterceptor', () => {
    const TEST_URL = '/__devadmin_internals__/never-sent';

    it('runs middleware in insertion order and a middleware can short-circuit', async () => {
      const order = [];
      const a = addMiddleware(async (args, next) => {
        if (String(args[0]).startsWith(TEST_URL)) { order.push('a'); }
        return next(args);
      });
      const b = addMiddleware(async (args, next) => {
        if (String(args[0]).startsWith(TEST_URL)) {
          order.push('b');
          return new Response('{"mocked":true}', { status: 299, headers: { 'Content-Type': 'application/json' } });
        }
        return next(args);
      });
      try {
        const res = await window.fetch(TEST_URL);
        expect(res.status).toBe(299);
        expect((await res.json()).mocked).toBe(true);
        expect(order).toEqual(['a', 'b']);
      } finally {
        removeMiddleware(a);
        removeMiddleware(b);
      }
    });

    it('a middleware can rewrite the request for those after it', async () => {
      const seen = [];
      const a = addMiddleware(async (args, next) => {
        if (String(args[0]).startsWith(TEST_URL)) return next([`${TEST_URL}?rewritten=1`, args[1]]);
        return next(args);
      });
      const b = addMiddleware(async (args, next) => {
        if (String(args[0]).startsWith(TEST_URL)) { seen.push(String(args[0])); return new Response('', { status: 204 }); }
        return next(args);
      });
      try {
        await window.fetch(TEST_URL);
        expect(seen).toEqual([`${TEST_URL}?rewritten=1`]);
      } finally {
        removeMiddleware(a);
        removeMiddleware(b);
      }
    });

    it('exposes the real fetch and tolerates removing unknown ids', () => {
      expect(typeof getOriginalFetch()).toBe('function');
      expect(() => removeMiddleware(-1)).not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PUPPET ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('formPuppetEngine', () => {
    const withHost = async (html, fn) => {
      const host = document.createElement('div');
      host.style.position = 'fixed';
      host.style.left = '-9999px';
      host.innerHTML = html;
      document.body.appendChild(host);
      try { return await fn(host); } finally { host.remove(); }
    };

    it('isoToDisplayDate converts and passes through', () => {
      expect(isoToDisplayDate('2024-05-12')).toBe('12.05.2024');
      expect(isoToDisplayDate('x')).toBe('x');
    });

    it('setReactValue fires input then change', async () => {
      await withHost('<input data-puppet-test="1" />', async (host) => {
        const input = host.querySelector('input');
        const events = [];
        input.addEventListener('input', () => events.push('input'));
        input.addEventListener('change', () => events.push('change'));
        await setReactValue(input, 'Hi');
        expect(input.value).toBe('Hi');
        expect(events).toEqual(['input', 'change']);
      });
    });

    it('setCheckbox only clicks when the state differs', async () => {
      await withHost('<input type="checkbox" />', async (host) => {
        const box = host.querySelector('input');
        setCheckbox(box, false);
        expect(box.checked).toBe(false);
        setCheckbox(box, true);
        expect(box.checked).toBe(true);
      });
    });

    it('runPuppetSteps records failures, keeps going and verifies expectations', async () => {
      await withHost('<input data-puppet-verify="1" />', async (host) => {
        const input = host.querySelector('input');
        const statuses = [];
        const result = await runPuppetSteps([
          { label: 'fill', expect: { selector: '[data-puppet-verify="1"]', value: 'ok' }, action: async () => { input.value = 'ok'; } },
          { label: 'boom', action: async () => { throw new Error('nope'); } },
          { label: 'after', action: async () => {} },
        ], (i, label, status) => statuses.push(status), { delayBetween: 0 });
        expect(result.completed).toBe(2);
        expect(result.failed).toBe(1);
        expect(result.errors[0]).toContain('boom: nope');
        expect(result.verification.passed).toBe(1);
        expect(statuses).toEqual(['running', 'done', 'running', 'error', 'running', 'done']);
      });
    });

    it('verifyFormState reports missing elements', () => {
      const v = verifyFormState([{ expect: { selector: '[data-puppet-missing="1"]', value: 'x' } }]);
      expect(v.checks[0].actual).toBe('(not found)');
      expect(v.failed).toBe(1);
    });

    it('formatPuppetLog has every section', () => {
      const text = formatPuppetLog('R', {
        completed: 1, failed: 0, totalMs: 3, errors: [],
        log: [{ step: 1, label: 'one', status: 'ok', ms: 3, error: null }],
        verification: { checks: [], passed: 0, failed: 0 },
      });
      expect(text).toContain('Recipe : R');
      expect(text).toContain('[OK  ] 1. one');
      expect(text).toContain('DOM snapshot:');
      expect(text).toContain('=== End Log ===');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // REPORT FORMATTERS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('CopyButton formatters', () => {
    it('formatTestReport lists only failing suites', () => {
      const text = formatTestReport({
        totals: { passed: 1, failed: 1, skipped: 0, duration: 500 },
        suites: [
          { name: 'Clean', failed: 0, tests: [{ name: 'a', status: 'passed' }] },
          { name: 'Dirty', failed: 1, tests: [{ name: 'b', status: 'failed', error: 'E', expected: '1', actual: '2' }] },
        ],
      });
      expect(text).toContain('FAILURES DETECTED');
      expect(text).toContain('--- Dirty (1 failed) ---');
      expect(text).not.toContain('Clean');
      expect(text).toContain('Expected: 1');
    });

    it('formatSingleTest and formatErrorLog are line-oriented', () => {
      expect(formatSingleTest('S', { name: 't', status: 'failed', duration: 1.25, error: 'x' })).toContain('Duration: 1.3ms');
      expect(formatErrorLog([{ timestamp: '10:00', type: 'warning', message: 'w' }])).toContain('[10:00] WRN w');
    });

    it('formatNetworkRequest and formatAsCurl reproduce a request', () => {
      const req = { method: 'POST', url: '/api/v1/x/', status: 201, duration: 5, timestamp: Date.now(),
        requestHeaders: { 'Content-Type': 'application/json' }, requestBody: { a: 1 }, responseBody: { id: 1 } };
      expect(formatNetworkRequest(req)).toContain('POST /api/v1/x/');
      expect(formatNetworkRequest(req)).toContain('-- Response Body --');
      const curl = formatAsCurl(req);
      expect(curl).toContain("curl -X POST");
      expect(curl).toContain("-H 'Content-Type: application/json'");
      expect(curl).toContain("-d '{\"a\":1}'");
    });

    it('formatFormReport labels fields by state', () => {
      const text = formatFormReport({ name: 'F', totalFields: 1, filledFields: 0, emptyRequired: 1, invalidFields: 0,
        fields: [{ name: 'title', type: 'text', required: true, isEmpty: true, valid: true, value: '' }] });
      expect(text).toContain('[EMPTY (required)] title (text) *: ""');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('testDataUtils / devDataFactory helpers', () => {
    it('generateSeriesCode matches the backend regex', () => {
      for (let i = 0; i < 100; i++) expect(generateSeriesCode()).toMatch(SERIES_CODE_REGEX);
    });

    it('metadata builders produce the required fields', () => {
      const action = buildAction('2020-01-01');
      expect(action.created_date).toBe('2020-01-01');
      expect(action.due_date > action.created_date).toBeTruthy();
      expect(buildVisa('2020-01-01')).toHaveProperty('person');
      expect(metadataTotal({ visas: 1, addressees: 1, actions: 1, read_statuses: 1 })).toBe(4);
      expect(metadataSummary({ visas: 1, addressees: 0, actions: 0, read_statuses: 0 })).toContain('1 vizas');
    });

    it('parentPath strips the last segment on both path styles', () => {
      expect(parentPath('C:\\EDN\\P-1')).toBe('C:\\EDN');
      expect(parentPath('/home/user/opex/')).toBe('/home/user');
      expect(parentPath('')).toBe('');
    });

    it('describeApiError prefers field errors, then data, then the message', () => {
      expect(describeApiError({ fieldErrors: { title: ['Required'] } })).toBe('title: Required');
      expect(describeApiError({ data: { error: 'Nope' } })).toBe('error: Nope');
      expect(describeApiError(new Error('plain'))).toBe('plain');
      expect(describeApiError(null)).toBe('Nezināma kļūda');
    });

    it('randomProjectName satisfies the project-name rule', () => {
      for (let i = 0; i < 20; i++) expect(randomProjectName()).toMatch(/^[A-Za-z0-9_-]{1,20}$/);
    });

    it('allRecordsOf / allFilesOf walk media record arrays too', () => {
      const project = { institution: { fond: { inventories: [
        { id: 1, type: 'Tekstuāls', items: [{ id: 10, records: [{ id: 100, files: [{ id: 1000 }] }] }] },
        { id: 2, type: 'Foto', items: [{ id: 20, photo_records: [{ id: 200, files: [{ id: 2000 }, { id: 2001 }] }] }] },
      ] } } };
      const records = allRecordsOf(project);
      expect(records).toHaveLength(2);
      expect(records.filter(r => r.isMedia)).toHaveLength(1);
      expect(records.find(r => r.isMedia).mediaType).toBe('Foto');
      expect(allFilesOf(project)).toHaveLength(3);
    });
  });
};

export default devAdminInternalsTests;
