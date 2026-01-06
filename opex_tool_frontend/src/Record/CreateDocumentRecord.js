// src/Record/CreateDocumentRecord.js
// Document Record Creation - Two-Column Layout with Navigation

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import InheritanceUtils from '../Utils/InheritanceUtils';
import { GeneralAlert, FieldError } from '../components/ErrorDisplay';
import { useCreateRecord } from '../hooks/useRecords';
import { useFormErrors } from '../hooks/useFormErrors';
import {
  validateTextRecordCreate,
  validateRecordDate,
  validateAccessRestriction,
  validateAccessRestrictionDate,
  TITLE_MAX_LENGTH,
  LANGUAGE_MAX_LENGTH,
  ANNOTATION_MAX_LENGTH,
  KEY_WORDS_MAX_LENGTH,
  REG_NR_MAX_LENGTH,
  SENT_REG_NR_MAX_LENGTH,
  NOMENCLATURE_NR_MAX_LENGTH,
  NOTES_MAX_LENGTH,
  TECH_INFO_MAX_LENGTH,
  ACCESS_RESTRICTION_NOTES_MAX_LENGTH,
  USER_RESTRICTION_NOTES_MAX_LENGTH,
  GROUP_MAX_LENGTH,
  getRemainingChars,
  isAccessRestrictionDateRequired
} from '../Constants/recordConstants';
import './CreateDocumentRecord.css';

