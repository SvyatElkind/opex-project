/**
 * Constants Context
 * Provides API-fetched constants throughout the application
 * with automatic fallback support
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchConstants } from '../API/Constants_API';
import {
  FALLBACK_CONSTANTS,
  DEFAULT_VALUES,
  REQUIRE_ANNOTATION_TYPES,
  REQUIRE_DURATION_TYPES,
  REQUIRE_COLOR_TYPES,
  REQUIRE_RESOLUTION_TYPES,
  NOT_REQUIRE_LANGUAGE_TYPE,
  MEDIA_TYPES,
  TEXTUAL_TYPES
} from '../Constants/FallbackConstants';

// Create context
const ConstantsContext = createContext(null);

/**
 * Constants Provider Component
 * Wrap your app with this to provide constants to all children
 */
export const ConstantsProvider = ({ children }) => {
  const [constants, setConstants] = useState(FALLBACK_CONSTANTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromApi, setIsFromApi] = useState(false);

  useEffect(() => {
    const loadConstants = async () => {
      try {
        setLoading(true);
        const data = await fetchConstants();
        setConstants(data);
        setIsFromApi(true);
        setError(null);
      } catch (err) {
        console.error('Error loading constants:', err);
        setError(err);
        setIsFromApi(false);
        // Keep using fallback constants (already set as initial state)
      } finally {
        setLoading(false);
      }
    };

    loadConstants();
  }, []);

  // Build context value with all helpers
  const value = {
    // Raw constants object
    constants,

    // Loading state
    loading,
    error,
    isFromApi,

    // ===========================================
    // INVENTORY CONSTANTS
    // ===========================================
    inventoryTypes: constants.inventory?.type || FALLBACK_CONSTANTS.inventory.type,
    storageTerms: constants.inventory?.storage_term || FALLBACK_CONSTANTS.inventory.storage_term,

    // ===========================================
    // ITEM CONSTANTS
    // ===========================================
    dateIndicators: constants.item?.date_indicator || FALLBACK_CONSTANTS.item.date_indicator,
    unitsOfMeasure: constants.item?.unit_of_measure || FALLBACK_CONSTANTS.item.unit_of_measure,
    restrictions: constants.item?.restriction || FALLBACK_CONSTANTS.item.restriction,
    securityLevels: constants.item?.security_level || FALLBACK_CONSTANTS.item.security_level,

    // ===========================================
    // RECORD CONSTANTS
    // ===========================================
    accessRestrictions: constants.record?.access_restriction || FALLBACK_CONSTANTS.record.access_restriction,

    // ===========================================
    // DEFAULT VALUES
    // ===========================================
    defaults: DEFAULT_VALUES,

    // ===========================================
    // TYPE HELPERS
    // ===========================================
    mediaTypes: MEDIA_TYPES,
    textualTypes: TEXTUAL_TYPES,
    requireAnnotationTypes: REQUIRE_ANNOTATION_TYPES,
    requireDurationTypes: REQUIRE_DURATION_TYPES,
    requireColorTypes: REQUIRE_COLOR_TYPES,
    requireResolutionTypes: REQUIRE_RESOLUTION_TYPES,
    notRequireLanguageType: NOT_REQUIRE_LANGUAGE_TYPE,

    // ===========================================
    // HELPER FUNCTIONS
    // ===========================================

    /**
     * Check if inventory type is media
     * @param {string} type - Inventory type
     * @returns {boolean}
     */
    isMediaType: (type) => MEDIA_TYPES.includes(type),

    /**
     * Check if inventory type is textual
     * @param {string} type - Inventory type
     * @returns {boolean}
     */
    isTextualType: (type) => TEXTUAL_TYPES.includes(type),

    /**
     * Check if type requires annotation field
     * @param {string} type - Inventory type
     * @returns {boolean}
     */
    requiresAnnotation: (type) => REQUIRE_ANNOTATION_TYPES.includes(type),

    /**
     * Check if type requires language field
     * @param {string} type - Inventory type
     * @returns {boolean}
     */
    requiresLanguage: (type) => type !== NOT_REQUIRE_LANGUAGE_TYPE,

    /**
     * Check if type requires duration field
     * @param {string} type - Inventory type
     * @returns {boolean}
     */
    requiresDuration: (type) => REQUIRE_DURATION_TYPES.includes(type),

    /**
     * Check if type requires color field
     * @param {string} type - Inventory type
     * @returns {boolean}
     */
    requiresColor: (type) => REQUIRE_COLOR_TYPES.includes(type),

    /**
     * Check if type requires resolution field
     * @param {string} type - Inventory type
     * @returns {boolean}
     */
    requiresResolution: (type) => REQUIRE_RESOLUTION_TYPES.includes(type),

    /**
     * Check if restriction requires note
     * @param {string} restriction - Restriction value
     * @returns {boolean}
     */
    requiresRestrictionNote: (restriction) => restriction !== DEFAULT_VALUES.restriction,
  };

  return (
    <ConstantsContext.Provider value={value}>
      {children}
    </ConstantsContext.Provider>
  );
};

/**
 * Hook to access constants
 * @returns {Object} Constants and helper functions
 *
 * @example
 * const { inventoryTypes, isMediaType } = useConstants();
 */
export const useConstants = () => {
  const context = useContext(ConstantsContext);
  if (!context) {
    throw new Error('useConstants must be used within a ConstantsProvider');
  }
  return context;
};

export default ConstantsContext;
