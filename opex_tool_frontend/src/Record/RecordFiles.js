// src/Record/RecordFiles.js
// Enhanced file management component with validation and modern UI

import React, { useState, useRef, useCallback } from 'react';
import { RECORD_UI, RECORD_ERROR_MESSAGES, RECORD_SUCCESS_MESSAGES, INVENTORY_CONSTANTS } from '../Constants/Constants';
import { useUploadFiles, useDeleteFile } from '../hooks/useRecords';
import { validateFileUploads } from '../Utils/RecordValidation';
import './RecordFiles.css';

const RecordFiles = ({ recordData, projectId, recordId, inventoryType }) => {
    const uploadFilesMutation = useUploadFiles();
    const deleteFileMutation = useDeleteFile();
    const fileInputRef = useRef(null);
    
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileErrors, setFileErrors] = useState([]);
    const [uploadErrors, setUploadErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    // Get files from record data
    const files = recordData?.files || [];

    // Utility functions
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (extension) => {
        const ext = extension?.toLowerCase().replace('.', '') || '';
        
        // Document types
        if (['pdf'].includes(ext)) return '📄';
        if (['doc', 'docx'].includes(ext)) return '📝';
        if (['xls', 'xlsx'].includes(ext)) return '📊';
        if (['ppt', 'pptx'].includes(ext)) return '📈';
        
        // Image types
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff'].includes(ext)) return '🖼️';
        
        // Video types
        if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) return '🎥';
        
        // Audio types
        if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) return '🎵';
        
        // Archive types
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
        
        // Text types
        if (['txt', 'rtf', 'csv'].includes(ext)) return '📃';
        
        // Database types
        if (['sql', 'json', 'db', 'sqlite'].includes(ext)) return '🗄️';
        
        return '📎';
    };

    const getFileTypeColor = (extension) => {
        const ext = extension?.toLowerCase().replace('.', '') || '';
        
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff'].includes(ext)) return '#e74c3c';
        if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) return '#9b59b6';
        if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) return '#3498db';
        if (['pdf'].includes(ext)) return '#e74c3c';
        if (['doc', 'docx'].includes(ext)) return '#2980b9';
        if (['xls', 'xlsx'].includes(ext)) return '#27ae60';
        if (['zip', 'rar', '7z'].includes(ext)) return '#f39c12';
        
        return '#95a5a6';
    };

    // Clear messages after timeout
    const clearMessage = useCallback((setter, delay = 3000) => {
        setTimeout(() => setter(''), delay);
    }, []);

    // File selection and validation
    const handleFileSelection = (selectedFiles) => {
        const fileArray = Array.from(selectedFiles);
        
        if (fileArray.length === 0) {
            return;
        }

        // Validate files
        const validation = validateFileUploads(fileArray, inventoryType);
        
        if (validation.errors.length > 0) {
            setFileErrors(validation.errors);
            setSelectedFiles([]);
            clearMessage(setFileErrors, 5000);
            return;
        }

        // Clear errors and set selected files
        setFileErrors([]);
        setSelectedFiles(fileArray);
        
        // Auto-upload if files are valid
        handleUpload(validation.validFiles);
    };

    // File upload handler
    const handleUpload = async (filesToUpload) => {
        if (!filesToUpload || filesToUpload.length === 0) {
            return;
        }

        setUploadErrors([]);
        
        // Initialize progress tracking
        const initialProgress = filesToUpload.map((file, index) => ({
            id: index,
            name: file.name,
            progress: 0,
            status: 'uploading'
        }));
        setUploadProgress(initialProgress);

        try {
            await uploadFilesMutation.mutateAsync({
                projectId,
                recordId,
                files: filesToUpload,
                onProgress: (progressData) => {
                    setUploadProgress(prev => 
                        prev.map(item => ({
                            ...item,
                            progress: progressData[item.id] || item.progress
                        }))
                    );
                }
            });

            // Success - update progress and show message
            setUploadProgress(prev => 
                prev.map(item => ({
                    ...item,
                    progress: 100,
                    status: 'completed'
                }))
            );

            setSuccessMessage(RECORD_SUCCESS_MESSAGES.FILES_UPLOADED);
            clearMessage(setSuccessMessage);

            // Clear selected files and progress after delay
            setTimeout(() => {
                setSelectedFiles([]);
                setUploadProgress([]);
            }, 2000);

        } catch (error) {
            console.error('Upload error:', error);
            
            // Update progress to show errors
            setUploadProgress(prev => 
                prev.map(item => ({
                    ...item,
                    status: 'error'
                }))
            );

            setUploadErrors([{
                file: 'general',
                errors: [error.message || RECORD_ERROR_MESSAGES.UPLOAD_FAILED]
            }]);
            clearMessage(setUploadErrors, 5000);
        }
    };

    // File input change handler
    const handleFileInputChange = (e) => {
        handleFileSelection(e.target.files);
        // Reset input value to allow re-selecting same files
        e.target.value = '';
    };

    // Drag and drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set dragOver to false if leaving the drop zone entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        
        const droppedFiles = e.dataTransfer.files;
        handleFileSelection(droppedFiles);
    };

    // File deletion handler
    const handleDeleteFile = async (fileId, fileName) => {
        if (!window.confirm(`Vai tiešām vēlaties dzēst failu "${fileName}"?`)) {
            return;
        }

        try {
            await deleteFileMutation.mutateAsync({
                projectId,
                fileId,
                recordId
            });

            setSuccessMessage(RECORD_SUCCESS_MESSAGES.FILE_DELETED);
            clearMessage(setSuccessMessage);

        } catch (error) {
            console.error('Delete error:', error);
            setUploadErrors([{
                file: fileName,
                errors: [error.message || 'Neizdevās dzēst failu']
            }]);
            clearMessage(setUploadErrors, 5000);
        }
    };

    // Open file browser
    const openFileBrowser = () => {
        fileInputRef.current?.click();
    };

    // Render upload area
    const renderUploadArea = () => (
        <div 
            className={`file-upload-area ${isDragOver ? 'drag-over' : ''} ${uploadFilesMutation.isPending ? 'uploading' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={openFileBrowser}
        >
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                accept={getAcceptedTypes()}
                style={{ display: 'none' }}
                disabled={uploadFilesMutation.isPending}
            />
            
            <div className="upload-content">
                <div className="upload-icon">
                    {uploadFilesMutation.isPending ? (
                        <div className="spinner"></div>
                    ) : (
                        '📁'
                    )}
                </div>
                <h4>{RECORD_UI.DRAG_DROP_FILES}</h4>
                <p>vai noklikšķiniet, lai izvēlētos</p>
                <div className="file-types-hint">
                    Atbalstītie formāti: {getAcceptedTypesText()}
                </div>
            </div>
        </div>
    );

    // Render file progress
    const renderUploadProgress = () => {
        if (uploadProgress.length === 0) return null;

        return (
            <div className="upload-progress-section">
                <h4>Augšupielāde...</h4>
                {uploadProgress.map(item => (
                    <div key={item.id} className={`progress-item ${item.status}`}>
                        <div className="progress-info">
                            <span className="file-name">{item.name}</span>
                            <span className="progress-status">
                                {item.status === 'completed' ? '✓' : 
                                 item.status === 'error' ? '✗' : 
                                 `${item.progress}%`}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${item.progress}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Render error messages
    const renderErrors = () => {
        const allErrors = [...fileErrors, ...uploadErrors];
        if (allErrors.length === 0) return null;

        return (
            <div className="file-errors">
                <h4>⚠️ Failu kļūdas:</h4>
                {allErrors.map((error, index) => (
                    <div key={index} className="file-error">
                        <strong>{error.file === 'general' ? 'Vispārēja kļūda' : error.file}:</strong>
                        <ul>
                            {error.errors.map((msg, msgIndex) => (
                                <li key={msgIndex}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    // Render existing files
    const renderFileList = () => {
        if (files.length === 0) {
            return (
                <div className="no-files">
                    <div className="no-files-icon">📎</div>
                    <h4>Nav pievienotu failu</h4>
                    <p>Pievienojiet failus, izmantojot augšupielādes zonu augšā</p>
                </div>
            );
        }

        return (
            <div className="files-list">
                <h4>Pievienotie faili ({files.length})</h4>
                <div className="files-grid">
                    {files.map(file => (
                        <div key={file.id} className="file-item">
                            <div className="file-icon" style={{ color: getFileTypeColor(file.extension) }}>
                                {getFileIcon(file.extension)}
                            </div>
                            <div className="file-info">
                                <div className="file-name" title={file.original_name}>
                                    {file.original_name}
                                </div>
                                <div className="file-meta">
                                    <span className="file-size">{formatFileSize(file.size)}</span>
                                    <span className="file-type">{file.extension?.toUpperCase()}</span>
                                </div>
                                {file.checksum && (
                                    <div className="file-checksum" title={`Kontrolsumma: ${file.checksum}`}>
                                        🔒 Verificēts
                                    </div>
                                )}
                            </div>
                            <div className="file-actions">
                                <button
                                    onClick={() => handleDownloadFile(file)}
                                    className="action-btn download-btn"
                                    title="Lejupielādēt failu"
                                >
                                    ⬇️
                                </button>
                                <button
                                    onClick={() => handleDeleteFile(file.id, file.original_name)}
                                    className="action-btn delete-btn"
                                    title="Dzēst failu"
                                    disabled={deleteFileMutation.isPending}
                                >
                                    {deleteFileMutation.isPending ? '⏳' : '🗑️'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // File download handler (placeholder - would need backend support)
    const handleDownloadFile = (file) => {
        // This would typically create a download link to the backend
        console.log('Download file:', file);
        // Could implement with: window.open(`/api/files/${file.id}/download`);
    };

    // Get accepted file types for input
    const getAcceptedTypes = () => {
        const typeMap = {
            'Foto': '.jpg,.jpeg,.png,.tiff,.bmp,.gif',
            'Video': '.mp4,.avi,.mov,.wmv,.mkv,.flv',
            'Skaņas': '.mp3,.wav,.flac,.aac,.ogg,.m4a',
            'Tekstuāls': '.pdf,.doc,.docx,.txt,.rtf',
            'Datubāze': '.sql,.json,.csv,.xlsx,.xls'
        };
        return typeMap[inventoryType] || '*';
    };

    // Get human-readable accepted types text
    const getAcceptedTypesText = () => {
        const typeMap = {
            'Foto': 'JPEG, PNG, TIFF, BMP, GIF',
            'Video': 'MP4, AVI, MOV, WMV, MKV, FLV',
            'Skaņas': 'MP3, WAV, FLAC, AAC, OGG, M4A',
            'Tekstuāls': 'PDF, DOC, DOCX, TXT, RTF',
            'Datubāze': 'SQL, JSON, CSV, Excel'
        };
        return typeMap[inventoryType] || 'Visi failu tipi';
    };

    return (
        <div className="record-files">
            {/* Success Message */}
            {successMessage && (
                <div className="success-banner">
                    <div className="success-icon">✓</div>
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Error Messages */}
            {renderErrors()}

            {/* Upload Progress */}
            {renderUploadProgress()}

            {/* File Upload Area */}
            {renderUploadArea()}

            {/* Existing Files List */}
            {renderFileList()}
        </div>
    );
};

export default RecordFiles;