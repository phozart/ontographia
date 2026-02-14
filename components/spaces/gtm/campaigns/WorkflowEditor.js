// components/spaces/gtm/campaigns/WorkflowEditor.js
// Campaign automation workflow builder

import { useState, useMemo, useCallback } from 'react';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TuneIcon from '@mui/icons-material/Tune';

const TRIGGER_TYPES = {
  metric_threshold: {
    key: 'metric_threshold',
    label: 'Metric Threshold',
    icon: TuneIcon,
    description: 'When a metric crosses a threshold'
  },
  schedule: {
    key: 'schedule',
    label: 'Schedule',
    icon: ScheduleIcon,
    description: 'At a specific time or interval'
  },
  campaign_status: {
    key: 'campaign_status',
    label: 'Campaign Status',
    icon: PlayArrowIcon,
    description: 'When campaign status changes'
  },
  budget_threshold: {
    key: 'budget_threshold',
    label: 'Budget Threshold',
    icon: TuneIcon,
    description: 'When budget reaches a level'
  }
};

const ACTION_TYPES = {
  send_alert: {
    key: 'send_alert',
    label: 'Send Alert',
    icon: NotificationsIcon,
    description: 'Send notification to team'
  },
  send_email: {
    key: 'send_email',
    label: 'Send Email',
    icon: EmailIcon,
    description: 'Send email report'
  },
  pause_campaign: {
    key: 'pause_campaign',
    label: 'Pause Campaign',
    icon: PauseIcon,
    description: 'Pause the campaign'
  },
  adjust_budget: {
    key: 'adjust_budget',
    label: 'Adjust Budget',
    icon: TuneIcon,
    description: 'Increase or decrease budget'
  },
  create_task: {
    key: 'create_task',
    label: 'Create Task',
    icon: AddIcon,
    description: 'Create a follow-up task'
  }
};

const METRIC_OPTIONS = [
  { value: 'ctr', label: 'Click-Through Rate (CTR)' },
  { value: 'cpc', label: 'Cost Per Click (CPC)' },
  { value: 'cpa', label: 'Cost Per Acquisition (CPA)' },
  { value: 'roas', label: 'Return on Ad Spend (ROAS)' },
  { value: 'conversions', label: 'Conversions' },
  { value: 'impressions', label: 'Impressions' },
  { value: 'spend', label: 'Total Spend' }
];

const COMPARISON_OPTIONS = [
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'equals', label: 'Equals' },
  { value: 'changes_by', label: 'Changes by (%)' }
];

