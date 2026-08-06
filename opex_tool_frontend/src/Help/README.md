# Help System Documentation

Last updated: 2026-06-12

## Overview

The Help system provides comprehensive documentation for the OPEX tool in a separate browser window. It features a two-panel layout with chapter navigation on the left and content display on the right.

## Structure

```
src/
├── Help/
│   ├── Help.js                   # Main Help component
│   ├── Help.css                  # Help component styles
│   ├── HelpButton.js             # Reusable help button component
│   ├── HelpButton.css            # Help button styles
│   ├── helpDocxExport.js         # "Download Word" — maps the content to .docx
│   ├── helpDocxExport.test.js    # Proves the export contains all the content
│   └── README.md                 # This file
├── Constants/
│   └── helpConstants.js     # All help content (EDIT THIS TO ADD CONTENT)
├── Utils/
│   ├── HelpWindow.js        # Utility to open help window
│   └── docxWriter.js        # Dependency-free ZIP + OOXML writer
└── help.js                  # Help window entry point
```

> **Adding a new content type?** It needs a renderer in **two** places: the
> `renderContent` switch in `Help.js` (screen) and the `renderBlock` switch in
> `helpDocxExport.js` (Word). The export test fails if a type has no mapping,
> so an unmapped type will not silently vanish from the downloaded document.

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

> **Note on button text:** `HelpButton` default text comes from `HELP_UI` in
> `Constants/Constants.js` (re-exported from `Constants/uiStrings/commonUI.js`),
> **not** from `helpConstants.js`. Chapter IDs come from `HELP_CHAPTER_IDS` in
> `Utils/HelpWindow.js`. These are two separate import paths.

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

Current top-level chapter IDs (defined in `helpConstants.js`). Cross-reference the
`HELP_CHAPTER_IDS` constants in `Utils/HelpWindow.js` when using the programmatic API.

| Chapter ID | Constant key | Topic |
|---|---|---|
| `getting-started` | `GETTING_STARTED` | Getting Started |
| `help-to` | — | Guide by material type |
| `projects` | `PROJECTS` | Project Management |
| `inventories` | `INVENTORIES` | Inventory Lists |
| `items` | `ITEMS` | Storage Units |
| `records` | `RECORDS` | Records |
| `verification` | `VERIFICATION` | Pre-OPEX Verification & Export |
| `fond-institution` | — | Fond & Institution Signers |
| `navigation` | `NAVIGATION` | Navigation |
| `terminology` | — | Terminology |
| `licenses` | — | Licenses |
| `contacts` | — | Contacts |
| `bug-reports` | — | Bug Reports |
| `settings` | `SETTINGS` | Settings |
| `roadmap` | `ROADMAP` | Roadmap Wizard |
| `keyboard-shortcuts` | `KEYBOARD_SHORTCUTS` | Keyboard Shortcuts |

Note: only the IDs with a `HELP_CHAPTER_IDS` constant key are exposed as named
exports from `Utils/HelpWindow.js`; the others can still be passed as raw strings
to `openHelp()` / `openHelpWindow()`.

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

## Implemented Features

The following features are already built in `Help.js`:

- **Search** (Ctrl+K) — live full-text search across all chapters and sections,
  with result highlighting in the sidebar. Press Escape to clear.
- **Keyboard navigation** — Ctrl+K to focus the search box; Escape to clear search.
- **Accordion, table, steps, ui-example, color-palette** content types rendered inline.
- **URL hash deep linking** — opening `/?help=true#projects` navigates directly to
  the Projects chapter.
- **Section progress indicator** and scroll-to-top button.
- **Export to Word** — the "Lejupielādēt Word" button in the header writes the
  whole help section to a single `.docx` (all chapters, same order, table of
  contents, page numbers). Generated in the browser with no dependencies; the
  exporter is loaded on demand, so it costs the help window nothing until used.

## Production Build

The build setup is already in place — no additional configuration is needed.

**How it works:**

1. `src/index.js` detects `?help=true` in the URL and dynamically imports
   `Help/Help.js` (code-split; help content is NOT included in the main bundle
   unless the user opens the help URL).
2. `src/help.js` is a separate entry point that mounts `<Help />` directly on
   `#help-root` — used when the standalone `public/help.html` is served.
3. `public/help.html` already contains the `<div id="help-root">` mount point and
   the `<script src="/static/js/bundle.js">` reference injected by the build.

Building is the same as the main app: `npm run build`.

## Future Enhancements

Possible improvements:
- Export to PDF (Word export is done — see above)
- Export of a single chapter rather than the whole manual
- Video tutorials
- Interactive examples
