/**
 * CapListView - List and Card views for capability artefacts
 *
 * Supports multiple view modes:
 * - list: Compact table view
 * - cards: Rich cards with assessment info visible
 *
 * @component
 * @module components/cap/CapListView
 */

import { useMemo, useState } from 'react';
import { useCap, CAP_MATURITY_LEVELS, CAP_STRATEGIC_IMPORTANCE, CAP_INVESTMENT_LEVEL } from './CapContext';
import Button from '@mui/material/Button';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';

/**
 * Get maturity info
 */
const getMaturityInfo = (maturity) => {
  return CAP_MATURITY_LEVELS.find(l => l.id === maturity) || null;
};

/**
 * Get importance info
 */
const getImportanceInfo = (importance) => {
  return CAP_STRATEGIC_IMPORTANCE.find(l => l.id === importance) || null;
};

/**
 * Get investment info
 */
const getInvestmentInfo = (investment) => {
  return CAP_INVESTMENT_LEVEL.find(l => l.id === investment) || null;
};

// Empty state content per module
const EMPTY_CONTENT = {
  // Capability views
  capabilities: {
    icon: '🎯',
    title: 'No Capabilities Yet',
    description: 'Define your organization\'s business capabilities.',
    tip: 'Start with L1 capabilities (broad domains) then decompose into L2 and L3.',
    buttonLabel: 'Create Capability',
    createType: 'cap_capability',
  },
  cap_list: {
    icon: '🎯',
    title: 'No Capabilities Yet',
    description: 'Define your organization\'s business capabilities.',
    tip: 'Start with L1 capabilities (broad domains) then decompose into L2 and L3.',
    buttonLabel: 'Create Capability',
    createType: 'cap_capability',
  },
  value_streams: {
    icon: '🔄',
    title: 'No Value Streams Yet',
    description: 'Map end-to-end flows that deliver value to customers.',
    tip: 'Document the trigger, stages, and outcome for each value stream.',
    buttonLabel: 'Create Value Stream',
    createType: 'cap_value_stream',
  },
  initiatives: {
    icon: '🚀',
    title: 'No Initiatives Yet',
    description: 'Plan capability improvements and investments.',
    tip: 'Link initiatives to capability gaps and define measurable outcomes.',
    buttonLabel: 'Create Initiative',
    createType: 'cap_initiative',
  },

  // Performance views
  okrs: {
    icon: '🎯',
    title: 'No Objectives & Key Results Yet',
    description: 'Define strategic objectives and measurable key results to track progress.',
    tip: 'Start with 3-5 high-level objectives, each with 2-4 measurable key results.',
    buttonLabel: 'Create Objective',
    createType: 'perf_objective',
  },
  kpis: {
    icon: '📊',
    title: 'No KPIs & Metrics Yet',
    description: 'Track performance with key performance indicators and metrics.',
    tip: 'Define KPIs that directly measure business outcomes and capability health.',
    buttonLabel: 'Create KPI',
    createType: 'perf_kpi',
  },
  tracking: {
    icon: '📈',
    title: 'No Tracking Data Yet',
    description: 'Record measurements and conduct performance reviews.',
    tip: 'Regular measurements help identify trends and drive improvement.',
    buttonLabel: 'Add Measurement',
    createType: 'perf_measurement',
  },
  outcomes: {
    icon: '🏆',
    title: 'No Outcomes Yet',
    description: 'Document achieved outcomes and insights from performance data.',
    tip: 'Capture both successes and lessons learned to improve future performance.',
    buttonLabel: 'Record Outcome',
    createType: 'perf_outcome',
  },

  // Governance views
  decisions: {
    icon: '⚖️',
    title: 'No Decision Types Yet',
    description: 'Define the types of decisions and who has authority to make them.',
    tip: 'Map decision rights to roles and establish clear escalation paths.',
    buttonLabel: 'Create Decision Type',
    createType: 'gov_decision_type',
  },
  forums: {
    icon: '👥',
    title: 'No Forums Yet',
    description: 'Establish governance forums where decisions are made.',
    tip: 'Define the purpose, membership, and cadence for each forum.',
    buttonLabel: 'Create Forum',
    createType: 'gov_forum',
  },
  policies: {
    icon: '📜',
    title: 'No Policies Yet',
    description: 'Document policies and principles that guide decision-making.',
    tip: 'Keep policies clear and actionable with defined exceptions.',
    buttonLabel: 'Create Policy',
    createType: 'gov_policy',
  },
  accountability: {
    icon: '🎖️',
    title: 'No Accountability Assignments Yet',
    description: 'Define who is accountable for what across the organization.',
    tip: 'Use RACI or similar frameworks to clarify roles and responsibilities.',
    buttonLabel: 'Assign Accountability',
    createType: 'gov_accountability',
  },

  // Risk views
  risks: {
    icon: '⚠️',
    title: 'No Risks Registered Yet',
    description: 'Identify and track risks and the controls that mitigate them.',
    tip: 'Assess likelihood and impact to prioritize risk treatment.',
    buttonLabel: 'Register Risk',
    createType: 'risk_risk',
  },
  scenarios: {
    icon: '🔮',
    title: 'No Scenarios Yet',
    description: 'Model potential risk scenarios and their business impact.',
    tip: 'Consider both likely scenarios and high-impact edge cases.',
    buttonLabel: 'Create Scenario',
    createType: 'risk_scenario',
  },
  resilience: {
    icon: '🛡️',
    title: 'No Resilience Plans Yet',
    description: 'Plan for business continuity and operational resilience.',
    tip: 'Define recovery objectives and test plans regularly.',
    buttonLabel: 'Create Resilience Plan',
    createType: 'risk_resilience',
  },
  assessments: {
    icon: '📋',
    title: 'No Assessments Yet',
    description: 'Conduct risk assessments to evaluate your risk posture.',
    tip: 'Schedule regular assessments and track findings over time.',
    buttonLabel: 'Start Assessment',
    createType: 'risk_assessment',
  },

  // Service views
  service_catalog: {
    icon: '🛠️',
    title: 'No Services Yet',
    description: 'Define the services your organization provides.',
    tip: 'Document service offerings, owners, and how they deliver value.',
    buttonLabel: 'Create Service',
    createType: 'bsm_service',
  },
  service_levels: {
    icon: '⚡',
    title: 'No Service Levels Yet',
    description: 'Define service level agreements and targets.',
    tip: 'Set realistic targets based on business needs and capabilities.',
    buttonLabel: 'Create Service Level',
    createType: 'bsm_service_level',
  },
  consumers: {
    icon: '👤',
    title: 'No Consumers Yet',
    description: 'Identify who consumes your services and their agreements.',
    tip: 'Understanding consumers helps prioritize service improvements.',
    buttonLabel: 'Add Consumer',
    createType: 'bsm_consumer',
  },
  dependencies: {
    icon: '🔗',
    title: 'No Dependencies Yet',
    description: 'Map service dependencies and integrations.',
    tip: 'Document both upstream and downstream dependencies.',
    buttonLabel: 'Add Dependency',
    createType: 'bsm_dependency',
  },
};

