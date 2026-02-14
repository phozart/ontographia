// components/pds/views/StructurePlanning.js
// Structure & Planning - Stage 2 view for PDS workspace
// Organizes work breakdown and dependencies

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Button, SummaryBar, SummaryItem } from '../../../ui';

// MUI Icons
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FlagIcon from '@mui/icons-material/Flag';
import WorkIcon from '@mui/icons-material/Work';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Status colors for milestones
const MILESTONE_STATUS_COLORS = {
  upcoming: { color: '#3b82f6', label: 'Upcoming', bg: 'rgba(59, 130, 246, 0.1)' },
  at_risk: { color: '#f59e0b', label: 'At Risk', bg: 'rgba(245, 158, 11, 0.1)' },
  achieved: { color: '#22c55e', label: 'Achieved', bg: 'rgba(34, 197, 94, 0.1)' },
  missed: { color: '#ef4444', label: 'Missed', bg: 'rgba(239, 68, 68, 0.1)' },
  cancelled: { color: '#6b7280', label: 'Cancelled', bg: 'rgba(107, 114, 128, 0.1)' },
};

// Status colors for deliverables
const DELIVERABLE_STATUS_COLORS = {
  not_started: { color: '#6b7280', label: 'Not Started', bg: 'rgba(107, 114, 128, 0.1)' },
  in_progress: { color: '#3b82f6', label: 'In Progress', bg: 'rgba(59, 130, 246, 0.1)' },
  blocked: { color: '#ef4444', label: 'Blocked', bg: 'rgba(239, 68, 68, 0.1)' },
  completed: { color: '#22c55e', label: 'Completed', bg: 'rgba(34, 197, 94, 0.1)' },
  cancelled: { color: '#6b7280', label: 'Cancelled', bg: 'rgba(107, 114, 128, 0.1)' },
};

