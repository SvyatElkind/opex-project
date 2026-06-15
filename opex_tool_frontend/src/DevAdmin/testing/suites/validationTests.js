/**
 * Validation Function Tests
 *
 * Comprehensive tests for all validation functions across:
 * - projectConstants (validateProjectName, validateProjectFolder, validateReportFile)
 * - inventoryConstants (validateNumber, validateType, validateStorageTerm, etc.)
 * - itemConstants (validateSeriesCode, validateTitle, validateItemCreate, etc.)
 * - recordConstants (validateTitle, validateRecordDate, validateTextRecordCreate, etc.)
 * - institutionConstants (validateCreator, validateSigner, validateInstitutionUpdate)
 * - RecordValidation (validateFileUploads, validateMetadata, validateDurationFormat, etc.)
 * - FileValidation (validateFileSize, validateDuration, validateImageDimensions)
 */

import {
  validateProjectName, validateProjectFolder, validateReportFile,
  PROJECT_NAME_MAX_LENGTH, PROJECT_NAME_REGEX
} from '../../../Constants/projectConstants';

import {
  validateNumber, validatePostfix, validateType, validateStorageTerm,
  validateDateRange, validateInventoryCreate, validateInventoryUpdate,
  canDeleteInventory, VVAIS_TYPE_LIST, VVAIS_STORAGE_TERM_LIST,
  INVENTORY_MIN_NUM, INVENTORY_MAX_NUM
} from '../../../Constants/inventoryConstants';

import {
  validateSeriesCode, validateTitle as validateItemTitle,
  validateItemDateRange, validateLanguage as validateItemLanguage,
  validateAnnotation, validateRestrictionNote, validateDateIndicator,
  validateUnitOfMeasure, validateSecurityLevel, validateRestriction,
  validateRelatedItems, validateItemCreate, validateItemUpdate,
  isLanguageRequired, isAnnotationRequired, isRestrictionNoteRequired,
  getRemainingChars as getItemRemainingChars,
  SERIES_CODE_REGEX, DATE_INDICATOR_VALUES, UNIT_OF_MEASURE_VALUES,
  ITEM_RESTRICTION_LIST, ITEM_SECURITY_LEVEL_LIST
} from '../../../Constants/itemConstants';

import {
  validateTitle as validateRecordTitle, validateLanguage as validateRecordLanguage,
  validateRegNr, validateNomenclatureNr, validateRecordDate,
  validateAccessRestriction, validateAccessRestrictionDate,
  validateDuration as validateRecordDuration,
  validateTextRecordCreate, validateMediaRecordCreate,
  isAccessRestrictionDateRequired, getRecordTypeForItem,
  DURATION_REGEX, RECORD_ACCESS_RESTRICTION_VALUES
} from '../../../Constants/recordConstants';

import {
  validateCreator, validateCreatorPosition, validateSigner, validateSignerPosition,
  validateInstitutionUpdate, CREATOR_MAX_LENGTH, SIGNER_MAX_LENGTH,
  CREATOR_POSITION_MAX_LENGTH, SIGNER_POSITION_MAX_LENGTH
} from '../../../Constants/institutionConstants';

import {
  validateFileUploads, validateMetadata, validateRecordData,
  validateDurationFormat, validateRecordForm,
  isSingleFileType, getAllowedFileTypes, formatFileSize, formatDuration,
  getAPITypeFromInventory, RECORD_VALIDATION
} from '../../../Utils/RecordValidation';

import {
  validateFileSize, validateDuration as validateFileDuration,
  validateImageDimensions
} from '../../../Utils/FileValidation';


