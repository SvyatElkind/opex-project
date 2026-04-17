// src/Record/RecordFiles.js
// Modern file management with table/card views and detail panel
// Side panel slides in from the right, pushing content aside using flexbox layout
// View mode controlled by parent, Add File buttons contextual to view mode

import React, { useState, useRef } from 'react';
import { useUploadFiles, useDeleteFile } from '../hooks/useFiles';
import { useNotification } from '../components/Notification';
import ValidationIndicator from '../components/ValidationIndicator';
import InheritanceUtils from '../Utils/InheritanceUtils';
import FileDeletePopup from './FileDeletePopup';
import { getUploadIcon } from '../Constants/iconConstants';
import './RecordFiles.css';

const RecordFiles = ({
    recordId,
    projectId,
    files = [],
    canUpload = true,
    viewMode = 'table',
    onFileOperationStart = null,
    onFileOperationComplete = null,
    category = 'ELECTRONIC_DOCUMENTS',
    inventoryType = 'Tekstuāls'
}) => {
    const uploadFilesMutation = useUploadFiles();
    const deleteFileMutation = useDeleteFile();
    const { notify } = useNotification();
    const fileInputRef = useRef(null);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [selectedFile, setSelectedFile] = useState(null); // For side panel
    const [sidePanelOpen, setSidePanelOpen] = useState(false);
    const [deletePopupOpen, setDeletePopupOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [selectedFileIds, setSelectedFileIds] = useState(new Set()); // For multi-select
    const [filesToDelete, setFilesToDelete] = useState([]); // For batch delete

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('lv-LV', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get file icon based on extension
    const getFileIcon = (filename) => {
        const ext = filename?.split('.').pop()?.toLowerCase();
        const iconMap = {
            pdf: 'fa-file-pdf',
            doc: 'fa-file-word',
            docx: 'fa-file-word',
            xls: 'fa-file-excel',
            xlsx: 'fa-file-excel',
            ppt: 'fa-file-powerpoint',
            pptx: 'fa-file-powerpoint',
            txt: 'fa-file-alt',
            jpg: 'fa-file-image',
            jpeg: 'fa-file-image',
            png: 'fa-file-image',
            gif: 'fa-file-image',
            zip: 'fa-file-archive',
            rar: 'fa-file-archive',
            '7z': 'fa-file-archive',
            'edoc': 'fa-file-archive'
        };
        return iconMap[ext] || 'fa-file';
    };

    // Check if this is a media type (photo, video, audio)
    const isMediaType = ['Foto', 'Video', 'Skaņas'].includes(inventoryType);

    // Get terminology based on inventory type
    const getDocumentTerm = () => {
        if (inventoryType === 'Foto') return 'foto dokumentu';
        if (inventoryType === 'Video') return 'video dokumentu';
        if (inventoryType === 'Skaņas') return 'audio dokumentu';
        return 'failus';
    };

    const getDataFileTerm = (plural = false) => {
        if (isMediaType) {
            return plural ? 'datu failus' : 'datu failu';
        }
        return plural ? 'failus' : 'failu';
    };

    // Get file icon color based on extension
    const getFileIconColor = (filename) => {
        const ext = filename?.split('.').pop()?.toLowerCase();
        const colorMap = {
            pdf: 'var(--color-error)',
            doc: 'var(--color-secondary)',
            docx: 'var(--color-secondary)',
            xls: 'var(--color-primary)',
            xlsx: 'var(--color-primary)',
            ppt: 'var(--color-warning)',
            pptx: 'var(--color-warning)',
            txt: 'var(--text-muted)',
            jpg: 'var(--color-tertiary, #8b5cf6)',
            jpeg: 'var(--color-tertiary, #8b5cf6)',
            png: 'var(--color-tertiary, #8b5cf6)',
            gif: 'var(--color-tertiary, #8b5cf6)',
            zip: 'var(--color-warning-dark, #eab308)',
            rar: 'var(--color-warning-dark, #eab308)',
            '7z': 'var(--color-warning-dark, #eab308)',
            'edoc': 'var(--color-secondary-light, #2796f1)'
        };
        return colorMap[ext] || 'var(--text-muted)';
    };

    // Handle file selection from input
    const handleFileSelect = (event) => {
        const newFiles = Array.from(event.target.files);
        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setSelectedFiles(prev => [...prev, ...droppedFiles]);
    };

    // Remove file from selection
    const handleRemoveFromSelection = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Upload files
    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        // Notify parent that file operation is starting
        if (onFileOperationStart) {
            onFileOperationStart();
        }

        try {
            await uploadFilesMutation.mutateAsync({
                projectId,
                recordId,
                files: selectedFiles,
                onProgress: (progress) => {
                    setUploadProgress(progress);
                }
            });

            setSelectedFiles([]);
            setUploadProgress({});

            // Notify parent that file operation is complete
            if (onFileOperationComplete) {
                onFileOperationComplete();
            }
        } catch (error) {
            notify.error(`Kļūda augšupielādējot ${isMediaType ? 'datu failus' : 'failus'}: ` + error.message);
        }
    };

    // Open delete confirmation popup
    const handleDeleteClick = (file) => {
        setFileToDelete(file);
        setDeletePopupOpen(true);
    };

    // Cancel delete
    const handleDeleteCancel = () => {
        setDeletePopupOpen(false);
        setFileToDelete(null);
        setFilesToDelete([]);
    };

    // Confirm and execute delete (handles both single and batch)
    const handleDeleteConfirm = async () => {
        // Handle batch delete
        if (filesToDelete.length > 0) {
            await handleBatchDeleteConfirm();
            return;
        }

        // Handle single file delete
        if (!fileToDelete) return;

        // Notify parent that file operation is starting
        if (onFileOperationStart) {
            onFileOperationStart();
        }

        try {
            await deleteFileMutation.mutateAsync({
                projectId,
                fileId: fileToDelete.id
            });

            // Close side panel if deleted file was selected
            if (selectedFile?.id === fileToDelete.id) {
                setSidePanelOpen(false);
                setSelectedFile(null);
            }

            // Close delete popup
            setDeletePopupOpen(false);
            setFileToDelete(null);

            // Notify parent that file operation is complete
            if (onFileOperationComplete) {
                onFileOperationComplete();
            }
        } catch (error) {
            notify.error(`Kļūda dzēšot ${isMediaType ? 'datu failu' : 'failu'}: ` + error.message);
            // Close popup on error too
            setDeletePopupOpen(false);
            setFileToDelete(null);
        }
    };

    // Download file
    const handleDownload = (file) => {
        const downloadUrl = `/api/v1/project/${projectId}/file/${file.id}/download/`;
        window.open(downloadUrl, '_blank');
    };

    // Open file details in side panel
    const handleFileClick = (file) => {
        setSelectedFile(file);
        setSidePanelOpen(true);
    };

    // Close side panel
    const closeSidePanel = () => {
        setSidePanelOpen(false);
        setTimeout(() => {
            setSelectedFile(null);
        }, 300);
    };

    // Open file picker dialog
    const triggerFilePicker = () => {
        fileInputRef.current?.click();
    };

    // Handle file selection for multi-select
    const handleFileSelect2 = (fileId, checked) => {
        setSelectedFileIds(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(fileId);
            } else {
                newSet.delete(fileId);
            }
            return newSet;
        });
    };

    // Handle select all
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedFileIds(new Set(files.map(f => f.id)));
        } else {
            setSelectedFileIds(new Set());
        }
    };

    // Handle batch delete
    const handleBatchDelete = () => {
        if (selectedFileIds.size === 0) return;
        const filesToDeleteArray = files.filter(f => selectedFileIds.has(f.id));
        setFilesToDelete(filesToDeleteArray);
        setDeletePopupOpen(true);
    };

    // Confirm batch delete
    const handleBatchDeleteConfirm = async () => {
        if (filesToDelete.length === 0) return;

        if (onFileOperationStart) {
            onFileOperationStart();
        }

        try {
            for (const file of filesToDelete) {
                await deleteFileMutation.mutateAsync({
                    projectId,
                    fileId: file.id
                });
            }

            setSelectedFileIds(new Set());
            setFilesToDelete([]);
            setDeletePopupOpen(false);

            if (onFileOperationComplete) {
                onFileOperationComplete();
            }
        } catch (error) {
            notify.error(`Kļūda dzēšot failus: ` + error.message);
            setDeletePopupOpen(false);
            setFilesToDelete([]);
        }
    };

    const hasFiles = files && files.length > 0;
    const isUploading = uploadFilesMutation.isPending;
    const isDeleting = deleteFileMutation.isPending;

    return (
        <div className="record-files-wrapper">
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            <div className="record-files-main">
                {/* Dropzone - Only shown when no files exist yet */}
                {canUpload && files.length === 0 && selectedFiles.length === 0 && (
                    <div className="files-upload-section">
                        <div
                            className={`files-dropzone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={triggerFilePicker}
                        >
                            <i className={`fas ${getUploadIcon(inventoryType)} files-dropzone-icon`}></i>
                            <p className="files-dropzone-text">
                                Ievelciet {getDataFileTerm(true)} šeit vai{' '}
                                <span className="files-dropzone-link">pārlūkojiet</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Files List Section - Show when has files OR has pending files */}
                {(hasFiles || selectedFiles.length > 0) && (
                    <div className="files-list-section">
                        {/* Pending Files Upload Bar - Shows when there are files to upload */}
                        {selectedFiles.length > 0 && (
                            <div className="files-pending-bar">
                                <div className="files-pending-info">
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    <span>{selectedFiles.length} {selectedFiles.length === 1 ? 'fails' : 'faili'} gatavi augšupielādei</span>
                                </div>
                                <div className="files-pending-actions">
                                    <button
                                        onClick={() => setSelectedFiles([])}
                                        className="files-pending-btn files-pending-btn-clear"
                                        disabled={isUploading}
                                    >
                                        Noņemt izvēlētās datnes
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        className="files-pending-btn files-pending-btn-upload"
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i>
                                                Augšupielādē...
                                            </>
                                        ) : (
                                            'Augšupielādēt'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Table View - Grid-based like RecordsList */}
                        {viewMode === 'table' && (
                            <div
                                className={`files-table-wrapper ${isDragging ? 'dragging' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {/* Drag overlay */}
                                {isDragging && (
                                    <div className="files-table-drag-overlay">
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        <span>Atlaidiet failus šeit</span>
                                    </div>
                                )}

                                <div className="files-table-container">
                                    {/* Table Header */}
                                    <div className="files-table-header">
                                        <div className="files-header-cell files-select-cell">
                                            <input
                                                type="checkbox"
                                                checked={selectedFileIds.size === files.length && files.length > 0}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                        </div>
                                        <div className="files-header-cell files-validation-cell">
                                            <i className="fas fa-check-circle" title="Validācija"></i>
                                        </div>
                                        <div className="files-header-cell">Nosaukums</div>
                                        <div className="files-header-cell files-type-cell">Tips</div>
                                        <div className="files-header-cell files-size-cell">Izmērs</div>

                                        {/* ACTION COLUMN HEADERS */}
                                        <div className="files-header-cell files-action-header">
                                            {canUpload && (
                                                <button
                                                    onClick={triggerFilePicker}
                                                    className="files-header-btn files-header-btn-create"
                                                    title="Pievienot failu"
                                                >
                                                    <i className="fas fa-plus-circle"></i>
                                                </button>
                                            )}
                                        </div>
                                        <div className="files-header-cell files-action-header">
                                            <button
                                                className={`files-header-btn files-header-btn-delete ${selectedFileIds.size > 0 ? 'active' : ''}`}
                                                onClick={handleBatchDelete}
                                                disabled={selectedFileIds.size === 0}
                                                title={selectedFileIds.size > 0 ? `Dzēst ${selectedFileIds.size} failus` : 'Izvēlieties failus lai dzēstu'}
                                            >
                                                <i className="fas fa-trash"></i>
                                                {selectedFileIds.size > 0 && <span className="files-header-badge">{selectedFileIds.size}</span>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table Body */}
                                    <div className="files-table-body">
                                        {/* Pending Files - Show as special rows at the top */}
                                        {selectedFiles.map((file, index) => (
                                            <div
                                                key={`pending-${index}`}
                                                className="files-table-row files-table-row-pending"
                                            >
                                                <div className="files-body-cell files-select-cell">
                                                    <div className="files-pending-indicator">
                                                        <i className="fas fa-clock"></i>
                                                    </div>
                                                </div>
                                                <div className="files-body-cell files-validation-cell">
                                                    <span className="files-pending-badge">Jauns</span>
                                                </div>
                                                <div className="files-body-cell files-name-cell">
                                                    <i
                                                        className={`fas ${getFileIcon(file.name)}`}
                                                        style={{ color: getFileIconColor(file.name) }}
                                                    ></i>
                                                    <span>{file.name}</span>
                                                </div>
                                                <div className="files-body-cell files-type-cell">
                                                    {file.name.split('.').pop() && (
                                                        <span className="file-type-badge file-type-badge-pending">
                                                            {file.name.split('.').pop().toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="files-body-cell files-size-cell">{formatFileSize(file.size)}</div>

                                                {/* ACTION COLUMNS for pending files */}
                                                <div className="files-body-cell files-action-cell">
                                                    {/* Empty */}
                                                </div>
                                                <div className="files-body-cell files-action-cell">
                                                    <button
                                                        onClick={() => handleRemoveFromSelection(index)}
                                                        className="files-action-icon files-icon-remove"
                                                        disabled={isUploading}
                                                        title="Noņemt"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Existing Files */}
                                        {files.map(file => {
                                            const isSelected = selectedFileIds.has(file.id);
                                            return (
                                                <div
                                                    key={file.id}
                                                    className={`files-table-row ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => handleFileClick(file)}
                                                >
                                                    <div className="files-body-cell files-select-cell" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => handleFileSelect2(file.id, e.target.checked)}
                                                        />
                                                    </div>
                                                    <div className="files-body-cell files-validation-cell">
                                                        <ValidationIndicator
                                                            validation={InheritanceUtils.validateFile(file, category, inventoryType)}
                                                            size="small"
                                                            showTooltip={false}
                                                            clickable={true}
                                                            position="left"
                                                        />
                                                    </div>
                                                    <div className="files-body-cell files-name-cell">
                                                        <i
                                                            className={`fas ${getFileIcon(file.original_name)}`}
                                                            style={{ color: getFileIconColor(file.original_name) }}
                                                        ></i>
                                                        <span>{file.original_name}</span>
                                                    </div>
                                                    <div className="files-body-cell files-type-cell">
                                                        {file.extension && (
                                                            <span className="file-type-badge">{file.extension}</span>
                                                        )}
                                                    </div>
                                                    <div className="files-body-cell files-size-cell">{formatFileSize(file.size)}</div>

                                                    {/* ACTION COLUMNS */}
                                                    <div className="files-body-cell files-action-cell">
                                                        {/* Empty - add button is in header */}
                                                    </div>
                                                    <div className="files-body-cell files-action-cell" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => handleDeleteClick(file)}
                                                            className="files-action-icon files-icon-delete"
                                                            disabled={isDeleting}
                                                            title="Dzēst"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Card View */}
                        {viewMode === 'card' && (
                            <div
                                className={`files-card-grid ${isDragging ? 'dragging' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {/* Drag overlay for card view */}
                                {isDragging && (
                                    <div className="files-card-drag-overlay">
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        <span>Atlaidiet failus šeit</span>
                                    </div>
                                )}

                                {/* Add File Card - FIRST - only shown when canUpload */}
                                {canUpload && (
                                    <div
                                        className="files-card files-card-add"
                                        onClick={triggerFilePicker}
                                    >
                                        <div className="files-card-add-icon">
                                            <i className="fas fa-plus"></i>
                                        </div>
                                        <div className="files-card-add-text">
                                            <h4>Pievienot {isMediaType ? getDocumentTerm() : 'failus'}</h4>
                                            <p>Noklikšķiniet, lai izvēlētos {getDataFileTerm(true)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Pending Files as Cards */}
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={`pending-${index}`}
                                        className="files-card files-card-pending"
                                    >
                                        <div
                                            className="files-card-icon files-card-icon-pending"
                                            style={{
                                                backgroundColor: `${getFileIconColor(file.name)}15`
                                            }}
                                        >
                                            <i
                                                className={`fas ${getFileIcon(file.name)}`}
                                                style={{ color: getFileIconColor(file.name) }}
                                            ></i>
                                            <span className="files-card-pending-badge">Jauns</span>
                                        </div>
                                        <div className="files-card-info">
                                            <h4 className="files-card-name">{file.name}</h4>
                                            <div className="files-card-meta">
                                                <span className="files-card-size">{formatFileSize(file.size)}</span>
                                                {file.name.split('.').pop() && (
                                                    <span className="files-card-ext files-card-ext-pending">
                                                        {file.name.split('.').pop().toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="files-card-actions">
                                            <button
                                                onClick={() => handleRemoveFromSelection(index)}
                                                className="files-card-btn files-card-btn-remove"
                                                disabled={isUploading}
                                                title="Noņemt"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Existing Files */}
                                {files.map(file => (
                                    <div
                                        key={file.id}
                                        className="files-card"
                                        onClick={() => handleFileClick(file)}
                                    >
                                        <div
                                            className="files-card-icon"
                                            style={{
                                                backgroundColor: `${getFileIconColor(file.original_name)}15`
                                            }}
                                        >
                                            <i
                                                className={`fas ${getFileIcon(file.original_name)}`}
                                                style={{ color: getFileIconColor(file.original_name) }}
                                            ></i>
                                        </div>
                                        <div className="files-card-info">
                                            <h4 className="files-card-name">{file.original_name}</h4>
                                            <div className="files-card-meta">
                                                <span className="files-card-size">{formatFileSize(file.size)}</span>
                                                {file.extension && (
                                                    <span className="files-card-ext">{file.extension}</span>
                                                )}
                                                <ValidationIndicator
                                                    validation={InheritanceUtils.validateFile(file, category, inventoryType)}
                                                    size="small"
                                                    showTooltip={false}
                                                    clickable={true}
                                                    position="top"
                                                />
                                            </div>
                                        </div>
                                        <div className="files-card-actions" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleDeleteClick(file)}
                                                className="files-card-btn files-card-btn-delete"
                                                disabled={isDeleting}
                                                title="Dzēst"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!hasFiles && !canUpload && (
                    <div className="files-empty">
                        <i className={`fas ${getUploadIcon(inventoryType)} files-empty-icon`}></i>
                        <p>Nav pievienots {isMediaType ? getDocumentTerm() : 'failu'}</p>
                    </div>
                )}
            </div>

            {/* Side Panel for File Details - Slides in from right, pushing content */}
            <div className={`files-side-panel ${sidePanelOpen ? 'open' : ''}`}>
                {selectedFile && (
                    <>
                        <div className="side-panel-header">
                            <h3>Datnes info</h3>
                            <button
                                className="side-panel-close"
                                onClick={closeSidePanel}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="side-panel-content">

                            {/* File Details */}
                            <div className="side-panel-details">
                                <div className="side-panel-detail-item">
                                    <label>Nosaukums</label>
                                    <p className="detail-value-name">{selectedFile.original_name}</p>
                                </div>

                                {selectedFile.extension && (
                                    <div className="side-panel-detail-item">
                                        <label>Tips</label>
                                        <p>
                                            <span className="file-type-badge">{selectedFile.extension}</span>
                                        </p>
                                    </div>
                                )}

                                <div className="side-panel-detail-item">
                                    <label>Izmērs</label>
                                    <p>{formatFileSize(selectedFile.size)}</p>
                                </div>

                                {selectedFile.checksum && (
                                    <div className="side-panel-detail-item">
                                        <label>SHA-256 Checksum</label>
                                        <p className="detail-value-checksum">
                                            <i className="fas fa-fingerprint"></i>
                                            {selectedFile.checksum}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="side-panel-actions">
                                <button
                                    onClick={() => handleDeleteClick(selectedFile)}
                                    className="btn-files btn-files-delete-full"
                                    disabled={isDeleting}
                                >
                                    Dzēst datni
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* File Delete Confirmation Popup */}
            <FileDeletePopup
                isOpen={deletePopupOpen}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                file={fileToDelete}
                files={filesToDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default RecordFiles;