/* ==========================================
   COMPLETE APPLICATION CONSTANTS
   Split into domain-specific files under uiStrings/
   Re-exported here for backward compatibility
   ========================================== */

// Re-export all Project UI strings
export { WORKSPACE_UI, PROJECT_UI, PROJECT_CREATE_UI, PROJECT_RENAME_UI, PROJECT_DELETE_UI, PROJECT_ERROR, PROJECT_REPORT_UI, PROJECT_ADDITIONAL_UI } from './uiStrings/projectUI';

// Re-export all Inventory UI strings
export { INVENTORY_UI, INVENTORY_CREATE_UI, INVENTORY_EDIT_UI, INVENTORY_DELETE_UI, INVENTORY_PERIOD_REQUIRED_UI, INVENTORY_CONSTANTS } from './uiStrings/inventoryUI';

// Re-export all Item UI strings
export { ITEM_UI, ITEM_CREATE_UI, ITEM_EDIT_UI, ITEM_DELETE_UI, ITEM_ERROR, ITEM_ADDITIONAL_UI, ITEM_CREATE_FORM_UI } from './uiStrings/itemUI';

// Re-export all Record UI strings
export { RECORD_UI, RECORD_VALIDATION, RECORD_ERROR_MESSAGES, RECORD_SUCCESS_MESSAGES, RECORD_DELETE_UI, MEDIA_RECORD_UI, RECORD_CREATE_FORM_UI } from './uiStrings/recordUI';

// Re-export all Institution UI strings
export { INSTITUTION_CONSTANTS, INSTITUTION_ADDITIONAL_UI } from './uiStrings/institutionUI';

// Re-export all Navigation UI strings
export { NAVIGATION_UI, NAVIGATION_ADDITIONAL_UI, CALENDAR_UI, VIEW_OPTIONS, CALENDAR_ERROR } from './uiStrings/navigationUI';

// Re-export all Common UI strings
export { ERROR_MESSAGES, ALERT_MESSAGES, COMMON_ACTION_UI, COMMON_UI, TOAST_CONFIG, UI_CONFIG, HELP_UI } from './uiStrings/commonUI';

// Re-export all Verification UI strings
export { VERIFICATION_UI, GUIDE_TAB_UI } from './uiStrings/verificationUI';

// Re-export OPEX Progress UI strings
export { OPEX_PROGRESS_UI } from './uiStrings/opexProgressUI';

// Re-export all Fond UI strings
export { FOND_UI } from './uiStrings/fondUI';

// Re-export bulk (multi create / multi edit) UI strings
export { BULK_UI } from './uiStrings/bulkUI';

// Re-export CSV/Excel import UI strings (experimental feature)
export { IMPORT_UI } from './uiStrings/importUI';

/* --- Infrastructure Constants (kept here) --- */

/* --- Query Keys for React Query --- */
export const QUERY_KEYS = {
    // Projects
    projects: ['projects'],
    project: (projectId) => ['project', 'detail', projectId],

    // Institutions
    institutions: ['institutions'],
    institution: (institutionId) => ['institution', institutionId],

    // Inventories
    inventories: (projectId) => ['inventories', projectId],
    inventory: (projectId, inventoryId) => ['inventory', projectId, inventoryId],

    // Items
    items: (projectId, inventoryId) => ['items', projectId, inventoryId],
    item: (projectId, itemId) => ['item', projectId, itemId],

    // Records
    records: (projectId, itemId) => ['records', projectId, itemId],
    record: (projectId, recordId) => ['record', projectId, recordId],

    // Media Records
    mediaRecords: (projectId, itemId) => ['mediaRecords', projectId, itemId],
    mediaRecord: (projectId, recordId) => ['mediaRecord', projectId, recordId],

    // Metadata
    metadata: (projectId, recordId) => ['metadata', projectId, recordId],
    metadataMethods: (projectId, recordId) => ['metadataMethods', projectId, recordId],

    // Files
    files: (projectId, recordId) => ['files', projectId, recordId]
};

/* --- API --- */
export const API_ENDPOINT ={
    API_BASE_URL : "/api/v1/project/",
    API_BASE_URL_RECORD: "http://127.0.0.1:8000/api/records/project/"
}
/* !--- API ---! */
