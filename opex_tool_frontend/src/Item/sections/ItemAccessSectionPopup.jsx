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
import '../CreateItemNavigable.css';

const OWN_FIELDS = ['restriction', 'security_level', 'restriction_note', 'security_level_note'];

/** Section popup: Pieejamība un slepenība */
const ItemAccessSectionPopup = ({ item, inventory, onUpdate, onClose, onOpenFullEdit }) => {
    const [restriction, setRestriction] = useState(item.restriction || ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA);
    const [securityLevel, setSecurityLevel] = useState(item.security_level || ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.PUBLISKS);
    const [restrictionNote, setRestrictionNote] = useState(item.restriction_note || '');
    const [securityLevelNote, setSecurityLevelNote] = useState(item.security_level_note || '');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCrossSectionError, setIsCrossSectionError] = useState(false);
    const { generalError, setGeneralError, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();
        setIsCrossSectionError(false);

        const payload = getItemUpdatePayload(item, inventory, {
            restriction, security_level: securityLevel, restriction_note: restrictionNote, security_level_note: securityLevelNote,
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
            title={`Rediģēt: ${ITEM_CREATE_FORM_UI.SECTION_ACCESS}`}
            helpChapterId="items" helpSectionId="create-item"
            onClose={onClose} onSubmit={handleSubmit} isSubmitting={isSubmitting}
            generalError={generalError} isCrossSectionError={isCrossSectionError} onOpenFullEdit={onOpenFullEdit}
        >
            <div className="create-item-nav-field-row">
                <div className="create-item-nav-field">
                    <label className="create-item-nav-field-label">
                        {ITEM_CREATE_FORM_UI.FIELD_PIEEJAMĪBA}
                        <FieldHelp entity="item" field="restriction" />
                    </label>
                    <select
                        value={restriction}
                        onChange={(e) => setRestriction(e.target.value)}
                        className="create-item-nav-select"
                    >
                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA}>{ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA}</option>
                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.IEROBEŽOTA}>{ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.IEROBEŽOTA}</option>
                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.SENSITĪVI_DATI}>{ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.SENSITĪVI_DATI}</option>
                    </select>
                    <FieldError error={getFieldError('restriction')} />
                </div>

                <div className="create-item-nav-field">
                    <label className="create-item-nav-field-label">
                        {ITEM_CREATE_FORM_UI.FIELD_SLEPENĪBA}
                        <FieldHelp entity="item" field="security_level" />
                    </label>
                    <select
                        value={securityLevel}
                        onChange={(e) => setSecurityLevel(e.target.value)}
                        className="create-item-nav-select"
                    >
                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.PUBLISKS}>{ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.PUBLISKS}</option>
                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.IEKŠĒJS}>{ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.IEKŠĒJS}</option>
                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.KONFIDENCIĀLS}>{ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.KONFIDENCIĀLS}</option>
                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.SLEPENS}>{ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.SLEPENS}</option>
                    </select>
                    <FieldError error={getFieldError('security_level')} />
                </div>
            </div>

            <div className="create-item-nav-field">
                <label className="create-item-nav-field-label">
                    {ITEM_CREATE_FORM_UI.FIELD_PIEEJAMĪBAS_PIEZĪMES}
                    <FieldHelp entity="item" field="restriction_note" />
                </label>
                <textarea
                    value={restrictionNote}
                    onChange={(e) => setRestrictionNote(e.target.value)}
                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_PIEEJAMĪBAS_PIEZĪMES}
                    className="create-item-nav-textarea"
                    rows="2"
                />
                <FieldError error={getFieldError('restriction_note')} />
            </div>

            <div className="create-item-nav-field">
                <label className="create-item-nav-field-label">
                    {ITEM_CREATE_FORM_UI.FIELD_SLEPENĪBAS_PIEZĪMES}
                    <FieldHelp entity="item" field="security_level_note" />
                </label>
                <textarea
                    value={securityLevelNote}
                    onChange={(e) => setSecurityLevelNote(e.target.value)}
                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_SLEPENĪBAS_PIEZĪMES}
                    className="create-item-nav-textarea"
                    rows="2"
                />
            </div>
        </SectionEditPopup>
    );
};

export default ItemAccessSectionPopup;
