/**
 * In-Browser Test Runner Framework
 *
 * Lightweight test framework for running tests from the DevAdmin panel.
 * Provides describe/it/expect pattern similar to Jest.
 */

// ─── Assertion Library ───────────────────────────────────────────────────────

class AssertionError extends Error {
  constructor(message, expected, actual) {
    super(message);
    this.name = 'AssertionError';
    this.expected = expected;
    this.actual = actual;
  }
}

const expect = (actual) => ({
  toBe(expected) {
    if (actual !== expected) {
      throw new AssertionError(
        `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`,
        expected, actual
      );
    }
  },
  toEqual(expected) {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a !== b) {
      throw new AssertionError(
        `Expected deep equal:\n  Expected: ${b}\n  Actual:   ${a}`,
        expected, actual
      );
    }
  },
  toBeTruthy() {
    if (!actual) {
      throw new AssertionError(
        `Expected truthy but got ${JSON.stringify(actual)}`,
        'truthy', actual
      );
    }
  },
  toBeFalsy() {
    if (actual) {
      throw new AssertionError(
        `Expected falsy but got ${JSON.stringify(actual)}`,
        'falsy', actual
      );
    }
  },
  toBeNull() {
    if (actual !== null) {
      throw new AssertionError(
        `Expected null but got ${JSON.stringify(actual)}`,
        null, actual
      );
    }
  },
  toBeUndefined() {
    if (actual !== undefined) {
      throw new AssertionError(
        `Expected undefined but got ${JSON.stringify(actual)}`,
        undefined, actual
      );
    }
  },
  toBeDefined() {
    if (actual === undefined) {
      throw new AssertionError(
        `Expected defined but got undefined`,
        'defined', undefined
      );
    }
  },
  toBeGreaterThan(expected) {
    if (!(actual > expected)) {
      throw new AssertionError(
        `Expected ${actual} to be greater than ${expected}`,
        `> ${expected}`, actual
      );
    }
  },
  toBeGreaterThanOrEqual(expected) {
    if (!(actual >= expected)) {
      throw new AssertionError(
        `Expected ${actual} to be >= ${expected}`,
        `>= ${expected}`, actual
      );
    }
  },
  toBeLessThan(expected) {
    if (!(actual < expected)) {
      throw new AssertionError(
        `Expected ${actual} to be less than ${expected}`,
        `< ${expected}`, actual
      );
    }
  },
  toContain(expected) {
    const contains = Array.isArray(actual)
      ? actual.includes(expected)
      : typeof actual === 'string' && actual.includes(expected);
    if (!contains) {
      throw new AssertionError(
        `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`,
        expected, actual
      );
    }
  },
  toHaveLength(expected) {
    if (actual?.length !== expected) {
      throw new AssertionError(
        `Expected length ${expected} but got ${actual?.length}`,
        expected, actual?.length
      );
    }
  },
  toHaveProperty(key, value) {
    if (!(key in (actual || {}))) {
      throw new AssertionError(
        `Expected object to have property "${key}"`,
        key, Object.keys(actual || {})
      );
    }
    if (value !== undefined && actual[key] !== value) {
      throw new AssertionError(
        `Expected property "${key}" to be ${JSON.stringify(value)} but got ${JSON.stringify(actual[key])}`,
        value, actual[key]
      );
    }
  },
  toBeInstanceOf(expected) {
    if (!(actual instanceof expected)) {
      throw new AssertionError(
        `Expected instance of ${expected.name}`,
        expected.name, actual?.constructor?.name
      );
    }
  },
  toMatch(pattern) {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    if (!regex.test(actual)) {
      throw new AssertionError(
        `Expected "${actual}" to match ${regex}`,
        pattern.toString(), actual
      );
    }
  },
  toThrow(expectedMessage) {
    let threw = false;
    let thrownError;
    try {
      actual();
    } catch (e) {
      threw = true;
      thrownError = e;
    }
    if (!threw) {
      throw new AssertionError('Expected function to throw', 'throw', 'no throw');
    }
    if (expectedMessage && !thrownError.message.includes(expectedMessage)) {
      throw new AssertionError(
        `Expected error message to include "${expectedMessage}" but got "${thrownError.message}"`,
        expectedMessage, thrownError.message
      );
    }
  },
  not: {
    toBe(expected) {
      if (actual === expected) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} NOT to be ${JSON.stringify(expected)}`,
          `not ${expected}`, actual
        );
      }
    },
    toBeNull() {
      if (actual === null) {
        throw new AssertionError('Expected NOT null but got null', 'not null', null);
      }
    },
    toBeTruthy() {
      if (actual) {
        throw new AssertionError(
          `Expected NOT truthy but got ${JSON.stringify(actual)}`,
          'falsy', actual
        );
      }
    },
    toContain(expected) {
      const contains = Array.isArray(actual)
        ? actual.includes(expected)
        : typeof actual === 'string' && actual.includes(expected);
      if (contains) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} NOT to contain ${JSON.stringify(expected)}`,
          `not contain ${expected}`, actual
        );
      }
    },
    toHaveProperty(key) {
      if (key in (actual || {})) {
        throw new AssertionError(
          `Expected object NOT to have property "${key}"`,
          `no "${key}"`, Object.keys(actual || {})
        );
      }
    },
    toBeFalsy() {
      if (!actual) return; // passes
      throw new AssertionError(
        `Expected falsy but got ${JSON.stringify(actual)}`,
        'falsy', actual
      );
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) return; // passes
      throw new AssertionError(
        `Expected NOT equal to ${JSON.stringify(expected)}`,
        `not ${JSON.stringify(expected)}`, actual
      );
    },
    toBeUndefined() {
      if (actual !== undefined) return; // passes
      throw new AssertionError('Expected NOT undefined', 'defined', undefined);
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new AssertionError('Expected NOT defined but got undefined', 'undefined', actual);
      }
    },
    toBeGreaterThan(expected) {
      if (actual > expected) {
        throw new AssertionError(
          `Expected ${actual} NOT to be greater than ${expected}`,
          `<= ${expected}`, actual
        );
      }
    },
    toBeLessThan(expected) {
      if (actual < expected) {
        throw new AssertionError(
          `Expected ${actual} NOT to be less than ${expected}`,
          `>= ${expected}`, actual
        );
      }
    },
    toHaveLength(expected) {
      if (actual?.length === expected) {
        throw new AssertionError(
          `Expected length NOT ${expected}`,
          `not ${expected}`, actual?.length
        );
      }
    },
    toMatch(pattern) {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      if (regex.test(actual)) {
        throw new AssertionError(
          `Expected "${actual}" NOT to match ${regex}`,
          `not match ${pattern}`, actual
        );
      }
    },
    toThrow() {
      let threw = false;
      try { actual(); } catch { threw = true; }
      if (threw) {
        throw new AssertionError('Expected function NOT to throw', 'no throw', 'throw');
      }
    }
  }
});

