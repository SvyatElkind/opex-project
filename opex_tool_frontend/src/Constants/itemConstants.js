// src/Constants/itemConstants.js
// Item validation constants and functions

// Character Limits
export const SERIES_CODE_MAX_LENGTH = 20;
export const TITLE_MAX_LENGTH = 1000;
export const NOTES_MAX_LENGTH = 1000;
export const DATE_INDICATOR_MAX_LENGTH = 5;
export const DATE_NOTE_MAX_LENGTH = 1000;
export const UNIT_OF_MEASURE_MAX_LENGTH = 20;
export const ANNOTATION_MAX_LENGTH = 2000;
export const SISTEMATISATION_MAX_LENGTH = 500;
export const PHYSICAL_DESCRIPTION_MAX_LENGTH = 1000;
export const LANGUAGE_MAX_LENGTH = 200;
export const RESTRICTION_MAX_LENGTH = 10;
export const RESTRICTION_NOTE_MAX_LENGTH = 500;
export const SECURITY_LEVEL_MAX_LENGTH = 10;
export const SECURITY_LEVEL_NOTE_MAX_LENGTH = 500;
export const COPY_MAX_LENGTH = 1000;
export const ARCHIVAL_HISTORY_MAX_LENGTH = 2000;

// Regular Expressions
export const SERIES_CODE_REGEX = /^(?!0\d*$)(\d{1,2}\.)*\d{1,2}$/;
// Examples: "1", "1.2", "1.2.3" (no leading zeros like "01")

export const DURATION_REGEX = /^\d{2}:[0-5]\d:[0-5]\d$/;
// Format: HH:MM:SS or H:MM:SS

// Allowed Values
export const DATE_INDICATOR_VALUES = ['year', 'month', 'day'];
export const UNIT_OF_MEASURE_VALUES = ['Lapas', 'Dokumenti', 'Glabājamās vienības'];
export const COLOR_FIELD_VALUES = ['melnbaltā', 'krāsainā'];
export const ITEM_RESTRICTION_LIST = ['Vispārēja', 'Ierobežota', 'Sensitīvi dati'];
export const ITEM_SECURITY_LEVEL_LIST = [
    'Publisks',
    'Iekšējs',
    'Konfidenciāls',
    'Slepens',
    'Sevišķi slepens'
];

// Conditional Requirements
export const REQUIRE_ANNOTATION_TYPE = ['Foto', 'Skaņas', 'Video'];
export const REQUIRE_FORMAT_TYPE = ['Foto', 'Skaņas', 'Video'];
export const REQUIRE_DURATION_TYPE = ['Skaņas', 'Video'];
export const REQUIRE_COLOR_TYPE = ['Foto', 'Video'];
export const REQUIRE_RESOLUTION_TYPE = ['Foto', 'Video'];
export const NOT_REQUIRE_LANGUAGE_TYPE = 'Foto';

// Default Values
export const DEFAULT_DATE_INDICATOR = 'day';
export const DEFAULT_UNIT_OF_MEASURE = 'Lapas';
export const DEFAULT_RESTRICTION = 'Vispārēja';
export const DEFAULT_SECURITY_LEVEL = 'Publisks';

// Error Messages (Latvian)
export const ERROR_MESSAGES = {
    // Number
    number_exists: 'Glabājamā vienība ar numuru {number} jau eksistē.',
    number_not_sequential: 'Glabājamās vienības numurs nav secīgs.',
    number_required: 'Glabājamās vienības numurs ir obligāts.',

    // Series Code
    series_code_invalid: 'Sērijas kods neatbilst prasībām.',
    series_code_required: 'Sērijas kods ir obligāts.',
    series_code_too_long: `Sērijas kods nevar būt garāks par ${SERIES_CODE_MAX_LENGTH} simboliem.`,

    // Title
    title_required: 'Glabājamās vienības nosaukums ir obligāts.',
    title_too_long: `Nosaukums nevar būt garāks par ${TITLE_MAX_LENGTH} simboliem.`,

    // Long values
    value_too_long: 'Vērtība ir garāka par {max} simboliem.',

    // Restriction
    restriction_invalid: 'Nav norādīts ierobežojuma pamatojums un datums.',
    restriction_note_required: 'Ierobežojuma pamatojums ir obligāts.',

    // Security Level
    security_level_invalid: 'Nepareizi norādīta pieejamības vērtība.',

    // Dates
    date_order_invalid: 'Glabājamās vienības datums no nevar būt vēlāks par datumu līdz.',
    date_not_set: 'Glabājamās vienības datums nav norādīts.',
    date_exceeds_inventory: 'Glabājamās vienības datums nevar būt vēlāks par uzskaites saraksta beigu datumu.',
    start_date_required: 'Sākuma datums ir obligāts.',
    end_date_required: 'Beigu datums ir obligāts.',

    // Language
    language_required: 'Glabājamās vienības valoda nav norādīta.',

    // Annotation
    annotation_required: 'Glabājamās vienības saturs nav aizpildīts.',

    // Date Indicator
    date_indicator_invalid: 'Nepareizi norādīts datuma indikātors.',
    date_indicator_required: 'Datuma indikātors ir obligāts.',

    // Unit of Measure
    unit_of_measure_invalid: 'Nepareizi norādīta apjoma mērvienība.',
    unit_of_measure_required: 'Apjoma mērvienība ir obligāta.',

    // Related Items
    self_relation: 'Glabājamā vienība nevar būt saistīta ar sevi.',
    related_not_exists: 'Glabājamā vienība ar numuru {number} neeksistē.',
    related_out_of_scope: 'Dotajā projektā norādītā GV neeksistē.',

    // Inventory
    inventory_no_date: 'Uzskaites sarakstam ID.{id} nav norādīts sākuma un beigu datums.',

    // Success
    created: 'Glabājamā vienība izveidota veiksmīgi.',
    updated: 'Glabājamā vienība atjaunināta veiksmīgi.',
    deleted: 'Glabājamā vienība izdzēsta veiksmīgi.'
};

// Validation Functions

/**
 * Validate series code
 * @param {string} seriesCode - Series code
 * @returns {string|null} - Error message or null if valid
 */
export const validateSeriesCode = (seriesCode) => {
    if (!seriesCode || seriesCode.trim() === '') {
        return ERROR_MESSAGES.series_code_required;
    }
    if (seriesCode.length > SERIES_CODE_MAX_LENGTH) {
        return ERROR_MESSAGES.series_code_too_long;
    }
    if (!SERIES_CODE_REGEX.test(seriesCode)) {
        return ERROR_MESSAGES.series_code_invalid;
    }
    return null;
};

/**
 * Validate title
 * @param {string} title - Item title
 * @returns {string|null} - Error message or null if valid
 */
export const validateTitle = (title) => {
    if (!title || title.trim() === '') {
        return ERROR_MESSAGES.title_required;
    }
    if (title.length > TITLE_MAX_LENGTH) {
        return ERROR_MESSAGES.title_too_long;
    }
    return null;
};

/**
 * Validate date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} inventoryEndDate - Inventory end date (optional)
 * @returns {object} - Object with startDate and endDate error messages
 */
export const validateItemDateRange = (startDate, endDate, inventoryEndDate = null) => {
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

        // Check against inventory end date
        if (inventoryEndDate) {
            const invEnd = new Date(inventoryEndDate);
            if (end > invEnd) {
                errors.end_date = ERROR_MESSAGES.date_exceeds_inventory;
            }
        }
    }

    return errors;
};

/**
 * Validate language (conditional based on inventory type)
 * @param {string} language - Language
 * @param {string} inventoryType - Inventory type
 * @returns {string|null} - Error message or null if valid
 */
