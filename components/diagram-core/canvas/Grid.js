// components/diagram-core/canvas/Grid.js
// Canvas grid background

import { useMemo } from 'react';

export default function Grid({ config, pan, zoom }) {
  const { type, size, majorEvery, color, majorColor, opacity, lineWidth, dotSize, crossSize } = config;

  // Calculate pattern size based on zoom
  const patternSize = size * zoom;

  // Generate grid pattern based on type
  const gridPattern = useMemo(() => {
    if (type === 'dots') {
      return (
        <pattern
          id="dc-grid-pattern"
          width={patternSize}
          height={patternSize}
          patternUnits="userSpaceOnUse"
          x={pan.x % patternSize}
          y={pan.y % patternSize}
        >
          <circle
            cx={patternSize / 2}
            cy={patternSize / 2}
            r={(dotSize || 2) * zoom}
            fill={color}
          />
        </pattern>
      );
    }

    if (type === 'crosses') {
      const cs = (crossSize || 6) * zoom;
      return (
        <pattern
          id="dc-grid-pattern"
          width={patternSize}
          height={patternSize}
          patternUnits="userSpaceOnUse"
          x={pan.x % patternSize}
          y={pan.y % patternSize}
        >
          <line
            x1={patternSize / 2 - cs / 2}
            y1={patternSize / 2}
            x2={patternSize / 2 + cs / 2}
            y2={patternSize / 2}
            stroke={color}
            strokeWidth={lineWidth || 1}
          />
          <line
            x1={patternSize / 2}
            y1={patternSize / 2 - cs / 2}
            x2={patternSize / 2}
            y2={patternSize / 2 + cs / 2}
            stroke={color}
            strokeWidth={lineWidth || 1}
          />
        </pattern>
      );
    }

    // Lines (default)
    const majorPatternSize = patternSize * (majorEvery || 5);
    return (
      <>
        {/* Minor grid */}
        <pattern
          id="dc-grid-minor"
          width={patternSize}
          height={patternSize}
          patternUnits="userSpaceOnUse"
          x={pan.x % patternSize}
          y={pan.y % patternSize}
        >
          <path
            d={`M ${patternSize} 0 L 0 0 0 ${patternSize}`}
            fill="none"
            stroke={color}
            strokeWidth={lineWidth || 1}
          />
        </pattern>

        {/* Major grid */}
        <pattern
          id="dc-grid-major"
          width={majorPatternSize}
          height={majorPatternSize}
          patternUnits="userSpaceOnUse"
          x={pan.x % majorPatternSize}
          y={pan.y % majorPatternSize}
        >
          <rect
            width={majorPatternSize}
            height={majorPatternSize}
            fill="url(#dc-grid-minor)"
          />
          <path
            d={`M ${majorPatternSize} 0 L 0 0 0 ${majorPatternSize}`}
            fill="none"
            stroke={majorColor || color}
            strokeWidth={(lineWidth || 1) * 1.5}
          />
        </pattern>
      </>
    );
  }, [type, patternSize, color, majorColor, dotSize, crossSize, lineWidth, majorEvery, pan, zoom]);

  return (
    <svg
      className="dc-grid"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: opacity || 1,
      }}
    >
      <defs>
        {gridPattern}
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={type === 'lines' ? 'url(#dc-grid-major)' : 'url(#dc-grid-pattern)'}
      />
    </svg>
  );
}
