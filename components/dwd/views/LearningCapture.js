// components/dwd/views/LearningCapture.js
// DWD Learning Capture View - Timeline of learnings and observations
// Includes comprehensive guidance on capturing and using learnings

import { useState, useMemo } from 'react';
import { useDWD } from '../DWDContext';

// MUI Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TimelineIcon from '@mui/icons-material/Timeline';
import ViewListIcon from '@mui/icons-material/ViewList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SchoolIcon from '@mui/icons-material/School';

// Learning Capture guidance content
const LEARNING_GUIDANCE = {
  purpose: "Learnings capture what you discover when you try adjustments or observe work patterns. They build organizational knowledge over time and inform better design decisions.",
  whatIsLearning: {
    description: "A learning is an observation about how work actually operates, often revealed through an adjustment experiment or by noticing unexpected patterns.",
    elements: [
      { name: "Observation", description: "What did you actually see or measure?", required: true },
      { name: "Outcome", description: "What was the result? Better, worse, or different than expected?" },
      { name: "Surprise", description: "What was unexpected? Surprises often reveal hidden assumptions." },
      { name: "Implication", description: "What should you do differently based on this learning?" }
    ]
  },
  whenToCapture: {
    description: "Capture learnings when something noteworthy happens in your work system.",
    triggers: [
      "An adjustment is adopted or reverted",
      "You notice an unexpected pattern",
      "Something that 'should' work isn't working",
      "A workaround reveals a design flaw",
      "A success reveals what works well",
      "External change affects work patterns"
    ]
  },
  confidence: {
    description: "Confidence reflects how certain you are about the learning based on the evidence.",
    levels: [
      { level: "High", color: "#10b981", description: "Clear evidence, repeated observation, measurable results" },
      { level: "Medium", color: "#f59e0b", description: "Some evidence, limited observations, plausible conclusion" },
      { level: "Low", color: "#ef4444", description: "Initial observation, needs more evidence to confirm" }
    ]
  },
  usingLearnings: {
    description: "Learnings should inform future decisions and accumulate into organizational knowledge.",
    howTo: [
      "Review learnings before proposing new adjustments",
      "Look for patterns across multiple learnings",
      "Share learnings with others who do similar work",
      "Update your mental models based on surprises",
      "Use implications to guide next actions"
    ]
  },
  tips: [
    "Capture learnings while they're fresh - memory fades quickly",
    "Be specific about what you observed, not just conclusions",
    "Surprises are often the most valuable learnings",
    "Failed experiments still produce useful learnings",
    "Link learnings to the adjustments that triggered them"
  ],
  pitfalls: [
    "Only capturing positive outcomes (failures teach too)",
    "Being too vague about observations",
    "Not acting on implications",
    "Capturing learnings but never reviewing them",
    "Overconfidence in limited observations"
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
          <span>Learning Capture Guide</span>
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
            <span>Why Capture Learnings?</span>
            <ChevronRightIcon className={expandedSection === 'purpose' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'purpose' && (
            <div className="dwd-guidance-section__body">
              <p>{LEARNING_GUIDANCE.purpose}</p>
            </div>
          )}
        </div>

        {/* What is a Learning */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'what' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'what' ? null : 'what')}
          >
            <span>What Makes a Good Learning?</span>
            <ChevronRightIcon className={expandedSection === 'what' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'what' && (
            <div className="dwd-guidance-section__body">
              <p>{LEARNING_GUIDANCE.whatIsLearning.description}</p>
              <h5>Elements of a Learning:</h5>
              <div className="dwd-learning-elements">
                {LEARNING_GUIDANCE.whatIsLearning.elements.map((el, i) => (
                  <div key={i} className="dwd-learning-element">
                    <strong>
                      {el.name}
                      {el.required && <span className="dwd-required">*</span>}
                    </strong>
                    <span>{el.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* When to Capture */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'when' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'when' ? null : 'when')}
          >
            <span>When to Capture Learnings</span>
            <ChevronRightIcon className={expandedSection === 'when' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'when' && (
            <div className="dwd-guidance-section__body">
              <p>{LEARNING_GUIDANCE.whenToCapture.description}</p>
              <h5>Good Triggers:</h5>
              <ul>
                {LEARNING_GUIDANCE.whenToCapture.triggers.map((trigger, i) => (
                  <li key={i}>{trigger}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Confidence */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'confidence' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'confidence' ? null : 'confidence')}
          >
            <span>Confidence Levels</span>
            <ChevronRightIcon className={expandedSection === 'confidence' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'confidence' && (
            <div className="dwd-guidance-section__body">
              <p>{LEARNING_GUIDANCE.confidence.description}</p>
              {LEARNING_GUIDANCE.confidence.levels.map((level, i) => (
                <div key={i} className="dwd-confidence-level" style={{ borderLeftColor: level.color }}>
                  <strong style={{ color: level.color }}>{level.level} Confidence</strong>
                  <span>{level.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Using Learnings */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'using' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'using' ? null : 'using')}
          >
            <span>Using Your Learnings</span>
            <ChevronRightIcon className={expandedSection === 'using' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'using' && (
            <div className="dwd-guidance-section__body">
              <p>{LEARNING_GUIDANCE.usingLearnings.description}</p>
              <ol className="dwd-guidance-steps">
                {LEARNING_GUIDANCE.usingLearnings.howTo.map((step, i) => (
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
                    {LEARNING_GUIDANCE.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="dwd-donts">
                  <h5><CancelIcon style={{ color: '#ef4444' }} /> Common Mistakes</h5>
                  <ul>
                    {LEARNING_GUIDANCE.pitfalls.map((pitfall, i) => (
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
        <h3>Capturing Learnings</h3>
      </div>
      <p className="dwd-quickstart__description">
        Learnings capture what you discover about how work really operates. They're especially valuable
        when you try adjustments and see what happens - whether success or failure, both teach.
      </p>
      <div className="dwd-quickstart__flow">
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">1</span>
          <span>Notice something noteworthy</span>
        </div>
        <ArrowForwardIcon className="dwd-quickstart__arrow" />
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">2</span>
          <span>Record what you observed</span>
        </div>
        <ArrowForwardIcon className="dwd-quickstart__arrow" />
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">3</span>
          <span>Note what surprised you</span>
        </div>
        <ArrowForwardIcon className="dwd-quickstart__arrow" />
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">4</span>
          <span>Identify implications</span>
        </div>
      </div>
      <div className="dwd-quickstart__example-box">
        <h4><SchoolIcon fontSize="small" /> Example Learning:</h4>
        <p>"Giving agents refund authority reduced escalations by 40%"</p>
        <div className="dwd-quickstart__example-meta">
          <span><strong>Observation:</strong> 40% fewer escalations after authority increase</span>
          <span><strong>Surprise:</strong> No increase in refund amounts - agents were conservative</span>
          <span><strong>Implication:</strong> Consider similar authority increases for other decisions</span>
        </div>
      </div>
      <div className="dwd-quickstart__actions">
        <button className="btn btn--primary" onClick={() => onCreate?.('dwd_learning')}>
          <AddIcon fontSize="small" />
          Capture Your First Learning
        </button>
      </div>
    </div>
  );
}

export default function LearningCapture({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const {
    getArtefactsByType,
    activeCase,
    getCaseArtefacts,
    DWD_CONFIDENCE_LEVELS,
  } = useDWD();

  const [viewMode, setViewMode] = useState('timeline'); // timeline, list
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuidance, setShowGuidance] = useState(false);

  // Get learnings
  const learnings = useMemo(() => {
    const items = activeCase
      ? getCaseArtefacts().filter(a => a.artefact_type === 'dwd_learning')
      : getArtefactsByType('dwd_learning');

    return items.filter(learning => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!learning.name.toLowerCase().includes(search) &&
            !learning.description?.toLowerCase().includes(search) &&
            !learning.custom_fields?.observation?.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Confidence filter
      if (confidenceFilter !== 'all') {
        const confidence = learning.custom_fields?.confidence || 'medium';
        if (confidence !== confidenceFilter) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activeCase, getCaseArtefacts, getArtefactsByType, searchTerm, confidenceFilter]);

  // Group by month for timeline
  const learningsByMonth = useMemo(() => {
    const groups = {};

    learnings.forEach(learning => {
      const date = new Date(learning.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

      if (!groups[monthKey]) {
        groups[monthKey] = { label: monthLabel, items: [] };
      }
      groups[monthKey].items.push(learning);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [learnings]);

  // Stats
  const stats = useMemo(() => ({
    total: learnings.length,
    byConfidence: {
      high: learnings.filter(l => l.custom_fields?.confidence === 'high').length,
      medium: learnings.filter(l => l.custom_fields?.confidence === 'medium' || !l.custom_fields?.confidence).length,
      low: learnings.filter(l => l.custom_fields?.confidence === 'low').length,
    },
    withImplication: learnings.filter(l => l.custom_fields?.implication).length,
    withSurprise: learnings.filter(l => l.custom_fields?.surprise).length,
  }), [learnings]);

  const confidenceColors = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444',
  };

  const isEmpty = learnings.length === 0 && !searchTerm && confidenceFilter === 'all';

  return (
    <div className="dwd-learning-capture">
      {/* Guidance Panel */}
      {showGuidance && (
        <GuidancePanel onClose={() => setShowGuidance(false)} />
      )}

      {/* Header */}
      <div className="dwd-view-header">
        <div className="dwd-view-header__left">
          <h2>Learning Capture</h2>
          <p>Build organizational knowledge from adjustments and observations</p>
        </div>

        <div className="dwd-view-stats">
          <span className="dwd-view-stat">
            <LightbulbIcon fontSize="small" />
            {stats.total} learnings
          </span>
          <span className="dwd-view-stat" style={{ color: '#10b981' }}>
            {stats.byConfidence.high} high confidence
          </span>
          <span className="dwd-view-stat">
            {stats.withImplication} with implications
          </span>
          <span className="dwd-view-stat">
            {stats.withSurprise} with surprises
          </span>
        </div>
      </div>

      <div className="dwd-view-actions">
        <div className="dwd-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            placeholder="Search learnings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="dwd-filter-select"
          value={confidenceFilter}
          onChange={(e) => setConfidenceFilter(e.target.value)}
        >
          <option value="all">All confidence</option>
          {DWD_CONFIDENCE_LEVELS?.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <div className="dwd-view-toggle">
          <button
            className={viewMode === 'timeline' ? 'active' : ''}
            onClick={() => setViewMode('timeline')}
            title="Timeline view"
          >
            <TimelineIcon fontSize="small" />
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <ViewListIcon fontSize="small" />
          </button>
        </div>

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
          onClick={() => onCreateArtefact?.('dwd_learning')}
        >
          <AddIcon fontSize="small" />
          Capture Learning
        </button>
      </div>

      {/* Empty State */}
      {isEmpty && <QuickStartCard onCreate={onCreateArtefact} />}

      {/* Timeline View */}
      {!isEmpty && viewMode === 'timeline' && (
        <div className="dwd-learning-timeline">
          {learningsByMonth.length === 0 ? (
            <div className="dwd-empty-state">
              <LightbulbIcon style={{ fontSize: 48, opacity: 0.3 }} />
              <p>No learnings match your filters</p>
              <p className="dwd-empty-state__hint">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            learningsByMonth.map(([monthKey, { label, items }]) => (
              <div key={monthKey} className="dwd-timeline-month">
                <h3 className="dwd-timeline-month__header">{label}</h3>
                <div className="dwd-timeline-items">
                  {items.map(learning => (
                    <LearningCard
                      key={learning.id}
                      learning={learning}
                      onSelect={onSelectArtefact}
                      onEdit={onEditArtefact}
                      onDelete={onDeleteArtefact}
                      confidenceColors={confidenceColors}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* List View */}
      {!isEmpty && viewMode === 'list' && (
        <div className="dwd-learning-list">
          {learnings.length === 0 ? (
            <div className="dwd-empty-state">
              <LightbulbIcon style={{ fontSize: 48, opacity: 0.3 }} />
              <p>No learnings match your filters</p>
            </div>
          ) : (
            learnings.map(learning => (
              <LearningCard
                key={learning.id}
                learning={learning}
                onSelect={onSelectArtefact}
                onEdit={onEditArtefact}
                onDelete={onDeleteArtefact}
                confidenceColors={confidenceColors}
                expanded
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Learning card component
function LearningCard({ learning, onSelect, onEdit, onDelete, confidenceColors, expanded = false }) {
  const customFields = learning.custom_fields || {};
  const confidence = customFields.confidence || 'medium';
  const date = new Date(learning.created_at);

  const hasObservation = !!customFields.observation;
  const hasOutcome = !!customFields.outcome;
  const hasSurprise = !!customFields.surprise;
  const hasImplication = !!customFields.implication;
  const completeness = [hasObservation, hasOutcome, hasSurprise, hasImplication].filter(Boolean).length;

  return (
    <div
      className={`dwd-learning-card ${expanded ? 'dwd-learning-card--expanded' : ''}`}
      onClick={() => onSelect?.(learning)}
    >
      <div className="dwd-learning-card__header">
        <div className="dwd-learning-card__icon">
          <LightbulbIcon style={{ color: confidenceColors[confidence] }} />
        </div>
        <div className="dwd-learning-card__meta">
          <h4>{learning.name}</h4>
          <span className="dwd-learning-card__date">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <span
          className="dwd-learning-card__confidence"
          style={{ backgroundColor: confidenceColors[confidence] }}
        >
          {confidence} confidence
        </span>
      </div>

      {customFields.observation && (
        <div className="dwd-learning-card__section">
          <strong>Observation:</strong>
          <p>{customFields.observation}</p>
        </div>
      )}

      {customFields.outcome && (
        <div className="dwd-learning-card__section">
          <strong>Outcome:</strong>
          <p>{customFields.outcome}</p>
        </div>
      )}

      {customFields.surprise && (
        <div className="dwd-learning-card__section dwd-learning-card__section--highlight">
          <strong>Surprise:</strong>
          <p>{customFields.surprise}</p>
        </div>
      )}

      {customFields.implication && (
        <div className="dwd-learning-card__section dwd-learning-card__section--action">
          <strong>Implication:</strong>
          <p>{customFields.implication}</p>
        </div>
      )}

      {completeness < 3 && (
        <div className="dwd-learning-card__incomplete">
          <InfoIcon fontSize="small" />
          <span>
            Consider adding {!hasSurprise && 'surprise'}{!hasSurprise && !hasImplication && ', '}{!hasImplication && 'implication'} for a more complete learning
          </span>
        </div>
      )}

      <div className="dwd-learning-card__actions">
        <button onClick={(e) => { e.stopPropagation(); onEdit?.(learning); }}>
          <EditIcon fontSize="small" />
          Edit
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete?.(learning); }}>
          <DeleteIcon fontSize="small" />
          Delete
        </button>
      </div>
    </div>
  );
}
