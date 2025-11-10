import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./InventoryDelete.css";

const InventoryDelete = ({ onConfirm, onCancel, inventoryNumber, itemCount = 0 }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [countdown, setCountdown] = useState(3);

    // Countdown timer effect
    useEffect(() => {
        if (!isDeleting) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            // Countdown finished, execute deletion
            onConfirm();
        }
    }, [isDeleting, countdown, onConfirm]);

    const handleDeleteClick = () => {
        setIsDeleting(true);
    };

    const handleCancelClick = () => {
        if (isDeleting) {
            setIsDeleting(false);
            setCountdown(3);
        } else {
            onCancel();
        }
    };

    // Render the modal using React Portal
    return ReactDOM.createPortal(
        <div className="inventory-delete-overlay">
            <div className="inventory-delete-modal">
                {/* Header */}
                <div className="inventory-delete-header">
                    <div className="inventory-delete-icon-wrapper">
                        <i className="fas fa-exclamation-triangle inventory-delete-icon"></i>
                    </div>
                    <h2 className="inventory-delete-title">
                        {isDeleting ? 'Dzēš Uzskaites Sarakstu...' : 'Dzēst Uzskaites Sarakstu?'}
                    </h2>
                    {!isDeleting && (
                        <button 
                            className="inventory-delete-close-btn"
                            onClick={handleCancelClick}
                            aria-label="Aizvērt"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="inventory-delete-content">
                    {isDeleting ? (
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
                                    Šī darbība ir <strong>neatgriezeniska</strong>. Dzēšot uzskaites sarakstu, tiks dzēsti:
                                </p>
                            </div>

                            {/* Inventory Details */}
                            {inventoryNumber && (
                                <div className="inventory-delete-details">
                                    <div className="inventory-delete-detail-item">
                                        <i className="fas fa-clipboard-list"></i>
                                        <span>Uzskaites Saraksts #{inventoryNumber}</span>
                                    </div>
                                    {itemCount > 0 && (
                                        <div className="inventory-delete-detail-item">
                                            <i className="fas fa-box"></i>
                                            <span>{itemCount} glabājamās vienības</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Consequences List */}
                            <div className="inventory-delete-consequences">
                                <h4>
                                    <i className="fas fa-list-ul"></i>
                                    Kas tiks dzēsts:
                                </h4>
                                <ul>
                                    <li>
                                        <i className="fas fa-times-circle"></i>
                                        Visi uzskaites saraksta metadati
                                    </li>
                                    <li>
                                        <i className="fas fa-times-circle"></i>
                                        Visas glabājamās vienības
                                    </li>
                                    <li>
                                        <i className="fas fa-times-circle"></i>
                                        Visi pievienotie dokumenti un ieraksti
                                    </li>
                                    <li>
                                        <i className="fas fa-times-circle"></i>
                                        Visi augšupielādētie faili
                                    </li>
                                </ul>
                            </div>

                            {/* Final Warning */}
                            <div className="inventory-delete-final-warning">
                                <i className="fas fa-shield-alt"></i>
                                <p>
                                    Datus <strong>nevarēs atgūt</strong> pēc dzēšanas.
                                    Lūdzu, pārliecinieties pirms turpināt.
                                </p>
                            </div>
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
                        <i className="fas fa-times"></i>
                        {isDeleting ? 'Apturēt' : 'Atcelt'}
                    </button>
                    {!isDeleting && (
                        <button 
                            className="inventory-delete-btn inventory-delete-btn-delete"
                            onClick={handleDeleteClick}
                        >
                            <i className="fas fa-trash-alt"></i>
                            Dzēst Uzskaites Sarakstu
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default InventoryDelete;