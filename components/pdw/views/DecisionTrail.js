// components/pdw/views/DecisionTrail.js
// Timeline view of decisions with rationale and outcomes
// Includes comprehensive guidance on decision-making best practices

import { useState, useMemo, useCallback } from 'react';
import { usePDW } from '../PDWContext';

// MUI Icons
import GavelIcon from '@mui/icons-material/Gavel';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import TimelineIcon from '@mui/icons-material/Timeline';
import ViewListIcon from '@mui/icons-material/ViewList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Decision guidance content
const DECISION_GUIDANCE = {
  purpose: "A decision trail documents key decisions with their context, rationale, and outcomes. This creates institutional memory and helps teams learn from past choices.",
  when: [
    "After completing validation experiments",
    "At stage gates or milestones",
    "When pivoting or changing direction",
    "Before committing significant resources",
    "When stakeholders need to understand why choices were made"
  ],
  types: [
    { type: "Go", description: "Proceed with the current direction. Evidence supports moving forward.", color: "#22c55e", icon: CheckCircleIcon },
    { type: "No-Go", description: "Stop or kill this initiative. Evidence shows it won't work.", color: "#ef4444", icon: CancelIcon },
    { type: "Pivot", description: "Change direction based on learnings. Keep the vision, change the approach.", color: "#f59e0b", icon: SwapHorizIcon },
    { type: "Persevere", description: "Continue despite challenges. Evidence shows potential if we persist.", color: "#3b82f6", icon: TrendingUpIcon },
    { type: "Defer", description: "Postpone decision. More evidence or time is needed.", color: "#64748b", icon: ScheduleIcon }
  ],
  elements: [
    { name: "Clear Statement", description: "What exactly are you deciding? Be specific and unambiguous." },
    { name: "Context", description: "What situation led to this decision? What evidence do you have?" },
    { name: "Rationale", description: "Why are you making this choice? Document the reasoning." },
    { name: "Alternatives", description: "What other options did you consider and why were they rejected?" },
    { name: "Conditions", description: "Under what conditions would you revisit this decision?" },
    { name: "Next Steps", description: "What actions follow from this decision?" }
  ],
  tips: [
    "Document decisions while context is fresh",
    "Be honest about uncertainty - it's okay to decide with incomplete information",
    "Set review dates for important decisions",
    "Link decisions to the evidence that informed them",
    "Include dissenting opinions and concerns"
  ],
  pitfalls: [
    "Making decisions without clear ownership",
    "Not documenting the reasoning behind choices",
    "Ignoring contradictory evidence",
    "Postponing decisions indefinitely",
    "Not setting conditions for revisiting decisions"
  ]
};

// Decision type configuration
const DECISION_CONFIG = {
  Go: { icon: CheckCircleIcon, color: '#22c55e', bg: '#f0fdf4', label: 'Go', hint: 'Proceed with confidence' },
  'No-Go': { icon: CancelIcon, color: '#ef4444', bg: '#fef2f2', label: 'No-Go', hint: 'Stop this initiative' },
  Pivot: { icon: SwapHorizIcon, color: '#f59e0b', bg: '#fffbeb', label: 'Pivot', hint: 'Change direction' },
  Persevere: { icon: TrendingUpIcon, color: '#3b82f6', bg: '#eff6ff', label: 'Persevere', hint: 'Continue despite challenges' },
  Defer: { icon: ScheduleIcon, color: '#64748b', bg: '#f1f5f9', label: 'Defer', hint: 'Needs more time/evidence' },
};

