import React, { useState } from "react";
import Project from '../Project/Project';
import Alert from '../Alert/Alert';
import './Workspace.css';
import { WORKSPACE_UI } from '../Constants/Constnats';
import { useProjects } from '../hooks/useProjects';

const Workspace = () => {
    // Use the projects hook to fetch all projects
    const { data: projects, isLoading, error, refetch } = useProjects();

    // Added navigation state
    const [currentProject, setCurrentProject] = useState(null);
    const [currentInventory, setCurrentInventory] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);

    const handleNavigate = (type, id, parentId) => {
        switch(type) {
            case 'projects':
                setCurrentProject(null);
                setCurrentInventory(null);
                setCurrentItem(null);
                break;
            case 'project':
                setCurrentProject(id);
                setCurrentInventory(null);
                setCurrentItem(null);
                break;
            case 'inventory':
                setCurrentInventory(id);
                setCurrentItem(null);
                break;
            case 'item':
                setCurrentInventory(parentId);
                setCurrentItem(id);
                break;
            default:
                break;
        }
    };
    
    // Show loading indicator
    if (isLoading) {
        return <p className="loading">{WORKSPACE_UI.LOADING}</p>;
    }

    // Show error if any
    if (error) {
        return (
            <div className="workspace_container">
                <Alert 
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