import React, { useState, useEffect, useRef, useCallback } from "react";
import ProjectPopup from "./ProjectPopup";
import WarningPopup from "./WarningPopup";
import RenameProjectPopup from "./RenameProjectPopup";
import UploadPopup from "./UploadPopup";
import { GeneralError } from '../components/ErrorDisplay';
import ActiveProject from "./ActiveProject";
import Toast from "../Toast/Toast";
import { NavigationProvider } from '../Navigation/context/NavigationContext';
import ProjectNavigation from '../Navigation/components/ProjectNavigation';
import { TOAST_CONFIG, PROJECT_UI } from "../Constants/Constants";
import useScrollDirection from "../hooks/useScrollDirection";
import VerificationModal from "../Verification/VerificationModal";
import InstitutionSignersPopup from '../Institution/InstitutionSignersPopup';
import './EmptyProjectState.css';

// Import custom hooks
import {
    useProjects,
    useProject,
    useRenameProject,
    useDeleteProject,
} from "../hooks/useProjects";

const Project = () => {
    // React Query hooks
    const { data: projectsListData = [], isLoading: projectsLoading } = useProjects();

    // Scroll direction hook
    const { scrollDirection, isScrolled } = useScrollDirection(100);

    // Local state
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [renamePopupIsOpen, setRenamePopupIsOpen] = useState(false);
    const [projectToRename, setProjectToRename] = useState(null);
    const [warningPopupIsOpen, setWarningPopupIsOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [uploadPopupIsOpen, setUploadPopupIsOpen] = useState(false);

    const [activeDataVisable, setActiveDataVisable] = useState(true);
    const [activeProjectVisable, setActiveProjectVisable] = useState(true);
    const [toastVisable, setToastVisable] = useState(false);
    const [toastHeader, setToastHeader] = useState('');
    const [toastParagrapth, setToastParagrapth] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [hasInteractedWithCreatePopup, setHasInteractedWithCreatePopup] = useState(false);
    const [hasInteractedWithUploadPopup, setHasInteractedWithUploadPopup] = useState(false);

    // Verification modal state
    const [verificationModalOpen, setVerificationModalOpen] = useState(false);

    // Institution signers popup state
    const [signersPopupOpen, setSignersPopupOpen] = useState(false);

    // Tab group visibility states
    const [tabGroupVisible, setTabGroupVisible] = useState(true);
    const [tabGroupAnimating, setTabGroupAnimating] = useState(false);


    const [tooltip, setTooltip] = useState(null);
    const [tooltipContent, setTooltipContent] = useState("");
    const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });

    // Refs for managing animations and measurements
    const tabGroupRef = useRef(null);
    const tabGroupSpacerRef = useRef(null);
    const animationTimeoutRef = useRef(null);

    // Get the selected project data
    const {
        data: activeProjectData,
        isLoading: projectLoading,
        error: projectError,
        refetch: refetchProject
    } = useProject(selectedProjectId);

    // Mutations for project operations
    const deleteProjectMutation = useDeleteProject();
    const renameProjectMutation = useRenameProject();

    // Check for missing report error
    const isMissingReport = projectError?.message?.includes("Nav importēta VVAIS atskite.");


    // Measure and maintain spacer height to prevent layout shifts
    useEffect(() => {
        if (tabGroupRef.current && tabGroupSpacerRef.current) {
            const height = tabGroupRef.current.offsetHeight;
            tabGroupSpacerRef.current.style.height = tabGroupVisible ? '0px' : `${height}px`;
        }
    }, [tabGroupVisible]);

    // Fixed: Auto-open upload popup (only once, respects manual close)
    useEffect(() => {
        if (selectedProjectId && 
            isMissingReport && 
            !uploadPopupIsOpen && 
            !projectLoading && 
            !hasInteractedWithUploadPopup) {
            setUploadPopupIsOpen(true);
        }
    }, [selectedProjectId, isMissingReport, uploadPopupIsOpen, projectLoading, hasInteractedWithUploadPopup]);

    // Fixed: Auto-open create project popup (only once, respects manual close)
    useEffect(() => {
        if (projectsListData.length === 0 && 
            !popupIsOpen && 
            !projectsLoading && 
            !hasInteractedWithCreatePopup) {
            setPopupIsOpen(true);
        }
    }, [projectsListData.length, popupIsOpen, projectsLoading, hasInteractedWithCreatePopup]);

    // Reset interaction flags when conditions change significantly
    useEffect(() => {
        if (projectsListData.length > 0) {
            setHasInteractedWithCreatePopup(false);
        }
    }, [projectsListData.length]);

    useEffect(() => {
        if (!isMissingReport || !selectedProjectId) {
            setHasInteractedWithUploadPopup(false);
        }
    }, [isMissingReport, selectedProjectId]);

    // Updated toggle functions to mark as interacted
    const togglePopup = () => {
        setPopupIsOpen(!popupIsOpen);
        setHasInteractedWithCreatePopup(true);
    };

    const toggleUploadPopup = () => {
        setUploadPopupIsOpen(!uploadPopupIsOpen);
        setHasInteractedWithUploadPopup(true);
    };

    // Auto-select first project if none selected
    useEffect(() => {
        if (projectsListData.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projectsListData[0].id);
        }
    }, [projectsListData, selectedProjectId]);

    // Generate CSS classes for tab group
    const getTabGroupClasses = useCallback(() => {
        const classes = ['project-tab-group'];

        if (isScrolled) classes.push('scrolled');
        if (tabGroupVisible) {
            classes.push('visible');
            if (tabGroupAnimating) classes.push('entering');
        } else {
            classes.push('hidden');
            if (tabGroupAnimating) classes.push('exiting');
        }

        return classes.join(' ');
    }, [tabGroupVisible, tabGroupAnimating, isScrolled]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);

    const toggleRenamePopup = () => {
        setRenamePopupIsOpen(!renamePopupIsOpen);
        if (renamePopupIsOpen) setProjectToRename(null);
    };

    const openRenamePopup = (project) => {
        setProjectToRename(project);
        setRenamePopupIsOpen(true);
    };

    const openWarningPopup = (project) => {
        setProjectToDelete(project);
        setWarningPopupIsOpen(true);
    };

    const closeAlert = () => setShowAlert(false);

    // Project operations
    const handleDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            await deleteProjectMutation.mutateAsync(projectToDelete.id);
            setWarningPopupIsOpen(false);
            setProjectToDelete(null);

            // Clear selection if deleted project was selected
            if (selectedProjectId === projectToDelete.id) {
                setSelectedProjectId(null);
            }

            handleToast("Success", "Project deleted successfully");
        } catch (error) {
            setErrorMessage(error.message);
            setShowAlert(true);
        }
    };

    const handleRenameProject = async (newName) => {
        if (!projectToRename) return;

        try {
            await renameProjectMutation.mutateAsync({
                projectId: projectToRename.id,
                newName: newName
            });

            toggleRenamePopup();
            handleToast("Success", "Project renamed successfully");
        } catch (error) {
            setErrorMessage(error.message);
            setShowAlert(true);
        }
    };

    // Tooltip handlers
    const showTooltip = (project) => {
        const content = `${PROJECT_UI.PROJECT_TOOLTIP_CREATED_AT} ${formatTimestamp(project.created_at)}\n${PROJECT_UI.PROJECT_TOOLTIP_DIR} ${project.folder}`;
        setTooltipContent(content);
        setTooltip(project.id);
    };

    const hideTooltip = () => {
        setTooltip(null);
        setTooltipContent("");
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            handleToast("Success", "Copied to clipboard");
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleActivateTab = (projectId) => {
        setSelectedProjectId(projectId);
    };

    // Project action handlers for navigation (removed since we moved them to tabs)
    const handleToggleDetails = () => { setActiveDataVisable(!activeDataVisable); };
    const handleProjectDetails = () => {
        // Open verification modal
        setVerificationModalOpen(true);
    };


    const handleUploadDone = async (projectId, file) => {
        try {
            console.log('Upload completed successfully, handling post-upload actions...');
            console.log('Project ID:', projectId);
            console.log('File:', file?.name);

            refetchProject();
            toggleUploadPopup();
            handleToast("Success", "Report uploaded successfully");

            console.log('Post-upload actions completed');
        } catch (error) {
            console.error('Error in post-upload actions:', error);
            setErrorMessage(error.message);
            setShowAlert(true);
        }
    };

    const handleToast = (h, p) => {
        setToastHeader(h);
        setToastParagrapth(p);
        setToastVisable(true);

        setTimeout(() => {
            setToastVisable(false);
        }, TOAST_CONFIG.TIMER);
    };

    console.log(activeProjectData);
    

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = String(date.getUTCFullYear());
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    };

    const handleDeleteFromMissingReport = () => {
        const selectedProject = projectsListData.find(p => p.id === selectedProjectId);
        if (selectedProject) {
            openWarningPopup(selectedProject);
        }
    };

    // Get the currently selected project data
    const selectedProject = projectsListData.find(p => p.id === selectedProjectId);

    return (
        <div className="project_tabs">
            {/* ALERT COMPONENT */}
            {showAlert && <GeneralError message={errorMessage} onClose={closeAlert} />}
            {/* TOAST COMPONENT */}
            {toastVisable && <Toast header={toastHeader} paragraph={toastParagrapth} />}
            {/* CREATE PROJECT POPUP  */}
            {popupIsOpen && <ProjectPopup onChange={togglePopup} />}
            {/* RENAEM PROJECT POPUP */}
            {renamePopupIsOpen && (
                <RenameProjectPopup
                    value={renamePopupIsOpen}
                    onChange={toggleRenamePopup}
                    onRename={handleRenameProject}
                    project={projectToRename}
                />
            )}
            {/* DELETE PROJECT WARNING POPUP */}
            {warningPopupIsOpen && (
                <WarningPopup
                    isOpen={warningPopupIsOpen}
                    onClose={() => setWarningPopupIsOpen(false)}
                    onConfirm={handleDeleteProject}
                    projectName={null}

                />
            )}
            {/* UPLOAD PROJECT REPORT POPUP */}
            {uploadPopupIsOpen && (
                <UploadPopup
                    onClose={toggleUploadPopup}
                    onDone={(file) => handleUploadDone(selectedProjectId, file)}
                    projectId={selectedProjectId}
                />
            )}
            {/* VERIFICATION MODAL - Moved inside NavigationProvider below */}

            <div className="project_tab_container">
                {projectsListData.length === 0 ? (
                    <div className="empty-project-state">
                        {/* Decorative background elements */}
                        <div className="empty-state-decoration">
                            <div className="decoration-circle"></div>
                            <div className="decoration-circle"></div>
                        </div>

                        {/* Icon */}
                        <div className="empty-state-icon">
                            <i className="fas fa-folder-plus"></i>
                        </div>

                        {/* Content */}
                        <div className="empty-state-content">
                            <h2 className="empty-state-title">{PROJECT_UI.PROJECT_EMPTY_HEADER}</h2>
                            <p className="empty-state-message">{PROJECT_UI.PROJECT_STATEMENT_WHEN_EMPTY}</p>
                        </div>

                        {/* Action Button */}
                        <button className="empty-state-btn" onClick={togglePopup}>
                            <i className="fas fa-plus"></i>
                            <span>{PROJECT_UI.CREATE_PROJECT_BTN}</span>
                        </button>
                    </div>
                ) : (
                    <div className="Project_Visable_group">
                        <div
                            ref={tabGroupRef}
                            className={getTabGroupClasses()}
                            data-scroll-state={`${scrollDirection}-${tabGroupVisible ? 'visible' : 'hidden'}`}
                        >
                            {/* Project Tabs - Collapsible */}
                            {tabGroupVisible && (
                                <div className="tabs compact">
                                    <div className="tabs-group">
                                        {projectsListData.map((project) => (
                                            <div key={project.id} className="tab-wrapper">
                                                <button
                                                    className={`tab_button ${selectedProjectId === project.id ? 'active expanded' : ''}`}
                                                    onClick={() => handleActivateTab(project.id)}
                                                >
                                                    <div className="tab-content">
                                                        <span className="project_name">{project.name}</span>

                                                        {/* Status Badges */}
                                                        <div className="tab-status-badges">
                                                            {project.validated && (
                                                                <span className="status-badge status-validated" title="Projekts validēts">
                                                                    <i className="fas fa-check-circle"></i>
                                                                </span>
                                                            )}
                                                            {project.report_status && (
                                                                <span className="status-badge status-report" title="VVAIS atskaite importēta">
                                                                    <i className="fas fa-file-excel"></i>
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Project Actions - Only visible on active tab */}
                                                        {selectedProjectId === project.id && (
                                                            <div className="tab-actions">
                                                                <button
                                                                    className="tab-action-btn rename"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openRenamePopup(project);
                                                                    }}
                                                                    title={PROJECT_UI.PROJECT_RENAME_BTN}
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                                <button
                                                                    className="tab-action-btn delete"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openWarningPopup(project);
                                                                    }}
                                                                    title={PROJECT_UI.PROJECT_DELETE_BTN}
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <span
                                                        className="info-icon"
                                                        data-tooltip={`${PROJECT_UI.PROJECT_TOOLTIP_CREATED_AT} ${formatTimestamp(project.created_at)}
${PROJECT_UI.PROJECT_TOOLTIP_DIR} ${project.folder}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyToClipboard(project.folder);
                                                        }}
                                                    >
                                                        <i className="fas fa-info-circle"></i>
                                                    </span>
                                                </button>
                                            </div>
                                        ))}
                                        {/* Add Project Button */}
                                        <input
                                            type="button"
                                            value={PROJECT_UI.CREATE_PROJECT_BTN_SHORT}
                                            onClick={togglePopup}
                                            title={PROJECT_UI.CREATE_PROJECT_BTN}
                                            className="add-project-btn"
                                        />
                                    </div>
                                    {/* Tab Controls - Only visible when tabs are expanded */}
                                    {tabGroupVisible && selectedProjectId && selectedProject && !isMissingReport && activeProjectData &&
                                        (<div className="right-side-project-menu">
                                            <div className="tab-controls">
                                                {/* Institution Signers Button */}
                                                {selectedProject && activeProjectData?.institution && (
                                                    <button
                                                        className="details-toggle-btn signers-btn"
                                                        onClick={() => setSignersPopupOpen(true)}
                                                        title="Pievienot parakstītājus"
                                                    >
                                                        <i className="fas fa-user-edit"></i>
                                                        <span>Parakstītāji</span>
                                                    </button>
                                                )}
                                                {/* Open Verification Structure */}
                                                {selectedProject && (
                                                    <button
                                                        className="details-toggle-btn"
                                                        onClick={handleProjectDetails}
                                                        title="View Project Verification Structure"
                                                    >
                                                        <i className="fas fa-clipboard-check"></i>
                                                        <span>Validēt</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>)
                                    } 
                                </div>
                            )}

                            {/* Show warning when report is missing */}
                            {selectedProjectId && selectedProject && isMissingReport && (
                                <div className="missing-report-message">
                                    {/* Warning Icon */}
                                    <div className="missing-report-icon">
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>

                                    {/* Content */}
                                    <div className="missing-report-content">
                                        <h3 className="missing-report-title">Atskaite Nav Pievienota</h3>
                                        <p className="missing-report-text">
                                            {PROJECT_UI.PROJECT_STATEMENT_WHEN_MISSING_REPORT}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="missing-report-actions">
                                        {!uploadPopupIsOpen && (
                                            <button 
                                                className="missing-report-btn-primary" 
                                                onClick={toggleUploadPopup}
                                            >
                                                <i className="fas fa-file-upload"></i>
                                                <span>{PROJECT_UI.PROJECT_ADD_REPORT_BTN}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Show details of the selected project */}
                            {selectedProjectId && selectedProject && !isMissingReport && activeProjectData && (
                                <div className="project_details">
                                    {/* Simplified Project Navigation without redundant buttons */}
                                    <NavigationProvider>
                                        <ProjectNavigation
                                            projectData={activeProjectData}
                                            selectedProject={selectedProject}
                                            onToggleDetails={handleToggleDetails}
                                        />

                                        <ActiveProject
                                            projectId={selectedProjectId}
                                            activeDataVisable={activeDataVisable}
                                            isActiveProjectVisable={activeProjectVisable}
                                        />

                                        {/* VERIFICATION MODAL - Inside NavigationProvider to share context */}
                                        <VerificationModal
                                            isOpen={verificationModalOpen}
                                            onClose={() => setVerificationModalOpen(false)}
                                            projectData={activeProjectData}
                                        />
                                    </NavigationProvider>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Institution Signers Popup - Outside NavigationProvider */}
            {signersPopupOpen && activeProjectData?.institution && (
                <InstitutionSignersPopup
                    institutionId={activeProjectData.institution.id}
                    projectId={activeProjectData.id}
                    onClose={() => setSignersPopupOpen(false)}
                />
            )}
        </div>
    );
};

export default Project;