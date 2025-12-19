// components/srs/canvas/SRSCanvas.js
// Main canvas component with pan/zoom capabilities
// Provides the infinite canvas surface for reasoning spaces

import { useRef, useState, useCallback, useEffect } from 'react';
import { useSRS } from '../SRSContext';

// MUI Icons
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const GRID_SIZE = 20;

export default function SRSCanvas({
  children,
  className = '',
  showGrid = true,
  onCanvasClick,
  onCanvasDoubleClick,
}) {
  const { canvasPosition, setCanvasPosition } = useSRS();
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [gridEnabled, setGridEnabled] = useState(showGrid);

  // Handle mouse down for pan
  const handleMouseDown = useCallback((e) => {
    // Only pan with middle mouse or space+click
    if (e.button === 1 || (e.button === 0 && e.target === containerRef.current)) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - canvasPosition.x,
        y: e.clientY - canvasPosition.y,
      });
    }
  }, [canvasPosition.x, canvasPosition.y]);

  // Handle mouse move for pan
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    setCanvasPosition(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  }, [isDragging, dragStart, setCanvasPosition]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();

    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, canvasPosition.zoom + delta));

    // Zoom towards mouse position
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scale = newZoom / canvasPosition.zoom;
    const newX = mouseX - (mouseX - canvasPosition.x) * scale;
    const newY = mouseY - (mouseY - canvasPosition.y) * scale;

    setCanvasPosition({
      x: newX,
      y: newY,
      zoom: newZoom,
    });
  }, [canvasPosition, setCanvasPosition]);

  // Handle canvas click
  const handleClick = useCallback((e) => {
    if (e.target === containerRef.current && onCanvasClick) {
      const rect = containerRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - canvasPosition.x) / canvasPosition.zoom;
      const canvasY = (e.clientY - rect.top - canvasPosition.y) / canvasPosition.zoom;
      onCanvasClick({ x: canvasX, y: canvasY, event: e });
    }
  }, [onCanvasClick, canvasPosition]);

  // Handle canvas double click
  const handleDoubleClick = useCallback((e) => {
    if (e.target === containerRef.current && onCanvasDoubleClick) {
      const rect = containerRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - canvasPosition.x) / canvasPosition.zoom;
      const canvasY = (e.clientY - rect.top - canvasPosition.y) / canvasPosition.zoom;
      onCanvasDoubleClick({ x: canvasX, y: canvasY, event: e });
    }
  }, [onCanvasDoubleClick, canvasPosition]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setCanvasPosition(prev => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, prev.zoom + ZOOM_STEP),
    }));
  }, [setCanvasPosition]);

  const handleZoomOut = useCallback(() => {
    setCanvasPosition(prev => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, prev.zoom - ZOOM_STEP),
    }));
  }, [setCanvasPosition]);

  const handleResetView = useCallback(() => {
    setCanvasPosition({ x: 0, y: 0, zoom: 1 });
  }, [setCanvasPosition]);

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Global mouse up listener
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isDragging, handleMouseUp, handleMouseMove]);

  // Grid pattern
  const gridPattern = gridEnabled ? `
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent ${GRID_SIZE - 1}px,
      rgba(var(--color-border-rgb), 0.3) ${GRID_SIZE - 1}px,
      rgba(var(--color-border-rgb), 0.3) ${GRID_SIZE}px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent ${GRID_SIZE - 1}px,
      rgba(var(--color-border-rgb), 0.3) ${GRID_SIZE - 1}px,
      rgba(var(--color-border-rgb), 0.3) ${GRID_SIZE}px
    )
  ` : 'none';

  return (
    <div className={`srs-canvas-wrapper ${className}`}>
      {/* Canvas Controls */}
      <div className="srs-canvas-controls">
        <button
          className="srs-canvas-control"
          onClick={handleZoomIn}
          title="Zoom In (Ctrl+Scroll)"
        >
          <ZoomInIcon fontSize="small" />
        </button>
        <span className="srs-canvas-zoom-level">
          {Math.round(canvasPosition.zoom * 100)}%
        </span>
        <button
          className="srs-canvas-control"
          onClick={handleZoomOut}
          title="Zoom Out (Ctrl+Scroll)"
        >
          <ZoomOutIcon fontSize="small" />
        </button>
        <button
          className="srs-canvas-control"
          onClick={handleResetView}
          title="Reset View"
        >
          <CenterFocusStrongIcon fontSize="small" />
        </button>
        <button
          className={`srs-canvas-control ${gridEnabled ? 'active' : ''}`}
          onClick={() => setGridEnabled(!gridEnabled)}
          title="Toggle Grid"
        >
          {gridEnabled ? <GridOnIcon fontSize="small" /> : <GridOffIcon fontSize="small" />}
        </button>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className={`srs-canvas ${isDragging ? 'is-dragging' : ''}`}
        style={{
          backgroundImage: gridPattern,
          backgroundSize: `${GRID_SIZE * canvasPosition.zoom}px ${GRID_SIZE * canvasPosition.zoom}px`,
          backgroundPosition: `${canvasPosition.x}px ${canvasPosition.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Transform Layer */}
        <div
          className="srs-canvas-transform"
          style={{
            transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasPosition.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
