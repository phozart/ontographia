/**
 * PortfolioDashboard.js
 *
 * Portfolio view - aggregated dashboard of all projects.
 * This is a VIEW within Project Studio, not a separate space.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';

export default function PortfolioDashboard({ onSelectProject, onCreateArtefact }) {
  const { artefacts, stats } = useProjectStudio();

  // Get all projects from artefacts
  const projects = useMemo(() => {
    return artefacts.filter(a => a.type === 'project');
  }, [artefacts]);

  // Calculate portfolio-level stats
  const portfolioStats = useMemo(() => {
    const byHealth = {
      green: projects.filter(p => p.custom_fields?.health === 'green').length,
      amber: projects.filter(p => p.custom_fields?.health === 'amber').length,
      red: projects.filter(p => p.custom_fields?.health === 'red').length,
    };

    const byStage = {
      initiation: projects.filter(p => p.custom_fields?.stage === 'initiation').length,
      planning: projects.filter(p => p.custom_fields?.stage === 'planning').length,
      execution: projects.filter(p => p.custom_fields?.stage === 'execution').length,
      closing: projects.filter(p => p.custom_fields?.stage === 'closing').length,
      closed: projects.filter(p => p.custom_fields?.stage === 'closed').length,
    };

    const totalBudget = projects.reduce((sum, p) => sum + (p.custom_fields?.budget || 0), 0);
    const spentBudget = projects.reduce((sum, p) => sum + (p.custom_fields?.spent || 0), 0);

    return {
      total: projects.length,
      active: projects.filter(p => p.custom_fields?.stage !== 'closed').length,
      byHealth,
      byStage,
      totalBudget,
      spentBudget,
      budgetUtilization: totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0,
    };
  }, [projects]);

  // Get projects needing attention (red or amber health)
  const attentionProjects = useMemo(() => {
    return projects
      .filter(p => ['red', 'amber'].includes(p.custom_fields?.health))
      .sort((a, b) => {
        const healthOrder = { red: 0, amber: 1 };
        return healthOrder[a.custom_fields?.health] - healthOrder[b.custom_fields?.health];
      });
  }, [projects]);

  const getHealthColor = (health) => {
    switch (health) {
      case 'green': return '#22c55e';
      case 'amber': return '#f59e0b';
      case 'red': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'green': return <CheckCircleIcon style={{ color: '#22c55e', fontSize: 18 }} />;
      case 'amber': return <WarningIcon style={{ color: '#f59e0b', fontSize: 18 }} />;
      case 'red': return <WarningIcon style={{ color: '#ef4444', fontSize: 18 }} />;
      default: return <ScheduleIcon style={{ color: '#9ca3af', fontSize: 18 }} />;
    }
  };

  return (
    <>
      <ViewHeader
        icon={DashboardIcon}
        iconColor="#3b82f6"
        title="Portfolio Dashboard"
        description="Aggregated view of all projects"
        count={portfolioStats.total}
        createLabel="New Project"
        onCreate={() => onCreateArtefact?.('project')}
      />
      <ContentArea>
        <div className="portfolio-dashboard">
          {/* Portfolio Summary */}
          <div className="portfolio-summary">
            <Card className="summary-card">
              <Card.Header>
                <FolderIcon style={{ color: '#3b82f6', fontSize: 20 }} />
                <span>Projects</span>
              </Card.Header>
              <Card.Section>
                <div className="summary-value">{portfolioStats.total}</div>
                <div className="summary-detail">{portfolioStats.active} active</div>
              </Card.Section>
            </Card>

            <Card className="summary-card">
              <Card.Header>
                <TrendingUpIcon style={{ color: '#22c55e', fontSize: 20 }} />
                <span>Health</span>
              </Card.Header>
              <Card.Section>
                <div className="health-breakdown">
                  <div className="health-item">
                    <span className="health-dot" style={{ backgroundColor: '#22c55e' }} />
                    <span>{portfolioStats.byHealth.green}</span>
                  </div>
                  <div className="health-item">
                    <span className="health-dot" style={{ backgroundColor: '#f59e0b' }} />
                    <span>{portfolioStats.byHealth.amber}</span>
                  </div>
                  <div className="health-item">
                    <span className="health-dot" style={{ backgroundColor: '#ef4444' }} />
                    <span>{portfolioStats.byHealth.red}</span>
                  </div>
                </div>
              </Card.Section>
            </Card>

            <Card className="summary-card">
              <Card.Header>
                <ScheduleIcon style={{ color: '#8b5cf6', fontSize: 20 }} />
                <span>By Stage</span>
              </Card.Header>
              <Card.Section>
                <div className="stage-breakdown">
                  <div className="stage-item">
                    <span className="stage-label">Initiation</span>
                    <span className="stage-count">{portfolioStats.byStage.initiation}</span>
                  </div>
                  <div className="stage-item">
                    <span className="stage-label">Planning</span>
                    <span className="stage-count">{portfolioStats.byStage.planning}</span>
                  </div>
                  <div className="stage-item">
                    <span className="stage-label">Execution</span>
                    <span className="stage-count">{portfolioStats.byStage.execution}</span>
                  </div>
                  <div className="stage-item">
                    <span className="stage-label">Closing</span>
                    <span className="stage-count">{portfolioStats.byStage.closing}</span>
                  </div>
                </div>
              </Card.Section>
            </Card>

            {portfolioStats.totalBudget > 0 && (
              <Card className="summary-card">
                <Card.Header>
                  <span>Budget</span>
                </Card.Header>
                <Card.Section>
                  <div className="budget-summary">
                    <div className="budget-amount">
                      ${portfolioStats.spentBudget.toLocaleString()}
                      <span className="budget-total"> / ${portfolioStats.totalBudget.toLocaleString()}</span>
                    </div>
                    <div className="budget-bar">
                      <div
                        className="budget-fill"
                        style={{
                          width: `${portfolioStats.budgetUtilization}%`,
                          backgroundColor: portfolioStats.budgetUtilization > 90 ? '#ef4444' : '#3b82f6'
                        }}
                      />
                    </div>
                    <div className="budget-percent">{portfolioStats.budgetUtilization}% utilized</div>
                  </div>
                </Card.Section>
              </Card>
            )}
          </div>

          {/* Projects Needing Attention */}
          {attentionProjects.length > 0 && (
            <Card className="attention-card">
              <Card.Header>
                <WarningIcon style={{ color: '#f59e0b', fontSize: 20 }} />
                <span>Projects Needing Attention</span>
                <span className="attention-count">{attentionProjects.length}</span>
              </Card.Header>
              <Card.Section>
                <div className="attention-list">
                  {attentionProjects.map(project => (
                    <div
                      key={project.id}
                      className="attention-item"
                      onClick={() => onSelectProject?.(project)}
                    >
                      {getHealthIcon(project.custom_fields?.health)}
                      <div className="attention-content">
                        <span className="attention-name">{project.name}</span>
                        <span className="attention-stage">{project.custom_fields?.stage}</span>
                      </div>
                      <span
                        className="attention-health"
                        style={{ color: getHealthColor(project.custom_fields?.health) }}
                      >
                        {project.custom_fields?.health}
                      </span>
                    </div>
                  ))}
                </div>
              </Card.Section>
            </Card>
          )}

          {/* All Projects List */}
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderIcon}
              iconColor="#3b82f6"
              title="No Projects"
              description="Create your first project to get started."
              actionLabel="New Project"
              onAction={() => onCreateArtefact?.('project')}
            />
          ) : (
            <Card className="projects-list-card">
              <Card.Header>
                <span>All Projects</span>
              </Card.Header>
              <Card.Section>
                <div className="register-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Stage</th>
                        <th>Health</th>
                        <th>Progress</th>
                        <th>Manager</th>
                        <th>End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(project => (
                        <tr
                          key={project.id}
                          onClick={() => onSelectProject?.(project)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <div className="project-name-cell">
                              <span className="project-code">{project.custom_fields?.code}</span>
                              <span className="project-name">{project.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`stage-badge stage-badge--${project.custom_fields?.stage}`}>
                              {project.custom_fields?.stage}
                            </span>
                          </td>
                          <td>
                            <span
                              className="health-badge"
                              style={{
                                backgroundColor: getHealthColor(project.custom_fields?.health),
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}
                            >
                              {project.custom_fields?.health || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <div className="progress-cell">
                              <div className="mini-progress-bar">
                                <div
                                  className="mini-progress-fill"
                                  style={{ width: `${project.custom_fields?.progress || 0}%` }}
                                />
                              </div>
                              <span>{project.custom_fields?.progress || 0}%</span>
                            </div>
                          </td>
                          <td>{project.custom_fields?.project_manager || '-'}</td>
                          <td>
                            {project.custom_fields?.end_date
                              ? new Date(project.custom_fields.end_date).toLocaleDateString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Section>
            </Card>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('project')}>
              <FolderIcon fontSize="small" />
              New Project
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
