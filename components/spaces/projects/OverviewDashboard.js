/**
 * OverviewDashboard.js
 *
 * Main overview dashboard for Project Studio.
 * Shows project health, lifecycle stage, key metrics, and quick access.
 */

import { useMemo } from 'react';
import { useProjectStudio } from './ProjectContext';
import {
  PROJECT_STAGES,
  PROJECT_STAGE_INFO,
  PROJECT_HEALTH_INFO,
} from '../../../lib/project-types';

// Shared UI components
import {
  ViewHeader,
  ContentArea,
  Card,
  QuickStart,
  EmptyState,
  Button,
} from '@/components/ui';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArchiveIcon from '@mui/icons-material/Archive';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// Stage icons mapping
const STAGE_ICONS = {
  [PROJECT_STAGES.INITIATION]: PlayCircleIcon,
  [PROJECT_STAGES.PLANNING]: AssignmentIcon,
  [PROJECT_STAGES.EXECUTION]: RocketLaunchIcon,
  [PROJECT_STAGES.CLOSING]: CheckCircleIcon,
  [PROJECT_STAGES.CLOSED]: ArchiveIcon,
};

export default function OverviewDashboard({ onNavigate, onCreateArtefact }) {
  const {
    activeProject,
    artefacts,
    stats,
    currentStage,
    projectHealth,
    getArtefactsByType,
    getMilestonesByDate,
    getRisksByScore,
  } = useProjectStudio();

  // Get upcoming milestones
  const upcomingMilestones = useMemo(() => {
    return getMilestonesByDate()
      .filter(m => m.custom_fields?.status === 'upcoming')
      .slice(0, 3);
  }, [getMilestonesByDate]);

  // Get top risks
  const topRisks = useMemo(() => {
    return getRisksByScore()
      .filter(r => r.custom_fields?.status === 'open')
      .slice(0, 3);
  }, [getRisksByScore]);

  // Get open issues
  const openIssues = useMemo(() => {
    return getArtefactsByType('issue')
      .filter(i => i.custom_fields?.status === 'open')
      .slice(0, 3);
  }, [getArtefactsByType]);

  // Get health info
  const healthInfo = PROJECT_HEALTH_INFO[projectHealth] || PROJECT_HEALTH_INFO.amber;

  // If no project selected
  if (!activeProject) {
    return (
      <>
        <ViewHeader
          icon={DashboardIcon}
          iconColor="#47453F"
          title="Project Studio"
          description="Select or create a project to get started"
        />
        <ContentArea>
          <QuickStart
            icon={PlayCircleIcon}
            iconColor="#6366f1"
            title="Welcome to Project Studio"
            description="This is where approved initiatives become delivery projects. Manage the full project lifecycle from initiation through closure."
            steps={[
              'Select an existing project from the navigator',
              'Or create a new project from a Blueprint initiative',
              'Track RAID items, milestones, and change management',
            ]}
            actionLabel="Create Project"
            onAction={() => onCreateArtefact?.('project')}
            tip="Projects flow from Blueprint initiatives through Analysis."
          />
        </ContentArea>
      </>
    );
  }

  // If no artefacts yet
  if (artefacts.length === 0) {
    return (
      <>
        <ViewHeader
          icon={DashboardIcon}
          iconColor="#47453F"
          title={activeProject.name}
          description={`Stage: ${currentStage.name}`}
        />
        <ContentArea>
          <div className="project-overview-onboarding">
            {/* Current Stage Card */}
            <Card className="project-stage-card">
              <Card.Header>
                <span style={{ fontWeight: 600 }}>Current Stage: {currentStage.name}</span>
              </Card.Header>
              <Card.Section>
                <p style={{ margin: 0, marginBottom: '1rem' }}>{currentStage.description}</p>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}>Key Activities:</h4>
                <ul className="project-activities-list">
                  {currentStage.keyActivities?.map((activity, i) => (
                    <li key={i}>{activity}</li>
                  ))}
                </ul>
              </Card.Section>
            </Card>

            {/* Getting Started */}
            <div className="project-getting-started">
              <h3>Get Started</h3>
              <div className="project-steps-grid">
                <Card onClick={() => onCreateArtefact?.('milestone')} className="project-step-card">
                  <div className="project-step-icon">
                    <FlagIcon style={{ color: '#f59e0b', fontSize: 28 }} />
                  </div>
                  <h4>Define Milestones</h4>
                  <p>Set key checkpoints for tracking progress</p>
                  <Button variant="secondary" size="small">Add Milestone</Button>
                </Card>

                <Card onClick={() => onCreateArtefact?.('risk')} className="project-step-card">
                  <div className="project-step-icon">
                    <WarningIcon style={{ color: '#ef4444', fontSize: 28 }} />
                  </div>
                  <h4>Identify Risks</h4>
                  <p>Capture potential threats early</p>
                  <Button variant="secondary" size="small">Add Risk</Button>
                </Card>

                <Card onClick={() => onNavigate?.('wbs')} className="project-step-card">
                  <div className="project-step-icon">
                    <AccountTreeIcon style={{ color: '#3b82f6', fontSize: 28 }} />
                  </div>
                  <h4>Create WBS</h4>
                  <p>Break down the work into deliverables</p>
                  <Button variant="secondary" size="small">Build WBS</Button>
                </Card>
              </div>
            </div>
          </div>
        </ContentArea>
      </>
    );
  }

  // Main dashboard view
  return (
    <>
      <ViewHeader
        icon={DashboardIcon}
        iconColor="#47453F"
        title={activeProject.name}
        description={`${currentStage.name} | ${activeProject.custom_fields?.percent_complete || 0}% Complete`}
      />
      <ContentArea>
        <div className="project-overview-dashboard">
          {/* Health & Stage Banner */}
          <div className="project-status-banner">
            <div className="project-health-indicator" style={{ '--health-color': healthInfo.color }}>
              <span className="health-label">{healthInfo.name}</span>
            </div>
            <div className="project-stage-progress">
              {Object.values(PROJECT_STAGE_INFO).map((stage, idx) => {
                const StageIcon = STAGE_ICONS[stage.id];
                const isCurrent = stage.id === currentStage.id;
                const isPast = stage.order < currentStage.order;
                return (
                  <div
                    key={stage.id}
                    className={`stage-pip ${isCurrent ? 'current' : ''} ${isPast ? 'completed' : ''}`}
                    onClick={() => onNavigate?.(stage.id)}
                    title={stage.name}
                  >
                    <StageIcon fontSize="small" />
                    <span className="stage-name">{stage.shortName}</span>
                    {idx < 4 && <ChevronRightIcon className="stage-arrow" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="project-overview-grid">
            {/* Left Column */}
            <div className="project-overview-col">
              {/* RAID Summary */}
              <Card>
                <Card.Header>
                  <WarningIcon style={{ fontSize: 18 }} />
                  <span>RAID Summary</span>
                  <button className="card-action" onClick={() => onNavigate?.('raid')}>
                    View All
                  </button>
                </Card.Header>
                <Card.Section>
                  <div className="project-raid-grid">
                    <div
                      className="raid-stat"
                      onClick={() => onNavigate?.('risks')}
                    >
                      <span className="raid-count" style={{ color: '#ef4444' }}>
                        {stats.openRisks}
                      </span>
                      <span className="raid-label">Risks</span>
                    </div>
                    <div
                      className="raid-stat"
                      onClick={() => onNavigate?.('assumptions')}
                    >
                      <span className="raid-count" style={{ color: '#f59e0b' }}>
                        {stats.activeAssumptions}
                      </span>
                      <span className="raid-label">Assumptions</span>
                    </div>
                    <div
                      className="raid-stat"
                      onClick={() => onNavigate?.('issues')}
                    >
                      <span className="raid-count" style={{ color: '#ef4444' }}>
                        {stats.openIssues}
                      </span>
                      <span className="raid-label">Issues</span>
                    </div>
                    <div
                      className="raid-stat"
                      onClick={() => onNavigate?.('dependencies')}
                    >
                      <span className="raid-count" style={{ color: '#64748b' }}>
                        {stats.activeDependencies}
                      </span>
                      <span className="raid-label">Dependencies</span>
                    </div>
                  </div>
                </Card.Section>
              </Card>

              {/* Top Risks */}
              {topRisks.length > 0 && (
                <Card>
                  <Card.Header>
                    <WarningIcon style={{ fontSize: 18, color: '#ef4444' }} />
                    <span>Top Risks</span>
                  </Card.Header>
                  <Card.Section>
                    <div className="project-risk-list">
                      {topRisks.map(risk => (
                        <div
                          key={risk.id}
                          className="risk-item"
                          onClick={() => onNavigate?.('risks')}
                        >
                          <span className={`risk-score risk-score--${risk.score > 6 ? 'high' : risk.score > 3 ? 'medium' : 'low'}`}>
                            {risk.score}
                          </span>
                          <span className="risk-description">
                            {risk.custom_fields?.description || risk.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card.Section>
                </Card>
              )}

              {/* Open Issues */}
              {openIssues.length > 0 && (
                <Card>
                  <Card.Header>
                    <ErrorIcon style={{ fontSize: 18, color: '#ef4444' }} />
                    <span>Open Issues</span>
                  </Card.Header>
                  <Card.Section>
                    <div className="project-issue-list">
                      {openIssues.map(issue => (
                        <div
                          key={issue.id}
                          className="issue-item"
                          onClick={() => onNavigate?.('issues')}
                        >
                          <span className={`issue-priority issue-priority--${issue.custom_fields?.priority}`}>
                            {issue.custom_fields?.priority}
                          </span>
                          <span className="issue-description">
                            {issue.custom_fields?.description || issue.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card.Section>
                </Card>
              )}
            </div>

            {/* Right Column */}
            <div className="project-overview-col">
              {/* Upcoming Milestones */}
              <Card>
                <Card.Header>
                  <FlagIcon style={{ fontSize: 18, color: '#f59e0b' }} />
                  <span>Upcoming Milestones</span>
                  <button className="card-action" onClick={() => onNavigate?.('milestones')}>
                    View All
                  </button>
                </Card.Header>
                <Card.Section>
                  {upcomingMilestones.length === 0 ? (
                    <EmptyState
                      icon={FlagIcon}
                      title="No milestones yet"
                      description="Add milestones to track key project checkpoints"
                      actionLabel="Add Milestone"
                      onAction={() => onCreateArtefact?.('milestone')}
                    />
                  ) : (
                    <div className="project-milestone-list">
                      {upcomingMilestones.map(milestone => (
                        <div key={milestone.id} className="milestone-item">
                          <FlagIcon fontSize="small" style={{ color: '#f59e0b' }} />
                          <div className="milestone-info">
                            <span className="milestone-name">{milestone.name}</span>
                            <span className="milestone-date">
                              {new Date(milestone.custom_fields?.planned_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Section>
              </Card>

              {/* Quick Actions */}
              <Card>
                <Card.Header>
                  <LightbulbIcon style={{ fontSize: 18 }} />
                  <span>Quick Actions</span>
                </Card.Header>
                <Card.Section>
                  <div className="project-quick-actions">
                    <Button
                      variant="secondary"
                      onClick={() => onNavigate?.('status')}
                    >
                      Create Status Report
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onCreateArtefact?.('risk')}
                    >
                      Log Risk
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onCreateArtefact?.('issue')}
                    >
                      Log Issue
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onCreateArtefact?.('decision')}
                    >
                      Record Decision
                    </Button>
                  </div>
                </Card.Section>
              </Card>

              {/* Project Info */}
              <Card>
                <Card.Header>
                  <TrendingUpIcon style={{ fontSize: 18 }} />
                  <span>Project Info</span>
                </Card.Header>
                <Card.Section>
                  <div className="project-info-grid">
                    <div className="info-item">
                      <span className="info-label">Start Date</span>
                      <span className="info-value">
                        {activeProject.custom_fields?.start_date
                          ? new Date(activeProject.custom_fields.start_date).toLocaleDateString()
                          : 'Not set'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">End Date</span>
                      <span className="info-value">
                        {activeProject.custom_fields?.end_date
                          ? new Date(activeProject.custom_fields.end_date).toLocaleDateString()
                          : 'Not set'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Sponsor</span>
                      <span className="info-value">
                        {activeProject.custom_fields?.sponsor || 'Not assigned'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">PM</span>
                      <span className="info-value">
                        {activeProject.custom_fields?.project_manager || 'Not assigned'}
                      </span>
                    </div>
                  </div>
                </Card.Section>
              </Card>
            </div>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
