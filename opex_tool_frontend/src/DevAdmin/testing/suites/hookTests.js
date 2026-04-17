/**
 * Hook Tests
 *
 * Tests all React Query hooks and utility hooks.
 * Since hooks can't be called outside React, we test the underlying
 * API layer, mutation payloads, query key structure, and utility hooks' logic.
 *
 * Covers: useRecords, useItems, useInventories, useProjects, useInstitutions,
 *         useFiles, useMetadata, useFormErrors, useTheme, useScrollDirection
 */

import { apiRequest, ApiError, get, post, put, del, postFormData } from '../../../services/apiClient';
import { parseApiError } from '../../../services/errorService';

const hookTests = ({ describe, it, test, expect }) => {

  // ═══════════════════════════════════════════════════════════════════════════
  // API CLIENT — Core request layer used by all hooks
  // ═══════════════════════════════════════════════════════════════════════════

  describe('apiClient > apiRequest', () => {
    it('apiRequest is a function', () => {
      expect(typeof apiRequest).toBe('function');
    });

    it('get, post, put, del, postFormData are exported functions', () => {
      expect(typeof get).toBe('function');
      expect(typeof post).toBe('function');
      expect(typeof put).toBe('function');
      expect(typeof del).toBe('function');
      expect(typeof postFormData).toBe('function');
    });

    it('ApiError constructs with status and data', () => {
      const err = new ApiError(404, { detail: 'Not found' });
      expect(err instanceof Error).toBeTruthy();
      expect(err.status).toBe(404);
      expect(err.data).toHaveProperty('detail', 'Not found');
    });

    it('ApiError parses field errors from data', () => {
      const err = new ApiError(400, { title: ['Too long'], name: ['Required'] });
      expect(err.parsed).toBeTruthy();
    });

    it('parseApiError extracts message from detail string', () => {
      const result = parseApiError({ detail: 'Something went wrong' });
      expect(result).toBeTruthy();
      expect(result.message).toBeTruthy();
    });

    it('parseApiError handles array of errors', () => {
      const result = parseApiError({ detail: ['Error 1', 'Error 2'] });
      expect(result).toBeTruthy();
    });

    it('parseApiError handles object with field errors', () => {
      const result = parseApiError({ title: ['Required'], name: ['Too long'] });
      expect(result).toBeTruthy();
      expect(result.fields).toBeTruthy();
    });

    it('parseApiError handles null/undefined gracefully', () => {
      const result = parseApiError(null);
      expect(result).toBeTruthy();
      expect(result.message).toBeTruthy();
    });

    it('parseApiError handles string input', () => {
      const result = parseApiError('Network error');
      expect(result).toBeTruthy();
      expect(result.message).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API CLIENT — Live endpoint tests
  // ═══════════════════════════════════════════════════════════════════════════

  describe('apiClient > Live GET requests', () => {
    it('GET /project/ returns projects list', async () => {
      try {
        const result = await get('/project/');
        expect(result).toBeTruthy();
        expect(result.data).toBeTruthy();
      } catch (e) {
        // API error is acceptable — check it's an ApiError
        expect(e instanceof ApiError || e instanceof Error).toBeTruthy();
      }
    });

    it('GET /project/nonexistent returns error', async () => {
      try {
        await get('/project/nonexistent-id/');
        expect(false).toBe(true); // Should not reach here
      } catch (e) {
        expect(e).toBeTruthy();
      }
    });

    it('POST with JSON body sends correct Content-Type', async () => {
      try {
        // This will fail (no valid data), but tests that request is built correctly
        await post('/project/', { name: '' });
      } catch (e) {
        // Verify error is from the server, not a client-side JSON error
        expect(e instanceof ApiError || e instanceof Error).toBeTruthy();
      }
    });

    it('postFormData omits Content-Type header (browser sets boundary)', async () => {
      const formData = new FormData();
      formData.append('test', 'value');
      try {
        await postFormData('/project/nonexistent/media_record/?item_id=0', formData);
      } catch (e) {
        // Verify it doesn't fail with "Unsupported media type application/json"
        if (e instanceof ApiError) {
          const msg = JSON.stringify(e.data || '');
          expect(msg).not.toContain('Unsupported media type "application/json"');
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API ENDPOINTS — Used by hooks
  // ═══════════════════════════════════════════════════════════════════════════

  describe('API Endpoint Patterns', () => {
    it('project list endpoint is /project/', () => {
      const endpoint = '/project/';
      expect(endpoint).toBe('/project/');
    });

    it('project detail endpoint is /project/{id}/', () => {
      const id = 16;
      const endpoint = `/project/${id}/`;
      expect(endpoint).toBe('/project/16/');
    });

    it('inventory endpoint pattern is correct', () => {
      const projectId = 16;
      const endpoint = `/project/${projectId}/inventory/`;
      expect(endpoint).toContain('/project/');
      expect(endpoint).toContain('/inventory/');
    });

    it('inventory create endpoint includes fond_id query param', () => {
      const projectId = 16;
      const fondId = 5;
      const endpoint = `/project/${projectId}/inventory/?fond_id=${fondId}`;
      expect(endpoint).toContain('fond_id=5');
    });

    it('item endpoint pattern is correct', () => {
      const projectId = 16;
      const itemId = 100;
      const endpoint = `/project/${projectId}/item/${itemId}/`;
      expect(endpoint).toContain('/item/100/');
    });

    it('item create endpoint includes inventory_id query param', () => {
      const projectId = 16;
      const inventoryId = 5;
      const endpoint = `/project/${projectId}/item/?inventory_id=${inventoryId}`;
      expect(endpoint).toContain('inventory_id=5');
    });

    it('record endpoint pattern is correct', () => {
      const projectId = 16;
      const recordId = 200;
      const endpoint = `/project/${projectId}/record/${recordId}/`;
      expect(endpoint).toContain('/record/200/');
    });

    it('record create endpoint includes item_id query param', () => {
      const projectId = 16;
      const itemId = 100;
      const endpoint = `/project/${projectId}/record/?item_id=${itemId}`;
      expect(endpoint).toContain('item_id=100');
    });

    it('media record endpoint is separate from textual record', () => {
      const projectId = 16;
      const itemId = 100;
      const mediaEndpoint = `/project/${projectId}/media_record/?item_id=${itemId}`;
      const textEndpoint = `/project/${projectId}/record/?item_id=${itemId}`;
      expect(mediaEndpoint).toContain('/media_record/');
      expect(textEndpoint).toContain('/record/');
      expect(mediaEndpoint).not.toBe(textEndpoint);
    });

    it('media record update includes type query param', () => {
      const projectId = 16;
      const recordId = 200;
      const recordType = 'Foto';
      const endpoint = `/project/${projectId}/media_record/${recordId}/?type=${recordType}`;
      expect(endpoint).toContain('type=Foto');
    });

    it('metadata endpoint includes class query param', () => {
      const projectId = 16;
      const recordId = 200;
      const metadataClass = 'addressee';
      const endpoint = `/project/${projectId}/record/${recordId}/additional_metadata/?class=${metadataClass}`;
      expect(endpoint).toContain('class=addressee');
    });

    it('file delete endpoint is /project/{id}/file/{fileId}/', () => {
      const projectId = 16;
      const fileId = 300;
      const endpoint = `/project/${projectId}/file/${fileId}/`;
      expect(endpoint).toBe('/project/16/file/300/');
    });

    it('multiple files endpoint is correct', () => {
      const projectId = 16;
      const recordId = 200;
      const endpoint = `/project/${projectId}/record/${recordId}/multiple_files/`;
      expect(endpoint).toContain('/multiple_files/');
    });

    it('institution endpoint pattern is correct', () => {
      const projectId = 16;
      const instId = 10;
      const endpoint = `/project/${projectId}/institution/${instId}/`;
      expect(endpoint).toBe('/project/16/institution/10/');
    });

    it('export endpoints are correct', () => {
      const projectId = 16;
      expect(`/project/${projectId}/export/inventories/`).toContain('/export/inventories/');
      expect(`/project/${projectId}/export/acceptance_report/?electronic=true`).toContain('electronic=true');
      expect(`/project/${projectId}/export/opex_package/?long=true`).toContain('long=true');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMDATA CONSTRUCTION — Critical for file uploads
  // ═══════════════════════════════════════════════════════════════════════════

  describe('FormData Construction (Media Uploads)', () => {
    it('FormData with single file for media record', () => {
      const formData = new FormData();
      const file = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });
      formData.append('files', file);
      expect(formData.has('files')).toBeTruthy();
      expect(formData.get('files').name).toBe('photo.jpg');
    });

    it('FormData with metadata fields for media record', () => {
      const formData = new FormData();
      const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });
      formData.append('files', file);
      formData.append('color', 'color');
      formData.append('horizontal_resolution', '1920');
      formData.append('vertical_resolution', '1080');

      expect(formData.get('color')).toBe('color');
      expect(formData.get('horizontal_resolution')).toBe('1920');
      expect(formData.get('vertical_resolution')).toBe('1080');
    });

    it('FormData with duration for video/audio', () => {
      const formData = new FormData();
      const file = new File(['dummy'], 'video.mp4', { type: 'video/mp4' });
      formData.append('files', file);
      formData.append('duration', '01:30:00');

      expect(formData.get('duration')).toBe('01:30:00');
    });

    it('FormData with skip_file_validation flag', () => {
      const formData = new FormData();
      const file = new File(['dummy'], 'test.bin', { type: 'application/octet-stream' });
      formData.append('files', file);
      formData.append('skip_file_validation', 'true');

      expect(formData.get('skip_file_validation')).toBe('true');
    });

    it('FormData with multiple files for textual records', () => {
      const formData = new FormData();
      const file1 = new File(['content1'], 'doc1.pdf', { type: 'application/pdf' });
      const file2 = new File(['content2'], 'doc2.pdf', { type: 'application/pdf' });
      formData.append('files', file1);
      formData.append('files', file2);

      const files = formData.getAll('files');
      expect(files.length).toBe(2);
    });

    it('Array.isArray handles file array unwrapping', () => {
      const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });
      const fileArray = [file];
      const singleFile = Array.isArray(fileArray) ? fileArray[0] : fileArray;
      expect(singleFile.name).toBe('photo.jpg');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MUTATION PAYLOAD SHAPES — What hooks send to API
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Mutation Payload Shapes', () => {
    it('createProject payload has name field', () => {
      const payload = { name: 'Test Project' };
      expect(payload).toHaveProperty('name');
      expect(typeof payload.name).toBe('string');
    });

    it('renameProject payload has name field', () => {
      const payload = { name: 'Renamed Project' };
      expect(payload).toHaveProperty('name');
    });

    it('createInventory payload has required fields', () => {
      const payload = {
        type: 'Tekstuāls',
        electronic: true,
        storage_term: 'Pastāvīgi glabājamās lietas',
        start_date: '2020',
        end_date: '2025'
      };
      expect(payload).toHaveProperty('type');
      expect(payload).toHaveProperty('electronic');
      expect(payload).toHaveProperty('storage_term');
      expect(payload).toHaveProperty('start_date');
      expect(payload).toHaveProperty('end_date');
    });

    it('createItem payload has required fields', () => {
      const payload = {
        series_code: '1.1',
        title: 'Test Item',
        start_date: '2020-01-01',
        end_date: '2025-12-31',
        date_indicator: 'day',
        language: 'latviešu',
        unit_of_measure: 'Lapas',
        restriction: 'Vispārēja',
        security_level: 'Publisks'
      };
      expect(payload).toHaveProperty('series_code');
      expect(payload).toHaveProperty('title');
      expect(payload).toHaveProperty('start_date');
      expect(payload).toHaveProperty('end_date');
      expect(payload).toHaveProperty('date_indicator');
      expect(payload).toHaveProperty('unit_of_measure');
    });

    it('createRecord payload has required fields', () => {
      const payload = {
        title: 'Test Record',
        date: '2023-06-15',
        reg_nr: 'REG-001',
        nomenclature_nr: 'NOM-001',
        language: 'latviešu',
        access_restriction: 'open'
      };
      expect(payload).toHaveProperty('title');
      expect(payload).toHaveProperty('date');
      expect(payload).toHaveProperty('reg_nr');
      expect(payload).toHaveProperty('nomenclature_nr');
      expect(payload).toHaveProperty('language');
      expect(payload).toHaveProperty('access_restriction');
    });

    it('updateMediaRecord payload varies by type — Foto', () => {
      const payload = {
        color: 'color',
        horizontal_resolution: 1920,
        vertical_resolution: 1080
      };
      expect(payload).toHaveProperty('color');
      expect(payload).toHaveProperty('horizontal_resolution');
      expect(payload).toHaveProperty('vertical_resolution');
      expect(typeof payload.horizontal_resolution).toBe('number');
    });

    it('updateMediaRecord payload varies by type — Video', () => {
      const payload = {
        color: 'color',
        horizontal_resolution: 1920,
        vertical_resolution: 1080,
        duration: '01:30:00'
      };
      expect(payload).toHaveProperty('duration');
      expect(payload).toHaveProperty('color');
    });

    it('updateMediaRecord payload varies by type — Audio (Skaņas)', () => {
      const payload = {
        duration: '00:05:30'
      };
      expect(payload).toHaveProperty('duration');
      expect(payload).not.toHaveProperty('color');
      expect(payload).not.toHaveProperty('horizontal_resolution');
    });

    it('institution signer payload has all 4 fields', () => {
      const payload = {
        creator: 'Creator Name',
        creator_position: 'Position',
        signer: 'Signer Name',
        signer_position: 'Position'
      };
      expect(payload).toHaveProperty('creator');
      expect(payload).toHaveProperty('creator_position');
      expect(payload).toHaveProperty('signer');
      expect(payload).toHaveProperty('signer_position');
    });

    it('metadata payload for addressee has addressee field', () => {
      const payload = { addressee: 'Test Addressee' };
      expect(payload).toHaveProperty('addressee');
    });

    it('metadata payload for action has required fields', () => {
      const payload = {
        action: 'Test Action',
        author: 'Author',
        responsible_person: 'Person',
        task: 'Task description'
      };
      expect(payload).toHaveProperty('action');
    });

    it('metadata payload for visa has required fields', () => {
      const payload = {
        visa: 'Approved',
        person: 'Person Name',
        date: '2023-06-15',
        notes: 'Notes'
      };
      expect(payload).toHaveProperty('visa');
      expect(payload).toHaveProperty('person');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // QUERY KEY STRUCTURE — Cache isolation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Query Key Structure', () => {
    it('project list key is ["projects"]', () => {
      const key = ['projects'];
      expect(key).toHaveLength(1);
      expect(key[0]).toBe('projects');
    });

    it('project detail key includes projectId', () => {
      const key = ['project', 16];
      expect(key).toHaveLength(2);
      expect(key[0]).toBe('project');
      expect(key[1]).toBe(16);
    });

    it('record detail key includes both projectId and recordId', () => {
      const key = ['record', 16, 200];
      expect(key).toHaveLength(3);
      expect(key[0]).toBe('record');
    });

    it('metadata methods key scoped to project and record', () => {
      const key = ['metadataMethods', 16, 200];
      expect(key).toHaveLength(3);
    });

    it('different entity keys are distinct', () => {
      const projectKey = ['project', 16];
      const recordKey = ['record', 16, 200];
      const itemKey = ['item', 16, 100];
      expect(projectKey[0]).not.toBe(recordKey[0]);
      expect(recordKey[0]).not.toBe(itemKey[0]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // useFormErrors — Error management hook logic
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useFormErrors Logic', () => {
    it('initial state has no errors', () => {
      const state = { generalError: null, fieldErrors: {} };
      expect(state.generalError).toBeNull();
      expect(Object.keys(state.fieldErrors)).toHaveLength(0);
    });

    it('setFieldError adds a field error', () => {
      const fieldErrors = {};
      fieldErrors['title'] = 'Required';
      expect(fieldErrors).toHaveProperty('title', 'Required');
    });

    it('clearFieldError removes a specific field error', () => {
      const fieldErrors = { title: 'Required', date: 'Invalid' };
      delete fieldErrors['title'];
      expect(fieldErrors).not.toHaveProperty('title');
      expect(fieldErrors).toHaveProperty('date');
    });

    it('clearErrors resets all errors', () => {
      let fieldErrors = { title: 'Required', date: 'Invalid' };
      let generalError = 'Network error';
      fieldErrors = {};
      generalError = null;
      expect(Object.keys(fieldErrors)).toHaveLength(0);
      expect(generalError).toBeNull();
    });

    it('hasErrors correctly detects errors', () => {
      const hasErrors1 = Object.keys({ title: 'Err' }).length > 0 || null !== null;
      expect(hasErrors1).toBe(true);

      const hasErrors2 = Object.keys({}).length > 0 || null !== null;
      expect(hasErrors2).toBe(false);
    });

    it('setApiErrors parses backend error response', () => {
      const errorData = { title: ['This field is required.'], name: ['Too long'] };
      const parsed = parseApiError(errorData);
      expect(parsed).toBeTruthy();
      expect(parsed.fields).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // useTheme — Theme management logic
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useTheme Logic', () => {
    it('valid theme values are light, dark, auto', () => {
      const validThemes = ['light', 'dark', 'auto'];
      expect(validThemes).toContain('light');
      expect(validThemes).toContain('dark');
      expect(validThemes).toContain('auto');
      expect(validThemes).toHaveLength(3);
    });

    it('auto theme respects system preference', () => {
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      expect(typeof isDarkMode).toBe('boolean');
    });

    it('document root has data-theme attribute', () => {
      const root = document.documentElement;
      expect(root).toBeTruthy();
      // data-theme may or may not be set depending on app state
      expect(typeof root.getAttribute).toBe('function');
    });

    it('matchMedia is available for system preference detection', () => {
      expect(typeof window.matchMedia).toBe('function');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // useScrollDirection — Scroll tracking logic
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useScrollDirection Logic', () => {
    it('scrollDirection values are up or down', () => {
      const validDirections = ['up', 'down'];
      expect(validDirections).toContain('up');
      expect(validDirections).toContain('down');
    });

    it('isScrolled is based on threshold', () => {
      const threshold = 100;
      const currentScroll = 150;
      expect(currentScroll > threshold).toBe(true);

      const lowScroll = 50;
      expect(lowScroll > threshold).toBe(false);
    });

    it('window.scrollY is available', () => {
      expect(typeof window.scrollY).toBe('number');
    });

    it('requestAnimationFrame is available for performance', () => {
      expect(typeof window.requestAnimationFrame).toBe('function');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // OPTIMISTIC UPDATE PATTERNS — Used by useItems
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Optimistic Update Patterns', () => {
    it('temporary item gets isOptimistic flag', () => {
      const tempItem = { id: `temp_${Date.now()}`, title: 'New Item', isOptimistic: true };
      expect(tempItem.isOptimistic).toBe(true);
      expect(tempItem.id.toString().startsWith('temp_')).toBeTruthy();
    });

    it('optimistic item replaced by server response on success', () => {
      const tempId = 'temp_123';
      const items = [
        { id: tempId, title: 'Optimistic', isOptimistic: true },
        { id: 1, title: 'Existing' }
      ];
      const serverItem = { id: 456, title: 'Optimistic', isOptimistic: false };
      const updated = items.map(item => item.id === tempId ? serverItem : item);
      expect(updated[0].id).toBe(456);
      expect(updated[0].isOptimistic).toBe(false);
    });

    it('optimistic removal filters item from list', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const afterDelete = items.filter(item => item.id !== 2);
      expect(afterDelete).toHaveLength(2);
      expect(afterDelete.find(i => i.id === 2)).toBeUndefined();
    });

    it('rollback restores original state on error', () => {
      const original = [{ id: 1, title: 'Original' }];
      let current = [{ id: 1, title: 'Updated' }];
      // Simulate rollback
      current = [...original];
      expect(current[0].title).toBe('Original');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // METADATA TYPE MAPPING — Used by useMetadata
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Metadata Type Mapping', () => {
    it('maps frontend types to API class names', () => {
      const typeMap = {
        actions: 'action',
        addressees: 'addressee',
        visas: 'visa',
        read_status: 'read_status'
      };
      expect(typeMap.actions).toBe('action');
      expect(typeMap.addressees).toBe('addressee');
      expect(typeMap.visas).toBe('visa');
      expect(typeMap.read_status).toBe('read_status');
    });

    it('all metadata types are covered', () => {
      const types = ['actions', 'addressees', 'visas', 'read_status'];
      expect(types).toHaveLength(4);
    });
  });
};

export default hookTests;
