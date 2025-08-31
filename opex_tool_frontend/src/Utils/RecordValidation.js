// src/Utils/RecordValidation.js
// Validation utilities for record forms based on backend constants

import { RECORD_VALIDATION, RECORD_ERROR_MESSAGES } from '../Constants/Constnats'

/**
 * Validates a single record field based on backend constraints
 * @param {string} fieldName - Name of the field to validate
 * @param {any} value - Value to validate
 * @param {string} recordType - Type of record (textual, photo, video, audio, database)
 * @returns {string[]} Array of error messages (empty if valid)
 */
export const validateRecordField = (fieldName, value, recordType = 'textual') => {
    const errors = [];
    
    // Skip validation for empty optional fields
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        // Only title is required for all record types
        if (fieldName === 'title') {
            errors.push(RECORD_ERROR_MESSAGES.TITLE_REQUIRED);
        }
        return errors;
    }

    switch (fieldName) {
        case 'title':
            if (value.length > RECORD_VALIDATION.MAX_TITLE_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.TITLE_TOO_LONG);
            }
            break;
            
        case 'language':
            if (value.length > RECORD_VALIDATION.MAX_LANGUAGE_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.LANGUAGE_TOO_LONG);
            }
            if (!RECORD_VALIDATION.LANGUAGES.includes(value)) {
                errors.push(`Neatbalstīta valoda: ${value}`);
            }
            break;
            
        case 'annotation':
            if (value.length > RECORD_VALIDATION.MAX_ANNOTATION_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.ANNOTATION_TOO_LONG);
            }
            break;
            
        case 'key_words':
            if (value.length > RECORD_VALIDATION.MAX_KEY_WORDS_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.KEY_WORDS_TOO_LONG);
            }
            break;
            
        case 'reg_nr':
            if (value.length > RECORD_VALIDATION.MAX_REG_NR_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.REG_NR_TOO_LONG);
            }
            break;
            
        case 'sent_reg_nr':
            if (value.length > RECORD_VALIDATION.MAX_SENT_REG_NR_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.SENT_REG_NR_TOO_LONG);
            }
            break;
            
        case 'group':
            if (value.length > RECORD_VALIDATION.MAX_GROUP_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.GROUP_TOO_LONG);
            }
            break;
            
        case 'nomenclature_nr':
            if (value.length > RECORD_VALIDATION.MAX_NOMENCLATURE_NR_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.NOMENCLATURE_NR_TOO_LONG);
            }
            break;
            
        case 'notes':
            if (value.length > RECORD_VALIDATION.MAX_NOTES_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.NOTES_TOO_LONG);
            }
            break;
            
        case 'access_restriction_notes':
            if (value.length > RECORD_VALIDATION.MAX_ACCESS_RESTRICTION_NOTES_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.ACCESS_RESTRICTION_NOTES_TOO_LONG);
            }
            break;
            
        case 'user_restriction_notes':
            if (value.length > RECORD_VALIDATION.MAX_USER_RESTRICTION_NOTES_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.USER_RESTRICTION_NOTES_TOO_LONG);
            }
            break;
            
        case 'tech_info':
            if (value.length > RECORD_VALIDATION.MAX_TECH_INFO_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.TECH_INFO_TOO_LONG);
            }
            break;
            
        case 'access_restriction':
            if (!RECORD_VALIDATION.ACCESS_RESTRICTION_VALUES.includes(value)) {
                errors.push(RECORD_ERROR_MESSAGES.INVALID_ACCESS_RESTRICTION);
            }
            break;
            
        // Date fields
        case 'date':
        case 'created_date':
        case 'sent_date':
        case 'access_restriction_date':
            if (value && isNaN(Date.parse(value))) {
                errors.push('Nepareizs datuma formāts');
            }
            break;
            
        // Media-specific fields
        case 'duration':
            if (value && !RECORD_VALIDATION.DURATION_REGEX.test(value)) {
                errors.push(RECORD_ERROR_MESSAGES.INVALID_DURATION);
            }
            if (value && value.length > RECORD_VALIDATION.MAX_DURATION_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.DURATION_TOO_LONG);
            }
            break;
            
        case 'color':
            if (value && value.length > RECORD_VALIDATION.MAX_COLOR_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.COLOR_TOO_LONG);
            }
            break;
            
        case 'format':
            if (value && value.length > RECORD_VALIDATION.MAX_FORMAT_LENGTH) {
                errors.push(RECORD_ERROR_MESSAGES.FORMAT_TOO_LONG);
            }
            break;
            
        case 'horizontal_resolution':
        case 'vertical_resolution':
            if (value && (isNaN(value) || parseInt(value) < 0)) {
                errors.push('Izšķirtspējai jābūt pozitīvam skaitlim');
            }
            break;
            
        default:
            // No specific validation for unknown fields
            break;
    }
    
    return errors;
};

