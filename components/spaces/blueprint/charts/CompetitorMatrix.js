// components/spaces/blueprint/charts/CompetitorMatrix.js
// Competitive positioning scatter plot visualization

import { useMemo, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label,
} from 'recharts';

// Ontographia Design System colors
const COLORS = {
  primary: '#47453F',
  success: '#5B8A6A',
  warning: '#C9A227',
  danger: '#A54D4D',
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  textMuted: '#9C9A94',
  border: '#E2E0DB',
  background: '#FDFCFA',
  highlight: '#6366f1',
};

// Threat level colors
const THREAT_COLORS = {
  high: COLORS.danger,
  medium: COLORS.warning,
  low: COLORS.success,
};

export default function CompetitorMatrix({
  competitors = [],
  xAxis = 'market_share',
  yAxis = 'product_strength',
  xAxisLabel = 'Market Share',
  yAxisLabel = 'Product Strength',
  showQuadrants = true,
  showLabels = true,
  compact = false,
  highlightId,
  ourPosition,
  onCompetitorClick,
}) {
  const [hoveredId, setHoveredId] = useState(null);

  // Normalize competitor data for the chart
  const chartData = useMemo(() => {
    return competitors.map((comp, index) => ({
      ...comp,
      id: comp.id || `competitor-${index}`,
      name: comp.name,
      x: comp[xAxis] || comp.market_share || 50,
      y: comp[yAxis] || comp.product_strength || 50,
      threat: comp.threat_level || 'medium',
      color: THREAT_COLORS[comp.threat_level] || COLORS.primary,
      size: comp.threat_level === 'high' ? 200 :
            comp.threat_level === 'medium' ? 150 : 100,
    }));
  }, [competitors, xAxis, yAxis]);

  // Add "Our Position" if provided
  const allData = useMemo(() => {
    if (!ourPosition) return chartData;
    return [
      ...chartData,
      {
        id: 'our-position',
        name: 'Our Position',
        x: ourPosition.x || ourPosition[xAxis] || 50,
        y: ourPosition.y || ourPosition[yAxis] || 50,
        color: COLORS.highlight,
        size: 250,
        isOurs: true,
      },
    ];
  }, [chartData, ourPosition, xAxis, yAxis]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="competitor-tooltip">
        <div className="tooltip-header" style={{ color: data.color }}>
          {data.name}
          {data.isOurs && <span className="our-badge">You</span>}
        </div>
        <div className="tooltip-metrics">
          <div className="metric">
            <span className="metric-label">{xAxisLabel}:</span>
            <span className="metric-value">{data.x}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">{yAxisLabel}:</span>
            <span className="metric-value">{data.y}/100</span>
          </div>
        </div>
        {data.threat && !data.isOurs && (
          <div className="tooltip-threat" style={{ color: data.color }}>
            Threat Level: {data.threat}
          </div>
        )}
        {data.positioning && (
          <div className="tooltip-positioning">{data.positioning}</div>
        )}
        {data.strengths && (
          <div className="tooltip-strengths">
            <strong>Strengths:</strong> {data.strengths}
          </div>
        )}
        {data.weaknesses && (
          <div className="tooltip-weaknesses">
            <strong>Weaknesses:</strong> {data.weaknesses}
          </div>
        )}
      </div>
    );
  };

  // Custom dot shape
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const isHovered = hoveredId === payload.id;
    const isHighlighted = highlightId === payload.id;
    const isOurs = payload.isOurs;

    return (
      <g
        onMouseEnter={() => setHoveredId(payload.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => onCompetitorClick?.(payload)}
        style={{ cursor: onCompetitorClick ? 'pointer' : 'default' }}
      >
        {/* Outer ring for highlight */}
        {(isHovered || isHighlighted) && (
          <circle
            cx={cx}
            cy={cy}
            r={Math.sqrt(payload.size / Math.PI) + 4}
            fill="none"
            stroke={payload.color}
            strokeWidth={2}
            opacity={0.5}
          />
        )}
        {/* Main dot */}
        <circle
          cx={cx}
          cy={cy}
          r={Math.sqrt(payload.size / Math.PI)}
          fill={payload.color}
          opacity={isOurs ? 1 : 0.8}
        />
        {/* Star marker for our position */}
        {isOurs && (
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fill={COLORS.background}
            fontSize={12}
            fontWeight="bold"
          >
            ★
          </text>
        )}
        {/* Label */}
        {showLabels && !compact && (
          <text
            x={cx}
            y={cy + Math.sqrt(payload.size / Math.PI) + 14}
            textAnchor="middle"
            fill={COLORS.text}
            fontSize={10}
            fontWeight={isOurs ? 600 : 400}
          >
            {payload.name.length > 12 ? `${payload.name.slice(0, 12)}...` : payload.name}
          </text>
        )}
      </g>
    );
  };

  const height = compact ? 250 : 350;

  return (
    <div className="competitor-matrix">
      {!compact && (
        <div className="chart-header">
          <h4>Competitive Positioning</h4>
          <div className="threat-legend">
            {Object.entries(THREAT_COLORS).map(([level, color]) => (
              <span key={level} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: color }} />
                <span className="legend-label">{level}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: compact ? 30 : 50,
            left: compact ? 30 : 50,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.border}
          />

          {/* Quadrant dividers */}
          {showQuadrants && (
            <>
              <ReferenceLine
                x={50}
                stroke={COLORS.border}
                strokeDasharray="5 5"
              />
              <ReferenceLine
                y={50}
                stroke={COLORS.border}
                strokeDasharray="5 5"
              />
            </>
          )}

          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 100]}
            tick={{ fill: COLORS.textSecondary, fontSize: 11 }}
            axisLine={{ stroke: COLORS.border }}
            tickLine={{ stroke: COLORS.border }}
          >
            <Label
              value={xAxisLabel}
              offset={compact ? -5 : -10}
              position="insideBottom"
              fill={COLORS.text}
              fontSize={12}
            />
          </XAxis>

          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 100]}
            tick={{ fill: COLORS.textSecondary, fontSize: 11 }}
            axisLine={{ stroke: COLORS.border }}
            tickLine={{ stroke: COLORS.border }}
          >
            <Label
              value={yAxisLabel}
              angle={-90}
              offset={compact ? 0 : 10}
              position="insideLeft"
              fill={COLORS.text}
              fontSize={12}
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>

          <Tooltip content={<CustomTooltip />} />

          <Scatter
            data={allData}
            shape={<CustomDot />}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quadrant labels */}
      {showQuadrants && !compact && (
        <div className="quadrant-labels">
          <span className="quadrant-label top-left">Challengers</span>
          <span className="quadrant-label top-right">Leaders</span>
          <span className="quadrant-label bottom-left">Niche Players</span>
          <span className="quadrant-label bottom-right">Visionaries</span>
        </div>
      )}

      {/* Competitor list (compact mode) */}
      {compact && competitors.length > 0 && (
        <div className="competitor-list-compact">
          {competitors.slice(0, 3).map((comp) => (
            <span
              key={comp.id || comp.name}
              className="competitor-chip"
              style={{ borderColor: THREAT_COLORS[comp.threat_level] }}
            >
              {comp.name}
            </span>
          ))}
          {competitors.length > 3 && (
            <span className="more-indicator">+{competitors.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  );
}
