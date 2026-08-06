import { useMemo } from 'react';

/**
 * Workflow states in order of progression
 */
export const WORKFLOW_STATES = {
  NO_PROJECT: 'NO_PROJECT',
  PROJECT_CREATED: 'PROJECT_CREATED',
  REPORT_UPLOADED: 'REPORT_UPLOADED',
  SIGNERS_COMPLETE: 'SIGNERS_COMPLETE',
  INVENTORIES_CREATED: 'INVENTORIES_CREATED',
  ITEMS_CREATED: 'ITEMS_CREATED',
  RECORDS_CREATED: 'RECORDS_CREATED',
  FILES_UPLOADED: 'FILES_UPLOADED',
  HAS_ERRORS: 'HAS_ERRORS',
  HAS_WARNINGS: 'HAS_WARNINGS',
  READY_FOR_EXPORT: 'READY_FOR_EXPORT'
};

/**
 * Get inventory types to track based on roadmap project type
 * @param {string} projectType - Project type from roadmap (text, video, photos, audio, mixed)
 * @returns {Array} Array of inventory type strings to track
 */
const getTrackedInventoryTypes = (projectType) => {
  if (!projectType) return null; // Track all if no roadmap

  // Map roadmap project types to inventory type values
  // Inventory types from backend: 'Tekstuāls', 'Foto', 'Skaņas', 'Video'
  const typeMap = {
    'text': ['Tekstuāls'],
    'video': ['Video'],
    'photos': ['Foto'],
    'audio': ['Skaņas'],
    'mixed': null // Track all types for mixed projects
  };

  return typeMap[projectType] || null;
};

/**
 * Hook to determine current workflow state
 * @param {Object} projectData - Current project data
 * @param {Object} validationResult - Validation result from validateProjectForOPEX
 * @param {Object} roadmap - Optional roadmap data to filter by inventory type
 * @returns {Object} { state, progress, nextState, canExport, missingSteps }
 */
