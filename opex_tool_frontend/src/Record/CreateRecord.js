// src/Record/CreateRecord.js
// Fixed component with proper two-step media record creation

import React, { useState, useEffect } from "react";
import MediaRecordForm from './MediaRecordForm';
import { RECORD_UI, RECORD_ERROR_MESSAGES, RECORD_SUCCESS_MESSAGES } from "../Constants/Constnats"
import { useCreateRecord, useCreateMediaRecord } from '../hooks/useRecords';
import { validateFileUploads } from '../Utils/RecordValidation';
import InheritanceUtils from '../Utils/InheritanceUtils';
import Utils from "../Utils/Utils";
import './CreateRecord.css';
import './RecordForm.css';

const CreateRecord = ({ onClose, OnCreate, item, inventory, projectId }) => {
    const utils = Utils();
    
    // Get inheritance and validation info
    const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
    const validation = InheritanceUtils.validateRecordCreation(inventory, item);
    const uiConfig = InheritanceUtils.getItemUIConfig(inventory, item);
    
    // Hooks for API operations
    const createRecordMutation = useCreateRecord();
    const createMediaRecordMutation = useCreateMediaRecord();
    
    // Local state
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recordsCreated, setRecordsCreated] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileErrors, setFileErrors] = useState([]);
    const [showFileUpload, setShowFileUpload] = useState(false);
    
    // NEW: Two-step media flow state
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

    // Handle form submission for standard records ONLY
    const handleFormSubmit = async (formData) => {
        // SAFETY CHECK: Prevent form submission for media inventories in step 1
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
                // STEP 2: Create regular Record with metadata (separate from PhotoRecord)
                await createRecordMutation.mutateAsync({
                    recordData: formData,
                    projectId: projectId,
                    itemId: item.id  // Use item.id, not createdMediaRecord.id
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

    // Handle media record creation with file upload - STEP 1
    const handleMediaFileUpload = async (files) => {
        // SAFETY CHECK: Only allow for media inventories
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
            // STEP 1: Upload media file and create basic media record
            const file = files[0];
            
            const response = await createMediaRecordMutation.mutateAsync({
                file: file,
                projectId: projectId,
                itemId: item.id
            });

            // Store response for confirmation (not needed for step 2)
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

    // Get file type hint for display
    const getFileTypeHint = () => {
        switch (inventory.type) {
            case 'Foto':
                return 'JPG, PNG, TIFF';
            case 'Video':
                return 'MP4, AVI, MOV';
            case 'SkaÅ†as':
                return 'MP3, WAV, FLAC';
            default:
                return 'Visi failu tipi';
        }
    };

    // Helper function to get accept types for file input
    function getAcceptTypes() {
        switch (inventory.type) {
            case 'Foto':
                return 'image/jpeg,image/png,image/tiff,image/jpg';
            case 'Video':
                return 'video/mp4,video/avi,video/mov,video/quicktime';
            case 'SkaÅ†as':
                return 'audio/mp3,audio/wav,audio/flac,audio/mpeg';
            default:
                return '*/*';
        }
    }

    // Render validation errors if creation is not allowed
    if (!validation.allowed) {
        return (
            <div className="create-record-dialog">
                <div className="dialog-header">
                    <h3>Nevar izveidot ierakstu</h3>
                </div>
                <div className="dialog-body">
                    <div className="validation-error">
                        <i className="fas fa-exclamation-triangle"></i>
                        <p>{validation.message}</p>
                    </div>
                </div>
                <div className="dialog-footer">
                    <button onClick={onClose} className="btn btn-secondary">
                        Aizvērt
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="create-record-dialog">
            <div className="dialog-header">
                <h3>
                    {RECORD_UI.CREATE_RECORD} - {inventory.type}
                    {isMediaInventory && (
                        <span className="media-badge">
                            <i className="fas fa-file-upload"></i>
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
                                        {isSubmitting ? 'Augšupielādē...' : RECORD_UI.SELECT_FILES}
                                    </label>
                                    <div className="file-type-info">
                                        Atbalstītie formāti: {getFileTypeHint()}
                                    </div>
                                </div>
                            </div>

                            {/* Selected Files Display */}
                            {selectedFiles.length > 0 && (
                                <div className="selected-files">
                                    <h4>Izvēlētie faili:</h4>
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="selected-file">
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">
                                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* STEP 2: Metadata Form for Media Record */
                        <div className="media-metadata-container">
                            <div className="step-info">
                                <h4>2. solis: Aizpildiet ieraksta metadatus</h4>
                                <p>Fails ir veiksmīgi augšupielādēts. Tagad aizpildiet nepieciešamos ieraksta laukus.</p>
                            </div>
                            <MediaRecordForm
                                mediaType={mediaType}
                                onSubmit={handleFormSubmit}
                                onCancel={onClose}
                                isSubmitting={isSubmitting}
                                initialData={{
                                    // Pre-populate with current date and default language
                                    date: utils.formatDate(new Date()),
                                    created_date: utils.formatDate(new Date()),
                                    language: 'Latviešu',
                                    access_restriction: 'open'
                                }}
                            />
                        </div>
                    )
                ) : (
                    /* Standard Record Form - ONLY FOR NON-MEDIA */
                    <MediaRecordForm
                        mediaType={mediaType || 'textual'}
                        onSubmit={handleFormSubmit}
                        onCancel={onClose}
                        isSubmitting={isSubmitting}
                    />
                )}

                {/* Additional Options for Textual Records AFTER successful creation */}
                {!isMediaInventory && showFileUpload && (
                    <div className="additional-actions">
                        <div className="action-separator">
                            <span>Papildu darbības</span>
                        </div>
                        <div className="action-buttons">
                            <button
                                onClick={() => {
                                    setShowFileUpload(false);
                                    // Could open file upload modal here
                                }}
                                className="btn btn-outline"
                                disabled={isSubmitting}
                            >
                                📎 Pievienot failus
                            </button>
                            <button
                                onClick={onClose}
                                className="btn btn-primary"
                            >
                                Pabeigt
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - conditional based on flow step */}
            <div className="dialog-footer">
                {isMediaInventory && mediaFlowStep === 2 && (
                    <button 
                        onClick={() => {
                            setMediaFlowStep(1);
                            setCreatedMediaRecord(null);
                            setSelectedFiles([]);
                        }}
                        className="btn btn-outline"
                        disabled={isSubmitting}
                    >
                        ← Atgriezties pie faila augšupielādes
                    </button>
                )}
                <button 
                    onClick={onClose} 
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Notiek...' : 'Atcelt'}
                </button>
            </div>
        </div>
    );
};

export default CreateRecord;