/**
 * Utility functions for opening and managing the Help window
 */

/**
 * Opens the help documentation in a new browser window
 * @param {string|null} chapterId - Optional chapter ID to jump to a specific chapter
 * @param {string|null} sectionId - Optional section ID within that chapter, for an exact deep link
 * @param {object} windowOptions - Optional window configuration
 * @returns {Window|null} - Reference to the opened window, or null if blocked
 */
export const openHelpWindow = (chapterId = null, sectionId = null, windowOptions = {}) => {
    // Default window options
    const defaultOptions = {
        width: 1200,
        height: 800,
        menubar: 'no',
        toolbar: 'no',
        location: 'no',
        status: 'yes',
        scrollbars: 'yes',
        resizable: 'yes'
    };

    // Merge with custom options
    const options = { ...defaultOptions, ...windowOptions };

    // Build window features string
    const features = Object.entries(options)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');

    // Build URL with help query parameter and optional chapter[/section] hash
    const baseUrl = window.location.origin;
    const hash = chapterId
        ? (sectionId ? `${chapterId}/${sectionId}` : chapterId)
        : null;
    const url = hash
        ? `${baseUrl}/?help=true#${hash}`
        : `${baseUrl}/?help=true`;

    // Open the window
    const helpWindow = window.open(url, 'OpexHelpWindow', features);

    // Check if window was blocked
    if (!helpWindow || helpWindow.closed || typeof helpWindow.closed === 'undefined') {
        // Popup was blocked — dispatch event for toast notification
        window.dispatchEvent(new CustomEvent('showToast', {
            detail: { message: 'Palīdzības logs tika bloķēts. Lūdzu, atļaujiet uznirstošos logus šai vietnei.', type: 'warning' }
        }));
        return null;
    }

    // Focus the window
    helpWindow.focus();

    return helpWindow;
};

/**
 * Opens help to a specific chapter (and optional exact section within it)
 * @param {string} chapterId - The ID of the chapter to open
 * @param {string|null} sectionId - Optional section ID for an exact deep link
 */
export const openHelpChapter = (chapterId, sectionId = null) => {
    return openHelpWindow(chapterId, sectionId);
};

/**
 * Available chapter IDs for quick reference
 */
export const HELP_CHAPTER_IDS = {
    GETTING_STARTED: 'getting-started',
    PROJECTS: 'projects',
    INVENTORIES: 'inventories',
    ITEMS: 'items',
    RECORDS: 'records',
    VERIFICATION: 'verification',
    NAVIGATION: 'navigation',
    SETTINGS: 'settings',
    ROADMAP: 'roadmap',
    KEYBOARD_SHORTCUTS: 'keyboard-shortcuts',
};

/**
 * Helper function to open help from anywhere in the app
 * Usage examples:
 *
 * // Open help to first page
 * import { openHelp } from '../Utils/HelpWindow';
 * openHelp();
 *
 * // Open help to specific chapter (lands on that chapter's first section)
 * import { openHelp, HELP_CHAPTER_IDS } from '../Utils/HelpWindow';
 * openHelp(HELP_CHAPTER_IDS.PROJECTS);
 *
 * // Open help to an exact section within a chapter
 * openHelp(HELP_CHAPTER_IDS.PROJECTS, 'create-project-form');
 */
export const openHelp = openHelpWindow;

export default {
    openHelpWindow,
    openHelpChapter,
    openHelp,
    HELP_CHAPTER_IDS
};
