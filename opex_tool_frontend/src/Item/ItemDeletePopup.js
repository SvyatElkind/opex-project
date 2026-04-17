import React from "react";
import ReactDOM from "react-dom";
import { ITEM_DELETE_UI } from '../Constants/Constants';
import HelpButton from '../Help/HelpButton';
import './ItemDeletePopup.css';

/**
 * ItemDeletePopup - Delete confirmation popup for items and records
 *
 * Props:
 * - isOpen: boolean - Controls popup visibility
 * - onConfirm: function - Called when delete is confirmed
 * - onCancel: function - Called when delete is cancelled
 * - items: array - Array of items to be deleted (for single item, pass array with one item)
 * - inventory: object - The inventory containing the items (optional, for help context)
 */
const ItemDeletePopup = ({
    isOpen,
    onConfirm,
    onCancel,
    items = [],
    inventory = null
}) => {
    if (!isOpen || items.length === 0) return null;

    const isSingleItem = items.length === 1;
    const singleItem = isSingleItem ? items[0] : null;

    // Calculate total records across all items
    const totalRecords = items.reduce((sum, item) => {
        const recordCount = item.records ? item.records.length : 0;
        const photoRecords = item.photo_records ? item.photo_records.length : 0;
        const videoRecords = item.video_records ? item.video_records.length : 0;
        const audioRecords = item.audio_records ? item.audio_records.length : 0;
        return sum + recordCount + photoRecords + videoRecords + audioRecords;
    }, 0);

    // Get record count for single item
    const getSingleItemRecordCount = (item) => {
        const recordCount = item.records ? item.records.length : 0;
        const photoRecords = item.photo_records ? item.photo_records.length : 0;
        const videoRecords = item.video_records ? item.video_records.length : 0;
        const audioRecords = item.audio_records ? item.audio_records.length : 0;
        return recordCount + photoRecords + videoRecords + audioRecords;
    };

    // Format record count text with proper Latvian grammar
    const formatRecordCount = (count) => {
        if (count === 0) return ITEM_DELETE_UI.POPUP_NO_RECORDS;
        if (count === 1) return `1 ${ITEM_DELETE_UI.POPUP_RECORD_LABEL}`;
        if (count > 1 && count < 10) return `${count} ${ITEM_DELETE_UI.POPUP_RECORDS_LABEL}`;
        return `${count} ${ITEM_DELETE_UI.POPUP_RECORDS_LABEL_MULTI}`;
    };

    const handleConfirm = () => {
        onConfirm();
    };

    const handleCancel = () => {
        onCancel();
    };

    // Render the modal using React Portal
    return ReactDOM.createPortal(
        <div className="item-delete-overlay">
            <div className="item-delete-modal">
                {/* Header */}
                <div className="item-delete-header">
                    <h2 className="item-delete-title">
                        {isSingleItem
                            ? ITEM_DELETE_UI.POPUP_TITLE_SINGLE
                            : ITEM_DELETE_UI.POPUP_TITLE_MULTI}
                    </h2>
                    <HelpButton chapterId="items" iconOnly={true} className="item-delete-help-btn" />
                </div>

                {/* Content */}
                <div className="item-delete-content">
                    {/* Warning Message */}
                    <div className="item-delete-warning">
                        <p className="item-delete-warning-text">
                            {ITEM_DELETE_UI.POPUP_WARNING_TEXT}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="item-delete-actions">
                    <button
                        className="item-delete-btn item-delete-btn-cancel"
                        onClick={handleCancel}
                    >
                        {ITEM_DELETE_UI.CANCEL}
                    </button>
                    <button
                        className="item-delete-btn item-delete-btn-delete"
                        onClick={handleConfirm}
                    >
                        <i className="fas fa-trash"></i>
                        {ITEM_DELETE_UI.CONFIRM}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ItemDeletePopup;
