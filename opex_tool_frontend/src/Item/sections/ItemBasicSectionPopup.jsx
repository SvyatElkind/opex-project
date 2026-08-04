import React, { useState, useRef, useEffect } from 'react';
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

const OWN_FIELDS = ['series_code', 'title', 'language'];

/** Section popup: Pamatinformācija (series_code, title, language) */
const ItemBasicSectionPopup = ({ item, inventory, onUpdate, onClose, onOpenFullEdit }) => {
    const [seriesCode, setSeriesCode] = useState(item.series_code || '');
    const [title, setTitle] = useState(item.title || '');
    const [language, setLanguage] = useState(
        item.language
            ? (typeof item.language === 'string' ? item.language.split(/,\s*/).map(l => l.trim()).filter(Boolean) : item.language)
            : []
    );
    const [languageSearch, setLanguageSearch] = useState('');
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const languageDropdownRef = useRef(null);
    const languageSearchRef = useRef(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCrossSectionError, setIsCrossSectionError] = useState(false);
    const { generalError, setGeneralError, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showLanguageDropdown &&
                languageDropdownRef.current && !languageDropdownRef.current.contains(event.target) &&
                languageSearchRef.current && !languageSearchRef.current.contains(event.target)) {
                setShowLanguageDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLanguageDropdown]);

    const availableLanguages = ITEM_CREATE_FORM_UI.LANGUAGES;
    const filteredLanguages = availableLanguages.filter(lang =>
        !language.includes(lang) && lang.toLowerCase().includes(languageSearch.toLowerCase())
    );

    const toggleLanguage = (lang) => {
        setLanguage(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
        setLanguageSearch('');
        setShowLanguageDropdown(false);
    };

    const removeLanguage = (lang) => {
        setLanguage(prev => prev.filter(l => l !== lang));
    };

    const addCustomLanguage = () => {
        const trimmed = languageSearch.trim();
        if (!trimmed) return;
        if (!language.some(l => l.toLowerCase() === trimmed.toLowerCase())) {
            setLanguage(prev => [...prev, trimmed]);
        }
        setLanguageSearch('');
        setShowLanguageDropdown(false);
    };

    const handleLanguageSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredLanguages.length > 0) toggleLanguage(filteredLanguages[0]);
            else if (languageSearch.trim()) addCustomLanguage();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();
        setIsCrossSectionError(false);

        const payload = getItemUpdatePayload(item, inventory, { series_code: seriesCode, title, language });
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
            title={`Rediģēt: ${ITEM_CREATE_FORM_UI.SECTION_BASIC}`}
            helpChapterId="items" helpSectionId="create-item"
            onClose={onClose} onSubmit={handleSubmit} isSubmitting={isSubmitting}
            generalError={generalError} isCrossSectionError={isCrossSectionError} onOpenFullEdit={onOpenFullEdit}
        >
            <div className="create-item-nav-field">
                <label className="create-item-nav-field-label create-item-nav-field-label-required">
                    {ITEM_CREATE_FORM_UI.FIELD_SĒRIJAS_KODS}
                    <FieldHelp entity="item" field="series_code" />
                </label>
                <input
                    type="text"
                    value={seriesCode}
                    onChange={(e) => setSeriesCode(e.target.value)}
                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_SĒRIJAS_KODS}
                    className="create-item-nav-input"
                />
                <FieldError error={getFieldError('series_code')} />
            </div>

            <div className="create-item-nav-field">
                <label className="create-item-nav-field-label create-item-nav-field-label-required">
                    {ITEM_CREATE_FORM_UI.FIELD_NOSAUKUMS}
                    <FieldHelp entity="item" field="title" />
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_NOSAUKUMS}
                    className="create-item-nav-input"
                />
                <FieldError error={getFieldError('title')} />
            </div>

            <div className="create-item-nav-field">
                <label className="create-item-nav-field-label">
                    {ITEM_CREATE_FORM_UI.FIELD_VALODA}
                    <FieldHelp entity="item" field="language" />
                </label>

                {language.length > 0 && (
                    <div className="create-item-nav-language-tags">
                        {language.map(lang => (
                            <div key={lang} className="create-item-nav-language-tag">
                                <span className="language-tag-text">{lang}</span>
                                <button type="button" onClick={() => removeLanguage(lang)} className="language-tag-remove" title={ITEM_CREATE_FORM_UI.REMOVE_BTN}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <input
                    ref={languageSearchRef}
                    type="text"
                    value={languageSearch}
                    onChange={(e) => { setLanguageSearch(e.target.value); setShowLanguageDropdown(true); }}
                    onKeyDown={handleLanguageSearchKeyDown}
                    onFocus={() => setShowLanguageDropdown(true)}
                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_VALODA_SEARCH}
                    className="create-item-nav-input"
                />

                {showLanguageDropdown && filteredLanguages.length > 0 && (
                    <div ref={languageDropdownRef} className="create-item-nav-language-dropdown">
                        {filteredLanguages.map(lang => (
                            <div key={lang} onClick={() => toggleLanguage(lang)} className="create-item-nav-language-option">
                                {lang}
                            </div>
                        ))}
                    </div>
                )}

                {showLanguageDropdown && filteredLanguages.length === 0 && languageSearch && (
                    <div ref={languageDropdownRef} className="create-item-nav-language-dropdown">
                        <div className="create-item-nav-language-add-custom" onClick={addCustomLanguage}>
                            <i className="fas fa-plus-circle"></i>
                            {ITEM_CREATE_FORM_UI.ADD_CUSTOM_LANGUAGE.replace('{search}', languageSearch)}
                        </div>
                    </div>
                )}

                <FieldError error={getFieldError('language')} />
            </div>
        </SectionEditPopup>
    );
};

export default ItemBasicSectionPopup;
