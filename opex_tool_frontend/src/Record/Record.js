// src/Record/Record.js
// Enhanced with Pagination Controls matching Item level design

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import RecordMetadata from './RecordMetadata';
import RecordFiles from './RecordFiles';
import MediaRecordForm from './MediaRecordForm';
import { RECORD_UI, RECORD_ERROR_MESSAGES, RECORD_SUCCESS_MESSAGES } from '../Constants/Constants';
import {
    useRecord,
    useUpdateRecord,
    useDeleteRecord,
    useUpdateMediaRecord,
} from '../hooks/useRecords';
import { useUploadFiles, useDeleteFile } from '../hooks/useFiles';
import { useNavigation } from '../Navigation/context/NavigationContext';
import { validateRecordForm, hasValidationErrors } from '../Utils/RecordValidation';
import InheritanceUtils from '../Utils/InheritanceUtils';
import Utils from '../Utils/Utils';
import { GeneralError, GeneralSuccess } from '../components/ErrorDisplay';
import './Record.css';
import './RecordForm.css';

const Record = ({ recordId, projectId, itemId, inventory, onBack }) => {
    const utils = Utils();
    const queryClient = useQueryClient();
    const scrollPositionRef = useRef(0);
    const isFileOperationRef = useRef(false);

    console.group('📄 Record Component Initialized');
    console.log('Props:', { recordId, projectId, itemId, inventoryId: inventory?.id });
    console.groupEnd();
    console.log("inventory ",inventory)
    // Get project data and navigation
    const { projectData, navigateBackSmart, navigateTo, activeTab: navActiveTab, clearActiveTab, getActiveTab } = useNavigation();
    console.log("project data", projectData);
    console.log("itemid", itemId);

    const [filesViewMode, setFilesViewMode] = useState('table');

    // Get metadata from API endpoint (actions, addressees, visas, read_statuses)
    const { data: apiMetadata, isLoading: metadataLoading, error: metadataError } = useRecord(projectId, recordId);

    // Scroll position preservation for file operations
    useEffect(() => {
        console.log('🔍 projectData changed, checking scroll restoration...', {
            isFileOperation: isFileOperationRef.current,
            savedPosition: scrollPositionRef.current
        });

        if (isFileOperationRef.current) {
            const scrollContainer = document.querySelector('.record-content');
            console.log('📜 Scroll container found:', !!scrollContainer);

            if (scrollContainer && scrollPositionRef.current > 0) {
                setTimeout(() => {
                    scrollContainer.scrollTop = scrollPositionRef.current;
                    console.log('✨ Restored scroll position after file operation:', scrollPositionRef.current);
                    isFileOperationRef.current = false;
                    scrollPositionRef.current = 0;
                }, 100);
            } else if (!scrollContainer) {
                console.warn('⚠️ Cannot restore scroll - container not found');
            } else {
                console.log('ℹ️ No scroll position to restore (position was 0)');
            }
        }
    }, [projectData]); // Watch projectData since files come from there
    
    // State for pagination
    const [jumpToNumber, setJumpToNumber] = useState('');
    
    // Get current item from project data
    const currentItem = useMemo(() => {
        if (!projectData || !itemId) return null;
        console.log("getting current item");
        
        const inventories = projectData.institution?.fond?.inventories || [];
        for (const inv of inventories) {
            const items = inv.items || [];
            const item = items.find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    }, [projectData, itemId]);
    console.log("current item" , currentItem)
    
    // Get all records from current item based on inventory type
    const allRecords = useMemo(() => {
        console.log("getting all records");
        if (!currentItem || !inventory) return [];
        
        
        const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
        
        // Collect all records based on type
        let records = [];
        
        if (inheritanceInfo.isTextual) {
            records = currentItem.records || [];
        } else if (inheritanceInfo.isMedia) {
            // For media, combine all media record types
            records = [
                ...(currentItem.photo_records || []),
                ...(currentItem.video_records || []),
                ...(currentItem.audio_records || [])
            ];
        }
        
        // Sort by ID to ensure consistent ordering
        return records.sort((a, b) => a.id - b.id);
    }, [currentItem, inventory]);
    console.log("all records",allRecords);
    
    // Calculate current record index
    const currentIndex = useMemo(() => {
        return allRecords.findIndex(r => r.id === recordId);
    }, [allRecords, recordId]);
    console.log("current index",currentIndex);
    
    
    // Get previous and next records
    const prevRecord = currentIndex > 0 ? allRecords[currentIndex - 1] : null;
    const nextRecord = currentIndex < allRecords.length - 1 ? allRecords[currentIndex + 1] : null;
    // CRITICAL: Extract main record data from project structure
    const mainRecordData = useMemo(() => {
        if (!projectData || !recordId) {
            console.warn('❌ No project data or recordId');
            return null;
        }
        
        console.log('🔍 Searching for record ID', recordId, 'in project structure...');
        
        const inventories = projectData.institution?.fond?.inventories || [];
        
        for (const inv of inventories) {
            const items = inv.items || [];
            
            for (const item of items) {
                // Search in textual records
                if (item.records && Array.isArray(item.records)) {
                    const found = item.records.find(r => r.id === recordId);
                    if (found) {
                        console.log('✅ Found textual record in project data:', found);
                        return { 
                            ...found, 
                            itemId: item.id,
                            inventoryId: inv.id,
                            inventoryType: inv.type,
                            isMediaRecord: false 
                        };
                    }
                }
                
                // Search in photo records
                if (item.photo_records && Array.isArray(item.photo_records)) {
                    const found = item.photo_records.find(r => r.id === recordId);
                    if (found) {
                        console.log('✅ Found photo record in project data:', found);
                        return { 
                            ...found, 
                            itemId: item.id,
                            inventoryId: inv.id,
                            inventoryType: inv.type,
                            isMediaRecord: true,
                            mediaType: 'photo'
                        };
                    }
                }
                
                // Search in video records
                if (item.video_records && Array.isArray(item.video_records)) {
                    const found = item.video_records.find(r => r.id === recordId);
                    if (found) {
                        console.log('✅ Found video record in project data:', found);
                        return { 
                            ...found, 
                            itemId: item.id,
                            inventoryId: inv.id,
                            inventoryType: inv.type,
                            isMediaRecord: true,
                            mediaType: 'video'
                        };
                    }
                }
                
                // Search in audio records
                if (item.audio_records && Array.isArray(item.audio_records)) {
                    const found = item.audio_records.find(r => r.id === recordId);
                    if (found) {
                        console.log('✅ Found audio record in project data:', found);
                        return { 
                            ...found, 
                            itemId: item.id,
                            inventoryId: inv.id,
                            inventoryType: inv.type,
                            isMediaRecord: true,
                            mediaType: 'audio'
                        };
                    }
                }
            }
        }
        
        console.error('❌ Record not found in project data. recordId:', recordId);
        return null;
    }, [projectData, recordId]);
    console.log("Main Record data",mainRecordData)
    
    // Merge main record data with API metadata
    const recordData = useMemo(() => {
        if (!mainRecordData) {
            console.warn('⚠️ No main record data found');
            return null;
        }
        
        // Start with main record data from project structure
        const merged = { ...mainRecordData };
        
        // Add metadata from API if available
        if (apiMetadata) {
            console.log('📊 Merging API metadata:', apiMetadata);
            merged.actions = apiMetadata.actions || [];
            merged.addressees = apiMetadata.addressees || [];
            merged.visas = apiMetadata.visas || [];
            merged.read_status = apiMetadata.read_statuses || apiMetadata.read_status || [];
        } else {
            // Use empty arrays if metadata not loaded yet
            merged.actions = mainRecordData.actions || [];
            merged.addressees = mainRecordData.addressees || [];
            merged.visas = mainRecordData.visas || [];
            merged.read_status = mainRecordData.read_status || [];
        }
        
        console.log('✅ Final merged record data:', merged);
        return merged;
    }, [mainRecordData, apiMetadata]);
    console.log("record Data:", recordData)
    
    // Debug log
    useEffect(() => {
        console.group('📊 Record Data State');
        console.log('mainRecordData:', mainRecordData);
        console.log('apiMetadata:', apiMetadata);
        console.log('Final recordData:', recordData);
        console.log('metadataLoading:', metadataLoading);
        console.log('metadataError:', metadataError);
        console.groupEnd();
    }, [mainRecordData, apiMetadata, recordData, metadataLoading, metadataError]);
    
    // Mutations
    const updateRecordMutation = useUpdateRecord();
    const updateMediaRecordMutation = useUpdateMediaRecord();
    const deleteRecordMutation = useDeleteRecord();
    const uploadFilesMutation = useUploadFiles();

    // File operation callbacks for scroll preservation
    const handleFileOperationStart = () => {
        console.log('🔄 File operation starting, saving scroll position...');
        const scrollContainer = document.querySelector('.record-content');
        if (scrollContainer) {
            scrollPositionRef.current = scrollContainer.scrollTop;
            isFileOperationRef.current = true;
            console.log('💾 Saved scroll position:', scrollPositionRef.current);
            console.log('📍 Operation flag set:', isFileOperationRef.current);
        } else {
            console.warn('⚠️ Scroll container not found (.record-content)');
        }
    };

    const handleFileOperationComplete = () => {
        console.log('✅ File operation complete, waiting for data refresh...');
        // The useEffect hook will restore scroll position when projectData reloads
    };

    // Get inheritance info
    const inheritanceInfo = inventory ?
        InheritanceUtils.getInheritanceInfo(inventory) :
        { isTextual: true, isMedia: false, type: 'Tekstuāls' };
    
    // State management
    const [activeTab, setActiveTab] = useState('info');
    const [activeMetadataSection, setActiveMetadataSection] = useState('actions');
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [filesToUpload, setFilesToUpload] = useState([]);

    // Handle navigation tab request (e.g., from verification tree clicking on a file)
    // Use navActiveTab state directly - this will trigger when navigation sets it
    useEffect(() => {
        console.log('📁 Record: navActiveTab effect running, value:', navActiveTab);
        if (navActiveTab) {
            console.log('📁 Record: Setting activeTab to:', navActiveTab);
            setActiveTab(navActiveTab);
            clearActiveTab(); // Clear after consuming
        }
    }, [navActiveTab, clearActiveTab]);

    // Also check ref when mounting or when recordId changes (for navigation between records)
    useEffect(() => {
        const pendingTab = getActiveTab();
        console.log('📁 Record: Mount/recordId change check, pendingTab from ref:', pendingTab, 'recordId:', recordId);
        if (pendingTab) {
            console.log('📁 Record: Setting activeTab from ref to:', pendingTab);
            setActiveTab(pendingTab);
            clearActiveTab();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordId]); // Run on mount and when navigating to a different record

    // Initialize edit form with record data
    useEffect(() => {
        if (recordData && isEditing) {
            setEditFormData({
                title: recordData.title || '',
                reg_nr: recordData.reg_nr || '',
                date: recordData.date || '',
                pages_count: recordData.pages_count || '',
                annotation: recordData.annotation || '',
                notes: recordData.notes || '',
                language: recordData.language || '',
                secrecy: recordData.secrecy || '',
                access_restriction: recordData.access_restriction || '',
                access_restriction_notes: recordData.access_restriction_notes || '',
                access_restriction_date: recordData.access_restriction_date || '',
                user_restriction_notes: recordData.user_restriction_notes || '',
                tech_info: recordData.tech_info || '',
                // Media fields
                duration: recordData.duration || '',
                resolution: recordData.resolution || '',
                format: recordData.format || '',
                size: recordData.size || '',
                color: recordData.color || '',
            });
        }
    }, [recordData, isEditing]);
    
    // ==========================================
    // PAGINATION HANDLERS
    // ==========================================
    
    const handlePrevRecord = () => {
        if (prevRecord) {
            navigateTo('record', prevRecord.id, inventory.id, itemId);
        }
    };
    
    const handleNextRecord = () => {
        if (nextRecord) {
            navigateTo('record', nextRecord.id, inventory.id, itemId);
        }
    };
    
    const handleJumpToRecord = () => {
        const targetIndex = parseInt(jumpToNumber) - 1;
        if (!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < allRecords.length) {
            const targetRecord = allRecords[targetIndex];
            navigateTo('record', targetRecord.id, inventory.id, itemId);
            setJumpToNumber('');
        }
    };
    
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigateBackSmart();
        }
    };
    
    // Get record identifier for display
    const getRecordIdentifier = (record) => {
        if (!record) return '';
        return record.title || record.reg_nr || `Ieraksts ${record.id}`;
    };
    
    // ==========================================
    // EDIT HANDLERS
    // ==========================================
    
    const handleFieldChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    
    const handleStartEdit = () => {
        setIsEditing(true);
        setValidationErrors({});
        setSuccessMessage('');
        setErrorMessage('');
    };
    
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditFormData({});
        setValidationErrors({});
        setErrorMessage('');
    };
    
    const handleSaveEdit = async () => {
        // Validate form
        const errors = validateRecordForm(editFormData, inheritanceInfo.isMedia);
        
        if (hasValidationErrors(errors)) {
            setValidationErrors(errors);
            setErrorMessage(RECORD_ERROR_MESSAGES.VALIDATION_FAILED);
            return;
        }
        
        try {
            if (inheritanceInfo.isMedia) {
                await updateMediaRecordMutation.mutateAsync({
                    projectId,
                    recordId,
                    data: editFormData
                });
            } else {
                await updateRecordMutation.mutateAsync({
                    projectId,
                    recordId,
                    data: editFormData
                });
            }
            
            setSuccessMessage(RECORD_SUCCESS_MESSAGES.UPDATE);
            setIsEditing(false);
            setValidationErrors({});
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error updating record:', error);
            setErrorMessage(error.message || RECORD_ERROR_MESSAGES.UPDATE);
        }
    };
    
    const handleDelete = async () => {
        try {
            await deleteRecordMutation.mutateAsync({
                projectId,
                recordId
            });
            
            // Navigate back after successful deletion
            handleBack();
        } catch (error) {
            console.error('Error deleting record:', error);
            setErrorMessage(error.message || RECORD_ERROR_MESSAGES.DELETE);
            setShowDeleteConfirm(false);
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return utils.formatDate(dateString);
        } catch {
            return dateString;
        }
    };
    
    // ==========================================
    // LOADING & ERROR STATES
    // ==========================================
    
    if (metadataLoading && !recordData) {
        return (
            <div className="record-container">
                <div className="record-loading">
                    <div className="loading-spinner"></div>
                    <p>Ielādē ieraksta datus...</p>
                </div>
            </div>
        );
    }
    
    if (!recordData) {
        return (
            <div className="record-container">
                <div className="record-error">
                    <h3>❌ Kļūda</h3>
                    <p>Ieraksts nav atrasts</p>
                    <button className="btn btn-primary" onClick={handleBack}>
                        ← Atpakaļ
                    </button>
                </div>
            </div>
        );
    }
    
    // ==========================================
    // MAIN RENDER
    // ==========================================
    
    return (
        <div className="record-container">
            {/* ==========================================
                PAGINATION HEADER (matching Item style)
                ========================================== */}
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
                        onClick={handlePrevRecord}
                        disabled={!prevRecord}
                        title={prevRecord ? `Iepriekšējā: ${getRecordIdentifier(prevRecord)}` : 'Nav iepriekšējā'}
                    >
                        <i className="fas fa-chevron-left"></i>
                        <span className="item-pagination-label">Iepriekšējā</span>
                    </button>

                    <div className="item-pagination-info">
                        <span className="item-pagination-current">{currentIndex + 1}</span>
                        <span className="item-pagination-separator">/</span>
                        <span className="item-pagination-total">{allRecords.length}</span>
                    </div>

                    <button 
                        className="item-pagination-btn item-pagination-next"
                        onClick={handleNextRecord}
                        disabled={!nextRecord}
                        title={nextRecord ? `Nākamā: ${getRecordIdentifier(nextRecord)}` : 'Nav nākamās'}
                    >
                        <span className="item-pagination-label">Nākamā</span>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>

                {/* Jump to Record */}
                <div className="item-jump-controls">
                    <input
                        type="number"
                        className="item-jump-input"
                        placeholder="Nr."
                        value={jumpToNumber}
                        onChange={(e) => setJumpToNumber(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleJumpToRecord()}
                        min="1"
                        max={allRecords.length}
                    />
                    <button 
                        className="item-jump-btn"
                        onClick={handleJumpToRecord}
                        disabled={!jumpToNumber}
                        title="Pāriet uz ierakstu"
                    >
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
            {/* Messages */}
            {successMessage && (
                <GeneralSuccess message={successMessage} onClose={() => setSuccessMessage('')} />
            )}

            {errorMessage && (
                <GeneralError message={errorMessage} onClose={() => setErrorMessage('')} />
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="record-message record-message-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    Vai tiešām vēlaties dzēst šo ierakstu?
                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                        <button 
                            className="btn btn-danger"
                            onClick={handleDelete}
                            disabled={deleteRecordMutation.isLoading}
                        >
                            Jā, dzēst
                        </button>
                        <button 
                            className="btn btn-secondary"
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            Atcelt
                        </button>
                    </div>
                </div>
            )}

            {/* ==========================================
                TABS
                ========================================== */}
            <div className="record-tabs">
                <button
                    className={`record-tab ${activeTab === 'info' ? 'record-tab-active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    <i className="fas fa-info-circle"></i>
                    Informācija
                </button>

                {!inheritanceInfo.isMedia && (
                    <button
                        className={`record-tab ${activeTab === 'metadata' ? 'record-tab-active' : ''}`}
                        onClick={() => setActiveTab('metadata')}
                    >
                        <i className="fas fa-list"></i>
                        Metadati
                        {recordData.actions?.length > 0 && (
                            <span className="record-tab-badge">{recordData.actions.length}</span>
                        )}
                    </button>
                )}

                <button
                    className={`record-tab ${activeTab === 'files' ? 'record-tab-active' : ''}`}
                    onClick={() => setActiveTab('files')}
                >
                    <i className="fas fa-file"></i>
                    Faili
                    {recordData.files?.length > 0 && (
                        <span className="record-tab-badge">{recordData.files.length}</span>
                    )}
                </button>

                {/* Metadata sections - shown inline when metadata tab is active */}
                {activeTab === 'metadata' && !inheritanceInfo.isMedia && (
                    <div className="metadata-sections-inline">
                        <button
                            className={`metadata-section-btn-inline ${activeMetadataSection === 'actions' ? 'active' : ''}`}
                            onClick={() => setActiveMetadataSection('actions')}
                        >
                            <i className="fas fa-tasks"></i>
                            <span>Darbības</span>
                            {recordData.actions?.length > 0 && (
                                <span className="metadata-count-badge">{recordData.actions.length}</span>
                            )}
                        </button>
                        <button
                            className={`metadata-section-btn-inline ${activeMetadataSection === 'addressees' ? 'active' : ''}`}
                            onClick={() => setActiveMetadataSection('addressees')}
                        >
                            <i className="fas fa-user"></i>
                            <span>Adresāti</span>
                            {recordData.addressees?.length > 0 && (
                                <span className="metadata-count-badge">{recordData.addressees.length}</span>
                            )}
                        </button>
                        <button
                            className={`metadata-section-btn-inline ${activeMetadataSection === 'visas' ? 'active' : ''}`}
                            onClick={() => setActiveMetadataSection('visas')}
                        >
                            <i className="fas fa-stamp"></i>
                            <span>Vīzas</span>
                            {recordData.visas?.length > 0 && (
                                <span className="metadata-count-badge">{recordData.visas.length}</span>
                            )}
                        </button>
                        <button
                            className={`metadata-section-btn-inline ${activeMetadataSection === 'read_status' ? 'active' : ''}`}
                            onClick={() => setActiveMetadataSection('read_status')}
                        >
                            <i className="fas fa-eye"></i>
                            <span>Lasīšanas statuss</span>
                            {recordData.read_status?.length > 0 && (
                                <span className="metadata-count-badge">{recordData.read_status.length}</span>
                            )}
                        </button>
                    </div>
                )}

                {/* Files View Mode Toggle - Only show when files tab is active */}
                {activeTab === 'files' && (
                    <div className="files-view-toggle-inline">
                        <button
                            className={`view-toggle-btn-inline ${filesViewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setFilesViewMode('table')}
                            title="Tabulas skats"
                        >
                            <i className="fas fa-list"></i>
                        </button>
                        <button
                            className={`view-toggle-btn-inline ${filesViewMode === 'card' ? 'active' : ''}`}
                            onClick={() => setFilesViewMode('card')}
                            title="Kartīšu skats"
                        >
                            <i className="fas fa-th-large"></i>
                        </button>
                    </div>
                )}

                <div className={`record-header-actions ${activeTab === 'info' ? 'record-header-actions-right' : ''}`}>
                    {!isEditing ? (
                        <>
                            <button 
                                className="btn btn-secondary"
                                onClick={handleStartEdit}
                                disabled={!recordData}
                                title="Rediģēt ierakstu"
                            >
                                <i className="fas fa-edit"></i>
                                Rediģēt
                            </button>
                            <button 
                                className="btn btn-danger"
                                onClick={() => setShowDeleteConfirm(true)}
                                title="Dzēst ierakstu"
                            >
                                <i className="fas fa-trash"></i>
                                Dzēst
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                className="btn btn-primary"
                                onClick={handleSaveEdit}
                                disabled={updateRecordMutation.isLoading || updateMediaRecordMutation.isLoading}
                            >
                                <i className="fas fa-save"></i>
                                Saglabāt
                            </button>
                            <button 
                                className="btn btn-secondary"
                                onClick={handleCancelEdit}
                            >
                                <i className="fas fa-times"></i>
                                Atcelt
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ==========================================
                TAB CONTENT
                ========================================== */}
            <div className="record-content">
                {activeTab === 'info' && !inheritanceInfo.isMedia && (
    <div className="record-info-tab-content">
        <div className="record-sections-grid">
            {/* ==========================================
                BASIC INFORMATION SECTION
                ========================================== */}
            <section className="record-info-card">
                <h3 className="record-card-heading">
                    <span className="record-card-icon"><i className="fas fa-info-circle"></i></span>
                    Pamata Informācija
                </h3>
                <div className="record-card-content">
                    {/* Title */}
                    <div className="record-data-field">
                        <label className="record-data-label">Nosaukums:</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editFormData.title || ''}
                                onChange={(e) => handleFieldChange('title', e.target.value)}
                                className={`record-data-input ${validationErrors.title ? 'error' : ''}`}
                            />
                        ) : (
                            <p className="record-data-value">{recordData.title || '—'}</p>
                        )}
                        {validationErrors.title && (
                            <span className="error-message">{validationErrors.title}</span>
                        )}
                    </div>

                    {/* Reg Nr */}
                    <div className="record-data-field">
                        <label className="record-data-label">Reģistrācijas Nr.:</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editFormData.reg_nr || ''}
                                onChange={(e) => handleFieldChange('reg_nr', e.target.value)}
                                className="record-data-input"
                            />
                        ) : (
                            <p className="record-data-value">{recordData.reg_nr || '—'}</p>
                        )}
                    </div>

                    {/* Date */}
                    <div className="record-data-field">
                        <label className="record-data-label">Datums:</label>
                        {isEditing ? (
                            <input
                                type="date"
                                value={editFormData.date || ''}
                                onChange={(e) => handleFieldChange('date', e.target.value)}
                                className="record-data-input"
                            />
                        ) : (
                            <p className="record-data-value">{formatDate(recordData.date) || '—'}</p>
                        )}
                    </div>

                    {/* Pages Count */}
                    <div className="record-data-field">
                        <label className="record-data-label">Lappušu skaits:</label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={editFormData.pages_count || ''}
                                onChange={(e) => handleFieldChange('pages_count', e.target.value)}
                                className="record-data-input"
                                min="1"
                            />
                        ) : (
                            <p className="record-data-value">{recordData.pages_count || '—'}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ==========================================
                CLASSIFICATION SECTION
                ========================================== */}
            <section className="record-info-card">
                <h3 className="record-card-heading">
                    <span className="record-card-icon"><i className="fas fa-tag"></i></span>
                    Klasifikācija
                </h3>
                <div className="record-card-content">
                    {/* Language */}
                    <div className="record-data-field">
                        <label className="record-data-label">Valoda:</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editFormData.language || ''}
                                onChange={(e) => handleFieldChange('language', e.target.value)}
                                className="record-data-input"
                                placeholder="piem., Latviešu"
                            />
                        ) : (
                            <p className="record-data-value">{recordData.language || '—'}</p>
                        )}
                    </div>

                    {/* Secrecy */}
                    <div className="record-data-field">
                        <label className="record-data-label">Slepenības pakāpe:</label>
                        {isEditing ? (
                            <select
                                value={editFormData.secrecy || ''}
                                onChange={(e) => handleFieldChange('secrecy', e.target.value)}
                                className="record-data-select"
                            >
                                <option value="">Izvēlieties...</option>
                                <option value="public">Publisks</option>
                                <option value="internal">Iekšējs</option>
                                <option value="confidential">Konfidenciāls</option>
                                <option value="secret">Slepenība</option>
                            </select>
                        ) : (
                            <p className="record-data-value">{recordData.secrecy || '—'}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ==========================================
                DESCRIPTION SECTION
                ========================================== */}
            <section className="record-info-card record-info-card-full">
                <h3 className="record-card-heading">
                    <span className="record-card-icon"><i className="fas fa-file-alt"></i></span>
                    Apraksts
                </h3>
                <div className="record-card-content">
                    {/* Annotation */}
                    <div className="record-data-field">
                        <label className="record-data-label">Anotācija:</label>
                        {isEditing ? (
                            <textarea
                                value={editFormData.annotation || ''}
                                onChange={(e) => handleFieldChange('annotation', e.target.value)}
                                className="record-data-textarea"
                                rows="4"
                            />
                        ) : (
                            <p className="record-data-value record-data-value-text">
                                {recordData.annotation || 'Nav anotācijas'}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="record-data-field">
                        <label className="record-data-label">Piezīmes:</label>
                        {isEditing ? (
                            <textarea
                                value={editFormData.notes || ''}
                                onChange={(e) => handleFieldChange('notes', e.target.value)}
                                className="record-data-textarea"
                                rows="3"
                            />
                        ) : (
                            <p className="record-data-value record-data-value-text">
                                {recordData.notes || 'Nav piezīmju'}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* ==========================================
                ACCESS & SECURITY SECTION
                ========================================== */}
            <section className="record-info-card record-info-card-full">
                <h3 className="record-card-heading">
                    <span className="record-card-icon"><i className="fas fa-lock"></i></span>
                    Piekļuve un Drošība
                </h3>
                <div className="record-card-content">
                    {/* Access Restriction */}
                    <div className="record-data-field">
                        <label className="record-data-label">Piekļuves ierobežojums:</label>
                        {isEditing ? (
                            <select
                                value={editFormData.access_restriction || ''}
                                onChange={(e) => handleFieldChange('access_restriction', e.target.value)}
                                className="record-data-select"
                            >
                                <option value="">Izvēlieties...</option>
                                <option value="open">Atvērts</option>
                                <option value="restricted">Ierobežots</option>
                                <option value="closed">Slēgts</option>
                            </select>
                        ) : (
                            <p className="record-data-value">{recordData.access_restriction || '—'}</p>
                        )}
                    </div>

                    {/* Access Restriction Notes */}
                    <div className="record-data-field">
                        <label className="record-data-label">Ierobežojuma piezīmes:</label>
                        {isEditing ? (
                            <textarea
                                value={editFormData.access_restriction_notes || ''}
                                onChange={(e) => handleFieldChange('access_restriction_notes', e.target.value)}
                                className="record-data-textarea"
                                rows="2"
                            />
                        ) : (
                            <p className="record-data-value record-data-value-text">
                                {recordData.access_restriction_notes || '—'}
                            </p>
                        )}
                    </div>

                    {/* Access Restriction Date */}
                    <div className="record-data-field">
                        <label className="record-data-label">Ierobežojuma datums:</label>
                        {isEditing ? (
                            <input
                                type="date"
                                value={editFormData.access_restriction_date || ''}
                                onChange={(e) => handleFieldChange('access_restriction_date', e.target.value)}
                                className="record-data-input"
                            />
                        ) : (
                            <p className="record-data-value">{formatDate(recordData.access_restriction_date) || '—'}</p>
                        )}
                    </div>

                    {/* User Restriction Notes */}
                    <div className="record-data-field">
                        <label className="record-data-label">Lietotāja ierobežojumu piezīmes:</label>
                        {isEditing ? (
                            <textarea
                                value={editFormData.user_restriction_notes || ''}
                                onChange={(e) => handleFieldChange('user_restriction_notes', e.target.value)}
                                className="record-data-textarea"
                                rows="2"
                            />
                        ) : (
                            <p className="record-data-value record-data-value-text">
                                {recordData.user_restriction_notes || '—'}
                            </p>
                        )}
                    </div>

                    {/* Technical Info */}
                    <div className="record-data-field">
                        <label className="record-data-label">Tehniskā informācija:</label>
                        {isEditing ? (
                            <textarea
                                value={editFormData.tech_info || ''}
                                onChange={(e) => handleFieldChange('tech_info', e.target.value)}
                                className="record-data-textarea"
                                rows="2"
                            />
                        ) : (
                            <p className="record-data-value record-data-value-text">
                                {recordData.tech_info || '—'}
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    </div>
)}

                {/* Media Record Info Tab */}
                {activeTab === 'info' && inheritanceInfo.isMedia && (
                    <MediaRecordForm
                        recordData={recordData}
                        isEditing={isEditing}
                        editFormData={editFormData}
                        onFieldChange={handleFieldChange}
                        validationErrors={validationErrors}
                        formatDate={formatDate}
                    />
                )}

                {/* Metadata Tab */}
                {activeTab === 'metadata' && !inheritanceInfo.isMedia && (
                    <RecordMetadata
                        recordId={recordId}
                        projectId={projectId}
                        recordData={recordData}
                        activeSection={activeMetadataSection}
                        onSectionChange={setActiveMetadataSection}
                    />
                )}

                {/* Files Tab */}
                {activeTab === 'files' && (
                    <RecordFiles
                        recordId={recordId}
                        projectId={projectId}
                        files={recordData.files || []}
                        canUpload={!inheritanceInfo.isMedia}
                        viewMode={filesViewMode}
                        onFileOperationStart={handleFileOperationStart}
                        onFileOperationComplete={handleFileOperationComplete}
                    />
                )}
            </div>
        </div>
    );
};

export default Record;
