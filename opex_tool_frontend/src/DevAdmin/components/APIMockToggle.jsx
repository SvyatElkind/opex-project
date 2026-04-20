import React, { useState, useEffect, useCallback, useRef } from 'react';
import CopyButton, { formatErrorLog } from './CopyButton';
import { addMiddleware, removeMiddleware, getOriginalFetch } from '../fetchInterceptor';

/**
 * APIMockToggle — API failure injection and endpoint switching
 *
 * Features:
 * - Inject random failures at configurable rate
 * - Force specific status codes on next N requests
 * - Add artificial latency to all requests
 * - Override API base URL (switch backend)
 * - Block specific endpoints
 * - Log all intercepted requests
 */

// Global state for the interceptor (survives re-renders)
const mockState = {
  enabled: false,
  failureRate: 0,        // 0-100 percent
  forcedStatus: null,     // null or { code: 500, remaining: 3 }
  latencyMs: 0,           // Added delay in ms
  blockedEndpoints: [],   // Array of URL patterns to block
  customBaseUrl: '',      // Override API base URL
  interceptCount: 0,
  failCount: 0,
};

const APIMockToggle = () => {
  const [config, setConfig] = useState({ ...mockState });
  const [logs, setLogs] = useState([]);
  const [newBlockedPattern, setNewBlockedPattern] = useState('');
  const middlewareIdRef = useRef(null);

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }].slice(-100));
  }, []);

  // Install/remove interceptor via shared registry
  useEffect(() => {
    if (config.enabled) {
      installInterceptor();
    } else {
      uninstallInterceptor();
    }

    return () => uninstallInterceptor();
  }, [config.enabled]);

  const installInterceptor = () => {
    if (middlewareIdRef.current !== null) return; // Already installed

    const id = addMiddleware(async (args, next) => {
      const [input, init = {}] = args;
      const url = typeof input === 'string' ? input : input?.url || String(input);

      // Only intercept API calls
      if (!url.includes('/api/')) {
        return next(args);
      }

      mockState.interceptCount++;

      // Check blocked endpoints
      const isBlocked = mockState.blockedEndpoints.some(pattern =>
        url.includes(pattern)
      );
      if (isBlocked) {
        mockState.failCount++;
        addLog(`BLOCKED: ${init.method || 'GET'} ${url}`, 'error');
        throw new TypeError(`[APIMock] Endpoint blocked: ${url}`);
      }

      // Add artificial latency
      if (mockState.latencyMs > 0) {
        await new Promise(resolve => setTimeout(resolve, mockState.latencyMs));
      }

      // Forced status code
      if (mockState.forcedStatus && mockState.forcedStatus.remaining > 0) {
        mockState.forcedStatus.remaining--;
        mockState.failCount++;
        const code = mockState.forcedStatus.code;
        addLog(`FORCED ${code}: ${init.method || 'GET'} ${url}`, 'warning');

        if (mockState.forcedStatus.remaining === 0) {
          mockState.forcedStatus = null;
        }

        return new Response(JSON.stringify({
          detail: `[APIMock] Forced ${code} error for testing`
        }), {
          status: code,
          statusText: `Mock ${code}`,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Random failure rate
      if (mockState.failureRate > 0 && Math.random() * 100 < mockState.failureRate) {
        mockState.failCount++;
        const code = [400, 403, 404, 500, 502, 503][Math.floor(Math.random() * 6)];
        addLog(`RANDOM ${code}: ${init.method || 'GET'} ${url}`, 'warning');

        return new Response(JSON.stringify({
          detail: `[APIMock] Random failure (${mockState.failureRate}% rate)`
        }), {
          status: code,
          statusText: `Mock ${code}`,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Custom base URL override
      if (mockState.customBaseUrl) {
        const realFetch = getOriginalFetch();
        const newUrl = url.replace(/^.*\/api\/v1/, mockState.customBaseUrl);
        if (newUrl !== url) {
          addLog(`REDIRECT: ${url} -> ${newUrl}`, 'info');
          return realFetch(newUrl, init);
        }
      }

      return next(args);
    });

    middlewareIdRef.current = id;
    addLog('Mock interceptor installed', 'success');
  };

  const uninstallInterceptor = () => {
    if (middlewareIdRef.current !== null) {
      removeMiddleware(middlewareIdRef.current);
      middlewareIdRef.current = null;
      // Reset all mock state so re-enabling starts clean
      mockState.failureRate = 0;
      mockState.forcedStatus = null;
      mockState.latencyMs = 0;
      mockState.blockedEndpoints = [];
      mockState.customBaseUrl = '';
      mockState.interceptCount = 0;
      mockState.failCount = 0;
      setConfig({ ...mockState });
      addLog('Mock interceptor removed — all settings reset', 'info');
    }
  };

  const updateConfig = (updates) => {
    Object.assign(mockState, updates);
    setConfig({ ...mockState });
  };

  const addBlockedEndpoint = () => {
    if (!newBlockedPattern.trim()) return;
    const updated = [...mockState.blockedEndpoints, newBlockedPattern.trim()];
    updateConfig({ blockedEndpoints: updated });
    addLog(`Blocked pattern: ${newBlockedPattern}`, 'warning');
    setNewBlockedPattern('');
  };

  const removeBlockedEndpoint = (pattern) => {
    const updated = mockState.blockedEndpoints.filter(p => p !== pattern);
    updateConfig({ blockedEndpoints: updated });
    addLog(`Unblocked pattern: ${pattern}`, 'success');
  };

  const forceNextErrors = (code, count) => {
    updateConfig({ forcedStatus: { code, remaining: count } });
    addLog(`Next ${count} API requests will return ${code}`, 'warning');
  };

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>API Mock & Failure Injection</h3>
      </div>

      {/* Master Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 12px', marginBottom: 12,
        background: config.enabled ? '#7f1d1d33' : '#111827',
        borderRadius: 6, border: `1px solid ${config.enabled ? '#ef444444' : '#1f2937'}`
      }}>
        <button
          className={`dev-btn ${config.enabled ? '' : 'primary'}`}
          onClick={() => updateConfig({ enabled: !config.enabled })}
          style={config.enabled ? { borderColor: '#ef4444', color: '#fca5a5' } : {}}
        >
          <i className={`fas ${config.enabled ? 'fa-stop' : 'fa-play'}`}></i>
          <span>{config.enabled ? 'Disable Interceptor' : 'Enable Interceptor'}</span>
        </button>
        <span style={{ fontSize: 12, color: config.enabled ? '#fca5a5' : '#6b7280' }}>
          {config.enabled
            ? `Active — ${mockState.interceptCount} intercepted, ${mockState.failCount} failed`
            : 'Interceptor disabled — API calls pass through normally'}
        </span>
        {config.enabled && (config.failureRate > 0 || config.latencyMs > 0 || config.forcedStatus || config.blockedEndpoints.length > 0) && (
          <div style={{ fontSize: 10, color: '#fcd34d', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {config.failureRate > 0 && <span>Fail: {config.failureRate}%</span>}
            {config.latencyMs > 0 && <span>Delay: {config.latencyMs}ms</span>}
            {config.forcedStatus && <span>Forced: {config.forcedStatus.code} x{config.forcedStatus.remaining}</span>}
            {config.blockedEndpoints.length > 0 && <span>Blocked: {config.blockedEndpoints.length}</span>}
          </div>
        )}
      </div>

      {/* Configuration */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {/* Failure Rate */}
        <div style={{ background: '#111827', padding: 10, borderRadius: 6 }}>
          <div style={{ color: '#f59e0b', fontWeight: 600, fontSize: 12, marginBottom: 6 }}>
            <i className="fas fa-random" style={{ marginRight: 6 }}></i>Random Failure Rate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range"
              min="0" max="100" step="5"
              value={config.failureRate}
              onChange={(e) => updateConfig({ failureRate: Number(e.target.value) })}
              disabled={!config.enabled}
              style={{ flex: 1 }}
            />
            <span style={{ color: '#d1d5db', fontSize: 14, fontWeight: 700, minWidth: 40 }}>
              {config.failureRate}%
            </span>
          </div>
        </div>

        {/* Latency */}
        <div style={{ background: '#111827', padding: 10, borderRadius: 6 }}>
          <div style={{ color: '#8b5cf6', fontWeight: 600, fontSize: 12, marginBottom: 6 }}>
            <i className="fas fa-hourglass-half" style={{ marginRight: 6 }}></i>Added Latency
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range"
              min="0" max="5000" step="100"
              value={config.latencyMs}
              onChange={(e) => updateConfig({ latencyMs: Number(e.target.value) })}
              disabled={!config.enabled}
              style={{ flex: 1 }}
            />
            <span style={{ color: '#d1d5db', fontSize: 14, fontWeight: 700, minWidth: 50 }}>
              {config.latencyMs}ms
            </span>
          </div>
        </div>
      </div>

      {/* Force Status Codes */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          color: '#9ca3af', fontSize: 11, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6
        }}>
          Force Next N Requests to Fail
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[
            { code: 400, label: '400 Bad Request', color: '#f59e0b' },
            { code: 401, label: '401 Unauthorized', color: '#f59e0b' },
            { code: 403, label: '403 Forbidden', color: '#ef4444' },
            { code: 404, label: '404 Not Found', color: '#f59e0b' },
            { code: 500, label: '500 Server Error', color: '#ef4444' },
            { code: 503, label: '503 Unavailable', color: '#ef4444' },
          ].map(s => (
            <button
              key={s.code}
              className="dev-btn"
              disabled={!config.enabled}
              onClick={() => forceNextErrors(s.code, 3)}
              style={{
                padding: '4px 8px', fontSize: 11,
                borderColor: s.color + '44', color: s.color
              }}
            >
              {s.label} x3
            </button>
          ))}
        </div>
        {config.forcedStatus && (
          <div style={{
            marginTop: 6, fontSize: 11, color: '#fcd34d',
            background: '#78350f33', padding: '4px 8px', borderRadius: 4
          }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: 4 }}></i>
            Next {config.forcedStatus.remaining} request(s) will return {config.forcedStatus.code}
          </div>
        )}
      </div>

      {/* Blocked Endpoints */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          color: '#9ca3af', fontSize: 11, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6
        }}>
          Blocked Endpoints
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          <input
            type="text"
            className="test-suite-select"
            placeholder="URL pattern (e.g. media_record, /file/)"
            value={newBlockedPattern}
            onChange={(e) => setNewBlockedPattern(e.target.value)}
            disabled={!config.enabled}
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === 'Enter' && addBlockedEndpoint()}
          />
          <button
            className="dev-btn"
            onClick={addBlockedEndpoint}
            disabled={!config.enabled || !newBlockedPattern.trim()}
          >
            <i className="fas fa-plus"></i>
            <span>Block</span>
          </button>
        </div>
        {config.blockedEndpoints.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {config.blockedEndpoints.map(pattern => (
              <span key={pattern} style={{
                fontSize: 11, background: '#7f1d1d33', color: '#fca5a5',
                padding: '2px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4
              }}>
                {pattern}
                <i
                  className="fas fa-times"
                  style={{ cursor: 'pointer', fontSize: 10 }}
                  onClick={() => removeBlockedEndpoint(pattern)}
                ></i>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Custom Base URL */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          color: '#9ca3af', fontSize: 11, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6
        }}>
          Override API Base URL
        </div>
        <input
          type="text"
          className="test-suite-select"
          placeholder="e.g. http://staging-server:8000/api/v1"
          value={config.customBaseUrl}
          onChange={(e) => updateConfig({ customBaseUrl: e.target.value })}
          disabled={!config.enabled}
          style={{ width: '100%' }}
        />
        {config.customBaseUrl && (
          <div style={{ fontSize: 11, color: '#60a5fa', marginTop: 4 }}>
            <i className="fas fa-exchange-alt" style={{ marginRight: 4 }}></i>
            Redirecting API calls to: {config.customBaseUrl}
          </div>
        )}
      </div>

      {/* Log */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 4
        }}>
          <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600 }}>
            Interceptor Log ({logs.length})
          </span>
          <CopyButton
            getText={() => formatErrorLog(logs)}
            label="Copy"
            style={{ marginRight: 4, fontSize: 10 }}
          />
          <button
            className="dev-btn"
            onClick={() => { setLogs([]); mockState.interceptCount = 0; mockState.failCount = 0; }}
            style={{ padding: '2px 8px', fontSize: 10 }}
          >
            Clear
          </button>
        </div>
        <div style={{
          background: '#0d1117', borderRadius: 6, padding: 6,
          maxHeight: 140, overflow: 'auto', fontFamily: 'monospace', fontSize: 10
        }}>
          {logs.length === 0 && (
            <div style={{ color: '#4b5563', textAlign: 'center', padding: 12 }}>
              Enable interceptor and make API calls to see logs...
            </div>
          )}
          {logs.map((log, idx) => (
            <div key={idx} style={{
              padding: '1px 0',
              color: log.type === 'error' ? '#fca5a5' :
                     log.type === 'warning' ? '#fcd34d' :
                     log.type === 'success' ? '#6ee7b7' : '#9ca3af'
            }}>
              <span style={{ color: '#4b556388', marginRight: 4 }}>{log.timestamp}</span>
              {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default APIMockToggle;
