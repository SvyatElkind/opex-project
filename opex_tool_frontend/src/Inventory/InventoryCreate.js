import React, { useState } from "react";
import Select from 'react-select';
import YearPicker from "../Utils/YearPicker";
import { INVENTORY_CONSTANTS, INVENTORY_CREATE_UI } from "../Constants/Constants";
import Utils from "../Utils/Utils";
import { useCreateInventory } from "../hooks/useInventories";
import { useProject } from "../hooks/useProjects";
import "./InventoryCreate.css";

// Simplified options without emojis - clean and uniform
const typeOptions = [
    { value: INVENTORY_CONSTANTS.TYPE[0], label: INVENTORY_CONSTANTS.TYPE[0] },
    { value: INVENTORY_CONSTANTS.TYPE[1], label: INVENTORY_CONSTANTS.TYPE[1] },
    { value: INVENTORY_CONSTANTS.TYPE[2], label: INVENTORY_CONSTANTS.TYPE[2] },
    { value: INVENTORY_CONSTANTS.TYPE[3], label: INVENTORY_CONSTANTS.TYPE[3] },
    { value: INVENTORY_CONSTANTS.TYPE[4], label: INVENTORY_CONSTANTS.TYPE[4] },
];

const storageTermOptions = [
    { value: INVENTORY_CONSTANTS.TERMS[0], label: INVENTORY_CONSTANTS.TERMS[0] },
    { value: INVENTORY_CONSTANTS.TERMS[1], label: INVENTORY_CONSTANTS.TERMS[1] },
];

// Clean Select styles using theme variables
const inventoryCreateSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        border: 'var(--border-width-medium) solid var(--border-color-medium)',
        borderRadius: 'var(--border-radius-base)',
        minHeight: '44px',
        backgroundColor: 'var(--input-bg)',
        borderColor: state.isFocused ? 'var(--color-primary)' : 'var(--border-color-medium)',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(var(--color-primary-rgb), 0.1)' : 'none',
        '&:hover': {
            borderColor: 'var(--color-primary-light)',
        },
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 10000,
    }),
    menuPortal: (provided) => ({
        ...provided,
        zIndex: 10000,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected 
            ? 'var(--color-primary)' 
            : state.isFocused 
            ? 'rgba(var(--color-primary-rgb), 0.1)' 
            : 'white',
        color: state.isSelected ? 'var(--text-white)' : 'var(--text-primary)',
        padding: 'var(--spacing-3) var(--spacing-4)',
        cursor: 'pointer',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family-primary)',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: 'var(--text-muted)',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family-primary)',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: 'var(--text-primary)',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family-primary)',
    }),
};

