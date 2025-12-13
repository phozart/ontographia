// components/ba/ContextDiagram.js
// BABOK Context Diagram with database persistence, export, and versioning
// Shows system boundary with actors, external systems, and data flows

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useProjects } from '../ProjectContext';

// Auto-save delay in milliseconds
const AUTO_SAVE_DELAY = 2000;

// MUI Icons (for UI only, not SVG export)
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';

// ============ SVG ICON PATHS (for export) ============
const ICON_PATHS = {
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  system: 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z',
  database: 'M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.59 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.5 6 2s-2.13 2-6 2-6-1.5-6-2 2.13-2 6-2zm6 12c0 .5-2.13 2-6 2s-6-1.5-6-2v-2.23c1.61.78 3.72 1.23 6 1.23s4.39-.45 6-1.23V17zm0-4c0 .5-2.13 2-6 2s-6-1.5-6-2v-2.23c1.61.78 3.72 1.23 6 1.23s4.39-.45 6-1.23V13zm0-4c0 .5-2.13 2-6 2s-6-1.5-6-2V6.77C7.61 7.55 9.72 8 12 8s4.39-.45 6-1.23V9z',
  service: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z',
  organization: 'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z',
};

// ============ ACTOR TYPES ============
const ACTOR_TYPES = {
  user: { id: 'user', name: 'User', color: '#3b82f6', description: 'Human actor interacting with the system' },
  system: { id: 'system', name: 'External System', color: '#8b5cf6', description: 'External software system' },
  database: { id: 'database', name: 'Database', color: '#22c55e', description: 'External data store' },
  service: { id: 'service', name: 'External Service', color: '#f59e0b', description: 'External API or service' },
  organization: { id: 'organization', name: 'Organization', color: '#ef4444', description: 'External organization or department' },
};

// ============ DATA FLOW TYPES ============
const FLOW_TYPES = {
  inbound: { id: 'inbound', name: 'Inbound', color: '#3b82f6', arrow: 'end', description: 'Data flows into the system' },
  outbound: { id: 'outbound', name: 'Outbound', color: '#22c55e', arrow: 'start', description: 'Data flows out of the system' },
  bidirectional: { id: 'bidirectional', name: 'Bidirectional', color: '#8b5cf6', arrow: 'both', description: 'Data flows both ways' },
};

// ============ EXPORT THEMES ============
const EXPORT_THEMES = {
  light: {
    background: '#ffffff',
    text: '#1f2937',
    textMuted: '#6b7280',
    textLabel: '#94a3b8',
    actorBg: '#ffffff',
    boundary: '#f8fafc',
    boundaryStroke: '#3b82f6',
    flowLabelBg: '#ffffff',
    grid: '#e5e7eb',
    gridMajor: '#d1d5db',
  },
  dark: {
    background: '#1f2430',
    text: '#f4f6fb',
    textMuted: '#c7cedd',
    textLabel: '#8b95a9',
    actorBg: '#2d3748',
    boundary: '#262d3a',
    boundaryStroke: '#7aa2ff',
    flowLabelBg: '#2d3748',
    grid: '#374151',
    gridMajor: '#4b5563',
  },
};

// Helper to detect current theme
const getCurrentTheme = () => {
  if (typeof document !== 'undefined') {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  }
  return 'light';
};

// ============ ACTOR NODE (Pure SVG for export compatibility) ============
function ActorNode({ actor, position, isSelected, onSelect, onDragStart }) {
  const actorType = ACTOR_TYPES[actor.type] || ACTOR_TYPES.user;
  const iconPath = ICON_PATHS[actor.type] || ICON_PATHS.user;

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStart(e, actor);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(actor);
  };

  return (
    <g
      className="actor-node"
      transform={`translate(${position.x}, ${position.y})`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{ cursor: 'grab' }}
    >
      {/* Background circle */}
      <circle r={40} fill="#ffffff" stroke={actorType.color} strokeWidth={isSelected ? 3 : 2} />

      {/* Icon using SVG path */}
      <g transform="translate(-12, -20)">
        <path d={iconPath} fill={actorType.color} transform="scale(1)" />
      </g>

      {/* Label */}
      <text y={52} textAnchor="middle" fill="#1f2937" fontSize="12" fontWeight="500" fontFamily="Inter, sans-serif">
        {actor.name}
      </text>
      <text y={66} textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="Inter, sans-serif">
        {actorType.name}
      </text>

      {/* Selection ring */}
      {isSelected && (
        <circle r={46} fill="none" stroke={actorType.color} strokeWidth={1} strokeDasharray="4 2" />
      )}
    </g>
  );
}

