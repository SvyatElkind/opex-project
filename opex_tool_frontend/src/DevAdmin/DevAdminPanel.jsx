import React, { useState, useCallback, useRef, useEffect } from 'react';
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

const MIN_WIDTH = 480;
const MIN_HEIGHT = 320;

const SIZE_PRESETS = {
  compact:  { width: 600,  height: 450,  label: 'S' },
  default:  { width: 900,  height: 600,  label: 'M' },
  large:    { width: 1200, height: 750,  label: 'L' },
  full:     { width: null, height: null, label: 'Max' },
};

/**
 * Dev Admin Panel - Development & testing tool
 *
 * Features:
 *   - Draggable by header
 *   - Resizable from edges/corners
 *   - Size presets (S/M/L/Max)
 *   - Elements scale dynamically based on panel size
 *   - Tab bar scrolls horizontally when narrow
 *   - Keyboard shortcuts: Ctrl+Shift+D toggle, Escape close
 *
 * Available via: npm start (always) or npm run build:dev (opt-in build)
 * Not included in: npm run build (production)
 */
// ─── Mini Form Inspector (floating widget while form is open) ────────────────

const MiniFormInspector = ({ onClose }) => {
  const [fields, setFields] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const scan = () => {
      const inputs = document.querySelectorAll('input, select, textarea');
      const result = [];
      inputs.forEach(input => {
        if (input.type === 'hidden') return;
        if (input.closest('.dev-form-mini-inspector')) return;
        if (input.closest('.dev-admin-window')) return;

        const name = input.name || input.id || input.getAttribute('aria-label') ||
                     input.placeholder || `[${input.type || 'text'}]`;
        const value = input.type === 'checkbox' ? String(input.checked) :
                      input.type === 'file' ? (input.files?.length ? `${input.files.length} file(s)` : '') :
                      input.value;
        const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
        const required = input.required || input.getAttribute('aria-required') === 'true';

        result.push({ name, value, type: input.type || 'text', required, isEmpty, disabled: input.disabled, element: input });
      });
      setFields(result);
    };

    scan();
    const timer = setInterval(scan, 600);
    return () => clearInterval(timer);
  }, []);

  const filled = fields.filter(f => !f.isEmpty && !f.disabled).length;
  const emptyReq = fields.filter(f => f.required && f.isEmpty && !f.disabled).length;
  const total = fields.filter(f => !f.disabled).length;

  return ReactDOM.createPortal(
    <div className="dev-form-mini-inspector" style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 100000,
      width: collapsed ? 'auto' : 320, maxHeight: collapsed ? 'auto' : 420,
      background: '#1e1e1e', border: '2px solid #f59e0b', borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)', fontFamily: 'inherit', fontSize: 12,
      color: '#e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white',
        padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer', userSelect: 'none',
      }} onClick={() => setCollapsed(c => !c)}>
        <span style={{ fontWeight: 600, fontSize: 12 }}>
          <i className="fas fa-wpforms" style={{ marginRight: 6 }}></i>
          Form Inspector
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{
            background: emptyReq > 0 ? '#dc2626' : '#10b981',
            padding: '1px 6px', borderRadius: 8, fontSize: 10, fontWeight: 700,
          }}>
            {filled}/{total}
          </span>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{
            background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0 4px', fontSize: 13,
          }}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {!collapsed && (
        <div style={{ display: 'flex', gap: 8, padding: '6px 10px', background: '#111827', fontSize: 11 }}>
          <span style={{ color: '#10b981' }}><i className="fas fa-check" style={{ marginRight: 3 }}></i>{filled} filled</span>
          <span style={{ color: emptyReq > 0 ? '#ef4444' : '#6b7280' }}><i className="fas fa-asterisk" style={{ marginRight: 3 }}></i>{emptyReq} req. empty</span>
          <span style={{ color: '#6b7280' }}>{total} total</span>
        </div>
      )}

      {/* Field list */}
      {!collapsed && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {fields.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>
              <i className="fas fa-search" style={{ fontSize: 20, marginBottom: 6, display: 'block' }}></i>
              Neviena forma nav atvērta
            </div>
          )}
          {fields.filter(f => !f.disabled).map((field, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '3px 10px', borderBottom: '1px solid #1f2937',
              cursor: 'pointer',
            }} onClick={() => {
              field.element.style.outline = '3px solid #f59e0b';
              field.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setTimeout(() => { field.element.style.outline = ''; }, 2000);
            }}>
              <i className={`fas ${
                field.required && field.isEmpty ? 'fa-exclamation-circle' :
                !field.isEmpty ? 'fa-check-circle' : 'fa-circle'
              }`} style={{
                fontSize: 10,
                color: field.required && field.isEmpty ? '#ef4444' :
                       !field.isEmpty ? '#10b981' : '#4b5563',
              }}></i>
              <span style={{ fontWeight: 500, minWidth: 70, color: '#d1d5db', fontSize: 11 }}>
                {field.name}{field.required ? '*' : ''}
              </span>
              <span style={{
                fontSize: 10, color: '#9ca3af', fontFamily: 'monospace',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
              }}>
                {field.value || '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};

// ─── Tab definitions (module-scope for stable reference) ─────────────────────

const TABS = [
  { id: 'state',       label: 'State',   icon: 'fa-database' },
  { id: 'network',     label: 'Network', icon: 'fa-satellite-dish' },
  { id: 'forms',       label: 'Forms',   icon: 'fa-wpforms' },
  { id: 'performance', label: 'Perf',    icon: 'fa-tachometer-alt' },
  { id: 'tests',       label: 'Tests',   icon: 'fa-flask' },
  { id: 'errors',      label: 'Errors',  icon: 'fa-bug' },
  { id: 'mocks',       label: 'Mocks',   icon: 'fa-theater-masks' },
  { id: 'storage',     label: 'Storage', icon: 'fa-hdd' },
  { id: 'validation',  label: 'Valid.',  icon: 'fa-check-circle' },
  { id: 'quickcreate', label: 'Create',  icon: 'fa-magic' },
  { id: 'theme',       label: 'Theme',   icon: 'fa-palette' },
  { id: 'actions',     label: 'Actions', icon: 'fa-bolt' },
];

// ─── Main Panel ──────────────────────────────────────────────────────────────

const DevAdminPanel = ({ onClose, projectData }) => {
  const [activeTab, setActiveTab] = useState('state');
  const [isMinimized, setIsMinimized] = useState(false);
  const [formInspectMode, setFormInspectMode] = useState(false);
  const [position, setPosition] = useState({ x: 80, y: 60 });
  const [size, setSize] = useState({ width: 900, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeEdge, setResizeEdge] = useState(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0, left: 0, top: 0 });
  const windowRef = useRef(null);
  const tabsRef = useRef(null);

  // Compute size class for CSS scaling
  const sizeClass = size.width < 600 ? 'dev-size-compact'
    : size.width < 900 ? 'dev-size-medium'
    : 'dev-size-large';

  // ── Drag handling ──────────────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.dev-admin-header') && !e.target.closest('button')) {
      setIsDragging(true);
      dragOffsetRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      e.preventDefault();
    }
  }, [position]);

  // ── Resize handling ────────────────────────────────────────────────
  const handleResizeStart = useCallback((edge) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeEdge(edge);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: size.width,
      h: size.height,
      left: position.x,
      top: position.y,
    };
  }, [size, position]);

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMove = (e) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, e.clientX - dragOffsetRef.current.x),
          y: Math.max(0, e.clientY - dragOffsetRef.current.y),
        });
      }
      if (isResizing && resizeEdge) {
        const dx = e.clientX - resizeStartRef.current.x;
        const dy = e.clientY - resizeStartRef.current.y;
        const s = resizeStartRef.current;

        let newW = s.w, newH = s.h, newX = s.left, newY = s.top;

        if (resizeEdge.includes('e')) newW = Math.max(MIN_WIDTH, s.w + dx);
        if (resizeEdge.includes('s')) newH = Math.max(MIN_HEIGHT, s.h + dy);
        if (resizeEdge.includes('w')) {
          newW = Math.max(MIN_WIDTH, s.w - dx);
          if (newW > MIN_WIDTH) newX = s.left + dx;
        }
        if (resizeEdge.includes('n')) {
          newH = Math.max(MIN_HEIGHT, s.h - dy);
          if (newH > MIN_HEIGHT) newY = s.top + dy;
        }

        setSize({ width: newW, height: newH });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeEdge(null);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, isResizing, resizeEdge]);

  // ── Size presets ───────────────────────────────────────────────────
  const applyPreset = useCallback((presetKey) => {
    const preset = SIZE_PRESETS[presetKey];
    if (preset.width === null) {
      // Full: fill viewport with margin
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
      setPosition({ x: 20, y: 20 });
    } else {
      setSize({ width: preset.width, height: preset.height });
      // Center
      setPosition({
        x: Math.max(20, (window.innerWidth - preset.width) / 2),
        y: Math.max(20, (window.innerHeight - preset.height) / 2),
      });
    }
  }, []);

  // ── Keyboard navigation ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Ctrl+[ and Ctrl+] to switch tabs
      if (e.ctrlKey && (e.key === '[' || e.key === ']')) {
        e.preventDefault();
        const currentIdx = TABS.findIndex(t => t.id === activeTab);
        const next = e.key === ']'
          ? (currentIdx + 1) % TABS.length
          : (currentIdx - 1 + TABS.length) % TABS.length;
        setActiveTab(TABS[next].id);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, onClose]);

  // ── Scroll active tab into view ────────────────────────────────────
  useEffect(() => {
    if (tabsRef.current) {
      const activeEl = tabsRef.current.querySelector('.dev-tab.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeTab]);

  // ── Form inspect mode: listen for event from FormInspector ────────
  useEffect(() => {
    const handleStartInspect = (e) => {
      const formEvent = e.detail?.event;
      // Hide DevAdmin, show mini inspector
      setFormInspectMode(true);
      // Fire the form-opening event after a short delay so DevAdmin is gone
      if (formEvent) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent(formEvent));
        }, 150);
      }
    };
    window.addEventListener('startFormInspect', handleStartInspect);
    return () => window.removeEventListener('startFormInspect', handleStartInspect);
  }, []);

  // ── Form inspect mode: show mini inspector only ───────────────────
  if (formInspectMode) {
    return (
      <MiniFormInspector onClose={() => {
        setFormInspectMode(false);
        setActiveTab('forms');
      }} />
    );
  }

  // ── Minimized state ────────────────────────────────────────────────
  if (isMinimized) {
    return ReactDOM.createPortal(
      <div
        className="dev-admin-minimized"
        onClick={() => setIsMinimized(false)}
        title="Click to restore Dev Tools"
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
        if (e.target.className === 'dev-admin-overlay') onClose();
      }}
    >
      <div
        ref={windowRef}
        className={`dev-admin-window ${sizeClass} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Resize handles */}
        <div className="dev-resize-handle dev-resize-n"  onMouseDown={handleResizeStart('n')} />
        <div className="dev-resize-handle dev-resize-s"  onMouseDown={handleResizeStart('s')} />
        <div className="dev-resize-handle dev-resize-e"  onMouseDown={handleResizeStart('e')} />
        <div className="dev-resize-handle dev-resize-w"  onMouseDown={handleResizeStart('w')} />
        <div className="dev-resize-handle dev-resize-ne" onMouseDown={handleResizeStart('ne')} />
        <div className="dev-resize-handle dev-resize-nw" onMouseDown={handleResizeStart('nw')} />
        <div className="dev-resize-handle dev-resize-se" onMouseDown={handleResizeStart('se')} />
        <div className="dev-resize-handle dev-resize-sw" onMouseDown={handleResizeStart('sw')} />

        {/* Header */}
        <div className="dev-admin-header">
          <div className="dev-admin-title">
            <i className="fas fa-tools"></i>
            <span>Dev Admin Panel</span>
            <span className="dev-badge">DEV ONLY</span>
          </div>
          <div className="dev-admin-controls">
            {/* Size presets */}
            <div className="dev-size-presets">
              {Object.entries(SIZE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  className="dev-preset-btn"
                  onClick={() => applyPreset(key)}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="dev-controls-divider" />
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
              title="Close (Esc)"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Tabs — scrollable */}
        <div className="dev-admin-tabs" ref={tabsRef}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`dev-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span className="dev-tab-label">{tab.label}</span>
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
          <span className="dev-footer-shortcuts">
            <kbd>Ctrl+Shift+D</kbd> toggle
            <span className="dev-footer-sep">|</span>
            <kbd>Esc</kbd> close
            <span className="dev-footer-sep">|</span>
            <kbd>Ctrl+[/]</kbd> tabs
          </span>
          <span className="dev-footer-size">{size.width}x{size.height}</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DevAdminPanel;
