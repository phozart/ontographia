// components/dwd/views/WorkActorFit.js
// DWD Work-Actor Fit View - Actors and what they touch, authority mapping
// Includes comprehensive guidance on actors, authority, and fit assessment

import { useState, useMemo } from 'react';
import { useDWD } from '../DWDContext';
import DWDArtefactCard from '../artefacts/DWDArtefactCard';

// MUI Icons
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ComputerIcon from '@mui/icons-material/Computer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import InfoIcon from '@mui/icons-material/Info';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LinkIcon from '@mui/icons-material/Link';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ACTOR_ICONS = {
  person: PersonIcon,
  team: GroupIcon,
  system: ComputerIcon,
};

// Work-Actor Fit guidance content
const WORK_ACTOR_FIT_GUIDANCE = {
  purpose: "Work-Actor Fit analyzes who handles what work and whether they have appropriate authority. Good fit means actors have the skills, information, and decision authority needed for their work.",
  whatIsActor: {
    description: "An actor is anyone or anything that performs work. This includes individual people, teams, and automated systems.",
    types: [
      { type: "Person", description: "Individual worker with specific role and skills", icon: "PersonIcon", examples: ["Customer service rep", "Sales manager", "Developer"] },
      { type: "Team", description: "Group that collaborates on work together", icon: "GroupIcon", examples: ["Support team", "Product squad", "Operations"] },
      { type: "System", description: "Automated system or tool that performs work", icon: "ComputerIcon", examples: ["CRM system", "Payment processor", "Email system"] }
    ]
  },
  authority: {
    description: "Authority is the level of decision-making power an actor has over their work. The right level depends on work volatility.",
    levels: [
      {
        level: "High Authority",
        color: "#10b981",
        description: "Can make significant decisions independently without approval",
        examples: ["Change process", "Approve exceptions", "Commit resources"],
        bestFor: "High volatility work requiring rapid, contextual decisions"
      },
      {
        level: "Medium Authority",
        color: "#f59e0b",
        description: "Can make routine decisions within defined guidelines",
        examples: ["Handle standard cases", "Small exceptions", "Escalate edge cases"],
        bestFor: "Medium volatility work with some variability"
      },
      {
        level: "Low Authority",
        color: "#ef4444",
        description: "Must follow defined procedures, escalate decisions",
        examples: ["Follow scripts", "Apply rules", "Request approval"],
        bestFor: "Low volatility, predictable work with standard procedures"
      }
    ]
  },
  fitAnalysis: {
    description: "Fit analysis checks if actor capabilities match work requirements. Mismatches cause problems.",
    goodFit: [
      "Authority level matches work volatility",
      "Actor has skills needed for the work",
      "Actor has access to required information",
      "Workload is manageable (not overloaded)",
      "Clear handoff points with other actors"
    ],
    mismatches: [
      { name: "Authority Mismatch", description: "High volatility work with low authority actor - can't respond quickly", signal: "Delays, escalations, workarounds" },
      { name: "Skill Mismatch", description: "Actor lacks skills for the work complexity", signal: "Errors, rework, slow completion" },
      { name: "Overload", description: "Actor handles too many different work types", signal: "Backlogs, burnout, quality drops" },
      { name: "Information Gap", description: "Actor lacks information needed to decide", signal: "Delays waiting for info, wrong decisions" },
      { name: "Coordination Failure", description: "Handoffs between actors break down", signal: "Dropped items, miscommunication" }
    ]
  },
  connectingActors: {
    description: "Connect actors to work items to show who handles what. This reveals the work distribution and potential issues.",
    howTo: [
      "Create actors for each person, team, or system that performs work",
      "Link each actor to the work items they touch",
      "Review the connections for potential mismatches",
      "Look for actors with too many connections (overload)",
      "Check authority vs volatility alignment"
    ]
  },
  tips: [
    "High volatility work needs actors with high authority to decide quickly",
    "Low volatility work can use standardized processes with lower authority",
    "An actor touching many items may be overloaded or a coordination hub",
    "Systems (automation) work best for low volatility, predictable work",
    "Teams may be better than individuals for high variability work"
  ],
  pitfalls: [
    "Giving low authority to actors handling high volatility work",
    "Overloading key actors with too many work types",
    "Not considering information access when assigning work",
    "Assuming all work needs human actors (some can be automated)",
    "Ignoring handoff quality between actors"
  ]
};

