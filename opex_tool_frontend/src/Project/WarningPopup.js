import React,{ useEffect, useState} from 'react';
import { PROJECT_DELETE_UI } from '../Constants/Constnats';

const WarningPopup = ({ isOpen, onClose, onConfirm, projectName = "this project" }) => {
    const [isDeleteDisabled, setIsDeleteDisabled] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        if (isOpen) {
            // Reset and start the timer when popup opens
            setIsDeleteDisabled(true);
            setTimeRemaining(10);

            const timer = setInterval(() => {
                setTimeRemaining((prevTime) => {
                    if (prevTime <= 1) {
                        setIsDeleteDisabled(false);
                        clearInterval(timer);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => {
                clearInterval(timer);
            };
        } else {
            // Reset state when popup closes
            setIsDeleteDisabled(false);
            setTimeRemaining(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <div className="delete-popup-overlay">
            <div className="delete-popup-container">
                <div className="delete-popup-warning-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                </div>

                <div className="delete-popup-content">
                    <h2 className="delete-popup-title">{PROJECT_DELETE_UI.DELETE_TITLE}</h2>
                    <p className="delete-popup-message">
                        {PROJECT_DELETE_UI.DELETE_PARAGRAPH_PT1}
                    </p>
                    <div className='delete-popup-project-name'><strong>{projectName}</strong></div>
                    <p><i className='delete-popup-message-second'>{PROJECT_DELETE_UI.DELETE_PARAGRAPH_PT2}</i></p>
                    <p><strong className='delete-popup-message-third'>{PROJECT_DELETE_UI.DELETE_PARAGRAPH_PT3}</strong></p>
                </div>

                <div className="delete-popup-actions">
                    <button 
                        className={`delete-confirm-btn ${isDeleteDisabled ? 'disabled' : ''}`}
                        onClick={handleConfirm}
                        disabled={isDeleteDisabled}
                        autoFocus={!isDeleteDisabled}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                        {isDeleteDisabled 
                            ? `${PROJECT_DELETE_UI.DELETE_CONFIRM} (${timeRemaining}s)`
                            : PROJECT_DELETE_UI.DELETE_CONFIRM
                        }
                    </button>
                    <button 
                        className="delete-cancel-btn" 
                        onClick={handleClose}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        {PROJECT_DELETE_UI.DELETE_CANCEL}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarningPopup;