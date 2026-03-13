// Items.js - Complete Fixed Component
import React, { useState, useEffect, useRef } from "react";
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import EditItemNavigable from "./EditItemNavigable";
import CreateDocumentRecord from "../Record/CreateDocumentRecord";
import CreateMediaRecord from "../Record/CreateMediaRecord";
import { useCreateItem, useUpdateItem, useDeleteItem, useInvalidateProject } from "../hooks/useItems";
import { useCreateRecord } from '../hooks/useRecords';
import { usePerformance } from '../hooks/usePerformance';
import { useNavigation } from '../Navigation/context/NavigationContext';
import Item from "./Item";
import Record from '../Record/Record';
import InheritanceUtils from '../Utils/InheritanceUtils';
import CreateItemNavigable from "./CreateItemNavigable";
import ValidationIndicator from '../components/ValidationIndicator';
import ItemDeletePopup from './ItemDeletePopup';
import InventoryPeriodPopup from '../Inventory/InventoryPeriodPopup';
import { ITEM_ADDITIONAL_UI } from '../Constants/Constants';
import { useSettings } from '../Settings/context/SettingsContext';
import { formatDateRange as formatDateRangeUtil } from '../Utils/DateFormatter';
import { getEntityIcon } from '../Constants/iconConstants';
import './ItemsTable.css';
import '../Inventory/InventoryItem.css';

