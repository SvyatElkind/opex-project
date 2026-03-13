import React from 'react';

const InstitutionDefaults = ({ settings, onChange }) => {
  return (
    <div className="settings-section">
      <h3>Iestādes Noklusējuma Informācija</h3>
      <p className="settings-description">
        Saglabājiet iestādes parakstītāju informāciju, lai to automātiski aizpildītu projektos
      </p>

      <div className="settings-group">
        <h4>Sastādītājs</h4>

        <div className="settings-field">
          <label>Vārds, Uzvārds</label>
          <input
            type="text"
            value={settings.defaultCreator}
            onChange={(e) => onChange('defaultCreator', e.target.value)}
            className="settings-input"
            placeholder="Piemēram: Jānis Bērziņš"
          />
        </div>

        <div className="settings-field">
          <label>Amats</label>
          <input
            type="text"
            value={settings.defaultCreatorPosition}
            onChange={(e) => onChange('defaultCreatorPosition', e.target.value)}
            className="settings-input"
            placeholder="Piemēram: Arhīva vadītājs"
          />
        </div>
      </div>

      <div className="settings-group">
        <h4>Parakstītājs</h4>

        <div className="settings-field">
          <label>Vārds, Uzvārds</label>
          <input
            type="text"
            value={settings.defaultSigner}
            onChange={(e) => onChange('defaultSigner', e.target.value)}
            className="settings-input"
            placeholder="Piemēram: Anna Kalniņa"
          />
        </div>

        <div className="settings-field">
          <label>Amats</label>
          <input
            type="text"
            value={settings.defaultSignerPosition}
            onChange={(e) => onChange('defaultSignerPosition', e.target.value)}
            className="settings-input"
            placeholder="Piemēram: Direktore"
          />
        </div>
      </div>

      <div className="settings-info">
        <i className="fas fa-info-circle"></i>
        <span>Šī informācija tiks automātiski ievadīta, izveidojot jaunus projektus</span>
      </div>
    </div>
  );
};

export default InstitutionDefaults;
