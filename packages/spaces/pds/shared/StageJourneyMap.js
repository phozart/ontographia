// components/pds/shared/StageJourneyMap.js
// Visual journey map showing project stage progress
// Phase 2: Guided Experience

import { useMemo } from 'react';

// MUI Icons
import RouteIcon from '@mui/icons-material/Route';
import FlagIcon from '@mui/icons-material/Flag';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WarningIcon from '@mui/icons-material/Warning';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SchoolIcon from '@mui/icons-material/School';
import CheckIcon from '@mui/icons-material/Check';

import styles from './StageJourneyMap.module.css';

// Stage configuration
const STAGES = [
  {
    id: 'intent',
    name: 'Intent',
    fullName: 'Intent & Governance',
    icon: FlagIcon,
    color: '#8b5cf6',
    colorRgb: '139, 92, 246',
  },
  {
    id: 'structure',
    name: 'Structure',
    fullName: 'Structure & Planning',
    icon: AccountTreeIcon,
    color: '#3b82f6',
    colorRgb: '59, 130, 246',
  },
  {
    id: 'uncertainty',
    name: 'Risk',
    fullName: 'Risk & Uncertainty',
    icon: WarningIcon,
    color: '#f59e0b',
    colorRgb: '245, 158, 11',
  },
  {
    id: 'control',
    name: 'Execute',
    fullName: 'Execution & Control',
    icon: PlayCircleIcon,
    color: '#10b981',
    colorRgb: '16, 185, 129',
  },
  {
    id: 'learning',
    name: 'Learn',
    fullName: 'Learning & Evolution',
    icon: SchoolIcon,
    color: '#6366f1',
    colorRgb: '99, 102, 241',
  },
];

/**
 * Stage Journey Map Component
 *
 * @param {Object} props
 * @param {Object} props.stageProgress - Object with stage IDs as keys and completion percentages as values
 * @param {string} props.activeStage - Currently active stage ID
 * @param {Function} props.onStageClick - Callback when a stage is clicked
 * @param {string} props.variant - Display variant: 'default', 'compact', or 'mini'
 * @param {boolean} props.showHeader - Whether to show the header
 */
export default function StageJourneyMap({
  stageProgress = {},
  activeStage,
  onStageClick,
  variant = 'default',
  showHeader = true,
}) {
  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const values = Object.values(stageProgress);
    if (values.length === 0) return 0;
    const total = values.reduce((sum, val) => sum + (val || 0), 0);
    return Math.round(total / STAGES.length);
  }, [stageProgress]);

  // Calculate journey line progress (based on how many stages are complete)
  const journeyLineProgress = useMemo(() => {
    const completedStages = STAGES.filter(
      stage => (stageProgress[stage.id] || 0) >= 100
    ).length;
    const partialProgress = STAGES.reduce((sum, stage, index) => {
      const progress = stageProgress[stage.id] || 0;
      if (progress < 100) {
        return sum + (progress / 100) * (100 / STAGES.length);
      }
      return sum;
    }, 0);
    return (completedStages / STAGES.length) * 100;
  }, [stageProgress]);

  // Determine stage status
  const getStageStatus = (stageId) => {
    const progress = stageProgress[stageId] || 0;
    if (progress >= 100) return 'completed';
    if (progress > 0) return 'partial';
    if (stageId === activeStage) return 'active';
    return 'pending';
  };

  return (
    <div className={`${styles.container} ${styles[variant] || ''}`}>
      {showHeader && variant === 'default' && (
        <div className={styles.header}>
          <h3 className={styles.title}>
            <div className={styles.titleIcon}>
              <RouteIcon />
            </div>
            Project Journey
          </h3>
          <div className={styles.overallProgress}>
            <span className={styles.overallLabel}>Overall Progress</span>
            <span className={styles.overallValue}>{overallProgress}%</span>
          </div>
        </div>
      )}

      <div className={styles.journey}>
        {/* Connecting line */}
        {variant === 'default' && (
          <div className={styles.journeyLine}>
            <div
              className={styles.journeyLineProgress}
              style={{ width: `${journeyLineProgress}%` }}
            />
          </div>
        )}

        {/* Stage nodes */}
        {STAGES.map((stage) => {
          const StageIcon = stage.icon;
          const status = getStageStatus(stage.id);
          const progress = stageProgress[stage.id] || 0;
          const isActive = stage.id === activeStage;

          return (
            <div
              key={stage.id}
              className={`${styles.stage} ${styles[status]} ${isActive ? styles.active : ''}`}
              onClick={() => onStageClick?.(stage.id)}
              style={{
                '--stage-color': stage.color,
                '--stage-color-rgb': stage.colorRgb,
                '--progress': `${progress}%`,
              }}
            >
              <div className={styles.stageNode}>
                <StageIcon />
                {status === 'completed' && (
                  <div className={styles.stageCheck}>
                    <CheckIcon />
                  </div>
                )}
              </div>

              <div className={styles.stageInfo}>
                <span className={styles.stageName}>{stage.name}</span>
                {variant !== 'mini' && (
                  <span className={styles.stageProgress}>
                    <strong>{progress}%</strong> complete
                  </span>
                )}
              </div>

              {/* Tooltip on hover */}
              {variant === 'default' && (
                <div className={styles.stageTooltip}>
                  <div className={styles.tooltipTitle}>{stage.fullName}</div>
                  <div className={styles.tooltipProgress}>{progress}% complete</div>
                  <div className={styles.tooltipBar}>
                    <div
                      className={styles.tooltipBarFill}
                      style={{ width: `${progress}%`, background: stage.color }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Mini version for use in sidebars/navigators
 */
export function MiniStageJourney({ stageProgress, activeStage, onStageClick }) {
  return (
    <StageJourneyMap
      stageProgress={stageProgress}
      activeStage={activeStage}
      onStageClick={onStageClick}
      variant="mini"
      showHeader={false}
    />
  );
}

/**
 * Compact horizontal version
 */
export function CompactStageJourney({ stageProgress, activeStage, onStageClick }) {
  return (
    <StageJourneyMap
      stageProgress={stageProgress}
      activeStage={activeStage}
      onStageClick={onStageClick}
      variant="compact"
      showHeader={false}
    />
  );
}
