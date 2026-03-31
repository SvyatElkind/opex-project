// CreateItemNavigable.js - Two-Column Layout with Navigation (WITH REACT PORTAL FIX)
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom"; // ADDED: For Portal rendering
import CalendarComponent from "../Utils/CalendarComponent";
import { GeneralError, GeneralSuccess, FieldError } from '../components/ErrorDisplay';
import { useFormErrors } from '../hooks/useFormErrors';
import {
    validateItemCreate,
    isLanguageRequired,
    isAnnotationRequired,
    isRestrictionNoteRequired,
    getRemainingChars,
    TITLE_MAX_LENGTH,
    SERIES_CODE_MAX_LENGTH,
    ANNOTATION_MAX_LENGTH,
    NOTES_MAX_LENGTH,
    RESTRICTION_NOTE_MAX_LENGTH
} from '../Constants/itemConstants';
import { ITEM_CREATE_FORM_UI } from '../Constants/Constants';
import './CreateItemNavigable.css';
import Utils from "../Utils/Utils";
import { useNavigation } from '../Navigation/context/NavigationContext';
import HelpButton from '../Help/HelpButton';
import { useSettings } from '../Settings/context/SettingsContext';

const CreateItemNavigable = ({ onClose, onCreate, relativeInventory }) => {
    const utils = Utils();
    const { getAllItemsFromProject } = useNavigation();
    const { getActivePreset } = useSettings();
    const activePreset = getActivePreset();

    // Refs for sections
    const sectionRefs = {
        basic: useRef(null),
        dates: useRef(null),
        technical: useRef(null),
        description: useRef(null),
        access: useRef(null),
        related: useRef(null)
    };

    // Refs for click-outside handling
    const relatedDropdownRef = useRef(null);
    const relatedSearchRef = useRef(null);
    const languageDropdownRef = useRef(null);
    const languageSearchRef = useRef(null);

    // Active section tracking
    const [activeSection, setActiveSection] = useState('basic');

    // Navigation menu items
    const navItems = [
        { id: 'basic', label: ITEM_CREATE_FORM_UI.SECTION_BASIC, icon: 'fa-info-circle' },
        { id: 'dates', label: ITEM_CREATE_FORM_UI.SECTION_DATES, icon: 'fa-calendar-alt' },
        { id: 'technical', label: ITEM_CREATE_FORM_UI.SECTION_TECHNICAL, icon: 'fa-cog' },
        { id: 'description', label: ITEM_CREATE_FORM_UI.SECTION_DESCRIPTION, icon: 'fa-file-alt' },
        { id: 'access', label: ITEM_CREATE_FORM_UI.SECTION_ACCESS, icon: 'fa-lock' },
        { id: 'related', label: ITEM_CREATE_FORM_UI.SECTION_RELATED, icon: 'fa-link' }
    ];

    // Available languages for multi-select (expanded list)
    const availableLanguages = ITEM_CREATE_FORM_UI.LANGUAGES;

    // Initial form state - Uses active preset for default values
    const getInitialFormData = () => ({
        series_code: "",
        number: relativeInventory.last_gv + 1,
        title: "",
        start_date: "",
        end_date: "",
        date_indicator: "day",
        date_note: "",
        size: 0,
        unit_of_measure: ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.LAPAS, // DEFAULT VALUE - REQUIRED FIELD
        notes: activePreset?.notes || "",
        annotation: "",
        sistematisation: "",
        language: activePreset?.itemLanguage ? [activePreset.itemLanguage] : [ITEM_CREATE_FORM_UI.LANGUAGES[0]], // Use preset language
        restriction: activePreset?.restriction || ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA,
        restriction_note: "",
        security_level: activePreset?.securityLevel || ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.PUBLISKS,
        security_level_note: "",
        copy: "",
        archival_history: "",
        related_item_list: [],
        inventory: relativeInventory.number
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [itemsCreated, setItemsCreated] = useState(0);

    // Error handling
    const { generalError, setGeneralError, setApiErrors, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    // Related items state
    const [relatedItemsSearch, setRelatedItemsSearch] = useState("");
    const [selectedRelatedItems, setSelectedRelatedItems] = useState([]);
    const [showRelatedItemsDropdown, setShowRelatedItemsDropdown] = useState(false);

    // Language search state
    const [languageSearch, setLanguageSearch] = useState("");
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

    // Click-outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Handle related items dropdown
            if (showRelatedItemsDropdown &&
                relatedDropdownRef.current &&
                !relatedDropdownRef.current.contains(event.target) &&
                relatedSearchRef.current &&
                !relatedSearchRef.current.contains(event.target)) {
                setShowRelatedItemsDropdown(false);
            }
            // Handle language dropdown
            if (showLanguageDropdown &&
                languageDropdownRef.current &&
                !languageDropdownRef.current.contains(event.target) &&
                languageSearchRef.current &&
                !languageSearchRef.current.contains(event.target)) {
                setShowLanguageDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showRelatedItemsDropdown, showLanguageDropdown]);

    // Scroll to section
    const scrollToSection = (sectionId) => {
        const ref = sectionRefs[sectionId];
        if (ref && ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            setActiveSection(sectionId);
        }
    };

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle date changes with inventory date validation
    const handleDateChange = (startDate, endDate, view) => {
        setFormData(prev => ({
            ...prev,
            start_date: startDate ? utils.formatDate(startDate) : "",
            end_date: endDate ? utils.formatDate(endDate) : "",
            date_indicator: view
        }));

        // Validate against inventory end date only
        if (endDate && relativeInventory.end_date) {
            const itemEndDate = new Date(endDate);
            const inventoryEndDate = new Date(relativeInventory.end_date);

            if (itemEndDate > inventoryEndDate) {
                setGeneralError(ITEM_CREATE_FORM_UI.DATE_VALIDATION_ERROR
                    .replace('{itemDate}', utils.formatDate(endDate))
                    .replace('{inventoryDate}', utils.formatDate(inventoryEndDate)));
            } else {
                clearErrors();
            }
        }
    };

    // Handle language toggle (tag-based)
    const toggleLanguage = (lang) => {
        setFormData(prev => {
            const currentLanguages = prev.language || [];
            const isSelected = currentLanguages.includes(lang);

            if (isSelected) {
                // Remove language (allow removing all languages)
                const newLanguages = currentLanguages.filter(l => l !== lang);
                return {
                    ...prev,
                    language: newLanguages
                };
            } else {
                // Add language
                return {
                    ...prev,
                    language: [...currentLanguages, lang]
                };
            }
        });
        setLanguageSearch("");
        setShowLanguageDropdown(false);
    };

    // Handle language search change
    const handleLanguageSearchChange = (e) => {
        setLanguageSearch(e.target.value);
        setShowLanguageDropdown(true);
    };

    // Add custom language value
    const addCustomLanguage = () => {
        const trimmedValue = languageSearch.trim();

        if (!trimmedValue) return;

        // Check if language already exists (case-insensitive)
        const currentLanguages = formData.language || [];
        const exists = currentLanguages.some(lang =>
            lang.toLowerCase() === trimmedValue.toLowerCase()
        );

        if (!exists) {
            setFormData(prev => ({
                ...prev,
                language: [...(prev.language || []), trimmedValue]
            }));
        }

        setLanguageSearch("");
        setShowLanguageDropdown(false);
    };

    // Handle Enter key in language search
    const handleLanguageSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            // If there are filtered options, add the first one
            if (filteredLanguages.length > 0) {
                toggleLanguage(filteredLanguages[0]);
            } else if (languageSearch.trim()) {
                // Otherwise add the custom value
                addCustomLanguage();
            }
        }
    };

    // Remove language tag (allow removing all languages)
    const removeLanguage = (lang) => {
        setFormData(prev => {
            const currentLanguages = prev.language || [];
            const newLanguages = currentLanguages.filter(l => l !== lang);
            return {
                ...prev,
                language: newLanguages
            };
        });
    };

    // Filter available languages by search and exclude already selected
    const filteredLanguages = availableLanguages.filter(lang =>
        !formData.language.includes(lang) &&
        lang.toLowerCase().includes(languageSearch.toLowerCase())
    );

    // Reset form
    const resetForm = () => {
        const newFormData = getInitialFormData();
        newFormData.number = relativeInventory.last_gv + 1 + itemsCreated + 1;
        setFormData(newFormData);
        clearErrors();
        setSelectedRelatedItems([]);
        setRelatedItemsSearch("");
        setShowRelatedItemsDropdown(false);
    };

    // Submit handler
    const handleSubmit = async (e, shouldContinue = false) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();
        setSuccessMessage("");

        // Prepare validation data (convert language array to string for validation)
        const validationData = {
            ...formData,
            language: Array.isArray(formData.language)
                ? formData.language.join(', ')
                : formData.language
        };

        // Client-side validation
        const validation = validateItemCreate(validationData, relativeInventory);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            setIsSubmitting(false);
            // Scroll to first error
            const firstErrorField = Object.keys(validation.errors)[0];
            if (firstErrorField) {
                // Scroll to appropriate section based on field
                const sectionMap = {
                    series_code: 'basic',
                    title: 'basic',
                    start_date: 'dates',
                    end_date: 'dates',
                    date_indicator: 'dates',
                    annotation: 'description',
                    language: 'description',
                    restriction: 'access',
                    restriction_note: 'access',
                    security_level: 'access'
                };
                const targetSection = sectionMap[firstErrorField] || 'basic';
                scrollToSection(targetSection);
            }
            return;
        }

        try {
            const shouldClosePopup = !shouldContinue;
            // Convert language array to comma-separated string for API
            const submitData = {
                ...formData,
                language: Array.isArray(formData.language)
                    ? formData.language.join(', ')
                    : formData.language
            };
            const [success, result] = await onCreate(submitData, shouldClosePopup);

            if (success) {
                if (shouldContinue) {
                    setSuccessMessage(ITEM_CREATE_FORM_UI.SUCCESS_CREATE_MORE.replace('{title}', formData.title));
                    setItemsCreated(prev => prev + 1);

                    setTimeout(() => {
                        resetForm();
                        scrollToSection('basic');
                    }, 1000);
                } else {
                    onClose();
                }
            } else {
                // result could be an error object with fieldErrors or a string
                if (typeof result === 'object' && result.fieldErrors) {
                    setApiErrors({ ...result.fieldErrors, error: result.message });
                } else {
                    setGeneralError(result);
                }
            }
        } catch (error) {
            if (error.fieldErrors) {
                setApiErrors({ ...error.fieldErrors, error: error.message });
            } else {
                setGeneralError(error.message || ITEM_CREATE_FORM_UI.ERROR_OCCURRED);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Related items handlers
    const handleRelatedItemsSearchChange = (e) => {
        setRelatedItemsSearch(e.target.value);
        setShowRelatedItemsDropdown(e.target.value.length > 0);
    };

    // Clear search closes dropdown
    const handleRelatedSearchBlur = () => {
        // Delay to allow click on dropdown item
        setTimeout(() => {
            if (!relatedItemsSearch) {
                setShowRelatedItemsDropdown(false);
            }
        }, 200);
    };

    const toggleRelatedItem = (item) => {
        const isSelected = selectedRelatedItems.some(i => i.id === item.id);
        let newSelectedItems;

        if (isSelected) {
            newSelectedItems = selectedRelatedItems.filter(i => i.id !== item.id);
        } else {
            newSelectedItems = [...selectedRelatedItems, item];
        }

        setSelectedRelatedItems(newSelectedItems);
        const relatedIds = newSelectedItems.map(item => item.id);
        setFormData(prev => ({
            ...prev,
            related_item_list: relatedIds
        }));
        setRelatedItemsSearch("");
        setShowRelatedItemsDropdown(false);
    };

    const removeRelatedItem = (itemId) => {
        const newSelectedItems = selectedRelatedItems.filter(i => i.id !== itemId);
        setSelectedRelatedItems(newSelectedItems);
        const relatedIds = newSelectedItems.map(item => item.id);
        setFormData(prev => ({
            ...prev,
            related_item_list: relatedIds
        }));
    };

    // Get all items for related items dropdown
    const allItems = getAllItemsFromProject() || [];
    const filteredItems = allItems.filter(item =>
        item.id !== formData.id &&
        !selectedRelatedItems.some(selected => selected.id === item.id) &&
        (item.number?.toString().includes(relatedItemsSearch) ||
         item.title?.toLowerCase().includes(relatedItemsSearch.toLowerCase()))
    );

    // Clear messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Generate title with number
    const formTitle = ITEM_CREATE_FORM_UI.TITLE_WITH_NUMBER.replace('{number}', formData.number);
    const formSubtitle = ITEM_CREATE_FORM_UI.SUBTITLE.replace('{inventory}', formData.inventory) +
        (itemsCreated > 0 ? ITEM_CREATE_FORM_UI.CREATED_COUNT.replace('{count}', itemsCreated) : '');

    // FIXED: Use React Portal to render directly to document.body
    // This bypasses any parent container constraints and ensures proper fullscreen positioning
    return ReactDOM.createPortal(
        <div className="create-item-nav-modal-overlay">
            <form onSubmit={(e) => handleSubmit(e, false)} className="create-item-nav-container">
                {/* Header */}
                <div className="create-item-nav-header">
                    <div className="create-item-nav-header-content">
                        <h2 className="create-item-nav-title">{formTitle}</h2>
                        <div className="create-item-nav-subtitle">{formSubtitle}</div>
                    </div>
                    <div className="create-item-nav-header-actions">
                        <HelpButton chapterId="items" iconOnly={true} className="small" />
                    </div>
                </div>

                {/* Success Message - stays at top */}
                {successMessage && (
                    <GeneralSuccess message={successMessage} onClose={() => setSuccessMessage('')} />
                )}

                {/* Two-Column Layout */}
                <div className="create-item-nav-body">
                    {/* Left Navigation Sidebar */}
                    <aside className="create-item-nav-sidebar">
                        <nav className="create-item-nav-menu">
                            {navItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`create-item-nav-menu-item ${
                                        activeSection === item.id ? 'create-item-nav-menu-item-active' : ''
                                    }`}
                                    onClick={() => scrollToSection(item.id)}
                                >
                                    <span className="create-item-nav-menu-icon"><i className={`fas ${item.icon}`}></i></span>
                                    <span className="create-item-nav-menu-text">{item.label}</span>
                                </div>
                            ))}
                        </nav>

                        {/* Error Message - in sidebar under menu */}
                        {generalError && (
                            <div className="create-item-nav-sidebar-error">
                                <GeneralError message={generalError} onClose={clearErrors} />
                            </div>
                        )}
                    </aside>

                    {/* Right Content Area */}
                    <div className="create-item-nav-content">
                        {/* Basic Information Section */}
                        <section ref={sectionRefs.basic} className="create-item-nav-section" id="basic">
                            <h3 className="create-item-nav-section-header">
                                <span className="create-item-nav-section-icon"><i className="fas fa-info-circle"></i></span>
                                {ITEM_CREATE_FORM_UI.SECTION_BASIC}
                            </h3>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label create-item-nav-field-label-required">
                                    {ITEM_CREATE_FORM_UI.FIELD_SĒRIJAS_KODS}
                                </label>
                                <input
                                    type="text"
                                    name="series_code"
                                    required
                                    value={formData.series_code}
                                    onChange={handleChange}
                                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_SĒRIJAS_KODS}
                                    className="create-item-nav-input"
                                />
                                <FieldError error={getFieldError('series_code')} />
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label create-item-nav-field-label-required">
                                    {ITEM_CREATE_FORM_UI.FIELD_NOSAUKUMS}
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_NOSAUKUMS}
                                    className="create-item-nav-input"
                                />
                                <FieldError error={getFieldError('title')} />
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    {ITEM_CREATE_FORM_UI.FIELD_VALODA}
                                </label>

                                {/* Selected Language Tags */}
                                {formData.language?.length > 0 && (
                                    <div className="create-item-nav-language-tags">
                                        {formData.language.map(lang => (
                                            <div key={lang} className="create-item-nav-language-tag">
                                                <span className="language-tag-text">{lang}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeLanguage(lang)}
                                                    className="language-tag-remove"
                                                    title={ITEM_CREATE_FORM_UI.REMOVE_BTN}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Language Search Input */}
                                <input
                                    ref={languageSearchRef}
                                    type="text"
                                    value={languageSearch}
                                    onChange={handleLanguageSearchChange}
                                    onKeyDown={handleLanguageSearchKeyDown}
                                    onFocus={() => setShowLanguageDropdown(true)}
                                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_VALODA_SEARCH}
                                    className="create-item-nav-input"
                                />

                                {/* Language Dropdown */}
                                {showLanguageDropdown && filteredLanguages.length > 0 && (
                                    <div ref={languageDropdownRef} className="create-item-nav-language-dropdown">
                                        {filteredLanguages.map(lang => (
                                            <div
                                                key={lang}
                                                onClick={() => toggleLanguage(lang)}
                                                className="create-item-nav-language-option"
                                            >
                                                {lang}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {showLanguageDropdown && filteredLanguages.length === 0 && languageSearch && (
                                    <div ref={languageDropdownRef} className="create-item-nav-language-dropdown">
                                        <div
                                            className="create-item-nav-language-add-custom"
                                            onClick={addCustomLanguage}
                                        >
                                            <i className="fas fa-plus-circle"></i>
                                            {ITEM_CREATE_FORM_UI.ADD_CUSTOM_LANGUAGE.replace('{search}', languageSearch)}
                                        </div>
                                    </div>
                                )}

                                <FieldError error={getFieldError('language')} />
                            </div>

                            {/* Section errors */}
                            {(getFieldError('series_code') || getFieldError('title') || getFieldError('language')) && (
                                <div className="create-item-nav-section-errors">
                                    <FieldError error={getFieldError('series_code')} />
                                    <FieldError error={getFieldError('title')} />
                                    <FieldError error={getFieldError('language')} />
                                </div>
                            )}
                        </section>

                        {/* Date Information Section */}
                        <section ref={sectionRefs.dates} className="create-item-nav-section" id="dates">
                            <h3 className="create-item-nav-section-header">
                                <span className="create-item-nav-section-icon"><i className="fas fa-calendar-alt"></i></span>
                                {ITEM_CREATE_FORM_UI.SECTION_DATES}
                            </h3>

                            <div className="create-item-nav-field">
                                <CalendarComponent
                                    onDateChange={handleDateChange}
                                    startDate={formData.start_date}
                                    endDate={formData.end_date}
                                    dateIndicator={formData.date_indicator}
                                    hideLabels={true}
                                    compactPlaceholders={true}
                                />
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    {ITEM_CREATE_FORM_UI.FIELD_DATUMA_PIEZĪMES}
                                </label>
                                <input
                                    type="text"
                                    name="date_note"
                                    value={formData.date_note}
                                    onChange={handleChange}
                                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_DATUMA_PIEZĪMES}
                                    className="create-item-nav-input"
                                />
                            </div>

                            {/* Section errors */}
                            {(getFieldError('start_date') || getFieldError('end_date') || getFieldError('date_note')) && (
                                <div className="create-item-nav-section-errors">
                                    <FieldError error={getFieldError('start_date')} />
                                    <FieldError error={getFieldError('end_date')} />
                                    <FieldError error={getFieldError('date_note')} />
                                </div>
                            )}
                        </section>

                        {/* Technical Information Section */}
                        <section ref={sectionRefs.technical} className="create-item-nav-section" id="technical">
                            <h3 className="create-item-nav-section-header">
                                <span className="create-item-nav-section-icon"><i className="fas fa-cog"></i></span>
                                {ITEM_CREATE_FORM_UI.SECTION_TECHNICAL}
                            </h3>

                            {/* Size and Unit of Measure - Only for Physical Documents */}
                            {!relativeInventory.electronic && (
                                <div className="create-item-nav-field-row">
                                    <div className="create-item-nav-field">
                                        <label className="create-item-nav-field-label">
                                            {ITEM_CREATE_FORM_UI.FIELD_APJOMS}
                                        </label>
                                        <input
                                            type="number"
                                            name="size"
                                            value={formData.size}
                                            onChange={handleChange}
                                            placeholder="0"
                                            min="0"
                                            className="create-item-nav-input"
                                        />
                                    </div>

                                    <div className="create-item-nav-field">
                                        <label className="create-item-nav-field-label">
                                            {ITEM_CREATE_FORM_UI.FIELD_APJOMA_MĒRVIENĪBA}
                                        </label>
                                        <select
                                            name="unit_of_measure"
                                            value={formData.unit_of_measure}
                                            onChange={handleChange}
                                            className="create-item-nav-select"
                                        >
                                            <option value={ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.LAPAS}>{ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.LAPAS}</option>
                                            <option value={ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.DOKUMENTI}>{ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.DOKUMENTI}</option>
                                            <option value={ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.GLABĀJAMĀS_VIENĪBAS}>{ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.GLABĀJAMĀS_VIENĪBAS}</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    {ITEM_CREATE_FORM_UI.FIELD_KOPIJA}
                                </label>
                                <input
                                    type="text"
                                    name="copy"
                                    value={formData.copy}
                                    onChange={handleChange}
                                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_KOPIJA}
                                    className="create-item-nav-input"
                                />
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    {ITEM_CREATE_FORM_UI.FIELD_ARHĪVA_VĒSTURE}
                                </label>
                                <input
                                    type="text"
                                    name="archival_history"
                                    value={formData.archival_history}
                                    onChange={handleChange}
                                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_ARHĪVA_VĒSTURE}
                                    className="create-item-nav-input"
                                />
                            </div>

                            {/* Sistematizācija moved here from Description */}
                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    {ITEM_CREATE_FORM_UI.FIELD_SISTEMATIZĀCIJA}
                                </label>
                                <input
                                    type="text"
                                    name="sistematisation"
                                    value={formData.sistematisation}
                                    onChange={handleChange}
                                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_SISTEMATIZĀCIJA}
                                    className="create-item-nav-input"
                                />
                            </div>
                        </section>

                        {/* Content/Description Section - Saturs first, then Piezīmes */}
                        <section ref={sectionRefs.description} className="create-item-nav-section" id="description">
                            <h3 className="create-item-nav-section-header">
                                <span className="create-item-nav-section-icon"><i className="fas fa-file-alt"></i></span>
                                {ITEM_CREATE_FORM_UI.SECTION_DESCRIPTION}
                            </h3>

                            {/* Saturs (Content) - formerly Anotācija */}
                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    {ITEM_CREATE_FORM_UI.FIELD_SATURS}
                                </label>
                                <textarea
                                    name="annotation"
                                    value={formData.annotation}
                                    onChange={handleChange}
                                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_SATURS}
                                    className="create-item-nav-textarea"
                                    rows="3"
                                />
                            </div>

                            {/* Piezīmes (Notes) */}
                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    {ITEM_CREATE_FORM_UI.FIELD_PIEZĪMES}
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_PIEZĪMES}
                                    className="create-item-nav-textarea"
                                    rows="3"
                                />
                            </div>
                        </section>

                        {/* Access and Security Section - renamed to Pieejamība un slepenība */}
                        <section ref={sectionRefs.access} className="create-item-nav-section" id="access">
                            <h3 className="create-item-nav-section-header">
                                <span className="create-item-nav-section-icon"><i className="fas fa-lock"></i></span>
                                {ITEM_CREATE_FORM_UI.SECTION_ACCESS}
                            </h3>

                            <div className="create-item-nav-field-row">
                                <div className="create-item-nav-field">
                                    <label className="create-item-nav-field-label">
                                        {ITEM_CREATE_FORM_UI.FIELD_PIEEJAMĪBA}
                                    </label>
                                    <select
                                        name="restriction"
                                        value={formData.restriction}
                                        onChange={handleChange}
                                        className="create-item-nav-select"
                                    >
                                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA}>{ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA}</option>
                                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.IEROBEŽOTA}>{ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.IEROBEŽOTA}</option>
                                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.STINGRI_IEROBEŽOTA}>{ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.STINGRI_IEROBEŽOTA}</option>
                                    </select>
                                </div>

                                <div className="create-item-nav-field">
                                    <label className="create-item-nav-field-label">
                                        {ITEM_CREATE_FORM_UI.FIELD_SLEPENĪBA}
                                    </label>
                                    <select
                                        name="security_level"
                                        value={formData.security_level}
                                        onChange={handleChange}
                                        className="create-item-nav-select"
                                    >
                                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.PUBLISKS}>{ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.PUBLISKS}</option>
                                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.IEKŠĒJS}>{ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.IEKŠĒJS}</option>
                                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.KONFIDENCIĀLS}>{ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.KONFIDENCIĀLS}</option>
                                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.SLEPENS}>{ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.SLEPENS}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    {ITEM_CREATE_FORM_UI.FIELD_PIEEJAMĪBAS_PIEZĪMES}
                                </label>
                                <textarea
                                    name="restriction_note"
                                    value={formData.restriction_note}
                                    onChange={handleChange}
                                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_PIEEJAMĪBAS_PIEZĪMES}
                                    className="create-item-nav-textarea"
                                    rows="2"
                                />
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    {ITEM_CREATE_FORM_UI.FIELD_SLEPENĪBAS_PIEZĪMES}
                                </label>
                                <textarea
                                    name="security_level_note"
                                    value={formData.security_level_note}
                                    onChange={handleChange}
                                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_SLEPENĪBAS_PIEZĪMES}
                                    className="create-item-nav-textarea"
                                    rows="2"
                                />
                            </div>
                        </section>

                        {/* Related Items Section - renamed to Saistītās glabājamās vienības */}
                        <section ref={sectionRefs.related} className="create-item-nav-section" id="related">
                            <h3 className="create-item-nav-section-header">
                                <span className="create-item-nav-section-icon"><i className="fas fa-link"></i></span>
                                {ITEM_CREATE_FORM_UI.SECTION_RELATED}
                            </h3>

                            {/* Search without label - section title indicates context */}
                            <div className="create-item-nav-field">
                                <input
                                    ref={relatedSearchRef}
                                    type="text"
                                    value={relatedItemsSearch}
                                    onChange={handleRelatedItemsSearchChange}
                                    onBlur={handleRelatedSearchBlur}
                                    onFocus={() => relatedItemsSearch && setShowRelatedItemsDropdown(true)}
                                    placeholder={ITEM_CREATE_FORM_UI.PLACEHOLDER_MEKLĒT_VIENĪBAS}
                                    className="create-item-nav-input"
                                />
                            </div>

                            {/* Dropdown Items */}
                            {showRelatedItemsDropdown && filteredItems.length > 0 && (
                                <div ref={relatedDropdownRef} className="create-item-nav-related-dropdown">
                                    {filteredItems.slice(0, 10).map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleRelatedItem(item)}
                                            className="create-item-nav-related-dropdown-item"
                                        >
                                            <span className="related-dropdown-us">{ITEM_CREATE_FORM_UI.DROPDOWN_LABEL_US} {item.inventoryNumber || relativeInventory.number}</span>
                                            <span className="related-dropdown-gv">{ITEM_CREATE_FORM_UI.DROPDOWN_LABEL_GV} {item.number}</span>
                                            <span className="related-dropdown-name">{item.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Selected Items Table - Column order: US, GV, NOSAUKUMS */}
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
                                            selectedRelatedItems.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.inventoryNumber || relativeInventory.number}</td>
                                                    <td>{item.number}</td>
                                                    <td>{item.title}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRelatedItem(item.id)}
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
                        </section>
                    </div>
                </div>

                {/* Footer with action buttons */}
                <div className="create-item-nav-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="create-item-nav-btn create-item-nav-btn-cancel"
                    >
                        {ITEM_CREATE_FORM_UI.CANCEL_BTN}
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="create-item-nav-btn create-item-nav-btn-primary"
                    >
                        {isSubmitting ? ITEM_CREATE_FORM_UI.CREATING_BTN : ITEM_CREATE_FORM_UI.CREATE_BTN}
                    </button>
                </div>
            </form>
        </div>,
        document.body // CRITICAL: Render directly to body, bypassing parent container constraints
    );
};

export default CreateItemNavigable;
