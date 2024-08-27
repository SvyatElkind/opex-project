import React, { useEffect, useState } from 'react';
import Project from '../Project/Project';
import Project_API from '../API/Project_API';
import Alert from '../Project/Alert';
import './Workspace.css';

const Workspace = () => {
    const [projectState, setProjectState] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAlert, setShowAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const projectAPI = Project_API(); 

    
    const closeAlert = () => {
        setShowAlert(false);
    }

    const handleError = (error) => {
        setErrorMessage(error);
        setShowAlert(true);
    }

    const fetchProjects = async () => {
        setLoading(true);
        const [success, response] = await projectAPI.connect_api();
        if (success) {
            setProjectState(response);
        } else {
            handleError(response);
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
             {showAlert && <Alert message={errorMessage} onClose={closeAlert}/>}
            <Project data={projectState} onProjectAdded={fetchProjects} /> {/* Pass fetchProjects as a prop */}
        </div>
    );
};

export default Workspace;