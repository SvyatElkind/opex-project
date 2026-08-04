import React, { useState } from 'react';
import SectionEditPopup from '../../components/SectionEditPopup';
import FieldHelp from '../../components/FieldHelp';
import { FieldError } from '../../components/ErrorDisplay';
import { useFormErrors } from '../../hooks/useFormErrors';
import {
    validateItemUpdate,
    getItemUpdatePayload,
    splitItemValidationErrors,
    ANNOTATION_MAX_LENGTH,
} from '../../Constants/itemConstants';
import { ITEM_CREATE_FORM_UI } from '../../Constants/Constants';
import '../CreateItemNavigable.css';

const OWN_FIELDS = ['annotation'];

/** Section popup: Saturs (annotation) */
const ItemContentSectionPopup = ({ item, inventory, onUpdate, onClose, onOpenFullEdit }) => {
    const [annotation, setAnnotation] = useState(item.annotation || '');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCrossSectionError, setIsCrossSectionError] = useState(false);
    const { generalError, setGeneralError, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();
        setIsCrossSectionError(false);

        const payload = getItemUpdatePayload(item, inventory, { annotation });
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
            title="Rediģēt: Saturs"
            helpChapterId="items" helpSectionId="create-item"
            onClose={onClose} onSubmit={handleSubmit} isSubmitting={isSubmitting}
            generalError={generalError} isCrossSectionError={isCrossSectionError} onOpenFullEdit={onOpenFullEdit}
        >
            <div className="create-item-nav-field">
                <label className="create-item-nav-field-label">
                    {ITEM_CREATE_FORM_UI.FIELD_SATURS}
                    <FieldHelp entity="item" field="annotation" />
                </label>
                <textarea
                    value={annotation}
                    onChange={(e) => setAnnotation(e.target.value)}
                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_SATURS}
                    className="create-item-nav-textarea"
                    rows="5"
                    maxLength={ANNOTATION_MAX_LENGTH}
                />
                <FieldError error={getFieldError('annotation')} />
            </div>
        </SectionEditPopup>
    );
};

export default ItemContentSectionPopup;
