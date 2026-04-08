import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { INVENTORY_UI } from "../Constants/Constants";
import InventoryItem from "./InventoryItem";
import InventoryCreate from "./InventoryCreate";
import ValidationIndicator from '../components/ValidationIndicator';
import InheritanceUtils from '../Utils/InheritanceUtils';
import './Inventories.css';
import { useProject } from "../hooks/useProjects";
import { useDeleteInventory } from "../hooks/useInventories";
import { useNavigation } from '../Navigation/context/NavigationContext';
import { useNotification } from '../components/Notification';

const Inventories = ({ projectId, fondId, inventories }) => {
    const [createInvPopup, setCreateInvPopup] = useState(false);
    const [initialInventoryData, setInitialInventoryData] = useState(null);

    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem(`inventory-favorites-${projectId}`);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(`inventory-favorites-${projectId}`, JSON.stringify(favorites));
    }, [favorites, projectId]);

    const { refetch: refetchProject } = useProject(projectId);
    const deleteInventoryMutation = useDeleteInventory();
    const { notify } = useNotification();

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


    const { currentInventory, currentItem, currentRecord, navigateTo } = useNavigation();

    const shouldHideInventoryList = !!(currentItem || currentRecord);

    const hasInitializedSelection = useRef(false);
    const previousInventoriesLength = useRef(0);


    const selectedInventory = inventories?.find(inv => inv.id === currentInventory) || null;

    const findDefaultInventory = (inventoryList) => {
        const favorited = inventoryList.find(inv => favorites.includes(inv.id));
        if (favorited) return favorited.id;

        const withItems = inventoryList.find(inv => inv.items && inv.items.length > 0);
        if (withItems) return withItems.id;

        return inventoryList[0].id;
    };

    useEffect(() => {
            if (!Array.isArray(inventories) || inventories.length === 0) {
                hasInitializedSelection.current = false;
                return;
            }

            const currentSelectedInventory = inventories.find(inv => inv.id === currentInventory) || null;

            const inventoriesChanged = previousInventoriesLength.current !== inventories.length;
            previousInventoriesLength.current = inventories.length;

            if (!hasInitializedSelection.current && !currentInventory) {
                const defaultInventoryId = findDefaultInventory(inventories);
                navigateTo('inventory', defaultInventoryId);
                hasInitializedSelection.current = true;
                return;
            }

            if (inventoriesChanged && currentInventory && !currentSelectedInventory) {
                const defaultInventoryId = findDefaultInventory(inventories);
                if (defaultInventoryId !== currentInventory) {
                    navigateTo('inventory', defaultInventoryId);
                }
                return;
            }

            if (currentInventory && currentSelectedInventory) {
                hasInitializedSelection.current = true;
            }

        }, [inventories, currentInventory, navigateTo, favorites]);

    useEffect(() => {
        const handleOpenInventoryCreate = (event) => {
            const { inventoryNumber, inventoryType, electronic } = event.detail || {};
            setInitialInventoryData({
                number: inventoryNumber,
                type: inventoryType,
                electronic: electronic
            });
            setCreateInvPopup(true);
        };

        window.addEventListener('openInventoryCreate', handleOpenInventoryCreate);
        return () => {
            window.removeEventListener('openInventoryCreate', handleOpenInventoryCreate);
        };
    }, []);

    const handleDelete = async () => {
        if (!selectedInventory) return;
        
        const deletingInventoryId = selectedInventory.id;
        
        try {
            await deleteInventoryMutation.mutateAsync({
                projectId,
                inventoryId: deletingInventoryId
            });
            
        } catch (error) {
            notify.error(INVENTORY_UI.ERROR_DELETING_PREFIX + (error.message || INVENTORY_UI.ERROR_UNKNOWN));
        }
    };

    const handleInventoryClick = (inventory) => {
        navigateTo('inventory', inventory.id);
    };

    const navigateToSibling = useCallback((direction) => {
        if (sortedInventories.length === 0) return;
        const currentIndex = sortedInventories.findIndex(inv => inv.id === currentInventory);
        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < sortedInventories.length) {
            navigateTo('inventory', sortedInventories[nextIndex].id);
        }
    }, [sortedInventories, currentInventory, navigateTo]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
            if (shouldHideInventoryList) return;
            if (createInvPopup) return;

            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (document.activeElement?.isContentEditable) return;

            e.preventDefault();
            navigateToSibling(e.key === 'ArrowUp' ? -1 : 1);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shouldHideInventoryList, createInvPopup, navigateToSibling]);

    const toggleInvPopup = () => {
        setCreateInvPopup(prev => !prev);
        if (createInvPopup) {
            setInitialInventoryData(null);
        }
    };

    return (
        <div className="inventories-container">
            {createInvPopup &&
                <InventoryCreate
                    onClose={toggleInvPopup}
                    projectId={projectId}
                    fondId={fondId}
                    initialData={initialInventoryData}
                />
            }

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
                        sortedInventories.map((inventory) => {
                            const hasItems = inventory.items && inventory.items.length > 0;
                            const isFromReport = inventory.from_report || false;
                            const shouldShowValidation = hasItems || !isFromReport;

                            return (
                                <div
                                    key={inventory.id}
                                    className={`inventory-item ${selectedInventory && selectedInventory.id === inventory.id ? 'selected' : ''} ${favorites.includes(inventory.id) ? 'favorited' : ''}`}
                                    onClick={() => handleInventoryClick(inventory)}
                                >
                                    {shouldShowValidation && (
                                        <ValidationIndicator
                                            validation={InheritanceUtils.validateInventory(inventory)}
                                            size="small"
                                            showTooltip={false}
                                            clickable={true}
                                            position="right"
                                            showCount={false}
                                        />
                                    )}
                                    <span className="inventory-number">US {inventory.number}{inventory.postfix ? `${inventory.postfix}` : ''}</span>
                                </div>
                            );
                        })
                    ) : (
                        <p className="empty-message">{INVENTORY_UI.NO_INVENTORIES}</p>
                    )}
                </div>
            )}

            <div className="inventory-details">
                {selectedInventory ? (
                    <InventoryItem
                        inventory={selectedInventory}
                        projectId={projectId}
                        onDelete={handleDelete}
                        isFavorite={favorites.includes(selectedInventory.id)}
                        onToggleFavorite={(e) => toggleFavorite(e, selectedInventory.id)}
                    /> 
                ) : (
                    <p>{INVENTORY_UI.SELECT_INVENTORY}</p>
                )}
            </div>
        </div>
    );
};

export default Inventories;