/**
 * Seeded random numbers for the DevAdmin builders.
 *
 * Every generator in builders/ takes an rng so a dataset can be reproduced:
 * the same seed always yields the same inventories, items and records. That
 * is what makes a bug report like "seed k3f9a2, scenario textualDeep" enough
 * to rebuild the exact data that broke.
 *
 * mulberry32 - small, fast, good enough for test data. Not for anything
 * security-related.
 */

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/** Turn any seed (number, string, undefined) into an int32. */
export const normalizeSeed = (seed) => {
  if (seed === undefined || seed === null || seed === '') {
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) | 0;
  }
  if (typeof seed === 'number' && Number.isFinite(seed)) return seed | 0;
  const text = String(seed);
  let hash = FNV_OFFSET;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash | 0;
};

/** A short, human-typeable seed such as "k3f9a2". */
export const randomSeed = () => Math.random().toString(36).slice(2, 8);

const DAY_MS = 24 * 60 * 60 * 1000;

const toIso = (date) => date.toISOString().split('T')[0];

export const createRng = (seed) => {
  const initial = normalizeSeed(seed);
  let state = initial;

  const float = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min, max) => Math.floor(float() * (max - min + 1)) + min;

  const pick = (arr) => {
    if (!arr || arr.length === 0) return undefined;
    return arr[Math.floor(float() * arr.length)];
  };

  const chance = (probability) => float() < probability;

  const shuffle = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(float() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  /**
   * Pick a key from `{ key: weight }`. Zero-weight keys are never chosen;
   * with no positive weight at all the first key wins.
   */
  const weighted = (weights) => {
    const entries = Object.entries(weights).filter(([, w]) => w > 0);
    if (entries.length === 0) return Object.keys(weights)[0];
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let roll = float() * total;
    for (const [key, weight] of entries) {
      roll -= weight;
      if (roll < 0) return key;
    }
    return entries[entries.length - 1][0];
  };

  /** ISO date between two ISO dates, inclusive. Swaps them if reversed. */
  const date = (startIso, endIso) => {
    let start = new Date(startIso);
    let end = new Date(endIso);
    if (Number.isNaN(start.getTime())) start = new Date('2000-01-01');
    if (Number.isNaN(end.getTime())) end = new Date('2020-12-31');
    if (start > end) [start, end] = [end, start];
    const days = Math.floor((end.getTime() - start.getTime()) / DAY_MS);
    return toIso(new Date(start.getTime() + int(0, days) * DAY_MS));
  };

  const token = (length = 6) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < length; i++) out += alphabet[int(0, alphabet.length - 1)];
    return out;
  };

  return { seed: initial, float, int, pick, chance, shuffle, weighted, date, token };
};

export default createRng;
