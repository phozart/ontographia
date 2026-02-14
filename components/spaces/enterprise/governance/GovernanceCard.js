/**
 * Governance Card
 *
 * Displays a policy, principle, standard, or ADR
 */

import { useEnterprise, GOVERNANCE_TYPE } from '../EnterpriseContext';
import styles from './governance.module.css';

export function GovernanceCard({ item }) {
  const { setSelectedArtefact, setActiveView } = useEnterprise();

  const handleClick = () => {
    setSelectedArtefact(item);
    setActiveView('governance-detail');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'draft': return styles.statusDraft;
      case 'deprecated': return styles.statusDeprecated;
      case 'superseded': return styles.statusSuperseded;
      default: return '';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'policy': return '📜';
      case 'principle': return '🎯';
      case 'standard': return '📏';
      case 'adr': return '📋';
      default: return '📄';
    }
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.cardHeader}>
        <span className={styles.typeIcon}>{getTypeIcon(item.type)}</span>
        <span className={`${styles.status} ${getStatusClass(item.status)}`}>
          {item.status || 'draft'}
        </span>
      </div>

      <h4 className={styles.cardTitle}>{item.name}</h4>

      {item.description && (
        <p className={styles.cardDescription}>
          {item.description.length > 120
            ? `${item.description.slice(0, 120)}...`
            : item.description}
        </p>
      )}

      <div className={styles.cardMeta}>
        <span className={styles.metaItem}>
          {GOVERNANCE_TYPE[item.type] || item.type}
        </span>
        {item.owner && (
          <span className={styles.metaItem}>
            Owner: {item.owner}
          </span>
        )}
        {item.effectiveDate && (
          <span className={styles.metaItem}>
            Effective: {new Date(item.effectiveDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className={styles.tags}>
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
          {item.tags.length > 3 && (
            <span className={styles.tagMore}>+{item.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