/**
 * Capability Card Component
 */
function CapabilityCard({ artefact, onEdit, onDelete, isSelected, onSelect, typeDef }) {
  const cf = artefact.custom_fields || {};
  const maturity = getMaturityInfo(cf.maturity);
  const targetMaturity = getMaturityInfo(cf.target_maturity);
  const importance = getImportanceInfo(cf.strategic_importance);
  const investment = getInvestmentInfo(cf.investment_level);

  // Check for maturity gap
  const hasGap = maturity && targetMaturity && maturity.score < targetMaturity.score;

  // Count relationships
  const relCount = (cf.depends_on?.length || 0) + (cf.enables?.length || 0) + (cf.value_streams?.length || 0);

  return (
    <div
      className={`cap-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect?.(artefact.id)}
    >
      {/* Header with type and actions */}
      <div className="card-header">
        <span className="card-type" style={{ color: typeDef?.color }}>
          {typeDef?.name || 'Capability'}
        </span>
        <div className="card-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit?.(artefact); }} title="Edit">
            <EditIcon fontSize="small" />
          </button>
          <button className="danger" onClick={(e) => { e.stopPropagation(); onDelete?.(artefact); }} title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Name */}
      <h3 className="card-name">{artefact.name}</h3>

      {/* Definition preview */}
      {cf.definition && (
        <p className="card-definition">{cf.definition.slice(0, 120)}{cf.definition.length > 120 ? '...' : ''}</p>
      )}

      {/* Assessment section */}
      <div className="card-assessment">
        {/* Maturity */}
        {maturity && (
          <div className="assessment-item maturity">
            <span className="assessment-label">Maturity</span>
            <div className="maturity-display">
              <span className="maturity-badge" style={{ backgroundColor: maturity.color }}>
                {maturity.label}
              </span>
              {hasGap && targetMaturity && (
                <>
                  <span className="maturity-arrow">→</span>
                  <span className="maturity-target" style={{ color: targetMaturity.color }}>
                    {targetMaturity.label}
                  </span>
                  <WarningIcon className="gap-icon" />
                </>
              )}
            </div>
          </div>
        )}

        {/* Strategic Importance */}
        {importance && (
          <div className="assessment-item">
            <span className="assessment-label">Importance</span>
            <span className="importance-badge" style={{ backgroundColor: `${importance.color}20`, color: importance.color }}>
              {importance.label}
            </span>
          </div>
        )}

        {/* Investment Level */}
        {investment && (
          <div className="assessment-item">
            <span className="assessment-label">Investment</span>
            <span className="investment-badge" style={{ color: investment.color }}>
              <TrendingUpIcon style={{ fontSize: 14 }} />
              {investment.label}
            </span>
          </div>
        )}
      </div>

      {/* Operating section */}
      <div className="card-operating">
        {/* Owner */}
        {cf.owner && (
          <div className="operating-item">
            <PersonIcon style={{ fontSize: 14 }} />
            <span>{cf.owner}</span>
          </div>
        )}

        {/* Relationships count */}
        {relCount > 0 && (
          <div className="operating-item">
            <AccountTreeIcon style={{ fontSize: 14 }} />
            <span>{relCount} link{relCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Tags (systems/processes) */}
      {(cf.key_systems?.length > 0 || cf.key_processes?.length > 0) && (
        <div className="card-tags">
          {cf.key_systems?.slice(0, 3).map((tag, i) => (
            <span key={`sys-${i}`} className="tag system">{tag}</span>
          ))}
          {cf.key_processes?.slice(0, 2).map((tag, i) => (
            <span key={`proc-${i}`} className="tag process">{tag}</span>
          ))}
        </div>
      )}

      <style jsx>{`
        .cap-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .cap-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .cap-card.selected {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .card-type {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .cap-card:hover .card-actions {
          opacity: 1;
        }

        .card-actions button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: var(--bg);
          border: none;
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .card-actions button:hover {
          color: var(--text);
        }

        .card-actions button.danger:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .card-name {
          margin: 0 0 8px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
          line-height: 1.3;
        }

        .card-definition {
          margin: 0 0 12px;
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .card-assessment {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 0;
          border-top: 1px solid var(--border);
        }

        .assessment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .assessment-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .maturity-display {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .maturity-badge {
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.6875rem;
          font-weight: 600;
          color: white;
        }

        .maturity-arrow {
          color: var(--text-muted);
          font-size: 12px;
        }

        .maturity-target {
          font-size: 0.75rem;
          font-weight: 600;
        }

        :global(.gap-icon) {
          font-size: 14px !important;
          color: #f59e0b;
        }

        .importance-badge {
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.6875rem;
          font-weight: 600;
        }

        .investment-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .card-operating {
          display: flex;
          gap: 16px;
          padding-top: 8px;
        }

        .operating-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .tag {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.6875rem;
        }

        .tag.system {
          background: #dbeafe;
          color: #1e40af;
        }

        .tag.process {
          background: #fef3c7;
          color: #92400e;
        }
      `}</style>
    </div>
  );
}

/**
 * Simple Item Card (for value streams, initiatives)
 */
function SimpleCard({ artefact, onEdit, onDelete, isSelected, onSelect, typeDef }) {
  const cf = artefact.custom_fields || {};

  return (
    <div
      className={`simple-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect?.(artefact.id)}
    >
      <div className="card-header">
        <span className="card-type" style={{ color: typeDef?.color }}>
          {typeDef?.name || artefact.artefact_type}
        </span>
        <div className="card-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit?.(artefact); }}>
            <EditIcon fontSize="small" />
          </button>
          <button className="danger" onClick={(e) => { e.stopPropagation(); onDelete?.(artefact); }}>
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>

      <h3 className="card-name">{artefact.name}</h3>

      {artefact.description && (
        <p className="card-desc">{artefact.description.slice(0, 100)}{artefact.description.length > 100 ? '...' : ''}</p>
      )}

      {/* Value stream specific */}
      {artefact.artefact_type === 'cap_value_stream' && cf.outcome && (
        <div className="card-outcome">
          <span className="outcome-label">Outcome:</span>
          <span className="outcome-value">{cf.outcome}</span>
        </div>
      )}

      {/* Initiative specific */}
      {artefact.artefact_type === 'cap_initiative' && cf.status && (
        <div className="card-status">
          <span className={`status-badge ${cf.status}`}>{cf.status}</span>
          {cf.priority && <span className={`priority-badge ${cf.priority}`}>{cf.priority}</span>}
        </div>
      )}

      <style jsx>{`
        .simple-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .simple-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .simple-card.selected {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .card-type {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .simple-card:hover .card-actions {
          opacity: 1;
        }

        .card-actions button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: var(--bg);
          border: none;
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .card-actions button.danger:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .card-name {
          margin: 0 0 8px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
        }

        .card-desc {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .card-outcome {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
          font-size: 0.8125rem;
        }

        .outcome-label {
          color: var(--text-muted);
        }

        .outcome-value {
          color: var(--text);
          margin-left: 4px;
        }

        .card-status {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .status-badge {
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.6875rem;
          font-weight: 500;
          background: var(--bg);
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .status-badge.in_progress {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-badge.completed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.approved {
          background: #fef3c7;
          color: #92400e;
        }

        .priority-badge {
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.6875rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .priority-badge.high, .priority-badge.critical {
          background: #fee2e2;
          color: #dc2626;
        }

        .priority-badge.medium {
          background: #fef3c7;
          color: #92400e;
        }
      `}</style>
    </div>
  );
}

/**
 * CapListView Component
 */
export default function CapListView({
  artefacts = [],
  onSelect,
  onEdit,
  onCreate,
  selectedId,
  viewMode = 'cards',
  moduleId = 'capabilities',
}) {
  const { deleteArtefact, getTypeDefinition, getTypeColor } = useCap();
  const [displayMode, setDisplayMode] = useState(viewMode);

  // Sort artefacts by updated date
  const sortedArtefacts = useMemo(() => {
    return [...artefacts].sort((a, b) =>
      new Date(b.updated_at) - new Date(a.updated_at)
    );
  }, [artefacts]);

  // Handle delete
  const handleDelete = async (artefact) => {
    if (window.confirm(`Delete "${artefact.name}"?`)) {
      await deleteArtefact(artefact.id);
    }
  };

  // Get module-specific empty state content
  const emptyContent = EMPTY_CONTENT[moduleId] || EMPTY_CONTENT.capabilities;

  // Empty state
  if (sortedArtefacts.length === 0) {
    return (
      <div className="cap-empty-state">
        <div className="empty-icon">{emptyContent.icon}</div>
        <h2>{emptyContent.title}</h2>
        <p>{emptyContent.description}</p>

        <div className="empty-tip">
          <strong>Tip:</strong> {emptyContent.tip}
        </div>

        {onCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onCreate(emptyContent.createType)}
            sx={{ textTransform: 'none', mt: 2 }}
          >
            {emptyContent.buttonLabel}
          </Button>
        )}

        <style jsx>{`
          .cap-empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            text-align: center;
          }

          .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          h2 {
            margin: 0 0 8px;
            font-size: 1.25rem;
            color: var(--text);
          }

          p {
            margin: 0 0 20px;
            color: var(--text-muted);
          }

          .empty-tip {
            padding: 12px 20px;
            background: var(--accent-soft);
            border-radius: 8px;
            font-size: 0.875rem;
            color: var(--text);
            max-width: 400px;
          }
        `}</style>
      </div>
    );
  }

  // Determine if we should use capability cards or simple cards
  const useCapabilityCards = moduleId === 'cap_list' || moduleId === 'capabilities';

  return (
    <div className="cap-list-view">
      {/* View toggle */}
      <div className="view-toggle">
        <button
          className={displayMode === 'cards' ? 'active' : ''}
          onClick={() => setDisplayMode('cards')}
          title="Card view"
        >
          <GridViewIcon fontSize="small" />
        </button>
        <button
          className={displayMode === 'list' ? 'active' : ''}
          onClick={() => setDisplayMode('list')}
          title="List view"
        >
          <ViewListIcon fontSize="small" />
        </button>
      </div>

      {/* Cards view */}
      {displayMode === 'cards' && (
        <div className="cards-grid">
          {sortedArtefacts.map(artefact => {
            const typeDef = getTypeDefinition(artefact.artefact_type);

            if (useCapabilityCards && artefact.artefact_type === 'cap_capability') {
              return (
                <CapabilityCard
                  key={artefact.id}
                  artefact={artefact}
                  typeDef={typeDef}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                  onSelect={onSelect}
                  isSelected={selectedId === artefact.id}
                />
              );
            }

            return (
              <SimpleCard
                key={artefact.id}
                artefact={artefact}
                typeDef={typeDef}
                onEdit={onEdit}
                onDelete={handleDelete}
                onSelect={onSelect}
                isSelected={selectedId === artefact.id}
              />
            );
          })}
        </div>
      )}

      {/* List view */}
      {displayMode === 'list' && (
        <table className="list-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              {useCapabilityCards && <th>Maturity</th>}
              {useCapabilityCards && <th>Importance</th>}
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedArtefacts.map(artefact => {
              const typeDef = getTypeDefinition(artefact.artefact_type);
              const cf = artefact.custom_fields || {};
              const maturity = getMaturityInfo(cf.maturity);
              const importance = getImportanceInfo(cf.strategic_importance);

              return (
                <tr
                  key={artefact.id}
                  className={selectedId === artefact.id ? 'selected' : ''}
                  onClick={() => onSelect?.(artefact.id)}
                >
                  <td>
                    <div className="name-cell">
                      <span className="type-dot" style={{ backgroundColor: typeDef?.color || '#6b7280' }} />
                      <span className="name-text">{artefact.name}</span>
                    </div>
                  </td>
                  <td className="type-cell">{typeDef?.name || artefact.artefact_type}</td>
                  {useCapabilityCards && (
                    <td>
                      {maturity && (
                        <span className="maturity-pill" style={{ backgroundColor: maturity.color }}>
                          {maturity.label}
                        </span>
                      )}
                    </td>
                  )}
                  {useCapabilityCards && (
                    <td>
                      {importance && (
                        <span className="importance-pill" style={{ backgroundColor: `${importance.color}20`, color: importance.color }}>
                          {importance.label}
                        </span>
                      )}
                    </td>
                  )}
                  <td className="date-cell">{new Date(artefact.updated_at).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button onClick={(e) => { e.stopPropagation(); onEdit?.(artefact); }}>
                      <EditIcon fontSize="small" />
                    </button>
                    <button className="danger" onClick={(e) => { e.stopPropagation(); handleDelete(artefact); }}>
                      <DeleteIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <style jsx>{`
        .cap-list-view {
          flex: 1;
          overflow: auto;
          padding: 20px;
        }

        .view-toggle {
          display: flex;
          gap: 4px;
          margin-bottom: 16px;
          padding: 4px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          width: fit-content;
        }

        .view-toggle button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .view-toggle button:hover {
          background: var(--bg);
        }

        .view-toggle button.active {
          background: var(--accent);
          color: white;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .list-table {
          width: 100%;
          border-collapse: collapse;
          background: var(--panel);
          border-radius: 8px;
          overflow: hidden;
        }

        .list-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
        }

        .list-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          font-size: 13px;
        }

        .list-table tr {
          cursor: pointer;
          transition: background 0.15s;
        }

        .list-table tbody tr:hover {
          background: var(--bg);
        }

        .list-table tr.selected {
          background: var(--accent-soft);
        }

        .name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .type-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .name-text {
          font-weight: 500;
          color: var(--text);
        }

        .type-cell {
          color: var(--text-muted);
          font-size: 12px;
        }

        .maturity-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          color: white;
        }

        .importance-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .date-cell {
          color: var(--text-muted);
          font-size: 12px;
        }

        .actions-cell {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .list-table tr:hover .actions-cell {
          opacity: 1;
        }

        .actions-cell button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .actions-cell button:hover {
          background: var(--bg);
        }

        .actions-cell button.danger:hover {
          background: #fee2e2;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
}
