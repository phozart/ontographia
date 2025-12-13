// components/ba/GapAnalysis.js
// BABOK Knowledge Area: Solution Assessment and Validation
// Features: Gap identification, Current vs Desired state, Gap closure tracking

import { useState, useMemo, useCallback } from 'react';
import { useArtefacts, ARTEFACT_TYPES } from '../ArtefactContext';

// Gap status definitions
const GAP_STATUS = {
  IDENTIFIED: { id: 'Identified', label: 'Identified', color: '#ef4444' },
  IN_PROGRESS: { id: 'InProgress', label: 'In Progress', color: '#f59e0b' },
  ADDRESSED: { id: 'Addressed', label: 'Addressed', color: '#22c55e' },
  DEFERRED: { id: 'Deferred', label: 'Deferred', color: '#6b7280' }
};

// Gap priority levels
const GAP_PRIORITY = {
  CRITICAL: { id: 'Critical', label: 'Critical', color: '#dc2626' },
  HIGH: { id: 'High', label: 'High', color: '#ef4444' },
  MEDIUM: { id: 'Medium', label: 'Medium', color: '#f59e0b' },
  LOW: { id: 'Low', label: 'Low', color: '#22c55e' }
};

// Gap category types
const GAP_CATEGORIES = {
  PROCESS: { id: 'Process', label: 'Process Gap', icon: '⚙️' },
  TECHNOLOGY: { id: 'Technology', label: 'Technology Gap', icon: '💻' },
  DATA: { id: 'Data', label: 'Data Gap', icon: '📊' },
  PEOPLE: { id: 'People', label: 'People/Skills Gap', icon: '👥' },
  POLICY: { id: 'Policy', label: 'Policy Gap', icon: '📋' },
  CAPABILITY: { id: 'Capability', label: 'Capability Gap', icon: '🎯' }
};

