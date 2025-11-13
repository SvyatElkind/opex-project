// src/Utils/InheritanceUtils.js
// Enhanced utility for managing inventory inheritance with Electronic flag support

import { INVENTORY_CONSTANTS, RECORD_VALIDATION } from '../Constants/Constants';

// ========================================
// INVENTORY TYPES (Backend Types)
// ========================================

export const INVENTORY_TYPES = {
    TEXTUAL: 'Tekstuāls',
    PHOTO: 'Foto',
    AUDIO: 'Skaņas',
    VIDEO: 'Video',
    DATABASE: 'Datubāze'
};

// ========================================
// CATEGORY TYPES (Frontend Logic Categories)
// ========================================

export const CATEGORY_TYPES = {
    DOCUMENTS: 'DOCUMENTS',                      // Textual + electronic: false
    ELECTRONIC_DOCUMENTS: 'ELECTRONIC_DOCUMENTS', // Textual + electronic: true
    DATABASE: 'DATABASE',                         // Database (always electronic)
    ELECTRONIC_MEDIA: 'ELECTRONIC_MEDIA',        // Photo/Audio/Video + electronic: true
    MEDIA: 'MEDIA'                               // Photo/Audio/Video + electronic: false
};

// ========================================
// MEDIA TYPES GROUPING
// ========================================

export const MEDIA_INVENTORY_TYPES = [
    INVENTORY_TYPES.PHOTO,
    INVENTORY_TYPES.AUDIO,
    INVENTORY_TYPES.VIDEO
];

export const TEXTUAL_INVENTORY_TYPES = [
    INVENTORY_TYPES.TEXTUAL
];

// ========================================
// INHERITANCE BEHAVIORS
// ========================================

export const INHERITANCE_BEHAVIOR = {
    ONE_TO_MANY: 'ONE_TO_MANY',    // One item can have multiple records
    ONE_TO_ONE: 'ONE_TO_ONE'        // One item should have exactly one record
};

// ========================================
// VIEW MODES FOR UI
// ========================================

export const VIEW_MODES = {
    SEGMENTED: 'SEGMENTED',        // Overview + Records List (for Documents types)
    COMBINED: 'COMBINED'           // Item + Record combined view (for Media types)
};

// ========================================
// CATEGORY DETERMINATION
// ========================================

/**
 * Determine the category based on type and electronic flag
 * @param {string} type - Inventory type (Foto, Video, Audio, TekstuÄls, DatubÄze)
 * @param {boolean} electronic - Electronic flag
 * @returns {string} Category type
 */
export const determineCategory = (type, electronic) => {
    // Database is always its own category (always electronic in practice)
    if (type === INVENTORY_TYPES.DATABASE) {
        return CATEGORY_TYPES.DATABASE;
    }
    
    // Textual types
    if (type === INVENTORY_TYPES.TEXTUAL) {
        return electronic 
            ? CATEGORY_TYPES.ELECTRONIC_DOCUMENTS 
            : CATEGORY_TYPES.DOCUMENTS;
    }
    
    // Media types (Photo, Audio, Video)
    if (MEDIA_INVENTORY_TYPES.includes(type)) {
        return electronic 
            ? CATEGORY_TYPES.ELECTRONIC_MEDIA 
            : CATEGORY_TYPES.MEDIA;
    }
    
    // Fallback
    return CATEGORY_TYPES.DOCUMENTS;
};

// ========================================
// CATEGORY CONFIGURATIONS
// ========================================

