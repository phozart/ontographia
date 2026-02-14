// components/ui/Toast.js
// Toast notification system for consistent alerts and messages
// Task X-007: Define error toast/alert patterns

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ui.module.css';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Toast variants for different message types
 */
const VARIANTS = {
  success: {
    icon: CheckCircleOutlineIcon,
    className: 'toastSuccess',
  },
  error: {
    icon: ErrorOutlineIcon,
    className: 'toastError',
  },
  warning: {
    icon: WarningAmberIcon,
    className: 'toastWarning',
  },
  info: {
    icon: InfoOutlinedIcon,
    className: 'toastInfo',
  },
};

/**
 * Default toast duration in milliseconds
 */
const DEFAULT_DURATION = 5000;

/**
 * Toast context for global state
 */
const ToastContext = createContext(null);

/**
 * Generate unique ID for toasts
 */
let toastId = 0;
const generateId = () => `toast-${++toastId}`;

/**
 * Individual Toast component
 */
function ToastItem({ toast, onDismiss }) {
  const { id, variant = 'info', title, message, duration, dismissible = true, action } = toast;
  const config = VARIANTS[variant] || VARIANTS.info;
  const Icon = config.icon;

  useEffect(() => {
    if (duration !== Infinity && duration !== 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration || DEFAULT_DURATION);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <div
      className={`${styles.toast} ${styles[config.className]}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={styles.toastIcon}>
        <Icon fontSize="small" />
      </div>
      <div className={styles.toastContent}>
        {title && <div className={styles.toastTitle}>{title}</div>}
        {message && <div className={styles.toastMessage}>{message}</div>}
        {action && (
          <button
            className={styles.toastAction}
            onClick={() => {
              action.onClick?.();
              if (action.dismissOnClick !== false) {
                onDismiss(id);
              }
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      {dismissible && (
        <button
          className={styles.toastDismiss}
          onClick={() => onDismiss(id)}
          aria-label="Dismiss notification"
        >
          <CloseIcon fontSize="small" />
        </button>
      )}
    </div>
  );
}

/**
 * Toast container component - renders all active toasts
 */
function ToastContainer({ toasts, onDismiss, position = 'bottom-right' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || toasts.length === 0) return null;

  const container = (
    <div className={`${styles.toastContainer} ${styles[`toastPosition${position.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`]}`}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );

  return createPortal(container, document.body);
}

/**
 * Toast Provider - wrap your app with this to enable toasts
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'top-left'|'top-center'|'top-right'|'bottom-left'|'bottom-center'|'bottom-right'} [props.position='bottom-right']
 */
export function ToastProvider({ children, position = 'bottom-right' }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    const id = generateId();
    const toast = {
      id,
      duration: DEFAULT_DURATION,
      ...options,
    };
    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addToast({ variant: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ variant: 'error', message, duration: 8000, ...options });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ variant: 'warning', message, ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ variant: 'info', message, ...options });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} position={position} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast functions
 * @returns {{
 *   addToast: (options: ToastOptions) => string,
 *   removeToast: (id: string) => void,
 *   clearToasts: () => void,
 *   success: (message: string, options?: ToastOptions) => string,
 *   error: (message: string, options?: ToastOptions) => string,
 *   warning: (message: string, options?: ToastOptions) => string,
 *   info: (message: string, options?: ToastOptions) => string,
 * }}
 *
 * @typedef {Object} ToastOptions
 * @property {'success'|'error'|'warning'|'info'} [variant] - Toast type
 * @property {string} [title] - Toast title
 * @property {string} [message] - Toast message
 * @property {number} [duration] - Auto-dismiss duration (ms), use Infinity to disable
 * @property {boolean} [dismissible] - Show dismiss button
 * @property {{label: string, onClick: () => void, dismissOnClick?: boolean}} [action] - Action button
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Inline Alert component - for static alerts within content
 * @param {Object} props
 * @param {'success'|'error'|'warning'|'info'} [props.variant='info'] - Alert type
 * @param {string} [props.title] - Alert title
 * @param {string} props.children - Alert message
 * @param {boolean} [props.dismissible=false] - Show dismiss button
 * @param {Function} [props.onDismiss] - Dismiss callback
 * @param {{label: string, onClick: () => void}} [props.action] - Action button
 */
export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  action,
  className = '',
}) {
  const config = VARIANTS[variant] || VARIANTS.info;
  const Icon = config.icon;

  return (
    <div
      className={`${styles.alert} ${styles[config.className]} ${className}`}
      role="alert"
    >
      <div className={styles.alertIcon}>
        <Icon />
      </div>
      <div className={styles.alertContent}>
        {title && <div className={styles.alertTitle}>{title}</div>}
        <div className={styles.alertMessage}>{children}</div>
        {action && (
          <button className={styles.alertAction} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      {dismissible && onDismiss && (
        <button
          className={styles.alertDismiss}
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          <CloseIcon fontSize="small" />
        </button>
      )}
    </div>
  );
}

/**
 * Banner component - for page-level alerts
 * @param {Object} props
 * @param {'success'|'error'|'warning'|'info'} [props.variant='info'] - Banner type
 * @param {string} props.children - Banner message
 * @param {boolean} [props.dismissible=true] - Show dismiss button
 * @param {Function} [props.onDismiss] - Dismiss callback
 * @param {{label: string, onClick: () => void}} [props.action] - Action button
 */
export function Banner({
  variant = 'info',
  children,
  dismissible = true,
  onDismiss,
  action,
}) {
  const config = VARIANTS[variant] || VARIANTS.info;
  const Icon = config.icon;

  return (
    <div className={`${styles.banner} ${styles[config.className]}`} role="banner">
      <div className={styles.bannerContent}>
        <Icon className={styles.bannerIcon} />
        <span className={styles.bannerMessage}>{children}</span>
        {action && (
          <button className={styles.bannerAction} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      {dismissible && onDismiss && (
        <button
          className={styles.bannerDismiss}
          onClick={onDismiss}
          aria-label="Dismiss banner"
        >
          <CloseIcon fontSize="small" />
        </button>
      )}
    </div>
  );
}

export default {
  ToastProvider,
  useToast,
  Alert,
  Banner,
};
