import React, { useState, useEffect, useMemo } from 'react';
import VerificationTreeView from './VerificationTreeView';
import { validateProjectForOPEX, determineCategory, CATEGORY_TYPES, CATEGORY_CONSTRAINTS } from '../Utils/InheritanceUtils';
import { useNavigation } from '../Navigation/context/NavigationContext';
import { useExportInventoryList, useExportAcceptanceReport } from '../hooks/useProjects';
import { VERIFICATION_UI, GUIDE_TAB_UI } from '../Constants/Constants';
import { STATS_ICONS, FORMAT_ICONS, getEntityIcon } from '../Constants/iconConstants';
import HelpButton from '../Help/HelpButton';
import './VerificationModal.css';

/**
 * ExportPopup Component
 * Popup for choosing between physical and electronic export
 */
const ExportPopup = ({ isOpen, onClose, onExport, isPending }) => {
    if (!isOpen) return null;

    return (
        <div className="export-popup-overlay" onClick={onClose}>
            <div className="export-popup" onClick={(e) => e.stopPropagation()}>
                <div className="export-popup-header">
                    <h3>Eksportēt PN aktu</h3>
                </div>
                <div className="export-popup-content">
                    <p>Izvēlieties eksporta veidu:</p>
                    <div className="export-popup-options">
                        <button
                            className="export-option-btn"
                            onClick={() => onExport(true)}
                            disabled={isPending}
                        >
                            <i className={`fas ${STATS_ICONS.ELECTRONIC_ITEMS}`}></i>
                            <span>Elektroniskais</span>
                            <small>Elektronisko dokumentu akts</small>
                        </button>
                        <div className="export-popup-divider"></div>
                        <button
                            className="export-option-btn"
                            onClick={() => onExport(false)}
                            disabled={isPending}
                        >
                            <i className={`fas ${FORMAT_ICONS.PHYSICAL}`}></i>
                            <span>Fiziskais</span>
                            <small>Fizisko dokumentu akts</small>
                        </button>
                    </div>
                </div>
                <div className="export-popup-footer">
                    <button className="export-popup-back-btn" onClick={onClose}>
                        Aizvērt
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * VerificationModal Component
 * Full-screen modal displaying project validation status
 */
const VerificationModal = ({ isOpen, onClose, projectData, onOpenSigners }) => {
    const [validationResult, setValidationResult] = useState(null);
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'issues', 'errors'
    const [showPhysical, setShowPhysical] = useState(false); // Toggle for physical documents
    const [isValidating, setIsValidating] = useState(false);
    const [activeTab, setActiveTab] = useState('pārskats'); // 'info' or 'pārskats'
    const [showExportPopup, setShowExportPopup] = useState(false);
    const { navigateTo } = useNavigation();

    // Export mutations
    const exportInventoryList = useExportInventoryList();
    const exportAcceptanceReport = useExportAcceptanceReport();

    // Calculate statistics from validation result
    const stats = useMemo(() => {
        if (!validationResult || !validationResult.inventoryValidations) {
            return null;
        }

        const { summary, inventoryValidations } = validationResult;

        // Separate imported and created inventories
        let importedInventories = 0;
        let createdInventories = 0;

        if (projectData?.institution?.fond?.inventories) {
            projectData.institution.fond.inventories.forEach(inv => {
                if (inv.from_report) {
                    importedInventories++;
                } else {
                    createdInventories++;
                }
            });
        }

        const totalItems = inventoryValidations.reduce((sum, invVal) => {
            return sum + (invVal.validation.details?.itemsValidated || 0);
        }, 0);

        // Calculate total records, files, file size, and physical/electronic item counts
        let totalRecords = 0;
        let totalFiles = 0;
        let totalFileSize = 0;
        let physicalItems = 0;
        let electronicItems = 0;
        if (projectData?.institution?.fond?.inventories) {
            projectData.institution.fond.inventories.forEach(inventory => {
                if (inventory.items) {
                    inventory.items.forEach(item => {
                        // Count physical vs electronic items
                        if (inventory.electronic) {
                            electronicItems++;
                        } else {
                            physicalItems++;
                        }
                        // Count regular records and their files
                        if (item.records) {
                            totalRecords += item.records.length;
                            item.records.forEach(record => {
                                if (record.files) {
                                    totalFiles += record.files.length;
                                    record.files.forEach(file => {
                                        totalFileSize += file.size || file.file_size || 0;
                                    });
                                }
                            });
                        }
                        // Count photo records as files
                        if (item.photo_records) {
                            totalFiles += item.photo_records.length;
                            item.photo_records.forEach(file => {
                                totalFileSize += file.size || file.file_size || 0;
                            });
                        }
                        // Count video records as files
                        if (item.video_records) {
                            totalFiles += item.video_records.length;
                            item.video_records.forEach(file => {
                                totalFileSize += file.size || file.file_size || 0;
                            });
                        }
                        // Count audio records as files
                        if (item.audio_records) {
                            totalFiles += item.audio_records.length;
                            item.audio_records.forEach(file => {
                                totalFileSize += file.size || file.file_size || 0;
                            });
                        }
                    });
                }
            });
        }

        const totalErrors = inventoryValidations.reduce((sum, invVal) => {
            return sum + (invVal.validation.details?.criticalIssues || 0);
        }, 0);

        const totalWarnings = inventoryValidations.reduce((sum, invVal) => {
            return sum + (invVal.validation.warnings?.length || 0);
        }, 0);

        return {
            readyForOPEX: summary.readyForOPEX,
            totalInventories: summary.totalInventories,
            importedInventories,
            createdInventories,
            validInventories: summary.validInventories,
            inventoriesWithErrors: summary.inventoriesWithErrors,
            totalItems,
            totalRecords,
            totalFiles,
            totalFileSize,
            physicalItems,
            electronicItems,
            totalErrors,
            totalWarnings
        };
    }, [validationResult, projectData]);

    // Compute per-inventory breakdown and type distribution for guide tab
    const guideData = useMemo(() => {
        if (!projectData?.institution?.fond?.inventories || !validationResult?.inventoryValidations) {
            return null;
        }

        const inventories = projectData.institution.fond.inventories;
        const invValidations = validationResult.inventoryValidations;

        // Per-inventory breakdown
        const inventoryBreakdown = inventories.map((inventory) => {
            const category = determineCategory(inventory.type, inventory.electronic);

            // Find matching validation entry
            const invVal = invValidations.find(v =>
                v.inventory?.id === inventory.id || v.inventory?.number === inventory.number
            );

            const itemCount = inventory.items ? inventory.items.length : 0;

            let recordCount = 0;
            let fileCount = 0;
            let fileSize = 0;

            if (inventory.items) {
                inventory.items.forEach(item => {
                    if (item.records) {
                        recordCount += item.records.length;
                        item.records.forEach(record => {
                            if (record.files) {
                                fileCount += record.files.length;
                                record.files.forEach(file => {
                                    fileSize += file.size || file.file_size || 0;
                                });
                            }
                        });
                    }
                    ['photo_records', 'video_records', 'audio_records'].forEach(mediaKey => {
                        if (item[mediaKey]) {
                            fileCount += item[mediaKey].length;
                            item[mediaKey].forEach(file => {
                                fileSize += file.size || file.file_size || 0;
                            });
                        }
                    });
                });
            }

            const errorCount = invVal?.validation?.details?.criticalIssues || 0;
            const warningCount = invVal?.validation?.warnings?.length || 0;
            const validationStatus = invVal?.validation?.status || 'VALID';

            return {
                id: inventory.id,
                number: inventory.number,
                postfix: inventory.postfix || '',
                type: inventory.type,
                electronic: inventory.electronic,
                category,
                icon: getEntityIcon(inventory.type, inventory.electronic),
                storageTerm: inventory.storage_term,
                fromReport: inventory.from_report,
                itemCount,
                recordCount,
                fileCount,
                fileSize,
                errorCount,
                warningCount,
                validationStatus,
                hasRecords: category === CATEGORY_TYPES.DOCUMENTS || category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS,
                hasFiles: category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS || category === CATEGORY_TYPES.ELECTRONIC_MEDIA
            };
        });

        // Type distribution grouped by category
        const typeMap = {};
        Object.values(CATEGORY_TYPES).forEach(cat => {
            typeMap[cat] = {
                category: cat,
                displayName: CATEGORY_CONSTRAINTS[cat]?.displayName || cat,
                inventoryCount: 0,
                itemCount: 0,
                recordCount: 0,
                fileCount: 0,
                fileSize: 0
            };
        });

        inventoryBreakdown.forEach(inv => {
            const dist = typeMap[inv.category];
            if (dist) {
                dist.inventoryCount++;
                dist.itemCount += inv.itemCount;
                dist.recordCount += inv.recordCount;
                dist.fileCount += inv.fileCount;
                dist.fileSize += inv.fileSize;
            }
        });

        const typeDistribution = Object.values(typeMap).filter(d => d.inventoryCount > 0);

        return { inventoryBreakdown, typeDistribution };
    }, [projectData, validationResult]);

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

                // Only show errors filter if there are actual errors (not just warnings)
                if (totalErrors > 0) {
                    setFilterMode('errors');
                } else {
                    // No errors - enable "Rādīt visu" (Show all) even if there are warnings
                    setFilterMode('all');
                }
            } else {
                // If validation result is invalid, default to showing all
                setFilterMode('all');
            }
        } catch (error) {
            console.error('Validation error:', error);
            // On error, default to showing all
            setFilterMode('all');
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

    // Handle export inventory list
    const handleExportInventoryList = () => {
        if (!projectData?.id) {
            console.error('No project ID available');
            return;
        }
        exportInventoryList.mutate(projectData.id);
    };

    // Handle export acceptance report with popup
    const handleExportAcceptanceReport = (electronic) => {
        if (!projectData?.id) {
            console.error('No project ID available');
            return;
        }
        exportAcceptanceReport.mutate({
            projectId: projectData.id,
            electronic: electronic
        });
        setShowExportPopup(false);
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Nav norādīts';
        const date = new Date(dateString);
        return date.toLocaleDateString('lv-LV', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="verification-modal-overlay" onClick={onClose}>
            <div className="verification-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="verification-modal-header">
                    <div className="modal-header-top">
                        <div className="modal-header-left">
                            <h1>{VERIFICATION_UI.MODAL_TITLE}</h1>
                        </div>
                        <HelpButton chapterId="projects" iconOnly={true} className="small header-help-btn" />
                    </div>

                    {/* Stats Bar integrated in header with controls */}
                    {!isValidating && validationResult && stats && (
                        <div className="verification-stats-bar">
                            <div className="stats-bar-left">
                                {/* Imported Inventories */}
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.IMPORTED_INVENTORY}`}></i>
                                    <span className="stat-badge-label">{VERIFICATION_UI.STATS_US_IMPORTED}</span>
                                    <span className="stat-badge-value">{stats.importedInventories}</span>
                                </div>

                                {/* Created Inventories */}
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.CREATED_INVENTORY}`}></i>
                                    <span className="stat-badge-label">{VERIFICATION_UI.STATS_US_CREATED}</span>
                                    <span className="stat-badge-value">{stats.createdInventories}</span>
                                </div>

                                {/* Items */}
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.ITEMS}`}></i>
                                    <span className="stat-badge-label">{VERIFICATION_UI.STATS_VIENĪBAS}</span>
                                    <span className="stat-badge-value">{stats.totalItems}</span>
                                </div>

                                {/* Records */}
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.RECORDS}`}></i>
                                    <span className="stat-badge-label">{VERIFICATION_UI.STATS_DOKUMENTI}</span>
                                    <span className="stat-badge-value">{stats.totalRecords}</span>
                                </div>

                                {/* Files */}
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.FILES}`}></i>
                                    <span className="stat-badge-label">{VERIFICATION_UI.STATS_FAILI}</span>
                                    <span className="stat-badge-value">{stats.totalFiles}</span>
                                </div>

                                {/* Physical Items */}
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.PHYSICAL_ITEMS}`}></i>
                                    <span className="stat-badge-label">Fiziskās GV</span>
                                    <span className="stat-badge-value">{stats.physicalItems}</span>
                                </div>

                                {/* Electronic Items */}
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.ELECTRONIC_ITEMS}`}></i>
                                    <span className="stat-badge-label">Elektroniskās GV</span>
                                    <span className="stat-badge-value">{stats.electronicItems}</span>
                                </div>

                                {/* Total File Size */}
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.FILE_SIZE}`}></i>
                                    <span className="stat-badge-label">Izmērs</span>
                                    <span className="stat-badge-value">{formatFileSize(stats.totalFileSize)}</span>
                                </div>
                            </div>

                            <div className="stats-bar-right">
                                {/* Physical/Electronic toggle switch */}
                                <div className="toggle-switch-container">
                                    <span className={`toggle-label ${!showPhysical ? 'active' : ''}`}>
                                        <i className={`fas ${STATS_ICONS.ELECTRONIC_ITEMS}`}></i>
                                    </span>
                                    <button
                                        className={`toggle-switch ${showPhysical ? 'active' : ''}`}
                                        onClick={() => setShowPhysical(!showPhysical)}
                                        title={showPhysical ? VERIFICATION_UI.TOGGLE_PHYSICAL_LABEL : VERIFICATION_UI.TOGGLE_ELECTRONIC_LABEL}
                                    >
                                        <span className="toggle-slider"></span>
                                    </button>
                                    <span className={`toggle-label ${showPhysical ? 'active' : ''}`}>
                                        <i className={`fas ${FORMAT_ICONS.PHYSICAL}`}></i>
                                    </span>
                                </div>

                                {/* Filter toggle switch */}
                                <div className="toggle-switch-container">
                                    <span className={`toggle-label ${filterMode === 'errors' ? 'active' : ''}`}>
                                        <i className="fas fa-exclamation-circle"></i>
                                    </span>
                                    <button
                                        className={`toggle-switch ${filterMode === 'all' ? 'active' : ''}`}
                                        onClick={() => setFilterMode(filterMode === 'all' ? 'errors' : 'all')}
                                        title={filterMode === 'all' ? VERIFICATION_UI.FILTER_ALL_TITLE : VERIFICATION_UI.FILTER_ERRORS_TITLE}
                                    >
                                        <span className="toggle-slider"></span>
                                    </button>
                                    <span className={`toggle-label ${filterMode === 'all' ? 'active' : ''}`}>
                                        <i className="fas fa-clipboard-list"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="verification-tabs">
                        <button
                            className={`verification-tab ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            <i className="fas fa-info-circle"></i>
                            <span>Projekta pamatinformācija</span>
                        </button>
                        <button
                            className={`verification-tab ${activeTab === 'pārskats' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pārskats')}
                        >
                            <i className="fas fa-sitemap"></i>
                            <span>Pārskats</span>
                        </button>
                        <button
                            className={`verification-tab ${activeTab === 'ceļvedis' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ceļvedis')}
                        >
                            <i className="fas fa-compass"></i>
                            <span>Projekta ceļvedis</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="verification-modal-content">
                    {isValidating ? (
                        <div className="verification-loading">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>{VERIFICATION_UI.VALIDATING_MESSAGE}</p>
                        </div>
                    ) : validationResult && stats ? (
                        <>
                            {activeTab === 'info' ? (
                                /* Project Info Tab */
                                <div className="project-info-tab">
                                    {/* Missing signers alert - floats to top */}
                                    {!(projectData?.institution?.creator &&
                                       projectData?.institution?.creator_position &&
                                       projectData?.institution?.signer &&
                                       projectData?.institution?.signer_position) && (
                                        <div className="project-info-section signers-missing-alert">
                                            <h3>
                                                <i className="fas fa-exclamation-triangle"></i>
                                                Atbildīgās personas
                                            </h3>
                                            <div className="signers-missing-content">
                                                <p>{VERIFICATION_UI.MISSING_SIGNERS_MESSAGE}</p>
                                                {onOpenSigners && (
                                                    <button
                                                        className="signers-missing-btn"
                                                        onClick={() => {
                                                            onClose();
                                                            onOpenSigners();
                                                        }}
                                                    >
                                                        <i className="fas fa-user-plus"></i>
                                                        <span>{VERIFICATION_UI.MISSING_SIGNERS_BTN}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="project-info-section">
                                        <h3>
                                            <i className="fas fa-folder-open"></i>
                                            Projekta informācija
                                        </h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <label>Projekta nosaukums</label>
                                                <span>{projectData?.name || 'Nav norādīts'}</span>
                                            </div>
                                            <div className="info-item">
                                                <label>Izveidošanas datums</label>
                                                <span>{formatDate(projectData?.created_at)}</span>
                                            </div>
                                            <div className="info-item">
                                                <label>Vieta diskā</label>
                                                <span>{projectData?.folder || 'Nav norādīts'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="project-info-section">
                                        <h3>
                                            <i className="fas fa-building"></i>
                                            Institūcija
                                        </h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <label>Nosaukums</label>
                                                <span>{projectData?.institution?.name || 'Nav norādīts'}</span>
                                            </div>
                                            <div className="info-item">
                                                <label>Fonda nosaukums</label>
                                                <span>{projectData?.institution?.fond?.name || 'Nav norādīts'}</span>
                                            </div>
                                            <div className="info-item">
                                                <label>Fonda numurs</label>
                                                <span>{projectData?.institution?.fond?.number || 'Nav norādīts'}</span>
                                            </div>
                                            <div className="info-item">
                                                <label>Reģistrācijas numurs</label>
                                                <span>{projectData?.institution?.reg_nr || 'Nav norādīts'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signers section - only shown when all fields are filled */}
                                    {projectData?.institution?.creator &&
                                     projectData?.institution?.creator_position &&
                                     projectData?.institution?.signer &&
                                     projectData?.institution?.signer_position && (
                                        <div className="project-info-section">
                                            <h3>
                                                <i className="fas fa-pen-fancy"></i>
                                                Atbildīgās personas
                                            </h3>
                                            <div className="info-grid">
                                                <div className="info-item">
                                                    <label>Aprakstīšanu veica</label>
                                                    <span>{projectData.institution.creator}, {projectData.institution.creator_position}</span>
                                                </div>
                                                <div className="info-item">
                                                    <label>Parakstītājs</label>
                                                    <span>{projectData.institution.signer}, {projectData.institution.signer_position}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            ) : activeTab === 'ceļvedis' ? (
                                /* Guide Tab */
                                <div className="project-guide-tab">
                                    {/* Section 1: Project Overview */}
                                    <div className="project-info-section">
                                        <h3>
                                            <i className="fas fa-chart-bar"></i>
                                            {GUIDE_TAB_UI.SECTION_OVERVIEW}
                                        </h3>
                                        <div className="guide-stats-grid">
                                            <div className="stat-card">
                                                <i className={`fas ${STATS_ICONS.IMPORTED_INVENTORY}`}></i>
                                                <div className="stat-card-content">
                                                    <label>{GUIDE_TAB_UI.STAT_INVENTORIES}</label>
                                                    <span className="stat-value">{stats.totalInventories}</span>
                                                </div>
                                            </div>
                                            <div className="stat-card">
                                                <i className={`fas ${STATS_ICONS.ITEMS}`}></i>
                                                <div className="stat-card-content">
                                                    <label>{GUIDE_TAB_UI.STAT_ITEMS}</label>
                                                    <span className="stat-value">{stats.totalItems}</span>
                                                </div>
                                            </div>
                                            <div className="stat-card">
                                                <i className={`fas ${STATS_ICONS.RECORDS}`}></i>
                                                <div className="stat-card-content">
                                                    <label>{GUIDE_TAB_UI.STAT_RECORDS}</label>
                                                    <span className="stat-value">{stats.totalRecords}</span>
                                                </div>
                                            </div>
                                            <div className="stat-card">
                                                <i className={`fas ${STATS_ICONS.FILES}`}></i>
                                                <div className="stat-card-content">
                                                    <label>{GUIDE_TAB_UI.STAT_FILES}</label>
                                                    <span className="stat-value">{stats.totalFiles}</span>
                                                </div>
                                            </div>
                                            <div className="stat-card">
                                                <i className={`fas ${STATS_ICONS.FILE_SIZE}`}></i>
                                                <div className="stat-card-content">
                                                    <label>{GUIDE_TAB_UI.STAT_SIZE}</label>
                                                    <span className="stat-value">{formatFileSize(stats.totalFileSize)}</span>
                                                </div>
                                            </div>
                                            <div className="stat-card">
                                                <i className="fas fa-exclamation-circle"></i>
                                                <div className="stat-card-content">
                                                    <label>{GUIDE_TAB_UI.STAT_ISSUES}</label>
                                                    <span className={`stat-value ${stats.totalErrors > 0 ? 'error' : 'success'}`}>
                                                        {stats.totalErrors} / {stats.totalWarnings}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Per-Inventory Breakdown Table */}
                                    {guideData && (
                                        <div className="project-info-section">
                                            <h3>
                                                <i className="fas fa-clipboard-list"></i>
                                                {GUIDE_TAB_UI.SECTION_INVENTORY_BREAKDOWN}
                                            </h3>
                                            <div className="guide-table-wrapper">
                                                <table className="guide-inventory-table">
                                                    <thead>
                                                        <tr>
                                                            <th className="guide-th-number">{GUIDE_TAB_UI.COL_NUMBER}</th>
                                                            <th className="guide-th-type">{GUIDE_TAB_UI.COL_TYPE}</th>
                                                            <th className="guide-th-format">{GUIDE_TAB_UI.COL_FORMAT}</th>
                                                            <th className="guide-th-term">{GUIDE_TAB_UI.COL_STORAGE_TERM}</th>
                                                            <th className="guide-th-count">{GUIDE_TAB_UI.COL_ITEMS}</th>
                                                            <th className="guide-th-count">{GUIDE_TAB_UI.COL_RECORDS}</th>
                                                            <th className="guide-th-count">{GUIDE_TAB_UI.COL_FILES}</th>
                                                            <th className="guide-th-size">{GUIDE_TAB_UI.COL_SIZE}</th>
                                                            <th className="guide-th-status">{GUIDE_TAB_UI.COL_STATUS}</th>
                                                            <th className="guide-th-action"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {guideData.inventoryBreakdown
                                                            .filter(inv => showPhysical ? !inv.electronic : inv.electronic)
                                                            .map((inv) => (
                                                                <tr key={inv.id} className={`guide-row guide-row-${inv.validationStatus.toLowerCase()}`}>
                                                                    <td className="guide-cell-number">
                                                                        {inv.number}{inv.postfix ? `-${inv.postfix}` : ''}
                                                                    </td>
                                                                    <td className="guide-cell-type">
                                                                        <i className={`fas ${inv.icon}`}></i>
                                                                        <span>{inv.type}</span>
                                                                    </td>
                                                                    <td className="guide-cell-format">
                                                                        <span className={`guide-format-badge ${inv.electronic ? 'electronic' : 'physical'}`}>
                                                                            <i className={`fas ${inv.electronic ? FORMAT_ICONS.ELECTRONIC : FORMAT_ICONS.PHYSICAL}`}></i>
                                                                            {inv.electronic ? GUIDE_TAB_UI.FORMAT_ELECTRONIC : GUIDE_TAB_UI.FORMAT_PHYSICAL}
                                                                        </span>
                                                                    </td>
                                                                    <td className="guide-cell-term">
                                                                        {inv.storageTerm || '—'}
                                                                    </td>
                                                                    <td className="guide-cell-count">{inv.itemCount}</td>
                                                                    <td className="guide-cell-count">
                                                                        {inv.hasRecords ? inv.recordCount : '—'}
                                                                    </td>
                                                                    <td className="guide-cell-count">
                                                                        {inv.hasFiles ? inv.fileCount : '—'}
                                                                    </td>
                                                                    <td className="guide-cell-size">
                                                                        {inv.hasFiles ? formatFileSize(inv.fileSize) : '—'}
                                                                    </td>
                                                                    <td className="guide-cell-status">
                                                                        {inv.errorCount > 0 && (
                                                                            <span className="guide-issue-badge error">
                                                                                <i className="fas fa-exclamation-circle"></i>
                                                                                {inv.errorCount}
                                                                            </span>
                                                                        )}
                                                                        {inv.warningCount > 0 && (
                                                                            <span className="guide-issue-badge warning">
                                                                                <i className="fas fa-exclamation-triangle"></i>
                                                                                {inv.warningCount}
                                                                            </span>
                                                                        )}
                                                                        {inv.errorCount === 0 && inv.warningCount === 0 && (
                                                                            <span className="guide-issue-badge valid">
                                                                                <i className="fas fa-check-circle"></i>
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="guide-cell-action">
                                                                        <button
                                                                            className="guide-nav-btn"
                                                                            onClick={() => {
                                                                                navigateTo('inventory', inv.id);
                                                                                onClose();
                                                                            }}
                                                                            title={GUIDE_TAB_UI.NAVIGATE_TOOLTIP}
                                                                        >
                                                                            <i className="fas fa-arrow-right"></i>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                                {guideData.inventoryBreakdown.filter(inv => showPhysical ? !inv.electronic : inv.electronic).length === 0 && (
                                                    <div className="guide-empty-message">
                                                        <i className="fas fa-info-circle"></i>
                                                        <span>
                                                            {showPhysical ? GUIDE_TAB_UI.EMPTY_PHYSICAL : GUIDE_TAB_UI.EMPTY_ELECTRONIC}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Section 3: Type Distribution */}
                                    {guideData && guideData.typeDistribution.length > 0 && (
                                        <div className="project-info-section">
                                            <h3>
                                                <i className="fas fa-th-large"></i>
                                                {GUIDE_TAB_UI.SECTION_TYPE_DISTRIBUTION}
                                            </h3>
                                            <div className="guide-type-grid">
                                                {guideData.typeDistribution.map((dist) => (
                                                    <div key={dist.category} className="guide-type-card">
                                                        <div className="guide-type-card-header">
                                                            <span className="guide-type-name">{dist.displayName}</span>
                                                            <span className="guide-type-inv-count">
                                                                {dist.inventoryCount} US
                                                            </span>
                                                        </div>
                                                        <div className="guide-type-card-stats">
                                                            <div className="guide-type-stat">
                                                                <i className={`fas ${STATS_ICONS.ITEMS}`}></i>
                                                                <span className="guide-type-stat-value">{dist.itemCount}</span>
                                                                <span className="guide-type-stat-label">GV</span>
                                                            </div>
                                                            {(dist.category === CATEGORY_TYPES.DOCUMENTS || dist.category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS) && (
                                                                <div className="guide-type-stat">
                                                                    <i className={`fas ${STATS_ICONS.RECORDS}`}></i>
                                                                    <span className="guide-type-stat-value">{dist.recordCount}</span>
                                                                    <span className="guide-type-stat-label">Dokumenti</span>
                                                                </div>
                                                            )}
                                                            {(dist.category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS || dist.category === CATEGORY_TYPES.ELECTRONIC_MEDIA) && (
                                                                <div className="guide-type-stat">
                                                                    <i className={`fas ${STATS_ICONS.FILES}`}></i>
                                                                    <span className="guide-type-stat-value">{dist.fileCount}</span>
                                                                    <span className="guide-type-stat-label">Faili</span>
                                                                </div>
                                                            )}
                                                            {dist.fileSize > 0 && (
                                                                <div className="guide-type-stat">
                                                                    <i className={`fas ${STATS_ICONS.FILE_SIZE}`}></i>
                                                                    <span className="guide-type-stat-value">{formatFileSize(dist.fileSize)}</span>
                                                                    <span className="guide-type-stat-label">Izmērs</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Tree View Tab */
                                <VerificationTreeView
                                    validationResult={validationResult}
                                    projectData={projectData}
                                    expandAll={false}
                                    onNodeClick={handleNodeClick}
                                    onNavigateToNode={handleNavigateToNode}
                                    filterMode={filterMode}
                                    showPhysical={showPhysical}
                                />
                            )}
                        </>
                    ) : (
                        <div className="verification-empty">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>{VERIFICATION_UI.ERROR_CANNOT_VALIDATE}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="verification-modal-footer">
                    <div className="footer-info">
                        <i className="fas fa-info-circle"></i>
                        <span>
                            {VERIFICATION_UI.FOOTER_INFO_TEXT}
                        </span>
                    </div>
                    <div className="footer-actions">
                        {/* Export buttons - only enabled when ready for OPEX */}
                        <button
                            className="export-btn"
                            onClick={handleExportInventoryList}
                            disabled={!stats?.readyForOPEX || exportInventoryList.isPending}
                            title={stats?.readyForOPEX ? VERIFICATION_UI.EXPORT_US_TOOLTIP_READY : VERIFICATION_UI.EXPORT_US_TOOLTIP_NOT_READY}
                        >
                            {exportInventoryList.isPending ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>{VERIFICATION_UI.EXPORTING_BTN}</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-file-download"></i>
                                    <span>{VERIFICATION_UI.EXPORT_US_BTN}</span>
                                </>
                            )}
                        </button>
                        <button
                            className="export-btn"
                            onClick={() => setShowExportPopup(true)}
                            disabled={exportAcceptanceReport.isPending}
                            title={VERIFICATION_UI.EXPORT_PN_TOOLTIP_READY}
                        >
                            {exportAcceptanceReport.isPending ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>{VERIFICATION_UI.EXPORTING_BTN}</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-file-alt"></i>
                                    <span>{VERIFICATION_UI.EXPORT_PN_BTN}</span>
                                </>
                            )}
                        </button>
                        {/* Generate OPEX button - placeholder for future functionality */}
                        <button
                            className="generate-opex-btn"
                            onClick={() => console.log('Ģenerēt OPEX clicked - functionality pending')}
                            disabled={!stats?.readyForOPEX}
                            title={stats?.readyForOPEX ? 'Ģenerēt OPEX pakotni' : 'Izlabojiet kļūdas, lai ģenerētu OPEX'}
                        >
                            <i className="fas fa-box-open"></i>
                            <span>Ģenerēt OPEX</span>
                        </button>
                        <button className="modal-footer-btn" onClick={onClose}>
                            {VERIFICATION_UI.CLOSE_BTN}
                        </button>
                    </div>
                </div>

                {/* Export Popup */}
                <ExportPopup
                    isOpen={showExportPopup}
                    onClose={() => setShowExportPopup(false)}
                    onExport={handleExportAcceptanceReport}
                    isPending={exportAcceptanceReport.isPending}
                />
            </div>
        </div>
    );
};

export default VerificationModal;
