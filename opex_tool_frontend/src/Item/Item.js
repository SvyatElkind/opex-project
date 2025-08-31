// Item.js - Individual Item Detail Component
import React, { useState, useEffect } from 'react';
import { useNavigation } from '../Navigation/context/NavigationContext';
import InheritanceUtils from '../Utils/InheritanceUtils';
import RecordsList from '../Record/RecordsList';
import CreateRecord from '../Record/CreateRecord';
import { useCreateRecord } from '../hooks/useRecords';
import './Item.css';


const Item = ({ item, inventory, projectId, onBack }) => {
    const { navigateTo, currentRecord } = useNavigation();
    const createRecordMutation = useCreateRecord();
    
    // Local state
    const [viewMode, setViewMode] = useState('overview'); // 'overview', 'records'
    const [showCreateRecord, setShowCreateRecord] = useState(false);
    // FIX: Add state to track if user manually changed view mode
    const [userHasManuallySetView, setUserHasManuallySetView] = useState(false);
    
    // FIX: Calculate inheritance info with safe defaults to avoid hooks rule violations
    const inheritanceInfo = inventory ? InheritanceUtils.getInheritanceInfo(inventory) : {
        isTextual: false,
        isMedia: false,
        type: 'Unknown',
        icon: '❓',
        color: '#6c757d'
    };
    
    const navigationBehavior = (inventory && item) ? InheritanceUtils.getNavigationBehavior(inventory, item) : {
        action: 'stayAtItem'
    };
    
    const uiConfig = (inventory && item) ? InheritanceUtils.getItemUIConfig(inventory, item) : {
        showCreateRecordButton: false,
        maxRecordsAllowed: 0,
        badge: { text: 'Unknown', color: '#6c757d', icon: '❓' },
        validation: { allowed: false, message: 'Missing data' }
    };
    
    const attentionStatus = (inventory && item) ? InheritanceUtils.getItemAttentionStatus(inventory, item) : {
        needsAttention: false,
        recommendations: []
    };
    
    // FIX: Safe logging after inheritance calculations
    if (item && inventory) {
        console.log('Item component loaded:', {
            itemId: item.id,
            inventoryType: inventory.type,
            recordCount: item.records?.length || 0,
            navigationBehavior,
            uiConfig
        });
    }
    
    // FIX: Enhanced auto-view determination that respects user choice
    useEffect(() => {
        // Guard against missing data
        if (!item || !inventory) return;
        
        // FIX: Only apply automatic logic if user hasn't manually set the view
        if (userHasManuallySetView) {
            console.log('User has manually set view mode, skipping automatic logic');
            return;
        }
        
        console.log('Determining initial view mode...');
        
        // If we have a current record in navigation, we should be showing records view
        if (currentRecord && item.records?.some(r => r.id === currentRecord)) {
            console.log('Current record exists, showing records view');
            setViewMode('records');
            return;
        }
        
        // For textual inventories with records, auto-show records table
        if (inheritanceInfo.isTextual && item.records && item.records.length > 0) {
            console.log('Textual inventory with records, showing records view');
            setViewMode('records');
            return;
        }
        
        // For media inventories with exactly one record, we might navigate directly to it
        // But if we're at the item level, show overview with quick access
        if (inheritanceInfo.isMedia && item.records && item.records.length === 1) {
            console.log('Media inventory with one record, showing overview with quick access');
            setViewMode('overview');
            return;
        }
        
        // Default to overview
        console.log('Default to overview mode');
        setViewMode('overview');
    }, [item, inventory, inheritanceInfo, currentRecord, userHasManuallySetView]); // FIX: Added userHasManuallySetView dependency

    // Handle record navigation
    const handleRecordClick = (record) => {
        if (!inventory || !item) return;
        
        console.log('Record clicked:', record.id);
        navigateTo('record', record.id, inventory.id, item.id);
    };

    // Handle record creation
    const handleCreateRecord = () => {
        if (!inventory || !item) return;
        
        const validation = InheritanceUtils.validateRecordCreation(inventory, item);
        if (!validation.allowed) {
            alert(validation.message);
            return;
        }
        setShowCreateRecord(true);
    };

    // Handle actual record creation submission
    const handleCreateRecordSubmit = async (recordData, shouldClosePopup = false) => {
        if (!item) return [false, "Missing item data"];
        
        try {
            console.log('Creating record:', recordData);
            await createRecordMutation.mutateAsync({
                recordData,
                projectId,
                itemId: item.id
            });
            
            if (shouldClosePopup) {
                setShowCreateRecord(false);
            }
            
            return [true, "Record created successfully"];
        } catch (error) {
            console.error('Error creating record:', error);
            return [false, error.message || "Failed to create record"];
        }
    };

    // FIX: Enhanced view toggle that marks user manual choice
    const handleViewToggle = () => {
        const newViewMode = viewMode === 'overview' ? 'records' : 'overview';
        console.log('User manually toggling view mode from', viewMode, 'to', newViewMode);
        
        setViewMode(newViewMode);
        setUserHasManuallySetView(true); // FIX: Mark that user has manually set the view
    };

    // Handle quick record access for media items
    const handleQuickRecordAccess = () => {
        if (!inventory || !item) return;
        
        if (inheritanceInfo.isMedia && item.records && item.records.length === 1) {
            const record = item.records[0];
            navigateTo('record', record.id, inventory.id, item.id);
        }
    };

    const recordCount = item?.records ? item.records.length : 0;

    // FIX: Handle error state AFTER all hooks
    if (!item || !inventory) {
        return (
            <div className="item-detail-container">
                <div className="item-error">
                    <div className="error-icon">❌</div>
                    <h3>Kļūda ielādējot vienību</h3>
                    <p>Nav pietiekamu datu par vienību vai uzskaites sarakstu</p>
                    <button onClick={onBack} className="back-button">
                        ← Atgriezties
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="item-detail-container">
            {/* Header with back button */}
            <div className="item-header">
                <button onClick={onBack} className="back-button">
                    ← Atgriezties uz Vienību Sarakstu
                </button>
                <div className="item-title-section">
                    <h2>Glabājamā Vienība {item?.number || 'N/A'}</h2>
                    <div className="item-subtitle">{item?.title || 'Nav nosaukuma'}</div>
                    
                    {/* FIX: Enhanced inheritance badge with status indicators */}
                    <div className="inheritance-badges">
                        <div 
                            className="inheritance-badge" 
                            style={{ 
                                backgroundColor: uiConfig.badge.color + '20', 
                                color: uiConfig.badge.color,
                                border: `1px solid ${uiConfig.badge.color}40`
                            }}
                        >
                            {uiConfig.badge.icon} {uiConfig.badge.text}
                        </div>
                        
                        <div className="record-count-badge">
                            📄 {recordCount} {recordCount === 1 ? 'ieraksts' : 'ieraksti'}
                        </div>
                        
                        {/* Attention status badge */}
                        {attentionStatus.needsAttention && (
                            <div 
                                className={`attention-badge ${attentionStatus.level}`}
                                title={attentionStatus.message}
                            >
                                {attentionStatus.level === 'error' && '⚠️'}
                                {attentionStatus.level === 'warning' && '⚡'}
                                {attentionStatus.level === 'info' && 'ℹ️'}
                                {attentionStatus.message}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="item-actions">
                    {/* FIX: Dynamic actions based on inheritance behavior */}
                    {inheritanceInfo.isMedia && recordCount === 1 && (
                        <button 
                            onClick={handleQuickRecordAccess}
                            className="btn btn-primary"
                            title="Atvērt ierakstu tieši"
                        >
                            🔗 Atvērt Ierakstu
                        </button>
                    )}
                    
                    {recordCount > 0 && (
                        <button 
                            onClick={handleViewToggle}
                            className="btn btn-secondary"
                        >
                            {viewMode === 'overview' ? '📋 Rādīt Ierakstus' : '📖 Rādīt Pārskatu'}
                        </button>
                    )}
                    
                    {uiConfig.showCreateRecordButton && (
                        <button 
                            onClick={handleCreateRecord}
                            className="btn btn-create"
                            title={uiConfig.validation.message}
                        >
                            ➕ Izveidot Ierakstu
                        </button>
                    )}
                </div>
            </div>

            {/* FIX: Attention status section with recommendations */}
            {attentionStatus.needsAttention && attentionStatus.recommendations?.length > 0 && (
                <div className={`attention-section ${attentionStatus.level}`}>
                    <div className="attention-header">
                        <strong>Ieteikumi:</strong>
                    </div>
                    <div className="attention-recommendations">
                        {attentionStatus.recommendations.map((rec, index) => (
                            <div key={index} className={`recommendation ${rec.priority}`}>
                                <span className="rec-message">{rec.message}</span>
                                {rec.action === 'createRecord' && (
                                    <button 
                                        onClick={handleCreateRecord}
                                        className="rec-action-btn"
                                    >
                                        Izveidot Tagad
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Item Details Section */}
            <div className="item-content">
                {viewMode === 'overview' ? (
                    <div className="item-overview">
                        {/* Item Metadata */}
                        <div className="item-metadata">
                            <div className="metadata-section">
                                <h3>Pamatinformācija</h3>
                                <div className="metadata-grid">
                                    <div className="metadata-item">
                                        <label>Nosaukums:</label>
                                        <span>{item?.title || 'Nav norādīts'}</span>
                                    </div>
                                    <div className="metadata-item">
                                        <label>Sērijas kods:</label>
                                        <span>{item?.series_code || 'Nav norādīts'}</span>
                                    </div>
                                    <div className="metadata-item">
                                        <label>Valoda:</label>
                                        <span>{item?.language || 'Nav norādīts'}</span>
                                    </div>
                                    <div className="metadata-item">
                                        <label>Sākuma datums:</label>
                                        <span>{item?.start_date ? new Date(item.start_date).toLocaleDateString('lv-LV') : 'Nav norādīts'}</span>
                                    </div>
                                    <div className="metadata-item">
                                        <label>Beigu datums:</label>
                                        <span>{item?.end_date ? new Date(item.end_date).toLocaleDateString('lv-LV') : 'Nav norādīts'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="metadata-section">
                                <h3>Pieejamība un drošība</h3>
                                <div className="metadata-grid">
                                    <div className="metadata-item">
                                        <label>Ierobežojumi:</label>
                                        <span>{item?.restriction || 'Vispārēja'}</span>
                                    </div>
                                    <div className="metadata-item">
                                        <label>Drošības līmenis:</label>
                                        <span>{item?.security_level || 'Publisks'}</span>
                                    </div>
                                </div>
                            </div>

                            {(item?.notes || item?.annotation) && (
                                <div className="metadata-section">
                                    <h3>Piezīmes un apraksts</h3>
                                    {item?.annotation && (
                                        <div className="metadata-item">
                                            <label>Anotācija:</label>
                                            <p>{item.annotation}</p>
                                        </div>
                                    )}
                                    {item?.notes && (
                                        <div className="metadata-item">
                                            <label>Piezīmes:</label>
                                            <p>{item.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* FIX: Enhanced Records Summary with inheritance-aware display */}
                        <div className="records-summary">
                            <h3>Ierakstu kopsavilkums</h3>
                            <div className="summary-stats">
                                <div className="stat-card">
                                    <div className="stat-value">{recordCount}</div>
                                    <div className="stat-label">
                                        {recordCount === 1 ? 'Ieraksts' : 'Ieraksti'}
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value" style={{ color: inheritanceInfo.color }}>
                                        {inheritanceInfo.icon}
                                    </div>
                                    <div className="stat-label">{inheritanceInfo.type}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">
                                        {uiConfig.maxRecordsAllowed === Infinity ? '∞' : uiConfig.maxRecordsAllowed}
                                    </div>
                                    <div className="stat-label">Max. atļauts</div>
                                </div>
                            </div>
                            
                            {/* Records preview based on inheritance type */}
                            {recordCount > 0 && (
                                <div className="recent-records">
                                    <h4>
                                        {inheritanceInfo.isMedia ? 'Ieraksts' : 'Nesenie ieraksti'}
                                    </h4>
                                    {item?.records?.slice(0, inheritanceInfo.isMedia ? 1 : 3).map(record => (
                                        <div 
                                            key={record.id} 
                                            className="record-preview" 
                                            onClick={() => handleRecordClick(record)}
                                        >
                                            <div className="record-preview-content">
                                                <span className="record-title">
                                                    {record.title || record.reg_nr || 'Nav nosaukuma'}
                                                </span>
                                                <span className="record-date">
                                                    {record.date ? new Date(record.date).toLocaleDateString('lv-LV') : ''}
                                                </span>
                                            </div>
                                            <div className="record-preview-action">
                                                {inheritanceInfo.isMedia ? '🔗 Atvērt' : '👁️ Skatīt'}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Show view all button for textual inventories */}
                                    {inheritanceInfo.isTextual && recordCount > 3 && (
                                        <button 
                                            onClick={handleViewToggle} 
                                            className="view-all-records"
                                        >
                                            Skatīt visus {recordCount} ierakstus
                                        </button>
                                    )}
                                </div>
                            )}
                            
                            {/* No records state with context-aware messaging */}
                            {recordCount === 0 && (
                                <div className="no-records-state">
                                    <div className="no-records-icon">{inheritanceInfo.icon}</div>
                                    <h4>Nav ierakstu</h4>
                                    <p>
                                        {inheritanceInfo.isMedia 
                                            ? `Šai ${inventory?.type?.toLowerCase() || 'media'} vienībai vēl nav pievienots ieraksts.`
                                            : 'Šai vienībai vēl nav pievienoti ieraksti.'
                                        }
                                    </p>
                                    {uiConfig.showCreateRecordButton && (
                                        <button 
                                            onClick={handleCreateRecord}
                                            className="create-first-record-btn"
                                        >
                                            Izveidot {inheritanceInfo.isMedia ? 'ierakstu' : 'pirmO ierakstu'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // FIX: Enhanced records view with inheritance-aware configuration
                    <div className="item-records">
                        <RecordsList 
                            records={item?.records || []}
                            item={item}
                            inventory={inventory}
                            projectId={projectId}
                            onRecordClick={handleRecordClick}
                            onCreateRecord={handleCreateRecord}
                            showCreateButton={uiConfig.showCreateRecordButton}
                            viewMode={inheritanceInfo.isMedia ? 'cards' : 'table'}
                        />
                    </div>
                )}
            </div>

            {/* Create Record Modal */}
            {showCreateRecord && item && inventory && (
                <CreateRecord
                    item={item}
                    inventory={inventory}
                    projectId={projectId}
                    onClose={() => setShowCreateRecord(false)}
                    OnCreate={handleCreateRecordSubmit}
                />
            )}
        </div>
    );
};

export default Item;