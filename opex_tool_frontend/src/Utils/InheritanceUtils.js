// src/Utils/InheritanceUtils.js
// Enhanced utility for managing inventory inheritance with Electronic flag support

// Note: Constants are imported from ConstantsContext where needed

// Must match backend: helpers/constants.py VVAIS_TYPE_LIST
export const INVENTORY_TYPES = {
    TEXTUAL: 'Tekstuāls',
    PHOTO: 'Foto',
    AUDIO: 'Skaņas',
    VIDEO: 'Video'
};

export const CATEGORY_TYPES = {
    DOCUMENTS: 'DOCUMENTS',                      // Textual + electronic: false
    ELECTRONIC_DOCUMENTS: 'ELECTRONIC_DOCUMENTS', // Textual + electronic: true
    ELECTRONIC_MEDIA: 'ELECTRONIC_MEDIA',        // Photo/Audio/Video + electronic: true
    MEDIA: 'MEDIA'                               // Photo/Audio/Video + electronic: false
};

export const MEDIA_INVENTORY_TYPES = [
    INVENTORY_TYPES.PHOTO,
    INVENTORY_TYPES.AUDIO,
    INVENTORY_TYPES.VIDEO
];

export const TEXTUAL_INVENTORY_TYPES = [
    INVENTORY_TYPES.TEXTUAL
];

export const INHERITANCE_BEHAVIOR = {
    ONE_TO_MANY: 'ONE_TO_MANY',    // One item can have multiple records
    ONE_TO_ONE: 'ONE_TO_ONE'        // One item should have exactly one record
};

export const VIEW_MODES = {
    SEGMENTED: 'SEGMENTED',        // Overview + Records List (for Documents types)
    COMBINED: 'COMBINED'           // Item + Record combined view (for Media types)
};

/**
 * Determine the category based on type and electronic flag
 * @param {string} type - Inventory type (Foto, Video, Audio, Tekstuāls, Datubāze)
 * @param {boolean} electronic - Electronic flag
 * @returns {string} Category type
 */
