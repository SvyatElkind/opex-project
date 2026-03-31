import React, { useState, useCallback, useContext, createContext, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * Global Notification System
 *
 * Replaces all alert() and window.confirm() calls with proper UI.
 *
 * Usage:
 *   const { notify, confirm } = useNotification();
 *
 *   // Replace alert():
 *   notify.success('Iestatījumi saglabāti!');
 *   notify.error('Kļūda: ' + error.message);
 *   notify.warning('Brīdinājums');
 *   notify.info('Informācija');
 *
 *   // Replace window.confirm():
 *   const ok = await confirm('Vai tiešām vēlaties dzēst?');
 *   if (ok) { ... }
 *
 *   // With options:
 *   const ok = await confirm({
 *     title: 'Dzēst ierakstu?',
 *     message: 'Šī darbība ir neatgriezeniska.',
 *     confirmText: 'Dzēst',
 *     cancelText: 'Atcelt',
 *     variant: 'danger'
 *   });
 */

const NotificationContext = createContext(null);

// ─── Toast Notification ─────────────────────────────────────────────────────

const ToastItem = ({ id, message, type, onDismiss }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(id), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle',
  };

  return (
    <div
      className={`notification-toast notification-toast-${type} ${exiting ? 'notification-toast-exit' : ''}`}
      onClick={() => { setExiting(true); setTimeout(() => onDismiss(id), 300); }}
      role="alert"
    >
      <i className={`fas ${icons[type] || icons.info}`}></i>
      <span>{message}</span>
    </div>
  );
};

// ─── Confirm Dialog ─────────────────────────────────────────────────────────

const ConfirmDialog = ({ config, onResolve }) => {
  if (!config) return null;

  const {
    title = 'Apstiprināt darbību',
    message = 'Vai esat pārliecināts?',
    confirmText = 'Apstiprināt',
    cancelText = 'Atcelt',
    variant = 'default', // default | danger | warning
  } = typeof config === 'string' ? { message: config } : config;

  const variantClass = variant === 'danger' ? 'notification-confirm-danger'
    : variant === 'warning' ? 'notification-confirm-warning'
    : '';

  return ReactDOM.createPortal(
    <div
      className="notification-confirm-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onResolve(false); }}
    >
      <div className={`notification-confirm-dialog ${variantClass}`}>
        <div className="notification-confirm-header">
          <i className={`fas ${variant === 'danger' ? 'fa-exclamation-triangle' : 'fa-question-circle'}`}></i>
          <h4>{title}</h4>
        </div>
        <p className="notification-confirm-message">{message}</p>
        <div className="notification-confirm-actions">
          <button
            className="notification-confirm-btn notification-confirm-cancel"
            onClick={() => onResolve(false)}
          >
            {cancelText}
          </button>
          <button
            className={`notification-confirm-btn notification-confirm-ok ${variantClass}`}
            onClick={() => onResolve(true)}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Provider ───────────────────────────────────────────────────────────────

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const confirmResolveRef = useRef(null);
  const idRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev.slice(-4), { id, message, type }]); // Max 5 toasts
  }, []);

  const notify = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  const confirm = useCallback((config) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmConfig(config);
    });
  }, []);

  const handleConfirmResolve = useCallback((result) => {
    if (confirmResolveRef.current) {
      confirmResolveRef.current(result);
      confirmResolveRef.current = null;
    }
    setConfirmConfig(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, confirm, showConfirm: confirm }}>
      {children}

      {/* Toast Stack */}
      {toasts.length > 0 && ReactDOM.createPortal(
        <div className="notification-toast-stack">
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              onDismiss={dismissToast}
            />
          ))}
        </div>,
        document.body
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog config={confirmConfig} onResolve={handleConfirmResolve} />
    </NotificationContext.Provider>
  );
};

// ─── Hook ───────────────────────────────────────────────────────────────────

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Fallback for components outside provider (shouldn't happen, but safe)
    return {
      notify: {
        success: (msg) => console.log('[notify:success]', msg),
        error: (msg) => console.error('[notify:error]', msg),
        warning: (msg) => console.warn('[notify:warning]', msg),
        info: (msg) => console.log('[notify:info]', msg),
      },
      confirm: async () => true,
    };
  }
  return context;
};

export default NotificationProvider;
