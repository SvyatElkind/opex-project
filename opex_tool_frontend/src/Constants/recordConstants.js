// src/Constants/recordConstants.js
// Record validation constants and functions

// Character Limits
export const TITLE_MAX_LENGTH = 500;
export const LANGUAGE_MAX_LENGTH = 200;
export const ANNOTATION_MAX_LENGTH = 500;
export const KEY_WORDS_MAX_LENGTH = 200;
export const REG_NR_MAX_LENGTH = 30;
export const SENT_REG_NR_MAX_LENGTH = 30;
export const GROUP_MAX_LENGTH = 30;
export const NOMENCLATURE_NR_MAX_LENGTH = 30;
export const NOTES_MAX_LENGTH = 500;
export const ACCESS_RESTRICTION_MAX_LENGTH = 10;
export const ACCESS_RESTRICTION_NOTES_MAX_LENGTH = 30;
export const USER_RESTRICTION_NOTES_MAX_LENGTH = 30;
export const TECH_INFO_MAX_LENGTH = 500;

// Media Record Constants
export const COLOR_MAX_LENGTH = 10;
export const DURATION_MAX_LENGTH = 8;
export const RESOLUTION_MAX_LENGTH = 20;

// Metadata Constants
export const ACTION_AUTHOR_MAX_LENGTH = 50;
export const ACTION_RESPONSIBLE_PERSON_MAX_LENGTH = 50;
export const ACTION_TASK_MAX_LENGTH = 200;
export const ACTION_NOTES_MAX_LENGTH = 200;
export const ADDRESSEE_MAX_LENGTH = 200;
export const VISA_PERSON_MAX_LENGTH = 50;
export const VISA_NOTES_MAX_LENGTH = 200;
export const READ_STATUS_PERSON_MAX_LENGTH = 50;
export const READ_STATUS_NOTES_MAX_LENGTH = 200;

// Regular Expressions
export const DURATION_REGEX = /^\d{1,2}:[0-5]\d:[0-5]\d$/;
// Format: HH:MM:SS or H:MM:SS

// Allowed Values
export const RECORD_ACCESS_RESTRICTION_VALUES = ['open', 'closed'];
export const RECORD_ACCESS_RESTRICTION_DEFAULT = 'open';

// Error Messages (Latvian)
export const ERROR_MESSAGES = {
    // Access Restriction
    access_restriction_invalid: 'Nepareizi norādīta pieejamības vērtība.',
    access_restriction_date_required: 'Nav norādīts ierobežojuma datums.',
    access_restriction_date_not_allowed: "Datumu nenorāda, ja ierobežojuma vērtība ir 'open'.",

    // Record Date
    record_date_out_of_range: 'Dokumenta datums ir ārpus glabājamās vienības datuma robežām.',
    date_required: 'Datums ir obligāts.',

    // Item Type
    not_text_record: 'Dokumentam jābūt tekstuālam elektroniskā formā.',
    not_media_item: 'Glabājamās vienības tips nav foto, video, skaņas un/vai veids nav elektroniskā formā.',

    // Duration
    duration_invalid: 'Glabājamās vienības skanēšanas ilgums norādīts nepareizi.',
    duration_required: 'Ilgums ir obligāts.',

    // Files
    no_files_provided: 'Nav norādīti faili.',
    file_not_found: 'Fails ar id {id} nav atrasts.',
    cannot_delete_media_file: 'Nevar dzēst audiovizuālo failu.',
    multiple_files_not_allowed: 'Drīkst augšupielādēt tikai vienu failu.',

    // Records
    no_item_id: 'Nav norādīts glabājamās vienības ID.',
    item_not_found: 'Glabājamā vienība ar ID {id} nav atrasta.',
    no_type_provided: 'Nav norādīts dokumenta tips.',
    record_already_exists: 'Glabājamai vienībai jau ir izveidots dokuments.',
    record_not_found: 'Dokuments ar ID {id} nav atrasts.',

    // Required Fields
    title_required: 'Nosaukums ir obligāts.',
    language_required: 'Valoda ir obligāta.',
    reg_nr_required: 'Reģistrācijas numurs ir obligāts.',
    nomenclature_nr_required: 'Nomenklatūras numurs ir obligāts.',
    color_required: 'Krāsa ir obligāta.',
    horizontal_resolution_required: 'Horizontālā izšķirtspēja ir obligāta.',
    vertical_resolution_required: 'Vertikālā izšķirtspēja ir obligāta.',

    // Field Length
    value_too_long: 'Vērtība ir garāka par {max} simboliem.',
    title_too_long: `Nosaukums nevar būt garāks par ${TITLE_MAX_LENGTH} simboliem.`,
    language_too_long: `Valoda nevar būt garāka par ${LANGUAGE_MAX_LENGTH} simboliem.`,

    // Metadata
    metadata_not_found: 'Metadatu instance ar id {id} nav atrasta.',
    action_author_required: 'Autors ir obligāts.',
    action_responsible_person_required: 'Atbildīgā persona ir obligāta.',
    action_task_required: 'Uzdevums ir obligāts.',
    action_due_date_required: 'Izpildes datums ir obligāts.',
    action_created_date_required: 'Izveidošanas datums ir obligāts.',
    addressee_required: 'Adresāts ir obligāts.',
    visa_person_required: 'Persona ir obligāta.',
    visa_date_required: 'Datums ir obligāts.',
    visa_notes_required: 'Piezīmes ir obligātas.',
    read_status_person_required: 'Persona ir obligāta.',
    read_status_date_required: 'Datums ir obligāts.',
    read_status_notes_required: 'Piezīmes ir obligātas.',

    // Success
    files_uploaded: 'Faili ir augšupielādēti.',
    file_deleted: 'Fails ir izdzēsts.',
    record_deleted: 'Dokuments ir izdzēsts.',
    record_created: 'Dokuments izveidots veiksmīgi.',
    record_updated: 'Dokuments atjaunināts veiksmīgi.',
    metadata_deleted: 'Metadati ir izdzēti.',
    metadata_created: 'Metadati izveidoti veiksmīgi.',
    metadata_updated: 'Metadati atjaunināti veiksmīgi.'
};

