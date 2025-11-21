import React from 'react';
import './VerificationSummary.css';

/**
 * VerificationSummary Component
 * Displays overall OPEX readiness status and statistics
 */
const VerificationSummary = ({ validationResult, projectData }) => {
    if (!validationResult) {
        return (
            <div className="verification-summary">
                <div className="summary-empty">
                    <i className="fas fa-info-circle"></i>
                    <p>Nav pieejami validācijas rezultāti</p>
                </div>
            </div>
        );
    }

    const { summary, inventoryValidations } = validationResult;

    // Calculate additional statistics
    const totalItems = inventoryValidations.reduce((sum, invVal) => {
        return sum + (invVal.validation.details?.itemsValidated || 0);
    }, 0);

    const totalRecords = inventoryValidations.reduce((sum, invVal) => {
        return sum + (invVal.validation.details?.totalRecords || 0);
    }, 0);

    const totalFiles = inventoryValidations.reduce((sum, invVal) => {
        return sum + (invVal.validation.details?.totalFiles || 0);
    }, 0);

    const totalErrors = inventoryValidations.reduce((sum, invVal) => {
        return sum + (invVal.validation.details?.criticalIssues || 0);
    }, 0);

    const totalWarnings = inventoryValidations.reduce((sum, invVal) => {
        return sum + (invVal.validation.warnings?.length || 0);
    }, 0);

    const getStatusIcon = () => {
        if (summary.readyForOPEX) {
            return <i className="fas fa-check-circle status-icon-valid"></i>;
        } else {
            return <i className="fas fa-times-circle status-icon-error"></i>;
        }
    };

    return (
        <div className="verification-summary compact">
            <div className="summary-content">
                {/* Readiness Status */}
                <div className="readiness-status">
                    {getStatusIcon()}
                    <div className="readiness-info">
                        <span className="readiness-label">Gatavs OPEX ģenerēšanai:</span>
                        <span className={`readiness-value ${summary.readyForOPEX ? 'ready' : 'not-ready'}`}>
                            {summary.readyForOPEX ? 'JĀ' : 'NĒ'}
                        </span>
                    </div>
                </div>

                {/* Overall Statistics */}
                <div className="summary-section">
                    <h3>
                        <i className="fas fa-chart-bar"></i>
                        Statistika
                    </h3>
                    <div className="statistics-grid">
                        <div className="stat-item">
                            <span className="stat-label">US:</span>
                            <span className="stat-value">
                                {summary.totalInventories} kopā,{' '}
                                <span className="stat-valid">{summary.validInventories} derīgi</span>,{' '}
                                <span className="stat-error">{summary.inventoriesWithErrors} ar kļūdām</span>
                            </span>
                        </div>

                        <div className="stat-item">
                            <span className="stat-label">Vienības:</span>
                            <span className="stat-value">
                                {totalItems} kopā
                            </span>
                        </div>

                        <div className="stat-item">
                            <span className="stat-label">Dokumenti:</span>
                            <span className="stat-value">
                                {totalRecords} kopā
                            </span>
                        </div>

                        <div className="stat-item">
                            <span className="stat-label">Faili:</span>
                            <span className="stat-value">
                                {totalFiles} kopā
                            </span>
                        </div>
                    </div>
                </div>

                {/* Issues Summary */}
                <div className="summary-section">
                    <h3>
                        <i className="fas fa-exclamation-triangle"></i>
                        Problēmu Kopsavilkums
                    </h3>
                    <div className="issues-summary">
                        <div className="issue-count error-count">
                            <i className="fas fa-times-circle"></i>
                            <div className="issue-count-info">
                                <span className="issue-count-label">Kritiskas Kļūdas:</span>
                                <span className="issue-count-value">{totalErrors}</span>
                            </div>
                        </div>

                        <div className="issue-count warning-count">
                            <i className="fas fa-exclamation-triangle"></i>
                            <div className="issue-count-info">
                                <span className="issue-count-label">Brīdinājumi:</span>
                                <span className="issue-count-value">{totalWarnings}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {!summary.readyForOPEX && (
                    <div className="summary-message error-message">
                        <i className="fas fa-info-circle"></i>
                        <p>
                            Šis projekts nevar ģenerēt OPEX pakotnes, kamēr nav atrisinātas visas kritiskās kļūdas.
                            Lūdzu, pārskatiet detalizēto validācijas koku, lai identificētu un novērstu problēmas.
                        </p>
                    </div>
                )}

                {summary.readyForOPEX && totalWarnings > 0 && (
                    <div className="summary-message warning-message">
                        <i className="fas fa-info-circle"></i>
                        <p>
                            Projekts ir gatavs OPEX ģenerēšanai, bet ir {totalWarnings} brīdinājumi.
                            Lai gan tie netraucē ģenerēšanu, to novēršana uzlabos pakotnes kvalitāti.
                        </p>
                    </div>
                )}

                {summary.readyForOPEX && totalWarnings === 0 && (
                    <div className="summary-message success-message">
                        <i className="fas fa-check-circle"></i>
                        <p>
                            Projekts ir pilnībā gatavs OPEX pakotnes ģenerēšanai bez problēmām.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerificationSummary;
