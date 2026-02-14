// components/spaces/blueprint/charts/StageProgressChart.js
// Initiative pipeline funnel visualization

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
  LabelList,
} from 'recharts';

// Stage colors matching Blueprint Studio stage definitions
const STAGE_COLORS = {
  idea: '#C9A227',      // Warning/gold
  explore: '#5B8A6A',   // Success green
  assess: '#6366f1',    // Indigo
  case: '#47453F',      // Shell accent
  approval: '#3b82f6',  // Blue
  approved: '#22c55e',  // Bright green
  declined: '#A54D4D',  // Danger red
};

const STAGE_NAMES = {
  idea: 'Idea',
  explore: 'Explore',
  assess: 'Assess',
  case: 'Case',
  approval: 'Approval',
  approved: 'Approved',
  declined: 'Declined',
};

const COLORS = {
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  textMuted: '#9C9A94',
  border: '#E2E0DB',
  background: '#FDFCFA',
};

export default function StageProgressChart({
  stages = {},
  orientation = 'horizontal', // 'horizontal' | 'vertical' | 'funnel'
  showLabels = true,
  showPercentages = true,
  compact = false,
  onStageClick,
  activeStage,
}) {
  // Ordered stages for the funnel
  const stageOrder = ['idea', 'explore', 'assess', 'case', 'approval'];

  // Prepare chart data
  const chartData = useMemo(() => {
    const total = stageOrder.reduce((sum, stage) => sum + (stages[stage] || 0), 0);

    return stageOrder.map((stage, index) => ({
      name: STAGE_NAMES[stage],
      key: stage,
      value: stages[stage] || 0,
      color: STAGE_COLORS[stage],
      percentage: total > 0 ? Math.round((stages[stage] || 0) / total * 100) : 0,
      isActive: activeStage === stage,
      order: index,
    }));
  }, [stages, activeStage]);

  // Total count
  const totalCount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Conversion rates between stages
  const conversionRates = useMemo(() => {
    return stageOrder.slice(1).map((stage, index) => {
      const prevStage = stageOrder[index];
      const prevCount = stages[prevStage] || 0;
      const currCount = stages[stage] || 0;
      return {
        from: prevStage,
        to: stage,
        rate: prevCount > 0 ? Math.round((currCount / prevCount) * 100) : 0,
      };
    });
  }, [stages]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="stage-chart-tooltip">
        <div className="tooltip-header" style={{ color: data.color }}>
          {data.name}
        </div>
        <div className="tooltip-value">{data.value} product ideas</div>
        <div className="tooltip-percentage">{data.percentage}% of total</div>
      </div>
    );
  };

  // Render horizontal bar chart
  const renderHorizontalChart = () => (
    <ResponsiveContainer width="100%" height={compact ? 60 : 100}>
      <BarChart
        data={chartData}
        layout="horizontal"
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <XAxis
          dataKey="name"
          tick={{ fill: COLORS.text, fontSize: compact ? 10 : 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71, 69, 63, 0.05)' }} />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          onClick={(data) => onStageClick?.(data.key)}
          style={{ cursor: onStageClick ? 'pointer' : 'default' }}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.key}
              fill={entry.color}
              opacity={entry.isActive ? 1 : 0.8}
              stroke={entry.isActive ? COLORS.text : 'none'}
              strokeWidth={entry.isActive ? 2 : 0}
            />
          ))}
          {showLabels && (
            <LabelList
              dataKey="value"
              position="top"
              fill={COLORS.text}
              fontSize={compact ? 10 : 12}
              fontWeight={600}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  // Render vertical funnel-style visualization
  const renderFunnel = () => (
    <div className="stage-funnel">
      {chartData.map((stage, index) => {
        const widthPercent = 100 - (index * 10); // Decreasing width for funnel effect
        return (
          <div
            key={stage.key}
            className={`funnel-stage ${stage.isActive ? 'active' : ''}`}
            onClick={() => onStageClick?.(stage.key)}
            style={{
              '--stage-color': stage.color,
              '--stage-width': `${widthPercent}%`,
            }}
          >
            <div className="funnel-bar" style={{ width: `${widthPercent}%` }}>
              <span className="funnel-name">{stage.name}</span>
              <span className="funnel-value">{stage.value}</span>
              {showPercentages && (
                <span className="funnel-percentage">{stage.percentage}%</span>
              )}
            </div>
            {index < chartData.length - 1 && conversionRates[index] && (
              <div className="funnel-conversion">
                <span className="conversion-arrow">↓</span>
                <span className="conversion-rate">{conversionRates[index].rate}%</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Render pill-style progress (for compact inline display)
  const renderPills = () => (
    <div className="stage-pills">
      {chartData.map((stage) => (
        <button
          key={stage.key}
          className={`stage-pill ${stage.isActive ? 'active' : ''}`}
          onClick={() => onStageClick?.(stage.key)}
          style={{ '--pill-color': stage.color }}
        >
          <span className="pill-count">{stage.value}</span>
          <span className="pill-name">{stage.name}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className={`stage-progress-chart ${compact ? 'compact' : ''}`}>
      {!compact && (
        <div className="chart-header">
          <h4>Pipeline Progress</h4>
          <span className="total-count">{totalCount} total</span>
        </div>
      )}

      {orientation === 'funnel' ? renderFunnel() :
       orientation === 'pills' ? renderPills() :
       renderHorizontalChart()}

      {/* Approved/Declined summary (outside main funnel) */}
      {!compact && (stages.approved || stages.declined) && (
        <div className="outcome-summary">
          {stages.approved > 0 && (
            <div className="outcome-item approved">
              <span className="outcome-value">{stages.approved}</span>
              <span className="outcome-label">Approved</span>
            </div>
          )}
          {stages.declined > 0 && (
            <div className="outcome-item declined">
              <span className="outcome-value">{stages.declined}</span>
              <span className="outcome-label">Declined</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
