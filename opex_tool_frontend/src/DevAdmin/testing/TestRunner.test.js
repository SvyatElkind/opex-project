import TestRunner, { expect as runnerExpect, AssertionError } from './TestRunner';

/**
 * The in-browser runner is itself code: these checks pin the matcher
 * semantics the 14 suites rely on (note toEqual is JSON-based, so key order
 * matters) and the runner's collection / timeout / abort behaviour.
 */
const failsWith = (fn, fragment) => {
    let caught = null;
    try { fn(); } catch (e) { caught = e; }
    expect(caught).toBeInstanceOf(AssertionError);
    if (fragment) expect(caught.message).toContain(fragment);
    return caught;
};

describe('runner expect() matchers', () => {
    test('toBe / toEqual / toBeTruthy / toBeFalsy', () => {
        expect(() => runnerExpect(1).toBe(1)).not.toThrow();
        const err = failsWith(() => runnerExpect(1).toBe(2), 'Expected 2 but got 1');
        expect(err.expected).toBe(2);
        expect(err.actual).toBe(1);

        expect(() => runnerExpect({ a: [1, 2] }).toEqual({ a: [1, 2] })).not.toThrow();
        failsWith(() => runnerExpect({ a: 1, b: 2 }).toEqual({ b: 2, a: 1 }), 'deep equal'); // JSON order matters
        expect(() => runnerExpect('x').toBeTruthy()).not.toThrow();
        failsWith(() => runnerExpect(0).toBeTruthy(), 'truthy');
        expect(() => runnerExpect('').toBeFalsy()).not.toThrow();
        failsWith(() => runnerExpect(1).toBeFalsy(), 'falsy');
    });

    test('null / undefined / defined', () => {
        expect(() => runnerExpect(null).toBeNull()).not.toThrow();
        failsWith(() => runnerExpect(0).toBeNull());
        expect(() => runnerExpect(undefined).toBeUndefined()).not.toThrow();
        failsWith(() => runnerExpect(null).toBeUndefined());
        expect(() => runnerExpect(0).toBeDefined()).not.toThrow();
        failsWith(() => runnerExpect(undefined).toBeDefined());
    });

    test('numeric comparisons', () => {
        expect(() => runnerExpect(5).toBeGreaterThan(4)).not.toThrow();
        failsWith(() => runnerExpect(4).toBeGreaterThan(4), 'greater than');
        expect(() => runnerExpect(4).toBeGreaterThanOrEqual(4)).not.toThrow();
        expect(() => runnerExpect(3).toBeLessThan(4)).not.toThrow();
        failsWith(() => runnerExpect(4).toBeLessThan(4), 'less than');
    });

    test('toContain works on arrays and strings, toHaveLength on anything with length', () => {
        expect(() => runnerExpect([1, 2]).toContain(2)).not.toThrow();
        expect(() => runnerExpect('hello').toContain('ell')).not.toThrow();
        failsWith(() => runnerExpect([1]).toContain(2), 'to contain');
        failsWith(() => runnerExpect(42).toContain(4));
        expect(() => runnerExpect('abc').toHaveLength(3)).not.toThrow();
        failsWith(() => runnerExpect([]).toHaveLength(1), 'length 1');
    });

    test('toHaveProperty checks presence and optionally the value', () => {
        expect(() => runnerExpect({ a: 1 }).toHaveProperty('a')).not.toThrow();
        expect(() => runnerExpect({ a: 1 }).toHaveProperty('a', 1)).not.toThrow();
        failsWith(() => runnerExpect({ a: 1 }).toHaveProperty('b'), 'property "b"');
        failsWith(() => runnerExpect({ a: 1 }).toHaveProperty('a', 2), 'to be 2');
        failsWith(() => runnerExpect(null).toHaveProperty('a'));
    });

    test('toBeInstanceOf / toMatch / toThrow', () => {
        expect(() => runnerExpect(new Error('x')).toBeInstanceOf(Error)).not.toThrow();
        failsWith(() => runnerExpect({}).toBeInstanceOf(Error), 'instance of Error');
        expect(() => runnerExpect('abc123').toMatch(/\d+/)).not.toThrow();
        expect(() => runnerExpect('abc').toMatch('b')).not.toThrow();
        failsWith(() => runnerExpect('abc').toMatch(/\d/), 'to match');
        expect(() => runnerExpect(() => { throw new Error('boom'); }).toThrow('boom')).not.toThrow();
        failsWith(() => runnerExpect(() => {}).toThrow(), 'to throw');
        failsWith(() => runnerExpect(() => { throw new Error('boom'); }).toThrow('other'), 'to include "other"');
    });

    test('.not counterparts invert every matcher', () => {
        const n = (v) => runnerExpect(v).not;
        expect(() => n(1).toBe(2)).not.toThrow();
        failsWith(() => n(1).toBe(1), 'NOT to be');
        expect(() => n(1).toBeNull()).not.toThrow();
        failsWith(() => n(null).toBeNull());
        expect(() => n(0).toBeTruthy()).not.toThrow();
        failsWith(() => n(1).toBeTruthy());
        expect(() => n([1]).toContain(2)).not.toThrow();
        failsWith(() => n([1]).toContain(1), 'NOT to contain');
        expect(() => n({}).toHaveProperty('a')).not.toThrow();
        failsWith(() => n({ a: 1 }).toHaveProperty('a'));
        expect(() => n(1).toBeFalsy()).not.toThrow();
        failsWith(() => n(0).toBeFalsy());
        expect(() => n({ a: 1 }).toEqual({ a: 2 })).not.toThrow();
        failsWith(() => n({ a: 1 }).toEqual({ a: 1 }), 'NOT equal');
        expect(() => n(1).toBeUndefined()).not.toThrow();
        failsWith(() => n(undefined).toBeUndefined());
        expect(() => n(undefined).toBeDefined()).not.toThrow();
        failsWith(() => n(1).toBeDefined(), 'NOT defined');
        expect(() => n(1).toBeGreaterThan(5)).not.toThrow();
        failsWith(() => n(6).toBeGreaterThan(5));
        expect(() => n(6).toBeLessThan(5)).not.toThrow();
        failsWith(() => n(4).toBeLessThan(5));
        expect(() => n('ab').toHaveLength(3)).not.toThrow();
        failsWith(() => n('ab').toHaveLength(2));
        expect(() => n('abc').toMatch(/\d/)).not.toThrow();
        failsWith(() => n('a1').toMatch(/\d/), 'NOT to match');
        expect(() => n(() => {}).toThrow()).not.toThrow();
        failsWith(() => n(() => { throw new Error('x'); }).toThrow(), 'NOT to throw');
    });
});

