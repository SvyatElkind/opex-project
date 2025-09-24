import React, { useState, useEffect } from "react";
import Inventories from "../Inventory/Inventories";
import './ActiveProject.css';
import { useProject } from "../hooks/useProjects";
import { useNavigation } from "../Navigation/context/NavigationContext";

const ActiveProject = ({ projectId }) => {
    // Get the active project data using React Query
    const { data: activeProjectData, isLoading, error } = useProject(projectId);
    
    // Get navigation context to update project data
    const { updateProjectData } = useNavigation();
    const [isInventoriesVisable, setIsInventoriesVisable] = useState(true);

    // Update navigation context when project data changes
    useEffect(() => {
        if (activeProjectData && projectId) {
            updateProjectData(activeProjectData, projectId);
        }
    }, [activeProjectData, projectId, updateProjectData]);

    // Show loading state with enhanced styling
    if (isLoading) {
        return (
            <div className="ProjectPage">
                <div className="loading-indicator">
                    <div>Notiek projekta datu ielāde...</div>
                </div>
            </div>
        );
    }

    // Show error state (except for missing report which is handled by parent)
    if (error && !error.message?.includes("Nav importēta VVAIS atskaite")) {
        return (
            <div className="ProjectPage">
                <div className="error-indicator">
                    <h3>Kļūda ielādējot projektu</h3>
                    <p>{error.message}</p>
                </div>
            </div>
        );
    }

    // If no active project data, don't render anything
    if (!activeProjectData) {
        return null;
    }

    return (
        <div className="ProjectPage">
            {/* Enhanced Inventory Section */}
            {activeProjectData.institution && 
            activeProjectData.institution.fond && 
            activeProjectData.institution.fond.inventories &&
            isInventoriesVisable && (
                <div className="inventories-section">
                    <Inventories 
                        key={`inventories-${projectId}-${Date.now()}`}
                        projectId={projectId}
                        fondId={activeProjectData.institution.fond.id}
                        inventories={activeProjectData.institution.fond.inventories}
                    />
                </div>
            )}
        </div>
    );
};

export default ActiveProject;