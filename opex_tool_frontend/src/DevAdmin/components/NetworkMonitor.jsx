import React, { useState, useEffect, useRef, useCallback } from 'react';
import CopyButton, { formatNetworkRequest, formatAsCurl } from './CopyButton';

/**
 * NetworkMonitor — Live API request/response logger
 *
 * Intercepts all fetch() calls and displays:
 * - Method, URL, status code
 * - Request/response headers
 * - Request body (JSON or FormData fields)
 * - Response body (truncated)
 * - Timing (duration in ms)
 * - Error details for failed requests
 */

const MAX_ENTRIES = 200;

const NetworkMonitor = () => {
  const [requests, setRequests] = useState([]);
  const [isRecording, setIsRecording] = useState(true);
  const [filter, setFilter] = useState('all'); // all | error | slow | media
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const listRef = useRef(null);
  const interceptorRef = useRef(null);
  const isRecordingRef = useRef(true);

  // Keep ref in sync with state so interceptor closure can read it
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  // Install fetch interceptor
  useEffect(() => {
    if (interceptorRef.current) return; // Already installed

    const originalFetch = window.fetch;
    let reqId = 0;

    window.__devNetworkLog = window.__devNetworkLog || [];

    const interceptedFetch = async (...args) => {
      // If not recording, pass through without logging
      if (!isRecordingRef.current) {
        return originalFetch(...args);
      }

      const id = ++reqId;
      const startTime = performance.now();
      const [input, init = {}] = args;

      const url = typeof input === 'string' ? input : input?.url || String(input);
      const method = init.method || 'GET';

      // Parse request body
      let requestBody = null;
      if (init.body) {
        if (typeof init.body === 'string') {
          try { requestBody = JSON.parse(init.body); } catch { requestBody = init.body; }
        } else if (init.body instanceof FormData) {
          requestBody = {};
          for (const [key, value] of init.body.entries()) {
            requestBody[key] = value instanceof File
              ? `[File: ${value.name} (${(value.size / 1024).toFixed(1)}KB)]`
              : value;
          }
        }
      }

      const entry = {
        id,
        method,
        url,
        requestBody,
        requestHeaders: init.headers || {},
        status: null,
        statusText: '',
        responseBody: null,
        responseHeaders: {},
        duration: 0,
        timestamp: new Date().toISOString(),
        error: null,
        isFormData: init.body instanceof FormData,
      };

      // Add to log immediately (pending state)
      const addEntry = (e) => {
        window.__devNetworkLog = [...(window.__devNetworkLog || []), e].slice(-MAX_ENTRIES);
        setRequests(prev => [...prev, e].slice(-MAX_ENTRIES));
      };

      const updateEntry = (updates) => {
        const updated = { ...entry, ...updates };
        window.__devNetworkLog = (window.__devNetworkLog || []).map(e => e.id === id ? updated : e);
        setRequests(prev => prev.map(e => e.id === id ? updated : e));
      };

      addEntry(entry);

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        // Clone response to read body without consuming it
        const clone = response.clone();
        let responseBody = null;
        try {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            responseBody = await clone.json();
          } else if (ct.includes('text/')) {
            const text = await clone.text();
            responseBody = text.length > 2000 ? text.slice(0, 2000) + '...' : text;
          } else {
            responseBody = `[${ct || 'binary'} — ${response.headers.get('content-length') || '?'} bytes]`;
          }
        } catch {
          responseBody = '[Could not parse response]';
        }

        // Extract response headers
        const respHeaders = {};
        response.headers.forEach((value, key) => { respHeaders[key] = value; });

        updateEntry({
          status: response.status,
          statusText: response.statusText,
          responseBody,
          responseHeaders: respHeaders,
          duration: Math.round(duration),
        });

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        updateEntry({
          status: 0,
          statusText: 'Network Error',
          error: error.message,
          duration: Math.round(duration),
        });
        throw error;
      }
    };

    window.fetch = interceptedFetch;
    interceptorRef.current = originalFetch;

    return () => {
      window.fetch = originalFetch;
      interceptorRef.current = null;
    };
  }, []);

  const clearLog = useCallback(() => {
    setRequests([]);
    window.__devNetworkLog = [];
  }, []);

  const filteredRequests = requests.filter(req => {
    // Only show API requests (skip static assets, webpack, etc.)
    if (!req.url.includes('/api/')) return false;

    if (searchTerm && !req.url.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    switch (filter) {
      case 'error': return req.status === 0 || req.status >= 400;
      case 'slow': return req.duration > 1000;
      case 'media': return req.url.includes('media_record') || req.url.includes('file') || req.isFormData;
      default: return true;
    }
  });

  const getStatusColor = (status) => {
    if (!status) return '#6b7280';
    if (status >= 500) return '#ef4444';
    if (status >= 400) return '#f59e0b';
    if (status >= 300) return '#3b82f6';
    if (status >= 200) return '#10b981';
    return '#ef4444'; // 0 = network error
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return '#3b82f6';
      case 'POST': return '#10b981';
      case 'PUT': return '#f59e0b';
      case 'DELETE': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatUrl = (url) => {
    try {
      const u = new URL(url, window.location.origin);
      return u.pathname + u.search;
    } catch {
      return url;
    }
  };

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>Network Monitor</h3>
        <div className="dev-panel-actions">
          <span style={{ color: '#9ca3af', fontSize: 13, marginRight: 8 }}>
            {filteredRequests.length} requests
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="test-controls">
        <div className="test-controls-row">
          <button
            className={`dev-btn ${isRecording ? 'primary' : ''}`}
            onClick={() => setIsRecording(!isRecording)}
          >
            <i className={`fas ${isRecording ? 'fa-pause' : 'fa-circle'}`}></i>
            <span>{isRecording ? 'Pause' : 'Record'}</span>
          </button>
          <button className="dev-btn" onClick={clearLog}>
            <i className="fas fa-trash"></i>
            <span>Clear</span>
          </button>
          <CopyButton
            getText={() => {
              const errors = requests.filter(r => r.url.includes('/api/') && (r.status === 0 || r.status >= 400));
              if (errors.length === 0) return 'No errors captured.';
              return errors.map(r => formatNetworkRequest(r)).join('\n\n' + '='.repeat(50) + '\n\n');
            }}
            label="Copy Errors"
          />

          <input
            type="text"
            className="test-suite-select"
            placeholder="Filter by URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: 120 }}
          />
        </div>

        <div className="test-filter-bar">
          {[
            { key: 'all', label: 'All' },
            { key: 'error', label: 'Errors' },
            { key: 'slow', label: 'Slow (>1s)' },
            { key: 'media', label: 'Media/Files' },
          ].map(f => (
            <button
              key={f.key}
              className={`test-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Request List */}
      <div ref={listRef} style={{ maxHeight: 400, overflow: 'auto' }}>
        {filteredRequests.length === 0 && (
          <div className="dev-empty-state">
            <i className="fas fa-satellite-dish"></i>
            <p>No API requests captured yet</p>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              Interact with the app to see requests here
            </p>
          </div>
        )}

        {filteredRequests.map(req => (
          <div
            key={req.id}
            className="test-suite-card"
            style={{ cursor: 'pointer', marginBottom: 2 }}
            onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
          >
            <div className="test-suite-header" style={{ padding: '6px 10px' }}>
              <div className="test-suite-header-left" style={{ gap: 8 }}>
                <span style={{
                  color: getMethodColor(req.method),
                  fontWeight: 700,
                  fontSize: 11,
                  width: 45,
                  display: 'inline-block'
                }}>
                  {req.method}
                </span>
                <span style={{
                  color: getStatusColor(req.status),
                  fontWeight: 600,
                  fontSize: 12,
                  width: 30,
                  display: 'inline-block'
                }}>
                  {req.status || '...'}
                </span>
                <span style={{ fontSize: 12, color: '#d1d5db', fontFamily: 'monospace' }}>
                  {formatUrl(req.url)}
                </span>
                {req.isFormData && (
                  <span style={{
                    fontSize: 10, background: '#7c3aed33', color: '#a78bfa',
                    padding: '1px 6px', borderRadius: 3
                  }}>FormData</span>
                )}
              </div>
              <div className="test-suite-header-right" style={{ gap: 6 }}>
                <CopyButton
                  getText={() => formatNetworkRequest(req)}
                  label={false}
                />
                <span className="test-suite-duration">
                  {req.duration ? `${req.duration}ms` : '...'}
                </span>
              </div>
            </div>

            {expandedId === req.id && (
              <div className="test-suite-body" style={{ padding: '8px 12px', fontSize: 12 }}>
                {/* Timing + cURL */}
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#9ca3af' }}>
                    {new Date(req.timestamp).toLocaleTimeString()} — {req.duration}ms
                  </span>
                  <CopyButton
                    getText={() => formatAsCurl(req)}
                    label="cURL"
                    style={{ fontSize: 10 }}
                  />
                </div>

                {/* Request Body */}
                {req.requestBody && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ color: '#60a5fa', fontWeight: 600, marginBottom: 4 }}>
                      Request Body:
                    </div>
                    <pre style={{
                      background: '#111', padding: 8, borderRadius: 4,
                      overflow: 'auto', maxHeight: 150, fontSize: 11,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-all'
                    }}>
                      {typeof req.requestBody === 'string'
                        ? req.requestBody
                        : JSON.stringify(req.requestBody, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Response Body */}
                {req.responseBody && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ color: '#34d399', fontWeight: 600, marginBottom: 4 }}>
                      Response Body:
                    </div>
                    <pre style={{
                      background: '#111', padding: 8, borderRadius: 4,
                      overflow: 'auto', maxHeight: 200, fontSize: 11,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-all'
                    }}>
                      {typeof req.responseBody === 'string'
                        ? req.responseBody
                        : JSON.stringify(req.responseBody, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Response Headers */}
                {Object.keys(req.responseHeaders).length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ color: '#fbbf24', fontWeight: 600, marginBottom: 4 }}>
                      Response Headers:
                    </div>
                    <pre style={{
                      background: '#111', padding: 8, borderRadius: 4,
                      fontSize: 11, maxHeight: 100, overflow: 'auto'
                    }}>
                      {Object.entries(req.responseHeaders).map(([k, v]) => `${k}: ${v}`).join('\n')}
                    </pre>
                  </div>
                )}

                {/* Error */}
                {req.error && (
                  <div style={{
                    background: '#7f1d1d33', padding: 8, borderRadius: 4,
                    color: '#fca5a5', fontSize: 12
                  }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: 6 }}></i>
                    {req.error}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkMonitor;
