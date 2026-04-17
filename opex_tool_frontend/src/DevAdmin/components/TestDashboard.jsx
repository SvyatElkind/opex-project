import React, { useState, useCallback, useRef } from 'react';
import { createTestRunner } from '../testing/index';
import CopyButton, { formatTestReport, formatSingleTest } from './CopyButton';

/**
 * TestDashboard — DevAdmin tab for running comprehensive test suites
 *
 * Features:
 * - Run all suites or individual suites
 * - Real-time progress tracking
 * - Pass/fail/skip counts with color coding
 * - Expandable suite results with failure details
 * - Abort button for long-running tests
 * - Duration tracking per test and per suite
 */
const TestDashboard = () => {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ suite: '', test: '', status: '' });
  const [expandedSuites, setExpandedSuites] = useState({});
  const [filter, setFilter] = useState('all'); // 'all' | 'failed' | 'passed'
  const [selectedSuite, setSelectedSuite] = useState('all');
  const runnerRef = useRef(null);

  const suiteNames = useRef([]);
  if (suiteNames.current.length === 0) {
    try {
      const r = createTestRunner();
      suiteNames.current = r.getSuiteNames();
    } catch(e) {
      suiteNames.current = [];
    }
  }

  const handleProgress = useCallback((suite, test, status) => {
    setProgress({ suite, test, status });
  }, []);

  const runTests = useCallback(async (suiteName) => {
    setIsRunning(true);
    setResults(null);
    setProgress({ suite: '', test: '', status: 'starting' });

    try {
      const runner = createTestRunner();
      runnerRef.current = runner;

      let result;
      if (suiteName && suiteName !== 'all') {
        result = await runner.runSuite(suiteName, handleProgress);
      } else {
        result = await runner.runAll(handleProgress);
      }

      setResults(result);

      // Auto-expand failed suites
      const expanded = {};
      result.suites.forEach(s => {
        if (s.failed > 0) expanded[s.name] = true;
      });
      setExpandedSuites(expanded);
    } catch (e) {
      setResults({
        suites: [],
        totals: { suites: 0, tests: 0, passed: 0, failed: 1, skipped: 0, duration: 0 },
        error: e.message
      });
    } finally {
      setIsRunning(false);
      runnerRef.current = null;
    }
  }, [handleProgress]);

  const handleAbort = useCallback(() => {
    if (runnerRef.current) {
      runnerRef.current.abort();
    }
  }, []);

  const toggleSuite = useCallback((name) => {
    setExpandedSuites(prev => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const formatDuration = (ms) => {
    if (ms < 1) return '<1ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'passed': return '\u2713';
      case 'failed': return '\u2717';
      case 'skipped': return '\u25CB';
      default: return '\u25CF';
    }
  };

  const filteredTests = (tests) => {
    if (filter === 'all') return tests;
    return tests.filter(t => t.status === filter);
  };

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>Test Dashboard</h3>
        <div className="dev-panel-actions">
          <span style={{ color: '#9ca3af', fontSize: 13, marginRight: 8 }}>
            {suiteNames.current.length} suites registered
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="test-controls">
        <div className="test-controls-row">
          <select
            className="test-suite-select"
            value={selectedSuite}
            onChange={(e) => setSelectedSuite(e.target.value)}
            disabled={isRunning}
          >
            <option value="all">All Suites</option>
            {suiteNames.current.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <button
            className="dev-btn primary"
            onClick={() => runTests(selectedSuite)}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Running...</span>
              </>
            ) : (
              <>
                <i className="fas fa-play"></i>
                <span>Run Tests</span>
              </>
            )}
          </button>

          {isRunning && (
            <button className="dev-btn" onClick={handleAbort} style={{ borderColor: '#dc2626' }}>
              <i className="fas fa-stop"></i>
              <span>Abort</span>
            </button>
          )}
        </div>

        {/* Progress indicator */}
        {isRunning && progress.test && (
          <div className="test-progress-bar">
            <div className="test-progress-text">
              <span className="test-progress-suite">{progress.suite}</span>
              <span className="test-progress-separator">&rsaquo;</span>
              <span className="test-progress-test" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{progress.test}</span>
              <span className={`test-progress-status ${progress.status}`}>
                {progress.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="test-results">
          {/* Summary Cards */}
          <div className="result-cards">
            <div className={`result-card ${results.totals.failed === 0 ? 'success' : 'error'}`}>
              <i className={`fas ${results.totals.failed === 0 ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
              <div className="card-content">
                <h4>STATUS</h4>
                <p>{results.totals.failed === 0 ? 'ALL PASSED' : 'FAILURES'}</p>
              </div>
            </div>
            <div className="result-card success">
              <i className="fas fa-check"></i>
              <div className="card-content">
                <h4>PASSED</h4>
                <p className="count">{results.totals.passed}</p>
              </div>
            </div>
            <div className={`result-card ${results.totals.failed > 0 ? 'error' : 'info'}`}>
              <i className="fas fa-times"></i>
              <div className="card-content">
                <h4>FAILED</h4>
                <p className="count">{results.totals.failed}</p>
              </div>
            </div>
            <div className="result-card info">
              <i className="fas fa-clock"></i>
              <div className="card-content">
                <h4>DURATION</h4>
                <p>{formatDuration(results.totals.duration)}</p>
              </div>
            </div>
          </div>

          {results.error && (
            <div className="test-error-banner">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{results.error}</span>
            </div>
          )}

          {/* Filter bar */}
          <div className="test-filter-bar">
            <button
              className={`test-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({results.totals.tests})
            </button>
            <button
              className={`test-filter-btn passed ${filter === 'passed' ? 'active' : ''}`}
              onClick={() => setFilter('passed')}
            >
              Passed ({results.totals.passed})
            </button>
            <button
              className={`test-filter-btn failed ${filter === 'failed' ? 'active' : ''}`}
              onClick={() => setFilter('failed')}
            >
              Failed ({results.totals.failed})
            </button>
            {results.totals.failed > 0 && (
              <CopyButton
                getText={() => formatTestReport(results)}
                label="Copy All Failures"
                style={{ marginLeft: 'auto' }}
              />
            )}
          </div>

          {/* Suite Results */}
          <div className="test-suite-list">
            {results.suites.map((suite) => {
              const filtered = filteredTests(suite.tests);
              if (filtered.length === 0 && filter !== 'all') return null;

              return (
                <div key={suite.name} className="test-suite-card">
                  <div
                    className="test-suite-header"
                    onClick={() => toggleSuite(suite.name)}
                  >
                    <div className="test-suite-header-left">
                      <i className={`fas fa-chevron-${expandedSuites[suite.name] ? 'down' : 'right'}`}
                         style={{ width: 16, color: '#6b7280' }}></i>
                      <span className={`test-suite-status-dot ${suite.failed > 0 ? 'failed' : 'passed'}`}></span>
                      <span className="test-suite-name">{suite.name}</span>
                    </div>
                    <div className="test-suite-header-right">
                      <span className="test-count-badge passed">{suite.passed} passed</span>
                      {suite.failed > 0 && (
                        <span className="test-count-badge failed">{suite.failed} failed</span>
                      )}
                      {suite.skipped > 0 && (
                        <span className="test-count-badge skipped">{suite.skipped} skipped</span>
                      )}
                      <span className="test-suite-duration">{formatDuration(suite.duration)}</span>
                    </div>
                  </div>

                  {expandedSuites[suite.name] && (
                    <div className="test-suite-body">
                      {filtered.map((t, idx) => (
                        <div key={idx} className={`test-result-row ${t.status}`}>
                          <span className={`test-result-icon ${t.status}`}>
                            {getStatusIcon(t.status)}
                          </span>
                          <span className="test-result-name">{t.name}</span>
                          <span className="test-result-duration">{formatDuration(t.duration)}</span>
                          {t.error && (
                            <div className="test-result-error">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="test-error-message">{t.error}</div>
                                <CopyButton
                                  getText={() => formatSingleTest(suite.name, t)}
                                  label={false}
                                  style={{ flexShrink: 0 }}
                                />
                              </div>
                              {t.expected && (
                                <div className="test-error-diff">
                                  <span className="expected">Expected: {t.expected}</span>
                                  <span className="actual">Actual: {t.actual}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!results && !isRunning && (
        <div className="dev-empty-state">
          <i className="fas fa-flask"></i>
          <p>Click "Run Tests" to execute all test suites</p>
          <p style={{ fontSize: 13, marginTop: 8, color: '#6b7280' }}>
            Tests API endpoints, validation logic, state management, and full CRUD workflows
          </p>
        </div>
      )}
    </div>
  );
};

export default TestDashboard;
