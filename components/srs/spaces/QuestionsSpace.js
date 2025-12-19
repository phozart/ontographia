// components/srs/spaces/QuestionsSpace.js
// Questions Space - Surface and mature the questions that matter

import { useState, useCallback, useMemo } from 'react';
import { useSRS, QUESTION_TYPES, QUESTION_MATURITY, SRS_SPACES } from '../SRSContext';
import { CanvasNode } from '../canvas';

// MUI Icons
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SearchIcon from '@mui/icons-material/Search';
import TimelineIcon from '@mui/icons-material/Timeline';
import BalanceIcon from '@mui/icons-material/Balance';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const TYPE_ICONS = {
  clarifying: SearchIcon,
  causal: TimelineIcon,
  evaluative: BalanceIcon,
  hypothetical: LightbulbIcon,
  strategic: FlagIcon,
};

export default function QuestionsSpace() {
  const {
    elements,
    createQuestion,
    updateElement,
    deleteElement,
    selectElement,
    selectedElementId,
    createConnection,
  } = useSRS();

  const questions = elements.questions || [];

  // Local UI state
  const [filter, setFilter] = useState({ type: 'all', maturity: 'all' });
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (filter.type !== 'all' && q.question_type !== filter.type) return false;
      if (filter.maturity !== 'all' && q.maturity !== filter.maturity) return false;
      return true;
    });
  }, [questions, filter]);

  // Group questions by maturity for overview
  const questionsByMaturity = useMemo(() => {
    const groups = {};
    Object.keys(QUESTION_MATURITY).forEach(key => {
      groups[key] = questions.filter(q => q.maturity === key);
    });
    return groups;
  }, [questions]);

  // Handle quick add
  const handleQuickAdd = useCallback(async () => {
    if (!quickAddText.trim()) return;

    // Detect question type from keywords
    let detectedType = 'clarifying';
    const text = quickAddText.toLowerCase();
    if (text.includes('why') || text.includes('cause') || text.includes('because')) {
      detectedType = 'causal';
    } else if (text.includes('should') || text.includes('better') || text.includes('worth')) {
      detectedType = 'evaluative';
    } else if (text.includes('what if') || text.includes('could') || text.includes('might')) {
      detectedType = 'hypothetical';
    } else if (text.includes('how do we') || text.includes('what should') || text.includes('next step')) {
      detectedType = 'strategic';
    }

    await createQuestion({
      text: quickAddText.trim(),
      question_type: detectedType,
      maturity: 'surfaced',
      canvas_x: 100 + Math.random() * 400,
      canvas_y: 100 + Math.random() * 300,
    });

    setQuickAddText('');
    setShowQuickAdd(false);
  }, [quickAddText, createQuestion]);

  // Handle position change
  const handlePositionChange = useCallback(async (id, x, y) => {
    await updateElement('questions', 'question', id, { canvas_x: x, canvas_y: y });
  }, [updateElement]);

  // Handle maturity change
  const handleMaturityChange = useCallback(async (id, newMaturity) => {
    await updateElement('questions', 'question', id, { maturity: newMaturity });
  }, [updateElement]);

  // Handle delete
  const handleDelete = useCallback(async (id) => {
    await deleteElement('questions', 'question', id);
  }, [deleteElement]);

  // Handle edit
  const handleEdit = useCallback((id) => {
    setEditingId(id);
  }, []);

  // Handle connection start
  const handleStartConnection = useCallback((id, type, point) => {
    // Store connection start info for drag interaction
    console.log('Start connection from question:', id);
  }, []);

  return (
    <div className="srs-space srs-space--questions">
      {/* Toolbar */}
      <div className="srs-space-toolbar">
        <button
          className="srs-btn srs-btn--primary"
          onClick={() => setShowQuickAdd(true)}
        >
          <AddIcon fontSize="small" />
          Add Question
        </button>

        <div className="srs-toolbar-filters">
          <div className="srs-filter-group">
            <FilterListIcon fontSize="small" />
            <select
              value={filter.type}
              onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
            >
              <option value="all">All Types</option>
              {Object.entries(QUESTION_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>

          <div className="srs-filter-group">
            <select
              value={filter.maturity}
              onChange={(e) => setFilter(f => ({ ...f, maturity: e.target.value }))}
            >
              <option value="all">All Maturity</option>
              {Object.entries(QUESTION_MATURITY).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="srs-toolbar-stats">
          <span>{questions.length} questions</span>
          <span className="srs-stat-divider">|</span>
          <span style={{ color: QUESTION_MATURITY.answered.color }}>
            {questionsByMaturity.answered?.length || 0} answered
          </span>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="srs-quick-add-overlay" onClick={() => setShowQuickAdd(false)}>
          <div className="srs-quick-add" onClick={(e) => e.stopPropagation()}>
            <h3>What question is on your mind?</h3>
            <textarea
              autoFocus
              value={quickAddText}
              onChange={(e) => setQuickAddText(e.target.value)}
              placeholder="Type your question here..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuickAdd();
                }
              }}
            />
            <div className="srs-quick-add__hint">
              Tip: Questions starting with &quot;why&quot; become causal, &quot;what if&quot; become hypothetical
            </div>
            <div className="srs-quick-add__actions">
              <button
                className="srs-btn srs-btn--secondary"
                onClick={() => setShowQuickAdd(false)}
              >
                Cancel
              </button>
              <button
                className="srs-btn srs-btn--primary"
                onClick={handleQuickAdd}
                disabled={!quickAddText.trim()}
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area - Scroll wrapper for right-edge scrollbar */}
      <div className="srs-space__scroll-wrapper">
      {filteredQuestions.length === 0 ? (
        <div className="srs-space__empty srs-space__empty--guided">
          <div className="srs-empty__header">
            <div className="srs-empty__phase-badge" style={{ backgroundColor: '#3b82f6' }}>
              Explore Phase • Step 1
            </div>
            <HelpOutlineIcon style={{ fontSize: 48, color: SRS_SPACES.questions.color }} />
            <h2>Surface Your Questions</h2>
            <p className="srs-empty__purpose">
              Every strategic decision begins with the right questions. This space helps you
              surface and mature the questions that need answering before you can decide.
            </p>
          </div>

          <div className="srs-empty__guidance">
            <h3>Getting Started</h3>
            <p>Think about what's keeping you up at night. What do you need to know?</p>

            <div className="srs-empty__prompts">
              <div className="srs-empty__prompt-group">
                <h4>Clarifying Questions</h4>
                <ul>
                  <li>"What exactly do we mean by...?"</li>
                  <li>"Who is affected by this?"</li>
                  <li>"What's the actual scope?"</li>
                </ul>
              </div>
              <div className="srs-empty__prompt-group">
                <h4>Causal Questions</h4>
                <ul>
                  <li>"Why is this happening?"</li>
                  <li>"What's driving this change?"</li>
                  <li>"What caused us to be here?"</li>
                </ul>
              </div>
              <div className="srs-empty__prompt-group">
                <h4>Strategic Questions</h4>
                <ul>
                  <li>"What should we do about...?"</li>
                  <li>"How do we respond to...?"</li>
                  <li>"What's our next move?"</li>
                </ul>
              </div>
            </div>

            <div className="srs-empty__maturity-hint">
              <strong>How questions mature:</strong> Surfaced → Explored → Refined → Answered
            </div>
          </div>

          <button
            className="srs-btn srs-btn--primary srs-btn--lg"
            onClick={() => setShowQuickAdd(true)}
          >
            <AddIcon fontSize="small" />
            Add Your First Question
          </button>

          <div className="srs-empty__next-step">
            <span>Next:</span> After surfacing questions, move to <strong>Frames</strong> to examine
            the assumptions shaping how you see this situation.
          </div>
        </div>
      ) : (
        <div className="srs-cards-grid">
          {filteredQuestions.map(question => {
            const typeConfig = QUESTION_TYPES[question.question_type] || QUESTION_TYPES.clarifying;
            const maturityConfig = QUESTION_MATURITY[question.maturity] || QUESTION_MATURITY.surfaced;
            const TypeIcon = TYPE_ICONS[question.question_type] || HelpOutlineIcon;

            return (
              <div
                key={question.id}
                className={`srs-question-card ${selectedElementId === question.id ? 'selected' : ''}`}
                style={{ '--card-color': typeConfig.color }}
                onClick={() => selectElement(question.id, 'question')}
              >
                <div className="srs-question-card__header">
                  <div className="srs-question-card__type">
                    <TypeIcon fontSize="small" style={{ color: typeConfig.color }} />
                    <span>{typeConfig.name}</span>
                  </div>
                  <div className="srs-question-card__actions">
                    <button
                      className="srs-icon-btn"
                      onClick={(e) => { e.stopPropagation(); handleEdit(question.id); }}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      className="srs-icon-btn srs-icon-btn--danger"
                      onClick={(e) => { e.stopPropagation(); handleDelete(question.id); }}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>

                {editingId === question.id ? (
                  <QuestionEditor
                    question={question}
                    onSave={async (updates) => {
                      await updateElement('questions', 'question', question.id, updates);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <p className="srs-question-card__text">{question.text}</p>

                    {question.answer && (
                      <div className="srs-question-card__answer">
                        <CheckCircleIcon fontSize="small" style={{ color: '#10b981' }} />
                        <span>{question.answer}</span>
                      </div>
                    )}

                    {/* Maturity progression */}
                    <div className="srs-question-card__maturity">
                      <span className="srs-maturity-label">Maturity:</span>
                      {Object.entries(QUESTION_MATURITY).map(([key, config]) => (
                        <button
                          key={key}
                          className={`srs-maturity-step ${question.maturity === key ? 'active' : ''}`}
                          style={{
                            backgroundColor: question.maturity === key ? config.color : 'transparent',
                            borderColor: config.color,
                          }}
                          onClick={(e) => { e.stopPropagation(); handleMaturityChange(question.id, key); }}
                          title={`${config.name}: ${config.description}`}
                        >
                          {config.order}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Maturity Legend */}
      <div className="srs-legend">
        <span className="srs-legend-title">Maturity:</span>
        {Object.entries(QUESTION_MATURITY).map(([key, config]) => (
          <span key={key} className="srs-legend-item">
            <span
              className="srs-legend-dot"
              style={{ backgroundColor: config.color }}
            />
            {config.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// Question Editor Component
function QuestionEditor({ question, onSave, onCancel }) {
  const [text, setText] = useState(question.text || '');
  const [questionType, setQuestionType] = useState(question.question_type || 'clarifying');
  const [answer, setAnswer] = useState(question.answer || '');
  const [notes, setNotes] = useState(question.notes || '');

  const handleSave = () => {
    onSave({
      text,
      question_type: questionType,
      answer: answer || null,
      notes: notes || null,
    });
  };

  return (
    <div className="srs-question-editor">
      <div className="srs-form-group">
        <label>Question</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          autoFocus
        />
      </div>

      <div className="srs-form-group">
        <label>Type</label>
        <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
          {Object.entries(QUESTION_TYPES).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>
      </div>

      <div className="srs-form-group">
        <label>Answer (if known)</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={2}
          placeholder="What have you learned?"
        />
      </div>

      <div className="srs-form-group">
        <label>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Additional context..."
        />
      </div>

      <div className="srs-editor-actions">
        <button className="srs-btn srs-btn--secondary srs-btn--sm" onClick={onCancel}>
          Cancel
        </button>
        <button className="srs-btn srs-btn--primary srs-btn--sm" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}