// Gap Card Component
const GapCard = ({ gap, requirements, onEdit, onSelect }) => {
  const status = GAP_STATUS[gap.status] || GAP_STATUS.IDENTIFIED;
  const priority = GAP_PRIORITY[gap.priority] || GAP_PRIORITY.MEDIUM;
  const category = GAP_CATEGORIES[gap.category] || GAP_CATEGORIES.PROCESS;
  const linkedReqs = requirements.filter(r => gap.addressedBy?.includes(r.id));

  // Calculate closure percentage
  const closurePercent = gap.closureProgress || 0;

  return (
    <div
      className="gap-card"
      onClick={() => onSelect(gap)}
      style={{ borderLeftColor: priority.color }}
    >
      <div className="gap-card-header">
        <span className="gap-category">
          {category.icon} {category.label}
        </span>
        <span
          className="gap-status"
          style={{ backgroundColor: status.color }}
        >
          {status.label}
        </span>
      </div>

      <h4 className="gap-title">{gap.name}</h4>

      <div className="gap-states">
        <div className="state-box current">
          <span className="state-label">Current State</span>
          <p>{gap.currentState || 'Not defined'}</p>
        </div>
        <div className="state-arrow">→</div>
        <div className="state-box desired">
          <span className="state-label">Desired State</span>
          <p>{gap.desiredState || 'Not defined'}</p>
        </div>
      </div>

      {gap.impact && (
        <div className="gap-impact">
          <span className="impact-label">Impact:</span>
          <span className="impact-text">{gap.impact}</span>
        </div>
      )}

      <div className="gap-progress">
        <div className="progress-header">
          <span>Closure Progress</span>
          <span>{closurePercent}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${closurePercent}%`, backgroundColor: status.color }}
          />
        </div>
      </div>

      <div className="gap-card-footer">
        <span
          className="gap-priority"
          style={{ color: priority.color }}
        >
          {priority.label} Priority
        </span>
        {linkedReqs.length > 0 && (
          <span className="gap-reqs">
            {linkedReqs.length} requirement{linkedReqs.length !== 1 ? 's' : ''} addressing
          </span>
        )}
      </div>
    </div>
  );
};

// Gap Table View
const GapTableView = ({ gaps, requirements, onEdit, onSelect }) => {
  return (
    <div className="gap-table-container">
      <table className="gap-table">
        <thead>
          <tr>
            <th>Gap</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Current State</th>
            <th>Desired State</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {gaps.map(gap => {
            const status = GAP_STATUS[gap.status] || GAP_STATUS.IDENTIFIED;
            const priority = GAP_PRIORITY[gap.priority] || GAP_PRIORITY.MEDIUM;
            const category = GAP_CATEGORIES[gap.category] || GAP_CATEGORIES.PROCESS;

            return (
              <tr key={gap.id} onClick={() => onSelect(gap)}>
                <td className="gap-name-cell">
                  <span className="gap-name">{gap.name}</span>
                </td>
                <td>
                  <span className="category-badge">
                    {category.icon} {category.label}
                  </span>
                </td>
                <td>
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: priority.color }}
                  >
                    {priority.label}
                  </span>
                </td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: status.color }}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="state-cell">{gap.currentState || '-'}</td>
                <td className="state-cell">{gap.desiredState || '-'}</td>
                <td>
                  <div className="progress-mini">
                    <div
                      className="progress-fill"
                      style={{ width: `${gap.closureProgress || 0}%` }}
                    />
                  </div>
                  <span className="progress-text">{gap.closureProgress || 0}%</span>
                </td>
                <td>
                  <button
                    className="btn-icon"
                    onClick={(e) => { e.stopPropagation(); onEdit(gap); }}
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Summary Statistics
const GapSummary = ({ gaps }) => {
  const stats = useMemo(() => {
    const total = gaps.length;
    const byStatus = {};
    const byPriority = {};
    let totalProgress = 0;

    Object.keys(GAP_STATUS).forEach(k => { byStatus[k] = 0; });
    Object.keys(GAP_PRIORITY).forEach(k => { byPriority[k] = 0; });

    gaps.forEach(g => {
      byStatus[g.status] = (byStatus[g.status] || 0) + 1;
      byPriority[g.priority] = (byPriority[g.priority] || 0) + 1;
      totalProgress += g.closureProgress || 0;
    });

    return {
      total,
      byStatus,
      byPriority,
      avgProgress: total > 0 ? Math.round(totalProgress / total) : 0,
      critical: byPriority['Critical'] || 0,
      addressed: byStatus['Addressed'] || 0
    };
  }, [gaps]);

  return (
    <div className="gap-summary">
      <div className="summary-card">
        <div className="summary-value">{stats.total}</div>
        <div className="summary-label">Total Gaps</div>
      </div>
      <div className="summary-card critical">
        <div className="summary-value">{stats.critical}</div>
        <div className="summary-label">Critical</div>
      </div>
      <div className="summary-card identified">
        <div className="summary-value">{stats.byStatus['Identified'] || 0}</div>
        <div className="summary-label">Identified</div>
      </div>
      <div className="summary-card in-progress">
        <div className="summary-value">{stats.byStatus['InProgress'] || 0}</div>
        <div className="summary-label">In Progress</div>
      </div>
      <div className="summary-card addressed">
        <div className="summary-value">{stats.addressed}</div>
        <div className="summary-label">Addressed</div>
      </div>
      <div className="summary-card progress">
        <div className="summary-value">{stats.avgProgress}%</div>
        <div className="summary-label">Avg Progress</div>
      </div>
    </div>
  );
};

// Gap Form Modal
const GapFormModal = ({ gap, requirements, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState(gap || {
    name: '',
    category: 'Process',
    priority: 'Medium',
    status: 'Identified',
    currentState: '',
    desiredState: '',
    impact: '',
    rootCause: '',
    closureProgress: 0,
    addressedBy: [],
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Gap name is required');
      return;
    }
    onSave({
      ...formData,
      id: formData.id || `gap-${Date.now()}`
    });
  };

  const toggleRequirement = (reqId) => {
    const current = formData.addressedBy || [];
    if (current.includes(reqId)) {
      setFormData({ ...formData, addressedBy: current.filter(id => id !== reqId) });
    } else {
      setFormData({ ...formData, addressedBy: [...current, reqId] });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="gap-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{gap ? 'Edit Gap' : 'New Gap'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-body">
            <div className="form-group">
              <label>Gap Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Describe the gap..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {Object.entries(GAP_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {Object.entries(GAP_PRIORITY).map(([key, p]) => (
                    <option key={key} value={key}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {Object.entries(GAP_STATUS).map(([key, s]) => (
                    <option key={key} value={key}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section">
              <h4>State Analysis</h4>
              <div className="form-group">
                <label>Current State</label>
                <textarea
                  value={formData.currentState}
                  onChange={(e) => setFormData({ ...formData, currentState: e.target.value })}
                  placeholder="Describe the current situation..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Desired State</label>
                <textarea
                  value={formData.desiredState}
                  onChange={(e) => setFormData({ ...formData, desiredState: e.target.value })}
                  placeholder="Describe the target situation..."
                  rows={3}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Business Impact</label>
                <textarea
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                  placeholder="What is the impact of this gap?"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Root Cause</label>
                <textarea
                  value={formData.rootCause}
                  onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                  placeholder="What is causing this gap?"
                  rows={2}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Closure Progress ({formData.closureProgress}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.closureProgress}
                onChange={(e) => setFormData({ ...formData, closureProgress: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-section">
              <h4>Addressed By Requirements</h4>
              <div className="requirements-checklist">
                {requirements.length === 0 ? (
                  <p className="no-reqs">No requirements available to link</p>
                ) : (
                  requirements.map(req => (
                    <label key={req.id} className="req-checkbox">
                      <input
                        type="checkbox"
                        checked={(formData.addressedBy || []).includes(req.id)}
                        onChange={() => toggleRequirement(req.id)}
                      />
                      <span className="req-name">{req.name || req.title}</span>
                      <span className="req-type">{req.artefactType}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>

          <div className="modal-actions">
            {gap && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => onDelete(gap.id)}
              >
                Delete
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {gap ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Gap Analysis Component
export default function GapAnalysis({ projectId }) {
  const { artefacts, createArtefact, updateArtefact, deleteArtefact } = useArtefacts();

  const [viewMode, setViewMode] = useState('cards'); // cards, table
  const [showModal, setShowModal] = useState(false);
  const [editingGap, setEditingGap] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Get gaps from artefacts
  const gaps = useMemo(() => {
    return artefacts.filter(a => a.type === 'Gap' && a.projectId === projectId);
  }, [artefacts, projectId]);

  // Get requirements for linking
  const requirements = useMemo(() => {
    const reqTypes = ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement',
                      'FunctionalRequirement', 'NonFunctionalRequirement'];
    return artefacts.filter(a => reqTypes.includes(a.type) && a.projectId === projectId);
  }, [artefacts, projectId]);

  // Filter gaps
  const filteredGaps = useMemo(() => {
    return gaps.filter(g => {
      if (filterCategory && g.category !== filterCategory) return false;
      if (filterStatus && g.status !== filterStatus) return false;
      if (filterPriority && g.priority !== filterPriority) return false;
      if (searchTerm && !g.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [gaps, filterCategory, filterStatus, filterPriority, searchTerm]);

  // Handlers
  const handleSave = useCallback((gapData) => {
    if (editingGap) {
      updateArtefact(editingGap.id, gapData);
    } else {
      createArtefact({
        ...gapData,
        type: 'Gap',
        projectId
      });
    }
    setShowModal(false);
    setEditingGap(null);
  }, [editingGap, createArtefact, updateArtefact, projectId]);

  const handleDelete = useCallback((id) => {
    if (confirm('Are you sure you want to delete this gap?')) {
      deleteArtefact(id);
      setShowModal(false);
      setEditingGap(null);
    }
  }, [deleteArtefact]);

  const handleEdit = useCallback((gap) => {
    setEditingGap(gap);
    setShowModal(true);
  }, []);

  const handleSelect = useCallback((gap) => {
    setEditingGap(gap);
    setShowModal(true);
  }, []);

  const handleExport = useCallback(() => {
    const headers = ['Name', 'Category', 'Priority', 'Status', 'Current State', 'Desired State', 'Impact', 'Progress'];
    const rows = filteredGaps.map(g => [
      `"${(g.name || '').replace(/"/g, '""')}"`,
      g.category || '',
      g.priority || '',
      g.status || '',
      `"${(g.currentState || '').replace(/"/g, '""')}"`,
      `"${(g.desiredState || '').replace(/"/g, '""')}"`,
      `"${(g.impact || '').replace(/"/g, '""')}"`,
      `${g.closureProgress || 0}%`
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gap-analysis.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredGaps]);

  const clearFilters = () => {
    setFilterCategory('');
    setFilterStatus('');
    setFilterPriority('');
    setSearchTerm('');
  };

  return (
    <div className="gap-analysis-view">
      <div className="gap-header">
        <div className="header-title">
          <h2>Gap Analysis</h2>
          <span className="subtitle">Current State vs Desired State</span>
        </div>
        <div className="header-actions">
          <button
            className={`view-toggle ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            Cards
          </button>
          <button
            className={`view-toggle ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
          <button className="btn-secondary" onClick={handleExport}>
            Export CSV
          </button>
          <button className="btn-primary" onClick={() => { setEditingGap(null); setShowModal(true); }}>
            + New Gap
          </button>
        </div>
      </div>

      <GapSummary gaps={gaps} />

      <div className="gap-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search gaps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {Object.entries(GAP_CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.entries(GAP_STATUS).map(([key, s]) => (
              <option key={key} value={key}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            {Object.entries(GAP_PRIORITY).map(([key, p]) => (
              <option key={key} value={key}>{p.label}</option>
            ))}
          </select>
        </div>
        {(filterCategory || filterStatus || filterPriority || searchTerm) && (
          <button className="btn-link" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      <div className="gap-content">
        {filteredGaps.length === 0 ? (
          <div className="gap-empty">
            <span className="empty-icon">🔍</span>
            <h3>No gaps found</h3>
            <p>Create a new gap to start tracking current vs desired state.</p>
            <button className="btn-primary" onClick={() => { setEditingGap(null); setShowModal(true); }}>
              + Create Gap
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="gap-cards-grid">
            {filteredGaps.map(gap => (
              <GapCard
                key={gap.id}
                gap={gap}
                requirements={requirements}
                onEdit={handleEdit}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ) : (
          <GapTableView
            gaps={filteredGaps}
            requirements={requirements}
            onEdit={handleEdit}
            onSelect={handleSelect}
          />
        )}
      </div>

      {showModal && (
        <GapFormModal
          gap={editingGap}
          requirements={requirements}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingGap(null); }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export { GAP_STATUS, GAP_PRIORITY, GAP_CATEGORIES };