const CreateDocumentRecord = ({ onClose, onCreate, item, inventory, projectId }) => {
  const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
  const createRecordMutation = useCreateRecord();
  const { generalError, setGeneralError, setApiErrors, clearErrors, getFieldError, setFieldErrors } = useFormErrors();

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
    { id: 'basic', label: 'Pamata Informācija', icon: 'fa-info-circle' },
    { id: 'document', label: 'Dokumenta Detaļas', icon: 'fa-file-alt' },
    { id: 'description', label: 'Apraksts', icon: 'fa-sticky-note' },
    { id: 'access', label: 'Piekļuve un Drošība', icon: 'fa-lock' }
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

    // Clear error for this field when user starts typing
    clearErrors(name);

    // Real-time validation for specific fields
    if (name === 'date') {
      const dateError = validateRecordDate(value, item);
      if (dateError) {
        setFieldErrors({ date: dateError });
      }
    }

    if (name === 'access_restriction') {
      const accessError = validateAccessRestriction(value);
      if (accessError) {
        setFieldErrors({ access_restriction: accessError });
      }
      // Clear access_restriction_date if switching to 'open'
      if (value === 'open' && formData.access_restriction_date) {
        setFormData(prev => ({ ...prev, access_restriction_date: '' }));
      }
    }

    if (name === 'access_restriction_date') {
      const accessDateError = validateAccessRestrictionDate(value, formData.access_restriction);
      if (accessDateError) {
        setFieldErrors({ access_restriction_date: accessDateError });
      }
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
  
  // Scroll to first error section
  const scrollToFirstError = (errors) => {
    const sectionMap = {
      title: 'basic',
      date: 'basic',
      reg_nr: 'basic',
      group: 'basic',
      created_date: 'document',
      sent_date: 'document',
      language: 'document',
      sent_reg_nr: 'document',
      nomenclature_nr: 'document',
      key_words: 'document',
      annotation: 'description',
      notes: 'description',
      access_restriction: 'access',
      access_restriction_notes: 'access',
      access_restriction_date: 'access',
      user_restriction_notes: 'access',
      tech_info: 'access'
    };

    const firstErrorField = Object.keys(errors)[0];
    const targetSection = sectionMap[firstErrorField] || 'basic';
    scrollToSection(targetSection);
  };
  
  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    // Client-side validation
    const validationData = {
      title: formData.title,
      language: formData.language,
      reg_nr: formData.reg_nr,
      nomenclature_nr: formData.nomenclature_nr,
      date: formData.date,
      access_restriction: formData.access_restriction,
      access_restriction_date: formData.access_restriction_date
    };

    const validation = validateTextRecordCreate(validationData, item);

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      scrollToFirstError(validation.errors);
      setGeneralError('Lūdzu, labojiet kļūdas formā');
      return;
    }

    setIsSubmitting(true);

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

      if (onCreate) {
        onCreate(result);
      }
      onClose();

    } catch (error) {
      console.error('Error creating record:', error);
      if (error.response?.data?.errors) {
        setApiErrors(error.response.data.errors);
      } else {
        setGeneralError(error.message || 'Kļūda izveidojot dokumentu');
      }
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
            <h2 className="create-record-nav-title">Jauns Dokuments</h2>
            <div className="create-record-nav-subtitle">
              Vienība: {item.number} - {item.title}
            </div>
          </div>
          <div className="create-record-nav-header-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className="create-record-nav-btn create-record-nav-btn-primary"
            >
              <i className="fas fa-check"></i>
              <span>{isSubmitting ? 'Izveido...' : 'Izveidot Ierakstu'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="create-record-nav-btn create-record-nav-btn-cancel"
            >
              <i className="fas fa-times"></i>
              <span>Atcelt</span>
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="create-record-nav-body">
          {/* Left Navigation Sidebar */}
          <aside className="create-record-nav-sidebar">
            <nav className="create-record-nav-menu">
              {navItems.map(navItem => (
                <div
                  key={navItem.id}
                  className={`create-record-nav-menu-item ${
                    activeSection === navItem.id ? 'create-record-nav-menu-item-active' : ''
                  }`}
                  onClick={() => scrollToSection(navItem.id)}
                >
                  <span className="create-record-nav-menu-icon"><i className={`fas ${navItem.icon}`}></i></span>
                  <span className="create-record-nav-menu-text">{navItem.label}</span>
                </div>
              ))}
            </nav>

            {/* Error Message - in sidebar under menu */}
            {generalError && (
              <div className="create-record-nav-sidebar-error">
                <GeneralAlert message={generalError} type="error" onClose={() => setGeneralError('')} />
              </div>
            )}
          </aside>
          
          {/* Right Content */}
          <div className="create-record-nav-content">
            {/* Basic Information Section */}
            <section ref={sectionRefs.basic} className="create-record-nav-section" id="basic">
              <h3 className="create-record-nav-section-header">
                <span className="create-record-nav-section-icon"><i className="fas fa-info-circle"></i></span>
                Pamata Informācija
              </h3>
              
              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label create-record-nav-field-label-required">
                  Nosaukums:
                  {getRemainingChars(formData.title, TITLE_MAX_LENGTH) < 5 && (
                    <span className="char-counter-warning">
                      ({getRemainingChars(formData.title, TITLE_MAX_LENGTH)} atlikušie)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`create-record-nav-input ${getFieldError('title') ? 'error' : ''}`}
                  placeholder="Ievadiet dokumenta nosaukumu..."
                  maxLength={TITLE_MAX_LENGTH}
                  disabled={isSubmitting}
                  required
                />
                <FieldError error={getFieldError('title')} />
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
                  className={`create-record-nav-input ${getFieldError('date') ? 'error' : ''}`}
                  disabled={isSubmitting}
                  required
                />
                <FieldError error={getFieldError('date')} />
              </div>
              
              <div className="create-record-nav-field-row">
                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    Reģistrācijas Nr.:
                    {getRemainingChars(formData.reg_nr, REG_NR_MAX_LENGTH) < 5 && (
                      <span className="char-counter-warning">
                        ({getRemainingChars(formData.reg_nr, REG_NR_MAX_LENGTH)} atlikušie)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="reg_nr"
                    value={formData.reg_nr}
                    onChange={handleInputChange}
                    className={`create-record-nav-input ${getFieldError('reg_nr') ? 'error' : ''}`}
                    placeholder="123/2025"
                    maxLength={REG_NR_MAX_LENGTH}
                    disabled={isSubmitting}
                  />
                  <FieldError error={getFieldError('reg_nr')} />
                </div>

                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    Grupa:
                    {getRemainingChars(formData.group, GROUP_MAX_LENGTH) < 5 && (
                      <span className="char-counter-warning">
                        ({getRemainingChars(formData.group, GROUP_MAX_LENGTH)} atlikušie)
                      </span>
                    )}
                  </label>
                  <select
                    name="group"
                    value={formData.group}
                    onChange={handleInputChange}
                    className={`create-record-nav-select ${getFieldError('group') ? 'error' : ''}`}
                    disabled={isSubmitting}
                  >
                    <option value="">Izvēlieties...</option>
                    <option value="Iekšējs">Iekšējs</option>
                    <option value="Ārējs">Ārējs</option>
                    <option value="Saņemts">Saņemts</option>
                    <option value="Nosūtīts">Nosūtīts</option>
                  </select>
                  <FieldError error={getFieldError('group')} />
                </div>
              </div>
            </section>
            
            {/* Document Details Section */}
            <section ref={sectionRefs.document} className="create-record-nav-section" id="document">
              <h3 className="create-record-nav-section-header">
                <span className="create-record-nav-section-icon"><i className="fas fa-file-alt"></i></span>
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
                  {getRemainingChars(formData.language, LANGUAGE_MAX_LENGTH) < 5 && (
                    <span className="char-counter-warning">
                      ({getRemainingChars(formData.language, LANGUAGE_MAX_LENGTH)} atlikušie)
                    </span>
                  )}
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className={`create-record-nav-select ${getFieldError('language') ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="">Izvēlieties...</option>
                  <option value="latviešu">Latviešu</option>
                  <option value="krievu">Krievu</option>
                  <option value="angļu">Angļu</option>
                  <option value="vācu">Vācu</option>
                  <option value="cita">Cita</option>
                </select>
                <FieldError error={getFieldError('language')} />
              </div>
              
              <div className="create-record-nav-field-row">
                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    Nosūtītāja Reģ. Nr.:
                    {getRemainingChars(formData.sent_reg_nr, SENT_REG_NR_MAX_LENGTH) < 5 && (
                      <span className="char-counter-warning">
                        ({getRemainingChars(formData.sent_reg_nr, SENT_REG_NR_MAX_LENGTH)} atlikušie)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="sent_reg_nr"
                    value={formData.sent_reg_nr}
                    onChange={handleInputChange}
                    className={`create-record-nav-input ${getFieldError('sent_reg_nr') ? 'error' : ''}`}
                    maxLength={SENT_REG_NR_MAX_LENGTH}
                    disabled={isSubmitting}
                  />
                  <FieldError error={getFieldError('sent_reg_nr')} />
                </div>

                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    Nomenklatūras Nr.:
                    {getRemainingChars(formData.nomenclature_nr, NOMENCLATURE_NR_MAX_LENGTH) < 5 && (
                      <span className="char-counter-warning">
                        ({getRemainingChars(formData.nomenclature_nr, NOMENCLATURE_NR_MAX_LENGTH)} atlikušie)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="nomenclature_nr"
                    value={formData.nomenclature_nr}
                    onChange={handleInputChange}
                    className={`create-record-nav-input ${getFieldError('nomenclature_nr') ? 'error' : ''}`}
                    maxLength={NOMENCLATURE_NR_MAX_LENGTH}
                    disabled={isSubmitting}
                  />
                  <FieldError error={getFieldError('nomenclature_nr')} />
                </div>
              </div>

              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  Atslēgvārdi:
                  {getRemainingChars(formData.key_words, KEY_WORDS_MAX_LENGTH) < 5 && (
                    <span className="char-counter-warning">
                      ({getRemainingChars(formData.key_words, KEY_WORDS_MAX_LENGTH)} atlikušie)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  name="key_words"
                  value={formData.key_words}
                  onChange={handleInputChange}
                  className={`create-record-nav-input ${getFieldError('key_words') ? 'error' : ''}`}
                  placeholder="Atdalīti ar komatiem"
                  maxLength={KEY_WORDS_MAX_LENGTH}
                  disabled={isSubmitting}
                />
                <FieldError error={getFieldError('key_words')} />
              </div>
            </section>
            
            {/* Description Section */}
            <section ref={sectionRefs.description} className="create-record-nav-section" id="description">
              <h3 className="create-record-nav-section-header">
                <span className="create-record-nav-section-icon"><i className="fas fa-sticky-note"></i></span>
                Apraksts
              </h3>
              
              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  Anotācija:
                  {getRemainingChars(formData.annotation, ANNOTATION_MAX_LENGTH) < 5 && (
                    <span className="char-counter-warning">
                      ({getRemainingChars(formData.annotation, ANNOTATION_MAX_LENGTH)} atlikušie)
                    </span>
                  )}
                </label>
                <textarea
                  name="annotation"
                  value={formData.annotation}
                  onChange={handleInputChange}
                  className={`create-record-nav-textarea ${getFieldError('annotation') ? 'error' : ''}`}
                  placeholder="Ievadiet dokumenta anotāciju..."
                  rows="4"
                  maxLength={ANNOTATION_MAX_LENGTH}
                  disabled={isSubmitting}
                />
                <FieldError error={getFieldError('annotation')} />
              </div>

              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  Piezīmes:
                  {getRemainingChars(formData.notes, NOTES_MAX_LENGTH) < 5 && (
                    <span className="char-counter-warning">
                      ({getRemainingChars(formData.notes, NOTES_MAX_LENGTH)} atlikušie)
                    </span>
                  )}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className={`create-record-nav-textarea ${getFieldError('notes') ? 'error' : ''}`}
                  placeholder="Ievadiet papildus piezīmes..."
                  rows="3"
                  maxLength={NOTES_MAX_LENGTH}
                  disabled={isSubmitting}
                />
                <FieldError error={getFieldError('notes')} />
              </div>
            </section>
            
            {/* Access & Security Section */}
            <section ref={sectionRefs.access} className="create-record-nav-section" id="access">
              <h3 className="create-record-nav-section-header">
                <span className="create-record-nav-section-icon"><i className="fas fa-lock"></i></span>
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
                  className={`create-record-nav-select ${getFieldError('access_restriction') ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="">Izvēlieties...</option>
                  <option value="open">Atvērts</option>
                  <option value="closed">Slēgts</option>
                </select>
                <FieldError error={getFieldError('access_restriction')} />
              </div>

              {formData.access_restriction && (
                <>
                  <div className="create-record-nav-field">
                    <label className="create-record-nav-field-label">
                      Ierobežojuma piezīmes:
                      {getRemainingChars(formData.access_restriction_notes, ACCESS_RESTRICTION_NOTES_MAX_LENGTH) < 5 && (
                        <span className="char-counter-warning">
                          ({getRemainingChars(formData.access_restriction_notes, ACCESS_RESTRICTION_NOTES_MAX_LENGTH)} atlikušie)
                        </span>
                      )}
                    </label>
                    <textarea
                      name="access_restriction_notes"
                      value={formData.access_restriction_notes}
                      onChange={handleInputChange}
                      className={`create-record-nav-textarea ${getFieldError('access_restriction_notes') ? 'error' : ''}`}
                      placeholder="Aprakstiet ierobežojuma iemeslus..."
                      rows="3"
                      maxLength={ACCESS_RESTRICTION_NOTES_MAX_LENGTH}
                      disabled={isSubmitting}
                    />
                    <FieldError error={getFieldError('access_restriction_notes')} />
                  </div>

                  <div className="create-record-nav-field">
                    <label className={`create-record-nav-field-label ${isAccessRestrictionDateRequired(formData.access_restriction) ? 'create-record-nav-field-label-required' : ''}`}>
                      Ierobežojuma datums:
                    </label>
                    <input
                      type="date"
                      name="access_restriction_date"
                      value={formData.access_restriction_date}
                      onChange={handleInputChange}
                      className={`create-record-nav-input ${getFieldError('access_restriction_date') ? 'error' : ''}`}
                      disabled={isSubmitting}
                      required={isAccessRestrictionDateRequired(formData.access_restriction)}
                    />
                    <FieldError error={getFieldError('access_restriction_date')} />
                  </div>

                  <div className="create-record-nav-field">
                    <label className="create-record-nav-field-label">
                      Lietotāja ierobežojumu piezīmes:
                      {getRemainingChars(formData.user_restriction_notes, USER_RESTRICTION_NOTES_MAX_LENGTH) < 5 && (
                        <span className="char-counter-warning">
                          ({getRemainingChars(formData.user_restriction_notes, USER_RESTRICTION_NOTES_MAX_LENGTH)} atlikušie)
                        </span>
                      )}
                    </label>
                    <textarea
                      name="user_restriction_notes"
                      value={formData.user_restriction_notes}
                      onChange={handleInputChange}
                      className={`create-record-nav-textarea ${getFieldError('user_restriction_notes') ? 'error' : ''}`}
                      rows="2"
                      maxLength={USER_RESTRICTION_NOTES_MAX_LENGTH}
                      disabled={isSubmitting}
                    />
                    <FieldError error={getFieldError('user_restriction_notes')} />
                  </div>
                </>
              )}

              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  Tehniskā informācija:
                  {getRemainingChars(formData.tech_info, TECH_INFO_MAX_LENGTH) < 5 && (
                    <span className="char-counter-warning">
                      ({getRemainingChars(formData.tech_info, TECH_INFO_MAX_LENGTH)} atlikušie)
                    </span>
                  )}
                </label>
                <textarea
                  name="tech_info"
                  value={formData.tech_info}
                  onChange={handleInputChange}
                  className={`create-record-nav-textarea ${getFieldError('tech_info') ? 'error' : ''}`}
                  placeholder="Tehniskās detaļas..."
                  rows="3"
                  maxLength={TECH_INFO_MAX_LENGTH}
                  disabled={isSubmitting}
                />
                <FieldError error={getFieldError('tech_info')} />
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
  
  return ReactDOM.createPortal(modalContent, portalContainer);
};

export default CreateDocumentRecord;