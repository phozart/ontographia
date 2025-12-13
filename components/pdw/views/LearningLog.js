// components/pdw/views/LearningLog.js
// Timeline view of learnings from experiments and validation
// Includes comprehensive guidance on capturing and using learnings

import { useState, useMemo, useCallback } from 'react';
import { usePDW } from '../PDWContext';

// MUI Icons
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import TimelineIcon from '@mui/icons-material/Timeline';
import ViewListIcon from '@mui/icons-material/ViewList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

// Learning guidance content
const LEARNING_GUIDANCE = {
  purpose: "A learning log captures insights from experiments, user feedback, and validation activities. It transforms raw findings into actionable knowledge that informs decisions.",
  why: [
    "Prevents repeating the same mistakes",
    "Builds organizational knowledge",
    "Connects evidence to decisions",
    "Helps teams align on what's been learned",
    "Creates an audit trail for stakeholders"
  ],
  when: [
    "After completing an experiment (validated or not)",
    "When receiving surprising user feedback",
    "When an assumption is proved or disproved",
    "After customer interviews or usability tests",
    "When data reveals unexpected patterns"
  ],
  elements: [
    { name: "What We Learned", description: "The key insight or finding. Be specific and factual, not interpretive." },
    { name: "Evidence", description: "What data or observations support this learning? Include quotes, numbers, or references." },
    { name: "Impact", description: "How significant is this learning? Does it change our direction?" },
    { name: "Action Taken", description: "What will you do with this learning? Continue, pivot, stop, or investigate further?" },
    { name: "Next Steps", description: "Concrete actions that follow from this learning." }
  ],
  impactLevels: [
    { level: "Major", description: "Changes product direction, invalidates core assumptions, or reveals critical insights", color: "#ef4444" },
    { level: "Minor", description: "Influences specific features or confirms hypotheses without major pivots", color: "#f59e0b" },
    { level: "None", description: "Useful context but doesn't change current plans", color: "#64748b" }
  ],
  actions: [
    { action: "Continue", description: "Evidence supports current direction. Keep going.", color: "#22c55e", icon: TrendingUpIcon },
    { action: "Pivot", description: "Change approach based on this learning. Adjust strategy.", color: "#f59e0b", icon: SwapHorizIcon },
    { action: "Persevere", description: "Despite challenges, evidence suggests potential. Keep trying.", color: "#3b82f6", icon: TrendingUpIcon },
    { action: "Stop", description: "Evidence strongly suggests this path won't work. Cut losses.", color: "#ef4444", icon: StopIcon },
    { action: "No Action", description: "Information noted but no immediate action needed.", color: "#64748b", icon: PauseIcon }
  ],
  tips: [
    "Capture learnings immediately while context is fresh",
    "Be honest about negative results - they're valuable",
    "Link learnings to the experiments or sources that produced them",
    "Quantify when possible (e.g., '7 of 10 users' not 'most users')",
    "Share learnings with the team regularly"
  ],
  pitfalls: [
    "Only capturing positive results (confirmation bias)",
    "Being too vague ('users liked it')",
    "Not connecting learnings to decisions",
    "Letting learnings sit without action",
    "Not reviewing past learnings before starting new work"
  ]
};

// Action icons mapping
const ACTION_CONFIG = {
  Continue: { icon: TrendingUpIcon, color: '#22c55e', label: 'Continue', hint: 'Keep going - evidence supports this direction' },
  Pivot: { icon: SwapHorizIcon, color: '#f59e0b', label: 'Pivot', hint: 'Change approach based on learning' },
  Persevere: { icon: TrendingUpIcon, color: '#3b82f6', label: 'Persevere', hint: 'Keep trying despite challenges' },
  Stop: { icon: StopIcon, color: '#ef4444', label: 'Stop', hint: 'End this path - evidence is clear' },
  'No Action': { icon: PauseIcon, color: '#64748b', label: 'No Action', hint: 'Noted for future reference' },
};

