// components/srs/canvas/CanvasConnection.js
// SVG connection line between canvas nodes
// Supports different connection types with visual styling

import { useMemo } from 'react';
import { CONNECTION_TYPES } from '../../../lib/srs-types';

export default function CanvasConnection({
  id,
  fromX,
  fromY,
  toX,
  toY,
  connectionType = 'informs',
  label,
  selected = false,
  onSelect,
  onDelete,
  animated = false,
  dashed = false,
}) {
  const typeConfig = CONNECTION_TYPES[connectionType] || CONNECTION_TYPES.informs;

  // Calculate path for curved connection
  const path = useMemo(() => {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Control point offset based on distance
    const cpOffset = Math.min(distance * 0.3, 100);

    // Bezier curve control points
    const cp1x = fromX + cpOffset;
    const cp1y = fromY;
    const cp2x = toX - cpOffset;
    const cp2y = toY;

    return `M ${fromX} ${fromY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toX} ${toY}`;
  }, [fromX, fromY, toX, toY]);

  // Calculate midpoint for label
  const midpoint = useMemo(() => {
    const t = 0.5;
    const dx = toX - fromX;
    const cpOffset = Math.min(Math.abs(dx) * 0.3, 100);

    // Approximate bezier midpoint
    const midX = fromX + dx * t;
    const midY = fromY + (toY - fromY) * t;

    return { x: midX, y: midY };
  }, [fromX, fromY, toX, toY]);

  // Arrow marker ID unique to connection type
  const markerId = `arrow-${connectionType}`;

  return (
    <g
      className={`srs-connection ${selected ? 'selected' : ''} ${connectionType}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDelete?.(id);
      }}
    >
      {/* Arrow marker definition */}
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            fill={typeConfig.color}
          />
        </marker>
      </defs>

      {/* Invisible wider path for easier selection */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        style={{ cursor: 'pointer' }}
      />

      {/* Visible connection line */}
      <path
        d={path}
        stroke={typeConfig.color}
        strokeWidth={selected ? 3 : 2}
        fill="none"
        strokeDasharray={dashed ? '8 4' : 'none'}
        markerEnd={`url(#${markerId})`}
        className={animated ? 'animated' : ''}
      />

      {/* Label */}
      {label && (
        <g transform={`translate(${midpoint.x}, ${midpoint.y})`}>
          <rect
            x="-40"
            y="-10"
            width="80"
            height="20"
            rx="4"
            fill="var(--color-bg-elevated)"
            stroke={typeConfig.color}
            strokeWidth="1"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill={typeConfig.color}
            style={{ pointerEvents: 'none' }}
          >
            {label || typeConfig.name}
          </text>
        </g>
      )}

      {/* Connection type indicator (small badge at midpoint) */}
      {!label && (
        <circle
          cx={midpoint.x}
          cy={midpoint.y}
          r="8"
          fill={typeConfig.color}
          className="srs-connection-badge"
        />
      )}
    </g>
  );
}

// Temporary connection line while drawing
export function TempConnection({ fromX, fromY, toX, toY, connectionType = 'informs' }) {
  const typeConfig = CONNECTION_TYPES[connectionType] || CONNECTION_TYPES.informs;

  const path = useMemo(() => {
    const dx = toX - fromX;
    const cpOffset = Math.min(Math.abs(dx) * 0.3, 100);

    const cp1x = fromX + cpOffset;
    const cp1y = fromY;
    const cp2x = toX - cpOffset;
    const cp2y = toY;

    return `M ${fromX} ${fromY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toX} ${toY}`;
  }, [fromX, fromY, toX, toY]);

  return (
    <path
      d={path}
      stroke={typeConfig.color}
      strokeWidth="2"
      strokeDasharray="8 4"
      fill="none"
      opacity="0.6"
      style={{ pointerEvents: 'none' }}
    />
  );
}
