// components/als/ALSSessionPanel.js - Active session panel with timer
import { useState } from 'react';
import { useALS } from './ALSContext';
import { ALS_UNDERSTANDING_SIGNALS, formatDuration } from '../../lib/als-types';

export default function ALSSessionPanel() {
  const {
    activeSession,
    sessionElapsed,
    isTimerRunning,
    pauseTimer,
    resumeTimer,
    endSession,
    getModeConfig
  } = useALS();

  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [frictionNotes, setFrictionNotes] = useState('');

  if (!activeSession) return null;

  const modeConfig = getModeConfig(activeSession.learningMode);

  const handleEndSession = async () => {
    await endSession(selectedSignal, frictionNotes);
    setShowEndModal(false);
    setSelectedSignal(null);
    setFrictionNotes('');
  };

  return (
    <>
      <div className="als-session-panel" style={{ borderColor: modeConfig?.color || '#6366f1' }}>
        <div className="als-session-header">
          <div className="als-session-mode">
            <span className="als-session-mode-icon" style={{ color: modeConfig?.color }}>
              {modeConfig?.icon}
            </span>
            <span className="als-session-mode-name">{modeConfig?.name} Session</span>
          </div>
          <div className="als-session-timer">
            <span className="als-timer-value">{formatDuration(sessionElapsed)}</span>
            <button
              className="als-timer-btn"
              onClick={isTimerRunning ? pauseTimer : resumeTimer}
              title={isTimerRunning ? 'Pause' : 'Resume'}
            >
              {isTimerRunning ? '⏸️' : '▶️'}
            </button>
          </div>
        </div>

        {activeSession.focusQuestion && (
          <div className="als-session-focus">
            <span className="als-session-focus-label">Focus:</span>
            <span className="als-session-focus-text">{activeSession.focusQuestion}</span>
          </div>
        )}

        {activeSession.materialUsed && (
          <div className="als-session-material">
            <span className="als-session-material-label">Material:</span>
            <span className="als-session-material-text">{activeSession.materialUsed}</span>
          </div>
        )}

        <div className="als-session-actions">
          <button
            className="als-btn als-btn--secondary"
            onClick={() => setShowEndModal(true)}
          >
            End Session
          </button>
        </div>
      </div>

      {/* End Session Modal */}
      {showEndModal && (
        <div className="als-modal-backdrop" onClick={() => setShowEndModal(false)}>
          <div className="als-modal" onClick={e => e.stopPropagation()}>
            <div className="als-modal-header">
              <h3>End Learning Session</h3>
              <button className="als-modal-close" onClick={() => setShowEndModal(false)}>×</button>
            </div>

            <div className="als-modal-body">
              <div className="als-form-group">
                <label>How did it go?</label>
                <div className="als-signal-grid">
                  {Object.entries(ALS_UNDERSTANDING_SIGNALS).map(([id, signal]) => (
                    <button
                      key={id}
                      className={`als-signal-btn ${selectedSignal === id ? 'selected' : ''}`}
                      onClick={() => setSelectedSignal(id)}
                    >
                      <span className="als-signal-icon">{signal.icon}</span>
                      <span className="als-signal-label">{signal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="als-form-group">
                <label>Any friction or notes?</label>
                <textarea
                  className="als-textarea"
                  value={frictionNotes}
                  onChange={e => setFrictionNotes(e.target.value)}
                  placeholder="What got in the way? What would help next time?"
                  rows={3}
                />
              </div>

              <div className="als-session-summary">
                <span>Session duration: <strong>{formatDuration(sessionElapsed)}</strong></span>
              </div>
            </div>

            <div className="als-modal-footer">
              <button className="als-btn" onClick={() => setShowEndModal(false)}>
                Continue Learning
              </button>
              <button
                className="als-btn als-btn--primary"
                onClick={handleEndSession}
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
