import React, { useEffect, useState } from "react";
import Project_API from "../API/Project_API";

const ProjectPopup = ({ value, onChange , onCreate}) => {
    const [validDirectory, setValidDirectory] = useState(true);
    const [directoryErrorMessage, setDirectoryErrorMessage] = useState("");
    const [validProjectName, setValidProjectName] = useState(true);
    const [projectNameErrorMessage, setProjectNameErrorMessage] = useState("");
    
    const [name, setName] = useState("");
    const [directory, setDirectory] = useState("");

    const projectAPI = Project_API();

    const folderRegEx = /^[^\\\/\?\*\"\>\<\:\|]*$/;
    const dirRegEx = /^(([a-zA-Z]\:)|(\\))(\\{1}|((\\{1})[^\\]([^/:*?<>"|]*))+)$/;

    const validateNameInput = () => {
        if (!name) {
            setProjectNameErrorMessage("Norādiet Nosaukumu!");
            setValidProjectName(false);
        } else if (folderRegEx.test(name)) {
            setProjectNameErrorMessage("");
            setValidProjectName(true);
        } else {
            setProjectNameErrorMessage("Nosaukums Norādīts kļūdaini!");
            setValidProjectName(false);
        }
    };

    const validateDirectory = () => {
        if (!directory) {
            setDirectoryErrorMessage("Norādiet Direktoriju!");
            setValidDirectory(false);
        } else if (dirRegEx.test(directory)) {
            setDirectoryErrorMessage("");
            setValidDirectory(true);
        } else {
            setDirectoryErrorMessage("Direktorija norādīta kļūdaini!");
            setValidDirectory(false);
        }
    };

    const prepareDir = () => {
        let newDir = directory.split("\\");
        return newDir.join("\\");
    };

    const submitForm = async (e) => {
        e.preventDefault();
        validateNameInput();
        validateDirectory();

        if (validDirectory && validProjectName) {
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
                console.error("Error creating project:", response);
            }
        }
    };

    const close = () => {
        onChange(false);
    };

    const create = () => {
        onCreate();
    }

    return (
        <div className="popup-background">
            <div className="popup">
                <div className="close-button">
                    <button className="Close_Button_Element" onClick={close}>X</button>
                </div>
                <form className="popupform" onSubmit={submitForm}>
                    <label className="ProjectName">
                        Jaunā Projekta Nosaukums
                        <input
                            type="text"
                            className="NameInput"
                            value={name}
                            maxLength="20"
                            onChange={(e) => setName(e.target.value)} // Update name state
                        />
                    </label>
                    {!validProjectName && (
                        <div className="ProjectError"><p>{projectNameErrorMessage}</p></div>
                    )}
                    <label className="ProjectDirectory">
                        Izvēlēties Projekta Direktoriju
                        <input
                            type="text"
                            className="DirInput"
                            value={directory}
                            onChange={(e) => setDirectory(e.target.value)} // Update directory state
                        />
                    </label>
                    {!validDirectory && (
                        <div className="DirctoryError"><p>{directoryErrorMessage}</p></div>
                    )}
                    <div className="ActionButtons">
                        <button className="BtnClose" type="button" onClick={close}>Aizvērt</button>
                        <button className="BtnSubmit" type="submit" >Izveidot</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectPopup;