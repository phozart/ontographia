/**
 * FrameNavigator Component
 * Panel for navigating between frames and managing presentation order
 */

import React, { useMemo, useCallback, useState } from 'react';
import { useDiagram, useDiagramViewport } from '../../hooks/useDiagram.js';

/**
 * Frame thumbnail preview
 */
function FrameThumbnail({ frame, isActive, onClick, onDragStart, onDrop }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', frame.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(frame.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId !== frame.id) {
      onDrop?.(draggedId, frame.id);
    }
  };

  const thumbnailStyle = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: frame.backgroundColor || '#f9fafb',
    border: `2px solid ${isActive ? '#3b82f6' : (isDragOver ? '#93c5fd' : '#e5e7eb')}`,
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    transition: 'border-color 0.15s, transform 0.15s',
    transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
  };

  const orderBadgeStyle = {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 500,
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ padding: 4 }}
    >
      <div style={thumbnailStyle} onClick={() => onClick(frame)}>
        {typeof frame.order === 'number' && (
          <div style={orderBadgeStyle}>{frame.order}</div>
        )}
        {frame.locked && (
          <span style={{ position: 'absolute', top: 4, right: 4, fontSize: 12 }}>🔒</span>
        )}
      </div>
      <div style={labelStyle} title={frame.name}>
        {frame.name}
      </div>
    </div>
  );
}

/**
 * Frame Navigator Panel
 */
export function FrameNavigator({
  onFrameClick,
  onFrameReorder,
  onCreateFrame,
  onDeleteFrame,
  showControls = true,
}) {
  const { state, dispatch } = useDiagram();
  const { panTo, zoom } = useDiagramViewport();
  const [draggedId, setDraggedId] = useState(null);

  const frames = useMemo(() => {
    const frameList = Object.values(state.frames || {});
    return frameList.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [state.frames]);

  const activeFrameId = useMemo(() => {
    // Determine which frame is currently visible in viewport
    const viewport = state.viewport;
    const viewportCenter = {
      x: -viewport.x / viewport.zoom + 600,
      y: -viewport.y / viewport.zoom + 400,
    };

    for (const frame of frames) {
      if (
        viewportCenter.x >= frame.position.x &&
        viewportCenter.x <= frame.position.x + frame.size.width &&
        viewportCenter.y >= frame.position.y &&
        viewportCenter.y <= frame.position.y + frame.size.height
      ) {
        return frame.id;
      }
    }
    return null;
  }, [frames, state.viewport]);

  const handleFrameClick = useCallback((frame) => {
    // Navigate to frame
    const centerX = -(frame.position.x + frame.size.width / 2 - 600);
    const centerY = -(frame.position.y + frame.size.height / 2 - 400);

    panTo(centerX, centerY);
    onFrameClick?.(frame);
  }, [panTo, onFrameClick]);

  const handleReorder = useCallback((draggedId, targetId) => {
    const draggedFrame = state.frames[draggedId];
    const targetFrame = state.frames[targetId];

    if (!draggedFrame || !targetFrame) return;

    // Swap orders
    const newOrder = targetFrame.order;
    dispatch({
      type: 'UPDATE_FRAME',
      payload: { id: draggedId, updates: { order: newOrder } },
    });
    dispatch({
      type: 'UPDATE_FRAME',
      payload: { id: targetId, updates: { order: draggedFrame.order } },
    });

    onFrameReorder?.(draggedId, targetId);
  }, [state.frames, dispatch, onFrameReorder]);

  const handleCreateFrame = useCallback(() => {
    const newFrame = {
      id: `frame-${Date.now()}`,
      name: `Frame ${frames.length + 1}`,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
      backgroundColor: 'rgba(0,0,0,0.02)',
      borderColor: '#e5e7eb',
      titleVisible: true,
      titlePosition: 'top',
      order: frames.length,
      locked: false,
    };

    dispatch({ type: 'ADD_FRAME', payload: { frame: newFrame } });
    onCreateFrame?.(newFrame);
  }, [frames.length, dispatch, onCreateFrame]);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
  };

  const headerStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
  };

  const addButtonStyle = {
    padding: '4px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 4,
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  const listStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: 8,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 8,
    alignContent: 'start',
  };

  const emptyStyle = {
    padding: 24,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>Frames</span>
        {showControls && (
          <button style={addButtonStyle} onClick={handleCreateFrame}>
            + Add
          </button>
        )}
      </div>

      <div style={listStyle}>
        {frames.length === 0 ? (
          <div style={emptyStyle}>
            No frames yet.<br />
            Add frames to organize your content.
          </div>
        ) : (
          frames.map((frame) => (
            <FrameThumbnail
              key={frame.id}
              frame={frame}
              isActive={frame.id === activeFrameId}
              onClick={handleFrameClick}
              onDragStart={setDraggedId}
              onDrop={handleReorder}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Compact frame strip for bottom of canvas
 */
export function FrameStrip({ onFrameClick }) {
  const { state } = useDiagram();
  const { panTo } = useDiagramViewport();

  const frames = useMemo(() => {
    const frameList = Object.values(state.frames || {});
    return frameList.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [state.frames]);

  const handleClick = useCallback((frame) => {
    const centerX = -(frame.position.x + frame.size.width / 2 - 600);
    const centerY = -(frame.position.y + frame.size.height / 2 - 400);
    panTo(centerX, centerY);
    onFrameClick?.(frame);
  }, [panTo, onFrameClick]);

  if (frames.length === 0) return null;

  const stripStyle = {
    display: 'flex',
    gap: 8,
    padding: '8px 16px',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTop: '1px solid #e5e7eb',
    overflowX: 'auto',
  };

  const chipStyle = (isActive) => ({
    padding: '4px 12px',
    borderRadius: 16,
    backgroundColor: isActive ? '#3b82f6' : '#f3f4f6',
    color: isActive ? '#ffffff' : '#374151',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  });

  return (
    <div style={stripStyle}>
      {frames.map((frame, index) => (
        <div
          key={frame.id}
          style={chipStyle(false)}
          onClick={() => handleClick(frame)}
        >
          {index + 1}. {frame.name}
        </div>
      ))}
    </div>
  );
}

export default FrameNavigator;