export default function StructurePlanning({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
  onNavigate,
}) {
  const { artefacts, getArtefactsByStage, getDeliverables, getMilestones, PDS_STAGE_INFO } = usePDS();

  const stageArtefacts = useMemo(() => getArtefactsByStage('structure'), [getArtefactsByStage]);
  const deliverables = useMemo(() => getDeliverables(), [getDeliverables]);
  const milestones = useMemo(() => getMilestones(), [getMilestones]);
  const stage = PDS_STAGE_INFO?.structure;

  // Group by type
  const workPackages = useMemo(() =>
    stageArtefacts.filter(a => a.artefact_type === 'pds_work_package'),
    [stageArtefacts]
  );

  // Calculate summary stats
  const stats = useMemo(() => ({
    totalMilestones: milestones.length,
    achievedMilestones: milestones.filter(m => m.custom_fields?.status === 'achieved').length,
    totalDeliverables: deliverables.length,
    completedDeliverables: deliverables.filter(d => d.custom_fields?.status === 'completed').length,
    blockedDeliverables: deliverables.filter(d => d.custom_fields?.status === 'blocked').length,
  }), [milestones, deliverables]);

  // Key questions for this stage
  const keyQuestions = stage?.keyQuestions || [
    'What must be delivered?',
    'In what sequence?',
    'Who is responsible for each work package?',
  ];

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date set';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pds-view">
      <ViewHeader
        icon={AccountTreeIcon}
        title="Structure & Planning"
        description={stage?.description || "Organize work breakdown and dependencies"}
        color={stage?.color}
      />

      {/* Summary Stats */}
      <SummaryBar>
        <SummaryItem
          icon={FlagIcon}
          label="Milestones"
          value={stats.totalMilestones}
          sublabel={stats.achievedMilestones > 0 ? `${stats.achievedMilestones} achieved` : null}
        />
        <SummaryItem
          icon={AssignmentIcon}
          label="Deliverables"
          value={stats.totalDeliverables}
          sublabel={stats.completedDeliverables > 0 ? `${stats.completedDeliverables} completed` : null}
        />
        <SummaryItem
          icon={WorkIcon}
          label="Work Packages"
          value={workPackages.length}
        />
        {stats.blockedDeliverables > 0 && (
          <SummaryItem
            icon={WarningAmberIcon}
            label="Blocked"
            value={stats.blockedDeliverables}
            variant="warning"
          />
        )}
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
          {/* Milestones Section */}
          <div className="pds-intent-section pds-intent-section--milestones">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#f59e0b' }}>
                <FlagIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Milestones</h3>
                <span className="pds-intent-section__count">{milestones.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_milestone')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {milestones.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <FlagIcon />
                  <p>No milestones yet</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_milestone')}>
                    Add first milestone
                  </Button>
                </div>
              ) : (
                <div className="pds-milestone-list">
                  {milestones.map(item => {
                    const status = MILESTONE_STATUS_COLORS[item.custom_fields?.status] || MILESTONE_STATUS_COLORS.upcoming;
                    return (
                      <div
                        key={item.id}
                        className="pds-milestone-card"
                        onClick={() => onSelectArtefact?.(item)}
                      >
                        <div className="pds-milestone-card__status" style={{ color: status.color }}>
                          {item.custom_fields?.status === 'achieved' ? (
                            <CheckCircleIcon />
                          ) : (
                            <ScheduleIcon />
                          )}
                        </div>
                        <div className="pds-milestone-card__info">
                          <span className="pds-milestone-card__name">{item.name}</span>
                          <span className="pds-milestone-card__date">
                            {formatDate(item.custom_fields?.planned_date)}
                          </span>
                        </div>
                        <div
                          className="pds-milestone-card__badge"
                          style={{ background: status.bg, color: status.color }}
                        >
                          {status.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Deliverables Section */}
          <div className="pds-intent-section pds-intent-section--deliverables">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#3b82f6' }}>
                <AssignmentIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Deliverables</h3>
                <span className="pds-intent-section__count">{deliverables.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_deliverable')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {deliverables.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <AssignmentIcon />
                  <p>No deliverables yet</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_deliverable')}>
                    Add first deliverable
                  </Button>
                </div>
              ) : (
                <div className="pds-deliverable-list">
                  {deliverables.map(item => {
                    const status = DELIVERABLE_STATUS_COLORS[item.custom_fields?.status] || DELIVERABLE_STATUS_COLORS.not_started;
                    const progress = item.custom_fields?.progress || 0;
                    return (
                      <div
                        key={item.id}
                        className="pds-deliverable-card"
                        onClick={() => onSelectArtefact?.(item)}
                      >
                        <div className="pds-deliverable-card__header">
                          <span className="pds-deliverable-card__name">{item.name}</span>
                          <span
                            className="pds-deliverable-card__badge"
                            style={{ background: status.bg, color: status.color }}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="pds-deliverable-card__progress">
                          <div className="pds-deliverable-card__progress-bar">
                            <div
                              className="pds-deliverable-card__progress-fill"
                              style={{ width: `${progress}%`, background: status.color }}
                            />
                          </div>
                          <span className="pds-deliverable-card__progress-text">{progress}%</span>
                        </div>
                        {item.custom_fields?.owner && (
                          <div className="pds-deliverable-card__owner">
                            Owner: {item.custom_fields.owner}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Work Packages Section */}
          <div className="pds-intent-section pds-intent-section--workpackages">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#0ea5e9' }}>
                <WorkIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Work Packages</h3>
                <span className="pds-intent-section__count">{workPackages.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_work_package')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {workPackages.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <WorkIcon />
                  <p>No work packages yet</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_work_package')}>
                    Add first work package
                  </Button>
                </div>
              ) : (
                <div className="pds-workpackage-list">
                  {workPackages.map(item => (
                    <div
                      key={item.id}
                      className="pds-workpackage-card"
                      onClick={() => onSelectArtefact?.(item)}
                    >
                      <div className="pds-workpackage-card__icon">
                        <WorkIcon />
                      </div>
                      <div className="pds-workpackage-card__info">
                        <span className="pds-workpackage-card__name">{item.name}</span>
                        <span className="pds-workpackage-card__owner">
                          {item.custom_fields?.owner || 'Unassigned'}
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
