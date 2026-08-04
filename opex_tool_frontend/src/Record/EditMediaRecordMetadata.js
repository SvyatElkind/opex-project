import { useState } from "react";
import ReactDOM from "react-dom";
import InheritanceUtils from '../Utils/InheritanceUtils';
import { FieldError } from '../components/ErrorDisplay';
import { useUpdateMediaRecord } from '../hooks/useRecords';
import { useFormErrors } from '../hooks/useFormErrors';
import {
  validateMediaRecordCreate,
  validateDuration,
  getRecordTypeForItem,
  DURATION_MAX_LENGTH,
  RESOLUTION_MAX_LENGTH,
  getRemainingChars
} from '../Constants/recordConstants';
import { MEDIA_RECORD_UI } from '../Constants/Constants';
import HelpButton from '../Help/HelpButton';
import FieldHelp from '../components/FieldHelp';
import './CreateMediaRecord.css';

const EditMediaRecordMetadata = ({ onClose, onUpdate, record, inventory, projectId }) => {
    const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
    const updateMediaRecordMutation = useUpdateMediaRecord();
    const { generalError, setGeneralError, setApiErrors, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

    // Check which fields have values (were auto-populated by backend)
    const isAutoExtracted = (fieldName) => InheritanceUtils.isFieldAutoExtracted(fieldName, record);
    const expectedFields = InheritanceUtils.getExpectedAutoFields(inheritanceInfo.type);
    const hasAutoFields = expectedFields.some(field => isAutoExtracted(field));

    // Initialize form with existing record data
    const [formData, setFormData] = useState({
        color: record.color || '',
        horizontal_resolution: record.horizontal_resolution || '',
        vertical_resolution: record.vertical_resolution || '',
        duration: record.duration || ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get dynamic title based on media type
    const getDialogTitle = () => {
        const mediaType = inheritanceInfo.type;
        return MEDIA_RECORD_UI.EDIT_TITLES[mediaType] || `Labot ${mediaType} metadatus`;
    };

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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        clearErrors();

        // Client-side validation
        const recordType = getRecordTypeForItem({ inventory });

        const validationData = {
            color: formData.color,
            horizontal_resolution: formData.horizontal_resolution ? parseInt(formData.horizontal_resolution, 10) : null,
            vertical_resolution: formData.vertical_resolution ? parseInt(formData.vertical_resolution, 10) : null,
            duration: formData.duration
        };

        const validation = validateMediaRecordCreate(validationData, recordType);

        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            setGeneralError(MEDIA_RECORD_UI.ERROR_FORM_INVALID);
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare media-specific data
            const mediaData = {
                color: formData.color || '',
                horizontal_resolution: formData.horizontal_resolution ?
                    parseInt(formData.horizontal_resolution, 10) : null,
                vertical_resolution: formData.vertical_resolution ?
                    parseInt(formData.vertical_resolution, 10) : null
            };

            // Add duration for Audio/Video types
            if (inheritanceInfo.type === 'Skaņas' || inheritanceInfo.type === 'Video') {
                mediaData.duration = formData.duration || '';
            }

            await updateMediaRecordMutation.mutateAsync({
                projectId,
                recordId: record.id,
                recordData: mediaData,
                recordType: inheritanceInfo.type
            });

            setTimeout(() => {
                if (onUpdate) onUpdate();
                onClose();
            }, 300);

        } catch (error) {
            if (error.data?.errors) {
                setApiErrors(error.data.errors);
            } else {
                setGeneralError(error.message || MEDIA_RECORD_UI.METADATA_SAVE_ERROR);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div
            className="media-record-modal-backdrop"
            onClick={(e) => e.target.className === 'media-record-modal-backdrop' && !isSubmitting && onClose()}
        >
            <div className="media-record-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="media-record-modal-header">
                    <h2 className="media-record-modal-title">
                        {getDialogTitle()}
                    </h2>
                    <div className="media-record-modal-help">
                        <HelpButton chapterId="records" sectionId="create-record" iconOnly={true} className="small" />
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="media-record-modal-body">
                        {/* Error Display */}
                        {generalError && (
                            <div className="media-record-error-banner">
                                <i className="media-record-error-icon fas fa-exclamation-circle"></i>
                                <span className="media-record-error-text">{generalError}</span>
                                <button
                                    type="button"
                                    className="media-record-error-close"
                                    onClick={() => setGeneralError('')}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* Auto-extracted fields warning */}
                        {hasAutoFields && (
                            <div className="media-record-auto-warning">
                                <div className="media-record-auto-warning-title">
                                    <span className="media-record-auto-warning-icon">⚠</span>
                                    {MEDIA_RECORD_UI.EDIT_AUTO_WARNING_TITLE}
                                </div>
                                <div className="media-record-auto-warning-text">
                                    {MEDIA_RECORD_UI.EDIT_AUTO_WARNING_TEXT}
                                    {' '}
                                    Jūs varat tos rediģēt, bet tas <strong>{MEDIA_RECORD_UI.EDIT_AUTO_WARNING_STRONG}</strong>
                                    {MEDIA_RECORD_UI.EDIT_AUTO_WARNING_REASON}
                                </div>
                                <div className="media-record-auto-warning-hint">
                                    {MEDIA_RECORD_UI.EDIT_AUTO_HINT}
                                </div>
                            </div>
                        )}

                        {/* Metadata Form - Vertical Centered Layout */}
                        <div className="media-record-metadata-container">
                            <div className="media-record-metadata-form">
                                {/* Color field - only for Foto and Video */}
                                {(inheritanceInfo.type === 'Foto' || inheritanceInfo.type === 'Video') && (
                                    <div className="media-record-field-group">
                                        <label className="media-record-field-label">
                                            {MEDIA_RECORD_UI.FIELD_COLOR}
                                            <FieldHelp entity="mediaRecord" field="color" />
                                            {isAutoExtracted('color') && (
                                                <span className="media-record-auto-badge">
                                                    {MEDIA_RECORD_UI.FIELD_AUTO_BADGE}
                                                </span>
                                            )}
                                        </label>
                                        <select
                                            name="color"
                                            value={formData.color || ''}
                                            onChange={handleInputChange}
                                            className={`media-record-field-select ${getFieldError('color') ? 'error' : ''}`}
                                            disabled={isSubmitting}
                                        >
                                            <option value="">{MEDIA_RECORD_UI.FIELD_COLOR_PLACEHOLDER}</option>
                                            <option value="grayscale">{MEDIA_RECORD_UI.FIELD_COLOR_GRAYSCALE}</option>
                                            <option value="color">{MEDIA_RECORD_UI.FIELD_COLOR_COLOR}</option>
                                        </select>
                                        <FieldError error={getFieldError('color')} />
                                    </div>
                                )}

                                {/* Resolution fields - only for Foto and Video */}
                                {inheritanceInfo.type !== 'Skaņas' && (
                                    <>
                                        <div className="media-record-field-group">
                                            <label className="media-record-field-label">
                                                {MEDIA_RECORD_UI.FIELD_HORIZONTAL_RESOLUTION}
                                                <FieldHelp entity="mediaRecord" field="horizontal_resolution" />
                                                {isAutoExtracted('horizontal_resolution') && (
                                                    <span className="media-record-auto-badge">
                                                        {MEDIA_RECORD_UI.FIELD_AUTO_BADGE}
                                                    </span>
                                                )}
                                                {getRemainingChars((formData.horizontal_resolution || '').toString(), RESOLUTION_MAX_LENGTH) < 5 && (
                                                    <span className="media-record-char-warning">
                                                        ({getRemainingChars((formData.horizontal_resolution || '').toString(), RESOLUTION_MAX_LENGTH)} {MEDIA_RECORD_UI.FIELD_REMAINING_CHARS})
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="number"
                                                name="horizontal_resolution"
                                                value={formData.horizontal_resolution || ''}
                                                onChange={handleInputChange}
                                                className={`media-record-field-input ${getFieldError('horizontal_resolution') ? 'error' : ''}`}
                                                placeholder={MEDIA_RECORD_UI.FIELD_RESOLUTION_PLACEHOLDER_H}
                                                disabled={isSubmitting}
                                            />
                                            <FieldError error={getFieldError('horizontal_resolution')} />
                                        </div>

                                        <div className="media-record-field-group">
                                            <label className="media-record-field-label">
                                                {MEDIA_RECORD_UI.FIELD_VERTICAL_RESOLUTION}
                                                <FieldHelp entity="mediaRecord" field="vertical_resolution" />
                                                {isAutoExtracted('vertical_resolution') && (
                                                    <span className="media-record-auto-badge">
                                                        {MEDIA_RECORD_UI.FIELD_AUTO_BADGE}
                                                    </span>
                                                )}
                                                {getRemainingChars((formData.vertical_resolution || '').toString(), RESOLUTION_MAX_LENGTH) < 5 && (
                                                    <span className="media-record-char-warning">
                                                        ({getRemainingChars((formData.vertical_resolution || '').toString(), RESOLUTION_MAX_LENGTH)} {MEDIA_RECORD_UI.FIELD_REMAINING_CHARS})
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="number"
                                                name="vertical_resolution"
                                                value={formData.vertical_resolution || ''}
                                                onChange={handleInputChange}
                                                className={`media-record-field-input ${getFieldError('vertical_resolution') ? 'error' : ''}`}
                                                placeholder={MEDIA_RECORD_UI.FIELD_RESOLUTION_PLACEHOLDER_V}
                                                disabled={isSubmitting}
                                            />
                                            <FieldError error={getFieldError('vertical_resolution')} />
                                        </div>
                                    </>
                                )}

                                {/* Duration field - only for Audio and Video */}
                                {(inheritanceInfo.type === 'Skaņas' || inheritanceInfo.type === 'Video') && (
                                    <div className="media-record-field-group">
                                        <label className="media-record-field-label">
                                            {MEDIA_RECORD_UI.FIELD_DURATION}
                                            <FieldHelp entity="mediaRecord" field="duration" />
                                            {isAutoExtracted('duration') && (
                                                <span className="media-record-auto-badge">
                                                    {MEDIA_RECORD_UI.FIELD_AUTO_BADGE}
                                                </span>
                                            )}
                                            {getRemainingChars(formData.duration || '', DURATION_MAX_LENGTH) < 5 && (
                                                <span className="media-record-char-warning">
                                                    ({getRemainingChars(formData.duration || '', DURATION_MAX_LENGTH)} {MEDIA_RECORD_UI.FIELD_REMAINING_CHARS})
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            name="duration"
                                            value={formData.duration || ''}
                                            onChange={handleInputChange}
                                            className={`media-record-field-input duration ${getFieldError('duration') ? 'error' : ''}`}
                                            disabled={isSubmitting}
                                            placeholder={MEDIA_RECORD_UI.FIELD_DURATION_PLACEHOLDER}
                                            maxLength={DURATION_MAX_LENGTH}
                                        />
                                        <span className="media-record-field-hint">{MEDIA_RECORD_UI.FIELD_DURATION_HINT_EXTENDED}</span>
                                        <FieldError error={getFieldError('duration')} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer - Action Bar */}
                    <div className="media-record-modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="media-record-btn-cancel"
                            disabled={isSubmitting}
                        >
                            {MEDIA_RECORD_UI.BTN_CANCEL}
                        </button>
                        <button
                            type="submit"
                            className="media-record-btn-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? MEDIA_RECORD_UI.BTN_SAVING : MEDIA_RECORD_UI.BTN_SAVE}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default EditMediaRecordMetadata;
