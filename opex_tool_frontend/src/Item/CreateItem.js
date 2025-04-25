import React,{useEffect, useState} from "react";
import CalendarComponent from "../Utils/CalendarComponent";
import Alert from "../Alert/Alert";
import './CreateItem.css';


///Constants//
///Alerts///
/// input values ///
/// Restrictions and conditions ///


const CreateItem = ({onClose, OnCreate ,relativeInventory}) =>{
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const [success, result] = await OnCreate(formData, relativeInventory.id);
        if (success) {
            console.log("Item created successfully:", result);
            ///Implament alert///
            onClose();
        } else {
            console.error("Error creating item:", result);
            ///Implamet Alert Handler///
        }
    };

    const handleClose = () => {
        onClose();
    }

    const handleDateChange = (startDate,endDate, view) =>{
        if(startDate != null){
            formData.start_date = formatDateToYYYYMMDD(startDate);
        }
        if(endDate != null){
            formData.end_date = formatDateToYYYYMMDD(endDate);
        }
        formData.date_indicator = view;
    }

    function formatDateToYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    useEffect(()=>{
    },[formData]);

    const handleRestrictionConditional= () =>{
        const invType = relativeInventory.type;
        if(invType === "Tekstuāls"){
            
        }
        ///????///
        ///Conditionals: ///
        ///inventory type?//
        /// electronic type???///

    }



    return(
     <div className="modal">
            <form onSubmit={handleSubmit} className="createItemForm">
                <div>
                    <label>Series Code (required):</label>
                    <input 
                        type="text" 
                        name="series_code" 
                        required 
                        value={formData.series_code} 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label>Title (required):</label>
                    <input 
                        type="text" 
                        name="title" 
                        required 
                        value={formData.title} 
                        onChange={handleChange} 
                    />
                </div>
                {/* DATE FIELD */}
                <div>
                    <CalendarComponent onDateChange={handleDateChange}/>
                </div>
                <div>
                    <label>Date Note (optional):</label>
                    <input 
                        type="text" 
                        name="date_note" 
                        value={formData.date_note} 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label>Notes (optional):</label>
                    <input 
                        type="text" 
                        name="notes" 
                        value={formData.notes} 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label>Annotation (optional):</label>
                    <input 
                        type="text" 
                        name="annotation" 
                        value={formData.annotation} 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label>Sistematisation (optional):</label>
                    <input 
                        type="text" 
                        name="sistematisation" 
                        value={formData.sistematisation} 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label>Language (required):</label>
                    <input 
                        type="text" 
                        name="language" 
                        required 
                        value={formData.language} 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label>Restriction (optional):</label>
                    <input 
                        type="text" 
                        name="restriction" 
                        value={formData.restriction} 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label>Restriction Note (optional):</label>
                    <input 
                        type="text" 
                        name="restriction_note" 
                        value={formData.restriction_note} 
                        onChange={handleChange} 
                        />
                    </div>
                    <div>
                        <label>Security Level (optional):</label>
                        <input 
                            type="text" 
                            name="security_level" 
                            value={formData.security_level} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div>
                        <label>Security Level Note (optional):</label>
                        <input 
                            type="text" 
                            name="security_level_note" 
                            value={formData.security_level_note} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div>
                        <label>Copy (optional):</label>
                        <input 
                            type="text" 
                            name="copy" 
                            value={formData.copy} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div>
                        <label>Archival History (optional):</label>
                        <input 
                            type="text" 
                            name="archival_history" 
                            value={formData.archival_history} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div>
                        <label>Format (optional):</label>
                        <input 
                            type="text" 
                            name="format" 
                            value={formData.format} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div>
                        <label>Color (optional):</label>
                        <input 
                            type="text" 
                            name="color" 
                            value={formData.color} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div>
                        <label>Duration (optional):</label>
                        <input 
                            type="text" 
                            name="duration" 
                            value={formData.duration} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div>
                        <label>Resolution (optional):</label>
                        <input 
                            type="text" 
                            name="resolution" 
                            value={formData.resolution} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div>
                        <label>Inventory (required):</label>
                        <input 
                            type="text" 
                            name="inventory" 
                            required 
                            value={formData.inventory} 
                            onChange={handleChange} 
                        />
                    </div>
                    <button type="submit">Create Item</button>
                    <button type="button" onClick={() => {handleClose()}}>Close</button>
                </form>
            </div>
        );
    }
    
    export default CreateItem;