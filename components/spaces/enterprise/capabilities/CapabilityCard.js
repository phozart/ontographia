/**
 * CapabilityCard - Individual capability display card
 *
 * Shows:
 * - Capability name and description
 * - Maturity level indicator
 * - Strategic importance
 * - Investment priority
 * - Owner/responsible
 *
 * @module components/spaces/enterprise/capabilities/CapabilityCard
 */

import { MATURITY_LEVELS, STRATEGIC_IMPORTANCE, INVESTMENT_PRIORITY } from '../EnterpriseContext';
import styles from './capabilities.module.css';

export default function CapabilityCard({
  capability,
  onClick,
  selected = false,
  compact = false,
}) {
  const maturity = MATURITY_LEVELS[capability.maturity_level || capability.maturity || 1];
  const importance = STRATEGIC_IMPORTANCE[capability.strategic_importance || 'medium'];
  const investment = INVESTMENT_PRIORITY[capability.investment_priority || 'maintain'];

  if (compact) {
    return (
      <div
        className={`${styles.cardCompact} ${selected ? styles.selected : ''}`}
        onClick={onClick}
        style={{ '--card-accent': maturity?.color }}
      >
        <div className={styles.cardCompactHeader}>
          <span className={styles.cardCompactName}>{capability.name}</span>
          <span
            className={styles.maturityDot}
            style={{ background: maturity?.color }}
            title={`Maturity: ${maturity?.label}`}
          />
        </div>
        {capability.code && (
          <span className={styles.cardCompactCode}>{capability.code}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      style={{ '--card-accent': importance?.color || maturity?.color }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <h4 className={styles.cardName}>{capability.name}</h4>
          {capability.code && (
            <span className={styles.cardCode}>{capability.code}</span>
          )}
        </div>
        {importance?.id === 'critical' && (
          <span className={styles.criticalBadge}>Critical</span>
        )}
      </div>

      {capability.description && (
        <p className={styles.cardDescription}>{capability.description}</p>
      )}

      <div className={styles.cardMeta}>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Maturity</span>
          <div className={styles.maturityIndicator}>
            <span
              className={styles.maturityLevel}
              style={{ background: maturity?.color }}
            >
              L{capability.maturity_level || capability.maturity || 1}
            </span>
            <span className={styles.maturityLabel}>{maturity?.label}</span>
          </div>
        </div>

        {investment && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Investment</span>
            <span
              className={styles.investmentBadge}
              style={{ color: investment.color }}
            >
              {investment.label}
            </span>
          </div>
        )}

        {capability.owner && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Owner</span>
            <span className={styles.ownerName}>{capability.owner}</span>
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        {capability.supporting_applications > 0 && (
          <span className={styles.footerStat}>
            💻 {capability.supporting_applications} apps
          </span>
        )}
        {capability.linked_services > 0 && (
          <span className={styles.footerStat}>
            ⚙️ {capability.linked_services} services
          </span>
        )}
        {capability.gap_count > 0 && (
          <span className={`${styles.footerStat} ${styles.hasGaps}`}>
            ⚠️ {capability.gap_count} gaps
          </span>
        )}
      </div>
    </div>
  );
}
