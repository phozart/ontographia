/**
 * Risk Heatmap
 *
 * Visual risk matrix showing likelihood vs impact
 */

import { useMemo } from 'react';
import { useEnterprise } from '../EnterpriseContext';
import styles from './risk.module.css';

const LIKELIHOOD_LEVELS = ['certain', 'likely', 'possible', 'unlikely', 'rare'];
const IMPACT_LEVELS = ['negligible', 'minor', 'moderate', 'major', 'severe'];

export function RiskHeatmap() {
  const { artefacts, setSelectedArtefact, setActiveView } = useEnterprise();

  const risks = useMemo(() => {
    return artefacts.filter(a => a.type === 'risk' && a.status !== 'closed');
  }, [artefacts]);

  const matrix = useMemo(() => {
    const grid = {};

    LIKELIHOOD_LEVELS.forEach(l => {
      IMPACT_LEVELS.forEach(i => {
        grid[`${l}-${i}`] = [];
      });
    });

    risks.forEach(risk => {
      const key = `${risk.likelihood || 'possible'}-${risk.impact || 'moderate'}`;
      if (grid[key]) {
        grid[key].push(risk);
      }
    });

    return grid;
  }, [risks]);

  const getCellClass = (likelihood, impact) => {
    const likelihoodScore = { certain: 5, likely: 4, possible: 3, unlikely: 2, rare: 1 };
    const impactScore = { severe: 5, major: 4, moderate: 3, minor: 2, negligible: 1 };
    const score = likelihoodScore[likelihood] * impactScore[impact];

    if (score >= 16) return styles.cellCritical;
    if (score >= 10) return styles.cellHigh;
    if (score >= 5) return styles.cellMedium;
    return styles.cellLow;
  };

  const handleCellClick = (risks) => {
    if (risks.length === 1) {
      setSelectedArtefact(risks[0]);
      setActiveView('risk-detail');
    } else if (risks.length > 1) {
      // Could show a popup or filter the list
      setActiveView('risk-list');
    }
  };

  return (
    <div className={styles.heatmapContainer}>
      <h3 className={styles.heatmapTitle}>Risk Heatmap</h3>

      <div className={styles.heatmap}>
        {/* Y-axis label */}
        <div className={styles.yAxisLabel}>Likelihood</div>

        {/* Grid */}
        <div className={styles.grid}>
          {/* Header row */}
          <div className={styles.headerRow}>
            <div className={styles.cornerCell} />
            {IMPACT_LEVELS.map(impact => (
              <div key={impact} className={styles.headerCell}>
                {impact.charAt(0).toUpperCase() + impact.slice(1)}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {LIKELIHOOD_LEVELS.map(likelihood => (
            <div key={likelihood} className={styles.row}>
              <div className={styles.rowLabel}>
                {likelihood.charAt(0).toUpperCase() + likelihood.slice(1)}
              </div>
              {IMPACT_LEVELS.map(impact => {
                const cellRisks = matrix[`${likelihood}-${impact}`] || [];
                return (
                  <div
                    key={`${likelihood}-${impact}`}
                    className={`${styles.cell} ${getCellClass(likelihood, impact)}`}
                    onClick={() => handleCellClick(cellRisks)}
                  >
                    {cellRisks.length > 0 && (
                      <div className={styles.cellContent}>
                        <span className={styles.cellCount}>{cellRisks.length}</span>
                        {cellRisks.slice(0, 2).map(r => (
                          <span key={r.id} className={styles.cellDot} title={r.name} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* X-axis label */}
        <div className={styles.xAxisLabel}>Impact</div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.cellCritical}`} />
          <span>Critical (16-25)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.cellHigh}`} />
          <span>High (10-15)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.cellMedium}`} />
          <span>Medium (5-9)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.cellLow}`} />
          <span>Low (1-4)</span>
        </div>
      </div>
    </div>
  );
}
