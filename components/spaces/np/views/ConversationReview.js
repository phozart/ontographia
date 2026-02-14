// components/np/views/ConversationReview.js
// Post-hoc analysis of conversation turns

import { useState, useCallback, useMemo } from 'react';
import { useNP } from '../NPContext';

const TACTIC_OPTIONS = [
  'Anchoring',
  'Mirroring',
  'Labeling emotions',
  'Asking calibrated question',
  'Making concession',
  'Reframing',
  'Silence',
  'Deadline pressure',
  'Good cop/bad cop',
  'Appeal to fairness',
  'Building rapport',
  'Summarizing',
  'Other'
];

const TONE_OPTIONS = [
  { id: 'collaborative', label: 'Collaborative', color: '#22c55e' },
  { id: 'assertive', label: 'Assertive', color: '#3b82f6' },
  { id: 'defensive', label: 'Defensive', color: '#f59e0b' },
  { id: 'aggressive', label: 'Aggressive', color: '#ef4444' },
  { id: 'passive', label: 'Passive', color: '#6b7280' },
  { id: 'frustrated', label: 'Frustrated', color: '#f97316' },
  { id: 'confused', label: 'Confused', color: '#8b5cf6' },
];

const EFFECTIVENESS_OPTIONS = [
  { id: 'effective', label: 'Effective', icon: '✓', color: '#22c55e' },
  { id: 'neutral', label: 'Neutral', icon: '—', color: '#6b7280' },
  { id: 'ineffective', label: 'Ineffective', icon: '✗', color: '#f59e0b' },
  { id: 'backfired', label: 'Backfired', icon: '⚠', color: '#ef4444' },
];

