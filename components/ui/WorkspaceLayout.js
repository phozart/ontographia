// components/ui/WorkspaceLayout.js
// Shared Workspace Layout - Consistent structure for all studio workspaces
//
// Usage:
//   <WorkspaceLayout
//     navigator={<MyNavigator />}
//     breadcrumbs={showBreadcrumbs && <Breadcrumbs />}
//     error={error}
//     noProject={!activeProject}
//   >
//     {renderView()}
//   </WorkspaceLayout>

import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import WarningIcon from '@mui/icons-material/Warning';
import styles from './WorkspaceLayout.module.css';

/**
 * WorkspaceLayout - Standard layout wrapper for all studio workspaces
 *
 * Provides consistent structure:
 * - Navigator sidebar on left (260px)
 * - Main content area with optional breadcrumbs and toolbar actions
 * - No selection state handling (project or domain)
 * - Error toast display
 *
 * @param {ReactNode} navigator - Navigator component (left sidebar)
 * @param {ReactNode} breadcrumbs - Optional breadcrumbs component
 * @param {ReactNode} actions - Optional toolbar actions (buttons on right side of header)
 * @param {ReactNode} children - Main view content
 * @param {string} error - Optional error message to display
 * @param {boolean} noProject - Show no project/selection state
 * @param {string} noSelectionTitle - Custom title for no selection state (default: "No Project Selected")
 * @param {string} noSelectionMessage - Custom message for no selection state
 * @param {ReactNode} modals - Modal components to render at root level
 */
export function WorkspaceLayout({
  navigator,
  breadcrumbs,
  actions,
  children,
  error,
  noProject = false,
  noSelectionTitle = 'No Project Selected',
  noSelectionMessage = 'Select a project from the dropdown above to start working.',
  modals,
}) {
  // No project/domain selected state
  if (noProject) {
    return (
      <div className={styles.workspace}>
        <div className={styles.noProject}>
          <FolderOpenIcon style={{ fontSize: 64, opacity: 0.3, marginBottom: 16 }} />
          <h2>{noSelectionTitle}</h2>
          <p>{noSelectionMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.workspace}>
      {/* Navigator sidebar */}
      {navigator}

      {/* Main content area */}
      <main className={styles.main}>
        {/* Header bar with breadcrumbs and actions */}
        {(breadcrumbs || actions) && (
          <div className={styles.header}>
            <div className={styles.breadcrumbs}>
              {breadcrumbs}
            </div>
            {actions && (
              <div className={styles.actions}>
                {actions}
              </div>
            )}
          </div>
        )}

        {/* View content */}
        <div className={styles.content}>
          {children}
        </div>
      </main>

      {/* Modals rendered at root level */}
      {modals}

      {/* Error toast */}
      {error && (
        <div className={styles.toast}>
          <WarningIcon fontSize="small" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Breadcrumb - Individual breadcrumb item
 */
export function Breadcrumb({ icon: Icon, label, onClick, active = false }) {
  if (onClick && !active) {
    return (
      <button className={styles.breadcrumbItem} onClick={onClick}>
        {Icon && <Icon fontSize="small" />}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <span className={`${styles.breadcrumbItem} ${active ? styles.active : ''}`}>
      {Icon && <Icon fontSize="small" />}
      <span>{label}</span>
    </span>
  );
}

/**
 * BreadcrumbSeparator - Arrow between breadcrumb items
 */
export function BreadcrumbSeparator() {
  return <span className={styles.breadcrumbSeparator}>›</span>;
}

/**
 * Breadcrumbs - Container for breadcrumb navigation
 */
export function Breadcrumbs({ children }) {
  return <nav className={styles.breadcrumbsNav}>{children}</nav>;
}

export default WorkspaceLayout;
