// src/Record/CreateRecord.js
// Reworked Record Creation Component - Clean separation of Documents vs Media workflows

import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import InheritanceUtils from '../Utils/InheritanceUtils';
import { useCreateRecord, useCreateMediaRecord, useUpdateMediaRecord } from '../hooks/useRecords';

const CreateRecord = ({ onClose, onCreate, item, inventory, projectId }) => {
  const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
  
  // Determine workflow type
  const isMedia = inheritanceInfo.isMedia || inheritanceInfo.isElectronicMedia;
  const isDocuments = inheritanceInfo.isDocuments || inheritanceInfo.isElectronicDocuments;
  
  // API mutations
  const createRecordMutation = useCreateRecord();
  const createMediaRecordMutation = useCreateMediaRecord();
  const updateMediaRecordMutation = useUpdateMediaRecord();
  
  // File input refs
  const fileInputRef = useRef(null);
  
  // Workflow state - Documents: form first, Media: files first
  const [currentStep, setCurrentStep] = useState(isMedia ? 'file-upload' : 'record-form');
  const [createdRecordId, setCreatedRecordId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Form state - using simple object
  const [formData, setFormData] = useState({
    // Basic fields
    title: '',
    date: '',
    
    // Document-specific fields
    created_date: '',
    sent_date: '',
    language: '',
    annotation: '',
    key_words: '',
    reg_nr: '',
    sent_reg_nr: '',
    nomenclature_nr: '',
    group: '',
    notes: '',
    
    // Access restriction fields
    access_restriction: '',
    access_restriction_notes: '',
    access_restriction_date: '',
    user_restriction_notes: '',
    tech_info: '',
    
    // Media-specific fields (for metadata after file upload)
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
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    if (files.length > 0) {
      setStatusMessage({ 
        type: 'info', 
        text: `${files.length} faili izvēlēti` 
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (currentStep === 'record-form') {
      if (!formData.title?.trim()) {
        newErrors.title = 'Nosaukums ir obligāts';
      }
      if (!formData.date) {
        newErrors.date = 'Datums ir obligāts';
      }
    }
    
    if (currentStep === 'file-upload' && isMedia && selectedFiles.length === 0) {
      newErrors.files = 'Lūdzu, izvēlieties vismaz vienu failu';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // ============================================
  // DOCUMENTS WORKFLOW: Create record first
  // ============================================
  const handleDocumentSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setStatusMessage({ type: 'info', text: 'Izveido ierakstu...' });
    
    try {
      // POST /api/v1/project/<project_id>/record/?item_id=<item_id>
      const recordData = {
        title: formData.title,
        date: formData.date,
        created_date: formData.created_date || null,
        sent_date: formData.sent_date || null,
        language: formData.language || null,
        annotation: formData.annotation || null,
        key_words: formData.key_words || null,
        reg_nr: formData.reg_nr || null,
        sent_reg_nr: formData.sent_reg_nr || null,
        nomenclature_nr: formData.nomenclature_nr || null,
        group: formData.group || null,
        notes: formData.notes || null,
        access_restriction: formData.access_restriction || null,
        access_restriction_notes: formData.access_restriction_notes || null,
        access_restriction_date: formData.access_restriction_date || null,
        user_restriction_notes: formData.user_restriction_notes || null,
        tech_info: formData.tech_info || null
      };
      
      const result = await createRecordMutation.mutateAsync({
        projectId,
        itemId: item.id,
        recordData
      });
      
      setStatusMessage({ type: 'success', text: 'Ieraksts veiksmīgi izveidots!' });
      
      // Call onCreate callback
      if (onCreate) {
        onCreate(result);
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error creating record:', error);
      setStatusMessage({ 
        type: 'error', 
        text: error.message || 'Kļūda veidojot ierakstu' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // ============================================
  // MEDIA WORKFLOW: Upload files first
  // ============================================
  const handleMediaFileUpload = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setStatusMessage({ type: 'info', text: 'Augšupielādē failus...' });
    
    try {
      // POST /api/v1/project/<project_id>/media_record/?item_id=<item_id>
      const formDataObj = new FormData();
      selectedFiles.forEach(file => {
        formDataObj.append('files', file);
      });
      
      const result = await createMediaRecordMutation.mutateAsync({
        projectId,
        itemId: item.id,
        files: formDataObj
      });
      
      setCreatedRecordId(result.id);
      setCurrentStep('metadata-form');
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
  
  // ============================================
  // MEDIA WORKFLOW: Update metadata after upload
  // ============================================
  const handleMediaMetadataSubmit = async () => {
    if (!createdRecordId) return;
    
    setIsSubmitting(true);
    setStatusMessage({ type: 'info', text: 'Saglabā metadatus...' });
    
    try {
      // Determine media type from inheritance
      const mediaType = inheritanceInfo.type; // "Foto", "Video", "Audio"
      
      // PUT /api/v1/project/<project_id>/media_record/<record_id>/?type=<Type>
      const mediaData = {};
      
      // Common fields for all media
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
      
      // Call onCreate callback
      if (onCreate) {
        onCreate({ id: createdRecordId });
      }
      
      // Close modal after short delay
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
  
  // Main submit handler - routes to correct workflow
  const handleSubmit = () => {
    if (isMedia) {
      if (currentStep === 'file-upload') {
        handleMediaFileUpload();
      } else if (currentStep === 'metadata-form') {
        handleMediaMetadataSubmit();
      }
    } else {
      handleDocumentSubmit();
    }
  };
  
  // ============================================
  // RENDER HELPERS
  // ============================================
  
  // Render document form fields
  const renderDocumentForm = () => (
    <div className="form-content">
      {/* Basic Information */}
      <section className="form-section">
        <div className="section-header">
          <h3 className="section-title">Pamata informācija</h3>
        </div>
        
        <div className="form-group">
          <label className="form-label">
            Nosaukums <span className="required-mark">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`form-input ${errors.title ? 'input-error' : ''}`}
            placeholder="Ievadiet nosaukumu"
            maxLength={255}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Datums <span className="required-mark">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`form-input ${errors.date ? 'input-error' : ''}`}
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Reģ. Nr.</label>
            <input
              type="text"
              name="reg_nr"
              value={formData.reg_nr}
              onChange={handleInputChange}
              className="form-input"
              placeholder="piemēram: 133"
              maxLength={30}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Grupa</label>
          <input
            type="text"
            name="group"
            value={formData.group}
            onChange={handleInputChange}
            className="form-input"
            placeholder="piemēram: iekšējais, ārējais"
            maxLength={30}
          />
        </div>
      </section>
      
      {/* Dates Section */}
      <section className="form-section">
        <div className="section-header">
          <h3 className="section-title">Datumi</h3>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Izveidošanas datums</label>
            <input
              type="date"
              name="created_date"
              value={formData.created_date}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Nosūtīšanas datums</label>
            <input
              type="date"
              name="sent_date"
              value={formData.sent_date}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>
      </section>
      
      {/* Metadata Section */}
      <section className="form-section">
        <div className="section-header">
          <h3 className="section-title">Metadati</h3>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Valoda</label>
            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="form-input"
              placeholder="piemēram: latviešu, angļu"
              maxLength={20}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Nosūtīšanas reģ. nr.</label>
            <input
              type="text"
              name="sent_reg_nr"
              value={formData.sent_reg_nr}
              onChange={handleInputChange}
              className="form-input"
              maxLength={30}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Atslēgvārdi</label>
            <input
              type="text"
              name="key_words"
              value={formData.key_words}
              onChange={handleInputChange}
              className="form-input"
              placeholder="komatu atdalīti vārdi"
              maxLength={200}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Nomenklatūras nr.</label>
            <input
              type="text"
              name="nomenclature_nr"
              value={formData.nomenclature_nr}
              onChange={handleInputChange}
              className="form-input"
              maxLength={10}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Anotācija</label>
          <textarea
            name="annotation"
            value={formData.annotation}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Īss dokumenta apraksts..."
            rows={3}
            maxLength={1000}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Piezīmes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Papildu piezīmes..."
            rows={2}
            maxLength={500}
          />
        </div>
      </section>
      
      {/* Access Restriction Section */}
      <section className="form-section">
        <div className="section-header">
          <h3 className="section-title">Piekļuves ierobežojumi</h3>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Ierobežojums</label>
            <select
              name="access_restriction"
              value={formData.access_restriction}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="closed">Slēgts</option>
              <option value="open">Atvērts</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Ierobežojuma datums</label>
            <input
              type="date"
              name="access_restriction_date"
              value={formData.access_restriction_date}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Ierobežojumu piezīmes</label>
          <textarea
            name="access_restriction_notes"
            value={formData.access_restriction_notes}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Īss ierobežojuma iemesls..."
            rows={2}
            maxLength={30}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Lietotāja ierobežojumu piezīmes</label>
          <textarea
            name="user_restriction_notes"
            value={formData.user_restriction_notes}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Papildu lietotāja piezīmes par ierobežojumiem..."
            rows={2}
            maxLength={30}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Tehniskā informācija</label>
          <textarea
            name="tech_info"
            value={formData.tech_info}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Tehniskā informācija..."
            rows={2}
            maxLength={100}
          />
        </div>
      </section>
    </div>
  );
  
  // Open file browser
  const openFileBrowser = () => {
     console.log('openFileBrowser called');
        console.log('fileInputRef.current:', fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Render media file upload
  const renderMediaFileUpload = () => (
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
              <h4 className="selected-files-title">Izvēlētie faili ({selectedFiles.length}):</h4>
              {selectedFiles.map((file, index) => (
                <div key={index} className="selected-file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {errors.files && <span className="error-text">{errors.files}</span>}
        </div>
      </section>
    </div>
  );
  
  // Render media metadata form (after file upload)
  const renderMediaMetadataForm = () => (
    <div className="form-content">
      <section className="form-section">
        <div className="section-header">
          <h3 className="section-title">Mediju metadati</h3>
          <p className="section-description">
            Pievienojiet papildu informāciju par augšupielādētajiem failiem
          </p>
        </div>
        
        {/* Color field - all media types */}
        <div className="form-group">
          <label className="form-label">Krāsa</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            className="form-input"
            placeholder="piemēram: krāsains, melnbalts"
          />
        </div>
        
        {/* Resolution - for Foto and Video */}
        {(inheritanceInfo.type === 'Foto' || inheritanceInfo.type === 'Video') && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Horizontālā izšķirtspēja</label>
              <input
                type="number"
                name="horizontal_resolution"
                value={formData.horizontal_resolution}
                onChange={handleInputChange}
                className="form-input"
                placeholder="1920"
                min="1"
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
                placeholder="1080"
                min="1"
              />
            </div>
          </div>
        )}
        
        {/* Duration - for Video and Audio */}
        {(inheritanceInfo.type === 'Video' || inheritanceInfo.type === 'Audio' || inheritanceInfo.type === 'Skaņas') && (
          <div className="form-group">
            <label className="form-label">Ilgums</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="form-input"
              placeholder="00:15:15"
            />
            <small className="form-hint">Formāts: HH:MM:SS</small>
          </div>
        )}
      </section>
    </div>
  );
  
  // Determine what to render based on workflow
  const renderContent = () => {
    if (isMedia) {
      if (currentStep === 'file-upload') {
        return renderMediaFileUpload();
      } else if (currentStep === 'metadata-form') {
        return renderMediaMetadataForm();
      }
    } else {
      return renderDocumentForm();
    }
  };
  
  // Determine button text
  const getSubmitButtonText = () => {
    if (isSubmitting) return 'Saglabā...';
    
    if (isMedia) {
      if (currentStep === 'file-upload') {
        return 'Augšupielādēt failus';
      } else if (currentStep === 'metadata-form') {
        return 'Saglabāt metadatus';
      }
    }
    
    return 'Izveidot ierakstu';
  };
  
  // ============================================
  // MAIN RENDER
  // ============================================
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">
              {isMedia ? 'Jauns mediju ieraksts' : 'Jauns ieraksts'}
            </h2>
            <span className="inventory-badge" style={{ 
              backgroundColor: inheritanceInfo.colorRgb || inheritanceInfo.color || 'var(--color-primary)' 
            }}>
              {inheritanceInfo.displayName || 'Ieraksts'}
            </span>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="modal-close-btn"
              aria-label="Aizvērt"
            >
              ✕
            </button>
          </div>
          
          {/* Progress indicator for media workflow */}
          {isMedia && (
            <div className="workflow-progress">
              <div className={`progress-step ${currentStep === 'file-upload' ? 'active' : 'completed'}`}>
                <span className="step-number">1</span>
                <span className="step-label">Failu augšupielāde</span>
              </div>
              <div className="progress-connector"></div>
              <div className={`progress-step ${currentStep === 'metadata-form' ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Metadati</span>
              </div>
            </div>
          )}
          
          {/* Body */}
          <div className="modal-body">
            {renderContent()}
            
            {/* Status message */}
            {statusMessage.text && (
              <div className={`status-message status-${statusMessage.type}`}>
                {statusMessage.text}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="modal-footer">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Atcelt
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-action"
            >
              {getSubmitButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateRecord;