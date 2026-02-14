// components/spaces/blueprint/views/InnovationAccounting.js
// Innovation Accounting dashboard — Three-tier metrics view
// Based on Toma & Gons innovation accounting framework:
//   Tactical (Product Teams), Managerial (Innovation Managers), Strategic (Executives)

import { useState, useMemo } from 'react';
import {
  useBlueprint,
  BPS_STAGE_INFO,
  BPS_STAGE_METRICS,
  formatCurrency,
  formatPercentage,
  calculateFunnelMetrics,
} from '../BlueprintContext';
import { getStageMetrics, checkMetricCompleteness } from '../../../../lib/blueprint-types';

// MUI Icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SpeedIcon from '@mui/icons-material/Speed';
import ScienceIcon from '@mui/icons-material/Science';
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function InnovationAccounting({ onNavigate }) {
  const { initiatives, productIdeas } = useBlueprint();

  // Collapsible section state
  const [expandedSections, setExpandedSections] = useState({
    tactical: true,
    managerial: true,
    strategic: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ============================================================================
  // TACTICAL METRICS (Product Teams)
  // ============================================================================

  const tacticalMetrics = useMemo(() => {
    const activeInitiatives = initiatives.filter(
      i => i.status !== 'approved' && i.status !== 'declined'
    );

    // Stage metric completion per initiative
    const metricCompletion = activeInitiatives.map(initiative => {
      const stage = initiative.status;
      const stageDataKey = `${stage}_data`;
      const stageData = initiative[stageDataKey] || initiative[stage] || {};
      const completeness = checkMetricCompleteness(stage, stageData);

      return {
        id: initiative.id,
        displayId: initiative.display_id || initiative.id,
        name: initiative.name,
        stage,
        stageColor: BPS_STAGE_INFO[stage]?.color || '#9C9A94',
        stageName: BPS_STAGE_INFO[stage]?.name || stage,
        progress: completeness.progress,
        complete: completeness.complete,
        missing: completeness.missing,
      };
    });

    // Learning velocity: assumptions tested per week across all active initiatives
    const totalAssumptionsTested = activeInitiatives.reduce((sum, i) => {
      return sum + (i.explore_data?.assumptions_tested || i.explore?.assumptions_tested || 0);
    }, 0);

    // Calculate weeks active (from earliest stage entry to now)
    const earliestEntry = activeInitiatives.reduce((earliest, i) => {
      const history = i.governance?.stage_history || i.governance_data?.stage_history || [];
      const firstEntry = history[0]?.entered;
      if (firstEntry) {
        const date = new Date(firstEntry);
        return earliest ? Math.min(earliest, date.getTime()) : date.getTime();
      }
      return earliest;
    }, null);

    const weeksActive = earliestEntry
      ? Math.max(1, (Date.now() - earliestEntry) / (1000 * 60 * 60 * 24 * 7))
      : 1;

    const learningVelocity = totalAssumptionsTested / weeksActive;

    // Experiments run: count of customer interviews + assumptions tested
    const totalInterviews = activeInitiatives.reduce((sum, i) => {
      return sum + (i.explore_data?.customer_interviews || i.explore?.customer_interviews || 0);
    }, 0);

    const totalExperiments = totalAssumptionsTested + totalInterviews;

    // Average metric completion across all active initiatives
    const avgCompletion = metricCompletion.length > 0
      ? Math.round(metricCompletion.reduce((sum, m) => sum + m.progress, 0) / metricCompletion.length)
      : 0;

    return {
      metricCompletion,
      learningVelocity: Math.round(learningVelocity * 10) / 10,
      totalAssumptionsTested,
      totalInterviews,
      totalExperiments,
      avgCompletion,
    };
  }, [initiatives]);

  // ============================================================================
  // MANAGERIAL METRICS (Innovation Managers)
  // ============================================================================

  const managerialMetrics = useMemo(() => {
    const funnel = calculateFunnelMetrics(initiatives);
    const stageOrder = ['idea', 'explore', 'assess', 'case', 'approved'];

    // Conversion rates between stages
    const conversionRates = [];
    for (let i = 0; i < stageOrder.length - 1; i++) {
      const from = stageOrder[i];
      const to = stageOrder[i + 1];
      const key = `${from}_to_${to}`;
      conversionRates.push({
        from,
        to,
        fromName: BPS_STAGE_INFO[from]?.name || from,
        toName: BPS_STAGE_INFO[to]?.name || to,
        rate: funnel.conversions[key] || 0,
        fromColor: BPS_STAGE_INFO[from]?.color || '#9C9A94',
        toColor: BPS_STAGE_INFO[to]?.color || '#9C9A94',
      });
    }

    // Overall funnel conversion (idea to approved)
    const overallConversion = funnel.conversions['idea_to_approved'] || (
      funnel.byStage.idea > 0
        ? Math.round((funnel.byStage.approved / Math.max(1, initiatives.length)) * 100)
        : 0
    );

    // Average cycle time per stage (days)
    const cycleTimes = {};
    stageOrder.forEach(stage => {
      const stageInitiatives = initiatives.filter(i => {
        const history = i.governance?.stage_history || i.governance_data?.stage_history || [];
        return history.some(h => h.stage === stage);
      });

      const times = stageInitiatives.map(i => {
        const history = i.governance?.stage_history || i.governance_data?.stage_history || [];
        const entry = history.find(h => h.stage === stage);
        if (!entry?.entered) return null;
        const entered = new Date(entry.entered);
        const exited = entry.exited ? new Date(entry.exited) : (i.status === stage ? new Date() : null);
        if (!exited) return null;
        return (exited - entered) / (1000 * 60 * 60 * 24);
      }).filter(t => t !== null);

      cycleTimes[stage] = {
        avg: times.length > 0 ? Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 10) / 10 : 0,
        count: times.length,
        stageName: BPS_STAGE_INFO[stage]?.name || stage,
        stageColor: BPS_STAGE_INFO[stage]?.color || '#9C9A94',
      };
    });

    // SLA compliance: how many active initiatives are on track
    const activeInStages = initiatives.filter(
      i => i.status !== 'approved' && i.status !== 'declined'
    );
    const onTrack = activeInStages.filter(i => {
      const history = i.governance?.stage_history || i.governance_data?.stage_history || [];
      const currentEntry = history.find(h => h.stage === i.status && !h.exited);
      if (!currentEntry?.entered) return true;
      const slaHours = BPS_STAGE_INFO[i.status] ? getSLAHours(i.status) : null;
      if (!slaHours) return true;
      const hoursElapsed = (Date.now() - new Date(currentEntry.entered).getTime()) / (1000 * 60 * 60);
      return hoursElapsed <= slaHours;
    });
    const slaCompliance = activeInStages.length > 0
      ? Math.round((onTrack.length / activeInStages.length) * 100)
      : 100;

    return {
      conversionRates,
      overallConversion,
      cycleTimes,
      slaCompliance,
      activeCount: activeInStages.length,
      onTrackCount: onTrack.length,
      funnel,
    };
  }, [initiatives]);

  // ============================================================================
  // STRATEGIC METRICS (Executives)
  // ============================================================================

  const strategicMetrics = useMemo(() => {
    // Portfolio distribution by horizon
    const horizonDistribution = { h1: 0, h2: 0, h3: 0, unclassified: 0 };
    const horizonValues = { h1: 0, h2: 0, h3: 0, unclassified: 0 };

    initiatives.forEach(i => {
      const horizon = i.horizon || i.assess?.horizon || i.assess_data?.horizon;
      const npv = i.case?.financials?.npv || i.case_data?.financials?.npv || 0;
      if (horizon && horizonDistribution[horizon] !== undefined) {
        horizonDistribution[horizon]++;
        horizonValues[horizon] += npv;
      } else {
        horizonDistribution.unclassified++;
        horizonValues.unclassified += npv;
      }
    });

    const totalInitiatives = initiatives.length;
    const horizonPercentages = {};
    Object.keys(horizonDistribution).forEach(h => {
      horizonPercentages[h] = totalInitiatives > 0
        ? Math.round((horizonDistribution[h] / totalInitiatives) * 100)
        : 0;
    });

    // Target allocation (from BPS_HORIZONS): H1=70%, H2=20%, H3=10%
    const targetAllocation = { h1: 70, h2: 20, h3: 10 };
    const allocationHealth = {};
    ['h1', 'h2', 'h3'].forEach(h => {
      const actual = horizonPercentages[h] || 0;
      const target = targetAllocation[h];
      const deviation = Math.abs(actual - target);
      allocationHealth[h] = {
        actual,
        target,
        deviation,
        status: deviation <= 10 ? 'healthy' : deviation <= 20 ? 'warning' : 'misaligned',
      };
    });

    // Total pipeline value (sum of all NPVs)
    const totalPipelineValue = initiatives.reduce((sum, i) => {
      return sum + (i.case?.financials?.npv || i.case_data?.financials?.npv || 0);
    }, 0);

    // Approval rate
    const terminalInitiatives = initiatives.filter(
      i => i.status === 'approved' || i.status === 'declined'
    );
    const approvedCount = initiatives.filter(i => i.status === 'approved').length;
    const declinedCount = initiatives.filter(i => i.status === 'declined').length;
    const approvalRate = terminalInitiatives.length > 0
      ? Math.round((approvedCount / terminalInitiatives.length) * 100)
      : 0;

    // Investment by stage
    const investmentByStage = {};
    ['idea', 'explore', 'assess', 'case', 'approval'].forEach(stage => {
      investmentByStage[stage] = initiatives
        .filter(i => i.status === stage)
        .reduce((sum, i) => {
          return sum + (i.case?.financials?.investment || i.case_data?.financials?.investment || 0);
        }, 0);
    });

    return {
      horizonDistribution,
      horizonPercentages,
      horizonValues,
      allocationHealth,
      totalPipelineValue,
      approvedCount,
      declinedCount,
      approvalRate,
      investmentByStage,
      totalInitiatives,
    };
  }, [initiatives]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getCompletionColor = (progress) => {
    if (progress >= 80) return '#5B8A6A';
    if (progress >= 50) return '#C9A227';
    return '#A54D4D';
  };

  const getAllocationStatusColor = (status) => {
    if (status === 'healthy') return '#5B8A6A';
    if (status === 'warning') return '#C9A227';
    return '#A54D4D';
  };

  const getConversionColor = (rate) => {
    if (rate >= 60) return '#5B8A6A';
    if (rate >= 30) return '#C9A227';
    return '#A54D4D';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="innovation-accounting-view">
      {/* Header */}
      <div className="innovation-accounting-header">
        <div className="innovation-accounting-header-left">
          <AssessmentIcon className="innovation-accounting-icon" />
          <div>
            <h1>Innovation Accounting</h1>
            <p>Three-tier metrics: Tactical, Managerial, Strategic</p>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* TACTICAL SECTION (Product Teams) */}
      {/* ================================================================== */}
      <div className="innovation-accounting-section">
        <button
          className="innovation-accounting-section-header"
          onClick={() => toggleSection('tactical')}
        >
          <div className="innovation-accounting-section-title">
            <ScienceIcon style={{ color: '#5B8A6A' }} />
            <div>
              <h2>Tactical</h2>
              <span className="innovation-accounting-section-subtitle">
                Product Teams — Learning metrics, experiment velocity
              </span>
            </div>
          </div>
          {expandedSections.tactical ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </button>

        {expandedSections.tactical && (
          <div className="innovation-accounting-section-content">
            {/* Summary Cards */}
            <div className="innovation-accounting-summary-row">
              <div className="innovation-accounting-summary-card">
                <SpeedIcon style={{ color: '#5B8A6A' }} />
                <div className="innovation-accounting-summary-value">
                  {tacticalMetrics.learningVelocity}
                </div>
                <div className="innovation-accounting-summary-label">
                  Assumptions / week
                </div>
              </div>
              <div className="innovation-accounting-summary-card">
                <ScienceIcon style={{ color: '#C9A227' }} />
                <div className="innovation-accounting-summary-value">
                  {tacticalMetrics.totalExperiments}
                </div>
                <div className="innovation-accounting-summary-label">
                  Experiments Run
                </div>
              </div>
              <div className="innovation-accounting-summary-card">
                <SchoolIcon style={{ color: '#47453F' }} />
                <div className="innovation-accounting-summary-value">
                  {tacticalMetrics.avgCompletion}%
                </div>
                <div className="innovation-accounting-summary-label">
                  Avg. Metric Completion
                </div>
              </div>
            </div>

            {/* Learning Detail Breakdown */}
            <div className="innovation-accounting-detail-row">
              <div className="innovation-accounting-detail-card">
                <h3>Learning Activity</h3>
                <div className="innovation-accounting-stat-grid">
                  <div className="innovation-accounting-stat">
                    <span className="innovation-accounting-stat-value">
                      {tacticalMetrics.totalInterviews}
                    </span>
                    <span className="innovation-accounting-stat-label">
                      Customer Interviews
                    </span>
                  </div>
                  <div className="innovation-accounting-stat">
                    <span className="innovation-accounting-stat-value">
                      {tacticalMetrics.totalAssumptionsTested}
                    </span>
                    <span className="innovation-accounting-stat-label">
                      Assumptions Tested
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Metric Completion Per Initiative */}
            <div className="innovation-accounting-detail-card">
              <h3>Stage Metric Completion by Initiative</h3>
              {tacticalMetrics.metricCompletion.length === 0 ? (
                <p className="innovation-accounting-empty">No active initiatives</p>
              ) : (
                <div className="innovation-accounting-completion-list">
                  {tacticalMetrics.metricCompletion.map(item => (
                    <div key={item.id} className="innovation-accounting-completion-row">
                      <div className="innovation-accounting-completion-info">
                        <span
                          className="innovation-accounting-stage-badge"
                          style={{ backgroundColor: item.stageColor }}
                        >
                          {item.stageName}
                        </span>
                        <span className="innovation-accounting-initiative-name">
                          {item.displayId} — {item.name}
                        </span>
                      </div>
                      <div className="innovation-accounting-completion-bar-container">
                        <div className="innovation-accounting-completion-bar">
                          <div
                            className="innovation-accounting-completion-bar-fill"
                            style={{
                              width: `${item.progress}%`,
                              backgroundColor: getCompletionColor(item.progress),
                            }}
                          />
                        </div>
                        <span
                          className="innovation-accounting-completion-pct"
                          style={{ color: getCompletionColor(item.progress) }}
                        >
                          {item.progress}%
                        </span>
                      </div>
                      {item.missing.length > 0 && (
                        <div className="innovation-accounting-missing-metrics">
                          {item.missing.map(m => (
                            <span key={m.id} className="innovation-accounting-missing-tag">
                              {m.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* MANAGERIAL SECTION (Innovation Managers) */}
      {/* ================================================================== */}
      <div className="innovation-accounting-section">
        <button
          className="innovation-accounting-section-header"
          onClick={() => toggleSection('managerial')}
        >
          <div className="innovation-accounting-section-title">
            <TrendingUpIcon style={{ color: '#C9A227' }} />
            <div>
              <h2>Managerial</h2>
              <span className="innovation-accounting-section-subtitle">
                Innovation Managers — Conversion rates, pipeline health, cycle time
              </span>
            </div>
          </div>
          {expandedSections.managerial ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </button>

        {expandedSections.managerial && (
          <div className="innovation-accounting-section-content">
            {/* Summary Cards */}
            <div className="innovation-accounting-summary-row">
              <div className="innovation-accounting-summary-card">
                <TrendingUpIcon style={{ color: getConversionColor(managerialMetrics.overallConversion) }} />
                <div className="innovation-accounting-summary-value">
                  {managerialMetrics.overallConversion}%
                </div>
                <div className="innovation-accounting-summary-label">
                  Overall Conversion
                </div>
              </div>
              <div className="innovation-accounting-summary-card">
                <CheckCircleIcon style={{ color: managerialMetrics.slaCompliance >= 80 ? '#5B8A6A' : '#C9A227' }} />
                <div className="innovation-accounting-summary-value">
                  {managerialMetrics.slaCompliance}%
                </div>
                <div className="innovation-accounting-summary-label">
                  SLA Compliance
                </div>
              </div>
              <div className="innovation-accounting-summary-card">
                <TimelineIcon style={{ color: '#47453F' }} />
                <div className="innovation-accounting-summary-value">
                  {managerialMetrics.activeCount}
                </div>
                <div className="innovation-accounting-summary-label">
                  Active in Pipeline
                </div>
              </div>
            </div>

            {/* Funnel Conversion Rates */}
            <div className="innovation-accounting-detail-card">
              <h3>Funnel Conversion Rates</h3>
              <div className="innovation-accounting-funnel-conversions">
                {managerialMetrics.conversionRates.map(conv => (
                  <div key={`${conv.from}-${conv.to}`} className="innovation-accounting-conversion-item">
                    <div className="innovation-accounting-conversion-stages">
                      <span
                        className="innovation-accounting-stage-badge"
                        style={{ backgroundColor: conv.fromColor }}
                      >
                        {conv.fromName}
                      </span>
                      <span className="innovation-accounting-conversion-arrow">&#8594;</span>
                      <span
                        className="innovation-accounting-stage-badge"
                        style={{ backgroundColor: conv.toColor }}
                      >
                        {conv.toName}
                      </span>
                    </div>
                    <div className="innovation-accounting-conversion-rate-bar-container">
                      <div className="innovation-accounting-conversion-rate-bar">
                        <div
                          className="innovation-accounting-conversion-rate-bar-fill"
                          style={{
                            width: `${Math.min(conv.rate, 100)}%`,
                            backgroundColor: getConversionColor(conv.rate),
                          }}
                        />
                      </div>
                      <span
                        className="innovation-accounting-conversion-rate-value"
                        style={{ color: getConversionColor(conv.rate) }}
                      >
                        {conv.rate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Average Cycle Time Per Stage */}
            <div className="innovation-accounting-detail-card">
              <h3>Average Cycle Time by Stage</h3>
              <div className="innovation-accounting-cycle-times">
                {Object.entries(managerialMetrics.cycleTimes).map(([stage, data]) => (
                  <div key={stage} className="innovation-accounting-cycle-time-item">
                    <span
                      className="innovation-accounting-stage-badge"
                      style={{ backgroundColor: data.stageColor }}
                    >
                      {data.stageName}
                    </span>
                    <div className="innovation-accounting-cycle-time-value">
                      <span className="innovation-accounting-cycle-time-days">
                        {data.avg} days
                      </span>
                      <span className="innovation-accounting-cycle-time-count">
                        ({data.count} initiative{data.count !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA Compliance Detail */}
            <div className="innovation-accounting-detail-card">
              <h3>SLA Compliance</h3>
              <div className="innovation-accounting-sla-detail">
                <div className="innovation-accounting-sla-ring">
                  <svg viewBox="0 0 120 120" className="innovation-accounting-sla-svg">
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke="#E2E0DB"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke={managerialMetrics.slaCompliance >= 80 ? '#5B8A6A' : managerialMetrics.slaCompliance >= 60 ? '#C9A227' : '#A54D4D'}
                      strokeWidth="10"
                      strokeDasharray={`${managerialMetrics.slaCompliance * 3.14} ${314 - managerialMetrics.slaCompliance * 3.14}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="innovation-accounting-sla-center">
                    <span className="innovation-accounting-sla-pct">
                      {managerialMetrics.slaCompliance}%
                    </span>
                  </div>
                </div>
                <div className="innovation-accounting-sla-breakdown">
                  <div className="innovation-accounting-sla-stat">
                    <CheckCircleIcon fontSize="small" style={{ color: '#5B8A6A' }} />
                    <span>{managerialMetrics.onTrackCount} on track</span>
                  </div>
                  <div className="innovation-accounting-sla-stat">
                    <WarningIcon fontSize="small" style={{ color: '#A54D4D' }} />
                    <span>{managerialMetrics.activeCount - managerialMetrics.onTrackCount} breached / at risk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* STRATEGIC SECTION (Executives) */}
      {/* ================================================================== */}
      <div className="innovation-accounting-section">
        <button
          className="innovation-accounting-section-header"
          onClick={() => toggleSection('strategic')}
        >
          <div className="innovation-accounting-section-title">
            <AccountBalanceIcon style={{ color: '#47453F' }} />
            <div>
              <h2>Strategic</h2>
              <span className="innovation-accounting-section-subtitle">
                Executives — Portfolio NPV, investment allocation
              </span>
            </div>
          </div>
          {expandedSections.strategic ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </button>

        {expandedSections.strategic && (
          <div className="innovation-accounting-section-content">
            {/* Summary Cards */}
            <div className="innovation-accounting-summary-row">
              <div className="innovation-accounting-summary-card">
                <AccountBalanceIcon style={{ color: '#47453F' }} />
                <div className="innovation-accounting-summary-value">
                  {formatCurrency(strategicMetrics.totalPipelineValue)}
                </div>
                <div className="innovation-accounting-summary-label">
                  Total Pipeline Value
                </div>
              </div>
              <div className="innovation-accounting-summary-card">
                <CheckCircleIcon style={{ color: '#5B8A6A' }} />
                <div className="innovation-accounting-summary-value">
                  {strategicMetrics.approvalRate}%
                </div>
                <div className="innovation-accounting-summary-label">
                  Approval Rate ({strategicMetrics.approvedCount} / {strategicMetrics.approvedCount + strategicMetrics.declinedCount})
                </div>
              </div>
              <div className="innovation-accounting-summary-card">
                <PieChartIcon style={{ color: '#C9A227' }} />
                <div className="innovation-accounting-summary-value">
                  {strategicMetrics.totalInitiatives}
                </div>
                <div className="innovation-accounting-summary-label">
                  Portfolio Size
                </div>
              </div>
            </div>

            {/* Horizon Distribution */}
            <div className="innovation-accounting-detail-card">
              <h3>Portfolio Distribution by Horizon</h3>
              <div className="innovation-accounting-horizon-grid">
                {['h1', 'h2', 'h3'].map(h => {
                  const allocation = strategicMetrics.allocationHealth[h];
                  return (
                    <div key={h} className="innovation-accounting-horizon-card">
                      <div className="innovation-accounting-horizon-header">
                        <span className="innovation-accounting-horizon-name">
                          {h === 'h1' ? 'H1 - Core' : h === 'h2' ? 'H2 - Adjacent' : 'H3 - Transform'}
                        </span>
                        <span
                          className="innovation-accounting-horizon-status"
                          style={{ color: getAllocationStatusColor(allocation.status) }}
                        >
                          {allocation.status === 'healthy' ? 'On Target' :
                           allocation.status === 'warning' ? 'Drifting' : 'Misaligned'}
                        </span>
                      </div>
                      <div className="innovation-accounting-horizon-bars">
                        <div className="innovation-accounting-horizon-bar-row">
                          <span className="innovation-accounting-horizon-bar-label">Actual</span>
                          <div className="innovation-accounting-horizon-bar">
                            <div
                              className="innovation-accounting-horizon-bar-fill"
                              style={{
                                width: `${Math.min(allocation.actual, 100)}%`,
                                backgroundColor: getAllocationStatusColor(allocation.status),
                              }}
                            />
                          </div>
                          <span className="innovation-accounting-horizon-bar-value">
                            {allocation.actual}%
                          </span>
                        </div>
                        <div className="innovation-accounting-horizon-bar-row">
                          <span className="innovation-accounting-horizon-bar-label">Target</span>
                          <div className="innovation-accounting-horizon-bar">
                            <div
                              className="innovation-accounting-horizon-bar-fill innovation-accounting-horizon-bar-fill--target"
                              style={{ width: `${allocation.target}%` }}
                            />
                          </div>
                          <span className="innovation-accounting-horizon-bar-value">
                            {allocation.target}%
                          </span>
                        </div>
                      </div>
                      <div className="innovation-accounting-horizon-meta">
                        <span>{strategicMetrics.horizonDistribution[h]} initiative{strategicMetrics.horizonDistribution[h] !== 1 ? 's' : ''}</span>
                        <span>{formatCurrency(strategicMetrics.horizonValues[h])} NPV</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {strategicMetrics.horizonDistribution.unclassified > 0 && (
                <div className="innovation-accounting-unclassified-notice">
                  <WarningIcon fontSize="small" style={{ color: '#C9A227' }} />
                  <span>
                    {strategicMetrics.horizonDistribution.unclassified} initiative{strategicMetrics.horizonDistribution.unclassified !== 1 ? 's' : ''} not yet classified by horizon
                  </span>
                </div>
              )}
            </div>

            {/* Pipeline Value by Stage */}
            <div className="innovation-accounting-detail-card">
              <h3>Pipeline Value Summary</h3>
              <div className="innovation-accounting-pipeline-summary">
                <div className="innovation-accounting-pipeline-total">
                  <span className="innovation-accounting-pipeline-total-label">Total Pipeline NPV</span>
                  <span className="innovation-accounting-pipeline-total-value">
                    {formatCurrency(strategicMetrics.totalPipelineValue)}
                  </span>
                </div>
                <div className="innovation-accounting-pipeline-breakdown">
                  <div className="innovation-accounting-pipeline-stat">
                    <CheckCircleIcon fontSize="small" style={{ color: '#5B8A6A' }} />
                    <span className="innovation-accounting-pipeline-stat-label">Approved</span>
                    <span className="innovation-accounting-pipeline-stat-value">
                      {strategicMetrics.approvedCount}
                    </span>
                  </div>
                  <div className="innovation-accounting-pipeline-stat">
                    <WarningIcon fontSize="small" style={{ color: '#A54D4D' }} />
                    <span className="innovation-accounting-pipeline-stat-label">Declined</span>
                    <span className="innovation-accounting-pipeline-stat-value">
                      {strategicMetrics.declinedCount}
                    </span>
                  </div>
                  <div className="innovation-accounting-pipeline-stat">
                    <TimelineIcon fontSize="small" style={{ color: '#47453F' }} />
                    <span className="innovation-accounting-pipeline-stat-label">In Progress</span>
                    <span className="innovation-accounting-pipeline-stat-value">
                      {strategicMetrics.totalInitiatives - strategicMetrics.approvedCount - strategicMetrics.declinedCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HELPER: Get SLA hours for a stage
// ============================================================================

function getSLAHours(stage) {
  const slaMap = { idea: 48, explore: 168, assess: 336, case: 336 };
  return slaMap[stage] || null;
}
