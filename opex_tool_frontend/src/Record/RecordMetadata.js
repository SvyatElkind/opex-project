import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { parseDate, formatDate, DATEPICKER_FORMAT, DATE_PLACEHOLDER } from '../Utils/DateFormatter';
import { useCreateMetadata, useUpdateMetadata, useDeleteMetadata } from '../hooks/useMetadata';
import { useNotification } from '../components/Notification';
import './RecordMetadata.css';

const RecordMetadata = ({ recordId, projectId, recordData, activeSection, onSectionChange }) => {
    // Mutations
    const createMetadataMutation = useCreateMetadata();
    const updateMetadataMutation = useUpdateMetadata();
    const { notify, showConfirm } = useNotification();
    const deleteMetadataMutation = useDeleteMetadata();

    // State for forms
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
            setErrors({ _form: error.message || 'Kļūda saglabājot datus' });
        }
    };

    const handleDelete = async (item) => {
        const ok = await showConfirm({
            title: 'Dzēst dokumentu?',
            message: 'Vai tiešām vēlaties dzēst šo dokumentu?',
            confirmText: 'Dzēst',
            variant: 'danger'
        });
        if (!ok) return;

        try {
            await deleteMetadataMutation.mutateAsync({
                projectId,
                recordId,
                metadataType: activeSection,
                metadataId: item.id
            });
        } catch (error) {
            notify.error('Kļūda dzēšot: ' + error.message);
        }
    };

    const formatDisplayDate = (dateString) => {
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

    // Render form as a card
    const renderFormCard = () => (
        <div className="metadata-card metadata-card-form">
            <div className="metadata-card-content">
                {errors._form && (
                    <div className="metadata-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors._form}
                    </div>
                )}
                {currentSection.fields.map(field => {
                    const cls = `metadata-card-input ${errors[field.name] ? 'error' : ''}`;
                    const value = formData[field.name] || '';
                    let control;
                    if (field.type === 'textarea') {
                        control = (
                            <textarea
                                value={value}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                className={cls}
                                rows={2}
                                disabled={isLoading}
                            />
                        );
                    } else if (field.type === 'date') {
                        control = (
                            <DatePicker
                                name={field.name}
                                selected={parseDate(value)}
                                onChange={(date) => handleFieldChange(field.name, formatDate(date, 'YYYY-MM-DD'))}
                                dateFormat={DATEPICKER_FORMAT}
                                placeholderText={DATE_PLACEHOLDER}
                                calendarStartDay={1}
                                autoComplete="off"
                                className={cls}
                                wrapperClassName="metadata-card-datepicker-wrapper"
                                disabled={isLoading}
                            />
                        );
                    } else {
                        control = (
                            <input
                                type={field.type}
                                value={value}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                className={cls}
                                disabled={isLoading}
                            />
                        );
                    }
                    return (
                        <div key={field.name} className="metadata-card-field metadata-card-field-input">
                            <span className="metadata-card-label">
                                {field.label}
                                {field.required && <span className="required">*</span>}
                            </span>
                            {control}
                            {errors[field.name] && (
                                <span className="metadata-field-error">{errors[field.name]}</span>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="metadata-card-actions">
                <button
                    onClick={handleSave}
                    className="metadata-card-btn metadata-card-btn-save"
                    disabled={isLoading}
                    title="Saglabāt"
                >
                    <i className="fas fa-check"></i>
                </button>
                <button
                    onClick={handleCancel}
                    className="metadata-card-btn metadata-card-btn-cancel"
                    disabled={isLoading}
                    title="Atcelt"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>
    );

    return (
        <div className="record-metadata-container">
            {/* Content Area */}
            <div className="metadata-content">
                {/* Data List */}
                <div className="metadata-list">
                    {currentSection.data.length === 0 && !isCreating ? (
                        <div className="metadata-empty">
                            <i className={`fas ${currentSection.icon} metadata-empty-icon`}></i>
                            <p>Nav pievienotu {currentSection.label.toLowerCase()}</p>
                            <button
                                onClick={handleCreate}
                                className="btn-metadata btn-metadata-create-empty"
                                disabled={isLoading}
                            >
                                Pievienot
                            </button>
                        </div>
                    ) : (
                        <div className="metadata-cards">
                            {/* Form Card - when creating new */}
                            {isCreating && renderFormCard()}

                            {/* Add Button Card - when not creating/editing */}
                            {!isCreating && !editingItem && currentSection.data.length > 0 && (
                                <div className="metadata-card metadata-card-add" onClick={handleCreate}>
                                    <div className="metadata-card-add-icon">
                                        <i className="fas fa-plus"></i>
                                    </div>
                                    <div className="metadata-card-add-text">
                                        <span>Pievienot</span>
                                    </div>
                                </div>
                            )}

                            {currentSection.data.map(item => (
                                editingItem?.id === item.id ? (
                                    // Render form in place of the card being edited
                                    <React.Fragment key={item.id}>
                                        {renderFormCard()}
                                    </React.Fragment>
                                ) : (
                                    <div key={item.id} className="metadata-card">
                                        <div className="metadata-card-content">
                                            {currentSection.fields.map(field => (
                                                field.name in item && item[field.name] && (
                                                    <div key={field.name} className="metadata-card-field">
                                                        <span className="metadata-card-label">{field.label}</span>
                                                        <span className="metadata-card-value">
                                                            {field.type === 'date' ? formatDisplayDate(item[field.name]) : item[field.name]}
                                                        </span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                        <div className="metadata-card-actions">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="metadata-card-btn metadata-card-btn-edit"
                                                disabled={isLoading || isCreating}
                                                title="Rediģēt"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="metadata-card-btn metadata-card-btn-delete"
                                                disabled={isLoading || isCreating}
                                                title="Dzēst"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordMetadata;