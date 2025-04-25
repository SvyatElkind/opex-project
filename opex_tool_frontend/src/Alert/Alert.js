import React from 'react';
import './Alert.css';

const Alert = ({ message, onClose }) => {
    const isErrorMessage = typeof message === 'object' && message?.error !== undefined;
    const isSuccessMessage = typeof message === 'object' && message?.success !== undefined;
    const isWarningMessage = typeof message === 'object'
    const alertClass = isErrorMessage ? 'error-alert' : isSuccessMessage ? 'success-alert' : 'warning-alert';

    try{
        console.log(message.reg_nr[0][0]);
        console.log(message.name[0][0]);
    }catch(e){console.log(e)}

    const renderMessage = () => {
        if (typeof message === 'string') {
            return message;
        }

        if (isErrorMessage || isSuccessMessage) {
            const key = isErrorMessage ? 'error' : 'success';
            return (
                <div>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {message[key]}
                </div>
            );
        }
        if (isWarningMessage) {
            const warnings = [];
            if (message?.reg_nr) {
                warnings.push(...message.reg_nr.map((item) => item[0]));
            }
            if (message?.name) {
                warnings.push(...message.name.map((item) => item[0]));
            }
            if (message?.file) {
                warnings.push(...message.file.map((item)=> item));
            }
            return (
                <div>
                    <strong>Warnings:</strong>
                    <ul>
                        {warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                        ))}
                    </ul>
                </div>
            );
        }


        return "An unexpected format.";
    };

    return (
        <div className={`alert ${alertClass}`} role="alert" aria-live="assertive">
            
            {renderMessage()}
            <span 
                className="closebtn" 
                onClick={onClose} 
                aria-label="Close alert"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onClose()}
            >
                &times;
            </span>
        </div>
    );
};

export default Alert;