/**
 * FrameRenderer Component
 * Renders a frame element on the canvas
 */

import React, { useState, useCallback, useRef } from 'react';

/**
 * Frame title bar component
 */
function FrameTitle({ frame, scale, onTitleChange, onTitleDoubleClick }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(frame.name);
  const inputRef = useRef(null);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(frame.name);
    onTitleDoubleClick?.();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== frame.name) {
      onTitleChange(editValue.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(frame.name);
    }
  };

  if (!frame.titleVisible) return null;

  const titleY = frame.titlePosition === 'bottom'
    ? frame.position.y + frame.size.height + 8
    : frame.position.y - 28;

  return (
    <g transform={`translate(${frame.position.x}, ${titleY})`}>
      {isEditing ? (
        <foreignObject width={200} height={24} style={{ overflow: 'visible' }}>
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              border: '1px solid #3b82f6',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 14 / scale,
              fontWeight: 600,
              outline: 'none',
            }}
          />
        </foreignObject>
      ) : (
        <text
          className="frame-title"
          fontSize={14 / scale}
          fontWeight={600}
          fill="#666666"
          style={{ cursor: 'text', userSelect: 'none' }}
          onDoubleClick={handleDoubleClick}
        >
          {frame.name}
        </text>
      )}
    </g>
  );
}

/**
 * Resize handles for frame
 */
function ResizeHandles({ frame, scale, onResizeStart }) {
  const handleSize = 8 / scale;
  const handles = [
    { position: 'nw', x: frame.position.x, y: frame.position.y, cursor: 'nwse-resize' },
    { position: 'n', x: frame.position.x + frame.size.width / 2, y: frame.position.y, cursor: 'ns-resize' },
    { position: 'ne', x: frame.position.x + frame.size.width, y: frame.position.y, cursor: 'nesw-resize' },
    { position: 'e', x: frame.position.x + frame.size.width, y: frame.position.y + frame.size.height / 2, cursor: 'ew-resize' },
    { position: 'se', x: frame.position.x + frame.size.width, y: frame.position.y + frame.size.height, cursor: 'nwse-resize' },
    { position: 's', x: frame.position.x + frame.size.width / 2, y: frame.position.y + frame.size.height, cursor: 'ns-resize' },
    { position: 'sw', x: frame.position.x, y: frame.position.y + frame.size.height, cursor: 'nesw-resize' },
    { position: 'w', x: frame.position.x, y: frame.position.y + frame.size.height / 2, cursor: 'ew-resize' },
  ];

  return (
    <g className="resize-handles">
      {handles.map((handle) => (
        <rect
          key={handle.position}
          x={handle.x - handleSize / 2}
          y={handle.y - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="#ffffff"
          stroke="#3b82f6"
          strokeWidth={1 / scale}
          rx={2 / scale}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => onResizeStart(e, handle.position)}
        />
      ))}
    </g>
  );
}

/**
 * Main FrameRenderer component
 */
export function FrameRenderer({
  frame,
  isSelected = false,
  scale = 1,
  onSelect,
  onMove,
  onResize,
  onTitleChange,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef(null);
  const resizeStartRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    if (frame.locked) return;

    e.stopPropagation();
    onSelect?.(frame.id, e.shiftKey);

    if (e.button !== 0) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      frameX: frame.position.x,
      frameY: frame.position.y,
    };

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - dragStartRef.current.x) / scale;
      const dy = (moveEvent.clientY - dragStartRef.current.y) / scale;

      onMove?.(frame.id, {
        x: dragStartRef.current.frameX + dx,
        y: dragStartRef.current.frameY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [frame, scale, onSelect, onMove]);

  const handleResizeStart = useCallback((e, position) => {
    if (frame.locked) return;

    e.stopPropagation();
    setIsResizing(true);

    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      position,
      frameX: frame.position.x,
      frameY: frame.position.y,
      frameWidth: frame.size.width,
      frameHeight: frame.size.height,
    };

    const handleMouseMove = (moveEvent) => {
      const dx = (moveEvent.clientX - resizeStartRef.current.x) / scale;
      const dy = (moveEvent.clientY - resizeStartRef.current.y) / scale;
      const { position: pos, frameX, frameY, frameWidth, frameHeight } = resizeStartRef.current;

      let newX = frameX;
      let newY = frameY;
      let newWidth = frameWidth;
      let newHeight = frameHeight;

      if (pos.includes('e')) {
        newWidth = Math.max(50, frameWidth + dx);
      }
      if (pos.includes('w')) {
        newWidth = Math.max(50, frameWidth - dx);
        newX = frameX + (frameWidth - newWidth);
      }
      if (pos.includes('s')) {
        newHeight = Math.max(50, frameHeight + dy);
      }
      if (pos.includes('n')) {
        newHeight = Math.max(50, frameHeight - dy);
        newY = frameY + (frameHeight - newHeight);
      }

      onResize?.(frame.id, {
        position: { x: newX, y: newY },
        size: { width: newWidth, height: newHeight },
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [frame, scale, onResize]);

  const strokeWidth = 1 / scale;
  const dashArray = frame.locked ? `${4 / scale} ${2 / scale}` : 'none';

  return (
    <g
      className="frame"
      data-frame-id={frame.id}
      style={{ cursor: isDragging ? 'grabbing' : (frame.locked ? 'default' : 'grab') }}
    >
      {/* Background */}
      <rect
        x={frame.position.x}
        y={frame.position.y}
        width={frame.size.width}
        height={frame.size.height}
        fill={frame.backgroundColor || 'rgba(0,0,0,0.02)'}
        stroke={isSelected ? '#3b82f6' : (frame.borderColor || '#e5e7eb')}
        strokeWidth={isSelected ? 2 / scale : strokeWidth}
        strokeDasharray={dashArray}
        rx={8 / scale}
        onMouseDown={handleMouseDown}
      />

      {/* Title */}
      <FrameTitle
        frame={frame}
        scale={scale}
        onTitleChange={(name) => onTitleChange?.(frame.id, name)}
      />

      {/* Order badge */}
      {typeof frame.order === 'number' && (
        <g transform={`translate(${frame.position.x + frame.size.width - 24 / scale}, ${frame.position.y + 8 / scale})`}>
          <circle
            cx={8 / scale}
            cy={8 / scale}
            r={12 / scale}
            fill="#3b82f6"
          />
          <text
            x={8 / scale}
            y={12 / scale}
            textAnchor="middle"
            fontSize={10 / scale}
            fontWeight={600}
            fill="#ffffff"
          >
            {frame.order}
          </text>
        </g>
      )}

      {/* Resize handles when selected */}
      {isSelected && !frame.locked && (
        <ResizeHandles
          frame={frame}
          scale={scale}
          onResizeStart={handleResizeStart}
        />
      )}

      {/* Lock indicator */}
      {frame.locked && (
        <g transform={`translate(${frame.position.x + 8 / scale}, ${frame.position.y + 8 / scale})`}>
          <text fontSize={14 / scale} fill="#9ca3af">🔒</text>
        </g>
      )}
    </g>
  );
}

export default FrameRenderer;
