// components/mms/MMSWorkspace.js - Main workspace layout for Sensemaking Studio
import { useState } from 'react';
import { MMSProvider, useMMS } from './MMSContext';
import MMSSituationHeader from './MMSSituationHeader';
import MMSLensPanel from './MMSLensPanel';
import MMSCanvas from './MMSCanvas';
import MMSGuidancePanel from './MMSGuidancePanel';
import MMSAddElementModal from './MMSAddElementModal';

function MMSWorkspaceContent() {
  const { showAddModal, closeAddModal, addModalType, activeSituation } = useMMS();
  const [showGuidance, setShowGuidance] = useState(true);

  return (
    <div className="mms-workspace">
      {/* Header with situation selector */}
      <MMSSituationHeader />

      <div className="mms-workspace-body">
        {/* Left panel: Lenses */}
        <MMSLensPanel />

        {/* Main canvas area */}
        <div className="mms-main-area">
          {activeSituation ? (
            <MMSCanvas />
          ) : (
            <div className="mms-empty-state">
              <div className="mms-empty-icon">🧠</div>
              <h2>Welcome to Sensemaking Studio</h2>
              <p>A space to externalize your thinking, surface assumptions, and explore different perspectives.</p>
              <p className="mms-empty-hint">Create or select a situation to start thinking.</p>
            </div>
          )}
        </div>

        {/* Right panel: Guidance */}
        {showGuidance && activeSituation && (
          <MMSGuidancePanel onClose={() => setShowGuidance(false)} />
        )}

        {/* Toggle guidance button when hidden */}
        {!showGuidance && activeSituation && (
          <button
            className="mms-show-guidance-btn"
            onClick={() => setShowGuidance(true)}
            title="Show guidance"
          >
            💡
          </button>
        )}
      </div>

      {/* Add Element Modal */}
      {showAddModal && (
        <MMSAddElementModal
          onClose={closeAddModal}
          defaultType={addModalType}
        />
      )}
    </div>
  );
}

export default function MMSWorkspace() {
  return (
    <MMSProvider>
      <MMSWorkspaceContent />
    </MMSProvider>
  );
}
