// components/mms/MMSLensPanel.js - Left panel with lens selection and prompts
import { useMMS } from './MMSContext';
import { MMS_LENSES, MMS_ELEMENT_TYPES, getLensesArray } from '../../lib/mms-types';
import { getContextualPrompts } from '../../lib/mms-guidance';

export default function MMSLensPanel() {
  const {
    activeSituation,
    activeLens,
    setActiveLens,
    elements,
    selectedElement,
    openAddModal
  } = useMMS();

  const lenses = getLensesArray();
  const currentLens = MMS_LENSES[activeLens];
  const prompts = activeSituation
    ? getContextualPrompts(activeLens, selectedElement, elements)
    : [];

  // Get element counts by type
  const elementCounts = elements.reduce((acc, el) => {
    acc[el.elementType] = (acc[el.elementType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mms-lens-panel">
      {/* Lens selector */}
      <div className="mms-lens-section">
        <div className="mms-section-title">Thinking Lenses</div>
        <div className="mms-lens-list">
          {lenses.map(lens => (
            <button
              key={lens.id}
              className={`mms-lens-item ${activeLens === lens.id ? 'active' : ''}`}
              onClick={() => setActiveLens(lens.id)}
              style={{
                '--lens-color': lens.color
              }}
            >
              <span className="mms-lens-icon">{lens.icon}</span>
              <span className="mms-lens-name">{lens.shortName || lens.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current lens description */}
      {currentLens && (
        <div className="mms-lens-description">
          <div className="mms-lens-desc-header">
            <span className="mms-lens-desc-icon">{currentLens.icon}</span>
            <span className="mms-lens-desc-name">{currentLens.name}</span>
          </div>
          <p className="mms-lens-desc-text">{currentLens.description}</p>
        </div>
      )}

      {/* Quick add buttons */}
      {activeSituation && (
        <div className="mms-quick-add">
          <div className="mms-section-title">Quick Add</div>
          <div className="mms-quick-add-grid">
            {(currentLens?.focusElements || ['thought', 'frame']).map(typeId => {
              const type = MMS_ELEMENT_TYPES[typeId];
              if (!type) return null;
              return (
                <button
                  key={typeId}
                  className="mms-quick-add-btn"
                  onClick={() => openAddModal(typeId)}
                  style={{ '--type-color': type.color }}
                >
                  <span className="mms-type-icon">{type.icon}</span>
                  <span className="mms-type-name">{type.name}</span>
                  {elementCounts[typeId] > 0 && (
                    <span className="mms-type-count">{elementCounts[typeId]}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Show other types */}
          <details className="mms-more-types">
            <summary>More element types</summary>
            <div className="mms-quick-add-grid">
              {Object.values(MMS_ELEMENT_TYPES)
                .filter(type => !(currentLens?.focusElements || []).includes(type.id))
                .map(type => (
                  <button
                    key={type.id}
                    className="mms-quick-add-btn mms-quick-add-btn--secondary"
                    onClick={() => openAddModal(type.id)}
                    style={{ '--type-color': type.color }}
                  >
                    <span className="mms-type-icon">{type.icon}</span>
                    <span className="mms-type-name">{type.name}</span>
                    {elementCounts[type.id] > 0 && (
                      <span className="mms-type-count">{elementCounts[type.id]}</span>
                    )}
                  </button>
                ))}
            </div>
          </details>
        </div>
      )}

      {/* Thinking prompts */}
      {prompts.length > 0 && (
        <div className="mms-prompts-section">
          <div className="mms-section-title">Thinking Prompts</div>
          <div className="mms-prompts-list">
            {prompts.slice(0, 4).map((prompt, i) => (
              <button
                key={i}
                className="mms-prompt-btn"
                onClick={() => openAddModal(prompt.type)}
              >
                <span className="mms-prompt-icon">💡</span>
                <span className="mms-prompt-text">{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
