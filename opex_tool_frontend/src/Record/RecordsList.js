// src/Record/RecordsList.js
// Modern, sleek records list component with card and table views

import React, { useState, useMemo, useCallback } from 'react';
import { RECORD_UI } from '../Constants/Constants';
import { useBatchDeleteRecords } from '../hooks/useRecords';
import InheritanceUtils from '../Utils/InheritanceUtils';
import Utils from '../Utils/Utils';
import './RecordsList.css';
import '../Inventory/InventoryItem.css';

const RecordsList = ({
    records: recordsProp,
    item,
    inventory,
    projectId,
    onRecordClick,
    onCreateRecord,
    showCreateButton = true,
    viewMode: initialViewMode = 'table',
    // External control props (for Item Documents tab)
    externalViewMode = false,
    externalSearch = null,
    externalColumnVisibility = null,
    onViewModeChange = null,
    onSearchChange = null,
    onColumnVisibilityChange = null
}) => {
    const utils = Utils();
    const batchDeleteMutation = useBatchDeleteRecords();
    
    // Get inheritance info
    const inheritanceInfo = inventory ? InheritanceUtils.getInheritanceInfo(inventory) : {
        isTextual: true,
        isMedia: false,
        type: 'Tekstuāls',
        icon: '📄',
        color: 'var(--color-primary)'
    };
    
    // CRITICAL FIX: Extract records from item if not explicitly passed
    const records = useMemo(() => {
        // If records prop is explicitly passed, use it
        if (recordsProp && Array.isArray(recordsProp)) {
            return recordsProp;
        }
        
        // Otherwise, extract from item based on inventory type
        if (!item) return [];
        
        // For textual/database inventories, use item.records
        if (inheritanceInfo.isTextual) {
            return item.records || [];
        }
        
        // For media inventories, check the appropriate array
        if (inheritanceInfo.type === 'Foto') {
            return item.photo_records || [];
        }
        if (inheritanceInfo.type === 'Video') {
            return item.video_records || [];
        }
        if (inheritanceInfo.type === 'Skaņas') {
            return item.audio_records || [];
        }
        
        // Fallback to item.records
        return item.records || [];
    }, [recordsProp, item, inheritanceInfo]);
    
    // Determine optimal view mode
    const optimalViewMode = useMemo(() => {
        if (initialViewMode !== 'auto') return initialViewMode;
        return records.length > 10 ? 'table' : 'cards';
    }, [initialViewMode, records.length]);
    
    // Local state
    const [internalViewMode, setInternalViewMode] = useState(optimalViewMode);
    const [selectedRecords, setSelectedRecords] = useState(new Set());
    const [sortField, setSortField] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [internalSearchTerm, setInternalSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [internalColumnVisibility, setInternalColumnVisibility] = useState({
        title: true,
        date: true,
        regNr: true,
        group: true,
        language: true,
        status: true
    });

    // Use external or internal state based on props
    const viewMode = externalViewMode ? initialViewMode : internalViewMode;
    const setViewMode = externalViewMode ? onViewModeChange : setInternalViewMode;
    const searchTerm = externalSearch !== null ? externalSearch : internalSearchTerm;
    const setSearchTerm = externalSearch !== null ? onSearchChange : setInternalSearchTerm;
    const columnVisibility = externalColumnVisibility || internalColumnVisibility;
    const setColumnVisibility = externalColumnVisibility ? onColumnVisibilityChange : setInternalColumnVisibility;

    // Column names mapping
    const columnNames = {
        title: 'Nosaukums',
        date: 'Datums',
        regNr: 'Reģ. Nr.',
        group: 'Grupa',
        language: 'Valoda',
        status: 'Statuss'
    };

    // Process records (filter, sort, search)
    const processedRecords = useMemo(() => {
        let filtered = [...records];
        
        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(r => 
                r.title?.toLowerCase().includes(term) ||
                r.reg_nr?.toLowerCase().includes(term) ||
                r.annotation?.toLowerCase().includes(term)
            );
        }
        
        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(r => r.group === filterType);
        }
        
        // Sort
        filtered.sort((a, b) => {
            let aVal = a[sortField] || '';
            let bVal = b[sortField] || '';
            
            if (sortField === 'date' || sortField === 'created_date') {
                aVal = new Date(aVal || 0);
                bVal = new Date(bVal || 0);
            }
            
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }, [records, searchTerm, filterType, sortField, sortOrder]);

    // Get unique groups for filter
    const uniqueGroups = useMemo(() => {
        const groups = new Set(records.map(r => r.group).filter(Boolean));
        return Array.from(groups);
    }, [records]);

    // Handlers
    const handleRecordSelect = useCallback((id, checked) => {
        setSelectedRecords(prev => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    }, []);

    const handleSelectAll = useCallback((checked) => {
        if (checked) {
            setSelectedRecords(new Set(processedRecords.map(r => r.id)));
        } else {
            setSelectedRecords(new Set());
        }
    }, [processedRecords]);

    const toggleColumn = useCallback((columnKey) => {
        if (setColumnVisibility) {
            setColumnVisibility(prev => ({
                ...prev,
                [columnKey]: !prev[columnKey]
            }));
        }
    }, [setColumnVisibility]);

    const handleBatchDelete = useCallback(async () => {
        if (!window.confirm(`Vai tiešām vēlaties dzēst ${selectedRecords.size} ierakstus?`)) return;

        try {
            await batchDeleteMutation.mutateAsync({
                projectId,
                recordIds: Array.from(selectedRecords)
            });
            setSelectedRecords(new Set());
            utils.alert('success', "success");// add record constnt
        } catch (error) {
            utils.alert('error', error.message || 'Kļūda dzēšot ierakstus');
        }
    }, [selectedRecords, projectId, batchDeleteMutation, utils]);

    const toggleSort = useCallback((field) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    }, [sortField]);

    const getRecordStatus = (record) => {
        if (record.files?.length > 0) return { label: 'Ar failiem', color: 'var(--color-primary)' };
        if (record.annotation) return { label: 'Ar anotāciju', color: 'var(--color-warning)' };
        return { label: 'Jauns', color: 'var(--text-muted)' };
    };

    // Render functions
    const renderEmptyState = () => (
        <div className="records-empty-state">
            <div className="empty-icon">{inheritanceInfo.icon}</div>
            <p className="empty-text">Nav pievienotu ierakstu</p>
            {showCreateButton && (
                <button
                    onClick={onCreateRecord}
                    className="inv-action-btn inv-edit-btn"
                >
                    <i className="fas fa-plus"></i>
                    <span>Izveidot Pirmo Ierakstu</span>
                </button>
            )}
        </div>
    );

    const renderCardView = () => (
        <div className="records-cards-grid">
            {processedRecords.map(record => {
                const isSelected = selectedRecords.has(record.id);
                const status = getRecordStatus(record);
                
                return (
                    <div 
                        key={record.id}
                        className={`record-card ${isSelected ? 'selected' : ''}`}
                    >
                        <div className="record-card-header">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleRecordSelect(record.id, e.target.checked)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div 
                                className="record-card-status"
                                style={{ color: status.color }}
                            >
                                {status.label}
                            </div>
                        </div>
                        
                        <div 
                            className="record-card-body"
                            onClick={() => onRecordClick(record)}
                        >
                            <h4 className="record-card-title">
                                {record.title || 'Nav nosaukuma'}
                            </h4>
                            
                            <div className="record-card-meta">
                                {record.date && (
                                    <div className="meta-item">
                                        <span className="meta-label">Datums:</span>
                                        <span className="meta-value">{record.date}</span>
                                    </div>
                                )}
                                {record.reg_nr && (
                                    <div className="meta-item">
                                        <span className="meta-label">Reģ. Nr.:</span>
                                        <span className="meta-value">{record.reg_nr}</span>
                                    </div>
                                )}
                                {record.group && (
                                    <div className="meta-item">
                                        <span className="meta-label">Grupa:</span>
                                        <span className="meta-value">{record.group}</span>
                                    </div>
                                )}
                            </div>
                            
                            {record.annotation && (
                                <p className="record-card-annotation">
                                    {record.annotation.substring(0, 120)}
                                    {record.annotation.length > 120 && '...'}
                                </p>
                            )}
                        </div>
                        
                        <div className="record-card-footer">
                            <div className="record-card-stats">
                                <span title="Faili">📎 {record.files?.length || 0}</span>
                                <span title="Metadati">
                                    ℹ️ {(record.actions?.length || 0) + (record.addressees?.length || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderTableView = () => (
        <div className="records-table-container">
            <div className="records-table-header">
                <div className="header-cell select-cell">
                    <input
                        type="checkbox"
                        checked={selectedRecords.size === processedRecords.length && processedRecords.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                </div>
                {columnVisibility.title && (
                    <div 
                        className="header-cell sortable"
                        onClick={() => toggleSort('title')}
                    >
                        Nosaukums
                        {sortField === 'title' && (
                            <span className="sort-indicator">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                        )}
                    </div>
                )}
                {columnVisibility.date && (
                    <div 
                        className="header-cell sortable"
                        onClick={() => toggleSort('date')}
                    >
                        Datums
                        {sortField === 'date' && (
                            <span className="sort-indicator">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                        )}
                    </div>
                )}
                {columnVisibility.regNr && (
                    <div className="header-cell">Reģ. Nr.</div>
                )}
                {columnVisibility.group && (
                    <div className="header-cell">Grupa</div>
                )}
                {columnVisibility.language && (
                    <div className="header-cell">Valoda</div>
                )}
                {columnVisibility.status && (
                    <div className="header-cell">Statuss</div>
                )}
            </div>
            
            <div className="records-table-body">
                {processedRecords.map(record => {
                    const isSelected = selectedRecords.has(record.id);
                    const status = getRecordStatus(record);
                    
                    return (
                        <div 
                            key={record.id}
                            className={`table-row ${isSelected ? 'selected' : ''}`}
                        >
                            <div className="body-cell select-cell">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => handleRecordSelect(record.id, e.target.checked)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            {columnVisibility.title && (
                                <div 
                                    className="body-cell title-cell"
                                    onClick={() => onRecordClick(record)}
                                >
                                    <div className="cell-title">{record.title || 'Nav nosaukuma'}</div>
                                    {record.annotation && (
                                        <div className="cell-subtitle">
                                            {record.annotation.substring(0, 60)}
                                            {record.annotation.length > 60 && '...'}
                                        </div>
                                    )}
                                </div>
                            )}
                            {columnVisibility.date && (
                                <div className="body-cell">{record.date || '-'}</div>
                            )}
                            {columnVisibility.regNr && (
                                <div className="body-cell">{record.reg_nr || '-'}</div>
                            )}
                            {columnVisibility.group && (
                                <div className="body-cell">{record.group || '-'}</div>
                            )}
                            {columnVisibility.language && (
                                <div className="body-cell">{record.language || '-'}</div>
                            )}
                            {columnVisibility.status && (
                                <div 
                                    className="body-cell status-cell"
                                    style={{ color: status.color }}
                                >
                                    {status.label}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Main render
    return (
        <div className="records-list-modern">
            {/* Header Controls - Hide when external controls are active */}
            {!externalViewMode && (
                <div className="records-controls-bar">
                    <div className="controls-left">
                        <div className="records-header-info">
                            <h3>
                                <span className="header-icon">{inheritanceInfo.icon}</span>
                                Dokumenti
                            </h3>
                            <span className="records-count">
                                {processedRecords.length} no {records.length}
                            </span>
                        </div>
                    </div>

                    <div className="controls-right">
                        {/* Search */}
                        <input
                            type="text"
                            className="records-search-input"
                            placeholder="Meklēt ierakstus..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* Filter */}
                        {uniqueGroups.length > 0 && (
                            <select
                                className="records-filter-select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">Visas grupas</option>
                                {uniqueGroups.map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        )}

                        {/* View Toggle */}
                        <button
                            onClick={() => setViewMode(prev => prev === 'table' ? 'cards' : 'table')}
                            className="view-toggle-btn"
                            title={viewMode === 'table' ? 'Kartīšu skats' : 'Tabulas skats'}
                        >
                            {viewMode === 'table' ? '⊞' : '☰'}
                        </button>

                        {/* Create Record Button */}
                        {showCreateButton && onCreateRecord && (
                            <button
                                onClick={onCreateRecord}
                                className="create-record-btn"
                            >
                                + Jauns
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Batch Actions */}
            {selectedRecords.size > 0 && (
                <div className="batch-actions-bar">
                    <span className="batch-count">
                        Izvēlēti: <strong>{selectedRecords.size}</strong>
                    </span>
                    <button
                        onClick={handleBatchDelete}
                        className="batch-delete-btn"
                        disabled={batchDeleteMutation.isPending}
                    >
                        {batchDeleteMutation.isPending ? 'Dzēš...' : '🗑️ Dzēst'}
                    </button>
                </div>
            )}

            {/* Column Visibility for Table - Hide when external controls are active */}
            {viewMode === 'table' && !externalViewMode && (
                <div className="column-controls-bar">
                    <span className="controls-label">Rādīt kolonnas:</span>
                    {Object.keys(columnVisibility).map(col => (
                        <label key={col} className="column-toggle">
                            <input
                                type="checkbox"
                                checked={columnVisibility[col]}
                                onChange={() => toggleColumn(col)}
                            />
                            <span>{columnNames[col]}</span>
                        </label>
                    ))}
                </div>
            )}

            {/* Records Display */}
            <div className="records-display-area">
                {processedRecords.length > 0 ? (
                    viewMode === 'table' ? renderTableView() : renderCardView()
                ) : (
                    renderEmptyState()
                )}
            </div>
        </div>
    );
};

export default RecordsList;