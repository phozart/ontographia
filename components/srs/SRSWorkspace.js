/**
 * SRSWorkspace - Main workspace layout for Strategic Reasoning Suite
 *
 * Follows the same Navigator pattern as PDW and DWD workspaces.
 *
 * @component
 * @module components/srs/SRSWorkspace
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import styles from './SRSWorkspace.module.css';
import { useSRS, SRS_SPACES } from './SRSContext';
import CoachingPanel from './CoachingPanel';

// Shared UI components
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs } from '../ui';

// Space Views
import {
  QuestionsSpace,
  FramesSpace,
  ParallelStatesSpace,
  SystemsSpace,
  PerspectivesSpace,
  DecisionsSpace,
} from './spaces';

// Overview component (inline for now)
import OverviewDashboard from './views/OverviewDashboard';

// MUI Icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CropFreeIcon from '@mui/icons-material/CropFree';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GavelIcon from '@mui/icons-material/Gavel';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SaveIcon from '@mui/icons-material/Save';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WarningIcon from '@mui/icons-material/Warning';

// View configuration - following PDW pattern
const VIEW_GROUPS = [
  {
    id: 'explore',
    name: 'Explore',
    color: '#3b82f6',
    views: [
      { id: 'questions', name: 'Questions', icon: HelpOutlineIcon, color: '#3b82f6' },
      { id: 'frames', name: 'Frames', icon: CropFreeIcon, color: '#10b981' },
    ],
  },
  {
    id: 'analyze',
    name: 'Analyze',
    color: '#f59e0b',
    views: [
      { id: 'parallel_states', name: 'Parallel States', icon: CallSplitIcon, color: '#f59e0b' },
      { id: 'systems', name: 'Systems Map', icon: AccountTreeIcon, color: '#ef4444' },
    ],
  },
  {
    id: 'decide',
    name: 'Decide',
    color: '#8b5cf6',
    views: [
      { id: 'perspectives', name: 'Perspectives', icon: VisibilityIcon, color: '#8b5cf6' },
      { id: 'decisions', name: 'Decisions', icon: GavelIcon, color: '#6366f1' },
    ],
  },
];

// View info for breadcrumbs
const VIEW_INFO = {
  overview: { name: 'Overview', group: null },
  questions: { name: 'Questions', group: 'Explore' },
  frames: { name: 'Frames', group: 'Explore' },
  parallel_states: { name: 'Parallel States', group: 'Analyze' },
  systems: { name: 'Systems Map', group: 'Analyze' },
  perspectives: { name: 'Perspectives', group: 'Decide' },
  decisions: { name: 'Decisions', group: 'Decide' },
};

// Space view components
const SpaceViews = {
  questions: QuestionsSpace,
  frames: FramesSpace,
  parallel_states: ParallelStatesSpace,
  systems: SystemsSpace,
  perspectives: PerspectivesSpace,
  decisions: DecisionsSpace,
};

// Space colors
const SPACE_COLORS = {
  overview: '#6366f1',
  questions: '#3b82f6',
  frames: '#10b981',
  parallel_states: '#f59e0b',
  systems: '#ef4444',
  perspectives: '#8b5cf6',
  decisions: '#6366f1',
};

/**
 * Navigator Component - Sidebar navigation following PDW pattern
 */
