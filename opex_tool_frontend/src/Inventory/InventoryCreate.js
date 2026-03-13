import React, { useState } from "react";
import Select from 'react-select';
import YearPicker from "../Utils/YearPicker";
import { INVENTORY_CREATE_UI } from "../Constants/Constants";
import { useConstants } from "../context/ConstantsContext";
import Utils from "../Utils/Utils";
import { useCreateInventory } from "../hooks/useInventories";
import { useProject } from "../hooks/useProjects";
import { useFormErrors } from "../hooks/useFormErrors";
import { GeneralError, FieldError } from "../components/ErrorDisplay";
import { validateInventoryCreate, ERROR_MESSAGES } from "../Constants/inventoryConstants";
import "./InventoryCreate.css";
import HelpButton from '../Help/HelpButton';

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
        backgroundColor: 'var(--color-background)',
        border: '1px solid var(--border-color-medium)',
        boxShadow: 'var(--shadow-lg)',
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
            : 'var(--color-background)',
        color: state.isSelected ? 'white' : 'var(--text-primary)',
        padding: 'var(--spacing-3) var(--spacing-4)',
        cursor: 'pointer',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family-primary)',
        '&:active': {
            backgroundColor: state.isSelected
                ? 'var(--color-primary-dark)'
                : 'rgba(var(--color-primary-rgb), 0.2)',
        },
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

const InventoryCreate = ({ onClose, projectId, fondId, initialData = null }) => {
    // Get constants from context (API-fetched with fallback)
    const { inventoryTypes, storageTerms } = useConstants();

    // Generate options from API constants
    const typeOptions = inventoryTypes.map(type => ({ value: type, label: type }));
    const storageTermOptions = storageTerms.map(term => ({ value: term, label: term }));

    // Local state - use initialData if provided
    const [type, setType] = useState(initialData?.type || '');
    const [subfond, setSubfond] = useState('');
    const [electronic, setElectronic] = useState(initialData?.electronic !== undefined ? initialData.electronic : true);
    const [startDate, setStartDate] = useState(''); // Will be in YYYY-MM-DD format
    const [endDate, setEndDate] = useState('');     // Will be in YYYY-MM-DD format
    const [storageTerm, setStorageTerm] = useState('');
    const [subFondEnabled, setSubFondEnabled] = useState(false);

    // Error handling
    const { generalError, setGeneralError, setApiErrors, clearErrors, getFieldError, clearFieldError, setFieldErrors } = useFormErrors();

    // Update state when initialData changes (for pre-filling from roadmap wizard)
    React.useEffect(() => {
        if (initialData) {
            if (initialData.type) setType(initialData.type);
            if (initialData.electronic !== undefined) setElectronic(initialData.electronic);
        }
    }, [initialData]);

    // React Query hooks
    const createInventoryMutation = useCreateInventory();
    const { data: activeProjectData } = useProject(projectId);
    const utils = Utils();

    const handleSubmit = async (event) => {
        event.preventDefault();
        clearErrors();

        // Calculate the next inventory number
        const inventoryCount = activeProjectData?.institution?.fond?.inventories?.length || 0;
        const nextInventoryNumber = inventoryCount + 1;

        // Prepare the inventory data
        const inventoryData = {
            number: nextInventoryNumber,
            type: type.value || type,
            subfond: subFondEnabled ? subfond : "0",
            electronic: electronic,
            start_date: startDate,
            end_date: endDate,
            storage_term: storageTerm.value || storageTerm,
        };

        // Client-side validation
        const validation = validateInventoryCreate(inventoryData);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            return;
        }

        try {
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
            if (error.fieldErrors) {
                setApiErrors({ ...error.fieldErrors, error: error.message });
            } else {
                setGeneralError(error.message || ERROR_MESSAGES.date_invalid);
            }
        }
    };

    const handleCancel = () => {
        onClose();
    };

    const handleTypeChange = (selectedOption) => {
        setType(selectedOption);
        clearFieldError('type');
    };

    const handleStorageTermChange = (selectedOption) => {
        setStorageTerm(selectedOption);
        clearFieldError('storage_term');
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
                <div className="inventory-create-modal-header">
                    <h2 className="inventory-create-modal-title">
                        {INVENTORY_CREATE_UI.TITLE}
                    </h2>
                    <div className="inventory-craete-modal-help">
                        <HelpButton chapterId="inventories" iconOnly={true} className="small" />
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="inventory-create-form">
                    <GeneralError message={generalError} onClose={clearErrors} />

                    {/* Info banner when pre-filled from roadmap */}
                    {initialData && (
                        <div className="inventory-create-prefill-info">
                            <i className="fas fa-info-circle"></i>
                            <span>
                                Lauki ir aizpildīti automātiski no ceļa kartes.
                                Uzskaites saraksts tiks izveidots ar numuru {initialData.number}.
                            </span>
                        </div>
                    )}

                    {/* Type Selection */}
                    <div className="inventory-create-input-group">
                        <label className="inventory-create-label">
                            {INVENTORY_CREATE_UI.TYPE_LABEL}
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
                        <FieldError error={getFieldError('type')} />
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


                    </div>


                    {/* Date Range Section */}
                    <label className="inventory-create-label">
                        {INVENTORY_CREATE_UI.DATE_LABEL}
                    </label>
                    <div className="inventory-create-date-range">
                        <div className="inventory-create-input-group">
                            <YearPicker
                                value={startDate}
                                onChange={handleStartDateChange}
                                placeholder={INVENTORY_CREATE_UI.YEAR_START_PLACEHOLDER}
                                isStartDate={true}
                            />
                            <FieldError error={getFieldError('start_date')} />
                        </div>

                        <div className="inventory-create-input-group">
                            <YearPicker
                                value={endDate}
                                onChange={handleEndDateChange}
                                placeholder={INVENTORY_CREATE_UI.YEAR_END_PLACEHOLDER}
                                isStartDate={false}
                            />
                            <FieldError error={getFieldError('end_date')} />
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
                            styles={inventoryCreateSelectStyles}
                            placeholder={INVENTORY_CREATE_UI.STORAGE_TERM_PLACEHOLDER}
                            isSearchable={false}
                            className="inventory-create-select"
                        />
                        <FieldError error={getFieldError('storage_term')} />
                    </div>

                    {/* Subfond Section - Inline layout */}
                    <div className="inventory-create-subfond-row">
                        <label htmlFor="inventory-create-subfond-toggle" className="inventory-create-checkbox-label">
                            {INVENTORY_CREATE_UI.SUBFOND_LABEL}
                        </label>
                        <input
                            type="checkbox"
                            id="inventory-create-subfond-toggle"
                            checked={subFondEnabled}
                            onChange={() => toggleSubfond()}
                            className="inventory-create-checkbox"
                        />
                        {subFondEnabled && (
                            <div className="inventory-create-input-group-subfond">
                                <input
                                    type="number"
                                    value={subfond}
                                    onChange={(e) => setSubfond(parseInt(e.target.value, 10) || '')}
                                    placeholder="0"
                                    className="inventory-create-number-input inventory-create-subfond-input"
                                    min={1}
                                />
                            </div>
                        )}
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