import React, { useEffect, useState } from "react";
import { PROJECT_RENAME_UI } from "../Constants/Constants";
import {
    PROJECT_NAME_MAX_LENGTH,
    validateProjectName,
    getNameRemainingChars
} from '../Constants/projectConstants';

const RenameProjectPopup = ({ value, onChange, onRename, project }) => {
    const [newName, setNewName] = useState(project ? project.name : "");
    const [newNameValid, setNewNameValid] = useState(true);
    const [newNameError, setNewNameError] = useState(null);

    const handleRename = (e) => {
        e.preventDefault();
        const result = validateProjectName(newName);
        if (result.isValid) {
            onRename(newName.trim());
        } else {
            setNewNameError(result.error);
            setNewNameValid(false);
        }
    };

    const handleOnChange = (e) => {
        const value = e.target.value;
        setNewName(value);
    };

    const handleClose = () => {
        onChange();
    };

    // Real-time validation
    useEffect(() => {
        if (newName) {
            const result = validateProjectName(newName);
            setNewNameValid(result.isValid);
            setNewNameError(result.error);
        } else {
            setNewNameValid(false);
            setNewNameError(null);
        }
    }, [newName]);

    return value ? (
        <div className="rename-popup-overlay">
            <div className="rename-popup-container">
                <div className="rename-popup-header">
                    <div className="rename-popup-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </div>
                    <h2 className="rename-popup-title">{PROJECT_RENAME_UI.RENAME_TITLE}</h2>
                </div>

                <form className="rename-popup-form" onSubmit={handleRename}>
                    <div className="rename-form-group">
                        <label className="rename-form-label" htmlFor="newProjectName">
                            {PROJECT_RENAME_UI.RENAME_LABLE}
                        </label>
                        <input
                            id="newProjectName"
                            type="text"
                            className={`rename-form-input ${!newNameValid && newNameError ? 'rename-form-input-error' : ''}`}
                            value={newName}
                            onChange={handleOnChange}
                            maxLength={PROJECT_NAME_MAX_LENGTH}
                            placeholder="Ievadiet jaunu nosaukumu"
                            autoFocus
                        />
                        <div className="rename-form-info">
                            <span className={`char-counter ${getNameRemainingChars(newName) < 5 ? 'char-counter-warning' : ''}`}>
                                {getNameRemainingChars(newName)} simboli atlika
                            </span>
                        </div>
                        {!newNameValid && newNameError && (
                            <div className="rename-error-message">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                </svg>
                                {newNameError}
                            </div>
                        )}
                    </div>

                    <div className="rename-popup-actions">
                        <button
                            className="rename-confirm-btn"
                            type="submit"
                            disabled={!newNameValid}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            {PROJECT_RENAME_UI.RENAME_BUTTON}
                        </button>
                        <button
                            className="rename-cancel-btn"
                            type="button"
                            onClick={handleClose}
                        >
                            Atcelt
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;
};

export default RenameProjectPopup;
