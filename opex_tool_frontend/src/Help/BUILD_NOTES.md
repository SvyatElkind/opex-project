# Build Configuration Notes

Last updated: 2026-06-12

## Current Setup — Fully Implemented

The help system build is already configured and working in both development and
production. No additional build changes are required.

## Architecture

### Main app entry: `src/index.js`

`index.js` detects `?help=true` in the URL and **dynamically imports** the Help
component. This keeps all help content out of the main app bundle:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const isHelpMode = urlParams.get('help') === 'true';

if (isHelpMode) {
    import('./Help/Help').then(({ default: Help }) => {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<React.StrictMode><Help /></React.StrictMode>);
    });
} else {
    // main app provider stack...
}
```

The Help content is code-split by Webpack automatically — it is **not** bundled
into the main chunk.

> **Do not add `import './help.js'`** to `index.js`. Doing so would bundle all
> help content unconditionally into the main app, defeating the code-split.

### Standalone help bundle: `src/help.js`

`help.js` is a thin entry point for the standalone help window. It mounts
`<Help />` directly on `#help-root`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import Help from './Help/Help';
import './styles/theme.css';
import './Help/Help.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(document.getElementById('help-root'));
root.render(<React.StrictMode><Help /></React.StrictMode>);
```

### Help HTML page: `public/help.html`

`public/help.html` is already configured with the `#help-root` mount point and
the bundle script reference. No changes needed.

```html
<div id="help-root">
    <div class="help-loading">Ielādē palīdzību...</div>
</div>
<script src="/static/js/bundle.js"></script>
```

## Building

```bash
npm run build        # production build (DevAdmin stripped)
npm run build:dev    # production build with DevAdmin enabled (QA builds)
```

Both commands run `manifest:public` automatically before the build.

## Testing the Build

1. Build the app: `npm run build`
2. Serve the build: `npx serve -s build`
3. Open `http://localhost:3000` — main app
4. Open `http://localhost:3000/?help=true` — help in the main window
5. Click any Help button — opens `/?help=true#<chapterId>` in a new window

## Notes

- All content lives in `src/Constants/helpConstants.js` (~3500 lines) — edit
  content there without touching the build configuration.
- Images go in `public/help-images/` and are automatically included in the build.
- The project does **not** use React Router. Navigation between views is driven by
  `NavigationContext` state. Do not introduce route-based help routing.
