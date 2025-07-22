import React, { useState, useEffect } from "react";
import ProjectPopup from "./ProjectPopup";
import WarningPopup from "./WarningPopup"; 
import RenameProjectPopup from "./RenameProjectPopup";
import UploadPopup from "./UploadPopup";
import Alert from "../Alert/Alert";
import ActiveProject from "./ActiveProject";
import Toast from "../Toast/Toast";
import { NavigationProvider } from '../Navigation/context/NavigationContext';
import ProjectNavigation from '../Navigation/components/ProjectNavigation';
import { TOAST_CONFIG, PROJECT_UI } from "../Constants/Constnats";
import "./Project.css";
import "./ProjectPopup.css";

// Import custom hooks
import { 
    useProjects,
    useProject,
    useCreateProject,
    useRenameProject,
    useDeleteProject,
    useUploadReport
} from "../hooks/useProjects";

const Project = () => {
    // React Query hooks
    const { data: projectsListData = [], isLoading: projectsLoading } = useProjects();
    
    // Local state
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [renamePopupIsOpen, setRenamePopupIsOpen] = useState(false);
    const [projectToRename, setProjectToRename] = useState(null);
    const [warningPopupIsOpen, setWarningPopupIsOpen] = useState(false); 
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [uploadPopupIsOpen, setUploadPopupIsOpen] = useState(false);
    
    const [activeDataVisable, setActiveDataVisable] = useState(true);
    const [toastVisable, setToastVisable] = useState(false);
    const [toastHeader, setToastHeader] = useState('');
    const [toastParagrapth, setToastParagrapth] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const [tooltip, setTooltip] = useState(null);
    const [tooltipContent, setTooltipContent] = useState("");
    const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });

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
    const uploadReportMutation = useUploadReport();

    // Check for missing report error
    const isMissingReport = projectError?.message?.includes("Nav importēta VVAIS atskite.");

    // Auto show upload report dialog when the report is missing
    useEffect(()=>{
        setUploadPopupIsOpen(isMissingReport);
    },[isMissingReport])
    // Update UI based on project list
    useEffect(() => {
        setPopupIsOpen(projectsListData.length === 0);
        
        // Select first project if none selected and projects are available
        if (projectsListData.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projectsListData[0].id);
        }
    }, [projectsListData, selectedProjectId]);

    // Handle project error
    useEffect(() => {
        if (projectError && !isMissingReport) {
            setErrorMessage(projectError.message);
            setShowAlert(true);
        }
    }, [projectError, isMissingReport]);

    const togglePopup = () => { 
        setPopupIsOpen(!popupIsOpen);
    };

    const toggleRenamePopup = () => {
        setRenamePopupIsOpen(!renamePopupIsOpen);
    };

    const toggleUploadPopup = () => {
        setUploadPopupIsOpen(prev => !prev);
    };

    const closeAlert = () => {
        setShowAlert(false);
    };

    const openWarningPopup = (project) => {
        setProjectToDelete(project); 
        setWarningPopupIsOpen(true); 
    };

    const openRenamePopup = (project) => {
        setProjectToRename(project);
        setRenamePopupIsOpen(true);
    };

    const hideTooltip = () => {
        setTooltip(null);
        setTooltipContent("");
    };

    const handleActivateTab = (projectId) => {
        setSelectedProjectId(projectId);
    };

    // Project action handlers for navigation
    const handleToggleDetails = () => {
        setActiveDataVisable(!activeDataVisable);
    };

    const handleRenameFromNav = (project) => {
        openRenamePopup(project);
    };

    const handleDeleteFromNav = (project) => {
        openWarningPopup(project);
    };

    const handleUploadDone = async (projectId, file) => {
        try {
            console.log('Upload completed successfully, handling post-upload actions...');
            console.log('Project ID:', projectId);
            console.log('File:', file?.name);
            // Refetch the project data to get the updated state
            refetchProject();
            
            // Close the upload popup
            toggleUploadPopup();
            
            // Show success message
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

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;
        
        try {
            await deleteProjectMutation.mutateAsync(projectToDelete.id);
            
            setWarningPopupIsOpen(false);
            
            // If we deleted the currently selected project,
            // select the first available project instead
            if (selectedProjectId === projectToDelete.id) {
                const remainingProjects = projectsListData.filter(p => p.id !== projectToDelete.id);
                if (remainingProjects.length > 0) {
                    setSelectedProjectId(remainingProjects[0].id);
                } else {
                    setSelectedProjectId(null);
                }
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
                newName 
            });
            
            toggleRenamePopup();
            handleToast("Success", "Project renamed successfully");
        } catch (error) {
            setErrorMessage(error.message);
            setShowAlert(true);
        }
    };

    const copyToClipboard = (folder) => {
        navigator.clipboard.writeText(folder)
            .then(() => {
                handleToast("", "Direktrorija Kopēta!");
            })
            .catch(err => {
                console.error("Failed to copy: ", err);
            });
    };

    const showTooltip = (project) => {
        setTooltip("ALTER");
        setTooltipContent(`Izveidošanas Laiks: ${formatTimestamp(project.created_at) || "Not specified"}\nDirektorija: ${project.folder || "Not specified"}`);
    };

    const displayDetail = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const tooltipWidth = 200;
        const left = Math.max(rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2), 0);
        const top = rect.top + window.scrollY + 50;
    
        const rightBoundary = window.innerWidth - 70;
        const adjustedLeft = left + tooltipWidth < rightBoundary ? rightBoundary - tooltipWidth : left;
        setTooltip("Add Project");
        setTooltipContent(PROJECT_UI.CREATE_PROJECT_BTN);
        setTooltipPosition({ left: adjustedLeft, top });
    };

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

    const handleDeleteFromMissingReport = () =>{
        handleDeleteFromNav(selectedProject);
    }

    // Get the currently selected project data
    const selectedProject = projectsListData.find(p => p.id === selectedProjectId);

    return (
        <div className="project_tabs">
            {showAlert && <Alert message={errorMessage} onClose={closeAlert}/>}
            {toastVisable && <Toast header={toastHeader} paragraph={toastParagrapth}/>}
            {popupIsOpen && <ProjectPopup onChange={togglePopup} />}
            {renamePopupIsOpen && (
                <RenameProjectPopup 
                    value={renamePopupIsOpen} 
                    onChange={toggleRenamePopup} 
                    onRename={handleRenameProject} 
                    project={projectToRename} 
                />
            )}
            {warningPopupIsOpen && (
                <WarningPopup 
                    isOpen={warningPopupIsOpen} 
                    onClose={() => setWarningPopupIsOpen(false)} 
                    onConfirm={handleDeleteProject} 
                />
            )}
            {uploadPopupIsOpen && (
                <UploadPopup 
                    onClose={toggleUploadPopup} 
                    onDone={(file) => handleUploadDone(selectedProjectId, file)} 
                    projectId={selectedProjectId} 
                />
            )}
            <div className="project_tab_container">
                {projectsListData.length === 0 ? (
                    <div>
                        <input type="button" value={PROJECT_UI.CREATE_PROJECT_BTN} onClick={togglePopup} />
                        <p>{PROJECT_UI.PROJECT_STATEMENT_WHEN_EMPTY}</p>
                    </div>
                ) : (
                    <div>
                        <div>
                            {/* Project Tabs */}
                            <div className="tabs">
                                <div className="tabs-group">
                                    {projectsListData.map((project) => (
                                        <div key={project.id} className="tab-wrapper">
                                            <button
                                                className={`tab_button ${selectedProjectId === project.id ? 'active' : ''}`}
                                                onClick={() => handleActivateTab(project.id)}
                                            >
                                                <span className="project_name">{project.name}</span>
                                                <span 
                                                    className="info-icon" 
                                                    onMouseEnter={() => showTooltip(project)}
                                                    onMouseLeave={hideTooltip}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(project.folder);
                                                    }}
                                                >
                                                    <i className="fas fa-info-circle"></i>
                                                </span>
                                            </button>
                                            {tooltip === "ALTER" && (
                                                <div className="tooltip">
                                                    {tooltipContent}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <input 
                                    type="button" 
                                    value={PROJECT_UI.CREATE_PROJECT_BTN_SHORT}  
                                    onMouseLeave={hideTooltip} 
                                    onMouseEnter={(e) => displayDetail(e)} 
                                    onClick={togglePopup} 
                                />
                                {tooltip === "Add Project" && (
                                    <div 
                                        className="tooltip2" 
                                        style={{ left: tooltipPosition.left, top: tooltipPosition.top, opacity: 1 }}
                                    >
                                        {tooltipContent}
                                    </div>
                                )}
                            </div>

                            {/* Project Loading Indicator */}
                            {projectLoading && (
                                <div className="loading-indicator">
                                    Loading project data...
                                </div>
                            )}

                            {/* Missing Report Message */}
                            {selectedProjectId && isMissingReport && (
                                <div className="warning-message" style={{
                                    padding: '15px',
                                    margin: '10px 0',
                                    backgroundColor: 'rgba(255, 255, 0, 0.2)',
                                    border: '1px solid #ffc107',
                                    color: '#856404',
                                    borderRadius: '5px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h3>Nav importēta VVAIS atskaite</h3>
                                        <p>Šim projektam nav pievienota atskaite. Lūdzu, pievienojiet atskaiti, lai turpinātu darbu.</p>
                                    </div>
                                    <div>
                                        {!uploadPopupIsOpen && (<button 
                                        onClick={toggleUploadPopup}
                                        style={{
                                            padding: '10px 15px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                        >
                                            {PROJECT_UI.PROJECT_ADD_REPORT_BTN}
                                        </button>)}
                                        <button
                                        onClick={handleDeleteFromMissingReport}
                                                                                style={{
                                                padding: '10px 15px',
                                                backgroundColor: '#c72d2dff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                        {PROJECT_UI.PROJECT_DELETE_BTN}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Show details of the selected project */}
                            {selectedProjectId && selectedProject && !isMissingReport && activeProjectData && (
                                <div className="project_details">
                                    {/* Enhanced Project Navigation with Actions */}
                                    <NavigationProvider>
                                        <ProjectNavigation 
                                            projectData={activeProjectData}
                                            selectedProject={selectedProject}
                                            activeDataVisible={activeDataVisable}
                                            onToggleDetails={handleToggleDetails}
                                            onRenameProject={handleRenameFromNav}
                                            onDeleteProject={handleDeleteFromNav}
                                        />
                                        
                                        <ActiveProject 
                                            projectId={selectedProjectId} 
                                            activeDataVisable={activeDataVisable} 
                                        />
                                    </NavigationProvider>
                                </div>
                            )}
                        </div> 
                    </div>
                )}
            </div>
        </div>
    );
};

export default Project;