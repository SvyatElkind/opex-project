/**
 * Error Handling Service
 *
 * Parses all Django REST Framework error response formats:
 *
 * 1. { "detail": "Not found." }                          — Standard DRF error
 * 2. { "detail": ["Error 1", "Error 2"] }                — DRF list error
 * 3. { "error": "Something went wrong" }                  — Custom backend error
 * 4. { "field": ["This field is required."] }             — Serializer validation
 * 5. { "non_field_errors": ["Invalid credentials."] }     — Non-field validation
 * 6. { "field": "Error message" }                         — Simple field error
 * 7. { "field": { "nested": ["Error"] } }                 — Nested serializer error
 * 8. "Plain string error"                                 — Raw string response
 * 9. null / undefined                                     — No response body
 */

// ─── Error Parsing ──────────────────────────────────────────────────────────

/**
 * Parse any API error response into a standardized format
 * @param {*} response - API error response (object, string, null)
 * @returns {{ general: string|null, message: string, fields: Object }}
 */
export const parseApiError = (response, _depth = 0) => {
  const MAX_DEPTH = 5;
  const result = {
    general: null,
    message: '',
    fields: {},
  };

  // Prevent infinite recursion on circular references
  if (_depth >= MAX_DEPTH) {
    result.general = typeof response === 'string' ? response : JSON.stringify(response);
    result.message = result.general;
    return result;
  }

  // Handle null/undefined
  if (response == null) {
    result.general = 'Neparedzēta kļūda. Mēģiniet vēlreiz.';
    result.message = result.general;
    return result;
  }

  // Handle plain string
  if (typeof response === 'string') {
    result.general = response;
    result.message = response;
    return result;
  }

  // Handle non-object types
  if (typeof response !== 'object') {
    result.general = String(response);
    result.message = result.general;
    return result;
  }

  // ── Format 1 & 2: { "detail": "..." } or { "detail": [...] } ──

  if (response.detail) {
    if (Array.isArray(response.detail)) {
      result.general = response.detail.join('. ');
    } else if (typeof response.detail === 'string') {
      result.general = response.detail;
    } else {
      result.general = JSON.stringify(response.detail);
    }
    result.message = result.general;
    return result;
  }

  // ── Format 3: { "error": "..." } ──

  if (response.error) {
    if (typeof response.error === 'string') {
      result.general = response.error;
    } else {
      result.general = JSON.stringify(response.error);
    }
    result.message = result.general;
    return result;
  }

  // ── Format 5: { "non_field_errors": [...] } ──

  if (response.non_field_errors) {
    if (Array.isArray(response.non_field_errors)) {
      result.general = response.non_field_errors.join('. ');
    } else {
      result.general = String(response.non_field_errors);
    }
  }

  // ── Formats 4, 6, 7: Field-specific errors ──

  for (const [field, fieldError] of Object.entries(response)) {
    // Skip already-handled keys
    if (field === 'detail' || field === 'error' || field === 'non_field_errors') continue;

    if (Array.isArray(fieldError)) {
      // { "field": ["Error 1", "Error 2"] } — join all errors
      result.fields[field] = fieldError.join('. ');
    } else if (typeof fieldError === 'string') {
      // { "field": "Error message" }
      result.fields[field] = fieldError;
    } else if (typeof fieldError === 'object' && fieldError !== null) {
      // { "field": { "nested_field": ["Error"] } } — flatten
      const nested = parseApiError(fieldError, _depth + 1);
      if (nested.general) {
        result.fields[field] = nested.general;
      } else if (Object.keys(nested.fields).length > 0) {
        // Prefix nested field names
        for (const [nestedKey, nestedVal] of Object.entries(nested.fields)) {
          result.fields[`${field}.${nestedKey}`] = nestedVal;
        }
      } else {
        result.fields[field] = JSON.stringify(fieldError);
      }
    }
  }

  // Build summary message
  if (result.general) {
    result.message = result.general;
  } else if (Object.keys(result.fields).length > 0) {
    result.general = 'Lūdzu izlabojiet kļūdas formas laukos.';
    result.message = result.general;
  } else {
    result.general = 'Neparedzēta kļūda.';
    result.message = result.general;
  }

  return result;
};

// ─── Status Code Helpers ────────────────────────────────────────────────────

/**
 * Check if HTTP status indicates an error (4xx or 5xx)
 */
export const isErrorStatus = (status) => {
  return status >= 400;
};

/**
 * Check if HTTP status is 204 No Content
 */
export const isNoContentStatus = (status) => {
  return status === 204;
};

// Backward-compatible alias
export const isNotFoundStatus = isNoContentStatus;

/**
 * Get user-friendly message for HTTP status code
 */
export const getStatusMessage = (status) => {
  const messages = {
    200: 'Operācija veiksmīga',
    201: 'Ieraksts izveidots',
    204: 'Nav satura',
    400: 'Validācijas kļūda',
    401: 'Nav autorizācijas',
    403: 'Pieeja liegta',
    404: 'Nav atrasts',
    405: 'Metode nav atļauta',
    408: 'Pieprasījuma noilgums',
    409: 'Konflikts',
    413: 'Pieprasījums pārāk liels',
    415: 'Neatbalstīts datu formāts',
    422: 'Neapstrādājami dati',
    429: 'Pārāk daudz pieprasījumu',
    500: 'Servera kļūda',
    502: 'Slikts vārtejs',
    503: 'Serveris nav pieejams',
    504: 'Vārtejas noilgums',
  };
  return messages[status] || `HTTP kļūda ${status}`;
};

/**
 * Format error message with dynamic values
 * Uses {placeholder} or positional {} replacement
 * @param {string} message - Error message template
 * @param  {...any} args - Values to insert
 */
export const formatErrorMessage = (message, ...args) => {
  let result = message;
  args.forEach(arg => {
    result = result.replace('{}', arg);
  });
  return result;
};
