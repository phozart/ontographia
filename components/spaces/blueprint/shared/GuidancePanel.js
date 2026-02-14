// components/spaces/blueprint/shared/GuidancePanel.js
// Contextual guidance panel for Blueprint Studio

import { useState, useMemo } from 'react';
import { useBlueprint, BPS_STAGE_INFO } from '../BlueprintContext';

// MUI Icons
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ChecklistIcon from '@mui/icons-material/Checklist';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Guidance content for each stage
const STAGE_GUIDANCE = {
  idea: {
    title: 'Idea Stage',
    description: 'Capture raw ideas quickly without overthinking. Focus on the problem being solved.',
    tips: [
      'Start with the problem, not the solution',
      'Keep descriptions brief but clear',
      'Tag the source to track where good ideas come from',
      'Include initial business context',
    ],
    checklist: [
      'Problem statement defined',
      'Source identified',
      'Initial category assigned',
    ],
    questions: [
      'What problem does this solve?',
      'Who experiences this problem?',
      'Why now?',
    ],
    nextStage: 'explore',
    nextAction: 'Add market context and validate the opportunity',
  },
  explore: {
    title: 'Explore Stage',
    description: 'Validate the opportunity through market research and competitive analysis.',
    tips: [
      'Use TAM/SAM/SOM to size the market',
      'Identify key competitors and alternatives',
      'Run PESTLE analysis for external factors',
      'Fill out the Opportunity Canvas',
    ],
    checklist: [
      'Market sizing complete (TAM/SAM/SOM)',
      'Competitor analysis done',
      'External factors assessed (PESTLE)',
      'Opportunity Canvas filled',
    ],
    questions: [
      'How big is this opportunity?',
      'Who else is solving this?',
      'What external factors could affect success?',
    ],
    nextStage: 'assess',
    nextAction: 'Score the initiative against strategic criteria',
  },
  assess: {
    title: 'Assess Stage',
    description: 'Evaluate the initiative against strategic criteria and assign a horizon.',
    tips: [
      'Score objectively using the criteria',
      'Consider strategic alignment carefully',
      'Assign the appropriate horizon (H1/H2/H3)',
      'Document your scoring rationale',
    ],
    checklist: [
      'All criteria scored',
      'Horizon assigned',
      'Kill criteria checked',
      'Recommendation made',
    ],
    questions: [
      'Does this align with strategy?',
      'What risks are we accepting?',
      'Which horizon does this fit?',
    ],
    nextStage: 'case',
    nextAction: 'Build the business case with financial projections',
  },
  case: {
    title: 'Case Stage',
    description: 'Build a compelling business case with financial projections and implementation plan.',
    tips: [
      'Include multiple options in your case',
      'Calculate NPV, IRR, and payback',
      'Be realistic about costs and timeline',
      'Identify a sponsor for approval',
    ],
    checklist: [
      'Options defined',
      'Financial projections complete',
      'Risks identified',
      'Sponsor assigned',
    ],
    questions: [
      'What is the ROI?',
      'What resources are needed?',
      'Who will sponsor this?',
    ],
    nextStage: 'approved',
    nextAction: 'Submit for approval and link to project delivery',
  },
  approved: {
    title: 'Approved',
    description: 'Initiative has been approved and is ready for implementation.',
    tips: [
      'Create the downstream project in PDS',
      'Allocate budget and resources',
      'Track benefits realization',
      'Schedule regular reviews',
    ],
    checklist: [
      'Project created',
      'Budget allocated',
      'Team assigned',
      'Benefits tracking set up',
    ],
    questions: [
      'Is the project on track?',
      'Are benefits being realized?',
      'Any scope changes needed?',
    ],
    nextStage: null,
    nextAction: 'Monitor implementation in Project Design Studio',
  },
};

