import { useMemo } from 'react';
import { WORKFLOW_STATES } from './useWorkflowState';

/**
 * Action priorities
 */
export const ACTION_PRIORITY = {
  CRITICAL: 'critical',   // Blocks export (red)
  HIGH: 'high',           // Important but not blocking (orange)
  MEDIUM: 'medium',       // Recommended (blue)
  LOW: 'low'              // Optional (gray)
};

/**
 * Hook to generate next action suggestions
 * @param {Object} projectData - Current project data
 * @param {Object} validationResult - Validation result
 * @param {String} currentState - Current workflow state
 * @returns {Array} Array of action objects
 */
export function useNextActions(projectData, validationResult, currentState) {
  return useMemo(() => {
    const actions = [];

    // === PRIORITY 1: CRITICAL VALIDATION ERRORS ===
    if (validationResult?.summary?.inventoriesWithErrors > 0) {
      const errorCount = validationResult.inventoryValidations.reduce((sum, invVal) => {
        return sum + (invVal.validation.details?.criticalIssues || 0);
      }, 0);

      actions.push({
        id: 'fix-critical-errors',
        priority: ACTION_PRIORITY.CRITICAL,
        title: `Izlabot ${errorCount} kritisku kļūdu`,
        description: 'Šīs kļūdas neļauj eksportēt OPEX dokumentus',
        icon: 'fa-exclamation-circle',
        color: '#dc2626',
        action: () => {
          // Open validation modal
          const event = new CustomEvent('openValidationModal', {
            detail: { filterMode: 'errors' }
          });
          window.dispatchEvent(event);
        }
      });
    }

    // === PRIORITY 2: MISSING REQUIRED DATA ===

    // Missing signers
    if (currentState === WORKFLOW_STATES.REPORT_UPLOADED) {
      const hasSigners = projectData.institution?.creator &&
                         projectData.institution?.creator_position &&
                         projectData.institution?.signer &&
                         projectData.institution?.signer_position;

      if (!hasSigners) {
        actions.push({
          id: 'add-signers',
          priority: ACTION_PRIORITY.HIGH,
          title: 'Pievienot iestādes parakstītājus',
          description: 'Obligāti nepieciešams OPEX eksportēšanai',
          icon: 'fa-user-edit',
          color: '#f59e0b',
          action: () => {
            const event = new CustomEvent('openSignersModal');
            window.dispatchEvent(event);
          }
        });
      }
    }

    // === PRIORITY 3: EMPTY CONTAINERS ===

    // Empty inventories
    const emptyInventories = projectData?.institution?.fond?.inventories?.filter(
      inv => !inv.items || inv.items.length === 0
    ) || [];

    if (emptyInventories.length > 0 && emptyInventories.length <= 10) {
      actions.push({
        id: 'add-items-to-inventories',
        priority: ACTION_PRIORITY.MEDIUM,
        title: `Pievienot vienības ${emptyInventories.length} uzskaites sarakstiem`,
        description: 'Uzskaites saraksti bez vienībām nav derīgi',
        icon: 'fa-plus-circle',
        color: '#3b82f6',
        action: () => {
          // Navigate to first empty inventory
          console.log('Navigate to inventory:', emptyInventories[0].id);
        }
      });
    }

    // Items without records
    const itemsWithoutRecords = [];
    projectData?.institution?.fond?.inventories?.forEach(inv => {
      inv.items?.forEach(item => {
        if (!item.records || item.records.length === 0) {
          itemsWithoutRecords.push({
            inventoryId: inv.id,
            itemId: item.id,
            itemName: item.name || `GV-${item.number}`
          });
        }
      });
    });

    if (itemsWithoutRecords.length > 0 && itemsWithoutRecords.length <= 5) {
      actions.push({
        id: 'add-records-to-items',
        priority: ACTION_PRIORITY.MEDIUM,
        title: `Pievienot ierakstus ${itemsWithoutRecords.length} vienībām`,
        description: 'Vienības bez ierakstiem nav pilnīgas',
        icon: 'fa-file-alt',
        color: '#3b82f6',
        action: () => {
          console.log('Navigate to item:', itemsWithoutRecords[0]);
        }
      });
    }

    // Electronic records without files
    const recordsWithoutFiles = [];
    projectData?.institution?.fond?.inventories?.forEach(inv => {
      if (!inv.electronic) return; // Skip physical inventories

      inv.items?.forEach(item => {
        item.records?.forEach(record => {
          if (!record.files || record.files.length === 0) {
            recordsWithoutFiles.push({
              inventoryId: inv.id,
              itemId: item.id,
              recordId: record.id,
              recordName: record.name || 'Bez nosaukuma'
            });
          }
        });
      });
    });

    if (recordsWithoutFiles.length > 0) {
      actions.push({
        id: 'add-files-to-records',
        priority: ACTION_PRIORITY.CRITICAL,
        title: `Augšupielādēt failus ${recordsWithoutFiles.length} ierakstiem`,
        description: 'Elektroniskiem ierakstiem obligāti nepieciešami faili',
        icon: 'fa-upload',
        color: '#dc2626',
        action: () => {
          console.log('Navigate to record:', recordsWithoutFiles[0]);
        }
      });
    }

    // === PRIORITY 4: WARNINGS ===
    if (validationResult?.summary?.totalWarnings > 0) {
      const warningCount = validationResult.summary.totalWarnings;

      actions.push({
        id: 'review-warnings',
        priority: ACTION_PRIORITY.LOW,
        title: `Pārskatīt ${warningCount} brīdinājumu`,
        description: 'Ieteicams labot, bet nav obligāti',
        icon: 'fa-exclamation-triangle',
        color: '#6b7280',
        action: () => {
          const event = new CustomEvent('openValidationModal', {
            detail: { filterMode: 'all' }
          });
          window.dispatchEvent(event);
        }
      });
    }

    // === PRIORITY 5: NEXT WORKFLOW STEP ===
    // If no critical issues, suggest next workflow step
    if (actions.length === 0 || actions.every(a => a.priority !== ACTION_PRIORITY.CRITICAL)) {
      const nextStepAction = getNextWorkflowStepAction(currentState, projectData);
      if (nextStepAction) {
        actions.push(nextStepAction);
      }
    }

    // Sort by priority
    const priorityOrder = {
      [ACTION_PRIORITY.CRITICAL]: 0,
      [ACTION_PRIORITY.HIGH]: 1,
      [ACTION_PRIORITY.MEDIUM]: 2,
      [ACTION_PRIORITY.LOW]: 3
    };

    return actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [projectData, validationResult, currentState]);
}

/**
 * Get next workflow step suggestion based on current state
 */
function getNextWorkflowStepAction(currentState, projectData) {
  switch (currentState) {
    case WORKFLOW_STATES.NO_PROJECT:
      return {
        id: 'create-project',
        priority: ACTION_PRIORITY.HIGH,
        title: 'Izveidot jaunu projektu',
        description: 'Sāciet ar projekta izveidi',
        icon: 'fa-plus-circle',
        color: '#10b981',
        action: () => {
          const event = new CustomEvent('openCreateProjectModal');
          window.dispatchEvent(event);
        }
      };

    case WORKFLOW_STATES.PROJECT_CREATED:
      return {
        id: 'upload-report',
        priority: ACTION_PRIORITY.HIGH,
        title: 'Augšupielādēt VVAIS atskaiti',
        description: 'Importējiet datus no VVAIS sistēmas',
        icon: 'fa-file-upload',
        color: '#3b82f6',
        action: () => {
          const event = new CustomEvent('openUploadReportModal');
          window.dispatchEvent(event);
        }
      };

    case WORKFLOW_STATES.FILES_UPLOADED:
    case WORKFLOW_STATES.HAS_WARNINGS:
      return {
        id: 'validate-project',
        priority: ACTION_PRIORITY.MEDIUM,
        title: 'Pārbaudīt projektu',
        description: 'Pārliecinieties, ka viss ir kārtībā',
        icon: 'fa-clipboard-check',
        color: '#3b82f6',
        action: () => {
          const event = new CustomEvent('openValidationModal');
          window.dispatchEvent(event);
        }
      };

    case WORKFLOW_STATES.READY_FOR_EXPORT:
      return {
        id: 'export-opex',
        priority: ACTION_PRIORITY.HIGH,
        title: 'Eksportēt OPEX dokumentus',
        description: 'Projekts ir gatavs iesniegšanai!',
        icon: 'fa-file-download',
        color: '#10b981',
        action: () => {
          const event = new CustomEvent('openValidationModal');
          window.dispatchEvent(event);
        }
      };

    default:
      return null;
  }
}
