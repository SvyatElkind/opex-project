import React from "react";
import ReactDOM from "react-dom";
import { RECORD_DELETE_UI } from '../Constants/Constants';
import HelpButton from '../Help/HelpButton';
import './RecordDeletePopup.css';

/**
 * RecordDeletePopup - Delete confirmation popup for records
 *
 * Props:
 * - isOpen: boolean - Controls popup visibility
 * - onConfirm: function - Called when delete is confirmed
 * - onCancel: function - Called when delete is cancelled
 * - records: array - Array of records to be deleted (for single record, pass array with one record)
 * - inventory: object - The inventory containing the records (optional, for help context)
 */
const RecordDeletePopup = ({
    isOpen,
    onConfirm,
    onCancel,
    records = [],
    inventory = null
}) => {
    if (!isOpen || records.length === 0) return null;

    const isSingleRecord = records.length === 1;
    const singleRecord = isSingleRecord ? records[0] : null;

    // Calculate total files across all records
    const totalFiles = records.reduce((sum, record) => {
        const fileCount = record.files ? record.files.length : 0;
        return sum + fileCount;
    }, 0);

    // Get file count for single record
    const getSingleRecordFileCount = (record) => {
        return record.files ? record.files.length : 0;
    };

    // Format file count text with proper Latvian grammar
    const formatFileCount = (count) => {
        if (count === 0) return RECORD_DELETE_UI.POPUP_NO_FILES;
        if (count === 1) return `1 ${RECORD_DELETE_UI.POPUP_FILE_LABEL}`;
        if (count > 1 && count < 10) return `${count} ${RECORD_DELETE_UI.POPUP_FILES_LABEL}`;
        return `${count} ${RECORD_DELETE_UI.POPUP_FILES_LABEL_MULTI}`;
    };

    // Get record identifier for display
    const getRecordIdentifier = (record) => {
        return record.title || record.reg_nr || `Ieraksts #${record.id}`;
    };

    const handleConfirm = () => {
        onConfirm();
    };

    const handleCancel = () => {
        onCancel();
    };

    // Render the modal using React Portal
    return ReactDOM.createPortal(
        <div className="record-delete-overlay">
            <div className="record-delete-modal">
                {/* Header */}
                <div className="record-delete-header">
                    <h2 className="record-delete-title">
                        {isSingleRecord
                            ? RECORD_DELETE_UI.POPUP_TITLE_SINGLE
                            : RECORD_DELETE_UI.POPUP_TITLE_MULTI}
                    </h2>
                    <HelpButton chapterId="records" iconOnly={true} className="record-delete-help-btn" />
                </div>

                {/* Content */}
                <div className="record-delete-content">
                    {/* Warning Message */}
                    <div className="record-delete-warning">
                        <p
                            className="record-delete-warning-text"
                            dangerouslySetInnerHTML={{ __html: RECORD_DELETE_UI.POPUP_WARNING_TEXT }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="record-delete-actions">
                    <button
                        className="record-delete-btn record-delete-btn-cancel"
                        onClick={handleCancel}
                    >
                        {RECORD_DELETE_UI.CANCEL}
                    </button>
                    <button
                        className="record-delete-btn record-delete-btn-delete"
                        onClick={handleConfirm}
                    >
                        <i className="fas fa-trash"></i>
                        {RECORD_DELETE_UI.CONFIRM}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RecordDeletePopup;
