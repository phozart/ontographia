// components/ba/ProcessComparison.js
// BABOK Process Flow Comparison with database persistence
// As-Is vs To-Be process comparison with gap highlighting

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useArtefacts, ARTEFACT_TYPES } from '../ArtefactContext';
import { useAuth } from '../AuthContext';
import { useProjects } from '../ProjectContext';

// MUI Icons
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import MergeIcon from '@mui/icons-material/Merge';
import DownloadIcon from '@mui/icons-material/Download';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SaveIcon from '@mui/icons-material/Save';

// ============ STEP TYPES ============
const STEP_TYPES = {
  start: { id: 'start', name: 'Start', icon: PlayArrowIcon, color: '#22c55e', shape: 'circle' },
  end: { id: 'end', name: 'End', icon: StopIcon, color: '#ef4444', shape: 'circle' },
  task: { id: 'task', name: 'Task', icon: null, color: '#3b82f6', shape: 'rectangle' },
  decision: { id: 'decision', name: 'Decision', icon: CallSplitIcon, color: '#f59e0b', shape: 'diamond' },
  subprocess: { id: 'subprocess', name: 'Sub-Process', icon: null, color: '#8b5cf6', shape: 'rectangle-double' },
  manual: { id: 'manual', name: 'Manual Task', icon: null, color: '#6b7280', shape: 'trapezoid' },
};

// ============ CHANGE TYPES ============
const CHANGE_TYPES = {
  unchanged: { id: 'unchanged', name: 'Unchanged', color: '#6b7280', icon: null },
  added: { id: 'added', name: 'Added', color: '#22c55e', icon: AddCircleIcon },
  removed: { id: 'removed', name: 'Removed', color: '#ef4444', icon: RemoveCircleIcon },
  modified: { id: 'modified', name: 'Modified', color: '#f59e0b', icon: ChangeCircleIcon },
};

