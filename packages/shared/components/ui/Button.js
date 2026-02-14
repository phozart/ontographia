// components/ui/Button.js
// Shared Button components with consistent styling

import styles from './ui.module.css';

/**
 * Primary Button component with variants
 *
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {ReactNode} children - Button content
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Additional classes
 */
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  title,
  ...props
}) {
  const variantClass = {
    primary: styles.btnPrimary,
    secondary: styles.btnSecondary,
    ghost: styles.btnGhost,
    danger: styles.btnDanger,
    success: styles.btnSuccess,
  }[variant] || styles.btnPrimary;

  const sizeClass = {
    sm: styles.btnSm,
    lg: styles.btnLg,
  }[size] || '';

  return (
    <button
      type={type}
      className={`${styles.btn} ${variantClass} ${sizeClass} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Icon-only button for toolbar actions
 */
export function IconButton({
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
  title,
  active = false,
  ...props
}) {
  const sizeClass = size === 'sm' ? styles.iconBtnSm : '';

  return (
    <button
      type="button"
      className={`${styles.iconBtn} ${sizeClass} ${active ? styles.active : ''} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Button group for toggle-style selections (e.g., view mode toggle)
 */
export function ButtonGroup({ children, className = '' }) {
  return (
    <div className={`${styles.btnGroup} ${className}`.trim()}>
      {children}
    </div>
  );
}
