import React, { useState } from "react";
import CalendarComponent from "../Utils/CalendarComponent";
import Select from 'react-select';
import { INVENTORY_CONSTANTS, INVENTORY_CREATE_UI } from "../Constants/Constnats";
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
            const number = inventoryCount + 1;
            
            // Format dates
            const formatedStartDate = utils.formatDate(formatedStartDate);
            const formatedEndDate = utils.formatDate(formatedEndDate);

            const postfix = '';

            const inventoryData = {
                number,
                subfond,
                postfix,
                type,
                electronic,
                start_date:formatedStartDate,
                end_date:formatedEndDate,
                storage_term: storageTerm,
            };

            await createInventoryMutation.mutateAsync({
                projectId,
                fondId,
                inventoryData
            });

            // Close the popup on success
            onClose();

        } catch (error) {
            setErrorMessage(error.message || 'Failed to create inventory');
        }
    };

    const handleCancel = () => {
        onClose();
    };

    const toggleSubFond = () => {
        setSubFondEnabled(!subFondEnabled);
        if (!subFondEnabled) {
            setSubfond('');
        }
    };

    return (
        <div className="inventory-create-modal-backdrop">
            <div className="inventory-create-modal-container">
                <h2 className="inventory-create-modal-title">{INVENTORY_CREATE_UI.TITLE}</h2>
                
                <form className="inventory-create-form" onSubmit={handleSubmit}>
                    {errorMessage && (
                        <div className="inventory-create-error-message">
                            {errorMessage}
                        </div>
                    )}

                    <div className="inventory-create-form-grid">
                        <div className="inventory-create-input-group">
                            <label className="inventory-create-label">{INVENTORY_CREATE_UI.TYPE_LABLE}</label>
                            <Select
                                options={typeOptions}
                                value={typeOptions.find(option => option.value === type)}
                                onChange={(selectedOption) => setType(selectedOption?.value || '')}
                                placeholder="Select inventory type"
                                styles={inventoryCreateSelectStyles}
                                isSearchable={false}
                                className="inventory-create-select-container"
                            />
                        </div>

                        <div className="inventory-create-input-group">
                            <label className="inventory-create-label">{INVENTORY_CREATE_UI.STORAGE_TERM}</label>
                            <Select
                                options={storageTermOptions}
                                value={storageTermOptions.find(option => option.value === storageTerm)}
                                onChange={(selectedOption) => setStorageTerm(selectedOption?.value || '')}
                                placeholder="Select storage term"
                                styles={inventoryCreateSelectStyles}
                                isSearchable={false}
                                className="inventory-create-select-container"
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
                                <label htmlFor="inventory-create-subfond-toggle" className="inventory-create-checkbox-label">{INVENTORY_CREATE_UI.SUBFOND_LABLE}</label>
                                <input
                                    type="checkbox"
                                    id="inventory-create-subfond-toggle"
                                    checked={subFondEnabled}
                                    onChange={toggleSubFond}
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

                        <div className="inventory-create-input-group">
                            <label className="inventory-create-label">{INVENTORY_CREATE_UI.START_DATE_LABEL}</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="inventory-create-date-input"
                            />
                        </div>

                        <div className="inventory-create-input-group">
                            <label className="inventory-create-label">{INVENTORY_CREATE_UI.END_DATE_LABEL}</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="inventory-create-date-input"
                            />
                        </div>
                    </div>

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