// components/als/ALSWorkspace.js - Main workspace layout for Academic Learning Studio
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

  return (
    <div className="als-workspace">
      {/* Header with situation selector */}
      <ALSSituationHeader onCreateNew={() => setShowSituationModal(true)} />

      <div className="als-workspace-body">
        {/* Left panel: Learning modes */}
        <div className="als-panel als-panel--left">
          <ALSModePanel />
        </div>

        {/* Center: Main content area */}
        <div className="als-main">
          {/* Session panel (when session active) */}
          {activeSession && <ALSSessionPanel />}

          {/* View tabs */}
          <div className="als-view-tabs">
            <button
              className={`als-view-tab ${activeView === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveView('timeline')}
            >
              Timeline
            </button>
            <button
              className={`als-view-tab ${activeView === 'modes' ? 'active' : ''}`}
              onClick={() => setActiveView('modes')}
            >
              Mode Distribution
            </button>
            <button
              className={`als-view-tab ${activeView === 'reflections' ? 'active' : ''}`}
              onClick={() => setActiveView('reflections')}
            >
              Reflections
            </button>
          </div>

          {/* Main view content */}
          <ALSMainView activeView={activeView} />
        </div>

        {/* Right panel: Guidance */}
        <div className="als-panel als-panel--right">
          <ALSGuidancePanel />
        </div>
      </div>

      {/* Modals */}
      {showSituationModal && (
        <ALSSituationModal onClose={() => setShowSituationModal(false)} />
      )}

      {showSessionModal && (
        <ALSSessionModal onClose={() => setShowSessionModal(false)} />
      )}

      {showReflectionModal && (
        <ALSReflectionModal onClose={() => setShowReflectionModal(false)} />
      )}
    </div>
  );
}