// ─── Test Runner ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} TestResult
 * @property {string} name
 * @property {'passed'|'failed'|'skipped'} status
 * @property {number} duration
 * @property {string} [error]
 * @property {string} [expected]
 * @property {string} [actual]
 */

/**
 * @typedef {Object} SuiteResult
 * @property {string} name
 * @property {TestResult[]} tests
 * @property {number} passed
 * @property {number} failed
 * @property {number} skipped
 * @property {number} duration
 */

const DEFAULT_TEST_TIMEOUT = 15000; // 15 seconds per test

class TestRunner {
  constructor() {
    this.suites = [];
    this.results = [];
    this.onProgress = null;
    this.aborted = false;
    this.testTimeout = DEFAULT_TEST_TIMEOUT;
  }

  /**
   * Register a test suite
   * @param {string} name - Suite name
   * @param {Function} fn - Function that defines tests using describe/it
   */
  registerSuite(name, fn) {
    this.suites.push({ name, fn });
  }

  /**
   * Run all registered suites
   * @param {Function} [onProgress] - Progress callback (suiteName, testName, status)
   * @returns {Promise<Object>} Full results
   */
  async runAll(onProgress) {
    this.onProgress = onProgress;
    this.results = [];
    this.aborted = false;
    const startTime = performance.now();

    for (const suite of this.suites) {
      if (this.aborted) break;
      const suiteResult = await this._runSuite(suite);
      this.results.push(suiteResult);
    }

    const totalDuration = performance.now() - startTime;
    return this._buildReport(totalDuration);
  }

