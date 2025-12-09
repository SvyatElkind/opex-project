import { useState, useCallback } from 'react';
import { parseApiError } from '../services/errorService';

/**
 * Hook for managing form errors from API responses
 */
export const useFormErrors = () => {
  const [generalError, setGeneralError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Set errors from API response
   */
  const setApiErrors = useCallback((errorData) => {
    const parsed = parseApiError(errorData);
    setGeneralError(parsed.general);
    setFieldErrors(parsed.fields);
  }, []);

  /**
   * Set a single field error
   */
  const setFieldError = useCallback((field, message) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setGeneralError(null);
    setFieldErrors({});
  }, []);

  /**
   * Clear error for specific field
   */
  const clearFieldError = useCallback((field) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Get error for specific field
   */
  const getFieldError = useCallback((field) => {
    return fieldErrors[field] || null;
  }, [fieldErrors]);

  /**
   * Check if there are any errors
   */
  const hasErrors = generalError || Object.keys(fieldErrors).length > 0;

  return {
    generalError,
    fieldErrors,
    setApiErrors,
    setGeneralError,
    setFieldError,
    setFieldErrors,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasErrors,
  };
};

export default useFormErrors;
