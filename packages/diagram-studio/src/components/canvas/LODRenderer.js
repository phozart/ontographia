/**
 * LODRenderer Component
 * Level-of-Detail rendering for performance at different zoom levels
 */

import React, { useMemo } from 'react';

/**
 * Zoom level thresholds for different LOD levels
 */
export const LOD_THRESHOLDS = {
  FULL: 0.5,      // Full detail above 50%
  MEDIUM: 0.25,   // Medium detail between 25-50%
  LOW: 0.1,       // Low detail between 10-25%
  MINIMAL: 0,     // Minimal detail below 10%
};

/**
 * Get LOD level based on zoom
 */
export function getLODLevel(zoom) {
  if (zoom >= LOD_THRESHOLDS.FULL) return 'full';
  if (zoom >= LOD_THRESHOLDS.MEDIUM) return 'medium';
  if (zoom >= LOD_THRESHOLDS.LOW) return 'low';
  return 'minimal';
}

/**
 * Simplified rectangle for minimal LOD
 */
function MinimalElement({ element, color }) {
  const { x, y } = element.position || { x: 0, y: 0 };
  const { width, height } = element.size || { width: 100, height: 100 };

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color || element.style?.fill || '#e5e7eb'}
      stroke="none"
    />
  );
}

/**
 * Low detail element (shape only, no text)
 */
function LowDetailElement({ element }) {
  const { x, y } = element.position || { x: 0, y: 0 };
  const { width, height } = element.size || { width: 100, height: 100 };
  const shape = element.type || element.shape || 'rectangle';
  const fill = element.style?.fill || element.style?.backgroundColor || '#ffffff';
  const stroke = element.style?.stroke || element.style?.borderColor || '#374151';

  switch (shape) {
    case 'ellipse':
    case 'circle':
      return (
        <ellipse
          cx={x + width / 2}
          cy={y + height / 2}
          rx={width / 2}
          ry={height / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
        />
      );
    case 'diamond':
      const points = [
        `${x + width / 2},${y}`,
        `${x + width},${y + height / 2}`,
        `${x + width / 2},${y + height}`,
        `${x},${y + height / 2}`,
      ].join(' ');
      return (
        <polygon
          points={points}
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
        />
      );
    case 'sticky':
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={element.style?.fill || '#fef3c7'}
          stroke="none"
          rx={4}
        />
      );
    default:
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
          rx={element.style?.borderRadius || 4}
        />
      );
  }
}

/**
 * Medium detail element (shape + simplified text)
 */
function MediumDetailElement({ element, scale }) {
  const { x, y } = element.position || { x: 0, y: 0 };
  const { width, height } = element.size || { width: 100, height: 100 };
  const text = element.data?.text || element.data?.label || element.data?.name || '';

  return (
    <g>
      <LowDetailElement element={element} />
      {text && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.max(10, 14 / scale)}
          fill={element.style?.color || '#374151'}
          style={{ pointerEvents: 'none' }}
        >
          {text.length > 20 ? text.slice(0, 20) + '...' : text}
        </text>
      )}
    </g>
  );
}

/**
 * Full detail element (uses provided renderer)
 */
function FullDetailElement({ element, ElementRenderer, ...props }) {
  if (ElementRenderer) {
    return <ElementRenderer element={element} {...props} />;
  }

  // Fallback to medium detail if no renderer provided
  return <MediumDetailElement element={element} scale={props.scale || 1} />;
}

/**
 * LOD Element wrapper
 */
export function LODElement({
  element,
  zoom,
  ElementRenderer,
  forceLevel,
  ...props
}) {
  const level = forceLevel || getLODLevel(zoom);

  switch (level) {
    case 'minimal':
      return <MinimalElement element={element} />;
    case 'low':
      return <LowDetailElement element={element} />;
    case 'medium':
      return <MediumDetailElement element={element} scale={zoom} />;
    case 'full':
    default:
      return <FullDetailElement element={element} ElementRenderer={ElementRenderer} {...props} />;
  }
}

/**
 * LOD Connection renderer
 */
