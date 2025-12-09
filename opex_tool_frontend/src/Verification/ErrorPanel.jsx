import React from 'react';
import './ErrorPanel.css';

/**
 * ErrorPanel Component
 * Displays errors and warnings in a side panel
 */
const ErrorPanel = ({ errorData, onClose }) => {
    if (!errorData) return null;

    const { entity, level, validation, label } = errorData;
    const hasErrors = validation.errors && validation.errors.length > 0;
    const hasWarnings = validation.warnings && validation.warnings.length > 0;

    return (
        <div className="error-panel">
                {/* Header */}
                <div className="error-panel-header">
                    <div className="error-panel-title">
                        <i className="fas fa-exclamation-triangle"></i>
                        <h3>Kļūdas un Brīdinājumi</h3>
                    </div>
                    <button className="error-panel-close" onClick={onClose} title="Aizvērt">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Entity Info */}
                <div className="error-panel-info">
                    <span className="info-label">{getEntityTypeLabel(level)}:</span>
                    <span className="info-value">{label}</span>
                </div>

                {/* Content */}
                <div className="error-panel-content">
                    {/* Errors Section */}
                    {hasErrors && (
                        <div className="error-section">
                            <div className="section-header error-header">
                                <i className="fas fa-times-circle"></i>
                                <h4>Kļūdas ({validation.errors.length})</h4>
                            </div>
                            <div className="error-list">
                                {validation.errors.map((error, index) => (
                                    <div key={`error-${index}`} className="error-item">
                                        <div className="error-icon"></div>
                                        <div className="error-content">
                                            <p className="error-message">{error.message}</p>
                                            {error.field && (
                                                <span className="error-field">Lauks: {error.field}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Warnings Section */}
                    {hasWarnings && (
                        <div className="warning-section">
                            <div className="section-header warning-header">
                                <i className="fas fa-exclamation-triangle"></i>
                                <h4>Brīdinājumi ({validation.warnings.length})</h4>
                            </div>
                            <div className="warning-list">
                                {validation.warnings.map((warning, index) => (
                                    <div key={`warning-${index}`} className="warning-item">
                                        <div className="warning-icon"></div>
                                        <div className="warning-content">
                                            <p className="warning-message">{warning.message}</p>
                                            {warning.field && (
                                                <span className="warning-field">Lauks: {warning.field}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
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

/**
 * Get entity type label in Latvian
 */
const getEntityTypeLabel = (level) => {
    const labels = {
        inventory: 'Uzskaites Saraksts',
        item: 'Glabājamā vienība',
        record: 'Dokuments',
        file: 'Fails'
    };
    return labels[level] || level;
};

export default ErrorPanel;
