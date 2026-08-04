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
import SelectionToolbar from '../components/SelectionToolbar';
import BulkEditItemsPopup from './BulkEditItemsPopup';
import MultiCreateItemsPopup from './MultiCreateItemsPopup';
import ImportItemsPopup from './ImportItemsPopup';
import { ITEM_ADDITIONAL_UI, BULK_UI, IMPORT_UI } from '../Constants/Constants';
import { useSettings } from '../Settings/context/SettingsContext';
import { formatDateRange as formatDateRangeUtil } from '../Utils/DateFormatter';
import { getEntityIcon } from '../Constants/iconConstants';
import { useNotification } from '../components/Notification';
import './ItemsTable.css';
import '../Inventory/InventoryItem.css';

const Items = ({ items = [], projectId, inventoryId, inventory, onRequestEditInventory }) => {
    const createItemMutation = useCreateItem(false);
    const updateItemMutation = useUpdateItem();
    const deleteItemMutation = useDeleteItem();
    const createRecordMutation = useCreateRecord();
    const invalidateProject = useInvalidateProject();
    const { notify } = useNotification();
    const performance = usePerformance('Items');
    const { settings } = useSettings();

    const { currentItem, currentRecord, navigateTo } = useNavigation();
    
    const [newItemVisibility, setNewItemVisibility] = useState(false);
    const [editItemVisibility, setEditItemVisibility] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showDocumentRecordModal, setShowDocumentRecordModal] = useState(false);
    const [showMediaRecordModal, setShowMediaRecordModal] = useState(false);
    const [recordCreationItem, setRecordCreationItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [columnSelectVisibility, setColumnSelectVisibility] = useState(false);
    const [createMenuVisibility, setCreateMenuVisibility] = useState(false);
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [showMultiCreate, setShowMultiCreate] = useState(false);
    const [showImport, setShowImport] = useState(false);
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
    const createButtonRef = useRef(null);
    const createMenuRef = useRef(null);

    // Always resolve the tick-box selection against the items actually on
    // screen: ids can go stale when an item is deleted or the inventory
    // changes, and a bulk edit must never act on a stale id.
    const selectedItemObjects = items.filter(item => selectedItems.includes(item.id));

    // Calculate pagination
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);

    // Selection must not survive a switch to another inventory — the ids would
    // belong to items that are no longer listed.
    useEffect(() => {
        setSelectedItems([]);
    }, [inventoryId]);

    // Close the create menu when clicking elsewhere.
    useEffect(() => {
        if (!createMenuVisibility) return undefined;
        const handleClickOutside = (event) => {
            if (createMenuRef.current && !createMenuRef.current.contains(event.target) &&
                createButtonRef.current && !createButtonRef.current.contains(event.target)) {
                setCreateMenuVisibility(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [createMenuVisibility]);

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

    // Listen for guidance events to auto-open forms
    useEffect(() => {
        const handleOpenCreateItem = () => setNewItemVisibility(true);
        const handleOpenCreateRecord = (e) => {
            const targetItemId = e.detail?.itemId;
            if (targetItemId) {
                const targetItem = items.find(i => i.id === targetItemId);
                if (targetItem) {
                    setRecordCreationItem(targetItem);
                    const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
                    if (inheritanceInfo.isAnyMedia) {
                        setShowMediaRecordModal(true);
                    } else {
                        setShowDocumentRecordModal(true);
                    }
                }
            }
        };

        window.addEventListener('guidanceOpenCreateItem', handleOpenCreateItem);
        window.addEventListener('guidanceOpenCreateRecord', handleOpenCreateRecord);
        return () => {
            window.removeEventListener('guidanceOpenCreateItem', handleOpenCreateItem);
            window.removeEventListener('guidanceOpenCreateRecord', handleOpenCreateRecord);
        };
    }, [items, inventory]);

    // Only reset page if items change AND current page would be out of bounds
    useEffect(() => {
        const maxPage = Math.ceil(items.length / itemsPerPage);
        if (currentPage > maxPage && maxPage > 0) {
            setCurrentPage(maxPage);
        } else if (maxPage === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [items.length, itemsPerPage, currentPage]);

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

    const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
    const relativeInventory = inventory || {
        id: inventoryId,
        last_gv: items.length > 0 ? Math.max(...items.map(i => i.number || 0)) : 0,
        number: inventoryId
    };

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

            // Drop the deleted ids from the selection — including the single
            // row-button delete, which used to leave a stale id behind.
            const deletedIds = itemsToDelete.map(item => item.id);
            setSelectedItems(prev => prev.filter(id => !deletedIds.includes(id)));

            // Close popup and clear items to delete
            setShowDeletePopup(false);
            setItemsToDelete([]);

            return true;
        } catch (error) {
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
        
        if (!item) {
            notify.error(ITEM_ADDITIONAL_UI.ERROR_ITEM_NOT_FOUND);
            return;
        }

        if (!item.id) {
            notify.error(ITEM_ADDITIONAL_UI.ERROR_ID_NOT_FOUND);
            return;
        }

        try {
            const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
            setRecordCreationItem(item);

            if (inheritanceInfo.isMedia || inheritanceInfo.isElectronicMedia) {
                setShowMediaRecordModal(true);
            } else {
                setShowDocumentRecordModal(true);
            }
        } catch (error) {
            notify.error(ITEM_ADDITIONAL_UI.ERROR_CREATING_RECORD.replace('{message}', error.message));
        }
    };

    const handleCloseDocumentRecordModal = () => {
        setShowDocumentRecordModal(false);
        setRecordCreationItem(null);
        invalidateProject(projectId);
    };

    const handleCloseMediaRecordModal = () => {
        setShowMediaRecordModal(false);
        setRecordCreationItem(null);
        invalidateProject(projectId);
    };

    const handleRecordCreated = (record) => {
        if (!record || !record.id) {
            notify.error(ITEM_ADDITIONAL_UI.ERROR_INVALID_RECORD);
            return;
        }

        setShowDocumentRecordModal(false);
        setShowMediaRecordModal(false);

        const itemId = recordCreationItem?.id;

        if (!itemId) {
            return;
        }

        const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);

        if (inheritanceInfo.isMedia || inheritanceInfo.isElectronicMedia) {
            navigateTo('item', itemId, inventoryId);
        } else {
            navigateTo('record', record.id, inventoryId, itemId);
        }

        setRecordCreationItem(null);
        invalidateProject(projectId);
    };

    const handleItemClick = (item, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!item || !item.id) {
            return;
        }

        try {
            let navigationBehavior;
            try {
                navigationBehavior = InheritanceUtils.getNavigationBehavior(inventory, item);
            } catch (error) {
                navigationBehavior = { action: 'stayAtItem' };
            }

            setSelectedItemForDetail(item);
            setViewMode('detail');
            navigateTo('item', item.id, inventoryId);

            switch (navigationBehavior.action) {
                case 'navigateToRecord':
                    // Delay record navigation to allow item view to mount first
                    // (navigateTo('item') above must complete rendering before we navigate deeper)
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

    const toggleNewItem = () => {
        if (!inventory?.start_date || !inventory?.end_date) {
            setShowPeriodPopup(true);
            return;
        }

        setNewItemVisibility(!newItemVisibility);
    };

    const openMultiCreate = () => {
        // Same precondition as single create: the backend refuses items when
        // the inventory has no period (AddItemAPIView).
        if (!inventory?.start_date || !inventory?.end_date) {
            setShowPeriodPopup(true);
            return;
        }

        setShowMultiCreate(true);
    };

    const openImport = () => {
        if (!inventory?.start_date || !inventory?.end_date) {
            setShowPeriodPopup(true);
            return;
        }

        setShowImport(true);
    };

    const openBulkEdit = () => {
        if (selectedItemObjects.length === 0) return;
        setShowBulkEdit(true);
    };

    const closeBulkEdit = () => {
        setShowBulkEdit(false);
        setSelectedItems([]);
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
    
    const toggleColumnSelect = () => setColumnSelectVisibility(!columnSelectVisibility);
    
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

    // Use date format from settings
    const formatDateRange = (startDate, endDate, dateIndicator) => {
        return formatDateRangeUtil(startDate, endDate, settings.dateFormat || 'YYYY-MM-DD', dateIndicator);
    };

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

    // Physical inventories (electronic = false) don't have document level
    const isPhysicalInventory = inventory && !inventory.electronic;

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
                    ref={createButtonRef}
                    onClick={() => setCreateMenuVisibility(prev => !prev)}
                    className="items-uniform-header-btn items-uniform-header-btn-create"
                    title={ITEM_ADDITIONAL_UI.TOOLTIP_CREATE_NEW}
                >
                    <i className="fas fa-plus-circle"></i>
                </button>

                {createMenuVisibility && (
                    <div ref={createMenuRef} className="items-uniform-create-menu">
                        <button
                            type="button"
                            className="items-uniform-create-menu-option"
                            onClick={() => { setCreateMenuVisibility(false); toggleNewItem(); }}
                        >
                            <i className="fas fa-plus"></i> {BULK_UI.MENU_CREATE_ONE_ITEM}
                        </button>
                        <button
                            type="button"
                            className="items-uniform-create-menu-option"
                            onClick={() => { setCreateMenuVisibility(false); openMultiCreate(); }}
                        >
                            <i className="fas fa-layer-group"></i> {BULK_UI.MENU_CREATE_MANY_ITEMS}
                        </button>

                        {/* Experimental, and only ever visible when the user has
                            switched it on in Settings. */}
                        {settings.experimental?.spreadsheetImport === true && (
                            <button
                                type="button"
                                className="items-uniform-create-menu-option"
                                onClick={() => { setCreateMenuVisibility(false); openImport(); }}
                            >
                                <i className="fas fa-file-import"></i> {IMPORT_UI.MENU_IMPORT_ITEMS}
                                <span className="items-uniform-create-menu-badge">
                                    {IMPORT_UI.EXPERIMENTAL_BADGE}
                                </span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* While rows are ticked this slot becomes the bulk edit button, so
                it sits directly above the per-row edit buttons. The columns
                button moves to the selection toolbar for the duration. */}
            <div className="items-uniform-cell-action-header">
                {selectedItems.length > 0 ? (
                    <button
                        className="items-uniform-header-btn items-uniform-header-btn-edit active"
                        onClick={openBulkEdit}
                        title={BULK_UI.TOOLTIP_BULK_EDIT_ITEMS.replace('{count}', selectedItems.length)}
                    >
                        <i className="fas fa-edit"></i>
                        <span className="items-header-badge">{selectedItems.length}</span>
                    </button>
                ) : (
                    <button
                        ref={columnButtonRef}
                        className="items-uniform-header-btn items-uniform-header-btn-columns"
                        onClick={toggleColumnSelect}
                        title={ITEM_ADDITIONAL_UI.TOOLTIP_COLUMN_SETTINGS}
                    >
                        <i className="fas fa-columns"></i>
                    </button>
                )}
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
            {columnSelectVisibility && (
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

    const ItemRow = ({ index, style }) => {
        const item = paginatedItems[index];

        // Safety check
        if (!item) {
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
                            {isOptimistic && <span style={{ color: 'var(--color-info)', fontSize: 'var(--font-size-xs)' }}> ⏳</span>}
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
                            const mediaRecordMap = { 'Foto': 'photo_records', 'Video': 'video_records', 'Skaņas': 'audio_records' };
                            const mediaKey = mediaRecordMap[inventory.type];
                            const hasMediaFile = mediaKey && Array.isArray(item[mediaKey]) && item[mediaKey].length > 0;

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
                        onCreate={handleCreateItem}
                        relativeInventory={relativeInventory}
                        allItems={items}
                    />
                )}

                {showMultiCreate && (
                    <MultiCreateItemsPopup
                        inventory={inventory}
                        projectId={projectId}
                        inventoryId={inventoryId}
                        onClose={() => setShowMultiCreate(false)}
                    />
                )}

                {showImport && (
                    <ImportItemsPopup
                        inventory={inventory}
                        items={items}
                        projectId={projectId}
                        inventoryId={inventoryId}
                        onClose={() => setShowImport(false)}
                    />
                )}

                {showBulkEdit && selectedItemObjects.length > 0 && (
                    <BulkEditItemsPopup
                        items={selectedItemObjects}
                        inventory={inventory}
                        projectId={projectId}
                        onClose={closeBulkEdit}
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

                {/* Record view */}
                {currentRecord ? (
                    <div className="items-detail-view">
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
                
                ) : viewMode === 'list' ? (
                    <div className="list_items">
                        <div className="items-uniform-table-content">
                            {items.length > 0 ? (
                                <>
                                    <SelectionToolbar
                                        selectedCount={selectedItemObjects.length}
                                        totalCount={items.length}
                                        labels={selectedItemObjects.map(item => `GV ${item.number}`)}
                                        onEdit={openBulkEdit}
                                        onDelete={handleBatchDelete}
                                        onColumns={toggleColumnSelect}
                                        onClear={() => setSelectedItems([])}
                                        entityKind="items"
                                    />
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