// Validation Functions

/**
 * Validate title
 * @param {string} title - Title
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
 * Validate language
 * @param {string} language - Language
 * @returns {string|null} - Error message or null if valid
 */
export const validateLanguage = (language) => {
    if (!language || language.trim() === '') {
        return ERROR_MESSAGES.language_required;
    }
    if (language.length > LANGUAGE_MAX_LENGTH) {
        return ERROR_MESSAGES.language_too_long;
    }
    return null;
};

/**
 * Validate registration number
 * @param {string} regNr - Registration number
 * @returns {string|null} - Error message or null if valid
 */
export const validateRegNr = (regNr) => {
    if (!regNr || regNr.trim() === '') {
        return ERROR_MESSAGES.reg_nr_required;
    }
    if (regNr.length > REG_NR_MAX_LENGTH) {
        return ERROR_MESSAGES.value_too_long.replace('{max}', REG_NR_MAX_LENGTH);
    }
    return null;
};

/**
 * Validate nomenclature number
 * @param {string} nomenclatureNr - Nomenclature number
 * @returns {string|null} - Error message or null if valid
 */
export const validateNomenclatureNr = (nomenclatureNr) => {
    if (!nomenclatureNr || nomenclatureNr.trim() === '') {
        return ERROR_MESSAGES.nomenclature_nr_required;
    }
    if (nomenclatureNr.length > NOMENCLATURE_NR_MAX_LENGTH) {
        return ERROR_MESSAGES.value_too_long.replace('{max}', NOMENCLATURE_NR_MAX_LENGTH);
    }
    return null;
};

/**
 * Validate record date against item date range
 * @param {string} recordDate - Record date in YYYY-MM-DD format
 * @param {object} item - Item object with start_date and end_date
 * @returns {string|null} - Error message or null if valid
 */
export const validateRecordDate = (recordDate, item) => {
    if (!recordDate) {
        return ERROR_MESSAGES.date_required;
    }

    if (item && item.start_date && item.end_date) {
        const date = new Date(recordDate);
        const startDate = new Date(item.start_date);
        const endDate = new Date(item.end_date);

        if (date < startDate || date > endDate) {
            return ERROR_MESSAGES.record_date_out_of_range;
        }
    }

    return null;
};

/**
 * Validate access restriction
 * @param {string} accessRestriction - Access restriction value
 * @returns {string|null} - Error message or null if valid
 */
export const validateAccessRestriction = (accessRestriction) => {
    if (accessRestriction && !RECORD_ACCESS_RESTRICTION_VALUES.includes(accessRestriction)) {
        return ERROR_MESSAGES.access_restriction_invalid;
    }
    return null;
};

/**
 * Validate access restriction date (conditional)
 * @param {string} accessRestrictionDate - Access restriction date
 * @param {string} accessRestriction - Access restriction value
 * @returns {string|null} - Error message or null if valid
 */
