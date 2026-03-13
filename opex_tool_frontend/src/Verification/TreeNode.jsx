import React from 'react';
import { getEntityIcon, HIERARCHY_ICONS } from '../Constants/iconConstants';
import './TreeNode.css';

/**
 * Status icon configurations
 */
const STATUS_ICONS = {
    VALID: {
        icon: 'fa-check-circle',
        color: '#10b981',
        bgColor: '#d1fae5',
        label: 'Valid'
    },
    WARNING: {
        icon: 'fa-exclamation-triangle',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        label: 'Warning'
    },
    ERROR: {
        icon: 'fa-times-circle',
        color: '#ef4444',
        bgColor: '#fee2e2',
        label: 'Error'
    }
};

/**
 * Get type icon (left side) - indicates the content type
 */
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

/**
 * Get level icon (right side) - indicates entity status/origin
 */
const getLevelIcon = (level, entity) => {
    switch (level) {
        case 'inventory':
            // Imported vs created status
            return entity.from_report ? 'fa-file-import' : 'fa-file-medical';

        default:
            return null; // No level icon for other types
    }
};

/**
 * Latvian level labels
 */
const LATVIAN_LABELS = {
    inventory: 'Uzskaites Saraksts',
    item: 'Glabājamā vienība',
    record: 'Dokuments',
    file: 'Fails'
};

/**
 * TreeNode Component
 * Represents a single node in the verification tree
 */
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
                // Display inventory number (e.g., US 1, US 2)
                return inventoryNumber ? `US ${inventoryNumber}` : 'US N/A';
            case 'item':
                // Display item with number prefix
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
        // Only show type label on inventory nodes
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
            // Also count media records for non-textual items
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
            // Check for storage term at inventory level
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

    // Only show error indicators when:
    // 1. Node is invalid (has errors/warnings)
    // 2. Either node has no children OR node is collapsed
    // When expanded with children, errors are shown on the child nodes themselves
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
                {/* Expand/Collapse Button - Only render if has children */}
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

                {/* Type Icon - Content type (left side) */}
                <div className="type-icon">
                    <i className={`fas ${getTypeIcon(level, entity)}`}></i>
                </div>

                {/* Node Info */}
                <div className="node-info">
                    <span className="node-label">{getNodeLabel()}</span>

                    {/* Inventory/Item type label */}
                    {typeLabel && (
                        <span className="node-meta">{typeLabel}</span>
                    )}

                    {/* Inventory-specific info - GV count, Date, Storage type */}
                    {level === 'inventory' && itemCount > 0 && (
                        <span className="node-meta">GV: {itemCount}</span>
                    )}

                    {level === 'inventory' && dateRange && (
                        <span className="node-meta">{dateRange}</span>
                    )}

                    {level === 'inventory' && storageType && (
                        <span className="node-meta">{storageType}</span>
                    )}

                    {/* OPEX readiness badge for inventory */}
                    {level === 'inventory' && (
                        <span className={`node-meta opex-badge ${isValid ? 'opex-ready' : 'opex-not-ready'}`}>
                            OPEX
                        </span>
                    )}

                    {/* Item-specific info - Date */}
                    {level === 'item' && dateRange && (
                        <span className="node-meta">{dateRange}</span>
                    )}

                    {/* Record and File counts for electronic textual items */}
                    {isElectronicTextual && recordCount > 0 && (
                        <span className="node-meta">Dok: {recordCount}</span>
                    )}

                    {/* File count for all items (not just electronic textual) */}
                    {level === 'item' && fileCount > 0 && (
                        <span className="node-meta">Faili: {fileCount}</span>
                    )}

                    {/* Record-specific info - File count */}
                    {level === 'record' && fileCount > 0 && (
                        <span className="node-meta">Faili: {fileCount}</span>
                    )}

                    {/* File-specific info */}
                    {level === 'file' && entity.file_size && (
                        <span className="file-size">{formatFileSize(entity.file_size)}</span>
                    )}
                </div>

                {/* Level Icon - Status/origin indicator (right side, only for inventory) */}
                {getLevelIcon(level, entity) && (
                    <div className="level-icon">
                        <i className={`fas ${getLevelIcon(level, entity)}`}></i>
                    </div>
                )}

                {/* Status Indicator - Context-aware based on expansion state */}
                {isValid ? (
                    // Show checkmark for valid items
                    <div className="status-indicator status-valid" title="Viss kārtībā">
                        <i className="fas fa-check-circle"></i>
                    </div>
                ) : shouldShowErrorIndicator ? (
                    // Show error indicator only when collapsed or leaf node
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

                {/* Navigate Button */}
                {onNavigate && (
                    <button
                        className="navigate-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔘 TreeNode navigate button clicked, level:', level);
                            onNavigate();
                        }}
                        title="Pāriet uz šo elementu"
                    >
                        <i className="fas fa-arrow-right"></i>
                    </button>
                )}
            </div>

            {/* Child Nodes */}
            {expanded && hasChildren && (
                <div className="tree-node-children">
                    {children}
                </div>
            )}
        </div>
    );
};

export default TreeNode;
