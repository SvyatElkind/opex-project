import React from 'react';
import './ErrorPanel.css';

const ErrorPanel = ({
    errorData,
    onClose,
    onNavigate,
    dismissWarning,
    dismissAllWarnings,
    isWarningDismissed,
    dismissedWarningCount = 0,
    resetDismissedWarnings
}) => {
    if (!errorData) return null;

    const { entity, level, validation, label, breadcrumb } = errorData;
    const hasErrors = validation.errors && validation.errors.length > 0;

    // Filter out dismissed warnings
    const allWarnings = validation.warnings || [];
    const activeWarnings = isWarningDismissed
        ? allWarnings.filter(w => !isWarningDismissed({ label: label || '', message: w.message }))
        : allWarnings;
    const localDismissedCount = allWarnings.length - activeWarnings.length;
    const hasWarnings = activeWarnings.length > 0;

    const errorCount = validation.errors ? validation.errors.length : 0;
    const warningCount = activeWarnings.length;

    const renderMessage = (message) => {
        if (!message) return null;
        let cleaned = message.replace(/\s*\([a-z_]+\)\s*$/i, '');
        cleaned = cleaned.replace(/<[^>]+>/g, '');
        return cleaned;
    };

    return (
        <div className="error-panel">

                <div className="error-panel-header">
                    <div className="error-panel-title">
                        <i className="fas fa-exclamation-triangle"></i>
                        <h3>Kļūdas un Brīdinājumi</h3>
                        {errorCount > 0 && (
                            <span className="title-count title-count-error">{errorCount}</span>
                        )}
                        {warningCount > 0 && (
                            <span className="title-count title-count-warning">{warningCount}</span>
                        )}
                        {localDismissedCount > 0 && (
                            <span className="title-count title-count-dismissed">
                                {localDismissedCount} ignorēti
                            </span>
                        )}
                    </div>
                    <div className="error-panel-actions">
                        {/* Ignore all warnings button */}
                        {hasWarnings && dismissAllWarnings && (
                            <button
                                className="error-panel-navigate error-panel-small-btn"
                                onClick={() => dismissAllWarnings(activeWarnings.map(w => ({ label: label || '', message: w.message })))}
                                title="Ignorēt visus brīdinājumus"
                            >
                                <i className="fas fa-eye-slash"></i>
                            </button>
                        )}
                        {/* Restore dismissed */}
                        {localDismissedCount > 0 && resetDismissedWarnings && (
                            <button
                                className="error-panel-navigate error-panel-small-btn"
                                onClick={resetDismissedWarnings}
                                title="Atjaunot ignorētos brīdinājumus"
                            >
                                <i className="fas fa-undo"></i>
                            </button>
                        )}
                        {onNavigate && (
                            <button className="error-panel-navigate" onClick={onNavigate} title="Pāriet uz šo elementu">
                                <i className="fas fa-arrow-right"></i>
                            </button>
                        )}
                        <button className="error-panel-close" onClick={onClose} title="Aizvērt">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>


                <div className="error-panel-content">

                    {hasErrors && (
                        <div className="error-list">
                            {validation.errors.map((error, index) => (
                                <div key={`error-${index}`} className="error-item">
                                    <div className="error-icon"></div>
                                    <div className="error-content">
                                        <p className="error-message">{renderMessage(error.message)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}


                    {hasWarnings && (
                        <div className="warning-list">
                            {activeWarnings.map((warning, index) => (
                                <div key={`warning-${index}`} className="warning-item">
                                    <div className="warning-icon"></div>
                                    <div className="warning-content">
                                        <p className="warning-message">{renderMessage(warning.message)}</p>
                                    </div>
                                    {dismissWarning && (
                                        <button
                                            className="warning-dismiss-btn"
                                            onClick={() => dismissWarning(`${label || ''}::${warning.message}`)}
                                            title="Ignorēt šo brīdinājumu"
                                        >
                                            <i className="fas fa-eye-slash"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                <div className="error-panel-footer">
                    <button className="panel-close-btn" onClick={onClose}>
                        Aizvērt
                    </button>
                </div>
        </div>
    );
};

export default ErrorPanel;
