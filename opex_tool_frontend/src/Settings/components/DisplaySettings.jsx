import React from 'react';

const DisplaySettings = ({ settings, onChange }) => {
  return (
    <div className="settings-section">
      <h3>Attēlošanas Iestatījumi</h3>

      <div className="settings-field">
        <label>Tēma</label>
        <div className="theme-selector">
          <div
            className={`theme-option ${settings.theme === 'light' ? 'selected' : ''}`}
            onClick={() => onChange('theme', 'light')}
          >
            <div className="theme-preview light-preview">
              <i className="fas fa-sun"></i>
            </div>
            <span>Gaiša</span>
          </div>
          <div
            className={`theme-option ${settings.theme === 'dark' ? 'selected' : ''}`}
            onClick={() => onChange('theme', 'dark')}
          >
            <div className="theme-preview dark-preview">
              <i className="fas fa-moon"></i>
            </div>
            <span>Tumša</span>
          </div>
          <div
            className={`theme-option ${settings.theme === 'auto' ? 'selected' : ''}`}
            onClick={() => onChange('theme', 'auto')}
          >
            <div className="theme-preview auto-preview">
              <i className="fas fa-adjust"></i>
            </div>
            <span>Automātiska</span>
            <small className="auto-hint">Seko sistēmas iestatījumiem</small>
          </div>
        </div>
        <small>Izvēlieties aplikācijas krāsu tēmu</small>
      </div>

      <div className="settings-field">
        <label>Fonta Izmērs</label>
        <select
          value={settings.fontSize}
          onChange={(e) => onChange('fontSize', e.target.value)}
          className="settings-input"
        >
          <option value="small">Mazs</option>
          <option value="medium">Vidējs</option>
          <option value="large">Liels</option>
        </select>
        <small>Teksta izmērs visā aplikācijā</small>
      </div>

      <div className="settings-field settings-checkbox">
        <label>
          <input
            type="checkbox"
            checked={settings.compactView}
            onChange={(e) => onChange('compactView', e.target.checked)}
          />
          <span>Kompakts skats</span>
        </label>
        <small>Samazināti atstarpes starp elementiem, lai redzētu vairāk informācijas</small>
      </div>

      <div className="settings-field settings-checkbox">
        <label>
          <input
            type="checkbox"
            checked={settings.showBreadcrumbs}
            onChange={(e) => onChange('showBreadcrumbs', e.target.checked)}
          />
          <span>Rādīt navigācijas ceļu</span>
        </label>
        <small>Parāda jūsu atrašanās vietu projekta hierarhijā</small>
      </div>

      <div className="settings-divider"></div>

      <h4>Tabulu Iestatījumi</h4>

      <div className="settings-field">
        <label>Ieraksti Vienā Lapā</label>
        <select
          value={settings.rowsPerPage}
          onChange={(e) => onChange('rowsPerPage', parseInt(e.target.value))}
          className="settings-input"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <small>Cik rindas rādīt tabulās vienlaikus</small>
      </div>

      <div className="settings-field">
        <label>Noklusējuma Kārtošana</label>
        <select
          value={settings.defaultSortColumn}
          onChange={(e) => onChange('defaultSortColumn', e.target.value)}
          className="settings-input"
        >
          <option value="number">Pēc Numura</option>
          <option value="name">Pēc Nosaukuma</option>
          <option value="date">Pēc Datuma</option>
        </select>
      </div>

      <div className="settings-field">
        <label>Kārtošanas Virziens</label>
        <select
          value={settings.defaultSortDirection}
          onChange={(e) => onChange('defaultSortDirection', e.target.value)}
          className="settings-input"
        >
          <option value="asc">Augoši (A-Z, 0-9)</option>
          <option value="desc">Dilstoši (Z-A, 9-0)</option>
        </select>
      </div>

      {/* Dev Admin Panel access (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <div className="settings-divider"></div>
          <h4>Izstrādātāja Rīki</h4>
          <div className="dev-tools-section">
            <p className="dev-tools-description">
              Debugging un development rīki. Šie rīki ir pieejami tikai development režīmā.
            </p>
            <button
              onClick={() => {
                // Trigger DevAdmin panel open event
                const event = new CustomEvent('openDevAdminPanel');
                window.dispatchEvent(event);
              }}
              className="dev-tools-button"
            >
              <i className="fas fa-tools"></i>
              <span>Atvērt Dev Admin Panel</span>
            </button>
            <div className="settings-info dev-tools-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Atcerieties izdzēst /src/DevAdmin/ mapi pirms production release!</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DisplaySettings;
