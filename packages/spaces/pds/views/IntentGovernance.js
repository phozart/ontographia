// components/pds/views/IntentGovernance.js
// Intent & Governance - Stage 1 view for PDS workspace
// Defines why the project exists and who is accountable

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Card, Button, SummaryBar, SummaryItem } from '../../../ui';

// MUI Icons
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';

// Stakeholder engagement strategy colors and labels
const ENGAGEMENT_COLORS = {
  manage_closely: { color: '#ef4444', label: 'Manage Closely', bg: 'rgba(239, 68, 68, 0.1)' },
  keep_satisfied: { color: '#f59e0b', label: 'Keep Satisfied', bg: 'rgba(245, 158, 11, 0.1)' },
  keep_informed: { color: '#3b82f6', label: 'Keep Informed', bg: 'rgba(59, 130, 246, 0.1)' },
  monitor: { color: '#22c55e', label: 'Monitor', bg: 'rgba(34, 197, 94, 0.1)' },
};

// Gate outcome colors
const GATE_OUTCOME_COLORS = {
  pending: { color: '#6b7280', label: 'Pending', icon: PendingIcon },
  approved: { color: '#22c55e', label: 'Approved', icon: CheckCircleIcon },
  approved_with_conditions: { color: '#f59e0b', label: 'Conditional', icon: WarningAmberIcon },
  rejected: { color: '#ef4444', label: 'Rejected', icon: WarningAmberIcon },
  deferred: { color: '#8b5cf6', label: 'Deferred', icon: PendingIcon },
};

// Success measure status colors
const MEASURE_STATUS_COLORS = {
  not_started: { color: '#6b7280', label: 'Not Started' },
  on_track: { color: '#22c55e', label: 'On Track' },
  at_risk: { color: '#f59e0b', label: 'At Risk' },
  achieved: { color: '#10b981', label: 'Achieved' },
  missed: { color: '#ef4444', label: 'Missed' },
};

