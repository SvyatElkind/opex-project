// src/utils/PerformanceMonitor.js

class PerformanceMonitor {
    constructor() {
      this.measures = {};
      this.markers = {};
      this.isEnabled = process.env.NODE_ENV === 'development';
      
      // Initialize memory monitor
      if (this.isEnabled && window.performance && window.performance.memory) {
        this.startMemoryMonitor();
      }
    }
    
    // Start timing a specific operation
    startMeasure(label) {
      if (!this.isEnabled) return;
      
      this.markers[label] = {
        start: performance.now(),
        end: null
      };
      
      console.log(`⏱️ Starting measurement: ${label}`);
    }
    
    // End timing and record the measurement
    endMeasure(label) {
      if (!this.isEnabled || !this.markers[label]) return;
      
      const marker = this.markers[label];
      marker.end = performance.now();
      
      const duration = marker.end - marker.start;
      
      // Store the measurement
      if (!this.measures[label]) {
        this.measures[label] = [];
      }
      
      this.measures[label].push(duration);
      
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      
      // Alert if operation is slow (over 500ms)
      if (duration > 500) {
        console.warn(`⚠️ Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
      
      // Clean up marker
      delete this.markers[label];
    }
    
    // Get statistics for a specific measurement
    getStats(label) {
      if (!this.measures[label] || this.measures[label].length === 0) {
        return null;
      }
      
      const values = this.measures[label];
      
      // Calculate statistics
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // Calculate standard deviation
      const squareDiffs = values.map(value => {
        const diff = value - avg;
        return diff * diff;
      });
      const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
      const stdDev = Math.sqrt(avgSquareDiff);
      
      return {
        count: values.length,
        avg: avg,
        min: min,
        max: max,
        stdDev: stdDev
      };
    }
    
    // Get all statistics
    getAllStats() {
      const stats = {};
      
      Object.keys(this.measures).forEach(label => {
        stats[label] = this.getStats(label);
      });
      
      return stats;
    }
    
    // Log all statistics to console
    logStats() {
      if (!this.isEnabled) return;
      
      console.group('Performance Measurements');
      
      const allStats = this.getAllStats();
      Object.keys(allStats).forEach(label => {
        const stat = allStats[label];
        console.log(`${label}: avg=${stat.avg.toFixed(2)}ms, min=${stat.min.toFixed(2)}ms, max=${stat.max.toFixed(2)}ms, count=${stat.count}`);
      });
      
      console.groupEnd();
    }
    
    // Clear all measurements
    clearMeasurements() {
      this.measures = {};
    }
    
    // Memory monitoring
    startMemoryMonitor() {
      this.memoryMonitorInterval = setInterval(() => {
        if (window.performance && window.performance.memory) {
          const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = window.performance.memory;
          
          // Convert to MB for readability
          const used = Math.round(usedJSHeapSize / (1024 * 1024));
          const total = Math.round(totalJSHeapSize / (1024 * 1024));
          const limit = Math.round(jsHeapSizeLimit / (1024 * 1024));
          
          // Calculate usage percentage
          const usagePercent = Math.round((used / total) * 100);
          
          // Log with colors based on usage
          const logStyle = usagePercent > 80 
            ? 'color: red; font-weight: bold' 
            : usagePercent > 60 
              ? 'color: orange' 
              : 'color: green';
          
          console.log(
            `%c🧠 Memory: ${used}MB / ${total}MB (${usagePercent}%) of ${limit}MB limit`,
            logStyle
          );
          
          // Alert on high usage
          if (usagePercent > 80) {
            console.warn('⚠️ HIGH MEMORY USAGE! Consider optimizing or clearing data.');
          }
        }
      }, 30000); // Check every 30 seconds
    }
    
    // Stop memory monitoring
    stopMemoryMonitor() {
      if (this.memoryMonitorInterval) {
        clearInterval(this.memoryMonitorInterval);
      }
    }
    
    // Clean up
    dispose() {
      this.stopMemoryMonitor();
      this.clearMeasurements();
    }
  }
  
  // Create singleton instance
  const performanceMonitor = new PerformanceMonitor();
  
  export default performanceMonitor;