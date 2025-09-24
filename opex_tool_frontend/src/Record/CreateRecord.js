// src/Record/CreateRecord.js
// FIXED: Proper two-step media record creation

import React, { useState, useEffect } from "react";
import MediaRecordForm from './MediaRecordForm';
import { RECORD_UI, RECORD_ERROR_MESSAGES, RECORD_SUCCESS_MESSAGES } from "../Constants/Constnats"
import { useCreateRecord, useCreateMediaRecord, useUpdateMediaRecord } from '../hooks/useRecords';
import { validateFileUploads } from '../Utils/RecordValidation';
import InheritanceUtils from '../Utils/InheritanceUtils';
import './CreateRecord.css';
import './RecordForm.css';

const CreateRecord = ({ onClose, OnCreate, item, inventory, projectId }) => {
    // Get inheritance and validation info
    const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
    const validation = InheritanceUtils.validateRecordCreation(inventory, item);
    
    // FIXED: Correct hooks for media workflow
    const createRecordMutation = useCreateRecord();
    const createMediaRecordMutation = useCreateMediaRecord();
    const updateMediaRecordMutation = useUpdateMediaRecord();
    
    // Local state
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recordsCreated, setRecordsCreated] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileErrors, setFileErrors] = useState([]);
    const [showFileUpload, setShowFileUpload] = useState(false);
    
    // Two-step media flow state
    const [mediaFlowStep, setMediaFlowStep] = useState(1); // 1: upload, 2: metadata
    const [createdMediaRecord, setCreatedMediaRecord] = useState(null);

    // Clear messages after timeout
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // Determine if this should be a media record based on inventory type
    const isMediaInventory = inheritanceInfo.isMedia;
    const mediaType = inheritanceInfo.type?.toLowerCase();

    // Get media record type for backend API calls (exact API mapping)
    const getMediaRecordType = () => {
        switch (inventory.type) {
            case 'Foto': return 'Foto';    // API uses 'Foto'
            case 'Video': return 'Video';  // API uses 'Video' 
            case 'Skaņas': return 'Audio'; // API uses 'Audio'
            default: return null;
        }
    };

    // Get accepted file types for input
    const getAcceptTypes = () => {
        const types = {
            'Foto': 'image/*',
            'Video': 'video/*',
            'Skaņas': 'audio/*'
        };
        return types[inventory.type] || '*/*';
    };

    // Get file type text for display
    const getFileTypeText = () => {
        const types = {
            'Foto': 'JPG, PNG, GIF, BMP',
            'Video': 'MP4, AVI, MOV, WMV, MKV',
            'Skaņas': 'MP3, WAV, AAC, OGG, M4A'
        };
        return types[inventory.type] || 'Visi faila tipi';
    };

    // FIXED: Handle form submission - different logic for media step 2
    const handleFormSubmit = async (formData) => {
        // Safety check: Prevent form submission for media inventories in step 1
        if (isMediaInventory && mediaFlowStep === 1) {
            console.error('Form submission blocked for media inventory step 1');
            return;
        }

        if (!validation.allowed) {
            setErrorMessage(validation.message);
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            if (isMediaInventory && mediaFlowStep === 2) {
                // FIXED: Update existing media record, don't create new one
                const recordType = getMediaRecordType();
                
                if (!createdMediaRecord?.id || !recordType) {
                    throw new Error('Missing media record or type information');
                }

                await updateMediaRecordMutation.mutateAsync({
                    recordData: formData,
                    projectId: projectId,
                    recordId: createdMediaRecord.id,
                    recordType: recordType // Backend requires type parameter
                });

                setSuccessMessage(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} ieraksts pabeigts!`);
                
                // Close after successful completion
                setTimeout(() => {
                    if (OnCreate) OnCreate();
                    onClose();
                }, 1500);
                
            } else {
                // Standard textual record creation
                await createRecordMutation.mutateAsync({
                    recordData: formData,
                    projectId: projectId,
                    itemId: item.id
                });

                setSuccessMessage(RECORD_SUCCESS_MESSAGES.RECORD_CREATED);
                setRecordsCreated(prev => prev + 1);

                // Call parent callback if provided
                if (OnCreate) {
                    OnCreate();
                }

                // For non-media records, show file upload option
                if (!isMediaInventory) {
                    setShowFileUpload(true);
                }
            }

        } catch (error) {
            console.error('Record creation/update error:', error);
            setErrorMessage(error.message || RECORD_ERROR_MESSAGES.CREATION_FAILED);
        } finally {
            setIsSubmitting(false);
        }
    };

    // FIXED: Handle media record creation with file upload - STEP 1
    const handleMediaFileUpload = async (files) => {
        // Safety check: Only allow for media inventories
        if (!isMediaInventory) {
            console.error('Media file upload blocked for non-media inventory');
            return;
        }

        if (!validation.allowed) {
            setErrorMessage(validation.message);
            return;
        }

        if (!files || files.length === 0) {
            setErrorMessage(RECORD_ERROR_MESSAGES.NO_FILES_PROVIDED);
            return;
        }

        // Validate files
        const fileValidation = validateFileUploads(files, inventory.type);
        if (fileValidation.errors.length > 0) {
            setFileErrors(fileValidation.errors);
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");
        setFileErrors([]);

        try {
            // STEP 1: Upload media file and create media record
            const file = files[0];
            
            const response = await createMediaRecordMutation.mutateAsync({
                file: file,
                projectId: projectId,
                itemId: item.id
            });

            // FIXED: Store complete media record for step 2 update
            setCreatedMediaRecord(response);
            
            setSuccessMessage("Fails ir veiksmīgi augšupielādēts! Tagad aizpildiet ieraksta metadatus.");
            
            // Move to step 2: metadata form
            setMediaFlowStep(2);

        } catch (error) {
            console.error('Media record creation error:', error);
            setErrorMessage(error.message || RECORD_ERROR_MESSAGES.CREATION_FAILED);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle file selection for media upload
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        setFileErrors([]);
        
        if (files.length > 0) {
            handleMediaFileUpload(files);
        }
    };

    // Handle drag and drop for media files
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setSelectedFiles(files);
        setFileErrors([]);
        
        if (files.length > 0) {
            handleMediaFileUpload(files);
        }
    };

    // Handle back button in step 2 (allows re-uploading file)
    const handleBackToStep1 = () => {
        setMediaFlowStep(1);
        setCreatedMediaRecord(null);
        setSelectedFiles([]);
        setFileErrors([]);
        setSuccessMessage("");
    };

    return (
        <div className="create-record-modal-overlay">
            <div className="create-record-dialog">
                <div className="dialog-header">
                    <h3 className="dialog-title">
                        {RECORD_UI.CREATE_RECORD_TITLE}
                        {isMediaInventory && (
                            <span className="media-badge">
                                <i className={`fas fa-${mediaType === 'foto' ? 'camera' : mediaType === 'video' ? 'video' : 'microphone'}`}></i>
                                {mediaFlowStep === 1 ? 'Solis 1/2: Faila augšupielāde' : 'Solis 2/2: Metadatu ievade'}
                            </span>
                        )}
                    </h3>
                    <button onClick={onClose} className="close-btn">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="dialog-body">
                    {/* Error Messages */}
                    {errorMessage && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {errorMessage}
                        </div>
                    )}

                    {/* Success Messages */}
                    {successMessage && (
                        <div className="success-message">
                            <i className="fas fa-check-circle"></i>
                            {successMessage}
                        </div>
                    )}

                    {/* File Upload Errors */}
                    {fileErrors.length > 0 && (
                        <div className="file-errors">
                            {fileErrors.map((error, index) => (
                                <div key={index} className="file-error">
                                    <strong>{error.file}:</strong>
                                    <ul>
                                        {error.errors.map((err, errIndex) => (
                                            <li key={errIndex}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* FIXED: Proper two-step conditional rendering */}
                    {isMediaInventory ? (
                        mediaFlowStep === 1 ? (
                            /* STEP 1: Media Upload Interface */
                            <div className="media-upload-container">
                                <div className="upload-instruction">
                                    <h4>1. solis: Augšupielādējiet {inventory.type.toLowerCase()} failu</h4>
                                    <p>Pēc faila augšupielādes jums būs nepieciešams aizpildīt ieraksta metadatus.</p>
                                </div>

                                <div 
                                    className={`file-drop-zone ${isSubmitting ? 'disabled' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    <div className="drop-zone-content">
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        <p>Velciet failu šeit vai noklikšķiniet, lai izvēlētos</p>
                                        <input
                                            type="file"
                                            id="media-file-input"
                                            onChange={handleFileSelect}
                                            accept={getAcceptTypes()}
                                            disabled={isSubmitting}
                                            style={{ display: 'none' }}
                                        />
                                        <label 
                                            htmlFor="media-file-input" 
                                            className={`btn btn-primary upload-btn ${isSubmitting ? 'disabled' : ''}`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                    Augšupielādē...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-plus"></i>
                                                    Izvēlēties failu
                                                </>
                                            )}
                                        </label>
                                    </div>
                                    
                                    <div className="file-type-info">
                                        Atļautie faila tipi: {getFileTypeText()}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* STEP 2: Metadata Form */
                            <div className="media-metadata-container">
                                <div className="step-info">
                                    <h4>2. solis: Aizpildiet ieraksta metadatus</h4>
                                    <p>Faila augšupielāde ir pabeigta. Tagad pievienojiet ieraksta informāciju.</p>
                                </div>

                                {/* Show uploaded file info */}
                                {selectedFiles.length > 0 && (
                                    <div className="selected-files">
                                        <h4>Augšupielādētais fails</h4>
                                        <div className="selected-file">
                                            <span className="file-name">{selectedFiles[0].name}</span>
                                            <span className="file-size">({(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                    </div>
                                )}

                                <MediaRecordForm
                                    onSubmit={handleFormSubmit}
                                    isSubmitting={isSubmitting}
                                    inventory={inventory}
                                    existingRecord={createdMediaRecord} // Pass existing record data
                                />
                                
                                <div className="additional-actions">
                                    <div className="action-separator">
                                        <span>vai</span>
                                    </div>
                                    <div className="action-buttons">
                                        <button 
                                            onClick={handleBackToStep1}
                                            className="btn btn-outline"
                                            disabled={isSubmitting}
                                        >
                                            <i className="fas fa-arrow-left"></i>
                                            Augšupielādēt citu failu
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        /* Standard Record Form (Textual) */
                        <MediaRecordForm
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                            inventory={inventory}
                        />
                    )}

                    {/* File Upload Section for Standard Records */}
                    {showFileUpload && !isMediaInventory && recordsCreated > 0 && (
                        <div className="additional-actions">
                            <div className="action-separator">
                                <span>Papildu darbības</span>
                            </div>
                            <h4>Pievienot failus ierakstam</h4>
                            <div className="file-drop-zone">
                                <div className="drop-zone-content">
                                    <i className="fas fa-paperclip"></i>
                                    <p>Pievienojiet papildu failus šim ierakstam</p>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files);
                                            // Handle file upload to existing record
                                            console.log('Upload files to existing record:', files);
                                        }}
                                        className="upload-btn"
                                        style={{ position: 'relative', display: 'inline-block' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Enhanced Dialog Footer */}
                <div className="dialog-footer">
                    <div>
                        {recordsCreated > 0 && (
                            <span style={{ color: '#28a745', fontWeight: '500' }}>
                                <i className="fas fa-check-circle"></i>
                                Ieraksti izveidoti: {recordsCreated}
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={onClose} className="btn btn-secondary">
                            {isSubmitting ? 'Aizvērt pēc pabeigšanas' : 'Aizvērt'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRecord;