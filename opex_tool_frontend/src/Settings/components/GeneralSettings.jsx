import React from 'react';
import { useSettings } from '../context/SettingsContext';

const GeneralSettings = ({ settings, onChange }) => {
  const { exportSettings, importSettings, resetSettings } = useSettings();

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await importSettings(file);
          alert('✅ Iestatījumi veiksmīgi importēti!');
          window.location.reload(); // Reload to apply all settings
        } catch (error) {
          alert('❌ Kļūda importējot iestatījumus: ' + error.message);
        }
      }
    };
    input.click();
  };

  const handleResetSettings = () => {
    if (window.confirm('Vai tiešām vēlaties atiestatīt visus iestatījumus uz noklusējuma vērtībām? Šī darbība ir neatgriezeniska.')) {
      resetSettings();
      alert('✅ Iestatījumi atiestatīti!');
      window.location.reload();
    }
  };

  return (
    <div className="settings-section">
      <h3>Vispārīgie Iestatījumi</h3>

      <div className="settings-field">
        <label>Noklusējuma Valoda</label>
        <select
          value={settings.defaultLanguage}
          onChange={(e) => onChange('defaultLanguage', e.target.value)}
          className="settings-input"
        >
          <option value="latviešu">Latviešu</option>
          <option value="krievu">Krievu</option>
          <option value="angļu">Angļu</option>
        </select>
        <small>Valoda, kas tiks izmantota pēc noklusējuma formās</small>
      </div>

      <div className="settings-field">
        <label>Datuma Formāts</label>
        <select
          value={settings.dateFormat}
          onChange={(e) => onChange('dateFormat', e.target.value)}
          className="settings-input"
        >
          <option value="YYYY-MM-DD">YYYY-MM-DD (2026-01-17)</option>
          <option value="DD.MM.YYYY">DD.MM.YYYY (17.01.2026)</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY (17/01/2026)</option>
        </select>
        <small>Kā datumi tiks rādīti aplikācijā</small>
      </div>

      <div className="settings-field">
        <label>Laika Formāts</label>
        <select
          value={settings.timeFormat}
          onChange={(e) => onChange('timeFormat', e.target.value)}
          className="settings-input"
        >
          <option value="24h">24 stundu (14:30)</option>
          <option value="12h">12 stundu (2:30 PM)</option>
        </select>
        <small>Kā laiki tiks rādīti aplikācijā</small>
      </div>

      <div className="settings-field">
        <label>Ieraksti Vienā Lapā</label>
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
        <small>Cik ierakstu rādīt tabulās vienlaikus</small>
      </div>

      <div className="settings-divider"></div>

      <h4>OPEX Eksporta Iestatījumi</h4>

      <div className="settings-field">
        <label>Noklusējuma Eksporta Formāts</label>
        <select
          value={settings.defaultExportFormat}
          onChange={(e) => onChange('defaultExportFormat', e.target.value)}
          className="settings-input"
        >
          <option value="opex">OPEX (XML)</option>
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
        <small>Formāts, kurā tiks eksportēti projekti</small>
      </div>

      <div className="settings-field">
        <label>Saspiešanas Formāts</label>
        <select
          value={settings.compressionFormat}
          onChange={(e) => onChange('compressionFormat', e.target.value)}
          className="settings-input"
        >
          <option value="zip">ZIP</option>
          <option value="tar">TAR</option>
          <option value="tar.gz">TAR.GZ</option>
        </select>
        <small>Kā tiks saspiesti eksportētie faili</small>
      </div>

      <div className="settings-field">
        <label>Faila Nosaukuma Šablons</label>
        <select
          value={settings.filenamePattern}
          onChange={(e) => onChange('filenamePattern', e.target.value)}
          className="settings-input"
        >
          <option value="project_name_date">Projekta_nosaukums_YYYY-MM-DD</option>
          <option value="project_name">Projekta_nosaukums</option>
          <option value="date_project_name">YYYY-MM-DD_Projekta_nosaukums</option>
        </select>
        <small>Kā tiks nosaukti eksportētie faili</small>
      </div>

      <div className="settings-field settings-checkbox">
        <label>
          <input
            type="checkbox"
            checked={settings.includeMetadata}
            onChange={(e) => onChange('includeMetadata', e.target.checked)}
          />
          <span>Iekļaut metadatus eksportā</span>
        </label>
        <small>Pievienot papildu informāciju par eksportu</small>
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

        <div className="settings-info" style={{ marginTop: 'var(--spacing-3)' }}>
          <i className="fas fa-info-circle"></i>
          <span>
            Eksportējot iestatījumus, tiks saglabāti visi jūsu izvēles, ieskaitot formu priekšiestatījumus un tēmas iestatījumus.
          </span>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
