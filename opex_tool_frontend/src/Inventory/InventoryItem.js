import React, { useState } from "react";
import InventoryDelete from "./InventoryDelete";
import Items from "../Item/Items";
import "./InventoryItem.css";
import { useNavigation } from '../Navigation/context/NavigationContext';

const InventoryItem = ({ inventory, projectId, onDelete }) => {
    const [deletePopupVisible, setDeletePopupVisible] = useState(false);
    const [invDetails, setInvDetails] = useState(false);
    const fromReport = inventory?.from_report || false;
    
    // Use navigation context to determine if we're viewing an item
    const { currentItem } = useNavigation();
    const isViewingItem = !!currentItem;

    const toggleDelete = () => {
        setDeletePopupVisible(!deletePopupVisible);
    };

    const handleDelete = () => {
        onDelete();
    };

    const toggleInvDetails = () => {
        setInvDetails(prev => !prev);
    };

    if (!inventory) {
        return null;
    }

    // Format dates for display
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
                <InventoryDelete onConfirm={handleDelete} onCancel={toggleDelete} />
            )}
            
            {/* Conditionally render header - hide when viewing an item */}
            {!isViewingItem && (
                <>
                    {/* Header Section */}
                    <div className="inventory-header">
                        <div className="inventory-title">
                            <h2>{inventory.number}. Uzskaites Saraksts ({formatDate(inventory.start_date)} {formatDate(inventory.end_date)})</h2>
                            <div className="inventory-badges">
                                <span className={`badge ${inventory.electronic ? 'badge-electronic' : 'badge-physical'}`}>
                                    {inventory.electronic ? 'Elektronisks' : 'Fizisks'}
                                </span>
                                <span className="badge badge-type">{inventory.type}</span>

                                {inventory.postfix && (
                                    <span className="badge badge-subfond">Subfonds: {inventory.postfix}</span>
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
                />
            </div>
        </div>
    );
};

export default InventoryItem;