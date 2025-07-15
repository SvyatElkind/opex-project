import React, { useState } from "react";
import { INSTITUTION_CONSTANTS } from "../Constants/Constnats";
import './InstitutionSigners.css';
import { useAddInstitutionSigners } from "../hooks/useInstitutions";
import { useProject } from "../hooks/useProjects";

const InstitutionSigners = ({ institutionId, projectId, onClose }) => {
    // Get institution from project data
    const { data: projectData } = useProject(projectId);
    const institution = projectData?.institution;
    
    // Mutation for adding signers
    const addSignersMutation = useAddInstitutionSigners();
    
    // Local state
    const [creatorName, setCreatorName] = useState("");
    const [creatorPosition, setCreatorPosition] = useState("");
    const [signerName, setSignerName] = useState("");
    const [signerPosition, setSignerPosition] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        const signersData = {
            creator: creatorName,
            creator_position: creatorPosition,
            signer: signerName,
            signer_position: signerPosition
        };

        try {
            await addSignersMutation.mutateAsync({
                projectId,
                institutionId,
                signersData
            });
            
            setSuccessMessage("Signer added successfully!");
            setErrorMessage("");
            
            // Close popup after small delay
            setTimeout(() => {
                onClose();
            }, 1000);
            
        } catch (error) {
            setErrorMessage(error.message);
            setSuccessMessage("");
        }
    };

    if (!institution) {
        return null;
    }

    return (
        <div className="popup-background">
            <div className="popup">
                <div className="close-button">
                    <button onClick={onClose}>{INSTITUTION_CONSTANTS.CANCEL_ALL_SIGNERS}</button>
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
                    <button 
                        type="submit"
                        disabled={addSignersMutation.isPending}
                    >
                        {addSignersMutation.isPending ? 'Adding...' : INSTITUTION_CONSTANTS.CONFIRM_ALL_SIGNERS}
                    </button>
                </form>
                {/* Show error or success messages */}
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            </div>
        </div>
    );
};

export default InstitutionSigners;