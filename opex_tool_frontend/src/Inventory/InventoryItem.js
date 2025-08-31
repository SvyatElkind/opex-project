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
                            <h2>Uzskaites Saraksts №{inventory.number}</h2>
                            <div className="inventory-badges">
                                <span className={`badge ${inventory.electronic ? 'badge-electronic' : 'badge-physical'}`}>
                                    {inventory.electronic ? 'Elektronisks' : 'Fizisks'}
                                </span>
                                <span className="badge badge-type">{inventory.type}</span>
                                {inventory.postfix && (
                                    <span className="badge badge-subfond">Subfonds: {inventory.postfix}</span>
                                )}
                            </div>
                        </div>
                        {/* Quick Stats Bar */}
                        <div className="inventory-stats-bar">
                            <div className="stat-item">
                                <div className="stat-value">{inventory.items_per_period || 0}</div>
                                <div className="stat-label">Pašreizējās vienības</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{inventory.total_items || 0}</div>
                                <div className="stat-label">Iepriekšējie importi</div>
                            </div>
                        </div>
                        
                        <div className="inventory-actions">
                            <button 
                                className="btn btn-toggle" 
                                onClick={toggleInvDetails}
                                title={invDetails ? "Paslēpt detaļas" : "Parādīt detaļas"}
                            >
                                <i className={`fas ${invDetails ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                {invDetails ? "Paslēpt" : "Detaļas"}
                            </button>
                            
                            {!fromReport && (
                                <button 
                                    className="btn btn-danger" 
                                    onClick={toggleDelete}
                                    title="Dzēst uzskaites sarakstu"
                                >
                                    <i className="fas fa-trash"></i>
                                    Dzēst
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Detailed Information */}
                    {invDetails && (
                        <div className="inventory-details-panel">
                            <div className="details-grid">
                                <div className="detail-section">
                                    <h4><i className="fas fa-calendar-alt"></i> Laika periods</h4>
                                    <div className="detail-row">
                                        <span className="detail-label">Sākuma datums:</span>
                                        <span className="detail-value">{formatDate(inventory.start_date)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Beigu datums:</span>
                                        <span className="detail-value">{formatDate(inventory.end_date)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Glabāšanas termiņš:</span>
                                        <span className="detail-value">{inventory.storage_term || 'Nav norādīts'}</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h4><i className="fas fa-info-circle"></i> Papildu informācija</h4>
                                    {inventory.postfix && (
                                        <div className="detail-row">
                                            <span className="detail-label">Subfonds:</span>
                                            <span className="detail-value">{inventory.postfix}</span>
                                        </div>
                                    )}
                                    {fromReport && (
                                        <div className="detail-row">
                                            <span className="detail-label">Avots:</span>
                                            <span className="detail-value badge badge-report">No atskaites</span>
                                        </div>
                                    )}
                                    <div className="detail-row">
                                        <span className="detail-label">Iepriekšējo importu vienības:</span>
                                        <span className="detail-value">{inventory.total_items || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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