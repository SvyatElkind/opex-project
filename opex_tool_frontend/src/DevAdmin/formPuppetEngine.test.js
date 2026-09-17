import {
    sleep, isoToDisplayDate, waitForSelector, waitForSelectorGone,
    setReactValue, setSelectValue, setDateValue, setCheckbox,
    selectReactSelectOption, addTagValue, highlightElement, scrollIntoView,
    runPuppetSteps, verifyFormState, formatPuppetLog,
} from './formPuppetEngine';

const mount = (html) => {
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.appendChild(host);
    return host;
};

afterEach(() => {
    document.body.innerHTML = '';
    jest.useRealTimers();
});

describe('helpers', () => {
    test('isoToDisplayDate converts ISO to DD.MM.YYYY and passes anything else through', () => {
        expect(isoToDisplayDate('2024-05-12')).toBe('12.05.2024');
        expect(isoToDisplayDate('12.05.2024')).toBe('12.05.2024');
        expect(isoToDisplayDate('')).toBe('');
    });

    test('sleep resolves after the delay', async () => {
        const t0 = Date.now();
        await sleep(15);
        expect(Date.now() - t0).toBeGreaterThanOrEqual(10);
    });
});

describe('waitForSelector / waitForSelectorGone', () => {
    test('resolves immediately when the element already exists', async () => {
        mount('<div class="already-here"></div>');
        const el = await waitForSelector('.already-here', 50);
        expect(el.className).toBe('already-here');
    });

    test('resolves when the element appears later', async () => {
        setTimeout(() => mount('<span class="late"></span>'), 10);
        const el = await waitForSelector('.late', 500);
        expect(el.tagName).toBe('SPAN');
    });

    test('rejects on timeout with the selector in the message', async () => {
        await expect(waitForSelector('.never', 20)).rejects.toThrow('.never');
    });

    test('waitForSelectorGone resolves once the element is removed', async () => {
        const host = mount('<div class="going"></div>');
        setTimeout(() => host.remove(), 10);
        await expect(waitForSelectorGone('.going', 500)).resolves.toBeUndefined();
    });

    test('waitForSelectorGone rejects when the element stays', async () => {
        mount('<div class="stays"></div>');
        await expect(waitForSelectorGone('.stays', 20)).rejects.toThrow('removal');
    });
});

