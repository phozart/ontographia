// components/spaces/blueprint/decision/ApprovalStudio.js
// Unified Approval Canvas - Initiative-level approval workflow
// Reviews business case and records gate decision

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  useBlueprint,
  formatCurrency,
  formatPercentage,
  BPS_STAGE_INFO,
  BPS_SCORING_CRITERIA,
} from '../BlueprintContext';
import { calculateNPV, calculateIRR, calculatePayback, BPS_STAGES, BPS_STAGE_INFO as STAGE_INFO_TYPES } from '../../../../lib/blueprint-types';

// MUI Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import CancelIcon from '@mui/icons-material/Cancel';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupsIcon from '@mui/icons-material/Groups';
import LinkIcon from '@mui/icons-material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplayIcon from '@mui/icons-material/Replay';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';

// Approval status configurations (5-state model)
const APPROVAL_STATUSES = {
  pending: { label: 'Pending Review', color: '#C9A227', icon: GavelIcon },
  approved: { label: 'Go', color: '#5B8A6A', icon: CheckCircleIcon },
  conditional_go: { label: 'Conditional Go', color: '#C9A227', icon: ChecklistRtlIcon },
  hold: { label: 'Hold', color: '#6B6965', icon: PauseCircleIcon },
  recycle: { label: 'Recycle', color: '#0284c7', icon: ReplayIcon },
  declined: { label: 'Kill', color: '#A54D4D', icon: CancelIcon },
  // Legacy mappings
  rejected: { label: 'Kill', color: '#A54D4D', icon: CancelIcon },
  deferred: { label: 'Hold', color: '#6B6965', icon: PauseCircleIcon },
};

// 5-state gate decision options
const DECISION_OPTIONS = [
  { id: 'approved', label: 'Go', icon: CheckCircleIcon, color: '#5B8A6A', desc: 'Proceed to delivery' },
  { id: 'conditional_go', label: 'Conditional Go', icon: ChecklistRtlIcon, color: '#C9A227', desc: 'Proceed with conditions' },
  { id: 'hold', label: 'Hold', icon: PauseCircleIcon, color: '#6B6965', desc: 'Pause for more information' },
  { id: 'recycle', label: 'Recycle', icon: ReplayIcon, color: '#0284c7', desc: 'Return to earlier stage' },
  { id: 'declined', label: 'Kill', icon: CancelIcon, color: '#A54D4D', desc: 'Do not proceed' },
];

// Stages available for recycle target (exclude terminal and approval stages)
const RECYCLABLE_STAGES = BPS_STAGES.filter(s => !['approval', 'approved', 'declined'].includes(s));