export const CATEGORY_CONSTRAINTS = {
    // Documents: Textual, electronic: false
    [CATEGORY_TYPES.DOCUMENTS]: {
        behavior: INHERITANCE_BEHAVIOR.ONE_TO_MANY,
        maxRecords: Infinity,
        minRecords: 0,
        allowMultiple: true,
        viewMode: VIEW_MODES.SEGMENTED,
        
        description: 'Dokumenti var saturēt vairākus ierakstus',
        displayName: 'Dokumenti',
        icon: '📄',
        color: 'var(--color-primary)',
        colorRgb: 'var(--color-primary-rgb)',
        
        workflow: {
            step1: 'CREATE_RECORD_WITH_FORM',
            step2: 'NO_FILE_UPLOAD',
            requiresFileUpload: false,
            allowsFileUpload: false,
            allowsMultipleFiles: false,
            fileUploadTiming: null
        },
        
        endpoints: {
            create: 'POST /api/v1/project/<project_id>/record/?item_id=<item_id>',
            update: 'PUT /api/v1/project/<project_id>/record/<record_id>/',
            delete: 'DELETE /api/v1/project/<project_id>/record/<record_id>/'
        },
        
        primaryFields: ['title', 'date', 'reg_nr', 'group'],
        requiredFields: ['title'],
        optionalFields: [
            'created_date', 'sent_date', 'language', 'annotation', 
            'key_words', 'sent_reg_nr', 'nomenclature_nr', 'notes',
            'access_restriction', 'access_restriction_notes', 
            'access_restriction_date', 'user_restriction_notes'
        ],
        
        supportsAdditionalMetadata: true,
        metadataClasses: ['action', 'addressee', 'visa', 'read_status']
    },
    
    // Electronic Documents: Textual, electronic: true
    [CATEGORY_TYPES.ELECTRONIC_DOCUMENTS]: {
        behavior: INHERITANCE_BEHAVIOR.ONE_TO_MANY,
        maxRecords: Infinity,
        minRecords: 0,
        allowMultiple: true,
        viewMode: VIEW_MODES.SEGMENTED,
        
        description: 'Elektroniskie dokumenti var saturēt vairākus ierakstus ar failiem',
        displayName: 'Elektroniskie Dokumenti',
        icon: '💾',
        color: 'var(--color-info)',
        colorRgb: 'var(--color-info-rgb)',
        
        workflow: {
            step1: 'CREATE_RECORD_WITH_FORM',
            step2: 'ADD_FILES_AFTER',
            requiresFileUpload: false,
            allowsFileUpload: true,
            allowsMultipleFiles: true,
            fileUploadTiming: 'AFTER_RECORD_CREATION'
        },
        
        endpoints: {
            create: 'POST /api/v1/project/<project_id>/record/?item_id=<item_id>',
            update: 'PUT /api/v1/project/<project_id>/record/<record_id>/',
            delete: 'DELETE /api/v1/project/<project_id>/record/<record_id>/',
            addFiles: 'POST /api/v1/project/<project_id>/record/<record_id>/multiple_files/'
        },
        
        primaryFields: ['title', 'date', 'reg_nr', 'group', 'format', 'tech_info'],
        requiredFields: ['title'],
        optionalFields: [
            'created_date', 'sent_date', 'language', 'annotation', 
            'key_words', 'sent_reg_nr', 'nomenclature_nr', 'notes',
            'access_restriction', 'access_restriction_notes', 
            'access_restriction_date', 'user_restriction_notes'
        ],
        
        acceptedFileTypes: ['*/*'], // All file types
        acceptAttribute: '*/*',
        
        supportsAdditionalMetadata: true,
        metadataClasses: ['action', 'addressee', 'visa', 'read_status']
    },
    
    // Database: Always electronic
    [CATEGORY_TYPES.DATABASE]: {
        behavior: INHERITANCE_BEHAVIOR.ONE_TO_MANY,
        maxRecords: Infinity,
        minRecords: 0,
        allowMultiple: true,
        viewMode: VIEW_MODES.SEGMENTED,
        
        description: 'Datubāzes ieraksti var saturēt vairākus ierakstus',
        displayName: 'Datubāze',
        icon: '🗄️',
        color: 'var(--color-warning)',
        colorRgb: 'var(--color-warning-rgb)',
        
        workflow: {
            step1: 'CREATE_RECORD_WITH_FORM',
            step2: 'ADD_FILES_AFTER',
            requiresFileUpload: false,
            allowsFileUpload: true,
            allowsMultipleFiles: true,
            fileUploadTiming: 'AFTER_RECORD_CREATION'
        },
        
        endpoints: {
            create: 'POST /api/v1/project/<project_id>/record/?item_id=<item_id>',
            update: 'PUT /api/v1/project/<project_id>/record/<record_id>/',
            delete: 'DELETE /api/v1/project/<project_id>/record/<record_id>/',
            addFiles: 'POST /api/v1/project/<project_id>/record/<record_id>/multiple_files/'
        },
        
        primaryFields: ['title', 'date', 'format', 'tech_info'],
        requiredFields: ['title'],
        optionalFields: ['notes', 'annotation', 'language'],
        
        acceptedFileTypes: ['*/*'],
        acceptAttribute: '*/*',
        
        supportsAdditionalMetadata: true,
        metadataClasses: ['action', 'addressee', 'visa', 'read_status']
    },
    
    // Electronic Media: Photo/Audio/Video, electronic: true
    [CATEGORY_TYPES.ELECTRONIC_MEDIA]: {
        behavior: INHERITANCE_BEHAVIOR.ONE_TO_ONE,
        maxRecords: 1,
        minRecords: 0,
        allowMultiple: false,
        viewMode: VIEW_MODES.COMBINED,
        
        description: 'Elektroniskais medijs var saturēt tikai vienu ierakstu',
        displayName: 'Elektroniskais Medijs',
        icon: '🎬',
        color: 'var(--color-success)',
        colorRgb: 'var(--color-success-rgb)',
        
        workflow: {
            step1: 'UPLOAD_FILE_FIRST',
            step2: 'ADD_METADATA_AFTER',
            requiresFileUpload: true,
            allowsFileUpload: true,
            allowsMultipleFiles: false,
            fileUploadTiming: 'BEFORE_RECORD_CREATION'
        },
        
        endpoints: {
            create: 'POST /api/v1/project/<project_id>/media_record/?item_id=<item_id>',
            update: 'PUT /api/v1/project/<project_id>/record/<record_id>/',
            delete: 'DELETE /api/v1/project/<project_id>/record/<record_id>/'
        },
        
        primaryFields: ['title', 'date', 'format', 'color', 'tech_info'],
        requiredFields: ['title'],
        optionalFields: [
            'horizontal_resolution', 'vertical_resolution', 'duration',
            'notes', 'annotation', 'access_restriction'
        ],
        
        // File types determined by media subtype (Photo/Audio/Video)
        acceptedFileTypes: [], // Will be set dynamically
        acceptAttribute: '*/*',
        
        supportsAdditionalMetadata: false,
        metadataClasses: []
    },
    
    // Media: Photo/Audio/Video, electronic: false
    [CATEGORY_TYPES.MEDIA]: {
        behavior: INHERITANCE_BEHAVIOR.ONE_TO_ONE,
        maxRecords: 1,
        minRecords: 0,
        allowMultiple: false,
        viewMode: VIEW_MODES.COMBINED,
        
        description: 'Medijs var saturēt tikai vienu ierakstu bez faila',
        displayName: 'Medijs',
        icon: '📼',
        color: 'var(--color-secondary)',
        colorRgb: 'var(--color-secondary-rgb)',
        
        workflow: {
            step1: 'CREATE_RECORD_WITH_FORM',
            step2: 'NO_FILE_UPLOAD',
            requiresFileUpload: false,
            allowsFileUpload: false,
            allowsMultipleFiles: false,
            fileUploadTiming: null
        },
        
        endpoints: {
            create: 'POST /api/v1/project/<project_id>/record/?item_id=<item_id>',
            update: 'PUT /api/v1/project/<project_id>/record/<record_id>/',
            delete: 'DELETE /api/v1/project/<project_id>/record/<record_id>/'
        },
        
        primaryFields: ['title', 'date', 'format', 'tech_info'],
        requiredFields: ['title'],
        optionalFields: ['notes', 'annotation', 'duration'],
        
        supportsAdditionalMetadata: false,
        metadataClasses: []
    }
};

