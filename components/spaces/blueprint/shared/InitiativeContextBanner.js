// components/spaces/blueprint/shared/InitiativeContextBanner.js
// Shows the currently selected initiative context at the top of stage views
// Enhanced with stage stepper and flow visualization

import { useMemo } from 'react';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { BPS_STAGE_INFO } from '../BlueprintContext';

const STATUS_CONFIG = {
  open: { icon: FolderOpenIcon, label: 'Open', className: 'open' },
  closed: { icon: FolderIcon, label: 'Closed', className: 'closed' },
  on_hold: { icon: FolderIcon, label: 'On Hold', className: 'on-hold' },
};

// Stage progression for the stepper
const DISCOVERY_STAGES = ['idea', 'explore', 'assess'];
const DECISION_STAGES = ['case', 'approval'];
const ALL_STAGES = [...DISCOVERY_STAGES, ...DECISION_STAGES];

/**
 * Stage Stepper Component
 * Shows progress through Discovery and Decision phases
 * @param {boolean} compact - If true, shows a more horizontal compact version
 */
function StageStepper({ currentStage, onStageClick, compact = false }) {
  const currentIndex = ALL_STAGES.indexOf(currentStage);

  if (compact) {
    // Compact horizontal version
    return (
      <div className="stage-stepper stage-stepper--compact">
        <span className="stage-stepper-phase-label stage-stepper-phase-label--discovery">Discovery</span>
        {DISCOVERY_STAGES.map((stage, idx) => {
          const stageInfo = BPS_STAGE_INFO[stage];
          const globalIdx = idx;
          const isActive = stage === currentStage;
          const isComplete = globalIdx < currentIndex;
          const isAccessible = globalIdx <= currentIndex;

          return (
            <button
              key={stage}
              className={`stage-step-compact ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
              onClick={() => isAccessible && onStageClick?.(stage)}
              disabled={!isAccessible}
              title={stageInfo?.name || stage}
              style={{ '--stage-color': stageInfo?.color || '#9C9A94' }}
            >
              <span className="stage-step-num">{isComplete ? '✓' : idx + 1}</span>
              <span className="stage-step-label">{stageInfo?.name || stage}</span>
            </button>
          );
        })}
        <span className="stage-stepper-separator">|</span>
        <span className="stage-stepper-phase-label stage-stepper-phase-label--decision">Decision</span>
        {DECISION_STAGES.map((stage, idx) => {
          const stageInfo = BPS_STAGE_INFO[stage];
          const globalIdx = DISCOVERY_STAGES.length + idx;
          const isActive = stage === currentStage;
          const isComplete = globalIdx < currentIndex;
          const isAccessible = globalIdx <= currentIndex;

          return (
            <button
              key={stage}
              className={`stage-step-compact ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
              onClick={() => isAccessible && onStageClick?.(stage)}
              disabled={!isAccessible}
              title={stageInfo?.name || stage}
              style={{ '--stage-color': stageInfo?.color || '#9C9A94' }}
            >
              <span className="stage-step-num">{isComplete ? '✓' : DISCOVERY_STAGES.length + idx + 1}</span>
              <span className="stage-step-label">{stageInfo?.name || stage}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Full version with vertical layout
  return (
    <div className="stage-stepper">
      <div className="stage-stepper-section stage-stepper-section--discovery">
        <span className="stage-stepper-label">Discovery</span>
        <div className="stage-stepper-stages">
          {DISCOVERY_STAGES.map((stage, idx) => {
            const stageInfo = BPS_STAGE_INFO[stage];
            const globalIdx = idx;
            const isActive = stage === currentStage;
            const isComplete = globalIdx < currentIndex;
            const isAccessible = globalIdx <= currentIndex;

            return (
              <div
                key={stage}
                className={`stage-step ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                onClick={() => isAccessible && onStageClick?.(stage)}
                style={{ cursor: isAccessible ? 'pointer' : 'default' }}
              >
                <div
                  className="stage-step-indicator"
                  style={{ '--stage-color': stageInfo?.color || '#9C9A94' }}
                >
                  {isComplete ? '✓' : idx + 1}
                </div>
                <span className="stage-step-name">{stageInfo?.name || stage}</span>
                {idx < DISCOVERY_STAGES.length - 1 && <div className="stage-step-connector" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="stage-stepper-divider" />

      <div className="stage-stepper-section stage-stepper-section--decision">
        <span className="stage-stepper-label">Decision</span>
        <div className="stage-stepper-stages">
          {DECISION_STAGES.map((stage, idx) => {
            const stageInfo = BPS_STAGE_INFO[stage];
            const globalIdx = DISCOVERY_STAGES.length + idx;
            const isActive = stage === currentStage;
            const isComplete = globalIdx < currentIndex;
            const isAccessible = globalIdx <= currentIndex;

            return (
              <div
                key={stage}
                className={`stage-step ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                onClick={() => isAccessible && onStageClick?.(stage)}
                style={{ cursor: isAccessible ? 'pointer' : 'default' }}
              >
                <div
                  className="stage-step-indicator"
                  style={{ '--stage-color': stageInfo?.color || '#9C9A94' }}
                >
                  {isComplete ? '✓' : DISCOVERY_STAGES.length + idx + 1}
                </div>
                <span className="stage-step-name">{stageInfo?.name || stage}</span>
                {idx < DECISION_STAGES.length - 1 && <div className="stage-step-connector" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function InitiativeContextBanner({
  initiative,
  currentStage,
  onBack,
  onStageClick,
  showDescription = true,
  showStepper = true,
  compact = false,
}) {
  if (!initiative) return null;

  const status = initiative.initiative_status || initiative.status || 'open';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const StatusIcon = config.icon;
  const description = initiative.strategic_context?.problem_statement ||
                      initiative.idea?.description ||
                      initiative.description;

  // Get current stage from initiative or prop
  const stage = currentStage || initiative.stage || 'idea';
  const stageInfo = BPS_STAGE_INFO[stage];

  // Format created date
  const createdDate = useMemo(() => {
    if (!initiative.created_at) return null;
    return new Date(initiative.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [initiative.created_at]);

  // Get owner name
  const ownerName = initiative.created_by || initiative.owner || 'Unassigned';

  if (compact) {
    return (
      <div className="initiative-context-banner initiative-context-banner--compact">
        <button
          className="initiative-context-back"
          onClick={onBack}
          title="Back to initiative board"
        >
          <ArrowBackIcon fontSize="small" />
        </button>
        <StatusIcon className="initiative-context-icon" data-status={status} />
        <span className="initiative-context-id">{initiative.display_id}</span>
        <span className="initiative-context-name">{initiative.name}</span>
        {stageInfo && (
          <span
            className="initiative-context-stage-badge"
            style={{ '--stage-color': stageInfo.color }}
          >
            {stageInfo.name}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="initiative-context-banner initiative-context-banner--full">
      {/* Main info section */}
      <div className="initiative-context-main">
        <button
          className="initiative-context-back"
          onClick={onBack}
          title="Back to initiative board"
        >
          <ArrowBackIcon fontSize="small" />
        </button>

        <div className="initiative-context-info">
          <div className="initiative-context-header">
            <span className="initiative-context-id">{initiative.display_id}</span>
            <span className={`initiative-context-status initiative-context-status--${config.className}`}>
              {config.label}
            </span>
            {stageInfo && (
              <span
                className="initiative-context-stage-badge"
                style={{ '--stage-color': stageInfo.color }}
              >
                {stageInfo.name}
              </span>
            )}
          </div>

          <h2 className="initiative-context-name">{initiative.name}</h2>

          <div className="initiative-context-meta">
            {createdDate && (
              <span className="initiative-context-meta-item">
                <CalendarTodayIcon fontSize="small" />
                {createdDate}
              </span>
            )}
            <span className="initiative-context-meta-item">
              <PersonIcon fontSize="small" />
              {ownerName}
            </span>
          </div>
        </div>
      </div>

      {/* Stage stepper */}
      {showStepper && (
        <StageStepper
          currentStage={stage}
          onStageClick={onStageClick}
        />
      )}
    </div>
  );
}

// Export the StageStepper for standalone use
export { StageStepper };
