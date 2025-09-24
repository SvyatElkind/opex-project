import React, { useState, useEffect } from "react";
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import CreateItem from "./CreateItem";
import EditItem from "./EditItem";
import CreateRecord from "../Record/CreateRecord";
import './Items.css';
import { useCreateItem, useUpdateItem, useDeleteItem, useInvalidateProject } from "../hooks/useItems";
import { useCreateRecord } from '../hooks/useRecords';
import { usePerformance } from '../hooks/usePerformance';
import { useNavigation } from '../Navigation/context/NavigationContext';
import Item from "./Item";
import InheritanceUtils from '../Utils/InheritanceUtils';

const Items = ({ items = [], projectId, inventoryId, inventory }) => {
    // React Query mutations with conditional invalidation
    const createItemMutation = useCreateItem(false);
    const updateItemMutation = useUpdateItem();
    const deleteItemMutation = useDeleteItem();
    const createRecordMutation = useCreateRecord();
    const invalidateProject = useInvalidateProject();
    const performance = usePerformance('Items');
    
    // Local state
    const [newItemVisibility, setNewItemVisibility] = useState(false);
    const [editItemVisibility, setEditItemVisibility] = useState(false);
    const [createRecordVisibility, setCreateRecordVisibility] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [recordCreationItem, setRecordCreationItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemData, setItemData] = useState([]);
    const [showItem, setShowItem] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [columnSelectVisability, setColumnSelectVisability] = useState(false);
    const [recordsData, setRecordsData] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
    const [showRecordsTable, setShowRecordsTable] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState({
        gvNumurs: true,
        seriesCode: true,
        title: true,
        startDate: true,
        endDate: true,
        secrecy: true,
        language: false,
        notes: false,
        actions: true
    });

    // Integration with navigation system
    const { currentItem, currentRecord, navigateTo } = useNavigation();

    // Find the currently selected item from the navigation state
    const selectedItem = items?.find(item => item.id === currentItem);

    // FIXED: Better synchronization between navigation state and local state
    useEffect(() => {
        console.log('Navigation state changed:', { currentItem, selectedItem });
        
        if (selectedItem) {
            console.log('Setting selected item for detail:', selectedItem);
            setSelectedRecord(selectedItem);
            setSelectedItemForDetail(selectedItem);
            setRecordsData({ gv: selectedItem.number });
            
            // Only switch to detail view if we're not already there
            if (viewMode !== 'detail') {
                console.log('Switching to detail view');
                setViewMode('detail');
            }
        } else {
            // If no item is selected, go back to list view
            if (viewMode !== 'list') {
                console.log('No item selected, switching to list view');
                setViewMode('list');
                setSelectedItemForDetail(null);
            }
        }
    }, [currentItem, selectedItem, viewMode]);

    // Debug view mode changes
    useEffect(() => {
        console.log('View mode changed to:', viewMode);
        console.log('Selected item for detail:', selectedItemForDetail);
    }, [viewMode, selectedItemForDetail]);

    // Get inheritance information for this inventory
    const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);

    const columnNames = {
        gvNumurs: "GV Numurs", 
        seriesCode: "Sērijas Kods",
        startDate: "Sākuma Datums",
        title: "Nosaukums",
        endDate: "Beigu Datums",
        secrecy: "Ierobežota Pieejamība",
        language: "Valoda",
        notes: "Piezīmes",
        actions: "Darbības"
    };

    // Create a relativeInventory object
    const relativeInventory = inventory || {
        id: inventoryId,
        last_gv: items.length > 0 ? Math.max(...items.map(i => i.number || 0)) : 0,
        number: inventoryId
    };

    // FIXED: Enhanced item click handler with better error handling and logging
    const handleItemClick = (item, event) => {
        // Prevent default and stop propagation to ensure clean handling
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        console.log('=== ITEM CLICK HANDLER START ===');
        console.log('Item clicked:', item);
        console.log('Current view mode:', viewMode);
        console.log('Inventory:', inventory);

        if (!item || !item.id) {
            console.error('Invalid item clicked:', item);
            return;
        }

        try {
            // Get the navigation behavior based on inheritance rules
            let navigationBehavior;
            try {
                navigationBehavior = InheritanceUtils.getNavigationBehavior(inventory, item);
                console.log('Navigation behavior:', navigationBehavior);
            } catch (error) {
                console.error('Error getting navigation behavior:', error);
                // Fallback navigation behavior
                navigationBehavior = {
                    action: 'stayAtItem',
                    level: 'items',
                    defaultView: 'overview'
                };
            }

            // FIRST: Update local state immediately for responsive UI
            console.log('Setting local state...');
            setSelectedItemForDetail(item);
            setItemData({ gv: item.number });
            setViewMode('detail');

            // SECOND: Update navigation context
            console.log('Updating navigation context...');
            navigateTo('item', item.id, inventoryId);

            // THIRD: Handle specific navigation behavior
            switch (navigationBehavior.action) {
                case 'navigateToRecord':
                    console.log('Will navigate to record:', navigationBehavior.targetRecordId);
                    // Small delay to ensure item navigation completes first
                    setTimeout(() => {
                        if (navigationBehavior.targetRecordId) {
                            navigateTo('record', navigationBehavior.targetRecordId, inventoryId, item.id);
                        }
                    }, 150);
                    break;
                    
                case 'showRecordsTable':
                    console.log('Showing records table');
                    setShowItem(true);
                    setShowRecordsTable(true);
                    break;
                    
                case 'stayAtItem':
                case 'createRecord':
                    console.log('Staying at item level');
                    setShowItem(true);
                    setShowRecordsTable(false);
                    break;
                    
                default:
                    console.log('Default navigation behavior');
                    setShowItem(true);
                    setShowRecordsTable(false);
                    break;
            }

            console.log('=== ITEM CLICK HANDLER END ===');

        } catch (error) {
            console.error('Error in handleItemClick:', error);
            // Fallback: just show the item detail
            setSelectedItemForDetail(item);
            setViewMode('detail');
            navigateTo('item', item.id, inventoryId);
        }
    };

    // FIXED: Better back to list handler
    const handleBackToList = () => {
        console.log('Going back to list view');
        setViewMode('list');
        setSelectedItemForDetail(null);
        setShowItem(false);
        setShowRecordsTable(false);
        navigateTo('inventory', inventoryId);
    };

    // Multi-select functionality
    const toggleItemSelection = (itemId, event) => {
        if (event) {
            event.stopPropagation();
        }
        
        setSelectedItems(prev => 
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedItems(items.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleBatchDelete = async () => {
        if (window.confirm(`Vai esat pārliecināts, ka vēlaties dzēst ${selectedItems.length} vienības?`)) {
            for (const itemId of selectedItems) {
                try {
                    await deleteItemMutation.mutateAsync({
                        projectId,
                        itemId
                    });
                } catch (error) {
                    console.error(`Failed to delete item ${itemId}:`, error);
                }
            }
            setSelectedItems([]);
        }
    };

    // FIXED: Action handlers with proper event handling
    const handleEditItem = (item, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        console.log('Editing item:', item);
        setEditingItem(item);
        setEditItemVisibility(true);
    };

    const handleCreateRecord = (item, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        console.log('Creating record for item:', item);
        
        // Validate if record creation is allowed based on inheritance rules
        const validation = InheritanceUtils.validateRecordCreation(inventory, item);
        console.log('Validation result:', validation);
        
        if (!validation.allowed) {
            alert(validation.message);
            return;
        }
        
        setRecordCreationItem(item);
        setCreateRecordVisibility(true);
    };

    const handleDeleteItem = async (itemId, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        performance.startMeasure('DeleteItem');
        if (window.confirm("Vai esat pārliecināts, ka vēlaties dzēst šo vienību?")) {
            try {
                await deleteItemMutation.mutateAsync({
                    projectId,
                    itemId
                });
                
                if (selectedItem && selectedItem.id === itemId) {
                    navigateTo('inventory', inventoryId);
                }
                
                return true;
            } catch (error) {
                console.error("Failed to delete item:", error);
                return false;
            } finally {
                performance.endMeasure('DeleteItem');
            }
        }
    };

    // Other handlers (create item, update item, etc.) remain the same...
    const handleCreateItem = async (itemData, shouldClosePopup = false) => {
        performance.startMeasure('CreateItem');
        try {
            await createItemMutation.mutateAsync({
                itemData,
                projectId,
                inventoryId
            });
            
            if (shouldClosePopup) {
                console.log('Popup closing - invalidating project cache');
                invalidateProject(projectId);
            } else {
                console.log('Continuing creation - using optimistic updates only');
            }
            
            return [true, "Item created successfully"];
        } catch (error) {
            return [false, error.message || "Failed to create item"];
        } finally {
            performance.endMeasure('CreateItem');
        }
    };

    const handleUpdateItem = async (itemData) => {
        performance.startMeasure('UpdateItem');
        try {
            await updateItemMutation.mutateAsync({
                itemData,
                projectId,
                itemId: editingItem.id
            });
            
            return [true, "Item updated successfully"];
        } catch (error) {
            return [false, error.message || "Failed to update item"];
        } finally {
            performance.endMeasure('UpdateItem');
        }
    };

    const handleCreateRecordSubmit = async (recordData, shouldClosePopup = false) => {
        performance.startMeasure('CreateRecord');
        try {
            await createRecordMutation.mutateAsync({
                recordData,
                projectId,
                itemId: recordCreationItem.id
            });
            
            if (shouldClosePopup) {
                setCreateRecordVisibility(false);
                setRecordCreationItem(null);
            }
            
            return [true, "Record created successfully"];
        } catch (error) {
            return [false, error.message || "Failed to create record"];
        } finally {
            performance.endMeasure('CreateRecord');
        }
    };

    // Popup handlers
    const toggleNewItem = () => setNewItemVisibility(!newItemVisibility);
    const toggleColumnSelect = () => setColumnSelectVisability(!columnSelectVisability);
    const handleClosePopup = () => {
        console.log('CreateItem popup closing - triggering final cache refresh');
        invalidateProject(projectId);
        setNewItemVisibility(false);
    };
    const handleCloseEditPopup = () => {
        console.log('EditItem popup closing');
        setEditItemVisibility(false);
        setEditingItem(null);
    };
    const handleCloseCreateRecordPopup = () => {
        console.log('CreateRecord popup closing');
        setCreateRecordVisibility(false);
        setRecordCreationItem(null);
    };

    const toggleColumn = (column) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    // FIXED: Item row with better event handling
    const ItemRow = ({ index, style }) => {
        const item = items[index];
        const isSelected = selectedItems.includes(item.id);
        const isCurrent = selectedItem && selectedItem.id === item.id;
        const isOptimistic = item.isOptimistic;
        
        // Get navigation behavior for each item
        let navigationBehavior;
        try {
            navigationBehavior = InheritanceUtils.getNavigationBehavior(inventory, item);
        } catch (error) {
            console.error('Error getting navigation behavior for item row:', error);
            navigationBehavior = { action: 'stayAtItem' };
        }
        
        const recordCount = item.records ? item.records.length : 0;
        
        let rowClass = 'virtualized-row';
        if (index % 2 === 0) rowClass += ' even-row';
        else rowClass += ' odd-row';
        if (isSelected) rowClass += ' row-selected';
        if (isCurrent) rowClass += ' row-current';
        if (isOptimistic) rowClass += ' row-optimistic';

        return (
            <div 
                className={rowClass}
                style={{
                    ...style,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f3f4',
                    opacity: isOptimistic ? 0.7 : 1,
                }}
                onClick={(event) => {
                    console.log('Row clicked, calling handleItemClick');
                    handleItemClick(item, event);
                }}
            >
                <div style={{ width: '40px', textAlign: 'center' }}>
                    <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => toggleItemSelection(item.id, e)}
                        onClick={(e) => {
                            console.log('Checkbox clicked, stopping propagation');
                            e.stopPropagation();
                        }}
                    />
                </div>
                
                {columnVisibility.gvNumurs && (
                    <div style={{ flex: '0 0 80px', fontWeight: '600' }}>
                        {item.number}
                        {isOptimistic && <span style={{ color: '#007bff', fontSize: '10px' }}> ⏳</span>}
                    </div>
                )}
                
                {columnVisibility.seriesCode && (
                    <div style={{ flex: '0 0 120px' }}>{item.series_code}</div>
                )}
                
                {columnVisibility.title && (
                    <div style={{ flex: '0 0 120px', fontWeight: '500' }}>
                        {item.title}
                        {navigationBehavior.action === 'navigateToRecord' && (
                            <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                → Atvērs ierakstu
                            </span>
                        )}
                        {navigationBehavior.action === 'showRecordsTable' && (
                            <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                → {recordCount} ieraksti
                            </span>
                        )}
                    </div>
                )}
                
                {columnVisibility.startDate && (
                    <div style={{ flex: '0 0 100px' }}>
                        {item.start_date ? new Date(item.start_date).toLocaleDateString('lv-LV') : 'Nav norādīts'}
                    </div>
                )}
                
                {columnVisibility.endDate && (
                    <div style={{ flex: '0 0 100px' }}>
                        {item.end_date ? new Date(item.end_date).toLocaleDateString('lv-LV') : 'Nav norādīts'}
                    </div>
                )}
                
                {columnVisibility.secrecy && (
                    <div style={{ flex: '0 0 150px' }}>{item.restriction || 'Vispārēja'}</div>
                )}
                
                {columnVisibility.language && (
                    <div style={{ flex: '0 0 100px' }}>{item.language || 'Nav norādīts'}</div>
                )}
                
                {columnVisibility.notes && (
                    <div style={{ flex: '0 0 200px', fontSize: '13px', color: '#6c757d' }}>
                        {item.notes ? (item.notes.length > 50 ? item.notes.substring(0, 50) + '...' : item.notes) : 'Nav piezīmju'}
                    </div>
                )}
                
                {columnVisibility.actions && (
                    <div style={{ flex: '0 0 180px', display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button 
                            onClick={(e) => {
                                console.log('Edit button clicked');
                                handleEditItem(item, e);
                            }}
                            title="Labot vienību"
                            disabled={isOptimistic}
                        >
                            Labot
                        </button>
                        <button 
                            onClick={(e) => {
                                console.log('Delete button clicked');
                                handleDeleteItem(item.id, e);
                            }}
                            title="Dzēst vienību"
                            disabled={isOptimistic}
                        >
                            Dzēst
                        </button>
                        <button 
                            onClick={(e) => {
                                console.log('Create record button clicked');
                                handleCreateRecord(item, e);
                            }}
                            title={
                                recordCount === 0 
                                    ? "Izveidot ierakstu" 
                                    : inheritanceInfo.isMedia 
                                        ? "Ieraksts jau eksistē" 
                                        : `Pievienot ierakstu (${recordCount} eksistē)`
                            }
                            disabled={isOptimistic || (inheritanceInfo.isMedia && recordCount >= 1)}
                            style={{
                                backgroundColor: recordCount === 0 ? '#28a745' : inheritanceInfo.isMedia && recordCount >= 1 ? '#6c757d' : '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: isOptimistic || (inheritanceInfo.isMedia && recordCount >= 1) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {recordCount === 0 ? '+ Ieraksts' : inheritanceInfo.isMedia ? 'Pilns' : '+ Ieraksts'}
                        </button>
                    </div>
                )}

                <div style={{ fontSize: '10px', color: inheritanceInfo.color }}>
                    {inheritanceInfo.icon} {recordCount}
                </div>
            </div>
        );
    };

    // Header row for the virtualized list
    const HeaderRow = () => (
        <div className="virtualized-header">
            <div style={{ width: '40px', textAlign: 'center' }}>
                <input 
                    type="checkbox" 
                    checked={selectedItems.length === items.length && items.length > 0}
                    onChange={handleSelectAll}
                />
            </div>
            
            {columnVisibility.gvNumurs && (
                <div style={{ flex: '0 0 80px' }}>
                    GV Numurs
                    <div style={{ fontSize: '10px', color: inheritanceInfo.color }}>
                        {inheritanceInfo.displayText}
                    </div>
                </div>
            )}
            {columnVisibility.seriesCode && <div style={{ flex: '0 0 120px' }}>Sērijas Kods</div>}
            {columnVisibility.title && <div style={{ flex: '0 0 120px' }}>Nosaukums</div>}
            {columnVisibility.startDate && <div style={{ flex: '0 0 100px' }}>Sākuma Datums</div>}
            {columnVisibility.endDate && <div style={{ flex: '0 0 100px' }}>Beigu Datums</div>}
            {columnVisibility.secrecy && <div style={{ flex: '0 0 150px' }}>Pieejamība</div>}
            {columnVisibility.language && <div style={{ flex: '0 0 100px' }}>Valoda</div>}
            {columnVisibility.notes && <div style={{ flex: '0 0 200px' }}>Piezīmes</div>}
            {columnVisibility.actions && <div style={{ flex: '0 0 180px', textAlign: 'right' }}>Darbības</div>}
            {columnVisibility.seriesCode && <div>Ieraksti</div>}
        </div>
    );

    // FIXED: Enhanced rendering with better debugging
    console.log('Items component render:', {
        viewMode,
        selectedItemForDetail: selectedItemForDetail?.id,
        itemsCount: items.length,
        currentItem
    });

    return (
        <div className="items-main-container">
            {viewMode === 'list' ? (            
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="action-buttons">
                        {/* Modals */}
                        {createRecordVisibility && recordCreationItem && (
                            <CreateRecord
                                onClose={handleCloseCreateRecordPopup}
                                OnCreate={handleCreateRecordSubmit} 
                                item={recordCreationItem}
                                inventory={inventory}
                            />
                        )}
                        {newItemVisibility && (
                            <CreateItem 
                                onClose={handleClosePopup}
                                OnCreate={handleCreateItem}
                                relativeInventory={relativeInventory}
                                allItems={items}
                            />
                        )}
                        {editItemVisibility && editingItem && (
                            <EditItem 
                                onClose={handleCloseEditPopup}
                                onUpdate={handleUpdateItem}
                                item={editingItem}
                                inventory={inventory}
                                allItems={items}
                            />
                        )}
                        
                        {/* Action buttons */}
                        <input 
                            type="button" 
                            value="Izveidot Jaunu Vienību" 
                            onClick={toggleNewItem} 
                        />
                        <input 
                            type="button" 
                            value={columnSelectVisability ? "Paslēpt Kolonnas" : "Rādīt Kolonnas"} 
                            onClick={toggleColumnSelect} 
                        />
                        
                        {selectedItems.length > 0 && (
                            <div className="batch-actions">
                                <span>Izvēlēts: {selectedItems.length}</span>
                                <button onClick={handleBatchDelete}>
                                    Dzēst Izvēlētās
                                </button>
                            </div>
                        )}

                        {columnSelectVisability && (
                            <div className="column-controls">
                                {Object.keys(columnVisibility).map(column => (
                                    <div key={column}>
                                        <label>
                                            <input 
                                                type="checkbox" 
                                                checked={columnVisibility[column]} 
                                                onChange={() => toggleColumn(column)} 
                                            />
                                            {columnNames[column]}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="items-table-container">
                        <HeaderRow />
                        
                        {items.length > 0 ? (
                            <div style={{ height: 'calc(100% - 52px)' }}>
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <FixedSizeList
                                            height={height}
                                            width={width}
                                            itemCount={items.length}
                                            itemSize={54}
                                        >
                                            {ItemRow}
                                        </FixedSizeList>
                                    )}
                                </AutoSizer>
                            </div>
                        ) : (
                            <div className="no-items-container">
                                <div className="no-items-text">
                                    Nav atrasta neviena glabājamā vienība
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // FIXED: Enhanced detail view with debugging
                <div className="items-detail-view">
                    {selectedItemForDetail ? (
                        <>
                            <div style={{ padding: '10px', backgroundColor: '#f8f9fa', marginBottom: '10px', fontSize: '12px' }}>
                                Debug: Showing detail for item {selectedItemForDetail.id} - {selectedItemForDetail.title}
                            </div>
                            <Item 
                                item={selectedItemForDetail}
                                inventory={inventory}
                                projectId={projectId}
                                onBack={handleBackToList}
                            />
                        </>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <h3>Nav izvēlēta vienība</h3>
                            <button onClick={handleBackToList}>
                                Atgriezties uz sarakstu
                            </button>
                        </div>
                    )}
                </div> 
            )}
        </div>
    );
};

export default Items;