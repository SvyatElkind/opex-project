import React from 'react';
import { getEntityIcon, HIERARCHY_ICONS } from '../Constants/iconConstants';
import './TreeNode.css';

const STATUS_ICONS = {
    VALID: {
        icon: 'fa-check-circle',
        color: 'var(--color-primary)',
        bgColor: 'rgba(var(--color-primary-rgb), 0.1)',
        label: 'Valid'
    },
    WARNING: {
        icon: 'fa-exclamation-triangle',
        color: 'var(--color-warning)',
        bgColor: 'rgba(var(--color-warning-rgb, 225, 183, 129), 0.15)',
        label: 'Warning'
    },
    ERROR: {
        icon: 'fa-times-circle',
        color: 'var(--color-error)',
        bgColor: 'rgba(var(--color-error-rgb, 116, 66, 69), 0.1)',
        label: 'Error'
    }
};

const getTypeIcon = (level, entity) => {
    switch (level) {
        case 'inventory': {
            const inventoryType = entity.type || 'Tekstuāls';
            const isElectronic = entity.electronic !== undefined ? entity.electronic : true;
            return getEntityIcon(inventoryType, isElectronic);
        }
        case 'item': {
            const itemInventoryType = entity.inventory_type || 'Tekstuāls';
            const itemIsElectronic = entity.is_electronic !== undefined ? entity.is_electronic : true;
            return getEntityIcon(itemInventoryType, itemIsElectronic);
        }
        case 'record':
            return HIERARCHY_ICONS.RECORD;
        case 'file':
            return HIERARCHY_ICONS.FILE;
        default:
            return 'fa-question-circle';
    }
};

const getLevelIcon = (level, entity) => {
    switch (level) {
        case 'inventory':
            return entity.from_report ? 'fa-file-import' : 'fa-file-medical';
        default:
            return null;
    }
};

const LATVIAN_LABELS = {
    inventory: 'Uzskaites Saraksts',
    item: 'Glabājamā vienība',
    record: 'Dokuments',
    file: 'Fails'
};

