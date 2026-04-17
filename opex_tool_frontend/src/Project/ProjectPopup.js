import React, { useState } from "react";
import { PROJECT_CREATE_UI, PROJECT_ADDITIONAL_UI } from "../Constants/Constants";
import { GeneralError, FieldError } from '../components/ErrorDisplay';
import { useFormErrors } from '../hooks/useFormErrors';
import { useCreateProject } from "../hooks/useProjects";
import {
    PROJECT_NAME_MAX_LENGTH,
    PROJECT_FOLDER_MAX_LENGTH,
    validateProjectName,
    validateProjectFolder,
    getNameRemainingChars,
    getFolderRemainingChars,
    PROJECT_ERROR_MESSAGES
} from '../Constants/projectConstants';
import HelpButton from '../Help/HelpButton';

const ProjectPopup = ({ onChange }) => {
    // Local state
    const [name, setName] = useState("");
    const [directory, setDirectory] = useState("");
    const [nameError, setNameError] = useState("");
    const [folderError, setFolderError] = useState("");

    // Error handling
    const { generalError, setGeneralError, setApiErrors, clearErrors, getFieldError } = useFormErrors();

    // React Query mutation
    const createProjectMutation = useCreateProject();

    // Directory path regex (Windows path)
    const dirRegEx = /^(([a-zA-Z]:)|(\\))(\\{1}|((\\{1})[^\\]([^/:*?<>"|]*))+)$/;

    const validateNameInput = () => {
        const result = validateProjectName(name);
        setNameError(result.error || "");
        return result.isValid;
    };

    const validateDirectory = () => {
        const result = validateProjectFolder(directory);
        if (!result.isValid) {
            setFolderError(result.error || "");
            return false;
        }

        // Additional check for valid Windows path format
        if (!dirRegEx.test(directory.trim())) {
            setFolderError(PROJECT_ERROR_MESSAGES.folder_not_exists);
            return false;
        }

        setFolderError("");
        return true;
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);

        // Real-time validation
        if (value) {
            const result = validateProjectName(value);
            setNameError(result.error || "");
        } else {
            setNameError("");
        }
    };

    const handleDirectoryChange = (e) => {
        const value = e.target.value;
        setDirectory(value);

        // Clear error when typing
        if (folderError) {
            setFolderError("");
        }
    };

    const prepareDir = () => {
        let newDir = directory.trim().split("\\");
        return newDir.join("\\");
    };

    const submitForm = async (e) => {
        e.preventDefault();
        clearErrors();

        const isNameValid = validateNameInput();
        const isDirValid = validateDirectory();

        if (isNameValid && isDirValid) {
            const preparedDirectory = prepareDir();

            try {
                await createProjectMutation.mutateAsync({
                    name: name.trim(),
                    folder: preparedDirectory,
                });

                // Close popup on success
                onChange(false);
            } catch (error) {
                if (error.fieldErrors) {
                    setApiErrors({ ...error.fieldErrors, error: error.message });
                } else {
                    setGeneralError(error.message);
                }
            }
        }
    };

    const close = () => {
        onChange(false);
    };

    return (
        <div className="popup-overlay">
            <div className="project-popup">
                <div className="project-popup-header">
                    <h2 className="project-popup-title">{PROJECT_ADDITIONAL_UI.JAUNS_PROJEKTS_TITLE}</h2>
                    <HelpButton chapterId="projects" iconOnly={true} className="small" />
                </div>

                <form className="project-popup-form" onSubmit={submitForm}>
                    <GeneralError message={generalError} onClose={clearErrors} />

                    <div className="form-group">
                        <label className="form-label" htmlFor="projectName">
                            {PROJECT_CREATE_UI.PROJECT_NAME_LABEL}
                        </label>
                        <input
                            id="projectName"
                            type="text"
                            className={`form-input ${nameError || getFieldError('name') ? 'form-input-error' : ''}`}
                            value={name}
                            maxLength={PROJECT_NAME_MAX_LENGTH}
                            onChange={handleNameChange}
                            placeholder={PROJECT_ADDITIONAL_UI.PROJEKTA_NOSAUKUMS_PLACEHOLDER}
                        />
                        <div className="form-field-info">
                            <span className={`char-counter ${getNameRemainingChars(name) < 5 ? 'char-counter-warning' : ''}`}>
                                {getNameRemainingChars(name)} {PROJECT_ADDITIONAL_UI.SIMBOLI_ATLIKA}
                            </span>
                        </div>
                        {nameError && (
                            <div className="form-error-message">
                                {nameError}
                            </div>
                        )}
                        <FieldError error={getFieldError('name')} />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="projectDirectory">
                            {PROJECT_CREATE_UI.PROJECT_DIR_LABEL}
                        </label>
                        <input
                            id="projectDirectory"
                            type="text"
                            className={`form-input ${folderError || getFieldError('folder') ? 'form-input-error' : ''}`}
                            value={directory}
                            maxLength={PROJECT_FOLDER_MAX_LENGTH}
                            onChange={handleDirectoryChange}
                            placeholder={PROJECT_ADDITIONAL_UI.PROJEKTA_CEĻŠ_PLACEHOLDER}
                        />
                        <div className="form-field-info">
                            <span className={`char-counter ${getFolderRemainingChars(directory) < 10 ? 'char-counter-warning' : ''}`}>
                                {getFolderRemainingChars(directory)} {PROJECT_ADDITIONAL_UI.SIMBOLI_ATLIKA}
                            </span>
                        </div>
                        {folderError && (
                            <div className="form-error-message">
                                {folderError}
                            </div>
                        )}
                        <FieldError error={getFieldError('folder')} />
                    </div>

                    <div className="project-popup-actions">
                        <button
                            className="btn-secondary"
                            type="button"
                            onClick={close}
                        >
                            {PROJECT_CREATE_UI.PROJECT_CANCEL_BTN}
                        </button>
                        <button
                            className="btn-action"
                            type="submit"
                            disabled={createProjectMutation.isPending}
                        >
                            {createProjectMutation.isPending ? (
                                <>
                                    <span className="btn-loading-spinner"></span>
                                    {PROJECT_ADDITIONAL_UI.IZVEIDO_LOADING}
                                </>
                            ) : (
                                PROJECT_CREATE_UI.PROJECT_CREATE_BTN
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectPopup;
