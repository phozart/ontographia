// components/ba/StakeholderRegister.js
// BABOK Knowledge Area: Stakeholder Analysis
// Features: Stakeholder Register, Power/Interest Grid, Engagement Planning

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useArtefacts,
  ARTEFACT_TYPES,
} from '../ArtefactContext';

// MUI Icons
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import StarIcon from '@mui/icons-material/Star';
import WarningIcon from '@mui/icons-material/Warning';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';

// ============ INFLUENCE/INTEREST LEVELS ============
const INFLUENCE_LEVELS = {
  Low: { value: 1, color: '#22c55e', label: 'Low' },
  Medium: { value: 2, color: '#f59e0b', label: 'Medium' },
  High: { value: 3, color: '#ef4444', label: 'High' },
};

const INTEREST_LEVELS = {
  Low: { value: 1, color: '#22c55e', label: 'Low' },
  Medium: { value: 2, color: '#f59e0b', label: 'Medium' },
  High: { value: 3, color: '#ef4444', label: 'High' },
};

// ============ QUADRANT DEFINITIONS ============
const QUADRANTS = {
  'high-high': {
    id: 'high-high',
    name: 'Manage Closely',
    description: 'Key players - engage closely and frequently',
    strategy: 'Regular meetings, involve in decisions, seek input actively',
    color: '#ef4444',
    bgColor: '#fef2f2',
  },
  'high-low': {
    id: 'high-low',
    name: 'Keep Satisfied',
    description: 'High power but low interest - keep satisfied',
    strategy: 'Keep informed of major decisions, address concerns promptly',
    color: '#f59e0b',
    bgColor: '#fefce8',
  },
  'low-high': {
    id: 'low-high',
    name: 'Keep Informed',
    description: 'High interest but low power - keep informed',
    strategy: 'Regular updates, leverage their enthusiasm, potential advocates',
    color: '#3b82f6',
    bgColor: '#eff6ff',
  },
  'low-low': {
    id: 'low-low',
    name: 'Monitor',
    description: 'Low power and interest - monitor with minimal effort',
    strategy: 'General communications, no special attention needed',
    color: '#6b7280',
    bgColor: '#f9fafb',
  },
};

// ============ STAKEHOLDER CARD ============
function StakeholderCard({ stakeholder, onSelect, onEdit, onDelete, compact = false }) {
  const getQuadrant = () => {
    const influence = stakeholder.influence || 'Medium';
    const interest = stakeholder.interest || 'Medium';
    const infLevel = INFLUENCE_LEVELS[influence]?.value || 2;
    const intLevel = INTEREST_LEVELS[interest]?.value || 2;

    if (infLevel >= 2 && intLevel >= 2) return QUADRANTS['high-high'];
    if (infLevel >= 2 && intLevel < 2) return QUADRANTS['high-low'];
    if (infLevel < 2 && intLevel >= 2) return QUADRANTS['low-high'];
    return QUADRANTS['low-low'];
  };

  const quadrant = getQuadrant();

  if (compact) {
    return (
      <div
        className="stakeholder-chip"
        onClick={() => onSelect(stakeholder)}
        style={{ borderColor: quadrant.color }}
      >
        <PersonIcon fontSize="small" style={{ color: quadrant.color }} />
        <span className="chip-name">{stakeholder.name}</span>
        <span className="chip-role">{stakeholder.role}</span>
      </div>
    );
  }

  return (
    <div
      className="stakeholder-card"
      onClick={() => onSelect(stakeholder)}
      style={{ borderLeftColor: quadrant.color }}
    >
      <div className="card-header">
        <div className="card-avatar" style={{ backgroundColor: quadrant.color }}>
          <PersonIcon />
        </div>
        <div className="card-title">
          <h4>{stakeholder.name}</h4>
          <span className="card-role">{stakeholder.role}</span>
        </div>
        <div className="card-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit(stakeholder); }} title="Edit">
            <EditIcon fontSize="small" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(stakeholder); }} title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="card-body">
        {stakeholder.description && (
          <p className="card-desc">{stakeholder.description}</p>
        )}

        <div className="card-metrics">
          <div className="metric">
            <span className="metric-label">Influence</span>
            <span
              className="metric-value"
              style={{ color: INFLUENCE_LEVELS[stakeholder.influence]?.color }}
            >
              {stakeholder.influence || 'Medium'}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Interest</span>
            <span
              className="metric-value"
              style={{ color: INTEREST_LEVELS[stakeholder.interest]?.color }}
            >
              {stakeholder.interest || 'Medium'}
            </span>
          </div>
        </div>

        <div className="card-quadrant" style={{ backgroundColor: quadrant.bgColor }}>
          <span className="quadrant-name" style={{ color: quadrant.color }}>
            {quadrant.name}
          </span>
        </div>
      </div>

      <div className="card-footer">
        {stakeholder.communicationPreference && (
          <span className="contact-pref">
            <EmailIcon fontSize="small" />
            {stakeholder.communicationPreference}
          </span>
        )}
        {stakeholder.concerns?.length > 0 && (
          <span className="concerns-count">
            <WarningIcon fontSize="small" />
            {stakeholder.concerns.length} concerns
          </span>
        )}
      </div>
    </div>
  );
}

