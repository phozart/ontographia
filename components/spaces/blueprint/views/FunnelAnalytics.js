// components/spaces/blueprint/views/FunnelAnalytics.js
// Funnel conversion analytics with zombie detection

import { useMemo } from 'react';
import {
  useBlueprint,
  BPS_STAGE_INFO,
  BPS_STAGE_SLAS,
  formatPercentage,
  calculateFunnelMetrics,
} from '../BlueprintContext';

// MUI Icons
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Ontographia Design System colors
const COLORS = {
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  muted: '#9C9A94',
  border: '#E2E0DB',
  canvas: '#FDFCFA',
  panel: '#F0EFEC',
  primary: '#47453F',
  success: '#5B8A6A',
  warning: '#C9A227',
  danger: '#A54D4D',
};

const STAGES = ['idea', 'explore', 'assess', 'case', 'approved'];

export default function FunnelAnalytics({ onNavigate }) {
  const { initiatives, funnelMetrics } = useBlueprint();

  // Stage counts for funnel visualization
  const stageCounts = useMemo(() => {
    const counts = {};
    STAGES.forEach((stage) => {
      counts[stage] = initiatives.filter((i) => i.status === stage).length;
    });
    return counts;
  }, [initiatives]);

  // Calculate conversion rates between stages
  const conversionData = useMemo(() => {
    const result = [];
    for (let i = 0; i < STAGES.length - 1; i++) {
      const fromStage = STAGES[i];
      const toStage = STAGES[i + 1];

      // Count initiatives that have passed through each stage
      const fromCount = initiatives.filter((init) => {
        const history = init.governance?.stage_history || [];
        return init.status === fromStage || history.some((h) => h.stage === fromStage);
      }).length;

      const toCount = initiatives.filter((init) => {
        const history = init.governance?.stage_history || [];
        return init.status === toStage || history.some((h) => h.stage === toStage);
      }).length;

      const rate = fromCount > 0 ? (toCount / fromCount) * 100 : 0;

      // Average time to transition (in days)
      const transitionTimes = initiatives
        .filter((init) => {
          const history = init.governance?.stage_history || [];
          return history.some((h) => h.stage === fromStage) && history.some((h) => h.stage === toStage);
        })
        .map((init) => {
          const history = init.governance?.stage_history || [];
          const fromEntry = history.find((h) => h.stage === fromStage);
          const toEntry = history.find((h) => h.stage === toStage);
          if (fromEntry?.entered && toEntry?.entered) {
            return (new Date(toEntry.entered) - new Date(fromEntry.entered)) / (1000 * 60 * 60 * 24);
          }
          return null;
        })
        .filter((t) => t != null);

      const avgTime =
        transitionTimes.length > 0
          ? transitionTimes.reduce((sum, t) => sum + t, 0) / transitionTimes.length
          : null;

      result.push({
        from: fromStage,
        to: toStage,
        fromName: BPS_STAGE_INFO[fromStage]?.name || fromStage,
        toName: BPS_STAGE_INFO[toStage]?.name || toStage,
        fromCount,
        toCount,
        rate: Math.round(rate * 10) / 10,
        avgDays: avgTime != null ? Math.round(avgTime * 10) / 10 : null,
      });
    }
    return result;
  }, [initiatives]);

  // Zombie detector: initiatives in same stage for >2x SLA target
  const zombies = useMemo(() => {
    const now = new Date();
    return initiatives
      .filter((init) => {
        const stage = init.status;
        const sla = BPS_STAGE_SLAS[stage];
        if (!sla) return false;

        const slaDays = sla.hours / 24;
        const threshold = slaDays * 2;

        // Find when the initiative entered the current stage
        const history = init.governance?.stage_history || [];
        const currentEntry = history.find((h) => h.stage === stage && !h.exited);
        if (!currentEntry?.entered) return false;

        const daysInStage = (now - new Date(currentEntry.entered)) / (1000 * 60 * 60 * 24);
        return daysInStage > threshold;
      })
      .map((init) => {
        const stage = init.status;
        const sla = BPS_STAGE_SLAS[stage];
        const slaDays = sla.hours / 24;
        const history = init.governance?.stage_history || [];
        const currentEntry = history.find((h) => h.stage === stage && !h.exited);
        const daysInStage = (now - new Date(currentEntry.entered)) / (1000 * 60 * 60 * 24);
        const overflowPct = Math.round(((daysInStage - slaDays) / slaDays) * 100);

        return {
          id: init.id,
          displayId: init.display_id,
          name: init.name,
          stage,
          stageName: BPS_STAGE_INFO[stage]?.name || stage,
          daysInStage: Math.round(daysInStage * 10) / 10,
          slaTarget: slaDays,
          overflowPct,
        };
      })
      .sort((a, b) => b.overflowPct - a.overflowPct);
  }, [initiatives]);

  // SVG funnel dimensions
  const funnelViewWidth = 700;
  const funnelViewHeight = 160;
  const funnelMargin = { top: 12, right: 20, bottom: 12, left: 20 };
  const funnelContentWidth = funnelViewWidth - funnelMargin.left - funnelMargin.right;
  const funnelContentHeight = funnelViewHeight - funnelMargin.top - funnelMargin.bottom;

  // Maximum count for scaling widths
  const maxCount = useMemo(() => {
    return Math.max(...Object.values(stageCounts), 1);
  }, [stageCounts]);

  // Build funnel trapezoid shapes
  const funnelShapes = useMemo(() => {
    const stageWidth = funnelContentWidth / (STAGES.length * 2 - 1);
    const shapes = [];

    STAGES.forEach((stage, i) => {
      const count = stageCounts[stage] || 0;
      const heightRatio = maxCount > 0 ? Math.max(count / maxCount, 0.15) : 0.15;
      const nextCount = i < STAGES.length - 1 ? stageCounts[STAGES[i + 1]] || 0 : count;
      const nextHeightRatio = maxCount > 0 ? Math.max(nextCount / maxCount, 0.15) : 0.15;

      const x = i * stageWidth * 2;
      const barWidth = stageWidth;

      const topY = (funnelContentHeight * (1 - heightRatio)) / 2;
      const bottomY = funnelContentHeight - topY;

      // If not last stage, draw the connecting trapezoid to next stage
      if (i < STAGES.length - 1) {
        const nextTopY = (funnelContentHeight * (1 - nextHeightRatio)) / 2;
        const nextBottomY = funnelContentHeight - nextTopY;

        shapes.push({
          type: 'connector',
          key: `conn-${stage}`,
          points: [
            `${x + barWidth},${topY}`,
            `${x + barWidth * 2},${nextTopY}`,
            `${x + barWidth * 2},${nextBottomY}`,
            `${x + barWidth},${bottomY}`,
          ].join(' '),
          conversionIdx: i,
        });
      }

      shapes.push({
        type: 'stage',
        key: `stage-${stage}`,
        stage,
        x,
        topY,
        bottomY,
        width: barWidth,
        count,
        color: BPS_STAGE_INFO[stage]?.color || COLORS.primary,
        name: BPS_STAGE_INFO[stage]?.name || stage,
      });
    });

    return shapes;
  }, [stageCounts, maxCount, funnelContentWidth, funnelContentHeight]);

  return (
    <div className="funnel-analytics-view">
      {/* Header */}
      <div className="funnel-analytics-header">
        <div className="funnel-analytics-header-left">
          <FilterAltIcon style={{ color: COLORS.primary, fontSize: 28 }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 20, color: COLORS.text }}>
              Funnel Analytics
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary }}>
              Conversion rates, throughput, and zombie detection
            </p>
          </div>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div
        className="funnel-analytics-section"
        style={{
          background: COLORS.canvas,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 4,
          padding: '20px 16px',
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: COLORS.text }}>
          Stage Funnel
        </h2>

        <svg
          viewBox={`0 0 ${funnelViewWidth} ${funnelViewHeight}`}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Stage conversion funnel"
          style={{ display: 'block', maxWidth: '100%' }}
        >
          <g transform={`translate(${funnelMargin.left}, ${funnelMargin.top})`}>
            {funnelShapes.map((shape) => {
              if (shape.type === 'connector') {
                const conv = conversionData[shape.conversionIdx];
                return (
                  <g key={shape.key}>
                    <polygon
                      points={shape.points}
                      fill={COLORS.border}
                      opacity={0.4}
                    />
                    {conv && (
                      <text
                        x={
                          parseFloat(shape.points.split(' ')[0].split(',')[0]) +
                          (parseFloat(shape.points.split(' ')[1].split(',')[0]) -
                            parseFloat(shape.points.split(' ')[0].split(',')[0])) /
                            2
                        }
                        y={funnelContentHeight / 2 + 4}
                        textAnchor="middle"
                        fill={conv.rate >= 50 ? COLORS.success : conv.rate >= 25 ? COLORS.warning : COLORS.danger}
                        fontSize={10}
                        fontWeight={600}
                        fontFamily="inherit"
                      >
                        {formatPercentage(conv.rate, 0)}
                      </text>
                    )}
                  </g>
                );
              }

              // Stage bar
              return (
                <g
                  key={shape.key}
                  style={{ cursor: onNavigate ? 'pointer' : 'default' }}
                  onClick={() => onNavigate?.(shape.stage)}
                >
                  <rect
                    x={shape.x}
                    y={shape.topY}
                    width={shape.width}
                    height={shape.bottomY - shape.topY}
                    rx={4}
                    ry={4}
                    fill={shape.color}
                    opacity={0.85}
                  >
                    <title>
                      {shape.name}: {shape.count} initiatives
                    </title>
                  </rect>
                  {/* Count label */}
                  <text
                    x={shape.x + shape.width / 2}
                    y={(shape.topY + shape.bottomY) / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={COLORS.canvas}
                    fontSize={14}
                    fontWeight={700}
                    fontFamily="inherit"
                  >
                    {shape.count}
                  </text>
                  {/* Stage name below */}
                  <text
                    x={shape.x + shape.width / 2}
                    y={shape.bottomY + 14}
                    textAnchor="middle"
                    fill={COLORS.text}
                    fontSize={10}
                    fontWeight={500}
                    fontFamily="inherit"
                  >
                    {shape.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Conversion Rates Table */}
      <div
        className="funnel-analytics-section"
        style={{
          background: COLORS.canvas,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 4,
          padding: '20px 16px',
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: COLORS.text }}>
          Historical Conversion Rates
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderBottom: `2px solid ${COLORS.border}`,
                    color: COLORS.textSecondary,
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  Transition
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    padding: '8px 12px',
                    borderBottom: `2px solid ${COLORS.border}`,
                    color: COLORS.textSecondary,
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  From
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    padding: '8px 12px',
                    borderBottom: `2px solid ${COLORS.border}`,
                    color: COLORS.textSecondary,
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  To
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    padding: '8px 12px',
                    borderBottom: `2px solid ${COLORS.border}`,
                    color: COLORS.textSecondary,
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  Conversion Rate
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    padding: '8px 12px',
                    borderBottom: `2px solid ${COLORS.border}`,
                    color: COLORS.textSecondary,
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  Avg. Time
                </th>
              </tr>
            </thead>
            <tbody>
              {conversionData.map((conv) => (
                <tr key={`${conv.from}-${conv.to}`}>
                  <td
                    style={{
                      padding: '10px 12px',
                      borderBottom: `1px solid ${COLORS.border}`,
                      color: COLORS.text,
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          backgroundColor: BPS_STAGE_INFO[conv.from]?.color || COLORS.primary,
                        }}
                      />
                      {conv.fromName}
                      <ArrowForwardIcon style={{ fontSize: 14, color: COLORS.muted }} />
                      <span
                        style={{
                          display: 'inline-block',
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          backgroundColor: BPS_STAGE_INFO[conv.to]?.color || COLORS.primary,
                        }}
                      />
                      {conv.toName}
                    </span>
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '10px 12px',
                      borderBottom: `1px solid ${COLORS.border}`,
                      color: COLORS.textSecondary,
                    }}
                  >
                    {conv.fromCount}
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '10px 12px',
                      borderBottom: `1px solid ${COLORS.border}`,
                      color: COLORS.textSecondary,
                    }}
                  >
                    {conv.toCount}
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '10px 12px',
                      borderBottom: `1px solid ${COLORS.border}`,
                      fontWeight: 600,
                      color:
                        conv.rate >= 50
                          ? COLORS.success
                          : conv.rate >= 25
                          ? COLORS.warning
                          : COLORS.danger,
                    }}
                  >
                    {formatPercentage(conv.rate, 1)}
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '10px 12px',
                      borderBottom: `1px solid ${COLORS.border}`,
                      color: COLORS.textSecondary,
                    }}
                  >
                    {conv.avgDays != null ? `${conv.avgDays} days` : '-'}
                  </td>
                </tr>
              ))}
              {conversionData.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: 'center',
                      padding: '24px 12px',
                      color: COLORS.muted,
                    }}
                  >
                    No conversion data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zombie Detector */}
      <div
        className="funnel-analytics-section"
        style={{
          background: COLORS.canvas,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 4,
          padding: '20px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <WarningAmberIcon style={{ color: COLORS.danger, fontSize: 20 }} />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: COLORS.text }}>
            Zombie Detector
          </h2>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 12,
              color: COLORS.muted,
            }}
          >
            Initiatives stuck &gt;2x SLA target
          </span>
        </div>

        {zombies.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0',
              color: COLORS.muted,
              fontSize: 13,
            }}
          >
            No zombie initiatives detected. Pipeline is flowing.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderBottom: `2px solid ${COLORS.border}`,
                      color: COLORS.textSecondary,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    Initiative
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '8px 12px',
                      borderBottom: `2px solid ${COLORS.border}`,
                      color: COLORS.textSecondary,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    Stage
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '8px 12px',
                      borderBottom: `2px solid ${COLORS.border}`,
                      color: COLORS.textSecondary,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    Days in Stage
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '8px 12px',
                      borderBottom: `2px solid ${COLORS.border}`,
                      color: COLORS.textSecondary,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    SLA Target
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '8px 12px',
                      borderBottom: `2px solid ${COLORS.border}`,
                      color: COLORS.textSecondary,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    Overflow
                  </th>
                </tr>
              </thead>
              <tbody>
                {zombies.map((zombie) => (
                  <tr
                    key={zombie.id}
                    style={{
                      cursor: onNavigate ? 'pointer' : 'default',
                    }}
                    onClick={() => onNavigate?.(zombie.id)}
                  >
                    <td
                      style={{
                        padding: '10px 12px',
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontWeight: 500, color: COLORS.text }}>
                          {zombie.name}
                        </span>
                        {zombie.displayId && (
                          <span style={{ fontSize: 11, color: COLORS.muted }}>
                            {zombie.displayId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                        padding: '10px 12px',
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 500,
                          backgroundColor: BPS_STAGE_INFO[zombie.stage]?.color || COLORS.primary,
                          color: COLORS.canvas,
                        }}
                      >
                        {zombie.stageName}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                        padding: '10px 12px',
                        borderBottom: `1px solid ${COLORS.border}`,
                        fontWeight: 600,
                        color: COLORS.danger,
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <AccessTimeIcon style={{ fontSize: 14 }} />
                        {zombie.daysInStage} days
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                        padding: '10px 12px',
                        borderBottom: `1px solid ${COLORS.border}`,
                        color: COLORS.textSecondary,
                      }}
                    >
                      {zombie.slaTarget} days
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                        padding: '10px 12px',
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor:
                            zombie.overflowPct >= 200
                              ? COLORS.danger
                              : zombie.overflowPct >= 100
                              ? COLORS.warning
                              : COLORS.warning,
                          color: COLORS.canvas,
                        }}
                      >
                        +{zombie.overflowPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
