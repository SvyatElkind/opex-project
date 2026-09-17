/**
 * The interceptor captures window.fetch at import time, so each test gets a
 * fresh module instance with a fresh fake fetch underneath it.
 */
describe('fetchInterceptor', () => {
    let realFetch;
    let mod;

    beforeEach(() => {
        jest.resetModules();
        realFetch = jest.fn(async (...args) => ({ ok: true, status: 200, args }));
        window.fetch = realFetch;
        mod = require('./fetchInterceptor');
    });

    afterEach(() => {
        delete window.fetch;
    });

    test('installs the wrapper on the first middleware and restores fetch when the last one leaves', async () => {
        const before = window.fetch;
        const id = mod.addMiddleware(async (args, next) => next(args));
        const wrapper = window.fetch;
        expect(wrapper).not.toBe(before);

        mod.removeMiddleware(id);
        expect(window.fetch).not.toBe(wrapper);
        await window.fetch('/after-restore');
        expect(realFetch).toHaveBeenCalledWith('/after-restore');
    });

    test('removing one of two middlewares keeps the wrapper installed', () => {
        const a = mod.addMiddleware(async (args, next) => next(args));
        const wrapper = window.fetch;
        mod.addMiddleware(async (args, next) => next(args));
        mod.removeMiddleware(a);
        expect(window.fetch).toBe(wrapper);
    });

    test('runs middleware in insertion order and passes through to the real fetch', async () => {
        const order = [];
        mod.addMiddleware(async (args, next) => { order.push('first'); return next(args); });
        mod.addMiddleware(async (args, next) => { order.push('second'); return next(args); });

        const res = await window.fetch('/x', { method: 'GET' });

        expect(order).toEqual(['first', 'second']);
        expect(realFetch).toHaveBeenCalledTimes(1);
        expect(realFetch).toHaveBeenCalledWith('/x', { method: 'GET' });
        expect(res.ok).toBe(true);
    });

    test('a middleware can short-circuit, and nothing after it runs', async () => {
        const later = jest.fn(async (args, next) => next(args));
        mod.addMiddleware(async () => ({ ok: false, status: 503, mocked: true }));
        mod.addMiddleware(later);

        const res = await window.fetch('/blocked');

        expect(res).toEqual({ ok: false, status: 503, mocked: true });
        expect(later).not.toHaveBeenCalled();
        expect(realFetch).not.toHaveBeenCalled();
    });

    test('a middleware can rewrite the arguments for everything downstream', async () => {
        mod.addMiddleware(async (args, next) => next(['/rewritten', { ...(args[1] || {}), headers: { 'X-Dev': '1' } }]));
        const seen = [];
        mod.addMiddleware(async (args, next) => { seen.push(args[0]); return next(args); });

        await window.fetch('/original', { method: 'POST' });

        expect(seen).toEqual(['/rewritten']);
        expect(realFetch).toHaveBeenCalledWith('/rewritten', { method: 'POST', headers: { 'X-Dev': '1' } });
    });

    test('getOriginalFetch bypasses every middleware', async () => {
        const spy = jest.fn(async (args, next) => next(args));
        mod.addMiddleware(spy);

        await mod.getOriginalFetch()('/direct');

        expect(spy).not.toHaveBeenCalled();
        expect(realFetch).toHaveBeenCalledWith('/direct');
    });

    test('middleware ids are unique and removing an unknown id is harmless', () => {
        const a = mod.addMiddleware(async (args, next) => next(args));
        const b = mod.addMiddleware(async (args, next) => next(args));
        expect(a).not.toBe(b);
        expect(() => mod.removeMiddleware(9999)).not.toThrow();
        mod.removeMiddleware(a);
        mod.removeMiddleware(b);
    });

    test('a rejection inside a middleware surfaces to the caller', async () => {
        mod.addMiddleware(async () => { throw new Error('middleware exploded'); });
        await expect(window.fetch('/boom')).rejects.toThrow('middleware exploded');
    });
});
