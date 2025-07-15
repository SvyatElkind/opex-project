import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NavigationProvider } from './Navigation/context/NavigationContext';
import Workspace from './Workspace/Workspace';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Create a client with optimal settings for local application
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh longer
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours - keep in cache longer
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Only retry failed requests once
    },
  },
});

// Simple manual cache persistence
// Save queries to localStorage whenever they change
queryClient.getQueryCache().subscribe(() => {
  try {
    const queryCache = queryClient.getQueryCache().getAll();
    // Only store the data, not the full query objects
    const simplifiedCache = queryCache.map(query => ({
      queryKey: query.queryKey,
      data: query.state.data,
      dataUpdatedAt: query.state.dataUpdatedAt,
    }));
    
    localStorage.setItem('OPEX_TOOL_CACHE', JSON.stringify(simplifiedCache));
  } catch (error) {
    console.error('Failed to save cache to localStorage:', error);
  }
});

// Try to restore from localStorage on initialization
try {
  const savedCache = localStorage.getItem('OPEX_TOOL_CACHE');
  if (savedCache) {
    const parsed = JSON.parse(savedCache);
    // Restore cached data to the query client
    parsed.forEach(item => {
      if (item.data && item.queryKey) {
        queryClient.setQueryData(item.queryKey, item.data);
      }
    });
    console.log('Restored cache from localStorage');
  }
} catch (error) {
  console.error('Failed to restore cache from localStorage:', error);
  // If restoration fails, clear cache to prevent future errors
  localStorage.removeItem('OPEX_TOOL_CACHE');
}

// Add memory monitoring in development
if (process.env.NODE_ENV === 'development') {
  // Check memory usage every 30 seconds
  const memoryMonitorInterval = setInterval(() => {
    if (window.performance && window.performance.memory) {
      const usedJSHeapSize = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
      const totalJSHeapSize = Math.round(window.performance.memory.totalJSHeapSize / (1024 * 1024));
      
      console.log(`Memory Usage: ${usedJSHeapSize}MB / ${totalJSHeapSize}MB (${Math.round(usedJSHeapSize / totalJSHeapSize * 100)}%)`);
      
      // Alert if memory usage is high (over 80%)
      if (usedJSHeapSize / totalJSHeapSize > 0.8) {
        console.warn('High memory usage detected!');
      }
    }
  }, 30000);
  
  // Clean up on unmount
  window.addEventListener('beforeunload', () => {
    clearInterval(memoryMonitorInterval);
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NavigationProvider>
        <Workspace />
      </NavigationProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);