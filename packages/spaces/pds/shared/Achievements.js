// components/pds/shared/Achievements.js
// Achievement system for PDS workspace
// Phase 5: Delight & Polish

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

// MUI Icons
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import FlagIcon from '@mui/icons-material/Flag';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import CelebrationIcon from '@mui/icons-material/Celebration';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

import styles from './Achievements.module.css';

// Achievement definitions
export const ACHIEVEMENTS = {
  // Getting started
  first_stakeholder: {
    id: 'first_stakeholder',
    name: 'First Contact',
    description: 'Add your first stakeholder to the project',
    icon: PeopleIcon,
    category: 'getting_started',
    check: (artefacts) => artefacts.some(a => a.artefact_type === 'pds_stakeholder'),
  },
  first_risk: {
    id: 'first_risk',
    name: 'Risk Aware',
    description: 'Log your first project risk',
    icon: WarningIcon,
    category: 'getting_started',
    check: (artefacts) => artefacts.some(a => a.artefact_type === 'pds_risk'),
  },
  first_milestone: {
    id: 'first_milestone',
    name: 'Milestone Maker',
    description: 'Set your first project milestone',
    icon: FlagIcon,
    category: 'getting_started',
    check: (artefacts) => artefacts.some(a => a.artefact_type === 'pds_milestone'),
  },
  first_assumption: {
    id: 'first_assumption',
    name: 'Assumption Hunter',
    description: 'Document your first assumption',
    icon: LightbulbIcon,
    category: 'getting_started',
    check: (artefacts) => artefacts.some(a => a.artefact_type === 'pds_assumption'),
  },

  // Progress milestones
  five_stakeholders: {
    id: 'five_stakeholders',
    name: 'Building the Team',
    description: 'Identify 5 stakeholders',
    icon: PeopleIcon,
    category: 'progress',
    threshold: 5,
    check: (artefacts) => artefacts.filter(a => a.artefact_type === 'pds_stakeholder').length >= 5,
    progress: (artefacts) => ({
      current: artefacts.filter(a => a.artefact_type === 'pds_stakeholder').length,
      target: 5,
    }),
  },
  five_risks: {
    id: 'five_risks',
    name: 'Risk Register',
    description: 'Identify 5 project risks',
    icon: WarningIcon,
    category: 'progress',
    threshold: 5,
    check: (artefacts) => artefacts.filter(a => a.artefact_type === 'pds_risk').length >= 5,
    progress: (artefacts) => ({
      current: artefacts.filter(a => a.artefact_type === 'pds_risk').length,
      target: 5,
    }),
  },
  ten_artefacts: {
    id: 'ten_artefacts',
    name: 'Getting Serious',
    description: 'Create 10 project artefacts',
    icon: StarIcon,
    category: 'progress',
    threshold: 10,
    check: (artefacts) => artefacts.length >= 10,
    progress: (artefacts) => ({
      current: artefacts.length,
      target: 10,
    }),
  },

  // Stage mastery
  intent_complete: {
    id: 'intent_complete',
    name: 'Intent Defined',
    description: 'Complete the Intent & Governance stage (80%+)',
    icon: FlagIcon,
    category: 'mastery',
    check: (artefacts, stageCompletion) => (stageCompletion?.intent || 0) >= 80,
  },
  structure_complete: {
    id: 'structure_complete',
    name: 'Structure Built',
    description: 'Complete the Structure & Planning stage (80%+)',
    icon: RocketLaunchIcon,
    category: 'mastery',
    check: (artefacts, stageCompletion) => (stageCompletion?.structure || 0) >= 80,
  },
  all_stages_started: {
    id: 'all_stages_started',
    name: 'Full Coverage',
    description: 'Have at least one artefact in each stage',
    icon: WorkspacePremiumIcon,
    category: 'mastery',
    check: (artefacts) => {
      const stageTypes = {
        intent: ['pds_stakeholder', 'pds_business_case', 'pds_success_criteria'],
        structure: ['pds_deliverable', 'pds_milestone', 'pds_dependency'],
        uncertainty: ['pds_risk', 'pds_assumption'],
        control: ['pds_issue', 'pds_change_request'],
        learning: ['pds_lesson', 'pds_retrospective'],
      };
      return Object.values(stageTypes).every(types =>
        artefacts.some(a => types.includes(a.artefact_type))
      );
    },
  },

  // Learning & reflection
  first_lesson: {
    id: 'first_lesson',
    name: 'Learning Culture',
    description: 'Capture your first lesson learned',
    icon: SchoolIcon,
    category: 'learning',
    check: (artefacts) => artefacts.some(a => a.artefact_type === 'pds_lesson'),
  },
  resolved_issue: {
    id: 'resolved_issue',
    name: 'Problem Solver',
    description: 'Resolve your first issue',
    icon: CheckCircleIcon,
    category: 'learning',
    check: (artefacts) => artefacts.some(a =>
      a.artefact_type === 'pds_issue' &&
      ['resolved', 'closed'].includes(a.custom_fields?.status)
    ),
  },
};

