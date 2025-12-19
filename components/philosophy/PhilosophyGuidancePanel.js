// components/philosophy/PhilosophyGuidancePanel.js
// Right panel with philosophical guidance and reflections

import { useState } from 'react';
import { usePhilosophy } from './PhilosophyContext';
import { PHIL_LENSES, PHIL_ELEMENT_TYPES, PHIL_REFLECTION_TYPES } from '../../lib/philosophy-types';
import {
  getEmptyStateGuidance,
  getContextualPrompts,
  suggestNextActions,
  getLearningTip
} from '../../lib/philosophy-guidance';

export default function PhilosophyGuidancePanel({ onClose }) {
  const {
    elements,
    activeLens,
    activeInquiry,
    selectedElement,
    guidanceSuggestions,
    openAddModal,
    setActiveLens,
    createReflection,
    reflections,
    shownTips,
    markTipShown
  } = usePhilosophy();

  const [activeTab, setActiveTab] = useState('guidance');
  const [newReflection, setNewReflection] = useState('');
  const [reflectionType, setReflectionType] = useState('clarity');

  const emptyGuide = getEmptyStateGuidance(activeLens);
  const contextPrompts = getContextualPrompts(activeLens, selectedElement, elements);
  const nextActions = suggestNextActions(elements, activeLens, activeInquiry);
  const tip = getLearningTip(selectedElement?.elementType, shownTips);

  const handleAddReflection = async () => {
    if (!newReflection.trim()) return;
    await createReflection({
      reflectionType,
      content: newReflection.trim(),
      relatedElementIds: selectedElement ? [selectedElement.id] : []
    });
    setNewReflection('');
  };

  return (
    <div className="phil-guidance-panel">
      <div className="phil-guidance-header">
        <div className="phil-guidance-tabs">
          <button
            className={`phil-guidance-tab ${activeTab === 'guidance' ? 'active' : ''}`}
            onClick={() => setActiveTab('guidance')}
          >
            Guidance
          </button>
          <button
            className={`phil-guidance-tab ${activeTab === 'reflections' ? 'active' : ''}`}
            onClick={() => setActiveTab('reflections')}
          >
            Reflections
          </button>
        </div>
        <button className="phil-guidance-close" onClick={onClose}>x</button>
      </div>

      {activeTab === 'guidance' && (
        <div className="phil-guidance-content">
          {/* Empty state guide */}
          {elements.length === 0 && emptyGuide && (
            <div className="phil-empty-guide">
              <div className="phil-empty-guide-header">
                <span className="phil-empty-guide-icon">{emptyGuide.icon}</span>
                <h4>{emptyGuide.title}</h4>
              </div>
              <p>{emptyGuide.description}</p>
              <div className="phil-empty-guide-steps">
                {emptyGuide.steps.map((step, idx) => (
                  <div key={idx} className="phil-guide-step">
                    <span className="phil-guide-step-num">{idx + 1}</span>
                    <div>
                      <strong>{step.action}</strong>
                      <p>{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              {emptyGuide.quickStart && (
                <div className="phil-quick-start">
                  <h5>Quick Start</h5>
                  {emptyGuide.quickStart.map((qs, idx) => (
                    <button
                      key={idx}
                      className="phil-quick-start-btn"
                      onClick={() => openAddModal(qs.type)}
                    >
                      {qs.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pattern-based suggestions */}
          {elements.length > 0 && guidanceSuggestions.length > 0 && (
            <div className="phil-suggestions">
              <h4>Suggestions</h4>
              {guidanceSuggestions.slice(0, 3).map(suggestion => (
                <div key={suggestion.id} className="phil-suggestion">
                  <p className="phil-suggestion-message">{suggestion.message}</p>
                  <p className="phil-suggestion-detail">{suggestion.detail}</p>
                  {suggestion.action && (
                    <button
                      className="phil-suggestion-action"
                      onClick={() => {
                        if (suggestion.action.type) {
                          openAddModal(suggestion.action.type);
                        } else if (suggestion.action.lens) {
                          setActiveLens(suggestion.action.lens);
                        }
                      }}
                    >
                      {suggestion.action.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Contextual prompts */}
          {contextPrompts.length > 0 && (
            <div className="phil-prompts">
              <h4>Questions to Consider</h4>
              {contextPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className="phil-prompt-item"
                  onClick={() => openAddModal(prompt.type)}
                >
                  {prompt.text}
                </button>
              ))}
            </div>
          )}

          {/* Next actions */}
          {nextActions.length > 0 && (
            <div className="phil-next-actions">
              <h4>Next Steps</h4>
              {nextActions.map((action, idx) => (
                <button
                  key={idx}
                  className="phil-action-btn"
                  onClick={() => {
                    if (action.type === 'add') {
                      openAddModal(action.elementType);
                    } else if (action.type === 'switch-lens') {
                      setActiveLens(action.lens);
                    }
                  }}
                >
                  <span className="phil-action-label">{action.label}</span>
                  <span className="phil-action-desc">{action.description}</span>
                </button>
              ))}
            </div>
          )}

          {/* Learning tip */}
          {tip && (
            <div className="phil-learning-tip">
              <div className="phil-tip-header">
                <span>Tip: {tip.title}</span>
                <button onClick={() => markTipShown(tip.id)}>x</button>
              </div>
              <p>{tip.content}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reflections' && (
        <div className="phil-reflections-content">
          {/* Add reflection */}
          <div className="phil-add-reflection">
            <h4>Capture a Reflection</h4>
            <select
              value={reflectionType}
              onChange={(e) => setReflectionType(e.target.value)}
              className="phil-reflection-type-select"
            >
              {Object.values(PHIL_REFLECTION_TYPES).map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <textarea
              value={newReflection}
              onChange={(e) => setNewReflection(e.target.value)}
              placeholder="What insight, shift, or question emerged?"
              rows={3}
            />
            <button
              onClick={handleAddReflection}
              disabled={!newReflection.trim()}
              className="phil-add-reflection-btn"
            >
              Save Reflection
            </button>
          </div>

          {/* Reflection list */}
          <div className="phil-reflections-list">
            <h4>Past Reflections</h4>
            {reflections.length === 0 ? (
              <p className="phil-no-reflections">No reflections yet.</p>
            ) : (
              reflections.map(ref => {
                const type = PHIL_REFLECTION_TYPES[ref.reflectionType];
                return (
                  <div key={ref.id} className="phil-reflection-item">
                    <div className="phil-reflection-header">
                      <span className="phil-reflection-type">
                        {type?.icon} {type?.label}
                      </span>
                      <span className="phil-reflection-date">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p>{ref.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
