// components/spaces/blueprint/governance/AtRiskView.js
// Full view showing all at-risk initiatives

import { useMemo } from 'react';
import { useBlueprint, BPS_STAGE_INFO, BPS_STAGE_SLAS } from '../BlueprintContext';

// MUI Icons
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FlagIcon from '@mui/icons-material/Flag';

export default function AtRiskView({ onSelectInitiative, onEditInitiative }) {
  const { initiatives, initiativesAtRisk } = useBlueprint();

  // Calculate detailed risk info for each at-risk initiative
  const riskDetails = useMemo(() => {
    return initiativesAtRisk.map(init => {
      const stage = init.status;
      const target = (BPS_STAGE_SLAS[stage]?.hours || 0) / 24;
      const stageEntry = init.stageHistory?.find(h => h.stage === stage);
      const enteredAt = stageEntry?.entered_at
        ? new Date(stageEntry.entered_at)
        : new Date(init.created_at);
      const daysInStage = (new Date() - enteredAt) / (1000 * 60 * 60 * 24);
      const daysOverdue = Math.max(0, daysInStage - target);
      const percentUsed = target > 0 ? (daysInStage / target) * 100 : 0;

      let riskLevel = 'warning';
      if (percentUsed >= 100) riskLevel = 'breached';
      else if (percentUsed >= 80) riskLevel = 'critical';

      // Check for kill criteria
      const hasKillCriteria = init.killCriteriaMet?.length > 0;

      return {
        ...init,
        riskLevel,
        daysInStage: Math.round(daysInStage * 10) / 10,
        daysOverdue: Math.round(daysOverdue * 10) / 10,
        target,
        percentUsed: Math.round(percentUsed),
        hasKillCriteria,
        enteredAt,
      };
    }).sort((a, b) => {
      // Sort by risk level, then by days overdue
      const levelOrder = { breached: 0, critical: 1, warning: 2 };
      if (levelOrder[a.riskLevel] !== levelOrder[b.riskLevel]) {
        return levelOrder[a.riskLevel] - levelOrder[b.riskLevel];
      }
      return b.daysOverdue - a.daysOverdue;
    });
  }, [initiativesAtRisk]);

  // Group by risk level
  const byRiskLevel = useMemo(() => {
    const grouped = { breached: [], critical: [], warning: [] };
    riskDetails.forEach(init => {
      grouped[init.riskLevel].push(init);
    });
    return grouped;
  }, [riskDetails]);

  // Summary counts
  const summary = useMemo(() => ({
    total: riskDetails.length,
    breached: byRiskLevel.breached.length,
    critical: byRiskLevel.critical.length,
    warning: byRiskLevel.warning.length,
    withKillCriteria: riskDetails.filter(i => i.hasKillCriteria).length,
  }), [riskDetails, byRiskLevel]);

  const getRiskIcon = (level) => {
    switch (level) {
      case 'breached': return ErrorIcon;
      case 'critical': return WarningIcon;
      default: return AccessTimeIcon;
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'breached': return '#A54D4D';
      case 'critical': return '#E67E22';
      default: return '#C9A227';
    }
  };

  return (
    <div className="at-risk-view">
      <div className="at-risk-header">
        <WarningIcon />
        <div>
          <h2>At Risk Initiatives</h2>
          <p>Initiatives requiring immediate attention due to SLA or kill criteria</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="at-risk-summary">
        <div className="at-risk-summary-card at-risk-summary-card--total">
          <TrendingDownIcon />
          <div className="at-risk-summary-content">
            <span className="at-risk-summary-value">{summary.total}</span>
            <span className="at-risk-summary-label">Total At Risk</span>
          </div>
        </div>
        <div className="at-risk-summary-card at-risk-summary-card--breached">
          <ErrorIcon />
          <div className="at-risk-summary-content">
            <span className="at-risk-summary-value">{summary.breached}</span>
            <span className="at-risk-summary-label">SLA Breached</span>
          </div>
        </div>
        <div className="at-risk-summary-card at-risk-summary-card--critical">
          <WarningIcon />
          <div className="at-risk-summary-content">
            <span className="at-risk-summary-value">{summary.critical}</span>
            <span className="at-risk-summary-label">Critical</span>
          </div>
        </div>
        <div className="at-risk-summary-card at-risk-summary-card--kill">
          <FlagIcon />
          <div className="at-risk-summary-content">
            <span className="at-risk-summary-value">{summary.withKillCriteria}</span>
            <span className="at-risk-summary-label">Kill Criteria Met</span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {riskDetails.length === 0 ? (
        <div className="at-risk-empty">
          <div className="at-risk-empty-icon">
            <WarningIcon />
          </div>
          <h3>No At-Risk Initiatives</h3>
          <p>All initiatives are currently within their SLA targets</p>
        </div>
      ) : (
        <>
          {/* Breached initiatives */}
          {byRiskLevel.breached.length > 0 && (
            <div className="at-risk-section at-risk-section--breached">
              <h3>
                <ErrorIcon style={{ color: getRiskColor('breached') }} />
                SLA Breached ({byRiskLevel.breached.length})
              </h3>
              <div className="at-risk-list">
                {byRiskLevel.breached.map(init => (
                  <RiskCard
                    key={init.id}
                    initiative={init}
                    onSelect={onSelectInitiative}
                    onEdit={onEditInitiative}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Critical initiatives */}
          {byRiskLevel.critical.length > 0 && (
            <div className="at-risk-section at-risk-section--critical">
              <h3>
                <WarningIcon style={{ color: getRiskColor('critical') }} />
                Critical ({byRiskLevel.critical.length})
              </h3>
              <div className="at-risk-list">
                {byRiskLevel.critical.map(init => (
                  <RiskCard
                    key={init.id}
                    initiative={init}
                    onSelect={onSelectInitiative}
                    onEdit={onEditInitiative}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Warning initiatives */}
          {byRiskLevel.warning.length > 0 && (
            <div className="at-risk-section at-risk-section--warning">
              <h3>
                <AccessTimeIcon style={{ color: getRiskColor('warning') }} />
                Warning ({byRiskLevel.warning.length})
              </h3>
              <div className="at-risk-list">
                {byRiskLevel.warning.map(init => (
                  <RiskCard
                    key={init.id}
                    initiative={init}
                    onSelect={onSelectInitiative}
                    onEdit={onEditInitiative}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RiskCard({ initiative, onSelect, onEdit }) {
  const stageInfo = BPS_STAGE_INFO[initiative.status] || {};

  return (
    <div
      className={`at-risk-card at-risk-card--${initiative.riskLevel}`}
      onClick={() => onSelect?.(initiative)}
    >
      <div className="at-risk-card-header">
        <span className="at-risk-card-id">{initiative.display_id}</span>
        <span
          className="at-risk-card-stage"
          style={{ backgroundColor: stageInfo.color }}
        >
          {stageInfo.name}
        </span>
      </div>

      <h4 className="at-risk-card-name">{initiative.name}</h4>

      <div className="at-risk-card-metrics">
        <div className="at-risk-card-metric">
          <span className="at-risk-card-metric-value">
            {initiative.daysInStage}
          </span>
          <span className="at-risk-card-metric-label">Days in Stage</span>
        </div>
        <div className="at-risk-card-metric">
          <span className="at-risk-card-metric-value">
            {initiative.target}
          </span>
          <span className="at-risk-card-metric-label">SLA Target</span>
        </div>
        <div className="at-risk-card-metric">
          <span
            className="at-risk-card-metric-value"
            style={{ color: initiative.daysOverdue > 0 ? '#A54D4D' : 'inherit' }}
          >
            {initiative.daysOverdue > 0 ? `+${initiative.daysOverdue}` : '0'}
          </span>
          <span className="at-risk-card-metric-label">Days Overdue</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="at-risk-card-progress">
        <div className="at-risk-card-progress-bar">
          <div
            className="at-risk-card-progress-fill"
            style={{
              width: `${Math.min(100, initiative.percentUsed)}%`,
              backgroundColor: initiative.percentUsed >= 100 ? '#A54D4D' :
                             initiative.percentUsed >= 80 ? '#E67E22' : '#C9A227',
            }}
          />
        </div>
        <span className="at-risk-card-progress-label">
          {initiative.percentUsed}% of SLA used
        </span>
      </div>

      {/* Kill criteria warning */}
      {initiative.hasKillCriteria && (
        <div className="at-risk-card-kill-warning">
          <FlagIcon fontSize="small" />
          <span>Kill criteria met</span>
        </div>
      )}

      <div className="at-risk-card-actions">
        <button
          className="btn btn-small btn-secondary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(initiative);
          }}
        >
          Take Action
        </button>
      </div>
    </div>
  );
}
