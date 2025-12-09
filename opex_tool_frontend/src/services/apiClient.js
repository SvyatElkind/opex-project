import { parseApiError, isErrorStatus, isNotFoundStatus } from './errorService';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(status, data) {
    const parsed = parseApiError(data);
    super(parsed.general || 'API Error');
    this.status = status;
    this.data = data;
    this.parsed = parsed;
    this.fieldErrors = parsed.fields;
  }
}

/**
 * Make API request with standardized error handling
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Merge options, but handle headers specially to allow removal
  const config = {
    ...defaultOptions,
    ...options,
  };

  // Merge headers, filtering out undefined values to allow header removal
  config.headers = {
    ...defaultOptions.headers,
    ...options.headers,
  };

  // Remove any headers that are explicitly set to undefined or null
  Object.keys(config.headers).forEach(key => {
    if (config.headers[key] === undefined || config.headers[key] === null) {
      delete config.headers[key];
    }
  });

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (isNotFoundStatus(response.status)) {
      return { data: null, status: 204, notFound: true };
    }

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle error responses
    if (isErrorStatus(response.status)) {
      throw new ApiError(response.status, data);
    }

    return { data, status: response.status };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(0, {
      error: 'Neizdevās izveidot savienojumu ar serveri. Lūdzu pārbaudiet interneta savienojumu.'
    });
  }
};

// Convenience methods
export const get = (endpoint) => apiRequest(endpoint, { method: 'GET' });

export const post = (endpoint, data) => apiRequest(endpoint, {
  method: 'POST',
  body: JSON.stringify(data),
});

export const put = (endpoint, data) => apiRequest(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const del = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });

export const postFormData = (endpoint, formData) => apiRequest(endpoint, {
  method: 'POST',
  body: formData,
  headers: {}, // Let browser set Content-Type for FormData
});

/**
 * Download a file from the API
 * @param {string} endpoint - API endpoint
 * @param {string} filename - Optional filename for download (will try to get from Content-Disposition header if not provided)
 * @returns {Promise<void>}
 */
export const downloadFile = async (endpoint, filename = null) => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
      throw new ApiError(response.status, errorData);
    }

    // Get filename from Content-Disposition header if not provided
    if (!filename) {
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
    }

    // Default filename if still not set
    if (!filename) {
      filename = `download_${Date.now()}`;
    }

    // Get the blob
    const blob = await response.blob();

    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, {
      error: 'Neizdevās lejupielādēt failu. Lūdzu pārbaudiet interneta savienojumu.'
    });
  }
};
