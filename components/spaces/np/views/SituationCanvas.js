// components/np/views/SituationCanvas.js
// Ground the situation before diving into tactics

import { useState, useCallback } from 'react';
import { useNP } from '../NPContext';

const SITUATION_TYPES = [
  { id: 'negotiation', label: 'Negotiation', description: 'Reaching an agreement with give and take' },
  { id: 'persuasion', label: 'Persuasion', description: 'Convincing someone of your view' },
  { id: 'conflict', label: 'Conflict Resolution', description: 'Resolving a disagreement' },
  { id: 'collaboration', label: 'Collaboration', description: 'Working together toward shared goals' },
  { id: 'unknown', label: 'Not Sure', description: 'Help me figure it out' },
];

const STAKES_OPTIONS = [
  { id: 'low', label: 'Low', description: 'Minor impact if things don\'t go well' },
  { id: 'medium', label: 'Medium', description: 'Significant but manageable impact' },
  { id: 'high', label: 'High', description: 'Major consequences either way' },
  { id: 'critical', label: 'Critical', description: 'Career/relationship defining moment' },
];

const RELATIONSHIP_OPTIONS = [
  { id: 'one-time', label: 'One-time', description: 'Unlikely to interact again' },
  { id: 'ongoing', label: 'Ongoing', description: 'Regular future interactions' },
  { id: 'strategic', label: 'Strategic', description: 'Long-term important relationship' },
];

const TIME_PRESSURE_OPTIONS = [
  { id: 'none', label: 'None', description: 'Can take as long as needed' },
  { id: 'moderate', label: 'Some', description: 'Prefer to resolve soon' },
  { id: 'urgent', label: 'Urgent', description: 'Need resolution quickly' },
  { id: 'critical', label: 'Critical', description: 'Immediate decision required' },
];

