// components/pds/views/CrossStageView.js
// Visual cross-stage relationship view - "The Project Story"
// Phase 3: Visual Storytelling

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';

// MUI Icons
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FlagIcon from '@mui/icons-material/Flag';
import WarningIcon from '@mui/icons-material/Warning';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import BugReportIcon from '@mui/icons-material/BugReport';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';

import styles from './CrossStageView.module.css';

// Stage configuration
const STAGES = [
  {
    id: 'intent',
    name: 'Intent',
    fullName: 'Intent & Governance',
    icon: FlagIcon,
    color: '#8b5cf6',
    colorRgb: '139, 92, 246',
    types: ['pds_stakeholder', 'pds_business_case', 'pds_success_criteria', 'pds_gate'],
  },
  {
    id: 'structure',
    name: 'Structure',
    fullName: 'Structure & Planning',
    icon: AccountTreeIcon,
    color: '#3b82f6',
    colorRgb: '59, 130, 246',
    types: ['pds_deliverable', 'pds_milestone', 'pds_dependency', 'pds_resource'],
  },
  {
    id: 'uncertainty',
    name: 'Risk',
    fullName: 'Risk & Uncertainty',
    icon: WarningIcon,
    color: '#f59e0b',
    colorRgb: '245, 158, 11',
    types: ['pds_risk', 'pds_assumption', 'pds_constraint'],
  },
  {
    id: 'control',
    name: 'Execute',
    fullName: 'Execution & Control',
    icon: PlayCircleIcon,
    color: '#10b981',
    colorRgb: '16, 185, 129',
    types: ['pds_issue', 'pds_change_request', 'pds_action', 'pds_decision'],
  },
  {
    id: 'learning',
    name: 'Learn',
    fullName: 'Learning & Evolution',
    icon: SchoolIcon,
    color: '#6366f1',
    colorRgb: '99, 102, 241',
    types: ['pds_lesson', 'pds_retrospective', 'pds_benefit'],
  },
];

// Type icons
const TYPE_ICONS = {
  pds_stakeholder: PeopleIcon,
  pds_business_case: AssignmentIcon,
  pds_success_criteria: FlagIcon,
  pds_gate: FlagIcon,
  pds_deliverable: AssignmentIcon,
  pds_milestone: EventIcon,
  pds_dependency: AccountTreeIcon,
  pds_resource: PeopleIcon,
  pds_risk: WarningIcon,
  pds_assumption: LightbulbIcon,
  pds_constraint: WarningIcon,
  pds_issue: BugReportIcon,
  pds_change_request: AssignmentIcon,
  pds_action: PlayCircleIcon,
  pds_decision: FlagIcon,
  pds_lesson: SchoolIcon,
  pds_retrospective: SchoolIcon,
  pds_benefit: FlagIcon,
};

// Get type display name
function getTypeName(type) {
  return type
    ?.replace('pds_', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase()) || 'Artefact';
}

