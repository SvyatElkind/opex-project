// src/Record/Record.js
// Enhanced with Pagination Controls matching Item level design

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import RecordMetadata from './RecordMetadata';
import RecordFiles from './RecordFiles';
import MediaRecordForm from './MediaRecordForm';
import { RECORD_UI, RECORD_ERROR_MESSAGES, RECORD_SUCCESS_MESSAGES } from '../Constants/Constants';
import RecordDeletePopup from './RecordDeletePopup';
import EditDocumentRecord from './EditDocumentRecord';
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
import ValidationIndicator from '../components/ValidationIndicator';
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
        console.log('✅ File operation complete, invalidating project data...');
        // Invalidate project queries to refetch data
        queryClient.invalidateQueries(['project', projectId]);
        // The useEffect hook will restore scroll position when projectData reloads
    };

    // Get inheritance info
    const inheritanceInfo = inventory ?
        InheritanceUtils.getInheritanceInfo(inventory) :
        { isTextual: true, isMedia: false, type: 'Tekstuāls' };
    
    // State management
    // Initialize activeTab from sessionStorage (for pagination) or navigation context (for other navigation)
    const [activeTab, setActiveTab] = useState(() => {
        // First check sessionStorage (set by pagination handlers)
        const savedTab = sessionStorage.getItem('record_active_tab');
        if (savedTab) {
            return savedTab;
        }
        // Then check navigation context (for navigation from verification tree, etc.)
        return getActiveTab() || 'info';
    });

    // Clear sessionStorage after component mounts (handles Strict Mode double-mount)
    useEffect(() => {
        sessionStorage.removeItem('record_active_tab');
    }, []);
    const [activeMetadataSection, setActiveMetadataSection] = useState('actions');
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
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
            // Save current tab to sessionStorage for persistence across record navigation
            sessionStorage.setItem('record_active_tab', activeTab);
            navigateTo('record', prevRecord.id, inventory.id, itemId);
        }
    };

    const handleNextRecord = () => {
        if (nextRecord) {
            // Save current tab to sessionStorage for persistence across record navigation
            sessionStorage.setItem('record_active_tab', activeTab);
            navigateTo('record', nextRecord.id, inventory.id, itemId);
        }
    };

    const handleJumpToRecord = () => {
        const targetIndex = parseInt(jumpToNumber) - 1;
        if (!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < allRecords.length) {
            const targetRecord = allRecords[targetIndex];
            // Save current tab to sessionStorage for persistence across record navigation
            sessionStorage.setItem('record_active_tab', activeTab);
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
        // For textual/document records, open the edit popup
        if (!inheritanceInfo.isMedia) {
            setShowEditPopup(true);
            return;
        }
        // For media records, use inline editing
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

            // Invalidate project queries to refresh data
            queryClient.invalidateQueries(['project', projectId]);
            queryClient.invalidateQueries(['project', 'detail', projectId]);

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

            {/* Delete Confirmation Popup */}
            <RecordDeletePopup
                isOpen={showDeleteConfirm}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                records={recordData ? [recordData] : []}
                inventory={inventory}
            />

            {/* Edit Document Record Popup */}
            {showEditPopup && !inheritanceInfo.isMedia && (
                <EditDocumentRecord
                    onClose={() => setShowEditPopup(false)}
                    onUpdate={() => {
                        setSuccessMessage(RECORD_SUCCESS_MESSAGES.UPDATE);
                        setTimeout(() => setSuccessMessage(''), 3000);
                        queryClient.invalidateQueries(['project', projectId]);
                    }}
                    record={recordData}
                    item={currentItem}
                    inventory={inventory}
                    projectId={projectId}
                />
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
                    Datnes
                    {recordData.files?.length > 0 ? (
                        <span className="record-tab-badge">{recordData.files.length}</span>
                    ) : (
                        <ValidationIndicator
                            validation={
                                inheritanceInfo.isElectronicDocuments || inheritanceInfo.isElectronicMedia
                                    ? { status: 'ERROR', errors: [{ id: 'NO_FILES', message: 'Elektroniskajam dokumentam jābūt vismaz vienam failam' }], warnings: [] }
                                    : { status: 'WARNING', errors: [], warnings: [{ id: 'NO_FILES', message: 'Nav pievienoti faili' }] }
                            }
                            size="small"
                            showTooltip={false}
                            clickable={false}
                            showCount={false}
                        />
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
                    Pamata informācija
                </h3>
                <div className="record-card-content">
                    {/* Title */}
                    <div className="record-data-field">
                        <label className="record-data-label">Nosaukums:</label>
                        <p className="record-data-value">{recordData.title || '—'}</p>
                    </div>

                    {/* Date */}
                    <div className="record-data-field">
                        <label className="record-data-label">Datums:</label>
                        <p className="record-data-value">{formatDate(recordData.date) || '—'}</p>
                    </div>

                    {/* Reg Nr */}
                    <div className="record-data-field">
                        <label className="record-data-label">Reģistrācijas Nr.:</label>
                        <p className="record-data-value">{recordData.reg_nr || '—'}</p>
                    </div>

                    {/* Group */}
                    <div className="record-data-field">
                        <label className="record-data-label">Grupa:</label>
                        <p className="record-data-value">{recordData.group || '—'}</p>
                    </div>
                </div>
            </section>

            {/* ==========================================
                DOCUMENT DETAILS SECTION
                ========================================== */}
            <section className="record-info-card">
                <h3 className="record-card-heading">
                    <span className="record-card-icon"><i className="fas fa-file-alt"></i></span>
                    Dokumenta detaļas
                </h3>
                <div className="record-card-content">
                    {/* Created Date */}
                    <div className="record-data-field">
                        <label className="record-data-label">Izveidošanas datums:</label>
                        <p className="record-data-value">{formatDate(recordData.created_date) || '—'}</p>
                    </div>

                    {/* Sent Date */}
                    <div className="record-data-field">
                        <label className="record-data-label">Nosūtīšanas datums:</label>
                        <p className="record-data-value">{formatDate(recordData.sent_date) || '—'}</p>
                    </div>

                    {/* Language */}
                    <div className="record-data-field">
                        <label className="record-data-label">Valoda:</label>
                        <p className="record-data-value">{recordData.language || '—'}</p>
                    </div>

                    {/* Sent Reg Nr */}
                    <div className="record-data-field">
                        <label className="record-data-label">Nosūtītāja reģ. nr.:</label>
                        <p className="record-data-value">{recordData.sent_reg_nr || '—'}</p>
                    </div>

                    {/* Nomenclature Nr */}
                    <div className="record-data-field">
                        <label className="record-data-label">Lietas Nr.:</label>
                        <p className="record-data-value">{recordData.nomenclature_nr || '—'}</p>
                    </div>

                    {/* Keywords */}
                    <div className="record-data-field">
                        <label className="record-data-label">Atslēgvārdi:</label>
                        <p className="record-data-value">{recordData.key_words || '—'}</p>
                    </div>
                </div>
            </section>

            {/* ==========================================
                DESCRIPTION SECTION
                ========================================== */}
            <section className="record-info-card record-info-card-full">
                <h3 className="record-card-heading">
                    <span className="record-card-icon"><i className="fas fa-sticky-note"></i></span>
                    Apraksts
                </h3>
                <div className="record-card-content">
                    {/* Annotation */}
                    <div className="record-data-field">
                        <label className="record-data-label">Anotācija:</label>
                        <p className="record-data-value record-data-value-text">
                            {recordData.annotation || '—'}
                        </p>
                    </div>

                    {/* Notes */}
                    <div className="record-data-field">
                        <label className="record-data-label">Piezīmes:</label>
                        <p className="record-data-value record-data-value-text">
                            {recordData.notes || '—'}
                        </p>
                    </div>

                    {/* Technical Info */}
                    <div className="record-data-field">
                        <label className="record-data-label">Tehniskā informācija:</label>
                        <p className="record-data-value record-data-value-text">
                            {recordData.tech_info || '—'}
                        </p>
                    </div>
                </div>
            </section>

            {/* ==========================================
                ACCESS & SECURITY SECTION
                ========================================== */}
            <section className="record-info-card record-info-card-full">
                <h3 className="record-card-heading">
                    <span className="record-card-icon"><i className="fas fa-lock"></i></span>
                    Pieejamība
                </h3>
                <div className="record-card-content">
                    {/* Access Restriction */}
                    <div className="record-data-field">
                        <label className="record-data-label">Pieejamība:</label>
                        <p className="record-data-value">
                            {recordData.access_restriction === 'open' ? 'Vispārēja' :
                             recordData.access_restriction === 'closed' ? 'Ierobežota' : '—'}
                        </p>
                    </div>

                    {/* Access Restriction Notes */}
                    <div className="record-data-field">
                        <label className="record-data-label">Ierobežojuma piezīmes:</label>
                        <p className="record-data-value record-data-value-text">
                            {recordData.access_restriction_notes || '—'}
                        </p>
                    </div>

                    {/* Access Restriction Date */}
                    <div className="record-data-field">
                        <label className="record-data-label">Ierobežojuma datums:</label>
                        <p className="record-data-value">{formatDate(recordData.access_restriction_date) || '—'}</p>
                    </div>

                    {/* User Restriction Notes */}
                    <div className="record-data-field">
                        <label className="record-data-label">Lietošanas nosacījumi:</label>
                        <p className="record-data-value record-data-value-text">
                            {recordData.user_restriction_notes || '—'}
                        </p>
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
                        category={inheritanceInfo.category}
                        inventoryType={inventory?.type}
                    />
                )}
            </div>
        </div>
    );
};

export default Record;
