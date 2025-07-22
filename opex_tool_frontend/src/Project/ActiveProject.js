import React, { useState, useEffect } from "react";
import Institution from "../Institution/Institution";
import Fond from "../Fond/Fond";
import Inventories from "../Inventory/Inventories";
import { INSTITUTION_CONSTANTS } from "../Constants/Constnats";
import './ActiveProject.css';
import { useProject } from "../hooks/useProjects";
import { useNavigation } from "../Navigation/context/NavigationContext";

const ActiveProject = ({ projectId, activeDataVisable }) => {
    // Get the active project data using React Query
    const { data: activeProjectData, isLoading, error } = useProject(projectId);
    
    // Get navigation context to update project data
    const { updateProjectData } = useNavigation();

    // Local state for visibility controls with better defaults
    const [isInstitutionVisable, setIsInstitutionVisable] = useState(true);
    const [isFondVisable, setIsFondVisable] = useState(true);
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
            <div className="Project_Details">
                {activeProjectData && activeDataVisable && 
                    <div className="Project_Details_Inner">
                        {activeProjectData.institution && isInstitutionVisable && (
                            <div className="institution-header">
                                <h1>{activeProjectData.institution.name}</h1>
                                <p>
                                    <span className="reg-badge">
                                        {INSTITUTION_CONSTANTS.REG_FIELD} {activeProjectData.institution.reg_nr}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                }

                {/* Enhanced Fond Display */}
                {activeProjectData.institution && 
                activeProjectData.institution.fond && 
                isFondVisable && activeDataVisable && (
                    <div className="fond-section">
                        <Fond 
                            key={`fond-${activeProjectData.institution.fond.id}-${projectId}`}
                            fond={activeProjectData.institution.fond} 
                        />
                    </div>
                )}

                {/* Enhanced Institution Details */}
                {activeProjectData.institution && 
                isInstitutionVisable && activeDataVisable && (
                    <div className="detailGrid">
                        <Institution 
                            key={`institution-${activeProjectData.institution.id}-${projectId}`}
                            institutionId={activeProjectData.institution.id}
                            projectId={projectId}
                        />
                    </div>
                )}
            </div>

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