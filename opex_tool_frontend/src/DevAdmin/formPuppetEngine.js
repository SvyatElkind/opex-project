/**
 * FormPuppet Engine — Simulates real user interaction with React-controlled forms.
 *
 * React ignores direct `input.value = x` assignments because it tracks state
 * internally via the fiber. To work around this we use the native property
 * descriptor setter + a bubbled 'input' event, which React's synthetic event
 * system picks up.
 *
 * The engine exposes small, composable actions (type, select, click, wait)
 * that the recipes chain together with configurable delays so the user can
 * watch the form being filled in real time.
 */

// ─── Low-level DOM helpers ──────────────────────────────────────────────────

const nativeInputSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype, 'value'
).set;

const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
  window.HTMLTextAreaElement.prototype, 'value'
).set;

/** Sleep for ms. */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Wait until a selector appears in the DOM (up to timeoutMs). */
export const waitForSelector = (selector, timeoutMs = 5000) =>
  new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) { observer.disconnect(); resolve(found); }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for: ${selector}`));
    }, timeoutMs);
  });

/** Wait until selector is gone from the DOM. */
export const waitForSelectorGone = (selector, timeoutMs = 5000) =>
  new Promise((resolve, reject) => {
    if (!document.querySelector(selector)) return resolve();

    const observer = new MutationObserver(() => {
      if (!document.querySelector(selector)) { observer.disconnect(); resolve(); }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => { observer.disconnect(); reject(new Error(`Timeout waiting for removal: ${selector}`)); }, timeoutMs);
  });

// ─── Field interaction primitives ───────────────────────────────────────────

/**
 * Set a React-controlled <input> or <textarea> value as if the user typed it.
 * Supports character-by-character typing with a delay for visual effect.
 */
export const setReactValue = async (element, value, { charDelay = 0 } = {}) => {
  element.focus();

  if (charDelay > 0) {
    // Type character by character
    const setter = element.tagName === 'TEXTAREA' ? nativeTextareaSetter : nativeInputSetter;
    for (let i = 1; i <= value.length; i++) {
      setter.call(element, value.slice(0, i));
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(charDelay);
    }
  } else {
    // Instant fill
    const setter = element.tagName === 'TEXTAREA' ? nativeTextareaSetter : nativeInputSetter;
    setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }

  element.dispatchEvent(new Event('change', { bubbles: true }));
};

/**
 * Set a native <select> dropdown value.
 */
export const setSelectValue = (selectEl, value) => {
  selectEl.focus();
  selectEl.value = value;
  selectEl.dispatchEvent(new Event('change', { bubbles: true }));
};

/**
 * Set a native <input type="date"> value.
 * React date inputs need the native setter trick.
 */
export const setDateValue = (inputEl, dateStr) => {
  inputEl.focus();
  nativeInputSetter.call(inputEl, dateStr);
  inputEl.dispatchEvent(new Event('input', { bubbles: true }));
  inputEl.dispatchEvent(new Event('change', { bubbles: true }));
};

/**
 * Set a <input type="checkbox"> to a boolean value.
 */
export const setCheckbox = (checkboxEl, checked) => {
  if (checkboxEl.checked !== checked) {
    checkboxEl.click();
  }
};

/**
 * Click a react-select dropdown and pick an option by its label text.
 * Works by: clicking the control to open the menu, then clicking the option.
 */
export const selectReactSelectOption = async (containerSelector, labelText, delayMs = 300) => {
  // Click the control to open the menu
  const container = document.querySelector(containerSelector);
  if (!container) throw new Error(`react-select container not found: ${containerSelector}`);

  const control = container.querySelector('[class*="-control"]');
  if (control) {
    control.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await sleep(delayMs);
  }

  // Find and click the option
  const options = container.querySelectorAll('[class*="-option"]');
  for (const opt of options) {
    if (opt.textContent.trim() === labelText) {
      opt.click();
      await sleep(100);
      return;
    }
  }
  throw new Error(`react-select option not found: "${labelText}"`);
};

/**
 * Add a tag value to a language/keyword tag input.
 * Types the value, then simulates Enter key press.
 */
export const addTagValue = async (inputEl, value, { charDelay = 0 } = {}) => {
  await setReactValue(inputEl, value, { charDelay });
  await sleep(100);

  // Check if a dropdown appeared and click the matching option
  const parent = inputEl.closest('[class*="-field"]') || inputEl.parentElement?.parentElement;
  if (parent) {
    const dropdownOption = parent.querySelector('[class*="-language-option"], [class*="-language-add-custom"]');
    if (dropdownOption) {
      dropdownOption.click();
      await sleep(100);
      return;
    }
  }

  // Fallback: press Enter
  inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
  await sleep(100);

  // Clear the input after adding
  const setter = nativeInputSetter;
  setter.call(inputEl, '');
  inputEl.dispatchEvent(new Event('input', { bubbles: true }));
};

/**
 * Highlight an element briefly (green outline flash).
 */
export const highlightElement = (el, durationMs = 600) => {
  if (!el) return;
  const prev = el.style.cssText;
  el.style.outline = '2px solid #10b981';
  el.style.outlineOffset = '2px';
  el.style.transition = 'outline 0.2s ease';
  setTimeout(() => { el.style.cssText = prev; }, durationMs);
};

/**
 * Scroll an element into view smoothly.
 */
export const scrollIntoView = (el) => {
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// ─── Action runner ──────────────────────────────────────────────────────────

/**
 * Run a sequence of puppet steps with logging.
 *
 * Each step is: { label: string, action: async () => void }
 *
 * @param {Array} steps
 * @param {Function} onStep  - (index, label, status) callback
 * @param {Object} opts      - { delayBetween: ms, abortSignal }
 * @returns {Promise<{ completed: number, failed: number, errors: string[] }>}
 */
export const runPuppetSteps = async (steps, onStep, opts = {}) => {
  const { delayBetween = 400, abortSignal } = opts;
  let completed = 0;
  let failed = 0;
  const errors = [];
  const log = [];
  const runStart = performance.now();

  for (let i = 0; i < steps.length; i++) {
    if (abortSignal?.aborted) {
      errors.push('Aborted by user');
      log.push({ step: i + 1, label: '(aborted)', status: 'abort', ms: 0, error: null });
      break;
    }

    const step = steps[i];
    onStep?.(i, step.label, 'running');
    const t0 = performance.now();

    try {
      await step.action();
      const ms = Math.round(performance.now() - t0);
      completed++;
      log.push({ step: i + 1, label: step.label, status: 'ok', ms, error: null });
      onStep?.(i, step.label, 'done');
    } catch (err) {
      const ms = Math.round(performance.now() - t0);
      failed++;
      const errMsg = `${step.label}: ${err.message}`;
      errors.push(errMsg);
      log.push({ step: i + 1, label: step.label, status: 'FAIL', ms, error: err.message });
      onStep?.(i, step.label, 'error');
    }

    if (i < steps.length - 1) {
      await sleep(delayBetween);
    }
  }

  const totalMs = Math.round(performance.now() - runStart);

  // Pre-submit verification: compare expected values vs actual DOM values
  const verification = verifyFormState(steps);

  return { completed, failed, errors, log, totalMs, verification };
};

/**
 * Snapshot all visible form fields and compare against expected values
 * declared in the recipe steps.
 *
 * Each step can optionally have:
 *   { expect: { selector: 'input[name="title"]', value: 'My Title' } }
 *   or
 *   { expect: [{ selector: '...', value: '...' }, ...] }
 *
 * Returns { checks: [...], passed: n, failed: n }
 */
export const verifyFormState = (steps) => {
  const checks = [];

  for (const step of steps) {
    if (!step.expect) continue;
    const expectations = Array.isArray(step.expect) ? step.expect : [step.expect];

    for (const exp of expectations) {
      const el = document.querySelector(exp.selector);
      const actual = el
        ? (el.type === 'checkbox' ? String(el.checked) : (el.value || ''))
        : '(not found)';
      const expected = String(exp.value);
      const match = actual === expected;

      checks.push({
        field: exp.name || exp.selector,
        expected,
        actual: actual.slice(0, 120),
        match,
      });
    }
  }

  return {
    checks,
    passed: checks.filter(c => c.match).length,
    failed: checks.filter(c => !c.match).length,
  };
};

/**
 * Format a puppet run result into a paste-ready debug report.
 */
export const formatPuppetLog = (recipeName, result) => {
  const { completed, failed, errors, log, totalMs, verification } = result;
  const ts = new Date().toISOString();
  const lines = [];

  lines.push(`=== Form Puppet Log ===`);
  lines.push(`Recipe : ${recipeName}`);
  lines.push(`Time   : ${ts}`);
  lines.push(`Result : ${completed} ok, ${failed} failed, ${totalMs}ms total`);
  lines.push(`UA     : ${navigator.userAgent}`);
  lines.push(`URL    : ${window.location.href}`);
  lines.push('');
  lines.push('Steps:');

  if (log) {
    for (const entry of log) {
      const tag = entry.status === 'ok' ? 'OK  ' : entry.status === 'FAIL' ? 'FAIL' : 'ABRT';
      lines.push(`  [${tag}] ${entry.step}. ${entry.label}  (${entry.ms}ms)`);
      if (entry.error) {
        lines.push(`         -> ${entry.error}`);
      }
    }
  }

  if (errors.length > 0) {
    lines.push('');
    lines.push('Errors:');
    errors.forEach((e, i) => lines.push(`  ${i + 1}. ${e}`));
  }

  // Pre-submit verification
  if (verification && verification.checks.length > 0) {
    lines.push('');
    lines.push(`Verification: ${verification.passed} passed, ${verification.failed} failed`);
    for (const c of verification.checks) {
      const icon = c.match ? 'PASS' : 'MISS';
      lines.push(`  [${icon}] ${c.field}`);
      lines.push(`         expected: ${c.expected}`);
      lines.push(`         actual  : ${c.actual}`);
    }
  }

  // Snapshot visible form state
  lines.push('');
  lines.push('DOM snapshot:');
  const formSelectors = [
    '.inventory-create-form',
    '.create-item-nav-container',
    '.create-record-nav-container',
    '.metadata-card-form',
  ];
  for (const sel of formSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      lines.push(`  Form: ${sel} (visible)`);
      const inputs = el.querySelectorAll('input, textarea, select');
      inputs.forEach(inp => {
        const name = inp.name || inp.id || inp.className.split(' ')[0] || '(unnamed)';
        const val = inp.type === 'checkbox' ? String(inp.checked) : (inp.value || '').slice(0, 80);
        if (val || inp.type === 'checkbox') {
          lines.push(`    ${name} = ${val}`);
        }
      });
      break; // Only snapshot the first visible form
    }
  }

  lines.push('');
  lines.push('=== End Log ===');
  return lines.join('\n');
};