describe('TestRunner', () => {
    const suiteWithTwo = ({ describe, it, expect }) => {
        describe('Group', () => {
            it('passes', () => expect(1).toBe(1));
            it('fails', () => expect(1).toBe(2));
        });
        it('top level, async', async () => { await Promise.resolve(); expect(true).toBeTruthy(); });
    };

    test('collects describe > it names, runs sync and async tests, and reports totals', async () => {
        const runner = new TestRunner();
        runner.registerSuite('Alpha', suiteWithTwo);
        const progress = [];

        const report = await runner.runAll((suite, test, status) => progress.push(`${suite}|${test}|${status}`));

        expect(report.totals).toMatchObject({ suites: 1, tests: 3, passed: 2, failed: 1, skipped: 0 });
        const suite = report.suites[0];
        expect(suite.tests.map(t => t.name)).toEqual(['Group > passes', 'Group > fails', 'top level, async']);
        const failed = suite.tests.find(t => t.status === 'failed');
        expect(failed.error).toContain('Expected 2 but got 1');
        expect(failed.expected).toBe('2');
        expect(failed.actual).toBe('1');
        expect(progress).toContain('Alpha|Group > passes|running');
        expect(progress).toContain('Alpha|Group > passes|passed');
        expect(progress).toContain('Alpha|Group > fails|failed');
        expect(typeof suite.duration).toBe('number');
    });

    test('test() is an alias for it()', async () => {
        const runner = new TestRunner();
        runner.registerSuite('Alias', ({ test, expect }) => { test('via alias', () => expect(1).toBe(1)); });
        const report = await runner.runAll();
        expect(report.suites[0].tests[0].name).toBe('via alias');
        expect(report.totals.passed).toBe(1);
    });

    test('a suite whose setup throws is reported as a single failed "Suite Setup"', async () => {
        const runner = new TestRunner();
        runner.registerSuite('Broken', () => { throw new Error('cannot register'); });
        const report = await runner.runAll();
        expect(report.suites[0].tests).toEqual([expect.objectContaining({ name: 'Suite Setup', status: 'failed', error: 'cannot register' })]);
        expect(report.totals.failed).toBe(1);
    });

    test('an async test that never settles fails with a timeout', async () => {
        const runner = new TestRunner();
        runner.testTimeout = 20;
        runner.registerSuite('Slow', ({ it }) => { it('hangs', () => new Promise(() => {})); });
        const report = await runner.runAll();
        expect(report.suites[0].tests[0].status).toBe('failed');
        expect(report.suites[0].tests[0].error).toContain('timed out after 20ms');
    });

    test('abort() skips the remaining tests and the remaining suites', async () => {
        const runner = new TestRunner();
        runner.registerSuite('First', ({ it, expect }) => {
            it('runs', () => expect(1).toBe(1));
            it('aborts', () => { runner.abort(); });
            it('skipped', () => expect(1).toBe(1));
        });
        runner.registerSuite('Second', ({ it, expect }) => { it('never runs', () => expect(1).toBe(1)); });

        const report = await runner.runAll();

        expect(report.suites).toHaveLength(1);
        expect(report.suites[0].tests.map(t => t.status)).toEqual(['passed', 'passed', 'skipped']);
        expect(report.totals.skipped).toBe(1);
    });

    test('runSuite runs one suite by name and rejects unknown names', async () => {
        const runner = new TestRunner();
        runner.registerSuite('One', ({ it, expect }) => { it('a', () => expect(1).toBe(1)); });
        runner.registerSuite('Two', ({ it, expect }) => { it('b', () => expect(1).toBe(2)); });

        const report = await runner.runSuite('Two');
        expect(report.totals).toMatchObject({ suites: 1, tests: 1, passed: 0, failed: 1 });
        expect(runner.getSuiteNames()).toEqual(['One', 'Two']);
        await expect(runner.runSuite('Three')).rejects.toThrow('Suite "Three" not found');
    });

    test('a thrown non-assertion error is still a failure with its message', async () => {
        const runner = new TestRunner();
        runner.registerSuite('Throws', ({ it }) => { it('explodes', () => { throw new TypeError('bad type'); }); });
        const report = await runner.runAll();
        const t = report.suites[0].tests[0];
        expect(t.status).toBe('failed');
        expect(t.error).toBe('bad type');
        expect(t.expected).toBeUndefined();
    });
});
