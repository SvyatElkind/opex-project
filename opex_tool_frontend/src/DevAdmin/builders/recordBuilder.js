/**
 * Record (dokuments) builders: textual record payloads, metadata sets and the
 * PUT bodies that enrich a media record after its file upload.
 *
 * Textual records go through getRecordCreatePayload so every CharField is ''
 * rather than null (the model is blank=True, null=False everywhere except
 * access_restriction_date) - the exact bug that used to 400 the create form.
 *
 * Media records are created by uploading a file (AddMediaRecordAPIView); the
 * backend probes the file for its technical fields. buildMediaRecordUpdate
 * gives a PUT body for when that probe left them empty.
 */

import { getRecordCreatePayload, validateTextRecordCreate } from '../../Constants/recordConstants';
import { createRng } from './rng';

export const ACCESS_RESTRICTIONS = ['open', 'closed'];
export const COLORS = ['melnbaltā', 'krāsainā'];
export const METADATA_CLASSES = ['visa', 'addressee', 'action', 'read_status'];

const FIRST_NAMES = ['Jānis', 'Andris', 'Mārtiņš', 'Pēteris', 'Kārlis', 'Anna', 'Ilze', 'Līga', 'Dace', 'Inga',
  'Zane', 'Māra', 'Edgars', 'Raivis', 'Aigars'];
const LAST_NAMES = ['Bērziņš', 'Kalniņš', 'Ozoliņš', 'Jansons', 'Liepiņš', 'Krūmiņš', 'Zariņš', 'Eglītis',
  'Vītols', 'Pētersons', 'Sproģe', 'Rudzīte'];
const TITLES = ['Vēstule', 'Rīkojums', 'Protokols', 'Līgums', 'Atskaite', 'Akts', 'Pārskats', 'Instrukcija',
  'Nolikums', 'Lēmums', 'Pavadvēstule', 'Ziņojums', 'Pieprasījums', 'Atbilde'];
const GROUPS = ['Ienākošie', 'Izejošie', 'Iekšējie', 'Rīkojumi'];
const KEY_WORDS = ['arhīvs', 'finanses', 'personāls', 'līgumi', 'projekts', 'iepirkums', 'sadarbība', 'atskaite'];
const NOTES = ['Saņemts pa pastu', 'Oriģināls nodots kancelejā', 'Pielikums 3 lapas', 'Parakstīts elektroniski'];
const TECH_INFO = ['PDF/A-1b', 'DOCX, 12 lpp.', 'Skenēts 300 dpi', 'eDoc konteiners'];
const RESTRICTION_NOTES = ['Personas dati', 'Komercnoslēpums', 'Iekšējai lietošanai'];
const USER_NOTES = ['Tikai vadībai', 'Pēc pieprasījuma', 'Ar atļauju'];
const VISA_NOTES = ['Saskaņots', 'Apstiprināts', 'Pārskatīts', 'Bez iebildumiem', 'Ar labojumiem'];
const READ_NOTES = ['Iepazinies', 'Izlasīts', 'Pieņemts zināšanai', 'Izpildei'];
const TASKS = ['Sagatavot atbildi', 'Pārskatīt dokumentu', 'Nosūtīt kopiju', 'Reģistrēt', 'Arhivēt',
  'Sagatavot atzinumu', 'Informēt vadību'];
const ADDRESSEES = ['Finanšu departaments', 'Juridiskā nodaļa', 'Personāla daļa', 'Kanceleja', 'IT departaments',
  'Grāmatvedība', 'Arhīva nodaļa'];
const LANGUAGES = ['latviešu', 'krievu', 'angļu', 'vācu'];

export const RECORD_PRESETS = {
  minimal: {
    label: 'Minimāls',
    description: 'Tikai obligātie lauki; pieejamība "open".',
  },
  full: {
    label: 'Pilns',
    description: 'Visi lauki: anotācija, atslēgvārdi, grupa, tehniskā informācija.',
  },
  closed: {
    label: 'Ierobežots ("closed")',
    description: 'access_restriction "closed" + ierobežojuma datums un piezīmes.',
  },
  multiLanguage: {
    label: 'Vairākas valodas',
    description: 'language "latviešu, angļu".',
  },
  dateOutsideItem: {
    label: 'Datums ārpus GV (400)',
    description: 'date pēc glabājamās vienības beigu datuma.',
    negative: true,
  },
  openWithDate: {
    label: '"open" ar datumu (400)',
    description: 'Ierobežojuma datums, lai gan pieejamība ir "open".',
    negative: true,
  },
  closedWithoutDate: {
    label: '"closed" bez datuma (400)',
    description: 'Pieejamība "closed", bet nav ierobežojuma datuma.',
    negative: true,
  },
};

export const DEFAULT_METADATA_COUNTS = { visa: 1, addressee: 1, action: 1, read_status: 1 };

