import React, { useEffect, useState } from "react";
import { PROJECT_RENAME_UI, PROJECT_ADDITIONAL_UI, COMMON_ACTION_UI } from "../Constants/Constants";
import {
    PROJECT_NAME_MAX_LENGTH,
    validateProjectName,
    getNameRemainingChars
} from '../Constants/projectConstants';
import HelpButton from '../Help/HelpButton';

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
                    <h2 className="rename-popup-title">{PROJECT_RENAME_UI.RENAME_TITLE}</h2>
                    <HelpButton chapterId="projects" iconOnly={true} className="small" />
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
                            placeholder={PROJECT_ADDITIONAL_UI.RENAME_PLACEHOLDER}
                            autoFocus
                        />
                        <div className="rename-form-info">
                            <span className={`char-counter ${getNameRemainingChars(newName) < 5 ? 'char-counter-warning' : ''}`}>
                                {getNameRemainingChars(newName)} {PROJECT_ADDITIONAL_UI.SIMBOLI_ATLIKA}
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
                            className="rename-cancel-btn"
                            type="button"
                            onClick={handleClose}
                        >
                            {COMMON_ACTION_UI.ATCELT}
                        </button>
                        <button
                            className="rename-confirm-btn"
                            type="submit"
                            disabled={!newNameValid}
                        >
                            {PROJECT_RENAME_UI.RENAME_BUTTON}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;
};

export default RenameProjectPopup;
