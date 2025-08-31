import React, { useState, useEffect } from "react";
import CalendarComponent from "../Utils/CalendarComponent";
import './CreateItem.css'; // Reuse the same styles
import Utils from "../Utils/Utils";
import { useNavigation } from '../Navigation/context/NavigationContext';

const EditItem = ({ onClose, onUpdate, item, inventory, allItems = [] }) => {
    const utils = Utils();
    const { getAllItemsFromProject } = useNavigation();
    
    // Initialize form state with existing item data
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
        sistematisation: item.sistematisation || "",
        language: item.language || "Latviešu",
        restriction: item.restriction || "Vispārēja",
        restriction_note: item.restriction_note || "",
        security_level: item.security_level || "Publisks",
        security_level_note: item.security_level_note || "",
        copy: item.copy || "",
        archival_history: item.archival_history || "",
        related_item_list: item.related_item_list || [],
        inventory: inventory.number
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Related items state
    const [relatedItemsSearch, setRelatedItemsSearch] = useState("");
    const [selectedRelatedItems, setSelectedRelatedItems] = useState([]);
    const [showRelatedItemsDropdown, setShowRelatedItemsDropdown] = useState(false);

    // Initialize related items on component mount
    useEffect(() => {
        if (item.related_item_list && item.related_item_list.length > 0) {
            const allProjectItems = getAllItemsFromProject();
            const relatedItems = allProjectItems.filter(projectItem => 
                item.related_item_list.includes(projectItem.id)
            );
            setSelectedRelatedItems(relatedItems);
        }
    }, [item.related_item_list, getAllItemsFromProject]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showRelatedItemsDropdown && !event.target.closest('.related-items-search')) {
                setShowRelatedItemsDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showRelatedItemsDropdown]);

    // Enhanced submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");
        
        // Validate that item number is unique (excluding current item)
        const existingItem = allItems.find(existingItem => 
            existingItem.number === formData.number && existingItem.id !== item.id
        );
        
        if (existingItem) {
            setErrorMessage(`Vienības numurs ${formData.number} jau eksistē citā vienībā`);
            setIsSubmitting(false);
            return;
        }
        
        try {
            const [success, result] = await onUpdate(formData);
            
            if (success) {
                console.log("Item updated successfully:", result);
                onClose();
            } else {
                console.error("Error updating item:", result);
                setErrorMessage(result);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setErrorMessage(error.message || "Radās kļūda");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDateChange = (startDate, endDate, view) => {
        setFormData(prev => ({
            ...prev,
            start_date: startDate ? utils.formatDate(startDate) : "",
            end_date: endDate ? utils.formatDate(endDate) : "",
            date_indicator: view || "day"
        }));
    };

    // Related items functionality
    const getFilteredItems = () => {
        const allItems = getAllItemsFromProject();
        
        return allItems.filter(projectItem => {
            // Don't show the current item or already selected items
            if (projectItem.id === item.id) return false;
            if (selectedRelatedItems.some(selected => selected.id === projectItem.id)) return false;
            
            // Filter by search term
            if (relatedItemsSearch.trim() === "") return true;
            
            const searchTerm = relatedItemsSearch.toLowerCase();
            return (
                projectItem.title?.toLowerCase().includes(searchTerm) ||
                projectItem.number?.toString().includes(searchTerm) ||
                projectItem.inventoryNumber?.toString().includes(searchTerm) ||
                projectItem.series_code?.toLowerCase().includes(searchTerm)
            );
        });
    };

    const handleAddRelatedItem = (projectItem) => {
        const newSelectedItems = [...selectedRelatedItems, projectItem];
        setSelectedRelatedItems(newSelectedItems);
        
        // Update formData with array of IDs
        const relatedIds = newSelectedItems.map(item => item.id);
        setFormData(prev => ({
            ...prev,
            related_item_list: relatedIds
        }));
        
        setRelatedItemsSearch("");
        setShowRelatedItemsDropdown(false);
    };

    const handleRemoveRelatedItem = (itemId) => {
        const newSelectedItems = selectedRelatedItems.filter(item => item.id !== itemId);
        setSelectedRelatedItems(newSelectedItems);
        
        // Update formData with array of IDs
        const relatedIds = newSelectedItems.map(item => item.id);
        setFormData(prev => ({
            ...prev,
            related_item_list: relatedIds
        }));
    };

    const handleRelatedItemsSearchChange = (e) => {
        setRelatedItemsSearch(e.target.value);
        setShowRelatedItemsDropdown(true);
    };

    return (
        <div className="modal">
            <form onSubmit={handleSubmit} className="createItemForm">
                {/* Header */}
                <div className="form-header">
                    <h2>Labot Glabājamo Vienību</h2>
                    <div className="form-subtitle">
                        US:{formData.inventory} :: GV:{formData.number}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="btn-submit"
                    >
                        {isSubmitting ? "Saglabā..." : "Saglabāt izmaiņas"}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isSubmitting}
                        className="btn-cancel"
                    >
                        Atcelt
                    </button>
                </div>

                {/* Form Content Grid */}
                <div className="form-content">
                    {/* Left Column */}
                    <div className="form-column">
                        {/* Basic Information Section */}
                        <div className="form-section">
                            <h3>Pamatinformācija</h3>
                            <div className="section-content">
                                <label className="required">
                                    Numurs:
                                    <input 
                                        type="number" 
                                        name="number" 
                                        required 
                                        value={formData.number} 
                                        onChange={handleChange}
                                        min="1"
                                    />
                                </label>

                                <label className="required">
                                    Sērijas kods:
                                    <input 
                                        type="text" 
                                        name="series_code" 
                                        required 
                                        value={formData.series_code} 
                                        onChange={handleChange}
                                        placeholder="Ievadiet sērijas kodu..."
                                    />
                                </label>

                                <label className="required">
                                    Nosaukums:
                                    <input 
                                        type="text" 
                                        name="title" 
                                        required 
                                        value={formData.title} 
                                        onChange={handleChange}
                                        placeholder="Ievadiet nosaukumu..."
                                    />
                                </label>
                                
                                <label>
                                    Valoda:
                                    <select 
                                        name="language" 
                                        value={formData.language} 
                                        onChange={handleChange}
                                    >
                                        <option value="Latviešu">Latviešu</option>
                                        <option value="Krievu">Krievu</option>
                                        <option value="Angļu">Angļu</option>
                                        <option value="Vācu">Vācu</option>
                                        <option value="Cita">Cita</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        {/* Date Information Section */}
                        <div className="form-section">
                            <h3>Datuma informācija</h3>
                            <div className="section-content">
                                <div className="calendar-section">
                                    <CalendarComponent 
                                        onDateChange={handleDateChange} 
                                        preset={formData.date_indicator}
                                    />
                                </div>
                                
                                <label>
                                    Datuma piezīme:
                                    <input 
                                        type="text" 
                                        name="date_note" 
                                        value={formData.date_note} 
                                        onChange={handleChange}
                                        placeholder="Papildu informācija par datumu..."
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Technical Information Section */}
                        <div className="form-section">
                            <h3>Tehniskā informācija</h3>
                            <div className="section-content">
                                <label>
                                    Kopija:
                                    <input 
                                        type="text" 
                                        name="copy" 
                                        value={formData.copy} 
                                        onChange={handleChange}
                                        placeholder="Kopijas informācija..."
                                    />
                                </label>
                                
                                <label>
                                    Arhīva vēsture:
                                    <input 
                                        type="text" 
                                        name="archival_history" 
                                        value={formData.archival_history} 
                                        onChange={handleChange}
                                        placeholder="Arhivēšanas vēsture..."
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="form-column">
                        {/* Description Section */}
                        <div className="form-section">
                            <h3>Apraksts</h3>
                            <div className="section-content">
                                <label>
                                    Piezīmes:
                                    <textarea 
                                        name="notes" 
                                        value={formData.notes} 
                                        onChange={handleChange}
                                        placeholder="Vispārīgas piezīmes..."
                                        rows="3"
                                    />
                                </label>
                                
                                <label>
                                    Anotācija:
                                    <textarea 
                                        name="annotation" 
                                        value={formData.annotation} 
                                        onChange={handleChange}
                                        placeholder="Detalizēts apraksts..."
                                        rows="3"
                                    />
                                </label>
                                
                                <label>
                                    Sistematizācija:
                                    <input 
                                        type="text" 
                                        name="sistematisation" 
                                        value={formData.sistematisation} 
                                        onChange={handleChange}
                                        placeholder="Sistematizācijas kods..."
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Access and Security Section */}
                        <div className="form-section">
                            <h3>Pieejamība un drošība</h3>
                            <div className="section-content">
                                <label>
                                    Ierobežojumi:
                                    <select 
                                        name="restriction" 
                                        value={formData.restriction} 
                                        onChange={handleChange}
                                    >
                                        <option value="Vispārēja">Vispārēja pieejamība</option>
                                        <option value="Ierobežota">Ierobežota pieejamība</option>
                                        <option value="Konfidenciāla">Konfidenciāla</option>
                                    </select>
                                </label>
                                
                                <label>
                                    Ierobežojumu piezīme:
                                    <input 
                                        type="text" 
                                        name="restriction_note" 
                                        value={formData.restriction_note} 
                                        onChange={handleChange}
                                        placeholder="Papildu informācija par ierobežojumiem..."
                                    />
                                </label>
                                
                                <label>
                                    Drošības līmenis:
                                    <select 
                                        name="security_level" 
                                        value={formData.security_level} 
                                        onChange={handleChange}
                                    >
                                        <option value="Publisks">Publisks</option>
                                        <option value="Iekšējs">Iekšējam lietojumam</option>
                                        <option value="Konfidenciāls">Konfidenciāls</option>
                                        <option value="Slepens">Slepens</option>
                                    </select>
                                </label>
                                
                                <label>
                                    Drošības līmeņa piezīme:
                                    <input 
                                        type="text" 
                                        name="security_level_note" 
                                        value={formData.security_level_note} 
                                        onChange={handleChange}
                                        placeholder="Papildu informācija par drošības līmeni..."
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Related Items Section */}
                        <div className="form-section">
                            <h3>Saistītās vienības</h3>
                            <div className="section-content">
                                <label>
                                    Meklēt saistītās vienības:
                                    <div className="related-items-search">
                                        <input 
                                            type="text" 
                                            value={relatedItemsSearch}
                                            onChange={handleRelatedItemsSearchChange}
                                            onFocus={() => setShowRelatedItemsDropdown(true)}
                                            placeholder="Meklēt pēc nosaukuma, numura, sērijas koda..."
                                        />
                                        
                                        {showRelatedItemsDropdown && (
                                            <div className="related-items-dropdown">
                                                {getFilteredItems().length > 0 ? (
                                                    getFilteredItems().slice(0, 10).map(projectItem => (
                                                        <div 
                                                            key={projectItem.id} 
                                                            className="related-item-option"
                                                            onClick={() => handleAddRelatedItem(projectItem)}
                                                        >
                                                            <div className="item-info">
                                                                <span className="item-inventory">US {projectItem.inventoryNumber} || </span>
                                                                <span className="item-number">GV {projectItem.number} || </span>
                                                                <span className="item-series">{projectItem.series_code} || </span>
                                                                <span className="item-title">{projectItem.title}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="no-items">Nav atrasts neviens rezultāts</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </label>

                                {selectedRelatedItems.length > 0 && (
                                    <div className="selected-related-items">
                                        <h4>Izvēlētās saistītās vienības:</h4>
                                        {selectedRelatedItems.map(relatedItem => (
                                            <div key={relatedItem.id} className="selected-item">
                                                <div className="selected-item-info">
                                                    <span className="item-inventory">US {relatedItem.inventoryNumber} ||</span>
                                                    <span className="item-number">GV {relatedItem.number} || </span>
                                                    <span className="item-series">{relatedItem.series_code} || </span>
                                                    <span className="item-title">{relatedItem.title}</span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    className="remove-item-btn"
                                                    onClick={() => handleRemoveRelatedItem(relatedItem.id)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="error-message">
                        {errorMessage}
                    </div>
                )}
            </form>
        </div>
    );
};

export default EditItem;