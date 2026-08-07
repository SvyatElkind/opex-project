/**
 * devDataFactory — shared entity builders for the DevAdmin tools.
 *
 * Why this exists: QuickCreate and QuickActions each grew their own copy of
 * "make an inventory / item / record / file / metadata", with slightly
 * different payloads and a full `GET /project/{id}/` after every single
 * entity to recover the id of the thing just created. Filling a project that
 * way costs hundreds of requests and takes minutes.
 *
 * Everything here instead uses the id returned by the POST itself, so
 * creating N entities costs N requests. The caller invalidates React Query
 * once at the end rather than after every step.
 *
 * Dev-only: this module is imported exclusively by DevAdmin/, which is
 * stripped from `npm run build`.
 */

import { post, del, apiRequest, postFormData } from '../services/apiClient';
import {
  pick, randInt, pad, randomPerson, generateSeriesCode,
  buildVisa, buildAddressee, buildAction, buildReadStatus,
  LANGUAGES,
} from './testDataUtils';

// ─── Vocabulary ─────────────────────────────────────────────────────────────

export const INVENTORY_TYPES = ['Tekstuāls', 'Foto', 'Video', 'Skaņas'];
export const STORAGE_TERMS = ['Pastāvīgi glabājamās lietas', 'Ilgstoši glabājamās lietas'];
export const METADATA_CLASSES = ['visa', 'addressee', 'action', 'read_status'];

const TITLES = [
  'Korespondence', 'Rīkojumi', 'Protokoli', 'Līgumi', 'Atskaites',
  'Akti', 'Pārskati', 'Instrukcijas', 'Nolikumi', 'Lēmumi',
  'Pavadvēstules', 'Ziņojumi', 'Pieprasījumi', 'Atbildes', 'Reģistri',
];

/** Project names are validated as /^[A-Za-z0-9_-]+$/, max 20 chars. */
export const randomProjectName = (prefix = 'test') =>
  `${prefix}_${Date.now().toString(36)}_${randInt(100, 999)}`.slice(0, 20);

// ─── Project root folder ────────────────────────────────────────────────────
//
// Creating a project needs BOTH `name` and `folder`. `folder` is a root
// directory that must already exist on this machine — the backend does
// `os.path.isdir(root)` and then creates `root/<name>` (project/models.py
// add_project). There is no sensible universal default, so the root is
// resolved in this order:
//   1. an explicit override the user typed into DevAdmin (kept in localStorage)
//   2. the parent directory of an existing project's folder — guaranteed to
//      exist, since the backend already created a project inside it
//   3. nothing, and the caller reports that a root folder must be set

const ROOT_FOLDER_KEY = 'devadmin_project_root';

export const getStoredProjectRoot = () => {
  try {
    return localStorage.getItem(ROOT_FOLDER_KEY) || '';
  } catch {
    return '';
  }
};

export const setStoredProjectRoot = (path) => {
  try {
    if (path) localStorage.setItem(ROOT_FOLDER_KEY, path);
    else localStorage.removeItem(ROOT_FOLDER_KEY);
  } catch { /* storage unavailable — the override just won't persist */ }
};

/** Strip the last segment of a Windows or POSIX path. */
export const parentPath = (fullPath) => {
  if (!fullPath) return '';
  const normalised = String(fullPath).replace(/[\\/]+$/, '');
  const cut = Math.max(normalised.lastIndexOf('\\'), normalised.lastIndexOf('/'));
  return cut > 0 ? normalised.slice(0, cut) : '';
};

/**
 * Best known-good root folder for new projects.
 * @param {Array} projects - optional already-fetched project list
 * @returns {Promise<string>} root path, or '' when none could be determined
 */
export const resolveProjectRoot = async (projects = null) => {
  const stored = getStoredProjectRoot();
  if (stored) return stored;

  const list = projects || await listProjects().catch(() => []);
  for (const p of list) {
    const root = parentPath(p?.folder);
    if (root) return root;
  }
  return '';
};

