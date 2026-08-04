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

const OWN_FIELDS = ['size', 'unit_of_measure', 'copy', 'archival_history', 'sistematisation'];

/** Section popup: Tehniskā informācija (size, unit_of_measure, copy, archival_history, sistematisation) */
const ItemTechnicalSectionPopup = ({ item, inventory, onUpdate, onClose, onOpenFullEdit }) => {
    const [size, setSize] = useState(item.size || 0);
    const [unitOfMeasure, setUnitOfMeasure] = useState(item.unit_of_measure || ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.LAPAS);
    const [copy, setCopy] = useState(item.copy || '');
    const [archivalHistory, setArchivalHistory] = useState(item.archival_history || '');
    const [sistematisation, setSistematisation] = useState(item.sistematisation || '');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCrossSectionError, setIsCrossSectionError] = useState(false);
    const { generalError, setGeneralError, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();
        setIsCrossSectionError(false);

        const payload = getItemUpdatePayload(item, inventory, {
            size, unit_of_measure: unitOfMeasure, copy, archival_history: archivalHistory, sistematisation,
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
            title={`Rediģēt: ${ITEM_CREATE_FORM_UI.SECTION_TECHNICAL}`}
            helpChapterId="items" helpSectionId="create-item"
            onClose={onClose} onSubmit={handleSubmit} isSubmitting={isSubmitting}
            generalError={generalError} isCrossSectionError={isCrossSectionError} onOpenFullEdit={onOpenFullEdit}
        >
            {!inventory.electronic && (
                <div className="create-item-nav-field-row">
                    <div className="create-item-nav-field">
                        <label className="create-item-nav-field-label">
                            {ITEM_CREATE_FORM_UI.FIELD_APJOMS}
                            <FieldHelp entity="item" field="size" />
                        </label>
                        <input
                            type="number"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            placeholder="0"
                            min="0"
                            className="create-item-nav-input"
                        />
                    </div>

                    <div className="create-item-nav-field">
                        <label className="create-item-nav-field-label">
                            {ITEM_CREATE_FORM_UI.FIELD_APJOMA_MĒRVIENĪBA}
                            <FieldHelp entity="item" field="unit_of_measure" />
                        </label>
                        <select
                            value={unitOfMeasure}
                            onChange={(e) => setUnitOfMeasure(e.target.value)}
                            className="create-item-nav-select"
                        >
                            <option value={ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.LAPAS}>{ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.LAPAS}</option>
                            <option value={ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.DOKUMENTI}>{ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.DOKUMENTI}</option>
                            <option value={ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.GLABĀJAMĀS_VIENĪBAS}>{ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.GLABĀJAMĀS_VIENĪBAS}</option>
                        </select>
                        <FieldError error={getFieldError('unit_of_measure')} />
                    </div>
                </div>
            )}

            <div className="create-item-nav-field">
                <label className="create-item-nav-field-label">
                    {ITEM_CREATE_FORM_UI.FIELD_KOPIJA}
                    <FieldHelp entity="item" field="copy" />
                </label>
                <input
                    type="text"
                    value={copy}
                    onChange={(e) => setCopy(e.target.value)}
                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_KOPIJA}
                    className="create-item-nav-input"
                />
            </div>

            <div className="create-item-nav-field">
                <label className="create-item-nav-field-label">
                    {ITEM_CREATE_FORM_UI.FIELD_ARHĪVA_VĒSTURE}
                    <FieldHelp entity="item" field="archival_history" />
                </label>
                <input
                    type="text"
                    value={archivalHistory}
                    onChange={(e) => setArchivalHistory(e.target.value)}
                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_ARHĪVA_VĒSTURE}
                    className="create-item-nav-input"
                />
            </div>

            <div className="create-item-nav-field">
                <label className="create-item-nav-field-label">
                    {ITEM_CREATE_FORM_UI.FIELD_SISTEMATIZĀCIJA}
                    <FieldHelp entity="item" field="sistematisation" />
                </label>
                <input
                    type="text"
                    value={sistematisation}
                    onChange={(e) => setSistematisation(e.target.value)}
                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_SISTEMATIZĀCIJA}
                    className="create-item-nav-input"
                />
            </div>
        </SectionEditPopup>
    );
};

export default ItemTechnicalSectionPopup;
