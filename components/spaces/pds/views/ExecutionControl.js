// components/pds/views/ExecutionControl.js
// Execution & Control - Stage 4 view for PDS workspace
// Track progress and adapt

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Button, SummaryBar, SummaryItem } from '../../../ui';

// MUI Icons
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import BugReportIcon from '@mui/icons-material/BugReport';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

// Status colors
const STATUS_COLORS = {
  green: { color: '#22c55e', label: 'On Track', bg: 'rgba(34, 197, 94, 0.1)' },
  amber: { color: '#f59e0b', label: 'At Risk', bg: 'rgba(245, 158, 11, 0.1)' },
  red: { color: '#ef4444', label: 'Off Track', bg: 'rgba(239, 68, 68, 0.1)' },
  unknown: { color: '#6b7280', label: 'Unknown', bg: 'rgba(107, 114, 128, 0.1)' },
};

// Change request priority colors
const PRIORITY_COLORS = {
  critical: { color: '#dc2626', label: 'Critical', bg: 'rgba(220, 38, 38, 0.1)' },
  high: { color: '#ef4444', label: 'High', bg: 'rgba(239, 68, 68, 0.1)' },
  medium: { color: '#f59e0b', label: 'Medium', bg: 'rgba(245, 158, 11, 0.1)' },
  low: { color: '#22c55e', label: 'Low', bg: 'rgba(34, 197, 94, 0.1)' },
};

