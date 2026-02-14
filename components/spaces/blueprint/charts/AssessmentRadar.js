// components/spaces/blueprint/charts/AssessmentRadar.js
// 5-dimension scoring radar chart with Ontographia Design System colors

import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// Ontographia Design System colors
const COLORS = {
  primary: '#47453F',
  primaryLight: 'rgba(71, 69, 63, 0.2)',
  success: '#5B8A6A',
  successLight: 'rgba(91, 138, 106, 0.2)',
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  textMuted: '#9C9A94',
  border: '#E2E0DB',
  background: '#FDFCFA',
};

// Default scoring dimensions
const DEFAULT_DIMENSIONS = [
  { key: 'strategic_fit', name: 'Strategic Fit', maxScore: 5 },
  { key: 'market_potential', name: 'Market Potential', maxScore: 5 },
  { key: 'feasibility', name: 'Feasibility', maxScore: 5 },
  { key: 'competitive_position', name: 'Competitive Position', maxScore: 5 },
  { key: 'risk_level', name: 'Risk Level', maxScore: 5 },
];

export default function AssessmentRadar({
  scoring = {},
  dimensions = DEFAULT_DIMENSIONS,
  showLabels = true,
  compact = false,
  fillOpacity = 0.3,
  strokeWidth = 2,
  showComparison = false,
  comparisonScoring = null,
  comparisonLabel = 'Comparison',
}) {
  // Prepare radar data
  const radarData = useMemo(() => {
    return dimensions.map((dim) => ({
      dimension: dim.name,
      key: dim.key,
      value: scoring[dim.key]?.score || 0,
      maxScore: dim.maxScore,
      rationale: scoring[dim.key]?.rationale || '',
      fullMark: dim.maxScore,
      ...(showComparison && comparisonScoring ? {
        comparison: comparisonScoring[dim.key]?.score || 0,
      } : {}),
    }));
  }, [scoring, dimensions, showComparison, comparisonScoring]);

  // Calculate overall score (weighted average)
  const overallScore = useMemo(() => {
    const total = dimensions.reduce((sum, dim) => {
      const score = scoring[dim.key]?.score || 0;
      return sum + (score / dim.maxScore) * 100;
    }, 0);
    return Math.round(total / dimensions.length);
  }, [scoring, dimensions]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="radar-tooltip">
        <div className="tooltip-header">{data.dimension}</div>
        <div className="tooltip-score">
          <span className="score-value">{data.value}</span>
          <span className="score-max">/ {data.maxScore}</span>
        </div>
        {showComparison && data.comparison !== undefined && (
          <div className="tooltip-comparison">
            {comparisonLabel}: {data.comparison} / {data.maxScore}
          </div>
        )}
        {data.rationale && (
          <div className="tooltip-rationale">{data.rationale}</div>
        )}
      </div>
    );
  };

  // Score interpretation
  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  const height = compact ? 200 : 300;

  return (
    <div className="assessment-radar">
      {!compact && (
        <div className="chart-header">
          <h4>Assessment Scores</h4>
          <div className={`overall-score ${getScoreClass(overallScore)}`}>
            <span className="score-value">{overallScore}%</span>
            <span className="score-label">Overall</span>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid
            stroke={COLORS.border}
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{
              fill: COLORS.text,
              fontSize: compact ? 10 : 12,
              fontWeight: 500,
            }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fill: COLORS.textMuted, fontSize: 10 }}
            axisLine={false}
            tickCount={6}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Comparison radar (if enabled) */}
          {showComparison && comparisonScoring && (
            <Radar
              name={comparisonLabel}
              dataKey="comparison"
              stroke={COLORS.textMuted}
              fill={COLORS.textMuted}
              fillOpacity={0.15}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          )}

          {/* Main radar */}
          <Radar
            name="Score"
            dataKey="value"
            stroke={COLORS.success}
            fill={COLORS.success}
            fillOpacity={fillOpacity}
            strokeWidth={strokeWidth}
            dot={{
              r: 4,
              fill: COLORS.success,
              stroke: COLORS.background,
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: COLORS.success,
              stroke: COLORS.background,
              strokeWidth: 2,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {showLabels && !compact && (
        <div className="dimension-scores">
          {radarData.map((item) => (
            <div key={item.key} className="dimension-item">
              <span className="dimension-name">{item.dimension}</span>
              <div className="dimension-bar">
                <div
                  className="dimension-fill"
                  style={{
                    width: `${(item.value / item.maxScore) * 100}%`,
                    backgroundColor: item.value >= 4 ? COLORS.success :
                                    item.value >= 3 ? COLORS.primary :
                                    '#C9A227',
                  }}
                />
              </div>
              <span className="dimension-value">{item.value}/{item.maxScore}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
