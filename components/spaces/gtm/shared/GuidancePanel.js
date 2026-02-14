// components/spaces/gtm/shared/GuidancePanel.js
// Contextual guidance panel for GTM Studio

import { useState } from 'react';
import { GTM_MODULES, GTM_STAGES } from '../GTMContext';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ChecklistIcon from '@mui/icons-material/Checklist';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Guidance content for each module
const GUIDANCE_CONTENT = {
  strategy: {
    title: 'Strategy Module',
    description: 'Define your market positioning, segments, and pricing strategy.',
    checklist: [
      'Define your unique value proposition',
      'Identify and prioritize target market segments',
      'Analyze competitive landscape',
      'Set pricing strategy and tiers',
      'Document differentiation points'
    ],
    tips: [
      'Focus on 2-3 primary segments initially',
      'Base pricing on value delivered, not just costs',
      'Update positioning as you learn from the market'
    ],
    bestPractices: [
      'Start with customer problems, not product features',
      'Validate positioning with actual customers',
      'Ensure pricing aligns with segment willingness to pay'
    ]
  },
  messaging: {
    title: 'Messaging Module',
    description: 'Create compelling messages for each audience and prepare for objections.',
    checklist: [
      'Create a message house framework',
      'Define key messages for each persona',
      'Document proof points and evidence',
      'Prepare objection handling guides',
      'Review and approve final messaging'
    ],
    tips: [
      'Use customer language, not internal jargon',
      'Back every claim with specific evidence',
      'Test messages with real prospects'
    ],
    bestPractices: [
      'Keep core message simple and memorable',
      'Tailor messages to buyer journey stage',
      'Practice objection responses with sales team'
    ]
  },
  launch: {
    title: 'Launch Module',
    description: 'Plan your launch timeline and track readiness across all dimensions.',
    checklist: [
      'Set target launch date',
      'Define launch milestones',
      'Complete readiness checklist',
      'Plan launch day activities',
      'Prepare contingency plans'
    ],
    tips: [
      'Build buffer time into your timeline',
      'Focus on readiness over perfect timing',
      'Have a clear go/no-go decision process'
    ],
    bestPractices: [
      'Align all teams on launch criteria',
      'Do a dry run before actual launch',
      'Document lessons for future launches'
    ]
  },
  campaigns: {
    title: 'Campaigns Module',
    description: 'Plan and execute marketing campaigns to drive awareness and leads.',
    checklist: [
      'Define campaign objectives and targets',
      'Allocate budget across channels',
      'Create campaign calendar',
      'Set up tracking and measurement',
      'Plan campaign assets and content'
    ],
    tips: [
      'Start with high-impact, low-effort campaigns',
      'Test messaging before scaling spend',
      'Monitor and adjust in real-time'
    ],
    bestPractices: [
      'Align campaigns with buyer journey',
      'Use consistent messaging across channels',
      'Build campaigns around key proof points'
    ]
  },
  enablement: {
    title: 'Enablement Module',
    description: 'Equip your teams with the materials and training they need.',
    checklist: [
      'Create sales presentation deck',
      'Build demo environment',
      'Develop battle cards vs competitors',
      'Plan and deliver sales training',
      'Create support knowledge base'
    ],
    tips: [
      'Involve sales in material development',
      'Keep materials up to date',
      'Gather feedback and iterate'
    ],
    bestPractices: [
      'Make materials easy to find and use',
      'Include real customer examples',
      'Create materials for each sales stage'
    ]
  },
  metrics: {
    title: 'Metrics Module',
    description: 'Track performance against targets and identify trends.',
    checklist: [
      'Define key GTM metrics',
      'Set realistic targets',
      'Set up tracking systems',
      'Create regular reporting cadence',
      'Plan for metric reviews'
    ],
    tips: [
      'Focus on leading indicators',
      'Track cohorts, not just totals',
      'Compare against benchmarks'
    ],
    bestPractices: [
      'Align metrics with business outcomes',
      'Make data accessible to all stakeholders',
      'Use metrics to drive decisions, not just report'
    ]
  }
};