export const determineCategory = (type, electronic) => {
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

export const MEDIA_SUBTYPE_CONFIG = {
    [INVENTORY_TYPES.PHOTO]: {
        icon: '📷',
        displayName: 'Foto',
        acceptedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/tiff', 'image/bmp'],
        acceptAttribute: 'image/*',
        specificFields: ['horizontal_resolution', 'vertical_resolution', 'color'],
        autoExtractableFields: ['horizontal_resolution', 'vertical_resolution', 'color'],
        manualFields: [] // All fields can be auto-extracted
    },
    [INVENTORY_TYPES.VIDEO]: {
        icon: '🎥',
        displayName: 'Video',
        acceptedFileTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv'],
        acceptAttribute: 'video/*',
        specificFields: ['duration', 'horizontal_resolution', 'vertical_resolution', 'color'],
        autoExtractableFields: ['duration', 'horizontal_resolution', 'vertical_resolution', 'color'],
        manualFields: [] // All fields can be auto-extracted
    },
    [INVENTORY_TYPES.AUDIO]: {
        icon: '🎵',
        displayName: 'Audio',
        acceptedFileTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/m4a'],
        acceptAttribute: 'audio/*',
        specificFields: ['duration'],
        autoExtractableFields: ['duration'],
        manualFields: [] // All fields can be auto-extracted
    }
};

/**
 * Get expected auto-extractable fields for a media type
 * @param {string} mediaType - Media type (Foto, Video, Skaņas)
 * @returns {Array<string>} Expected auto-extractable field names
 */
export const getExpectedAutoFields = (mediaType) => {
    const config = MEDIA_SUBTYPE_CONFIG[mediaType];
    return config ? config.autoExtractableFields : [];
};

/**
 * Check if all expected fields were successfully populated (auto-extracted or manually entered)
 * @param {object} mediaRecord - Media record response from backend
 * @param {string} mediaType - Media type (Foto, Video, Skaņas)
 * @returns {object} Status of field population
 */
export const checkAutoExtractionComplete = (mediaRecord, mediaType) => {
    if (!mediaRecord) {
        return {
            complete: false,
            populated: [],
            missing: [],
            failed: true
        };
    }

    const expectedFields = getExpectedAutoFields(mediaType);

    // Check which expected fields are actually populated (not null/empty)
    const populatedFields = [];
    const missingFields = [];

    expectedFields.forEach(field => {
        const value = mediaRecord[field];
        const isPopulated = value !== null && value !== undefined && value !== '';

        if (isPopulated) {
            populatedFields.push(field);
        } else {
            missingFields.push(field);
        }
    });

    return {
        complete: missingFields.length === 0,
        populated: populatedFields,
        missing: missingFields,
        failed: populatedFields.length === 0 && expectedFields.length > 0
    };
};

/**
 * Check if a specific field is populated in a media record
 * @param {string} fieldName - Field name to check
 * @param {object} mediaRecord - Media record object
 * @returns {boolean} True if field has a value
 */
export const isFieldAutoExtracted = (fieldName, mediaRecord) => {
    if (!mediaRecord || typeof mediaRecord !== 'object') return false;
    const value = mediaRecord[fieldName];
    return value !== null && value !== undefined && value !== '';
};

/**
 * Calculate total file size for a media record's files
 * @param {Array} files - Array of file objects
 * @returns {number} Total size in bytes
 */
export const calculateMediaFilesTotalSize = (files) => {
    if (!files || !Array.isArray(files)) return 0;
    return files.reduce((total, file) => total + (file.size || 0), 0);
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get user-friendly field names in Latvian
 * @param {string} fieldName - Technical field name
 * @returns {string} Latvian display name
 */
export const getFieldDisplayName = (fieldName) => {
    const fieldNames = {
        'color': 'Krāsa',
        'horizontal_resolution': 'Horizontālā izšķirtspēja',
        'vertical_resolution': 'Vertikālā izšķirtspēja',
        'duration': 'Ilgums'
    };

    return fieldNames[fieldName] || fieldName;
};

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
    const constraints = { ...CATEGORY_CONSTRAINTS[category] };

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
        isElectronicMedia: category === CATEGORY_TYPES.ELECTRONIC_MEDIA,
        isMedia: category === CATEGORY_TYPES.MEDIA,

        isTextual: category === CATEGORY_TYPES.DOCUMENTS ||
                   category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS,
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
 * @returns {object} Navigation behavior
 */
export const getNavigationBehavior = (inventory, item = null) => {
    const inheritanceInfo = getInheritanceInfo(inventory);

    // For combined view (media types), navigate to the record/item combined view
    if (inheritanceInfo.usesCombinedView) {
        return {
            action: 'navigateToItemCombined',
            reason: 'COMBINED_VIEW',
            message: 'Pāriet uz vienību (kombinētais skats)',
            hasRecord: item ? (item.photo_records?.length > 0 || item.video_records?.length > 0 || item.audio_records?.length > 0) : false,
        };
    }

    // For segmented view (document types), stay at item to show records list
    if (inheritanceInfo.usesSegmentedView) {
        return {
            action: 'stayAtItemSegmented',
            reason: 'SEGMENTED_VIEW',
            message: 'Palikt pie vienības (segmentētais skats)',
            recordCount: item?.records?.length || 0,
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
    const stats = getRecordStatistics(item, inventory);
    const recordCount = stats.totalRecords;

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
        const isComplete = stats.completedRecords === 1;

        if (isComplete) {
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

    const inheritanceInfo = getInheritanceInfo(inventory);
    const category = inheritanceInfo.category;

    let totalRecords = 0;
    let completedRecords = 0;
    let filesCount = 0;
    let totalFileSize = 0;
    let hasMediaFiles = false;

    // For electronic media, check the corresponding media record array
    if (category === CATEGORY_TYPES.ELECTRONIC_MEDIA) {
        let mediaRecordArray = [];

        if (inventory.type === INVENTORY_TYPES.PHOTO) {
            mediaRecordArray = item.photo_records || [];
        } else if (inventory.type === INVENTORY_TYPES.VIDEO) {
            mediaRecordArray = item.video_records || [];
        } else if (inventory.type === INVENTORY_TYPES.AUDIO) {
            mediaRecordArray = item.audio_records || [];
        }

        totalRecords = mediaRecordArray.length;

        mediaRecordArray.forEach(mediaRecord => {
            let isComplete = false;

            if (inventory.type === INVENTORY_TYPES.PHOTO) {
                isComplete = mediaRecord.color &&
                           mediaRecord.horizontal_resolution &&
                           mediaRecord.vertical_resolution;
            } else if (inventory.type === INVENTORY_TYPES.VIDEO) {
                isComplete = mediaRecord.color &&
                           mediaRecord.duration &&
                           mediaRecord.horizontal_resolution &&
                           mediaRecord.vertical_resolution;
            } else if (inventory.type === INVENTORY_TYPES.AUDIO) {
                isComplete = mediaRecord.duration && mediaRecord.duration.trim() !== '';
            }

            if (isComplete) {
                completedRecords++;
            }

            // Count actual files from nested files array
            const mediaFiles = mediaRecord.files || [];
            filesCount += mediaFiles.length;
            totalFileSize += calculateMediaFilesTotalSize(mediaFiles);
            if (mediaFiles.length > 0) {
                hasMediaFiles = true;
            }
        });
    } else {
        // For non-electronic-media, use regular records array
        const records = item.records || [];
        totalRecords = records.length;

        records.forEach(record => {
            if (record.files && record.files.length > 0) {
                filesCount += record.files.length;
                record.files.forEach(file => {
                    totalFileSize += file.size || 0;
                });

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
    }

    return {
        totalRecords,
        completedRecords,
        draftRecords: totalRecords - completedRecords,
        filesCount,
        totalFileSize,
        totalFileSizeFormatted: formatFileSize(totalFileSize),
        hasMediaFiles,
        completionRate: totalRecords > 0 ?
            Math.round((completedRecords / totalRecords) * 100) : 0,
        maxRecordsAllowed: inheritanceInfo.constraints.maxRecords,
        canCreateMore: totalRecords < inheritanceInfo.constraints.maxRecords
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
    const inheritanceInfo = getInheritanceInfo(inventory);
    const category = inheritanceInfo.category;
    let totalRecords = 0;
    let itemsWithRecords = 0;

    items.forEach(item => {
        let recordCount = 0;

        // For electronic media, count the corresponding media record array
        if (category === CATEGORY_TYPES.ELECTRONIC_MEDIA) {
            if (inventory.type === INVENTORY_TYPES.PHOTO) {
                recordCount = item.photo_records ? item.photo_records.length : 0;
            } else if (inventory.type === INVENTORY_TYPES.VIDEO) {
                recordCount = item.video_records ? item.video_records.length : 0;
            } else if (inventory.type === INVENTORY_TYPES.AUDIO) {
                recordCount = item.audio_records ? item.audio_records.length : 0;
            }
        } else {
            // For non-electronic-media, count regular records
            recordCount = item.records ? item.records.length : 0;
        }

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

            // Use getInventoryStatistics to properly count records (including media records)
            const stats = getInventoryStatistics(inventory);
            totalRecords += stats.totalRecords;
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

/**
 * Validate a file against category rules
 * @param {object} file - File object
 * @param {string} category - Category type
 * @param {string} inventoryType - Inventory type
 * @returns {object} Validation result
 */
export const validateFile = (file, category, inventoryType) => {
    const errors = [];
    const warnings = [];

    if (!file.original_name) {
        errors.push({
            id: 'FILE_MISSING',
            message: 'Fails ir pazudis vai ir izdzēsts',
            severity: 'ERROR',
            field: 'original_name'
        });
    }

    if (file.size === 0) {
        errors.push({
            id: 'FILE_ZERO_SIZE',
            message: 'Failam ir nulles izmērs',
            severity: 'ERROR',
            field: 'size'
        });
    }

    // File type mismatch for electronic media
    if (category === CATEGORY_TYPES.ELECTRONIC_MEDIA && file.extension) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.mkv'];
        const audioExtensions = ['.mp3', '.wav', '.aac', '.ogg', '.m4a'];

        if (inventoryType === INVENTORY_TYPES.PHOTO && !imageExtensions.includes(file.extension.toLowerCase())) {
            errors.push({
                id: 'FILE_TYPE_MISMATCH',
                message: 'Faila tips neatbilst foto medija tipam',
                severity: 'ERROR',
                field: 'extension',
                expected: 'attēla fails',
                value: file.extension
            });
        }
        if (inventoryType === INVENTORY_TYPES.VIDEO && !videoExtensions.includes(file.extension.toLowerCase())) {
            errors.push({
                id: 'FILE_TYPE_MISMATCH',
                message: 'Faila tips neatbilst video medija tipam',
                severity: 'ERROR',
                field: 'extension',
                expected: 'video fails',
                value: file.extension
            });
        }
        if (inventoryType === INVENTORY_TYPES.AUDIO && !audioExtensions.includes(file.extension.toLowerCase())) {
            errors.push({
                id: 'FILE_TYPE_MISMATCH',
                message: 'Faila tips neatbilst audio medija tipam',
                severity: 'ERROR',
                field: 'extension',
                expected: 'audio fails',
                value: file.extension
            });
        }
    }

    if (file.size > 500 * 1024 * 1024) {
        warnings.push({
            id: 'FILE_LARGE_SIZE',
            message: 'Fails ir ļoti liels (>500MB) un var radīt problēmas pakotnes ģenerēšanā',
            severity: 'WARNING',
            field: 'size',
            value: file.size
        });
    }

    if (category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS && file.size > 0 && file.size < 2048) {
        const fileSizeKB = (file.size / 1024).toFixed(2);
        warnings.push({
            id: 'TEXTUAL_FILE_SMALL_SIZE',
            message: `Tekstuālā dokumenta fails ir ļoti mazs (${fileSizeKB} KB). Pārliecinieties, ka fails ir pareizais`,
            severity: 'WARNING',
            field: 'size',
            value: file.size,
            threshold: 2048
        });
    }

    if (!file.original_name || !file.extension) {
        warnings.push({
            id: 'FILE_MISSING_METADATA',
            message: 'Faila metadati ir nepilnīgi (trūkst nosaukuma vai paplašinājuma)',
            severity: 'WARNING',
            field: 'metadata'
        });
    }

    return {
        valid: errors.length === 0,
        status: errors.length > 0 ? 'ERROR' : warnings.length > 0 ? 'WARNING' : 'VALID',
        errors,
        warnings,
        details: {
            totalIssues: errors.length + warnings.length,
            criticalIssues: errors.length
        }
    };
};

/**
 * Validate a record against category rules
 * @param {object} record - Record object with files
 * @param {string} category - Category type
 * @param {string} inventoryType - Inventory type
 * @returns {object} Validation result
 */
export const validateRecord = (record, category, inventoryType) => {
    const errors = [];
    const warnings = [];
    const fileValidations = [];

    if (!record.title || record.title.trim() === '') {
        errors.push({
            id: 'RECORD_MISSING_TITLE',
            message: 'Dokumenta nosaukums ir obligāts',
            severity: 'ERROR',
            field: 'title'
        });
    }

    if (!record.date) {
        errors.push({
            id: 'RECORD_MISSING_DATE',
            message: 'Dokumenta datums ir obligāts',
            severity: 'ERROR',
            field: 'date'
        });
    }

    // Electronic documents must have files
    if (category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS) {
        if (!record.files || record.files.length === 0) {
            errors.push({
                id: 'ELECTRONIC_DOC_NO_FILES',
                message: 'Elektroniskajam dokumentam jābūt vismaz vienam failam',
                severity: 'ERROR',
                field: 'files'
            });
        }
    }

    // Electronic media must have exactly one file
    if (category === CATEGORY_TYPES.ELECTRONIC_MEDIA) {
        if (!record.files || record.files.length === 0) {
            errors.push({
                id: 'ELECTRONIC_MEDIA_NO_FILE',
                message: 'Elektroniskajam medijam jābūt tieši vienam failam',
                severity: 'ERROR',
                field: 'files'
            });
        }
    }

    if (!record.annotation || record.annotation.trim() === '') {
        warnings.push({
            id: 'RECORD_MISSING_ANNOTATION',
            message: 'Ieteicams pievienot anotāciju labākai dokumentācijai',
            severity: 'WARNING',
            field: 'annotation'
        });
    }

    if (!record.key_words || record.key_words.trim() === '') {
        warnings.push({
            id: 'RECORD_MISSING_KEYWORDS',
            message: 'Ieteicami pievienot atslēgvārdus meklēšanas uzlabošanai',
            severity: 'WARNING',
            field: 'key_words'
        });
    }

    // Validate files if present
    if (record.files && record.files.length > 0) {
        record.files.forEach((file, index) => {
            const fileValidation = validateFile(file, category, inventoryType);
            fileValidations.push(fileValidation);

            if (fileValidation.status === 'ERROR') {
                errors.push({
                    id: 'FILE_VALIDATION_FAILED',
                    message: `Failam "${file.original_name || `fails ${index + 1}`}" ir kļūdas`,
                    severity: 'ERROR',
                    fileErrors: fileValidation.errors
                });
            }
        });
    }

    return {
        valid: errors.length === 0,
        status: errors.length > 0 ? 'ERROR' : warnings.length > 0 ? 'WARNING' : 'VALID',
        errors,
        warnings,
        fileValidations,
        details: {
            totalIssues: errors.length + warnings.length,
            criticalIssues: errors.length,
            filesValidated: fileValidations.length,
            filesWithErrors: fileValidations.filter(fv => fv.status === 'ERROR').length
        }
    };
};

/**
 * Validate an item against category rules
 * @param {object} item - Item object with records
 * @param {object} inventory - Inventory object
 * @returns {object} Validation result
 */
export const validateItem = (item, inventory) => {
    const inheritanceInfo = getInheritanceInfo(inventory);
    const category = inheritanceInfo.category;
    const errors = [];
    const warnings = [];
    const recordValidations = [];

    // For electronic media, check the corresponding media record array instead of records
    if (category === CATEGORY_TYPES.ELECTRONIC_MEDIA) {
        let mediaRecordArray = null;
        let mediaRecordFieldName = '';
        let mediaTypeName = '';

        if (inventory.type === INVENTORY_TYPES.PHOTO) {
            mediaRecordArray = item.photo_records;
            mediaRecordFieldName = 'photo_records';
            mediaTypeName = 'foto';
        } else if (inventory.type === INVENTORY_TYPES.VIDEO) {
            mediaRecordArray = item.video_records;
            mediaRecordFieldName = 'video_records';
            mediaTypeName = 'video';
        } else if (inventory.type === INVENTORY_TYPES.AUDIO) {
            mediaRecordArray = item.audio_records;
            mediaRecordFieldName = 'audio_records';
            mediaTypeName = 'audio';
        }

        if (!mediaRecordArray || mediaRecordArray.length === 0) {
            errors.push({
                id: 'ITEM_NO_MEDIA_RECORDS',
                message: `Elektroniskā ${mediaTypeName} vienībai jābūt atbilstošam ${mediaTypeName} ierakstam (${mediaRecordFieldName})`,
                severity: 'ERROR',
                field: mediaRecordFieldName
            });
        } else {
            mediaRecordArray.forEach((mediaRecord) => {
                const missingFields = [];

                if (inventory.type === INVENTORY_TYPES.PHOTO) {
                    if (!mediaRecord.color || mediaRecord.color.trim() === '') {
                        missingFields.push('krāsa');
                    }
                    if (!mediaRecord.horizontal_resolution) {
                        missingFields.push('horizontālā izšķirtspēja');
                    }
                    if (!mediaRecord.vertical_resolution) {
                        missingFields.push('vertikālā izšķirtspēja');
                    }
                } else if (inventory.type === INVENTORY_TYPES.VIDEO) {
                    if (!mediaRecord.color || mediaRecord.color.trim() === '') {
                        missingFields.push('krāsa');
                    }
                    if (!mediaRecord.duration || mediaRecord.duration.trim() === '') {
                        missingFields.push('ilgums');
                    }
                    if (!mediaRecord.horizontal_resolution) {
                        missingFields.push('horizontālā izšķirtspēja');
                    }
                    if (!mediaRecord.vertical_resolution) {
                        missingFields.push('vertikālā izšķirtspēja');
                    }
                } else if (inventory.type === INVENTORY_TYPES.AUDIO) {
                    if (!mediaRecord.duration || mediaRecord.duration.trim() === '') {
                        missingFields.push('ilgums');
                    }
                }

                if (missingFields.length > 0) {
                    errors.push({
                        id: 'MEDIA_RECORD_INCOMPLETE',
                        message: `${mediaTypeName} ierakstam trūkst obligāto lauku: ${missingFields.join(', ')}`,
                        severity: 'ERROR',
                        field: mediaRecordFieldName,
                        missingFields: missingFields
                    });
                }

                if (inventory.type === INVENTORY_TYPES.PHOTO) {
                    const MIN_RESOLUTION = 1000;
                    if (mediaRecord.horizontal_resolution && mediaRecord.horizontal_resolution < MIN_RESOLUTION) {
                        warnings.push({
                            id: 'PHOTO_LOW_HORIZONTAL_RESOLUTION',
                            message: `Foto horizontālā izšķirtspēja (${mediaRecord.horizontal_resolution}px) ir zemāka par ieteikto minimumu (${MIN_RESOLUTION}px). Pārliecinieties, ka attēls ir pareizais`,
                            severity: 'WARNING',
                            field: 'horizontal_resolution',
                            value: mediaRecord.horizontal_resolution,
                            threshold: MIN_RESOLUTION
                        });
                    }
                    if (mediaRecord.vertical_resolution && mediaRecord.vertical_resolution < MIN_RESOLUTION) {
                        warnings.push({
                            id: 'PHOTO_LOW_VERTICAL_RESOLUTION',
                            message: `Foto vertikālā izšķirtspēja (${mediaRecord.vertical_resolution}px) ir zemāka par ieteikto minimumu (${MIN_RESOLUTION}px). Pārliecinieties, ka attēls ir pareizais`,
                            severity: 'WARNING',
                            field: 'vertical_resolution',
                            value: mediaRecord.vertical_resolution,
                            threshold: MIN_RESOLUTION
                        });
                    }
                }

                if (inventory.type === INVENTORY_TYPES.VIDEO || inventory.type === INVENTORY_TYPES.AUDIO) {
                    const MIN_DURATION_SECONDS = 60; // 1 minute
                    if (mediaRecord.duration && mediaRecord.duration.trim() !== '') {
                        // Parse duration in HH:MM:SS format
                        const durationParts = mediaRecord.duration.split(':');
                        if (durationParts.length === 3) {
                            const hours = parseInt(durationParts[0]) || 0;
                            const minutes = parseInt(durationParts[1]) || 0;
                            const seconds = parseInt(durationParts[2]) || 0;
                            const totalSeconds = hours * 3600 + minutes * 60 + seconds;

                            if (totalSeconds < MIN_DURATION_SECONDS) {
                                const mediaTypeLabel = inventory.type === INVENTORY_TYPES.VIDEO ? 'Video' : 'Audio';
                                warnings.push({
                                    id: inventory.type === INVENTORY_TYPES.VIDEO ? 'VIDEO_SHORT_DURATION' : 'AUDIO_SHORT_DURATION',
                                    message: `${mediaTypeLabel} ilgums (${mediaRecord.duration}) ir īsāks par 1 minūti. Pārliecinieties, ka fails ir pareizais`,
                                    severity: 'WARNING',
                                    field: 'duration',
                                    value: mediaRecord.duration,
                                    totalSeconds: totalSeconds,
                                    threshold: MIN_DURATION_SECONDS
                                });
                            }
                        }
                    }
                }
            });
        }
    } else if (inventory.electronic) {
        // For electronic textual items (electronic = true, NOT media), check regular records array
        // Physical items (electronic = false) do NOT require records - item alone is valid
        if (!item.records || item.records.length === 0) {
            errors.push({
                id: 'ITEM_NO_RECORDS',
                message: 'Elektroniskā vienībai jābūt vismaz vienam dokumentam',
                severity: 'ERROR',
                field: 'records'
            });
        }
    }
    // Physical items (electronic = false) - No record validation needed

    if (!item.title || item.title.trim() === '') {
        errors.push({
            id: 'ITEM_MISSING_TITLE',
            message: 'Vienības nosaukums ir obligāts',
            severity: 'ERROR',
            field: 'title'
        });
    }

    if (!item.number) {
        errors.push({
            id: 'ITEM_MISSING_NUMBER',
            message: 'Vienības numurs ir obligāts',
            severity: 'ERROR',
            field: 'number'
        });
    }

    // Skip notes warning for electronic textual documents
    if (category !== CATEGORY_TYPES.ELECTRONIC_DOCUMENTS && (!item.notes || item.notes.trim() === '')) {
        warnings.push({
            id: 'ITEM_MISSING_NOTES',
            message: 'Ieteicams pievienot piezīmes',
            severity: 'WARNING',
            field: 'notes'
        });
    }

    // Validate records if present (only for electronic items, not physical)
    if (inventory.electronic && item.records && item.records.length > 0) {
        item.records.forEach((record, index) => {
            const recordValidation = validateRecord(record, category, inventory.type);
            recordValidations.push(recordValidation);

            if (recordValidation.status === 'ERROR') {
                recordValidation.errors.forEach(recordError => {
                    let detailedMessage = `Vienība <strong>${item.number}</strong> "<strong>${item.title || 'bez nosaukuma'}</strong>", Dokuments "<strong>${record.title || 'bez nosaukuma'}</strong>"`;

                    if (recordError.id === 'FILE_VALIDATION_FAILED' && recordError.fileErrors) {
                        const fileError = recordError.fileErrors[0];
                        detailedMessage += ` - fails "${recordError.fileErrors[0]?.message || 'ir kļūdas'}"`;
                    } else if (recordError.id === 'ELECTRONIC_DOC_NO_FILES') {
                        detailedMessage += ' - trūkst fails';
                    } else {
                        detailedMessage += ` - ${recordError.message}`;
                    }

                    errors.push({
                        id: 'RECORD_VALIDATION_FAILED',
                        message: detailedMessage,
                        severity: 'ERROR',
                        recordErrors: [recordError]
                    });
                });
            }

            if (recordValidation.warnings && recordValidation.warnings.length > 0) {
                recordValidation.warnings.forEach(recordWarning => {
                    let detailedMessage = `Vienība <strong>${item.number}</strong> "<strong>${item.title || 'bez nosaukuma'}</strong>", Dokuments "<strong>${record.title || 'bez nosaukuma'}</strong>"`;
                    detailedMessage += ` - ${recordWarning.message}`;

                    warnings.push({
                        id: recordWarning.id,
                        message: detailedMessage,
                        severity: 'WARNING',
                        field: recordWarning.field
                    });
                });
            }
        });
    }

    return {
        valid: errors.length === 0,
        status: errors.length > 0 ? 'ERROR' : warnings.length > 0 ? 'WARNING' : 'VALID',
        errors,
        warnings,
        recordValidations,
        details: {
            totalIssues: errors.length + warnings.length,
            criticalIssues: errors.length,
            recordsValidated: recordValidations.length,
            recordsWithErrors: recordValidations.filter(rv => rv.status === 'ERROR').length
        }
    };
};

/**
 * Validate an inventory
 * @param {object} inventory - Inventory object with items
 * @returns {object} Validation result
 */
export const validateInventory = (inventory) => {
    const errors = [];
    const warnings = [];
    const itemValidations = [];

    if (!inventory.number) {
        errors.push({
            id: 'INVENTORY_MISSING_NUMBER',
            message: 'Uzskaites saraksta numurs ir obligāts',
            severity: 'ERROR',
            field: 'number'
        });
    }

    if (!inventory.type) {
        errors.push({
            id: 'INVENTORY_MISSING_TYPE',
            message: 'Uzskaites saraksta tips ir obligāts',
            severity: 'ERROR',
            field: 'type'
        });
    }

    // Only error if user created inventory (from_report=false) and has dates but no items
    const hasNoItems = !inventory.items || inventory.items.length === 0;
    const hasDates = inventory.start_date || inventory.end_date;
    const isUserCreated = inventory.from_report === false;

    if (hasNoItems && isUserCreated && hasDates) {
        errors.push({
            id: 'INVENTORY_NO_ITEMS',
            message: 'Uzskaites sarakstam ir norādīti datumi, bet nav vienību - pievienojiet vienības vai noņemiet datumus',
            severity: 'ERROR',
            field: 'items'
        });
    }

    if (inventory.items && inventory.items.length > 0) {
        inventory.items.forEach((item, index) => {
            const itemValidation = validateItem(item, inventory);
            itemValidations.push(itemValidation);

            if (itemValidation.status === 'ERROR') {
                itemValidation.errors.forEach(itemError => {
                    let detailedMessage = '';

                    // Record validation errors already have full context
                    if (itemError.id === 'RECORD_VALIDATION_FAILED') {
                        detailedMessage = `Uzskaites saraksts <strong>${inventory.number}</strong>, ${itemError.message}`;
                    } else {
                        detailedMessage = `Uzskaites saraksts <strong>${inventory.number}</strong>, Vienība <strong>${item.number}</strong> "<strong>${item.title || 'bez nosaukuma'}</strong>" - ${itemError.message}`;
                    }

                    errors.push({
                        id: 'ITEM_VALIDATION_FAILED',
                        message: detailedMessage,
                        severity: 'ERROR',
                        itemErrors: [itemError]
                    });
                });
            }

            if (itemValidation.warnings && itemValidation.warnings.length > 0) {
                itemValidation.warnings.forEach(itemWarning => {
                    let detailedMessage = `Uzskaites saraksts <strong>${inventory.number}</strong>, Vienība <strong>${item.number}</strong> "<strong>${item.title || 'bez nosaukuma'}</strong>" - ${itemWarning.message}`;

                    warnings.push({
                        id: itemWarning.id,
                        message: detailedMessage,
                        severity: 'WARNING',
                        field: itemWarning.field
                    });
                });
            }
        });
    }

    return {
        valid: errors.length === 0,
        status: errors.length > 0 ? 'ERROR' : warnings.length > 0 ? 'WARNING' : 'VALID',
        errors,
        warnings,
        itemValidations,
        details: {
            totalIssues: errors.length + warnings.length,
            criticalIssues: errors.length,
            itemsValidated: itemValidations.length,
            itemsWithErrors: itemValidations.filter(iv => iv.status === 'ERROR').length,
            totalRecords: itemValidations.reduce((sum, iv) =>
                sum + (iv.recordValidations?.length || 0), 0),
            totalFiles: itemValidations.reduce((sum, iv) =>
                sum + iv.recordValidations.reduce((rsum, rv) =>
                    rsum + (rv.fileValidations?.length || 0), 0), 0)
        }
    };
};

/**
 * Validate entire project for OPEX readiness
 * @param {object} project - Project object
 * @returns {object} Complete validation result
 */
export const validateProjectForOPEX = (project) => {
    const inventoryValidations = [];
    const errors = [];
    const warnings = [];

    const hasSigners = project.institution?.creator &&
                       project.institution?.creator_position &&
                       project.institution?.signer &&
                       project.institution?.signer_position;

    if (!hasSigners) {
        errors.push({
            id: 'MISSING_SIGNERS',
            message: 'Institūcijas parakstītāji nav pievienoti. Lūdzu, pievienojiet izveidotāja un parakstītāja informāciju.',
            severity: 'ERROR'
        });
    }

    if (!project.institution?.fond?.inventories) {
        errors.push({
            id: 'NO_INVENTORIES',
            message: 'Projektam nav uzskaites sarakstu',
            severity: 'ERROR'
        });

        return {
            valid: false,
            status: 'ERROR',
            errors: errors,
            warnings: [],
            inventoryValidations: [],
            summary: {
                readyForOPEX: false,
                totalInventories: 0,
                validInventories: 0,
                inventoriesWithErrors: 0,
                inventoriesWithWarnings: 0
            }
        };
    }

    const inventories = project.institution.fond.inventories;

    inventories.forEach((inventory, index) => {
        const invValidation = validateInventory(inventory);
        inventoryValidations.push({
            inventory: {
                id: inventory.id,
                number: inventory.number,
                type: inventory.type
            },
            validation: invValidation
        });

        if (invValidation.status === 'ERROR') {
            errors.push({
                id: 'INVENTORY_NOT_READY',
                message: `Uzskaites saraksts "${inventory.number || `uzskaites saraksts ${index + 1}`}" nav gatavs OPEX ģenerēšanai`,
                severity: 'ERROR',
                inventoryErrors: invValidation.errors
            });
        }

        if (invValidation.warnings && invValidation.warnings.length > 0) {
            invValidation.warnings.forEach(warning => {
                warnings.push({
                    id: warning.id || 'INVENTORY_WARNING',
                    message: warning.message,
                    severity: 'WARNING',
                    inventoryId: inventory.id,
                    inventoryNumber: inventory.number
                });
            });
        }
    });

    const validInventories = inventoryValidations.filter(
        iv => iv.validation.status === 'VALID'
    ).length;

    const totalErrors = errors.length;
    const totalWarnings = warnings.length;

    return {
        valid: errors.length === 0,
        status: errors.length > 0 ? 'ERROR' : warnings.length > 0 ? 'WARNING' : 'VALID',
        errors,
        warnings,
        inventoryValidations,
        summary: {
            readyForOPEX: errors.length === 0,
            totalInventories: inventories.length,
            validInventories: validInventories,
            inventoriesWithErrors: inventoryValidations.filter(
                iv => iv.validation.status === 'ERROR'
            ).length,
            inventoriesWithWarnings: inventoryValidations.filter(
                iv => iv.validation.status === 'WARNING'
            ).length,
            totalErrors: totalErrors,
            totalWarnings: totalWarnings
        }
    };
};

export default {
    getInheritanceInfo,
    validateRecordCreation,
    getNavigationBehavior,
    getItemUIConfig,
    getItemAttentionStatus,
    getRecordStatistics,
    getInventoryStatistics,
    getProjectStatistics,
    getItemCompletionStatus,
    getFileUploadConfig,
    isFileTypeAllowed,
    determineCategory,
    getExpectedAutoFields,
    checkAutoExtractionComplete,
    isFieldAutoExtracted,
    calculateMediaFilesTotalSize,
    formatFileSize,
    getFieldDisplayName,
    validateFile,
    validateRecord,
    validateItem,
    validateInventory,
    validateProjectForOPEX,
    INVENTORY_TYPES,
    CATEGORY_TYPES,
    MEDIA_INVENTORY_TYPES,
    TEXTUAL_INVENTORY_TYPES,
    INHERITANCE_BEHAVIOR,
    VIEW_MODES,
    CATEGORY_CONSTRAINTS,
    MEDIA_SUBTYPE_CONFIG
};