// ============ SYSTEM BOUNDARY ============
function SystemBoundary({ name, width, height, centerLabel, onCenterLabelClick }) {
  const padding = 20;
  const labelWidth = Math.max(name.length * 9 + 20, 100);

  return (
    <g className="system-boundary">
      <rect
        x={-width / 2} y={-height / 2}
        width={width} height={height}
        rx={12} fill="#f8fafc" stroke="#3b82f6" strokeWidth={3} strokeDasharray="8 4"
      />
      <rect
        x={-width / 2 + padding} y={-height / 2 - 12}
        width={labelWidth} height={24} rx={4} fill="#3b82f6"
      />
      <text
        x={-width / 2 + padding + labelWidth / 2} y={-height / 2 + 4}
        fill="#ffffff" fontSize="13" fontWeight="600" textAnchor="middle" fontFamily="Inter, sans-serif"
      >
        {name}
      </text>
      <text
        x={0} y={0}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize="14"
        fontWeight="500"
        fontFamily="Inter, sans-serif"
        style={{ cursor: 'pointer' }}
        onClick={onCenterLabelClick}
      >
        {centerLabel || 'System Under Design'}
      </text>
    </g>
  );
}

// ============ DATA FLOW LINE ============
function DataFlowLine({ flow, fromPos, toPos, isSelected, onSelect }) {
  const flowType = FLOW_TYPES[flow.direction] || FLOW_TYPES.inbound;
  const midX = (fromPos.x + toPos.x) / 2;
  const midY = (fromPos.y + toPos.y) / 2;
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const offset = len * 0.1;
  const perpX = (-dy / len) * offset;
  const perpY = (dx / len) * offset;
  const ctrlX = midX + perpX;
  const ctrlY = midY + perpY;
  const markerId = `arrow-${flow.id}-${flowType.arrow}`;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(flow);
  };

  return (
    <g className="data-flow" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <defs>
        <marker id={`${markerId}-end`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={flowType.color} />
        </marker>
        <marker id={`${markerId}-start`} markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto">
          <path d="M10,0 L0,5 L10,10 Z" fill={flowType.color} />
        </marker>
      </defs>

      {/* Wider invisible path for easier clicking */}
      <path
        d={`M ${fromPos.x} ${fromPos.y} Q ${ctrlX} ${ctrlY} ${toPos.x} ${toPos.y}`}
        fill="none" stroke="transparent" strokeWidth={20}
      />

      {/* Visible path */}
      <path
        d={`M ${fromPos.x} ${fromPos.y} Q ${ctrlX} ${ctrlY} ${toPos.x} ${toPos.y}`}
        fill="none" stroke={flowType.color} strokeWidth={isSelected ? 3 : 2}
        markerEnd={flowType.arrow === 'end' || flowType.arrow === 'both' ? `url(#${markerId}-end)` : undefined}
        markerStart={flowType.arrow === 'start' || flowType.arrow === 'both' ? `url(#${markerId}-start)` : undefined}
      />

      {/* Label */}
      {flow.label && (
        <g transform={`translate(${ctrlX}, ${ctrlY - 10})`}>
          <rect
            x={-flow.label.length * 3.5 - 6} y={-10}
            width={flow.label.length * 7 + 12} height={20}
            rx={4} fill="#ffffff" stroke={flowType.color} strokeWidth={1}
          />
          <text textAnchor="middle" y={4} fill={flowType.color} fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">
            {flow.label}
          </text>
        </g>
      )}

      {/* Selection highlight */}
      {isSelected && (
        <path
          d={`M ${fromPos.x} ${fromPos.y} Q ${ctrlX} ${ctrlY} ${toPos.x} ${toPos.y}`}
          fill="none" stroke={flowType.color} strokeWidth={6} opacity={0.3}
        />
      )}
    </g>
  );
}

