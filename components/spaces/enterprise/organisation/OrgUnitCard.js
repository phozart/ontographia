/**
 * Organisation Unit Card
 *
 * Displays an organisational unit
 */

import { useEnterprise, ORG_UNIT_TYPE } from '../EnterpriseContext';
import styles from './organisation.module.css';

export function OrgUnitCard({ unit, compact = false }) {
  const { setSelectedArtefact, setActiveView, artefacts } = useEnterprise();

  const handleClick = () => {
    setSelectedArtefact(unit);
    setActiveView('org-unit-detail');
  };

  const childCount = artefacts.filter(a =>
    a.type === 'org-unit' && a.parentId === unit.id
  ).length;

  const roleCount = artefacts.filter(a =>
    a.type === 'role' && a.orgUnitId === unit.id
  ).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'division': return '🏢';
      case 'department': return '🏛️';
      case 'team': return '👥';
      case 'function': return '⚙️';
      case 'committee': return '🪑';
      default: return '📁';
    }
  };

  if (compact) {
    return (
      <div className={styles.compactCard} onClick={handleClick}>
        <span className={styles.typeIcon}>{getTypeIcon(unit.unitType)}</span>
        <span className={styles.compactName}>{unit.name}</span>
        {unit.headcount && (
          <span className={styles.headcount}>{unit.headcount}</span>
        )}
      </div>
    );
  }

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.cardHeader}>
        <span className={styles.typeIcon}>{getTypeIcon(unit.unitType)}</span>
        <span className={styles.unitType}>
          {ORG_UNIT_TYPE[unit.unitType] || unit.unitType}
        </span>
      </div>

      <h4 className={styles.cardTitle}>{unit.name}</h4>

      {unit.description && (
        <p className={styles.cardDescription}>
          {unit.description.length > 100
            ? `${unit.description.slice(0, 100)}...`
            : unit.description}
        </p>
      )}

      <div className={styles.cardMeta}>
        {unit.head && (
          <span className={styles.metaItem}>Head: {unit.head}</span>
        )}
        {unit.headcount && (
          <span className={styles.metaItem}>Headcount: {unit.headcount}</span>
        )}
      </div>

      <div className={styles.cardStats}>
        {childCount > 0 && (
          <span className={styles.statBadge}>{childCount} sub-units</span>
        )}
        {roleCount > 0 && (
          <span className={styles.statBadge}>{roleCount} roles</span>
        )}
      </div>

      {unit.capabilities && unit.capabilities.length > 0 && (
        <div className={styles.linkedCapabilities}>
          <span className={styles.linkedLabel}>Capabilities:</span>
          {unit.capabilities.slice(0, 3).map((cap, i) => (
            <span key={i} className={styles.linkedItem}>{cap}</span>
          ))}
          {unit.capabilities.length > 3 && (
            <span className={styles.linkedMore}>
              +{unit.capabilities.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
