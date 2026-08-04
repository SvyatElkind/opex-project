import React, { useState, useEffect, useMemo } from 'react';
import VerificationTreeView from './VerificationTreeView';
import { validateProjectForOPEX, determineCategory, CATEGORY_TYPES, CATEGORY_CONSTRAINTS } from '../Utils/InheritanceUtils';
import { useNavigation } from '../Navigation/context/NavigationContext';
import { useRoadmap, ROUTE_STATUS } from '../Roadmap/RoadmapContext';
import { useExportInventoryList, useExportAcceptanceReport, useExportOpex } from '../hooks/useProjects';
import { VERIFICATION_UI, GUIDE_TAB_UI } from '../Constants/Constants';
import { STATS_ICONS, FORMAT_ICONS, getEntityIcon } from '../Constants/iconConstants';
import HelpButton from '../Help/HelpButton';
import OpexProgressModal from '../components/OpexProgressModal';
import './VerificationModal.css';

/** Strip HTML tags from validation messages */
const stripHtml = (html) => {
    if (!html || typeof html !== 'string') return html;
    return html.replace(/<[^>]*>/g, '');
};

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

const OpexPopup = ({ isOpen, onClose, onGenerate, isPending }) => {
    if (!isOpen) return null;

    return (
        <div className="export-popup-overlay" onClick={onClose}>
            <div className="export-popup" onClick={(e) => e.stopPropagation()}>
                <div className="export-popup-header">
                    <h3>Ģenerēt OPEX pakotni</h3>
                </div>
                <div className="export-popup-content">
                    <p>Izvēlieties glabāšanas veidu:</p>
                    <div className="export-popup-options">
                        <button
                            className="export-option-btn"
                            onClick={() => onGenerate(false)}
                            disabled={isPending}
                        >
                            <i className="fas fa-clock"></i>
                            <span>Ilgstoši glabājamās lietas</span>
                        </button>
                        <div className="export-popup-divider"></div>
                        <button
                            className="export-option-btn"
                            onClick={() => onGenerate(true)}
                            disabled={isPending}
                        >
                            <i className="fas fa-archive"></i>
                            <span>Pastāvīgi glabājamās lietas</span>
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

const DISMISSED_WARNINGS_KEY = 'opex_dismissed_warnings';

const loadDismissedWarnings = (projectId) => {
    try {
        const stored = localStorage.getItem(DISMISSED_WARNINGS_KEY);
        if (stored) {
            const all = JSON.parse(stored);
            return all[projectId] || [];
        }
    } catch {}
    return [];
};

const saveDismissedWarnings = (projectId, dismissed) => {
    try {
        const stored = localStorage.getItem(DISMISSED_WARNINGS_KEY);
        const all = stored ? JSON.parse(stored) : {};
        all[projectId] = dismissed;
        localStorage.setItem(DISMISSED_WARNINGS_KEY, JSON.stringify(all));
    } catch {}
};

const VerificationModal = ({ isOpen, onClose, projectData, onOpenSigners, onOpenRoadmap, onToast }) => {
    const [validationResult, setValidationResult] = useState(null);
    const [filterMode, setFilterMode] = useState('all');
    const [showPhysical, setShowPhysical] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [activeTab, setActiveTab] = useState('pārskats');
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [showOpexPopup, setShowOpexPopup] = useState(false);
    const [opexProgressOpen, setOpexProgressOpen] = useState(false);
    const [opexIncludeLongTerm, setOpexIncludeLongTerm] = useState(true);
    const [dismissedWarnings, setDismissedWarnings] = useState([]);
    const { navigateTo } = useNavigation();
    const { getRoadmaps, calculateProgress } = useRoadmap();

    // Load dismissed warnings for this project
    React.useEffect(() => {
        if (projectData?.id) {
            setDismissedWarnings(loadDismissedWarnings(projectData.id));
        }
    }, [projectData?.id]);

    const dismissWarning = (warningKey) => {
        const updated = [...dismissedWarnings, warningKey];
        setDismissedWarnings(updated);
        saveDismissedWarnings(projectData.id, updated);
    };

    const dismissAllWarnings = (warnings) => {
        const keys = warnings.map(w => `${w.label}::${w.message}`);
        const updated = [...new Set([...dismissedWarnings, ...keys])];
        setDismissedWarnings(updated);
        saveDismissedWarnings(projectData.id, updated);
    };

    const resetDismissedWarnings = () => {
        setDismissedWarnings([]);
        saveDismissedWarnings(projectData.id, []);
    };

    const isWarningDismissed = (issue) => {
        return dismissedWarnings.includes(`${issue.label}::${issue.message}`);
    };

    const exportInventoryList = useExportInventoryList();
    const exportAcceptanceReport = useExportAcceptanceReport();
    const exportOpex = useExportOpex();

    const stats = useMemo(() => {
        if (!validationResult || !validationResult.inventoryValidations) {
            return null;
        }

        const { summary, inventoryValidations } = validationResult;


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


        let totalRecords = 0;
        let totalFiles = 0;
        let totalFileSize = 0;
        let physicalItems = 0;
        let electronicItems = 0;
        if (projectData?.institution?.fond?.inventories) {
            projectData.institution.fond.inventories.forEach(inventory => {
                if (inventory.items) {
                    inventory.items.forEach(item => {

                        if (inventory.electronic) {
                            electronicItems++;
                        } else {
                            physicalItems++;
                        }

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

                        ['photo_records', 'video_records', 'audio_records'].forEach(mediaKey => {
                            if (item[mediaKey]) {
                                item[mediaKey].forEach(mediaRecord => {
                                    const files = mediaRecord.files || [];
                                    totalFiles += files.length;
                                    files.forEach(file => {
                                        totalFileSize += file.size || 0;
                                    });
                                });
                            }
                        });
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

    const guideData = useMemo(() => {
        if (!projectData?.institution?.fond?.inventories || !validationResult?.inventoryValidations) {
            return null;
        }

        const inventories = projectData.institution.fond.inventories;
        const invValidations = validationResult.inventoryValidations;


        const inventoryBreakdown = inventories.map((inventory) => {
            const category = determineCategory(inventory.type, inventory.electronic);


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
                            item[mediaKey].forEach(mediaRecord => {
                                const files = mediaRecord.files || [];
                                fileCount += files.length;
                                files.forEach(file => {
                                    fileSize += file.size || 0;
                                });
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

    const routeGuideData = useMemo(() => {
        if (!projectData?.id || !guideData) return null;

        const routes = getRoadmaps(projectData.id);
        if (!routes || routes.length === 0) return null;

        const activeRoutes = routes.filter(r =>
            r.goals?.totalItems > 0 && r.status !== ROUTE_STATUS.ARCHIVED
        );

        if (activeRoutes.length === 0) return null;

        const invValidations = validationResult?.inventoryValidations || [];

        return activeRoutes.map(route => {
            const progress = calculateProgress(projectData, route);


            const routeInventories = route.inventoryNumber
                ? guideData.inventoryBreakdown.filter(inv => inv.number === route.inventoryNumber)
                : guideData.inventoryBreakdown;


            const inventories = projectData.institution.fond.inventories;
            const issues = [];
            routeInventories.forEach(inv => {
                const invVal = invValidations.find(v =>
                    v.inventory?.id === inv.id || v.inventory?.number === inv.number
                );
                if (!invVal?.validation) return;


                const inventoryData = inventories.find(i => i.id === inv.id);
                const invLabel = `US ${inv.number}${inv.postfix ? `-${inv.postfix}` : ''}`;


                (invVal.validation.errors || []).forEach(err => {
                    if (err.id !== 'ITEM_VALIDATION_FAILED') {
                        issues.push({
                            severity: 'error',
                            message: err.message,
                            label: invLabel,
                            navType: 'inventory',
                            navId: inv.id
                        });
                    }
                });


                (invVal.validation.warnings || []).forEach(warn => {
                    issues.push({
                        severity: 'warning',
                        message: warn.message,
                        label: invLabel,
                        navType: 'inventory',
                        navId: inv.id
                    });
                });


                const items = inventoryData?.items || [];
                (invVal.validation.itemValidations || []).forEach((itemVal, itemIdx) => {
                    if (!itemVal || itemVal.status === 'VALID') return;
                    const item = items[itemIdx];
                    const itemNumber = item?.number || item?.title || (itemIdx + 1);
                    const itemLabel = `${invLabel} → GV ${itemNumber}`;

                    (itemVal.errors || []).forEach(err => {
                        if (err.id !== 'RECORD_VALIDATION_FAILED') {
                            issues.push({
                                severity: 'error',
                                message: err.message,
                                label: itemLabel,
                                navType: 'item',
                                navId: inv.id,
                                itemId: item?.id
                            });
                        }
                    });

                    (itemVal.warnings || []).forEach(warn => {
                        issues.push({
                            severity: 'warning',
                            message: warn.message,
                            label: itemLabel,
                            navType: 'item',
                            navId: inv.id,
                            itemId: item?.id
                        });
                    });


                    const records = item?.records || [];
                    (itemVal.recordValidations || []).forEach((recVal, recIdx) => {
                        if (!recVal || recVal.status === 'VALID') return;
                        const record = records[recIdx];
                        const recNumber = record?.number || record?.title || (recIdx + 1);
                        const recLabel = `${itemLabel} → Dok. ${recNumber}`;

                        (recVal.errors || []).forEach(err => {
                            issues.push({
                                severity: 'error',
                                message: err.message,
                                label: recLabel,
                                navType: 'record',
                                navId: inv.id,
                                itemId: item?.id,
                                recordId: record?.id
                            });
                        });

                        (recVal.warnings || []).forEach(warn => {
                            issues.push({
                                severity: 'warning',
                                message: warn.message,
                                label: recLabel,
                                navType: 'record',
                                navId: inv.id,
                                itemId: item?.id,
                                recordId: record?.id
                            });
                        });
                    });
                });
            });

            return {
                route,
                progress,
                inventories: routeInventories,
                issues
            };
        });
    }, [projectData, guideData, validationResult, getRoadmaps, calculateProgress]);

    useEffect(() => {
        if (isOpen && projectData) {
            setIsValidating(true);
            try {
                const result = validateProjectForOPEX(projectData);
                setValidationResult(result);

                if (result && result.inventoryValidations) {
                    const totalErrors = result.inventoryValidations.reduce((sum, invVal) => {
                        return sum + (invVal.validation.details?.criticalIssues || 0);
                    }, 0);
                    setFilterMode(totalErrors > 0 ? 'errors' : 'all');
                } else {
                    setFilterMode('all');
                }
            } catch (error) {
                setFilterMode('all');
            } finally {
                setIsValidating(false);
            }
        }
    }, [isOpen, projectData]);

    if (!isOpen) {
        return null;
    }

    const handleNodeClick = (node, level) => {
    };

    const handleNavigateToNode = (node, level, context) => {
        switch (level) {
            case 'inventory':
                navigateTo('inventory', node.id);
                break;
            case 'item':
                navigateTo('item', node.id, context?.inventoryId);
                break;
            case 'record':
                navigateTo('record', node.id, context?.inventoryId, context?.itemId);
                break;
            case 'file':
                if (context?.recordId) {
                    navigateTo('record', context.recordId, context?.inventoryId, context?.itemId, { tab: 'files' });
                }
                break;
            default:
                return;
        }


        onClose();
    };

    const handleExportInventoryList = () => {
        if (!projectData?.id) {
            return;
        }
        exportInventoryList.mutate(projectData.id, {
            onSuccess: (result) => {
                const path = result?.path || projectData?.folder || '';
                onToast?.(
                    'Uzskaites saraksts izveidots',
                    path
                        ? `Fails saglabāts: ${path}`
                        : 'Fails saglabāts projekta direktorijā.'
                );
            },
            onError: (err) => {
                onToast?.('Eksports neizdevās', err?.message || 'Nezināma kļūda');
            },
        });
    };

    const handleExportAcceptanceReport = (electronic) => {
        if (!projectData?.id) {
            return;
        }
        exportAcceptanceReport.mutate(
            { projectId: projectData.id, electronic },
            {
                onSuccess: (result) => {
                    const path = result?.path || projectData?.folder || '';
                    const variantLabel = electronic ? 'elektronisko dokumentu' : 'fizisko dokumentu';
                    onToast?.(
                        'Pieņemšanas-nodošanas akts izveidots',
                        path
                            ? `${variantLabel} akts saglabāts: ${path}`
                            : `${variantLabel} akts saglabāts projekta direktorijā.`
                    );
                },
                onError: (err) => {
                    onToast?.('Eksports neizdevās', err?.message || 'Nezināma kļūda');
                },
            }
        );
        setShowExportPopup(false);
    };

    const handleGenerateOpex = (includeLongTerm) => {
        if (!projectData?.id) {
            return;
        }
        setOpexIncludeLongTerm(includeLongTerm);
        setShowOpexPopup(false);
        setOpexProgressOpen(true);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

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

                <div className="verification-modal-header">
                    <div className="modal-header-top">
                        <div className="modal-header-left">
                            <h1>{VERIFICATION_UI.MODAL_TITLE}</h1>
                        </div>
                        <HelpButton chapterId="verification" sectionId="verification-view" iconOnly={true} className="small header-help-btn" />
                    </div>


                    {!isValidating && validationResult && stats && (
                        <div className="verification-stats-bar">
                            <div className="stats-bar-left">

                                {stats.importedInventories > 0 && (
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.IMPORTED_INVENTORY}`}></i>
                                    <span className="stat-badge-label">{VERIFICATION_UI.STATS_US_IMPORTED}</span>
                                    <span className="stat-badge-value">{stats.importedInventories}</span>
                                </div>
                                )}

                                {stats.createdInventories > 0 && (
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.CREATED_INVENTORY}`}></i>
                                    <span className="stat-badge-label">{VERIFICATION_UI.STATS_US_CREATED}</span>
                                    <span className="stat-badge-value">{stats.createdInventories}</span>
                                </div>
                                )}

                                {stats.totalItems > 0 && (
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.ITEMS}`}></i>
                                    <span className="stat-badge-label">{VERIFICATION_UI.STATS_VIENĪBAS}</span>
                                    <span className="stat-badge-value">{stats.totalItems}</span>
                                </div>
                                )}

                                {stats.totalRecords > 0 && (
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.RECORDS}`}></i>
                                    <span className="stat-badge-label">{VERIFICATION_UI.STATS_DOKUMENTI}</span>
                                    <span className="stat-badge-value">{stats.totalRecords}</span>
                                </div>
                                )}

                                {stats.totalFiles > 0 && (
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.FILES}`}></i>
                                    <span className="stat-badge-label">{VERIFICATION_UI.STATS_FAILI}</span>
                                    <span className="stat-badge-value">{stats.totalFiles}</span>
                                </div>
                                )}

                                {stats.physicalItems > 0 && (
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.PHYSICAL_ITEMS}`}></i>
                                    <span className="stat-badge-label">Fiziskās GV</span>
                                    <span className="stat-badge-value">{stats.physicalItems}</span>
                                </div>
                                )}

                                {stats.electronicItems > 0 && (
                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.ELECTRONIC_ITEMS}`}></i>
                                    <span className="stat-badge-label">Elektroniskās GV</span>
                                    <span className="stat-badge-value">{stats.electronicItems}</span>
                                </div>
                                )}


                                <div className="stat-badge">
                                    <i className={`fas ${STATS_ICONS.FILE_SIZE}`}></i>
                                    <span className="stat-badge-label">Izmērs</span>
                                    <span className="stat-badge-value">{formatFileSize(stats.totalFileSize)}</span>
                                </div>
                            </div>

                            <div className="stats-bar-right">

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


                                    {guideData && guideData.typeDistribution.length > 0 && (
                                        <div className="project-info-section">
                                            <h3>
                                                <i className="fas fa-th-large"></i>
                                                {GUIDE_TAB_UI.SECTION_TYPE_DISTRIBUTION}
                                            </h3>
                                            <div className="guide-type-strip">
                                                {guideData.typeDistribution.map((dist) => (
                                                    <div key={dist.category} className="guide-type-chip">
                                                        <span className="guide-type-chip-name">{dist.displayName}</span>
                                                        <div className="guide-type-chip-stats">
                                                            <span className="guide-type-chip-stat">
                                                                <i className={`fas ${STATS_ICONS.IMPORTED_INVENTORY}`}></i>
                                                                {dist.inventoryCount}
                                                            </span>
                                                            <span className="guide-type-chip-stat">
                                                                <i className={`fas ${STATS_ICONS.ITEMS}`}></i>
                                                                {dist.itemCount}
                                                            </span>
                                                            {(dist.category === CATEGORY_TYPES.DOCUMENTS || dist.category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS) && (
                                                                <span className="guide-type-chip-stat">
                                                                    <i className={`fas ${STATS_ICONS.RECORDS}`}></i>
                                                                    {dist.recordCount}
                                                                </span>
                                                            )}
                                                            {(dist.category === CATEGORY_TYPES.ELECTRONIC_DOCUMENTS || dist.category === CATEGORY_TYPES.ELECTRONIC_MEDIA) && (
                                                                <span className="guide-type-chip-stat">
                                                                    <i className={`fas ${STATS_ICONS.FILES}`}></i>
                                                                    {dist.fileCount}
                                                                </span>
                                                            )}
                                                            {dist.fileSize > 0 && (
                                                                <span className="guide-type-chip-stat">
                                                                    <i className={`fas ${STATS_ICONS.FILE_SIZE}`}></i>
                                                                    {formatFileSize(dist.fileSize)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}


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
                                                        {guideData.inventoryBreakdown.map((inv) => (
                                                            <tr key={inv.id} className={`guide-row guide-row-${inv.validationStatus.toLowerCase()}`}>
                                                                <td className="guide-cell-number">
                                                                    {inv.number}{inv.postfix ? `-${inv.postfix}` : ''}
                                                                </td>
                                                                <td>
                                                                    <span className="guide-cell-type-inner">
                                                                        <i className={`fas ${inv.icon}`}></i>
                                                                        <span>{inv.type}</span>
                                                                    </span>
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
                                            </div>
                                        </div>
                                    )}

                                </div>
                            ) : activeTab === 'ceļvedis' ? (
                                /* Route Guide Tab - shows only inventories in active routes */
                                <div className="project-guide-tab">
                                    {routeGuideData ? (
                                        routeGuideData.map(({ route, progress, inventories, issues }) => (
                                            <div key={route.id} className="project-info-section guide-route-section">
                                                <h3>
                                                    <i className="fas fa-route"></i>
                                                    {route.inventoryName || `Maršruts`}
                                                    <span className={`guide-route-status ${route.status}`}>
                                                        {route.status === 'completed' ? 'Pabeigts' : 'Aktīvs'}
                                                    </span>
                                                </h3>


                                                <div className="guide-route-progress">
                                                    {progress.items.target > 0 && (
                                                        <div className="guide-progress-row">
                                                            <div className="guide-progress-label">
                                                                <i className={`fas ${STATS_ICONS.ITEMS}`}></i>
                                                                <span>GV</span>
                                                            </div>
                                                            <div className="guide-progress-bar">
                                                                <div
                                                                    className="guide-progress-fill"
                                                                    style={{ width: `${progress.items.percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="guide-progress-value">
                                                                {progress.items.current}/{progress.items.target}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {progress.records.target > 0 && (
                                                        <div className="guide-progress-row">
                                                            <div className="guide-progress-label">
                                                                <i className={`fas ${STATS_ICONS.RECORDS}`}></i>
                                                                <span>Dokumenti</span>
                                                            </div>
                                                            <div className="guide-progress-bar">
                                                                <div
                                                                    className="guide-progress-fill"
                                                                    style={{ width: `${progress.records.percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="guide-progress-value">
                                                                {progress.records.current}/{progress.records.target}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {progress.files.target > 0 && (
                                                        <div className="guide-progress-row">
                                                            <div className="guide-progress-label">
                                                                <i className={`fas ${STATS_ICONS.FILES}`}></i>
                                                                <span>Faili</span>
                                                            </div>
                                                            <div className="guide-progress-bar">
                                                                <div
                                                                    className="guide-progress-fill"
                                                                    style={{ width: `${progress.files.percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="guide-progress-value">
                                                                {progress.files.current}/{progress.files.target}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="guide-progress-overall">
                                                        <span>Kopējais progress: {progress.overall}%</span>
                                                    </div>
                                                </div>


                                                {(() => {
                                                    const activeWarnings = issues.filter(i => i.severity === 'warning' && !isWarningDismissed(i));
                                                    const errors = issues.filter(i => i.severity === 'error');
                                                    const dismissedCount = issues.filter(i => i.severity === 'warning' && isWarningDismissed(i)).length;
                                                    const visibleIssues = [...errors, ...activeWarnings];

                                                    return visibleIssues.length > 0 || dismissedCount > 0 ? (
                                                    <div className="guide-issues-list">
                                                        <h4 className="guide-issues-header">
                                                            <i className="fas fa-exclamation-circle"></i>
                                                            <span>Problēmas ({errors.length} kļūdas, {activeWarnings.length} brīdinājumi{dismissedCount > 0 ? `, ${dismissedCount} ignorēti` : ''})</span>
                                                            <div className="guide-issues-actions">
                                                                {activeWarnings.length > 0 && (
                                                                    <button
                                                                        className="guide-nav-btn guide-dismiss-btn"
                                                                        onClick={() => dismissAllWarnings(activeWarnings)}
                                                                        title="Ignorēt visus brīdinājumus"
                                                                    >
                                                                        <i className="fas fa-eye-slash"></i>
                                                                        Ignorēt brīdinājumus
                                                                    </button>
                                                                )}
                                                                {dismissedCount > 0 && (
                                                                    <button
                                                                        className="guide-nav-btn guide-dismiss-btn"
                                                                        onClick={resetDismissedWarnings}
                                                                        title="Atjaunot visus ignorētos brīdinājumus"
                                                                    >
                                                                        <i className="fas fa-undo"></i>
                                                                        Atjaunot ({dismissedCount})
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </h4>
                                                        {visibleIssues.map((issue, idx) => (
                                                            <div key={idx} className={`guide-issue-row guide-issue-row-${issue.severity}`}>
                                                                <i className={`fas ${issue.severity === 'error' ? 'fa-times-circle' : 'fa-exclamation-triangle'}`}></i>
                                                                <div className="guide-issue-content">
                                                                    <span className="guide-issue-label">{issue.label}</span>
                                                                    <span className="guide-issue-message">{stripHtml(issue.message)}</span>
                                                                </div>
                                                                <div className="guide-issue-actions">
                                                                    {issue.severity === 'warning' && (
                                                                        <button
                                                                            className="guide-nav-btn guide-dismiss-single"
                                                                            onClick={() => dismissWarning(`${issue.label}::${issue.message}`)}
                                                                            title="Ignorēt šo brīdinājumu"
                                                                        >
                                                                            <i className="fas fa-eye-slash"></i>
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        className="guide-nav-btn"
                                                                        onClick={() => {
                                                                            if (issue.navType === 'record' && issue.recordId) {
                                                                                navigateTo('record', issue.recordId, issue.navId, issue.itemId);
                                                                            } else if (issue.navType === 'item' && issue.itemId) {
                                                                                navigateTo('item', issue.itemId, issue.navId);
                                                                            } else {
                                                                                navigateTo('inventory', issue.navId);
                                                                            }
                                                                            onClose();
                                                                        }}
                                                                        title="Pāriet uz problēmu"
                                                                    >
                                                                        <i className="fas fa-arrow-right"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    ) : null;
                                                })()}


                                                {inventories.length > 0 && (
                                                    <div className="guide-table-wrapper">
                                                        <table className="guide-inventory-table">
                                                            <thead>
                                                                <tr>
                                                                    <th className="guide-th-number">{GUIDE_TAB_UI.COL_NUMBER}</th>
                                                                    <th className="guide-th-type">{GUIDE_TAB_UI.COL_TYPE}</th>
                                                                    <th className="guide-th-format">{GUIDE_TAB_UI.COL_FORMAT}</th>
                                                                    <th className="guide-th-count">{GUIDE_TAB_UI.COL_ITEMS}</th>
                                                                    <th className="guide-th-count">{GUIDE_TAB_UI.COL_RECORDS}</th>
                                                                    <th className="guide-th-count">{GUIDE_TAB_UI.COL_FILES}</th>
                                                                    <th className="guide-th-size">{GUIDE_TAB_UI.COL_SIZE}</th>
                                                                    <th className="guide-th-status">{GUIDE_TAB_UI.COL_STATUS}</th>
                                                                    <th className="guide-th-action"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {inventories.map((inv) => (
                                                                    <tr key={inv.id} className={`guide-row guide-row-${inv.validationStatus.toLowerCase()}`}>
                                                                        <td className="guide-cell-number">
                                                                            {inv.number}{inv.postfix ? `-${inv.postfix}` : ''}
                                                                        </td>
                                                                        <td>
                                                                            <span className="guide-cell-type-inner">
                                                                                <i className={`fas ${inv.icon}`}></i>
                                                                                <span>{inv.type}</span>
                                                                            </span>
                                                                        </td>
                                                                        <td className="guide-cell-format">
                                                                            <span className={`guide-format-badge ${inv.electronic ? 'electronic' : 'physical'}`}>
                                                                                <i className={`fas ${inv.electronic ? FORMAT_ICONS.ELECTRONIC : FORMAT_ICONS.PHYSICAL}`}></i>
                                                                                {inv.electronic ? GUIDE_TAB_UI.FORMAT_ELECTRONIC : GUIDE_TAB_UI.FORMAT_PHYSICAL}
                                                                            </span>
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
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="guide-empty-message">
                                            <i className="fas fa-compass"></i>
                                            <span>Nav aktīvu maršrutu. Izveidojiet maršrutu, lai redzētu progresu.</span>
                                            {onOpenRoadmap && (
                                                <button
                                                    className="guide-create-route-btn"
                                                    onClick={() => {
                                                        onClose();
                                                        onOpenRoadmap();
                                                    }}
                                                >
                                                    <i className="fas fa-plus-circle"></i>
                                                    <span>Izveidot maršrutu</span>
                                                </button>
                                            )}
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
                                    dismissWarning={dismissWarning}
                                    dismissAllWarnings={dismissAllWarnings}
                                    isWarningDismissed={isWarningDismissed}
                                    dismissedWarningCount={dismissedWarnings.length}
                                    resetDismissedWarnings={resetDismissedWarnings}
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


                <div className="verification-modal-footer">
                    <div className="footer-info">
                        <i className="fas fa-info-circle"></i>
                        <span>
                            {VERIFICATION_UI.FOOTER_INFO_TEXT}
                        </span>
                    </div>
                    <div className="footer-actions">

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

                        <button
                            className="generate-opex-btn"
                            onClick={() => setShowOpexPopup(true)}
                            disabled={!stats?.readyForOPEX || exportOpex.isPending}
                            title={stats?.readyForOPEX ? 'Ģenerēt OPEX pakotni' : 'Izlabojiet kļūdas, lai ģenerētu OPEX'}
                        >
                            {exportOpex.isPending ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>{VERIFICATION_UI.EXPORTING_BTN}</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-box-open"></i>
                                    <span>Ģenerēt OPEX</span>
                                </>
                            )}
                        </button>
                        <button className="modal-footer-btn" onClick={onClose}>
                            {VERIFICATION_UI.CLOSE_BTN}
                        </button>
                    </div>
                </div>


                <ExportPopup
                    isOpen={showExportPopup}
                    onClose={() => setShowExportPopup(false)}
                    onExport={handleExportAcceptanceReport}
                    isPending={exportAcceptanceReport.isPending}
                />


                <OpexPopup
                    isOpen={showOpexPopup}
                    onClose={() => setShowOpexPopup(false)}
                    onGenerate={handleGenerateOpex}
                    isPending={exportOpex.isPending}
                />

                {opexProgressOpen && (
                    <OpexProgressModal
                        projectData={projectData}
                        includeLongTerm={opexIncludeLongTerm}
                        onClose={() => setOpexProgressOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default VerificationModal;
