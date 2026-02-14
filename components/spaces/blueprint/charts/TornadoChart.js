// components/spaces/blueprint/charts/TornadoChart.js
// Horizontal sensitivity analysis tornado chart (pure SVG)

import { useMemo } from 'react';

// Ontographia Design System colors
const COLORS = {
  favorable: '#5B8A6A',
  unfavorable: '#A54D4D',
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  muted: '#9C9A94',
  border: '#E2E0DB',
  canvas: '#FDFCFA',
  centerLine: '#47453F',
};

function formatValue(value, currency) {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}${currency}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}${currency}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}${currency}${(abs / 1e3).toFixed(0)}K`;
  return `${sign}${currency}${abs.toFixed(0)}`;
}

export default function TornadoChart({ data = [], baseNPV = 0, currency = '$' }) {
  // Sort data by total impact (largest swing first)
  const sortedData = useMemo(() => {
    return [...data]
      .map((d) => ({
        ...d,
        swing: Math.abs(d.favorable - d.unfavorable),
      }))
      .sort((a, b) => b.swing - a.swing);
  }, [data]);

  // Chart layout constants
  const labelWidth = 130;
  const valueWidth = 55;
  const margin = { top: 36, right: valueWidth + 8, bottom: 32, left: labelWidth + 8 };
  const rowHeight = 28;
  const barPadding = 4;
  const barHeight = rowHeight - barPadding * 2;
  const chartContentHeight = Math.max(sortedData.length * rowHeight, rowHeight);
  const viewWidth = 560;
  const viewHeight = margin.top + chartContentHeight + margin.bottom;
  const chartWidth = viewWidth - margin.left - margin.right;

  // Scale: map NPV values to x positions; center is baseNPV
  const { scale, xMin, xMax } = useMemo(() => {
    if (sortedData.length === 0) {
      return { scale: () => chartWidth / 2, xMin: baseNPV - 1, xMax: baseNPV + 1 };
    }
    const allValues = sortedData.flatMap((d) => [d.favorable, d.unfavorable]);
    allValues.push(baseNPV);
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);
    const range = dataMax - dataMin || 1;
    const pad = range * 0.1;
    const min = dataMin - pad;
    const max = dataMax + pad;
    const s = (v) => ((v - min) / (max - min)) * chartWidth;
    return { scale: s, xMin: min, xMax: max };
  }, [sortedData, baseNPV, chartWidth]);

  const centerX = scale(baseNPV);

  // Generate tick marks
  const ticks = useMemo(() => {
    const range = xMax - xMin;
    const step = range / 5;
    const result = [];
    for (let i = 0; i <= 5; i++) {
      const val = xMin + step * i;
      result.push({ value: val, x: scale(val) });
    }
    return result;
  }, [xMin, xMax, scale]);

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Tornado sensitivity analysis chart with ${sortedData.length} factors`}
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <title>
        Sensitivity Analysis — Base NPV: {formatValue(baseNPV, currency)}
      </title>

      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Header text */}
        <text
          x={centerX}
          y={-20}
          textAnchor="middle"
          fill={COLORS.text}
          fontSize={11}
          fontWeight={600}
          fontFamily="inherit"
        >
          Base NPV: {formatValue(baseNPV, currency)}
        </text>

        {/* Axis ticks along bottom */}
        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={tick.x}
              y1={0}
              x2={tick.x}
              y2={chartContentHeight}
              stroke={COLORS.border}
              strokeWidth={0.5}
              strokeDasharray="2 3"
            />
            <text
              x={tick.x}
              y={chartContentHeight + 16}
              textAnchor="middle"
              fill={COLORS.muted}
              fontSize={9}
              fontFamily="inherit"
            >
              {formatValue(tick.value, currency)}
            </text>
          </g>
        ))}

        {/* Center line at baseNPV */}
        <line
          x1={centerX}
          y1={-4}
          x2={centerX}
          y2={chartContentHeight + 4}
          stroke={COLORS.centerLine}
          strokeWidth={1.5}
        />

        {/* Bars */}
        {sortedData.map((item, index) => {
          const y = index * rowHeight + barPadding;
          const favX = scale(item.favorable);
          const unfavX = scale(item.unfavorable);

          // Favorable bar extends right of center, unfavorable extends left
          // But we draw from the actual value positions
          const leftVal = Math.min(item.favorable, item.unfavorable);
          const rightVal = Math.max(item.favorable, item.unfavorable);
          const leftX = scale(leftVal);
          const rightX = scale(rightVal);

          // Determine which side is favorable vs unfavorable
          const favorableIsRight = item.favorable >= item.unfavorable;

          return (
            <g key={item.label}>
              {/* Row background on hover (via transparent rect) */}
              <rect
                x={-margin.left}
                y={y - barPadding}
                width={viewWidth}
                height={rowHeight}
                fill="transparent"
                opacity={0}
              />

              {/* Unfavorable bar (the portion from center toward the unfavorable value) */}
              {favorableIsRight ? (
                <>
                  {/* Unfavorable: center to left */}
                  <rect
                    x={unfavX}
                    y={y}
                    width={Math.max(centerX - unfavX, 0)}
                    height={barHeight}
                    rx={2}
                    ry={2}
                    fill={COLORS.unfavorable}
                    opacity={0.85}
                  >
                    <title>
                      {item.label} — Unfavorable: {formatValue(item.unfavorable, currency)}
                    </title>
                  </rect>
                  {/* Favorable: center to right */}
                  <rect
                    x={centerX}
                    y={y}
                    width={Math.max(favX - centerX, 0)}
                    height={barHeight}
                    rx={2}
                    ry={2}
                    fill={COLORS.favorable}
                    opacity={0.85}
                  >
                    <title>
                      {item.label} — Favorable: {formatValue(item.favorable, currency)}
                    </title>
                  </rect>
                </>
              ) : (
                <>
                  {/* Unfavorable: center to right */}
                  <rect
                    x={centerX}
                    y={y}
                    width={Math.max(unfavX - centerX, 0)}
                    height={barHeight}
                    rx={2}
                    ry={2}
                    fill={COLORS.unfavorable}
                    opacity={0.85}
                  >
                    <title>
                      {item.label} — Unfavorable: {formatValue(item.unfavorable, currency)}
                    </title>
                  </rect>
                  {/* Favorable: center to left */}
                  <rect
                    x={favX}
                    y={y}
                    width={Math.max(centerX - favX, 0)}
                    height={barHeight}
                    rx={2}
                    ry={2}
                    fill={COLORS.favorable}
                    opacity={0.85}
                  >
                    <title>
                      {item.label} — Favorable: {formatValue(item.favorable, currency)}
                    </title>
                  </rect>
                </>
              )}

              {/* Label on left side */}
              <text
                x={-8}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                fill={COLORS.text}
                fontSize={10}
                fontWeight={500}
                fontFamily="inherit"
              >
                <title>{item.label}</title>
                {item.label.length > 18 ? `${item.label.slice(0, 18)}...` : item.label}
              </text>

              {/* Value labels at bar ends */}
              <text
                x={leftX - 4}
                y={y + barHeight / 2 + 3}
                textAnchor="end"
                fill={leftVal === item.unfavorable ? COLORS.unfavorable : COLORS.favorable}
                fontSize={9}
                fontFamily="inherit"
              >
                {formatValue(leftVal, currency)}
              </text>
              <text
                x={rightX + 4}
                y={y + barHeight / 2 + 3}
                textAnchor="start"
                fill={rightVal === item.favorable ? COLORS.favorable : COLORS.unfavorable}
                fontSize={9}
                fontFamily="inherit"
              >
                {formatValue(rightVal, currency)}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(0, ${chartContentHeight + 26})`}>
          <rect x={0} y={-4} width={10} height={10} rx={2} fill={COLORS.unfavorable} opacity={0.85} />
          <text x={14} y={5} fill={COLORS.textSecondary} fontSize={9} fontFamily="inherit">
            Unfavorable
          </text>
          <rect x={80} y={-4} width={10} height={10} rx={2} fill={COLORS.favorable} opacity={0.85} />
          <text x={94} y={5} fill={COLORS.textSecondary} fontSize={9} fontFamily="inherit">
            Favorable
          </text>
        </g>

        {/* Empty state */}
        {sortedData.length === 0 && (
          <text
            x={chartWidth / 2}
            y={chartContentHeight / 2}
            textAnchor="middle"
            fill={COLORS.muted}
            fontSize={12}
            fontFamily="inherit"
          >
            No sensitivity data
          </text>
        )}
      </g>
    </svg>
  );
}
