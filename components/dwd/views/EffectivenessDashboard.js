// components/dwd/views/EffectivenessDashboard.js
// Effectiveness dashboard showing adjustment success metrics and insights

import { useMemo } from 'react';
import { useDWD } from '../DWDContext';
import { ViewHeader, Button } from '../../ui';

// MUI Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScienceIcon from '@mui/icons-material/Science';
import SchoolIcon from '@mui/icons-material/School';
import TimerIcon from '@mui/icons-material/Timer';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SpeedIcon from '@mui/icons-material/Speed';

import { DWD_PRINCIPLES } from '../../../lib/dwd-principles';

export default function EffectivenessDashboard({ onNavigate }) {
  const { stats, adjustments, learnings, signals } = useDWD();

  const effectiveness = stats?.effectiveness || {};

  // Calculate additional insights
  const insights = useMemo(() => {
    const result = [];

    // Check adoption rate
    if (effectiveness.adoptionRate >= 0.7) {
      result.push({
        type: 'success',
        message: `Strong adoption rate (${Math.round(effectiveness.adoptionRate * 100)}%) - your adjustments are working well`,
        icon: <CheckCircleIcon />,
      });
    } else if (effectiveness.adoptionRate > 0 && effectiveness.adoptionRate < 0.5) {
      result.push({
        type: 'warning',
        message: `Low adoption rate (${Math.round(effectiveness.adoptionRate * 100)}%) - consider smaller, more reversible changes`,
        icon: <WarningIcon />,
      });
    }

    // Check learning capture
    if (effectiveness.learningCaptureRate < 0.5 && effectiveness.completedAdjustments > 2) {
      result.push({
        type: 'warning',
        message: 'Low learning capture - document insights from completed experiments',
        icon: <LightbulbIcon />,
      });
    }

    // Check signal trend
    if (effectiveness.signalTrend > 0.2) {
      result.push({
        type: 'warning',
        message: `Signals increasing (${Math.round(effectiveness.signalTrend * 100)}%) - more issues being identified`,
        icon: <TrendingUpIcon />,
      });
    } else if (effectiveness.signalTrend < -0.2) {
      result.push({
        type: 'success',
        message: `Signals decreasing (${Math.round(Math.abs(effectiveness.signalTrend) * 100)}%) - improvements are working`,
        icon: <TrendingDownIcon />,
      });
    }

    // Check experiments in progress
    if (effectiveness.experimentsInProgress > 5) {
      result.push({
        type: 'info',
        message: `${effectiveness.experimentsInProgress} experiments in progress - consider completing some before starting more`,
        icon: <ScienceIcon />,
      });
    }

    return result;
  }, [effectiveness]);

  // Adjustments by status for visual breakdown
  const adjustmentBreakdown = useMemo(() => {
    const byStatus = stats?.adjustments?.byStatus || {};
    return {
      proposed: byStatus.proposed || 0,
      trying: byStatus.trying || 0,
      adopted: byStatus.adopted || 0,
      reverted: byStatus.reverted || 0,
    };
  }, [stats]);

  const totalAdjustments = adjustmentBreakdown.proposed + adjustmentBreakdown.trying +
    adjustmentBreakdown.adopted + adjustmentBreakdown.reverted;

  return (
    <div className="dwd-effectiveness">
      {/* Header */}
      <ViewHeader
        icon={SpeedIcon}
        iconColor="#10b981"
        title="Effectiveness Dashboard"
        description="Track how well your work design adjustments are performing"
      />

      {/* Key Metrics */}
      <div className="dwd-effectiveness__metrics">
        <div className="dwd-metric-card dwd-metric--primary">
          <div className="dwd-metric-card__icon">
            <CheckCircleIcon />
          </div>
          <div className="dwd-metric-card__content">
            <span className="dwd-metric-card__value">
              {Math.round(effectiveness.adoptionRate * 100)}%
            </span>
            <span className="dwd-metric-card__label">Adoption Rate</span>
            <span className="dwd-metric-card__sublabel">
              Adjustments that stuck
            </span>
          </div>
        </div>

        <div className="dwd-metric-card dwd-metric--secondary">
          <div className="dwd-metric-card__icon">
            <CancelIcon />
          </div>
          <div className="dwd-metric-card__content">
            <span className="dwd-metric-card__value">
              {Math.round(effectiveness.revertRate * 100)}%
            </span>
            <span className="dwd-metric-card__label">Revert Rate</span>
            <span className="dwd-metric-card__sublabel">
              Adjustments rolled back
            </span>
          </div>
        </div>

        <div className="dwd-metric-card">
          <div className="dwd-metric-card__icon">
            <LightbulbIcon />
          </div>
          <div className="dwd-metric-card__content">
            <span className="dwd-metric-card__value">
              {Math.round(effectiveness.learningCaptureRate * 100)}%
            </span>
            <span className="dwd-metric-card__label">Learning Capture</span>
            <span className="dwd-metric-card__sublabel">
              Learnings per adjustment
            </span>
          </div>
        </div>

        <div className="dwd-metric-card">
          <div className="dwd-metric-card__icon">
            <TimerIcon />
          </div>
          <div className="dwd-metric-card__content">
            <span className="dwd-metric-card__value">
              {effectiveness.avgDaysToAdoption || '-'}
            </span>
            <span className="dwd-metric-card__label">Avg Days to Adopt</span>
            <span className="dwd-metric-card__sublabel">
              Time to validate
            </span>
          </div>
        </div>
      </div>

      {/* Adjustment Pipeline */}
      <div className="dwd-effectiveness__pipeline">
        <h3>Adjustment Pipeline</h3>
        <div className="dwd-pipeline">
          <div
            className="dwd-pipeline__stage dwd-pipeline--proposed"
            style={{ flex: adjustmentBreakdown.proposed || 0.1 }}
          >
            <span className="dwd-pipeline__count">{adjustmentBreakdown.proposed}</span>
            <span className="dwd-pipeline__label">Proposed</span>
          </div>
          <div
            className="dwd-pipeline__stage dwd-pipeline--trying"
            style={{ flex: adjustmentBreakdown.trying || 0.1 }}
          >
            <span className="dwd-pipeline__count">{adjustmentBreakdown.trying}</span>
            <span className="dwd-pipeline__label">Trying</span>
          </div>
          <div
            className="dwd-pipeline__stage dwd-pipeline--adopted"
            style={{ flex: adjustmentBreakdown.adopted || 0.1 }}
          >
            <span className="dwd-pipeline__count">{adjustmentBreakdown.adopted}</span>
            <span className="dwd-pipeline__label">Adopted</span>
          </div>
          <div
            className="dwd-pipeline__stage dwd-pipeline--reverted"
            style={{ flex: adjustmentBreakdown.reverted || 0.1 }}
          >
            <span className="dwd-pipeline__count">{adjustmentBreakdown.reverted}</span>
            <span className="dwd-pipeline__label">Reverted</span>
          </div>
        </div>
      </div>

      {/* Signal Trend */}
      <div className="dwd-effectiveness__trend">
        <h3>Signal Trend (30 days)</h3>
        <div className={`dwd-trend ${effectiveness.signalTrend > 0 ? 'dwd-trend--up' : 'dwd-trend--down'}`}>
          {effectiveness.signalTrend > 0 ? (
            <TrendingUpIcon className="dwd-trend__icon" />
          ) : (
            <TrendingDownIcon className="dwd-trend__icon" />
          )}
          <span className="dwd-trend__value">
            {effectiveness.signalTrend > 0 ? '+' : ''}
            {Math.round(effectiveness.signalTrend * 100)}%
          </span>
          <span className="dwd-trend__label">
            {effectiveness.signalTrend > 0 ? 'More signals' : 'Fewer signals'} vs previous 30 days
          </span>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="dwd-effectiveness__insights">
          <h3>Insights</h3>
          <div className="dwd-insights-list">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`dwd-insight dwd-insight--${insight.type}`}
              >
                {insight.icon}
                <span>{insight.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DWD Principles Quick Reference */}
      <div className="dwd-effectiveness__principles">
        <h3>
          <SchoolIcon />
          DWD Principles Reference
        </h3>
        <div className="dwd-principles-quick">
          {DWD_PRINCIPLES.map(p => (
            <div
              key={p.id}
              className="dwd-principle-quick"
              style={{ borderLeftColor: p.color }}
            >
              <span className="dwd-principle-quick__num" style={{ background: p.color }}>
                {p.number}
              </span>
              <span className="dwd-principle-quick__name">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dwd-effectiveness__actions">
        <Button variant="secondary" onClick={() => onNavigate?.('adjustments')}>
          View All Adjustments
        </Button>
        <Button variant="secondary" onClick={() => onNavigate?.('learnings')}>
          Capture Learnings
        </Button>
      </div>
    </div>
  );
}
