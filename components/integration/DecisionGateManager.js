/**
 * Decision Gate Manager Component (P0)
 *
 * Configurable stage-gates with approval workflows for
 * cross-space transitions.
 */

import React, { useState, useEffect } from 'react';
import { useIntegration } from './IntegrationContext';

const GATE_TYPES = [
  { id: 'approval', name: 'Approval', description: 'Requires sign-off from approvers' },
  { id: 'review', name: 'Review', description: 'Review checkpoint, no blocking' },
  { id: 'checkpoint', name: 'Checkpoint', description: 'Verification point with criteria' },
  { id: 'milestone', name: 'Milestone', description: 'Major stage completion marker' }
];

const STAGES = [
  'Discovery', 'Analysis', 'Design', 'Implementation',
  'Testing', 'Review', 'Approved', 'Deployed'
];

function GateCard({ gate, onEdit, onToggle }) {
  const typeConfig = GATE_TYPES.find(t => t.id === gate.gate_type) || {};

  return (
    <div className={`gate-card ${gate.is_active ? '' : 'inactive'}`}>
      <div className="gate-header">
        <div className="gate-type-badge" data-type={gate.gate_type}>
          {typeConfig.name}
        </div>
        <button
          className="gate-toggle"
          onClick={() => onToggle(gate.id, !gate.is_active)}
        >
          {gate.is_active ? 'Active' : 'Inactive'}
        </button>
      </div>

      <h3 className="gate-name">{gate.name}</h3>

      {gate.description && (
        <p className="gate-description">{gate.description}</p>
      )}

      <div className="gate-flow">
        <span className="stage from">{gate.from_stage}</span>
        <span className="flow-arrow">&#8594;</span>
        <span className="stage to">{gate.to_stage}</span>
      </div>

      {(gate.from_space || gate.to_space) && (
        <div className="gate-spaces">
          {gate.from_space && <span className="space-badge">{gate.from_space}</span>}
          {gate.from_space && gate.to_space && <span>&#8594;</span>}
          {gate.to_space && <span className="space-badge">{gate.to_space}</span>}
        </div>
      )}

      <div className="gate-meta">
        {gate.min_approvers > 0 && (
          <span className="meta-item">
            &#128100; {gate.min_approvers} approver{gate.min_approvers > 1 ? 's' : ''}
          </span>
        )}
        {gate.timeout_days && (
          <span className="meta-item">
            &#9200; {gate.timeout_days} days
            {gate.auto_approve_on_timeout && ' (auto-approve)'}
          </span>
        )}
      </div>

      <button className="btn-secondary gate-edit" onClick={() => onEdit(gate)}>
        Configure
      </button>
    </div>
  );
}

function GateForm({ gate, onSave, onCancel }) {
  const [form, setForm] = useState(gate || {
    name: '',
    description: '',
    gate_type: 'approval',
    from_stage: 'Analysis',
    to_stage: 'Design',
    from_space: '',
    to_space: '',
    criteria: [],
    required_approvers: [],
    min_approvers: 1,
    timeout_days: null,
    auto_approve_on_timeout: false
  });

  const [newCriterion, setNewCriterion] = useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addCriterion = () => {
    if (newCriterion.trim()) {
      handleChange('criteria', [...(form.criteria || []), { text: newCriterion.trim(), required: true }]);
      setNewCriterion('');
    }
  };

  const removeCriterion = (index) => {
    handleChange('criteria', form.criteria.filter((_, i) => i !== index));
  };

  return (
    <div className="gate-form">
      <h2>{gate ? 'Edit Decision Gate' : 'Create Decision Gate'}</h2>

      <div className="form-group">
        <label>Gate Name *</label>
        <input
          type="text"
          className="input"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Design Approval Gate"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          className="input textarea"
          value={form.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="What this gate verifies..."
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Gate Type *</label>
          <select
            className="input select"
            value={form.gate_type}
            onChange={(e) => handleChange('gate_type', e.target.value)}
          >
            {GATE_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Min Approvers</label>
          <input
            type="number"
            className="input"
            value={form.min_approvers}
            onChange={(e) => handleChange('min_approvers', parseInt(e.target.value) || 1)}
            min="1"
            max="10"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>From Stage *</label>
          <select
            className="input select"
            value={form.from_stage}
            onChange={(e) => handleChange('from_stage', e.target.value)}
          >
            {STAGES.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>To Stage *</label>
          <select
            className="input select"
            value={form.to_stage}
            onChange={(e) => handleChange('to_stage', e.target.value)}
          >
            {STAGES.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>From Space (optional)</label>
          <input
            type="text"
            className="input"
            value={form.from_space || ''}
            onChange={(e) => handleChange('from_space', e.target.value)}
            placeholder="e.g., ba"
          />
        </div>

        <div className="form-group">
          <label>To Space (optional)</label>
          <input
            type="text"
            className="input"
            value={form.to_space || ''}
            onChange={(e) => handleChange('to_space', e.target.value)}
            placeholder="e.g., pds"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Criteria</label>
        <div className="criteria-list">
          {(form.criteria || []).map((criterion, idx) => (
            <div key={idx} className="criterion-item">
              <span>{criterion.text}</span>
              <button
                type="button"
                className="criterion-remove"
                onClick={() => removeCriterion(idx)}
              >
                &#10005;
              </button>
            </div>
          ))}
        </div>
        <div className="add-criterion">
          <input
            type="text"
            className="input"
            value={newCriterion}
            onChange={(e) => setNewCriterion(e.target.value)}
            placeholder="Add criterion..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCriterion())}
          />
          <button type="button" className="btn-secondary" onClick={addCriterion}>
            Add
          </button>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Timeout (days)</label>
          <input
            type="number"
            className="input"
            value={form.timeout_days || ''}
            onChange={(e) => handleChange('timeout_days', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="No timeout"
            min="1"
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.auto_approve_on_timeout}
              onChange={(e) => handleChange('auto_approve_on_timeout', e.target.checked)}
            />
            Auto-approve on timeout
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => onSave(form)}
          disabled={!form.name || !form.from_stage || !form.to_stage}
        >
          {gate ? 'Save Changes' : 'Create Gate'}
        </button>
      </div>
    </div>
  );
}

export default function DecisionGateManager() {
  const { gates, gatesLoading, fetchGates, createGate } = useIntegration();
  const [editingGate, setEditingGate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchGates();
  }, [fetchGates]);

  const handleSave = async (gateData) => {
    try {
      await createGate(gateData);
      setShowForm(false);
      setEditingGate(null);
    } catch (err) {
      console.error('Failed to save gate:', err);
    }
  };

  const handleEdit = (gate) => {
    setEditingGate(gate);
    setShowForm(true);
  };

  const handleToggle = async (gateId, isActive) => {
    // TODO: Implement gate toggle API
    console.log('Toggle gate', gateId, isActive);
  };

  const filteredGates = gates.filter(gate => {
    if (!filter) return true;
    return gate.gate_type === filter;
  });

  // Group gates by type
  const groupedGates = filteredGates.reduce((acc, gate) => {
    const type = gate.gate_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(gate);
    return acc;
  }, {});

  if (showForm) {
    return (
      <div className="gate-manager">
        <GateForm
          gate={editingGate}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingGate(null); }}
        />
      </div>
    );
  }

  return (
    <div className="gate-manager">
      <div className="manager-header">
        <div>
          <h1>Decision Gates</h1>
          <p className="header-subtitle">
            Configure stage-gates for cross-space transitions and approval workflows
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New Gate
        </button>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${!filter ? 'active' : ''}`}
          onClick={() => setFilter('')}
        >
          All ({gates.length})
        </button>
        {GATE_TYPES.map(type => (
          <button
            key={type.id}
            className={`filter-tab ${filter === type.id ? 'active' : ''}`}
            onClick={() => setFilter(type.id)}
          >
            {type.name} ({gates.filter(g => g.gate_type === type.id).length})
          </button>
        ))}
      </div>

      {gatesLoading && gates.length === 0 ? (
        <div className="loading-state">Loading gates...</div>
      ) : filteredGates.length === 0 ? (
        <div className="empty-state">
          <p>No decision gates configured yet.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Create Your First Gate
          </button>
        </div>
      ) : (
        <div className="gates-grid">
          {filteredGates.map(gate => (
            <GateCard
              key={gate.id}
              gate={gate}
              onEdit={handleEdit}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