/**
 * Validates entire record form data
 * @param {object} formData - Form data object
 * @param {string} recordType - Type of record
 * @returns {object} Object with field names as keys and error arrays as values
 */
export const validateRecordForm = (formData, recordType = 'textual') => {
    const allErrors = {};
    
    // Validate each field
    Object.keys(formData).forEach(field => {
        const fieldErrors = validateRecordField(field, formData[field], recordType);
        if (fieldErrors.length > 0) {
            allErrors[field] = fieldErrors;
        }
    });
    
    // Cross-field validation
    const crossValidationErrors = validateCrossFields(formData, recordType);
    Object.keys(crossValidationErrors).forEach(field => {
        if (allErrors[field]) {
            allErrors[field] = [...allErrors[field], ...crossValidationErrors[field]];
        } else {
            allErrors[field] = crossValidationErrors[field];
        }
    });
    
    return allErrors;
};

/**
 * Validates relationships between fields
 * @param {object} formData - Form data object
 * @param {string} recordType - Type of record
 * @returns {object} Cross-validation errors
 */
export const validateCrossFields = (formData, recordType) => {
    const errors = {};
    
    // Access restriction date validation
    if (formData.access_restriction === 'closed') {
        if (!formData.access_restriction_date) {
            errors.access_restriction_date = [RECORD_ERROR_MESSAGES.ACCESS_RESTRICTION_DATE_REQUIRED];
        }
    } else if (formData.access_restriction === 'open') {
        if (formData.access_restriction_date) {
            errors.access_restriction_date = [RECORD_ERROR_MESSAGES.ACCESS_RESTRICTION_DATE_NOT_NEEDED];
        }
    }
    
    // Date sequence validation
    if (formData.date && formData.created_date) {
        const recordDate = new Date(formData.date);
        const createdDate = new Date(formData.created_date);
        
        if (createdDate < recordDate) {
            errors.created_date = ['Izveidošanas datums nevar būt agrāks par ieraksta datumu'];
        }
    }
    
    // Media-specific validation
    if (['photo', 'video'].includes(recordType)) {
        // Resolution validation - both or neither
        const hasHorizontal = formData.horizontal_resolution && formData.horizontal_resolution.toString().trim();
        const hasVertical = formData.vertical_resolution && formData.vertical_resolution.toString().trim();
        
        if (hasHorizontal && !hasVertical) {
            errors.vertical_resolution = ['Ja norādīta horizontālā izšķirtspēja, jānorāda arī vertikālā'];
        }
        if (hasVertical && !hasHorizontal) {
            errors.horizontal_resolution = ['Ja norādīta vertikālā izšķirtspēja, jānorāda arī horizontālā'];
        }
    }
    
    return errors;
};

/**
 * Validates file uploads based on inventory type
 * @param {File[]} files - Array of File objects
 * @param {string} inventoryType - Type of inventory (Foto, Video, Skaņas, etc.)
 * @returns {object} Validation result with valid files and errors
 */