export default function IntentGovernance({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const { artefacts, getArtefactsByStage, PDS_STAGE_INFO, activeProject } = usePDS();

  const stageArtefacts = useMemo(() => getArtefactsByStage('intent'), [getArtefactsByStage]);
  const stage = PDS_STAGE_INFO?.intent;

  // Group by type
  const grouped = useMemo(() => ({
    stakeholders: stageArtefacts.filter(a => a.artefact_type === 'pds_stakeholder'),
    gates: stageArtefacts.filter(a => a.artefact_type === 'pds_governance_gate'),
    businessCases: stageArtefacts.filter(a => a.artefact_type === 'pds_business_case'),
    successMeasures: stageArtefacts.filter(a => a.artefact_type === 'pds_success_measure'),
  }), [stageArtefacts]);

  // Calculate summary stats
  const stats = useMemo(() => ({
    totalStakeholders: grouped.stakeholders.length,
    highInfluence: grouped.stakeholders.filter(s => s.custom_fields?.influence === 'high').length,
    gatesApproved: grouped.gates.filter(g => g.custom_fields?.outcome === 'approved').length,
    gatesPending: grouped.gates.filter(g => !g.custom_fields?.outcome || g.custom_fields?.outcome === 'pending').length,
    measuresOnTrack: grouped.successMeasures.filter(m => m.custom_fields?.status === 'on_track' || m.custom_fields?.status === 'achieved').length,
  }), [grouped]);

  // Key questions for this stage
  const keyQuestions = stage?.keyQuestions || [
    'What outcome justifies this investment?',
    'Who can stop it?',
    'What does success look like?',
  ];

  return (
    <div className="pds-view">
      <ViewHeader
        icon={FlagIcon}
        title="Intent & Governance"
        description={stage?.description || "Define why this project exists and who is accountable"}
        color={stage?.color}
      />

      {/* Summary Stats */}
      <SummaryBar>
          <SummaryItem
            icon={PeopleIcon}
            label="Stakeholders"
            value={stats.totalStakeholders}
            sublabel={stats.highInfluence > 0 ? `${stats.highInfluence} high influence` : null}
          />
          <SummaryItem
            icon={GavelIcon}
            label="Gates"
            value={grouped.gates.length}
            sublabel={stats.gatesApproved > 0 ? `${stats.gatesApproved} approved` : `${stats.gatesPending} pending`}
          />
          <SummaryItem
            icon={BusinessCenterIcon}
            label="Business Cases"
            value={grouped.businessCases.length}
          />
          <SummaryItem
            icon={TrackChangesIcon}
            label="Success Measures"
            value={grouped.successMeasures.length}
            sublabel={stats.measuresOnTrack > 0 ? `${stats.measuresOnTrack} on track` : null}
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
            {/* Stakeholders Section */}
            <div className="pds-intent-section pds-intent-section--stakeholders">
              <div className="pds-intent-section__header">
                <div className="pds-intent-section__icon" style={{ background: '#8b5cf6' }}>
                  <PeopleIcon />
                </div>
                <div className="pds-intent-section__title">
                  <h3>Stakeholders</h3>
                  <span className="pds-intent-section__count">{grouped.stakeholders.length}</span>
                </div>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_stakeholder')}>
                  <AddIcon fontSize="small" />
                </Button>
              </div>
              <div className="pds-intent-section__content">
                {grouped.stakeholders.length === 0 ? (
                  <div className="pds-intent-section__empty">
                    <PersonIcon />
                    <p>No stakeholders yet</p>
                    <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_stakeholder')}>
                      Add first stakeholder
                    </Button>
                  </div>
                ) : (
                  <div className="pds-stakeholder-list">
                    {grouped.stakeholders.map(item => {
                      const engagement = ENGAGEMENT_COLORS[item.custom_fields?.engagement_strategy] || ENGAGEMENT_COLORS.monitor;
                      return (
                        <div
                          key={item.id}
                          className="pds-stakeholder-card"
                          onClick={() => onSelectArtefact?.(item)}
                        >
                          <div className="pds-stakeholder-card__avatar" style={{ background: engagement.bg, color: engagement.color }}>
                            {item.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div className="pds-stakeholder-card__info">
                            <span className="pds-stakeholder-card__name">{item.name}</span>
                            <span className="pds-stakeholder-card__role">{item.custom_fields?.role || 'Stakeholder'}</span>
                          </div>
                          <div
                            className="pds-stakeholder-card__badge"
                            style={{ background: engagement.bg, color: engagement.color }}
                          >
                            {engagement.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Business Case Section */}
            <div className="pds-intent-section pds-intent-section--business">
              <div className="pds-intent-section__header">
                <div className="pds-intent-section__icon" style={{ background: '#22c55e' }}>
                  <BusinessCenterIcon />
                </div>
                <div className="pds-intent-section__title">
                  <h3>Business Case</h3>
                  <span className="pds-intent-section__count">{grouped.businessCases.length}</span>
                </div>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_business_case')}>
                  <AddIcon fontSize="small" />
                </Button>
              </div>
              <div className="pds-intent-section__content">
                {grouped.businessCases.length === 0 ? (
                  <div className="pds-intent-section__empty">
                    <BusinessCenterIcon />
                    <p>No business case defined</p>
                    <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_business_case')}>
                      Create business case
                    </Button>
                  </div>
                ) : (
                  <div className="pds-business-list">
                    {grouped.businessCases.map(item => (
                      <div
                        key={item.id}
                        className="pds-business-card"
                        onClick={() => onSelectArtefact?.(item)}
                      >
                        <div className="pds-business-card__header">
                          <h4>{item.name || item.custom_fields?.title || 'Business Case'}</h4>
                          <span className={`pds-business-card__status pds-business-card__status--${item.custom_fields?.status || 'draft'}`}>
                            {item.custom_fields?.status || 'Draft'}
                          </span>
                        </div>
                        {item.custom_fields?.problem_statement && (
                          <p className="pds-business-card__problem">
                            {item.custom_fields.problem_statement.substring(0, 150)}
                            {item.custom_fields.problem_statement.length > 150 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Governance Gates Section */}
            <div className="pds-intent-section pds-intent-section--gates">
              <div className="pds-intent-section__header">
                <div className="pds-intent-section__icon" style={{ background: '#6366f1' }}>
                  <GavelIcon />
                </div>
                <div className="pds-intent-section__title">
                  <h3>Governance Gates</h3>
                  <span className="pds-intent-section__count">{grouped.gates.length}</span>
                </div>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_governance_gate')}>
                  <AddIcon fontSize="small" />
                </Button>
              </div>
              <div className="pds-intent-section__content">
                {grouped.gates.length === 0 ? (
                  <div className="pds-intent-section__empty">
                    <GavelIcon />
                    <p>No governance gates defined</p>
                    <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_governance_gate')}>
                      Add gate
                    </Button>
                  </div>
                ) : (
                  <div className="pds-gate-list">
                    {grouped.gates.map(item => {
                      const outcome = GATE_OUTCOME_COLORS[item.custom_fields?.outcome] || GATE_OUTCOME_COLORS.pending;
                      const OutcomeIcon = outcome.icon;
                      return (
                        <div
                          key={item.id}
                          className="pds-gate-card"
                          onClick={() => onSelectArtefact?.(item)}
                        >
                          <div className="pds-gate-card__status" style={{ color: outcome.color }}>
                            <OutcomeIcon />
                          </div>
                          <div className="pds-gate-card__info">
                            <span className="pds-gate-card__name">{item.name}</span>
                            <span className="pds-gate-card__authority">
                              {item.custom_fields?.authority || 'Authority not set'}
                            </span>
                          </div>
                          <div className="pds-gate-card__outcome" style={{ color: outcome.color }}>
                            {outcome.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Success Measures Section */}
            <div className="pds-intent-section pds-intent-section--measures">
              <div className="pds-intent-section__header">
                <div className="pds-intent-section__icon" style={{ background: '#10b981' }}>
                  <TrackChangesIcon />
                </div>
                <div className="pds-intent-section__title">
                  <h3>Success Measures</h3>
                  <span className="pds-intent-section__count">{grouped.successMeasures.length}</span>
                </div>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_success_measure')}>
                  <AddIcon fontSize="small" />
                </Button>
              </div>
              <div className="pds-intent-section__content">
                {grouped.successMeasures.length === 0 ? (
                  <div className="pds-intent-section__empty">
                    <TrendingUpIcon />
                    <p>No success measures defined</p>
                    <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_success_measure')}>
                      Add measure
                    </Button>
                  </div>
                ) : (
                  <div className="pds-measure-list">
                    {grouped.successMeasures.map(item => {
                      const status = MEASURE_STATUS_COLORS[item.custom_fields?.status] || MEASURE_STATUS_COLORS.not_started;
                      return (
                        <div
                          key={item.id}
                          className="pds-measure-card"
                          onClick={() => onSelectArtefact?.(item)}
                        >
                          <div className="pds-measure-card__header">
                            <span className="pds-measure-card__name">{item.name}</span>
                            <span
                              className="pds-measure-card__status"
                              style={{ color: status.color, background: `${status.color}15` }}
                            >
                              {status.label}
                            </span>
                          </div>
                          <div className="pds-measure-card__values">
                            <div className="pds-measure-card__value">
                              <span className="pds-measure-card__label">Baseline</span>
                              <span className="pds-measure-card__number">{item.custom_fields?.baseline || '—'}</span>
                            </div>
                            <div className="pds-measure-card__arrow">→</div>
                            <div className="pds-measure-card__value">
                              <span className="pds-measure-card__label">Current</span>
                              <span className="pds-measure-card__number">{item.custom_fields?.current || '—'}</span>
                            </div>
                            <div className="pds-measure-card__arrow">→</div>
                            <div className="pds-measure-card__value pds-measure-card__value--target">
                              <span className="pds-measure-card__label">Target</span>
                              <span className="pds-measure-card__number">{item.custom_fields?.target || '—'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
