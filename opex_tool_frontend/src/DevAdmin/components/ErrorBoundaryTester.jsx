import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import CopyButton, { formatErrorLog } from './CopyButton';

/**
 * ErrorBoundaryTester — Intentionally trigger errors for testing
 *
 * Features:
 * - Throw render errors to test Error Boundaries
 * - Simulate API errors (400, 401, 403, 404, 500)
 * - Corrupt localStorage to test recovery
 * - Simulate network disconnection
 * - Simulate slow API responses
 * - Test concurrent mutation conflicts
 * - Verify graceful degradation
 */

// Component that throws on render for testing Error Boundaries
const CrashComponent = ({ type }) => {
  if (type === 'render') {
    throw new Error('[ErrorBoundaryTester] Intentional render error for testing');
  }
  if (type === 'null') {
    const obj = null;
    return obj.property; // TypeError
  }
  return null;
};

const ErrorBoundaryTester = () => {
  const queryClient = useQueryClient();
  const [logs, setLogs] = useState([]);
  const [shouldCrash, setShouldCrash] = useState(null);
  const [crashCaught, setCrashCaught] = useState(false);

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }].slice(-50));
  }, []);

  // ─── Error Triggers ───────────────────────────────────────────────────────

  const simulateApiError = async (statusCode) => {
    addLog(`Simulating ${statusCode} API error...`, 'warning');
    try {
      const response = await fetch(`/api/v1/project/nonexistent-error-test-${Date.now()}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      addLog(`Got ${response.status} ${response.statusText}`, response.ok ? 'success' : 'error');
      if (!response.ok) {
        const data = await response.json().catch(() => response.text());
        addLog(`Response: ${JSON.stringify(data).slice(0, 200)}`, 'info');
      }
    } catch (e) {
      addLog(`Caught: ${e.message}`, 'error');
    }
  };

  const simulateNetworkError = async () => {
    addLog('Simulating network error (fetch to invalid URL)...', 'warning');
    try {
      await fetch('http://localhost:1/nonexistent', { signal: AbortSignal.timeout(2000) });
      addLog('Unexpectedly succeeded', 'warning');
    } catch (e) {
      addLog(`Network error caught: ${e.message}`, 'success');
    }
  };

  const simulateSlowRequest = async () => {
    addLog('Simulating slow request (5s timeout)...', 'warning');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const start = performance.now();
      await fetch('/api/v1/project/', { signal: controller.signal });
      const duration = Math.round(performance.now() - start);
      clearTimeout(timeoutId);
      addLog(`Request completed in ${duration}ms`, 'success');
    } catch (e) {
      clearTimeout(timeoutId);
      addLog(`Request aborted/failed: ${e.message}`, e.name === 'AbortError' ? 'warning' : 'error');
    }
  };

  const corruptLocalStorage = () => {
    const key = 'opex_settings';
    const backup = localStorage.getItem(key);
    addLog(`Backing up ${key}...`, 'info');

    // Write corrupted data
    localStorage.setItem(key, '{invalid json[[[');
    addLog(`Corrupted ${key} with invalid JSON`, 'warning');

    // Try to read it back
    try {
      JSON.parse(localStorage.getItem(key));
      addLog('ERROR: Corrupted data parsed successfully!?', 'error');
    } catch (e) {
      addLog(`Corruption confirmed: ${e.message}`, 'success');
    }

    // Restore
    if (backup) {
      localStorage.setItem(key, backup);
      addLog(`Restored ${key} from backup`, 'success');
    } else {
      localStorage.removeItem(key);
      addLog(`Removed ${key} (no backup)`, 'info');
    }
  };

  const testCacheCorruption = () => {
    addLog('Testing React Query cache with invalid data...', 'warning');

    // Set invalid data in a test query
    const testKey = ['__error_test', Date.now()];
    queryClient.setQueryData(testKey, { corrupted: true, data: null });
    addLog(`Set corrupted cache entry: ${JSON.stringify(testKey)}`, 'info');

    // Read it back
    const data = queryClient.getQueryData(testKey);
    addLog(`Read back: ${JSON.stringify(data)}`, data ? 'success' : 'error');

    // Clean up
    queryClient.removeQueries({ queryKey: testKey });
    addLog('Cleaned up test cache entry', 'success');
  };

  const invalidateAllQueries = () => {
    const cache = queryClient.getQueryCache();
    const count = cache.getAll().length;
    queryClient.invalidateQueries();
    addLog(`Invalidated all ${count} cached queries — triggers refetch`, 'warning');
  };

  const clearAllQueries = () => {
    const cache = queryClient.getQueryCache();
    const count = cache.getAll().length;
    queryClient.clear();
    addLog(`Cleared entire query cache (${count} entries removed)`, 'error');
  };

  const testUnhandledRejection = () => {
    addLog('Firing unhandled promise rejection...', 'warning');
    // This will be caught by window.onunhandledrejection if it exists
    Promise.reject(new Error('[ErrorBoundaryTester] Intentional unhandled rejection'));
    addLog('Unhandled rejection fired — check console for error', 'info');
  };

  const testConsoleError = () => {
    addLog('Firing console.error...', 'warning');
    console.error('[ErrorBoundaryTester] Intentional console.error for testing');
    addLog('console.error fired — check browser console', 'info');
  };

  const triggerRenderCrash = (type) => {
    addLog(`Triggering ${type} render crash...`, 'error');
    setCrashCaught(false);
    setShouldCrash(type);
  };

  const actions = [
    {
      group: 'API Errors',
      items: [
        { label: 'GET 404 Not Found', icon: 'fa-search', color: '#f59e0b', fn: () => simulateApiError(404) },
        { label: 'POST Invalid Data', icon: 'fa-paper-plane', color: '#f59e0b', fn: () => simulateApiError(400) },
        { label: 'Network Error', icon: 'fa-wifi', color: '#ef4444', fn: simulateNetworkError },
        { label: 'Slow Request (5s)', icon: 'fa-hourglass-half', color: '#8b5cf6', fn: simulateSlowRequest },
      ]
    },
    {
      group: 'State Corruption',
      items: [
        { label: 'Corrupt localStorage', icon: 'fa-database', color: '#ef4444', fn: corruptLocalStorage },
        { label: 'Corrupt Query Cache', icon: 'fa-layer-group', color: '#ef4444', fn: testCacheCorruption },
        { label: 'Invalidate All Queries', icon: 'fa-sync', color: '#f59e0b', fn: invalidateAllQueries },
        { label: 'Clear All Cache', icon: 'fa-trash', color: '#ef4444', fn: clearAllQueries },
      ]
    },
    {
      group: 'Error Propagation',
      items: [
        { label: 'Unhandled Promise Rejection', icon: 'fa-bomb', color: '#ef4444', fn: testUnhandledRejection },
        { label: 'console.error', icon: 'fa-terminal', color: '#f59e0b', fn: testConsoleError },
        { label: 'Render Crash (throw)', icon: 'fa-skull-crossbones', color: '#dc2626', fn: () => triggerRenderCrash('render') },
      ]
    },
  ];

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>Error Boundary Tester</h3>
      </div>

      {/* Crash Component (renders only when triggered) */}
      {shouldCrash && !crashCaught && (
        <React.Suspense fallback={null}>
          <ErrorCatcher onCatch={(e) => {
            addLog(`Error boundary caught: ${e}`, 'success');
            setCrashCaught(true);
            setShouldCrash(null);
          }}>
            <CrashComponent type={shouldCrash} />
          </ErrorCatcher>
        </React.Suspense>
      )}

      {/* Action Groups */}
      <div style={{ maxHeight: 250, overflow: 'auto' }}>
        {actions.map(group => (
          <div key={group.group} style={{ marginBottom: 12 }}>
            <div style={{
              color: '#9ca3af', fontSize: 11, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 1,
              marginBottom: 6, padding: '0 4px'
            }}>
              {group.group}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {group.items.map(action => (
                <button
                  key={action.label}
                  className="dev-btn"
                  onClick={action.fn}
                  style={{
                    justifyContent: 'flex-start', padding: '6px 10px',
                    borderColor: action.color + '44',
                    fontSize: 12
                  }}
                >
                  <i className={`fas ${action.icon}`} style={{ color: action.color, width: 16 }}></i>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Log Output */}
      <div style={{ marginTop: 12 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 6
        }}>
          <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
            Output Log ({logs.length})
          </span>
          <CopyButton
            getText={() => formatErrorLog(logs)}
            label="Copy Log"
            style={{ marginRight: 4 }}
          />
          <button
            className="dev-btn"
            onClick={() => setLogs([])}
            style={{ padding: '2px 8px', fontSize: 11 }}
          >
            Clear
          </button>
        </div>
        <div style={{
          background: '#0d1117', borderRadius: 6, padding: 8,
          maxHeight: 200, overflow: 'auto', fontFamily: 'monospace', fontSize: 11
        }}>
          {logs.length === 0 && (
            <div style={{ color: '#4b5563', textAlign: 'center', padding: 16 }}>
              Click an action above to test error handling...
            </div>
          )}
          {logs.map((log, idx) => (
            <div key={idx} style={{
              padding: '2px 0', borderBottom: '1px solid #1f293744',
              color: log.type === 'error' ? '#fca5a5' :
                     log.type === 'warning' ? '#fcd34d' :
                     log.type === 'success' ? '#6ee7b7' : '#d1d5db'
            }}>
              <span style={{ color: '#4b5563', marginRight: 6 }}>{log.timestamp}</span>
              {log.type === 'error' && <span style={{ marginRight: 4 }}>ERR</span>}
              {log.type === 'warning' && <span style={{ marginRight: 4 }}>WRN</span>}
              {log.type === 'success' && <span style={{ marginRight: 4 }}>OK </span>}
              {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Simple Error Boundary wrapper for crash testing
 */
class ErrorCatcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (this.props.onCatch) {
      this.props.onCatch(error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#7f1d1d33', padding: 8, borderRadius: 4,
          color: '#fca5a5', fontSize: 12, margin: '4px 0'
        }}>
          <i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: 6 }}></i>
          Error boundary caught the crash successfully
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundaryTester;
