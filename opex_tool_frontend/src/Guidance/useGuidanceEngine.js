import { useMemo } from 'react';
import { determineCategory, CATEGORY_TYPES } from '../Utils/InheritanceUtils';

/**
 * useGuidanceEngine — Smart work queue for archival workflow
 *
 * Understands the 4 category types and generates inventory-specific actions:
 *
 * ELECTRONIC_DOCUMENTS (Tekstuāls + electronic):
 *   Item → multiple Records → each Record needs Files
 *   Actions: Create GV → Create Dok. → Upload Datne (per record)
 *
 * ELECTRONIC_MEDIA (Foto/Video/Skaņas + electronic):
 *   Item → exactly 1 media record (= file upload via FormData)
 *   Data lives in item.photo_records / video_records / audio_records
 *   Actions: Create GV → Upload media file (creates record+file in one step)
 *
 * DOCUMENTS (Tekstuāls + physical):
 *   Item → multiple Records, no files needed
 *   Actions: Create GV → Create Dok.
 *
 * MEDIA (Foto/Video/Skaņas + physical):
 *   Item → 1 record, no files needed, manual metadata
 *   Actions: Create GV → Enter metadata
 */

export const ACTION_TYPES = {
  UPLOAD_REPORT: 'UPLOAD_REPORT',
  ADD_SIGNERS: 'ADD_SIGNERS',
  CREATE_ITEM: 'CREATE_ITEM',
  CREATE_RECORD: 'CREATE_RECORD',
  UPLOAD_MEDIA: 'UPLOAD_MEDIA',
  UPLOAD_FILE: 'UPLOAD_FILE',
  VERIFY: 'VERIFY',
  EXPORT: 'EXPORT',
};

/**
 * Documentation for each kind of action.
 *
 * The guidance card answers "what next?" and takes the user there; this map is
 * what lets it also answer "how?" — every action carries a deep link into the
 * help chapter that explains that step. Keys are ACTION_TYPES, so a new action
 * type without an entry simply renders no help link rather than a broken one.
 */
export const ACTION_HELP = {
  [ACTION_TYPES.UPLOAD_REPORT]: { chapterId: 'projects', sectionId: 'upload-vvais-report' },
  [ACTION_TYPES.ADD_SIGNERS]: { chapterId: 'projects', sectionId: 'institution-signers' },
  [ACTION_TYPES.CREATE_ITEM]: { chapterId: 'items', sectionId: 'create-item' },
  [ACTION_TYPES.CREATE_RECORD]: { chapterId: 'records', sectionId: 'create-record' },
  [ACTION_TYPES.UPLOAD_MEDIA]: { chapterId: 'records', sectionId: 'document-vs-media' },
  [ACTION_TYPES.UPLOAD_FILE]: { chapterId: 'records', sectionId: 'record-files' },
  [ACTION_TYPES.VERIFY]: { chapterId: 'verification', sectionId: 'verification-view' },
  [ACTION_TYPES.EXPORT]: { chapterId: 'verification', sectionId: 'exporting-opex' },
};

/** Look up the help target for an action. Returns null when undocumented. */
export const getActionHelp = (action) =>
  (action && ACTION_HELP[action.type]) || null;

// ─── Category-aware helpers ─────────────────────────────────────────────────

const MEDIA_RECORD_KEYS = {
  'Foto': 'photo_records',
  'Video': 'video_records',
  'Skaņas': 'audio_records',
};

/**
 * Check if item has a record, respecting category rules
 */
const itemHasRecord = (item, category, inventoryType) => {
  if (category === CATEGORY_TYPES.ELECTRONIC_MEDIA || category === CATEGORY_TYPES.MEDIA) {
    // Media: check type-specific record array
    const key = MEDIA_RECORD_KEYS[inventoryType];
    return key && item[key]?.length > 0;
  }
  // Documents: check records array
  return item.records?.length > 0;
};

/**
 * Get records that need files (ELECTRONIC_DOCUMENTS only)
 */
const getRecordsNeedingFiles = (item) => {
  if (!item.records) return [];
  return item.records.filter(rec => !rec.files || rec.files.length === 0);
};

/**
 * Count entities for an inventory, respecting its category
 */
const countInventoryEntities = (inventory) => {
  const items = inventory.items || [];
  const category = determineCategory(inventory.type, inventory.electronic);
  const mediaKey = MEDIA_RECORD_KEYS[inventory.type];

  let records = 0;
  let files = 0;

  items.forEach(item => {
    if (category === CATEGORY_TYPES.ELECTRONIC_MEDIA || category === CATEGORY_TYPES.MEDIA) {
      // Media records count as both record and file
      const mediaCount = mediaKey ? (item[mediaKey]?.length || 0) : 0;
      records += mediaCount;
      if (category === CATEGORY_TYPES.ELECTRONIC_MEDIA) {
        files += mediaCount; // The upload IS the file
      }
    } else {
      // Textual records
      const recs = item.records || [];
      records += recs.length;
      if (category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS) {
        recs.forEach(rec => {
          files += rec.files?.length || 0;
        });
      }
    }
  });

  return { items: items.length, records, files };
};

