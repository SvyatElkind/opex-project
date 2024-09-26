import React, { useState } from "react";
import Institution from "../Institution/Institution";
import Fond from "../Fond/Fond";
import Inventories from "../Inventory/Inventories";
import ProjectDetails from "./ProjectDetails";

const ActiveProject = ({activeProjectData, activeDataVisable}) => {

    const [isInstitutionVisable,setIsInstitutionVisable] = useState(true);
    const [isFondVisable, setIsFondVisable] = useState(true);
    const [isInventoriesVisable, setIsInventoriesVisable] = useState(true);
    const [detailsVisable, setDetailVisable] = useState(false);


    return(
        <div>
            <div>
                {activeProjectData && activeDataVisable && 
                <div className="detailGrid">
                {/* Project Data */}
                {activeProjectData &&(
                    <ProjectDetails activeProjectData={activeProjectData}/>
                )}
                {/* Active Project Institution Data*/}
                {activeProjectData.institution  && 
                isInstitutionVisable && 
                (
                    <Institution institution={activeProjectData.institution}/>
                )}
                {/* Active Project Fond Data*/}
                {activeProjectData.institution && 
                activeProjectData.institution.fond && 
                isFondVisable && (
                    <Fond fond ={activeProjectData.institution.fond}/>
                )}
                </div>
                }
            </div>
            {/* Active Project Inventory Data*/}
            {activeProjectData.institution && 
            activeProjectData.institution.fond && 
            activeProjectData.institution.fond.inventories &&
            isInventoriesVisable && (
                <Inventories 
                    inventories = {activeProjectData.institution.fond.inventories}
                    activeProjectData = {activeProjectData}        
                />
            )}
        </div>
    );
}

export default ActiveProject;