// ============ POWER/INTEREST GRID ============
function PowerInterestGrid({ stakeholders, onSelect, onDrop, gridContainerRef }) {
  const gridRef = gridContainerRef || useRef(null);
  const [draggedStakeholder, setDraggedStakeholder] = useState(null);

  // Group stakeholders by quadrant
  const stakeholdersByQuadrant = useMemo(() => {
    const grouped = {
      'high-high': [],
      'high-low': [],
      'low-high': [],
      'low-low': [],
    };

    stakeholders.forEach(s => {
      const influence = s.influence || 'Medium';
      const interest = s.interest || 'Medium';
      const infLevel = INFLUENCE_LEVELS[influence]?.value || 2;
      const intLevel = INTEREST_LEVELS[interest]?.value || 2;

      if (infLevel >= 2 && intLevel >= 2) grouped['high-high'].push(s);
      else if (infLevel >= 2 && intLevel < 2) grouped['high-low'].push(s);
      else if (infLevel < 2 && intLevel >= 2) grouped['low-high'].push(s);
      else grouped['low-low'].push(s);
    });

    return grouped;
  }, [stakeholders]);

  const handleDragStart = (e, stakeholder) => {
    setDraggedStakeholder(stakeholder);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, quadrantId) => {
    e.preventDefault();
    if (draggedStakeholder && onDrop) {
      // Determine new influence/interest based on quadrant
      let newInfluence, newInterest;
      switch (quadrantId) {
        case 'high-high':
          newInfluence = 'High';
          newInterest = 'High';
          break;
        case 'high-low':
          newInfluence = 'High';
          newInterest = 'Low';
          break;
        case 'low-high':
          newInfluence = 'Low';
          newInterest = 'High';
          break;
        case 'low-low':
          newInfluence = 'Low';
          newInterest = 'Low';
          break;
      }
      onDrop(draggedStakeholder, { influence: newInfluence, interest: newInterest });
    }
    setDraggedStakeholder(null);
  };

  const handleDragEnd = () => {
    setDraggedStakeholder(null);
  };

  return (
    <div className="power-interest-grid" ref={gridRef}>
      {/* Y-Axis Label */}
      <div className="grid-y-axis">
        <span className="axis-label">INFLUENCE / POWER</span>
        <span className="axis-high">High</span>
        <span className="axis-low">Low</span>
      </div>

      {/* Grid */}
      <div className="grid-container">
        {/* X-Axis Label */}
        <div className="grid-x-axis">
          <span className="axis-low">Low</span>
          <span className="axis-label">INTEREST</span>
          <span className="axis-high">High</span>
        </div>

        {/* Quadrants */}
        <div className="grid-quadrants">
          {/* High Influence, Low Interest */}
          <div
            className="quadrant high-low"
            style={{ backgroundColor: QUADRANTS['high-low'].bgColor }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'high-low')}
          >
            <div className="quadrant-header" style={{ color: QUADRANTS['high-low'].color }}>
              <h5>{QUADRANTS['high-low'].name}</h5>
              <span className="quadrant-strategy">{QUADRANTS['high-low'].strategy}</span>
            </div>
            <div className="quadrant-stakeholders">
              {stakeholdersByQuadrant['high-low'].map(s => (
                <div
                  key={s.id}
                  className="grid-stakeholder"
                  draggable
                  onDragStart={(e) => handleDragStart(e, s)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelect(s)}
                >
                  <PersonIcon fontSize="small" />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* High Influence, High Interest */}
          <div
            className="quadrant high-high"
            style={{ backgroundColor: QUADRANTS['high-high'].bgColor }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'high-high')}
          >
            <div className="quadrant-header" style={{ color: QUADRANTS['high-high'].color }}>
              <StarIcon fontSize="small" />
              <h5>{QUADRANTS['high-high'].name}</h5>
              <span className="quadrant-strategy">{QUADRANTS['high-high'].strategy}</span>
            </div>
            <div className="quadrant-stakeholders">
              {stakeholdersByQuadrant['high-high'].map(s => (
                <div
                  key={s.id}
                  className="grid-stakeholder key-player"
                  draggable
                  onDragStart={(e) => handleDragStart(e, s)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelect(s)}
                >
                  <PersonIcon fontSize="small" />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Influence, Low Interest */}
          <div
            className="quadrant low-low"
            style={{ backgroundColor: QUADRANTS['low-low'].bgColor }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'low-low')}
          >
            <div className="quadrant-header" style={{ color: QUADRANTS['low-low'].color }}>
              <h5>{QUADRANTS['low-low'].name}</h5>
              <span className="quadrant-strategy">{QUADRANTS['low-low'].strategy}</span>
            </div>
            <div className="quadrant-stakeholders">
              {stakeholdersByQuadrant['low-low'].map(s => (
                <div
                  key={s.id}
                  className="grid-stakeholder"
                  draggable
                  onDragStart={(e) => handleDragStart(e, s)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelect(s)}
                >
                  <PersonIcon fontSize="small" />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Influence, High Interest */}
          <div
            className="quadrant low-high"
            style={{ backgroundColor: QUADRANTS['low-high'].bgColor }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'low-high')}
          >
            <div className="quadrant-header" style={{ color: QUADRANTS['low-high'].color }}>
              <h5>{QUADRANTS['low-high'].name}</h5>
              <span className="quadrant-strategy">{QUADRANTS['low-high'].strategy}</span>
            </div>
            <div className="quadrant-stakeholders">
              {stakeholdersByQuadrant['low-high'].map(s => (
                <div
                  key={s.id}
                  className="grid-stakeholder"
                  draggable
                  onDragStart={(e) => handleDragStart(e, s)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelect(s)}
                >
                  <PersonIcon fontSize="small" />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid-legend">
        <p>Drag stakeholders between quadrants to update their influence/interest levels</p>
      </div>
    </div>
  );
}

// ============ STAKEHOLDER TABLE ============
function StakeholderTable({ stakeholders, onSelect, onEdit, onDelete, sortBy, onSort }) {
  return (
    <div className="stakeholder-table-container">
      <table className="stakeholder-table">
        <thead>
          <tr>
            <th onClick={() => onSort('name')} className={sortBy === 'name' ? 'sorted' : ''}>
              Name
            </th>
            <th onClick={() => onSort('role')} className={sortBy === 'role' ? 'sorted' : ''}>
              Role
            </th>
            <th onClick={() => onSort('influence')} className={sortBy === 'influence' ? 'sorted' : ''}>
              Influence
            </th>
            <th onClick={() => onSort('interest')} className={sortBy === 'interest' ? 'sorted' : ''}>
              Interest
            </th>
            <th>Strategy</th>
            <th>Communication</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stakeholders.length === 0 ? (
            <tr>
              <td colSpan={7} className="empty-state">
                <GroupIcon style={{ fontSize: 48, opacity: 0.3 }} />
                <p>No stakeholders found</p>
              </td>
            </tr>
          ) : (
            stakeholders.map(s => {
              const influence = s.influence || 'Medium';
              const interest = s.interest || 'Medium';
              const infLevel = INFLUENCE_LEVELS[influence]?.value || 2;
              const intLevel = INTEREST_LEVELS[interest]?.value || 2;

              let quadrant;
              if (infLevel >= 2 && intLevel >= 2) quadrant = QUADRANTS['high-high'];
              else if (infLevel >= 2 && intLevel < 2) quadrant = QUADRANTS['high-low'];
              else if (infLevel < 2 && intLevel >= 2) quadrant = QUADRANTS['low-high'];
              else quadrant = QUADRANTS['low-low'];

              return (
                <tr key={s.id} onClick={() => onSelect(s)}>
                  <td className="name-cell">
                    <PersonIcon fontSize="small" style={{ color: quadrant.color }} />
                    <span>{s.name}</span>
                  </td>
                  <td>{s.role}</td>
                  <td>
                    <span
                      className="level-badge"
                      style={{ backgroundColor: INFLUENCE_LEVELS[influence]?.color }}
                    >
                      {influence}
                    </span>
                  </td>
                  <td>
                    <span
                      className="level-badge"
                      style={{ backgroundColor: INTEREST_LEVELS[interest]?.color }}
                    >
                      {interest}
                    </span>
                  </td>
                  <td>
                    <span
                      className="strategy-badge"
                      style={{ color: quadrant.color, backgroundColor: quadrant.bgColor }}
                    >
                      {quadrant.name}
                    </span>
                  </td>
                  <td>{s.communicationPreference || '-'}</td>
                  <td className="actions-cell">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(s); }}>
                      <EditIcon fontSize="small" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(s); }}>
                      <DeleteIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============ STAKEHOLDER FORM MODAL ============
function StakeholderFormModal({ stakeholder, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: stakeholder?.name || '',
    role: stakeholder?.role || '',
    description: stakeholder?.description || '',
    influence: stakeholder?.influence || 'Medium',
    interest: stakeholder?.interest || 'Medium',
    communicationPreference: stakeholder?.communicationPreference || '',
    email: stakeholder?.email || '',
    phone: stakeholder?.phone || '',
    organization: stakeholder?.organization || '',
    concerns: stakeholder?.concerns || [],
  });
  const [newConcern, setNewConcern] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddConcern = () => {
    if (newConcern.trim()) {
      setFormData(prev => ({
        ...prev,
        concerns: [...prev.concerns, newConcern.trim()]
      }));
      setNewConcern('');
    }
  };

  const handleRemoveConcern = (index) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...stakeholder,
      ...formData,
      artefactType: 'Stakeholder',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="stakeholder-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{stakeholder?.id ? 'Edit Stakeholder' : 'Add Stakeholder'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h4>Basic Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="Stakeholder name"
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  required
                  placeholder="e.g., Project Sponsor, End User"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of this stakeholder..."
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => handleChange('organization', e.target.value)}
                placeholder="Department or organization"
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Influence & Interest</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Influence Level</label>
                <select
                  value={formData.influence}
                  onChange={(e) => handleChange('influence', e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <span className="form-hint">Power to impact project decisions</span>
              </div>
              <div className="form-group">
                <label>Interest Level</label>
                <select
                  value={formData.interest}
                  onChange={(e) => handleChange('interest', e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <span className="form-hint">Level of interest in project outcomes</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Contact & Communication</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Communication Preference</label>
              <select
                value={formData.communicationPreference}
                onChange={(e) => handleChange('communicationPreference', e.target.value)}
              >
                <option value="">Select preference...</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="In-Person">In-Person Meetings</option>
                <option value="Video Call">Video Call</option>
                <option value="Slack/Teams">Slack/Teams</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h4>Key Concerns</h4>
            <div className="concerns-list">
              {formData.concerns.map((concern, index) => (
                <div key={index} className="concern-item">
                  <WarningIcon fontSize="small" />
                  <span>{concern}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveConcern(index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="add-concern">
              <input
                type="text"
                value={newConcern}
                onChange={(e) => setNewConcern(e.target.value)}
                placeholder="Add a concern..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddConcern())}
              />
              <button type="button" onClick={handleAddConcern}>
                <AddIcon fontSize="small" />
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {stakeholder?.id ? 'Save Changes' : 'Add Stakeholder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ MAIN STAKEHOLDER REGISTER ============
export default function StakeholderRegister({ onSelectArtefact }) {
  const { artefacts, createArtefact, updateArtefact, deleteArtefact, relationships } = useArtefacts();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'cards'
  const [filterRole, setFilterRole] = useState('all');
  const [filterInfluence, setFilterInfluence] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const gridContainerRef = useRef(null);

  // Get stakeholder artefacts
  const stakeholders = useMemo(() => {
    return artefacts.filter(a => a.artefactType === 'Stakeholder');
  }, [artefacts]);

  // Get unique roles for filter
  const roles = useMemo(() => {
    const roleSet = new Set(stakeholders.map(s => s.role).filter(Boolean));
    return Array.from(roleSet);
  }, [stakeholders]);

  // Filter and sort stakeholders
  const filteredStakeholders = useMemo(() => {
    let result = [...stakeholders];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name?.toLowerCase().includes(query) ||
        s.role?.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      result = result.filter(s => s.role === filterRole);
    }

    // Filter by influence
    if (filterInfluence !== 'all') {
      result = result.filter(s => s.influence === filterInfluence);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'role') return (a.role || '').localeCompare(b.role || '');
      if (sortBy === 'influence') {
        return (INFLUENCE_LEVELS[b.influence]?.value || 2) - (INFLUENCE_LEVELS[a.influence]?.value || 2);
      }
      if (sortBy === 'interest') {
        return (INTEREST_LEVELS[b.interest]?.value || 2) - (INTEREST_LEVELS[a.interest]?.value || 2);
      }
      return 0;
    });

    return result;
  }, [stakeholders, searchQuery, filterRole, filterInfluence, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = stakeholders.length;
    const keyPlayers = stakeholders.filter(s =>
      (INFLUENCE_LEVELS[s.influence]?.value || 2) >= 2 &&
      (INTEREST_LEVELS[s.interest]?.value || 2) >= 2
    ).length;
    const highInfluence = stakeholders.filter(s =>
      (INFLUENCE_LEVELS[s.influence]?.value || 2) >= 2
    ).length;
    const highInterest = stakeholders.filter(s =>
      (INTEREST_LEVELS[s.interest]?.value || 2) >= 2
    ).length;

    return { total, keyPlayers, highInfluence, highInterest };
  }, [stakeholders]);

  // Handlers
  const handleSelect = (stakeholder) => {
    if (onSelectArtefact) {
      onSelectArtefact(stakeholder);
    }
  };

  const handleEdit = (stakeholder) => {
    setEditingStakeholder(stakeholder);
    setShowFormModal(true);
  };

  const handleDelete = async (stakeholder) => {
    if (confirm(`Delete stakeholder "${stakeholder.name}"?`)) {
      await deleteArtefact(stakeholder.id);
    }
  };

  const handleSave = async (data) => {
    if (data.id) {
      await updateArtefact(data.id, data);
    } else {
      await createArtefact('Stakeholder', data);
    }
    setShowFormModal(false);
    setEditingStakeholder(null);
  };

  const handleAddNew = () => {
    setEditingStakeholder(null);
    setShowFormModal(true);
  };

  const handleGridDrop = async (stakeholder, updates) => {
    await updateArtefact(stakeholder.id, updates);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Role', 'Influence', 'Interest', 'Strategy', 'Communication', 'Concerns'];
    const rows = stakeholders.map(s => {
      const influence = s.influence || 'Medium';
      const interest = s.interest || 'Medium';
      const infLevel = INFLUENCE_LEVELS[influence]?.value || 2;
      const intLevel = INTEREST_LEVELS[interest]?.value || 2;

      let strategy;
      if (infLevel >= 2 && intLevel >= 2) strategy = 'Manage Closely';
      else if (infLevel >= 2 && intLevel < 2) strategy = 'Keep Satisfied';
      else if (infLevel < 2 && intLevel >= 2) strategy = 'Keep Informed';
      else strategy = 'Monitor';

      return [
        s.name,
        s.role,
        influence,
        interest,
        strategy,
        s.communicationPreference || '',
        (s.concerns || []).join('; ')
      ];
    });

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stakeholder-register.csv';
    a.click();
    setShowExportMenu(false);
  };

  // Export to Excel (XLSX)
  const handleExportExcel = () => {
    const headers = ['Name', 'Role', 'Influence', 'Interest', 'Strategy', 'Communication', 'Email', 'Phone', 'Organization', 'Concerns'];
    const rows = stakeholders.map(s => {
      const influence = s.influence || 'Medium';
      const interest = s.interest || 'Medium';
      const infLevel = INFLUENCE_LEVELS[influence]?.value || 2;
      const intLevel = INTEREST_LEVELS[interest]?.value || 2;

      let strategy;
      if (infLevel >= 2 && intLevel >= 2) strategy = 'Manage Closely';
      else if (infLevel >= 2 && intLevel < 2) strategy = 'Keep Satisfied';
      else if (infLevel < 2 && intLevel >= 2) strategy = 'Keep Informed';
      else strategy = 'Monitor';

      return [
        s.name,
        s.role,
        influence,
        interest,
        strategy,
        s.communicationPreference || '',
        s.email || '',
        s.phone || '',
        s.organization || '',
        (s.concerns || []).join('; ')
      ];
    });

    // Create workbook XML for Excel
    const escapeXml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xml += '<Worksheet ss:Name="Stakeholder Register">\n<Table>\n';

    // Header row
    xml += '<Row>\n';
    headers.forEach(h => {
      xml += `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
    });
    xml += '</Row>\n';

    // Data rows
    rows.forEach(row => {
      xml += '<Row>\n';
      row.forEach(cell => {
        xml += `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>\n`;
      });
      xml += '</Row>\n';
    });

    xml += '</Table>\n</Worksheet>\n</Workbook>';

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stakeholder-register.xls';
    a.click();
    setShowExportMenu(false);
  };

  // Export Power/Interest Grid as SVG Image
  const handleExportImage = () => {
    // Generate a clean SVG of the Power/Interest Grid
    const width = 800;
    const height = 600;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    text { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .title { font-size: 16px; font-weight: bold; fill: #1f2937; }
    .strategy { font-size: 11px; fill: #6b7280; font-style: italic; }
    .stakeholder { font-size: 12px; fill: #374151; }
    .axis-label { font-size: 12px; fill: #6b7280; font-weight: 600; }
  </style>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#ffffff"/>

  <!-- Title -->
  <text x="${width/2}" y="30" text-anchor="middle" style="font-size: 20px; font-weight: bold; fill: #111827;">Power/Interest Grid</text>

  <!-- Grid area -->
  ${generateGridSVG(stakeholders, width, height)}
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'power-interest-grid.svg';
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Generate SVG content for the grid
  const generateGridSVG = (stakeholdersList, width, height) => {
    const quadrantWidth = (width - 60) / 2;
    const quadrantHeight = (height - 80) / 2;
    const startX = 40;
    const startY = 40;

    const grouped = {
      'high-high': [], 'high-low': [], 'low-high': [], 'low-low': []
    };

    stakeholdersList.forEach(s => {
      const inf = INFLUENCE_LEVELS[s.influence]?.value || 2;
      const int = INTEREST_LEVELS[s.interest]?.value || 2;
      if (inf >= 2 && int >= 2) grouped['high-high'].push(s);
      else if (inf >= 2 && int < 2) grouped['high-low'].push(s);
      else if (inf < 2 && int >= 2) grouped['low-high'].push(s);
      else grouped['low-low'].push(s);
    });

    let svg = '';

    // Draw quadrants
    const quadrants = [
      { id: 'high-low', x: startX, y: startY, fill: '#fefce8', title: 'Keep Satisfied' },
      { id: 'high-high', x: startX + quadrantWidth, y: startY, fill: '#fef2f2', title: 'Manage Closely' },
      { id: 'low-low', x: startX, y: startY + quadrantHeight, fill: '#f9fafb', title: 'Monitor' },
      { id: 'low-high', x: startX + quadrantWidth, y: startY + quadrantHeight, fill: '#eff6ff', title: 'Keep Informed' },
    ];

    quadrants.forEach(q => {
      svg += `<rect x="${q.x}" y="${q.y}" width="${quadrantWidth}" height="${quadrantHeight}" fill="${q.fill}" class="quadrant"/>`;
      svg += `<text x="${q.x + 10}" y="${q.y + 20}" class="title">${q.title}</text>`;

      // Add stakeholder names
      grouped[q.id].forEach((s, i) => {
        svg += `<text x="${q.x + 15}" y="${q.y + 45 + i * 20}" class="stakeholder">• ${s.name}</text>`;
      });
    });

    // Axis labels
    svg += `<text x="15" y="${height / 2}" transform="rotate(-90, 15, ${height / 2})" font-size="12" fill="#6b7280">INFLUENCE</text>`;
    svg += `<text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#6b7280">INTEREST</text>`;

    return svg;
  };

  return (
    <div className="stakeholder-register">
      {/* Header */}
      <div className="register-header">
        <div className="header-title">
          <GroupIcon />
          <h2>Stakeholder Register</h2>
          <span className="subtitle">BABOK Stakeholder Analysis</span>
        </div>

        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat key-players">
            <StarIcon fontSize="small" />
            <span className="stat-value">{stats.keyPlayers}</span>
            <span className="stat-label">Key Players</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.highInfluence}</span>
            <span className="stat-label">High Influence</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.highInterest}</span>
            <span className="stat-label">High Interest</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="register-toolbar">
        <div className="toolbar-search">
          <input
            type="text"
            placeholder="Search stakeholders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar-filters">
          <div className="filter-group">
            <FilterListIcon fontSize="small" />
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select value={filterInfluence} onChange={(e) => setFilterInfluence(e.target.value)}>
              <option value="all">All Influence</option>
              <option value="High">High Influence</option>
              <option value="Medium">Medium Influence</option>
              <option value="Low">Low Influence</option>
            </select>
          </div>
        </div>

        <div className="toolbar-actions">
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Power/Interest Grid"
            >
              <GridViewIcon fontSize="small" />
            </button>
            <button
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <TableRowsIcon fontSize="small" />
            </button>
          </div>

          <div className="export-dropdown">
            <button className="export-btn" onClick={() => setShowExportMenu(!showExportMenu)}>
              <DownloadIcon fontSize="small" />
              Export
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button onClick={handleExportCSV}>
                  <TableChartIcon fontSize="small" />
                  Export as CSV
                </button>
                <button onClick={handleExportExcel}>
                  <TableChartIcon fontSize="small" />
                  Export as Excel
                </button>
                {viewMode === 'grid' && (
                  <button onClick={handleExportImage}>
                    <ImageIcon fontSize="small" />
                    Export Grid as Image
                  </button>
                )}
              </div>
            )}
          </div>

          <button className="add-btn" onClick={handleAddNew}>
            <AddIcon fontSize="small" />
            Add Stakeholder
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="register-content">
        {viewMode === 'grid' ? (
          <PowerInterestGrid
            stakeholders={filteredStakeholders}
            onSelect={handleSelect}
            onDrop={handleGridDrop}
            gridContainerRef={gridContainerRef}
          />
        ) : (
          <StakeholderTable
            stakeholders={filteredStakeholders}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortBy={sortBy}
            onSort={setSortBy}
          />
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <StakeholderFormModal
          stakeholder={editingStakeholder}
          onSave={handleSave}
          onClose={() => { setShowFormModal(false); setEditingStakeholder(null); }}
        />
      )}
    </div>
  );
}

export {
  StakeholderCard,
  PowerInterestGrid,
  StakeholderTable,
  StakeholderFormModal,
  INFLUENCE_LEVELS,
  INTEREST_LEVELS,
  QUADRANTS,
};
