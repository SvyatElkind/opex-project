import React, { useState } from "react";
import InstitutionSigners from "./IntitutionSigners"
import InstitutionSigner from "./InstitutionSigner";
import './Institution.css';
import { INSTITUTION_CONSTANTS } from "../Constants/Constnats";
import { useProject } from "../hooks/useProjects";
import { useUpdateInstitutionSignerField } from "../hooks/useInstitutions";

const Institution = ({ projectId }) => {
    // Get project data that contains institution
    const { data: projectData } = useProject(projectId);
    const institution = projectData?.institution;
    
    // Mutation for updating institution fields
    const updateInstitutionMutation = useUpdateInstitutionSignerField();
    
    // Local state
    const [signerFormVisibility, setSignerFormVisibility] = useState(false);
    const [editField, setEditField] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    
    const togglePopup = () => {
        setSignerFormVisibility(prev => !prev);
    };

    const handleEditField = (field) => setEditField(field);

    const handleSaveField = async (field, newValue) => {
        if (!institution) return;
        
        const updatedInstitutionData = { ...institution, [field]: newValue };
        
        try {
            await updateInstitutionMutation.mutateAsync({
                projectId,
                institutionId: institution.id,
                updatedData: updatedInstitutionData
            });
        } catch (error) {
            console.error("Failed to update field:", error);
            // Handle error (show alert, etc.)
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
            <table className="institution-table">
                <thead>
                    <tr>
                        <th>Lauki</th>
                        <th>Vērtības</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{INSTITUTION_CONSTANTS.CREATOR}</td>
                        <td>{institution.creator || INSTITUTION_CONSTANTS.EMPTY_FIELD} 
                            {!allFieldsEmpty && 
                                <button
                                onMouseEnter={() => { setTooltip(INSTITUTION_CONSTANTS.EDIT_CREATOR); }}
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => handleEditField("creator")}>
                                    <i className="fas fa-edit"></i>
                                </button>
                            }
                            {tooltip === INSTITUTION_CONSTANTS.EDIT_CREATOR && (
                                <div className="tooltip">
                                {tooltip}
                                </div>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{INSTITUTION_CONSTANTS.CREATOR_POSITION}</td>
                        <td>{institution.creator_position || INSTITUTION_CONSTANTS.EMPTY_FIELD} 
                            {!allFieldsEmpty && (
                                <button 
                                    onMouseEnter={() => { setTooltip(INSTITUTION_CONSTANTS.EDIT_CREATOR_POSITION); }} 
                                    onMouseLeave={() => setTooltip(null)}
                                    onClick={() => handleEditField("creator_position")}
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                            )}
                            {tooltip === INSTITUTION_CONSTANTS.EDIT_CREATOR_POSITION && (
                                <div className="tooltip">
                                {tooltip}
                                </div>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{INSTITUTION_CONSTANTS.SIGNER}</td>
                        <td>{institution.signer || INSTITUTION_CONSTANTS.EMPTY_FIELD}
                            {!allFieldsEmpty && 
                            <button
                                onMouseEnter={() => { setTooltip(INSTITUTION_CONSTANTS.EDIT_SIGNER);}} 
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => handleEditField("signer")}
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                            }
                            {tooltip === INSTITUTION_CONSTANTS.EDIT_SIGNER && (
                                <div className="tooltip">
                                {tooltip}
                                </div>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{INSTITUTION_CONSTANTS.SIGNER_POSITION}</td>
                        <td>{institution.signer_position || INSTITUTION_CONSTANTS.EMPTY_FIELD} 
                            {!allFieldsEmpty && 
                            <button
                                onMouseEnter={() => { setTooltip(INSTITUTION_CONSTANTS.EDIT_SIGNER_POSITION);}} 
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => handleEditField("signer_position")}
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                            }
                            {tooltip === INSTITUTION_CONSTANTS.EDIT_SIGNER_POSITION && (
                                <div className="tooltip">
                                {tooltip}
                                </div>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Show the Add Signers button if all fields are empty */}
            {allFieldsEmpty && (
                <button onClick={togglePopup} style={{ marginTop: '10px' }}>
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