import React, { useState } from "react";
import { INSTITUTION_CONSTANTS } from "../Constants/Constants";
import InstitutionSigners from "./InstitutionSignersPopup";

const Institution = ({ institution, projectId }) => {
    const [signerFormVisibility, setSignerFormVisibility] = useState(false);

    const togglePopup = () => {
        setSignerFormVisibility(!signerFormVisibility);
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
                    <span className="signer-value">
                        {institution.creator || INSTITUTION_CONSTANTS.EMPTY_PLACEHOLDER}
                    </span>
                    <span className="signer-label">{INSTITUTION_CONSTANTS.POSITION_LABEL}</span>
                    <span className="signer-value">
                        {institution.creator_position || INSTITUTION_CONSTANTS.EMPTY_PLACEHOLDER}
                    </span>
                    <span className="signer-label">.</span>
                </div>

                <div className="signer-line">
                    <span className="signer-label">{INSTITUTION_CONSTANTS.SIGNER_LABEL}</span>
                    <span className="signer-value">
                        {institution.signer || INSTITUTION_CONSTANTS.EMPTY_PLACEHOLDER}
                    </span>
                    <span className="signer-label">{INSTITUTION_CONSTANTS.POSITION_LABEL}</span>
                    <span className="signer-value">
                        {institution.signer_position || INSTITUTION_CONSTANTS.EMPTY_PLACEHOLDER}
                    </span>
                    <span className="signer-label">.</span>
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
        </div>
    );
};

export default Institution;
