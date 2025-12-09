import React, { useState } from 'react';
import TreeNode from './TreeNode';
import ErrorPanel from './ErrorPanel';
import './VerificationTreeView.css';

/**
 * VerificationTreeView Component
 * Visual hierarchical display of validation status
 *
 * Displays the validation tree structure:
 * Project → Inventories → Items → Records → Files
 */
const VerificationTreeView = ({
    validationResult,
    projectData,
    expandAll = false,
    onNodeClick = () => {},
    onNavigateToNode = () => {},
    filterMode = 'all' // 'all', 'issues', 'errors'
}) => {
    const [expandedNodes, setExpandedNodes] = useState(new Set(expandAll ? ['all'] : []));
    const [errorPanelData, setErrorPanelData] = useState(null);

    if (!validationResult || !projectData) {
        return (
            <div className="verification-tree-empty">
                <i className="fas fa-exclamation-circle"></i>
                <p>Nav pieejami validācijas dati</p>
            </div>
        );
    }

    const toggleNode = (nodeId) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    const isExpanded = (nodeId) => {
        return expandAll || expandedNodes.has('all') || expandedNodes.has(nodeId);
    };

    // Handler to show error panel
    const handleShowErrors = (errorData) => {
        setErrorPanelData(errorData);
    };

    // Handler to close error panel
    const handleCloseErrorPanel = () => {
        setErrorPanelData(null);
    };

    // Filter function based on filterMode
    const shouldShowNode = (validation) => {
        if (filterMode === 'all') return true;
        if (filterMode === 'errors') return validation.status === 'ERROR';
        if (filterMode === 'issues') return validation.status === 'ERROR' || validation.status === 'WARNING';
        return true;
    };

    const renderFileNodes = (files, recordId, category, inventoryType, context) => {
        if (!files || files.length === 0) return null;

        return files.map((file, fileIndex) => {
            const fileNodeId = `${recordId}-file-${fileIndex}`;

            // Import the validateFile function
            const { validateFile } = require('../Utils/InheritanceUtils');
            const fileValidation = validateFile(file, category, inventoryType);

            if (!shouldShowNode(fileValidation)) {
                return null;
            }

            return (
                <TreeNode
                    key={fileNodeId}
                    nodeId={fileNodeId}
                    level="file"
                    entity={file}
                    validation={fileValidation}
                    expanded={false}
                    onToggle={() => {}}
                    onSelect={() => onNodeClick(file, 'file')}
                    onNavigate={() => onNavigateToNode(file, 'file', context)}
                    onShowErrors={handleShowErrors}
                />
            );
        });
    };

    const renderRecordNodes = (records, itemId, inventory, itemEntityId) => {
        if (!records || records.length === 0) return null;

        const { validateRecord, getInheritanceInfo } = require('../Utils/InheritanceUtils');
        const inheritanceInfo = getInheritanceInfo(inventory);
        const category = inheritanceInfo.category;

        return records.map((record, recordIndex) => {
            const recordNodeId = `${itemId}-record-${recordIndex}`;
            const recordValidation = validateRecord(record, category, inventory.type);

            if (!shouldShowNode(recordValidation)) {
                return null;
            }

            const recordExpanded = isExpanded(recordNodeId);
            const recordContext = {
                inventoryId: inventory.id,
                itemId: itemEntityId,
                recordId: record.id
            };

            return (
                <TreeNode
                    key={recordNodeId}
                    nodeId={recordNodeId}
                    level="record"
                    entity={record}
                    validation={recordValidation}
                    expanded={recordExpanded}
                    onToggle={() => toggleNode(recordNodeId)}
                    onSelect={() => onNodeClick(record, 'record')}
                    onNavigate={() => {
                        console.log('TreeView: Record navigate clicked', { record, recordContext });
                        onNavigateToNode(record, 'record', recordContext);
                    }}
                    onShowErrors={handleShowErrors}
                >
                    {recordExpanded && renderFileNodes(record.files, recordNodeId, category, inventory.type, recordContext)}
                </TreeNode>
            );
        });
    };

    const renderItemNodes = (items, inventoryId, inventory) => {
        if (!items || items.length === 0) return null;

        const { validateItem } = require('../Utils/InheritanceUtils');

        return items.map((item, itemIndex) => {
            const itemNodeId = `${inventoryId}-item-${itemIndex}`;
            const itemValidation = validateItem(item, inventory);

            if (!shouldShowNode(itemValidation)) {
                return null;
            }

            const itemExpanded = isExpanded(itemNodeId);
            const itemContext = {
                inventoryId: inventory.id,
                itemId: item.id
            };

            return (
                <TreeNode
                    key={itemNodeId}
                    nodeId={itemNodeId}
                    level="item"
                    entity={item}
                    validation={itemValidation}
                    expanded={itemExpanded}
                    onToggle={() => toggleNode(itemNodeId)}
                    onSelect={() => onNodeClick(item, 'item')}
                    onNavigate={() => {
                        console.log('TreeView: Item navigate clicked', { item, itemContext });
                        onNavigateToNode(item, 'item', itemContext);
                    }}
                    onShowErrors={handleShowErrors}
                >
                    {itemExpanded && renderRecordNodes(item.records, itemNodeId, inventory, item.id)}
                </TreeNode>
            );
        });
    };

    const renderInventoryNodes = () => {
        if (!projectData.institution?.fond?.inventories) {
            return (
                <div className="verification-tree-empty">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>Projektā nav atrasts neviens uzskaites saraksts</p>
                </div>
            );
        }

        const inventories = projectData.institution.fond.inventories;
        const { validateInventory } = require('../Utils/InheritanceUtils');

        // Filter out inventories without dates (inactive/empty inventories)
        const activeInventories = inventories.filter(inventory => {
            // Check if inventory has a date or has items with activity
            return inventory.date || (inventory.items && inventory.items.length > 0);
        });

        if (activeInventories.length === 0) {
            return (
                <div className="verification-tree-empty">
                    <i className="fas fa-info-circle"></i>
                    <p>Nav atrasts neviens aktīvs uzskaites saraksts</p>
                </div>
            );
        }

        return activeInventories.map((inventory, invIndex) => {
            const inventoryNodeId = `inventory-${invIndex}`;
            const inventoryValidation = validateInventory(inventory);

            if (!shouldShowNode(inventoryValidation)) {
                return null;
            }

            const inventoryExpanded = isExpanded(inventoryNodeId);
            const inventoryContext = {
                inventoryId: inventory.id
            };

            return (
                <TreeNode
                    key={inventoryNodeId}
                    nodeId={inventoryNodeId}
                    level="inventory"
                    entity={inventory}
                    validation={inventoryValidation}
                    expanded={inventoryExpanded}
                    onToggle={() => toggleNode(inventoryNodeId)}
                    onSelect={() => onNodeClick(inventory, 'inventory')}
                    onNavigate={() => onNavigateToNode(inventory, 'inventory', inventoryContext)}
                    inventoryNumber={inventory.number}
                    onShowErrors={handleShowErrors}
                >
                    {inventoryExpanded && renderItemNodes(inventory.items, inventoryNodeId, inventory)}
                </TreeNode>
            );
        });
    };

    // Check if tree is expanded
    const isAllExpanded = expandedNodes.has('all');

    const toggleExpandAll = () => {
        if (isAllExpanded) {
            setExpandedNodes(new Set());
        } else {
            setExpandedNodes(new Set(['all']));
        }
    };

    return (
        <div className="verification-container">
            {/* Tree View */}
            <div className={`verification-tree-view ${errorPanelData ? 'with-panel' : ''}`}>
                <div className="verification-tree-header">
                    <span className="tree-title">Struktūras Koks</span>
                    <button
                        className={`tree-expand-toggle ${isAllExpanded ? 'expanded' : 'collapsed'}`}
                        onClick={toggleExpandAll}
                        title={isAllExpanded ? 'Aizvērt visu' : 'Atvērt visu'}
                    >
                        <span className="toggle-label">{isAllExpanded ? 'Aizvērt' : 'Atvērt'}</span>
                        <div className="toggle-icon-wrapper">
                            <i className={`fas ${isAllExpanded ? 'fa-compress-alt' : 'fa-expand-alt'}`}></i>
                        </div>
                    </button>
                </div>

                <div className="verification-tree-content">
                    {renderInventoryNodes()}
                </div>
            </div>

            {/* Error Panel - Side by Side */}
            {errorPanelData && (
                <div className="verification-error-panel">
                    <ErrorPanel
                        errorData={errorPanelData}
                        onClose={handleCloseErrorPanel}
                    />
                </div>
            )}
        </div>
    );
};

export default VerificationTreeView;
