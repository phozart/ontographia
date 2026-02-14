// components/ui/SummaryBar.js
// Shared summary/stats bar component

import styles from './ui.module.css';

/**
 * SummaryBar - Container for summary statistics
 */
export function SummaryBar({ children, className = '' }) {
  return (
    <div className={`${styles.summaryBar} ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * SummaryTotal - Main total with icon and label
 */
SummaryBar.Total = function SummaryTotal({ icon: Icon, value, label }) {
  return (
    <div className={styles.summaryTotal}>
      {Icon && <Icon />}
      <span className={styles.summaryValue}>{value}</span>
      <span className={styles.summaryLabel}>{label}</span>
    </div>
  );
};

/**
 * SummaryBreakdown - Container for breakdown items
 */
SummaryBar.Breakdown = function SummaryBreakdown({ children }) {
  return <div className={styles.summaryBreakdown}>{children}</div>;
};

/**
 * SummaryItem - Individual breakdown item
 */
export function SummaryItem({ value, label, color }) {
  return (
    <div className={styles.summaryItem} style={color ? { color } : undefined}>
      <span className={styles.summaryItemValue}>{value}</span>
      <span className={styles.summaryItemLabel}>{label}</span>
    </div>
  );
}

/**
 * SummaryAlert - Alert/warning indicator
 */
SummaryBar.Alert = function SummaryAlert({ icon: Icon, children }) {
  return (
    <div className={styles.summaryAlert}>
      {Icon && <Icon fontSize="small" />}
      <span>{children}</span>
    </div>
  );
};

/**
 * SummaryInfo - Info indicator
 */
SummaryBar.Info = function SummaryInfo({ icon: Icon, children }) {
  return (
    <div className={styles.summaryInfo}>
      {Icon && <Icon fontSize="small" />}
      <span>{children}</span>
    </div>
  );
};