export const validateFileUploads = (files, inventoryType) => {
    const validFiles = [];
    const fileErrors = [];
    
    if (!files || files.length === 0) {
        return {
            validFiles,
            errors: [{ file: 'general', errors: [RECORD_ERROR_MESSAGES.NO_FILES_PROVIDED] }]
        };
    }
    
    // Get allowed types for this inventory type
    const allowedTypes = RECORD_VALIDATION.ALLOWED_FILE_TYPES[inventoryType] || [];
    
    files.forEach(file => {
        const errors = [];
        
        // Size validation
        if (file.size > RECORD_VALIDATION.MAX_FILE_SIZE) {
            errors.push(RECORD_ERROR_MESSAGES.FILE_TOO_LARGE);
        }
        
        // Type validation
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            errors.push(`${RECORD_ERROR_MESSAGES.INVALID_FILE_TYPE} Atļautie tipi: ${allowedTypes.join(', ')}`);
        }
        
        // Media-specific constraints
        if (['Foto', 'Video', 'Skaņas'].includes(inventoryType)) {
            // Media inventories typically allow only one file per record
            if (files.length > 1) {
                errors.push(RECORD_ERROR_MESSAGES.SINGLE_FILE_ONLY);
            }
        }
        
        if (errors.length === 0) {
            validFiles.push(file);
        } else {
            fileErrors.push({ file: file.name, errors });
        }
    });
    
    return {
        validFiles,
        errors: fileErrors
    };
};

/**
 * Validates metadata fields for Actions, Addressees, etc.
 * @param {object} metadataData - Metadata object
 * @param {string} metadataType - Type of metadata (action, addressee, read_status)
 * @returns {object} Validation errors
 */
export const validateMetadata = (metadataData, metadataType) => {
    const errors = {};
    
    switch (metadataType) {
        case 'action':
            // Author validation
            if (!metadataData.author || metadataData.author.trim() === '') {
                errors.author = ['Autors ir obligāts'];
            } else if (metadataData.author.length > RECORD_VALIDATION.MAX_PERSON_LENGTH) {
                errors.author = [`Vērtība ir garāka par ${RECORD_VALIDATION.MAX_PERSON_LENGTH} simboliem`];
            }
            
            // Responsible person validation
            if (!metadataData.responsible_person || metadataData.responsible_person.trim() === '') {
                errors.responsible_person = ['Atbildīgā persona ir obligāta'];
            } else if (metadataData.responsible_person.length > RECORD_VALIDATION.MAX_PERSON_LENGTH) {
                errors.responsible_person = [`Vērtība ir garāka par ${RECORD_VALIDATION.MAX_PERSON_LENGTH} simboliem`];
            }
            
            // Task validation
            if (!metadataData.task || metadataData.task.trim() === '') {
                errors.task = ['Uzdevums ir obligāts'];
            } else if (metadataData.task.length > RECORD_VALIDATION.MAX_ACTION_TASK_LENGTH) {
                errors.task = [`Vērtība ir garāka par ${RECORD_VALIDATION.MAX_ACTION_TASK_LENGTH} simboliem`];
            }
            
            // Date validation
            if (!metadataData.due_date) {
                errors.due_date = ['Izpildes datums ir obligāts'];
            } else if (isNaN(Date.parse(metadataData.due_date))) {
                errors.due_date = ['Nepareizs datuma formāts'];
            }
            
            if (!metadataData.created_date) {
                errors.created_date = ['Izveidošanas datums ir obligāts'];
            } else if (isNaN(Date.parse(metadataData.created_date))) {
                errors.created_date = ['Nepareizs datuma formāts'];
            }
            
            // Notes validation (optional)
            if (metadataData.notes && metadataData.notes.length > RECORD_VALIDATION.MAX_NOTES_LENGTH) {
                errors.notes = [`Vērtība ir garāka par ${RECORD_VALIDATION.MAX_NOTES_LENGTH} simboliem`];
            }
            break;
            
        case 'addressee':
            if (!metadataData.addressee || metadataData.addressee.trim() === '') {
                errors.addressee = ['Adresāts ir obligāts'];
            } else if (metadataData.addressee.length > RECORD_VALIDATION.MAX_ADDRESSEE_LENGTH) {
                errors.addressee = [`Vērtība ir garāka par ${RECORD_VALIDATION.MAX_ADDRESSEE_LENGTH} simboliem`];
            }
            break;
            
        case 'read_status':
            if (!metadataData.reader || metadataData.reader.trim() === '') {
                errors.reader = ['Lasītājs ir obligāts'];
            } else if (metadataData.reader.length > RECORD_VALIDATION.MAX_PERSON_LENGTH) {
                errors.reader = [`Vērtība ir garāka par ${RECORD_VALIDATION.MAX_PERSON_LENGTH} simboliem`];
            }
            
            if (!metadataData.read_date) {
                errors.read_date = ['Lasīšanas datums ir obligāts'];
            } else if (isNaN(Date.parse(metadataData.read_date))) {
                errors.read_date = ['Nepareizs datuma formāts'];
            }
            
            if (!metadataData.status || metadataData.status.trim() === '') {
                errors.status = ['Statuss ir obligāts'];
            }
            break;
            
        default:
            // No specific validation for unknown metadata types
            break;
    }
    
    return errors;
};

