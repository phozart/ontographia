// components/ba/ProcessComparison.js
// BABOK Process Flow Comparison (As-Is vs To-Be)
// Uses reusable ProcessFlowBuilder for proper branching flows

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useArtefacts, ARTEFACT_TYPES } from '../ArtefactContext';
import { useAuth } from '../AuthContext';
import { useProjects } from '../ProjectContext';
import ProcessFlowBuilder, { NODE_TYPES, autoLayoutNodes } from '../shared/ProcessFlowBuilder';

// MUI Icons
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SaveIcon from '@mui/icons-material/Save';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import GavelIcon from '@mui/icons-material/Gavel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HistoryIcon from '@mui/icons-material/History';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

// ============ CHANGE TYPES ============
const CHANGE_TYPES = {
  unchanged: { id: 'unchanged', name: 'Unchanged', color: '#9ca3af' },
  added: { id: 'added', name: 'Added', color: '#22c55e' },
  removed: { id: 'removed', name: 'Removed', color: '#ef4444' },
  modified: { id: 'modified', name: 'Modified', color: '#f59e0b' },
};

// ============ DEFAULT FLOW DATA ============
const DEFAULT_AS_IS = {
  nodes: [
    { id: 'as-start', type: 'start', name: 'Start', x: 400, y: 50 },
    { id: 'as-end', type: 'end', name: 'End', x: 400, y: 200 },
  ],
  connections: [
    { id: 'as-c1', from: 'as-start', to: 'as-end' },
  ],
};

const DEFAULT_TO_BE = {
  nodes: [
    { id: 'tb-start', type: 'start', name: 'Start', x: 400, y: 50, mappedFrom: 'as-start' },
    { id: 'tb-end', type: 'end', name: 'End', x: 400, y: 200, mappedFrom: 'as-end' },
  ],
  connections: [
    { id: 'tb-c1', from: 'tb-start', to: 'tb-end' },
  ],
};

