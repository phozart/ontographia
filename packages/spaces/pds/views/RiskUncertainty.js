// components/pds/views/RiskUncertainty.js
// Risk & Uncertainty - Stage 3 view for PDS workspace
// Surface and address what could go wrong

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Button, SummaryBar, SummaryItem } from '../../../ui';

// MUI Icons
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BugReportIcon from '@mui/icons-material/BugReport';
import BlockIcon from '@mui/icons-material/Block';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ShieldIcon from '@mui/icons-material/Shield';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Risk exposure colors
const RISK_EXPOSURE_COLORS = {
  critical: { color: '#dc2626', label: 'Critical', bg: 'rgba(220, 38, 38, 0.1)' },
  high: { color: '#ef4444', label: 'High', bg: 'rgba(239, 68, 68, 0.1)' },
  medium: { color: '#f59e0b', label: 'Medium', bg: 'rgba(245, 158, 11, 0.1)' },
  low: { color: '#22c55e', label: 'Low', bg: 'rgba(34, 197, 94, 0.1)' },
};

// Issue urgency colors
const ISSUE_URGENCY_COLORS = {
  critical: { color: '#dc2626', label: 'Critical', bg: 'rgba(220, 38, 38, 0.1)' },
  high: { color: '#ef4444', label: 'High', bg: 'rgba(239, 68, 68, 0.1)' },
  medium: { color: '#f59e0b', label: 'Medium', bg: 'rgba(245, 158, 11, 0.1)' },
  low: { color: '#22c55e', label: 'Low', bg: 'rgba(34, 197, 94, 0.1)' },
};

// Assumption confidence colors
const CONFIDENCE_COLORS = {
  high: { color: '#22c55e', label: 'High', bg: 'rgba(34, 197, 94, 0.1)' },
  medium: { color: '#f59e0b', label: 'Medium', bg: 'rgba(245, 158, 11, 0.1)' },
  low: { color: '#ef4444', label: 'Low', bg: 'rgba(239, 68, 68, 0.1)' },
};