function SRSNavigator({
  activeView,
  onViewChange,
  stats,
  onCreateClick,
  activeSession,
  onSessionSelect,
  sessions,
  coachingEnabled,
  onToggleCoaching,
  onNoSessionClick,
}) {
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    VIEW_GROUPS.forEach(g => { initial[g.id] = true; });
    return initial;
  });

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Handle view click - show message if no session
  const handleViewClick = (viewId) => {
    if (!activeSession) {
      onNoSessionClick();
    } else {
      onViewChange(viewId);
    }
  };

  return (
    <nav className={styles.navigator}>
      {/* Header */}
      <div className={styles.navHeader}>
        <div className={styles.navHeaderTitle}>
          <PsychologyIcon className={styles.navHeaderIcon} />
          <span>Strategic Reasoning</span>
        </div>
      </div>

      {/* Session Selector */}
      <div className={styles.navSessionSelector}>
        <select
          className={styles.sessionSelect}
          value={activeSession?.id || ''}
          onChange={(e) => onSessionSelect(e.target.value)}
        >
          <option value="">Select a session...</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
        <button
          className={styles.newSessionBtn}
          onClick={onCreateClick}
          title="New Session"
        >
          <AddIcon fontSize="small" />
        </button>
      </div>

      {/* Overview Button */}
      <div className={styles.navHome}>
        <button
          className={`${styles.navHomeBtn} ${activeView === 'overview' ? styles.active : ''}`}
          onClick={() => onViewChange('overview')}
        >
          <DashboardIcon fontSize="small" />
          <span>Overview</span>
          {stats?.total > 0 && <span className={styles.navCount}>{stats.total}</span>}
        </button>
      </div>

      {/* Grouped Views */}
      <div className={styles.navViewsGrouped}>
        {VIEW_GROUPS.map(group => {
          const isExpanded = expandedGroups[group.id];
          const hasActiveView = group.views.some(v => v.id === activeView);
          const groupCount = group.views.reduce((sum, v) => sum + (stats?.[v.id] || 0), 0);

          return (
            <div key={group.id} className={styles.navGroup}>
              <button
                className={`${styles.navGroupHeader} ${hasActiveView ? styles.hasActive : ''}`}
                onClick={() => toggleGroup(group.id)}
                style={hasActiveView ? { borderLeftColor: group.color } : {}}
              >
                {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                <span className={styles.groupName}>{group.name}</span>
                {groupCount > 0 && <span className={styles.groupCount}>{groupCount}</span>}
              </button>
              {isExpanded && (
                <div className={styles.navGroupViews}>
                  {group.views.map(view => {
                    const Icon = view.icon;
                    const count = stats?.[view.id] || 0;
                    const isActive = activeView === view.id;

                    return (
                      <button
                        key={view.id}
                        className={`${styles.navViewBtn} ${isActive ? styles.active : ''} ${!activeSession ? styles.disabled : ''}`}
                        onClick={() => handleViewClick(view.id)}
                      >
                        <Icon fontSize="small" style={isActive ? { color: view.color } : {}} />
                        <span>{view.name}</span>
                        {count > 0 && <span className={styles.navCount}>{count}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className={styles.navFooter}>
        <div className={styles.navActions}>
          <button
            className={`${styles.navActionBtn} ${coachingEnabled ? styles.active : ''}`}
            onClick={onToggleCoaching}
            title={coachingEnabled ? 'Disable coaching' : 'Enable coaching'}
          >
            <LightbulbIcon fontSize="small" />
          </button>
        </div>
      </div>
    </nav>
  );
}

/**
 * SRSWorkspace Component - Main workspace
 */
export default function SRSWorkspace() {
  const {
    sessions,
    activeSession,
    loadSession,
    currentSpace,
    navigateToSpace,
    createSession,
    coachingEnabled,
    setCoachingEnabled,
    coachingTriggers,
    dismissCoachingTrigger,
    sessionStats,
    loading,
    error,
  } = useSRS();

  const [activeView, setActiveView] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNoSessionNotice, setShowNoSessionNotice] = useState(false);

  // Handle no-session click notification
  const handleNoSessionClick = useCallback(() => {
    setShowNoSessionNotice(true);
    // Auto-hide after 3 seconds
    setTimeout(() => setShowNoSessionNotice(false), 3000);
  }, []);

  // Sync activeView with context's currentSpace when navigateToSpace is called externally
  useEffect(() => {
    if (currentSpace && activeSession && SpaceViews[currentSpace]) {
      setActiveView(currentSpace);
    }
  }, [currentSpace, activeSession]);

  // Handle view change
  const handleViewChange = useCallback((viewId) => {
    setActiveView(viewId);
    if (viewId !== 'overview' && SpaceViews[viewId]) {
      navigateToSpace(viewId);
    }
  }, [navigateToSpace]);

  // Handle session selection
  const handleSessionSelect = useCallback((sessionId) => {
    if (!sessionId) {
      return;
    }
    loadSession(sessionId);
  }, [loadSession]);

  // Handle new session creation
  const handleCreateSession = useCallback(async () => {
    const newSession = await createSession({
      title: `Reasoning Session ${sessions.length + 1}`,
      intent: 'understand',
      mode: 'solo',
    });
    if (newSession) {
      setActiveView('questions');
    }
  }, [createSession, sessions.length]);

  // Get current view component
  const CurrentViewComponent = useMemo(() => {
    if (activeView === 'overview') {
      return OverviewDashboard;
    }
    return SpaceViews[activeView] || null;
  }, [activeView]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: Object.values(sessionStats.bySpace || {}).reduce((a, b) => a + b, 0),
    ...sessionStats.bySpace,
  }), [sessionStats]);

  // View info for current view
  const viewInfo = VIEW_INFO[activeView] || { name: activeView, group: null };
  const viewColor = SPACE_COLORS[activeView] || '#6366f1';

  // Build breadcrumbs
  const breadcrumbsContent = activeView !== 'overview' ? (
    <Breadcrumbs>
      <Breadcrumb
        icon={DashboardIcon}
        label="Overview"
        onClick={() => handleViewChange('overview')}
      />
      {viewInfo.group && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb label={viewInfo.group} />
        </>
      )}
      <BreadcrumbSeparator />
      <Breadcrumb label={viewInfo.name} active />
    </Breadcrumbs>
  ) : null;

  // Render main content
  const renderMainContent = () => (
    <div className={styles.studioMain}>
      {/* No Session Warning */}
      {!activeSession && activeView !== 'overview' && (
        <div className={styles.noSessionWarning}>
          <WarningIcon fontSize="small" />
          <span>Select or create a session to start reasoning</span>
          <button className={styles.createSessionBtn} onClick={handleCreateSession}>
            <AddIcon fontSize="small" />
            New Session
          </button>
        </div>
      )}

      {/* View Content - Render directly like PDW */}
      {CurrentViewComponent && <CurrentViewComponent />}

      {/* Coaching Panel */}
      {coachingEnabled && coachingTriggers.length > 0 && (
        <CoachingPanel
          triggers={coachingTriggers}
          onDismiss={dismissCoachingTrigger}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <span>Loading...</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <WorkspaceLayout
        navigator={
          <SRSNavigator
            activeView={activeView}
            onViewChange={handleViewChange}
            stats={stats}
            onCreateClick={handleCreateSession}
            activeSession={activeSession}
            onSessionSelect={handleSessionSelect}
            sessions={sessions}
            coachingEnabled={coachingEnabled}
            onToggleCoaching={() => setCoachingEnabled(!coachingEnabled)}
            onNoSessionClick={handleNoSessionClick}
          />
        }
        breadcrumbs={breadcrumbsContent}
        error={error}
      >
        {renderMainContent()}
      </WorkspaceLayout>

      {/* No Session Notification Toast */}
      {showNoSessionNotice && (
        <div className={styles.noSessionToast}>
          <WarningIcon fontSize="small" />
          <span>Please select or create a reasoning session first</span>
          <button
            className={styles.toastCreateBtn}
            onClick={() => {
              setShowNoSessionNotice(false);
              handleCreateSession();
            }}
          >
            <AddIcon fontSize="small" />
            New Session
          </button>
        </div>
      )}
    </>
  );
}
