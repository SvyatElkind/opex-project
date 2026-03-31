/**
 * API Client — Centralized HTTP layer for all backend communication
 *
 * Every hook and API module should use this client instead of raw fetch().
 *
 * Features:
 * - JSON and FormData request helpers
 * - Standardized ApiError with parsed field errors
 * - Configurable request timeout (default 30s, file uploads 5min)
 * - Request cancellation via AbortController
 * - Automatic retry with exponential backoff for 5xx/network errors
 * - File download helper
 * - Binary upload helper (ArrayBuffer)
 */

import { parseApiError, isErrorStatus, isNotFoundStatus } from './errorService';

// ─── Configuration ──────────────────────────────────────────────────────────

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

const DEFAULT_TIMEOUT = 30000;       // 30 seconds for normal requests
const UPLOAD_TIMEOUT = 300000;       // 5 minutes for file uploads
const DOWNLOAD_TIMEOUT = 300000;     // 5 minutes for file downloads

const RETRY_CONFIG = {
  maxRetries: 2,
  baseDelayMs: 500,
  maxDelayMs: 5000,
  retryableStatuses: [502, 503, 504],
};

// ─── ApiError ───────────────────────────────────────────────────────────────

/**
 * Custom API error class with parsed error details
 */
export class ApiError extends Error {
  constructor(status, data) {
    const parsed = parseApiError(data);
    super(parsed.general || parsed.message || 'API Error');
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.parsed = parsed;
    this.fieldErrors = parsed.fields;
  }
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * Create an AbortController with timeout
 */
const createTimeoutController = (timeoutMs, externalSignal) => {
  const controller = new AbortController();

  // Timeout auto-abort
  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException('Request timeout', 'TimeoutError'));
  }, timeoutMs);

  // If caller provided a signal, link it
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener('abort', () => {
        controller.abort(externalSignal.reason);
      }, { once: true });
    }
  }

  return { controller, timeoutId };
};

/**
 * Parse response body based on content-type
 */
const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  if (contentType.includes('text/')) {
    return response.text();
  }

  // For binary/unknown content, return null (caller should use .blob() if needed)
  return null;
};

/**
 * Sleep utility for retry backoff
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate retry delay with exponential backoff + jitter
 */
const getRetryDelay = (attempt) => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt),
    RETRY_CONFIG.maxDelayMs
  );
  // Add jitter (0-25% of delay)
  return delay + Math.random() * delay * 0.25;
};

/**
 * Determine if a request should be retried
 */
const shouldRetry = (error, attempt) => {
  if (attempt >= RETRY_CONFIG.maxRetries) return false;

  // Network errors (fetch failed entirely)
  if (error.status === 0) return true;

  // Retryable HTTP status codes
  if (RETRY_CONFIG.retryableStatuses.includes(error.status)) return true;

  return false;
};

// ─── Core Request Function ──────────────────────────────────────────────────

/**
 * Make an API request with standardized error handling, timeout, and retry
 *
 * @param {string} endpoint - API endpoint (e.g., '/project/16/')
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @param {Object} [requestConfig] - Additional config
 * @param {number} [requestConfig.timeout] - Custom timeout in ms
 * @param {AbortSignal} [requestConfig.signal] - External abort signal for cancellation
 * @param {boolean} [requestConfig.retry] - Enable retry (default: true for GET, false for mutations)
 * @returns {Promise<{data: any, status: number}>}
 */
