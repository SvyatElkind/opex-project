import React, { useEffect, useState } from "react";
import { ERROR_MESSAGES, PROJECT_CREATE_UI, PROJECT_ERROR } from "../Constants/Constnats";
import Project_API from "../API/Project_API";
import Alert from "../Alert/Alert";

const ProjectPopup = ({onChange , onCreate}) => {
    const [validDirectory, setValidDirectory] = useState(true);
    const [directoryErrorMessage, setDirectoryErrorMessage] = useState("");
    const [validProjectName, setValidProjectName] = useState(true);
    const [projectNameErrorMessage, setProjectNameErrorMessage] = useState("");
    
    const [name, setName] = useState("");
    const [directory, setDirectory] = useState("");

    const [showAlert,setShowAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const projectAPI = Project_API();

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

        if (validateNameInput() || validateDirectory()) {
            const preparedDirectory = prepareDir();

            projectAPI.requestoptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    folder: preparedDirectory,
                }),
            };

            const [success, response] = await projectAPI.create_project({
                name,
                folder: preparedDirectory,
            });

            if (success) {
                create();
            } else {
                setErrorMessage(response);
                setShowAlert(true);
            }
        }
    };

    const close = () => {
        onChange(false);
    };

    const create = () => {
        onCreate();
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
                            onChange={(e) => setName(e.target.value)} // Update name state
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
                            onChange={(e) => setDirectory(e.target.value)} // Update directory state
                        />
                    </label>
                    {!validDirectory && (
                        <div className="DirctoryError"><p style={{color: "red"}} >{directoryErrorMessage}</p></div>
                    )}
                    <div className="ActionButtons">
                        <button className="BtnSubmit" type="submit" >{PROJECT_CREATE_UI.PROJECT_CREATE_BTN}</button>
                        <button className="BtnClose" type="button" onClick={close}>{PROJECT_CREATE_UI.PROJECT_CANCEL_BTN}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectPopup;