import React from 'react';

/**
 * Display general alert message (error, warning, or success style)
 * @param {string} message - The message to display
 * @param {string} type - 'error', 'warning', or 'success' (default: 'error')
 * @param {function} onClose - Optional close handler
 */
export const GeneralAlert = ({ message, type = 'error', onClose }) => {
  if (!message) return null;

  const classMap = {
    error: { alert: 'error-alert', message: 'error-message', close: 'error-close' },
    warning: { alert: 'warning-alert', message: 'warning-message', close: 'warning-close' },
    success: { alert: 'success-alert', message: 'success-message', close: 'success-close' }
  };

  const classes = classMap[type] || classMap.error;

  return (
    <div className={classes.alert}>
      <span className={classes.message}>{message}</span>
      {onClose && (
        <button onClick={onClose} className={classes.close}>×</button>
      )}
    </div>
  );
};

/**
 * Display general error message (toast/alert style)
 */
export const GeneralError = ({ message, onClose }) => {
  return <GeneralAlert message={message} type="error" onClose={onClose} />;
};

/**
 * Display general warning message (toast/alert style)
 */
export const GeneralWarning = ({ message, onClose }) => {
  return <GeneralAlert message={message} type="warning" onClose={onClose} />;
};

/**
 * Display general success message (toast/alert style)
 */
export const GeneralSuccess = ({ message, onClose }) => {
  return <GeneralAlert message={message} type="success" onClose={onClose} />;
};

/**
 * Display field-specific error (inline)
 */
export const FieldError = ({ error }) => {
  if (!error) return null;

  return (
    <span className="field-error">{error}</span>
  );
};

/**
 * Display multiple field errors
 */
export const FieldErrors = ({ errors }) => {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <ul className="field-errors-list">
      {Object.entries(errors).map(([field, message]) => (
        <li key={field}>
          <strong>{field}:</strong> {message}
        </li>
      ))}
    </ul>
  );
};

export default { GeneralAlert, GeneralError, GeneralWarning, GeneralSuccess, FieldError, FieldErrors };
