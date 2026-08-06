import React, { useState, useCallback } from 'react';
import { useRoadmap } from './RoadmapContext';
import { useNotification } from '../components/Notification';
import { ROADMAP_UI } from '../Constants/roadmapConstants';
import { FORMAT_ICONS, CONTENT_TYPE_ICONS, HIERARCHY_ICONS } from '../Constants/iconConstants';
import { openHelpWindow } from '../Utils/HelpWindow';
import './RoadmapWizard.css';

/**
 * RoadmapWizard - Multi-step wizard for setting up project routes/roadmaps
 * Supports creating multiple routes per project
 * All buttons are text-only (no icons)
 */
const RoadmapWizard = ({ projectId, projectData, onClose, onComplete, editingRouteId }) => {
  const { addRoute, updateRoute, getRoadmap, getRoadmaps, deleteRoute } = useRoadmap();
  const { showConfirm } = useNotification();

  const getInitialData = () => {
    if (editingRouteId) {
      const existingRoute = getRoadmap(projectId, editingRouteId);
      if (existingRoute) return existingRoute;
    }

    try {
      const stored = localStorage.getItem('roadmapWizard_lastSession');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          mode: parsed.mode || null,
          projectType: parsed.projectType || null,
          documentFormat: parsed.documentFormat || null,
          inventoryNumber: parsed.inventoryNumber || null,
          inventoryName: null,
          goals: {
            totalItems: parsed.goals?.totalItems || '',
            totalRecords: parsed.goals?.totalRecords || '',
            totalFiles: parsed.goals?.totalFiles || '',
            addFileDescriptions: parsed.goals?.addFileDescriptions || false
          }
        };
      }
    } catch (error) {
      // Ignore corrupted session data
    }

    return {
      mode: null,
      projectType: null,
      documentFormat: null,
      inventoryNumber: null,
      inventoryName: null,
      goals: {
        totalItems: '',
        totalRecords: '',
        totalFiles: '',
        addFileDescriptions: false
      }
    };
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [roadmapData, setRoadmapData] = useState(getInitialData);

  // Get all existing routes for this project (for summary display)
  const existingRoutes = getRoadmaps(projectId);

  React.useEffect(() => {
    try {
      localStorage.setItem('roadmapWizard_lastSession', JSON.stringify(roadmapData));
    } catch (error) {
      // Ignore storage write failures
    }
  }, [roadmapData]);

  const totalSteps = roadmapData.mode === 'expert' ? 2 : 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    addRoute(projectId, {
      mode: 'expert',
      projectType: null,
      goals: { totalItems: 0, totalRecords: 0, totalFiles: 0, addFileDescriptions: false }
    });
    onComplete?.();
    onClose();
  };

  const buildRouteData = () => {
    const isMedia = ['video', 'photos', 'audio'].includes(roadmapData.projectType);
    const totalItems = parseInt(roadmapData.goals.totalItems) || 0;
    const totalRecords = isMedia ? totalItems : (parseInt(roadmapData.goals.totalRecords) || 0);
    const totalFiles = isMedia ? totalItems : (parseInt(roadmapData.goals.totalFiles) || 0);

    return {
      mode: roadmapData.mode,
      projectType: roadmapData.projectType,
      documentFormat: roadmapData.documentFormat,
      inventoryNumber: roadmapData.inventoryNumber,
      inventoryName: roadmapData.inventoryName,
      goals: { totalItems, totalRecords, totalFiles, addFileDescriptions: roadmapData.goals.addFileDescriptions }
    };
  };

  const handleFinishAndClose = () => {
    // Save current route if we have data, then close
    if (roadmapData.projectType || roadmapData.goals.totalItems) {
      const routeData = buildRouteData();
      if (editingRouteId) {
        updateRoute(projectId, editingRouteId, routeData);
      } else {
        addRoute(projectId, routeData);
      }
    }
    onComplete?.();
    onClose();
  };

  const handleCreateAnother = () => {
    const routeData = buildRouteData();
    if (editingRouteId) {
      updateRoute(projectId, editingRouteId, routeData);
    } else {
      addRoute(projectId, routeData);
    }

    setRoadmapData(prev => ({
      mode: prev.mode,
      projectType: null,
      documentFormat: null,
      inventoryNumber: null,
      inventoryName: null,
      goals: { totalItems: '', totalRecords: '', totalFiles: '', addFileDescriptions: false }
    }));
    setCurrentStep(2);
  };

  const handleConfirmExpert = () => {
    const routeData = buildRouteData();
    if (editingRouteId) {
      updateRoute(projectId, editingRouteId, routeData);
    } else {
      addRoute(projectId, routeData);
    }
    onComplete?.();
    onClose();
  };

  const updateField = useCallback((field, value) => {
    setRoadmapData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateGoal = useCallback((field, value) => {
    setRoadmapData(prev => ({ ...prev, goals: { ...prev.goals, [field]: value } }));
  }, []);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return roadmapData.mode !== null;
      case 2:
        if (roadmapData.mode === 'expert') return true;
        return roadmapData.documentFormat !== null && roadmapData.projectType !== null;
      case 3: return roadmapData.inventoryNumber !== null;
      default: return true;
    }
  };

  return (
    <div className="roadmap-wizard-overlay">
      <div className="roadmap-wizard">
        {/* Header - no X button, has help button */}
        <div className="wizard-header">
          <div className="wizard-title-section">
            <h2>{ROADMAP_UI.WIZARD_TITLE}</h2>
            <p>{ROADMAP_UI.WIZARD_SUBTITLE}</p>
          </div>
          <button className="wizard-help-btn" title={ROADMAP_UI.BTN_HELP} onClick={() => openHelpWindow()}>?</button>
        </div>

        {/* Progress Indicator */}
        <div className="wizard-progress">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`progress-step ${i + 1 <= currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}`}
            >
              <div className="step-circle">
                {i + 1 < currentStep ? '\u2713' : i + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="wizard-content">
          {currentStep === 1 && <StepExpertise roadmapData={roadmapData} updateField={updateField} />}
          {currentStep === 2 && roadmapData.mode === 'guided' && (
            <StepProjectType roadmapData={roadmapData} updateField={updateField} />
          )}
          {currentStep === 2 && roadmapData.mode === 'expert' && (
            <StepGoals roadmapData={roadmapData} updateGoal={updateGoal} />
          )}
          {currentStep === 3 && roadmapData.mode === 'guided' && (
            <StepInventorySelection roadmapData={roadmapData} updateField={updateField} projectData={projectData} />
          )}
          {currentStep === 4 && roadmapData.mode === 'guided' && (
            <StepGoals roadmapData={roadmapData} updateGoal={updateGoal} />
          )}
          {currentStep === 5 && roadmapData.mode === 'guided' && (
            <StepSummary
              roadmapData={roadmapData}
              existingRoutes={existingRoutes}
              onCreateAnother={handleCreateAnother}
              onFinish={handleFinishAndClose}
              isEditing={!!editingRouteId}
              projectId={projectId}
            />
          )}
        </div>

        {/* Footer: left = Close, right = Back/Next */}
        <div className="wizard-footer">
          <div className="footer-left">
            <button className="wizard-btn btn-secondary" onClick={onClose}>
              {ROADMAP_UI.BTN_CLOSE}
            </button>
          </div>
          <div className="footer-right">
            {currentStep > 1 && (
              <button className="wizard-btn btn-secondary" onClick={handleBack}>
                {ROADMAP_UI.BTN_BACK}
              </button>
            )}
            {currentStep === 1 && (
              <button className="wizard-btn btn-text" onClick={handleSkip}>
                {ROADMAP_UI.BTN_SKIP}
              </button>
            )}
            {/* Next button for steps before summary */}
            {currentStep < totalSteps && (
              <button
                className="wizard-btn btn-primary"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {ROADMAP_UI.BTN_NEXT}
              </button>
            )}
            {/* Expert mode: finish on step 2 */}
            {currentStep === totalSteps && roadmapData.mode === 'expert' && (
              <button
                className="wizard-btn btn-primary"
                onClick={handleConfirmExpert}
                disabled={!canProceed()}
              >
                {ROADMAP_UI.BTN_FINISH}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Step 1: Choose expertise level
 */
const StepExpertise = ({ roadmapData, updateField }) => (
  <div className="wizard-step">
    <h3 className="step-title">{ROADMAP_UI.EXPERTISE_TITLE}</h3>
    <div className="expertise-options">
      <div
        className={`expertise-card ${roadmapData.mode === 'expert' ? 'selected' : ''}`}
        onClick={() => updateField('mode', 'expert')}
      >
        <div className="card-icon"><i className="fas fa-user-tie"></i></div>
        <h4>{ROADMAP_UI.EXPERTISE_EXPERT_TITLE}</h4>
        <p>{ROADMAP_UI.EXPERTISE_EXPERT_DESC}</p>
      </div>
      <div
        className={`expertise-card ${roadmapData.mode === 'guided' ? 'selected' : ''}`}
        onClick={() => updateField('mode', 'guided')}
      >
        <div className="card-icon"><i className="fas fa-route"></i></div>
        <h4>{ROADMAP_UI.EXPERTISE_GUIDED_TITLE}</h4>
        <p>{ROADMAP_UI.EXPERTISE_GUIDED_DESC}</p>
      </div>
    </div>
  </div>
);

/**
 * Step 2: Choose document format and project type
 * Compact list items: icon + name only (no subtitles)
 */
const StepProjectType = ({ roadmapData, updateField }) => {
  const formats = [
    { id: 'physical', icon: FORMAT_ICONS.PHYSICAL, title: 'Fiziski dokumenti', desc: 'Papīra dokumenti, fotogrāfijas, video kasetes, audio kasetes u.c. fiziskas lietas' },
    { id: 'electronic', icon: FORMAT_ICONS.ELECTRONIC, title: 'Elektroniski dokumenti', desc: 'Digitālie faili un dokumenti datorā vai serverī' }
  ];

  const types = [
    { id: 'text', icon: CONTENT_TYPE_ICONS.TEXTUAL, title: 'Tekstuāls', formats: ['physical', 'electronic'] },
    { id: 'video', icon: CONTENT_TYPE_ICONS.VIDEO, title: 'Video', formats: ['physical', 'electronic'] },
    { id: 'photos', icon: CONTENT_TYPE_ICONS.PHOTO, title: 'Foto', formats: ['physical', 'electronic'] },
    { id: 'audio', icon: CONTENT_TYPE_ICONS.AUDIO, title: 'Audio', formats: ['physical', 'electronic'] },
    { id: 'mixed', icon: CONTENT_TYPE_ICONS.MIXED, title: 'Jaukts', formats: ['physical', 'electronic'] }
  ];

  const availableTypes = roadmapData.documentFormat
    ? types.filter(type => type.formats.includes(roadmapData.documentFormat))
    : types;

  return (
    <div className="wizard-step">
      {!roadmapData.documentFormat ? (
        <>
          <h3 className="step-title">Dokumentu formāts</h3>
          <div className="format-options">
            {formats.map(format => (
              <div
                key={format.id}
                className={`format-card ${roadmapData.documentFormat === format.id ? 'selected' : ''}`}
                onClick={() => updateField('documentFormat', format.id)}
              >
                <div className="card-icon"><i className={`fas ${format.icon}`}></i></div>
                <h4>{format.title}</h4>
                <p>{format.desc}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h3 className="step-title">{ROADMAP_UI.PROJECT_TYPE_TITLE}</h3>
          <div className="wizard-btn-change-wrapper">
            <button
              className="wizard-btn-change"
              onClick={() => {
                updateField('documentFormat', null);
                updateField('projectType', null);
              }}
            >
              {ROADMAP_UI.BTN_CHANGE} ({roadmapData.documentFormat === 'physical' ? 'Fiziski' : 'Elektroniski'})
            </button>
          </div>
          <div className="project-type-column">
            {availableTypes.map(type => (
              <div
                key={type.id}
                className={`type-card-compact ${roadmapData.projectType === type.id ? 'selected' : ''}`}
                onClick={() => updateField('projectType', type.id)}
              >
                <div className="type-card-icon"><i className={`fas ${type.icon}`}></i></div>
                <span className="type-card-name">{type.title}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Step 3/4: Set goals (adjusted based on document type)
 */
const StepGoals = ({ roadmapData, updateGoal }) => {
  const isExpertMode = roadmapData.mode === 'expert';
  const isElectronic = roadmapData.documentFormat === 'electronic';
  const isTextual = roadmapData.projectType === 'text';
  const isMedia = ['video', 'photos', 'audio'].includes(roadmapData.projectType);

  const showRecordsQuestion = isExpertMode || (isElectronic && isTextual);
  const showFilesQuestion = isExpertMode || (isElectronic && isTextual);

  return (
    <div className="wizard-step">
      <h3 className="step-title">{ROADMAP_UI.GOALS_TITLE}</h3>
      <div className="goals-form">
        <div className="form-field">
          <label>
            {isExpertMode && 'Kopējais vienību skaits'}
            {!isExpertMode && !isElectronic && 'Kopējais vienību skaits'}
            {!isExpertMode && isElectronic && isMedia && 'Kopējais vienību/failu skaits'}
            {!isExpertMode && isElectronic && isTextual && ROADMAP_UI.GOALS_ITEMS_LABEL}
          </label>
          <input
            type="number"
            min="0"
            placeholder="Atstājiet tukšu, ja nezināt"
            value={roadmapData.goals.totalItems}
            onChange={(e) => updateGoal('totalItems', e.target.value)}
          />
          <small>
            {isExpertMode && 'Inventāru vienības (lietas, mapes, kasetes, u.c.)'}
            {!isExpertMode && !isElectronic && 'Fizisko vienību skaits'}
            {!isExpertMode && isElectronic && isMedia && 'Vienības un faili ir 1:1 attiecībā'}
            {!isExpertMode && isElectronic && isTextual && 'Lietas, mapes vai vienības'}
          </small>
        </div>

        {showRecordsQuestion && (
          <div className="form-field">
            <label>Kopējais dokumentu skaits</label>
            <input
              type="number"
              min="0"
              placeholder="Atstājiet tukšu, ja nezināt"
              value={roadmapData.goals.totalRecords}
              onChange={(e) => updateGoal('totalRecords', e.target.value)}
            />
            <small>Kopējais dokumentu skaits</small>
          </div>
        )}

        {showFilesQuestion && (
          <div className="form-field">
            <label>Kopējais failu skaits</label>
            <input
              type="number"
              min="0"
              placeholder="Atstājiet tukšu, ja nezināt"
              value={roadmapData.goals.totalFiles}
              onChange={(e) => updateGoal('totalFiles', e.target.value)}
            />
            <small>Kopējais failu skaits visos dokumentos</small>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Step 3: Select inventory number (guided mode only)
 * Dynamic icon, no info-note/subtitle/hint/reminder
 */
const StepInventorySelection = ({ roadmapData, updateField, projectData }) => {
  const existingInventories = projectData?.institution?.fond?.inventories || [];

  const getInventoryType = (projectType) => {
    const typeMap = { 'text': 'Tekstuāls', 'video': 'Video', 'photos': 'Foto', 'audio': 'Skaņas' };
    return typeMap[projectType] || null;
  };

  const matchingInventories = existingInventories.filter(inv => {
    const isElectronic = inv.electronic === true;
    const matchesFormat = roadmapData.documentFormat === 'electronic' ? isElectronic : !isElectronic;
    if (roadmapData.projectType === 'mixed') return matchesFormat;
    const expectedType = getInventoryType(roadmapData.projectType);
    return matchesFormat && (expectedType ? inv.type === expectedType : true);
  });

  const nextInventoryNumber = existingInventories.length + 1;
  const hasExistingInventories = matchingInventories.length > 0;
  const [selectionMode, setSelectionMode] = React.useState(
    hasExistingInventories ? 'select' : 'create'
  );

  const createIcon = roadmapData.documentFormat === 'electronic' ? FORMAT_ICONS.ELECTRONIC : FORMAT_ICONS.PHYSICAL;

  React.useEffect(() => {
    if (selectionMode === 'create' && roadmapData.inventoryNumber !== nextInventoryNumber) {
      updateField('inventoryNumber', nextInventoryNumber);
      updateField('inventoryName', `Uzskaites saraksts ${nextInventoryNumber}`);
    }
  }, [selectionMode, nextInventoryNumber, roadmapData.inventoryNumber, updateField]);

  return (
    <div className="wizard-step">
      <h3 className="step-title">Izvēlieties uzskaites sarakstu</h3>

      {hasExistingInventories && (
        <div className="inventory-mode-selection">
          <button
            className={`mode-btn ${selectionMode === 'create' ? 'active' : ''}`}
            onClick={() => {
              setSelectionMode('create');
              updateField('inventoryNumber', nextInventoryNumber);
              updateField('inventoryName', `Uzskaites saraksts ${nextInventoryNumber}`);
            }}
          >
            Izveidot jaunu (Nr. {nextInventoryNumber})
          </button>
          <button
            className={`mode-btn ${selectionMode === 'select' ? 'active' : ''}`}
            onClick={() => {
              setSelectionMode('select');
              updateField('inventoryNumber', null);
              updateField('inventoryName', null);
            }}
          >
            Izvēlēties esošu
          </button>
        </div>
      )}

      {selectionMode === 'create' && (
        <div className="inventory-create-section">
          <div className="inventory-card selected create-new-card">
            <div className="inventory-icon">
              <i className={`fas ${createIcon}`}></i>
            </div>
            <div className="inventory-info">
              <h4>Jauns uzskaites saraksts {nextInventoryNumber}</h4>
              <p>{roadmapData.documentFormat === 'electronic' ? 'Elektronisks' : 'Fizisks'} uzskaites saraksts</p>
              <button
                className="create-inventory-btn"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openInventoryCreate', {
                    detail: {
                      inventoryNumber: nextInventoryNumber,
                      inventoryType: getInventoryType(roadmapData.projectType),
                      electronic: roadmapData.documentFormat === 'electronic',
                      contentType: roadmapData.projectType
                    }
                  }));
                }}
              >
                Izveidot uzskaites sarakstu
              </button>
            </div>
          </div>
        </div>
      )}

      {selectionMode === 'select' && (
        <div className="inventory-list">
          {matchingInventories.map(inventory => (
            <div
              key={inventory.id}
              className={`inventory-card ${roadmapData.inventoryNumber === inventory.number ? 'selected' : ''}`}
              onClick={() => {
                updateField('inventoryNumber', inventory.number);
                updateField('inventoryName', `Uzskaites saraksts Nr. ${inventory.number}`);
              }}
            >
              <div className="inventory-icon">
                <i className={`fas ${HIERARCHY_ICONS.ITEM}`}></i>
              </div>
              <div className="inventory-info">
                <h4>Uzskaites saraksts Nr. {inventory.number}</h4>
                <div className="inventory-stats">
                  <span>{inventory.items?.length || 0} vienības</span>
                  {inventory.electronic && (
                    <>
                      <span>{inventory.items?.reduce((sum, item) => sum + (item.records?.length || 0), 0) || 0} dokumenti</span>
                      <span>{inventory.items?.reduce((sum, item) =>
                        sum + (item.records?.reduce((s, r) => s + (r.files?.length || 0), 0) || 0), 0
                      ) || 0} faili</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Step 5: Summary with route list and actions at top
 * Actions: "Izveidot jaunu maršrutu" + "Pabeigt" at top
 * Below: list of all created routes (compact rows with edit/delete)
 */
const StepSummary = ({ roadmapData, existingRoutes, onCreateAnother, onFinish, isEditing, projectId }) => {
  const { deleteRoute } = useRoadmap();
  const { showConfirm } = useNotification();
  const isMedia = ['video', 'photos', 'audio'].includes(roadmapData.projectType);

  const totalItems = parseInt(roadmapData.goals.totalItems) || 0;
  const totalRecords = isMedia ? totalItems : (parseInt(roadmapData.goals.totalRecords) || 0);
  const totalFiles = isMedia ? totalItems : (parseInt(roadmapData.goals.totalFiles) || 0);

  const getTypeLabel = (type) => {
    const labels = { video: ROADMAP_UI.TYPE_VIDEO, text: ROADMAP_UI.TYPE_TEXT, photos: ROADMAP_UI.TYPE_PHOTOS, audio: ROADMAP_UI.TYPE_AUDIO, mixed: ROADMAP_UI.TYPE_MIXED };
    return labels[type] || type || '-';
  };

  const handleDeleteRoute = async (routeId) => {
    const ok = await showConfirm({
      title: 'Dzēst maršrutu?',
      message: ROADMAP_UI.ROUTE_DELETE_CONFIRM,
      confirmText: 'Dzēst',
      variant: 'danger'
    });
    if (ok) {
      deleteRoute(projectId, routeId);
    }
  };

  return (
    <div className="wizard-step">
      <h3 className="step-title">{ROADMAP_UI.SUMMARY_TITLE}</h3>

      {/* Actions at top */}
      <div className="summary-top-actions">
        {!isEditing && (
          <button className="wizard-btn btn-secondary" onClick={onCreateAnother}>
            {ROADMAP_UI.BTN_CREATE_NEW_ROUTE}
          </button>
        )}
        <button className="wizard-btn btn-primary" onClick={onFinish}>
          {ROADMAP_UI.BTN_FINISH}
        </button>
      </div>

      {/* Current route being created/edited */}
      <div className="summary-section">
        <h4>{isEditing ? 'Rediģējamais maršruts' : 'Jaunais maršruts'}</h4>
        <div className="summary-route-row">
          <span className="route-row-name">
            {roadmapData.inventoryName || `US Nr. ${roadmapData.inventoryNumber || '?'}`}
          </span>
          <span className="route-row-detail">
            {roadmapData.documentFormat === 'electronic' ? 'Elektronisks' : 'Fizisks'}
          </span>
          <span className="route-row-detail">
            {getTypeLabel(roadmapData.projectType)}
          </span>
          <span className="route-row-goals">
            Vienības: {totalItems}, Dokumenti: {totalRecords}, Faili: {totalFiles}
          </span>
        </div>
      </div>

      {/* Previously created routes */}
      {existingRoutes.length > 0 && (
        <div className="summary-section">
          <h4>Esošie maršruti ({existingRoutes.length})</h4>
          <div className="summary-routes-list">
            {existingRoutes.map(route => (
              <div key={route.id} className="summary-route-row">
                <div className="route-row-info">
                  <span className="route-row-name">
                    {route.inventoryName || `US Nr. ${route.inventoryNumber || '?'}`}
                  </span>
                  <span className="route-row-detail">
                    {route.documentFormat === 'electronic' ? 'E' : 'F'} | {getTypeLabel(route.projectType)} | Vienības: {route.goals?.totalItems || 0}
                  </span>
                </div>
                <div className="route-row-actions">
                  <button
                    className="wizard-btn btn-text btn-small"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('openRoadmapWizard', {
                        detail: { editingRouteId: route.id }
                      }));
                    }}
                  >
                    {ROADMAP_UI.BTN_EDIT}
                  </button>
                  <button
                    className="wizard-btn btn-text btn-small btn-danger"
                    onClick={() => handleDeleteRoute(route.id)}
                  >
                    {ROADMAP_UI.BTN_DELETE}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapWizard;
