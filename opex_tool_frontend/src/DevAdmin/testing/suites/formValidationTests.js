/**
 * Form Validation Tests
 *
 * Comprehensive tests for ALL validation functions across the application:
 * - Record validation (text + media)
 * - Item validation (series code, dates, conditional fields)
 * - Inventory validation (number, type, storage term, dates)
 * - File upload validation (size, type, single/multiple constraints)
 * - Duration format validation
 * - Access restriction validation
 * - FileValidation soft warnings
 * - Metadata validation
 */

import {
  validateTitle as validateRecordTitle,
  validateLanguage as validateRecordLanguage,
  validateRegNr,
  validateNomenclatureNr,
  validateRecordDate,
  validateAccessRestriction,
  validateAccessRestrictionDate,
  validateDuration as validateRecordDuration,
  validateTextRecordCreate,
  validateMediaRecordCreate,
  getRemainingChars as getRecordRemainingChars,
  isAccessRestrictionDateRequired,
  getRecordTypeForItem,
  TITLE_MAX_LENGTH as RECORD_TITLE_MAX,
  DURATION_REGEX as RECORD_DURATION_REGEX,
  RECORD_ACCESS_RESTRICTION_VALUES,
  COLOR_MAX_LENGTH,
  DURATION_MAX_LENGTH,
  RESOLUTION_MAX_LENGTH
} from '../../../Constants/recordConstants';

import {
  validateSeriesCode,
  validateTitle as validateItemTitle,
  validateItemDateRange,
  validateLanguage as validateItemLanguage,
  validateAnnotation,
  validateRestrictionNote,
  validateDateIndicator,
  validateUnitOfMeasure,
  validateSecurityLevel,
  validateRestriction,
  validateRelatedItems,
  validateItemCreate,
  validateItemUpdate,
  getRemainingChars as getItemRemainingChars,
  isLanguageRequired,
  isAnnotationRequired,
  isRestrictionNoteRequired,
  SERIES_CODE_REGEX,
  SERIES_CODE_MAX_LENGTH,
  TITLE_MAX_LENGTH as ITEM_TITLE_MAX,
  DATE_INDICATOR_VALUES,
  UNIT_OF_MEASURE_VALUES,
  ITEM_RESTRICTION_LIST,
  ITEM_SECURITY_LEVEL_LIST,
  REQUIRE_ANNOTATION_TYPE,
  NOT_REQUIRE_LANGUAGE_TYPE
} from '../../../Constants/itemConstants';

import {
  validateNumber,
  validatePostfix,
  validateType,
  validateStorageTerm,
  validateDateRange,
  validateInventoryCreate,
  validateInventoryUpdate,
  canDeleteInventory,
  getDeleteRestrictionMessage,
  VVAIS_TYPE_LIST,
  VVAIS_STORAGE_TERM_LIST,
  INVENTORY_MIN_NUM,
  INVENTORY_MAX_NUM,
  POSTFIX_MAX_LENGTH
} from '../../../Constants/inventoryConstants';

import {
  validateFileUploads,
  validateMetadata,
  validateRecordData,
  validateRecordForm,
  validateDurationFormat,
  formatDuration,
  formatFileSize,
  isSingleFileType,
  getAllowedFileTypes,
  hasValidationErrors,
  getValidationErrorMessages,
  getAPITypeFromInventory,
  RECORD_VALIDATION
} from '../../../Utils/RecordValidation';

import {
  validateFileSize,
  validateDuration as validateFileDuration,
  validateImageDimensions,
  formatWarnings
} from '../../../Utils/FileValidation';


