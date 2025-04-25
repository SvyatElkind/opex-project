import React, { useState } from "react";
import Institution from "../Institution/Institution";
import Fond from "../Fond/Fond";
import Inventories from "../Inventory/Inventories";
import ProjectDetails from "./ProjectDetails";
import { INSTITUTION_CONSTANTS } from "../Constants/Constnats";
import './ActiveProject.css';

const ActiveProject = ({activeProjectData, activeDataVisable}) => {

    const [isInstitutionVisable,setIsInstitutionVisable] = useState(true);
    const [isFondVisable, setIsFondVisable] = useState(true);
    const [isInventoriesVisable, setIsInventoriesVisable] = useState(true);
    const [detailsVisable, setDetailVisable] = useState(false);


    return(
        <div className="ProjectPage">
            <div className="Project_Details">
                {activeProjectData && activeDataVisable && 
                <div className="Project_Details_Inner">
                        {activeProjectData.institution  && 
                        isInstitutionVisable && 
                        (
                            <div>
                                <h1>{activeProjectData.institution.name}</h1>
                                <p>{INSTITUTION_CONSTANTS.REG_FIELD} {activeProjectData.institution.reg_nr}</p>
                            </div>
                        )}
                        {/* Active Project Fond Data*/}
                        {activeProjectData.institution && 
                        activeProjectData.institution.fond && 
                        isFondVisable && (
                            <Fond fond ={activeProjectData.institution.fond}/>
                        )}
                    <div className="detailGrid">
                        {/* Active Project Institution Data*/}
                        {activeProjectData.institution  && 
                        isInstitutionVisable && 
                        (
                            <Institution institution={activeProjectData.institution}/>
                        )}
                    </div>
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