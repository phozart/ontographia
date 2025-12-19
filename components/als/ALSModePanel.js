// components/als/ALSModePanel.js - Learning mode selection panel
import { useALS } from './ALSContext';
import { ALS_LEARNING_MODES } from '../../lib/als-types';

export default function ALSModePanel() {
  const {
    activeSituation,
    activeSession,
    selectedMode,
    setSelectedMode,
    setShowSessionModal,
    getModeConfig
  } = useALS();

  const currentModeConfig = getModeConfig(selectedMode);

  if (!activeSituation) {
    return (
      <div className="als-mode-panel">
        <div className="als-mode-panel-header">
          <h3>Learning Modes</h3>
        </div>
        <div className="als-mode-empty">
          <p>Select a learning situation to see available modes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="als-mode-panel">
      <div className="als-mode-panel-header">
        <h3>Learning Modes</h3>
      </div>

      <div className="als-mode-list">
        {Object.entries(ALS_LEARNING_MODES).map(([id, mode]) => (
          <button
            key={id}
            className={`als-mode-item ${selectedMode === id ? 'selected' : ''} ${activeSession?.learningMode === id ? 'active-session' : ''}`}
            onClick={() => setSelectedMode(id)}
            disabled={activeSession && activeSession.learningMode !== id}
          >
            <span className="als-mode-icon" style={{ color: mode.color }}>{mode.icon}</span>
            <div className="als-mode-info">
              <span className="als-mode-name">{mode.name}</span>
              <span className="als-mode-desc">{mode.description}</span>
            </div>
            {activeSession?.learningMode === id && (
              <span className="als-mode-active-badge">Active</span>
            )}
          </button>
        ))}
      </div>

      {/* Mode details when selected */}
      {selectedMode && currentModeConfig && !activeSession && (
        <div className="als-mode-details">
          <div className="als-mode-details-header">
            <span className="als-mode-icon-large" style={{ color: currentModeConfig.color }}>
              {currentModeConfig.icon}
            </span>
            <span className="als-mode-title">{currentModeConfig.name}</span>
          </div>

          <div className="als-mode-prompts">
            <div className="als-mode-prompts-label">Focus prompts:</div>
            <ul>
              {currentModeConfig.prompts.map((prompt, i) => (
                <li key={i}>{prompt}</li>
              ))}
            </ul>
          </div>

          <button
            className="als-btn als-btn--primary als-btn--full"
            onClick={() => setShowSessionModal(true)}
          >
            Start {currentModeConfig.name} Session
          </button>
        </div>
      )}
    </div>
  );
}