const formValidationTests = ({ describe, it, test, expect }) => {

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORD TITLE VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record > validateTitle', () => {
    it('valid title returns null', () => {
      expect(validateRecordTitle('Test Record')).toBeNull();
    });

    it('empty string returns error', () => {
      expect(validateRecordTitle('')).toBeTruthy();
    });

    it('null returns error', () => {
      expect(validateRecordTitle(null)).toBeTruthy();
    });

    it('undefined returns error', () => {
      expect(validateRecordTitle(undefined)).toBeTruthy();
    });

    it('whitespace-only returns error', () => {
      expect(validateRecordTitle('   ')).toBeTruthy();
    });

    it('title at max length is valid', () => {
      const title = 'A'.repeat(RECORD_TITLE_MAX);
      expect(validateRecordTitle(title)).toBeNull();
    });

    it('title exceeding max length returns error', () => {
      const title = 'A'.repeat(RECORD_TITLE_MAX + 1);
      expect(validateRecordTitle(title)).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORD LANGUAGE VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record > validateLanguage', () => {
    it('valid language returns null', () => {
      expect(validateRecordLanguage('latviešu')).toBeNull();
    });

    it('empty language returns error', () => {
      expect(validateRecordLanguage('')).toBeTruthy();
    });

    it('null returns error', () => {
      expect(validateRecordLanguage(null)).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRATION NUMBER VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record > validateRegNr', () => {
    it('valid reg_nr returns null', () => {
      expect(validateRegNr('REG-001')).toBeNull();
    });

    it('empty reg_nr returns error', () => {
      expect(validateRegNr('')).toBeTruthy();
    });

    it('too long reg_nr returns error', () => {
      expect(validateRegNr('A'.repeat(31))).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // NOMENCLATURE NUMBER VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record > validateNomenclatureNr', () => {
    it('valid nomenclature_nr returns null', () => {
      expect(validateNomenclatureNr('NOM-001')).toBeNull();
    });

    it('empty nomenclature_nr returns error', () => {
      expect(validateNomenclatureNr('')).toBeTruthy();
    });

    it('too long nomenclature_nr returns error', () => {
      expect(validateNomenclatureNr('A'.repeat(31))).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORD DATE VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record > validateRecordDate', () => {
    const item = { start_date: '2020-01-01', end_date: '2025-12-31' };

    it('valid date within range returns null', () => {
      expect(validateRecordDate('2023-06-15', item)).toBeNull();
    });

    it('null date returns error', () => {
      expect(validateRecordDate(null, item)).toBeTruthy();
    });

    it('empty date returns error', () => {
      expect(validateRecordDate('', item)).toBeTruthy();
    });

    it('date before item start returns error', () => {
      expect(validateRecordDate('2019-12-31', item)).toBeTruthy();
    });

    it('date after item end returns error', () => {
      expect(validateRecordDate('2026-01-01', item)).toBeTruthy();
    });

    it('date at item start boundary returns null', () => {
      expect(validateRecordDate('2020-01-01', item)).toBeNull();
    });

    it('date at item end boundary returns null', () => {
      expect(validateRecordDate('2025-12-31', item)).toBeNull();
    });

    it('date with no item returns null (no boundary check)', () => {
      expect(validateRecordDate('2023-06-15', null)).toBeNull();
    });

    it('date with item lacking dates returns null', () => {
      expect(validateRecordDate('2023-06-15', {})).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCESS RESTRICTION VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record > validateAccessRestriction', () => {
    it('open is valid', () => {
      expect(validateAccessRestriction('open')).toBeNull();
    });

    it('closed is valid', () => {
      expect(validateAccessRestriction('closed')).toBeNull();
    });

    it('invalid value returns error', () => {
      expect(validateAccessRestriction('unknown')).toBeTruthy();
    });

    it('null is valid (not required)', () => {
      expect(validateAccessRestriction(null)).toBeNull();
    });

    it('empty string is valid (not required)', () => {
      expect(validateAccessRestriction('')).toBeNull();
    });

    it('RECORD_ACCESS_RESTRICTION_VALUES has open and closed', () => {
      expect(RECORD_ACCESS_RESTRICTION_VALUES).toContain('open');
      expect(RECORD_ACCESS_RESTRICTION_VALUES).toContain('closed');
      expect(RECORD_ACCESS_RESTRICTION_VALUES).toHaveLength(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCESS RESTRICTION DATE VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record > validateAccessRestrictionDate', () => {
    it('closed without date returns error', () => {
      expect(validateAccessRestrictionDate(null, 'closed')).toBeTruthy();
    });

    it('closed with date returns null', () => {
      expect(validateAccessRestrictionDate('2030-01-01', 'closed')).toBeNull();
    });

    it('open with date returns error', () => {
      expect(validateAccessRestrictionDate('2030-01-01', 'open')).toBeTruthy();
    });

    it('open without date returns null', () => {
      expect(validateAccessRestrictionDate(null, 'open')).toBeNull();
    });

    it('isAccessRestrictionDateRequired: closed requires date', () => {
      expect(isAccessRestrictionDateRequired('closed')).toBe(true);
    });

    it('isAccessRestrictionDateRequired: open does not require date', () => {
      expect(isAccessRestrictionDateRequired('open')).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DURATION VALIDATION (Record Constants)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record > validateDuration', () => {
    it('valid HH:MM:SS returns null', () => {
      expect(validateRecordDuration('01:30:00')).toBeNull();
    });

    it('valid H:MM:SS returns null', () => {
      expect(validateRecordDuration('1:30:00')).toBeNull();
    });

    it('invalid format returns error', () => {
      expect(validateRecordDuration('abc')).toBeTruthy();
    });

    it('invalid minutes (60+) returns error', () => {
      expect(validateRecordDuration('01:60:00')).toBeTruthy();
    });

    it('invalid seconds (60+) returns error', () => {
      expect(validateRecordDuration('01:30:60')).toBeTruthy();
    });

    it('empty when required returns error', () => {
      expect(validateRecordDuration('', true)).toBeTruthy();
    });

    it('empty when not required returns null', () => {
      expect(validateRecordDuration('')).toBeNull();
    });

    it('null when not required returns null', () => {
      expect(validateRecordDuration(null)).toBeNull();
    });

    it('DURATION_REGEX matches valid formats', () => {
      expect(RECORD_DURATION_REGEX.test('01:30:00')).toBe(true);
      expect(RECORD_DURATION_REGEX.test('1:30:00')).toBe(true);
      expect(RECORD_DURATION_REGEX.test('99:59:59')).toBe(true);
    });

    it('DURATION_REGEX rejects invalid formats', () => {
      expect(RECORD_DURATION_REGEX.test('abc')).toBe(false);
      expect(RECORD_DURATION_REGEX.test('1:60:00')).toBe(false);
      expect(RECORD_DURATION_REGEX.test('')).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT RECORD CREATE VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record > validateTextRecordCreate', () => {
    const item = { start_date: '2020-01-01', end_date: '2025-12-31' };

    it('complete valid data returns isValid: true', () => {
      const data = {
        title: 'Test Record',
        language: 'latviešu',
        reg_nr: 'REG-001',
        nomenclature_nr: 'NOM-001',
        date: '2023-06-15',
        access_restriction: 'open'
      };
      const result = validateTextRecordCreate(data, item);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('empty data returns isValid: false with multiple errors', () => {
      const result = validateTextRecordCreate({}, item);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it('missing title returns title error', () => {
      const data = { language: 'lv', reg_nr: 'R1', nomenclature_nr: 'N1', date: '2023-06-15' };
      const result = validateTextRecordCreate(data, item);
      expect(result.errors).toHaveProperty('title');
    });

    it('missing language returns language error', () => {
      const data = { title: 'T', reg_nr: 'R1', nomenclature_nr: 'N1', date: '2023-06-15' };
      const result = validateTextRecordCreate(data, item);
      expect(result.errors).toHaveProperty('language');
    });

    it('missing reg_nr returns reg_nr error', () => {
      const data = { title: 'T', language: 'lv', nomenclature_nr: 'N1', date: '2023-06-15' };
      const result = validateTextRecordCreate(data, item);
      expect(result.errors).toHaveProperty('reg_nr');
    });

    it('missing nomenclature_nr returns nomenclature_nr error', () => {
      const data = { title: 'T', language: 'lv', reg_nr: 'R1', date: '2023-06-15' };
      const result = validateTextRecordCreate(data, item);
      expect(result.errors).toHaveProperty('nomenclature_nr');
    });

    it('missing date returns date error', () => {
      const data = { title: 'T', language: 'lv', reg_nr: 'R1', nomenclature_nr: 'N1' };
      const result = validateTextRecordCreate(data, item);
      expect(result.errors).toHaveProperty('date');
    });

    it('invalid access_restriction returns error', () => {
      const data = {
        title: 'T', language: 'lv', reg_nr: 'R', nomenclature_nr: 'N',
        date: '2023-06-15', access_restriction: 'invalid'
      };
      const result = validateTextRecordCreate(data, item);
      expect(result.errors).toHaveProperty('access_restriction');
    });

    it('closed restriction without date returns error', () => {
      const data = {
        title: 'T', language: 'lv', reg_nr: 'R', nomenclature_nr: 'N',
        date: '2023-06-15', access_restriction: 'closed'
      };
      const result = validateTextRecordCreate(data, item);
      expect(result.errors).toHaveProperty('access_restriction_date');
    });

    it('closed restriction with date passes', () => {
      const data = {
        title: 'T', language: 'lv', reg_nr: 'R', nomenclature_nr: 'N',
        date: '2023-06-15', access_restriction: 'closed',
        access_restriction_date: '2030-01-01'
      };
      const result = validateTextRecordCreate(data, item);
      expect(result.errors).not.toHaveProperty('access_restriction');
      expect(result.errors).not.toHaveProperty('access_restriction_date');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MEDIA RECORD CREATE VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record > validateMediaRecordCreate', () => {
    it('photo: valid data passes', () => {
      const result = validateMediaRecordCreate({
        color: 'color',
        horizontal_resolution: 1920,
        vertical_resolution: 1080
      }, 'photo');
      expect(result.isValid).toBe(true);
    });

    it('photo: missing color fails', () => {
      const result = validateMediaRecordCreate({
        horizontal_resolution: 1920,
        vertical_resolution: 1080
      }, 'photo');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('color');
    });

    it('photo: missing resolution fails', () => {
      const result = validateMediaRecordCreate({ color: 'color' }, 'photo');
      expect(result.errors).toHaveProperty('horizontal_resolution');
      expect(result.errors).toHaveProperty('vertical_resolution');
    });

    it('video: valid data passes', () => {
      const result = validateMediaRecordCreate({
        color: 'color', duration: '01:30:00',
        horizontal_resolution: 1920, vertical_resolution: 1080
      }, 'video');
      expect(result.isValid).toBe(true);
    });

    it('video: missing duration fails', () => {
      const result = validateMediaRecordCreate({
        color: 'color', horizontal_resolution: 1920, vertical_resolution: 1080
      }, 'video');
      expect(result.errors).toHaveProperty('duration');
    });

    it('video: invalid duration format fails', () => {
      const result = validateMediaRecordCreate({
        color: 'color', duration: 'abc',
        horizontal_resolution: 1920, vertical_resolution: 1080
      }, 'video');
      expect(result.errors).toHaveProperty('duration');
    });

    it('audio: valid data passes', () => {
      const result = validateMediaRecordCreate({ duration: '00:05:30' }, 'audio');
      expect(result.isValid).toBe(true);
    });

    it('audio: missing duration fails', () => {
      const result = validateMediaRecordCreate({}, 'audio');
      expect(result.errors).toHaveProperty('duration');
    });

    it('audio: does not require color or resolution', () => {
      const result = validateMediaRecordCreate({ duration: '00:05:30' }, 'audio');
      expect(result.errors).not.toHaveProperty('color');
      expect(result.errors).not.toHaveProperty('horizontal_resolution');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getRecordTypeForItem
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record > getRecordTypeForItem', () => {
    it('electronic Tekstuāls → text', () => {
      const item = { inventory: { type: 'Tekstuāls', electronic: true } };
      expect(getRecordTypeForItem(item)).toBe('text');
    });

    it('electronic Foto → photo', () => {
      const item = { inventory: { type: 'Foto', electronic: true } };
      expect(getRecordTypeForItem(item)).toBe('photo');
    });

    it('electronic Video → video', () => {
      const item = { inventory: { type: 'Video', electronic: true } };
      expect(getRecordTypeForItem(item)).toBe('video');
    });

    it('electronic Skaņas → audio', () => {
      const item = { inventory: { type: 'Skaņas', electronic: true } };
      expect(getRecordTypeForItem(item)).toBe('audio');
    });

    it('non-electronic returns null', () => {
      const item = { inventory: { type: 'Tekstuāls', electronic: false } };
      expect(getRecordTypeForItem(item)).toBeNull();
    });

    it('no inventory returns null', () => {
      expect(getRecordTypeForItem({})).toBeNull();
    });

    it('null item returns null', () => {
      expect(getRecordTypeForItem(null)).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SERIES CODE VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item > validateSeriesCode', () => {
    it('"1" is valid', () => {
      expect(validateSeriesCode('1')).toBeNull();
    });

    it('"1.2" is valid', () => {
      expect(validateSeriesCode('1.2')).toBeNull();
    });

    it('"1.2.3" is valid', () => {
      expect(validateSeriesCode('1.2.3')).toBeNull();
    });

    it('"12.34" is valid', () => {
      expect(validateSeriesCode('12.34')).toBeNull();
    });

    it('"01" is invalid (leading zero)', () => {
      expect(validateSeriesCode('01')).toBeTruthy();
    });

    it('"0" is invalid (zero)', () => {
      expect(validateSeriesCode('0')).toBeTruthy();
    });

    it('empty string returns error', () => {
      expect(validateSeriesCode('')).toBeTruthy();
    });

    it('null returns error', () => {
      expect(validateSeriesCode(null)).toBeTruthy();
    });

    it('"abc" is invalid', () => {
      expect(validateSeriesCode('abc')).toBeTruthy();
    });

    it('"1.2.3.4" is valid (multi-level)', () => {
      expect(validateSeriesCode('1.2.3.4')).toBeNull();
    });

    it('too long series code returns error', () => {
      expect(validateSeriesCode('A'.repeat(SERIES_CODE_MAX_LENGTH + 1))).toBeTruthy();
    });

    it('SERIES_CODE_REGEX matches valid patterns', () => {
      expect(SERIES_CODE_REGEX.test('1')).toBe(true);
      expect(SERIES_CODE_REGEX.test('1.2')).toBe(true);
      expect(SERIES_CODE_REGEX.test('1.2.3')).toBe(true);
    });

    it('SERIES_CODE_REGEX rejects invalid patterns', () => {
      expect(SERIES_CODE_REGEX.test('01')).toBe(false);
      expect(SERIES_CODE_REGEX.test('0')).toBe(false);
      expect(SERIES_CODE_REGEX.test('abc')).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ITEM TITLE VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item > validateTitle', () => {
    it('valid title returns null', () => {
      expect(validateItemTitle('Test Item')).toBeNull();
    });

    it('empty returns error', () => {
      expect(validateItemTitle('')).toBeTruthy();
    });

    it('title at max length passes', () => {
      expect(validateItemTitle('A'.repeat(ITEM_TITLE_MAX))).toBeNull();
    });

    it('title exceeding max length fails', () => {
      expect(validateItemTitle('A'.repeat(ITEM_TITLE_MAX + 1))).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ITEM DATE RANGE VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item > validateItemDateRange', () => {
    it('valid range returns empty errors', () => {
      const errors = validateItemDateRange('2020-01-01', '2025-12-31');
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('missing start_date returns error', () => {
      const errors = validateItemDateRange(null, '2025-12-31');
      expect(errors).toHaveProperty('start_date');
    });

    it('missing end_date returns error', () => {
      const errors = validateItemDateRange('2020-01-01', null);
      expect(errors).toHaveProperty('end_date');
    });

    it('both missing returns both errors', () => {
      const errors = validateItemDateRange(null, null);
      expect(errors).toHaveProperty('start_date');
      expect(errors).toHaveProperty('end_date');
    });

    it('start > end returns error', () => {
      const errors = validateItemDateRange('2025-12-31', '2020-01-01');
      expect(errors).toHaveProperty('end_date');
    });

    it('same start and end is valid', () => {
      const errors = validateItemDateRange('2023-06-15', '2023-06-15');
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('end exceeding inventory end returns error', () => {
      const errors = validateItemDateRange('2020-01-01', '2030-01-01', '2025-12-31');
      expect(errors).toHaveProperty('end_date');
    });

    it('end within inventory end is valid', () => {
      const errors = validateItemDateRange('2020-01-01', '2025-01-01', '2025-12-31');
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ITEM CONDITIONAL FIELD VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item > Conditional Fields', () => {
    it('isLanguageRequired: true for Tekstuāls', () => {
      expect(isLanguageRequired('Tekstuāls')).toBe(true);
    });

    it('isLanguageRequired: true for Video', () => {
      expect(isLanguageRequired('Video')).toBe(true);
    });

    it('isLanguageRequired: false for Foto', () => {
      expect(isLanguageRequired('Foto')).toBe(false);
    });

    it('isAnnotationRequired: true for Foto', () => {
      expect(isAnnotationRequired('Foto')).toBe(true);
    });

    it('isAnnotationRequired: true for Video', () => {
      expect(isAnnotationRequired('Video')).toBe(true);
    });

    it('isAnnotationRequired: true for Skaņas', () => {
      expect(isAnnotationRequired('Skaņas')).toBe(true);
    });

    it('isAnnotationRequired: false for Tekstuāls', () => {
      expect(isAnnotationRequired('Tekstuāls')).toBe(false);
    });

    it('isRestrictionNoteRequired: true for Ierobežota', () => {
      expect(isRestrictionNoteRequired('Ierobežota')).toBe(true);
    });

    it('isRestrictionNoteRequired: false for Vispārēja', () => {
      expect(isRestrictionNoteRequired('Vispārēja')).toBe(false);
    });

    it('validateLanguage: required for Tekstuāls, empty fails', () => {
      expect(validateItemLanguage('', 'Tekstuāls')).toBeTruthy();
    });

    it('validateLanguage: not required for Foto, empty passes', () => {
      expect(validateItemLanguage('', 'Foto')).toBeNull();
    });

    it('validateAnnotation: required for Foto, empty fails', () => {
      expect(validateAnnotation('', 'Foto')).toBeTruthy();
    });

    it('validateAnnotation: not required for Tekstuāls, empty passes', () => {
      expect(validateAnnotation('', 'Tekstuāls')).toBeNull();
    });

    it('validateRestrictionNote: required for Ierobežota, empty fails', () => {
      expect(validateRestrictionNote('', 'Ierobežota')).toBeTruthy();
    });

    it('validateRestrictionNote: not required for Vispārēja, empty passes', () => {
      expect(validateRestrictionNote('', 'Vispārēja')).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ITEM ENUM VALIDATORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item > Enum Validators', () => {
    it('validateDateIndicator: year is valid', () => {
      expect(validateDateIndicator('year')).toBeNull();
    });

    it('validateDateIndicator: month is valid', () => {
      expect(validateDateIndicator('month')).toBeNull();
    });

    it('validateDateIndicator: day is valid', () => {
      expect(validateDateIndicator('day')).toBeNull();
    });

    it('validateDateIndicator: invalid value fails', () => {
      expect(validateDateIndicator('hour')).toBeTruthy();
    });

    it('validateDateIndicator: null fails', () => {
      expect(validateDateIndicator(null)).toBeTruthy();
    });

    it('validateUnitOfMeasure: all values are valid', () => {
      UNIT_OF_MEASURE_VALUES.forEach(val => {
        expect(validateUnitOfMeasure(val)).toBeNull();
      });
    });

    it('validateUnitOfMeasure: invalid value fails', () => {
      expect(validateUnitOfMeasure('Kilogrami')).toBeTruthy();
    });

    it('validateSecurityLevel: all values are valid', () => {
      ITEM_SECURITY_LEVEL_LIST.forEach(val => {
        expect(validateSecurityLevel(val)).toBeNull();
      });
    });

    it('validateSecurityLevel: invalid value fails', () => {
      expect(validateSecurityLevel('Superslepenīgs')).toBeTruthy();
    });

    it('validateRestriction: all values are valid', () => {
      ITEM_RESTRICTION_LIST.forEach(val => {
        expect(validateRestriction(val)).toBeNull();
      });
    });

    it('validateRestriction: invalid value fails', () => {
      expect(validateRestriction('Noslēpums')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RELATED ITEMS VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item > validateRelatedItems', () => {
    it('empty array returns null', () => {
      expect(validateRelatedItems([], 1)).toBeNull();
    });

    it('null returns null', () => {
      expect(validateRelatedItems(null, 1)).toBeNull();
    });

    it('self-reference returns error', () => {
      expect(validateRelatedItems([1, 2, 3], 2)).toBeTruthy();
    });

    it('no self-reference returns null', () => {
      expect(validateRelatedItems([2, 3], 1)).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ITEM CREATE/UPDATE FULL VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item > validateItemCreate', () => {
    const inventory = { type: 'Tekstuāls', electronic: true, end_date: '2025-12-31' };

    it('complete valid item passes', () => {
      const data = {
        series_code: '1.1',
        title: 'Test Item',
        start_date: '2020-01-01',
        end_date: '2025-12-31',
        date_indicator: 'day',
        unit_of_measure: 'Lapas',
        language: 'latviešu',
        restriction: 'Vispārēja',
        security_level: 'Publisks'
      };
      const result = validateItemCreate(data, inventory);
      expect(result.isValid).toBe(true);
    });

    it('empty data returns many errors', () => {
      const result = validateItemCreate({}, inventory);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(3);
    });

    it('validateItemUpdate delegates to validateItemCreate', () => {
      const data = { series_code: '1.1', title: 'T' };
      const r1 = validateItemCreate(data, inventory);
      const r2 = validateItemUpdate(data, inventory);
      expect(r1.isValid).toBe(r2.isValid);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INVENTORY VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Inventory > validateNumber', () => {
    it('valid number returns null', () => {
      expect(validateNumber(1)).toBeNull();
    });

    it('max number (70) returns null', () => {
      expect(validateNumber(INVENTORY_MAX_NUM)).toBeNull();
    });

    it('number 0 returns error', () => {
      expect(validateNumber(0)).toBeTruthy();
    });

    it('number > 70 returns error', () => {
      expect(validateNumber(71)).toBeTruthy();
    });

    it('null returns error', () => {
      expect(validateNumber(null)).toBeTruthy();
    });

    it('negative number returns error', () => {
      expect(validateNumber(-1)).toBeTruthy();
    });
  });

  describe('Inventory > validatePostfix', () => {
    it('single char is valid', () => {
      expect(validatePostfix('A')).toBeNull();
    });

    it('3 chars is valid', () => {
      expect(validatePostfix('ABC')).toBeNull();
    });

    it('4+ chars is invalid', () => {
      expect(validatePostfix('ABCD')).toBeTruthy();
    });

    it('null is valid (optional)', () => {
      expect(validatePostfix(null)).toBeNull();
    });

    it('empty is valid (optional)', () => {
      expect(validatePostfix('')).toBeNull();
    });
  });

  describe('Inventory > validateType', () => {
    it('all VVAIS types are valid', () => {
      VVAIS_TYPE_LIST.forEach(type => {
        expect(validateType(type)).toBeNull();
      });
    });

    it('invalid type returns error', () => {
      expect(validateType('Kino')).toBeTruthy();
    });

    it('null returns error', () => {
      expect(validateType(null)).toBeTruthy();
    });

    it('VVAIS_TYPE_LIST has 4 types', () => {
      expect(VVAIS_TYPE_LIST).toHaveLength(4);
      expect(VVAIS_TYPE_LIST).toContain('Tekstuāls');
      expect(VVAIS_TYPE_LIST).toContain('Foto');
      expect(VVAIS_TYPE_LIST).toContain('Video');
      expect(VVAIS_TYPE_LIST).toContain('Skaņas');
    });
  });

  describe('Inventory > validateStorageTerm', () => {
    it('all VVAIS storage terms are valid', () => {
      VVAIS_STORAGE_TERM_LIST.forEach(term => {
        expect(validateStorageTerm(term)).toBeNull();
      });
    });

    it('invalid term returns error', () => {
      expect(validateStorageTerm('Pagaidu')).toBeTruthy();
    });

    it('null returns error', () => {
      expect(validateStorageTerm(null)).toBeTruthy();
    });
  });

  describe('Inventory > validateDateRange', () => {
    it('valid range returns empty errors', () => {
      const errors = validateDateRange('2020', '2025');
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('missing start returns error', () => {
      const errors = validateDateRange(null, '2025');
      expect(errors).toHaveProperty('start_date');
    });

    it('missing end returns error', () => {
      const errors = validateDateRange('2020', null);
      expect(errors).toHaveProperty('end_date');
    });

    it('start > end returns error', () => {
      const errors = validateDateRange('2025', '2020');
      expect(errors).toHaveProperty('end_date');
    });
  });

  describe('Inventory > validateInventoryCreate', () => {
    it('complete valid data passes', () => {
      const result = validateInventoryCreate({
        number: 1,
        type: 'Tekstuāls',
        storage_term: 'Pastāvīgi glabājamās lietas',
        start_date: '2020',
        end_date: '2025'
      });
      expect(result.isValid).toBe(true);
    });

    it('empty data returns multiple errors', () => {
      const result = validateInventoryCreate({});
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(2);
    });

    it('invalid postfix included in errors', () => {
      const result = validateInventoryCreate({
        number: 1, type: 'Tekstuāls',
        storage_term: 'Pastāvīgi glabājamās lietas',
        start_date: '2020', end_date: '2025',
        postfix: 'TOOLONG'
      });
      expect(result.errors).toHaveProperty('postfix');
    });
  });

  describe('Inventory > validateInventoryUpdate', () => {
    it('valid update passes', () => {
      const result = validateInventoryUpdate({
        storage_term: 'Pastāvīgi glabājamās lietas',
        start_date: '2020',
        end_date: '2025'
      });
      expect(result.isValid).toBe(true);
    });

    it('empty update passes (no required fields for update)', () => {
      const result = validateInventoryUpdate({});
      expect(result.isValid).toBe(true);
    });

    it('invalid storage_term fails', () => {
      const result = validateInventoryUpdate({ storage_term: 'Invalid' });
      expect(result.isValid).toBe(false);
    });
  });

  describe('Inventory > canDeleteInventory', () => {
    it('non-report inventory can be deleted', () => {
      expect(canDeleteInventory({ from_report: false })).toBe(true);
    });

    it('report inventory cannot be deleted', () => {
      expect(canDeleteInventory({ from_report: true })).toBe(false);
    });

    it('getDeleteRestrictionMessage: null for deletable', () => {
      expect(getDeleteRestrictionMessage({ from_report: false })).toBeNull();
    });

    it('getDeleteRestrictionMessage: message for report', () => {
      expect(getDeleteRestrictionMessage({ from_report: true })).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE UPLOAD VALIDATION (RecordValidation.js)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('RecordValidation > validateFileUploads', () => {
    it('no files returns error', () => {
      const result = validateFileUploads([], 'Foto');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('null files returns error', () => {
      const result = validateFileUploads(null, 'Foto');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('no inventory type returns error', () => {
      const files = [new File(['x'], 'f.jpg', { type: 'image/jpeg' })];
      const result = validateFileUploads(files, null);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('valid JPEG for Foto passes', () => {
      const files = [new File(['x'], 'photo.jpg', { type: 'image/jpeg' })];
      const result = validateFileUploads(files, 'Foto');
      expect(result.validFiles).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });

    it('multiple files for Foto fails (single file constraint)', () => {
      const files = [
        new File(['x'], 'a.jpg', { type: 'image/jpeg' }),
        new File(['y'], 'b.jpg', { type: 'image/jpeg' })
      ];
      const result = validateFileUploads(files, 'Foto');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('multiple files for Tekstuāls passes', () => {
      const files = [
        new File(['x'], 'a.pdf', { type: 'application/pdf' }),
        new File(['y'], 'b.pdf', { type: 'application/pdf' })
      ];
      const result = validateFileUploads(files, 'Tekstuāls');
      expect(result.validFiles).toHaveLength(2);
    });

    it('wrong file type returns error', () => {
      const files = [new File(['x'], 'doc.pdf', { type: 'application/pdf' })];
      const result = validateFileUploads(files, 'Foto');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('isSingleFileType: true for media types', () => {
      expect(isSingleFileType('Foto')).toBe(true);
      expect(isSingleFileType('Video')).toBe(true);
      expect(isSingleFileType('Skaņas')).toBe(true);
    });

    it('isSingleFileType: false for Tekstuāls', () => {
      expect(isSingleFileType('Tekstuāls')).toBe(false);
    });

    it('getAllowedFileTypes returns array for each type', () => {
      VVAIS_TYPE_LIST.forEach(type => {
        const allowed = getAllowedFileTypes(type);
        expect(Array.isArray(allowed)).toBeTruthy();
        expect(allowed.length).toBeGreaterThan(0);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // METADATA VALIDATION (RecordValidation.js)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('RecordValidation > validateMetadata', () => {
    it('null metadata fails', () => {
      const result = validateMetadata(null, 'Action');
      expect(result.isValid).toBe(false);
    });

    it('no type fails', () => {
      const result = validateMetadata({ action: 'test' }, null);
      expect(result.isValid).toBe(false);
    });

    it('valid Action passes', () => {
      const result = validateMetadata({ action: 'Send document' }, 'Action');
      expect(result.isValid).toBe(true);
    });

    it('empty Action fails', () => {
      const result = validateMetadata({ action: '' }, 'Action');
      expect(result.isValid).toBe(false);
    });

    it('valid Addressee passes', () => {
      const result = validateMetadata({ addressee: 'John' }, 'Addressee');
      expect(result.isValid).toBe(true);
    });

    it('empty Addressee fails', () => {
      const result = validateMetadata({ addressee: '' }, 'Addressee');
      expect(result.isValid).toBe(false);
    });

    it('valid Visa passes', () => {
      const result = validateMetadata({ visa: 'Approved' }, 'Visa');
      expect(result.isValid).toBe(true);
    });

    it('valid ReadStatus passes', () => {
      const result = validateMetadata({ is_read: true }, 'ReadStatus');
      expect(result.isValid).toBe(true);
    });

    it('missing ReadStatus is_read fails', () => {
      const result = validateMetadata({}, 'ReadStatus');
      expect(result.isValid).toBe(false);
    });

    it('unknown type fails', () => {
      const result = validateMetadata({ data: 'x' }, 'UnknownType');
      expect(result.isValid).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORD DATA VALIDATION (RecordValidation.js)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('RecordValidation > validateRecordData', () => {
    it('null data fails', () => {
      const result = validateRecordData(null);
      expect(result.isValid).toBe(false);
    });

    it('empty object passes for standard type', () => {
      const result = validateRecordData({}, 'standard');
      expect(result.isValid).toBe(true);
    });

    it('Foto media requires color and resolution', () => {
      const result = validateRecordData({}, 'media', 'Foto');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('Video media requires color, resolution, and duration', () => {
      const result = validateRecordData({}, 'media', 'Video');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });

    it('Skaņas media requires duration', () => {
      const result = validateRecordData({}, 'media', 'Skaņas');
      expect(result.isValid).toBe(false);
    });

    it('valid Foto data passes', () => {
      const result = validateRecordData({
        color: 'color', horizontal_resolution: 1920, vertical_resolution: 1080
      }, 'media', 'Foto');
      expect(result.isValid).toBe(true);
    });

    it('valid Video data passes', () => {
      const result = validateRecordData({
        color: 'color', horizontal_resolution: 1920,
        vertical_resolution: 1080, duration: '01:30:00'
      }, 'media', 'Video');
      expect(result.isValid).toBe(true);
    });

    it('valid Skaņas data passes', () => {
      const result = validateRecordData({ duration: '00:30:00' }, 'media', 'Skaņas');
      expect(result.isValid).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DURATION FORMAT VALIDATION (RecordValidation.js)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('RecordValidation > Duration Functions', () => {
    it('validateDurationFormat: valid HH:MM:SS passes', () => {
      const result = validateDurationFormat('01:30:00');
      expect(result.isValid).toBe(true);
    });

    it('validateDurationFormat: empty string fails', () => {
      const result = validateDurationFormat('');
      expect(result.isValid).toBe(false);
    });

    it('validateDurationFormat: MM:SS gets formatted', () => {
      const result = validateDurationFormat('30:00');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBeTruthy();
    });

    it('formatDuration: HH:MM:SS passes through', () => {
      expect(formatDuration('01:30:00')).toBe('01:30:00');
    });

    it('formatDuration: MM:SS formats to HH:MM:SS', () => {
      const result = formatDuration('30:00');
      expect(result).toBe('00:30:00');
    });

    it('formatDuration: plain seconds formats correctly', () => {
      const result = formatDuration('90');
      expect(result).toBe('00:01:30');
    });

    it('formatDuration: null returns empty string', () => {
      expect(formatDuration(null)).toBe('');
    });

    it('formatFileSize: 0 returns "0 Bytes"', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('formatFileSize: 1024 returns "1 KB"', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('formatFileSize: 1048576 returns "1 MB"', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('getAPITypeFromInventory: Skaņas → Audio', () => {
      expect(getAPITypeFromInventory('Skaņas')).toBe('Audio');
    });

    it('getAPITypeFromInventory: Foto → Foto', () => {
      expect(getAPITypeFromInventory('Foto')).toBe('Foto');
    });

    it('getAPITypeFromInventory: Video → Video', () => {
      expect(getAPITypeFromInventory('Video')).toBe('Video');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPLETE RECORD FORM VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('RecordValidation > validateRecordForm', () => {
    it('media record without files fails', () => {
      const result = validateRecordForm({}, [], 'Foto', 'media');
      expect(result.isValid).toBe(false);
    });

    it('standard record without files passes', () => {
      const result = validateRecordForm({}, null, 'Tekstuāls', 'standard');
      expect(result.isValid).toBe(true);
    });

    it('hasValidationErrors detects errors', () => {
      expect(hasValidationErrors({ isValid: false })).toBe(true);
      expect(hasValidationErrors({ isValid: true })).toBe(false);
      expect(hasValidationErrors({ hasErrors: true })).toBe(true);
      expect(hasValidationErrors(null)).toBe(false);
    });

    it('getValidationErrorMessages extracts messages', () => {
      const result = {
        errors: {
          files: [{ file: 'test.txt', errors: ['Wrong type'] }],
          record: ['Missing color']
        }
      };
      const messages = getValidationErrorMessages(result);
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE VALIDATION — Soft Warnings (FileValidation.js)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('FileValidation > Soft Warnings', () => {
    it('validateFileSize: within range returns no warnings', () => {
      const file = { size: 5 * 1024 * 1024 }; // 5MB
      expect(validateFileSize(file, 100, 0.01)).toHaveLength(0);
    });

    it('validateFileSize: above max returns warning', () => {
      const file = { size: 200 * 1024 * 1024 }; // 200MB
      const warnings = validateFileSize(file, 100, 0.01);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].field).toBe('fileSize');
    });

    it('validateFileSize: below min returns warning', () => {
      const file = { size: 100 }; // ~0.0001MB
      const warnings = validateFileSize(file, 100, 0.01);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('validateFileSize: null file returns empty', () => {
      expect(validateFileSize(null)).toHaveLength(0);
    });

    it('validateDuration (FileValidation): within range returns no warnings', () => {
      expect(validateFileDuration(60, 3600, 1)).toHaveLength(0);
    });

    it('validateDuration: above max returns warning', () => {
      const warnings = validateFileDuration(7200, 3600, 1);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].field).toBe('duration');
    });

    it('validateDuration: below min returns warning', () => {
      const warnings = validateFileDuration(0.5, 3600, 1);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('validateImageDimensions: valid dimensions return no warnings', () => {
      expect(validateImageDimensions(1920, 1080, {})).toHaveLength(0);
    });

    it('validateImageDimensions: too wide returns warning', () => {
      const warnings = validateImageDimensions(5000, 1080, { maxImageWidth: 4000 });
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('validateImageDimensions: too small returns warning', () => {
      const warnings = validateImageDimensions(400, 300, {
        minImageWidth: 800, minImageHeight: 600
      });
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('validateImageDimensions: orientation mismatch warning', () => {
      const warnings = validateImageDimensions(1080, 1920, {
        preferredOrientation: 'horizontal'
      }, true);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('validateImageDimensions: null dimensions return empty', () => {
      expect(validateImageDimensions(null, null)).toHaveLength(0);
    });

    it('formatWarnings: empty array returns empty string', () => {
      expect(formatWarnings([])).toBe('');
    });

    it('formatWarnings: single warning returns message', () => {
      const result = formatWarnings([{ message: 'File too large' }]);
      expect(result).toBe('File too large');
    });

    it('formatWarnings: multiple warnings returns formatted', () => {
      const result = formatWarnings([
        { message: 'File too large' },
        { message: 'Wrong dimensions' }
      ]);
      expect(result).toContain('2');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CHARACTER COUNTERS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getRemainingChars', () => {
    it('record: empty string has full remaining', () => {
      expect(getRecordRemainingChars('', RECORD_TITLE_MAX)).toBe(RECORD_TITLE_MAX);
    });

    it('record: null has full remaining', () => {
      expect(getRecordRemainingChars(null, RECORD_TITLE_MAX)).toBe(RECORD_TITLE_MAX);
    });

    it('record: at max returns 0', () => {
      expect(getRecordRemainingChars('A'.repeat(RECORD_TITLE_MAX), RECORD_TITLE_MAX)).toBe(0);
    });

    it('record: over max returns negative', () => {
      expect(getRecordRemainingChars('A'.repeat(RECORD_TITLE_MAX + 5), RECORD_TITLE_MAX)).toBe(-5);
    });

    it('item: same behavior', () => {
      expect(getItemRemainingChars('test', 100)).toBe(96);
    });
  });
};

export default formValidationTests;
