/**
 * Item (glabājamā vienība) payload builder.
 *
 * Produces `POST /project/<id>/item/?inventory_id=` bodies that satisfy BOTH
 * validators: the frontend one (validateItemCreate - which also insists on
 * unit_of_measure and date_indicator) and the backend one (item_validators:
 * dates inside the inventory period, language unless Foto, annotation for
 * media, restriction_note when restricted).
 *
 * The backend numbers items itself (Item.add_item: last_gv + 1) and its POST
 * response carries `number` but not `id` - see devDataFactory.resolveItemIds.
 */

import { validateItemCreate } from '../../Constants/itemConstants';
import { createRng } from './rng';
import { isMediaType } from './inventoryBuilder';

export const LANGUAGES = ['latviešu', 'krievu', 'angļu', 'vācu', 'franču'];
export const RESTRICTIONS = ['Vispārēja', 'Ierobežota', 'Sensitīvi dati'];
export const SECURITY_LEVELS = ['Publisks', 'Iekšējs', 'Konfidenciāls', 'Slepens', 'Sevišķi slepens'];
export const DATE_INDICATORS = ['year', 'month', 'day'];
export const UNITS_OF_MEASURE = ['Lapas', 'Dokumenti', 'Glabājamās vienības'];

const TITLE_POOL = {
  'Tekstuāls': ['Korespondence', 'Rīkojumi', 'Protokoli', 'Līgumi', 'Atskaites', 'Akti', 'Pārskati',
    'Instrukcijas', 'Nolikumi', 'Lēmumi', 'Pavadvēstules', 'Ziņojumi', 'Reģistri'],
  'Foto': ['Arhīva fotogrāfija', 'Pasākuma foto', 'Objekta foto', 'Personas fotoattēls', 'Biroja telpu foto'],
  'Video': ['Konferences ieraksts', 'Intervija', 'Prezentācija', 'Sanāksmes video', 'Dokumentālais video'],
  'Skaņas': ['Audio intervija', 'Konferences audio', 'Radio intervija', 'Telefona saruna', 'Diktofona ieraksts'],
};

const NOTES = ['Pārbaudīts pēc reģistra', 'Daļēji bojāts iesējums', 'Nav paraksta uz pēdējās lapas',
  'Sk. arī saistītās vienības', 'Lapas nav numurētas'];
const RESTRICTION_NOTES = ['Satur personas datus', 'Ierobežots līdz 2045. gadam', 'Komercnoslēpums',
  'Pieejams tikai ar atļauju'];
const SECURITY_NOTES = ['Klasificēts pēc iestādes rīkojuma', 'Pārskatīt pēc 10 gadiem', 'Pieeja tikai vadībai'];
const SISTEMATISATION = ['Hronoloģiski', 'Alfabētiski pēc korespondenta', 'Pēc lietu nomenklatūras', 'Tematiski'];
const COPIES = ['Oriģināls', 'Kopija', 'Oriģināls, 1 kopija', 'Apliecināta kopija'];
const HISTORY = ['Saņemts no iestādes arhīva 2019. gadā', 'Pārvietots no struktūrvienības',
  'Iekļauts fondā pēc reorganizācijas', 'Nodots no likvidētās iestādes'];

export const ITEM_PRESETS = {
  minimal: {
    label: 'Minimāls',
    description: 'Tikai obligātie lauki; Foto - bez valodas (atļauts).',
  },
  full: {
    label: 'Pilns',
    description: 'Visi lauki aizpildīti: piezīmes, sistematizācija, kopija, arhīva vēsture.',
  },
  restricted: {
    label: 'Ierobežota pieeja',
    description: 'restriction "Ierobežota" vai "Sensitīvi dati" + obligātā piezīme.',
  },
  classified: {
    label: 'Klasificēts',
    description: 'security_level augstāks par "Publisks" + piezīme.',
  },
  multiLanguage: {
    label: 'Vairākas valodas',
    description: 'language "latviešu, krievu" (komatu saraksts, kā formā).',
  },
  yearPrecision: { label: 'Gada precizitāte', description: 'date_indicator "year": 01-01 līdz 12-31.' },
  monthPrecision: { label: 'Mēneša precizitāte', description: 'date_indicator "month": mēneša 1. līdz pēdējā diena.' },
  dayPrecision: { label: 'Dienas precizitāte', description: 'date_indicator "day": brīvi datumi.' },
  invalidSeriesCode: {
    label: 'Nederīgs sērijas kods (400)',
    description: 'series_code "01.x" - regulārā izteiksme to noraida.',
    negative: true,
  },
  datesOutsideInventory: {
    label: 'Datumi ārpus US (400)',
    description: 'end_date pēc uzskaites saraksta beigu datuma.',
    negative: true,
  },
  missingAnnotation: {
    label: 'Bez satura mediju US (400)',
    description: 'Mediju tipam annotation ir obligāts - tukšs.',
    negative: true,
  },
};

/** Default preset mix for itemPlan - weights, not percentages. */
export const DEFAULT_ITEM_MIX = { minimal: 5, full: 3, restricted: 1, classified: 1 };

/** Series codes like "3.12" or "3.12.7" (backend REGEX_SERIES_CODE). */
export const seriesCode = (rng) => {
  const parts = [rng.int(1, 20), rng.int(1, 99)];
  if (rng.chance(0.5)) parts.push(rng.int(1, 99));
  return parts.join('.');
};

const lastDayOfMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();
const pad = (n) => String(n).padStart(2, '0');

const clampIso = (iso, min, max) => (iso < min ? min : iso > max ? max : iso);

/**
 * Two dates inside the inventory period, aligned to the precision the
 * date_indicator promises: whole years, whole months or exact days.
 */
