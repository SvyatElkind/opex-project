import React from 'react';
import './Toast.css'; // Your CSS

const Toast = ({ header, paragraph }) => {
    return (
        <div className="toast">
            <h4>{header}</h4>
            <p>{paragraph}</p>
        </div>
    );
};

export default Toast;