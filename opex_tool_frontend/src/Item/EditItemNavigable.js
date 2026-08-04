import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import ReactDOM from "react-dom";
import CalendarComponent from "../Utils/CalendarComponent";
import { GeneralError, GeneralSuccess, FieldError } from '../components/ErrorDisplay';
import { useFormErrors } from '../hooks/useFormErrors';
import {
    validateItemUpdate,
    isLanguageRequired,
    isAnnotationRequired,
    isRestrictionNoteRequired,
    getRemainingChars,
    getItemUpdatePayload,
    TITLE_MAX_LENGTH,
    SERIES_CODE_MAX_LENGTH,
    ANNOTATION_MAX_LENGTH,
    NOTES_MAX_LENGTH,
    RESTRICTION_NOTE_MAX_LENGTH
} from '../Constants/itemConstants';
import { ITEM_CREATE_FORM_UI } from '../Constants/Constants';
import './EditItemNavigable.css';
import Utils from "../Utils/Utils";
import { useNavigation } from '../Navigation/context/NavigationContext';
import HelpButton from '../Help/HelpButton';
import FieldHelp from '../components/FieldHelp';

const EditItemNavigable = forwardRef(({ onClose, onUpdate, item, inventory, prevItem, nextItem, onNavigate }, ref) => {
    const utils = Utils();
    const { getAllItemsFromProject } = useNavigation();

    // Portal container ref
    const [portalContainer] = useState(() => {
        const div = document.createElement('div');
        div.setAttribute('data-edit-item-portal', 'true');
        return div;
    });

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

    // Navigation menu items - using constants
    const navItems = [
        { id: 'basic', label: ITEM_CREATE_FORM_UI.SECTION_BASIC, icon: 'fa-info-circle' },
        { id: 'dates', label: ITEM_CREATE_FORM_UI.SECTION_DATES, icon: 'fa-calendar-alt' },
        { id: 'technical', label: ITEM_CREATE_FORM_UI.SECTION_TECHNICAL, icon: 'fa-cog' },
        { id: 'description', label: ITEM_CREATE_FORM_UI.SECTION_DESCRIPTION, icon: 'fa-file-alt' },
        { id: 'access', label: ITEM_CREATE_FORM_UI.SECTION_ACCESS, icon: 'fa-lock' },
        { id: 'related', label: ITEM_CREATE_FORM_UI.SECTION_RELATED, icon: 'fa-link' }
    ];

    // Available languages for multi-select
    const availableLanguages = ITEM_CREATE_FORM_UI.LANGUAGES;

    // Initial form state from existing item
    const getInitialFormData = () => ({
        series_code: item.series_code || "",
        number: item.number || 0,
        title: item.title || "",
        start_date: item.start_date || "",
        end_date: item.end_date || "",
        date_indicator: item.date_indicator || "day",
        date_note: item.date_note || "",
        size: item.size || 0,
        unit_of_measure: item.unit_of_measure || ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.LAPAS,
        notes: item.notes || "",
        annotation: item.annotation || "",
        sistematisation: item.sistematisation || "",
        language: item.language ? (typeof item.language === 'string' ? item.language.split(/,\s*/).map(l => l.trim()).filter(Boolean) : item.language) : [ITEM_CREATE_FORM_UI.LANGUAGES[0]],
        restriction: item.restriction || ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA,
        restriction_note: item.restriction_note || "",
        security_level: item.security_level || ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.PUBLISKS,
        security_level_note: item.security_level_note || "",
        copy: item.copy || "",
        archival_history: item.archival_history || "",
        related_item_list: item.related_item || [],
        inventory: inventory.number
    });

    const [formData, setFormData] = useState(getInitialFormData);
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get all items for related items dropdown - MUST be defined before state initialization
    const allItems = getAllItemsFromProject() || [];

    // Related items state - initialize with existing related items
    const [relatedItemsSearch, setRelatedItemsSearch] = useState("");
    const [selectedRelatedItems, setSelectedRelatedItems] = useState(
        item.related_item && item.related_item.length > 0 ?
        allItems.filter(i => item.related_item.includes(i.id)) :
        []
    );
    const [showRelatedItemsDropdown, setShowRelatedItemsDropdown] = useState(false);

    // Language search state
    const [languageSearch, setLanguageSearch] = useState("");
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

    // Error handling
    const { generalError, setGeneralError, setApiErrors, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    const filteredItems = allItems.filter(i =>
        i.id !== item.id &&
        !selectedRelatedItems.some(selected => selected.id === i.id) &&
        (i.number?.toString().includes(relatedItemsSearch) ||
         i.title?.toLowerCase().includes(relatedItemsSearch.toLowerCase()))
    );

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

    // Mount portal to document body
    useEffect(() => {
        document.body.appendChild(portalContainer);

        // Prevent body scroll when modal is open
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.removeChild(portalContainer);
            document.body.style.overflow = originalOverflow;
        };
    }, [portalContainer]);

    // Intersection observer for active section tracking
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -66%',
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    setActiveSection(sectionId);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        Object.values(sectionRefs).forEach((ref) => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => observer.disconnect();
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle language toggle (tag-based)
    const toggleLanguage = (lang) => {
        setFormData(prev => {
            const currentLanguages = prev.language || [];
            const isSelected = currentLanguages.includes(lang);

            if (isSelected) {
                // Remove language (allow removing all)
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

            if (filteredLanguages.length > 0) {
                toggleLanguage(filteredLanguages[0]);
            } else if (languageSearch.trim()) {
                addCustomLanguage();
            }
        }
    };

    // Remove language tag
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

    // Handle date changes with inventory date validation
    const handleDateChange = (startDate, endDate, view) => {
        setFormData(prev => ({
            ...prev,
            start_date: startDate ? utils.formatDate(startDate) : "",
            end_date: endDate ? utils.formatDate(endDate) : "",
            date_indicator: view
        }));

        // Validate against inventory end date only
        if (endDate && inventory.end_date) {
            const itemEndDate = new Date(endDate);
            const inventoryEndDate = new Date(inventory.end_date);

            if (itemEndDate > inventoryEndDate) {
                setGeneralError(ITEM_CREATE_FORM_UI.DATE_VALIDATION_ERROR
                    .replace('{itemDate}', utils.formatDate(endDate))
                    .replace('{inventoryDate}', utils.formatDate(inventoryEndDate)));
            } else {
                clearErrors();
            }
        }
    };

    const saveItem = async () => {
        setIsSubmitting(true);
        clearErrors();
        setSuccessMessage("");

        // Single source of truth for "what a full item PUT looks like" —
        // also used by every section-edit popup.
        const payload = getItemUpdatePayload(item, inventory, formData);

        // Client-side validation
        const validation = validateItemUpdate(payload, inventory);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            setIsSubmitting(false);
            // Scroll to first error
            const firstErrorField = Object.keys(validation.errors)[0];
            if (firstErrorField) {
                const sectionMap = {
                    series_code: 'basic',
                    title: 'basic',
                    start_date: 'dates',
                    end_date: 'dates',
                    date_indicator: 'dates',
                    annotation: 'description',
                    language: 'basic',
                    restriction: 'access',
                    restriction_note: 'access',
                    security_level: 'access'
                };
                const targetSection = sectionMap[firstErrorField] || 'basic';
                scrollToSection(targetSection);
            }
            return false;
        }

        try {
            await onUpdate(item.id, payload);
            setIsSubmitting(false);
            return true;
        } catch (error) {
            if (error.fieldErrors) {
                setApiErrors({ ...error.fieldErrors, error: error.message });
            } else {
                setGeneralError(error.message || ITEM_CREATE_FORM_UI.ERROR_OCCURRED);
            }
            setIsSubmitting(false);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await saveItem();
        if (success) {
            setSuccessMessage(ITEM_CREATE_FORM_UI.SUCCESS_UPDATE);
            setTimeout(() => {
                onClose();
            }, 1000);
        }
    };

    useImperativeHandle(ref, () => ({
        triggerSave: saveItem
    }));

    const handleSaveAndNavigate = async (direction) => {
        const success = await saveItem();
        if (success && onNavigate) {
            onNavigate(direction);
        }
    };

    const scrollToSection = (sectionId) => {
        const sectionRef = sectionRefs[sectionId];
        if (sectionRef.current) {
            sectionRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Related items handlers
    const handleRelatedItemsSearchChange = (e) => {
        setRelatedItemsSearch(e.target.value);
        setShowRelatedItemsDropdown(e.target.value.length > 0);
    };

    // Clear search closes dropdown
    const handleRelatedSearchBlur = () => {
        setTimeout(() => {
            if (!relatedItemsSearch) {
                setShowRelatedItemsDropdown(false);
            }
        }, 200);
    };

    const toggleRelatedItem = (relatedItem) => {
        const isSelected = selectedRelatedItems.some(i => i.id === relatedItem.id);
        let newSelectedItems;

        if (isSelected) {
            newSelectedItems = selectedRelatedItems.filter(i => i.id !== relatedItem.id);
        } else {
            newSelectedItems = [...selectedRelatedItems, relatedItem];
        }

        setSelectedRelatedItems(newSelectedItems);
        const relatedIds = newSelectedItems.map(i => i.id);
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
        const relatedIds = newSelectedItems.map(i => i.id);
        setFormData(prev => ({
            ...prev,
            related_item_list: relatedIds
        }));
    };

    // Generate title with number
    const formTitle = ITEM_CREATE_FORM_UI.TITLE_EDIT_WITH_NUMBER.replace('{number}', formData.number);
    const formSubtitle = ITEM_CREATE_FORM_UI.SUBTITLE.replace('{inventory}', formData.inventory);

    // FIXED: Use React Portal to render directly to document.body
    return ReactDOM.createPortal(
        <div className="create-item-nav-modal-overlay">
            <form onSubmit={handleSubmit} className="create-item-nav-container">
                {/* Header */}
                <div className="create-item-nav-header">
                    <div className="create-item-nav-header-content">
                        <h2 className="create-item-nav-title">{formTitle}</h2>
                        <div className="create-item-nav-subtitle">{formSubtitle}</div>
                    </div>
                    <div className="create-item-nav-header-actions">
                        {(prevItem || nextItem) && (
                            <div className="edit-nav-arrows">
                                <button
                                    type="button"
                                    className="edit-nav-arrow-btn"
                                    disabled={!prevItem || isSubmitting}
                                    onClick={() => handleSaveAndNavigate(-1)}
                                    title={prevItem ? `Saglabāt un pāriet uz: ${prevItem.number} - ${prevItem.title || ''}` : 'Nav iepriekšējās'}
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <button
                                    type="button"
                                    className="edit-nav-arrow-btn"
                                    disabled={!nextItem || isSubmitting}
                                    onClick={() => handleSaveAndNavigate(1)}
                                    title={nextItem ? `Saglabāt un pāriet uz: ${nextItem.number} - ${nextItem.title || ''}` : 'Nav nākamās'}
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        )}
                        <HelpButton chapterId="items" sectionId="create-item" iconOnly={true} className="small" />
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
                            {navItems.map(navItem => (
                                <div
                                    key={navItem.id}
                                    className={`create-item-nav-menu-item ${
                                        activeSection === navItem.id ? 'create-item-nav-menu-item-active' : ''
                                    }`}
                                    onClick={() => scrollToSection(navItem.id)}
                                >
                                    <span className="create-item-nav-menu-icon"><i className={`fas ${navItem.icon}`}></i></span>
                                    <span className="create-item-nav-menu-text">{navItem.label}</span>
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
                                    <FieldHelp entity="item" field="series_code" />
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
                                    <FieldHelp entity="item" field="title" />
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
                                    <FieldHelp entity="item" field="language" />
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
                                    <FieldHelp entity="item" field="date_note" />
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
                            {!inventory.electronic && (
                                <div className="create-item-nav-field-row">
                                    <div className="create-item-nav-field">
                                        <label className="create-item-nav-field-label">
                                            {ITEM_CREATE_FORM_UI.FIELD_APJOMS}
                                            <FieldHelp entity="item" field="size" />
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
                                            <FieldHelp entity="item" field="unit_of_measure" />
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
                                    <FieldHelp entity="item" field="copy" />
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
                                    <FieldHelp entity="item" field="archival_history" />
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
                                    <FieldHelp entity="item" field="sistematisation" />
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
                                    <FieldHelp entity="item" field="annotation" />
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
                                    <FieldHelp entity="item" field="notes" />
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
                                        <FieldHelp entity="item" field="restriction" />
                                    </label>
                                    <select
                                        name="restriction"
                                        value={formData.restriction}
                                        onChange={handleChange}
                                        className="create-item-nav-select"
                                    >
                                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA}>{ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA}</option>
                                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.IEROBEŽOTA}>{ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.IEROBEŽOTA}</option>
                                        <option value={ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.SENSITĪVI_DATI}>{ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.SENSITĪVI_DATI}</option>
                                    </select>
                                </div>

                                <div className="create-item-nav-field">
                                    <label className="create-item-nav-field-label">
                                        {ITEM_CREATE_FORM_UI.FIELD_SLEPENĪBA}
                                        <FieldHelp entity="item" field="security_level" />
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
                                    <FieldHelp entity="item" field="restriction_note" />
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
                                    <FieldHelp entity="item" field="security_level_note" />
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
                                    {filteredItems.slice(0, 10).map(filteredItem => (
                                        <div
                                            key={filteredItem.id}
                                            onClick={() => toggleRelatedItem(filteredItem)}
                                            className="create-item-nav-related-dropdown-item"
                                        >
                                            <span className="related-dropdown-us">{ITEM_CREATE_FORM_UI.DROPDOWN_LABEL_US} {filteredItem.inventoryNumber || inventory.number}</span>
                                            <span className="related-dropdown-gv">{ITEM_CREATE_FORM_UI.DROPDOWN_LABEL_GV} {filteredItem.number}</span>
                                            <span className="related-dropdown-name">{filteredItem.title}</span>
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
                        {isSubmitting ? ITEM_CREATE_FORM_UI.SAVING_BTN : ITEM_CREATE_FORM_UI.SAVE_BTN}
                    </button>
                </div>
            </form>
        </div>,
        document.body
    );
});

export default EditItemNavigable;
