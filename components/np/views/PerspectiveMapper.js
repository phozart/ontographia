// components/np/views/PerspectiveMapper.js
// Map your perspective vs their perspective (known vs assumed)

import { useState, useCallback } from 'react';
import { useNP } from '../NPContext';

const PERSPECTIVE_ELEMENTS = [
  { type: 'position', label: 'Position', description: 'What you/they are asking for', icon: '🎯' },
  { type: 'interest', label: 'Interest', description: 'Why you/they want it (underlying need)', icon: '💡' },
  { type: 'constraint', label: 'Constraint', description: 'What limits flexibility', icon: '🚧' },
  { type: 'emotional_driver', label: 'Emotion', description: 'Feelings driving behavior', icon: '💭' },
  { type: 'frame', label: 'Frame', description: 'How you/they see the situation', icon: '🖼️' },
];

const CONFIDENCE_LEVELS = [
  { id: 'known', label: 'Known', color: '#22c55e', description: 'Directly told or confirmed' },
  { id: 'likely', label: 'Likely', color: '#3b82f6', description: 'High confidence inference' },
  { id: 'assumption', label: 'Assumed', color: '#f59e0b', description: 'Reasonable guess' },
  { id: 'guess', label: 'Guess', color: '#ef4444', description: 'Speculation' },
];

