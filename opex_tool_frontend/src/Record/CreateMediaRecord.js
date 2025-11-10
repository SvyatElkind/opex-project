// src/Record/CreateMediaRecord.js
// Media Record Creation - Upload files first, then add metadata - FIXED

import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import InheritanceUtils from '../Utils/InheritanceUtils';
import { useCreateMediaRecord, useUpdateMediaRecord } from '../hooks/useRecords';

const CreateMediaRecord = ({ onClose, onCreate, item, inventory, projectId }) => {
  const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
  const createMediaRecordMutation = useCreateMediaRecord();
  const updateMediaRecordMutation = useUpdateMediaRecord();
  
  const fileInputRef = useRef(null);
  
  // Workflow state
  const [currentStep, setCurrentStep] = useState('file-upload');
  const [createdRecordId, setCreatedRecordId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Metadata form state
  const [formData, setFormData] = useState({
    color: '',
    horizontal_resolution: '',
    vertical_resolution: '',
    duration: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
    setStatusMessage({ 
      type: 'info', 
      text: `${files.length} ${files.length === 1 ? 'fails izvēlēts' : 'faili izvēlēti'}` 
    });
    
    if (errors.files) {
      setErrors(prev => ({ ...prev, files: '' }));
    }
  };
  
  // Remove selected file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    if (selectedFiles.length === 1) {
      setStatusMessage({ type: '', text: '' });
    }
  };
  
  // ✅ FIXED: Upload files - corrected parameter name from 'files' to 'file'
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      setErrors({ files: 'Lūdzu, izvēlieties vismaz vienu failu' });
      setStatusMessage({ 
        type: 'error', 
        text: 'Lūdzu, izvēlieties vismaz vienu failu' 
      });
      return;
    }
    
    setIsSubmitting(true);
    setStatusMessage({ type: 'info', text: 'Augšupielādē failus...' });
    
    try {
      // ✅ FIXED: Pass selectedFiles directly (API handles FormData internally)
      // The hook expects 'file' (singular) parameter
      const result = await createMediaRecordMutation.mutateAsync({
        projectId,
        itemId: item.id,
        file: selectedFiles  // ✅ Changed from 'files' to 'file'
      });
      
      setCreatedRecordId(result.id || result.record_id);
      setCurrentStep('metadata');
      setStatusMessage({ 
        type: 'success', 
        text: 'Faili veiksmīgi augšupielādēti! Tagad pievienojiet metadatus.' 
      });
      
    } catch (error) {
      console.error('Error uploading media files:', error);
      setStatusMessage({ 
        type: 'error', 
        text: error.message || 'Kļūda augšupielādējot failus' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Step 2: Update metadata
  const handleMetadataSubmit = async (e) => {
    e.preventDefault();
    
    if (!createdRecordId) {
      setStatusMessage({ 
        type: 'error', 
        text: 'Kļūda: ieraksta ID nav atrasts' 
      });
      return;
    }
    
    setIsSubmitting(true);
    setStatusMessage({ type: 'info', text: 'Saglabā metadatus...' });
    
    try {
      const mediaType = inheritanceInfo.type;
      const mediaData = {};
      
      // Common fields
      if (formData.color) {
        mediaData.color = formData.color;
      }
      
      // Resolution for Foto and Video
      if (mediaType === 'Foto' || mediaType === 'Video') {
        if (formData.horizontal_resolution) {
          mediaData.horizontal_resolution = parseInt(formData.horizontal_resolution);
        }
        if (formData.vertical_resolution) {
          mediaData.vertical_resolution = parseInt(formData.vertical_resolution);
        }
      }
      
      // Duration for Video and Audio
      if (mediaType === 'Video' || mediaType === 'Audio' || mediaType === 'Skaņas') {
        if (formData.duration) {
          mediaData.duration = formData.duration;
        }
      }
      
      await updateMediaRecordMutation.mutateAsync({
        projectId,
        recordId: createdRecordId,
        recordData: mediaData,
        recordType: mediaType
      });
      
      setStatusMessage({ type: 'success', text: 'Metadati veiksmīgi saglabāti!' });
      
      if (onCreate) {
        onCreate({ id: createdRecordId });
      }
      
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating media metadata:', error);
      setStatusMessage({ 
        type: 'error', 
        text: error.message || 'Kļūda saglabājot metadatus' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render file upload step
  const renderFileUpload = () => (
    <div className="form-content">
      <section className="form-section">
        <div className="section-header">
          <h3 className="section-title">Failu augšupielāde</h3>
          <p className="section-description">
            Izvēlieties {inheritanceInfo.type} failus augšupielādei
          </p>
        </div>
        
        <div className="file-upload-area">
          <input
            ref={fileInputRef}
            type="file"
            multiple={inheritanceInfo.workflow?.allowsMultipleFiles ?? true}
            accept={inheritanceInfo.constraints?.acceptAttribute || '*/*'}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="file-upload-label" onClick={openFileBrowser}>
            <div className="file-upload-icon">📁</div>
            <div className="file-upload-text">
              Noklikšķiniet, lai izvēlētos failus
            </div>
            <div className="file-upload-hint">
              Atbalstītie formāti: {inheritanceInfo.constraints?.acceptAttribute || 'Visi'}
            </div>
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="selected-files-list">
              <h4 className="selected-files-title">
                Izvēlētie faili ({selectedFiles.length}):
              </h4>
              {selectedFiles.map((file, index) => (
                <div key={index} className="selected-file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="file-remove-btn"
                    disabled={isSubmitting}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {errors.files && (
            <div className="field-error">{errors.files}</div>
          )}
        </div>
      </section>
    </div>
  );
  
  // Render metadata form
  const renderMetadata = () => {
    const mediaType = inheritanceInfo.type;
    
    return (
      <div className="form-content">
        <section className="form-section">
          <div className="section-header">
            <h3 className="section-title">Metadatu informācija</h3>
            <p className="section-description">
              Pievienojiet papildu informāciju par augšupielādētajiem failiem
            </p>
          </div>
          
          <div className="form-grid">
            {/* Color field - for all media types */}
            <div className="form-group">
              <label className="form-label">Krāsa</label>
              <select
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">Izvēlieties...</option>
                <option value="grayscale">Melnbalta</option>
                <option value="color">Krāsaina</option>
              </select>
            </div>
            
            {/* Resolution fields - for Foto and Video */}
            {(mediaType === 'Foto' || mediaType === 'Video') && (
              <>
                <div className="form-group">
                  <label className="form-label">Horizontālā izšķirtspēja</label>
                  <input
                    type="number"
                    name="horizontal_resolution"
                    value={formData.horizontal_resolution}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="piem., 1920"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Vertikālā izšķirtspēja</label>
                  <input
                    type="number"
                    name="vertical_resolution"
                    value={formData.vertical_resolution}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="piem., 1080"
                  />
                </div>
              </>
            )}
            
            {/* Duration - for Video, Audio, and Skaņas */}
            {(mediaType === 'Video' || mediaType === 'Audio' || mediaType === 'Skaņas') && (
              <div className="form-group">
                <label className="form-label">Ilgums</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="piem., 00:05:30"
                />
                <span className="field-hint">Formāts: HH:MM:SS</span>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  };
  
  // Main render
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleMetadataSubmit} className="modal-form">
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">
              Izveidot {inheritanceInfo.type} ierakstu
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="modal-close"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="progress-indicator">
            <div className={`progress-step ${currentStep === 'file-upload' ? 'active' : 'completed'}`}>
              <span className="step-number">1</span>
              <span className="step-label">Failu augšupielāde</span>
            </div>
            <div className="progress-connector"></div>
            <div className={`progress-step ${currentStep === 'metadata' ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Metadati</span>
            </div>
          </div>
          
          {/* Body */}
          <div className="modal-body">
            {currentStep === 'file-upload' ? renderFileUpload() : renderMetadata()}
            
            {statusMessage.text && (
              <div className={`status-message status-${statusMessage.type}`}>
                {statusMessage.text}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Atcelt
            </button>
            
            {currentStep === 'file-upload' ? (
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={isSubmitting || selectedFiles.length === 0}
                className="btn-action"
              >
                {isSubmitting ? 'Augšupielādē...' : 'Augšupielādēt failus'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-action"
              >
                {isSubmitting ? 'Saglabā...' : 'Saglabāt metadatus'}
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