// Guidance panel component
function GuidancePanel({ onClose }) {
  const [expandedSection, setExpandedSection] = useState('purpose');

  return (
    <div className="pdw-guidance-panel">
      <div className="pdw-guidance-panel__header">
        <div className="pdw-guidance-panel__title">
          <LightbulbIcon />
          <span>Learning Log Guide</span>
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
            <span>What is a Learning Log?</span>
            <ChevronRightIcon className={expandedSection === 'purpose' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'purpose' && (
            <div className="pdw-guidance-section__body">
              <p>{LEARNING_GUIDANCE.purpose}</p>
            </div>
          )}
        </div>

        {/* Why */}
        <div className="pdw-guidance-section">
          <button
            className={`pdw-guidance-section__header ${expandedSection === 'why' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'why' ? null : 'why')}
          >
            <span>Why capture learnings?</span>
            <ChevronRightIcon className={expandedSection === 'why' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'why' && (
            <div className="pdw-guidance-section__body">
              <ul>
                {LEARNING_GUIDANCE.why.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* When to Capture */}
        <div className="pdw-guidance-section">
          <button
            className={`pdw-guidance-section__header ${expandedSection === 'when' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'when' ? null : 'when')}
          >
            <span>When to capture a learning</span>
            <ChevronRightIcon className={expandedSection === 'when' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'when' && (
            <div className="pdw-guidance-section__body">
              <ul>
                {LEARNING_GUIDANCE.when.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Elements */}
        <div className="pdw-guidance-section">
          <button
            className={`pdw-guidance-section__header ${expandedSection === 'elements' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'elements' ? null : 'elements')}
          >
            <span>Elements of a good learning</span>
            <ChevronRightIcon className={expandedSection === 'elements' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'elements' && (
            <div className="pdw-guidance-section__body">
              <div className="pdw-elements-list">
                {LEARNING_GUIDANCE.elements.map((element, i) => (
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

        {/* Impact Levels */}
        <div className="pdw-guidance-section">
          <button
            className={`pdw-guidance-section__header ${expandedSection === 'impact' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'impact' ? null : 'impact')}
          >
            <span>Impact levels explained</span>
            <ChevronRightIcon className={expandedSection === 'impact' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'impact' && (
            <div className="pdw-guidance-section__body">
              <div className="pdw-risk-levels">
                {LEARNING_GUIDANCE.impactLevels.map((impact, i) => (
                  <div key={i} className="pdw-risk-level" style={{ borderLeftColor: impact.color }}>
                    <strong style={{ color: impact.color }}>{impact.level} Impact</strong>
                    <p>{impact.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pdw-guidance-section">
          <button
            className={`pdw-guidance-section__header ${expandedSection === 'actions' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'actions' ? null : 'actions')}
          >
            <span>Action types explained</span>
            <ChevronRightIcon className={expandedSection === 'actions' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'actions' && (
            <div className="pdw-guidance-section__body">
              <div className="pdw-decision-types-list">
                {LEARNING_GUIDANCE.actions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <div key={i} className="pdw-decision-type-item" style={{ borderLeftColor: action.color }}>
                      <div className="pdw-decision-type-item__header">
                        <Icon style={{ color: action.color }} fontSize="small" />
                        <strong style={{ color: action.color }}>{action.action}</strong>
                      </div>
                      <p>{action.description}</p>
                    </div>
                  );
                })}
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
                    {LEARNING_GUIDANCE.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="pdw-donts">
                  <h5><CancelIcon style={{ color: '#ef4444' }} /> Avoid</h5>
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

// Quick start card for new users
function QuickStartCard({ onCreate }) {
  return (
    <div className="pdw-quickstart">
      <div className="pdw-quickstart__header">
        <TipsAndUpdatesIcon />
        <h3>Building Your Learning Log</h3>
      </div>
      <p className="pdw-quickstart__description">
        Every experiment, interview, and validation activity teaches you something.
        Capturing these learnings creates organizational knowledge that compounds over time.
      </p>
      <div className="pdw-quickstart__flow">
        <div className="pdw-quickstart__step">
          <span className="pdw-quickstart__step-num">1</span>
          <span>Run experiment or research</span>
        </div>
        <ArrowForwardIcon className="pdw-quickstart__arrow" />
        <div className="pdw-quickstart__step">
          <span className="pdw-quickstart__step-num">2</span>
          <span>Document what you learned</span>
        </div>
        <ArrowForwardIcon className="pdw-quickstart__arrow" />
        <div className="pdw-quickstart__step">
          <span className="pdw-quickstart__step-num">3</span>
          <span>Assess impact on plans</span>
        </div>
        <ArrowForwardIcon className="pdw-quickstart__arrow" />
        <div className="pdw-quickstart__step">
          <span className="pdw-quickstart__step-num">4</span>
          <span>Take action or inform decision</span>
        </div>
      </div>
      <div className="pdw-quickstart__actions">
        <button className="btn btn--primary" onClick={onCreate}>
          <SchoolIcon fontSize="small" />
          Capture Your First Learning
        </button>
      </div>
    </div>
  );
}

// Impact badge
function ImpactBadge({ impact }) {
  const config = {
    Major: { color: '#ef4444', bg: '#fef2f2' },
    Minor: { color: '#f59e0b', bg: '#fffbeb' },
    None: { color: '#64748b', bg: '#f1f5f9' },
  };

  const style = config[impact] || config.None;

  return (
    <span
      className="pdw-learning__impact"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {impact || 'Unknown'} Impact
    </span>
  );
}

// Timeline learning card with guidance
function LearningTimelineCard({ learning, onSelect, onEdit, selected, relatedItems }) {
  const actionConfig = ACTION_CONFIG[learning.custom_fields?.action_taken] || ACTION_CONFIG['No Action'];
  const ActionIcon = actionConfig.icon;

  const hasEvidence = learning.custom_fields?.evidence && learning.custom_fields.evidence.length > 0;
  const hasNextSteps = learning.custom_fields?.next_steps && learning.custom_fields.next_steps.length > 0;
  const hasWhatLearned = learning.custom_fields?.what_learned && learning.custom_fields.what_learned.length > 0;

  // Calculate completeness
  const completenessItems = [
    hasWhatLearned,
    hasEvidence,
    !!learning.custom_fields?.impact,
    !!learning.custom_fields?.action_taken,
    hasNextSteps
  ];
  const completeness = Math.round((completenessItems.filter(Boolean).length / completenessItems.length) * 100);

  return (
    <div
      className={`pdw-learning-card ${selected ? 'pdw-learning-card--selected' : ''}`}
      onClick={() => onSelect(learning)}
    >
      <div className="pdw-learning-card__timeline-marker">
        <SchoolIcon style={{ color: '#22c55e' }} />
      </div>

      <div className="pdw-learning-card__content">
        <div className="pdw-learning-card__header">
          <span className="pdw-learning-card__date">
            {new Date(learning.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <ImpactBadge impact={learning.custom_fields?.impact} />
        </div>

        <h4 className="pdw-learning-card__title">{learning.name}</h4>

        {hasWhatLearned ? (
          <p className="pdw-learning-card__takeaway">
            <strong>Key Takeaway:</strong> {learning.custom_fields.what_learned}
          </p>
        ) : (
          <div className="pdw-learning-card__missing">
            <InfoIcon fontSize="small" />
            <span>Add the key takeaway - what did you learn?</span>
          </div>
        )}

        {learning.description && (
          <p className="pdw-learning-card__description">
            {learning.description.slice(0, 200)}
            {learning.description.length > 200 ? '...' : ''}
          </p>
        )}

        {hasEvidence ? (
          <div className="pdw-learning-card__evidence">
            <strong>Evidence:</strong> {learning.custom_fields.evidence.slice(0, 150)}
            {learning.custom_fields.evidence.length > 150 ? '...' : ''}
          </div>
        ) : (
          <div className="pdw-learning-card__missing">
            <InfoIcon fontSize="small" />
            <span>Consider adding evidence to support this learning</span>
          </div>
        )}

        {hasNextSteps && (
          <div className="pdw-learning-card__next-steps">
            <strong>Next Steps:</strong> {learning.custom_fields.next_steps}
          </div>
        )}

        <div className="pdw-learning-card__footer">
          <div
            className="pdw-learning-card__action"
            style={{ color: actionConfig.color, borderColor: actionConfig.color }}
          >
            <ActionIcon fontSize="small" />
            <span>{actionConfig.label}</span>
          </div>

          {/* Action hint */}
          <div className="pdw-learning-card__action-hint">
            <span>{actionConfig.hint}</span>
          </div>

          {relatedItems.length > 0 && (
            <div className="pdw-learning-card__related">
              <LinkIcon fontSize="small" />
              <span>{relatedItems.length} linked</span>
            </div>
          )}

          {/* Completeness indicator */}
          <div className="pdw-learning-card__completeness">
            <div className="pdw-learning-card__completeness-bar">
              <div
                className="pdw-learning-card__completeness-fill"
                style={{
                  width: `${completeness}%`,
                  backgroundColor: completeness > 70 ? '#22c55e' : completeness > 40 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <span>{completeness}%</span>
          </div>

          <button
            className="pdw-learning-card__edit"
            onClick={(e) => { e.stopPropagation(); onEdit(learning); }}
          >
            <EditIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Learning list row
function LearningListRow({ learning, onSelect, onEdit, selected }) {
  const actionConfig = ACTION_CONFIG[learning.custom_fields?.action_taken] || ACTION_CONFIG['No Action'];
  const ActionIcon = actionConfig.icon;

  return (
    <div
      className={`pdw-learning-row ${selected ? 'pdw-learning-row--selected' : ''}`}
      onClick={() => onSelect(learning)}
    >
      <span className="pdw-learning-row__date">
        {new Date(learning.created_at).toLocaleDateString()}
      </span>
      <div className="pdw-learning-row__content">
        <span className="pdw-learning-row__title">{learning.name}</span>
        {learning.custom_fields?.what_learned && (
          <span className="pdw-learning-row__takeaway">
            {learning.custom_fields.what_learned.slice(0, 80)}...
          </span>
        )}
      </div>
      <ImpactBadge impact={learning.custom_fields?.impact} />
      <div
        className="pdw-learning-row__action"
        style={{ color: actionConfig.color }}
      >
        <ActionIcon fontSize="small" />
        <span>{actionConfig.label}</span>
      </div>
      <button
        className="pdw-learning-row__edit"
        onClick={(e) => { e.stopPropagation(); onEdit(learning); }}
      >
        <EditIcon fontSize="small" />
      </button>
    </div>
  );
}

// Stats summary with insights
function LearningSummary({ learnings }) {
  const stats = useMemo(() => {
    const total = learnings.length;
    const byImpact = {
      Major: learnings.filter(l => l.custom_fields?.impact === 'Major').length,
      Minor: learnings.filter(l => l.custom_fields?.impact === 'Minor').length,
      None: learnings.filter(l => l.custom_fields?.impact === 'None' || !l.custom_fields?.impact).length,
    };
    const byAction = {
      Continue: learnings.filter(l => l.custom_fields?.action_taken === 'Continue').length,
      Pivot: learnings.filter(l => l.custom_fields?.action_taken === 'Pivot').length,
      Persevere: learnings.filter(l => l.custom_fields?.action_taken === 'Persevere').length,
      Stop: learnings.filter(l => l.custom_fields?.action_taken === 'Stop').length,
    };

    const needsAction = learnings.filter(l =>
      !l.custom_fields?.action_taken || l.custom_fields?.action_taken === 'No Action'
    ).length;

    return { total, byImpact, byAction, needsAction };
  }, [learnings]);

  return (
    <div className="pdw-learning-summary">
      <div className="pdw-learning-summary__total">
        <SchoolIcon />
        <span className="pdw-learning-summary__value">{stats.total}</span>
        <span className="pdw-learning-summary__label">Total Learnings</span>
      </div>
      <div className="pdw-learning-summary__section">
        <span className="pdw-learning-summary__section-title">By Impact</span>
        <div className="pdw-learning-summary__breakdown">
          <span style={{ color: '#ef4444' }}>{stats.byImpact.Major} Major</span>
          <span style={{ color: '#f59e0b' }}>{stats.byImpact.Minor} Minor</span>
        </div>
      </div>
      <div className="pdw-learning-summary__section">
        <span className="pdw-learning-summary__section-title">Actions Taken</span>
        <div className="pdw-learning-summary__breakdown">
          <span style={{ color: '#22c55e' }}>{stats.byAction.Continue} Continue</span>
          <span style={{ color: '#f59e0b' }}>{stats.byAction.Pivot} Pivot</span>
          <span style={{ color: '#ef4444' }}>{stats.byAction.Stop} Stop</span>
        </div>
      </div>
      {stats.needsAction > 0 && (
        <div className="pdw-learning-summary__alert">
          <InfoIcon style={{ color: '#f59e0b' }} />
          <span>{stats.needsAction} learning{stats.needsAction > 1 ? 's' : ''} need action</span>
        </div>
      )}
    </div>
  );
}

export default function LearningLog({
  onSelectLearning,
  onEditLearning,
  onDeleteLearning,
  onCreateLearning,
}) {
  const {
    artefacts,
    relationships,
    selectedId,
    setSelectedId,
    getRelated,
    loading,
  } = usePDW();

  const [viewMode, setViewMode] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [impactFilter, setImpactFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [showGuidance, setShowGuidance] = useState(false);

  // Get learnings
  const learnings = useMemo(() => {
    let items = artefacts.filter(a => a.artefact_type === 'pdw_learning');

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.custom_fields?.what_learned?.toLowerCase().includes(query)
      );
    }

    if (impactFilter !== 'all') {
      items = items.filter(a => a.custom_fields?.impact === impactFilter);
    }

    if (actionFilter !== 'all') {
      items = items.filter(a => a.custom_fields?.action_taken === actionFilter);
    }

    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [artefacts, searchQuery, impactFilter, actionFilter]);

  // Group by month for timeline
  const learningsByMonth = useMemo(() => {
    const grouped = {};
    learnings.forEach(learning => {
      const date = new Date(learning.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[key]) {
        grouped[key] = { label, items: [] };
      }
      grouped[key].items.push(learning);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  }, [learnings]);

  // Handlers
  const handleSelect = useCallback((learning) => {
    setSelectedId(learning.id);
    if (onSelectLearning) onSelectLearning(learning);
  }, [setSelectedId, onSelectLearning]);

  const handleEdit = useCallback((learning) => {
    if (onEditLearning) onEditLearning(learning);
  }, [onEditLearning]);

  const handleCreate = useCallback(() => {
    if (onCreateLearning) onCreateLearning('pdw_learning');
  }, [onCreateLearning]);

  if (loading) {
    return (
      <div className="pdw-board pdw-board--loading">
        <div className="pdw-loading-spinner" />
        <p>Loading learnings...</p>
      </div>
    );
  }

  const isEmpty = learnings.length === 0 && !searchQuery && impactFilter === 'all' && actionFilter === 'all';

  return (
    <div className="pdw-board pdw-board--learning">
      {/* Guidance Panel (Overlay) */}
      {showGuidance && (
        <GuidancePanel onClose={() => setShowGuidance(false)} />
      )}

      {/* Header */}
      <div className="pdw-board__header">
        <div className="pdw-board__title">
          <h2>Learning Log</h2>
          <p>Capture insights from experiments, research, and validation activities</p>
        </div>

        <div className="pdw-board__controls">
          <div className="pdw-board__search">
            <SearchIcon fontSize="small" />
            <input
              type="text"
              placeholder="Search learnings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="pdw-board__filter">
            <FilterListIcon fontSize="small" />
            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value)}
            >
              <option value="all">All Impacts</option>
              <option value="Major">Major Impact</option>
              <option value="Minor">Minor Impact</option>
              <option value="None">No Impact</option>
            </select>
          </div>

          <div className="pdw-board__filter">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="Continue">Continue</option>
              <option value="Pivot">Pivot</option>
              <option value="Persevere">Persevere</option>
              <option value="Stop">Stop</option>
              <option value="No Action">No Action</option>
            </select>
          </div>

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
      {!isEmpty && <LearningSummary learnings={learnings} />}

      {/* Quick Actions with Help */}
      <div className="pdw-board__quick-actions pdw-board__quick-actions--inline">
        <button
          className="btn btn--primary btn--sm"
          onClick={handleCreate}
        >
          <AddIcon fontSize="small" />
          Capture Learning
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => setShowGuidance(true)}
        >
          <HelpIcon fontSize="small" />
          How to capture learnings
        </button>
      </div>

      {/* Empty State with Quick Start */}
      {isEmpty && <QuickStartCard onCreate={handleCreate} />}

      {/* Content */}
      {!isEmpty && viewMode === 'timeline' && (
        <div className="pdw-learning-timeline">
          {learningsByMonth.map(([key, group]) => (
            <div key={key} className="pdw-learning-timeline__month">
              <div className="pdw-learning-timeline__month-header">
                <h3>{group.label}</h3>
                <span className="pdw-learning-timeline__month-count">
                  {group.items.length} {group.items.length === 1 ? 'learning' : 'learnings'}
                </span>
              </div>
              <div className="pdw-learning-timeline__items">
                {group.items.map(learning => (
                  <LearningTimelineCard
                    key={learning.id}
                    learning={learning}
                    onSelect={handleSelect}
                    onEdit={handleEdit}
                    selected={learning.id === selectedId}
                    relatedItems={getRelated(learning.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isEmpty && viewMode === 'list' && (
        <div className="pdw-learning-list">
          <div className="pdw-learning-list__header">
            <span className="pdw-learning-list__col--date">Date</span>
            <span className="pdw-learning-list__col--content">Learning</span>
            <span className="pdw-learning-list__col--impact">Impact</span>
            <span className="pdw-learning-list__col--action">Action</span>
            <span className="pdw-learning-list__col--edit" />
          </div>
          <div className="pdw-learning-list__body">
            {learnings.map(learning => (
              <LearningListRow
                key={learning.id}
                learning={learning}
                onSelect={handleSelect}
                onEdit={handleEdit}
                selected={learning.id === selectedId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filtered Empty State */}
      {!isEmpty && learnings.length === 0 && (impactFilter !== 'all' || actionFilter !== 'all' || searchQuery) && (
        <div className="pdw-board__empty-filtered">
          <p>No learnings match your filters.</p>
          <button
            className="btn btn--secondary"
            onClick={() => {
              setImpactFilter('all');
              setActionFilter('all');
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
