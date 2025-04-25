import React, { useEffect, useState } from "react";
import InstitutionSigners from "./IntitutionSigners"; // Ensure the correct import
import Project_API from "../API/Project_API";
import InstitutionSigner from "./InstitutionSigner";
import Institution_API from "../API/Institution_API";
import './Institution.css';
import { INSTITUTION_CONSTANTS } from "../Constants/Constnats";

const Institution = ({ institution }) => {
    const [institutionData, setInstitutionData] = useState(institution);
    const [signerFormVisibility, setSignerFormVisibility] = useState(false);
    const [editField, setEditField] = useState(null);
    const [tooltip, setTooltip] = useState(null); // State for tooltip
    const [tooltipContent, setTooltipContent] = useState(""); // Content for tooltip
    const projectAPI = Project_API();
    const institutionAPI = Institution_API();

    const togglePopup = () => {
        setSignerFormVisibility(prev => !prev);
    };

    const refreshInstitutionData = async () => {
        const [success, data] = await projectAPI.get_project(institution.project);
        if (success) {
            setInstitutionData(data.institution); // Update institution data
        } else {
            console.error("Failed to fetch institution data");
        }
    };

    const handleEditField = (field) => setEditField(field);

    const handleSaveField = async (field, newValue) => {
        const updatedInstitutionData = { ...institutionData, [field]: newValue };
        
        // Call API to update the field
        const [success, response] = await institutionAPI.updateSignerField(institution.project, institution.id, updatedInstitutionData);
        if (success) {
            setInstitutionData(updatedInstitutionData);
        } else {
            console.error("Failed to update signer data: " + response);
        }
        
        setEditField(null);
    };

    const allFieldsEmpty = institutionData.creator === "" && institutionData.creator_position === "" && institutionData.signer === "" && institutionData.signer_position === "";
    useEffect(() => {
        // Initial data fetch if required
    }, []);

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
                        <td>{institutionData.creator || INSTITUTION_CONSTANTS.EMPTY_FIELD} 
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
                        <td>{institutionData.creator_position || INSTITUTION_CONSTANTS.EMPTY_FIELD} 
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
                        <td>{institutionData.signer || INSTITUTION_CONSTANTS.EMPTY_FIELD}
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
                        <td>{institutionData.signer_position || INSTITUTION_CONSTANTS.EMPTY_FIELD} 
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
                    institution={institutionData} 
                    onClose={togglePopup}
                    onSignersAdded={refreshInstitutionData}
                />
            )}

            {editField && (
                <InstitutionSigner
                    field={editField}
                    value={institutionData[editField] || ""}
                    onClose={() => setEditField(null)}
                    onSave={handleSaveField}
                />
            )}

        </div>
    );
};

export default Institution;