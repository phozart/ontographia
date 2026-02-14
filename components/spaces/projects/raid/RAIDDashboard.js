/**
 * RAIDDashboard.js
 *
 * Dashboard view for Risks, Assumptions, Issues, Dependencies, and Decisions.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { calculateRiskScore, getRiskExposure } from '../../../../lib/project-types';

// Shared UI components
import {
  ViewHeader,
  ContentArea,
  Card,
  EmptyState,
  Button,
} from '@/components/ui';

// MUI Icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ErrorIcon from '@mui/icons-material/Error';
import LinkIcon from '@mui/icons-material/Link';
import GavelIcon from '@mui/icons-material/Gavel';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function RAIDDashboard({ onNavigate, onCreateArtefact }) {
  const {
    stats,
    getArtefactsByType,
    getRisksByScore,
  } = useProjectStudio();

  // Get top items from each category
  const topRisks = useMemo(() => {
    return getRisksByScore()
      .filter(r => r.custom_fields?.status === 'open')
      .slice(0, 5);
  }, [getRisksByScore]);

  const openIssues = useMemo(() => {
    return getArtefactsByType('issue')
      .filter(i => i.custom_fields?.status === 'open' || i.custom_fields?.status === 'in_progress')
      .slice(0, 5);
  }, [getArtefactsByType]);

  const activeAssumptions = useMemo(() => {
    return getArtefactsByType('assumption')
      .filter(a => a.custom_fields?.status === 'unvalidated')
      .slice(0, 5);
  }, [getArtefactsByType]);

  const activeDependencies = useMemo(() => {
    return getArtefactsByType('dependency')
      .filter(d => d.custom_fields?.status === 'active')
      .slice(0, 5);
  }, [getArtefactsByType]);

  const recentDecisions = useMemo(() => {
    return getArtefactsByType('decision')
      .sort((a, b) => new Date(b.custom_fields?.decision_date || 0) - new Date(a.custom_fields?.decision_date || 0))
      .slice(0, 5);
  }, [getArtefactsByType]);

  return (
    <>
      <ViewHeader
        icon={AssessmentIcon}
        iconColor="#47453F"
        title="RAID Dashboard"
        description="Risks, Assumptions, Issues, Dependencies, and Decisions"
        count={stats.raidTotal}
      />
      <ContentArea>
        <div className="raid-dashboard">
          {/* Summary Stats */}
          <div className="raid-stats-grid">
            <div className="raid-stat-card" onClick={() => onNavigate?.('risks')}>
              <WarningIcon style={{ color: '#ef4444', fontSize: 32 }} />
              <span className="raid-stat-count">{stats.openRisks}</span>
              <span className="raid-stat-label">Open Risks</span>
            </div>
            <div className="raid-stat-card" onClick={() => onNavigate?.('assumptions')}>
              <PsychologyIcon style={{ color: '#f59e0b', fontSize: 32 }} />
              <span className="raid-stat-count">{stats.activeAssumptions}</span>
              <span className="raid-stat-label">Assumptions</span>
            </div>
            <div className="raid-stat-card" onClick={() => onNavigate?.('issues')}>
              <ErrorIcon style={{ color: '#ef4444', fontSize: 32 }} />
              <span className="raid-stat-count">{stats.openIssues}</span>
              <span className="raid-stat-label">Open Issues</span>
            </div>
            <div className="raid-stat-card" onClick={() => onNavigate?.('dependencies')}>
              <LinkIcon style={{ color: '#64748b', fontSize: 32 }} />
              <span className="raid-stat-count">{stats.activeDependencies}</span>
              <span className="raid-stat-label">Dependencies</span>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="raid-content-grid">
            {/* Left Column */}
            <div className="raid-column">
              {/* Top Risks */}
              <Card>
                <Card.Header>
                  <WarningIcon style={{ fontSize: 18, color: '#ef4444' }} />
                  <span>Top Risks</span>
                  <button className="card-action" onClick={() => onNavigate?.('risks')}>
                    View All
                  </button>
                </Card.Header>
                <Card.Section>
                  {topRisks.length === 0 ? (
                    <EmptyState
                      icon={WarningIcon}
                      title="No open risks"
                      description="Add risks to track potential threats"
                      actionLabel="Add Risk"
                      onAction={() => onCreateArtefact?.('risk')}
                    />
                  ) : (
                    <div className="raid-item-list">
                      {topRisks.map(risk => {
                        const exposure = getRiskExposure(risk.score);
                        return (
                          <div key={risk.id} className="raid-item">
                            <span className={`risk-score risk-score--${exposure}`}>
                              {risk.score}
                            </span>
                            <span className="raid-item-text">
                              {risk.custom_fields?.description || risk.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card.Section>
              </Card>

              {/* Open Issues */}
              <Card>
                <Card.Header>
                  <ErrorIcon style={{ fontSize: 18, color: '#ef4444' }} />
                  <span>Open Issues</span>
                  <button className="card-action" onClick={() => onNavigate?.('issues')}>
                    View All
                  </button>
                </Card.Header>
                <Card.Section>
                  {openIssues.length === 0 ? (
                    <EmptyState
                      icon={ErrorIcon}
                      title="No open issues"
                      description="Issues will appear here when logged"
                      actionLabel="Log Issue"
                      onAction={() => onCreateArtefact?.('issue')}
                    />
                  ) : (
                    <div className="raid-item-list">
                      {openIssues.map(issue => (
                        <div key={issue.id} className="raid-item">
                          <span className={`issue-priority issue-priority--${issue.custom_fields?.priority}`}>
                            {issue.custom_fields?.priority?.charAt(0).toUpperCase()}
                          </span>
                          <span className="raid-item-text">
                            {issue.custom_fields?.description || issue.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Section>
              </Card>
            </div>

            {/* Right Column */}
            <div className="raid-column">
              {/* Assumptions */}
              <Card>
                <Card.Header>
                  <PsychologyIcon style={{ fontSize: 18, color: '#f59e0b' }} />
                  <span>Unvalidated Assumptions</span>
                  <button className="card-action" onClick={() => onNavigate?.('assumptions')}>
                    View All
                  </button>
                </Card.Header>
                <Card.Section>
                  {activeAssumptions.length === 0 ? (
                    <EmptyState
                      icon={PsychologyIcon}
                      title="No assumptions"
                      description="Document project assumptions"
                      actionLabel="Add Assumption"
                      onAction={() => onCreateArtefact?.('assumption')}
                    />
                  ) : (
                    <div className="raid-item-list">
                      {activeAssumptions.map(assumption => (
                        <div key={assumption.id} className="raid-item">
                          <ChevronRightIcon fontSize="small" />
                          <span className="raid-item-text">
                            {assumption.custom_fields?.statement || assumption.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Section>
              </Card>

              {/* Dependencies */}
              <Card>
                <Card.Header>
                  <LinkIcon style={{ fontSize: 18, color: '#64748b' }} />
                  <span>Active Dependencies</span>
                  <button className="card-action" onClick={() => onNavigate?.('dependencies')}>
                    View All
                  </button>
                </Card.Header>
                <Card.Section>
                  {activeDependencies.length === 0 ? (
                    <EmptyState
                      icon={LinkIcon}
                      title="No dependencies"
                      description="Track project dependencies"
                      actionLabel="Add Dependency"
                      onAction={() => onCreateArtefact?.('dependency')}
                    />
                  ) : (
                    <div className="raid-item-list">
                      {activeDependencies.map(dep => (
                        <div key={dep.id} className="raid-item">
                          <span className={`dep-external ${dep.custom_fields?.external ? 'dep-external--yes' : ''}`}>
                            {dep.custom_fields?.external ? 'EXT' : 'INT'}
                          </span>
                          <span className="raid-item-text">
                            {dep.custom_fields?.description || dep.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Section>
              </Card>

              {/* Recent Decisions */}
              <Card>
                <Card.Header>
                  <GavelIcon style={{ fontSize: 18, color: '#6366f1' }} />
                  <span>Recent Decisions</span>
                  <button className="card-action" onClick={() => onNavigate?.('decisions')}>
                    View All
                  </button>
                </Card.Header>
                <Card.Section>
                  {recentDecisions.length === 0 ? (
                    <EmptyState
                      icon={GavelIcon}
                      title="No decisions"
                      description="Record project decisions"
                      actionLabel="Add Decision"
                      onAction={() => onCreateArtefact?.('decision')}
                    />
                  ) : (
                    <div className="raid-item-list">
                      {recentDecisions.map(decision => (
                        <div key={decision.id} className="raid-item">
                          <GavelIcon fontSize="small" style={{ color: '#6366f1' }} />
                          <span className="raid-item-text">
                            {decision.custom_fields?.title || decision.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Section>
              </Card>
            </div>
          </div>

          {/* Quick Create */}
          <div className="raid-quick-create">
            <Button variant="secondary" onClick={() => onCreateArtefact?.('risk')}>
              <AddIcon fontSize="small" />
              Risk
            </Button>
            <Button variant="secondary" onClick={() => onCreateArtefact?.('assumption')}>
              <AddIcon fontSize="small" />
              Assumption
            </Button>
            <Button variant="secondary" onClick={() => onCreateArtefact?.('issue')}>
              <AddIcon fontSize="small" />
              Issue
            </Button>
            <Button variant="secondary" onClick={() => onCreateArtefact?.('dependency')}>
              <AddIcon fontSize="small" />
              Dependency
            </Button>
            <Button variant="secondary" onClick={() => onCreateArtefact?.('decision')}>
              <AddIcon fontSize="small" />
              Decision
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
