/**
 * Constants API Service
 * Fetches allowed values from backend with caching and fallback support
 *
 * API Endpoint: GET /api/v1/values/
 */

import { FALLBACK_CONSTANTS } from '../Constants/FallbackConstants';
import { get } from '../services/apiClient';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cache storage
let cachedConstants = null;
let cacheTimestamp = null;

/**
 * Fetch constants from API with fallback
 * @returns {Promise<Object>} Constants object matching backend structure
 */
export const fetchConstants = async () => {
  // Check cache first
  if (cachedConstants && cacheTimestamp) {
    const age = Date.now() - cacheTimestamp;
    if (age < CACHE_DURATION) {
      return cachedConstants;
    }
  }

  try {
    const { data } = await get('/values/');

    // Update cache
    cachedConstants = data;
    cacheTimestamp = Date.now();

    return data;
  } catch (error) {
    return FALLBACK_CONSTANTS;
  }
};

/**
 * Get constants synchronously (from cache or fallback)
 * Use this when you need constants immediately without waiting for API
 * @returns {Object} Constants object
 */
export const getConstants = () => {
  return cachedConstants || FALLBACK_CONSTANTS;
};

/**
 * Get specific constant by path
 * @param {string} path - Dot notation path (e.g., 'inventory.type', 'item.restriction')
 * @returns {Array} Constant values array
 *
 * @example
 * getConstantByPath('inventory.type') // ['Foto', 'Skaņas', 'Tekstuāls', 'Video']
 * getConstantByPath('item.security_level') // ['Publisks', 'Iekšējs', ...]
 */
export const getConstantByPath = (path) => {
  const constants = getConstants();
  const parts = path.split('.');
  let value = constants;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return [];
    }
  }

  return value;
};

/**
 * Clear cached constants
 * Call this if you need to force a fresh fetch
 */
export const clearConstantsCache = () => {
  cachedConstants = null;
  cacheTimestamp = null;
};

/**
 * Check if constants are loaded from API (not fallback)
 * @returns {boolean}
 */
export const isConstantsLoaded = () => {
  return cachedConstants !== null;
};

/**
 * Get cache age in milliseconds
 * @returns {number|null} Age in ms or null if not cached
 */
export const getCacheAge = () => {
  if (!cacheTimestamp) return null;
  return Date.now() - cacheTimestamp;
};

/**
 * Get inventory type options
 * @returns {Array<string>}
 */
export const getInventoryTypes = () => {
  return getConstantByPath('inventory.type');
};

/**
 * Get storage term options
 * @returns {Array<string>}
 */
export const getStorageTerms = () => {
  return getConstantByPath('inventory.storage_term');
};

/**
 * Get date indicator options
 * @returns {Array<string>}
 */
export const getDateIndicators = () => {
  return getConstantByPath('item.date_indicator');
};

/**
 * Get unit of measure options
 * @returns {Array<string>}
 */
export const getUnitsOfMeasure = () => {
  return getConstantByPath('item.unit_of_measure');
};

/**
 * Get restriction options
 * @returns {Array<string>}
 */
export const getRestrictions = () => {
  return getConstantByPath('item.restriction');
};

/**
 * Get security level options
 * @returns {Array<string>}
 */
export const getSecurityLevels = () => {
  return getConstantByPath('item.security_level');
};

/**
 * Get access restriction options
 * @returns {Array<string>}
 */
export const getAccessRestrictions = () => {
  return getConstantByPath('record.access_restriction');
};

export default {
  fetchConstants,
  getConstants,
  getConstantByPath,
  clearConstantsCache,
  isConstantsLoaded,
  getCacheAge,
  // Convenience getters
  getInventoryTypes,
  getStorageTerms,
  getDateIndicators,
  getUnitsOfMeasure,
  getRestrictions,
  getSecurityLevels,
  getAccessRestrictions
};
