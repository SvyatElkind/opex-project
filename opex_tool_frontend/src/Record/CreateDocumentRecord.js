// src/Record/CreateDocumentRecord.js
// Document Record Creation - Two-Column Layout with Navigation

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import InheritanceUtils from '../Utils/InheritanceUtils';
import { useCreateRecord } from '../hooks/useRecords';
import './CreateDocumentRecord.css';

const CreateDocumentRecord = ({ onClose, onCreate, item, inventory, projectId }) => {
  const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
  const createRecordMutation = useCreateRecord();
  
  // Portal container
  const [portalContainer] = useState(() => {
    const div = document.createElement('div');
    div.setAttribute('data-create-record-portal', 'true');
    return div;
  });
  
  // Refs for sections
  const sectionRefs = {
    basic: useRef(null),
    document: useRef(null),
    description: useRef(null),
    access: useRef(null)
  };
  
  // Active section tracking
  const [activeSection, setActiveSection] = useState('basic');
  
  // Navigation menu items
  const navItems = [
    { id: 'basic', label: 'Pamata Informācija', icon: '📋' },
    { id: 'document', label: 'Dokumenta Detaļas', icon: '📄' },
    { id: 'description', label: 'Apraksts', icon: '📝' },
    { id: 'access', label: 'Piekļuve un Drošība', icon: '🔒' }
  ];
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    reg_nr: '',
    group: '',
    created_date: '',
    sent_date: '',
    language: '',
    key_words: '',
    sent_reg_nr: '',
    nomenclature_nr: '',
    annotation: '',
    notes: '',
    tech_info: '',
    access_restriction: '',
    access_restriction_notes: '',
    access_restriction_date: '',
    user_restriction_notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  
  // Mount portal container
  useEffect(() => {
    document.body.appendChild(portalContainer);
    return () => {
      document.body.removeChild(portalContainer);
    };
  }, [portalContainer]);
  
  // Intersection Observer for active section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -60% 0px',
      threshold: 0
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setActiveSection(sectionId);
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Scroll to section
  const scrollToSection = (sectionId) => {
    const ref = sectionRefs[sectionId];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      setActiveSection(sectionId);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Nosaukums ir obligāts';
    }
    
    if (!formData.date) {
      newErrors.date = 'Datums ir obligāts';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setStatusMessage({ 
        type: 'error', 
        text: 'Lūdzu, aizpildiet visus obligātos laukus' 
      });
      return;
    }
    
    setIsSubmitting(true);
    setStatusMessage({ type: 'info', text: 'Izveido ierakstu...' });
    
    try {
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
      
      setTimeout(() => {
        if (onCreate) {
          onCreate(result);
        }
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error creating record:', error);
      setStatusMessage({ 
        type: 'error', 
        text: error.message || 'Kļūda izveidojot ierakstu' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSubmitting, onClose]);
  
  // Modal content
  const modalContent = (
    <div className="create-record-nav-modal-overlay">
      <form onSubmit={handleSubmit} className="create-record-nav-container">
        {/* Header */}
        <div className="create-record-nav-header">
          <div className="create-record-nav-header-content">
            <h2 className="create-record-nav-title">
              <i className="fas fa-file-alt"></i>
              Jauns Dokuments
            </h2>
            <div className="create-record-nav-subtitle">
              Vienība: {item.number} - {item.title}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="create-record-nav-close-btn"
            disabled={isSubmitting}
            aria-label="Aizvērt"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* Status Message */}
        {statusMessage.text && (
          <div className={`create-record-nav-status create-record-nav-status-${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}
        
        {/* Main Content */}
        <div className="create-record-nav-main">
          {/* Left Navigation */}
          <nav className="create-record-nav-menu">
            {navItems.map(navItem => (
              <button
                key={navItem.id}
                type="button"
                onClick={() => scrollToSection(navItem.id)}
                className={`create-record-nav-menu-item ${
                  activeSection === navItem.id ? 'create-record-nav-menu-item-active' : ''
                }`}
              >
                <span className="create-record-nav-menu-icon">{navItem.icon}</span>
                <span className="create-record-nav-menu-text">{navItem.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Right Content */}
          <div className="create-record-nav-content">
            {/* Basic Information Section */}
            <section ref={sectionRefs.basic} className="create-record-nav-section" id="basic">
              <h3 className="create-record-nav-section-header">
                <span className="create-record-nav-section-icon">📋</span>
                Pamata Informācija
              </h3>
              
              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label create-record-nav-field-label-required">
                  Nosaukums:
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`create-record-nav-input ${errors.title ? 'error' : ''}`}
                  placeholder="Ievadiet dokumenta nosaukumu..."
                  maxLength={200}
                  disabled={isSubmitting}
                  required
                />
                {errors.title && <span className="create-record-nav-error">{errors.title}</span>}
              </div>
              
              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label create-record-nav-field-label-required">
                  Datums:
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`create-record-nav-input ${errors.date ? 'error' : ''}`}
                  disabled={isSubmitting}
                  required
                />
                {errors.date && <span className="create-record-nav-error">{errors.date}</span>}
              </div>
              
              <div className="create-record-nav-field-row">
                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    Reģistrācijas Nr.:
                  </label>
                  <input
                    type="text"
                    name="reg_nr"
                    value={formData.reg_nr}
                    onChange={handleInputChange}
                    className="create-record-nav-input"
                    placeholder="123/2025"
                    maxLength={30}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    Grupa:
                  </label>
                  <select
                    name="group"
                    value={formData.group}
                    onChange={handleInputChange}
                    className="create-record-nav-select"
                    disabled={isSubmitting}
                  >
                    <option value="">Izvēlieties...</option>
                    <option value="Iekšējs">Iekšējs</option>
                    <option value="Ārējs">Ārējs</option>
                    <option value="Saņemts">Saņemts</option>
                    <option value="Nosūtīts">Nosūtīts</option>
                  </select>
                </div>
              </div>
            </section>
            
            {/* Document Details Section */}
            <section ref={sectionRefs.document} className="create-record-nav-section" id="document">
              <h3 className="create-record-nav-section-header">
                <span className="create-record-nav-section-icon">📄</span>
                Dokumenta Detaļas
              </h3>
              
              <div className="create-record-nav-field-row">
                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    Izveidošanas datums:
                  </label>
                  <input
                    type="date"
                    name="created_date"
                    value={formData.created_date}
                    onChange={handleInputChange}
                    className="create-record-nav-input"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    Nosūtīšanas datums:
                  </label>
                  <input
                    type="date"
                    name="sent_date"
                    value={formData.sent_date}
                    onChange={handleInputChange}
                    className="create-record-nav-input"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  Valoda:
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="create-record-nav-select"
                  disabled={isSubmitting}
                >
                  <option value="">Izvēlieties...</option>
                  <option value="latviešu">Latviešu</option>
                  <option value="krievu">Krievu</option>
                  <option value="angļu">Angļu</option>
                  <option value="vācu">Vācu</option>
                  <option value="cita">Cita</option>
                </select>
              </div>
              
              <div className="create-record-nav-field-row">
                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    Nosūtītāja Reģ. Nr.:
                  </label>
                  <input
                    type="text"
                    name="sent_reg_nr"
                    value={formData.sent_reg_nr}
                    onChange={handleInputChange}
                    className="create-record-nav-input"
                    maxLength={30}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    Nomenklatūras Nr.:
                  </label>
                  <input
                    type="text"
                    name="nomenclature_nr"
                    value={formData.nomenclature_nr}
                    onChange={handleInputChange}
                    className="create-record-nav-input"
                    maxLength={10}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  Atslēgvārdi:
                </label>
                <input
                  type="text"
                  name="key_words"
                  value={formData.key_words}
                  onChange={handleInputChange}
                  className="create-record-nav-input"
                  placeholder="Atdalīti ar komatiem"
                  maxLength={200}
                  disabled={isSubmitting}
                />
              </div>
            </section>
            
            {/* Description Section */}
            <section ref={sectionRefs.description} className="create-record-nav-section" id="description">
              <h3 className="create-record-nav-section-header">
                <span className="create-record-nav-section-icon">📝</span>
                Apraksts
              </h3>
              
              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  Anotācija:
                </label>
                <textarea
                  name="annotation"
                  value={formData.annotation}
                  onChange={handleInputChange}
                  className="create-record-nav-textarea"
                  placeholder="Ievadiet dokumenta anotāciju..."
                  rows="4"
                  maxLength={2000}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  Piezīmes:
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="create-record-nav-textarea"
                  placeholder="Ievadiet papildus piezīmes..."
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>
            </section>
            
            {/* Access & Security Section */}
            <section ref={sectionRefs.access} className="create-record-nav-section" id="access">
              <h3 className="create-record-nav-section-header">
                <span className="create-record-nav-section-icon">🔒</span>
                Piekļuve un Drošība
              </h3>
              
              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  Piekļuves ierobežojums:
                </label>
                <select
                  name="access_restriction"
                  value={formData.access_restriction}
                  onChange={handleInputChange}
                  className="create-record-nav-select"
                  disabled={isSubmitting}
                >
                  <option value="">Izvēlieties...</option>
                  <option value="open">Atvērts</option>
                  <option value="closed">Slēgts</option>
                </select>
              </div>
              
              {formData.access_restriction && (
                <>
                  <div className="create-record-nav-field">
                    <label className="create-record-nav-field-label">
                      Ierobežojuma piezīmes:
                    </label>
                    <textarea
                      name="access_restriction_notes"
                      value={formData.access_restriction_notes}
                      onChange={handleInputChange}
                      className="create-record-nav-textarea"
                      placeholder="Aprakstiet ierobežojuma iemeslus..."
                      rows="3"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="create-record-nav-field">
                    <label className="create-record-nav-field-label">
                      Ierobežojuma datums:
                    </label>
                    <input
                      type="date"
                      name="access_restriction_date"
                      value={formData.access_restriction_date}
                      onChange={handleInputChange}
                      className="create-record-nav-input"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="create-record-nav-field">
                    <label className="create-record-nav-field-label">
                      Lietotāja ierobežojumu piezīmes:
                    </label>
                    <textarea
                      name="user_restriction_notes"
                      value={formData.user_restriction_notes}
                      onChange={handleInputChange}
                      className="create-record-nav-textarea"
                      rows="2"
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}
              
              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  Tehniskā informācija:
                </label>
                <textarea
                  name="tech_info"
                  value={formData.tech_info}
                  onChange={handleInputChange}
                  className="create-record-nav-textarea"
                  placeholder="Tehniskās detaļas..."
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>
            </section>
          </div>
        </div>
        
        {/* Footer */}
        <div className="create-record-nav-footer">
          <button
            type="button"
            onClick={onClose}
            className="create-record-nav-btn create-record-nav-btn-cancel"
            disabled={isSubmitting}
          >
            <i className="fas fa-times"></i>
            <span>Atcelt</span>
          </button>
          <button
            type="submit"
            className="create-record-nav-btn create-record-nav-btn-submit"
            disabled={isSubmitting}
          >
            <i className="fas fa-check"></i>
            <span>{isSubmitting ? 'Izveido...' : 'Izveidot Ierakstu'}</span>
          </button>
        </div>
      </form>
    </div>
  );
  
  return ReactDOM.createPortal(modalContent, portalContainer);
};

export default CreateDocumentRecord;