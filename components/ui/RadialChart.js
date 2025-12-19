/**
 * RadialChart - Radar/pie chart for health scores
 *
 * Reusable component for displaying multi-dimensional scores
 * in a radial format.
 *
 * @module components/ui/RadialChart
 */

import { useMemo } from 'react';
import styles from './ui.module.css';

/**
 * Convert polar coordinates to cartesian
 */
function polarToCartesian(cx, cy, radius, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

/**
 * Create SVG path for a sector (pie slice)
 */
function createSectorPath(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

/**
 * Create SVG path for radar polygon
 */
function createRadarPath(cx, cy, values, maxValue, radius) {
  const angleStep = 360 / values.length;

  const points = values.map((value, i) => {
    const normalizedValue = Math.min(value / maxValue, 1);
    const point = polarToCartesian(cx, cy, radius * normalizedValue, angleStep * i);
    return `${point.x},${point.y}`;
  });

  return `M ${points.join(' L ')} Z`;
}

/**
 * RadialChart Component - Displays either radar or pie chart
 *
 * @param {Array} data - Array of { label, value, color } objects
 * @param {string} type - Chart type: 'radar' or 'pie'
 * @param {number} size - Chart size in pixels
 * @param {number} maxValue - Maximum value for normalization (radar only)
 * @param {boolean} showLabels - Show labels around the chart
 * @param {boolean} showValues - Show values on the chart
 * @param {string} centerLabel - Label to show in center
 * @param {string|number} centerValue - Value to show in center
 */
export function RadialChart({
  data = [],
  type = 'radar',
  size = 200,
  maxValue = 100,
  showLabels = true,
  showValues = true,
  centerLabel,
  centerValue,
  className = '',
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - (showLabels ? 40 : 10);

  const chartContent = useMemo(() => {
    if (type === 'pie') {
      // Calculate total for percentage
      const total = data.reduce((sum, d) => sum + d.value, 0);
      if (total === 0) return null;

      let currentAngle = 0;
      return data.map((item, i) => {
        const percentage = item.value / total;
        const angle = percentage * 360;
        const path = createSectorPath(cx, cy, radius, currentAngle, currentAngle + angle);
        currentAngle += angle;

        return (
          <path
            key={i}
            d={path}
            fill={item.color || `hsl(${(i * 360) / data.length}, 70%, 60%)`}
            stroke="white"
            strokeWidth="2"
            className={styles.radialChartSector}
          >
            <title>{`${item.label}: ${item.value} (${Math.round(percentage * 100)}%)`}</title>
          </path>
        );
      });
    }

    if (type === 'radar') {
      const angleStep = 360 / data.length;

      // Background grid circles
      const gridCircles = [0.25, 0.5, 0.75, 1].map((scale, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={radius * scale}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          opacity="0.5"
        />
      ));

      // Grid lines from center
      const gridLines = data.map((_, i) => {
        const point = polarToCartesian(cx, cy, radius, angleStep * i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={point.x}
            y2={point.y}
            stroke="var(--border)"
            strokeWidth="1"
            opacity="0.5"
          />
        );
      });

      // Data polygon
      const values = data.map(d => d.value);
      const dataPath = createRadarPath(cx, cy, values, maxValue, radius);

      return (
        <>
          {gridCircles}
          {gridLines}
          <path
            d={dataPath}
            fill="var(--accent)"
            fillOpacity="0.3"
            stroke="var(--accent)"
            strokeWidth="2"
            className={styles.radialChartRadar}
          />
          {/* Data points */}
          {data.map((item, i) => {
            const normalizedValue = Math.min(item.value / maxValue, 1);
            const point = polarToCartesian(cx, cy, radius * normalizedValue, angleStep * i);
            return (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={item.color || 'var(--accent)'}
                stroke="white"
                strokeWidth="2"
                className={styles.radialChartPoint}
              >
                <title>{`${item.label}: ${item.value}`}</title>
              </circle>
            );
          })}
        </>
      );
    }

    return null;
  }, [data, type, cx, cy, radius, maxValue]);

  // Labels around the chart
  const labels = useMemo(() => {
    if (!showLabels) return null;

    const angleStep = 360 / data.length;
    const labelRadius = radius + 25;

    return data.map((item, i) => {
      const point = polarToCartesian(cx, cy, labelRadius, angleStep * i);
      const isLeft = point.x < cx;
      const isTop = point.y < cy;

      return (
        <text
          key={i}
          x={point.x}
          y={point.y}
          textAnchor={Math.abs(point.x - cx) < 10 ? 'middle' : isLeft ? 'end' : 'start'}
          dominantBaseline={Math.abs(point.y - cy) < 10 ? 'middle' : isTop ? 'auto' : 'hanging'}
          className={styles.radialChartLabel}
          fontSize="12"
          fill="var(--text-muted)"
        >
          {item.label}
          {showValues && (
            <tspan
              x={point.x}
              dy="14"
              fontSize="10"
              fill="var(--text)"
              fontWeight="500"
            >
              {item.value}
            </tspan>
          )}
        </text>
      );
    });
  }, [data, showLabels, showValues, cx, cy, radius]);

  return (
    <div className={`${styles.radialChart} ${className}`.trim()}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {chartContent}
        {type === 'radar' && labels}
      </svg>

      {/* Center content */}
      {(centerLabel || centerValue !== undefined) && (
        <div className={styles.radialChartCenter}>
          {centerValue !== undefined && (
            <span className={styles.radialChartCenterValue}>{centerValue}</span>
          )}
          {centerLabel && (
            <span className={styles.radialChartCenterLabel}>{centerLabel}</span>
          )}
        </div>
      )}

      {/* Legend for pie charts */}
      {type === 'pie' && showLabels && (
        <div className={styles.radialChartLegend}>
          {data.map((item, i) => (
            <div key={i} className={styles.radialChartLegendItem}>
              <span
                className={styles.radialChartLegendColor}
                style={{ backgroundColor: item.color || `hsl(${(i * 360) / data.length}, 70%, 60%)` }}
              />
              <span className={styles.radialChartLegendLabel}>{item.label}</span>
              {showValues && (
                <span className={styles.radialChartLegendValue}>{item.value}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * HealthWheel - Pre-configured radar chart for project space health
 */
export function HealthWheel({
  spaces = [],
  size = 240,
  showPercentage = true,
  className = '',
}) {
  // Calculate average score
  const avgScore = spaces.length > 0
    ? Math.round(spaces.reduce((sum, s) => sum + s.value, 0) / spaces.length)
    : 0;

  return (
    <RadialChart
      data={spaces}
      type="radar"
      size={size}
      maxValue={100}
      showLabels
      showValues
      centerValue={showPercentage ? `${avgScore}%` : avgScore}
      centerLabel="Health"
      className={className}
    />
  );
}

/**
 * DistributionChart - Pre-configured pie chart for distributions
 */
export function DistributionChart({
  items = [],
  size = 180,
  className = '',
}) {
  return (
    <RadialChart
      data={items}
      type="pie"
      size={size}
      showLabels
      showValues
      className={className}
    />
  );
}

export default RadialChart;
