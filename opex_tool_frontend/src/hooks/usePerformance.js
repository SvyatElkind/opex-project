// src/hooks/usePerformance.js

import { useEffect, useRef } from 'react';
import performanceMonitor from '../Utils/PerformanceMonitor';

/**
 * Hook for performance monitoring of component operations
 * 
 * @param {string} componentName - Name of the component for labeling measurements
 * @returns {Object} - Performance measurement methods
 */
export function usePerformance(componentName) {
  const componentRef = useRef(componentName);
  
  // Measure component mount time
  useEffect(() => {
    const label = `${componentRef.current} - Mount`;
    performanceMonitor.startMeasure(label);
    
    return () => {
      performanceMonitor.endMeasure(label);
    };
  }, []);
  
  /**
   * Measure performance of a function
   * @param {Function} fn - Function to measure
   * @param {string} operationName - Name of the operation
   * @returns {Function} - Wrapped function that measures performance
   */
  const measureFunction = (fn, operationName) => {
    return (...args) => {
      const label = `${componentRef.current} - ${operationName}`;
      performanceMonitor.startMeasure(label);
      
      try {
        const result = fn(...args);
        
        // Handle promise results
        if (result instanceof Promise) {
          return result.finally(() => {
            performanceMonitor.endMeasure(label);
          });
        }
        
        performanceMonitor.endMeasure(label);
        return result;
      } catch (error) {
        performanceMonitor.endMeasure(label);
        throw error;
      }
    };
  };
  
  /**
   * Start measuring a manual operation
   * @param {string} operationName - Name of the operation
   */
  const startMeasure = (operationName) => {
    const label = `${componentRef.current} - ${operationName}`;
    performanceMonitor.startMeasure(label);
  };
  
  /**
   * End measuring a manual operation
   * @param {string} operationName - Name of the operation
   */
  const endMeasure = (operationName) => {
    const label = `${componentRef.current} - ${operationName}`;
    performanceMonitor.endMeasure(label);
  };
  
  return {
    measureFunction,
    startMeasure,
    endMeasure,
    getStats: performanceMonitor.getStats.bind(performanceMonitor),
    logAllStats: performanceMonitor.logStats.bind(performanceMonitor)
  };
}