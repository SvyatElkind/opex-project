import React, { useState, useMemo, useCallback } from 'react';

const ProjectStateInspector = ({ projectData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPaths, setExpandedPaths] = useState(new Set());
  const [viewMode, setViewMode] = useState('tree');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const togglePath = useCallback((path) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (!projectData) return;
    const paths = new Set();
    const walk = (obj, path) => {
      if (obj && typeof obj === 'object') {
        paths.add(path);
        const keys = Array.isArray(obj) ? obj.map((_, i) => i) : Object.keys(obj);
        keys.forEach(k => walk(obj[k], `${path}.${k}`));
      }
    };
    walk(projectData, 'root');
    setExpandedPaths(paths);
  }, [projectData]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const copyToClipboard = useCallback(() => {
    const json = JSON.stringify(projectData, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    });
  }, [projectData]);

  const downloadJson = useCallback(() => {
    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-state-${projectData?.name || 'unknown'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [projectData]);

  // Compute stats
  const stats = useMemo(() => {
    if (!projectData) return null;
    const inventories = projectData?.institution?.fond?.inventories || [];
    let totalItems = 0, totalRecords = 0, totalFiles = 0;
    inventories.forEach(inv => {
      const items = inv.items || [];
      totalItems += items.length;
      items.forEach(item => {
        const recs = item.records || [];
        totalRecords += recs.length;
        recs.forEach(rec => { totalFiles += (rec.files?.length || 0); });
        // Media records
        ['photo_records', 'video_records', 'audio_records'].forEach(key => {
          totalRecords += (item[key]?.length || 0);
        });
      });
    });
    return {
      id: projectData.id,
      name: projectData.name,
      inventories: inventories.length,
      items: totalItems,
      records: totalRecords,
      files: totalFiles,
      dataSize: new Blob([JSON.stringify(projectData)]).size,
    };
  }, [projectData]);

  const renderValue = (value, path = '', level = 0) => {
    if (value === null) return <span className="value-null">null</span>;
    if (value === undefined) return <span className="value-undefined">undefined</span>;
    if (typeof value === 'boolean') return <span className="value-boolean">{value.toString()}</span>;
    if (typeof value === 'number') return <span className="value-number">{value}</span>;
    if (typeof value === 'string') {
      const truncated = value.length > 120 ? value.slice(0, 120) + '...' : value;
      return <span className="value-string" title={value.length > 120 ? value : undefined}>"{truncated}"</span>;
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedPaths.has(path);
      if (value.length === 0) return <span className="type-label">Array[0]</span>;
      return (
        <div className="value-array">
          <div className="array-header" onClick={() => togglePath(path)}>
            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
            <span className="type-label">Array[{value.length}]</span>
          </div>
          {isExpanded && (
            <div className="array-content" style={{ marginLeft: `${Math.min(level, 6) * 16}px` }}>
              {value.map((item, index) => (
                <div key={index} className="array-item">
                  <span className="item-index">[{index}]:</span>
                  {renderValue(item, `${path}.${index}`, level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const isExpanded = expandedPaths.has(path);
      const keys = Object.keys(value);
      if (keys.length === 0) return <span className="type-label">Object {'{}'}</span>;
      return (
        <div className="value-object">
          <div className="object-header" onClick={() => togglePath(path)}>
            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
            <span className="type-label">Object {`{${keys.length}}`}</span>
          </div>
          {isExpanded && (
            <div className="object-content" style={{ marginLeft: `${Math.min(level, 6) * 16}px` }}>
              {keys.map(key => (
                <div key={key} className="object-item">
                  <span className="item-key">{key}:</span>
                  {renderValue(value[key], `${path}.${key}`, level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span className="value-unknown">{String(value)}</span>;
  };

  const filterData = (data, term) => {
    if (!term) return data;
    const json = JSON.stringify(data, null, 2).toLowerCase();
    return json.includes(term.toLowerCase()) ? data : null;
  };

  const filteredData = filterData(projectData, searchTerm);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>
          <i className="fas fa-database" style={{ marginRight: 8 }}></i>
          Project State
        </h3>
        <div className="dev-panel-actions">
          <button onClick={expandAll} className="dev-action-btn" title="Expand all">
            <i className="fas fa-expand-arrows-alt"></i>
          </button>
          <button onClick={collapseAll} className="dev-action-btn" title="Collapse all">
            <i className="fas fa-compress-arrows-alt"></i>
          </button>
          <button onClick={copyToClipboard} className="dev-action-btn" title="Copy to clipboard">
            <i className={`fas ${copyFeedback ? 'fa-check' : 'fa-copy'}`}></i>
          </button>
          <button onClick={downloadJson} className="dev-action-btn" title="Download JSON">
            <i className="fas fa-download"></i>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="result-cards" style={{ marginBottom: 12 }}>
          <div className="result-card">
            <div className="result-card-value">{stats.name || 'N/A'}</div>
            <div className="result-card-label">Project (ID: {stats.id || '?'})</div>
          </div>
          <div className="result-card">
            <div className="result-card-value">{stats.inventories}</div>
            <div className="result-card-label">Inventories</div>
          </div>
          <div className="result-card">
            <div className="result-card-value">{stats.items}</div>
            <div className="result-card-label">Items</div>
          </div>
          <div className="result-card">
            <div className="result-card-value">{stats.records}</div>
            <div className="result-card-label">Records</div>
          </div>
          <div className="result-card">
            <div className="result-card-value">{stats.files}</div>
            <div className="result-card-label">Files</div>
          </div>
          <div className="result-card">
            <div className="result-card-value">{formatBytes(stats.dataSize)}</div>
            <div className="result-card-label">Data Size</div>
          </div>
        </div>
      )}

      <div className="dev-panel-toolbar">
        <input
          type="text"
          placeholder="Search in state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="dev-search-input"
        />
        <div className="view-mode-toggle">
          <button
            className={`mode-btn ${viewMode === 'tree' ? 'active' : ''}`}
            onClick={() => setViewMode('tree')}
          >
            <i className="fas fa-sitemap"></i> Tree
          </button>
          <button
            className={`mode-btn ${viewMode === 'raw' ? 'active' : ''}`}
            onClick={() => setViewMode('raw')}
          >
            <i className="fas fa-code"></i> Raw
          </button>
        </div>
      </div>

      <div className="dev-panel-body">
        {!projectData ? (
          <div className="dev-empty-state">
            <i className="fas fa-database"></i>
            <p>No project loaded</p>
            <small>Open a project to inspect its state</small>
          </div>
        ) : viewMode === 'tree' ? (
          <div className="state-tree">
            {filteredData ? renderValue(filteredData, 'root', 0) : (
              <div className="dev-empty-state">
                <i className="fas fa-search"></i>
                <p>No results for "{searchTerm}"</p>
              </div>
            )}
          </div>
        ) : (
          <pre className="state-raw">
            {JSON.stringify(projectData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ProjectStateInspector;
