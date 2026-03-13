import React, { useState } from 'react';

const ProjectStateInspector = ({ projectData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPaths, setExpandedPaths] = useState(new Set());
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'raw'

  const togglePath = (path) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const copyToClipboard = () => {
    const json = JSON.stringify(projectData, null, 2);
    navigator.clipboard.writeText(json);
    alert('Project state copied to clipboard!');
  };

  const downloadJson = () => {
    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-state-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderValue = (value, path = '', level = 0) => {
    if (value === null) return <span className="value-null">null</span>;
    if (value === undefined) return <span className="value-undefined">undefined</span>;
    if (typeof value === 'boolean') return <span className="value-boolean">{value.toString()}</span>;
    if (typeof value === 'number') return <span className="value-number">{value}</span>;
    if (typeof value === 'string') return <span className="value-string">"{value}"</span>;

    if (Array.isArray(value)) {
      const isExpanded = expandedPaths.has(path);
      return (
        <div className="value-array">
          <div className="array-header" onClick={() => togglePath(path)}>
            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
            <span className="type-label">Array[{value.length}]</span>
          </div>
          {isExpanded && (
            <div className="array-content" style={{ marginLeft: `${level * 20}px` }}>
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
      return (
        <div className="value-object">
          <div className="object-header" onClick={() => togglePath(path)}>
            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
            <span className="type-label">Object {`{${keys.length}}`}</span>
          </div>
          {isExpanded && (
            <div className="object-content" style={{ marginLeft: `${level * 20}px` }}>
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

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>Project State Inspector</h3>
        <div className="dev-panel-actions">
          <button onClick={copyToClipboard} className="dev-action-btn" title="Copy to clipboard">
            <i className="fas fa-copy"></i>
          </button>
          <button onClick={downloadJson} className="dev-action-btn" title="Download JSON">
            <i className="fas fa-download"></i>
          </button>
        </div>
      </div>

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
          </div>
        ) : viewMode === 'tree' ? (
          <div className="state-tree">
            {filteredData ? renderValue(filteredData, 'root', 0) : (
              <div className="dev-empty-state">
                <i className="fas fa-search"></i>
                <p>No results found</p>
              </div>
            )}
          </div>
        ) : (
          <pre className="state-raw">
            {JSON.stringify(projectData, null, 2)}
          </pre>
        )}
      </div>

      <div className="dev-panel-stats">
        <span><strong>Project ID:</strong> {projectData?.id || 'N/A'}</span>
        <span><strong>Project Name:</strong> {projectData?.name || 'N/A'}</span>
        <span><strong>Inventories:</strong> {projectData?.institution?.fond?.inventories?.length || 0}</span>
      </div>
    </div>
  );
};

export default ProjectStateInspector;
