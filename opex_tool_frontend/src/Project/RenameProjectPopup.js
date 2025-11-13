import React, { useEffect, useState } from "react";
import { PROJECT_ERROR, PROJECT_RENAME_UI } from "../Constants/Constants";

const RenameProjectPopup = ({ value, onChange, onRename, project }) => {
    const [newName, setNewName] = useState(project ? project.name : "");
    const [newNameValid, setNewNameValid] = useState(false);
    const [newNameError, setNewNameError] = useState(null);

    const folderRegEx = /^[^\\\/\?\*\"\>\<\:\|$]*$/;

    const handleRename = (e) => {
        e.preventDefault();
        if(validateNewName()){
            onRename(newName);
        }
    };

    const handleOnChange = (e) => {
        const value = e.target.value;
        setNewName(value);
    };

    const validateNewName = () => {
        if(!newName.trim()){
            setNewNameError(PROJECT_ERROR.VALIDATE_NAME_INPUT_MESSAGE_EMPTY);
            setNewNameValid(false);
            return false;
        } else if(folderRegEx.test(newName.trim())){
            setNewNameError("");
            setNewNameValid(true);
            return true;
        } else{
            setNewNameError(PROJECT_ERROR.VALIDATE_NAME_INPUT_MESSAGE_INVALID);
            setNewNameValid(false);
            return false;
        }
    };

    const handleClose = () => {
        onChange();
    };

    useEffect(() => {
        validateNewName();
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
                            className={`rename-form-input ${!newNameValid ? 'rename-form-input-error' : ''}`}
                            value={newName}
                            onChange={handleOnChange}
                            maxLength="20"
                            placeholder="Enter new project name"
                            autoFocus
                        />
                        {!newNameValid && newNameError && (
                            <div className="rename-error-message">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
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