// Guidance panel component
function GuidancePanel({ onClose }) {
  const [expandedSection, setExpandedSection] = useState('purpose');

  return (
    <div className="pdw-guidance-panel">
      <div className="pdw-guidance-panel__header">
        <div className="pdw-guidance-panel__title">
          <LightbulbIcon />
          <span>Decision Trail Guide</span>
        </div>
        <button className="pdw-guidance-panel__close" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </button>
      </div>

      <div className="pdw-guidance-panel__content">
        {/* Purpose */}
        <div className="pdw-guidance-section">
          <button
            className={`pdw-guidance-section__header ${expandedSection === 'purpose' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'purpose' ? null : 'purpose')}
          >
            <span>Why document decisions?</span>
            <ChevronRightIcon className={expandedSection === 'purpose' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'purpose' && (
            <div className="pdw-guidance-section__body">
              <p>{DECISION_GUIDANCE.purpose}</p>
            </div>
          )}
        </div>

        {/* When to Use */}
        <div className="pdw-guidance-section">
          <button
            className={`pdw-guidance-section__header ${expandedSection === 'when' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'when' ? null : 'when')}
          >
            <span>When to record a decision</span>
            <ChevronRightIcon className={expandedSection === 'when' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'when' && (
            <div className="pdw-guidance-section__body">
              <ul>
                {DECISION_GUIDANCE.when.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Decision Types */}
        <div className="pdw-guidance-section">
          <button
            className={`pdw-guidance-section__header ${expandedSection === 'types' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'types' ? null : 'types')}
          >
            <span>Decision types explained</span>
            <ChevronRightIcon className={expandedSection === 'types' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'types' && (
            <div className="pdw-guidance-section__body">
              <div className="pdw-decision-types-list">
                {DECISION_GUIDANCE.types.map((type, i) => {
                  const Icon = type.icon;
                  return (
                    <div key={i} className="pdw-decision-type-item" style={{ borderLeftColor: type.color }}>
                      <div className="pdw-decision-type-item__header">
                        <Icon style={{ color: type.color }} fontSize="small" />
                        <strong style={{ color: type.color }}>{type.type}</strong>
                      </div>
                      <p>{type.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Good Decision Elements */}
        <div className="pdw-guidance-section">
          <button
            className={`pdw-guidance-section__header ${expandedSection === 'elements' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'elements' ? null : 'elements')}
          >
            <span>Elements of a good decision</span>
            <ChevronRightIcon className={expandedSection === 'elements' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'elements' && (
            <div className="pdw-guidance-section__body">
              <div className="pdw-elements-list">
                {DECISION_GUIDANCE.elements.map((element, i) => (
                  <div key={i} className="pdw-element-item">
                    <span className="pdw-element-number">{i + 1}</span>
                    <div>
                      <strong>{element.name}</strong>
                      <p>{element.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tips & Pitfalls */}
        <div className="pdw-guidance-section">
          <button
            className={`pdw-guidance-section__header ${expandedSection === 'tips' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'tips' ? null : 'tips')}
          >
            <span>Tips & Pitfalls</span>
            <ChevronRightIcon className={expandedSection === 'tips' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'tips' && (
            <div className="pdw-guidance-section__body">
              <div className="pdw-tips-donts">
                <div className="pdw-tips">
                  <h5><CheckCircleIcon style={{ color: '#22c55e' }} /> Best Practices</h5>
                  <ul>
                    {DECISION_GUIDANCE.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="pdw-donts">
                  <h5><CancelIcon style={{ color: '#ef4444' }} /> Avoid</h5>
                  <ul>
                    {DECISION_GUIDANCE.pitfalls.map((pitfall, i) => (
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

// Quick start card for new users
function QuickStartCard({ onCreate }) {
  return (
    <div className="pdw-quickstart">
      <div className="pdw-quickstart__header">
        <TipsAndUpdatesIcon />
        <h3>Building Your Decision Trail</h3>
      </div>
      <p className="pdw-quickstart__description">
        Documenting decisions creates institutional memory. Future you (and your team) will thank present you for capturing the "why" behind important choices.
      </p>
      <div className="pdw-quickstart__flow">
        <div className="pdw-quickstart__step">
          <span className="pdw-quickstart__step-num">1</span>
          <span>Complete validation experiments</span>
        </div>
        <ArrowForwardIcon className="pdw-quickstart__arrow" />
        <div className="pdw-quickstart__step">
          <span className="pdw-quickstart__step-num">2</span>
          <span>Review evidence and learnings</span>
        </div>
        <ArrowForwardIcon className="pdw-quickstart__arrow" />
        <div className="pdw-quickstart__step">
          <span className="pdw-quickstart__step-num">3</span>
          <span>Make and document decision</span>
        </div>
        <ArrowForwardIcon className="pdw-quickstart__arrow" />
        <div className="pdw-quickstart__step">
          <span className="pdw-quickstart__step-num">4</span>
          <span>Set review date if needed</span>
        </div>
      </div>
      <div className="pdw-quickstart__actions">
        <button className="btn btn--primary" onClick={onCreate}>
          <GavelIcon fontSize="small" />
          Record Your First Decision
        </button>
      </div>
    </div>
  );
}

// Decision badge component
function DecisionBadge({ type }) {
  const config = DECISION_CONFIG[type] || DECISION_CONFIG.Defer;
  const Icon = config.icon;

  return (
    <div
      className="pdw-decision-badge"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <Icon fontSize="small" />
      <span>{config.label}</span>
    </div>
  );
}

// Decision timeline card with guidance hints
function DecisionTimelineCard({ decision, onSelect, onEdit, selected, relatedItems }) {
  const config = DECISION_CONFIG[decision.custom_fields?.decision_type] || DECISION_CONFIG.Defer;
  const Icon = config.icon;

  const decidedAt = decision.custom_fields?.decided_at
    ? new Date(decision.custom_fields.decided_at)
    : new Date(decision.created_at);

  const reviewDate = decision.custom_fields?.review_date
    ? new Date(decision.custom_fields.review_date)
    : null;

  const isUpForReview = reviewDate && reviewDate <= new Date();
  const hasRationale = decision.custom_fields?.rationale && decision.custom_fields.rationale.length > 0;
  const hasNextSteps = decision.custom_fields?.next_steps && decision.custom_fields.next_steps.length > 0;

  // Calculate completeness
  const completenessItems = [
    hasRationale,
    hasNextSteps,
    !!decision.custom_fields?.conditions,
    !!decision.custom_fields?.decided_by,
    relatedItems.length > 0
  ];
  const completeness = Math.round((completenessItems.filter(Boolean).length / completenessItems.length) * 100);

  return (
    <div
      className={`pdw-decision-card ${selected ? 'pdw-decision-card--selected' : ''} ${isUpForReview ? 'pdw-decision-card--review' : ''}`}
      onClick={() => onSelect(decision)}
    >
      <div className="pdw-decision-card__timeline-marker" style={{ backgroundColor: config.color }}>
        <Icon style={{ color: '#fff' }} fontSize="small" />
      </div>

      <div className="pdw-decision-card__content">
        <div className="pdw-decision-card__header">
          <span className="pdw-decision-card__date">
            {decidedAt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <DecisionBadge type={decision.custom_fields?.decision_type} />
        </div>

        <h4 className="pdw-decision-card__title">{decision.name}</h4>

        {/* Status hint */}
        <div className="pdw-decision-card__status-hint" style={{ color: config.color }}>
          <InfoIcon fontSize="small" />
          <span>{config.hint}</span>
        </div>

        {hasRationale ? (
          <div className="pdw-decision-card__rationale">
            <strong>Rationale:</strong>
            <p>{decision.custom_fields.rationale}</p>
          </div>
        ) : (
          <div className="pdw-decision-card__missing">
            <InfoIcon fontSize="small" />
            <span>Consider adding the rationale for this decision</span>
          </div>
        )}

        {decision.custom_fields?.conditions && (
          <div className="pdw-decision-card__conditions">
            <strong>Revisit if:</strong>
            <p>{decision.custom_fields.conditions}</p>
          </div>
        )}

        {hasNextSteps && (
          <div className="pdw-decision-card__next-steps">
            <strong>Next Steps:</strong>
            <p>{decision.custom_fields.next_steps}</p>
          </div>
        )}

        <div className="pdw-decision-card__footer">
          {decision.custom_fields?.decided_by && (
            <div className="pdw-decision-card__meta">
              <PersonIcon fontSize="small" />
              <span>{decision.custom_fields.decided_by}</span>
            </div>
          )}

          {reviewDate && (
            <div className={`pdw-decision-card__review ${isUpForReview ? 'pdw-decision-card__review--due' : ''}`}>
              <EventIcon fontSize="small" />
              <span>
                Review: {reviewDate.toLocaleDateString()}
                {isUpForReview && ' (Due!)'}
              </span>
            </div>
          )}

          {relatedItems.length > 0 && (
            <div className="pdw-decision-card__related">
              <LinkIcon fontSize="small" />
              <span>{relatedItems.length} linked evidence</span>
            </div>
          )}

          {/* Completeness indicator */}
          <div className="pdw-decision-card__completeness">
            <div className="pdw-decision-card__completeness-bar">
              <div
                className="pdw-decision-card__completeness-fill"
                style={{
                  width: `${completeness}%`,
                  backgroundColor: completeness > 70 ? '#22c55e' : completeness > 40 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <span>{completeness}% documented</span>
          </div>

          <button
            className="pdw-decision-card__edit"
            onClick={(e) => { e.stopPropagation(); onEdit(decision); }}
          >
            <EditIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Decision list row
function DecisionListRow({ decision, onSelect, onEdit, selected }) {
  const config = DECISION_CONFIG[decision.custom_fields?.decision_type] || DECISION_CONFIG.Defer;

  const decidedAt = decision.custom_fields?.decided_at
    ? new Date(decision.custom_fields.decided_at)
    : new Date(decision.created_at);

  return (
    <div
      className={`pdw-decision-row ${selected ? 'pdw-decision-row--selected' : ''}`}
      onClick={() => onSelect(decision)}
    >
      <span className="pdw-decision-row__date">
        {decidedAt.toLocaleDateString()}
      </span>
      <div className="pdw-decision-row__content">
        <span className="pdw-decision-row__title">{decision.name}</span>
        {decision.custom_fields?.rationale && (
          <span className="pdw-decision-row__rationale">
            {decision.custom_fields.rationale.slice(0, 80)}...
          </span>
        )}
      </div>
      <DecisionBadge type={decision.custom_fields?.decision_type} />
      {decision.custom_fields?.decided_by && (
        <span className="pdw-decision-row__by">{decision.custom_fields.decided_by}</span>
      )}
      <button
        className="pdw-decision-row__edit"
        onClick={(e) => { e.stopPropagation(); onEdit(decision); }}
      >
        <EditIcon fontSize="small" />
      </button>
    </div>
  );
}

// Decision summary stats
function DecisionSummary({ decisions }) {
  const stats = useMemo(() => {
    const total = decisions.length;
    const byType = {};
    Object.keys(DECISION_CONFIG).forEach(type => {
      byType[type] = decisions.filter(d => d.custom_fields?.decision_type === type).length;
    });

    const upForReview = decisions.filter(d => {
      const reviewDate = d.custom_fields?.review_date;
      return reviewDate && new Date(reviewDate) <= new Date();
    }).length;

    const wellDocumented = decisions.filter(d =>
      d.custom_fields?.rationale && d.custom_fields?.next_steps
    ).length;

    return { total, byType, upForReview, wellDocumented };
  }, [decisions]);

  return (
    <div className="pdw-decision-summary">
      <div className="pdw-decision-summary__total">
        <GavelIcon />
        <span className="pdw-decision-summary__value">{stats.total}</span>
        <span className="pdw-decision-summary__label">Total Decisions</span>
      </div>

      <div className="pdw-decision-summary__breakdown">
        {Object.entries(DECISION_CONFIG).map(([type, config]) => (
          <div key={type} className="pdw-decision-summary__type" style={{ color: config.color }}>
            <span className="pdw-decision-summary__type-value">{stats.byType[type] || 0}</span>
            <span className="pdw-decision-summary__type-label">{config.label}</span>
          </div>
        ))}
      </div>

      {stats.upForReview > 0 && (
        <div className="pdw-decision-summary__review">
          <EventIcon style={{ color: '#f59e0b' }} />
          <span>{stats.upForReview} decision{stats.upForReview > 1 ? 's' : ''} up for review</span>
        </div>
      )}

      <div className="pdw-decision-summary__documented">
        <InfoIcon style={{ color: '#3b82f6' }} />
        <span>{stats.wellDocumented}/{stats.total} well documented</span>
      </div>
    </div>
  );
}

export default function DecisionTrail({
  onSelectDecision,
  onEditDecision,
  onDeleteDecision,
  onCreateDecision,
}) {
  const {
    artefacts,
    selectedId,
    setSelectedId,
    getRelated,
    loading,
  } = usePDW();

  const [viewMode, setViewMode] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showReviewOnly, setShowReviewOnly] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  // Get decisions
  const decisions = useMemo(() => {
    let items = artefacts.filter(a => a.artefact_type === 'pdw_decision');

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.custom_fields?.rationale?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      items = items.filter(a => a.custom_fields?.decision_type === typeFilter);
    }

    if (showReviewOnly) {
      items = items.filter(a => {
        const reviewDate = a.custom_fields?.review_date;
        return reviewDate && new Date(reviewDate) <= new Date();
      });
    }

    return items.sort((a, b) => {
      const dateA = a.custom_fields?.decided_at || a.created_at;
      const dateB = b.custom_fields?.decided_at || b.created_at;
      return new Date(dateB) - new Date(dateA);
    });
  }, [artefacts, searchQuery, typeFilter, showReviewOnly]);

  // Group by quarter for timeline
  const decisionsByQuarter = useMemo(() => {
    const grouped = {};
    decisions.forEach(decision => {
      const date = new Date(decision.custom_fields?.decided_at || decision.created_at);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const key = `${date.getFullYear()}-Q${quarter}`;
      const label = `Q${quarter} ${date.getFullYear()}`;
      if (!grouped[key]) {
        grouped[key] = { label, items: [] };
      }
      grouped[key].items.push(decision);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  }, [decisions]);

  // Handlers
  const handleSelect = useCallback((decision) => {
    setSelectedId(decision.id);
    if (onSelectDecision) onSelectDecision(decision);
  }, [setSelectedId, onSelectDecision]);

  const handleEdit = useCallback((decision) => {
    if (onEditDecision) onEditDecision(decision);
  }, [onEditDecision]);

  const handleCreate = useCallback(() => {
    if (onCreateDecision) onCreateDecision('pdw_decision');
  }, [onCreateDecision]);

  if (loading) {
    return (
      <div className="pdw-board pdw-board--loading">
        <div className="pdw-loading-spinner" />
        <p>Loading decisions...</p>
      </div>
    );
  }

  const isEmpty = decisions.length === 0 && !searchQuery && typeFilter === 'all' && !showReviewOnly;

  return (
    <div className="pdw-board pdw-board--decisions">
      {/* Guidance Panel (Overlay) */}
      {showGuidance && (
        <GuidancePanel onClose={() => setShowGuidance(false)} />
      )}

      {/* Header */}
      <div className="pdw-board__header">
        <div className="pdw-board__title">
          <h2>Decision Trail</h2>
          <p>Document decisions with context, rationale, and review dates</p>
        </div>

        <div className="pdw-board__controls">
          <div className="pdw-board__search">
            <SearchIcon fontSize="small" />
            <input
              type="text"
              placeholder="Search decisions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="pdw-board__filter">
            <FilterListIcon fontSize="small" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {Object.entries(DECISION_CONFIG).map(([type, config]) => (
                <option key={type} value={type}>{config.label}</option>
              ))}
            </select>
          </div>

          <label className="pdw-board__checkbox">
            <input
              type="checkbox"
              checked={showReviewOnly}
              onChange={(e) => setShowReviewOnly(e.target.checked)}
            />
            <span>Up for review</span>
          </label>

          <div className="pdw-board__view-toggle">
            <button
              className={viewMode === 'timeline' ? 'active' : ''}
              onClick={() => setViewMode('timeline')}
              title="Timeline View"
            >
              <TimelineIcon fontSize="small" />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <ViewListIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {!isEmpty && <DecisionSummary decisions={decisions} />}

      {/* Quick Actions with Help */}
      <div className="pdw-board__quick-actions pdw-board__quick-actions--inline">
        <button
          className="btn btn--primary btn--sm"
          onClick={handleCreate}
        >
          <AddIcon fontSize="small" />
          Record Decision
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => setShowGuidance(true)}
        >
          <HelpIcon fontSize="small" />
          How to document decisions
        </button>
      </div>

      {/* Empty State with Quick Start */}
      {isEmpty && <QuickStartCard onCreate={handleCreate} />}

      {/* Content */}
      {!isEmpty && viewMode === 'timeline' && (
        <div className="pdw-decision-timeline">
          {decisionsByQuarter.map(([key, group]) => (
            <div key={key} className="pdw-decision-timeline__quarter">
              <div className="pdw-decision-timeline__quarter-header">
                <h3>{group.label}</h3>
                <span className="pdw-decision-timeline__quarter-count">
                  {group.items.length} decision{group.items.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="pdw-decision-timeline__items">
                {group.items.map(decision => (
                  <DecisionTimelineCard
                    key={decision.id}
                    decision={decision}
                    onSelect={handleSelect}
                    onEdit={handleEdit}
                    selected={decision.id === selectedId}
                    relatedItems={getRelated(decision.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isEmpty && viewMode === 'list' && (
        <div className="pdw-decision-list">
          <div className="pdw-decision-list__header">
            <span className="pdw-decision-list__col--date">Date</span>
            <span className="pdw-decision-list__col--content">Decision</span>
            <span className="pdw-decision-list__col--type">Type</span>
            <span className="pdw-decision-list__col--by">Decided By</span>
            <span className="pdw-decision-list__col--edit" />
          </div>
          <div className="pdw-decision-list__body">
            {decisions.map(decision => (
              <DecisionListRow
                key={decision.id}
                decision={decision}
                onSelect={handleSelect}
                onEdit={handleEdit}
                selected={decision.id === selectedId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filtered Empty State */}
      {!isEmpty && decisions.length === 0 && (typeFilter !== 'all' || showReviewOnly || searchQuery) && (
        <div className="pdw-board__empty-filtered">
          <p>No decisions match your filters.</p>
          <button
            className="btn btn--secondary"
            onClick={() => {
              setTypeFilter('all');
              setShowReviewOnly(false);
              setSearchQuery('');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