// Stage-specific guidance
const STAGE_GUIDANCE = {
  draft: {
    focus: 'Getting started',
    actions: [
      'Define your product/service offering',
      'Identify target launch timeframe',
      'Assemble your GTM team'
    ]
  },
  planning: {
    focus: 'Building the foundation',
    actions: [
      'Complete strategy module',
      'Develop core messaging',
      'Create campaign plans'
    ]
  },
  ready: {
    focus: 'Final preparations',
    actions: [
      'Complete all readiness criteria',
      'Finalize materials and training',
      'Conduct launch rehearsal'
    ]
  },
  active: {
    focus: 'Executing the launch',
    actions: [
      'Monitor campaign performance',
      'Track against targets',
      'Gather early feedback'
    ]
  },
  complete: {
    focus: 'Learning and iterating',
    actions: [
      'Analyze results vs targets',
      'Document lessons learned',
      'Plan next iteration'
    ]
  }
};

export default function GuidancePanel({ module, stage, isCollapsed, onToggle }) {
  const [expandedSection, setExpandedSection] = useState('checklist');

  const moduleGuidance = GUIDANCE_CONTENT[module] || GUIDANCE_CONTENT.strategy;
  const stageGuidance = STAGE_GUIDANCE[stage] || STAGE_GUIDANCE.draft;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (isCollapsed) {
    return (
      <div className="gtm-guidance-collapsed" onClick={onToggle}>
        <HelpOutlineIcon />
      </div>
    );
  }

  return (
    <div className="gtm-guidance-panel">
      <div className="gtm-guidance-header">
        <HelpOutlineIcon />
        <h3>Guidance</h3>
        <button className="gtm-guidance-close" onClick={onToggle}>
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {/* Stage Context */}
      <div className="gtm-guidance-stage">
        <span className="gtm-stage-label">Current Stage:</span>
        <span
          className="gtm-stage-badge"
          style={{ backgroundColor: GTM_STAGES[stage]?.color }}
        >
          {GTM_STAGES[stage]?.name || 'Draft'}
        </span>
        <p className="gtm-stage-focus">Focus: {stageGuidance.focus}</p>
      </div>

      {/* Module Overview */}
      <div className="gtm-guidance-module">
        <h4>{moduleGuidance.title}</h4>
        <p>{moduleGuidance.description}</p>
      </div>

      {/* Checklist Section */}
      <div className="gtm-guidance-section">
        <div
          className="gtm-guidance-section-header"
          onClick={() => toggleSection('checklist')}
        >
          <ChecklistIcon fontSize="small" />
          <span>Checklist</span>
          {expandedSection === 'checklist' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </div>
        {expandedSection === 'checklist' && (
          <ul className="gtm-guidance-list">
            {moduleGuidance.checklist.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Tips Section */}
      <div className="gtm-guidance-section">
        <div
          className="gtm-guidance-section-header"
          onClick={() => toggleSection('tips')}
        >
          <LightbulbIcon fontSize="small" />
          <span>Tips</span>
          {expandedSection === 'tips' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </div>
        {expandedSection === 'tips' && (
          <ul className="gtm-guidance-list tips">
            {moduleGuidance.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Best Practices Section */}
      <div className="gtm-guidance-section">
        <div
          className="gtm-guidance-section-header"
          onClick={() => toggleSection('practices')}
        >
          <TipsAndUpdatesIcon fontSize="small" />
          <span>Best Practices</span>
          {expandedSection === 'practices' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </div>
        {expandedSection === 'practices' && (
          <ul className="gtm-guidance-list practices">
            {moduleGuidance.bestPractices.map((practice, i) => (
              <li key={i}>{practice}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Stage Actions */}
      <div className="gtm-guidance-actions">
        <h4>Recommended Actions</h4>
        <ul>
          {stageGuidance.actions.map((action, i) => (
            <li key={i}>{action}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
