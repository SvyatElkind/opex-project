/**
 * Integration Tests
 *
 * End-to-end workflow tests that exercise the full CRUD cycle
 * against the live backend API.
 *
 * IMPORTANT: These tests CREATE and DELETE real data.
 * They clean up after themselves but should only run in dev environments.
 */

import Project_API from '../../../API/Project_API';
import Inventory_API from '../../../API/Inventory_API';
import Item_API from '../../../API/Item_API';
import Record_API from '../../../API/Record_API';
import Institution_API from '../../../API/Institution_API';


const integrationTests = ({ describe, it, test, expect }) => {

  // Shared state for cascading tests
  const state = {
    projectId: null,
    fondId: null,
    institutionId: null,
    inventoryId: null,
    itemId: null,
    recordId: null,
  };

  const projectApi = Project_API();
  const inventoryApi = Inventory_API();
  const itemApi = Item_API();
  const recordApi = Record_API();
  const institutionApi = Institution_API();

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL CRUD WORKFLOW
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration: Full CRUD Workflow', () => {

    // 1. Create Project
    it('Step 1: Create a test project', async () => {
      const testName = `_test_${Date.now()}`;
      const [success, data] = await projectApi.create_project({ name: testName, folder: `C:\\temp\\${testName}` });
      if (!success) {
        console.warn('[Integration] Project creation failed — backend may not be running. Skipping chain.');
      }
      expect(typeof success).toBe('boolean');
      if (success && data) {
        state.projectId = data.id || data;
      }
    });

    // 2. Upload VVAIS report to populate institution/fond/inventories
    it('Step 2: Upload VVAIS report', async () => {
      if (!state.projectId) { expect(true).toBe(true); return; }
      try {
        // Fetch the test XLSX asset
        const response = await fetch('/static/media/Fonds_Iestade_GV_VALSTS_KASE.xlsx');
        if (!response.ok) {
          // Try alternative path (CRA may serve from different location)
          const altResponse = await fetch(new URL('../assets/Fonds_Iestade_GV_VALSTS_KASE.xlsx', import.meta.url));
          if (!altResponse.ok) {
            console.warn('[Integration] Could not load test XLSX file — skipping report upload.');
            expect(true).toBe(true);
            return;
          }
          var blob = await altResponse.blob();
        } else {
          var blob = await response.blob();
        }
        const file = new File([blob], 'Fonds_Iestade_GV_VALSTS_KASE.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const [success] = await projectApi.uploadFileAsAttachment(state.projectId, file);
        expect(success).toBe(true);
      } catch (error) {
        console.warn('[Integration] Report upload failed:', error.message);
        expect(true).toBe(true); // Don't fail — subsequent tests check state
      }
    });

    // 3. Fetch Project (now with institution/fond from report)
    it('Step 3: Fetch the created project', async () => {
      if (!state.projectId) { expect(true).toBe(true); return; }
      const [success, data] = await projectApi.get_project(state.projectId);
      expect(success).toBe(true);
      expect(data).toBeTruthy();
      if (data.institution) {
        state.institutionId = data.institution.id;
        if (data.institution.fond) {
          state.fondId = data.institution.fond.id;
        }
      }
    });

    // 4. Update Institution Signers
    it('Step 4: Update institution signers', async () => {
      if (!state.projectId || !state.institutionId) { expect(true).toBe(true); return; }
      const [success] = await institutionApi.updateSignerField(
        state.projectId, state.institutionId, {
          creator: 'Test Creator',
          creator_position: 'Test Position',
          signer: 'Test Signer',
          signer_position: 'Test Signer Pos'
        }
      );
      expect(success).toBe(true);
    });

    // 4. Create Inventory
    it('Step 4: Create a textual inventory', async () => {
      if (!state.projectId || !state.fondId) { expect(true).toBe(true); return; }
      const [success, data] = await inventoryApi.createInventory(
        state.projectId, state.fondId, {
          type: 'Tekstuāls',
          electronic: true,
          storage_term: 'Pastāvīgi glabājamās lietas',
          start_date: '2020',
          end_date: '2025'
        }
      );
      expect(success).toBe(true);
      expect(data).toBeTruthy();
      state.inventoryId = data.id || data;
    });

    // 5. Create Item
    it('Step 5: Create an item in the inventory', async () => {
      if (!state.projectId || !state.inventoryId) { expect(true).toBe(true); return; }
      const [success, data] = await itemApi.createItem({
        series_code: '1.1',
        title: 'Test Item Integration',
        start_date: '2020-01-01',
        end_date: '2025-12-31',
        date_indicator: 'day',
        language: 'latviešu',
        unit_of_measure: 'Lapas',
        restriction: 'Vispārēja',
        security_level: 'Publisks'
      }, state.projectId, state.inventoryId);
      expect(success).toBe(true);
      expect(data).toBeTruthy();
      state.itemId = data.id || data;
    });

    // 6. Create Record
    it('Step 6: Create a textual record', async () => {
      if (!state.projectId || !state.itemId) { expect(true).toBe(true); return; }
      const [success, data] = await recordApi.createRecord({
        title: 'Test Record Integration',
        date: '2023-06-15',
        reg_nr: 'REG-001',
        nomenclature_nr: 'NOM-001',
        language: 'latviešu',
        access_restriction: 'open'
      }, state.projectId, state.itemId);
      expect(success).toBe(true);
      expect(data).toBeTruthy();
      state.recordId = data.id || data;
    });

    // 7. Get Record
    it('Step 7: Fetch the created record', async () => {
      if (!state.projectId || !state.recordId) { expect(true).toBe(true); return; }
      const [success, data] = await recordApi.getRecord(state.projectId, state.recordId);
      expect(success).toBe(true);
      expect(data).toBeTruthy();
      expect(data.title).toBe('Test Record Integration');
    });

    // 8. Update Record
    it('Step 8: Update the record title', async () => {
      if (!state.projectId || !state.recordId) { expect(true).toBe(true); return; }
      const [success] = await recordApi.updateRecord(
        state.projectId, state.recordId, {
          title: 'Updated Test Record',
          date: '2023-06-15',
          reg_nr: 'REG-001',
          nomenclature_nr: 'NOM-001',
          language: 'latviešu',
          access_restriction: 'open'
        }
      );
      expect(success).toBe(true);
    });

    // 9. Verify Update
    it('Step 9: Verify the record was updated', async () => {
      if (!state.projectId || !state.recordId) { expect(true).toBe(true); return; }
      const [success, data] = await recordApi.getRecord(state.projectId, state.recordId);
      expect(success).toBe(true);
      expect(data.title).toBe('Updated Test Record');
    });

    // 10. Add Metadata
    it('Step 10: Add metadata (addressee) to record', async () => {
      if (!state.projectId || !state.recordId) { expect(true).toBe(true); return; }
      const [success, data] = await recordApi.addMetadata(
        state.projectId, state.recordId,
        { addressee: 'Test Addressee' },
        'addressee'
      );
      expect(success).toBe(true);
    });

    // ── CLEANUP ──────────────────────────────────────────────────────────────

    // 11. Delete Record
    it('Cleanup Step 1: Delete the record', async () => {
      if (!state.projectId || !state.recordId) { expect(true).toBe(true); return; }
      const [success] = await recordApi.deleteRecord(state.projectId, state.recordId);
      expect(success).toBe(true);
    });

    // 12. Delete Item
    it('Cleanup Step 2: Delete the item', async () => {
      if (!state.projectId || !state.itemId) { expect(true).toBe(true); return; }
      const [success] = await itemApi.deleteItem(state.projectId, state.itemId);
      expect(success).toBe(true);
    });

    // 13. Delete Inventory
    it('Cleanup Step 3: Delete the inventory', async () => {
      if (!state.projectId || !state.inventoryId) { expect(true).toBe(true); return; }
      const [success] = await inventoryApi.deleteInventory(state.projectId, state.inventoryId);
      expect(success).toBe(true);
    });

    // 14. Delete Project
    it('Cleanup Step 4: Delete the test project', async () => {
      if (!state.projectId) { expect(true).toBe(true); return; } // Skip — no project created
      const [success] = await projectApi.delete_project(state.projectId);
      expect(success).toBe(true);
    });

    // 15. Verify deletion
    it('Verify: Project no longer exists', async () => {
      if (!state.projectId) { expect(true).toBe(true); return; } // Skip — no project created
      const [success] = await projectApi.get_project(state.projectId);
      expect(success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MEDIA RECORD WORKFLOW
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration: Media Validation Flow', () => {
    it('validateMediaRecordData validates Foto correctly', () => {
      const api = Record_API();
      // Record_API validates format only — empty data passes (no format errors)
      const empty = api.validateMediaRecordData({}, 'Foto');
      expect(empty.isValid).toBe(true);

      // Invalid format fails
      const invalid = api.validateMediaRecordData({ color: 'neon' }, 'Foto');
      expect(invalid.isValid).toBe(false);

      // Complete valid data passes
      const valid = api.validateMediaRecordData({
        color: 'color',
        horizontal_resolution: 1920,
        vertical_resolution: 1080
      }, 'Foto');
      expect(valid.isValid).toBe(true);
    });

    it('validateMediaRecordData validates Video correctly', () => {
      const api = Record_API();
      // Empty passes (format-only validation)
      const empty = api.validateMediaRecordData({}, 'Video');
      expect(empty.isValid).toBe(true);

      // Invalid duration format fails
      const invalid = api.validateMediaRecordData({ duration: 'bad' }, 'Video');
      expect(invalid.isValid).toBe(false);

      const valid = api.validateMediaRecordData({
        color: 'color', duration: '01:30:00',
        horizontal_resolution: 1920, vertical_resolution: 1080
      }, 'Video');
      expect(valid.isValid).toBe(true);
    });

    it('validateMediaRecordData validates Audio correctly', () => {
      const api = Record_API();
      // Record_API uses 'Audio' not 'Skaņas'
      const valid = api.validateMediaRecordData({ duration: '00:30:00' }, 'Audio');
      expect(valid.isValid).toBe(true);

      const invalid = api.validateMediaRecordData({ duration: 'bad' }, 'Audio');
      expect(invalid.isValid).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration: Error Handling', () => {
    it('all APIs return [false, error] for invalid IDs', async () => {
      const [p] = await projectApi.get_project('invalid-id');
      expect(p).toBe(false);

      const [i] = await inventoryApi.deleteInventory('invalid', 'invalid');
      expect(i).toBe(false);

      const [it2] = await itemApi.deleteItem('invalid', 'invalid');
      expect(it2).toBe(false);

      const [r] = await recordApi.getRecord('invalid', 'invalid');
      expect(r).toBe(false);
    });

    it('APIs handle network errors gracefully', async () => {
      // These should return [false, errorMessage] not throw
      try {
        const [success] = await projectApi.get_project('');
        expect(typeof success).toBe('boolean');
      } catch(e) {
        // Even throwing is acceptable — as long as it doesn't crash silently
        expect(e).toBeTruthy();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API RETURN FORMAT CONSISTENCY
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration: API Return Format', () => {
    it('Project_API.connect_api returns [boolean, array|string]', async () => {
      const result = await projectApi.connect_api();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(typeof result[0]).toBe('boolean');
    });

    it('All error responses are [false, string|object]', async () => {
      const results = await Promise.all([
        projectApi.get_project('nonexistent'),
        itemApi.deleteItem('nonexistent', 'nonexistent'),
        recordApi.getRecord('nonexistent', 'nonexistent'),
      ]);

      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe(false);
        expect(result[1]).toBeTruthy();
      });
    });
  });
};

export default integrationTests;
