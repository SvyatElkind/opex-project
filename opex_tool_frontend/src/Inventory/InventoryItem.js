import React, { useState } from "react";
import InventoryDelete from "./InventoryDelete";
import EditInventory from "./InventoryEdit";
import Items from "../Item/Items";
import "./InventoryItem.css";
import { useNavigation } from '../Navigation/context/NavigationContext';

// Pure helper functions — no component state needed
const formatInventoryDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "";
    try {
        const startYear = new Date(startDate).getFullYear();
        const endYear = new Date(endDate).getFullYear();
        return startYear === endYear
            ? `par ${startYear}. gadu`
            : `par ${startYear}. - ${endYear}. gadu`;
    } catch {
        return "";
    }
};

const formatDate = (dateString) => {
    if (!dateString) return "Nav norādīts";
    return new Date(dateString).toLocaleDateString('lv-LV', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

const InventoryItem = ({ inventory, projectId, onDelete, isFavorite = false, onToggleFavorite = null }) => {
    const [deletePopupVisible, setDeletePopupVisible] = useState(false);
    const [editPopupVisible, setEditPopupVisible] = useState(false);
    const fromReport = inventory?.from_report || false;
    
    const { currentItem } = useNavigation();
    const isViewingItem = !!currentItem;

    const toggleDelete = () => {
        setDeletePopupVisible(!deletePopupVisible);
    };

    const toggleEdit = () =>{
        setEditPopupVisible(!editPopupVisible);
    };

    const handleDelete = () => {
        onDelete();
    };

    if (!inventory) {
        return null;
    }


    return (
        <div className="inventory-item-container">
            {deletePopupVisible && (
                <InventoryDelete
                    onConfirm={handleDelete}
                    onCancel={toggleDelete}
                    inventoryNumber={inventory.number}
                    itemCount={inventory.items?.length || 0}
                    inventory={inventory}
                />
            )}
            {editPopupVisible &&(
                <EditInventory onClose={toggleEdit} projectId={projectId} inventory={inventory}/>
            )}
            
            {!isViewingItem && (
                <>
                    <div className="inventory-header">
                        <div className="inventory-title-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h2>
                                    {inventory.postfix
                                        ? `${inventory.number}${inventory.postfix}`
                                        : `${inventory.number}.`} uzskaites saraksts {formatInventoryDateRange(inventory.start_date, inventory.end_date)}
                                </h2>
                                {onToggleFavorite && (
                                    <button
                                        className="favorite-btn"
                                        onClick={onToggleFavorite}
                                        title={isFavorite ? 'Noņemt no favorītiem' : 'Pievienot favorītiem'}
                                        style={{ fontSize: 'var(--font-size-xl)', background: 'none', border: 'none', cursor: 'pointer', color: isFavorite ? 'var(--color-warning)' : 'var(--text-muted)' }}
                                    >
                                        <i className={`fa${isFavorite ? 's' : 'r'} fa-star`}></i>
                                    </button>
                                )}
                            </div>
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