/**
 * GuidancePanel.js
 *
 * Contextual guidance panel for Project Studio.
 * Provides stage-specific help and best practices.
 */

import { useMemo } from 'react';
import {
  PROJECT_STAGES,
  PROJECT_STAGE_INFO,
} from '../../../../lib/project-types';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// View-specific guidance
const VIEW_GUIDANCE = {
  overview: {
    title: 'Project Overview',
    description: 'Your project dashboard showing health, progress, and key items needing attention.',
    tips: [
      'Review the health indicator regularly',
      'Address high-score risks promptly',
      'Keep milestones up to date',
    ],
    keyQuestions: [
      'Is the project on track?',
      'What needs attention this week?',
      'Are there any blockers?',
    ],
  },
  raid: {
    title: 'RAID Log',
    description: 'Track Risks, Assumptions, Issues, Dependencies, and Decisions in one place.',
    tips: [
      'Review RAID items weekly with the team',
      'Update risk scores when circumstances change',
      'Close resolved items promptly',
    ],
    keyQuestions: [
      'What new risks have emerged?',
      'Are our assumptions still valid?',
      'What issues are blocking progress?',
    ],
  },
  risks: {
    title: 'Risk Management',
    description: 'Identify, assess, and mitigate potential threats to project success.',
    tips: [
      'Score risks by probability x impact',
      'Assign owners to all active risks',
      'Define clear trigger conditions',
      'Review weekly and update statuses',
    ],
    keyQuestions: [
      'What could go wrong?',
      'How likely is it?',
      'What would the impact be?',
      'How can we reduce the probability or impact?',
    ],
  },
  issues: {
    title: 'Issue Management',
    description: 'Track and resolve current problems affecting the project.',
    tips: [
      'Log issues as soon as they arise',
      'Prioritize by impact and urgency',
      'Set realistic resolution dates',
      'Escalate when needed',
    ],
    keyQuestions: [
      'What is the issue?',
      'What is the impact?',
      'Who owns the resolution?',
      'What is the target date?',
    ],
  },
  wbs: {
    title: 'Work Breakdown Structure',
    description: 'Decompose project scope into manageable deliverables and work packages.',
    tips: [
      'Use the 100% rule - WBS must include all work',
      'Break down to a level that can be estimated',
      'Each element should have a clear owner',
      'Use WBS codes for easy reference',
    ],
    keyQuestions: [
      'What are the major deliverables?',
      'How can each be broken down?',
      'Who is responsible for each element?',
      'How will we know when each is complete?',
    ],
  },
  milestones: {
    title: 'Milestones',
    description: 'Track key checkpoints marking significant progress.',
    tips: [
      'Define clear success criteria for each',
      'Include governance gates as milestones',
      'Review dates weekly',
      'Communicate changes promptly',
    ],
    keyQuestions: [
      'What are the key checkpoints?',
      'How will we know when we reach them?',
      'Who needs to approve them?',
    ],
  },
  change: {
    title: 'Change Management',
    description: 'Manage the people side of change to drive adoption.',
    tips: [
      'Assess impact across all affected groups',
      'Communicate early and often',
      'Build support from leaders first',
      'Plan training before go-live',
    ],
    keyQuestions: [
      'Who is affected by this change?',
      'What changes for them?',
      'How ready are they?',
      'What support do they need?',
    ],
  },
  status: {
    title: 'Status Reporting',
    description: 'Communicate project progress to stakeholders.',
    tips: [
      'Be honest about red and amber status',
      'Focus on decisions needed, not just information',
      'Keep reports concise but complete',
      'Include next steps clearly',
    ],
    keyQuestions: [
      'Are we on track (schedule, budget, scope)?',
      'What did we achieve this period?',
      'What concerns need attention?',
      'What decisions are needed?',
    ],
  },
  lessons: {
    title: 'Lessons Learned',
    description: 'Capture insights to improve future projects.',
    tips: [
      'Capture lessons throughout, not just at closure',
      'Be specific about what happened and why',
      'Include what you would do differently',
      'Share lessons across the organization',
    ],
    keyQuestions: [
      'What went well?',
      'What could have gone better?',
      'What would you do differently?',
      'What should others know?',
    ],
  },
};

export default function GuidancePanel({
  isOpen,
  onClose,
  currentView,
  currentStage,
}) {
  // Get guidance for current context
  const guidance = useMemo(() => {
    // View-specific guidance takes precedence
    if (currentView && VIEW_GUIDANCE[currentView]) {
      return VIEW_GUIDANCE[currentView];
    }

    // Fall back to stage guidance
    if (currentStage && PROJECT_STAGE_INFO[currentStage.id]) {
      const stage = PROJECT_STAGE_INFO[currentStage.id];
      return {
        title: stage.name,
        description: stage.description,
        tips: stage.keyActivities || [],
        keyQuestions: [],
      };
    }

    // Default
    return VIEW_GUIDANCE.overview;
  }, [currentView, currentStage]);

  if (!isOpen) return null;

  return (
    <div className="guidance-panel-overlay" onClick={onClose}>
      <div className="guidance-panel" onClick={e => e.stopPropagation()}>
        <div className="guidance-panel-header">
          <div className="guidance-panel-title">
            <HelpOutlineIcon fontSize="small" />
            <span>{guidance.title}</span>
          </div>
          <button className="guidance-panel-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="guidance-panel-content">
          <p className="guidance-description">{guidance.description}</p>

          {guidance.tips?.length > 0 && (
            <div className="guidance-section">
              <h4>
                <TipsAndUpdatesIcon fontSize="small" />
                Tips
              </h4>
              <ul className="guidance-list">
                {guidance.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {guidance.keyQuestions?.length > 0 && (
            <div className="guidance-section">
              <h4>
                <LightbulbIcon fontSize="small" />
                Key Questions
              </h4>
              <ul className="guidance-list guidance-list--questions">
                {guidance.keyQuestions.map((question, i) => (
                  <li key={i}>{question}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
