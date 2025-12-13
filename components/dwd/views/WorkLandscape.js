// components/dwd/views/WorkLandscape.js
// DWD Work Landscape View - Work items clustered by volatility and state
// Includes comprehensive guidance on assessing work volatility and managing work items

import { useState, useMemo } from 'react';
import { useDWD } from '../DWDContext';
import DWDArtefactCard from '../artefacts/DWDArtefactCard';

// MUI Icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import SearchIcon from '@mui/icons-material/Search';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Work Landscape guidance content
const WORK_LANDSCAPE_GUIDANCE = {
  purpose: "The Work Landscape maps all work activities in your system by their volatility - how unpredictable and variable the work is. Understanding volatility helps you design appropriate coordination mechanisms and actor assignments.",
  whatIsVolatility: {
    description: "Volatility measures how much work varies in timing, scope, requirements, and outcomes. High volatility work needs flexible responses; low volatility work benefits from standardization.",
    factors: [
      { name: "Timing Variability", description: "Does the work arrive predictably or randomly?" },
      { name: "Scope Changes", description: "Do requirements change during execution?" },
      { name: "Exception Frequency", description: "How often do unusual situations occur?" },
      { name: "Outcome Uncertainty", description: "Is the result predictable or variable?" },
      { name: "External Dependencies", description: "Does it depend on unpredictable external factors?" }
    ]
  },
  volatilityLevels: [
    {
      level: "High Volatility",
      color: "#ef4444",
      description: "Unpredictable, rapidly changing work requiring adaptive responses",
      characteristics: [
        "Arrives unexpectedly or with variable timing",
        "Requirements often change mid-execution",
        "Many exceptions and edge cases",
        "Outcomes difficult to predict",
        "Heavily dependent on external factors"
      ],
      implications: [
        "Needs actors with broad skills and authority",
        "Requires flexible coordination (not rigid processes)",
        "Benefits from direct communication channels",
        "May need slack capacity to handle spikes"
      ],
      examples: ["Customer complaints", "Emergency repairs", "Novel problems", "Crisis response"]
    },
    {
      level: "Medium Volatility",
      color: "#f59e0b",
      description: "Some variability expected but patterns exist",
      characteristics: [
        "Generally predictable with occasional spikes",
        "Core requirements stable, details may vary",
        "Known exception patterns",
        "Outcomes within expected range"
      ],
      implications: [
        "Can use structured processes with exception paths",
        "Actors need some discretion within guidelines",
        "Standard coordination with escalation routes"
      ],
      examples: ["Project work", "Sales support", "Maintenance tasks", "Onboarding"]
    },
    {
      level: "Low Volatility",
      color: "#10b981",
      description: "Predictable, stable work that follows patterns",
      characteristics: [
        "Arrives on schedule or follows patterns",
        "Requirements well-defined and stable",
        "Few exceptions, mostly routine",
        "Outcomes highly predictable"
      ],
      implications: [
        "Can standardize and automate",
        "Actors can specialize deeply",
        "Formal coordination mechanisms work well",
        "Efficient resource planning possible"
      ],
      examples: ["Payroll processing", "Regular reporting", "Standard orders", "Routine maintenance"]
    }
  ],
  workItems: {
    definition: "A work item represents a type of work activity that needs to be performed. It's not a specific task but a category of work that recurs.",
    goodWorkItem: [
      "Represents a meaningful unit of work (not too granular)",
      "Has clear triggers and outcomes",
      "Can be characterized by its volatility",
      "Has identifiable actors who perform it",
      "Occurs with enough frequency to matter"
    ],
    badWorkItem: [
      "Too granular (e.g., 'Send email' vs 'Handle customer inquiry')",
      "Too abstract (e.g., 'Do work' vs specific activity)",
      "One-time events rather than recurring patterns",
      "Unclear who performs it or when"
    ]
  },
  signals: {
    definition: "Signals are observations that indicate problems, opportunities, or changes in work patterns. They trigger adjustments to how work is designed.",
    types: [
      { name: "Bottleneck", description: "Work piling up, delays increasing" },
      { name: "Quality Issue", description: "Errors, rework, complaints increasing" },
      { name: "Mismatch", description: "Wrong people handling wrong work" },
      { name: "Overload", description: "Actors stretched beyond capacity" },
      { name: "Underload", description: "Actors have idle capacity" },
      { name: "Coordination Failure", description: "Handoffs failing, miscommunication" }
    ]
  },
  tips: [
    "Start by listing all recurring work types, not specific tasks",
    "Assess volatility based on actual patterns, not assumptions",
    "Work that feels 'chaotic' is often just high volatility (not bad)",
    "Low volatility work isn't better - it just needs different design",
    "Signals help you spot when design doesn't match reality"
  ],
  pitfalls: [
    "Treating all work as if it's low volatility (over-standardizing)",
    "Making work items too granular (losing the big picture)",
    "Ignoring signals because the process 'should' work",
    "Assigning volatility based on preference rather than reality",
    "Forgetting that volatility can change over time"
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
          <span>Work Landscape Guide</span>
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
            <span>What is the Work Landscape?</span>
            <ChevronRightIcon className={expandedSection === 'purpose' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'purpose' && (
            <div className="dwd-guidance-section__body">
              <p>{WORK_LANDSCAPE_GUIDANCE.purpose}</p>
            </div>
          )}
        </div>

        {/* What is Volatility */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'volatility' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'volatility' ? null : 'volatility')}
          >
            <span>What is Volatility?</span>
            <ChevronRightIcon className={expandedSection === 'volatility' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'volatility' && (
            <div className="dwd-guidance-section__body">
              <p>{WORK_LANDSCAPE_GUIDANCE.whatIsVolatility.description}</p>
              <h5>Factors that create volatility:</h5>
              <div className="dwd-factors-list">
                {WORK_LANDSCAPE_GUIDANCE.whatIsVolatility.factors.map((factor, i) => (
                  <div key={i} className="dwd-factor-item">
                    <strong>{factor.name}</strong>
                    <span>{factor.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Volatility Levels */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'levels' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'levels' ? null : 'levels')}
          >
            <span>Volatility Levels Explained</span>
            <ChevronRightIcon className={expandedSection === 'levels' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'levels' && (
            <div className="dwd-guidance-section__body">
              {WORK_LANDSCAPE_GUIDANCE.volatilityLevels.map((level, i) => (
                <div key={i} className="dwd-volatility-level" style={{ borderLeftColor: level.color }}>
                  <h5 style={{ color: level.color }}>{level.level}</h5>
                  <p className="dwd-volatility-desc">{level.description}</p>
                  <div className="dwd-volatility-details">
                    <div className="dwd-volatility-chars">
                      <strong>Characteristics:</strong>
                      <ul>
                        {level.characteristics.map((c, j) => <li key={j}>{c}</li>)}
                      </ul>
                    </div>
                    <div className="dwd-volatility-implications">
                      <strong>Design Implications:</strong>
                      <ul>
                        {level.implications.map((imp, j) => <li key={j}>{imp}</li>)}
                      </ul>
                    </div>
                    <div className="dwd-volatility-examples">
                      <strong>Examples:</strong>
                      <span>{level.examples.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Work Items */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'workitems' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'workitems' ? null : 'workitems')}
          >
            <span>What Makes a Good Work Item?</span>
            <ChevronRightIcon className={expandedSection === 'workitems' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'workitems' && (
            <div className="dwd-guidance-section__body">
              <p>{WORK_LANDSCAPE_GUIDANCE.workItems.definition}</p>
              <div className="dwd-tips-donts">
                <div className="dwd-tips">
                  <h5><CheckCircleIcon style={{ color: '#22c55e' }} /> Good Work Items</h5>
                  <ul>
                    {WORK_LANDSCAPE_GUIDANCE.workItems.goodWorkItem.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="dwd-donts">
                  <h5><CancelIcon style={{ color: '#ef4444' }} /> Avoid</h5>
                  <ul>
                    {WORK_LANDSCAPE_GUIDANCE.workItems.badWorkItem.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Signals */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'signals' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'signals' ? null : 'signals')}
          >
            <span>Understanding Signals</span>
            <ChevronRightIcon className={expandedSection === 'signals' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'signals' && (
            <div className="dwd-guidance-section__body">
              <p>{WORK_LANDSCAPE_GUIDANCE.signals.definition}</p>
              <div className="dwd-signal-types">
                {WORK_LANDSCAPE_GUIDANCE.signals.types.map((type, i) => (
                  <div key={i} className="dwd-signal-type">
                    <strong>{type.name}</strong>
                    <span>{type.description}</span>
                  </div>
                ))}
              </div>
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
                    {WORK_LANDSCAPE_GUIDANCE.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="dwd-donts">
                  <h5><CancelIcon style={{ color: '#ef4444' }} /> Common Mistakes</h5>
                  <ul>
                    {WORK_LANDSCAPE_GUIDANCE.pitfalls.map((pitfall, i) => (
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
        <h3>Mapping Your Work Landscape</h3>
      </div>
      <p className="dwd-quickstart__description">
        The work landscape shows all recurring work activities in your system, organized by how volatile
        (unpredictable) each type of work is. This helps you design appropriate coordination mechanisms.
      </p>
      <div className="dwd-quickstart__flow">
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">1</span>
          <span>List all recurring work types</span>
        </div>
        <ArrowForwardIcon className="dwd-quickstart__arrow" />
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">2</span>
          <span>Assess volatility of each</span>
        </div>
        <ArrowForwardIcon className="dwd-quickstart__arrow" />
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">3</span>
          <span>Identify who handles each</span>
        </div>
        <ArrowForwardIcon className="dwd-quickstart__arrow" />
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">4</span>
          <span>Note mismatches & signals</span>
        </div>
      </div>
      <div className="dwd-quickstart__volatility-hint">
        <h4>Quick Volatility Assessment:</h4>
        <div className="dwd-quickstart__volatility-guide">
          <div className="dwd-quickstart__vol-level" style={{ borderColor: '#ef4444' }}>
            <SpeedIcon style={{ color: '#ef4444' }} />
            <div>
              <strong style={{ color: '#ef4444' }}>High Volatility</strong>
              <span>Arrives unpredictably, requirements change often, many exceptions</span>
            </div>
          </div>
          <div className="dwd-quickstart__vol-level" style={{ borderColor: '#f59e0b' }}>
            <TrendingUpIcon style={{ color: '#f59e0b' }} />
            <div>
              <strong style={{ color: '#f59e0b' }}>Medium Volatility</strong>
              <span>Some patterns but variability, known exception types</span>
            </div>
          </div>
          <div className="dwd-quickstart__vol-level" style={{ borderColor: '#10b981' }}>
            <TrendingDownIcon style={{ color: '#10b981' }} />
            <div>
              <strong style={{ color: '#10b981' }}>Low Volatility</strong>
              <span>Predictable timing, stable requirements, routine handling</span>
            </div>
          </div>
        </div>
      </div>
      <div className="dwd-quickstart__actions">
        <button className="btn btn--primary" onClick={() => onCreate?.('dwd_work_item')}>
          <AddIcon fontSize="small" />
          Add Your First Work Item
        </button>
      </div>
    </div>
  );
}

// Volatility column header with guidance
function VolatilityColumnHeader({ level, count, color }) {
  const levelInfo = WORK_LANDSCAPE_GUIDANCE.volatilityLevels.find(l => l.level.toLowerCase().includes(level));

  return (
    <div className="dwd-matrix-header" style={{ backgroundColor: `${color}15`, borderColor: color }}>
      <div className="dwd-matrix-header__main">
        <span className="dwd-matrix-title">{levelInfo?.level || `${level} Volatility`}</span>
        <span className="dwd-matrix-count">{count}</span>
      </div>
      <span className="dwd-matrix-hint">{levelInfo?.description || ''}</span>
      {levelInfo?.examples && (
        <span className="dwd-matrix-examples">
          <InfoIcon fontSize="small" />
          e.g., {levelInfo.examples.slice(0, 2).join(', ')}
        </span>
      )}
    </div>
  );
}

export default function WorkLandscape({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const {
    artefacts,
    getArtefactsByType,
    activeCase,
    getCaseArtefacts,
    DWD_WORK_ITEM_STATE,
    DWD_VOLATILITY_LEVELS,
  } = useDWD();

  const [viewMode, setViewMode] = useState('matrix');
  const [stateFilter, setStateFilter] = useState('all');
  const [volatilityFilter, setVolatilityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuidance, setShowGuidance] = useState(false);

  // Get work items (filtered by active case if set)
  const workItems = useMemo(() => {
    const items = activeCase
      ? getCaseArtefacts().filter(a => a.artefact_type === 'dwd_work_item')
      : getArtefactsByType('dwd_work_item');

    return items.filter(item => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!item.name.toLowerCase().includes(search) &&
            !item.description?.toLowerCase().includes(search)) {
          return false;
        }
      }

      if (stateFilter !== 'all') {
        const itemState = item.custom_fields?.item_state || 'open';
        if (itemState !== stateFilter) return false;
      }

      if (volatilityFilter !== 'all') {
        const volatility = item.custom_fields?.volatility || 'medium';
        if (volatility !== volatilityFilter) return false;
      }

      return true;
    });
  }, [activeCase, getCaseArtefacts, getArtefactsByType, searchTerm, stateFilter, volatilityFilter]);

  // Get signals related to work items
  const signals = useMemo(() => {
    const allSignals = activeCase
      ? getCaseArtefacts().filter(a => a.artefact_type === 'dwd_signal')
      : getArtefactsByType('dwd_signal');
    return allSignals;
  }, [activeCase, getCaseArtefacts, getArtefactsByType]);

  // Group by volatility for matrix view
  const itemsByVolatility = useMemo(() => {
    const groups = {
      high: workItems.filter(i => i.custom_fields?.volatility === 'high'),
      medium: workItems.filter(i => i.custom_fields?.volatility === 'medium' || !i.custom_fields?.volatility),
      low: workItems.filter(i => i.custom_fields?.volatility === 'low'),
    };
    return groups;
  }, [workItems]);

  // Stats
  const stats = useMemo(() => ({
    total: workItems.length,
    blocked: workItems.filter(i => i.custom_fields?.item_state === 'blocked').length,
    highVolatility: workItems.filter(i => i.custom_fields?.volatility === 'high').length,
    signals: signals.length,
    highImpactSignals: signals.filter(s => s.custom_fields?.impact === 'high').length,
  }), [workItems, signals]);

  const isEmpty = workItems.length === 0 && !searchTerm && stateFilter === 'all' && volatilityFilter === 'all';

  return (
    <div className="dwd-work-landscape">
      {/* Guidance Panel */}
      {showGuidance && (
        <GuidancePanel onClose={() => setShowGuidance(false)} />
      )}

      {/* Header with stats */}
      <div className="dwd-view-header">
        <div className="dwd-view-header__left">
          <h2>Work Landscape</h2>
          <p>Map work activities by volatility to design appropriate coordination</p>
        </div>

        <div className="dwd-view-stats">
          <span className="dwd-view-stat">
            <AssignmentIcon fontSize="small" />
            {stats.total} work items
          </span>
          {stats.blocked > 0 && (
            <span className="dwd-view-stat dwd-view-stat--warning">
              {stats.blocked} blocked
            </span>
          )}
          {stats.highVolatility > 0 && (
            <span className="dwd-view-stat dwd-view-stat--danger">
              {stats.highVolatility} high volatility
            </span>
          )}
          {stats.signals > 0 && (
            <span className="dwd-view-stat">
              <WarningIcon fontSize="small" />
              {stats.signals} signals
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
            placeholder="Search work items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <select
          className="dwd-filter-select"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
        >
          <option value="all">All states</option>
          {DWD_WORK_ITEM_STATE?.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          className="dwd-filter-select"
          value={volatilityFilter}
          onChange={(e) => setVolatilityFilter(e.target.value)}
        >
          <option value="all">All volatility</option>
          {DWD_VOLATILITY_LEVELS?.map(v => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>

        {/* View toggle */}
        <div className="dwd-view-toggle">
          <button
            className={viewMode === 'matrix' ? 'active' : ''}
            onClick={() => setViewMode('matrix')}
            title="Matrix view"
          >
            <ViewModuleIcon fontSize="small" />
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

        {/* Create button */}
        <button
          className="btn btn--primary btn--small"
          onClick={() => onCreateArtefact?.('dwd_work_item')}
        >
          <AddIcon fontSize="small" />
          Add Work Item
        </button>
      </div>

      {/* Empty State with Quick Start */}
      {isEmpty && <QuickStartCard onCreate={onCreateArtefact} />}

      {/* Matrix View */}
      {!isEmpty && viewMode === 'matrix' && (
        <div className="dwd-volatility-matrix">
          {/* High Volatility */}
          <div className="dwd-matrix-column dwd-matrix-column--high">
            <VolatilityColumnHeader level="high" count={itemsByVolatility.high.length} color="#ef4444" />
            <div className="dwd-matrix-content">
              {itemsByVolatility.high.length === 0 ? (
                <div className="dwd-matrix-empty">
                  <p>No high volatility items</p>
                  <span className="dwd-matrix-empty-hint">
                    Work with unpredictable timing or changing requirements
                  </span>
                </div>
              ) : (
                itemsByVolatility.high.map(item => (
                  <DWDArtefactCard
                    key={item.id}
                    artefact={item}
                    onSelect={onSelectArtefact}
                    onEdit={onEditArtefact}
                    onDelete={onDeleteArtefact}
                  />
                ))
              )}
            </div>
          </div>

          {/* Medium Volatility */}
          <div className="dwd-matrix-column dwd-matrix-column--medium">
            <VolatilityColumnHeader level="medium" count={itemsByVolatility.medium.length} color="#f59e0b" />
            <div className="dwd-matrix-content">
              {itemsByVolatility.medium.length === 0 ? (
                <div className="dwd-matrix-empty">
                  <p>No medium volatility items</p>
                  <span className="dwd-matrix-empty-hint">
                    Work with some variability but known patterns
                  </span>
                </div>
              ) : (
                itemsByVolatility.medium.map(item => (
                  <DWDArtefactCard
                    key={item.id}
                    artefact={item}
                    onSelect={onSelectArtefact}
                    onEdit={onEditArtefact}
                    onDelete={onDeleteArtefact}
                  />
                ))
              )}
            </div>
          </div>

          {/* Low Volatility */}
          <div className="dwd-matrix-column dwd-matrix-column--low">
            <VolatilityColumnHeader level="low" count={itemsByVolatility.low.length} color="#10b981" />
            <div className="dwd-matrix-content">
              {itemsByVolatility.low.length === 0 ? (
                <div className="dwd-matrix-empty">
                  <p>No low volatility items</p>
                  <span className="dwd-matrix-empty-hint">
                    Predictable, routine work that follows patterns
                  </span>
                </div>
              ) : (
                itemsByVolatility.low.map(item => (
                  <DWDArtefactCard
                    key={item.id}
                    artefact={item}
                    onSelect={onSelectArtefact}
                    onEdit={onEditArtefact}
                    onDelete={onDeleteArtefact}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {!isEmpty && viewMode === 'list' && (
        <div className="dwd-list-view">
          <div className="dwd-cards-list">
            {workItems.map(item => (
              <DWDArtefactCard
                key={item.id}
                artefact={item}
                onSelect={onSelectArtefact}
                onEdit={onEditArtefact}
                onDelete={onDeleteArtefact}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filtered Empty State */}
      {!isEmpty && workItems.length === 0 && (
        <div className="dwd-empty-filtered">
          <p>No work items match your filters.</p>
          <button
            className="btn btn--secondary"
            onClick={() => {
              setSearchTerm('');
              setStateFilter('all');
              setVolatilityFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Signals Panel */}
      {signals.length > 0 && (
        <div className="dwd-signals-panel">
          <h4>
            <WarningIcon fontSize="small" />
            Related Signals ({signals.length})
            {stats.highImpactSignals > 0 && (
              <span className="dwd-signals-panel__alert">
                {stats.highImpactSignals} high impact
              </span>
            )}
          </h4>
          <p className="dwd-signals-panel__hint">
            Signals indicate problems or opportunities in how work is being handled
          </p>
          <div className="dwd-signals-list">
            {signals.slice(0, 5).map(signal => (
              <DWDArtefactCard
                key={signal.id}
                artefact={signal}
                compact
                onSelect={onSelectArtefact}
                showActions={false}
              />
            ))}
            {signals.length > 5 && (
              <button className="dwd-signals-more">
                +{signals.length - 5} more signals
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