  /**
   * Run a single suite by name
   */
  async runSuite(suiteName, onProgress) {
    this.onProgress = onProgress;
    this.aborted = false;
    const suite = this.suites.find(s => s.name === suiteName);
    if (!suite) throw new Error(`Suite "${suiteName}" not found`);

    const startTime = performance.now();
    const suiteResult = await this._runSuite(suite);
    const totalDuration = performance.now() - startTime;

    return {
      suites: [suiteResult],
      totals: {
        suites: 1,
        tests: suiteResult.tests.length,
        passed: suiteResult.passed,
        failed: suiteResult.failed,
        skipped: suiteResult.skipped,
        duration: totalDuration
      }
    };
  }

  abort() {
    this.aborted = true;
  }

  async _runSuite(suite) {
    const tests = [];
    const describes = [];
    let currentDescribe = null;

    // Collect tests via describe/it pattern
    const describe = (name, fn) => {
      currentDescribe = name;
      fn();
      currentDescribe = null;
    };

    const it = (name, fn) => {
      const fullName = currentDescribe ? `${currentDescribe} > ${name}` : name;
      tests.push({ name: fullName, fn });
    };

    // Also support test() as alias for it()
    const test = it;

    // Execute the suite function to collect tests
    try {
      suite.fn({ describe, it, test, expect });
    } catch (e) {
      return {
        name: suite.name,
        tests: [{ name: 'Suite Setup', status: 'failed', duration: 0, error: e.message }],
        passed: 0, failed: 1, skipped: 0, duration: 0
      };
    }

    // Run collected tests
    const suiteStart = performance.now();
    const testResults = [];
    let passed = 0, failed = 0, skipped = 0;

    for (const t of tests) {
      if (this.aborted) {
        testResults.push({ name: t.name, status: 'skipped', duration: 0 });
        skipped++;
        continue;
      }

      if (this.onProgress) {
        this.onProgress(suite.name, t.name, 'running');
      }

      const testStart = performance.now();
      try {
        const result = t.fn();
        // Support async tests with timeout
        if (result && typeof result.then === 'function') {
          await Promise.race([
            result,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Test timed out after ${this.testTimeout}ms`)), this.testTimeout)
            )
          ]);
        }
        const duration = performance.now() - testStart;
        testResults.push({ name: t.name, status: 'passed', duration });
        passed++;
      } catch (e) {
        const duration = performance.now() - testStart;
        testResults.push({
          name: t.name,
          status: 'failed',
          duration,
          error: e.message,
          expected: e.expected !== undefined ? JSON.stringify(e.expected) : undefined,
          actual: e.actual !== undefined ? JSON.stringify(e.actual) : undefined
        });
        failed++;
      }

      if (this.onProgress) {
        this.onProgress(suite.name, t.name, testResults[testResults.length - 1].status);
      }
    }

    return {
      name: suite.name,
      tests: testResults,
      passed,
      failed,
      skipped,
      duration: performance.now() - suiteStart
    };
  }

  _buildReport(totalDuration) {
    let totalPassed = 0, totalFailed = 0, totalSkipped = 0, totalTests = 0;
    for (const s of this.results) {
      totalPassed += s.passed;
      totalFailed += s.failed;
      totalSkipped += s.skipped;
      totalTests += s.tests.length;
    }

    return {
      suites: this.results,
      totals: {
        suites: this.results.length,
        tests: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        skipped: totalSkipped,
        duration: totalDuration
      }
    };
  }

  getSuiteNames() {
    return this.suites.map(s => s.name);
  }
}

export { TestRunner, expect, AssertionError };
export default TestRunner;
