// components/spaces/blueprint/governance/StageGatesView.js
// Full view for stage gate reviews

import { useState, useMemo } from 'react';
import { useBlueprint, BPS_STAGE_INFO, BPS_GATE_CRITERIA } from '../BlueprintContext';
import GateDecision from './GateDecision';

// MUI Icons
import GppGoodIcon from '@mui/icons-material/GppGood';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function StageGatesView({ onSelectInitiative }) {
  const { initiatives } = useBlueprint();
  const [selectedForReview, setSelectedForReview] = useState(null);

  // Get initiatives ready for gate review (active ones with criteria met)
  const readyForReview = useMemo(() => {
    return initiatives.filter(init => {
      const stage = init.status;
      // Skip final stages
      if (['approved', 'declined'].includes(stage)) return false;
      return true;
    });
  }, [initiatives]);

  // Group by stage
  const byStage = useMemo(() => {
    const grouped = {};
    readyForReview.forEach(init => {
      const stage = init.status;
      if (!grouped[stage]) grouped[stage] = [];
      grouped[stage].push(init);
    });
    return grouped;
  }, [readyForReview]);

  // Get recent gate decisions
  const recentDecisions = useMemo(() => {
    const decisions = [];
    initiatives.forEach(init => {
      if (init.gateHistory && init.gateHistory.length > 0) {
        init.gateHistory.forEach(gate => {
          decisions.push({
            ...gate,
            initiative: init,
          });
        });
      }
    });
    return decisions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }, [initiatives]);

  const handleReviewComplete = () => {
    setSelectedForReview(null);
  };

  // If reviewing a specific initiative
  if (selectedForReview) {
    return (
      <div className="stage-gates-review">
        <GateDecision
          initiative={selectedForReview}
          onClose={() => setSelectedForReview(null)}
          onDecision={handleReviewComplete}
        />
      </div>
    );
  }

  return (
    <div className="stage-gates-view">
      <div className="stage-gates-header">
        <GppGoodIcon />
        <div>
          <h2>Stage Gates</h2>
          <p>Review and approve initiative stage transitions</p>
        </div>
      </div>

      {/* Stats summary */}
      <div className="stage-gates-summary">
        <div className="stage-gates-summary-stat">
          <span className="stage-gates-summary-value">{readyForReview.length}</span>
          <span className="stage-gates-summary-label">Pending Review</span>
        </div>
        <div className="stage-gates-summary-stat">
          <span className="stage-gates-summary-value">{recentDecisions.length}</span>
          <span className="stage-gates-summary-label">Recent Decisions</span>
        </div>
      </div>

      {/* Initiatives by Stage */}
      <div className="stage-gates-stages">
        <h3>Initiatives by Stage</h3>
        {Object.keys(byStage).length === 0 ? (
          <div className="stage-gates-empty">
            <CheckCircleIcon />
            <p>No initiatives pending review</p>
          </div>
        ) : (
          <div className="stage-gates-grid">
            {Object.entries(byStage).map(([stage, inits]) => {
              const stageInfo = BPS_STAGE_INFO[stage] || {};
              const nextStage = getNextStage(stage);
              const criteria = BPS_GATE_CRITERIA[stage] || [];

              return (
                <div key={stage} className="stage-gates-stage-card">
                  <div
                    className="stage-gates-stage-header"
                    style={{ borderLeftColor: stageInfo.color }}
                  >
                    <div className="stage-gates-stage-name">
                      <span>{stageInfo.name}</span>
                      {nextStage && (
                        <>
                          <ArrowForwardIcon fontSize="small" />
                          <span>{BPS_STAGE_INFO[nextStage]?.name}</span>
                        </>
                      )}
                    </div>
                    <span className="stage-gates-stage-count">{inits.length}</span>
                  </div>

                  {criteria.length > 0 && (
                    <div className="stage-gates-criteria-hint">
                      {criteria.length} gate {criteria.length === 1 ? 'criterion' : 'criteria'}
                    </div>
                  )}

                  <div className="stage-gates-initiatives">
                    {inits.map(init => (
                      <div
                        key={init.id}
                        className="stage-gates-initiative"
                        onClick={() => setSelectedForReview(init)}
                      >
                        <div className="stage-gates-initiative-info">
                          <span className="stage-gates-initiative-id">{init.display_id}</span>
                          <span className="stage-gates-initiative-name">{init.name}</span>
                        </div>
                        <button className="btn btn-small btn-secondary">
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Decisions */}
      {recentDecisions.length > 0 && (
        <div className="stage-gates-history">
          <h3>
            <HistoryIcon fontSize="small" />
            Recent Decisions
          </h3>
          <div className="stage-gates-history-list">
            {recentDecisions.map((decision, idx) => (
              <div key={idx} className="stage-gates-history-item">
                <div
                  className={`stage-gates-history-decision stage-gates-history-decision--${decision.decision}`}
                >
                  {decision.decision === 'approve' ? 'Approved' :
                   decision.decision === 'reject' ? 'Declined' : 'Deferred'}
                </div>
                <div className="stage-gates-history-info">
                  <span className="stage-gates-history-id">
                    {decision.initiative.display_id}
                  </span>
                  <span className="stage-gates-history-name">
                    {decision.initiative.name}
                  </span>
                </div>
                <div className="stage-gates-history-meta">
                  <span>{decision.decisionMaker}</span>
                  <span>{new Date(decision.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getNextStage(currentStage) {
  const stageOrder = ['idea', 'explore', 'assess', 'case', 'approved'];
  const currentIndex = stageOrder.indexOf(currentStage);
  return currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : null;
}
