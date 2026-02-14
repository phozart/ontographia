// components/spaces/analysis/shared/GuidancePanel.js
// Contextual guidance panel for Analysis Studio modules

import { useState, useMemo } from 'react';
import { ANALYSIS_MODULES, ANALYSIS_ARTEFACT_TYPES } from '../AnalysisContext';
import { BA_CONCEPTS } from '../../ba/BAContext';

// MUI Icons
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import BookIcon from '@mui/icons-material/Book';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Module-specific guidance content
const MODULE_GUIDANCE = {
  requirements: {
    title: 'Requirements Module',
    overview: 'Capture, organize, and manage requirements at multiple levels: Business, Stakeholder, and Solution requirements.',
    keyActivities: [
      'Identify business needs and objectives',
      'Capture stakeholder requirements by role',
      'Define functional and non-functional solution requirements',
      'Document business rules and constraints',
      'Create use cases for key interactions'
    ],
    bestPractices: [
      'Start with business requirements before diving into solution details',
      'Ensure each requirement is testable and measurable',
      'Link stakeholder requirements to the people who have them',
      'Distinguish between MUST HAVE and NICE TO HAVE requirements'
    ],
    commonMistakes: [
      'Writing solutions disguised as requirements',
      'Using vague terms like "fast" or "user-friendly" without metrics',
      'Skipping business requirements and jumping to features',
      'Not linking requirements to their sources'
    ],
    resources: [
      { title: 'BABOK Guide', type: 'book', description: 'Business Analysis Body of Knowledge' },
      { title: 'Requirements Patterns', type: 'article', description: 'Common requirement types and formats' }
    ]
  },
  stories: {
    title: 'User Stories Module',
    overview: 'Plan delivery through a hierarchy of Epics, Features, and User Stories with acceptance criteria.',
    keyActivities: [
      'Create Epics that implement business requirements',
      'Break Epics into deliverable Features',
      'Write User Stories with Given/When/Then criteria',
      'Prioritize and sequence for delivery'
    ],
    bestPractices: [
      'Epics should implement Business Requirements',
      'Features should realise Stakeholder/Solution Requirements',
      'Stories should be small enough to complete in one sprint',
      'Acceptance criteria should be derived from requirements'
    ],
    commonMistakes: [
      'Writing stories without linking to requirements',
      'Stories that are too large or too vague',
      'Missing acceptance criteria',
      'Technical tasks masquerading as user stories'
    ],
    resources: [
      { title: 'User Story Mapping', type: 'book', description: 'Jeff Patton\'s approach to user stories' },
      { title: 'INVEST Criteria', type: 'article', description: 'Good story characteristics' }
    ]
  },
  architecture: {
    title: 'Architecture Module',
    overview: 'Document architecture decisions, define solution components, and record technology choices.',
    keyActivities: [
      'Document significant architecture decisions (ADRs)',
      'Define solution components and their interactions',
      'Record technology selection rationale',
      'Maintain architecture principles'
    ],
    bestPractices: [
      'Document decisions when they\'re made, not after',
      'Include context, decision, and consequences in ADRs',
      'Record alternatives considered, even if rejected',
      'Link architecture decisions to requirements they address'
    ],
    commonMistakes: [
      'Not documenting decisions until it\'s too late',
      'Omitting the "why" behind decisions',
      'Ignoring consequences and trade-offs',
      'Not revisiting decisions when context changes'
    ],
    resources: [
      { title: 'Architecture Decision Records', type: 'article', description: 'ADR best practices' },
      { title: 'C4 Model', type: 'guide', description: 'Visualizing software architecture' }
    ]
  },
  design: {
    title: 'UX/UI Design Module',
    overview: 'Define user personas, map user journeys, and create wireframes that bring requirements to life.',
    keyActivities: [
      'Create personas representing key user types',
      'Map user journeys with emotions and pain points',
      'Design wireframes for key screens and flows',
      'Document design decisions and patterns'
    ],
    bestPractices: [
      'Base personas on real user research when possible',
      'Map journeys from the user\'s perspective, not the system\'s',
      'Start with low-fidelity wireframes before detailed mockups',
      'Link wireframes to requirements they address'
    ],
    commonMistakes: [
      'Creating too many or too few personas',
      'Journeys that focus on system actions rather than user goals',
      'Jumping to high-fidelity designs too early',
      'Not testing designs with real users'
    ],
    resources: [
      { title: 'Don\'t Make Me Think', type: 'book', description: 'Steve Krug on usability' },
      { title: 'Jobs to be Done', type: 'framework', description: 'Understanding user motivation' }
    ]
  },
  stakeholders: {
    title: 'Stakeholders Module',
    overview: 'Identify, analyze, and manage stakeholders using influence/interest analysis.',
    keyActivities: [
      'Identify all stakeholders affected by the project',
      'Assess influence and interest levels',
      'Develop engagement strategies by quadrant',
      'Track stakeholder concerns and expectations'
    ],
    bestPractices: [
      'Include both internal and external stakeholders',
      'Revisit stakeholder analysis as the project evolves',
      'Tailor communication to stakeholder needs',
      'Address key player concerns proactively'
    ],
    commonMistakes: [
      'Missing important stakeholders',
      'Treating all stakeholders the same',
      'Not updating stakeholder analysis over time',
      'Ignoring low-power high-interest stakeholders'
    ],
    resources: [
      { title: 'Power/Interest Grid', type: 'tool', description: 'Stakeholder prioritization' },
      { title: 'Stakeholder Engagement', type: 'guide', description: 'Communication strategies' }
    ]
  },
  traceability: {
    title: 'Traceability Module',
    overview: 'Track relationships between artefacts and analyze coverage and impact.',
    keyActivities: [
      'Link requirements to their sources and implementations',
      'Verify coverage of requirements by stories',
      'Analyze impact of proposed changes',
      'Identify gaps in the analysis'
    ],
    bestPractices: [
      'Establish trace links as you create artefacts',
      'Use standard relationship types consistently',
      'Review coverage regularly during analysis',
      'Investigate orphan artefacts with no links'
    ],
    commonMistakes: [
      'Creating artefacts without establishing relationships',
      'Inconsistent use of relationship types',
      'Not reviewing traceability until the end',
      'Ignoring impact analysis for changes'
    ],
    resources: [
      { title: 'Requirements Traceability', type: 'article', description: 'Best practices for tracing' },
      { title: 'Impact Analysis', type: 'guide', description: 'Assessing change impact' }
    ]
  }
};

