// components/philosophy/PhilosophyWorkspace.js
// Main workspace layout for Philosophical & Critical Thinking Studio

import { useState } from 'react';
import { PhilosophyProvider, usePhilosophy } from './PhilosophyContext';
import PhilosophyInquiryHeader from './PhilosophyInquiryHeader';
import PhilosophyLensPanel from './PhilosophyLensPanel';
import PhilosophyCanvas from './PhilosophyCanvas';
import PhilosophyGuidancePanel from './PhilosophyGuidancePanel';
import PhilosophyAddElementModal from './PhilosophyAddElementModal';

function PhilosophyWorkspaceContent() {
  const { showAddModal, closeAddModal, addModalType, activeInquiry } = usePhilosophy();
  const [showGuidance, setShowGuidance] = useState(true);

  return (
    <div className="phil-workspace">
      {/* Header with inquiry selector */}
      <PhilosophyInquiryHeader />

      <div className="phil-workspace-body">
        {/* Left panel: Lenses */}
        <PhilosophyLensPanel />

        {/* Main canvas area */}
        <div className="phil-main-area">
          {activeInquiry ? (
            <PhilosophyCanvas />
          ) : (
            <div className="phil-empty-state">
              <div className="phil-empty-icon">?</div>
              <h2>Welcome to Philosophy Studio</h2>
              <p>A space for disciplined reasoning, conceptual clarity, and critical examination of ideas.</p>
              <p className="phil-empty-hint">Create or select an inquiry to begin thinking.</p>
              <div className="phil-empty-principles">
                <div className="phil-principle">
                  <span className="phil-principle-icon">C</span>
                  <span>Clarity before conclusion</span>
                </div>
                <div className="phil-principle">
                  <span className="phil-principle-icon">A</span>
                  <span>Arguments, not opinions</span>
                </div>
                <div className="phil-principle">
                  <span className="phil-principle-icon">{'<>'}</span>
                  <span>Challenge, not defend</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right panel: Guidance */}
        {showGuidance && activeInquiry && (
          <PhilosophyGuidancePanel onClose={() => setShowGuidance(false)} />
        )}

        {/* Toggle guidance button when hidden */}
        {!showGuidance && activeInquiry && (
          <button
            className="phil-show-guidance-btn"
            onClick={() => setShowGuidance(true)}
            title="Show guidance"
          >
            ?
          </button>
        )}
      </div>

      {/* Add Element Modal */}
      {showAddModal && (
        <PhilosophyAddElementModal
          onClose={closeAddModal}
          defaultType={addModalType}
        />
      )}
    </div>
  );
}

export default function PhilosophyWorkspace() {
  return (
    <PhilosophyProvider>
      <PhilosophyWorkspaceContent />
    </PhilosophyProvider>
  );
}
