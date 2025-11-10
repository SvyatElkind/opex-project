// src/Record/EditMediaRecordMetadata.js
// Component for adding/editing metadata to existing media records

import React, { useState } from "react";
import ReactDOM from "react-dom";
import InheritanceUtils from '../Utils/InheritanceUtils';
import { useUpdateMediaRecord } from '../hooks/useRecords';
import './CreateRecord.css';

const EditMediaRecordMetadata = ({ onClose, onUpdate, record, inventory, projectId }) => {
    const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
    const updateMediaRecordMutation = useUpdateMediaRecord();
    
    // Initialize form with existing record data
    const [formData, setFormData] = useState({
        color: record.color || '',
        horizontal_resolution: record.horizontal_resolution || '',
        vertical_resolution: record.vertical_resolution || '',
        duration: record.duration || ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setStatusMessage({ type: 'info', text: 'Saglabā metadatus...' });
        
        try {
            // Prepare media-specific data
            const mediaData = {
                color: formData.color || '',
                horizontal_resolution: formData.horizontal_resolution ? 
                    parseInt(formData.horizontal_resolution) : null,
                vertical_resolution: formData.vertical_resolution ? 
                    parseInt(formData.vertical_resolution) : null
            };
            
            // Add duration for Audio/Video types
            if (inheritanceInfo.type === 'SkaÅ†as' || inheritanceInfo.type === 'Video') {
                mediaData.duration = formData.duration || '';
            }
            
            await updateMediaRecordMutation.mutateAsync({
                projectId,
                recordId: record.id,
                recordData: mediaData,  // ✅ FIXED: recordData not data
                recordType: inheritanceInfo.type  // ✅ FIXED: recordType not type
            });
            
            setStatusMessage({ type: 'success', text: 'Metadati veiksmīgi saglabāti!' });
            
            setTimeout(() => {
                if (onUpdate) onUpdate();
                onClose();
            }, 1000);
            
        } catch (error) {
            console.error('Metadata update failed:', error);
            setStatusMessage({ 
                type: 'error', 
                text: error.message || 'Metadatu saglabāšana neizdevās' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderField = (name, label, type = 'text') => {
        const value = formData[name] || '';
        
        return (
            <div className="cru-form-group">
                <label htmlFor={`edit-${name}`} className="cru-form-label">
                    {label}
                </label>
                <input
                    type={type}
                    id={`edit-${name}`}
                    name={name}
                    value={value}
                    onChange={handleInputChange}
                    className="cru-form-input"
                    disabled={isSubmitting}
                />
            </div>
        );
    };
    
    return ReactDOM.createPortal(
        <div className="cru-overlay" onClick={(e) => e.target.className === 'cru-overlay' && !isSubmitting && onClose()}>
            <div className="cru-modal">
                {/* Header */}
                <div className="cru-header">
                    <div className="cru-header-content">
                        <div className="cru-badge" style={{ background: inheritanceInfo.color }}>
                            <span className="cru-badge-icon">{inheritanceInfo.icon}</span>
                            <span className="cru-badge-text">{inheritanceInfo.displayName}</span>
                        </div>
                        <h2 className="cru-title">Pievienot metadatus</h2>
                        <p className="cru-subtitle">Ieraksts ID: {record.id}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="cru-close-btn"
                        disabled={isSubmitting}
                    >
                        ✕
                    </button>
                </div>
                
                {/* Status message */}
                {statusMessage.text && (
                    <div className={`cru-status cru-status-${statusMessage.type}`}>
                        {statusMessage.text}
                    </div>
                )}
                
                {/* Content */}
                <div className="cru-body">
                    <div className="cru-step-content">
                        <div className="cru-step-header">
                            <h2 className="cru-step-title">Tehniskā informācija</h2>
                            <p className="cru-step-description">
                                Pievienojiet papildu informāciju par ierakstu
                            </p>
                        </div>
                        
                        <div className="cru-form-sections">
                            <section className="cru-section">
                                {renderField('color', 'Krāsa', 'text')}
                                
                                {inheritanceInfo.type !== 'SkaÅ†as' && (
                                    <>
                                        {renderField('horizontal_resolution', 'Horizontālā izšķirtspēja', 'number')}
                                        {renderField('vertical_resolution', 'Vertikālā izšķirtspēja', 'number')}
                                    </>
                                )}
                                
                                {(inheritanceInfo.type === 'SkaÅ†as' || inheritanceInfo.type === 'Video') && (
                                    renderField('duration', 'Ilgums (HH:MM:SS)', 'text')
                                )}
                            </section>
                        </div>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="cru-footer">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="cru-btn cru-btn-secondary"
                        disabled={isSubmitting}
                    >
                        Atcelt
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSubmit} 
                        className="cru-btn cru-btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saglabā...' : 'Saglabāt'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EditMediaRecordMetadata;