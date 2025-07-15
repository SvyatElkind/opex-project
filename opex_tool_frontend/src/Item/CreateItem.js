import React, { useState } from "react";
import CalendarComponent from "../Utils/CalendarComponent";
import Alert from "../Alert/Alert";
import './CreateItem.css';
import Utils from "../Utils/Utils";

const CreateItem = ({ onClose, OnCreate, relativeInventory }) => {
    const utils = Utils();
    
    const [formData, setFormData] = useState({
        series_code: "",
        number: relativeInventory.last_gv + 1,
        title: "",
        start_date: "",
        end_date: "",
        date_indicator: "",
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
        format: "",
        color: "",
        duration: "",
        resolution: "",
        inventory: relativeInventory.number
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const [success, result] = await OnCreate(formData, relativeInventory.id);
            if (success) {
                console.log("Item created successfully:", result);
                onClose();
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
        if (startDate != null) {
            formData.start_date = utils.formatDate(startDate);
        }
        if (endDate != null) {
            formData.end_date = utils.formatDate(endDate);
        }
        formData.date_indicator = view;
    };

    return (
        <div className="modal">
            <form onSubmit={handleSubmit} className={`createItemForm ${isSubmitting ? 'loading' : ''}`}>
                <h2>Izveidot Jaunu Glabājamo Vienību</h2>
                
                <div className="form-content">
                    {/* Basic Information Section */}
                    <div className="form-section">
                        <h3>📋 Pamatinformācija</h3>
                        
                        <div className="item-number-display">
                            Glabājamās vienības numurs: {formData.number}
                        </div>
                        
                        <label data-required="true">
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
                        
                        <label data-required="true">
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
                        
                        <label>
                            Uzskaites saraksts:
                            <input 
                                type="text" 
                                name="inventory" 
                                value={formData.inventory} 
                                onChange={handleChange}
                                readOnly
                            />
                        </label>
                    </div>

                    {/* Date Information Section */}
                    <div className="form-section">
                        <h3>📅 Datuma informācija</h3>
                        
                        <div className="calendar-section">
                            <h4>Datuma periods</h4>
                            <CalendarComponent onDateChange={handleDateChange}/>
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

                    {/* Description Section */}
                    <div className="form-section">
                        <h3>📝 Apraksts</h3>
                        
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

                    {/* Access and Security Section */}
                    <div className="form-section">
                        <h3>🔒 Pieejamība un drošība</h3>
                        
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

                    {/* Technical Information Section */}
                    <div className="form-section">
                        <h3>⚙️ Tehniskā informācija</h3>
                        
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
                        
                        <label>
                            Formāts:
                            <input 
                                type="text" 
                                name="format" 
                                value={formData.format} 
                                onChange={handleChange}
                                placeholder="Faila formāts..."
                            />
                        </label>
                        
                        <label>
                            Krāsainība:
                            <select 
                                name="color" 
                                value={formData.color} 
                                onChange={handleChange}
                            >
                                <option value="">Izvēlēties...</option>
                                <option value="Melnbalts">Melnbalts</option>
                                <option value="Krāsains">Krāsains</option>
                                <option value="Sēpija">Sēpija</option>
                            </select>
                        </label>
                        
                        <label>
                            Ilgums:
                            <input 
                                type="text" 
                                name="duration" 
                                value={formData.duration} 
                                onChange={handleChange}
                                placeholder="Ilgums (audio/video)..."
                            />
                        </label>
                        
                        <label>
                            Izšķirtspēja:
                            <input 
                                type="text" 
                                name="resolution" 
                                value={formData.resolution} 
                                onChange={handleChange}
                                placeholder="Izšķirtspēja (attēliem/video)..."
                            />
                        </label>
                    </div>
                </div>
                
                <div className="form-actions">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Izveido..." : "Izveidot vienību"}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isSubmitting}
                    >
                        Atcelt
                    </button>
                </div>
                
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