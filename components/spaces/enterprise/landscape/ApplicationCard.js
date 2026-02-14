/**
 * ApplicationCard - Application display card
 *
 * @module components/spaces/enterprise/landscape/ApplicationCard
 */

import { APPLICATION_TYPE, APPLICATION_STATUS, APPLICATION_TIER } from '../EnterpriseContext';
import styles from './landscape.module.css';

export default function ApplicationCard({ application, onClick, selected = false }) {
  const type = APPLICATION_TYPE[application.application_type || 'custom'];
  const status = APPLICATION_STATUS[application.status || 'production'];
  const tier = APPLICATION_TIER[application.tier || 'operational'];

  const techDebtScore = application.technical_debt_score || 0;
  const hasHighDebt = techDebtScore > 50;

  return (
    <div
      className={`${styles.appCard} ${selected ? styles.selected : ''} ${hasHighDebt ? styles.hasDebt : ''}`}
      onClick={onClick}
      style={{ '--card-accent': tier?.color }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <h4 className={styles.cardName}>{application.name}</h4>
          {hasHighDebt && (
            <span className={styles.debtWarning} title={`Tech Debt: ${techDebtScore}%`}>
              ⚠️
            </span>
          )}
        </div>
        <span
          className={styles.statusBadge}
          style={{ background: `${status?.color}20`, color: status?.color }}
        >
          {status?.label}
        </span>
      </div>

      <div className={styles.cardBadges}>
        <span className={styles.typeBadge}>{type?.label}</span>
        <span
          className={styles.tierBadge}
          style={{ background: `${tier?.color}20`, color: tier?.color }}
        >
          {tier?.label}
        </span>
      </div>

      {application.description && (
        <p className={styles.cardDescription}>{application.description}</p>
      )}

      <div className={styles.cardMeta}>
        {application.vendor && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Vendor</span>
            <span className={styles.metaValue}>{application.vendor}</span>
          </div>
        )}

        {application.owner && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Owner</span>
            <span className={styles.metaValue}>{application.owner}</span>
          </div>
        )}

        {application.version && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Version</span>
            <span className={styles.metaValue}>{application.version}</span>
          </div>
        )}
      </div>

      {techDebtScore > 0 && (
        <div className={styles.debtMeter}>
          <span className={styles.debtLabel}>Tech Debt</span>
          <div className={styles.debtBar}>
            <div
              className={styles.debtFill}
              style={{
                width: `${techDebtScore}%`,
                background: techDebtScore > 70 ? '#A54D4D' : techDebtScore > 50 ? '#C9A227' : '#5B8A6A',
              }}
            />
          </div>
          <span className={styles.debtValue}>{techDebtScore}%</span>
        </div>
      )}

      <div className={styles.cardFooter}>
        {application.integration_count > 0 && (
          <span className={styles.footerStat}>
            🔗 {application.integration_count} integrations
          </span>
        )}
        {application.capability_count > 0 && (
          <span className={styles.footerStat}>
            🎯 {application.capability_count} capabilities
          </span>
        )}
      </div>
    </div>
  );
}
