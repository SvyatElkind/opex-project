import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import useOpexProgress from '../hooks/useOpexProgress';
import { validateProjectForOPEX } from '../Utils/InheritanceUtils';
import './OpexProgressModal.css';

/**
 * OpexProgressModal — Full-screen blocking overlay for OPEX export progress.
 *
 * Matches the standard popup pattern (gradient header, card body, footer buttons).
 * Shows real-time file-by-file progress via WebSocket, with stats cards,
 * per-inventory progress bars, and completion summary.
 *
 * Blocks all user interaction until export completes or fails.
 */

const OpexProgressModal = ({ projectData, includeLongTerm = true, onClose }) => {
  const {
    phase, totalFiles, processedFiles, progressPercent,
    currentFile, failedFiles, recentFiles, inventoryProgress,
    elapsedMs, estimatedRemainingMs, startExport, close,
  } = useOpexProgress();

  const [showErrors, setShowErrors] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Timer tick for live elapsed time
  const [, setTick] = useState(0);
  useEffect(() => {
    if (phase === 'exporting' || phase === 'zipping' || phase === 'exported') {
      const timer = setInterval(() => setTick(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // Validate and start on mount
  useEffect(() => {
    if (!projectData) return;
    const result = validateProjectForOPEX(projectData);
    setValidationResult(result);
    if (result.valid) {
      startExport(projectData, includeLongTerm);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Block Escape during active phases
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (canClose) handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }); // intentionally no deps — always uses latest canClose

  const handleClose = () => { close(); onClose?.(); };

  const canClose = phase === 'done' || phase === 'error' || phase === 'idle'
    || (validationResult && !validationResult.valid);

  const formatTime = (ms) => {
    if (!ms) return '0s';
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    return `${mins}m ${secs % 60}s`;
  };

  const etaMs = phase === 'exporting' ? estimatedRemainingMs : null;

  // ─── Header title per phase ─────────────────────────────────────────────

  const headerTitle = () => {
    if (validationResult && !validationResult.valid) return 'OPEX eksports nav iespējams';
    switch (phase) {
      case 'connecting': return 'Savienojas ar serveri...';
      case 'exporting': return 'OPEX pakotnes ģenerēšana';
      case 'exported': return 'Failu kopēšana pabeigta';
      case 'zipping': return 'Arhivē pakotni...';
      case 'done': return 'OPEX pakotne ģenerēta!';
      case 'error': return 'Ģenerēšana neizdevās';
      default: return 'Sagatavo eksportu...';
    }
  };

  const headerSubtitle = () => {
    if (validationResult && !validationResult.valid) return 'Izlabojiet kļūdas pirms eksporta';
    switch (phase) {
      case 'exporting': return `Kopē failus — ${processedFiles} no ${totalFiles}`;
      case 'exported': return 'Gaida arhivēšanu...';
      case 'zipping': return 'Izveido ZIP arhīvu...';
      case 'done': return `${processedFiles} faili apstrādāti${failedFiles.length > 0 ? `, ${failedFiles.length} ar kļūdām` : ''}`;
      case 'error': return 'Radās kļūda eksporta laikā';
      default: return 'Lūdzu, uzgaidiet...';
    }
  };

  // ─── Validation failed ─────────────────────────────────────────────────

  if (validationResult && !validationResult.valid) {
    return ReactDOM.createPortal(
      <div className="opex-progress-overlay">
        <div className="opex-progress-modal">
          <div className="opex-progress-header">
            <div className="opex-progress-header-text">
              <h2 className="opex-progress-title">{headerTitle()}</h2>
              <p className="opex-progress-subtitle">{headerSubtitle()}</p>
            </div>
          </div>
          <div className="opex-progress-body">
            {validationResult.errors.map((err, i) => (
              <div key={i} className="opex-error-item">
                <span className="error-file">{err.message}</span>
              </div>
            ))}
            {validationResult.warnings.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-3)' }}>
                {validationResult.warnings.slice(0, 5).map((w, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--color-warning, #f59e0b)', padding: '2px 12px' }}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: 6 }}></i>{w.message}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="opex-progress-footer">
            <button className="opex-progress-close-btn" onClick={handleClose}>
              <i className="fas fa-times"></i> Aizvērt
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ─── Main progress view ────────────────────────────────────────────────

  const barClass = phase === 'done' ? 'done' : phase === 'error' ? 'error' : 'exporting';
  const barWidth = phase === 'zipping' || phase === 'done' ? 100 : progressPercent;

  return ReactDOM.createPortal(
    <div className="opex-progress-overlay">
      <div className="opex-progress-modal">
        {/* ─── Header ─── */}
        <div className="opex-progress-header">
          <div className="opex-progress-header-text">
            <h2 className="opex-progress-title">{headerTitle()}</h2>
            <p className="opex-progress-subtitle">{headerSubtitle()}</p>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div className="opex-progress-body">

          {/* Stats cards — always visible during active phases */}
          {phase !== 'idle' && phase !== 'connecting' && (
            <div className="opex-stats-row">
              <div className="opex-stat-card time">
                <div className="opex-stat-value">{formatTime(elapsedMs)}</div>
                <div className="opex-stat-label">Laiks</div>
              </div>
              <div className="opex-stat-card success">
                <div className="opex-stat-value">{processedFiles}</div>
                <div className="opex-stat-label">Faili</div>
              </div>
              {failedFiles.length > 0 && (
                <div className="opex-stat-card error">
                  <div className="opex-stat-value">{failedFiles.length}</div>
                  <div className="opex-stat-label">Kļūdas</div>
                </div>
              )}
              {etaMs !== null && (
                <div className="opex-stat-card">
                  <div className="opex-stat-value">~{formatTime(etaMs)}</div>
                  <div className="opex-stat-label">Atlicis</div>
                </div>
              )}
            </div>
          )}

          {/* Progress bar */}
          {phase !== 'idle' && phase !== 'connecting' && (
            <div className="opex-progress-bar-container">
              <div className="opex-progress-bar-track">
                <div className={`opex-progress-bar-fill ${barClass}`} style={{ width: `${barWidth}%` }} />
              </div>
              <div className="opex-progress-bar-label">
                <span>{processedFiles} no {totalFiles} failiem</span>
                <span className="opex-progress-bar-percent">{barWidth}%</span>
              </div>
            </div>
          )}

          {/* Current file breadcrumb */}
          {currentFile && phase === 'exporting' && (
            <div className="opex-current-file">
              <div className="opex-current-file-label">Pašlaik apstrādā</div>
              <div className="opex-current-file-path">
                <span>US {currentFile.inventoryNumber}</span>
                <span className="separator"><i className="fas fa-chevron-right"></i></span>
                <span>GV {currentFile.itemNumber}</span>
                <span className="separator"><i className="fas fa-chevron-right"></i></span>
                <span>{currentFile.recordTitle}</span>
                <span className="separator"><i className="fas fa-chevron-right"></i></span>
                <span className="filename">{currentFile.fileName}</span>
              </div>
            </div>
          )}

          {/* Per-inventory progress */}
          {phase === 'exporting' && Object.keys(inventoryProgress).length > 0 && (
            <div className="opex-inventory-section">
              <div className="opex-section-label">Uzskaites saraksti</div>
              {Object.entries(inventoryProgress).map(([num, inv]) => {
                const pct = inv.total > 0 ? Math.round((inv.done / inv.total) * 100) : 0;
                const isDone = inv.done >= inv.total;
                return (
                  <div key={num} className={`opex-inventory-row ${isDone ? 'done' : ''}`}>
                    <i className={`fas ${isDone ? 'fa-check-circle' : 'fa-spinner fa-spin'}`}
                       style={{ width: 14, textAlign: 'center', fontSize: 10 }}></i>
                    <span style={{ minWidth: 50 }}>US {num}</span>
                    <span style={{ color: 'var(--text-light)', fontSize: 11, minWidth: 65 }}>{inv.type}</span>
                    <div className="inv-bar">
                      <div className={`inv-bar-fill ${isDone ? 'complete' : 'active'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span style={{ fontSize: 11, minWidth: 36, textAlign: 'right' }}>{inv.done}/{inv.total}</span>
                    {inv.errors > 0 && (
                      <span style={{ color: 'var(--color-error)', fontSize: 11 }}>
                        <i className="fas fa-exclamation-circle"></i> {inv.errors}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent files */}
          {phase === 'exporting' && recentFiles.length > 0 && (
            <div className="opex-recent-files">
              <div className="opex-section-label">Pēdējie apstrādātie</div>
              {recentFiles.map((f, i) => (
                <div key={i} className="opex-recent-file"
                  style={{ color: i === 0 ? 'var(--text-primary)' : 'var(--text-light)', opacity: 1 - (i * 0.15) }}>
                  <i className="fas fa-check" style={{ color: 'var(--color-success, #10b981)', fontSize: 9, width: 12 }}></i>
                  <span style={{ color: 'var(--text-muted)' }}>US {f.inventoryNumber}</span>
                  <span style={{ color: 'var(--text-muted)' }}>GV {f.itemNumber}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.fileName}</span>
                </div>
              ))}
            </div>
          )}

          {/* Zipping phase */}
          {(phase === 'exported' || phase === 'zipping') && (
            <div className="opex-current-file">
              <div className="opex-current-file-label">
                {phase === 'zipping' ? 'Arhivēšana' : 'Gaida'}
              </div>
              <div className="opex-current-file-path">
                <i className="fas fa-file-archive" style={{ color: 'var(--color-warning, #f59e0b)' }}></i>
                <span>{phase === 'zipping' ? 'Izveido ZIP arhīvu...' : 'Failu kopēšana pabeigta. Notiek arhivēšana...'}</span>
              </div>
            </div>
          )}

          {/* Done summary */}
          {phase === 'done' && (
            <div className="opex-summary">
              <div className="opex-summary-icon success"><i className="fas fa-check-circle"></i></div>
              <div className="opex-summary-stat">
                {failedFiles.length === 0 ? 'Visi faili veiksmīgi apstrādāti' : `${processedFiles - failedFiles.length} faili veiksmīgi`}
              </div>
              <div className="opex-summary-detail">
                {formatTime(elapsedMs)} · {Object.keys(inventoryProgress).length} uzskaites saraksti · {processedFiles} faili
              </div>
            </div>
          )}

          {/* Error summary */}
          {phase === 'error' && (
            <div className="opex-summary">
              <div className="opex-summary-icon error"><i className="fas fa-times-circle"></i></div>
              <div className="opex-summary-stat" style={{ color: 'var(--color-error)' }}>Eksports neizdevās</div>
              <div className="opex-summary-detail">
                {processedFiles} no {totalFiles} failiem apstrādāti pirms kļūdas · {formatTime(elapsedMs)}
              </div>
            </div>
          )}

          {/* Failed files list */}
          {failedFiles.length > 0 && (
            <div className="opex-error-section">
              <button className="opex-error-toggle" onClick={() => setShowErrors(!showErrors)}>
                <i className={`fas fa-chevron-${showErrors ? 'down' : 'right'}`}></i>
                <span>{failedFiles.length} faili ar kļūdām</span>
              </button>
              {showErrors && (
                <div className="opex-error-list">
                  {failedFiles.map((f, i) => (
                    <div key={i} className="opex-error-item">
                      <span className="error-file">{f.fileName}</span>
                      {' — '}US {f.inventoryNumber} → GV {f.itemNumber} → {f.recordTitle}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        {canClose && (
          <div className="opex-progress-footer">
            <button className="opex-progress-close-btn" onClick={handleClose}>
              <i className="fas fa-check"></i> Aizvērt
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default OpexProgressModal;