// ============ ACTOR FORM MODAL ============
function ActorFormModal({ actor, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: actor?.name || '',
    type: actor?.type || 'user',
    description: actor?.description || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...actor, ...formData, id: actor?.id || `actor-${Date.now()}` });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="context-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{actor?.id ? 'Edit Actor' : 'Add Actor'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Actor name"
            />
          </div>
          <div className="form-group">
            <label>Type *</label>
            <div className="type-options">
              {Object.entries(ACTOR_TYPES).map(([key, type]) => (
                <button
                  key={key}
                  type="button"
                  className={`type-option ${formData.type === key ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, type: key })}
                  style={{ borderColor: formData.type === key ? type.color : 'transparent' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={type.color}>
                    <path d={ICON_PATHS[key]} />
                  </svg>
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description..."
              rows={2}
            />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{actor?.id ? 'Save' : 'Add Actor'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ DATA FLOW FORM MODAL ============
function FlowFormModal({ flow, actors, onSave, onClose }) {
  const [formData, setFormData] = useState({
    label: flow?.label || '',
    direction: flow?.direction || 'inbound',
    actorId: flow?.actorId || actors[0]?.id || '',
    description: flow?.description || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...flow, ...formData, id: flow?.id || `flow-${Date.now()}` });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="context-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{flow?.id ? 'Edit Data Flow' : 'Add Data Flow'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Actor *</label>
            <select
              value={formData.actorId}
              onChange={(e) => setFormData({ ...formData, actorId: e.target.value })}
              required
            >
              <option value="">Select actor...</option>
              {actors.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Direction *</label>
            <div className="direction-options">
              {Object.entries(FLOW_TYPES).map(([key, type]) => (
                <button
                  key={key}
                  type="button"
                  className={`direction-option ${formData.direction === key ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, direction: key })}
                  style={{ borderColor: formData.direction === key ? type.color : 'transparent' }}
                >
                  {key === 'inbound' && <ArrowForwardIcon style={{ color: type.color }} />}
                  {key === 'outbound' && <ArrowBackIcon style={{ color: type.color }} />}
                  {key === 'bidirectional' && <SwapHorizIcon style={{ color: type.color }} />}
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Data Label *</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
              placeholder="e.g., Customer Order, Payment Status"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the data being exchanged..."
              rows={2}
            />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{flow?.id ? 'Save' : 'Add Flow'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ VERSION HISTORY PANEL ============
function VersionHistoryPanel({ versions, currentVersion, onRestore, onClose }) {
  return (
    <div className="version-history-panel">
      <div className="version-panel-header">
        <h4><HistoryIcon fontSize="small" /> Version History</h4>
        <button onClick={onClose} className="close-panel-btn"><CloseIcon fontSize="small" /></button>
      </div>
      <div className="version-list">
        {versions.length === 0 ? (
          <p className="no-versions">No previous versions saved yet</p>
        ) : (
          versions.map((v, idx) => (
            <div key={v.id || idx} className={`version-item ${v.id === currentVersion ? 'current' : ''}`}>
              <div className="version-info">
                <span className="version-date">{new Date(v.savedAt).toLocaleString()}</span>
                <span className="version-stats">{v.actorCount} actors, {v.flowCount} flows</span>
              </div>
              {v.id !== currentVersion && (
                <button onClick={() => onRestore(v)} className="restore-btn" title="Restore this version">
                  <RestoreIcon fontSize="small" />
                </button>
              )}
              {v.id === currentVersion && <span className="current-badge">Current</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============ ACTORS LIST PANEL ============
function ActorsListPanel({ actors, flows, selectedActor, selectedFlow, onSelectActor, onSelectFlow, onEditActor, onDeleteActor, onEditFlow, onDeleteFlow, onClose }) {
  return (
    <div className="actors-list-panel">
      <div className="panel-section">
        <div className="panel-section-header">
          <h4>Actors ({actors.length})</h4>
        </div>
        <div className="panel-section-content">
          {actors.length === 0 ? (
            <p className="empty-hint">No actors yet</p>
          ) : (
            actors.map(actor => {
              const actorType = ACTOR_TYPES[actor.type] || ACTOR_TYPES.user;
              const isSelected = selectedActor?.id === actor.id;
              return (
                <div
                  key={actor.id}
                  className={`list-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectActor(actor)}
                >
                  <div className="list-item-icon" style={{ background: actorType.color }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d={ICON_PATHS[actor.type] || ICON_PATHS.user} />
                    </svg>
                  </div>
                  <div className="list-item-info">
                    <span className="list-item-name">{actor.name}</span>
                    <span className="list-item-type">{actorType.name}</span>
                  </div>
                  {isSelected && (
                    <div className="list-item-actions">
                      <button onClick={(e) => { e.stopPropagation(); onEditActor(actor); }} title="Edit">
                        <EditIcon fontSize="small" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteActor(actor); }} className="delete" title="Delete">
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-header">
          <h4>Data Flows ({flows.length})</h4>
        </div>
        <div className="panel-section-content">
          {flows.length === 0 ? (
            <p className="empty-hint">No data flows yet</p>
          ) : (
            flows.map(flow => {
              const flowType = FLOW_TYPES[flow.direction] || FLOW_TYPES.inbound;
              const actor = actors.find(a => a.id === flow.actorId);
              const isSelected = selectedFlow?.id === flow.id;
              return (
                <div
                  key={flow.id}
                  className={`list-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectFlow(flow)}
                >
                  <div className="list-item-icon flow-icon" style={{ background: flowType.color }}>
                    {flow.direction === 'inbound' && '→'}
                    {flow.direction === 'outbound' && '←'}
                    {flow.direction === 'bidirectional' && '↔'}
                  </div>
                  <div className="list-item-info">
                    <span className="list-item-name">{flow.label}</span>
                    <span className="list-item-type">{actor?.name || 'Unknown'} • {flowType.name}</span>
                  </div>
                  {isSelected && (
                    <div className="list-item-actions">
                      <button onClick={(e) => { e.stopPropagation(); onEditFlow(flow); }} title="Edit">
                        <EditIcon fontSize="small" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteFlow(flow); }} className="delete" title="Delete">
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ============ MAIN CONTEXT DIAGRAM ============
export default function ContextDiagram({ projectId }) {
  const svgRef = useRef(null);
  const { user, role } = useAuth();
  const { activeProject } = useProjects();

  // State
  const [diagramId, setDiagramId] = useState(null);
  const [systemName, setSystemName] = useState(activeProject?.name || 'My System');
  const [centerLabel, setCenterLabel] = useState('System Under Design');
  const [actors, setActors] = useState([]);
  const [flows, setFlows] = useState([]);
  const [actorPositions, setActorPositions] = useState({});
  const [selectedActor, setSelectedActor] = useState(null);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null);
  const [showActorModal, setShowActorModal] = useState(false);
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [editingActor, setEditingActor] = useState(null);
  const [editingFlow, setEditingFlow] = useState(null);
  const [editingCenterLabel, setEditingCenterLabel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState([]);

  // Auto-save timer ref
  const autoSaveTimerRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Diagram dimensions
  const boundaryWidth = 300;
  const boundaryHeight = 200;
  const canvasWidth = 800;
  const canvasHeight = 600;

  // Load diagram on mount - wait for auth and project to be ready
  useEffect(() => {
    const loadDiagram = async () => {
      const pid = activeProject?.id || projectId;

      // Wait for both user and project to be ready
      if (!user || !role) {
        console.log('[ContextDiagram] Waiting for auth...', { user, role });
        return;
      }
      if (!pid) {
        console.log('[ContextDiagram] No project ID available', { activeProject, projectId });
        setIsLoading(false);
        return;
      }

      console.log('[ContextDiagram] Loading diagram for project:', pid, 'user:', user);
      setIsLoading(true);
      setLoadError(null);

      try {
        const res = await fetch(`/api/diagrams?type=context&project_id=${pid}`, {
          headers: { 'x-user': user, 'x-role': role },
        });

        console.log('[ContextDiagram] API response status:', res.status);

        if (res.ok) {
          const diagrams = await res.json();
          console.log('[ContextDiagram] Loaded diagrams:', diagrams.length, diagrams.map(d => ({ id: d.id, name: d.name })));

          if (diagrams.length > 0) {
            const diagram = diagrams[0];
            setDiagramId(diagram.id);
            setSystemName(diagram.name || activeProject?.name || 'My System');
            const elements = diagram.elements || {};
            setActors(elements.actors || []);
            setFlows(elements.flows || []);
            setActorPositions(elements.positions || {});
            setCenterLabel(elements.centerLabel || 'System Under Design');
            if (elements.versions) {
              setVersions(elements.versions);
            }
            setHasChanges(false);
            isInitialLoadRef.current = false;
            console.log('[ContextDiagram] Restored diagram:', diagram.id, 'with', elements.actors?.length || 0, 'actors');
          } else {
            // No existing diagram, reset to defaults
            console.log('[ContextDiagram] No existing diagram found, starting fresh');
            setDiagramId(null);
            setSystemName(activeProject?.name || 'My System');
            setCenterLabel('System Under Design');
            setActors([]);
            setFlows([]);
            setActorPositions({});
            setVersions([]);
            setHasChanges(false);
            isInitialLoadRef.current = false;
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error('[ContextDiagram] API error:', res.status, errData);
          setLoadError(`Failed to load: ${errData.error || res.statusText}`);
        }
      } catch (err) {
        console.error('[ContextDiagram] Failed to load diagram:', err);
        setLoadError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadDiagram();
  }, [activeProject?.id, projectId, user, role]);

  // Save diagram
  const saveDiagram = async () => {
    const pid = activeProject?.id || projectId;
    if (!pid) {
      console.error('[ContextDiagram] Cannot save - no project ID');
      setSaveError('No project selected');
      return;
    }
    if (!user || !role) {
      console.error('[ContextDiagram] Cannot save - not authenticated');
      setSaveError('Not authenticated');
      return;
    }

    console.log('[ContextDiagram] Saving diagram...', { diagramId, pid, actorCount: actors.length, flowCount: flows.length });
    setIsSaving(true);
    setSaveError(null);

    try {
      const newVersion = {
        id: `v-${Date.now()}`,
        savedAt: new Date().toISOString(),
        actorCount: actors.length,
        flowCount: flows.length,
        actors: [...actors],
        flows: [...flows],
        positions: { ...actorPositions },
        centerLabel,
      };
      const updatedVersions = [newVersion, ...versions].slice(0, 10);

      const payload = {
        name: systemName,
        type: 'context',
        elements: { actors, flows, positions: actorPositions, centerLabel, versions: updatedVersions },
        settings: { project_id: pid },
        domainId: null,
      };

      const method = diagramId ? 'PUT' : 'POST';
      const url = diagramId ? `/api/diagrams/${diagramId}` : '/api/diagrams';

      console.log('[ContextDiagram] API call:', method, url, payload);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        console.log('[ContextDiagram] Saved successfully:', saved.id);
        setDiagramId(saved.id);
        setVersions(updatedVersions);
        setHasChanges(false);
        setSaveError(null);
      } else {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        console.error('[ContextDiagram] Save failed:', res.status, err);
        setSaveError(err.error || err.details || 'Save failed');
      }
    } catch (err) {
      console.error('[ContextDiagram] Save error:', err);
      setSaveError(err.message);
    }
    setIsSaving(false);
  };

  // Auto-save effect - triggers when data changes
  useEffect(() => {
    const pid = activeProject?.id || projectId;

    // Don't auto-save during initial load, when loading, or if no project
    if (isInitialLoadRef.current || isLoading || !pid || !user || !role) {
      return;
    }

    // Don't auto-save if no changes
    if (!hasChanges) {
      return;
    }

    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      console.log('[ContextDiagram] Auto-saving...');
      saveDiagram();
    }, AUTO_SAVE_DELAY);

    // Cleanup on unmount or when deps change
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [actors, flows, actorPositions, centerLabel, systemName, hasChanges]);

  // Restore version
  const handleRestoreVersion = (version) => {
    setActors(version.actors || []);
    setFlows(version.flows || []);
    setActorPositions(version.positions || {});
    setCenterLabel(version.centerLabel || 'System Under Design');
    setHasChanges(true);
    setShowVersionHistory(false);
  };

  // Calculate actor positions around the boundary
  const calculatePositions = useCallback((actorList) => {
    const positions = {};
    const radius = 250;
    const count = actorList.length;

    actorList.forEach((actor, index) => {
      if (actorPositions[actor.id]) {
        positions[actor.id] = actorPositions[actor.id];
      } else {
        const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
        positions[actor.id] = { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
      }
    });
    return positions;
  }, [actorPositions]);

  const positions = useMemo(() => calculatePositions(actors), [actors, calculatePositions]);

  // Drag handlers
  const handleDragStart = (e, actor) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragTarget(actor);
  };

  // Actor CRUD
  const handleAddActor = () => { setEditingActor(null); setShowActorModal(true); };
  const handleEditActor = (actor) => { setEditingActor(actor); setShowActorModal(true); };
  const handleSaveActor = (actor) => {
    if (actors.find(a => a.id === actor.id)) {
      setActors(actors.map(a => a.id === actor.id ? actor : a));
    } else {
      setActors([...actors, actor]);
    }
    setShowActorModal(false);
    setEditingActor(null);
    setHasChanges(true);
  };
  const handleDeleteActor = (actor) => {
    if (confirm(`Delete actor "${actor.name}"?`)) {
      setActors(actors.filter(a => a.id !== actor.id));
      setFlows(flows.filter(f => f.actorId !== actor.id));
      setSelectedActor(null);
      setHasChanges(true);
    }
  };

  // Flow CRUD
  const handleAddFlow = () => { setEditingFlow(null); setShowFlowModal(true); };
  const handleEditFlow = (flow) => { setEditingFlow(flow); setShowFlowModal(true); };
  const handleSaveFlow = (flow) => {
    if (flows.find(f => f.id === flow.id)) {
      setFlows(flows.map(f => f.id === flow.id ? flow : f));
    } else {
      setFlows([...flows, flow]);
    }
    setShowFlowModal(false);
    setEditingFlow(null);
    setHasChanges(true);
  };
  const handleDeleteFlow = (flow) => {
    if (confirm(`Delete data flow "${flow.label}"?`)) {
      setFlows(flows.filter(f => f.id !== flow.id));
      setSelectedFlow(null);
      setHasChanges(true);
    }
  };

  // Selection handlers
  const handleSelectActor = (actor) => {
    setSelectedActor(actor);
    setSelectedFlow(null);
  };

  const handleSelectFlow = (flow) => {
    setSelectedFlow(flow);
    setSelectedActor(null);
  };

  // Zoom and pan
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Export functions with embedded styles and theme support
  const applyThemeToSvg = (svgClone, themeKey) => {
    const theme = EXPORT_THEMES[themeKey] || EXPORT_THEMES.light;

    // Update background rect
    const bgRect = svgClone.querySelector('rect[fill="url(#grid-large)"]');
    if (bgRect) {
      bgRect.setAttribute('fill', theme.background);
    }

    // Update grid patterns
    const gridSmallPath = svgClone.querySelector('#grid-small path');
    if (gridSmallPath) {
      gridSmallPath.setAttribute('stroke', theme.grid);
    }
    const gridLargePath = svgClone.querySelector('#grid-large path');
    if (gridLargePath) {
      gridLargePath.setAttribute('stroke', theme.gridMajor);
    }

    // Update system boundary
    const boundaryRect = svgClone.querySelector('.system-boundary rect:first-child');
    if (boundaryRect) {
      boundaryRect.setAttribute('fill', theme.boundary);
      boundaryRect.setAttribute('stroke', theme.boundaryStroke);
    }

    // Update boundary label background (blue rect)
    const labelRect = svgClone.querySelector('.system-boundary rect:nth-child(2)');
    if (labelRect) {
      labelRect.setAttribute('fill', theme.boundaryStroke);
    }

    // Update center label text
    const centerText = svgClone.querySelectorAll('.system-boundary text');
    centerText.forEach((text, idx) => {
      if (idx === 0) {
        // Title text in blue box stays white
      } else if (idx === 1) {
        // Center label
        text.setAttribute('fill', theme.textLabel);
      }
    });

    // Update actor nodes
    svgClone.querySelectorAll('.actor-node circle').forEach(circle => {
      if (circle.getAttribute('r') === '40') {
        circle.setAttribute('fill', theme.actorBg);
      }
    });

    // Update actor text
    svgClone.querySelectorAll('.actor-node text').forEach((text, idx) => {
      const fontSize = text.getAttribute('font-size');
      if (fontSize === '12') {
        text.setAttribute('fill', theme.text);
      } else if (fontSize === '10') {
        text.setAttribute('fill', theme.textMuted);
      }
    });

    // Update flow labels
    svgClone.querySelectorAll('.data-flow rect').forEach(rect => {
      if (rect.getAttribute('fill') === '#ffffff') {
        rect.setAttribute('fill', theme.flowLabelBg);
      }
    });

    return theme;
  };

  const handleExportSVG = (themeKey = 'current') => {
    if (!svgRef.current) return;

    const exportTheme = themeKey === 'current' ? getCurrentTheme() : themeKey;
    const theme = EXPORT_THEMES[exportTheme] || EXPORT_THEMES.light;

    // Clone SVG and add embedded font
    const svgClone = svgRef.current.cloneNode(true);

    // Add style element with font
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      text { font-family: 'Inter', Arial, sans-serif; }
    `;
    svgClone.insertBefore(styleEl, svgClone.firstChild);

    // Apply theme colors
    applyThemeToSvg(svgClone, exportTheme);

    // Add background
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', -canvasWidth / 2);
    bgRect.setAttribute('y', -canvasHeight / 2);
    bgRect.setAttribute('width', canvasWidth);
    bgRect.setAttribute('height', canvasHeight);
    bgRect.setAttribute('fill', theme.background);
    const firstG = svgClone.querySelector('g');
    if (firstG) {
      svgClone.insertBefore(bgRect, firstG);
    }

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const themeSuffix = exportTheme === 'dark' ? '-dark' : '';
    a.download = `${systemName}-context-diagram${themeSuffix}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportPNG = (themeKey = 'current') => {
    if (!svgRef.current) return;

    const exportTheme = themeKey === 'current' ? getCurrentTheme() : themeKey;
    const theme = EXPORT_THEMES[exportTheme] || EXPORT_THEMES.light;

    // Clone SVG
    const svgClone = svgRef.current.cloneNode(true);

    // Apply theme colors
    applyThemeToSvg(svgClone, exportTheme);

    // Add background rect at the beginning
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', -canvasWidth / 2);
    bgRect.setAttribute('y', -canvasHeight / 2);
    bgRect.setAttribute('width', canvasWidth);
    bgRect.setAttribute('height', canvasHeight);
    bgRect.setAttribute('fill', theme.background);
    const firstG = svgClone.querySelector('g');
    if (firstG) {
      svgClone.insertBefore(bgRect, firstG);
    }

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = canvasWidth * 2;
      canvas.height = canvasHeight * 2;
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      const themeSuffix = exportTheme === 'dark' ? '-dark' : '';
      a.download = `${systemName}-context-diagram${themeSuffix}.png`;
      a.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    setShowExportMenu(false);
  };

  // Canvas click to deselect
  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget || e.target.tagName === 'svg') {
      setSelectedActor(null);
      setSelectedFlow(null);
    }
  };

  // Compute effective project ID for display
  const effectivePid = activeProject?.id || projectId;

  return (
    <div className="context-diagram-view">
      {/* Header */}
      <div className="diagram-header">
        <div className="header-title">
          <BubbleChartIcon style={{ fontSize: 28, color: '#3b82f6' }} />
          <div>
            <h2>Context Diagram</h2>
            <span className="subtitle">Define system boundaries and external actors</span>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{actors.length}</span>
            <span className="stat-label">Actors</span>
          </div>
          <div className="stat">
            <span className="stat-value">{flows.length}</span>
            <span className="stat-label">Data Flows</span>
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
          {(loadError || saveError) && (
            <div className="stat" style={{ color: '#ef4444' }}>
              <span className="stat-label">{loadError || saveError}</span>
            </div>
          )}
        </div>
      </div>

      {/* System Name Bar */}
      <div className="system-name-bar">
        <label>System Name:</label>
        <input
          type="text"
          value={systemName}
          onChange={(e) => { setSystemName(e.target.value); setHasChanges(true); }}
          className="system-name-input"
          placeholder="Enter system name..."
          disabled={isLoading}
        />
      </div>

      {/* Toolbar */}
      <div className="diagram-toolbar">
        <div className="toolbar-actions">
          <button onClick={handleAddActor} className="btn-tool">
            <AddIcon fontSize="small" />
            <span>Add Actor</span>
          </button>
          <button onClick={handleAddFlow} className="btn-tool" disabled={actors.length === 0}>
            <AddIcon fontSize="small" />
            <span>Add Data Flow</span>
          </button>
        </div>

        <div className="toolbar-view">
          <button onClick={handleZoomOut} title="Zoom Out"><ZoomOutIcon fontSize="small" /></button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} title="Zoom In"><ZoomInIcon fontSize="small" /></button>
          <button onClick={handleResetView} title="Reset View"><CenterFocusStrongIcon fontSize="small" /></button>
        </div>

        <div className="toolbar-export">
          <div className="export-dropdown">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="btn-tool">
              <DownloadIcon fontSize="small" />
              <span>Export</span>
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <div className="export-menu-section">
                  <span className="export-menu-label">SVG</span>
                  <button onClick={() => handleExportSVG('current')}><AutoModeIcon fontSize="small" /> Current Theme</button>
                  <button onClick={() => handleExportSVG('light')}><LightModeIcon fontSize="small" /> Light</button>
                  <button onClick={() => handleExportSVG('dark')}><DarkModeIcon fontSize="small" /> Dark</button>
                </div>
                <div className="export-menu-section">
                  <span className="export-menu-label">PNG</span>
                  <button onClick={() => handleExportPNG('current')}><AutoModeIcon fontSize="small" /> Current Theme</button>
                  <button onClick={() => handleExportPNG('light')}><LightModeIcon fontSize="small" /> Light</button>
                  <button onClick={() => handleExportPNG('dark')}><DarkModeIcon fontSize="small" /> Dark</button>
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setShowVersionHistory(!showVersionHistory)} className="btn-tool" title="Version History">
            <HistoryIcon fontSize="small" />
            <span>History</span>
          </button>
          <button onClick={saveDiagram} className="btn-save" disabled={isSaving || isLoading || !hasChanges || !effectivePid} title="Auto-saves after 2 seconds of inactivity">
            <SaveIcon fontSize="small" />
            <span>{isSaving ? 'Saving...' : 'Save Now'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="diagram-content">
        {/* Canvas */}
        <div className="diagram-canvas-container" onClick={handleCanvasClick}>
          <svg
            ref={svgRef}
            className="diagram-canvas"
            viewBox={`${-canvasWidth / 2} ${-canvasHeight / 2} ${canvasWidth} ${canvasHeight}`}
            style={{ cursor: isDragging ? 'grabbing' : 'default', userSelect: 'none' }}
            onMouseMove={(e) => {
              if (isDragging && dragTarget && svgRef.current) {
                const svg = svgRef.current;
                const rect = svg.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) / zoom - pan.x;
                const y = (e.clientY - rect.top - rect.height / 2) / zoom - pan.y;
                setActorPositions(prev => ({ ...prev, [dragTarget.id]: { x, y } }));
                setHasChanges(true);
              }
            }}
            onMouseUp={() => { setIsDragging(false); setDragTarget(null); }}
            onMouseLeave={() => { setIsDragging(false); setDragTarget(null); }}
          >
            {/* Grid pattern for zoom reference */}
            <defs>
              <pattern id="grid-small" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#grid-small)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#d1d5db" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Background grid - scales with zoom */}
            <rect
              x={-canvasWidth / 2}
              y={-canvasHeight / 2}
              width={canvasWidth}
              height={canvasHeight}
              fill="url(#grid-large)"
              transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
            />

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              <SystemBoundary
                name={systemName}
                width={boundaryWidth}
                height={boundaryHeight}
                centerLabel={centerLabel}
                onCenterLabelClick={() => setEditingCenterLabel(true)}
              />

              {flows.map(flow => {
                const actor = actors.find(a => a.id === flow.actorId);
                if (!actor) return null;
                const actorPos = positions[actor.id] || { x: 0, y: 0 };
                const angle = Math.atan2(actorPos.y, actorPos.x);
                const boundaryPos = {
                  x: Math.cos(angle) * (boundaryWidth / 2 + 10),
                  y: Math.sin(angle) * (boundaryHeight / 2 + 10),
                };
                return (
                  <DataFlowLine
                    key={flow.id}
                    flow={flow}
                    fromPos={flow.direction === 'outbound' ? boundaryPos : actorPos}
                    toPos={flow.direction === 'outbound' ? actorPos : boundaryPos}
                    isSelected={selectedFlow?.id === flow.id}
                    onSelect={handleSelectFlow}
                  />
                );
              })}

              {actors.map(actor => (
                <ActorNode
                  key={actor.id}
                  actor={actor}
                  position={positions[actor.id] || { x: 0, y: 0 }}
                  isSelected={selectedActor?.id === actor.id}
                  onSelect={handleSelectActor}
                  onDragStart={handleDragStart}
                />
              ))}
            </g>
          </svg>

          {/* Empty State Hint - non-intrusive text only */}
          {actors.length === 0 && (
            <div className="diagram-empty-hint">
              <p>Use the toolbar to add actors and data flows</p>
            </div>
          )}
        </div>

        {/* Side Panel */}
        {showVersionHistory ? (
          <VersionHistoryPanel
            versions={versions}
            currentVersion={versions[0]?.id}
            onRestore={handleRestoreVersion}
            onClose={() => setShowVersionHistory(false)}
          />
        ) : (
          <ActorsListPanel
            actors={actors}
            flows={flows}
            selectedActor={selectedActor}
            selectedFlow={selectedFlow}
            onSelectActor={handleSelectActor}
            onSelectFlow={handleSelectFlow}
            onEditActor={handleEditActor}
            onDeleteActor={handleDeleteActor}
            onEditFlow={handleEditFlow}
            onDeleteFlow={handleDeleteFlow}
          />
        )}
      </div>

      {/* Modals */}
      {showActorModal && (
        <ActorFormModal
          actor={editingActor}
          onSave={handleSaveActor}
          onClose={() => { setShowActorModal(false); setEditingActor(null); }}
        />
      )}
      {showFlowModal && (
        <FlowFormModal
          flow={editingFlow}
          actors={actors}
          onSave={handleSaveFlow}
          onClose={() => { setShowFlowModal(false); setEditingFlow(null); }}
        />
      )}

      {/* Center Label Edit Modal */}
      {editingCenterLabel && (
        <div className="modal-overlay" onClick={() => setEditingCenterLabel(false)}>
          <div className="context-form-modal small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Center Label</h3>
              <button onClick={() => setEditingCenterLabel(false)} className="close-btn">×</button>
            </div>
            <div className="form-group">
              <label>Label Text</label>
              <input
                type="text"
                value={centerLabel}
                onChange={(e) => { setCenterLabel(e.target.value); setHasChanges(true); }}
                placeholder="e.g., System Under Design"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setEditingCenterLabel(false)} className="btn-primary">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ActorNode, SystemBoundary, DataFlowLine, ACTOR_TYPES, FLOW_TYPES };
