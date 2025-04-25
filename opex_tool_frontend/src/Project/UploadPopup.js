import React, { useState } from "react";
import Project_API from "../API/Project_API";
import "./UploadPopup.css";
import Alert from "../Alert/Alert";

const UploadPopup = ({ onClose ,onDone , projectId}) => {
    const [file, setFile] = useState(null);

    const [showAlert, setShowAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage,setSuccessMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const closeAlert = () =>{
        setShowAlert(false);
    }

    const handleUpload = async () => {
        if (file) {
            setIsLoading(true); // Set loading to true when starting the upload
            try {
                const projectAPI = Project_API(); 
                const [success, result] = await projectAPI.uploadFileAsAttachment(projectId, file);
                setIsLoading(false); // Reset loading state
    
                if (success) {
                    // Use the Alert component instead of alert
                    setSuccessMessage("File uploaded successfully: " + JSON.stringify(result)); 
                    setShowAlert(true);
                    onClose();
                    onDone(projectId);
                    
                } else {
                    setErrorMessage(JSON.stringify(result));
                    setShowAlert(true);
                }
            } catch (error) {
                setIsLoading(false); // Ensure loading state resets even on error
                setErrorMessage(error); // More descriptive error message
                setShowAlert(true);
            }
        } else {
            alert("Please select a file to upload."); 
        }
    };

    return (
    <div className="upload-popup">
        {showAlert && <Alert message={errorMessage} onClose={closeAlert} />}
        <h2>Upload Report</h2>
        <div
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()} 
            style={{ border: "2px dashed #007bff", padding: "20px", textAlign: "center", cursor: 'pointer' }}
        >
            {file ? (
                <p>{file.name}</p> 
            ) : (
                <p>Drag and drop a file here, or click to select a file</p> 
            )}
            <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="file-input" />
            <label htmlFor="file-input" style={{ cursor: 'pointer', color: 'blue' }}>Select File</label>
        </div>
        <button onClick={handleUpload} disabled={!file || isLoading}>
            {isLoading ? 'Uploading...' : 'Upload'}
        </button>
        <button onClick={onClose}>Cancel</button>
    </div>
);
};

export default UploadPopup;