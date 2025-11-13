import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import YearPicker from '../Utils/YearPicker';
import { INVENTORY_CREATE_UI,INVENTORY_EDIT_UI, INVENTORY_CONSTANTS } from '../Constants/Constants';
import { useUpdateInventory } from '../hooks/useInventories';
import { useProject } from '../hooks/useProjects';
import Utils from '../Utils/Utils';

// Reuse the same styles from InventoryCreate
import './InventoryCreate.css';

// Custom select styles (reused from InventoryCreate)
const inventoryEditSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '44px',
        border: state.isFocused 
            ? '2px solid var(--color-primary)' 
            : '2px solid var(--border-color-medium)',
        boxShadow: state.isFocused 
            ? '0 0 0 2px rgba(var(--color-primary-rgb), 0.1)' 
            : 'none',
        '&:hover': {
            borderColor: 'var(--color-primary-light)',
        },
        borderRadius: 'var(--border-radius-base)',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family-primary)',
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family-primary)',
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

const EditInventory = ({ onClose, projectId, inventory }) => {
    const utils = Utils();
    
    // Determine if this inventory is from a report (allows only date editing)
    // Based on the constant "ALLOW: AtÄ¼aut Pilnu lauku atjaunoÅ¡anu" - this suggests there's a field that controls this
    const isFromReport = inventory.from_report;
    
    // Initialize form state with existing inventory data
    const [type, setType] = useState(() => {
        const typeOption = INVENTORY_CONSTANTS.TYPE.find(t => t === inventory.type);
        return typeOption ? { value: typeOption, label: typeOption } : '';
    });
    
    const [subfond, setSubfond] = useState(inventory.subfond || '');
    const [electronic, setElectronic] = useState(inventory.electronic || false);
    const [startDate, setStartDate] = useState(inventory.start_date || '');
    const [endDate, setEndDate] = useState(inventory.end_date || '');
    
    const [storageTerm, setStorageTerm] = useState(() => {
        const termOption = INVENTORY_CONSTANTS.TERMS.find(t => t === inventory.storage_term);
        return termOption ? { value: termOption, label: termOption } : '';
    });
    
    const [errorMessage, setErrorMessage] = useState('');
    const [subFondEnabled, setSubFondEnabled] = useState(!!inventory.subfond);

    // React Query hooks
    const updateInventoryMutation = useUpdateInventory();
    const { data: activeProjectData } = useProject(projectId);

    // Prepare options for selects
    const typeOptions = INVENTORY_CONSTANTS.TYPE.map(type => ({ value: type, label: type }));
    const storageTermOptions = INVENTORY_CONSTANTS.TERMS.map(term => ({ value: term, label: term }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // For inventories from reports, only validate dates
        if (isFromReport) {
            if (!startDate || !endDate) {
                setErrorMessage(INVENTORY_EDIT_UI.ERROR_DATES_REQUIRED);
                return;
            }
        } else {
            // Full validation for regular inventories
            if (!type) {
                setErrorMessage(INVENTORY_EDIT_UI.ERROR_TYPE_REQUIRED);
                return;
            }

            if (!storageTerm) {
                setErrorMessage(INVENTORY_EDIT_UI.ERROR_STORAGE_TERM_REQUIRED);
                return;
            }
        }
        
        try {
            // Prepare the inventory data for update
            let inventoryData;
            
            if (isFromReport) {
                // For report inventories, only update dates
                inventoryData = {
                    number: inventory.number,
                    type: type.value || type,
                    start_date: startDate,
                    end_date: endDate,
                    storage_term: storageTerm.value || storageTerm
                };
            } else {
                // For regular inventories, update all fields
                inventoryData = {
                    number: inventory.number, // Keep existing number
                    type: type.value || type,
                    subfond: subFondEnabled ? subfond : "0",
                    electronic: electronic,
                    start_date: startDate,
                    end_date: endDate,
                    storage_term: storageTerm.value || storageTerm,
                };
            }

            console.log('Updating inventory with data:', inventoryData);

            // Submit the form using PUT method
            await updateInventoryMutation.mutateAsync({
                projectId,
                inventoryId: inventory.id,
                inventoryData
            });

            // Close the modal on success
            onClose();
            
        } catch (error) {
            console.error('Error updating inventory:', error);
            setErrorMessage(error.message || INVENTORY_EDIT_UI.ERROR_UPDATE_FAILED);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    const handleTypeChange = (selectedOption) => {
        setType(selectedOption);
        if (errorMessage.includes('veidu') || errorMessage === INVENTORY_EDIT_UI.ERROR_TYPE_REQUIRED) {
            setErrorMessage('');
        }
    };

    const handleStorageTermChange = (selectedOption) => {
        setStorageTerm(selectedOption);
        if (errorMessage.includes('termiņu') || errorMessage === INVENTORY_EDIT_UI.ERROR_STORAGE_TERM_REQUIRED) {
            setErrorMessage('');
        }
    };

    const handleStartDateChange = (dateString) => {
        setStartDate(dateString);
        console.log('Start date changed to:', dateString);
    };

    const handleEndDateChange = (dateString) => {
        setEndDate(dateString);
        console.log('End date changed to:', dateString);
    };

    const toggleSubfond = () => {
        setSubFondEnabled(!subFondEnabled);
    };

    return (
        <div className="inventory-create-modal-backdrop">
            <div className="inventory-create-modal-container">
                <h2 className="inventory-create-modal-title">
                    {isFromReport ? INVENTORY_EDIT_UI.TITLE_REPORT : INVENTORY_EDIT_UI.TITLE}
                </h2>
                
                <form onSubmit={handleSubmit} className="inventory-create-form">
                    {errorMessage && (
                        <div className="inventory-create-error-message">
                            {errorMessage}
                        </div>
                    )}

                    {isFromReport ? (
                        // Limited editing for report inventories - only dates
                        <>
                            <div className="inventory-create-input-group">
                                <p style={{ 
                                    color: 'var(--text-muted)', 
                                    fontSize: 'var(--font-size-sm)',
                                    marginBottom: 'var(--spacing-4)',
                                    padding: 'var(--spacing-3)',
                                    background: 'rgba(var(--color-primary-rgb), 0.05)',
                                    borderRadius: 'var(--border-radius-base)',
                                    borderLeft: '3px solid var(--color-primary)'
                                }}>
                                    {INVENTORY_EDIT_UI.REPORT_INFO_MESSAGE}
                                </p>
                            </div>

                            {/* Start Date */}
                            <div className="inventory-create-input-group">
                                <label className="inventory-create-label">
                                    {INVENTORY_CREATE_UI.START_DATE_LABEL}
                                </label>
                                <div className="inventory-create-year-picker">
                                    <YearPicker
                                        onChange={handleStartDateChange}
                                        placeholder={INVENTORY_CREATE_UI.YEAR_START_PLACEHOLDER}
                                        initialValue={startDate}
                                        isStartDate={true}
                                    />
                                </div>
                            </div>

                            {/* End Date */}
                            <div className="inventory-create-input-group">
                                <label className="inventory-create-label">
                                    {INVENTORY_CREATE_UI.END_DATE_LABEL}
                                </label>
                                <div className="inventory-create-year-picker">
                                    <YearPicker
                                        onChange={handleEndDateChange}
                                        placeholder={INVENTORY_CREATE_UI.YEAR_END_PLACEHOLDER}
                                        initialValue={endDate}
                                        isStartDate={false}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        // Full editing for regular inventories
                        <>
                            {/* Type Selection */}
                            <div className="inventory-create-input-group">
                                <label className="inventory-create-label">
                                    {INVENTORY_CREATE_UI.TYPE_LABLE}
                                </label>
                                <Select
                                    value={type}
                                    onChange={handleTypeChange}
                                    options={typeOptions}
                                    styles={inventoryEditSelectStyles}
                                    placeholder={INVENTORY_CREATE_UI.TYPE_PLACEHOLDER}
                                    isSearchable={false}
                                    className="inventory-create-select"
                                />
                            </div>

                            {/* Subfond Selection */}
                            <div className="inventory-create-input-group-subfond">
                                <div className="inventory-create-checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="subfond-enabled"
                                        checked={subFondEnabled}
                                        onChange={toggleSubfond}
                                        className="inventory-create-checkbox"
                                    />
                                    <label 
                                        htmlFor="subfond-enabled" 
                                        className="inventory-create-checkbox-label"
                                    >
                                        {INVENTORY_CREATE_UI.SUBFOND_LABLE}
                                    </label>
                                </div>
                                {subFondEnabled && (
                                    <input
                                        type="number"
                                        value={subfond}
                                        onChange={(e) => setSubfond(e.target.value)}
                                        className="inventory-create-number-input"
                                        placeholder={INVENTORY_EDIT_UI.SUBFOND_PLACEHOLDER}
                                        min="1"
                                    />
                                )}
                            </div>

                            {/* Electronic Checkbox */}
                            <div className="inventory-create-input-group-checkbox">
                                <input
                                    type="checkbox"
                                    id="electronic"
                                    checked={electronic}
                                    onChange={(e) => setElectronic(e.target.checked)}
                                    className="inventory-create-checkbox"
                                />
                                <label 
                                    htmlFor="electronic" 
                                    className="inventory-create-checkbox-label"
                                >
                                    {INVENTORY_CREATE_UI.ELECTRONIC_LABEL}
                                </label>
                            </div>

                            {/* Date Range */}
                            <div className="inventory-create-date-range">
                                <div className="inventory-create-input-group">
                                    <label className="inventory-create-label">
                                        {INVENTORY_CREATE_UI.START_DATE_LABEL}
                                    </label>
                                    <div className="inventory-create-year-picker">
                                        <YearPicker
                                            onChange={handleStartDateChange}
                                            placeholder={INVENTORY_CREATE_UI.YEAR_START_PLACEHOLDER}
                                            initialValue={startDate}
                                            isStartDate={true}
                                        />
                                    </div>
                                </div>

                                <div className="inventory-create-input-group">
                                    <label className="inventory-create-label">
                                        {INVENTORY_CREATE_UI.END_DATE_LABEL}
                                    </label>
                                    <div className="inventory-create-year-picker">
                                        <YearPicker
                                            onChange={handleEndDateChange}
                                            placeholder={INVENTORY_CREATE_UI.YEAR_END_PLACEHOLDER}
                                            initialValue={endDate}
                                            isStartDate={false}
                                        />
                                    </div>
                                </div>
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
                                    styles={inventoryEditSelectStyles}
                                    placeholder={INVENTORY_CREATE_UI.STORAGE_TERM_PLACEHOLDER}
                                    isSearchable={false}
                                    className="inventory-create-select"
                                />
                            </div>
                        </>
                    )}

                    {/* Form Actions */}
                    <div className="inventory-create-form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="inventory-create-cancel-button"
                            disabled={updateInventoryMutation.isPending}
                        >
                            {INVENTORY_EDIT_UI.CANCEL}
                        </button>
                        <button
                            type="submit"
                            className="inventory-create-submit-button"
                            disabled={updateInventoryMutation.isPending}
                        >
                            {updateInventoryMutation.isPending ? INVENTORY_EDIT_UI.SAVE_IN_PROGRESS : INVENTORY_EDIT_UI.SAVE}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditInventory;