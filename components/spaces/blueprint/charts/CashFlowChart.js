// components/spaces/blueprint/charts/CashFlowChart.js
// Cumulative cash flow area chart with break-even marker (pure SVG)

import { useMemo } from 'react';

// Ontographia Design System colors
const COLORS = {
  positive: '#5B8A6A',
  positiveFill: 'rgba(91, 138, 106, 0.18)',
  negative: '#A54D4D',
  negativeFill: 'rgba(165, 77, 77, 0.18)',
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  muted: '#9C9A94',
  border: '#E2E0DB',
  canvas: '#FDFCFA',
  breakEven: '#C9A227',
  zeroLine: '#47453F',
};

function formatCurrency(value, currency = '$') {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}${currency}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}${currency}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}${currency}${(abs / 1e3).toFixed(0)}K`;
  return `${sign}${currency}${abs.toFixed(0)}`;
}

export default function CashFlowChart({ data = [], breakEvenYear, currency = '$' }) {
  // Chart layout
  const margin = { top: 24, right: 32, bottom: 40, left: 56 };
  const viewWidth = 560;
  const viewHeight = 280;
  const chartWidth = viewWidth - margin.left - margin.right;
  const chartHeight = viewHeight - margin.top - margin.bottom;

  // Scales
  const { xScale, yScale, yMin, yMax, yTicks, zeroY } = useMemo(() => {
    if (data.length === 0) {
      return {
        xScale: () => 0,
        yScale: () => chartHeight / 2,
        yMin: -100,
        yMax: 100,
        yTicks: [],
        zeroY: chartHeight / 2,
      };
    }

    const values = data.map((d) => d.value);
    const dataYMin = Math.min(0, ...values);
    const dataYMax = Math.max(0, ...values);
    const yRange = dataYMax - dataYMin || 1;
    const yPad = yRange * 0.12;
    const computedYMin = dataYMin - yPad;
    const computedYMax = dataYMax + yPad;

    const xs = (i) => (data.length <= 1 ? chartWidth / 2 : (i / (data.length - 1)) * chartWidth);
    const ys = (v) => chartHeight - ((v - computedYMin) / (computedYMax - computedYMin)) * chartHeight;

    // Generate Y axis ticks (roughly 5)
    const tickCount = 5;
    const rawStep = (computedYMax - computedYMin) / tickCount;
    // Round step to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(rawStep) || 1)));
    const normalized = rawStep / magnitude;
    let niceStep;
    if (normalized <= 1.5) niceStep = 1 * magnitude;
    else if (normalized <= 3.5) niceStep = 2 * magnitude;
    else if (normalized <= 7.5) niceStep = 5 * magnitude;
    else niceStep = 10 * magnitude;

    const ticks = [];
    const start = Math.ceil(computedYMin / niceStep) * niceStep;
    for (let v = start; v <= computedYMax; v += niceStep) {
      ticks.push(v);
    }

    return {
      xScale: xs,
      yScale: ys,
      yMin: computedYMin,
      yMax: computedYMax,
      yTicks: ticks,
      zeroY: ys(0),
    };
  }, [data, chartWidth, chartHeight]);

  // Build path data for the line
  const linePath = useMemo(() => {
    if (data.length === 0) return '';
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(d.value).toFixed(1)}`)
      .join(' ');
  }, [data, xScale, yScale]);

  // Build area paths (split into positive and negative regions)
  // We use clipPaths to separate the positive and negative fills
  const areaPath = useMemo(() => {
    if (data.length === 0) return '';
    const topPoints = data.map((d, i) => `${xScale(i).toFixed(1)},${yScale(d.value).toFixed(1)}`);
    // Close the path back along the zero line
    const lastX = xScale(data.length - 1).toFixed(1);
    const firstX = xScale(0).toFixed(1);
    const zY = zeroY.toFixed(1);
    return `M ${topPoints.join(' L ')} L ${lastX},${zY} L ${firstX},${zY} Z`;
  }, [data, xScale, yScale, zeroY]);

  // Find the break-even point coordinates
  const breakEvenPoint = useMemo(() => {
    if (breakEvenYear == null || data.length === 0) return null;
    // Find the data point matching breakEvenYear
    const idx = data.findIndex((d) => d.year === breakEvenYear);
    if (idx >= 0) {
      return { x: xScale(idx), y: yScale(data[idx].value), year: breakEvenYear, value: data[idx].value };
    }
    // If breakEvenYear falls between two points, interpolate
    for (let i = 0; i < data.length - 1; i++) {
      if (
        (data[i].year <= breakEvenYear && data[i + 1].year >= breakEvenYear) ||
        (data[i].year >= breakEvenYear && data[i + 1].year <= breakEvenYear)
      ) {
        const frac = (breakEvenYear - data[i].year) / (data[i + 1].year - data[i].year);
        const interpVal = data[i].value + frac * (data[i + 1].value - data[i].value);
        const interpX = xScale(i) + frac * (xScale(i + 1) - xScale(i));
        return { x: interpX, y: yScale(interpVal), year: breakEvenYear, value: interpVal };
      }
    }
    return null;
  }, [breakEvenYear, data, xScale, yScale]);

  // Unique IDs for clip paths
  const clipPosId = 'cashflow-clip-pos';
  const clipNegId = 'cashflow-clip-neg';

  const hasData = data.length > 0;

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Cumulative cash flow chart with ${data.length} data points`}
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <title>
        Cumulative Cash Flow
        {breakEvenYear != null ? ` — Break-even: Year ${breakEvenYear}` : ''}
      </title>

      {hasData && (
        <defs>
          {/* Clip path for positive region (above zero line) */}
          <clipPath id={clipPosId}>
            <rect x={0} y={0} width={chartWidth} height={zeroY} />
          </clipPath>
          {/* Clip path for negative region (below zero line) */}
          <clipPath id={clipNegId}>
            <rect x={0} y={zeroY} width={chartWidth} height={chartHeight - zeroY} />
          </clipPath>
        </defs>
      )}

      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Background */}
        <rect
          x={0}
          y={0}
          width={chartWidth}
          height={chartHeight}
          fill={COLORS.canvas}
          rx={2}
        />

        {/* Y-axis grid lines and labels */}
        {yTicks.map((tick) => {
          const y = yScale(tick);
          return (
            <g key={tick}>
              <line
                x1={0}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke={COLORS.border}
                strokeWidth={0.5}
                strokeDasharray={tick === 0 ? 'none' : '3 3'}
              />
              <text
                x={-8}
                y={y + 3}
                textAnchor="end"
                fill={COLORS.muted}
                fontSize={9}
                fontFamily="inherit"
              >
                {formatCurrency(tick, currency)}
              </text>
            </g>
          );
        })}

        {/* Zero line (dashed, prominent) */}
        <line
          x1={0}
          y1={zeroY}
          x2={chartWidth}
          y2={zeroY}
          stroke={COLORS.zeroLine}
          strokeWidth={1}
          strokeDasharray="6 3"
        />

        {hasData && (
          <>
            {/* Positive area fill (green tint) */}
            <path
              d={areaPath}
              fill={COLORS.positiveFill}
              clipPath={`url(#${clipPosId})`}
            />
            {/* Negative area fill (red tint) */}
            <path
              d={areaPath}
              fill={COLORS.negativeFill}
              clipPath={`url(#${clipNegId})`}
            />

            {/* Main line */}
            <path
              d={linePath}
              fill="none"
              stroke={COLORS.text}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Data point dots */}
            {data.map((d, i) => {
              const cx = xScale(i);
              const cy = yScale(d.value);
              const dotColor = d.value >= 0 ? COLORS.positive : COLORS.negative;
              return (
                <g key={i}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3.5}
                    fill={dotColor}
                    stroke={COLORS.canvas}
                    strokeWidth={1.5}
                  >
                    <title>
                      Year {d.year}: {formatCurrency(d.value, currency)}
                    </title>
                  </circle>
                </g>
              );
            })}

            {/* X-axis labels */}
            {data.map((d, i) => {
              // Show every label if few points, otherwise skip some
              const showLabel = data.length <= 12 || i % Math.ceil(data.length / 10) === 0 || i === data.length - 1;
              if (!showLabel) return null;
              return (
                <text
                  key={`xlabel-${i}`}
                  x={xScale(i)}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fill={COLORS.textSecondary}
                  fontSize={9}
                  fontFamily="inherit"
                >
                  {d.year != null ? `Y${d.year}` : `${i + 1}`}
                </text>
              );
            })}

            {/* Break-even marker */}
            {breakEvenPoint && (
              <g>
                {/* Vertical dashed line */}
                <line
                  x1={breakEvenPoint.x}
                  y1={0}
                  x2={breakEvenPoint.x}
                  y2={chartHeight}
                  stroke={COLORS.breakEven}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                {/* Circle marker */}
                <circle
                  cx={breakEvenPoint.x}
                  cy={breakEvenPoint.y}
                  r={6}
                  fill={COLORS.canvas}
                  stroke={COLORS.breakEven}
                  strokeWidth={2.5}
                >
                  <title>
                    Break-even: Year {breakEvenPoint.year} ({formatCurrency(breakEvenPoint.value, currency)})
                  </title>
                </circle>
                <circle
                  cx={breakEvenPoint.x}
                  cy={breakEvenPoint.y}
                  r={2.5}
                  fill={COLORS.breakEven}
                />
                {/* Label */}
                <rect
                  x={breakEvenPoint.x - 36}
                  y={-18}
                  width={72}
                  height={16}
                  rx={3}
                  fill={COLORS.breakEven}
                  opacity={0.9}
                />
                <text
                  x={breakEvenPoint.x}
                  y={-7}
                  textAnchor="middle"
                  fill={COLORS.canvas}
                  fontSize={9}
                  fontWeight={600}
                  fontFamily="inherit"
                >
                  Break-even
                </text>
              </g>
            )}
          </>
        )}

        {/* Axis labels */}
        <text
          x={chartWidth / 2}
          y={chartHeight + 32}
          textAnchor="middle"
          fill={COLORS.textSecondary}
          fontSize={10}
          fontFamily="inherit"
        >
          Year
        </text>
        <text
          x={0}
          y={-10}
          textAnchor="start"
          fill={COLORS.textSecondary}
          fontSize={10}
          fontFamily="inherit"
        >
          Cumulative ({currency})
        </text>

        {/* Empty state */}
        {!hasData && (
          <text
            x={chartWidth / 2}
            y={chartHeight / 2}
            textAnchor="middle"
            fill={COLORS.muted}
            fontSize={12}
            fontFamily="inherit"
          >
            No cash flow data
          </text>
        )}
      </g>
    </svg>
  );
}
