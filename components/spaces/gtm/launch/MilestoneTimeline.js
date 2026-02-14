// components/spaces/gtm/launch/MilestoneTimeline.js
// Timeline view of launch milestones

import { useState } from 'react';
import { useGTM } from '../GTMContext';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import FlagIcon from '@mui/icons-material/Flag';
import TodayIcon from '@mui/icons-material/Today';

export default function MilestoneTimeline({ onSelect, onCreate }) {
  const { getArtefactsByType, createArtefact, updateArtefact, deleteArtefact, activeGTMPlan } = useGTM();
  const [showModal, setShowModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'list'

  const milestones = getArtefactsByType('Milestone')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  const today = new Date();
  const launchDate = activeGTMPlan?.launch?.launch_date ? new Date(activeGTMPlan.launch.launch_date) : null;

  const handleCreate = () => {
    setEditingMilestone(null);
    setShowModal(true);
  };

  const handleEdit = (milestone) => {
    setEditingMilestone(milestone);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this milestone?')) {
      await deleteArtefact(id);
    }
  };

  const handleSave = async (data) => {
    if (editingMilestone) {
      await updateArtefact(editingMilestone.id, data);
    } else {
      await createArtefact('Milestone', data);
    }
    setShowModal(false);
    setEditingMilestone(null);
  };

  const toggleMilestoneStatus = async (milestone) => {
    const newStatus = milestone.status === 'complete' ? 'pending' : 'complete';
    await updateArtefact(milestone.id, { status: newStatus });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getMilestoneStatus = (milestone) => {
    if (milestone.status === 'complete') return 'complete';
    const dueDate = new Date(milestone.due_date);
    if (dueDate < today) return 'overdue';
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (dueDate <= weekFromNow) return 'upcoming';
    return 'future';
  };

  // Group milestones by month for timeline
  const milestonesByMonth = milestones.reduce((acc, m) => {
    const date = new Date(m.due_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = { label, items: [] };
    acc[key].items.push(m);
    return acc;
  }, {});

  return (
    <div className="gtm-milestone-timeline">
      <div className="gtm-milestone-header">
        <div>
          <h2>Launch Milestones</h2>
          <p>Track key dates and deliverables leading to launch</p>
        </div>
        <div className="gtm-milestone-actions">
          <div className="gtm-view-toggle">
            <button
              className={viewMode === 'timeline' ? 'active' : ''}
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            Add Milestone
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="gtm-milestone-stats">
        <div className="gtm-stat">
          <span className="gtm-stat-value">
            {milestones.filter(m => m.status === 'complete').length}
          </span>
          <span className="gtm-stat-label">Completed</span>
        </div>
        <div className="gtm-stat">
          <span className="gtm-stat-value warning">
            {milestones.filter(m => getMilestoneStatus(m) === 'overdue').length}
          </span>
          <span className="gtm-stat-label">Overdue</span>
        </div>
        <div className="gtm-stat">
          <span className="gtm-stat-value">
            {milestones.filter(m => getMilestoneStatus(m) === 'upcoming').length}
          </span>
          <span className="gtm-stat-label">Due Soon</span>
        </div>
        <div className="gtm-stat">
          <span className="gtm-stat-value">{milestones.length}</span>
          <span className="gtm-stat-label">Total</span>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="gtm-empty-state">
          <FlagIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Milestones Yet</h3>
          <p>Define key milestones leading up to your launch</p>
          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            Create First Milestone
          </button>
        </div>
      ) : viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="gtm-timeline">
          {/* Today marker */}
          <div className="gtm-timeline-today">
            <TodayIcon fontSize="small" />
            <span>Today</span>
          </div>

          {Object.entries(milestonesByMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, { label, items }]) => (
              <div key={key} className="gtm-timeline-month">
                <div className="gtm-timeline-month-label">{label}</div>

                <div className="gtm-timeline-items">
                  {items.map(milestone => {
                    const status = getMilestoneStatus(milestone);
                    return (
                      <div
                        key={milestone.id}
                        className={`gtm-timeline-item status-${status}`}
                        onClick={() => onSelect?.(milestone)}
                      >
                        <div className="gtm-timeline-date">
                          {formatDate(milestone.due_date)}
                        </div>
                        <div className="gtm-timeline-marker">
                          <button
                            className="gtm-timeline-toggle"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMilestoneStatus(milestone);
                            }}
                          >
                            {milestone.status === 'complete' ? (
                              <CheckCircleIcon />
                            ) : (
                              <RadioButtonUncheckedIcon />
                            )}
                          </button>
                        </div>
                        <div className="gtm-timeline-content">
                          <span className="gtm-timeline-name">{milestone.name}</span>
                          {milestone.description && (
                            <span className="gtm-timeline-desc">{milestone.description}</span>
                          )}
                          {milestone.owner && (
                            <span className="gtm-timeline-owner">{milestone.owner}</span>
                          )}
                        </div>
                        <div
                          className="gtm-timeline-actions"
                          onClick={e => e.stopPropagation()}
                        >
                          <button onClick={() => handleEdit(milestone)}>
                            <EditIcon fontSize="small" />
                          </button>
                          <button onClick={() => handleDelete(milestone.id)}>
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          {/* Launch date marker */}
          {launchDate && (
            <div className="gtm-timeline-launch">
              <FlagIcon />
              <span>Launch: {formatDate(launchDate)}</span>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="gtm-milestone-list">
          <table className="gtm-milestone-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Milestone</th>
                <th>Due Date</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map(milestone => {
                const status = getMilestoneStatus(milestone);
                return (
                  <tr
                    key={milestone.id}
                    className={`status-${status}`}
                    onClick={() => onSelect?.(milestone)}
                  >
                    <td>
                      <button
                        className="gtm-status-toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMilestoneStatus(milestone);
                        }}
                      >
                        {milestone.status === 'complete' ? (
                          <CheckCircleIcon className="complete" />
                        ) : (
                          <RadioButtonUncheckedIcon />
                        )}
                      </button>
                    </td>
                    <td className="gtm-milestone-name-cell">
                      <span className="gtm-milestone-name">{milestone.name}</span>
                      {milestone.description && (
                        <span className="gtm-milestone-desc">{milestone.description}</span>
                      )}
                    </td>
                    <td className={`gtm-milestone-date-cell ${status}`}>
                      {formatDate(milestone.due_date)}
                    </td>
                    <td>{milestone.owner || '—'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleEdit(milestone)}>
                        <EditIcon fontSize="small" />
                      </button>
                      <button onClick={() => handleDelete(milestone.id)}>
                        <DeleteIcon fontSize="small" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Milestone Modal */}
      {showModal && (
        <MilestoneModal
          milestone={editingMilestone}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingMilestone(null);
          }}
        />
      )}
    </div>
  );
}

// Milestone Modal
function MilestoneModal({ milestone, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: milestone?.name || '',
    description: milestone?.description || '',
    due_date: milestone?.due_date || '',
    owner: milestone?.owner || '',
    status: milestone?.status || 'pending',
    category: milestone?.category || 'general'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const categories = [
    'general',
    'product',
    'marketing',
    'sales',
    'support',
    'operations'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container gtm-milestone-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{milestone ? 'Edit Milestone' : 'Add Milestone'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Milestone Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Marketing materials finalized"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="What needs to be accomplished?"
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Owner</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => handleChange('owner', e.target.value)}
                  placeholder="Who is responsible?"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="complete">Complete</option>
                </select>
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
              disabled={!formData.name || !formData.due_date}
            >
              {milestone ? 'Update' : 'Create'} Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
