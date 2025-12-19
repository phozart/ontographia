/**
 * ProgressCard - RAG status card with trend indicator
 *
 * Reusable component for displaying project health status
 * with Red/Amber/Green indicators.
 *
 * @module components/ui/ProgressCard
 */

import styles from './ui.module.css';

// RAG colors
const RAG_COLORS = {
  green: { bg: '#dcfce7', color: '#166534', label: 'On Track' },
  amber: { bg: '#fef3c7', color: '#92400e', label: 'At Risk' },
  red: { bg: '#fee2e2', color: '#991b1b', label: 'Off Track' },
  unknown: { bg: '#f3f4f6', color: '#6b7280', label: 'Unknown' },
};

// Trend icons
const TREND_ICONS = {
  improving: '↑',
  stable: '→',
  declining: '↓',
};

/**
 * ProgressCard component
 *
 * @param {string} title - Card title
 * @param {string} status - RAG status: 'green', 'amber', 'red', 'unknown'
 * @param {string} trend - Trend direction: 'improving', 'stable', 'declining'
 * @param {string} value - Optional value to display
 * @param {string} subtitle - Optional subtitle
 * @param {ReactNode} icon - Optional icon component
 * @param {function} onClick - Optional click handler
 */
export function ProgressCard({
  title,
  status = 'unknown',
  trend,
  value,
  subtitle,
  icon,
  onClick,
  className = '',
}) {
  const ragConfig = RAG_COLORS[status] || RAG_COLORS.unknown;

  return (
    <div
      className={`${styles.progressCard} ${onClick ? styles.clickable : ''} ${className}`.trim()}
      style={{
        '--rag-bg': ragConfig.bg,
        '--rag-color': ragConfig.color,
      }}
      onClick={onClick}
    >
      <div className={styles.progressCardHeader}>
        {icon && <span className={styles.progressCardIcon}>{icon}</span>}
        <span className={styles.progressCardTitle}>{title}</span>
        {trend && (
          <span
            className={styles.progressCardTrend}
            data-trend={trend}
            title={`Trend: ${trend}`}
          >
            {TREND_ICONS[trend]}
          </span>
        )}
      </div>

      <div className={styles.progressCardBody}>
        <div className={styles.progressCardStatus} style={{ backgroundColor: ragConfig.bg }}>
          <span className={styles.progressCardStatusDot} style={{ backgroundColor: ragConfig.color }} />
          <span style={{ color: ragConfig.color }}>{ragConfig.label}</span>
        </div>

        {value !== undefined && (
          <div className={styles.progressCardValue}>{value}</div>
        )}
      </div>

      {subtitle && (
        <div className={styles.progressCardSubtitle}>{subtitle}</div>
      )}
    </div>
  );
}

/**
 * ProgressCardGroup - Container for multiple progress cards
 */
export function ProgressCardGroup({ children, columns = 4, className = '' }) {
  return (
    <div
      className={`${styles.progressCardGroup} ${className}`.trim()}
      style={{ '--columns': columns }}
    >
      {children}
    </div>
  );
}

/**
 * MiniProgressCard - Compact version for dashboards
 */
export function MiniProgressCard({ title, status = 'unknown', value, onClick }) {
  const ragConfig = RAG_COLORS[status] || RAG_COLORS.unknown;

  return (
    <div
      className={`${styles.miniProgressCard} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
    >
      <span
        className={styles.miniProgressCardDot}
        style={{ backgroundColor: ragConfig.color }}
        title={ragConfig.label}
      />
      <span className={styles.miniProgressCardTitle}>{title}</span>
      {value !== undefined && (
        <span className={styles.miniProgressCardValue}>{value}</span>
      )}
    </div>
  );
}

export default ProgressCard;
