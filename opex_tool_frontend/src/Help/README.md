# Help System Documentation

## Overview

The Help system provides comprehensive documentation for the OPEX tool in a separate browser window. It features a two-panel layout with chapter navigation on the left and content display on the right.

## Structure

```
src/
├── Help/
│   ├── Help.js              # Main Help component
│   ├── Help.css             # Help component styles
│   ├── HelpButton.js        # Reusable help button component
│   ├── HelpButton.css       # Help button styles
│   └── README.md            # This file
├── Constants/
│   └── helpConstants.js     # All help content (EDIT THIS TO ADD CONTENT)
├── Utils/
│   └── HelpWindow.js        # Utility to open help window
└── help.js                  # Help window entry point
```

## Adding/Editing Help Content

All help content is stored in **`src/Constants/helpConstants.js`**. To add or modify content:

### 1. Add a New Chapter

```javascript
export const HELP_CHAPTERS = [
    // ... existing chapters
    {
        id: 'new-chapter',           // Unique ID
        title: 'Jaunā Sadaļa',       // Chapter title
        sections: [
            // ... sections (see below)
        ]
    }
];
```

### 2. Add Sections to a Chapter

```javascript
sections: [
    {
        id: 'section-id',            // Unique ID within chapter
        title: 'Sadaļas Nosaukums',  // Section title
        content: [
            // ... content items (see below)
        ]
    }
]
```

### 3. Add Content Items

#### Paragraph
```javascript
{
    type: 'paragraph',
    text: 'Jūsu teksts šeit...'
}
```

#### List
```javascript
{
    type: 'list',
    items: [
        'Pirmais punkts',
        'Otrais punkts',
        'Trešais punkts'
    ]
}
```

#### Image
```javascript
{
    type: 'image',
    src: '/help-images/screenshot.png',  // Place images in public/help-images/
    alt: 'Attēla apraksts',
    caption: 'Attēla paraksts (optional)'
}
```

## Using the Help Button

### Basic Usage

```javascript
import HelpButton from '../Help/HelpButton';

function MyComponent() {
    return (
        <div>
            <HelpButton />
        </div>
    );
}
```

### Open to Specific Chapter

```javascript
import HelpButton from '../Help/HelpButton';
import { HELP_CHAPTER_IDS } from '../Utils/HelpWindow';

function ProjectComponent() {
    return (
        <HelpButton chapterId={HELP_CHAPTER_IDS.PROJECTS} />
    );
}
```

### Icon-Only Button

```javascript
<HelpButton iconOnly={true} />
```

### Floating Button (fixed in corner)

```javascript
<HelpButton iconOnly={true} className="floating" />
```

### Custom Text

```javascript
<HelpButton buttonText="Kā lietot?" />
```

## Opening Help Programmatically

```javascript
import { openHelp, HELP_CHAPTER_IDS } from '../Utils/HelpWindow';

// Open to first page
openHelp();

// Open to specific chapter
openHelp(HELP_CHAPTER_IDS.PROJECTS);

// Or use the full function
import { openHelpWindow } from '../Utils/HelpWindow';

openHelpWindow('projects');
```

## Available Chapter IDs

Current chapter IDs (defined in `helpConstants.js`):
- `getting-started` - Getting Started
- `projects` - Project Management
- `inventories` - Inventory Lists
- `items` - Storage Units
- `records` - Records
- `navigation` - Navigation

## Adding Images

1. Create a folder: `public/help-images/`
2. Add your images to this folder
3. Reference them in helpConstants.js:
   ```javascript
   {
       type: 'image',
       src: '/help-images/your-image.png',
       alt: 'Description',
       caption: 'Caption text'
   }
   ```

## Styling

The help system uses your existing OPEX theme colors:
- Primary: `#596D69`
- Background: `#F1EDE1`
- Accent: `#E1B781`
- Error: `#744245`

To customize styles, edit:
- `src/Help/Help.css` - Main help component
- `src/Help/HelpButton.css` - Help button

## Example: Adding to Workspace

```javascript
// In src/Workspace/Workspace.js
import HelpButton from '../Help/HelpButton';

function Workspace() {
    return (
        <div className="workspace">
            {/* Other components */}

            {/* Add floating help button */}
            <HelpButton iconOnly={true} className="floating" />
        </div>
    );
}
```

## Building for Production

The help window requires a separate build configuration. For now, it uses the same bundle as the main app. In the future, you may want to:

1. Configure webpack to create a separate help bundle
2. Update `public/help.html` to load this bundle
3. This will reduce the help window's load time

## Future Enhancements

Possible improvements:
- Search functionality
- Keyboard navigation
- Export to PDF
- Multilingual support
- Video tutorials
- Interactive examples