export const person = (rng) => `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;

const addDays = (iso, days) => {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
};

const pad = (n) => String(n).padStart(2, '0');

/** "HH:MM:SS" - two-digit hours, which both duration regexes accept. */
export const duration = (rng) => `${pad(rng.int(0, 3))}:${pad(rng.int(0, 59))}:${pad(rng.int(0, 59))}`;

/**
 * Build one textual record payload for `item` ({ start_date, end_date }).
 *
 * @param {object} opts  preset, sequence, language, date, accessRestriction
 */
export const buildTextRecord = (item, opts = {}, rng = createRng()) => {
  const preset = opts.preset && RECORD_PRESETS[opts.preset] ? opts.preset : 'minimal';
  const full = preset === 'full';
  const itemStart = item?.start_date || '2000-01-01';
  const itemEnd = item?.end_date || '2020-12-31';
  const date = opts.date || rng.date(itemStart, itemEnd);
  const sequence = opts.sequence !== undefined ? opts.sequence : rng.int(1, 999);
  const year = date.slice(0, 4);

  let accessRestriction = opts.accessRestriction || 'open';
  if (preset === 'closed' || preset === 'closedWithoutDate') accessRestriction = 'closed';

  let language = opts.language;
  if (language === undefined) {
    language = preset === 'multiLanguage' ? `${LANGUAGES[0]}, ${LANGUAGES[2]}` : rng.pick(LANGUAGES);
  }

  const closed = accessRestriction === 'closed';

  const values = {
    title: `${rng.pick(TITLES)} nr. ${sequence} (${year})`,
    date,
    created_date: date,
    sent_date: preset === 'full' ? addDays(date, rng.int(0, 5)) : date,
    language,
    annotation: full ? `Dokuments par ${rng.pick(KEY_WORDS)} jautājumiem, ${year}. gads.` : '',
    key_words: full ? rng.shuffle(KEY_WORDS).slice(0, 3).join(', ') : '',
    reg_nr: `${rng.int(1, 999)}-${rng.int(1, 99)}/${year}`,
    sent_reg_nr: full ? `S-${rng.int(1, 999)}/${year}` : '',
    nomenclature_nr: `${rng.int(1, 50)}-${rng.int(1, 20)}`,
    group: full ? rng.pick(GROUPS) : '',
    notes: full ? rng.pick(NOTES) : '',
    access_restriction: accessRestriction,
    access_restriction_notes: closed ? rng.pick(RESTRICTION_NOTES) : '',
    access_restriction_date: closed ? addDays(date, 365 * rng.int(5, 30)) : null,
    user_restriction_notes: closed ? rng.pick(USER_NOTES) : '',
    tech_info: full ? rng.pick(TECH_INFO) : '',
  };

  if (preset === 'dateOutsideItem') {
    values.date = addDays(itemEnd, 30);
  }
  if (preset === 'openWithDate') {
    values.access_restriction = 'open';
    values.access_restriction_date = addDays(date, 365);
  }
  if (preset === 'closedWithoutDate') {
    values.access_restriction_date = null;
  }

  return getRecordCreatePayload(values);
};

/**
 * Metadata entries for one record, keyed by API class.
 *
 * @param {object} record  { date } - dates are derived from it
 * @param {object} counts  { visa, addressee, action, read_status }
 */
export const buildMetadataSet = (record, counts = DEFAULT_METADATA_COUNTS, rng = createRng()) => {
  const base = record?.date || '2020-01-01';
  const n = (key) => Math.max(0, (counts?.[key] ?? 0) | 0);
  const many = (count, make) => Array.from({ length: count }, make);

  return {
    visa: many(n('visa'), () => ({
      person: person(rng),
      date: addDays(base, rng.int(0, 10)),
      notes: rng.pick(VISA_NOTES),
    })),
    addressee: many(n('addressee'), () => ({
      addressee: rng.pick(ADDRESSEES),
    })),
    action: many(n('action'), () => ({
      author: person(rng),
      responsible_person: person(rng),
      task: rng.pick(TASKS),
      due_date: addDays(base, rng.int(1, 30)),
      created_date: base,
      notes: '',
    })),
    read_status: many(n('read_status'), () => ({
      person: person(rng),
      date: addDays(base, rng.int(0, 14)),
      notes: rng.pick(READ_NOTES),
    })),
  };
};

export const metadataTotal = (set) =>
  METADATA_CLASSES.reduce((sum, cls) => sum + (set?.[cls]?.length || 0), 0);

/**
 * PUT body for `/media_record/<id>/?type=<mediaType>`. Fields the serializer
 * marks required per type: Foto color + resolution, Video color + duration +
 * resolution, Skaņas duration.
 */
export const buildMediaRecordUpdate = (mediaType, opts = {}, rng = createRng()) => {
  const resolution = () => {
    const presets = [[1920, 1080], [3840, 2160], [1280, 720], [4000, 3000], [6000, 4000]];
    const [w, h] = rng.pick(presets);
    return { horizontal_resolution: w, vertical_resolution: h };
  };
  switch (mediaType) {
    case 'Foto':
      return { color: opts.color || rng.pick(COLORS), ...resolution() };
    case 'Video':
      return { color: opts.color || rng.pick(COLORS), duration: opts.duration || duration(rng), ...resolution() };
    case 'Skaņas':
      return { duration: opts.duration || duration(rng) };
    default:
      return null;
  }
};

/**
 * `count` textual record payloads for one item.
 *
 * @param {object} opts  everything buildTextRecord takes, plus mix { preset: weight }
 */
export const recordPlan = (item, count, opts = {}, rng = createRng()) => {
  const payloads = [];
  const total = Math.max(0, count | 0);
  const startSequence = opts.startSequence || 1;
  const mix = opts.mix || { minimal: 5, full: 3, closed: 2 };

  for (let i = 0; i < total; i++) {
    const preset = opts.preset || rng.weighted(mix);
    payloads.push(buildTextRecord(item, { ...opts, preset, sequence: startSequence + i }, rng));
  }
  return payloads;
};

export const validateTextRecordPayload = (payload, item) => validateTextRecordCreate(payload, item);

export const describeRecord = (payload) => {
  if (!payload) return '';
  const parts = [payload.reg_nr, payload.title, payload.date, payload.access_restriction];
  if (payload.access_restriction_date) parts.push(`līdz ${payload.access_restriction_date}`);
  if (payload.language) parts.push(payload.language);
  return parts.filter(Boolean).join(' | ');
};
