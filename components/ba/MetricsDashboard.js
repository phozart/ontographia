// components/ba/MetricsDashboard.js
// Comprehensive BA Metrics Dashboard
// Requirements analytics, traceability coverage, velocity metrics

import { useState, useMemo } from 'react';
import { useArtefacts, ARTEFACT_TYPES, ARTEFACT_STATUS } from '../ArtefactContext';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupsIcon from '@mui/icons-material/Groups';
import LinkIcon from '@mui/icons-material/Link';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';

// ============ STAT CARD ============
function StatCard({ title, value, subtitle, icon, trend, trendValue, color = 'var(--accent)' }) {
  return (
    <div className="dashboard-stat-card">
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-title">{title}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
      {trend && (
        <div className={`stat-trend ${trend}`}>
          {trend === 'up' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}

// ============ DONUT CHART ============
function DonutChart({ data, size = 160, thickness = 20 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;

  const createArc = (startAngle, endAngle, radius, innerRadius) => {
    const start = {
      x: 50 + radius * Math.cos((startAngle * Math.PI) / 180),
      y: 50 + radius * Math.sin((startAngle * Math.PI) / 180)
    };
    const end = {
      x: 50 + radius * Math.cos((endAngle * Math.PI) / 180),
      y: 50 + radius * Math.sin((endAngle * Math.PI) / 180)
    };
    const innerStart = {
      x: 50 + innerRadius * Math.cos((endAngle * Math.PI) / 180),
      y: 50 + innerRadius * Math.sin((endAngle * Math.PI) / 180)
    };
    const innerEnd = {
      x: 50 + innerRadius * Math.cos((startAngle * Math.PI) / 180),
      y: 50 + innerRadius * Math.sin((startAngle * Math.PI) / 180)
    };
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} L ${innerStart.x} ${innerStart.y} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y} Z`;
  };

  return (
    <div className="donut-chart-container">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {data.map((item, index) => {
          if (item.value === 0) return null;
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle = endAngle;

          return (
            <path
              key={index}
              d={createArc(startAngle, endAngle - 0.5, 45, 45 - thickness / 2)}
              fill={item.color}
            />
          );
        })}
        <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">
          {total}
        </text>
        <text x="50" y="58" textAnchor="middle" fontSize="6" fill="var(--text-muted)">
          Total
        </text>
      </svg>
      <div className="donut-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: item.color }} />
            <span className="legend-label">{item.label}</span>
            <span className="legend-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ BAR CHART ============
function BarChart({ data, height = 200 }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bar-chart" style={{ height }}>
      <div className="bar-chart-bars">
        {data.map((item, index) => (
          <div key={index} className="bar-item">
            <div className="bar-wrapper">
              <div
                className="bar"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color
                }}
              >
                <span className="bar-value">{item.value}</span>
              </div>
            </div>
            <div className="bar-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ PROGRESS GAUGE ============
function ProgressGauge({ value, max, label, color = '#22c55e' }) {
  const percentage = Math.round((value / max) * 100) || 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-gauge">
      <svg viewBox="0 0 100 100" width="120" height="120">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text x="50" y="46" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)">
          {percentage}%
        </text>
        <text x="50" y="60" textAnchor="middle" fontSize="6" fill="var(--text-muted)">
          {value}/{max}
        </text>
      </svg>
      <div className="gauge-label">{label}</div>
    </div>
  );
}

// ============ MINI TREND CHART ============
function TrendChart({ data, color = 'var(--accent)' }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="trend-chart">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 80 - 10;
        return (
          <circle key={index} cx={x} cy={y} r="3" fill={color} />
        );
      })}
    </svg>
  );
}

// ============ METRICS DASHBOARD ============
export default function MetricsDashboard({ projectId }) {
  const { artefacts, relationships } = useArtefacts();
  const [timeRange, setTimeRange] = useState('all');

  // Filter artefacts by project
  const projectArtefacts = useMemo(() => {
    return artefacts.filter(a => a.projectId === projectId);
  }, [artefacts, projectId]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const byStatus = {};
    const byType = {};
    const byPriority = {};

    // Status counts
    Object.keys(ARTEFACT_STATUS).forEach(status => {
      byStatus[status] = 0;
    });

    // Type counts
    Object.keys(ARTEFACT_TYPES).forEach(type => {
      byType[type] = 0;
    });

    // Priority counts
    byPriority.Critical = 0;
    byPriority.High = 0;
    byPriority.Medium = 0;
    byPriority.Low = 0;

    projectArtefacts.forEach(a => {
      if (byStatus[a.status] !== undefined) byStatus[a.status]++;
      if (byType[a.artefactType] !== undefined) byType[a.artefactType]++;
      if (a.priority && byPriority[a.priority] !== undefined) byPriority[a.priority]++;
    });

    return { byStatus, byType, byPriority };
  }, [projectArtefacts]);

  // Traceability metrics
  const traceabilityMetrics = useMemo(() => {
    const businessReqs = projectArtefacts.filter(a => a.artefactType === 'BusinessRequirement');
    const stakeholderReqs = projectArtefacts.filter(a => a.artefactType === 'StakeholderRequirement');
    const solutionReqs = projectArtefacts.filter(a => a.artefactType === 'SolutionRequirement');
    const stories = projectArtefacts.filter(a => a.artefactType === 'Story');

    // Check which BRs have downstream SR coverage
    const brWithCoverage = businessReqs.filter(br => {
      return relationships.some(r =>
        r.sourceId === br.id || r.targetId === br.id
      );
    }).length;

    // Check stories with upstream coverage
    const storiesWithCoverage = stories.filter(story => {
      return relationships.some(r =>
        r.sourceId === story.id || r.targetId === story.id
      );
    }).length;

    return {
      totalBR: businessReqs.length,
      coveredBR: brWithCoverage,
      totalSR: stakeholderReqs.length,
      totalSolR: solutionReqs.length,
      totalStories: stories.length,
      coveredStories: storiesWithCoverage,
      totalRelationships: relationships.filter(r =>
        projectArtefacts.some(a => a.id === r.sourceId || a.id === r.targetId)
      ).length
    };
  }, [projectArtefacts, relationships]);

  // Agile metrics
  const agileMetrics = useMemo(() => {
    const stories = projectArtefacts.filter(a => a.artefactType === 'Story');
    const features = projectArtefacts.filter(a => a.artefactType === 'Feature');
    const epics = projectArtefacts.filter(a => a.artefactType === 'Epic');

    const completedStories = stories.filter(s => s.status === 'Done' || s.status === 'Approved');
    const inProgressStories = stories.filter(s => s.status === 'InProgress' || s.status === 'InReview');

    // Calculate story points if available
    const totalPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const completedPoints = completedStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);

    return {
      totalStories: stories.length,
      completedStories: completedStories.length,
      inProgressStories: inProgressStories.length,
      totalFeatures: features.length,
      totalEpics: epics.length,
      totalPoints,
      completedPoints,
      velocity: completedPoints // Simplified - would need sprint data for real velocity
    };
  }, [projectArtefacts]);

  // Stakeholder metrics
  const stakeholderMetrics = useMemo(() => {
    const stakeholders = projectArtefacts.filter(a => a.artefactType === 'Stakeholder');
    const sessions = projectArtefacts.filter(a => a.artefactType === 'ElicitationSession');
    const questions = projectArtefacts.filter(a => a.artefactType === 'Question');

    const openQuestions = questions.filter(q => q.status === 'Draft' || q.status === 'InProgress');
    const completedSessions = sessions.filter(s => s.status === 'Done' || s.status === 'Approved');

    return {
      totalStakeholders: stakeholders.length,
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalQuestions: questions.length,
      openQuestions: openQuestions.length
    };
  }, [projectArtefacts]);

  // Status chart data
  const statusChartData = [
    { label: 'Draft', value: metrics.byStatus.Draft || 0, color: '#94a3b8' },
    { label: 'In Progress', value: metrics.byStatus.InProgress || 0, color: '#3b82f6' },
    { label: 'In Review', value: metrics.byStatus.InReview || 0, color: '#f59e0b' },
    { label: 'Approved', value: metrics.byStatus.Approved || 0, color: '#22c55e' },
    { label: 'Done', value: metrics.byStatus.Done || 0, color: '#10b981' },
    { label: 'Rejected', value: metrics.byStatus.Rejected || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Type chart data
  const typeChartData = [
    { label: 'BR', value: metrics.byType.BusinessRequirement || 0, color: '#dc2626' },
    { label: 'SR', value: metrics.byType.StakeholderRequirement || 0, color: '#ea580c' },
    { label: 'SolR', value: metrics.byType.SolutionRequirement || 0, color: '#d97706' },
    { label: 'Epic', value: metrics.byType.Epic || 0, color: '#7c3aed' },
    { label: 'Feature', value: metrics.byType.Feature || 0, color: '#2563eb' },
    { label: 'Story', value: metrics.byType.Story || 0, color: '#0891b2' },
  ].filter(d => d.value > 0);

  // Priority chart data
  const priorityChartData = [
    { label: 'Critical', value: metrics.byPriority.Critical || 0, color: '#dc2626' },
    { label: 'High', value: metrics.byPriority.High || 0, color: '#f97316' },
    { label: 'Medium', value: metrics.byPriority.Medium || 0, color: '#eab308' },
    { label: 'Low', value: metrics.byPriority.Low || 0, color: '#22c55e' },
  ].filter(d => d.value > 0);

  // Fake trend data for demo (would come from historical data)
  const weeklyTrend = [12, 15, 18, 22, 20, 25, 28];

  return (
    <div className="metrics-dashboard-view">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <DashboardIcon />
          <div>
            <h2>Metrics Dashboard</h2>
            <span className="subtitle">Project analytics and insights</span>
          </div>
        </div>
        <div className="header-actions">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button className="btn-icon" title="Refresh">
            <RefreshIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {/* Overview Stats */}
        <section className="dashboard-section">
          <h3 className="section-title">
            <AssessmentIcon fontSize="small" />
            Overview
          </h3>
          <div className="stats-grid">
            <StatCard
              title="Total Requirements"
              value={projectArtefacts.length}
              subtitle="All artefact types"
              icon={<AssessmentIcon />}
              color="#3b82f6"
            />
            <StatCard
              title="Completed"
              value={metrics.byStatus.Done + metrics.byStatus.Approved}
              subtitle={`${Math.round(((metrics.byStatus.Done + metrics.byStatus.Approved) / projectArtefacts.length) * 100) || 0}% complete`}
              icon={<CheckCircleIcon />}
              trend="up"
              trendValue="+12%"
              color="#22c55e"
            />
            <StatCard
              title="In Progress"
              value={metrics.byStatus.InProgress + metrics.byStatus.InReview}
              subtitle="Active work items"
              icon={<PendingIcon />}
              color="#f59e0b"
            />
            <StatCard
              title="Blocked/Rejected"
              value={metrics.byStatus.Rejected}
              subtitle="Needs attention"
              icon={<ErrorIcon />}
              color="#ef4444"
            />
          </div>
        </section>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Status Distribution */}
          <section className="dashboard-section chart-section">
            <h3 className="section-title">
              <PieChartIcon fontSize="small" />
              By Status
            </h3>
            <div className="chart-container">
              {statusChartData.length > 0 ? (
                <DonutChart data={statusChartData} />
              ) : (
                <div className="empty-chart">No data available</div>
              )}
            </div>
          </section>

          {/* Type Distribution */}
          <section className="dashboard-section chart-section">
            <h3 className="section-title">
              <BarChartIcon fontSize="small" />
              By Type
            </h3>
            <div className="chart-container">
              {typeChartData.length > 0 ? (
                <BarChart data={typeChartData} height={180} />
              ) : (
                <div className="empty-chart">No data available</div>
              )}
            </div>
          </section>

          {/* Priority Distribution */}
          <section className="dashboard-section chart-section">
            <h3 className="section-title">
              <PieChartIcon fontSize="small" />
              By Priority
            </h3>
            <div className="chart-container">
              {priorityChartData.length > 0 ? (
                <DonutChart data={priorityChartData} size={140} />
              ) : (
                <div className="empty-chart">No data available</div>
              )}
            </div>
          </section>
        </div>

        {/* Traceability Section */}
        <section className="dashboard-section">
          <h3 className="section-title">
            <LinkIcon fontSize="small" />
            Traceability Coverage
          </h3>
          <div className="gauges-row">
            <ProgressGauge
              value={traceabilityMetrics.coveredBR}
              max={traceabilityMetrics.totalBR || 1}
              label="BR Coverage"
              color="#dc2626"
            />
            <ProgressGauge
              value={traceabilityMetrics.coveredStories}
              max={traceabilityMetrics.totalStories || 1}
              label="Story Coverage"
              color="#0891b2"
            />
            <div className="trace-stats">
              <div className="trace-stat">
                <span className="trace-stat-value">{traceabilityMetrics.totalBR}</span>
                <span className="trace-stat-label">Business Requirements</span>
              </div>
              <div className="trace-stat">
                <span className="trace-stat-value">{traceabilityMetrics.totalSR}</span>
                <span className="trace-stat-label">Stakeholder Requirements</span>
              </div>
              <div className="trace-stat">
                <span className="trace-stat-value">{traceabilityMetrics.totalSolR}</span>
                <span className="trace-stat-label">Solution Requirements</span>
              </div>
              <div className="trace-stat">
                <span className="trace-stat-value">{traceabilityMetrics.totalRelationships}</span>
                <span className="trace-stat-label">Total Relationships</span>
              </div>
            </div>
          </div>
        </section>

        {/* Agile Metrics */}
        <section className="dashboard-section">
          <h3 className="section-title">
            <TimelineIcon fontSize="small" />
            Agile Metrics
          </h3>
          <div className="agile-metrics-grid">
            <div className="agile-metric-card">
              <div className="metric-header">
                <span className="metric-label">Story Completion</span>
                <span className="metric-value">{agileMetrics.completedStories}/{agileMetrics.totalStories}</span>
              </div>
              <div className="metric-progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(agileMetrics.completedStories / agileMetrics.totalStories) * 100 || 0}%`,
                    backgroundColor: '#22c55e'
                  }}
                />
              </div>
              <div className="metric-footer">
                <span>{Math.round((agileMetrics.completedStories / agileMetrics.totalStories) * 100) || 0}% complete</span>
              </div>
            </div>

            <div className="agile-metric-card">
              <div className="metric-header">
                <span className="metric-label">Story Points</span>
                <span className="metric-value">{agileMetrics.completedPoints}/{agileMetrics.totalPoints}</span>
              </div>
              <div className="metric-progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(agileMetrics.completedPoints / agileMetrics.totalPoints) * 100 || 0}%`,
                    backgroundColor: '#3b82f6'
                  }}
                />
              </div>
              <div className="metric-footer">
                <span>{agileMetrics.totalPoints - agileMetrics.completedPoints} points remaining</span>
              </div>
            </div>

            <div className="agile-metric-card trend-card">
              <div className="metric-header">
                <span className="metric-label">Weekly Trend</span>
                <span className="metric-value trend-up">
                  <TrendingUpIcon fontSize="small" />
                  +18%
                </span>
              </div>
              <TrendChart data={weeklyTrend} color="#22c55e" />
            </div>

            <div className="agile-summary">
              <div className="summary-item">
                <span className="summary-value">{agileMetrics.totalEpics}</span>
                <span className="summary-label">Epics</span>
              </div>
              <div className="summary-item">
                <span className="summary-value">{agileMetrics.totalFeatures}</span>
                <span className="summary-label">Features</span>
              </div>
              <div className="summary-item">
                <span className="summary-value">{agileMetrics.inProgressStories}</span>
                <span className="summary-label">In Progress</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stakeholder Engagement */}
        <section className="dashboard-section">
          <h3 className="section-title">
            <GroupsIcon fontSize="small" />
            Stakeholder Engagement
          </h3>
          <div className="engagement-grid">
            <StatCard
              title="Stakeholders"
              value={stakeholderMetrics.totalStakeholders}
              icon={<GroupsIcon />}
              color="#06b6d4"
            />
            <StatCard
              title="Elicitation Sessions"
              value={stakeholderMetrics.completedSessions}
              subtitle={`of ${stakeholderMetrics.totalSessions} total`}
              icon={<AssessmentIcon />}
              color="#8b5cf6"
            />
            <StatCard
              title="Open Questions"
              value={stakeholderMetrics.openQuestions}
              subtitle={`of ${stakeholderMetrics.totalQuestions} total`}
              icon={<ErrorIcon />}
              color={stakeholderMetrics.openQuestions > 5 ? '#ef4444' : '#f59e0b'}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
