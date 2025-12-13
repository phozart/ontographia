// pages/projects-overview.js
// Project Overview Dashboard - System-wide view of all projects

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../components/AuthContext';

// Format relative time
function formatRelativeTime(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Status badge component
function StatusBadge({ status }) {
  const statusColors = {
    Draft: { bg: 'rgba(107, 114, 128, 0.15)', color: '#6b7280' },
    Active: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
    'On Hold': { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
    Closed: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }
  };
  const style = statusColors[status] || statusColors.Draft;

  return (
    <span
      className="proj-status-badge"
      style={{ background: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}

// Progress bar component
function ProgressBar({ progress, label }) {
  return (
    <div className="proj-progress">
      <div className="proj-progress__bar">
        <div
          className="proj-progress__fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="proj-progress__label">{label || `${progress}%`}</span>
    </div>
  );
}

// Summary stat card
function StatCard({ label, value, icon, highlight }) {
  return (
    <div className={`proj-stat-card${highlight ? ' proj-stat-card--highlight' : ''}`}>
      <div className="proj-stat-card__icon">{icon}</div>
      <div className="proj-stat-card__content">
        <div className="proj-stat-card__value">{value}</div>
        <div className="proj-stat-card__label">{label}</div>
      </div>
    </div>
  );
}

// Project card component
function ProjectCard({ project, onClick }) {
  const { stats, status, domainName, lastActivity, memberCount } = project;
  const totalWorkItems = stats.workItems.open + stats.workItems.inProgress + stats.workItems.blocked;

  return (
    <div className="proj-card" onClick={onClick}>
      <div className="proj-card__header">
        <h3 className="proj-card__title">{project.name}</h3>
        <StatusBadge status={status} />
      </div>

      {domainName && (
        <div className="proj-card__domain">{domainName}</div>
      )}

      {project.description && (
        <p className="proj-card__desc">{project.description}</p>
      )}

      <div className="proj-card__progress-section">
        <div className="proj-card__progress-header">
          <span>Progress</span>
          <span>{stats.progress}% complete</span>
        </div>
        <ProgressBar progress={stats.progress} />
      </div>

      <div className="proj-card__stats">
        <div className="proj-card__stat">
          <span className="proj-card__stat-value">{stats.totalArtefacts}</span>
          <span className="proj-card__stat-label">Artefacts</span>
        </div>
        <div className="proj-card__stat">
          <span className="proj-card__stat-value">{totalWorkItems}</span>
          <span className="proj-card__stat-label">Open Items</span>
        </div>
        <div className="proj-card__stat">
          <span className="proj-card__stat-value">{memberCount}</span>
          <span className="proj-card__stat-label">Members</span>
        </div>
      </div>

      {totalWorkItems > 0 && (
        <div className="proj-card__work-items">
          {stats.workItems.open > 0 && (
            <span className="proj-card__work-tag proj-card__work-tag--open">
              {stats.workItems.open} Open
            </span>
          )}
          {stats.workItems.inProgress > 0 && (
            <span className="proj-card__work-tag proj-card__work-tag--progress">
              {stats.workItems.inProgress} In Progress
            </span>
          )}
          {stats.workItems.blocked > 0 && (
            <span className="proj-card__work-tag proj-card__work-tag--blocked">
              {stats.workItems.blocked} Blocked
            </span>
          )}
        </div>
      )}

      <div className="proj-card__footer">
        <span className="proj-card__activity">
          Updated {formatRelativeTime(lastActivity)}
        </span>
      </div>
    </div>
  );
}

export default function ProjectsOverview() {
  const router = useRouter();
  const { user, role } = useAuth();
  const [data, setData] = useState({ summary: null, projects: [], domains: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (domainFilter) params.set('domainId', domainFilter);
        if (statusFilter) params.set('status', statusFilter);

        const res = await fetch(`/api/projects/overview?${params}`, {
          headers: {
            // API uses x-user / x-role for access control; AuthContext exposes string user + role
            'x-user': user || '',
            'x-role': role || ''
          }
        });

        if (!res.ok) throw new Error('Failed to fetch projects');

        const result = await res.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user, statusFilter, domainFilter]);

  // Filter projects by search term
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return data.projects;
    const term = searchTerm.toLowerCase();
    return data.projects.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      (p.domainName && p.domainName.toLowerCase().includes(term))
    );
  }, [data.projects, searchTerm]);

  // Navigate to project
  const handleProjectClick = (project) => {
    router.push(`/home?projectId=${project.id}`);
  };

  // Create new project
  const handleNewProject = () => {
    router.push('/home?new=true');
  };

  if (loading) {
    return (
      <div className="proj-overview">
        <div className="proj-overview__loading">
          <div className="spinner" />
          <span>Loading projects...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="proj-overview">
        <div className="proj-overview__error">
          <h3>Error loading projects</h3>
          <p>{error}</p>
          <button className="btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, domains } = data;

  return (
    <div className="proj-overview">
      <header className="proj-overview__header">
        <div className="proj-overview__title-row">
          <h1>Projects Overview</h1>
          <button className="btn btn--primary" onClick={handleNewProject}>
            + New Project
          </button>
        </div>
      </header>

      {summary && (
        <div className="proj-overview__summary">
          <StatCard
            label="Total Projects"
            value={summary.total}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
              </svg>
            }
          />
          <StatCard
            label="Active"
            value={summary.byStatus.Active}
            highlight
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            }
          />
          <StatCard
            label="On Hold"
            value={summary.byStatus['On Hold']}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            }
          />
          <StatCard
            label="Open Work Items"
            value={summary.totalWorkItems}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            }
          />
          <StatCard
            label="Recently Active"
            value={summary.recentlyActive}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            }
          />
        </div>
      )}

      <div className="proj-overview__filters">
        <div className="proj-overview__search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="proj-overview__select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
          <option value="On Hold">On Hold</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          className="proj-overview__select"
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
        >
          <option value="">All Domains</option>
          {domains.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="proj-overview__grid">
        {filteredProjects.length === 0 ? (
          <div className="proj-overview__empty">
            <h3>No projects found</h3>
            <p>
              {searchTerm || statusFilter || domainFilter
                ? 'Try adjusting your filters'
                : 'Create your first project to get started'
              }
            </p>
            {!searchTerm && !statusFilter && !domainFilter && (
              <button className="btn btn--primary" onClick={handleNewProject}>
                Create Project
              </button>
            )}
          </div>
        ) : (
          filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project)}
            />
          ))
        )}
      </div>
    </div>
  );
}
