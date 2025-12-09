// src/Institution/InstitutionSignersPopup.jsx
// Popup for adding/editing institution signers with proper validation

import React, { useState } from "react";
import { GeneralError, GeneralSuccess, FieldError } from '../components/ErrorDisplay';
import { useFormErrors } from '../hooks/useFormErrors';
import { useAddInstitutionSigners } from "../hooks/useInstitutions";
import { useProject } from "../hooks/useProjects";
import {
    CREATOR_MAX_LENGTH,
    CREATOR_POSITION_MAX_LENGTH,
    SIGNER_MAX_LENGTH,
    SIGNER_POSITION_MAX_LENGTH,
    validateInstitutionUpdate,
    getRemainingChars
} from '../Constants/institutionConstants';
import './InstitutionSignersPopup.css';

const InstitutionSignersPopup = ({ institutionId, projectId, onClose }) => {
    // Get institution from project data
    const { data: projectData } = useProject(projectId);
    const institution = projectData?.institution;

    // Mutation for adding signers
    const addSignersMutation = useAddInstitutionSigners();

    // Local state - pre-fill with existing values if available
    const [creatorName, setCreatorName] = useState(institution?.creator || "");
    const [creatorPosition, setCreatorPosition] = useState(institution?.creator_position || "");
    const [signerName, setSignerName] = useState(institution?.signer || "");
    const [signerPosition, setSignerPosition] = useState(institution?.signer_position || "");
    const [successMessage, setSuccessMessage] = useState("");

    // Error handling
    const { generalError, setGeneralError, setApiErrors, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    const handleSubmit = async (event) => {
        event.preventDefault();
        clearErrors();

        const signersData = {
            creator: creatorName.trim(),
            creator_position: creatorPosition.trim(),
            signer: signerName.trim(),
            signer_position: signerPosition.trim()
        };

        // Validate before submission
        const validation = validateInstitutionUpdate(signersData);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            return;
        }

        try {
            await addSignersMutation.mutateAsync({
                projectId,
                institutionId,
                signersData
            });

            setSuccessMessage("Parakstītāju informācija saglabāta veiksmīgi!");

            // Close popup after small delay
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (error) {
            if (error.fieldErrors) {
                setApiErrors({ ...error.fieldErrors, error: error.message });
            } else {
                setGeneralError(error.message);
            }
            setSuccessMessage("");
        }
    };

    if (!institution) {
        return null;
    }

    return (
        <div className="inst-signers-overlay">
            <div className="inst-signers-modal">
                {/* Header */}
                <div className="inst-signers-header">
                    <div className="inst-signers-header-content">
                        <i className="fas fa-user-edit inst-signers-header-icon"></i>
                        <div>
                            <h2 className="inst-signers-title">Institūcijas Parakstītāji</h2>
                            <p className="inst-signers-subtitle">{institution.name}</p>
                        </div>
                    </div>
                    <button
                        className="inst-signers-close-btn"
                        onClick={onClose}
                        aria-label="Aizvērt"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Content */}
                <form className="inst-signers-content" onSubmit={handleSubmit}>
                    {generalError && (
                        <GeneralError message={generalError} onClose={clearErrors} />
                    )}

                    {successMessage && (
                        <GeneralSuccess message={successMessage} onClose={() => setSuccessMessage('')} />
                    )}

                    {/* Creator Section */}
                    <div className="inst-signers-section">
                        <h3 className="inst-signers-section-title">
                            <i className="fas fa-user"></i>
                            Izveidotājs
                        </h3>

                        <div className="inst-signers-field">
                            <label className="inst-signers-label" htmlFor="creatorName">
                                Vārds, Uzvārds <span className="inst-signers-required">*</span>
                            </label>
                            <input
                                id="creatorName"
                                type="text"
                                className={`inst-signers-input ${getFieldError('creator') ? 'inst-signers-input-error' : ''}`}
                                value={creatorName}
                                onChange={(e) => setCreatorName(e.target.value)}
                                maxLength={CREATOR_MAX_LENGTH}
                                placeholder="Ievadiet izveidotāja vārdu un uzvārdu"
                            />
                            {getRemainingChars(creatorName, CREATOR_MAX_LENGTH) < 5 && (
                                <div className="inst-signers-field-info">
                                    <span className="inst-signers-counter inst-signers-counter-warning">
                                        {getRemainingChars(creatorName, CREATOR_MAX_LENGTH)} simboli atlika
                                    </span>
                                </div>
                            )}
                            <FieldError error={getFieldError('creator')} />
                        </div>

                        <div className="inst-signers-field">
                            <label className="inst-signers-label" htmlFor="creatorPosition">
                                Amats <span className="inst-signers-required">*</span>
                            </label>
                            <input
                                id="creatorPosition"
                                type="text"
                                className={`inst-signers-input ${getFieldError('creator_position') ? 'inst-signers-input-error' : ''}`}
                                value={creatorPosition}
                                onChange={(e) => setCreatorPosition(e.target.value)}
                                maxLength={CREATOR_POSITION_MAX_LENGTH}
                                placeholder="Ievadiet izveidotāja amatu"
                            />
                            {getRemainingChars(creatorPosition, CREATOR_POSITION_MAX_LENGTH) < 5 && (
                                <div className="inst-signers-field-info">
                                    <span className="inst-signers-counter inst-signers-counter-warning">
                                        {getRemainingChars(creatorPosition, CREATOR_POSITION_MAX_LENGTH)} simboli atlika
                                    </span>
                                </div>
                            )}
                            <FieldError error={getFieldError('creator_position')} />
                        </div>
                    </div>

                    {/* Signer Section */}
                    <div className="inst-signers-section">
                        <h3 className="inst-signers-section-title">
                            <i className="fas fa-signature"></i>
                            Parakstītājs
                        </h3>

                        <div className="inst-signers-field">
                            <label className="inst-signers-label" htmlFor="signerName">
                                Vārds, Uzvārds <span className="inst-signers-required">*</span>
                            </label>
                            <input
                                id="signerName"
                                type="text"
                                className={`inst-signers-input ${getFieldError('signer') ? 'inst-signers-input-error' : ''}`}
                                value={signerName}
                                onChange={(e) => setSignerName(e.target.value)}
                                maxLength={SIGNER_MAX_LENGTH}
                                placeholder="Ievadiet parakstītāja vārdu un uzvārdu"
                            />
                            {getRemainingChars(signerName, SIGNER_MAX_LENGTH) < 5 && (
                                <div className="inst-signers-field-info">
                                    <span className="inst-signers-counter inst-signers-counter-warning">
                                        {getRemainingChars(signerName, SIGNER_MAX_LENGTH)} simboli atlika
                                    </span>
                                </div>
                            )}
                            <FieldError error={getFieldError('signer')} />
                        </div>

                        <div className="inst-signers-field">
                            <label className="inst-signers-label" htmlFor="signerPosition">
                                Amats <span className="inst-signers-required">*</span>
                            </label>
                            <input
                                id="signerPosition"
                                type="text"
                                className={`inst-signers-input ${getFieldError('signer_position') ? 'inst-signers-input-error' : ''}`}
                                value={signerPosition}
                                onChange={(e) => setSignerPosition(e.target.value)}
                                maxLength={SIGNER_POSITION_MAX_LENGTH}
                                placeholder="Ievadiet parakstītāja amatu"
                            />
                            {getRemainingChars(signerPosition, SIGNER_POSITION_MAX_LENGTH) < 5 && (
                                <div className="inst-signers-field-info">
                                    <span className="inst-signers-counter inst-signers-counter-warning">
                                        {getRemainingChars(signerPosition, SIGNER_POSITION_MAX_LENGTH)} simboli atlika
                                    </span>
                                </div>
                            )}
                            <FieldError error={getFieldError('signer_position')} />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="inst-signers-footer">
                    <button
                        className="inst-signers-btn inst-signers-btn-cancel"
                        type="button"
                        onClick={onClose}
                    >
                        Atcelt
                    </button>
                    <button
                        className="inst-signers-btn inst-signers-btn-save"
                        type="submit"
                        onClick={handleSubmit}
                        disabled={addSignersMutation.isPending}
                    >
                        {addSignersMutation.isPending ? (
                            <>
                                <span className="inst-signers-spinner"></span>
                                Saglabā...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i>
                                Saglabāt
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstitutionSignersPopup;
