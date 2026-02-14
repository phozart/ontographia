// components/spaces/blueprint/charts/FinancialProjection.js
// Revenue/cost timeline projection visualization

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

// Ontographia Design System colors
const COLORS = {
  revenue: '#5B8A6A',
  revenueLight: 'rgba(91, 138, 106, 0.2)',
  cost: '#A54D4D',
  costLight: 'rgba(165, 77, 77, 0.2)',
  profit: '#47453F',
  profitLight: 'rgba(71, 69, 63, 0.1)',
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  textMuted: '#9C9A94',
  border: '#E2E0DB',
  background: '#FDFCFA',
  breakeven: '#C9A227',
};

export default function FinancialProjection({
  projections = [],
  investmentRequired = 0,
  breakEvenMonths = null,
  showCosts = true,
  showProfit = true,
  showBreakEven = true,
  currency = 'USD',
  compact = false,
  timeUnit = 'month', // 'month' | 'quarter' | 'year'
}) {
  // Format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
      notation: absValue >= 1e6 ? 'compact' : 'standard',
    });

    return sign + formatter.format(absValue);
  };

  // Generate default projections if none provided
  const chartData = useMemo(() => {
    if (projections.length > 0) {
      return projections.map((p, index) => ({
        ...p,
        period: p.period || index + 1,
        label: p.label || `${timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)} ${index + 1}`,
        profit: (p.revenue || 0) - (p.cost || 0),
        cumulative: projections.slice(0, index + 1).reduce(
          (sum, proj) => sum + ((proj.revenue || 0) - (proj.cost || 0)),
          -investmentRequired
        ),
      }));
    }

    // Generate sample projections if none provided
    const months = 24;
    return Array.from({ length: months }, (_, i) => {
      const month = i + 1;
      const revenue = month < 6 ? 0 : Math.round(50000 * Math.pow(1.15, month - 6));
      const cost = Math.round(30000 + (month < 6 ? 20000 : 10000));
      const profit = revenue - cost;
      const cumulative = -investmentRequired + (month > 1 ?
        Array.from({ length: month - 1 }, (_, j) => {
          const prevMonth = j + 1;
          const prevRev = prevMonth < 6 ? 0 : Math.round(50000 * Math.pow(1.15, prevMonth - 6));
          const prevCost = Math.round(30000 + (prevMonth < 6 ? 20000 : 10000));
          return prevRev - prevCost;
        }).reduce((a, b) => a + b, 0) + profit : profit
      );

      return {
        period: month,
        label: `M${month}`,
        revenue,
        cost,
        profit,
        cumulative,
      };
    });
  }, [projections, investmentRequired, timeUnit]);

  // Find break-even point
  const breakEvenPoint = useMemo(() => {
    if (breakEvenMonths !== null) return breakEvenMonths;
    const point = chartData.findIndex(d => d.cumulative >= 0);
    return point >= 0 ? point + 1 : null;
  }, [chartData, breakEvenMonths]);

  // Key metrics
  const metrics = useMemo(() => {
    const lastPeriod = chartData[chartData.length - 1];
    const totalRevenue = chartData.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const totalCosts = chartData.reduce((sum, d) => sum + (d.cost || 0), 0);

    return {
      totalRevenue,
      totalCosts,
      totalProfit: totalRevenue - totalCosts,
      finalCumulative: lastPeriod?.cumulative || 0,
      roi: investmentRequired > 0 ?
        Math.round(((totalRevenue - totalCosts - investmentRequired) / investmentRequired) * 100) :
        0,
      peakRevenue: Math.max(...chartData.map(d => d.revenue || 0)),
    };
  }, [chartData, investmentRequired]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="financial-tooltip">
        <div className="tooltip-header">{data.label}</div>
        <div className="tooltip-metrics">
          <div className="metric" style={{ color: COLORS.revenue }}>
            <span className="metric-label">Revenue:</span>
            <span className="metric-value">{formatCurrency(data.revenue)}</span>
          </div>
          {showCosts && (
            <div className="metric" style={{ color: COLORS.cost }}>
              <span className="metric-label">Costs:</span>
              <span className="metric-value">{formatCurrency(data.cost)}</span>
            </div>
          )}
          {showProfit && (
            <div className="metric" style={{ color: data.profit >= 0 ? COLORS.revenue : COLORS.cost }}>
              <span className="metric-label">Profit:</span>
              <span className="metric-value">{formatCurrency(data.profit)}</span>
            </div>
          )}
          <div className="metric cumulative">
            <span className="metric-label">Cumulative:</span>
            <span
              className="metric-value"
              style={{ color: data.cumulative >= 0 ? COLORS.revenue : COLORS.cost }}
            >
              {formatCurrency(data.cumulative)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const height = compact ? 200 : 300;

  return (
    <div className="financial-projection">
      {!compact && (
        <div className="chart-header">
          <h4>Financial Projection</h4>
          <div className="key-metrics">
            <div className="metric-chip">
              <span className="chip-label">Investment</span>
              <span className="chip-value">{formatCurrency(investmentRequired)}</span>
            </div>
            {breakEvenPoint && (
              <div className="metric-chip breakeven">
                <span className="chip-label">Break-even</span>
                <span className="chip-value">{breakEvenPoint} {timeUnit}s</span>
              </div>
            )}
            <div className="metric-chip roi">
              <span className="chip-label">ROI</span>
              <span
                className="chip-value"
                style={{ color: metrics.roi >= 0 ? COLORS.revenue : COLORS.cost }}
              >
                {metrics.roi}%
              </span>
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: compact ? 10 : 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.cost} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.cost} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.border}
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{ fill: COLORS.textSecondary, fontSize: compact ? 10 : 11 }}
            axisLine={{ stroke: COLORS.border }}
            tickLine={false}
            interval={compact ? 'preserveStartEnd' : 0}
          />

          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fill: COLORS.textSecondary, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={compact ? 50 : 70}
          />

          <Tooltip content={<CustomTooltip />} />

          {!compact && (
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: 12 }}
            />
          )}

          {/* Break-even line */}
          {showBreakEven && breakEvenPoint && (
            <ReferenceLine
              x={chartData[breakEvenPoint - 1]?.label}
              stroke={COLORS.breakeven}
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: 'Break-even',
                fill: COLORS.breakeven,
                fontSize: 11,
                position: 'top',
              }}
            />
          )}

          {/* Zero line */}
          <ReferenceLine y={0} stroke={COLORS.border} />

          {/* Cost area */}
          {showCosts && (
            <Area
              type="monotone"
              dataKey="cost"
              name="Costs"
              stroke={COLORS.cost}
              fill="url(#costGradient)"
              strokeWidth={2}
            />
          )}

          {/* Revenue area */}
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={COLORS.revenue}
            fill="url(#revenueGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary metrics */}
      {!compact && (
        <div className="projection-summary">
          <div className="summary-item">
            <span className="summary-label">Total Revenue</span>
            <span className="summary-value" style={{ color: COLORS.revenue }}>
              {formatCurrency(metrics.totalRevenue)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Costs</span>
            <span className="summary-value" style={{ color: COLORS.cost }}>
              {formatCurrency(metrics.totalCosts)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Net Profit</span>
            <span
              className="summary-value"
              style={{ color: metrics.totalProfit >= 0 ? COLORS.revenue : COLORS.cost }}
            >
              {formatCurrency(metrics.totalProfit)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