export default function PerspectiveMapper() {
  const {
    currentSituation,
    elements,
    myPerspective,
    theirPerspective,
    sharedElements,
    lens,
    createElement,
    updateElement,
    deleteElement,
    validateElement
  } = useNP();

  const [newElement, setNewElement] = useState({
    party: 'mine',
    type: 'position',
    content: '',
    confidence: 'known',
    evidence: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Filter to perspective category elements
  const getElementsForParty = (party) => {
    return elements.filter(e =>
      e.party === party &&
      e.category === 'perspective'
    );
  };

  const myElements = getElementsForParty('mine');
  const theirElements = getElementsForParty('theirs');
  const shared = elements.filter(e => e.party === 'shared' && e.category === 'perspective');

  const handleCreate = useCallback(async () => {
    if (!newElement.content.trim()) return;

    await createElement({
      element_type: newElement.type,
      category: 'perspective',
      party: newElement.party,
      content: newElement.content.trim(),
      confidence: newElement.party === 'mine' ? 'known' : newElement.confidence,
      evidence: newElement.evidence || null
    });

    setNewElement({
      party: newElement.party,
      type: 'position',
      content: '',
      confidence: newElement.party === 'mine' ? 'known' : 'assumption',
      evidence: ''
    });
    setShowAddForm(false);
  }, [createElement, newElement]);

  const handleDelete = useCallback(async (id) => {
    if (confirm('Delete this element?')) {
      await deleteElement(id);
    }
  }, [deleteElement]);

  const handleValidate = useCallback(async (elem) => {
    await validateElement(elem.id);
  }, [validateElement]);

  const renderElement = (elem) => {
    const typeInfo = PERSPECTIVE_ELEMENTS.find(p => p.type === elem.element_type);
    const confInfo = CONFIDENCE_LEVELS.find(c => c.id === elem.confidence);

    return (
      <div
        key={elem.id}
        className={`np-perspective-card np-confidence-${elem.confidence}`}
        style={{ borderLeftColor: confInfo?.color }}
      >
        <div className="np-card-header">
          <span className="np-card-type">
            {typeInfo?.icon} {typeInfo?.label}
          </span>
          <span
            className="np-card-confidence"
            style={{ backgroundColor: confInfo?.color }}
            title={confInfo?.description}
          >
            {confInfo?.label}
          </span>
        </div>
        <p className="np-card-content">{elem.content}</p>
        {elem.evidence && (
          <p className="np-card-evidence">Evidence: {elem.evidence}</p>
        )}
        <div className="np-card-actions">
          {elem.party === 'theirs' && elem.confidence !== 'known' && (
            <button
              className="np-validate-btn"
              onClick={() => handleValidate(elem)}
              title="Mark as validated/confirmed"
            >
              ✓ Confirm
            </button>
          )}
          <button
            className="np-delete-btn"
            onClick={() => handleDelete(elem.id)}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  const renderColumn = (title, party, elements, showConfidence = false) => (
    <div className={`np-perspective-column np-column-${party}`}>
      <div className="np-column-header">
        <h3>{title}</h3>
        <button
          className="np-add-btn"
          onClick={() => {
            setNewElement(prev => ({ ...prev, party, confidence: party === 'mine' ? 'known' : 'assumption' }));
            setShowAddForm(true);
          }}
        >
          +
        </button>
      </div>

      <div className="np-column-content">
        {PERSPECTIVE_ELEMENTS.map(type => {
          const typeElements = elements.filter(e => e.element_type === type.type);
          if (typeElements.length === 0) return null;

          return (
            <div key={type.type} className="np-type-group">
              <h4 className="np-type-header">
                {type.icon} {type.label}
              </h4>
              {typeElements.map(renderElement)}
            </div>
          );
        })}

        {elements.length === 0 && (
          <div className="np-empty-column">
            <p>No elements yet</p>
            <button
              onClick={() => {
                setNewElement(prev => ({ ...prev, party }));
                setShowAddForm(true);
              }}
            >
              Add first element
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (!currentSituation) return null;

  return (
    <div className="np-perspective-mapper">
      <div className="np-mapper-header">
        <h2>Perspective Mapping</h2>
        <p>
          Map what you know about each side. For "theirs", mark your confidence level.
          <span className="np-key-insight"> The gap between what you know vs assume reveals your blind spots.</span>
        </p>
      </div>

      {/* Confidence Legend */}
      <div className="np-confidence-legend">
        {CONFIDENCE_LEVELS.map(conf => (
          <span key={conf.id} className="np-legend-item">
            <span
              className="np-legend-dot"
              style={{ backgroundColor: conf.color }}
            />
            {conf.label}: {conf.description}
          </span>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className={`np-mapper-grid np-lens-${lens}`}>
        {(lens === 'mine' || lens === 'balanced') &&
          renderColumn('My Perspective', 'mine', myElements, false)}

        {lens === 'balanced' && shared.length > 0 && (
          <div className="np-shared-column">
            <h3>Shared / Common Ground</h3>
            {shared.map(renderElement)}
          </div>
        )}

        {(lens === 'theirs' || lens === 'balanced') &&
          renderColumn('Their Perspective (Hypothesized)', 'theirs', theirElements, true)}
      </div>

      {/* Analysis Summary */}
      <div className="np-mapper-analysis">
        <div className="np-analysis-card">
          <h4>Confidence Distribution</h4>
          <div className="np-confidence-bars">
            {CONFIDENCE_LEVELS.map(conf => {
              const count = theirElements.filter(e => e.confidence === conf.id).length;
              const pct = theirElements.length > 0 ? (count / theirElements.length * 100) : 0;
              return (
                <div key={conf.id} className="np-conf-bar-row">
                  <span className="np-conf-label">{conf.label}</span>
                  <div className="np-conf-bar-bg">
                    <div
                      className="np-conf-bar"
                      style={{ width: `${pct}%`, backgroundColor: conf.color }}
                    />
                  </div>
                  <span className="np-conf-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="np-analysis-card">
          <h4>Coverage Gaps</h4>
          <ul className="np-gap-list">
            {PERSPECTIVE_ELEMENTS.map(type => {
              const hasMyElement = myElements.some(e => e.element_type === type.type);
              const hasTheirElement = theirElements.some(e => e.element_type === type.type);

              if (hasMyElement && hasTheirElement) return null;

              return (
                <li key={type.type} className="np-gap-item">
                  {type.icon} {type.label}:
                  {!hasMyElement && ' Missing for "mine"'}
                  {!hasTheirElement && ' Missing for "theirs"'}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Add Element Form */}
      {showAddForm && (
        <div className="np-modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="np-modal np-add-element-modal" onClick={e => e.stopPropagation()}>
            <h2>Add {newElement.party === 'mine' ? 'My' : 'Their'} Perspective Element</h2>

            <div className="np-form-group">
              <label>Type</label>
              <div className="np-type-buttons">
                {PERSPECTIVE_ELEMENTS.map(type => (
                  <button
                    key={type.type}
                    className={`np-type-select ${newElement.type === type.type ? 'selected' : ''}`}
                    onClick={() => setNewElement(prev => ({ ...prev, type: type.type }))}
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="np-form-group">
              <label>Content</label>
              <textarea
                value={newElement.content}
                onChange={e => setNewElement(prev => ({ ...prev, content: e.target.value }))}
                placeholder={PERSPECTIVE_ELEMENTS.find(p => p.type === newElement.type)?.description}
                rows={3}
                autoFocus
              />
            </div>

            {newElement.party === 'theirs' && (
              <>
                <div className="np-form-group">
                  <label>Confidence Level</label>
                  <div className="np-confidence-buttons">
                    {CONFIDENCE_LEVELS.map(conf => (
                      <button
                        key={conf.id}
                        className={`np-conf-select ${newElement.confidence === conf.id ? 'selected' : ''}`}
                        style={{
                          borderColor: conf.color,
                          backgroundColor: newElement.confidence === conf.id ? conf.color : 'transparent',
                          color: newElement.confidence === conf.id ? 'white' : conf.color
                        }}
                        onClick={() => setNewElement(prev => ({ ...prev, confidence: conf.id }))}
                      >
                        {conf.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="np-form-group">
                  <label>Evidence/Source (optional)</label>
                  <input
                    type="text"
                    value={newElement.evidence}
                    onChange={e => setNewElement(prev => ({ ...prev, evidence: e.target.value }))}
                    placeholder="How do you know or why do you think this?"
                  />
                </div>
              </>
            )}

            <div className="np-modal-actions">
              <button onClick={() => setShowAddForm(false)}>Cancel</button>
              <button
                className="np-primary-btn"
                onClick={handleCreate}
                disabled={!newElement.content.trim()}
              >
                Add Element
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
