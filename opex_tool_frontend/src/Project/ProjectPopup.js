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
        <div className="popup-background">
            {showAlert && <Alert message={errorMessage} onClose={closeAlert} />}
            <div className="popup">
                <div className="close-button">
                    <button className="Close_Button_Element" onClick={close}>X</button>
                </div>
                <form className="popupform" onSubmit={submitForm}>
                    <label className="ProjectName">
                        {PROJECT_CREATE_UI.PROJECT_NAME_LABEL}
                        <input
                            type="text"
                            className="NameInput"
                            value={name}
                            maxLength="20"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>
                    {!validProjectName && (
                        <div className="ProjectError"><p style={{color: "red"}}>{projectNameErrorMessage}</p></div>
                    )}
                    <label className="ProjectDirectory">
                        {PROJECT_CREATE_UI.PROJECT_DIR_LABEL}
                        <input
                            type="text"
                            className="DirInput"
                            value={directory}
                            onChange={(e) => setDirectory(e.target.value)}
                        />
                    </label>
                    {!validDirectory && (
                        <div className="DirctoryError"><p style={{color: "red"}} >{directoryErrorMessage}</p></div>
                    )}
                    <div className="ActionButtons">
                        <button 
                            className="BtnSubmit" 
                            type="submit"
                            disabled={createProjectMutation.isPending}
                        >
                            {createProjectMutation.isPending ? 'Creating...' : PROJECT_CREATE_UI.PROJECT_CREATE_BTN}
                        </button>
                        <button className="BtnClose" type="button" onClick={close}>{PROJECT_CREATE_UI.PROJECT_CANCEL_BTN}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectPopup;