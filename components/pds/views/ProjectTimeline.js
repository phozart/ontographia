// components/pds/views/ProjectTimeline.js
// Project Timeline - Gantt-style timeline view for PDS workspace
// Phase 4: To be fully implemented

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, EmptyState, Button } from '../../ui';
import { GanttTimeline, ProjectTimeline as ProjectTimelineChart } from '../../ui';

// MUI Icons
import TimelineIcon from '@mui/icons-material/Timeline';
import AddIcon from '@mui/icons-material/Add';
import FlagIcon from '@mui/icons-material/Flag';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function ProjectTimeline({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const { artefacts, getMilestones, getDeliverables, relationships } = usePDS();

  const milestones = useMemo(() => getMilestones(), [getMilestones]);
  const deliverables = useMemo(() => getDeliverables(), [getDeliverables]);

  // Prepare timeline items
  const timelineItems = useMemo(() => {
    const items = [];

    // Add milestones
    milestones.forEach(m => {
      items.push({
        id: m.id,
        name: m.name,
        type: 'milestone',
        date: m.custom_fields?.planned_date,
        startDate: m.custom_fields?.planned_date,
        endDate: m.custom_fields?.planned_date,
        status: m.custom_fields?.status || 'upcoming',
        data: m,
      });
    });

    // Add deliverables
    deliverables.forEach(d => {
      items.push({
        id: d.id,
        name: d.name,
        type: 'deliverable',
        startDate: d.custom_fields?.planned_start,
        endDate: d.custom_fields?.planned_end,
        status: d.custom_fields?.status || 'not_started',
        progress: d.custom_fields?.progress || 0,
        dependencies: d.dependencies || [],
        data: d,
      });
    });

    return items;
  }, [milestones, deliverables]);

  // Check if we have items with dates
  const hasTimelineData = useMemo(() =>
    timelineItems.some(item => item.startDate || item.date),
    [timelineItems]
  );

  const handleItemClick = (item) => {
    if (item.data) {
      onSelectArtefact?.(item.data);
    }
  };

  return (
    <div className="pds-view">
      <ViewHeader
        icon={TimelineIcon}
        title="Project Timeline"
        description="Visualize milestones, deliverables, and dependencies over time"
      />

      <div className="pds-view__content">
        {!hasTimelineData ? (
          <EmptyState
            icon={TimelineIcon}
            title="Build Your Timeline"
            description="Add milestones and deliverables with planned dates to visualize your project schedule."
            action={
              <div className="pds-view__actions">
                <Button variant="primary" onClick={() => onCreateArtefact?.('pds_milestone')}>
                  <FlagIcon fontSize="small" /> Add Milestone
                </Button>
                <Button variant="secondary" onClick={() => onCreateArtefact?.('pds_deliverable')}>
                  <AssignmentIcon fontSize="small" /> Add Deliverable
                </Button>
              </div>
            }
          />
        ) : (
          <div className="pds-timeline-container">
            {/* Timeline controls */}
            <div className="pds-timeline-controls">
              <div className="pds-timeline-legend">
                <span className="pds-timeline-legend-item">
                  <span className="pds-timeline-legend-icon pds-timeline-legend-icon--milestone">◆</span>
                  Milestone
                </span>
                <span className="pds-timeline-legend-item">
                  <span className="pds-timeline-legend-icon pds-timeline-legend-icon--deliverable">▬</span>
                  Deliverable
                </span>
              </div>
              <div className="pds-timeline-actions">
                <Button size="small" onClick={() => onCreateArtefact?.('pds_milestone')}>
                  <AddIcon fontSize="small" /> Milestone
                </Button>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_deliverable')}>
                  <AddIcon fontSize="small" /> Deliverable
                </Button>
              </div>
            </div>

            {/* Gantt Timeline */}
            <GanttTimeline
              items={timelineItems}
              interval="week"
              showDependencies
              showProgress
              showToday
              onItemClick={handleItemClick}
              className="pds-gantt"
            />

            {/* Summary */}
            <div className="pds-timeline-summary">
              <div className="pds-timeline-stat">
                <span className="pds-timeline-stat-value">{milestones.length}</span>
                <span className="pds-timeline-stat-label">Milestones</span>
              </div>
              <div className="pds-timeline-stat">
                <span className="pds-timeline-stat-value">{deliverables.length}</span>
                <span className="pds-timeline-stat-label">Deliverables</span>
              </div>
              <div className="pds-timeline-stat">
                <span className="pds-timeline-stat-value">
                  {deliverables.filter(d => d.custom_fields?.status === 'completed').length}
                </span>
                <span className="pds-timeline-stat-label">Completed</span>
              </div>
              <div className="pds-timeline-stat">
                <span className="pds-timeline-stat-value">
                  {milestones.filter(m =>
                    m.custom_fields?.status === 'achieved' ||
                    m.custom_fields?.status === 'completed'
                  ).length}
                </span>
                <span className="pds-timeline-stat-label">Achieved</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
