// components/shared/DomainDashboard/ProjectCard.js
// Clickable project/initiative card for domain dashboard

import styles from './DomainDashboard.module.css';

/**
 * Format a date for display
 * @param {string|Date} date
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * ProjectCard - Clickable card for a project or initiative
 * @param {Object} props
 * @param {Object} props.project - Project/initiative data
 * @param {string} props.displayIdField - Field name for display ID (e.g., 'display_id', 'initiative_id')
 * @param {string} props.statusField - Field name for status (e.g., 'status', 'stage')
 * @param {string} props.countField - Field name for artefact count
 * @param {string} props.countLabel - Label for count (e.g., 'artefacts', 'items')
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.showProgress - Show progress bar
 */
export default function ProjectCard({
  project,
  displayIdField = 'display_id',
  statusField = 'status',
  countField = 'artefact_count',
  countLabel = 'artefacts',
  onClick,
  showProgress = false,
}) {
  const displayId = project[displayIdField] || project.display_id || project.initiative_id;
  const status = project[statusField] || project.status || project.stage;
  const count = project[countField] ?? project.artefact_count ?? 0;
  const progress = project.progress_percent ?? project.progress ?? null;

  return (
    <div
      className={styles.projectCard}
      onClick={() => onClick?.(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(project);
        }
      }}
    >
      <div className={styles.projectHeader}>
        {displayId && (
          <span className={styles.projectId}>{displayId}</span>
        )}
        {status && (
          <span
            className={styles.projectBadge}
            data-status={status.toLowerCase().replace(/\s+/g, '_')}
          >
            {status.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      <h3 className={styles.projectName}>{project.name || project.title}</h3>

      {project.description && (
        <p className={styles.projectDescription}>{project.description}</p>
      )}

      <div className={styles.projectMeta}>
        <span className={styles.metaItem}>
          <span className={styles.metaIcon}>&#128196;</span>
          {count} {countLabel}
        </span>
        {project.updated_at && (
          <span className={styles.metaItem}>
            <span className={styles.metaIcon}>&#128197;</span>
            {formatDate(project.updated_at)}
          </span>
        )}
        {project.target_date && (
          <span className={styles.metaItem}>
            <span className={styles.metaIcon}>&#127919;</span>
            {formatDate(project.target_date)}
          </span>
        )}
      </div>

      {showProgress && progress !== null && progress > 0 && (
        <div className={styles.projectProgress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <span className={styles.progressLabel}>{progress}%</span>
        </div>
      )}
    </div>
  );
}
