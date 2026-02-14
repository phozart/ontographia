/**
 * Program Dashboard Component (P0)
 *
 * Cross-space initiative view showing all work across studios
 * with filtering, metrics, and recent activity.
 */

import React, { useEffect, useState } from 'react';
import { useIntegration } from './IntegrationContext';

// Space configuration with colors and icons
const SPACE_CONFIG = {
  ba: { name: 'Business Analysis', color: '#5B8A6A', short: 'BA' },
  ea: { name: 'Enterprise Architecture', color: '#7B6B8D', short: 'EA' },
  pdw: { name: 'Product Design', color: '#C9A227', short: 'PDW' },
  pds: { name: 'Project Design', color: '#6B8A9A', short: 'PDS' },
  portfolio: { name: 'Portfolio', color: '#8A6B5B', short: 'PF' },
  cap: { name: 'Capability', color: '#5B7A8A', short: 'CAP' },
  cm: { name: 'Change Management', color: '#7A5B6A', short: 'CM' },
  dwd: { name: 'Dynamic Work Design', color: '#6A7A5B', short: 'DWD' },
  srs: { name: 'Strategic Reasoning', color: '#5B6A7A', short: 'SRS' },
  mms: { name: 'Sensemaking', color: '#7A6A5B', short: 'MMS' },
  sd: { name: 'System Dynamics', color: '#6B7A6B', short: 'SD' }
};

// Status badge colors
const STATUS_COLORS = {
  planning: { bg: 'rgba(201, 162, 39, 0.12)', text: '#A68820' },
  active: { bg: 'rgba(91, 138, 106, 0.12)', text: '#4A7358' },
  on_hold: { bg: 'rgba(156, 154, 148, 0.12)', text: '#5C5A54' },
  completed: { bg: 'rgba(71, 69, 63, 0.12)', text: '#47453F' },
  cancelled: { bg: 'rgba(165, 77, 77, 0.12)', text: '#8F4343' }
};

const PRIORITY_COLORS = {
  critical: { bg: 'rgba(165, 77, 77, 0.12)', text: '#8F4343' },
  high: { bg: 'rgba(201, 162, 39, 0.12)', text: '#A68820' },
  medium: { bg: 'rgba(71, 69, 63, 0.08)', text: '#5C5A54' },
  low: { bg: 'rgba(156, 154, 148, 0.08)', text: '#9C9A94' }
};

