/**
 * Handoff Manager Component (P0)
 *
 * Templates and workflow for explicit handoffs between spaces.
 */

import React, { useState, useEffect } from 'react';
import { useIntegration } from './IntegrationContext';

// Handoff type templates with suggested deliverables and acceptance criteria
const HANDOFF_TEMPLATES = {
  initiate: {
    name: 'Initiate',
    description: 'Start a new work stream in a downstream space',
    defaultDeliverables: [
      'Business context document',
      'Initial requirements summary',
      'Stakeholder list',
      'Success criteria'
    ],
    defaultAcceptance: [
      'Context is sufficient to begin work',
      'Scope boundaries are clear',
      'Key stakeholders identified'
    ]
  },
  transition: {
    name: 'Transition',
    description: 'Hand over completed work to the next phase',
    defaultDeliverables: [
      'Completed artefacts',
      'Approval records',
      'Known issues/risks',
      'Handover notes'
    ],
    defaultAcceptance: [
      'All required artefacts complete',
      'Quality gate passed',
      'Open items documented'
    ]
  },
  escalate: {
    name: 'Escalate',
    description: 'Raise an issue requiring higher-level decision',
    defaultDeliverables: [
      'Issue description',
      'Impact analysis',
      'Options considered',
      'Recommendation'
    ],
    defaultAcceptance: [
      'Issue clearly articulated',
      'Options presented fairly',
      'Urgency understood'
    ]
  },
  return: {
    name: 'Return',
    description: 'Return work for rework or additional input',
    defaultDeliverables: [
      'Feedback document',
      'Specific changes required',
      'Reference materials'
    ],
    defaultAcceptance: [
      'Feedback is actionable',
      'Expected changes clear',
      'Timeline agreed'
    ]
  },
  complete: {
    name: 'Complete',
    description: 'Signal work is done and ready for closure',
    defaultDeliverables: [
      'Final deliverables',
      'Lessons learned',
      'Metrics/outcomes',
      'Archive reference'
    ],
    defaultAcceptance: [
      'All acceptance criteria met',
      'Stakeholder sign-off obtained',
      'Archive complete'
    ]
  }
};

const SPACE_OPTIONS = [
  { id: 'portfolio', name: 'Portfolio' },
  { id: 'ba', name: 'Business Analysis' },
  { id: 'ea', name: 'Enterprise Architecture' },
  { id: 'pdw', name: 'Product Design' },
  { id: 'pds', name: 'Project Design' },
  { id: 'dwd', name: 'Dynamic Work Design' },
  { id: 'als', name: 'Learning' }
];

const STATUS_BADGES = {
  pending: { bg: 'rgba(201, 162, 39, 0.12)', color: '#A68820', label: 'Pending' },
  in_progress: { bg: 'rgba(107, 138, 154, 0.12)', color: '#5B7A8A', label: 'In Progress' },
  completed: { bg: 'rgba(91, 138, 106, 0.12)', color: '#4A7358', label: 'Completed' },
  rejected: { bg: 'rgba(165, 77, 77, 0.12)', color: '#8F4343', label: 'Rejected' },
  cancelled: { bg: 'rgba(156, 154, 148, 0.12)', color: '#5C5A54', label: 'Cancelled' }
};

