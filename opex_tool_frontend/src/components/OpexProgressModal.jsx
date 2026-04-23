import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import useOpexProgress from '../hooks/useOpexProgress';
import { validateProjectForOPEX } from '../Utils/InheritanceUtils';
import { OPEX_PROGRESS_UI } from '../Constants/Constants';
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

const UI = OPEX_PROGRESS_UI;

const OpexProgressModal = ({ projectData, includeLongTerm = true, onClose }) => {
  const {
    phase, totalFiles, processedFiles, progressPercent,
    currentFile, failedFiles, recentFiles, inventoryProgress,
    elapsedMs, zippingPercent, zipFileName,
    startExport, close,
  } = useOpexProgress();

  const projectFolder = projectData?.folder || '';

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

  const headerTitle = () => {
    if (validationResult && !validationResult.valid) return UI.TITLE_VALIDATION_FAILED;
    switch (phase) {
      case 'connecting': return UI.TITLE_CONNECTING;
      case 'exporting': return UI.TITLE_EXPORTING;
      case 'exported': return UI.TITLE_EXPORTED;
      case 'zipping': return UI.TITLE_ZIPPING;
      case 'done': return UI.TITLE_DONE;
      case 'error': return UI.TITLE_ERROR;
      default: return UI.TITLE_DEFAULT;
    }
  };

  const headerSubtitle = () => {
    if (validationResult && !validationResult.valid) return UI.SUBTITLE_VALIDATION_FAILED;
    switch (phase) {
      case 'exporting': return UI.SUBTITLE_EXPORTING;
      case 'exported': return UI.SUBTITLE_EXPORTED;
      case 'zipping': return UI.SUBTITLE_ZIPPING_PERCENT.replace('{percent}', zippingPercent);
      case 'done': return UI.SUBTITLE_DONE;
      case 'error': return UI.SUBTITLE_ERROR;
      default: return UI.SUBTITLE_DEFAULT;
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
              <div style={{ marginTop: 12 }}>
                {validationResult.warnings.slice(0, 5).map((w, i) => (
                  <div key={i} className="opex-warning-item">
                    <i className="fas fa-exclamation-circle"></i>{w.message}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="opex-progress-footer">
            <button className="opex-progress-close-btn" onClick={handleClose}>
              <i className="fas fa-times"></i> {UI.BTN_CLOSE}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ─── Active export / done / error ──────────────────────────────────────

  const isExportPhase = phase === 'exporting';
  const isZipPhase = phase === 'exported' || phase === 'zipping';
  const isDone = phase === 'done';
  const isError = phase === 'error';
  const showFileProgress = phase !== 'idle' && phase !== 'connecting' && !isZipPhase;

  return ReactDOM.createPortal(
    <div className="opex-progress-overlay">
      <div className="opex-progress-modal">
        {/* Header */}
        <div className="opex-progress-header">
          <div className="opex-progress-header-text">
            <h2 className="opex-progress-title">{headerTitle()}</h2>
            <p className="opex-progress-subtitle">{headerSubtitle()}</p>
          </div>
        </div>

        {/* Body */}
        <div className="opex-progress-body">

          {/* Stats cards */}
          {phase !== 'idle' && phase !== 'connecting' && (
            <div className="opex-stats-row">
              <div className="opex-stat-card time">
                <div className="opex-stat-value">{formatTime(elapsedMs)}</div>
                <div className="opex-stat-label">{UI.STAT_TIME}</div>
              </div>
              <div className="opex-stat-card success">
                <div className="opex-stat-value">{processedFiles}</div>
                <div className="opex-stat-label">{UI.STAT_FILES}</div>
              </div>
              {failedFiles.length > 0 && (
                <div className="opex-stat-card error">
                  <div className="opex-stat-value">{failedFiles.length}</div>
                  <div className="opex-stat-label">{UI.STAT_ERRORS}</div>
                </div>
              )}
            </div>
          )}

          {/* File copy progress bar — only during exporting, NOT during zipping */}
          {showFileProgress && (
            <div className="opex-progress-bar-container">
              <div className="opex-progress-bar-track">
                <div className={`opex-progress-bar-fill ${isDone ? 'done' : isError ? 'error' : 'exporting'}`}
                     style={{ width: `${isDone ? 100 : progressPercent}%` }} />
              </div>
              <div className="opex-progress-bar-label">
                <span>{processedFiles} no {totalFiles}</span>
                <span className="opex-progress-bar-percent">{isDone ? 100 : progressPercent}%</span>
              </div>
            </div>
          )}

          {/* Current file breadcrumb */}
          {currentFile && isExportPhase && (
            <div className="opex-current-file">
              <div className="opex-current-file-label">{UI.SECTION_CURRENT_FILE}</div>
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

          {/* Per-inventory progress — fixed height for 5 rows */}
          {isExportPhase && Object.keys(inventoryProgress).length > 0 && (
            <div className="opex-inventory-section">
              <div className="opex-section-label">{UI.SECTION_INVENTORIES}</div>
              <div className="opex-inventory-list">
                {Object.entries(inventoryProgress).map(([num, inv]) => {
                  const pct = inv.total > 0 ? Math.round((inv.done / inv.total) * 100) : 0;
                  const isDone = inv.done >= inv.total;
                  return (
                    <div key={num} className={`opex-inventory-row ${isDone ? 'done' : ''}`}>
                      <i className={`fas ${isDone ? 'fa-check-circle' : 'fa-spinner fa-spin'}`}
                         style={{ width: 14, textAlign: 'center', fontSize: 10 }}></i>
                      <span style={{ minWidth: 50 }}>US {num}</span>
                      <span style={{ minWidth: 65 }} className="opex-inv-type">{inv.type}</span>
                      <div className="inv-bar">
                        <div className={`inv-bar-fill ${isDone ? 'complete' : 'active'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="opex-inv-count">{inv.done}/{inv.total}</span>
                      {inv.errors > 0 && (
                        <span className="opex-inv-error">
                          <i className="fas fa-exclamation-circle"></i> {inv.errors}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent files — scrollable */}
          {isExportPhase && recentFiles.length > 0 && (
            <div className="opex-recent-files">
              <div className="opex-section-label">{UI.SECTION_RECENT_FILES}</div>
              <div className="opex-recent-files-list">
                {recentFiles.map((f, i) => (
                  <div key={i} className="opex-recent-file"
                    style={{ opacity: 1 - (i * 0.15) }}>
                    <i className="fas fa-check opex-recent-file-icon"></i>
                    <span className="opex-recent-file-meta">US {f.inventoryNumber}</span>
                    <span className="opex-recent-file-meta">GV {f.itemNumber}</span>
                    <span className="opex-recent-file-name">{f.fileName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zipping phase — only the backend progress bar */}
          {isZipPhase && (
            <div className="opex-zipping-section">
              <div className="opex-section-label">{UI.SECTION_ARCHIVING}</div>
              <div className="opex-progress-bar-container">
                <div className="opex-progress-bar-track">
                  <div className="opex-progress-bar-fill exporting" style={{ width: `${zippingPercent}%` }} />
                </div>
                <div className="opex-progress-bar-label">
                  <span>{phase === 'zipping'
                    ? UI.ZIPPING_CREATING.replace('{percent}', zippingPercent)
                    : UI.ZIPPING_WAITING}</span>
                  <span className="opex-progress-bar-percent">{zippingPercent}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Done summary */}
          {isDone && (
            <div className="opex-summary">
              <div className="opex-summary-icon success"><i className="fas fa-check-circle"></i></div>
              <div className="opex-summary-stat">
                {failedFiles.length === 0
                  ? UI.DONE_ALL_SUCCESS
                  : UI.DONE_PARTIAL.replace('{count}', processedFiles - failedFiles.length)}
              </div>
              <div className="opex-summary-detail">
                {UI.DONE_DETAIL
                  .replace('{time}', formatTime(elapsedMs))
                  .replace('{inventories}', Object.keys(inventoryProgress).length)
                  .replace('{files}', processedFiles)}
              </div>
              {zipFileName && (
                <div className="opex-zip-location">
                  <div className="opex-section-label">{UI.SECTION_FILE_SAVED}</div>
                  <div className="opex-zip-path">
                    <i className="fas fa-folder-open"></i>
                    <span>{projectFolder ? `${projectFolder}\\opex_export\\${zipFileName}` : zipFileName}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error summary */}
          {isError && (
            <div className="opex-summary">
              <div className="opex-summary-icon error"><i className="fas fa-times-circle"></i></div>
              <div className="opex-summary-stat opex-summary-error">{UI.ERROR_TITLE}</div>
              <div className="opex-summary-detail">
                {UI.ERROR_DETAIL
                  .replace('{processed}', processedFiles)
                  .replace('{total}', totalFiles)
                  .replace('{time}', formatTime(elapsedMs))}
              </div>
            </div>
          )}

          {/* Failed files list */}
          {failedFiles.length > 0 && (
            <div className="opex-error-section">
              <button className="opex-error-toggle" onClick={() => setShowErrors(!showErrors)}>
                <i className={`fas fa-chevron-${showErrors ? 'down' : 'right'}`}></i>
                <span>{UI.ERROR_FILES_WITH_ERRORS.replace('{count}', failedFiles.length)}</span>
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

        {/* Footer */}
        {canClose && (
          <div className="opex-progress-footer">
            <button className="opex-progress-close-btn" onClick={handleClose}>
              <i className="fas fa-check"></i> {UI.BTN_CLOSE}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default OpexProgressModal;
