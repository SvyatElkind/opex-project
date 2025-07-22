import React, { useState, useEffect } from "react";
import CalendarComponent from "../Utils/CalendarComponent";
import './CreateItem.css';
import Utils from "../Utils/Utils";
import { useNavigation } from '../Navigation/context/NavigationContext';

const CreateItem = ({ onClose, OnCreate, relativeInventory }) => {
    const utils = Utils();
    const { getAllItemsFromProject } = useNavigation();
    
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

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

    // Reset form to initial state
    const resetForm = () => {
        const newFormData = getInitialFormData();
        newFormData.number = relativeInventory.last_gv + 1 + itemsCreated + 1;
        setFormData(newFormData);
        setErrorMessage("");
        
        // Reset related items state
        setSelectedRelatedItems([]);
        setRelatedItemsSearch("");
        setShowRelatedItemsDropdown(false);
    };

    // Enhanced submit handler with continue option
    const handleSubmit = async (e, shouldContinue = false) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");
        
        try {
            const shouldClosePopup = !shouldContinue;
            const [success, result] = await OnCreate(formData, shouldClosePopup);
            
            if (success) {
                console.log("Item created successfully:", result);
                
                if (shouldContinue) {
                    setSuccessMessage(`Item "${formData.title}" created successfully! Creating another...`);
                    setItemsCreated(prev => prev + 1);
                    
                    setTimeout(() => {
                        resetForm();
                    }, 1000);
                } else {
                    onClose();
                }
            } else {
                console.error("Error creating item:", result);
                setErrorMessage(result);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setErrorMessage(error.message || "An error occurred");
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
        
        return allItems.filter(item => {
            // Don't show the current item or already selected items
            if (item.id === formData.id) return false;
            if (selectedRelatedItems.some(selected => selected.id === item.id)) return false;
            
            // Filter by search term
            if (relatedItemsSearch.trim() === "") return true;
            
            const searchTerm = relatedItemsSearch.toLowerCase();
            return (
                item.title?.toLowerCase().includes(searchTerm) ||
                item.number?.toString().includes(searchTerm) ||
                item.inventoryNumber?.toString().includes(searchTerm) ||
                item.series_code?.toLowerCase().includes(searchTerm)
            );
        });
    };

    const handleAddRelatedItem = (item) => {
        const newSelectedItems = [...selectedRelatedItems, item];
        setSelectedRelatedItems(newSelectedItems);
        
        // Update formData with array of IDs (not comma-separated string!)
        const relatedIds = newSelectedItems.map(item => item.id);
        setFormData(prev => ({
            ...prev,
            related_item_list: relatedIds  // Fixed: correct field name and data type
        }));
        
        setRelatedItemsSearch("");
        setShowRelatedItemsDropdown(false);
    };

    // Fixed handleRemoveRelatedItem function
    const handleRemoveRelatedItem = (itemId) => {
        const newSelectedItems = selectedRelatedItems.filter(item => item.id !== itemId);
        setSelectedRelatedItems(newSelectedItems);
        
        // Update formData with array of IDs (not comma-separated string!)
        const relatedIds = newSelectedItems.map(item => item.id);
        setFormData(prev => ({
            ...prev,
            related_item_list: relatedIds  // Fixed: correct field name and data type
        }));
    };

    const handleRelatedItemsSearchChange = (e) => {
        setRelatedItemsSearch(e.target.value);
        setShowRelatedItemsDropdown(true);
    };

    return (
        <div className="modal">
            <form onSubmit={(e) => handleSubmit(e, false)} className="createItemForm">
                {/* Header */}
                <div className="form-header">
                    <h2>Jauna Glabājamā Vienība</h2>
                    <div className="form-subtitle">
                        US:{formData.inventory} :: GV:{formData.number}
                        {itemsCreated > 0 && (
                            <span className="items-created">({itemsCreated} items created)</span>
                        )}
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}

                {/* Form Actions */}
                <div className="form-actions">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="btn-submit"
                    >
                        {isSubmitting ? "Izveido..." : "Izveidot vienību"}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={isSubmitting}
                        className="btn-continue"
                    >
                        {isSubmitting ? "Izveido..." : "Izveidot & Turpināt"}
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
                                    <CalendarComponent onDateChange={handleDateChange} preset={formData.date_indicator}/>
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
                                            placeholder="Meklēt pēc nosaukuma, numura, sērijas koda vai uzskaites saraksta..."
                                        />
                                        
                                        {showRelatedItemsDropdown && (
                                            <div className="related-items-dropdown">
                                                {getFilteredItems().length > 0 ? (
                                                    getFilteredItems().slice(0, 10).map(item => (
                                                        <div 
                                                            key={item.id} 
                                                            className="related-item-option"
                                                            onClick={() => handleAddRelatedItem(item)}
                                                        >
                                                            <div className="item-info">
                                                                <span className="item-inventory">US {item.inventoryNumber} || </span>
                                                                <span className="item-number">GV {item.number} || </span>
                                                                <span className="item-series">{item.series_code} || </span>
                                                                <span className="item-title">{item.title} ||</span>
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
                                        {selectedRelatedItems.map(item => (
                                            <div key={item.id} className="selected-item">
                                                <div className="selected-item-info">
                                                    <span className="item-inventory">US {item.inventoryNumber} ||</span>
                                                    <span className="item-number">GV {item.number} || </span>
                                                    <span className="item-series">{item.series_code} || </span>
                                                    <span className="item-title">{item.title} || </span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    className="remove-item-btn"
                                                    onClick={() => handleRemoveRelatedItem(item.id)}
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

export default CreateItem;