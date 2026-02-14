// components/dwd/views/CaseTimeline.js
// Visual timeline of case evolution showing key events and status transitions

import { useMemo } from 'react';
import { useDWD } from '../DWDContext';
import { ViewHeader, EmptyState } from '../../../ui';

// MUI Icons
import TimelineIcon from '@mui/icons-material/Timeline';
import FolderIcon from '@mui/icons-material/Folder';
import WarningIcon from '@mui/icons-material/Warning';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TuneIcon from '@mui/icons-material/Tune';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UndoIcon from '@mui/icons-material/Undo';
import AddIcon from '@mui/icons-material/Add';

const TYPE_CONFIG = {
  dwd_case: { icon: FolderIcon, color: '#6366f1', label: 'Case' },
  dwd_signal: { icon: WarningIcon, color: '#ef4444', label: 'Signal' },
  dwd_work_item: { icon: AssignmentIcon, color: '#3b82f6', label: 'Work Item' },
  dwd_actor: { icon: PersonIcon, color: '#8b5cf6', label: 'Actor' },
  dwd_adjustment: { icon: TuneIcon, color: '#10b981', label: 'Adjustment' },
  dwd_learning: { icon: LightbulbIcon, color: '#06b6d4', label: 'Learning' },
};

const STATUS_CONFIG = {
  proposed: { icon: AddIcon, color: '#9ca3af', label: 'Proposed' },
  trying: { icon: PlayArrowIcon, color: '#f59e0b', label: 'Trying' },
  adopted: { icon: CheckCircleIcon, color: '#10b981', label: 'Adopted' },
  reverted: { icon: UndoIcon, color: '#ef4444', label: 'Reverted' },
};

export default function CaseTimeline({ onEditArtefact, onSelectArtefact }) {
  const { activeCase, artefacts, relationships } = useDWD();

  // Build timeline events from artefacts
  const timelineEvents = useMemo(() => {
    if (!activeCase) return [];

    // Get all artefacts related to this case
    const relatedIds = relationships
      .filter(r => r.from_artefact_id === activeCase.id || r.to_artefact_id === activeCase.id)
      .map(r => r.from_artefact_id === activeCase.id ? r.to_artefact_id : r.from_artefact_id);

    const caseArtefacts = artefacts.filter(a =>
      a.id === activeCase.id ||
      relatedIds.includes(a.id) ||
      a.custom_fields?.case_id === activeCase.id
    );

    // Create timeline events
    const events = [];

    // Add case creation
    events.push({
      id: `${activeCase.id}-created`,
      type: 'creation',
      artefactType: 'dwd_case',
      title: 'Case Created',
      description: activeCase.name,
      timestamp: activeCase.created_at,
      artefact: activeCase,
    });

    // Add artefact creations
    caseArtefacts.forEach(a => {
      if (a.id !== activeCase.id) {
        events.push({
          id: `${a.id}-created`,
          type: 'creation',
          artefactType: a.artefact_type,
          title: `${TYPE_CONFIG[a.artefact_type]?.label || 'Item'} Added`,
          description: a.name,
          timestamp: a.created_at,
          artefact: a,
        });
      }

      // Add adjustment status changes
      if (a.artefact_type === 'dwd_adjustment') {
        const status = a.custom_fields?.adjustment_status;
        if (status && status !== 'proposed') {
          events.push({
            id: `${a.id}-status-${status}`,
            type: 'status_change',
            artefactType: a.artefact_type,
            title: `Adjustment ${STATUS_CONFIG[status]?.label || status}`,
            description: a.name,
            timestamp: a.updated_at,
            status,
            artefact: a,
          });
        }
      }
    });

    // Sort by timestamp (newest first)
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return events;
  }, [activeCase, artefacts, relationships]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups = {};
    timelineEvents.forEach(event => {
      const date = new Date(event.timestamp).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });
    return groups;
  }, [timelineEvents]);

  if (!activeCase) {
    return (
      <div className="dwd-timeline">
        <EmptyState
          icon={TimelineIcon}
          iconColor="#6366f1"
          title="No Case Selected"
          description="Select a work situation to view its timeline"
        />
      </div>
    );
  }

  return (
    <div className="dwd-timeline">
      {/* Header */}
      <ViewHeader
        icon={TimelineIcon}
        iconColor="#6366f1"
        title="Case Timeline"
        subtitle={activeCase.name}
        description="History of changes and events for this work situation"
      />

      {/* Timeline */}
      <div className="dwd-timeline__content">
        {Object.entries(groupedEvents).length === 0 ? (
          <EmptyState
            icon={TimelineIcon}
            iconColor="#6366f1"
            title="No Events Yet"
            description="Events will appear here as the case evolves"
          />
        ) : (
          Object.entries(groupedEvents).map(([date, events]) => (
            <div key={date} className="dwd-timeline-group">
              <div className="dwd-timeline-group__date">{date}</div>
              <div className="dwd-timeline-group__events">
                {events.map(event => {
                  const typeConfig = TYPE_CONFIG[event.artefactType] || {};
                  const Icon = event.type === 'status_change'
                    ? STATUS_CONFIG[event.status]?.icon || TuneIcon
                    : typeConfig.icon || AssignmentIcon;
                  const color = event.type === 'status_change'
                    ? STATUS_CONFIG[event.status]?.color
                    : typeConfig.color;

                  return (
                    <div
                      key={event.id}
                      className="dwd-timeline-event"
                      onClick={() => onSelectArtefact?.(event.artefact)}
                    >
                      <div
                        className="dwd-timeline-event__icon"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        <Icon fontSize="small" />
                      </div>
                      <div className="dwd-timeline-event__content">
                        <span className="dwd-timeline-event__title">{event.title}</span>
                        <span className="dwd-timeline-event__desc">{event.description}</span>
                        <span className="dwd-timeline-event__time">
                          {new Date(event.timestamp).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
