import React from 'react';
import { openHelp, HELP_CHAPTER_IDS } from '../Utils/HelpWindow';
import { HELP_UI } from '../Constants/Constants';
import './HelpButton.css';

/**
 * Reusable Help Button Component
 * Can be placed anywhere in the app to open help documentation
 *
 * Props:
 * - chapterId: Optional chapter ID to open specific section
 * - buttonText: Optional custom button text
 * - iconOnly: If true, shows only icon without text
 * - className: Additional CSS classes
 */
const HelpButton = ({
    chapterId = null,
    buttonText = HELP_UI.HELP_BUTTON_TITLE,
    iconOnly = false,
    className = ''
}) => {
    const handleClick = () => {
        openHelp(chapterId);
    };

    return (
        <button
            className={`help-button ${className} ${iconOnly ? 'icon-only' : ''}`}
            onClick={handleClick}
            title={buttonText}
            aria-label={buttonText}
        >
            <i className="fas fa-question-circle"></i>
            {!iconOnly && <span className="help-button-text">{buttonText}</span>}
        </button>
    );
};

export default HelpButton;

/**
 * Example Usage in Components:
 *
 * 1. Basic help button (opens to first page):
 *    <HelpButton />
 *
 * 2. Help button for specific section:
 *    <HelpButton chapterId={HELP_CHAPTER_IDS.PROJECTS} />
 *
 * 3. Icon-only button:
 *    <HelpButton iconOnly={true} />
 *
 * 4. Custom text:
 *    <HelpButton buttonText="Kā lietot?" />
 *
 * 5. With custom styling:
 *    <HelpButton className="my-custom-class" />
 */
