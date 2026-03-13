/**
 * Utility functions for opening and managing the Help window
 */

/**
 * Opens the help documentation in a new browser window
 * @param {string|null} chapterId - Optional chapter ID to jump to a specific section
 * @param {object} windowOptions - Optional window configuration
 * @returns {Window|null} - Reference to the opened window, or null if blocked
 */
export const openHelpWindow = (chapterId = null, windowOptions = {}) => {
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

    // Build URL with help query parameter and optional chapter hash
    const baseUrl = window.location.origin;
    const url = chapterId
        ? `${baseUrl}/?help=true#${chapterId}`
        : `${baseUrl}/?help=true`;

    // Open the window
    const helpWindow = window.open(url, 'OpexHelpWindow', features);

    // Check if window was blocked
    if (!helpWindow || helpWindow.closed || typeof helpWindow.closed === 'undefined') {
        console.warn('Help window was blocked by popup blocker');
        // You could show a message to the user here
        alert('Palīdzības logs tika bloķēts. Lūdzu, atļaujiet uznirstošos logus šai vietnei.');
        return null;
    }

    // Focus the window
    helpWindow.focus();

    return helpWindow;
};

/**
 * Opens help to a specific chapter
 * @param {string} chapterId - The ID of the chapter to open
 */
export const openHelpChapter = (chapterId) => {
    return openHelpWindow(chapterId);
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
    NAVIGATION: 'navigation'
};

/**
 * Helper function to open help from anywhere in the app
 * Usage examples:
 *
 * // Open help to first page
 * import { openHelp } from '../Utils/HelpWindow';
 * openHelp();
 *
 * // Open help to specific chapter
 * import { openHelp, HELP_CHAPTER_IDS } from '../Utils/HelpWindow';
 * openHelp(HELP_CHAPTER_IDS.PROJECTS);
 */
export const openHelp = openHelpWindow;

export default {
    openHelpWindow,
    openHelpChapter,
    openHelp,
    HELP_CHAPTER_IDS
};
