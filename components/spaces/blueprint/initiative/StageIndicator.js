// components/spaces/blueprint/initiative/StageIndicator.js
// Visual indicator for initiative stage progression

import { useMemo } from 'react';
import { BPS_STAGES, BPS_STAGE_INFO, getStageColor, isTerminalStage, getTrackStages } from '../BlueprintContext';

// MUI Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExploreIcon from '@mui/icons-material/Explore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const STAGE_ICONS = {
  idea: LightbulbIcon,
  explore: ExploreIcon,
  assess: AssessmentIcon,
  case: DescriptionIcon,
  approved: CheckCircleIcon,
  declined: CancelIcon,
};

export default function StageIndicator({
  currentStage,
  track,
  compact = false,
  showLabels = true,
  showConnectors = true,
  onClick,
  className = '',
}) {
  // Show track-appropriate progression stages (not declined)
  const progressionStages = useMemo(() => {
    if (track && track !== 'full') {
      // Get track-specific stages and add 'approved' as final
      const trackStages = getTrackStages(track);
      // Ensure 'approved' is at the end (tracks end with 'approval', approved is the outcome)
      return trackStages.includes('approved')
        ? trackStages
        : [...trackStages.filter(s => s !== 'approval'), 'approved'];
    }
    return ['idea', 'explore', 'assess', 'case', 'approved'];
  }, [track]);

  const currentIndex = progressionStages.indexOf(currentStage);
  const isDeclined = currentStage === 'declined';

  if (compact) {
    return (
      <div className={`stage-indicator-compact ${className}`}>
        <span
          className="stage-indicator-badge"
          style={{
            backgroundColor: `${getStageColor(currentStage)}15`,
            color: getStageColor(currentStage),
            borderColor: getStageColor(currentStage),
          }}
        >
          {BPS_STAGE_INFO[currentStage]?.name || currentStage}
        </span>
      </div>
    );
  }

  return (
    <div className={`stage-indicator ${className}`}>
      <div className="stage-indicator-track">
        {progressionStages.map((stage, index) => {
          const Icon = STAGE_ICONS[stage];
          const info = BPS_STAGE_INFO[stage];
          const isComplete = !isDeclined && index < currentIndex;
          const isCurrent = !isDeclined && index === currentIndex;
          const isDeclinedAtStage = isDeclined && index === currentIndex;
          const isPending = !isDeclined && index > currentIndex;

          return (
            <div
              key={stage}
              className={`stage-indicator-step ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''} ${isDeclinedAtStage ? 'declined' : ''}`}
              onClick={() => onClick?.(stage)}
              style={{ cursor: onClick ? 'pointer' : 'default' }}
            >
              {/* Connector line before (except first) */}
              {showConnectors && index > 0 && (
                <div
                  className={`stage-indicator-connector ${isComplete || isCurrent ? 'active' : ''}`}
                  style={isComplete || isCurrent ? { backgroundColor: getStageColor(stage) } : undefined}
                />
              )}

              {/* Stage circle */}
              <div
                className="stage-indicator-circle"
                style={{
                  backgroundColor: isComplete || isCurrent
                    ? getStageColor(stage)
                    : isDeclinedAtStage
                    ? getStageColor('declined')
                    : undefined,
                  borderColor: isComplete || isCurrent || isDeclinedAtStage
                    ? 'transparent'
                    : '#E2E0DB',
                }}
              >
                {Icon && (
                  <Icon
                    fontSize="small"
                    className="stage-indicator-icon"
                    style={{
                      color: isComplete || isCurrent
                        ? '#FDFCFA'
                        : isDeclinedAtStage
                        ? '#FDFCFA'
                        : '#9C9A94',
                    }}
                  />
                )}
              </div>

              {/* Stage label */}
              {showLabels && (
                <div
                  className="stage-indicator-label"
                  style={{
                    color: isCurrent
                      ? getStageColor(stage)
                      : isDeclinedAtStage
                      ? getStageColor('declined')
                      : isComplete
                      ? '#5C5A54'
                      : '#9C9A94',
                    fontWeight: isCurrent || isDeclinedAtStage ? 500 : 400,
                  }}
                >
                  {info?.name || stage}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Declined badge overlay */}
      {isDeclined && (
        <div className="stage-indicator-declined-badge">
          <CancelIcon fontSize="small" style={{ color: getStageColor('declined') }} />
          <span>Declined</span>
        </div>
      )}
    </div>
  );
}

// Minimal inline stage badge
export function StageBadge({ stage, size = 'medium' }) {
  const info = BPS_STAGE_INFO[stage];
  const color = getStageColor(stage);

  return (
    <span
      className={`stage-badge stage-badge--${size}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}40`,
      }}
    >
      {info?.name || stage}
    </span>
  );
}

// Progress percentage for an initiative
export function StageProgress({ currentStage, track }) {
  const stages = track && track !== 'full'
    ? [...getTrackStages(track).filter(s => s !== 'approval'), 'approved']
    : ['idea', 'explore', 'assess', 'case', 'approved'];
  const currentIndex = stages.indexOf(currentStage);
  const isDeclined = currentStage === 'declined';

  if (isDeclined) {
    return (
      <div className="stage-progress stage-progress--declined">
        <div className="stage-progress-bar" style={{ width: '0%' }} />
      </div>
    );
  }

  const progress = currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0;

  return (
    <div className="stage-progress">
      <div
        className="stage-progress-bar"
        style={{
          width: `${progress}%`,
          backgroundColor: getStageColor(currentStage),
        }}
      />
    </div>
  );
}