const itemDates = (inventory, indicator, rng) => {
  const invStart = inventory.start_date || '2000-01-01';
  const invEnd = inventory.end_date || '2020-12-31';
  let a = rng.date(invStart, invEnd);
  let b = rng.date(invStart, invEnd);
  if (a > b) [a, b] = [b, a];

  if (indicator === 'year') {
    a = `${a.slice(0, 4)}-01-01`;
    b = `${b.slice(0, 4)}-12-31`;
  } else if (indicator === 'month') {
    const [by, bm] = b.split('-').map(Number);
    a = `${a.slice(0, 7)}-01`;
    b = `${b.slice(0, 7)}-${pad(lastDayOfMonth(by, bm))}`;
  }
  // Alignment can push past the inventory bounds (a report inventory may end
  // mid-year); the backend rejects that, so clamp.
  return [clampIso(a, invStart, invEnd), clampIso(b, invStart, invEnd)];
};

/**
 * Build one item payload for `inventory` ({ type, start_date, end_date }).
 *
 * @param {object} opts  preset, sequence (title suffix), language, restriction,
 *                       securityLevel, dateIndicator, relatedItemIds, unitOfMeasure
 */
export const buildItem = (inventory, opts = {}, rng = createRng()) => {
  const preset = opts.preset && ITEM_PRESETS[opts.preset] ? opts.preset : 'minimal';
  const type = inventory?.type || 'Tekstuāls';
  const media = isMediaType(type);
  const full = preset === 'full';

  let indicator = opts.dateIndicator;
  if (!indicator) {
    if (preset === 'yearPrecision') indicator = 'year';
    else if (preset === 'monthPrecision') indicator = 'month';
    else if (preset === 'dayPrecision') indicator = 'day';
    else indicator = rng.pick(DATE_INDICATORS);
  }
  const [start, end] = itemDates(inventory || {}, indicator, rng);

  let language = opts.language;
  if (language === undefined) {
    if (preset === 'multiLanguage') language = `${LANGUAGES[0]}, ${rng.pick(LANGUAGES.slice(1))}`;
    else if (type === 'Foto' && preset === 'minimal') language = '';
    else language = rng.pick(LANGUAGES);
  }

  let restriction = opts.restriction || 'Vispārēja';
  if (preset === 'restricted' && !opts.restriction) restriction = rng.pick(RESTRICTIONS.slice(1));

  let securityLevel = opts.securityLevel || 'Publisks';
  if (preset === 'classified' && !opts.securityLevel) securityLevel = rng.pick(SECURITY_LEVELS.slice(1));

  const sequence = opts.sequence !== undefined ? opts.sequence : rng.int(1, 999);
  const pool = TITLE_POOL[type] || TITLE_POOL['Tekstuāls'];

  const payload = {
    series_code: seriesCode(rng),
    title: `${rng.pick(pool)} ${start.slice(0, 4)} nr. ${sequence}`,
    start_date: start,
    end_date: end,
    date_indicator: indicator,
    date_note: full ? 'Datums precizēts pēc reģistra' : '',
    size: rng.int(1, 300),
    unit_of_measure: opts.unitOfMeasure || (full ? rng.pick(UNITS_OF_MEASURE) : 'Lapas'),
    notes: full ? rng.pick(NOTES) : '',
    annotation: media || full ? `${type} saturs: ${rng.pick(pool).toLowerCase()}, vienība ${sequence}` : '',
    sistematisation: full ? rng.pick(SISTEMATISATION) : '',
    language,
    restriction,
    restriction_note: restriction !== 'Vispārēja' ? rng.pick(RESTRICTION_NOTES) : '',
    security_level: securityLevel,
    security_level_note: securityLevel !== 'Publisks' ? rng.pick(SECURITY_NOTES) : '',
    copy: full ? rng.pick(COPIES) : '',
    archival_history: full ? rng.pick(HISTORY) : '',
    related_item_list: opts.relatedItemIds || [],
  };

  if (preset === 'invalidSeriesCode') payload.series_code = '01.x';
  if (preset === 'datesOutsideInventory') {
    const invEndYear = parseInt((inventory?.end_date || '2020').slice(0, 4), 10);
    payload.end_date = `${invEndYear + 2}-06-30`;
  }
  if (preset === 'missingAnnotation') payload.annotation = '';

  return payload;
};

/**
 * `count` item payloads for one inventory.
 *
 * @param {object} opts  everything buildItem takes, plus:
 *   mix            { preset: weight } - ignored when `preset` is given
 *   startSequence  first title sequence number (default 1)
 */
export const itemPlan = (inventory, count, opts = {}, rng = createRng()) => {
  const payloads = [];
  const total = Math.max(0, count | 0);
  const startSequence = opts.startSequence || 1;
  const mix = opts.mix || DEFAULT_ITEM_MIX;

  for (let i = 0; i < total; i++) {
    const preset = opts.preset || rng.weighted(mix);
    payloads.push(buildItem(inventory, { ...opts, preset, sequence: startSequence + i }, rng));
  }
  return payloads;
};

export const validateItemPayload = (payload, inventory) => validateItemCreate(payload, inventory);

export const describeItem = (payload) => {
  if (!payload) return '';
  const parts = [
    payload.series_code,
    payload.title,
    `${payload.start_date} - ${payload.end_date} (${payload.date_indicator})`,
  ];
  if (payload.restriction && payload.restriction !== 'Vispārēja') parts.push(payload.restriction);
  if (payload.security_level && payload.security_level !== 'Publisks') parts.push(payload.security_level);
  if (payload.language) parts.push(payload.language);
  return parts.join(' | ');
};
