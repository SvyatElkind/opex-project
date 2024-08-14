import React, { useState, useEffect } from "react";
import ProjectPopup from "./ProjectPopup";
import Project_API from "../API/Project_API"; // New API import
import WarningPopup from "./WarningPopup"; // Import the new warning popup
import RenameProjectPopup from "./RenameProjectPopup";
import UploadPopup from "./UploadPopup";

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
    const projectAPI = Project_API(); 

    const togglePopup = () => {
        setPopupIsOpen(!popupIsOpen);
    };

    const toggleRenamePopup = () => {
        setRenamePopupIsOpen(!renamePopupIsOpen);
    };

    const openWarningPopup = (project) => {
        setProjectToDelete(project); 
        setWarningPopupIsOpen(true); 
    };

    const deleteProject = async () => {
        if (!projectToDelete) return;
        const [success, result] = await projectAPI.delete_project(projectToDelete.id);
        if (success) {
            setData((prevData) => prevData.filter((project) => project.id !== projectToDelete.id));
            setWarningPopupIsOpen(false);
        } else {
            console.error("Unable to delete project:", result);
        }
    };

    const createProject = () => {
            props.onProjectAdded();
    };

    const openRenamePopup = (project) => {
        setProjectToRename(project);
        setRenamePopupIsOpen(true);
    };

    const toggleUploadPopup = () => {
        setUploadPopupIsOpen(prev => !prev);
    };

    const activateTab = async (id) =>{
        setActiveTab(id);
        if(!activeTab) return;
        const [success, result] = await projectAPI.get_project(activeTab);
        if(success) {
            console.log(success , result)
        }else{
            console.error("Unable to retreve project:", result);
        }
    };

    const renameProject = async (newName) => {
        if (!projectToRename) return;
        const [success, result] = await projectAPI.rename_project(projectToRename.id, { name: newName });
        if (success) {
            setData((prevData) =>
                prevData.map((proj) => (proj.id === projectToRename.id ? { ...proj, name: newName } : proj))
            );
            toggleRenamePopup();
        } else {
            console.error("Unable to rename project:", result);
        }
    };

    useEffect(() => {
        setPopupIsOpen(data.length === 0);
    }, [data.length]);

    return (
        <div className="project_tabs">
            <div>
                <input type="button" value="Izveidot Projektu" onClick={togglePopup} />
            </div>
            {popupIsOpen && <ProjectPopup value={popupIsOpen} onChange={togglePopup} onCreate={createProject} />}
            {renamePopupIsOpen && (<RenameProjectPopup value={renamePopupIsOpen} onChange={toggleRenamePopup} onRename={renameProject} project={projectToRename} />)}
            {warningPopupIsOpen && (<WarningPopup isOpen={warningPopupIsOpen} onClose={() => setWarningPopupIsOpen(false)} onConfirm={deleteProject} />)}
             {uploadPopupIsOpen && (<UploadPopup onClose={toggleUploadPopup} projectId ={activeTab}/>)}
            <div className="project_tab_container">
                {data.length === 0 ? (
                    <p>Projektu Sadaļa ir tukša, lūdzu izveidojiet Projektu</p>
                ) : (
                    <div>
                        {/* Render Project Tabs */}
                        <div className="project_tabs">
                            {data.map((project) => (
                                <button
                                    key={project.id}
                                    className={`tab_button ${activeTab === project.id ? 'active' : ''}`}
                                    onClick={() => activateTab(project.id)}
                                >
                                    {project.name}
                                </button>
                            ))}
                        </div>

                        {/* Show details of the selected project */}
                        {activeTab && 
                            <div className="project_details">
                                {data.filter(project => project.id === activeTab).map(project => (
                                    <div key={project.id} className="project_item">
                                        <h1>{project.name}</h1>
                                        <ul className="projectList">
                                            <li>ID: {project.id}</li>
                                            <li>Created At: {project.created_at}</li>
                                            <li>Directory: {project.folder}</li>
                                        </ul>
                                        <input type="button" value="pārdēvēt" onClick={() => openRenamePopup(project) } />
                                        <input type="button" value="Pievienot Atskaiti" onClick={toggleUploadPopup}/>
                                        <input type="button" value="Dzēst" onClick={() => openWarningPopup(project)} />

                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default Project;
