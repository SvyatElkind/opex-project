import React from 'react';
import './ValidationWarning.css';

/**
 * ValidationWarning Component
 *
 * Displays validation warnings for files that exceed recommended thresholds.
 * These are soft warnings that don't prevent file upload.
 */
const ValidationWarning = ({ warnings, onDismiss, onProceed, className = '' }) => {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className={`validation-warning ${className}`}>
      <div className="validation-warning-header">
        <i className="fas fa-exclamation-triangle"></i>
        <h4>Validācijas Brīdinājumi</h4>
      </div>

      <div className="validation-warning-body">
        <p className="validation-warning-intro">
          Augšupielādētais fails pārsniedz ieteiktos parametrus. Jūs varat turpināt, bet ievērojiet:
        </p>

        <ul className="validation-warning-list">
          {warnings.map((warning, index) => (
            <li key={index} className="validation-warning-item">
              <i className="fas fa-circle"></i>
              <span>{warning.message}</span>
            </li>
          ))}
        </ul>

        <div className="validation-warning-note">
          <i className="fas fa-info-circle"></i>
          <span>
            Šie brīdinājumi ir informatīvi. Varat mainīt iestatījumus sadaļā{' '}
            <strong>Iestatījumi {'>'} Validācija</strong>.
          </span>
        </div>
      </div>

      <div className="validation-warning-actions">
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="validation-btn validation-btn-cancel"
          >
            <i className="fas fa-times"></i>
            Atcelt
          </button>
        )}
        {onProceed && (
          <button
            onClick={onProceed}
            className="validation-btn validation-btn-proceed"
          >
            <i className="fas fa-check"></i>
            Turpināt Tik Un Tā
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Inline validation warning (more compact, for forms)
 */
export const InlineValidationWarning = ({ warnings, className = '' }) => {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className={`inline-validation-warning ${className}`}>
      <i className="fas fa-exclamation-triangle"></i>
      <div className="inline-warning-content">
        {warnings.length === 1 ? (
          <span>{warnings[0].message}</span>
        ) : (
          <>
            <span>Atrasti {warnings.length} brīdinājumi:</span>
            <ul>
              {warnings.map((warning, index) => (
                <li key={index}>{warning.message}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Validation summary badge (shows count)
 */
export const ValidationBadge = ({ warningCount, onClick, className = '' }) => {
  if (!warningCount || warningCount === 0) return null;

  return (
    <div
      className={`validation-badge ${className}`}
      onClick={onClick}
      title={`${warningCount} validācijas ${warningCount === 1 ? 'brīdinājums' : 'brīdinājumi'}`}
    >
      <i className="fas fa-exclamation-triangle"></i>
      <span>{warningCount}</span>
    </div>
  );
};

export default ValidationWarning;
