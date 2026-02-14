// components/spaces/blueprint/charts/BulletGraph.js
// Horizontal bullet graph for KPI actual vs target (pure SVG)

import { useMemo } from 'react';

// Ontographia Design System colors
const COLORS = {
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  muted: '#9C9A94',
  border: '#E2E0DB',
  canvas: '#FDFCFA',
  primary: '#47453F',
  success: '#5B8A6A',
  warning: '#C9A227',
  danger: '#A54D4D',
  // Qualitative range bands (warm graphite tints)
  rangePoor: '#E2E0DB',
  rangeSatisfactory: '#CFCDC7',
  rangeGood: '#B8B5AE',
};

function defaultFormat(value) {
  if (value == null) return '-';
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

export default function BulletGraph({
  actual,
  target,
  ranges = [],
  label = '',
  format,
}) {
  const fmt = format || defaultFormat;

  // Chart layout
  const margin = { top: 20, right: 40, bottom: 24, left: 12 };
  const viewWidth = 400;
  const viewHeight = 72;
  const chartWidth = viewWidth - margin.left - margin.right;
  const barAreaHeight = viewHeight - margin.top - margin.bottom;
  const rangeHeight = barAreaHeight;
  const actualBarHeight = rangeHeight * 0.45;

  // Determine the maximum value for the scale
  const { maxVal, scale } = useMemo(() => {
    const allValues = [actual, target, ...ranges].filter((v) => v != null && v > 0);
    const max = allValues.length > 0 ? Math.max(...allValues) : 100;
    // Add a little headroom
    const padded = max * 1.05;
    const s = (v) => Math.max(0, Math.min((v / padded) * chartWidth, chartWidth));
    return { maxVal: padded, scale: s };
  }, [actual, target, ranges, chartWidth]);

  // Qualitative range bands
  // ranges prop: [poor, satisfactory, good] — thresholds marking the upper bound of each band
  // If 3 values: [0..poor] = poor, [poor..satisfactory] = satisfactory, [satisfactory..good] = good
  const bands = useMemo(() => {
    if (ranges.length < 1) {
      // Default: divide into thirds of maxVal
      const third = maxVal / 3;
      return [
        { x: 0, width: scale(third), color: COLORS.rangePoor, label: 'Poor' },
        { x: scale(third), width: scale(third * 2) - scale(third), color: COLORS.rangeSatisfactory, label: 'Satisfactory' },
        { x: scale(third * 2), width: scale(maxVal) - scale(third * 2), color: COLORS.rangeGood, label: 'Good' },
      ];
    }

    const result = [];
    let prev = 0;
    const bandColors = [COLORS.rangePoor, COLORS.rangeSatisfactory, COLORS.rangeGood];
    const bandLabels = ['Poor', 'Satisfactory', 'Good'];

    ranges.forEach((threshold, i) => {
      const startX = scale(prev);
      const endX = scale(threshold);
      result.push({
        x: startX,
        width: Math.max(endX - startX, 0),
        color: bandColors[i] || COLORS.border,
        label: bandLabels[i] || `Range ${i + 1}`,
        from: prev,
        to: threshold,
      });
      prev = threshold;
    });

    // Extend the last band to maxVal if needed
    if (prev < maxVal) {
      const startX = scale(prev);
      result.push({
        x: startX,
        width: Math.max(chartWidth - startX, 0),
        color: bandColors[ranges.length] || COLORS.rangeGood,
        label: bandLabels[ranges.length] || 'Excellent',
        from: prev,
        to: maxVal,
      });
    }

    return result;
  }, [ranges, maxVal, scale, chartWidth]);

  // Determine actual bar color based on target comparison
  const actualColor = useMemo(() => {
    if (actual == null || target == null) return COLORS.primary;
    const ratio = actual / target;
    if (ratio >= 1.0) return COLORS.success;
    if (ratio >= 0.8) return COLORS.warning;
    return COLORS.danger;
  }, [actual, target]);

  const barCenterY = rangeHeight / 2;

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${label}: actual ${fmt(actual)}, target ${fmt(target)}`}
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <title>
        {label} — Actual: {fmt(actual)}, Target: {fmt(target)}
      </title>

      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Label */}
        {label && (
          <text
            x={0}
            y={-8}
            fill={COLORS.text}
            fontSize={11}
            fontWeight={600}
            fontFamily="inherit"
          >
            {label}
          </text>
        )}

        {/* Qualitative range bands */}
        {bands.map((band, i) => (
          <rect
            key={i}
            x={band.x}
            y={0}
            width={band.width}
            height={rangeHeight}
            fill={band.color}
            rx={i === 0 ? 4 : 0}
            ry={i === 0 ? 4 : 0}
          >
            <title>
              {band.label}: {fmt(band.from)} - {fmt(band.to)}
            </title>
          </rect>
        ))}

        {/* Round the right edge of the last band */}
        {bands.length > 0 && (
          <rect
            x={chartWidth - 4}
            y={0}
            width={4}
            height={rangeHeight}
            fill={bands[bands.length - 1].color}
            rx={4}
            ry={4}
          />
        )}

        {/* Actual value bar */}
        {actual != null && (
          <rect
            x={0}
            y={barCenterY - actualBarHeight / 2}
            width={Math.max(scale(actual), 2)}
            height={actualBarHeight}
            rx={2}
            ry={2}
            fill={actualColor}
            opacity={0.9}
          >
            <title>Actual: {fmt(actual)}</title>
          </rect>
        )}

        {/* Target marker line */}
        {target != null && (
          <g>
            <line
              x1={scale(target)}
              y1={barCenterY - rangeHeight * 0.4}
              x2={scale(target)}
              y2={barCenterY + rangeHeight * 0.4}
              stroke={COLORS.text}
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <title>Target: {fmt(target)}</title>
            </line>
            {/* Small diamond at top of target marker */}
            <polygon
              points={`
                ${scale(target)},${barCenterY - rangeHeight * 0.4 - 4}
                ${scale(target) + 3},${barCenterY - rangeHeight * 0.4}
                ${scale(target)},${barCenterY - rangeHeight * 0.4 + 4}
                ${scale(target) - 3},${barCenterY - rangeHeight * 0.4}
              `}
              fill={COLORS.text}
            />
          </g>
        )}

        {/* Value labels */}
        {actual != null && (
          <text
            x={scale(actual) + 4}
            y={barCenterY + 3}
            fill={COLORS.text}
            fontSize={10}
            fontWeight={600}
            fontFamily="inherit"
          >
            {fmt(actual)}
          </text>
        )}

        {/* Tick marks at band boundaries */}
        {ranges.map((threshold, i) => (
          <g key={`tick-${i}`}>
            <line
              x1={scale(threshold)}
              y1={rangeHeight}
              x2={scale(threshold)}
              y2={rangeHeight + 4}
              stroke={COLORS.muted}
              strokeWidth={1}
            />
            <text
              x={scale(threshold)}
              y={rangeHeight + 14}
              textAnchor="middle"
              fill={COLORS.muted}
              fontSize={8}
              fontFamily="inherit"
            >
              {fmt(threshold)}
            </text>
          </g>
        ))}

        {/* Target label below */}
        {target != null && (
          <text
            x={scale(target)}
            y={rangeHeight + 14}
            textAnchor="middle"
            fill={COLORS.textSecondary}
            fontSize={8}
            fontWeight={500}
            fontFamily="inherit"
          >
            Target: {fmt(target)}
          </text>
        )}
      </g>
    </svg>
  );
}
