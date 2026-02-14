// components/spaces/als/ALSWorkspace.js - Main workspace layout for Academic Learning Studio
import { useState } from 'react';
import { useALS } from './ALSContext';
import ALSSituationHeader from './ALSSituationHeader';
import ALSModePanel from './ALSModePanel';
import ALSSessionPanel from './ALSSessionPanel';
import ALSMainView from './ALSMainView';
import ALSGuidancePanel from './ALSGuidancePanel';
import ALSSessionModal from './ALSSessionModal';
import ALSReflectionModal from './ALSReflectionModal';
import ALSSituationModal from './ALSSituationModal';

// Shared UI components
import { WorkspaceLayout } from '@/components/ui';

// MUI Icons
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import DonutSmallIcon from '@mui/icons-material/DonutSmall';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AddIcon from '@mui/icons-material/Add';

/**
 * ALSNavigator - Sidebar navigation for Academic Learning Studio
 */
function ALSNavigator({
  activeSituation,
  activeSession,
  activeView,
  onViewChange,
  onCreateSituation,
}) {
  return (
    <nav className="als-navigator">
      {/* Header */}
      <div className="als-nav-header">
        <div className="als-nav-title">
          <SchoolIcon className="als-nav-icon" />
          <span>Learning Studio</span>
        </div>
      </div>

      {/* Situation Header (selector) */}
      <div className="als-nav-situation">
        <ALSSituationHeader onCreateNew={onCreateSituation} />
      </div>

      {/* Left panel: Learning modes */}
      <div className="als-nav-modes">
        <ALSModePanel />
      </div>

      {/* View tabs as nav items */}
      <div className="als-nav-views">
        <div className="als-nav-section-title">Views</div>
        <button
          className={`als-nav-view-btn ${activeView === 'timeline' ? 'active' : ''}`}
          onClick={() => onViewChange('timeline')}
        >
          <TimelineIcon fontSize="small" />
          <span>Timeline</span>
        </button>
        <button
          className={`als-nav-view-btn ${activeView === 'modes' ? 'active' : ''}`}
          onClick={() => onViewChange('modes')}
        >
          <DonutSmallIcon fontSize="small" />
          <span>Mode Distribution</span>
        </button>
        <button
          className={`als-nav-view-btn ${activeView === 'reflections' ? 'active' : ''}`}
          onClick={() => onViewChange('reflections')}
        >
          <AutoStoriesIcon fontSize="small" />
          <span>Reflections</span>
        </button>
      </div>
    </nav>
  );
}

export default function ALSWorkspace() {
  const {
    activeSituation,
    activeSession,
    showSessionModal,
    setShowSessionModal,
    showReflectionModal,
    setShowReflectionModal
  } = useALS();

  const [showSituationModal, setShowSituationModal] = useState(false);
  const [activeView, setActiveView] = useState('timeline'); // timeline, modes, reflections

  // Render the main content area
  const renderMainContent = () => (
    <div className="als-workspace-content">
      {/* Session panel (when session active) */}
      {activeSession && <ALSSessionPanel />}

      {/* Main view content */}
      <ALSMainView activeView={activeView} />

      {/* Right panel: Guidance */}
      <div className="als-guidance-wrapper">
        <ALSGuidancePanel />
      </div>
    </div>
  );

  // Modals
  const modals = (
    <>
      {showSituationModal && (
        <ALSSituationModal onClose={() => setShowSituationModal(false)} />
      )}

      {showSessionModal && (
        <ALSSessionModal onClose={() => setShowSessionModal(false)} />
      )}

      {showReflectionModal && (
        <ALSReflectionModal onClose={() => setShowReflectionModal(false)} />
      )}
    </>
  );

  return (
    <WorkspaceLayout
      navigator={
        <ALSNavigator
          activeSituation={activeSituation}
          activeSession={activeSession}
          activeView={activeView}
          onViewChange={setActiveView}
          onCreateSituation={() => setShowSituationModal(true)}
        />
      }
      modals={modals}
    >
      {renderMainContent()}
    </WorkspaceLayout>
  );
}
