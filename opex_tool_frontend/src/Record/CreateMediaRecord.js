// src/Record/CreateMediaRecord.js
// Media Record Creation - Upload files first, then add metadata

import { useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import InheritanceUtils from '../Utils/InheritanceUtils';
import { FieldError } from '../components/ErrorDisplay';
import { useCreateMediaRecord, useUpdateMediaRecord } from '../hooks/useRecords';
import { useFormErrors } from '../hooks/useFormErrors';
import {
  validateMediaRecordCreate,
  validateDuration,
  DURATION_MAX_LENGTH,
  RESOLUTION_MAX_LENGTH,
  getRemainingChars
} from '../Constants/recordConstants';
import { MEDIA_RECORD_UI } from '../Constants/Constants';
import { getEntityIcon } from '../Constants/iconConstants';
import HelpButton from '../Help/HelpButton';
import './CreateMediaRecord.css';

const CreateMediaRecord = ({ onClose, onCreate, item, inventory, projectId }) => {
  const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
  const queryClient = useQueryClient();
  const createMediaRecordMutation = useCreateMediaRecord();
  const updateMediaRecordMutation = useUpdateMediaRecord();
  const { generalError, setGeneralError, setApiErrors, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

  const fileInputRef = useRef(null);

  // Workflow state
  const [currentStep, setCurrentStep] = useState('file-upload');
  const [createdRecordId, setCreatedRecordId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Metadata form state
  const [formData, setFormData] = useState({
    color: '',
    horizontal_resolution: '',
    vertical_resolution: '',
    duration: ''
  });

  // Track which fields were auto-extracted from the uploaded file
  const [autoExtractedFields, setAutoExtractedFields] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get dynamic title based on media type
  const getDialogTitle = () => {
    const mediaType = inheritanceInfo.type;
    return MEDIA_RECORD_UI.TITLES[mediaType] || `Jauns ${mediaType} dokuments`;
  };

  // Get media icon based on type
  const getMediaIcon = () => {
    return `fas ${getEntityIcon(inheritanceInfo.type, true)}`;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    clearErrors(name);

    // Real-time validation for duration
    if (name === 'duration') {
      const mediaType = inheritanceInfo.type;
      const isRequired = mediaType === 'Video' || mediaType === 'Skaņas';
      const durationError = validateDuration(value, isRequired);
      if (durationError) {
        setFieldErrors({ duration: durationError });
      }
    }
  };

  // Open file browser
  const openFileBrowser = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedFiles(files);
    clearErrors('files');
  };

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Only take the first file for media records
    setSelectedFiles([files[0]]);
    clearErrors('files');
  }, [clearErrors]);

  // Remove selected file
  const removeFile = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle 400 error responses for file type validation
  // Backend returns: "File is not an video file.", "File is not an audio file.", "File is not a photo file."
  // Note: Using ApiError structure: error.status, error.data, error.message
  const handleFileTypeError = (error) => {
    // Error message could be in different formats:
    // - error.data = "File is not an audio file." (string directly from ApiError)
    // - error.data.error = "File is not an audio file."
    // - error.message = parsed error message
    const responseData = error.data;
    const errorMessage = typeof responseData === 'string'
      ? responseData
      : (responseData?.error || responseData?.message || error.message || '');

    console.log('Checking file type error, message:', errorMessage);

    // Check for specific file type errors from backend
    if (errorMessage.includes('File is not an video file')) {
      setGeneralError(MEDIA_RECORD_UI.ERROR_NOT_VIDEO);
      return true;
    }
    if (errorMessage.includes('File is not an audio file')) {
      setGeneralError(MEDIA_RECORD_UI.ERROR_NOT_AUDIO);
      return true;
    }
    if (errorMessage.includes('File is not a photo file')) {
      setGeneralError(MEDIA_RECORD_UI.ERROR_NOT_PHOTO);
      return true;
    }

    // Generic file type error
    if (errorMessage.toLowerCase().includes('file is not')) {
      setGeneralError(MEDIA_RECORD_UI.ERROR_FILE_TYPE_UNKNOWN);
      return true;
    }

    return false;
  };

  // Upload files
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      setFieldErrors({ files: MEDIA_RECORD_UI.FILE_REQUIRED_ERROR });
      return;
    }

    setIsSubmitting(true);
    clearErrors();

    try {
      const result = await createMediaRecordMutation.mutateAsync({
        projectId,
        itemId: item.id,
        file: selectedFiles
      });

      setCreatedRecordId(result.id || result.record_id);

      // Check if metadata was auto-extracted
      const mediaType = inheritanceInfo.type;
      const autoExtractionStatus = InheritanceUtils.checkAutoExtractionComplete(result, mediaType);

      console.log('Auto-extraction status:', autoExtractionStatus);

      // If all fields were successfully auto-extracted, skip metadata step
      if (autoExtractionStatus.complete) {
        // Notify parent and close after short delay
        setTimeout(() => {
          if (onCreate) {
            onCreate({ id: result.id || result.record_id });
          }
          onClose();
        }, 500);
      } else {
        // Some fields are missing or failed - proceed to metadata step
        // Pre-fill any auto-extracted values
        const newFormData = { ...formData };

        if (result.color) newFormData.color = result.color;
        if (result.horizontal_resolution) newFormData.horizontal_resolution = result.horizontal_resolution;
        if (result.vertical_resolution) newFormData.vertical_resolution = result.vertical_resolution;
        if (result.duration) newFormData.duration = result.duration;

        setFormData(newFormData);
        setAutoExtractedFields(autoExtractionStatus.populated || []);
        setCurrentStep('metadata');
      }

    } catch (error) {
      console.error('Error uploading media files:', error);
      console.log('Error status:', error.status);
      console.log('Error data:', error.data);
      console.log('Error message:', error.message);

      // Check if this is a 400 error for unrecognized file type
      // Using ApiError structure: error.status (not error.response.status)
      // When backend returns 400 "File is not an X file", the file WAS uploaded
      // and a record WAS created - we need to fetch the record ID from project data
      if (error.status === 400) {
        const isFileTypeError = handleFileTypeError(error);

        if (isFileTypeError) {
          // File type error - the record was created, refetch project data to get record ID
          console.log('File type error detected, refetching project data to get record ID...');

          try {
            // Refetch project data to get the newly created record
            await queryClient.refetchQueries({
              queryKey: ['project', 'detail', projectId],
              exact: true
            });

            // Get the updated data from cache
            const projectData = queryClient.getQueryData(['project', 'detail', projectId]);
            console.log('Project data after refetch:', projectData);

            // Find the item in the project data
            let recordId = null;
            const inventories = projectData?.institution?.fond?.inventories || [];

            for (const inv of inventories) {
              const foundItem = inv.items?.find(i => i.id === item.id);
              if (foundItem) {
                // Get the record ID based on media type
                const mediaType = inheritanceInfo.type;
                let mediaRecords = [];

                if (mediaType === 'Foto') {
                  mediaRecords = foundItem.photo_records || [];
                } else if (mediaType === 'Video') {
                  mediaRecords = foundItem.video_records || [];
                } else if (mediaType === 'Skaņas') {
                  mediaRecords = foundItem.audio_records || [];
                }

                console.log('Media type:', mediaType, 'Records found:', mediaRecords);

                // Get the most recently created record (last in array)
                if (mediaRecords.length > 0) {
                  recordId = mediaRecords[mediaRecords.length - 1].id;
                  console.log('Found record ID from project data:', recordId);
                }
                break;
              }
            }

            if (recordId) {
              // Record found, proceed to metadata step
              console.log('Proceeding to metadata step with record ID:', recordId);
              setCreatedRecordId(recordId);
              setCurrentStep('metadata');
            } else {
              console.error('Could not find record ID in project data');
              setGeneralError(MEDIA_RECORD_UI.ERROR_RECORD_ID_MISSING);
            }
          } catch (fetchError) {
            console.error('Error refetching project data:', fetchError);
            setGeneralError(MEDIA_RECORD_UI.ERROR_RECORD_ID_MISSING);
          }
        } else {
          // Other 400 error (not file type related)
          setGeneralError(error.message || MEDIA_RECORD_UI.FILE_UPLOAD_ERROR);
        }
      } else {
        setGeneralError(error.message || MEDIA_RECORD_UI.FILE_UPLOAD_ERROR);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Save metadata (either update existing record or create new with file + metadata)
  const handleMetadataSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    // Get the record type based on inventory type
    // Map Latvian type names to English record types for validation
    const mediaType = inheritanceInfo.type;
    let recordType;
    switch (mediaType) {
      case 'Foto':
        recordType = 'photo';
        break;
      case 'Video':
        recordType = 'video';
        break;
      case 'Skaņas':
        recordType = 'audio';
        break;
      default:
        recordType = null;
    }

    const validationData = {
      color: formData.color,
      horizontal_resolution: formData.horizontal_resolution ? parseInt(formData.horizontal_resolution) : null,
      vertical_resolution: formData.vertical_resolution ? parseInt(formData.vertical_resolution) : null,
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
      const mediaType = inheritanceInfo.type;

      // Prepare media-specific data (same format as EditMediaRecordMetadata)
      const mediaData = {
        color: formData.color || '',
        horizontal_resolution: formData.horizontal_resolution ?
          parseInt(formData.horizontal_resolution) : null,
        vertical_resolution: formData.vertical_resolution ?
          parseInt(formData.vertical_resolution) : null
      };

      // Add duration for Audio/Video types
      if (mediaType === 'Skaņas' || mediaType === 'Video') {
        mediaData.duration = formData.duration || '';
      }

      // We should always have a record ID at this point
      // (either from successful upload or from 400 response)
      if (!createdRecordId) {
        setGeneralError(MEDIA_RECORD_UI.ERROR_RECORD_ID_MISSING);
        return;
      }

      // Update existing record with metadata via PUT (same as EditMediaRecordMetadata)
      await updateMediaRecordMutation.mutateAsync({
        projectId,
        recordId: createdRecordId,
        recordData: mediaData,
        recordType: mediaType
      });

      if (onCreate) {
        onCreate({ id: createdRecordId });
      }

      setTimeout(() => {
        onClose();
      }, 300);

    } catch (error) {
      console.error('Error saving media metadata:', error);
      // Using ApiError structure: error.data (not error.response.data)
      if (error.data?.errors) {
        setApiErrors(error.data.errors);
      } else {
        setGeneralError(error.message || MEDIA_RECORD_UI.METADATA_SAVE_ERROR);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to check if a field was auto-extracted
  const isAutoExtracted = (fieldName) => autoExtractedFields.includes(fieldName);

  // Render file upload step
  const renderFileUpload = () => (
    <div className="media-record-upload-section">
      <input
        ref={fileInputRef}
        type="file"
        accept={inheritanceInfo.constraints?.acceptAttribute || '*/*'}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div
        className={`media-record-dropzone ${isDragOver ? 'drag-over' : ''}`}
        onClick={openFileBrowser}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="media-record-dropzone-icon">
          <i className={getMediaIcon()}></i>
        </div>
        <div className="media-record-dropzone-text">
          {MEDIA_RECORD_UI.FILE_DROP_TEXT}
        </div>
        <div className="media-record-dropzone-or">
          {MEDIA_RECORD_UI.FILE_DROP_OR}
        </div>
        <button
          type="button"
          className="media-record-select-btn"
          onClick={(e) => {
            e.stopPropagation();
            openFileBrowser();
          }}
        >
          {MEDIA_RECORD_UI.FILE_SELECT_BTN}
        </button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="media-record-selected-file">
          <div className="media-record-file-info">
            <i className={`media-record-file-icon ${getMediaIcon()}`}></i>
            <div className="media-record-file-details">
              <div className="media-record-file-name">{selectedFiles[0].name}</div>
              <div className="media-record-file-size">
                {(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="media-record-file-remove"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>
      )}

      <FieldError error={getFieldError('files')} />
    </div>
  );

  // Render metadata form
  const renderMetadata = () => {
    const mediaType = inheritanceInfo.type;

    return (
      <div className="media-record-metadata-container">
        {autoExtractedFields.length > 0 && (
          <div className="media-record-auto-info">
            <div className="media-record-auto-info-title">
              ℹ️ {MEDIA_RECORD_UI.METADATA_AUTO_INFO}
            </div>
            <div className="media-record-auto-info-text">
              {MEDIA_RECORD_UI.METADATA_AUTO_WARNING}
            </div>
          </div>
        )}

        <div className="media-record-metadata-form">
          {/* Color field - for Foto and Video */}
          {(mediaType === 'Foto' || mediaType === 'Video') && (
            <div className="media-record-field-group">
              <label className="media-record-field-label">
                {MEDIA_RECORD_UI.FIELD_COLOR}
                {isAutoExtracted('color') && (
                  <span className="media-record-auto-badge">
                    {MEDIA_RECORD_UI.FIELD_AUTO_BADGE}
                  </span>
                )}
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className={`media-record-field-select ${getFieldError('color') ? 'error' : ''}`}
              >
                <option value="">{MEDIA_RECORD_UI.FIELD_COLOR_PLACEHOLDER}</option>
                <option value="grayscale">{MEDIA_RECORD_UI.FIELD_COLOR_GRAYSCALE}</option>
                <option value="color">{MEDIA_RECORD_UI.FIELD_COLOR_COLOR}</option>
              </select>
              <FieldError error={getFieldError('color')} />
            </div>
          )}

          {/* Resolution fields - for Foto and Video */}
          {(mediaType === 'Foto' || mediaType === 'Video') && (
            <>
              <div className="media-record-field-group">
                <label className="media-record-field-label">
                  {MEDIA_RECORD_UI.FIELD_HORIZONTAL_RESOLUTION}
                  {isAutoExtracted('horizontal_resolution') && (
                    <span className="media-record-auto-badge">
                      {MEDIA_RECORD_UI.FIELD_AUTO_BADGE}
                    </span>
                  )}
                  {getRemainingChars(formData.horizontal_resolution?.toString() || '', RESOLUTION_MAX_LENGTH) < 5 && (
                    <span className="media-record-char-warning">
                      ({getRemainingChars(formData.horizontal_resolution?.toString() || '', RESOLUTION_MAX_LENGTH)} {MEDIA_RECORD_UI.FIELD_REMAINING_CHARS})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="horizontal_resolution"
                  value={formData.horizontal_resolution}
                  onChange={handleInputChange}
                  className={`media-record-field-input ${getFieldError('horizontal_resolution') ? 'error' : ''}`}
                  placeholder={MEDIA_RECORD_UI.FIELD_RESOLUTION_PLACEHOLDER_H}
                />
                <FieldError error={getFieldError('horizontal_resolution')} />
              </div>

              <div className="media-record-field-group">
                <label className="media-record-field-label">
                  {MEDIA_RECORD_UI.FIELD_VERTICAL_RESOLUTION}
                  {isAutoExtracted('vertical_resolution') && (
                    <span className="media-record-auto-badge">
                      {MEDIA_RECORD_UI.FIELD_AUTO_BADGE}
                    </span>
                  )}
                  {getRemainingChars(formData.vertical_resolution?.toString() || '', RESOLUTION_MAX_LENGTH) < 5 && (
                    <span className="media-record-char-warning">
                      ({getRemainingChars(formData.vertical_resolution?.toString() || '', RESOLUTION_MAX_LENGTH)} {MEDIA_RECORD_UI.FIELD_REMAINING_CHARS})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="vertical_resolution"
                  value={formData.vertical_resolution}
                  onChange={handleInputChange}
                  className={`media-record-field-input ${getFieldError('vertical_resolution') ? 'error' : ''}`}
                  placeholder={MEDIA_RECORD_UI.FIELD_RESOLUTION_PLACEHOLDER_V}
                />
                <FieldError error={getFieldError('vertical_resolution')} />
              </div>
            </>
          )}

          {/* Duration - for Video, Audio, and Skaņas */}
          {(mediaType === 'Video' || mediaType === 'Audio' || mediaType === 'Skaņas') && (
            <div className="media-record-field-group">
              <label className="media-record-field-label">
                {MEDIA_RECORD_UI.FIELD_DURATION}
                {isAutoExtracted('duration') && (
                  <span className="media-record-auto-badge">
                    {MEDIA_RECORD_UI.FIELD_AUTO_BADGE}
                  </span>
                )}
                {getRemainingChars(formData.duration, DURATION_MAX_LENGTH) < 5 && (
                  <span className="media-record-char-warning">
                    ({getRemainingChars(formData.duration, DURATION_MAX_LENGTH)} {MEDIA_RECORD_UI.FIELD_REMAINING_CHARS})
                  </span>
                )}
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className={`media-record-field-input duration ${getFieldError('duration') ? 'error' : ''}`}
                placeholder={MEDIA_RECORD_UI.FIELD_DURATION_PLACEHOLDER}
                maxLength={DURATION_MAX_LENGTH}
              />
              <span className="media-record-field-hint">{MEDIA_RECORD_UI.FIELD_DURATION_HINT}</span>
              <FieldError error={getFieldError('duration')} />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main render
  return ReactDOM.createPortal(
    <div className="media-record-modal-backdrop" onClick={onClose}>
      <div className="media-record-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="media-record-modal-header">
          <h2 className="media-record-modal-title">
            {getDialogTitle()}
          </h2>
          <div className="media-record-modal-help">
            <HelpButton chapterId="records" iconOnly={true} className="small" />
          </div>
        </div>

        {/* Progress indicator */}
        <div className="media-record-progress">
          <div className={`media-record-progress-step ${currentStep === 'file-upload' ? 'active' : 'completed'}`}>
            <span className="media-record-step-number">1</span>
            <span className="media-record-step-label">{MEDIA_RECORD_UI.STEP_FILE_UPLOAD}</span>
          </div>
          <div className="media-record-progress-connector"></div>
          <div className={`media-record-progress-step ${currentStep === 'metadata' ? 'active' : ''}`}>
            <span className="media-record-step-number">2</span>
            <span className="media-record-step-label">{MEDIA_RECORD_UI.STEP_METADATA}</span>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleMetadataSubmit}>
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

            {currentStep === 'file-upload' ? renderFileUpload() : renderMetadata()}
          </div>

          {/* Footer - Action Bar */}
          <div className="media-record-modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="media-record-btn-cancel"
            >
              {MEDIA_RECORD_UI.BTN_CANCEL}
            </button>

            {currentStep === 'file-upload' ? (
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={isSubmitting || selectedFiles.length === 0}
                className="media-record-btn-submit"
              >
                {isSubmitting ? MEDIA_RECORD_UI.BTN_UPLOADING : MEDIA_RECORD_UI.BTN_UPLOAD}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="media-record-btn-submit"
              >
                {isSubmitting ? MEDIA_RECORD_UI.BTN_SAVING : MEDIA_RECORD_UI.BTN_SAVE_METADATA}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateMediaRecord;
