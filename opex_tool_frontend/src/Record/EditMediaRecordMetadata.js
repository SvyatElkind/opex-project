// src/Record/EditMediaRecordMetadata.js
// Component for adding/editing metadata to existing media records

import React, { useState } from "react";
import ReactDOM from "react-dom";
import InheritanceUtils from '../Utils/InheritanceUtils';
import { GeneralAlert, FieldError } from '../components/ErrorDisplay';
import { useUpdateMediaRecord } from '../hooks/useRecords';
import { useFormErrors } from '../hooks/useFormErrors';
import {
  validateMediaRecordCreate,
  validateDuration,
  getRecordTypeForItem,
  COLOR_MAX_LENGTH,
  DURATION_MAX_LENGTH,
  RESOLUTION_MAX_LENGTH,
  getRemainingChars
} from '../Constants/recordConstants';
import './CreateRecord.css';

const EditMediaRecordMetadata = ({ onClose, onUpdate, record, inventory, projectId }) => {
    console.log('EditMediaRecordMetadata rendered');
    console.log('Props:', { record, inventory, projectId });

    const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
    const updateMediaRecordMutation = useUpdateMediaRecord();
    const { generalError, setGeneralError, setApiErrors, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    // Parse auto-extracted fields from record
    const autoExtractedFields = InheritanceUtils.parseAutoFields(record.auto_fields || '');
    const hasAutoFields = autoExtractedFields.length > 0;

    // Helper to check if a field was auto-extracted
    const isAutoExtracted = (fieldName) => autoExtractedFields.includes(fieldName);

    // Initialize form with existing record data
    const [formData, setFormData] = useState({
        color: record.color || '',
        horizontal_resolution: record.horizontal_resolution || '',
        vertical_resolution: record.vertical_resolution || '',
        duration: record.duration || ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field when user starts typing
        clearErrors(name);

        // Real-time validation for duration
        if (name === 'duration') {
            const recordType = getRecordTypeForItem({ inventory });
            const isRequired = recordType === 'video' || recordType === 'audio';
            const durationError = validateDuration(value, isRequired);
            if (durationError) {
                setFieldErrors({ duration: durationError });
            }
        }
    };
    
    const handleSubmit = async () => {
        clearErrors();

        // Client-side validation
        const recordType = getRecordTypeForItem({ inventory });

        const validationData = {
            color: formData.color,
            horizontal_resolution: formData.horizontal_resolution ? parseInt(formData.horizontal_resolution) : null,
            vertical_resolution: formData.vertical_resolution ? parseInt(formData.vertical_resolution) : null,
            duration: formData.duration
        };

        const validation = validateMediaRecordCreate(validationData, recordType);

        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            setGeneralError('Lūdzu, labojiet kļūdas formā');
            return;
        }

        setIsSubmitting(true);
        setStatusMessage({ type: 'info', text: 'Saglabā metadatus...' });

        try {
            // Prepare media-specific data
            const mediaData = {
                color: formData.color || '',
                horizontal_resolution: formData.horizontal_resolution ?
                    parseInt(formData.horizontal_resolution) : null,
                vertical_resolution: formData.vertical_resolution ?
                    parseInt(formData.vertical_resolution) : null
            };

            // Add duration for Audio/Video types
            if (inheritanceInfo.type === 'Skaņas' || inheritanceInfo.type === 'Video') {
                mediaData.duration = formData.duration || '';
            }

            await updateMediaRecordMutation.mutateAsync({
                projectId,
                recordId: record.id,
                recordData: mediaData,  // ✅ FIXED: recordData not data
                recordType: inheritanceInfo.type  // ✅ FIXED: recordType not type
            });

            setStatusMessage({ type: 'success', text: 'Metadati veiksmīgi saglabāti!' });

            setTimeout(() => {
                if (onUpdate) onUpdate();
                onClose();
            }, 1000);

        } catch (error) {
            console.error('Metadata update failed:', error);
            if (error.response?.data?.errors) {
                setApiErrors(error.response.data.errors);
            } else {
                setGeneralError(error.message || 'Metadatu saglabāšana neizdevās');
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderField = (name, label, type = 'text', maxLength = null) => {
        const value = formData[name] || '';

        return (
            <div className="form-group">
                <label htmlFor={`edit-${name}`} className="form-label">
                    {label}
                    {isAutoExtracted(name) && (
                        <span className="badge badge-success" style={{ marginLeft: '8px' }}>
                            ✓
                        </span>
                    )}
                    {maxLength && getRemainingChars(value.toString(), maxLength) < 5 && (
                        <span className="char-counter-warning">
                            ({getRemainingChars(value.toString(), maxLength)} atlikušie)
                        </span>
                    )}
                </label>
                <input
                    type={type}
                    id={`edit-${name}`}
                    name={name}
                    value={value}
                    onChange={handleInputChange}
                    className={`form-input ${getFieldError(name) ? 'error' : ''}`}
                    disabled={isSubmitting}
                    maxLength={maxLength}
                />
                <FieldError error={getFieldError(name)} />
            </div>
        );
    };
    
    // Get simple icon based on media type
    const getMediaIcon = () => {
        switch(inheritanceInfo.type) {
            case 'Foto':
                return 'fas fa-image';
            case 'Video':
                return 'fas fa-video';
            case 'Skaņas':
                return 'fas fa-music';
            default:
                return 'fas fa-file';
        }
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && !isSubmitting && onClose()}>
            <div className="modal-container modal-container-large" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        <i className={getMediaIcon()} style={{ marginRight: '8px' }}></i>
                        Rediģēt {inheritanceInfo.displayName} metadatus
                    </h2>
                </div>
                
                {/* General Error Message */}
                {generalError && (
                    <GeneralAlert
                        message={generalError}
                        type="error"
                        onClose={() => setGeneralError('')}
                    />
                )}

                {/* Status message */}
                {statusMessage.text && (
                    <GeneralAlert
                        message={statusMessage.text}
                        type={statusMessage.type === 'info' ? 'warning' : statusMessage.type}
                        onClose={() => setStatusMessage({ type: '', text: '' })}
                    />
                )}

                {/* Content */}
                <div className="modal-body">
                    <div className="form-content">
                        <section className="form-section">
                            {hasAutoFields && (
                                <div className="alert alert-warning">
                                    <div className="alert-icon">⚠</div>
                                    <div className="alert-content">
                                        <strong className="alert-title">Brīdinājums par automātiski nolasītajiem metadatiem</strong>
                                        <p className="alert-message">
                                            Daži šī ieraksta metadati tika automātiski nolasīti no faila.
                                            Jūs varat tos rediģēt, bet tas <strong>nav ieteicams</strong>, jo tie tika iegūti
                                            tieši no faila metadatiem un precīzi atspoguļo faila tehniskās īpašības.
                                        </p>
                                        <small className="alert-hint">Automātiski nolasītie lauki ir atzīmēti ar "✓" marķējumu.</small>
                                    </div>
                                </div>
                            )}

                            <div className="form-grid">
                                {/* Color field - only for Foto and Video, NOT for Audio */}
                                {(inheritanceInfo.type === 'Foto' || inheritanceInfo.type === 'Video') && (
                                    <div className="form-group">
                                        <label htmlFor="edit-color" className="form-label">
                                            Krāsa
                                            {isAutoExtracted('color') && (
                                                <span className="badge badge-success" style={{ marginLeft: '8px' }}>
                                                    ✓
                                                </span>
                                            )}
                                        </label>
                                        <select
                                            id="edit-color"
                                            name="color"
                                            value={formData.color || ''}
                                            onChange={handleInputChange}
                                            className={`form-input ${getFieldError('color') ? 'error' : ''}`}
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Izvēlieties...</option>
                                            <option value="grayscale">Melnbalta</option>
                                            <option value="color">Krāsaina</option>
                                        </select>
                                        <FieldError error={getFieldError('color')} />
                                    </div>
                                )}

                                {/* Resolution fields - only for Foto and Video, NOT for Audio */}
                                {inheritanceInfo.type !== 'Skaņas' && (
                                    <>
                                        {renderField('horizontal_resolution', 'Horizontālā izšķirtspēja', 'number', RESOLUTION_MAX_LENGTH)}
                                        {renderField('vertical_resolution', 'Vertikālā izšķirtspēja', 'number', RESOLUTION_MAX_LENGTH)}
                                    </>
                                )}

                                {/* Duration field - only for Audio and Video, NOT for Foto */}
                                {(inheritanceInfo.type === 'Skaņas' || inheritanceInfo.type === 'Video') && (
                                    <div className="form-group">
                                        <label htmlFor="edit-duration" className="form-label">
                                            Ilgums
                                            {isAutoExtracted('duration') && (
                                                <span className="badge badge-success" style={{ marginLeft: '8px' }}>
                                                    ✓
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            id="edit-duration"
                                            name="duration"
                                            value={formData.duration || ''}
                                            onChange={handleInputChange}
                                            className={`form-input ${getFieldError('duration') ? 'error' : ''}`}
                                            disabled={isSubmitting}
                                            placeholder="piem., 00:05:30 vai 12343:54:01"
                                            style={{ fontSize: '16px', fontFamily: 'monospace' }}
                                        />
                                        <span className="field-hint">Formāts: HH:MM:SS (stundas var būt lielākas par 24)</span>
                                        <FieldError error={getFieldError('duration')} />
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Actions */}
                <div className="modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={isSubmitting}
                    >
                        Atcelt
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="btn-action"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saglabā...' : 'Saglabāt'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EditMediaRecordMetadata;