describe('field primitives', () => {
    test('setReactValue sets the value and fires input + change once when instant', async () => {
        const host = mount('<input name="title" />');
        const input = host.querySelector('input');
        const events = [];
        input.addEventListener('input', () => events.push('input'));
        input.addEventListener('change', () => events.push('change'));

        await setReactValue(input, 'Hello');

        expect(input.value).toBe('Hello');
        expect(events).toEqual(['input', 'change']);
    });

    test('setReactValue types character by character when charDelay is set', async () => {
        const host = mount('<textarea name="notes"></textarea>');
        const area = host.querySelector('textarea');
        const seen = [];
        area.addEventListener('input', () => seen.push(area.value));

        await setReactValue(area, 'abc', { charDelay: 1 });

        expect(seen).toEqual(['a', 'ab', 'abc']);
        expect(area.value).toBe('abc');
    });

    test('setSelectValue picks the option and fires change', () => {
        const host = mount('<select name="t"><option value="a">A</option><option value="b">B</option></select>');
        const select = host.querySelector('select');
        const onChange = jest.fn();
        select.addEventListener('change', onChange);

        setSelectValue(select, 'b');

        expect(select.value).toBe('b');
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    test('setDateValue writes ISO into a native date input', async () => {
        const host = mount('<input type="date" name="d" />');
        const input = host.querySelector('input');
        await setDateValue(input, '2023-02-03');
        expect(input.value).toBe('2023-02-03');
    });

    test('setDateValue writes the display format into a react-datepicker input and blurs it', async () => {
        const host = mount('<div class="react-datepicker__input-container"><input name="d" /></div>');
        const input = host.querySelector('input');
        const onBlur = jest.fn();
        input.addEventListener('blur', onBlur);

        await setDateValue(input, '2023-02-03');

        expect(input.value).toBe('03.02.2023');
        expect(onBlur).toHaveBeenCalled();
    });

    test('setCheckbox clicks only when the state differs', () => {
        const host = mount('<input type="checkbox" name="c" />');
        const box = host.querySelector('input');
        const click = jest.spyOn(box, 'click');

        setCheckbox(box, false);
        expect(click).not.toHaveBeenCalled();
        setCheckbox(box, true);
        expect(click).toHaveBeenCalledTimes(1);
        expect(box.checked).toBe(true);
    });

    test('selectReactSelectOption opens the control and clicks the matching option', async () => {
        const host = mount(`
            <div class="my-select">
              <div class="rs-control"></div>
              <div class="rs-option">Foto</div>
              <div class="rs-option">Video</div>
            </div>`);
        const clicked = [];
        host.querySelectorAll('.rs-option').forEach(o => o.addEventListener('click', () => clicked.push(o.textContent)));

        await selectReactSelectOption('.my-select', 'Video', 1);

        expect(clicked).toEqual(['Video']);
    });

    test('selectReactSelectOption throws for a missing container or option', async () => {
        await expect(selectReactSelectOption('.nope', 'X', 1)).rejects.toThrow('container not found');
        mount('<div class="empty-select"></div>');
        await expect(selectReactSelectOption('.empty-select', 'X', 1)).rejects.toThrow('option not found');
    });

    test('addTagValue clicks a suggestion when one appears', async () => {
        const host = mount(`
            <div class="lang-field">
              <div><input name="language" /></div>
              <div class="lang-language-option">latviešu</div>
            </div>`);
        const option = host.querySelector('.lang-language-option');
        const onClick = jest.fn();
        option.addEventListener('click', onClick);

        await addTagValue(host.querySelector('input'), 'latv');

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('addTagValue falls back to Enter and clears the input', async () => {
        const host = mount('<div><div><input name="kw" /></div></div>');
        const input = host.querySelector('input');
        const keys = [];
        input.addEventListener('keydown', (e) => keys.push(e.key));

        await addTagValue(input, 'arhīvs');

        expect(keys).toEqual(['Enter']);
        expect(input.value).toBe('');
    });

    test('highlightElement flashes an outline and restores the previous style', () => {
        jest.useFakeTimers();
        const host = mount('<div style="color: red;"></div>');
        const el = host.firstElementChild;

        highlightElement(el, 100);
        expect(el.style.outline).toContain('2px solid');

        jest.advanceTimersByTime(120);
        expect(el.style.outline).toBe('');
        expect(el.style.color).toBe('red');
        expect(() => highlightElement(null)).not.toThrow();
    });

    test('scrollIntoView tolerates a missing element and calls the DOM method', () => {
        expect(() => scrollIntoView(null)).not.toThrow();
        const el = document.createElement('div');
        el.scrollIntoView = jest.fn();
        scrollIntoView(el);
        expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    });
});

describe('runPuppetSteps', () => {
    const ok = (label) => ({ label, action: async () => {} });
    const bad = (label) => ({ label, action: async () => { throw new Error('nope'); } });

    test('runs every step, records failures and keeps going', async () => {
        const statuses = [];
        const result = await runPuppetSteps([ok('one'), bad('two'), ok('three')],
            (i, label, status) => statuses.push(`${i}:${status}`), { delayBetween: 0 });

        expect(result.completed).toBe(2);
        expect(result.failed).toBe(1);
        expect(result.errors).toEqual(['two: nope']);
        expect(result.log.map(l => l.status)).toEqual(['ok', 'FAIL', 'ok']);
        expect(result.log[1].error).toBe('nope');
        expect(statuses).toEqual(['0:running', '0:done', '1:running', '1:error', '2:running', '2:done']);
        expect(typeof result.totalMs).toBe('number');
        expect(result.verification).toEqual({ checks: [], passed: 0, failed: 0 });
    });

    test('an already-aborted signal stops before the first step', async () => {
        const controller = new AbortController();
        controller.abort();
        const action = jest.fn();
        const result = await runPuppetSteps([{ label: 'x', action }], null, { abortSignal: controller.signal, delayBetween: 0 });

        expect(action).not.toHaveBeenCalled();
        expect(result.errors).toEqual(['Aborted by user']);
        expect(result.log[0].status).toBe('abort');
    });

    test('aborting mid-run skips the remaining steps', async () => {
        const controller = new AbortController();
        const third = jest.fn();
        const result = await runPuppetSteps([
            ok('first'),
            { label: 'second', action: async () => controller.abort() },
            { label: 'third', action: third },
        ], null, { abortSignal: controller.signal, delayBetween: 0 });

        expect(result.completed).toBe(2);
        expect(third).not.toHaveBeenCalled();
        expect(result.errors).toContain('Aborted by user');
    });

    test('verifies declared expectations against the DOM at the end', async () => {
        mount('<form class="inventory-create-form"><input name="title" /><input type="checkbox" name="el" /></form>');
        const steps = [
            { label: 'fill', expect: { selector: '[name="title"]', value: 'Hi', name: 'title' },
              action: async () => { document.querySelector('[name="title"]').value = 'Hi'; } },
            { label: 'tick', expect: [{ selector: '[name="el"]', value: 'true' }, { selector: '[name="ghost"]', value: '1' }],
              action: async () => {} },
        ];
        const result = await runPuppetSteps(steps, null, { delayBetween: 0 });
        expect(result.verification.passed).toBe(1);
        expect(result.verification.failed).toBe(2);
        expect(result.verification.checks.map(c => c.actual)).toEqual(['Hi', 'false', '(not found)']);
    });
});

describe('verifyFormState / formatPuppetLog', () => {
    test('verifyFormState truncates long actual values', () => {
        mount('<input name="long" />');
        document.querySelector('[name="long"]').value = 'x'.repeat(300);
        const v = verifyFormState([{ expect: { selector: '[name="long"]', value: 'y' } }]);
        expect(v.checks[0].actual).toHaveLength(120);
        expect(v.failed).toBe(1);
    });

    test('formatPuppetLog produces every section, including a DOM snapshot of the first form', () => {
        mount('<div class="create-item-nav-container"><input name="title" value="Snap" /><input type="checkbox" name="flag" /></div>');
        const text = formatPuppetLog('Demo recipe', {
            completed: 1, failed: 1, totalMs: 42,
            errors: ['step two: nope'],
            log: [
                { step: 1, label: 'one', status: 'ok', ms: 5, error: null },
                { step: 2, label: 'two', status: 'FAIL', ms: 7, error: 'nope' },
                { step: 3, label: '(aborted)', status: 'abort', ms: 0, error: null },
            ],
            verification: { checks: [{ field: 'title', expected: 'A', actual: 'B', match: false }], passed: 0, failed: 1 },
        });

        expect(text).toContain('Recipe : Demo recipe');
        expect(text).toContain('Result : 1 ok, 1 failed, 42ms total');
        expect(text).toContain('[OK  ] 1. one');
        expect(text).toContain('[FAIL] 2. two');
        expect(text).toContain('-> nope');
        expect(text).toContain('[ABRT] 3.');
        expect(text).toContain('Errors:');
        expect(text).toContain('Verification: 0 passed, 1 failed');
        expect(text).toContain('[MISS] title');
        expect(text).toContain('Form: .create-item-nav-container (visible)');
        expect(text).toContain('title = Snap');
        expect(text).toContain('flag = false');
        expect(text.trim().endsWith('=== End Log ===')).toBe(true);
    });
});
