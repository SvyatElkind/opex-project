import React from 'react';

const WarningPopup = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;


    return (
        <div className="popup-background">
            <div className="popup">
                <h2>Projekta Dzēšana!</h2>
                <p>Vai esat pārliecināts ka vēlaties dzēst Projektu? - šī darbība ir neatgriežama!!!</p>
                <div className="popup-actions">
                    <button className="btn-confirm" onClick={onConfirm}>Dzēst</button>
                    <button className="btn-cancel" onClick={onClose}>Atcelt</button>
                </div>
            </div>
        </div>
    );
};

export default WarningPopup;