export default function CrossStageView({
  onNavigate,
  onSelectArtefact,
  onCreateArtefact,
}) {
  const {
    artefacts,
    stageCompletion,
    activeView,
  } = usePDS();

  // Group artefacts by stage
  const artefactsByStage = useMemo(() => {
    const grouped = {};

    STAGES.forEach(stage => {
      grouped[stage.id] = artefacts.filter(a => {
        // Match by type
        return stage.types.includes(a.artefact_type);
      });
    });

    return grouped;
  }, [artefacts]);

  // Calculate summary stats
  const stats = useMemo(() => {
    return STAGES.map(stage => ({
      id: stage.id,
      name: stage.name,
      color: stage.color,
      count: artefactsByStage[stage.id]?.length || 0,
    }));
  }, [artefactsByStage]);

  const handleStageClick = (stageId) => {
    onNavigate?.(stageId);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <div className={styles.titleIcon}>
            <AutoStoriesIcon />
          </div>
          <div className={styles.titleText}>
            <h1>The Project Story</h1>
            <p>Your journey through the five stages of project delivery</p>
          </div>
        </div>
        <div className={styles.controls}>
          <div className={styles.viewToggle}>
            <button className={`${styles.viewBtn} ${styles.active}`}>
              <TimelineIcon fontSize="small" />
              Timeline
            </button>
            <button className={styles.viewBtn}>
              <AccountTreeIcon fontSize="small" />
              Graph
            </button>
          </div>
        </div>
      </div>

      {/* Main timeline content */}
      <div className={styles.content}>
        <div className={styles.timeline}>
          <div className={styles.timelineTrack} />

          {STAGES.map((stage) => {
            const StageIcon = stage.icon;
            const stageArtefacts = artefactsByStage[stage.id] || [];
            const progress = stageCompletion?.[stage.id] || 0;
            const isActive = activeView === stage.id;

            return (
              <div
                key={stage.id}
                className={`${styles.stageRow} ${isActive ? styles.active : ''}`}
                style={{
                  '--stage-color': stage.color,
                  '--stage-color-rgb': stage.colorRgb,
                }}
              >
                {/* Stage label */}
                <div className={styles.stageLabel}>
                  <div
                    className={styles.stageDot}
                    onClick={() => handleStageClick(stage.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <StageIcon />
                  </div>
                  <span className={styles.stageName}>{stage.name}</span>
                  <span className={styles.stageProgress}>{progress}%</span>
                </div>

                {/* Stage artefacts */}
                <div className={styles.stageContent}>
                  {stageArtefacts.length > 0 ? (
                    <div className={styles.artefactGrid}>
                      {stageArtefacts.slice(0, 6).map((artefact, index) => {
                        const ArtefactIcon = TYPE_ICONS[artefact.artefact_type] || AssignmentIcon;
                        const status = artefact.custom_fields?.status;

                        return (
                          <div
                            key={artefact.id}
                            className={styles.artefactCard}
                            onClick={() => onSelectArtefact?.(artefact)}
                            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                          >
                            <div className={styles.artefactIcon}>
                              <ArtefactIcon />
                            </div>
                            <div className={styles.artefactInfo}>
                              <span className={styles.artefactName}>{artefact.name}</span>
                              <span className={styles.artefactType}>
                                {getTypeName(artefact.artefact_type)}
                              </span>
                              {status && (
                                <span className={`${styles.artefactStatus} ${
                                  status === 'active' ? styles.active :
                                  status === 'at_risk' ? styles.risk : ''
                                }`}>
                                  {status.replace(/_/g, ' ')}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {stageArtefacts.length > 6 && (
                        <button
                          className={styles.addBtn}
                          onClick={() => handleStageClick(stage.id)}
                        >
                          +{stageArtefacts.length - 6} more
                        </button>
                      )}
                      <button
                        className={styles.addBtn}
                        onClick={() => onCreateArtefact?.(stage.types[0])}
                      >
                        <AddIcon fontSize="small" />
                        Add
                      </button>
                    </div>
                  ) : (
                    <div className={styles.stageEmpty}>
                      <LightbulbIcon />
                      <span>No artefacts yet in {stage.name}</span>
                      <button
                        className={styles.addBtn}
                        onClick={() => onCreateArtefact?.(stage.types[0])}
                      >
                        <AddIcon fontSize="small" />
                        Add first
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary footer */}
      <div className={styles.summary}>
        {stats.map((stat) => (
          <div key={stat.id} className={styles.summaryItem}>
            <div className={styles.summaryIcon} style={{ background: stat.color }}>
              {(() => {
                const StageIcon = STAGES.find(s => s.id === stat.id)?.icon;
                return StageIcon ? <StageIcon fontSize="small" /> : null;
              })()}
            </div>
            <div className={styles.summaryInfo}>
              <span className={styles.summaryValue}>{stat.count}</span>
              <span className={styles.summaryLabel}>{stat.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
