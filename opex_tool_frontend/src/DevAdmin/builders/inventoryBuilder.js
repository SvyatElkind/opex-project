/**
 * Inventory (uzskaites saraksts) payload builder.
 *
 * Produces `POST /project/<id>/inventory/?fond_id=` bodies. The backend assigns
 * `number` itself (Inventory.add_inventory: max(number)+1) but its serializer
 * still requires the field, so every payload carries one - the create form
 * sends `inventoryCount + 1` for the same reason.
 *
 * Presets are named data shapes a tester reaches for: "a one-year list",
 * "a physical one", "one the backend must reject". Negative presets are
 * flagged so the executor can expect a 400 instead of counting a failure.
 */

import { validateInventoryCreate } from '../../Constants/inventoryConstants';
import { createRng } from './rng';

export const INVENTORY_TYPES = ['Tekstuāls', 'Foto', 'Video', 'Skaņas'];
export const MEDIA_TYPES = ['Foto', 'Video', 'Skaņas'];
export const STORAGE_TERMS = ['Pastāvīgi glabājamās lietas', 'Ilgstoši glabājamās lietas'];

export const isMediaType = (type) => MEDIA_TYPES.includes(type);

export const INVENTORY_PRESETS = {
  random: {
    label: 'Nejaušs',
    description: 'Nejaušs tips, 1-5 gadu periods, nejaušs glabāšanas termiņš.',
  },
  sameYear: {
    label: 'Viens gads',
    description: 'Periods no 1. janvāra līdz 31. decembrim vienā gadā.',
  },
  longSpan: {
    label: 'Garš periods',
    description: '25-40 gadu periods - pārbauda datumu attēlošanu un GV izkliedi.',
  },
  withSubfond: {
    label: 'Ar subfondu',
    description: 'Subfonds 1-9; pārējais kā "Nejaušs".',
  },
  physical: {
    label: 'Fizisks',
    description: 'electronic: false - kategorijas DOCUMENTS / MEDIA, dokumentus nevar veidot.',
  },
  invalidDates: {
    label: 'Nederīgi datumi (400)',
    description: 'Sākuma datums pēc beigu datuma - serverim jāatbild 400.',
    negative: true,
  },
  missingType: {
    label: 'Bez tipa (400)',
    description: 'Tukšs tips - serverim jāatbild 400.',
    negative: true,
  },
};

export const INVENTORY_DISTRIBUTIONS = {
  even: { label: 'Visi tipi pēc kārtas' },
  textual: { label: 'Tikai Tekstuāls' },
  media: { label: 'Tikai mediji (Foto/Video/Skaņas)' },
  textualHeavy: { label: 'Pārsvarā Tekstuāls (3:1)' },
};

const yearRange = (preset, rng, opts) => {
  if (opts.startYear && opts.endYear) return [opts.startYear, opts.endYear];
  switch (preset) {
    case 'sameYear': {
      const y = rng.int(1995, 2022);
      return [y, y];
    }
    case 'longSpan': {
      const start = rng.int(1960, 1990);
      return [start, start + rng.int(25, 40)];
    }
    default: {
      const start = rng.int(1995, 2020);
      return [start, start + rng.int(1, 5)];
    }
  }
};

/**
 * Build one inventory payload.
 *
 * @param {object} opts   preset, type, electronic, storageTerm, subfond, startYear, endYear, number
 * @param {object} rng    from createRng(); a fresh unseeded one when omitted
 */
export const buildInventory = (opts = {}, rng = createRng()) => {
  const preset = opts.preset && INVENTORY_PRESETS[opts.preset] ? opts.preset : 'random';
  const [startYear, endYear] = yearRange(preset, rng, opts);

  const payload = {
    // Required by InventorySerializer ("This field is required." without it,
    // checked live 2026-09-15) even though Inventory.add_inventory overwrites
    // it with max(number)+1. Any positive integer passes; callers that know
    // the next number pass it for readable previews.
    number: opts.number !== undefined ? opts.number : 1,
    type: opts.type || rng.pick(INVENTORY_TYPES),
    electronic: opts.electronic !== undefined ? opts.electronic : preset !== 'physical',
    storage_term: opts.storageTerm || rng.pick(STORAGE_TERMS),
    start_date: `${startYear}-01-01`,
    end_date: `${endYear}-12-31`,
    subfond: opts.subfond !== undefined ? opts.subfond : (preset === 'withSubfond' ? rng.int(1, 9) : 0),
  };

  if (preset === 'invalidDates') {
    payload.start_date = `${endYear + 1}-01-01`;
  }
  if (preset === 'missingType') {
    payload.type = '';
  }

  return payload;
};

const typeForIndex = (distribution, index, rng) => {
  if (distribution && typeof distribution === 'object') return rng.weighted(distribution);
  switch (distribution) {
    case 'textual': return 'Tekstuāls';
    case 'media': return MEDIA_TYPES[index % MEDIA_TYPES.length];
    case 'textualHeavy':
      return index % 4 === 3 ? MEDIA_TYPES[Math.floor(index / 4) % MEDIA_TYPES.length] : 'Tekstuāls';
    case 'even':
    default:
      return INVENTORY_TYPES[index % INVENTORY_TYPES.length];
  }
};

/**
 * Several inventory payloads at once.
 *
 * @param {number} count
 * @param {object} opts  everything buildInventory takes, plus:
 *   distribution  'even' | 'textual' | 'media' | 'textualHeavy' | { type: weight }
 *   electronicMix 0..1 share of electronic inventories (default 1)
 *   startNumber   first `number` to stamp on the payloads (omitted when absent)
 */
export const inventoryPlan = (count, opts = {}, rng = createRng()) => {
  const payloads = [];
  const total = Math.max(0, count | 0);
  const electronicMix = opts.electronicMix === undefined ? 1 : opts.electronicMix;

  for (let i = 0; i < total; i++) {
    let electronic;
    if (opts.electronic !== undefined) electronic = opts.electronic;
    else if (electronicMix >= 1) electronic = true;
    else if (electronicMix <= 0) electronic = false;
    else electronic = rng.chance(electronicMix);

    payloads.push(buildInventory({
      ...opts,
      type: opts.type || typeForIndex(opts.distribution || 'even', i, rng),
      electronic,
      number: opts.startNumber !== undefined ? opts.startNumber + i : undefined,
    }, rng));
  }
  return payloads;
};

/**
 * Run the frontend create validation. The validator insists on `number`
 * even though the server assigns it, so a placeholder is supplied when the
 * payload has none.
 */
export const validateInventoryPayload = (payload) =>
  validateInventoryCreate({ number: 1, ...payload });

export const describeInventory = (payload) => {
  if (!payload) return '';
  const years = `${String(payload.start_date || '').slice(0, 4)}-${String(payload.end_date || '').slice(0, 4)}`;
  const term = payload.storage_term === STORAGE_TERMS[0] ? 'pastāvīgi' : 'ilgstoši';
  const parts = [payload.type || '(bez tipa)', payload.electronic ? 'el.' : 'fiz.', years, term];
  if (payload.subfond) parts.push(`subfonds ${payload.subfond}`);
  return parts.join(' | ');
};
