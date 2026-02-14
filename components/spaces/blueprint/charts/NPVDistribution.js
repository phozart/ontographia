// components/spaces/blueprint/charts/NPVDistribution.js
// Horizontal range bar showing P10/P50/P90 NPV distribution (pure SVG)

import { useMemo } from 'react';

// Ontographia Design System colors
const COLORS = {
  success: '#5B8A6A',
  warning: '#C9A227',
  danger: '#A54D4D',
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  muted: '#9C9A94',
  border: '#E2E0DB',
  canvas: '#FDFCFA',
};

function formatValue(value, currency) {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}${currency}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}${currency}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}${currency}${(abs / 1e3).toFixed(0)}K`;
  return `${sign}${currency}${abs.toFixed(0)}`;
}

export default function NPVDistribution({ p10, p50, p90, currency = '$' }) {
  // Chart layout constants
  const margin = { top: 32, right: 60, bottom: 48, left: 60 };
  const viewWidth = 560;
  const viewHeight = 120;
  const chartWidth = viewWidth - margin.left - margin.right;
  const chartHeight = viewHeight - margin.top - margin.bottom;
  const barHeight = 24;
  const barY = (chartHeight - barHeight) / 2;

  // Compute scale domain with padding
  const { xMin, xMax, scale } = useMemo(() => {
    const values = [p10, p50, p90].filter((v) => v != null);
    if (values.length === 0) return { xMin: -100, xMax: 100, scale: () => 0 };
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const range = dataMax - dataMin || 1;
    const pad = range * 0.15;
    const min = dataMin - pad;
    const max = dataMax + pad;
    const s = (v) => ((v - min) / (max - min)) * chartWidth;
    return { xMin: min, xMax: max, scale: s };
  }, [p10, p50, p90, chartWidth]);

  // Determine zero-line position
  const zeroX = xMin <= 0 && xMax >= 0 ? scale(0) : null;

  // Gradient stop: fraction where value transitions from negative to positive
  const gradientStops = useMemo(() => {
    if (p10 == null || p90 == null) return null;
    const leftX = scale(p10);
    const rightX = scale(p90);
    const barWidth = rightX - leftX;
    if (barWidth <= 0) return null;

    // If entire range is positive
    if (p10 >= 0) return [{ offset: '0%', color: COLORS.success }];
    // If entire range is negative
    if (p90 <= 0) return [{ offset: '0%', color: COLORS.danger }];
    // Transition at zero crossing
    const zeroFraction = ((0 - p10) / (p90 - p10)) * 100;
    return [
      { offset: '0%', color: COLORS.danger },
      { offset: `${zeroFraction}%`, color: COLORS.warning },
      { offset: '100%', color: COLORS.success },
    ];
  }, [p10, p90, scale]);

  // Marker positions
  const markers = useMemo(() => {
    const result = [];
    if (p10 != null) result.push({ label: 'P10', value: p10, x: scale(p10), bold: false });
    if (p50 != null) result.push({ label: 'P50', value: p50, x: scale(p50), bold: true });
    if (p90 != null) result.push({ label: 'P90', value: p90, x: scale(p90), bold: false });
    return result;
  }, [p10, p50, p90, scale]);

  const hasData = p10 != null && p90 != null;
  const gradientId = 'npv-range-gradient';

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`NPV Distribution: P10 ${formatValue(p10, currency)}, P50 ${formatValue(p50, currency)}, P90 ${formatValue(p90, currency)}`}
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <title>
        NPV Range: P10 {formatValue(p10, currency)}, P50 {formatValue(p50, currency)}, P90{' '}
        {formatValue(p90, currency)}
      </title>

      {/* Gradient definition */}
      {hasData && gradientStops && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {gradientStops.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={stop.color} stopOpacity={0.85} />
            ))}
          </linearGradient>
        </defs>
      )}

      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Axis line */}
        <line
          x1={0}
          y1={barY + barHeight + 8}
          x2={chartWidth}
          y2={barY + barHeight + 8}
          stroke={COLORS.border}
          strokeWidth={1}
        />

        {/* Zero reference line */}
        {zeroX != null && (
          <g>
            <line
              x1={zeroX}
              y1={barY - 6}
              x2={zeroX}
              y2={barY + barHeight + 8}
              stroke={COLORS.muted}
              strokeWidth={1}
              strokeDasharray="3 2"
            />
            <text
              x={zeroX}
              y={barY - 10}
              textAnchor="middle"
              fill={COLORS.muted}
              fontSize={9}
              fontFamily="inherit"
            >
              0
            </text>
          </g>
        )}

        {/* Range bar (P10 to P90) */}
        {hasData && (
          <rect
            x={scale(p10)}
            y={barY}
            width={Math.max(scale(p90) - scale(p10), 2)}
            height={barHeight}
            rx={4}
            ry={4}
            fill={`url(#${gradientId})`}
          >
            <title>
              Range: {formatValue(p10, currency)} to {formatValue(p90, currency)}
            </title>
          </rect>
        )}

        {/* Markers */}
        {markers.map((m) => {
          const markerHeight = m.bold ? barHeight + 12 : barHeight + 6;
          const markerTop = m.bold ? barY - 6 : barY - 3;
          const markerWidth = m.bold ? 3 : 2;
          const markerColor = m.bold ? COLORS.text : COLORS.textSecondary;

          return (
            <g key={m.label}>
              {/* Vertical marker line */}
              <line
                x1={m.x}
                y1={markerTop}
                x2={m.x}
                y2={markerTop + markerHeight}
                stroke={markerColor}
                strokeWidth={markerWidth}
                strokeLinecap="round"
              />

              {/* Diamond on P50 */}
              {m.bold && (
                <polygon
                  points={`${m.x},${barY - 10} ${m.x + 5},${barY - 5} ${m.x},${barY} ${m.x - 5},${barY - 5}`}
                  fill={COLORS.text}
                />
              )}

              {/* Label: percentile name */}
              <text
                x={m.x}
                y={barY + barHeight + 22}
                textAnchor="middle"
                fill={m.bold ? COLORS.text : COLORS.muted}
                fontSize={m.bold ? 11 : 10}
                fontWeight={m.bold ? 700 : 400}
                fontFamily="inherit"
              >
                {m.label}
              </text>

              {/* Label: value */}
              <text
                x={m.x}
                y={barY + barHeight + 35}
                textAnchor="middle"
                fill={m.bold ? COLORS.text : COLORS.textSecondary}
                fontSize={m.bold ? 12 : 10}
                fontWeight={m.bold ? 600 : 400}
                fontFamily="inherit"
              >
                <title>
                  {m.label}: {formatValue(m.value, currency)}
                </title>
                {formatValue(m.value, currency)}
              </text>
            </g>
          );
        })}

        {/* No data state */}
        {!hasData && (
          <text
            x={chartWidth / 2}
            y={chartHeight / 2 + 4}
            textAnchor="middle"
            fill={COLORS.muted}
            fontSize={12}
            fontFamily="inherit"
          >
            No NPV distribution data
          </text>
        )}
      </g>
    </svg>
  );
}