export const validateAccessRestrictionDate = (accessRestrictionDate, accessRestriction) => {
    if (accessRestriction === 'closed' && !accessRestrictionDate) {
        return ERROR_MESSAGES.access_restriction_date_required;
    }
    if (accessRestriction === 'open' && accessRestrictionDate) {
        return ERROR_MESSAGES.access_restriction_date_not_allowed;
    }
    return null;
};

/**
 * Validate duration format
 * @param {string} duration - Duration in HH:MM:SS format
 * @returns {string|null} - Error message or null if valid
 */
export const validateDuration = (duration, isRequired = false) => {
    if (isRequired && (!duration || duration.trim() === '')) {
        return ERROR_MESSAGES.duration_required;
    }

    if (duration && !DURATION_REGEX.test(duration)) {
        return ERROR_MESSAGES.duration_invalid;
    }

    return null;
};

/**
 * Validate text record creation data
 * @param {object} data - Record data
 * @param {object} item - Item object
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateTextRecordCreate = (data, item) => {
    const errors = {};
    let isValid = true;

    // Title validation
    const titleError = validateTitle(data.title);
    if (titleError) {
        errors.title = titleError;
        isValid = false;
    }

    // Language validation
    const languageError = validateLanguage(data.language);
    if (languageError) {
        errors.language = languageError;
        isValid = false;
    }

    // Registration number validation
    const regNrError = validateRegNr(data.reg_nr);
    if (regNrError) {
        errors.reg_nr = regNrError;
        isValid = false;
    }

    // Nomenclature number validation
    const nomenclatureNrError = validateNomenclatureNr(data.nomenclature_nr);
    if (nomenclatureNrError) {
        errors.nomenclature_nr = nomenclatureNrError;
        isValid = false;
    }

    // Date validation
    const dateError = validateRecordDate(data.date, item);
    if (dateError) {
        errors.date = dateError;
        isValid = false;
    }

    // Access restriction validation
    const accessRestrictionError = validateAccessRestriction(data.access_restriction);
    if (accessRestrictionError) {
        errors.access_restriction = accessRestrictionError;
        isValid = false;
    }

    // Access restriction date validation (conditional)
    const accessRestrictionDateError = validateAccessRestrictionDate(
        data.access_restriction_date,
        data.access_restriction
    );
    if (accessRestrictionDateError) {
        errors.access_restriction_date = accessRestrictionDateError;
        isValid = false;
    }

    return { isValid, errors };
};

/**
 * Validate media record creation data
 * @param {object} data - Record data
 * @param {string} recordType - 'photo', 'video', or 'audio'
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateMediaRecordCreate = (data, recordType) => {
    const errors = {};
    let isValid = true;

    // Color validation (for photo and video)
    if (['photo', 'video'].includes(recordType)) {
        if (!data.color || data.color.trim() === '') {
            errors.color = ERROR_MESSAGES.color_required;
            isValid = false;
        } else if (data.color.length > COLOR_MAX_LENGTH) {
            errors.color = ERROR_MESSAGES.value_too_long.replace('{max}', COLOR_MAX_LENGTH);
            isValid = false;
        }
    }

    // Duration validation (for video and audio)
    if (['video', 'audio'].includes(recordType)) {
        const durationError = validateDuration(data.duration, true);
        if (durationError) {
            errors.duration = durationError;
            isValid = false;
        }
    }

    // Resolution validation (for photo and video)
    if (['photo', 'video'].includes(recordType)) {
        if (!data.horizontal_resolution) {
            errors.horizontal_resolution = ERROR_MESSAGES.horizontal_resolution_required;
            isValid = false;
        }
        if (!data.vertical_resolution) {
            errors.vertical_resolution = ERROR_MESSAGES.vertical_resolution_required;
            isValid = false;
        }
    }

    return { isValid, errors };
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
 * Check if access restriction date is required
 * @param {string} accessRestriction - Access restriction value
 * @returns {boolean} - True if date is required
 */
export const isAccessRestrictionDateRequired = (accessRestriction) => {
    return accessRestriction === 'closed';
};

/**
 * Get record type for item
 * @param {object} item - Item object
 * @returns {string|null} - Record type or null
 */
export const getRecordTypeForItem = (item) => {
    if (!item || !item.inventory) {
        return null;
    }

    const inventoryType = item.inventory.type;
    const isElectronic = item.inventory.electronic;

    if (!isElectronic) {
        return null;
    }

    switch (inventoryType) {
        case 'Tekstuāls':
            return 'text';
        case 'Foto':
            return 'photo';
        case 'Video':
            return 'video';
        case 'Skaņas':
            return 'audio';
        default:
            return null;
    }
};
