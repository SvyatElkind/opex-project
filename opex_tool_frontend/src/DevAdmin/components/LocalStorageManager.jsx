import React, { useState, useEffect } from 'react';

const LocalStorageManager = () => {
  const [storageItems, setStorageItems] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadStorageItems = () => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      let parsedValue = value;
      let type = 'string';

      try {
        parsedValue = JSON.parse(value);
        type = typeof parsedValue === 'object' ? 'object' : typeof parsedValue;
      } catch (e) {
        // Value is a plain string
      }

      items.push({
        key,
        value,
        parsedValue,
        type,
        size: new Blob([value]).size
      });
    }
    setStorageItems(items.sort((a, b) => a.key.localeCompare(b.key)));
  };

  useEffect(() => {
    loadStorageItems();
  }, []);

  const handleDelete = (key) => {
    if (window.confirm(`Delete "${key}"?`)) {
      localStorage.removeItem(key);
      loadStorageItems();
      if (selectedKey === key) {
        setSelectedKey(null);
      }
    }
  };

  const handleEdit = (item) => {
    setSelectedKey(item.key);
    setEditValue(item.value);
    setIsEditing(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(selectedKey, editValue);
      setIsEditing(false);
      loadStorageItems();
      alert('Saved successfully!');
    } catch (e) {
      alert(`Error saving: ${e.message}`);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear ALL localStorage? This cannot be undone!')) {
      localStorage.clear();
      loadStorageItems();
      setSelectedKey(null);
      setIsEditing(false);
    }
  };

  const handleExport = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `localStorage-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = storageItems.reduce((sum, item) => sum + item.size, 0);

  const filteredItems = storageItems.filter(item =>
    item.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItem = storageItems.find(item => item.key === selectedKey);

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>LocalStorage Manager</h3>
        <div className="dev-panel-actions">
          <button onClick={handleExport} className="dev-action-btn" title="Export all">
            <i className="fas fa-download"></i>
          </button>
          <button onClick={loadStorageItems} className="dev-action-btn" title="Refresh">
            <i className="fas fa-sync-alt"></i>
          </button>
          <button onClick={handleClearAll} className="dev-action-btn danger" title="Clear all">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <div className="dev-panel-toolbar">
        <input
          type="text"
          placeholder="Search keys..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="dev-search-input"
        />
        <div className="storage-stats">
          <span>{filteredItems.length} items</span>
          <span>{formatBytes(totalSize)} total</span>
        </div>
      </div>

      <div className="dev-panel-body split-view">
        {/* Left: List of keys */}
        <div className="storage-list">
          {filteredItems.length === 0 ? (
            <div className="dev-empty-state">
              <i className="fas fa-inbox"></i>
              <p>No items found</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.key}
                className={`storage-item ${selectedKey === item.key ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedKey(item.key);
                  setIsEditing(false);
                }}
              >
                <div className="item-info">
                  <div className="item-key">{item.key}</div>
                  <div className="item-meta">
                    <span className={`type-badge ${item.type}`}>{item.type}</span>
                    <span className="size-badge">{formatBytes(item.size)}</span>
                  </div>
                </div>
                <div className="item-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(item);
                    }}
                    className="item-action-btn"
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.key);
                    }}
                    className="item-action-btn danger"
                    title="Delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Value viewer/editor */}
        <div className="storage-viewer">
          {!selectedItem ? (
            <div className="dev-empty-state">
              <i className="fas fa-arrow-left"></i>
              <p>Select an item to view</p>
            </div>
          ) : isEditing ? (
            <div className="storage-editor">
              <div className="editor-header">
                <h4>Editing: {selectedKey}</h4>
                <div className="editor-actions">
                  <button onClick={handleSave} className="dev-btn primary">
                    <i className="fas fa-save"></i> Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="dev-btn">
                    Cancel
                  </button>
                </div>
              </div>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="storage-textarea"
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="storage-display">
              <div className="display-header">
                <h4>{selectedKey}</h4>
                <button onClick={() => handleEdit(selectedItem)} className="dev-btn">
                  <i className="fas fa-edit"></i> Edit
                </button>
              </div>
              <pre className="storage-value">
                {selectedItem.type === 'object'
                  ? JSON.stringify(selectedItem.parsedValue, null, 2)
                  : selectedItem.value}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalStorageManager;