const TreeNode = ({
    nodeId,
    level,
    entity,
    validation,
    expanded,
    onToggle,
    onSelect,
    onNavigate,
    children,
    inventoryNumber, // Inventory number for US# display
    onShowErrors, // Callback to show errors in separate panel
    hasChildren, // Explicit prop indicating if node can have children
    isSelected // Whether this node is currently selected in error panel
}) => {
    const statusConfig = STATUS_ICONS[validation.status] || STATUS_ICONS.ERROR;

    const getNodeLabel = () => {
        switch (level) {
            case 'inventory':
                return inventoryNumber ? `US ${inventoryNumber}` : 'US N/A';
            case 'item':
                const itemNumber = entity.number || entity.item_number || 'N/A';
                const itemTitle = entity.title || 'Bez nosaukuma';
                return `${itemNumber}. ${itemTitle}`;
            case 'record':
                return entity.title || 'Bez nosaukuma';
            case 'file':
                return entity.original_name || 'Bez nosaukuma';
            default:
                return 'Nezināms';
        }
    };

    const getNodeType = () => {
        return LATVIAN_LABELS[level] || level;
    };

    const getInventoryTypeLabel = () => {
        if (level === 'inventory') {
            return entity.type || 'Tekstuāls';
        }
        return null;
    };

    const getItemCount = () => {
        if (level === 'inventory' && entity.items) {
            return entity.items.length;
        }
        return 0;
    };

    const getRecordCount = () => {
        if (level === 'item' && entity.records) {
            return entity.records.length;
        }
        return 0;
    };

    const getFileCount = () => {
        if (level === 'item') {
            let count = 0;
            if (entity.records) {
                entity.records.forEach(record => {
                    if (record.files) {
                        count += record.files.length;
                    }
                });
            }
            if (entity.photo_records) {
                count += entity.photo_records.length;
            }
            if (entity.video_records) {
                count += entity.video_records.length;
            }
            if (entity.audio_records) {
                count += entity.audio_records.length;
            }
            return count;
        } else if (level === 'record' && entity.files) {
            return entity.files.length;
        }
        return 0;
    };

    const getStorageType = () => {
        if (level === 'inventory') {
            const storageTerm = entity.storage_term;

            if (storageTerm) {
                if (storageTerm.includes('Pastāvīgi')) {
                    return 'Pastāvīgi';
                } else if (storageTerm.includes('Ilgstoši')) {
                    return 'Ilgstoši glabājamās';
                }
            }
        }
        return null;
    };

    const formatDateDDMMYYYY = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const formatYear = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.getFullYear();
    };

    const getDateRange = () => {
        if (level === 'item') {
            const startDate = entity.start_date;
            const endDate = entity.end_date;

            if (startDate && endDate) {
                const formattedStart = formatDateDDMMYYYY(startDate);
                const formattedEnd = formatDateDDMMYYYY(endDate);
                if (formattedStart !== formattedEnd) {
                    return `${formattedStart} - ${formattedEnd}`;
                }
                return formattedStart;
            } else if (startDate) {
                return formatDateDDMMYYYY(startDate);
            }
        } else if (level === 'inventory') {
            const startDate = entity.start_date;
            const endDate = entity.end_date;

            if (startDate && endDate) {
                const startYear = formatYear(startDate);
                const endYear = formatYear(endDate);
                if (startYear !== endYear) {
                    return `${startYear} - ${endYear}`;
                }
                return startYear;
            } else if (startDate) {
                return formatYear(startDate);
            }
        }
        return null;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const hasErrors = validation.errors && validation.errors.length > 0;
    const hasWarnings = validation.warnings && validation.warnings.length > 0;
    const hasIssues = hasErrors || hasWarnings;
    const isValid = validation.status === 'VALID';

    const shouldShowErrorIndicator = !isValid && (!hasChildren || !expanded);

    const typeLabel = getInventoryTypeLabel();
    const itemCount = getItemCount();
    const recordCount = getRecordCount();
    const fileCount = getFileCount();
    const storageType = getStorageType();
    const dateRange = getDateRange();
    const isElectronicTextual = level === 'item' && entity.is_electronic && entity.inventory_type === 'Tekstuāls';

    return (
        <div className={`tree-node tree-node-${level}${isSelected ? ' tree-node-selected' : ''}`} data-status={validation.status}>
            <div className="tree-node-header" onClick={onSelect}>
                {hasChildren ? (
                    <button
                        className="expand-toggle"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle();
                        }}
                        aria-label={expanded ? 'Collapse' : 'Expand'}
                    >
                        <i className={`fas ${expanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                    </button>
                ) : (
                    <div className="expand-toggle-spacer"></div>
                )}

                <div className="type-icon">
                    <i className={`fas ${getTypeIcon(level, entity)}`}></i>
                </div>

                <div className="node-info">
                    <span className="node-label">{getNodeLabel()}</span>

                    {typeLabel && (
                        <span className="node-meta">{typeLabel}</span>
                    )}

                    {level === 'inventory' && itemCount > 0 && (
                        <span className="node-meta">GV: {itemCount}</span>
                    )}

                    {level === 'inventory' && dateRange && (
                        <span className="node-meta">{dateRange}</span>
                    )}

                    {level === 'inventory' && storageType && (
                        <span className="node-meta">{storageType}</span>
                    )}

                    {level === 'inventory' && (
                        <span className={`node-meta opex-badge ${isValid ? 'opex-ready' : 'opex-not-ready'}`}>
                            OPEX
                        </span>
                    )}

                    {level === 'item' && dateRange && (
                        <span className="node-meta">{dateRange}</span>
                    )}

                    {isElectronicTextual && recordCount > 0 && (
                        <span className="node-meta">Dok: {recordCount}</span>
                    )}

                    {level === 'item' && fileCount > 0 && (
                        <span className="node-meta">Faili: {fileCount}</span>
                    )}

                    {level === 'record' && fileCount > 0 && (
                        <span className="node-meta">Faili: {fileCount}</span>
                    )}

                    {level === 'file' && entity.file_size && (
                        <span className="file-size">{formatFileSize(entity.file_size)}</span>
                    )}
                </div>

                {getLevelIcon(level, entity) && (
                    <div className="level-icon">
                        <i className={`fas ${getLevelIcon(level, entity)}`}></i>
                    </div>
                )}

                {isValid ? (
                    <div className="status-indicator status-valid" title="Viss kārtībā">
                        <i className="fas fa-check-circle"></i>
                    </div>
                ) : shouldShowErrorIndicator ? (
                    hasErrors ? (
                        <button
                            className="show-errors-btn has-errors"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onShowErrors) {
                                    onShowErrors({
                                        entity,
                                        level,
                                        validation,
                                        label: getNodeLabel()
                                    });
                                }
                            }}
                            title="Skatīt kļūdas un brīdinājumus"
                        >
                            <i className="fas fa-exclamation-circle"></i>
                            <span className="error-count">{validation.errors.length + validation.warnings.length}</span>
                        </button>
                    ) : hasWarnings ? (
                        <button
                            className="show-errors-btn has-warnings"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onShowErrors) {
                                    onShowErrors({
                                        entity,
                                        level,
                                        validation,
                                        label: getNodeLabel()
                                    });
                                }
                            }}
                            title="Skatīt brīdinājumus"
                        >
                            <i className="fas fa-exclamation-triangle"></i>
                            <span className="error-count">{validation.warnings.length}</span>
                        </button>
                    ) : null
                ) : null}

                {onNavigate && (
                    <button
                        className="navigate-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate();
                        }}
                        title="Pāriet uz šo elementu"
                    >
                        <i className="fas fa-arrow-right"></i>
                    </button>
                )}
            </div>

            {expanded && hasChildren && (
                <div className="tree-node-children">
                    {children}
                </div>
            )}
        </div>
    );
};

export default TreeNode;
