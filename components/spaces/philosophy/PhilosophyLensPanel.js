// components/philosophy/PhilosophyLensPanel.js
// Left panel with philosophical lenses

import { usePhilosophy } from './PhilosophyContext';
import { PHIL_LENSES, PHIL_ELEMENT_TYPES, getLensesArray } from '../../../lib/philosophy-types';

export default function PhilosophyLensPanel() {
  const {
    activeLens,
    setActiveLens,
    activeInquiry,
    elements,
    openAddModal
  } = usePhilosophy();

  const lenses = getLensesArray();
  const currentLens = PHIL_LENSES[activeLens];

  // Count elements by type
  const elementCounts = {};
  for (const el of elements) {
    elementCounts[el.elementType] = (elementCounts[el.elementType] || 0) + 1;
  }

  return (
    <div className="phil-lens-panel">
      {/* Lenses */}
      <div className="phil-lens-section">
        <div className="phil-lens-section-header">Thinking Lenses</div>
        <div className="phil-lens-list">
          {lenses.map(lens => (
            <button
              key={lens.id}
              className={`phil-lens-btn ${activeLens === lens.id ? 'active' : ''}`}
              onClick={() => setActiveLens(lens.id)}
              disabled={!activeInquiry}
              title={lens.description}
              style={{
                '--lens-color': lens.color
              }}
            >
              <span className="phil-lens-icon">{lens.icon}</span>
              <span className="phil-lens-name">{lens.shortName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current lens info */}
      {activeInquiry && currentLens && (
        <div className="phil-current-lens">
          <div className="phil-current-lens-header">
            <span className="phil-current-lens-icon" style={{ color: currentLens.color }}>
              {currentLens.icon}
            </span>
            <span>{currentLens.name}</span>
          </div>
          <p className="phil-current-lens-desc">{currentLens.description}</p>
        </div>
      )}

      {/* Element types */}
      {activeInquiry && (
        <div className="phil-elements-section">
          <div className="phil-lens-section-header">Add Elements</div>
          <div className="phil-element-types">
            {Object.values(PHIL_ELEMENT_TYPES).map(type => {
              const isFocus = currentLens?.focusElements?.includes(type.id);
              const count = elementCounts[type.id] || 0;
              return (
                <button
                  key={type.id}
                  className={`phil-element-type-btn ${isFocus ? 'focus' : ''}`}
                  onClick={() => openAddModal(type.id)}
                  title={type.description}
                  style={{
                    '--type-color': type.color
                  }}
                >
                  <span className="phil-element-type-icon">{type.icon}</span>
                  <span className="phil-element-type-name">{type.name}</span>
                  {count > 0 && (
                    <span className="phil-element-type-count">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick prompts from current lens */}
      {activeInquiry && currentLens?.prompts?.length > 0 && (
        <div className="phil-prompts-section">
          <div className="phil-lens-section-header">Prompts</div>
          <div className="phil-prompts-list">
            {currentLens.prompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                className="phil-prompt-btn"
                onClick={() => openAddModal(prompt.type)}
                title={`Add ${prompt.type}`}
              >
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
