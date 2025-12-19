// components/srs/canvas/CanvasNode.js
// Draggable node component for canvas elements
// Base component for all space-specific nodes

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSRS } from '../SRSContext';

// MUI Icons
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function CanvasNode({
  id,
  type,
  x = 0,
  y = 0,
  width = 200,
  minWidth = 150,
  maxWidth = 400,
  color = '#3b82f6',
  icon: Icon,
  title,
  subtitle,
  children,
  selected = false,
  onSelect,
  onPositionChange,
  onEdit,
  onDelete,
  onStartConnection,
  className = '',
  resizable = false,
  connectionPoints = ['right'],
}) {
  const { canvasPosition } = useSRS();
  const nodeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x, y });
  const [showMenu, setShowMenu] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [isResizing, setIsResizing] = useState(false);

  // Sync position from props
  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  // Handle drag start
  const handleDragStart = useCallback((e) => {
    if (e.target.closest('.srs-node-menu') || e.target.closest('.srs-node-connection-point')) {
      return;
    }

    e.stopPropagation();
    setIsDragging(true);

    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate offset in canvas coordinates
    const offsetX = (e.clientX - rect.left) / canvasPosition.zoom;
    const offsetY = (e.clientY - rect.top) / canvasPosition.zoom;
    setDragOffset({ x: offsetX, y: offsetY });

    onSelect?.(id, type);
  }, [id, type, onSelect, canvasPosition.zoom]);

  // Handle drag move
  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;

    const container = nodeRef.current?.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    // Calculate new position in canvas coordinates
    const newX = (e.clientX - containerRect.left) / canvasPosition.zoom - dragOffset.x;
    const newY = (e.clientY - containerRect.top) / canvasPosition.zoom - dragOffset.y;

    // Snap to grid (20px)
    const snappedX = Math.round(newX / 20) * 20;
    const snappedY = Math.round(newY / 20) * 20;

    setPosition({ x: snappedX, y: snappedY });
  }, [isDragging, dragOffset, canvasPosition.zoom]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange?.(id, position.x, position.y);
    }
  }, [isDragging, id, position, onPositionChange]);

  // Handle resize
  const handleResizeStart = useCallback((e) => {
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  const handleResizeMove = useCallback((e) => {
    if (!isResizing) return;

    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newWidth = Math.max(minWidth, Math.min(maxWidth,
      (e.clientX - rect.left) / canvasPosition.zoom
    ));
    setNodeWidth(newWidth);
  }, [isResizing, minWidth, maxWidth, canvasPosition.zoom]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Global mouse listeners for drag and resize
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Handle click
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect?.(id, type);
  }, [id, type, onSelect]);

  // Handle menu actions
  const handleMenuAction = useCallback((action) => {
    setShowMenu(false);
    switch (action) {
      case 'edit':
        onEdit?.(id);
        break;
      case 'delete':
        onDelete?.(id);
        break;
      case 'connect':
        onStartConnection?.(id, type);
        break;
    }
  }, [id, type, onEdit, onDelete, onStartConnection]);

  // Close menu on outside click
  useEffect(() => {
    if (showMenu) {
      const handleClickOutside = () => setShowMenu(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div
      ref={nodeRef}
      className={`srs-node ${selected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: nodeWidth,
        '--node-color': color,
      }}
      onClick={handleClick}
    >
      {/* Header */}
      <div
        className="srs-node-header"
        onMouseDown={handleDragStart}
        style={{ borderTopColor: color }}
      >
        <div className="srs-node-header-left">
          <DragIndicatorIcon className="srs-node-drag-handle" fontSize="small" />
          {Icon && <Icon className="srs-node-icon" fontSize="small" style={{ color }} />}
          <div className="srs-node-titles">
            <span className="srs-node-title">{title}</span>
            {subtitle && <span className="srs-node-subtitle">{subtitle}</span>}
          </div>
        </div>

        <div className="srs-node-header-right">
          <button
            className="srs-node-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="srs-node-menu" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => handleMenuAction('edit')}>
                <EditIcon fontSize="small" />
                <span>Edit</span>
              </button>
              <button onClick={() => handleMenuAction('connect')}>
                <LinkIcon fontSize="small" />
                <span>Connect</span>
              </button>
              <button onClick={() => handleMenuAction('delete')} className="danger">
                <DeleteIcon fontSize="small" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="srs-node-content">
        {children}
      </div>

      {/* Connection Points */}
      {connectionPoints.map((point) => (
        <div
          key={point}
          className={`srs-node-connection-point srs-node-connection-point--${point}`}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartConnection?.(id, type, point);
          }}
          title="Drag to connect"
        >
          <LinkIcon fontSize="small" />
        </div>
      ))}

      {/* Resize Handle */}
      {resizable && (
        <div
          className="srs-node-resize-handle"
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
}
