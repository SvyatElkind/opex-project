// Enhanced validation that matches backend constraints
export const RECORD_VALIDATION = {
    // File types allowed per inventory type (matching backend)
    ALLOWED_FILE_TYPES: {
        'Foto': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'],
        'Video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv'],
        'Skaņas': ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/m4a'],
        'Tekstuāls': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 
                     'application/pdf', 'text/plain', 'application/msword', 
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
    
    // Media types that require single file constraint
    SINGLE_FILE_TYPES: ['Foto', 'Video', 'Skaņas'],
    
    // Text types that allow multiple files
    MULTIPLE_FILE_TYPES: ['Tekstuāls']
};

export const RECORD_ERROR_MESSAGES = {
    NO_FILES_PROVIDED: 'Nav pievienotas datnes',
    INVALID_FILE_TYPE: 'Nepareizs faila tips',
    SINGLE_FILE_ONLY: 'Šim dokumenta tipam atļauta tikai viena datne',
    MULTIPLE_FILES_NOT_ALLOWED: 'Vairākas datnes nav atļautas šim tipam',
    RECORD_TYPE_REQUIRED: 'Dokumenta tips ir obligāts',
    METADATA_CLASS_REQUIRED: 'Metadatu klase ir obligāta',
    GENERIC_ERROR: 'Radās kļūda'
};

/**
 * Validates file uploads based on inventory type and backend constraints
 * @param {File[]} files - Files to validate
 * @param {string} inventoryType - Type of inventory (Foto, Video, Skaņas, Tekstuāls)
 * @returns {object} Validation result with valid files and errors
 */
export const validateFileUploads = (files, inventoryType) => {
    const validFiles = [];
    const fileErrors = [];
    
    // Basic validation
    if (!files || files.length === 0) {
        return {
            validFiles: [],
            errors: [{ file: 'general', errors: [RECORD_ERROR_MESSAGES.NO_FILES_PROVIDED] }]
        };
    }
    
    if (!inventoryType) {
        return {
            validFiles: [],
            errors: [{ file: 'general', errors: [RECORD_ERROR_MESSAGES.RECORD_TYPE_REQUIRED] }]
        };
    }
    
    // Get allowed types for this inventory type
    const allowedTypes = RECORD_VALIDATION.ALLOWED_FILE_TYPES[inventoryType] || [];
    
    // Check single file constraint for media types
    if (RECORD_VALIDATION.SINGLE_FILE_TYPES.includes(inventoryType) && files.length > 1) {
        return {
            validFiles: [],
            errors: [{ file: 'general', errors: [RECORD_ERROR_MESSAGES.SINGLE_FILE_ONLY] }]
        };
    }
    
    // Validate each file
    files.forEach((file, index) => {
        const errors = [];

        // No file size limit — users may upload files of any size.

        // Type validation
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            errors.push(`${RECORD_ERROR_MESSAGES.INVALID_FILE_TYPE}. Atļautie tipi: ${allowedTypes.join(', ')}`);
        }
        
        if (errors.length === 0) {
            validFiles.push(file);
        } else {
            fileErrors.push({ 
                file: file.name || `File ${index + 1}`, 
                errors 
            });
        }
    });
    
    return {
        validFiles,
        errors: fileErrors
    };
};

/**
 * Validates metadata fields for Actions, Addressees, etc.
 * @param {object} metadata - Metadata object to validate
 * @param {string} metadataType - Type of metadata (Action, Addressee, Visa, ReadStatus)
 * @returns {object} Validation result
 */
