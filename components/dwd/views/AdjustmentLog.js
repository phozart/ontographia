// components/dwd/views/AdjustmentLog.js
// DWD Adjustment Log - View and manage adjustments (interventions)
// Includes comprehensive guidance on designing and testing adjustments

import { useState, useMemo } from 'react';
import { useDWD } from '../DWDContext';
import DWDArtefactCard from '../artefacts/DWDArtefactCard';

// MUI Icons
import TuneIcon from '@mui/icons-material/Tune';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import InfoIcon from '@mui/icons-material/Info';
import ReplayIcon from '@mui/icons-material/Replay';
import BuildIcon from '@mui/icons-material/Build';
import ScienceIcon from '@mui/icons-material/Science';

// Adjustment guidance content
const ADJUSTMENT_GUIDANCE = {
  purpose: "Adjustments are deliberate changes to how work is designed - who does what, how they coordinate, and what authority they have. Good adjustments are reversible experiments that address signals or improve fit.",
  whatIsAdjustment: {
    description: "An adjustment is a specific, testable change to the work system. Unlike big transformations, adjustments are small enough to try quickly and reverse if they don't work.",
    examples: [
      "Change who handles a type of work",
      "Increase authority for a specific decision",
      "Add or remove a coordination step",
      "Automate part of a process",
      "Change how work is routed or triaged"
    ]
  },
  status: {
    description: "Track each adjustment through its lifecycle to learn what works.",
    stages: [
      { status: "Proposed", color: "#9ca3af", description: "Idea for an adjustment, not yet tried", icon: "Proposal" },
      { status: "Trying", color: "#f59e0b", description: "Currently testing this adjustment in practice", icon: "Experiment" },
      { status: "Adopted", color: "#10b981", description: "Worked well, now permanent part of design", icon: "Success" },
      { status: "Reverted", color: "#ef4444", description: "Didn't work as expected, rolled back", icon: "Rollback" }
    ]
  },
  reversibility: {
    description: "Consider how easy it is to undo an adjustment before implementing it. Prefer easily reversible adjustments.",
    levels: [
      { level: "Easy to Reverse", color: "#10b981", description: "Can quickly go back to previous state", examples: ["Reassign work", "Change routing rules", "Update authority levels"] },
      { level: "Medium", color: "#f59e0b", description: "Some effort required to reverse", examples: ["Train people in new skills", "Change team structures", "Modify handoff points"] },
      { level: "Hard to Reverse", color: "#ef4444", description: "Significant cost or effort to undo", examples: ["Hire/fire decisions", "System changes", "Major process redesigns"] }
    ]
  },
  process: {
    description: "Follow a structured approach to testing adjustments.",
    steps: [
      { step: 1, name: "Identify Signal", description: "What problem or opportunity prompted this adjustment?" },
      { step: 2, name: "Design Adjustment", description: "What specific change will you make? Be precise." },
      { step: 3, name: "Define Success", description: "How will you know if it worked? What will improve?" },
      { step: 4, name: "Try It", description: "Implement the change for a defined trial period" },
      { step: 5, name: "Capture Learning", description: "What happened? Was your hypothesis correct?" },
      { step: 6, name: "Decide", description: "Adopt it permanently or revert and try something else" }
    ]
  },
  tips: [
    "Start with the most reversible adjustments first",
    "Define success criteria before you try",
    "Set a time limit for trials",
    "Document learnings whether successful or not",
    "One adjustment at a time to see what caused the effect"
  ],
  pitfalls: [
    "Making adjustments without clear signals or reasons",
    "Trying multiple changes at once (can't tell what worked)",
    "Not defining what success looks like",
    "Forgetting to capture learnings from reverted adjustments",
    "Making hard-to-reverse changes without testing first"
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
          <span>Adjustments Guide</span>
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
            <span>What are Adjustments?</span>
            <ChevronRightIcon className={expandedSection === 'purpose' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'purpose' && (
            <div className="dwd-guidance-section__body">
              <p>{ADJUSTMENT_GUIDANCE.purpose}</p>
              <p style={{ marginTop: 12 }}>{ADJUSTMENT_GUIDANCE.whatIsAdjustment.description}</p>
              <h5>Examples:</h5>
              <ul>
                {ADJUSTMENT_GUIDANCE.whatIsAdjustment.examples.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Status Stages */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'status' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'status' ? null : 'status')}
          >
            <span>Adjustment Lifecycle</span>
            <ChevronRightIcon className={expandedSection === 'status' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'status' && (
            <div className="dwd-guidance-section__body">
              <p>{ADJUSTMENT_GUIDANCE.status.description}</p>
              <div className="dwd-status-stages">
                {ADJUSTMENT_GUIDANCE.status.stages.map((stage, i) => (
                  <div key={i} className="dwd-status-stage" style={{ borderLeftColor: stage.color }}>
                    <span className="dwd-status-stage__name" style={{ color: stage.color }}>{stage.status}</span>
                    <span className="dwd-status-stage__desc">{stage.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reversibility */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'reversibility' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'reversibility' ? null : 'reversibility')}
          >
            <span>Reversibility Matters</span>
            <ChevronRightIcon className={expandedSection === 'reversibility' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'reversibility' && (
            <div className="dwd-guidance-section__body">
              <p>{ADJUSTMENT_GUIDANCE.reversibility.description}</p>
              {ADJUSTMENT_GUIDANCE.reversibility.levels.map((level, i) => (
                <div key={i} className="dwd-reversibility-level" style={{ borderLeftColor: level.color }}>
                  <h5 style={{ color: level.color }}>
                    <ReplayIcon fontSize="small" />
                    {level.level}
                  </h5>
                  <p>{level.description}</p>
                  <span className="dwd-reversibility-examples">e.g., {level.examples.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Process */}
        <div className="dwd-guidance-section">
          <button
            className={`dwd-guidance-section__header ${expandedSection === 'process' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'process' ? null : 'process')}
          >
            <span>How to Test Adjustments</span>
            <ChevronRightIcon className={expandedSection === 'process' ? 'rotated' : ''} />
          </button>
          {expandedSection === 'process' && (
            <div className="dwd-guidance-section__body">
              <p>{ADJUSTMENT_GUIDANCE.process.description}</p>
              <ol className="dwd-guidance-steps">
                {ADJUSTMENT_GUIDANCE.process.steps.map((step) => (
                  <li key={step.step}>
                    <span className="step-number">{step.step}</span>
                    <div>
                      <strong>{step.name}</strong>
                      <p>{step.description}</p>
                    </div>
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
                    {ADJUSTMENT_GUIDANCE.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="dwd-donts">
                  <h5><CancelIcon style={{ color: '#ef4444' }} /> Common Mistakes</h5>
                  <ul>
                    {ADJUSTMENT_GUIDANCE.pitfalls.map((pitfall, i) => (
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
        <h3>Designing Work Adjustments</h3>
      </div>
      <p className="dwd-quickstart__description">
        Adjustments are small, testable changes to how work is organized. Think of them as experiments -
        try something, learn from it, and either adopt or revert.
      </p>
      <div className="dwd-quickstart__flow">
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">1</span>
          <span>Spot a signal or problem</span>
        </div>
        <ArrowForwardIcon className="dwd-quickstart__arrow" />
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">2</span>
          <span>Design a small adjustment</span>
        </div>
        <ArrowForwardIcon className="dwd-quickstart__arrow" />
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">3</span>
          <span>Try it and observe</span>
        </div>
        <ArrowForwardIcon className="dwd-quickstart__arrow" />
        <div className="dwd-quickstart__step">
          <span className="dwd-quickstart__step-num">4</span>
          <span>Adopt or revert</span>
        </div>
      </div>
      <div className="dwd-quickstart__example-box">
        <h4><ScienceIcon fontSize="small" /> Example Adjustment:</h4>
        <p>"Give support agents authority to approve refunds up to $50 without escalation"</p>
        <div className="dwd-quickstart__example-meta">
          <span><strong>Signal:</strong> Too many escalations for small refunds</span>
          <span><strong>Success:</strong> 30% fewer escalations, same customer satisfaction</span>
          <span><strong>Reversibility:</strong> Easy - just update the policy</span>
        </div>
      </div>
      <div className="dwd-quickstart__actions">
        <button className="btn btn--primary" onClick={() => onCreate?.('dwd_adjustment')}>
          <AddIcon fontSize="small" />
          Design Your First Adjustment
        </button>
      </div>
    </div>
  );
}

export default function AdjustmentLog({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const {
    getArtefactsByType,
    activeCase,
    getCaseArtefacts,
    getRelated,
    updateArtefact,
    DWD_ADJUSTMENT_STATUS,
    DWD_REVERSIBILITY_LEVELS,
  } = useDWD();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuidance, setShowGuidance] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Get adjustments
  const adjustments = useMemo(() => {
    const items = activeCase
      ? getCaseArtefacts().filter(a => a.artefact_type === 'dwd_adjustment')
      : getArtefactsByType('dwd_adjustment');

    return items.filter(adj => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!adj.name.toLowerCase().includes(search) &&
            !adj.description?.toLowerCase().includes(search)) {
          return false;
        }
      }

      if (statusFilter !== 'all') {
        const status = adj.custom_fields?.adjustment_status || 'proposed';
        if (status !== statusFilter) return false;
      }

      return true;
    });
  }, [activeCase, getCaseArtefacts, getArtefactsByType, searchTerm, statusFilter]);

  // Get learnings
  const learnings = useMemo(() => {
    return activeCase
      ? getCaseArtefacts().filter(a => a.artefact_type === 'dwd_learning')
      : getArtefactsByType('dwd_learning');
  }, [activeCase, getCaseArtefacts, getArtefactsByType]);

  // Group by status
  const adjustmentsByStatus = useMemo(() => ({
    proposed: adjustments.filter(a => a.custom_fields?.adjustment_status === 'proposed' || !a.custom_fields?.adjustment_status),
    trying: adjustments.filter(a => a.custom_fields?.adjustment_status === 'trying'),
    adopted: adjustments.filter(a => a.custom_fields?.adjustment_status === 'adopted'),
    reverted: adjustments.filter(a => a.custom_fields?.adjustment_status === 'reverted'),
  }), [adjustments]);

  // Stats
  const stats = useMemo(() => ({
    total: adjustments.length,
    proposed: adjustmentsByStatus.proposed.length,
    trying: adjustmentsByStatus.trying.length,
    adopted: adjustmentsByStatus.adopted.length,
    reverted: adjustmentsByStatus.reverted.length,
    learnings: learnings.length,
  }), [adjustments, adjustmentsByStatus, learnings]);

  // Check for adjustments needing learning capture
  const needsLearning = useMemo(() => {
    return adjustments.filter(adj => {
      const status = adj.custom_fields?.adjustment_status;
      if (status !== 'adopted' && status !== 'reverted') return false;

      const rels = getRelated(adj.id);
      const hasLearning = rels.some(rel => rel.relationship_type === 'adjustment_produced_learning');
      return !hasLearning;
    });
  }, [adjustments, getRelated]);

  const statusColors = {
    proposed: '#9ca3af',
    trying: '#f59e0b',
    adopted: '#10b981',
    reverted: '#ef4444',
  };

  const statusIcons = {
    proposed: HourglassEmptyIcon,
    trying: HourglassEmptyIcon,
    adopted: CheckCircleIcon,
    reverted: CancelIcon,
  };

  const isEmpty = adjustments.length === 0 && !searchTerm && statusFilter === 'all';

  // Drag and drop handlers
  const handleDragStart = (e, adjustment) => {
    setDraggedItem(adjustment);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', adjustment.id);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedItem) return;

    const currentStatus = draggedItem.custom_fields?.adjustment_status || 'proposed';
    if (currentStatus === newStatus) {
      setDraggedItem(null);
      return;
    }

    // Update the adjustment status
    try {
      await updateArtefact(draggedItem.id, {
        ...draggedItem,
        custom_fields: {
          ...draggedItem.custom_fields,
          adjustment_status: newStatus,
        },
      });
    } catch (error) {
      console.error('Failed to update adjustment status:', error);
    }

    setDraggedItem(null);
  };

  return (
    <div className="dwd-adjustment-log">
      {/* Guidance Panel */}
      {showGuidance && (
        <GuidancePanel onClose={() => setShowGuidance(false)} />
      )}

      {/* Header */}
      <div className="dwd-view-header">
        <div className="dwd-view-header__left">
          <h2>Adjustments</h2>
          <p>Design and test changes to improve work-actor fit</p>
        </div>

        <div className="dwd-view-stats">
          <span className="dwd-view-stat">
            <TuneIcon fontSize="small" />
            {stats.total} adjustments
          </span>
          <span className="dwd-view-stat" style={{ color: '#f59e0b' }}>
            {stats.trying} trying
          </span>
          <span className="dwd-view-stat" style={{ color: '#10b981' }}>
            {stats.adopted} adopted
          </span>
          {stats.reverted > 0 && (
            <span className="dwd-view-stat" style={{ color: '#ef4444' }}>
              {stats.reverted} reverted
            </span>
          )}
          <span className="dwd-view-stat">
            <LightbulbIcon fontSize="small" />
            {stats.learnings} learnings
          </span>
        </div>
      </div>

      <div className="dwd-view-actions">
        <div className="dwd-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            placeholder="Search adjustments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="dwd-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          {DWD_ADJUSTMENT_STATUS?.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
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
          onClick={() => onCreateArtefact?.('dwd_adjustment')}
        >
          <AddIcon fontSize="small" />
          Design Adjustment
        </button>
      </div>

      {/* Empty State */}
      {isEmpty && <QuickStartCard onCreate={onCreateArtefact} />}

      {/* Learning Reminder */}
      {!isEmpty && needsLearning.length > 0 && (
        <div className="dwd-learning-reminder">
          <LightbulbIcon />
          <div className="dwd-learning-reminder__content">
            <span>
              <strong>{needsLearning.length} adjustment{needsLearning.length !== 1 ? 's' : ''}</strong> completed without learning captured
            </span>
            <span className="dwd-learning-reminder__hint">
              Capture what you learned to build organizational knowledge
            </span>
          </div>
          <button
            className="btn btn--small"
            onClick={() => onCreateArtefact?.('dwd_learning')}
          >
            Capture Learning
          </button>
        </div>
      )}

      {/* Kanban-style columns */}
      {!isEmpty && (
        <div className="dwd-adjustment-kanban">
          {/* Proposed */}
          <div
            className={`dwd-kanban-column ${dragOverColumn === 'proposed' ? 'dwd-kanban-column--drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'proposed')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'proposed')}
          >
            <div className="dwd-kanban-header" style={{ borderTopColor: statusColors.proposed }}>
              <span className="dwd-kanban-title">Proposed</span>
              <span className="dwd-kanban-count">{adjustmentsByStatus.proposed.length}</span>
              <span className="dwd-kanban-hint">Ideas to try</span>
            </div>
            <div className="dwd-kanban-content">
              {adjustmentsByStatus.proposed.map(adj => (
                <AdjustmentCard
                  key={adj.id}
                  adjustment={adj}
                  onSelect={onSelectArtefact}
                  onEdit={onEditArtefact}
                  onDelete={onDeleteArtefact}
                  statusColor={statusColors.proposed}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedItem?.id === adj.id}
                />
              ))}
              {adjustmentsByStatus.proposed.length === 0 && (
                <div className="dwd-kanban-empty">
                  <p>No proposed adjustments</p>
                  <span>Start by identifying a signal or problem</span>
                </div>
              )}
              {dragOverColumn === 'proposed' && draggedItem && (
                <div className="dwd-kanban-drop-hint">Drop here to mark as Proposed</div>
              )}
            </div>
          </div>

          {/* Trying */}
          <div
            className={`dwd-kanban-column ${dragOverColumn === 'trying' ? 'dwd-kanban-column--drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'trying')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'trying')}
          >
            <div className="dwd-kanban-header" style={{ borderTopColor: statusColors.trying }}>
              <span className="dwd-kanban-title">Trying</span>
              <span className="dwd-kanban-count">{adjustmentsByStatus.trying.length}</span>
              <span className="dwd-kanban-hint">Currently testing</span>
            </div>
            <div className="dwd-kanban-content">
              {adjustmentsByStatus.trying.map(adj => (
                <AdjustmentCard
                  key={adj.id}
                  adjustment={adj}
                  onSelect={onSelectArtefact}
                  onEdit={onEditArtefact}
                  onDelete={onDeleteArtefact}
                  statusColor={statusColors.trying}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedItem?.id === adj.id}
                />
              ))}
              {adjustmentsByStatus.trying.length === 0 && (
                <div className="dwd-kanban-empty">
                  <p>No adjustments being tried</p>
                  <span>Drag an adjustment here to start testing</span>
                </div>
              )}
              {dragOverColumn === 'trying' && draggedItem && (
                <div className="dwd-kanban-drop-hint">Drop here to start testing</div>
              )}
            </div>
          </div>

          {/* Adopted */}
          <div
            className={`dwd-kanban-column ${dragOverColumn === 'adopted' ? 'dwd-kanban-column--drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'adopted')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'adopted')}
          >
            <div className="dwd-kanban-header" style={{ borderTopColor: statusColors.adopted }}>
              <span className="dwd-kanban-title">Adopted</span>
              <span className="dwd-kanban-count">{adjustmentsByStatus.adopted.length}</span>
              <span className="dwd-kanban-hint">Worked - now permanent</span>
            </div>
            <div className="dwd-kanban-content">
              {adjustmentsByStatus.adopted.map(adj => (
                <AdjustmentCard
                  key={adj.id}
                  adjustment={adj}
                  onSelect={onSelectArtefact}
                  onEdit={onEditArtefact}
                  onDelete={onDeleteArtefact}
                  statusColor={statusColors.adopted}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedItem?.id === adj.id}
                />
              ))}
              {adjustmentsByStatus.adopted.length === 0 && (
                <div className="dwd-kanban-empty">
                  <p>No adopted adjustments</p>
                  <span>Successful experiments end up here</span>
                </div>
              )}
              {dragOverColumn === 'adopted' && draggedItem && (
                <div className="dwd-kanban-drop-hint">Drop here to mark as Adopted</div>
              )}
            </div>
          </div>

          {/* Reverted */}
          <div
            className={`dwd-kanban-column ${dragOverColumn === 'reverted' ? 'dwd-kanban-column--drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'reverted')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'reverted')}
          >
            <div className="dwd-kanban-header" style={{ borderTopColor: statusColors.reverted }}>
              <span className="dwd-kanban-title">Reverted</span>
              <span className="dwd-kanban-count">{adjustmentsByStatus.reverted.length}</span>
              <span className="dwd-kanban-hint">Didn't work - rolled back</span>
            </div>
            <div className="dwd-kanban-content">
              {adjustmentsByStatus.reverted.map(adj => (
                <AdjustmentCard
                  key={adj.id}
                  adjustment={adj}
                  onSelect={onSelectArtefact}
                  onEdit={onEditArtefact}
                  onDelete={onDeleteArtefact}
                  statusColor={statusColors.reverted}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedItem?.id === adj.id}
                />
              ))}
              {adjustmentsByStatus.reverted.length === 0 && (
                <div className="dwd-kanban-empty">
                  <p>No reverted adjustments</p>
                  <span>Failed experiments still provide learnings</span>
                </div>
              )}
              {dragOverColumn === 'reverted' && draggedItem && (
                <div className="dwd-kanban-drop-hint">Drop here to mark as Reverted</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Adjustment card component
function AdjustmentCard({ adjustment, onSelect, onEdit, onDelete, statusColor, onDragStart, onDragEnd, isDragging }) {
  const customFields = adjustment.custom_fields || {};
  const reversibility = customFields.adjustment_reversibility || 'medium';
  const reversibilityColors = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

  const hasExpectedEffect = !!customFields.expected_effect;
  const hasSuccessCriteria = !!customFields.success_criteria;

  return (
    <div
      className={`dwd-adjustment-card ${isDragging ? 'dwd-adjustment-card--dragging' : ''}`}
      onClick={() => onSelect?.(adjustment)}
      style={{ borderLeftColor: statusColor }}
      draggable
      onDragStart={(e) => onDragStart?.(e, adjustment)}
      onDragEnd={onDragEnd}
    >
      <h4 className="dwd-adjustment-card__name">{adjustment.name}</h4>

      {customFields.expected_effect && (
        <p className="dwd-adjustment-card__effect">
          <strong>Expected:</strong> {customFields.expected_effect}
        </p>
      )}

      {customFields.success_criteria && (
        <p className="dwd-adjustment-card__criteria">
          <strong>Success if:</strong> {customFields.success_criteria}
        </p>
      )}

      {!hasExpectedEffect && !hasSuccessCriteria && (
        <div className="dwd-adjustment-card__missing">
          <InfoIcon fontSize="small" />
          <span>Consider adding expected effect and success criteria</span>
        </div>
      )}

      <div className="dwd-adjustment-card__badges">
        <span
          className="dwd-adjustment-card__badge"
          style={{ backgroundColor: reversibilityColors[reversibility] }}
          title={`${reversibility} to reverse`}
        >
          <ReplayIcon fontSize="small" />
          {reversibility}
        </span>
      </div>

      <div className="dwd-adjustment-card__actions">
        <button onClick={(e) => { e.stopPropagation(); onEdit?.(adjustment); }}>Edit</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete?.(adjustment); }}>Delete</button>
      </div>
    </div>
  );
}
