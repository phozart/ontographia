// components/diagram-core/canvas/Minimap.js
// Minimap overview of the canvas

import { useMemo, useCallback, useRef, useState } from 'react';
import { getBoundingBox } from '../utils/helpers';

export default function Minimap({
  elements,
  pan,
  zoom,
  canvasWidth = 800,
  canvasHeight = 600,
  position = 'bottom-right',
  width = 150,
  height = 100,
  onPan,
}) {
  const svgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate content bounds
  const bounds = useMemo(() => {
    if (elements.length === 0) {
      return { x: 0, y: 0, width: 800, height: 600 };
    }
    const bbox = getBoundingBox(elements);
    // Add padding
    return {
      x: bbox.x - 50,
      y: bbox.y - 50,
      width: Math.max(bbox.width + 100, 400),
      height: Math.max(bbox.height + 100, 300),
    };
  }, [elements]);

  // Scale factor for minimap
  const scale = Math.min(width / bounds.width, height / bounds.height);

  // Viewport rectangle (what's visible)
  const viewportWidth = (canvasWidth / zoom) * scale;
  const viewportHeight = (canvasHeight / zoom) * scale;
  const viewportX = (-pan.x / zoom - bounds.x) * scale;
  const viewportY = (-pan.y / zoom - bounds.y) * scale;

  // Handle click/drag on minimap to navigate
  const handleMouseDown = useCallback((e) => {
    if (!onPan) return;
    setIsDragging(true);

    const updatePan = (clientX, clientY) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Get click position in minimap coordinates
      const minimapX = clientX - rect.left;
      const minimapY = clientY - rect.top;

      // Convert to canvas coordinates (center viewport on click)
      const canvasX = (minimapX / scale) + bounds.x;
      const canvasY = (minimapY / scale) + bounds.y;

      // Calculate pan to center this point
      const newPanX = -(canvasX * zoom) + (canvasWidth / 2);
      const newPanY = -(canvasY * zoom) + (canvasHeight / 2);

      onPan({ x: newPanX, y: newPanY });
    };

    // Initial click
    updatePan(e.clientX, e.clientY);

    const handleMouseMove = (e) => {
      updatePan(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [onPan, scale, bounds, zoom, canvasWidth, canvasHeight]);

  return (
    <div className={`dc-minimap dc-minimap--${position}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
      >
        {/* Background */}
        <rect
          width={width}
          height={height}
          fill="var(--dc-minimap-bg, rgba(255,255,255,0.9))"
          stroke="var(--dc-minimap-border, #e5e7eb)"
          strokeWidth="1"
        />

        {/* Elements */}
        {elements.map(el => (
          <rect
            key={el.id}
            x={(el.x - bounds.x) * scale}
            y={(el.y - bounds.y) * scale}
            width={(el.width || 100) * scale}
            height={(el.height || 50) * scale}
            fill={el.color || '#3b82f6'}
            opacity="0.6"
            rx="2"
          />
        ))}

        {/* Viewport indicator */}
        <rect
          x={Math.max(0, viewportX)}
          y={Math.max(0, viewportY)}
          width={Math.min(width, viewportWidth)}
          height={Math.min(height, viewportHeight)}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="rgba(59, 130, 246, 0.5)"
          strokeWidth="1.5"
          rx="2"
          style={{ pointerEvents: 'none' }}
        />
      </svg>
    </div>
  );
}
