// src/Record/MediaRecordForm.js
// Form component for step 2 of media record creation - API spec compliant

import React, { useState, useEffect } from 'react';
import { validateRecordForm, formatDuration, validateDurationFormat } from '../Utils/RecordValidation';
import './RecordForm.css';

const MediaRecordForm = ({ onSubmit, isSubmitting, inventory, existingRecord }) => {
    // Form state based on inventory type
    const [formData, setFormData] = useState({
        // Common fields
        description: '',
        
        // Photo & Video fields
        color: '',
        horizontal_resolution: '',
        vertical_resolution: '',
        
        // Video & Audio fields  
        duration: ''
    });
    
    const [errors, setErrors] = useState({});
    const [durationHint, setDurationHint] = useState('');

    // Initialize form with existing record data if available
    useEffect(() => {
        if (existingRecord) {
            setFormData(prevData => ({
                ...prevData,
                color: existingRecord.color || '',
                horizontal_resolution: existingRecord.horizontal_resolution || '',
                vertical_resolution: existingRecord.vertical_resolution || '',
                duration: existingRecord.duration || '',
                description: existingRecord.description || ''
            }));
        }
    }, [existingRecord]);

    // Get required fields based on inventory type
    const getRequiredFields = () => {
        switch (inventory.type) {
            case 'Foto':
                return ['color', 'horizontal_resolution', 'vertical_resolution'];
            case 'Video':
                return ['color', 'duration', 'horizontal_resolution', 'vertical_resolution'];
            case 'Skaņas':
                return ['duration'];
            default:
                return [];
        }
    };

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear field-specific errors
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }

        // Special handling for duration field
        if (field === 'duration' && value) {
            const durationValidation = validateDurationFormat(value);
            if (durationValidation.suggestion) {
                setDurationHint(durationValidation.suggestion);
            } else {
                setDurationHint('');
            }
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;

        // Prepare form data for API
        const submissionData = {};
        const requiredFields = getRequiredFields();

        // Add required fields based on inventory type
        requiredFields.forEach(field => {
            if (field === 'duration' && formData.duration) {
                // Format duration to HH:MM:SS
                const formatted = formatDuration(formData.duration);
                submissionData.duration = formatted;
            } else if (field === 'horizontal_resolution' || field === 'vertical_resolution') {
                // Ensure resolution values are integers
                submissionData[field] = parseInt(formData[field]) || 0;
            } else {
                submissionData[field] = formData[field] || '';
            }
        });

        // Add description if provided
        if (formData.description && formData.description.trim()) {
            submissionData.description = formData.description.trim();
        }

        // Validate form
        const validation = validateRecordForm(submissionData, [], inventory.type, 'media');
        
        if (!validation.isValid) {
            const fieldErrors = {};
            validation.errors.record?.forEach(error => {
                // Map errors to specific fields where possible
                if (error.includes('Krāsa')) fieldErrors.color = error;
                else if (error.includes('Horizontālā')) fieldErrors.horizontal_resolution = error;
                else if (error.includes('Vertikālā')) fieldErrors.vertical_resolution = error;  
                else if (error.includes('Ilgums')) fieldErrors.duration = error;
                else fieldErrors.general = error;
            });
            
            setErrors(fieldErrors);
            return;
        }

        // Submit valid form data
        onSubmit(submissionData);
    };

    // Render field based on type
    const renderField = (fieldName, fieldConfig) => {
        const { type, label, placeholder, required, min, max } = fieldConfig;
        const hasError = errors[fieldName];
        const value = formData[fieldName] || '';

        return (
            <div key={fieldName} className="form-field">
                <label className="field-label">
                    {label}
                    {required && <span className="required-indicator"> *</span>}
                </label>
                
                {type === 'textarea' ? (
                    <textarea
                        className={`form-input ${hasError ? 'error' : ''}`}
                        value={value}
                        onChange={(e) => handleInputChange(fieldName, e.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        disabled={isSubmitting}
                    />
                ) : (
                    <input
                        type={type}
                        className={`form-input ${hasError ? 'error' : ''}`}
                        value={value}
                        onChange={(e) => handleInputChange(fieldName, e.target.value)}
                        placeholder={placeholder}
                        min={min}
                        max={max}
                        disabled={isSubmitting}
                    />
                )}
                
                {hasError && (
                    <div className="field-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {hasError}
                    </div>
                )}
                
                {fieldName === 'duration' && durationHint && (
                    <div className="field-hint">
                        <i className="fas fa-info-circle"></i>
                        {durationHint}
                    </div>
                )}
            </div>
        );
    };

    // Get form fields configuration based on inventory type
    const getFormFields = () => {
        const fields = [];
        
        // Always show description field first
        fields.push({
            name: 'description',
            type: 'textarea',
            label: 'Apraksts',
            placeholder: 'Ievadiet dokumenta aprakstu (nav obligāts)...',
            required: false
        });

        // Add fields based on inventory type
        switch (inventory.type) {
            case 'Foto':
                fields.push(
                    {
                        name: 'color',
                        type: 'text',
                        label: 'Krāsa',
                        placeholder: 'Piemēram: krāsains, melnbalts, sēpija...',
                        required: true
                    },
                    {
                        name: 'horizontal_resolution',
                        type: 'number',
                        label: 'Horizontālā izšķirtspēja (px)',
                        placeholder: '1920',
                        required: true,
                        min: 1,
                        max: 99999
                    },
                    {
                        name: 'vertical_resolution',
                        type: 'number',
                        label: 'Vertikālā izšķirtspēja (px)',
                        placeholder: '1080',
                        required: true,
                        min: 1,
                        max: 99999
                    }
                );
                break;
                
            case 'Video':
                fields.push(
                    {
                        name: 'color',
                        type: 'text',
                        label: 'Krāsa',
                        placeholder: 'Piemēram: krāsains, melnbalts...',
                        required: true
                    },
                    {
                        name: 'duration',
                        type: 'text',
                        label: 'Ilgums',
                        placeholder: 'HH:MM:SS (piemēram: 01:23:45)',
                        required: true
                    },
                    {
                        name: 'horizontal_resolution',
                        type: 'number',
                        label: 'Horizontālā izšķirtspēja (px)',
                        placeholder: '1920',
                        required: true,
                        min: 1,
                        max: 99999
                    },
                    {
                        name: 'vertical_resolution',
                        type: 'number',
                        label: 'Vertikālā izšķirtspēja (px)',
                        placeholder: '1080',
                        required: true,
                        min: 1,
                        max: 99999
                    }
                );
                break;
                
            case 'Skaņas':
                fields.push({
                    name: 'duration',
                    type: 'text',
                    label: 'Ilgums',
                    placeholder: 'HH:MM:SS (piemēram: 01:23:45)',
                    required: true
                });
                break;
        }

        return fields;
    };

    const formFields = getFormFields();
    const requiredFields = getRequiredFields();
    const hasGeneralError = errors.general;

    return (
        <form onSubmit={handleSubmit} className="media-record-form">
            <div className="form-header">
                <h4>
                    <i className={`fas fa-${inventory.type === 'Foto' ? 'camera' : inventory.type === 'Video' ? 'video' : 'microphone'}`}></i>
                    {inventory.type} dokumenta informācija
                </h4>
                <p>Aizpildiet obligātos laukus lai pabeigtu dokumenta izveidi.</p>
            </div>

            {/* General error message */}
            {hasGeneralError && (
                <div className="form-error-banner">
                    <i className="fas fa-exclamation-triangle"></i>
                    {hasGeneralError}
                </div>
            )}

            {/* Form fields */}
            <div className="form-fields">
                {formFields.map(field => renderField(field.name, field))}
            </div>

            {/* Required fields info */}
            <div className="required-fields-info">
                <p>
                    <i className="fas fa-asterisk"></i>
                    Obligātie lauki: {requiredFields.map(field => {
                        const fieldLabels = {
                            color: 'Krāsa',
                            horizontal_resolution: 'Horizontālā izšķirtspēja',
                            vertical_resolution: 'Vertikālā izšķirtspēja',
                            duration: 'Ilgums'
                        };
                        return fieldLabels[field];
                    }).join(', ')}
                </p>
            </div>

            {/* Submit button */}
            <div className="form-actions">
                <button 
                    type="submit" 
                    className="btn btn-primary submit-btn"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <div className="spinner"></div>
                            Saglabā dokumentu...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-check"></i>
                            Pabeigt dokumenta izveidošanu
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default MediaRecordForm;