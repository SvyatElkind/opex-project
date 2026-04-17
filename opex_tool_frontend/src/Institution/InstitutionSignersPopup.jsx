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
import { INSTITUTION_ADDITIONAL_UI } from '../Constants/Constants';
import './InstitutionSignersPopup.css';
import HelpButton from '../Help/HelpButton';

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

            setSuccessMessage(INSTITUTION_ADDITIONAL_UI.SUCCESS_SAVED);

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
                        <div>
                            <h2 className="inst-signers-title">{INSTITUTION_ADDITIONAL_UI.MODAL_TITLE}</h2>
                            <p className="inst-signers-subtitle">{institution.name}</p>
                        </div>
                    </div>
                    <HelpButton chapterId="projects" iconOnly={true} className="small" />
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
                            {INSTITUTION_ADDITIONAL_UI.SECTION_IZVEIDOTĀJS}
                        </h3>

                        <div className="inst-signers-field">
                            <label className="inst-signers-label" htmlFor="creatorName">
                                {INSTITUTION_ADDITIONAL_UI.FIELD_VĀRDS_UZVĀRDS} <span className="inst-signers-required">*</span>
                            </label>
                            <div className="inst-signers-input-wrapper">
                                <input
                                    id="creatorName"
                                    type="text"
                                    className={`inst-signers-input ${!creatorName ? 'empty' : ''} ${getFieldError('creator') ? 'inst-signers-input-error' : ''}`}
                                    value={creatorName}
                                    onChange={(e) => setCreatorName(e.target.value)}
                                    maxLength={CREATOR_MAX_LENGTH}
                                    placeholder={INSTITUTION_ADDITIONAL_UI.PLACEHOLDER_IZVEIDOTĀJA_VĀRDS}
                                />
                                {getRemainingChars(creatorName, CREATOR_MAX_LENGTH) < 5 && (
                                    <div className="inst-signers-field-info">
                                        <span className="inst-signers-counter inst-signers-counter-warning">
                                            {getRemainingChars(creatorName, CREATOR_MAX_LENGTH)} {INSTITUTION_ADDITIONAL_UI.SIMBOLI_ATLIKA}
                                        </span>
                                    </div>
                                )}
                                <FieldError error={getFieldError('creator')} />
                            </div>
                        </div>

                        <div className={`inst-signers-field ${creatorPosition.length > 40 ? 'expanded' : ''}`}>
                            <label className="inst-signers-label" htmlFor="creatorPosition">
                                {INSTITUTION_ADDITIONAL_UI.FIELD_AMATS} <span className="inst-signers-required">*</span>
                            </label>
                            <div className="inst-signers-input-wrapper">
                                <textarea
                                    id="creatorPosition"
                                    className={`inst-signers-position-input ${creatorPosition.length > 40 ? 'expanded' : ''} ${!creatorPosition ? 'empty' : ''} ${getFieldError('creator_position') ? 'inst-signers-input-error' : ''}`}
                                    value={creatorPosition}
                                    onChange={(e) => setCreatorPosition(e.target.value)}
                                    maxLength={CREATOR_POSITION_MAX_LENGTH}
                                    placeholder={INSTITUTION_ADDITIONAL_UI.PLACEHOLDER_IZVEIDOTĀJA_AMATS}
                                    rows={1}
                                />
                                {getRemainingChars(creatorPosition, CREATOR_POSITION_MAX_LENGTH) < 5 && (
                                    <div className="inst-signers-field-info">
                                        <span className="inst-signers-counter inst-signers-counter-warning">
                                            {getRemainingChars(creatorPosition, CREATOR_POSITION_MAX_LENGTH)} {INSTITUTION_ADDITIONAL_UI.SIMBOLI_ATLIKA}
                                        </span>
                                    </div>
                                )}
                                <FieldError error={getFieldError('creator_position')} />
                            </div>
                        </div>
                    </div>

                    {/* Signer Section */}
                    <div className="inst-signers-section">
                        <h3 className="inst-signers-section-title">
                            {INSTITUTION_ADDITIONAL_UI.SECTION_PARAKSTĪTĀJS}
                        </h3>

                        <div className="inst-signers-field">
                            <label className="inst-signers-label" htmlFor="signerName">
                                {INSTITUTION_ADDITIONAL_UI.FIELD_VĀRDS_UZVĀRDS} <span className="inst-signers-required">*</span>
                            </label>
                            <div className="inst-signers-input-wrapper">
                                <input
                                    id="signerName"
                                    type="text"
                                    className={`inst-signers-input ${!signerName ? 'empty' : ''} ${getFieldError('signer') ? 'inst-signers-input-error' : ''}`}
                                    value={signerName}
                                    onChange={(e) => setSignerName(e.target.value)}
                                    maxLength={SIGNER_MAX_LENGTH}
                                    placeholder={INSTITUTION_ADDITIONAL_UI.PLACEHOLDER_PARAKSTĪTĀJA_VĀRDS}
                                />
                                {getRemainingChars(signerName, SIGNER_MAX_LENGTH) < 5 && (
                                    <div className="inst-signers-field-info">
                                        <span className="inst-signers-counter inst-signers-counter-warning">
                                            {getRemainingChars(signerName, SIGNER_MAX_LENGTH)} {INSTITUTION_ADDITIONAL_UI.SIMBOLI_ATLIKA}
                                        </span>
                                    </div>
                                )}
                                <FieldError error={getFieldError('signer')} />
                            </div>
                        </div>

                        <div className={`inst-signers-field ${signerPosition.length > 40 ? 'expanded' : ''}`}>
                            <label className="inst-signers-label" htmlFor="signerPosition">
                                {INSTITUTION_ADDITIONAL_UI.FIELD_AMATS} <span className="inst-signers-required">*</span>
                            </label>
                            <div className="inst-signers-input-wrapper">
                                <textarea
                                    id="signerPosition"
                                    className={`inst-signers-position-input ${signerPosition.length > 40 ? 'expanded' : ''} ${!signerPosition ? 'empty' : ''} ${getFieldError('signer_position') ? 'inst-signers-input-error' : ''}`}
                                    value={signerPosition}
                                    onChange={(e) => setSignerPosition(e.target.value)}
                                    maxLength={SIGNER_POSITION_MAX_LENGTH}
                                    placeholder={INSTITUTION_ADDITIONAL_UI.PLACEHOLDER_PARAKSTĪTĀJA_AMATS}
                                    rows={1}
                                />
                                {getRemainingChars(signerPosition, SIGNER_POSITION_MAX_LENGTH) < 5 && (
                                    <div className="inst-signers-field-info">
                                        <span className="inst-signers-counter inst-signers-counter-warning">
                                            {getRemainingChars(signerPosition, SIGNER_POSITION_MAX_LENGTH)} {INSTITUTION_ADDITIONAL_UI.SIMBOLI_ATLIKA}
                                        </span>
                                    </div>
                                )}
                                <FieldError error={getFieldError('signer_position')} />
                            </div>
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
                        {INSTITUTION_ADDITIONAL_UI.CANCEL_BTN}
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
                                {INSTITUTION_ADDITIONAL_UI.SAVING_BTN}
                            </>
                        ) : (
                            <>
                                {INSTITUTION_ADDITIONAL_UI.SAVE_BTN}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstitutionSignersPopup;
