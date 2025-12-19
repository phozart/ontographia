// components/ui/EmptyState.js
// Shared empty state and quick start components

import styles from './ui.module.css';
import { Button } from './Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/**
 * EmptyState - Simple empty state with icon, title, description, and action
 */
export function EmptyState({
  icon: Icon,
  iconColor = '#6366f1',
  title,
  description,
  actionLabel,
  onAction,
  children,
}) {
  return (
    <div className={styles.emptyState}>
      {Icon && (
        <div
          className={styles.emptyStateIcon}
          style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
        >
          <Icon style={{ fontSize: 32 }} />
        </div>
      )}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
}

/**
 * QuickStart - Getting started card with workflow steps
 */
export function QuickStart({
  icon: Icon,
  title,
  description,
  steps = [],
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <div className={styles.quickStart}>
      <div className={styles.quickStartHeader}>
        {Icon && <Icon />}
        <h3>{title}</h3>
      </div>

      {description && <p className={styles.quickStartDesc}>{description}</p>}

      {steps.length > 0 && (
        <div className={styles.quickStartFlow}>
          {steps.map((step, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {index > 0 && (
                <ArrowForwardIcon className={styles.quickStartArrow} fontSize="small" />
              )}
              <div className={styles.quickStartStep}>
                <span className={styles.quickStartStepNum}>{index + 1}</span>
                <span>{step}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.quickStartActions}>
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="ghost" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * EmptyFiltered - Empty state when filters return no results
 */
export function EmptyFiltered({ onClear }) {
  return (
    <div className={styles.emptyFiltered}>
      <p>No items match your filters.</p>
      <Button variant="ghost" onClick={onClear}>
        Clear Filters
      </Button>
    </div>
  );
}
