import React from "react";

const ProjectDetails = ({activeProjectData}) =>{
    console.log("Project Details:");
    console.log(activeProjectData);

    return(
        <div className="detailItem">
            <ul>
                <li>{activeProjectData.folder}</li>
                <li>{activeProjectData.report_status}</li>
                <li>{activeProjectData.validated}</li>
            </ul>
        </div>
    )

}

export default ProjectDetails;