// components/srs/spaces/PerspectivesSpace.js
// Perspectives Space - Surface and honor different viewpoints

import { useState, useCallback, useMemo } from 'react';
import { useSRS, PERSPECTIVE_TYPES, SRS_SPACES } from '../SRSContext';
import { CanvasNode } from '../canvas';

// MUI Icons
import GroupsIcon from '@mui/icons-material/Groups';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PublicIcon from '@mui/icons-material/Public';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const TYPE_ICONS = {
  stakeholder: PersonIcon,
  team: GroupIcon,
  organization: AccountBalanceIcon,
  external: PublicIcon,
  self: SelfImprovementIcon,
};

const INFLUENCE_LEVELS = {
  high: { label: 'High Influence', color: '#dc2626' },
  medium: { label: 'Medium Influence', color: '#f59e0b' },
  low: { label: 'Low Influence', color: '#6b7280' },
};

const INTEREST_LEVELS = {
  high: { label: 'High Interest', color: '#7c3aed' },
  medium: { label: 'Medium Interest', color: '#8b5cf6' },
  low: { label: 'Low Interest', color: '#a78bfa' },
};

export default function PerspectivesSpace() {
  const {
    elements,
    createPerspective,
    updateElement,
    deleteElement,
    selectElement,
    selectedElementId,
  } = useSRS();

  const perspectives = elements.perspectives || [];

  // Local UI state
  const [filter, setFilter] = useState({ type: 'all', influence: 'all' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' or 'matrix'

  // Filter perspectives
  const filteredPerspectives = useMemo(() => {
    return perspectives.filter(p => {
      if (filter.type !== 'all' && p.perspective_type !== filter.type) return false;
      if (filter.influence !== 'all' && p.influence !== filter.influence) return false;
      return true;
    });
  }, [perspectives, filter]);

  // Group by influence/interest for matrix view
  const matrixData = useMemo(() => {
    const matrix = {
      'high-high': [],
      'high-medium': [],
      'high-low': [],
      'medium-high': [],
      'medium-medium': [],
      'medium-low': [],
      'low-high': [],
      'low-medium': [],
      'low-low': [],
    };

    perspectives.forEach(p => {
      const key = `${p.influence || 'medium'}-${p.interest || 'medium'}`;
      if (matrix[key]) {
        matrix[key].push(p);
      }
    });

    return matrix;
  }, [perspectives]);

  // Stats
  const stats = useMemo(() => {
    const highInfluence = perspectives.filter(p => p.influence === 'high').length;
    const consulted = perspectives.filter(p => p.is_consulted).length;
    return { total: perspectives.length, highInfluence, consulted };
  }, [perspectives]);

  // Handle position change
  const handlePositionChange = useCallback(async (id, x, y) => {
    await updateElement('perspectives', 'perspective', id, { canvas_x: x, canvas_y: y });
  }, [updateElement]);

  // Handle consulted toggle
  const handleToggleConsulted = useCallback(async (id, currentConsulted) => {
    await updateElement('perspectives', 'perspective', id, { is_consulted: !currentConsulted });
  }, [updateElement]);

  // Handle delete
  const handleDelete = useCallback(async (id) => {
    await deleteElement('perspectives', 'perspective', id);
  }, [deleteElement]);

  // Handle edit
  const handleEdit = useCallback((id) => {
    setEditingId(id);
  }, []);

  return (
    <div className="srs-space srs-space--perspectives">
      {/* Toolbar */}
      <div className="srs-space-toolbar">
        <button
          className="srs-btn srs-btn--primary"
          onClick={() => setShowCreateModal(true)}
        >
          <AddIcon fontSize="small" />
          Add Perspective
        </button>

        <div className="srs-toolbar-filters">
          <div className="srs-filter-group">
            <FilterListIcon fontSize="small" />
            <select
              value={filter.type}
              onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
            >
              <option value="all">All Types</option>
              {Object.entries(PERSPECTIVE_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>

          <div className="srs-filter-group">
            <select
              value={filter.influence}
              onChange={(e) => setFilter(f => ({ ...f, influence: e.target.value }))}
            >
              <option value="all">All Influence</option>
              {Object.entries(INFLUENCE_LEVELS).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="srs-view-toggle">
          <button
            className={`srs-btn srs-btn--sm ${viewMode === 'canvas' ? 'srs-btn--active' : ''}`}
            onClick={() => setViewMode('canvas')}
            title="Canvas view"
          >
            Canvas
          </button>
          <button
            className={`srs-btn srs-btn--sm ${viewMode === 'matrix' ? 'srs-btn--active' : ''}`}
            onClick={() => setViewMode('matrix')}
            title="Stakeholder matrix"
          >
            Matrix
          </button>
        </div>

        <div className="srs-toolbar-stats">
          <span>{stats.total} perspectives</span>
          <span className="srs-stat-divider">|</span>
          <span style={{ color: '#dc2626' }}>
            {stats.highInfluence} high influence
          </span>
          <span className="srs-stat-divider">|</span>
          <span style={{ color: '#10b981' }}>
            {stats.consulted} consulted
          </span>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <PerspectiveCreateModal
          onSave={async (data) => {
            await createPerspective({
              ...data,
              canvas_x: 100 + Math.random() * 400,
              canvas_y: 100 + Math.random() * 300,
            });
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Matrix View */}
      {viewMode === 'matrix' && perspectives.length > 0 && (
        <div className="srs-stakeholder-matrix">
          <div className="srs-matrix-header">
            <div className="srs-matrix-corner">
              <span>Influence →</span>
              <span>Interest ↓</span>
            </div>
            <div className="srs-matrix-col-header">High</div>
            <div className="srs-matrix-col-header">Medium</div>
            <div className="srs-matrix-col-header">Low</div>
          </div>

          {['high', 'medium', 'low'].map(interest => (
            <div key={interest} className="srs-matrix-row">
              <div className="srs-matrix-row-header">{interest.charAt(0).toUpperCase() + interest.slice(1)}</div>
              {['high', 'medium', 'low'].map(influence => {
                const key = `${influence}-${interest}`;
                const items = matrixData[key] || [];
                return (
                  <div
                    key={key}
                    className={`srs-matrix-cell ${influence === 'high' && interest === 'high' ? 'srs-matrix-cell--critical' : ''}`}
                  >
                    {items.map(p => (
                      <div
                        key={p.id}
                        className="srs-matrix-item"
                        onClick={() => selectElement(p.id)}
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="srs-matrix-legend">
            <span className="srs-matrix-legend-item srs-matrix-legend-item--critical">
              High/High = Key Players (manage closely)
            </span>
          </div>
        </div>
      )}

      {/* Canvas View */}
      {viewMode === 'canvas' && (
        <>
          {filteredPerspectives.length === 0 ? (
            <div className="srs-space__empty srs-space__empty--guided">
              <div className="srs-empty__header">
                <div className="srs-empty__phase-badge" style={{ backgroundColor: '#8b5cf6' }}>
                  Decide Phase • Step 1
                </div>
                <GroupsIcon style={{ fontSize: 48, color: SRS_SPACES.perspectives.color }} />
                <h2>Honor Different Perspectives</h2>
                <p className="srs-empty__purpose">
                  Decisions affect different people differently. Actively seek out and understand
                  viewpoints that differ from your own — especially the ones you might dismiss.
                </p>
              </div>

              <div className="srs-empty__guidance">
                <h3>Who Should You Consider?</h3>
                <p>Think beyond the obvious stakeholders.</p>

                <div className="srs-empty__prompts">
                  <div className="srs-empty__prompt-group">
                    <h4>Key Stakeholders</h4>
                    <ul>
                      <li>Who is directly affected?</li>
                      <li>Who has authority or veto power?</li>
                      <li>Who will implement this?</li>
                    </ul>
                  </div>
                  <div className="srs-empty__prompt-group">
                    <h4>Hidden Voices</h4>
                    <ul>
                      <li>Who might be overlooked?</li>
                      <li>Who disagrees but isn't speaking up?</li>
                      <li>What would a critic say?</li>
                    </ul>
                  </div>
                  <div className="srs-empty__prompt-group">
                    <h4>Your Own Lens</h4>
                    <ul>
                      <li>What's your perspective?</li>
                      <li>What biases might you have?</li>
                      <li>What are you hoping for?</li>
                    </ul>
                  </div>
                </div>

                <div className="srs-empty__maturity-hint">
                  <strong>Matrix view:</strong> Use the Matrix button to map perspectives by influence and interest level.
                </div>
              </div>

              <button
                className="srs-btn srs-btn--primary srs-btn--lg"
                onClick={() => setShowCreateModal(true)}
              >
                <AddIcon fontSize="small" />
                Add Your First Perspective
              </button>

              <div className="srs-empty__next-step">
                <span>Next:</span> After gathering perspectives, move to <strong>Decisions</strong> to assess
                readiness and commit when the time is right.
              </div>
            </div>
          ) : (
            filteredPerspectives.map(perspective => {
              const typeConfig = PERSPECTIVE_TYPES[perspective.perspective_type] || PERSPECTIVE_TYPES.stakeholder;
              const influenceConfig = INFLUENCE_LEVELS[perspective.influence] || INFLUENCE_LEVELS.medium;
              const TypeIcon = TYPE_ICONS[perspective.perspective_type] || PersonIcon;

              return (
                <CanvasNode
                  key={perspective.id}
                  id={perspective.id}
                  type="perspective"
                  x={perspective.canvas_x || 100}
                  y={perspective.canvas_y || 100}
                  width={300}
                  color={typeConfig.color}
                  icon={TypeIcon}
                  title={perspective.name}
                  subtitle={`${typeConfig.name} • ${influenceConfig.label}`}
                  selected={selectedElementId === perspective.id}
                  onSelect={selectElement}
                  onPositionChange={handlePositionChange}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                >
                  <div className="srs-perspective-content">
                    {editingId === perspective.id ? (
                      <PerspectiveEditor
                        perspective={perspective}
                        onSave={async (updates) => {
                          await updateElement('perspectives', 'perspective', perspective.id, updates);
                          setEditingId(null);
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <>
                        {perspective.viewpoint && (
                          <div className="srs-perspective-viewpoint">
                            <strong>Viewpoint:</strong>
                            <p>{perspective.viewpoint}</p>
                          </div>
                        )}

                        {perspective.concerns && (
                          <div className="srs-perspective-concerns">
                            <strong>Concerns:</strong>
                            <p>{perspective.concerns}</p>
                          </div>
                        )}

                        {perspective.needs && (
                          <div className="srs-perspective-needs">
                            <strong>Needs:</strong>
                            <p>{perspective.needs}</p>
                          </div>
                        )}

                        {/* Consulted toggle */}
                        <div className="srs-perspective-actions">
                          <button
                            className={`srs-consulted-btn ${perspective.is_consulted ? 'consulted' : ''}`}
                            onClick={() => handleToggleConsulted(perspective.id, perspective.is_consulted)}
                            title={perspective.is_consulted ? 'Mark as not consulted' : 'Mark as consulted'}
                          >
                            {perspective.is_consulted ? (
                              <>
                                <VisibilityIcon fontSize="small" />
                                Consulted
                              </>
                            ) : (
                              <>
                                <VisibilityOffIcon fontSize="small" />
                                Not Consulted
                              </>
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
        </>
      )}

      {/* Legend */}
      <div className="srs-legend">
        <span className="srs-legend-title">Types:</span>
        {Object.entries(PERSPECTIVE_TYPES).map(([key, config]) => (
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

// Perspective Create Modal
function PerspectiveCreateModal({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [perspectiveType, setPerspectiveType] = useState('stakeholder');
  const [viewpoint, setViewpoint] = useState('');
  const [concerns, setConcerns] = useState('');
  const [needs, setNeeds] = useState('');
  const [influence, setInfluence] = useState('medium');
  const [interest, setInterest] = useState('medium');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      perspective_type: perspectiveType,
      viewpoint: viewpoint.trim() || null,
      concerns: concerns.trim() || null,
      needs: needs.trim() || null,
      influence,
      interest,
      is_consulted: false,
    });
  };

  return (
    <div className="srs-modal-overlay" onClick={onCancel}>
      <div className="srs-modal srs-modal--large" onClick={(e) => e.stopPropagation()}>
        <h3>Add Perspective</h3>
        <p className="srs-modal-hint">
          Who else has a stake in this decision? What do they see?
        </p>

        <div className="srs-form-row">
          <div className="srs-form-group srs-form-group--flex">
            <label>Name</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Person, team, or group name..."
            />
          </div>

          <div className="srs-form-group">
            <label>Type</label>
            <select value={perspectiveType} onChange={(e) => setPerspectiveType(e.target.value)}>
              {Object.entries(PERSPECTIVE_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="srs-form-group">
          <label>Viewpoint</label>
          <textarea
            value={viewpoint}
            onChange={(e) => setViewpoint(e.target.value)}
            placeholder="How do they see this situation? What's their perspective?"
            rows={2}
          />
        </div>

        <div className="srs-form-group">
          <label>Concerns</label>
          <textarea
            value={concerns}
            onChange={(e) => setConcerns(e.target.value)}
            placeholder="What worries or risks do they see?"
            rows={2}
          />
        </div>

        <div className="srs-form-group">
          <label>Needs</label>
          <textarea
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
            placeholder="What do they need from this decision?"
            rows={2}
          />
        </div>

        <div className="srs-form-row">
          <div className="srs-form-group">
            <label>Influence</label>
            <select value={influence} onChange={(e) => setInfluence(e.target.value)}>
              {Object.entries(INFLUENCE_LEVELS).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="srs-form-group">
            <label>Interest</label>
            <select value={interest} onChange={(e) => setInterest(e.target.value)}>
              {Object.entries(INTEREST_LEVELS).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="srs-modal-actions">
          <button className="srs-btn srs-btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="srs-btn srs-btn--primary"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Add Perspective
          </button>
        </div>
      </div>
    </div>
  );
}

// Perspective Editor Component
function PerspectiveEditor({ perspective, onSave, onCancel }) {
  const [name, setName] = useState(perspective.name || '');
  const [perspectiveType, setPerspectiveType] = useState(perspective.perspective_type || 'stakeholder');
  const [viewpoint, setViewpoint] = useState(perspective.viewpoint || '');
  const [concerns, setConcerns] = useState(perspective.concerns || '');
  const [needs, setNeeds] = useState(perspective.needs || '');
  const [influence, setInfluence] = useState(perspective.influence || 'medium');
  const [interest, setInterest] = useState(perspective.interest || 'medium');

  const handleSave = () => {
    onSave({
      name,
      perspective_type: perspectiveType,
      viewpoint: viewpoint || null,
      concerns: concerns || null,
      needs: needs || null,
      influence,
      interest,
    });
  };

  return (
    <div className="srs-perspective-editor">
      <div className="srs-form-group">
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="srs-form-group">
        <label>Type</label>
        <select value={perspectiveType} onChange={(e) => setPerspectiveType(e.target.value)}>
          {Object.entries(PERSPECTIVE_TYPES).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>
      </div>

      <div className="srs-form-group">
        <label>Viewpoint</label>
        <textarea
          value={viewpoint}
          onChange={(e) => setViewpoint(e.target.value)}
          rows={2}
        />
      </div>

      <div className="srs-form-group">
        <label>Concerns</label>
        <textarea
          value={concerns}
          onChange={(e) => setConcerns(e.target.value)}
          rows={2}
        />
      </div>

      <div className="srs-form-group">
        <label>Needs</label>
        <textarea
          value={needs}
          onChange={(e) => setNeeds(e.target.value)}
          rows={2}
        />
      </div>

      <div className="srs-form-row">
        <div className="srs-form-group">
          <label>Influence</label>
          <select value={influence} onChange={(e) => setInfluence(e.target.value)}>
            {Object.entries(INFLUENCE_LEVELS).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <div className="srs-form-group">
          <label>Interest</label>
          <select value={interest} onChange={(e) => setInterest(e.target.value)}>
            {Object.entries(INTEREST_LEVELS).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
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
