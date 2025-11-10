import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CalendarComponent from "../Utils/CalendarComponent";
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
    
    // Navigation menu items
    const navItems = [
        { id: 'basic', label: 'Pamatinformācija', icon: '📋' },
        { id: 'dates', label: 'Datuma Informācija', icon: '📅' },
        { id: 'technical', label: 'Tehniskā Informācija', icon: '⚙️' },
        { id: 'description', label: 'Apraksts', icon: '📝' },
        { id: 'access', label: 'Pieejamība un Drošība', icon: '🔒' },
        { id: 'related', label: 'Saistītās Vienības', icon: '🔗' }
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
        notes: item.notes || "",
        annotation: item.annotation || "",
        author: item.author || "",
        location: item.location || "",
        language: item.language || "",
        copy: item.copy || "",
        physical_description: item.physical_description || "",
        extent: item.extent || "",
        format: item.format || "",
        condition: item.condition || "",
        storage_location: item.storage_location || "",
        access_level: item.access_level || "public",
        restrictions: item.restrictions || "",
        copyright: item.copyright || "",
        related_items: item.related_items || []
    });
    
    const [formData, setFormData] = useState(getInitialFormData);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showRelatedItemsDropdown, setShowRelatedItemsDropdown] = useState(false);
    const [relatedItemSearchQuery, setRelatedItemSearchQuery] = useState("");
    
    // Get all items for related items selection
    const allItems = getAllItemsFromProject ? getAllItemsFromProject() : [];
    const filteredItems = allItems.filter(i => 
        i.id !== item.id && 
        (i.title.toLowerCase().includes(relatedItemSearchQuery.toLowerCase()) ||
         i.series_code.toLowerCase().includes(relatedItemSearchQuery.toLowerCase()))
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
    
    const handleDateChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.series_code || !formData.title) {
            setErrorMessage("Sērijas kods un Nosaukums ir obligāti!");
            setTimeout(() => setErrorMessage(""), 3000);
            return;
        }
        
        try {
            await onUpdate(item.id, formData);
            setSuccessMessage("Vienība veiksmīgi atjaunināta!");
            setTimeout(() => {
                setSuccessMessage("");
                onClose();
            }, 1500);
        } catch (error) {
            setErrorMessage("Kļūda atjauninot vienību");
            setTimeout(() => setErrorMessage(""), 3000);
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
    
    const toggleRelatedItem = (relatedItem) => {
        const isAlreadyRelated = formData.related_items.some(ri => ri.id === relatedItem.id);
        
        if (isAlreadyRelated) {
            setFormData(prev => ({
                ...prev,
                related_items: prev.related_items.filter(ri => ri.id !== relatedItem.id)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                related_items: [...prev.related_items, relatedItem]
            }));
        }
    };
    
    const removeRelatedItem = (itemId) => {
        setFormData(prev => ({
            ...prev,
            related_items: prev.related_items.filter(ri => ri.id !== itemId)
        }));
    };
    
    // Portal content
    const modalContent = (
        <div className="edit-item-nav-modal-overlay" onClick={onClose}>
            <form 
                className="edit-item-nav-container" 
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="edit-item-nav-header">
                    <div className="edit-item-nav-header-content">
                        <h2 className="edit-item-nav-title">Rediģēt Vienību</h2>
                        <p className="edit-item-nav-subtitle">
                            GV:{item.number} • {item.series_code}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="edit-item-nav-close-btn"
                        aria-label="Aizvērt"
                    >
                        ×
                    </button>
                </header>
                
                {/* Messages */}
                {successMessage && (
                    <div className="edit-item-nav-message edit-item-nav-message-success">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="edit-item-nav-message edit-item-nav-message-error">
                        {errorMessage}
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="edit-item-nav-actions">
                    <button
                        type="submit"
                        className="edit-item-nav-btn edit-item-nav-btn-primary"
                    >
                        💾 Saglabāt Izmaiņas
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="edit-item-nav-btn edit-item-nav-btn-cancel"
                    >
                        ✖ Atcelt
                    </button>
                </div>
                
                {/* Two-Column Layout */}
                <div className="edit-item-nav-body">
                    {/* Left Sidebar Navigation */}
                    <aside className="edit-item-nav-sidebar">
                        <nav className="edit-item-nav-menu">
                            {navItems.map((navItem) => (
                                <div
                                    key={navItem.id}
                                    className={`edit-item-nav-menu-item ${
                                        activeSection === navItem.id ? 
                                        'edit-item-nav-menu-item-active' : ''
                                    }`}
                                    onClick={() => scrollToSection(navItem.id)}
                                >
                                    <span className="edit-item-nav-menu-icon">{navItem.icon}</span>
                                    <span className="edit-item-nav-menu-text">{navItem.label}</span>
                                </div>
                            ))}
                        </nav>
                    </aside>
                    
                    {/* Right Content Area */}
                    <div className="edit-item-nav-content">
                        {/* Basic Information Section */}
                        <section ref={sectionRefs.basic} className="edit-item-nav-section" id="basic">
                            <h3 className="edit-item-nav-section-header">
                                <span className="edit-item-nav-section-icon">📋</span>
                                Pamatinformācija
                            </h3>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label edit-item-nav-field-label-required">
                                    Sērijas kods:
                                </label>
                                <input 
                                    type="text" 
                                    name="series_code" 
                                    required 
                                    value={formData.series_code} 
                                    onChange={handleChange}
                                    placeholder="Ievadiet sērijas kodu..."
                                    className="edit-item-nav-input"
                                />
                            </div>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label edit-item-nav-field-label-required">
                                    Nosaukums:
                                </label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    required 
                                    value={formData.title} 
                                    onChange={handleChange}
                                    placeholder="Ievadiet nosaukumu..."
                                    className="edit-item-nav-input"
                                />
                            </div>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Autors:
                                </label>
                                <input 
                                    type="text" 
                                    name="author" 
                                    value={formData.author} 
                                    onChange={handleChange}
                                    placeholder="Ievadiet autoru..."
                                    className="edit-item-nav-input"
                                />
                            </div>
                        </section>

                        {/* Dates Section */}
                        <section ref={sectionRefs.dates} className="edit-item-nav-section" id="dates">
                            <h3 className="edit-item-nav-section-header">
                                <span className="edit-item-nav-section-icon">📅</span>
                                Datuma Informācija
                            </h3>
                            
                            <div className="edit-item-nav-calendar-grid">
                                <div className="edit-item-nav-field">
                                    <label className="edit-item-nav-field-label">
                                        Datums:
                                    </label>
                                    <CalendarComponent
                                        value={formData.start_date}
                                        onChange={(val) => handleDateChange('start_date', val)}
                                        placeholder="Izvēlieties sākuma datumu"
                                    />
                                </div>
                            </div>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Datuma piezīmes:
                                </label>
                                <textarea 
                                    name="date_note" 
                                    value={formData.date_note}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Ievadiet datuma piezīmes..."
                                    className="edit-item-nav-textarea"
                                />
                            </div>
                        </section>

                        {/* Technical Information Section */}
                        <section ref={sectionRefs.technical} className="edit-item-nav-section" id="technical">
                            <h3 className="edit-item-nav-section-header">
                                <span className="edit-item-nav-section-icon">⚙️</span>
                                Tehniskā Informācija
                            </h3>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Valoda:
                                </label>
                                <input 
                                    type="text" 
                                    name="language" 
                                    value={formData.language}
                                    onChange={handleChange}
                                    placeholder="Ievadiet valodu..."
                                    className="edit-item-nav-input"
                                />
                            </div>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Fiziskais apraksts:
                                </label>
                                <input 
                                    type="text" 
                                    name="physical_description"
                                    value={formData.physical_description}
                                    onChange={handleChange}
                                    placeholder="Ievadiet fizisko aprakstu..."
                                    className="edit-item-nav-input"
                                />
                            </div>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Apjoms:
                                </label>
                                <input 
                                    type="text" 
                                    name="extent"
                                    value={formData.extent}
                                    onChange={handleChange}
                                    placeholder="Ievadiet apjomu..."
                                    className="edit-item-nav-input"
                                />
                            </div>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Formāts:
                                </label>
                                <input 
                                    type="text" 
                                    name="format"
                                    value={formData.format}
                                    onChange={handleChange}
                                    placeholder="Ievadiet formātu..."
                                    className="edit-item-nav-input"
                                />
                            </div>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Stāvoklis:
                                </label>
                                <input 
                                    type="text" 
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    placeholder="Ievadiet stāvokli..."
                                    className="edit-item-nav-input"
                                />
                            </div>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Glabāšanas vieta:
                                </label>
                                <input 
                                    type="text" 
                                    name="storage_location"
                                    value={formData.storage_location}
                                    onChange={handleChange}
                                    placeholder="Ievadiet glabāšanas vietu..."
                                    className="edit-item-nav-input"
                                />
                            </div>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Kopija:
                                </label>
                                <input 
                                    type="text" 
                                    name="copy"
                                    value={formData.copy}
                                    onChange={handleChange}
                                    placeholder="Ievadiet kopijas informāciju..."
                                    className="edit-item-nav-input"
                                />
                            </div>
                        </section>

                        {/* Description Section */}
                        <section ref={sectionRefs.description} className="edit-item-nav-section" id="description">
                            <h3 className="edit-item-nav-section-header">
                                <span className="edit-item-nav-section-icon">📝</span>
                                Apraksts
                            </h3>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Anotācija:
                                </label>
                                <textarea 
                                    name="annotation"
                                    value={formData.annotation}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Ievadiet anotāciju..."
                                    className="edit-item-nav-textarea"
                                />
                            </div>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Piezīmes:
                                </label>
                                <textarea 
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Ievadiet piezīmes..."
                                    className="edit-item-nav-textarea"
                                />
                            </div>
                        </section>

                        {/* Access and Security Section */}
                        <section ref={sectionRefs.access} className="edit-item-nav-section" id="access">
                            <h3 className="edit-item-nav-section-header">
                                <span className="edit-item-nav-section-icon">🔒</span>
                                Pieejamība un Drošība
                            </h3>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Piekļuves līmenis:
                                </label>
                                <select 
                                    name="access_level"
                                    value={formData.access_level}
                                    onChange={handleChange}
                                    className="edit-item-nav-select"
                                >
                                    <option value="public">Publisks</option>
                                    <option value="restricted">Ierobežots</option>
                                    <option value="private">Privāts</option>
                                </select>
                            </div>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Ierobežojumi:
                                </label>
                                <textarea 
                                    name="restrictions"
                                    value={formData.restrictions}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Ievadiet ierobežojumus..."
                                    className="edit-item-nav-textarea"
                                />
                            </div>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Autortiesības:
                                </label>
                                <textarea 
                                    name="copyright"
                                    value={formData.copyright}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Ievadiet autortiesību informāciju..."
                                    className="edit-item-nav-textarea"
                                />
                            </div>
                        </section>

                        {/* Related Items Section */}
                        <section ref={sectionRefs.related} className="edit-item-nav-section" id="related">
                            <h3 className="edit-item-nav-section-header">
                                <span className="edit-item-nav-section-icon">🔗</span>
                                Saistītās Vienības
                            </h3>
                            
                            <div className="edit-item-nav-field">
                                <label className="edit-item-nav-field-label">
                                    Meklēt vienības:
                                </label>
                                <input 
                                    type="text"
                                    value={relatedItemSearchQuery}
                                    onChange={(e) => {
                                        setRelatedItemSearchQuery(e.target.value);
                                        setShowRelatedItemsDropdown(true);
                                    }}
                                    onFocus={() => setShowRelatedItemsDropdown(true)}
                                    placeholder="Meklēt vienības pēc nosaukuma vai koda..."
                                    className="edit-item-nav-input"
                                />
                            </div>
                            
                            {/* Selected Related Items */}
                            {formData.related_items.length > 0 && (
                                <div className="edit-item-nav-tags-container">
                                    {formData.related_items.map((relatedItem) => (
                                        <div key={relatedItem.id} className="edit-item-nav-tag">
                                            <span className="edit-item-nav-tag-content">
                                                <span className="edit-item-nav-tag-number">GV:{relatedItem.number}</span>
                                                <span className="edit-item-nav-tag-separator"> - </span>
                                                <span className="edit-item-nav-tag-code">{relatedItem.series_code}</span>
                                                <span className="edit-item-nav-tag-separator"> :: </span>
                                                <span className="edit-item-nav-tag-title">{relatedItem.title}</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeRelatedItem(relatedItem.id)}
                                                className="edit-item-nav-remove-tag-btn"
                                                aria-label="Noņemt"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Dropdown Items */}
                            {showRelatedItemsDropdown && filteredItems.length > 0 && (
                                <div className="edit-item-nav-dropdown">
                                    {filteredItems.slice(0, 10).map(filteredItem => (
                                        <div
                                            key={filteredItem.id}
                                            onClick={() => toggleRelatedItem(filteredItem)}
                                            className="edit-item-nav-dropdown-item"
                                        >
                                            GV:{filteredItem.number} - {filteredItem.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </form>
        </div>
    );
    
    // Render portal
    return createPortal(modalContent, portalContainer);
};

export default EditItemNavigable;