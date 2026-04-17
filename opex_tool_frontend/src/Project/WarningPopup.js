import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { PROJECT_DELETE_UI } from '../Constants/Constants';
import HelpButton from '../Help/HelpButton';
import './WarningPopup.css';

const WarningPopup = ({ isOpen, onClose, onConfirm, project = null, projectdata = null }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const hasConfirmed = useRef(false);

    // Calculate project statistics
    const projectStats = useMemo(() => {
        if (!projectdata) {
            return { inventories: 0, items: 0, records: 0, files: 0 };
        }

        let inventories = 0;
        let items = 0;
        let records = 0;
        let files = 0;

        // Get inventories from project data
        const inventoriesList = projectdata.institution?.fond?.inventories || [];
        inventories = inventoriesList.length;

        // Count items and records
        inventoriesList.forEach(inventory => {
            const itemsList = inventory.items || [];
            items += itemsList.length;

            itemsList.forEach(item => {
                // Count textual records
                const textRecords = item.records || [];
                records += textRecords.length;
                textRecords.forEach(record => {
                    files += (record.files || []).length;
                });

                // Count photo records
                const photoRecords = item.photo_records || [];
                records += photoRecords.length;
                photoRecords.forEach(record => {
                    files += (record.files || []).length;
                });

                // Count video records
                const videoRecords = item.video_records || [];
                records += videoRecords.length;
                videoRecords.forEach(record => {
                    files += (record.files || []).length;
                });

                // Count audio records
                const audioRecords = item.audio_records || [];
                records += audioRecords.length;
                audioRecords.forEach(record => {
                    files += (record.files || []).length;
                });
            });
        });

        return { inventories, items, records, files };
    }, [projectdata]);

    // Countdown timer effect
    useEffect(() => {
        if (!isDeleting || !isOpen) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (!hasConfirmed.current) {
            hasConfirmed.current = true;
            onConfirm();
        }
    }, [isDeleting, countdown, isOpen, onConfirm]);

    // Reset state when popup opens/closes
    useEffect(() => {
        if (isOpen) {
            setIsDeleting(false);
            setCountdown(10);
            hasConfirmed.current = false;
        }
    }, [isOpen]);

    const handleDeleteClick = () => {
        setIsDeleting(true);
    };

    const handleCancelClick = () => {
        if (isDeleting) {
            setIsDeleting(false);
            setCountdown(10);
            hasConfirmed.current = false;
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    const projectName = project?.name || 'Nezināms projekts';

    // Render the modal using React Portal
    return ReactDOM.createPortal(
        <div className="project-delete-overlay">
            <div className="project-delete-modal">
                {/* Header */}
                <div className="project-delete-header">
                    <h2 className="project-delete-title">
                        {isDeleting ? (
                            PROJECT_DELETE_UI.DELETE_DELETING
                        ) : (
                            <>
                                {PROJECT_DELETE_UI.DELETE_TITLE_PREFIX} <span className="project-name-highlight">"{projectName}"</span>{PROJECT_DELETE_UI.DELETE_TITLE_SUFFIX}
                            </>
                        )}
                    </h2>
                    {!isDeleting && (
                        <HelpButton chapterId="projects" iconOnly={true} className="project-delete-help-btn" />
                    )}
                </div>

                {/* Content */}
                <div className="project-delete-content">
                    {isDeleting ? (
                        <>
                            {/* Countdown Display */}
                            <div className="project-delete-countdown-wrapper">
                                <div className="project-delete-countdown-circle">
                                    <svg className="project-delete-countdown-svg" viewBox="0 0 100 100">
                                        <circle
                                            className="project-delete-countdown-bg"
                                            cx="50"
                                            cy="50"
                                            r="45"
                                        />
                                        <circle
                                            className="project-delete-countdown-progress"
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            style={{
                                                strokeDashoffset: `${283 - (283 * (10 - countdown) / 10)}`
                                            }}
                                        />
                                    </svg>
                                    <span className="project-delete-countdown-number">
                                        {countdown}
                                    </span>
                                </div>
                                <p className="project-delete-countdown-text">
                                    {PROJECT_DELETE_UI.DELETE_COUNTDOWN.replace('{countdown}', countdown)}
                                </p>
                            </div>

                            {/* Processing Message */}
                            <div className="project-delete-processing">
                                <div className="project-delete-spinner"></div>
                                <p>{PROJECT_DELETE_UI.DELETE_PREPARING}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Warning Message */}
                            <div className="project-delete-warning">
                                <p className="project-delete-warning-text">
                                    {PROJECT_DELETE_UI.DELETE_WARNING_TEXT}{' '}
                                    <strong>{PROJECT_DELETE_UI.DELETE_WARNING_STRONG}</strong>
                                    {PROJECT_DELETE_UI.DELETE_WARNING_CONTINUATION}
                                </p>
                            </div>

                            {/* Consequences List */}
                            <div className="project-delete-consequences">
                                <ul>
                                    <li>
                                        <i className="fas fa-times-circle"></i>
                                        <i className="fas fa-list-alt project-delete-type-icon"></i>
                                        <span className="project-delete-label">{PROJECT_DELETE_UI.INVENTORIES_LABEL}:</span>
                                        <strong className="project-delete-count">{projectStats.inventories}</strong>
                                    </li>
                                    <li>
                                        <i className="fas fa-times-circle"></i>
                                        <i className="fas fa-box project-delete-type-icon"></i>
                                        <span className="project-delete-label">{PROJECT_DELETE_UI.ITEMS_LABEL}:</span>
                                        <strong className="project-delete-count">{projectStats.items}</strong>
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="project-delete-actions">
                    <button
                        className="project-delete-btn project-delete-btn-cancel"
                        onClick={handleCancelClick}
                        disabled={isDeleting && countdown === 0}
                    >
                        {isDeleting ? PROJECT_DELETE_UI.DELETE_STOP : PROJECT_DELETE_UI.DELETE_CANCEL}
                    </button>
                    {!isDeleting && (
                        <button
                            className="project-delete-btn project-delete-btn-delete"
                            onClick={handleDeleteClick}
                        >
                            {PROJECT_DELETE_UI.DELETE_CONFIRM}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default WarningPopup;
