import React, { useState, useRef, useCallback, useEffect } from 'react';
import { validateProjectForOPEX } from '../../Utils/InheritanceUtils';

/**
 * OPEXProgressMonitor — WebSocket-based real-time OPEX export progress viewer.
 *
 * Connects to ws://localhost:8000/ws/opex_progress/ and displays:
 * - Export phases (started, finished, zipping, cleanup)
 * - Per-file copy status with counter
 * - Error detection
 * - Full message log with copy button
 *
 * Can also trigger OPEX export via the API endpoint.
 */

const STATUS_LABELS = {
  opex_export_started: { label: 'Eksports sakts', icon: 'fa-play', color: '#3b82f6' },
  copied: { label: 'Fails kopets', icon: 'fa-check', color: '#10b981' },
  copy_error: { label: 'Kopesanas kluda', icon: 'fa-times', color: '#ef4444' },
  opex_export_finished: { label: 'Eksports pabeigts', icon: 'fa-flag-checkered', color: '#10b981' },
  opex_zipping_started: { label: 'Arhivesana sakta', icon: 'fa-file-archive', color: '#f59e0b' },
  opex_zipping_finished: { label: 'Arhivesana pabeigta', icon: 'fa-check-circle', color: '#10b981' },
  opex_folder_deleted: { label: 'Mape dzesta', icon: 'fa-trash', color: '#6b7280' },
  deleting_opex_folder_failed: { label: 'Mapes dzesana neizdevas', icon: 'fa-exclamation-triangle', color: '#f59e0b' },
  opex_zipping_failed: { label: 'Arhivesana neizdevas', icon: 'fa-times-circle', color: '#ef4444' },
};

