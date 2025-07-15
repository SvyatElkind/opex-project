import React, { useState, useEffect } from "react";
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import CreateItem from "./CreateItem";
import './Items.css';
import Record from "../Record/Record";
import { useCreateItem, useDeleteItem } from "../hooks/useItems";
import { usePerformance } from '../hooks/usePerformance';
import { useNavigation } from '../Navigation/context/NavigationContext';

const Items = ({ items = [], projectId, inventoryId, inventory }) => {
    // React Query mutations
    const createItemMutation = useCreateItem();
    const deleteItemMutation = useDeleteItem();
    const performance = usePerformance('Items');
    
    // Local state
    const [newItemVisibility, setNewItemVisibility] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [columnSelectVisability, setColumnSelectVisability] = useState(false);
    const [recordsData, setRecordsData] = useState([]);
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
    const { currentItem, navigateTo } = useNavigation();

    // Find the currently selected item from the navigation state
    const selectedItem = items?.find(item => item.id === currentItem);

    // When the navigation state changes, update the selected record
    useEffect(() => {
        if (selectedItem) {
            setSelectedRecord(selectedItem);
            setRecordsData({ gv: selectedItem.number });
        }
    }, [selectedItem]);

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

    // Create a relativeInventory object that includes all necessary properties
    const relativeInventory = inventory || {
        id: inventoryId,
        last_gv: items.length > 0 ? Math.max(...items.map(i => i.number || 0)) : 0,
        number: inventoryId
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

    const toggleNewItem = () => {
        setNewItemVisibility(!newItemVisibility);
    };

    const toggleColumnSelect = () => {
        setColumnSelectVisability(!columnSelectVisability);
    };

    const handleCreateItem = async (itemData) => {
        performance.startMeasure('CreateItem');
        try {
            await createItemMutation.mutateAsync({
                itemData,
                projectId,
                inventoryId
            });
            
            return [true, "Item created successfully"];
        } catch (error) {
            return [false, error.message || "Failed to create item"];
        } finally {
            performance.endMeasure('CreateItem');
        }
    };

    const handleDeleteItem = async (itemId, event) => {
        if (event) {
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

    const handleRecordClick = (item) => {
        navigateTo('item', item.id, inventoryId);
        setSelectedRecord(item);
        setRecordsData({ gv: item.number });
        deselectColumns();
        setShowRecordsTable(true);
    };

    const handleBackToItems = () => {
        navigateTo('inventory', inventoryId);
        selectColumns();
        setShowRecordsTable(false);
        setSelectedRecord(null);
    };

    const deselectColumns = () => {
        setColumnVisibility({
            gvNumurs: true,
            seriesCode: false,
            title: false,
            startDate: false,
            endDate: false,
            secrecy: false,
            language: false,
            notes: false,
            actions: false
        });
    };

    const selectColumns = () => {
        setColumnVisibility({
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
    };
    
    const toggleColumn = (column) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: !prev[column],
        }));
    };
    
    useEffect(() => {
        return () => {
            performance.logAllStats();
        };
    }, []);

    // Item row renderer for virtualized list
    const ItemRow = ({ index, style }) => {
        const item = items[index];
        const isSelected = selectedItems.includes(item.id);
        const isCurrent = selectedItem && selectedItem.id === item.id;
        
        let rowClass = 'virtualized-row';
        if (index % 2 === 0) rowClass += ' even-row';
        else rowClass += ' odd-row';
        if (isSelected) rowClass += ' row-selected';
        if (isCurrent) rowClass += ' row-current';

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
                }}
                onClick={() => handleRecordClick(item)}
            >
                <div style={{ width: '40px', textAlign: 'center' }}>
                    <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => toggleItemSelection(item.id, e)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
                
                {columnVisibility.gvNumurs && 
                    <div style={{ flex: '0 0 80px', fontWeight: '600' }}>{item.number}</div>}
                
                {columnVisibility.seriesCode && 
                    <div style={{ flex: '0 0 120px' }}>{item.series_code}</div>}
                
                {columnVisibility.title && 
                    <div style={{ flex: '1', fontWeight: '500' }}>{item.title}</div>}
                
                {columnVisibility.startDate && 
                    <div style={{ flex: '0 0 100px' }}>
                        {item.start_date ? new Date(item.start_date).toLocaleDateString('lv-LV') : 'Nav norādīts'}
                    </div>}
                
                {columnVisibility.endDate && 
                    <div style={{ flex: '0 0 100px' }}>
                        {item.end_date ? new Date(item.end_date).toLocaleDateString('lv-LV') : 'Nav norādīts'}
                    </div>}
                
                {columnVisibility.secrecy && 
                    <div style={{ flex: '0 0 150px' }}>{item.restriction || 'Vispārēja'}</div>}
                
                {columnVisibility.language && 
                    <div style={{ flex: '0 0 100px' }}>{item.language || 'Nav norādīts'}</div>}
                
                {columnVisibility.notes && 
                    <div style={{ flex: '0 0 200px', fontSize: '13px', color: '#6c757d' }}>
                        {item.notes ? (item.notes.length > 50 ? item.notes.substring(0, 50) + '...' : item.notes) : 'Nav piezīmju'}
                    </div>}
                
                {columnVisibility.actions && 
                    <div style={{ flex: '0 0 180px', display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button 
                            onClick={(e) => {e.stopPropagation(); console.log('Edit', item.id)}}
                            title="Labot vienību"
                        >
                            Labot
                        </button>
                        <button 
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            title="Dzēst vienību"
                        >
                            Dzēst
                        </button>
                        <button 
                            onClick={(e) => {e.stopPropagation(); handleRecordClick(item)}}
                            title="Skatīt ierakstus"
                        >
                            Ieraksti
                        </button>
                    </div>}
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
            
            {columnVisibility.gvNumurs && <div style={{ flex: '0 0 80px' }}>GV Numurs</div>}
            {columnVisibility.seriesCode && <div style={{ flex: '0 0 120px' }}>Sērijas Kods</div>}
            {columnVisibility.title && <div style={{ flex: '1' }}>Nosaukums</div>}
            {columnVisibility.startDate && <div style={{ flex: '0 0 100px' }}>Sākuma Datums</div>}
            {columnVisibility.endDate && <div style={{ flex: '0 0 100px' }}>Beigu Datums</div>}
            {columnVisibility.secrecy && <div style={{ flex: '0 0 150px' }}>Pieejamība</div>}
            {columnVisibility.language && <div style={{ flex: '0 0 100px' }}>Valoda</div>}
            {columnVisibility.notes && <div style={{ flex: '0 0 200px' }}>Piezīmes</div>}
            {columnVisibility.actions && <div style={{ flex: '0 0 180px', textAlign: 'right' }}>Darbības</div>}
        </div>
    );

    return (
        <div className="items-main-container">
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="action-buttons">
                    {newItemVisibility && 
                        <CreateItem 
                            onClose={toggleNewItem} 
                            OnCreate={handleCreateItem} 
                            relativeInventory={relativeInventory} 
                        />
                    }
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
            
            {showRecordsTable && (
                <div className="records-container"> 
                    <Record
                        records={recordsData} 
                        onBack={handleBackToItems}
                        gvnumb={recordsData.gv}
                    />
                </div>
            )}
        </div>
    );
};

export default Items;