export default function ExecutionControl({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
  onNavigate,
}) {
  const { artefacts, getArtefactsByStage, PDS_STAGE_INFO } = usePDS();

  const stageArtefacts = useMemo(() => getArtefactsByStage('control'), [getArtefactsByStage]);
  const stage = PDS_STAGE_INFO?.control;

  // Group by type
  const grouped = useMemo(() => ({
    statusUpdates: stageArtefacts.filter(a => a.artefact_type === 'pds_status_update'),
    changeRequests: stageArtefacts.filter(a => a.artefact_type === 'pds_change_request'),
    decisions: stageArtefacts.filter(a => a.artefact_type === 'pds_decision'),
    exceptions: stageArtefacts.filter(a => a.artefact_type === 'pds_exception'),
  }), [stageArtefacts]);

  // Latest status update
  const latestStatus = useMemo(() => {
    if (grouped.statusUpdates.length === 0) return null;
    return grouped.statusUpdates.sort((a, b) =>
      new Date(b.custom_fields?.date || b.created_at) - new Date(a.custom_fields?.date || a.created_at)
    )[0];
  }, [grouped.statusUpdates]);

  // Pending change requests
  const pendingChanges = useMemo(() =>
    grouped.changeRequests.filter(c => !c.custom_fields?.decision || c.custom_fields?.decision === 'pending'),
    [grouped.changeRequests]
  );

  // Calculate summary stats
  const stats = useMemo(() => ({
    totalUpdates: grouped.statusUpdates.length,
    pendingChanges: pendingChanges.length,
    totalDecisions: grouped.decisions.length,
    openExceptions: grouped.exceptions.filter(e => e.custom_fields?.status !== 'resolved').length,
  }), [grouped, pendingChanges]);

  // Key questions for this stage
  const keyQuestions = stage?.keyQuestions || [
    'Are we on track?',
    'What needs to change?',
    'What decisions need to be made?',
  ];

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status === 'green' || status === 'on_track') return STATUS_COLORS.green;
    if (status === 'amber' || status === 'at_risk') return STATUS_COLORS.amber;
    if (status === 'red' || status === 'off_track') return STATUS_COLORS.red;
    return STATUS_COLORS.unknown;
  };

  return (
    <div className="pds-view">
      <ViewHeader
        icon={PlayCircleIcon}
        title="Execution & Control"
        description={stage?.description || "Track progress and adapt"}
        color={stage?.color}
      />

      {/* Summary Stats */}
      <SummaryBar>
        <SummaryItem
          icon={AssessmentIcon}
          label="Status Updates"
          value={stats.totalUpdates}
        />
        <SummaryItem
          icon={ChangeCircleIcon}
          label="Pending Changes"
          value={stats.pendingChanges}
          variant={stats.pendingChanges > 0 ? 'warning' : undefined}
        />
        <SummaryItem
          icon={GavelIcon}
          label="Decisions"
          value={stats.totalDecisions}
        />
        <SummaryItem
          icon={BugReportIcon}
          label="Open Exceptions"
          value={stats.openExceptions}
          variant={stats.openExceptions > 0 ? 'danger' : undefined}
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
          {/* Current Status Section */}
          <div className="pds-intent-section pds-intent-section--status">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#0ea5e9' }}>
                <AssessmentIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Current Status</h3>
                <span className="pds-intent-section__count">{grouped.statusUpdates.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_status_update')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {!latestStatus ? (
                <div className="pds-intent-section__empty">
                  <AssessmentIcon />
                  <p>No status updates yet</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_status_update')}>
                    Log status update
                  </Button>
                </div>
              ) : (
                <div className="pds-status-dashboard" onClick={() => onSelectArtefact?.(latestStatus)}>
                  <div className="pds-status-dashboard__header">
                    <span className="pds-status-dashboard__date">
                      Last updated: {formatDate(latestStatus.custom_fields?.date || latestStatus.created_at)}
                    </span>
                  </div>
                  <div className="pds-status-dashboard__grid">
                    {['overall_status', 'schedule_status', 'budget_status', 'quality_status'].map(field => {
                      const statusValue = latestStatus.custom_fields?.[field] || 'unknown';
                      const statusColor = getStatusColor(statusValue);
                      const label = field.replace('_status', '').replace('_', ' ');
                      return (
                        <div key={field} className="pds-status-indicator">
                          <div
                            className="pds-status-indicator__dot"
                            style={{ background: statusColor.color }}
                          />
                          <span className="pds-status-indicator__label">{label}</span>
                          <span
                            className="pds-status-indicator__value"
                            style={{ color: statusColor.color }}
                          >
                            {statusColor.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Requests Section */}
          <div className="pds-intent-section pds-intent-section--changes">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#f59e0b' }}>
                <ChangeCircleIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Change Requests</h3>
                <span className="pds-intent-section__count">{pendingChanges.length} pending</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_change_request')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {pendingChanges.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <ChangeCircleIcon />
                  <p>No pending changes</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_change_request')}>
                    Submit change request
                  </Button>
                </div>
              ) : (
                <div className="pds-change-list">
                  {pendingChanges.map(item => {
                    const priority = PRIORITY_COLORS[item.custom_fields?.priority] || PRIORITY_COLORS.medium;
                    return (
                      <div
                        key={item.id}
                        className="pds-change-card"
                        onClick={() => onSelectArtefact?.(item)}
                      >
                        <div className="pds-change-card__icon">
                          <PendingIcon style={{ color: priority.color }} />
                        </div>
                        <div className="pds-change-card__info">
                          <span className="pds-change-card__name">{item.name}</span>
                          <span className="pds-change-card__desc">
                            {item.description?.substring(0, 60)}
                            {item.description?.length > 60 ? '...' : ''}
                          </span>
                        </div>
                        <div
                          className="pds-change-card__badge"
                          style={{ background: priority.bg, color: priority.color }}
                        >
                          {priority.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Decisions Section */}
          <div className="pds-intent-section pds-intent-section--decisions">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#8b5cf6' }}>
                <GavelIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Decisions</h3>
                <span className="pds-intent-section__count">{grouped.decisions.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_decision')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {grouped.decisions.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <GavelIcon />
                  <p>No decisions recorded</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_decision')}>
                    Record decision
                  </Button>
                </div>
              ) : (
                <div className="pds-decision-list">
                  {grouped.decisions.slice(0, 6).map(item => (
                    <div
                      key={item.id}
                      className="pds-decision-card"
                      onClick={() => onSelectArtefact?.(item)}
                    >
                      <div className="pds-decision-card__icon">
                        <CheckCircleIcon style={{ color: '#8b5cf6' }} />
                      </div>
                      <div className="pds-decision-card__info">
                        <span className="pds-decision-card__name">{item.name}</span>
                        <span className="pds-decision-card__outcome">
                          {item.custom_fields?.chosen_option || 'Pending'}
                        </span>
                      </div>
                      <span className="pds-decision-card__date">
                        {formatDate(item.custom_fields?.date || item.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Exceptions Section */}
          <div className="pds-intent-section pds-intent-section--exceptions">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#ef4444' }}>
                <BugReportIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Exceptions</h3>
                <span className="pds-intent-section__count">{grouped.exceptions.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_exception')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {grouped.exceptions.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <BugReportIcon />
                  <p>No exceptions raised</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_exception')}>
                    Raise exception
                  </Button>
                </div>
              ) : (
                <div className="pds-exception-list">
                  {grouped.exceptions.map(item => {
                    const isResolved = item.custom_fields?.status === 'resolved';
                    return (
                      <div
                        key={item.id}
                        className={`pds-exception-card ${isResolved ? 'pds-exception-card--resolved' : ''}`}
                        onClick={() => onSelectArtefact?.(item)}
                      >
                        <div className="pds-exception-card__icon">
                          <BugReportIcon style={{ color: isResolved ? '#22c55e' : '#ef4444' }} />
                        </div>
                        <div className="pds-exception-card__info">
                          <span className="pds-exception-card__name">{item.name}</span>
                          <span className="pds-exception-card__status">
                            {item.custom_fields?.status || 'Open'}
                          </span>
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