// ========================================
// MEDIA SUBTYPE CONFIGURATIONS
// ========================================

export const MEDIA_SUBTYPE_CONFIG = {
    [INVENTORY_TYPES.PHOTO]: {
        icon: '📷',
        displayName: 'Foto',
        acceptedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/tiff', 'image/bmp'],
        acceptAttribute: 'image/*',
        specificFields: ['horizontal_resolution', 'vertical_resolution', 'color']
    },
    [INVENTORY_TYPES.VIDEO]: {
        icon: '🎥',
        displayName: 'Video',
        acceptedFileTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv'],
        acceptAttribute: 'video/*',
        specificFields: ['duration', 'horizontal_resolution', 'vertical_resolution', 'color']
    },
    [INVENTORY_TYPES.AUDIO]: {
        icon: '🎵',
        displayName: 'Audio',
        acceptedFileTypes: ['audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/m4a'],
        acceptAttribute: 'audio/*',
        specificFields: ['duration']
    }
};

// ========================================
// CORE UTILITY FUNCTIONS
// ========================================

/**
 * Get complete inheritance information for an inventory
 * @param {object} inventory - Inventory object with type and electronic fields
 * @returns {object} Complete inheritance info
 */
export const getInheritanceInfo = (inventory) => {
    if (!inventory || !inventory.type) {
        return {
            category: CATEGORY_TYPES.DOCUMENTS,
            type: INVENTORY_TYPES.TEXTUAL,
            electronic: false,
            constraints: CATEGORY_CONSTRAINTS[CATEGORY_TYPES.DOCUMENTS],
            ...CATEGORY_CONSTRAINTS[CATEGORY_TYPES.DOCUMENTS]
        };
    }

    const type = inventory.type;
    const electronic = inventory.electronic || false;
    const category = determineCategory(type, electronic);
    const constraints = CATEGORY_CONSTRAINTS[category];
    
    // Enhance with media subtype info if applicable
    let mediaSubtype = null;
    if (MEDIA_INVENTORY_TYPES.includes(type)) {
        mediaSubtype = MEDIA_SUBTYPE_CONFIG[type];
        
        // Override file types for electronic media
        if (category === CATEGORY_TYPES.ELECTRONIC_MEDIA) {
            constraints.acceptedFileTypes = mediaSubtype.acceptedFileTypes;
            constraints.acceptAttribute = mediaSubtype.acceptAttribute;
            constraints.icon = mediaSubtype.icon;
        }
    }

    return {
        category,
        type,
        electronic,
        constraints,
        mediaSubtype,
        
        // Flatten for easier access
        behavior: constraints.behavior,
        maxRecords: constraints.maxRecords,
        allowMultiple: constraints.allowMultiple,
        viewMode: constraints.viewMode,
        description: constraints.description,
        displayName: constraints.displayName,
        icon: constraints.icon,
        color: constraints.color,
        colorRgb: constraints.colorRgb,
        workflow: constraints.workflow,
        endpoints: constraints.endpoints,
        primaryFields: constraints.primaryFields,
        requiredFields: constraints.requiredFields,
        optionalFields: constraints.optionalFields,
        supportsAdditionalMetadata: constraints.supportsAdditionalMetadata,
        metadataClasses: constraints.metadataClasses || [],
        
        // Convenience flags
        isDocuments: category === CATEGORY_TYPES.DOCUMENTS,
        isElectronicDocuments: category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS,
        isDatabase: category === CATEGORY_TYPES.DATABASE,
        isElectronicMedia: category === CATEGORY_TYPES.ELECTRONIC_MEDIA,
        isMedia: category === CATEGORY_TYPES.MEDIA,
        
        // ✨ NEW PROPERTIES - Adding missing flags that the codebase expects
        isTextual: category === CATEGORY_TYPES.DOCUMENTS || 
                   category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS || 
                   category === CATEGORY_TYPES.DATABASE,
        isAnyMedia: category === CATEGORY_TYPES.MEDIA || 
                    category === CATEGORY_TYPES.ELECTRONIC_MEDIA,
        
        isOneToOne: constraints.behavior === INHERITANCE_BEHAVIOR.ONE_TO_ONE,
        isOneToMany: constraints.behavior === INHERITANCE_BEHAVIOR.ONE_TO_MANY,
        usesSegmentedView: constraints.viewMode === VIEW_MODES.SEGMENTED,
        usesCombinedView: constraints.viewMode === VIEW_MODES.COMBINED,
        allowsFileUpload: constraints.workflow.allowsFileUpload,
        requiresFileUpload: constraints.workflow.requiresFileUpload
    };
};

