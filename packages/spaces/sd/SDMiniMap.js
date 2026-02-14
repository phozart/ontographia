// components/sd/SDMiniMap.js
// EPIC 1.8 - Mini-map for canvas navigation
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import MapIcon from '@mui/icons-material/Map';
import CloseIcon from '@mui/icons-material/Close';

// Color mapping for element types
const ELEMENT_COLORS = {
  variable: '#3b82f6',
  stock: '#8b5cf6',
  flow: '#10b981',
  converter: '#f59e0b',
  cloud: '#94a3b8',
  parameter: '#f97316',
  note: '#facc15',
};

export default function SDMiniMap({
  elements = [],
  connections = [],
  cyRef,
  isCollapsed = false,
  onToggle,
  width = 180,
  height = 120,
}) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Calculate diagram bounds and scale - memoized to prevent infinite loops
  const calculatedBounds = useMemo(() => {
    if (elements.length === 0) {
      return { x1: 0, y1: 0, x2: 100, y2: 100, scale: 1 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    elements.forEach(el => {
      const x = el.position?.x || el.x || 0;
      const y = el.position?.y || el.y || 0;
      const w = el.width || 80;
      const h = el.height || 50;

      minX = Math.min(minX, x - w / 2);
      minY = Math.min(minY, y - h / 2);
      maxX = Math.max(maxX, x + w / 2);
      maxY = Math.max(maxY, y + h / 2);
    });

    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const diagramWidth = maxX - minX;
    const diagramHeight = maxY - minY;
    const scaleX = (width - 10) / diagramWidth;
    const scaleY = (height - 10) / diagramHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    return { x1: minX, y1: minY, x2: maxX, y2: maxY, scale };
  }, [elements, width, height]);

  // Update viewport from Cytoscape
  const updateViewport = useCallback(() => {
    const cy = cyRef?.current;
    if (!cy) return;

    const extent = cy.extent();
    const { x1, y1, scale } = calculatedBounds;

    setViewport({
      x: (extent.x1 - x1) * scale + 5,
      y: (extent.y1 - y1) * scale + 5,
      width: (extent.x2 - extent.x1) * scale,
      height: (extent.y2 - extent.y1) * scale,
    });
  }, [cyRef, calculatedBounds]);

  // Draw the minimap
  const drawMiniMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { x1, y1, scale } = calculatedBounds;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = 'var(--bg)';
    ctx.fillRect(0, 0, width, height);

    // Draw connections
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 1;

    connections.forEach(conn => {
      const sourceEl = elements.find(el => el.id === conn.source);
      const targetEl = elements.find(el => el.id === conn.target);

      if (sourceEl && targetEl) {
        const sx = ((sourceEl.position?.x || sourceEl.x || 0) - x1) * scale + 5;
        const sy = ((sourceEl.position?.y || sourceEl.y || 0) - y1) * scale + 5;
        const tx = ((targetEl.position?.x || targetEl.x || 0) - x1) * scale + 5;
        const ty = ((targetEl.position?.y || targetEl.y || 0) - y1) * scale + 5;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
    });

    // Draw elements
    elements.forEach(el => {
      const x = ((el.position?.x || el.x || 0) - x1) * scale + 5;
      const y = ((el.position?.y || el.y || 0) - y1) * scale + 5;
      const w = Math.max((el.width || 80) * scale, 4);
      const h = Math.max((el.height || 50) * scale, 3);

      ctx.fillStyle = ELEMENT_COLORS[el.type] || '#6b7280';

      if (el.type === 'variable' || el.type === 'converter' || el.type === 'cloud') {
        // Draw ellipse
        ctx.beginPath();
        ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw rectangle
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
      }
    });
  }, [elements, connections, calculatedBounds, width, height]);

  // Handle minimap click/drag to pan main canvas
  const handleMinimapInteraction = useCallback((e) => {
    const cy = cyRef?.current;
    if (!cy) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const { x1, y1, scale } = calculatedBounds;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert minimap coordinates to diagram coordinates
    const diagramX = (clickX - 5) / scale + x1;
    const diagramY = (clickY - 5) / scale + y1;

    // Pan the main canvas to center on clicked position
    cy.animate({
      center: { x: diagramX, y: diagramY },
    }, {
      duration: 200,
    });
  }, [cyRef, calculatedBounds]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    handleMinimapInteraction(e);
  }, [handleMinimapInteraction]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      handleMinimapInteraction(e);
    }
  }, [isDragging, handleMinimapInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Setup viewport tracking
  useEffect(() => {
    const cy = cyRef?.current;
    if (!cy) return;

    const handleViewportChange = () => {
      updateViewport();
    };

    cy.on('viewport', handleViewportChange);
    cy.on('resize', handleViewportChange);

    return () => {
      cy.off('viewport', handleViewportChange);
      cy.off('resize', handleViewportChange);
    };
  }, [cyRef, updateViewport]);

  // Redraw when elements change
  useEffect(() => {
    drawMiniMap();
    updateViewport();
  }, [elements, connections, drawMiniMap, updateViewport]);

  if (isCollapsed) {
    return (
      <button className="minimap-toggle" onClick={onToggle} title="Show minimap">
        <MapIcon fontSize="small" />
        <style jsx>{`
          .minimap-toggle {
            position: absolute;
            bottom: 60px;
            right: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--panel);
            color: var(--text);
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.2s;
          }

          .minimap-toggle:hover {
            background: var(--bg);
          }
        `}</style>
      </button>
    );
  }

  return (
    <div className="sd-minimap">
      <div className="minimap-header">
        <MapIcon fontSize="small" />
        <span>Mini Map</span>
        <button className="minimap-close" onClick={onToggle}>
          <CloseIcon fontSize="small" />
        </button>
      </div>

      <div className="minimap-canvas-container">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Viewport indicator */}
        <div
          className="minimap-viewport"
          style={{
            left: viewport.x,
            top: viewport.y,
            width: Math.max(viewport.width, 10),
            height: Math.max(viewport.height, 10),
          }}
        />
      </div>

      <style jsx>{`
        .sd-minimap {
          position: absolute;
          bottom: 60px;
          right: 10px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
          z-index: 100;
        }

        .minimap-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .minimap-header span {
          flex: 1;
        }

        .minimap-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .minimap-close:hover {
          background: var(--border);
          color: var(--text);
        }

        .minimap-canvas-container {
          position: relative;
          width: ${width}px;
          height: ${height}px;
        }

        .minimap-canvas-container canvas {
          display: block;
          cursor: pointer;
          background: var(--bg);
        }

        .minimap-viewport {
          position: absolute;
          border: 2px solid var(--accent);
          background: rgba(99, 102, 241, 0.1);
          border-radius: 2px;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
