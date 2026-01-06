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
    onShowErrors, // Callback to show errors in separate panel
    hasChildren // Explicit prop indicating if node can have children
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

    return (
        <div className={`tree-node tree-node-${level}`} data-status={validation.status}>
            <div className="tree-node-header" onClick={onSelect}>
                {/* Expand/Collapse Button - Only render if has children */}
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

                {/* Level Icon */}
                <div className="level-icon">
                    <i className={`fas ${LEVEL_ICONS[level]}`}></i>
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