export const validateLanguage = (language, inventoryType) => {
    // Language not required for 'Foto'
    if (inventoryType === NOT_REQUIRE_LANGUAGE_TYPE) {
        return null;
    }

    if (!language || language.trim() === '') {
        return ERROR_MESSAGES.language_required;
    }

    if (language.length > LANGUAGE_MAX_LENGTH) {
        return ERROR_MESSAGES.value_too_long.replace('{max}', LANGUAGE_MAX_LENGTH);
    }

    return null;
};

/**
 * Validate annotation (conditional based on inventory type)
 * @param {string} annotation - Annotation
 * @param {string} inventoryType - Inventory type
 * @returns {string|null} - Error message or null if valid
 */
export const validateAnnotation = (annotation, inventoryType) => {
    // Annotation required for media types
    if (REQUIRE_ANNOTATION_TYPE.includes(inventoryType)) {
        if (!annotation || annotation.trim() === '') {
            return ERROR_MESSAGES.annotation_required;
        }
    }

    if (annotation && annotation.length > ANNOTATION_MAX_LENGTH) {
        return ERROR_MESSAGES.value_too_long.replace('{max}', ANNOTATION_MAX_LENGTH);
    }

    return null;
};

/**
 * Validate restriction note (conditional based on restriction value)
 * @param {string} restrictionNote - Restriction note
 * @param {string} restriction - Restriction value
 * @returns {string|null} - Error message or null if valid
 */
export const validateRestrictionNote = (restrictionNote, restriction) => {
    // Restriction note required if restriction is not 'Vispārēja'
    if (restriction && restriction !== 'Vispārēja') {
        if (!restrictionNote || restrictionNote.trim() === '') {
            return ERROR_MESSAGES.restriction_note_required;
        }
    }

    if (restrictionNote && restrictionNote.length > RESTRICTION_NOTE_MAX_LENGTH) {
        return ERROR_MESSAGES.value_too_long.replace('{max}', RESTRICTION_NOTE_MAX_LENGTH);
    }

    return null;
};

/**
 * Validate date indicator
 * @param {string} dateIndicator - Date indicator
 * @returns {string|null} - Error message or null if valid
 */
export const validateDateIndicator = (dateIndicator) => {
    if (!dateIndicator) {
        return ERROR_MESSAGES.date_indicator_required;
    }
    if (!DATE_INDICATOR_VALUES.includes(dateIndicator)) {
        return ERROR_MESSAGES.date_indicator_invalid;
    }
    return null;
};

/**
 * Validate unit of measure
 * @param {string} unitOfMeasure - Unit of measure
 * @returns {string|null} - Error message or null if valid
 */
export const validateUnitOfMeasure = (unitOfMeasure) => {
    if (!unitOfMeasure) {
        return ERROR_MESSAGES.unit_of_measure_required;
    }
    if (!UNIT_OF_MEASURE_VALUES.includes(unitOfMeasure)) {
        return ERROR_MESSAGES.unit_of_measure_invalid;
    }
    return null;
};

/**
 * Validate security level
 * @param {string} securityLevel - Security level
 * @returns {string|null} - Error message or null if valid
 */
export const validateSecurityLevel = (securityLevel) => {
    if (securityLevel && !ITEM_SECURITY_LEVEL_LIST.includes(securityLevel)) {
        return ERROR_MESSAGES.security_level_invalid;
    }
    return null;
};

/**
 * Validate restriction
 * @param {string} restriction - Restriction
 * @returns {string|null} - Error message or null if valid
 */
export const validateRestriction = (restriction) => {
    if (restriction && !ITEM_RESTRICTION_LIST.includes(restriction)) {
        return ERROR_MESSAGES.restriction_invalid;
    }
    return null;
};

/**
 * Validate related items
 * @param {array} relatedItems - Array of related item IDs
 * @param {number} currentItemId - Current item ID
 * @returns {string|null} - Error message or null if valid
 */
export const validateRelatedItems = (relatedItems, currentItemId) => {
    if (!relatedItems || relatedItems.length === 0) {
        return null;
    }

    // Check if current item is in the list
    if (relatedItems.includes(currentItemId)) {
        return ERROR_MESSAGES.self_relation;
    }

    return null;
};

