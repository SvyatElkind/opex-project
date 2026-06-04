import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { parseDate, formatDate, DATEPICKER_FORMAT, DATE_PLACEHOLDER } from '../Utils/DateFormatter';
import InheritanceUtils from '../Utils/InheritanceUtils';
import { GeneralAlert, FieldError } from '../components/ErrorDisplay';
import { useUpdateRecord } from '../hooks/useRecords';
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
import { RECORD_CREATE_FORM_UI } from '../Constants/Constants';
import './CreateDocumentRecord.css';
import '../Item/EditItemNavigable.css';
import HelpButton from '../Help/HelpButton';
import { useSettings } from '../Settings/context/SettingsContext';

// Helper function to parse language string to array
const parseLanguageToArray = (languageString) => {
  if (!languageString) return [];
  if (Array.isArray(languageString)) return languageString;
  return languageString.split(/,\s*/).map(lang => lang.trim()).filter(Boolean);
};

// Get initial form data from record
const getInitialFormData = (record) => ({
  title: record?.title || '',
  date: record?.date || '',
  reg_nr: record?.reg_nr || '',
  group: record?.group || '',
  created_date: record?.created_date || '',
  sent_date: record?.sent_date || '',
  language: parseLanguageToArray(record?.language),
  key_words: record?.key_words || '',
  sent_reg_nr: record?.sent_reg_nr || '',
  nomenclature_nr: record?.nomenclature_nr || '',
  annotation: record?.annotation || '',
  notes: record?.notes || '',
  tech_info: record?.tech_info || '',
  access_restriction: record?.access_restriction || '',
  access_restriction_notes: record?.access_restriction_notes || '',
  access_restriction_date: record?.access_restriction_date || '',
  user_restriction_notes: record?.user_restriction_notes || ''
});

