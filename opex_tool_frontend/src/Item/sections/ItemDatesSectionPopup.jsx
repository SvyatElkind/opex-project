import React, { useState } from 'react';
import SectionEditPopup from '../../components/SectionEditPopup';
import FieldHelp from '../../components/FieldHelp';
import { FieldError } from '../../components/ErrorDisplay';
import { useFormErrors } from '../../hooks/useFormErrors';
import {
    validateItemUpdate,
    getItemUpdatePayload,
    splitItemValidationErrors,
} from '../../Constants/itemConstants';
import { ITEM_CREATE_FORM_UI } from '../../Constants/Constants';
import CalendarComponent from '../../Utils/CalendarComponent';
import { formatDate } from '../../Utils/DateFormatter';
import '../CreateItemNavigable.css';

const OWN_FIELDS = ['start_date', 'end_date', 'date_indicator', 'date_note'];

/** Section popup: Datējums (start_date, end_date, date_indicator, date_note) */
const ItemDatesSectionPopup = ({ item, inventory, onUpdate, onClose, onOpenFullEdit }) => {
    const [startDate, setStartDate] = useState(item.start_date || '');
    const [endDate, setEndDate] = useState(item.end_date || '');
    const [dateIndicator, setDateIndicator] = useState(item.date_indicator || 'day');
    const [dateNote, setDateNote] = useState(item.date_note || '');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCrossSectionError, setIsCrossSectionError] = useState(false);
    const { generalError, setGeneralError, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    // CalendarComponent hands back Date objects, but start_date/end_date go to
    // the API as wire-format strings — a raw Date would serialise to a full ISO
    // timestamp and the backend's DateField rejects it. Format with the default
    // 'YYYY-MM-DD' and no dateIndicator, exactly as the full edit form does:
    // passing the indicator would yield '2025' / '03.2025' for year/month
    // precision, which the backend also rejects. CalendarComponent has already
    // snapped the Date to Jan 1 / Dec 31 (or first/last of month) for those.
    const handleDateChange = (newStartDate, newEndDate, view) => {
        setStartDate(newStartDate ? formatDate(newStartDate) : '');
        setEndDate(newEndDate ? formatDate(newEndDate) : '');
        setDateIndicator(view);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();
        setIsCrossSectionError(false);

        const payload = getItemUpdatePayload(item, inventory, {
            start_date: startDate, end_date: endDate, date_indicator: dateIndicator, date_note: dateNote,
        });
        const validation = validateItemUpdate(payload, inventory);

        if (!validation.isValid) {
            const { ownErrors, crossSectionMessage } = splitItemValidationErrors(validation.errors, OWN_FIELDS);
            if (Object.keys(ownErrors).length > 0) setFieldErrors(ownErrors);
            if (crossSectionMessage) {
                setGeneralError(crossSectionMessage);
                setIsCrossSectionError(true);
            }
            setIsSubmitting(false);
            return;
        }

        try {
            await onUpdate(item.id, payload);
            onClose();
        } catch (error) {
            setGeneralError(error.message || ITEM_CREATE_FORM_UI.ERROR_OCCURRED);
            setIsSubmitting(false);
        }
    };

    return (
        <SectionEditPopup
            title={`Rediģēt: ${ITEM_CREATE_FORM_UI.SECTION_DATES}`}
            helpChapterId="items" helpSectionId="create-item"
            onClose={onClose} onSubmit={handleSubmit} isSubmitting={isSubmitting}
            generalError={generalError} isCrossSectionError={isCrossSectionError} onOpenFullEdit={onOpenFullEdit}
        >
            <div className="create-item-nav-field">
                <CalendarComponent
                    onDateChange={handleDateChange}
                    startDate={startDate}
                    endDate={endDate}
                    dateIndicator={dateIndicator}
                    hideLabels={true}
                    compactPlaceholders={true}
                    usePortal={true}
                />
                <FieldError error={getFieldError('start_date')} />
                <FieldError error={getFieldError('end_date')} />
                <FieldError error={getFieldError('date_indicator')} />
            </div>

            <div className="create-item-nav-field">
                <label className="create-item-nav-field-label">
                    {ITEM_CREATE_FORM_UI.FIELD_DATUMA_PIEZĪMES}
                    <FieldHelp entity="item" field="date_note" />
                </label>
                <input
                    type="text"
                    value={dateNote}
                    onChange={(e) => setDateNote(e.target.value)}
                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_DATUMA_PIEZĪMES}
                    className="create-item-nav-input"
                />
                <FieldError error={getFieldError('date_note')} />
            </div>
        </SectionEditPopup>
    );
};

export default ItemDatesSectionPopup;
