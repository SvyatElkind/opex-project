import React from 'react';
import ReactDOM from 'react-dom';
import { INVENTORY_PERIOD_REQUIRED_UI } from '../Constants/Constants';
import HelpButton from '../Help/HelpButton';
import './InventoryPeriodPopup.css';

/**
 * InventoryPeriodPopup - Informative popup shown when user tries to create an item
 * without setting the inventory period (start/end date)
 *
 * Props:
 * - isOpen: boolean - Controls popup visibility
 * - onConfirm: function - Called when user wants to add the period (opens edit dialog)
 * - onCancel: function - Called when user cancels
 * - inventoryNumber: string/number - The inventory number to display in the title
 */
const InventoryPeriodPopup = ({
    isOpen,
    onConfirm,
    onCancel,
    inventoryNumber = ''
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
    };

    const handleCancel = () => {
        onCancel();
    };

    // Handle overlay click (close on background click)
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    // Render the modal using React Portal
    return ReactDOM.createPortal(
        <div className="inventory-period-overlay" onClick={handleOverlayClick}>
            <div className="inventory-period-modal">
                {/* Header */}
                <div className="inventory-period-header">
                    <h2 className="inventory-period-title">
                        {INVENTORY_PERIOD_REQUIRED_UI.TITLE_PREFIX}
                    </h2>
                    <HelpButton chapterId="inventories" iconOnly={true} className="inventory-period-help-btn" />
                </div>

                {/* Content */}
                <div className="inventory-period-content">
                    <div className="inventory-period-message">
                        <p className="inventory-period-message-text">
                            {INVENTORY_PERIOD_REQUIRED_UI.CONTENT_TEXT}{' '}
                            <strong>{INVENTORY_PERIOD_REQUIRED_UI.CONTENT_STRONG}</strong>.{' '}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="inventory-period-actions">
                    <button
                        className="inventory-period-btn inventory-period-btn-cancel"
                        onClick={handleCancel}
                    >
                        {INVENTORY_PERIOD_REQUIRED_UI.CANCEL}
                    </button>
                    <button
                        className="inventory-period-btn inventory-period-btn-confirm"
                        onClick={handleConfirm}
                    >
                        {INVENTORY_PERIOD_REQUIRED_UI.CONFIRM}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default InventoryPeriodPopup;
