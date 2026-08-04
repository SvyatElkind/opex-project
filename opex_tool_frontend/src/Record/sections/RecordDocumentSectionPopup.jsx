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
    SENT_REG_NR_MAX_LENGTH,
    NOMENCLATURE_NR_MAX_LENGTH,
} from '../../Constants/recordConstants';
import { RECORD_CREATE_FORM_UI } from '../../Constants/Constants';
import '../CreateDocumentRecord.css';

const OWN_FIELDS = ['created_date', 'sent_date', 'language', 'sent_reg_nr', 'nomenclature_nr', 'key_words'];

const parseLanguageToArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(/,\s*/).map((l) => l.trim()).filter(Boolean);
};

/** Section popup: Dokumenta detaļas (created_date, sent_date, language, sent_reg_nr, nomenclature_nr, key_words) */
const RecordDocumentSectionPopup = ({ record, item, projectId, onUpdate, onClose, onOpenFullEdit }) => {
    const updateRecordMutation = useUpdateRecord();
    const [createdDate, setCreatedDate] = useState(record.created_date || '');
    const [sentDate, setSentDate] = useState(record.sent_date || '');
    const [language, setLanguage] = useState(parseLanguageToArray(record.language));
    const [languageSearch, setLanguageSearch] = useState('');
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [sentRegNr, setSentRegNr] = useState(record.sent_reg_nr || '');
    const [nomenclatureNr, setNomenclatureNr] = useState(record.nomenclature_nr || '');
    const [keywords, setKeywords] = useState(() => (record.key_words ? record.key_words.split(',').map((k) => k.trim()).filter(Boolean) : []));
    const [keywordInput, setKeywordInput] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCrossSectionError, setIsCrossSectionError] = useState(false);
    const { generalError, setGeneralError, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    const availableLanguages = RECORD_CREATE_FORM_UI.LANGUAGES;
    const filteredLanguages = availableLanguages.filter((lang) => !language.includes(lang) && lang.toLowerCase().includes(languageSearch.toLowerCase()));

    const toggleLanguage = (lang) => {
        setLanguage((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
        setLanguageSearch('');
        setShowLanguageDropdown(false);
    };
    const removeLanguage = (lang) => setLanguage((prev) => prev.filter((l) => l !== lang));
    const addCustomLanguage = () => {
        const trimmed = languageSearch.trim();
        if (!trimmed) return;
        if (!language.some((l) => l.toLowerCase() === trimmed.toLowerCase())) setLanguage((prev) => [...prev, trimmed]);
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

    const addKeyword = () => {
        const trimmed = keywordInput.trim();
        if (trimmed && !keywords.includes(trimmed)) {
            setKeywords((prev) => [...prev, trimmed]);
            setKeywordInput('');
        }
    };
    const removeKeyword = (kw) => setKeywords((prev) => prev.filter((k) => k !== kw));
    const handleKeywordKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addKeyword();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();
        setIsCrossSectionError(false);

        const payload = getRecordUpdatePayload(record, {
            created_date: createdDate,
            sent_date: sentDate,
            language,
            sent_reg_nr: sentRegNr,
            nomenclature_nr: nomenclatureNr,
            key_words: keywords.join(',') || '',
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
            title={`Rediģēt: ${RECORD_CREATE_FORM_UI.SECTION_DOCUMENT}`}
            helpChapterId="records" helpSectionId="create-record"
            onClose={onClose} onSubmit={handleSubmit} isSubmitting={isSubmitting}
            generalError={generalError} isCrossSectionError={isCrossSectionError} onOpenFullEdit={onOpenFullEdit}
        >
            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_IZVEIDOŠANAS_DATUMS}
                    <FieldHelp entity="record" field="created_date" />
                </label>
                <DatePicker
                    selected={parseDate(createdDate)}
                    onChange={(d) => setCreatedDate(formatDate(d, 'YYYY-MM-DD'))}
                    dateFormat={DATEPICKER_FORMAT}
                    placeholderText={DATE_PLACEHOLDER}
                    calendarStartDay={1}
                    autoComplete="off"
                    className="create-record-nav-input"
                    wrapperClassName="create-record-nav-datepicker-wrapper"
                    isClearable
                    portalId="record-section-popup-datepicker-portal"
                    popperClassName="section-popup-datepicker-popper"
                />
            </div>

            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_NOSŪTĪŠANAS_DATUMS}
                    <FieldHelp entity="record" field="sent_date" />
                </label>
                <DatePicker
                    selected={parseDate(sentDate)}
                    onChange={(d) => setSentDate(formatDate(d, 'YYYY-MM-DD'))}
                    dateFormat={DATEPICKER_FORMAT}
                    placeholderText={DATE_PLACEHOLDER}
                    calendarStartDay={1}
                    autoComplete="off"
                    className="create-record-nav-input"
                    wrapperClassName="create-record-nav-datepicker-wrapper"
                    isClearable
                    portalId="record-section-popup-datepicker-portal"
                    popperClassName="section-popup-datepicker-popper"
                />
            </div>

            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label create-record-nav-field-label-required">
                    {RECORD_CREATE_FORM_UI.FIELD_VALODA}
                    <FieldHelp entity="record" field="language" />
                </label>
                {language.length > 0 && (
                    <div className="create-record-nav-language-tags">
                        {language.map((lang) => (
                            <div key={lang} className="create-record-nav-language-tag">
                                <span className="language-tag-text">{lang}</span>
                                <button type="button" onClick={() => removeLanguage(lang)} className="language-tag-remove" title="Noņemt">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <input
                    type="text"
                    value={languageSearch}
                    onChange={(e) => { setLanguageSearch(e.target.value); setShowLanguageDropdown(true); }}
                    onKeyDown={handleLanguageSearchKeyDown}
                    onFocus={() => setShowLanguageDropdown(true)}
                    placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_VALODA}
                    className="create-record-nav-input"
                />
                {showLanguageDropdown && filteredLanguages.length > 0 && (
                    <div className="create-record-nav-language-dropdown">
                        {filteredLanguages.map((lang) => (
                            <div key={lang} onClick={() => toggleLanguage(lang)} className="create-record-nav-language-option">{lang}</div>
                        ))}
                    </div>
                )}
                {showLanguageDropdown && filteredLanguages.length === 0 && languageSearch && (
                    <div className="create-record-nav-language-dropdown">
                        <div className="create-record-nav-language-add-custom" onClick={addCustomLanguage}>
                            <i className="fas fa-plus-circle"></i> Pievienot "{languageSearch}"
                        </div>
                    </div>
                )}
                <FieldError error={getFieldError('language')} />
            </div>

            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                    Nosūtītāja reģ. nr.
                    <FieldHelp entity="record" field="sent_reg_nr" />
                </label>
                <input
                    type="text"
                    value={sentRegNr}
                    onChange={(e) => setSentRegNr(e.target.value)}
                    className="create-record-nav-input"
                    maxLength={SENT_REG_NR_MAX_LENGTH}
                />
                <FieldError error={getFieldError('sent_reg_nr')} />
            </div>

            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                    Lietas Nr.
                    <FieldHelp entity="record" field="nomenclature_nr" />
                </label>
                <input
                    type="text"
                    value={nomenclatureNr}
                    onChange={(e) => setNomenclatureNr(e.target.value)}
                    className="create-record-nav-input"
                    maxLength={NOMENCLATURE_NR_MAX_LENGTH}
                />
                <FieldError error={getFieldError('nomenclature_nr')} />
            </div>

            <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_ATSLĒGVĀRDI}
                    <FieldHelp entity="record" field="key_words" />
                </label>
                {keywords.length > 0 && (
                    <div className="create-record-nav-keyword-tags">
                        {keywords.map((kw, idx) => (
                            <div key={idx} className="create-record-nav-keyword-tag">
                                <span className="keyword-tag-text">{kw}</span>
                                <button type="button" onClick={() => removeKeyword(kw)} className="keyword-tag-remove" title="Noņemt">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="create-record-nav-keyword-input-wrapper">
                    <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleKeywordKeyDown}
                        className="create-record-nav-input"
                        placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_ATSLĒGVĀRDI_SHORT}
                    />
                    {keywordInput.trim() && (
                        <button type="button" onClick={addKeyword} className="create-record-nav-keyword-add-btn">Pievienot</button>
                    )}
                </div>
            </div>
        </SectionEditPopup>
    );
};

export default RecordDocumentSectionPopup;
