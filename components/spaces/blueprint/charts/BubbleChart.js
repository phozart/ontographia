// components/spaces/blueprint/charts/BubbleChart.js
// Risk-reward bubble chart with 4 quadrants (pure SVG)

import { useMemo, useState } from 'react';

// Ontographia Design System colors
const COLORS = {
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  muted: '#9C9A94',
  border: '#E2E0DB',
  canvas: '#FDFCFA',
  panel: '#F0EFEC',
  primary: '#47453F',
  success: '#5B8A6A',
  warning: '#C9A227',
  danger: '#A54D4D',
};

// Subtle quadrant tints (warm-tinted, very low opacity)
const QUADRANT_FILLS = {
  bottomLeft: 'rgba(156, 154, 148, 0.06)',   // Low Risk / Low Return — muted
  bottomRight: 'rgba(165, 77, 77, 0.06)',     // High Risk / Low Return — danger tint
  topLeft: 'rgba(91, 138, 106, 0.06)',        // Low Risk / High Return — success tint
  topRight: 'rgba(201, 162, 39, 0.06)',       // High Risk / High Return — warning tint
};

const DEFAULT_QUADRANT_LABELS = [
  'Low Risk / Low Return',
  'High Risk / Low Return',
  'Low Risk / High Return',
  'High Risk / High Return',
];

