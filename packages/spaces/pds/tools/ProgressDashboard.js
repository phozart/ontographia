// components/pds/tools/ProgressDashboard.js
// Progress Dashboard Tool - RAG status cards with burn-up chart
// Phase 5: To be fully implemented

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Card, EmptyState, Button } from '../../../ui';
import { ProgressCardGroup, ProgressCard } from '../../../ui';

// MUI Icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddIcon from '@mui/icons-material/Add';

export default function ProgressDashboard({
  onSelectArtefact,
  onCreateArtefact,
}) {
  const { artefacts, stats, projectHealth } = usePDS();

  // Get latest status update
  const latestStatus = useMemo(() => {
    const statusUpdates = artefacts
      .filter(a => a.artefact_type === 'pds_status_update')
      .sort((a, b) =>
        new Date(b.custom_fields?.date || b.created_at) -
        new Date(a.custom_fields?.date || a.created_at)
      );
    return statusUpdates[0] || null;
  }, [artefacts]);

  // Calculate deliverable progress
  const deliverableProgress = useMemo(() => {
    const deliverables = artefacts.filter(a => a.artefact_type === 'pds_deliverable');
    if (deliverables.length === 0) return null;

    const completed = deliverables.filter(d =>
      d.custom_fields?.status === 'completed'
    ).length;
    const inProgress = deliverables.filter(d =>
      d.custom_fields?.status === 'in_progress'
    ).length;

    return {
      total: deliverables.length,
      completed,
      inProgress,
      notStarted: deliverables.length - completed - inProgress,
      percentage: Math.round((completed / deliverables.length) * 100),
    };
  }, [artefacts]);

  // Calculate milestone progress
  const milestoneProgress = useMemo(() => {
    const milestones = artefacts.filter(a => a.artefact_type === 'pds_milestone');
    if (milestones.length === 0) return null;

    const achieved = milestones.filter(m =>
      m.custom_fields?.status === 'achieved' ||
      m.custom_fields?.status === 'completed'
    ).length;

    return {
      total: milestones.length,
      achieved,
      upcoming: milestones.length - achieved,
      percentage: Math.round((achieved / milestones.length) * 100),
    };
  }, [artefacts]);

  // Count open issues
  const openIssues = useMemo(() =>
    artefacts.filter(a =>
      a.artefact_type === 'pds_issue' &&
      a.custom_fields?.status !== 'resolved' &&
      a.custom_fields?.status !== 'closed'
    ).length,
    [artefacts]
  );

  return (
    <div className="pds-view">
      <ViewHeader
        icon={AssessmentIcon}
        title="Progress Dashboard"
        description="Track overall project progress and key metrics"
      />

      <div className="pds-view__content">
        {/* RAG Status */}
        <div className="pds-section">
          <h2 className="pds-section__title">Overall Status</h2>
          {latestStatus ? (
            <ProgressCardGroup>
              <ProgressCard
                title="Overall"
                status={latestStatus.custom_fields?.overall_status || 'unknown'}
                subtitle="Project Status"
              />
              <ProgressCard
                title="Schedule"
                status={latestStatus.custom_fields?.schedule_status || 'unknown'}
                subtitle="Timeline Health"
              />
              <ProgressCard
                title="Budget"
                status={latestStatus.custom_fields?.budget_status || 'unknown'}
                subtitle="Financial Health"
              />
              <ProgressCard
                title="Quality"
                status={latestStatus.custom_fields?.quality_status || 'unknown'}
                subtitle="Quality Health"
              />
            </ProgressCardGroup>
          ) : (
            <EmptyState
              icon={AssessmentIcon}
              title="No Status Updates"
              description="Log a status update to track project health."
              action={
                <Button variant="primary" onClick={() => onCreateArtefact?.('pds_status_update')}>
                  <AddIcon fontSize="small" /> Log Status Update
                </Button>
              }
            />
          )}
        </div>

        {/* Progress Metrics */}
        <div className="pds-progress-metrics">
          {/* Deliverables */}
          {deliverableProgress && (
            <Card className="pds-progress-card">
              <Card.Header>
                <Card.Title>Deliverables</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="pds-progress-bar">
                  <div
                    className="pds-progress-bar__fill pds-progress-bar__fill--completed"
                    style={{ width: `${deliverableProgress.percentage}%` }}
                  />
                </div>
                <div className="pds-progress-stats">
                  <span>{deliverableProgress.completed} completed</span>
                  <span>{deliverableProgress.inProgress} in progress</span>
                  <span>{deliverableProgress.notStarted} not started</span>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Milestones */}
          {milestoneProgress && (
            <Card className="pds-progress-card">
              <Card.Header>
                <Card.Title>Milestones</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="pds-progress-bar">
                  <div
                    className="pds-progress-bar__fill pds-progress-bar__fill--achieved"
                    style={{ width: `${milestoneProgress.percentage}%` }}
                  />
                </div>
                <div className="pds-progress-stats">
                  <span>{milestoneProgress.achieved} achieved</span>
                  <span>{milestoneProgress.upcoming} upcoming</span>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Issues */}
          <Card className="pds-progress-card">
            <Card.Header>
              <Card.Title>Open Issues</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="pds-big-number">
                <span className={`pds-big-number__value ${openIssues > 0 ? 'pds-big-number__value--warning' : ''}`}>
                  {openIssues}
                </span>
                <span className="pds-big-number__label">
                  {openIssues === 1 ? 'issue' : 'issues'} requiring attention
                </span>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
