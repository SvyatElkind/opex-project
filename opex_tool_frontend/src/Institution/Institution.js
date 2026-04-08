import React, { useState } from "react";
import { INSTITUTION_CONSTANTS } from "../Constants/Constants";
import { useNotification } from "../components/Notification";
import InstitutionSigner from "./InstitutionSigner";
import InstitutionSigners from "./InstitutionSignersPopup";
import { useUpdateInstitutionSignerField} from "../hooks/useInstitutions";

const Institution = ({ institution, projectId }) => {
    const [editField, setEditField] = useState(null);
    const [signerFormVisibility, setSignerFormVisibility] = useState(false);

    const updateFieldMutation = useUpdateInstitutionSignerField();
    const { notify } = useNotification();

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
            setEditField(null);
        } catch (error) {
            notify.error(INSTITUTION_CONSTANTS.ERROR_SAVING_PREFIX + (error.message || INSTITUTION_CONSTANTS.ERROR_UNKNOWN));
        }
    };

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
            
            <div className="signers-text-format">
                <div className="signer-line">
                    <span className="signer-label">{INSTITUTION_CONSTANTS.CREATOR_LABEL}</span>
                    <span 
                        className={`signer-value ${!allFieldsEmpty ? 'editable' : ''}`}
                        onClick={!allFieldsEmpty ? () => handleEditField("creator") : undefined}
                        title={!allFieldsEmpty ? INSTITUTION_CONSTANTS.EDIT_CREATOR : undefined}
                    >
                        {institution.creator || INSTITUTION_CONSTANTS.EMPTY_PLACEHOLDER}
                    </span>
                    <span className="signer-label">{INSTITUTION_CONSTANTS.POSITION_LABEL}</span>
                    <span
                        className={`signer-value ${!allFieldsEmpty ? 'editable' : ''}`}
                        onClick={!allFieldsEmpty ? () => handleEditField("creator_position") : undefined}
                        title={!allFieldsEmpty ? INSTITUTION_CONSTANTS.EDIT_CREATOR_POSITION : undefined}
                    >
                        {institution.creator_position || INSTITUTION_CONSTANTS.EMPTY_PLACEHOLDER}
                    </span>
                    <span className="signer-label">.</span>
                    
                    {!allFieldsEmpty && (
                        <button 
                            className="edit-icon-btn"
                            onClick={() => handleEditField("creator")}
                            title={INSTITUTION_CONSTANTS.EDIT_CREATOR_TITLE}
                        >
                            <i className="fas fa-edit"></i>
                        </button>
                    )}
                </div>

                <div className="signer-line">
                    <span className="signer-label">{INSTITUTION_CONSTANTS.SIGNER_LABEL}</span>
                    <span 
                        className={`signer-value ${!allFieldsEmpty ? 'editable' : ''}`}
                        onClick={!allFieldsEmpty ? () => handleEditField("signer") : undefined}
                        title={!allFieldsEmpty ? INSTITUTION_CONSTANTS.EDIT_SIGNER : undefined}
                    >
                        {institution.signer || INSTITUTION_CONSTANTS.EMPTY_PLACEHOLDER}
                    </span>
                    <span className="signer-label">{INSTITUTION_CONSTANTS.POSITION_LABEL}</span>
                    <span
                        className={`signer-value ${!allFieldsEmpty ? 'editable' : ''}`}
                        onClick={!allFieldsEmpty ? () => handleEditField("signer_position") : undefined}
                        title={!allFieldsEmpty ? INSTITUTION_CONSTANTS.EDIT_SIGNER_POSITION : undefined}
                    >
                        {institution.signer_position || INSTITUTION_CONSTANTS.EMPTY_PLACEHOLDER}
                    </span>
                    <span className="signer-label">.</span>
                    
                    {!allFieldsEmpty && (
                        <button 
                            className="edit-icon-btn"
                            onClick={() => handleEditField("signer")}
                            title={INSTITUTION_CONSTANTS.EDIT_SIGNER_TITLE}
                        >
                            <i className="fas fa-edit"></i>
                        </button>
                    )}
                </div>

            </div>

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