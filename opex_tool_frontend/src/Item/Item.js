// Item.js - Enhanced with Pagination, Sections, and Related Items Table
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '../Navigation/context/NavigationContext';
import InheritanceUtils from '../Utils/InheritanceUtils';
import RecordsList from '../Record/RecordsList';
import CreateDocumentRecord from '../Record/CreateDocumentRecord';
import CreateMediaRecord from '../Record/CreateMediaRecord';
import EditItemNavigable from './EditItemNavigable';
import EditMediaRecordMetadata from '../Record/EditMediaRecordMetadata';
import { useCreateRecord, useDeleteMediaRecord } from '../hooks/useRecords';
import { useDeleteItem } from '../hooks/useItems';
import { useRecord } from '../hooks/useRecords';
import './Item.css';
import '../Inventory/InventoryItem.css';

const Item = ({ item, inventory, projectId, onBack, onDelete, onEdit }) => {
    const queryClient = useQueryClient();
    const { navigateTo, currentRecord } = useNavigation();
    const createRecordMutation = useCreateRecord();
    const deleteItemMutation = useDeleteItem();
    const deleteMediaRecordMutation = useDeleteMediaRecord();
    const [jumpToNumber, setJumpToNumber] = useState('');
    const scrollPositionRef = useRef(0);

    const [viewMode, setViewMode] = useState('overview');
    const [showCreateRecord, setShowCreateRecord] = useState(false);
    const [showEditItem, setShowEditItem] = useState(false);
    const [showEditMetadata, setShowEditMetadata] = useState(false);
    const [userHasManuallySetView, setUserHasManuallySetView] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Records controls state (for Documents tab)
    const [recordsViewMode, setRecordsViewMode] = useState('table');
    const [recordsSearch, setRecordsSearch] = useState('');
    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState({
        title: true,
        date: true,
        regNr: true,
        group: true,
        language: true,
        status: true
    });
    
    // Get all items from the current inventory
    const inventoryItems = inventory?.items || [];
    
    // Calculate inheritance info using the NEW system
    const inheritanceInfo = inventory ? InheritanceUtils.getInheritanceInfo(inventory) : {
        category: 'DOCUMENTS',
        isDocuments: true,
        type: 'Tekstuāls',
        icon: '📄',
        color: '#6c757d',
        usesSegmentedView: true,
        usesCombinedView: false
    };
    
    const navigationBehavior = (inventory && item) ? InheritanceUtils.getNavigationBehavior(inventory, item) : {
        action: 'stayAtItem'
    };
    
    const uiConfig = (inventory && item) ? InheritanceUtils.getItemUIConfig(inventory, item) : {
        showCreateRecordButton: false,
        maxRecordsAllowed: 0,
        badge: { text: 'Unknown', color: '#6c757d', icon: '❓' },
        validation: { allowed: false, message: 'Missing data' }
    };
    
    const attentionStatus = (inventory && item) ? InheritanceUtils.getItemAttentionStatus(inventory, item) : {
        icon: '⚠️',
        message: 'Nav datu',
        color: '#ffc107'
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

    useEffect(() => {
        if (!userHasManuallySetView) {
            if (navigationBehavior.action === 'navigateToRecord' && recordCount === 1) {
                setViewMode('records');
            } else if (inheritanceInfo.usesSegmentedView) {
                setViewMode('overview');
            } else if (inheritanceInfo.usesCombinedView) {
                setViewMode('overview');
            }
        }
    }, [navigationBehavior, recordCount, inheritanceInfo, userHasManuallySetView]);

    const displayValue = (value) => value || '-';

    const formatDateRange = (startDate, endDate, dateIndicator) => {
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            if (dateIndicator === 'day') return `${year}.${month}.${day}`;
            if (dateIndicator === 'month') return `${year}.${month}`;
            if (dateIndicator === 'year') return `${year}`;
            return `${year}.${month}.${day}`;
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

    const handleDelete = async () => {
        if (window.confirm(`Vai tiešām vēlaties dzēst vienību "${item.title}"?`)) {
            try {
                await deleteItemMutation.mutateAsync({
                    projectId,
                    itemId: item.id
                });
                handleBack();
            } catch (error) {
                console.error('Failed to delete item:', error);
                alert('Neizdevās dzēst vienību');
            }
        }
    };

    const handleEdit = () => {
        setShowEditItem(true);
    };

    const handleRecordClick = (record) => {
        if (!record || !record.id) {
            console.error('Invalid record:', record);
            return;
        }
        
        navigateTo('record', record.id, inventory.id, item.id);
    };

    const handleJumpToItem = () => {
        if (!jumpToNumber) return;
        
        const targetItem = inventoryItems.find(i => i.number === parseInt(jumpToNumber));
        if (targetItem) {
            navigateTo('item', targetItem.id, inventory?.id);
            setJumpToNumber('');
        } else {
            alert(`Vienība ar numuru "${jumpToNumber}" nav atrasta`);
        }
    };

    const handleRelatedItemClick = (relatedItem) => {
        navigateTo('item', relatedItem.id, inventory?.id);
    };

    const handleDeleteMediaRecord = async () => {
        if (!mediaRecord) return;

        if (window.confirm('Vai tiešām vēlaties dzēst šo ierakstu?')) {
            console.log('Deleting media record, saving scroll position...');

            // Save current scroll position
            const scrollContainer = document.querySelector('.item-detail-content');
            if (scrollContainer) {
                scrollPositionRef.current = scrollContainer.scrollTop;
                console.log('Saved scroll position:', scrollPositionRef.current);
            }

            try {
                const mediaType = inventory.type;
                await deleteMediaRecordMutation.mutateAsync({
                    projectId,
                    recordId: mediaRecord.id,
                    recordType: mediaType
                });

                console.log('Media record deleted, refreshing data...');

                // Invalidate queries to refresh the data
                queryClient.invalidateQueries(['project', 'detail', projectId]);

                // Restore scroll position after a short delay to allow DOM to update
                setTimeout(() => {
                    if (scrollContainer && scrollPositionRef.current > 0) {
                        scrollContainer.scrollTop = scrollPositionRef.current;
                        console.log('Restored scroll position:', scrollPositionRef.current);
                    }
                }, 100);

            } catch (error) {
                console.error('Failed to delete media record:', error);
                alert('Neizdevās dzēst ierakstu');
            }
        }
    };

    // Handle successful record creation - refresh data while preserving scroll position
    const handleRecordCreated = () => {
        console.log('Record created successfully, refreshing data...');

        // Save current scroll position
        const scrollContainer = document.querySelector('.item-detail-content');
        if (scrollContainer) {
            scrollPositionRef.current = scrollContainer.scrollTop;
            console.log('Saved scroll position:', scrollPositionRef.current);
        }

        // Invalidate queries to refresh the data
        queryClient.invalidateQueries(['project', 'detail', projectId]);

        // Close the modal
        setShowCreateRecord(false);

        // Restore scroll position after a short delay to allow DOM to update
        setTimeout(() => {
            if (scrollContainer && scrollPositionRef.current > 0) {
                scrollContainer.scrollTop = scrollPositionRef.current;
                console.log('Restored scroll position:', scrollPositionRef.current);
            }
        }, 100);
    };

    // Handle successful metadata update - refresh data while preserving scroll position
    const handleMetadataUpdated = () => {
        console.log('Metadata updated successfully, refreshing data...');

        // Save current scroll position
        const scrollContainer = document.querySelector('.item-detail-content');
        if (scrollContainer) {
            scrollPositionRef.current = scrollContainer.scrollTop;
            console.log('Saved scroll position:', scrollPositionRef.current);
        }

        // Invalidate queries to refresh the data
        queryClient.invalidateQueries(['project', 'detail', projectId]);

        // Close the modal
        setShowEditMetadata(false);

        // Restore scroll position after a short delay to allow DOM to update
        setTimeout(() => {
            if (scrollContainer && scrollPositionRef.current > 0) {
                scrollContainer.scrollTop = scrollPositionRef.current;
                console.log('Restored scroll position:', scrollPositionRef.current);
            }
        }, 100);
    };

    // Column visibility toggle handler
    const handleColumnToggle = (columnKey) => {
        setColumnVisibility(prev => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // Column names mapping
    const columnNames = {
        title: 'Nosaukums',
        date: 'Datums',
        regNr: 'Reģ. Nr.',
        group: 'Grupa',
        language: 'Valoda',
        status: 'Statuss'
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (columnSelectorOpen && !event.target.closest('.item-column-selector')) {
                setColumnSelectorOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [columnSelectorOpen]);

    // RENDER FUNCTION FOR COMBINED VIEW (Electronic Media)
    const renderCombinedView = () => {
        return (
            <div className="item-combined-view">
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
                                    <div className="item-segment">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Sērijas kods</span>
                                            <span className={`item-segment-value ${!item.series_code ? 'item-segment-empty' : ''}`}>
                                                {item.series_code || 'Nav norādīts'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Numurs</span>
                                            <span className={`item-segment-value ${!item.number ? 'item-segment-empty' : ''}`}>
                                                {item.number || 'Nav norādīts'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Virsraksts</span>
                                            <span className={`item-segment-value ${!item.title ? 'item-segment-empty' : ''}`}>
                                                {item.title || 'Nav norādīts'}
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
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Datumu periods</span>
                                            <span className={`item-segment-value ${!item.start_date && !item.end_date ? 'item-segment-empty' : ''}`}>
                                                {(item.start_date || item.end_date) ? formatDateRange(item.start_date, item.end_date, item.date_indicator) : 'Nav norādīts'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Datējuma piezīmes</span>
                                            <span className={`item-segment-value ${!item.date_note ? 'item-segment-empty' : ''}`}>
                                                {item.date_note || 'Nav piezīmju'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Access and Security */}
                            <section className="item-info-section">
                                <h2 className="item-section-heading">
                                    <i className="fas fa-lock"></i>
                                    Pieejamība
                                </h2>
                                <div className="item-data-segments">
                                    <div className="item-segment">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Valoda</span>
                                            <span className={`item-segment-value ${!item.language ? 'item-segment-empty' : ''}`}>
                                                {item.language || 'Nav norādīta'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Ierobežojumi</span>
                                            <span className={`item-segment-value ${!item.restriction ? 'item-segment-empty' : ''}`}>
                                                {item.restriction || 'Nav ierobežojumu'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Ierobežojumu piezīmes</span>
                                            <span className={`item-segment-value ${!item.restriction_note ? 'item-segment-empty' : ''}`}>
                                                {item.restriction_note || 'Nav piezīmju'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* MEDIA RECORD DISPLAY - For ELECTRONIC_MEDIA */}
                            {mediaRecord ? (
                                <section className="item-info-section">
                                    <h2 className="item-section-heading">
                                        <i className="fas fa-file-image"></i>
                                        Ieraksta informācija
                                    </h2>
                                    <div className="item-data-segments">
                                        <div className="item-segment">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">ID</span>
                                                <span className="item-segment-value">{mediaRecord.id}</span>
                                            </div>
                                        </div>

                                        {mediaRecord.color && (
                                            <div className="item-segment">
                                                <div className="item-segment-content">
                                                    <span className="item-segment-label">Krāsa</span>
                                                    <span className="item-segment-value">{mediaRecord.color}</span>
                                                </div>
                                            </div>
                                        )}

                                        {(mediaRecord.horizontal_resolution || mediaRecord.vertical_resolution) && (
                                            <div className="item-segment">
                                                <div className="item-segment-content">
                                                    <span className="item-segment-label">Izšķirtspēja</span>
                                                    <span className="item-segment-value">
                                                        {mediaRecord.horizontal_resolution || '-'} x {mediaRecord.vertical_resolution || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {mediaRecord.duration && (
                                            <div className="item-segment">
                                                <div className="item-segment-content">
                                                    <span className="item-segment-label">Ilgums</span>
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
                                        <i className="fas fa-folder-open"></i>
                                        Dokumenti
                                    </h2>
                                    <div className="item-records-empty-simple">
                                        <div className="item-records-simple-content">
                                            <i className={`fas ${
                                                inventory.type === 'Foto' ? 'fa-image' :
                                                inventory.type === 'Video' ? 'fa-video' :
                                                inventory.type === 'Skaņas' ? 'fa-music' :
                                                'fa-file-pdf'
                                            } item-records-file-icon`}></i>
                                            <p className="item-records-simple-text">
                                                {inventory.type === 'Foto' ? 'Pievienojiet fotoattēlu (JPG, PNG, TIFF, RAW)' :
                                                inventory.type === 'Video' ? 'Pievienojiet video ierakstu (MP4, AVI, MOV, MKV)' :
                                                inventory.type === 'Skaņas' ? 'Pievienojiet audio ierakstu (MP3, WAV, FLAC, AAC)' :
                                                'Pievienojiet elektronisko dokumentu (PDF, DOCX, vai cits formāts)'}
                                            </p>
                                            <button
                                                className="inv-action-btn inv-edit-btn"
                                                onClick={() => setShowCreateRecord(true)}
                                                disabled={!uiConfig.showCreateRecordButton}
                                            >
                                                <i className="fas fa-plus"></i>
                                                <span>Pievienot dokumentu</span>
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Additional Information */}
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

                            <section className="item-info-section item-info-section-full">
                                <h2 className="item-section-heading">
                                    <i className="fas fa-file-alt"></i>
                                    Anotācija
                                </h2>
                                <div className="item-notes-content">
                                    {item.annotation ? (
                                        <span>{item.annotation}</span>
                                    ) : (
                                        <span className="item-segment-empty">Nav anotācijas</span>
                                    )}
                                </div>
                            </section>

                            {/* RELATED ITEMS TABLE */}
                            {relatedItems.length > 0 && (
                                <section className="item-related-items-section item-info-section-full">
                                    <h2 className="item-section-heading">
                                        <i className="fas fa-link"></i>
                                        Saistītās vienības ({relatedItems.length})
                                    </h2>
                                    <div className="item-related-items-table-wrapper">
                                        <table className="item-related-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Nosaukums</th>
                                                    <th>Uzskaites saraksta Nr.</th>
                                                    <th>GV Numurs</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {relatedItems.map((relatedItem) => (
                                                    <tr
                                                        key={relatedItem.id}
                                                        onClick={() => handleRelatedItemClick(relatedItem)}
                                                        className="item-related-items-row"
                                                    >
                                                        <td className="item-related-title">{relatedItem.title || 'Bez nosaukuma'}</td>
                                                        <td className="item-related-inventory">{inventory?.number || '-'}</td>
                                                        <td className="item-related-gv-number">{relatedItem.number}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // RENDER FUNCTION FOR SEGMENTED VIEW (Documents)
    const renderSegmentedView = () => {
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
                            Pārskats
                        </button>
                        <button
                            className={`item-view-tab ${viewMode === 'records' ? 'item-view-tab-active' : ''}`}
                            onClick={() => { handleViewChange('records'); setUserHasManuallySetView(true); }}
                        >
                            <i className="fas fa-folder-open"></i>
                            Dokumenti
                            {recordCount > 0 && <span className="item-tab-badge">{recordCount}</span>}
                        </button>
                    </div>

                    {/* Right side - Controls and Actions */}
                    <div className="item-view-tabs-right">
                        {/* Document Controls (visible only on Documents tab) */}
                        <div className={`item-tab-controls ${viewMode === 'records' ? 'visible' : ''}`}>

                            


                            {/* Search Input */}
                            <input
                                type="text"
                                className="item-tab-search"
                                placeholder="Meklēt dokumentus..."
                                value={recordsSearch}
                                onChange={(e) => setRecordsSearch(e.target.value)}
                            />
                            {/* Column Selector */}
                            {recordsViewMode == 'table' && <div className="item-column-selector">
                                <button
                                    className={`item-column-selector-btn ${columnSelectorOpen ? 'open' : ''}`}
                                    onClick={() => setColumnSelectorOpen(!columnSelectorOpen)}
                                    title="Izvēlēties kolonnas"
                                >
                                    <i className="fas fa-columns"></i>
                                    Kolonnas
                                    <i className="fas fa-chevron-down"></i>
                                </button>
                                {columnSelectorOpen && (
                                    <div className="item-column-dropdown open">
                                        {Object.entries(columnNames).map(([key, label]) => (
                                            <div key={key} className="item-column-option">
                                                <input
                                                    type="checkbox"
                                                    id={`col-${key}`}
                                                    checked={columnVisibility[key]}
                                                    onChange={() => handleColumnToggle(key)}
                                                />
                                                <label htmlFor={`col-${key}`}>{label}</label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>}
                            
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
                            <button
                                className="item-action-btn item-action-create-btn"
                                onClick={() => setShowCreateRecord(true)}
                                disabled={!uiConfig.showCreateRecordButton}
                                title="Pievienot dokumentu"
                            >
                                <i className="fas fa-plus-circle"></i>
                                <span>Pievienot Dokumentu</span>
                            </button>
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
                                        <div className="item-segment">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Sērijas kods</span>
                                                <span className={`item-segment-value ${!item.series_code ? 'item-segment-empty' : ''}`}>
                                                    {item.series_code || 'Nav norādīts'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Numurs</span>
                                                <span className={`item-segment-value ${!item.number ? 'item-segment-empty' : ''}`}>
                                                    {item.number || 'Nav norādīts'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Virsraksts</span>
                                                <span className={`item-segment-value ${!item.title ? 'item-segment-empty' : ''}`}>
                                                    {item.title || 'Nav norādīts'}
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
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Datumu periods</span>
                                                <span className={`item-segment-value ${!item.start_date && !item.end_date ? 'item-segment-empty' : ''}`}>
                                                    {(item.start_date || item.end_date) ? formatDateRange(item.start_date, item.end_date, item.date_indicator) : 'Nav norādīts'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Datējuma piezīmes</span>
                                                <span className={`item-segment-value ${!item.date_note ? 'item-segment-empty' : ''}`}>
                                                    {item.date_note || 'Nav piezīmju'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Access and Security */}
                                <section className="item-info-section">
                                    <h2 className="item-section-heading">
                                        <i className="fas fa-lock"></i>
                                        Pieejamība
                                    </h2>
                                    <div className="item-data-segments">
                                        <div className="item-segment">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Valoda</span>
                                                <span className={`item-segment-value ${!item.language ? 'item-segment-empty' : ''}`}>
                                                    {item.language || 'Nav norādīta'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Ierobežojumi</span>
                                                <span className={`item-segment-value ${!item.restriction ? 'item-segment-empty' : ''}`}>
                                                    {item.restriction || 'Nav ierobežojumu'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Ierobežojumu piezīmes</span>
                                                <span className={`item-segment-value ${!item.restriction_note ? 'item-segment-empty' : ''}`}>
                                                    {item.restriction_note || 'Nav piezīmju'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Additional Information */}
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

                                <section className="item-info-section item-info-section-full">
                                    <h2 className="item-section-heading">
                                        <i className="fas fa-file-alt"></i>
                                        Anotācija
                                    </h2>
                                    <div className="item-notes-content">
                                        {item.annotation ? (
                                            <span>{item.annotation}</span>
                                        ) : (
                                            <span className="item-segment-empty">Nav anotācijas</span>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* RELATED ITEMS TABLE */}
                            {relatedItems.length > 0 && (
                                <section className="item-related-items-section">
                                    <h2 className="item-related-items-heading">
                                        <i className="fas fa-link item-related-items-icon"></i>
                                        Saistītās vienības ({relatedItems.length})
                                    </h2>
                                    <div className="item-related-items-table-wrapper">
                                        <table className="item-related-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Nosaukums</th>
                                                    <th>Uzskaites saraksta Nr.</th>
                                                    <th>GV Numurs</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {relatedItems.map((relatedItem) => (
                                                    <tr
                                                        key={relatedItem.id}
                                                        onClick={() => handleRelatedItemClick(relatedItem)}
                                                        className="item-related-items-row"
                                                    >
                                                        <td className="item-related-title">{relatedItem.title || 'Bez nosaukuma'}</td>
                                                        <td className="item-related-inventory">{inventory?.number || '-'}</td>
                                                        <td className="item-related-gv-number">{relatedItem.number}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : (
                        <div className="item-records-content item-documents-view">
                            <RecordsList
                                records={itemRecords}
                                item={item}
                                inventory={inventory}
                                projectId={projectId}
                                onRecordClick={handleRecordClick}
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
                    )}
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
                    onClose={() => setShowEditItem(false)}
                    onUpdate={() => {
                        setShowEditItem(false);
                        // Refresh handled by parent
                    }}
                    item={item}
                    inventory={inventory}
                    allItems={inventoryItems}
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
        </div>
    );
};

export default Item;