/**
 * Validate item creation data
 * @param {object} data - Item data
 * @param {object} inventory - Inventory object
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateItemCreate = (data, inventory) => {
    const errors = {};
    let isValid = true;

    // Series code validation
    const seriesCodeError = validateSeriesCode(data.series_code);
    if (seriesCodeError) {
        errors.series_code = seriesCodeError;
        isValid = false;
    }

    // Title validation
    const titleError = validateTitle(data.title);
    if (titleError) {
        errors.title = titleError;
        isValid = false;
    }

    // Date range validation
    const dateErrors = validateItemDateRange(
        data.start_date,
        data.end_date,
        inventory?.end_date
    );
    if (Object.keys(dateErrors).length > 0) {
        Object.assign(errors, dateErrors);
        isValid = false;
    }

    // Date indicator validation
    const dateIndicatorError = validateDateIndicator(data.date_indicator);
    if (dateIndicatorError) {
        errors.date_indicator = dateIndicatorError;
        isValid = false;
    }

    // Unit of measure validation
    const unitOfMeasureError = validateUnitOfMeasure(data.unit_of_measure);
    if (unitOfMeasureError) {
        errors.unit_of_measure = unitOfMeasureError;
        isValid = false;
    }

    // Language validation (conditional)
    const languageError = validateLanguage(data.language, inventory?.type);
    if (languageError) {
        errors.language = languageError;
        isValid = false;
    }

    // Annotation validation (conditional)
    const annotationError = validateAnnotation(data.annotation, inventory?.type);
    if (annotationError) {
        errors.annotation = annotationError;
        isValid = false;
    }

    // Restriction validation
    const restrictionError = validateRestriction(data.restriction);
    if (restrictionError) {
        errors.restriction = restrictionError;
        isValid = false;
    }

    // Restriction note validation (conditional)
    const restrictionNoteError = validateRestrictionNote(
        data.restriction_note,
        data.restriction
    );
    if (restrictionNoteError) {
        errors.restriction_note = restrictionNoteError;
        isValid = false;
    }

    // Security level validation
    const securityLevelError = validateSecurityLevel(data.security_level);
    if (securityLevelError) {
        errors.security_level = securityLevelError;
        isValid = false;
    }

    // Related items validation
    const relatedItemsError = validateRelatedItems(
        data.related_item_list,
        data.id
    );
    if (relatedItemsError) {
        errors.related_item_list = relatedItemsError;
        isValid = false;
    }

    return { isValid, errors };
};

/**
 * Validate item update data
 * Same as create validation
 * @param {object} data - Item data
 * @param {object} inventory - Inventory object
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateItemUpdate = (data, inventory) => {
    return validateItemCreate(data, inventory);
};

/**
 * Get character counter helper
 * @param {string} value - Current value
 * @param {number} maxLength - Maximum length
 * @returns {number} - Remaining characters
 */
export const getRemainingChars = (value, maxLength) => {
    return maxLength - (value?.length || 0);
};

/**
 * Check if language field is required based on inventory type
 * @param {string} inventoryType - Inventory type
 * @returns {boolean} - True if language is required
 */
export const isLanguageRequired = (inventoryType) => {
    return inventoryType !== NOT_REQUIRE_LANGUAGE_TYPE;
};

/**
 * Check if annotation field is required based on inventory type
 * @param {string} inventoryType - Inventory type
 * @returns {boolean} - True if annotation is required
 */
export const isAnnotationRequired = (inventoryType) => {
    return REQUIRE_ANNOTATION_TYPE.includes(inventoryType);
};

/**
 * Check if restriction note is required based on restriction value
 * @param {string} restriction - Restriction value
 * @returns {boolean} - True if restriction note is required
 */
export const isRestrictionNoteRequired = (restriction) => {
    return restriction && restriction !== 'Vispārēja';
};