export default function ConversationReview() {
  const {
    currentSituation,
    conversationTurns,
    addConversationTurn,
    updateConversationTurn,
    deleteConversationTurn
  } = useNP();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    speaker: 'me',
    content: '',
    tactic_used: '',
    emotional_tone: '',
    effectiveness: '',
    notes: ''
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (conversationTurns.length === 0) return null;

    const myTurns = conversationTurns.filter(t => t.speaker === 'me');
    const theirTurns = conversationTurns.filter(t => t.speaker === 'them');

    return {
      total: conversationTurns.length,
      mine: myTurns.length,
      theirs: theirTurns.length,
      effectiveCount: myTurns.filter(t => t.effectiveness === 'effective').length,
      ineffectiveCount: myTurns.filter(t => t.effectiveness === 'ineffective' || t.effectiveness === 'backfired').length,
      tacticsUsed: [...new Set(conversationTurns.filter(t => t.tactic_used).map(t => t.tactic_used))],
      dominantTone: (() => {
        const tones = conversationTurns.filter(t => t.emotional_tone).map(t => t.emotional_tone);
        const counts = {};
        tones.forEach(t => counts[t] = (counts[t] || 0) + 1);
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      })()
    };
  }, [conversationTurns]);

  const handleSubmit = useCallback(async () => {
    if (!formData.content.trim()) return;

    if (editingId) {
      await updateConversationTurn(editingId, formData);
    } else {
      await addConversationTurn(formData);
    }

    setFormData({
      speaker: 'me',
      content: '',
      tactic_used: '',
      emotional_tone: '',
      effectiveness: '',
      notes: ''
    });
    setShowAddForm(false);
    setEditingId(null);
  }, [addConversationTurn, updateConversationTurn, editingId, formData]);

  const handleEdit = (turn) => {
    setFormData({
      speaker: turn.speaker,
      content: turn.content,
      tactic_used: turn.tactic_used || '',
      emotional_tone: turn.emotional_tone || '',
      effectiveness: turn.effectiveness || '',
      notes: turn.notes || ''
    });
    setEditingId(turn.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this turn?')) {
      await deleteConversationTurn(id);
    }
  };

  const getToneInfo = (toneId) => TONE_OPTIONS.find(t => t.id === toneId);
  const getEffectivenessInfo = (effId) => EFFECTIVENESS_OPTIONS.find(e => e.id === effId);

  if (!currentSituation) return null;

  return (
    <div className="np-conversation-review">
      <div className="np-review-header">
        <div>
          <h2>Conversation Review</h2>
          <p>Reconstruct and analyze the conversation to learn from it</p>
        </div>
        <button
          className="np-add-turn-btn"
          onClick={() => {
            setFormData({
              speaker: 'me',
              content: '',
              tactic_used: '',
              emotional_tone: '',
              effectiveness: '',
              notes: ''
            });
            setEditingId(null);
            setShowAddForm(true);
          }}
        >
          + Add Turn
        </button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="np-conversation-stats">
          <div className="np-stat-card">
            <span className="np-stat-value">{stats.total}</span>
            <span className="np-stat-label">Total Turns</span>
          </div>
          <div className="np-stat-card">
            <span className="np-stat-value">{stats.mine}</span>
            <span className="np-stat-label">My Turns</span>
          </div>
          <div className="np-stat-card">
            <span className="np-stat-value">{stats.theirs}</span>
            <span className="np-stat-label">Their Turns</span>
          </div>
          <div className="np-stat-card np-stat-effective">
            <span className="np-stat-value">{stats.effectiveCount}</span>
            <span className="np-stat-label">Effective</span>
          </div>
          <div className="np-stat-card np-stat-ineffective">
            <span className="np-stat-value">{stats.ineffectiveCount}</span>
            <span className="np-stat-label">Ineffective</span>
          </div>
        </div>
      )}

      {/* Conversation Timeline */}
      <div className="np-conversation-timeline">
        {conversationTurns.length === 0 ? (
          <div className="np-empty-conversation">
            <h3>No conversation recorded yet</h3>
            <p>
              Reconstruct the conversation by adding each turn.
              This helps you analyze what worked and what didn't.
            </p>
            <button onClick={() => setShowAddForm(true)}>
              Add first turn
            </button>
          </div>
        ) : (
          conversationTurns.map((turn, idx) => {
            const toneInfo = getToneInfo(turn.emotional_tone);
            const effInfo = getEffectivenessInfo(turn.effectiveness);

            return (
              <div
                key={turn.id}
                className={`np-turn np-turn-${turn.speaker}`}
              >
                <div className="np-turn-number">{turn.turn_number}</div>

                <div className="np-turn-content">
                  <div className="np-turn-header">
                    <span className="np-turn-speaker">
                      {turn.speaker === 'me' ? 'You' : turn.speaker === 'them' ? 'Them' : 'Other'}
                    </span>

                    {turn.tactic_used && (
                      <span className="np-turn-tactic" title="Tactic used">
                        🎯 {turn.tactic_used}
                      </span>
                    )}

                    {toneInfo && (
                      <span
                        className="np-turn-tone"
                        style={{ backgroundColor: toneInfo.color }}
                      >
                        {toneInfo.label}
                      </span>
                    )}

                    {effInfo && turn.speaker === 'me' && (
                      <span
                        className="np-turn-effectiveness"
                        style={{ color: effInfo.color }}
                        title={`Effectiveness: ${effInfo.label}`}
                      >
                        {effInfo.icon}
                      </span>
                    )}
                  </div>

                  <p className="np-turn-text">"{turn.content}"</p>

                  {turn.notes && (
                    <p className="np-turn-notes">
                      <em>Note: {turn.notes}</em>
                    </p>
                  )}

                  <div className="np-turn-actions">
                    <button onClick={() => handleEdit(turn)}>Edit</button>
                    <button onClick={() => handleDelete(turn.id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Analysis Section */}
      {stats && stats.tacticsUsed.length > 0 && (
        <div className="np-tactics-analysis">
          <h3>Tactics Analysis</h3>
          <div className="np-tactics-list">
            {stats.tacticsUsed.map(tactic => {
              const count = conversationTurns.filter(t => t.tactic_used === tactic).length;
              const effective = conversationTurns.filter(
                t => t.tactic_used === tactic && t.effectiveness === 'effective'
              ).length;

              return (
                <div key={tactic} className="np-tactic-stat">
                  <span className="np-tactic-name">{tactic}</span>
                  <span className="np-tactic-count">Used {count}x</span>
                  <span className="np-tactic-success">
                    {effective}/{count} effective
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Turn Modal */}
      {showAddForm && (
        <div className="np-modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="np-modal np-turn-modal" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Turn' : 'Add Conversation Turn'}</h2>

            <div className="np-form-group">
              <label>Speaker</label>
              <div className="np-speaker-selector">
                <button
                  className={`np-speaker-btn ${formData.speaker === 'me' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, speaker: 'me' }))}
                >
                  Me
                </button>
                <button
                  className={`np-speaker-btn ${formData.speaker === 'them' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, speaker: 'them' }))}
                >
                  Them
                </button>
                <button
                  className={`np-speaker-btn ${formData.speaker === 'other' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, speaker: 'other' }))}
                >
                  Other
                </button>
              </div>
            </div>

            <div className="np-form-group">
              <label>What was said?</label>
              <textarea
                value={formData.content}
                onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                placeholder="Paraphrase or quote what was said..."
                autoFocus
              />
            </div>

            <div className="np-form-row">
              <div className="np-form-group np-form-half">
                <label>Tactic Used (if applicable)</label>
                <select
                  value={formData.tactic_used}
                  onChange={e => setFormData(prev => ({ ...prev, tactic_used: e.target.value }))}
                >
                  <option value="">None / Not sure</option>
                  {TACTIC_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="np-form-group np-form-half">
                <label>Emotional Tone</label>
                <select
                  value={formData.emotional_tone}
                  onChange={e => setFormData(prev => ({ ...prev, emotional_tone: e.target.value }))}
                >
                  <option value="">Select tone...</option>
                  {TONE_OPTIONS.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.speaker === 'me' && (
              <div className="np-form-group">
                <label>How effective was this?</label>
                <div className="np-effectiveness-selector">
                  {EFFECTIVENESS_OPTIONS.map(eff => (
                    <button
                      key={eff.id}
                      className={`np-eff-btn ${formData.effectiveness === eff.id ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, effectiveness: eff.id }))}
                      style={{
                        borderColor: eff.color,
                        backgroundColor: formData.effectiveness === eff.id ? eff.color : 'transparent',
                        color: formData.effectiveness === eff.id ? 'white' : eff.color
                      }}
                    >
                      {eff.icon} {eff.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="np-form-group">
              <label>Notes (optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="What were you thinking? What did you notice?"
              />
            </div>

            <div className="np-modal-actions">
              <button onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
              }}>
                Cancel
              </button>
              <button
                className="np-primary-btn"
                onClick={handleSubmit}
                disabled={!formData.content.trim()}
              >
                {editingId ? 'Save Changes' : 'Add Turn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
