import React, { useState } from 'react';
import TreeNode from './TreeNode';
import ErrorPanel from './ErrorPanel';
import { validateRecord, validateItem, validateInventory, getInheritanceInfo } from '../Utils/InheritanceUtils';
import './VerificationTreeView.css';

const MEDIA_RECORD_KEYS = { 'Foto': 'photo_records', 'Video': 'video_records', 'Skaņas': 'audio_records' };

const VerificationTreeView = ({
    validationResult,
    projectData,
    expandAll = false,
    onNodeClick = () => {},
    onNavigateToNode = () => {},
    filterMode = 'all',
    showPhysical = false,
    dismissWarning,
    dismissAllWarnings,
    isWarningDismissed,
    dismissedWarningCount = 0,
    resetDismissedWarnings
}) => {
    const [expandedNodes, setExpandedNodes] = useState(new Set(expandAll ? ['all'] : []));
    const [errorPanelData, setErrorPanelData] = useState(null);
    const [selectedNodeId, setSelectedNodeId] = useState(null);

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

    const handleShowErrors = (errorData, nodeId) => {
        setErrorPanelData(errorData);
        setSelectedNodeId(nodeId);
    };

    const handleCloseErrorPanel = () => {
        setErrorPanelData(null);
        setSelectedNodeId(null);
    };

    const shouldShowNode = (validation) => {
        if (filterMode === 'all') return true;
        if (filterMode === 'errors') return validation.status === 'ERROR';
        if (filterMode === 'issues') return validation.status === 'ERROR' || validation.status === 'WARNING';
        return true;
    };

    const renderRecordNodes = (records, itemId, inventory, itemEntityId, breadcrumb) => {
        if (!records || records.length === 0) return null;

        const inheritanceInfo = getInheritanceInfo(inventory);
        const category = inheritanceInfo.category;

        return records.map((record, recordIndex) => {
            const recordNodeId = `${itemId}-record-${recordIndex}`;
            const recordValidation = validateRecord(record, category, inventory.type);

            if (!shouldShowNode(recordValidation)) {
                return null;
            }

            const recordContext = {
                inventoryId: inventory.id,
                itemId: itemEntityId,
                recordId: record.id
            };

            const recordLabel = record.title || 'Bez nosaukuma';
            const recordBreadcrumb = [...breadcrumb, { level: 'record', label: recordLabel }];

            return (
                <TreeNode
                    key={recordNodeId}
                    nodeId={recordNodeId}
                    level="record"
                    entity={record}
                    validation={recordValidation}
                    expanded={false}
                    hasChildren={false}
                    onToggle={() => {}}
                    onSelect={() => onNodeClick(record, 'record')}
                    onNavigate={() => {
                        onNavigateToNode(record, 'record', recordContext);
                    }}
                    onShowErrors={(data) => handleShowErrors({ ...data, breadcrumb: recordBreadcrumb, navContext: recordContext }, recordNodeId)}
                    isSelected={selectedNodeId === recordNodeId}
                />
            );
        });
    };

    const renderItemNodes = (items, inventoryId, inventory, breadcrumb) => {
        if (!items || items.length === 0) return null;

        const inheritanceInfo = getInheritanceInfo(inventory);
        const isElectronicMedia = inheritanceInfo.category === 'ELECTRONIC_MEDIA';
        const isPhysical = !inventory.electronic; // Any physical inventory (all types)
        const isElectronicTextual = inventory.electronic && inventory.type === 'Tekstuāls';

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

            const itemNumber = item.number || item.item_number || 'N/A';
            const itemTitle = item.title || 'Bez nosaukuma';
            const itemLabel = `${itemNumber}. ${itemTitle}`;
            const itemBreadcrumb = [...breadcrumb, { level: 'item', label: itemLabel }];

            // Determine which records array to use based on category
            const mediaKey = MEDIA_RECORD_KEYS[inventory.type];
            const itemRecords = isElectronicTextual
                ? (item.records || [])
                : isElectronicMedia && mediaKey
                    ? (item[mediaKey] || [])
                    : [];
            const hasChildren = itemRecords.length > 0;

            const enrichedItem = {
                ...item,
                inventory_type: inventory.type,
                is_electronic: inventory.electronic,
                storage_term: inventory.storage_term
            };

            return (
                <TreeNode
                    key={itemNodeId}
                    nodeId={itemNodeId}
                    level="item"
                    entity={enrichedItem}
                    validation={itemValidation}
                    expanded={itemExpanded}
                    hasChildren={hasChildren}
                    onToggle={() => toggleNode(itemNodeId)}
                    onSelect={() => onNodeClick(item, 'item')}
                    onNavigate={() => {
                        onNavigateToNode(item, 'item', itemContext);
                    }}
                    onShowErrors={(data) => handleShowErrors({ ...data, breadcrumb: itemBreadcrumb, navContext: itemContext }, itemNodeId)}
                    isSelected={selectedNodeId === itemNodeId}
                >
                    {itemExpanded && hasChildren &&
                        renderRecordNodes(itemRecords, itemNodeId, inventory, item.id, itemBreadcrumb)
                    }
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

        const activeInventories = inventories.filter(inventory => {
            return inventory.date || (inventory.items && inventory.items.length > 0);
        });

        const filteredInventories = activeInventories.filter(inventory => {
            if (showPhysical) {
                return !inventory.electronic;
            } else {
                return inventory.electronic;
            }
        });

        if (filteredInventories.length === 0) {
            return (
                <div className="verification-tree-empty">
                    <i className="fas fa-info-circle"></i>
                    <p>{showPhysical ? 'Nav atrasts neviens fizisks uzskaites saraksts' : 'Nav atrasts neviens elektronisks uzskaites saraksts'}</p>
                </div>
            );
        }

        return filteredInventories.map((inventory, invIndex) => {
            const inventoryNodeId = `inventory-${invIndex}`;
            const inventoryValidation = validateInventory(inventory);

            if (!shouldShowNode(inventoryValidation)) {
                return null;
            }

            const inventoryExpanded = isExpanded(inventoryNodeId);
            const inventoryContext = {
                inventoryId: inventory.id
            };

            const inventoryLabel = inventory.number ? `US ${inventory.number}` : 'US N/A';
            const inventoryBreadcrumb = [{ level: 'inventory', label: inventoryLabel }];
            const inventoryHasChildren = inventory.items && inventory.items.length > 0;

            return (
                <React.Fragment key={inventoryNodeId}>
                    <TreeNode
                        nodeId={inventoryNodeId}
                        level="inventory"
                        entity={inventory}
                        validation={inventoryValidation}
                        expanded={inventoryExpanded}
                        hasChildren={inventoryHasChildren}
                        onToggle={() => toggleNode(inventoryNodeId)}
                        onSelect={() => onNodeClick(inventory, 'inventory')}
                        onNavigate={() => onNavigateToNode(inventory, 'inventory', inventoryContext)}
                        inventoryNumber={inventory.number}
                        onShowErrors={(data) => handleShowErrors({ ...data, breadcrumb: inventoryBreadcrumb, navContext: inventoryContext }, inventoryNodeId)}
                        isSelected={selectedNodeId === inventoryNodeId}
                    >
                        {inventoryExpanded && renderItemNodes(inventory.items, inventoryNodeId, inventory, inventoryBreadcrumb)}
                    </TreeNode>
                    {invIndex < filteredInventories.length - 1 && (
                        <div className="inventory-divider"></div>
                    )}
                </React.Fragment>
            );
        });
    };

    return (
        <div className="verification-container">
            <div className={`verification-tree-view ${errorPanelData ? 'with-panel' : ''}`}>
                <div className="verification-tree-content">
                    {renderInventoryNodes()}
                </div>
            </div>

            {errorPanelData && (
                <div className="verification-error-panel">
                    <ErrorPanel
                        errorData={errorPanelData}
                        onClose={handleCloseErrorPanel}
                        onNavigate={() => {
                            if (errorPanelData) {
                                onNavigateToNode(errorPanelData.entity, errorPanelData.level, errorPanelData.navContext);
                            }
                        }}
                        dismissWarning={dismissWarning}
                        dismissAllWarnings={dismissAllWarnings}
                        isWarningDismissed={isWarningDismissed}
                        dismissedWarningCount={dismissedWarningCount}
                        resetDismissedWarnings={resetDismissedWarnings}
                    />
                </div>
            )}
        </div>
    );
};

export default VerificationTreeView;
