// src/Record/CreateRecord.js
// Updated component for creating records with proper media type support

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
    const [creationMode, setCreationMode] = useState('form'); // 'form' or 'media'

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

    // Handle form submission for standard records
    const handleFormSubmit = async (formData) => {
        if (!validation.allowed) {
            setErrorMessage(validation.message);
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
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
            } else {
                // For media records, close after creation
                setTimeout(() => {
                    onClose();
                }, 1500);
            }

        } catch (error) {
            console.error('Record creation error:', error);
            setErrorMessage(error.message || RECORD_ERROR_MESSAGES.CREATION_FAILED);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle media record creation with file upload
    const handleMediaFileUpload = async (files) => {
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
            // For media records, only upload one file
            const file = files[0];
            
            await createMediaRecordMutation.mutateAsync({
                file: file,
                projectId: projectId,
                itemId: item.id
            });

            setSuccessMessage(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} ${RECORD_SUCCESS_MESSAGES.RECORD_CREATED}`);
            setRecordsCreated(prev => prev + 1);

            // Call parent callback if provided
            if (OnCreate) {
                OnCreate();
            }

            // Close after successful creation
            setTimeout(() => {
                onClose();
            }, 1500);

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
        handleMediaFileUpload(files);
    };

    // Get creation mode instructions based on inventory type
    const getCreationInstructions = () => {
        if (isMediaInventory) {
            return {
                title: `Izveidot ${inheritanceInfo.type} Ierakstu`,
                subtitle: `Augšupielādējiet ${inheritanceInfo.type.toLowerCase()} failu, lai izveidotu ierakstu`,
                icon: inheritanceInfo.icon,
                acceptedTypes: inventory.type
            };
        } else {
            return {
                title: `Izveidot ${inheritanceInfo.type} Ierakstu`,
                subtitle: 'Aizpildiet formu, lai izveidotu jaunu ierakstu',
                icon: inheritanceInfo.icon,
                acceptedTypes: null
            };
        }
    };

    const instructions = getCreationInstructions();

    // Render validation errors
    if (!validation.allowed) {
        return (
            <div className="create-record-modal">
                <div className="modal-backdrop" onClick={onClose}></div>
                <div className="create-record-container">
                    <div className="validation-error">
                        <div className="error-header">
                            <h3>⚠️ Nevar izveidot ierakstu</h3>
                            <button onClick={onClose} className="close-btn">×</button>
                        </div>
                        <div className="error-content">
                            <p>{validation.message}</p>
                            <div className="error-details">
                                <strong>Glabājamā vienība:</strong> {item.title || `GV-${item.id}`}<br/>
                                <strong>Inventāra tips:</strong> {inventory.type}<br/>
                                <strong>Elektronisks:</strong> {inventory.electronic ? 'Jā' : 'Nē'}<br/>
                                <strong>Esošie ieraksti:</strong> {item.records?.length || 0}
                            </div>
                        </div>
                        <div className="error-actions">
                            <button onClick={onClose} className="btn btn-secondary">
                                Aizvērt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="create-record-modal">
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="create-record-container">
                {/* Header */}
                <div className="create-record-header">
                    <div className="header-content">
                        <div className="header-icon" style={{ color: inheritanceInfo.color }}>
                            {instructions.icon}
                        </div>
                        <div className="header-text">
                            <h2>{instructions.title}</h2>
                            <p>{instructions.subtitle}</p>
                            {recordsCreated > 0 && (
                                <div className="creation-counter">
                                    Izveidoti ieraksti: <strong>{recordsCreated}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="close-btn" disabled={isSubmitting}>
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="create-record-content">
                    {/* Success Message */}
                    {successMessage && (
                        <div className="success-message">
                            <div className="success-icon">✓</div>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="error-message-banner">
                            <div className="error-icon">⚠</div>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* File Upload Errors */}
                    {fileErrors.length > 0 && (
                        <div className="file-errors">
                            <h4>Failu kļūdas:</h4>
                            {fileErrors.map((error, index) => (
                                <div key={index} className="file-error">
                                    <strong>{error.file}:</strong>
                                    <ul>
                                        {error.errors.map((msg, msgIndex) => (
                                            <li key={msgIndex}>{msg}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Media File Upload Interface */}
                    {isMediaInventory ? (
                        <div className="media-upload-section">
                            <div 
                                className={`file-drop-zone ${isSubmitting ? 'disabled' : ''}`}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    id="mediaFileInput"
                                    onChange={handleFileSelect}
                                    accept={getAcceptedFileTypes()}
                                    style={{ display: 'none' }}
                                    disabled={isSubmitting}
                                />
                                
                                <div className="drop-zone-content">
                                    <div className="upload-icon" style={{ color: inheritanceInfo.color }}>
                                        {isSubmitting ? (
                                            <div className="spinner"></div>
                                        ) : (
                                            '📁'
                                        )}
                                    </div>
                                    <h3>{RECORD_UI.DRAG_DROP_FILES}</h3>
                                    <p>vai</p>
                                    <label 
                                        htmlFor="mediaFileInput" 
                                        className={`btn btn-primary ${isSubmitting ? 'disabled' : ''}`}
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
                        /* Standard Record Form */
                        <MediaRecordForm
                            mediaType={mediaType || 'textual'}
                            onSubmit={handleFormSubmit}
                            onCancel={onClose}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {/* Additional Options for Textual Records */}
                    {!isMediaInventory && showFileUpload && (
                        <div className="additional-actions">
                            <div className="action-separator">
                                <span>Papildu darbības</span>
                            </div>
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
                                className="btn btn-secondary"
                                disabled={isSubmitting}
                            >
                                {RECORD_UI.CANCEL}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Helper function to get accepted file types
    function getAcceptedFileTypes() {
        const typeMap = {
            'Foto': '.jpg,.jpeg,.png,.tiff,.bmp,.gif',
            'Video': '.mp4,.avi,.mov,.wmv,.mkv,.flv',
            'Skaņas': '.mp3,.wav,.flac,.aac,.ogg,.m4a',
            'Datubāze': '.sql,.json,.csv,.xlsx,.xls'
        };
        return typeMap[inventory.type] || '*';
    }

    // Helper function to get file type hint text
    function getFileTypeHint() {
        const hintMap = {
            'Foto': 'JPEG, PNG, TIFF, BMP, GIF',
            'Video': 'MP4, AVI, MOV, WMV, MKV, FLV', 
            'Skaņas': 'MP3, WAV, FLAC, AAC, OGG, M4A',
            'Datubāze': 'SQL, JSON, CSV, Excel'
        };
        return hintMap[inventory.type] || 'Visi failu tipi';
    }
};

export default CreateRecord;