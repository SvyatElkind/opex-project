import React, { useState, useEffect } from 'react';
import { useGuidance } from './GuidanceContext';
import { useWorkflowState } from './useWorkflowState';
import { useRoadmap, ROUTE_STATUS } from '../Roadmap/RoadmapContext';
import { useNavigation } from '../Navigation/context/NavigationContext';
import { GUIDANCE_UI } from '../Constants/guidanceConstants';
import { ROADMAP_UI } from '../Constants/roadmapConstants';
import { FORMAT_ICONS, PROGRESS_ICONS } from '../Constants/iconConstants';
import './SmartGuideCard.css';

/**
 * Strip HTML tags from error messages and decode HTML entities.
 */
const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return html;
  const stripped = html.replace(/<[^>]*>/g, '');
  const txt = document.createElement('textarea');
  txt.innerHTML = stripped;
  return txt.value;
};

const SmartGuideCard = ({ projectData, validationResult }) => {
  const {
    isVisible,
    isMinimized,
    setIsMinimized,
    setIsVisible,
    settings
  } = useGuidance();

  const { getRoadmaps, calculateProgress, deleteRoute, updateRouteStatus } = useRoadmap();
  const { navigateTo } = useNavigation();

  // Accordion: only one route expanded at a time
  const [expandedRouteId, setExpandedRouteId] = useState(null);

  // Get all routes for this project
  const routes = getRoadmaps(projectData?.id);

  // Filter to routes with active goals
  const activeRoutes = routes.filter(route =>
    route.goals?.totalItems > 0 && route.status !== ROUTE_STATUS.ARCHIVED
  );

  const { canExport } = useWorkflowState(
    projectData,
    validationResult,
    routes[0] || null
  );

  useEffect(() => {
    const handleShowGuide = () => {
      setIsVisible(true);
      setIsMinimized(false);
    };
    window.addEventListener('showSmartGuide', handleShowGuide);
    return () => window.removeEventListener('showSmartGuide', handleShowGuide);
  }, [setIsVisible, setIsMinimized]);

  const handleRouteToggle = (routeId) => {
    setExpandedRouteId(prev => prev === routeId ? null : routeId);
  };

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div className="smart-guide-minimized" onClick={() => setIsMinimized(false)}>
        <i className="fas fa-compass"></i>
        {activeRoutes.length > 0 && (
          <span className="action-badge">{activeRoutes.length}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`smart-guide-card ${settings.position}`}>
      {/* Header */}
      <div className="smart-guide-header">
        <div className="header-left">
          <i className="fas fa-compass"></i>
          <h3>{GUIDANCE_UI.ROUTES_TITLE}</h3>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={() => setIsMinimized(true)} title={GUIDANCE_UI.BTN_MINIMIZE}>
            <i className="fas fa-minus"></i>
          </button>
          <button className="icon-btn" onClick={() => setIsVisible(false)} title={GUIDANCE_UI.BTN_HIDE}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Route Cards */}
      <div className="smart-guide-routes">
        {activeRoutes.length === 0 ? (
          <div className="no-routes">
            <button
              className="setup-roadmap-btn"
              onClick={() => window.dispatchEvent(new CustomEvent('openRoadmapWizard'))}
            >
              {ROADMAP_UI.ROUTE_NO_ROUTES}
            </button>
          </div>
        ) : (
          activeRoutes.map(route => (
            <RouteCard
              key={route.id}
              route={route}
              projectData={projectData}
              validationResult={validationResult}
              calculateProgress={calculateProgress}
              onDelete={deleteRoute}
              onStatusChange={updateRouteStatus}
              onNavigate={navigateTo}
              onMinimize={() => setIsMinimized(true)}
              projectId={projectData?.id}
              isExpanded={expandedRouteId === route.id}
              onToggle={() => handleRouteToggle(route.id)}
            />
          ))
        )}

        {activeRoutes.length > 0 && (
          <button
            className="add-route-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('openRoadmapWizard'))}
          >
            {ROADMAP_UI.BTN_CREATE_NEW_ROUTE}
          </button>
        )}
      </div>

      {/* Export */}
      {canExport && (
        <div className="smart-guide-export">
          <button
            className="export-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('openValidationModal'))}
          >
            Eksportēt OPEX
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Individual Route Card with progress and item-grouped errors
 */
const RouteCard = ({
  route, projectData, validationResult, calculateProgress,
  onDelete, onStatusChange, onNavigate, onMinimize,
  projectId, isExpanded, onToggle
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const routeProgress = calculateProgress(projectData, route);
  const isElectronic = route.documentFormat === 'electronic';

  // Get item-grouped validation issues
  const routeValidation = getRouteValidationGrouped(validationResult, projectData, route);

  const handleEdit = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('openRoadmapWizard', {
      detail: { editingRouteId: route.id }
    }));
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete(projectId, route.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  // Navigate based on the message's level
  const handleNavigateToMessage = (msg) => {
    if (msg.navLevel === 'record' && msg.recordId) {
      onNavigate('record', msg.recordId, msg.inventoryId, msg.itemId);
    } else {
      onNavigate('item', msg.itemId, msg.inventoryId);
    }
    onMinimize();
  };

  // Navigate to inventory level
  const handleNavigateToInventory = (invIssue) => {
    onNavigate('inventory', invIssue.inventoryId);
    onMinimize();
  };

  return (
    <div className={`route-card ${isExpanded ? 'expanded' : ''}`}>
      {/* Route header */}
      <div className="route-header" onClick={onToggle}>
        <div className="route-info">
          <i
            className={`fas ${isElectronic ? FORMAT_ICONS.ELECTRONIC : FORMAT_ICONS.PHYSICAL} route-type-icon`}
            title={isElectronic ? 'Elektronisks' : 'Fizisks'}
          ></i>
          <span className="route-name">
            {route.inventoryName || `US Nr. ${route.inventoryNumber || '?'}`}
          </span>
          {routeValidation.totalErrors > 0 && (
            <span className="issue-badge error-issue">
              <i className="fas fa-exclamation-circle"></i>
              {routeValidation.totalErrors}
            </span>
          )}
          {routeValidation.totalWarnings > 0 && (
            <span className="issue-badge warning-issue">
              <i className="fas fa-exclamation-triangle"></i>
              {routeValidation.totalWarnings}
            </span>
          )}
        </div>
        <div className="route-header-actions">
          <button className="route-icon-btn" onClick={handleEdit} title={ROADMAP_UI.BTN_EDIT}>
            <i className="fas fa-pencil-alt"></i>
          </button>
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} route-expand-icon`}></i>
        </div>
      </div>

      {/* Progress row */}
      <div className="route-progress-row">
        <span className="route-stat">
          <i className={`fas ${PROGRESS_ICONS.ITEMS}`}></i> {routeProgress.items.current}/{routeProgress.items.target}
        </span>
        {!isElectronic && routeProgress.records.target > 0 && (
          <span className="route-stat">
            <i className={`fas ${PROGRESS_ICONS.RECORDS}`}></i> {routeProgress.records.current}/{routeProgress.records.target}
          </span>
        )}
        <span className="route-stat">
          <i className={`fas ${PROGRESS_ICONS.FILES}`}></i> {routeProgress.files.current}/{routeProgress.files.target}
        </span>
      </div>

      {/* Expanded: item-grouped issues */}
      {isExpanded && (
        <div className="route-details">
          {/* Inventory-level issues first */}
          {routeValidation.inventoryIssues.length > 0 && (
            <div className="route-issues-list">
              {routeValidation.inventoryIssues.map((issue, idx) => (
                <div key={`inv-${idx}`} className={`route-issue-item ${issue.type}`}>
                  <div className="issue-info">
                    <i className={`fas ${issue.type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}`}></i>
                    <span className="issue-message">{stripHtml(issue.message)}</span>
                  </div>
                  <button
                    className="issue-nav-btn"
                    onClick={(e) => { e.stopPropagation(); handleNavigateToInventory(issue); }}
                    title={GUIDANCE_UI.BTN_NAVIGATE}
                  >
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Item groups */}
          {routeValidation.itemGroups.length > 0 ? (
            <div className="route-item-groups">
              {routeValidation.itemGroups.map(group => (
                <div key={group.itemId} className="item-group">
                  <div className="item-group-header">
                    <div className="item-group-info">
                      <span className="item-group-name">{group.itemName}</span>
                      {group.errorCount > 0 && (
                        <span className="issue-badge error-issue">
                          {group.errorCount}
                        </span>
                      )}
                      {group.warningCount > 0 && (
                        <span className="issue-badge warning-issue">
                          {group.warningCount}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Each message has its own nav button */}
                  <div className="item-group-messages">
                    {group.messages.slice(0, 5).map((msg, idx) => (
                      <div key={idx} className={`item-issue-row ${msg.type}`}>
                        <div className="item-issue-msg">
                          <i className={`fas ${msg.type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}`}></i>
                          <span>{msg.message}</span>
                        </div>
                        <button
                          className="issue-nav-btn"
                          onClick={(e) => { e.stopPropagation(); handleNavigateToMessage(msg); }}
                          title={GUIDANCE_UI.BTN_NAVIGATE}
                        >
                          <i className="fas fa-arrow-right"></i>
                        </button>
                      </div>
                    ))}
                    {group.messages.length > 5 && (
                      <span className="item-issue-more">
                        +{group.messages.length - 5} {GUIDANCE_UI.MORE}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            routeValidation.inventoryIssues.length === 0 && (
              <div className="no-issues">
                <i className="fas fa-check-circle"></i>
                <span>{GUIDANCE_UI.NO_ISSUES}</span>
              </div>
            )
          )}

          {/* Route actions */}
          <div className="route-actions">
            {route.status === ROUTE_STATUS.IN_PROGRESS && (
              <button
                className="route-action-btn complete-btn"
                onClick={(e) => { e.stopPropagation(); onStatusChange(projectId, route.id, ROUTE_STATUS.COMPLETED); }}
              >
                {ROADMAP_UI.STATUS_COMPLETED}
              </button>
            )}
            {showDeleteConfirm ? (
              <div className="delete-confirm">
                <span>{ROADMAP_UI.ROUTE_DELETE_CONFIRM}</span>
                <button className="route-action-btn delete-btn" onClick={handleDelete}>
                  {ROADMAP_UI.BTN_DELETE}
                </button>
                <button
                  className="route-action-btn cancel-btn"
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                >
                  {ROADMAP_UI.BTN_CANCEL}
                </button>
              </div>
            ) : (
              <button className="route-action-btn delete-btn" onClick={handleDelete}>
                <i className="fas fa-trash-alt"></i>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Extract validation issues grouped by item for a route's inventory.
 *
 * Strategy:
 * - Inventory's OWN errors (INVENTORY_*) go to inventoryIssues
 * - Item's OWN errors (not RECORD_VALIDATION_FAILED) go to the item group, navLevel='item'
 * - Record errors come from itemValidation.recordValidations directly (clean messages), navLevel='record'
 * - Each message carries navigation info so the nav button goes to the right level
 */
function getRouteValidationGrouped(validationResult, projectData, route) {
  const result = {
    totalErrors: 0,
    totalWarnings: 0,
    inventoryIssues: [],
    itemGroups: []
  };

  if (!validationResult || !projectData || !route) return result;

  const inventories = projectData.institution?.fond?.inventories || [];
  const targetInventories = route.inventoryNumber
    ? inventories.filter(inv => inv.number === route.inventoryNumber)
    : inventories;

  const inventoryValidations = validationResult.inventoryValidations || [];

  targetInventories.forEach(inventory => {
    const invEntry = inventoryValidations.find(v =>
      v.inventory?.id === inventory.id || v.inventory?.number === inventory.number
    );

    if (!invEntry || !invEntry.validation) return;

    const validation = invEntry.validation;

    // Inventory's OWN errors only (not aggregated item errors)
    if (validation.errors) {
      validation.errors.forEach(err => {
        // Skip aggregated item errors — we handle those per-item below
        if (err.id === 'ITEM_VALIDATION_FAILED') return;
        result.totalErrors++;
        result.inventoryIssues.push({
          type: 'error',
          message: stripHtml(err.message || err),
          inventoryId: inventory.id
        });
      });
    }
    if (validation.warnings) {
      validation.warnings.forEach(warn => {
        // Skip aggregated item warnings
        if (warn.id && warn.id.startsWith('ITEM_') || warn.id === 'RECORD_VALIDATION_FAILED') return;
        result.totalWarnings++;
        result.inventoryIssues.push({
          type: 'warning',
          message: stripHtml(warn.message || warn),
          inventoryId: inventory.id
        });
      });
    }

    // Walk itemValidations by index (parallel to inventory.items)
    const itemValidations = validation.itemValidations || [];
    const items = inventory.items || [];

    itemValidations.forEach((itemValidation, itemIdx) => {
      const item = items[itemIdx];
      if (!item) return;

      const group = {
        itemId: item.id,
        itemName: `GV ${item.number || '?'}${item.title ? ': ' + item.title : ''}`,
        inventoryId: inventory.id,
        errorCount: 0,
        warningCount: 0,
        messages: []
      };

      // Item's OWN errors (skip RECORD_VALIDATION_FAILED — we get those from recordValidations)
      if (itemValidation.errors) {
        itemValidation.errors.forEach(err => {
          if (err.id === 'RECORD_VALIDATION_FAILED') return;
          group.errorCount++;
          result.totalErrors++;
          group.messages.push({
            type: 'error',
            message: stripHtml(err.message || err),
            navLevel: 'item',
            inventoryId: inventory.id,
            itemId: item.id
          });
        });
      }
      if (itemValidation.warnings) {
        itemValidation.warnings.forEach(warn => {
          // Skip aggregated record warnings (they have the "Vienība X, Dokuments Y" prefix)
          if (warn.id === 'RECORD_VALIDATION_FAILED') return;
          // Skip warnings with prefixed messages (record-level warnings aggregated at item level)
          const msgStr = warn.message || '';
          if (msgStr.includes('Dokuments') && msgStr.includes(' - ')) return;
          group.warningCount++;
          result.totalWarnings++;
          group.messages.push({
            type: 'warning',
            message: stripHtml(warn.message || warn),
            navLevel: 'item',
            inventoryId: inventory.id,
            itemId: item.id
          });
        });
      }

      // Record-level errors from recordValidations (parallel to item.records)
      const recordValidations = itemValidation.recordValidations || [];
      const records = item.records || [];

      recordValidations.forEach((recValidation, recIdx) => {
        const record = records[recIdx];
        if (!record) return;

        if (recValidation.errors) {
          recValidation.errors.forEach(err => {
            group.errorCount++;
            result.totalErrors++;
            group.messages.push({
              type: 'error',
              message: stripHtml(err.message || err),
              navLevel: 'record',
              inventoryId: inventory.id,
              itemId: item.id,
              recordId: record.id
            });
          });
        }
        if (recValidation.warnings) {
          recValidation.warnings.forEach(warn => {
            group.warningCount++;
            result.totalWarnings++;
            group.messages.push({
              type: 'warning',
              message: stripHtml(warn.message || warn),
              navLevel: 'record',
              inventoryId: inventory.id,
              itemId: item.id,
              recordId: record.id
            });
          });
        }
      });

      // Only add items that have issues
      if (group.errorCount > 0 || group.warningCount > 0) {
        result.itemGroups.push(group);
      }
    });
  });

  // Limit item groups to first 10 for performance
  if (result.itemGroups.length > 10) {
    result.itemGroups = result.itemGroups.slice(0, 10);
  }

  return result;
}

export default SmartGuideCard;
