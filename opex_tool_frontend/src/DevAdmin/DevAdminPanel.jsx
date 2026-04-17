import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ProjectStateInspector from './components/ProjectStateInspector';
import LocalStorageManager from './components/LocalStorageManager';
import ValidationTester from './components/ValidationTester';
import QuickActions from './components/QuickActions';
import TestDashboard from './components/TestDashboard';
import NetworkMonitor from './components/NetworkMonitor';
import FormInspector from './components/FormInspector';
import PerformanceProfiler from './components/PerformanceProfiler';
import ErrorBoundaryTester from './components/ErrorBoundaryTester';
import APIMockToggle from './components/APIMockToggle';
import QuickCreate from './components/QuickCreate';
import ThemeSwitcher from './components/ThemeSwitcher';
import './DevAdminPanel.css';
import './components/TestDashboard.css';

/**
 * Dev Admin Panel - Development & testing tool
 *
 * Available via: npm start (always) or npm run build:dev (opt-in build)
 * Not included in: npm run build (production)
 */
const DevAdminPanel = ({ onClose, projectData }) => {
  const [activeTab, setActiveTab] = useState('state');
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const tabs = [
    { id: 'state', label: 'State', icon: 'fa-database' },
    { id: 'network', label: 'Network', icon: 'fa-satellite-dish' },
    { id: 'forms', label: 'Forms', icon: 'fa-wpforms' },
    { id: 'performance', label: 'Perf', icon: 'fa-tachometer-alt' },
    { id: 'tests', label: 'Tests', icon: 'fa-flask' },
    { id: 'errors', label: 'Errors', icon: 'fa-bug' },
    { id: 'mocks', label: 'Mocks', icon: 'fa-theater-masks' },
    { id: 'storage', label: 'Storage', icon: 'fa-hdd' },
    { id: 'validation', label: 'Valid.', icon: 'fa-check-circle' },
    { id: 'quickcreate', label: 'Create', icon: 'fa-magic' },
    { id: 'theme', label: 'Theme', icon: 'fa-palette' },
    { id: 'actions', label: 'Actions', icon: 'fa-bolt' },
  ];

  const handleMouseDown = (e) => {
    if (e.target.closest('.dev-admin-header')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (isMinimized) {
    return ReactDOM.createPortal(
      <div
        className="dev-admin-minimized"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onClick={() => setIsMinimized(false)}
      >
        <i className="fas fa-tools"></i>
        <span>Dev Tools</span>
      </div>,
      document.body
    );
  }

  return ReactDOM.createPortal(
    <div
      className="dev-admin-overlay"
      onClick={(e) => {
        if (e.target.className === 'dev-admin-overlay') {
          onClose();
        }
      }}
    >
      <div
        className={`dev-admin-window ${isDragging ? 'dragging' : ''}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="dev-admin-header">
          <div className="dev-admin-title">
            <i className="fas fa-tools"></i>
            <span>Dev Admin Panel</span>
            <span className="dev-badge">DEV ONLY</span>
          </div>
          <div className="dev-admin-controls">
            <button
              onClick={() => setIsMinimized(true)}
              className="dev-control-btn"
              title="Minimize"
            >
              <i className="fas fa-minus"></i>
            </button>
            <button
              onClick={onClose}
              className="dev-control-btn close"
              title="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="dev-admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`dev-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="dev-admin-content">
          {activeTab === 'state' && <ProjectStateInspector projectData={projectData} />}
          {activeTab === 'network' && <NetworkMonitor />}
          {activeTab === 'forms' && <FormInspector />}
          {activeTab === 'performance' && <PerformanceProfiler />}
          {activeTab === 'tests' && <TestDashboard />}
          {activeTab === 'errors' && <ErrorBoundaryTester />}
          {activeTab === 'mocks' && <APIMockToggle />}
          {activeTab === 'storage' && <LocalStorageManager />}
          {activeTab === 'quickcreate' && <QuickCreate projectData={projectData} />}
          {activeTab === 'theme' && <ThemeSwitcher />}
          {activeTab === 'validation' && <ValidationTester projectData={projectData} />}
          {activeTab === 'actions' && <QuickActions projectData={projectData} />}
        </div>

        {/* Footer */}
        <div className="dev-admin-footer">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Ctrl+Shift+D to toggle | Dev build only (npm run build:dev)</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DevAdminPanel;