const Items = ({ items = [], projectId, inventoryId, inventory, onRequestEditInventory }) => {
    // ===== HOOKS =====
    const createItemMutation = useCreateItem(false);
    const updateItemMutation = useUpdateItem();
    const deleteItemMutation = useDeleteItem();
    const createRecordMutation = useCreateRecord();
    const invalidateProject = useInvalidateProject();
    const performance = usePerformance('Items');
    const { settings } = useSettings();

    const { currentItem, currentRecord, navigateTo } = useNavigation();
    
    // ===== STATE =====
    const [newItemVisibility, setNewItemVisibility] = useState(false);
    const [editItemVisibility, setEditItemVisibility] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showDocumentRecordModal, setShowDocumentRecordModal] = useState(false);
    const [showMediaRecordModal, setShowMediaRecordModal] = useState(false);
    const [recordCreationItem, setRecordCreationItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [columnSelectVisability, setColumnSelectVisability] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);

    // Delete popup state
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState([]);

    // Period required popup state
    const [showPeriodPopup, setShowPeriodPopup] = useState(false);

    // Pagination persistence key based on inventory
    const paginationKey = `items_page_${inventoryId}`;

    // Pagination state - initialize from sessionStorage to avoid race conditions
    const [currentPage, setCurrentPage] = useState(() => {
        const savedPage = sessionStorage.getItem(paginationKey);
        if (savedPage) {
            const page = parseInt(savedPage, 10);
            if (page >= 1) {
                return page;
            }
        }
        return 1;
    });
    const itemsPerPage = settings.itemsPerPage || 25;

    const [columnVisibility, setColumnVisibility] = useState({
        gvNumurs: true,
        seriesCode: true,
        title: true,
        dates: true,
        recordCount: true,
        secrecy: true,
        language: true,
        notes: true,
        validation: true,
    });

    const selectedItem = items?.find(item => item.id === currentItem);
    const columnButtonRef = useRef(null);
    const columnPopupRef = useRef(null);

    // Calculate pagination
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);

    // Reload page from sessionStorage when inventoryId changes (switching inventories)
    useEffect(() => {
        const savedPage = sessionStorage.getItem(paginationKey);
        if (savedPage) {
            const page = parseInt(savedPage, 10);
            if (page >= 1) {
                setCurrentPage(page);
            }
        } else {
            setCurrentPage(1);
        }
    }, [inventoryId, paginationKey]);

    // Save page when it changes
    useEffect(() => {
        sessionStorage.setItem(paginationKey, currentPage.toString());
    }, [currentPage, paginationKey]);

    // Only reset page if items change AND current page would be out of bounds
    useEffect(() => {
        const maxPage = Math.ceil(items.length / itemsPerPage);
        if (currentPage > maxPage && maxPage > 0) {
            setCurrentPage(maxPage);
        } else if (maxPage === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [items.length, itemsPerPage, currentPage]);

    // ===== COLUMN NAMES =====
    const columnNames = {
        gvNumurs: ITEM_ADDITIONAL_UI.COLUMN_NAMES.GV_NUMURS,
        seriesCode: ITEM_ADDITIONAL_UI.COLUMN_NAMES.SĒRIJAS_KODS,
        title: ITEM_ADDITIONAL_UI.COLUMN_NAMES.NOSAUKUMS,
        dates: ITEM_ADDITIONAL_UI.COLUMN_NAMES.DATUMS,
        recordCount: ITEM_ADDITIONAL_UI.COLUMN_NAMES.DOKUMENTI,
        secrecy: ITEM_ADDITIONAL_UI.COLUMN_NAMES.IEROBEŽOTA_PIEEJAMĪBA,
        language: ITEM_ADDITIONAL_UI.COLUMN_NAMES.VALODA,
        notes: ITEM_ADDITIONAL_UI.COLUMN_NAMES.PIEZĪMES,
        validation: 'Validācija',
    };

    // ===== EFFECTS =====
    useEffect(() => {
        if (selectedItem) {
            setSelectedItemForDetail(selectedItem);
            if (viewMode !== 'detail') {
                setViewMode('detail');
            }
        } else {
            if (viewMode !== 'list') {
                setViewMode('list');
                setSelectedItemForDetail(null);
            }
        }
    }, [currentItem, selectedItem, viewMode]);

    // ===== COMPUTED VALUES =====
    const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
    const relativeInventory = inventory || {
        id: inventoryId,
        last_gv: items.length > 0 ? Math.max(...items.map(i => i.number || 0)) : 0,
        number: inventoryId
    };
    // ===== CRUD HANDLERS =====
    const handleCreateItem = async (itemData, shouldClosePopup = false) => {
        performance.startMeasure('CreateItem');
        try {
            await createItemMutation.mutateAsync({
                itemData,
                projectId,
                inventoryId
            });

            
            invalidateProject(projectId); // Always invalidate the project to refresh data

            // Close the popup if requested
            if (shouldClosePopup) {
                setNewItemVisibility(false);
            }

            return [true, "Item created successfully"];
        } catch (error) {
            return [false, error.message || "Failed to create item"];
        } finally {
            performance.endMeasure('CreateItem');
        }
    };

    const handleUpdateItem = async (itemId, itemData) => {
        performance.startMeasure('UpdateItem');
        try {
            await updateItemMutation.mutateAsync({
                itemData,
                projectId,
                itemId: itemId
            });

            // Invalidate project to refresh data
            invalidateProject(projectId);

            return [true, "Item updated successfully"];
        } catch (error) {
            return [false, error.message || "Failed to update item"];
        } finally {
            performance.endMeasure('UpdateItem');
        }
    };

    const handleDeleteItem = (itemId, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Find the item to delete
        const itemToDelete = items.find(i => i.id === itemId);
        if (itemToDelete) {
            setItemsToDelete([itemToDelete]);
            setShowDeletePopup(true);
        }
    };

    const handleConfirmDelete = async () => {
        performance.startMeasure('DeleteItem');
        try {
            // Delete all items in itemsToDelete
            for (const item of itemsToDelete) {
                await deleteItemMutation.mutateAsync({
                    projectId,
                    itemId: item.id
                });
            }

            // Check if we were viewing any of the deleted items
            if (selectedItem && itemsToDelete.some(i => i.id === selectedItem.id)) {
                navigateTo('inventory', inventoryId);
            }

            // Clear selection if batch delete
            if (itemsToDelete.length > 1) {
                setSelectedItems([]);
            }

            // Close popup and clear items to delete
            setShowDeletePopup(false);
            setItemsToDelete([]);

            return true;
        } catch (error) {
            console.error("Failed to delete item(s):", error);
            return false;
        } finally {
            performance.endMeasure('DeleteItem');
        }
    };

    const handleCancelDelete = () => {
        setShowDeletePopup(false);
        setItemsToDelete([]);
    };

    const handleEditItem = (item, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        setEditingItem(item);
        setEditItemVisibility(true);
    };

    const handleCreateRecord = (item, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // Safety checks
        if (!item) {
            console.error('handleCreateRecord called with undefined item');
            alert(ITEM_ADDITIONAL_UI.ERROR_ITEM_NOT_FOUND);
            return;
        }

        if (!item.id) {
            console.error('handleCreateRecord called with item missing ID:', item);
            alert(ITEM_ADDITIONAL_UI.ERROR_ID_NOT_FOUND);
            return;
        }
        
        console.log('Creating record for item:', item.id);
        
        try {
            const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
            setRecordCreationItem(item);
            
            if (inheritanceInfo.isMedia || inheritanceInfo.isElectronicMedia) {
                console.log('Opening Media Record modal');
                setShowMediaRecordModal(true);
            } else {
                console.log('Opening Document Record modal');
                setShowDocumentRecordModal(true);
            }
        } catch (error) {
            console.error('Error in handleCreateRecord:', error);
            alert(ITEM_ADDITIONAL_UI.ERROR_CREATING_RECORD.replace('{message}', error.message));
        }
    };

    const handleCloseDocumentRecordModal = () => {
        console.log('Closing Document Record modal');
        setShowDocumentRecordModal(false);
        setRecordCreationItem(null);
        invalidateProject(projectId);
    };

    const handleCloseMediaRecordModal = () => {
        console.log('Closing Media Record modal');
        setShowMediaRecordModal(false);
        setRecordCreationItem(null);
        invalidateProject(projectId);
    };

    const handleRecordCreated = (record) => {
        console.log('📝 Record created successfully:', record);
        
        if (!record || !record.id) {
            console.error('❌ Invalid record object:', record);
            alert(ITEM_ADDITIONAL_UI.ERROR_INVALID_RECORD);
            return;
        }
        
        // Close the modal first
        setShowDocumentRecordModal(false);
        setShowMediaRecordModal(false);
        
        // Get the item that the record belongs to
        const itemId = recordCreationItem?.id;
        
        if (!itemId) {
            console.error('❌ No item ID available for record navigation');
            return;
        }
        
        // Check if this is a media/electronic media inventory
        const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);

        if (inheritanceInfo.isMedia || inheritanceInfo.isElectronicMedia) {
            // For media electronic, navigate to item level instead of record level
            console.log('🧭 Navigating to item (media electronic):', {
                type: 'item',
                itemId: itemId,
                inventoryId: inventoryId
            });
            navigateTo('item', itemId, inventoryId);
        } else {
            // For documents, navigate to the record level
            console.log('🧭 Navigating to record:', {
                type: 'record',
                recordId: record.id,
                itemId: itemId,
                inventoryId: inventoryId
            });
            navigateTo('record', record.id, inventoryId, itemId);
        }

        // Clear the record creation item
        setRecordCreationItem(null);

        // Invalidate project to refresh data
        invalidateProject(projectId);
    };

    const handleItemClick = (item, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!item || !item.id) {
            console.error('Invalid item clicked:', item);
            return;
        }

        try {
            let navigationBehavior;
            try {
                navigationBehavior = InheritanceUtils.getNavigationBehavior(inventory, item);
            } catch (error) {
                console.error('Error getting navigation behavior:', error);
                navigationBehavior = { action: 'stayAtItem' };
            }

            setSelectedItemForDetail(item);
            setViewMode('detail');
            navigateTo('item', item.id, inventoryId);

            switch (navigationBehavior.action) {
                case 'navigateToRecord':
                    setTimeout(() => {
                        if (navigationBehavior.targetRecordId) {
                            navigateTo('record', navigationBehavior.targetRecordId, inventoryId, item.id);
                        }
                    }, 150);
                    break;
                    
                default:
                    break;
            }

        } catch (error) {
            console.error('Error in handleItemClick:', error);
            setSelectedItemForDetail(item);
            setViewMode('detail');
            navigateTo('item', item.id, inventoryId);
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedItemForDetail(null);
        navigateTo('inventory', inventoryId);
    };

    // ===== SELECTION HANDLERS =====
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

    const handleBatchDelete = () => {
        if (selectedItems.length === 0) return;

        // Find all items to delete
        const itemsForDeletion = items.filter(item => selectedItems.includes(item.id));
        if (itemsForDeletion.length > 0) {
            setItemsToDelete(itemsForDeletion);
            setShowDeletePopup(true);
        }
    };

    // ===== POPUP HANDLERS =====
    const toggleNewItem = () => {
        if (!inventory?.start_date || !inventory?.end_date) {
            setShowPeriodPopup(true);
            return;
        }

        setNewItemVisibility(!newItemVisibility);
    };

    const handlePeriodPopupConfirm = () => {
        setShowPeriodPopup(false);
        if (onRequestEditInventory) {
            onRequestEditInventory();
        }
    };

    const handlePeriodPopupCancel = () => {
        setShowPeriodPopup(false);
    };
    
    const toggleColumnSelect = () => setColumnSelectVisability(!columnSelectVisability);
    
    const handleClosePopup = () => {
        invalidateProject(projectId);
        setNewItemVisibility(false);
    };
    
    const handleCloseEditPopup = () => {
        setEditItemVisibility(false);
        setEditingItem(null);
    };

    const toggleColumn = (column) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    // ===== FORMAT DATE RANGE =====
    // Use date format from settings
    const formatDateRange = (startDate, endDate, dateIndicator) => {
        return formatDateRangeUtil(startDate, endDate, settings.dateFormat || 'YYYY-MM-DD', dateIndicator);
    };

    // ===== FORMAT LANGUAGE =====
    // Show first language + ellipsis if multiple
    const formatLanguage = (languageStr) => {
        if (!languageStr || languageStr === '-') return '-';

        // Split by common separators (comma, semicolon, slash)
        const languages = languageStr.split(/[,;\/]/).map(l => l.trim()).filter(l => l);

        if (languages.length === 0) return '-';
        if (languages.length === 1) return languages[0];

        // Return first language + ellipsis
        return `${languages[0]}…`;
    };

    // ===== CHECK IF PHYSICAL INVENTORY =====
    // Physical inventories (electronic = false) don't have document level
    const isPhysicalInventory = inventory && !inventory.electronic;

    // ===== HEADER ROW COMPONENT =====
    const HeaderRow = () => (
        <div className="items-uniform-header-row">
            {/* CHECKBOX */}
            <div className="items-uniform-cell-checkbox">
                <input
                    type="checkbox"
                    className="items-uniform-checkbox-input"
                    checked={selectedItems.length === items.length && items.length > 0}
                    onChange={handleSelectAll}
                />
            </div>

            {/* VALIDATION HEADER */}
            {columnVisibility.validation && (
                <div className="items-uniform-cell-validation">
                    <span className="items-uniform-text-header" title="Validācijas statuss">
                        <i className="fas fa-check-circle"></i>
                    </span>
                </div>
            )}

            {/* COLUMN HEADERS */}
            {columnVisibility.gvNumurs && (
                <div className="items-uniform-cell-small">
                    <span className="items-uniform-text-header">GV NR</span>
                </div>
            )}

            {columnVisibility.seriesCode && (
                <div className="items-uniform-cell-stacked">
                    <span className="items-uniform-text-header">
                        <span>{ITEM_ADDITIONAL_UI.COLUMN_SĒRIJAS}</span>
                        <span>{ITEM_ADDITIONAL_UI.COLUMN_KODS}</span>
                    </span>
                </div>
            )}

            {columnVisibility.title && (
                <div className="items-uniform-cell-large">
                    <span className="items-uniform-text-header" title={ITEM_ADDITIONAL_UI.TOOLTIP_GV_NOSAUKUMS}>{ITEM_ADDITIONAL_UI.COLUMN_NOSAUKUMS}</span>
                </div>
            )}

            {columnVisibility.dates && (
                <div className="items-uniform-cell-date">
                    <span className="items-uniform-text-header" title={ITEM_ADDITIONAL_UI.TOOLTIP_GV_DATUMS}>{ITEM_ADDITIONAL_UI.COLUMN_DATUMS}</span>
                </div>
            )}

            {columnVisibility.secrecy && (
                <div className="items-uniform-cell-medium">
                    <span className="items-uniform-text-header">{ITEM_ADDITIONAL_UI.COLUMN_PIEEJAMĪBA}</span>
                </div>
            )}

            {columnVisibility.language && (
                <div className="items-uniform-cell-small">
                    <span className="items-uniform-text-header">{ITEM_ADDITIONAL_UI.COLUMN_VALODA}</span>
                </div>
            )}

            {columnVisibility.notes && (
                <div className="items-uniform-cell-large">
                    <span className="items-uniform-text-header">{ITEM_ADDITIONAL_UI.COLUMN_PIEZĪMES}</span>
                </div>
            )}
            {columnVisibility.recordCount && !isPhysicalInventory && (
                <div className="items-uniform-cell-doc">
                    <span className="items-uniform-text-header">{ITEM_ADDITIONAL_UI.COLUMN_DOK}</span>
                </div>
            )}

            {/* ACTION COLUMN HEADERS */}
            <div className="items-uniform-cell-action-header">
                <button
                    onClick={toggleNewItem}
                    className="items-uniform-header-btn items-uniform-header-btn-create"
                    title={ITEM_ADDITIONAL_UI.TOOLTIP_CREATE_NEW}
                >
                    <i className="fas fa-plus-circle"></i>
                </button>
            </div>

            <div className="items-uniform-cell-action-header">
                <button
                    ref={columnButtonRef}
                    className="items-uniform-header-btn items-uniform-header-btn-columns"
                    onClick={toggleColumnSelect}
                    title={ITEM_ADDITIONAL_UI.TOOLTIP_COLUMN_SETTINGS}
                >
                    <i className="fas fa-columns"></i>
                </button>
            </div>

            <div className="items-uniform-cell-action-header">
                <button
                    className={`items-uniform-header-btn items-uniform-header-btn-delete ${selectedItems.length > 0 ? 'active' : ''}`}
                    onClick={handleBatchDelete}
                    disabled={selectedItems.length === 0}
                    title={selectedItems.length > 0 ? ITEM_ADDITIONAL_UI.TOOLTIP_DELETE_COUNT.replace('{count}', selectedItems.length) : ITEM_ADDITIONAL_UI.TOOLTIP_SELECT_TO_DELETE}
                >
                    <i className="fas fa-trash"></i>
                    {selectedItems.length > 0 && <span className="items-header-badge">{selectedItems.length}</span>}
                </button>
            </div>


            {/* Column Selector Popup */}
            {columnSelectVisability && (
                <div ref={columnPopupRef} className="items-uniform-column-popup">
                    <div className="items-uniform-column-popup-header">
                        <i className="fas fa-columns"></i>
                        <span>{ITEM_ADDITIONAL_UI.COLUMN_SELECTOR_TITLE}</span>
                    </div>
                    <div className="items-uniform-column-popup-content">
                        {Object.keys(columnVisibility).filter(column => column !== 'validation').map(column => (
                            <div key={column} className="items-uniform-column-popup-option">
                                <input
                                    type="checkbox"
                                    id={`col-${column}`}
                                    checked={columnVisibility[column]}
                                    onChange={() => toggleColumn(column)}
                                />
                                <label htmlFor={`col-${column}`}>
                                    {columnNames[column]}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // ===== ITEM ROW COMPONENT =====
    const ItemRow = ({ index, style }) => {
        const item = paginatedItems[index];

        // Safety check
        if (!item) {
            console.warn(`Item not found at index ${index}. Total items: ${paginatedItems.length}`);
            return (
                <div style={style} className="items-uniform-row">
                    <div className="item-error">{ITEM_ADDITIONAL_UI.ITEM_NOT_FOUND_ERROR}</div>
                </div>
            );
        }
        
        const isSelected = selectedItems.includes(item.id);
        const isCurrent = selectedItem && selectedItem.id === item.id;
        const isOptimistic = item.isOptimistic;
    
        let navigationBehavior;
        try {
            navigationBehavior = InheritanceUtils.getNavigationBehavior(inventory, item);
        } catch (error) {
            console.error('Error getting navigation behavior for item row:', error);
            navigationBehavior = { action: 'stayAtItem' };
        }
    
        const recordCount = item.records ? item.records.length : 0;
        
        let rowClass = 'items-uniform-data-row';
        if (index % 2 === 0) rowClass += ' items-uniform-data-row-even';
        else rowClass += ' items-uniform-data-row-odd';
        if (isSelected) rowClass += ' items-uniform-data-row-selected';
        if (isOptimistic) rowClass += ' items-uniform-data-row-optimistic';

        return (
            <div 
                className={rowClass}
                style={{
                    ...style,
                    opacity: isOptimistic ? 0.6 : 1
                }}
                onClick={(e) => handleItemClick(item, e)}
            >
                {/* CHECKBOX */}
                <div className="items-uniform-cell-checkbox">
                    <input
                        type="checkbox"
                        className="items-uniform-checkbox-input"
                        checked={isSelected}
                        onChange={(e) => toggleItemSelection(item.id, e)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>

                {/* VALIDATION INDICATOR */}
                {columnVisibility.validation && (
                    <div className="items-uniform-cell-validation">
                        <ValidationIndicator
                            validation={InheritanceUtils.validateItem(item, inventory)}
                            size="small"
                            showTooltip={false}
                            clickable={true}
                            position="right"
                        />
                    </div>
                )}

                {/* COLUMN DATA */}
                {columnVisibility.gvNumurs && (
                    <div className="items-uniform-cell-small">
                        <span className="items-uniform-text-data items-uniform-text-primary">
                            {item.number}
                            {isOptimistic && <span style={{ color: '#007bff', fontSize: '10px' }}> ⏳</span>}
                        </span>
                    </div>
                )}

                {columnVisibility.seriesCode && (
                    <div className="items-uniform-cell-stacked">
                        <span className="items-uniform-text-data">{item.series_code || '-'}</span>
                    </div>
                )}

                {columnVisibility.title && (
                    <div className="items-uniform-cell-large">
                        <span className="items-uniform-text-data" title={item.title}>
                            {item.title || ITEM_ADDITIONAL_UI.NO_TITLE}
                        </span>
                    </div>
                )}

                {columnVisibility.dates && (
                    <div className="items-uniform-cell-date">
                        <span className="items-uniform-text-data items-uniform-text-dates">
                            {formatDateRange(item.start_date, item.end_date, item.date_indicator)}
                        </span>
                    </div>
                )}

                {columnVisibility.secrecy && (
                    <div className="items-uniform-cell-medium">
                        <span className="items-uniform-text-data">{item.restriction || '-'}</span>
                    </div>
                )}

                {columnVisibility.language && (
                    <div className="items-uniform-cell-small">
                        <span className="items-uniform-text-data" title={item.language || ''}>
                            {formatLanguage(item.language)}
                        </span>
                    </div>
                )}

                {columnVisibility.notes && (
                    <div className="items-uniform-cell-large">
                        <span className="items-uniform-text-data items-uniform-text-notes">
                            {item.notes ?
                                (item.notes.length > 30 ? item.notes.substring(0, 30) + '...' : item.notes) : '-'}
                        </span>
                    </div>
                )}
                {columnVisibility.recordCount && !isPhysicalInventory && (
                    <div className="items-uniform-cell-doc">
                        {inheritanceInfo.category === 'ELECTRONIC_MEDIA' ? (
                            (() => {
                                // Determine which media records to check based on inventory type
                                let hasFile = false;
                                const iconClass = `fas ${getEntityIcon(inventory.type, inventory.electronic)}`;

                                if (inventory.type === 'Foto') {
                                    hasFile = item.photo_records && item.photo_records.length > 0;
                                } else if (inventory.type === 'Video') {
                                    hasFile = item.video_records && item.video_records.length > 0;
                                } else if (inventory.type === 'Skaņas') {
                                    hasFile = item.audio_records && item.audio_records.length > 0;
                                }

                                return (
                                    <span
                                        className={`items-record-count-badge ${hasFile ? 'has-records clickable' : 'no-records'}`}
                                        onClick={(e) => {
                                            if (hasFile) {
                                                e.stopPropagation();
                                                handleItemClick(item, e);
                                            }
                                        }}
                                        title={hasFile ? ITEM_ADDITIONAL_UI.TOOLTIP_VIEW_FILE : ITEM_ADDITIONAL_UI.TOOLTIP_NO_FILE}
                                    >
                                        <i className={iconClass}></i>
                                    </span>
                                );
                            })()
                        ) : (
                            <span
                                className={`items-record-count-badge ${recordCount > 0 ? 'has-records clickable' : ''}`}
                                onClick={(e) => {
                                    if (recordCount > 0) {
                                        e.stopPropagation();
                                        handleItemClick(item, e);
                                    }
                                }}
                                title={recordCount > 0 ? ITEM_ADDITIONAL_UI.TOOLTIP_VIEW_DOCUMENTS : ''}
                            >
                                <i className="fas fa-file-alt"></i> {recordCount}
                            </span>
                        )}
                    </div>
                )}
                {/* ACTION COLUMNS - Separate cells for each action */}
                {/* CREATE/ADD COLUMN */}
                <div className="items-uniform-cell-action">
                    {(() => {
                        if (inheritanceInfo.category === 'ELECTRONIC_MEDIA') {
                            // Check if media file exists
                            let hasMediaFile = false;
                            if (inventory.type === 'Foto') {
                                hasMediaFile = item.photo_records && item.photo_records.length > 0;
                            } else if (inventory.type === 'Video') {
                                hasMediaFile = item.video_records && item.video_records.length > 0;
                            } else if (inventory.type === 'Skaņas') {
                                hasMediaFile = item.audio_records && item.audio_records.length > 0;
                            }

                            if (!hasMediaFile) {
                                return (
                                    <button
                                        className="items-uniform-action-icon items-icon-create"
                                        onClick={(e) => handleCreateRecord(item, e)}
                                        disabled={isOptimistic}
                                        title={ITEM_ADDITIONAL_UI.TOOLTIP_CREATE_RECORD}
                                    >
                                        <i className="fas fa-plus-circle"></i>
                                    </button>
                                );
                            }
                        } else if (inheritanceInfo.category === 'ELECTRONIC_DOCUMENTS') {
                            return (
                                <button
                                    className="items-uniform-action-icon items-icon-create"
                                    onClick={(e) => handleCreateRecord(item, e)}
                                    disabled={isOptimistic}
                                    title={ITEM_ADDITIONAL_UI.TOOLTIP_CREATE_RECORD}
                                >
                                    <i className="fas fa-plus-circle"></i>
                                </button>
                            );
                        }
                        return null;
                    })()}
                </div>

                {/* EDIT COLUMN */}
                <div className="items-uniform-cell-action">
                    <button
                        className="items-uniform-action-icon items-icon-edit"
                        onClick={(e) => handleEditItem(item, e)}
                        disabled={isOptimistic}
                        title={ITEM_ADDITIONAL_UI.TOOLTIP_EDIT_ITEM}
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                </div>

                {/* DELETE COLUMN */}
                <div className="items-uniform-cell-action">
                    <button
                        className="items-uniform-action-icon items-icon-delete"
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        disabled={isOptimistic}
                        title={ITEM_ADDITIONAL_UI.TOOLTIP_DELETE_ITEM}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        );
    };

    // ===== RENDER =====
    return (
        <div className="items-uniform-table-wrapper">
                {/* Existing modals - keep as is */}
                {showDocumentRecordModal && recordCreationItem && (
                    <CreateDocumentRecord
                        onClose={handleCloseDocumentRecordModal}
                        onCreate={handleRecordCreated}
                        item={recordCreationItem}
                        inventory={inventory}
                        projectId={projectId}
                    />
                )}
                
                {showMediaRecordModal && recordCreationItem && (
                    <CreateMediaRecord
                        onClose={handleCloseMediaRecordModal}
                        onCreate={handleRecordCreated}
                        item={recordCreationItem}
                        inventory={inventory}
                        projectId={projectId}
                    />
                )}

                {newItemVisibility && (
                    <CreateItemNavigable 
                        onClose={handleClosePopup}
                        OnCreate={handleCreateItem}
                        relativeInventory={relativeInventory}
                        allItems={items}
                    />
                )}

                {editItemVisibility && editingItem && (
                    <EditItemNavigable
                        onClose={handleCloseEditPopup}
                        onUpdate={handleUpdateItem}
                        item={editingItem}
                        inventory={inventory}
                        allItems={items}
                    />
                )}

                {/* Delete Confirmation Popup */}
                <ItemDeletePopup
                    isOpen={showDeletePopup}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    items={itemsToDelete}
                    inventory={inventory}
                />

                {/* Inventory Period Required Popup */}
                <InventoryPeriodPopup
                    isOpen={showPeriodPopup}
                    onConfirm={handlePeriodPopupConfirm}
                    onCancel={handlePeriodPopupCancel}
                    inventoryNumber={inventory?.number || ''}
                />

                {/* ========================================
                    MAIN VIEW LOGIC - FIXED WITH RECORD VIEW
                    ======================================== */}
                
                {/* Priority 1: If record is selected, show Record component */}
                {currentRecord ? (
                    <div className="items-detail-view">
                        {/* DIAGNOSTIC: Log before rendering Record */}
                        {console.log('📊 Rendering Record component with:', {
                            currentRecord,
                            projectId,
                            currentItem,
                            inventory: inventory?.id
                        })}
                        
                        <Record
                            recordId={currentRecord}  // This MUST be a number
                            projectId={projectId}
                            itemId={currentItem}
                            inventory={inventory}
                            onBack={() => {
                                navigateTo('item', currentItem, inventoryId);
                            }}
                        />
                    </div>
                
                /* Priority 2: If in list mode, show items table */
                ) : viewMode === 'list' ? (
                    <div className="list_items">
                        <div className="items-uniform-table-content">
                            {items.length > 0 ? (
                                <>
                                    <HeaderRow />
                                    <div className="react-window-wrapper">
                                        <AutoSizer>
                                            {({ height, width }) => (
                                                <FixedSizeList
                                                    height={height}
                                                    width={width}
                                                    itemCount={paginatedItems.length}
                                                    itemSize={48}
                                                >
                                                    {ItemRow}
                                                </FixedSizeList>
                                            )}
                                        </AutoSizer>
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="items-pagination">
                                            <button
                                                className="pagination-btn"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <i className="fas fa-chevron-left"></i>
                                            </button>

                                            <span className="pagination-info">
                                                Lapa {currentPage} no {totalPages}
                                                <span className="pagination-items-info">
                                                    ({startIndex + 1}-{Math.min(endIndex, items.length)} no {items.length})
                                                </span>
                                            </span>

                                            <button
                                                className="pagination-btn"
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="items-uniform-empty-state">
                                    <div className="items-uniform-empty-icon">
                                        <i className="fas fa-folder-open"></i>
                                    </div>
                                    <div className="items-uniform-empty-text">
                                        {ITEM_ADDITIONAL_UI.NO_ITEMS_FOUND}
                                    </div>
                                    <button
                                        className="inv-action-btn inv-add-btn"
                                        onClick={toggleNewItem}
                                    >
                                        <span>{ITEM_ADDITIONAL_UI.TOOLTIP_CREATE_NEW}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                
                /* Priority 3: Show item detail view */
                ) : (
                    <div className="items-detail-view">
                        {selectedItemForDetail ? (
                            <Item 
                                item={selectedItemForDetail}
                                inventory={inventory}
                                projectId={projectId}
                                onBack={handleBackToList}
                                onDelete={() => handleDeleteItem(selectedItemForDetail.id)}
                                onEdit={() => handleEditItem(selectedItemForDetail)}
                            />
                        ) : (
                            <div className="items-uniform-empty-state">
                                <div className="items-uniform-empty-icon">📋</div>
                                <div className="items-uniform-empty-text">
                                    {ITEM_ADDITIONAL_UI.ITEM_NOT_FOUND}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
};

export default Items;