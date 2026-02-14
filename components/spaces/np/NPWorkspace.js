// components/np/NPWorkspace.js
// Main workspace component for N&P (Negotiation & Persuasion) Sensemaking Studio

import { useState, useCallback } from 'react';
import { useNP } from './NPContext';
import SituationCanvas from './views/SituationCanvas';
import PerspectiveMapper from './views/PerspectiveMapper';
import InterestPositionMap from './views/InterestPositionMap';
import ZOPASketch from './views/ZOPASketch';
import PreparationJournal from './views/PreparationJournal';
import ConversationReview from './views/ConversationReview';
import GuidancePanel from './views/GuidancePanel';

const NP_VIEWS = [
  { id: 'situation', label: 'Situation', icon: '🎯', description: 'Ground the situation before tactics' },
  { id: 'perspective', label: 'Perspectives', icon: '👁️', description: 'Map your perspective vs theirs' },
  { id: 'interests', label: 'Interests', icon: '💡', description: 'Distinguish positions from interests' },
  { id: 'zopa', label: 'ZOPA', icon: '🤝', description: 'Sketch possible agreement space' },
  { id: 'journal', label: 'Journal', icon: '📓', description: 'Preparation notes and reflections' },
  { id: 'conversation', label: 'Review', icon: '💬', description: 'Analyze conversation (post-hoc)' },
];

