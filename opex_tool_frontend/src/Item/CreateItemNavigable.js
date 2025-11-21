// CreateItemNavigable.js - Two-Column Layout with Navigation (WITH REACT PORTAL FIX)
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom"; // ADDED: For Portal rendering
import CalendarComponent from "../Utils/CalendarComponent";
import './CreateItemNavigable.css';
import Utils from "../Utils/Utils";
import { useNavigation } from '../Navigation/context/NavigationContext';

const CreateItemNavigable = ({ onClose, OnCreate, relativeInventory }) => {
    const utils = Utils();
    const { getAllItemsFromProject } = useNavigation();
    
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
        { id: 'basic', label: 'Pamatinformācija', icon: 'fa-info-circle' },
        { id: 'dates', label: 'Datuma Informācija', icon: 'fa-calendar-alt' },
        { id: 'technical', label: 'Tehniskā Informācija', icon: 'fa-cog' },
        { id: 'description', label: 'Apraksts', icon: 'fa-file-alt' },
        { id: 'access', label: 'Pieejamība un Drošība', icon: 'fa-lock' },
        { id: 'related', label: 'Saistītās Vienības', icon: 'fa-link' }
    ];
    
    // Initial form state
    const getInitialFormData = () => ({
        series_code: "",
        number: relativeInventory.last_gv + 1,
        title: "",
        start_date: "",
        end_date: "",
        date_indicator: "day",
        date_note: "",
        notes: "",
        annotation: "",
        sistematisation: "",
        language: "Latviešu",
        restriction: "Vispārēja",
        restriction_note: "",
        security_level: "Publisks",
        security_level_note: "",
        copy: "",
        archival_history: "",
        related_item_list: [],
        inventory: relativeInventory.number
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [itemsCreated, setItemsCreated] = useState(0);
    
    // Related items state
    const [relatedItemsSearch, setRelatedItemsSearch] = useState("");
    const [selectedRelatedItems, setSelectedRelatedItems] = useState([]);
    const [showRelatedItemsDropdown, setShowRelatedItemsDropdown] = useState(false);
    
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
    
    // Handle date changes
    const handleDateChange = (startDate, endDate, view) => {
        setFormData(prev => ({
            ...prev,
            start_date: startDate ? utils.formatDate(startDate) : "",
            end_date: endDate ? utils.formatDate(endDate) : "",
            date_indicator: view
        }));
    };
    
    // Reset form
    const resetForm = () => {
        const newFormData = getInitialFormData();
        newFormData.number = relativeInventory.last_gv + 1 + itemsCreated + 1;
        setFormData(newFormData);
        setErrorMessage("");
        setSelectedRelatedItems([]);
        setRelatedItemsSearch("");
        setShowRelatedItemsDropdown(false);
    };
    
    // Submit handler
    const handleSubmit = async (e, shouldContinue = false) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");
        
        try {
            const shouldClosePopup = !shouldContinue;
            const [success, result] = await OnCreate(formData, shouldClosePopup);
            
            if (success) {
                if (shouldContinue) {
                    setSuccessMessage(`Vienība "${formData.title}" izveidota veiksmīgi! Izveidojam vēl vienu...`);
                    setItemsCreated(prev => prev + 1);
                    
                    setTimeout(() => {
                        resetForm();
                        scrollToSection('basic');
                    }, 1000);
                } else {
                    onClose();
                }
            } else {
                setErrorMessage(result);
            }
        } catch (error) {
            setErrorMessage(error.message || "Notika kļūda");
        } finally {
            setIsSubmitting(false);
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
    
    // FIXED: Use React Portal to render directly to document.body
    // This bypasses any parent container constraints and ensures proper fullscreen positioning
    return ReactDOM.createPortal(
        <div className="create-item-nav-modal-overlay">
            <form onSubmit={(e) => handleSubmit(e, false)} className="create-item-nav-container">
                {/* Header */}
                <div className="create-item-nav-header">
                    <div className="create-item-nav-header-content">
                        <h2 className="create-item-nav-title">Jauna Glabājamā Vienība</h2>
                        <div className="create-item-nav-subtitle">
                            Uzskaites Saraksta {formData.inventory} Glabājamā vienība {formData.number}
                            {itemsCreated > 0 && ` (${itemsCreated} izveidoti)`}
                        </div>
                    </div>
                    <div className="create-item-nav-header-actions">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="create-item-nav-btn create-item-nav-btn-primary"
                        >
                            {isSubmitting ? "Izveido..." : "Izveidot Vienību"}
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

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="create-item-nav-message create-item-nav-message-success">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="create-item-nav-message create-item-nav-message-error">
                        {errorMessage}
                    </div>
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
                            </div>
                            
                            <div className="create-item-nav-field">
                                <label className="create-item-nav-field-label">
                                    Valoda:
                                </label>
                                <select 
                                    name="language" 
                                    value={formData.language} 
                                    onChange={handleChange}
                                    className="create-item-nav-select"
                                >
                                    <option value="Latviešu">Latviešu</option>
                                    <option value="Krievu">Krievu</option>
                                    <option value="Angļu">Angļu</option>
                                    <option value="Vācu">Vācu</option>
                                    <option value="Cita">Cita</option>
                                </select>
                            </div>
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
                        </section>
                        
                        {/* Technical Information Section */}
                        <section ref={sectionRefs.technical} className="create-item-nav-section" id="technical">
                            <h3 className="create-item-nav-section-header">
                                <span className="create-item-nav-section-icon"><i className="fas fa-cog"></i></span>
                                Tehniskā Informācija
                            </h3>
                            
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
                            
                            {/* Selected Items */}
                            {selectedRelatedItems.length > 0 && (
                                <div style={{
                                    marginTop: 'var(--spacing-3)',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 'var(--spacing-2)'
                                }}>
                                    {selectedRelatedItems.map(item => (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-2)',
                                                padding: 'var(--spacing-2) var(--spacing-3)',
                                                background: 'var(--color-primary)',
                                                color: 'var(--text-white)',
                                                borderRadius: 'var(--border-radius-full)',
                                                fontSize: 'var(--font-size-sm)'
                                            }}
                                        >
                                            <span>GV:{item.number} - {item.title}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeRelatedItem(item.id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--text-white)',
                                                    cursor: 'pointer',
                                                    fontSize: 'var(--font-size-lg)',
                                                    padding: '0',
                                                    lineHeight: '1'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Dropdown Items */}
                            {showRelatedItemsDropdown && filteredItems.length > 0 && (
                                <div style={{
                                    marginTop: 'var(--spacing-2)',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    border: 'var(--border-width-thin) solid var(--border-color-medium)',
                                    borderRadius: 'var(--border-radius-base)',
                                    background: 'var(--card-bg)'
                                }}>
                                    {filteredItems.slice(0, 10).map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleRelatedItem(item)}
                                            style={{
                                                padding: 'var(--spacing-2) var(--spacing-3)',
                                                cursor: 'pointer',
                                                borderBottom: 'var(--border-width-thin) solid var(--border-color-light)',
                                                fontSize: 'var(--font-size-sm)',
                                                transition: 'var(--transition-base)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-background)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            GV:{item.number} - {item.title}
                                        </div>
                                    ))}
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

export default CreateItemNavigable;