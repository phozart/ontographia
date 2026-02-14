// components/mms/MMSGuidancePanel.js - Right panel with contextual guidance and suggestions
import { useState } from 'react';
import { useMMS } from './MMSContext';
import { MMS_LENSES, MMS_VIEWS, MMS_INSIGHT_TYPES } from '../../../lib/mms-types';
import { getThinkingQuality, suggestNextActions, getLearningTip } from '../../../lib/mms-guidance';

export default function MMSGuidancePanel({ onClose }) {
  const {
    elements,
    relationships,
    reflections,
    activeLens,
    setActiveLens,
    activeView,
    setActiveView,
    activeSituation,
    guidanceSuggestions,
    openAddModal,
    createReflection,
    shownTips,
    markTipShown
  } = useMMS();

  const [activeTab, setActiveTab] = useState('guidance'); // guidance, quality, reflect
  const [newReflection, setNewReflection] = useState('');
  const [reflectionType, setReflectionType] = useState('realization');
  const [showTip, setShowTip] = useState(true);

  const quality = getThinkingQuality(elements, relationships);
  const nextActions = suggestNextActions(elements, activeLens, activeSituation);
  const currentTip = showTip ? getLearningTip(null, shownTips) : null;

  const handleAddReflection = async () => {
    if (!newReflection.trim()) return;
    await createReflection({
      content: newReflection.trim(),
      insightType: reflectionType
    });
    setNewReflection('');
  };

  const handleDismissTip = () => {
    if (currentTip) {
      markTipShown(currentTip.id);
    }
    setShowTip(false);
  };

  return (
    <div className="mms-guidance-panel">
      <div className="mms-guidance-header">
        <div className="mms-guidance-tabs">
          <button
            className={`mms-guidance-tab ${activeTab === 'guidance' ? 'active' : ''}`}
            onClick={() => setActiveTab('guidance')}
          >
            Guidance
          </button>
          <button
            className={`mms-guidance-tab ${activeTab === 'quality' ? 'active' : ''}`}
            onClick={() => setActiveTab('quality')}
          >
            Quality
          </button>
          <button
            className={`mms-guidance-tab ${activeTab === 'reflect' ? 'active' : ''}`}
            onClick={() => setActiveTab('reflect')}
          >
            Reflect
          </button>
        </div>
        <button className="mms-guidance-close" onClick={onClose} title="Hide panel">
          ✕
        </button>
      </div>

      <div className="mms-guidance-content">
        {/* Guidance Tab */}
        {activeTab === 'guidance' && (
          <>
            {/* Learning tip */}
            {currentTip && (
              <div className="mms-learning-tip">
                <div className="mms-tip-header">
                  <span className="mms-tip-icon">💡</span>
                  <span className="mms-tip-title">{currentTip.title}</span>
                  <button className="mms-tip-dismiss" onClick={handleDismissTip}>✕</button>
                </div>
                <p className="mms-tip-content">{currentTip.content}</p>
              </div>
            )}

            {/* Pattern-based suggestions */}
            {guidanceSuggestions.length > 0 && (
              <div className="mms-suggestions-section">
                <div className="mms-section-title">Suggestions</div>
                {guidanceSuggestions.slice(0, 3).map(suggestion => (
                  <div key={suggestion.id} className="mms-suggestion">
                    <p className="mms-suggestion-message">{suggestion.message}</p>
                    {suggestion.detail && (
                      <p className="mms-suggestion-detail">{suggestion.detail}</p>
                    )}
                    {suggestion.action && (
                      <button
                        className="mms-suggestion-action"
                        onClick={() => {
                          if (suggestion.action.lens) {
                            setActiveLens(suggestion.action.lens);
                          } else if (suggestion.action.type) {
                            openAddModal(suggestion.action.type);
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

            {/* Next actions */}
            {nextActions.length > 0 && (
              <div className="mms-actions-section">
                <div className="mms-section-title">Try Next</div>
                <div className="mms-actions-list">
                  {nextActions.map((action, i) => (
                    <button
                      key={i}
                      className="mms-action-btn"
                      onClick={() => {
                        if (action.type === 'switch-lens') {
                          setActiveLens(action.lens);
                        } else if (action.type === 'add') {
                          openAddModal(action.elementType);
                        }
                      }}
                    >
                      <span className="mms-action-label">{action.label}</span>
                      <span className="mms-action-desc">{action.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View selector */}
            <div className="mms-views-section">
              <div className="mms-section-title">View</div>
              <div className="mms-view-buttons">
                {Object.values(MMS_VIEWS).map(view => (
                  <button
                    key={view.id}
                    className={`mms-view-btn ${activeView === view.id ? 'active' : ''}`}
                    onClick={() => setActiveView(view.id)}
                    title={view.description}
                  >
                    <span className="mms-view-icon">{view.icon}</span>
                    <span className="mms-view-name">{view.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Quality Tab */}
        {activeTab === 'quality' && (
          <div className="mms-quality-section">
            <div className="mms-quality-score">
              <div className="mms-quality-circle" style={{ '--score': quality.overall }}>
                <span className="mms-quality-number">{quality.overall}</span>
                <span className="mms-quality-label">Overall</span>
              </div>
            </div>

            <div className="mms-quality-metrics">
              <div className="mms-metric">
                <div className="mms-metric-header">
                  <span className="mms-metric-name">Diversity</span>
                  <span className="mms-metric-value">{quality.diversity}%</span>
                </div>
                <div className="mms-metric-bar">
                  <div className="mms-metric-fill" style={{ width: `${quality.diversity}%` }} />
                </div>
                <p className="mms-metric-hint">Variety of element types used</p>
              </div>

              <div className="mms-metric">
                <div className="mms-metric-header">
                  <span className="mms-metric-name">Depth</span>
                  <span className="mms-metric-value">{quality.depth}%</span>
                </div>
                <div className="mms-metric-bar">
                  <div className="mms-metric-fill" style={{ width: `${quality.depth}%` }} />
                </div>
                <p className="mms-metric-hint">Connections and implications explored</p>
              </div>

              <div className="mms-metric">
                <div className="mms-metric-header">
                  <span className="mms-metric-name">Grounding</span>
                  <span className="mms-metric-value">{quality.grounding}%</span>
                </div>
                <div className="mms-metric-bar">
                  <div className="mms-metric-fill" style={{ width: `${quality.grounding}%` }} />
                </div>
                <p className="mms-metric-hint">Evidence and verified facts</p>
              </div>

              <div className="mms-metric">
                <div className="mms-metric-header">
                  <span className="mms-metric-name">Challenge</span>
                  <span className="mms-metric-value">{quality.challenge}%</span>
                </div>
                <div className="mms-metric-bar">
                  <div className="mms-metric-fill" style={{ width: `${quality.challenge}%` }} />
                </div>
                <p className="mms-metric-hint">Alternatives and boundaries explored</p>
              </div>
            </div>

            <div className="mms-quality-summary">
              <div className="mms-summary-item">
                <span className="mms-summary-count">{elements.length}</span>
                <span className="mms-summary-label">Elements</span>
              </div>
              <div className="mms-summary-item">
                <span className="mms-summary-count">{relationships.length}</span>
                <span className="mms-summary-label">Connections</span>
              </div>
              <div className="mms-summary-item">
                <span className="mms-summary-count">{reflections.length}</span>
                <span className="mms-summary-label">Reflections</span>
              </div>
            </div>
          </div>
        )}

        {/* Reflect Tab */}
        {activeTab === 'reflect' && (
          <div className="mms-reflect-section">
            <div className="mms-reflect-form">
              <div className="mms-section-title">Capture an Insight</div>
              <div className="mms-reflect-type-select">
                {Object.values(MMS_INSIGHT_TYPES).map(type => (
                  <button
                    key={type.id}
                    className={`mms-reflect-type ${reflectionType === type.id ? 'active' : ''}`}
                    onClick={() => setReflectionType(type.id)}
                    title={type.description}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
              <textarea
                className="mms-reflect-input"
                placeholder="What insight have you gained?"
                value={newReflection}
                onChange={(e) => setNewReflection(e.target.value)}
                rows={3}
              />
              <button
                className="mms-reflect-save"
                onClick={handleAddReflection}
                disabled={!newReflection.trim()}
              >
                Save Reflection
              </button>
            </div>

            {/* Previous reflections */}
            {reflections.length > 0 && (
              <div className="mms-reflections-list">
                <div className="mms-section-title">Previous Reflections</div>
                {reflections.map(ref => {
                  const typeConfig = MMS_INSIGHT_TYPES[ref.insightType];
                  return (
                    <div key={ref.id} className="mms-reflection-item">
                      <div className="mms-reflection-header">
                        <span className="mms-reflection-type">
                          {typeConfig?.icon} {typeConfig?.label}
                        </span>
                        <span className="mms-reflection-time">
                          {new Date(ref.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mms-reflection-content">{ref.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
