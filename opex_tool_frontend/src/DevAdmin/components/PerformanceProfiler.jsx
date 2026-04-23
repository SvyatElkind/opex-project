import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import CopyButton from './CopyButton';

/**
 * PerformanceProfiler — Performance monitoring dashboard
 *
 * Displays:
 * - React Query cache stats (queries, stale, fresh, fetching)
 * - Memory usage (if available)
 * - DOM node count
 * - Event listener count estimation
 * - localStorage usage
 * - Page load timing (Web Vitals)
 * - Render timing for profiled components
 */

const PerformanceProfiler = () => {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef(null);

  const collectStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    // Query stats
    const queryStats = {
      total: queries.length,
      fresh: queries.filter(q => q.state.dataUpdateCount > 0 && !q.isStale()).length,
      stale: queries.filter(q => q.isStale()).length,
      fetching: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      error: queries.filter(q => q.state.status === 'error').length,
      inactive: queries.filter(q => q.getObserversCount() === 0).length,
    };

    // Top queries by data size (approximate)
    const queryDetails = queries.map(q => ({
      key: JSON.stringify(q.queryKey),
      status: q.state.status,
      fetchStatus: q.state.fetchStatus,
      dataSize: q.state.data ? JSON.stringify(q.state.data).length : 0,
      observers: q.getObserversCount(),
      updatedAt: q.state.dataUpdatedAt,
      stale: q.isStale(),
    })).sort((a, b) => b.dataSize - a.dataSize);

    // DOM stats
    const domNodes = document.querySelectorAll('*').length;
    const eventListeners = performance.getEntriesByType?.('event')?.length || 0;

    // Memory (Chrome only)
    const memory = performance.memory ? {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(1),
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(1),
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(0),
    } : null;

    // localStorage usage
    let localStorageSize = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        localStorageSize += (localStorage.getItem(key)?.length || 0) * 2; // UTF-16
      }
    } catch {}
    const localStorageKB = (localStorageSize / 1024).toFixed(1);

    // Navigation timing
    let loadTime = null;
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      loadTime = Math.round(navEntries[0].loadEventEnd - navEntries[0].startTime);
    }

    // FCP, LCP from PerformanceObserver entries
    let fcp = null, lcp = null;
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
    if (fcpEntry) fcp = Math.round(fcpEntry.startTime);

    const newStats = {
      timestamp: Date.now(),
      queryStats,
      queryDetails,
      domNodes,
      eventListeners,
      memory,
      localStorageKB,
      localStorageEntries: localStorage.length,
      loadTime,
      fcp,
    };

    setStats(newStats);
    setHistory(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      domNodes,
      queries: queryStats.total,
      fetching: queryStats.fetching,
      memoryMB: memory ? parseFloat(memory.usedJSHeapSize) : null,
    }].slice(-30)); // Keep last 30 snapshots

  }, [queryClient]);

  useEffect(() => {
    collectStats();
    if (autoRefresh) {
      intervalRef.current = setInterval(collectStats, 2000);
      return () => clearInterval(intervalRef.current);
    }
  }, [autoRefresh, collectStats]);

  const forceGC = () => {
    queryClient.removeQueries({ predicate: (query) => query.getObserversCount() === 0 });
    collectStats();
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries();
    collectStats();
  };

  if (!stats) return null;

  // Warning thresholds
  const warnings = [];
  if (stats.domNodes > 5000) warnings.push({ icon: 'fa-code', text: `DOM nodes: ${stats.domNodes} (>5000 — possible memory leak)`, color: '#f59e0b' });
  if (stats.memory && parseFloat(stats.memory.usedJSHeapSize) > 200) warnings.push({ icon: 'fa-memory', text: `Memory: ${stats.memory.usedJSHeapSize}MB (>200MB — high usage)`, color: '#ef4444' });
  if (stats.queryStats.stale > 20) warnings.push({ icon: 'fa-database', text: `${stats.queryStats.stale} stale queries (>20 — consider invalidation)`, color: '#f59e0b' });
  if (stats.queryStats.error > 0) warnings.push({ icon: 'fa-times-circle', text: `${stats.queryStats.error} queries in error state`, color: '#ef4444' });
  if (parseFloat(stats.localStorageKB) > 500) warnings.push({ icon: 'fa-hdd', text: `localStorage: ${stats.localStorageKB}KB (>500KB — consider cleanup)`, color: '#f59e0b' });

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>Performance Profiler</h3>
      </div>

      {/* Controls */}
      <div className="test-controls">
        <div className="test-controls-row">
          <button
            className={`dev-btn ${autoRefresh ? 'primary' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <i className={`fas ${autoRefresh ? 'fa-pause' : 'fa-sync'}`}></i>
            <span>{autoRefresh ? 'Live' : 'Paused'}</span>
          </button>
          <button className="dev-btn" onClick={collectStats}>
            <i className="fas fa-redo"></i>
            <span>Refresh</span>
          </button>
          <button className="dev-btn" onClick={forceGC}>
            <i className="fas fa-broom"></i>
            <span>GC Inactive Queries</span>
          </button>
          <button className="dev-btn" onClick={invalidateAll}>
            <i className="fas fa-sync-alt"></i>
            <span>Invalidate All</span>
          </button>
          <CopyButton
            getText={() => {
              const s = stats;
              const lines = [
                `== Performance Report ==`,
                `Date: ${new Date().toISOString()}`,
                `Queries: ${s.queryStats.total} (fresh: ${s.queryStats.fresh}, stale: ${s.queryStats.stale}, fetching: ${s.queryStats.fetching}, error: ${s.queryStats.error})`,
                `DOM Nodes: ${s.domNodes}`,
                s.memory ? `Memory: ${s.memory.usedJSHeapSize}MB / ${s.memory.totalJSHeapSize}MB` : 'Memory: N/A (not Chrome)',
                `localStorage: ${s.localStorageKB}KB (${s.localStorageEntries} entries)`,
                s.loadTime ? `Page Load: ${s.loadTime}ms` : '',
                s.fcp ? `FCP: ${s.fcp}ms` : '',
                warnings.length > 0 ? `\nWarnings:\n${warnings.map(w => `- ${w.text}`).join('\n')}` : ''
              ].filter(Boolean);
              return lines.join('\n');
            }}
            label="Copy Stats"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="result-cards">
        <div className="result-card info">
          <i className="fas fa-database"></i>
          <div className="card-content">
            <h4>QUERIES</h4>
            <p className="count">{stats.queryStats.total}</p>
          </div>
        </div>
        <div className="result-card success">
          <i className="fas fa-check"></i>
          <div className="card-content">
            <h4>FRESH</h4>
            <p className="count">{stats.queryStats.fresh}</p>
          </div>
        </div>
        <div className={`result-card ${stats.queryStats.fetching > 0 ? 'error' : 'info'}`}>
          <i className="fas fa-spinner"></i>
          <div className="card-content">
            <h4>FETCHING</h4>
            <p className="count">{stats.queryStats.fetching}</p>
          </div>
        </div>
        <div className="result-card info">
          <i className="fas fa-code"></i>
          <div className="card-content">
            <h4>DOM NODES</h4>
            <p className="count">{stats.domNodes}</p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div style={{ margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {warnings.map((w, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 6, fontSize: 12,
              background: w.color === '#ef4444' ? '#7f1d1d33' : '#78350f33',
              color: w.color === '#ef4444' ? '#fca5a5' : '#fcd34d',
              border: `1px solid ${w.color}33`
            }}>
              <i className={`fas ${w.icon}`} style={{ width: 14 }}></i>
              <span>{w.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 8, margin: '12px 0', fontSize: 12
      }}>
        {stats.memory && (
          <div style={{ background: '#111827', padding: 10, borderRadius: 6 }}>
            <div style={{ color: '#60a5fa', fontWeight: 600, marginBottom: 6 }}>
              <i className="fas fa-memory" style={{ marginRight: 6 }}></i>Memory
            </div>
            <div style={{ color: '#d1d5db' }}>
              Used: <strong>{stats.memory.usedJSHeapSize} MB</strong> / {stats.memory.totalJSHeapSize} MB
            </div>
            <div style={{ marginTop: 4 }}>
              <div style={{
                height: 4, background: '#374151', borderRadius: 2, overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${(parseFloat(stats.memory.usedJSHeapSize) / parseFloat(stats.memory.totalJSHeapSize) * 100)}%`,
                  background: parseFloat(stats.memory.usedJSHeapSize) > parseFloat(stats.memory.totalJSHeapSize) * 0.8
                    ? '#ef4444' : '#10b981'
                }}></div>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: '#111827', padding: 10, borderRadius: 6 }}>
          <div style={{ color: '#34d399', fontWeight: 600, marginBottom: 6 }}>
            <i className="fas fa-hdd" style={{ marginRight: 6 }}></i>localStorage
          </div>
          <div style={{ color: '#d1d5db' }}>
            <strong>{stats.localStorageKB} KB</strong> across {stats.localStorageEntries} entries
          </div>
        </div>

        {stats.loadTime && (
          <div style={{ background: '#111827', padding: 10, borderRadius: 6 }}>
            <div style={{ color: '#fbbf24', fontWeight: 600, marginBottom: 6 }}>
              <i className="fas fa-tachometer-alt" style={{ marginRight: 6 }}></i>Page Load
            </div>
            <div style={{ color: '#d1d5db' }}>
              Load: <strong>{stats.loadTime}ms</strong>
              {stats.fcp && <> | FCP: <strong>{stats.fcp}ms</strong></>}
            </div>
          </div>
        )}

        <div style={{ background: '#111827', padding: 10, borderRadius: 6 }}>
          <div style={{ color: '#a78bfa', fontWeight: 600, marginBottom: 6 }}>
            <i className="fas fa-project-diagram" style={{ marginRight: 6 }}></i>Query Cache
          </div>
          <div style={{ color: '#d1d5db', fontSize: 11 }}>
            Stale: {stats.queryStats.stale} | Error: {stats.queryStats.error} | Inactive: {stats.queryStats.inactive}
          </div>
        </div>
      </div>

      {/* Query Details */}
      <div style={{ marginTop: 8 }}>
        <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
          Cached Queries (by data size)
        </div>
        <div style={{ maxHeight: 200, overflow: 'auto' }}>
          {stats.queryDetails.slice(0, 20).map((q, idx) => (
            <div key={idx} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '4px 8px', fontSize: 11, borderBottom: '1px solid #1f2937',
              fontFamily: 'monospace'
            }}>
              <span style={{
                color: '#d1d5db', maxWidth: '50%',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {q.key}
              </span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{
                  color: q.stale ? '#f59e0b' : '#10b981',
                  fontSize: 10
                }}>
                  {q.stale ? 'STALE' : 'FRESH'}
                </span>
                <span style={{ color: '#6b7280' }}>
                  {q.observers} obs
                </span>
                <span style={{ color: '#9ca3af' }}>
                  {q.dataSize > 1024 ? `${(q.dataSize / 1024).toFixed(1)}KB` : `${q.dataSize}B`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceProfiler;