export default function NPWorkspace() {
  const {
    situations,
    currentSituation,
    elements,
    loading,
    error,
    activeView,
    setActiveView,
    lens,
    setLens,
    selectSituation,
    createSituation,
    deleteSituation,
    currentWorkflow,
    currentStep,
    activePrompts,
    stats
  } = useNP();

  const [showSituationList, setShowSituationList] = useState(false);
  const [showNewSituationModal, setShowNewSituationModal] = useState(false);
  const [newSituationName, setNewSituationName] = useState('');
  const [showGuidance, setShowGuidance] = useState(true);

  const handleCreateSituation = useCallback(async () => {
    if (!newSituationName.trim()) return;
    try {
      await createSituation({ name: newSituationName.trim() });
      setNewSituationName('');
      setShowNewSituationModal(false);
    } catch (err) {
      console.error('Failed to create situation:', err);
    }
  }, [createSituation, newSituationName]);

  const handleDeleteSituation = useCallback(async (id, e) => {
    e.stopPropagation();
    if (confirm('Delete this situation? This cannot be undone.')) {
      await deleteSituation(id);
    }
  }, [deleteSituation]);

  const renderViewContent = () => {
    switch (activeView) {
      case 'situation':
        return <SituationCanvas />;
      case 'perspective':
        return <PerspectiveMapper />;
      case 'interests':
        return <InterestPositionMap />;
      case 'zopa':
        return <ZOPASketch />;
      case 'journal':
        return <PreparationJournal />;
      case 'conversation':
        return <ConversationReview />;
      default:
        return <SituationCanvas />;
    }
  };

  return (
    <div className="np-workspace">
      {/* Top Bar */}
      <header className="np-header">
        <div className="np-header-left">
          <h1 className="np-title">N&P Studio</h1>
          <span className="np-subtitle">Negotiation & Persuasion Sensemaking</span>
        </div>

        <div className="np-header-center">
          {/* Situation Selector */}
          <div className="np-situation-selector">
            <button
              className="np-situation-btn"
              onClick={() => setShowSituationList(!showSituationList)}
            >
              {currentSituation ? (
                <>
                  <span className="np-situation-name">{currentSituation.name}</span>
                  <span className={`np-situation-status np-status-${currentSituation.status}`}>
                    {currentSituation.status}
                  </span>
                </>
              ) : (
                <span>Select or create a situation...</span>
              )}
              <span className="np-chevron">▼</span>
            </button>

            {showSituationList && (
              <div className="np-situation-dropdown">
                <button
                  className="np-new-situation-btn"
                  onClick={() => {
                    setShowSituationList(false);
                    setShowNewSituationModal(true);
                  }}
                >
                  + New Situation
                </button>
                <div className="np-situation-list">
                  {situations.length === 0 ? (
                    <div className="np-empty-list">No situations yet</div>
                  ) : (
                    situations.map(sit => (
                      <div
                        key={sit.id}
                        className={`np-situation-item ${currentSituation?.id === sit.id ? 'active' : ''}`}
                        onClick={() => {
                          selectSituation(sit);
                          setShowSituationList(false);
                        }}
                      >
                        <span className="np-sit-name">{sit.name}</span>
                        <span className={`np-sit-badge np-type-${sit.situation_type}`}>
                          {sit.situation_type}
                        </span>
                        <button
                          className="np-sit-delete"
                          onClick={(e) => handleDeleteSituation(sit.id, e)}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="np-header-right">
          {/* Lens Toggle */}
          <div className="np-lens-toggle">
            <button
              className={`np-lens-btn ${lens === 'mine' ? 'active' : ''}`}
              onClick={() => setLens('mine')}
              title="Focus on your perspective"
            >
              Me
            </button>
            <button
              className={`np-lens-btn ${lens === 'balanced' ? 'active' : ''}`}
              onClick={() => setLens('balanced')}
              title="Balanced view"
            >
              Both
            </button>
            <button
              className={`np-lens-btn ${lens === 'theirs' ? 'active' : ''}`}
              onClick={() => setLens('theirs')}
              title="Focus on their perspective"
            >
              Them
            </button>
          </div>

          <button
            className={`np-guidance-toggle ${showGuidance ? 'active' : ''}`}
            onClick={() => setShowGuidance(!showGuidance)}
            title="Toggle guidance panel"
          >
            ?
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="np-main">
        {/* Left: View Navigation */}
        <nav className="np-view-nav">
          {NP_VIEWS.map(view => (
            <button
              key={view.id}
              className={`np-view-btn ${activeView === view.id ? 'active' : ''}`}
              onClick={() => setActiveView(view.id)}
              title={view.description}
            >
              <span className="np-view-icon">{view.icon}</span>
              <span className="np-view-label">{view.label}</span>
            </button>
          ))}
        </nav>

        {/* Center: Main Canvas */}
        <main className="np-canvas">
          {loading && <div className="np-loading">Loading...</div>}
          {error && <div className="np-error">{error}</div>}

          {!currentSituation ? (
            <div className="np-no-situation">
              <h2>Welcome to N&P Studio</h2>
              <p>Prepare for negotiations, craft persuasive arguments, and reflect on conversations.</p>
              <button
                className="np-start-btn"
                onClick={() => setShowNewSituationModal(true)}
              >
                Start a New Situation
              </button>
            </div>
          ) : (
            <>
              {/* Workflow indicator */}
              {currentWorkflow && (
                <div className="np-workflow-bar">
                  <span className="np-workflow-name">{currentWorkflow.name}</span>
                  <div className="np-workflow-steps">
                    {currentWorkflow.steps.map((step, idx) => (
                      <span
                        key={idx}
                        className={`np-workflow-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'done' : ''}`}
                      >
                        {idx + 1}. {step.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {renderViewContent()}
            </>
          )}
        </main>

        {/* Right: Guidance Panel */}
        {showGuidance && currentSituation && (
          <aside className="np-guidance">
            <GuidancePanel
              activeView={activeView}
              prompts={activePrompts}
              stats={stats}
            />
          </aside>
        )}
      </div>

      {/* Stats Footer */}
      {currentSituation && stats && (
        <footer className="np-footer">
          <div className="np-stats">
            <span className="np-stat">
              <strong>{stats.totalElements}</strong> elements
            </span>
            <span className="np-stat np-stat-mine">
              <strong>{stats.myElements}</strong> mine
            </span>
            <span className="np-stat np-stat-theirs">
              <strong>{stats.theirElements}</strong> theirs
            </span>
            <span className="np-stat np-stat-shared">
              <strong>{stats.sharedElements}</strong> shared
            </span>
            <span className="np-stat-divider">|</span>
            <span className="np-stat np-stat-known">
              <strong>{stats.knownConfidence}</strong> known
            </span>
            <span className="np-stat np-stat-assumption">
              <strong>{stats.assumptionConfidence}</strong> assumed
            </span>
            <span className="np-stat np-stat-guess">
              <strong>{stats.guessConfidence}</strong> guessed
            </span>
          </div>
        </footer>
      )}

      {/* New Situation Modal */}
      {showNewSituationModal && (
        <div className="np-modal-overlay" onClick={() => setShowNewSituationModal(false)}>
          <div className="np-modal" onClick={e => e.stopPropagation()}>
            <h2>New Situation</h2>
            <p>What situation are you preparing for?</p>
            <input
              type="text"
              className="np-modal-input"
              placeholder="e.g., Salary negotiation with manager"
              value={newSituationName}
              onChange={e => setNewSituationName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateSituation()}
              autoFocus
            />
            <div className="np-modal-actions">
              <button
                className="np-modal-cancel"
                onClick={() => setShowNewSituationModal(false)}
              >
                Cancel
              </button>
              <button
                className="np-modal-confirm"
                onClick={handleCreateSituation}
                disabled={!newSituationName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
