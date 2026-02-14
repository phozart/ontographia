// components/als/ALSSessionModal.js - Start session modal
import { useState } from 'react';
import { useALS } from './ALSContext';
import { ALS_LEARNING_MODES, ALS_SESSION_DURATIONS } from '../../../lib/als-types';

export default function ALSSessionModal({ onClose }) {
  const { selectedMode, setSelectedMode, startSession, getModeConfig } = useALS();

  const [focusQuestion, setFocusQuestion] = useState('');
  const [materialUsed, setMaterialUsed] = useState('');
  const [plannedDuration, setPlannedDuration] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modeConfig = getModeConfig(selectedMode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMode) return;

    setIsSubmitting(true);
    const session = await startSession({
      learningMode: selectedMode,
      focusQuestion: focusQuestion.trim() || null,
      materialUsed: materialUsed.trim() || null,
      properties: plannedDuration ? { plannedDuration } : {}
    });
    setIsSubmitting(false);

    if (session) {
      onClose();
    }
  };

  return (
    <div className="als-modal-backdrop" onClick={onClose}>
      <div className="als-modal als-modal--medium" onClick={e => e.stopPropagation()}>
        <div className="als-modal-header">
          <h3>Start Learning Session</h3>
          <button className="als-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="als-modal-body">
            {/* Learning mode selection */}
            <div className="als-form-group">
              <label>Learning Mode</label>
              <div className="als-mode-select">
                {Object.entries(ALS_LEARNING_MODES).map(([id, mode]) => (
                  <button
                    key={id}
                    type="button"
                    className={`als-mode-option ${selectedMode === id ? 'selected' : ''}`}
                    onClick={() => setSelectedMode(id)}
                  >
                    <span className="als-mode-option-icon" style={{ color: mode.color }}>
                      {mode.icon}
                    </span>
                    <span className="als-mode-option-name">{mode.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected mode description */}
            {modeConfig && (
              <div className="als-mode-description" style={{ borderColor: modeConfig.color }}>
                <p>{modeConfig.description}</p>
              </div>
            )}

            {/* Focus question */}
            <div className="als-form-group">
              <label>Focus Question (optional)</label>
              <input
                type="text"
                className="als-input"
                value={focusQuestion}
                onChange={e => setFocusQuestion(e.target.value)}
                placeholder="What specific question do you want to answer?"
              />
              <span className="als-form-hint">Having a clear focus improves learning outcomes</span>
            </div>

            {/* Material used */}
            <div className="als-form-group">
              <label>Material / Source (optional)</label>
              <input
                type="text"
                className="als-input"
                value={materialUsed}
                onChange={e => setMaterialUsed(e.target.value)}
                placeholder="Book, article, video, etc."
              />
            </div>

            {/* Planned duration */}
            <div className="als-form-group">
              <label>Planned Duration (optional)</label>
              <div className="als-duration-options">
                {ALS_SESSION_DURATIONS.map(dur => (
                  <button
                    key={dur.value}
                    type="button"
                    className={`als-duration-btn ${plannedDuration === dur.value ? 'selected' : ''}`}
                    onClick={() => setPlannedDuration(plannedDuration === dur.value ? null : dur.value)}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="als-modal-footer">
            <button type="button" className="als-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="als-btn als-btn--primary"
              disabled={!selectedMode || isSubmitting}
            >
              {isSubmitting ? 'Starting...' : 'Start Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