/**
 * Turn an ApiError into something a developer can act on. The default message
 * for a 400 is just "Lūdzu izlabojiet kļūdas formas laukos", which hides which
 * field the backend actually rejected.
 */
export const describeApiError = (error) => {
  const fields = error?.fieldErrors;
  if (fields && typeof fields === 'object') {
    const parts = Object.entries(fields)
      .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
      .filter(Boolean);
    if (parts.length) return parts.join(' | ');
  }
  if (error?.data && typeof error.data === 'object') {
    const parts = Object.entries(error.data)
      .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
      .filter(Boolean);
    if (parts.length) return parts.join(' | ');
  }
  return error?.message || 'Nezināma kļūda';
};

// ─── Payload builders ───────────────────────────────────────────────────────

export const buildInventoryData = (number, opts = {}) => {
  const type = opts.type || pick(INVENTORY_TYPES);
  const startYear = randInt(2015, 2022);
  const endYear = startYear + randInt(1, 5);
  return {
    number,
    type,
    // Explicitly overridable: the old QuickCreate hardcoded `true`, which made
    // the two physical categories (DOCUMENTS, MEDIA) impossible to generate.
    electronic: opts.electronic !== undefined ? opts.electronic : true,
    storage_term: opts.storageTerm || pick(STORAGE_TERMS),
    start_date: `${startYear}-01-01`,
    end_date: `${endYear}-12-31`,
  };
};

export const buildItemData = (inventory, itemNumber) => {
  const startYear = parseInt(inventory.start_date, 10) || 2020;
  const endYear = parseInt(inventory.end_date, 10) || startYear + 3;
  const data = {
    series_code: generateSeriesCode(),
    title: `${pick(TITLES)} ${randInt(startYear, endYear)}`,
    start_date: `${startYear}-01-01`,
    end_date: `${endYear}-12-31`,
    date_indicator: 'year',
    language: pick(LANGUAGES),
    restriction: 'Vispārēja',
    security_level: 'Publisks',
  };
  if (['Foto', 'Video', 'Skaņas'].includes(inventory.type)) {
    data.annotation = `Testēšanas ${inventory.type.toLowerCase()} saturs nr. ${itemNumber}`;
  }
  return data;
};

export const buildRecordData = () => {
  const date = `${randInt(2020, 2025)}-${pad(randInt(1, 12))}-${pad(randInt(1, 28))}`;
  return {
    title: `${pick(TITLES)} — ${randomPerson()}`,
    date,
    created_date: date,
    sent_date: date,
    reg_nr: `${randInt(1, 999)}-${randInt(1, 99)}/${randInt(2020, 2025)}`,
    nomenclature_nr: `${randInt(1, 50)}-${randInt(1, 20)}`,
    language: pick(LANGUAGES),
    access_restriction: 'open',
  };
};

const METADATA_BUILDERS = {
  visa: (date) => buildVisa(date),
  addressee: () => buildAddressee(),
  action: (date) => buildAction(date),
  read_status: (date) => buildReadStatus(date),
};

// ─── Test files ─────────────────────────────────────────────────────────────

const MIME_MAP = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.bmp': 'image/bmp',
  '.mp4': 'video/mp4', '.avi': 'video/avi', '.mov': 'video/quicktime', '.mkv': 'video/x-matroska',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.aac': 'audio/aac', '.ogg': 'audio/ogg',
  '.flac': 'audio/flac', '.m4a': 'audio/m4a',
  '.txt': 'text/plain', '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.edoc': 'application/octet-stream',
};

const EXTENSIONS_BY_TYPE = {
  'Foto': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
  'Video': ['.mp4', '.avi', '.mov', '.mkv'],
  'Skaņas': ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a'],
  'Tekstuāls': ['.txt', '.pdf', '.docx', '.edoc'],
};

let manifestCache = null;

export const loadManifest = async (force = false) => {
  if (manifestCache && !force) return manifestCache;
  try {
    const resp = await fetch('/files/manifest.json');
    if (resp.ok) {
      const data = await resp.json();
      manifestCache = data.files || [];
      return manifestCache;
    }
  } catch { /* no manifest — dummy files are used instead */ }
  manifestCache = [];
  return manifestCache;
};

