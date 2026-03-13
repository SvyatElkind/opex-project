import React from 'react';
import './ErrorPanel.css';

/**
 * ErrorPanel Component
 * Displays errors and warnings in a side panel
 */
const ErrorPanel = ({ errorData, onClose, onNavigate }) => {
    if (!errorData) return null;

    const { entity, level, validation, label, breadcrumb } = errorData;
    const hasErrors = validation.errors && validation.errors.length > 0;
    const hasWarnings = validation.warnings && validation.warnings.length > 0;
    const errorCount = validation.errors ? validation.errors.length : 0;
    const warningCount = validation.warnings ? validation.warnings.length : 0;

    // Clean and render message - strip trailing (field_name) and render HTML tags
    const renderMessage = (message) => {
        if (!message) return null;
        // Remove trailing parenthesized field references like (photo_records), (files), etc.
        let cleaned = message.replace(/\s*\([a-z_]+\)\s*$/i, '');
        // Check if message contains HTML tags
        if (/<[^>]+>/.test(cleaned)) {
            return <span dangerouslySetInnerHTML={{ __html: cleaned }} />;
        }
        return cleaned;
    };

    return (
        <div className="error-panel">
                {/* Header */}
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
                    </div>
                    <div className="error-panel-actions">
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

                {/* Content */}
                <div className="error-panel-content">
                    {/* Errors */}
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

                    {/* Warnings */}
                    {hasWarnings && (
                        <div className="warning-list">
                            {validation.warnings.map((warning, index) => (
                                <div key={`warning-${index}`} className="warning-item">
                                    <div className="warning-icon"></div>
                                    <div className="warning-content">
                                        <p className="warning-message">{renderMessage(warning.message)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="error-panel-footer">
                    <button className="panel-close-btn" onClick={onClose}>
                        Aizvērt
                    </button>
                </div>
        </div>
    );
};

export default ErrorPanel;