export const apiRequest = async (endpoint, options = {}, requestConfig = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';

  // Determine timeout
  const isUpload = options.body instanceof FormData || options.body instanceof ArrayBuffer;
  const timeout = requestConfig.timeout || (isUpload ? UPLOAD_TIMEOUT : DEFAULT_TIMEOUT);

  // Determine if retry is appropriate
  const enableRetry = requestConfig.retry !== undefined
    ? requestConfig.retry
    : method === 'GET'; // Only auto-retry GETs

  // Build headers
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const mergedHeaders = { ...defaultHeaders, ...options.headers };

  // Remove null/undefined headers (allows callers to remove Content-Type for FormData)
  Object.keys(mergedHeaders).forEach(key => {
    if (mergedHeaders[key] === undefined || mergedHeaders[key] === null) {
      delete mergedHeaders[key];
    }
  });

  // If body is FormData, remove Content-Type so browser sets multipart boundary
  if (options.body instanceof FormData) {
    delete mergedHeaders['Content-Type'];
  }

  const config = {
    ...options,
    headers: mergedHeaders,
  };

  // ─── Execute with retry logic ───────────────────────────────────────────

  let lastError = null;

  for (let attempt = 0; attempt <= (enableRetry ? RETRY_CONFIG.maxRetries : 0); attempt++) {
    // Wait before retry (skip first attempt)
    if (attempt > 0) {
      await sleep(getRetryDelay(attempt - 1));
    }

    const { controller, timeoutId } = createTimeoutController(timeout, requestConfig.signal);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 204 No Content
      if (isNotFoundStatus(response.status)) {
        return { data: null, status: 204 };
      }

      // Parse response body
      let data;
      try {
        data = await parseResponseBody(response);
      } catch {
        data = null;
      }

      // Handle error responses
      if (isErrorStatus(response.status)) {
        const error = new ApiError(response.status, data);

        // Only retry on retryable errors
        if (enableRetry && shouldRetry(error, attempt)) {
          lastError = error;
          continue;
        }

        throw error;
      }

      return { data, status: response.status };

    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw ApiError (already processed)
      if (error instanceof ApiError) {
        if (enableRetry && shouldRetry(error, attempt)) {
          lastError = error;
          continue;
        }
        throw error;
      }

      // Abort/timeout errors
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new ApiError(0, {
          error: 'Pieprasījums tika pārtraukts vai iestājās noilgums. Lūdzu mēģiniet vēlreiz.'
        });
      }

      // Network errors (no connection, DNS, etc.)
      const networkError = new ApiError(0, {
        error: 'Neizdevās izveidot savienojumu ar serveri. Lūdzu, pārbaudiet interneta savienojumu.'
      });

      if (enableRetry && shouldRetry(networkError, attempt)) {
        lastError = networkError;
        continue;
      }

      throw networkError;
    }
  }

  // All retries exhausted
  throw lastError || new ApiError(0, { error: 'Pieprasījums neizdevās pēc atkārtotiem mēģinājumiem.' });
};

// ─── Convenience Methods ────────────────────────────────────────────────────

/**
 * GET request
 */
export const get = (endpoint, config) =>
  apiRequest(endpoint, { method: 'GET' }, config);

/**
 * POST with JSON body
 */
export const post = (endpoint, data, config) =>
  apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }, config);

/**
 * PUT with JSON body
 */
export const put = (endpoint, data, config) =>
  apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, config);

/**
 * PATCH with JSON body
 */
export const patch = (endpoint, data, config) =>
  apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, config);

/**
 * DELETE request
 */
export const del = (endpoint, config) =>
  apiRequest(endpoint, { method: 'DELETE' }, config);

/**
 * POST with FormData (file uploads)
 * Content-Type header is automatically removed so browser sets multipart boundary
 */
export const postFormData = (endpoint, formData, config) =>
  apiRequest(endpoint, {
    method: 'POST',
    body: formData,
  }, { timeout: UPLOAD_TIMEOUT, ...config });

/**
 * PUT with FormData (file updates)
 */
export const putFormData = (endpoint, formData, config) =>
  apiRequest(endpoint, {
    method: 'PUT',
    body: formData,
  }, { timeout: UPLOAD_TIMEOUT, ...config });

/**
 * POST with binary body (ArrayBuffer, e.g., report uploads)
 */
export const postBinary = (endpoint, arrayBuffer, contentType = 'application/octet-stream', config) =>
  apiRequest(endpoint, {
    method: 'POST',
    body: arrayBuffer,
    headers: { 'Content-Type': contentType },
  }, { timeout: UPLOAD_TIMEOUT, ...config });

// ─── File Download ──────────────────────────────────────────────────────────

/**
 * Download a file from the API
 * @param {string} endpoint - API endpoint
 * @param {string} [filename] - Optional filename (extracted from Content-Disposition if not provided)
 * @param {Object} [config] - Request config (timeout, signal)
 */
export const downloadFile = async (endpoint, filename = null, config = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const timeout = config.timeout || DOWNLOAD_TIMEOUT;

  const { controller, timeoutId } = createTimeoutController(timeout, config.signal);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Lejupielāde neizdevās' }));
      throw new ApiError(response.status, errorData);
    }

    // Extract filename from Content-Disposition if not provided
    if (!filename) {
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        // Handle both filename="name" and filename*=UTF-8''name formats
        const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/);
        const standardMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (utf8Match) {
          filename = decodeURIComponent(utf8Match[1]);
        } else if (standardMatch) {
          filename = standardMatch[1].trim();
        }
      }
    }

    if (!filename) {
      filename = `download_${Date.now()}`;
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) throw error;

    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      throw new ApiError(0, {
        error: 'Lejupielāde tika pārtraukta vai iestājās noilgums.'
      });
    }

    throw new ApiError(0, {
      error: 'Neizdevās lejupielādēt datni. Lūdzu pārbaudiet interneta savienojumu.'
    });
  }
};

// ─── Utility Exports ────────────────────────────────────────────────────────

export { API_BASE_URL };
