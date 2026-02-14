// components/shared/DomainDashboard/QuickStatsBar.js
// Horizontal row of stat cards for domain dashboard

import styles from './DomainDashboard.module.css';

/**
 * Individual stat card component
 * @param {Object} props
 * @param {string} props.label - Stat label (e.g., "Active Projects")
 * @param {number|string} props.value - Main stat value
 * @param {string} props.subtext - Optional secondary text
 * @param {string} props.icon - Emoji icon
 */
function StatCard({ label, value, subtext, icon }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        {icon && <span className={styles.statIcon}>{icon}</span>}
        <span className={styles.statLabel}>{label}</span>
      </div>
      <div className={styles.statValue}>{value}</div>
      {subtext && <div className={styles.statSubtext}>{subtext}</div>}
    </div>
  );
}

/**
 * QuickStatsBar - Horizontal row of domain-level statistics
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects with { label, value, subtext?, icon? }
 * @param {boolean} props.loading - Show loading state
 */
export default function QuickStatsBar({ stats = [], loading = false }) {
  if (loading) {
    return (
      <div className={styles.statsBar}>
        <div className={styles.statsBarInner}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Loading...</span>
              </div>
              <div className={styles.statValue}>-</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className={styles.statsBar}>
      <div className={styles.statsBarInner}>
        {stats.map((stat, idx) => (
          <StatCard
            key={stat.label || idx}
            label={stat.label}
            value={stat.value}
            subtext={stat.subtext}
            icon={stat.icon}
          />
        ))}
      </div>
    </div>
  );
}

export { StatCard };
