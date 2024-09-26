import React from 'react';
import './Alert.css';

const Alert = ({ message, onClose }) => {
    return (
        <div className="alert error-alert">
            <span className="closebtn" onClick={onClose}>&times;</span>
            {typeof message === 'string' ? message : JSON.stringify(message)} {/* Check if message is a string */}
        </div>
    );
};

export default Alert;