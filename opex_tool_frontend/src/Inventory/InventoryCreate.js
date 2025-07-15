import React, { useState } from "react";
import CalendarComponent from "../Utils/CalendarComponent";
import Select from 'react-select';
import { INVENTORY_CONSTANTS, INVENTORY_CREATE_UI } from "../Constants/Constnats";
import Utils from "../Utils/Utils";
import { useCreateInventory } from "../hooks/useInventories";
import { useProject } from "../hooks/useProjects";
import "./InventoryCreate.css";

const typeOptions = [
    {value: INVENTORY_CONSTANTS.TYPE[0], label: `📸 ${INVENTORY_CONSTANTS.TYPE[0]}`},
    {value: INVENTORY_CONSTANTS.TYPE[1], label: `🎵 ${INVENTORY_CONSTANTS.TYPE[1]}`},
    {value: INVENTORY_CONSTANTS.TYPE[2], label: `📄 ${INVENTORY_CONSTANTS.TYPE[2]}`},
    {value: INVENTORY_CONSTANTS.TYPE[3], label: `🎬 ${INVENTORY_CONSTANTS.TYPE[3]}`},
    {value: INVENTORY_CONSTANTS.TYPE[4], label: `💾 ${INVENTORY_CONSTANTS.TYPE[4]}`},
];

const storageTermOptions = [
    {value: INVENTORY_CONSTANTS.TERMS[0], label: `♾️ ${INVENTORY_CONSTANTS.TERMS[0]}`},
    {value: INVENTORY_CONSTANTS.TERMS[1], label: `⏳ ${INVENTORY_CONSTANTS.TERMS[1]}`},
];

const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        border: `2px solid ${state.isFocused ? '#007bff' : '#e9ecef'}`,
        borderRadius: '8px',
        minHeight: '44px',
        transition: 'all 0.3s ease',
        backgroundColor: '#ffffff',
        '&:hover': {
            borderColor: '#007bff',
        },
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f8f9fa' : 'white',
        color: state.isSelected ? 'white' : '#495057',
        padding: '12px 16px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: state.isSelected ? '#007bff' : '#f8f9fa',
        },
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#6c757d',
        fontStyle: 'italic',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#495057',
        fontWeight: '500',
    }),
};

const InventoryCreate = ({ onClose, projectId, fondId }) => {
    // Local state
    const [type, setType] = useState('');
    const [subfond, setSubfond] = useState(0);
    const [electronic, setElectronic] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [storageTerm, setStorageTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); 
    const [subFondEnabled, setSubFondEnabled] = useState(false);

    // React Query hooks
    const createInventoryMutation = useCreateInventory();
    const { data: activeProjectData } = useProject(projectId);
    const utils = Utils();

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Calculate the next inventory number
        const inventoryCount = activeProjectData?.institution?.fond?.inventories?.length || 0;
        const number = inventoryCount + 1;
        
        // Format dates
        const start_date = utils.formatDate(startDate);
        const end_date = utils.formatDate(endDate);
        const postfix = '';

        const inventoryData = {
            number,
            subfond,
            postfix,
            type,
            electronic,
            start_date,
            end_date,
            storage_term: storageTerm,
            fond: {
                id: fondId,
            },
        };

        try {
            await createInventoryMutation.mutateAsync({
                projectId,
                fondId,
                inventoryData
            });
            
            onClose(); // Close the popup on success
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handleDateChange = (startDate, endDate, view) => {
        setStartDate(startDate);
        setEndDate(endDate);    
        setStorageTerm(view);
    };

    const handleTypeChange = (selectedOption) => {
        setType(selectedOption.value);
    };

    const handleStorageTermChange = (selectedOption) => {
        setStorageTerm(selectedOption.value);
    };

    return (
        <div className="popup-background">
            <div className="popup">
                <div className="close-button">
                    <button onClick={onClose} type="button" title="Aizvērt">
                        ✕
                    </button>
                </div>
                
                <h2>{INVENTORY_CREATE_UI.TITLE}</h2>
                
                <form onSubmit={handleSubmit} className="form">
                    <div className="input-group">
                        <div className="input-column">
                            <label className="checkbox-group">
                                <input 
                                    type="checkbox"
                                    checked={electronic}
                                    onChange={(e) => setElectronic(e.target.checked)} 
                                />
                                <span>💾 {INVENTORY_CREATE_UI.ELECTRONIC_LABEL}</span>
                            </label>
                            
                            <label>
                                <span>📋 {INVENTORY_CREATE_UI.TYPE_LABLE}</span>
                                <Select
                                    options={typeOptions}
                                    defaultValue={typeOptions[0]}
                                    onChange={handleTypeChange}
                                    styles={customSelectStyles}
                                    placeholder="Izvēlēties tipu..."
                                />
                            </label>
                            
                            <label className="checkbox-group">
                                <input 
                                    type="checkbox"
                                    checked={subFondEnabled}
                                    onChange={(e) => setSubFondEnabled(e.target.checked)} 
                                />
                                <span>📂 {INVENTORY_CREATE_UI.SUBFOND_LABLE}</span>
                                {subFondEnabled && 
                                    <div className="number-input-group">
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="9"
                                            value={subfond}
                                            onChange={(e) => setSubfond(parseInt(e.target.value) || 0)}
                                            placeholder="0-9"
                                        />
                                    </div>
                                }
                            </label>
                        </div>
                        
                        <div className="input-column">
                            <div className="calendar-section">
                                <CalendarComponent onDateChange={handleDateChange} preset='year'/>
                            </div>
                            
                            <label>
                                <span>⏰ {INVENTORY_CREATE_UI.STORAGE_TERM}</span>
                                <Select
                                    options={storageTermOptions}
                                    defaultValue={storageTermOptions[0]}
                                    onChange={handleStorageTermChange}
                                    styles={customSelectStyles}
                                    placeholder="Izvēlēties glabāšanas termiņu..."
                                />
                            </label>
                        </div>
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={createInventoryMutation.isPending}
                    >
                        {createInventoryMutation.isPending ? 'Izveido...' : INVENTORY_CREATE_UI.CREATE}
                    </button>
                    
                    {errorMessage && (
                        <p style={{ color: 'red' }}>{errorMessage}</p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default InventoryCreate;