export default function BubbleChart({
  data = [],
  xLabel = 'Risk',
  yLabel = 'Reward',
  quadrantLabels = DEFAULT_QUADRANT_LABELS,
}) {
  const [hoveredId, setHoveredId] = useState(null);

  // Chart layout constants
  const margin = { top: 28, right: 28, bottom: 44, left: 52 };
  const viewWidth = 560;
  const viewHeight = 440;
  const chartWidth = viewWidth - margin.left - margin.right;
  const chartHeight = viewHeight - margin.top - margin.bottom;
  const midX = chartWidth / 2;
  const midY = chartHeight / 2;

  // Scale: map x/y values (0..100) to chart coordinates
  const scaleX = useMemo(() => {
    return (v) => (v / 100) * chartWidth;
  }, [chartWidth]);

  const scaleY = useMemo(() => {
    // SVG y is inverted: 0 at top, chartHeight at bottom
    return (v) => chartHeight - (v / 100) * chartHeight;
  }, [chartHeight]);

  // Scale bubble sizes: map size prop to radius
  // Minimum radius 8, maximum 40, scaled by area (square root)
  const { sizeScale } = useMemo(() => {
    const sizes = data.map((d) => d.size || 1).filter((s) => s > 0);
    if (sizes.length === 0) return { sizeScale: () => 12 };
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);
    const range = maxSize - minSize || 1;
    const fn = (s) => {
      const normalized = (s - minSize) / range;
      // Area-based scaling: radius = sqrt(area)
      const minR = 8;
      const maxR = 36;
      return minR + Math.sqrt(normalized) * (maxR - minR);
    };
    return { sizeScale: fn };
  }, [data]);

  // Generate grid tick marks
  const xTicks = [0, 25, 50, 75, 100];
  const yTicks = [0, 25, 50, 75, 100];

  // Tooltip state
  const hoveredItem = hoveredId != null ? data.find((d) => d.id === hoveredId) : null;
  const tooltipX = hoveredItem ? scaleX(hoveredItem.x) + margin.left : 0;
  const tooltipY = hoveredItem ? scaleY(hoveredItem.y) + margin.top : 0;

  return (
    <div className="bubble-chart" style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Bubble chart: ${xLabel} vs ${yLabel} with ${data.length} items`}
        style={{ display: 'block', maxWidth: '100%' }}
      >
        <title>
          {xLabel} vs {yLabel} — {data.length} items
        </title>

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Quadrant backgrounds */}
          {/* Bottom-left: low x, low y */}
          <rect
            x={0}
            y={midY}
            width={midX}
            height={midY}
            fill={QUADRANT_FILLS.bottomLeft}
          />
          {/* Bottom-right: high x, low y */}
          <rect
            x={midX}
            y={midY}
            width={midX}
            height={midY}
            fill={QUADRANT_FILLS.bottomRight}
          />
          {/* Top-left: low x, high y */}
          <rect
            x={0}
            y={0}
            width={midX}
            height={midY}
            fill={QUADRANT_FILLS.topLeft}
          />
          {/* Top-right: high x, high y */}
          <rect
            x={midX}
            y={0}
            width={midX}
            height={midY}
            fill={QUADRANT_FILLS.topRight}
          />

          {/* Grid lines */}
          {xTicks.map((tick) => (
            <line
              key={`xg-${tick}`}
              x1={scaleX(tick)}
              y1={0}
              x2={scaleX(tick)}
              y2={chartHeight}
              stroke={COLORS.border}
              strokeWidth={tick === 50 ? 1 : 0.5}
              strokeDasharray={tick === 50 ? 'none' : '3 3'}
            />
          ))}
          {yTicks.map((tick) => (
            <line
              key={`yg-${tick}`}
              x1={0}
              y1={scaleY(tick)}
              x2={chartWidth}
              y2={scaleY(tick)}
              stroke={COLORS.border}
              strokeWidth={tick === 50 ? 1 : 0.5}
              strokeDasharray={tick === 50 ? 'none' : '3 3'}
            />
          ))}

          {/* Midpoint grid lines (heavier) */}
          <line
            x1={midX}
            y1={0}
            x2={midX}
            y2={chartHeight}
            stroke={COLORS.primary}
            strokeWidth={1}
            opacity={0.3}
          />
          <line
            x1={0}
            y1={midY}
            x2={chartWidth}
            y2={midY}
            stroke={COLORS.primary}
            strokeWidth={1}
            opacity={0.3}
          />

          {/* X-axis tick labels */}
          {xTicks.map((tick) => (
            <text
              key={`xl-${tick}`}
              x={scaleX(tick)}
              y={chartHeight + 16}
              textAnchor="middle"
              fill={COLORS.muted}
              fontSize={9}
              fontFamily="inherit"
            >
              {tick}
            </text>
          ))}

          {/* Y-axis tick labels */}
          {yTicks.map((tick) => (
            <text
              key={`yl-${tick}`}
              x={-8}
              y={scaleY(tick) + 3}
              textAnchor="end"
              fill={COLORS.muted}
              fontSize={9}
              fontFamily="inherit"
            >
              {tick}
            </text>
          ))}

          {/* X-axis label */}
          <text
            x={chartWidth / 2}
            y={chartHeight + 34}
            textAnchor="middle"
            fill={COLORS.text}
            fontSize={12}
            fontWeight={500}
            fontFamily="inherit"
          >
            {xLabel}
          </text>

          {/* Y-axis label (rotated) */}
          <text
            x={0}
            y={0}
            textAnchor="middle"
            fill={COLORS.text}
            fontSize={12}
            fontWeight={500}
            fontFamily="inherit"
            transform={`translate(-38, ${chartHeight / 2}) rotate(-90)`}
          >
            {yLabel}
          </text>

          {/* Quadrant labels */}
          {/* Bottom-left: quadrantLabels[0] */}
          <text
            x={midX / 2}
            y={midY + midY - 12}
            textAnchor="middle"
            fill={COLORS.muted}
            fontSize={9}
            fontFamily="inherit"
            opacity={0.7}
          >
            {quadrantLabels[0]}
          </text>
          {/* Bottom-right: quadrantLabels[1] */}
          <text
            x={midX + midX / 2}
            y={midY + midY - 12}
            textAnchor="middle"
            fill={COLORS.muted}
            fontSize={9}
            fontFamily="inherit"
            opacity={0.7}
          >
            {quadrantLabels[1]}
          </text>
          {/* Top-left: quadrantLabels[2] */}
          <text
            x={midX / 2}
            y={18}
            textAnchor="middle"
            fill={COLORS.muted}
            fontSize={9}
            fontFamily="inherit"
            opacity={0.7}
          >
            {quadrantLabels[2]}
          </text>
          {/* Top-right: quadrantLabels[3] */}
          <text
            x={midX + midX / 2}
            y={18}
            textAnchor="middle"
            fill={COLORS.muted}
            fontSize={9}
            fontFamily="inherit"
            opacity={0.7}
          >
            {quadrantLabels[3]}
          </text>

          {/* Bubbles */}
          {data.map((item) => {
            const cx = scaleX(item.x);
            const cy = scaleY(item.y);
            const r = sizeScale(item.size || 1);
            const isHovered = hoveredId === item.id;
            const fillColor = item.color || COLORS.primary;

            return (
              <g
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Hover ring */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 4}
                    fill="none"
                    stroke={fillColor}
                    strokeWidth={2}
                    opacity={0.4}
                  />
                )}
                {/* Main bubble */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={fillColor}
                  opacity={isHovered ? 0.95 : 0.75}
                  stroke={isHovered ? fillColor : 'none'}
                  strokeWidth={isHovered ? 1.5 : 0}
                >
                  <title>
                    {item.label}: x={item.x}, y={item.y}
                    {item.tooltip ? ` — ${item.tooltip}` : ''}
                  </title>
                </circle>
                {/* Label inside bubble if large enough */}
                {r >= 16 && (
                  <text
                    x={cx}
                    y={cy + 3}
                    textAnchor="middle"
                    fill={COLORS.canvas}
                    fontSize={Math.min(r * 0.55, 11)}
                    fontWeight={500}
                    fontFamily="inherit"
                    pointerEvents="none"
                  >
                    {item.label.length > 10
                      ? `${item.label.slice(0, 10)}...`
                      : item.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Chart border */}
          <rect
            x={0}
            y={0}
            width={chartWidth}
            height={chartHeight}
            fill="none"
            stroke={COLORS.border}
            strokeWidth={1}
          />

          {/* Empty state */}
          {data.length === 0 && (
            <text
              x={chartWidth / 2}
              y={chartHeight / 2}
              textAnchor="middle"
              fill={COLORS.muted}
              fontSize={12}
              fontFamily="inherit"
            >
              No data to display
            </text>
          )}
        </g>
      </svg>

      {/* HTML tooltip overlay (positioned absolutely) */}
      {hoveredItem && (
        <div
          className="bubble-chart-tooltip"
          style={{
            position: 'absolute',
            left: `${(tooltipX / viewWidth) * 100}%`,
            top: `${(tooltipY / viewHeight) * 100}%`,
            transform: 'translate(-50%, -100%) translateY(-12px)',
            pointerEvents: 'none',
            zIndex: 10,
            background: COLORS.canvas,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 4,
            padding: '8px 12px',
            boxShadow: '0 2px 8px rgba(31, 30, 27, 0.12)',
            fontSize: 12,
            color: COLORS.text,
            whiteSpace: 'nowrap',
            maxWidth: 220,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{hoveredItem.label}</div>
          <div style={{ color: COLORS.textSecondary, fontSize: 11 }}>
            <div>{xLabel}: {hoveredItem.x}</div>
            <div>{yLabel}: {hoveredItem.y}</div>
            {hoveredItem.tooltip && (
              <div style={{ marginTop: 2, color: COLORS.muted }}>{hoveredItem.tooltip}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
