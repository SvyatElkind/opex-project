// src/Record/RecordMetadata.js
// Modern metadata management component with full CRUD operations

import React, { useState } from 'react';
import { useCreateMetadata, useUpdateMetadata, useDeleteMetadata } from '../hooks/useMetadata';
import './RecordMetadata.css';

const RecordMetadata = ({ recordId, projectId, recordData }) => {
    // Mutations
    const createMetadataMutation = useCreateMetadata();
    const updateMetadataMutation = useUpdateMetadata();
    const deleteMetadataMutation = useDeleteMetadata();

    // State for active section and forms
    const [activeSection, setActiveSection] = useState('actions');
    const [editingItem, setEditingItem] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    // Extract metadata from recordData
    const actions = recordData?.actions || [];
    const addressees = recordData?.addressees || [];
    const visas = recordData?.visas || [];
    const readStatuses = recordData?.read_status || [];

    // Section configuration
    const sections = [
        {
            key: 'actions',
            label: 'Darbības',
            icon: 'fa-tasks',
            count: actions.length,
            data: actions,
            fields: [
                { name: 'author', label: 'Autors', type: 'text', required: true },
                { name: 'responsible_person', label: 'Atbildīgā persona', type: 'text', required: true },
                { name: 'task', label: 'Uzdevums', type: 'text', required: true },
                { name: 'due_date', label: 'Termiņš', type: 'date', required: true },
                { name: 'created_date', label: 'Izveidošanas datums', type: 'date', required: true },
                { name: 'notes', label: 'Piezīmes', type: 'textarea', required: false }
            ]
        },
        {
            key: 'addressees',
            label: 'Adresāti',
            icon: 'fa-user',
            count: addressees.length,
            data: addressees,
            fields: [
                { name: 'addressee', label: 'Adresāts', type: 'text', required: true }
            ]
        },
        {
            key: 'visas',
            label: 'Vīzas',
            icon: 'fa-stamp',
            count: visas.length,
            data: visas,
            fields: [
                { name: 'person', label: 'Persona', type: 'text', required: true },
                { name: 'date', label: 'Datums', type: 'date', required: true },
                { name: 'notes', label: 'Piezīmes', type: 'textarea', required: false }
            ]
        },
        {
            key: 'read_status',
            label: 'Lasīšanas statuss',
            icon: 'fa-eye',
            count: readStatuses.length,
            data: readStatuses,
            fields: [
                { name: 'person', label: 'Persona', type: 'text', required: true },
                { name: 'date', label: 'Datums', type: 'date', required: true },
                { name: 'notes', label: 'Piezīmes', type: 'textarea', required: false }
            ]
        }
    ];

    const currentSection = sections.find(s => s.key === activeSection);

    // Form handling
    const handleFieldChange = (fieldName, value) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        currentSection.fields.forEach(field => {
            if (field.required && !formData[field.name]?.trim()) {
                newErrors[field.name] = `${field.label} ir obligāts`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreate = () => {
        setIsCreating(true);
        setEditingItem(null);
        setFormData({});
        setErrors({});
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsCreating(false);
        setFormData({ ...item });
        setErrors({});
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingItem(null);
        setFormData({});
        setErrors({});
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            if (isCreating) {
                // Create new metadata
                await createMetadataMutation.mutateAsync({
                    projectId,
                    recordId,
                    metadataType: activeSection,
                    data: formData
                });
            } else if (editingItem) {
                // Update existing metadata
                await updateMetadataMutation.mutateAsync({
                    projectId,
                    recordId,
                    metadataType: activeSection,
                    metadataId: editingItem.id,
                    data: formData
                });
            }
            handleCancel();
        } catch (error) {
            console.error('Save error:', error);
            setErrors({ _form: error.message || 'Kļūda saglabājot datus' });
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm('Vai tiešām vēlaties dzēst šo ierakstu?')) return;

        try {
            await deleteMetadataMutation.mutateAsync({
                projectId,
                recordId,
                metadataType: activeSection,
                metadataId: item.id
            });
        } catch (error) {
            console.error('Delete error:', error);
            alert('Kļūda dzēšot: ' + error.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('lv-LV');
        } catch {
            return dateString;
        }
    };

    const isLoading = createMetadataMutation.isPending || 
                     updateMetadataMutation.isPending || 
                     deleteMetadataMutation.isPending;

    return (
        <div className="record-metadata-container">
            {/* Section Tabs */}
            <div className="metadata-sections">
                {sections.map(section => (
                    <button
                        key={section.key}
                        className={`metadata-section-btn ${activeSection === section.key ? 'active' : ''}`}
                        onClick={() => {
                            setActiveSection(section.key);
                            handleCancel();
                        }}
                    >
                        <i className={`fas ${section.icon}`}></i>
                        <span>{section.label}</span>
                        {section.count > 0 && (
                            <span className="metadata-count-badge">{section.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="metadata-content">
                {/* Header with Create Button */}
                <div className="metadata-header">
                    <h3>{currentSection.label}</h3>
                    {!isCreating && !editingItem && (
                        <button 
                            onClick={handleCreate} 
                            className="btn-metadata btn-metadata-create"
                            disabled={isLoading}
                        >
                            <i className="fas fa-plus"></i>
                            Pievienot
                        </button>
                    )}
                </div>

                {/* Form for Create/Edit */}
                {(isCreating || editingItem) && (
                    <div className="metadata-form">
                        <h4>{isCreating ? 'Jauns ieraksts' : 'Rediģēt ierakstu'}</h4>
                        
                        {errors._form && (
                            <div className="metadata-error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors._form}
                            </div>
                        )}

                        <div className="metadata-form-fields">
                            {currentSection.fields.map(field => (
                                <div key={field.name} className="metadata-field">
                                    <label className="metadata-field-label">
                                        {field.label}
                                        {field.required && <span className="required">*</span>}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                            className={`metadata-field-input ${errors[field.name] ? 'error' : ''}`}
                                            rows={3}
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                            className={`metadata-field-input ${errors[field.name] ? 'error' : ''}`}
                                        />
                                    )}
                                    {errors[field.name] && (
                                        <span className="metadata-field-error">{errors[field.name]}</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="metadata-form-actions">
                            <button 
                                onClick={handleSave} 
                                className="btn-metadata btn-metadata-save"
                                disabled={isLoading}
                            >
                                <i className="fas fa-save"></i>
                                Saglabāt
                            </button>
                            <button 
                                onClick={handleCancel} 
                                className="btn-metadata btn-metadata-cancel"
                                disabled={isLoading}
                            >
                                <i className="fas fa-times"></i>
                                Atcelt
                            </button>
                        </div>
                    </div>
                )}

                {/* Data List */}
                <div className="metadata-list">
                    {currentSection.data.length === 0 ? (
                        <div className="metadata-empty">
                            <i className={`fas ${currentSection.icon} metadata-empty-icon`}></i>
                            <p>Nav pievienotu {currentSection.label.toLowerCase()}</p>
                        </div>
                    ) : (
                        <div className="metadata-cards">
                            {currentSection.data.map(item => (
                                <div key={item.id} className="metadata-card">
                                    <div className="metadata-card-content">
                                        {currentSection.fields.map(field => (
                                            field.name in item && item[field.name] && (
                                                <div key={field.name} className="metadata-card-field">
                                                    <span className="metadata-card-label">{field.label}:</span>
                                                    <span className="metadata-card-value">
                                                        {field.type === 'date' ? formatDate(item[field.name]) : item[field.name]}
                                                    </span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                    <div className="metadata-card-actions">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="metadata-card-btn metadata-card-btn-edit"
                                            disabled={isLoading}
                                            title="Rediģēt"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="metadata-card-btn metadata-card-btn-delete"
                                            disabled={isLoading}
                                            title="Dzēst"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordMetadata;