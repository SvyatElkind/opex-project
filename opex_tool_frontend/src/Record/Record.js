import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import { useDeleteFile } from '../hooks/useFiles';
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
    const reopenEditRef = useRef(false);

    const { projectData, navigateBackSmart, navigateTo, activeTab: navActiveTab, clearActiveTab, getActiveTab } = useNavigation();

    const [filesViewMode, setFilesViewMode] = useState('table');

    const { data: apiMetadata, isLoading: metadataLoading } = useRecord(projectId, recordId);

    useEffect(() => {
        if (isFileOperationRef.current) {
            const scrollContainer = document.querySelector('.record-content');

            if (scrollContainer && scrollPositionRef.current > 0) {
                setTimeout(() => {
                    scrollContainer.scrollTop = scrollPositionRef.current;
                    isFileOperationRef.current = false;
                    scrollPositionRef.current = 0;
                }, 100);
            }
        }
    }, [projectData]);
    
    const [jumpToNumber, setJumpToNumber] = useState('');

    const currentItem = useMemo(() => {
        if (!projectData || !itemId) return null;

        const inventories = projectData.institution?.fond?.inventories || [];
        for (const inv of inventories) {
            const items = inv.items || [];
            const item = items.find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    }, [projectData, itemId]);

    const allRecords = useMemo(() => {
        if (!currentItem || !inventory) return [];

        const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
        
        let records = [];
        
        if (inheritanceInfo.isTextual) {
            records = currentItem.records || [];
        } else if (inheritanceInfo.isMedia) {
            records = [
                ...(currentItem.photo_records || []),
                ...(currentItem.video_records || []),
                ...(currentItem.audio_records || [])
            ];
        }

        return records.sort((a, b) => a.id - b.id);
    }, [currentItem, inventory]);
    
    const currentIndex = useMemo(() => {
        return allRecords.findIndex(r => r.id === recordId);
    }, [allRecords, recordId]);


    const prevRecord = currentIndex > 0 ? allRecords[currentIndex - 1] : null;
    const nextRecord = currentIndex < allRecords.length - 1 ? allRecords[currentIndex + 1] : null;

    const mainRecordData = useMemo(() => {
        if (!projectData || !recordId) {
            return null;
        }
        
        const inventories = projectData.institution?.fond?.inventories || [];
        
        for (const inv of inventories) {
            const items = inv.items || [];
            
            for (const item of items) {
                if (item.records && Array.isArray(item.records)) {
                    const found = item.records.find(r => r.id === recordId);
                    if (found) {
                        return {
                            ...found, 
                            itemId: item.id,
                            inventoryId: inv.id,
                            inventoryType: inv.type,
                            isMediaRecord: false 
                        };
                    }
                }
                
                if (item.photo_records && Array.isArray(item.photo_records)) {
                    const found = item.photo_records.find(r => r.id === recordId);
                    if (found) {
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
                
                if (item.video_records && Array.isArray(item.video_records)) {
                    const found = item.video_records.find(r => r.id === recordId);
                    if (found) {
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
                
                if (item.audio_records && Array.isArray(item.audio_records)) {
                    const found = item.audio_records.find(r => r.id === recordId);
                    if (found) {
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
        
        return null;
    }, [projectData, recordId]);
    
    const recordData = useMemo(() => {
        if (!mainRecordData) {
            return null;
        }

        const merged = { ...mainRecordData };

        if (apiMetadata) {
            merged.actions = apiMetadata.actions || [];
            merged.addressees = apiMetadata.addressees || [];
            merged.visas = apiMetadata.visas || [];
            merged.read_status = apiMetadata.read_statuses || apiMetadata.read_status || [];
        } else {
            merged.actions = mainRecordData.actions || [];
            merged.addressees = mainRecordData.addressees || [];
            merged.visas = mainRecordData.visas || [];
            merged.read_status = mainRecordData.read_status || [];
        }
        
        return merged;
    }, [mainRecordData, apiMetadata]);


    const updateRecordMutation = useUpdateRecord();
    const updateMediaRecordMutation = useUpdateMediaRecord();
    const deleteRecordMutation = useDeleteRecord();

    const handleFileOperationStart = () => {
        const scrollContainer = document.querySelector('.record-content');
        if (scrollContainer) {
            scrollPositionRef.current = scrollContainer.scrollTop;
            isFileOperationRef.current = true;
        }
    };

    const handleFileOperationComplete = () => {
        queryClient.invalidateQueries(['project', projectId]);
    };

    const inheritanceInfo = inventory ?
        InheritanceUtils.getInheritanceInfo(inventory) :
        { isTextual: true, isMedia: false, type: 'Tekstuāls' };
    
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = sessionStorage.getItem('record_active_tab');
        if (savedTab) {
            return savedTab;
        }
        return getActiveTab() || 'info';
    });

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

    useEffect(() => {
        if (navActiveTab) {
            setActiveTab(navActiveTab);
            clearActiveTab();
        }
    }, [navActiveTab, clearActiveTab]);

    useEffect(() => {
        const pendingTab = getActiveTab();
        if (pendingTab) {
            setActiveTab(pendingTab);
            clearActiveTab();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordId]);

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
                duration: recordData.duration || '',
                resolution: recordData.resolution || '',
                format: recordData.format || '',
                size: recordData.size || '',
                color: recordData.color || '',
            });
        }
    }, [recordData, isEditing]);
    
    const handlePrevRecord = () => {
        if (prevRecord) {
            sessionStorage.setItem('record_active_tab', activeTab);
            navigateTo('record', prevRecord.id, inventory.id, itemId);
        }
    };

    const handleNextRecord = () => {
        if (nextRecord) {
            sessionStorage.setItem('record_active_tab', activeTab);
            navigateTo('record', nextRecord.id, inventory.id, itemId);
        }
    };

    const navigateRecordByKey = useCallback((direction) => {
        const target = direction === -1 ? prevRecord : nextRecord;
        if (!target) return;
        sessionStorage.setItem('record_active_tab', activeTab);
        navigateTo('record', target.id, inventory.id, itemId);
    }, [prevRecord, nextRecord, activeTab, navigateTo, inventory?.id, itemId]);

    const saveAndNavigateRecord = useCallback(async (direction) => {
        const errors = validateRecordForm(editFormData, inheritanceInfo.isAnyMedia);
        if (hasValidationErrors(errors)) {
            setValidationErrors(errors);
            setErrorMessage(RECORD_ERROR_MESSAGES.VALIDATION_FAILED);
            return;
        }

        try {
            if (inheritanceInfo.isAnyMedia) {
                await updateMediaRecordMutation.mutateAsync({
                    projectId, recordId,
                    recordData: editFormData,
                    recordType: inheritanceInfo.type
                });
            } else {
                await updateRecordMutation.mutateAsync({
                    projectId, recordId,
                    recordData: editFormData
                });
            }
            setIsEditing(false);
            setValidationErrors({});
            navigateRecordByKey(direction);
        } catch (error) {
            setErrorMessage(error.message || RECORD_ERROR_MESSAGES.UPDATE);
        }
    }, [editFormData, inheritanceInfo.isAnyMedia, inheritanceInfo.type, updateMediaRecordMutation, updateRecordMutation, projectId, recordId, navigateRecordByKey]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            if (showDeleteConfirm || showEditPopup) return;

            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (document.activeElement?.isContentEditable) return;

            e.preventDefault();
            const direction = e.key === 'ArrowLeft' ? -1 : 1;

            if (isEditing) {
                saveAndNavigateRecord(direction);
            } else {
                navigateRecordByKey(direction);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showDeleteConfirm, showEditPopup, isEditing, navigateRecordByKey, saveAndNavigateRecord]);

    // Reopen edit popup after navigating to a new record
    useEffect(() => {
        if (reopenEditRef.current) {
            reopenEditRef.current = false;
            setShowEditPopup(true);
        }
    }, [recordId]);

    const handleEditNavigate = useCallback((direction) => {
        const target = direction === -1 ? prevRecord : nextRecord;
        if (!target) return;
        reopenEditRef.current = true;
        setShowEditPopup(false);
        sessionStorage.setItem('record_active_tab', activeTab);
        navigateTo('record', target.id, inventory.id, itemId);
    }, [prevRecord, nextRecord, activeTab, navigateTo, inventory?.id, itemId]);

    const handleJumpToRecord = () => {
        const targetIndex = parseInt(jumpToNumber) - 1;
        if (!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < allRecords.length) {
            const targetRecord = allRecords[targetIndex];
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
    
    const getRecordIdentifier = (record) => {
        if (!record) return '';
        return record.title || record.reg_nr || `Ieraksts ${record.id}`;
    };
    
    const handleFieldChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    
    const handleStartEdit = () => {
        if (!inheritanceInfo.isMedia) {
            setShowEditPopup(true);
            return;
        }
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
        const errors = validateRecordForm(editFormData, inheritanceInfo.isAnyMedia);

        if (hasValidationErrors(errors)) {
            setValidationErrors(errors);
            setErrorMessage(RECORD_ERROR_MESSAGES.VALIDATION_FAILED);
            return;
        }

        try {
            if (inheritanceInfo.isAnyMedia) {
                await updateMediaRecordMutation.mutateAsync({
                    projectId,
                    recordId,
                    recordData: editFormData,
                    recordType: inheritanceInfo.type
                });
            } else {
                await updateRecordMutation.mutateAsync({
                    projectId,
                    recordId,
                    recordData: editFormData
                });
            }
            
            setSuccessMessage(RECORD_SUCCESS_MESSAGES.UPDATE);
            setIsEditing(false);
            setValidationErrors({});
            
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage(error.message || RECORD_ERROR_MESSAGES.UPDATE);
        }
    };
    
    const handleDelete = async () => {
        try {
            await deleteRecordMutation.mutateAsync({
                projectId,
                recordId
            });

            queryClient.invalidateQueries(['project', projectId]);
            queryClient.invalidateQueries(['project', 'detail', projectId]);
            handleBack();
        } catch (error) {
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
    
    return (
        <div className="record-container">
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
                        onKeyDown={(e) => e.key === 'Enter' && handleJumpToRecord()}
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
                    prevRecord={prevRecord}
                    nextRecord={nextRecord}
                    onNavigate={handleEditNavigate}
                />
            )}

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
                                disabled={updateRecordMutation.isPending || updateMediaRecordMutation.isPending}
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

            <div className="record-content">
                {activeTab === 'info' && !inheritanceInfo.isMedia && (
    <div className="record-info-tab-content">
        <div className="record-sections-grid">
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
