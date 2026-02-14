// components/pdw/views/ValidationBoard.js
// Validation board for experiments and assumptions with matrix and timeline views

import { useState, useMemo, useCallback } from 'react';
import { usePDW } from '../PDWContext';

// Shared UI Components
import {
  IconButton,
  ViewHeader,
  ControlsBar,
  SearchBox,
  FilterSelect,
  ViewToggle,
  Card,
  QuickStart,
  EmptyFiltered,
  ListView,
  ListRow,
} from '../../../ui';

// MUI Icons
import BiotechIcon from '@mui/icons-material/Biotech';
import WarningIcon from '@mui/icons-material/Warning';
import ScienceIcon from '@mui/icons-material/Science';
import AddIcon from '@mui/icons-material/Add';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

// Type options
const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'experiments', label: 'Experiments' },
  { value: 'assumptions', label: 'Assumptions' },
];

// Risk options
const RISK_OPTIONS = [
  { value: 'all', label: 'All Risk' },
  { value: 'High', label: 'High Risk' },
  { value: 'Medium', label: 'Medium Risk' },
  { value: 'Low', label: 'Low Risk' },
];

// View options
const VIEW_OPTIONS = [
  { value: 'matrix', icon: GridViewIcon, title: 'Matrix View' },
  { value: 'list', icon: ViewListIcon, title: 'List View' },
];

// Outcome configuration
const OUTCOME_CONFIG = {
  'Not Started': { icon: HelpIcon, color: '#64748b', bg: '#f1f5f9' },
  'Running': { icon: PlayCircleIcon, color: '#3b82f6', bg: '#eff6ff' },
  'Validated': { icon: CheckCircleIcon, color: '#22c55e', bg: '#f0fdf4' },
  'Invalidated': { icon: CancelIcon, color: '#ef4444', bg: '#fef2f2' },
  'Inconclusive': { icon: HelpIcon, color: '#f59e0b', bg: '#fffbeb' },
};

