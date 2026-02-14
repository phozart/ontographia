// components/spaces/blueprint/views/FunnelHealth.js
// Funnel health metrics and conversion rates dashboard

import { useMemo } from 'react';
import { useBlueprint, BPS_STAGE_INFO, BPS_STAGE_SLAS } from '../BlueprintContext';

// MUI Icons
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';

export default function FunnelHealth({ onNavigate, onSelectInitiative }) {
  const {
    initiatives,
    funnelMetrics,
    stageCounts,
    initiativesAtRisk,
    initiativesWithKillCriteria,
  } = useBlueprint();

  // Calculate stage-by-stage metrics
  const stageMetrics = useMemo(() => {
    const stages = ['idea', 'explore', 'assess', 'case', 'approved'];
    const metrics = {};

    stages.forEach((stage, index) => {
      const stageInitiatives = initiatives.filter(i => i.status === stage);
      const count = stageInitiatives.length;

      // Calculate average time in stage
      const avgTime = stageInitiatives.reduce((sum, i) => {
        const stageHistory = i.stageHistory?.find(h => h.stage === stage);
        if (stageHistory?.entered_at) {
          const entered = new Date(stageHistory.entered_at);
          const exited = stageHistory.exited_at ? new Date(stageHistory.exited_at) : new Date();
          return sum + (exited - entered) / (1000 * 60 * 60 * 24);
        }
        return sum;
      }, 0) / Math.max(1, count);

      // SLA compliance
      const slaTarget = (BPS_STAGE_SLAS[stage]?.hours || 0) / 24;
      const atRisk = stageInitiatives.filter(i => {
        const stageHistory = i.stageHistory?.find(h => h.stage === stage);
        if (stageHistory?.entered_at) {
          const daysInStage = (new Date() - new Date(stageHistory.entered_at)) / (1000 * 60 * 60 * 24);
          return daysInStage > slaTarget * 0.8;
        }
        return false;
      }).length;

      // Conversion rate (from this stage to next)
      let conversionRate = null;
      if (index < stages.length - 1) {
        const nextStage = stages[index + 1];
        const movedToNext = initiatives.filter(i =>
          i.stageHistory?.some(h => h.stage === nextStage) &&
          i.stageHistory?.some(h => h.stage === stage)
        ).length;
        const totalInOrPassed = initiatives.filter(i =>
          i.status === stage || i.stageHistory?.some(h => h.stage === stage)
        ).length;
        conversionRate = totalInOrPassed > 0 ? Math.round((movedToNext / totalInOrPassed) * 100) : null;
      }

      metrics[stage] = {
        count,
        avgTime: Math.round(avgTime * 10) / 10,
        slaTarget,
        atRisk,
        conversionRate,
        slaHealth: avgTime <= slaTarget ? 'healthy' : avgTime <= slaTarget * 1.5 ? 'warning' : 'critical',
      };
    });

    return metrics;
  }, [initiatives]);

  // Overall funnel health score
  const healthScore = useMemo(() => {
    const stages = ['idea', 'explore', 'assess', 'case'];
    let score = 100;

    // Penalize for at-risk initiatives
    score -= initiativesAtRisk.length * 5;

    // Penalize for kill criteria
    score -= initiativesWithKillCriteria.length * 10;

    // Penalize for SLA breaches
    stages.forEach(stage => {
      const metrics = stageMetrics[stage];
      if (metrics.slaHealth === 'warning') score -= 5;
      if (metrics.slaHealth === 'critical') score -= 10;
    });

    // Reward good conversion rates
    stages.forEach(stage => {
      const metrics = stageMetrics[stage];
      if (metrics.conversionRate && metrics.conversionRate > 50) score += 2;
    });

    return Math.max(0, Math.min(100, score));
  }, [stageMetrics, initiativesAtRisk, initiativesWithKillCriteria]);

  const getHealthColor = (score) => {
    if (score >= 80) return '#5B8A6A';
    if (score >= 60) return '#C9A227';
    return '#A54D4D';
  };

  const getHealthLabel = (score) => {
    if (score >= 80) return 'Healthy';
    if (score >= 60) return 'Needs Attention';
    return 'Critical';
  };

  return (
    <div className="funnel-health-view">
      <div className="funnel-health-header">
        <div className="funnel-health-header-left">
          <MonitorHeartIcon className="funnel-health-icon" />
          <div>
            <h1>Funnel Health</h1>
            <p>Monitor pipeline performance and conversion metrics</p>
          </div>
        </div>
      </div>

      {/* Health Score Hero */}
      <div className="funnel-health-hero">
        <div
          className="funnel-health-score-ring"
          style={{ borderColor: getHealthColor(healthScore) }}
        >
          <span className="funnel-health-score-value">{healthScore}</span>
          <span className="funnel-health-score-label">Health Score</span>
        </div>
        <div className="funnel-health-hero-details">
          <div
            className="funnel-health-status"
            style={{ color: getHealthColor(healthScore) }}
          >
            {healthScore >= 80 ? (
              <CheckCircleIcon fontSize="small" />
            ) : (
              <WarningIcon fontSize="small" />
            )}
            {getHealthLabel(healthScore)}
          </div>
          <div className="funnel-health-hero-stats">
            <div className="funnel-health-hero-stat">
              <span className="stat-value">{funnelMetrics.total}</span>
              <span className="stat-label">Total Initiatives</span>
            </div>
            <div className="funnel-health-hero-stat">
              <span className="stat-value">{funnelMetrics.active}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="funnel-health-hero-stat funnel-health-hero-stat--warning">
              <span className="stat-value">{initiativesAtRisk.length}</span>
              <span className="stat-label">At Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Metrics */}
      <div className="funnel-health-stages">
        <h2>Stage Performance</h2>
        <div className="funnel-health-stages-grid">
          {Object.entries(stageMetrics).map(([stage, metrics]) => (
            <div key={stage} className="funnel-health-stage-card">
              <div
                className="funnel-health-stage-header"
                style={{ borderLeftColor: BPS_STAGE_INFO[stage]?.color }}
              >
                <span className="funnel-health-stage-name">{BPS_STAGE_INFO[stage]?.name}</span>
                <span className="funnel-health-stage-count">{metrics.count}</span>
              </div>

              <div className="funnel-health-stage-metrics">
                {/* Average Time */}
                <div className="funnel-health-metric">
                  <AccessTimeIcon fontSize="small" />
                  <div className="funnel-health-metric-content">
                    <span className="funnel-health-metric-label">Avg. Time</span>
                    <span
                      className="funnel-health-metric-value"
                      style={{
                        color: metrics.slaHealth === 'healthy' ? '#5B8A6A' :
                               metrics.slaHealth === 'warning' ? '#C9A227' : '#A54D4D'
                      }}
                    >
                      {metrics.avgTime} days
                    </span>
                  </div>
                  <span className="funnel-health-metric-target">
                    Target: {metrics.slaTarget} days
                  </span>
                </div>

                {/* SLA Status */}
                <div className="funnel-health-metric">
                  <SpeedIcon fontSize="small" />
                  <div className="funnel-health-metric-content">
                    <span className="funnel-health-metric-label">SLA Status</span>
                    <span
                      className={`funnel-health-metric-value funnel-health-sla-${metrics.slaHealth}`}
                    >
                      {metrics.slaHealth.charAt(0).toUpperCase() + metrics.slaHealth.slice(1)}
                    </span>
                  </div>
                  {metrics.atRisk > 0 && (
                    <span className="funnel-health-metric-warning">
                      {metrics.atRisk} at risk
                    </span>
                  )}
                </div>

                {/* Conversion Rate */}
                {metrics.conversionRate !== null && (
                  <div className="funnel-health-metric">
                    {metrics.conversionRate >= 50 ? (
                      <TrendingUpIcon fontSize="small" className="text-success" />
                    ) : (
                      <TrendingDownIcon fontSize="small" className="text-danger" />
                    )}
                    <div className="funnel-health-metric-content">
                      <span className="funnel-health-metric-label">Conversion</span>
                      <span className="funnel-health-metric-value">
                        {metrics.conversionRate}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="btn btn-sm btn-secondary funnel-health-stage-action"
                onClick={() => onNavigate?.(stage)}
              >
                View Stage
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="funnel-health-conversion">
        <h2>Conversion Funnel</h2>
        <div className="funnel-health-conversion-visual">
          {['idea', 'explore', 'assess', 'case', 'approved'].map((stage, index, arr) => {
            const metrics = stageMetrics[stage];
            const width = 100 - (index * 15);
            return (
              <div key={stage} className="funnel-health-conversion-stage">
                <div
                  className="funnel-health-conversion-bar"
                  style={{
                    width: `${width}%`,
                    backgroundColor: BPS_STAGE_INFO[stage]?.color,
                  }}
                >
                  <span className="funnel-health-conversion-bar-label">
                    {BPS_STAGE_INFO[stage]?.name}
                  </span>
                  <span className="funnel-health-conversion-bar-count">
                    {metrics.count}
                  </span>
                </div>
                {index < arr.length - 1 && metrics.conversionRate !== null && (
                  <div className="funnel-health-conversion-rate">
                    <span>{metrics.conversionRate}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts & Actions */}
      <div className="funnel-health-alerts">
        <h2>Alerts & Actions</h2>
        <div className="funnel-health-alerts-grid">
          {/* At-Risk Initiatives */}
          {initiativesAtRisk.length > 0 && (
            <div className="funnel-health-alert funnel-health-alert--warning">
              <div className="funnel-health-alert-header">
                <AccessTimeIcon />
                <h4>SLA At Risk ({initiativesAtRisk.length})</h4>
              </div>
              <div className="funnel-health-alert-list">
                {initiativesAtRisk.slice(0, 3).map(initiative => (
                  <div
                    key={initiative.id}
                    className="funnel-health-alert-item"
                    onClick={() => onSelectInitiative?.(initiative)}
                  >
                    <span className="funnel-health-alert-id">{initiative.display_id}</span>
                    <span className="funnel-health-alert-name">{initiative.name}</span>
                  </div>
                ))}
                {initiativesAtRisk.length > 3 && (
                  <button className="funnel-health-alert-more">
                    View all {initiativesAtRisk.length}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Kill Criteria */}
          {initiativesWithKillCriteria.length > 0 && (
            <div className="funnel-health-alert funnel-health-alert--danger">
              <div className="funnel-health-alert-header">
                <WarningIcon />
                <h4>Kill Criteria Met ({initiativesWithKillCriteria.length})</h4>
              </div>
              <div className="funnel-health-alert-list">
                {initiativesWithKillCriteria.slice(0, 3).map(initiative => (
                  <div
                    key={initiative.id}
                    className="funnel-health-alert-item"
                    onClick={() => onSelectInitiative?.(initiative)}
                  >
                    <span className="funnel-health-alert-id">{initiative.display_id}</span>
                    <span className="funnel-health-alert-name">{initiative.name}</span>
                    <span className="funnel-health-alert-badge">
                      {initiative.killCriteria?.length} criteria
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Clear */}
          {initiativesAtRisk.length === 0 && initiativesWithKillCriteria.length === 0 && (
            <div className="funnel-health-alert funnel-health-alert--success">
              <div className="funnel-health-alert-header">
                <CheckCircleIcon />
                <h4>All Clear</h4>
              </div>
              <p>No initiatives require immediate attention</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="funnel-health-recommendations">
        <h2>Recommendations</h2>
        <div className="funnel-health-recommendations-list">
          {stageMetrics.idea?.count > 10 && (
            <div className="funnel-health-recommendation">
              <TrendingUpIcon className="text-info" />
              <div>
                <h4>High Idea Backlog</h4>
                <p>Consider scheduling a triage session to move ideas through exploration.</p>
              </div>
            </div>
          )}
          {stageMetrics.assess?.conversionRate < 30 && (
            <div className="funnel-health-recommendation">
              <WarningIcon className="text-warning" />
              <div>
                <h4>Low Assessment Conversion</h4>
                <p>Review assessment criteria - many initiatives may be dropping off.</p>
              </div>
            </div>
          )}
          {healthScore >= 80 && (
            <div className="funnel-health-recommendation">
              <CheckCircleIcon className="text-success" />
              <div>
                <h4>Pipeline Healthy</h4>
                <p>Continue current practices. Consider increasing idea intake capacity.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