const extensionOf = (filename) => {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
};

const buildDummyFile = (inventoryType) => {
  switch (inventoryType) {
    case 'Foto': {
      // Smallest valid 1x1 PNG — real image bytes so the backend can probe it.
      const png = new Uint8Array([
        137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
        0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222, 0,
        0, 0, 12, 73, 68, 65, 84, 8, 215, 99, 248, 207, 192, 0, 0, 0,
        3, 0, 1, 24, 216, 95, 168, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
      ]);
      return new File([png], `dummy_${Date.now()}.png`, { type: 'image/png' });
    }
    case 'Video':
      return new File([new Uint8Array(100)], `dummy_${Date.now()}.mp4`, { type: 'video/mp4' });
    case 'Skaņas':
      return new File([new Uint8Array(100)], `dummy_${Date.now()}.mp3`, { type: 'audio/mpeg' });
    default:
      return new File([`Test document ${Date.now()}`], `dummy_${Date.now()}.txt`, { type: 'text/plain' });
  }
};

/** A real fixture from public/files/ when one matches the type, else a dummy. */
export const getTestFile = async (inventoryType) => {
  const manifest = await loadManifest();
  const valid = EXTENSIONS_BY_TYPE[inventoryType] || EXTENSIONS_BY_TYPE['Tekstuāls'];
  const matching = manifest.filter(f => valid.includes(extensionOf(f)));

  if (matching.length > 0) {
    const name = pick(matching);
    try {
      const resp = await fetch(`/files/${encodeURIComponent(name)}`);
      if (resp.ok) {
        const blob = await resp.blob();
        return new File([blob], name, {
          type: MIME_MAP[extensionOf(name)] || 'application/octet-stream',
        });
      }
    } catch { /* fall through to dummy */ }
  }
  return buildDummyFile(inventoryType);
};

// ─── Creators — each returns the created entity (with its id) or throws ──────

/**
 * Create a project.
 *
 * `rootFolder` must be a directory that already exists on this machine; the
 * backend creates `<rootFolder>/<name>` inside it. Passing only a name fails
 * with a field error, since `folder` is required and unique.
 */
export const createProject = async (name, rootFolder) => {
  if (!rootFolder) {
    throw new Error(
      'Nav norādīta projektu saknes mape. Ievadiet to Create cilnē (piem. C:\\Users\\Jūs\\Documents\\OPEX).'
    );
  }
  const { data } = await post('/project/', {
    name: name || randomProjectName(),
    folder: rootFolder,
  });
  return data;
};

export const createInventory = async (projectId, fondId, number, opts) => {
  const { data } = await post(
    `/project/${projectId}/inventory/?fond_id=${fondId}`,
    buildInventoryData(number, opts)
  );
  return data;
};

export const createItem = async (projectId, inventoryId, inventory, itemNumber) => {
  const { data } = await post(
    `/project/${projectId}/item/?inventory_id=${inventoryId}`,
    buildItemData(inventory, itemNumber)
  );
  return data;
};

/**
 * Create a record. For media inventories the upload IS the record, so this
 * posts a file; for textual ones it posts JSON.
 */
export const createRecord = async (projectId, itemId, inventory) => {
  if (inventory?.type && inventory.type !== 'Tekstuāls') {
    const file = await getTestFile(inventory.type);
    const formData = new FormData();
    formData.append('files', file);
    const { data } = await apiRequest(
      `/project/${projectId}/media_record/?item_id=${itemId}`,
      { method: 'POST', body: formData, headers: {} }
    );
    return data;
  }
  const { data } = await post(`/project/${projectId}/record/?item_id=${itemId}`, buildRecordData());
  return data;
};

export const uploadFile = async (projectId, recordId, inventoryType = 'Tekstuāls') => {
  const file = await getTestFile(inventoryType);
  const formData = new FormData();
  formData.append('files', file);
  const { data } = await postFormData(
    `/project/${projectId}/record/${recordId}/multiple_files/`,
    formData
  );
  return data;
};