export function LODConnection({ connection, sourcePos, targetPos, zoom, forceLevel }) {
  const level = forceLevel || getLODLevel(zoom);

  // At minimal zoom, skip connections entirely
  if (level === 'minimal') {
    return null;
  }

  const strokeWidth = level === 'low' ? 1 : (connection.style?.strokeWidth || 2);
  const stroke = connection.style?.stroke || '#6b7280';

  // Simplified straight line for low detail
  if (level === 'low') {
    return (
      <line
        x1={sourcePos.x}
        y1={sourcePos.y}
        x2={targetPos.x}
        y2={targetPos.y}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  // Medium and full use the same curved path
  const midX = (sourcePos.x + targetPos.x) / 2;
  const midY = (sourcePos.y + targetPos.y) / 2;
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const curvature = 0.2;

  // Simple bezier curve
  const controlX = midX - dy * curvature;
  const controlY = midY + dx * curvature;

  const path = `M ${sourcePos.x} ${sourcePos.y} Q ${controlX} ${controlY} ${targetPos.x} ${targetPos.y}`;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {level === 'full' && connection.label && (
        <text
          x={midX}
          y={midY - 8}
          textAnchor="middle"
          fontSize={12}
          fill="#6b7280"
        >
          {connection.label}
        </text>
      )}
    </g>
  );
}

/**
 * LOD Canvas renderer
 * Renders all elements and connections with appropriate detail level
 */
export function LODCanvas({
  elements,
  connections,
  viewport,
  ElementRenderer,
  ConnectionRenderer,
  onElementClick,
  onElementDoubleClick,
  selectedIds = [],
  forceLevel,
}) {
  const zoom = viewport.zoom || viewport.scale || 1;
  const level = forceLevel || getLODLevel(zoom);

  // Get element positions for connection rendering
  const elementPositions = useMemo(() => {
    const positions = {};
    const elementList = Array.isArray(elements) ? elements : Object.values(elements || {});

    elementList.forEach((el) => {
      const pos = el.position || { x: 0, y: 0 };
      const size = el.size || { width: 100, height: 100 };
      positions[el.id] = {
        center: {
          x: pos.x + size.width / 2,
          y: pos.y + size.height / 2,
        },
        bounds: { ...pos, ...size },
      };
    });

    return positions;
  }, [elements]);

  const elementList = Array.isArray(elements) ? elements : Object.values(elements || {});
  const connectionList = Array.isArray(connections) ? connections : Object.values(connections || {});

  return (
    <g className="lod-canvas" data-lod-level={level}>
      {/* Connections layer */}
      <g className="connections-layer">
        {connectionList.map((conn) => {
          const sourcePos = elementPositions[conn.sourceId]?.center;
          const targetPos = elementPositions[conn.targetId]?.center;

          if (!sourcePos || !targetPos) return null;

          if (ConnectionRenderer && level === 'full') {
            return (
              <ConnectionRenderer
                key={conn.id}
                connection={conn}
                sourcePos={sourcePos}
                targetPos={targetPos}
                zoom={zoom}
              />
            );
          }

          return (
            <LODConnection
              key={conn.id}
              connection={conn}
              sourcePos={sourcePos}
              targetPos={targetPos}
              zoom={zoom}
              forceLevel={level}
            />
          );
        })}
      </g>

      {/* Elements layer */}
      <g className="elements-layer">
        {elementList.map((element) => (
          <g
            key={element.id}
            className="element-wrapper"
            data-element-id={element.id}
            onClick={(e) => onElementClick?.(element, e)}
            onDoubleClick={(e) => onElementDoubleClick?.(element, e)}
          >
            <LODElement
              element={element}
              zoom={zoom}
              ElementRenderer={ElementRenderer}
              isSelected={selectedIds.includes(element.id)}
              scale={zoom}
              forceLevel={level}
            />
          </g>
        ))}
      </g>
    </g>
  );
}

/**
 * Hook to get current LOD level
 */
export function useLODLevel(zoom) {
  return useMemo(() => getLODLevel(zoom), [zoom]);
}

/**
 * Performance stats for debugging
 */
export function LODStats({ elements, connections, zoom, visible }) {
  const level = getLODLevel(zoom);
  const totalElements = Array.isArray(elements) ? elements.length : Object.keys(elements || {}).length;
  const totalConnections = Array.isArray(connections) ? connections.length : Object.keys(connections || {}).length;

  const statStyle = {
    position: 'absolute',
    bottom: 8,
    left: 8,
    padding: '8px 12px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#ffffff',
    borderRadius: 6,
    fontSize: 11,
    fontFamily: 'monospace',
    zIndex: 1000,
  };

  return (
    <div style={statStyle}>
      <div>LOD: {level} ({Math.round(zoom * 100)}%)</div>
      <div>Elements: {visible?.elements || totalElements} / {totalElements}</div>
      <div>Connections: {visible?.connections || totalConnections} / {totalConnections}</div>
    </div>
  );
}

export default LODCanvas;