export function useWorkflowState(projectData, validationResult, roadmap = null) {
  return useMemo(() => {
    // No project loaded
    if (!projectData) {
      return {
        state: WORKFLOW_STATES.NO_PROJECT,
        progress: 0,
        nextState: WORKFLOW_STATES.PROJECT_CREATED,
        canExport: false,
        stateLabel: 'Izveidojiet projektu',
        missingSteps: []
      };
    }

    // Get types to track based on roadmap
    const trackedTypes = roadmap?.projectType ? getTrackedInventoryTypes(roadmap.projectType) : null;

    // Calculate cumulative progress based on completed steps
    let cumulativeProgress = 0;
    let primaryState = WORKFLOW_STATES.PROJECT_CREATED;
    let nextState = WORKFLOW_STATES.REPORT_UPLOADED;
    let stateLabel = '';
    const missingSteps = [];

    // Step 1: Project created (10 points)
    cumulativeProgress += 10;

    // Step 2: VVAIS report uploaded (15 points)
    const hasReport = projectData.vvais_report_uploaded;
    if (hasReport) {
      cumulativeProgress += 15;
    } else {
      if (!stateLabel) {
        primaryState = WORKFLOW_STATES.PROJECT_CREATED;
        nextState = WORKFLOW_STATES.REPORT_UPLOADED;
        stateLabel = 'Augšupielādējiet VVAIS atskaiti';
      }
      missingSteps.push('report');
    }

    // Step 3: Signers complete (10 points)
    const hasSigners = projectData.institution?.creator &&
                       projectData.institution?.creator_position &&
                       projectData.institution?.signer &&
                       projectData.institution?.signer_position;
    if (hasSigners) {
      cumulativeProgress += 10;
    } else {
      if (!stateLabel && hasReport) {
        primaryState = WORKFLOW_STATES.REPORT_UPLOADED;
        nextState = WORKFLOW_STATES.SIGNERS_COMPLETE;
        stateLabel = 'Pievienojiet iestādes parakstītājus';
      }
      missingSteps.push('signers');
    }

    // Helper function to filter inventories by tracked types and inventory number
    const filterInventories = (inventories) => {
      if (!inventories) return [];

      // If roadmap specifies an inventory number, only track that specific inventory
      if (roadmap?.inventoryNumber) {
        return inventories.filter(inv => inv.number === roadmap.inventoryNumber);
      }

      // Otherwise filter by type (legacy behavior)
      if (!trackedTypes) return inventories; // Track all if no filter
      return inventories.filter(inv => trackedTypes.includes(inv.type));
    };

    // Step 4: Inventories created (15 points)
    const allInventories = projectData.institution?.fond?.inventories || [];
    const relevantInventories = filterInventories(allInventories);
    const hasInventories = relevantInventories.length > 0;

    if (hasInventories) {
      cumulativeProgress += 15;
    } else {
      if (!stateLabel && hasReport && hasSigners) {
        primaryState = WORKFLOW_STATES.SIGNERS_COMPLETE;
        nextState = WORKFLOW_STATES.INVENTORIES_CREATED;
        // If tracking specific inventory number, customize message
        stateLabel = roadmap?.inventoryNumber
          ? `Izveidojiet uzskaites sarakstu Nr. ${roadmap.inventoryNumber}`
          : 'Izveidojiet uzskaites sarakstus';
      }
      missingSteps.push('inventories');
    }

    // Step 5: Items created (15 points)
    const hasItems = hasInventories && relevantInventories.some(
      inv => inv.items && inv.items.length > 0
    );
    if (hasItems) {
      cumulativeProgress += 15;
    } else {
      if (!stateLabel && hasReport && hasSigners && hasInventories) {
        primaryState = WORKFLOW_STATES.INVENTORIES_CREATED;
        nextState = WORKFLOW_STATES.ITEMS_CREATED;
        stateLabel = 'Pievienojiet glabājamās vienības';
      }
      missingSteps.push('items');
    }

    // Step 6: Records created (15 points)
    const hasRecords = hasItems && relevantInventories.some(inv =>
      inv.items.some(item => item.records && item.records.length > 0)
    );
    if (hasRecords) {
      cumulativeProgress += 15;
    } else {
      if (!stateLabel && hasReport && hasSigners && hasInventories && hasItems) {
        primaryState = WORKFLOW_STATES.ITEMS_CREATED;
        nextState = WORKFLOW_STATES.RECORDS_CREATED;
        stateLabel = 'Pievienojiet dokumentus';
      }
      missingSteps.push('records');
    }

    // Step 7: Files uploaded for electronic inventories (10 points)
    const electronicInventories = relevantInventories.filter(inv => inv.electronic);

    let hasFiles = true;
    if (electronicInventories.length > 0) {
      hasFiles = electronicInventories.some(inv =>
        inv.items && inv.items.some(item =>
          item.records && item.records.some(record => record.files && record.files.length > 0)
        )
      );
      if (hasFiles) {
        cumulativeProgress += 10;
      } else {
        if (!stateLabel && hasReport && hasSigners && hasInventories && hasItems && hasRecords) {
          primaryState = WORKFLOW_STATES.RECORDS_CREATED;
          nextState = WORKFLOW_STATES.FILES_UPLOADED;
          stateLabel = 'Augšupielādējiet failus';
        }
        missingSteps.push('files');
      }
    } else {
      // No electronic inventories of tracked type, give the points
      cumulativeProgress += 10;
    }

    // Step 8: Validation check (10 points - ready for export or has errors/warnings)
    if (validationResult) {
      const { summary } = validationResult;

      if (summary.readyForOPEX) {
        cumulativeProgress += 10;
        return {
          state: WORKFLOW_STATES.READY_FOR_EXPORT,
          progress: 100,
          nextState: null,
          canExport: true,
          stateLabel: 'Gatavs eksportēšanai!',
          missingSteps
        };
      }

      // Has critical errors - don't add final points
      if (summary.inventoriesWithErrors > 0) {
        return {
          state: WORKFLOW_STATES.HAS_ERRORS,
          progress: cumulativeProgress,
          nextState: WORKFLOW_STATES.READY_FOR_EXPORT,
          canExport: false,
          stateLabel: 'Izlabojiet kļūdas',
          missingSteps
        };
      }

      // Only warnings - add partial points
      cumulativeProgress += 5;
      return {
        state: WORKFLOW_STATES.HAS_WARNINGS,
        progress: cumulativeProgress,
        nextState: WORKFLOW_STATES.READY_FOR_EXPORT,
        canExport: false,
        stateLabel: 'Pārskatiet brīdinājumus',
        missingSteps
      };
    }

    // Default: return current state
    if (!stateLabel) {
      stateLabel = 'Pārbaudiet projektu';
      primaryState = WORKFLOW_STATES.FILES_UPLOADED;
      nextState = WORKFLOW_STATES.READY_FOR_EXPORT;
    }

    return {
      state: primaryState,
      progress: cumulativeProgress,
      nextState: nextState,
      canExport: false,
      stateLabel: stateLabel,
      missingSteps
    };
  }, [projectData, validationResult, roadmap]);
}
