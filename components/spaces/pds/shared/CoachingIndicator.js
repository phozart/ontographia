// components/pds/shared/CoachingIndicator.js
// Coaching indicators and contextual hints for PDS workspace
// Phase 2: Guided Experience

import { useState, useEffect, useCallback } from 'react';

// MUI Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';

import styles from './CoachingIndicator.module.css';

/**
 * Pulsing dot indicator to draw attention
 */
export function PulsingDot({ size = 'medium', color }) {
  return (
    <div className={styles.indicator}>
      <div
        className={`${styles.dot} ${styles[size]}`}
        style={color ? { background: color } : undefined}
      />
      <div
        className={styles.dotRing}
        style={color ? { borderColor: color } : undefined}
      />
    </div>
  );
}

/**
 * Coaching tooltip with contextual help
 */
export function CoachingTooltip({
  title,
  content,
  icon: Icon = LightbulbIcon,
  actionLabel,
  onAction,
  onDismiss,
  position = 'bottom',
  isOpen = true,
}) {
  if (!isOpen) return null;

  return (
    <div className={`${styles.tooltip} ${styles[position]}`}>
      <div className={styles.tooltipArrow} />
      {onDismiss && (
        <button className={styles.tooltipDismiss} onClick={onDismiss}>
          <CloseIcon fontSize="small" />
        </button>
      )}
      <div className={styles.tooltipHeader}>
        <div className={styles.tooltipIcon}>
          <Icon />
        </div>
        <span className={styles.tooltipTitle}>{title}</span>
      </div>
      <div className={styles.tooltipContent}>{content}</div>
      {actionLabel && onAction && (
        <button className={styles.tooltipAction} onClick={onAction}>
          {actionLabel}
          <ArrowForwardIcon fontSize="small" />
        </button>
      )}
    </div>
  );
}

/**
 * Small badge with coaching tip
 */
export function CoachingBadge({ label, icon: Icon = TipsAndUpdatesIcon, onClick }) {
  return (
    <button className={styles.badge} onClick={onClick}>
      <Icon fontSize="small" />
      {label}
    </button>
  );
}

/**
 * Progress hint banner - suggests next action
 */
export function ProgressHint({
  title,
  text,
  actionLabel,
  onAction,
  icon: Icon = LightbulbIcon,
}) {
  return (
    <div className={styles.progressHint}>
      <div className={styles.progressHintIcon}>
        <Icon />
      </div>
      <div className={styles.progressHintContent}>
        <span className={styles.progressHintTitle}>{title}</span>
        <span className={styles.progressHintText}>{text}</span>
      </div>
      {actionLabel && onAction && (
        <button className={styles.progressHintAction} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Empty state with coaching guidance
 */
export function EmptyStateCoach({
  title,
  text,
  actionLabel,
  onAction,
  icon: Icon = LightbulbIcon,
}) {
  return (
    <div className={styles.emptyCoach}>
      <div className={styles.emptyCoachIcon}>
        <Icon />
      </div>
      <h3 className={styles.emptyCoachTitle}>{title}</h3>
      <p className={styles.emptyCoachText}>{text}</p>
      {actionLabel && onAction && (
        <button className={styles.emptyCoachBtn} onClick={onAction}>
          <AddIcon fontSize="small" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Hook to manage coaching tips state
 */
export function useCoachingTips(tipIds = []) {
  const [dismissedTips, setDismissedTips] = useState(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('pds-dismissed-tips');
    return stored ? JSON.parse(stored) : [];
  });

  const dismissTip = useCallback((tipId) => {
    setDismissedTips(prev => {
      const updated = [...prev, tipId];
      localStorage.setItem('pds-dismissed-tips', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetTips = useCallback(() => {
    localStorage.removeItem('pds-dismissed-tips');
    setDismissedTips([]);
  }, []);

  const isTipDismissed = useCallback((tipId) => {
    return dismissedTips.includes(tipId);
  }, [dismissedTips]);

  const getActiveTip = useCallback(() => {
    return tipIds.find(id => !dismissedTips.includes(id)) || null;
  }, [tipIds, dismissedTips]);

  return {
    dismissedTips,
    dismissTip,
    resetTips,
    isTipDismissed,
    getActiveTip,
  };
}

// Predefined coaching tips for PDS stages
export const PDS_COACHING_TIPS = {
  // Intent stage tips
  intent_stakeholders: {
    id: 'intent_stakeholders',
    title: 'Identify Stakeholders',
    content: 'Start by identifying who has a stake in your project. Consider sponsors, beneficiaries, and those who might be affected.',
    stage: 'intent',
  },
  intent_success: {
    id: 'intent_success',
    title: 'Define Success',
    content: 'What does success look like? Define clear, measurable success criteria before diving into planning.',
    stage: 'intent',
  },
  // Structure stage tips
  structure_deliverables: {
    id: 'structure_deliverables',
    title: 'Break Down Deliverables',
    content: 'Large deliverables are hard to manage. Break them into smaller, manageable pieces using a Work Breakdown Structure.',
    stage: 'structure',
  },
  structure_milestones: {
    id: 'structure_milestones',
    title: 'Set Milestones',
    content: 'Milestones are checkpoints that help you track progress. Set them at key decision points in your project.',
    stage: 'structure',
  },
  // Risk stage tips
  risk_identify: {
    id: 'risk_identify',
    title: 'Identify Risks Early',
    content: 'Don\'t wait for risks to become problems. Proactively identify what could go wrong and plan responses.',
    stage: 'uncertainty',
  },
  risk_assumptions: {
    id: 'risk_assumptions',
    title: 'Log Assumptions',
    content: 'Assumptions are risks in disguise. Document what you\'re assuming to be true - they may need validation.',
    stage: 'uncertainty',
  },
  // Control stage tips
  control_progress: {
    id: 'control_progress',
    title: 'Track Progress',
    content: 'Regularly update progress against milestones. This helps identify issues early when there\'s still time to address them.',
    stage: 'control',
  },
  control_issues: {
    id: 'control_issues',
    title: 'Manage Issues',
    content: 'Issues are problems that need resolution. Track them, assign owners, and monitor until they\'re resolved.',
    stage: 'control',
  },
  // Learning stage tips
  learning_lessons: {
    id: 'learning_lessons',
    title: 'Capture Lessons',
    content: 'Don\'t wait until the end. Capture lessons learned throughout the project while details are fresh.',
    stage: 'learning',
  },
  learning_retrospective: {
    id: 'learning_retrospective',
    title: 'Hold Retrospectives',
    content: 'Regular retrospectives help the team reflect on what\'s working and what needs to change.',
    stage: 'learning',
  },
};

/**
 * Get relevant coaching tips for a stage
 */
export function getTipsForStage(stage) {
  return Object.values(PDS_COACHING_TIPS).filter(tip => tip.stage === stage);
}

/**
 * Get a random tip for a stage
 */
export function getRandomTipForStage(stage) {
  const tips = getTipsForStage(stage);
  if (tips.length === 0) return null;
  return tips[Math.floor(Math.random() * tips.length)];
}
