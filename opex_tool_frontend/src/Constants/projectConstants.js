// src/constants/projectConstants.js
// Project validation constants and error messages

export const PROJECT_NAME_MAX_LENGTH = 20;
export const PROJECT_NAME_MIN_LENGTH = 1;
export const PROJECT_FOLDER_MAX_LENGTH = 100;
export const PROJECT_FOLDER_MIN_LENGTH = 1;

// Allowed: latin letters without diacritics, digits, underscore, hyphen.
// The name is used as the project working folder name on the user's machine,
// so diacritics (ā, ē, ī, ū, ļ, ņ, š, ž, č, ģ, ķ) are intentionally excluded.
export const PROJECT_NAME_REGEX = /^[A-Za-z0-9_-]+$/;

export const ALLOWED_REPORT_FORMAT = '.xlsx';
export const ALLOWED_REPORT_MIME_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export const VVAIS_TYPE_LIST = ['Foto', 'Skaņas', 'Tekstuāls', 'Video'];
export const VVAIS_STORAGE_TERM_LIST = ['Pastāvīgi glabājamās lietas', 'Ilgstoši glabājamās lietas'];

export const PROJECT_ERROR_MESSAGES = {
    // Project Name
    name_required: 'Projekta nosaukums ir obligāts.',
    name_too_long: 'Projekta nosaukums nevar būt garāks par 20 simboliem.',
    name_too_short: 'Projekta nosaukumam jābūt vismaz 1 simbolam.',
    name_invalid_pattern: 'Projekta nosaukumā drīkst izmantot tikai latīņu alfabēta burtus bez garumzīmēm un mīkstinājuma zīmēm (A-Z, a-z), ciparus, "_" un "-".',
    name_not_unique: 'Projekts ar doto nosaukumu jau eksistē.',
    name_not_string: 'Projekta nosaukumam jābūt simbolu virknei.',

    // Project Folder
    folder_required: 'Projekta mape ir obligāta.',
    folder_too_long: 'Projekta mapes ceļš nevar būt garāks par 100 simboliem.',
    folder_not_exists: 'Dotā mape neeksistē.',
    folder_create_error: 'Nevar izveidot projekta mapi.',
    folder_rename_error: 'Nevar pārdēvēt projekta mapi.',
    folder_already_exists: 'Mape ar šādu nosaukumu jau eksistē.',
    folder_not_found: 'Projekta mape neeksistē.',

    // Report File
    file_required: 'Lūdzu izvēlieties failu.',
    file_invalid_extension: 'Izvēlētā faila paplašinājumam jābūt ".xlsx".',
    file_empty: 'Izvēlētais fails ir tukšs.',

    // General
    unexpected_error: 'Neparedzētā kļūda. Mēģiniet vēlreiz.'
};

/**
 * Validate project name
 * @param {string} name - Project name to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateProjectName = (name) => {
    if (!name || name.trim() === '') {
        return { isValid: false, error: PROJECT_ERROR_MESSAGES.name_required };
    }

    if (typeof name !== 'string') {
        return { isValid: false, error: PROJECT_ERROR_MESSAGES.name_not_string };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < PROJECT_NAME_MIN_LENGTH) {
        return { isValid: false, error: PROJECT_ERROR_MESSAGES.name_too_short };
    }

    if (trimmedName.length > PROJECT_NAME_MAX_LENGTH) {
        return { isValid: false, error: PROJECT_ERROR_MESSAGES.name_too_long };
    }

    if (!PROJECT_NAME_REGEX.test(trimmedName)) {
        return { isValid: false, error: PROJECT_ERROR_MESSAGES.name_invalid_pattern };
    }

    return { isValid: true, error: null };
};

/**
 * Validate project folder path
 * @param {string} folder - Folder path to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateProjectFolder = (folder) => {
    if (!folder || folder.trim() === '') {
        return { isValid: false, error: PROJECT_ERROR_MESSAGES.folder_required };
    }

    const trimmedFolder = folder.trim();

    if (trimmedFolder.length > PROJECT_FOLDER_MAX_LENGTH) {
        return { isValid: false, error: PROJECT_ERROR_MESSAGES.folder_too_long };
    }

    return { isValid: true, error: null };
};

/**
 * Validate report file
 * @param {File} file - File object to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateReportFile = (file) => {
    if (!file) {
        return { isValid: false, error: PROJECT_ERROR_MESSAGES.file_required };
    }

    // Check extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(ALLOWED_REPORT_FORMAT)) {
        return { isValid: false, error: PROJECT_ERROR_MESSAGES.file_invalid_extension };
    }

    // Check file size (empty file)
    if (file.size === 0) {
        return { isValid: false, error: PROJECT_ERROR_MESSAGES.file_empty };
    }

    return { isValid: true, error: null };
};

/**
 * Get remaining characters for name field
 * @param {string} name - Current name value
 * @returns {number} Remaining characters
 */
export const getNameRemainingChars = (name) => {
    return PROJECT_NAME_MAX_LENGTH - (name?.length || 0);
};

/**
 * Get remaining characters for folder field
 * @param {string} folder - Current folder value
 * @returns {number} Remaining characters
 */
export const getFolderRemainingChars = (folder) => {
    return PROJECT_FOLDER_MAX_LENGTH - (folder?.length || 0);
};

export default {
    // Limits
    PROJECT_NAME_MAX_LENGTH,
    PROJECT_NAME_MIN_LENGTH,
    PROJECT_FOLDER_MAX_LENGTH,
    PROJECT_FOLDER_MIN_LENGTH,
    // Patterns
    PROJECT_NAME_REGEX,
    // Formats
    ALLOWED_REPORT_FORMAT,
    ALLOWED_REPORT_MIME_TYPES,
    // Values
    VVAIS_TYPE_LIST,
    VVAIS_STORAGE_TERM_LIST,
    // Messages
    PROJECT_ERROR_MESSAGES,
    // Functions
    validateProjectName,
    validateProjectFolder,
    validateReportFile,
    getNameRemainingChars,
    getFolderRemainingChars
};
