// components/ba/ReleasePlanning.js
// Agile Release Planning View
// Features: Release timeline, capacity planning, drag-drop assignment, status tracking

import { useState, useMemo, useCallback } from 'react';
import { useArtefacts, ARTEFACT_TYPES } from '../ArtefactContext';

// Release status definitions
const RELEASE_STATUS = {
  PLANNING: { id: 'Planning', label: 'Planning', color: '#6b7280' },
  READY: { id: 'Ready', label: 'Ready', color: '#3b82f6' },
  IN_PROGRESS: { id: 'InProgress', label: 'In Progress', color: '#f59e0b' },
  RELEASED: { id: 'Released', label: 'Released', color: '#22c55e' },
  CANCELLED: { id: 'Cancelled', label: 'Cancelled', color: '#ef4444' }
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Calculate days until date
const daysUntil = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  const diff = date - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Release Card Component
const ReleaseCard = ({ release, items, onEdit, onSelect, onDrop, isDragOver }) => {
  const status = RELEASE_STATUS[release.status] || RELEASE_STATUS.PLANNING;
  const daysLeft = daysUntil(release.targetDate);

  // Calculate totals
  const totalPoints = items.reduce((sum, item) => sum + (item.storyPoints || 0), 0);
  const capacity = release.capacity || 0;
  const capacityUsed = capacity > 0 ? Math.round((totalPoints / capacity) * 100) : 0;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      onDrop(itemId, release.id);
    }
  };

  return (
    <div
      className={`release-card ${isDragOver ? 'drag-over' : ''}`}
      style={{ borderTopColor: status.color }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="release-card-header">
        <div className="release-title-row">
          <h4>{release.name}</h4>
          <button className="btn-icon" onClick={() => onEdit(release)}>✏️</button>
        </div>
        <div className="release-meta">
          <span className="release-status" style={{ backgroundColor: status.color }}>
            {status.label}
          </span>
          {release.targetDate && (
            <span className={`release-date ${daysLeft !== null && daysLeft < 0 ? 'overdue' : daysLeft < 7 ? 'soon' : ''}`}>
              {formatDate(release.targetDate)}
              {daysLeft !== null && (
                <span className="days-left">
                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {capacity > 0 && (
        <div className="release-capacity">
          <div className="capacity-header">
            <span>Capacity: {totalPoints} / {capacity} pts</span>
            <span className={capacityUsed > 100 ? 'over-capacity' : ''}>{capacityUsed}%</span>
          </div>
          <div className="capacity-bar">
            <div
              className={`capacity-fill ${capacityUsed > 100 ? 'over' : capacityUsed > 80 ? 'warning' : ''}`}
              style={{ width: `${Math.min(capacityUsed, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="release-items">
        {items.length === 0 ? (
          <div className="release-empty">
            <p>Drag items here to assign to this release</p>
          </div>
        ) : (
          items.map(item => {
            const typeDef = ARTEFACT_TYPES[item.artefactType];
            return (
              <div
                key={item.id}
                className="release-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', item.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => onSelect(item)}
                style={{ borderLeftColor: typeDef?.color }}
              >
                <span className="item-type" style={{ backgroundColor: typeDef?.color }}>
                  {typeDef?.icon || '📋'}
                </span>
                <span className="item-name">{item.name}</span>
                {item.storyPoints && (
                  <span className="item-points">{item.storyPoints} pts</span>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="release-card-footer">
        <span className="items-count">{items.length} items</span>
        <span className="points-total">{totalPoints} points</span>
      </div>
    </div>
  );
};

// Timeline View
const TimelineView = ({ releases, itemsByRelease, onEdit, onSelect }) => {
  const sortedReleases = useMemo(() => {
    return [...releases].sort((a, b) => {
      if (!a.targetDate) return 1;
      if (!b.targetDate) return -1;
      return new Date(a.targetDate) - new Date(b.targetDate);
    });
  }, [releases]);

  return (
    <div className="release-timeline">
      <div className="timeline-line" />
      {sortedReleases.map((release, index) => {
        const status = RELEASE_STATUS[release.status] || RELEASE_STATUS.PLANNING;
        const items = itemsByRelease[release.id] || [];
        const totalPoints = items.reduce((sum, item) => sum + (item.storyPoints || 0), 0);

        return (
          <div key={release.id} className="timeline-item" onClick={() => onEdit(release)}>
            <div className="timeline-marker" style={{ backgroundColor: status.color }}>
              {index + 1}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <h4>{release.name}</h4>
                <span className="timeline-status" style={{ color: status.color }}>
                  {status.label}
                </span>
              </div>
              {release.targetDate && (
                <div className="timeline-date">{formatDate(release.targetDate)}</div>
              )}
              <div className="timeline-stats">
                <span>{items.length} items</span>
                <span>{totalPoints} points</span>
              </div>
              {release.description && (
                <p className="timeline-desc">{release.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Backlog Column (unassigned items)
const BacklogColumn = ({ items, onSelect }) => {
  return (
    <div className="backlog-column">
      <div className="backlog-header">
        <h4>Backlog</h4>
        <span className="backlog-count">{items.length} items</span>
      </div>
      <div className="backlog-items">
        {items.length === 0 ? (
          <div className="backlog-empty">
            <p>All items are assigned to releases</p>
          </div>
        ) : (
          items.map(item => {
            const typeDef = ARTEFACT_TYPES[item.artefactType];
            return (
              <div
                key={item.id}
                className="backlog-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', item.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => onSelect(item)}
                style={{ borderLeftColor: typeDef?.color }}
              >
                <span className="item-type" style={{ backgroundColor: typeDef?.color }}>
                  {typeDef?.icon || '📋'}
                </span>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-type-label">{typeDef?.name}</span>
                </div>
                {item.storyPoints && (
                  <span className="item-points">{item.storyPoints} pts</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Release Form Modal
const ReleaseFormModal = ({ release, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState(release || {
    name: '',
    description: '',
    status: 'Planning',
    targetDate: '',
    startDate: '',
    capacity: 0,
    goals: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Release name is required');
      return;
    }
    onSave({
      ...formData,
      id: formData.id || `rel-${Date.now()}`
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="release-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{release ? 'Edit Release' : 'New Release'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-body">
            <div className="form-group">
              <label>Release Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Release 1.0, Sprint 5, Q1 Milestone"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this release about?"
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {Object.entries(RELEASE_STATUS).map(([key, s]) => (
                    <option key={key} value={key}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Capacity (Story Points)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Target Date</label>
                <input
                  type="date"
                  value={formData.targetDate || ''}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Release Goals</label>
              <textarea
                value={formData.goals || ''}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                placeholder="Key objectives for this release..."
                rows={3}
              />
            </div>
          </div>

          <div className="modal-actions">
            {release && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => onDelete(release.id)}
              >
                Delete
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {release ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Summary Stats
const ReleaseSummary = ({ releases, allItems }) => {
  const stats = useMemo(() => {
    const totalReleases = releases.length;
    const totalItems = allItems.length;
    const totalPoints = allItems.reduce((sum, item) => sum + (item.storyPoints || 0), 0);
    const assignedItems = allItems.filter(i => i.releaseId).length;

    const byStatus = {};
    Object.keys(RELEASE_STATUS).forEach(k => { byStatus[k] = 0; });
    releases.forEach(r => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    });

    return {
      totalReleases,
      totalItems,
      totalPoints,
      assignedItems,
      unassigned: totalItems - assignedItems,
      byStatus
    };
  }, [releases, allItems]);

  return (
    <div className="release-summary">
      <div className="summary-card">
        <div className="summary-value">{stats.totalReleases}</div>
        <div className="summary-label">Releases</div>
      </div>
      <div className="summary-card">
        <div className="summary-value">{stats.totalItems}</div>
        <div className="summary-label">Total Items</div>
      </div>
      <div className="summary-card">
        <div className="summary-value">{stats.assignedItems}</div>
        <div className="summary-label">Assigned</div>
      </div>
      <div className="summary-card backlog">
        <div className="summary-value">{stats.unassigned}</div>
        <div className="summary-label">Backlog</div>
      </div>
      <div className="summary-card">
        <div className="summary-value">{stats.totalPoints}</div>
        <div className="summary-label">Total Points</div>
      </div>
      <div className="summary-card in-progress">
        <div className="summary-value">{stats.byStatus['InProgress'] || 0}</div>
        <div className="summary-label">In Progress</div>
      </div>
    </div>
  );
};

// Main Release Planning Component
export default function ReleasePlanning({ projectId }) {
  const { artefacts, createArtefact, updateArtefact, deleteArtefact } = useArtefacts();

  const [viewMode, setViewMode] = useState('board'); // board, timeline
  const [showModal, setShowModal] = useState(false);
  const [editingRelease, setEditingRelease] = useState(null);
  const [dragOverRelease, setDragOverRelease] = useState(null);

  // Get releases from artefacts
  const releases = useMemo(() => {
    return artefacts.filter(a => a.type === 'Release' && a.projectId === projectId);
  }, [artefacts, projectId]);

  // Get delivery items that can be assigned to releases
  const deliveryItems = useMemo(() => {
    const deliveryTypes = ['Epic', 'Feature', 'UserStory'];
    return artefacts.filter(a =>
      deliveryTypes.includes(a.artefactType) &&
      a.projectId === projectId
    );
  }, [artefacts, projectId]);

  // Group items by release
  const itemsByRelease = useMemo(() => {
    const grouped = {};
    releases.forEach(r => { grouped[r.id] = []; });

    deliveryItems.forEach(item => {
      if (item.releaseId && grouped[item.releaseId]) {
        grouped[item.releaseId].push(item);
      }
    });

    return grouped;
  }, [releases, deliveryItems]);

  // Get unassigned items (backlog)
  const backlogItems = useMemo(() => {
    const assignedIds = new Set(
      releases.flatMap(r => (itemsByRelease[r.id] || []).map(i => i.id))
    );
    return deliveryItems.filter(item => !item.releaseId || !assignedIds.has(item.id));
  }, [deliveryItems, releases, itemsByRelease]);

  // Handlers
  const handleSaveRelease = useCallback((releaseData) => {
    if (editingRelease) {
      updateArtefact(editingRelease.id, releaseData);
    } else {
      createArtefact({
        ...releaseData,
        type: 'Release',
        projectId
      });
    }
    setShowModal(false);
    setEditingRelease(null);
  }, [editingRelease, createArtefact, updateArtefact, projectId]);

  const handleDeleteRelease = useCallback((id) => {
    if (confirm('Are you sure you want to delete this release? Items will be moved to backlog.')) {
      // Unassign items from this release
      deliveryItems
        .filter(item => item.releaseId === id)
        .forEach(item => {
          updateArtefact(item.id, { ...item, releaseId: null });
        });
      deleteArtefact(id);
      setShowModal(false);
      setEditingRelease(null);
    }
  }, [deliveryItems, deleteArtefact, updateArtefact]);

  const handleEditRelease = useCallback((release) => {
    setEditingRelease(release);
    setShowModal(true);
  }, []);

  const handleSelectItem = useCallback((item) => {
    // Could open item detail or trigger callback
    console.log('Selected item:', item);
  }, []);

  const handleDropItem = useCallback((itemId, releaseId) => {
    const item = deliveryItems.find(i => i.id === itemId);
    if (item) {
      updateArtefact(itemId, { ...item, releaseId });
    }
    setDragOverRelease(null);
  }, [deliveryItems, updateArtefact]);

  const handleMoveToBacklog = useCallback((itemId) => {
    const item = deliveryItems.find(i => i.id === itemId);
    if (item) {
      updateArtefact(itemId, { ...item, releaseId: null });
    }
  }, [deliveryItems, updateArtefact]);

  return (
    <div className="release-planning-view">
      <div className="release-header">
        <div className="header-title">
          <h2>Release Planning</h2>
          <span className="subtitle">Organize delivery into releases</span>
        </div>
        <div className="header-actions">
          <button
            className={`view-toggle ${viewMode === 'board' ? 'active' : ''}`}
            onClick={() => setViewMode('board')}
          >
            Board
          </button>
          <button
            className={`view-toggle ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </button>
          <button className="btn-primary" onClick={() => { setEditingRelease(null); setShowModal(true); }}>
            + New Release
          </button>
        </div>
      </div>

      <ReleaseSummary releases={releases} allItems={deliveryItems} />

      <div className="release-content">
        {viewMode === 'board' ? (
          <div className="release-board">
            <BacklogColumn
              items={backlogItems}
              onSelect={handleSelectItem}
            />
            <div className="releases-container">
              {releases.length === 0 ? (
                <div className="no-releases">
                  <h3>No releases yet</h3>
                  <p>Create your first release to start planning.</p>
                  <button className="btn-primary" onClick={() => { setEditingRelease(null); setShowModal(true); }}>
                    + Create Release
                  </button>
                </div>
              ) : (
                releases.map(release => (
                  <ReleaseCard
                    key={release.id}
                    release={release}
                    items={itemsByRelease[release.id] || []}
                    onEdit={handleEditRelease}
                    onSelect={handleSelectItem}
                    onDrop={handleDropItem}
                    isDragOver={dragOverRelease === release.id}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <TimelineView
            releases={releases}
            itemsByRelease={itemsByRelease}
            onEdit={handleEditRelease}
            onSelect={handleSelectItem}
          />
        )}
      </div>

      {showModal && (
        <ReleaseFormModal
          release={editingRelease}
          onSave={handleSaveRelease}
          onClose={() => { setShowModal(false); setEditingRelease(null); }}
          onDelete={handleDeleteRelease}
        />
      )}
    </div>
  );
}

export { RELEASE_STATUS };
