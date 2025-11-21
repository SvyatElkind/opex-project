import React, { useState, useEffect, useMemo } from 'react';
import VerificationTreeView from './VerificationTreeView';
import { validateProjectForOPEX } from '../Utils/InheritanceUtils';
import { useNavigation } from '../Navigation/context/NavigationContext';
import './VerificationModal.css';

/**
 * VerificationModal Component
 * Full-screen modal displaying project validation status
 */
const VerificationModal = ({ isOpen, onClose, projectData }) => {
    const [validationResult, setValidationResult] = useState(null);
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'issues', 'errors'
    const [isValidating, setIsValidating] = useState(false);
    const { navigateTo } = useNavigation();

    // Calculate statistics from validation result
    const stats = useMemo(() => {
        if (!validationResult || !validationResult.inventoryValidations) {
            return null;
        }

        const { summary, inventoryValidations } = validationResult;

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

        return {
            readyForOPEX: summary.readyForOPEX,
            totalInventories: summary.totalInventories,
            validInventories: summary.validInventories,
            inventoriesWithErrors: summary.inventoriesWithErrors,
            totalItems,
            totalRecords,
            totalFiles,
            totalErrors,
            totalWarnings
        };
    }, [validationResult]);

    // Run validation when modal opens
    useEffect(() => {
        if (isOpen && projectData) {
            runValidation();
        }
    }, [isOpen, projectData]);

    const runValidation = () => {
        setIsValidating(true);
        try {
            const result = validateProjectForOPEX(projectData);
            setValidationResult(result);

            // Set default filter mode based on validation results
            if (result && result.inventoryValidations) {
                const totalErrors = result.inventoryValidations.reduce((sum, invVal) => {
                    return sum + (invVal.validation.details?.criticalIssues || 0);
                }, 0);

                const totalWarnings = result.inventoryValidations.reduce((sum, invVal) => {
                    return sum + (invVal.validation.warnings?.length || 0);
                }, 0);

                if (totalErrors > 0) {
                    setFilterMode('errors'); // Show only errors
                } else if (totalWarnings > 0) {
                    setFilterMode('issues'); // Show warnings + errors
                } else {
                    setFilterMode('all'); // Show all
                }
            }
        } catch (error) {
            console.error('Validation error:', error);
        } finally {
            setIsValidating(false);
        }
    };

    // Prevent rendering if not open
    if (!isOpen) {
        return null;
    }

    const handleNodeClick = (node, level) => {
        console.log('Node clicked:', level, node);
        // Future: Could navigate to the entity or show detailed info
    };

    // Handle navigation to a specific node
    const handleNavigateToNode = (node, level, context) => {
        console.log('VerificationModal: Navigating to:', level);
        console.log('  - Node:', node);
        console.log('  - Context:', context);
        console.log('  - Node ID:', node?.id);
        console.log('  - Inventory ID:', context?.inventoryId);
        console.log('  - Item ID:', context?.itemId);

        switch (level) {
            case 'inventory':
                console.log('  → Calling navigateTo("inventory",', node.id, ')');
                navigateTo('inventory', node.id);
                break;
            case 'item':
                if (!context?.inventoryId) {
                    console.error('Missing inventoryId for item navigation!');
                }
                console.log('  → Calling navigateTo("item",', node.id, ',', context?.inventoryId, ')');
                navigateTo('item', node.id, context?.inventoryId);
                break;
            case 'record':
                if (!context?.inventoryId || !context?.itemId) {
                    console.error('Missing inventoryId or itemId for record navigation!');
                }
                console.log('  → Calling navigateTo("record",', node.id, ',', context?.inventoryId, ',', context?.itemId, ')');
                navigateTo('record', node.id, context?.inventoryId, context?.itemId);
                break;
            case 'file':
                // Navigate to the parent record and open files tab
                if (context?.recordId) {
                    console.log('  → Calling navigateTo("record",', context.recordId, ',', context?.inventoryId, ',', context?.itemId, ', { tab: "files" })');
                    navigateTo('record', context.recordId, context?.inventoryId, context?.itemId, { tab: 'files' });
                } else {
                    console.error('Missing recordId for file navigation!');
                }
                break;
            default:
                console.warn('Unknown navigation level:', level);
                return;
        }

        // Close the modal after navigation
        onClose();
    };

    return (
        <div className="verification-modal-overlay" onClick={onClose}>
            <div className="verification-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="verification-modal-header">
                    <div className="modal-header-left">
                        <i className="fas fa-clipboard-check"></i>
                        <h1>Projekta Verifikācijas Struktūra</h1>
                    </div>
                    <div className="modal-header-right">
                        <button
                            className="modal-header-btn"
                            onClick={runValidation}
                            disabled={isValidating}
                            title="Atjaunināt validāciju"
                        >
                            <i className={`fas fa-sync-alt ${isValidating ? 'spinning' : ''}`}></i>
                            <span>Atjaunināt</span>
                        </button>

                        {/* Three-state filter toggle */}
                        <div className="filter-toggle-group">
                            <button
                                className={`filter-toggle-btn ${filterMode === 'all' ? 'active' : ''}`}
                                onClick={() => setFilterMode('all')}
                                title="Rādīt visu"
                            >
                                Visi
                            </button>
                            <button
                                className={`filter-toggle-btn ${filterMode === 'issues' ? 'active' : ''}`}
                                onClick={() => setFilterMode('issues')}
                                title="Rādīt brīdinājumus un kļūdas"
                            >
                                Brīdinājumi + Kļūdas
                            </button>
                            <button
                                className={`filter-toggle-btn ${filterMode === 'errors' ? 'active' : ''}`}
                                onClick={() => setFilterMode('errors')}
                                title="Rādīt tikai kļūdas"
                            >
                                Tikai Kļūdas
                            </button>
                        </div>

                        <button
                            className="modal-close-btn"
                            onClick={onClose}
                            title="Aizvērt"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="verification-modal-content">
                    {isValidating ? (
                        <div className="verification-loading">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Validē projekta struktūru...</p>
                        </div>
                    ) : validationResult && stats ? (
                        <>
                            {/* Compact Stats Badges */}
                            <div className="verification-stats-bar">
                                {/* OPEX Ready Status */}
                                <div className={`stat-badge ${stats.readyForOPEX ? 'stat-badge-success' : 'stat-badge-error'}`}>
                                    <i className={`fas ${stats.readyForOPEX ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                    <span className="stat-badge-label">OPEX</span>
                                    <span className="stat-badge-value">{stats.readyForOPEX ? 'Gatavs' : 'Nav gatavs'}</span>
                                </div>

                                {/* Inventories */}
                                <div className="stat-badge">
                                    <i className="fas fa-box"></i>
                                    <span className="stat-badge-label">US</span>
                                    <span className="stat-badge-value">{stats.validInventories}/{stats.totalInventories}</span>
                                </div>

                                {/* Items */}
                                <div className="stat-badge">
                                    <i className="fas fa-file-alt"></i>
                                    <span className="stat-badge-label">Vienības</span>
                                    <span className="stat-badge-value">{stats.totalItems}</span>
                                </div>

                                {/* Records */}
                                <div className="stat-badge">
                                    <i className="fas fa-database"></i>
                                    <span className="stat-badge-label">Dokumenti</span>
                                    <span className="stat-badge-value">{stats.totalRecords}</span>
                                </div>

                                {/* Files */}
                                <div className="stat-badge">
                                    <i className="fas fa-file"></i>
                                    <span className="stat-badge-label">Faili</span>
                                    <span className="stat-badge-value">{stats.totalFiles}</span>
                                </div>

                                {/* Errors */}
                                <div className={`stat-badge ${stats.totalErrors > 0 ? 'stat-badge-error' : 'stat-badge-muted'}`}>
                                    <i className="fas fa-times-circle"></i>
                                    <span className="stat-badge-label">Kļūdas</span>
                                    <span className="stat-badge-value">{stats.totalErrors}</span>
                                </div>

                                {/* Warnings */}
                                <div className={`stat-badge ${stats.totalWarnings > 0 ? 'stat-badge-warning' : 'stat-badge-muted'}`}>
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <span className="stat-badge-label">Brīdinājumi</span>
                                    <span className="stat-badge-value">{stats.totalWarnings}</span>
                                </div>
                            </div>

                            {/* Tree View Section */}
                            <VerificationTreeView
                                validationResult={validationResult}
                                projectData={projectData}
                                expandAll={false}
                                onNodeClick={handleNodeClick}
                                onNavigateToNode={handleNavigateToNode}
                                filterMode={filterMode}
                            />
                        </>
                    ) : (
                        <div className="verification-empty">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>Nevar validēt projektu</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="verification-modal-footer">
                    <div className="footer-info">
                        <i className="fas fa-info-circle"></i>
                        <span>
                            Šī verifikācija pārbauda, vai projekta struktūra ir gatava OPEX pakotnes ģenerēšanai.
                        </span>
                    </div>
                    <button className="modal-footer-btn" onClick={onClose}>
                        Aizvērt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;
