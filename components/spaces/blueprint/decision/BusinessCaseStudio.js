// components/spaces/blueprint/decision/BusinessCaseStudio.js
// Unified Business Case Canvas - Everything visible, document-like flow
// Premium executive-ready presentation of research → financials → recommendation

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  useBlueprint,
  formatCurrency,
  formatPercentage,
  BPS_STAGE_INFO,
  BPS_SCORING_CRITERIA,
} from '../BlueprintContext';
import { calculateNPV, calculateIRR, calculatePayback, calculateBCR } from '../../../../lib/blueprint-types';

// MUI Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InsightsIcon from '@mui/icons-material/Insights';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// Recommendation options with semantic styling
const RECOMMENDATIONS = [
  { id: 'proceed', label: 'Proceed', icon: RocketLaunchIcon, color: '#5B8A6A', desc: 'Approve and begin delivery' },
  { id: 'pivot', label: 'Pivot', icon: SwapHorizIcon, color: '#C9A227', desc: 'Adjust approach, then reassess' },
  { id: 'pause', label: 'Pause', icon: PauseCircleIcon, color: '#6B6965', desc: 'Hold for better conditions' },
  { id: 'kill', label: 'Kill', icon: CancelIcon, color: '#A54D4D', desc: 'Do not proceed' },
];

