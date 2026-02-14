/**
 * ScheduleView.js
 *
 * Project schedule and timeline view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import TimelineIcon from '@mui/icons-material/Timeline';
import AddIcon from '@mui/icons-material/Add';

export default function ScheduleView({ onCreateArtefact, onNavigate }) {
  const { activeProject, getArtefactsByType, getMilestonesByDate } = useProjectStudio();

  const milestones = useMemo(() => getMilestonesByDate(), [getMilestonesByDate]);
  const phases = useMemo(() => getArtefactsByType('phase'), [getArtefactsByType]);

  return (
    <>
      <ViewHeader
        icon={TimelineIcon}
        iconColor="#3b82f6"
        title="Schedule"
        description="Project timeline and phases"
      />
      <ContentArea>
        <div className="schedule-view">
          {/* Project Timeline Summary */}
          <Card>
            <Card.Header>
              <span>Project Timeline</span>
            </Card.Header>
            <Card.Section>
              <div className="schedule-summary">
                <div className="schedule-date-range">
                  <div className="date-item">
                    <span className="date-label">Start</span>
                    <span className="date-value">
                      {activeProject?.custom_fields?.start_date
                        ? new Date(activeProject.custom_fields.start_date).toLocaleDateString()
                        : 'Not set'}
                    </span>
                  </div>
                  <div className="date-item">
                    <span className="date-label">End</span>
                    <span className="date-value">
                      {activeProject?.custom_fields?.end_date
                        ? new Date(activeProject.custom_fields.end_date).toLocaleDateString()
                        : 'Not set'}
                    </span>
                  </div>
                  <div className="date-item">
                    <span className="date-label">Baseline</span>
                    <span className="date-value">
                      {activeProject?.custom_fields?.baseline_end
                        ? new Date(activeProject.custom_fields.baseline_end).toLocaleDateString()
                        : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </Card.Section>
          </Card>

          {/* Phases */}
          <Card>
            <Card.Header>
              <span>Phases ({phases.length})</span>
              <Button variant="ghost" size="small" onClick={() => onCreateArtefact?.('phase')}>
                <AddIcon fontSize="small" /> Add
              </Button>
            </Card.Header>
            <Card.Section>
              {phases.length === 0 ? (
                <EmptyState
                  title="No Phases Defined"
                  description="Add phases to organize your project timeline."
                  actionLabel="Add Phase"
                  onAction={() => onCreateArtefact?.('phase')}
                />
              ) : (
                <div className="phase-list">
                  {phases.map(phase => (
                    <div key={phase.id} className="phase-item">
                      <span className="phase-name">{phase.name}</span>
                      <span className={`phase-status phase-status--${phase.custom_fields?.status}`}>
                        {phase.custom_fields?.status?.replace(/_/g, ' ')}
                      </span>
                      <span className="phase-dates">
                        {phase.custom_fields?.start_date && new Date(phase.custom_fields.start_date).toLocaleDateString()} -
                        {phase.custom_fields?.end_date && new Date(phase.custom_fields.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card.Section>
          </Card>

          {/* Milestones Quick View */}
          <Card>
            <Card.Header>
              <span>Milestones ({milestones.length})</span>
              <Button variant="ghost" size="small" onClick={() => onNavigate?.('milestones')}>
                View All
              </Button>
            </Card.Header>
            <Card.Section>
              {milestones.length === 0 ? (
                <EmptyState
                  title="No Milestones"
                  description="Add milestones to track key checkpoints."
                  actionLabel="Add Milestone"
                  onAction={() => onCreateArtefact?.('milestone')}
                />
              ) : (
                <div className="milestone-mini-list">
                  {milestones.slice(0, 5).map(ms => (
                    <div key={ms.id} className="milestone-mini-item">
                      <span className={`ms-status ms-status--${ms.custom_fields?.status}`} />
                      <span className="ms-name">{ms.name}</span>
                      <span className="ms-date">
                        {new Date(ms.custom_fields?.planned_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card.Section>
          </Card>
        </div>
      </ContentArea>
    </>
  );
}
