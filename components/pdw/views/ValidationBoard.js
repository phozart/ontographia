// components/pdw/views/ValidationBoard.js
// Validation board for experiments and assumptions with matrix and timeline views
// Includes comprehensive guidance on how to validate product ideas

import { useState, useMemo, useCallback } from 'react';
import { usePDW } from '../PDWContext';
import PDWArtefactCard from '../artefacts/PDWArtefactCard';

// MUI Icons
import BiotechIcon from '@mui/icons-material/Biotech';
import WarningIcon from '@mui/icons-material/Warning';
import ScienceIcon from '@mui/icons-material/Science';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Guidance content
const VALIDATION_GUIDANCE = {
  experiments: {
    purpose: "Experiments help you test hypotheses and validate assumptions with real evidence before committing resources.",
    when: [
      "You have a hypothesis you need to prove or disprove",
      "Before making significant product decisions",
      "When stakeholders need evidence to proceed",
      "To reduce risk of building the wrong thing"
    ],
    howTo: [
      "Define a clear, testable hypothesis",
      "Choose the smallest experiment that can provide evidence",
      "Set success criteria BEFORE running the experiment",
      "Document results objectively, even if they contradict expectations"
    ],
    methods: [
      { name: "User Interview", description: "Talk to 5-10 users about their problems and behaviors", duration: "1-2 weeks" },
      { name: "Landing Page Test", description: "Create a simple page and measure sign-up conversion", duration: "1-2 weeks" },
      { name: "Prototype Test", description: "Build a clickable prototype and observe users interact", duration: "1-3 weeks" },
      { name: "Concierge MVP", description: "Manually deliver the service before automating", duration: "2-4 weeks" },
      { name: "A/B Test", description: "Compare two variants with real users", duration: "1-4 weeks" },
      { name: "Smoke Test", description: "Measure demand before building (fake door test)", duration: "1 week" }
    ],
    tips: [
      "Start with the riskiest assumption first",
      "Make experiments as small and fast as possible",
      "Don't over-engineer - learn quickly and iterate",
      "Invalid results are still valuable learning"
    ],
    donts: [
      "Don't run experiments without clear success criteria",
      "Don't ignore negative results",
      "Don't test multiple hypotheses at once",
      "Don't wait for perfect data - good enough is enough"
    ]
  },
  assumptions: {
    purpose: "Assumptions are beliefs that must be true for your product to succeed. Identifying and testing risky assumptions reduces failure risk.",
    types: [
      { name: "Desirability", description: "Do customers want this?", color: "#8b5cf6", examples: ["Users need this feature", "Price is acceptable"] },
      { name: "Feasibility", description: "Can we build/deliver this?", color: "#3b82f6", examples: ["Tech is achievable", "Team has skills"] },
      { name: "Viability", description: "Will this work for the business?", color: "#22c55e", examples: ["Can acquire customers", "Margins are sustainable"] }
    ],
    riskLevels: [
      { level: "High", action: "Test immediately - could kill the product", color: "#ef4444" },
      { level: "Medium", action: "Plan to test soon - significant impact", color: "#f59e0b" },
      { level: "Low", action: "Monitor but lower priority", color: "#22c55e" }
    ],
    matrix: {
      "high-none": { name: "Test Now", description: "High risk with no evidence. These assumptions are critical and must be validated immediately." },
      "high-some": { name: "Strengthen", description: "High risk with weak evidence. Gather more evidence to increase confidence." },
      "low-none": { name: "Consider", description: "Lower risk but no evidence. Keep on radar and test when convenient." },
      "low-some": { name: "Monitor", description: "Lower risk with some evidence. These are in good shape, just monitor." }
    }
  }
};