export const addMetadata = async (projectId, recordId, metadataClass, date) => {
  const builder = METADATA_BUILDERS[metadataClass];
  if (!builder) throw new Error(`Nezināma metadatu klase: ${metadataClass}`);
  const { data } = await post(
    `/project/${projectId}/record/${recordId}/additional_metadata/?class=${metadataClass}`,
    builder(date || new Date().toISOString().split('T')[0])
  );
  return data;
};

/** One entry of every metadata class. Returns { created, failed }. */
export const addAllMetadata = async (projectId, recordId, date) => {
  let created = 0;
  let failed = 0;
  for (const cls of METADATA_CLASSES) {
    try {
      await addMetadata(projectId, recordId, cls, date);
      created++;
    } catch {
      failed++;
    }
  }
  return { created, failed };
};

// ─── Deleters ───────────────────────────────────────────────────────────────

export const deleteProject = (projectId) => del(`/project/${projectId}/`);
export const deleteInventory = (projectId, inventoryId) => del(`/project/${projectId}/inventory/${inventoryId}/`);
export const deleteItem = (projectId, itemId) => del(`/project/${projectId}/item/${itemId}/`);
export const deleteRecord = (projectId, recordId) => del(`/project/${projectId}/record/${recordId}/`);
export const deleteFile = (projectId, fileId) => del(`/project/${projectId}/file/${fileId}/`);

/**
 * Delete a media record (photo / video / audio).
 *
 * Different endpoint AND a required `type` query param. The value is the
 * inventory type string exactly as the backend spells it — 'Foto' | 'Skaņas' |
 * 'Video' (helpers/constants.py PHOTO/AUDIO/VIDEO, keyed into MEDIA_CLASS_MAP).
 * Note the docstring on Record_API.deleteMediaRecord says "[Foto, Video,
 * Audio]" — 'Audio' is NOT a valid value and resolves to no class.
 */
export const deleteMediaRecord = (projectId, recordId, mediaType) =>
  del(`/project/${projectId}/media_record/${recordId}/?type=${encodeURIComponent(mediaType)}`);

/** Delete a record entry from allRecordsOf(), picking the right endpoint. */
export const deleteAnyRecord = (projectId, entry) =>
  entry.isMedia
    ? deleteMediaRecord(projectId, entry.record.id, entry.mediaType)
    : deleteRecord(projectId, entry.record.id);

export const listProjects = async () => {
  const { data } = await apiRequest('/project/', { method: 'GET' });
  return Array.isArray(data) ? data : [];
};

export const fetchProject = async (projectId) => {
  const { data } = await apiRequest(`/project/${projectId}/`, { method: 'GET' });
  return data;
};

// ─── Traversal helpers ──────────────────────────────────────────────────────

export const inventoriesOf = (project) => project?.institution?.fond?.inventories || [];

/**
 * Media records are NOT in `item.records` — the backend nests them per type
 * (project/serializers.py ItemSerializer). Anything that walks a project has to
 * cover all four arrays or it silently ignores every photo/video/audio record.
 */
export const MEDIA_RECORD_KEYS = {
  'Foto': 'photo_records',
  'Video': 'video_records',
  'Skaņas': 'audio_records',
};

/**
 * Every record in a project, flattened and tagged with its parents.
 * `isMedia` / `mediaType` tell the caller which delete endpoint applies.
 */
export const allRecordsOf = (project) => {
  const out = [];
  inventoriesOf(project).forEach(inv => {
    (inv.items || []).forEach(item => {
      (item.records || []).forEach(rec => {
        out.push({ record: rec, item, inventory: inv, isMedia: false, mediaType: null });
      });
      // Media records live under a type-specific key. Walk every known key
      // rather than trusting inv.type, so a mistyped inventory still cleans up.
      Object.entries(MEDIA_RECORD_KEYS).forEach(([mediaType, key]) => {
        (item[key] || []).forEach(rec => {
          out.push({ record: rec, item, inventory: inv, isMedia: true, mediaType });
        });
      });
    });
  });
  return out;
};

