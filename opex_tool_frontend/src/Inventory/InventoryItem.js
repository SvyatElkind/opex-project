import React, { useState } from "react";
import InventoryDelete from "./InventoryDelete";
import EditInventory from "./InventoryEdit";
import Items from "../Item/Items";
import "./InventoryItem.css";
import { useNavigation } from '../Navigation/context/NavigationContext';

const InventoryItem = ({ inventory, projectId, onDelete }) => {
    const [deletePopupVisible, setDeletePopupVisible] = useState(false);
    const [editPopupVisable, setEditPopupVisable] = useState(false);
    const [invDetails, setInvDetails] = useState(false);
    const fromReport = inventory?.from_report || false;
    
    // Use navigation context to determine if we're viewing an item
    const { currentItem } = useNavigation();
    const isViewingItem = !!currentItem;

    const toggleDelete = () => {
        setDeletePopupVisible(!deletePopupVisible);
    };

    const toggleEdit = () =>{
        setEditPopupVisable(!editPopupVisable);
    };

    const handleDelete = () => {
        onDelete();
    };

    if (!inventory) {
        return null;
    }

    // Format date range for inventory title
    const formatInventoryDateRange = (startDate, endDate) => {
        // If both dates are missing, return "Datums nav dots"
        if (!startDate && !endDate) {
            return "";
        }

        // If one date is missing, still return "Datums nav dots"
        if (!startDate || !endDate) {
            return "";
        }

        try {
            const startYear = new Date(startDate).getFullYear();
            const endYear = new Date(endDate).getFullYear();

            // If years are the same, display only the year
            if (startYear === endYear) {
                return `par ${startYear}. gadu`;
            }

            // If years are different, display as range
            return `par ${startYear}. - ${endYear}. gadu`;
        } catch (error) {
            // If there's any error parsing dates, return "Datums nav dots"
            return "";
        }
    };

    // Format dates for other display purposes (keeping original function)
    const formatDate = (dateString) => {
        if (!dateString) return "Nav norādīts";
        return new Date(dateString).toLocaleDateString('lv-LV', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="inventory-item-container">
            {deletePopupVisible && (
                <InventoryDelete 
                    onConfirm={handleDelete} 
                    onCancel={toggleDelete}
                    inventoryNumber={inventory.number}
                    itemCount={inventory.items?.length || 0}
                />
            )}
            {editPopupVisable &&(
                <EditInventory onClose={toggleEdit} projectId={projectId} inventory={inventory}/>
            )}
            
            {/* Conditionally render header - hide when viewing an item */}
            {!isViewingItem && (
                <>
                    {/* Header Section */}
                    <div className="inventory-header">
                        <div className="inventory-title-row">
                            <h2>
                                {inventory.number}.{inventory.postfix && <span>{inventory.postfix}</span>} Uzskaites Saraksts {formatInventoryDateRange(inventory.start_date, inventory.end_date)}
                            </h2>
                            <div className="inv-title-actions">
                                <button className="inv-action-btn inv-edit-btn" onClick={toggleEdit}>
                                    <i className="fas fa-edit"></i>
                                    <span>Rediģēt</span>
                                </button>
                                {!fromReport && (
                                    <button className="inv-action-btn inv-delete-btn" onClick={toggleDelete}>
                                        <i className="fas fa-trash"></i>
                                        <span>Dzēst</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="inv-sub-header-section">
                            <div className="inventory-badges">
                                <span className={`badge ${inventory.electronic ? 'badge-electronic' : 'badge-physical'}`}>
                                    {inventory.electronic ? 'Elektronisks' : 'Fizisks'}
                                </span>
                                <span className="badge badge-type">{inventory.type}</span>

                                {inventory.subfond > 0 && (
                                    <span className="badge badge-subfond">Subfonds: {inventory.subfond}</span>
                                )}
                                <span className="badge badge-subfond">{inventory.storage_term || 'Nav norādīts'}</span>
                                <span className="badge badge-subfond">GV:<strong>{inventory.items_per_period}</strong></span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Items Section - always visible */}
            <div className="inventory-items-section">
                <Items 
                    items={inventory.items || []} 
                    projectId={projectId} 
                    inventoryId={inventory.id}
                    inventory={inventory}
                    onRequestEditInventory={toggleEdit}
                />
            </div>
        </div>
    );
};

export default InventoryItem;