export default function SituationCanvas() {
  const {
    currentSituation,
    updateSituation,
    createElement,
    elements,
    diagnosticQuestions
  } = useNP();

  const [editing, setEditing] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  // Get context elements (stakeholders, triggers)
  const stakeholders = elements.filter(e => e.element_type === 'stakeholder');
  const triggers = elements.filter(e => e.element_type === 'trigger');
  const situations = elements.filter(e => e.element_type === 'situation');

  const handleUpdate = useCallback(async (field, value) => {
    await updateSituation(currentSituation.id, { [field]: value });
  }, [currentSituation?.id, updateSituation]);

  const handleSaveEdit = useCallback(async (field) => {
    await handleUpdate(field, tempValue);
    setEditing(null);
    setTempValue('');
  }, [handleUpdate, tempValue]);

  const startEdit = useCallback((field, currentValue) => {
    setEditing(field);
    setTempValue(currentValue || '');
  }, []);

  const handleAddContextElement = useCallback(async (type) => {
    const content = prompt(`Add ${type}:`);
    if (content) {
      await createElement({
        element_type: type,
        category: 'context',
        party: 'neutral',
        content,
        confidence: 'known'
      });
    }
  }, [createElement]);

  if (!currentSituation) return null;

  return (
    <div className="np-situation-canvas">
      <div className="np-canvas-header">
        <h2>Ground the Situation</h2>
        <p>Before tactics, understand what you're dealing with</p>
      </div>

      <div className="np-situation-grid">
        {/* Name & Description */}
        <section className="np-section np-section-full">
          <label>Situation Name</label>
          {editing === 'name' ? (
            <div className="np-edit-row">
              <input
                type="text"
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveEdit('name')}
                autoFocus
              />
              <button onClick={() => handleSaveEdit('name')}>Save</button>
              <button onClick={() => setEditing(null)}>Cancel</button>
            </div>
          ) : (
            <h3 onClick={() => startEdit('name', currentSituation.name)} className="np-editable">
              {currentSituation.name}
            </h3>
          )}

          <label>Description</label>
          {editing === 'description' ? (
            <div className="np-edit-row">
              <textarea
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                rows={3}
                autoFocus
              />
              <div className="np-edit-actions">
                <button onClick={() => handleSaveEdit('description')}>Save</button>
                <button onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <p onClick={() => startEdit('description', currentSituation.description)} className="np-editable np-placeholder">
              {currentSituation.description || 'Click to add description...'}
            </p>
          )}
        </section>

        {/* Type Selection */}
        <section className="np-section">
          <label>What type of interaction is this?</label>
          <div className="np-type-selector">
            {SITUATION_TYPES.map(type => (
              <button
                key={type.id}
                className={`np-type-btn ${currentSituation.situation_type === type.id ? 'selected' : ''}`}
                onClick={() => handleUpdate('situation_type', type.id)}
                title={type.description}
              >
                {type.label}
              </button>
            ))}
          </div>
          {currentSituation.situation_type === 'unknown' && (
            <button
              className="np-diagnostic-btn"
              onClick={() => setShowDiagnostic(true)}
            >
              Help me figure it out →
            </button>
          )}
        </section>

        {/* Other Party */}
        <section className="np-section">
          <label>Who are you dealing with?</label>
          {editing === 'other_party' ? (
            <div className="np-edit-row">
              <input
                type="text"
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveEdit('other_party')}
                placeholder="Name or role"
                autoFocus
              />
              <button onClick={() => handleSaveEdit('other_party')}>Save</button>
              <button onClick={() => setEditing(null)}>Cancel</button>
            </div>
          ) : (
            <div onClick={() => startEdit('other_party', currentSituation.other_party)} className="np-editable">
              {currentSituation.other_party || <span className="np-placeholder">Click to add...</span>}
            </div>
          )}
        </section>

        {/* Context */}
        <section className="np-section">
          <label>Background Context</label>
          {editing === 'context' ? (
            <div className="np-edit-row">
              <textarea
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                rows={3}
                placeholder="What's the history? Why is this happening now?"
                autoFocus
              />
              <div className="np-edit-actions">
                <button onClick={() => handleSaveEdit('context')}>Save</button>
                <button onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <p onClick={() => startEdit('context', currentSituation.context)} className="np-editable np-placeholder">
              {currentSituation.context || 'Click to add context...'}
            </p>
          )}
        </section>

        {/* Stakes */}
        <section className="np-section np-section-half">
          <label>What's at stake?</label>
          <div className="np-option-group">
            {STAKES_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`np-option-btn ${currentSituation.stakes === opt.id ? 'selected' : ''}`}
                onClick={() => handleUpdate('stakes', opt.id)}
                title={opt.description}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Relationship */}
        <section className="np-section np-section-half">
          <label>Relationship Importance</label>
          <div className="np-option-group">
            {RELATIONSHIP_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`np-option-btn ${currentSituation.relationship_importance === opt.id ? 'selected' : ''}`}
                onClick={() => handleUpdate('relationship_importance', opt.id)}
                title={opt.description}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Time Pressure */}
        <section className="np-section np-section-half">
          <label>Time Pressure</label>
          <div className="np-option-group">
            {TIME_PRESSURE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`np-option-btn ${currentSituation.time_pressure === opt.id ? 'selected' : ''}`}
                onClick={() => handleUpdate('time_pressure', opt.id)}
                title={opt.description}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Stakeholders */}
        <section className="np-section np-section-half">
          <label>Other Stakeholders</label>
          <div className="np-element-list">
            {stakeholders.map(s => (
              <div key={s.id} className="np-element-chip">
                {s.content}
              </div>
            ))}
            <button
              className="np-add-chip"
              onClick={() => handleAddContextElement('stakeholder')}
            >
              + Add
            </button>
          </div>
        </section>

        {/* Triggers */}
        <section className="np-section np-section-full">
          <label>What triggered this? What's the immediate cause?</label>
          <div className="np-element-list">
            {triggers.map(t => (
              <div key={t.id} className="np-element-chip">
                {t.content}
              </div>
            ))}
            <button
              className="np-add-chip"
              onClick={() => handleAddContextElement('trigger')}
            >
              + Add Trigger
            </button>
          </div>
        </section>
      </div>

      {/* Diagnostic Modal */}
      {showDiagnostic && (
        <div className="np-modal-overlay" onClick={() => setShowDiagnostic(false)}>
          <div className="np-modal np-diagnostic-modal" onClick={e => e.stopPropagation()}>
            <h2>What kind of interaction is this?</h2>
            <p>Answer these questions to help classify your situation:</p>
            <div className="np-diagnostic-questions">
              {diagnosticQuestions?.slice(0, 4).map((q, idx) => (
                <div key={idx} className="np-diagnostic-q">
                  <p>{q.question}</p>
                  <div className="np-diagnostic-answers">
                    {q.options.map((opt, optIdx) => (
                      <button key={optIdx} className="np-diagnostic-option">
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="np-modal-close" onClick={() => setShowDiagnostic(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