// Quick start card for new users
function QuickStartCard({ onCreateExperiment, onCreateAssumption }) {
  return (
    <div style={{
      padding: 32,
      backgroundColor: 'var(--bg-primary)',
      borderRadius: 16,
      border: '1px solid var(--border)',
      textAlign: 'center',
      maxWidth: 600,
      margin: '48px auto',
    }}>
      <TipsAndUpdatesIcon style={{ fontSize: 48, color: '#f59e0b', marginBottom: 16 }} />
      <h3 style={{ margin: '0 0 12px', fontSize: '1.25rem', fontWeight: 600 }}>
        Getting Started with Validation
      </h3>
      <p style={{ margin: '0 0 24px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Validation is about reducing risk by testing your ideas with real evidence before building.
        Start by identifying your assumptions, then design experiments to test them.
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
        padding: '16px 0',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        {['List key assumptions', 'Prioritize by risk', 'Design experiments', 'Capture learnings'].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}>
              {i + 1}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{step}</span>
            {i < 3 && <ArrowForwardIcon style={{ color: 'var(--text-muted)', fontSize: 16 }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={onCreateAssumption}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <WarningIcon style={{ color: '#ef4444', fontSize: 18 }} />
          Start with Assumptions
        </button>
        <button
          onClick={onCreateExperiment}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <BiotechIcon style={{ fontSize: 18 }} />
          Create Experiment
        </button>
      </div>
    </div>
  );
}

// Experiment card
function ExperimentCard({ experiment, onSelect, onEdit, onDelete, selected }) {
  const outcome = experiment.custom_fields?.outcome || 'Not Started';
  const config = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG['Not Started'];
  const OutcomeIcon = config.icon;
  const method = experiment.custom_fields?.method || 'No method';

  return (
    <Card selected={selected} onClick={() => onSelect(experiment)}>
      <Card.Header>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}>
          {method}
        </span>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: config.bg,
          color: config.color,
        }}>
          <OutcomeIcon style={{ fontSize: 14 }} />
          {outcome}
        </span>
      </Card.Header>

      <Card.Title>{experiment.name}</Card.Title>

      {experiment.custom_fields?.hypothesis && (
        <Card.Section label="Hypothesis">
          {experiment.custom_fields.hypothesis.slice(0, 100)}
          {experiment.custom_fields.hypothesis.length > 100 ? '...' : ''}
        </Card.Section>
      )}

      {experiment.custom_fields?.success_criteria && (
        <Card.Section label="Success Criteria">
          {experiment.custom_fields.success_criteria.slice(0, 80)}
          {experiment.custom_fields.success_criteria.length > 80 ? '...' : ''}
        </Card.Section>
      )}

      <Card.Footer>
        {experiment.custom_fields?.duration && (
          <Card.Meta>{experiment.custom_fields.duration}</Card.Meta>
        )}
        {experiment.custom_fields?.sample_size && (
          <Card.Meta>n={experiment.custom_fields.sample_size}</Card.Meta>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <IconButton
            icon={EditIcon}
            size="sm"
            onClick={(e) => { e.stopPropagation(); onEdit(experiment); }}
            title="Edit"
          />
          <IconButton
            icon={DeleteIcon}
            size="sm"
            variant="danger"
            onClick={(e) => { e.stopPropagation(); onDelete(experiment); }}
            title="Delete"
          />
        </div>
      </Card.Footer>
    </Card>
  );
}

// Assumption matrix cell
function MatrixCell({ assumptions, quadrant, onSelect, selectedId, onCreateInQuadrant }) {
  const quadrantConfig = {
    'high-none': { name: 'Test Now', color: '#ef4444', desc: 'Critical risk, no evidence' },
    'high-some': { name: 'Strengthen', color: '#f59e0b', desc: 'High risk, weak evidence' },
    'low-none': { name: 'Consider', color: '#64748b', desc: 'Lower risk, no evidence' },
    'low-some': { name: 'Monitor', color: '#22c55e', desc: 'In good shape' },
  };

  const config = quadrantConfig[quadrant];
  const typeColors = {
    Desirability: '#8b5cf6',
    Feasibility: '#3b82f6',
    Viability: '#22c55e',
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-primary)',
      borderRadius: 8,
      border: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: `2px solid ${config.color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: config.color }}>{config.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{config.desc}</div>
        </div>
        <span style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: config.color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}>
          {assumptions.length}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: 8, overflowY: 'auto', minHeight: 120 }}>
        {assumptions.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: 16,
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              No assumptions here
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); onCreateInQuadrant(quadrant); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                border: '1px solid var(--border)',
                borderRadius: 4,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              <AddIcon style={{ fontSize: 14 }} />
              Add
            </button>
          </div>
        ) : (
          assumptions.map(a => (
            <div
              key={a.id}
              onClick={() => onSelect(a)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                backgroundColor: a.id === selectedId ? 'var(--bg-secondary)' : 'transparent',
                marginBottom: 4,
              }}
            >
              <span style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                backgroundColor: typeColors[a.custom_fields?.assumption_type] || '#64748b',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6875rem',
                fontWeight: 600,
              }}>
                {a.custom_fields?.assumption_type?.charAt(0) || '?'}
              </span>
              <span style={{
                flex: 1,
                fontSize: '0.8125rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {a.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Assumption list row
function AssumptionListRow({ assumption, onSelect, onEdit, onDelete, selected }) {
  const riskColors = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
  const typeColors = { Desirability: '#8b5cf6', Feasibility: '#3b82f6', Viability: '#22c55e' };
  const confidence = assumption.custom_fields?.confidence || 0;

  return (
    <ListRow selected={selected} onClick={() => onSelect(assumption)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          padding: '3px 8px',
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: `${typeColors[assumption.custom_fields?.assumption_type] || '#64748b'}20`,
          color: typeColors[assumption.custom_fields?.assumption_type] || '#64748b',
        }}>
          {assumption.custom_fields?.assumption_type || 'Unknown'}
        </span>
        <span style={{ fontWeight: 500 }}>{assumption.name}</span>
      </div>

      <span style={{
        fontSize: '0.8125rem',
        color: riskColors[assumption.custom_fields?.risk_level] || '#64748b',
        fontWeight: 500,
      }}>
        {assumption.custom_fields?.risk_level || '-'} Risk
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 60,
          height: 6,
          borderRadius: 3,
          backgroundColor: 'var(--bg-secondary)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${confidence}%`,
            height: '100%',
            borderRadius: 3,
            backgroundColor: confidence > 70 ? '#22c55e' : confidence > 40 ? '#f59e0b' : '#ef4444',
          }} />
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 35 }}>
          {confidence}%
        </span>
      </div>

      <span style={{
        fontSize: '0.8125rem',
        color: 'var(--text-muted)',
      }}>
        {assumption.custom_fields?.validation_status || 'Not Tested'}
      </span>

      <div style={{ display: 'flex', gap: 4 }}>
        <IconButton
          icon={EditIcon}
          size="sm"
          onClick={(e) => { e.stopPropagation(); onEdit(assumption); }}
          title="Edit"
        />
        <IconButton
          icon={DeleteIcon}
          size="sm"
          variant="danger"
          onClick={(e) => { e.stopPropagation(); onDelete(assumption); }}
          title="Delete"
        />
      </div>
    </ListRow>
  );
}