export default function RiskUncertainty({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
  onNavigate,
}) {
  const { artefacts, getArtefactsByStage, getRisks, PDS_STAGE_INFO } = usePDS();

  const stageArtefacts = useMemo(() => getArtefactsByStage('uncertainty'), [getArtefactsByStage]);
  const risks = useMemo(() => getRisks(), [getRisks]);
  const stage = PDS_STAGE_INFO?.uncertainty;

  // Group by type
  const grouped = useMemo(() => ({
    risks: stageArtefacts.filter(a => a.artefact_type === 'pds_risk'),
    assumptions: stageArtefacts.filter(a => a.artefact_type === 'pds_assumption'),
    issues: stageArtefacts.filter(a => a.artefact_type === 'pds_issue'),
    constraints: stageArtefacts.filter(a => a.artefact_type === 'pds_constraint'),
  }), [stageArtefacts]);

  // Active issues (not resolved)
  const activeIssues = useMemo(() =>
    grouped.issues.filter(i => i.custom_fields?.status !== 'resolved'),
    [grouped.issues]
  );

  // Calculate summary stats
  const stats = useMemo(() => ({
    totalRisks: grouped.risks.length,
    highRisks: risks.filter(r => r.exposure === 'high' || r.exposure === 'critical').length,
    totalAssumptions: grouped.assumptions.length,
    lowConfidence: grouped.assumptions.filter(a => a.custom_fields?.confidence === 'low').length,
    activeIssues: activeIssues.length,
    criticalIssues: activeIssues.filter(i => i.custom_fields?.urgency === 'critical').length,
  }), [grouped, risks, activeIssues]);

  // Key questions for this stage
  const keyQuestions = stage?.keyQuestions || [
    'What could stop us?',
    'What are we assuming to be true?',
    'What limits our options?',
  ];

  return (
    <div className="pds-view">
      <ViewHeader
        icon={WarningIcon}
        title="Risk & Uncertainty"
        description={stage?.description || "Surface and address what could go wrong"}
        color={stage?.color}
      />

      {/* Summary Stats */}
      <SummaryBar>
        <SummaryItem
          icon={WarningIcon}
          label="Risks"
          value={stats.totalRisks}
          sublabel={stats.highRisks > 0 ? `${stats.highRisks} high/critical` : null}
          variant={stats.highRisks > 0 ? 'warning' : undefined}
        />
        <SummaryItem
          icon={LightbulbIcon}
          label="Assumptions"
          value={stats.totalAssumptions}
          sublabel={stats.lowConfidence > 0 ? `${stats.lowConfidence} low confidence` : null}
        />
        <SummaryItem
          icon={BugReportIcon}
          label="Active Issues"
          value={stats.activeIssues}
          sublabel={stats.criticalIssues > 0 ? `${stats.criticalIssues} critical` : null}
          variant={stats.criticalIssues > 0 ? 'danger' : undefined}
        />
        <SummaryItem
          icon={BlockIcon}
          label="Constraints"
          value={grouped.constraints.length}
        />
      </SummaryBar>

      <div className="pds-view__content">
        {/* Key Questions Banner */}
        <div className="pds-intent-questions">
          <div className="pds-intent-questions__header">
            <HelpOutlineIcon />
            <span>Key Questions to Answer</span>
          </div>
          <div className="pds-intent-questions__list">
            {keyQuestions.map((q, i) => (
              <div key={i} className="pds-intent-question">
                <span className="pds-intent-question__number">{i + 1}</span>
                <span className="pds-intent-question__text">{q}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pds-intent-grid">
          {/* Risks Section */}
          <div className="pds-intent-section pds-intent-section--risks">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#ef4444' }}>
                <WarningIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Risks</h3>
                <span className="pds-intent-section__count">{grouped.risks.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_risk')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {grouped.risks.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <WarningIcon />
                  <p>No risks identified yet</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_risk')}>
                    Log first risk
                  </Button>
                </div>
              ) : (
                <div className="pds-risk-list">
                  {risks.map(item => {
                    const exposure = RISK_EXPOSURE_COLORS[item.exposure] || RISK_EXPOSURE_COLORS.medium;
                    return (
                      <div
                        key={item.id}
                        className="pds-risk-card"
                        onClick={() => onSelectArtefact?.(item)}
                      >
                        <div
                          className="pds-risk-card__indicator"
                          style={{ background: exposure.color }}
                        />
                        <div className="pds-risk-card__info">
                          <span className="pds-risk-card__name">{item.name}</span>
                          <div className="pds-risk-card__meta">
                            <span>P: {item.custom_fields?.probability || 'medium'}</span>
                            <span>I: {item.custom_fields?.impact || 'medium'}</span>
                          </div>
                        </div>
                        <div
                          className="pds-risk-card__badge"
                          style={{ background: exposure.bg, color: exposure.color }}
                        >
                          {exposure.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Assumptions Section */}
          <div className="pds-intent-section pds-intent-section--assumptions">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#8b5cf6' }}>
                <LightbulbIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Assumptions</h3>
                <span className="pds-intent-section__count">{grouped.assumptions.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_assumption')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {grouped.assumptions.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <LightbulbIcon />
                  <p>No assumptions documented</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_assumption')}>
                    Add first assumption
                  </Button>
                </div>
              ) : (
                <div className="pds-assumption-list">
                  {grouped.assumptions.map(item => {
                    const confidence = CONFIDENCE_COLORS[item.custom_fields?.confidence] || CONFIDENCE_COLORS.medium;
                    return (
                      <div
                        key={item.id}
                        className="pds-assumption-card"
                        onClick={() => onSelectArtefact?.(item)}
                      >
                        <div className="pds-assumption-card__icon" style={{ color: confidence.color }}>
                          <LightbulbIcon />
                        </div>
                        <div className="pds-assumption-card__info">
                          <span className="pds-assumption-card__name">{item.name}</span>
                          {item.custom_fields?.statement && (
                            <span className="pds-assumption-card__statement">
                              {item.custom_fields.statement.substring(0, 80)}
                              {item.custom_fields.statement.length > 80 ? '...' : ''}
                            </span>
                          )}
                        </div>
                        <div
                          className="pds-assumption-card__badge"
                          style={{ background: confidence.bg, color: confidence.color }}
                        >
                          {confidence.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Issues Section */}
          <div className="pds-intent-section pds-intent-section--issues">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#dc2626' }}>
                <BugReportIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Active Issues</h3>
                <span className="pds-intent-section__count">{activeIssues.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_issue')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {activeIssues.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <BugReportIcon />
                  <p>No active issues</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_issue')}>
                    Log an issue
                  </Button>
                </div>
              ) : (
                <div className="pds-issue-list">
                  {activeIssues.map(item => {
                    const urgency = ISSUE_URGENCY_COLORS[item.custom_fields?.urgency] || ISSUE_URGENCY_COLORS.medium;
                    return (
                      <div
                        key={item.id}
                        className="pds-issue-card"
                        onClick={() => onSelectArtefact?.(item)}
                      >
                        <div className="pds-issue-card__icon" style={{ color: urgency.color }}>
                          <ErrorOutlineIcon />
                        </div>
                        <div className="pds-issue-card__info">
                          <span className="pds-issue-card__name">{item.name}</span>
                          <span className="pds-issue-card__status">
                            {item.custom_fields?.status || 'open'}
                          </span>
                        </div>
                        <div
                          className="pds-issue-card__badge"
                          style={{ background: urgency.bg, color: urgency.color }}
                        >
                          {urgency.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Constraints Section */}
          <div className="pds-intent-section pds-intent-section--constraints">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#6b7280' }}>
                <BlockIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Constraints</h3>
                <span className="pds-intent-section__count">{grouped.constraints.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_constraint')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {grouped.constraints.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <BlockIcon />
                  <p>No constraints defined</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_constraint')}>
                    Add constraint
                  </Button>
                </div>
              ) : (
                <div className="pds-constraint-list">
                  {grouped.constraints.map(item => (
                    <div
                      key={item.id}
                      className="pds-constraint-card"
                      onClick={() => onSelectArtefact?.(item)}
                    >
                      <div className="pds-constraint-card__icon">
                        <ShieldIcon />
                      </div>
                      <div className="pds-constraint-card__info">
                        <span className="pds-constraint-card__name">{item.name}</span>
                        <span className="pds-constraint-card__type">
                          {item.custom_fields?.constraint_type || 'General'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
