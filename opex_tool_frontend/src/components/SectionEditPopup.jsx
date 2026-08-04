import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { GeneralError, GeneralSuccess } from './ErrorDisplay';
import HelpButton from '../Help/HelpButton';
import './SectionEditPopup.css';

/**
 * SectionEditPopup — shared shell for the small "edit just this section"
 * popups on Item/Record detail pages. Handles the portal, overlay, header
 * (title + HelpButton), general/cross-section error banner, and footer
 * (Cancel/Save). Concrete popups supply their own fields as children.
 */
const SectionEditPopup = ({
    title,
    helpChapterId,
    helpSectionId,
    onClose,
    onSubmit,
    isSubmitting = false,
    generalError = null,
    isCrossSectionError = false,
    onOpenFullEdit = null,
    successMessage = null,
    children,
}) => {
    const [portalContainer] = useState(() => {
        const div = document.createElement('div');
        div.setAttribute('data-section-edit-portal', 'true');
        return div;
    });

    useEffect(() => {
        document.body.appendChild(portalContainer);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.removeChild(portalContainer);
            document.body.style.overflow = originalOverflow;
        };
    }, [portalContainer]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !isSubmitting) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose, isSubmitting]);

    return ReactDOM.createPortal(
        <div className="section-edit-popup-overlay">
            <form onSubmit={onSubmit} className="section-edit-popup-container">
                <div className="section-edit-popup-header">
                    <h2 className="section-edit-popup-title">{title}</h2>
                    <HelpButton chapterId={helpChapterId} sectionId={helpSectionId} iconOnly={true} className="small" />
                </div>

                {successMessage && (
                    <GeneralSuccess message={successMessage} onClose={() => {}} />
                )}

                {generalError && (
                    isCrossSectionError ? (
                        <div className="section-edit-popup-cross-error">
                            <div className="section-edit-popup-cross-error-message">{generalError}</div>
                            {onOpenFullEdit && (
                                <button
                                    type="button"
                                    className="section-edit-popup-cross-error-cta"
                                    onClick={onOpenFullEdit}
                                >
                                    Atvērt pilno rediģēšanas formu
                                </button>
                            )}
                        </div>
                    ) : (
                        <GeneralError message={generalError} onClose={() => {}} />
                    )
                )}

                <div className="section-edit-popup-body">
                    {children}
                </div>

                <div className="section-edit-popup-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="section-edit-popup-btn section-edit-popup-btn-cancel"
                    >
                        Atcelt
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="section-edit-popup-btn section-edit-popup-btn-primary"
                    >
                        {isSubmitting ? 'Saglabā...' : 'Saglabāt'}
                    </button>
                </div>
            </form>
        </div>,
        document.body
    );
};

export default SectionEditPopup;
