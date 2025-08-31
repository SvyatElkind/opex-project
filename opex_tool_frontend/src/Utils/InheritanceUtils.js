// src/Utils/InheritanceUtils.js
// Enhanced utility functions for managing inventory/item/record inheritance with backend integration

import { INVENTORY_CONSTANTS, RECORD_VALIDATION } from '../Constants/Constnats'

/**
 * Constants for inventory types and their inheritance behavior
 */
export const INVENTORY_TYPES = {
    TEXTUAL: 'Tekstuāls',
    PHOTO: 'Foto',
    AUDIO: 'Skaņas', 
    VIDEO: 'Video',
    DATABASE: 'Datubāze'
};

/**
 * Define which inventory types are textual (can have multiple records per item)
 */
export const TEXTUAL_TYPES = [INVENTORY_TYPES.TEXTUAL];

/**
 * Define which inventory types are media (should have only one record per item)
 */
export const MEDIA_TYPES = [
    INVENTORY_TYPES.PHOTO,
    INVENTORY_TYPES.AUDIO,
    INVENTORY_TYPES.VIDEO,
    INVENTORY_TYPES.DATABASE
];

/**
 * Inheritance behavior enum
 */
export const INHERITANCE_BEHAVIOR = {
    ONE_TO_MANY: 'ONE_TO_MANY',    // One item can have multiple records (textual)
    ONE_TO_ONE: 'ONE_TO_ONE'       // One item should have one record (media)
};

/**
 * Record relationship constraints based on inventory type
 */
export const RECORD_CONSTRAINTS = {
    [INVENTORY_TYPES.TEXTUAL]: {
        behavior: INHERITANCE_BEHAVIOR.ONE_TO_MANY,
        maxRecords: Infinity,
        minRecords: 0,
        allowMultiple: true,
        description: 'Tekstuālie dokumenti var saturēt vairākus ierakstus vienā glabājamajā vienībā',
        icon: '📄',
        color: '#007bff',
        primaryFields: ['title', 'date', 'created_date', 'language', 'annotation'],
        requiredFields: ['title'],
        optionalFields: ['reg_nr', 'sent_reg_nr', 'group', 'nomenclature_nr', 'notes', 'key_words'],
        fileTypes: RECORD_VALIDATION.ALLOWED_FILE_TYPES['Tekstuāls'] || []
    },
    [INVENTORY_TYPES.PHOTO]: {
        behavior: INHERITANCE_BEHAVIOR.ONE_TO_ONE,
        maxRecords: 1,
        minRecords: 0,
        allowMultiple: false,
        description: 'Foto vienībai ir tikai viens ieraksts',
        icon: '📸',
        color: '#28a745',
        primaryFields: ['title', 'date', 'color', 'horizontal_resolution', 'vertical_resolution'],
        requiredFields: ['title'],
        optionalFields: ['notes', 'tech_info'],
        mediaFields: ['color', 'horizontal_resolution', 'vertical_resolution'],
        fileTypes: RECORD_VALIDATION.ALLOWED_FILE_TYPES['Foto'] || [],
        autoCreateRecord: true // Automatically create record when file is uploaded
    },
    [INVENTORY_TYPES.AUDIO]: {
        behavior: INHERITANCE_BEHAVIOR.ONE_TO_ONE,
        maxRecords: 1,
        minRecords: 0,
        allowMultiple: false,
        description: 'Audio vienībai ir tikai viens ieraksts',
        icon: '🎵',
        color: '#17a2b8',
        primaryFields: ['title', 'date', 'duration'],
        requiredFields: ['title'],
        optionalFields: ['notes', 'tech_info'],
        mediaFields: ['duration'],
        fileTypes: RECORD_VALIDATION.ALLOWED_FILE_TYPES['Skaņas'] || [],
        autoCreateRecord: true
    },
    [INVENTORY_TYPES.VIDEO]: {
        behavior: INHERITANCE_BEHAVIOR.ONE_TO_ONE,
        maxRecords: 1,
        minRecords: 0,
        allowMultiple: false,
        description: 'Video vienībai ir tikai viens ieraksts',
        icon: '🎥',
        color: '#6f42c1',
        primaryFields: ['title', 'date', 'duration', 'color', 'horizontal_resolution', 'vertical_resolution'],
        requiredFields: ['title'],
        optionalFields: ['notes', 'tech_info'],
        mediaFields: ['duration', 'color', 'horizontal_resolution', 'vertical_resolution'],
        fileTypes: RECORD_VALIDATION.ALLOWED_FILE_TYPES['Video'] || [],
        autoCreateRecord: true
    },
    [INVENTORY_TYPES.DATABASE]: {
        behavior: INHERITANCE_BEHAVIOR.ONE_TO_ONE,
        maxRecords: 1,
        minRecords: 0,
        allowMultiple: false,
        description: 'Datubāzes vienībai ir tikai viens ieraksts',
        icon: '🗄️',
        color: '#fd7e14',
        primaryFields: ['title', 'date', 'format', 'tech_info'],
        requiredFields: ['title'],
        optionalFields: ['notes', 'annotation'],
        mediaFields: ['format'],
        fileTypes: RECORD_VALIDATION.ALLOWED_FILE_TYPES['Datubāze'] || [],
        autoCreateRecord: true
    }
};

