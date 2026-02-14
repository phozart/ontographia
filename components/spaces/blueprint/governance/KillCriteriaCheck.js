// components/spaces/blueprint/governance/KillCriteriaCheck.js
// Kill criteria checking UI — must-meet / should-meet two-tier model

import { useMemo, useCallback } from 'react';
import { useBlueprint, BPS_KILL_CRITERIA } from '../BlueprintContext';
import { evaluateKillCriteria } from '../../../../lib/blueprint-types';

// MUI Icons
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import GppBadIcon from '@mui/icons-material/GppBad';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function KillCriteriaCheck({
  initiative,
  onNavigate,
  onSelectInitiative,
  showAll = false,
}) {
  const { initiatives, initiativesWithKillCriteria, declineInitiative } = useBlueprint();

  // Evaluate kill criteria for single initiative using the two-tier model
  const evaluation = useMemo(() => {
    if (!initiative) return null;
    return evaluateKillCriteria(initiative);
  }, [initiative]);

  // Build per-criterion pass/fail status for display
  const mustMeetStatus = useMemo(() => {
    if (!initiative) return [];
    const failIds = new Set((evaluation?.mustMeetFails || []).map(f => f.id));
    return BPS_KILL_CRITERIA.must_meet.map(criterion => ({
      ...criterion,
      failed: failIds.has(criterion.id),
    }));
  }, [initiative, evaluation]);

  const shouldMeetStatus = useMemo(() => {
    if (!initiative) return [];
    const warnIds = new Set((evaluation?.shouldMeetWarns || []).map(w => w.id));
    return BPS_KILL_CRITERIA.should_meet.map(criterion => ({
      ...criterion,
      warned: warnIds.has(criterion.id),
    }));
  }, [initiative, evaluation]);

  const handleDecline = useCallback(async () => {
    if (!initiative || !evaluation) return;
    const reasons = evaluation.mustMeetFails.map(f => f.message).join('; ');
    await declineInitiative(initiative.id, `Kill criteria triggered: ${reasons}`);
  }, [initiative, evaluation, declineInitiative]);

  const handleOverride = useCallback(() => {
    onNavigate?.('assess');
  }, [onNavigate]);

  // ============================================================================
  // SINGLE INITIATIVE VIEW
  // ============================================================================

  if (initiative && evaluation) {
    const { mustMeetFails, shouldMeetWarns, recommendation } = evaluation;

    return (
      <div className="kill-criteria-check">
        {/* Header with recommendation */}
        <div className="kill-criteria-header">
          {recommendation === 'kill' ? (
            <GppBadIcon className="kill-criteria-icon kill-criteria-icon--danger" />
          ) : recommendation === 'review' ? (
            <WarningAmberIcon className="kill-criteria-icon kill-criteria-icon--warning" />
          ) : (
            <CheckCircleIcon className="kill-criteria-icon kill-criteria-icon--success" />
          )}
          <div>
            <h3>Kill Criteria Check</h3>
            <p>
              {recommendation === 'kill'
                ? `Kill Recommended \u2014 ${mustMeetFails.length} must-meet criteria failed`
                : recommendation === 'review'
                  ? 'Review Needed \u2014 multiple warning flags'
                  : 'All criteria clear'}
            </p>
          </div>
        </div>

        {/* Must-Meet Criteria Section */}
        <div className={`kill-criteria-section ${mustMeetFails.length > 0 ? 'kill-criteria-section--danger' : ''}`}>
          <h4 className="kill-criteria-section-title">Must-Meet Criteria</h4>
          <div className="kill-criteria-list">
            {mustMeetStatus.map(criterion => (
              <div
                key={criterion.id}
                className={`kill-criteria-item ${criterion.failed ? 'kill-criteria-item--triggered' : ''}`}
              >
                <div className="kill-criteria-item-status">
                  {criterion.failed ? (
                    <WarningAmberIcon className="text-danger" />
                  ) : (
                    <CheckCircleIcon className="text-success" />
                  )}
                </div>
                <div className="kill-criteria-item-content">
                  <span className="kill-criteria-item-name">{criterion.name}</span>
                  <span className="kill-criteria-item-description">
                    {criterion.failed ? criterion.failMessage : criterion.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Should-Meet Criteria Section */}
        <div className={`kill-criteria-section ${shouldMeetWarns.length > 0 ? 'kill-criteria-section--warning' : ''}`}>
          <h4 className="kill-criteria-section-title">Should-Meet Criteria</h4>
          <div className="kill-criteria-list">
            {shouldMeetStatus.map(criterion => (
              <div
                key={criterion.id}
                className={`kill-criteria-item ${criterion.warned ? 'kill-criteria-item--warned' : ''}`}
              >
                <div className="kill-criteria-item-status">
                  {criterion.warned ? (
                    <WarningAmberIcon className="text-warning" />
                  ) : (
                    <CheckCircleIcon className="text-success" />
                  )}
                </div>
                <div className="kill-criteria-item-content">
                  <span className="kill-criteria-item-name">{criterion.name}</span>
                  <span className="kill-criteria-item-description">
                    {criterion.warned ? criterion.warnMessage : criterion.description}
                  </span>
                </div>
                {criterion.warned && (
                  <span className={`kill-criteria-severity-badge kill-criteria-severity-badge--${criterion.severity}`}>
                    {criterion.severity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action area for kill recommendation */}
        {recommendation === 'kill' && (
          <div className="kill-criteria-action">
            <div className="kill-criteria-action-warning">
              <WarningAmberIcon />
              <p>
                Kill Recommended: {mustMeetFails.length} must-meet
                {mustMeetFails.length === 1 ? ' criterion has' : ' criteria have'} failed.
                This initiative does not meet minimum viability requirements.
              </p>
            </div>
            <div className="kill-criteria-action-buttons">
              <button className="btn btn-secondary" onClick={handleOverride}>
                Override and Continue
              </button>
              <button className="btn btn-danger" onClick={handleDecline}>
                Decline Initiative
              </button>
            </div>
          </div>
        )}

        {/* Action area for review recommendation */}
        {recommendation === 'review' && (
          <div className="kill-criteria-action">
            <div className="kill-criteria-action-warning kill-criteria-action-warning--review">
              <WarningAmberIcon />
              <p>
                Multiple warning flags raised. Review these concerns before advancing.
              </p>
            </div>
            <div className="kill-criteria-action-buttons">
              <button className="btn btn-secondary" onClick={() => onNavigate?.('assess')}>
                Review Assessment
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // DASHBOARD VIEW (showAll)
  // ============================================================================

  if (showAll) {
    return (
      <div className="kill-criteria-dashboard">
        <div className="kill-criteria-dashboard-header">
          <GppBadIcon />
          <div>
            <h2>Kill Criteria Monitor</h2>
            <p>Initiatives that have triggered automatic kill criteria</p>
          </div>
        </div>

        {initiativesWithKillCriteria.length === 0 ? (
          <div className="kill-criteria-empty">
            <CheckCircleIcon className="text-success" />
            <h3>No Kill Criteria Triggered</h3>
            <p>All active initiatives are within acceptable thresholds</p>
          </div>
        ) : (
          <div className="kill-criteria-initiatives">
            {initiativesWithKillCriteria.map(init => {
              const initEval = evaluateKillCriteria(init);
              const totalIssues = initEval.mustMeetFails.length + initEval.shouldMeetWarns.length;

              return (
                <div
                  key={init.id}
                  className="kill-criteria-initiative-card"
                  onClick={() => onSelectInitiative?.(init)}
                >
                  <div className="kill-criteria-initiative-header">
                    <span className="kill-criteria-initiative-id">{init.display_id}</span>
                    <span className="kill-criteria-initiative-name">{init.name}</span>
                    <span className={`kill-criteria-initiative-badge ${initEval.recommendation === 'kill' ? 'kill-criteria-initiative-badge--kill' : ''}`}>
                      {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'}
                    </span>
                  </div>
                  <div className="kill-criteria-initiative-details">
                    {initEval.mustMeetFails.slice(0, 2).map(fail => (
                      <span key={fail.id} className="kill-criteria-tag kill-criteria-tag--danger">
                        <WarningAmberIcon fontSize="small" />
                        {fail.name}
                      </span>
                    ))}
                    {initEval.shouldMeetWarns.slice(0, 2).map(warn => (
                      <span key={warn.id} className="kill-criteria-tag kill-criteria-tag--warning">
                        <WarningAmberIcon fontSize="small" />
                        {warn.name}
                      </span>
                    ))}
                    {totalIssues > 4 && (
                      <span className="kill-criteria-more">
                        +{totalIssues - 4} more
                      </span>
                    )}
                  </div>
                  <ArrowForwardIcon className="kill-criteria-initiative-arrow" />
                </div>
              );
            })}
          </div>
        )}

        {/* Criteria Reference — two groups */}
        <div className="kill-criteria-reference">
          <h3>
            <InfoIcon fontSize="small" />
            Kill Criteria Reference
          </h3>

          <h4 className="kill-criteria-reference-group-title">Must-Meet (Knockout)</h4>
          <div className="kill-criteria-reference-list">
            {BPS_KILL_CRITERIA.must_meet.map(criterion => (
              <div key={criterion.id} className="kill-criteria-reference-item">
                <span className="kill-criteria-reference-name">{criterion.name}</span>
                <span className="kill-criteria-reference-description">{criterion.description}</span>
              </div>
            ))}
          </div>

          <h4 className="kill-criteria-reference-group-title">Should-Meet (Warning)</h4>
          <div className="kill-criteria-reference-list">
            {BPS_KILL_CRITERIA.should_meet.map(criterion => (
              <div key={criterion.id} className="kill-criteria-reference-item">
                <span className="kill-criteria-reference-name">{criterion.name}</span>
                <span className="kill-criteria-reference-description">{criterion.description}</span>
                <span className={`kill-criteria-severity-badge kill-criteria-severity-badge--${criterion.severity}`}>
                  {criterion.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
