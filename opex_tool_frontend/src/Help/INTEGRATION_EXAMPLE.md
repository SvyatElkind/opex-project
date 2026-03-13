# Integration Example

## How to Add Help Button to Workspace

Here's how to integrate the Help button into your existing Workspace component:

### Option 1: Floating Help Button (Recommended)

Add a floating help button in the bottom-right corner that's always visible:

```javascript
// In src/Workspace/Workspace.js

import HelpButton from '../Help/HelpButton';

function Workspace() {
    return (
        <div className="workspace">
            {/* Your existing Workspace content */}
            {/* ... */}

            {/* Add floating help button at the end */}
            <HelpButton iconOnly={true} className="floating" />
        </div>
    );
}
```

Add this CSS to position it properly:

```css
/* In src/Workspace/Workspace.css or src/Help/HelpButton.css */

.help-button.floating {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 9999; /* Make sure it's above other elements */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
```

### Option 2: Help Button in Navigation/Header

Add help button to your navigation bar or header:

```javascript
// In your navigation component
import HelpButton from '../Help/HelpButton';

function Navigation() {
    return (
        <nav className="navigation">
            {/* Other navigation items */}

            <HelpButton
                buttonText="Palīdzība"
                className="nav-help-button"
            />
        </nav>
    );
}
```

### Option 3: Context-Sensitive Help

Open help to relevant sections based on current view:

```javascript
// In src/Project/Project.js
import HelpButton from '../Help/HelpButton';
import { HELP_CHAPTER_IDS } from '../Utils/HelpWindow';

function Project() {
    return (
        <div className="project">
            <div className="project-header">
                <h1>Projekts</h1>
                <HelpButton
                    chapterId={HELP_CHAPTER_IDS.PROJECTS}
                    buttonText="Palīdzība par projektiem"
                    className="small"
                />
            </div>
            {/* Rest of project component */}
        </div>
    );
}
```

Similarly for other components:

```javascript
// Inventory component
<HelpButton chapterId={HELP_CHAPTER_IDS.INVENTORIES} />

// Item component
<HelpButton chapterId={HELP_CHAPTER_IDS.ITEMS} />

// Record component
<HelpButton chapterId={HELP_CHAPTER_IDS.RECORDS} />
```

### Option 4: Menu Item

Add help as a menu item:

```javascript
function AppMenu() {
    const handleHelpClick = () => {
        openHelp();
    };

    return (
        <div className="menu">
            <button onClick={handleHelpClick}>
                <i className="fas fa-question-circle"></i> Palīdzība
            </button>
        </div>
    );
}
```

## Quick Start Checklist

1. ✅ Import HelpButton component
2. ✅ Place it in your desired location
3. ✅ (Optional) Add chapterId for context-specific help
4. ✅ (Optional) Customize with className for styling
5. ✅ Test that it opens in a new window

## Testing

1. Run your development server: `npm start`
2. Click the help button
3. Verify:
   - New window opens
   - Correct chapter is displayed (if using chapterId)
   - Navigation works
   - Content displays correctly
   - Images load (or show placeholder)

## Troubleshooting

**Help window is blocked by popup blocker:**
- The utility shows an alert to the user
- User needs to allow popups for your site

**Help window opens but is blank:**
- Check browser console for errors
- Verify help.html is in public folder
- Ensure help.js entry point is configured

**Images don't load:**
- Verify images are in `public/help-images/`
- Check image paths in helpConstants.js
- Images should use absolute paths: `/help-images/filename.png`

**Styles don't match:**
- Ensure theme.css is imported in help.js
- Check Help.css is properly imported