export default function ApprovalStudio({ onNavigate }) {
  const {
    activeInitiative,
    initiatives,
    updateInitiative,
    submitGateDecision,
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
  const approvalData = initiative?.approval || {};

  // Local state for approval
  const [approval, setApproval] = useState(() => ({
    status: approvalData.status || 'pending',
    decision: approvalData.decision || '',
    approver_name: approvalData.approver_name || '',
    approver_role: approvalData.approver_role || '',
    decision_date: approvalData.decision_date || '',
    allocated_budget: approvalData.allocated_budget || caseData.investment_required || 0,
    sponsor: approvalData.sponsor || '',
    conditions: approvalData.conditions || caseData.conditions || '',
    rejection_reason: approvalData.rejection_reason || '',
    deferral_reason: approvalData.deferral_reason || '',
    review_notes: approvalData.review_notes || '',
    history: approvalData.history || [],
  }));

  // State for conditional go conditions and recycle target
  const [conditionsText, setConditionsText] = useState('');
  const [recycleTarget, setRecycleTarget] = useState('explore');

  // Existing conditions for conditional_go initiatives
  const existingConditions = useMemo(() => {
    const gov = initiative?.governance_data || initiative?.governance || {};
    return gov.conditions || [];
  }, [initiative]);

  // Sync from initiative when it changes
  useEffect(() => {
    if (initiative?.approval) {
      isInitialMount.current = true;
      setApproval(prev => ({
        ...prev,
        status: initiative.approval.status || prev.status,
        decision: initiative.approval.decision || prev.decision,
        approver_name: initiative.approval.approver_name || prev.approver_name,
        approver_role: initiative.approval.approver_role || prev.approver_role,
        decision_date: initiative.approval.decision_date || prev.decision_date,
        allocated_budget: initiative.approval.allocated_budget ?? prev.allocated_budget,
        sponsor: initiative.approval.sponsor || prev.sponsor,
        conditions: initiative.approval.conditions || prev.conditions,
        rejection_reason: initiative.approval.rejection_reason || prev.rejection_reason,
        deferral_reason: initiative.approval.deferral_reason || prev.deferral_reason,
        review_notes: initiative.approval.review_notes || prev.review_notes,
        history: initiative.approval.history || prev.history,
      }));
    }
  }, [initiative?.approval]);

  // Auto-save approval data
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!initiative?.id) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      updateInitiative(initiative.id, { approval });
    }, 800);
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [approval, initiative?.id, updateInitiative]);

  // Calculate financials from case data
  const financials = useMemo(() => {
    if (!caseData.investment_required) return null;
    const cashFlows = [
      -caseData.investment_required,
      (caseData.year1_revenue || 0) - (caseData.annual_operating_cost || 0),
      (caseData.year2_revenue || 0) - (caseData.annual_operating_cost || 0),
      (caseData.year3_revenue || 0) - (caseData.annual_operating_cost || 0),
      (caseData.year4_revenue || 0) - (caseData.annual_operating_cost || 0),
      (caseData.year5_revenue || 0) - (caseData.annual_operating_cost || 0),
    ];
    const totalRevenue = (caseData.year1_revenue || 0) + (caseData.year2_revenue || 0) +
                         (caseData.year3_revenue || 0) + (caseData.year4_revenue || 0) +
                         (caseData.year5_revenue || 0);
    const totalCost = caseData.investment_required + ((caseData.annual_operating_cost || 0) * 5);
    return {
      npv: calculateNPV(cashFlows, (caseData.discount_rate || 10) / 100),
      irr: calculateIRR(cashFlows),
      payback: calculatePayback(cashFlows),
      bcr: totalCost > 0 ? totalRevenue / totalCost : 0,
      totalRevenue,
      totalCost,
      investment: caseData.investment_required,
    };
  }, [caseData]);

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

  // Derived data
  const recommendation = caseData.recommendation;
  const recommendationConfig = {
    proceed: { label: 'Proceed', color: '#5B8A6A', icon: RocketLaunchIcon },
    pivot: { label: 'Pivot', color: '#C9A227', icon: SwapHorizIcon },
    pause: { label: 'Pause', color: '#6B6965', icon: PauseCircleIcon },
    kill: { label: 'Kill', color: '#A54D4D', icon: CancelIcon },
  };
  const recConfig = recommendationConfig[recommendation];

  // Check if business case is complete enough for approval
  const caseCompleteness = useMemo(() => {
    const checks = {
      hasExecutiveSummary: !!caseData.executive_summary,
      hasFinancials: !!(caseData.investment_required && caseData.year1_revenue),
      hasRecommendation: !!caseData.recommendation,
      hasRationale: !!caseData.recommendation_rationale,
    };
    const completed = Object.values(checks).filter(Boolean).length;
    return { checks, completed, total: Object.keys(checks).length, percentage: Math.round((completed / Object.keys(checks).length) * 100) };
  }, [caseData]);

  // Handler functions
  const handleChange = useCallback((field, value) => {
    setApproval(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleRecordDecision = useCallback(async (decision) => {
    if (!initiative?.id) return;

    // Build conditions array for conditional_go
    const conditions = decision === 'conditional_go' && conditionsText
      ? conditionsText.split('\n').map(c => c.trim()).filter(Boolean)
      : decision === 'approved' && approval.conditions
        ? [approval.conditions]
        : undefined;

    // Submit gate decision via advance API
    const result = await submitGateDecision(initiative.id, {
      decision,
      notes: approval.review_notes || undefined,
      conditions,
      targetStage: decision === 'recycle' ? recycleTarget : undefined,
      forceAdvance: false,
    });

    if (result) {
      const now = new Date().toISOString();
      const historyEntry = {
        decision,
        date: now,
        approver: approval.approver_name || 'Unknown',
        role: approval.approver_role || '',
        notes: approval.review_notes,
        conditions: conditions ? conditions.join('; ') : null,
        reason: decision === 'declined' ? approval.rejection_reason :
                decision === 'hold' ? approval.deferral_reason : null,
      };

      setApproval(prev => ({
        ...prev,
        status: decision,
        decision,
        decision_date: now,
        history: [historyEntry, ...(prev.history || [])],
      }));
    }
  }, [initiative?.id, approval, conditionsText, recycleTarget, submitGateDecision]);

  if (!initiative) {
    return (
      <div className="approval-studio-empty">
        <GavelIcon className="approval-studio-empty-icon" />
        <h3>No Initiative Selected</h3>
        <p>Select an initiative to review and approve</p>
        <button className="btn btn--secondary" onClick={() => onNavigate?.('overview')}>
          View Initiatives
        </button>
      </div>
    );
  }

  const statusConfig = APPROVAL_STATUSES[approval.status] || APPROVAL_STATUSES.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="approval-studio">
      {/* Header */}
      <header className="approval-studio-header">
        <div className="approval-studio-header-main">
          <button className="approval-studio-back" onClick={() => onNavigate?.('case')}>
            <ArrowBackIcon /> Back to Business Case
          </button>
          <div className="approval-studio-header-badge">APPROVAL REVIEW</div>
          <h1 className="approval-studio-header-title">{initiative.name}</h1>
          <p className="approval-studio-header-subtitle">
            {ideaData.problem_statement || 'Review the business case and record your decision'}
          </p>
        </div>
        <div className="approval-studio-header-meta">
          <div className={`approval-studio-status status-${approval.status}`}>
            <StatusIcon />
            <span>{statusConfig.label}</span>
          </div>
          <span className="approval-studio-save-status">
            {saving ? 'Saving...' : <><CheckCircleIcon /> Auto-saved</>}
          </span>
        </div>
      </header>

      {/* Canvas */}
      <div className="approval-studio-canvas">
        {/* SECTION: Business Case Summary */}
        <section className="approval-section">
          <div className="approval-section-header">
            <span className="approval-section-number">01</span>
            <h2 className="approval-section-title">Business Case Summary</h2>
            <p className="approval-section-desc">Key information from the business case for your review</p>
          </div>

          {/* Case Completeness */}
          <div className="approval-completeness">
            <div className="approval-completeness-header">
              <span>Case Completeness</span>
              <span className={`approval-completeness-pct ${caseCompleteness.percentage >= 75 ? 'good' : caseCompleteness.percentage >= 50 ? 'partial' : 'low'}`}>
                {caseCompleteness.percentage}%
              </span>
            </div>
            <div className="approval-completeness-bar">
              <div
                className="approval-completeness-fill"
                style={{ width: `${caseCompleteness.percentage}%` }}
              />
            </div>
            {caseCompleteness.percentage < 100 && (
              <p className="approval-completeness-warning">
                <WarningAmberIcon /> Some business case sections are incomplete
              </p>
            )}
          </div>

          {/* Executive Summary */}
          <div className="approval-summary-card">
            <div className="approval-summary-card-header">
              <DescriptionIcon />
              <h3>Executive Summary</h3>
            </div>
            {caseData.executive_summary ? (
              <p className="approval-executive-text">{caseData.executive_summary}</p>
            ) : (
              <p className="approval-empty-text">No executive summary provided</p>
            )}
          </div>

          {/* Key Metrics Row */}
          <div className="approval-metrics-row">
            {/* Market */}
            <div className="approval-metric-box">
              <TrendingUpIcon />
              <div className="approval-metric-content">
                <span className="approval-metric-label">Target Market (SOM)</span>
                <span className="approval-metric-value">
                  {formatCurrency(exploreData.market_sizing?.som || 0)}
                </span>
              </div>
            </div>

            {/* Assessment Score */}
            <div className="approval-metric-box">
              <AssessmentIcon />
              <div className="approval-metric-content">
                <span className="approval-metric-label">Assessment Score</span>
                <span className={`approval-metric-value ${assessmentScore >= 70 ? 'high' : assessmentScore >= 50 ? 'medium' : 'low'}`}>
                  {assessmentScore !== null ? `${assessmentScore}%` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Competitors */}
            <div className="approval-metric-box">
              <GroupsIcon />
              <div className="approval-metric-content">
                <span className="approval-metric-label">Competitors</span>
                <span className="approval-metric-value">
                  {exploreData.competitors?.length || 0}
                </span>
              </div>
            </div>

            {/* Recommendation */}
            <div className="approval-metric-box approval-metric-box--recommendation" style={{ '--rec-color': recConfig?.color || '#6B6965' }}>
              {recConfig && <recConfig.icon />}
              <div className="approval-metric-content">
                <span className="approval-metric-label">Recommendation</span>
                <span className="approval-metric-value" style={{ color: recConfig?.color }}>
                  {recConfig?.label || 'Not Set'}
                </span>
              </div>
            </div>
          </div>

          {/* Rationale */}
          {caseData.recommendation_rationale && (
            <div className="approval-rationale">
              <h4>Recommendation Rationale</h4>
              <p>{caseData.recommendation_rationale}</p>
            </div>
          )}
        </section>

        {/* SECTION: Financial Summary */}
        <section className="approval-section">
          <div className="approval-section-header">
            <span className="approval-section-number">02</span>
            <h2 className="approval-section-title">Financial Summary</h2>
            <p className="approval-section-desc">Investment requirements and projected returns</p>
          </div>

          {financials ? (
            <div className="approval-financial-grid">
              <div className="approval-financial-card">
                <span className="approval-financial-label">Investment Required</span>
                <span className="approval-financial-value">{formatCurrency(financials.investment)}</span>
              </div>
              <div className={`approval-financial-card ${financials.npv > 0 ? 'positive' : 'negative'}`}>
                <span className="approval-financial-label">NPV</span>
                <span className="approval-financial-value">{formatCurrency(financials.npv)}</span>
                <span className="approval-financial-verdict">
                  {financials.npv > 0 ? 'Creates value' : 'Destroys value'}
                </span>
              </div>
              <div className={`approval-financial-card ${financials.irr > (caseData.discount_rate || 10) ? 'positive' : 'negative'}`}>
                <span className="approval-financial-label">IRR</span>
                <span className="approval-financial-value">{formatPercentage(financials.irr / 100)}</span>
                <span className="approval-financial-verdict">
                  {financials.irr > (caseData.discount_rate || 10) ? 'Exceeds hurdle' : 'Below hurdle'}
                </span>
              </div>
              <div className={`approval-financial-card ${financials.payback <= 3 ? 'positive' : financials.payback <= 5 ? 'neutral' : 'negative'}`}>
                <span className="approval-financial-label">Payback</span>
                <span className="approval-financial-value">
                  {financials.payback !== Infinity ? `${financials.payback.toFixed(1)} years` : 'Never'}
                </span>
              </div>
              <div className={`approval-financial-card ${financials.bcr > 1 ? 'positive' : 'negative'}`}>
                <span className="approval-financial-label">BCR</span>
                <span className="approval-financial-value">{financials.bcr.toFixed(2)}x</span>
              </div>
              <div className="approval-financial-card">
                <span className="approval-financial-label">5-Year Revenue</span>
                <span className="approval-financial-value">{formatCurrency(financials.totalRevenue)}</span>
              </div>
            </div>
          ) : (
            <div className="approval-empty-state">
              <AttachMoneyIcon />
              <p>No financial projections available</p>
              <button className="btn btn--secondary btn--sm" onClick={() => onNavigate?.('case')}>
                Complete Financial Case
              </button>
            </div>
          )}

          {/* Key Assumptions */}
          {caseData.key_assumptions && (
            <div className="approval-assumptions">
              <h4>Key Assumptions</h4>
              <p>{caseData.key_assumptions}</p>
            </div>
          )}
        </section>

        {/* SECTION: Risks & Conditions */}
        {(caseData.risks?.length > 0 || caseData.conditions) && (
          <section className="approval-section">
            <div className="approval-section-header">
              <span className="approval-section-number">03</span>
              <h2 className="approval-section-title">Risks & Conditions</h2>
              <p className="approval-section-desc">Identified risks and conditions for approval</p>
            </div>

            {caseData.risks?.length > 0 && (
              <div className="approval-risks">
                <h4>Identified Risks</h4>
                <div className="approval-risks-list">
                  {caseData.risks.map((risk, idx) => (
                    <div key={idx} className={`approval-risk-item impact-${risk.impact || 'medium'}`}>
                      <div className="approval-risk-header">
                        <WarningAmberIcon />
                        <span className="approval-risk-desc">{risk.description}</span>
                      </div>
                      <div className="approval-risk-meta">
                        <span className={`approval-risk-level likelihood-${risk.likelihood}`}>
                          {risk.likelihood} likelihood
                        </span>
                        <span className={`approval-risk-level impact-${risk.impact}`}>
                          {risk.impact} impact
                        </span>
                      </div>
                      {risk.mitigation && (
                        <p className="approval-risk-mitigation">
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {caseData.conditions && (
              <div className="approval-conditions-from-case">
                <h4>Proposed Conditions</h4>
                <p>{caseData.conditions}</p>
              </div>
            )}
          </section>
        )}

        {/* SECTION: Record Decision */}
        <section className="approval-section approval-section--decision">
          <div className="approval-section-header">
            <span className="approval-section-number">{caseData.risks?.length > 0 || caseData.conditions ? '04' : '03'}</span>
            <h2 className="approval-section-title">Record Decision</h2>
            <p className="approval-section-desc">Review complete - record your approval decision</p>
          </div>

          {/* Approver Info */}
          <div className="approval-approver-info">
            <div className="approval-input-group">
              <label className="approval-input-label">Your Name</label>
              <input
                type="text"
                className="approval-input"
                value={approval.approver_name}
                onChange={(e) => handleChange('approver_name', e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="approval-input-group">
              <label className="approval-input-label">Role / Title</label>
              <input
                type="text"
                className="approval-input"
                value={approval.approver_role}
                onChange={(e) => handleChange('approver_role', e.target.value)}
                placeholder="e.g., Head of Product, CFO"
              />
            </div>
          </div>

          {/* Decision Selector */}
          <div className="approval-decision-selector">
            <label className="approval-input-label">Decision</label>
            <div className="approval-decision-options">
              {DECISION_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = approval.decision === opt.id;
                return (
                  <button
                    key={opt.id}
                    className={`approval-decision-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleChange('decision', opt.id)}
                    style={{ '--decision-color': opt.color }}
                  >
                    <Icon className="approval-decision-icon" />
                    <span className="approval-decision-label">{opt.label}</span>
                    <span className="approval-decision-desc">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional fields based on decision */}
          {approval.decision === 'approved' && (
            <div className="approval-approved-fields">
              <div className="approval-input-row">
                <div className="approval-input-group">
                  <label className="approval-input-label">Allocated Budget</label>
                  <div className="approval-input-wrapper">
                    <span className="approval-input-prefix">$</span>
                    <input
                      type="number"
                      className="approval-input"
                      value={approval.allocated_budget || ''}
                      onChange={(e) => handleChange('allocated_budget', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="approval-input-group">
                  <label className="approval-input-label">Executive Sponsor</label>
                  <input
                    type="text"
                    className="approval-input"
                    value={approval.sponsor}
                    onChange={(e) => handleChange('sponsor', e.target.value)}
                    placeholder="Assign sponsor"
                  />
                </div>
              </div>
              <div className="approval-input-group">
                <label className="approval-input-label">Conditions of Approval (Optional)</label>
                <textarea
                  className="approval-textarea"
                  value={approval.conditions}
                  onChange={(e) => handleChange('conditions', e.target.value)}
                  placeholder="Any conditions attached to this approval..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {approval.decision === 'conditional_go' && (
            <div className="approval-conditional-fields">
              <div className="approval-input-row">
                <div className="approval-input-group">
                  <label className="approval-input-label">Allocated Budget</label>
                  <div className="approval-input-wrapper">
                    <span className="approval-input-prefix">$</span>
                    <input
                      type="number"
                      className="approval-input"
                      value={approval.allocated_budget || ''}
                      onChange={(e) => handleChange('allocated_budget', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="approval-input-group">
                  <label className="approval-input-label">Executive Sponsor</label>
                  <input
                    type="text"
                    className="approval-input"
                    value={approval.sponsor}
                    onChange={(e) => handleChange('sponsor', e.target.value)}
                    placeholder="Assign sponsor"
                  />
                </div>
              </div>
              <div className="approval-input-group">
                <label className="approval-input-label">Conditions (one per line, all must be met)</label>
                <textarea
                  className="approval-textarea"
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  placeholder={"Complete market validation with 10 customers\nSecure technical partnership agreement\nRevise unit economics to show >20% margin"}
                  rows={4}
                />
              </div>
              {conditionsText && (
                <div className="approval-conditions-preview">
                  <h4><ChecklistRtlIcon style={{ fontSize: 16 }} /> Conditions to be met:</h4>
                  <ul>
                    {conditionsText.split('\n').filter(c => c.trim()).map((c, i) => (
                      <li key={i}>{c.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {approval.decision === 'hold' && (
            <div className="approval-hold-fields">
              <div className="approval-input-group">
                <label className="approval-input-label">Reason for Hold</label>
                <textarea
                  className="approval-textarea"
                  value={approval.deferral_reason}
                  onChange={(e) => handleChange('deferral_reason', e.target.value)}
                  placeholder="What additional information or conditions need to be met before revisiting..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {approval.decision === 'recycle' && (
            <div className="approval-recycle-fields">
              <div className="approval-input-group">
                <label className="approval-input-label">Return to Stage</label>
                <select
                  className="approval-input"
                  value={recycleTarget}
                  onChange={(e) => setRecycleTarget(e.target.value)}
                >
                  {RECYCLABLE_STAGES.map(stageId => (
                    <option key={stageId} value={stageId}>
                      {STAGE_INFO_TYPES[stageId]?.name || stageId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="approval-input-group">
                <label className="approval-input-label">What needs to be reworked</label>
                <textarea
                  className="approval-textarea"
                  value={approval.review_notes}
                  onChange={(e) => handleChange('review_notes', e.target.value)}
                  placeholder="Describe what needs to be revisited in the earlier stage..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {approval.decision === 'declined' && (
            <div className="approval-rejected-fields">
              <div className="approval-input-group">
                <label className="approval-input-label">Reason for Kill</label>
                <textarea
                  className="approval-textarea"
                  value={approval.rejection_reason}
                  onChange={(e) => handleChange('rejection_reason', e.target.value)}
                  placeholder="Document why this initiative is being killed..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Review Notes */}
          <div className="approval-input-group">
            <label className="approval-input-label">Review Notes (Optional)</label>
            <textarea
              className="approval-textarea"
              value={approval.review_notes}
              onChange={(e) => handleChange('review_notes', e.target.value)}
              placeholder="Additional notes or observations from your review..."
              rows={3}
            />
          </div>

          {/* Submit Decision */}
          <div className="approval-submit">
            <button
              className={`btn btn--lg approval-submit-btn decision-${approval.decision || 'none'}`}
              onClick={() => handleRecordDecision(approval.decision)}
              disabled={!approval.decision || !approval.approver_name || saving}
              style={{ '--btn-color': DECISION_OPTIONS.find(o => o.id === approval.decision)?.color }}
            >
              <GavelIcon />
              {approval.decision === 'approved' ? 'Approve — Go' :
               approval.decision === 'conditional_go' ? 'Approve — Conditional Go' :
               approval.decision === 'hold' ? 'Place on Hold' :
               approval.decision === 'recycle' ? `Recycle to ${STAGE_INFO_TYPES[recycleTarget]?.name || recycleTarget}` :
               approval.decision === 'declined' ? 'Kill Initiative' :
               'Select a Decision'}
            </button>
          </div>
        </section>

        {/* SECTION: Decision History */}
        {approval.history?.length > 0 && (
          <section className="approval-section approval-section--history">
            <div className="approval-section-header">
              <span className="approval-section-number"><HistoryIcon /></span>
              <h2 className="approval-section-title">Decision History</h2>
              <p className="approval-section-desc">Audit trail of approval decisions</p>
            </div>

            <div className="approval-history">
              {approval.history.map((entry, idx) => {
                const entryConfig = APPROVAL_STATUSES[entry.decision] || APPROVAL_STATUSES.pending;
                const EntryIcon = entryConfig.icon;
                return (
                  <div key={idx} className={`approval-history-entry status-${entry.decision}`}>
                    <div className="approval-history-icon">
                      <EntryIcon />
                    </div>
                    <div className="approval-history-content">
                      <div className="approval-history-header">
                        <span className="approval-history-decision" style={{ color: entryConfig.color }}>
                          {entryConfig.label}
                        </span>
                        <span className="approval-history-date">
                          {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="approval-history-approver">
                        <PersonIcon /> {entry.approver} {entry.role && `(${entry.role})`}
                      </div>
                      {entry.notes && (
                        <p className="approval-history-notes">{entry.notes}</p>
                      )}
                      {entry.conditions && (
                        <p className="approval-history-conditions">
                          <strong>Conditions:</strong> {entry.conditions}
                        </p>
                      )}
                      {entry.reason && (
                        <p className="approval-history-reason">
                          <strong>Reason:</strong> {entry.reason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Conditions Tracker (for conditional_go initiatives) */}
        {existingConditions.length > 0 && (
          <section className="approval-section approval-section--conditions">
            <div className="approval-section-header">
              <span className="approval-section-number"><ChecklistRtlIcon /></span>
              <h2 className="approval-section-title">Conditions Tracker</h2>
              <p className="approval-section-desc">Conditions that must be met for full approval</p>
            </div>

            <div className="approval-conditions-tracker">
              {existingConditions.map((condition, idx) => {
                const condText = typeof condition === 'string' ? condition : condition.text || condition;
                const isMet = typeof condition === 'object' && condition.met;
                return (
                  <div key={idx} className={`approval-condition-item ${isMet ? 'met' : 'pending'}`}>
                    <div className="approval-condition-check">
                      {isMet ? <CheckCircleIcon style={{ color: '#5B8A6A' }} /> : <div className="approval-condition-circle" />}
                    </div>
                    <span className="approval-condition-text">{condText}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Downstream Actions (if approved or conditional_go) */}
        {(initiative?.stage === 'approved' || approval.status === 'approved' || approval.status === 'conditional_go') && (
          <section className="approval-section approval-section--downstream">
            <div className="approval-section-header">
              <span className="approval-section-number"><RocketLaunchIcon /></span>
              <h2 className="approval-section-title">Next Steps</h2>
              <p className="approval-section-desc">
                {initiative?.stage === 'approved'
                  ? 'Initiative approved — automatically handed off to Analysis'
                  : 'Initiative approved — proceed to delivery'}
              </p>
            </div>

            {/* Handoff indicator */}
            {initiative?.stage === 'approved' && (
              <div className="approval-handoff-banner">
                <CheckCircleIcon style={{ color: '#5B8A6A', fontSize: 20 }} />
                <div className="approval-handoff-content">
                  <strong>Handed off to Analysis Studio</strong>
                  <p>An Analysis project was automatically created with initial artefacts (stakeholder register, context summary, business need).</p>
                </div>
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={() => {
                    // Navigate to Analysis space — use cross_space_references if available
                    window.location.href = '/app/spaces/analysis/projects';
                  }}
                >
                  <LinkIcon style={{ fontSize: 14 }} /> View in Analysis
                </button>
              </div>
            )}

            <div className="approval-downstream-actions">
              <button
                className="approval-downstream-btn"
                onClick={() => window.location.href = '/app/spaces/analysis/projects'}
              >
                <LinkIcon />
                <span>Analysis Studio</span>
                <span className="approval-downstream-desc">View requirements and artefacts</span>
              </button>
              <button className="approval-downstream-btn" disabled>
                <LinkIcon />
                <span>Create Project</span>
                <span className="approval-downstream-desc">Set up delivery project</span>
              </button>
              <button className="approval-downstream-btn" disabled>
                <LinkIcon />
                <span>Add to Portfolio</span>
                <span className="approval-downstream-desc">Track in portfolio dashboard</span>
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