export const validateMetadata = (metadata, metadataType) => {
    const errors = [];
    
    if (!metadata || typeof metadata !== 'object') {
        return {
            isValid: false,
            errors: ['Metadati nav norādīti']
        };
    }
    
    if (!metadataType) {
        return {
            isValid: false,
            errors: [RECORD_ERROR_MESSAGES.METADATA_CLASS_REQUIRED]
        };
    }
    
    // Type-specific validation
    switch (metadataType) {
        case 'Action':
            if (!metadata.action || metadata.action.trim() === '') {
                errors.push('Darbība ir obligāta');
            }
            break;
            
        case 'Addressee':
            if (!metadata.addressee || metadata.addressee.trim() === '') {
                errors.push('Adresāts ir obligāts');
            }
            break;
            
        case 'Visa':
            if (!metadata.visa || metadata.visa.trim() === '') {
                errors.push('Vīza ir obligāta');
            }
            break;
            
        case 'ReadStatus':
            if (metadata.is_read === undefined || metadata.is_read === null) {
                errors.push('Lasīšanas statuss ir obligāts');
            }
            break;
            
        default:
            errors.push('Nezināms metadatu tips');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validates record data before submission (API spec compliant)
 * @param {object} recordData - Record data to validate
 * @param {string} recordType - Type of record (standard or media)
 * @param {string} inventoryType - Inventory type (Foto, Video, Skaņas, etc.)
 * @returns {object} Validation result
 */
export const validateRecordData = (recordData, recordType = 'standard', inventoryType = null) => {
    const errors = [];
    
    if (!recordData || typeof recordData !== 'object') {
        return {
            isValid: false,
            errors: ['Dokumenta dati nav norādīti']
        };
    }
    
    // Common validations for all record types
    if (recordData.description && recordData.description.length > 1000) {
        errors.push('Apraksts nedrīkst būt garāks par 1000 rakstzīmēm');
    }
    
    // Media record specific validations (API spec compliant)
    if (recordType === 'media' && inventoryType) {
        switch (inventoryType) {
            case 'Foto':
                // Required fields for Photo records according to API
                if (!recordData.color || recordData.color.trim() === '') {
                    errors.push('Krāsa ir obligāta foto dokumentiem');
                }
                
                if (!recordData.horizontal_resolution || recordData.horizontal_resolution <= 0) {
                    errors.push('Horizontālā izšķirtspēja jābūt pozitīvam skaitlim');
                }
                
                if (!recordData.vertical_resolution || recordData.vertical_resolution <= 0) {
                    errors.push('Vertikālā izšķirtspēja jābūt pozitīvam skaitlim');
                }
                break;
                
            case 'Video':
                // Required fields for Video records according to API
                if (!recordData.color || recordData.color.trim() === '') {
                    errors.push('Krāsa ir obligāta video dokumentiem');
                }
                
                if (!recordData.duration || (typeof recordData.duration === 'string' && recordData.duration.trim() === '')) {
                    errors.push('Ilgums ir obligāts video dokumentiem');
                }

                if (!recordData.horizontal_resolution || recordData.horizontal_resolution <= 0) {
                    errors.push('Horizontālā izšķirtspēja jābūt pozitīvam skaitlim');
                }
                
                if (!recordData.vertical_resolution || recordData.vertical_resolution <= 0) {
                    errors.push('Vertikālā izšķirtspēja jābūt pozitīvam skaitlim');
                }
                
                // Validate duration format (HH:MM:SS)
                if (recordData.duration && !/^\d{2}:\d{2}:\d{2}$/.test(recordData.duration)) {
                    errors.push('Ilgums jāievada formātā HH:MM:SS (piemēram, 01:23:45)');
                }
                break;
                
            case 'Skaņas':
                if (!recordData.duration || (typeof recordData.duration === 'string' && recordData.duration.trim() === '')) {
                    errors.push('Ilgums ir obligāts skaņas dokumentiem');
                }
                
                // Validate duration format (HH:MM:SS)
                if (recordData.duration && !/^\d{2}:\d{2}:\d{2}$/.test(recordData.duration)) {
                    errors.push('Ilgums jāievada formātā HH:MM:SS (piemēram, 01:23:45)');
                }
                break;
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Helper function to determine if inventory type requires single file
 * @param {string} inventoryType - Inventory type
 * @returns {boolean} True if single file required
 */
export const isSingleFileType = (inventoryType) => {
    return RECORD_VALIDATION.SINGLE_FILE_TYPES.includes(inventoryType);
};

/**
 * Helper function to get allowed file types for inventory
 * @param {string} inventoryType - Inventory type  
 * @returns {string[]} Array of allowed MIME types
 */
export const getAllowedFileTypes = (inventoryType) => {
    return RECORD_VALIDATION.ALLOWED_FILE_TYPES[inventoryType] || [];
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formats duration string to HH:MM:SS format
 * @param {string} duration - Duration string (various formats)
 * @returns {string} Formatted duration in HH:MM:SS
 */
export const formatDuration = (duration) => {
    if (!duration) return '';
    
    // If already in correct format, return as is
    if (/^\d{2}:\d{2}:\d{2}$/.test(duration)) {
        return duration;
    }
    
    // Try to parse different formats
    let totalSeconds = 0;
    
    // Format: MM:SS or HH:MM:SS
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(duration)) {
        const parts = duration.split(':');
        if (parts.length === 2) {
            // MM:SS format
            totalSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        } else if (parts.length === 3) {
            // HH:MM:SS format
            totalSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
    }
    
    // Format: plain seconds
    else if (/^\d+$/.test(duration)) {
        totalSeconds = parseInt(duration);
    }
    
    // Convert to HH:MM:SS
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Validates duration format and provides formatting hints
 * @param {string} duration - Duration string to validate
 * @returns {object} Validation result with formatting suggestions
 */
export const validateDurationFormat = (duration) => {
    if (!duration || duration.trim() === '') {
        return {
            isValid: false,
            error: 'Ilgums ir obligāts',
            suggestion: 'Ievadiet ilgumu formātā HH:MM:SS (piemēram, 01:23:45)'
        };
    }
    
    // Check if already in correct format
    if (/^\d{2}:\d{2}:\d{2}$/.test(duration)) {
        return { isValid: true, formatted: duration };
    }
    
    // Try to format and validate
    try {
        const formatted = formatDuration(duration);
        if (formatted && /^\d{2}:\d{2}:\d{2}$/.test(formatted)) {
            return {
                isValid: true,
                formatted: formatted,
                suggestion: formatted !== duration ? `Formatēts uz: ${formatted}` : null
            };
        }
    } catch {
        // formatDuration returned invalid result
    }
    
    return {
        isValid: false,
        error: 'Nepareizs ilguma formāts',
        suggestion: 'Ievadiet ilgumu formātā HH:MM:SS (piemēram, 01:23:45) vai MM:SS (piemēram, 23:45)'
    };
};

/**
 * Helper to get API type from inventory type
 * @param {string} inventoryType - Frontend inventory type
 * @returns {string} API compatible type
 */
export const getAPITypeFromInventory = (inventoryType) => {
    const typeMapping = {
        'Foto': 'Foto',
        'Video': 'Video', 
        'Skaņas': 'Audio'
    };
    
    return typeMapping[inventoryType] || inventoryType;
};

/**
 * Validates complete record form including files and record data
 * @param {object} formData - Complete form data
 * @param {File[]} files - Files to upload
 * @param {string} inventoryType - Type of inventory
 * @param {string} recordType - Type of record (standard/media)
 * @returns {object} Complete validation result
 */
export const validateRecordForm = (formData, files, inventoryType, recordType = 'standard') => {
    const errors = {};
    let isValid = true;
    
    // Validate files
    if (recordType === 'media' || (files && files.length > 0)) {
        const fileValidation = validateFileUploads(files, inventoryType);
        if (fileValidation.errors.length > 0) {
            errors.files = fileValidation.errors;
            isValid = false;
        }
    }
    
    // Validate record data with inventory type for media records
    if (formData) {
        const recordValidation = validateRecordData(formData, recordType, inventoryType);
        if (!recordValidation.isValid) {
            errors.record = recordValidation.errors;
            isValid = false;
        }
    }
    
    // Additional form-specific validations for media records
    if (recordType === 'media' && inventoryType) {
        // For media records, at least one file is required
        if (!files || files.length === 0) {
            errors.files = errors.files || [];
            errors.files.push({ file: 'general', errors: [RECORD_ERROR_MESSAGES.NO_FILES_PROVIDED] });
            isValid = false;
        }
        
        // Media-specific field validations with API compliance
        if (inventoryType === 'Foto') {
            if (!formData?.color || formData.color.trim() === '') {
                errors.record = errors.record || [];
                errors.record.push('Krāsa ir obligāta foto dokumentiem');
                isValid = false;
            }
            
            if (!formData?.horizontal_resolution || formData.horizontal_resolution <= 0) {
                errors.record = errors.record || [];
                errors.record.push('Horizontālā izšķirtspēja ir obligāta');
                isValid = false;
            }
            
            if (!formData?.vertical_resolution || formData.vertical_resolution <= 0) {
                errors.record = errors.record || [];
                errors.record.push('Vertikālā izšķirtspēja ir obligāta');
                isValid = false;
            }
        }
        
        if (inventoryType === 'Video') {
            if (!formData?.color || formData.color.trim() === '') {
                errors.record = errors.record || [];
                errors.record.push('Krāsa ir obligāta video dokumentiem');
                isValid = false;
            }
            
            if (!formData?.duration || (typeof formData.duration === 'string' && formData.duration.trim() === '')) {
                errors.record = errors.record || [];
                errors.record.push('Ilgums ir obligāts video dokumentiem');
                isValid = false;
            }

            if (formData?.duration) {
                const durationValidation = validateDurationFormat(formData.duration);
                if (!durationValidation.isValid) {
                    errors.record = errors.record || [];
                    errors.record.push(durationValidation.error);
                    isValid = false;
                }
            }
            
            if (!formData?.horizontal_resolution || formData.horizontal_resolution <= 0) {
                errors.record = errors.record || [];
                errors.record.push('Horizontālā izšķirtspēja ir obligāta');
                isValid = false;
            }
            
            if (!formData?.vertical_resolution || formData.vertical_resolution <= 0) {
                errors.record = errors.record || [];
                errors.record.push('Vertikālā izšķirtspēja ir obligāta');
                isValid = false;
            }
        }
        
        if (inventoryType === 'Skaņas') {
            if (!formData?.duration || (typeof formData.duration === 'string' && formData.duration.trim() === '')) {
                errors.record = errors.record || [];
                errors.record.push('Ilgums ir obligāts skaņas dokumentiem');
                isValid = false;
            }

            if (formData?.duration) {
                const durationValidation = validateDurationFormat(formData.duration);
                if (!durationValidation.isValid) {
                    errors.record = errors.record || [];
                    errors.record.push(durationValidation.error);
                    isValid = false;
                }
            }
        }
    }
    
    return {
        isValid,
        errors,
        hasErrors: !isValid
    };
};

/**
 * Checks if validation result has any errors
 * @param {object} validationResult - Result from validation functions
 * @returns {boolean} True if there are validation errors
 */
export const hasValidationErrors = (validationResult) => {
    if (!validationResult) return false;
    
    // Handle different validation result structures
    if (validationResult.hasErrors !== undefined) {
        return validationResult.hasErrors;
    }
    
    if (validationResult.isValid !== undefined) {
        return !validationResult.isValid;
    }
    
    if (validationResult.errors) {
        if (Array.isArray(validationResult.errors)) {
            return validationResult.errors.length > 0;
        }
        
        if (typeof validationResult.errors === 'object') {
            return Object.keys(validationResult.errors).length > 0;
        }
    }
    
    return false;
};

/**
 * Extracts all error messages from validation result for display
 * @param {object} validationResult - Result from validation functions
 * @returns {string[]} Array of error messages
 */
export const getValidationErrorMessages = (validationResult) => {
    const messages = [];
    
    if (!validationResult || !validationResult.errors) {
        return messages;
    }
    
    const errors = validationResult.errors;
    
    // Handle file errors
    if (errors.files) {
        errors.files.forEach(fileError => {
            if (fileError.errors) {
                fileError.errors.forEach(error => {
                    messages.push(`${fileError.file}: ${error}`);
                });
            }
        });
    }
    
    // Handle record errors
    if (errors.record) {
        if (Array.isArray(errors.record)) {
            messages.push(...errors.record);
        } else {
            messages.push(errors.record);
        }
    }
    
    // Handle metadata errors
    if (errors.metadata) {
        if (Array.isArray(errors.metadata)) {
            messages.push(...errors.metadata);
        } else {
            messages.push(errors.metadata);
        }
    }
    
    return messages;
};

// Fix ESLint no-anonymous-default-export error
const RecordValidationUtils = {
    RECORD_VALIDATION,
    RECORD_ERROR_MESSAGES,
    validateFileUploads,
    validateMetadata,
    validateRecordData,
    validateRecordForm,
    hasValidationErrors,
    getValidationErrorMessages,
    isSingleFileType,
    getAllowedFileTypes,
    formatFileSize,
    formatDuration,
    validateDurationFormat,
    getAPITypeFromInventory
};

export default RecordValidationUtils;