// ============ PROCESS STEP COMPONENT ============
function ProcessStep({ step, changeType, onClick, isSelected }) {
  const stepType = STEP_TYPES[step.type] || STEP_TYPES.task;
  const change = CHANGE_TYPES[changeType] || CHANGE_TYPES.unchanged;
  const StepIcon = stepType.icon;
  const ChangeIcon = change.icon;

  return (
    <div
      className={`process-step ${step.type} ${changeType} ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(step)}
      style={{ borderColor: changeType !== 'unchanged' ? change.color : stepType.color }}
    >
      {/* Change indicator */}
      {ChangeIcon && (
        <div className="change-indicator" style={{ backgroundColor: change.color }}>
          <ChangeIcon fontSize="small" />
        </div>
      )}

      {/* Step content */}
      <div className="step-content">
        {StepIcon && <StepIcon style={{ color: stepType.color }} />}
        <span className="step-name">{step.name}</span>
        {step.actor && <span className="step-actor">{step.actor}</span>}
      </div>

      {/* Duration if present */}
      {step.duration && (
        <div className="step-duration">{step.duration}</div>
      )}
    </div>
  );
}

// ============ PROCESS FLOW DIAGRAM ============
function ProcessFlowDiagram({ title, steps, connections, changeMap, onStepClick, selectedStepId, variant }) {
  return (
    <div className={`process-flow-diagram ${variant}`}>
      <div className="diagram-title">
        <h3>{title}</h3>
        <span className="step-count">{steps.length} steps</span>
      </div>

      <div className="diagram-canvas">
        {steps.length === 0 ? (
          <div className="empty-diagram">
            <HelpOutlineIcon style={{ fontSize: 40, opacity: 0.3 }} />
            <p>No process steps defined</p>
          </div>
        ) : (
          <div className="steps-flow">
            {steps.map((step, index) => (
              <div key={step.id} className="step-wrapper">
                <ProcessStep
                  step={step}
                  changeType={changeMap?.[step.id] || 'unchanged'}
                  onClick={onStepClick}
                  isSelected={selectedStepId === step.id}
                />
                {index < steps.length - 1 && (
                  <div className="flow-connector">
                    <ArrowDownwardIcon fontSize="small" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ STEP FORM MODAL ============
function StepFormModal({ step, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: step?.name || '',
    type: step?.type || 'task',
    actor: step?.actor || '',
    duration: step?.duration || '',
    description: step?.description || '',
    inputs: step?.inputs || '',
    outputs: step?.outputs || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...step,
      ...formData,
      id: step?.id || `step-${Date.now()}`,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="context-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{step?.id ? 'Edit Step' : 'Add Step'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Step Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Review Application"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Step Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {Object.entries(STEP_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>{type.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Actor / Role</label>
              <input
                type="text"
                value={formData.actor}
                onChange={(e) => setFormData({ ...formData, actor: e.target.value })}
                placeholder="e.g., Manager"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Duration (optional)</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 2 days, 30 min"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What happens in this step?"
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Inputs</label>
              <input
                type="text"
                value={formData.inputs}
                onChange={(e) => setFormData({ ...formData, inputs: e.target.value })}
                placeholder="Required inputs"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Outputs</label>
              <input
                type="text"
                value={formData.outputs}
                onChange={(e) => setFormData({ ...formData, outputs: e.target.value })}
                placeholder="Produced outputs"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {step?.id ? 'Save Changes' : 'Add Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ GAP ANALYSIS PANEL ============
function GapAnalysisPanel({ asIsSteps, toBeSteps, changeMap }) {
  const analysis = useMemo(() => {
    const added = [];
    const removed = [];
    const modified = [];
    const unchanged = [];

    // Check To-Be steps
    toBeSteps.forEach(step => {
      const change = changeMap[step.id];
      if (change === 'added') added.push(step);
      else if (change === 'modified') modified.push(step);
      else unchanged.push(step);
    });

    // Check As-Is steps for removed
    asIsSteps.forEach(step => {
      const stillExists = toBeSteps.find(s => s.mappedFrom === step.id || s.id === step.id);
      if (!stillExists) {
        removed.push(step);
      }
    });

    return { added, removed, modified, unchanged };
  }, [asIsSteps, toBeSteps, changeMap]);

  return (
    <div className="gap-analysis-panel">
      <h4>Gap Analysis</h4>

      <div className="gap-stats">
        <div className="gap-stat added">
          <AddCircleIcon />
          <span className="stat-value">{analysis.added.length}</span>
          <span className="stat-label">Added</span>
        </div>
        <div className="gap-stat removed">
          <RemoveCircleIcon />
          <span className="stat-value">{analysis.removed.length}</span>
          <span className="stat-label">Removed</span>
        </div>
        <div className="gap-stat modified">
          <ChangeCircleIcon />
          <span className="stat-value">{analysis.modified.length}</span>
          <span className="stat-label">Modified</span>
        </div>
        <div className="gap-stat unchanged">
          <CheckCircleIcon />
          <span className="stat-value">{analysis.unchanged.length}</span>
          <span className="stat-label">Unchanged</span>
        </div>
      </div>

      {analysis.added.length > 0 && (
        <div className="gap-section added">
          <h5>New Steps</h5>
          <ul>
            {analysis.added.map(step => (
              <li key={step.id}>{step.name}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.removed.length > 0 && (
        <div className="gap-section removed">
          <h5>Removed Steps</h5>
          <ul>
            {analysis.removed.map(step => (
              <li key={step.id}>{step.name}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.modified.length > 0 && (
        <div className="gap-section modified">
          <h5>Modified Steps</h5>
          <ul>
            {analysis.modified.map(step => (
              <li key={step.id}>{step.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Default empty steps for new diagrams
const DEFAULT_AS_IS = [
  { id: 'as-1', name: 'Start', type: 'start' },
  { id: 'as-2', name: 'End', type: 'end' },
];

const DEFAULT_TO_BE = [
  { id: 'tb-1', name: 'Start', type: 'start', mappedFrom: 'as-1' },
  { id: 'tb-2', name: 'End', type: 'end', mappedFrom: 'as-2' },
];

// ============ MAIN PROCESS COMPARISON ============
export default function ProcessComparison({ projectId }) {
  const { artefacts } = useArtefacts();
  const { user, role } = useAuth();
  const { activeProject } = useProjects();
  const effectivePid = activeProject?.id || projectId;

  // State
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' | 'toggle' | 'overlay'
  const [activeView, setActiveView] = useState('as-is'); // For toggle mode
  const [selectedStep, setSelectedStep] = useState(null);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [editingProcess, setEditingProcess] = useState(null); // 'as-is' | 'to-be'

  // Persistence state
  const [diagramId, setDiagramId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Process steps
  const [asIsSteps, setAsIsSteps] = useState(DEFAULT_AS_IS);
  const [toBeSteps, setToBeSteps] = useState(DEFAULT_TO_BE);

  // Load process comparison on mount
  useEffect(() => {
    const loadDiagram = async () => {
      if (!user || !role || !effectivePid) {
        setIsLoading(false);
        return;
      }

      console.log('[ProcessComparison] Loading for project:', effectivePid);
      setIsLoading(true);

      try {
        const res = await fetch(`/api/diagrams?type=process-comparison&project_id=${effectivePid}`, {
          headers: { 'x-user': user, 'x-role': role },
        });

        if (res.ok) {
          const diagrams = await res.json();
          if (diagrams.length > 0) {
            const diagram = diagrams[0];
            setDiagramId(diagram.id);
            const elements = diagram.elements || {};
            if (elements.asIsSteps?.length > 0) {
              setAsIsSteps(elements.asIsSteps);
            }
            if (elements.toBeSteps?.length > 0) {
              setToBeSteps(elements.toBeSteps);
            }
            console.log('[ProcessComparison] Loaded:', diagram.id);
          }
        }
      } catch (err) {
        console.error('[ProcessComparison] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDiagram();
  }, [effectivePid, user, role]);

  // Save process comparison
  const saveDiagram = async () => {
    if (!effectivePid || !user || !role) return;

    console.log('[ProcessComparison] Saving...');
    setIsSaving(true);

    try {
      const payload = {
        name: 'Process Comparison',
        type: 'process-comparison',
        elements: { asIsSteps, toBeSteps },
        settings: { project_id: effectivePid },
      };

      const method = diagramId ? 'PUT' : 'POST';
      const url = diagramId ? `/api/diagrams/${diagramId}` : '/api/diagrams';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        setDiagramId(saved.id);
        setHasChanges(false);
        console.log('[ProcessComparison] Saved:', saved.id);
      }
    } catch (err) {
      console.error('[ProcessComparison] Save error:', err);
    }
    setIsSaving(false);
  };

  // Calculate change map
  const changeMap = useMemo(() => {
    const map = {};

    toBeSteps.forEach(step => {
      if (step.mappedFrom) {
        const asIsStep = asIsSteps.find(s => s.id === step.mappedFrom);
        if (asIsStep) {
          // Check if modified
          if (step.name !== asIsStep.name ||
              step.type !== asIsStep.type ||
              step.actor !== asIsStep.actor ||
              step.duration !== asIsStep.duration) {
            map[step.id] = 'modified';
          } else {
            map[step.id] = 'unchanged';
          }
        } else {
          map[step.id] = 'added';
        }
      } else {
        map[step.id] = 'added';
      }
    });

    return map;
  }, [asIsSteps, toBeSteps]);

  // Handlers
  const handleAddStep = (process) => {
    setEditingStep(null);
    setEditingProcess(process);
    setShowStepModal(true);
  };

  const handleEditStep = (step, process) => {
    setEditingStep(step);
    setEditingProcess(process);
    setShowStepModal(true);
  };

  const handleSaveStep = (stepData) => {
    if (editingProcess === 'as-is') {
      if (editingStep?.id) {
        setAsIsSteps(prev => prev.map(s => s.id === editingStep.id ? stepData : s));
      } else {
        setAsIsSteps(prev => [...prev.slice(0, -1), stepData, prev[prev.length - 1]]);
      }
    } else {
      if (editingStep?.id) {
        setToBeSteps(prev => prev.map(s => s.id === editingStep.id ? stepData : s));
      } else {
        setToBeSteps(prev => [...prev.slice(0, -1), stepData, prev[prev.length - 1]]);
      }
    }
    setShowStepModal(false);
    setEditingStep(null);
    setEditingProcess(null);
    setHasChanges(true);
  };

  const handleDeleteStep = (stepId, process) => {
    if (confirm('Delete this step?')) {
      if (process === 'as-is') {
        setAsIsSteps(prev => prev.filter(s => s.id !== stepId));
      } else {
        setToBeSteps(prev => prev.filter(s => s.id !== stepId));
      }
      setHasChanges(true);
    }
  };

  const handleExport = () => {
    const data = {
      asIs: asIsSteps,
      toBe: toBeSteps,
      changeMap,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `process-comparison-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="process-comparison-view">
      {/* Header */}
      <div className="comparison-header">
        <div className="header-title">
          <CompareArrowsIcon style={{ fontSize: 28, color: '#8b5cf6' }} />
          <div>
            <h2>Process Flow Comparison</h2>
            <span className="subtitle">Compare As-Is and To-Be processes to identify gaps and improvements</span>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{asIsSteps.length}</span>
            <span className="stat-label">As-Is Steps</span>
          </div>
          <div className="stat">
            <span className="stat-value">{toBeSteps.length}</span>
            <span className="stat-label">To-Be Steps</span>
          </div>
          {isLoading ? (
            <div className="stat" style={{ color: '#3b82f6' }}>
              <span className="stat-label">Loading...</span>
            </div>
          ) : isSaving ? (
            <div className="stat" style={{ color: '#3b82f6' }}>
              <span className="stat-label">Saving...</span>
            </div>
          ) : hasChanges ? (
            <div className="stat unsaved">
              <span className="stat-label">Unsaved</span>
            </div>
          ) : diagramId ? (
            <div className="stat" style={{ color: '#22c55e' }}>
              <span className="stat-label">Saved</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Toolbar */}
      <div className="comparison-toolbar">
        <div className="toolbar-left">
          <div className="view-mode-toggle">
            <button
              className={viewMode === 'side-by-side' ? 'active' : ''}
              onClick={() => setViewMode('side-by-side')}
              title="Side by Side"
            >
              <ViewColumnIcon fontSize="small" />
              Side by Side
            </button>
            <button
              className={viewMode === 'toggle' ? 'active' : ''}
              onClick={() => setViewMode('toggle')}
              title="Toggle View"
            >
              <ViewAgendaIcon fontSize="small" />
              Toggle
            </button>
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-tool" onClick={handleExport}>
            <DownloadIcon fontSize="small" />
            <span>Export</span>
          </button>
          <button className="btn-save" onClick={saveDiagram} disabled={isSaving || isLoading || !hasChanges || !effectivePid}>
            <SaveIcon fontSize="small" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Toggle View Controls */}
      {viewMode === 'toggle' && (
        <div className="toggle-controls">
          <button
            className={`toggle-btn ${activeView === 'as-is' ? 'active' : ''}`}
            onClick={() => setActiveView('as-is')}
          >
            As-Is (Current)
          </button>
          <ArrowForwardIcon />
          <button
            className={`toggle-btn ${activeView === 'to-be' ? 'active' : ''}`}
            onClick={() => setActiveView('to-be')}
          >
            To-Be (Future)
          </button>
        </div>
      )}

      {/* Content */}
      <div className={`comparison-content ${viewMode}`}>
        {viewMode === 'side-by-side' ? (
          <>
            {/* As-Is Process */}
            <div className="process-column as-is">
              <div className="column-header">
                <h3>As-Is (Current State)</h3>
                <button className="add-step-btn" onClick={() => handleAddStep('as-is')}>
                  <AddIcon fontSize="small" />
                  Add Step
                </button>
              </div>
              <ProcessFlowDiagram
                title="Current Process"
                steps={asIsSteps}
                connections={[]}
                changeMap={{}}
                onStepClick={(step) => handleEditStep(step, 'as-is')}
                selectedStepId={selectedStep?.id}
                variant="as-is"
              />
            </div>

            {/* Comparison Arrow */}
            <div className="comparison-arrow">
              <ArrowForwardIcon style={{ fontSize: 32 }} />
              <span>Transform</span>
            </div>

            {/* To-Be Process */}
            <div className="process-column to-be">
              <div className="column-header">
                <h3>To-Be (Future State)</h3>
                <button className="add-step-btn" onClick={() => handleAddStep('to-be')}>
                  <AddIcon fontSize="small" />
                  Add Step
                </button>
              </div>
              <ProcessFlowDiagram
                title="Future Process"
                steps={toBeSteps}
                connections={[]}
                changeMap={changeMap}
                onStepClick={(step) => handleEditStep(step, 'to-be')}
                selectedStepId={selectedStep?.id}
                variant="to-be"
              />
            </div>
          </>
        ) : (
          <div className="single-process-view">
            {activeView === 'as-is' ? (
              <div className="process-column as-is full">
                <div className="column-header">
                  <h3>As-Is (Current State)</h3>
                  <button className="add-step-btn" onClick={() => handleAddStep('as-is')}>
                    <AddIcon fontSize="small" />
                    Add Step
                  </button>
                </div>
                <ProcessFlowDiagram
                  title="Current Process"
                  steps={asIsSteps}
                  connections={[]}
                  changeMap={{}}
                  onStepClick={(step) => handleEditStep(step, 'as-is')}
                  selectedStepId={selectedStep?.id}
                  variant="as-is"
                />
              </div>
            ) : (
              <div className="process-column to-be full">
                <div className="column-header">
                  <h3>To-Be (Future State)</h3>
                  <button className="add-step-btn" onClick={() => handleAddStep('to-be')}>
                    <AddIcon fontSize="small" />
                    Add Step
                  </button>
                </div>
                <ProcessFlowDiagram
                  title="Future Process"
                  steps={toBeSteps}
                  connections={[]}
                  changeMap={changeMap}
                  onStepClick={(step) => handleEditStep(step, 'to-be')}
                  selectedStepId={selectedStep?.id}
                  variant="to-be"
                />
              </div>
            )}
          </div>
        )}

        {/* Gap Analysis Panel */}
        <GapAnalysisPanel
          asIsSteps={asIsSteps}
          toBeSteps={toBeSteps}
          changeMap={changeMap}
        />
      </div>

      {/* Legend */}
      <div className="comparison-legend">
        <h5>Change Types</h5>
        <div className="legend-items">
          {Object.entries(CHANGE_TYPES).map(([key, type]) => {
            const Icon = type.icon;
            return (
              <div key={key} className="legend-item">
                {Icon ? <Icon fontSize="small" style={{ color: type.color }} /> : <span className="dot" style={{ backgroundColor: type.color }} />}
                <span>{type.name}</span>
              </div>
            );
          })}
        </div>
        <h5>Step Types</h5>
        <div className="legend-items">
          {Object.entries(STEP_TYPES).filter(([k]) => !['start', 'end'].includes(k)).map(([key, type]) => {
            const Icon = type.icon;
            return (
              <div key={key} className="legend-item">
                {Icon ? <Icon fontSize="small" style={{ color: type.color }} /> : <span className="shape" style={{ backgroundColor: type.color }} />}
                <span>{type.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Modal */}
      {showStepModal && (
        <StepFormModal
          step={editingStep}
          onSave={handleSaveStep}
          onClose={() => { setShowStepModal(false); setEditingStep(null); setEditingProcess(null); }}
        />
      )}
    </div>
  );
}
