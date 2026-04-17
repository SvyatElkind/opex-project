/**
 * Fallback constants - used when API is unavailable
 * These values MUST match the backend constants exactly
 *
 * API Endpoint: GET /api/v1/values/
 */

// Inventory types - from helpers/constants.py VVAIS_TYPE_LIST
export const FALLBACK_INVENTORY_TYPE = [
  'Foto',
  'Skaņas',
  'Tekstuāls',
  'Video'
];

// Storage terms - from helpers/constants.py VVAIS_STORAGE_TERM_LIST
export const FALLBACK_STORAGE_TERM = [
  'Pastāvīgi glabājamās lietas',
  'Ilgstoši glabājamās lietas'
];

// Date indicators - from items/helpers/constants.py DATE_INDICATOR_VALUES
export const FALLBACK_DATE_INDICATOR = [
  'year',
  'month',
  'day'
];

// Units of measure - from items/helpers/constants.py UNIT_OF_MEASURE_VALUES
export const FALLBACK_UNIT_OF_MEASURE = [
  'Lapas',
  'Dokumenti',
  'Glabājamās vienības'
];

// Restriction values - from helpers/constants.py ITEM_RESTRICTION_LIST
export const FALLBACK_RESTRICTION = [
  'Vispārēja',
  'Ierobežota',
  'Sensitīvi dati'
];

// Security levels - from helpers/constants.py ITEM_SECURITY_LEVEL_LIST
export const FALLBACK_SECURITY_LEVEL = [
  'Publisks',
  'Iekšējs',
  'Konfidenciāls',
  'Slepens',
  'Sevišķi slepens'
];

// Access restriction - from records/helpers/constants.py RECORD_ACCESS_RESTRICTION_VALUES
export const FALLBACK_ACCESS_RESTRICTION = [
  'open',
  'closed'
];

// Matches API response format from GET /api/v1/values/
export const FALLBACK_CONSTANTS = {
  inventory: {
    type: FALLBACK_INVENTORY_TYPE,
    storage_term: FALLBACK_STORAGE_TERM
  },
  item: {
    date_indicator: FALLBACK_DATE_INDICATOR,
    unit_of_measure: FALLBACK_UNIT_OF_MEASURE,
    restriction: FALLBACK_RESTRICTION,
    security_level: FALLBACK_SECURITY_LEVEL
  },
  record: {
    access_restriction: FALLBACK_ACCESS_RESTRICTION
  }
};

// Used when creating new records
export const DEFAULT_VALUES = {
  // Item defaults
  date_indicator: 'day',
  unit_of_measure: 'Lapas',
  restriction: 'Vispārēja',
  security_level: 'Publisks',

  // Record defaults
  access_restriction: 'open',

  // Inventory defaults
  electronic: true,
  subfond: 0
};

// Types that require annotation field
export const REQUIRE_ANNOTATION_TYPES = ['Foto', 'Skaņas', 'Video'];

// Types that require duration field
export const REQUIRE_DURATION_TYPES = ['Skaņas', 'Video'];

// Types that require color field
export const REQUIRE_COLOR_TYPES = ['Foto', 'Video'];

// Types that require resolution field
export const REQUIRE_RESOLUTION_TYPES = ['Foto', 'Video'];

// Type that does NOT require language field
export const NOT_REQUIRE_LANGUAGE_TYPE = 'Foto';

// Media types (non-textual)
export const MEDIA_TYPES = ['Foto', 'Skaņas', 'Video'];

// Textual types
export const TEXTUAL_TYPES = ['Tekstuāls'];
