import React, { useState } from "react";

const RenameProjectPopup = ({ value, onChange, onRename, project }) => {
    const [newName, setNewName] = useState(project ? project.name : "");
    const [newNameValid, setNewNameValid] = useState(false);
    const [newNameError, setNewNameError] = useState(null);

    const folderRegEx = /^[^\\\/\?\*\"\>\<\:\|]*$/;

    const handleRename = (e) => {
        e.preventDefault();
        if(newNameValid){
            onRename(newName);
        };
    };
    const handleOnChange = (e) => {
        const value = e.target.value;
        setNewName(value);
        validateNewName();
    }

    const validateNewName = () => {
        if(!newName){
            setNewNameError("Nosaukums Nedrīkst būt tukšs!");
            setNewNameValid(false);
        } else if(folderRegEx.test(newName)){
            setNewNameError("");
            setNewNameValid(true);
        } else{
            setNewNameError("Nosaukums norādīts kļūdaini!");
            setNewNameValid(false);
        }
    };

    return value ? (
        <div className="popup-background">
            <div className="popup">
                <div className="close-button">
                    <button onClick={onChange}>X</button>
                </div>
                <h2>Projekta Pārdēvēšana</h2>
                <form onSubmit={handleRename}>
                    <label>
                        Projekta Jaunais Nosaukums:
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
                    <button type="submit">Pārdēvēt</button>
                </form>
            </div>
        </div>
    ) : null;
};

export default RenameProjectPopup;