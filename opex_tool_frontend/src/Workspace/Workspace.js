import React, { useState } from "react";
import Project from '../Project/Project';
import { GeneralError } from '../components/ErrorDisplay';
import './Workspace.css';
import { WORKSPACE_UI } from '../Constants/Constants';
import { useProjects } from '../hooks/useProjects';
/*
    Worksapce Container: Uses Hooks to initialize Project data
                        Navigation State Controll

    ### INPECT handleNavigate method ###
*/

const Workspace = () => {
    // Use the projects hook to fetch all projects
    const { data: projects, isLoading, error, refetch } = useProjects();

    // Added navigation state
    const [currentProject, setCurrentProject] = useState(null);
    const [currentInventory, setCurrentInventory] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    
    // Show loading indicator
    if (isLoading) {
        return <p className="loading">{WORKSPACE_UI.LOADING}</p>;
    }

    // Show error if any
    if (error) {
        return (
            <div className="workspace_container">
                <GeneralError
                    message={error.message || WORKSPACE_UI.ERROR}
                    onClose={() => refetch()}
                />
                <button onClick={() => refetch()}>Retry</button>
            </div>
        );
    }

    return (
       <div className="workspace_container"> 
            {/* Pass the navigation state to Project component */}
            <Project 
                initialProjectId={currentProject}
                initialInventoryId={currentInventory}
                initialItemId={currentItem}
            />
        </div>
    );
};

export default Workspace;