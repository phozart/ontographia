// components/spaces/blueprint/charts/MarketSizingChart.js
// TAM/SAM/SOM funnel visualization with Ontographia Design System colors

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

// Ontographia Design System colors
const COLORS = {
  tam: '#47453F',    // Shell accent - darkest
  sam: '#6B6861',    // Mid tone
  som: '#5B8A6A',    // Success green - most actionable
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  border: '#E2E0DB',
  background: '#FDFCFA',
};

export default function MarketSizingChart({
  tam,
  sam,
  som,
  tamAssumptions,
  samAssumptions,
  somAssumptions,
  methodology,
  showLabels = true,
  compact = false,
  onSegmentClick,
}) {
  // Format currency values
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '-';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value}`;
  };

  // Prepare chart data
  const chartData = useMemo(() => [
    {
      name: 'TAM',
      fullName: 'Total Addressable Market',
      value: tam || 0,
      assumptions: tamAssumptions,
      color: COLORS.tam,
      percentage: 100,
    },
    {
      name: 'SAM',
      fullName: 'Serviceable Addressable Market',
      value: sam || 0,
      assumptions: samAssumptions,
      color: COLORS.sam,
      percentage: tam ? Math.round((sam / tam) * 100) : 0,
    },
    {
      name: 'SOM',
      fullName: 'Serviceable Obtainable Market',
      value: som || 0,
      assumptions: somAssumptions,
      color: COLORS.som,
      percentage: sam ? Math.round((som / sam) * 100) : 0,
    },
  ], [tam, sam, som, tamAssumptions, samAssumptions, somAssumptions]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="market-chart-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-name">{data.fullName}</span>
          <span className="tooltip-abbr">({data.name})</span>
        </div>
        <div className="tooltip-value">{formatCurrency(data.value)}</div>
        {data.assumptions && (
          <div className="tooltip-assumptions">{data.assumptions}</div>
        )}
        {data.name !== 'TAM' && (
          <div className="tooltip-percentage">
            {data.percentage}% of {data.name === 'SAM' ? 'TAM' : 'SAM'}
          </div>
        )}
      </div>
    );
  };

  // Render custom bar label
  const renderCustomLabel = (props) => {
    const { x, y, width, value, index } = props;
    const item = chartData[index];
    if (!showLabels) return null;
    return (
      <g>
        <text
          x={x + width + 8}
          y={y + 20}
          fill={COLORS.text}
          fontSize={compact ? 12 : 14}
          fontWeight={600}
        >
          {formatCurrency(value)}
        </text>
        {!compact && (
          <text
            x={x + width + 8}
            y={y + 36}
            fill={COLORS.textSecondary}
            fontSize={11}
          >
            {item.name === 'TAM' ? '' : `${item.percentage}% capture`}
          </text>
        )}
      </g>
    );
  };

  const height = compact ? 120 : 200;

  return (
    <div className="market-sizing-chart">
      {!compact && (
        <div className="chart-header">
          <h4>Market Sizing</h4>
          {methodology && (
            <span className="methodology-badge">{methodology}</span>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 5,
            right: compact ? 80 : 120,
            left: compact ? 40 : 60,
            bottom: 5,
          }}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            stroke={COLORS.border}
          />
          <XAxis
            type="number"
            tickFormatter={formatCurrency}
            tick={{ fill: COLORS.textSecondary, fontSize: 11 }}
            axisLine={{ stroke: COLORS.border }}
            tickLine={{ stroke: COLORS.border }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: COLORS.text, fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            width={compact ? 35 : 50}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71, 69, 63, 0.05)' }} />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            onClick={(data) => onSegmentClick?.(data)}
            style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList dataKey="value" content={renderCustomLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {!compact && (
        <div className="chart-legend">
          {chartData.map((item) => (
            <div key={item.name} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: item.color }}
              />
              <span className="legend-label">{item.fullName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
