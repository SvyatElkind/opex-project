// src/components/ValidationIndicator.jsx
// Reusable validation status indicator component
// Shows validation status with clickable tooltip for details

import React, { useState, useRef, useEffect } from 'react';
import './ValidationIndicator.css';

/**
 * ValidationIndicator Component
 * Shows validation status icon with optional error/warning details
 *
 * @param {Object} validation - Validation result object with status, errors, warnings
 * @param {string} size - Size variant: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} showTooltip - Whether to show tooltip on hover (default: true)
 * @param {boolean} clickable - Whether indicator is clickable to show details (default: true)
 * @param {string} position - Tooltip position: 'top', 'bottom', 'left', 'right' (default: 'top')
 * @param {boolean} showCount - Whether to show issue count badge (default: false)
 */
const ValidationIndicator = ({
    validation,
    size = 'medium',
    showTooltip = true,
    clickable = true,
    position = 'top',
    showCount = false
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const detailsRef = useRef(null);
    const indicatorRef = useRef(null);

    // Close details when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (detailsRef.current && !detailsRef.current.contains(event.target) &&
                indicatorRef.current && !indicatorRef.current.contains(event.target)) {
                setShowDetails(false);
            }
        };

        if (showDetails) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDetails]);

    if (!validation) return null;

    const { status, errors = [], warnings = [] } = validation;
    const totalIssues = errors.length + warnings.length;

    // Determine icon and styling based on status
    const getIndicatorConfig = () => {
        switch (status) {
            case 'ERROR':
                return {
                    icon: 'fa-exclamation-circle',
                    className: 'validation-error',
                    label: 'Kļūda',
                    color: 'var(--color-error)'
                };
            case 'WARNING':
                return {
                    icon: 'fa-exclamation-triangle',
                    className: 'validation-warning',
                    label: 'Brīdinājums',
                    color: 'var(--color-warning)'
                };
            case 'VALID':
                return {
                    icon: 'fa-check-circle',
                    className: 'validation-valid',
                    label: 'Derīgs',
                    color: 'var(--color-primary)'
                };
            default:
                return {
                    icon: 'fa-question-circle',
                    className: 'validation-unknown',
                    label: 'Nezināms',
                    color: 'var(--text-muted)'
                };
        }
    };

    const config = getIndicatorConfig();

    const handleClick = (e) => {
        e.stopPropagation();
        if (clickable && totalIssues > 0) {
            setShowDetails(!showDetails);
        }
    };

    const renderTooltip = () => {
        if (!showTooltip || totalIssues === 0) return null;

        return (
            <div className={`validation-tooltip validation-tooltip-${position}`}>
                {errors.length > 0 && (
                    <div className="tooltip-section">
                        <strong>Kļūdas ({errors.length}):</strong>
                        {errors.slice(0, 3).map((error, idx) => (
                            <div key={idx} className="tooltip-item">• {error.message}</div>
                        ))}
                        {errors.length > 3 && <div className="tooltip-more">+{errors.length - 3} vairāk...</div>}
                    </div>
                )}
                {warnings.length > 0 && (
                    <div className="tooltip-section">
                        <strong>Brīdinājumi ({warnings.length}):</strong>
                        {warnings.slice(0, 3).map((warning, idx) => (
                            <div key={idx} className="tooltip-item">• {warning.message}</div>
                        ))}
                        {warnings.length > 3 && <div className="tooltip-more">+{warnings.length - 3} vairāk...</div>}
                    </div>
                )}
            </div>
        );
    };

    const renderDetailsPanel = () => {
        if (!showDetails || totalIssues === 0) return null;

        return (
            <div ref={detailsRef} className="validation-details-panel-fixed">
                <button
                    className="details-close-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDetails(false);
                    }}
                >
                    <i className="fas fa-times"></i>
                </button>
                <ul className="validation-issues-list">
                    {errors.map((error, idx) => (
                        <li
                            key={`error-${idx}`}
                            className="details-errors"
                            dangerouslySetInnerHTML={{ __html: error.message }}
                        />
                    ))}
                    {warnings.map((warning, idx) => (
                        <li
                            key={`warning-${idx}`}
                            className="details-warnings"
                            dangerouslySetInnerHTML={{ __html: warning.message }}
                        />
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <>
            <div className="validation-indicator-wrapper">
                <div
                    ref={indicatorRef}
                    className={`validation-indicator validation-indicator-${size} ${config.className} ${clickable && totalIssues > 0 ? 'validation-clickable' : ''}`}
                    onClick={handleClick}
                    title={totalIssues === 0 ? config.label : `${errors.length} kļūdas, ${warnings.length} brīdinājumi - noklikšķiniet detaļām`}
                >
                    <i className={`fas ${config.icon}`} style={{ color: config.color }}></i>
                    {showCount && totalIssues > 0 && (
                        <span className="validation-count">{totalIssues}</span>
                    )}
                    {showTooltip && totalIssues > 0 && renderTooltip()}
                </div>
            </div>
            {renderDetailsPanel()}
        </>
    );
};

export default ValidationIndicator;