function HandoffCard({ handoff, onAccept, onReject }) {
  const statusStyle = STATUS_BADGES[handoff.status] || STATUS_BADGES.pending;
  const template = HANDOFF_TEMPLATES[handoff.handoff_type] || {};

  return (
    <div className="handoff-card">
      <div className="handoff-header">
        <span className="handoff-type">{template.name || handoff.handoff_type}</span>
        <span
          className="handoff-status"
          style={{ background: statusStyle.bg, color: statusStyle.color }}
        >
          {statusStyle.label}
        </span>
      </div>

      <div className="handoff-flow">
        <div className="flow-space from">
          <span className="space-label">From</span>
          <span className="space-name">
            {SPACE_OPTIONS.find(s => s.id === handoff.from_space)?.name || handoff.from_space}
          </span>
        </div>
        <span className="flow-arrow">&#8594;</span>
        <div className="flow-space to">
          <span className="space-label">To</span>
          <span className="space-name">
            {SPACE_OPTIONS.find(s => s.id === handoff.to_space)?.name || handoff.to_space}
          </span>
        </div>
      </div>

      {handoff.summary && (
        <p className="handoff-summary">{handoff.summary}</p>
      )}

      {handoff.deliverables && handoff.deliverables.length > 0 && (
        <div className="handoff-deliverables">
          <h4>Deliverables</h4>
          <ul>
            {handoff.deliverables.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="handoff-meta">
        <span>
          {new Date(handoff.created_at).toLocaleDateString()}
        </span>
        {handoff.handover_by && (
          <span>by {handoff.handover_by}</span>
        )}
      </div>

      {handoff.status === 'pending' && (
        <div className="handoff-actions">
          <button className="btn-secondary" onClick={() => onReject(handoff.id)}>
            Reject
          </button>
          <button className="btn-primary" onClick={() => onAccept(handoff.id)}>
            Accept
          </button>
        </div>
      )}
    </div>
  );
}

function HandoffForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    handoffType: 'transition',
    fromSpace: '',
    toSpace: '',
    summary: '',
    deliverables: [],
    acceptanceCriteria: []
  });

  const template = HANDOFF_TEMPLATES[form.handoffType];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const useTemplateDefaults = () => {
    if (template) {
      setForm(prev => ({
        ...prev,
        deliverables: [...template.defaultDeliverables],
        acceptanceCriteria: [...template.defaultAcceptance]
      }));
    }
  };

  const addItem = (field) => {
    const text = prompt(`Add ${field === 'deliverables' ? 'deliverable' : 'acceptance criterion'}:`);
    if (text) {
      handleChange(field, [...form[field], text]);
    }
  };

  const removeItem = (field, index) => {
    handleChange(field, form[field].filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="handoff-form" onSubmit={handleSubmit}>
      <h2>Create Handoff</h2>

      <div className="form-group">
        <label>Handoff Type *</label>
        <select
          className="input select"
          value={form.handoffType}
          onChange={(e) => handleChange('handoffType', e.target.value)}
        >
          {Object.entries(HANDOFF_TEMPLATES).map(([key, template]) => (
            <option key={key} value={key}>{template.name} - {template.description}</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>From Space *</label>
          <select
            className="input select"
            value={form.fromSpace}
            onChange={(e) => handleChange('fromSpace', e.target.value)}
          >
            <option value="">Select space...</option>
            {SPACE_OPTIONS.map(space => (
              <option key={space.id} value={space.id}>{space.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>To Space *</label>
          <select
            className="input select"
            value={form.toSpace}
            onChange={(e) => handleChange('toSpace', e.target.value)}
          >
            <option value="">Select space...</option>
            {SPACE_OPTIONS.filter(s => s.id !== form.fromSpace).map(space => (
              <option key={space.id} value={space.id}>{space.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Summary</label>
        <textarea
          className="input textarea"
          value={form.summary}
          onChange={(e) => handleChange('summary', e.target.value)}
          placeholder="Brief description of what's being handed off..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <div className="label-row">
          <label>Deliverables</label>
          <button type="button" className="btn-link" onClick={useTemplateDefaults}>
            Use template defaults
          </button>
        </div>
        <ul className="checklist">
          {form.deliverables.map((item, i) => (
            <li key={i}>
              <span>{item}</span>
              <button type="button" onClick={() => removeItem('deliverables', i)}>&#10005;</button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn-secondary btn-sm" onClick={() => addItem('deliverables')}>
          + Add Deliverable
        </button>
      </div>

      <div className="form-group">
        <label>Acceptance Criteria</label>
        <ul className="checklist">
          {form.acceptanceCriteria.map((item, i) => (
            <li key={i}>
              <span>{item}</span>
              <button type="button" onClick={() => removeItem('acceptanceCriteria', i)}>&#10005;</button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn-secondary btn-sm" onClick={() => addItem('acceptanceCriteria')}>
          + Add Criterion
        </button>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={!form.fromSpace || !form.toSpace}
        >
          Create Handoff
        </button>
      </div>
    </form>
  );
}

export default function HandoffManager() {
  const {
    handoffs,
    handoffsLoading,
    pendingHandoffs,
    fetchHandoffs,
    createHandoff,
    updateHandoff
  } = useIntegration();

  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchHandoffs();
  }, [fetchHandoffs]);

  const handleSubmit = async (formData) => {
    try {
      await createHandoff({
        fromSpace: formData.fromSpace,
        toSpace: formData.toSpace,
        handoffType: formData.handoffType,
        summary: formData.summary,
        deliverables: formData.deliverables,
        acceptanceCriteria: formData.acceptanceCriteria
      });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create handoff:', err);
    }
  };

  const handleAccept = async (id) => {
    await updateHandoff(id, 'accept');
  };

  const handleReject = async (id) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      await updateHandoff(id, 'reject', reason);
    }
  };

  const filteredHandoffs = handoffs.filter(h => {
    if (filter === 'pending') return h.status === 'pending';
    if (filter === 'completed') return h.status === 'completed';
    return true;
  });

  if (showForm) {
    return (
      <div className="handoff-manager">
        <HandoffForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="handoff-manager">
      <div className="manager-header">
        <div>
          <h1>Handoffs</h1>
          <p className="header-subtitle">
            Manage transitions between spaces with explicit handoff documentation
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New Handoff
        </button>
      </div>

      {pendingHandoffs.length > 0 && (
        <div className="pending-alert">
          <span className="alert-icon">&#9888;</span>
          <span>You have {pendingHandoffs.length} pending handoff{pendingHandoffs.length > 1 ? 's' : ''} requiring action</span>
        </div>
      )}

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({handoffs.length})
        </button>
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({handoffs.filter(h => h.status === 'pending').length})
        </button>
        <button
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({handoffs.filter(h => h.status === 'completed').length})
        </button>
      </div>

      {handoffsLoading && handoffs.length === 0 ? (
        <div className="loading-state">Loading handoffs...</div>
      ) : filteredHandoffs.length === 0 ? (
        <div className="empty-state">
          <p>No handoffs found.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Create Your First Handoff
          </button>
        </div>
      ) : (
        <div className="handoffs-list">
          {filteredHandoffs.map(handoff => (
            <HandoffCard
              key={handoff.id}
              handoff={handoff}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
