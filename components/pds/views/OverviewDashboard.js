// components/pds/views/OverviewDashboard.js
// Project Canvas - Overview dashboard for PDS workspace
// Phase 4: To be fully implemented

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import {
  ViewHeader,
  SummaryBar,
  SummaryItem,
  Card,
  EmptyState,
  Button
} from '../../ui';
import { HealthWheel, ProgressCardGroup, MiniProgressCard } from '../../ui';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';

export default function OverviewDashboard({
  onNavigate,
  onSelectArtefact,
  onCreateArtefact,
  onEditArtefact,
  onDeleteArtefact,
}) {
  const {
    activePdsProject,
    artefacts,
    stats,
    projectHealth,
    stageCompletion,
    PDS_STAGE_INFO,
  } = usePDS();

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!artefacts.length) return null;

    return {
      stakeholders: artefacts.filter(a => a.artefact_type === 'pds_stakeholder').length,
      deliverables: artefacts.filter(a => a.artefact_type === 'pds_deliverable').length,
      risks: artefacts.filter(a => a.artefact_type === 'pds_risk').length,
      issues: artefacts.filter(a => a.artefact_type === 'pds_issue' &&
        a.custom_fields?.status !== 'resolved').length,
      milestones: artefacts.filter(a => a.artefact_type === 'pds_milestone').length,
    };
  }, [artefacts]);

  // Prepare health wheel data
  const healthData = useMemo(() => {
    if (!stageCompletion || !PDS_STAGE_INFO) return [];

    return Object.entries(PDS_STAGE_INFO).map(([id, stage]) => ({
      label: stage.shortName || stage.name?.split(' ')[0] || id,
      value: stageCompletion[id] || 0,
      color: stage.color || '#64748b',
    }));
  }, [stageCompletion, PDS_STAGE_INFO]);

  // No project selected
  if (!activePdsProject) {
    return (
      <div className="pds-view">
        <EmptyState
          icon={DashboardIcon}
          title="No Project Selected"
          description="Select or create a project to begin designing your project delivery approach."
          action={
            <Button variant="primary" onClick={() => onCreateArtefact?.('pds_project')}>
              <AddIcon fontSize="small" />
              Create Project
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="pds-view">
      <ViewHeader
        icon={DashboardIcon}
        title="Project Overview"
        description={activePdsProject.vision || 'Your project at a glance'}
      />

      {/* Summary stats */}
      {summaryStats && (
        <SummaryBar>
          <SummaryItem
            icon={PeopleIcon}
            label="Stakeholders"
            value={summaryStats.stakeholders}
            onClick={() => onNavigate?.('stakeholders')}
          />
          <SummaryItem
            icon={AssignmentIcon}
            label="Deliverables"
            value={summaryStats.deliverables}
            onClick={() => onNavigate?.('structure')}
          />
          <SummaryItem
            icon={WarningIcon}
            label="Active Risks"
            value={summaryStats.risks}
            onClick={() => onNavigate?.('risk')}
          />
          <SummaryItem
            icon={FlagIcon}
            label="Milestones"
            value={summaryStats.milestones}
            onClick={() => onNavigate?.('timeline')}
          />
        </SummaryBar>
      )}

      <div className="pds-view__content">
        <div className="pds-overview-grid">
          {/* Health Wheel */}
          <Card className="pds-overview-card">
            <Card.Header>
              <Card.Title>Project Health</Card.Title>
            </Card.Header>
            <Card.Body>
              {healthData.length > 0 ? (
                <HealthWheel spaces={healthData} size={200} />
              ) : (
                <p className="pds-overview-card__empty">
                  Add artefacts to see health metrics
                </p>
              )}
            </Card.Body>
          </Card>

          {/* Stage Progress */}
          <Card className="pds-overview-card">
            <Card.Header>
              <Card.Title>Stage Progress</Card.Title>
            </Card.Header>
            <Card.Body>
              <ProgressCardGroup>
                {PDS_STAGE_INFO && Object.entries(PDS_STAGE_INFO).map(([id, stage]) => (
                  <MiniProgressCard
                    key={id}
                    title={stage.name || id}
                    value={`${stageCompletion?.[id] || 0}%`}
                    status={
                      (stageCompletion?.[id] || 0) >= 80 ? 'green' :
                      (stageCompletion?.[id] || 0) >= 40 ? 'amber' : 'red'
                    }
                    onClick={() => onNavigate?.(id)}
                  />
                ))}
              </ProgressCardGroup>
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="pds-overview-card">
            <Card.Header>
              <Card.Title>Quick Actions</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="pds-quick-actions">
                <Button
                  variant="secondary"
                  onClick={() => onCreateArtefact?.('pds_stakeholder')}
                >
                  <PeopleIcon fontSize="small" />
                  Add Stakeholder
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onCreateArtefact?.('pds_deliverable')}
                >
                  <AssignmentIcon fontSize="small" />
                  Add Deliverable
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onCreateArtefact?.('pds_risk')}
                >
                  <WarningIcon fontSize="small" />
                  Log Risk
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onCreateArtefact?.('pds_milestone')}
                >
                  <FlagIcon fontSize="small" />
                  Set Milestone
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Recent Activity */}
          <Card className="pds-overview-card pds-overview-card--wide">
            <Card.Header>
              <Card.Title>Recent Activity</Card.Title>
            </Card.Header>
            <Card.Body>
              {artefacts.length > 0 ? (
                <div className="pds-recent-list">
                  {artefacts.slice(0, 5).map(artefact => (
                    <div
                      key={artefact.id}
                      className="pds-recent-item"
                      onClick={() => onSelectArtefact?.(artefact)}
                    >
                      <span className="pds-recent-item__name">
                        {artefact.name}
                      </span>
                      <span className="pds-recent-item__type">
                        {artefact.artefact_type?.replace('pds_', '')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="pds-overview-card__empty">
                  No recent activity
                </p>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
