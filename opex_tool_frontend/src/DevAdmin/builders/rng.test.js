import { createRng, normalizeSeed, randomSeed } from './rng';

describe('createRng', () => {
    test('the same seed yields the same sequence', () => {
        const a = createRng('k3f9a2');
        const b = createRng('k3f9a2');
        const seqA = Array.from({ length: 20 }, () => a.int(0, 1000));
        const seqB = Array.from({ length: 20 }, () => b.int(0, 1000));
        expect(seqA).toEqual(seqB);
    });

    test('different seeds diverge', () => {
        const a = createRng('one');
        const b = createRng('two');
        const seqA = Array.from({ length: 10 }, () => a.int(0, 1000000));
        const seqB = Array.from({ length: 10 }, () => b.int(0, 1000000));
        expect(seqA).not.toEqual(seqB);
    });

    test('int stays inside the inclusive range', () => {
        const rng = createRng(42);
        for (let i = 0; i < 500; i++) {
            const n = rng.int(3, 7);
            expect(n).toBeGreaterThanOrEqual(3);
            expect(n).toBeLessThanOrEqual(7);
        }
    });

    test('pick returns members of the array and undefined for an empty one', () => {
        const rng = createRng(7);
        const pool = ['a', 'b', 'c'];
        for (let i = 0; i < 50; i++) expect(pool).toContain(rng.pick(pool));
        expect(rng.pick([])).toBeUndefined();
    });

    test('weighted never chooses a zero-weight key', () => {
        const rng = createRng('w');
        const seen = new Set();
        for (let i = 0; i < 200; i++) seen.add(rng.weighted({ a: 1, b: 0, c: 2 }));
        expect(seen.has('b')).toBe(false);
        expect(seen.has('a')).toBe(true);
        expect(seen.has('c')).toBe(true);
    });

    test('weighted falls back to the first key when nothing has weight', () => {
        expect(createRng(1).weighted({ x: 0, y: 0 })).toBe('x');
    });

    test('date stays inside the range and tolerates reversed bounds', () => {
        const rng = createRng('d');
        for (let i = 0; i < 100; i++) {
            const d = rng.date('2010-03-01', '2010-03-31');
            expect(d >= '2010-03-01').toBe(true);
            expect(d <= '2010-03-31').toBe(true);
        }
        const reversed = rng.date('2012-12-31', '2012-01-01');
        expect(reversed >= '2012-01-01' && reversed <= '2012-12-31').toBe(true);
    });

    test('shuffle keeps every element', () => {
        const rng = createRng('s');
        const out = rng.shuffle([1, 2, 3, 4, 5]);
        expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
    });
});

describe('seeds', () => {
    test('normalizeSeed hashes strings deterministically', () => {
        expect(normalizeSeed('abc')).toBe(normalizeSeed('abc'));
        expect(normalizeSeed('abc')).not.toBe(normalizeSeed('abd'));
        expect(normalizeSeed(12.9)).toBe(12);
    });

    test('an empty seed still produces a working rng', () => {
        const rng = createRng();
        expect(typeof rng.seed).toBe('number');
        expect(rng.int(1, 1)).toBe(1);
    });

    test('randomSeed is short and typeable', () => {
        expect(randomSeed()).toMatch(/^[a-z0-9]{1,6}$/);
    });
});
