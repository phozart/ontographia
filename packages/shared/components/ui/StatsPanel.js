// components/ui/StatsPanel.js
// Shared Stats Panel component for tool sidebars

import styles from './StatsPanel.module.css';

/**
 * StatsPanel - Sidebar panel for displaying statistics and legends
 *
 * @param {string} title - Panel heading
 * @param {ReactNode} children - Panel content
 * @param {string} className - Additional classes
 */
export function StatsPanel({ title, children, className = '' }) {
  return (
    <div className={`${styles.panel} ${className}`.trim()}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

/**
 * StatItem - Individual statistic with label and value
 */
export function StatItem({
  label,
  value,
  color,
  icon: Icon,
  trend,
  sublabel,
  onClick,
  className = '',
}) {
  const trendClass = trend > 0 ? styles.trendUp : trend < 0 ? styles.trendDown : '';

  return (
    <div
      className={`${styles.item} ${onClick ? styles.clickable : ''} ${className}`.trim()}
      onClick={onClick}
      style={color ? { '--stat-color': color } : undefined}
    >
      {Icon && (
        <div className={styles.itemIcon} style={color ? { background: `${color}15`, color } : undefined}>
          <Icon />
        </div>
      )}
      <div className={styles.itemContent}>
        <span className={styles.itemLabel}>{label}</span>
        {sublabel && <span className={styles.itemSublabel}>{sublabel}</span>}
      </div>
      <div className={styles.itemValue}>
        <span className={styles.value}>{value}</span>
        {trend !== undefined && trend !== 0 && (
          <span className={`${styles.trend} ${trendClass}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * LegendItem - Legend entry with color indicator
 */
export function LegendItem({
  label,
  color,
  count,
  description,
  className = '',
}) {
  return (
    <div className={`${styles.legendItem} ${className}`.trim()}>
      <div className={styles.legendHeader}>
        <div className={styles.legendColor} style={{ background: color }} />
        <span className={styles.legendLabel}>{label}</span>
        {count !== undefined && (
          <span className={styles.legendCount}>{count}</span>
        )}
      </div>
      {description && (
        <p className={styles.legendDesc}>{description}</p>
      )}
    </div>
  );
}

/**
 * StatGroup - Group of related stats with optional heading
 */
export function StatGroup({ title, children, className = '' }) {
  return (
    <div className={`${styles.group} ${className}`.trim()}>
      {title && <h4 className={styles.groupTitle}>{title}</h4>}
      {children}
    </div>
  );
}

/**
 * StatDivider - Visual separator between stat groups
 */
export function StatDivider() {
  return <div className={styles.divider} />;
}

/**
 * MiniChart - Placeholder for small inline charts
 */
export function MiniChart({ data = [], color = 'var(--accent)', className = '' }) {
  if (!data.length) return null;

  const max = Math.max(...data);
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (v / max) * 100,
  }));

  const pathD = points.map((p, i) =>
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ');

  return (
    <div className={`${styles.miniChart} ${className}`.trim()}>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
