import React, { useEffect, useState } from "react";
import Project_API from "../API/Project_API";
import Item_API from "../API/Item_API";
import CreateItem from "./CreateItem";
import './Items.css'
import Record from "../Record/Record";

const Items = ({items, projectId, inventoryId}) => {
    const [itemData, setItemData] = useState(items || []);
    const [itemsData, setItemsData] = useState();
    const [newItemVisibility, setNewItemVisibility] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [selectedArchive, setSelectedArchive] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [inventoryData, setInventoryData] = useState();
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

    const columnNames = {
        gvNumurs: "GV Numurs", 
        seriesCode: "Sērijas Kods",
        startDate: "Sākuma Datums",
        title: "Nosaukums",
        endDate: "Beigu Datums",
        secrecy: "Ierobežota Pieejamība",
        language: "Valoda", //?
        notes: "Piezīmes", // ?
        actions: "Darbības"
    };
    
    const projectAPI = Project_API();
    const itemAPI = Item_API();

    const handleFetchProjectData = async () => {
        try {
            const [success, result] = await projectAPI.get_project(projectId);
            if (!success) {
                console.error(result);
            }
            return result;
        } catch (error) {
            console.error(error);
        }
    };

    const toggleRow = (id) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedRows(newSet);
    };


    const toggleNewItem = () => {
        setNewItemVisibility(!newItemVisibility);
    };
    const toggleColumnSelect = () => {
        setColumnSelectVisability(!columnSelectVisability)
    };

    const handleGetAllItems = async () => {
        const project = await handleFetchProjectData();
        const institution = project.institution;
        const fond = institution.fond;
        const inventories = fond.inventories;
        handleRelativeInventoryData(inventories);
        handleAllItems(inventories);
        handleBackToItems();
    };

    const handleAllItems = (inventories) => {
        const allItems = inventories.reduce((acc, inventory) => {
            return [...acc, ...inventory.items];
        }, []);
        setItemsData(allItems);
    };

    const handleRelativeInventoryData = (inventories) => {
        const relativeInv = inventories.find(x => x.id === inventoryId);
        setItemData(relativeInv.items);
        setInventoryData(relativeInv);

    };

    const handleCreateItem = async (itemData, inventoryId) => {
        const [success, result] = await itemAPI.createItem(itemData, projectId, inventoryId);
        if (success) {
            handleGetAllItems();
            return [true, result];
        }
        return [false, result];
    };

    const handleDeleteItem = async (itemId) =>{
        const [success,result] = await itemAPI.deleteItem(projectId,itemId);
        if(success){
            handleGetAllItems();
            return[true, result];
        }
        return [false, result];
    }

    const handleEditItem = async (itemId) =>{

    }

    const handleRecordClick = (item) => {
        setSelectedRecord(item);
        setRecordsData({gv : item.number});
        deselectColumns();
        setShowRecordsTable(true);
    };
    const handleBackToItems = () => {
        selectColumns();
        setShowRecordsTable(false);
        setSelectedRecord(null);
    };

    const deselectColumns = () =>{
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
        })
    }

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
    }

    const toggleColumn = (column) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    useEffect(() => {
       handleGetAllItems();
       setItemData(items || []);
    }, [items]);

    return (
    <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
                <div>
                    {newItemVisibility && 
                        <CreateItem 
                            onClose={toggleNewItem} 
                            OnCreate={handleCreateItem} 
                            relativeInventory={inventoryData} 
                        />
                    }
                    <input type="button" value="Create New Item" onClick={toggleNewItem} />
                    <input type="button" value={columnSelectVisability ? "Paslēpt" : "Parādīt"} onClick={toggleColumnSelect} />

                    {/* Column Visibility Controls */}
                    {columnSelectVisability &&
                        <div>
                            {Object.keys(columnVisibility).map(column => (
                                <div key={column} style={{ display: 'inline-block', marginRight: '10px' }}> {/* Adjust margin as needed */}
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={columnVisibility[column]} 
                                            onChange={() => toggleColumn(column)} 
                                        />
                                        {columnNames[column]} {/* Format camelCase to words */}
                                    </label>
                                </div>
                            ))}
                        </div>
                    }
                </div>
                <div className="container">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    {columnVisibility.gvNumurs && <th>GV Numurs</th>}
                                    {columnVisibility.seriesCode && <th>Sērijas Kods</th>}
                                    {columnVisibility.title && <th>Nosaukums</th>}
                                    {columnVisibility.startDate && <th>Sākuma Datums</th>}
                                    {columnVisibility.endDate && <th>Beigu Datums</th>}
                                    {columnVisibility.secrecy && <th>Ierobežota Pieejamība</th>}
                                    {columnVisibility.language && <th>Valoda</th>}
                                    {columnVisibility.notes && <th>Piezīmes</th>}
                                    {columnVisibility.actions && <th>Darbības</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {itemData.length > 0 ? (
                                    itemData.map(item => (
                                        <tr key={item.id} onClick={() => handleRecordClick(item)}>
                                            {columnVisibility.id && <td>{item.id}</td>}
                                            {columnVisibility.gvNumurs && <td>{item.number}</td>}
                                            {columnVisibility.seriesCode && <td>{item.series_code}</td>}
                                            {columnVisibility.title && <td>{item.title}</td>}
                                            {columnVisibility.startDate && <td>{new Date(item.start_date).toLocaleDateString()}</td>}
                                            {columnVisibility.endDate && <td>{new Date(item.end_date).toLocaleDateString()}</td>}
                                            {columnVisibility.dateNotes && <td>{item.date_note || 'N/A'}</td>}
                                            {columnVisibility.secrecy && <td>{item.restriction || 'N/A'}</td>}
                                            {columnVisibility.accessLevel && <td>{item.security_level || 'N/A'}</td>}
                                            {columnVisibility.language && <td>{item.language || 'N/A'}</td>}
                                            {columnVisibility.notes && <td>{item.notes || 'N/A'}</td>}
                                            {columnVisibility.actions && (
                                                <td>
                                                    <button onClick={() => console.log('Edit', item.id)}>Edit</button>
                                                    <button onClick={(e) => {e.stopPropagation(); handleDeleteItem(item.id)}}>Delete</button>
                                                    <button onClick={() => console.log('Edit', item.id)}>info records</button>
                                                    
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={Object.values(columnVisibility).filter(v => v).length}>No items found.</td>
                                    </tr>
                                )}
                                </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {showRecordsTable && ( // Render records table only when it is open
                <Record
                    records={recordsData} 
                    onBack={handleBackToItems}
                    gvnumb={recordsData.gv}
                />
            )}
    </div>
    );
};

export default Items;