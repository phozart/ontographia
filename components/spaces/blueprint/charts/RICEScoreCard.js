// components/spaces/blueprint/charts/RICEScoreCard.js
// Visual RICE (Reach, Impact, Confidence, Effort) breakdown

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';

// Ontographia Design System colors
const COLORS = {
  reach: '#47453F',
  impact: '#5B8A6A',
  confidence: '#6B6861',
  effort: '#C9A227',
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  textMuted: '#9C9A94',
  border: '#E2E0DB',
  background: '#FDFCFA',
  success: '#5B8A6A',
  warning: '#C9A227',
  danger: '#A54D4D',
};

export default function RICEScoreCard({
  reach = 0,
  impact = 0,
  confidence = 0,
  effort = 0,
  rationale,
  compact = false,
  showFormula = true,
  showBreakdown = true,
}) {
  // Calculate RICE score: (Reach * Impact * Confidence) / Effort
  const riceScore = useMemo(() => {
    if (effort === 0) return 0;
    return Math.round((reach * impact * (confidence / 100)) / effort);
  }, [reach, impact, confidence, effort]);

  // Factor data for visualization
  const factorData = useMemo(() => [
    {
      name: 'Reach',
      value: reach,
      displayValue: reach.toLocaleString(),
      unit: 'users/qtr',
      description: 'How many people will this impact per quarter?',
      normalizedValue: Math.min(reach / 10000, 1) * 100, // Normalize for display
      color: COLORS.reach,
    },
    {
      name: 'Impact',
      value: impact,
      displayValue: `${impact}/3`,
      unit: 'score',
      description: '3 = massive, 2 = high, 1 = medium, 0.5 = low, 0.25 = minimal',
      normalizedValue: (impact / 3) * 100,
      color: COLORS.impact,
    },
    {
      name: 'Confidence',
      value: confidence,
      displayValue: `${confidence}%`,
      unit: 'percentage',
      description: 'How confident are we in these estimates?',
      normalizedValue: confidence,
      color: COLORS.confidence,
    },
    {
      name: 'Effort',
      value: effort,
      displayValue: `${effort}`,
      unit: 'person-months',
      description: 'Total effort in person-months',
      normalizedValue: Math.min(effort / 12, 1) * 100, // Normalize for display (12 months = max)
      color: COLORS.effort,
      inverse: true, // Lower is better for effort
    },
  ], [reach, impact, confidence, effort]);

  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 1000) return COLORS.success;
    if (score >= 500) return COLORS.text;
    if (score >= 200) return COLORS.warning;
    return COLORS.danger;
  };

  // Get score tier
  const getScoreTier = (score) => {
    if (score >= 1000) return { tier: 'High Priority', class: 'tier-high' };
    if (score >= 500) return { tier: 'Medium Priority', class: 'tier-medium' };
    if (score >= 200) return { tier: 'Low Priority', class: 'tier-low' };
    return { tier: 'Consider Dropping', class: 'tier-drop' };
  };

  const scoreTier = getScoreTier(riceScore);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rice-tooltip">
        <div className="tooltip-header">{data.name}</div>
        <div className="tooltip-value">{data.displayValue}</div>
        <div className="tooltip-description">{data.description}</div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="rice-scorecard rice-scorecard--compact">
        <div className="rice-score-compact">
          <span className="score-value" style={{ color: getScoreColor(riceScore) }}>
            {riceScore.toLocaleString()}
          </span>
          <span className="score-label">RICE Score</span>
        </div>
        <div className="rice-factors-compact">
          <span>R:{reach.toLocaleString()}</span>
          <span>I:{impact}</span>
          <span>C:{confidence}%</span>
          <span>E:{effort}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rice-scorecard">
      {/* Main Score Display */}
      <div className="rice-main-score">
        <div className="score-circle" style={{ borderColor: getScoreColor(riceScore) }}>
          <span className="score-value" style={{ color: getScoreColor(riceScore) }}>
            {riceScore.toLocaleString()}
          </span>
          <span className="score-label">RICE</span>
        </div>
        <div className={`score-tier ${scoreTier.class}`}>
          {scoreTier.tier}
        </div>
      </div>

      {/* Formula Display */}
      {showFormula && (
        <div className="rice-formula">
          <span className="formula-item">
            <span className="formula-value">{reach.toLocaleString()}</span>
            <span className="formula-label">Reach</span>
          </span>
          <span className="formula-operator">&times;</span>
          <span className="formula-item">
            <span className="formula-value">{impact}</span>
            <span className="formula-label">Impact</span>
          </span>
          <span className="formula-operator">&times;</span>
          <span className="formula-item">
            <span className="formula-value">{confidence}%</span>
            <span className="formula-label">Confidence</span>
          </span>
          <span className="formula-operator">&divide;</span>
          <span className="formula-item">
            <span className="formula-value">{effort}</span>
            <span className="formula-label">Effort</span>
          </span>
        </div>
      )}

      {/* Factor Breakdown */}
      {showBreakdown && (
        <div className="rice-breakdown">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={factorData}
              layout="vertical"
              margin={{ top: 5, right: 50, left: 70, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                hide
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: COLORS.text, fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                width={65}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar
                dataKey="normalizedValue"
                radius={[0, 4, 4, 0]}
                barSize={16}
              >
                {factorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="factor-values">
            {factorData.map((factor) => (
              <div key={factor.name} className="factor-value-item">
                <span
                  className="factor-indicator"
                  style={{ backgroundColor: factor.color }}
                />
                <span className="factor-display-value">{factor.displayValue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rationale */}
      {rationale && (
        <div className="rice-rationale">
          <span className="rationale-label">Rationale</span>
          <p>{rationale}</p>
        </div>
      )}
    </div>
  );
}