// Guidance panel component
function GuidancePanel({ type, onClose }) {
  const [expandedSection, setExpandedSection] = useState('purpose');
  const guidance = type === 'experiment' ? VALIDATION_GUIDANCE.experiments : VALIDATION_GUIDANCE.assumptions;

  return (
    <div className="pdw-guidance-panel">
      <div className="pdw-guidance-panel__header">
        <div className="pdw-guidance-panel__title">
          <LightbulbIcon />
          <span>{type === 'experiment' ? 'Experiment' : 'Assumption'} Guide</span>
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
            <span>What is it?</span>
            <ChevronRightIcon className={expandedSection === 'purpose' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'purpose' && (
            <div className="pdw-guidance-section__body">
              <p>{guidance.purpose}</p>
            </div>
          )}
        </div>

        {/* When to Use */}
        <div className="pdw-guidance-section">
          <button
            className={`pdw-guidance-section__header ${expandedSection === 'when' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'when' ? null : 'when')}
          >
            <span>When to use</span>
            <ChevronRightIcon className={expandedSection === 'when' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'when' && (
            <div className="pdw-guidance-section__body">
              <ul>
                {(guidance.when || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* How To */}
        {type === 'experiment' && (
          <div className="pdw-guidance-section">
            <button
              className={`pdw-guidance-section__header ${expandedSection === 'howTo' ? 'expanded' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'howTo' ? null : 'howTo')}
            >
              <span>How to run an experiment</span>
              <ChevronRightIcon className={expandedSection === 'howTo' ? 'rotated' : ''} />
            </button>
            {expandedSection === 'howTo' && (
              <div className="pdw-guidance-section__body">
                <ol className="pdw-guidance-steps">
                  {guidance.howTo.map((step, i) => (
                    <li key={i}>
                      <span className="step-number">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Methods */}
        {type === 'experiment' && (
          <div className="pdw-guidance-section">
            <button
              className={`pdw-guidance-section__header ${expandedSection === 'methods' ? 'expanded' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'methods' ? null : 'methods')}
            >
              <span>Experiment methods</span>
              <ChevronRightIcon className={expandedSection === 'methods' ? 'rotated' : ''} />
            </button>
            {expandedSection === 'methods' && (
              <div className="pdw-guidance-section__body">
                <div className="pdw-method-list">
                  {guidance.methods.map((method, i) => (
                    <div key={i} className="pdw-method-item">
                      <strong>{method.name}</strong>
                      <p>{method.description}</p>
                      <span className="pdw-method-duration">{method.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assumption Types */}
        {type === 'assumption' && (
          <div className="pdw-guidance-section">
            <button
              className={`pdw-guidance-section__header ${expandedSection === 'types' ? 'expanded' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'types' ? null : 'types')}
            >
              <span>Types of assumptions</span>
              <ChevronRightIcon className={expandedSection === 'types' ? 'rotated' : ''} />
            </button>
            {expandedSection === 'types' && (
              <div className="pdw-guidance-section__body">
                <div className="pdw-assumption-types">
                  {guidance.types.map((type, i) => (
                    <div key={i} className="pdw-assumption-type" style={{ borderColor: type.color }}>
                      <div className="pdw-assumption-type__header">
                        <span className="pdw-assumption-type__name" style={{ color: type.color }}>{type.name}</span>
                        <span className="pdw-assumption-type__question">{type.description}</span>
                      </div>
                      <div className="pdw-assumption-type__examples">
                        {type.examples.map((ex, j) => (
                          <span key={j}>{ex}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Risk Levels */}
        {type === 'assumption' && (
          <div className="pdw-guidance-section">
            <button
              className={`pdw-guidance-section__header ${expandedSection === 'risk' ? 'expanded' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'risk' ? null : 'risk')}
            >
              <span>Risk levels explained</span>
              <ChevronRightIcon className={expandedSection === 'risk' ? 'rotated' : ''} />
            </button>
            {expandedSection === 'risk' && (
              <div className="pdw-guidance-section__body">
                <div className="pdw-risk-levels">
                  {guidance.riskLevels.map((risk, i) => (
                    <div key={i} className="pdw-risk-level" style={{ borderLeftColor: risk.color }}>
                      <strong style={{ color: risk.color }}>{risk.level} Risk</strong>
                      <p>{risk.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        {type === 'experiment' && (
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
                    <h5><CheckCircleIcon style={{ color: '#22c55e' }} /> Do</h5>
                    <ul>
                      {guidance.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pdw-donts">
                    <h5><CancelIcon style={{ color: '#ef4444' }} /> Don't</h5>
                    <ul>
                      {guidance.donts.map((dont, i) => (
                        <li key={i}>{dont}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Matrix Explanation */}
        {type === 'assumption' && (
          <div className="pdw-guidance-section">
            <button
              className={`pdw-guidance-section__header ${expandedSection === 'matrix' ? 'expanded' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'matrix' ? null : 'matrix')}
            >
              <span>Understanding the matrix</span>
              <ChevronRightIcon className={expandedSection === 'matrix' ? 'rotated' : ''} />
            </button>
            {expandedSection === 'matrix' && (
              <div className="pdw-guidance-section__body">
                <div className="pdw-matrix-explanation">
                  {Object.entries(guidance.matrix).map(([key, value]) => (
                    <div key={key} className={`pdw-matrix-quadrant pdw-matrix-quadrant--${key}`}>
                      <strong>{value.name}</strong>
                      <p>{value.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Quick start card for new users
function QuickStartCard({ onCreateExperiment, onCreateAssumption }) {
  return (
    <div className="pdw-quickstart">
      <div className="pdw-quickstart__header">
        <TipsAndUpdatesIcon />
        <h3>Getting Started with Validation</h3>
      </div>
      <p className="pdw-quickstart__description">
        Validation is about reducing risk by testing your ideas with real evidence before building.
        Start by identifying your assumptions, then design experiments to test them.
      </p>
      <div className="pdw-quickstart__flow">
        <div className="pdw-quickstart__step">
          <span className="pdw-quickstart__step-num">1</span>
          <span>List key assumptions about your product</span>
        </div>
        <ArrowForwardIcon className="pdw-quickstart__arrow" />
        <div className="pdw-quickstart__step">
          <span className="pdw-quickstart__step-num">2</span>
          <span>Prioritize by risk level</span>
        </div>
        <ArrowForwardIcon className="pdw-quickstart__arrow" />
        <div className="pdw-quickstart__step">
          <span className="pdw-quickstart__step-num">3</span>
          <span>Design experiments to test risky ones</span>
        </div>
        <ArrowForwardIcon className="pdw-quickstart__arrow" />
        <div className="pdw-quickstart__step">
          <span className="pdw-quickstart__step-num">4</span>
          <span>Capture learnings and decide</span>
        </div>
      </div>
      <div className="pdw-quickstart__actions">
        <button className="btn btn--secondary" onClick={onCreateAssumption}>
          <WarningIcon fontSize="small" />
          Start with Assumptions
        </button>
        <button className="btn btn--primary" onClick={onCreateExperiment}>
          <BiotechIcon fontSize="small" />
          Create Experiment
        </button>
      </div>
    </div>
  );
}

// Experiment status card with guidance
function ExperimentStatusCard({ experiment, onSelect, onEdit, selected }) {
  const outcome = experiment.custom_fields?.outcome || 'Not Started';
  const method = experiment.custom_fields?.method || 'No method specified';
  const hypothesis = experiment.custom_fields?.hypothesis || experiment.description;

  const outcomeConfig = {
    'Not Started': { icon: HelpIcon, color: '#64748b', bg: '#f1f5f9', hint: 'Define your hypothesis and success criteria' },
    'Running': { icon: PlayCircleIcon, color: '#3b82f6', bg: '#eff6ff', hint: 'Experiment in progress - collect data' },
    'Validated': { icon: CheckCircleIcon, color: '#22c55e', bg: '#f0fdf4', hint: 'Hypothesis confirmed - proceed with confidence' },
    'Invalidated': { icon: CancelIcon, color: '#ef4444', bg: '#fef2f2', hint: 'Hypothesis disproved - pivot or iterate' },
    'Inconclusive': { icon: HelpIcon, color: '#f59e0b', bg: '#fffbeb', hint: 'More evidence needed - refine experiment' },
  };

  const config = outcomeConfig[outcome] || outcomeConfig['Not Started'];
  const OutcomeIcon = config.icon;

  return (
    <div
      className={`pdw-experiment-card ${selected ? 'pdw-experiment-card--selected' : ''}`}
      onClick={() => onSelect(experiment)}
      style={{ borderLeftColor: config.color }}
    >
      <div className="pdw-experiment-card__header">
        <span className="pdw-experiment-card__method">{method}</span>
        <div
          className="pdw-experiment-card__outcome"
          style={{ backgroundColor: config.bg, color: config.color }}
        >
          <OutcomeIcon fontSize="small" />
          <span>{outcome}</span>
        </div>
      </div>
      <h4 className="pdw-experiment-card__title">{experiment.name}</h4>

      {hypothesis && (
        <p className="pdw-experiment-card__hypothesis">
          <strong>Hypothesis:</strong> {hypothesis.slice(0, 120)}
          {hypothesis.length > 120 ? '...' : ''}
        </p>
      )}

      {experiment.custom_fields?.success_criteria && (
        <p className="pdw-experiment-card__criteria">
          <strong>Success Criteria:</strong> {experiment.custom_fields.success_criteria.slice(0, 100)}
          {experiment.custom_fields.success_criteria.length > 100 ? '...' : ''}
        </p>
      )}

      <div className="pdw-experiment-card__hint">
        <InfoIcon fontSize="small" />
        <span>{config.hint}</span>
      </div>

      <div className="pdw-experiment-card__footer">
        {experiment.custom_fields?.duration && (
          <span>Duration: {experiment.custom_fields.duration}</span>
        )}
        {experiment.custom_fields?.sample_size && (
          <span>Sample: n={experiment.custom_fields.sample_size}</span>
        )}
      </div>
    </div>
  );
}

// Assumption matrix cell with guidance
function AssumptionMatrixCell({ assumptions, quadrant, onSelect, selectedId, onCreateInQuadrant }) {
  const quadrantConfig = {
    'high-none': {
      name: 'Test Now',
      color: '#ef4444',
      description: 'Critical risk, no evidence',
      action: 'Design experiments immediately for these assumptions'
    },
    'high-some': {
      name: 'Strengthen',
      color: '#f59e0b',
      description: 'High risk, weak evidence',
      action: 'Gather more evidence to increase confidence'
    },
    'low-none': {
      name: 'Consider',
      color: '#64748b',
      description: 'Lower risk, no evidence',
      action: 'Test when resources allow'
    },
    'low-some': {
      name: 'Monitor',
      color: '#22c55e',
      description: 'In good shape',
      action: 'Keep watching, focus elsewhere'
    },
  };

  const config = quadrantConfig[quadrant];

  return (
    <div className={`pdw-matrix__cell pdw-matrix__cell--${quadrant}`}>
      <div className="pdw-matrix__cell-header" style={{ borderBottomColor: config.color }}>
        <div>
          <span className="pdw-matrix__cell-name" style={{ color: config.color }}>{config.name}</span>
          <span className="pdw-matrix__cell-desc">{config.description}</span>
        </div>
        <span className="pdw-matrix__cell-count" style={{ backgroundColor: config.color }}>{assumptions.length}</span>
      </div>
      <div className="pdw-matrix__cell-action">
        <InfoIcon fontSize="small" />
        <span>{config.action}</span>
      </div>
      <div className="pdw-matrix__cell-body">
        {assumptions.map(assumption => (
          <div
            key={assumption.id}
            className={`pdw-matrix__item ${assumption.id === selectedId ? 'pdw-matrix__item--selected' : ''}`}
            onClick={() => onSelect(assumption)}
          >
            <span
              className="pdw-matrix__item-type"
              style={{
                backgroundColor: assumption.custom_fields?.assumption_type === 'Desirability' ? '#8b5cf6' :
                  assumption.custom_fields?.assumption_type === 'Feasibility' ? '#3b82f6' : '#22c55e'
              }}
            >
              {assumption.custom_fields?.assumption_type?.charAt(0) || '?'}
            </span>
            <span className="pdw-matrix__item-name">{assumption.name}</span>
          </div>
        ))}
        {assumptions.length === 0 && (
          <div className="pdw-matrix__cell-empty">
            <p>No assumptions in this quadrant</p>
            <button
              className="btn btn--secondary btn--sm"
              onClick={(e) => { e.stopPropagation(); onCreateInQuadrant(quadrant); }}
            >
              <AddIcon fontSize="small" />
              Add Assumption
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Assumption list row
function AssumptionRow({ assumption, onSelect, onEdit, selected }) {
  const riskColors = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#22c55e',
  };

  const typeColors = {
    Desirability: '#8b5cf6',
    Feasibility: '#3b82f6',
    Viability: '#22c55e',
  };

  const confidence = assumption.custom_fields?.confidence || 0;
  const confidenceLabel = confidence > 70 ? 'High' : confidence > 40 ? 'Medium' : 'Low';

  return (
    <div
      className={`pdw-assumption-row ${selected ? 'pdw-assumption-row--selected' : ''}`}
      onClick={() => onSelect(assumption)}
    >
      <span
        className="pdw-assumption-row__type"
        style={{ backgroundColor: typeColors[assumption.custom_fields?.assumption_type] || '#64748b' }}
      >
        {assumption.custom_fields?.assumption_type || 'Unknown'}
      </span>
      <div className="pdw-assumption-row__content">
        <span className="pdw-assumption-row__name">{assumption.name}</span>
        {assumption.custom_fields?.validation_method && (
          <span className="pdw-assumption-row__method">
            Test via: {assumption.custom_fields.validation_method}
          </span>
        )}
      </div>
      <span
        className="pdw-assumption-row__risk"
        style={{ color: riskColors[assumption.custom_fields?.risk_level] || '#64748b' }}
      >
        {assumption.custom_fields?.risk_level || '-'} Risk
      </span>
      <div className="pdw-assumption-row__confidence">
        <div className="pdw-assumption-row__confidence-bar">
          <div
            className="pdw-assumption-row__confidence-fill"
            style={{
              width: `${confidence}%`,
              backgroundColor: confidence > 70 ? '#22c55e' : confidence > 40 ? '#f59e0b' : '#ef4444'
            }}
          />
        </div>
        <span>{confidenceLabel} ({confidence}%)</span>
      </div>
      <span className="pdw-assumption-row__status">
        {assumption.custom_fields?.validation_status || 'Not Tested'}
      </span>
    </div>
  );
}

export default function ValidationBoard({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const {
    artefacts,
    selectedId,
    setSelectedId,
    getTypeDefinition,
    loading,
  } = usePDW();

  const [viewMode, setViewMode] = useState('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [showGuidance, setShowGuidance] = useState(null); // 'experiment' or 'assumption'

  // Get validation artefacts
  const validationArtefacts = useMemo(() => {
    let items = artefacts.filter(a =>
      a.artefact_type === 'pdw_experiment' || a.artefact_type === 'pdw_assumption'
    );

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      items = items.filter(a =>
        typeFilter === 'experiments' ? a.artefact_type === 'pdw_experiment' :
        a.artefact_type === 'pdw_assumption'
      );
    }

    if (riskFilter !== 'all') {
      items = items.filter(a =>
        a.artefact_type !== 'pdw_assumption' ||
        a.custom_fields?.risk_level === riskFilter
      );
    }

    return items;
  }, [artefacts, searchQuery, typeFilter, riskFilter]);

  const experiments = useMemo(() =>
    validationArtefacts.filter(a => a.artefact_type === 'pdw_experiment'),
    [validationArtefacts]
  );

  const assumptions = useMemo(() =>
    validationArtefacts.filter(a => a.artefact_type === 'pdw_assumption'),
    [validationArtefacts]
  );

  // Group assumptions for matrix
  const assumptionMatrix = useMemo(() => {
    const matrix = {
      'high-none': [],
      'high-some': [],
      'low-none': [],
      'low-some': [],
    };

    assumptions.forEach(a => {
      const risk = a.custom_fields?.risk_level || 'Medium';
      const confidence = a.custom_fields?.confidence || 0;

      const riskLevel = risk === 'High' ? 'high' : 'low';
      const evidenceLevel = confidence >= 50 ? 'some' : 'none';

      const key = `${riskLevel}-${evidenceLevel}`;
      if (matrix[key]) {
        matrix[key].push(a);
      }
    });

    return matrix;
  }, [assumptions]);

  // Stats
  const stats = useMemo(() => ({
    totalExperiments: experiments.length,
    running: experiments.filter(e => e.custom_fields?.outcome === 'Running').length,
    validated: experiments.filter(e => e.custom_fields?.outcome === 'Validated').length,
    invalidated: experiments.filter(e => e.custom_fields?.outcome === 'Invalidated').length,
    totalAssumptions: assumptions.length,
    highRisk: assumptions.filter(a => a.custom_fields?.risk_level === 'High').length,
    untested: assumptions.filter(a =>
      a.custom_fields?.validation_status === 'Not Tested' ||
      !a.custom_fields?.validation_status
    ).length,
  }), [experiments, assumptions]);

  // Handlers
  const handleSelect = useCallback((artefact) => {
    setSelectedId(artefact.id);
    if (onSelectArtefact) onSelectArtefact(artefact);
  }, [setSelectedId, onSelectArtefact]);

  const handleCreate = useCallback((type) => {
    if (onCreateArtefact) onCreateArtefact(type);
  }, [onCreateArtefact]);

  const handleCreateInQuadrant = useCallback((quadrant) => {
    // Pre-populate risk level based on quadrant
    handleCreate('pdw_assumption');
  }, [handleCreate]);

  if (loading) {
    return (
      <div className="pdw-board pdw-board--loading">
        <div className="pdw-loading-spinner" />
        <p>Loading validation items...</p>
      </div>
    );
  }

  const isEmpty = validationArtefacts.length === 0 && !searchQuery && typeFilter === 'all';

  return (
    <div className="pdw-board pdw-board--validation">
      {/* Guidance Panel (Overlay) */}
      {showGuidance && (
        <GuidancePanel type={showGuidance} onClose={() => setShowGuidance(null)} />
      )}

      {/* Header */}
      <div className="pdw-board__header">
        <div className="pdw-board__title">
          <h2>Validation Board</h2>
          <p>Test assumptions and run experiments to reduce risk and validate ideas</p>
        </div>

        <div className="pdw-board__controls">
          <div className="pdw-board__search">
            <SearchIcon fontSize="small" />
            <input
              type="text"
              placeholder="Search..."
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
              <option value="experiments">Experiments</option>
              <option value="assumptions">Assumptions</option>
            </select>
          </div>

          <div className="pdw-board__filter">
            <WarningIcon fontSize="small" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="all">All Risk</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          <div className="pdw-board__view-toggle">
            <button
              className={viewMode === 'matrix' ? 'active' : ''}
              onClick={() => setViewMode('matrix')}
              title="Matrix View"
            >
              <GridViewIcon fontSize="small" />
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

      {/* Stats Bar */}
      <div className="pdw-board__stats-bar">
        <div className="pdw-board__stat">
          <BiotechIcon fontSize="small" style={{ color: '#10b981' }} />
          <span className="pdw-board__stat-value">{stats.totalExperiments}</span>
          <span className="pdw-board__stat-label">Experiments</span>
        </div>
        <div className="pdw-board__stat">
          <PlayCircleIcon fontSize="small" style={{ color: '#3b82f6' }} />
          <span className="pdw-board__stat-value">{stats.running}</span>
          <span className="pdw-board__stat-label">Running</span>
        </div>
        <div className="pdw-board__stat">
          <CheckCircleIcon fontSize="small" style={{ color: '#22c55e' }} />
          <span className="pdw-board__stat-value">{stats.validated}</span>
          <span className="pdw-board__stat-label">Validated</span>
        </div>
        <div className="pdw-board__stat pdw-board__stat--divider" />
        <div className="pdw-board__stat">
          <WarningIcon fontSize="small" style={{ color: '#dc2626' }} />
          <span className="pdw-board__stat-value">{stats.totalAssumptions}</span>
          <span className="pdw-board__stat-label">Assumptions</span>
        </div>
        <div className="pdw-board__stat">
          <span className="pdw-board__stat-value" style={{ color: '#ef4444' }}>{stats.highRisk}</span>
          <span className="pdw-board__stat-label">High Risk</span>
        </div>
        <div className="pdw-board__stat">
          <span className="pdw-board__stat-value" style={{ color: '#f59e0b' }}>{stats.untested}</span>
          <span className="pdw-board__stat-label">Untested</span>
        </div>
      </div>

      {/* Quick Actions with Help */}
      <div className="pdw-board__quick-actions pdw-board__quick-actions--inline">
        <button
          className="btn btn--primary btn--sm"
          onClick={() => handleCreate('pdw_experiment')}
        >
          <BiotechIcon fontSize="small" />
          New Experiment
        </button>
        <button
          className="btn btn--secondary btn--sm"
          onClick={() => handleCreate('pdw_assumption')}
        >
          <WarningIcon fontSize="small" />
          New Assumption
        </button>
        <div className="pdw-board__help-buttons">
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setShowGuidance('experiment')}
          >
            <HelpIcon fontSize="small" />
            How to run experiments
          </button>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setShowGuidance('assumption')}
          >
            <HelpIcon fontSize="small" />
            About assumptions
          </button>
        </div>
      </div>

      {/* Empty State with Quick Start */}
      {isEmpty && (
        <QuickStartCard
          onCreateExperiment={() => handleCreate('pdw_experiment')}
          onCreateAssumption={() => handleCreate('pdw_assumption')}
        />
      )}

      {/* Content */}
      {!isEmpty && viewMode === 'matrix' && (
        <div className="pdw-validation__content">
          {/* Experiments Section */}
          <div className="pdw-validation__section">
            <div className="pdw-validation__section-header">
              <h3>
                <BiotechIcon fontSize="small" style={{ color: '#10b981' }} />
                Experiments
              </h3>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => setShowGuidance('experiment')}
              >
                <LightbulbIcon fontSize="small" />
                Learn more
              </button>
            </div>
            <div className="pdw-experiments-grid">
              {experiments.length === 0 ? (
                <div className="pdw-experiments-empty">
                  <BiotechIcon style={{ fontSize: 32, color: '#10b981', opacity: 0.5 }} />
                  <p>No experiments yet. Design experiments to test your riskiest assumptions.</p>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => handleCreate('pdw_experiment')}
                  >
                    <AddIcon fontSize="small" />
                    Create Experiment
                  </button>
                </div>
              ) : (
                experiments.map(exp => (
                  <ExperimentStatusCard
                    key={exp.id}
                    experiment={exp}
                    onSelect={handleSelect}
                    onEdit={onEditArtefact}
                    selected={exp.id === selectedId}
                  />
                ))
              )}
            </div>
          </div>

          {/* Assumptions Matrix */}
          <div className="pdw-validation__section">
            <div className="pdw-validation__section-header">
              <h3>
                <WarningIcon fontSize="small" style={{ color: '#dc2626' }} />
                Assumption Risk Matrix
              </h3>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => setShowGuidance('assumption')}
              >
                <LightbulbIcon fontSize="small" />
                How to use this
              </button>
            </div>
            <p className="pdw-validation__section-hint">
              Place assumptions based on their risk level and how much evidence you have.
              Focus on testing items in the "Test Now" quadrant first.
            </p>
            <div className="pdw-matrix">
              <div className="pdw-matrix__y-label">
                <span>High Risk</span>
                <span>Lower Risk</span>
              </div>
              <div className="pdw-matrix__grid">
                <div className="pdw-matrix__row">
                  <AssumptionMatrixCell
                    assumptions={assumptionMatrix['high-none']}
                    quadrant="high-none"
                    onSelect={handleSelect}
                    selectedId={selectedId}
                    onCreateInQuadrant={handleCreateInQuadrant}
                  />
                  <AssumptionMatrixCell
                    assumptions={assumptionMatrix['high-some']}
                    quadrant="high-some"
                    onSelect={handleSelect}
                    selectedId={selectedId}
                    onCreateInQuadrant={handleCreateInQuadrant}
                  />
                </div>
                <div className="pdw-matrix__row">
                  <AssumptionMatrixCell
                    assumptions={assumptionMatrix['low-none']}
                    quadrant="low-none"
                    onSelect={handleSelect}
                    selectedId={selectedId}
                    onCreateInQuadrant={handleCreateInQuadrant}
                  />
                  <AssumptionMatrixCell
                    assumptions={assumptionMatrix['low-some']}
                    quadrant="low-some"
                    onSelect={handleSelect}
                    selectedId={selectedId}
                    onCreateInQuadrant={handleCreateInQuadrant}
                  />
                </div>
              </div>
              <div className="pdw-matrix__x-label">
                <span>No Evidence</span>
                <span>Some Evidence</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isEmpty && viewMode === 'list' && (
        <div className="pdw-validation__list">
          <div className="pdw-validation__section">
            <h3>Experiments</h3>
            {experiments.length === 0 ? (
              <p className="pdw-validation__empty-hint">No experiments. Create one to test your hypotheses.</p>
            ) : (
              experiments.map(exp => (
                <ExperimentStatusCard
                  key={exp.id}
                  experiment={exp}
                  onSelect={handleSelect}
                  onEdit={onEditArtefact}
                  selected={exp.id === selectedId}
                />
              ))
            )}
          </div>

          <div className="pdw-validation__section">
            <h3>Assumptions</h3>
            {assumptions.length === 0 ? (
              <p className="pdw-validation__empty-hint">No assumptions. Start by listing what must be true for your product to succeed.</p>
            ) : (
              <div className="pdw-assumptions-list">
                <div className="pdw-assumptions-list__header">
                  <span>Type</span>
                  <span>Assumption</span>
                  <span>Risk</span>
                  <span>Confidence</span>
                  <span>Status</span>
                </div>
                {assumptions.map(assumption => (
                  <AssumptionRow
                    key={assumption.id}
                    assumption={assumption}
                    onSelect={handleSelect}
                    onEdit={onEditArtefact}
                    selected={assumption.id === selectedId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filtered Empty State */}
      {!isEmpty && validationArtefacts.length === 0 && (searchQuery || typeFilter !== 'all') && (
        <div className="pdw-board__empty-filtered">
          <p>No items match your filters.</p>
          <button
            className="btn btn--secondary"
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setRiskFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
