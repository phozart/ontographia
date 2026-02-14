// components/dwd/shared/QuickStartCard.js
// Reusable empty state / quick start card for DWD views

// MUI Icons
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * QuickStartCard - Empty state card with guided steps and action buttons
 *
 * @param {Object} props
 * @param {Object} props.quickStart - QuickStart config from guidance (lib/dwd-guidance.js)
 * @param {Function} props.onCreate - Handler for creating artefacts (receives type)
 * @param {Function} props.onOpenWizard - Optional handler for opening wizard
 * @param {React.ElementType} props.icon - Optional custom icon component
 * @param {boolean} props.showVolatilityGuide - Show volatility guide (for WorkLandscape)
 */
export default function QuickStartCard({
  quickStart,
  onCreate,
  onOpenWizard,
  icon: IconComponent,
  showVolatilityGuide = false,
}) {
  if (!quickStart) return null;

  const Icon = IconComponent || TipsAndUpdatesIcon;

  return (
    <div className="dwd-quickstart">
      <div className="dwd-quickstart__header">
        <Icon />
        <h3>{quickStart.title}</h3>
      </div>

      {quickStart.description && (
        <p className="dwd-quickstart__description">
          {quickStart.description}
        </p>
      )}

      {/* Steps flow */}
      {quickStart.steps && quickStart.steps.length > 0 && (
        <div className="dwd-quickstart__flow">
          {quickStart.steps.map((step, i) => (
            <div key={i} className="dwd-quickstart__step-wrapper">
              <div className="dwd-quickstart__step">
                <span className="dwd-quickstart__step-num">{i + 1}</span>
                <span>{step}</span>
              </div>
              {i < quickStart.steps.length - 1 && (
                <ArrowForwardIcon className="dwd-quickstart__arrow" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Volatility guide (optional, for WorkLandscape) */}
      {showVolatilityGuide && quickStart.volatilityGuide && (
        <div className="dwd-quickstart__volatility-hint">
          <h4>Quick Volatility Assessment:</h4>
          <div className="dwd-quickstart__volatility-guide">
            {quickStart.volatilityGuide.map((level, i) => {
              const LevelIcon = level.level.includes('High') ? SpeedIcon :
                               level.level.includes('Medium') ? TrendingUpIcon : TrendingDownIcon;
              return (
                <div key={i} className="dwd-quickstart__vol-level" style={{ borderColor: level.color }}>
                  <LevelIcon style={{ color: level.color }} />
                  <div>
                    <strong style={{ color: level.color }}>{level.level}</strong>
                    <span>{level.hint}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="dwd-quickstart__actions">
        {quickStart.primaryAction && (
          <button
            className="btn btn--primary"
            onClick={() => onCreate?.(quickStart.primaryAction.type)}
          >
            <AddIcon fontSize="small" />
            {quickStart.primaryAction.label}
          </button>
        )}

        {onOpenWizard && (
          <button
            className="btn btn--secondary"
            onClick={onOpenWizard}
          >
            Use Wizard
          </button>
        )}
      </div>
    </div>
  );
}