// ─── Main Hook ──────────────────────────────────────────────────────────────

export function useGuidanceEngine(projectData, validationResult, route) {
  return useMemo(() => {
    const result = {
      globalActions: [],       // Project-level actions (report, signers)
      inventoryActions: [],    // Per-inventory work queues
      currentAction: null,     // THE one thing to do next
      nextActions: [],         // Preview of next 2-3
      progress: { items: 0, records: 0, files: 0, itemTarget: 0, recordTarget: 0, fileTarget: 0, overall: 0 },
      isComplete: false,
    };

    if (!projectData) return result;

    const institution = projectData.institution;
    const inventories = institution?.fond?.inventories || [];

    // ─── Global actions ───────────────────────────────────────────────

    // Report needed?
    if (!institution?.fond || inventories.length === 0) {
      result.globalActions.push({
        type: ACTION_TYPES.UPLOAD_REPORT,
        message: 'Augšupielādējiet VVAIS atskaiti',
        button: 'Augšupielādēt atskaiti',
        severity: 'high',
        event: 'openUploadReportModal',
      });
    }

    // Signers needed?
    const hasSigners = institution?.creator && institution?.creator_position &&
                       institution?.signer && institution?.signer_position;
    if (!hasSigners && inventories.length > 0) {
      result.globalActions.push({
        type: ACTION_TYPES.ADD_SIGNERS,
        message: 'Pievienojiet atbildīgās personas',
        button: 'Pievienot atbildīgās personas',
        severity: 'high',
        event: 'openSignersModal',
      });
    }

    // ─── Per-inventory actions ─────────────────────────────────────────

    // Filter by route if specified
    const relevantInventories = route?.inventoryNumber
      ? inventories.filter(inv => inv.number === route.inventoryNumber)
      : inventories;

    // Targets from route
    const itemTarget = route?.goals?.totalItems || 0;
    const recordTarget = route?.goals?.totalRecords || 0;
    const fileTarget = route?.goals?.totalFiles || 0;

    let totalItems = 0, totalRecords = 0, totalFiles = 0;

    for (const inventory of relevantInventories) {
      const category = determineCategory(inventory.type, inventory.electronic);
      const items = inventory.items || [];
      const invLabel = `US ${inventory.number}${inventory.postfix ? `-${inventory.postfix}` : ''}`;
      const counts = countInventoryEntities(inventory);
      const isElectronic = inventory.electronic;

      totalItems += counts.items;
      totalRecords += counts.records;
      totalFiles += counts.files;

      const invActions = [];

      // ── Need more items? ──
      if (itemTarget > 0 && totalItems < itemTarget) {
        invActions.push({
          type: ACTION_TYPES.CREATE_ITEM,
          message: `Izveidot GV (${counts.items} izveidotas)`,
          button: 'Izveidot GV',
          severity: 'medium',
          inventoryId: inventory.id,
          nav: { type: 'inventory', id: inventory.id },
        });
      }

      // ── Walk items for missing records/files ──
      for (const item of items) {
        const itemLabel = `GV #${item.number || '?'}`;
        const hasRecord = itemHasRecord(item, category, inventory.type);

        if (!hasRecord) {
          if (category === CATEGORY_TYPES.ELECTRONIC_MEDIA) {
            // Media: one upload creates record + file together
            invActions.push({
              type: ACTION_TYPES.UPLOAD_MEDIA,
              message: `Augšupielādēt ${inventory.type.toLowerCase()} datni: ${itemLabel}`,
              button: `Augšupielādēt ${inventory.type}`,
              severity: 'medium',
              inventoryId: inventory.id,
              itemId: item.id,
              nav: { type: 'item', id: item.id, inventoryId: inventory.id },
            });
          } else if (category === CATEGORY_TYPES.MEDIA) {
            // Physical media: just needs metadata entry
            invActions.push({
              type: ACTION_TYPES.CREATE_RECORD,
              message: `Ievadīt ${inventory.type.toLowerCase()} metadatus: ${itemLabel}`,
              button: 'Ievadīt metadatus',
              severity: 'medium',
              inventoryId: inventory.id,
              itemId: item.id,
              nav: { type: 'item', id: item.id, inventoryId: inventory.id },
            });
          } else {
            // Textual (electronic or physical): create document record
            invActions.push({
              type: ACTION_TYPES.CREATE_RECORD,
              message: `Izveidot dokumentu: ${itemLabel}`,
              button: 'Izveidot Dok.',
              severity: 'medium',
              inventoryId: inventory.id,
              itemId: item.id,
              nav: { type: 'item', id: item.id, inventoryId: inventory.id },
            });
          }
          continue; // Don't check files until record exists
        }

        // ── Record exists — need files? (ELECTRONIC_DOCUMENTS only) ──
        if (category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS) {
          const recsNeedingFiles = getRecordsNeedingFiles(item);
          for (const rec of recsNeedingFiles) {
            invActions.push({
              type: ACTION_TYPES.UPLOAD_FILE,
              message: `Augšupielādēt datni: ${itemLabel} → "${rec.title || rec.reg_nr || 'Dok.'}"`,
              button: 'Augšupielādēt datni',
              severity: 'medium',
              inventoryId: inventory.id,
              itemId: item.id,
              recordId: rec.id,
              nav: { type: 'record', id: rec.id, inventoryId: inventory.id, itemId: item.id },
            });
          }
        }
        // ELECTRONIC_MEDIA: no separate file step — upload IS the record
        // DOCUMENTS/MEDIA (physical): no files needed
      }

      if (invActions.length > 0) {
        result.inventoryActions.push({
          inventoryId: inventory.id,
          inventoryNumber: inventory.number,
          inventoryPostfix: inventory.postfix || '',
          inventoryType: inventory.type,
          category,
          isElectronic,
          label: invLabel,
          remaining: invActions.length,
          counts,
          actions: invActions,
        });
      }
    }

    // ─── Progress ─────────────────────────────────────────────────────

    result.progress = {
      items: totalItems,
      records: totalRecords,
      files: totalFiles,
      itemTarget,
      recordTarget: recordTarget || totalItems, // If no record target, match items
      fileTarget: fileTarget || (relevantInventories.some(i => i.electronic) ? totalItems : 0),
      overall: itemTarget > 0
        ? Math.min(100, Math.round(
            (Math.min(totalItems, itemTarget) / itemTarget) * 40 +
            (Math.min(totalRecords, Math.max(recordTarget, totalItems)) / Math.max(recordTarget, totalItems, 1)) * 30 +
            (Math.min(totalFiles, Math.max(fileTarget, totalItems)) / Math.max(fileTarget, totalItems, 1)) * 30
          ))
        : 0,
    };

    // ─── Determine current action ─────────────────────────────────────

    // Global actions first (report, signers)
    if (result.globalActions.length > 0) {
      result.currentAction = result.globalActions[0];
      result.nextActions = [
        ...result.globalActions.slice(1),
        ...(result.inventoryActions[0]?.actions?.slice(0, 2) || [])
      ].slice(0, 3);
      return result;
    }

    // Then inventory-specific actions — round-robin across inventories
    // (so user can work on multiple inventories, not stuck on one)
    const allActions = [];
    const maxDepth = Math.max(...result.inventoryActions.map(ia => ia.actions.length), 0);

    for (let depth = 0; depth < maxDepth; depth++) {
      for (const invAction of result.inventoryActions) {
        if (invAction.actions[depth]) {
          allActions.push({
            ...invAction.actions[depth],
            _invLabel: invAction.label,
          });
        }
      }
    }

    if (allActions.length > 0) {
      result.currentAction = allActions[0];
      result.nextActions = allActions.slice(1, 4);
      return result;
    }

    // ─── Everything complete — verify/export ──────────────────────────

    if (validationResult?.valid === false) {
      result.currentAction = {
        type: ACTION_TYPES.VERIFY,
        message: 'Izlabojiet kļūdas pirms eksportēšanas',
        button: 'Pārbaudīt projektu',
        severity: 'high',
        event: 'openValidationModal',
      };
    } else if (validationResult?.valid === true) {
      result.currentAction = {
        type: ACTION_TYPES.EXPORT,
        message: 'Projekts ir gatavs! Eksportējiet OPEX pakotni.',
        button: 'Eksportēt',
        severity: 'success',
        event: 'openValidationModal',
      };
      result.isComplete = true;
    } else {
      result.currentAction = {
        type: ACTION_TYPES.VERIFY,
        message: 'Pārbaudiet projektu pirms eksportēšanas',
        button: 'Pārbaudīt',
        severity: 'info',
        event: 'openValidationModal',
      };
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectData, validationResult, route?.id, route?.goals?.totalItems, route?.goals?.totalRecords, route?.goals?.totalFiles, route?.inventoryNumber]);
}

export default useGuidanceEngine;