// Achievement context
const AchievementContext = createContext(null);

export function useAchievements() {
  return useContext(AchievementContext);
}

// Achievement provider
export function AchievementProvider({ children, artefacts = [], stageCompletion = {} }) {
  const [unlockedIds, setUnlockedIds] = useState(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('pds-achievements');
    return stored ? JSON.parse(stored) : [];
  });
  const [newlyUnlocked, setNewlyUnlocked] = useState(null);
  const [showMilestone, setShowMilestone] = useState(null);

  // Check for newly unlocked achievements
  useEffect(() => {
    const newUnlocked = [];

    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (!unlockedIds.includes(achievement.id)) {
        const isUnlocked = achievement.check(artefacts, stageCompletion);
        if (isUnlocked) {
          newUnlocked.push(achievement.id);
        }
      }
    });

    if (newUnlocked.length > 0) {
      const updatedIds = [...unlockedIds, ...newUnlocked];
      setUnlockedIds(updatedIds);
      localStorage.setItem('pds-achievements', JSON.stringify(updatedIds));

      // Show toast for first new achievement
      const firstNew = ACHIEVEMENTS[newUnlocked[0]];
      setNewlyUnlocked(firstNew);

      // Show milestone celebration for special achievements
      if (firstNew.category === 'mastery') {
        setShowMilestone(firstNew);
      }
    }
  }, [artefacts, stageCompletion, unlockedIds]);

  // Dismiss toast
  const dismissToast = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  // Dismiss milestone
  const dismissMilestone = useCallback(() => {
    setShowMilestone(null);
  }, []);

  // Get achievement status
  const getAchievement = useCallback((id) => {
    const achievement = ACHIEVEMENTS[id];
    if (!achievement) return null;

    const isUnlocked = unlockedIds.includes(id);
    const progress = achievement.progress?.(artefacts);

    return {
      ...achievement,
      unlocked: isUnlocked,
      progress,
    };
  }, [unlockedIds, artefacts]);

  // Get all achievements with status
  const allAchievements = useMemo(() => {
    return Object.values(ACHIEVEMENTS).map(a => ({
      ...a,
      unlocked: unlockedIds.includes(a.id),
      progress: a.progress?.(artefacts),
    }));
  }, [unlockedIds, artefacts]);

  const value = {
    unlockedIds,
    unlockedCount: unlockedIds.length,
    totalCount: Object.keys(ACHIEVEMENTS).length,
    getAchievement,
    allAchievements,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
      {newlyUnlocked && (
        <AchievementToast
          achievement={newlyUnlocked}
          onDismiss={dismissToast}
        />
      )}
      {showMilestone && (
        <MilestoneCelebration
          achievement={showMilestone}
          onDismiss={dismissMilestone}
        />
      )}
    </AchievementContext.Provider>
  );
}

