import React, { useState, useEffect } from "react";
import { INVENTORY_UI } from "../Constants/Constnats";
import InventoryItem from "./InventoryItem";
import InventoryCreate from "./InventoryCreate";
import './Inventories.css';
import { useProject } from "../hooks/useProjects";
import { useDeleteInventory } from "../hooks/useInventories";
import { useNavigation } from '../Navigation/context/NavigationContext';

const Inventories = ({ projectId, fondId, inventories }) => {
    // Local state
    const [createInvPopup, setCreateInvPopup] = useState(false);
    const [toolTip, setTooltip] = useState(null);
    const [toolTipContent, setToolTipContent] = useState('');
    
    // React Query - for refreshing project data
    const { refetch: refetchProject } = useProject(projectId);
    const deleteInventoryMutation = useDeleteInventory();

    // Integration with navigation system
    const { currentInventory, navigateTo } = useNavigation();
    
    // Find the currently selected inventory from the navigation state
    const selectedInventory = inventories?.find(inv => inv.id === currentInventory) || null;

    // When inventories change or navigation state changes, ensure we have a selected inventory
    useEffect(() => {
        if (Array.isArray(inventories) && inventories.length > 0) {
            // If we have inventories but no selection, select the first one
            if (!selectedInventory && !currentInventory) {
                navigateTo('inventory', inventories[0].id);
            }
            // If the current selection isn't in the inventory list, select the first one
            else if (currentInventory && !selectedInventory) {
                navigateTo('inventory', inventories[0].id);
            }
        }
    }, [inventories, currentInventory, selectedInventory, navigateTo]);

    const handleDelete = async () => {
        if (!selectedInventory) return;
        
        try {
            await deleteInventoryMutation.mutateAsync({
                projectId,
                inventoryId: selectedInventory.id
            });
            
            // After deletion, navigate to project level
            navigateTo('project', projectId);
            refetchProject(); // Refresh project data to update the inventory list
        } catch (error) {
            console.error("Failed to delete inventory:", error);
            // Handle error (show alert etc.)
        }
    };

    const handleInventoryClick = (inventory) => {
        navigateTo('inventory', inventory.id);
    };

    const toggleInvPopup = () => {
        setCreateInvPopup(prev => !prev);
    };

    const handleAddInventoryTooltip = () => {
        setTooltip(true);
        setToolTipContent(INVENTORY_UI.CREATE_INV_BTN);
    };

    const hideTooltip = () => {
        setTooltip(false);
        setToolTipContent('');
    };

    return (
        <div className="inventories-container">
            {createInvPopup && 
                <InventoryCreate 
                    onClose={toggleInvPopup}
                    projectId={projectId}
                    fondId={fondId}
                />
            }

            <div className="inventory-list">
                <input 
                    className="add-button"
                    type="button" 
                    value=" + "
                    onClick={toggleInvPopup}
                    onMouseEnter={() => {handleAddInventoryTooltip()}}
                    onMouseLeave={() => {hideTooltip()}}
                />
                {toolTip && (<div className="add_inv_tooltip">{toolTipContent}</div>)}
                {Array.isArray(inventories) && inventories.length > 0 ? (
                    inventories.map((inventory) => (
                        <div 
                            key={inventory.id} 
                            className={`inventory-item ${selectedInventory && selectedInventory.id === inventory.id ? 'selected' : ''}`}
                            onClick={() => handleInventoryClick(inventory)}
                        >
                            <p>{inventory.number}</p>
                        </div>
                    ))
                ) : (
                    <p>Nav Uzskaites Sarakstu</p>
                )}
            </div>
            <div className="inventory-details">
                {selectedInventory ? (
                    <InventoryItem 
                        inventory={selectedInventory} 
                        projectId={projectId}
                        onDelete={handleDelete} 
                    /> 
                ) : (
                    <p>Izvēlaties Uzskaites Sarakstu</p>
                )}
            </div>
        </div>
    );
};

export default Inventories;