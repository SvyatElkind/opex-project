// src/Constants/inventoryConstants.js
// Inventory validation constants and functions

// Character Limits
export const POSTFIX_MAX_LENGTH = 3;
export const POSTFIX_MIN_LENGTH = 1;
export const TYPE_MAX_LENGTH = 20;
export const STORAGE_TERM_MAX_LENGTH = 30;
export const INVENTORY_MIN_NUM = 1;
export const INVENTORY_MAX_NUM = 70;

// Allowed Values
export const VVAIS_TYPE_LIST = ['Foto', 'Skaņas', 'Tekstuāls', 'Video'];
export const VVAIS_STORAGE_TERM_LIST = [
    'Pastāvīgi glabājamās lietas',
    'Ilgstoši glabājamās lietas'
];
export const INVENTORY_MEDIA_TYPE = ['Foto', 'Skaņas', 'Video'];

// Error Messages (Latvian)
export const ERROR_MESSAGES = {
    // Number
    number_out_of_range: 'Uzskaites saraksta numuram jābut no 1 līdz 70.',
    number_not_unique: 'Uzskaites saraksts ar šo numuru jau eksistē.',
    number_not_sequential: 'Jauna uzskaites saraksta numurs nav secīgs.',
    number_postfix_not_unique: 'Uzskates saraksta numuram kopā ar literu jābūt unikālam.',
    number_invalid: 'Nepareizs uzskaites saraksta numurs',
    number_required: 'Uzskaites saraksta numurs ir obligāts.',

    // Postfix
    postfix_invalid_length: 'Uzskaites saraksta numura litera garumam jābūt no 1 līdz 3.',

    // Type
    type_invalid: 'Ir norādīts nepareizs uzskaites saraksta dokumentu veids.',
    type_required: 'Uzskaites saraksta veids ir obligāts.',

    // Storage Term
    storage_term_invalid: 'Glabāšanas termiņš ir norādīts nepareizi.',
    storage_term_required: 'Glabāšanas termiņš ir obligāts.',

    // Dates
    date_invalid: 'Uzskaites saraksts datējums norādīts nepareizi.',
    date_missing: 'Lūdzu norādiet datējumu.',
    date_order_invalid: 'Sākuma datums nevar būt pēc beigu datuma.',
    date_item_conflict: 'Uzskaites saraksta beigu datums neiekļauj uzskaites sarakstā esošo glabājamo vienību datumu.',
    start_date_required: 'Sākuma datums ir obligāts.',
    end_date_required: 'Beigu datums ir obligāts.',

    // Fond
    fond_not_exists: 'Norādītais fonds neeksistē.',
    fond_id_missing: 'Nav norādīts fonda ID.',

    // Delete
    cannot_delete_report: 'Nevar dzēst uzskaites sarakstu no VVAIS atskaites.',

    // Success
    deleted: 'Uzsakites saraksts ir izdzēsts.',
    created: 'Uzskaites saraksts izveidots veiksmīgi.',
    updated: 'Uzskaites saraksts atjaunināts veiksmīgi.'
};

// Validation Functions

/**
 * Validate inventory number
 * @param {number} number - Inventory number
 * @returns {string|null} - Error message or null if valid
 */
export const validateNumber = (number) => {
    if (!number && number !== 0) {
        return ERROR_MESSAGES.number_required;
    }
    if (number < INVENTORY_MIN_NUM || number > INVENTORY_MAX_NUM) {
        return ERROR_MESSAGES.number_out_of_range;
    }
    return null;
};

/**
 * Validate postfix
 * @param {string} postfix - Inventory postfix
 * @returns {string|null} - Error message or null if valid
 */
export const validatePostfix = (postfix) => {
    if (postfix && (postfix.length < POSTFIX_MIN_LENGTH || postfix.length > POSTFIX_MAX_LENGTH)) {
        return ERROR_MESSAGES.postfix_invalid_length;
    }
    return null;
};

/**
 * Validate inventory type
 * @param {string} type - Inventory type
 * @returns {string|null} - Error message or null if valid
 */
export const validateType = (type) => {
    if (!type) {
        return ERROR_MESSAGES.type_required;
    }
    if (!VVAIS_TYPE_LIST.includes(type)) {
        return ERROR_MESSAGES.type_invalid;
    }
    return null;
};

/**
 * Validate storage term
 * @param {string} storageTerm - Storage term
 * @returns {string|null} - Error message or null if valid
 */
export const validateStorageTerm = (storageTerm) => {
    if (!storageTerm) {
        return ERROR_MESSAGES.storage_term_required;
    }
    if (!VVAIS_STORAGE_TERM_LIST.includes(storageTerm)) {
        return ERROR_MESSAGES.storage_term_invalid;
    }
    return null;
};

/**
 * Validate date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {object} - Object with startDate and endDate error messages
 */
export const validateDateRange = (startDate, endDate) => {
    const errors = {};

    if (!startDate) {
        errors.start_date = ERROR_MESSAGES.start_date_required;
    }

    if (!endDate) {
        errors.end_date = ERROR_MESSAGES.end_date_required;
    }

    // If both dates exist, check order
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            errors.end_date = ERROR_MESSAGES.date_order_invalid;
        }
    }

    return errors;
};

/**
 * Validate inventory creation data
 * @param {object} data - Inventory data
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateInventoryCreate = (data) => {
    const errors = {};
    let isValid = true;

    // Number validation
    const numberError = validateNumber(data.number);
    if (numberError) {
        errors.number = numberError;
        isValid = false;
    }

    // Type validation
    const typeError = validateType(data.type);
    if (typeError) {
        errors.type = typeError;
        isValid = false;
    }

    // Storage term validation
    const storageTermError = validateStorageTerm(data.storage_term);
    if (storageTermError) {
        errors.storage_term = storageTermError;
        isValid = false;
    }

    // Date range validation
    const dateErrors = validateDateRange(data.start_date, data.end_date);
    if (Object.keys(dateErrors).length > 0) {
        Object.assign(errors, dateErrors);
        isValid = false;
    }

    // Postfix validation (if provided)
    if (data.postfix) {
        const postfixError = validatePostfix(data.postfix);
        if (postfixError) {
            errors.postfix = postfixError;
            isValid = false;
        }
    }

    return { isValid, errors };
};

/**
 * Validate inventory update data
 * Only validates fields that can be updated: subfond, start_date, end_date, storage_term
 * @param {object} data - Inventory data
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateInventoryUpdate = (data) => {
    const errors = {};
    let isValid = true;

    // Storage term validation (if provided)
    if (data.storage_term !== undefined) {
        const storageTermError = validateStorageTerm(data.storage_term);
        if (storageTermError) {
            errors.storage_term = storageTermError;
            isValid = false;
        }
    }

    // Date range validation (if dates provided)
    if (data.start_date || data.end_date) {
        const dateErrors = validateDateRange(data.start_date, data.end_date);
        if (Object.keys(dateErrors).length > 0) {
            Object.assign(errors, dateErrors);
            isValid = false;
        }
    }

    return { isValid, errors };
};

/**
 * Check if inventory can be deleted
 * @param {object} inventory - Inventory object
 * @returns {boolean} - True if can be deleted
 */
export const canDeleteInventory = (inventory) => {
    return !inventory.from_report;
};

/**
 * Get deletion restriction message
 * @param {object} inventory - Inventory object
 * @returns {string|null} - Restriction message or null if can delete
 */
export const getDeleteRestrictionMessage = (inventory) => {
    if (inventory.from_report) {
        return ERROR_MESSAGES.cannot_delete_report;
    }
    return null;
};
