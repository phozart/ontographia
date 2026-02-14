// components/spaces/blueprint/governance/SLATracker.js
// SLA monitoring and tracking — 4-tier escalation model
// Tiers: on_track → at_risk → breached → breached_2x (critical)

import { useMemo } from 'react';
import {
  useBlueprint,
  BPS_STAGE_INFO,
  BPS_STAGE_SLAS,
  BPS_SLA_ESCALATION,
  calculateDetailedSLA,
} from '../BlueprintContext';

// MUI Icons
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FlagIcon from '@mui/icons-material/Flag';

// Escalation action display config
const ESCALATION_ACTIONS = {
  notify_owner: { label: 'Notify Owner', icon: NotificationsActiveIcon, color: '#C9A227' },
  notify_manager: { label: 'Notify Manager', icon: NotificationsActiveIcon, color: '#A54D4D' },
  flag_portfolio_dashboard: { label: 'Flag on Dashboard', icon: FlagIcon, color: '#A54D4D' },
  assign_backup_reviewer: { label: 'Assign Backup Reviewer', icon: PersonAddIcon, color: '#7B2D2D' },
  flag_executive_summary: { label: 'Executive Escalation', icon: FlagIcon, color: '#7B2D2D' },
};

export default function SLATracker({ initiative, onSelectInitiative, showDashboard = false }) {
  const { initiatives, initiativesAtRisk } = useBlueprint();

  // Calculate SLA status for single initiative using detailed 4-tier model
  const slaStatus = useMemo(() => {
    if (!initiative) return null;

    const currentStage = initiative.status || initiative.stage;
    const slaConfig = BPS_STAGE_SLAS[currentStage];
    if (!slaConfig) return null;

    const target = slaConfig.hours / 24;

    // Try calculateDetailedSLA first (works with governance_data.stage_history)
    const detailed = calculateDetailedSLA({
      stage: currentStage,
      governance_data: initiative.governance_data,
    });

    // Fall back to local calculation if detailed returns 0 hours
    let hoursElapsed = detailed.hoursElapsed;
    if (!hoursElapsed) {
      const stageEntry = initiative.stageHistory?.find(h => h.stage === currentStage);
      const enteredAt = stageEntry?.entered_at
        ? new Date(stageEntry.entered_at)
        : new Date(initiative.created_at);
      hoursElapsed = (new Date() - enteredAt) / (1000 * 60 * 60);
    }

    const daysInStage = hoursElapsed / 24;
    const percentUsed = target > 0 ? Math.round((daysInStage / target) * 100) : 0;
    const daysRemaining = Math.max(0, target - daysInStage);

    // 4-tier determination
    let tier = 'on_track';
    if (daysInStage > target * 2) tier = 'breached_2x';
    else if (daysInStage > target) tier = 'breached';
    else if (daysInStage > target * 0.8) tier = 'at_risk';

    const escalation = BPS_SLA_ESCALATION[tier];

    return {
      currentStage,
      target,
      daysInStage: Math.round(daysInStage * 10) / 10,
      daysRemaining: Math.round(daysRemaining * 10) / 10,
      percentUsed,
      tier,
      escalation,
      // Legacy compat
      status: tier === 'breached_2x' ? 'breached' : tier,
    };
  }, [initiative]);

  // Calculate overall SLA metrics for dashboard — 4-tier model
  const overallMetrics = useMemo(() => {
    if (!showDashboard) return null;

    const activeInitiatives = initiatives.filter(i =>
      !['approved', 'declined'].includes(i.status)
    );

    const byTier = {
      on_track: 0,
      at_risk: 0,
      breached: 0,
      breached_2x: 0,
    };

    const stageBreakdown = {};
    const initiativeDetails = [];

    activeInitiatives.forEach(init => {
      const stage = init.status || init.stage;
      const slaConfig = BPS_STAGE_SLAS[stage];
      if (!slaConfig) return;

      const target = slaConfig.hours / 24;

      // Try detailed first
      const detailed = calculateDetailedSLA({
        stage,
        governance_data: init.governance_data,
      });

      let hoursElapsed = detailed.hoursElapsed;
      if (!hoursElapsed) {
        const stageEntry = init.stageHistory?.find(h => h.stage === stage);
        const enteredAt = stageEntry?.entered_at
          ? new Date(stageEntry.entered_at)
          : new Date(init.created_at);
        hoursElapsed = (new Date() - enteredAt) / (1000 * 60 * 60);
      }

      const daysInStage = hoursElapsed / 24;

      let tier = 'on_track';
      if (daysInStage > target * 2) tier = 'breached_2x';
      else if (daysInStage > target) tier = 'breached';
      else if (daysInStage > target * 0.8) tier = 'at_risk';

      byTier[tier]++;

      if (!stageBreakdown[stage]) {
        stageBreakdown[stage] = { total: 0, on_track: 0, at_risk: 0, breached: 0, breached_2x: 0 };
      }
      stageBreakdown[stage].total++;
      stageBreakdown[stage][tier]++;

      // Track details for at-risk+ initiatives
      if (tier !== 'on_track') {
        initiativeDetails.push({
          ...init,
          slaTier: tier,
          slaDaysInStage: Math.round(daysInStage),
          slaTarget: target,
          slaEscalation: BPS_SLA_ESCALATION[tier],
        });
      }
    });

    const complianceRate = activeInitiatives.length > 0
      ? Math.round((byTier.on_track / activeInitiatives.length) * 100)
      : 100;

    return {
      total: activeInitiatives.length,
      byTier,
      stageBreakdown,
      complianceRate,
      atRiskDetails: initiativeDetails.sort((a, b) => {
        const tierOrder = { breached_2x: 0, breached: 1, at_risk: 2 };
        return (tierOrder[a.slaTier] ?? 3) - (tierOrder[b.slaTier] ?? 3);
      }),
    };
  }, [initiatives, showDashboard]);

  const getTierColor = (tier) => BPS_SLA_ESCALATION[tier]?.color || '#9C9A94';

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'on_track': return CheckCircleIcon;
      case 'at_risk': return WarningIcon;
      case 'breached': return ErrorIcon;
      case 'breached_2x': return ErrorIcon;
      default: return AccessTimeIcon;
    }
  };

  // Single initiative SLA display
  if (initiative && slaStatus) {
    const TierIcon = getTierIcon(slaStatus.tier);

    return (
      <div className={`sla-tracker sla-tracker--${slaStatus.tier}`}>
        <div className="sla-tracker-header">
          <TierIcon style={{ color: getTierColor(slaStatus.tier) }} />
          <div className="sla-tracker-title">
            <h4>SLA Status</h4>
            <span className="sla-tracker-stage">
              {BPS_STAGE_INFO[slaStatus.currentStage]?.name} Stage
            </span>
          </div>
          <span
            className="sla-tracker-tier-badge"
            style={{
              color: getTierColor(slaStatus.tier),
              backgroundColor: `${getTierColor(slaStatus.tier)}15`,
            }}
          >
            {slaStatus.escalation?.label || 'On Track'}
          </span>
        </div>

        <div className="sla-tracker-progress">
          <div className="sla-tracker-progress-bar">
            <div
              className="sla-tracker-progress-fill"
              style={{
                width: `${Math.min(100, slaStatus.percentUsed)}%`,
                backgroundColor: getTierColor(slaStatus.tier),
              }}
            />
            {/* Warning marker at 80% */}
            <div className="sla-tracker-progress-marker" style={{ left: '80%' }} />
            {/* Breach marker at 100% */}
            {slaStatus.percentUsed > 50 && (
              <div className="sla-tracker-progress-marker sla-tracker-progress-marker--breach" style={{ left: '100%' }} />
            )}
          </div>
          <div className="sla-tracker-progress-labels">
            <span>0 days</span>
            <span>{slaStatus.target} days (target)</span>
          </div>
        </div>

        <div className="sla-tracker-metrics">
          <div className="sla-tracker-metric">
            <span className="sla-tracker-metric-value">{slaStatus.daysInStage}</span>
            <span className="sla-tracker-metric-label">Days in stage</span>
          </div>
          <div className="sla-tracker-metric">
            <span
              className="sla-tracker-metric-value"
              style={{ color: getTierColor(slaStatus.tier) }}
            >
              {slaStatus.daysRemaining}
            </span>
            <span className="sla-tracker-metric-label">Days remaining</span>
          </div>
          <div className="sla-tracker-metric">
            <span className="sla-tracker-metric-value">{slaStatus.percentUsed}%</span>
            <span className="sla-tracker-metric-label">SLA used</span>
          </div>
        </div>

        {/* Escalation actions for non-on_track tiers */}
        {slaStatus.tier !== 'on_track' && slaStatus.escalation?.actions?.length > 0 && (
          <div className="sla-tracker-escalation">
            <div
              className="sla-tracker-alert"
              style={{ backgroundColor: `${getTierColor(slaStatus.tier)}15` }}
            >
              <TierIcon fontSize="small" style={{ color: getTierColor(slaStatus.tier) }} />
              <span>
                {slaStatus.tier === 'breached_2x'
                  ? 'Critical SLA breach — executive escalation required.'
                  : slaStatus.tier === 'breached'
                  ? 'SLA has been breached. Immediate action required.'
                  : 'Approaching SLA deadline. Consider expediting.'}
              </span>
            </div>
            <div className="sla-tracker-actions">
              <span className="sla-tracker-actions-label">Escalation actions:</span>
              <div className="sla-tracker-actions-list">
                {slaStatus.escalation.actions.map(actionId => {
                  const action = ESCALATION_ACTIONS[actionId];
                  if (!action) return null;
                  const ActionIcon = action.icon;
                  return (
                    <span
                      key={actionId}
                      className="sla-tracker-action-chip"
                      style={{ color: action.color, borderColor: action.color }}
                    >
                      <ActionIcon style={{ fontSize: 14 }} />
                      {action.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard view
  if (showDashboard && overallMetrics) {
    return (
      <div className="sla-dashboard">
        <div className="sla-dashboard-header">
          <AccessTimeIcon />
          <div>
            <h2>SLA Tracker</h2>
            <p>Monitor stage transition SLAs across all initiatives</p>
          </div>
        </div>

        {/* Overall compliance */}
        <div className="sla-dashboard-compliance">
          <div className="sla-dashboard-compliance-score">
            <div
              className="sla-dashboard-compliance-ring"
              style={{
                borderColor: overallMetrics.complianceRate >= 80 ? '#5B8A6A' :
                             overallMetrics.complianceRate >= 60 ? '#C9A227' : '#A54D4D'
              }}
            >
              <span className="sla-dashboard-compliance-value">
                {overallMetrics.complianceRate}%
              </span>
              <span className="sla-dashboard-compliance-label">Compliance</span>
            </div>
          </div>
          <div className="sla-dashboard-compliance-breakdown">
            {Object.entries(BPS_SLA_ESCALATION).map(([tier, config]) => {
              const TierIcon = getTierIcon(tier);
              return (
                <div key={tier} className="sla-dashboard-status-item">
                  <TierIcon style={{ color: config.color }} />
                  <span>{config.label}</span>
                  <strong>{overallMetrics.byTier[tier] || 0}</strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage breakdown */}
        <div className="sla-dashboard-stages">
          <h3>By Stage</h3>
          <div className="sla-dashboard-stages-grid">
            {Object.entries(overallMetrics.stageBreakdown).map(([stage, data]) => (
              <div key={stage} className="sla-dashboard-stage-card">
                <div
                  className="sla-dashboard-stage-header"
                  style={{ borderLeftColor: BPS_STAGE_INFO[stage]?.color }}
                >
                  <span>{BPS_STAGE_INFO[stage]?.name}</span>
                  <span className="sla-dashboard-stage-count">{data.total}</span>
                </div>
                <div className="sla-dashboard-stage-target">
                  Target: {(BPS_STAGE_SLAS[stage]?.hours || 0) / 24} days
                </div>
                <div className="sla-dashboard-stage-breakdown">
                  {data.on_track > 0 && (
                    <span className="sla-mini-badge sla-mini-badge--on_track">
                      {data.on_track}
                    </span>
                  )}
                  {data.at_risk > 0 && (
                    <span className="sla-mini-badge sla-mini-badge--at_risk">
                      {data.at_risk}
                    </span>
                  )}
                  {data.breached > 0 && (
                    <span className="sla-mini-badge sla-mini-badge--breached">
                      {data.breached}
                    </span>
                  )}
                  {data.breached_2x > 0 && (
                    <span className="sla-mini-badge sla-mini-badge--breached_2x">
                      {data.breached_2x}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-risk initiatives with escalation details */}
        {overallMetrics.atRiskDetails.length > 0 && (
          <div className="sla-dashboard-at-risk">
            <h3>
              <WarningIcon fontSize="small" className="text-warning" />
              Initiatives Requiring Attention
            </h3>
            <div className="sla-dashboard-at-risk-list">
              {overallMetrics.atRiskDetails.map(init => (
                <div
                  key={init.id}
                  className="sla-dashboard-at-risk-item"
                  onClick={() => onSelectInitiative?.(init)}
                >
                  <div className="sla-dashboard-at-risk-info">
                    <span className="sla-dashboard-at-risk-id">{init.display_id}</span>
                    <span className="sla-dashboard-at-risk-name">{init.name}</span>
                  </div>
                  <div className="sla-dashboard-at-risk-stage">
                    {BPS_STAGE_INFO[init.status]?.name}
                  </div>
                  <div className="sla-dashboard-at-risk-time">
                    <span style={{ color: getTierColor(init.slaTier) }}>
                      {init.slaDaysInStage} / {init.slaTarget} days
                    </span>
                  </div>
                  <span
                    className="sla-dashboard-at-risk-tier"
                    style={{
                      color: getTierColor(init.slaTier),
                      backgroundColor: `${getTierColor(init.slaTier)}15`,
                    }}
                  >
                    {init.slaEscalation?.label}
                  </span>
                  {/* Escalation actions */}
                  {init.slaEscalation?.actions?.length > 0 && (
                    <div className="sla-dashboard-at-risk-actions">
                      {init.slaEscalation.actions.map(actionId => {
                        const action = ESCALATION_ACTIONS[actionId];
                        if (!action) return null;
                        const ActionIcon = action.icon;
                        return (
                          <span
                            key={actionId}
                            className="sla-tracker-action-chip sla-tracker-action-chip--small"
                            style={{ color: action.color, borderColor: action.color }}
                            title={action.label}
                          >
                            <ActionIcon style={{ fontSize: 12 }} />
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLA Targets Reference */}
        <div className="sla-dashboard-reference">
          <h3>
            <TrendingUpIcon fontSize="small" />
            SLA Targets
          </h3>
          <div className="sla-dashboard-reference-grid">
            {Object.entries(BPS_STAGE_SLAS).map(([stage, sla]) => (
              <div key={stage} className="sla-dashboard-reference-item">
                <span
                  className="sla-dashboard-reference-dot"
                  style={{ backgroundColor: BPS_STAGE_INFO[stage]?.color }}
                />
                <span className="sla-dashboard-reference-stage">
                  {BPS_STAGE_INFO[stage]?.name}
                </span>
                <span className="sla-dashboard-reference-days">{sla.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Escalation Tiers Legend */}
        <div className="sla-dashboard-reference">
          <h3>Escalation Tiers</h3>
          <div className="sla-dashboard-escalation-legend">
            {Object.entries(BPS_SLA_ESCALATION).map(([tier, config]) => (
              <div key={tier} className="sla-dashboard-escalation-item">
                <span
                  className="sla-dashboard-reference-dot"
                  style={{ backgroundColor: config.color }}
                />
                <div className="sla-dashboard-escalation-info">
                  <span className="sla-dashboard-escalation-name">{config.label}</span>
                  {config.description && (
                    <span className="sla-dashboard-escalation-desc">{config.description}</span>
                  )}
                  {config.actions?.length > 0 && (
                    <span className="sla-dashboard-escalation-actions-text">
                      Actions: {config.actions.map(a => ESCALATION_ACTIONS[a]?.label || a).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
