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
    REG_NR_MAX_LENGTH,
    GROUP_MAX_LENGTH,
} from '../../Constants/recordConstants';
import { RECORD_CREATE_FORM_UI } from '../../Constants/Constants';
import '../CreateDocumentRecord.css';

const OWN_FIELDS = ['title', 'date', 'reg_nr', 'group'];

/** Section popup: Pamata informācija (title, date, reg_nr, group) */
const RecordBasicSectionPopup = ({ record, item, projectId, onUpdate, onClose, onOpenFullEdit }) => {
    const updateRecordMutation = useUpdateRecord();
    const [title, setTitle] = useState(record.title || '');
    const [date, setDate] = useState(record.date || '');
    const [regNr, setRegNr] = useState(record.reg_nr || '');
    const [group, setGroup] = useState(record.group || '');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCrossSectionError, setIsCrossSectionError] = useState(false);
    const { generalError, setGeneralError, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();
        setIsCrossSectionError(false);

        const payload = getRecordUpdatePayload(record, { title, date, reg_nr: regNr, group });
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
            title={`Rediģēt: ${RECORD_CREATE_FORM_UI.SECTION_BASIC}`}
            helpChapterId="records" helpSectionId="create-record"
            onClose={onClose} onSubmit={handleSubmit} isSubmitting={isSubmitting}
            generalError={generalError} isCrossSectionError={isCrossSectionError} onOpenFullEdit={onOpenFullEdit}
        >
            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label create-record-nav-field-label-required">
                    {RECORD_CREATE_FORM_UI.FIELD_NOSAUKUMS}
                    <FieldHelp entity="record" field="title" />
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="create-record-nav-input"
                    placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_DOKUMENTA_NOSAUKUMS}
                />
                <FieldError error={getFieldError('title')} />
            </div>

            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label create-record-nav-field-label-required">
                    {RECORD_CREATE_FORM_UI.FIELD_DATUMS}
                    <FieldHelp entity="record" field="date" />
                </label>
                <DatePicker
                    selected={parseDate(date)}
                    onChange={(d) => setDate(formatDate(d, 'YYYY-MM-DD'))}
                    dateFormat={DATEPICKER_FORMAT}
                    placeholderText={DATE_PLACEHOLDER}
                    calendarStartDay={1}
                    autoComplete="off"
                    className="create-record-nav-input"
                    wrapperClassName="create-record-nav-datepicker-wrapper"
                    portalId="record-section-popup-datepicker-portal"
                    popperClassName="section-popup-datepicker-popper"
                />
                <FieldError error={getFieldError('date')} />
            </div>

            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_REĢISTRĀCIJAS_NR}
                    <FieldHelp entity="record" field="reg_nr" />
                </label>
                <input
                    type="text"
                    value={regNr}
                    onChange={(e) => setRegNr(e.target.value)}
                    className="create-record-nav-input"
                    placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_REG_NR}
                    maxLength={REG_NR_MAX_LENGTH}
                />
                <FieldError error={getFieldError('reg_nr')} />
            </div>

            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_GRUPA}
                    <FieldHelp entity="record" field="group" />
                </label>
                <input
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="create-record-nav-input"
                    placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_GRUPA}
                    maxLength={GROUP_MAX_LENGTH}
                />
            </div>
        </SectionEditPopup>
    );
};

export default RecordBasicSectionPopup;
