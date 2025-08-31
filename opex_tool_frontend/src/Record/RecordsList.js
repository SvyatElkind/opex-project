// src/Record/RecordsList.js
// Updated records list with proper media support and modern UI

import React, { useState, useMemo, useCallback } from 'react';
import { RECORD_UI, INVENTORY_CONSTANTS } from '../Constants/Constnats';
import { useBatchDeleteRecords } from '../hooks/useRecords';
import InheritanceUtils from '../Utils/InheritanceUtils';
import Utils from '../Utils/Utils';
import './RecordsList.css';

const RecordsList = ({ 
    records = [], 
    item, 
    inventory, 
    projectId, 
    onRecordClick, 
    onCreateRecord, 
    showCreateButton = true,
    viewMode: initialViewMode = 'auto' 
}) => {
    const utils = Utils();
    const batchDeleteMutation = useBatchDeleteRecords();
    
    // Get inheritance info
    const inheritanceInfo = inventory ? InheritanceUtils.getInheritanceInfo(inventory) : {
        isTextual: true,
        isMedia: false,
        type: 'Tekstuāls',
        icon: '📄',
        color: '#007bff'
    };
    
    // Determine optimal view mode
    const optimalViewMode = useMemo(() => {
        if (initialViewMode !== 'auto') return initialViewMode;
        
        // Media inventories work better with cards
        if (inheritanceInfo.isMedia) return 'cards';
        
        // Textual records with many items work better with table
        if (records.length > 10) return 'table';
        
        // Default to cards for smaller lists
        return 'cards';
    }, [initialViewMode, inheritanceInfo.isMedia, records.length]);
    
    // Local state
    const [viewMode, setViewMode] = useState(optimalViewMode);
    const [selectedRecords, setSelectedRecords] = useState(new Set());
    const [sortField, setSortField] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Column visibility state for table view
    const [columnVisibility, setColumnVisibility] = useState({
        title: true,
        date: true,
        created_date: true,
        language: true,
        reg_nr: true,
        access_restriction: true,
        files_count: true,
        actions: true
    });

    // Column names mapping
    const columnNames = {
        title: RECORD_UI.TITLE,
        date: RECORD_UI.DATE,
        created_date: RECORD_UI.CREATED_DATE,
        language: RECORD_UI.LANGUAGE,
        reg_nr: RECORD_UI.REG_NR,
        access_restriction: RECORD_UI.ACCESS_RESTRICTION,
        files_count: RECORD_UI.FILES,
        actions: 'Darbības'
    };

    // Process records (filter, search, sort)
    const processedRecords = useMemo(() => {
        let filteredRecords = [...records];

        // Search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filteredRecords = filteredRecords.filter(record => 
                (record.title?.toLowerCase().includes(searchLower)) ||
                (record.reg_nr?.toLowerCase().includes(searchLower)) ||
                (record.annotation?.toLowerCase().includes(searchLower)) ||
                (record.key_words?.toLowerCase().includes(searchLower))
            );
        }

        // Type filter
        if (filterType !== 'all') {
            filteredRecords = filteredRecords.filter(record => {
                switch (filterType) {
                    case 'with_files':
                        return record.files && record.files.length > 0;
                    case 'without_files':
                        return !record.files || record.files.length === 0;
                    case 'restricted':
                        return record.access_restriction === 'closed';
                    case 'open':
                        return record.access_restriction === 'open';
                    default:
                        return true;
                }
            });
        }

        // Sort
        filteredRecords.sort((a, b) => {
            let aValue = a[sortField] || '';
            let bValue = b[sortField] || '';

            // Special handling for date fields
            if (sortField.includes('date')) {
                aValue = new Date(aValue || 0);
                bValue = new Date(bValue || 0);
            }

            // Special handling for files count
            if (sortField === 'files_count') {
                aValue = a.files?.length || 0;
                bValue = b.files?.length || 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filteredRecords;
    }, [records, searchTerm, filterType, sortField, sortOrder]);

    // Handle record selection
    const handleRecordSelect = useCallback((recordId, isSelected) => {
        setSelectedRecords(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(recordId);
            } else {
                newSet.delete(recordId);
            }
            return newSet;
        });
    }, []);

    // Handle select all
    const handleSelectAll = useCallback((isSelected) => {
        if (isSelected) {
            setSelectedRecords(new Set(processedRecords.map(r => r.id)));
        } else {
            setSelectedRecords(new Set());
        }
    }, [processedRecords]);

    // Handle batch delete
    const handleBatchDelete = async () => {
        if (selectedRecords.size === 0) return;

        const recordIds = Array.from(selectedRecords);
        const confirmMessage = `Vai tiešām vēlaties dzēst ${recordIds.length} ierakstu${recordIds.length === 1 ? '' : 's'}? Šī darbība ir neatgriezeniska.`;
        
        if (!window.confirm(confirmMessage)) return;

        try {
            await batchDeleteMutation.mutateAsync({
                projectId,
                recordIds
            });
            setSelectedRecords(new Set());
        } catch (error) {
            console.error('Batch delete failed:', error);
        }
    };

    // Handle sort change
    const handleSort = useCallback((field) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    }, [sortField]);

    // Toggle column visibility
    const toggleColumn = useCallback((column) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    }, []);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('lv-LV');
        } catch {
            return dateString;
        }
    };

    // Get record status badge
    const getRecordStatus = (record) => {
        if (inheritanceInfo.isMedia && record.validated !== undefined) {
            return {
                text: record.validated ? 'Validēts' : 'Nav validēts',
                color: record.validated ? '#28a745' : '#ffc107'
            };
        }
        
        if (record.access_restriction === 'closed') {
            return {
                text: 'Ierobežots',
                color: '#dc3545'
            };
        }
        
        return {
            text: 'Aktīvs',
            color: '#28a745'
        };
    };

    // Render table header
    const renderTableHeader = () => (
        <div className="records-header">
            <div className="select-column">
                <input
                    type="checkbox"
                    checked={processedRecords.length > 0 && selectedRecords.size === processedRecords.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    disabled={processedRecords.length === 0}
                />
            </div>
            
            {columnVisibility.title && (
                <div 
                    className="sortable-column" 
                    onClick={() => handleSort('title')}
                    title="Kārtot pēc nosaukuma"
                >
                    {columnNames.title}
                    {sortField === 'title' && (
                        <span className="sort-indicator">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                    )}
                </div>
            )}
            
            {columnVisibility.date && (
                <div 
                    className="sortable-column date-column" 
                    onClick={() => handleSort('date')}
                    title="Kārtot pēc datuma"
                >
                    {columnNames.date}
                    {sortField === 'date' && (
                        <span className="sort-indicator">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                    )}
                </div>
            )}
            
            {columnVisibility.language && (
                <div className="language-column">{columnNames.language}</div>
            )}
            
            {columnVisibility.reg_nr && (
                <div className="reg-nr-column">{columnNames.reg_nr}</div>
            )}
            
            {columnVisibility.access_restriction && (
                <div className="status-column">Statuss</div>
            )}
            
            {columnVisibility.files_count && (
                <div 
                    className="files-column" 
                    onClick={() => handleSort('files_count')}
                    title="Kārtot pēc failu skaita"
                >
                    {columnNames.files_count}
                    {sortField === 'files_count' && (
                        <span className="sort-indicator">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                    )}
                </div>
            )}
            
            {columnVisibility.actions && (
                <div className="actions-column">Darbības</div>
            )}
        </div>
    );

    // Render table row
    const renderTableRow = (record, index) => {
        const isSelected = selectedRecords.has(record.id);
        const status = getRecordStatus(record);
        
        return (
            <div 
                key={record.id} 
                className={`record-row ${isSelected ? 'selected' : ''} ${record.isOptimistic ? 'optimistic' : ''}`}
            >
                <div className="select-column">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRecordSelect(record.id, e.target.checked)}
                    />
                </div>
                
                {columnVisibility.title && (
                    <div className="title-column" onClick={() => onRecordClick(record)}>
                        <div className="record-title">
                            {record.title || 'Nav nosaukuma'}
                        </div>
                        {record.annotation && (
                            <div className="record-annotation">
                                {record.annotation.substring(0, 100)}
                                {record.annotation.length > 100 ? '...' : ''}
                            </div>
                        )}
                    </div>
                )}
                
                {columnVisibility.date && (
                    <div className="date-column">
                        {formatDate(record.date)}
                    </div>
                )}
                
                {columnVisibility.language && (
                    <div className="language-column">
                        {record.language || 'Nav norādīta'}
                    </div>
                )}
                
                {columnVisibility.reg_nr && (
                    <div className="reg-nr-column">
                        {record.reg_nr || '-'}
                    </div>
                )}
                
                {columnVisibility.access_restriction && (
                    <div className="status-column">
                        <span 
                            className="status-badge"
                            style={{ backgroundColor: status.color }}
                        >
                            {status.text}
                        </span>
                    </div>
                )}
                
                {columnVisibility.files_count && (
                    <div className="files-column">
                        <span className="files-count">
                            {record.files?.length || 0}
                        </span>
                    </div>
                )}
                
                {columnVisibility.actions && (
                    <div className="actions-column">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRecordClick(record);
                            }}
                            className="action-btn view-btn"
                            title="Skatīt ierakstu"
                        >
                            👁️
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Render card view
    const renderCardView = () => (
        <div className="records-cards">
            {processedRecords.map(record => {
                const isSelected = selectedRecords.has(record.id);
                const status = getRecordStatus(record);
                
                return (
                    <div 
                        key={record.id}
                        className={`record-card ${isSelected ? 'selected' : ''} ${record.isOptimistic ? 'optimistic' : ''}`}
                        onClick={() => onRecordClick(record)}
                        style={{ borderLeftColor: inheritanceInfo.color }}
                    >
                        <div className="card-header">
                            <div className="card-select" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => handleRecordSelect(record.id, e.target.checked)}
                                />
                            </div>
                            <div className="card-type" style={{ color: inheritanceInfo.color }}>
                                {inheritanceInfo.icon}
                            </div>
                            <div className="card-status">
                                <span 
                                    className="status-badge"
                                    style={{ backgroundColor: status.color }}
                                >
                                    {status.text}
                                </span>
                            </div>
                        </div>
                        
                        <div className="card-content">
                            <h3 className="card-title">
                                {record.title || 'Nav nosaukuma'}
                            </h3>
                            
                            <div className="card-meta">
                                <div className="meta-row">
                                    <span className="meta-label">Datums:</span>
                                    <span className="meta-value">{formatDate(record.date) || 'Nav norādīts'}</span>
                                </div>
                                
                                {record.reg_nr && (
                                    <div className="meta-row">
                                        <span className="meta-label">Reģ. Nr.:</span>
                                        <span className="meta-value">{record.reg_nr}</span>
                                    </div>
                                )}
                                
                                <div className="meta-row">
                                    <span className="meta-label">Valoda:</span>
                                    <span className="meta-value">{record.language || 'Nav norādīta'}</span>
                                </div>
                                
                                {record.files && record.files.length > 0 && (
                                    <div className="meta-row">
                                        <span className="meta-label">Faili:</span>
                                        <span className="meta-value files-indicator">
                                            📎 {record.files.length}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {record.annotation && (
                                <div className="card-annotation">
                                    {record.annotation.substring(0, 150)}
                                    {record.annotation.length > 150 ? '...' : ''}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    // Render empty state
    const renderEmptyState = () => (
        <div className="records-empty">
            <div className="empty-icon" style={{ color: inheritanceInfo.color }}>
                {inheritanceInfo.icon}
            </div>
            <h3>Nav ierakstu</h3>
            <p>
                {searchTerm || filterType !== 'all' 
                    ? 'Nav atrasts neviens ieraksts, kas atbilstu meklēšanas kritērijiem.'
                    : `Šajā glabājamajā vienībā vēl nav izveidoti ${inheritanceInfo.isMedia ? 'ieraksti' : 'ieraksti'}.`
                }
            </p>
            {showCreateButton && !searchTerm && filterType === 'all' && (
                <button 
                    onClick={onCreateRecord}
                    className="empty-create-btn"
                    style={{ backgroundColor: inheritanceInfo.color }}
                >
                    Izveidot {inheritanceInfo.isMedia ? 'ierakstu' : 'pirmo ierakstu'}
                </button>
            )}
        </div>
    );

    return (
        <div className="records-list">
            {/* Controls Bar */}
            <div className="records-controls">
                <div className="controls-left">
                    {/* Search */}
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Meklēt ierakstus..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                    
                    {/* Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Visi ieraksti</option>
                        <option value="with_files">Ar failiem</option>
                        <option value="without_files">Bez failiem</option>
                        <option value="restricted">Ierobežoti</option>
                        <option value="open">Atvērti</option>
                    </select>
                    
                    {/* Results count */}
                    <div className="results-count">
                        Rāda: {processedRecords.length} no {records.length}
                    </div>
                </div>
                
                <div className="controls-right">
                    {/* View toggle */}
                    <button
                        onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                        className="view-toggle"
                        title={viewMode === 'table' ? 'Switch to Cards' : 'Switch to Table'}
                    >
                        {viewMode === 'table' ? '⊞' : '☰'}
                    </button>
                    
                    {/* Create Record Button */}
                    {showCreateButton && (
                        <button 
                            onClick={onCreateRecord}
                            className="create-record-btn"
                            style={{ backgroundColor: inheritanceInfo.color }}
                        >
                            + Jauns Ieraksts
                        </button>
                    )}
                </div>
            </div>

            {/* Batch Actions */}
            {selectedRecords.size > 0 && (
                <div className="batch-actions">
                    <span>Izvēlēti: {selectedRecords.size}</span>
                    <button 
                        onClick={handleBatchDelete} 
                        className="batch-delete"
                        disabled={batchDeleteMutation.isPending}
                    >
                        {batchDeleteMutation.isPending ? 'Dzēš...' : 'Dzēst Izvēlētos'}
                    </button>
                </div>
            )}

            {/* Column Controls for Table View */}
            {viewMode === 'table' && (
                <div className="column-controls">
                    <span>Rādīt kolonnas:</span>
                    {Object.keys(columnVisibility).map(column => (
                        <label key={column}>
                            <input 
                                type="checkbox" 
                                checked={columnVisibility[column]} 
                                onChange={() => toggleColumn(column)} 
                            />
                            {columnNames[column]}
                        </label>
                    ))}
                </div>
            )}

            {/* Records Display */}
            <div className="records-display">
                {processedRecords.length > 0 ? (
                    viewMode === 'table' ? (
                        <div className="records-table">
                            {renderTableHeader()}
                            <div className="records-body">
                                {processedRecords.map(renderTableRow)}
                            </div>
                        </div>
                    ) : (
                        renderCardView()
                    )
                ) : (
                    renderEmptyState()
                )}
            </div>
        </div>
    );
};

export default RecordsList;