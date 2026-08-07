import React from 'react';
import { openHelp, HELP_CHAPTER_IDS } from '../Utils/HelpWindow';
import { HELP_UI } from '../Constants/Constants';
import './HelpButton.css';

/**
 * Reusable Help Button Component
 * Can be placed anywhere in the app to open help documentation
 *
 * Props:
 * - chapterId: Optional chapter ID to open
 * - sectionId: Optional section ID within that chapter, for an exact deep
 *   link to the section documenting this exact form (falls back to the
 *   chapter's first section if omitted or not found)
 * - buttonText: Optional custom button text
 * - iconOnly: If true, shows only icon without text
 * - className: Additional CSS classes
 * - onActivate: Optional click override. When given, the button does NOT open
 *   the help window and calls this instead. Used by the single top-bar button
 *   to arm the help picker; every in-form button leaves it unset and keeps
 *   opening its exact chapter on one click.
 * - isActive: Purely visual — marks the button as "currently armed".
 */
const HelpButton = ({
    chapterId = null,
    sectionId = null,
    buttonText = HELP_UI.HELP_BUTTON_TITLE,
    iconOnly = false,
    className = '',
    onActivate = null,
    isActive = false
}) => {
    const handleClick = () => {
        if (onActivate) {
            onActivate();
            return;
        }
        openHelp(chapterId, sectionId);
    };

    return (
        <button
            className={`help-button ${className} ${iconOnly ? 'icon-only' : ''} ${isActive ? 'help-button-active' : ''}`}
            onClick={handleClick}
            title={buttonText}
            aria-label={buttonText}
            aria-pressed={onActivate ? isActive : undefined}
            /* Picker-arming buttons stay clickable while the picker is armed,
               so clicking again toggles it off instead of picking the region
               the button happens to sit in. */
            data-help-picker-ignore={onActivate ? '' : undefined}
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
 * 2. Help button for specific chapter:
 *    <HelpButton chapterId={HELP_CHAPTER_IDS.PROJECTS} />
 *
 * 2b. Help button for the exact section documenting this form:
 *    <HelpButton chapterId={HELP_CHAPTER_IDS.PROJECTS} sectionId="create-project-form" />
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
