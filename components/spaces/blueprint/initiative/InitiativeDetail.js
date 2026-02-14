// components/spaces/blueprint/initiative/InitiativeDetail.js
// Detailed view of a single initiative with all accumulated data

import { useMemo, useState } from 'react';
import StageIndicator, { StageBadge } from './StageIndicator';
import {
  BPS_HORIZONS,
  BPS_SCORING_CRITERIA,
  BPS_STAGE_INFO,
  BPS_STAGE_SLAS,
  calculateSLAStatus,
  checkKillCriteria,
  canAdvanceStage,
  getNextStage,
  formatCurrency,
  formatPercentage,
} from '../BlueprintContext';

// MUI Icons
import EditIcon from '@mui/icons-material/Edit';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LinkIcon from '@mui/icons-material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function InitiativeDetail({
  initiative,
  onEdit,
  onAdvanceStage,
  onDecline,
  onNavigateToStage,
}) {
  const [expandedSections, setExpandedSections] = useState({
    idea: true,
    explore: true,
    assess: true,
    case: true,
    approval: true,
    governance: false,
    links: false,
  });

  // Computed values
  const slaStatus = useMemo(() => calculateSLAStatus(initiative), [initiative]);
  const killCriteria = useMemo(() => checkKillCriteria(initiative), [initiative]);
  const canAdvance = useMemo(() => canAdvanceStage(initiative), [initiative]);
  const nextStage = useMemo(() => getNextStage(initiative.status), [initiative.status]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const stageInfo = BPS_STAGE_INFO[initiative.status];
  const horizonInfo = initiative.assess?.horizon ? BPS_HORIZONS[initiative.assess.horizon] : null;

  return (
    <div className="initiative-detail">
      {/* Header */}
      <div className="initiative-detail-header">
        <div className="initiative-detail-header-top">
          <span className="initiative-detail-id">{initiative.display_id || initiative.id}</span>
          <StageBadge stage={initiative.status} />
          {horizonInfo && (
            <span className="initiative-detail-horizon">{horizonInfo.name}</span>
          )}
          <button
            className="initiative-detail-edit-btn"
            onClick={() => onEdit?.(initiative)}
          >
            <EditIcon fontSize="small" />
            Edit
          </button>
        </div>
        <h1 className="initiative-detail-title">{initiative.name}</h1>

        {/* Stage progress */}
        <StageIndicator
          currentStage={initiative.status}
          onClick={onNavigateToStage}
        />
      </div>

      {/* Status bar */}
      <div className="initiative-detail-status-bar">
        {/* SLA status */}
        <div className={`initiative-detail-sla initiative-detail-sla--${slaStatus}`}>
          <AccessTimeIcon fontSize="small" />
          <span>SLA: {slaStatus === 'on_track' ? 'On Track' : slaStatus === 'at_risk' ? 'At Risk' : 'Breached'}</span>
        </div>

        {/* Kill criteria warning */}
        {killCriteria.length > 0 && (
          <div className="initiative-detail-warning">
            <WarningIcon fontSize="small" />
            <span>{killCriteria.length} kill {killCriteria.length === 1 ? 'criterion' : 'criteria'} met</span>
          </div>
        )}

        {/* Advance / Decline buttons */}
        {nextStage && (
          <div className="initiative-detail-actions">
            <button
              className="initiative-detail-btn initiative-detail-btn--primary"
              onClick={() => onAdvanceStage?.(initiative.id)}
              disabled={!canAdvance}
              title={canAdvance ? `Advance to ${BPS_STAGE_INFO[nextStage]?.name}` : 'Requirements not met'}
            >
              <ArrowForwardIcon fontSize="small" />
              Advance to {BPS_STAGE_INFO[nextStage]?.name}
            </button>
            <button
              className="initiative-detail-btn initiative-detail-btn--danger"
              onClick={() => onDecline?.(initiative.id)}
            >
              <CancelIcon fontSize="small" />
              Decline
            </button>
          </div>
        )}
      </div>

      {/* Kill criteria details */}
      {killCriteria.length > 0 && (
        <div className="initiative-detail-kill-criteria">
          <h4>Kill Criteria Met</h4>
          <ul>
            {killCriteria.map(criterion => (
              <li key={criterion.id} className={`kill-criterion kill-criterion--${criterion.severity}`}>
                <WarningIcon fontSize="small" />
                <span>{criterion.name}: {criterion.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Idea Section */}
      <Section
        title="Idea"
        expanded={expandedSections.idea}
        onToggle={() => toggleSection('idea')}
        status={initiative.idea?.description ? 'complete' : 'incomplete'}
      >
        {initiative.idea && (
          <div className="initiative-detail-section-content">
            <Field label="Description" value={initiative.idea.description} />
            <Field label="Problem Statement" value={initiative.idea.problem_statement} />
            <Field label="Source" value={initiative.idea.source} />
            <Field label="Submitter" value={initiative.idea.submitter} icon={<PersonIcon fontSize="small" />} />
          </div>
        )}
      </Section>

      {/* Explore Section */}
      <Section
        title="Explore - Market Research"
        expanded={expandedSections.explore}
        onToggle={() => toggleSection('explore')}
        status={initiative.explore?.market_sizing?.tam ? 'complete' : 'incomplete'}
      >
        {initiative.explore && (
          <div className="initiative-detail-section-content">
            {/* Market Sizing */}
            {initiative.explore.market_sizing && (
              <div className="initiative-detail-subsection">
                <h5>Market Sizing</h5>
                <div className="initiative-detail-metrics-grid">
                  <Metric label="TAM" value={formatCurrency(initiative.explore.market_sizing.tam)} />
                  <Metric label="SAM" value={formatCurrency(initiative.explore.market_sizing.sam)} />
                  <Metric label="SOM" value={formatCurrency(initiative.explore.market_sizing.som)} />
                </div>
                {initiative.explore.market_sizing.methodology && (
                  <Field label="Methodology" value={initiative.explore.market_sizing.methodology} />
                )}
              </div>
            )}

            {/* Competitors */}
            {initiative.explore.competitors?.length > 0 && (
              <div className="initiative-detail-subsection">
                <h5>Competitors ({initiative.explore.competitors.length})</h5>
                <ul className="initiative-detail-list">
                  {initiative.explore.competitors.map((comp, i) => (
                    <li key={i}>
                      <strong>{comp.name}</strong>
                      {comp.strengths && <span className="text-success"> + {comp.strengths}</span>}
                      {comp.weaknesses && <span className="text-danger"> - {comp.weaknesses}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Customer Validation */}
            {initiative.explore.customer_validation?.length > 0 && (
              <div className="initiative-detail-subsection">
                <h5>Customer Validation</h5>
                <ul className="initiative-detail-list">
                  {initiative.explore.customer_validation.map((v, i) => (
                    <li key={i}>
                      {v.finding} <span className="text-muted">({v.source}, {v.confidence} confidence)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Assess Section */}
      <Section
        title="Assess - Scoring"
        expanded={expandedSections.assess}
        onToggle={() => toggleSection('assess')}
        status={initiative.assess?.overall_score !== undefined ? 'complete' : 'incomplete'}
      >
        {initiative.assess && (
          <div className="initiative-detail-section-content">
            {/* Overall Score */}
            <div className="initiative-detail-score-summary">
              <div className="initiative-detail-score-main">
                <span className="initiative-detail-score-value">{initiative.assess.overall_score || 0}%</span>
                <span className="initiative-detail-score-label">Overall Score</span>
              </div>
              {initiative.assess.recommendation && (
                <div className="initiative-detail-recommendation">
                  Recommendation: <strong>{initiative.assess.recommendation}</strong>
                </div>
              )}
            </div>

            {/* Individual Scores */}
            <div className="initiative-detail-scores-grid">
              {Object.entries(BPS_SCORING_CRITERIA).map(([key, criteria]) => {
                const score = initiative.assess[key];
                return (
                  <div key={key} className="initiative-detail-score-item">
                    <div className="initiative-detail-score-header">
                      <span>{criteria.name}</span>
                      <span>{score?.score || 0}/{criteria.maxScore}</span>
                    </div>
                    <div className="initiative-detail-score-bar">
                      <div
                        className="initiative-detail-score-fill"
                        style={{ width: `${((score?.score || 0) / criteria.maxScore) * 100}%` }}
                      />
                    </div>
                    {score?.rationale && (
                      <p className="initiative-detail-score-rationale">{score.rationale}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Horizon */}
            {initiative.assess.horizon && (
              <Field label="Horizon" value={BPS_HORIZONS[initiative.assess.horizon]?.name} />
            )}
          </div>
        )}
      </Section>

      {/* Case Section */}
      <Section
        title="Business Case"
        expanded={expandedSections.case}
        onToggle={() => toggleSection('case')}
        status={initiative.case?.financials?.npv !== undefined ? 'complete' : 'incomplete'}
      >
        {initiative.case && (
          <div className="initiative-detail-section-content">
            {initiative.case.executive_summary && (
              <Field label="Executive Summary" value={initiative.case.executive_summary} />
            )}

            {/* Financials */}
            {initiative.case.financials && (
              <div className="initiative-detail-subsection">
                <h5>Financials</h5>
                <div className="initiative-detail-metrics-grid">
                  <Metric label="Total Cost" value={formatCurrency(initiative.case.financials.total_cost)} />
                  <Metric label="Total Benefit" value={formatCurrency(initiative.case.financials.total_benefit)} />
                  <Metric label="NPV" value={formatCurrency(initiative.case.financials.npv)} />
                  <Metric label="IRR" value={formatPercentage(initiative.case.financials.irr)} />
                  <Metric label="Payback" value={initiative.case.financials.payback ? `${initiative.case.financials.payback} months` : '-'} />
                  <Metric label="BCR" value={initiative.case.financials.bcr?.toFixed(2)} />
                </div>
              </div>
            )}

            {/* Options */}
            {initiative.case.options?.length > 0 && (
              <div className="initiative-detail-subsection">
                <h5>Options ({initiative.case.options.length})</h5>
                {initiative.case.options.map((opt, i) => (
                  <div key={i} className={`initiative-detail-option ${opt.id === initiative.case.recommended_option ? 'recommended' : ''}`}>
                    <div className="initiative-detail-option-header">
                      <strong>{opt.name}</strong>
                      {opt.id === initiative.case.recommended_option && (
                        <span className="initiative-detail-recommended-badge">Recommended</span>
                      )}
                    </div>
                    <p>{opt.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Approval Section */}
      <Section
        title="Approval"
        expanded={expandedSections.approval}
        onToggle={() => toggleSection('approval')}
        status={initiative.approval?.decision ? 'complete' : 'incomplete'}
      >
        {initiative.approval && (
          <div className="initiative-detail-section-content">
            <Field label="Decision" value={initiative.approval.decision} />
            <Field label="Decision Date" value={initiative.approval.decision_date} />
            <Field label="Sponsor" value={initiative.approval.sponsor} icon={<PersonIcon fontSize="small" />} />
            {initiative.approval.conditions && (
              <Field label="Conditions" value={initiative.approval.conditions} />
            )}
            {initiative.approval.allocated_budget && (
              <Field label="Allocated Budget" value={formatCurrency(initiative.approval.allocated_budget)} />
            )}
          </div>
        )}

        {/* Handoff indicator for approved initiatives */}
        {initiative.status === 'approved' && (
          <div className="initiative-detail-handoff">
            <CheckCircleIcon fontSize="small" style={{ color: '#5B8A6A' }} />
            <span>Handed off to Analysis Studio</span>
            <a href="/app/spaces/analysis/projects" className="initiative-detail-link">
              <LinkIcon fontSize="small" /> View Analysis Project
            </a>
          </div>
        )}
      </Section>

      {/* Governance Section */}
      <Section
        title="Governance"
        expanded={expandedSections.governance}
        onToggle={() => toggleSection('governance')}
      >
        {initiative.governance && (
          <div className="initiative-detail-section-content">
            {/* Stage History */}
            {initiative.governance.stage_history?.length > 0 && (
              <div className="initiative-detail-subsection">
                <h5>Stage History</h5>
                <div className="initiative-detail-timeline">
                  {initiative.governance.stage_history.map((entry, i) => (
                    <div key={i} className="initiative-detail-timeline-item">
                      <div className="initiative-detail-timeline-dot" />
                      <div className="initiative-detail-timeline-content">
                        <strong>{BPS_STAGE_INFO[entry.stage]?.name || entry.stage}</strong>
                        <span className="text-muted">
                          Entered: {new Date(entry.entered).toLocaleDateString()}
                          {entry.exited && ` | Exited: ${new Date(entry.exited).toLocaleDateString()}`}
                        </span>
                        {entry.decision && <span>Decision: {entry.decision}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Links Section */}
      <Section
        title="Downstream Links"
        expanded={expandedSections.links}
        onToggle={() => toggleSection('links')}
      >
        {initiative.links && (
          <div className="initiative-detail-section-content">
            {initiative.links.analysis_projects?.length > 0 && (
              <div className="initiative-detail-links">
                <h5>Analysis Projects</h5>
                {initiative.links.analysis_projects.map((id, i) => (
                  <a key={i} href={`/analysis/${id}`} className="initiative-detail-link">
                    <LinkIcon fontSize="small" />
                    {id}
                  </a>
                ))}
              </div>
            )}
            {initiative.links.projects?.length > 0 && (
              <div className="initiative-detail-links">
                <h5>Delivery Projects</h5>
                {initiative.links.projects.map((id, i) => (
                  <a key={i} href={`/projects/${id}`} className="initiative-detail-link">
                    <LinkIcon fontSize="small" />
                    {id}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

// Collapsible section component
function Section({ title, expanded, onToggle, status, children }) {
  return (
    <div className={`initiative-detail-section ${expanded ? 'expanded' : ''} ${status ? `status-${status}` : ''}`}>
      <button className="initiative-detail-section-header" onClick={onToggle}>
        <span className="initiative-detail-section-title">{title}</span>
        <div className="initiative-detail-section-header-right">
          {status === 'complete' && <CheckCircleIcon fontSize="small" className="text-success" />}
          {status === 'incomplete' && <span className="initiative-detail-incomplete-badge">Incomplete</span>}
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </div>
      </button>
      {expanded && <div className="initiative-detail-section-body">{children}</div>}
    </div>
  );
}

// Field display component
function Field({ label, value, icon }) {
  if (!value) return null;
  return (
    <div className="initiative-detail-field">
      <span className="initiative-detail-field-label">{label}</span>
      <span className="initiative-detail-field-value">
        {icon}
        {value}
      </span>
    </div>
  );
}

// Metric display component
function Metric({ label, value }) {
  return (
    <div className="initiative-detail-metric">
      <span className="initiative-detail-metric-value">{value || '-'}</span>
      <span className="initiative-detail-metric-label">{label}</span>
    </div>
  );
}
