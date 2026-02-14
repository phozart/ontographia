/**
 * CapGuidancePanel - Contextual guidance for Capability Studio
 *
 * Displays tips, learning content, and progress indicators
 * based on current module and workspace state.
 *
 * @component
 * @module components/cap/CapGuidancePanel
 */

import { useMemo } from 'react';
import { CAP_GUIDANCE, CAP_MATURITY_LEVELS } from '../../../lib/cap-types';

// Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

/**
 * Progress indicator component
 */
function ProgressIndicator({ label, value, max, color }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="cap-progress-item">
      <div className="cap-progress-header">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="cap-progress-bar">
        <div
          className="cap-progress-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>

      <style jsx>{`
        .cap-progress-item {
          margin-bottom: 12px;
        }

        .cap-progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 0.75rem;
          color: var(--text-secondary, #6b7280);
        }

        .cap-progress-bar {
          height: 6px;
          background: var(--bg-tertiary, #e5e7eb);
          border-radius: 3px;
          overflow: hidden;
        }

        .cap-progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
}

/**
 * CapGuidancePanel Component
 */
export default function CapGuidancePanel({ module, stats, artefactCount }) {
  // Calculate recommendations based on stats
  const recommendations = useMemo(() => {
    const items = [];

    if (!stats) return items;

    // No capabilities yet
    if (stats.capabilities?.total === 0) {
      items.push({
        type: 'info',
        icon: LightbulbIcon,
        message: 'Start by identifying your organization\'s key capabilities. Think about what your organization needs to be good at to deliver value.',
      });
    }

    // Low maturity average
    if (stats.health?.maturity?.averageMaturity < 2.5 && stats.capabilities?.total > 0) {
      items.push({
        type: 'warning',
        icon: TrendingUpIcon,
        message: `Average maturity is ${stats.health.maturity.averageMaturity.toFixed(1)}. Consider prioritizing capability development investments.`,
      });
    }

    // Unassessed capabilities
    if (stats.health?.maturity?.unassessedCount > 0) {
      items.push({
        type: 'info',
        icon: WarningIcon,
        message: `${stats.health.maturity.unassessedCount} capabilities haven't been assessed yet. Complete assessments to understand your capability landscape.`,
      });
    }

    // Many critical gaps
    if (stats.gaps?.bySeverity?.critical > 0) {
      items.push({
        type: 'warning',
        icon: WarningIcon,
        message: `${stats.gaps.bySeverity.critical} critical gaps identified. These should be addressed with priority initiatives.`,
      });
    }

    // No initiatives
    if (stats.initiatives === 0 && stats.gaps?.total > 0) {
      items.push({
        type: 'info',
        icon: LightbulbIcon,
        message: 'You have identified gaps but no initiatives. Create initiatives to address capability gaps.',
      });
    }

    // Good progress
    if (stats.health?.overall >= 70) {
      items.push({
        type: 'success',
        icon: CheckCircleIcon,
        message: 'Great progress! Your capability model is well-developed.',
      });
    }

    return items;
  }, [stats]);

  // Get module-specific guidance
  const moduleGuidance = useMemo(() => {
    switch (module?.id) {
      case 'capabilities':
        return CAP_GUIDANCE.capability_vs_process;
      case 'assessment':
        return CAP_GUIDANCE.maturity_assessment;
      case 'operating_model':
        return CAP_GUIDANCE.capability_vs_function;
      default:
        return CAP_GUIDANCE.getting_started;
    }
  }, [module?.id]);

  return (
    <div className="cap-guidance-panel">
      {/* Header */}
      <div className="cap-guidance-header">
        <SchoolIcon fontSize="small" />
        <span>Guidance</span>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="cap-guidance-section">
          <h4>Progress</h4>
          <ProgressIndicator
            label="Capabilities"
            value={stats.capabilities?.total || 0}
            max={Math.max(10, stats.capabilities?.total || 0)}
            color="#6366f1"
          />
          <ProgressIndicator
            label="Assessed"
            value={stats.health?.maturity?.assessedCount || 0}
            max={stats.capabilities?.total || 1}
            color="#22c55e"
          />
          <ProgressIndicator
            label="Gaps Addressed"
            value={stats.initiatives || 0}
            max={Math.max(stats.gaps?.total || 0, 1)}
            color="#f59e0b"
          />

          {stats.health && (
            <div className="cap-health-score">
              <span className="cap-health-label">Overall Health</span>
              <span className={`cap-health-value ${stats.health.overall >= 60 ? 'good' : 'attention'}`}>
                {stats.health.overall}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="cap-guidance-section">
          <h4>Recommendations</h4>
          {recommendations.map((rec, i) => {
            const Icon = rec.icon;
            return (
              <div key={i} className={`cap-recommendation ${rec.type}`}>
                <Icon fontSize="small" />
                <p>{rec.message}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Learning Content */}
      {moduleGuidance && (
        <div className="cap-guidance-section">
          <h4>{moduleGuidance.title}</h4>
          <div className="cap-learning-content">
            {moduleGuidance.content.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      {/* Maturity Reference */}
      <div className="cap-guidance-section">
        <h4>Maturity Levels</h4>
        <div className="cap-maturity-ref">
          {CAP_MATURITY_LEVELS.map(level => (
            <div key={level.id} className="cap-maturity-item">
              <span
                className="cap-maturity-dot"
                style={{ backgroundColor: level.color }}
              />
              <span className="cap-maturity-label">{level.label}</span>
              <span className="cap-maturity-desc">{level.description}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .cap-guidance-panel {
          width: 320px;
          border-left: 1px solid var(--border-color, #e5e7eb);
          background: var(--bg-secondary, #f9fafb);
          overflow-y: auto;
        }

        .cap-guidance-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px;
          border-bottom: 1px solid var(--border-color, #e5e7eb);
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .cap-guidance-section {
          padding: 16px;
          border-bottom: 1px solid var(--border-color, #e5e7eb);
        }

        .cap-guidance-section h4 {
          margin: 0 0 12px 0;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cap-health-score {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color, #e5e7eb);
        }

        .cap-health-label {
          font-size: 0.8125rem;
          color: var(--text-secondary, #6b7280);
        }

        .cap-health-value {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .cap-health-value.good {
          color: #22c55e;
        }

        .cap-health-value.attention {
          color: #f59e0b;
        }

        .cap-recommendation {
          display: flex;
          gap: 10px;
          padding: 10px;
          margin-bottom: 8px;
          border-radius: 6px;
          font-size: 0.8125rem;
          line-height: 1.4;
        }

        .cap-recommendation p {
          margin: 0;
        }

        .cap-recommendation.info {
          background: #eff6ff;
          color: #1e40af;
        }

        .cap-recommendation.warning {
          background: #fffbeb;
          color: #92400e;
        }

        .cap-recommendation.success {
          background: #f0fdf4;
          color: #166534;
        }

        .cap-learning-content {
          font-size: 0.8125rem;
          color: var(--text-secondary, #6b7280);
          line-height: 1.5;
        }

        .cap-learning-content p {
          margin: 0 0 12px 0;
        }

        .cap-learning-content p:last-child {
          margin-bottom: 0;
        }

        .cap-maturity-ref {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cap-maturity-item {
          display: grid;
          grid-template-columns: 12px 80px 1fr;
          gap: 8px;
          align-items: center;
          font-size: 0.75rem;
        }

        .cap-maturity-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .cap-maturity-label {
          font-weight: 500;
          color: var(--text-primary, #111827);
        }

        .cap-maturity-desc {
          color: var(--text-secondary, #6b7280);
        }
      `}</style>
    </div>
  );
}