// ============ STEP DETAIL PANEL (5 TABS) ============
function StepDetailPanel({ node, changeType, onClose, onSave, isEditing }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    name: node?.name || '',
    type: node?.type || 'task',
    actor: node?.actor || '',
    system: node?.system || '',
    duration: node?.duration || '',
    description: node?.description || '',
    inputs: node?.inputs || '',
    outputs: node?.outputs || '',
    dataObjects: node?.dataObjects || '',
    businessRules: node?.businessRules || '',
    decisionLogic: node?.decisionLogic || '',
    exceptions: node?.exceptions || '',
    alternateFlows: node?.alternateFlows || '',
    whatChanged: node?.whatChanged || '',
    whyChanged: node?.whyChanged || '',
    expectedBenefit: node?.expectedBenefit || '',
    risks: node?.risks || '',
  });

  useEffect(() => {
    if (node) {
      setFormData({
        name: node.name || '',
        type: node.type || 'task',
        actor: node.actor || '',
        system: node.system || '',
        duration: node.duration || '',
        description: node.description || '',
        inputs: node.inputs || '',
        outputs: node.outputs || '',
        dataObjects: node.dataObjects || '',
        businessRules: node.businessRules || '',
        decisionLogic: node.decisionLogic || '',
        exceptions: node.exceptions || '',
        alternateFlows: node.alternateFlows || '',
        whatChanged: node.whatChanged || '',
        whyChanged: node.whyChanged || '',
        expectedBenefit: node.expectedBenefit || '',
        risks: node.risks || '',
      });
    }
  }, [node]);

  const change = CHANGE_TYPES[changeType] || CHANGE_TYPES.unchanged;
  const nodeType = NODE_TYPES[formData.type] || NODE_TYPES.task;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: InfoOutlinedIcon },
    { id: 'io', name: 'Inputs & Outputs', icon: InputIcon },
    { id: 'rules', name: 'Rules & Logic', icon: GavelIcon },
    { id: 'exceptions', name: 'Exceptions', icon: WarningAmberIcon },
    { id: 'rationale', name: 'Change Rationale', icon: HistoryIcon, required: changeType !== 'unchanged' },
  ];

  const handleSave = () => {
    onSave({ ...node, ...formData });
  };

  if (!node) return null;

  return (
    <div className="pfc-detail-panel">
      {/* Header */}
      <div className="pfc-detail-header">
        <div className="pfc-detail-title-row">
          <span className="pfc-step-type-badge" style={{ backgroundColor: nodeType.color }}>
            {nodeType.name}
          </span>
          {isEditing ? (
            <input
              className="pfc-detail-name-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Step Name"
            />
          ) : (
            <h3>{formData.name}</h3>
          )}
          <button className="pfc-close-btn" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
        {changeType !== 'unchanged' && (
          <div className="pfc-change-indicator" style={{ backgroundColor: change.color }}>
            {change.name}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="pfc-detail-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`pfc-tab ${activeTab === tab.id ? 'active' : ''} ${tab.required ? 'required' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon fontSize="small" />
            <span>{tab.name}</span>
            {tab.required && <span className="tab-required-dot" />}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pfc-detail-content">
        {activeTab === 'overview' && (
          <div className="pfc-tab-content">
            <div className="pfc-field">
              <label>Description</label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What happens in this step?"
                  rows={3}
                />
              ) : (
                <p>{formData.description || <span className="empty">No description</span>}</p>
              )}
            </div>
            <div className="pfc-field-row">
              <div className="pfc-field">
                <label>Actor / Role</label>
                {isEditing ? (
                  <input
                    value={formData.actor}
                    onChange={(e) => setFormData({ ...formData, actor: e.target.value })}
                    placeholder="e.g., Manager"
                  />
                ) : (
                  <p>{formData.actor || <span className="empty">—</span>}</p>
                )}
              </div>
              <div className="pfc-field">
                <label>System Involved</label>
                {isEditing ? (
                  <input
                    value={formData.system}
                    onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                    placeholder="e.g., CRM"
                  />
                ) : (
                  <p>{formData.system || <span className="empty">—</span>}</p>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="pfc-field-row">
                <div className="pfc-field">
                  <label>Step Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    {Object.entries(NODE_TYPES).map(([key, type]) => (
                      <option key={key} value={key}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div className="pfc-field">
                  <label>Duration</label>
                  <input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2 days"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'io' && (
          <div className="pfc-tab-content">
            <div className="pfc-field">
              <label><InputIcon fontSize="small" /> Inputs</label>
              {isEditing ? (
                <textarea
                  value={formData.inputs}
                  onChange={(e) => setFormData({ ...formData, inputs: e.target.value })}
                  placeholder="What does this step require?"
                  rows={3}
                />
              ) : (
                <p>{formData.inputs || <span className="empty">No inputs defined</span>}</p>
              )}
            </div>
            <div className="pfc-field">
              <label><OutputIcon fontSize="small" /> Outputs</label>
              {isEditing ? (
                <textarea
                  value={formData.outputs}
                  onChange={(e) => setFormData({ ...formData, outputs: e.target.value })}
                  placeholder="What does this step produce?"
                  rows={3}
                />
              ) : (
                <p>{formData.outputs || <span className="empty">No outputs defined</span>}</p>
              )}
            </div>
            <div className="pfc-field">
              <label>Data Objects</label>
              {isEditing ? (
                <textarea
                  value={formData.dataObjects}
                  onChange={(e) => setFormData({ ...formData, dataObjects: e.target.value })}
                  placeholder="Data entities involved"
                  rows={2}
                />
              ) : (
                <p>{formData.dataObjects || <span className="empty">—</span>}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="pfc-tab-content">
            <div className="pfc-field">
              <label>Business Rules Applied</label>
              {isEditing ? (
                <textarea
                  value={formData.businessRules}
                  onChange={(e) => setFormData({ ...formData, businessRules: e.target.value })}
                  placeholder="Business rules that govern this step"
                  rows={4}
                />
              ) : (
                <p>{formData.businessRules || <span className="empty">No business rules defined</span>}</p>
              )}
            </div>
            {(formData.type === 'decision' || formData.type === 'gateway') && (
              <div className="pfc-field">
                <label>Decision Logic</label>
                {isEditing ? (
                  <textarea
                    value={formData.decisionLogic}
                    onChange={(e) => setFormData({ ...formData, decisionLogic: e.target.value })}
                    placeholder="Logic for decision branching"
                    rows={4}
                  />
                ) : (
                  <p>{formData.decisionLogic || <span className="empty">No decision logic defined</span>}</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'exceptions' && (
          <div className="pfc-tab-content">
            <div className="pfc-field">
              <label>Known Exceptions</label>
              {isEditing ? (
                <textarea
                  value={formData.exceptions}
                  onChange={(e) => setFormData({ ...formData, exceptions: e.target.value })}
                  placeholder="Exception scenarios and handling"
                  rows={4}
                />
              ) : (
                <p>{formData.exceptions || <span className="empty">No exceptions documented</span>}</p>
              )}
            </div>
            <div className="pfc-field">
              <label>Alternate Flows</label>
              {isEditing ? (
                <textarea
                  value={formData.alternateFlows}
                  onChange={(e) => setFormData({ ...formData, alternateFlows: e.target.value })}
                  placeholder="Alternative paths through this step"
                  rows={4}
                />
              ) : (
                <p>{formData.alternateFlows || <span className="empty">No alternate flows</span>}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rationale' && (
          <div className="pfc-tab-content">
            {changeType === 'unchanged' ? (
              <div className="pfc-no-change-notice">
                <CheckCircleIcon style={{ fontSize: 32, color: '#9ca3af' }} />
                <p>This step is unchanged between As-Is and To-Be</p>
              </div>
            ) : (
              <>
                <div className="pfc-field">
                  <label>What Changed?</label>
                  {isEditing ? (
                    <textarea
                      value={formData.whatChanged}
                      onChange={(e) => setFormData({ ...formData, whatChanged: e.target.value })}
                      placeholder="Describe what is different"
                      rows={3}
                    />
                  ) : (
                    <p>{formData.whatChanged || <span className="empty required">Required - describe what changed</span>}</p>
                  )}
                </div>
                <div className="pfc-field">
                  <label>Why It Changed?</label>
                  {isEditing ? (
                    <textarea
                      value={formData.whyChanged}
                      onChange={(e) => setFormData({ ...formData, whyChanged: e.target.value })}
                      placeholder="Reason for the change"
                      rows={3}
                    />
                  ) : (
                    <p>{formData.whyChanged || <span className="empty required">Required - explain the rationale</span>}</p>
                  )}
                </div>
                <div className="pfc-field">
                  <label>Expected Benefit</label>
                  {isEditing ? (
                    <textarea
                      value={formData.expectedBenefit}
                      onChange={(e) => setFormData({ ...formData, expectedBenefit: e.target.value })}
                      placeholder="What improvement does this bring?"
                      rows={2}
                    />
                  ) : (
                    <p>{formData.expectedBenefit || <span className="empty">—</span>}</p>
                  )}
                </div>
                <div className="pfc-field">
                  <label>Risks / Assumptions</label>
                  {isEditing ? (
                    <textarea
                      value={formData.risks}
                      onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
                      placeholder="Associated risks or assumptions"
                      rows={2}
                    />
                  ) : (
                    <p>{formData.risks || <span className="empty">—</span>}</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer with actions */}
      {isEditing && (
        <div className="pfc-detail-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>
            <SaveIcon fontSize="small" /> Save Step
          </button>
        </div>
      )}
    </div>
  );
}

// ============ COMPARISON INSIGHTS PANEL ============
function InsightsPanel({ asIsNodes, toBeNodes, changeMap }) {
  const insights = useMemo(() => {
    const result = [];
    let addedCount = 0;
    let removedCount = 0;
    let modifiedCount = 0;

    Object.entries(changeMap).forEach(([id, change]) => {
      if (change === 'added') addedCount++;
      else if (change === 'removed') removedCount++;
      else if (change === 'modified') modifiedCount++;
    });

    // Generate insights
    const manualRemoved = asIsNodes.filter(n =>
      n.type === 'manual' && changeMap[n.id] === 'removed'
    ).length;
    if (manualRemoved > 0) {
      result.push({ type: 'positive', text: `${manualRemoved} manual task${manualRemoved > 1 ? 's' : ''} removed` });
    }

    const automatedAdded = toBeNodes.filter(n =>
      n.type === 'automated' && changeMap[n.id] === 'added'
    ).length;
    if (automatedAdded > 0) {
      result.push({ type: 'positive', text: `${automatedAdded} automated step${automatedAdded > 1 ? 's' : ''} introduced` });
    }

    const decisionsChanged = Object.entries(changeMap).filter(([id, c]) => {
      const node = [...asIsNodes, ...toBeNodes].find(n => n.id === id);
      return node?.type === 'decision' && (c === 'added' || c === 'removed');
    }).length;
    if (decisionsChanged > 0) {
      result.push({ type: 'neutral', text: `Decision points changed (${decisionsChanged})` });
    }

    const nodeDiff = toBeNodes.length - asIsNodes.length;
    if (nodeDiff < 0) {
      result.push({ type: 'positive', text: `Process simplified by ${Math.abs(nodeDiff)} step${Math.abs(nodeDiff) > 1 ? 's' : ''}` });
    } else if (nodeDiff > 0) {
      result.push({ type: 'warning', text: `Process grew by ${nodeDiff} step${nodeDiff > 1 ? 's' : ''}` });
    }

    if (addedCount === 0 && removedCount === 0 && modifiedCount === 0) {
      result.push({ type: 'neutral', text: 'No changes detected between As-Is and To-Be' });
    }

    return result;
  }, [asIsNodes, toBeNodes, changeMap]);

  if (insights.length === 0) return null;

  return (
    <div className="pfc-insights-panel">
      <h4>Comparison Insights</h4>
      <ul className="pfc-insights-list">
        {insights.map((insight, idx) => (
          <li key={idx} className={`pfc-insight ${insight.type}`}>
            {insight.type === 'positive' && <CheckCircleIcon fontSize="small" />}
            {insight.type === 'warning' && <WarningAmberIcon fontSize="small" />}
            {insight.type === 'neutral' && <InfoOutlinedIcon fontSize="small" />}
            <span>{insight.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============ FLOW LIST PANEL ============
function FlowListPanel({ flows, selectedFlowId, onSelect, onCreate, onRename, onDelete, isLoading }) {
  const [menuOpen, setMenuOpen] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState('');

  const handleRename = (flow) => {
    setRenaming(flow.id);
    setNewName(flow.name);
    setMenuOpen(null);
  };

  const submitRename = (flowId) => {
    if (newName.trim()) {
      onRename(flowId, newName.trim());
    }
    setRenaming(null);
    setNewName('');
  };

  return (
    <div className="pfc-flow-list-panel">
      <div className="pfc-flow-list-header">
        <h4>Process Flows</h4>
        <button className="pfc-new-flow-btn" onClick={onCreate}>
          <AddIcon fontSize="small" /> New
        </button>
      </div>

      <div className="pfc-flow-list">
        {isLoading ? (
          <div className="pfc-flow-loading">Loading flows...</div>
        ) : flows.length === 0 ? (
          <div className="pfc-flow-empty">
            <p>No process flows yet</p>
            <button className="btn-secondary" onClick={onCreate}>
              <AddIcon fontSize="small" /> Create First Flow
            </button>
          </div>
        ) : (
          flows.map(flow => (
            <div
              key={flow.id}
              className={`pfc-flow-item ${selectedFlowId === flow.id ? 'selected' : ''}`}
              onClick={() => onSelect(flow.id)}
            >
              {renaming === flow.id ? (
                <input
                  className="pfc-rename-input"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => submitRename(flow.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitRename(flow.id);
                    if (e.key === 'Escape') { setRenaming(null); setNewName(''); }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <>
                  <div className="pfc-flow-info">
                    <span className="pfc-flow-name">{flow.name}</span>
                    <span className="pfc-flow-date">
                      {new Date(flow.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className="pfc-flow-menu-btn"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === flow.id ? null : flow.id); }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </button>
                  {menuOpen === flow.id && (
                    <div className="pfc-flow-menu" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleRename(flow)}>
                        <DriveFileRenameOutlineIcon fontSize="small" /> Rename
                      </button>
                      <button className="danger" onClick={() => { onDelete(flow.id); setMenuOpen(null); }}>
                        <DeleteIcon fontSize="small" /> Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============ MAIN PROCESS COMPARISON ============
export default function ProcessComparison({ projectId }) {
  const { artefacts } = useArtefacts();
  const { user, role } = useAuth();
  const { activeProject } = useProjects();
  const effectivePid = activeProject?.id || projectId;

  // State
  const [flows, setFlows] = useState([]);
  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [focusMode, setFocusMode] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);

  // Flow data
  const [asIsNodes, setAsIsNodes] = useState(DEFAULT_AS_IS.nodes);
  const [asIsConnections, setAsIsConnections] = useState(DEFAULT_AS_IS.connections);
  const [toBeNodes, setToBeNodes] = useState(DEFAULT_TO_BE.nodes);
  const [toBeConnections, setToBeConnections] = useState(DEFAULT_TO_BE.connections);

  // Selection state
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null); // 'as-is' | 'to-be'

  // Load flows list
  useEffect(() => {
    const loadFlows = async () => {
      if (!user || !role || !effectivePid) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/diagrams?type=process-comparison&project_id=${effectivePid}`, {
          headers: { 'x-user': user, 'x-role': role },
        });

        if (res.ok) {
          const data = await res.json();
          setFlows(data);

          // Auto-select most recently updated
          if (data.length > 0 && !selectedFlowId) {
            const latest = data[0];
            setSelectedFlowId(latest.id);
            loadFlowData(latest);
          }
        }
      } catch (err) {
        console.error('[ProcessComparison] Load flows error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlows();
  }, [effectivePid, user, role]);

  // Load flow data
  const loadFlowData = useCallback((flow) => {
    if (!flow) return;

    const elements = flow.elements || {};
    setAsIsNodes(elements.asIsNodes?.length > 0 ? elements.asIsNodes : DEFAULT_AS_IS.nodes);
    setAsIsConnections(elements.asIsConnections || DEFAULT_AS_IS.connections);
    setToBeNodes(elements.toBeNodes?.length > 0 ? elements.toBeNodes : DEFAULT_TO_BE.nodes);
    setToBeConnections(elements.toBeConnections || DEFAULT_TO_BE.connections);
    setHasChanges(false);
    setSelectedNodeId(null);
    setSelectedProcess(null);
  }, []);

  // Handle flow selection
  const handleSelectFlow = useCallback((flowId) => {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Discard them?')) return;
    }

    setSelectedFlowId(flowId);
    const flow = flows.find(f => f.id === flowId);
    if (flow) loadFlowData(flow);
  }, [flows, hasChanges, loadFlowData]);

  // Create new flow
  const handleCreateFlow = async () => {
    if (!effectivePid || !user || !role) return;

    const name = prompt('Enter flow name:', 'New Process Flow');
    if (!name?.trim()) return;

    try {
      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify({
          type: 'process-comparison',
          name: name.trim(),
          elements: {
            asIsNodes: DEFAULT_AS_IS.nodes,
            asIsConnections: DEFAULT_AS_IS.connections,
            toBeNodes: DEFAULT_TO_BE.nodes,
            toBeConnections: DEFAULT_TO_BE.connections,
          },
          settings: { project_id: effectivePid },
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setFlows(prev => [created, ...prev]);
        setSelectedFlowId(created.id);
        loadFlowData(created);
      }
    } catch (err) {
      console.error('[ProcessComparison] Create flow error:', err);
    }
  };

  // Rename flow
  const handleRenameFlow = async (flowId, newName) => {
    if (!user || !role) return;

    try {
      const res = await fetch(`/api/diagrams/${flowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        const updated = await res.json();
        setFlows(prev => prev.map(f => f.id === flowId ? updated : f));
      }
    } catch (err) {
      console.error('[ProcessComparison] Rename flow error:', err);
    }
  };

  // Delete flow
  const handleDeleteFlow = async (flowId) => {
    if (!confirm('Delete this process flow?')) return;

    try {
      const res = await fetch(`/api/diagrams/${flowId}`, {
        method: 'DELETE',
        headers: { 'x-user': user, 'x-role': role },
      });

      if (res.ok) {
        setFlows(prev => prev.filter(f => f.id !== flowId));
        if (selectedFlowId === flowId) {
          const remaining = flows.filter(f => f.id !== flowId);
          if (remaining.length > 0) {
            setSelectedFlowId(remaining[0].id);
            loadFlowData(remaining[0]);
          } else {
            setSelectedFlowId(null);
            setAsIsNodes(DEFAULT_AS_IS.nodes);
            setAsIsConnections(DEFAULT_AS_IS.connections);
            setToBeNodes(DEFAULT_TO_BE.nodes);
            setToBeConnections(DEFAULT_TO_BE.connections);
          }
        }
      }
    } catch (err) {
      console.error('[ProcessComparison] Delete flow error:', err);
    }
  };

  // Save current flow
  const handleSave = async () => {
    if (!selectedFlowId || !user || !role) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/diagrams/${selectedFlowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify({
          elements: {
            asIsNodes,
            asIsConnections,
            toBeNodes,
            toBeConnections,
          },
        }),
      });

      if (res.ok) {
        setHasChanges(false);
        const updated = await res.json();
        setFlows(prev => prev.map(f => f.id === selectedFlowId ? updated : f));
      }
    } catch (err) {
      console.error('[ProcessComparison] Save error:', err);
    }
    setIsSaving(false);
  };

  // Calculate change map
  const changeMap = useMemo(() => {
    const map = {};

    // Check To-Be nodes against As-Is
    toBeNodes.forEach(node => {
      if (node.mappedFrom) {
        const asIsNode = asIsNodes.find(n => n.id === node.mappedFrom);
        if (asIsNode) {
          if (node.name !== asIsNode.name ||
              node.type !== asIsNode.type ||
              node.actor !== asIsNode.actor) {
            map[node.id] = 'modified';
          } else {
            map[node.id] = 'unchanged';
          }
        } else {
          map[node.id] = 'added';
        }
      } else {
        map[node.id] = 'added';
      }
    });

    // Mark removed nodes
    asIsNodes.forEach(node => {
      const inToBe = toBeNodes.find(n => n.mappedFrom === node.id);
      if (!inToBe) {
        map[node.id] = 'removed';
      }
    });

    return map;
  }, [asIsNodes, toBeNodes]);

  // Node handlers
  const handleAsIsNodesChange = useCallback((nodes) => {
    setAsIsNodes(nodes);
    setHasChanges(true);
  }, []);

  const handleAsIsConnectionsChange = useCallback((connections) => {
    setAsIsConnections(connections);
    setHasChanges(true);
  }, []);

  const handleToBeNodesChange = useCallback((nodes) => {
    setToBeNodes(nodes);
    setHasChanges(true);
  }, []);

  const handleToBeConnectionsChange = useCallback((connections) => {
    setToBeConnections(connections);
    setHasChanges(true);
  }, []);

  const handleNodeSelect = useCallback((node, process) => {
    setSelectedNodeId(node?.id || null);
    setSelectedProcess(node ? process : null);
  }, []);

  const handleSaveNode = useCallback((nodeData) => {
    if (selectedProcess === 'as-is') {
      setAsIsNodes(prev => prev.map(n => n.id === nodeData.id ? nodeData : n));
    } else {
      setToBeNodes(prev => prev.map(n => n.id === nodeData.id ? nodeData : n));
    }
    setHasChanges(true);
    setSelectedNodeId(null);
    setSelectedProcess(null);
  }, [selectedProcess]);

  // Get selected node
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    if (selectedProcess === 'as-is') return asIsNodes.find(n => n.id === selectedNodeId);
    return toBeNodes.find(n => n.id === selectedNodeId);
  }, [selectedNodeId, selectedProcess, asIsNodes, toBeNodes]);

  // Get current flow name
  const currentFlow = flows.find(f => f.id === selectedFlowId);

  return (
    <div className="pfc-container">
      {/* Flow List Panel */}
      <FlowListPanel
        flows={flows}
        selectedFlowId={selectedFlowId}
        onSelect={handleSelectFlow}
        onCreate={handleCreateFlow}
        onRename={handleRenameFlow}
        onDelete={handleDeleteFlow}
        isLoading={isLoading}
      />

      {/* Main Comparison Area */}
      <div className="pfc-main">
        {/* Header */}
        <div className="pfc-header">
          <div className="pfc-header-left">
            <CompareArrowsIcon style={{ fontSize: 28, color: '#8b5cf6' }} />
            <div className="pfc-header-info">
              <h2>{currentFlow?.name || 'Process Flow Comparison'}</h2>
              <span className="pfc-header-subtitle">Compare As-Is and To-Be processes with branching flows</span>
            </div>
          </div>
          <div className="pfc-header-right">
            {hasChanges && <span className="pfc-unsaved-badge">Unsaved</span>}
            <button
              className="pfc-save-btn"
              onClick={handleSave}
              disabled={!hasChanges || isSaving || !selectedFlowId}
            >
              <SaveIcon fontSize="small" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Control Bar */}
        <div className="pfc-control-bar">
          <div className="pfc-control-left">
            <div className="pfc-focus-toggle">
              <button
                className={focusMode === 'overview' ? 'active' : ''}
                onClick={() => setFocusMode('overview')}
                title="Side-by-side comparison"
              >
                <ViewColumnIcon fontSize="small" />
                <span>Side by Side</span>
              </button>
              <button
                className={focusMode === 'focusAsIs' ? 'active' : ''}
                onClick={() => setFocusMode('focusAsIs')}
                title="Focus on As-Is"
              >
                <CenterFocusStrongIcon fontSize="small" />
                <span>Focus As-Is</span>
              </button>
              <button
                className={focusMode === 'focusToBe' ? 'active' : ''}
                onClick={() => setFocusMode('focusToBe')}
                title="Focus on To-Be"
              >
                <CenterFocusStrongIcon fontSize="small" />
                <span>Focus To-Be</span>
              </button>
            </div>
          </div>
          <div className="pfc-control-right">
            <button
              className={`pfc-edit-toggle ${isEditMode ? 'active' : ''}`}
              onClick={() => setIsEditMode(!isEditMode)}
            >
              <EditIcon fontSize="small" />
              {isEditMode ? 'Analysis Mode' : 'Edit Mode'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`pfc-content focus-${focusMode}`}>
          {!selectedFlowId ? (
            <div className="pfc-no-flow">
              <CompareArrowsIcon style={{ fontSize: 48, opacity: 0.3 }} />
              <p>Select or create a process flow to begin</p>
              <button className="btn-primary" onClick={handleCreateFlow}>
                <AddIcon fontSize="small" /> Create Process Flow
              </button>
            </div>
          ) : (
            <>
              {/* As-Is Canvas */}
              <div className={`pfc-canvas-wrapper as-is ${focusMode === 'focusToBe' ? 'collapsed' : ''}`}>
                <div className="pfc-canvas-label">
                  <span className="pfc-canvas-label-title">Current State (As-Is)</span>
                  <span className="pfc-canvas-label-desc">How the process works today</span>
                </div>
                <ProcessFlowBuilder
                  nodes={asIsNodes}
                  connections={asIsConnections}
                  onNodesChange={handleAsIsNodesChange}
                  onConnectionsChange={handleAsIsConnectionsChange}
                  onNodeSelect={(node) => handleNodeSelect(node, 'as-is')}
                  selectedNodeId={selectedProcess === 'as-is' ? selectedNodeId : null}
                  readOnly={!isEditMode}
                  changeMap={changeMap}
                  className="pfc-flow-builder"
                />
              </div>

              {/* Transform Arrow */}
              {focusMode === 'overview' && (
                <div className="pfc-transform-arrow">
                  <ArrowForwardIcon style={{ fontSize: 28 }} />
                  <span>Transform</span>
                </div>
              )}

              {/* To-Be Canvas */}
              <div className={`pfc-canvas-wrapper to-be ${focusMode === 'focusAsIs' ? 'collapsed' : ''}`}>
                <div className="pfc-canvas-label">
                  <span className="pfc-canvas-label-title">Future State (To-Be)</span>
                  <span className="pfc-canvas-label-desc">How the process will work</span>
                </div>
                <ProcessFlowBuilder
                  nodes={toBeNodes}
                  connections={toBeConnections}
                  onNodesChange={handleToBeNodesChange}
                  onConnectionsChange={handleToBeConnectionsChange}
                  onNodeSelect={(node) => handleNodeSelect(node, 'to-be')}
                  selectedNodeId={selectedProcess === 'to-be' ? selectedNodeId : null}
                  readOnly={!isEditMode}
                  changeMap={changeMap}
                  className="pfc-flow-builder"
                />
              </div>
            </>
          )}
        </div>

        {/* Insights Panel */}
        {selectedFlowId && focusMode === 'overview' && (
          <InsightsPanel
            asIsNodes={asIsNodes}
            toBeNodes={toBeNodes}
            changeMap={changeMap}
          />
        )}

        {/* Legend */}
        <div className="pfc-legend">
          <div className="pfc-legend-section">
            <span className="pfc-legend-title">Changes:</span>
            {Object.entries(CHANGE_TYPES).map(([key, type]) => (
              <div key={key} className="pfc-legend-item">
                <span className="pfc-legend-dot" style={{ backgroundColor: type.color }} />
                <span>{type.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Detail Panel */}
      {selectedNode && (
        <StepDetailPanel
          node={selectedNode}
          changeType={changeMap[selectedNode.id] || 'unchanged'}
          onClose={() => { setSelectedNodeId(null); setSelectedProcess(null); }}
          onSave={handleSaveNode}
          isEditing={isEditMode}
        />
      )}
    </div>
  );
}
