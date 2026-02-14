// components/ui/LifecycleBar.js
// Visual phase indicator showing an initiative's progress through the lifecycle.

import { useState, useEffect, useCallback } from 'react';
import { PHASES, PHASE_MAP, TIERS } from '../../lib/lifecycle/phases';
import styles from './LifecycleBar.module.css';

/**
 * LifecycleBar — horizontal stepper showing initiative lifecycle phases.
 *
 * @param {string} artefactId - The artefact ID to track
 * @param {boolean} [compact=false] - Compact mode (just dots, no labels)
 * @param {Function} [onAdvance] - Called when user advances to next phase
 */
export default function LifecycleBar({ artefactId, compact = false, onAdvance }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artefactId) return;
    setLoading(true);
    fetch(`/api/lifecycle/${encodeURIComponent(artefactId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [artefactId]);

  const handleAdvance = useCallback(() => {
    if (!artefactId || !data?.nextPhase) return;
    fetch(`/api/lifecycle/${encodeURIComponent(artefactId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'advance' }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(updated => {
        if (updated) {
          setData(updated);
          if (onAdvance) onAdvance(updated);
        }
      })
      .catch(console.error);
  }, [artefactId, data, onAdvance]);

  if (!artefactId || loading || !data) return null;

  const tier = TIERS[data.initiative_tier] || TIERS.moderate;
  const requiredPhases = tier.requiredPhases;
  const currentPhaseId = data.current_phase;
  const currentIdx = requiredPhases.indexOf(currentPhaseId);

  return (
    <div className={`${styles.bar} ${compact ? styles.compact : ''}`}>
      {/* Tier label */}
      <span className={styles.tierLabel}>{tier.label}</span>

      {/* Phase steps */}
      <div className={styles.steps}>
        {requiredPhases.map((phaseId, idx) => {
          const phase = PHASE_MAP[phaseId];
          if (!phase) return null;

          const isCurrent = phaseId === currentPhaseId;
          const isCompleted = idx < currentIdx;
          const isFuture = idx > currentIdx;

          return (
            <div key={phaseId} className={styles.stepWrapper}>
              {idx > 0 && (
                <div className={`${styles.connector} ${isCompleted ? styles.completedConnector : ''}`} />
              )}
              <div
                className={`${styles.step} ${isCurrent ? styles.current : ''} ${isCompleted ? styles.completed : ''} ${isFuture ? styles.future : ''}`}
                title={`${phase.label}: ${phase.description}`}
              >
                <div
                  className={styles.stepDot}
                  style={{ background: isCurrent ? phase.color : isCompleted ? '#5B8A6A' : '#E2E0DB' }}
                />
                {!compact && (
                  <span className={styles.stepLabel}>
                    {phase.shortLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance button */}
      {data.nextPhase && (
        <button className={styles.advanceButton} onClick={handleAdvance} title={`Advance to ${data.nextPhase.label}`}>
          Next &rarr;
        </button>
      )}
    </div>
  );
}
