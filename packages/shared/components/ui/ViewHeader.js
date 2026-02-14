// components/ui/ViewHeader.js
// Shared ViewHeader component for consistent page/view headers

import styles from './ui.module.css';
import { Button } from './Button';
import AddIcon from '@mui/icons-material/Add';

/**
 * ViewHeader - Consistent header for list/detail views
 *
 * @param {ReactNode} icon - Icon component to display
 * @param {string} iconColor - Color for icon (hex)
 * @param {string} title - Main title
 * @param {string} subtitle - Optional subtitle (smaller text after title)
 * @param {string} description - Subtitle/description below title
 * @param {number} count - Optional count badge
 * @param {Array} stats - Inline stats array [{value, label, color?, icon?}, ...]
 * @param {string} createLabel - Label for create button (null to hide)
 * @param {function} onCreate - Handler for create button
 * @param {ReactNode} actions - Additional action buttons
 */
export function ViewHeader({
  icon: Icon,
  iconColor = '#6366f1',
  title,
  subtitle,
  description,
  count,
  stats,
  createLabel,
  onCreate,
  actions,
  children,
}) {
  return (
    <div className={styles.viewHeader}>
      <div className={styles.viewHeaderLeft}>
        {Icon && (
          <div
            className={styles.viewHeaderIcon}
            style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
          >
            <Icon fontSize="small" />
          </div>
        )}
        <div className={styles.viewHeaderInfo}>
          <div className={styles.viewHeaderTitle}>
            <h2>{title}</h2>
            {subtitle && <span className={styles.viewHeaderSubtitle}>{subtitle}</span>}
            {count !== undefined && (
              <span className={styles.viewHeaderCount}>{count}</span>
            )}
          </div>
          {description && <p className={styles.viewHeaderDesc}>{description}</p>}
        </div>
      </div>

      {/* Inline stats - StakeholderRegister pattern */}
      {stats && stats.length > 0 && (
        <div className={styles.viewHeaderStats}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.viewHeaderStat}>
              {stat.icon && <stat.icon fontSize="small" style={stat.color ? { color: stat.color } : undefined} />}
              <span className={styles.viewHeaderStatValue} style={stat.color ? { color: stat.color } : undefined}>
                {stat.value}
              </span>
              <span className={styles.viewHeaderStatLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.viewHeaderActions}>
        {actions}
        {createLabel && onCreate && (
          <Button variant="primary" onClick={onCreate}>
            <AddIcon fontSize="small" />
            <span>{createLabel}</span>
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
