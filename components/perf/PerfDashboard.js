/**
 * PerfDashboard - Visual performance dashboard
 *
 * Displays overall health, progress gauges, KPI status cards,
 * alerts for at-risk items, and quick navigation to focus areas.
 *
 * @module components/perf/PerfDashboard
 */

import { usePerf, PERF_OBJECTIVE_STATUS } from './PerfContext';
import FlagIcon from '@mui/icons-material/Flag';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Button } from '@mui/material';

/**
 * Circular progress gauge component
 */
function ProgressGauge({ value, label, size = 120, color = 'var(--accent)' }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, value));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-gauge">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="10"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 - 5}
          textAnchor="middle"
          className="gauge-value"
          fill="var(--text)"
          fontSize="24"
          fontWeight="600"
        >
          {Math.round(progress)}%
        </text>
        <text
          x={size / 2}
          y={size / 2 + 15}
          textAnchor="middle"
          className="gauge-label"
          fill="var(--text-muted)"
          fontSize="11"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

/**
 * Status distribution bar
 */
function StatusBar({ data, colors }) {
  const total = Object.values(data).reduce((sum, v) => sum + v, 0);
  if (total === 0) return <div className="status-bar status-bar--empty">No data</div>;

  return (
    <div className="status-bar">
      {Object.entries(data).map(([key, value]) => {
        const percent = (value / total) * 100;
        if (percent === 0) return null;
        return (
          <div
            key={key}
            className="status-bar__segment"
            style={{
              width: `${percent}%`,
              backgroundColor: colors[key] || '#6b7280',
            }}
            title={`${key}: ${value} (${Math.round(percent)}%)`}
          />
        );
      })}
    </div>
  );
}

/**
 * Alert card for at-risk items
 */
function AlertCard({ title, items, type = 'warning' }) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`alert-card alert-card--${type}`}>
      <div className="alert-card__header">
        <WarningIcon className="alert-card__icon" />
        <span className="alert-card__title">{title}</span>
        <span className="alert-card__count">{items.length}</span>
      </div>
      <ul className="alert-card__list">
        {items.slice(0, 5).map(item => (
          <li key={item.id} className="alert-card__item">
            <span className="alert-card__item-name">{item.name}</span>
            <span className={`alert-card__item-status alert-card__item-status--${item.status || item.health}`}>
              {item.status || item.health}
            </span>
          </li>
        ))}
        {items.length > 5 && (
          <li className="alert-card__more">+{items.length - 5} more</li>
        )}
      </ul>
    </div>
  );
}

/**
 * Quick action card
 */
function QuickActionCard({ icon: Icon, title, description, onClick }) {
  return (
    <button className="quick-action-card" onClick={onClick}>
      <div className="quick-action-card__icon">
        <Icon />
      </div>
      <div className="quick-action-card__content">
        <h4 className="quick-action-card__title">{title}</h4>
        <p className="quick-action-card__desc">{description}</p>
      </div>
      <ArrowForwardIcon className="quick-action-card__arrow" />
    </button>
  );
}

/**
 * Empty state for new users
 */
