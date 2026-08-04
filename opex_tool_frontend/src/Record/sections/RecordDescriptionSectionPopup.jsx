import React, { useState } from 'react';
import SectionEditPopup from '../../components/SectionEditPopup';
import FieldHelp from '../../components/FieldHelp';
import { useFormErrors } from '../../hooks/useFormErrors';
import { useUpdateRecord } from '../../hooks/useRecords';
import {
    validateTextRecordCreate,
    getRecordUpdatePayload,
    splitRecordValidationErrors,
    RECORD_VALIDATED_FIELDS,
    ANNOTATION_MAX_LENGTH,
    NOTES_MAX_LENGTH,
    TECH_INFO_MAX_LENGTH,
} from '../../Constants/recordConstants';
import { RECORD_CREATE_FORM_UI } from '../../Constants/Constants';
import '../CreateDocumentRecord.css';

const OWN_FIELDS = ['annotation', 'notes', 'tech_info'];

/** Section popup: Apraksts (annotation, notes, tech_info) */
const RecordDescriptionSectionPopup = ({ record, item, projectId, onUpdate, onClose, onOpenFullEdit }) => {
    const updateRecordMutation = useUpdateRecord();
    const [annotation, setAnnotation] = useState(record.annotation || '');
    const [notes, setNotes] = useState(record.notes || '');
    const [techInfo, setTechInfo] = useState(record.tech_info || '');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCrossSectionError, setIsCrossSectionError] = useState(false);
    const { generalError, setGeneralError, clearErrors, setFieldErrors } = useFormErrors();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();
        setIsCrossSectionError(false);

        const payload = getRecordUpdatePayload(record, { annotation, notes, tech_info: techInfo });
        const validationData = {};
        RECORD_VALIDATED_FIELDS.forEach((field) => { validationData[field] = payload[field]; });
        const validation = validateTextRecordCreate(validationData, item);

        if (!validation.isValid) {
            const { ownErrors, crossSectionMessage } = splitRecordValidationErrors(validation.errors, OWN_FIELDS);
            if (Object.keys(ownErrors).length > 0) setFieldErrors(ownErrors);
            if (crossSectionMessage) {
                setGeneralError(crossSectionMessage);
                setIsCrossSectionError(true);
            }
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await updateRecordMutation.mutateAsync({ projectId, recordId: record.id, recordData: payload });
            if (onUpdate) onUpdate(result);
            onClose();
        } catch (error) {
            setGeneralError(error.message || RECORD_CREATE_FORM_UI.ERROR_UPDATING_DOCUMENT);
            setIsSubmitting(false);
        }
    };

    return (
        <SectionEditPopup
            title={`Rediģēt: ${RECORD_CREATE_FORM_UI.SECTION_DESCRIPTION}`}
            helpChapterId="records" helpSectionId="create-record"
            onClose={onClose} onSubmit={handleSubmit} isSubmitting={isSubmitting}
            generalError={generalError} isCrossSectionError={isCrossSectionError} onOpenFullEdit={onOpenFullEdit}
        >
            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_ANOTĀCIJA}
                    <FieldHelp entity="record" field="annotation" />
                </label>
                <textarea
                    value={annotation}
                    onChange={(e) => setAnnotation(e.target.value)}
                    className="create-record-nav-textarea"
                    placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_DOKUMENTA_ANOTĀCIJA}
                    rows="4"
                    maxLength={ANNOTATION_MAX_LENGTH}
                />
            </div>

            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_PIEZĪMES}
                    <FieldHelp entity="record" field="notes" />
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="create-record-nav-textarea"
                    placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_PAPILDUS_PIEZĪMES}
                    rows="3"
                    maxLength={NOTES_MAX_LENGTH}
                />
            </div>

            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_TEHNISKĀ_INFORMĀCIJA}
                    <FieldHelp entity="record" field="tech_info" />
                </label>
                <textarea
                    value={techInfo}
                    onChange={(e) => setTechInfo(e.target.value)}
                    className="create-record-nav-textarea"
                    placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_TEHNISKĀS_DETAĻAS}
                    rows="3"
                    maxLength={TECH_INFO_MAX_LENGTH}
                />
            </div>
        </SectionEditPopup>
    );
};

export default RecordDescriptionSectionPopup;
