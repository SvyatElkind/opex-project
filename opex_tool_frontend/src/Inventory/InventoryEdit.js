import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import YearPicker from '../Utils/YearPicker';
import { INVENTORY_CREATE_UI, INVENTORY_EDIT_UI,COMMON_UI } from '../Constants/Constants';
import { useConstants } from '../context/ConstantsContext';
import { useUpdateInventory } from '../hooks/useInventories';
import { useProject } from '../hooks/useProjects';
import Utils from '../Utils/Utils';
import { useFormErrors } from '../hooks/useFormErrors';
import { GeneralError, FieldError } from '../components/ErrorDisplay';
import { validateInventoryUpdate, ERROR_MESSAGES } from '../Constants/inventoryConstants';
import HelpButton from '../Help/HelpButton';

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

    // Get constants from context (API-fetched with fallback)
    const { storageTerms } = useConstants();

    // Prepare options for selects
    const storageTermOptions = storageTerms.map(term => ({ value: term, label: term }));

    // Determine if this inventory is from a report or has items (limits editing)
    const isFromReport = inventory.from_report;
    const hasItems = (inventory.total_items || 0) > 0;
    const limitedEditing = isFromReport || hasItems;

    // Initialize form state with existing inventory data
    const [subfond, setSubfond] = useState(inventory.subfond || '');
    const [electronic, setElectronic] = useState(inventory.electronic || false);
    const [startDate, setStartDate] = useState(inventory.start_date || '');
    const [endDate, setEndDate] = useState(inventory.end_date || '');

    const [storageTerm, setStorageTerm] = useState(() => {
        const termOption = storageTerms.find(t => t === inventory.storage_term);
        return termOption ? { value: termOption, label: termOption } : '';
    });

    const [subFondEnabled, setSubFondEnabled] = useState(!!inventory.subfond);

    // Error handling
    const { generalError, setGeneralError, setApiErrors, clearErrors, getFieldError, clearFieldError, setFieldErrors } = useFormErrors();

    // React Query hooks
    const updateInventoryMutation = useUpdateInventory();
    const { data: activeProjectData } = useProject(projectId);

    const handleSubmit = async (event) => {
        event.preventDefault();
        clearErrors();

        // Prepare the inventory data for update
        let inventoryData;

        if (limitedEditing) {
            // For report inventories or inventories with items, only update limited fields
            inventoryData = {
                number: inventory.number,
                type: inventory.type,
                subfond: subFondEnabled ? subfond : "0",
                start_date: startDate,
                end_date: endDate,
                storage_term: storageTerm.value || storageTerm
            };
        } else {
            // For regular inventories without items, update all fields
            inventoryData = {
                number: inventory.number,
                type: inventory.type,
                subfond: subFondEnabled ? subfond : "0",
                electronic: electronic,
                start_date: startDate,
                end_date: endDate,
                storage_term: storageTerm.value || storageTerm,
            };
        }

        // Client-side validation
        const validation = validateInventoryUpdate(inventoryData);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            return;
        }

        try {
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

    const handleStorageTermChange = (selectedOption) => {
        setStorageTerm(selectedOption);
        clearFieldError('storage_term');
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
                <div className="inventory-create-modal-header">
                    <h2 className="inventory-create-modal-title">
                        {INVENTORY_EDIT_UI.TITLE}
                    </h2>
                    <div className="inventory-craete-modal-help">
                        <HelpButton chapterId="inventories" iconOnly={true} className="small" />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="inventory-create-form">
                    <GeneralError message={generalError} onClose={clearErrors} />

                    {limitedEditing ? (
                        // Limited editing for report inventories or inventories with items
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
                                    {isFromReport
                                        ? INVENTORY_EDIT_UI.REPORT_INFO_MESSAGE
                                        : INVENTORY_EDIT_UI.ITEMS_EXIST_INFO_MESSAGE}
                                </p>
                            </div>

                            {/* Date Range */}
                            <label className="inventory-create-label">
                                {INVENTORY_CREATE_UI.DATE_LABEL}
                                <div className="inventory-create-date-range">

                                    <div className="inventory-create-input-group">
                                        <div className="inventory-create-year-picker">
                                            <YearPicker
                                                onChange={handleStartDateChange}
                                                placeholder={INVENTORY_CREATE_UI.YEAR_START_PLACEHOLDER}
                                                initialValue={startDate}
                                                isStartDate={true}
                                            />
                                        </div>
                                        <FieldError error={getFieldError('start_date')} />
                                    </div>

                                    <div className="inventory-create-input-group">
                                        <div className="inventory-create-year-picker">
                                            <YearPicker
                                                onChange={handleEndDateChange}
                                                placeholder={INVENTORY_CREATE_UI.YEAR_END_PLACEHOLDER}
                                                initialValue={endDate}
                                                isStartDate={false}
                                            />
                                        </div>
                                        <FieldError error={getFieldError('end_date')} />
                                    </div>
                                </div>
                            </label>

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
                                <FieldError error={getFieldError('storage_term')} />
                            </div>
                            
                            {/* Subfond Selection */}
                            <div className="inventory-create-input-group-subfond">
                                <div className="inventory-create-checkbox-group">
                                    <label
                                        htmlFor="subfond-enabled"
                                        className="inventory-create-checkbox-label"
                                    >
                                        {INVENTORY_CREATE_UI.SUBFOND_LABEL}
                                    </label>
                                    <input
                                        type="checkbox"
                                        id="subfond-enabled"
                                        checked={subFondEnabled}
                                        onChange={toggleSubfond}
                                        className="inventory-create-checkbox"
                                    />

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
                        </>
                    ) : (
                        // Full editing for regular inventories
                        <>
                            {/* Type Display (Read-only) */}
                            <div className="inventory-create-input-group">
                                <label className="inventory-create-label">
                                    {INVENTORY_CREATE_UI.TYPE_LABEL}
                                </label>
                                <div style={{
                                    padding: 'var(--spacing-3) var(--spacing-4)',
                                    background: 'var(--color-background-secondary, #f8fafc)',
                                    borderRadius: 'var(--border-radius-base)',
                                    border: '1px solid var(--border-color-light)',
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--text-primary)'
                                }}>
                                    {inventory.type || '-'}
                                </div>
                            </div>

                            {/* Electronic Checkbox */}
                            <div className="inventory-create-input-group-checkbox">
                                <label 
                                    htmlFor="electronic" 
                                    className="inventory-create-checkbox-label"
                                >
                                    {INVENTORY_CREATE_UI.ELECTRONIC_LABEL}
                                </label>
                                <input
                                    type="checkbox"
                                    id="electronic"
                                    checked={electronic}
                                    onChange={(e) => setElectronic(e.target.checked)}
                                    className="inventory-create-checkbox"
                                />
                            </div>

                            {/* Date Range */}
                            <label className="inventory-create-label">
                                {INVENTORY_CREATE_UI.DATE_LABEL}
                            
                                <div className="inventory-create-date-range">
                                    <div className="inventory-create-input-group">
                                        <div className="inventory-create-year-picker">
                                            <YearPicker
                                                onChange={handleStartDateChange}
                                                placeholder={INVENTORY_CREATE_UI.YEAR_START_PLACEHOLDER}
                                                initialValue={startDate}
                                                isStartDate={true}
                                            />
                                        </div>
                                        <FieldError error={getFieldError('start_date')} />
                                    </div>

                                    <div className="inventory-create-input-group">
                                        <div className="inventory-create-year-picker">
                                            <YearPicker
                                                onChange={handleEndDateChange}
                                                placeholder={INVENTORY_CREATE_UI.YEAR_END_PLACEHOLDER}
                                                initialValue={endDate}
                                                isStartDate={false}
                                            />
                                        </div>
                                        <FieldError error={getFieldError('end_date')} />
                                    </div>
                                </div>
                            </label>

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
                                <FieldError error={getFieldError('storage_term')} />
                            </div>
                            {/* Subfond Selection */}
                            <div className="inventory-create-input-group-subfond">
                                <div className="inventory-create-checkbox-group">
                                    <label 
                                        htmlFor="subfond-enabled" 
                                        className="inventory-create-checkbox-label"
                                    >
                                        {INVENTORY_CREATE_UI.SUBFOND_LABEL}
                                    </label>
                                    <input
                                        type="checkbox"
                                        id="subfond-enabled"
                                        checked={subFondEnabled}
                                        onChange={toggleSubfond}
                                        className="inventory-create-checkbox"
                                    />
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