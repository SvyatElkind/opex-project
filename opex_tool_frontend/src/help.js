import React from 'react';
import ReactDOM from 'react-dom/client';
import Help from './Help/Help';

// Import theme CSS
import './styles/theme.css';
import './Help/Help.css';

// FontAwesome icons (if needed)
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(document.getElementById('help-root'));

root.render(
  <React.StrictMode>
    <Help />
  </React.StrictMode>
);