/**
 * Get inheritance information for an inventory
 * @param {Object} inventory - Inventory object
 * @returns {Object} Inheritance information
 */
export const getInheritanceInfo = (inventory) => {
    if (!inventory || !inventory.type) {
        return {
            isTextual: true,
            isMedia: false,
            type: 'Unknown',
            icon: '❓',
            color: '#6c757d',
            behavior: INHERITANCE_BEHAVIOR.ONE_TO_MANY,
            constraints: RECORD_CONSTRAINTS[INVENTORY_TYPES.TEXTUAL]
        };
    }

    const constraints = RECORD_CONSTRAINTS[inventory.type] || RECORD_CONSTRAINTS[INVENTORY_TYPES.TEXTUAL];
    
    return {
        isTextual: TEXTUAL_TYPES.includes(inventory.type),
        isMedia: MEDIA_TYPES.includes(inventory.type),
        type: inventory.type,
        icon: constraints.icon,
        color: constraints.color,
        behavior: constraints.behavior,
        constraints: constraints,
        electronic: inventory.electronic || false
    };
};

/**
 * Validate if a record can be created for an item
 * @param {Object} inventory - Inventory object
 * @param {Object} item - Item object
 * @returns {Object} Validation result
 */
export const validateRecordCreation = (inventory, item) => {
    if (!inventory || !item) {
        return {
            allowed: false,
            message: 'Trūkst nepieciešamās informācijas par inventāru vai glabājamo vienību',
            reason: 'MISSING_DATA'
        };
    }

    const inheritanceInfo = getInheritanceInfo(inventory);
    const constraints = inheritanceInfo.constraints;
    const currentRecordCount = item.records ? item.records.length : 0;

    // Check if item exists and has valid ID
    if (!item.id) {
        return {
            allowed: false,
            message: 'Glabājamā vienība nav pareizi inicializēta',
            reason: 'INVALID_ITEM'
        };
    }

    // For media inventories, check if electronic
    if (inheritanceInfo.isMedia && !inventory.electronic) {
        return {
            allowed: false,
            message: 'Media ieraksti ir pieejami tikai elektroniskajiem inventāriem',
            reason: 'NOT_ELECTRONIC'
        };
    }

    // Check maximum record limit
    if (currentRecordCount >= constraints.maxRecords) {
        if (constraints.maxRecords === 1) {
            return {
                allowed: false,
                message: `${inventory.type} glabājamajā vienībā jau eksistē ieraksts. ${constraints.description}.`,
                reason: 'MAX_RECORDS_REACHED'
            };
        } else {
            return {
                allowed: false,
                message: `Sasniegts maksimālais ierakstu skaits (${constraints.maxRecords}) šajā glabājamajā vienībā`,
                reason: 'MAX_RECORDS_REACHED'
            };
        }
    }

    // Check for existing media records
    if (inheritanceInfo.isMedia) {
        const hasMediaRecord = checkForExistingMediaRecord(item, inventory.type);
        if (hasMediaRecord.exists) {
            return {
                allowed: false,
                message: hasMediaRecord.message,
                reason: 'MEDIA_RECORD_EXISTS'
            };
        }
    }

    return {
        allowed: true,
        message: 'Ierakstu var izveidot',
        reason: 'ALLOWED'
    };
};

/**
 * Check for existing media records
 * @param {Object} item - Item object
 * @param {string} inventoryType - Type of inventory
 * @returns {Object} Check result
 */
