// components/spaces/gtm/plan/StageIndicator.js
// Visual indicator for GTM Plan stages

import { GTM_STAGES } from '../GTMContext';

export default function StageIndicator({ stage, size = 'medium', showLabel = true }) {
  const stageInfo = GTM_STAGES[stage] || GTM_STAGES.draft;
  const stages = Object.values(GTM_STAGES);
  const currentIndex = stages.findIndex(s => s.id === stage);

  const sizeClasses = {
    small: 'gtm-stage-indicator-sm',
    medium: 'gtm-stage-indicator-md',
    large: 'gtm-stage-indicator-lg'
  };

  if (size === 'small') {
    // Compact badge version
    return (
      <span
        className={`gtm-stage-badge ${sizeClasses[size]}`}
        style={{ backgroundColor: stageInfo.color }}
        title={stageInfo.description}
      >
        {stageInfo.name}
      </span>
    );
  }

  // Full progress indicator
  return (
    <div className={`gtm-stage-indicator ${sizeClasses[size]}`}>
      <div className="gtm-stage-track">
        {stages.map((s, index) => (
          <div
            key={s.id}
            className={`gtm-stage-step ${index <= currentIndex ? 'completed' : ''} ${index === currentIndex ? 'current' : ''}`}
          >
            <div
              className="gtm-stage-dot"
              style={{
                backgroundColor: index <= currentIndex ? s.color : '#d1d5db',
                borderColor: index === currentIndex ? s.color : 'transparent'
              }}
            >
              {index < currentIndex && (
                <svg viewBox="0 0 24 24" className="gtm-stage-check">
                  <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </div>
            {index < stages.length - 1 && (
              <div
                className="gtm-stage-connector"
                style={{
                  backgroundColor: index < currentIndex ? stages[index + 1].color : '#e5e7eb'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {showLabel && (
        <div className="gtm-stage-labels">
          {stages.map((s, index) => (
            <span
              key={s.id}
              className={`gtm-stage-label ${index === currentIndex ? 'current' : ''}`}
              style={{ color: index === currentIndex ? s.color : '#6b7280' }}
            >
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact inline version showing just current stage
export function StageLabel({ stage }) {
  const stageInfo = GTM_STAGES[stage] || GTM_STAGES.draft;

  return (
    <span
      className="gtm-stage-label-inline"
      style={{ color: stageInfo.color }}
    >
      <span
        className="gtm-stage-label-dot"
        style={{ backgroundColor: stageInfo.color }}
      />
      {stageInfo.name}
    </span>
  );
}