const InventoryCreate = ({ onClose, projectId, fondId }) => {
    // Local state
    const [type, setType] = useState('');
    const [subfond, setSubfond] = useState('');
    const [electronic, setElectronic] = useState(true);
    const [startDate, setStartDate] = useState(''); // Will be in YYYY-MM-DD format
    const [endDate, setEndDate] = useState('');     // Will be in YYYY-MM-DD format
    const [storageTerm, setStorageTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); 
    const [subFondEnabled, setSubFondEnabled] = useState(false);

    // React Query hooks
    const createInventoryMutation = useCreateInventory();
    const { data: activeProjectData } = useProject(projectId);
    const utils = Utils();

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Basic validation
        if (!type) {
            setErrorMessage('Please select an inventory type');
            return;
        }

        if (!storageTerm) {
            setErrorMessage('Please select a storage term');
            return;
        }
        
        try {
            // Calculate the next inventory number
            const inventoryCount = activeProjectData?.institution?.fond?.inventories?.length || 0;
            const nextInventoryNumber = inventoryCount + 1;
            
            // Prepare the inventory data
            const inventoryData = {
                number: nextInventoryNumber,
                type: type.value || type,
                subfond: subFondEnabled ? subfond : "0",
                electronic: electronic,
                start_date: startDate, // Already in YYYY-MM-DD format from YearPicker
                end_date: endDate,     // Already in YYYY-MM-DD format from YearPicker
                storage_term: storageTerm.value || storageTerm,
            };

            console.log('Submitting inventory data:', inventoryData);

            // Submit the form
            await createInventoryMutation.mutateAsync({

                projectId,

                fondId,

                inventoryData

            });

            // Close the modal on success
            onClose();
            
        } catch (error) {
            console.error('Error creating inventory:', error);
            setErrorMessage(error.message || 'Failed to create inventory. Please try again.');
        }
    };

    const handleCancel = () => {
        onClose();
    };

    const handleTypeChange = (selectedOption) => {
        setType(selectedOption);
        // Clear error when user makes a selection
        if (errorMessage.includes('type')) {
            setErrorMessage('');
        }
    };

    const handleStorageTermChange = (selectedOption) => {
        setStorageTerm(selectedOption);
        // Clear error when user makes a selection
        if (errorMessage.includes('storage term')) {
            setErrorMessage('');
        }
    };

    // Handler for start date change from YearPicker
    const handleStartDateChange = (dateString) => {
        setStartDate(dateString);
        console.log('Start date changed to:', dateString);
    };

    // Handler for end date change from YearPicker
    const handleEndDateChange = (dateString) => {
        setEndDate(dateString);
        console.log('End date changed to:', dateString);
    };

    const toggleSubfond = () =>{
        setSubFondEnabled(!subFondEnabled)
    };

    return (
        <div className="inventory-create-modal-backdrop">
            <div className="inventory-create-modal-container">
                <h2 className="inventory-create-modal-title">
                    {INVENTORY_CREATE_UI.TITLE}
                </h2>
                
                <form onSubmit={handleSubmit} className="inventory-create-form">
                    {errorMessage && (
                        <div className="inventory-create-error-message">
                            {errorMessage}
                        </div>
                    )}

                    {/* Type Selection */}
                    <div className="inventory-create-input-group">
                        <label className="inventory-create-label">
                            {INVENTORY_CREATE_UI.TYPE_LABLE}
                        </label>
                        <Select
                            value={type}
                            onChange={handleTypeChange}
                            options={typeOptions}
                            styles={inventoryCreateSelectStyles}
                            placeholder={INVENTORY_CREATE_UI.TYPE_PLACEHOLDER}
                            isSearchable={false}
                            className="inventory-create-select"
                        />
                    </div>

                    <div className="inventory-create-input-group-checkbox">

                                <label htmlFor="inventory-create-electronic" className="inventory-create-checkbox-label">{INVENTORY_CREATE_UI.ELECTRONIC_LABEL}</label>

                                <input

                                    type="checkbox"

                                    id="inventory-create-electronic"

                                    checked={electronic}

                                    onChange={(e) => setElectronic(e.target.checked)}

                                    className="inventory-create-checkbox"

                                />

                                <label htmlFor="inventory-create-subfond-toggle" className="inventory-create-checkbox-label">{INVENTORY_CREATE_UI.SUBFOND_LABEL}</label>

                                <input

                                    type="checkbox"

                                    id="inventory-create-subfond-toggle"

                                    checked={subFondEnabled}
                                    onClick={(e) => toggleSubfond()}

                                    className="inventory-create-checkbox"

                                />

                            {subFondEnabled && (

                                <div className="inventory-create-input-group-subfond">

                                    <input

                                        type="number"

                                        value={subfond}

                                        onChange={(e) => setSubfond(parseInt(e.target.value, 10) || '')}

                                        placeholder="0"

                                        className="inventory-create-number-input"

                                    />

                                </div>

                            )}
                        </div>


                    {/* Date Range Section */}
                    <div className="inventory-create-date-range">
                        <YearPicker
                            value={startDate}
                            onChange={handleStartDateChange}
                            label={INVENTORY_CREATE_UI.START_DATE_LABEL}
                            placeholder={INVENTORY_CREATE_UI.YEAR_START_PLACEHOLDER}
                            isStartDate={true} // This will format as YYYY-01-01
                        />

                        <YearPicker
                            value={endDate}
                            onChange={handleEndDateChange}
                            label={INVENTORY_CREATE_UI.END_DATE_LABEL}
                            placeholder={INVENTORY_CREATE_UI.YEAR_END_PLACEHOLDER}
                            isStartDate={false} // This will format as YYYY-12-31
                        />
                    </div>

                    {/* Storage Term Selection */}
                    <div className="inventory-create-input-group">
                        <label className="inventory-create-label">
                            {INVENTORY_CREATE_UI.STORAGE_TERM}
                        </label>
                        <Select
                            value={storageTerm}
                            onChange={handleStorageTermChange}
                            options={storageTermOptions}
                            styles={inventoryCreateSelectStyles}
                            placeholder={INVENTORY_CREATE_UI.STORAGE_TERM_PLACEHOLDER}
                            isSearchable={false}
                            className="inventory-create-select"
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="inventory-create-form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="inventory-create-cancel-button"
                            disabled={createInventoryMutation.isPending}
                        >
                            {INVENTORY_CREATE_UI.CANCEL}
                        </button>
                        <button
                            type="submit"
                            className="inventory-create-submit-button"
                            disabled={createInventoryMutation.isPending}
                        >
                            {createInventoryMutation.isPending ? INVENTORY_CREATE_UI.CREATE_IN_PROGRESS : INVENTORY_CREATE_UI.CREATE}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryCreate;