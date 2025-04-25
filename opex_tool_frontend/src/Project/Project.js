import React, {useState, useEffect } from "react";
/*Components*/
import ProjectPopup from "./ProjectPopup";
import Project_API from "../API/Project_API";
import WarningPopup from "./WarningPopup"; 
import RenameProjectPopup from "./RenameProjectPopup";
import UploadPopup from "./UploadPopup";
import Alert from "../Alert/Alert";
import ActiveProject from "./ActiveProject";
import Toast from "../Toast/Toast";
/*Constants*/
import { ERROR_MESSAGES , PROJECT_UI , TOAST_CONFIG } from "../Constants/Constnats";
/*Styles*/
import "./Project.css";
import "./ProjectPopup.css";

const Project = (props) => {
    const [data, setData] = useState(props.data || []);
    const [popupIsOpen, setPopupIsOpen] = useState(data.length === 0);
    const [renamePopupIsOpen, setRenamePopupIsOpen] = useState(false);
    const [projectToRename, setProjectToRename] = useState(null);
    const [warningPopupIsOpen, setWarningPopupIsOpen] = useState(false); 
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [uploadPopupIsOpen, setUploadPopupIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(null);
    const [activeProjectData, setActiveProjectData] = useState([]);
    const [activeDataVisable, setActiveDataVisable] = useState(true);
    const [toastVisable, setToastVisable] = useState(false);
    const [toastHeader, setToastHeader] = useState('');
    const [toastParagrapth, setToastParagrapth] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [addReportVisability,setAddReportVisability] = useState(true);
    const [tooltip, setTooltip] = useState(null);
    const [tooltipContent, setTooltipContent] = useState("");
    const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });

    const projectAPI = Project_API(); 

    const togglePopup = () => { setPopupIsOpen(!popupIsOpen);   };

    const toggleRenamePopup = () => {   setRenamePopupIsOpen(!renamePopupIsOpen);   };

    const toggleUploadPopup = () => {   setUploadPopupIsOpen(prev => !prev);    };

    const closeAlert = () => {  setShowAlert(false);    };

    const createProject = () => {   props.onProjectAdded();     };

    const openWarningPopup = (project) => {
        setProjectToDelete(project); 
        setWarningPopupIsOpen(true); 
    };

    const handleError = (error) => {
        setErrorMessage(error);
        setShowAlert(true);
    }

    const openRenamePopup = (project) => {
        setProjectToRename(project);
        setRenamePopupIsOpen(true);
    };

    const hideTooltip = () => {
        setTooltip(null);
        setTooltipContent("");
    };

    const handleActivateTab = async (id) => {
        setActiveTab(id);
        setAddReportVisability(true);
        await activateTab(id);
    }

    const handleUploadDone = async () => {
        await activateTab(activeTab);
        setShowAlert(false);
        setAddReportVisability(false);
        setUploadPopupIsOpen(false);
    };

    const handleToast = (h,p) =>{
        setToastHeader(h);
        setToastParagrapth(p);
        setToastVisable(true);

        setTimeout(() => {
            setToastVisable(false);
        }, TOAST_CONFIG.TIMER)
    }

    const deleteProject = async () => {
        if (!projectToDelete) return;
        const [success, result] = await projectAPI.delete_project(projectToDelete.id);
        if (success) {
            setData((prevData) => prevData.filter((project) => project.id !== projectToDelete.id));
            setWarningPopupIsOpen(false);
            setActiveTab(null);
            handleError(result);
        } else {
            handleError(result);
        }
    };

    const activateTab = async (id) =>{
        const [success, result] = await projectAPI.get_project(id);
        if(success) {
            setActiveProjectData(result);
            setShowAlert(false);
            setAddReportVisability(false);
        }else{
            setActiveProjectData(null);
            handleError(result);
        }
    };

    const renameProject = async (newName) => {
        if (!projectToRename) return;
        const [success, result] = await projectAPI.rename_project(projectToRename.id, { name: newName });
        if (success) {
            setData((prevData) =>
                prevData.map((proj) => (proj.id === projectToRename.id ? { ...proj, name: result.name, folder : result.folder} : proj))
            );
            handleActivateTab(projectToRename.id);
            toggleRenamePopup();
        } else {
            handleError(result);
        }
    };

    const copyToClipboard = (folder) => {
        navigator.clipboard.writeText(folder) // Use the Clipboard API
            .then(() => {
                handleToast("","Direktrorija Kopēta!");
            })
            .catch(err => {
                console.error("Failed to copy: ", err);
            });
    };

    const showTooltip = (project) => {
        // Set the tooltip content to show specific project data
        setTooltip("ALTER")
        setTooltipContent(`Izveidošanas Laiks: ${formatTimestamp(project.created_at) || "Not specified"}\nDirektorija: ${project.folder || "Not specified"}`);
    };

    const displayDetail = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const tooltipWidth = 200; // Set a fixed width for the tooltip
        const left = Math.max(rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2), 0); // Center above the button
        const top = rect.top + window.scrollY + 50; // Position it slightly above the button
    
        // Check right boundary
        const rightBoundary = window.innerWidth - 70;
        const adjustedLeft = left + tooltipWidth < rightBoundary ? rightBoundary - tooltipWidth : left;
        setTooltip("Add Project");
        setTooltipContent(PROJECT_UI.CREATE_PROJECT_BTN);
        setTooltipPosition({ left: adjustedLeft, top }); // Set the position
    }

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp); // Convert to Date object
    
        // Extracting date components
        const day = String(date.getUTCDate()).padStart(2, '0'); // Day (01-31)
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month (01-12)
        const year = String(date.getUTCFullYear()); // Last two digits of the year
        const hours = String(date.getUTCHours()).padStart(2, '0'); // Hours (00-23)
        const minutes = String(date.getUTCMinutes()).padStart(2, '0'); // Minutes (00-59)
        const seconds = String(date.getUTCSeconds()).padStart(2, '0'); // Seconds (00-59)
    
        // Formatting the output
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    };
    

    useEffect(() => {   setPopupIsOpen(data.length === 0);  }, [data.length]);

    return (
        <div className="project_tabs">
            {showAlert && <Alert message={errorMessage} onClose={closeAlert}/>}
            {toastVisable && <Toast header={toastHeader} paragraph={toastParagrapth}/>}
            {popupIsOpen && <ProjectPopup  onChange={togglePopup} onCreate={createProject} />}
            {renamePopupIsOpen && (<RenameProjectPopup value={renamePopupIsOpen} onChange={toggleRenamePopup} onRename={renameProject} project={projectToRename} />)}
            {warningPopupIsOpen && (<WarningPopup isOpen={warningPopupIsOpen} onClose={() => setWarningPopupIsOpen(false)} onConfirm={deleteProject} />)}
            {uploadPopupIsOpen && (<UploadPopup onClose={toggleUploadPopup} onDone={handleUploadDone} projectId ={activeTab} />)}
            <div className="project_tab_container">
                {data.length === 0 ? (
                    <div>
                        <input type="button" value={PROJECT_UI.CREATE_PROJECT_BTN} onClick={togglePopup} />
                        <p>{PROJECT_UI.PROJECT_STATEMENT_WHEN_EMPTY}</p>
                    </div>
                ) : (
                    <div>
                        <div>
                            
                            {/* Render Project Tabs */}
                            <div className="tabs">
                                {data.map((project) => (
                                    <div key={project.id} className="tab-wrapper">
                                        <button
                                            className={`tab_button ${activeTab === project.id ? 'active' : ''}`}
                                            onClick={() => handleActivateTab(project.id)}
                                            >
                                            <span className="project_name">{project.name}</span>
                                            <span 
                                                className="info-icon" 
                                                onMouseEnter={()=>showTooltip(project)} // Show tooltip on hover
                                                onMouseLeave={hideTooltip}
                                                onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(project.folder)
                                                        console.log(project.created_at)
                                                }} // Copy on click
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
                                 <input type="button" value={PROJECT_UI.CREATE_PROJECT_BTN_SHORT}  onMouseLeave={hideTooltip} onMouseEnter={(e) => displayDetail(e) } onClick={togglePopup} />
                                 {tooltip === "Add Project" && (                                            <div 
                                            className="tooltip2" 
                                            style={{ left: tooltipPosition.left, top: tooltipPosition.top, opacity: 1 }}
                                        >
                                            {tooltipContent}
                                        </div>)}
                            </div>

                            {/* Show details of the selected project */}
                            {activeTab && 
                                <div className="project_details">
                                    {data.filter(project => project.id === activeTab).map(project => (
                                       <div key={project.id} className="project_item">
                                       {!addReportVisability && 
                                           <button 
                                               onMouseEnter={() => setTooltip({ content: PROJECT_UI.PROJECT_RENAME_BTN, id: project.id })} 
                                               onMouseLeave={() => setTooltip(null)} 
                                               onClick={() => openRenamePopup(project)}
                                           >
                                               <i className="fas fa-edit"></i>
                                           </button>
                                       }
                                       {addReportVisability && 
                                           <button 
                                               onMouseEnter={() => setTooltip({ content: PROJECT_UI.PROJECT_ADD_REPORT_BTN, id: project.id })} 
                                               onMouseLeave={() => setTooltip(null)} 
                                               onClick={toggleUploadPopup}
                                           >
                                               <i className="fas fa-upload"></i>
                                           </button>
                                       }
                                       {!addReportVisability && 
                                           <button 
                                               onMouseEnter={() => setTooltip({ content: activeDataVisable ? PROJECT_UI.PROJECT_DETAILS_HIDE : PROJECT_UI.PROJECT_DETAILS_SHOW, id: project.id })} 
                                               onMouseLeave={() => setTooltip(null)} 
                                               onClick={() => setActiveDataVisable(!activeDataVisable)}
                                           >
                                               {activeDataVisable ? <i className="fas fa-arrow-up"></i> : <i className="fas fa-arrow-down"></i>}
                                           </button>
                                       }
                                       <button 
                                           onMouseEnter={() => setTooltip({ content: PROJECT_UI.PROJECT_DELETE_BTN, id: project.id })}
                                           onMouseLeave={() => setTooltip(null)}
                                           onClick={() => openWarningPopup(project)}
                                       >
                                           <i className="fas fa-trash"></i>
                                       </button>
                                   
                                       {tooltip?.id === project.id && (
                                            <div className="tooltip1">
                                                {tooltip.content}
                                            </div>
                                        )}
                                   </div>
                                    ))}
                                    {activeProjectData  && (<ActiveProject activeProjectData={activeProjectData} activeDataVisable={activeDataVisable}/>)}
                                </div>
                            }
                            
                        </div> 
                    </div>
                )}
            </div>
        </div>
    );
};

export default Project;
