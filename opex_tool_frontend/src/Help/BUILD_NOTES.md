# Build Configuration Notes

## Current Setup

The help system is ready to use in **development mode**. However, for production, you'll need to configure the build process to handle the separate help window.

## Development Mode

For now, the simplest approach is to use the main app bundle for the help window as well.

### Temporary Solution (Works Immediately)

Update `public/help.html` to load from the development server:

```html
<!-- In development, load from main bundle -->
<script type="module" src="/src/help.js"></script>
```

Or, modify the help window to use the main app:

**Alternative Approach:** Instead of a separate window, you could render the Help component in a modal within the main app. This requires no build changes.

## Production Build (Future Enhancement)

For optimal production build, you have two options:

### Option 1: Separate Help Bundle (Recommended for large apps)

Configure webpack/vite to create a separate bundle for help:

**If using Create React App:**
1. You'll need to eject or use CRACO to customize webpack
2. Add a new entry point for help
3. Configure output to generate help-bundle.js

**If using Vite:**
```javascript
// vite.config.js
export default {
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                help: resolve(__dirname, 'help.html')
            }
        }
    }
}
```

### Option 2: Use Main Bundle (Simpler, works now)

Simplest solution - use the same bundle for both main app and help window:

1. Update `public/help.html`:
```html
<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Palīdzība - OPEX Rīks</title>
    <link href="https://fonts.googleapis.com/css2?family=Libertinus+Serif+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
</head>
<body>
    <div id="help-root"></div>
    <!-- This will be populated by build -->
    <!-- The build process will inject the script tags -->
</body>
</html>
```

2. Modify `src/help.js` to check which div exists:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import Help from './Help/Help';
import './styles/theme.css';
import './Help/Help.css';

// Check if this is the help window
const helpRoot = document.getElementById('help-root');

if (helpRoot) {
    const root = ReactDOM.createRoot(helpRoot);
    root.render(
        <React.StrictMode>
            <Help />
        </React.StrictMode>
    );
}
```

3. Update main `src/index.js` to include help imports:
```javascript
// Add at the end of index.js
import './help.js';
```

### Option 3: Route-Based Help (Easiest!)

Instead of opening a new window, add help as a route in your main app:

```javascript
// This approach requires React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<Routes>
    <Route path="/" element={<Workspace />} />
    <Route path="/help" element={<Help />} />
    {/* other routes */}
</Routes>
```

Then modify `HelpWindow.js`:
```javascript
export const openHelpWindow = (chapterId = null) => {
    const url = chapterId ? `/help#${chapterId}` : '/help';
    window.open(url, 'OpexHelpWindow', features);
};
```

## Recommended Immediate Action

**Use Option 3 (Route-Based)** if you have React Router, or **Option 2 (Main Bundle)** for simplest setup.

For most use cases, the small bundle size increase from including Help in the main bundle is negligible and worth the simplicity.

## Testing the Build

1. Build the app: `npm run build`
2. Serve the build: `npx serve -s build`
3. Test the help button
4. Verify help window opens correctly

## Notes

- The current implementation is fully functional in development mode
- Production build needs minor configuration (choose one option above)
- All content is in `helpConstants.js` - easy to update without touching build config
- Images go in `public/help-images/` - automatically included in build
