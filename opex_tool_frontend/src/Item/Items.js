// Items.js - Complete Fixed Component
import React, { useState, useEffect, useRef } from "react";
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import EditItemNavigable from "./EditItemNavigable";
import CreateDocumentRecord from "../Record/CreateDocumentRecord";
import CreateMediaRecord from "../Record/CreateMediaRecord";
import { useCreateItem, useUpdateItem, useDeleteItem, useInvalidateProject } from "../hooks/useItems";
import { useCreateRecord } from '../hooks/useRecords';
import { usePerformance } from '../hooks/usePerformance';
import { useNavigation } from '../Navigation/context/NavigationContext';
import Item from "./Item";
import Record from '../Record/Record';
import InheritanceUtils from '../Utils/InheritanceUtils';
import CreateItemNavigable from "./CreateItemNavigable";
import './ItemsTable.css';

const Items = ({ items = [], projectId, inventoryId, inventory, onRequestEditInventory }) => {
    // ===== HOOKS =====
    const createItemMutation = useCreateItem(false);
    const updateItemMutation = useUpdateItem();
    const deleteItemMutation = useDeleteItem();
    const createRecordMutation = useCreateRecord();
    const invalidateProject = useInvalidateProject();
    const performance = usePerformance('Items');
    
    const { currentItem, currentRecord, navigateTo } = useNavigation();
    
    // ===== STATE =====
    const [newItemVisibility, setNewItemVisibility] = useState(false);
    const [editItemVisibility, setEditItemVisibility] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showDocumentRecordModal, setShowDocumentRecordModal] = useState(false);
    const [showMediaRecordModal, setShowMediaRecordModal] = useState(false);
    const [recordCreationItem, setRecordCreationItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [columnSelectVisability, setColumnSelectVisability] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);

    const [columnVisibility, setColumnVisibility] = useState({
        gvNumurs: true,
        seriesCode: true,
        title: true,
        dates: true,
        recordCount: true,
        secrecy: true,
        language: true,
        notes: true,
    });

    const selectedItem = items?.find(item => item.id === currentItem);
    const columnButtonRef = useRef(null);
    const columnPopupRef = useRef(null);

    // ===== COLUMN NAMES =====
    const columnNames = {
        gvNumurs: "GV Numurs", 
        seriesCode: "Sērijas Kods",
        title: "Nosaukums",
        dates: "Datums",
        recordCount: "Dokumenti",
        secrecy: "Ierobežota Pieejamība",
        language: "Valoda",
        notes: "Piezīmes",
    };

    // ===== EFFECTS =====
    useEffect(() => {
        if (selectedItem) {
            setSelectedItemForDetail(selectedItem);
            if (viewMode !== 'detail') {
                setViewMode('detail');
            }
        } else {
            if (viewMode !== 'list') {
                setViewMode('list');
                setSelectedItemForDetail(null);
            }
        }
    }, [currentItem, selectedItem, viewMode]);

    // ===== COMPUTED VALUES =====
    const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
    const relativeInventory = inventory || {
        id: inventoryId,
        last_gv: items.length > 0 ? Math.max(...items.map(i => i.number || 0)) : 0,
        number: inventoryId
    };
    // ===== CRUD HANDLERS =====
    const handleCreateItem = async (itemData, shouldClosePopup = false) => {
        performance.startMeasure('CreateItem');
        try {
            await createItemMutation.mutateAsync({
                itemData,
                projectId,
                inventoryId
            });
            
            if (shouldClosePopup) {
                invalidateProject(projectId);
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

    const handleEditItem = (item, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        setEditingItem(item);
        setEditItemVisibility(true);
    };

    const handleCreateRecord = (item, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // Safety checks
        if (!item) {
            console.error('handleCreateRecord called with undefined item');
            alert('Kļūda: vienība nav atrasta');
            return;
        }
        
        if (!item.id) {
            console.error('handleCreateRecord called with item missing ID:', item);
            alert('Kļūda: vienības ID nav atrasts');
            return;
        }
        
        console.log('Creating record for item:', item.id);
        
        try {
            const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
            setRecordCreationItem(item);
            
            if (inheritanceInfo.isMedia || inheritanceInfo.isElectronicMedia) {
                console.log('Opening Media Record modal');
                setShowMediaRecordModal(true);
            } else {
                console.log('Opening Document Record modal');
                setShowDocumentRecordModal(true);
            }
        } catch (error) {
            console.error('Error in handleCreateRecord:', error);
            alert('Kļūda veidojot ierakstu: ' + error.message);
        }
    };

    const handleCloseDocumentRecordModal = () => {
        console.log('Closing Document Record modal');
        setShowDocumentRecordModal(false);
        setRecordCreationItem(null);
        invalidateProject(projectId);
    };

    const handleCloseMediaRecordModal = () => {
        console.log('Closing Media Record modal');
        setShowMediaRecordModal(false);
        setRecordCreationItem(null);
        invalidateProject(projectId);
    };

    const handleRecordCreated = (record) => {
        console.log('📝 Record created successfully:', record);
        
        if (!record || !record.id) {
            console.error('❌ Invalid record object:', record);
            alert('Kļūda: Ieraksts netika izveidots pareizi');
            return;
        }
        
        // Close the modal first
        setShowDocumentRecordModal(false);
        setShowMediaRecordModal(false);
        
        // Get the item that the record belongs to
        const itemId = recordCreationItem?.id;
        
        if (!itemId) {
            console.error('❌ No item ID available for record navigation');
            return;
        }
        
        console.log('🧭 Navigating to record:', {
            type: 'record',
            recordId: record.id,
            itemId: itemId,
            inventoryId: inventoryId
        });
        
        // CORRECT WAY: Pass individual parameters in the right order
        // navigateTo(type, id, parentId, itemId)
        navigateTo('record', record.id, inventoryId, itemId);
        
        // Clear the record creation item
        setRecordCreationItem(null);
        
        // Invalidate project to refresh data
        invalidateProject(projectId);
    };

    const handleItemClick = (item, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!item || !item.id) {
            console.error('Invalid item clicked:', item);
            return;
        }

        try {
            let navigationBehavior;
            try {
                navigationBehavior = InheritanceUtils.getNavigationBehavior(inventory, item);
            } catch (error) {
                console.error('Error getting navigation behavior:', error);
                navigationBehavior = { action: 'stayAtItem' };
            }

            setSelectedItemForDetail(item);
            setViewMode('detail');
            navigateTo('item', item.id, inventoryId);

            switch (navigationBehavior.action) {
                case 'navigateToRecord':
                    setTimeout(() => {
                        if (navigationBehavior.targetRecordId) {
                            navigateTo('record', navigationBehavior.targetRecordId, inventoryId, item.id);
                        }
                    }, 150);
                    break;
                    
                default:
                    break;
            }

        } catch (error) {
            console.error('Error in handleItemClick:', error);
            setSelectedItemForDetail(item);
            setViewMode('detail');
            navigateTo('item', item.id, inventoryId);
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedItemForDetail(null);
        navigateTo('inventory', inventoryId);
    };

    // ===== SELECTION HANDLERS =====
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

    // ===== POPUP HANDLERS =====
    const toggleNewItem = () => {
        if (!inventory?.start_date || !inventory?.end_date) {
            alert('Lūdzu, vispirms iestatiet uzskaites saraksta datumu periodu.\n\nDatums nav dots - lūdzu aizpildiet Sākuma datumu un Beigu datumu rediģēšanas logā.');
            
            if (onRequestEditInventory) {
                onRequestEditInventory();
            }
            return;
        }
        
        setNewItemVisibility(!newItemVisibility);
    };
    
    const toggleColumnSelect = () => setColumnSelectVisability(!columnSelectVisability);
    
    const handleClosePopup = () => {
        invalidateProject(projectId);
        setNewItemVisibility(false);
    };
    
    const handleCloseEditPopup = () => {
        setEditItemVisibility(false);
        setEditingItem(null);
    };

    const toggleColumn = (column) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    // ===== FORMAT DATE RANGE =====
    const formatDateRange = (startDate, endDate, dateIndicator) => {
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const org = date.toISOString().split('T')[0];
            const day = org.split('-')[0] + "." + org.split('-')[1] + "." + org.split('-')[2]; 
            const month = org.split('-')[0] + "." + org.split('-')[1];
            const year = org.split('-')[0];

            if(dateIndicator == 'day'){return day;}
            if(dateIndicator == 'month'){return month;}
            if(dateIndicator == 'year'){return year;}
            
        };
        
        const start = formatDate(startDate);
        const end = formatDate(endDate);
        
        if (start && end) {
            return `${start} - ${end}`;
        } else if (start) {
            return start;
        } else if (end) {
            return end;
        }
        return '-';
    };

    // ===== HEADER ROW COMPONENT =====
    const HeaderRow = () => (
        <div className="items-uniform-header-row">
            {/* CHECKBOX */}
            <div className="items-uniform-cell-checkbox">
                <input 
                    type="checkbox" 
                    className="items-uniform-checkbox-input"
                    checked={selectedItems.length === items.length && items.length > 0}
                    onChange={handleSelectAll}
                />
            </div>

            {/* COLUMN HEADERS */}
            {columnVisibility.gvNumurs && (
                <div className="items-uniform-cell-small">
                    <span className="items-uniform-text-header">GV</span>
                </div>
            )}

            {columnVisibility.seriesCode && (
                <div className="items-uniform-cell-stacked">
                    <span className="items-uniform-text-header">
                        <span>Sērijas</span>
                        <span>Kods</span>
                    </span>
                </div>
            )}

            {columnVisibility.title && (
                <div className="items-uniform-cell-large">
                    <span className="items-uniform-text-header">Nosaukums</span>
                </div>
            )}

            {columnVisibility.dates && (
                <div className="items-uniform-cell-date">
                    <span className="items-uniform-text-header">Datums</span>
                </div>
            )}

            {columnVisibility.secrecy && (
                <div className="items-uniform-cell-medium">
                    <span className="items-uniform-text-header">Pieejamība</span>
                </div>
            )}

            {columnVisibility.language && (
                <div className="items-uniform-cell-small">
                    <span className="items-uniform-text-header">Valoda</span>
                </div>
            )}

            {columnVisibility.notes && (
                <div className="items-uniform-cell-large">
                    <span className="items-uniform-text-header">Piezīmes</span>
                </div>
            )}
            {columnVisibility.recordCount && (
                <div className="items-uniform-cell-doc">
                    <span className="items-uniform-text-header">Dok.</span>
                </div>
            )}

            {/* ACTION COLUMN HEADERS */}
            <div className="items-uniform-cell-action-header">
                <button
                    onClick={toggleNewItem}
                    className="items-uniform-header-btn items-uniform-header-btn-create"
                    title="Izveidot jaunu vienību"
                >
                    <i className="fas fa-plus-circle"></i>
                </button>
            </div>

            <div className="items-uniform-cell-action-header">
                <button
                    ref={columnButtonRef}
                    className="items-uniform-header-btn items-uniform-header-btn-columns"
                    onClick={toggleColumnSelect}
                    title="Kolonnu iestatījumi"
                >
                    <i className="fas fa-columns"></i>
                </button>
            </div>

            <div className="items-uniform-cell-action-header">
                <button
                    className={`items-uniform-header-btn items-uniform-header-btn-delete ${selectedItems.length > 0 ? 'active' : ''}`}
                    onClick={handleBatchDelete}
                    disabled={selectedItems.length === 0}
                    title={selectedItems.length > 0 ? `Dzēst ${selectedItems.length} vienības` : 'Izvēlieties vienības lai dzēstu'}
                >
                    <i className="fas fa-trash"></i>
                    {selectedItems.length > 0 && <span className="items-header-badge">{selectedItems.length}</span>}
                </button>
            </div>


            {/* Column Selector Popup */}
            {columnSelectVisability && (
                <div ref={columnPopupRef} className="items-uniform-column-popup">
                    <div className="items-uniform-column-popup-header">
                        <i className="fas fa-columns"></i>
                        <span>Kolonnu Izvēle</span>
                    </div>
                    <div className="items-uniform-column-popup-content">
                        {Object.keys(columnVisibility).map(column => (
                            <div key={column} className="items-uniform-column-popup-option">
                                <input 
                                    type="checkbox"
                                    id={`col-${column}`}
                                    checked={columnVisibility[column]} 
                                    onChange={() => toggleColumn(column)} 
                                />
                                <label htmlFor={`col-${column}`}>
                                    {columnNames[column]}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // ===== ITEM ROW COMPONENT =====
    const ItemRow = ({ index, style }) => {
        const item = items[index];
        
        // Safety check
        if (!item) {
            console.warn(`Item not found at index ${index}. Total items: ${items.length}`);
            return (
                <div style={style} className="items-uniform-row">
                    <div className="item-error">Item not found</div>
                </div>
            );
        }
        
        const isSelected = selectedItems.includes(item.id);
        const isCurrent = selectedItem && selectedItem.id === item.id;
        const isOptimistic = item.isOptimistic;
    
        let navigationBehavior;
        try {
            navigationBehavior = InheritanceUtils.getNavigationBehavior(inventory, item);
        } catch (error) {
            console.error('Error getting navigation behavior for item row:', error);
            navigationBehavior = { action: 'stayAtItem' };
        }
    
        const recordCount = item.records ? item.records.length : 0;
        
        let rowClass = 'items-uniform-data-row';
        if (index % 2 === 0) rowClass += ' items-uniform-data-row-even';
        else rowClass += ' items-uniform-data-row-odd';
        if (isSelected) rowClass += ' items-uniform-data-row-selected';
        if (isOptimistic) rowClass += ' items-uniform-data-row-optimistic';

        return (
            <div 
                className={rowClass}
                style={{
                    ...style,
                    opacity: isOptimistic ? 0.6 : 1
                }}
                onClick={(e) => handleItemClick(item, e)}
            >
                {/* CHECKBOX */}
                <div className="items-uniform-cell-checkbox">
                    <input 
                        type="checkbox" 
                        className="items-uniform-checkbox-input"
                        checked={isSelected}
                        onChange={(e) => toggleItemSelection(item.id, e)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>

                {/* COLUMN DATA */}
                {columnVisibility.gvNumurs && (
                    <div className="items-uniform-cell-small">
                        <span className="items-uniform-text-data items-uniform-text-primary">
                            {item.number}
                            {isOptimistic && <span style={{ color: '#007bff', fontSize: '10px' }}> ⏳</span>}
                        </span>
                    </div>
                )}

                {columnVisibility.seriesCode && (
                    <div className="items-uniform-cell-stacked">
                        <span className="items-uniform-text-data">{item.series_code || '-'}</span>
                    </div>
                )}

                {columnVisibility.title && (
                    <div className="items-uniform-cell-large">
                        <span className="items-uniform-text-data" title={item.title}>
                            {item.title || 'Bez nosaukuma'}
                        </span>
                    </div>
                )}

                {columnVisibility.dates && (
                    <div className="items-uniform-cell-date">
                        <span className="items-uniform-text-data items-uniform-text-dates">
                            {formatDateRange(item.start_date, item.end_date, item.date_indicator)}
                        </span>
                    </div>
                )}

                {columnVisibility.secrecy && (
                    <div className="items-uniform-cell-medium">
                        <span className="items-uniform-text-data">{item.restriction || '-'}</span>
                    </div>
                )}

                {columnVisibility.language && (
                    <div className="items-uniform-cell-small">
                        <span className="items-uniform-text-data">{item.language || '-'}</span>
                    </div>
                )}

                {columnVisibility.notes && (
                    <div className="items-uniform-cell-large">
                        <span className="items-uniform-text-data items-uniform-text-notes">
                            {item.notes ?
                                (item.notes.length > 30 ? item.notes.substring(0, 30) + '...' : item.notes) : '-'}
                        </span>
                    </div>
                )}
                {columnVisibility.recordCount && (
                    <div className="items-uniform-cell-doc">
                        <span
                            className={`items-record-count-badge ${recordCount > 0 ? 'has-records clickable' : ''}`}
                            onClick={(e) => {
                                if (recordCount > 0) {
                                    e.stopPropagation();
                                    handleItemClick(item, e);
                                }
                            }}
                            title={recordCount > 0 ? 'Skatīt dokumentus' : ''}
                        >
                            <i className="fas fa-file-alt"></i> {recordCount}
                        </span>
                    </div>
                )}
                {/* ACTION COLUMNS - Separate cells for each action */}
                {/* CREATE/ADD COLUMN */}
                <div className="items-uniform-cell-action">
                    {(inheritanceInfo.category === 'ELECTRONIC_MEDIA' && recordCount === 0) ||
                     inheritanceInfo.category === 'ELECTRONIC_DOCUMENTS' ? (
                        <button
                            className="items-uniform-action-icon items-icon-create"
                            onClick={(e) => handleCreateRecord(item, e)}
                            disabled={isOptimistic}
                            title="Izveidot ierakstu"
                        >
                            <i className="fas fa-plus-circle"></i>
                        </button>
                    ) : null}
                </div>

                {/* EDIT COLUMN */}
                <div className="items-uniform-cell-action">
                    <button
                        className="items-uniform-action-icon items-icon-edit"
                        onClick={(e) => handleEditItem(item, e)}
                        disabled={isOptimistic}
                        title="Labot vienību"
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                </div>

                {/* DELETE COLUMN */}
                <div className="items-uniform-cell-action">
                    <button
                        className="items-uniform-action-icon items-icon-delete"
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        disabled={isOptimistic}
                        title="Dzēst vienību"
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        );
    };

    // ===== RENDER =====
    return (
        <div className="items-uniform-table-wrapper">
                {/* Existing modals - keep as is */}
                {showDocumentRecordModal && recordCreationItem && (
                    <CreateDocumentRecord
                        onClose={handleCloseDocumentRecordModal}
                        onCreate={handleRecordCreated}
                        item={recordCreationItem}
                        inventory={inventory}
                        projectId={projectId}
                    />
                )}
                
                {showMediaRecordModal && recordCreationItem && (
                    <CreateMediaRecord
                        onClose={handleCloseMediaRecordModal}
                        onCreate={handleRecordCreated}
                        item={recordCreationItem}
                        inventory={inventory}
                        projectId={projectId}
                    />
                )}

                {newItemVisibility && (
                    <CreateItemNavigable 
                        onClose={handleClosePopup}
                        OnCreate={handleCreateItem}
                        relativeInventory={relativeInventory}
                        allItems={items}
                    />
                )}

                {editItemVisibility && editingItem && (
                    <EditItemNavigable
                        onClose={handleCloseEditPopup}
                        onUpdate={handleUpdateItem}
                        item={editingItem}
                        inventory={inventory}
                        allItems={items}
                    />
                )}

                {/* ========================================
                    MAIN VIEW LOGIC - FIXED WITH RECORD VIEW
                    ======================================== */}
                
                {/* Priority 1: If record is selected, show Record component */}
                {currentRecord ? (
                    <div className="items-detail-view">
                        {/* DIAGNOSTIC: Log before rendering Record */}
                        {console.log('📊 Rendering Record component with:', {
                            currentRecord,
                            projectId,
                            currentItem,
                            inventory: inventory?.id
                        })}
                        
                        <Record
                            recordId={currentRecord}  // This MUST be a number
                            projectId={projectId}
                            itemId={currentItem}
                            inventory={inventory}
                            onBack={() => {
                                navigateTo('item', currentItem, inventoryId);
                            }}
                        />
                    </div>
                
                /* Priority 2: If in list mode, show items table */
                ) : viewMode === 'list' ? (
                    <div className="list_items">
                        <div className="items-uniform-table-content">
                            {items.length > 0 ? (
                                <>
                                    <HeaderRow />
                                    <div className="react-window-wrapper">
                                        <AutoSizer>
                                            {({ height, width }) => (
                                                <FixedSizeList
                                                    height={height}
                                                    width={width}
                                                    itemCount={items.length}
                                                    itemSize={48}
                                                >
                                                    {ItemRow}
                                                </FixedSizeList>
                                            )}
                                        </AutoSizer>
                                    </div>
                                </>
                            ) : (
                                <div className="items-uniform-empty-state">
                                    <div className="items-uniform-empty-icon">
                                        <i className="fas fa-folder-open"></i>
                                    </div>
                                    <div className="items-uniform-empty-text">
                                        Nav atrasta neviena glabājamā vienība
                                    </div>
                                    <button
                                        className="items-uniform-empty-create-btn"
                                        onClick={toggleNewItem}
                                    >
                                        <i className="fas fa-plus"></i>
                                        <span>Izveidot Vienību</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                
                /* Priority 3: Show item detail view */
                ) : (
                    <div className="items-detail-view">
                        {selectedItemForDetail ? (
                            <Item 
                                item={selectedItemForDetail}
                                inventory={inventory}
                                projectId={projectId}
                                onBack={handleBackToList}
                                onDelete={() => handleDeleteItem(selectedItemForDetail.id)}
                                onEdit={() => handleEditItem(selectedItemForDetail)}
                            />
                        ) : (
                            <div className="items-uniform-empty-state">
                                <div className="items-uniform-empty-icon">📋</div>
                                <div className="items-uniform-empty-text">
                                    Vienība nav atrasta
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
};

export default Items;