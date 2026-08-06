import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { useNotification } from '../../components/Notification';
import { isDevMode } from '../../DevAdmin/devMode';

const DisplaySettings = ({ settings, onChange }) => {
  const { exportSettings, importSettings, resetSettings } = useSettings();
  const { notify, showConfirm } = useNotification();

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await importSettings(file);
          notify.success('Iestatījumi veiksmīgi importēti!');
          window.location.reload();
        } catch (error) {
          notify.error('Kļūda importējot iestatījumus: ' + error.message);
        }
      }
    };
    input.click();
  };

  const handleResetSettings = async () => {
    const ok = await showConfirm({
      title: 'Atiestatīt iestatījumus?',
      message: 'Vai tiešām vēlaties atiestatīt visus iestatījumus uz noklusējuma vērtībām? Šī darbība ir neatgriezeniska.',
      confirmText: 'Atiestatīt',
      variant: 'danger'
    });
    if (ok) {
      resetSettings();
      notify.success('Iestatījumi atiestatīti!');
      window.location.reload();
    }
  };

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

      <div className="settings-field">
        <label>Dokumenti Vienā Lapā</label>
        <select
          value={settings.itemsPerPage}
          onChange={(e) => onChange('itemsPerPage', parseInt(e.target.value))}
          className="settings-input"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <small>Cik dokumentu rādīt tabulās vienlaikus</small>
      </div>

      <div className="settings-divider"></div>

      <h4>Iestatījumu Pārvaldība</h4>

      <div className="settings-group">
        <p className="settings-description">
          Eksportējiet savus iestatījumus, lai tos saglabātu vai pārnestu uz citu ierīci.
          Varat arī importēt iepriekš saglabātus iestatījumus.
        </p>

        <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>
          <button
            onClick={exportSettings}
            className="settings-btn settings-btn-save"
            style={{ flex: 1 }}
          >
            <i className="fas fa-download"></i>
            Eksportēt Iestatījumus
          </button>
          <button
            onClick={handleImportSettings}
            className="settings-btn settings-btn-cancel"
            style={{ flex: 1 }}
          >
            <i className="fas fa-upload"></i>
            Importēt Iestatījumus
          </button>
        </div>

        <button
          onClick={handleResetSettings}
          className="settings-btn"
          style={{
            width: '100%',
            background: 'var(--color-error)',
            color: 'var(--text-white)',
            border: 'none'
          }}
        >
          <i className="fas fa-undo"></i>
          Atiestatīt Uz Noklusējuma Vērtībām
        </button>
      </div>

      {/* Dev Admin Panel access (Development only) */}
      {isDevMode() && (
        <>
          <div className="settings-divider"></div>
          <h4>Izstrādātāja Rīki</h4>
          <div className="dev-tools-section">
            <p className="dev-tools-description">
              Debugging un development rīki. Šie rīki ir pieejami tikai development režīmā.
            </p>
            <button
              onClick={() => {
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
