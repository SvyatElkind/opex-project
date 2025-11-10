// src/Record/RecordFiles.js
// Modern file management with table/card views and detail panel
// Side panel slides in from the right, pushing content aside using flexbox layout
// View mode controlled by parent, Add File buttons contextual to view mode

import React, { useState, useRef } from 'react';
import { useUploadFiles, useDeleteFile } from '../hooks/useFiles';
import './RecordFiles.css';

const RecordFiles = ({ recordId, projectId, files = [], canUpload = true, viewMode = 'table' }) => {
    const uploadFilesMutation = useUploadFiles();
    const deleteFileMutation = useDeleteFile();
    const fileInputRef = useRef(null);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [selectedFile, setSelectedFile] = useState(null); // For side panel
    const [sidePanelOpen, setSidePanelOpen] = useState(false);

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
            '7z': 'fa-file-archive'
        };
        return iconMap[ext] || 'fa-file';
    };

    // Get file icon color based on extension
    const getFileIconColor = (filename) => {
        const ext = filename?.split('.').pop()?.toLowerCase();
        const colorMap = {
            pdf: '#ef4444',
            doc: '#2563eb',
            docx: '#2563eb',
            xls: '#10b981',
            xlsx: '#10b981',
            ppt: '#f97316',
            pptx: '#f97316',
            txt: '#6b7280',
            jpg: '#8b5cf6',
            jpeg: '#8b5cf6',
            png: '#8b5cf6',
            gif: '#8b5cf6',
            zip: '#eab308',
            rar: '#eab308',
            '7z': '#eab308',
            'edoc': '#2796f1ff'
        };
        return colorMap[ext] || '#6b7280';
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
        } catch (error) {
            console.error('Upload error:', error);
            alert('Kļūda augšupielādējot failus: ' + error.message);
        }
    };

    // Delete file
    const handleDelete = async (file) => {
        if (!window.confirm(`Vai tiešām vēlaties dzēst failu "${file.original_name}"?`)) {
            return;
        }

        try {
            await deleteFileMutation.mutateAsync({
                projectId,
                fileId: file.id
            });
            
            // Close side panel if deleted file was selected
            if (selectedFile?.id === file.id) {
                setSidePanelOpen(false);
                setSelectedFile(null);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Kļūda dzēšot failu: ' + error.message);
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
        // Give time for animation before clearing
        setTimeout(() => {
            if (!sidePanelOpen) {
                setSelectedFile(null);
            }
        }, 300);
    };

    // Open file picker dialog
    const triggerFilePicker = () => {
        fileInputRef.current?.click();
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
                {/* Upload Section - Only shown if canUpload */}
                {!canUpload && (
                    <div className="files-upload-section">
                        {/* Dropzone */}
                        <div
                            className={`files-dropzone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={triggerFilePicker}
                        >
                            <i className="fas fa-cloud-upload-alt files-dropzone-icon"></i>
                            <p className="files-dropzone-text">
                                Ievelciet failus šeit vai{' '}
                                <span className="files-dropzone-link">pārlūkojiet</span>
                            </p>
                        </div>

                        {/* Selected Files Preview */}
                        {selectedFiles.length > 0 && (
                            <div className="files-selected">
                                <div className="files-selected-header">
                                    <h4>Izvēlētie faili ({selectedFiles.length})</h4>
                                    <button
                                        onClick={() => setSelectedFiles([])}
                                        className="btn-files btn-files-clear"
                                    >
                                        Notīrīt
                                    </button>
                                </div>

                                <div className="files-selected-list">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="files-selected-item">
                                            <div className="files-selected-info">
                                                <i 
                                                    className={`fas ${getFileIcon(file.name)}`}
                                                    style={{ color: getFileIconColor(file.name) }}
                                                ></i>
                                                <span className="files-selected-name">{file.name}</span>
                                                <span className="files-selected-size">{formatFileSize(file.size)}</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFromSelection(index)}
                                                className="files-selected-remove"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="btn-files btn-files-upload"
                                >
                                    {isUploading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Augšupielādē...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-upload"></i>
                                            Augšupielādēt failus
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Files List Section */}
                {hasFiles && (
                    <div className="files-list-section">
                        {/* Table View */}
                        {viewMode === 'table' && (
                            <div className="files-table-wrapper">

                                <div className="files-table-container">
                                    <table className="files-table">
                                        <thead>
                                            <tr>
                                                <th>Nosaukums</th>
                                                <th>Tips</th>
                                                <th>Izmērs</th>
                                                <th>Darbības</th>
                                                <button
                                                            onClick={triggerFilePicker}
                                                            className="btn-files-table-add"
                                                            title="Pievienot failus"
                                                        >
                                                            <i className="fas fa-plus"></i>
                                                            Pievienot failus
                                                </button>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {files.map(file => (
                                                <tr 
                                                    key={file.id} 
                                                    className="files-table-row"
                                                    onClick={() => handleFileClick(file)}
                                                >
                                                    <td className="files-table-name">
                                                        <i 
                                                            className={`fas ${getFileIcon(file.original_name)}`}
                                                            style={{ color: getFileIconColor(file.original_name) }}
                                                        ></i>
                                                        <span>{file.original_name}</span>
                                                    </td>
                                                    <td className="files-table-type">
                                                        {file.extension && (
                                                            <span className="file-type-badge">{file.extension}</span>
                                                        )}
                                                    </td>
                                                    <td className="files-table-size">{formatFileSize(file.size)}</td>

                                                    <td className="files-table-actions" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => handleDelete(file)}
                                                            className="files-table-btn files-table-btn-delete"
                                                            disabled={isDeleting}
                                                            title="Dzēst"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Card View */}
                        {viewMode === 'card' && (
                            <div className="files-card-grid">
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
                                            </div>
                                        </div>
                                        <div className="files-card-actions" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleDelete(file)}
                                                className="files-card-btn files-card-btn-delete"
                                                disabled={isDeleting}
                                                title="Dzēst"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Add File Card - only shown when canUpload */}
                                {canUpload && (
                                    <div 
                                        className="files-card files-card-add"
                                        onClick={triggerFilePicker}
                                    >
                                        <div className="files-card-add-icon">
                                            <i className="fas fa-plus"></i>
                                        </div>
                                        <div className="files-card-add-text">
                                            <h4>Pievienot failus</h4>
                                            <p>Noklikšķiniet, lai izvēlētos failus</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!hasFiles && !canUpload && (
                    <div className="files-empty">
                        <i className="fas fa-folder-open files-empty-icon"></i>
                        <p>Nav pievienotu failu</p>
                    </div>
                )}
            </div>

            {/* Side Panel for File Details - Slides in from right, pushing content */}
            <div className={`files-side-panel ${sidePanelOpen ? 'open' : ''}`}>
                {selectedFile && (
                    <>
                        <div className="side-panel-header">
                            <h3>Faila informācija</h3>
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
                                    onClick={() => handleDelete(selectedFile)}
                                    className="btn-files btn-files-delete-full"
                                    disabled={isDeleting}
                                >
                                    <i className="fas fa-trash"></i>
                                    Dzēst failu
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RecordFiles;