import React from 'react';
import './Alert.css';

const Alert = ({ message, onClose }) => {
    return (
        <div className="alert error-alert">
            <span className="closebtn" onClick={onClose}>&times;</span>
            {message} 
        </div>
    );
};

export default Alert;