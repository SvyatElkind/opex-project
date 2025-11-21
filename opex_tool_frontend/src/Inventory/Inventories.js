import React, { useState, useEffect, useRef, useMemo } from "react";
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

    // Favorites state - stored in localStorage
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem(`inventory-favorites-${projectId}`);
        return saved ? JSON.parse(saved) : [];
    });

    // Save favorites to localStorage when they change
    useEffect(() => {
        localStorage.setItem(`inventory-favorites-${projectId}`, JSON.stringify(favorites));
    }, [favorites, projectId]);

    // React Query - for refreshing project data
    const { refetch: refetchProject } = useProject(projectId);
    const deleteInventoryMutation = useDeleteInventory();
    const updateInventoryMutation = useUpdateInventory();

    // Sort inventories with favorites first
    const sortedInventories = useMemo(() => {
        if (!Array.isArray(inventories)) return [];
        return [...inventories].sort((a, b) => {
            const aFav = favorites.includes(a.id);
            const bFav = favorites.includes(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return parseInt(a.number) - parseInt(b.number);
        });
    }, [inventories, favorites]);

    const toggleFavorite = (e, inventoryId) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(inventoryId)
                ? prev.filter(id => id !== inventoryId)
                : [...prev, inventoryId]
        );
    };


    // Integration with navigation system
    const { currentInventory, currentItem, currentRecord, navigateTo } = useNavigation();

    // Hide inventory list when at Item level or deeper
    const shouldHideInventoryList = !!(currentItem || currentRecord);

    const hasInitializedSelection = useRef(false);
    const previousInventoriesLength = useRef(0);


    // Find the currently selected inventory from the navigation state
    const selectedInventory = inventories?.find(inv => inv.id === currentInventory) || null;

    // Helper to find the best default inventory
    const findDefaultInventory = (inventoryList) => {
        // Priority 1: First favorited inventory
        const favorited = inventoryList.find(inv => favorites.includes(inv.id));
        if (favorited) return favorited.id;

        // Priority 2: First inventory with items
        const withItems = inventoryList.find(inv => inv.items && inv.items.length > 0);
        if (withItems) return withItems.id;

        // Fallback: First inventory
        return inventoryList[0].id;
    };

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
                const defaultInventoryId = findDefaultInventory(inventories);
                console.log('Inventories: Initial selection - selecting default inventory:', defaultInventoryId);
                navigateTo('inventory', defaultInventoryId);
                hasInitializedSelection.current = true;
                return;
            }

            // Case 2: After deletion - current selection no longer exists
            if (inventoriesChanged && currentInventory && !currentSelectedInventory) {
                const defaultInventoryId = findDefaultInventory(inventories);
                // Only navigate if we're actually changing to a different inventory
                if (defaultInventoryId !== currentInventory) {
                    console.log('Inventories: Current selection invalid after deletion - selecting default inventory');
                    navigateTo('inventory', defaultInventoryId);
                }
                return;
            }

            // Case 3: Current selection exists and is valid - mark as initialized
            if (currentInventory && currentSelectedInventory) {
                hasInitializedSelection.current = true;
            }

        }, [inventories, currentInventory, navigateTo, favorites]);

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
                    <button
                        className="add-button"
                        onClick={toggleInvPopup}
                        title={INVENTORY_UI.CREATE_INV_BTN}
                    >
                        <i className="fas fa-plus"></i>
                    </button>
                    {sortedInventories.length > 0 ? (
                        sortedInventories.map((inventory) => (
                            <div
                                key={inventory.id}
                                className={`inventory-item ${selectedInventory && selectedInventory.id === inventory.id ? 'selected' : ''} ${favorites.includes(inventory.id) ? 'favorited' : ''}`}
                                onClick={() => handleInventoryClick(inventory)}
                            >
                                <button
                                    className="favorite-btn"
                                    onClick={(e) => toggleFavorite(e, inventory.id)}
                                    title={favorites.includes(inventory.id) ? 'Noņemt no favorītiem' : 'Pievienot favorītiem'}
                                >
                                    <i className={`fa${favorites.includes(inventory.id) ? 's' : 'r'} fa-star`}></i>
                                </button>
                                <span className="inventory-number">US {inventory.number}</span>
                            </div>
                        ))
                    ) : (
                        <p className="empty-message">Nav Uzskaites Sarakstu</p>
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