// Workflow card component
function WorkflowCard({ workflow, onEdit, onToggle, onDuplicate, onDelete }) {
  const TriggerIcon = TRIGGER_TYPES[workflow.trigger?.type]?.icon || TuneIcon;
  const ActionIcon = ACTION_TYPES[workflow.actions?.[0]?.type]?.icon || NotificationsIcon;

  return (
    <div className={`workflow-card ${workflow.enabled ? 'enabled' : 'disabled'}`}>
      <div className="workflow-card-header">
        <div className="workflow-card-status">
          {workflow.enabled ? (
            <CheckCircleIcon className="status-icon active" />
          ) : (
            <PauseIcon className="status-icon paused" />
          )}
          <span className="workflow-card-name">{workflow.name}</span>
        </div>
        <div className="workflow-card-actions">
          <button className="workflow-action-btn" onClick={() => onToggle(workflow.id)}>
            {workflow.enabled ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </button>
          <button className="workflow-action-btn" onClick={() => onEdit(workflow)}>
            <EditIcon fontSize="small" />
          </button>
          <button className="workflow-action-btn" onClick={() => onDuplicate(workflow)}>
            <ContentCopyIcon fontSize="small" />
          </button>
          <button className="workflow-action-btn danger" onClick={() => onDelete(workflow.id)}>
            <DeleteOutlineIcon fontSize="small" />
          </button>
        </div>
      </div>
      <div className="workflow-card-flow">
        <div className="workflow-trigger">
          <TriggerIcon fontSize="small" />
          <span>{TRIGGER_TYPES[workflow.trigger?.type]?.label || 'Trigger'}</span>
        </div>
        <div className="workflow-arrow">→</div>
        <div className="workflow-action">
          <ActionIcon fontSize="small" />
          <span>
            {workflow.actions?.length || 0} action{workflow.actions?.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      {workflow.lastTriggered && (
        <div className="workflow-card-meta">
          Last triggered: {new Date(workflow.lastTriggered).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

// Workflow editor modal
function WorkflowModal({ workflow, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
    enabled: workflow?.enabled ?? true,
    trigger: workflow?.trigger || { type: 'metric_threshold', config: {} },
    conditions: workflow?.conditions || [],
    actions: workflow?.actions || [{ type: 'send_alert', config: {} }]
  });

  const handleTriggerChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      trigger: {
        ...prev.trigger,
        [field]: value,
        config: field === 'type' ? {} : prev.trigger.config
      }
    }));
  };

  const handleTriggerConfigChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      trigger: {
        ...prev.trigger,
        config: { ...prev.trigger.config, [field]: value }
      }
    }));
  };

  const handleActionChange = (index, field, value) => {
    setFormData(prev => {
      const newActions = [...prev.actions];
      if (field === 'type') {
        newActions[index] = { type: value, config: {} };
      } else {
        newActions[index] = {
          ...newActions[index],
          config: { ...newActions[index].config, [field]: value }
        };
      }
      return { ...prev, actions: newActions };
    });
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: 'send_alert', config: {} }]
    }));
  };

  const removeAction = (index) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave({
      ...workflow,
      ...formData,
      id: workflow?.id || `wf-${Date.now()}`
    });
  };

  return (
    <div className="workflow-modal-overlay" onClick={onClose}>
      <div className="workflow-modal" onClick={e => e.stopPropagation()}>
        <div className="workflow-modal-header">
          <h3>{workflow ? 'Edit Workflow' : 'Create Workflow'}</h3>
          <button className="workflow-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="workflow-modal-content">
          {/* Basic info */}
          <div className="workflow-section">
            <label className="workflow-label">Workflow Name</label>
            <input
              type="text"
              className="workflow-input"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Pause low-performing campaigns"
            />
          </div>

          <div className="workflow-section">
            <label className="workflow-label">Description (optional)</label>
            <textarea
              className="workflow-textarea"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What does this workflow do?"
              rows={2}
            />
          </div>

          {/* Trigger */}
          <div className="workflow-section">
            <label className="workflow-label">
              <ScheduleIcon fontSize="small" />
              When this happens (Trigger)
            </label>
            <select
              className="workflow-select"
              value={formData.trigger.type}
              onChange={(e) => handleTriggerChange('type', e.target.value)}
            >
              {Object.values(TRIGGER_TYPES).map(trigger => (
                <option key={trigger.key} value={trigger.key}>
                  {trigger.label} — {trigger.description}
                </option>
              ))}
            </select>

            {/* Trigger config based on type */}
            {formData.trigger.type === 'metric_threshold' && (
              <div className="workflow-trigger-config">
                <select
                  className="workflow-select"
                  value={formData.trigger.config.metric || ''}
                  onChange={(e) => handleTriggerConfigChange('metric', e.target.value)}
                >
                  <option value="">Select metric...</option>
                  {METRIC_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  className="workflow-select small"
                  value={formData.trigger.config.comparison || ''}
                  onChange={(e) => handleTriggerConfigChange('comparison', e.target.value)}
                >
                  <option value="">Comparison...</option>
                  {COMPARISON_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="workflow-input small"
                  value={formData.trigger.config.value || ''}
                  onChange={(e) => handleTriggerConfigChange('value', e.target.value)}
                  placeholder="Value"
                />
              </div>
            )}

            {formData.trigger.type === 'schedule' && (
              <div className="workflow-trigger-config">
                <select
                  className="workflow-select"
                  value={formData.trigger.config.frequency || ''}
                  onChange={(e) => handleTriggerConfigChange('frequency', e.target.value)}
                >
                  <option value="">Select frequency...</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                {formData.trigger.config.frequency === 'daily' && (
                  <input
                    type="time"
                    className="workflow-input small"
                    value={formData.trigger.config.time || '09:00'}
                    onChange={(e) => handleTriggerConfigChange('time', e.target.value)}
                  />
                )}
              </div>
            )}

            {formData.trigger.type === 'budget_threshold' && (
              <div className="workflow-trigger-config">
                <select
                  className="workflow-select"
                  value={formData.trigger.config.condition || ''}
                  onChange={(e) => handleTriggerConfigChange('condition', e.target.value)}
                >
                  <option value="">Select condition...</option>
                  <option value="reaches_percent">Reaches % of budget</option>
                  <option value="exceeds">Exceeds budget</option>
                  <option value="remaining_below">Remaining below</option>
                </select>
                <input
                  type="number"
                  className="workflow-input small"
                  value={formData.trigger.config.threshold || ''}
                  onChange={(e) => handleTriggerConfigChange('threshold', e.target.value)}
                  placeholder={formData.trigger.config.condition === 'reaches_percent' ? '%' : '$'}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="workflow-section">
            <label className="workflow-label">
              <PlayArrowIcon fontSize="small" />
              Do this (Actions)
            </label>
            {formData.actions.map((action, index) => (
              <div key={index} className="workflow-action-row">
                <select
                  className="workflow-select"
                  value={action.type}
                  onChange={(e) => handleActionChange(index, 'type', e.target.value)}
                >
                  {Object.values(ACTION_TYPES).map(act => (
                    <option key={act.key} value={act.key}>
                      {act.label} — {act.description}
                    </option>
                  ))}
                </select>

                {/* Action config based on type */}
                {action.type === 'send_alert' && (
                  <input
                    type="text"
                    className="workflow-input"
                    value={action.config.recipients || ''}
                    onChange={(e) => handleActionChange(index, 'recipients', e.target.value)}
                    placeholder="Recipients (comma-separated)"
                  />
                )}

                {action.type === 'send_email' && (
                  <input
                    type="email"
                    className="workflow-input"
                    value={action.config.email || ''}
                    onChange={(e) => handleActionChange(index, 'email', e.target.value)}
                    placeholder="Email address"
                  />
                )}

                {action.type === 'adjust_budget' && (
                  <div className="workflow-action-config">
                    <select
                      className="workflow-select small"
                      value={action.config.adjustment || ''}
                      onChange={(e) => handleActionChange(index, 'adjustment', e.target.value)}
                    >
                      <option value="">Adjustment...</option>
                      <option value="increase_percent">Increase by %</option>
                      <option value="decrease_percent">Decrease by %</option>
                      <option value="set_amount">Set to amount</option>
                    </select>
                    <input
                      type="number"
                      className="workflow-input small"
                      value={action.config.value || ''}
                      onChange={(e) => handleActionChange(index, 'value', e.target.value)}
                      placeholder="Value"
                    />
                  </div>
                )}

                {formData.actions.length > 1 && (
                  <button
                    className="workflow-remove-action"
                    onClick={() => removeAction(index)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </button>
                )}
              </div>
            ))}
            <button className="workflow-add-action" onClick={addAction}>
              <AddIcon fontSize="small" />
              Add Action
            </button>
          </div>
        </div>

        <div className="workflow-modal-footer">
          <button className="workflow-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="workflow-btn primary"
            onClick={handleSave}
            disabled={!formData.name || !formData.trigger.type}
          >
            {workflow ? 'Save Changes' : 'Create Workflow'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowEditor({
  workflows: initialWorkflows = [],
  campaigns = [],
  onWorkflowsChange
}) {
  const [workflows, setWorkflows] = useState(() => {
    if (initialWorkflows.length > 0) return initialWorkflows;

    // Demo workflows
    return [
      {
        id: 'wf-1',
        name: 'Pause low CTR campaigns',
        description: 'Automatically pause campaigns with CTR below 0.5%',
        enabled: true,
        trigger: {
          type: 'metric_threshold',
          config: { metric: 'ctr', comparison: 'less_than', value: 0.5 }
        },
        actions: [
          { type: 'send_alert', config: { recipients: 'marketing-team' } },
          { type: 'pause_campaign', config: {} }
        ],
        lastTriggered: '2026-01-20T10:30:00Z',
        triggerCount: 3
      },
      {
        id: 'wf-2',
        name: 'Budget alert at 80%',
        description: 'Send alert when campaign reaches 80% of budget',
        enabled: true,
        trigger: {
          type: 'budget_threshold',
          config: { condition: 'reaches_percent', threshold: 80 }
        },
        actions: [
          { type: 'send_email', config: { email: 'finance@company.com' } }
        ],
        lastTriggered: '2026-01-22T14:00:00Z',
        triggerCount: 5
      },
      {
        id: 'wf-3',
        name: 'Weekly performance report',
        description: 'Send weekly summary every Monday',
        enabled: false,
        trigger: {
          type: 'schedule',
          config: { frequency: 'weekly', day: 'monday', time: '09:00' }
        },
        actions: [
          { type: 'send_email', config: { email: 'team@company.com' } }
        ],
        lastTriggered: null,
        triggerCount: 0
      }
    ];
  });

  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    total: workflows.length,
    active: workflows.filter(w => w.enabled).length,
    triggered: workflows.reduce((sum, w) => sum + (w.triggerCount || 0), 0)
  }), [workflows]);

  const handleToggle = useCallback((id) => {
    setWorkflows(prev => {
      const updated = prev.map(w =>
        w.id === id ? { ...w, enabled: !w.enabled } : w
      );
      onWorkflowsChange?.(updated);
      return updated;
    });
  }, [onWorkflowsChange]);

  const handleEdit = useCallback((workflow) => {
    setEditingWorkflow(workflow);
    setShowModal(true);
  }, []);

  const handleDuplicate = useCallback((workflow) => {
    const duplicate = {
      ...workflow,
      id: `wf-${Date.now()}`,
      name: `${workflow.name} (copy)`,
      enabled: false,
      lastTriggered: null,
      triggerCount: 0
    };
    setWorkflows(prev => {
      const updated = [...prev, duplicate];
      onWorkflowsChange?.(updated);
      return updated;
    });
  }, [onWorkflowsChange]);

  const handleDelete = useCallback((id) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    setWorkflows(prev => {
      const updated = prev.filter(w => w.id !== id);
      onWorkflowsChange?.(updated);
      return updated;
    });
  }, [onWorkflowsChange]);

  const handleSave = useCallback((workflow) => {
    setWorkflows(prev => {
      const exists = prev.find(w => w.id === workflow.id);
      const updated = exists
        ? prev.map(w => w.id === workflow.id ? workflow : w)
        : [...prev, workflow];
      onWorkflowsChange?.(updated);
      return updated;
    });
    setShowModal(false);
    setEditingWorkflow(null);
  }, [onWorkflowsChange]);

  const handleCreate = useCallback(() => {
    setEditingWorkflow(null);
    setShowModal(true);
  }, []);

  return (
    <div className="workflow-editor">
      <div className="workflow-header">
        <div className="workflow-title">
          <AccountTreeIcon />
          Campaign Automations
        </div>
        <button className="workflow-create-btn" onClick={handleCreate}>
          <AddIcon fontSize="small" />
          Create Workflow
        </button>
      </div>

      <div className="workflow-content">
        {/* Stats bar */}
        <div className="workflow-stats">
          <div className="workflow-stat">
            <span className="workflow-stat-value">{stats.total}</span>
            <span className="workflow-stat-label">Total Workflows</span>
          </div>
          <div className="workflow-stat">
            <span className="workflow-stat-value active">{stats.active}</span>
            <span className="workflow-stat-label">Active</span>
          </div>
          <div className="workflow-stat">
            <span className="workflow-stat-value">{stats.triggered}</span>
            <span className="workflow-stat-label">Times Triggered</span>
          </div>
        </div>

        {/* Workflows list */}
        {workflows.length === 0 ? (
          <div className="workflow-empty">
            <AccountTreeIcon />
            <p>No workflows created yet</p>
            <button className="workflow-btn primary" onClick={handleCreate}>
              Create your first workflow
            </button>
          </div>
        ) : (
          <div className="workflow-list">
            {workflows.map(workflow => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onEdit={handleEdit}
                onToggle={handleToggle}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="workflow-tips">
          <h4>Automation Ideas</h4>
          <ul>
            <li>Pause campaigns when CPA exceeds target by 20%</li>
            <li>Send daily performance summary at 9 AM</li>
            <li>Alert team when budget reaches 90%</li>
            <li>Increase budget by 10% when ROAS exceeds 3x</li>
          </ul>
        </div>
      </div>

      {/* Info footer */}
      <div className="workflow-info">
        <InfoOutlinedIcon fontSize="small" />
        <span>
          Workflows automate routine campaign management tasks.
          Rules are checked hourly for metric-based triggers.
        </span>
      </div>

      {/* Modal */}
      {showModal && (
        <WorkflowModal
          workflow={editingWorkflow}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingWorkflow(null);
          }}
        />
      )}
    </div>
  );
}