// Build stats for header
function useValidationStats(experiments, assumptions) {
  return useMemo(() => {
    const running = experiments.filter(e => e.custom_fields?.outcome === 'Running').length;
    const validated = experiments.filter(e => e.custom_fields?.outcome === 'Validated').length;
    const highRisk = assumptions.filter(a => a.custom_fields?.risk_level === 'High').length;
    const untested = assumptions.filter(a =>
      !a.custom_fields?.validation_status || a.custom_fields?.validation_status === 'Not Tested'
    ).length;

    const stats = [
      { value: experiments.length, label: 'Experiments', color: '#10b981', icon: BiotechIcon },
      { value: running, label: 'Running', color: '#3b82f6', icon: PlayCircleIcon },
      { value: validated, label: 'Validated', color: '#22c55e', icon: CheckCircleIcon },
      { value: assumptions.length, label: 'Assumptions', color: '#dc2626', icon: WarningIcon },
      { value: highRisk, label: 'High Risk', color: '#ef4444' },
    ];

    return { stats, total: experiments.length + assumptions.length };
  }, [experiments, assumptions]);
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
    loading,
  } = usePDW();

  const [viewMode, setViewMode] = useState('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

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

  // All experiments and assumptions for stats (unfiltered)
  const allExperiments = useMemo(() =>
    artefacts.filter(a => a.artefact_type === 'pdw_experiment'), [artefacts]);
  const allAssumptions = useMemo(() =>
    artefacts.filter(a => a.artefact_type === 'pdw_assumption'), [artefacts]);

  const { stats, total } = useValidationStats(allExperiments, allAssumptions);

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
      if (matrix[key]) matrix[key].push(a);
    });

    return matrix;
  }, [assumptions]);

  // Handlers
  const handleSelect = useCallback((artefact) => {
    setSelectedId(artefact.id);
    if (onSelectArtefact) onSelectArtefact(artefact);
  }, [setSelectedId, onSelectArtefact]);

  const handleEdit = useCallback((artefact) => {
    if (onEditArtefact) onEditArtefact(artefact);
  }, [onEditArtefact]);

  const handleDelete = useCallback((artefact) => {
    if (onDeleteArtefact) onDeleteArtefact(artefact);
  }, [onDeleteArtefact]);

  const handleCreate = useCallback((type) => {
    if (onCreateArtefact) onCreateArtefact(type);
  }, [onCreateArtefact]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setTypeFilter('all');
    setRiskFilter('all');
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading validation items...</p>
      </div>
    );
  }

  const isEmpty = total === 0 && !searchQuery && typeFilter === 'all' && riskFilter === 'all';
  const isFiltered = validationArtefacts.length === 0 && (searchQuery || typeFilter !== 'all' || riskFilter !== 'all');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with inline stats */}
      <ViewHeader
        icon={BiotechIcon}
        iconColor="#10b981"
        title="Validation Board"
        stats={!isEmpty ? stats : undefined}
      />

      {/* Quick create buttons */}
      {!isEmpty && (
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '0 16px 8px',
        }}>
          <button
            onClick={() => handleCreate('pdw_experiment')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            <BiotechIcon style={{ fontSize: 16 }} />
            New Experiment
          </button>
          <button
            onClick={() => handleCreate('pdw_assumption')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            <WarningIcon style={{ color: '#ef4444', fontSize: 16 }} />
            New Assumption
          </button>
        </div>
      )}

      {/* Controls */}
      <ControlsBar>
        <SearchBox
          placeholder="Search experiments & assumptions..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={TYPE_OPTIONS}
        />
        <FilterSelect
          value={riskFilter}
          onChange={setRiskFilter}
          options={RISK_OPTIONS}
        />
        <ViewToggle
          value={viewMode}
          onChange={setViewMode}
          options={VIEW_OPTIONS}
        />
      </ControlsBar>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>
        {/* Empty State */}
        {isEmpty && (
          <QuickStartCard
            onCreateExperiment={() => handleCreate('pdw_experiment')}
            onCreateAssumption={() => handleCreate('pdw_assumption')}
          />
        )}

        {/* Filtered Empty State */}
        {isFiltered && (
          <EmptyFiltered onClear={handleClearFilters} />
        )}

        {/* Matrix View */}
        {!isEmpty && !isFiltered && viewMode === 'matrix' && (
          <div>
            {/* Experiments Section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <BiotechIcon style={{ color: '#10b981' }} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Experiments</h3>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '2px 8px',
                  borderRadius: 12,
                }}>
                  {experiments.length}
                </span>
              </div>

              {experiments.length === 0 ? (
                <div style={{
                  padding: 32,
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 12,
                  border: '1px dashed var(--border)',
                }}>
                  <BiotechIcon style={{ fontSize: 32, color: '#10b981', opacity: 0.5, marginBottom: 8 }} />
                  <p style={{ margin: '0 0 12px', color: 'var(--text-muted)' }}>
                    No experiments yet. Design experiments to test your riskiest assumptions.
                  </p>
                  <button
                    onClick={() => handleCreate('pdw_experiment')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    <AddIcon style={{ fontSize: 16 }} />
                    Create Experiment
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 12,
                }}>
                  {experiments.map(exp => (
                    <ExperimentCard
                      key={exp.id}
                      experiment={exp}
                      onSelect={handleSelect}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      selected={exp.id === selectedId}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Assumption Matrix */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <WarningIcon style={{ color: '#dc2626' }} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Assumption Risk Matrix</h3>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '2px 8px',
                  borderRadius: 12,
                }}>
                  {assumptions.length}
                </span>
              </div>

              <p style={{ margin: '0 0 16px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Place assumptions based on risk level and evidence. Focus on testing items in the "Test Now" quadrant first.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 1fr',
                gridTemplateRows: '1fr 1fr 30px',
                gap: 8,
                minHeight: 320,
              }}>
                {/* Y-axis label */}
                <div style={{
                  gridRow: '1 / 3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                  }}>
                    High Risk ← → Lower Risk
                  </span>
                </div>

                {/* Matrix cells */}
                <MatrixCell
                  assumptions={assumptionMatrix['high-none']}
                  quadrant="high-none"
                  onSelect={handleSelect}
                  selectedId={selectedId}
                  onCreateInQuadrant={() => handleCreate('pdw_assumption')}
                />
                <MatrixCell
                  assumptions={assumptionMatrix['high-some']}
                  quadrant="high-some"
                  onSelect={handleSelect}
                  selectedId={selectedId}
                  onCreateInQuadrant={() => handleCreate('pdw_assumption')}
                />
                <MatrixCell
                  assumptions={assumptionMatrix['low-none']}
                  quadrant="low-none"
                  onSelect={handleSelect}
                  selectedId={selectedId}
                  onCreateInQuadrant={() => handleCreate('pdw_assumption')}
                />
                <MatrixCell
                  assumptions={assumptionMatrix['low-some']}
                  quadrant="low-some"
                  onSelect={handleSelect}
                  selectedId={selectedId}
                  onCreateInQuadrant={() => handleCreate('pdw_assumption')}
                />

                {/* X-axis label */}
                <div />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  padding: '0 12px',
                }}>
                  <span>No Evidence</span>
                  <span>Some Evidence</span>
                </div>
                <div />
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {!isEmpty && !isFiltered && viewMode === 'list' && (
          <div>
            {/* Experiments */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600 }}>
                Experiments ({experiments.length})
              </h3>
              {experiments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No experiments. Create one to test your hypotheses.
                </p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 12,
                }}>
                  {experiments.map(exp => (
                    <ExperimentCard
                      key={exp.id}
                      experiment={exp}
                      onSelect={handleSelect}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      selected={exp.id === selectedId}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Assumptions */}
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600 }}>
                Assumptions ({assumptions.length})
              </h3>
              {assumptions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No assumptions. Start by listing what must be true for your product to succeed.
                </p>
              ) : (
                <ListView>
                  <ListView.Header
                    columns={[
                      { label: 'Type / Name', width: '1fr' },
                      { label: 'Risk', width: '100px' },
                      { label: 'Confidence', width: '120px' },
                      { label: 'Status', width: '100px' },
                      { label: '', width: '70px' },
                    ]}
                  />
                  <ListView.Body>
                    {assumptions.map(a => (
                      <AssumptionListRow
                        key={a.id}
                        assumption={a}
                        onSelect={handleSelect}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        selected={a.id === selectedId}
                      />
                    ))}
                  </ListView.Body>
                </ListView>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
