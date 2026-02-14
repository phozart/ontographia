// components/spaces/gtm/launch/LaunchOverview.js
// Launch module overview with readiness summary

import { useGTM, LAUNCH_TYPES, GTM_STAGES } from '../GTMContext';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FlagIcon from '@mui/icons-material/Flag';

export default function LaunchOverview({ plan, readiness, onNavigate }) {
  const { getArtefactsByType } = useGTM();
  const milestones = getArtefactsByType('Milestone');

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntilLaunch = () => {
    if (!plan?.launch?.launch_date) return null;
    const launchDate = new Date(plan.launch.launch_date);
    const today = new Date();
    const diffTime = launchDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilLaunch = getDaysUntilLaunch();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'green': return <CheckCircleIcon className="status-green" />;
      case 'amber': return <WarningIcon className="status-amber" />;
      case 'red': return <ErrorIcon className="status-red" />;
      default: return null;
    }
  };

  const getGoNoGoDecision = () => {
    if (!readiness) return 'Not assessed';
    const { overallStatus, completedCount, totalCount } = readiness;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    if (percentage >= 90) return { decision: 'GO', class: 'go' };
    if (percentage >= 70) return { decision: 'CONDITIONAL', class: 'conditional' };
    return { decision: 'NO-GO', class: 'no-go' };
  };

  const goNoGo = getGoNoGoDecision();

  return (
    <div className="gtm-launch-overview">
      <div className="gtm-launch-header">
        <h2>Launch Overview</h2>
        <p>Track readiness and prepare for launch</p>
      </div>

      {/* Launch Summary Card */}
      <div className="gtm-launch-summary">
        <div className="gtm-launch-date-card">
          <RocketLaunchIcon className="gtm-launch-icon" />
          <div className="gtm-launch-date-info">
            <span className="gtm-launch-date-label">Target Launch Date</span>
            <span className="gtm-launch-date-value">
              {formatDate(plan?.launch?.launch_date)}
            </span>
            {daysUntilLaunch !== null && (
              <span className={`gtm-launch-countdown ${daysUntilLaunch < 0 ? 'overdue' : daysUntilLaunch < 14 ? 'soon' : ''}`}>
                {daysUntilLaunch === 0 ? 'Today!' :
                 daysUntilLaunch < 0 ? `${Math.abs(daysUntilLaunch)} days overdue` :
                 `${daysUntilLaunch} days to go`}
              </span>
            )}
          </div>
        </div>

        <div className="gtm-launch-type-card">
          <CalendarTodayIcon />
          <div>
            <span className="gtm-launch-type-label">Launch Type</span>
            <span className="gtm-launch-type-value">
              {LAUNCH_TYPES[plan?.launch?.launch_type]?.name || 'Not set'}
            </span>
            <span className="gtm-launch-type-desc">
              {LAUNCH_TYPES[plan?.launch?.launch_type]?.description || ''}
            </span>
          </div>
        </div>

        <div className="gtm-launch-stage-card">
          <FlagIcon />
          <div>
            <span className="gtm-launch-stage-label">Current Stage</span>
            <span
              className="gtm-launch-stage-value"
              style={{ color: GTM_STAGES[plan?.status]?.color }}
            >
              {GTM_STAGES[plan?.status]?.name || 'Draft'}
            </span>
          </div>
        </div>
      </div>

      {/* Readiness Summary */}
      <div className="gtm-readiness-summary">
        <div className="gtm-readiness-header">
          <h3>Launch Readiness</h3>
          <button className="btn-text" onClick={() => onNavigate('readiness')}>
            Full Tracker <ArrowForwardIcon fontSize="small" />
          </button>
        </div>

        <div className="gtm-readiness-grid">
          {readiness && Object.entries(readiness.dimensions).map(([dimId, dim]) => (
            <div key={dimId} className={`gtm-readiness-card status-${dim.status}`}>
              <div className="gtm-readiness-card-header">
                {getStatusIcon(dim.status)}
                <span className="gtm-readiness-card-name">{dim.name}</span>
              </div>
              <div className="gtm-readiness-card-progress">
                <div className="gtm-readiness-bar">
                  <div
                    className="gtm-readiness-fill"
                    style={{ width: `${(dim.completed / dim.total) * 100}%` }}
                  />
                </div>
                <span className="gtm-readiness-count">{dim.completed}/{dim.total}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Go/No-Go Decision */}
        <div className={`gtm-go-nogo-card ${goNoGo.class}`}>
          <div className="gtm-go-nogo-label">Launch Readiness Assessment</div>
          <div className="gtm-go-nogo-decision">{goNoGo.decision}</div>
          <div className="gtm-go-nogo-score">
            {readiness?.completedCount || 0} of {readiness?.totalCount || 0} criteria met
            ({readiness?.totalCount > 0 ? Math.round((readiness.completedCount / readiness.totalCount) * 100) : 0}%)
          </div>
        </div>
      </div>

      {/* Milestones Preview */}
      <div className="gtm-milestones-preview">
        <div className="gtm-milestones-header">
          <h3>Key Milestones</h3>
          <button className="btn-text" onClick={() => onNavigate('milestones')}>
            View Timeline <ArrowForwardIcon fontSize="small" />
          </button>
        </div>

        {milestones.length === 0 ? (
          <div className="gtm-empty-card" onClick={() => onNavigate('milestones')}>
            <span className="gtm-empty-icon">🏁</span>
            <p>Define launch milestones</p>
            <span className="gtm-empty-hint">Track key dates and deliverables</span>
          </div>
        ) : (
          <div className="gtm-milestones-list">
            {milestones
              .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
              .slice(0, 5)
              .map(milestone => {
                const isPast = new Date(milestone.due_date) < new Date();
                const isComplete = milestone.status === 'complete';
                return (
                  <div
                    key={milestone.id}
                    className={`gtm-milestone-item ${isComplete ? 'complete' : ''} ${isPast && !isComplete ? 'overdue' : ''}`}
                  >
                    <div className="gtm-milestone-date">
                      {formatDate(milestone.due_date)}
                    </div>
                    <div className="gtm-milestone-marker">
                      {isComplete ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : (
                        <div className="gtm-milestone-dot" />
                      )}
                    </div>
                    <div className="gtm-milestone-content">
                      <span className="gtm-milestone-name">{milestone.name}</span>
                      {milestone.owner && (
                        <span className="gtm-milestone-owner">{milestone.owner}</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