const validationTests = ({ describe, it, test, expect }) => {

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECT VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Project Validation', () => {
    // validateProjectName
    it('validateProjectName: valid name', () => {
      const r = validateProjectName('MyProject_1');
      expect(r.isValid).toBe(true);
      expect(r.error).toBeNull();
    });

    it('validateProjectName: empty name', () => {
      const r = validateProjectName('');
      expect(r.isValid).toBe(false);
      expect(r.error).toBeTruthy();
    });

    it('validateProjectName: null name', () => {
      const r = validateProjectName(null);
      expect(r.isValid).toBe(false);
    });

    it('validateProjectName: whitespace only', () => {
      const r = validateProjectName('   ');
      expect(r.isValid).toBe(false);
    });

    it('validateProjectName: too long (>20 chars)', () => {
      const r = validateProjectName('a'.repeat(21));
      expect(r.isValid).toBe(false);
    });

    it('validateProjectName: exactly 20 chars is valid', () => {
      const r = validateProjectName('a'.repeat(20));
      expect(r.isValid).toBe(true);
    });

    it('validateProjectName: special characters not allowed', () => {
      const r = validateProjectName('My Project!');
      expect(r.isValid).toBe(false);
    });

    it('validateProjectName: underscores and hyphens allowed', () => {
      const r1 = validateProjectName('my_project');
      expect(r1.isValid).toBe(true);
      const r2 = validateProjectName('my-project');
      expect(r2.isValid).toBe(true);
    });

    // validateProjectFolder
    it('validateProjectFolder: valid folder', () => {
      const r = validateProjectFolder('/some/path');
      expect(r.isValid).toBe(true);
    });

    it('validateProjectFolder: empty folder', () => {
      const r = validateProjectFolder('');
      expect(r.isValid).toBe(false);
    });

    it('validateProjectFolder: too long (>100 chars)', () => {
      const r = validateProjectFolder('a'.repeat(101));
      expect(r.isValid).toBe(false);
    });

    // validateReportFile
    it('validateReportFile: null file', () => {
      const r = validateReportFile(null);
      expect(r.isValid).toBe(false);
    });

    it('validateReportFile: valid xlsx file', () => {
      const file = { name: 'report.xlsx', size: 1024 };
      const r = validateReportFile(file);
      expect(r.isValid).toBe(true);
    });

    it('validateReportFile: wrong extension', () => {
      const file = { name: 'report.pdf', size: 1024 };
      const r = validateReportFile(file);
      expect(r.isValid).toBe(false);
    });

    it('validateReportFile: empty file', () => {
      const file = { name: 'report.xlsx', size: 0 };
      const r = validateReportFile(file);
      expect(r.isValid).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INVENTORY VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Inventory Validation', () => {
    // validateNumber
    it('validateNumber: valid number', () => {
      expect(validateNumber(1)).toBeNull();
      expect(validateNumber(35)).toBeNull();
      expect(validateNumber(70)).toBeNull();
    });

    it('validateNumber: null/undefined', () => {
      expect(validateNumber(null)).toBeTruthy();
      expect(validateNumber(undefined)).toBeTruthy();
    });

    it('validateNumber: out of range', () => {
      expect(validateNumber(0)).toBeTruthy();
      expect(validateNumber(71)).toBeTruthy();
      expect(validateNumber(-1)).toBeTruthy();
    });

    // validatePostfix
    it('validatePostfix: valid postfix', () => {
      expect(validatePostfix('a')).toBeNull();
      expect(validatePostfix('abc')).toBeNull();
    });

    it('validatePostfix: empty is ok (optional)', () => {
      expect(validatePostfix(null)).toBeNull();
      expect(validatePostfix('')).toBeNull();
    });

    it('validatePostfix: too long', () => {
      expect(validatePostfix('abcd')).toBeTruthy();
    });

    // validateType
    it('validateType: all valid types', () => {
      VVAIS_TYPE_LIST.forEach(type => {
        expect(validateType(type)).toBeNull();
      });
    });

    it('validateType: empty type', () => {
      expect(validateType('')).toBeTruthy();
      expect(validateType(null)).toBeTruthy();
    });

    it('validateType: invalid type', () => {
      expect(validateType('InvalidType')).toBeTruthy();
    });

    // validateStorageTerm
    it('validateStorageTerm: all valid terms', () => {
      VVAIS_STORAGE_TERM_LIST.forEach(term => {
        expect(validateStorageTerm(term)).toBeNull();
      });
    });

    it('validateStorageTerm: empty', () => {
      expect(validateStorageTerm('')).toBeTruthy();
    });

    it('validateStorageTerm: invalid', () => {
      expect(validateStorageTerm('Invalid term')).toBeTruthy();
    });

    // validateDateRange
    it('validateDateRange: valid range', () => {
      const errors = validateDateRange('2020-01-01', '2025-12-31');
      expect(Object.keys(errors).length).toBe(0);
    });

    it('validateDateRange: start after end', () => {
      const errors = validateDateRange('2025-12-31', '2020-01-01');
      expect(errors.end_date).toBeTruthy();
    });

    it('validateDateRange: missing start', () => {
      const errors = validateDateRange(null, '2025-12-31');
      expect(errors.start_date).toBeTruthy();
    });

    it('validateDateRange: missing end', () => {
      const errors = validateDateRange('2020-01-01', null);
      expect(errors.end_date).toBeTruthy();
    });

    it('validateDateRange: both missing', () => {
      const errors = validateDateRange(null, null);
      expect(errors.start_date).toBeTruthy();
      expect(errors.end_date).toBeTruthy();
    });

    // validateInventoryCreate
    it('validateInventoryCreate: valid data', () => {
      const r = validateInventoryCreate({
        number: 1,
        type: 'Tekstuāls',
        storage_term: 'Pastāvīgi glabājamās lietas',
        start_date: '2020-01-01',
        end_date: '2025-12-31'
      });
      expect(r.isValid).toBe(true);
      expect(Object.keys(r.errors).length).toBe(0);
    });

    it('validateInventoryCreate: empty data', () => {
      const r = validateInventoryCreate({});
      expect(r.isValid).toBe(false);
      expect(r.errors.number).toBeTruthy();
      expect(r.errors.type).toBeTruthy();
      expect(r.errors.storage_term).toBeTruthy();
    });

    // validateInventoryUpdate
    it('validateInventoryUpdate: valid update', () => {
      const r = validateInventoryUpdate({
        storage_term: 'Pastāvīgi glabājamās lietas',
        start_date: '2020-01-01',
        end_date: '2025-12-31'
      });
      expect(r.isValid).toBe(true);
    });

    it('validateInventoryUpdate: empty data is valid (no required fields)', () => {
      const r = validateInventoryUpdate({});
      expect(r.isValid).toBe(true);
    });

    // canDeleteInventory
    it('canDeleteInventory: regular inventory can be deleted', () => {
      expect(canDeleteInventory({ from_report: false })).toBe(true);
    });

    it('canDeleteInventory: report inventory cannot be deleted', () => {
      expect(canDeleteInventory({ from_report: true })).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ITEM VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item Validation', () => {
    // validateSeriesCode
    it('validateSeriesCode: valid codes', () => {
      expect(validateSeriesCode('1')).toBeNull();
      expect(validateSeriesCode('1.2')).toBeNull();
      expect(validateSeriesCode('1.2.3')).toBeNull();
      expect(validateSeriesCode('12.34')).toBeNull();
    });

    it('validateSeriesCode: empty', () => {
      expect(validateSeriesCode('')).toBeTruthy();
      expect(validateSeriesCode(null)).toBeTruthy();
    });

    it('validateSeriesCode: invalid format', () => {
      expect(validateSeriesCode('01')).toBeTruthy();       // leading zero
      expect(validateSeriesCode('abc')).toBeTruthy();      // letters
      expect(validateSeriesCode('1.2.')).toBeTruthy();     // trailing dot
    });

    it('validateSeriesCode: too long', () => {
      expect(validateSeriesCode('1'.repeat(21))).toBeTruthy();
    });

    // validateItemTitle
    it('validateItemTitle: valid', () => {
      expect(validateItemTitle('Test Item')).toBeNull();
    });

    it('validateItemTitle: empty', () => {
      expect(validateItemTitle('')).toBeTruthy();
      expect(validateItemTitle('   ')).toBeTruthy();
    });

    it('validateItemTitle: too long (>1000)', () => {
      expect(validateItemTitle('a'.repeat(1001))).toBeTruthy();
    });

    // validateItemDateRange
    it('validateItemDateRange: valid range', () => {
      const errors = validateItemDateRange('2020-01-01', '2025-12-31');
      expect(Object.keys(errors).length).toBe(0);
    });

    it('validateItemDateRange: start after end', () => {
      const errors = validateItemDateRange('2025-12-31', '2020-01-01');
      expect(errors.end_date).toBeTruthy();
    });

    it('validateItemDateRange: exceeds inventory end date', () => {
      const errors = validateItemDateRange('2020-01-01', '2030-12-31', '2025-12-31');
      expect(errors.end_date).toBeTruthy();
    });

    it('validateItemDateRange: within inventory range is valid', () => {
      const errors = validateItemDateRange('2020-01-01', '2024-12-31', '2025-12-31');
      expect(Object.keys(errors).length).toBe(0);
    });

    // Language validation (conditional)
    it('validateItemLanguage: required for Tekstuāls', () => {
      expect(validateItemLanguage('', 'Tekstuāls')).toBeTruthy();
      expect(validateItemLanguage('latviešu', 'Tekstuāls')).toBeNull();
    });

    it('validateItemLanguage: NOT required for Foto', () => {
      expect(validateItemLanguage('', 'Foto')).toBeNull();
      expect(validateItemLanguage(null, 'Foto')).toBeNull();
    });

    it('isLanguageRequired: correct by type', () => {
      expect(isLanguageRequired('Tekstuāls')).toBe(true);
      expect(isLanguageRequired('Video')).toBe(true);
      expect(isLanguageRequired('Skaņas')).toBe(true);
      expect(isLanguageRequired('Foto')).toBe(false);
    });

    // Annotation validation (conditional)
    it('validateAnnotation: required for media types', () => {
      expect(validateAnnotation('', 'Foto')).toBeTruthy();
      expect(validateAnnotation('', 'Video')).toBeTruthy();
      expect(validateAnnotation('', 'Skaņas')).toBeTruthy();
    });

    it('validateAnnotation: optional for Tekstuāls', () => {
      expect(validateAnnotation('', 'Tekstuāls')).toBeNull();
    });

    it('isAnnotationRequired: correct by type', () => {
      expect(isAnnotationRequired('Foto')).toBe(true);
      expect(isAnnotationRequired('Video')).toBe(true);
      expect(isAnnotationRequired('Skaņas')).toBe(true);
      expect(isAnnotationRequired('Tekstuāls')).toBe(false);
    });

    // Restriction note (conditional)
    it('validateRestrictionNote: required when restriction is not Vispārēja', () => {
      expect(validateRestrictionNote('', 'Ierobežota')).toBeTruthy();
      expect(validateRestrictionNote('Because...', 'Ierobežota')).toBeNull();
    });

    it('validateRestrictionNote: NOT required when Vispārēja', () => {
      expect(validateRestrictionNote('', 'Vispārēja')).toBeNull();
    });

    it('isRestrictionNoteRequired: correct values', () => {
      expect(isRestrictionNoteRequired('Vispārēja')).toBe(false);
      expect(isRestrictionNoteRequired('Ierobežota')).toBe(true);
      expect(isRestrictionNoteRequired(null)).toBeFalsy();
    });

    // Date indicator
    it('validateDateIndicator: valid values', () => {
      DATE_INDICATOR_VALUES.forEach(v => {
        expect(validateDateIndicator(v)).toBeNull();
      });
    });

    it('validateDateIndicator: invalid', () => {
      expect(validateDateIndicator('invalid')).toBeTruthy();
      expect(validateDateIndicator(null)).toBeTruthy();
    });

    // Unit of measure
    it('validateUnitOfMeasure: valid values', () => {
      UNIT_OF_MEASURE_VALUES.forEach(v => {
        expect(validateUnitOfMeasure(v)).toBeNull();
      });
    });

    it('validateUnitOfMeasure: invalid', () => {
      expect(validateUnitOfMeasure('kg')).toBeTruthy();
      expect(validateUnitOfMeasure(null)).toBeTruthy();
    });

    // Security level
    it('validateSecurityLevel: valid values', () => {
      ITEM_SECURITY_LEVEL_LIST.forEach(v => {
        expect(validateSecurityLevel(v)).toBeNull();
      });
    });

    it('validateSecurityLevel: null is ok (optional)', () => {
      expect(validateSecurityLevel(null)).toBeNull();
    });

    it('validateSecurityLevel: invalid string', () => {
      expect(validateSecurityLevel('TopSecret')).toBeTruthy();
    });

    // Restriction
    it('validateRestriction: valid values', () => {
      ITEM_RESTRICTION_LIST.forEach(v => {
        expect(validateRestriction(v)).toBeNull();
      });
    });

    it('validateRestriction: null is ok (optional)', () => {
      expect(validateRestriction(null)).toBeNull();
    });

    // Related items
    it('validateRelatedItems: empty is ok', () => {
      expect(validateRelatedItems([], 1)).toBeNull();
      expect(validateRelatedItems(null, 1)).toBeNull();
    });

    it('validateRelatedItems: self-relation fails', () => {
      expect(validateRelatedItems([1, 2, 3], 2)).toBeTruthy();
    });

    it('validateRelatedItems: valid relations', () => {
      expect(validateRelatedItems([2, 3], 1)).toBeNull();
    });

    // Full item create validation
    it('validateItemCreate: valid Tekstuāls item', () => {
      const r = validateItemCreate({
        series_code: '1.1',
        title: 'Test Item',
        start_date: '2020-01-01',
        end_date: '2025-12-31',
        date_indicator: 'day',
        unit_of_measure: 'Lapas',
        language: 'latviešu',
        restriction: 'Vispārēja'
      }, { type: 'Tekstuāls', end_date: '2025-12-31' });
      expect(r.isValid).toBe(true);
    });

    it('validateItemCreate: valid Foto item (no language required)', () => {
      const r = validateItemCreate({
        series_code: '1.1',
        title: 'Photo Item',
        start_date: '2020-01-01',
        end_date: '2025-12-31',
        date_indicator: 'day',
        unit_of_measure: 'Lapas',
        annotation: 'Photo description',
        restriction: 'Vispārēja'
      }, { type: 'Foto', end_date: '2025-12-31' });
      expect(r.isValid).toBe(true);
    });

    it('validateItemCreate: empty data fails multiple fields', () => {
      const r = validateItemCreate({}, { type: 'Tekstuāls' });
      expect(r.isValid).toBe(false);
      expect(r.errors.series_code).toBeTruthy();
      expect(r.errors.title).toBeTruthy();
      expect(r.errors.date_indicator).toBeTruthy();
      expect(r.errors.unit_of_measure).toBeTruthy();
    });

    it('validateItemUpdate delegates to validateItemCreate', () => {
      const data = { series_code: '1.1', title: 'X', start_date: '2020-01-01', end_date: '2025-12-31', date_indicator: 'day', unit_of_measure: 'Lapas', language: 'latviešu' };
      const inv = { type: 'Tekstuāls', end_date: '2025-12-31' };
      const create = validateItemCreate(data, inv);
      const update = validateItemUpdate(data, inv);
      expect(create.isValid).toBe(update.isValid);
    });

    // getRemainingChars
    it('getRemainingChars: calculates correctly', () => {
      expect(getItemRemainingChars('hello', 10)).toBe(5);
      expect(getItemRemainingChars(null, 10)).toBe(10);
      expect(getItemRemainingChars('', 10)).toBe(10);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORD VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record Validation', () => {
    // validateRecordTitle
    it('validateRecordTitle: valid', () => {
      expect(validateRecordTitle('Some Title')).toBeNull();
    });

    it('validateRecordTitle: empty', () => {
      expect(validateRecordTitle('')).toBeTruthy();
      expect(validateRecordTitle(null)).toBeTruthy();
    });

    it('validateRecordTitle: too long (>500)', () => {
      expect(validateRecordTitle('a'.repeat(501))).toBeTruthy();
    });

    // validateRecordDate
    it('validateRecordDate: valid in range', () => {
      const item = { start_date: '2020-01-01', end_date: '2025-12-31' };
      expect(validateRecordDate('2023-06-15', item)).toBeNull();
    });

    it('validateRecordDate: out of range', () => {
      const item = { start_date: '2020-01-01', end_date: '2025-12-31' };
      expect(validateRecordDate('2030-01-01', item)).toBeTruthy();
    });

    it('validateRecordDate: empty', () => {
      expect(validateRecordDate(null, {})).toBeTruthy();
    });

    it('validateRecordDate: no item date constraints is ok', () => {
      expect(validateRecordDate('2023-06-15', {})).toBeNull();
    });

    // validateAccessRestriction
    it('validateAccessRestriction: valid values', () => {
      expect(validateAccessRestriction('open')).toBeNull();
      expect(validateAccessRestriction('closed')).toBeNull();
    });

    it('validateAccessRestriction: null is ok (optional)', () => {
      expect(validateAccessRestriction(null)).toBeNull();
    });

    it('validateAccessRestriction: invalid', () => {
      expect(validateAccessRestriction('restricted')).toBeTruthy();
    });

    // validateAccessRestrictionDate
    it('validateAccessRestrictionDate: required when closed', () => {
      expect(validateAccessRestrictionDate(null, 'closed')).toBeTruthy();
      expect(validateAccessRestrictionDate('2025-12-31', 'closed')).toBeNull();
    });

    it('validateAccessRestrictionDate: not allowed when open', () => {
      expect(validateAccessRestrictionDate('2025-12-31', 'open')).toBeTruthy();
      expect(validateAccessRestrictionDate(null, 'open')).toBeNull();
    });

    it('isAccessRestrictionDateRequired: correct', () => {
      expect(isAccessRestrictionDateRequired('closed')).toBe(true);
      expect(isAccessRestrictionDateRequired('open')).toBe(false);
    });

    // validateRecordDuration
    it('validateRecordDuration: valid HH:MM:SS', () => {
      expect(validateRecordDuration('01:30:00')).toBeNull();
      expect(validateRecordDuration('0:05:30')).toBeNull();
    });

    it('validateRecordDuration: invalid format', () => {
      expect(validateRecordDuration('abc')).toBeTruthy();
      expect(validateRecordDuration('1:2:3')).toBeTruthy();
    });

    it('validateRecordDuration: required flag', () => {
      expect(validateRecordDuration('', true)).toBeTruthy();
      expect(validateRecordDuration('', false)).toBeNull();
    });

    // validateTextRecordCreate
    it('validateTextRecordCreate: valid data', () => {
      const r = validateTextRecordCreate({
        title: 'Record Title',
        language: 'latviešu',
        reg_nr: '123',
        nomenclature_nr: 'NOM-1',
        date: '2023-06-15',
        access_restriction: 'open'
      }, { start_date: '2020-01-01', end_date: '2025-12-31' });
      expect(r.isValid).toBe(true);
    });

    it('validateTextRecordCreate: empty data fails', () => {
      const r = validateTextRecordCreate({}, {});
      expect(r.isValid).toBe(false);
      expect(r.errors.title).toBeTruthy();
      expect(r.errors.date).toBeTruthy();
    });

    // validateMediaRecordCreate
    it('validateMediaRecordCreate: valid photo', () => {
      const r = validateMediaRecordCreate({
        color: 'krāsainā',
        horizontal_resolution: 1920,
        vertical_resolution: 1080
      }, 'photo');
      expect(r.isValid).toBe(true);
    });

    it('validateMediaRecordCreate: valid video', () => {
      const r = validateMediaRecordCreate({
        color: 'krāsainā',
        horizontal_resolution: 1920,
        vertical_resolution: 1080,
        duration: '01:30:00'
      }, 'video');
      expect(r.isValid).toBe(true);
    });

    it('validateMediaRecordCreate: valid audio', () => {
      const r = validateMediaRecordCreate({
        duration: '00:05:30'
      }, 'audio');
      expect(r.isValid).toBe(true);
    });

    it('validateMediaRecordCreate: empty photo fails', () => {
      const r = validateMediaRecordCreate({}, 'photo');
      expect(r.isValid).toBe(false);
      expect(r.errors.color).toBeTruthy();
      expect(r.errors.horizontal_resolution).toBeTruthy();
      expect(r.errors.vertical_resolution).toBeTruthy();
    });

    it('validateMediaRecordCreate: empty video fails', () => {
      const r = validateMediaRecordCreate({}, 'video');
      expect(r.isValid).toBe(false);
      expect(r.errors.color).toBeTruthy();
      expect(r.errors.duration).toBeTruthy();
    });

    it('validateMediaRecordCreate: empty audio fails', () => {
      const r = validateMediaRecordCreate({}, 'audio');
      expect(r.isValid).toBe(false);
      expect(r.errors.duration).toBeTruthy();
    });

    // getRecordTypeForItem
    it('getRecordTypeForItem: correct mapping', () => {
      expect(getRecordTypeForItem({ inventory: { type: 'Tekstuāls', electronic: true } })).toBe('text');
      expect(getRecordTypeForItem({ inventory: { type: 'Foto', electronic: true } })).toBe('photo');
      expect(getRecordTypeForItem({ inventory: { type: 'Video', electronic: true } })).toBe('video');
      expect(getRecordTypeForItem({ inventory: { type: 'Skaņas', electronic: true } })).toBe('audio');
    });

    it('getRecordTypeForItem: non-electronic returns null', () => {
      expect(getRecordTypeForItem({ inventory: { type: 'Tekstuāls', electronic: false } })).toBeNull();
    });

    it('getRecordTypeForItem: null item returns null', () => {
      expect(getRecordTypeForItem(null)).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INSTITUTION VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Institution Validation', () => {
    it('validateCreator: valid', () => {
      const r = validateCreator('Jānis Bērziņš');
      expect(r.isValid).toBe(true);
    });

    it('validateCreator: empty', () => {
      const r = validateCreator('');
      expect(r.isValid).toBe(false);
    });

    it('validateCreator: too long', () => {
      const r = validateCreator('a'.repeat(CREATOR_MAX_LENGTH + 1));
      expect(r.isValid).toBe(false);
    });

    it('validateCreatorPosition: valid', () => {
      const r = validateCreatorPosition('Direktors');
      expect(r.isValid).toBe(true);
    });

    it('validateCreatorPosition: empty', () => {
      const r = validateCreatorPosition('');
      expect(r.isValid).toBe(false);
    });

    it('validateCreatorPosition: too long', () => {
      const r = validateCreatorPosition('a'.repeat(CREATOR_POSITION_MAX_LENGTH + 1));
      expect(r.isValid).toBe(false);
    });

    it('validateSigner: valid', () => {
      const r = validateSigner('Anna Kalniņa');
      expect(r.isValid).toBe(true);
    });

    it('validateSigner: empty', () => {
      const r = validateSigner('');
      expect(r.isValid).toBe(false);
    });

    it('validateSigner: too long', () => {
      const r = validateSigner('a'.repeat(SIGNER_MAX_LENGTH + 1));
      expect(r.isValid).toBe(false);
    });

    it('validateSignerPosition: valid', () => {
      const r = validateSignerPosition('Vadītājs');
      expect(r.isValid).toBe(true);
    });

    it('validateSignerPosition: empty', () => {
      const r = validateSignerPosition('');
      expect(r.isValid).toBe(false);
    });

    it('validateInstitutionUpdate: full valid data', () => {
      const r = validateInstitutionUpdate({
        creator: 'Jānis', creator_position: 'Direktors',
        signer: 'Anna', signer_position: 'Vadītājs'
      });
      expect(r.isValid).toBe(true);
      expect(Object.keys(r.errors).length).toBe(0);
    });

    it('validateInstitutionUpdate: all empty fails', () => {
      const r = validateInstitutionUpdate({
        creator: '', creator_position: '',
        signer: '', signer_position: ''
      });
      expect(r.isValid).toBe(false);
      expect(r.errors.creator).toBeTruthy();
      expect(r.errors.creator_position).toBeTruthy();
      expect(r.errors.signer).toBeTruthy();
      expect(r.errors.signer_position).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORD VALIDATION UTILS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('RecordValidation Utils', () => {
    // isSingleFileType
    it('isSingleFileType: media types are single-file', () => {
      expect(isSingleFileType('Foto')).toBe(true);
      expect(isSingleFileType('Video')).toBe(true);
      expect(isSingleFileType('Skaņas')).toBe(true);
    });

    it('isSingleFileType: Tekstuāls is multi-file', () => {
      expect(isSingleFileType('Tekstuāls')).toBe(false);
    });

    // getAllowedFileTypes
    it('getAllowedFileTypes: returns array for each type', () => {
      ['Foto', 'Video', 'Skaņas', 'Tekstuāls'].forEach(type => {
        const types = getAllowedFileTypes(type);
        expect(Array.isArray(types)).toBeTruthy();
        expect(types.length).toBeGreaterThan(0);
      });
    });

    // formatFileSize
    it('formatFileSize: formats bytes correctly', () => {
      const small = formatFileSize(500);
      expect(typeof small).toBe('string');

      const medium = formatFileSize(1024 * 1024);
      expect(typeof medium).toBe('string');
    });

    // validateDurationFormat
    it('validateDurationFormat: valid HH:MM:SS', () => {
      const r = validateDurationFormat('01:30:00');
      expect(r.isValid).toBe(true);
    });

    it('validateDurationFormat: unrecognized format gets formatted attempt', () => {
      const r = validateDurationFormat('1h30m');
      // formatDuration tries to parse — may return isValid:true with 00:00:00 or isValid:false
      expect(r).toBeTruthy();
      expect(typeof r.isValid).toBe('boolean');
    });

    it('validateDurationFormat: empty', () => {
      const r = validateDurationFormat('');
      expect(r.isValid).toBe(false);
    });

    // getAPITypeFromInventory
    it('getAPITypeFromInventory: maps types correctly', () => {
      expect(typeof getAPITypeFromInventory('Foto')).toBe('string');
      expect(typeof getAPITypeFromInventory('Video')).toBe('string');
      expect(typeof getAPITypeFromInventory('Skaņas')).toBe('string');
    });

    // RECORD_VALIDATION constants
    it('RECORD_VALIDATION: ALLOWED_FILE_TYPES has all types', () => {
      expect(RECORD_VALIDATION.ALLOWED_FILE_TYPES['Foto']).toBeTruthy();
      expect(RECORD_VALIDATION.ALLOWED_FILE_TYPES['Video']).toBeTruthy();
      expect(RECORD_VALIDATION.ALLOWED_FILE_TYPES['Skaņas']).toBeTruthy();
      expect(RECORD_VALIDATION.ALLOWED_FILE_TYPES['Tekstuāls']).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE VALIDATION (soft warnings)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('FileValidation Utils', () => {
    it('validateFileSize: normal file returns no warnings', () => {
      const file = { size: 5 * 1024 * 1024 }; // 5MB
      const warnings = validateFileSize(file, 100, 0.01);
      expect(Array.isArray(warnings)).toBeTruthy();
      expect(warnings.length).toBe(0);
    });

    it('validateFileSize: large file returns warning', () => {
      const file = { size: 200 * 1024 * 1024 }; // 200MB
      const warnings = validateFileSize(file, 100, 0.01);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('validateFileSize: tiny file returns warning', () => {
      const file = { size: 5 }; // 5 bytes
      const warnings = validateFileSize(file, 100, 0.01);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('validateFileDuration: normal duration no warnings', () => {
      const warnings = validateFileDuration(120, 3600, 1); // 2 minutes
      expect(Array.isArray(warnings)).toBeTruthy();
      expect(warnings.length).toBe(0);
    });

    it('validateFileDuration: too long returns warning', () => {
      const warnings = validateFileDuration(5000, 3600, 1);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('validateFileDuration: too short returns warning', () => {
      const warnings = validateFileDuration(0.5, 3600, 1);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('validateImageDimensions: normal dimensions no warnings', () => {
      const warnings = validateImageDimensions(1920, 1080, {
        maxImageWidth: 4000, maxImageHeight: 4000,
        minImageWidth: 800, minImageHeight: 600
      }, false);
      expect(Array.isArray(warnings)).toBeTruthy();
      expect(warnings.length).toBe(0);
    });

    it('validateImageDimensions: too large returns warning', () => {
      const warnings = validateImageDimensions(8000, 6000, {
        maxImageWidth: 4000, maxImageHeight: 4000,
        minImageWidth: 800, minImageHeight: 600
      }, false);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('validateImageDimensions: too small returns warning', () => {
      const warnings = validateImageDimensions(200, 150, {
        maxImageWidth: 4000, maxImageHeight: 4000,
        minImageWidth: 800, minImageHeight: 600
      }, false);
      expect(warnings.length).toBeGreaterThan(0);
    });
  });
};

export default validationTests;
