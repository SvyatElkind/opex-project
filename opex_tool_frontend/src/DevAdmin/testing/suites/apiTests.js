/**
 * API Module Tests
 *
 * Tests all 6 API modules: Project, Institution, Inventory, Item, Record, Constants
 * Tests against the live backend API.
 */

import Project_API from '../../../API/Project_API';
import Institution_API from '../../../API/Institution_API';
import Inventory_API from '../../../API/Inventory_API';
import Item_API from '../../../API/Item_API';
import Record_API from '../../../API/Record_API';
import { fetchConstants, getConstants, getConstantByPath, clearConstantsCache,
         isConstantsLoaded, getInventoryTypes, getStorageTerms, getDateIndicators,
         getUnitsOfMeasure, getRestrictions, getSecurityLevels, getAccessRestrictions
       } from '../../../API/Constants_API';

const apiTests = ({ describe, it, test, expect }) => {

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECT API
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Project_API', () => {
    const api = Project_API();

    it('should be a factory that returns an object with methods', () => {
      expect(api).toBeTruthy();
      expect(typeof api.connect_api).toBe('function');
      expect(typeof api.create_project).toBe('function');
      expect(typeof api.delete_project).toBe('function');
      expect(typeof api.rename_project).toBe('function');
      expect(typeof api.get_project).toBe('function');
      expect(typeof api.uploadFileAsAttachment).toBe('function');
    });

    it('connect_api should return [boolean, data] tuple', async () => {
      const result = await api.connect_api();
      expect(Array.isArray(result)).toBeTruthy();
      expect(result).toHaveLength(2);
      expect(typeof result[0]).toBe('boolean');
    });

    it('connect_api should successfully connect to API', async () => {
      const [success, data] = await api.connect_api();
      expect(success).toBe(true);
      expect(Array.isArray(data)).toBeTruthy();
    });

    it('get_project with invalid ID should return failure', async () => {
      const [success] = await api.get_project('nonexistent-id-99999');
      expect(success).toBe(false);
    });

    it('create_project should require valid data', async () => {
      const [success, error] = await api.create_project({});
      expect(success).toBe(false);
    });

    it('delete_project with invalid ID should return failure', async () => {
      const [success] = await api.delete_project('nonexistent-id-99999');
      expect(success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INSTITUTION API
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Institution_API', () => {
    const api = Institution_API();

    it('should be a factory that returns an object with methods', () => {
      expect(api).toBeTruthy();
      expect(typeof api.addSigners).toBe('function');
      expect(typeof api.updateSignerField).toBe('function');
    });

    it('addSigners with invalid IDs should return failure', async () => {
      const [success] = await api.addSigners('fake-project', 'fake-institution', {});
      expect(success).toBe(false);
    });

    it('updateSignerField with invalid IDs should return failure', async () => {
      const [success] = await api.updateSignerField('fake-project', 'fake-institution', {
        creator: 'Test', creator_position: 'Test', signer: 'Test', signer_position: 'Test'
      });
      expect(success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INVENTORY API
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Inventory_API', () => {
    const api = Inventory_API();

    it('should be a factory that returns an object with methods', () => {
      expect(api).toBeTruthy();
      expect(typeof api.createInventory).toBe('function');
      expect(typeof api.updateInventory).toBe('function');
      expect(typeof api.deleteInventory).toBe('function');
    });

    it('createInventory with invalid project should return failure', async () => {
      const [success] = await api.createInventory('fake-project', 'fake-fond', {
        type: 'Tekstuāls', number: 1
      });
      expect(success).toBe(false);
    });

    it('deleteInventory with invalid IDs should return failure', async () => {
      const [success] = await api.deleteInventory('fake-project', 'fake-inventory');
      expect(success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ITEM API
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Item_API', () => {
    const api = Item_API();

    it('should be a factory that returns an object with methods', () => {
      expect(api).toBeTruthy();
      expect(typeof api.createItem).toBe('function');
      expect(typeof api.updateItem).toBe('function');
      expect(typeof api.deleteItem).toBe('function');
    });

    it('createItem with invalid project should return failure', async () => {
      const [success] = await api.createItem({ title: 'Test' }, 'fake-project', 'fake-inventory');
      expect(success).toBe(false);
    });

    it('deleteItem with invalid IDs should return failure', async () => {
      const [success] = await api.deleteItem('fake-project', 'fake-item');
      expect(success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORD API
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Record_API', () => {
    const api = Record_API();

    it('should be a factory that returns an object with all methods', () => {
      expect(api).toBeTruthy();
      // Textual record CRUD
      expect(typeof api.createRecord).toBe('function');
      expect(typeof api.getRecord).toBe('function');
      expect(typeof api.updateRecord).toBe('function');
      expect(typeof api.deleteRecord).toBe('function');
      // Media record CRUD
      expect(typeof api.createMediaRecord).toBe('function');
      expect(typeof api.updateMediaRecord).toBe('function');
      expect(typeof api.deleteMediaRecord).toBe('function');
      // File operations
      expect(typeof api.uploadMultipleFiles).toBe('function');
      expect(typeof api.deleteFile).toBe('function');
      // Metadata operations
      expect(typeof api.addMetadata).toBe('function');
      expect(typeof api.updateMetadata).toBe('function');
      expect(typeof api.deleteMetadata).toBe('function');
    });

    it('should expose validateMediaRecordData utility', () => {
      expect(typeof api.validateMediaRecordData).toBe('function');
    });

    it('validateMediaRecordData should validate photo fields (format only)', () => {
      // Record_API validates format, not required fields — empty data passes
      const result = api.validateMediaRecordData({}, 'Foto');
      expect(result.isValid).toBe(true);

      // Invalid format should fail
      const badResult = api.validateMediaRecordData({ color: 'neon' }, 'Foto');
      expect(badResult.isValid).toBe(false);
    });

    it('validateMediaRecordData should validate video fields', () => {
      const result = api.validateMediaRecordData({
        color: 'color', duration: '01:30:00',
        horizontal_resolution: 1920, vertical_resolution: 1080
      }, 'Video');
      expect(result.isValid).toBe(true);
    });

    it('validateMediaRecordData should validate audio fields', () => {
      // Record_API uses 'Audio' not 'Skaņas'
      const resultValid = api.validateMediaRecordData({ duration: '00:05:30' }, 'Audio');
      expect(resultValid.isValid).toBe(true);

      const resultInvalid = api.validateMediaRecordData({ duration: 'bad' }, 'Audio');
      expect(resultInvalid.isValid).toBe(false);
    });

    it('getRecord with invalid IDs should return failure', async () => {
      const [success] = await api.getRecord('fake-project', 'fake-record');
      expect(success).toBe(false);
    });

    it('createRecord with invalid project should return failure', async () => {
      const [success] = await api.createRecord({ title: 'Test' }, 'fake-project', 'fake-item');
      expect(success).toBe(false);
    });

    it('deleteRecord with invalid IDs should return failure', async () => {
      const [success] = await api.deleteRecord('fake-project', 'fake-record');
      expect(success).toBe(false);
    });

    it('should expose buildAPIURL helper', () => {
      expect(api.buildAPIURL).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTANTS API
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Constants_API', () => {
    it('fetchConstants should return an object', async () => {
      const result = await fetchConstants();
      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
    });

    it('getConstants should return cached or fallback data', () => {
      const result = getConstants();
      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
    });

    it('getConstantByPath should return array for valid path', () => {
      const types = getConstantByPath('inventory.type');
      expect(Array.isArray(types)).toBeTruthy();
    });

    it('getInventoryTypes should return array of type strings', () => {
      const types = getInventoryTypes();
      expect(Array.isArray(types)).toBeTruthy();
      expect(types.length).toBeGreaterThan(0);
    });

    it('getStorageTerms should return array', () => {
      const terms = getStorageTerms();
      expect(Array.isArray(terms)).toBeTruthy();
      expect(terms.length).toBeGreaterThan(0);
    });

    it('getDateIndicators should return array', () => {
      const indicators = getDateIndicators();
      expect(Array.isArray(indicators)).toBeTruthy();
    });

    it('getUnitsOfMeasure should return array', () => {
      const units = getUnitsOfMeasure();
      expect(Array.isArray(units)).toBeTruthy();
    });

    it('getRestrictions should return array', () => {
      const restrictions = getRestrictions();
      expect(Array.isArray(restrictions)).toBeTruthy();
    });

    it('getSecurityLevels should return array', () => {
      const levels = getSecurityLevels();
      expect(Array.isArray(levels)).toBeTruthy();
    });

    it('getAccessRestrictions should return array', () => {
      const restrictions = getAccessRestrictions();
      expect(Array.isArray(restrictions)).toBeTruthy();
    });

    it('clearConstantsCache should clear without errors', () => {
      clearConstantsCache();
      expect(isConstantsLoaded()).toBe(false);
    });

    it('isConstantsLoaded should return boolean', () => {
      const loaded = isConstantsLoaded();
      expect(typeof loaded).toBe('boolean');
    });
  });
};

export default apiTests;
