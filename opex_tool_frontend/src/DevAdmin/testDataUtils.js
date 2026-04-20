/**
 * Shared test data generators for DevAdmin components.
 *
 * Used by: QuickActions, TestDataGenerator, QuickCreate
 * Centralises Latvian names, metadata builders, series-code
 * generation, etc. so every population path produces the same
 * quality of fake data.
 */

// ─── Primitive helpers ──────────────────────────────────────────────────────

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pad = (n) => String(n).padStart(2, '0');

/** ISO date string between two Date objects. */
export const randomDate = (start, end) => {
  const ms = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(ms).toISOString().split('T')[0];
};

// ─── Latvian names ──────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Janis', 'Andris', 'Martins', 'Peteris', 'Karlis',
  'Anna', 'Ilze', 'Liga', 'Dace', 'Inga',
  'Zane', 'Mara', 'Edgars', 'Raivis', 'Aigars',
];

const LAST_NAMES = [
  'Berzins', 'Kalnins', 'Ozolins', 'Jansons', 'Liepins',
  'Krumins', 'Zarins', 'Eglitis', 'Vitols', 'Petersons',
  'Sproge', 'Rudzite',
];

export const randomPerson = () =>
  `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

// ─── Vocabulary pools ───────────────────────────────────────────────────────

export const ITEM_TYPE_NAMES = {
  'Foto': [
    'Arhiva fotografija', 'Dokumenta attels', 'Vesturiska fotokopija',
    'Darba grupa sanaksme', 'Konferences materiali', 'Projekta dokumentacija',
    'Biroja telpu foto', 'Pasakuma foto', 'Objekta foto', 'Personas fotoattels',
  ],
  'Video': [
    'Konferences ieraksts', 'Intervija', 'Prezentacija', 'Sanaksmes video',
    'Apmacibas materials', 'Projekta demonstracija', 'Pasakuma ieraksts',
    'Dokumentalais video', 'Vesturiskais ieraksts', 'Darba process',
  ],
  'Skanas': [
    'Audio intervija', 'Konferences audio', 'Sanaksmes ieraksts',
    'Prezentacijas audio', 'Apmacibas materials', 'Diktofona ieraksts',
    'Telefona saruna', 'Radio intervija', 'Zinojums', 'Instrukcija',
  ],
  'Tekstuals': [
    'Darba ligums', 'Vienosanas', 'Protokols', 'Atskaite', 'Plans',
    'Instrukcija', 'Noradijumi', 'Rikojums', 'Lemums', 'Apraksts',
    'Analize', 'Parskats', 'Dokumentacija', 'Specifikacija', 'Projekts',
  ],
};

export const randomItemName = (type) => {
  const pool = ITEM_TYPE_NAMES[type] || ITEM_TYPE_NAMES['Tekstuals'];
  return pick(pool);
};

export const VISA_NOTES = [
  'Saskanots', 'Apstiprinats', 'Parskatits', 'Izskatits',
  'Akceptets', 'Bez iebildumiem', 'Ar labojumiem', 'Parakstits',
];

export const READ_STATUS_NOTES = [
  'Iepazits', 'Izlasits', 'Pienemts zinasanai',
  'Atzimets', 'Parskatits', 'Izpildei',
];

export const ACTION_TASKS = [
  'Sagatavot atbildi', 'Parskatit dokumentu', 'Nosutit kopiju',
  'Registret', 'Arhivet', 'Iekl\u0101ut lieta',
  'Sagatavot atzinumu', 'Informet vadibu', 'Saskanot ar nodalu',
];

export const ADDRESSEE_NAMES = [
  'Finansu departaments', 'Juridiska nodala', 'Personala dala',
  'Kanceleja', 'IT departaments', 'Gramatvediba',
  'Vadibas sekretariats', 'Arhiva nodala',
  'Arlietu departaments', 'Projektu vadiba',
];

export const LANGUAGES = ['latviesu', 'krievu', 'anglu', 'vacu', 'francu'];

// ─── Series code generator ──────────────────────────────────────────────────

/** Produces codes like "3.12" or "3.12.7" matching the backend regex. */
export const generateSeriesCode = () => {
  const p1 = randInt(1, 20);
  const p2 = randInt(1, 99);
  if (Math.random() > 0.5) {
    return `${p1}.${p2}.${randInt(1, 99)}`;
  }
  return `${p1}.${p2}`;
};

// ─── Metadata generators ────────────────────────────────────────────────────

/** Build a single random visa payload. */
export const buildVisa = (date) => ({
  person: randomPerson(),
  date,
  notes: pick(VISA_NOTES),
});

/** Build a single random addressee payload. */
export const buildAddressee = () => ({
  addressee: pick(ADDRESSEE_NAMES),
});

/** Build a single random action payload. */
export const buildAction = (createdDate) => {
  const due = new Date(createdDate);
  due.setDate(due.getDate() + randInt(1, 30));
  return {
    author: randomPerson(),
    responsible_person: randomPerson(),
    task: pick(ACTION_TASKS),
    due_date: due.toISOString().split('T')[0],
    created_date: createdDate,
    notes: '',
  };
};

/** Build a single random read-status payload. */
export const buildReadStatus = (date) => ({
  person: randomPerson(),
  date,
  notes: pick(READ_STATUS_NOTES),
});

/**
 * Create random metadata for a record via the API.
 *
 * @param {Function} addMetadataFn  – (projectId, recordId, data, class) => [ok, result]
 * @param {string|number} projectId
 * @param {string|number} recordId
 * @param {string} recordDate       – ISO date string used as base date
 * @returns {{ created: {visas,addressees,actions,read_statuses}, failed: number }}
 */
export const generateMetadataForRecord = async (
  addMetadataFn,
  projectId,
  recordId,
  recordDate,
) => {
  const created = { visas: 0, addressees: 0, actions: 0, read_statuses: 0 };
  let failed = 0;

  const attempt = async (cls, payload, key) => {
    try {
      const [ok] = await addMetadataFn(projectId, recordId, payload, cls);
      if (ok) created[key]++;
      else failed++;
    } catch {
      failed++;
    }
  };

  // 0-3 visas
  const visaCount = randInt(0, 3);
  for (let i = 0; i < visaCount; i++) {
    await attempt('visa', buildVisa(recordDate), 'visas');
  }

  // 0-3 addressees
  const addrCount = randInt(0, 3);
  for (let i = 0; i < addrCount; i++) {
    await attempt('addressee', buildAddressee(), 'addressees');
  }

  // 0-2 actions
  const actCount = randInt(0, 2);
  for (let i = 0; i < actCount; i++) {
    await attempt('action', buildAction(recordDate), 'actions');
  }

  // 0-3 read statuses
  const rsCount = randInt(0, 3);
  for (let i = 0; i < rsCount; i++) {
    await attempt('read_status', buildReadStatus(recordDate), 'read_statuses');
  }

  return { created, failed };
};

/** Human-readable one-liner summary of created metadata counts. */
export const metadataSummary = (created) => {
  const { visas, addressees, actions, read_statuses } = created;
  return `${visas} vizas, ${addressees} adresati, ${actions} uzdevumi, ${read_statuses} iepazisanas`;
};

/** Sum all metadata counts. */
export const metadataTotal = (created) =>
  created.visas + created.addressees + created.actions + created.read_statuses;
