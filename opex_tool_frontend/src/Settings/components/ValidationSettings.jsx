import React from 'react';

const ValidationSettings = ({ settings, onChange }) => {
  const validation = settings.validation || {};

  const handleValidationChange = (key, value) => {
    onChange('validation', {
      ...validation,
      [key]: value
    });
  };

  // Helper to format duration display
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="settings-section">
      <h3>Validācijas Brīdinājumi</h3>
      <p className="settings-description">
        Šie iestatījumi nosaka, kad lietotājiem tiks rādīti brīdinājumi par failu izmēriem un parametriem.
        Tie neierobežo augšupielādi, bet palīdz uzturēt kvalitātes standartus.
      </p>

      <div className="settings-divider"></div>

      <h4>Brīdinājumu Iespējošana</h4>

      <div className="settings-field settings-checkbox">
        <label>
          <input
            type="checkbox"
            checked={validation.enabled !== false}
            onChange={(e) => handleValidationChange('enabled', e.target.checked)}
          />
          <span>Iespējot visus validācijas brīdinājumus</span>
        </label>
        <small>Galvenais slēdzis - izslēdzot šo, visi brīdinājumi tiks atspējoti</small>
      </div>

      {validation.enabled !== false && (
        <>
          <div className="settings-field settings-checkbox">
            <label>
              <input
                type="checkbox"
                checked={validation.enableFileSizeWarnings !== false}
                onChange={(e) => handleValidationChange('enableFileSizeWarnings', e.target.checked)}
              />
              <span>Brīdinājumi par faila izmēru</span>
            </label>
            <small>Rādīt brīdinājumus, ja faila izmērs pārsniedz vai nesasniedz robežas</small>
          </div>

          <div className="settings-field settings-checkbox">
            <label>
              <input
                type="checkbox"
                checked={validation.enableDurationWarnings !== false}
                onChange={(e) => handleValidationChange('enableDurationWarnings', e.target.checked)}
              />
              <span>Brīdinājumi par audio/video garumu</span>
            </label>
            <small>Rādīt brīdinājumus par audio/video failu ilgumu</small>
          </div>

          <div className="settings-field settings-checkbox">
            <label>
              <input
                type="checkbox"
                checked={validation.enableImageDimensionWarnings !== false}
                onChange={(e) => handleValidationChange('enableImageDimensionWarnings', e.target.checked)}
              />
              <span>Brīdinājumi par attēlu izmēriem</span>
            </label>
            <small>Rādīt brīdinājumus par attēlu platumu un augstumu</small>
          </div>

          <div className="settings-field settings-checkbox">
            <label>
              <input
                type="checkbox"
                checked={validation.enableOrientationWarnings !== false}
                onChange={(e) => handleValidationChange('enableOrientationWarnings', e.target.checked)}
              />
              <span>Brīdinājumi par attēlu orientāciju</span>
            </label>
            <small>Rādīt brīdinājumus, ja attēla orientācija neatbilst ieteiktajai</small>
          </div>
        </>
      )}

      <div className="settings-divider"></div>

      {validation.enabled !== false && (
        <>
          <h4>Failu Izmēri</h4>

          <div className="settings-field">
            <label>Maksimālais Faila Izmērs (MB)</label>
        <input
          type="number"
          min="1"
          max="10000"
          value={validation.maxFileSize || 100}
          onChange={(e) => handleValidationChange('maxFileSize', parseInt(e.target.value) || 100)}
          className="settings-input"
        />
        <small>Brīdinājums tiks rādīts, ja fails ir lielāks par šo izmēru</small>
      </div>

      <div className="settings-field">
        <label>Minimālais Faila Izmērs (MB)</label>
        <input
          type="number"
          min="0.001"
          max="10"
          step="0.01"
          value={validation.minFileSize || 0.01}
          onChange={(e) => handleValidationChange('minFileSize', parseFloat(e.target.value) || 0.01)}
          className="settings-input"
        />
        <small>Brīdinājums tiks rādīts, ja fails ir mazāks par šo izmēru (var būt bojāts)</small>
      </div>

      <div className="settings-divider"></div>

      <h4>Audio/Video Failu Parametri</h4>

      <div className="settings-field">
        <label>Maksimālais Garums (sekundes)</label>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
          <input
            type="number"
            min="60"
            max="86400"
            step="60"
            value={validation.maxDuration || 3600}
            onChange={(e) => handleValidationChange('maxDuration', parseInt(e.target.value) || 3600)}
            className="settings-input"
            style={{ flex: 1 }}
          />
          <span className="settings-value-display">
            ({formatDuration(validation.maxDuration || 3600)})
          </span>
        </div>
        <small>Brīdinājums audio/video failiem, kas ir garāki par šo laiku</small>
      </div>

      <div className="settings-field">
        <label>Minimālais Garums (sekundes)</label>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
          <input
            type="number"
            min="1"
            max="60"
            step="1"
            value={validation.minDuration || 1}
            onChange={(e) => handleValidationChange('minDuration', parseInt(e.target.value) || 1)}
            className="settings-input"
            style={{ flex: 1 }}
          />
          <span className="settings-value-display">
            ({formatDuration(validation.minDuration || 1)})
          </span>
        </div>
        <small>Brīdinājums audio/video failiem, kas ir īsāki par šo laiku (var būt bojāti)</small>
      </div>

      <div className="settings-divider"></div>

      <h4>Attēlu Izmēri</h4>

      <div className="settings-field">
        <label>Maksimālais Platums (pikseļi)</label>
        <input
          type="number"
          min="100"
          max="20000"
          step="100"
          value={validation.maxImageWidth || 4000}
          onChange={(e) => handleValidationChange('maxImageWidth', parseInt(e.target.value) || 4000)}
          className="settings-input"
        />
        <small>Brīdinājums, ja attēla platums pārsniedz šo vērtību</small>
      </div>

      <div className="settings-field">
        <label>Maksimālais Augstums (pikseļi)</label>
        <input
          type="number"
          min="100"
          max="20000"
          step="100"
          value={validation.maxImageHeight || 4000}
          onChange={(e) => handleValidationChange('maxImageHeight', parseInt(e.target.value) || 4000)}
          className="settings-input"
        />
        <small>Brīdinājums, ja attēla augstums pārsniedz šo vērtību</small>
      </div>

      <div className="settings-field">
        <label>Minimālais Platums (pikseļi)</label>
        <input
          type="number"
          min="100"
          max="10000"
          step="100"
          value={validation.minImageWidth || 800}
          onChange={(e) => handleValidationChange('minImageWidth', parseInt(e.target.value) || 800)}
          className="settings-input"
        />
        <small>Brīdinājums, ja attēla platums ir mazāks par šo vērtību</small>
      </div>

      <div className="settings-field">
        <label>Minimālais Augstums (pikseļi)</label>
        <input
          type="number"
          min="100"
          max="10000"
          step="100"
          value={validation.minImageHeight || 600}
          onChange={(e) => handleValidationChange('minImageHeight', parseInt(e.target.value) || 600)}
          className="settings-input"
        />
        <small>Brīdinājums, ja attēla augstums ir mazāks par šo vērtību</small>
      </div>

      <div className="settings-field">
        <label>Ieteicamā Orientācija</label>
        <select
          value={validation.preferredOrientation || 'any'}
          onChange={(e) => handleValidationChange('preferredOrientation', e.target.value)}
          className="settings-input"
        >
          <option value="any">Jebkura</option>
          <option value="horizontal">Horizontāla (platums {'>'} augstums)</option>
          <option value="vertical">Vertikāla (augstums {'>'} platums)</option>
          <option value="square">Kvadrātveida (platums ≈ augstums)</option>
        </select>
        <small>Brīdinājums, ja attēla orientācija neatbilst izvēlētajai</small>
      </div>

      <div className="settings-info" style={{ marginTop: 'var(--spacing-4)' }}>
        <i className="fas fa-info-circle"></i>
        <span>
          <strong>Svarīgi:</strong> Šie iestatījumi rada tikai brīdinājumus.
          Lietotāji joprojām var augšupielādēt failus, kas neatbilst šiem kritērijiem,
          bet saņems paziņojumu par iespējamām kvalitātes vai saderības problēmām.
        </span>
      </div>

      <div className="settings-divider"></div>

      <h4>Ātrie Iestatījumi</h4>

      <div className="settings-group">
        <p className="settings-description">
          Izmantojiet šos priekšiestatījumus, lai ātri konfigurētu validāciju dažādiem lietojuma gadījumiem.
        </p>

        <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              onChange('validation', {
                enabled: true,
                enableFileSizeWarnings: true,
                enableDurationWarnings: true,
                enableImageDimensionWarnings: true,
                enableOrientationWarnings: true,
                maxFileSize: 50,
                minFileSize: 0.05,
                maxDuration: 1800, // 30 min
                minDuration: 2,
                maxImageWidth: 2000,
                maxImageHeight: 2000,
                minImageWidth: 800,
                minImageHeight: 600,
                preferredOrientation: 'any'
              });
            }}
            className="settings-btn"
            style={{ flex: '1 1 200px' }}
          >
            <i className="fas fa-compress-alt"></i>
            Stingri Ierobežojumi
          </button>

          <button
            onClick={() => {
              onChange('validation', {
                enabled: true,
                enableFileSizeWarnings: true,
                enableDurationWarnings: true,
                enableImageDimensionWarnings: true,
                enableOrientationWarnings: true,
                maxFileSize: 100,
                minFileSize: 0.01,
                maxDuration: 3600, // 1 hour
                minDuration: 1,
                maxImageWidth: 4000,
                maxImageHeight: 4000,
                minImageWidth: 800,
                minImageHeight: 600,
                preferredOrientation: 'any'
              });
            }}
            className="settings-btn"
            style={{ flex: '1 1 200px' }}
          >
            <i className="fas fa-balance-scale"></i>
            Standarta (Noklusējums)
          </button>

          <button
            onClick={() => {
              onChange('validation', {
                enabled: true,
                enableFileSizeWarnings: true,
                enableDurationWarnings: true,
                enableImageDimensionWarnings: true,
                enableOrientationWarnings: true,
                maxFileSize: 500,
                minFileSize: 0.001,
                maxDuration: 7200, // 2 hours
                minDuration: 0.5,
                maxImageWidth: 10000,
                maxImageHeight: 10000,
                minImageWidth: 400,
                minImageHeight: 300,
                preferredOrientation: 'any'
              });
            }}
            className="settings-btn"
            style={{ flex: '1 1 200px' }}
          >
            <i className="fas fa-expand-alt"></i>
            Brīvi Ierobežojumi
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default ValidationSettings;