/**
 * Utility function to check if form has any validation errors
 * @param {object} errors - Errors object from validateRecordForm
 * @returns {boolean} True if form has errors
 */
export const hasValidationErrors = (errors) => {
    return Object.keys(errors).length > 0;
};

/**
 * Utility function to get all error messages as flat array
 * @param {object} errors - Errors object from validateRecordForm
 * @returns {string[]} Array of all error messages
 */
export const getAllErrorMessages = (errors) => {
    const messages = [];
    Object.keys(errors).forEach(field => {
        messages.push(...errors[field]);
    });
    return messages;
};

/**
 * Utility function to format field name for display
 * @param {string} fieldName - Field name from form
 * @returns {string} Formatted field name in Latvian
 */
export const formatFieldName = (fieldName) => {
    const fieldNameMap = {
        'title': 'Nosaukums',
        'date': 'Datums',
        'created_date': 'Izveidošanas datums',
        'sent_date': 'Nosūtīšanas datums',
        'language': 'Valoda',
        'annotation': 'Anotācija',
        'key_words': 'Atslēgvārdi',
        'reg_nr': 'Reģistrācijas Nr.',
        'sent_reg_nr': 'Nosūtīšanas Reģ. Nr.',
        'group': 'Grupa',
        'nomenclature_nr': 'Nomenklatūras Nr.',
        'notes': 'Piezīmes',
        'access_restriction': 'Pieejamības ierobežojums',
        'access_restriction_notes': 'Ierobežojumu piezīmes',
        'access_restriction_date': 'Ierobežojumu datums',
        'user_restriction_notes': 'Lietotāja ierobežojumu piezīmes',
        'tech_info': 'Tehniskā informācija',
        'duration': 'Ilgums',
        'color': 'Krāsa',
        'horizontal_resolution': 'Horizontālā izšķirtspēja',
        'vertical_resolution': 'Vertikālā izšķirtspēja',
        'format': 'Formāts'
    };
    
    return fieldNameMap[fieldName] || fieldName;
};

/**
 * Debounced validation for real-time form validation
 * @param {Function} validationFn - Validation function to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced validation function
 */
export const createDebouncedValidator = (validationFn, delay = 300) => {
    let timeoutId;
    
    return (...args) => {
        clearTimeout(timeoutId);
        return new Promise((resolve) => {
            timeoutId = setTimeout(() => {
                resolve(validationFn(...args));
            }, delay);
        });
    };
};

export default {
    validateRecordField,
    validateRecordForm,
    validateCrossFields,
    validateFileUploads,
    validateMetadata,
    hasValidationErrors,
    getAllErrorMessages,
    formatFieldName,
    createDebouncedValidator
};