// components/srs/spaces/DecisionsSpace.js
// Decisions Space - Track decisions and their readiness

import { useState, useCallback, useMemo } from 'react';
import { useSRS, REVERSIBILITY_LEVELS, SRS_SPACES, calculateReadinessScore } from '../SRSContext';
import { CanvasNode } from '../canvas';

// MUI Icons
import GavelIcon from '@mui/icons-material/Gavel';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import UndoIcon from '@mui/icons-material/Undo';
import LockIcon from '@mui/icons-material/Lock';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: '#6b7280', icon: PendingIcon },
  ready: { label: 'Ready', color: '#10b981', icon: CheckCircleIcon },
  decided: { label: 'Decided', color: '#3b82f6', icon: GavelIcon },
  blocked: { label: 'Blocked', color: '#ef4444', icon: CancelIcon },
  deferred: { label: 'Deferred', color: '#f59e0b', icon: HourglassEmptyIcon },
};

const REVERSIBILITY_ICONS = {
  easy: UndoIcon,
  moderate: SwapHorizIcon,
  difficult: LockIcon,
  irreversible: LockIcon,
};

export default function DecisionsSpace() {
  const {
    elements,
    connections,
    createDecision,
    updateElement,
    deleteElement,
    selectElement,
    selectedElementId,
  } = useSRS();

  const decisions = elements.decisions || [];

  // Local UI state
  const [filter, setFilter] = useState({ status: 'all', reversibility: 'all' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showReadinessPanel, setShowReadinessPanel] = useState(false);

  // Calculate readiness for each decision
  const decisionsWithReadiness = useMemo(() => {
    return decisions.map(d => ({
      ...d,
      readinessScore: calculateReadinessScore(elements, connections, d.id),
    }));
  }, [decisions, elements, connections]);

  // Filter decisions
  const filteredDecisions = useMemo(() => {
    return decisionsWithReadiness.filter(d => {
      if (filter.status !== 'all' && d.status !== filter.status) return false;
      if (filter.reversibility !== 'all' && d.reversibility !== filter.reversibility) return false;
      return true;
    });
  }, [decisionsWithReadiness, filter]);

  // Stats
  const stats = useMemo(() => {
    const ready = decisions.filter(d => d.status === 'ready').length;
    const decided = decisions.filter(d => d.status === 'decided').length;
    const blocked = decisions.filter(d => d.status === 'blocked').length;
    const avgReadiness = decisionsWithReadiness.length > 0
      ? Math.round(decisionsWithReadiness.reduce((acc, d) => acc + d.readinessScore.overall, 0) / decisionsWithReadiness.length)
      : 0;
    return { total: decisions.length, ready, decided, blocked, avgReadiness };
  }, [decisions, decisionsWithReadiness]);

  // Handle position change
  const handlePositionChange = useCallback(async (id, x, y) => {
    await updateElement('decisions', 'decision', id, { canvas_x: x, canvas_y: y });
  }, [updateElement]);

  // Handle status change
  const handleStatusChange = useCallback(async (id, newStatus) => {
    await updateElement('decisions', 'decision', id, { status: newStatus });
  }, [updateElement]);

  // Handle delete
  const handleDelete = useCallback(async (id) => {
    await deleteElement('decisions', 'decision', id);
  }, [deleteElement]);

  // Handle edit
  const handleEdit = useCallback((id) => {
    setEditingId(id);
  }, []);

  // Get readiness color
  const getReadinessColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="srs-space srs-space--decisions">
      {/* Toolbar */}
      <div className="srs-space-toolbar">
        <button
          className="srs-btn srs-btn--primary"
          onClick={() => setShowCreateModal(true)}
        >
          <AddIcon fontSize="small" />
          Add Decision
        </button>

        <div className="srs-toolbar-filters">
          <div className="srs-filter-group">
            <FilterListIcon fontSize="small" />
            <select
              value={filter.status}
              onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="srs-filter-group">
            <select
              value={filter.reversibility}
              onChange={(e) => setFilter(f => ({ ...f, reversibility: e.target.value }))}
            >
              <option value="all">All Reversibility</option>
              {Object.entries(REVERSIBILITY_LEVELS).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          className={`srs-btn ${showReadinessPanel ? 'srs-btn--active' : 'srs-btn--secondary'}`}
          onClick={() => setShowReadinessPanel(!showReadinessPanel)}
        >
          <TrendingUpIcon fontSize="small" />
          Readiness
        </button>

        <div className="srs-toolbar-stats">
          <span>{stats.total} decisions</span>
          <span className="srs-stat-divider">|</span>
          <span style={{ color: '#10b981' }}>{stats.decided} decided</span>
          <span className="srs-stat-divider">|</span>
          <span>Avg: {stats.avgReadiness}%</span>
        </div>
      </div>

      {/* Readiness Panel */}
      {showReadinessPanel && decisionsWithReadiness.length > 0 && (
        <div className="srs-readiness-panel">
          <h4>Decision Readiness Overview</h4>
          <div className="srs-readiness-list">
            {decisionsWithReadiness.map(decision => {
              const score = decision.readinessScore;
              return (
                <div
                  key={decision.id}
                  className="srs-readiness-item"
                  onClick={() => selectElement(decision.id)}
                >
                  <div className="srs-readiness-item__header">
                    <span className="srs-readiness-item__title">{decision.title}</span>
                    <span
                      className="srs-readiness-item__score"
                      style={{ color: getReadinessColor(score.overall) }}
                    >
                      {score.overall}%
                    </span>
                  </div>
                  <div className="srs-readiness-item__bar">
                    <div
                      className="srs-readiness-item__bar-fill"
                      style={{
                        width: `${score.overall}%`,
                        backgroundColor: getReadinessColor(score.overall),
                      }}
                    />
                  </div>
                  <div className="srs-readiness-item__factors">
                    <span title="Questions answered">Q: {score.factors.questions}%</span>
                    <span title="Frames examined">F: {score.factors.frames}%</span>
                    <span title="Scenarios explored">S: {score.factors.scenarios}%</span>
                    <span title="Perspectives consulted">P: {score.factors.perspectives}%</span>
                  </div>
                  {score.blockers.length > 0 && (
                    <div className="srs-readiness-item__blockers">
                      <WarningIcon fontSize="small" />
                      {score.blockers.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <DecisionCreateModal
          onSave={async (data) => {
            await createDecision({
              ...data,
              canvas_x: 100 + Math.random() * 400,
              canvas_y: 100 + Math.random() * 300,
            });
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Canvas with Decision Nodes */}
      {filteredDecisions.length === 0 ? (
        <div className="srs-space__empty srs-space__empty--guided">
          <div className="srs-empty__header">
            <div className="srs-empty__phase-badge" style={{ backgroundColor: '#6366f1' }}>
              Decide Phase • Step 2
            </div>
            <GavelIcon style={{ fontSize: 48, color: SRS_SPACES.decisions.color }} />
            <h2>Make and Track Decisions</h2>
            <p className="srs-empty__purpose">
              This is where reasoning becomes action. Track decisions, assess when you're ready
              to commit, and document choices so you can learn from them.
            </p>
          </div>

          <div className="srs-empty__guidance">
            <h3>Decision Readiness</h3>
            <p>A decision is ready when you've done the work.</p>

            <div className="srs-empty__prompts">
              <div className="srs-empty__prompt-group">
                <h4>Questions Answered</h4>
                <ul>
                  <li>Have key questions been explored?</li>
                  <li>Do you understand the situation?</li>
                  <li>What's still uncertain?</li>
                </ul>
              </div>
              <div className="srs-empty__prompt-group">
                <h4>Options Considered</h4>
                <ul>
                  <li>Have you explored multiple paths?</li>
                  <li>What are the trade-offs?</li>
                  <li>What's reversible vs. permanent?</li>
                </ul>
              </div>
              <div className="srs-empty__prompt-group">
                <h4>Stakeholders Aligned</h4>
                <ul>
                  <li>Have key perspectives been heard?</li>
                  <li>Who needs to be on board?</li>
                  <li>What concerns remain?</li>
                </ul>
              </div>
            </div>

            <div className="srs-empty__maturity-hint">
              <strong>Readiness score:</strong> The system calculates decision readiness based on your work in other spaces.
            </div>
          </div>

          <button
            className="srs-btn srs-btn--primary srs-btn--lg"
            onClick={() => setShowCreateModal(true)}
          >
            <AddIcon fontSize="small" />
            Add Your First Decision
          </button>

          <div className="srs-empty__next-step">
            <span>Tip:</span> Decisions can be tracked even before you're ready — add them early
            and watch the readiness score grow as you do the work.
          </div>
        </div>
      ) : (
        filteredDecisions.map(decision => {
          const statusConfig = STATUS_CONFIG[decision.status] || STATUS_CONFIG.draft;
          const reversibilityConfig = REVERSIBILITY_LEVELS[decision.reversibility] || REVERSIBILITY_LEVELS.moderate;
          const StatusIcon = statusConfig.icon;
          const ReversibilityIcon = REVERSIBILITY_ICONS[decision.reversibility] || SwapHorizIcon;
          const readinessColor = getReadinessColor(decision.readinessScore.overall);

          return (
            <CanvasNode
              key={decision.id}
              id={decision.id}
              type="decision"
              x={decision.canvas_x || 100}
              y={decision.canvas_y || 100}
              width={340}
              color={statusConfig.color}
              icon={StatusIcon}
              title={decision.title}
              subtitle={`${statusConfig.label} • ${reversibilityConfig.name}`}
              selected={selectedElementId === decision.id}
              onSelect={selectElement}
              onPositionChange={handlePositionChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            >
              <div className="srs-decision-content">
                {editingId === decision.id ? (
                  <DecisionEditor
                    decision={decision}
                    onSave={async (updates) => {
                      await updateElement('decisions', 'decision', decision.id, updates);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    {decision.description && (
                      <p className="srs-decision-description">{decision.description}</p>
                    )}

                    {/* Readiness indicator */}
                    <div className="srs-decision-readiness">
                      <div className="srs-decision-readiness__header">
                        <span>Readiness</span>
                        <span style={{ color: readinessColor, fontWeight: 600 }}>
                          {decision.readinessScore.overall}%
                        </span>
                      </div>
                      <div className="srs-decision-readiness__bar">
                        <div
                          className="srs-decision-readiness__bar-fill"
                          style={{
                            width: `${decision.readinessScore.overall}%`,
                            backgroundColor: readinessColor,
                          }}
                        />
                      </div>
                      {decision.readinessScore.blockers.length > 0 && (
                        <div className="srs-decision-readiness__blockers">
                          <WarningIcon fontSize="small" style={{ color: '#f59e0b' }} />
                          <span>{decision.readinessScore.blockers[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Options */}
                    {decision.options && decision.options.length > 0 && (
                      <div className="srs-decision-options">
                        <strong>Options:</strong>
                        <ul>
                          {decision.options.map((opt, idx) => (
                            <li key={idx} className={decision.chosen_option === opt ? 'chosen' : ''}>
                              {opt}
                              {decision.chosen_option === opt && (
                                <CheckCircleIcon fontSize="small" style={{ color: '#10b981' }} />
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Deadline */}
                    {decision.deadline && (
                      <div className="srs-decision-deadline">
                        <HourglassEmptyIcon fontSize="small" />
                        <span>Deadline: {new Date(decision.deadline).toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Status actions */}
                    <div className="srs-decision-actions">
                      <div className="srs-status-buttons">
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                          const Icon = config.icon;
                          return (
                            <button
                              key={key}
                              className={`srs-status-btn ${decision.status === key ? 'active' : ''}`}
                              style={{
                                borderColor: decision.status === key ? config.color : 'transparent',
                                backgroundColor: decision.status === key ? `${config.color}20` : 'transparent',
                              }}
                              onClick={() => handleStatusChange(decision.id, key)}
                              title={config.label}
                            >
                              <Icon fontSize="small" style={{ color: config.color }} />
                            </button>
                          );
                        })}
                      </div>

                      <div className="srs-reversibility-badge">
                        <ReversibilityIcon fontSize="small" />
                        {reversibilityConfig.name}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CanvasNode>
          );
        })
      )}

      {/* Legend */}
      <div className="srs-legend">
        <span className="srs-legend-title">Status:</span>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <span key={key} className="srs-legend-item">
            <span
              className="srs-legend-dot"
              style={{ backgroundColor: config.color }}
            />
            {config.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Decision Create Modal
function DecisionCreateModal({ onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reversibility, setReversibility] = useState('moderate');
  const [options, setOptions] = useState(['', '']);
  const [deadline, setDeadline] = useState('');

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (idx) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    const validOptions = options.filter(o => o.trim());
    onSave({
      title: title.trim(),
      description: description.trim() || null,
      reversibility,
      options: validOptions.length > 0 ? validOptions : null,
      deadline: deadline || null,
      status: 'draft',
      chosen_option: null,
    });
  };

  return (
    <div className="srs-modal-overlay" onClick={onCancel}>
      <div className="srs-modal srs-modal--large" onClick={(e) => e.stopPropagation()}>
        <h3>Add Decision</h3>
        <p className="srs-modal-hint">
          What decision needs to be made? What are the options?
        </p>

        <div className="srs-form-group">
          <label>Title</label>
          <input
            type="text"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be decided?"
          />
        </div>

        <div className="srs-form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Context and background for this decision..."
            rows={2}
          />
        </div>

        <div className="srs-form-row">
          <div className="srs-form-group">
            <label>Reversibility</label>
            <select value={reversibility} onChange={(e) => setReversibility(e.target.value)}>
              {Object.entries(REVERSIBILITY_LEVELS).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>

          <div className="srs-form-group">
            <label>Deadline (optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="srs-form-group">
          <label>Options</label>
          {options.map((opt, idx) => (
            <div key={idx} className="srs-option-input">
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}...`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="srs-btn srs-btn--icon"
                  onClick={() => handleRemoveOption(idx)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="srs-btn srs-btn--secondary srs-btn--sm"
            onClick={handleAddOption}
          >
            + Add Option
          </button>
        </div>

        <div className="srs-modal-actions">
          <button className="srs-btn srs-btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="srs-btn srs-btn--primary"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            Add Decision
          </button>
        </div>
      </div>
    </div>
  );
}

// Decision Editor Component
function DecisionEditor({ decision, onSave, onCancel }) {
  const [title, setTitle] = useState(decision.title || '');
  const [description, setDescription] = useState(decision.description || '');
  const [reversibility, setReversibility] = useState(decision.reversibility || 'moderate');
  const [options, setOptions] = useState(decision.options || ['', '']);
  const [chosenOption, setChosenOption] = useState(decision.chosen_option || '');
  const [deadline, setDeadline] = useState(decision.deadline ? decision.deadline.split('T')[0] : '');
  const [rationale, setRationale] = useState(decision.rationale || '');

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    const validOptions = options.filter(o => o.trim());
    onSave({
      title,
      description: description || null,
      reversibility,
      options: validOptions.length > 0 ? validOptions : null,
      chosen_option: chosenOption || null,
      deadline: deadline || null,
      rationale: rationale || null,
    });
  };

  return (
    <div className="srs-decision-editor">
      <div className="srs-form-group">
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div className="srs-form-group">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="srs-form-group">
        <label>Reversibility</label>
        <select value={reversibility} onChange={(e) => setReversibility(e.target.value)}>
          {Object.entries(REVERSIBILITY_LEVELS).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>
      </div>

      <div className="srs-form-group">
        <label>Options</label>
        {options.map((opt, idx) => (
          <div key={idx} className="srs-option-input">
            <input
              type="text"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
            />
          </div>
        ))}
        <button
          type="button"
          className="srs-btn srs-btn--secondary srs-btn--sm"
          onClick={handleAddOption}
        >
          + Add
        </button>
      </div>

      <div className="srs-form-group">
        <label>Chosen Option</label>
        <select value={chosenOption} onChange={(e) => setChosenOption(e.target.value)}>
          <option value="">Not decided</option>
          {options.filter(o => o.trim()).map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="srs-form-group">
        <label>Rationale</label>
        <textarea
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          rows={2}
          placeholder="Why this choice?"
        />
      </div>

      <div className="srs-form-group">
        <label>Deadline</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
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
