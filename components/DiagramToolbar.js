// components/DiagramToolbar.js
import Tooltip from '@mui/material/Tooltip';
import MouseIcon from '@mui/icons-material/Mouse';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TimelineIcon from '@mui/icons-material/Timeline';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LoopIcon from '@mui/icons-material/Loop';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';

const editorTools = [
  { id: 'select', icon: MouseIcon, label: 'Select', tooltip: 'Select and move nodes' },
  { id: 'draw-node', icon: AddCircleOutlineIcon, label: 'Add Node', tooltip: 'Click to add a node' },
  { id: 'draw-connection', icon: TimelineIcon, label: 'Connect', tooltip: 'Click two nodes to connect them' },
];

const diagramTypes = [
  { id: 'flowchart', icon: AccountTreeIcon, label: 'Flowchart', tooltip: 'Create flowcharts with process steps and decisions' },
  { id: 'causal-loop', icon: LoopIcon, label: 'Causal Loop', tooltip: 'Create causal loop diagrams with feedback relationships' },
  { id: 'mindmap', icon: BubbleChartIcon, label: 'Mindmap', tooltip: 'Create mindmaps with hierarchical ideas' },
];

export default function DiagramToolbar({
  editorMode,
  onModeChange,
  diagramType,
  onDiagramTypeChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  connectionState = null,
}) {
  return (
    <div className="drawing-toolbar">
      {/* Diagram Type Selector */}
      <div className="drawing-toolbar-section">
        <span className="toolbar-section-label">Diagram Type</span>
        <div className="drawing-toolbar-tools">
          {diagramTypes.map(type => {
            const Icon = type.icon;
            const isActive = diagramType === type.id;
            return (
              <Tooltip key={type.id} title={type.tooltip} placement="bottom">
                <button
                  type="button"
                  className={`drawing-tool ${isActive ? 'active' : ''}`}
                  onClick={() => onDiagramTypeChange(type.id)}
                  aria-pressed={isActive}
                >
                  <Icon fontSize="small" />
                  <span className="drawing-tool-label">{type.label}</span>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* Editor Tools */}
      <div className="drawing-toolbar-section">
        <span className="toolbar-section-label">Tools</span>
        <div className="drawing-toolbar-tools">
          {editorTools.map(tool => {
            const Icon = tool.icon;
            const isActive = editorMode === tool.id;
            return (
              <Tooltip key={tool.id} title={tool.tooltip} placement="bottom">
                <button
                  type="button"
                  className={`drawing-tool ${isActive ? 'active' : ''}`}
                  onClick={() => onModeChange(tool.id)}
                  aria-pressed={isActive}
                >
                  <Icon fontSize="small" />
                  <span className="drawing-tool-label">{tool.label}</span>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Connection State Indicator */}
      {connectionState && connectionState.sourceId && (
        <div className="drawing-toolbar-status">
          <span className="status-badge status-badge--connecting">
            Select target node
          </span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Undo/Redo */}
      <div className="drawing-toolbar-actions">
        {onUndo && (
          <Tooltip title="Undo (Ctrl+Z)" placement="bottom">
            <span>
              <button
                type="button"
                className="drawing-tool"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label="Undo"
              >
                <UndoIcon fontSize="small" />
              </button>
            </span>
          </Tooltip>
        )}
        {onRedo && (
          <Tooltip title="Redo (Ctrl+Y)" placement="bottom">
            <span>
              <button
                type="button"
                className="drawing-tool"
                onClick={onRedo}
                disabled={!canRedo}
                aria-label="Redo"
              >
                <RedoIcon fontSize="small" />
              </button>
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
