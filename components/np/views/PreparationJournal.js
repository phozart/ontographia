// components/np/views/PreparationJournal.js
// Preparation notes and reflections

import { useState, useCallback } from 'react';
import { useNP } from '../NPContext';

const ENTRY_TYPES = [
  { id: 'before', label: 'Before', icon: '📝', description: 'Pre-conversation preparation' },
  { id: 'during', label: 'During', icon: '⚡', description: 'Real-time notes (if possible)' },
  { id: 'after', label: 'After', icon: '📋', description: 'Post-conversation debrief' },
  { id: 'reflection', label: 'Reflection', icon: '💭', description: 'Deeper analysis' },
  { id: 'insight', label: 'Insight', icon: '💡', description: 'Key realizations' },
  { id: 'lesson', label: 'Lesson', icon: '🎓', description: 'For future reference' },
];

const MOOD_OPTIONS = [
  { id: 'confident', label: 'Confident', emoji: '😊' },
  { id: 'optimistic', label: 'Optimistic', emoji: '🌟' },
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
  { id: 'uncertain', label: 'Uncertain', emoji: '🤔' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😤' },
];

const JOURNAL_PROMPTS = {
  before: [
    "What's my main goal for this conversation?",
    "What questions do I need answered?",
    "What's my opening approach?",
    "What might they say that would throw me off?",
    "What's the best possible outcome? Worst?",
  ],
  after: [
    "What went well?",
    "What surprised me?",
    "What did I learn about them?",
    "What would I do differently?",
    "What's the next step?",
  ],
  reflection: [
    "What patterns am I noticing?",
    "What assumptions were validated or invalidated?",
    "How did emotions affect the conversation?",
    "What did I miss in my preparation?",
  ],
};

export default function PreparationJournal() {
  const {
    currentSituation,
    journal,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    elements
  } = useNP();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    entry_type: 'before',
    title: '',
    content: '',
    mood: null,
    tags: []
  });
  const [filterType, setFilterType] = useState('all');
  const [tagInput, setTagInput] = useState('');

  // Get questions to ask from elements
  const questions = elements.filter(e => e.element_type === 'question');
  const assumptions = elements.filter(e => e.element_type === 'assumption');

  const handleSubmit = useCallback(async () => {
    if (!formData.content.trim()) return;

    if (editingId) {
      await updateJournalEntry(editingId, formData);
    } else {
      await addJournalEntry(formData);
    }

    setFormData({
      entry_type: 'before',
      title: '',
      content: '',
      mood: null,
      tags: []
    });
    setShowAddForm(false);
    setEditingId(null);
  }, [addJournalEntry, updateJournalEntry, editingId, formData]);

  const handleEdit = (entry) => {
    setFormData({
      entry_type: entry.entry_type,
      title: entry.title || '',
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || []
    });
    setEditingId(entry.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this journal entry?')) {
      await deleteJournalEntry(id);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const filteredJournal = filterType === 'all'
    ? journal
    : journal.filter(j => j.entry_type === filterType);

  const getEntryTypeInfo = (typeId) => ENTRY_TYPES.find(t => t.id === typeId);
  const getMoodInfo = (moodId) => MOOD_OPTIONS.find(m => m.id === moodId);

  if (!currentSituation) return null;

  return (
    <div className="np-journal">
      <div className="np-journal-header">
        <div className="np-journal-title">
          <h2>Preparation Journal</h2>
          <p>Document your preparation, capture insights, and track your learning</p>
        </div>
        <button
          className="np-add-entry-btn"
          onClick={() => {
            setFormData({
              entry_type: 'before',
              title: '',
              content: '',
              mood: null,
              tags: []
            });
            setEditingId(null);
            setShowAddForm(true);
          }}
        >
          + New Entry
        </button>
      </div>

      {/* Quick Reference: Questions & Assumptions */}
      <div className="np-journal-quickref">
        {questions.length > 0 && (
          <div className="np-quickref-section">
            <h4>Questions to Ask</h4>
            <ul>
              {questions.slice(0, 5).map(q => (
                <li key={q.id}>{q.content}</li>
              ))}
            </ul>
          </div>
        )}
        {assumptions.length > 0 && (
          <div className="np-quickref-section">
            <h4>Assumptions to Test</h4>
            <ul>
              {assumptions.filter(a => a.confidence !== 'known').slice(0, 5).map(a => (
                <li key={a.id} className={`np-assumption-${a.confidence}`}>
                  {a.content}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="np-journal-filters">
        <button
          className={`np-filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All ({journal.length})
        </button>
        {ENTRY_TYPES.map(type => {
          const count = journal.filter(j => j.entry_type === type.id).length;
          if (count === 0) return null;
          return (
            <button
              key={type.id}
              className={`np-filter-btn ${filterType === type.id ? 'active' : ''}`}
              onClick={() => setFilterType(type.id)}
            >
              {type.icon} {type.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Journal Entries */}
      <div className="np-journal-entries">
        {filteredJournal.length === 0 ? (
          <div className="np-empty-journal">
            <h3>No entries yet</h3>
            <p>Start documenting your preparation and reflections</p>
            <div className="np-quick-start">
              <h4>Quick Start Prompts:</h4>
              <ul>
                {JOURNAL_PROMPTS.before.slice(0, 3).map((prompt, idx) => (
                  <li key={idx}>{prompt}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          filteredJournal.map(entry => {
            const typeInfo = getEntryTypeInfo(entry.entry_type);
            const moodInfo = getMoodInfo(entry.mood);

            return (
              <div key={entry.id} className={`np-journal-entry np-entry-${entry.entry_type}`}>
                <div className="np-entry-header">
                  <span className="np-entry-type">
                    {typeInfo?.icon} {typeInfo?.label}
                  </span>
                  {entry.title && <h4 className="np-entry-title">{entry.title}</h4>}
                  <span className="np-entry-date">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                  {moodInfo && (
                    <span className="np-entry-mood" title={moodInfo.label}>
                      {moodInfo.emoji}
                    </span>
                  )}
                </div>

                <div className="np-entry-content">
                  {entry.content.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="np-entry-tags">
                    {entry.tags.map(tag => (
                      <span key={tag} className="np-tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="np-entry-actions">
                  <button onClick={() => handleEdit(entry)}>Edit</button>
                  <button onClick={() => handleDelete(entry.id)}>Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Entry Modal */}
      {showAddForm && (
        <div className="np-modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="np-modal np-journal-modal" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Entry' : 'New Journal Entry'}</h2>

            <div className="np-form-group">
              <label>Entry Type</label>
              <div className="np-entry-type-selector">
                {ENTRY_TYPES.map(type => (
                  <button
                    key={type.id}
                    className={`np-type-btn ${formData.entry_type === type.id ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, entry_type: type.id }))}
                    title={type.description}
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="np-form-group">
              <label>Title (optional)</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give this entry a title..."
              />
            </div>

            <div className="np-form-group">
              <label>Content</label>
              <textarea
                value={formData.content}
                onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                placeholder="Write your thoughts..."
                autoFocus
              />

              {/* Prompts for this entry type */}
              {JOURNAL_PROMPTS[formData.entry_type] && (
                <div className="np-prompts-hint">
                  <strong>Prompts:</strong>
                  <ul>
                    {JOURNAL_PROMPTS[formData.entry_type].map((prompt, idx) => (
                      <li key={idx}>{prompt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="np-form-group">
              <label>How are you feeling?</label>
              <div className="np-mood-selector">
                {MOOD_OPTIONS.map(mood => (
                  <button
                    key={mood.id}
                    className={`np-mood-btn ${formData.mood === mood.id ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      mood: prev.mood === mood.id ? null : mood.id
                    }))}
                    title={mood.label}
                  >
                    {mood.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="np-form-group">
              <label>Tags</label>
              <div className="np-tags-input">
                {formData.tags.map(tag => (
                  <span key={tag} className="np-tag-chip">
                    {tag}
                    <button onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag..."
                />
                <button onClick={addTag} disabled={!tagInput.trim()}>Add</button>
              </div>
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
                {editingId ? 'Save Changes' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
