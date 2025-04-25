import React from 'react';
import { PROJECT_DELETE_UI } from '../Constants/Constnats';

const WarningPopup = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="popup-background">
            <div className="popup">
                <h2>{PROJECT_DELETE_UI.DELETE_TITLE}</h2>
                <p>{PROJECT_DELETE_UI.DELETE_PARAGRAPH}</p>
                <div className="popup-actions">
                    <button className="btn-confirm" onClick={onConfirm}>{PROJECT_DELETE_UI.DELETE_CONFIRM}</button>
                    <button className="btn-cancel" onClick={onClose}>{PROJECT_DELETE_UI.DELETE_CANCEL}</button>
                </div>
            </div>
        </div>
    );
};

export default WarningPopup;