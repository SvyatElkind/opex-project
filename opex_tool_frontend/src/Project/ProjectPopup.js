import React, { useState } from "react";
import { PROJECT_CREATE_UI, PROJECT_ERROR } from "../Constants/Constnats";
import Alert from "../Alert/Alert";
import { useCreateProject } from "../hooks/useProjects";

const ProjectPopup = ({ onChange }) => {
    // Local state
    const [validDirectory, setValidDirectory] = useState(true);
    const [directoryErrorMessage, setDirectoryErrorMessage] = useState("");
    const [validProjectName, setValidProjectName] = useState(true);
    const [projectNameErrorMessage, setProjectNameErrorMessage] = useState("");
    
    const [name, setName] = useState("");
    const [directory, setDirectory] = useState("");

    const [showAlert, setShowAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // React Query mutation
    const createProjectMutation = useCreateProject();

    // Regular expressions for validation
    const folderRegEx = /^[^\\\/\?\*\"\>\<\:\|]*$/;
    const dirRegEx = /^(([a-zA-Z]\:)|(\\))(\\{1}|((\\{1})[^\\]([^/:*?<>"|]*))+)$/;

    const validateNameInput = () => {
        if (!name) {
            setProjectNameErrorMessage(PROJECT_ERROR.VALIDATE_NAME_INPUT_MESSAGE_EMPTY);
            setValidProjectName(false);
            return false;
        } else if (folderRegEx.test(name)) {
            setProjectNameErrorMessage("");
            setValidProjectName(true);
            return true;
        } else {
            setProjectNameErrorMessage(PROJECT_ERROR.VALIDATE_NAME_INPUT_MESSAGE_INVALID);
            setValidProjectName(false);
            return false;
        }
    };

    const validateDirectory = () => {
        if (!directory) {
            setDirectoryErrorMessage(PROJECT_ERROR.VALIDATE_DIR_INPUT_MESSAGE_EMPTY);
            setValidDirectory(false);
            return false;
        } else if (dirRegEx.test(directory)) {
            setDirectoryErrorMessage("");
            setValidDirectory(true);
            return true;
        } else {
            setDirectoryErrorMessage(PROJECT_ERROR.VALIDATE_DIR_INPUT_MESSAGE_INVALID);
            setValidDirectory(false);
            return false;
        }
    };

    const prepareDir = () => {
        let newDir = directory.split("\\");
        return newDir.join("\\");
    };

    const submitForm = async (e) => {
        e.preventDefault();

        if (validateNameInput() && validateDirectory()) {
            const preparedDirectory = prepareDir();

            try {
                await createProjectMutation.mutateAsync({
                    name,
                    folder: preparedDirectory,
                });
                
                // Close popup on success
                onChange(false);
            } catch (error) {
                setErrorMessage(error.message);
                setShowAlert(true);
            }
        }
    };

    const close = () => {
        onChange(false);
    };

    const closeAlert = () => {
        setShowAlert(false);
    };

    return (
        <div className="popup-overlay">
            <div className="project-popup">
                <div className="project-popup-header">
                    <h2 className="project-popup-title">Jauns projekts</h2>
                </div>

                <form className="project-popup-form" onSubmit={submitForm}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="projectName">
                            {PROJECT_CREATE_UI.PROJECT_NAME_LABEL}
                        </label>
                        <input
                            id="projectName"
                            type="text"
                            className={`form-input ${!validProjectName ? 'form-input-error' : ''}`}
                            value={name}
                            maxLength="20"
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Projekta nosaukums"
                        />
                        {!validProjectName && (
                            <div className="form-error-message">
                                {projectNameErrorMessage}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="projectDirectory">
                            {PROJECT_CREATE_UI.PROJECT_DIR_LABEL}
                        </label>
                        <input
                            id="projectDirectory"
                            type="text"
                            className={`form-input ${!validDirectory ? 'form-input-error' : ''}`}
                            value={directory}
                            onChange={(e) => setDirectory(e.target.value)}
                            placeholder="C:\ceļš\uz\projektu"
                        />
                        {!validDirectory && (
                            <div className="form-error-message">
                                {directoryErrorMessage}
                            </div>
                        )}
                    </div>

                    <div className="project-popup-actions">
                        <button 
                            className="btn-action"
                            type="submit"
                            disabled={createProjectMutation.isPending}
                        >
                            {createProjectMutation.isPending ? (
                                <>
                                    <span className="btn-loading-spinner"></span>
                                    Creating...
                                </>
                            ) : (
                                PROJECT_CREATE_UI.PROJECT_CREATE_BTN
                            )}
                        </button>
                        <button 
                            className="btn-secondary" 
                            type="button" 
                            onClick={close}
                        >
                            {PROJECT_CREATE_UI.PROJECT_CANCEL_BTN}
                        </button>
                    </div>
                </form>

                {showAlert && <Alert message={errorMessage} onClose={closeAlert} />}
            </div>
        </div>
    );
};

export default ProjectPopup;