const EditDocumentRecord = forwardRef(({ onClose, onUpdate, record, item, inventory, projectId, prevRecord, nextRecord, onNavigate }, ref) => {
  const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
  const updateRecordMutation = useUpdateRecord();
  const { generalError, setGeneralError, setApiErrors, clearErrors, clearFieldError, getFieldError, setFieldErrors } = useFormErrors();

  // Portal container
  const [portalContainer] = useState(() => {
    const div = document.createElement('div');
    div.setAttribute('data-edit-record-portal', 'true');
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
    { id: 'basic', label: RECORD_CREATE_FORM_UI.SECTION_BASIC, icon: 'fa-info-circle' },
    { id: 'document', label: RECORD_CREATE_FORM_UI.SECTION_DOCUMENT, icon: 'fa-file-alt' },
    { id: 'description', label: RECORD_CREATE_FORM_UI.SECTION_DESCRIPTION, icon: 'fa-sticky-note' },
    { id: 'access', label: RECORD_CREATE_FORM_UI.SECTION_ACCESS, icon: 'fa-lock' }
  ];

  // Available languages for multi-select
  const availableLanguages = RECORD_CREATE_FORM_UI.LANGUAGES;

  // Form state - Initialize with record data
  const [formData, setFormData] = useState(() => getInitialFormData(record));

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Language search state
  const [languageSearch, setLanguageSearch] = useState("");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Date warning state and restriction
  const [dateWarning, setDateWarning] = useState("");
  const [isDateOutOfRange, setIsDateOutOfRange] = useState(false);

  // Keywords state and input - initialize from record
  const [keywords, setKeywords] = useState(() => {
    if (!record?.key_words) return [];
    return record.key_words.split(',').map(kw => kw.trim()).filter(Boolean);
  });
  const [keywordInput, setKeywordInput] = useState("");

  // Access restriction warning state
  const [accessRestrictionWarning, setAccessRestrictionWarning] = useState("");

  // DatePicker → handleInputChange shim. The fake-event shape lets us reuse
  // the existing validation flow that branches on `name`.
  const handleDateFieldChange = (name) => (date) => {
    const value = formatDate(date, 'YYYY-MM-DD');
    if (value === formData[name]) return;
    handleInputChange({ target: { name, value } });
  };

  // Get formatted item date range for subheader
  const getItemDateDisplay = () => {
    const startDate = item.start_date;
    const endDate = item.end_date;
    const indicator = item.date_indicator || 'day';

    if (!startDate && !endDate) return '-';

    const formattedStart = formatDate(startDate, 'DD.MM.YYYY', indicator);
    const formattedEnd = formatDate(endDate, 'DD.MM.YYYY', indicator);

    if (formattedStart && formattedEnd && formattedStart !== formattedEnd) {
      return `${formattedStart} - ${formattedEnd}`;
    } else if (formattedStart) {
      return formattedStart;
    } else if (formattedEnd) {
      return formattedEnd;
    }
    return '-';
  };

  // Check if selected date is within item date range
  const checkDateInRange = (selectedDate) => {
    if (!selectedDate) {
      setDateWarning("");
      setIsDateOutOfRange(false);
      return;
    }

    const selected = new Date(selectedDate);
    const startDate = item.start_date ? new Date(item.start_date) : null;
    const endDate = item.end_date ? new Date(item.end_date) : null;

    // Clear time portion for comparison
    selected.setHours(0, 0, 0, 0);
    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(0, 0, 0, 0);

    let isOutOfRange = false;

    if (startDate && endDate) {
      isOutOfRange = selected < startDate || selected > endDate;
    } else if (startDate) {
      isOutOfRange = selected < startDate;
    } else if (endDate) {
      isOutOfRange = selected > endDate;
    }

    setIsDateOutOfRange(isOutOfRange);

    if (isOutOfRange) {
      const rangeText = getItemDateDisplay();
      setDateWarning(RECORD_CREATE_FORM_UI.DATE_OUT_OF_RANGE_WARNING_EDIT.replace('{rangeText}', rangeText));
    } else {
      setDateWarning("");
    }
  };

  // Keyword handlers
  const handleKeywordInputChange = (e) => {
    setKeywordInput(e.target.value);
  };

  const addKeyword = () => {
    const trimmedKeyword = keywordInput.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword)) {
      setKeywords(prev => [...prev, trimmedKeyword]);
      setKeywordInput("");
    }
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setKeywords(prev => prev.filter(kw => kw !== keywordToRemove));
  };

  // Get keywords as comma-separated string for form submission
  const getKeywordsString = () => {
    return keywords.join(',');
  };

  // Check access restriction mismatch with parent
  const checkAccessRestrictionMismatch = (selectedValue) => {
    if (!selectedValue) {
      setAccessRestrictionWarning("");
      return;
    }

    const parentRestriction = item.restriction?.toLowerCase();
    const parentIsRestricted = parentRestriction === 'ierobežota' || parentRestriction === 'strikti ierobežota';

    // If parent is restricted but user selects "open" (vispārēja)
    if (parentIsRestricted && selectedValue === 'open') {
      setAccessRestrictionWarning(RECORD_CREATE_FORM_UI.ACCESS_MISMATCH_WARNING.replace('{restriction}', item.restriction));
    }
    // If parent is open but user selects "closed" (ierobežota)
    else if (!parentIsRestricted && parentRestriction && selectedValue === 'closed') {
      setAccessRestrictionWarning(RECORD_CREATE_FORM_UI.ACCESS_MISMATCH_WARNING.replace('{restriction}', item.restriction));
    }
    else {
      setAccessRestrictionWarning("");
    }
  };

  // Mount portal container
  useEffect(() => {
    document.body.appendChild(portalContainer);
    return () => {
      document.body.removeChild(portalContainer);
    };
  }, [portalContainer]);

  // Re-initialize form if record changes
  useEffect(() => {
    if (record) {
      setFormData(getInitialFormData(record));
      // Re-initialize keywords from record
      if (record.key_words) {
        setKeywords(record.key_words.split(',').map(kw => kw.trim()).filter(Boolean));
      } else {
        setKeywords([]);
      }
      // Check initial date range
      if (record.date) {
        checkDateInRange(record.date);
      }
      // Check initial access restriction mismatch
      if (record.access_restriction) {
        checkAccessRestrictionMismatch(record.access_restriction);
      }
    }
  }, [record?.id]);

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
    clearFieldError(name);

    // Real-time validation for specific fields
    if (name === 'date') {
      const dateError = validateRecordDate(value, item);
      if (dateError) {
        setFieldErrors({ date: dateError });
      }
      // Check if date is within item date range
      checkDateInRange(value);
    }

    if (name === 'access_restriction') {
      const accessError = validateAccessRestriction(value);
      if (accessError) {
        setFieldErrors({ access_restriction: accessError });
      }
      // Clear access_restriction_date and other fields if switching to 'open'
      if (value === 'open') {
        setFormData(prev => ({
          ...prev,
          access_restriction_date: '',
          access_restriction_notes: '',
          user_restriction_notes: ''
        }));
      }
      // Check for mismatch with parent item restriction
      checkAccessRestrictionMismatch(value);
    }

    if (name === 'access_restriction_date') {
      const accessDateError = validateAccessRestrictionDate(value, formData.access_restriction);
      if (accessDateError) {
        setFieldErrors({ access_restriction_date: accessDateError });
      }
    }
  };

  // Handle language toggle (tag-based multi-select)
  const toggleLanguage = (lang) => {
    setFormData(prev => {
      const currentLanguages = prev.language || [];
      const isSelected = currentLanguages.includes(lang);

      if (isSelected) {
        // Remove language (allow removing all languages)
        const newLanguages = currentLanguages.filter(l => l !== lang);
        return {
          ...prev,
          language: newLanguages
        };
      } else {
        // Add language
        return {
          ...prev,
          language: [...currentLanguages, lang]
        };
      }
    });
    setLanguageSearch("");
    setShowLanguageDropdown(false);
  };

  // Handle language search change
  const handleLanguageSearchChange = (e) => {
    setLanguageSearch(e.target.value);
    setShowLanguageDropdown(true);
  };

  // Add custom language value
  const addCustomLanguage = () => {
    const trimmedValue = languageSearch.trim();

    if (!trimmedValue) return;

    // Check if language already exists (case-insensitive)
    const currentLanguages = formData.language || [];
    const exists = currentLanguages.some(lang =>
      lang.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (!exists) {
      setFormData(prev => ({
        ...prev,
        language: [...(prev.language || []), trimmedValue]
      }));
    }

    setLanguageSearch("");
    setShowLanguageDropdown(false);
  };

  // Handle Enter key in language search
  const handleLanguageSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // If there are filtered options, add the first one
      const filteredLanguages = availableLanguages.filter(lang =>
        !formData.language.includes(lang) &&
        lang.toLowerCase().includes(languageSearch.toLowerCase())
      );

      if (filteredLanguages.length > 0) {
        toggleLanguage(filteredLanguages[0]);
      } else if (languageSearch.trim()) {
        // Otherwise add the custom value
        addCustomLanguage();
      }
    }
  };

  // Remove language tag
  const removeLanguage = (lang) => {
    setFormData(prev => {
      const currentLanguages = prev.language || [];
      const newLanguages = currentLanguages.filter(l => l !== lang);
      return {
        ...prev,
        language: newLanguages
      };
    });
  };

  // Filter available languages by search and exclude already selected
  const filteredLanguages = availableLanguages.filter(lang =>
    !formData.language.includes(lang) &&
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );

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

  const saveRecord = async () => {
    if (isSubmitting) return false;
    clearErrors();

    if (isDateOutOfRange) {
      setGeneralError(RECORD_CREATE_FORM_UI.DATE_OUT_OF_RANGE_ERROR);
      scrollToSection('basic');
      return false;
    }

    const validationData = {
      title: formData.title,
      language: Array.isArray(formData.language)
        ? formData.language.join(', ')
        : formData.language,
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
      setGeneralError(RECORD_CREATE_FORM_UI.FORM_HAS_ERRORS);
      return false;
    }

    setIsSubmitting(true);

    try {
      const languageString = Array.isArray(formData.language)
        ? formData.language.join(', ')
        : formData.language;

      const recordData = {
        title: formData.title,
        date: formData.date,
        created_date: formData.created_date || null,
        sent_date: formData.sent_date || null,
        language: languageString || null,
        annotation: formData.annotation || null,
        key_words: getKeywordsString() || null,
        reg_nr: formData.reg_nr || null,
        sent_reg_nr: formData.sent_reg_nr || null,
        nomenclature_nr: formData.nomenclature_nr || null,
        group: formData.group || null,
        notes: formData.notes || null,
        access_restriction: formData.access_restriction || null,
        access_restriction_notes: formData.access_restriction_notes || "",
        access_restriction_date: formData.access_restriction_date || null,
        user_restriction_notes: formData.user_restriction_notes || "",
        tech_info: formData.tech_info || null
      };

      const result = await updateRecordMutation.mutateAsync({
        projectId,
        recordId: record.id,
        recordData
      });

      setIsSubmitting(false);
      return result;
    } catch (error) {
      if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        setApiErrors(error.fieldErrors);
      } else if (error.data && typeof error.data === 'object') {
        setApiErrors(error.data);
      } else {
        setGeneralError(error.message || RECORD_CREATE_FORM_UI.ERROR_UPDATING_DOCUMENT);
      }
      setIsSubmitting(false);
      return false;
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await saveRecord();
    if (result !== false) {
      if (onUpdate) {
        onUpdate(result);
      }
      onClose();
    }
  };

  useImperativeHandle(ref, () => ({
    triggerSave: saveRecord
  }));

  const handleSaveAndNavigate = async (direction) => {
    const result = await saveRecord();
    if (result !== false) {
      if (onUpdate) {
        onUpdate(result);
      }
      if (onNavigate) {
        onNavigate(direction);
      }
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

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showLanguageDropdown && !e.target.closest('.create-record-nav-field')) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageDropdown]);

  // Modal content
  const modalContent = (
    <div className="create-record-nav-modal-overlay">
      <form onSubmit={handleSubmit} className="create-record-nav-container">
        {/* Header */}
        <div className="create-record-nav-header">
          <div className="create-record-nav-header-content">
            <h2 className="create-record-nav-title">{RECORD_CREATE_FORM_UI.DOCUMENT_EDIT_TITLE}</h2>
            <div className="create-record-nav-subtitle">
              {RECORD_CREATE_FORM_UI.UNIT_LABEL_FORMAT
                .replace('{title}', item.title || 'Bez nosaukuma')
                .replace('{date}', getItemDateDisplay())}
            </div>
          </div>
          <div className="create-record-nav-header-actions">
            {(prevRecord || nextRecord) && (
              <div className="edit-nav-arrows">
                <button
                  type="button"
                  className="edit-nav-arrow-btn"
                  disabled={!prevRecord || isSubmitting}
                  onClick={() => handleSaveAndNavigate(-1)}
                  title={prevRecord ? `Saglabāt un pāriet uz: ${prevRecord.title || prevRecord.reg_nr || ''}` : 'Nav iepriekšējā'}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  type="button"
                  className="edit-nav-arrow-btn"
                  disabled={!nextRecord || isSubmitting}
                  onClick={() => handleSaveAndNavigate(1)}
                  title={nextRecord ? `Saglabāt un pāriet uz: ${nextRecord.title || nextRecord.reg_nr || ''}` : 'Nav nākamā'}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
            <HelpButton chapterId="records" iconOnly={true} className="small" />
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

            {/* Date Warning - in sidebar under menu */}
            {dateWarning && (
              <div className="create-record-nav-sidebar-warning">
                <div className="create-record-nav-date-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>{dateWarning}</span>
                </div>
              </div>
            )}

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
                {RECORD_CREATE_FORM_UI.SECTION_BASIC}
              </h3>

              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label create-record-nav-field-label-required">
                  {RECORD_CREATE_FORM_UI.FIELD_NOSAUKUMS}
                  {getRemainingChars(formData.title, TITLE_MAX_LENGTH) < 5 && (
                    <span className="char-counter-warning">
                      ({getRemainingChars(formData.title, TITLE_MAX_LENGTH)} {RECORD_CREATE_FORM_UI.CHAR_COUNTER_REMAINING})
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`create-record-nav-input ${getFieldError('title') ? 'error' : ''}`}
                  placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_DOKUMENTA_NOSAUKUMS}
                  maxLength={TITLE_MAX_LENGTH}
                  disabled={isSubmitting}
                  required
                />
                <FieldError error={getFieldError('title')} />
              </div>

              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label create-record-nav-field-label-required">
                  {RECORD_CREATE_FORM_UI.FIELD_DATUMS}
                </label>
                <DatePicker
                  name="date"
                  selected={parseDate(formData.date)}
                  onChange={handleDateFieldChange('date')}
                  dateFormat={DATEPICKER_FORMAT}
                  placeholderText={DATE_PLACEHOLDER}
                  calendarStartDay={1}
                  autoComplete="off"
                  className={`create-record-nav-input ${getFieldError('date') ? 'error' : ''}`}
                  wrapperClassName="create-record-nav-datepicker-wrapper"
                  disabled={isSubmitting}
                  required
                />
                <FieldError error={getFieldError('date')} />
              </div>

              <div className="create-record-nav-field-row">
                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_REĢISTRĀCIJAS_NR}
                    {getRemainingChars(formData.reg_nr, REG_NR_MAX_LENGTH) < 5 && (
                      <span className="char-counter-warning">
                        ({getRemainingChars(formData.reg_nr, REG_NR_MAX_LENGTH)} {RECORD_CREATE_FORM_UI.CHAR_COUNTER_REMAINING})
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="reg_nr"
                    value={formData.reg_nr}
                    onChange={handleInputChange}
                    className={`create-record-nav-input ${getFieldError('reg_nr') ? 'error' : ''}`}
                    placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_REG_NR_EXAMPLE}
                    maxLength={REG_NR_MAX_LENGTH}
                    disabled={isSubmitting}
                  />
                  <FieldError error={getFieldError('reg_nr')} />
                </div>

                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_GRUPA}
                    {getRemainingChars(formData.group, GROUP_MAX_LENGTH) < 5 && (
                      <span className="char-counter-warning">
                        ({getRemainingChars(formData.group, GROUP_MAX_LENGTH)} {RECORD_CREATE_FORM_UI.CHAR_COUNTER_REMAINING})
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="group"
                    value={formData.group}
                    onChange={handleInputChange}
                    className={`create-record-nav-input ${getFieldError('group') ? 'error' : ''}`}
                    placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_GRUPA}
                    maxLength={GROUP_MAX_LENGTH}
                    disabled={isSubmitting}
                  />
                  <FieldError error={getFieldError('group')} />
                </div>
              </div>
            </section>

            {/* Document Details Section */}
            <section ref={sectionRefs.document} className="create-record-nav-section" id="document">
              <h3 className="create-record-nav-section-header">
                <span className="create-record-nav-section-icon"><i className="fas fa-file-alt"></i></span>
                {RECORD_CREATE_FORM_UI.SECTION_DOCUMENT}
              </h3>

              <div className="create-record-nav-field-row">
                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_IZVEIDOŠANAS_DATUMS}
                  </label>
                  <DatePicker
                    name="created_date"
                    selected={parseDate(formData.created_date)}
                    onChange={handleDateFieldChange('created_date')}
                    dateFormat={DATEPICKER_FORMAT}
                    placeholderText={DATE_PLACEHOLDER}
                    calendarStartDay={1}
                    autoComplete="off"
                    className="create-record-nav-input"
                    wrapperClassName="create-record-nav-datepicker-wrapper"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_NOSŪTĪŠANAS_DATUMS}
                  </label>
                  <DatePicker
                    name="sent_date"
                    selected={parseDate(formData.sent_date)}
                    onChange={handleDateFieldChange('sent_date')}
                    dateFormat={DATEPICKER_FORMAT}
                    placeholderText={DATE_PLACEHOLDER}
                    calendarStartDay={1}
                    autoComplete="off"
                    className="create-record-nav-input"
                    wrapperClassName="create-record-nav-datepicker-wrapper"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  {RECORD_CREATE_FORM_UI.FIELD_VALODA}
                </label>

                {/* Selected Language Tags */}
                {formData.language?.length > 0 && (
                  <div className="create-record-nav-language-tags">
                    {formData.language.map(lang => (
                      <div key={lang} className="create-record-nav-language-tag">
                        <span className="language-tag-text">{lang}</span>
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang)}
                          className="language-tag-remove"
                          title="Noņemt"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Language Search Input */}
                <input
                  type="text"
                  value={languageSearch}
                  onChange={handleLanguageSearchChange}
                  onKeyDown={handleLanguageSearchKeyDown}
                  onFocus={() => setShowLanguageDropdown(true)}
                  placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_VALODA}
                  className="create-record-nav-input"
                  disabled={isSubmitting}
                />

                {/* Language Dropdown */}
                {showLanguageDropdown && filteredLanguages.length > 0 && (
                  <div className="create-record-nav-language-dropdown">
                    {filteredLanguages.map(lang => (
                      <div
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className="create-record-nav-language-option"
                      >
                        {lang}
                      </div>
                    ))}
                  </div>
                )}

                {showLanguageDropdown && filteredLanguages.length === 0 && languageSearch && (
                  <div className="create-record-nav-language-dropdown">
                    <div
                      className="create-record-nav-language-add-custom"
                      onClick={addCustomLanguage}
                    >
                      <i className="fas fa-plus-circle"></i>
                      Pievienot "{languageSearch}"
                    </div>
                  </div>
                )}

                <FieldError error={getFieldError('language')} />
              </div>

              <div className="create-record-nav-field-row">
                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    Nosūtītāja reģ. nr.
                    {getRemainingChars(formData.sent_reg_nr, SENT_REG_NR_MAX_LENGTH) < 5 && (
                      <span className="char-counter-warning">
                        ({getRemainingChars(formData.sent_reg_nr, SENT_REG_NR_MAX_LENGTH)} {RECORD_CREATE_FORM_UI.CHAR_COUNTER_REMAINING})
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
                    Lietas Nr.
                    {getRemainingChars(formData.nomenclature_nr, NOMENCLATURE_NR_MAX_LENGTH) < 5 && (
                      <span className="char-counter-warning">
                        ({getRemainingChars(formData.nomenclature_nr, NOMENCLATURE_NR_MAX_LENGTH)} {RECORD_CREATE_FORM_UI.CHAR_COUNTER_REMAINING})
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
                  {RECORD_CREATE_FORM_UI.FIELD_ATSLĒGVĀRDI}
                </label>

                {/* Keyword Tags */}
                {keywords.length > 0 && (
                  <div className="create-record-nav-keyword-tags">
                    {keywords.map((keyword, index) => (
                      <div key={index} className="create-record-nav-keyword-tag">
                        <span className="keyword-tag-text">{keyword}</span>
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="keyword-tag-remove"
                          title="Noņemt"
                          disabled={isSubmitting}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Keyword Input with Add Button */}
                <div className="create-record-nav-keyword-input-wrapper">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={handleKeywordInputChange}
                    onKeyDown={handleKeywordKeyDown}
                    className={`create-record-nav-input ${getFieldError('key_words') ? 'error' : ''}`}
                    placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_ATSLĒGVĀRDI_SHORT}
                    disabled={isSubmitting}
                  />
                  {keywordInput.trim() && (
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="create-record-nav-keyword-add-btn"
                      disabled={isSubmitting}
                    >
                      Pievienot
                    </button>
                  )}
                </div>
                <FieldError error={getFieldError('key_words')} />
              </div>
            </section>

            {/* Description Section */}
            <section ref={sectionRefs.description} className="create-record-nav-section" id="description">
              <h3 className="create-record-nav-section-header">
                <span className="create-record-nav-section-icon"><i className="fas fa-sticky-note"></i></span>
                {RECORD_CREATE_FORM_UI.SECTION_DESCRIPTION}
              </h3>

              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  {RECORD_CREATE_FORM_UI.FIELD_ANOTĀCIJA}
                  {getRemainingChars(formData.annotation, ANNOTATION_MAX_LENGTH) < 5 && (
                    <span className="char-counter-warning">
                      ({getRemainingChars(formData.annotation, ANNOTATION_MAX_LENGTH)} {RECORD_CREATE_FORM_UI.CHAR_COUNTER_REMAINING})
                    </span>
                  )}
                </label>
                <textarea
                  name="annotation"
                  value={formData.annotation}
                  onChange={handleInputChange}
                  className={`create-record-nav-textarea ${getFieldError('annotation') ? 'error' : ''}`}
                  placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_DOKUMENTA_ANOTĀCIJA}
                  rows="4"
                  maxLength={ANNOTATION_MAX_LENGTH}
                  disabled={isSubmitting}
                />
                <FieldError error={getFieldError('annotation')} />
              </div>

              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  {RECORD_CREATE_FORM_UI.FIELD_PIEZĪMES}
                  {getRemainingChars(formData.notes, NOTES_MAX_LENGTH) < 5 && (
                    <span className="char-counter-warning">
                      ({getRemainingChars(formData.notes, NOTES_MAX_LENGTH)} {RECORD_CREATE_FORM_UI.CHAR_COUNTER_REMAINING})
                    </span>
                  )}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className={`create-record-nav-textarea ${getFieldError('notes') ? 'error' : ''}`}
                  placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_PAPILDUS_PIEZĪMES}
                  rows="3"
                  maxLength={NOTES_MAX_LENGTH}
                  disabled={isSubmitting}
                />
                <FieldError error={getFieldError('notes')} />
              </div>

              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  {RECORD_CREATE_FORM_UI.FIELD_TEHNISKĀ_INFORMĀCIJA}
                  {getRemainingChars(formData.tech_info, TECH_INFO_MAX_LENGTH) < 5 && (
                    <span className="char-counter-warning">
                      ({getRemainingChars(formData.tech_info, TECH_INFO_MAX_LENGTH)} {RECORD_CREATE_FORM_UI.CHAR_COUNTER_REMAINING})
                    </span>
                  )}
                </label>
                <textarea
                  name="tech_info"
                  value={formData.tech_info}
                  onChange={handleInputChange}
                  className={`create-record-nav-textarea ${getFieldError('tech_info') ? 'error' : ''}`}
                  placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_TEHNISKĀS_DETAĻAS}
                  rows="3"
                  maxLength={TECH_INFO_MAX_LENGTH}
                  disabled={isSubmitting}
                />
                <FieldError error={getFieldError('tech_info')} />
              </div>
            </section>

            {/* Access & Security Section */}
            <section ref={sectionRefs.access} className="create-record-nav-section" id="access">
              <h3 className="create-record-nav-section-header">
                <span className="create-record-nav-section-icon"><i className="fas fa-lock"></i></span>
                {RECORD_CREATE_FORM_UI.SECTION_ACCESS}
              </h3>

              <div className="create-record-nav-field">
                <label className="create-record-nav-field-label">
                  {RECORD_CREATE_FORM_UI.FIELD_PIEEJAMĪBA}
                </label>
                <select
                  name="access_restriction"
                  value={formData.access_restriction}
                  onChange={handleInputChange}
                  className={`create-record-nav-select ${getFieldError('access_restriction') ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="">Izvēlieties</option>
                  <option value="open">{RECORD_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA}</option>
                  <option value="closed">{RECORD_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.IEROBEŽOTA}</option>
                </select>
                <FieldError error={getFieldError('access_restriction')} />

                {/* Access Restriction Mismatch Warning */}
                {accessRestrictionWarning && (
                  <div className="create-record-nav-access-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{accessRestrictionWarning}</span>
                  </div>
                )}
              </div>

              {/* Show Ierobežojuma piezīmes for both Vispārēja and Ierobežota */}
              {formData.access_restriction && (
                <div className="create-record-nav-field">
                  <label className="create-record-nav-field-label">
                    {RECORD_CREATE_FORM_UI.FIELD_IEROBEŽOJUMA_PIEZĪMES}
                    {getRemainingChars(formData.access_restriction_notes, ACCESS_RESTRICTION_NOTES_MAX_LENGTH) < 5 && (
                      <span className="char-counter-warning">
                        ({getRemainingChars(formData.access_restriction_notes, ACCESS_RESTRICTION_NOTES_MAX_LENGTH)} {RECORD_CREATE_FORM_UI.CHAR_COUNTER_REMAINING})
                      </span>
                    )}
                  </label>
                  <textarea
                    name="access_restriction_notes"
                    value={formData.access_restriction_notes}
                    onChange={handleInputChange}
                    className={`create-record-nav-textarea ${getFieldError('access_restriction_notes') ? 'error' : ''}`}
                    placeholder={RECORD_CREATE_FORM_UI.PLACEHOLDER_IEROBEŽOJUMA_IEMESLI}
                    rows="3"
                    maxLength={ACCESS_RESTRICTION_NOTES_MAX_LENGTH}
                    disabled={isSubmitting}
                  />
                  <FieldError error={getFieldError('access_restriction_notes')} />
                </div>
              )}

              {/* Only show Ierobežojuma datums and Lietošanas nosacījumi when Ierobežota is selected */}
              {formData.access_restriction === 'closed' && (
                <>
                  <div className="create-record-nav-field">
                    <label className="create-record-nav-field-label create-record-nav-field-label-required">
                      {RECORD_CREATE_FORM_UI.FIELD_IEROBEŽOJUMA_DATUMS}
                    </label>
                    <DatePicker
                      name="access_restriction_date"
                      selected={parseDate(formData.access_restriction_date)}
                      onChange={handleDateFieldChange('access_restriction_date')}
                      dateFormat={DATEPICKER_FORMAT}
                      placeholderText={DATE_PLACEHOLDER}
                      calendarStartDay={1}
                      autoComplete="off"
                      className={`create-record-nav-input ${getFieldError('access_restriction_date') ? 'error' : ''}`}
                      wrapperClassName="create-record-nav-datepicker-wrapper"
                      disabled={isSubmitting}
                      required
                    />
                    <FieldError error={getFieldError('access_restriction_date')} />
                  </div>

                  <div className="create-record-nav-field">
                    <label className="create-record-nav-field-label">
                      {RECORD_CREATE_FORM_UI.FIELD_LIETOTĀJA_IEROBEŽOJUMU_PIEZĪMES}
                      {getRemainingChars(formData.user_restriction_notes, USER_RESTRICTION_NOTES_MAX_LENGTH) < 5 && (
                        <span className="char-counter-warning">
                          ({getRemainingChars(formData.user_restriction_notes, USER_RESTRICTION_NOTES_MAX_LENGTH)} {RECORD_CREATE_FORM_UI.CHAR_COUNTER_REMAINING})
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

            </section>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="create-record-nav-footer">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="create-record-nav-btn create-record-nav-btn-cancel"
          >
            {RECORD_CREATE_FORM_UI.CANCEL_BTN}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isDateOutOfRange}
            className="create-record-nav-btn create-record-nav-btn-primary"
          >
            {isSubmitting ? 'Saglabā...' : 'Saglabāt'}
          </button>
        </div>
      </form>
    </div>
  );

  return ReactDOM.createPortal(modalContent, portalContainer);
});

export default EditDocumentRecord;
