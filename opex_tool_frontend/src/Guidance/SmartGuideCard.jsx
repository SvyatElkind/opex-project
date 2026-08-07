import React, { useState, useEffect } from 'react';
import { useGuidance } from './GuidanceContext';
import { useWorkflowState } from './useWorkflowState';
import { useGuidanceEngine, ACTION_TYPES, getActionHelp } from './useGuidanceEngine';
import { openHelp } from '../Utils/HelpWindow';
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
    return html.replace(/<[^>]*>/g, '');
};

const DISMISSED_WARNINGS_KEY = 'opex_dismissed_warnings';

/**
 * "Explain this step" link for a guidance action. Renders nothing when the
 * action type has no documented chapter, so an undocumented action degrades to
 * just its navigation button rather than a link that goes nowhere.
 */
const ActionHelpLink = ({ action, title = 'Kā to izdarīt?' }) => {
  const help = getActionHelp(action);
  if (!help) return null;
  return (
    <button
      type="button"
      className="guide-help-btn"
      title={title}
      aria-label={title}
      onClick={(e) => {
        e.stopPropagation();
        openHelp(help.chapterId, help.sectionId);
      }}
    >
      <i className="fas fa-question-circle"></i>
    </button>
  );
};

const SmartGuideCard = ({ projectData, validationResult }) => {
  const {
    isVisible,
    isMinimized,
    setIsMinimized,
    setIsVisible,
    settings,
    shouldShowGuide
  } = useGuidance();

  const { getRoadmaps, calculateProgress, deleteRoute, updateRouteStatus } = useRoadmap();
  const { navigateTo } = useNavigation();

  // Accordion: only one route expanded at a time
  const [expandedRouteId, setExpandedRouteId] = useState(null);

  // Warning dismissal — shared with VerificationModal via localStorage.
  // Keyed per project: the card stays mounted while the user switches project
  // tabs, so the list has to be re-read whenever the active project changes,
  // otherwise project A's dismissals silently apply to project B.
  const projectId = projectData?.id;
  const [dismissedWarnings, setDismissedWarnings] = useState([]);

  useEffect(() => {
    if (!projectId) {
      setDismissedWarnings([]);
      return;
    }
    try {
      const stored = localStorage.getItem(DISMISSED_WARNINGS_KEY);
      setDismissedWarnings(stored ? (JSON.parse(stored)[projectId] || []) : []);
    } catch {
      setDismissedWarnings([]);
    }
  }, [projectId]);

  const saveDismissed = (updated) => {
    if (!projectId) return;
    setDismissedWarnings(updated);
    try {
      const stored = localStorage.getItem(DISMISSED_WARNINGS_KEY);
      const all = stored ? JSON.parse(stored) : {};
      all[projectId] = updated;
      localStorage.setItem(DISMISSED_WARNINGS_KEY, JSON.stringify(all));
    } catch {}
  };

  const isWarningDismissed = (msg) => dismissedWarnings.includes(msg);
  const dismissWarning = (key) => saveDismissed([...new Set([...dismissedWarnings, key])]);
  const dismissAllVisibleWarnings = (keys) => saveDismissed([...new Set([...dismissedWarnings, ...keys])]);

  // Get all routes for this project
  const routes = getRoadmaps(projectData?.id);

  // Filter to routes with active goals
  const activeRoutes = routes.filter(route =>
    route.goals?.totalItems > 0 && route.status !== ROUTE_STATUS.ARCHIVED
  );

  // Smart guidance engine
  const guidance = useGuidanceEngine(projectData, validationResult, activeRoutes[0] || null);

  const hasSigners = projectData?.institution?.creator && projectData?.institution?.signer;

  const handleGuidanceAction = (action) => {
    if (action.event) {
      window.dispatchEvent(new CustomEvent(action.event));
      return;
    }
    if (action.nav) {
      // Navigate first
      if (action.nav.type === 'inventory') {
        navigateTo('inventory', action.nav.id);
      } else if (action.nav.type === 'item') {
        navigateTo('item', action.nav.id, action.nav.inventoryId);
      } else if (action.nav.type === 'record') {
        navigateTo('record', action.nav.id, action.nav.inventoryId, action.nav.itemId);
      }

      // Then open the relevant form after a short delay (let navigation render first)
      setTimeout(() => {
        if (action.type === ACTION_TYPES.CREATE_ITEM) {
          window.dispatchEvent(new CustomEvent('guidanceOpenCreateItem'));
        } else if (action.type === ACTION_TYPES.CREATE_RECORD || action.type === ACTION_TYPES.UPLOAD_MEDIA) {
          window.dispatchEvent(new CustomEvent('guidanceOpenCreateRecord', {
            detail: { itemId: action.itemId }
          }));
        }
      }, 200);
    }
  };

  const { canExport } = useWorkflowState(
    projectData,
    validationResult,
    activeRoutes[0] || null
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

  // Is there anything worth surfacing? Drives 'auto' mode.
  const hasIssues = Boolean(
    guidance.globalActions.length > 0 ||
    guidance.inventoryActions.length > 0 ||
    validationResult?.summary?.totalErrors > 0 ||
    validationResult?.summary?.totalWarnings > 0
  );

  // `isVisible` is the user closing the card for this session; `shouldShowGuide`
  // applies the saved preference (master toggle + show mode) from Settings.
  if (!isVisible || !shouldShowGuide(hasIssues)) return null;

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
    <div className={`smart-guide-card ${settings.position || 'bottom-right'}`}>
      {/* Header with progress counts + quick actions */}
      <div className="smart-guide-header">
        <div className="header-left">
          <i className="fas fa-compass"></i>
          <h3>{GUIDANCE_UI.ROUTES_TITLE}</h3>
          {guidance.progress.itemTarget > 0 && (
            <span className="header-progress">
              {guidance.progress.items}/{guidance.progress.itemTarget}
            </span>
          )}
        </div>
        <div className="header-right">
          {/* Quick action icons */}
          <button className="icon-btn" onClick={() => window.dispatchEvent(new CustomEvent('openSignersModal'))} title="Parakstītāji">
            <i className="fas fa-user-edit"></i>
          </button>
          <button className="icon-btn" onClick={() => window.dispatchEvent(new CustomEvent('openValidationModal'))} title="Pārbaudīt">
            <i className="fas fa-clipboard-check"></i>
          </button>
          <button className="icon-btn" onClick={() => setIsMinimized(true)} title={GUIDANCE_UI.BTN_MINIMIZE}>
            <i className="fas fa-minus"></i>
          </button>
          <button className="icon-btn" onClick={() => setIsVisible(false)} title={GUIDANCE_UI.BTN_HIDE}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Current action — single clear button (skip signers — they have their own row below) */}
      {guidance.currentAction && guidance.currentAction.button && guidance.currentAction.type !== ACTION_TYPES.ADD_SIGNERS && (
        <div className="smart-guide-current">
          <button
            className={`guide-main-btn guide-main-btn-${guidance.currentAction.severity || 'medium'}`}
            onClick={() => handleGuidanceAction(guidance.currentAction)}
          >
            <span>{guidance.currentAction.button}</span>
            <i className="fas fa-arrow-right"></i>
          </button>
          <ActionHelpLink action={guidance.currentAction} />
        </div>
      )}

      {/* Global quick actions */}
      {!hasSigners && (
        <div className="guide-inventory-summary">
          <div className="guide-inv-row guide-inv-row-global">
            <div className="guide-inv-header">
              <i className="fas fa-user-edit" style={{ color: 'var(--color-warning)' }}></i>
              <span className="guide-inv-label">Atbildīgās personas</span>
              <span className="guide-inv-remaining" style={{ color: 'var(--color-error)' }}>!</span>
            </div>
            <button
              className="guide-inv-action-btn"
              onClick={() => window.dispatchEvent(new CustomEvent('openSignersModal'))}
              title="Pievienot atbildīgās personas"
            >
              Pievienot <i className="fas fa-arrow-right"></i>
            </button>
            <ActionHelpLink action={{ type: ACTION_TYPES.ADD_SIGNERS }} />
          </div>
        </div>
      )}

      {/* Per-Inventory — action buttons by type */}
      {guidance.inventoryActions.length > 0 && (
        <div className="guide-inventory-summary">
          {guidance.inventoryActions.map(invAction => {
            const isMedia = invAction.category === 'ELECTRONIC_MEDIA' || invAction.category === 'MEDIA';
            const isElectronicDocs = invAction.category === 'ELECTRONIC_DOCUMENTS';
            const recordLabel = isMedia ? invAction.inventoryType : 'Dok.';

            // Group actions by type and get counts
            const itemActions = invAction.actions.filter(a => a.type === ACTION_TYPES.CREATE_ITEM);
            const recordActions = invAction.actions.filter(a => a.type === ACTION_TYPES.CREATE_RECORD || a.type === ACTION_TYPES.UPLOAD_MEDIA);
            const fileActions = invAction.actions.filter(a => a.type === ACTION_TYPES.UPLOAD_FILE);

            return (
              <div key={invAction.inventoryId} className="guide-inv-row">
                <div className="guide-inv-header">
                  <span className="guide-inv-label">{invAction.label}</span>
                  <span className="guide-inv-counts-inline">
                    {invAction.counts.items} GV · {invAction.counts.records} {recordLabel}
                    {isElectronicDocs && ` · ${invAction.counts.files} Dat.`}
                  </span>
                </div>
                <div className="guide-inv-actions">
                  {itemActions.length > 0 && (
                    <button
                      className="guide-inv-action-chip"
                      onClick={() => handleGuidanceAction(itemActions[0])}
                      title={`${itemActions.length} GV jāizveido`}
                    >
                      <i className="fas fa-plus"></i>
                      <span>GV</span>
                      <span className="guide-chip-count">{itemActions.length}</span>
                    </button>
                  )}
                  {recordActions.length > 0 && (
                    <button
                      className="guide-inv-action-chip"
                      onClick={() => handleGuidanceAction(recordActions[0])}
                      title={`${recordActions.length} ${recordLabel} jāizveido`}
                    >
                      <i className={`fas ${isMedia ? 'fa-upload' : 'fa-file-alt'}`}></i>
                      <span>{isMedia ? invAction.inventoryType : 'Dok.'}</span>
                      <span className="guide-chip-count">{recordActions.length}</span>
                    </button>
                  )}
                  {fileActions.length > 0 && (
                    <button
                      className="guide-inv-action-chip"
                      onClick={() => handleGuidanceAction(fileActions[0])}
                      title={`${fileActions.length} datnes jāaugšupielādē`}
                    >
                      <i className="fas fa-paperclip"></i>
                      <span>Datne</span>
                      <span className="guide-chip-count">{fileActions.length}</span>
                    </button>
                  )}
                  {itemActions.length === 0 && recordActions.length === 0 && fileActions.length === 0 ? (
                    <span className="guide-inv-done"><i className="fas fa-check"></i> Pabeigts</span>
                  ) : (
                    /* Docs for whatever this inventory is actually blocked on next */
                    <ActionHelpLink action={invAction.actions[0]} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
              isWarningDismissed={isWarningDismissed}
              dismissWarning={dismissWarning}
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
  projectId, isExpanded, onToggle,
  isWarningDismissed, dismissWarning
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

      {/* Expanded: grouped & deduplicated issues */}
      {isExpanded && (
        <div className="route-details">
          {(() => {
            // Collect ALL issues (inventory + item level) into one list
            const allIssues = [];

            // Inventory-level issues
            routeValidation.inventoryIssues
              .filter(issue => issue.type === 'error' || !isWarningDismissed(`US ${issue.inventoryId}::${issue.message}`))
              .forEach(issue => {
                allIssues.push({
                  type: issue.type,
                  message: stripHtml(issue.message),
                  count: 1,
                  firstNav: () => handleNavigateToInventory(issue),
                  dismissKey: issue.type === 'warning' ? `US ${issue.inventoryId}::${issue.message}` : null,
                });
              });

            // Item-level issues — group by message
            const msgMap = {};
            routeValidation.itemGroups.forEach(group => {
              group.messages
                .filter(msg => msg.type === 'error' || !isWarningDismissed(`GV ${msg.itemId}::${msg.message}`))
                .forEach(msg => {
                  const key = `${msg.type}::${msg.message}`;
                  if (!msgMap[key]) {
                    msgMap[key] = {
                      type: msg.type,
                      message: msg.message,
                      count: 0,
                      firstNav: () => handleNavigateToMessage(msg),
                      dismissKey: msg.type === 'warning' ? `GV ${msg.itemId}::${msg.message}` : null,
                      items: [],
                    };
                  }
                  msgMap[key].count++;
                  msgMap[key].items.push(group.itemName);
                });
            });

            Object.values(msgMap).forEach(grouped => allIssues.push(grouped));

            // Sort: errors first, then warnings
            allIssues.sort((a, b) => {
              if (a.type === 'error' && b.type !== 'error') return -1;
              if (a.type !== 'error' && b.type === 'error') return 1;
              return b.count - a.count; // Higher count first within same type
            });

            if (allIssues.length === 0) {
              return (
                <div className="no-issues">
                  <i className="fas fa-check-circle"></i>
                  <span>{GUIDANCE_UI.NO_ISSUES}</span>
                </div>
              );
            }

            return (
              <div className="route-issues-list">
                {allIssues.map((issue, idx) => (
                  <div key={idx} className={`route-issue-item ${issue.type}`}>
                    <div className="issue-info">
                      <i className={`fas ${issue.type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}`}></i>
                      <span className="issue-message">
                        {issue.message}
                        {issue.count > 1 && (
                          <span className="issue-count-badge">
                            {issue.count} GV
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="guide-issue-actions">
                      {issue.dismissKey && (
                        <button
                          className="issue-nav-btn guide-dismiss-single"
                          onClick={(e) => { e.stopPropagation(); dismissWarning(issue.dismissKey); }}
                          title="Ignorēt"
                        >
                          <i className="fas fa-eye-slash"></i>
                        </button>
                      )}
                      <button
                        className="issue-nav-btn"
                        onClick={(e) => { e.stopPropagation(); issue.firstNav(); }}
                        title={GUIDANCE_UI.BTN_NAVIGATE}
                      >
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

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
        if ((warn.id && warn.id.startsWith('ITEM_')) || (warn.id && warn.id === 'RECORD_VALIDATION_FAILED')) return;
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
    const totalGroups = result.itemGroups.length;
    result.itemGroups = result.itemGroups.slice(0, 10);
    result.truncatedCount = totalGroups - 10;
  }

  return result;
}

export default SmartGuideCard;
