/**
 * Centralized Icon Constants
 * All Font Awesome icons used across the app, organized by category.
 * Change icons here to update them everywhere.
 *
 * All values are FA class suffixes (without "fas " prefix).
 * Usage: <i className={`fas ${ICONS.CONTENT_TYPE.PHOTO}`}></i>
 */

// === DOCUMENT FORMAT (Physical vs Electronic) ===
export const FORMAT_ICONS = {
  PHYSICAL: 'fa-box',
  ELECTRONIC: 'fa-hdd',
};

// === CONTENT TYPE (What kind of content) ===
export const CONTENT_TYPE_ICONS = {
  TEXTUAL: 'fa-file-alt',
  PHOTO: 'fa-image',
  VIDEO: 'fa-video',
  AUDIO: 'fa-music',
  MIXED: 'fa-layer-group',
};

// === COMBINED: Format + Content Type (for tree nodes, item views) ===
// These are the "entity" icons shown next to inventories/items
export const ENTITY_ICONS = {
  ELECTRONIC_TEXTUAL: 'fa-laptop-file',
  PHYSICAL_TEXTUAL: 'fa-archive',
  PHOTO: 'fa-image',
  VIDEO: 'fa-video',
  AUDIO: 'fa-music',
};

// === HIERARCHY LEVELS (Navigation & structure) ===
export const HIERARCHY_ICONS = {
  PROJECT: 'fa-folder-open',
  INVENTORY: 'fa-clipboard-list',
  ITEM: 'fa-folder',
  RECORD: 'fa-file-invoice',
  FILE: 'fa-file',
};

// === UPLOAD / DROPZONE ICONS (per media type) ===
export const UPLOAD_ICONS = {
  PHOTO: 'fa-camera',
  VIDEO: 'fa-video',
  AUDIO: 'fa-microphone',
  DEFAULT: 'fa-cloud-upload-alt',
};

// === STATS / COUNTS ===
export const STATS_ICONS = {
  ITEMS: 'fa-box',
  RECORDS: 'fa-database',
  FILES: 'fa-file',
  FILE_SIZE: 'fa-hdd',
  IMPORTED_INVENTORY: 'fa-file-import',
  CREATED_INVENTORY: 'fa-file-medical',
  PHYSICAL_ITEMS: 'fa-box',
  ELECTRONIC_ITEMS: 'fa-laptop-file',
};

// === PROGRESS INDICATORS (SmartGuideCard) ===
export const PROGRESS_ICONS = {
  ITEMS: 'fa-box',
  RECORDS: 'fa-file-alt',
  FILES: 'fa-paperclip',
};

/**
 * Helper: Get entity icon for an inventory based on its type and electronic flag.
 * Use this anywhere you need to display the correct icon for an inventory or item.
 *
 * @param {string} inventoryType - 'Tekstuāls', 'Foto', 'Video', 'Skaņas'
 * @param {boolean} isElectronic - true for electronic, false for physical
 * @returns {string} FA icon class suffix (e.g. 'fa-laptop-file')
 */
export const getEntityIcon = (inventoryType, isElectronic) => {
  switch (inventoryType) {
    case 'Foto':
      return ENTITY_ICONS.PHOTO;
    case 'Video':
      return ENTITY_ICONS.VIDEO;
    case 'Skaņas':
      return ENTITY_ICONS.AUDIO;
    case 'Tekstuāls':
      return isElectronic ? ENTITY_ICONS.ELECTRONIC_TEXTUAL : ENTITY_ICONS.PHYSICAL_TEXTUAL;
    default:
      return CONTENT_TYPE_ICONS.TEXTUAL;
  }
};

/**
 * Helper: Get upload/dropzone icon for a media type.
 *
 * @param {string} inventoryType - 'Foto', 'Video', 'Skaņas', etc.
 * @returns {string} FA icon class suffix
 */
export const getUploadIcon = (inventoryType) => {
  switch (inventoryType) {
    case 'Foto':
      return UPLOAD_ICONS.PHOTO;
    case 'Video':
      return UPLOAD_ICONS.VIDEO;
    case 'Skaņas':
      return UPLOAD_ICONS.AUDIO;
    default:
      return UPLOAD_ICONS.DEFAULT;
  }
};
