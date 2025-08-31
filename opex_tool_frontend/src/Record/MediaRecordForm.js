// src/Record/MediaRecordForm.js
// Form component for creating/editing media records (Photo, Video, Audio, Database)

import React, { useState, useEffect } from 'react';
import { RECORD_UI, RECORD_VALIDATION, RECORD_ERROR_MESSAGES } from '../Constants/Constnats';
import { validateRecordForm, hasValidationErrors } from '../Utils/RecordValidation';
import Utils from '../Utils/Utils';
import './RecordForm.css';

const MediaRecordForm = ({ 
    mediaType, 
    onSubmit, 
    onCancel, 
    initialData = {}, 
    isEditing = false,
    isSubmitting = false 
}) => {
    const utils = Utils();

    // Initialize form data based on media type and initial data
    const getInitialFormData = () => {
        const baseForm = {
            title: initialData.title || '',
            date: initialData.date || utils.formatDate(new Date()),
            created_date: initialData.created_date || utils.formatDate(new Date()),
            sent_date: initialData.sent_date || '',
            language: initialData.language || 'Latviešu',
            annotation: initialData.annotation || '',
            key_words: initialData.key_words || '',
            reg_nr: initialData.reg_nr || '',
            sent_reg_nr: initialData.sent_reg_nr || '',
            group: initialData.group || '',
            nomenclature_nr: initialData.nomenclature_nr || '',
            notes: initialData.notes || '',
            access_restriction: initialData.access_restriction || 'open',
            access_restriction_notes: initialData.access_restriction_notes || '',
            access_restriction_date: initialData.access_restriction_date || '',
            user_restriction_notes: initialData.user_restriction_notes || '',
            tech_info: initialData.tech_info || '',
            format: initialData.format || ''
        };
        
        // Add media-specific fields
        switch (mediaType?.toLowerCase()) {
            case 'photo':
            case 'foto':
                return {
                    ...baseForm,
                    color: initialData.color || '',
                    horizontal_resolution: initialData.horizontal_resolution || '',
                    vertical_resolution: initialData.vertical_resolution || '',
                    group: initialData.group || 'Fotogrāfijas',
                    tech_info: initialData.tech_info || 'Foto materiāls'
                };
                
            case 'video':
                return {
                    ...baseForm,
                    duration: initialData.duration || '',
                    color: initialData.color || '',
                    horizontal_resolution: initialData.horizontal_resolution || '',
                    vertical_resolution: initialData.vertical_resolution || '',
                    group: initialData.group || 'Video ieraksti',
                    tech_info: initialData.tech_info || 'Video materiāls'
                };
                
            case 'audio':
            case 'skaņas':
                return {
                    ...baseForm,
                    duration: initialData.duration || '',
                    group: initialData.group || 'Audio ieraksti',
                    tech_info: initialData.tech_info || 'Audio materiāls'
                };
                
            case 'database':
            case 'datubāze':
                return {
                    ...baseForm,
                    group: initialData.group || 'Elektroniskas datubāzes',
                    tech_info: initialData.tech_info || 'Elektronisks materiāls',
                    format: initialData.format || 'Datubāze'
                };
                
            default:
                return baseForm;
        }
    };

    const [formData, setFormData] = useState(getInitialFormData());
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    // Update form data when initialData changes (for editing)
    useEffect(() => {
        if (isEditing && initialData) {
            setFormData(getInitialFormData());
        }
    }, [isEditing, initialData, mediaType]);

    // Get media type display name
    const getMediaTypeName = () => {
        const typeMap = {
            'photo': 'Foto',
            'foto': 'Foto',
            'video': 'Video',
            'audio': 'Audio',
            'skaņas': 'Audio',
            'database': 'Datubāze',
            'datubāze': 'Datubāze'
        };
        return typeMap[mediaType?.toLowerCase()] || mediaType;
    };

    // Check if field should be shown for this media type
    const shouldShowField = (fieldName) => {
        const mediaLower = mediaType?.toLowerCase();
        
        switch (fieldName) {
            case 'duration':
                return ['video', 'audio', 'skaņas'].includes(mediaLower);
            case 'color':
            case 'horizontal_resolution':
            case 'vertical_resolution':
                return ['photo', 'foto', 'video'].includes(mediaLower);
            case 'format':
                return ['database', 'datubāze', 'video', 'audio', 'skaņas'].includes(mediaLower);
            default:
                return true;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        setIsDirty(true);
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
        
        // Real-time validation for specific fields
        if (name === 'access_restriction') {
            handleAccessRestrictionChange(value);
        }
    };

    const handleAccessRestrictionChange = (value) => {
        if (value === 'open') {
            // Clear restriction date when switching to open
            setFormData(prev => ({
                ...prev,
                access_restriction_date: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const validationErrors = validateRecordForm(formData, mediaType?.toLowerCase());
        
        if (hasValidationErrors(validationErrors)) {
            setErrors(validationErrors);
            // Scroll to first error
            const firstErrorField = Object.keys(validationErrors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.focus();
            }
            return;
        }
        
        // Clean data before submission
        const cleanedData = { ...formData };
        
        // Remove empty strings and null values
        Object.keys(cleanedData).forEach(key => {
            if (cleanedData[key] === '' || cleanedData[key] === null) {
                delete cleanedData[key];
            }
        });
        
        // Convert resolution values to numbers if present
        if (cleanedData.horizontal_resolution) {
            cleanedData.horizontal_resolution = parseInt(cleanedData.horizontal_resolution);
        }
        if (cleanedData.vertical_resolution) {
            cleanedData.vertical_resolution = parseInt(cleanedData.vertical_resolution);
        }
        
        try {
            await onSubmit(cleanedData);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            if (window.confirm('Jums ir nesaglabātas izmaiņas. Vai tiešām vēlaties atcelt?')) {
                onCancel();
            }
        } else {
            onCancel();
        }
    };

    const renderField = (fieldName, label, type = 'text', options = {}) => {
        if (!shouldShowField(fieldName)) {
            return null;
        }

        const isRequired = fieldName === 'title';
        const fieldValue = formData[fieldName] || '';
        const fieldErrors = errors[fieldName] || [];
        const hasError = fieldErrors.length > 0;

        return (
            <div className="form-field" key={fieldName}>
                <label htmlFor={fieldName} className={isRequired ? 'required' : ''}>
                    {label}:
                    {isRequired && <span className="required-asterisk">*</span>}
                </label>
                
                {type === 'textarea' ? (
                    <textarea
                        id={fieldName}
                        name={fieldName}
                        value={fieldValue}
                        onChange={handleInputChange}
                        className={hasError ? 'error' : ''}
                        disabled={isSubmitting}
                        {...options}
                    />
                ) : type === 'select' ? (
                    <select
                        id={fieldName}
                        name={fieldName}
                        value={fieldValue}
                        onChange={handleInputChange}
                        className={hasError ? 'error' : ''}
                        disabled={isSubmitting}
                        {...options}
                    >
                        {options.children}
                    </select>
                ) : (
                    <input
                        type={type}
                        id={fieldName}
                        name={fieldName}
                        value={fieldValue}
                        onChange={handleInputChange}
                        className={hasError ? 'error' : ''}
                        disabled={isSubmitting}
                        {...options}
                    />
                )}
                
                {hasError && (
                    <div className="error-message">
                        {fieldErrors.join(', ')}
                    </div>
                )}
                
                {/* Field hints */}
                {fieldName === 'duration' && (
                    <div className="field-hint">
                        Formāts: HH:MM:SS (piemēram, 01:23:45)
                    </div>
                )}
                {fieldName === 'horizontal_resolution' && (
                    <div className="field-hint">
                        Pikseļos (piemēram, 1920)
                    </div>
                )}
                {fieldName === 'access_restriction' && formData.access_restriction === 'closed' && (
                    <div className="field-hint warning">
                        Slēgtam ierobežojumam ir nepieciešams norādīt ierobežojuma datumu
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="record-form media-record-form">
            {isSubmitting && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            
            <form onSubmit={handleSubmit} noValidate>
                <div className="form-header">
                    <h3>
                        {isEditing ? `${RECORD_UI.EDIT_RECORD} - ` : `${RECORD_UI.CREATE_RECORD} - `}
                        {getMediaTypeName()}
                    </h3>
                    {isDirty && !isSubmitting && (
                        <div className="dirty-indicator">
                            <span className="unsaved-changes">Nesaglabātas izmaiņas</span>
                        </div>
                    )}
                </div>
                
                <div className="form-body">
                    {/* Basic Information Section */}
                    <div className="form-section">
                        <h4 className="section-title">Pamatinformācija</h4>
                        <div className="form-grid">
                            {renderField('title', RECORD_UI.TITLE, 'text', {
                                placeholder: 'Ievadiet ieraksta nosaukumu...',
                                maxLength: RECORD_VALIDATION.MAX_TITLE_LENGTH,
                                autoFocus: !isEditing
                            })}
                            
                            {renderField('date', RECORD_UI.DATE, 'date')}
                            {renderField('created_date', RECORD_UI.CREATED_DATE, 'date')}
                            {renderField('sent_date', RECORD_UI.SENT_DATE, 'date')}
                            
                            {renderField('language', RECORD_UI.LANGUAGE, 'select', {
                                children: RECORD_VALIDATION.LANGUAGES.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))
                            })}
                        </div>
                    </div>

                    {/* Media-Specific Fields Section */}
                    <div className="form-section">
                        <h4 className="section-title">Tehniskā informācija - {getMediaTypeName()}</h4>
                        <div className="form-grid">
                            {/* Duration for video and audio */}
                            {renderField('duration', RECORD_UI.DURATION, 'text', {
                                placeholder: '00:05:30',
                                pattern: RECORD_VALIDATION.DURATION_REGEX.source,
                                maxLength: RECORD_VALIDATION.MAX_DURATION_LENGTH
                            })}
                            
                            {/* Color for photo and video */}
                            {renderField('color', RECORD_UI.COLOR, 'text', {
                                placeholder: 'Krāsains/Melnbalts',
                                maxLength: RECORD_VALIDATION.MAX_COLOR_LENGTH
                            })}
                            
                            {/* Resolution for photo and video */}
                            {renderField('horizontal_resolution', RECORD_UI.HORIZONTAL_RESOLUTION, 'number', {
                                min: 1,
                                max: 99999,
                                placeholder: '1920'
                            })}
                            
                            {renderField('vertical_resolution', RECORD_UI.VERTICAL_RESOLUTION, 'number', {
                                min: 1,
                                max: 99999,
                                placeholder: '1080'
                            })}
                            
                            {/* Format field */}
                            {renderField('format', RECORD_UI.FORMAT, 'text', {
                                placeholder: 'Faila formāts',
                                maxLength: RECORD_VALIDATION.MAX_FORMAT_LENGTH
                            })}
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="form-section">
                        <h4 className="section-title">Apraksts</h4>
                        <div className="form-grid">
                            {renderField('annotation', RECORD_UI.ANNOTATION, 'textarea', {
                                rows: 3,
                                placeholder: 'Ieraksta anotācija...',
                                maxLength: RECORD_VALIDATION.MAX_ANNOTATION_LENGTH
                            })}
                            
                            {renderField('key_words', RECORD_UI.KEY_WORDS, 'text', {
                                placeholder: 'Atslēgvārdi, atdalīti ar komatiem',
                                maxLength: RECORD_VALIDATION.MAX_KEY_WORDS_LENGTH
                            })}
                            
                            {renderField('notes', RECORD_UI.NOTES, 'textarea', {
                                rows: 2,
                                placeholder: 'Papildu piezīmes...',
                                maxLength: RECORD_VALIDATION.MAX_NOTES_LENGTH
                            })}
                        </div>
                    </div>

                    {/* Administrative Information Section */}
                    <div className="form-section">
                        <h4 className="section-title">Administratīvā informācija</h4>
                        <div className="form-grid">
                            {renderField('reg_nr', RECORD_UI.REG_NR, 'text', {
                                placeholder: 'Reģistrācijas numurs',
                                maxLength: RECORD_VALIDATION.MAX_REG_NR_LENGTH
                            })}
                            
                            {renderField('sent_reg_nr', RECORD_UI.SENT_REG_NR, 'text', {
                                placeholder: 'Nosūtīšanas reģ. numurs',
                                maxLength: RECORD_VALIDATION.MAX_SENT_REG_NR_LENGTH
                            })}
                            
                            {renderField('group', RECORD_UI.GROUP, 'text', {
                                placeholder: 'Ieraksta grupa',
                                maxLength: RECORD_VALIDATION.MAX_GROUP_LENGTH
                            })}
                            
                            {renderField('nomenclature_nr', RECORD_UI.NOMENCLATURE_NR, 'text', {
                                placeholder: 'Nomenklatūras numurs',
                                maxLength: RECORD_VALIDATION.MAX_NOMENCLATURE_NR_LENGTH
                            })}
                            
                            {renderField('tech_info', RECORD_UI.TECH_INFO, 'textarea', {
                                rows: 2,
                                placeholder: 'Tehniskā informācija...',
                                maxLength: RECORD_VALIDATION.MAX_TECH_INFO_LENGTH
                            })}
                        </div>
                    </div>

                    {/* Access Restriction Section */}
                    <div className="form-section">
                        <h4 className="section-title">Pieejas ierobežojumi</h4>
                        <div className="form-grid">
                            {renderField('access_restriction', RECORD_UI.ACCESS_RESTRICTION, 'select', {
                                children: (
                                    <>
                                        <option value="open">Atvērts</option>
                                        <option value="closed">Slēgts</option>
                                    </>
                                )
                            })}
                            
                            {formData.access_restriction === 'closed' && (
                                <>
                                    {renderField('access_restriction_date', RECORD_UI.ACCESS_RESTRICTION_DATE, 'date')}
                                    {renderField('access_restriction_notes', RECORD_UI.ACCESS_RESTRICTION_NOTES, 'textarea', {
                                        rows: 2,
                                        placeholder: 'Ierobežojumu piezīmes...',
                                        maxLength: RECORD_VALIDATION.MAX_ACCESS_RESTRICTION_NOTES_LENGTH
                                    })}
                                </>
                            )}
                            
                            {renderField('user_restriction_notes', RECORD_UI.USER_RESTRICTION_NOTES, 'textarea', {
                                rows: 2,
                                placeholder: 'Lietotāja ierobežojumu piezīmes...',
                                maxLength: RECORD_VALIDATION.MAX_USER_RESTRICTION_NOTES_LENGTH
                            })}
                        </div>
                    </div>
                </div>
                
                <div className="form-actions">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="btn btn-primary"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="btn-spinner"></div>
                                Saglabā...
                            </>
                        ) : (
                            isEditing ? RECORD_UI.SAVE_CHANGES : RECORD_UI.SAVE_RECORD
                        )}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleCancel}
                        className="btn btn-secondary"
                        disabled={isSubmitting}
                    >
                        {RECORD_UI.CANCEL}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MediaRecordForm;