function EmptyDashboard({ onCreate }) {
  return (
    <div className="empty-dashboard">
      <div className="empty-dashboard__content">
        <div className="empty-dashboard__icon">
          <FlagIcon style={{ fontSize: 48 }} />
        </div>
        <h2>Welcome to Performance Studio</h2>
        <p>
          Start by defining your strategic objectives and key results (OKRs),
          then add KPIs to measure progress.
        </p>

        <div className="empty-dashboard__tips">
          <div className="tip-card">
            <LightbulbIcon className="tip-card__icon" />
            <h4>Start with Strategy</h4>
            <p>Define 3-5 strategic objectives for your organization. Focus beats breadth.</p>
          </div>
          <div className="tip-card">
            <LightbulbIcon className="tip-card__icon" />
            <h4>Make it Measurable</h4>
            <p>Each objective needs 2-4 key results with specific, quantifiable targets.</p>
          </div>
          <div className="tip-card">
            <LightbulbIcon className="tip-card__icon" />
            <h4>Track What Matters</h4>
            <p>Choose KPIs that drive behavior and align with your strategic goals.</p>
          </div>
        </div>

        <div className="empty-dashboard__actions">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onCreate('perf_objective')}
          >
            Create First Objective
          </Button>
        </div>
      </div>

      <style jsx>{`
        .empty-dashboard {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 500px;
        }

        .empty-dashboard__content {
          text-align: center;
          max-width: 700px;
        }

        .empty-dashboard__icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--accent-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: var(--accent);
        }

        .empty-dashboard__content h2 {
          margin: 0 0 8px;
          font-size: 1.5rem;
          color: var(--text);
        }

        .empty-dashboard__content > p {
          margin: 0 0 32px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .empty-dashboard__tips {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .tip-card {
          padding: 20px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          text-align: left;
        }

        .tip-card__icon {
          color: var(--accent);
          margin-bottom: 8px;
        }

        .tip-card h4 {
          margin: 0 0 8px;
          font-size: 0.875rem;
          color: var(--text);
        }

        .tip-card p {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

/**
 * PerfDashboard Component
 */
export default function PerfDashboard({ onNavigate, onCreate }) {
  const { dashboard, stats, loading } = usePerf();

  // Show empty state if no data
  if (!loading && (!stats || stats.total === 0)) {
    return <EmptyDashboard onCreate={onCreate} />;
  }

  const summary = dashboard?.summary || {};
  const health = dashboard?.health || {};
  const alerts = dashboard?.alerts || {};

  // Color mappings
  const statusColors = {
    on_track: '#22c55e',
    achieved: '#10b981',
    at_risk: '#f59e0b',
    off_track: '#ef4444',
    active: '#3b82f6',
    draft: '#6b7280',
    closed: '#6b7280',
  };

  const healthColors = {
    on_track: '#22c55e',
    at_risk: '#f59e0b',
    off_track: '#ef4444',
    unknown: '#6b7280',
  };

  // Calculate overall health color
  const overallHealthColor = summary.overallHealth >= 70 ? '#22c55e' :
    summary.overallHealth >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="perf-dashboard">
      {/* Header Gauges */}
      <section className="dashboard-section dashboard-section--gauges">
        <div className="gauge-grid">
          <div className="gauge-card">
            <ProgressGauge
              value={summary.overallHealth || 0}
              label="Overall Health"
              color={overallHealthColor}
            />
          </div>
          <div className="gauge-card">
            <ProgressGauge
              value={summary.averageProgress || 0}
              label="Avg Progress"
              color="var(--accent)"
            />
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <FlagIcon className="stat-icon" style={{ color: '#6366f1' }} />
              <div className="stat-content">
                <span className="stat-value">{summary.objectives || 0}</span>
                <span className="stat-label">Objectives</span>
              </div>
            </div>
            <div className="stat-item">
              <TrendingUpIcon className="stat-icon" style={{ color: '#8b5cf6' }} />
              <div className="stat-content">
                <span className="stat-value">{summary.keyResults || 0}</span>
                <span className="stat-label">Key Results</span>
              </div>
            </div>
            <div className="stat-item">
              <SpeedIcon className="stat-icon" style={{ color: '#22c55e' }} />
              <div className="stat-content">
                <span className="stat-value">{summary.kpis || 0}</span>
                <span className="stat-label">KPIs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Distribution */}
      <section className="dashboard-section">
        <h3 className="section-title">Status Overview</h3>
        <div className="distribution-grid">
          <div className="distribution-card">
            <h4>Objective Status</h4>
            <StatusBar data={health.objectivesByStatus || {}} colors={statusColors} />
            <div className="distribution-legend">
              {Object.entries(health.objectivesByStatus || {}).map(([key, value]) => (
                <span key={key} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: statusColors[key] }} />
                  {key.replace('_', ' ')}: {value}
                </span>
              ))}
            </div>
          </div>
          <div className="distribution-card">
            <h4>KPI Health</h4>
            <StatusBar data={health.kpisByHealth || {}} colors={healthColors} />
            <div className="distribution-legend">
              {Object.entries(health.kpisByHealth || {}).map(([key, value]) => (
                <span key={key} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: healthColors[key] }} />
                  {key.replace('_', ' ')}: {value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      {alerts.totalAtRisk > 0 && (
        <section className="dashboard-section">
          <h3 className="section-title">Attention Required</h3>
          <div className="alert-grid">
            <AlertCard
              title="At-Risk Objectives"
              items={alerts.atRiskObjectives}
              type="warning"
            />
            <AlertCard
              title="At-Risk KPIs"
              items={alerts.atRiskKpis}
              type="warning"
            />
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="dashboard-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="actions-grid">
          <QuickActionCard
            icon={FlagIcon}
            title="View OKR Tree"
            description="See your objective hierarchy and progress"
            onClick={() => onNavigate('strategy')}
          />
          <QuickActionCard
            icon={SpeedIcon}
            title="KPI Scorecard"
            description="Monitor KPI health across categories"
            onClick={() => onNavigate('measurement')}
          />
          <QuickActionCard
            icon={AddIcon}
            title="Add Objective"
            description="Create a new strategic objective"
            onClick={() => onCreate('perf_objective')}
          />
          <QuickActionCard
            icon={AddIcon}
            title="Add KPI"
            description="Define a new performance indicator"
            onClick={() => onCreate('perf_kpi')}
          />
        </div>
      </section>

      <style jsx>{`
        .perf-dashboard {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-section {
          margin-bottom: 32px;
        }

        .dashboard-section--gauges {
          background: linear-gradient(135deg, var(--accent-soft) 0%, var(--panel) 100%);
          margin: -20px -20px 32px;
          padding: 24px 20px;
          border-bottom: 1px solid var(--border);
        }

        .section-title {
          margin: 0 0 16px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
        }

        .gauge-grid {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .gauge-card {
          background: var(--panel);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .summary-stats {
          flex: 1;
          display: flex;
          gap: 24px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: var(--panel);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .stat-icon {
          font-size: 28px !important;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .distribution-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .distribution-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }

        .distribution-card h4 {
          margin: 0 0 12px;
          font-size: 0.875rem;
          color: var(--text);
        }

        .status-bar {
          display: flex;
          height: 12px;
          border-radius: 6px;
          overflow: hidden;
          background: var(--bg);
        }

        .status-bar--empty {
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .status-bar__segment {
          transition: width 0.3s ease;
        }

        .distribution-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .alert-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .alert-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
        }

        .alert-card--warning {
          border-left: 4px solid #f59e0b;
        }

        .alert-card__header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .alert-card__icon {
          color: #f59e0b;
          font-size: 20px !important;
        }

        .alert-card__title {
          flex: 1;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text);
        }

        .alert-card__count {
          background: #fef3c7;
          color: #92400e;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .alert-card__list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .alert-card__item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.8125rem;
        }

        .alert-card__item:last-child {
          border-bottom: none;
        }

        .alert-card__item-name {
          color: var(--text);
        }

        .alert-card__item-status {
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: capitalize;
        }

        .alert-card__item-status--at_risk {
          background: #fef3c7;
          color: #92400e;
        }

        .alert-card__item-status--off_track {
          background: #fee2e2;
          color: #991b1b;
        }

        .alert-card__more {
          font-size: 0.75rem;
          color: var(--text-muted);
          padding-top: 8px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .quick-action-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }

        .quick-action-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .quick-action-card__icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--accent-soft);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .quick-action-card__content {
          flex: 1;
          min-width: 0;
        }

        .quick-action-card__title {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text);
        }

        .quick-action-card__desc {
          margin: 4px 0 0;
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .quick-action-card__arrow {
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.15s;
        }

        .quick-action-card:hover .quick-action-card__arrow {
          opacity: 1;
        }

        @media (max-width: 900px) {
          .gauge-grid {
            flex-wrap: wrap;
          }

          .summary-stats {
            width: 100%;
            flex-wrap: wrap;
          }

          .distribution-grid,
          .alert-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
