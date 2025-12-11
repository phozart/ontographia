// components/DiagramSidebar.js
import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LoopIcon from '@mui/icons-material/Loop';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const typeIcons = {
  flowchart: AccountTreeIcon,
  'causal-loop': LoopIcon,
  mindmap: BubbleChartIcon,
};

export default function DiagramSidebar({
  diagrams = [],
  activeDiagram,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onImport,
  onExport,
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  diagramType,
  nodeTypes = [],
  edgeTypes = [],
  collapsed = false,
  onToggleCollapse,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState('');
  const [newDiagramType, setNewDiagramType] = useState('flowchart');

  const handleStartRename = (diagram) => {
    setEditingId(diagram.id);
    setEditName(diagram.name);
  };

  const handleSaveRename = () => {
    if (editingId && editName.trim() && onRename) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCreateNew = () => {
    if (newDiagramName.trim() && onNew) {
      onNew(newDiagramName.trim(), newDiagramType);
    }
    setShowNewDialog(false);
    setNewDiagramName('');
    setNewDiagramType('flowchart');
  };

  if (collapsed) {
    return (
      <div className="studio-sidepanel--collapsed">
        <Tooltip title="Show sidebar" placement="left">
          <button
            type="button"
            className="sidepanel-show-btn"
            onClick={onToggleCollapse}
            aria-label="Show sidebar"
          >
            <ChevronLeftIcon fontSize="small" style={{ transform: 'rotate(180deg)' }} />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="studio-sidepanel diagram-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h3 style={{ margin: 0, fontSize: 16 }}>Diagrams</h3>
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="New diagram">
            <IconButton size="small" onClick={() => setShowNewDialog(true)}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {onToggleCollapse && (
            <Tooltip title="Hide sidebar">
              <IconButton size="small" onClick={onToggleCollapse}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Diagram List */}
      <div className="diagram-list">
        {diagrams.length === 0 && (
          <div className="diagram-empty">
            <p>No diagrams yet</p>
            <button className="btn" onClick={() => setShowNewDialog(true)}>
              Create your first diagram
            </button>
          </div>
        )}
        {diagrams.map(d => {
          const TypeIcon = typeIcons[d.type] || AccountTreeIcon;
          const isActive = activeDiagram?.id === d.id;
          const isEditing = editingId === d.id;

          return (
            <div
              key={d.id}
              className={`diagram-list-item ${isActive ? 'active' : ''}`}
              onClick={() => !isEditing && onSelect(d)}
            >
              <TypeIcon fontSize="small" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={handleSaveRename}
                  onKeyDown={e => e.key === 'Enter' && handleSaveRename()}
                  autoFocus
                  className="diagram-name-input"
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span className="diagram-name">{d.name}</span>
              )}
              <span className={`diagram-type-badge diagram-type-badge--${d.type}`}>
                {d.type === 'causal-loop' ? 'CLD' : d.type === 'mindmap' ? 'MM' : 'FC'}
              </span>
              {isActive && !isEditing && (
                <div className="diagram-actions">
                  <Tooltip title="Rename">
                    <IconButton size="small" onClick={e => { e.stopPropagation(); handleStartRename(d); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={e => { e.stopPropagation(); onDelete(d.id); }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Element Properties */}
      {(selectedNode || selectedEdge) && (
        <div className="properties-panel">
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>
            {selectedNode ? 'Node Properties' : 'Edge Properties'}
          </h4>

          {selectedNode && (
            <div className="properties-form">
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={selectedNode.data?.label || ''}
                  onChange={e => onUpdateNode({ ...selectedNode.data, label: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={selectedNode.data?.nodeType || ''}
                  onChange={e => onUpdateNode({ ...selectedNode.data, nodeType: e.target.value })}
                >
                  {nodeTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn-danger"
                style={{ marginTop: 12 }}
                onClick={() => onDeleteNode(selectedNode.id)}
              >
                Delete Node
              </button>
            </div>
          )}

          {selectedEdge && (
            <div className="properties-form">
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={selectedEdge.label || ''}
                  onChange={e => onUpdateEdge({ ...selectedEdge, label: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={selectedEdge.edgeType || ''}
                  onChange={e => onUpdateEdge({ ...selectedEdge, edgeType: e.target.value })}
                >
                  {edgeTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn-danger"
                style={{ marginTop: 12 }}
                onClick={() => onDeleteEdge(selectedEdge.id)}
              >
                Delete Connection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {activeDiagram && (
        <div className="sidebar-actions">
          <Tooltip title="Import diagram to Knowledge Graph">
            <button className="btn" onClick={() => onImport(activeDiagram)}>
              <UploadIcon fontSize="small" style={{ marginRight: 6 }} />
              Import to Graph
            </button>
          </Tooltip>
          <Tooltip title="Export diagram as JSON">
            <button className="btn-secondary" onClick={() => onExport(activeDiagram)}>
              <DownloadIcon fontSize="small" style={{ marginRight: 6 }} />
              Export
            </button>
          </Tooltip>
        </div>
      )}

      {/* New Diagram Dialog */}
      {showNewDialog && (
        <div className="modal-backdrop" onClick={() => setShowNewDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>New Diagram</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newDiagramName}
                  onChange={e => setNewDiagramName(e.target.value)}
                  placeholder="My Diagram"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={newDiagramType}
                  onChange={e => setNewDiagramType(e.target.value)}
                >
                  <option value="flowchart">Flowchart</option>
                  <option value="causal-loop">Causal Loop Diagram</option>
                  <option value="mindmap">Mindmap</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowNewDialog(false)}>
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleCreateNew}
                disabled={!newDiagramName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
