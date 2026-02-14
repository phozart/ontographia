// components/ui/WorkspaceLayout.js
// Shared Workspace Layout - Consistent structure for all studio workspaces
//
// Usage:
//   <WorkspaceLayout
//     views={[{ id: 'overview', name: 'Overview' }, { id: 'list', name: 'List' }]}
//     activeView="overview"
//     onViewChange={(viewId) => setActiveView(viewId)}
//     navigator={<MyNavigator />}
//     actions={<button>Create</button>}
//     error={error}
//     noProject={!activeProject}
//     onCreateProject={() => setShowCreateModal(true)}
//   >
//     {renderView()}
//   </WorkspaceLayout>

import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import styles from './WorkspaceLayout.module.css';

/**
 * WorkspaceLayout - Standard layout wrapper for all studio workspaces
 *
 * Provides consistent structure:
 * - Studio navigation bar (view tabs) at top
 * - Optional navigator sidebar on left (220px)
 * - Main content area with optional breadcrumbs
 * - Error toast display
 *
 * @param {Array} views - Array of view objects { id, name, icon? }
 * @param {string} activeView - Current active view ID
 * @param {Function} onViewChange - Callback when view tab is clicked
 * @param {ReactNode} navigator - Navigator component (left sidebar)
 * @param {ReactNode} breadcrumbs - Optional breadcrumbs component
 * @param {ReactNode} actions - Optional toolbar actions (buttons on right side of studio nav)
 * @param {ReactNode} children - Main view content
 * @param {string} error - Optional error message to display
 * @param {boolean} noProject - Show no project/selection state
 * @param {string} noSelectionTitle - Custom title for no selection state
 * @param {string} noSelectionMessage - Custom message for no selection state
 * @param {Function} onCreateProject - Callback to create a new project
 * @param {ReactNode} modals - Modal components to render at root level
 */
export function WorkspaceLayout({
  views = [],
  activeView,
  onViewChange,
  navigator,
  breadcrumbs,
  actions,
  children,
  error,
  noProject = false,
  noSelectionTitle = 'No Project Selected',
  noSelectionMessage = 'Select a project from the dropdown above, or create a new one to start working.',
  onCreateProject,
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
          {onCreateProject && (
            <button
              className={styles.createProjectBtn}
              onClick={onCreateProject}
            >
              <AddIcon fontSize="small" />
              Create New Project
            </button>
          )}
        </div>
        {/* Still render modals even in no-project state so create modal works */}
        {modals}
      </div>
    );
  }

  return (
    <div className={styles.workspace}>
      {/* Studio Navigation Bar (View Tabs) */}
      {views.length > 0 && (
        <nav className={styles.studioNav}>
          <div className={styles.studioTabs}>
            {views.map(view => (
              <button
                key={view.id}
                className={`${styles.studioTab} ${activeView === view.id ? styles.active : ''}`}
                onClick={() => onViewChange?.(view.id)}
              >
                {view.icon && <span className={styles.tabIcon}>{view.icon}</span>}
                <span>{view.name}</span>
              </button>
            ))}
          </div>
          {actions && (
            <div className={styles.studioActions}>
              {actions}
            </div>
          )}
        </nav>
      )}

      {/* Workspace Body (Navigator + Content) */}
      <div className={styles.workspaceBody}>
        {/* Navigator sidebar */}
        {navigator && (
          <aside className={styles.navigator}>
            {navigator}
          </aside>
        )}

        {/* Main content area */}
        <main className={styles.main}>
          {/* Header bar with breadcrumbs */}
          {breadcrumbs && (
            <div className={styles.header}>
              <div className={styles.breadcrumbs}>
                {breadcrumbs}
              </div>
              {views.length === 0 && actions && (
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
      </div>

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

/**
 * NavigatorHeader - Section header for navigator sidebar
 */
export function NavigatorHeader({ children }) {
  return <div className={styles.navigatorHeader}>{children}</div>;
}

/**
 * NavigatorContent - Scrollable content area for navigator sidebar
 */
export function NavigatorContent({ children }) {
  return <div className={styles.navigatorContent}>{children}</div>;
}

/**
 * NavItem - Navigation item for navigator sidebar
 */
export function NavItem({ icon: Icon, label, onClick, active = false }) {
  return (
    <button
      className={`${styles.navItem} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      {Icon && <Icon fontSize="small" />}
      <span>{label}</span>
    </button>
  );
}

export default WorkspaceLayout;
