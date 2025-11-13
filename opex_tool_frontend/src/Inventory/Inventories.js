import React, { useState, useEffect, useRef } from "react";
import { INVENTORY_UI } from "../Constants/Constants";
import InventoryItem from "./InventoryItem";
import InventoryCreate from "./InventoryCreate";
import './Inventories.css';
import { useProject } from "../hooks/useProjects";
import { useDeleteInventory, useUpdateInventory } from "../hooks/useInventories";
import { useNavigation } from '../Navigation/context/NavigationContext';

const Inventories = ({ projectId, fondId, inventories }) => {
    // Local state
    const [createInvPopup, setCreateInvPopup] = useState(false);
    const [toolTip, setTooltip] = useState(null);
    const [toolTipContent, setToolTipContent] = useState('');
    
    // React Query - for refreshing project data
    const { refetch: refetchProject } = useProject(projectId);
    const deleteInventoryMutation = useDeleteInventory();
    const updateInventoryMutation = useUpdateInventory();


    // Integration with navigation system
    const { currentInventory, currentItem, currentRecord, navigateTo } = useNavigation();

    // Hide inventory list when at Item level or deeper
    const shouldHideInventoryList = !!(currentItem || currentRecord);

    const hasInitializedSelection = useRef(false);
    const previousInventoriesLength = useRef(0);


    // Find the currently selected inventory from the navigation state
    const selectedInventory = inventories?.find(inv => inv.id === currentInventory) || null;

    // When inventories change or navigation state changes, ensure we have a selected inventory
    useEffect(() => {
            // Only run if we have inventories
            if (!Array.isArray(inventories) || inventories.length === 0) {
                hasInitializedSelection.current = false;
                return;
            }

            // Compute selected inventory inside the effect
            const currentSelectedInventory = inventories.find(inv => inv.id === currentInventory) || null;

            // Check if inventories list has changed (deletion/addition)
            const inventoriesChanged = previousInventoriesLength.current !== inventories.length;
            previousInventoriesLength.current = inventories.length;

            // Case 1: Initial load - no inventory selected yet
            if (!hasInitializedSelection.current && !currentInventory) {
                console.log('Inventories: Initial selection - selecting first inventory');
                const firstInventoryId = inventories[0].id;
                navigateTo('inventory', firstInventoryId);
                hasInitializedSelection.current = true;
                return;
            }

            // Case 2: After deletion - current selection no longer exists
            if (inventoriesChanged && currentInventory && !currentSelectedInventory) {
                const newInventoryId = inventories[0].id;
                // Only navigate if we're actually changing to a different inventory
                if (newInventoryId !== currentInventory) {
                    console.log('Inventories: Current selection invalid after deletion - selecting first inventory');
                    navigateTo('inventory', newInventoryId);
                }
                return;
            }

            // Case 3: Current selection exists and is valid - mark as initialized
            if (currentInventory && currentSelectedInventory) {
                hasInitializedSelection.current = true;
            }

        }, [inventories, currentInventory, navigateTo]);

    const handleDelete = async () => {
        if (!selectedInventory) return;
        
        const deletingInventoryId = selectedInventory.id;
        
        try {
            // Perform deletion
            await deleteInventoryMutation.mutateAsync({
                projectId,
                inventoryId: deletingInventoryId
            });
            
            console.log('Inventory deleted successfully');
            
            // The useEffect will handle selecting a new inventory after the list updates
            // No need to call navigateTo here
            
        } catch (error) {
            console.error("Failed to delete inventory:", error);
            // Show error to user (you can add a toast notification here)
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

            {/* Inventory List - Hidden at Item/Record level */}
            {!shouldHideInventoryList && (
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
                                <p>US {inventory.number}</p>
                            </div>
                        ))
                    ) : (
                        <p>Nav Uzskaites Sarakstu</p>
                    )}
                </div>
            )}

            {/* Inventory Details - Always visible to show Item/Record content */}
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