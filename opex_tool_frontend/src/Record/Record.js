// src/Record/Record.js
// Updated main record component with enhanced tabbed interface

import React, { useState, useEffect } from 'react';
import RecordMetadata from './RecordMetadata';
import RecordFiles from './RecordFiles';
import MediaRecordForm from './MediaRecordForm';
import { RECORD_UI, RECORD_ERROR_MESSAGES, RECORD_SUCCESS_MESSAGES } from '../Constants/Constants';
import { useRecord, useUpdateRecord, useDeleteRecord, useUpdateMediaRecord } from '../hooks/useRecords';
import { useNavigation } from '../Navigation/context/NavigationContext';
import { validateRecordForm, hasValidationErrors } from '../Utils/RecordValidation';
import InheritanceUtils from '../Utils/InheritanceUtils';
import Utils from '../Utils/Utils';
import './Record.css';
import './RecordForm.css';

const Record = ({ recordId, projectId, itemId, inventory, onBack }) => {
    const utils = Utils();
    
    // Get record data
    const { data: recordData, isLoading, error } = useRecord(projectId, recordId);
    const updateRecordMutation = useUpdateRecord();
    const updateMediaRecordMutation = useUpdateMediaRecord();
    const deleteRecordMutation = useDeleteRecord();
    
    // Navigation context
    const { navigateTo } = useNavigation();
    
    // Get inheritance info
    const inheritanceInfo = inventory ? InheritanceUtils.getInheritanceInfo(inventory) : {
        isTextual: true,
        isMedia: false,
        type: 'Tekstuāls',
        icon: '📄',
        color: '#007bff'
    };
    
    // Local state
    const [activeTab, setActiveTab] = useState('details');
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize edit form when record data is loaded
    useEffect(() => {
        if (recordData) {
            setEditFormData({
                title: recordData.title || '',
                date: recordData.date || '',
                created_date: recordData.created_date || '',
                sent_date: recordData.sent_date || '',
                language: recordData.language || 'Latviešu',
                annotation: recordData.annotation || '',
                key_words: recordData.key_words || '',
                reg_nr: recordData.reg_nr || '',
                sent_reg_nr: recordData.sent_reg_nr || '',
                group: recordData.group || '',
                nomenclature_nr: recordData.nomenclature_nr || '',
                notes: recordData.notes || '',
                access_restriction: recordData.access_restriction || 'open',
                access_restriction_notes: recordData.access_restriction_notes || '',
                access_restriction_date: recordData.access_restriction_date || '',
                user_restriction_notes: recordData.user_restriction_notes || '',
                tech_info: recordData.tech_info || '',
                format: recordData.format || '',
                
                // Media-specific fields
                duration: recordData.duration || '',
                color: recordData.color || '',
                horizontal_resolution: recordData.horizontal_resolution || '',
                vertical_resolution: recordData.vertical_resolution || ''
            });
        }
    }, [recordData]);

    // Clear messages after timeout
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // Tab configuration based on record type
    const getTabsConfig = () => {
        const baseTabs = [
            {
                key: 'details',
                label: RECORD_UI.DETAILS,
                icon: '📋',
                color: '#007bff'
            }
        ];

        // Only add metadata and files tabs for textual records
        if (inheritanceInfo.isTextual) {
            baseTabs.push(
                {
                    key: 'metadata',
                    label: RECORD_UI.METADATA,
                    icon: '🏷️',
                    color: '#28a745',
                    badge: getMetadataCount()
                },
                {
                    key: 'files',
                    label: RECORD_UI.FILES,
                    icon: '📎',
                    color: '#6f42c1',
                    badge: recordData?.files?.length || 0
                }
            );
        } else {
            // For media records, only show files tab
            baseTabs.push({
                key: 'files',
                label: RECORD_UI.FILES,
                icon: '📎',
                color: '#6f42c1',
                badge: recordData?.files?.length || 0
            });
        }

        return baseTabs;
    };

    // Get metadata count for badge
    const getMetadataCount = () => {
        if (!recordData) return 0;
        
        const actionCount = recordData.actions?.length || 0;
        const addresseeCount = recordData.addressees?.length || 0;
        const readStatusCount = recordData.read_status?.length || 0;
        
        return actionCount + addresseeCount + readStatusCount;
    };

    // Handle input change in edit form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear field validation error
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Handle edit mode toggle
    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel edit
            setIsEditing(false);
            setValidationErrors({});
            setEditFormData({});
        } else {
            // Start edit
            setIsEditing(true);
        }
    };

    // Handle save edit
    const handleSaveEdit = async (formData) => {
        setIsSubmitting(true);
        setValidationErrors({});
        setErrorMessage('');

        try {
            // Validate form data
            const errors = validateRecordForm(formData, inheritanceInfo.type.toLowerCase());
            
            if (hasValidationErrors(errors)) {
                setValidationErrors(errors);
                setIsSubmitting(false);
                return;
            }

            // Determine which mutation to use based on record type
            const mutation = inheritanceInfo.isMedia ? updateMediaRecordMutation : updateRecordMutation;
            
            await mutation.mutateAsync({
                recordData: formData,
                projectId,
                recordId
            });

            setSuccessMessage(RECORD_SUCCESS_MESSAGES.RECORD_UPDATED);
            setIsEditing(false);
            
        } catch (error) {
            console.error('Failed to update record:', error);
            setErrorMessage(error.message || RECORD_ERROR_MESSAGES.UPDATE_FAILED);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle record deletion
    const handleDeleteRecord = async () => {
        if (!window.confirm('Vai tiešām vēlaties dzēst šo ierakstu? Šī darbība ir neatgriezeniska.')) {
            return;
        }

        try {
            await deleteRecordMutation.mutateAsync({
                projectId,
                recordId
            });
            
            setSuccessMessage(RECORD_SUCCESS_MESSAGES.RECORD_DELETED);
            
            // Navigate back after deletion
            setTimeout(() => {
                onBack();
            }, 1500);
            
        } catch (error) {
            console.error('Failed to delete record:', error);
            setErrorMessage(error.message || RECORD_ERROR_MESSAGES.DELETE_FAILED);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('lv-LV');
        } catch {
            return dateString;
        }
    };

    // Get record type display name
    const getRecordTypeDisplay = () => {
        if (inheritanceInfo.isMedia) {
            return `${inheritanceInfo.type} ieraksts`;
        }
        return 'Tekstuāls ieraksts';
    };

    // Get validation status
    const getValidationStatus = () => {
        if (inheritanceInfo.isMedia && recordData?.validated !== undefined) {
            return recordData.validated ? 'Validēts' : 'Nav validēts';
        }
        return null;
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="record-loading">
                <div className="loading-spinner"></div>
                <p>Ielādē ieraksta datus...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="record-error">
                <div className="error-icon">⚠️</div>
                <h3>Kļūda ielādējot ierakstu</h3>
                <p>{error.message || 'Neizdevās ielādēt ieraksta datus'}</p>
                <button onClick={onBack} className="btn btn-secondary">
                    Atgriezties
                </button>
            </div>
        );
    }

    // Render record not found
    if (!recordData) {
        return (
            <div className="record-not-found">
                <div className="not-found-icon">🔍</div>
                <h3>Ieraksts nav atrasts</h3>
                <p>Pieprasītais ieraksts netika atrasts vai jums nav pieejas tiesību.</p>
                <button onClick={onBack} className="btn btn-secondary">
                    Atgriezties
                </button>
            </div>
        );
    }

    const tabsConfig = getTabsConfig();

    return (
        <div className="record-detail">
            {/* Success/Error Messages */}
            {successMessage && (
                <div className="success-banner">
                    <div className="success-icon">✓</div>
                    <span>{successMessage}</span>
                </div>
            )}
            
            {errorMessage && (
                <div className="error-banner">
                    <div className="error-icon">⚠</div>
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Header */}
            <div className="record-header">
                <div className="header-main">
                    <button 
                        onClick={onBack}
                        className="back-btn"
                        title="Atgriezties"
                    >
                        ← 
                    </button>
                    
                    <div className="record-info">
                        <div className="record-title-section">
                            <div className="record-type" style={{ color: inheritanceInfo.color }}>
                                <span className="type-icon">{inheritanceInfo.icon}</span>
                                <span className="type-text">{getRecordTypeDisplay()}</span>
                            </div>
                            <h1 className="record-title">
                                {recordData.title || 'Nav nosaukuma'}
                            </h1>
                            {recordData.reg_nr && (
                                <div className="record-id">Reģ. Nr.: {recordData.reg_nr}</div>
                            )}
                        </div>
                        
                        <div className="record-meta">
                            <div className="meta-item">
                                <span className="meta-label">Datums:</span>
                                <span className="meta-value">
                                    {formatDate(recordData.date) || 'Nav norādīts'}
                                </span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Valoda:</span>
                                <span className="meta-value">{recordData.language || 'Nav norādīta'}</span>
                            </div>
                            {getValidationStatus() && (
                                <div className="meta-item">
                                    <span className="meta-label">Statuss:</span>
                                    <span className={`meta-value status ${recordData.validated ? 'validated' : 'not-validated'}`}>
                                        {getValidationStatus()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="header-actions">
                    <button
                        onClick={handleEditToggle}
                        className={`btn ${isEditing ? 'btn-cancel' : 'btn-primary'}`}
                        disabled={isSubmitting}
                    >
                        {isEditing ? RECORD_UI.CANCEL : RECORD_UI.EDIT_RECORD}
                    </button>
                    
                    <button
                        onClick={handleDeleteRecord}
                        className="btn btn-danger"
                        disabled={deleteRecordMutation.isPending || isSubmitting}
                    >
                        {deleteRecordMutation.isPending ? 'Dzēš...' : RECORD_UI.DELETE_RECORD}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="record-tabs">
                {tabsConfig.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`record-tab ${activeTab === tab.key ? 'active' : ''}`}
                        style={{ '--tab-color': tab.color }}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                        {tab.badge > 0 && (
                            <span className="tab-badge">{tab.badge}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="record-content">
                {activeTab === 'details' && (
                    <div className="details-tab">
                        {isEditing ? (
                            <div className="edit-form-container">
                                <MediaRecordForm
                                    mediaType={inheritanceInfo.type.toLowerCase()}
                                    onSubmit={handleSaveEdit}
                                    onCancel={handleEditToggle}
                                    initialData={editFormData}
                                    isEditing={true}
                                    isSubmitting={isSubmitting}
                                />
                                {hasValidationErrors(validationErrors) && (
                                    <div className="validation-errors">
                                        <h4>Kļūdas formā:</h4>
                                        <ul>
                                            {Object.entries(validationErrors).map(([field, errors]) => (
                                                <li key={field}>
                                                    <strong>{field}:</strong> {errors.join(', ')}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="record-details-view">
                                {/* Basic Information */}
                                <div className="details-section">
                                    <h3 className="section-title">Pamatinformācija</h3>
                                    <div className="details-grid">
                                        <div className="detail-row">
                                            <span className="label">Nosaukums:</span>
                                            <span className="value">{recordData.title || 'Nav norādīts'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Datums:</span>
                                            <span className="value">{formatDate(recordData.date) || 'Nav norādīts'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Izveidošanas datums:</span>
                                            <span className="value">{formatDate(recordData.created_date) || 'Nav norādīts'}</span>
                                        </div>
                                        {recordData.sent_date && (
                                            <div className="detail-row">
                                                <span className="label">Nosūtīšanas datums:</span>
                                                <span className="value">{formatDate(recordData.sent_date)}</span>
                                            </div>
                                        )}
                                        <div className="detail-row">
                                            <span className="label">Valoda:</span>
                                            <span className="value">{recordData.language || 'Nav norādīta'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Media-specific information */}
                                {inheritanceInfo.isMedia && (
                                    <div className="details-section">
                                        <h3 className="section-title">Tehniskā informācija</h3>
                                        <div className="details-grid">
                                            {recordData.duration && (
                                                <div className="detail-row">
                                                    <span className="label">Ilgums:</span>
                                                    <span className="value">{recordData.duration}</span>
                                                </div>
                                            )}
                                            {recordData.color && (
                                                <div className="detail-row">
                                                    <span className="label">Krāsa:</span>
                                                    <span className="value">{recordData.color}</span>
                                                </div>
                                            )}
                                            {(recordData.horizontal_resolution || recordData.vertical_resolution) && (
                                                <div className="detail-row">
                                                    <span className="label">Izšķirtspēja:</span>
                                                    <span className="value">
                                                        {recordData.horizontal_resolution} × {recordData.vertical_resolution}
                                                    </span>
                                                </div>
                                            )}
                                            {recordData.format && (
                                                <div className="detail-row">
                                                    <span className="label">Formāts:</span>
                                                    <span className="value">{recordData.format}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {(recordData.annotation || recordData.key_words || recordData.notes) && (
                                    <div className="details-section">
                                        <h3 className="section-title">Apraksts</h3>
                                        <div className="details-grid">
                                            {recordData.annotation && (
                                                <div className="detail-row full-width">
                                                    <span className="label">Anotācija:</span>
                                                    <span className="value description">{recordData.annotation}</span>
                                                </div>
                                            )}
                                            {recordData.key_words && (
                                                <div className="detail-row">
                                                    <span className="label">Atslēgvārdi:</span>
                                                    <span className="value">{recordData.key_words}</span>
                                                </div>
                                            )}
                                            {recordData.notes && (
                                                <div className="detail-row full-width">
                                                    <span className="label">Piezīmes:</span>
                                                    <span className="value description">{recordData.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Administrative Information */}
                                {(recordData.reg_nr || recordData.sent_reg_nr || recordData.group || recordData.nomenclature_nr || recordData.tech_info) && (
                                    <div className="details-section">
                                        <h3 className="section-title">Administratīvā informācija</h3>
                                        <div className="details-grid">
                                            {recordData.reg_nr && (
                                                <div className="detail-row">
                                                    <span className="label">Reģistrācijas Nr.:</span>
                                                    <span className="value">{recordData.reg_nr}</span>
                                                </div>
                                            )}
                                            {recordData.sent_reg_nr && (
                                                <div className="detail-row">
                                                    <span className="label">Nosūtīšanas Reģ. Nr.:</span>
                                                    <span className="value">{recordData.sent_reg_nr}</span>
                                                </div>
                                            )}
                                            {recordData.group && (
                                                <div className="detail-row">
                                                    <span className="label">Grupa:</span>
                                                    <span className="value">{recordData.group}</span>
                                                </div>
                                            )}
                                            {recordData.nomenclature_nr && (
                                                <div className="detail-row">
                                                    <span className="label">Nomenklatūras Nr.:</span>
                                                    <span className="value">{recordData.nomenclature_nr}</span>
                                                </div>
                                            )}
                                            {recordData.tech_info && (
                                                <div className="detail-row full-width">
                                                    <span className="label">Tehniskā informācija:</span>
                                                    <span className="value description">{recordData.tech_info}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Access Restrictions */}
                                {(recordData.access_restriction !== 'open' || recordData.access_restriction_notes || recordData.user_restriction_notes) && (
                                    <div className="details-section">
                                        <h3 className="section-title">Pieejas ierobežojumi</h3>
                                        <div className="details-grid">
                                            <div className="detail-row">
                                                <span className="label">Pieejamības ierobežojums:</span>
                                                <span className={`value access-${recordData.access_restriction}`}>
                                                    {recordData.access_restriction === 'open' ? 'Atvērts' : 'Slēgts'}
                                                </span>
                                            </div>
                                            {recordData.access_restriction_date && (
                                                <div className="detail-row">
                                                    <span className="label">Ierobežojuma datums:</span>
                                                    <span className="value">{formatDate(recordData.access_restriction_date)}</span>
                                                </div>
                                            )}
                                            {recordData.access_restriction_notes && (
                                                <div className="detail-row full-width">
                                                    <span className="label">Ierobežojumu piezīmes:</span>
                                                    <span className="value description">{recordData.access_restriction_notes}</span>
                                                </div>
                                            )}
                                            {recordData.user_restriction_notes && (
                                                <div className="detail-row full-width">
                                                    <span className="label">Lietotāja ierobežojumu piezīmes:</span>
                                                    <span className="value description">{recordData.user_restriction_notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'metadata' && inheritanceInfo.isTextual && (
                    <RecordMetadata 
                        recordData={recordData}
                        projectId={projectId}
                        recordId={recordId}
                    />
                )}

                {activeTab === 'files' && (
                    <RecordFiles 
                        recordData={recordData}
                        projectId={projectId}
                        recordId={recordId}
                        inventoryType={inventory?.type}
                    />
                )}
            </div>
        </div>
    );
};

export default Record;