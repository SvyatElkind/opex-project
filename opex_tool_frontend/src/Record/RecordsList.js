import React, { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBatchDeleteRecords } from '../hooks/useRecords';
import InheritanceUtils from '../Utils/InheritanceUtils';
import ValidationIndicator from '../components/ValidationIndicator';
import RecordDeletePopup from './RecordDeletePopup';
import SelectionToolbar from '../components/SelectionToolbar';
import BulkEditRecordsPopup from './BulkEditRecordsPopup';
import MultiCreateRecordsPopup from './MultiCreateRecordsPopup';
import ImportRecordsPopup from './ImportRecordsPopup';
import { useSettings } from '../Settings/context/SettingsContext';
import { useNotification } from '../components/Notification';
import { formatDate as formatDateUtil } from '../Utils/DateFormatter';
import { BULK_UI, IMPORT_UI } from '../Constants/Constants';
import './RecordsList.css';
import '../Inventory/InventoryItem.css';

const RecordsList = ({
    records: recordsProp,
    item,
    inventory,
    projectId,
    onRecordClick,
    onCreateRecord,
    onEditRecord,
    onDeleteRecord,
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
    const queryClient = useQueryClient();
    const batchDeleteMutation = useBatchDeleteRecords();
    const { settings } = useSettings();
    const { notify } = useNotification();

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
        language: true,
        files: true
    });

    // Delete popup state
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [recordsToDelete, setRecordsToDelete] = useState([]);

    // Column selector popup state
    const [columnSelectVisible, setColumnSelectVisible] = useState(false);
    const columnButtonRef = React.useRef(null);
    const columnPopupRef = React.useRef(null);

    // Bulk create/edit state
    const [createMenuVisible, setCreateMenuVisible] = useState(false);
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [showMultiCreate, setShowMultiCreate] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const createButtonRef = React.useRef(null);
    const createMenuRef = React.useRef(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = settings.itemsPerPage || 25;

    // Format date using settings
    const formatDate = useCallback((dateStr) => {
        return formatDateUtil(dateStr, settings.dateFormat || 'YYYY-MM-DD');
    }, [settings.dateFormat]);

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
        language: 'Valoda',
        files: 'Datnes'
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

    // Pagination
    const totalPages = Math.ceil(processedRecords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRecords = processedRecords.slice(startIndex, endIndex);

    // Reset to page 1 when records change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [processedRecords.length]);

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

    const handleBatchDelete = useCallback(() => {
        if (selectedRecords.size === 0) return;

        // Find all records to delete
        const recordsForDeletion = records.filter(record => selectedRecords.has(record.id));
        if (recordsForDeletion.length > 0) {
            setRecordsToDelete(recordsForDeletion);
            setShowDeletePopup(true);
        }
    }, [selectedRecords, records]);

    const handleConfirmBatchDelete = useCallback(async () => {
        try {
            await batchDeleteMutation.mutateAsync({
                projectId,
                recordIds: recordsToDelete.map(r => r.id)
            });
            setSelectedRecords(new Set());
            setShowDeletePopup(false);
            setRecordsToDelete([]);

            // Invalidate project queries to refresh the records list
            queryClient.invalidateQueries(['project', projectId]);
            queryClient.invalidateQueries(['project', 'detail', projectId]);
        } catch (error) {
            notify.error(error.message || 'Kļūda dzēšot dokumentus');
            setShowDeletePopup(false);
            setRecordsToDelete([]);
        }
    }, [recordsToDelete, projectId, batchDeleteMutation, queryClient, notify]);

    const handleCancelBatchDelete = useCallback(() => {
        setShowDeletePopup(false);
        setRecordsToDelete([]);
    }, []);

    const toggleSort = useCallback((field) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    }, [sortField]);

    const toggleColumnSelect = useCallback(() => {
        setColumnSelectVisible(prev => !prev);
    }, []);

    // Resolve ticked ids against the records actually listed — ids can go
    // stale after a delete, and a bulk edit must never act on a stale id.
    const selectedRecordObjects = useMemo(
        () => records.filter(record => selectedRecords.has(record.id)),
        [records, selectedRecords]
    );

    // Multi-record create/edit only applies to electronic textual records:
    // the create endpoint refuses anything else (validate_if_text_type_and_
    // electronic), and a media item may hold exactly one media record anyway
    // (validate_if_record_exists), on a different endpoint.
    const supportsBulk = Boolean(item) && inheritanceInfo.isElectronicDocuments;

    const openBulkEdit = useCallback(() => {
        if (selectedRecordObjects.length === 0) return;
        setShowBulkEdit(true);
    }, [selectedRecordObjects]);

    const closeBulkEdit = useCallback(() => {
        setShowBulkEdit(false);
        setSelectedRecords(new Set());
    }, []);

    const handleCreateButtonClick = useCallback(() => {
        // Without a multi-create option there is nothing to choose between.
        if (!supportsBulk) {
            if (onCreateRecord) onCreateRecord();
            return;
        }
        setCreateMenuVisible(prev => !prev);
    }, [supportsBulk, onCreateRecord]);

    // Close the create menu when clicking elsewhere.
    React.useEffect(() => {
        if (!createMenuVisible) return undefined;
        const handleClickOutside = (event) => {
            if (createMenuRef.current && !createMenuRef.current.contains(event.target) &&
                createButtonRef.current && !createButtonRef.current.contains(event.target)) {
                setCreateMenuVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [createMenuVisible]);

    // Close column popup when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (columnSelectVisible &&
                columnPopupRef.current &&
                !columnPopupRef.current.contains(event.target) &&
                columnButtonRef.current &&
                !columnButtonRef.current.contains(event.target)) {
                setColumnSelectVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [columnSelectVisible]);

    const handleEditRecord = useCallback((record, e) => {
        e.stopPropagation();
        if (onEditRecord) {
            onEditRecord(record);
        } else if (onRecordClick) {
            // Fallback to onRecordClick if no specific edit handler
            onRecordClick(record);
        }
    }, [onEditRecord, onRecordClick]);

    const handleDeleteSingleRecord = useCallback((record, e) => {
        e.stopPropagation();
        if (onDeleteRecord) {
            onDeleteRecord(record);
        } else {
            // Use batch delete popup for single record
            setRecordsToDelete([record]);
            setShowDeletePopup(true);
        }
    }, [onDeleteRecord]);

    // Render functions
    const renderEmptyState = () => (
        <div className="records-empty-state">
            <div className="empty-icon">{inheritanceInfo.icon}</div>
            <p className="empty-text">Nav pievienotu dokumentu</p>
            {showCreateButton && (
                <button
                    onClick={onCreateRecord}
                    className="inv-action-btn inv-edit-btn"
                >
                    <i className="fas fa-plus"></i>
                    <span>Izveidot Pirmo Dokumentu</span>
                </button>
            )}
        </div>
    );

    const renderCardView = () => (
        <div className="records-cards-grid">
            {paginatedRecords.map(record => {
                const isSelected = selectedRecords.has(record.id);

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
                            <ValidationIndicator
                                validation={InheritanceUtils.validateRecord(record, inheritanceInfo.category, inventory?.type)}
                                size="small"
                                showTooltip={false}
                                clickable={true}
                                position="bottom"
                            />
                            <button
                                className="record-card-delete-btn"
                                onClick={(e) => handleDeleteSingleRecord(record, e)}
                                title="Dzēst dokumentu"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
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
                                        <span className="meta-value">{formatDate(record.date)}</span>
                                    </div>
                                )}
                                {record.reg_nr && (
                                    <div className="meta-item">
                                        <span className="meta-label">Reģ. Nr.:</span>
                                        <span className="meta-value">{record.reg_nr}</span>
                                    </div>
                                )}
                                <div className="meta-item">
                                    <span className="meta-label">Datnes:</span>
                                    <span className="meta-value">{record.files?.length || 0}</span>
                                </div>
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
                {/* Status/Validation column - moved to first position */}
                <div className="header-cell validation-cell">
                    <i className="fas fa-check-circle" title="Validācija"></i>
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
                {columnVisibility.language && (
                    <div className="header-cell">Valoda</div>
                )}
                {columnVisibility.files && (
                    <div className="header-cell files-cell">Datnes</div>
                )}

                {/* ACTION COLUMN HEADERS */}
                <div className="header-cell records-action-header">
                    <button
                        ref={createButtonRef}
                        onClick={handleCreateButtonClick}
                        className="records-header-btn records-header-btn-create"
                        title="Izveidot jaunu dokumentu"
                        disabled={!showCreateButton || !onCreateRecord}
                    >
                        <i className="fas fa-plus-circle"></i>
                    </button>

                    {createMenuVisible && (
                        <div ref={createMenuRef} className="records-create-menu">
                            <button
                                type="button"
                                className="records-create-menu-option"
                                onClick={() => { setCreateMenuVisible(false); if (onCreateRecord) onCreateRecord(); }}
                            >
                                <i className="fas fa-plus"></i> {BULK_UI.MENU_CREATE_ONE_RECORD}
                            </button>
                            <button
                                type="button"
                                className="records-create-menu-option"
                                onClick={() => { setCreateMenuVisible(false); setShowMultiCreate(true); }}
                            >
                                <i className="fas fa-layer-group"></i> {BULK_UI.MENU_CREATE_MANY_RECORDS}
                            </button>

                            {/* Experimental, and only ever visible when the user
                                has switched it on in Settings. */}
                            {settings.experimental?.spreadsheetImport === true && (
                                <button
                                    type="button"
                                    className="records-create-menu-option"
                                    onClick={() => { setCreateMenuVisible(false); setShowImport(true); }}
                                >
                                    <i className="fas fa-file-import"></i> {IMPORT_UI.MENU_IMPORT_RECORDS}
                                    <span className="records-create-menu-badge">
                                        {IMPORT_UI.EXPERIMENTAL_BADGE}
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* While records are ticked this slot becomes the bulk edit
                    button, directly above the per-row edit buttons. The columns
                    button moves to the selection toolbar meanwhile. */}
                <div className="header-cell records-action-header">
                    {supportsBulk && selectedRecords.size > 0 ? (
                        <button
                            className="records-header-btn records-header-btn-edit active"
                            onClick={openBulkEdit}
                            title={BULK_UI.TOOLTIP_BULK_EDIT_RECORDS.replace('{count}', selectedRecords.size)}
                        >
                            <i className="fas fa-edit"></i>
                            <span className="records-header-badge">{selectedRecords.size}</span>
                        </button>
                    ) : (
                        <button
                            ref={columnButtonRef}
                            className="records-header-btn records-header-btn-columns"
                            onClick={toggleColumnSelect}
                            title="Kolonnu iestatījumi"
                        >
                            <i className="fas fa-columns"></i>
                        </button>
                    )}
                </div>

                <div className="header-cell records-action-header">
                    <button
                        className={`records-header-btn records-header-btn-delete ${selectedRecords.size > 0 ? 'active' : ''}`}
                        onClick={handleBatchDelete}
                        disabled={selectedRecords.size === 0}
                        title={selectedRecords.size > 0 ? `Dzēst ${selectedRecords.size} dokumentus` : 'Izvēlieties dokumentus lai dzēstu'}
                    >
                        <i className="fas fa-trash"></i>
                        {selectedRecords.size > 0 && <span className="records-header-badge">{selectedRecords.size}</span>}
                    </button>
                </div>

                {/* Column Selector Popup */}
                {columnSelectVisible && (
                    <div ref={columnPopupRef} className="records-column-popup">
                        <div className="records-column-popup-header">
                            <i className="fas fa-columns"></i>
                            <span>Kolonnas</span>
                        </div>
                        <div className="records-column-popup-content">
                            {Object.keys(columnVisibility).map(column => (
                                <div key={column} className="records-column-popup-option">
                                    <input
                                        type="checkbox"
                                        id={`rec-col-${column}`}
                                        checked={columnVisibility[column]}
                                        onChange={() => toggleColumn(column)}
                                    />
                                    <label htmlFor={`rec-col-${column}`}>
                                        {columnNames[column]}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="records-table-body">
                {paginatedRecords.map(record => {
                    const isSelected = selectedRecords.has(record.id);

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
                            {/* Status/Validation column - moved to first position */}
                            <div className="body-cell validation-cell">
                                <ValidationIndicator
                                    validation={InheritanceUtils.validateRecord(record, inheritanceInfo.category, inventory?.type)}
                                    size="small"
                                    showTooltip={false}
                                    clickable={true}
                                    position="left"
                                />
                            </div>
                            {columnVisibility.title && (
                                <div
                                    className="body-cell title-cell"
                                    onClick={() => onRecordClick(record)}
                                >
                                    <div className="cell-title">{record.title || 'Nav nosaukuma'}</div>
                                </div>
                            )}
                            {columnVisibility.date && (
                                <div className="body-cell">{record.date ? formatDate(record.date) : '-'}</div>
                            )}
                            {columnVisibility.regNr && (
                                <div className="body-cell">{record.reg_nr || '-'}</div>
                            )}
                            {columnVisibility.language && (
                                <div className="body-cell">{record.language || '-'}</div>
                            )}
                            {columnVisibility.files && (
                                <div className="body-cell files-cell">
                                    <i className="fas fa-file-alt files-icon"></i>
                                    <span className="files-count">{record.files?.length || 0}</span>
                                </div>
                            )}

                            {/* ACTION COLUMNS - Separate cells for each action */}
                            {/* CREATE/ADD COLUMN - Empty for records */}
                            <div className="body-cell records-action-cell">
                                {/* Empty - no add button at record level */}
                            </div>

                            {/* EDIT COLUMN */}
                            <div className="body-cell records-action-cell">
                                <button
                                    className="records-action-icon records-icon-edit"
                                    onClick={(e) => handleEditRecord(record, e)}
                                    title="Rediģēt dokumentu"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                            </div>

                            {/* DELETE COLUMN */}
                            <div className="body-cell records-action-cell">
                                <button
                                    className="records-action-icon records-icon-delete"
                                    onClick={(e) => handleDeleteSingleRecord(record, e)}
                                    title="Dzēst dokumentu"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Main render
    return (
        <div className="records-list-modern">
            {/* Delete Confirmation Popup */}
            <RecordDeletePopup
                isOpen={showDeletePopup}
                onConfirm={handleConfirmBatchDelete}
                onCancel={handleCancelBatchDelete}
                records={recordsToDelete}
            />

            {showMultiCreate && supportsBulk && (
                <MultiCreateRecordsPopup
                    item={item}
                    projectId={projectId}
                    onClose={() => setShowMultiCreate(false)}
                />
            )}

            {showImport && supportsBulk && (
                <ImportRecordsPopup
                    item={item}
                    projectId={projectId}
                    onClose={() => setShowImport(false)}
                />
            )}

            {showBulkEdit && supportsBulk && selectedRecordObjects.length > 0 && (
                <BulkEditRecordsPopup
                    records={selectedRecordObjects}
                    item={item}
                    projectId={projectId}
                    onClose={closeBulkEdit}
                />
            )}

            {supportsBulk && (
                <SelectionToolbar
                    selectedCount={selectedRecordObjects.length}
                    totalCount={records.length}
                    labels={selectedRecordObjects.map(record => record.reg_nr || record.title || `ID ${record.id}`)}
                    onEdit={openBulkEdit}
                    onDelete={handleBatchDelete}
                    onColumns={viewMode === 'table' ? toggleColumnSelect : null}
                    onClear={() => setSelectedRecords(new Set())}
                    entityKind="records"
                />
            )}

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
                            placeholder="Meklēt dokumentus..."
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

                        {/* Create/Delete Record Button - switches based on selection */}
                        {selectedRecords.size > 0 ? (
                            <button
                                onClick={handleBatchDelete}
                                className="create-record-btn delete-mode"
                                disabled={batchDeleteMutation.isPending}
                            >
                                <i className="fas fa-trash"></i> Dzēst ({selectedRecords.size})
                            </button>
                        ) : (
                            showCreateButton && onCreateRecord && (
                                <button
                                    onClick={onCreateRecord}
                                    className="create-record-btn"
                                >
                                    + Jauns
                                </button>
                            )
                        )}
                    </div>
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

            {/* Pagination Controls */}
            {totalPages > 1 && processedRecords.length > 0 && (
                <div className="records-pagination">
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
                            ({startIndex + 1}-{Math.min(endIndex, processedRecords.length)} no {processedRecords.length})
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
        </div>
    );
};

export default RecordsList;