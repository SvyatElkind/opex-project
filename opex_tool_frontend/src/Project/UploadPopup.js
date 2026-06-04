import React, { useState, useRef } from "react";
import Project_API from "../API/Project_API";
import { GeneralError } from '../components/ErrorDisplay';
import {
    ALLOWED_REPORT_FORMAT,
    validateReportFile,
    PROJECT_ERROR_MESSAGES
} from '../Constants/projectConstants';
import { PROJECT_REPORT_UI } from '../Constants/Constants';
import HelpButton from '../Help/HelpButton';

const UploadPopup = ({ onClose, onDone, projectId }) => {
    const [file, setFile] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef(null);

    const validateFile = (selectedFile) => {
        // Use constants validation (file type/extension only — no size limit)
        const result = validateReportFile(selectedFile);
        if (!result.isValid) {
            return { valid: false, message: result.error };
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

        if (isLoading) return;

        setIsLoading(true);
        setErrorMessage('');
        setShowAlert(false);
        setUploadProgress(0);

        let progressInterval = null;
        try {
            const projectAPI = Project_API();

            progressInterval = setInterval(() => {
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
            progressInterval = null;
            setUploadProgress(100);

            if (Array.isArray(result) && result[0] === true) {
                setSuccessMessage(PROJECT_REPORT_UI.UPLOAD_SUCCESS);
                setTimeout(() => {
                    onClose();
                    onDone(file);
                }, 1500);
            } else {
                const errorDetail = result?.[1]?.message || result?.[1]?.error || '';
                setErrorMessage(PROJECT_REPORT_UI.UPLOAD_ERROR + (errorDetail ? ': ' + errorDetail : ''));
                setShowAlert(true);
            }
        } catch (error) {
            setErrorMessage(error.message || error.toString());
            setShowAlert(true);
            setUploadProgress(0);
        } finally {
            if (progressInterval) clearInterval(progressInterval);
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
                    <h2 className="upload-popup-title">{PROJECT_REPORT_UI.UPLOAD_TITLE}</h2>
                    <HelpButton chapterId="projects" iconOnly={true} className="small" />
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
                                    Noņemt
                                </button>
                            </div>
                        ) : (
                            <div className="upload-dropzone-text">
                                <div className="upload-dropzone-primary">
                                    {PROJECT_REPORT_UI.UPLOAD_DRAG_DROP}
                                </div>
                                <div className="upload-dropzone-secondary">
                                    {PROJECT_REPORT_UI.UPLOAD_OR} <span className="upload-browse-link">{PROJECT_REPORT_UI.UPLOAD_BROWSE}</span>
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
                                {uploadProgress < 100 ? `${PROJECT_REPORT_UI.UPLOAD_IN_PROGRESS} ${uploadProgress}%` : 'Apstrādā...'}
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
                </div>

                <div className="upload-popup-actions">
                    <button
                        className="upload-cancel-btn"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        {PROJECT_REPORT_UI.UPLOAD_CANCEL}
                    </button>
                    <button
                        className="upload-confirm-btn"
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="upload-loading-spinner"></span>
                                {PROJECT_REPORT_UI.UPLOAD_IN_PROGRESS}
                            </>
                        ) : (
                            <>
                                {PROJECT_REPORT_UI.UPLOAD_BUTTON}
                            </>
                        )}
                    </button>
                </div>

                {showAlert && <GeneralError message={errorMessage} onClose={closeAlert} />}
            </div>
        </div>
    );
};

export default UploadPopup;
