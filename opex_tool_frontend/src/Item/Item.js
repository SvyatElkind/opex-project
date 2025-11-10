// Item.js - Enhanced with Pagination, Sections, and Related Items Table
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '../Navigation/context/NavigationContext';
import InheritanceUtils from '../Utils/InheritanceUtils';
import RecordsList from '../Record/RecordsList';
import CreateRecord from '../Record/CreateRecord';
import EditItemNavigable from './EditItemNavigable';
import EditMediaRecordMetadata from '../Record/EditMediaRecordMetadata';
import { useCreateRecord } from '../hooks/useRecords';
import { useDeleteItem } from '../hooks/useItems';
import { useRecord } from '../hooks/useRecords';
import './Item.css';

const Item = ({ item, inventory, projectId, onBack, onDelete, onEdit }) => {
    const { navigateTo, currentRecord } = useNavigation();
    const createRecordMutation = useCreateRecord();
    const deleteItemMutation = useDeleteItem();
    const [jumpToNumber, setJumpToNumber] = useState('');
    
    const [viewMode, setViewMode] = useState('overview');
    const [showCreateRecord, setShowCreateRecord] = useState(false);
    const [showEditItem, setShowEditItem] = useState(false);
    const [showEditMetadata, setShowEditMetadata] = useState(false);
    const [userHasManuallySetView, setUserHasManuallySetView] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
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

    // RENDER FUNCTION FOR COMBINED VIEW (Electronic Media)
    const renderCombinedView = () => {
        return (
            <div className="item-combined-view">
                {/* ALL SECTIONS IN ONE PAGE */}
                <div className="item-detail-content">
                    <div className="item-overview-content">
                        {/* SECTIONS GRID */}
                        <div className="item-sections-grid">
                            {/* Basic Information */}
                            <section className="item-info-section">
                                <h2 className="item-section-heading">📋 Pamata informācija</h2>
                                <div className="item-data-segments">
                                    <div className="item-segment">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Sērijas kods</span>
                                            <span className="item-segment-value">{displayValue(item.series_code)}</span>
                                        </div>
                                    </div>
                                    <div className="item-segment">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Numurs</span>
                                            <span className="item-segment-value">{displayValue(item.number)}</span>
                                        </div>
                                    </div>
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Virsraksts</span>
                                            <span className="item-segment-value">{displayValue(item.title)}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Date Information */}
                            <section className="item-info-section">
                                <h2 className="item-section-heading">📅 Datējums</h2>
                                <div className="item-data-segments">
                                    <div className="item-segment item-segment-wide">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Datumu periods</span>
                                            <span className="item-segment-value">
                                                {formatDateRange(item.start_date, item.end_date, item.date_indicator)}
                                            </span>
                                        </div>
                                    </div>
                                    {item.date_note && (
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Datējuma piezīmes</span>
                                                <span className="item-segment-value">{item.date_note}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                            {/* Access and Security */}
                            <section className="item-info-section">
                                <h2 className="item-section-heading">🔒 Pieejamība</h2>
                                <div className="item-data-segments">
                                    <div className="item-segment">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Valoda</span>
                                            <span className="item-segment-value">{displayValue(item.language)}</span>
                                        </div>
                                    </div>
                                    <div className="item-segment">
                                        <div className="item-segment-content">
                                            <span className="item-segment-label">Ierobežojumi</span>
                                            <span className="item-segment-value">{displayValue(item.restriction)}</span>
                                        </div>
                                    </div>
                                    {item.restriction_note && (
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Ierobežojumu piezīmes</span>
                                                <span className="item-segment-value">{item.restriction_note}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Additional Information */}
                            {item.notes && (
                                <section className="item-info-section item-info-section-full">
                                    <h2 className="item-section-heading">📝 Piezīmes</h2>
                                    <div className="item-notes-content">
                                        {item.notes}
                                    </div>
                                </section>
                            )}

                            {item.annotation && (
                                <section className="item-info-section item-info-section-full">
                                    <h2 className="item-section-heading">📝 Anotācija</h2>
                                    <div className="item-notes-content">
                                        {item.annotation}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* DOCUMENTS/RECORDS SECTION - In same page for Electronic Media */}
                        {recordCount > 0 && (
                            <section className="item-records-section-combined">
                                <h2 className="item-section-heading-large">
                                    <span className="item-section-icon-large">📁</span>
                                    Dokumenti ({recordCount})
                                </h2>
                                <div className="item-records-content">
                                    <RecordsList
                                        records={itemRecords}
                                        item={item}
                                        inventory={inventory}
                                        projectId={projectId}
                                        onRecordClick={handleRecordClick}
                                        onCreateRecord={() => setShowCreateRecord(true)}
                                        showCreateButton={uiConfig.showCreateRecordButton}
                                    />
                                </div>
                            </section>
                        )}

                        {/* RELATED ITEMS TABLE */}
                        {relatedItems.length > 0 && (
                            <section className="item-related-items-section">
                                <h2 className="item-related-items-heading">
                                    <span className="item-related-items-icon">🔗</span>
                                    Saistītās vienības ({relatedItems.length})
                                </h2>
                                <div className="item-related-items-table-wrapper">
                                    <table className="item-related-items-table">
                                        <thead>
                                            <tr>
                                                <th>Uzskaites saraksta Nr.</th>
                                                <th>GV Numurs</th>
                                                <th>Nosaukums</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {relatedItems.map((relatedItem) => (
                                                <tr 
                                                    key={relatedItem.id}
                                                    onClick={() => handleRelatedItemClick(relatedItem)}
                                                    className="item-related-items-row"
                                                >
                                                    <td>{inventory?.number || '-'}</td>
                                                    <td className="item-related-gv-number">{relatedItem.number}</td>
                                                    <td className="item-related-title">{relatedItem.title || 'Bez nosaukuma'}</td>
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
        );
    };

    // RENDER FUNCTION FOR SEGMENTED VIEW (Documents)
    const renderSegmentedView = () => {
        return (
            <div className="item-segmented-view">
                {/* Tabs */}
                <div className="item-view-tabs">
                    <button 
                        className={`item-view-tab ${viewMode === 'overview' ? 'item-view-tab-active' : ''}`}
                        onClick={() => { handleViewChange('overview'); setUserHasManuallySetView(true); }}
                    >
                        📋 Pārskats
                    </button>
                    <button 
                        className={`item-view-tab ${viewMode === 'records' ? 'item-view-tab-active' : ''}`}
                        onClick={() => { handleViewChange('records'); setUserHasManuallySetView(true); }}
                    >
                        🗂️ Dokumenti ({recordCount})
                    </button>
                
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

                {/* Content */}
                <div className={`item-detail-content ${isTransitioning ? 'item-detail-content-transitioning' : ''}`}>
                    {viewMode === 'overview' ? (
                        <div className="item-overview-content">
                            {/* SECTIONS GRID */}
                            <div className="item-sections-grid">
                                {/* Basic Information */}
                                <section className="item-info-section">
                                    <h2 className="item-section-heading">📋 Pamata informācija</h2>
                                    <div className="item-data-segments">
                                        <div className="item-segment">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">SĒrijas kods</span>
                                                <span className="item-segment-value">{displayValue(item.series_code)}</span>
                                            </div>
                                        </div>
                                        <div className="item-segment">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Numurs</span>
                                                <span className="item-segment-value">{displayValue(item.number)}</span>
                                            </div>
                                        </div>
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Virsraksts</span>
                                                <span className="item-segment-value">{displayValue(item.title)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Date Information */}
                                <section className="item-info-section">
                                    <h2 className="item-section-heading">📅 Datējums</h2>
                                    <div className="item-data-segments">
                                        <div className="item-segment item-segment-wide">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Datumu periods</span>
                                                <span className="item-segment-value">
                                                    {formatDateRange(item.start_date, item.end_date, item.date_indicator)}
                                                </span>
                                            </div>
                                        </div>
                                        {item.date_note && (
                                            <div className="item-segment item-segment-wide">
                                                <div className="item-segment-content">
                                                    <span className="item-segment-label">Datējuma piezīmes</span>
                                                    <span className="item-segment-value">{item.date_note}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Access and Security */}
                                <section className="item-info-section">
                                    <h2 className="item-section-heading">🔒 Pieejamība</h2>
                                    <div className="item-data-segments">
                                        <div className="item-segment">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Valoda</span>
                                                <span className="item-segment-value">{displayValue(item.language)}</span>
                                            </div>
                                        </div>
                                        <div className="item-segment">
                                            <div className="item-segment-content">
                                                <span className="item-segment-label">Ierobežojumi</span>
                                                <span className="item-segment-value">{displayValue(item.restriction)}</span>
                                            </div>
                                        </div>
                                        {item.restriction_note && (
                                            <div className="item-segment item-segment-wide">
                                                <div className="item-segment-content">
                                                    <span className="item-segment-label">Ierobežojumu piezīmes</span>
                                                    <span className="item-segment-value">{item.restriction_note}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Additional Information */}
                                {item.notes && (
                                    <section className="item-info-section item-info-section-full">
                                        <h2 className="item-section-heading">📝 Piezīmes</h2>
                                        <div className="item-notes-content">
                                            {item.notes}
                                        </div>
                                    </section>
                                )}

                                {item.annotation && (
                                    <section className="item-info-section item-info-section-full">
                                        <h2 className="item-section-heading">📝 Anotācija</h2>
                                        <div className="item-notes-content">
                                            {item.annotation}
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* RELATED ITEMS TABLE */}
                            {relatedItems.length > 0 && (
                                <section className="item-related-items-section">
                                    <h2 className="item-related-items-heading">
                                        <span className="item-related-items-icon">🔗</span>
                                        Saistītās vienības ({relatedItems.length})
                                    </h2>
                                    <div className="item-related-items-table-wrapper">
                                        <table className="item-related-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Uzskaites saraksta Nr.</th>
                                                    <th>GV Numurs</th>
                                                    <th>Nosaukums</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {relatedItems.map((relatedItem) => (
                                                    <tr 
                                                        key={relatedItem.id}
                                                        onClick={() => handleRelatedItemClick(relatedItem)}
                                                        className="item-related-items-row"
                                                    >
                                                        <td>{inventory?.number || '-'}</td>
                                                        <td className="item-related-gv-number">{relatedItem.number}</td>
                                                        <td className="item-related-title">{relatedItem.title || 'Bez nosaukuma'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : (
                        <div className="item-records-content">
                            <RecordsList
                                records={itemRecords}
                                item={item}
                                inventory={inventory}
                                projectId={projectId}
                                onRecordClick={handleRecordClick}
                                onCreateRecord={() => setShowCreateRecord(true)}
                                showCreateButton={uiConfig.showCreateRecordButton}
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
            {showCreateRecord && (
                <CreateRecord
                    onClose={() => setShowCreateRecord(false)}
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

            {showEditMetadata && singleRecord && (
                <EditMediaRecordMetadata
                    onClose={() => setShowEditMetadata(false)}
                    record={singleRecord}
                    projectId={projectId}
                />
            )}
        </div>
    );
};

export default Item;