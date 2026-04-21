import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import useOpexProgress from '../hooks/useOpexProgress';
import { validateProjectForOPEX } from '../Utils/InheritanceUtils';
import './OpexProgressModal.css';

/**
 * OpexProgressModal — Full-screen blocking overlay for OPEX export progress.
 *
 * Shows real-time file-by-file progress via WebSocket, with breadcrumb
 * navigation (Inventory → Item → Record → File), progress bar, error
 * tracking, and completion summary.
 *
 * Blocks all user interaction until export completes or fails.
 *
 * Props:
 *   projectData — full project object with nested inventories/items/records/files
 *   includeLongTerm — boolean, whether to include long-term storage inventories
 *   onClose — callback when user dismisses the modal (only available after completion)
 */

const OpexProgressModal = ({ projectData, includeLongTerm = true, onClose }) => {
  const {
    phase, totalFiles, processedFiles, progressPercent,
    currentFile, failedFiles, recentFiles, inventoryProgress,
    elapsedMs, startExport, close,
  } = useOpexProgress();

  // Timer that ticks every second during active export
  const [, setTick] = useState(0);
  React.useEffect(() => {
    if (phase === 'exporting' || phase === 'zipping' || phase === 'exported') {
      const timer = setInterval(() => setTick(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const formatTime = (ms) => {
    if (!ms) return '0s';
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}m ${remSecs}s`;
  };

  const [showErrors, setShowErrors] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Validate and start export on mount
  useEffect(() => {
    if (!projectData) return;

    const validation = validateProjectForOPEX(projectData);
    setValidationResult(validation);

    if (validation.valid) {
      startExport(projectData, includeLongTerm);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Block Escape key during active phases
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (phase === 'done' || phase === 'error' || (validationResult && !validationResult.valid)) {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [phase, validationResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    close();
    onClose?.();
  };

  const canClose = phase === 'done' || phase === 'error' || phase === 'idle'
    || (validationResult && !validationResult.valid);

  // Validation failed — show errors and close button
  if (validationResult && !validationResult.valid) {
    return ReactDOM.createPortal(
      <div className="opex-progress-overlay">
        <div className="opex-progress-modal">
          <div className="opex-progress-header">
            <div className="opex-progress-icon error">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2 className="opex-progress-title">OPEX eksports nav iespējams</h2>
            <p className="opex-progress-subtitle">
              Projekts nav gatavs OPEX ģenerēšanai. Lūdzu, izlabojiet šādas kļūdas:
            </p>
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
                  <div key={i} style={{ fontSize: 12, color: 'var(--color-warning, #f59e0b)', padding: '2px 12px' }}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: 6 }}></i>
                    {w.message}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="opex-progress-footer">
            <button className="opex-progress-close-btn" onClick={handleClose}>
              Aizvērt
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Phase-specific rendering
  const renderIcon = () => {
    switch (phase) {
      case 'connecting':
      case 'exporting':
      case 'exported':
        return <div className="opex-progress-icon exporting"><i className="fas fa-file-export"></i></div>;
      case 'zipping':
        return <div className="opex-progress-icon zipping"><i className="fas fa-file-archive"></i></div>;
      case 'done':
        return <div className="opex-progress-icon done"><i className="fas fa-check-circle"></i></div>;
      case 'error':
        return <div className="opex-progress-icon error"><i className="fas fa-times-circle"></i></div>;
      default:
        return <div className="opex-progress-icon exporting"><i className="fas fa-spinner fa-spin"></i></div>;
    }
  };

  const renderTitle = () => {
    switch (phase) {
      case 'connecting': return 'Savienojas ar serveri...';
      case 'exporting': return 'OPEX pakotnes ģenerēšana';
      case 'exported': return 'Failu kopēšana pabeigta';
      case 'zipping': return 'Arhivē pakotni...';
      case 'done': return 'OPEX pakotne veiksmīgi ģenerēta!';
      case 'error': return 'OPEX pakotnes ģenerēšana neizdevās';
      default: return 'Sagatavo eksportu...';
    }
  };

  const renderSubtitle = () => {
    switch (phase) {
      case 'connecting': return 'Lūdzu, uzgaidiet...';
      case 'exporting': return `Kopē failus uz OPEX struktūru`;
      case 'exported': return 'Visi faili nokopēti. Gaida arhivēšanu...';
      case 'zipping': return 'Izveido ZIP arhīvu...';
      case 'done': return `${processedFiles} faili apstrādāti${failedFiles.length > 0 ? `, ${failedFiles.length} ar kļūdām` : ''}`;
      case 'error': return 'Radās kļūda eksporta laikā';
      default: return '';
    }
  };

  const barClass = phase === 'done' ? 'done' : phase === 'error' ? 'error' : 'exporting';
  const barWidth = phase === 'zipping' || phase === 'done' ? 100 : progressPercent;

  return ReactDOM.createPortal(
    <div className="opex-progress-overlay">
      <div className="opex-progress-modal">
        {/* Header */}
        <div className="opex-progress-header">
          {renderIcon()}
          <h2 className="opex-progress-title">{renderTitle()}</h2>
          <p className="opex-progress-subtitle">{renderSubtitle()}</p>
        </div>

        {/* Body */}
        <div className="opex-progress-body">
          {/* Progress bar */}
          {phase !== 'idle' && phase !== 'connecting' && (
            <div className="opex-progress-bar-container">
              <div className="opex-progress-bar-track">
                <div
                  className={`opex-progress-bar-fill ${barClass}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className="opex-progress-bar-label">
                <span>{processedFiles} no {totalFiles} failiem</span>
                <span className="opex-progress-bar-percent">{barWidth}%</span>
              </div>
            </div>
          )}

          {/* Elapsed time */}
          {phase !== 'idle' && phase !== 'connecting' && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--spacing-3)',
            }}>
              <span><i className="fas fa-clock" style={{ marginRight: 6 }}></i>Laiks: {formatTime(elapsedMs)}</span>
              {processedFiles > 0 && phase === 'exporting' && (
                <span>~{formatTime(Math.round((elapsedMs / processedFiles) * (totalFiles - processedFiles)))} atlicis</span>
              )}
            </div>
          )}

          {/* Current file breadcrumb */}
          {currentFile && (phase === 'exporting') && (
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
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <div style={{
                fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase',
                letterSpacing: '0.5px', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)',
              }}>
                Uzskaites saraksti
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {Object.entries(inventoryProgress).map(([num, inv]) => {
                  const pct = inv.total > 0 ? Math.round((inv.done / inv.total) * 100) : 0;
                  const isDone = inv.done >= inv.total;
                  return (
                    <div key={num} style={{
                      display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                      color: isDone ? 'var(--color-success, #10b981)' : 'var(--text-secondary)',
                    }}>
                      <i className={`fas ${isDone ? 'fa-check-circle' : 'fa-spinner fa-spin'}`} style={{ width: 14, textAlign: 'center', fontSize: 10 }}></i>
                      <span style={{ minWidth: 60 }}>US {num}</span>
                      <span style={{ color: 'var(--text-light)', fontSize: 11 }}>{inv.type}</span>
                      <div style={{ flex: 1, height: 4, background: 'var(--color-background-medium)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`, borderRadius: 2,
                          background: isDone ? 'var(--color-success, #10b981)' : 'var(--color-primary)',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: 11, minWidth: 40, textAlign: 'right' }}>{inv.done}/{inv.total}</span>
                      {inv.errors > 0 && (
                        <span style={{ color: 'var(--color-error)', fontSize: 11 }}>
                          <i className="fas fa-exclamation-circle"></i> {inv.errors}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent files */}
          {phase === 'exporting' && recentFiles.length > 0 && (
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <div style={{
                fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase',
                letterSpacing: '0.5px', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-medium)',
              }}>
                Pēdējie apstrādātie faili
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentFiles.map((f, i) => (
                  <div key={i} style={{
                    fontSize: 11, color: i === 0 ? 'var(--text-primary)' : 'var(--text-light)',
                    padding: '2px 0', display: 'flex', gap: 6, alignItems: 'center',
                    opacity: 1 - (i * 0.15),
                  }}>
                    <i className="fas fa-check" style={{ color: 'var(--color-success, #10b981)', fontSize: 9, width: 12 }}></i>
                    <span style={{ color: 'var(--text-muted)' }}>US {f.inventoryNumber}</span>
                    <span style={{ color: 'var(--text-muted)' }}>GV {f.itemNumber}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.fileName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zipping message */}
          {(phase === 'exported' || phase === 'zipping') && (
            <div className="opex-current-file">
              <div className="opex-current-file-label">
                {phase === 'zipping' ? 'Arhivēšana' : 'Gaida'}
              </div>
              <div className="opex-current-file-path">
                <i className="fas fa-file-archive" style={{ color: 'var(--color-warning, #f59e0b)' }}></i>
                <span>
                  {phase === 'zipping'
                    ? 'Izveido ZIP arhīvu no eksportētajiem failiem...'
                    : 'Failu kopēšana pabeigta. Notiek arhivēšana...'}
                </span>
              </div>
            </div>
          )}

          {/* Done summary */}
          {phase === 'done' && (
            <div className="opex-summary">
              <div className="opex-summary-stat">
                {processedFiles} faili apstrādāti
              </div>
              <div className="opex-summary-detail">
                {failedFiles.length === 0
                  ? 'Visi faili veiksmīgi nokopēti un arhivēti'
                  : `${failedFiles.length} faili ar kļūdām`}
              </div>
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 'var(--spacing-6)',
                marginTop: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)',
              }}>
                <span><i className="fas fa-clock" style={{ marginRight: 4 }}></i>{formatTime(elapsedMs)}</span>
                <span><i className="fas fa-list" style={{ marginRight: 4 }}></i>{Object.keys(inventoryProgress).length} US</span>
                {failedFiles.length > 0 && (
                  <span style={{ color: 'var(--color-error)' }}><i className="fas fa-times" style={{ marginRight: 4 }}></i>{failedFiles.length} kļūdas</span>
                )}
              </div>
            </div>
          )}

          {/* Error summary */}
          {phase === 'error' && (
            <div className="opex-summary">
              <div className="opex-summary-stat" style={{ color: 'var(--color-error)' }}>
                Eksports neizdevās
              </div>
              <div className="opex-summary-detail">
                {processedFiles} no {totalFiles} failiem tika apstrādāti pirms kļūdas
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 'var(--spacing-2)' }}>
                Laiks: {formatTime(elapsedMs)}
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

        {/* Footer — only show close button when finished */}
        {canClose && (
          <div className="opex-progress-footer">
            <button className="opex-progress-close-btn" onClick={handleClose}>
              Aizvērt
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default OpexProgressModal;
