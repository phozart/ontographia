// components/shared/DomainDashboard/DomainDashboard.js
// Shared domain-level dashboard component for workspaces
// Displays project cards, stats, quick actions, and recent activity

import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import styles from './DomainDashboard.module.css';
import QuickStatsBar from './QuickStatsBar';
import ProjectCard from './ProjectCard';

/**
 * DomainDashboard - Shared dashboard for domain-level workspace views
 *
 * @param {Object} config - Workspace-specific configuration
 * @param {string} config.title - Dashboard title (e.g., "Blueprint Studio")
 * @param {string} config.subtitle - Dashboard subtitle
 * @param {string} config.projectLabel - Label for projects (e.g., "Initiatives", "Projects")
 * @param {string} config.projectLabelSingular - Singular label
 * @param {string} config.emptyIcon - Emoji for empty state
 * @param {string} config.emptyTitle - Title for empty state
 * @param {string} config.emptyMessage - Message for empty state
 * @param {string} config.displayIdField - Field for display ID
 * @param {string} config.statusField - Field for status
 * @param {string} config.countField - Field for count
 * @param {string} config.countLabel - Label for count
 * @param {boolean} config.showProgress - Whether to show progress bar
 *
 * @param {Array} projects - Array of project/initiative objects
 * @param {Array} stats - Array of stat objects for QuickStatsBar
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 * @param {Function} onSelectProject - Callback when project is selected
 * @param {Function} onCreateProject - Callback to create new project
 * @param {Array} quickActions - Array of quick action objects { label, icon, onClick, primary? }
 * @param {Array} recentActivity - Array of activity objects { text, time }
 */
export default function DomainDashboard({
  config = {},
  projects = [],
  stats = [],
  loading = false,
  error,
  onSelectProject,
  onCreateProject,
  quickActions = [],
  recentActivity = [],
}) {
  const {
    title = 'Dashboard',
    subtitle = 'All projects in this domain',
    projectLabel = 'Projects',
    projectLabelSingular = 'Project',
    emptyIcon = '&#128194;',
    emptyTitle = `No ${projectLabel} Yet`,
    emptyMessage = `Create your first ${projectLabelSingular.toLowerCase()} to get started.`,
    displayIdField = 'display_id',
    statusField = 'status',
    countField = 'artefact_count',
    countLabel = 'artefacts',
    showProgress = false,
  } = config;

  // Error state
  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>&#9888;</div>
          <h3 className={styles.emptyTitle}>Error Loading Data</h3>
          <p className={styles.emptyMessage}>{error}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
        </div>
        <QuickStatsBar stats={[]} loading={true} />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Loading {projectLabel.toLowerCase()}...</span>
        </div>
      </div>
    );
  }

  // Build default quick actions if none provided
  const defaultQuickActions = [
    ...(onCreateProject ? [{
      label: `Create ${projectLabelSingular}`,
      icon: <AddIcon fontSize="small" />,
      onClick: onCreateProject,
      primary: true,
    }] : []),
    ...quickActions,
  ];

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <QuickStatsBar stats={stats} loading={loading} />

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Projects Grid */}
        <div className={styles.projectsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {projectLabel} ({projects.length})
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className={styles.emptyState}>
              <div
                className={styles.emptyIcon}
                dangerouslySetInnerHTML={{ __html: emptyIcon }}
              />
              <h3 className={styles.emptyTitle}>{emptyTitle}</h3>
              <p className={styles.emptyMessage}>{emptyMessage}</p>
              {onCreateProject && (
                <button className={styles.emptyAction} onClick={onCreateProject}>
                  <AddIcon fontSize="small" />
                  Create {projectLabelSingular}
                </button>
              )}
            </div>
          ) : (
            <div className={styles.projectsGrid}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  displayIdField={displayIdField}
                  statusField={statusField}
                  countField={countField}
                  countLabel={countLabel}
                  showProgress={showProgress}
                  onClick={onSelectProject}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Quick Actions */}
          {defaultQuickActions.length > 0 && (
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarHeader}>
                <h3 className={styles.sidebarTitle}>Quick Actions</h3>
              </div>
              <div className={styles.quickActions}>
                {defaultQuickActions.map((action, idx) => (
                  <button
                    key={idx}
                    className={action.primary ? styles.actionBtnPrimary : styles.actionBtn}
                    onClick={action.onClick}
                  >
                    {action.icon && <span className={styles.actionIcon}>{action.icon}</span>}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarHeader}>
                <h3 className={styles.sidebarTitle}>Recent Activity</h3>
              </div>
              <div className={styles.activityList}>
                {recentActivity.slice(0, 8).map((activity, idx) => (
                  <div key={idx} className={styles.activityItem}>
                    <div className={styles.activityDot} />
                    <div className={styles.activityContent}>
                      <div
                        className={styles.activityText}
                        dangerouslySetInnerHTML={{ __html: activity.text }}
                      />
                      {activity.time && (
                        <div className={styles.activityTime}>{activity.time}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