// Guidance panel component
function GuidancePanel({ onClose, initialSection = 'purpose' }) {
  const [expandedSection, setExpandedSection] = useState(initialSection);

  return (
    <div className="dwd-guidance-panel">
      <div className="dwd-guidance-panel__header">
        <div className="dwd-guidance-panel__title">
          <LightbulbIcon />
          <span>Work-Actor Fit Guide</span>
        </div>
        <button className="dwd-guidance-panel__close" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </button>
      </div>

      <div className="dwd-guidance-panel__content">
        {/* Purpose */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'purpose' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'purpose' ? null : 'purpose')}
          >
            <span>What is Work-Actor Fit?</span>
            <ChevronRightIcon className={expandedSection === 'purpose' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'purpose' && (
            <div className="dwd-guidance-section__body">
              <p>{WORK_ACTOR_FIT_GUIDANCE.purpose}</p>
            </div>
          )}
        </div>

        {/* What is an Actor */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'actors' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'actors' ? null : 'actors')}
          >
            <span>What is an Actor?</span>
            <ChevronRightIcon className={expandedSection === 'actors' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'actors' && (
            <div className="dwd-guidance-section__body">
              <p>{WORK_ACTOR_FIT_GUIDANCE.whatIsActor.description}</p>
              <div className="dwd-actor-types-guide">
                {WORK_ACTOR_FIT_GUIDANCE.whatIsActor.types.map((type, i) => (
                  <div key={i} className="dwd-actor-type-item">
                    <div className="dwd-actor-type-item__header">
                      {type.type === 'Person' && <PersonIcon />}
                      {type.type === 'Team' && <GroupIcon />}
                      {type.type === 'System' && <ComputerIcon />}
                      <strong>{type.type}</strong>
                    </div>
                    <p>{type.description}</p>
                    <span className="dwd-actor-type-item__examples">
                      e.g., {type.examples.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Authority Levels */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'authority' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'authority' ? null : 'authority')}
          >
            <span>Understanding Authority</span>
            <ChevronRightIcon className={expandedSection === 'authority' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'authority' && (
            <div className="dwd-guidance-section__body">
              <p>{WORK_ACTOR_FIT_GUIDANCE.authority.description}</p>
              {WORK_ACTOR_FIT_GUIDANCE.authority.levels.map((level, i) => (
                <div key={i} className="dwd-authority-level" style={{ borderLeftColor: level.color }}>
                  <h5 style={{ color: level.color }}>
                    <AdminPanelSettingsIcon fontSize="small" />
                    {level.level}
                  </h5>
                  <p>{level.description}</p>
                  <div className="dwd-authority-details">
                    <div><strong>Examples:</strong> {level.examples.join(', ')}</div>
                    <div><strong>Best for:</strong> {level.bestFor}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fit Analysis */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'fit' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'fit' ? null : 'fit')}
          >
            <span>Analyzing Fit</span>
            <ChevronRightIcon className={expandedSection === 'fit' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'fit' && (
            <div className="dwd-guidance-section__body">
              <p>{WORK_ACTOR_FIT_GUIDANCE.fitAnalysis.description}</p>
              <h5><CheckCircleIcon style={{ color: '#22c55e' }} /> Good Fit Indicators</h5>
              <ul>
                {WORK_ACTOR_FIT_GUIDANCE.fitAnalysis.goodFit.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <h5 style={{ marginTop: 16 }}><WarningIcon style={{ color: '#ef4444' }} /> Common Mismatches</h5>
              <div className="dwd-mismatch-list">
                {WORK_ACTOR_FIT_GUIDANCE.fitAnalysis.mismatches.map((m, i) => (
                  <div key={i} className="dwd-mismatch-item">
                    <strong>{m.name}</strong>
                    <p>{m.description}</p>
                    <span className="dwd-mismatch-signal">
                      <InfoIcon fontSize="small" /> Signal: {m.signal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* How to Connect */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'connect' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'connect' ? null : 'connect')}
          >
            <span>Connecting Actors to Work</span>
            <ChevronRightIcon className={expandedSection === 'connect' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'connect' && (
            <div className="dwd-guidance-section__body">
              <p>{WORK_ACTOR_FIT_GUIDANCE.connectingActors.description}</p>
              <ol className="dwd-guidance-steps">
                {WORK_ACTOR_FIT_GUIDANCE.connectingActors.howTo.map((step, i) => (
                  <li key={i}>
                    <span className="step-number">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Tips & Pitfalls */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'tips' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'tips' ? null : 'tips')}
          >
            <span>Tips & Pitfalls</span>
            <ChevronRightIcon className={expandedSection === 'tips' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'tips' && (
            <div className="dwd-guidance-section__body">
              <div className="dwd-tips-donts">
                <div className="dwd-tips">
                  <h5><CheckCircleIcon style={{ color: '#22c55e' }} /> Best Practices</h5>
                  <ul>
                    {WORK_ACTOR_FIT_GUIDANCE.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="dwd-donts">
                  <h5><CancelIcon style={{ color: '#ef4444' }} /> Common Mistakes</h5>
                  <ul>
                    {WORK_ACTOR_FIT_GUIDANCE.pitfalls.map((pitfall, i) => (
                      <li key={i}>{pitfall}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Quick start card for empty states
function QuickStartCard({ onCreate }) {
  return (
    <div className="dwd-quickstart">
      <div className="dwd-quickstart__header">
        <TipsAndUpdatesIcon />
        <h3>Mapping Work-Actor Fit</h3>
      </div>
      <p className="dwd-quickstart__description">
        Actors are the people, teams, and systems that perform work. Analyzing fit helps you understand
        if the right actors are handling the right work with appropriate authority.
      </p>
      <div className="dwd-quickstart__flow">
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">1</span>
          <span>Identify all actors who perform work</span>
        </div>
        <ArrowForwardIcon className="dwd-quickstart__arrow" />
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">2</span>
          <span>Assign authority level to each</span>
        </div>
        <ArrowForwardIcon className="dwd-quickstart__arrow" />
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">3</span>
          <span>Link actors to work items</span>
        </div>
        <ArrowForwardIcon className="dwd-quickstart__arrow" />
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">4</span>
          <span>Review for fit issues</span>
        </div>
      </div>
      <div className="dwd-quickstart__authority-hint">
        <h4>Authority + Volatility Match:</h4>
        <div className="dwd-quickstart__match-guide">
          <div className="dwd-quickstart__match-row">
            <span style={{ color: '#ef4444' }}>High Volatility Work</span>
            <ArrowForwardIcon fontSize="small" />
            <span style={{ color: '#10b981' }}>High Authority Actor</span>
            <CheckCircleIcon style={{ color: '#22c55e' }} fontSize="small" />
          </div>
          <div className="dwd-quickstart__match-row">
            <span style={{ color: '#f59e0b' }}>Medium Volatility Work</span>
            <ArrowForwardIcon fontSize="small" />
            <span style={{ color: '#f59e0b' }}>Medium Authority Actor</span>
            <CheckCircleIcon style={{ color: '#22c55e' }} fontSize="small" />
          </div>
          <div className="dwd-quickstart__match-row">
            <span style={{ color: '#10b981' }}>Low Volatility Work</span>
            <ArrowForwardIcon fontSize="small" />
            <span style={{ color: '#ef4444' }}>Low Authority OK</span>
            <CheckCircleIcon style={{ color: '#22c55e' }} fontSize="small" />
          </div>
        </div>
      </div>
      <div className="dwd-quickstart__actions">
        <button className="btn btn--primary" onClick={() => onCreate?.('dwd_actor')}>
          <AddIcon fontSize="small" />
          Add Your First Actor
        </button>
      </div>
    </div>
  );
}

export default function WorkActorFit({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const {
    artefacts,
    relationships,
    getArtefactsByType,
    activeCase,
    getCaseArtefacts,
    getRelated,
    DWD_ACTOR_TYPES,
    DWD_AUTHORITY_LEVELS,
  } = useDWD();

  const [searchTerm, setSearchTerm] = useState('');
  const [actorTypeFilter, setActorTypeFilter] = useState('all');
  const [authorityFilter, setAuthorityFilter] = useState('all');
  const [showGuidance, setShowGuidance] = useState(false);

  // Get actors (filtered by active case if set)
  const actors = useMemo(() => {
    const items = activeCase
      ? getCaseArtefacts().filter(a => a.artefact_type === 'dwd_actor')
      : getArtefactsByType('dwd_actor');

    return items.filter(actor => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!actor.name.toLowerCase().includes(search)) {
          return false;
        }
      }

      if (actorTypeFilter !== 'all') {
        const actorType = actor.custom_fields?.actor_type || 'person';
        if (actorType !== actorTypeFilter) return false;
      }

      if (authorityFilter !== 'all') {
        const authority = actor.custom_fields?.authority_level || 'medium';
        if (authority !== authorityFilter) return false;
      }

      return true;
    });
  }, [activeCase, getCaseArtefacts, getArtefactsByType, searchTerm, actorTypeFilter, authorityFilter]);

  // Get work items
  const workItems = useMemo(() => {
    return activeCase
      ? getCaseArtefacts().filter(a => a.artefact_type === 'dwd_work_item')
      : getArtefactsByType('dwd_work_item');
  }, [activeCase, getCaseArtefacts, getArtefactsByType]);

  // Build actor-work item relationships
  const actorWorkMap = useMemo(() => {
    const map = new Map();

    actors.forEach(actor => {
      const rels = getRelated(actor.id);
      const touchedWorkItems = rels
        .map(rel => {
          const otherId = rel.from_artefact_id === actor.id ? rel.to_artefact_id : rel.from_artefact_id;
          return artefacts.find(a => a.id === otherId && a.artefact_type === 'dwd_work_item');
        })
        .filter(Boolean);

      map.set(actor.id, touchedWorkItems);
    });

    return map;
  }, [actors, artefacts, getRelated]);

  // Detect overload (actors touching many items with low authority)
  const overloadWarnings = useMemo(() => {
    const warnings = [];

    actors.forEach(actor => {
      const touchedItems = actorWorkMap.get(actor.id) || [];
      const authority = actor.custom_fields?.authority_level || 'medium';

      // Heuristic: touching 3+ items with low authority = potential overload
      if (touchedItems.length >= 3 && authority === 'low') {
        warnings.push({
          actorId: actor.id,
          actorName: actor.name,
          type: 'overload_low_authority',
          message: `${actor.name} touches ${touchedItems.length} work items but has low authority`,
          severity: 'medium',
        });
      }

      // High volatility items + low authority
      const highVolItems = touchedItems.filter(i => i.custom_fields?.volatility === 'high');
      if (highVolItems.length > 0 && authority === 'low') {
        warnings.push({
          actorId: actor.id,
          actorName: actor.name,
          type: 'high_vol_low_auth',
          message: `${actor.name} handles high-volatility work with low authority`,
          severity: 'high',
        });
      }

      // Too many items (overload)
      if (touchedItems.length >= 5) {
        warnings.push({
          actorId: actor.id,
          actorName: actor.name,
          type: 'overload',
          message: `${actor.name} is connected to ${touchedItems.length} work items (potential overload)`,
          severity: 'medium',
        });
      }
    });

    return warnings;
  }, [actors, actorWorkMap]);

  // Stats
  const stats = useMemo(() => ({
    total: actors.length,
    byType: {
      person: actors.filter(a => a.custom_fields?.actor_type === 'person' || !a.custom_fields?.actor_type).length,
      team: actors.filter(a => a.custom_fields?.actor_type === 'team').length,
      system: actors.filter(a => a.custom_fields?.actor_type === 'system').length,
    },
    lowAuthority: actors.filter(a => a.custom_fields?.authority_level === 'low').length,
    warnings: overloadWarnings.length,
    highSeverity: overloadWarnings.filter(w => w.severity === 'high').length,
  }), [actors, overloadWarnings]);

  const isEmpty = actors.length === 0 && !searchTerm && actorTypeFilter === 'all';

  return (
    <div className="dwd-work-actor-fit">
      {/* Guidance Panel */}
      {showGuidance && (
        <GuidancePanel onClose={() => setShowGuidance(false)} />
      )}

      {/* Header */}
      <div className="dwd-view-header">
        <div className="dwd-view-header__left">
          <h2>Work-Actor Fit</h2>
          <p>Analyze who handles what work and whether they have appropriate authority</p>
        </div>

        <div className="dwd-view-stats">
          <span className="dwd-view-stat">
            <PersonIcon fontSize="small" />
            {stats.total} actors
          </span>
          <span className="dwd-view-stat">
            {stats.byType.person} people
          </span>
          <span className="dwd-view-stat">
            {stats.byType.team} teams
          </span>
          {stats.byType.system > 0 && (
            <span className="dwd-view-stat">
              {stats.byType.system} systems
            </span>
          )}
          {stats.warnings > 0 && (
            <span className="dwd-view-stat dwd-view-stat--warning">
              <WarningIcon fontSize="small" />
              {stats.warnings} issues
              {stats.highSeverity > 0 && ` (${stats.highSeverity} critical)`}
            </span>
          )}
        </div>
      </div>

      <div className="dwd-view-actions">
        {/* Search */}
        <div className="dwd-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            placeholder="Search actors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <select
          className="dwd-filter-select"
          value={actorTypeFilter}
          onChange={(e) => setActorTypeFilter(e.target.value)}
        >
          <option value="all">All types</option>
          {DWD_ACTOR_TYPES?.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          className="dwd-filter-select"
          value={authorityFilter}
          onChange={(e) => setAuthorityFilter(e.target.value)}
        >
          <option value="all">All authority</option>
          {DWD_AUTHORITY_LEVELS?.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>

        {/* Help button */}
        <button
          className="btn btn--ghost btn--small"
          onClick={() => setShowGuidance(true)}
        >
          <HelpIcon fontSize="small" />
          How to use
        </button>

        <button
          className="btn btn--primary btn--small"
          onClick={() => onCreateArtefact?.('dwd_actor')}
        >
          <AddIcon fontSize="small" />
          Add Actor
        </button>
      </div>

      {/* Empty State */}
      {isEmpty && <QuickStartCard onCreate={onCreateArtefact} />}

      {/* Warnings Panel */}
      {!isEmpty && overloadWarnings.length > 0 && (
        <div className="dwd-warnings-panel">
          <div className="dwd-warnings-panel__header">
            <h4>
              <ErrorOutlineIcon fontSize="small" />
              Potential Fit Issues Detected
            </h4>
            <span className="dwd-warnings-panel__count">
              {stats.highSeverity > 0 && (
                <span style={{ color: '#ef4444' }}>{stats.highSeverity} critical</span>
              )}
              {stats.warnings - stats.highSeverity > 0 && (
                <span style={{ color: '#f59e0b' }}>{stats.warnings - stats.highSeverity} warnings</span>
              )}
            </span>
          </div>
          <div className="dwd-warnings-list">
            {overloadWarnings.map((warning, idx) => (
              <div
                key={idx}
                className={`dwd-warning-item dwd-warning-item--${warning.severity}`}
              >
                {warning.severity === 'high' ? (
                  <ErrorOutlineIcon fontSize="small" style={{ color: '#ef4444' }} />
                ) : (
                  <WarningIcon fontSize="small" style={{ color: '#f59e0b' }} />
                )}
                <span>{warning.message}</span>
                <div className="dwd-warning-item__hint">
                  {warning.type === 'high_vol_low_auth' && (
                    <span>Consider increasing authority or reassigning to actor with higher authority</span>
                  )}
                  {warning.type === 'overload' && (
                    <span>Review if this actor is a bottleneck or legitimate coordination hub</span>
                  )}
                  {warning.type === 'overload_low_authority' && (
                    <span>Low authority with many work types may cause delays and escalations</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actor Cards with Work Items */}
      {!isEmpty && (
        <div className="dwd-actor-grid">
          {actors.map(actor => {
            const touchedItems = actorWorkMap.get(actor.id) || [];
            const Icon = ACTOR_ICONS[actor.custom_fields?.actor_type] || PersonIcon;
            const authority = actor.custom_fields?.authority_level || 'medium';
            const authorityColors = { low: '#ef4444', medium: '#f59e0b', high: '#10b981' };
            const hasWarning = overloadWarnings.some(w => w.actorId === actor.id);
            const hasCritical = overloadWarnings.some(w => w.actorId === actor.id && w.severity === 'high');

            return (
              <div
                key={actor.id}
                className={`dwd-actor-card ${hasWarning ? 'dwd-actor-card--warning' : ''} ${hasCritical ? 'dwd-actor-card--critical' : ''}`}
              >
                <div className="dwd-actor-card__header">
                  <div className="dwd-actor-card__icon">
                    <Icon />
                  </div>
                  <div className="dwd-actor-card__info">
                    <h4>{actor.name}</h4>
                    <span className="dwd-actor-card__type">
                      {actor.custom_fields?.actor_type || 'person'}
                    </span>
                  </div>
                  <span
                    className="dwd-actor-card__authority"
                    style={{ backgroundColor: authorityColors[authority] }}
                    title={`${authority} authority - ${
                      authority === 'high' ? 'Can make significant decisions independently' :
                      authority === 'medium' ? 'Can make routine decisions within guidelines' :
                      'Must follow procedures, escalate decisions'
                    }`}
                  >
                    {authority}
                  </span>
                </div>

                {actor.custom_fields?.constraints && (
                  <p className="dwd-actor-card__constraints">
                    <strong>Constraints:</strong> {actor.custom_fields.constraints}
                  </p>
                )}

                {actor.custom_fields?.capabilities && (
                  <p className="dwd-actor-card__capabilities">
                    <strong>Capabilities:</strong> {actor.custom_fields.capabilities}
                  </p>
                )}

                <div className="dwd-actor-card__work-items">
                  <h5>
                    <LinkIcon fontSize="small" />
                    Connected to {touchedItems.length} work items
                  </h5>
                  {touchedItems.length > 0 ? (
                    <div className="dwd-actor-card__items-list">
                      {touchedItems.slice(0, 4).map(item => (
                        <div
                          key={item.id}
                          className="dwd-actor-card__item"
                          onClick={() => onSelectArtefact?.(item)}
                        >
                          <span className="dwd-actor-card__item-name">{item.name}</span>
                          {item.custom_fields?.volatility === 'high' && (
                            <span className="dwd-actor-card__item-badge" style={{ backgroundColor: '#ef4444' }}>
                              high vol
                            </span>
                          )}
                          {item.custom_fields?.volatility === 'low' && (
                            <span className="dwd-actor-card__item-badge" style={{ backgroundColor: '#10b981' }}>
                              low vol
                            </span>
                          )}
                        </div>
                      ))}
                      {touchedItems.length > 4 && (
                        <span className="dwd-actor-card__more">
                          +{touchedItems.length - 4} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="dwd-actor-card__no-items">
                      No connected work items
                      <span className="dwd-actor-card__hint">
                        Link this actor to work items to analyze fit
                      </span>
                    </p>
                  )}
                </div>

                {/* Fit indicator */}
                {touchedItems.length > 0 && (
                  <div className="dwd-actor-card__fit-indicator">
                    {hasWarning ? (
                      <span className="dwd-actor-card__fit dwd-actor-card__fit--warning">
                        <WarningIcon fontSize="small" />
                        Potential fit issue
                      </span>
                    ) : (
                      <span className="dwd-actor-card__fit dwd-actor-card__fit--good">
                        <CheckCircleIcon fontSize="small" />
                        Good fit
                      </span>
                    )}
                  </div>
                )}

                <div className="dwd-actor-card__actions">
                  <button onClick={() => onEditArtefact?.(actor)}>Edit</button>
                  <button onClick={() => onDeleteArtefact?.(actor)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