function StatCard({ label, value, subtext, icon, trend }) {
  return (
    <div className="program-stat-card">
      <div className="stat-header">
        <span className="stat-icon">{icon}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="stat-subtext">{subtext}</div>}
      {trend && (
        <div className={`stat-trend ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : ''}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );
}

function HealthGauge({ score }) {
  const getColor = (s) => {
    if (s >= 80) return '#5B8A6A';
    if (s >= 60) return '#C9A227';
    if (s >= 40) return '#D4A574';
    return '#A54D4D';
  };

  return (
    <div className="health-gauge">
      <svg viewBox="0 0 100 50" className="gauge-svg">
        <path
          d="M 10 45 A 35 35 0 0 1 90 45"
          fill="none"
          stroke="#E2E0DB"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 10 45 A 35 35 0 0 1 90 45"
          fill="none"
          stroke={getColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 126} 126`}
        />
      </svg>
      <div className="gauge-value">{score}</div>
      <div className="gauge-label">Health Score</div>
    </div>
  );
}

function InitiativeCard({ initiative, onClick }) {
  const statusStyle = STATUS_COLORS[initiative.status] || STATUS_COLORS.planning;
  const priorityStyle = PRIORITY_COLORS[initiative.priority] || PRIORITY_COLORS.medium;

  return (
    <div className="initiative-card" onClick={onClick}>
      <div className="initiative-header">
        <span
          className="initiative-priority"
          style={{ background: priorityStyle.bg, color: priorityStyle.text }}
        >
          {initiative.priority}
        </span>
        <span
          className="initiative-status"
          style={{ background: statusStyle.bg, color: statusStyle.text }}
        >
          {initiative.status.replace('_', ' ')}
        </span>
      </div>

      <h3 className="initiative-name">{initiative.name}</h3>

      {initiative.description && (
        <p className="initiative-description">{initiative.description}</p>
      )}

      <div className="initiative-spaces">
        {(initiative.spaces_involved || []).map(space => (
          <span
            key={space}
            className="space-tag"
            style={{ background: SPACE_CONFIG[space]?.color || '#47453F' }}
          >
            {SPACE_CONFIG[space]?.short || space.toUpperCase()}
          </span>
        ))}
      </div>

      <div className="initiative-meta">
        <span className="meta-item">
          <span className="meta-icon">&#128196;</span>
          {initiative.artefact_count || 0} artefacts
        </span>
        {initiative.target_date && (
          <span className="meta-item">
            <span className="meta-icon">&#128197;</span>
            {new Date(initiative.target_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {initiative.progress_percent > 0 && (
        <div className="initiative-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${initiative.progress_percent}%` }}
            />
          </div>
          <span className="progress-label">{initiative.progress_percent}%</span>
        </div>
      )}
    </div>
  );
}

function PendingItem({ item, type, onAction }) {
  return (
    <div className="pending-item">
      <div className="pending-icon">
        {type === 'approval' ? '&#9888;' : '&#128229;'}
      </div>
      <div className="pending-content">
        <div className="pending-title">
          {type === 'approval'
            ? `${item.from_artefact_name} → ${item.to_artefact_name}`
            : `${item.from_space} → ${item.to_space}`
          }
        </div>
        <div className="pending-meta">
          {type === 'approval' ? item.relationship_type : item.handoff_type}
          {' · '}
          {new Date(item.created_at).toLocaleDateString()}
        </div>
      </div>
      <div className="pending-actions">
        <button
          className="action-btn approve"
          onClick={() => onAction(item.id, 'approve')}
        >
          &#10003;
        </button>
        <button
          className="action-btn reject"
          onClick={() => onAction(item.id, 'reject')}
        >
          &#10005;
        </button>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const getIcon = (type) => {
    switch (type) {
      case 'gate_decision': return '&#128681;';
      case 'handoff': return '&#128229;';
      case 'cross_ref': return '&#128279;';
      default: return '&#128196;';
    }
  };

  return (
    <div className="activity-item">
      <span className="activity-icon">{getIcon(activity.activity_type)}</span>
      <div className="activity-content">
        <span className="activity-type">
          {activity.activity_type.replace('_', ' ')}
        </span>
        <span className="activity-detail">{activity.detail}</span>
      </div>
      <span className="activity-time">
        {new Date(activity.activity_date).toLocaleString()}
      </span>
    </div>
  );
}

export default function ProgramDashboard() {
  const {
    dashboardStats,
    dashboardLoading,
    initiatives,
    initiativesLoading,
    pendingApprovals,
    pendingHandoffs,
    fetchDashboardStats,
    fetchInitiatives,
    fetchCrossReferences,
    fetchHandoffs,
    updateCrossReference,
    updateHandoff
  } = useIntegration();

  const [filter, setFilter] = useState({ status: '', space: '' });
  const [view, setView] = useState('overview'); // overview, initiatives, pending, activity

  useEffect(() => {
    fetchDashboardStats();
    fetchInitiatives();
    fetchCrossReferences({ status: 'pending' });
    fetchHandoffs({ status: 'pending' });
  }, [fetchDashboardStats, fetchInitiatives, fetchCrossReferences, fetchHandoffs]);

  const handleApprovalAction = async (id, action) => {
    if (action === 'reject') {
      const rationale = prompt('Please provide a reason for rejection:');
      if (!rationale) return;
      await updateCrossReference(id, action, rationale);
    } else {
      await updateCrossReference(id, action);
    }
  };

  const handleHandoffAction = async (id, action) => {
    if (action === 'reject') {
      const reason = prompt('Please provide a reason for rejection:');
      if (!reason) return;
      await updateHandoff(id, action, reason);
    } else {
      await updateHandoff(id, action);
    }
  };

  const filteredInitiatives = initiatives.filter(init => {
    if (filter.status && init.status !== filter.status) return false;
    if (filter.space && !(init.spaces_involved || []).includes(filter.space)) return false;
    return true;
  });

  if (dashboardLoading && !dashboardStats) {
    return (
      <div className="program-dashboard loading">
        <div className="loading-spinner">Loading program data...</div>
      </div>
    );
  }

  const stats = dashboardStats?.summary || {};

  return (
    <div className="program-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Program Dashboard</h1>
          <p className="header-subtitle">Cross-space initiative management and governance</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchDashboardStats}>
            Refresh
          </button>
          <button className="btn-primary">
            + New Initiative
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${view === 'overview' ? 'active' : ''}`}
          onClick={() => setView('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${view === 'initiatives' ? 'active' : ''}`}
          onClick={() => setView('initiatives')}
        >
          Initiatives ({initiatives.length})
        </button>
        <button
          className={`tab ${view === 'pending' ? 'active' : ''}`}
          onClick={() => setView('pending')}
        >
          Pending ({pendingApprovals.length + pendingHandoffs.length})
        </button>
        <button
          className={`tab ${view === 'activity' ? 'active' : ''}`}
          onClick={() => setView('activity')}
        >
          Activity
        </button>
      </div>

      {/* Overview View */}
      {view === 'overview' && (
        <div className="dashboard-overview">
          {/* Stats Row */}
          <div className="stats-row">
            <StatCard
              label="Active Initiatives"
              value={stats.activeInitiatives || 0}
              icon="&#128161;"
            />
            <StatCard
              label="Planning"
              value={stats.planningInitiatives || 0}
              icon="&#128221;"
            />
            <StatCard
              label="Pending Approvals"
              value={stats.pendingApprovals || 0}
              icon="&#9888;"
            />
            <StatCard
              label="Pending Handoffs"
              value={stats.pendingHandoffs || 0}
              icon="&#128229;"
            />
            <div className="health-card">
              <HealthGauge score={stats.healthScore || 75} />
            </div>
          </div>

          {/* Two-column layout */}
          <div className="overview-columns">
            {/* Left: Pending items */}
            <div className="overview-section">
              <h2 className="section-title">Pending Actions</h2>
              <div className="pending-list">
                {pendingApprovals.slice(0, 5).map(item => (
                  <PendingItem
                    key={item.id}
                    item={item}
                    type="approval"
                    onAction={handleApprovalAction}
                  />
                ))}
                {pendingHandoffs.slice(0, 5).map(item => (
                  <PendingItem
                    key={item.id}
                    item={item}
                    type="handoff"
                    onAction={handleHandoffAction}
                  />
                ))}
                {pendingApprovals.length === 0 && pendingHandoffs.length === 0 && (
                  <div className="empty-state">No pending actions</div>
                )}
              </div>
            </div>

            {/* Right: Recent activity */}
            <div className="overview-section">
              <h2 className="section-title">Recent Activity</h2>
              <div className="activity-list">
                {(dashboardStats?.recentActivity || []).slice(0, 10).map((activity, idx) => (
                  <ActivityItem key={idx} activity={activity} />
                ))}
                {(!dashboardStats?.recentActivity || dashboardStats.recentActivity.length === 0) && (
                  <div className="empty-state">No recent activity</div>
                )}
              </div>
            </div>
          </div>

          {/* Space Distribution */}
          <div className="space-distribution">
            <h2 className="section-title">Work by Space</h2>
            <div className="space-bars">
              {(dashboardStats?.bySpace || []).map(item => (
                <div key={item.space} className="space-bar-item">
                  <div className="space-bar-label">
                    <span
                      className="space-dot"
                      style={{ background: SPACE_CONFIG[item.space]?.color || '#47453F' }}
                    />
                    {SPACE_CONFIG[item.space]?.name || item.space}
                  </div>
                  <div className="space-bar">
                    <div
                      className="space-bar-fill"
                      style={{
                        width: `${Math.min(100, item.count * 10)}%`,
                        background: SPACE_CONFIG[item.space]?.color || '#47453F'
                      }}
                    />
                  </div>
                  <span className="space-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Initiatives View */}
      {view === 'initiatives' && (
        <div className="dashboard-initiatives">
          {/* Filters */}
          <div className="filters-row">
            <select
              className="filter-select"
              value={filter.status}
              onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
            <select
              className="filter-select"
              value={filter.space}
              onChange={(e) => setFilter(f => ({ ...f, space: e.target.value }))}
            >
              <option value="">All Spaces</option>
              {Object.entries(SPACE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>

          {/* Initiative Grid */}
          <div className="initiatives-grid">
            {initiativesLoading && initiatives.length === 0 ? (
              <div className="loading-state">Loading initiatives...</div>
            ) : filteredInitiatives.length === 0 ? (
              <div className="empty-state">No initiatives found</div>
            ) : (
              filteredInitiatives.map(initiative => (
                <InitiativeCard
                  key={initiative.id}
                  initiative={initiative}
                  onClick={() => console.log('Open initiative', initiative.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Pending View */}
      {view === 'pending' && (
        <div className="dashboard-pending">
          <div className="pending-section">
            <h2 className="section-title">
              Pending Approvals ({pendingApprovals.length})
            </h2>
            <div className="pending-list full">
              {pendingApprovals.map(item => (
                <PendingItem
                  key={item.id}
                  item={item}
                  type="approval"
                  onAction={handleApprovalAction}
                />
              ))}
              {pendingApprovals.length === 0 && (
                <div className="empty-state">No pending approvals</div>
              )}
            </div>
          </div>

          <div className="pending-section">
            <h2 className="section-title">
              Pending Handoffs ({pendingHandoffs.length})
            </h2>
            <div className="pending-list full">
              {pendingHandoffs.map(item => (
                <PendingItem
                  key={item.id}
                  item={item}
                  type="handoff"
                  onAction={handleHandoffAction}
                />
              ))}
              {pendingHandoffs.length === 0 && (
                <div className="empty-state">No pending handoffs</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity View */}
      {view === 'activity' && (
        <div className="dashboard-activity">
          <div className="activity-list full">
            {(dashboardStats?.recentActivity || []).map((activity, idx) => (
              <ActivityItem key={idx} activity={activity} />
            ))}
            {(!dashboardStats?.recentActivity || dashboardStats.recentActivity.length === 0) && (
              <div className="empty-state">No activity recorded</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
