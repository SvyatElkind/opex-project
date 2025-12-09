import React from 'react';
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
 * Level icon configurations
 */
const LEVEL_ICONS = {
    inventory: 'fa-box',
    item: 'fa-file-alt',
    record: 'fa-database',
    file: 'fa-file'
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
    onShowErrors // Callback to show errors in separate panel
}) => {
    const hasChildren = React.Children.count(children) > 0;
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

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className={`tree-node tree-node-${level}`} data-status={validation.status}>
            <div className="tree-node-header" onClick={onSelect}>
                {/* Expand/Collapse Button */}
                {hasChildren && (
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
                )}

                {!hasChildren && <div className="expand-toggle-spacer"></div>}

                {/* Level Icon */}
                <div className="level-icon">
                    <i className={`fas ${LEVEL_ICONS[level]}`}></i>
                </div>

                {/* Status Icon */}
                <div
                    className="status-icon"
                    data-status={validation.status}
                    style={{
                        color: statusConfig.color,
                        backgroundColor: statusConfig.bgColor
                    }}
                    title={statusConfig.label}
                >
                    <i className={`fas ${statusConfig.icon}`}></i>
                </div>

                {/* Node Info */}
                <div className="node-info">
                    <span className="node-label">{getNodeLabel()}</span>
                    <span className="node-type">{getNodeType()}</span>

                    {/* File-specific info */}
                    {level === 'file' && entity.file_size && (
                        <span className="file-size">{formatFileSize(entity.file_size)}</span>
                    )}
                </div>

                {/* Issue Counts */}
                <div className="node-badges">
                    {validation.errors && validation.errors.length > 0 && (
                        <span className="badge badge-error" title={`${validation.errors.length} errors`}>
                            <i className="fas fa-times-circle"></i>
                            {validation.errors.length}
                        </span>
                    )}

                    {validation.warnings && validation.warnings.length > 0 && (
                        <span className="badge badge-warning" title={`${validation.warnings.length} warnings`}>
                            <i className="fas fa-exclamation-triangle"></i>
                            {validation.warnings.length}
                        </span>
                    )}
                </div>

                {/* Show Errors Button (if has errors/warnings) */}
                {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                    <button
                        className="show-errors-btn"
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
                )}

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
