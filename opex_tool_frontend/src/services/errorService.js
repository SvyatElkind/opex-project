/**
 * Error handling service for API responses
 */

// Response keys used by backend
const ERROR_KEY = 'error';
const SUCCESS_KEY = 'success';

/**
 * Parse API error response into displayable format
 * @param {Object} response - API error response
 * @returns {Object} Parsed errors { general: string, fields: Object }
 */
export const parseApiError = (response) => {
  const result = {
    general: null,
    fields: {}
  };

  if (!response) {
    result.general = 'Neparedzētā kļūda. Mēģiniet vēlreiz.';
    return result;
  }

  // Handle general error format: { error: "message" }
  if (response[ERROR_KEY]) {
    result.general = response[ERROR_KEY];
    return result;
  }

  // Handle field-specific errors
  for (const [field, message] of Object.entries(response)) {
    if (Array.isArray(message)) {
      // Serializer format: { field: ["message"] }
      result.fields[field] = message[0];
    } else if (typeof message === 'string') {
      // Simple format: { field: "message" }
      result.fields[field] = message;
    } else if (typeof message === 'object') {
      // Nested format
      result.fields[field] = JSON.stringify(message);
    }
  }

  // If we have field errors but no general error, create summary
  if (Object.keys(result.fields).length > 0 && !result.general) {
    result.general = 'Lūdzu izlabojiet kļūdas formas laukos.';
  }

  return result;
};

/**
 * Check if response is an error
 * @param {number} status - HTTP status code
 * @returns {boolean}
 */
export const isErrorStatus = (status) => {
  return status >= 400;
};

/**
 * Check if response indicates "not found" (204)
 * @param {number} status - HTTP status code
 * @returns {boolean}
 */
export const isNotFoundStatus = (status) => {
  return status === 204;
};

/**
 * Get user-friendly message for HTTP status
 * @param {number} status - HTTP status code
 * @returns {string}
 */
export const getStatusMessage = (status) => {
  switch (status) {
    case 200:
      return 'Operācija veiksmīga';
    case 201:
      return 'Ieraksts izveidots';
    case 204:
      return 'Nav atrasts';
    case 400:
      return 'Validācijas kļūda';
    default:
      return 'Nezināma kļūda';
  }
};

/**
 * Format error message with dynamic values
 * Messages use {} placeholders that need to be replaced
 * @param {string} message - Error message with placeholders
 * @param  {...any} args - Values to insert
 * @returns {string}
 */
export const formatErrorMessage = (message, ...args) => {
  let result = message;
  args.forEach(arg => {
    result = result.replace('{}', arg);
  });
  return result;
};