/**
 * Every file in a project, flattened, each tagged with its record.
 * Covers media files too — the media serializers nest `files` the same way.
 */
export const allFilesOf = (project) => {
  const out = [];
  allRecordsOf(project).forEach(({ record, item, inventory, isMedia, mediaType }) => {
    (record.files || []).forEach(file => {
      out.push({ file, record, item, inventory, isMedia, mediaType });
    });
  });
  return out;
};

/**
 * Fill a whole project in one pass.
 *
 * `onProgress(message, type)` is called as work completes so the caller can
 * stream a log; `shouldStop()` is polled between entities so a run can be
 * cancelled without leaving a half-written request in flight.
 *
 * Returns a tally of what was actually created.
 */
export const fillProject = async (projectId, fondId, config, hooks = {}) => {
  const {
    inventoryCount = 2,
    itemsPerInventory = 3,
    recordsPerItem = 1,
    filesPerRecord = 1,
    withMetadata = true,
    electronic = true,
    types = null,             // null = spread across INVENTORY_TYPES
    startNumber = 1,
  } = config || {};

  const onProgress = hooks.onProgress || (() => {});
  const shouldStop = hooks.shouldStop || (() => false);

  const tally = { inventories: 0, items: 0, records: 0, files: 0, metadata: 0, errors: 0 };
  const typePool = types && types.length ? types : INVENTORY_TYPES;

  for (let i = 0; i < inventoryCount; i++) {
    if (shouldStop()) { onProgress('Apturēts', 'warning'); return tally; }

    const type = typePool[i % typePool.length];
    let inventory;
    try {
      inventory = await createInventory(projectId, fondId, startNumber + i, { type, electronic });
      tally.inventories++;
      onProgress(`US #${startNumber + i} (${type}${electronic ? ', elektronisks' : ', fizisks'}) izveidots`, 'success');
    } catch (e) {
      tally.errors++;
      onProgress(`Kļūda veidojot US: ${e.message}`, 'error');
      continue;
    }

    // The POST response may be thin; keep the payload we know is accurate.
    const invForItems = { ...inventory, type, start_date: inventory.start_date, end_date: inventory.end_date };

    for (let j = 0; j < itemsPerInventory; j++) {
      if (shouldStop()) { onProgress('Apturēts', 'warning'); return tally; }

      let item;
      try {
        item = await createItem(projectId, inventory.id, invForItems, j + 1);
        tally.items++;
      } catch (e) {
        tally.errors++;
        onProgress(`Kļūda veidojot GV: ${e.message}`, 'error');
        continue;
      }

      // Media inventories: one record per item, and the upload is the record.
      const recordTarget = type === 'Tekstuāls' ? recordsPerItem : 1;

      for (let k = 0; k < recordTarget; k++) {
        if (shouldStop()) { onProgress('Apturēts', 'warning'); return tally; }

        let record;
        try {
          record = await createRecord(projectId, item.id, invForItems);
          tally.records++;
          if (type !== 'Tekstuāls') tally.files++; // upload was the record
        } catch (e) {
          tally.errors++;
          onProgress(`Kļūda veidojot Dok.: ${e.message}`, 'error');
          continue;
        }

        if (!record?.id) continue;

        if (type === 'Tekstuāls') {
          for (let f = 0; f < filesPerRecord; f++) {
            try {
              await uploadFile(projectId, record.id, type);
              tally.files++;
            } catch (e) {
              tally.errors++;
              onProgress(`Kļūda augšupielādējot datni: ${e.message}`, 'error');
            }
          }
        }

        if (withMetadata) {
          const { created, failed } = await addAllMetadata(projectId, record.id, record.date);
          tally.metadata += created;
          tally.errors += failed;
        }
      }
      onProgress(`GV ${j + 1}/${itemsPerInventory} pabeigta (US #${startNumber + i})`, 'info');
    }
  }

  return tally;
};
