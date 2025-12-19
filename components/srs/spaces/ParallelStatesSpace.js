// components/srs/spaces/ParallelStatesSpace.js
// Parallel States Space - Hold multiple possible futures simultaneously

import { useState, useCallback, useMemo } from 'react';
import { useSRS, STATE_TYPES, SRS_SPACES } from '../SRSContext';
import { CanvasNode } from '../canvas';

// MUI Icons
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const TYPE_ICONS = {
  optimistic: TrendingUpIcon,
  pessimistic: TrendingDownIcon,
  expected: TrendingFlatIcon,
  wildcard: NewReleasesIcon,
};

const PROBABILITY_LABELS = {
  high: { label: 'High', color: '#10b981', range: '70-100%' },
  medium: { label: 'Medium', color: '#f59e0b', range: '30-70%' },
  low: { label: 'Low', color: '#ef4444', range: '0-30%' },
  unknown: { label: 'Unknown', color: '#6b7280', range: '?' },
};

export default function ParallelStatesSpace() {
  const {
    elements,
    createParallelState,
    updateElement,
    deleteElement,
    selectElement,
    selectedElementId,
  } = useSRS();

  const states = elements.parallel_states || [];

  // Local UI state
  const [filter, setFilter] = useState({ type: 'all', probability: 'all' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);

  // Filter states
  const filteredStates = useMemo(() => {
    return states.filter(s => {
      if (filter.type !== 'all' && s.state_type !== filter.type) return false;
      if (filter.probability !== 'all' && s.probability !== filter.probability) return false;
      return true;
    });
  }, [states, filter]);

  // Group states by type
  const statesByType = useMemo(() => {
    const groups = {};
    Object.keys(STATE_TYPES).forEach(key => {
      groups[key] = states.filter(s => s.state_type === key);
    });
    return groups;
  }, [states]);

  // Get highlighted states for comparison
  const highlightedStates = useMemo(() => {
    return states.filter(s => s.is_highlighted);
  }, [states]);

  // Handle position change
  const handlePositionChange = useCallback(async (id, x, y) => {
    await updateElement('parallel_states', 'parallel_state', id, { canvas_x: x, canvas_y: y });
  }, [updateElement]);

  // Handle highlight toggle
  const handleToggleHighlight = useCallback(async (id, currentHighlighted) => {
    await updateElement('parallel_states', 'parallel_state', id, { is_highlighted: !currentHighlighted });
  }, [updateElement]);

  // Handle delete
  const handleDelete = useCallback(async (id) => {
    await deleteElement('parallel_states', 'parallel_state', id);
  }, [deleteElement]);

  // Handle edit
  const handleEdit = useCallback((id) => {
    setEditingId(id);
  }, []);

  return (
    <div className="srs-space srs-space--parallel-states">
      {/* Toolbar */}
      <div className="srs-space-toolbar">
        <button
          className="srs-btn srs-btn--primary"
          onClick={() => setShowCreateModal(true)}
        >
          <AddIcon fontSize="small" />
          Add Scenario
        </button>

        <div className="srs-toolbar-filters">
          <div className="srs-filter-group">
            <FilterListIcon fontSize="small" />
            <select
              value={filter.type}
              onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
            >
              <option value="all">All Types</option>
              {Object.entries(STATE_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>

          <div className="srs-filter-group">
            <select
              value={filter.probability}
              onChange={(e) => setFilter(f => ({ ...f, probability: e.target.value }))}
            >
              <option value="all">All Probabilities</option>
              {Object.entries(PROBABILITY_LABELS).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          className={`srs-btn ${comparisonMode ? 'srs-btn--active' : 'srs-btn--secondary'}`}
          onClick={() => setComparisonMode(!comparisonMode)}
          title="Toggle comparison mode"
        >
          Compare ({highlightedStates.length})
        </button>

        <div className="srs-toolbar-stats">
          <span>{states.length} scenarios</span>
        </div>
      </div>

      {/* Comparison Panel (when active) */}
      {comparisonMode && highlightedStates.length > 0 && (
        <div className="srs-comparison-panel">
          <h4>Comparing {highlightedStates.length} Scenarios</h4>
          <div className="srs-comparison-grid">
            {highlightedStates.map(state => {
              const typeConfig = STATE_TYPES[state.state_type] || STATE_TYPES.expected;
              return (
                <div key={state.id} className="srs-comparison-card">
                  <div className="srs-comparison-card__header" style={{ borderColor: typeConfig.color }}>
                    <span>{state.title}</span>
                    <span className="srs-comparison-card__type">{typeConfig.name}</span>
                  </div>
                  <div className="srs-comparison-card__body">
                    <p>{state.description}</p>
                    {state.implications && (
                      <div className="srs-comparison-card__implications">
                        <strong>Implications:</strong>
                        <p>{state.implications}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <StateCreateModal
          onSave={async (data) => {
            await createParallelState({
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
      {filteredStates.length === 0 ? (
        <div className="srs-space__empty srs-space__empty--guided">
          <div className="srs-empty__header">
            <div className="srs-empty__phase-badge" style={{ backgroundColor: '#f59e0b' }}>
              Analyze Phase • Step 1
            </div>
            <AccountTreeIcon style={{ fontSize: 48, color: SRS_SPACES.parallel.color }} />
            <h2>Explore Parallel Futures</h2>
            <p className="srs-empty__purpose">
              The future is uncertain. Instead of betting on one prediction, hold multiple possible
              futures in mind simultaneously. This helps you make robust decisions.
            </p>
          </div>

          <div className="srs-empty__guidance">
            <h3>Build Your Scenario Set</h3>
            <p>Create at least 3-4 scenarios to avoid tunnel vision.</p>

            <div className="srs-empty__prompts">
              <div className="srs-empty__prompt-group">
                <h4>Optimistic</h4>
                <ul>
                  <li>What if everything goes right?</li>
                  <li>What's our best-case outcome?</li>
                  <li>What would success look like?</li>
                </ul>
              </div>
              <div className="srs-empty__prompt-group">
                <h4>Pessimistic</h4>
                <ul>
                  <li>What if our fears come true?</li>
                  <li>What's the realistic downside?</li>
                  <li>What could go wrong?</li>
                </ul>
              </div>
              <div className="srs-empty__prompt-group">
                <h4>Wildcard</h4>
                <ul>
                  <li>What if something unexpected happens?</li>
                  <li>What are we not considering?</li>
                  <li>What would surprise us?</li>
                </ul>
              </div>
            </div>

            <div className="srs-empty__maturity-hint">
              <strong>Tip:</strong> For each scenario, identify key indicators that would tell you it's unfolding.
            </div>
          </div>

          <button
            className="srs-btn srs-btn--primary srs-btn--lg"
            onClick={() => setShowCreateModal(true)}
          >
            <AddIcon fontSize="small" />
            Add Your First Scenario
          </button>

          <div className="srs-empty__next-step">
            <span>Next:</span> After defining scenarios, use the <strong>Systems Map</strong> to understand
            the causal forces driving these outcomes.
          </div>
        </div>
      ) : (
        filteredStates.map(state => {
          const typeConfig = STATE_TYPES[state.state_type] || STATE_TYPES.expected;
          const probConfig = PROBABILITY_LABELS[state.probability] || PROBABILITY_LABELS.unknown;
          const TypeIcon = TYPE_ICONS[state.state_type] || TrendingFlatIcon;

          return (
            <CanvasNode
              key={state.id}
              id={state.id}
              type="parallel_state"
              x={state.canvas_x || 100}
              y={state.canvas_y || 100}
              width={320}
              color={typeConfig.color}
              icon={TypeIcon}
              title={state.title}
              subtitle={`${typeConfig.name} • ${probConfig.label} (${probConfig.range})`}
              selected={selectedElementId === state.id}
              highlighted={state.is_highlighted}
              onSelect={selectElement}
              onPositionChange={handlePositionChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            >
              <div className="srs-state-content">
                {editingId === state.id ? (
                  <StateEditor
                    state={state}
                    onSave={async (updates) => {
                      await updateElement('parallel_states', 'parallel_state', state.id, updates);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <p className="srs-state-description">{state.description}</p>

                    {state.key_indicators && (
                      <div className="srs-state-indicators">
                        <strong>Key Indicators:</strong>
                        <p>{state.key_indicators}</p>
                      </div>
                    )}

                    {state.implications && (
                      <div className="srs-state-implications">
                        <strong>Implications:</strong>
                        <p>{state.implications}</p>
                      </div>
                    )}

                    {/* Probability and highlight */}
                    <div className="srs-state-actions">
                      <div className="srs-probability-badge">
                        <span
                          className="srs-probability-dot"
                          style={{ backgroundColor: probConfig.color }}
                        />
                        {probConfig.label}
                      </div>

                      <button
                        className={`srs-highlight-btn ${state.is_highlighted ? 'highlighted' : ''}`}
                        onClick={() => handleToggleHighlight(state.id, state.is_highlighted)}
                        title={state.is_highlighted ? 'Remove from comparison' : 'Add to comparison'}
                      >
                        {state.is_highlighted ? (
                          <StarIcon fontSize="small" />
                        ) : (
                          <StarBorderIcon fontSize="small" />
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </CanvasNode>
          );
        })
      )}
      </div>

      {/* Type Legend */}
      <div className="srs-legend">
        <span className="srs-legend-title">Scenario Types:</span>
        {Object.entries(STATE_TYPES).map(([key, config]) => (
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

// State Create Modal
function StateCreateModal({ onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stateType, setStateType] = useState('expected');
  const [probability, setProbability] = useState('unknown');
  const [keyIndicators, setKeyIndicators] = useState('');
  const [implications, setImplications] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      state_type: stateType,
      probability,
      key_indicators: keyIndicators.trim() || null,
      implications: implications.trim() || null,
      is_highlighted: false,
    });
  };

  return (
    <div className="srs-modal-overlay" onClick={onCancel}>
      <div className="srs-modal srs-modal--large" onClick={(e) => e.stopPropagation()}>
        <h3>Add Scenario</h3>
        <p className="srs-modal-hint">
          Describe a possible future state. What might happen? What would that mean?
        </p>

        <div className="srs-form-row">
          <div className="srs-form-group srs-form-group--flex">
            <label>Title</label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Name this scenario..."
            />
          </div>

          <div className="srs-form-group">
            <label>Type</label>
            <select value={stateType} onChange={(e) => setStateType(e.target.value)}>
              {Object.entries(STATE_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="srs-form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this future look like? What has happened to get here?"
            rows={3}
          />
        </div>

        <div className="srs-form-group">
          <label>Probability</label>
          <select value={probability} onChange={(e) => setProbability(e.target.value)}>
            {Object.entries(PROBABILITY_LABELS).map(([key, config]) => (
              <option key={key} value={key}>{config.label} ({config.range})</option>
            ))}
          </select>
        </div>

        <div className="srs-form-group">
          <label>Key Indicators (what to watch for)</label>
          <textarea
            value={keyIndicators}
            onChange={(e) => setKeyIndicators(e.target.value)}
            placeholder="What early signals would tell us this scenario is unfolding?"
            rows={2}
          />
        </div>

        <div className="srs-form-group">
          <label>Implications (so what?)</label>
          <textarea
            value={implications}
            onChange={(e) => setImplications(e.target.value)}
            placeholder="If this happens, what does it mean for our decision?"
            rows={2}
          />
        </div>

        <div className="srs-modal-actions">
          <button className="srs-btn srs-btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="srs-btn srs-btn--primary"
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim()}
          >
            Add Scenario
          </button>
        </div>
      </div>
    </div>
  );
}

// State Editor Component
function StateEditor({ state, onSave, onCancel }) {
  const [title, setTitle] = useState(state.title || '');
  const [description, setDescription] = useState(state.description || '');
  const [stateType, setStateType] = useState(state.state_type || 'expected');
  const [probability, setProbability] = useState(state.probability || 'unknown');
  const [keyIndicators, setKeyIndicators] = useState(state.key_indicators || '');
  const [implications, setImplications] = useState(state.implications || '');

  const handleSave = () => {
    onSave({
      title,
      description,
      state_type: stateType,
      probability,
      key_indicators: keyIndicators || null,
      implications: implications || null,
    });
  };

  return (
    <div className="srs-state-editor">
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
        <label>Type</label>
        <select value={stateType} onChange={(e) => setStateType(e.target.value)}>
          {Object.entries(STATE_TYPES).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>
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
        <label>Probability</label>
        <select value={probability} onChange={(e) => setProbability(e.target.value)}>
          {Object.entries(PROBABILITY_LABELS).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      <div className="srs-form-group">
        <label>Key Indicators</label>
        <textarea
          value={keyIndicators}
          onChange={(e) => setKeyIndicators(e.target.value)}
          rows={2}
        />
      </div>

      <div className="srs-form-group">
        <label>Implications</label>
        <textarea
          value={implications}
          onChange={(e) => setImplications(e.target.value)}
          rows={2}
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
