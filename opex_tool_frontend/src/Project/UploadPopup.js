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
        if (!file) {
            alert("Please select a file to upload."); 
            return;
        }

        if (isLoading) {
            console.log('Upload already in progress, ignoring...');
            return;
        }

        console.log('File object:', file);
        console.log('File type:', typeof file);
        console.log('Is File instance:', file instanceof File);
        console.log('File name:', file?.name);
        console.log('File size:', file?.size);

        setIsLoading(true);
        setErrorMessage(''); // Clear any previous errors
        setShowAlert(false);

        try {
            const projectAPI = Project_API(); 
            const result = await projectAPI.uploadFileAsAttachment(projectId, file);
            
            
            console.log('Upload result:', result);
            
            // Check if result is in the expected format [success, data]
            if (Array.isArray(result) && result[0] === true) {
                setSuccessMessage("File uploaded successfully: " + JSON.stringify(result[1])); 
                setShowAlert(true);
                onClose();
                onDone(file); // Pass the file object, not projectId
            } else {
                // Handle unexpected result format
                setErrorMessage('Unexpected response format: ' + JSON.stringify(result));
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setErrorMessage(error.message || error.toString()); 
            setShowAlert(true);
        } finally {
            setIsLoading(false);
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