import React from "react";
import ReactDOM from "react-dom";
import './FileDeletePopup.css';

/**
 * FileDeletePopup - Simple delete confirmation popup for files
 *
 * Props:
 * - isOpen: boolean - Controls popup visibility
 * - onConfirm: function - Called when delete is confirmed
 * - onCancel: function - Called when delete is cancelled
 * - file: object - The file to be deleted (single delete)
 * - files: array - The files to be deleted (batch delete)
 * - isDeleting: boolean - Whether deletion is in progress
 */
const FileDeletePopup = ({
    isOpen,
    onConfirm,
    onCancel,
    file,
    files = [],
    isDeleting = false
}) => {
    // Handle both single and batch delete
    const isBatchDelete = files && files.length > 0;
    const hasContent = isBatchDelete || file;

    if (!isOpen || !hasContent) return null;

    const handleConfirm = () => {
        onConfirm();
    };

    const handleCancel = () => {
        onCancel();
    };

    // Handle overlay click to close
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !isDeleting) {
            onCancel();
        }
    };

    // Render the modal using React Portal
    return ReactDOM.createPortal(
        <div className="file-delete-overlay" onClick={handleOverlayClick}>
            <div className="file-delete-modal">
                {/* Header */}
                <div className="file-delete-header">
                    <i className="fas fa-exclamation-triangle file-delete-icon"></i>
                    <h2 className="file-delete-title">
                        {isBatchDelete ? `Dzēst ${files.length} failus?` : 'Dzēst failu?'}
                    </h2>
                </div>

                {/* Content */}
                <div className="file-delete-content">
                    {isBatchDelete ? (
                        <>
                            <p className="file-delete-message">
                                Vai tiešām vēlaties dzēst šos failus:
                            </p>
                            <div className="file-delete-list">
                                {files.slice(0, 5).map((f, index) => (
                                    <p key={index} className="file-delete-filename">
                                        <i className="fas fa-file"></i>
                                        {f.original_name}
                                    </p>
                                ))}
                                {files.length > 5 && (
                                    <p className="file-delete-more">
                                        ...un vēl {files.length - 5} faili
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="file-delete-message">
                                Vai tiešām vēlaties dzēst failu:
                            </p>
                            <p className="file-delete-filename">
                                <i className="fas fa-file"></i>
                                {file.original_name}
                            </p>
                        </>
                    )}
                    <p className="file-delete-warning">
                        Šī darbība ir neatgriezeniska.
                    </p>
                </div>

                {/* Actions */}
                <div className="file-delete-actions">
                    <button
                        className="file-delete-btn file-delete-btn-cancel"
                        onClick={handleCancel}
                        disabled={isDeleting}
                    >
                        Atcelt
                    </button>
                    <button
                        className="file-delete-btn file-delete-btn-delete"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Dzēš...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-trash"></i>
                                Dzēst {isBatchDelete ? `(${files.length})` : ''}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default FileDeletePopup;
