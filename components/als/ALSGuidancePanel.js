// components/als/ALSGuidancePanel.js - Guidance and tips panel
import { useState, useEffect } from 'react';
import { useALS } from './ALSContext';
import { ALS_LEARNING_MODES } from '../../lib/als-types';
import { ALS_PRE_SESSION_PROMPTS, ALS_LEARNING_TIPS, getLearningTip } from '../../lib/als-guidance';

export default function ALSGuidancePanel() {
  const {
    activeSituation,
    activeSession,
    guidanceSuggestions,
    shownTips,
    markTipShown,
    setSelectedMode,
    getModeConfig
  } = useALS();

  const [currentTip, setCurrentTip] = useState(null);

  // Get a random tip on mount
  useEffect(() => {
    const tip = getLearningTip(shownTips);
    setCurrentTip(tip);
  }, []);

  const handleNextTip = () => {
    if (currentTip) {
      markTipShown(currentTip.id);
    }
    const tip = getLearningTip([...shownTips, currentTip?.id]);
    setCurrentTip(tip);
  };

  if (!activeSituation) {
    return (
      <div className="als-guidance-panel">
        <div className="als-guidance-header">
          <h3>Guidance</h3>
        </div>
        <div className="als-guidance-empty">
          <p>Select a learning situation to see personalized guidance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="als-guidance-panel">
      <div className="als-guidance-header">
        <h3>Guidance</h3>
      </div>

      {/* Pre-session prompts when no active session */}
      {!activeSession && (
        <div className="als-guidance-section">
          <h4>Before you start...</h4>
          <div className="als-prompt-list">
            {ALS_PRE_SESSION_PROMPTS.map(prompt => (
              <div key={prompt.id} className="als-prompt-item">
                <span className="als-prompt-question">{prompt.question}</span>
                <span className="als-prompt-detail">{prompt.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pattern-based suggestions */}
      {guidanceSuggestions.length > 0 && (
        <div className="als-guidance-section">
          <h4>Suggestions</h4>
          <div className="als-suggestion-list">
            {guidanceSuggestions.map(sug => (
              <div key={sug.id} className="als-suggestion-item">
                <span className="als-suggestion-message">{sug.message}</span>
                <span className="als-suggestion-detail">{sug.suggestion}</span>
                {sug.suggestedMode && (
                  <button
                    className="als-btn-small"
                    onClick={() => setSelectedMode(sug.suggestedMode)}
                  >
                    Try {ALS_LEARNING_MODES[sug.suggestedMode]?.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning tip */}
      {currentTip && (
        <div className="als-guidance-section als-tip-section">
          <div className="als-tip-header">
            <h4>💡 Learning Tip</h4>
            <button className="als-tip-next" onClick={handleNextTip}>
              Next →
            </button>
          </div>
          <div className="als-tip-card">
            <span className="als-tip-title">{currentTip.title}</span>
            <p className="als-tip-content">{currentTip.content}</p>
          </div>
        </div>
      )}

      {/* Mode-specific prompts when session is active */}
      {activeSession && (
        <div className="als-guidance-section">
          <h4>During your session...</h4>
          <div className="als-mode-guidance">
            {(() => {
              const modeConfig = getModeConfig(activeSession.learningMode);
              if (!modeConfig) return null;
              return (
                <>
                  <div className="als-mode-guidance-header" style={{ color: modeConfig.color }}>
                    {modeConfig.icon} {modeConfig.name}
                  </div>
                  <ul className="als-mode-prompts">
                    {modeConfig.prompts.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
