import React, { useEffect, useState } from 'react';
import Project from '../Project/Project';
import Project_API from '../API/Project_API';
import './Workspace.css'

const Workspace = () => {
    const [projectState, setProjectState] = useState([]);
    const [loading, setLoading] = useState(true);
    const projectAPI = Project_API(); 

    const fetchProjects = async () => {
        setLoading(true);
        const [success, response] = await projectAPI.connect_api();
        if (success) {
            setProjectState(response);
        } else {
            console.error("Error fetching projects:", response);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProjects(); 
    }, []); 

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="workspace_container">
            <Project data={projectState} onProjectAdded={fetchProjects} /> {/* Pass fetchProjects as a prop */}
        </div>
    );
};

export default Workspace;