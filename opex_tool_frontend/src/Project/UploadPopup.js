import React, { useState, useRef } from "react";
import Project_API from "../API/Project_API";
import { GeneralError } from '../components/ErrorDisplay';
import {
    ALLOWED_REPORT_FORMAT,
    validateReportFile,
    PROJECT_ERROR_MESSAGES
} from '../Constants/projectConstants';

const UploadPopup = ({ onClose, onDone, projectId }) => {
    const [file, setFile] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef(null);

    const maxFileSize = 50 * 1024 * 1024; // 50MB

    const validateFile = (selectedFile) => {
        // Use constants validation
        const result = validateReportFile(selectedFile);
        if (!result.isValid) {
            return { valid: false, message: result.error };
        }

        // Additional size check
        if (selectedFile.size > maxFileSize) {
            return { valid: false, message: "Faila apjoms nevar pārsniegt 50MB" };
        }

        return { valid: true };
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validation = validateFile(selectedFile);
            if (validation.valid) {
                setFile(selectedFile);
                setErrorMessage('');
                setShowAlert(false);
            } else {
                setErrorMessage(validation.message);
                setShowAlert(true);
                setFile(null);
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);

        if (e.dataTransfer.files.length) {
            const selectedFile = e.dataTransfer.files[0];
            const validation = validateFile(selectedFile);
            if (validation.valid) {
                setFile(selectedFile);
                setErrorMessage('');
                setShowAlert(false);
            } else {
                setErrorMessage(validation.message);
                setShowAlert(true);
                setFile(null);
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const closeAlert = () => {
        setShowAlert(false);
    };

    const handleUpload = async () => {
        if (!file) {
            setErrorMessage(PROJECT_ERROR_MESSAGES.file_required);
            setShowAlert(true);
            return;
        }

        // Final validation before upload
        const validation = validateFile(file);
        if (!validation.valid) {
            setErrorMessage(validation.message);
            setShowAlert(true);
            return;
        }

        if (isLoading) {
            console.log('Upload already in progress, ignoring...');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setShowAlert(false);
        setUploadProgress(0);

        try {
            const projectAPI = Project_API();

            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 100);

            const result = await projectAPI.uploadFileAsAttachment(projectId, file);

            clearInterval(progressInterval);
            setUploadProgress(100);

            console.log('Upload result:', result);

            if (Array.isArray(result) && result[0] === true) {
                setSuccessMessage(`Fails "${file.name}" veiksmīgi augšuplādēts!`);
                setTimeout(() => {
                    onClose();
                    onDone(file);
                }, 1500);
            } else {
                setErrorMessage('Augšupielāde neizdevās: ' + JSON.stringify(result));
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setErrorMessage(error.message || error.toString());
            setShowAlert(true);
            setUploadProgress(0);
        } finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="upload-popup-overlay">
            <div className="upload-popup-container">
                <div className="upload-popup-header">
                    <div className="upload-popup-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                        </svg>
                    </div>
                    <h2 className="upload-popup-title">Augšuplādēt VVAIS Atskaiti</h2>
                    <button
                        className="upload-popup-close"
                        onClick={handleClose}
                        disabled={isLoading}
                        aria-label="Close"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 4.854 5.146a.5.5 0 1 0-.708.708L7.293 9l-3.147 3.146a.5.5 0 0 0 .708.708L8 9.707l3.146 3.147a.5.5 0 0 0 .708-.708L8.707 9l3.147-3.146z"/>
                        </svg>
                    </button>
                </div>

                <div className="upload-popup-content">
                    <div
                        className={`upload-dropzone ${dragOver ? 'upload-dropzone-active' : ''} ${file ? 'upload-dropzone-has-file' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={openFileDialog}
                    >
                        <div className="upload-dropzone-icon">
                            {file ? (
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                </svg>
                            ) : (
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                                </svg>
                            )}
                        </div>

                        {file ? (
                            <div className="upload-file-details">
                                <div className="upload-file-name">{file.name}</div>
                                <div className="upload-file-info">
                                    XLSX • {formatFileSize(file.size)}
                                </div>
                                <button
                                    className="upload-remove-file"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile();
                                    }}
                                    type="button"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                    </svg>
                                    Noņemt
                                </button>
                            </div>
                        ) : (
                            <div className="upload-dropzone-text">
                                <div className="upload-dropzone-primary">
                                    Ievietojiet failu šeit
                                </div>
                                <div className="upload-dropzone-secondary">
                                    vai <span className="upload-browse-link">meklēt failupārlūkā</span>
                                </div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept={ALLOWED_REPORT_FORMAT}
                        />
                    </div>

                    {isLoading && (
                        <div className="upload-progress">
                            <div className="upload-progress-bar">
                                <div
                                    className="upload-progress-fill"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <div className="upload-progress-text">
                                {uploadProgress < 100 ? `Augšuplādē... ${uploadProgress}%` : 'Apstrādā...'}
                            </div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="upload-success-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            {successMessage}
                        </div>
                    )}

                    <div className="upload-file-types">
                        <div className="upload-file-types-label">Atļautais formāts:</div>
                        <div className="upload-file-types-list">
                           Tikai {ALLOWED_REPORT_FORMAT.toUpperCase().replace('.', '')} (maksimālais faila apjoms 50MB)
                        </div>
                    </div>
                </div>

                <div className="upload-popup-actions">
                    <button
                        className="upload-confirm-btn"
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="upload-loading-spinner"></span>
                                Augšuplādē...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                                </svg>
                                Augšuplādēt failu
                            </>
                        )}
                    </button>
                    <button
                        className="upload-cancel-btn"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        Atcelt
                    </button>
                </div>

                {showAlert && <GeneralError message={errorMessage} onClose={closeAlert} />}
            </div>
        </div>
    );
};

export default UploadPopup;
