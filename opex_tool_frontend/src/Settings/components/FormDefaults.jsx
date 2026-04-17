import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useNotification } from '../../components/Notification';

const FormDefaults = () => {
  const {
    settings,
    createPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    setActivePreset
  } = useSettings();
  const { notify, showConfirm } = useNotification();

  const [selectedPresetId, setSelectedPresetId] = useState(settings.activePresetId);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState(null);
  const [newPresetName, setNewPresetName] = useState('');

  const selectedPreset = settings.formPresets.find(p => p.id === selectedPresetId) || settings.formPresets[0];

  const handleFieldChange = (field, value) => {
    if (selectedPreset) {
      updatePreset(selectedPreset.id, { [field]: value });
    }
  };

  const handleCreatePreset = () => {
    if (!newPresetName.trim()) {
      notify.warning('Lūdzu, ievadiet priekšiestatījuma nosaukumu');
      return;
    }

    const newId = createPreset({
      name: newPresetName,
      itemLanguage: 'latviešu',
      recordLanguage: 'latviešu',
      accessRestriction: 'open',
      securityLevel: 'Publisks',
      restriction: 'Vispārēja',
      keyWords: '',
      notes: ''
    });

    setSelectedPresetId(newId);
    setIsCreatingNew(false);
    setNewPresetName('');
  };

  const handleDeletePreset = async (presetId) => {
    const ok = await showConfirm({
      title: 'Dzēst priekšiestatījumu?',
      message: 'Vai tiešām vēlaties dzēst šo priekšiestatījumu?',
      confirmText: 'Dzēst',
      variant: 'danger'
    });
    if (ok) {
      try {
        deletePreset(presetId);
        setSelectedPresetId('default');
      } catch (error) {
        notify.error(error.message);
      }
    }
  };

  const handleDuplicatePreset = (presetId) => {
    const newId = duplicatePreset(presetId);
    if (newId) {
      setSelectedPresetId(newId);
    }
  };

  const handleRenamePreset = (presetId, newName) => {
    if (newName.trim()) {
      updatePreset(presetId, { name: newName });
      setEditingPresetId(null);
    }
  };

  const handleSetActive = (presetId) => {
    setActivePreset(presetId);
    notify.success('Aktīvais priekšiestatījums nomainīts!');
  };

  return (
    <div className="settings-section">
      <h3>Formu Priekšiestatījumi</h3>
      <p className="settings-description">
        Izveidojiet un pārvaldiet priekšiestatījumus, lai ātri aizpildītu formas ar bieži lietotām vērtībām
      </p>

      {/* Preset Selector */}
      <div className="settings-group">
        <h4>Priekšiestatījumu Pārvaldība</h4>

        <div className="preset-list">
          {settings.formPresets.map(preset => (
            <div
              key={preset.id}
              className={`preset-item ${selectedPresetId === preset.id ? 'selected' : ''} ${settings.activePresetId === preset.id ? 'active' : ''}`}
            >
              <div className="preset-header" onClick={() => setSelectedPresetId(preset.id)}>
                <div className="preset-info">
                  {editingPresetId === preset.id ? (
                    <input
                      type="text"
                      defaultValue={preset.name}
                      autoFocus
                      onBlur={(e) => handleRenamePreset(preset.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenamePreset(preset.id, e.target.value);
                        }
                        if (e.key === 'Escape') {
                          setEditingPresetId(null);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="preset-rename-input"
                    />
                  ) : (
                    <>
                      <span className="preset-name">
                        {preset.name}
                        {preset.isDefault && <span className="default-badge">Noklusējums</span>}
                      </span>
                      {settings.activePresetId === preset.id && (
                        <span className="active-badge">
                          <i className="fas fa-check-circle"></i> Aktīvs
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="preset-actions" onClick={(e) => e.stopPropagation()}>
                  {settings.activePresetId !== preset.id && (
                    <button
                      className="preset-action-btn"
                      onClick={() => handleSetActive(preset.id)}
                      title="Iestatīt kā aktīvu"
                    >
                      <i className="fas fa-star"></i>
                    </button>
                  )}
                  <button
                    className="preset-action-btn"
                    onClick={() => setEditingPresetId(preset.id)}
                    title="Pārdēvēt"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="preset-action-btn"
                    onClick={() => handleDuplicatePreset(preset.id)}
                    title="Dublēt"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                  {!preset.isDefault && (
                    <button
                      className="preset-action-btn delete"
                      onClick={() => handleDeletePreset(preset.id)}
                      title="Dzēst"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Create New Preset */}
          {isCreatingNew ? (
            <div className="preset-item new-preset">
              <input
                type="text"
                placeholder="Priekšiestatījuma nosaukums..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreatePreset();
                  if (e.key === 'Escape') {
                    setIsCreatingNew(false);
                    setNewPresetName('');
                  }
                }}
                autoFocus
                className="settings-input"
              />
              <div className="new-preset-actions">
                <button onClick={handleCreatePreset} className="settings-btn settings-btn-save">
                  <i className="fas fa-check"></i> Izveidot
                </button>
                <button
                  onClick={() => {
                    setIsCreatingNew(false);
                    setNewPresetName('');
                  }}
                  className="settings-btn settings-btn-cancel"
                >
                  Atcelt
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="add-preset-btn"
            >
              <i className="fas fa-plus-circle"></i> Izveidot jaunu priekšiestatījumu
            </button>
          )}
        </div>
      </div>

      {/* Preset Configuration */}
      {selectedPreset && (
        <div className="settings-group">
          <h4>Konfigurācija: {selectedPreset.name}</h4>

          <div className="settings-field">
            <label>Vienības Valoda</label>
            <select
              value={selectedPreset.itemLanguage}
              onChange={(e) => handleFieldChange('itemLanguage', e.target.value)}
              className="settings-input"
            >
              <option value="latviešu">Latviešu</option>
              <option value="krievu">Krievu</option>
              <option value="angļu">Angļu</option>
              <option value="vācu">Vācu</option>
              <option value="franču">Franču</option>
              <option value="spāņu">Spāņu</option>
              <option value="itāļu">Itāļu</option>
            </select>
            <small>Noklusējuma valoda vienību aprakstos</small>
          </div>

          <div className="settings-field">
            <label>Ieraksta Valoda</label>
            <select
              value={selectedPreset.recordLanguage}
              onChange={(e) => handleFieldChange('recordLanguage', e.target.value)}
              className="settings-input"
            >
              <option value="latviešu">Latviešu</option>
              <option value="krievu">Krievu</option>
              <option value="angļu">Angļu</option>
              <option value="vācu">Vācu</option>
              <option value="franču">Franču</option>
              <option value="spāņu">Spāņu</option>
              <option value="itāļu">Itāļu</option>
            </select>
            <small>Noklusējuma valoda ierakstu aprakstos</small>
          </div>

          <div className="settings-field">
            <label>Piekļuves Ierobežojums</label>
            <select
              value={selectedPreset.accessRestriction}
              onChange={(e) => handleFieldChange('accessRestriction', e.target.value)}
              className="settings-input"
            >
              <option value="open">Atvērts</option>
              <option value="restricted">Ierobežots</option>
              <option value="closed">Slēgts</option>
            </select>
            <small>Noklusējuma piekļuves līmenis</small>
          </div>

          <div className="settings-field">
            <label>Drošības Līmenis</label>
            <select
              value={selectedPreset.securityLevel}
              onChange={(e) => handleFieldChange('securityLevel', e.target.value)}
              className="settings-input"
            >
              <option value="Publisks">Publisks</option>
              <option value="Iekšējam lietojumam">Iekšējam lietojumam</option>
              <option value="Konfidenciāls">Konfidenciāls</option>
              <option value="Slepens">Slepens</option>
            </select>
            <small>Noklusējuma drošības klasifikācija</small>
          </div>

          <div className="settings-field">
            <label>Ierobežojuma Tips</label>
            <select
              value={selectedPreset.restriction}
              onChange={(e) => handleFieldChange('restriction', e.target.value)}
              className="settings-input"
            >
              <option value="Vispārēja">Vispārēja</option>
              <option value="Ierobežota">Ierobežota</option>
              <option value="Konfidenciāla">Konfidenciāla</option>
            </select>
            <small>Noklusējuma ierobežojuma tips</small>
          </div>

          <div className="settings-field">
            <label>Atslēgvārdi</label>
            <input
              type="text"
              value={selectedPreset.keyWords || ''}
              onChange={(e) => handleFieldChange('keyWords', e.target.value)}
              className="settings-input"
              placeholder="Atslēgvārdi, atdalīti ar komatu..."
            />
            <small>Noklusējuma atslēgvārdi jauniem ierakstiem</small>
          </div>

          <div className="settings-field">
            <label>Piezīmes</label>
            <textarea
              value={selectedPreset.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              className="settings-input"
              rows="3"
              placeholder="Noklusējuma piezīmes..."
            />
            <small>Teksts, kas tiks automātiski pievienots piezīmēm</small>
          </div>
        </div>
      )}

      <div className="settings-info">
        <i className="fas fa-info-circle"></i>
        <span>
          Aktīvais priekšiestatījums tiks izmantots kā noklusējums, izveidojot jaunus ierakstus un vienības.
          Jūs varat izvēlēties citu priekšiestatījumu tieši formā.
        </span>
      </div>
    </div>
  );
};

export default FormDefaults;
