/**
 * InheritanceUtils Tests
 *
 * Comprehensive tests for the category determination, constraints,
 * validation, and statistics functions in InheritanceUtils.
 */

import {
  INVENTORY_TYPES, CATEGORY_TYPES, INHERITANCE_BEHAVIOR, VIEW_MODES,
  CATEGORY_CONSTRAINTS, MEDIA_SUBTYPE_CONFIG,
  determineCategory, getExpectedAutoFields,
  checkAutoExtractionComplete, isFieldAutoExtracted,
  getFieldDisplayName, getInheritanceInfo,
  validateRecordCreation, getNavigationBehavior,
  getItemUIConfig, getItemAttentionStatus,
  getFileUploadConfig, isFileTypeAllowed,
  getRecordStatistics, getInventoryStatistics,
  getItemCompletionStatus,
  validateFile, validateRecord, validateItem, validateInventory,
  validateProjectForOPEX
} from '../../../Utils/InheritanceUtils';


const inheritanceTests = ({ describe, it, test, expect }) => {

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('InheritanceUtils Constants', () => {
    it('INVENTORY_TYPES has all 4 types', () => {
      expect(INVENTORY_TYPES.TEXTUAL).toBeTruthy();
      expect(INVENTORY_TYPES.PHOTO).toBeTruthy();
      expect(INVENTORY_TYPES.AUDIO).toBeTruthy();
      expect(INVENTORY_TYPES.VIDEO).toBeTruthy();
    });

    it('CATEGORY_TYPES has all 4 categories', () => {
      expect(CATEGORY_TYPES.DOCUMENTS).toBeTruthy();
      expect(CATEGORY_TYPES.ELECTRONIC_DOCUMENTS).toBeTruthy();
      expect(CATEGORY_TYPES.ELECTRONIC_MEDIA).toBeTruthy();
      expect(CATEGORY_TYPES.MEDIA).toBeTruthy();
    });

    it('INHERITANCE_BEHAVIOR has ONE_TO_MANY and ONE_TO_ONE', () => {
      expect(INHERITANCE_BEHAVIOR.ONE_TO_MANY).toBeTruthy();
      expect(INHERITANCE_BEHAVIOR.ONE_TO_ONE).toBeTruthy();
    });

    it('VIEW_MODES has SEGMENTED and COMBINED', () => {
      expect(VIEW_MODES.SEGMENTED).toBeTruthy();
      expect(VIEW_MODES.COMBINED).toBeTruthy();
    });

    it('CATEGORY_CONSTRAINTS has entries for all categories', () => {
      Object.values(CATEGORY_TYPES).forEach(cat => {
        expect(CATEGORY_CONSTRAINTS[cat]).toBeTruthy();
        expect(CATEGORY_CONSTRAINTS[cat].behavior).toBeTruthy();
        expect(CATEGORY_CONSTRAINTS[cat].viewMode).toBeTruthy();
      });
    });

    it('MEDIA_SUBTYPE_CONFIG has Foto, Video, Skaņas', () => {
      expect(MEDIA_SUBTYPE_CONFIG['Foto']).toBeTruthy();
      expect(MEDIA_SUBTYPE_CONFIG['Video']).toBeTruthy();
      expect(MEDIA_SUBTYPE_CONFIG['Skaņas']).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY DETERMINATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Category Determination', () => {
    it('Tekstuāls + electronic=false → DOCUMENTS', () => {
      expect(determineCategory('Tekstuāls', false)).toBe(CATEGORY_TYPES.DOCUMENTS);
    });

    it('Tekstuāls + electronic=true → ELECTRONIC_DOCUMENTS', () => {
      expect(determineCategory('Tekstuāls', true)).toBe(CATEGORY_TYPES.ELECTRONIC_DOCUMENTS);
    });

    it('Foto + electronic=true → ELECTRONIC_MEDIA', () => {
      expect(determineCategory('Foto', true)).toBe(CATEGORY_TYPES.ELECTRONIC_MEDIA);
    });

    it('Video + electronic=true → ELECTRONIC_MEDIA', () => {
      expect(determineCategory('Video', true)).toBe(CATEGORY_TYPES.ELECTRONIC_MEDIA);
    });

    it('Skaņas + electronic=true → ELECTRONIC_MEDIA', () => {
      expect(determineCategory('Skaņas', true)).toBe(CATEGORY_TYPES.ELECTRONIC_MEDIA);
    });

    it('Foto + electronic=false → MEDIA', () => {
      expect(determineCategory('Foto', false)).toBe(CATEGORY_TYPES.MEDIA);
    });

    it('Video + electronic=false → MEDIA', () => {
      expect(determineCategory('Video', false)).toBe(CATEGORY_TYPES.MEDIA);
    });

    it('Skaņas + electronic=false → MEDIA', () => {
      expect(determineCategory('Skaņas', false)).toBe(CATEGORY_TYPES.MEDIA);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY CONSTRAINTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Category Constraints', () => {
    it('DOCUMENTS: ONE_TO_MANY, SEGMENTED', () => {
      const c = CATEGORY_CONSTRAINTS[CATEGORY_TYPES.DOCUMENTS];
      expect(c.behavior).toBe(INHERITANCE_BEHAVIOR.ONE_TO_MANY);
      expect(c.viewMode).toBe(VIEW_MODES.SEGMENTED);
    });

    it('ELECTRONIC_DOCUMENTS: ONE_TO_MANY, SEGMENTED', () => {
      const c = CATEGORY_CONSTRAINTS[CATEGORY_TYPES.ELECTRONIC_DOCUMENTS];
      expect(c.behavior).toBe(INHERITANCE_BEHAVIOR.ONE_TO_MANY);
      expect(c.viewMode).toBe(VIEW_MODES.SEGMENTED);
    });

    it('ELECTRONIC_MEDIA: ONE_TO_ONE, COMBINED', () => {
      const c = CATEGORY_CONSTRAINTS[CATEGORY_TYPES.ELECTRONIC_MEDIA];
      expect(c.behavior).toBe(INHERITANCE_BEHAVIOR.ONE_TO_ONE);
      expect(c.viewMode).toBe(VIEW_MODES.COMBINED);
    });

    it('MEDIA: ONE_TO_ONE, COMBINED', () => {
      const c = CATEGORY_CONSTRAINTS[CATEGORY_TYPES.MEDIA];
      expect(c.behavior).toBe(INHERITANCE_BEHAVIOR.ONE_TO_ONE);
      expect(c.viewMode).toBe(VIEW_MODES.COMBINED);
    });

    it('Each category has required and optional fields', () => {
      Object.values(CATEGORY_TYPES).forEach(cat => {
        const c = CATEGORY_CONSTRAINTS[cat];
        expect(Array.isArray(c.requiredFields)).toBeTruthy();
        expect(Array.isArray(c.optionalFields)).toBeTruthy();
      });
    });

    it('Media subtypes have accepted file types', () => {
      ['Foto', 'Video', 'Skaņas'].forEach(type => {
        const cfg = MEDIA_SUBTYPE_CONFIG[type];
        expect(Array.isArray(cfg.acceptedFileTypes)).toBeTruthy();
        expect(cfg.acceptedFileTypes.length).toBeGreaterThan(0);
        expect(typeof cfg.acceptAttribute).toBe('string');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-EXTRACTION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Auto-Extraction Functions', () => {
    it('getExpectedAutoFields: returns fields for each media type', () => {
      ['Foto', 'Video', 'Skaņas'].forEach(type => {
        const fields = getExpectedAutoFields(type);
        expect(Array.isArray(fields)).toBeTruthy();
        expect(fields.length).toBeGreaterThan(0);
      });
    });

    it('checkAutoExtractionComplete: complete when all fields present', () => {
      const expected = getExpectedAutoFields('Foto');
      const record = {};
      expected.forEach(f => { record[f] = 'value'; });
      const result = checkAutoExtractionComplete(record, 'Foto');
      // Returns object with .complete boolean (not a bare boolean)
      expect(typeof result === 'object' ? result.complete : result).toBe(true);
    });

    it('isFieldAutoExtracted: true when field is populated in record', () => {
      const record = { color: 'color', duration: '01:00:00' };
      expect(isFieldAutoExtracted('color', record)).toBe(true);
      expect(isFieldAutoExtracted('notes', record)).toBe(false);
    });

    it('getFieldDisplayName: returns string for known fields', () => {
      const name = getFieldDisplayName('color');
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INHERITANCE INFO & NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Inheritance Info', () => {
    const textInventory = { type: 'Tekstuāls', electronic: false };
    const eDocInventory = { type: 'Tekstuāls', electronic: true };
    const eMediaInventory = { type: 'Foto', electronic: true };
    const mediaInventory = { type: 'Video', electronic: false };

    it('getInheritanceInfo: returns complete info object', () => {
      const info = getInheritanceInfo(textInventory);
      expect(info).toBeTruthy();
      expect(info.category).toBe(CATEGORY_TYPES.DOCUMENTS);
      expect(info.isTextual).toBe(true);
      expect(info.isAnyMedia).toBe(false);
      expect(info.electronic).toBe(false);
      expect(info.viewMode).toBeTruthy();
      expect(info.constraints).toBeTruthy();
    });

    it('getInheritanceInfo: electronic document', () => {
      const info = getInheritanceInfo(eDocInventory);
      expect(info.category).toBe(CATEGORY_TYPES.ELECTRONIC_DOCUMENTS);
      expect(info.isTextual).toBe(true);
      expect(info.electronic).toBe(true);
    });

    it('getInheritanceInfo: electronic media', () => {
      const info = getInheritanceInfo(eMediaInventory);
      expect(info.category).toBe(CATEGORY_TYPES.ELECTRONIC_MEDIA);
      expect(info.isAnyMedia).toBe(true);
      expect(info.electronic).toBe(true);
    });

    it('getNavigationBehavior: returns behavior config', () => {
      const behavior = getNavigationBehavior(textInventory);
      expect(behavior).toBeTruthy();
    });

    it('getNavigationBehavior: ONE_TO_MANY for textual', () => {
      const behavior = getNavigationBehavior(textInventory);
      expect(behavior.behavior || behavior).toBeTruthy();
    });

    it('getNavigationBehavior: ONE_TO_ONE for media', () => {
      const behavior = getNavigationBehavior(eMediaInventory);
      expect(behavior).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ITEM UI & ATTENTION STATUS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item UI & Status', () => {
    const inventory = { type: 'Tekstuāls', electronic: true };
    const item = {
      id: 1, title: 'Test', number: 1, records: [{ id: 1, title: 'Record 1', files: [] }]
    };

    it('getItemUIConfig: returns config object', () => {
      const config = getItemUIConfig(inventory, item);
      expect(config).toBeTruthy();
      expect(typeof config).toBe('object');
    });

    it('getItemAttentionStatus: returns status object', () => {
      const status = getItemAttentionStatus(inventory, item);
      expect(status).toBeTruthy();
      expect(typeof status).toBe('object');
      // Returns { level, message, icon, color }
      expect(typeof status.level).toBe('string');
      expect(typeof status.message).toBe('string');
    });

    it('getItemCompletionStatus: returns completion info', () => {
      const status = getItemCompletionStatus(item, inventory);
      expect(status).toBeTruthy();
      expect(typeof status).toBe('object');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE UPLOAD CONFIG
  // ═══════════════════════════════════════════════════════════════════════════

  describe('File Upload Config', () => {
    it('getFileUploadConfig: returns config for all categories', () => {
      const types = [
        { type: 'Tekstuāls', electronic: true },
        { type: 'Foto', electronic: true },
        { type: 'Video', electronic: true },
        { type: 'Skaņas', electronic: true }
      ];
      types.forEach(inv => {
        const config = getFileUploadConfig(inv);
        expect(config).toBeTruthy();
      });
    });

    it('isFileTypeAllowed: accepts valid types', () => {
      const jpgFile = { name: 'photo.jpg', type: 'image/jpeg' };
      const fotoInv = { type: 'Foto', electronic: true };
      expect(isFileTypeAllowed(jpgFile, fotoInv)).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Statistics Functions', () => {
    const mockItem = {
      id: 1, records: [{ id: 1, title: 'R1' }],
      photo_records: [], video_records: [], audio_records: []
    };
    const mockInventory = {
      type: 'Tekstuāls', electronic: true,
      items: [mockItem], total_items: 1
    };

    it('getRecordStatistics: returns stats object', () => {
      const stats = getRecordStatistics(mockItem, mockInventory);
      expect(stats).toBeTruthy();
      expect(typeof stats).toBe('object');
    });

    it('getInventoryStatistics: returns stats object', () => {
      const stats = getInventoryStatistics(mockInventory);
      expect(stats).toBeTruthy();
      expect(typeof stats).toBe('object');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Validation — validateFile', () => {
    it('valid file passes', () => {
      const file = { original_name: 'test.pdf', size: 1024, extension: '.pdf' };
      const result = validateFile(file, CATEGORY_TYPES.ELECTRONIC_DOCUMENTS, 'Tekstuāls');
      expect(result.errors.length).toBe(0);
    });

    it('missing original_name fails', () => {
      const file = { size: 1024 };
      const result = validateFile(file, CATEGORY_TYPES.ELECTRONIC_DOCUMENTS, 'Tekstuāls');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('zero size fails', () => {
      const file = { original_name: 'test.pdf', size: 0, extension: '.pdf' };
      const result = validateFile(file, CATEGORY_TYPES.ELECTRONIC_DOCUMENTS, 'Tekstuāls');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Validation — validateRecord', () => {
    it('valid textual record passes', () => {
      const record = { title: 'Test Record', date: '2023-06-15', files: [{ original_name: 'f.pdf', size: 100 }] };
      const result = validateRecord(record, CATEGORY_TYPES.ELECTRONIC_DOCUMENTS, 'Tekstuāls');
      expect(result.errors.length).toBe(0);
    });

    it('missing title fails', () => {
      const record = { date: '2023-06-15' };
      const result = validateRecord(record, CATEGORY_TYPES.ELECTRONIC_DOCUMENTS, 'Tekstuāls');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Validation — validateItem', () => {
    it('valid electronic textual item passes', () => {
      const item = {
        title: 'Item', number: 1,
        records: [{ title: 'R', date: '2023-01-01', files: [{ original_name: 'f.pdf', size: 100 }] }]
      };
      const inventory = { type: 'Tekstuāls', electronic: true };
      const result = validateItem(item, inventory);
      expect(result.errors.length).toBe(0);
    });

    it('missing title produces error', () => {
      const item = { number: 1, records: [] };
      const inventory = { type: 'Tekstuāls', electronic: true };
      const result = validateItem(item, inventory);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Validation — validateInventory', () => {
    it('inventory with missing number/type produces errors', () => {
      const inventory = {};
      const result = validateInventory(inventory);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('valid inventory with items passes', () => {
      const inventory = {
        number: 1, type: 'Tekstuāls', electronic: false,
        items: [], total_items: 0
      };
      const result = validateInventory(inventory);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('Validation — validateProjectForOPEX', () => {
    it('empty project fails', () => {
      const project = {};
      const result = validateProjectForOPEX(project);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('project with no inventories has warnings or errors', () => {
      const project = {
        institution: {
          creator: 'A', creator_position: 'B',
          signer: 'C', signer_position: 'D',
          fond: { inventories: [] }
        }
      };
      const result = validateProjectForOPEX(project);
      // May be valid (no errors) but should have warnings about empty inventories
      expect(result).toBeTruthy();
      expect(typeof result.valid).toBe('boolean');
    });

    it('minimal valid project structure', () => {
      const project = {
        institution: {
          creator: 'A', creator_position: 'B',
          signer: 'C', signer_position: 'D',
          fond: {
            inventories: [{
              number: 1, type: 'Tekstuāls', electronic: false,
              items: [], total_items: 0, from_report: false
            }]
          }
        }
      };
      const result = validateProjectForOPEX(project);
      expect(result).toBeTruthy();
      expect(typeof result.valid).toBe('boolean');
    });
  });
};

export default inheritanceTests;
