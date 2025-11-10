import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { PROJECT_DELETE_UI } from '../Constants/Constnats';
import './WarningPopup.css';

const WarningPopup = ({ isOpen, onClose, onConfirm, projectName = null }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [countdown, setCountdown] = useState(10);

    const hasConfirmed = useRef(false);

    // Countdown timer effect
    useEffect(() => {
        if (!isDeleting || !isOpen) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (!hasConfirmed.current) {
            // ✅ Only call onConfirm once
            hasConfirmed.current = true;
            onConfirm();
        }
    }, [isDeleting, countdown, isOpen]);

    // Reset state when popup opens/closes
    useEffect(() => {
        if (isOpen) {
            setIsDeleting(false);
            setCountdown(10);
            hasConfirmed.current = false; // ✅ Reset confirmation flag
        }
    }, [isOpen]);

    const handleDeleteClick = () => {
        setIsDeleting(true);
    };

    const handleCancelClick = () => {
        if (isDeleting) {
            setIsDeleting(false);
            setCountdown(10);
            hasConfirmed.current = false; // ✅ Reset on cancel
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    // Render the modal using React Portal
    return ReactDOM.createPortal(
        <div className="project-delete-overlay">
            <div className="project-delete-modal">
                {/* Header */}
                <div className="project-delete-header">
                    <div className="project-delete-icon-wrapper">
                        <i className="fas fa-exclamation-triangle project-delete-icon"></i>
                    </div>
                    <h2 className="project-delete-title">
                        {isDeleting ? 'Dzēš Projektu...' : PROJECT_DELETE_UI.DELETE_TITLE}
                    </h2>
                    {!isDeleting && (
                        <button 
                            className="project-delete-close-btn"
                            onClick={handleCancelClick}
                            aria-label="Aizvērt"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="project-delete-content">
                    {isDeleting ? (
                        <>
                            {/* Countdown Display */}
                            <div className="project-delete-countdown-wrapper">
                                <div className="project-delete-countdown-circle">
                                    <svg className="project-delete-countdown-svg" viewBox="0 0 100 100">
                                        <circle 
                                            className="project-delete-countdown-bg"
                                            cx="50" 
                                            cy="50" 
                                            r="45"
                                        />
                                        <circle 
                                            className="project-delete-countdown-progress"
                                            cx="50" 
                                            cy="50" 
                                            r="45"
                                            style={{
                                                strokeDashoffset: `${283 - (283 * (10 - countdown) / 10)}`
                                            }}
                                        />
                                    </svg>
                                    <span className="project-delete-countdown-number">
                                        {countdown}
                                    </span>
                                </div>
                                <p className="project-delete-countdown-text">
                                    Dzēš pēc {countdown} sekundēm...
                                </p>
                            </div>

                            {/* Processing Message */}
                            <div className="project-delete-processing">
                                <div className="project-delete-spinner"></div>
                                <p>Gatavo dzēšanu...</p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Warning Message */}
                            <div className="project-delete-warning">
                                <p className="project-delete-warning-text">
                                    {PROJECT_DELETE_UI.DELETE_PARAGRAPH_PT1}
                                </p>
                            </div>

                            {/* Project Details */}
                            {projectName && (
                                <div className="project-delete-details">
                                    <div className="project-delete-detail-item">
                                        <i className="fas fa-folder-open"></i>
                                        <span>Projekts: <strong>{projectName}</strong></span>
                                    </div>
                                </div>
                            )}

                            {/* Consequences List */}
                            <div className="project-delete-consequences">
                                <h4>
                                    <i className="fas fa-list-ul"></i>
                                    {PROJECT_DELETE_UI.DELETE_PARAGRAPH_PT2}
                                </h4>
                                <ul>
                                    <li>
                                        <i className="fas fa-times-circle"></i>
                                        Visi projekta metadati
                                    </li>
                                    <li>
                                        <i className="fas fa-times-circle"></i>
                                        Visi fondi un iestādes
                                    </li>
                                    <li>
                                        <i className="fas fa-times-circle"></i>
                                        Visi uzskaites saraksti
                                    </li>
                                    <li>
                                        <i className="fas fa-times-circle"></i>
                                        Visas glabājamās vienības
                                    </li>
                                    <li>
                                        <i className="fas fa-times-circle"></i>
                                        Visi ieraksti un dokumenti
                                    </li>
                                    <li>
                                        <i className="fas fa-times-circle"></i>
                                        Visi augšupielādētie faili
                                    </li>
                                </ul>
                            </div>

                            {/* Final Warning */}
                            <div className="project-delete-final-warning">
                                <i className="fas fa-shield-alt"></i>
                                <p>
                                    {PROJECT_DELETE_UI.DELETE_PARAGRAPH_PT3}
                                </p>
                            </div>

                            {/* Additional Warning */}
                            <div className="project-delete-final-warning project-delete-extra-warning">
                                <i className="fas fa-exclamation-circle"></i>
                                <p>
                                    {PROJECT_DELETE_UI.DELETE_PARAGRAPH_PT4}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="project-delete-actions">
                    <button 
                        className="project-delete-btn project-delete-btn-cancel"
                        onClick={handleCancelClick}
                        disabled={isDeleting && countdown === 0}
                    >
                        <i className="fas fa-times"></i>
                        {isDeleting ? 'Apturēt' : PROJECT_DELETE_UI.DELETE_CANCEL}
                    </button>
                    {!isDeleting && (
                        <button 
                            className="project-delete-btn project-delete-btn-delete"
                            onClick={handleDeleteClick}
                        >
                            <i className="fas fa-trash-alt"></i>
                            {PROJECT_DELETE_UI.DELETE_CONFIRM}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default WarningPopup;