import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '../Navigation/context/NavigationContext';
import InheritanceUtils from '../Utils/InheritanceUtils';
import ValidationIndicator from '../components/ValidationIndicator';
import RecordsList from '../Record/RecordsList';
import CreateDocumentRecord from '../Record/CreateDocumentRecord';
import CreateMediaRecord from '../Record/CreateMediaRecord';
import EditDocumentRecord from '../Record/EditDocumentRecord';
import EditItemNavigable from './EditItemNavigable';
import EditMediaRecordMetadata from '../Record/EditMediaRecordMetadata';
import { useCreateRecord, useDeleteMediaRecord } from '../hooks/useRecords';
import { useDeleteItem, useUpdateItem } from '../hooks/useItems';
import { useRecord } from '../hooks/useRecords';
import ItemDeletePopup from './ItemDeletePopup';
import ItemNotFoundPopup from './ItemNotFoundPopup';
import { getEntityIcon } from '../Constants/iconConstants';
import { useNotification } from '../components/Notification';
import './Item.css';
import '../Inventory/InventoryItem.css';

const Item = ({ item, inventory, projectId, onBack, onDelete, onEdit }) => {
    const queryClient = useQueryClient();
    const { navigateTo, currentRecord, getActiveTab, clearActiveTab } = useNavigation();
    const { notify, showConfirm } = useNotification();
    const createRecordMutation = useCreateRecord();
    const deleteItemMutation = useDeleteItem();
    const updateItemMutation = useUpdateItem();
    const deleteMediaRecordMutation = useDeleteMediaRecord();
    const [jumpToNumber, setJumpToNumber] = useState('');
    const scrollPositionRef = useRef(0);
    const editItemRef = useRef(null);
    const reopenEditRef = useRef(false);

    const [viewMode, setViewMode] = useState('overview');
    const [showCreateRecord, setShowCreateRecord] = useState(false);
    const [showEditItem, setShowEditItem] = useState(false);
    const [showEditMetadata, setShowEditMetadata] = useState(false);
    const [showEditDocumentRecord, setShowEditDocumentRecord] = useState(false);
    const [selectedRecordForEdit, setSelectedRecordForEdit] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showItemNotFoundPopup, setShowItemNotFoundPopup] = useState(false);
    const [searchedItemNumber, setSearchedItemNumber] = useState('');
    const [userHasManuallySetView, setUserHasManuallySetView] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Records controls state (for Documents tab)
    const [recordsViewMode, setRecordsViewMode] = useState('table');
    const [recordsSearch, setRecordsSearch] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({
        title: true,
        date: true,
        regNr: true,
        language: true,
        files: true
    });
    
    // Get all items from the current inventory
    const inventoryItems = inventory?.items || [];
    
    // Calculate inheritance info using the NEW system
    const inheritanceInfo = inventory ? InheritanceUtils.getInheritanceInfo(inventory) : {
        category: 'DOCUMENTS',
        isDocuments: true,
        type: 'Tekstuāls',
        icon: '📄',
        color: 'var(--text-muted)',
        usesSegmentedView: true,
        usesCombinedView: false
    };

    const navigationBehavior = (inventory && item) ? InheritanceUtils.getNavigationBehavior(inventory, item) : {
        action: 'stayAtItem'
    };

    const uiConfig = (inventory && item) ? InheritanceUtils.getItemUIConfig(inventory, item) : {
        showCreateRecordButton: false,
        maxRecordsAllowed: 0,
        badge: { text: 'Unknown', color: 'var(--text-muted)', icon: '❓' },
        validation: { allowed: false, message: 'Missing data' }
    };

    const attentionStatus = (inventory && item) ? InheritanceUtils.getItemAttentionStatus(inventory, item) : {
        icon: '⚠️',
        message: 'Nav datu',
        color: 'var(--color-warning)'
    };

    // PAGINATION LOGIC
    const currentIndex = useMemo(() => {
        return inventoryItems.findIndex(i => i.id === item.id);
    }, [inventoryItems, item.id]);

    const prevItem = currentIndex > 0 ? inventoryItems[currentIndex - 1] : null;
    const nextItem = currentIndex < inventoryItems.length - 1 ? inventoryItems[currentIndex + 1] : null;

    const handlePrevItem = () => {
        if (prevItem) {
            navigateTo('item', prevItem.id, inventory?.id);
        }
    };

    const handleNextItem = () => {
        if (nextItem) {
            navigateTo('item', nextItem.id, inventory?.id);
        }
    };

    const hasBlockingModal = showCreateRecord || showEditMetadata
        || showEditDocumentRecord || showDeletePopup || showItemNotFoundPopup;

    const navigateItemByKey = useCallback((direction) => {
        const target = direction === -1 ? prevItem : nextItem;
        if (!target) return;
        navigateTo('item', target.id, inventory?.id);
    }, [prevItem, nextItem, navigateTo, inventory?.id]);

    const saveAndNavigateItem = useCallback(async (direction) => {
        if (!editItemRef.current?.triggerSave) return;
        const success = await editItemRef.current.triggerSave();
        if (success) {
            setShowEditItem(false);
            navigateItemByKey(direction);
        }
    }, [navigateItemByKey]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            if (currentRecord) return;
            if (hasBlockingModal) return;

            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (document.activeElement?.isContentEditable) return;

            e.preventDefault();
            const direction = e.key === 'ArrowLeft' ? -1 : 1;

            if (showEditItem) {
                saveAndNavigateItem(direction);
            } else {
                navigateItemByKey(direction);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentRecord, hasBlockingModal, showEditItem, navigateItemByKey, saveAndNavigateItem]);

    // Reopen edit modal after navigating to a new item
    useEffect(() => {
        if (reopenEditRef.current) {
            reopenEditRef.current = false;
            setShowEditItem(true);
        }
    }, [item.id]);

    const handleEditNavigate = useCallback((direction) => {
        const target = direction === -1 ? prevItem : nextItem;
        if (!target) return;
        reopenEditRef.current = true;
        setShowEditItem(false);
        navigateTo('item', target.id, inventory?.id);
    }, [prevItem, nextItem, navigateTo, inventory?.id]);

    // RELATED ITEMS (items with same series_code or linked)
    const relatedItems = useMemo(() => {
        // Check if related_item exists and has items
        if (!item.related_item || !Array.isArray(item.related_item) || item.related_item.length === 0) {
            return [];
        }

        const related = [];
        
        // Find items that are in the related_item array
        item.related_item.forEach(relatedId => {
            const relatedItem = inventoryItems.find(i => i.id === relatedId);
            if (relatedItem) {
                related.push({
                    ...relatedItem,
                    relationType: 'Saistīta vienība'
                });
            }
        });

        return related;
    }, [item.related_item, inventoryItems]);

    const recordCount = item.records ? item.records.length : 0;
    const itemRecords = item.records || [];

    // Get media record based on inventory type
    const mediaRecord = useMemo(() => {
        if (!inventory) return null;

        switch (inventory.type) {
            case 'Foto':
                return item.photo_records?.[0] || null;
            case 'Video':
                return item.video_records?.[0] || null;
            case 'Skaņas':
                return item.audio_records?.[0] || null;
            default:
                return null;
        }
    }, [item, inventory]);

    // Get full record data if needed
    const singleRecord = itemRecords.length === 1 ? itemRecords[0] : null;
    const { data: fullRecordData } = useRecord(
        projectId,
        singleRecord?.id,
        { enabled: !!singleRecord }
    );

    // Handle view mode changes
    const handleViewChange = (mode) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setViewMode(mode);
            setIsTransitioning(false);
        }, 150);
    };

    // Restore tab from navigation context OR set default based on inheritance
    useEffect(() => {
        // First, check if there's a saved tab from navigation (coming back from record)
        const savedTab = getActiveTab();
        if (savedTab) {
            if (savedTab === 'records' || savedTab === 'overview') {
                setViewMode(savedTab);
                setUserHasManuallySetView(true); // Prevent auto-switching
            }
            clearActiveTab(); // Clear after consuming
            return; // Skip automatic view mode logic
        }

        // If user hasn't manually set view, apply automatic logic
        if (!userHasManuallySetView) {
            // Physical items (electronic = false) should always stay on overview
            const isPhysical = inventory && !inventory.electronic;

            if (isPhysical) {
                setViewMode('overview');
            } else if (navigationBehavior.action === 'navigateToRecord' && recordCount === 1) {
                setViewMode('records');
            } else if (inheritanceInfo.usesSegmentedView) {
                setViewMode('overview');
            } else if (inheritanceInfo.usesCombinedView) {
                setViewMode('overview');
            }
        }
    }, [navigationBehavior, recordCount, inheritanceInfo, userHasManuallySetView, inventory, getActiveTab, clearActiveTab]);

    const displayValue = (value) => value || '-';

    const formatDateRange = (startDate, endDate, dateIndicator) => {
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            if (dateIndicator === 'day') return `${day}.${month}.${year}`; // DD.MM.YYYY
            if (dateIndicator === 'month') return `${month}.${year}`; // MM.YYYY
            if (dateIndicator === 'year') return `${year}`; // YYYY
            return `${day}.${month}.${year}`; // Default to DD.MM.YYYY
        };

        const start = formatDate(startDate);
        const end = formatDate(endDate);

        if (start && end && start !== end) {
            return `${start} - ${end}`;
        } else if (start) {
            return start;
        } else if (end) {
            return end;
        }
        return '-';
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigateTo('inventory', inventory?.id);
        }
    };

    const handleDelete = () => {
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteItemMutation.mutateAsync({
                projectId,
                itemId: item.id
            });
            setShowDeletePopup(false);
            handleBack();
        } catch (error) {
            notify.error('Neizdevās dzēst vienību');
        }
    };

    const handleCancelDelete = () => {
        setShowDeletePopup(false);
    };

    const handleEdit = () => {
        setShowEditItem(true);
    };

    const handleRecordClick = (record) => {
        if (!record || !record.id) {
            return;
        }

        navigateTo('record', record.id, inventory.id, item.id, { tab: viewMode });
    };

    const handleEditRecord = (record) => {
        if (!record || !record.id) {
            return;
        }
        setSelectedRecordForEdit(record);
        setShowEditDocumentRecord(true);
    };

    const handleJumpToItem = () => {
        if (!jumpToNumber) return;

        const targetItem = inventoryItems.find(i => i.number === parseInt(jumpToNumber));
        if (targetItem) {
            navigateTo('item', targetItem.id, inventory?.id);
            setJumpToNumber('');
        } else {
            setSearchedItemNumber(jumpToNumber);
            setShowItemNotFoundPopup(true);
        }
    };

    const handleCloseItemNotFound = () => {
        setShowItemNotFoundPopup(false);
        setSearchedItemNumber('');
        setJumpToNumber('');
    };

    const handleRelatedItemClick = (relatedItem) => {
        navigateTo('item', relatedItem.id, inventory?.id);
    };

    const handleDeleteMediaRecord = async () => {
        if (!mediaRecord) return;

        const ok = await showConfirm({
            title: 'Dzēst ierakstu?',
            message: 'Vai tiešām vēlaties dzēst šo ierakstu?',
            confirmText: 'Dzēst',
            variant: 'danger'
        });
        if (ok) {
            const scrollContainer = document.querySelector('.item-detail-content');
            if (scrollContainer) {
                scrollPositionRef.current = scrollContainer.scrollTop;
            }

            try {
                const mediaType = inventory.type;
                await deleteMediaRecordMutation.mutateAsync({
                    projectId,
                    recordId: mediaRecord.id,
                    recordType: mediaType
                });

                queryClient.invalidateQueries(['project', 'detail', projectId]);

                setTimeout(() => {
                    if (scrollContainer && scrollPositionRef.current > 0) {
                        scrollContainer.scrollTop = scrollPositionRef.current;
                    }
                }, 100);

            } catch (error) {
                notify.error('Neizdevās dzēst ierakstu');
            }
        }
    };

    const handleRecordCreated = () => {
        const scrollContainer = document.querySelector('.item-detail-content');
        if (scrollContainer) {
            scrollPositionRef.current = scrollContainer.scrollTop;
        }

        queryClient.invalidateQueries(['project', 'detail', projectId]);
        setShowCreateRecord(false);

        setTimeout(() => {
            if (scrollContainer && scrollPositionRef.current > 0) {
                scrollContainer.scrollTop = scrollPositionRef.current;
            }
        }, 100);
    };

    const handleMetadataUpdated = () => {
        const scrollContainer = document.querySelector('.item-detail-content');
        if (scrollContainer) {
            scrollPositionRef.current = scrollContainer.scrollTop;
        }

        queryClient.invalidateQueries(['project', 'detail', projectId]);
        setShowEditMetadata(false);

        setTimeout(() => {
            if (scrollContainer && scrollPositionRef.current > 0) {
                scrollContainer.scrollTop = scrollPositionRef.current;
            }
        }, 100);
    };

    // RENDER FUNCTION FOR COMBINED VIEW (Electronic Media)
    const renderCombinedView = () => {
        return (
            <div className="item-combined-view">
                {/* Tabs with integrated controls and actions */}
                <div className="item-view-tabs">
                    {/* Left side - Tab buttons */}
                    <div className="item-view-tabs-left">
                        <button
                            className="item-view-tab item-view-tab-active"
                        >
                            <i className="fas fa-info-circle"></i>
                            Pamatinformācija
                        </button>
                    </div>

                    {/* Right side - Action Buttons */}
                    <div className="item-view-tabs-right">
                        <div className="item-header-actions">
                            <button
                                className="item-action-btn item-action-edit-btn"
                                onClick={handleEdit}
                                title="Rediģēt vienību"
                            >
                                <i className="fas fa-edit"></i>
                                <span>Rediģēt</span>
                            </button>
                            <button
                                className="item-action-btn item-action-delete-btn"
                                onClick={handleDelete}
                                title="Dzēst vienību"
                            >
                                <i className="fas fa-trash"></i>
                                <span>Dzēst</span>
                            </button>
                            {/* Show delete or add button based on whether media record exists */}
                            {mediaRecord ? (
                                <button
                                    className="item-action-btn item-action-delete-btn"
                                    onClick={handleDeleteMediaRecord}
                                    title="Dzēst ierakstu"
                                >
                                    <i className="fas fa-trash"></i>
                                    <span>Dzēst Ierakstu</span>
                                </button>
                            ) : (
                                <button
                                    className="item-action-btn item-action-create-btn"
                                    onClick={() => setShowCreateRecord(true)}
                                    disabled={!uiConfig.showCreateRecordButton}
                                    title="Pievienot ierakstu"
                                >
                                    <i className="fas fa-plus-circle"></i>
                                    <span>Pievienot Ierakstu</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* SIDE-BY-SIDE LAYOUT FOR ELECTRONIC_MEDIA */}
                <div className="item-detail-content item-detail-content-sidebyside">
                    {/* LEFT COLUMN - Item Overview */}
                    <div className="item-overview-column">
                        {/* SECTIONS GRID */}
                        <div className="item-sections-grid">
                            {/* Basic Information */}
                            <section className="item-info-section">
                                <h2 className="item-section-heading">
                                    <i className="fas fa-info-circle"></i>
                                    Pamata informācija
                                </h2>
                                <div className="item-data-segments">
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                            <span className="item-segment-label">Nosaukums:</span>
                                            <span className={`item-segment-value ${!item.title ? 'item-segment-empty' : ''}`}>
                                                {item.title || 'Nav norādīts'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment">
                                        <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                            <span className="item-segment-label">Sērijas kods:</span>
                                            <span className={`item-segment-value ${!item.series_code ? 'item-segment-empty' : ''}`}>
                                                {item.series_code || 'Nav norādīts'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment">
                                        <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                            <span className="item-segment-label">Valoda:</span>
                                            <span className={`item-segment-value ${!item.language ? 'item-segment-empty' : ''}`}>
                                                {item.language || 'Nav norādīta'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Date Information */}
                            <section className="item-info-section">
                                <h2 className="item-section-heading">
                                    <i className="fas fa-calendar-alt"></i>
                                    Datējums
                                </h2>
                                <div className="item-data-segments">
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                            <span className="item-segment-label">Datumu periods:</span>
                                            <span className={`item-segment-value ${!item.start_date && !item.end_date ? 'item-segment-empty' : ''}`}>
                                                {(item.start_date || item.end_date) ? formatDateRange(item.start_date, item.end_date, item.date_indicator) : 'Nav norādīts'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                            <span className="item-segment-label">Datējuma piezīmes:</span>
                                            <span className={`item-segment-value ${!item.date_note ? 'item-segment-empty' : ''}`}>
                                                {item.date_note || 'Nav piezīmju'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Technical Information */}
                            <section className="item-info-section">
                                <h2 className="item-section-heading">
                                    <i className="fas fa-cog"></i>
                                    Tehniskā informācija
                                </h2>
                                <div className="item-data-segments">
                                    {/* Hide size and unit_of_measure for electronic media and electronic textual */}
                                    {!(inventory?.type === 'Foto' || inventory?.type === 'Video' || inventory?.type === 'Skaņas' || (inventory?.electronic && inventory?.type === 'Tekstuāls')) && (
                                        <>
                                            <div className="item-segment">
                                                <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                    <span className="item-segment-label">Apjoms:</span>
                                                    <span className={`item-segment-value ${!item.size ? 'item-segment-empty' : ''}`}>
                                                        {item.size || 'Nav norādīts'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="item-segment">
                                                <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                    <span className="item-segment-label">Mērvienība:</span>
                                                    <span className={`item-segment-value ${!item.unit_of_measure ? 'item-segment-empty' : ''}`}>
                                                        {item.unit_of_measure || 'Nav norādīta'}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                            <span className="item-segment-label">Sistematizācija:</span>
                                            <span className={`item-segment-value ${!item.sistematisation ? 'item-segment-empty' : ''}`}>
                                                {item.sistematisation || 'Nav norādīta'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                            <span className="item-segment-label">Kopija:</span>
                                            <span className={`item-segment-value ${!item.copy ? 'item-segment-empty' : ''}`}>
                                                {item.copy || 'Nav norādīta'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                            <span className="item-segment-label">Arhīva vēsture:</span>
                                            <span className={`item-segment-value ${!item.archival_history ? 'item-segment-empty' : ''}`}>
                                                {item.archival_history || 'Nav norādīta'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Access and Security */}
                            <section className="item-info-section">
                                <h2 className="item-section-heading">
                                    <i className="fas fa-lock"></i>
                                    Pieejamība un slepenība
                                </h2>
                                <div className="item-data-segments">
                                    <div className="item-segment">
                                        <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                            <span className="item-segment-label">Pieejamība:</span>
                                            <span className={`item-segment-value ${!item.restriction ? 'item-segment-empty' : ''}`}>
                                                {item.restriction || 'Nav ierobežojumu'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                            <span className="item-segment-label">Pieejamības piezīmes:</span>
                                            <span className={`item-segment-value ${!item.restriction_note ? 'item-segment-empty' : ''}`}>
                                                {item.restriction_note || 'Nav piezīmju'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment">
                                        <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                            <span className="item-segment-label">Slepenības līmenis:</span>
                                            <span className={`item-segment-value ${!item.security_level ? 'item-segment-empty' : ''}`}>
                                                {item.security_level || 'Nav norādīts'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                            <span className="item-segment-label">Slepenības piezīmes:</span>
                                            <span className={`item-segment-value ${!item.security_level_note ? 'item-segment-empty' : ''}`}>
                                                {item.security_level_note || 'Nav piezīmju'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* MEDIA RECORD DISPLAY - For ELECTRONIC_MEDIA */}
                            {mediaRecord ? (
                                <section className="item-info-section">
                                    <h2 className="item-section-heading">
                                        <i className={`fas ${getEntityIcon(inventory.type, inventory.electronic)}`}></i>
                                        {inventory.type === 'Foto' ? 'Foto Dokuments' :
                                         inventory.type === 'Video' ? 'Video Dokuments' :
                                         inventory.type === 'Skaņas' ? 'Skaņas Dokuments' :
                                         'Medija Dokuments'}
                                    </h2>
                                    <div className="item-data-segments">
                                        {mediaRecord.color && (
                                            <div className="item-segment">
                                                <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                    <span className="item-segment-label">Krāsu telpa:</span>
                                                    <span className="item-segment-value">{mediaRecord.color}</span>
                                                </div>
                                            </div>
                                        )}

                                        {(mediaRecord.horizontal_resolution || mediaRecord.vertical_resolution) && (
                                            <div className="item-segment">
                                                <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                    <span className="item-segment-label">Izšķirtspēja:</span>
                                                    <span className="item-segment-value">
                                                        {mediaRecord.horizontal_resolution || '-'} x {mediaRecord.vertical_resolution || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {mediaRecord.duration && (
                                            <div className="item-segment">
                                                <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                    <span className="item-segment-label">Ilgums:</span>
                                                    <span className="item-segment-value">{mediaRecord.duration}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="item-segment item-segment-wide">
                                            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                                <button
                                                    className="item-btn item-btn-secondary"
                                                    onClick={() => setShowEditMetadata(true)}
                                                    style={{ flex: 1 }}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                    Rediģēt
                                                </button>
                                                <button
                                                    className="item-btn item-btn-error"
                                                    onClick={handleDeleteMediaRecord}
                                                    style={{ flex: 1 }}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                    Dzēst
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            ) : uiConfig.showCreateRecordButton && (
                                <section className="item-info-section item-records-empty-section">
                                    <h2 className="item-section-heading">
                                        <i className={`fas ${getEntityIcon(inventory.type, inventory.electronic)}`}></i>
                                        Dokuments
                                    </h2>
                                    <div className="item-records-empty-simple">
                                        <div className="item-records-simple-content">
                                            <p className="item-records-simple-text">
                                                {inventory.type === 'Foto' ? 'Nav pievienots foto dokuments' :
                                                inventory.type === 'Video' ? 'Nav pievienots video dokuments' :
                                                inventory.type === 'Skaņas' ? 'Nav pievienots audio dokuments' :
                                                'Nav pievienots elektroniskais dokuments'}
                                            </p>
                                            <button
                                                className="inv-action-btn inv-edit-btn"
                                                onClick={() => setShowCreateRecord(true)}
                                                disabled={!uiConfig.showCreateRecordButton}
                                            >
                                                <span>{
                                                    inventory.type === 'Foto' ? 'Pievienot foto dokumentu' :
                                                    inventory.type === 'Video' ? 'Pievienot video dokumentu' :
                                                    inventory.type === 'Skaņas' ? 'Pievienot audio dokumentu' :
                                                    'Pievienot dokumentu'
                                                }</span>
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Annotation Section - moved above Notes */}
                            <section className="item-info-section item-info-section-full">
                                <h2 className="item-section-heading">
                                    <i className="fas fa-file-alt"></i>
                                    Saturs
                                </h2>
                                <div className="item-notes-content">
                                    {item.annotation ? (
                                        <span>{item.annotation}</span>
                                    ) : (
                                        <span className="item-segment-empty">Satura Nav</span>
                                    )}
                                </div>
                            </section>

                            {/* Notes Section */}
                            <section className="item-info-section item-info-section-full">
                                <h2 className="item-section-heading">
                                    <i className="fas fa-sticky-note"></i>
                                    Piezīmes
                                </h2>
                                <div className="item-notes-content">
                                    {item.notes ? (
                                        <span>{item.notes}</span>
                                    ) : (
                                        <span className="item-segment-empty">Nav piezīmju</span>
                                    )}
                                </div>
                            </section>

                            {/* RELATED ITEMS TABLE - Always visible */}
                            <section className="item-related-items-section item-info-section-full">
                                <h2 className="item-section-heading">
                                    <i className="fas fa-link"></i>
                                    Saistītās glabājamās vienības {relatedItems.length > 0 && `(${relatedItems.length})`}
                                </h2>
                                <div className="item-related-items-table-wrapper">
                                    <table className={`item-related-items-table ${relatedItems.length === 0 ? 'item-related-items-table-empty' : ''}`}>
                                        <thead>
                                            <tr>
                                                <th>US</th>
                                                <th>GV</th>
                                                <th>Nosaukums</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {relatedItems.length === 0 ? (
                                                <tr className="item-related-items-empty-row">
                                                    <td colSpan="3">Nav izvēlēta neviena saistītā glabājamā vienība</td>
                                                </tr>
                                            ) : (
                                                relatedItems.map((relatedItem) => (
                                                    <tr
                                                        key={relatedItem.id}
                                                        onClick={() => handleRelatedItemClick(relatedItem)}
                                                        className="item-related-items-row"
                                                    >
                                                        <td className="item-related-inventory">{inventory?.number || '-'}</td>
                                                        <td className="item-related-gv-number">{relatedItem.number}</td>
                                                        <td className="item-related-title">{relatedItem.title || 'Bez nosaukuma'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // RENDER FUNCTION FOR SEGMENTED VIEW (Documents)
    const renderSegmentedView = () => {
        // Determine if this is a physical inventory (no records/files structure)
        const isPhysical = !inventory.electronic;

        return (
            <div className="item-segmented-view">
                {/* Tabs with integrated controls and actions */}
                <div className="item-view-tabs">
                    {/* Left side - Tab buttons */}
                    <div className="item-view-tabs-left">
                        <button
                            className={`item-view-tab ${viewMode === 'overview' ? 'item-view-tab-active' : ''}`}
                            onClick={() => { handleViewChange('overview'); setUserHasManuallySetView(true); }}
                        >
                            <i className="fas fa-info-circle"></i>
                            Pamatinformācija
                        </button>
                        {/* Dokumenti tab - only show for non-physical items */}
                        {!isPhysical && (
                            <button
                                className={`item-view-tab ${viewMode === 'records' ? 'item-view-tab-active' : ''}`}
                                onClick={() => { handleViewChange('records'); setUserHasManuallySetView(true); }}
                            >
                                <i className={`fas ${getEntityIcon(inventory.type, inventory.electronic)}`}></i>
                                Dokumenti
                                {recordCount > 0 ? (
                                    <span className="item-tab-badge">{recordCount}</span>
                                ) : (
                                    <ValidationIndicator
                                        validation={{ status: 'WARNING', errors: [], warnings: [{ id: 'NO_RECORDS', message: 'Nav pievienoti dokumenti' }] }}
                                        size="small"
                                        showTooltip={false}
                                        clickable={false}
                                        showCount={false}
                                    />
                                )}
                            </button>
                        )}
                    </div>

                    {/* Right side - Controls and Actions */}
                    <div className="item-view-tabs-right">
                        {/* Document Controls (visible only on Documents tab for non-physical items) */}
                        {!isPhysical && (
                            <div className={`item-tab-controls ${viewMode === 'records' ? 'visible' : ''}`}>

                            


                            {/* Search Input */}
                            <input
                                type="text"
                                className="item-tab-search"
                                placeholder="Meklēt dokumentus..."
                                value={recordsSearch}
                                onChange={(e) => setRecordsSearch(e.target.value)}
                            />

                            {/* View Toggle */}
                            <div className="item-tab-view-toggle">
                                <button
                                    className={`item-tab-view-btn ${recordsViewMode === 'table' ? 'active' : ''}`}
                                    onClick={() => setRecordsViewMode('table')}
                                    title="Tabulas skats"
                                >
                                    <i className="fas fa-table"></i>
                                </button>
                                <button
                                    className={`item-tab-view-btn ${recordsViewMode === 'cards' ? 'active' : ''}`}
                                    onClick={() => setRecordsViewMode('cards')}
                                    title="Karšu skats"
                                >
                                    <i className="fas fa-th-large"></i>
                                </button>
                            </div>
                        </div>
                        )}

                        {/* Action Buttons (always visible) */}
                        <div className="item-header-actions">
                            <button
                                className="item-action-btn item-action-edit-btn"
                                onClick={handleEdit}
                                title="Rediģēt vienību"
                            >
                                <i className="fas fa-edit"></i>
                                <span>Rediģēt</span>
                            </button>
                            <button
                                className="item-action-btn item-action-delete-btn"
                                onClick={handleDelete}
                                title="Dzēst vienību"
                            >
                                <i className="fas fa-trash"></i>
                                <span>Dzēst</span>
                            </button>
                            {/* Only show add document button for non-physical items and not on records tab */}
                            {!isPhysical && viewMode !== 'records' && (
                                <button
                                    className="item-action-btn item-action-create-btn"
                                    onClick={() => setShowCreateRecord(true)}
                                    disabled={!uiConfig.showCreateRecordButton}
                                    title="Pievienot dokumentu"
                                >
                                    <i className="fas fa-plus-circle"></i>
                                    <span>Pievienot Dokumentu</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className={`item-detail-content ${isTransitioning ? 'item-detail-content-transitioning' : ''}`}>
                    {viewMode === 'overview' ? (
                        <div className="item-overview-content">
                            {/* SECTIONS GRID */}
                            <div className="item-sections-grid">
                                {/* Basic Information */}
                                <section className="item-info-section">
                                    <h2 className="item-section-heading">
                                        <i className="fas fa-info-circle"></i>
                                        Pamata informācija
                                    </h2>
                                    <div className="item-data-segments">
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                <span className="item-segment-label">Nosaukums:</span>
                                                <span className={`item-segment-value ${!item.title ? 'item-segment-empty' : ''}`}>
                                                    {item.title || 'Nav norādīts'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment">
                                            <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                <span className="item-segment-label">Sērijas kods:</span>
                                                <span className={`item-segment-value ${!item.series_code ? 'item-segment-empty' : ''}`}>
                                                    {item.series_code || 'Nav norādīts'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment">
                                            <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                <span className="item-segment-label">Valoda:</span>
                                                <span className={`item-segment-value ${!item.language ? 'item-segment-empty' : ''}`}>
                                                    {item.language || 'Nav norādīta'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Date Information */}
                                <section className="item-info-section">
                                    <h2 className="item-section-heading">
                                        <i className="fas fa-calendar-alt"></i>
                                        Datējums
                                    </h2>
                                    <div className="item-data-segments">
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                <span className="item-segment-label">Datumu periods:</span>
                                                <span className={`item-segment-value ${!item.start_date && !item.end_date ? 'item-segment-empty' : ''}`}>
                                                    {(item.start_date || item.end_date) ? formatDateRange(item.start_date, item.end_date, item.date_indicator) : 'Nav norādīts'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                <span className="item-segment-label">Datējuma piezīmes:</span>
                                                <span className={`item-segment-value ${!item.date_note ? 'item-segment-empty' : ''}`}>
                                                    {item.date_note || 'Nav piezīmju'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Technical Information */}
                                <section className="item-info-section">
                                    <h2 className="item-section-heading">
                                        <i className="fas fa-cog"></i>
                                        Tehniskā informācija
                                    </h2>
                                    <div className="item-data-segments">
                                        {/* Hide size and unit_of_measure for electronic media and electronic textual */}
                                        {!(inventory?.type === 'Foto' || inventory?.type === 'Video' || inventory?.type === 'Skaņas' || (inventory?.electronic && inventory?.type === 'Tekstuāls')) && (
                                            <>
                                                <div className="item-segment">
                                                    <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                        <span className="item-segment-label">Apjoms:</span>
                                                        <span className={`item-segment-value ${!item.size ? 'item-segment-empty' : ''}`}>
                                                            {item.size || 'Nav norādīts'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="item-segment">
                                                    <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                        <span className="item-segment-label">Mērvienība:</span>
                                                        <span className={`item-segment-value ${!item.unit_of_measure ? 'item-segment-empty' : ''}`}>
                                                            {item.unit_of_measure || 'Nav norādīta'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                <span className="item-segment-label">Sistematizācija:</span>
                                                <span className={`item-segment-value ${!item.sistematisation ? 'item-segment-empty' : ''}`}>
                                                    {item.sistematisation || 'Nav norādīta'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                <span className="item-segment-label">Kopija:</span>
                                                <span className={`item-segment-value ${!item.copy ? 'item-segment-empty' : ''}`}>
                                                    {item.copy || 'Nav norādīta'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                <span className="item-segment-label">Arhīva vēsture:</span>
                                                <span className={`item-segment-value ${!item.archival_history ? 'item-segment-empty' : ''}`}>
                                                    {item.archival_history || 'Nav norādīta'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Access and Security */}
                                <section className="item-info-section">
                                    <h2 className="item-section-heading">
                                        <i className="fas fa-lock"></i>
                                        Pieejamība un slepenība
                                    </h2>
                                    <div className="item-data-segments">
                                        <div className="item-segment">
                                            <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                <span className="item-segment-label">Pieejamība:</span>
                                                <span className={`item-segment-value ${!item.restriction ? 'item-segment-empty' : ''}`}>
                                                    {item.restriction || 'Nav ierobežojumu'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                <span className="item-segment-label">Pieejamības piezīmes:</span>
                                                <span className={`item-segment-value ${!item.restriction_note ? 'item-segment-empty' : ''}`}>
                                                    {item.restriction_note || 'Nav piezīmju'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment">
                                            <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                <span className="item-segment-label">Slepenības līmenis:</span>
                                                <span className={`item-segment-value ${!item.security_level ? 'item-segment-empty' : ''}`}>
                                                    {item.security_level || 'Nav norādīts'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                <span className="item-segment-label">Slepenības piezīmes:</span>
                                                <span className={`item-segment-value ${!item.security_level_note ? 'item-segment-empty' : ''}`}>
                                                    {item.security_level_note || 'Nav piezīmju'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Annotation Section - moved above Notes */}
                                <section className="item-info-section item-info-section-full">
                                    <h2 className="item-section-heading">
                                        <i className="fas fa-file-alt"></i>
                                        Saturs
                                    </h2>
                                    <div className="item-notes-content">
                                        {item.annotation ? (
                                            <span>{item.annotation}</span>
                                        ) : (
                                            <span className="item-segment-empty">Satura nav</span>
                                        )}
                                    </div>
                                </section>

                                {/* Notes Section */}
                                <section className="item-info-section item-info-section-full">
                                    <h2 className="item-section-heading">
                                        <i className="fas fa-sticky-note"></i>
                                        Piezīmes
                                    </h2>
                                    <div className="item-notes-content">
                                        {item.notes ? (
                                            <span>{item.notes}</span>
                                        ) : (
                                            <span className="item-segment-empty">Nav piezīmju</span>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* RELATED ITEMS TABLE - Always visible */}
                            <section className="item-related-items-section">
                                <h2 className="item-related-items-heading">
                                    <i className="fas fa-link item-related-items-icon"></i>
                                    Saistītās glabājamās vienības {relatedItems.length > 0 && `(${relatedItems.length})`}
                                </h2>
                                <div className="item-related-items-table-wrapper">
                                    <table className={`item-related-items-table ${relatedItems.length === 0 ? 'item-related-items-table-empty' : ''}`}>
                                        <thead>
                                            <tr>
                                                <th>US</th>
                                                <th>GV</th>
                                                <th>Nosaukums</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {relatedItems.length === 0 ? (
                                                <tr className="item-related-items-empty-row">
                                                    <td colSpan="3">Nav izvēlēta neviena saistītā glabājamā vienība</td>
                                                </tr>
                                            ) : (
                                                relatedItems.map((relatedItem) => (
                                                    <tr
                                                        key={relatedItem.id}
                                                        onClick={() => handleRelatedItemClick(relatedItem)}
                                                        className="item-related-items-row"
                                                    >
                                                        <td className="item-related-inventory">{inventory?.number || '-'}</td>
                                                        <td className="item-related-gv-number">{relatedItem.number}</td>
                                                        <td className="item-related-title">{relatedItem.title || 'Bez nosaukuma'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    ) : !isPhysical ? (
                        <div className="item-records-content item-documents-view">
                            <RecordsList
                                records={itemRecords}
                                item={item}
                                inventory={inventory}
                                projectId={projectId}
                                onRecordClick={handleRecordClick}
                                onEditRecord={handleEditRecord}
                                onCreateRecord={() => setShowCreateRecord(true)}
                                showCreateButton={uiConfig.showCreateRecordButton}
                                viewMode={recordsViewMode}
                                externalViewMode={true}
                                externalSearch={recordsSearch}
                                externalColumnVisibility={columnVisibility}
                                onViewModeChange={setRecordsViewMode}
                                onSearchChange={setRecordsSearch}
                                onColumnVisibilityChange={setColumnVisibility}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    };

    // MAIN RENDER
    return (
        <div className="item-detail-wrapper">
            {/* PAGINATION HEADER */}
            <div className="item-pagination-header">
                <button 
                    className="item-back-btn"
                    onClick={handleBack}
                    title="Atpakaļ uz sarakstu"
                >
                    ← Atpakaļ
                </button>

                <div className="item-pagination-controls">
                    <button 
                        className="item-pagination-btn item-pagination-prev"
                        onClick={handlePrevItem}
                        disabled={!prevItem}
                        title={prevItem ? `Iepriekšējā: ${prevItem.number} - ${prevItem.title}` : 'Nav iepriekšējās'}
                    >
                        <i className="fas fa-chevron-left"></i>
                        <span className="item-pagination-label">Iepriekšējā</span>
                    </button>

                    <div className="item-pagination-info">
                        <span className="item-pagination-current">GV {inventoryItems[currentIndex].number}</span>
                        <span className="item-pagination-separator">/</span>
                        <span className="item-pagination-total">{inventoryItems[inventoryItems.length-1].number}</span>
                    </div>

                    <button 
                        className="item-pagination-btn item-pagination-next"
                        onClick={handleNextItem}
                        disabled={!nextItem}
                        title={nextItem ? `Nākamā: ${nextItem.number} - ${nextItem.title}` : 'Nav nākamās'}
                    >
                        <span className="item-pagination-label">Nākamā</span>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>

                {/* Jump to Item */}
                <div className="item-jump-controls">
                    <input
                        type="number"
                        className="item-jump-input"
                        placeholder="Nr."
                        value={jumpToNumber}
                        onChange={(e) => setJumpToNumber(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleJumpToItem()}
                    />
                    <button 
                        className="item-jump-btn"
                        onClick={handleJumpToItem}
                        disabled={!jumpToNumber}
                        title="Pāriet uz vienību"
                    >
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            {inheritanceInfo.category === 'ELECTRONIC_MEDIA' || inheritanceInfo.usesCombinedView 
                ? renderCombinedView() 
                : renderSegmentedView()
            }

            {/* MODALS */}
            {showCreateRecord && (inheritanceInfo.isMedia || inheritanceInfo.isElectronicMedia) && (
                <CreateMediaRecord
                    onClose={() => setShowCreateRecord(false)}
                    onCreate={handleRecordCreated}
                    item={item}
                    inventory={inventory}
                    projectId={projectId}
                />
            )}

            {showCreateRecord && !(inheritanceInfo.isMedia || inheritanceInfo.isElectronicMedia) && (
                <CreateDocumentRecord
                    onClose={() => setShowCreateRecord(false)}
                    onCreate={handleRecordCreated}
                    item={item}
                    inventory={inventory}
                    projectId={projectId}
                />
            )}

            {showEditItem && (
                <EditItemNavigable
                    ref={editItemRef}
                    onClose={() => setShowEditItem(false)}
                    onUpdate={async (itemId, itemData) => {
                        await updateItemMutation.mutateAsync({
                            itemData,
                            projectId,
                            itemId
                        });
                    }}
                    item={item}
                    inventory={inventory}
                    allItems={inventoryItems}
                    prevItem={prevItem}
                    nextItem={nextItem}
                    onNavigate={handleEditNavigate}
                />
            )}

            {showEditMetadata && (singleRecord || mediaRecord) && (
                <EditMediaRecordMetadata
                    onClose={() => setShowEditMetadata(false)}
                    onUpdate={handleMetadataUpdated}
                    record={mediaRecord || singleRecord}
                    inventory={inventory}
                    projectId={projectId}
                />
            )}

            {showEditDocumentRecord && selectedRecordForEdit && (
                <EditDocumentRecord
                    onClose={() => {
                        setShowEditDocumentRecord(false);
                        setSelectedRecordForEdit(null);
                    }}
                    onUpdate={() => {
                        setShowEditDocumentRecord(false);
                        setSelectedRecordForEdit(null);
                        queryClient.invalidateQueries(['project', projectId]);
                        queryClient.invalidateQueries(['project', 'detail', projectId]);
                    }}
                    record={selectedRecordForEdit}
                    item={item}
                    inventory={inventory}
                    projectId={projectId}
                />
            )}

            {/* Delete Confirmation Popup */}
            <ItemDeletePopup
                isOpen={showDeletePopup}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                items={[item]}
                inventory={inventory}
            />

            {/* Item Not Found Popup */}
            <ItemNotFoundPopup
                isOpen={showItemNotFoundPopup}
                onClose={handleCloseItemNotFound}
                itemNumber={searchedItemNumber}
                inventoryNumber={inventory?.number}
            />
        </div>
    );
};

export default Item;