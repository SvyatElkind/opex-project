// src/Constants/institutionConstants.js
// Institution validation constants and error messages

// ========================================
// CHARACTER LIMITS
// ========================================

export const INSTITUTION_NAME_MAX_LENGTH = 500;
export const REG_NR_MAX_LENGTH = 15;
export const CREATOR_MAX_LENGTH = 30;
export const CREATOR_POSITION_MAX_LENGTH = 200;
export const SIGNER_MAX_LENGTH = 30;
export const SIGNER_POSITION_MAX_LENGTH = 200;

// ========================================
// VALIDATION PATTERNS
// ========================================

// Registration number: digits only, 1-15 characters
export const REG_NR_REGEX = /^\d{1,15}$/;

// ========================================
// REQUIRED FIELDS FOR UPDATE
// ========================================

export const INSTITUTION_UPDATE_FIELDS = ['creator', 'creator_position', 'signer', 'signer_position'];

// ========================================
// ERROR MESSAGES (Latvian)
// ========================================

export const INSTITUTION_ERROR_MESSAGES = {
    // Institution Name
    name_too_long: 'Institūcijas nosaukums nevar būt garāks par 500 burtiem',
    name_not_unique: 'Institūcija ar šo nosaukumu jau eksistē.',

    // Registration Number
    reg_nr_invalid: 'Reģistrācijas numurs var saturēt tikai ciparus un nevar būt garāks par 15 simboliem.',
    reg_nr_not_unique: 'Institūcija ar šo reģistrācijas numuru jau eksistē.',

    // Creator
    creator_required: 'Izveidotāja vārds ir obligāts.',
    creator_too_long: 'Izveidotāja vārds un uzvārds nevar būt garāks par 30 burtiem',
    creator_position_required: 'Izveidotāja amats ir obligāts.',
    creator_position_too_long: 'Izveidotāja amats nevar būt garāks par 200 burtiem',

    // Signer
    signer_required: 'Parakstītāja vārds ir obligāts.',
    signer_too_long: 'Parakstītāja vārds un uzvārds nevar būt garāks par 30 burtiem',
    signer_position_required: 'Parakstītāja amats ir obligāts.',
    signer_position_too_long: 'Parakstītāja amats nevar būt garāks par 200 burtiem',

    // General
    empty_fields: 'Nav aizpildīti lauki: {}.',
    redundant_fields: 'Ir saņemti neparedzētie lauki.'
};

// ========================================
// VALIDATION FUNCTIONS
// ========================================

/**
 * Validate creator name
 * @param {string} creator - Creator name
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateCreator = (creator) => {
    if (!creator || creator.trim() === '') {
        return { isValid: false, error: INSTITUTION_ERROR_MESSAGES.creator_required };
    }

    if (creator.length > CREATOR_MAX_LENGTH) {
        return { isValid: false, error: INSTITUTION_ERROR_MESSAGES.creator_too_long };
    }

    return { isValid: true, error: null };
};

/**
 * Validate creator position
 * @param {string} position - Creator position
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateCreatorPosition = (position) => {
    if (!position || position.trim() === '') {
        return { isValid: false, error: INSTITUTION_ERROR_MESSAGES.creator_position_required };
    }

    if (position.length > CREATOR_POSITION_MAX_LENGTH) {
        return { isValid: false, error: INSTITUTION_ERROR_MESSAGES.creator_position_too_long };
    }

    return { isValid: true, error: null };
};

/**
 * Validate signer name
 * @param {string} signer - Signer name
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateSigner = (signer) => {
    if (!signer || signer.trim() === '') {
        return { isValid: false, error: INSTITUTION_ERROR_MESSAGES.signer_required };
    }

    if (signer.length > SIGNER_MAX_LENGTH) {
        return { isValid: false, error: INSTITUTION_ERROR_MESSAGES.signer_too_long };
    }

    return { isValid: true, error: null };
};

/**
 * Validate signer position
 * @param {string} position - Signer position
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateSignerPosition = (position) => {
    if (!position || position.trim() === '') {
        return { isValid: false, error: INSTITUTION_ERROR_MESSAGES.signer_position_required };
    }

    if (position.length > SIGNER_POSITION_MAX_LENGTH) {
        return { isValid: false, error: INSTITUTION_ERROR_MESSAGES.signer_position_too_long };
    }

    return { isValid: true, error: null };
};

/**
 * Validate all institution update fields
 * @param {Object} data - Form data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateInstitutionUpdate = (data) => {
    const errors = {};
    let isValid = true;

    // Validate creator
    const creatorResult = validateCreator(data.creator);
    if (!creatorResult.isValid) {
        errors.creator = creatorResult.error;
        isValid = false;
    }

    // Validate creator position
    const creatorPosResult = validateCreatorPosition(data.creator_position);
    if (!creatorPosResult.isValid) {
        errors.creator_position = creatorPosResult.error;
        isValid = false;
    }

    // Validate signer
    const signerResult = validateSigner(data.signer);
    if (!signerResult.isValid) {
        errors.signer = signerResult.error;
        isValid = false;
    }

    // Validate signer position
    const signerPosResult = validateSignerPosition(data.signer_position);
    if (!signerPosResult.isValid) {
        errors.signer_position = signerPosResult.error;
        isValid = false;
    }

    return { isValid, errors };
};

/**
 * Get remaining characters for a field
 * @param {string} value - Current value
 * @param {number} maxLength - Max length
 * @returns {number} Remaining characters
 */
export const getRemainingChars = (value, maxLength) => {
    return maxLength - (value?.length || 0);
};

export default {
    // Limits
    INSTITUTION_NAME_MAX_LENGTH,
    REG_NR_MAX_LENGTH,
    CREATOR_MAX_LENGTH,
    CREATOR_POSITION_MAX_LENGTH,
    SIGNER_MAX_LENGTH,
    SIGNER_POSITION_MAX_LENGTH,
    // Patterns
    REG_NR_REGEX,
    // Fields
    INSTITUTION_UPDATE_FIELDS,
    // Messages
    INSTITUTION_ERROR_MESSAGES,
    // Functions
    validateCreator,
    validateCreatorPosition,
    validateSigner,
    validateSignerPosition,
    validateInstitutionUpdate,
    getRemainingChars
};
