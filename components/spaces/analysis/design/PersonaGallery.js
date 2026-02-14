// components/spaces/analysis/design/PersonaGallery.js
// User Persona Gallery - Create and manage user personas for UX design

import { useState, useMemo } from 'react';
import { useAnalysis } from '../AnalysisContext';

// MUI Icons
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';

// ============ PERSONA CARD ============
function PersonaCard({ persona, onSelect, onEdit, onDelete }) {
  return (
    <div className="persona-card" onClick={() => onSelect(persona)}>
      <div className="persona-avatar" style={{ backgroundColor: persona.color || '#ec4899' }}>
        {persona.avatar ? (
          <img src={persona.avatar} alt={persona.name} />
        ) : (
          <PersonIcon style={{ fontSize: 48, color: 'white' }} />
        )}
      </div>

      <div className="persona-content">
        <h3 className="persona-name">{persona.name}</h3>
        <p className="persona-role">{persona.role || 'User'}</p>

        {persona.quote && (
          <blockquote className="persona-quote">"{persona.quote}"</blockquote>
        )}

        {persona.goals?.length > 0 && (
          <div className="persona-goals">
            <h4>Goals</h4>
            <ul>
              {persona.goals.slice(0, 3).map((goal, i) => (
                <li key={i}>{goal}</li>
              ))}
            </ul>
          </div>
        )}

        {persona.frustrations?.length > 0 && (
          <div className="persona-frustrations">
            <h4>Frustrations</h4>
            <ul>
              {persona.frustrations.slice(0, 2).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="persona-tags">
          {persona.segments?.map((segment, i) => (
            <span key={i} className="persona-tag">{segment}</span>
          ))}
        </div>
      </div>

      <div className="persona-actions">
        <button onClick={(e) => { e.stopPropagation(); onEdit(persona); }} title="Edit">
          <EditIcon fontSize="small" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(persona); }} title="Delete">
          <DeleteIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}

// ============ PERSONA FORM MODAL ============
function PersonaFormModal({ persona, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: persona?.name || '',
    role: persona?.role || '',
    description: persona?.description || '',
    quote: persona?.quote || '',
    age: persona?.age || '',
    occupation: persona?.occupation || '',
    goals: persona?.goals || [],
    frustrations: persona?.frustrations || [],
    behaviors: persona?.behaviors || [],
    segments: persona?.segments || [],
    technicalProficiency: persona?.technicalProficiency || 'Medium',
    color: persona?.color || '#ec4899'
  });

  const [newGoal, setNewGoal] = useState('');
  const [newFrustration, setNewFrustration] = useState('');
  const [newBehavior, setNewBehavior] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addListItem = (field, value, setValue) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const removeListItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...persona,
      ...formData,
      artefactType: 'Persona'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="persona-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{persona?.id ? 'Edit Persona' : 'Create Persona'}</h3>
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
                  placeholder="e.g., Sarah the Sales Manager"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  placeholder="e.g., Sales Manager"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief background about this persona..."
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Quote / Motto</label>
              <input
                type="text"
                value={formData.quote}
                onChange={(e) => handleChange('quote', e.target.value)}
                placeholder="A characteristic quote that represents this persona"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="e.g., 35-45"
                />
              </div>
              <div className="form-group">
                <label>Technical Proficiency</label>
                <select
                  value={formData.technicalProficiency}
                  onChange={(e) => handleChange('technicalProficiency', e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Goals</h4>
            <div className="list-items">
              {formData.goals.map((goal, i) => (
                <div key={i} className="list-item">
                  <span>{goal}</span>
                  <button type="button" onClick={() => removeListItem('goals', i)}>×</button>
                </div>
              ))}
            </div>
            <div className="add-list-item">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a goal..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('goals', newGoal, setNewGoal))}
              />
              <button type="button" onClick={() => addListItem('goals', newGoal, setNewGoal)}>
                <AddIcon fontSize="small" />
              </button>
            </div>
          </div>

          <div className="form-section">
            <h4>Frustrations / Pain Points</h4>
            <div className="list-items">
              {formData.frustrations.map((f, i) => (
                <div key={i} className="list-item frustration">
                  <span>{f}</span>
                  <button type="button" onClick={() => removeListItem('frustrations', i)}>×</button>
                </div>
              ))}
            </div>
            <div className="add-list-item">
              <input
                type="text"
                value={newFrustration}
                onChange={(e) => setNewFrustration(e.target.value)}
                placeholder="Add a frustration..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('frustrations', newFrustration, setNewFrustration))}
              />
              <button type="button" onClick={() => addListItem('frustrations', newFrustration, setNewFrustration)}>
                <AddIcon fontSize="small" />
              </button>
            </div>
          </div>

          <div className="form-section">
            <h4>Key Behaviors</h4>
            <div className="list-items">
              {formData.behaviors.map((b, i) => (
                <div key={i} className="list-item">
                  <span>{b}</span>
                  <button type="button" onClick={() => removeListItem('behaviors', i)}>×</button>
                </div>
              ))}
            </div>
            <div className="add-list-item">
              <input
                type="text"
                value={newBehavior}
                onChange={(e) => setNewBehavior(e.target.value)}
                placeholder="Add a behavior..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('behaviors', newBehavior, setNewBehavior))}
              />
              <button type="button" onClick={() => addListItem('behaviors', newBehavior, setNewBehavior)}>
                <AddIcon fontSize="small" />
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {persona?.id ? 'Save Changes' : 'Create Persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ MAIN PERSONA GALLERY ============
export default function PersonaGallery({ onSelect, onCreate }) {
  const { getArtefactsByType, createArtefact, updateArtefact, deleteArtefact } = useAnalysis();

  const [viewMode, setViewMode] = useState('grid');
  const [filterSegment, setFilterSegment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);

  const personas = useMemo(() => {
    return getArtefactsByType('Persona');
  }, [getArtefactsByType]);

  // Get unique segments
  const segments = useMemo(() => {
    const segSet = new Set();
    personas.forEach(p => p.segments?.forEach(s => segSet.add(s)));
    return Array.from(segSet);
  }, [personas]);

  // Filter personas
  const filteredPersonas = useMemo(() => {
    let result = personas;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.role?.toLowerCase().includes(query)
      );
    }

    if (filterSegment !== 'all') {
      result = result.filter(p => p.segments?.includes(filterSegment));
    }

    return result;
  }, [personas, searchQuery, filterSegment]);

  const handleEdit = (persona) => {
    setEditingPersona(persona);
    setShowFormModal(true);
  };

  const handleDelete = async (persona) => {
    if (confirm(`Delete persona "${persona.name}"?`)) {
      await deleteArtefact(persona.id);
    }
  };

  const handleSave = async (data) => {
    if (data.id) {
      await updateArtefact(data.id, data);
    } else {
      await createArtefact('Persona', data);
    }
    setShowFormModal(false);
    setEditingPersona(null);
  };

  const handleCreate = () => {
    setEditingPersona(null);
    setShowFormModal(true);
  };

  return (
    <div className="persona-gallery">
      {/* Toolbar */}
      <div className="gallery-toolbar">
        <div className="toolbar-search">
          <input
            type="text"
            placeholder="Search personas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar-filters">
          <FilterListIcon fontSize="small" />
          <select value={filterSegment} onChange={(e) => setFilterSegment(e.target.value)}>
            <option value="all">All Segments</option>
            {segments.map(seg => (
              <option key={seg} value={seg}>{seg}</option>
            ))}
          </select>
        </div>

        <div className="toolbar-actions">
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <GridViewIcon fontSize="small" />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <ViewListIcon fontSize="small" />
            </button>
          </div>

          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            Add Persona
          </button>
        </div>
      </div>

      {/* Gallery Content */}
      <div className={`gallery-content ${viewMode}`}>
        {filteredPersonas.length === 0 ? (
          <div className="gallery-empty">
            <PersonIcon style={{ fontSize: 64, opacity: 0.3 }} />
            <h3>No Personas Yet</h3>
            <p>Create user personas to understand your target users better.</p>
            <button className="btn-primary" onClick={handleCreate}>
              <AddIcon fontSize="small" />
              Create First Persona
            </button>
          </div>
        ) : (
          <div className="persona-grid">
            {filteredPersonas.map(persona => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onSelect={onSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <PersonaFormModal
          persona={editingPersona}
          onSave={handleSave}
          onClose={() => { setShowFormModal(false); setEditingPersona(null); }}
        />
      )}
    </div>
  );
}

export { PersonaCard, PersonaFormModal };
