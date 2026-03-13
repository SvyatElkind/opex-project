import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { canDeleteInventory, getDeleteRestrictionMessage} from "../Constants/inventoryConstants";
import "./InventoryDelete.css";

const InventoryDelete = ({ onConfirm, onCancel, inventoryNumber, itemCount = 0, inventory = null }) => {
    // Check if inventory can be deleted
    const canDelete = inventory ? canDeleteInventory(inventory) : true;
    const restrictionMessage = inventory ? getDeleteRestrictionMessage(inventory) : null;
    const [isDeleting, setIsDeleting] = useState(false);
    const [countdown, setCountdown] = useState(3);

    // Use ref to track the latest callback without causing re-renders
    const onConfirmRef = useRef(onConfirm);
    const onCancelRef = useRef(onCancel);

    // Keep refs in sync
    useEffect(() => {
        onConfirmRef.current = onConfirm;
        onCancelRef.current = onCancel;
    }, [onConfirm, onCancel]);

    // Countdown timer effect
    useEffect(() => {
        if (!isDeleting) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            // Countdown finished, execute deletion using ref
            onConfirmRef.current();
        }
    }, [isDeleting, countdown]); // Removed onConfirm from deps

    const handleDeleteClick = () => {
        setIsDeleting(true);
    };

    const handleCancelClick = () => {
        if (isDeleting) {
            setIsDeleting(false);
            setCountdown(3);
        } else {
            onCancelRef.current();
        }
    };

    // Render the modal using React Portal
    return ReactDOM.createPortal(
        <div className="inventory-delete-overlay">
            <div className="inventory-delete-modal">
                {/* Header */}
                <div className="inventory-delete-header">
                    <h2 className="inventory-delete-title">
                        {isDeleting ? 'Dzēš uzskaites sarakstu...' : 'Dzēst uzskaites sarakstu?'}
                    </h2>
                </div>

                {/* Content */}
                <div className="inventory-delete-content">
                    {!canDelete ? (
                        <>
                            {/* Restriction Message */}
                            <div className="inventory-delete-restriction">
                                <div className="inventory-delete-restriction-icon">
                                    <i className="fas fa-lock"></i>
                                </div>
                                <p className="inventory-delete-restriction-text">
                                    {restrictionMessage}
                                </p>
                                <div className="inventory-delete-restriction-info">
                                    <i className="fas fa-info-circle"></i>
                                    <p>
                                        Uzskaites saraksti, kas izveidoti no VVAIS atskaites, nevar tikt dzēsti.
                                        Tie ir tikai lasāmi un ir daļa no importētās atskaites struktūras.
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : isDeleting ? (
                        <>
                            {/* Countdown Display */}
                            <div className="inventory-delete-countdown-wrapper">
                                <div className="inventory-delete-countdown-circle">
                                    <svg className="inventory-delete-countdown-svg" viewBox="0 0 100 100">
                                        <circle 
                                            className="inventory-delete-countdown-bg"
                                            cx="50" 
                                            cy="50" 
                                            r="45"
                                        />
                                        <circle 
                                            className="inventory-delete-countdown-progress"
                                            cx="50" 
                                            cy="50" 
                                            r="45"
                                            style={{
                                                strokeDashoffset: `${283 - (283 * (3 - countdown) / 3)}`
                                            }}
                                        />
                                    </svg>
                                    <span className="inventory-delete-countdown-number">
                                        {countdown}
                                    </span>
                                </div>
                                <p className="inventory-delete-countdown-text">
                                    Dzēš pēc {countdown} sekundēm...
                                </p>
                            </div>

                            {/* Processing Message */}
                            <div className="inventory-delete-processing">
                                <div className="inventory-delete-spinner"></div>
                                <p>Gatavo dzēšanu...</p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Warning Message */}
                            <div className="inventory-delete-warning">
                                <p className="inventory-delete-warning-text">
                                    Šī darbība ir <strong>neatgriezeniska</strong>. Dzēšot uzskaites sarakstu, tiks dzēsts uzskaites saraksts un tam pievienotā informācija:
                                </p>
                            </div>

                            {/* Inventory Details */}
                            {inventoryNumber && (
                                <div className="inventory-delete-details">
                                    <div className="inventory-delete-detail-item">
                                        <i className="fas fa-clipboard-list"></i>
                                        <span>{inventoryNumber}. uzskaites saraksts</span>
                                    </div>
                                    {itemCount > 0 && (
                                        <div className="inventory-delete-detail-item">
                                            <i className="fas fa-box"></i>
                                            <span>{itemCount} glabājamās vienības</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="inventory-delete-actions">
                    <button
                        className="inventory-delete-btn inventory-delete-btn-cancel"
                        onClick={handleCancelClick}
                        disabled={isDeleting && countdown === 0}
                    >
                        {!canDelete ? 'Aizvērt' : (isDeleting ? 'Apturēt' : 'Atcelt')}
                    </button>
                    {!isDeleting && canDelete && (
                        <button
                            className="inventory-delete-btn inventory-delete-btn-delete"
                            onClick={handleDeleteClick}
                        >
                            Dzēst
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default InventoryDelete;