/**
 * Validate if a new record can be created for an item
 * @param {object} inventory - Inventory object
 * @param {object} item - Item object
 * @returns {object} Validation result
 */
export const validateRecordCreation = (inventory, item) => {
    const inheritanceInfo = getInheritanceInfo(inventory);
    const currentRecordCount = item.records ? item.records.length : 0;

    // Check max records constraint
    if (currentRecordCount >= inheritanceInfo.maxRecords) {
        return {
            allowed: false,
            message: `${inheritanceInfo.displayName} vienībai var būt tikai ${inheritanceInfo.maxRecords} ieraksts. Dzēsiet esošo ierakstu, lai izveidotu jaunu.`,
            reason: 'MAX_RECORDS_REACHED'
        };
    }

    return {
        allowed: true,
        message: 'Ierakstu var izveidot',
        reason: 'OK'
    };
};

/**
 * Get navigation behavior after record creation
 * @param {object} inventory - Inventory object
 * @param {object} item - Item object
 * @returns {object} Navigation behavior
 */
export const getNavigationBehavior = (inventory, item) => {
    const inheritanceInfo = getInheritanceInfo(inventory);

    // For combined view (media types), navigate to the record/item combined view
    if (inheritanceInfo.usesCombinedView) {
        return {
            action: 'navigateToItemCombined',
            reason: 'COMBINED_VIEW',
            message: 'Pāriet uz vienību (kombinētais skats)'
        };
    }

    // For segmented view (document types), stay at item to show records list
    if (inheritanceInfo.usesSegmentedView) {
        return {
            action: 'stayAtItemSegmented',
            reason: 'SEGMENTED_VIEW',
            message: 'Palikt pie vienības (segmentētais skats)'
        };
    }

    return {
        action: 'stayAtItem',
        reason: 'DEFAULT',
        message: 'Palikt pie vienības'
    };
};

