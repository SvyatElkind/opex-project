// src/Record/RecordMetadata.js
// Enhanced metadata management component with full CRUD operations

import React, { useState, useEffect } from 'react';
import { RECORD_UI, RECORD_ERROR_MESSAGES, RECORD_SUCCESS_MESSAGES } from '../Constants/Constants';
import { useAddMetadata, useUpdateMetadata, useDeleteMetadata, useMetadataMethods } from '../hooks/useRecords';
import { validateMetadata, hasValidationErrors } from '../Utils/RecordValidation';
import Utils from '../Utils/Utils';
import './RecordMetadata.css';

const RecordMetadata = ({ recordData, projectId, recordId }) => {
    const utils = Utils();
    
    // API hooks
    const addMetadataMutation = useAddMetadata();
    const updateMetadataMutation = useUpdateMetadata();
    const deleteMetadataMutation = useDeleteMetadata();
    const { data: availableMethods, isLoading: methodsLoading } = useMetadataMethods(projectId, recordId);
    
    // Local state
    const [activeSection, setActiveSection] = useState('actions');
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItemData, setNewItemData] = useState({});
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [expandedItems, setExpandedItems] = useState(new Set());

    // Clear messages after timeout
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Metadata sections configuration
    const metadataSections = {
        actions: {
            title: 'Darbības',
            icon: '⚡',
            color: '#007bff',
            data: recordData?.actions || [],
            fields: [
                { key: 'author', label: 'Autors', type: 'text', required: true, maxLength: 50 },
                { key: 'responsible_person', label: 'Atbildīgā persona', type: 'text', required: true, maxLength: 50 },
                { key: 'task', label: 'Uzdevums', type: 'textarea', required: true, maxLength: 200 },
                { key: 'due_date', label: 'Izpildes datums', type: 'date', required: true },
                { key: 'created_date', label: 'Izveidošanas datums', type: 'date', required: true },
                { key: 'notes', label: 'Piezīmes', type: 'textarea', required: false, maxLength: 200 }
            ],
            emptyText: 'Nav pievienotu darbību. Pievienojiet darbības, lai izsekotu ieraksta dzīves ciklam.'
        },
        addressees: {
            title: 'Adresāti',
            icon: '👥',
            color: '#28a745',
            data: recordData?.addressees || [],
            fields: [
                { key: 'addressee', label: 'Adresāts', type: 'text', required: true, maxLength: 200, 
                  placeholder: 'Vārds, uzvārds vai organizācijas nosaukums' }
            ],
            emptyText: 'Nav norādīti adresāti. Pievienojiet personas vai organizācijas, kurām adresēts šis ieraksts.'
        },
        read_status: {
            title: 'Lasīšanas statuss',
            icon: '👁️',
            color: '#6f42c1',
            data: recordData?.read_status || [],
            fields: [
                { key: 'reader', label: 'Lasītājs', type: 'text', required: true, maxLength: 50 },
                { key: 'read_date', label: 'Lasīšanas datums', type: 'date', required: true },
                { key: 'status', label: 'Statuss', type: 'select', required: true, options: [
                    { value: 'read', label: 'Izlasīts' },
                    { value: 'reviewed', label: 'Pārskatīts' },
                    { value: 'approved', label: 'Apstiprināts' },
                    { value: 'rejected', label: 'Noraidīts' },
                    { value: 'pending', label: 'Gaida' }
                ]}
            ],
            emptyText: 'Nav reģistrēts lasīšanas statuss. Pievienojiet informāciju par to, kas un kad ir lasījis šo ierakstu.'
        }
    };

    // Get current section
    const currentSection = metadataSections[activeSection];

    // Initialize form data for new item
    const initializeNewItemData = (sectionKey) => {
        const section = metadataSections[sectionKey];
        const initialData = {};
        
        section.fields.forEach(field => {
            if (field.type === 'date' && field.key.includes('created')) {
                initialData[field.key] = utils.formatDate(new Date());
            } else if (field.type === 'select' && field.options && field.options.length > 0) {
                initialData[field.key] = field.options[0].value;
            } else {
                initialData[field.key] = '';
            }
        });
        
        return initialData;
    };

    // Handle section change
    const handleSectionChange = (sectionKey) => {
        setActiveSection(sectionKey);
        setIsAdding(false);
        setEditingItem(null);
        setErrors({});
        setNewItemData({});
    };

    // Handle add new item
    const handleAddNew = () => {
        setIsAdding(true);
        setEditingItem(null);
        setNewItemData(initializeNewItemData(activeSection));
        setErrors({});
    };

    // Handle edit item
    const handleEdit = (item, index) => {
        setEditingItem({ ...item, index });
        setIsAdding(false);
        setNewItemData({ ...item });
        setErrors({});
    };

    // Handle cancel
    const handleCancel = () => {
        setIsAdding(false);
        setEditingItem(null);
        setNewItemData({});
        setErrors({});
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItemData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear field error
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Handle form submit (add or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate data
        const validationErrors = validateMetadata(newItemData, activeSection);
        
        if (hasValidationErrors(validationErrors)) {
            setErrors(validationErrors);
            return;
        }

        try {
            if (editingItem) {
                // Update existing item
                await updateMetadataMutation.mutateAsync({
                    projectId,
                    recordId,
                    metadataClass: activeSection,
                    metadataId: editingItem.id,
                    metadataData: newItemData
                });
                setSuccessMessage(RECORD_SUCCESS_MESSAGES.METADATA_UPDATED);
            } else {
                // Add new item
                await addMetadataMutation.mutateAsync({
                    projectId,
                    recordId,
                    metadataClass: activeSection,
                    metadataData: newItemData
                });
                setSuccessMessage(RECORD_SUCCESS_MESSAGES.METADATA_ADDED);
            }
            
            // Reset form
            handleCancel();
            
        } catch (error) {
            console.error('Metadata operation error:', error);
            setErrors({ general: [error.message || 'Neizdevās saglabāt metadatus'] });
        }
    };

    // Handle delete item
    const handleDelete = async (item) => {
        if (!window.confirm(`Vai tiešām vēlaties dzēst šo ${currentSection.title.toLowerCase().slice(0, -1)}u?`)) {
            return;
        }

        try {
            await deleteMetadataMutation.mutateAsync({
                projectId,
                recordId,
                metadataClass: activeSection,
                metadataId: item.id
            });
            
            setSuccessMessage(RECORD_SUCCESS_MESSAGES.METADATA_DELETED);
            
        } catch (error) {
            console.error('Delete error:', error);
            setErrors({ general: [error.message || 'Neizdevās dzēst metadatus'] });
        }
    };

    // Toggle item expansion
    const toggleItemExpansion = (itemId) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    // Render form field
    const renderField = (field) => {
        const fieldValue = newItemData[field.key] || '';
        const fieldErrors = errors[field.key] || [];
        const hasError = fieldErrors.length > 0;

        return (
            <div key={field.key} className="metadata-field">
                <label htmlFor={field.key} className={field.required ? 'required' : ''}>
                    {field.label}:
                    {field.required && <span className="required-asterisk">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                    <textarea
                        id={field.key}
                        name={field.key}
                        value={fieldValue}
                        onChange={handleInputChange}
                        className={hasError ? 'error' : ''}
                        placeholder={field.placeholder || `Ievadiet ${field.label.toLowerCase()}...`}
                        maxLength={field.maxLength}
                        rows={3}
                    />
                ) : field.type === 'select' ? (
                    <select
                        id={field.key}
                        name={field.key}
                        value={fieldValue}
                        onChange={handleInputChange}
                        className={hasError ? 'error' : ''}
                    >
                        {field.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={field.type}
                        id={field.key}
                        name={field.key}
                        value={fieldValue}
                        onChange={handleInputChange}
                        className={hasError ? 'error' : ''}
                        placeholder={field.placeholder || `Ievadiet ${field.label.toLowerCase()}...`}
                        maxLength={field.maxLength}
                    />
                )}
                
                {hasError && (
                    <div className="field-error">
                        {fieldErrors.join(', ')}
                    </div>
                )}
                
                {field.maxLength && (
                    <div className="field-counter">
                        {fieldValue.length} / {field.maxLength}
                    </div>
                )}
            </div>
        );
    };

    // Render metadata item
    const renderMetadataItem = (item, index) => {
        const isExpanded = expandedItems.has(item.id);
        
        return (
            <div key={item.id || index} className="metadata-item">
                <div className="item-header" onClick={() => toggleItemExpansion(item.id)}>
                    <div className="item-summary">
                        <div className="item-title">
                            {getItemTitle(item, activeSection)}
                        </div>
                        <div className="item-subtitle">
                            {getItemSubtitle(item, activeSection)}
                        </div>
                    </div>
                    <div className="item-actions">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item, index);
                            }}
                            className="action-btn edit-btn"
                            title="Labot"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item);
                            }}
                            className="action-btn delete-btn"
                            title="Dzēst"
                        >
                            🗑️
                        </button>
                        <button className="expand-btn" title={isExpanded ? 'Sakļaut' : 'Izvērst'}>
                            {isExpanded ? '▼' : '▶'}
                        </button>
                    </div>
                </div>
                
                {isExpanded && (
                    <div className="item-details">
                        {renderItemDetails(item, activeSection)}
                    </div>
                )}
            </div>
        );
    };

    // Get item title based on section
    const getItemTitle = (item, sectionKey) => {
        switch (sectionKey) {
            case 'actions':
                return item.task || 'Bez nosaukuma';
            case 'addressees':
                return item.addressee || 'Bez nosaukuma';
            case 'read_status':
                return item.reader || 'Nezināms lasītājs';
            default:
                return 'Metadata ieraksts';
        }
    };

    // Get item subtitle based on section
    const getItemSubtitle = (item, sectionKey) => {
        switch (sectionKey) {
            case 'actions':
                return `Autors: ${item.author || 'Nav norādīts'} • Termiņš: ${item.due_date ? utils.formatDate(new Date(item.due_date)) : 'Nav norādīts'}`;
            case 'addressees':
                return `Pievienots: ${item.created_at ? utils.formatDate(new Date(item.created_at)) : 'Nezināms datums'}`;
            case 'read_status':
                return `Statuss: ${getStatusLabel(item.status)} • Datums: ${item.read_date ? utils.formatDate(new Date(item.read_date)) : 'Nav norādīts'}`;
            default:
                return '';
        }
    };

    // Get status label
    const getStatusLabel = (status) => {
        const statusMap = {
            'read': 'Izlasīts',
            'reviewed': 'Pārskatīts',
            'approved': 'Apstiprināts',
            'rejected': 'Noraidīts',
            'pending': 'Gaida'
        };
        return statusMap[status] || status;
    };

    // Render item details
    const renderItemDetails = (item, sectionKey) => {
        const section = metadataSections[sectionKey];
        
        return (
            <div className="details-grid">
                {section.fields.map(field => {
                    let value = item[field.key];
                    
                    // Format value based on field type
                    if (field.type === 'date' && value) {
                        value = utils.formatDate(new Date(value));
                    } else if (field.type === 'select' && field.options) {
                        const option = field.options.find(opt => opt.value === value);
                        value = option ? option.label : value;
                    }
                    
                    if (!value) return null;
                    
                    return (
                        <div key={field.key} className="detail-row">
                            <span className="detail-label">{field.label}:</span>
                            <span className="detail-value">{value}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="record-metadata">
            {/* Success Message */}
            {successMessage && (
                <div className="success-message">
                    <div className="success-icon">✓</div>
                    <span>{successMessage}</span>
                </div>
            )}

            {/* General Errors */}
            {errors.general && (
                <div className="error-message-banner">
                    <div className="error-icon">⚠</div>
                    <span>{errors.general.join(', ')}</span>
                </div>
            )}

            {/* Section Tabs */}
            <div className="metadata-tabs">
                {Object.keys(metadataSections).map(sectionKey => {
                    const section = metadataSections[sectionKey];
                    const isActive = activeSection === sectionKey;
                    const itemCount = section.data.length;
                    
                    return (
                        <button
                            key={sectionKey}
                            onClick={() => handleSectionChange(sectionKey)}
                            className={`metadata-tab ${isActive ? 'active' : ''}`}
                            style={{ '--tab-color': section.color }}
                        >
                            <span className="tab-icon">{section.icon}</span>
                            <span className="tab-title">{section.title}</span>
                            {itemCount > 0 && (
                                <span className="tab-badge">{itemCount}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Section Content */}
            <div className="metadata-content">
                <div className="section-header">
                    <div className="section-info">
                        <h3 style={{ color: currentSection.color }}>
                            {currentSection.icon} {currentSection.title}
                        </h3>
                        <p className="section-count">
                            {currentSection.data.length === 0 
                                ? 'Nav ierakstu' 
                                : `${currentSection.data.length} ierakst${currentSection.data.length === 1 ? 's' : 'i'}`
                            }
                        </p>
                    </div>
                    
                    {!isAdding && !editingItem && (
                        <button
                            onClick={handleAddNew}
                            className="add-btn"
                            style={{ backgroundColor: currentSection.color }}
                        >
                            <span className="add-icon">+</span>
                            Pievienot
                        </button>
                    )}
                </div>

                {/* Add/Edit Form */}
                {(isAdding || editingItem) && (
                    <div className="metadata-form">
                        <div className="form-header">
                            <h4>
                                {editingItem ? 'Labot' : 'Pievienot'} {currentSection.title.slice(0, -1)}u
                            </h4>
                        </div>
                        <form onSubmit={handleSubmit} className="form-content">
                            <div className="form-grid">
                                {currentSection.fields.map(renderField)}
                            </div>
                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={addMetadataMutation.isPending || updateMetadataMutation.isPending}
                                >
                                    {addMetadataMutation.isPending || updateMetadataMutation.isPending 
                                        ? 'Saglabā...' : 'Saglabāt'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleCancel}
                                    className="btn btn-cancel"
                                >
                                    Atcelt
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Metadata Items List */}
                <div className="metadata-items">
                    {currentSection.data.length > 0 ? (
                        currentSection.data.map((item, index) => renderMetadataItem(item, index))
                    ) : (
                        <div className="no-metadata">
                            <div className="no-metadata-icon" style={{ color: currentSection.color }}>
                                {currentSection.icon}
                            </div>
                            <h4>Nav {currentSection.title.toLowerCase()}</h4>
                            <p>{currentSection.emptyText}</p>
                            {!isAdding && !editingItem && (
                                <button
                                    onClick={handleAddNew}
                                    className="empty-state-btn"
                                    style={{ borderColor: currentSection.color, color: currentSection.color }}
                                >
                                    Pievienot {currentSection.title.slice(0, -1)}u
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordMetadata;