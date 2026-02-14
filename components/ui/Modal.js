// components/ui/Modal.js
// Shared Modal component with animations and accessibility

import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import styles from './Modal.module.css';

/**
 * Modal - Unified modal component with backdrop blur, animations, accessibility
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when modal should close
 * @param {string} title - Modal header title
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {boolean} showClose - Show close button in header
 * @param {boolean} closeOnBackdrop - Close when clicking backdrop
 * @param {boolean} closeOnEsc - Close when pressing Escape
 * @param {ReactNode} children - Modal content
 * @param {ReactNode} footer - Optional footer content
 * @param {string} className - Additional classes for modal content
 */
export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  showClose = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  children,
  footer,
  className = '',
  icon: Icon,
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle ESC key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && closeOnEsc) {
      onClose?.();
    }
  }, [closeOnEsc, onClose]);

  // Focus trap and restore
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Focus first focusable element
      setTimeout(() => {
        const focusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }, 100);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose?.();
    }
  };

  const sizeClass = {
    sm: styles.modalSm,
    md: styles.modalMd,
    lg: styles.modalLg,
    xl: styles.modalXl,
    full: styles.modalFull,
  }[size] || styles.modalMd;

  const modalContent = (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`${styles.modal} ${sizeClass} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className={styles.header}>
            <div className={styles.headerContent}>
              {Icon && (
                <div className={styles.headerIcon}>
                  <Icon />
                </div>
              )}
              {title && (
                <h2 id="modal-title" className={styles.title}>
                  {title}
                </h2>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Portal to body to avoid z-index issues
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

/**
 * ConfirmModal - Specialized modal for confirmation dialogs
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false,
  icon: Icon,
}) {
  const variantClass = {
    danger: styles.confirmDanger,
    warning: styles.confirmWarning,
    primary: styles.confirmPrimary,
  }[variant] || styles.confirmDanger;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showClose={false}
    >
      <div className={`${styles.confirm} ${variantClass}`}>
        {Icon && (
          <div className={styles.confirmIcon}>
            <Icon />
          </div>
        )}
        <h3 className={styles.confirmTitle}>{title}</h3>
        {message && <p className={styles.confirmMessage}>{message}</p>}
        <div className={styles.confirmActions}>
          <button
            type="button"
            className={styles.confirmCancel}
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * ModalHeader - For custom header layouts
 */
Modal.Header = function ModalHeader({ children, className = '' }) {
  return <div className={`${styles.header} ${className}`.trim()}>{children}</div>;
};

/**
 * ModalBody - Scrollable content area
 */
Modal.Body = function ModalBody({ children, className = '' }) {
  return <div className={`${styles.content} ${className}`.trim()}>{children}</div>;
};

/**
 * ModalFooter - Fixed footer with actions
 */
Modal.Footer = function ModalFooter({ children, className = '' }) {
  return <div className={`${styles.footer} ${className}`.trim()}>{children}</div>;
};