// Quick tip for getting started
function QuickTip({ tip }) {
  return (
    <div className="guidance-quick-tip">
      <TipsAndUpdatesIcon style={{ color: '#f59e0b' }} />
      <p>{tip}</p>
    </div>
  );
}

// Expandable section
function GuidanceSection({ title, icon: Icon, children, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`guidance-section ${expanded ? 'expanded' : ''}`}>
      <button
        className="guidance-section-header"
        onClick={() => setExpanded(!expanded)}
      >
        <Icon fontSize="small" />
        <span>{title}</span>
        {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
      </button>
      {expanded && (
        <div className="guidance-section-content">
          {children}
        </div>
      )}
    </div>
  );
}

// Checklist item
function ChecklistItem({ checked, children }) {
  return (
    <li className={`checklist-item ${checked ? 'checked' : ''}`}>
      {checked ? (
        <CheckCircleIcon fontSize="small" style={{ color: '#10b981' }} />
      ) : (
        <span className="checklist-bullet" />
      )}
      <span>{children}</span>
    </li>
  );
}

// Resource link
function ResourceLink({ resource }) {
  const icons = {
    book: BookIcon,
    article: SchoolIcon,
    guide: LightbulbIcon,
    framework: SchoolIcon,
    tool: HelpOutlineIcon,
    video: PlayCircleIcon
  };

  const Icon = icons[resource.type] || BookIcon;

  return (
    <a href="#" className="resource-link">
      <Icon fontSize="small" />
      <div>
        <span className="resource-title">{resource.title}</span>
        <span className="resource-description">{resource.description}</span>
      </div>
    </a>
  );
}

// Main Guidance Panel
export default function GuidancePanel({ module }) {
  const guidance = MODULE_GUIDANCE[module] || MODULE_GUIDANCE.requirements;
  const moduleInfo = ANALYSIS_MODULES[module];

  // Quick tips that rotate
  const quickTips = useMemo(() => {
    const tips = [
      ...(guidance.bestPractices || []),
      'Use traceability to ensure requirements are covered',
      'Link analysis artefacts to strategic initiatives',
      'Review completeness score regularly'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }, [guidance, module]);

  return (
    <div className="guidance-panel">
      <div className="guidance-header">
        <HelpOutlineIcon />
        <div>
          <h3>{guidance.title}</h3>
          <p>{guidance.overview}</p>
        </div>
      </div>

      <QuickTip tip={quickTips} />

      <GuidanceSection title="Key Activities" icon={CheckCircleIcon} defaultExpanded>
        <ul className="guidance-list">
          {guidance.keyActivities?.map((activity, i) => (
            <li key={i}>{activity}</li>
          ))}
        </ul>
      </GuidanceSection>

      <GuidanceSection title="Best Practices" icon={LightbulbIcon}>
        <ul className="guidance-list best-practices">
          {guidance.bestPractices?.map((practice, i) => (
            <li key={i}>{practice}</li>
          ))}
        </ul>
      </GuidanceSection>

      <GuidanceSection title="Common Mistakes" icon={WarningIcon}>
        <ul className="guidance-list mistakes">
          {guidance.commonMistakes?.map((mistake, i) => (
            <li key={i}>{mistake}</li>
          ))}
        </ul>
      </GuidanceSection>

      {guidance.resources?.length > 0 && (
        <GuidanceSection title="Learn More" icon={BookIcon}>
          <div className="guidance-resources">
            {guidance.resources.map((resource, i) => (
              <ResourceLink key={i} resource={resource} />
            ))}
          </div>
        </GuidanceSection>
      )}

      {/* Artefact Type Quick Reference */}
      {moduleInfo?.artefactTypes?.length > 0 && (
        <div className="guidance-artefact-types">
          <h4>Artefact Types in this Module</h4>
          <div className="artefact-type-list">
            {moduleInfo.artefactTypes.map(typeId => {
              const type = ANALYSIS_ARTEFACT_TYPES[typeId];
              const concept = BA_CONCEPTS[typeId];

              return (
                <div key={typeId} className="artefact-type-info">
                  <span className="type-icon" style={{ backgroundColor: type?.color }}>
                    {type?.icon}
                  </span>
                  <div>
                    <span className="type-name">{type?.name}</span>
                    {concept?.shortHelp && (
                      <span className="type-help">{concept.shortHelp}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { QuickTip, GuidanceSection, ChecklistItem, ResourceLink, MODULE_GUIDANCE };