const OPEXProgressMonitor = ({ projectData }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ filesCopied: 0, fileErrors: 0, phase: 'idle' });
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validation, setValidation] = useState(null);
  const wsRef = useRef(null);
  const logEndRef = useRef(null);

  const projectId = projectData?.id;

  // Run validation when project data changes
  useEffect(() => {
    if (projectData) {
      const result = validateProjectForOPEX(projectData);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [projectData]);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const addMessage = useCallback((msg) => {
    const ts = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, { ...msg, _ts: ts }].slice(-500));
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current) return;
    setConnecting(true);

    // Always connect to Django backend (port 8000), not the React dev server (3000)
    const host = window.location.hostname || 'localhost';
    const url = `ws://${host}:8000/ws/opex_progress/`;

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnected(true);
        setConnecting(false);
        addMessage({ _type: 'system', text: `Savienots ar ${url}` });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addMessage({ _type: 'ws', ...data });

          // Update stats
          setStats(prev => {
            const next = { ...prev };
            if (data.status === 'copied') next.filesCopied++;
            if (data.status === 'copy_error') next.fileErrors++;
            if (data.status === 'opex_export_started') {
              next.phase = 'exporting';
              next.filesCopied = 0;
              next.fileErrors = 0;
            }
            if (data.status === 'opex_export_finished') next.phase = 'exported';
            if (data.status === 'opex_zipping_started') next.phase = 'zipping';
            if (data.status === 'opex_zipping_finished') {
              next.phase = 'done';
              setIsExporting(false);
            }
            if (data.status === 'opex_zipping_failed') {
              next.phase = 'error';
              setIsExporting(false);
            }
            return next;
          });
        } catch {
          addMessage({ _type: 'error', text: `Nevar parsēt: ${event.data}` });
        }
      };

      ws.onerror = () => {
        addMessage({ _type: 'error', text: 'WebSocket kluda' });
        setConnecting(false);
      };

      ws.onclose = (event) => {
        setConnected(false);
        setConnecting(false);
        wsRef.current = null;
        addMessage({ _type: 'system', text: `Atvienots (code: ${event.code})` });
      };

      wsRef.current = ws;
    } catch (err) {
      setConnecting(false);
      addMessage({ _type: 'error', text: `Nevar izveidot savienojumu: ${err.message}` });
    }
  }, [addMessage]);

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const triggerExport = async (longTerm = true) => {
    if (!projectId) {
      addMessage({ _type: 'error', text: 'Nav aktiva projekta' });
      return;
    }

    // Run validation before export
    const result = validateProjectForOPEX(projectData);
    setValidation(result);

    if (!result.valid) {
      addMessage({ _type: 'error', text: `OPEX validacija neizdevas: ${result.errors.length} kludas` });
      result.errors.forEach(err => {
        addMessage({ _type: 'error', text: `  - ${err.message}` });
      });
      addMessage({ _type: 'system', text: 'Izlabojiet kludas pirms OPEX eksporta' });
      return;
    }

    if (result.warnings.length > 0) {
      addMessage({ _type: 'system', text: `Bridinajumi: ${result.warnings.length}` });
      result.warnings.forEach(w => {
        addMessage({ _type: 'system', text: `  - ${w.message}` });
      });
    }

    // Connect WebSocket if not connected
    if (!wsRef.current) {
      connect();
      await new Promise(r => setTimeout(r, 500));
    }

    setIsExporting(true);
    setStats({ filesCopied: 0, fileErrors: 0, phase: 'starting' });
    addMessage({ _type: 'system', text: `Sakas OPEX eksports (long=${longTerm}) projektam ID: ${projectId}` });

    try {
      const resp = await fetch(`/api/v1/project/${projectId}/export/opex_package/?long=${longTerm}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (resp.ok) {
        const data = await resp.json();
        addMessage({ _type: 'system', text: `API atbilde: ${JSON.stringify(data)}` });
      } else {
        const text = await resp.text();
        addMessage({ _type: 'error', text: `API kluda ${resp.status}: ${text}` });
        setIsExporting(false);
      }
    } catch (err) {
      addMessage({ _type: 'error', text: `Fetch kluda: ${err.message}` });
      setIsExporting(false);
    }
  };

  const clearLog = () => {
    setMessages([]);
    setStats({ filesCopied: 0, fileErrors: 0, phase: 'idle' });
  };

  const copyLog = () => {
    const lines = messages.map(m => {
      if (m._type === 'system') return `[SYS] ${m._ts} ${m.text}`;
      if (m._type === 'error') return `[ERR] ${m._ts} ${m.text}`;
      const info = STATUS_LABELS[m.status] || { label: m.status };
      if (m.msg_level === 'file') return `[FILE] ${m._ts} ${info.label} (ID: ${m.file})`;
      return `[${m.msg_level?.toUpperCase() || 'MSG'}] ${m._ts} ${info.label}`;
    });
    lines.unshift(`=== OPEX Progress Log ===`);
    lines.unshift(`Project ID: ${projectId || 'N/A'}`);
    lines.unshift(`Time: ${new Date().toISOString()}`);
    lines.push(`Stats: ${stats.filesCopied} files copied, ${stats.fileErrors} errors, phase: ${stats.phase}`);
    lines.push(`=== End Log ===`);
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const phaseColors = {
    idle: '#6b7280',
    starting: '#f59e0b',
    exporting: '#3b82f6',
    exported: '#10b981',
    zipping: '#f59e0b',
    done: '#10b981',
    error: '#ef4444',
  };

  const phaseLabels = {
    idle: 'Gaida',
    starting: 'Sakas...',
    exporting: 'Eksporte...',
    exported: 'Eksportets',
    zipping: 'Arhive...',
    done: 'Pabeigts!',
    error: 'Kluda',
  };

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>
          <i className="fas fa-broadcast-tower" style={{ marginRight: 6 }}></i>
          OPEX Progress (WebSocket)
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: connected ? '#10b981' : connecting ? '#f59e0b' : '#ef4444',
            display: 'inline-block',
          }}></span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            {connected ? 'Savienots' : connecting ? 'Savieno...' : 'Atvienots'}
          </span>
        </div>
      </div>

      <div className="dev-panel-body">
        {/* Connection controls */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <button
            className="dev-btn"
            onClick={connected ? disconnect : connect}
            disabled={connecting}
            style={{ color: connected ? '#ef4444' : '#10b981' }}
          >
            <i className={`fas ${connected ? 'fa-plug' : 'fa-broadcast-tower'}`}></i>
            {connected ? ' Atvienot' : ' Savienot'}
          </button>

          <button
            className="dev-btn primary"
            onClick={() => triggerExport(true)}
            disabled={!projectId || isExporting || (validation && !validation.valid)}
            style={{ fontWeight: 600 }}
            title={validation && !validation.valid ? 'Izlabojiet validacijas kludas pirms eksporta' : ''}
          >
            <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-file-export'}`}></i>
            {isExporting ? ' Eksporte...' : ' Sakt OPEX eksportu'}
          </button>

          <button
            className="dev-btn"
            onClick={() => triggerExport(false)}
            disabled={!projectId || isExporting || (validation && !validation.valid)}
            title={validation && !validation.valid ? 'Izlabojiet validacijas kludas' : 'Islaicigi glabajamas lietas'}
          >
            <i className="fas fa-clock"></i>
            Islaicigi
          </button>
        </div>

        {/* Validation status */}
        {validation && (
          <div style={{
            padding: '8px 12px', marginBottom: 12, borderRadius: 6,
            background: validation.valid ? '#10b98115' : '#ef444415',
            border: `1px solid ${validation.valid ? '#10b98133' : '#ef444433'}`,
            fontSize: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: validation.valid ? 0 : 6 }}>
              <i className={`fas ${validation.valid ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}
                style={{ color: validation.valid ? '#10b981' : '#ef4444' }}></i>
              <strong style={{ color: validation.valid ? '#6ee7b7' : '#fca5a5' }}>
                {validation.valid
                  ? `Gatavs OPEX eksportam (${validation.summary.validInventories}/${validation.summary.totalInventories} US)`
                  : `Nav gatavs OPEX eksportam (${validation.summary.totalErrors} kludas)`}
              </strong>
              <button
                className="dev-btn"
                onClick={() => { const r = validateProjectForOPEX(projectData); setValidation(r); }}
                style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px' }}
                title="Parvalidet"
              >
                <i className="fas fa-sync"></i>
              </button>
            </div>
            {!validation.valid && (
              <div style={{ marginLeft: 22, color: '#fca5a5' }}>
                {validation.errors.slice(0, 5).map((err, i) => (
                  <div key={i} style={{ fontSize: 11, marginBottom: 2 }}>
                    <i className="fas fa-times" style={{ marginRight: 4, fontSize: 9 }}></i>
                    {err.message}
                  </div>
                ))}
                {validation.errors.length > 5 && (
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>...un vel {validation.errors.length - 5} kludas</div>
                )}
              </div>
            )}
            {validation.valid && validation.warnings.length > 0 && (
              <div style={{ marginLeft: 22, color: '#fcd34d', marginTop: 4 }}>
                {validation.warnings.slice(0, 3).map((w, i) => (
                  <div key={i} style={{ fontSize: 11, marginBottom: 2 }}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: 4, fontSize: 9 }}></i>
                    {w.message}
                  </div>
                ))}
                {validation.warnings.length > 3 && (
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>...un vel {validation.warnings.length - 3} bridinajumi</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: 16, padding: '8px 12px', marginBottom: 12,
          background: '#111827', borderRadius: 6, fontSize: 12,
        }}>
          <div style={{ color: phaseColors[stats.phase] }}>
            <strong>{phaseLabels[stats.phase]}</strong>
          </div>
          <div style={{ color: '#10b981' }}>
            <i className="fas fa-check" style={{ marginRight: 4 }}></i>
            {stats.filesCopied} faili
          </div>
          {stats.fileErrors > 0 && (
            <div style={{ color: '#ef4444' }}>
              <i className="fas fa-times" style={{ marginRight: 4 }}></i>
              {stats.fileErrors} kludas
            </div>
          )}
          {!projectId && (
            <div style={{ color: '#f59e0b', marginLeft: 'auto' }}>
              Nav aktiva projekta
            </div>
          )}
        </div>

        {/* Message log */}
        <div style={{
          background: '#0d1117', borderRadius: 6, padding: 6,
          maxHeight: 350, overflow: 'auto', fontFamily: 'monospace', fontSize: 11,
        }}>
          {messages.length === 0 ? (
            <div style={{ color: '#4b5563', textAlign: 'center', padding: 20 }}>
              <i className="fas fa-satellite-dish" style={{ fontSize: 24, marginBottom: 8, display: 'block', opacity: 0.3 }}></i>
              Savienojiet WebSocket un sakat OPEX eksportu
            </div>
          ) : (
            messages.map((msg, i) => {
              const info = STATUS_LABELS[msg.status] || {};
              const color = msg._type === 'error' ? '#fca5a5' :
                           msg._type === 'system' ? '#9ca3af' :
                           info.color || '#e5e7eb';
              return (
                <div key={i} style={{ padding: '2px 4px', color, display: 'flex', gap: 6 }}>
                  <span style={{ color: '#4b556366', flexShrink: 0 }}>{msg._ts}</span>
                  {msg._type === 'ws' && (
                    <>
                      <i className={`fas ${info.icon || 'fa-circle'}`} style={{ width: 14, textAlign: 'center', marginTop: 2, fontSize: 10 }}></i>
                      <span>
                        {info.label || msg.status}
                        {msg.msg_level === 'file' && <span style={{ color: '#6b7280' }}> (ID: {msg.file})</span>}
                      </span>
                    </>
                  )}
                  {msg._type !== 'ws' && (
                    <>
                      <i className={`fas ${msg._type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}
                         style={{ width: 14, textAlign: 'center', marginTop: 2, fontSize: 10 }}></i>
                      <span>{msg.text}</span>
                    </>
                  )}
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>

        {/* Log controls */}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button className="dev-btn" onClick={clearLog} style={{ fontSize: 11, padding: '3px 8px' }}>
            <i className="fas fa-trash-alt"></i> Notirit
          </button>
          <button
            className="dev-btn"
            onClick={copyLog}
            style={{ fontSize: 11, padding: '3px 8px', color: copied ? '#10b981' : undefined }}
          >
            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            {copied ? ' Nokopets' : ' Kopet logu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OPEXProgressMonitor;
