// components/srs/spaces/DecisionsSpace.js
// Decisions Space - Track decisions and their readiness

import { useState, useCallback, useMemo } from 'react';
import { useSRS, REVERSIBILITY_LEVELS, SRS_SPACES, calculateReadinessScore } from '../SRSContext';
import { CanvasNode } from '../canvas';
import SpaceEmptyState from '../components/SpaceEmptyState';

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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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

      {/* Content Area - Scroll wrapper for right-edge scrollbar */}
      <div className="srs-space__scroll-wrapper">
      {filteredDecisions.length === 0 ? (
        <SpaceEmptyState
          spaceId="decisions"
          onAddClick={() => setShowCreateModal(true)}
        />
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
      </div>

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

// Decision Create Modal with full capture
function DecisionCreateModal({ onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reversibility, setReversibility] = useState('moderate');
  const [options, setOptions] = useState(['', '']);
  const [deadline, setDeadline] = useState('');

  // Enhanced decision capture
  const [knows, setKnows] = useState(['']);
  const [unknowns, setUnknowns] = useState(['']);
  const [successCriteria, setSuccessCriteria] = useState(['']);
  const [actions, setActions] = useState(['']);

  // Active section for tabbed view
  const [activeSection, setActiveSection] = useState('basics'); // basics, clarity, success

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

  // List handlers
  const handleListAdd = (setter) => {
    setter(prev => [...prev, '']);
  };

  const handleListChange = (setter, idx, value) => {
    setter(prev => {
      const newList = [...prev];
      newList[idx] = value;
      return newList;
    });
  };

  const handleListRemove = (setter, list, idx) => {
    if (list.length > 1) {
      setter(list.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    const validOptions = options.filter(o => o.trim());
    const validKnows = knows.filter(k => k.trim());
    const validUnknowns = unknowns.filter(u => u.trim());
    const validCriteria = successCriteria.filter(c => c.trim());
    const validActions = actions.filter(a => a.trim());

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      reversibility,
      options: validOptions.length > 0 ? validOptions : null,
      deadline: deadline || null,
      status: 'draft',
      chosen_option: null,
      knows: validKnows.length > 0 ? validKnows : null,
      unknowns: validUnknowns.length > 0 ? validUnknowns : null,
      success_criteria: validCriteria.length > 0 ? validCriteria : null,
      actions: validActions.length > 0 ? validActions : null,
    });
  };

  return (
    <div className="srs-modal-overlay" onClick={onCancel}>
      <div className="srs-modal srs-modal--large srs-modal--decision" onClick={(e) => e.stopPropagation()}>
        <h3>Create Decision</h3>
        <p className="srs-modal-hint">
          A complete decision captures what you know, don't know, and how you'll measure success.
        </p>

        {/* Section Tabs */}
        <div className="srs-decision-tabs">
          <button
            className={`srs-decision-tab ${activeSection === 'basics' ? 'active' : ''}`}
            onClick={() => setActiveSection('basics')}
          >
            1. Basics
          </button>
          <button
            className={`srs-decision-tab ${activeSection === 'clarity' ? 'active' : ''}`}
            onClick={() => setActiveSection('clarity')}
          >
            2. Clarity
          </button>
          <button
            className={`srs-decision-tab ${activeSection === 'success' ? 'active' : ''}`}
            onClick={() => setActiveSection('success')}
          >
            3. Success
          </button>
        </div>

        {/* Section: Basics */}
        {activeSection === 'basics' && (
          <div className="srs-decision-section">
            <div className="srs-form-group">
              <label>What decision needs to be made?</label>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Should we invest in onboarding overhaul?"
              />
            </div>

            <div className="srs-form-group">
              <label>Context</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this decision important now? What's at stake?"
                rows={2}
              />
            </div>

            <div className="srs-form-row">
              <div className="srs-form-group">
                <label>How reversible?</label>
                <select value={reversibility} onChange={(e) => setReversibility(e.target.value)}>
                  {Object.entries(REVERSIBILITY_LEVELS).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
              </div>

              <div className="srs-form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="srs-form-group">
              <label>Options being considered</label>
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
          </div>
        )}

        {/* Section: Clarity */}
        {activeSection === 'clarity' && (
          <div className="srs-decision-section">
            <div className="srs-form-group">
              <label>
                <CheckCircleIcon fontSize="small" style={{ color: '#10b981', marginRight: 6 }} />
                What do we know for sure?
              </label>
              <p className="srs-form-help">Facts, data, confirmed information</p>
              {knows.map((item, idx) => (
                <div key={idx} className="srs-list-input srs-list-input--good">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleListChange(setKnows, idx, e.target.value)}
                    placeholder="e.g., Small accounts have 2x higher churn"
                  />
                  {knows.length > 1 && (
                    <button
                      type="button"
                      className="srs-btn srs-btn--icon"
                      onClick={() => handleListRemove(setKnows, knows, idx)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="srs-btn srs-btn--secondary srs-btn--sm"
                onClick={() => handleListAdd(setKnows)}
              >
                + Add
              </button>
            </div>

            <div className="srs-form-group">
              <label>
                <HourglassEmptyIcon fontSize="small" style={{ color: '#f59e0b', marginRight: 6 }} />
                What don't we know?
              </label>
              <p className="srs-form-help">Uncertainties, questions that remain, assumptions being made</p>
              {unknowns.map((item, idx) => (
                <div key={idx} className="srs-list-input srs-list-input--warning">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleListChange(setUnknowns, idx, e.target.value)}
                    placeholder="e.g., Will improved onboarding actually reduce churn?"
                  />
                  {unknowns.length > 1 && (
                    <button
                      type="button"
                      className="srs-btn srs-btn--icon"
                      onClick={() => handleListRemove(setUnknowns, unknowns, idx)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="srs-btn srs-btn--secondary srs-btn--sm"
                onClick={() => handleListAdd(setUnknowns)}
              >
                + Add
              </button>
            </div>
          </div>
        )}

        {/* Section: Success */}
        {activeSection === 'success' && (
          <div className="srs-decision-section">
            <div className="srs-form-group">
              <label>
                <TrendingUpIcon fontSize="small" style={{ color: '#6366f1', marginRight: 6 }} />
                How will we measure success?
              </label>
              <p className="srs-form-help">Concrete, measurable outcomes that tell us it worked</p>
              {successCriteria.map((item, idx) => (
                <div key={idx} className="srs-list-input srs-list-input--primary">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleListChange(setSuccessCriteria, idx, e.target.value)}
                    placeholder="e.g., Onboarding completion rate > 60%"
                  />
                  {successCriteria.length > 1 && (
                    <button
                      type="button"
                      className="srs-btn srs-btn--icon"
                      onClick={() => handleListRemove(setSuccessCriteria, successCriteria, idx)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="srs-btn srs-btn--secondary srs-btn--sm"
                onClick={() => handleListAdd(setSuccessCriteria)}
              >
                + Add
              </button>
            </div>

            <div className="srs-form-group">
              <label>
                <ArrowForwardIcon fontSize="small" style={{ color: '#0ea5e9', marginRight: 6 }} />
                What are the next actions?
              </label>
              <p className="srs-form-help">Concrete steps to take if we proceed</p>
              {actions.map((item, idx) => (
                <div key={idx} className="srs-list-input srs-list-input--info">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleListChange(setActions, idx, e.target.value)}
                    placeholder="e.g., Form cross-functional onboarding squad"
                  />
                  {actions.length > 1 && (
                    <button
                      type="button"
                      className="srs-btn srs-btn--icon"
                      onClick={() => handleListRemove(setActions, actions, idx)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="srs-btn srs-btn--secondary srs-btn--sm"
                onClick={() => handleListAdd(setActions)}
              >
                + Add
              </button>
            </div>
          </div>
        )}

        <div className="srs-modal-actions">
          <button className="srs-btn srs-btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          {activeSection !== 'success' ? (
            <button
              className="srs-btn srs-btn--primary"
              onClick={() => setActiveSection(activeSection === 'basics' ? 'clarity' : 'success')}
            >
              Continue
            </button>
          ) : (
            <button
              className="srs-btn srs-btn--primary"
              onClick={handleSubmit}
              disabled={!title.trim()}
            >
              Create Decision
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Decision Editor Component with enhanced capture
function DecisionEditor({ decision, onSave, onCancel }) {
  const [title, setTitle] = useState(decision.title || '');
  const [description, setDescription] = useState(decision.description || '');
  const [reversibility, setReversibility] = useState(decision.reversibility || 'moderate');
  const [options, setOptions] = useState(decision.options || ['', '']);
  const [chosenOption, setChosenOption] = useState(decision.chosen_option || '');
  const [deadline, setDeadline] = useState(decision.deadline ? decision.deadline.split('T')[0] : '');
  const [rationale, setRationale] = useState(decision.rationale || '');

  // Enhanced decision capture
  const [knows, setKnows] = useState(decision.knows || ['']);
  const [unknowns, setUnknowns] = useState(decision.unknowns || ['']);
  const [successCriteria, setSuccessCriteria] = useState(decision.success_criteria || ['']);
  const [actions, setActions] = useState(decision.actions || ['']);

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  // List handlers
  const handleListAdd = (setter) => {
    setter(prev => [...prev, '']);
  };

  const handleListChange = (setter, idx, value) => {
    setter(prev => {
      const newList = [...prev];
      newList[idx] = value;
      return newList;
    });
  };

  const handleSave = () => {
    const validOptions = options.filter(o => o.trim());
    const validKnows = knows.filter(k => k.trim());
    const validUnknowns = unknowns.filter(u => u.trim());
    const validCriteria = successCriteria.filter(c => c.trim());
    const validActions = actions.filter(a => a.trim());

    onSave({
      title,
      description: description || null,
      reversibility,
      options: validOptions.length > 0 ? validOptions : null,
      chosen_option: chosenOption || null,
      deadline: deadline || null,
      rationale: rationale || null,
      knows: validKnows.length > 0 ? validKnows : null,
      unknowns: validUnknowns.length > 0 ? validUnknowns : null,
      success_criteria: validCriteria.length > 0 ? validCriteria : null,
      actions: validActions.length > 0 ? validActions : null,
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

      <div className="srs-form-row srs-form-row--compact">
        <div className="srs-form-group">
          <label>Reversibility</label>
          <select value={reversibility} onChange={(e) => setReversibility(e.target.value)}>
            {Object.entries(REVERSIBILITY_LEVELS).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
        </div>

        <div className="srs-form-group">
          <label>Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>

      {/* Collapsible: Options */}
      <div className="srs-editor-section">
        <button
          type="button"
          className="srs-editor-section-toggle"
          onClick={() => toggleSection('options')}
        >
          Options ({options.filter(o => o.trim()).length})
          {expandedSections.options ? ' −' : ' +'}
        </button>
        {expandedSections.options && (
          <div className="srs-editor-section-content">
            {options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="srs-compact-input"
              />
            ))}
            <button type="button" className="srs-btn srs-btn--sm" onClick={handleAddOption}>
              + Add
            </button>
          </div>
        )}
      </div>

      {/* Chosen Option & Rationale */}
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

      {/* Collapsible: Clarity */}
      <div className="srs-editor-section">
        <button
          type="button"
          className="srs-editor-section-toggle srs-editor-section-toggle--clarity"
          onClick={() => toggleSection('clarity')}
        >
          Clarity (Knows/Unknowns)
          {expandedSections.clarity ? ' −' : ' +'}
        </button>
        {expandedSections.clarity && (
          <div className="srs-editor-section-content">
            <label className="srs-compact-label">What we know</label>
            {knows.map((item, idx) => (
              <input
                key={idx}
                type="text"
                value={item}
                onChange={(e) => handleListChange(setKnows, idx, e.target.value)}
                placeholder="Fact or confirmed info..."
                className="srs-compact-input srs-compact-input--good"
              />
            ))}
            <button type="button" className="srs-btn srs-btn--sm" onClick={() => handleListAdd(setKnows)}>
              + Add
            </button>

            <label className="srs-compact-label" style={{ marginTop: 12 }}>What we don't know</label>
            {unknowns.map((item, idx) => (
              <input
                key={idx}
                type="text"
                value={item}
                onChange={(e) => handleListChange(setUnknowns, idx, e.target.value)}
                placeholder="Uncertainty or assumption..."
                className="srs-compact-input srs-compact-input--warning"
              />
            ))}
            <button type="button" className="srs-btn srs-btn--sm" onClick={() => handleListAdd(setUnknowns)}>
              + Add
            </button>
          </div>
        )}
      </div>

      {/* Collapsible: Success */}
      <div className="srs-editor-section">
        <button
          type="button"
          className="srs-editor-section-toggle srs-editor-section-toggle--success"
          onClick={() => toggleSection('success')}
        >
          Success Criteria & Actions
          {expandedSections.success ? ' −' : ' +'}
        </button>
        {expandedSections.success && (
          <div className="srs-editor-section-content">
            <label className="srs-compact-label">Success criteria</label>
            {successCriteria.map((item, idx) => (
              <input
                key={idx}
                type="text"
                value={item}
                onChange={(e) => handleListChange(setSuccessCriteria, idx, e.target.value)}
                placeholder="How will we know it worked?"
                className="srs-compact-input srs-compact-input--primary"
              />
            ))}
            <button type="button" className="srs-btn srs-btn--sm" onClick={() => handleListAdd(setSuccessCriteria)}>
              + Add
            </button>

            <label className="srs-compact-label" style={{ marginTop: 12 }}>Next actions</label>
            {actions.map((item, idx) => (
              <input
                key={idx}
                type="text"
                value={item}
                onChange={(e) => handleListChange(setActions, idx, e.target.value)}
                placeholder="Concrete next step..."
                className="srs-compact-input srs-compact-input--info"
              />
            ))}
            <button type="button" className="srs-btn srs-btn--sm" onClick={() => handleListAdd(setActions)}>
              + Add
            </button>
          </div>
        )}
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