const checkForExistingMediaRecord = (item, inventoryType) => {
    if (!item) return { exists: false };

    // Check based on inventory type
    switch (inventoryType) {
        case INVENTORY_TYPES.PHOTO:
            if (item.photo_records && item.photo_records.length > 0) {
                return {
                    exists: true,
                    message: 'Glabājamajā vienībā jau eksistē foto ieraksts'
                };
            }
            break;
        case INVENTORY_TYPES.VIDEO:
            if (item.video_records && item.video_records.length > 0) {
                return {
                    exists: true,
                    message: 'Glabājamajā vienībā jau eksistē video ieraksts'
                };
            }
            break;
        case INVENTORY_TYPES.AUDIO:
            if (item.audio_records && item.audio_records.length > 0) {
                return {
                    exists: true,
                    message: 'Glabājamajā vienībā jau eksistē audio ieraksts'
                };
            }
            break;
        default:
            // For generic media records or database records, check the main records array
            if (item.records && item.records.length > 0) {
                return {
                    exists: true,
                    message: 'Glabājamajā vienībā jau eksistē ieraksts'
                };
            }
    }

    return { exists: false };
};

/**
 * Get navigation behavior after record creation
 * @param {Object} inventory - Inventory object
 * @param {Object} item - Item object
 * @returns {Object} Navigation behavior
 */
export const getNavigationBehavior = (inventory, item) => {
    const inheritanceInfo = getInheritanceInfo(inventory);
    
    if (inheritanceInfo.isMedia) {
        // For media records, navigate directly to the record after creation
        return {
            action: 'navigateToRecord',
            reason: 'Media records are typically singular and should be viewed immediately'
        };
    }
    
    // For textual records, behavior depends on existing record count
    const recordCount = item?.records?.length || 0;
    
    if (recordCount === 0) {
        // First record - navigate to record detail
        return {
            action: 'navigateToRecord',
            reason: 'First record should be viewed to ensure proper setup'
        };
    } else if (recordCount < 5) {
        // Few records - stay at item level to see all records
        return {
            action: 'stayAtItem',
            reason: 'Show all records in context'
        };
    } else {
        // Many records - navigate to the new record
        return {
            action: 'navigateToRecord',
            reason: 'Focus on newly created record in large collection'
        };
    }
};

/**
 * Get UI configuration for item display
 * @param {Object} inventory - Inventory object
 * @param {Object} item - Item object
 * @returns {Object} UI configuration
 */
export const getItemUIConfig = (inventory, item) => {
    if (!inventory || !item) {
        return {
            showCreateRecordButton: false,
            maxRecordsAllowed: 0,
            badge: { text: 'Unknown', color: '#6c757d', icon: '❓' },
            validation: { allowed: false, message: 'Missing data' },
            displayMode: 'list',
            primaryAction: null
        };
    }

    const inheritanceInfo = getInheritanceInfo(inventory);
    const validation = validateRecordCreation(inventory, item);
    const currentRecordCount = item.records ? item.records.length : 0;
    
    // Determine display mode
    let displayMode = 'list';
    if (inheritanceInfo.isMedia) {
        displayMode = currentRecordCount === 0 ? 'upload' : 'detail';
    }
    
    // Determine primary action
    let primaryAction = null;
    if (validation.allowed) {
        primaryAction = inheritanceInfo.isMedia ? 'upload_file' : 'create_form';
    }
    
    return {
        showCreateRecordButton: validation.allowed,
        maxRecordsAllowed: inheritanceInfo.constraints.maxRecords,
        badge: {
            text: inheritanceInfo.type,
            color: inheritanceInfo.color,
            icon: inheritanceInfo.icon
        },
        validation: validation,
        displayMode: displayMode,
        primaryAction: primaryAction,
        recordCount: currentRecordCount,
        constraints: inheritanceInfo.constraints
    };
};

/**
 * Get attention status for an item (used for highlighting items that need attention)
 * @param {Object} inventory - Inventory object
 * @param {Object} item - Item object
 * @returns {Object} Attention status
 */