// Achievement toast notification
function AchievementToast({ achievement, onDismiss }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const Icon = achievement.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onDismiss, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onDismiss, 300);
  };

  const content = (
    <div className={`${styles.toast} ${isLeaving ? styles.toastLeaving : ''}`}>
      <button className={styles.toastClose} onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </button>
      <div className={styles.toastIcon}>
        <Icon />
      </div>
      <div className={styles.toastContent}>
        <div className={styles.toastLabel}>
          <EmojiEventsIcon fontSize="small" />
          Achievement Unlocked
        </div>
        <h4 className={styles.toastTitle}>{achievement.name}</h4>
        <p className={styles.toastDesc}>{achievement.description}</p>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// Milestone celebration overlay
function MilestoneCelebration({ achievement, onDismiss }) {
  const Icon = achievement.icon;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const content = (
    <div className={styles.milestone} onClick={onDismiss}>
      <Confetti />
      <div className={styles.milestoneContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.milestoneIcon}>
          <Icon />
        </div>
        <h2 className={styles.milestoneTitle}>{achievement.name}</h2>
        <p className={styles.milestoneDesc}>{achievement.description}</p>
        <button className={styles.milestoneBtn} onClick={onDismiss}>
          Continue
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// Confetti effect
function Confetti() {
  const pieces = useMemo(() => {
    const colors = ['#f59e0b', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 8,
    }));
  }, []);

  return (
    <div className={styles.confetti}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={styles.confettiPiece}
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

// Achievement badge component
export function AchievementBadge({ achievementId }) {
  const { getAchievement } = useAchievements() || {};
  const achievement = getAchievement?.(achievementId);

  if (!achievement) return null;

  const Icon = achievement.icon;

  return (
    <div className={styles.badge}>
      <div className={`${styles.badgeIcon} ${!achievement.unlocked ? styles.locked : ''}`}>
        <Icon fontSize="small" />
      </div>
      <span className={`${styles.badgeName} ${!achievement.unlocked ? styles.locked : ''}`}>
        {achievement.name}
      </span>
    </div>
  );
}

// Achievement card component
export function AchievementCard({ achievement }) {
  const Icon = achievement.icon;
  const progress = achievement.progress;
  const progressPercent = progress
    ? Math.min(100, Math.round((progress.current / progress.target) * 100))
    : achievement.unlocked ? 100 : 0;

  return (
    <div className={`${styles.card} ${achievement.unlocked ? styles.unlocked : styles.locked}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <Icon />
        </div>
        <div className={styles.cardInfo}>
          <h4 className={styles.cardName}>{achievement.name}</h4>
          <p className={styles.cardDesc}>{achievement.description}</p>
        </div>
      </div>

      {progress && !achievement.unlocked && (
        <div className={styles.cardProgress}>
          <div className={styles.cardProgressBar}>
            <div
              className={styles.cardProgressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className={styles.cardProgressText}>
            {progress.current} / {progress.target}
          </span>
        </div>
      )}

      {achievement.unlocked && (
        <div className={styles.cardUnlockedDate}>
          <CelebrationIcon fontSize="small" />
          Unlocked
        </div>
      )}
    </div>
  );
}

// Achievement grid component
export function AchievementGrid() {
  const { allAchievements } = useAchievements() || { allAchievements: [] };

  // Group by category
  const categories = {
    getting_started: { name: 'Getting Started', items: [] },
    progress: { name: 'Progress', items: [] },
    mastery: { name: 'Stage Mastery', items: [] },
    learning: { name: 'Learning & Reflection', items: [] },
  };

  allAchievements.forEach(a => {
    if (categories[a.category]) {
      categories[a.category].items.push(a);
    }
  });

  return (
    <div>
      {Object.entries(categories).map(([key, category]) => (
        <div key={key} style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
            {category.name}
          </h3>
          <div className={styles.grid}>
            {category.items.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
