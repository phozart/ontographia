// components/spaces/gtm/views/OverviewDashboard.js
// Main GTM overview dashboard

import { useGTM, GTM_STAGES, GTM_MODULES } from '../GTMContext';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import FlagIcon from '@mui/icons-material/Flag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function OverviewDashboard({ onNavigate }) {
  const {
    activeGTMPlan,
    getArtefactsByType,
    calculateReadiness,
    calculateCompleteness
  } = useGTM();

  const campaigns = getArtefactsByType('Campaign');
  const milestones = getArtefactsByType('Milestone');
  const materials = getArtefactsByType('Material');
  const trainings = getArtefactsByType('Training');
  const targets = getArtefactsByType('Target');

  // Calculate metrics
  const readiness = calculateReadiness();
  const completeness = calculateCompleteness();

  // Days until launch
  const getDaysUntilLaunch = () => {
    if (!activeGTMPlan?.launch?.launch_date) return null;
    const launchDate = new Date(activeGTMPlan.launch.launch_date);
    const today = new Date();
    const diffTime = launchDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilLaunch = getDaysUntilLaunch();

  // Campaign stats
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.actual_leads || 0), 0);

  // Milestone stats
  const completedMilestones = milestones.filter(m => m.status === 'complete').length;
  const overdueMilestones = milestones.filter(m => {
    if (m.status === 'complete') return false;
    return new Date(m.due_date) < new Date();
  }).length;

  // Upcoming milestones
  const upcomingMilestones = milestones
    .filter(m => m.status !== 'complete' && new Date(m.due_date) >= new Date())
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  // Current stage
  const currentStage = GTM_STAGES[activeGTMPlan?.status] || GTM_STAGES.draft;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="gtm-overview-dashboard">
      {/* Plan Header */}
      <div className="gtm-plan-summary">
        <div className="gtm-plan-info">
          <h2>{activeGTMPlan?.name || 'GTM Plan'}</h2>
          {activeGTMPlan?.description && (
            <p className="gtm-plan-desc">{activeGTMPlan.description}</p>
          )}
          <div className="gtm-plan-stage">
            <span
              className="gtm-stage-badge"
              style={{ backgroundColor: currentStage.color }}
            >
              {currentStage.name}
            </span>
            <span className="gtm-completeness">{completeness}% complete</span>
          </div>
        </div>

        {daysUntilLaunch !== null && (
          <div className={`gtm-launch-countdown ${daysUntilLaunch < 0 ? 'overdue' : daysUntilLaunch < 14 ? 'soon' : ''}`}>
            <RocketLaunchIcon />
            <div>
              <span className="gtm-countdown-value">
                {daysUntilLaunch === 0 ? 'Today!' :
                 daysUntilLaunch < 0 ? `${Math.abs(daysUntilLaunch)} days overdue` :
                 `${daysUntilLaunch} days`}
              </span>
              <span className="gtm-countdown-label">until launch</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="gtm-quick-stats">
        <div className="gtm-quick-stat" onClick={() => onNavigate?.('campaigns')}>
          <CampaignIcon />
          <div>
            <span className="gtm-stat-value">{activeCampaigns}</span>
            <span className="gtm-stat-label">Active Campaigns</span>
          </div>
        </div>

        <div className="gtm-quick-stat" onClick={() => onNavigate?.('metrics')}>
          <PeopleIcon />
          <div>
            <span className="gtm-stat-value">{totalLeads.toLocaleString()}</span>
            <span className="gtm-stat-label">Total Leads</span>
          </div>
        </div>

        <div className="gtm-quick-stat" onClick={() => onNavigate?.('launch')}>
          <FlagIcon />
          <div>
            <span className="gtm-stat-value">{completedMilestones}/{milestones.length}</span>
            <span className="gtm-stat-label">Milestones</span>
          </div>
        </div>

        <div className="gtm-quick-stat" onClick={() => onNavigate?.('enablement')}>
          <SchoolIcon />
          <div>
            <span className="gtm-stat-value">{materials.length + trainings.length}</span>
            <span className="gtm-stat-label">Materials & Training</span>
          </div>
        </div>
      </div>

      {/* Module Progress */}
      <div className="gtm-module-progress">
        <div className="gtm-section-header">
          <h3>Module Progress</h3>
        </div>

        <div className="gtm-modules-grid">
          {Object.entries(GTM_MODULES).map(([key, module]) => {
            const moduleCompleteness = completeness; // Simplified - could calculate per module

            return (
              <div
                key={key}
                className="gtm-module-card"
                onClick={() => onNavigate?.(key)}
              >
                <div className="gtm-module-icon">
                  {key === 'strategy' && <AssessmentIcon />}
                  {key === 'messaging' && <CampaignIcon />}
                  {key === 'launch' && <RocketLaunchIcon />}
                  {key === 'campaigns' && <CalendarTodayIcon />}
                  {key === 'enablement' && <SchoolIcon />}
                  {key === 'metrics' && <AssessmentIcon />}
                </div>
                <div className="gtm-module-info">
                  <span className="gtm-module-name">{module.name}</span>
                  <div className="gtm-module-bar">
                    <div
                      className="gtm-module-fill"
                      style={{ width: `${moduleCompleteness}%` }}
                    />
                  </div>
                </div>
                <ArrowForwardIcon className="gtm-module-arrow" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Readiness & Milestones Row */}
      <div className="gtm-dashboard-row">
        {/* Launch Readiness */}
        <div className="gtm-readiness-card">
          <div className="gtm-section-header">
            <h3>Launch Readiness</h3>
            <button className="btn-text" onClick={() => onNavigate?.('readiness')}>
              View Details <ArrowForwardIcon fontSize="small" />
            </button>
          </div>

          <div className="gtm-readiness-gauge">
            <div className="gtm-gauge-circle">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#E2E0DB"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={readiness.overallPercent >= 90 ? '#5B8A6A' :
                          readiness.overallPercent >= 70 ? '#C9A227' : '#A54D4D'}
                  strokeWidth="10"
                  strokeDasharray={`${readiness.overallPercent * 2.83} 283`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="gtm-gauge-value">
                <span className="gtm-gauge-percent">{readiness.overallPercent}%</span>
                <span className="gtm-gauge-label">Ready</span>
              </div>
            </div>
          </div>

          <div className="gtm-readiness-status">
            {readiness.overallPercent >= 90 ? (
              <span className="gtm-go-status go">
                <CheckCircleIcon /> GO
              </span>
            ) : readiness.overallPercent >= 70 ? (
              <span className="gtm-go-status conditional">
                <WarningIcon /> CONDITIONAL
              </span>
            ) : (
              <span className="gtm-go-status no-go">
                <WarningIcon /> NO-GO
              </span>
            )}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="gtm-upcoming-milestones">
          <div className="gtm-section-header">
            <h3>Upcoming Milestones</h3>
            <button className="btn-text" onClick={() => onNavigate?.('milestones')}>
              View All <ArrowForwardIcon fontSize="small" />
            </button>
          </div>

          {overdueMilestones > 0 && (
            <div className="gtm-overdue-warning">
              <WarningIcon />
              <span>{overdueMilestones} overdue milestone{overdueMilestones !== 1 ? 's' : ''}</span>
            </div>
          )}

          {upcomingMilestones.length === 0 ? (
            <div className="gtm-empty-hint">
              <p>No upcoming milestones</p>
            </div>
          ) : (
            <div className="gtm-milestone-list">
              {upcomingMilestones.map(milestone => (
                <div key={milestone.id} className="gtm-milestone-item">
                  <div className="gtm-milestone-date">
                    {formatDate(milestone.due_date)}
                  </div>
                  <div className="gtm-milestone-info">
                    <span className="gtm-milestone-name">{milestone.name}</span>
                    {milestone.owner && (
                      <span className="gtm-milestone-owner">{milestone.owner}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Target Summary */}
      {targets.length > 0 && (
        <div className="gtm-targets-summary">
          <div className="gtm-section-header">
            <h3>Key Targets</h3>
            <button className="btn-text" onClick={() => onNavigate?.('targets')}>
              View All <ArrowForwardIcon fontSize="small" />
            </button>
          </div>

          <div className="gtm-targets-grid">
            {targets.slice(0, 4).map(target => {
              const progress = target.target_value > 0
                ? Math.round((target.actual_value || 0) / target.target_value * 100)
                : 0;

              return (
                <div key={target.id} className="gtm-target-mini">
                  <span className="gtm-target-name">{target.name}</span>
                  <div className="gtm-target-progress">
                    <div className="gtm-target-bar">
                      <div
                        className="gtm-target-fill"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: progress >= 100 ? '#5B8A6A' :
                                          progress >= 80 ? '#C9A227' : '#A54D4D'
                        }}
                      />
                    </div>
                    <span className="gtm-target-value">
                      {target.prefix}{(target.actual_value || 0).toLocaleString()}{target.suffix}
                      <span className="gtm-target-of">
                        / {target.prefix}{target.target_value?.toLocaleString()}{target.suffix}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
