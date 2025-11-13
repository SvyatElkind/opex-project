// Updated Institution.js component with text format instead of table

import React, { useState } from "react";
import { INSTITUTION_CONSTANTS } from "../Constants/Constants";
import InstitutionSigner from "./InstitutionSigner";
import InstitutionSigners from "./IntitutionSigners";
import { useUpdateInstitutionSignerField} from "../hooks/useInstitutions";

const Institution = ({ institution, projectId }) => {
    const [editField, setEditField] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const [signerFormVisibility, setSignerFormVisibility] = useState(false);

    // Use the hook
    const updateFieldMutation = useUpdateInstitutionSignerField();

    const togglePopup = () => {
        setSignerFormVisibility(!signerFormVisibility);
    };

    const handleEditField = (field) => {
        setEditField(field);
    };

    const handleSaveField = async (field, value) => {
        const updatedData = {
            creator: institution.creator,
            creator_position: institution.creator_position,
            signer: institution.signer,
            signer_position: institution.signer_position,
            [field]: value
        };

        try {
            await updateFieldMutation.mutateAsync({
                projectId,
                institutionId: institution.id,
                updatedInstitutionData: updatedData
            });
        } catch (error) {
            console.error("Error updating field:", error);
        }
        
        setEditField(null);
    };

    // If no institution data, don't render anything
    if (!institution) {
        return null;
    }

    const allFieldsEmpty = 
        institution.creator === "" && 
        institution.creator_position === "" && 
        institution.signer === "" && 
        institution.signer_position === "";

    return (
        <div className="detailItem">
            <h1>{INSTITUTION_CONSTANTS.HEADER}</h1>
            
            {/* Text Format Display */}
            <div className="signers-text-format">
                <div className="signer-line">
                    <span className="signer-label">Uzskaites Saraksta Sagatavoja </span>
                    <span 
                        className={`signer-value ${!allFieldsEmpty ? 'editable' : ''}`}
                        onClick={!allFieldsEmpty ? () => handleEditField("creator") : undefined}
                        onMouseEnter={() => !allFieldsEmpty && setTooltip(INSTITUTION_CONSTANTS.EDIT_CREATOR)}
                        onMouseLeave={() => setTooltip(null)}
                    >
                        {institution.creator || "___________"}
                    </span>
                    <span className="signer-label">, Amats </span>
                    <span 
                        className={`signer-value ${!allFieldsEmpty ? 'editable' : ''}`}
                        onClick={!allFieldsEmpty ? () => handleEditField("creator_position") : undefined}
                        onMouseEnter={() => !allFieldsEmpty && setTooltip(INSTITUTION_CONSTANTS.EDIT_CREATOR_POSITION)}
                        onMouseLeave={() => setTooltip(null)}
                    >
                        {institution.creator_position || "___________"}
                    </span>
                    <span className="signer-label">.</span>
                    
                    {!allFieldsEmpty && (
                        <button 
                            className="edit-icon-btn"
                            onClick={() => handleEditField("creator")}
                            onMouseEnter={() => setTooltip("Rediģēt sagatavotāju")}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            <i className="fas fa-edit"></i>
                        </button>
                    )}
                </div>

                <div className="signer-line">
                    <span className="signer-label">Uzskaietes Sarakstu Saskaņo </span>
                    <span 
                        className={`signer-value ${!allFieldsEmpty ? 'editable' : ''}`}
                        onClick={!allFieldsEmpty ? () => handleEditField("signer") : undefined}
                        onMouseEnter={() => !allFieldsEmpty && setTooltip(INSTITUTION_CONSTANTS.EDIT_SIGNER)}
                        onMouseLeave={() => setTooltip(null)}
                    >
                        {institution.signer || "___________"}
                    </span>
                    <span className="signer-label">, Amats </span>
                    <span 
                        className={`signer-value ${!allFieldsEmpty ? 'editable' : ''}`}
                        onClick={!allFieldsEmpty ? () => handleEditField("signer_position") : undefined}
                        onMouseEnter={() => !allFieldsEmpty && setTooltip(INSTITUTION_CONSTANTS.EDIT_SIGNER_POSITION)}
                        onMouseLeave={() => setTooltip(null)}
                    >
                        {institution.signer_position || "___________"}
                    </span>
                    <span className="signer-label">.</span>
                    
                    {!allFieldsEmpty && (
                        <button 
                            className="edit-icon-btn"
                            onClick={() => handleEditField("signer")}
                            onMouseEnter={() => setTooltip("Rediģēt saskaņotāju")}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            <i className="fas fa-edit"></i>
                        </button>
                    )}
                </div>

                {/* Tooltip */}
                {tooltip && (
                    <div className="tooltip">
                        {tooltip}
                    </div>
                )}
            </div>

            {/* Show the Add Signers button if all fields are empty */}
            {allFieldsEmpty && (
                <button onClick={togglePopup} className="add-signers-btn">
                    {INSTITUTION_CONSTANTS.ADD_ALL_FIELDS}
                </button>
            )}

            {signerFormVisibility && (
                <InstitutionSigners 
                    institutionId={institution.id}
                    projectId={projectId}
                    onClose={togglePopup}
                />
            )}

            {editField && (
                <InstitutionSigner
                    field={editField}
                    value={institution[editField] || ""}
                    onClose={() => setEditField(null)}
                    onSave={handleSaveField}
                />
            )}
        </div>
    );
};

export default Institution;