// Guidance for views
const VIEW_GUIDANCE = {
  overview: {
    title: 'Dashboard Overview',
    description: 'Your innovation portfolio at a glance.',
    tips: [
      'Monitor funnel health regularly',
      'Watch for at-risk initiatives',
      'Track conversion rates between stages',
      'Balance your portfolio across horizons',
    ],
  },
  pipeline: {
    title: 'Pipeline View',
    description: 'Track all initiatives through the innovation funnel.',
    tips: [
      'Use kanban view for quick status overview',
      'Filter by horizon for portfolio analysis',
      'Sort by score to prioritize reviews',
      'Click initiatives to see details',
    ],
  },
  ideas: {
    title: 'Initiatives',
    description: 'Manage strategic initiatives and their product ideas.',
    tips: [
      'Process ideas regularly - don\'t let them pile up',
      'Ideas auto-advance after 48 hours if not triaged',
      'Group by source to identify productive channels',
      'Quick capture for rapid idea entry',
    ],
  },
  health: {
    title: 'Funnel Health',
    description: 'Monitor pipeline performance and conversion metrics.',
    tips: [
      'Aim for 80%+ health score',
      'Address SLA breaches promptly',
      'Track conversion rates between stages',
      'Act on kill criteria immediately',
    ],
  },
  market: {
    title: 'Market Intelligence',
    description: 'Research tools for opportunity validation.',
    tips: [
      'Complete TAM/SAM/SOM for market sizing',
      'Update competitor analysis regularly',
      'Review PESTLE factors quarterly',
      'Link insights to initiatives',
    ],
  },
};

export default function GuidancePanel({
  stage,
  view,
  onNavigate,
  collapsible = true,
  defaultCollapsed = false,
}) {
  const { activeInitiative } = useBlueprint();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [activeTab, setActiveTab] = useState('tips');

  // Get guidance content
  const guidance = useMemo(() => {
    if (stage && STAGE_GUIDANCE[stage]) {
      return STAGE_GUIDANCE[stage];
    }
    if (view && VIEW_GUIDANCE[view]) {
      return VIEW_GUIDANCE[view];
    }
    return null;
  }, [stage, view]);

  if (!guidance) return null;

  const isStageGuidance = !!STAGE_GUIDANCE[stage];

  return (
    <div className={`blueprint-guidance-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="blueprint-guidance-header" onClick={() => collapsible && setCollapsed(!collapsed)}>
        <div className="blueprint-guidance-header-left">
          <HelpOutlineIcon />
          <h4>{guidance.title}</h4>
        </div>
        {collapsible && (
          <button className="blueprint-guidance-toggle">
            {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="blueprint-guidance-content">
          <p className="blueprint-guidance-description">{guidance.description}</p>

          {isStageGuidance && (
            <div className="blueprint-guidance-tabs">
              <button
                className={`blueprint-guidance-tab ${activeTab === 'tips' ? 'active' : ''}`}
                onClick={() => setActiveTab('tips')}
              >
                <LightbulbIcon fontSize="small" />
                Tips
              </button>
              <button
                className={`blueprint-guidance-tab ${activeTab === 'checklist' ? 'active' : ''}`}
                onClick={() => setActiveTab('checklist')}
              >
                <ChecklistIcon fontSize="small" />
                Checklist
              </button>
              <button
                className={`blueprint-guidance-tab ${activeTab === 'questions' ? 'active' : ''}`}
                onClick={() => setActiveTab('questions')}
              >
                <TipsAndUpdatesIcon fontSize="small" />
                Questions
              </button>
            </div>
          )}

          {(activeTab === 'tips' || !isStageGuidance) && guidance.tips && (
            <ul className="blueprint-guidance-list blueprint-guidance-tips">
              {guidance.tips.map((tip, index) => (
                <li key={index}>
                  <LightbulbIcon fontSize="small" />
                  {tip}
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'checklist' && isStageGuidance && guidance.checklist && (
            <ul className="blueprint-guidance-list blueprint-guidance-checklist">
              {guidance.checklist.map((item, index) => (
                <li key={index}>
                  <ChecklistIcon fontSize="small" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'questions' && isStageGuidance && guidance.questions && (
            <ul className="blueprint-guidance-list blueprint-guidance-questions">
              {guidance.questions.map((question, index) => (
                <li key={index}>
                  <TipsAndUpdatesIcon fontSize="small" />
                  {question}
                </li>
              ))}
            </ul>
          )}

          {isStageGuidance && guidance.nextStage && (
            <div className="blueprint-guidance-next">
              <div className="blueprint-guidance-next-header">
                <ArrowForwardIcon fontSize="small" />
                <span>Next: {BPS_STAGE_INFO[guidance.nextStage]?.name}</span>
              </div>
              <p>{guidance.nextAction}</p>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => onNavigate?.(guidance.nextStage)}
              >
                Go to {BPS_STAGE_INFO[guidance.nextStage]?.name}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
