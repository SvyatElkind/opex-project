import React, { useState, useRef, useEffect } from 'react';
import SectionEditPopup from '../../components/SectionEditPopup';
import { useFormErrors } from '../../hooks/useFormErrors';
import {
    validateItemUpdate,
    getItemUpdatePayload,
    splitItemValidationErrors,
} from '../../Constants/itemConstants';
import { ITEM_CREATE_FORM_UI } from '../../Constants/Constants';
import { useNavigation } from '../../Navigation/context/NavigationContext';
import '../CreateItemNavigable.css';

const OWN_FIELDS = ['related_item_list'];

/** Section popup: Saistītās glabājamās vienības (related_item_list) */
const ItemRelatedSectionPopup = ({ item, inventory, onUpdate, onClose, onOpenFullEdit }) => {
    const { getAllItemsFromProject } = useNavigation();
    const allItems = getAllItemsFromProject() || [];

    const [selectedRelatedItems, setSelectedRelatedItems] = useState(
        item.related_item && item.related_item.length > 0
            ? allItems.filter(i => item.related_item.includes(i.id))
            : []
    );
    const [relatedItemsSearch, setRelatedItemsSearch] = useState('');
    const [showRelatedItemsDropdown, setShowRelatedItemsDropdown] = useState(false);
    const relatedDropdownRef = useRef(null);
    const relatedSearchRef = useRef(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCrossSectionError, setIsCrossSectionError] = useState(false);
    const { generalError, setGeneralError, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showRelatedItemsDropdown &&
                relatedDropdownRef.current && !relatedDropdownRef.current.contains(event.target) &&
                relatedSearchRef.current && !relatedSearchRef.current.contains(event.target)) {
                setShowRelatedItemsDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showRelatedItemsDropdown]);

    const filteredItems = allItems.filter(i =>
        i.id !== item.id &&
        !selectedRelatedItems.some(selected => selected.id === i.id) &&
        (i.number?.toString().includes(relatedItemsSearch) ||
         i.title?.toLowerCase().includes(relatedItemsSearch.toLowerCase()))
    );

    const toggleRelatedItem = (relatedItem) => {
        setSelectedRelatedItems(prev => [...prev, relatedItem]);
        setRelatedItemsSearch('');
        setShowRelatedItemsDropdown(false);
    };

    const removeRelatedItem = (itemId) => {
        setSelectedRelatedItems(prev => prev.filter(i => i.id !== itemId));
    };

    const handleRelatedSearchBlur = () => {
        setTimeout(() => {
            if (!relatedItemsSearch) setShowRelatedItemsDropdown(false);
        }, 200);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();
        setIsCrossSectionError(false);

        const relatedIds = selectedRelatedItems.map(i => i.id);
        const payload = getItemUpdatePayload(item, inventory, { related_item_list: relatedIds });
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
            title={`Rediģēt: ${ITEM_CREATE_FORM_UI.SECTION_RELATED}`}
            helpChapterId="items" helpSectionId="create-item"
            onClose={onClose} onSubmit={handleSubmit} isSubmitting={isSubmitting}
            generalError={generalError} isCrossSectionError={isCrossSectionError} onOpenFullEdit={onOpenFullEdit}
        >
            <div className="create-item-nav-field">
                <input
                    ref={relatedSearchRef}
                    type="text"
                    value={relatedItemsSearch}
                    onChange={(e) => { setRelatedItemsSearch(e.target.value); setShowRelatedItemsDropdown(e.target.value.length > 0); }}
                    onBlur={handleRelatedSearchBlur}
                    onFocus={() => relatedItemsSearch && setShowRelatedItemsDropdown(true)}
                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_MEKLĒT_VIENĪBAS}
                    className="create-item-nav-input"
                />
                {getFieldError('related_item_list') && (
                    <span className="field-error">{getFieldError('related_item_list')}</span>
                )}
            </div>

            {showRelatedItemsDropdown && filteredItems.length > 0 && (
                <div ref={relatedDropdownRef} className="create-item-nav-related-dropdown">
                    {filteredItems.slice(0, 10).map(filteredItem => (
                        <div key={filteredItem.id} onClick={() => toggleRelatedItem(filteredItem)} className="create-item-nav-related-dropdown-item">
                            <span className="related-dropdown-us">{ITEM_CREATE_FORM_UI.DROPDOWN_LABEL_US} {filteredItem.inventoryNumber || inventory.number}</span>
                            <span className="related-dropdown-gv">{ITEM_CREATE_FORM_UI.DROPDOWN_LABEL_GV} {filteredItem.number}</span>
                            <span className="related-dropdown-name">{filteredItem.title}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="create-item-nav-related-table-wrapper">
                <table className={`create-item-nav-related-table ${selectedRelatedItems.length === 0 ? 'create-item-nav-related-table-empty' : ''}`}>
                    <thead>
                        <tr>
                            <th>{ITEM_CREATE_FORM_UI.TABLE_HEADER_US}</th>
                            <th>{ITEM_CREATE_FORM_UI.TABLE_HEADER_GV}</th>
                            <th>{ITEM_CREATE_FORM_UI.TABLE_HEADER_NOSAUKUMS}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedRelatedItems.length === 0 ? (
                            <tr className="create-item-nav-related-empty-row">
                                <td colSpan="4">Nav izvēlēta neviena saistītā glabājamā vienība</td>
                            </tr>
                        ) : (
                            selectedRelatedItems.map(relatedItem => (
                                <tr key={relatedItem.id}>
                                    <td>{relatedItem.inventoryNumber || inventory.number}</td>
                                    <td>{relatedItem.number}</td>
                                    <td>{relatedItem.title}</td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => removeRelatedItem(relatedItem.id)}
                                            className="create-item-nav-related-remove-btn"
                                            title={ITEM_CREATE_FORM_UI.REMOVE_BTN}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </SectionEditPopup>
    );
};

export default ItemRelatedSectionPopup;
