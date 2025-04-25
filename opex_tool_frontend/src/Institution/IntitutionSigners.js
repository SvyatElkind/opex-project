import React, {useState} from "react";
import Institution_API from "../API/Institution_API";
import { ERROR_MESSAGES, INSTITUTION_CONSTANTS } from "../Constants/Constnats";
import './InstitutionSigners.css';

const InstitutionSigners = ({institution, onClose, onSignersAdded }) =>{
    const [creatorName, setCreatorName] = useState(""); // State for signer's name
    const [creatorPosition, setCreatorPosition] = useState(""); // State for signer's position
    const [signerName, setSignerName] = useState(""); // State for signer's name
    const [signerPosition, setSignerPosition] = useState(""); // State for signer's position
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages
    const [successMessage, setSuccessMessage] = useState(""); // State for success messages

    console.log(institution);

    const institutionAPI = Institution_API(); // Create an instance of the Institution API

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission

        const signersData = {
            creator: creatorName,
            creator_position : creatorPosition,
            signer: signerName,
            signer_position: signerPosition
        };

        console.log(JSON.stringify(signersData));
        console.log(institution.project);
        console.log(institution.id);

        const [success, response] = await institutionAPI.addSigners(institution.project,institution.id, signersData); // Call API to add signers
        if (!success) {
            setErrorMessage(response); // Set the error message
            setSuccessMessage(""); // Clear success message
        } else {
            setSuccessMessage("Signer added successfully!"); // Set success message
            setErrorMessage(""); // Clear error message
            onSignersAdded();
            onClose(); // Optionally close the popup after adding
        }
    };


    return(
        <div className="popup-background">
            <div className="popup">
                <div className="close-button">
                    <button onClick={onClose}>{INSTITUTION_CONSTANTS.CANCEL_ALL_SIGNERS}</button> {/* Close button */}
                </div>
                <h2>{INSTITUTION_CONSTANTS.HEADER} : {institution.name}</h2>
                {/* Form to add signers */}
                <form onSubmit={handleSubmit}>
                    <label>
                        {INSTITUTION_CONSTANTS.CREATOR} :
                        <input 
                            type="text" 
                            value={creatorName} 
                            onChange={(e) => setCreatorName(e.target.value)} 
                            required 
                        />
                    </label>
                    <br />
                    <label>
                        {INSTITUTION_CONSTANTS.CREATOR_POSITION} : 
                        <input 
                            type="text" 
                            value={creatorPosition} 
                            onChange={(e) => setCreatorPosition(e.target.value)} 
                            required 
                        />
                    </label>
                    <label>
                        {INSTITUTION_CONSTANTS.SIGNER} : 
                        <input 
                            type="text" 
                            value={signerName} 
                            onChange={(e) => setSignerName(e.target.value)} 
                            required 
                        />
                    </label>
                    <label>
                        {INSTITUTION_CONSTANTS.SIGNER_POSITION} : 
                        <input 
                            type="text" 
                            value={signerPosition} 
                            onChange={(e) => setSignerPosition(e.target.value)} 
                            required 
                        />
                    </label>
                    <br />
                    <button type="submit">{INSTITUTION_CONSTANTS.CONFIRM_ALL_SIGNERS}</button>
                </form>
                {/* Show error or success messages */}
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            </div>
        </div>
    );

}

export default InstitutionSigners;