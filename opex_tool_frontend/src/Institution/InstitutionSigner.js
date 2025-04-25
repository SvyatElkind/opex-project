import React, { useState, useEffect} from "react";
import { INSTITUTION_CONSTANTS } from "../Constants/Constnats";
import './InstitutionSigner.css';

const InstitutionSigner = ({ field, value, onClose, onSave }) => {
    const [inputValue, setInputValue] = useState(value || "");
    const [headerField, setHeaderField ] = useState('');

    const handleSave = () => {
        onSave(field, inputValue);
        onClose();
    };

    const handleField = (field) =>{
        if(field === "creator"){setHeaderField(INSTITUTION_CONSTANTS.CREATOR)};
        if(field === "creator_position"){setHeaderField(INSTITUTION_CONSTANTS.CREATOR_POSITION)};
        if(field === "signer"){setHeaderField(INSTITUTION_CONSTANTS.SIGNER)};
        if(field === "signer_position"){setHeaderField(INSTITUTION_CONSTANTS.SIGNER_POSITION)};
    }

    useEffect(()=>{
        handleField(field);
    },[field])


    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>{INSTITUTION_CONSTANTS.EDIT_HEADER} {headerField}</h2>
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                />
                <div className="popup-actions">
                    <button onClick={handleSave}>{INSTITUTION_CONSTANTS.EDIT}</button>
                    <button onClick={onClose}>{INSTITUTION_CONSTANTS.CANCEL_SIGNER}</button>
                </div>
            </div>
        </div>
    );
};

export default InstitutionSigner;