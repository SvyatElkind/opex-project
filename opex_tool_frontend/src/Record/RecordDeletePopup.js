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
 */
const RecordDeletePopup = ({
    isOpen,
    onConfirm,
    onCancel,
    records = [],
}) => {
    if (!isOpen || records.length === 0) return null;

    const isSingleRecord = records.length === 1;

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
                        <p className="record-delete-warning-text">
                            {RECORD_DELETE_UI.POPUP_WARNING_TEXT}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="record-delete-actions">
                    <button
                        className="record-delete-btn record-delete-btn-cancel"
                        onClick={onCancel}
                    >
                        {RECORD_DELETE_UI.CANCEL}
                    </button>
                    <button
                        className="record-delete-btn record-delete-btn-delete"
                        onClick={onConfirm}
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
