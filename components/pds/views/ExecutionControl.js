// components/pds/views/ExecutionControl.js
// Execution & Control - Stage 4 view for PDS workspace
// Phase 4: To be fully implemented

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Card, EmptyState, Button } from '../../ui';
import { ProgressCardGroup, ProgressCard } from '../../ui';

// MUI Icons
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import BugReportIcon from '@mui/icons-material/BugReport';
import GavelIcon from '@mui/icons-material/Gavel';

export default function ExecutionControl({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
  onNavigate,
}) {
  const { artefacts, getArtefactsByStage, PDS_STAGES } = usePDS();

  const stageArtefacts = useMemo(() => getArtefactsByStage('control'), [getArtefactsByStage]);
  const stage = PDS_STAGES?.control;

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

  return (
    <div className="pds-view">
      <ViewHeader
        icon={PlayCircleIcon}
        title="Execution & Control"
        description={stage?.description || "Track progress and adapt"}
        color={stage?.color}
      />

      <div className="pds-view__content">
        {stageArtefacts.length === 0 ? (
          <EmptyState
            icon={PlayCircleIcon}
            title="Track Your Progress"
            description="Record status updates, log changes, and capture decisions as your project executes."
            action={
              <div className="pds-view__actions">
                <Button variant="primary" onClick={() => onCreateArtefact?.('pds_status_update')}>
                  <AssessmentIcon fontSize="small" /> Log Status Update
                </Button>
                <Button variant="secondary" onClick={() => onCreateArtefact?.('pds_change_request')}>
                  <ChangeCircleIcon fontSize="small" /> Submit Change Request
                </Button>
              </div>
            }
          />
        ) : (
          <>
            {/* Current Status */}
            {latestStatus && (
              <div className="pds-section">
                <div className="pds-section__header">
                  <h2 className="pds-section__title">
                    <AssessmentIcon fontSize="small" /> Current Status
                  </h2>
                  <Button size="small" onClick={() => onCreateArtefact?.('pds_status_update')}>
                    <AddIcon fontSize="small" /> Update
                  </Button>
                </div>
                <Card onClick={() => onSelectArtefact?.(latestStatus)}>
                  <Card.Body>
                    <ProgressCardGroup>
                      <ProgressCard
                        title="Overall"
                        status={latestStatus.custom_fields?.overall_status || 'unknown'}
                      />
                      <ProgressCard
                        title="Schedule"
                        status={latestStatus.custom_fields?.schedule_status || 'unknown'}
                      />
                      <ProgressCard
                        title="Budget"
                        status={latestStatus.custom_fields?.budget_status || 'unknown'}
                      />
                      <ProgressCard
                        title="Quality"
                        status={latestStatus.custom_fields?.quality_status || 'unknown'}
                      />
                    </ProgressCardGroup>
                    <div className="pds-status-date">
                      Last updated: {latestStatus.custom_fields?.date
                        ? new Date(latestStatus.custom_fields.date).toLocaleDateString()
                        : 'Unknown'}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}

            {/* Pending Change Requests */}
            {pendingChanges.length > 0 && (
              <div className="pds-section">
                <div className="pds-section__header">
                  <h2 className="pds-section__title">
                    <ChangeCircleIcon fontSize="small" /> Pending Changes
                    <span className="pds-section__count">{pendingChanges.length}</span>
                  </h2>
                  <Button size="small" onClick={() => onCreateArtefact?.('pds_change_request')}>
                    <AddIcon fontSize="small" /> Add
                  </Button>
                </div>
                <div className="pds-cards-grid">
                  {pendingChanges.map(item => (
                    <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                      <Card.Header>
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Badge variant={
                          item.custom_fields?.priority === 'critical' ? 'danger' :
                          item.custom_fields?.priority === 'high' ? 'warning' : 'default'
                        }>
                          {item.custom_fields?.priority || 'medium'}
                        </Card.Badge>
                      </Card.Header>
                      <Card.Body>
                        {item.description?.substring(0, 100)}
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Decisions */}
            <div className="pds-section">
              <div className="pds-section__header">
                <h2 className="pds-section__title">
                  <GavelIcon fontSize="small" /> Decisions
                  <span className="pds-section__count">{grouped.decisions.length}</span>
                </h2>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_decision')}>
                  <AddIcon fontSize="small" /> Add
                </Button>
              </div>
              <div className="pds-cards-grid">
                {grouped.decisions.slice(0, 6).map(item => (
                  <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                    <Card.Header>
                      <Card.Title>{item.name}</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      {item.custom_fields?.chosen_option || 'Decision pending'}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>

            {/* Exceptions */}
            {grouped.exceptions.length > 0 && (
              <div className="pds-section">
                <div className="pds-section__header">
                  <h2 className="pds-section__title">
                    <BugReportIcon fontSize="small" /> Exceptions
                    <span className="pds-section__count">{grouped.exceptions.length}</span>
                  </h2>
                </div>
                <div className="pds-cards-grid">
                  {grouped.exceptions.map(item => (
                    <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                      <Card.Header>
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Badge variant="danger">Exception</Card.Badge>
                      </Card.Header>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
