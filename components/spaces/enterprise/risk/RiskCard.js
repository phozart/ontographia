/**
 * Risk Card
 *
 * Displays an enterprise risk with severity indicator
 */

import { useEnterprise, RISK_CATEGORY } from '../EnterpriseContext';
import styles from './risk.module.css';

export function RiskCard({ risk }) {
  const { setSelectedArtefact, setActiveView } = useEnterprise();

  const handleClick = () => {
    setSelectedArtefact(risk);
    setActiveView('risk-detail');
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical': return styles.severityCritical;
      case 'high': return styles.severityHigh;
      case 'medium': return styles.severityMedium;
      case 'low': return styles.severityLow;
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return styles.statusOpen;
      case 'mitigated': return styles.statusMitigated;
      case 'accepted': return styles.statusAccepted;
      case 'closed': return styles.statusClosed;
      default: return '';
    }
  };

  const getRiskScore = (likelihood, impact) => {
    const likelihoodScore = { rare: 1, unlikely: 2, possible: 3, likely: 4, certain: 5 };
    const impactScore = { negligible: 1, minor: 2, moderate: 3, major: 4, severe: 5 };
    return (likelihoodScore[likelihood] || 3) * (impactScore[impact] || 3);
  };

  const score = getRiskScore(risk.likelihood, risk.impact);

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.cardLeft}>
        <div className={`${styles.severityBadge} ${getSeverityClass(risk.severity)}`}>
          {risk.severity?.toUpperCase() || 'UNKNOWN'}
        </div>
        <div className={styles.riskScore}>
          <span className={styles.scoreValue}>{score}</span>
          <span className={styles.scoreLabel}>Score</span>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h4 className={styles.cardTitle}>{risk.name}</h4>
          <span className={`${styles.status} ${getStatusClass(risk.status)}`}>
            {risk.status || 'open'}
          </span>
        </div>

        {risk.description && (
          <p className={styles.cardDescription}>
            {risk.description.length > 150
              ? `${risk.description.slice(0, 150)}...`
              : risk.description}
          </p>
        )}

        <div className={styles.cardMeta}>
          <span className={styles.metaItem}>
            {RISK_CATEGORY[risk.category] || risk.category}
          </span>
          {risk.owner && (
            <span className={styles.metaItem}>Owner: {risk.owner}</span>
          )}
          {risk.likelihood && (
            <span className={styles.metaItem}>
              Likelihood: {risk.likelihood}
            </span>
          )}
          {risk.impact && (
            <span className={styles.metaItem}>
              Impact: {risk.impact}
            </span>
          )}
        </div>

        {risk.mitigationPlan && (
          <div className={styles.mitigation}>
            <span className={styles.mitigationLabel}>Mitigation:</span>
            <span className={styles.mitigationText}>
              {risk.mitigationPlan.length > 100
                ? `${risk.mitigationPlan.slice(0, 100)}...`
                : risk.mitigationPlan}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
