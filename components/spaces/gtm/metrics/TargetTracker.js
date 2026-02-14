// components/spaces/gtm/metrics/TargetTracker.js
// Track progress against GTM targets

import { useState } from 'react';
import { useGTM } from '../GTMContext';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TargetIcon from '@mui/icons-material/TrackChanges';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

export default function TargetTracker({ onSelect, onCreate }) {
  const { getArtefactsByType, createArtefact, updateArtefact, deleteArtefact } = useGTM();
  const [showModal, setShowModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const targets = getArtefactsByType('Target');

  // Get unique categories
  const categories = ['all', ...new Set(targets.map(t => t.category).filter(Boolean))];

  // Filter targets
  const filteredTargets = filterCategory === 'all'
    ? targets
    : targets.filter(t => t.category === filterCategory);

  // Group by status
  const getTargetStatus = (target) => {
    if (!target.target_value || !target.actual_value) return 'no-data';
    const percent = (target.actual_value / target.target_value) * 100;
    if (percent >= 100) return 'achieved';
    if (percent >= 80) return 'on-track';
    if (percent >= 50) return 'behind';
    return 'at-risk';
  };

  const handleCreate = () => {
    setEditingTarget(null);
    setShowModal(true);
  };

  const handleEdit = (target) => {
    setEditingTarget(target);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this target?')) {
      await deleteArtefact(id);
    }
  };

  const handleSave = async (data) => {
    if (editingTarget) {
      await updateArtefact(editingTarget.id, data);
    } else {
      await createArtefact('Target', data);
    }
    setShowModal(false);
    setEditingTarget(null);
  };

  const handleUpdateActual = async (target, newValue) => {
    await updateArtefact(target.id, { actual_value: parseFloat(newValue) || 0 });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'achieved': return <CheckCircleIcon className="status-achieved" />;
      case 'on-track': return <CheckCircleIcon className="status-on-track" />;
      case 'behind': return <WarningIcon className="status-behind" />;
      case 'at-risk': return <ErrorIcon className="status-at-risk" />;
      default: return null;
    }
  };

  // Stats
  const stats = {
    total: targets.length,
    achieved: targets.filter(t => getTargetStatus(t) === 'achieved').length,
    onTrack: targets.filter(t => getTargetStatus(t) === 'on-track').length,
    behind: targets.filter(t => getTargetStatus(t) === 'behind').length,
    atRisk: targets.filter(t => getTargetStatus(t) === 'at-risk').length
  };

  return (
    <div className="gtm-target-tracker">
      <div className="gtm-target-header">
        <div>
          <h2>Target Tracker</h2>
          <p>Monitor progress against your GTM targets</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <AddIcon fontSize="small" />
          Add Target
        </button>
      </div>

      {/* Stats */}
      <div className="gtm-target-stats">
        <div className="gtm-stat achieved">
          <span className="gtm-stat-value">{stats.achieved}</span>
          <span className="gtm-stat-label">Achieved</span>
        </div>
        <div className="gtm-stat on-track">
          <span className="gtm-stat-value">{stats.onTrack}</span>
          <span className="gtm-stat-label">On Track</span>
        </div>
        <div className="gtm-stat behind">
          <span className="gtm-stat-value">{stats.behind}</span>
          <span className="gtm-stat-label">Behind</span>
        </div>
        <div className="gtm-stat at-risk">
          <span className="gtm-stat-value">{stats.atRisk}</span>
          <span className="gtm-stat-label">At Risk</span>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="gtm-target-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`gtm-filter-btn ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat === 'all' ? 'All Targets' : cat}
            </button>
          ))}
        </div>
      )}

      {targets.length === 0 ? (
        <div className="gtm-empty-state">
          <TargetIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Targets Set</h3>
          <p>Define targets to track your GTM progress</p>
          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            Create First Target
          </button>
        </div>
      ) : (
        <div className="gtm-targets-list">
          {filteredTargets.map(target => {
            const status = getTargetStatus(target);
            const progress = target.target_value > 0
              ? Math.round((target.actual_value || 0) / target.target_value * 100)
              : 0;

            return (
              <div
                key={target.id}
                className={`gtm-target-card status-${status}`}
                onClick={() => onSelect?.(target)}
              >
                <div className="gtm-target-card-header">
                  {getStatusIcon(status)}
                  <span className="gtm-target-name">{target.name}</span>
                  {target.category && (
                    <span className="gtm-target-category">{target.category}</span>
                  )}
                  <div className="gtm-target-actions" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleEdit(target)} title="Edit">
                      <EditIcon fontSize="small" />
                    </button>
                    <button onClick={() => handleDelete(target.id)} title="Delete">
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>

                <div className="gtm-target-progress">
                  <div className="gtm-target-values">
                    <div className="gtm-target-actual" onClick={e => e.stopPropagation()}>
                      <label>Actual:</label>
                      <input
                        type="number"
                        value={target.actual_value || ''}
                        onChange={(e) => handleUpdateActual(target, e.target.value)}
                        placeholder="0"
                      />
                      {target.suffix && <span>{target.suffix}</span>}
                    </div>
                    <div className="gtm-target-target">
                      <label>Target:</label>
                      <span>
                        {target.prefix}{target.target_value?.toLocaleString()}{target.suffix}
                      </span>
                    </div>
                  </div>

                  <div className="gtm-target-bar">
                    <div
                      className="gtm-target-fill"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: status === 'achieved' ? '#5B8A6A' :
                                        status === 'on-track' ? '#5B8A6A' :
                                        status === 'behind' ? '#C9A227' : '#A54D4D'
                      }}
                    />
                  </div>
                  <span className="gtm-target-percent">{progress}%</span>
                </div>

                {target.description && (
                  <p className="gtm-target-desc">{target.description}</p>
                )}

                <div className="gtm-target-meta">
                  {target.owner && (
                    <span className="gtm-target-owner">Owner: {target.owner}</span>
                  )}
                  {target.due_date && (
                    <span className="gtm-target-due">
                      Due: {new Date(target.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Target Modal */}
      {showModal && (
        <TargetModal
          target={editingTarget}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingTarget(null);
          }}
        />
      )}
    </div>
  );
}

// Target Modal
function TargetModal({ target, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: target?.name || '',
    description: target?.description || '',
    category: target?.category || '',
    target_value: target?.target_value || '',
    actual_value: target?.actual_value || '',
    prefix: target?.prefix || '',
    suffix: target?.suffix || '',
    owner: target?.owner || '',
    due_date: target?.due_date || ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      target_value: formData.target_value ? parseFloat(formData.target_value) : null,
      actual_value: formData.actual_value ? parseFloat(formData.actual_value) : null
    });
  };

  const commonCategories = [
    'Revenue',
    'Pipeline',
    'Leads',
    'Conversions',
    'Awareness',
    'Engagement',
    'Retention',
    'Satisfaction'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container gtm-target-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{target ? 'Edit Target' : 'Create Target'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Target Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Q1 Lead Generation"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="What does this target measure?"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="e.g., Leads"
                list="target-categories"
              />
              <datalist id="target-categories">
                {commonCategories.map(cat => <option key={cat} value={cat} />)}
              </datalist>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Value *</label>
                <input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => handleChange('target_value', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Current Value</label>
                <input
                  type="number"
                  value={formData.actual_value}
                  onChange={(e) => handleChange('actual_value', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Prefix (e.g., $)</label>
                <input
                  type="text"
                  value={formData.prefix}
                  onChange={(e) => handleChange('prefix', e.target.value)}
                  placeholder="$"
                  maxLength={5}
                />
              </div>

              <div className="form-group">
                <label>Suffix (e.g., %)</label>
                <input
                  type="text"
                  value={formData.suffix}
                  onChange={(e) => handleChange('suffix', e.target.value)}
                  placeholder="%"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Owner</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => handleChange('owner', e.target.value)}
                  placeholder="Who owns this target?"
                />
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!formData.name || !formData.target_value}
            >
              {target ? 'Update' : 'Create'} Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