export default function BusinessCaseStudio({ onNavigate }) {
  const {
    activeInitiative,
    initiatives,
    updateInitiative,
    saving,
  } = useBlueprint();

  // Auto-save refs
  const isInitialMount = useRef(true);
  const autoSaveTimeoutRef = useRef(null);

  // Get current initiative data
  const initiative = useMemo(() => {
    if (!activeInitiative) return null;
    return initiatives.find(i => i.id === activeInitiative.id);
  }, [activeInitiative, initiatives]);

  // Extract data from different stages
  const ideaData = initiative?.idea || {};
  const exploreData = initiative?.explore || {};
  const assessData = initiative?.assess || {};
  const caseData = initiative?.case || {};

  // Local state for business case editing
  const [businessCase, setBusinessCase] = useState(() => ({
    executive_summary: caseData.executive_summary || '',
    investment_required: caseData.investment_required || 0,
    annual_operating_cost: caseData.annual_operating_cost || 0,
    year1_revenue: caseData.year1_revenue || 0,
    year2_revenue: caseData.year2_revenue || 0,
    year3_revenue: caseData.year3_revenue || 0,
    year4_revenue: caseData.year4_revenue || 0,
    year5_revenue: caseData.year5_revenue || 0,
    discount_rate: caseData.discount_rate || 10,
    implementation_timeline: caseData.implementation_timeline || '',
    key_milestones: caseData.key_milestones || [],
    resource_requirements: caseData.resource_requirements || '',
    dependencies: caseData.dependencies || '',
    risks: caseData.risks || [],
    recommendation: caseData.recommendation || '',
    recommendation_rationale: caseData.recommendation_rationale || '',
    conditions: caseData.conditions || '',
    key_assumptions: caseData.key_assumptions || '',
  }));

  // Sync from initiative when it changes
  useEffect(() => {
    if (initiative?.case) {
      isInitialMount.current = true;
      setBusinessCase(prev => ({
        ...prev,
        executive_summary: initiative.case.executive_summary || prev.executive_summary,
        investment_required: initiative.case.investment_required ?? prev.investment_required,
        annual_operating_cost: initiative.case.annual_operating_cost ?? prev.annual_operating_cost,
        year1_revenue: initiative.case.year1_revenue ?? prev.year1_revenue,
        year2_revenue: initiative.case.year2_revenue ?? prev.year2_revenue,
        year3_revenue: initiative.case.year3_revenue ?? prev.year3_revenue,
        year4_revenue: initiative.case.year4_revenue ?? prev.year4_revenue,
        year5_revenue: initiative.case.year5_revenue ?? prev.year5_revenue,
        discount_rate: initiative.case.discount_rate ?? prev.discount_rate,
        implementation_timeline: initiative.case.implementation_timeline || prev.implementation_timeline,
        key_milestones: initiative.case.key_milestones || prev.key_milestones,
        resource_requirements: initiative.case.resource_requirements || prev.resource_requirements,
        dependencies: initiative.case.dependencies || prev.dependencies,
        risks: initiative.case.risks || prev.risks,
        recommendation: initiative.case.recommendation || prev.recommendation,
        recommendation_rationale: initiative.case.recommendation_rationale || prev.recommendation_rationale,
        conditions: initiative.case.conditions || prev.conditions,
        key_assumptions: initiative.case.key_assumptions || prev.key_assumptions,
      }));
    }
  }, [initiative?.case]);

  // Auto-save business case
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!initiative?.id) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      updateInitiative(initiative.id, { case: businessCase });
    }, 800);
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [businessCase, initiative?.id, updateInitiative]);

  // Calculate financials
  const financials = useMemo(() => {
    const cashFlows = [
      -businessCase.investment_required,
      businessCase.year1_revenue - businessCase.annual_operating_cost,
      businessCase.year2_revenue - businessCase.annual_operating_cost,
      businessCase.year3_revenue - businessCase.annual_operating_cost,
      businessCase.year4_revenue - businessCase.annual_operating_cost,
      businessCase.year5_revenue - businessCase.annual_operating_cost,
    ];
    const totalRevenue = businessCase.year1_revenue + businessCase.year2_revenue +
                         businessCase.year3_revenue + businessCase.year4_revenue +
                         businessCase.year5_revenue;
    const totalCost = businessCase.investment_required + (businessCase.annual_operating_cost * 5);
    return {
      npv: calculateNPV(cashFlows, businessCase.discount_rate / 100),
      irr: calculateIRR(cashFlows),
      payback: calculatePayback(cashFlows),
      bcr: totalCost > 0 ? totalRevenue / totalCost : 0,
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
      cashFlows,
    };
  }, [businessCase]);

  // Calculate assessment score
  const assessmentScore = useMemo(() => {
    if (!assessData || Object.keys(assessData).length === 0) return null;
    let totalWeight = 0;
    let weightedScore = 0;
    Object.entries(BPS_SCORING_CRITERIA).forEach(([key, criteria]) => {
      const score = assessData[key]?.score;
      if (score !== undefined) {
        weightedScore += (score / criteria.maxScore) * criteria.weight * 100;
        totalWeight += criteria.weight;
      }
    });
    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : null;
  }, [assessData]);

  // Derived metrics
  const competitorCount = exploreData.competitors?.length || 0;
  const highThreatCount = exploreData.competitors?.filter(c => c.threat_level === 'high').length || 0;
  const segmentCount = exploreData.customer_segments?.length || 0;
  const hasMarketSizing = !!(exploreData.market_sizing?.tam || exploreData.market_sizing?.sam || exploreData.market_sizing?.som);
  const hasPorters = !!(exploreData.porters_forces && Object.keys(exploreData.porters_forces).length > 0);

  // Handler functions
  const handleChange = useCallback((field, value) => {
    setBusinessCase(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMilestoneChange = useCallback((index, field, value) => {
    setBusinessCase(prev => {
      const milestones = [...(prev.key_milestones || [])];
      milestones[index] = { ...milestones[index], [field]: value };
      return { ...prev, key_milestones: milestones };
    });
  }, []);

  const addMilestone = useCallback(() => {
    setBusinessCase(prev => ({
      ...prev,
      key_milestones: [...(prev.key_milestones || []), { name: '', date: '', status: 'pending' }],
    }));
  }, []);

  const removeMilestone = useCallback((index) => {
    setBusinessCase(prev => ({
      ...prev,
      key_milestones: prev.key_milestones.filter((_, i) => i !== index),
    }));
  }, []);

  const handleRiskChange = useCallback((index, field, value) => {
    setBusinessCase(prev => {
      const risks = [...(prev.risks || [])];
      risks[index] = { ...risks[index], [field]: value };
      return { ...prev, risks: risks };
    });
  }, []);

  const addRisk = useCallback(() => {
    setBusinessCase(prev => ({
      ...prev,
      risks: [...(prev.risks || []), { description: '', likelihood: 'medium', impact: 'medium', mitigation: '' }],
    }));
  }, []);

  const removeRisk = useCallback((index) => {
    setBusinessCase(prev => ({
      ...prev,
      risks: prev.risks.filter((_, i) => i !== index),
    }));
  }, []);

  if (!initiative) {
    return (
      <div className="bcs-empty">
        <AccountBalanceIcon className="bcs-empty-icon" />
        <h3>No Initiative Selected</h3>
        <p>Select an initiative to build its business case</p>
        <button className="btn btn--secondary" onClick={() => onNavigate?.('overview')}>
          View Initiatives
        </button>
      </div>
    );
  }

  const selectedRec = RECOMMENDATIONS.find(r => r.id === businessCase.recommendation);

  return (
    <div className="bcs">
      {/* Document Header */}
      <header className="bcs-header">
        <div className="bcs-header-main">
          <div className="bcs-header-badge">BUSINESS CASE</div>
          <h1 className="bcs-header-title">{initiative.name}</h1>
          <p className="bcs-header-subtitle">{ideaData.problem_statement || 'Define the problem in Ideation stage'}</p>
        </div>
        <div className="bcs-header-meta">
          <span className="bcs-save-status">
            {saving ? 'Saving...' : <><CheckCircleIcon /> Auto-saved</>}
          </span>
          <button className="btn btn--secondary btn--sm" disabled>
            <PictureAsPdfIcon /> Export PDF
          </button>
        </div>
      </header>

      {/* Canvas - Single scrollable document */}
      <div className="bcs-canvas">
        {/* SECTION: Research Foundation */}
        <section className="bcs-section">
          <div className="bcs-section-header">
            <span className="bcs-section-number">01</span>
            <h2 className="bcs-section-title">Research Foundation</h2>
            <p className="bcs-section-desc">Evidence gathered from ideation, market research, and strategic assessment</p>
          </div>

          <div className="bcs-evidence-grid">
            {/* Hypothesis Card */}
            <div className="bcs-evidence-card bcs-evidence-card--hypothesis">
              <div className="bcs-evidence-card-header">
                <span className="bcs-evidence-label">Core Hypothesis</span>
                {ideaData.hypothesis ? (
                  <span className="bcs-status bcs-status--complete">Complete</span>
                ) : (
                  <button className="bcs-link-btn" onClick={() => onNavigate?.('ideation')}>Add</button>
                )}
              </div>
              <p className="bcs-evidence-content bcs-evidence-content--quote">
                {ideaData.hypothesis || 'Not yet defined'}
              </p>
              {ideaData.target_customer && (
                <div className="bcs-evidence-meta">
                  <GroupsIcon /> Target: {ideaData.target_customer}
                </div>
              )}
            </div>

            {/* Market Sizing Card */}
            <div className="bcs-evidence-card bcs-evidence-card--market">
              <div className="bcs-evidence-card-header">
                <span className="bcs-evidence-label">Market Opportunity</span>
                {hasMarketSizing ? (
                  <span className="bcs-status bcs-status--complete">Complete</span>
                ) : (
                  <button className="bcs-link-btn" onClick={() => onNavigate?.('market')}>Add</button>
                )}
              </div>
              {hasMarketSizing ? (
                <div className="bcs-market-metrics">
                  <div className="bcs-market-metric">
                    <span className="bcs-market-metric-value">{formatCurrency(exploreData.market_sizing?.tam || 0)}</span>
                    <span className="bcs-market-metric-label">TAM</span>
                  </div>
                  <div className="bcs-market-metric-divider" />
                  <div className="bcs-market-metric">
                    <span className="bcs-market-metric-value">{formatCurrency(exploreData.market_sizing?.sam || 0)}</span>
                    <span className="bcs-market-metric-label">SAM</span>
                  </div>
                  <div className="bcs-market-metric-divider" />
                  <div className="bcs-market-metric bcs-market-metric--highlight">
                    <span className="bcs-market-metric-value">{formatCurrency(exploreData.market_sizing?.som || 0)}</span>
                    <span className="bcs-market-metric-label">SOM (Target)</span>
                  </div>
                </div>
              ) : (
                <p className="bcs-evidence-empty">Market sizing not yet completed</p>
              )}
            </div>

            {/* Competitive Landscape Card */}
            <div className="bcs-evidence-card bcs-evidence-card--competitive">
              <div className="bcs-evidence-card-header">
                <span className="bcs-evidence-label">Competitive Landscape</span>
                {competitorCount > 0 ? (
                  <span className="bcs-status bcs-status--complete">{competitorCount} analyzed</span>
                ) : (
                  <button className="bcs-link-btn" onClick={() => onNavigate?.('market')}>Add</button>
                )}
              </div>
              {competitorCount > 0 ? (
                <div className="bcs-competitive-summary">
                  <div className="bcs-competitive-stat">
                    <span className="bcs-competitive-stat-value">{competitorCount}</span>
                    <span className="bcs-competitive-stat-label">Competitors</span>
                  </div>
                  <div className="bcs-competitive-stat bcs-competitive-stat--warning">
                    <span className="bcs-competitive-stat-value">{highThreatCount}</span>
                    <span className="bcs-competitive-stat-label">High Threat</span>
                  </div>
                  <div className="bcs-competitive-list">
                    {exploreData.competitors?.slice(0, 3).map((c, i) => (
                      <span key={i} className={`bcs-competitor-chip threat-${c.threat_level || 'medium'}`}>
                        {c.name}
                      </span>
                    ))}
                    {competitorCount > 3 && (
                      <span className="bcs-competitor-more">+{competitorCount - 3} more</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="bcs-evidence-empty">No competitors analyzed yet</p>
              )}
            </div>

            {/* Customer Segments Card */}
            <div className="bcs-evidence-card bcs-evidence-card--segments">
              <div className="bcs-evidence-card-header">
                <span className="bcs-evidence-label">Target Segments</span>
                {segmentCount > 0 ? (
                  <span className="bcs-status bcs-status--complete">{segmentCount} defined</span>
                ) : (
                  <button className="bcs-link-btn" onClick={() => onNavigate?.('market')}>Add</button>
                )}
              </div>
              {segmentCount > 0 ? (
                <div className="bcs-segments-list">
                  {exploreData.customer_segments?.map((seg, i) => (
                    <div key={i} className="bcs-segment-item">
                      <span className="bcs-segment-name">{seg.name}</span>
                      <span className={`bcs-segment-priority priority-${seg.priority?.toLowerCase() || 'medium'}`}>
                        {seg.priority || 'Medium'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="bcs-evidence-empty">No customer segments defined yet</p>
              )}
            </div>

            {/* Assessment Score Card */}
            <div className="bcs-evidence-card bcs-evidence-card--score">
              <div className="bcs-evidence-card-header">
                <span className="bcs-evidence-label">Strategic Assessment</span>
                {assessmentScore !== null ? (
                  <span className="bcs-status bcs-status--complete">Scored</span>
                ) : (
                  <button className="bcs-link-btn" onClick={() => onNavigate?.('assess')}>Add</button>
                )}
              </div>
              {assessmentScore !== null ? (
                <div className="bcs-score-display">
                  <div className={`bcs-score-circle ${assessmentScore >= 70 ? 'high' : assessmentScore >= 50 ? 'medium' : 'low'}`}>
                    <span className="bcs-score-value">{assessmentScore}</span>
                    <span className="bcs-score-unit">%</span>
                  </div>
                  <div className="bcs-score-breakdown">
                    {Object.entries(BPS_SCORING_CRITERIA).slice(0, 3).map(([key, criteria]) => {
                      const scoreData = assessData[key];
                      const pct = scoreData?.score ? Math.round((scoreData.score / criteria.maxScore) * 100) : 0;
                      return (
                        <div key={key} className="bcs-score-row">
                          <span className="bcs-score-row-label">{criteria.name}</span>
                          <div className="bcs-score-row-bar">
                            <div className="bcs-score-row-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="bcs-score-row-value">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="bcs-evidence-empty">Assessment not yet completed</p>
              )}
            </div>

            {/* Porter's Forces Summary (if available) */}
            {hasPorters && (
              <div className="bcs-evidence-card bcs-evidence-card--porters">
                <div className="bcs-evidence-card-header">
                  <span className="bcs-evidence-label">Industry Forces (Porter's)</span>
                </div>
                <div className="bcs-porters-grid">
                  {Object.entries(exploreData.porters_forces || {}).map(([force, data]) => (
                    <div key={force} className={`bcs-porter-item level-${data.level || 'medium'}`}>
                      <span className="bcs-porter-force">{force.replace(/_/g, ' ')}</span>
                      <span className="bcs-porter-level">{data.level || 'medium'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION: Financial Case */}
        <section className="bcs-section">
          <div className="bcs-section-header">
            <span className="bcs-section-number">02</span>
            <h2 className="bcs-section-title">Financial Case</h2>
            <p className="bcs-section-desc">Investment requirements, revenue projections, and calculated returns</p>
          </div>

          <div className="bcs-financial-layout">
            {/* Inputs Panel */}
            <div className="bcs-financial-inputs">
              <div className="bcs-input-group">
                <label className="bcs-input-label">Initial Investment</label>
                <div className="bcs-input-wrapper">
                  <span className="bcs-input-prefix">$</span>
                  <input
                    type="number"
                    className="bcs-input"
                    value={businessCase.investment_required || ''}
                    onChange={(e) => handleChange('investment_required', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <span className="bcs-input-hint">One-time setup & launch costs</span>
              </div>

              <div className="bcs-input-group">
                <label className="bcs-input-label">Annual Operating Cost</label>
                <div className="bcs-input-wrapper">
                  <span className="bcs-input-prefix">$</span>
                  <input
                    type="number"
                    className="bcs-input"
                    value={businessCase.annual_operating_cost || ''}
                    onChange={(e) => handleChange('annual_operating_cost', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <span className="bcs-input-hint">Recurring yearly costs</span>
              </div>

              <div className="bcs-input-group">
                <label className="bcs-input-label">Discount Rate</label>
                <div className="bcs-input-wrapper">
                  <input
                    type="number"
                    className="bcs-input bcs-input--narrow"
                    value={businessCase.discount_rate || ''}
                    onChange={(e) => handleChange('discount_rate', parseFloat(e.target.value) || 10)}
                    min="0"
                    max="100"
                  />
                  <span className="bcs-input-suffix">%</span>
                </div>
                <span className="bcs-input-hint">Typically 8-15% corporate</span>
              </div>

              <div className="bcs-revenue-years">
                <label className="bcs-input-label">5-Year Revenue Projections</label>
                <div className="bcs-year-inputs">
                  {[1, 2, 3, 4, 5].map(year => (
                    <div key={year} className="bcs-year-input">
                      <span className="bcs-year-label">Y{year}</span>
                      <div className="bcs-input-wrapper bcs-input-wrapper--compact">
                        <span className="bcs-input-prefix">$</span>
                        <input
                          type="number"
                          className="bcs-input"
                          value={businessCase[`year${year}_revenue`] || ''}
                          onChange={(e) => handleChange(`year${year}_revenue`, parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Dashboard */}
            <div className="bcs-financial-results">
              <div className="bcs-metrics-grid">
                <div className={`bcs-metric-card ${financials.npv > 0 ? 'positive' : financials.npv < 0 ? 'negative' : ''}`}>
                  <span className="bcs-metric-label">NPV</span>
                  <span className="bcs-metric-value">{formatCurrency(financials.npv)}</span>
                  <span className="bcs-metric-verdict">
                    {financials.npv > 0 ? 'Creates value' : financials.npv < 0 ? 'Destroys value' : 'Break-even'}
                  </span>
                </div>

                <div className={`bcs-metric-card ${financials.irr > businessCase.discount_rate ? 'positive' : 'negative'}`}>
                  <span className="bcs-metric-label">IRR</span>
                  <span className="bcs-metric-value">{formatPercentage(financials.irr / 100)}</span>
                  <span className="bcs-metric-verdict">
                    {financials.irr > businessCase.discount_rate ? 'Exceeds hurdle' : 'Below hurdle'}
                  </span>
                </div>

                <div className={`bcs-metric-card ${financials.payback <= 3 ? 'positive' : financials.payback <= 5 ? 'neutral' : 'negative'}`}>
                  <span className="bcs-metric-label">Payback</span>
                  <span className="bcs-metric-value">
                    {financials.payback !== Infinity ? `${financials.payback.toFixed(1)}yr` : 'Never'}
                  </span>
                  <span className="bcs-metric-verdict">
                    {financials.payback <= 3 ? 'Quick' : financials.payback <= 5 ? 'Moderate' : 'Long'}
                  </span>
                </div>

                <div className={`bcs-metric-card ${financials.bcr > 1 ? 'positive' : 'negative'}`}>
                  <span className="bcs-metric-label">BCR</span>
                  <span className="bcs-metric-value">{financials.bcr.toFixed(2)}x</span>
                  <span className="bcs-metric-verdict">
                    {financials.bcr > 1 ? 'Benefits > Costs' : 'Costs > Benefits'}
                  </span>
                </div>
              </div>

              <div className="bcs-financial-summary">
                <div className="bcs-summary-row">
                  <span>Total 5-Year Revenue</span>
                  <span className="bcs-summary-value">{formatCurrency(financials.totalRevenue)}</span>
                </div>
                <div className="bcs-summary-row">
                  <span>Total 5-Year Cost</span>
                  <span className="bcs-summary-value">{formatCurrency(financials.totalCost)}</span>
                </div>
                <div className="bcs-summary-row bcs-summary-row--total">
                  <span>Net Profit</span>
                  <span className={`bcs-summary-value ${financials.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(financials.totalProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assumptions */}
          <div className="bcs-assumptions">
            <label className="bcs-input-label">Key Assumptions</label>
            <textarea
              className="bcs-textarea"
              value={businessCase.key_assumptions}
              onChange={(e) => handleChange('key_assumptions', e.target.value)}
              placeholder="Document the assumptions underlying these projections (market growth, pricing, adoption rates, etc.)"
              rows={3}
            />
          </div>
        </section>

        {/* SECTION: Implementation Plan */}
        <section className="bcs-section">
          <div className="bcs-section-header">
            <span className="bcs-section-number">03</span>
            <h2 className="bcs-section-title">Implementation Plan</h2>
            <p className="bcs-section-desc">Timeline, resources, dependencies, and risk management</p>
          </div>

          <div className="bcs-implementation-grid">
            {/* Timeline & Milestones */}
            <div className="bcs-impl-card">
              <div className="bcs-impl-card-header">
                <ScheduleIcon />
                <h3>Timeline & Milestones</h3>
              </div>
              <textarea
                className="bcs-textarea"
                value={businessCase.implementation_timeline}
                onChange={(e) => handleChange('implementation_timeline', e.target.value)}
                placeholder="High-level implementation timeline and phases..."
                rows={2}
              />
              <div className="bcs-milestones">
                {(businessCase.key_milestones || []).map((ms, idx) => (
                  <div key={idx} className="bcs-milestone-row">
                    <input
                      type="text"
                      className="bcs-input bcs-input--milestone"
                      value={ms.name}
                      onChange={(e) => handleMilestoneChange(idx, 'name', e.target.value)}
                      placeholder="Milestone"
                    />
                    <input
                      type="text"
                      className="bcs-input bcs-input--date"
                      value={ms.date}
                      onChange={(e) => handleMilestoneChange(idx, 'date', e.target.value)}
                      placeholder="Date"
                    />
                    <button className="bcs-remove-btn" onClick={() => removeMilestone(idx)}>×</button>
                  </div>
                ))}
                <button className="bcs-add-btn" onClick={addMilestone}>+ Add milestone</button>
              </div>
            </div>

            {/* Resources */}
            <div className="bcs-impl-card">
              <div className="bcs-impl-card-header">
                <GroupsIcon />
                <h3>Resource Requirements</h3>
              </div>
              <textarea
                className="bcs-textarea"
                value={businessCase.resource_requirements}
                onChange={(e) => handleChange('resource_requirements', e.target.value)}
                placeholder="Team members, skills, tools, budget allocations..."
                rows={4}
              />
            </div>

            {/* Dependencies */}
            <div className="bcs-impl-card">
              <div className="bcs-impl-card-header">
                <InsightsIcon />
                <h3>Dependencies</h3>
              </div>
              <textarea
                className="bcs-textarea"
                value={businessCase.dependencies}
                onChange={(e) => handleChange('dependencies', e.target.value)}
                placeholder="Prerequisites, other projects, systems, approvals required..."
                rows={4}
              />
            </div>

            {/* Risks */}
            <div className="bcs-impl-card bcs-impl-card--wide">
              <div className="bcs-impl-card-header">
                <WarningAmberIcon />
                <h3>Risks & Mitigations</h3>
              </div>
              <div className="bcs-risks">
                {(businessCase.risks || []).map((risk, idx) => (
                  <div key={idx} className="bcs-risk-row">
                    <input
                      type="text"
                      className="bcs-input bcs-input--risk"
                      value={risk.description}
                      onChange={(e) => handleRiskChange(idx, 'description', e.target.value)}
                      placeholder="Risk description"
                    />
                    <select
                      className="bcs-select"
                      value={risk.likelihood}
                      onChange={(e) => handleRiskChange(idx, 'likelihood', e.target.value)}
                    >
                      <option value="low">Low likelihood</option>
                      <option value="medium">Medium</option>
                      <option value="high">High likelihood</option>
                    </select>
                    <select
                      className="bcs-select"
                      value={risk.impact}
                      onChange={(e) => handleRiskChange(idx, 'impact', e.target.value)}
                    >
                      <option value="low">Low impact</option>
                      <option value="medium">Medium</option>
                      <option value="high">High impact</option>
                    </select>
                    <input
                      type="text"
                      className="bcs-input bcs-input--mitigation"
                      value={risk.mitigation}
                      onChange={(e) => handleRiskChange(idx, 'mitigation', e.target.value)}
                      placeholder="Mitigation strategy"
                    />
                    <button className="bcs-remove-btn" onClick={() => removeRisk(idx)}>×</button>
                  </div>
                ))}
                <button className="bcs-add-btn" onClick={addRisk}>+ Add risk</button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: Recommendation */}
        <section className="bcs-section bcs-section--recommendation">
          <div className="bcs-section-header">
            <span className="bcs-section-number">04</span>
            <h2 className="bcs-section-title">Recommendation</h2>
            <p className="bcs-section-desc">Final assessment and path forward</p>
          </div>

          {/* Executive Summary */}
          <div className="bcs-executive-summary">
            <label className="bcs-input-label">Executive Summary</label>
            <textarea
              className="bcs-textarea bcs-textarea--executive"
              value={businessCase.executive_summary}
              onChange={(e) => handleChange('executive_summary', e.target.value)}
              placeholder="Write a concise summary for decision makers: the opportunity, key findings, financial case, and your recommendation..."
              rows={5}
            />
          </div>

          {/* Recommendation Selector */}
          <div className="bcs-recommendation-selector">
            <label className="bcs-input-label">Recommendation</label>
            <div className="bcs-rec-options">
              {RECOMMENDATIONS.map(rec => {
                const Icon = rec.icon;
                const isSelected = businessCase.recommendation === rec.id;
                return (
                  <button
                    key={rec.id}
                    className={`bcs-rec-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleChange('recommendation', rec.id)}
                    style={{ '--rec-color': rec.color }}
                  >
                    <Icon className="bcs-rec-icon" />
                    <span className="bcs-rec-label">{rec.label}</span>
                    <span className="bcs-rec-desc">{rec.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rationale */}
          <div className="bcs-rationale">
            <label className="bcs-input-label">Rationale</label>
            <textarea
              className="bcs-textarea"
              value={businessCase.recommendation_rationale}
              onChange={(e) => handleChange('recommendation_rationale', e.target.value)}
              placeholder="Explain why you're making this recommendation..."
              rows={4}
            />
          </div>

          {/* Conditions (if proceed) */}
          {businessCase.recommendation === 'proceed' && (
            <div className="bcs-conditions">
              <label className="bcs-input-label">Conditions for Approval (Optional)</label>
              <textarea
                className="bcs-textarea"
                value={businessCase.conditions}
                onChange={(e) => handleChange('conditions', e.target.value)}
                placeholder="Any conditions that must be met before proceeding?"
                rows={2}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="bcs-actions">
            <button className="btn btn--secondary" onClick={() => onNavigate?.('overview')}>
              Back to Overview
            </button>
            <button
              className="btn btn--primary"
              onClick={() => onNavigate?.('approval')}
              disabled={!businessCase.recommendation}
            >
              Submit for Approval
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
