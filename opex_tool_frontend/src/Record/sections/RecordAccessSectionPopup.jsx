import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SectionEditPopup from '../../components/SectionEditPopup';
import FieldHelp from '../../components/FieldHelp';
import { FieldError } from '../../components/ErrorDisplay';
import { useFormErrors } from '../../hooks/useFormErrors';
import { useUpdateRecord } from '../../hooks/useRecords';
import { parseDate, formatDate, DATEPICKER_FORMAT, DATE_PLACEHOLDER } from '../../Utils/DateFormatter';
import {
    validateTextRecordCreate,
    getRecordUpdatePayload,
    splitRecordValidationErrors,
    RECORD_VALIDATED_FIELDS,
    ACCESS_RESTRICTION_NOTES_MAX_LENGTH,
    USER_RESTRICTION_NOTES_MAX_LENGTH,
} from '../../Constants/recordConstants';
import { RECORD_CREATE_FORM_UI } from '../../Constants/Constants';
import '../CreateDocumentRecord.css';

const OWN_FIELDS = ['access_restriction', 'access_restriction_notes', 'access_restriction_date', 'user_restriction_notes'];

/** Section popup: Pieejamība (access_restriction, access_restriction_notes, access_restriction_date, user_restriction_notes) */
const RecordAccessSectionPopup = ({ record, item, projectId, onUpdate, onClose, onOpenFullEdit }) => {
    const updateRecordMutation = useUpdateRecord();
    const [accessRestriction, setAccessRestriction] = useState(record.access_restriction || '');
    const [accessRestrictionNotes, setAccessRestrictionNotes] = useState(record.access_restriction_notes || '');
    const [accessRestrictionDate, setAccessRestrictionDate] = useState(record.access_restriction_date || '');
    const [userRestrictionNotes, setUserRestrictionNotes] = useState(record.user_restriction_notes || '');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCrossSectionError, setIsCrossSectionError] = useState(false);
    const { generalError, setGeneralError, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    const handleAccessRestrictionChange = (value) => {
        setAccessRestriction(value);
        if (value === 'open') {
            setAccessRestrictionDate('');
            setAccessRestrictionNotes('');
            setUserRestrictionNotes('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();
        setIsCrossSectionError(false);

        const payload = getRecordUpdatePayload(record, {
            access_restriction: accessRestriction || '',
            access_restriction_notes: accessRestrictionNotes || '',
            access_restriction_date: accessRestrictionDate || null,
            user_restriction_notes: userRestrictionNotes || '',
        });
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
            if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
                setFieldErrors(error.fieldErrors);
            } else {
                setGeneralError(error.message || RECORD_CREATE_FORM_UI.ERROR_UPDATING_DOCUMENT);
            }
            setIsSubmitting(false);
        }
    };

    return (
        <SectionEditPopup
            title={`Rediģēt: ${RECORD_CREATE_FORM_UI.SECTION_ACCESS}`}
            helpChapterId="records" helpSectionId="create-record"
            onClose={onClose} onSubmit={handleSubmit} isSubmitting={isSubmitting}
            generalError={generalError} isCrossSectionError={isCrossSectionError} onOpenFullEdit={onOpenFullEdit}
        >
            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_PIEEJAMĪBA}
                    <FieldHelp entity="record" field="access_restriction" />
                </label>
                <select
                    value={accessRestriction}
                    onChange={(e) => handleAccessRestrictionChange(e.target.value)}
                    className="create-record-nav-select"
                >
                    <option value="">Izvēlieties</option>
                    <option value="open">{RECORD_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA}</option>
                    <option value="closed">{RECORD_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.IEROBEŽOTA}</option>
                </select>
                <FieldError error={getFieldError('access_restriction')} />
            </div>

            {accessRestriction && (
                <div className="create-record-nav-field">
                    <label className="create-record-nav-field-label">
                        {RECORD_CREATE_FORM_UI.FIELD_IEROBEŽOJUMA_PIEZĪMES}
                        <FieldHelp entity="record" field="access_restriction_notes" />
                    </label>
                    <textarea
                        value={accessRestrictionNotes}
                        onChange={(e) => setAccessRestrictionNotes(e.target.value)}
                        className="create-record-nav-textarea"
                        placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_IEROBEŽOJUMA_IEMESLI}
                        rows="3"
                        maxLength={ACCESS_RESTRICTION_NOTES_MAX_LENGTH}
                    />
                </div>
            )}

            {accessRestriction === 'closed' && (
                <>
                    <div className="create-record-nav-field">
                        <label className="create-record-nav-field-label create-record-nav-field-label-required">
                            {RECORD_CREATE_FORM_UI.FIELD_IEROBEŽOJUMA_DATUMS}
                            <FieldHelp entity="record" field="access_restriction_date" />
                        </label>
                        <DatePicker
                            selected={parseDate(accessRestrictionDate)}
                            onChange={(d) => setAccessRestrictionDate(formatDate(d, 'YYYY-MM-DD'))}
                            dateFormat={DATEPICKER_FORMAT}
                            placeholderText={DATE_PLACEHOLDER}
                            calendarStartDay={1}
                            autoComplete="off"
                            className="create-record-nav-input"
                            wrapperClassName="create-record-nav-datepicker-wrapper"
                            portalId="record-section-popup-datepicker-portal"
                            popperClassName="section-popup-datepicker-popper"
                        />
                        <FieldError error={getFieldError('access_restriction_date')} />
                    </div>

                    <div className="create-record-nav-field">
                        <label className="create-record-nav-field-label">
                            {RECORD_CREATE_FORM_UI.FIELD_LIETOTĀJA_IEROBEŽOJUMU_PIEZĪMES}
                            <FieldHelp entity="record" field="user_restriction_notes" />
                        </label>
                        <textarea
                            value={userRestrictionNotes}
                            onChange={(e) => setUserRestrictionNotes(e.target.value)}
                            className="create-record-nav-textarea"
                            rows="2"
                            maxLength={USER_RESTRICTION_NOTES_MAX_LENGTH}
                        />
                    </div>
                </>
            )}
        </SectionEditPopup>
    );
};

export default RecordAccessSectionPopup;
