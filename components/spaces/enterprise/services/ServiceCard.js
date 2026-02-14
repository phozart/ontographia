/**
 * ServiceCard - Service display card
 *
 * @module components/spaces/enterprise/services/ServiceCard
 */

import { SERVICE_TYPE, SERVICE_STATUS, SERVICE_TIER } from '../EnterpriseContext';
import styles from './services.module.css';

export default function ServiceCard({ service, onClick, selected = false }) {
  const type = SERVICE_TYPE[service.service_type || 'internal'];
  const status = SERVICE_STATUS[service.status || 'active'];
  const tier = SERVICE_TIER[service.tier || 'standard'];

  return (
    <div
      className={`${styles.serviceCard} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      style={{ '--card-accent': type?.color }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <h4 className={styles.cardName}>{service.name}</h4>
          <span
            className={styles.statusBadge}
            style={{ background: `${status?.color}20`, color: status?.color }}
          >
            {status?.label}
          </span>
        </div>
        <span className={styles.typeBadge}>{type?.label}</span>
      </div>

      {service.description && (
        <p className={styles.cardDescription}>{service.description}</p>
      )}

      <div className={styles.cardMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Tier</span>
          <span
            className={styles.tierBadge}
            style={{ color: tier?.color }}
          >
            {tier?.label}
          </span>
        </div>

        {service.owner && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Owner</span>
            <span className={styles.metaValue}>{service.owner}</span>
          </div>
        )}

        {service.sla && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>SLA</span>
            <span className={styles.metaValue}>{service.sla}</span>
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        {service.consumer_count > 0 && (
          <span className={styles.footerStat}>
            👥 {service.consumer_count} consumers
          </span>
        )}
        {service.capability_count > 0 && (
          <span className={styles.footerStat}>
            🎯 {service.capability_count} capabilities
          </span>
        )}
      </div>
    </div>
  );
}
