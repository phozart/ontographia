// components/DrawingToolbar.js
import Tooltip from '@mui/material/Tooltip';
import MouseIcon from '@mui/icons-material/Mouse';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TimelineIcon from '@mui/icons-material/Timeline';
import UndoIcon from '@mui/icons-material/Undo';

const tools = [
  { id: 'select', icon: MouseIcon, label: 'Select', tooltip: 'Select and move nodes' },
  { id: 'draw-node', icon: AddCircleOutlineIcon, label: 'Draw Node', tooltip: 'Click on canvas to create a node' },
  { id: 'draw-connection', icon: TimelineIcon, label: 'Connect', tooltip: 'Click two nodes to connect them, or drag from one to another' },
];

export default function DrawingToolbar({
  editorMode,
  onModeChange,
  onUndo,
  canUndo = false,
  connectionState = null,
}) {
  return (
    <div className="drawing-toolbar">
      <div className="drawing-toolbar-tools">
        {tools.map(tool => {
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

      {connectionState && connectionState.sourceId && (
        <div className="drawing-toolbar-status">
          <span className="status-badge status-badge--connecting">
            Connecting: Select target node
          </span>
        </div>
      )}

      <div className="drawing-toolbar-actions">
        {onUndo && (
          <Tooltip title="Undo last action" placement="bottom">
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
      </div>
    </div>
  );
}
