import React, { useState } from "react";
import Project_API from "../API/Project_API";
import "./UploadPopup.css";

const UploadPopup = ({ onClose , projectId}) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        const projectAPI = Project_API(); // Create an instance of Project_API

        if (file) { // Check if there's a file to upload
            try {
                const [success, result] = await projectAPI.uploadReport(projectId,file); // Use the upload method

                if (success) {
                    alert("File uploaded successfully: " + JSON.stringify(result)); // Notify user of success
                    onClose(); // Close the popup after successful upload
                } else {
                    alert("Error uploading file: " + result.message); // Notify user of error
                }
            } catch (error) {
                alert("Error uploading file: " + error.message); // General error handling
            }
        } else {
            alert("Please select a file to upload."); // Alert if no file is selected
        }
    };

    return (
        <div className="upload-popup">
            <h2>Aukšuplādēt Atskaiti</h2>
            <div
                className="dropzone"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{ border: "2px dashed #ccc", padding: "20px", textAlign: "center" }}
            >
                {file ? (
                    <p>{file.name}</p>
                ) : (
                    <p> Ievelciet atskaiti šeit vai nospiediet lai izvēlētos failu</p>
                )}
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="file-input" />
                <label htmlFor="file-input" style={{ cursor: 'pointer', color: 'blue' }}>Augšuplādēt</label>
            </div>
            <button onClick={handleUpload} disabled={!file}>Augšuplādēt</button>
            <button onClick={onClose}>Atcelt</button>
        </div>
    );
};

export default UploadPopup;