/**
 * Get UI configuration for item based on inheritance rules
 * @param {object} inventory - Inventory object
 * @param {object} item - Item object
 * @returns {object} UI configuration
 */
export const getItemUIConfig = (inventory, item) => {
    const inheritanceInfo = getInheritanceInfo(inventory);
    const validation = validateRecordCreation(inventory, item);
    const recordCount = item.records ? item.records.length : 0;

    return {
        showCreateRecordButton: validation.allowed,
        maxRecordsAllowed: inheritanceInfo.maxRecords,
        currentRecordCount: recordCount,
        canCreateMore: validation.allowed,
        
        badge: {
            text: inheritanceInfo.displayName,
            color: inheritanceInfo.color,
            icon: inheritanceInfo.icon
        },
        
        validation: {
            allowed: validation.allowed,
            message: validation.message,
            reason: validation.reason
        },
        
        viewMode: inheritanceInfo.viewMode,
        usesSegmentedView: inheritanceInfo.usesSegmentedView,
        usesCombinedView: inheritanceInfo.usesCombinedView
    };
};

/**
 * Get attention status for an item
 * @param {object} inventory - Inventory object
 * @param {object} item - Item object
 * @returns {object} Attention status
 */
export const getItemAttentionStatus = (inventory, item) => {
    const inheritanceInfo = getInheritanceInfo(inventory);
    const recordCount = item.records ? item.records.length : 0;

    if (recordCount === 0) {
        return {
            level: 'warning',
            message: 'Nav ierakstu',
            icon: '⚠️',
            color: 'var(--color-warning)'
        };
    }

    // For one-to-one relationships (media), check if complete
    if (inheritanceInfo.isOneToOne && recordCount === 1) {
        const record = item.records[0];
        const hasRequiredFields = record.title && record.date;
        
        if (hasRequiredFields) {
            return {
                level: 'success',
                message: 'Pabeigts',
                icon: '✓',
                color: 'var(--color-success)'
            };
        } else {
            return {
                level: 'info',
                message: 'Nepieciešams papildināt metadatus',
                icon: 'ℹ️',
                color: 'var(--color-info)'
            };
        }
    }

    // For one-to-many relationships (documents)
    if (inheritanceInfo.isOneToMany) {
        return {
            level: 'info',
            message: `${recordCount} ieraksti`,
            icon: '📝',
            color: 'var(--color-primary)'
        };
    }

    return {
        level: 'info',
        message: 'Normāls',
        icon: 'ℹ️',
        color: 'var(--text-muted)'
    };
};

// ========================================
// FILE UPLOAD HELPERS
// ========================================

/**
 * Get file upload configuration for inventory type
 * @param {object} inventory - Inventory object
 * @returns {object} File upload configuration
 */
