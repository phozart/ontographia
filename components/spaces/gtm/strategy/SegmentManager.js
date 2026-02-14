// components/spaces/gtm/strategy/SegmentManager.js
// Manage market segments for GTM planning

import { useState } from 'react';
import { useGTM } from '../GTMContext';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';

export default function SegmentManager({ onSelect, onCreate }) {
  const { getArtefactsByType, createArtefact, updateArtefact, deleteArtefact } = useGTM();
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);

  const segments = getArtefactsByType('Segment');

  const handleCreate = () => {
    setEditingSegment(null);
    setShowModal(true);
  };

  const handleEdit = (segment) => {
    setEditingSegment(segment);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this segment?')) {
      await deleteArtefact(id);
    }
  };

  const handleSave = async (data) => {
    if (editingSegment) {
      await updateArtefact(editingSegment.id, data);
    } else {
      await createArtefact('Segment', data);
    }
    setShowModal(false);
    setEditingSegment(null);
  };

  // Priority matrix positioning
  const getPriorityMatrix = () => {
    const matrix = { high: [], medium: [], low: [] };
    segments.forEach(seg => {
      const priority = seg.priority || 2;
      if (priority === 1) matrix.high.push(seg);
      else if (priority === 2) matrix.medium.push(seg);
      else matrix.low.push(seg);
    });
    return matrix;
  };

  const priorityMatrix = getPriorityMatrix();

  return (
    <div className="gtm-segment-manager">
      <div className="gtm-segment-header">
        <div>
          <h2>Target Segments</h2>
          <p>Define and prioritize your target market segments</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <AddIcon fontSize="small" />
          Add Segment
        </button>
      </div>

      {segments.length === 0 ? (
        <div className="gtm-empty-state">
          <GroupIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Segments Defined</h3>
          <p>Start by defining your target market segments</p>
          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            Add First Segment
          </button>
        </div>
      ) : (
        <>
          {/* Priority Matrix View */}
          <div className="gtm-priority-matrix">
            <div className="gtm-priority-column priority-high">
              <div className="gtm-priority-header">
                <span className="gtm-priority-badge high">P1</span>
                <span>High Priority</span>
                <span className="gtm-priority-count">{priorityMatrix.high.length}</span>
              </div>
              <div className="gtm-priority-segments">
                {priorityMatrix.high.map(segment => (
                  <SegmentCard
                    key={segment.id}
                    segment={segment}
                    onSelect={onSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>

            <div className="gtm-priority-column priority-medium">
              <div className="gtm-priority-header">
                <span className="gtm-priority-badge medium">P2</span>
                <span>Medium Priority</span>
                <span className="gtm-priority-count">{priorityMatrix.medium.length}</span>
              </div>
              <div className="gtm-priority-segments">
                {priorityMatrix.medium.map(segment => (
                  <SegmentCard
                    key={segment.id}
                    segment={segment}
                    onSelect={onSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>

            <div className="gtm-priority-column priority-low">
              <div className="gtm-priority-header">
                <span className="gtm-priority-badge low">P3</span>
                <span>Lower Priority</span>
                <span className="gtm-priority-count">{priorityMatrix.low.length}</span>
              </div>
              <div className="gtm-priority-segments">
                {priorityMatrix.low.map(segment => (
                  <SegmentCard
                    key={segment.id}
                    segment={segment}
                    onSelect={onSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="gtm-segment-table-container">
            <h3>Segment Summary</h3>
            <table className="gtm-segment-table">
              <thead>
                <tr>
                  <th>Segment</th>
                  <th>Size</th>
                  <th>Geography</th>
                  <th>Industry</th>
                  <th>Attractiveness</th>
                  <th>Fit</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {segments.map(seg => (
                  <tr key={seg.id} onClick={() => onSelect?.(seg)}>
                    <td className="gtm-segment-name-cell">{seg.name}</td>
                    <td>{seg.demographics?.size || '—'}</td>
                    <td>{seg.demographics?.geography?.join(', ') || '—'}</td>
                    <td>{seg.demographics?.industry?.join(', ') || '—'}</td>
                    <td>
                      <span className={`gtm-rating rating-${seg.attractiveness || 'medium'}`}>
                        {seg.attractiveness || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <span className={`gtm-rating rating-${seg.fit || 'medium'}`}>
                        {seg.fit || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <span className={`gtm-priority-badge ${seg.priority === 1 ? 'high' : seg.priority === 3 ? 'low' : 'medium'}`}>
                        P{seg.priority || '?'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Segment Modal */}
      {showModal && (
        <SegmentModal
          segment={editingSegment}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingSegment(null);
          }}
        />
      )}
    </div>
  );
}

// Segment Card Component
function SegmentCard({ segment, onSelect, onEdit, onDelete }) {
  return (
    <div className="gtm-segment-card" onClick={() => onSelect?.(segment)}>
      <div className="gtm-segment-card-header">
        <h4>{segment.name}</h4>
        <div className="gtm-segment-card-actions" onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(segment)} title="Edit">
            <EditIcon fontSize="small" />
          </button>
          <button onClick={() => onDelete(segment.id)} title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>

      {segment.description && (
        <p className="gtm-segment-card-desc">{segment.description}</p>
      )}

      <div className="gtm-segment-card-meta">
        {segment.demographics?.size && (
          <span>
            <GroupIcon fontSize="small" />
            {segment.demographics.size}
          </span>
        )}
        {segment.demographics?.geography?.length > 0 && (
          <span>
            <LocationOnIcon fontSize="small" />
            {segment.demographics.geography.slice(0, 2).join(', ')}
          </span>
        )}
        {segment.demographics?.industry?.length > 0 && (
          <span>
            <BusinessIcon fontSize="small" />
            {segment.demographics.industry[0]}
          </span>
        )}
      </div>

      <div className="gtm-segment-card-ratings">
        <span className={`gtm-rating rating-${segment.attractiveness || 'medium'}`}>
          Attract: {segment.attractiveness || 'Med'}
        </span>
        <span className={`gtm-rating rating-${segment.fit || 'medium'}`}>
          Fit: {segment.fit || 'Med'}
        </span>
      </div>
    </div>
  );
}

// Segment Modal Component
function SegmentModal({ segment, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: segment?.name || '',
    description: segment?.description || '',
    demographics: {
      size: segment?.demographics?.size || '',
      geography: segment?.demographics?.geography || [],
      industry: segment?.demographics?.industry || []
    },
    needs: segment?.needs || [],
    pain_points: segment?.pain_points || [],
    buying_criteria: segment?.buying_criteria || [],
    attractiveness: segment?.attractiveness || 'medium',
    fit: segment?.fit || 'medium',
    priority: segment?.priority || 2,
    approach: segment?.approach || '',
    channels: segment?.channels || []
  });

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayInput = (field, value) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean);
    handleChange(field, items);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container gtm-segment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{segment ? 'Edit Segment' : 'Add Segment'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Segment Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Enterprise Finance Teams"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of this segment..."
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Market Size</label>
                <input
                  type="text"
                  value={formData.demographics.size}
                  onChange={(e) => handleChange('demographics.size', e.target.value)}
                  placeholder="e.g., 50,000 companies"
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                >
                  <option value={1}>P1 - High</option>
                  <option value={2}>P2 - Medium</option>
                  <option value={3}>P3 - Low</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Geography (comma-separated)</label>
              <input
                type="text"
                value={formData.demographics.geography.join(', ')}
                onChange={(e) => handleArrayInput('demographics.geography', e.target.value)}
                placeholder="e.g., UK, Germany, France"
              />
            </div>

            <div className="form-group">
              <label>Industries (comma-separated)</label>
              <input
                type="text"
                value={formData.demographics.industry.join(', ')}
                onChange={(e) => handleArrayInput('demographics.industry', e.target.value)}
                placeholder="e.g., Financial Services, Healthcare"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Attractiveness</label>
                <select
                  value={formData.attractiveness}
                  onChange={(e) => handleChange('attractiveness', e.target.value)}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fit</label>
                <select
                  value={formData.fit}
                  onChange={(e) => handleChange('fit', e.target.value)}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Approach</label>
              <textarea
                value={formData.approach}
                onChange={(e) => handleChange('approach', e.target.value)}
                placeholder="How will you approach this segment?"
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!formData.name}>
              {segment ? 'Update' : 'Create'} Segment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
