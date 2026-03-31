import React from 'react';
import ReactDOM from 'react-dom';
import './ItemNotFoundPopup.css';

/**
 * ItemNotFoundPopup - Warning popup shown when user tries to jump to an item
 * that doesn't exist in the current inventory
 *
 * Props:
 * - isOpen: boolean - Controls popup visibility
 * - onClose: function - Called when user clicks continue button
 * - itemNumber: string/number - The item number that was not found
 * - inventoryNumber: string/number - The inventory number
 */
const ItemNotFoundPopup = ({
    isOpen,
    onClose,
    itemNumber = '',
    inventoryNumber = ''
}) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="item-not-found-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="item-not-found-modal">
                {/* Header */}
                <div className="item-not-found-header">
                    <h2 className="item-not-found-title">
                        Glabājamā vienība neeksistē
                    </h2>
                </div>

                {/* Content */}
                <div className="item-not-found-content">
                    <div className="item-not-found-message">
                        <p className="item-not-found-message-text">
                            Glabājamā vienība {itemNumber} uzskaites sarakstā {inventoryNumber} neeksistē.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="item-not-found-actions">
                    <button
                        className="item-not-found-btn item-not-found-btn-confirm"
                        onClick={onClose}
                    >
                        Turpināt
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ItemNotFoundPopup;
