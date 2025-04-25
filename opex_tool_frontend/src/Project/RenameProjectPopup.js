import React, { useEffect, useState } from "react";
import { PROJECT_ERROR, PROJECT_RENAME_UI } from "../Constants/Constnats";

const RenameProjectPopup = ({ value, onChange, onRename, project }) => {
    const [newName, setNewName] = useState(project ? project.name : "");
    const [newNameValid, setNewNameValid] = useState(false);
    const [newNameError, setNewNameError] = useState(null);


    const folderRegEx = /^[^\\\/\?\*\"\>\<\:\|$]*$/;

    const handleRename = (e) => {
        e.preventDefault();
        if(validateNewName()){
            onRename(newName);
        };
    };

    const handleOnChange = (e) => {
        const value = e.target.value;
        setNewName(value);
        validateNewName();
    };

    const validateNewName = () => {
        if(!newName){
            setNewNameError(PROJECT_ERROR.VALIDATE_NAME_INPUT_MESSAGE_EMPTY);
            setNewNameValid(false);
            return  false;
        } else if(folderRegEx.test(newName)){
            setNewNameError("");
            setNewNameValid(true);
            return true;
        } else{
            setNewNameError(PROJECT_ERROR.VALIDATE_NAME_INPUT_MESSAGE_INVALID);
            setNewNameValid(false);
            return false;
        };
    };

    useEffect(()=>{
        validateNewName();
    },[newName,newNameValid]);

    return value ? (
        <div className="popup-background">
            <div className="popup">
                <div className="close-button">
                    <button onClick={onChange}>X</button>
                </div>
                <h2>{PROJECT_RENAME_UI.RENAME_TITLE}</h2>
                <form onSubmit={handleRename}>
                    <label>
                        {PROJECT_RENAME_UI.RENAME_LABLE}
                        <input
                            type="text"
                            value={newName}
                            onChange={handleOnChange}
                            required
                            maxLength = "20"
                        />
                    </label>
                    {!newNameValid && (
                        <div className="newNameError"><p>{newNameError}</p></div>
                    )}
                    <button type="submit">{PROJECT_RENAME_UI.RENAME_BUTTON}</button>
                </form>
            </div>
        </div>
    ) : null;
};

export default RenameProjectPopup;