export const getItemAttentionStatus = (inventory, item) => {
    if (!inventory || !item) {
        return {
            needsAttention: true,
            level: 'error',
            message: 'Trūkst datu',
            icon: '❌'
        };
    }

    const inheritanceInfo = getInheritanceInfo(inventory);
    const currentRecordCount = item.records ? item.records.length : 0;
    
    // Check for media inventories that should have records
    if (inheritanceInfo.isMedia && inventory.electronic && currentRecordCount === 0) {
        return {
            needsAttention: true,
            level: 'warning',
            message: 'Nav augšupielādēts fails',
            icon: '⚠️',
            actionRequired: 'upload_file'
        };
    }
    
    // Check for textual inventories with validation issues
    if (inheritanceInfo.isTextual && currentRecordCount > 0) {
        // Check if any records have validation issues
        const hasIncompleteRecords = item.records?.some(record => 
            !record.title || !record.date
        );
        
        if (hasIncompleteRecords) {
            return {
                needsAttention: true,
                level: 'info',
                message: 'Nepilnīgi metadati',
                icon: 'ℹ️',
                actionRequired: 'complete_metadata'
            };
        }
    }
    
    // Check for access restrictions that might need review
    const hasRestrictedRecords = item.records?.some(record => 
        record.access_restriction === 'closed'
    );
    
    if (hasRestrictedRecords) {
        return {
            needsAttention: true,
            level: 'info',
            message: 'Ierobežota pieeja',
            icon: '🔒',
            actionRequired: 'review_restrictions'
        };
    }
    
    return {
        needsAttention: false,
        level: 'success',
        message: 'Viss kārtībā',
        icon: '✅'
    };
};

/**
 * Get recommended fields for a record type
 * @param {string} inventoryType - Type of inventory
 * @param {string} context - Context ('create', 'edit', 'view')
 * @returns {Array} Array of field configurations
 */
export const getRecommendedFields = (inventoryType, context = 'create') => {
    const constraints = RECORD_CONSTRAINTS[inventoryType] || RECORD_CONSTRAINTS[INVENTORY_TYPES.TEXTUAL];
    
    let fields = [...constraints.primaryFields];
    
    if (context === 'edit' || context === 'view') {
        fields = [...fields, ...constraints.optionalFields];
    }
    
    if (constraints.mediaFields) {
        fields = [...fields, ...constraints.mediaFields];
    }
    
    return fields.map(fieldName => ({
        name: fieldName,
        required: constraints.requiredFields.includes(fieldName),
        type: getFieldType(fieldName),
        validation: getFieldValidation(fieldName),
        displayOrder: getFieldDisplayOrder(fieldName)
    })).sort((a, b) => a.displayOrder - b.displayOrder);
};

/**
 * Get field type for validation and rendering
 * @param {string} fieldName - Name of the field
 * @returns {string} Field type
 */
const getFieldType = (fieldName) => {
    const typeMap = {
        'title': 'text',
        'date': 'date',
        'created_date': 'date',
        'sent_date': 'date',
        'access_restriction_date': 'date',
        'language': 'select',
        'access_restriction': 'select',
        'annotation': 'textarea',
        'notes': 'textarea',
        'tech_info': 'textarea',
        'key_words': 'text',
        'reg_nr': 'text',
        'sent_reg_nr': 'text',
        'group': 'text',
        'nomenclature_nr': 'text',
        'duration': 'text',
        'color': 'text',
        'horizontal_resolution': 'number',
        'vertical_resolution': 'number',
        'format': 'text'
    };
    
    return typeMap[fieldName] || 'text';
};

/**
 * Get field validation rules
 * @param {string} fieldName - Name of the field
 * @returns {Object} Validation rules
 */
const getFieldValidation = (fieldName) => {
    const validationMap = {
        'title': { maxLength: RECORD_VALIDATION.MAX_TITLE_LENGTH, required: true },
        'language': { maxLength: RECORD_VALIDATION.MAX_LANGUAGE_LENGTH },
        'annotation': { maxLength: RECORD_VALIDATION.MAX_ANNOTATION_LENGTH },
        'key_words': { maxLength: RECORD_VALIDATION.MAX_KEY_WORDS_LENGTH },
        'reg_nr': { maxLength: RECORD_VALIDATION.MAX_REG_NR_LENGTH },
        'sent_reg_nr': { maxLength: RECORD_VALIDATION.MAX_SENT_REG_NR_LENGTH },
        'group': { maxLength: RECORD_VALIDATION.MAX_GROUP_LENGTH },
        'nomenclature_nr': { maxLength: RECORD_VALIDATION.MAX_NOMENCLATURE_NR_LENGTH },
        'notes': { maxLength: RECORD_VALIDATION.MAX_NOTES_LENGTH },
        'access_restriction_notes': { maxLength: RECORD_VALIDATION.MAX_ACCESS_RESTRICTION_NOTES_LENGTH },
        'user_restriction_notes': { maxLength: RECORD_VALIDATION.MAX_USER_RESTRICTION_NOTES_LENGTH },
        'tech_info': { maxLength: RECORD_VALIDATION.MAX_TECH_INFO_LENGTH },
        'color': { maxLength: RECORD_VALIDATION.MAX_COLOR_LENGTH },
        'duration': { 
            maxLength: RECORD_VALIDATION.MAX_DURATION_LENGTH,
            pattern: RECORD_VALIDATION.DURATION_REGEX
        },
        'format': { maxLength: RECORD_VALIDATION.MAX_FORMAT_LENGTH },
        'horizontal_resolution': { min: 1, max: 99999 },
        'vertical_resolution': { min: 1, max: 99999 }
    };
    
    return validationMap[fieldName] || {};
};

/**
 * Get display order for fields
 * @param {string} fieldName - Name of the field
 * @returns {number} Display order
 */
const getFieldDisplayOrder = (fieldName) => {
    const orderMap = {
        'title': 1,
        'date': 2,
        'created_date': 3,
        'sent_date': 4,
        'language': 5,
        'duration': 6,
        'color': 7,
        'horizontal_resolution': 8,
        'vertical_resolution': 9,
        'format': 10,
        'annotation': 20,
        'key_words': 21,
        'notes': 22,
        'reg_nr': 30,
        'sent_reg_nr': 31,
        'group': 32,
        'nomenclature_nr': 33,
        'tech_info': 34,
        'access_restriction': 40,
        'access_restriction_notes': 41,
        'access_restriction_date': 42,
        'user_restriction_notes': 43
    };
    
    return orderMap[fieldName] || 999;
};

/**
 * Check if a file type is allowed for an inventory
 * @param {string} inventoryType - Type of inventory
 * @param {string} fileType - MIME type of file
 * @returns {boolean} Whether file type is allowed
 */
export const isFileTypeAllowed = (inventoryType, fileType) => {
    const constraints = RECORD_CONSTRAINTS[inventoryType];
    if (!constraints || !constraints.fileTypes) return true;
    
    return constraints.fileTypes.includes(fileType);
};

/**
 * Get file upload configuration for inventory type
 * @param {string} inventoryType - Type of inventory
 * @returns {Object} Upload configuration
 */
export const getFileUploadConfig = (inventoryType) => {
    const constraints = RECORD_CONSTRAINTS[inventoryType] || RECORD_CONSTRAINTS[INVENTORY_TYPES.TEXTUAL];
    
    return {
        allowedTypes: constraints.fileTypes,
        maxFiles: constraints.behavior === INHERITANCE_BEHAVIOR.ONE_TO_ONE ? 1 : 10,
        maxFileSize: RECORD_VALIDATION.MAX_FILE_SIZE,
        autoCreateRecord: constraints.autoCreateRecord || false,
        acceptAttribute: constraints.fileTypes.map(type => `.${type.split('/')[1]}`).join(',')
    };
};

/**
 * Get record statistics for an item (missing function from your existing code)
 * @param {Object} item - Item object
 * @param {Object} inventory - Inventory object
 * @returns {Object} Record statistics
 */
export const getRecordStatistics = (item, inventory) => {
    if (!item || !inventory) {
        return {
            totalRecords: 0,
            completedRecords: 0,
            draftRecords: 0,
            filesCount: 0,
            hasMediaFiles: false,
            completionRate: 0
        };
    }

    const records = item.records || [];
    const inheritanceInfo = getInheritanceInfo(inventory);
    
    let completedRecords = 0;
    let filesCount = 0;
    let hasMediaFiles = false;

    records.forEach(record => {
        // Count files
        if (record.files && record.files.length > 0) {
            filesCount += record.files.length;
            
            // Check for media files
            const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.mp3', '.wav'];
            hasMediaFiles = hasMediaFiles || record.files.some(file => 
                mediaExtensions.some(ext => file.original_name?.toLowerCase().endsWith(ext))
            );
        }

        // Determine if record is complete
        const isComplete = record.title && 
                          record.date && 
                          (inheritanceInfo.isMedia ? record.validated : true);
        
        if (isComplete) {
            completedRecords++;
        }
    });

    return {
        totalRecords: records.length,
        completedRecords,
        draftRecords: records.length - completedRecords,
        filesCount,
        hasMediaFiles,
        completionRate: records.length > 0 ? Math.round((completedRecords / records.length) * 100) : 0,
        maxRecordsAllowed: inheritanceInfo.constraints.maxRecords,
        canCreateMore: records.length < inheritanceInfo.constraints.maxRecords
    };
};

/**
 * Get inventory statistics (if needed by your existing code)
 * @param {Object} inventory - Inventory object with items
 * @returns {Object} Inventory statistics
 */
export const getInventoryStatistics = (inventory) => {
    if (!inventory || !inventory.items) {
        return {
            totalItems: 0,
            itemsWithRecords: 0,
            totalRecords: 0,
            completionRate: 0
        };
    }

    const items = inventory.items;
    let totalRecords = 0;
    let itemsWithRecords = 0;

    items.forEach(item => {
        const recordCount = item.records ? item.records.length : 0;
        totalRecords += recordCount;
        
        if (recordCount > 0) {
            itemsWithRecords++;
        }
    });

    return {
        totalItems: items.length,
        itemsWithRecords,
        totalRecords,
        completionRate: items.length > 0 ? Math.round((itemsWithRecords / items.length) * 100) : 0
    };
};

/**
 * Get project statistics (if needed by your existing code)
 * @param {Object} project - Project object
 * @returns {Object} Project statistics
 */
export const getProjectStatistics = (project) => {
    if (!project || !project.institution?.fond?.inventories) {
        return {
            totalInventories: 0,
            totalItems: 0,
            totalRecords: 0
        };
    }

    const inventories = project.institution.fond.inventories;
    let totalItems = 0;
    let totalRecords = 0;

    inventories.forEach(inventory => {
        if (inventory.items) {
            totalItems += inventory.items.length;
            
            inventory.items.forEach(item => {
                if (item.records) {
                    totalRecords += item.records.length;
                }
            });
        }
    });

    return {
        totalInventories: inventories.length,
        totalItems,
        totalRecords
    };
};

/**
 * Helper function to get item completion status
 * @param {Object} item - Item object
 * @param {Object} inventory - Inventory object
 * @returns {Object} Completion status
 */
export const getItemCompletionStatus = (item, inventory) => {
    const stats = getRecordStatistics(item, inventory);
    const inheritanceInfo = getInheritanceInfo(inventory);
    
    let status = 'empty';
    let message = 'Nav ierakstu';
    let color = '#6c757d';
    
    if (stats.totalRecords === 0) {
        status = 'empty';
        message = 'Nav ierakstu';
        color = '#6c757d';
    } else if (inheritanceInfo.isMedia && stats.totalRecords === 1 && stats.completedRecords === 1) {
        status = 'complete';
        message = 'Pabeigts';
        color = '#28a745';
    } else if (stats.completionRate === 100) {
        status = 'complete';
        message = 'Visi ieraksti pabeigti';
        color = '#28a745';
    } else if (stats.completionRate > 0) {
        status = 'partial';
        message = `${stats.completionRate}% pabeigts`;
        color = '#ffc107';
    } else {
        status = 'draft';
        message = 'Melnraksts';
        color = '#fd7e14';
    }
    
    return {
        status,
        message,
        color,
        percentage: stats.completionRate
    };
};

// Default export with all utility functions
export default {
    // Main functions
    getInheritanceInfo,
    validateRecordCreation,
    getNavigationBehavior,
    getItemUIConfig,
    getItemAttentionStatus,
    
    // Statistics functions (for existing code compatibility)
    getRecordStatistics,
    getInventoryStatistics, 
    getProjectStatistics,
    getItemCompletionStatus,
    
    // Field and validation helpers
    getRecommendedFields,
    isFileTypeAllowed,
    getFileUploadConfig,
    
    // Constants
    INVENTORY_TYPES,
    TEXTUAL_TYPES,
    MEDIA_TYPES,
    INHERITANCE_BEHAVIOR,
    RECORD_CONSTRAINTS,
    
    // Internal helpers (exposed for testing)
    getFieldType,
    getFieldValidation,
    getFieldDisplayOrder
};