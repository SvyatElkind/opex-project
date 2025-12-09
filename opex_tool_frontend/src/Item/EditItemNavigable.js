import React, { useState, useEffect, useRef } from "react";
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
    TITLE_MAX_LENGTH,
    SERIES_CODE_MAX_LENGTH,
    ANNOTATION_MAX_LENGTH,
    NOTES_MAX_LENGTH,
    RESTRICTION_NOTE_MAX_LENGTH
} from '../Constants/itemConstants';
import './EditItemNavigable.css';
import Utils from "../Utils/Utils";
import { useNavigation } from '../Navigation/context/NavigationContext';

const EditItemNavigable = ({ onClose, onUpdate, item, inventory }) => {
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
    
    // Active section tracking
    const [activeSection, setActiveSection] = useState('basic');
    
    // Navigation menu items (use Font Awesome icons like CreateItem)
    const navItems = [
        { id: 'basic', label: 'Pamatinformācija', icon: 'fa-info-circle' },
        { id: 'dates', label: 'Datuma Informācija', icon: 'fa-calendar-alt' },
        { id: 'technical', label: 'Tehniskā Informācija', icon: 'fa-cog' },
        { id: 'description', label: 'Apraksts', icon: 'fa-file-alt' },
        { id: 'access', label: 'Pieejamība un Drošība', icon: 'fa-lock' },
        { id: 'related', label: 'Saistītās Vienības', icon: 'fa-link' }
    ];

    // Available languages for multi-select (expanded list)
    const availableLanguages = [
        "Latviešu", "Krievu", "Angļu", "Vācu", "Franču", "Spāņu", "Itāļu",
        "Poļu", "Lietuviešu", "Igauņu", "Somu", "Zviedru", "Norvēģu", "Dāņu",
        "Holandiešu", "Portugāļu", "Grieķu", "Turku", "Arābu", "Ķīniešu",
        "Japāņu", "Korejiešu", "Hindi", "Hebrejsku", "Čehu", "Slovāku",
        "Rumāņu", "Bulgāru", "Ungāru", "Ukraiņu", "Serbu", "Horvātu", "Cita"
    ];
    
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
        unit_of_measure: item.unit_of_measure || "Lapas", // REQUIRED FIELD
        notes: item.notes || "",
        annotation: item.annotation || "",
        sistematisation: item.sistematisation || "",
        language: item.language ? (typeof item.language === 'string' ? item.language.split(', ').map(l => l.trim()) : item.language) : ["Latviešu"],
        restriction: item.restriction || "Vispārēja",
        restriction_note: item.restriction_note || "",
        security_level: item.security_level || "Publisks",
        security_level_note: item.security_level_note || "",
        copy: item.copy || "",
        archival_history: item.archival_history || "",
        related_item_list: item.related_item_list || [],
        inventory: inventory.number
    });
    
    const [formData, setFormData] = useState(getInitialFormData);
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get all items for related items dropdown - MUST be defined before state initialization
    const allItems = getAllItemsFromProject() || [];

    // Related items state
    const [relatedItemsSearch, setRelatedItemsSearch] = useState("");
    const [selectedRelatedItems, setSelectedRelatedItems] = useState(
        item.related_item_list ?
        allItems.filter(i => item.related_item_list.includes(i.id)) :
        []
    );
    const [showRelatedItemsDropdown, setShowRelatedItemsDropdown] = useState(false);

    // Language search state
    const [languageSearch, setLanguageSearch] = useState("");
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

    // Error handling
    const { generalError, setGeneralError, setApiErrors, clearErrors, getFieldError, setFieldErrors } = useFormErrors();
    const filteredItems = allItems.filter(item =>
        item.id !== formData.id &&
        !selectedRelatedItems.some(selected => selected.id === item.id) &&
        (item.number?.toString().includes(relatedItemsSearch) ||
         item.title?.toLowerCase().includes(relatedItemsSearch.toLowerCase()))
    );
    
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
                // Remove language (but keep at least one)
                const newLanguages = currentLanguages.filter(l => l !== lang);
                return {
                    ...prev,
                    language: newLanguages.length > 0 ? newLanguages : currentLanguages
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

    // Remove language tag
    const removeLanguage = (lang) => {
        setFormData(prev => {
            const currentLanguages = prev.language || [];
            const newLanguages = currentLanguages.filter(l => l !== lang);
            return {
                ...prev,
                language: newLanguages.length > 0 ? newLanguages : currentLanguages
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
                setGeneralError(`Vienības beigu datums (${utils.formatDate(endDate)}) nedrīkst būt vēlāks par uzskaites saraksta beigu datumu (${utils.formatDate(inventoryEndDate)})`);
            } else {
                clearErrors();
            }
        }
    };

    const handleSubmit = async (e) => {
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
        const validation = validateItemUpdate(validationData, inventory);
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
                    language: 'technical',
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
            // Convert language array to comma-separated string for API
            const submitData = {
                ...formData,
                language: Array.isArray(formData.language)
                    ? formData.language.join(', ')
                    : formData.language
            };
            await onUpdate(item.id, submitData);
            setSuccessMessage("Vienība veiksmīgi atjaunināta!");
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            if (error.fieldErrors) {
                setApiErrors({ ...error.fieldErrors, error: error.message });
            } else {
                setGeneralError(error.message || "Kļūda atjauninot vienību");
            }
        } finally {
            setIsSubmitting(false);
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
        setShowRelatedItemsDropdown(true);
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
    
    // FIXED: Use React Portal to render directly to document.body
    // This bypasses any parent container constraints and ensures proper fullscreen positioning
    return ReactDOM.createPortal(
        <div className="create-item-nav-modal-overlay">
            <form onSubmit={handleSubmit} className="create-item-nav-container">
                {/* Header */}
                <div className="create-item-nav-header">
                    <div className="create-item-nav-header-content">
                        <h2 className="create-item-nav-title">Rediģēt Glabājamā Vienība</h2>
                        <div className="create-item-nav-subtitle">
                            Uzskaites Saraksta {formData.inventory} Glabājamā vienība {formData.number}
                        </div>
                    </div>
                    <div className="create-item-nav-header-actions">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="create-item-nav-btn create-item-nav-btn-primary"
                        >
                            {isSubmitting ? "Saglabā..." : "Saglabāt Izmaiņas"}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="create-item-nav-btn create-item-nav-btn-cancel"
                        >
                            Atcelt
                        </button>
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
                                Pamatinformācija
                            </h3>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label create-item-nav-field-label-required">
                                    Sērijas kods:
                                </label>
                                <input
                                    type="text"
                                    name="series_code"
                                    required
                                    value={formData.series_code}
                                    onChange={handleChange}
                                    placeholder="Ievadiet sērijas kodu..."
                                    className="create-item-nav-input"
                                />
                                <FieldError error={getFieldError('series_code')} />
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label create-item-nav-field-label-required">
                                    Nosaukums:
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Ievadiet nosaukumu..."
                                    className="create-item-nav-input"
                                />
                                <FieldError error={getFieldError('title')} />
                            </div>

                            {/* Section errors */}
                            {(getFieldError('series_code') || getFieldError('title')) && (
                                <div className="create-item-nav-section-errors">
                                    <FieldError error={getFieldError('series_code')} />
                                    <FieldError error={getFieldError('title')} />
                                </div>
                            )}
                        </section>

                        {/* Date Information Section */}
                        <section ref={sectionRefs.dates} className="create-item-nav-section" id="dates">
                            <h3 className="create-item-nav-section-header">
                                <span className="create-item-nav-section-icon"><i className="fas fa-calendar-alt"></i></span>
                                Datuma Informācija
                            </h3>

                            <div className="create-item-nav-field">
                                <CalendarComponent
                                    onDateChange={handleDateChange}
                                    startDate={formData.start_date}
                                    endDate={formData.end_date}
                                    dateIndicator={formData.date_indicator}
                                />
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    Datuma piezīmes:
                                </label>
                                <input
                                    type="text"
                                    name="date_note"
                                    value={formData.date_note}
                                    onChange={handleChange}
                                    placeholder="Papildu informācija par datumiem..."
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
                                Tehniskā Informācija
                            </h3>

                            {/* Size and Unit of Measure - Only for Physical Documents */}
                            {!inventory.electronic && (
                                <div className="create-item-nav-field-row">
                                    <div className="create-item-nav-field">
                                        <label className="create-item-nav-field-label">
                                            Apjoms:
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
                                            Apjoma mērvienība:
                                        </label>
                                        <select
                                            name="unit_of_measure"
                                            value={formData.unit_of_measure}
                                            onChange={handleChange}
                                            className="create-item-nav-select"
                                        >
                                            <option value="Lapas">Lapas</option>
                                            <option value="Dokumenti">Dokumenti</option>
                                            <option value="Glabājamās vienības">Glabājamās vienības</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    Kopija:
                                </label>
                                <input
                                    type="text"
                                    name="copy"
                                    value={formData.copy}
                                    onChange={handleChange}
                                    placeholder="Kopijas informācija..."
                                    className="create-item-nav-input"
                                />
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    Arhīva vēsture:
                                </label>
                                <input
                                    type="text"
                                    name="archival_history"
                                    value={formData.archival_history}
                                    onChange={handleChange}
                                    placeholder="Arhivēšanas vēsture..."
                                    className="create-item-nav-input"
                                />
                            </div>
                        </section>

                        {/* Description Section */}
                        <section ref={sectionRefs.description} className="create-item-nav-section" id="description">
                            <h3 className="create-item-nav-section-header">
                                <span className="create-item-nav-section-icon"><i className="fas fa-file-alt"></i></span>
                                Apraksts
                            </h3>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    Valoda:
                                </label>

                                {/* Selected Language Tags */}
                                {formData.language?.length > 0 && (
                                    <div className="create-item-nav-language-tags">
                                        {formData.language.map(lang => (
                                            <div key={lang} className="create-item-nav-language-tag">
                                                <span className="language-tag-text">{lang}</span>
                                                {formData.language.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLanguage(lang)}
                                                        className="language-tag-remove"
                                                        title="Noņemt"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Language Search Input */}
                                <input
                                    type="text"
                                    value={languageSearch}
                                    onChange={handleLanguageSearchChange}
                                    onFocus={() => setShowLanguageDropdown(true)}
                                    placeholder="Meklēt un pievienot valodu..."
                                    className="create-item-nav-input"
                                />

                                {/* Language Dropdown */}
                                {showLanguageDropdown && filteredLanguages.length > 0 && (
                                    <div className="create-item-nav-language-dropdown">
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
                                    <div className="create-item-nav-language-dropdown">
                                        <div className="create-item-nav-language-no-results">
                                            Nav atrasta valoda "{languageSearch}"
                                        </div>
                                    </div>
                                )}

                                <FieldError error={getFieldError('language')} />
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    Piezīmes:
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Vispārīgas piezīmes..."
                                    className="create-item-nav-textarea"
                                    rows="3"
                                />
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    Anotācija:
                                </label>
                                <textarea
                                    name="annotation"
                                    value={formData.annotation}
                                    onChange={handleChange}
                                    placeholder="Detalizēts apraksts..."
                                    className="create-item-nav-textarea"
                                    rows="3"
                                />
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    Sistematizācija:
                                </label>
                                <input
                                    type="text"
                                    name="sistematisation"
                                    value={formData.sistematisation}
                                    onChange={handleChange}
                                    placeholder="Sistematizācijas kods..."
                                    className="create-item-nav-input"
                                />
                            </div>
                        </section>

                        {/* Access and Security Section */}
                        <section ref={sectionRefs.access} className="create-item-nav-section" id="access">
                            <h3 className="create-item-nav-section-header">
                                <span className="create-item-nav-section-icon"><i className="fas fa-lock"></i></span>
                                Pieejamība un Drošība
                            </h3>

                            <div className="create-item-nav-field-row">
                                <div className="create-item-nav-field">
                                    <label className="create-item-nav-field-label">
                                        Ierobežojumi:
                                    </label>
                                    <select
                                        name="restriction"
                                        value={formData.restriction}
                                        onChange={handleChange}
                                        className="create-item-nav-select"
                                    >
                                        <option value="Vispārēja">Vispārēja</option>
                                        <option value="Ierobežota">Ierobežota</option>
                                        <option value="Stingri ierobežota">Stingri ierobežota</option>
                                    </select>
                                </div>

                                <div className="create-item-nav-field">
                                    <label className="create-item-nav-field-label">
                                        Drošības līmenis:
                                    </label>
                                    <select
                                        name="security_level"
                                        value={formData.security_level}
                                        onChange={handleChange}
                                        className="create-item-nav-select"
                                    >
                                        <option value="Publisks">Publisks</option>
                                        <option value="Iekšējs">Iekšējs</option>
                                        <option value="Konfidenciāls">Konfidenciāls</option>
                                        <option value="Slepens">Slepens</option>
                                    </select>
                                </div>
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    Ierobežojumu piezīmes:
                                </label>
                                <textarea
                                    name="restriction_note"
                                    value={formData.restriction_note}
                                    onChange={handleChange}
                                    placeholder="Papildu informācija par ierobežojumiem..."
                                    className="create-item-nav-textarea"
                                    rows="2"
                                />
                            </div>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    Drošības piezīmes:
                                </label>
                                <textarea
                                    name="security_level_note"
                                    value={formData.security_level_note}
                                    onChange={handleChange}
                                    placeholder="Papildu informācija par drošību..."
                                    className="create-item-nav-textarea"
                                    rows="2"
                                />
                            </div>
                        </section>

                        {/* Related Items Section */}
                        <section ref={sectionRefs.related} className="create-item-nav-section" id="related">
                            <h3 className="create-item-nav-section-header">
                                <span className="create-item-nav-section-icon"><i className="fas fa-link"></i></span>
                                Saistītās Vienības
                            </h3>

                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    Meklēt vienības:
                                </label>
                                <input
                                    type="text"
                                    value={relatedItemsSearch}
                                    onChange={handleRelatedItemsSearchChange}
                                    onFocus={() => setShowRelatedItemsDropdown(true)}
                                    placeholder="Meklēt pēc numura vai nosaukuma..."
                                    className="create-item-nav-input"
                                />
                            </div>

                            {/* Dropdown Items */}
                            {showRelatedItemsDropdown && filteredItems.length > 0 && (
                                <div className="create-item-nav-related-dropdown">
                                    {filteredItems.slice(0, 10).map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleRelatedItem(item)}
                                            className="create-item-nav-related-dropdown-item"
                                        >
                                            <span className="related-dropdown-gv">GV: {item.number}</span>
                                            <span className="related-dropdown-us">US: {inventory.number}</span>
                                            <span className="related-dropdown-name">{item.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Selected Items Table */}
                            {selectedRelatedItems.length > 0 && (
                                <div className="create-item-nav-related-table-wrapper">
                                    <table className="create-item-nav-related-table">
                                        <thead>
                                            <tr>
                                                <th>GV</th>
                                                <th>US</th>
                                                <th>Nosaukums</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedRelatedItems.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.number}</td>
                                                    <td>{inventory.number}</td>
                                                    <td>{item.title}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRelatedItem(item.id)}
                                                            className="create-item-nav-related-remove-btn"
                                                            title="Noņemt"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {selectedRelatedItems.length === 0 && (
                                <div className="create-item-nav-related-empty">
                                    Nav izvēlētas saistītās vienības
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </form>
        </div>,
        document.body // CRITICAL: Render directly to body, bypassing parent container constraints
    );
};

export default EditItemNavigable;