export const getFileUploadConfig = (inventory) => {
    const inheritanceInfo = getInheritanceInfo(inventory);
    const constraints = inheritanceInfo.constraints;

    return {
        acceptAttribute: constraints.acceptAttribute || '*/*',
        acceptedFileTypes: constraints.acceptedFileTypes || [],
        maxFiles: constraints.workflow.allowsMultipleFiles ? 10 : 1,
        requiresUpload: constraints.workflow.requiresFileUpload,
        allowsUpload: constraints.workflow.allowsFileUpload,
        allowsMultiple: constraints.workflow.allowsMultipleFiles,
        uploadTiming: constraints.workflow.fileUploadTiming
    };
};

/**
 * Check if file type is allowed for inventory
 * @param {File} file - File object
 * @param {object} inventory - Inventory object
 * @returns {boolean} Is allowed
 */
export const isFileTypeAllowed = (file, inventory) => {
    const config = getFileUploadConfig(inventory);
    
    if (!config.acceptedFileTypes || config.acceptedFileTypes.length === 0) {
        return true; // Allow all if not specified
    }

    return config.acceptedFileTypes.includes(file.type);
};

// ========================================
// STATISTICS FUNCTIONS
// ========================================

/**
 * Get record statistics for an item
 * @param {object} item - Item object
 * @param {object} inventory - Inventory object
 * @returns {object} Statistics
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
        if (record.files && record.files.length > 0) {
            filesCount += record.files.length;
            
            const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.mp3', '.wav'];
            hasMediaFiles = hasMediaFiles || record.files.some(file => 
                mediaExtensions.some(ext => file.original_name?.toLowerCase().endsWith(ext))
            );
        }

        const isComplete = record.title && record.date;
        
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
        completionRate: records.length > 0 ? 
            Math.round((completedRecords / records.length) * 100) : 0,
        maxRecordsAllowed: inheritanceInfo.constraints.maxRecords,
        canCreateMore: records.length < inheritanceInfo.constraints.maxRecords
    };
};

/**
 * Get inventory statistics
 * @param {object} inventory - Inventory object
 * @returns {object} Statistics
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
        completionRate: items.length > 0 ? 
            Math.round((itemsWithRecords / items.length) * 100) : 0
    };
};

/**
 * Get project statistics
 * @param {object} project - Project object
 * @returns {object} Statistics
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
 * Get item completion status
 * @param {object} item - Item object
 * @param {object} inventory - Inventory object
 * @returns {object} Completion status
 */
export const getItemCompletionStatus = (item, inventory) => {
    const stats = getRecordStatistics(item, inventory);
    const inheritanceInfo = getInheritanceInfo(inventory);
    
    let status = 'empty';
    let message = 'Nav ierakstu';
    let color = 'var(--text-muted)';
    
    if (stats.totalRecords === 0) {
        status = 'empty';
        message = 'Nav ierakstu';
        color = 'var(--text-muted)';
    } else if (inheritanceInfo.isOneToOne && stats.totalRecords === 1 && stats.completedRecords === 1) {
        status = 'complete';
        message = 'Pabeigts';
        color = 'var(--color-success)';
    } else if (stats.completionRate === 100) {
        status = 'complete';
        message = 'Visi ieraksti pabeigti';
        color = 'var(--color-success)';
    } else if (stats.completionRate > 0) {
        status = 'partial';
        message = `${stats.completionRate}% pabeigts`;
        color = 'var(--color-warning)';
    } else {
        status = 'draft';
        message = 'Melnraksts';
        color = 'var(--color-warning)';
    }
    
    return {
        status,
        message,
        color,
        percentage: stats.completionRate
    };
};

// ========================================
// DEFAULT EXPORT
// ========================================

export default {
    // Main functions
    getInheritanceInfo,
    validateRecordCreation,
    getNavigationBehavior,
    getItemUIConfig,
    getItemAttentionStatus,
    
    // Statistics functions
    getRecordStatistics,
    getInventoryStatistics,
    getProjectStatistics,
    getItemCompletionStatus,
    
    // File upload helpers
    getFileUploadConfig,
    isFileTypeAllowed,
    
    // Category determination
    determineCategory,
    
    // Constants
    INVENTORY_TYPES,
    CATEGORY_TYPES,
    MEDIA_INVENTORY_TYPES,
    TEXTUAL_INVENTORY_TYPES,
    INHERITANCE_BEHAVIOR,
    VIEW_MODES,
    CATEGORY_CONSTRAINTS,
    MEDIA_SUBTYPE_CONFIG
};