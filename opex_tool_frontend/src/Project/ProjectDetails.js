import React from "react";

const ProjectDetails = ({activeProjectData}) =>{

    return(
        <div className="detailItem">
            <h1>{activeProjectData.name}</h1>
            <ul>
                <li>{activeProjectData.id}</li>
                <li>{activeProjectData.created_at}</li>
                <li>{activeProjectData.folder}</li>
                <li>{activeProjectData.report_status}</li>
                <li>{activeProjectData.validated}</li>
            </ul>
        </div>
    )

}

export default ProjectDetails;