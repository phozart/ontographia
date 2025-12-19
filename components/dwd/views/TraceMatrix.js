// components/dwd/views/TraceMatrix.js
// Trace matrix showing relationships between signals, adjustments, and learnings

import { useMemo } from 'react';
import { useDWD } from '../DWDContext';
import { ViewHeader, EmptyState, Button } from '../../ui';

// MUI Icons
import GridOnIcon from '@mui/icons-material/GridOn';
import WarningIcon from '@mui/icons-material/Warning';
import TuneIcon from '@mui/icons-material/Tune';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FolderIcon from '@mui/icons-material/Folder';

const STATUS_COLORS = {
  proposed: '#9ca3af',
  trying: '#f59e0b',
  adopted: '#10b981',
  reverted: '#ef4444',
};

export default function TraceMatrix({ onEditArtefact, onSelectArtefact, onCreateArtefact }) {
  const { activeCase, artefacts, relationships } = useDWD();

  // Build the trace chains
  const traceData = useMemo(() => {
    if (!activeCase) return { signals: [], chains: [], coverage: {} };

    // Get artefacts related to this case
    const caseRelationships = relationships.filter(
      r => r.from_artefact_id === activeCase.id || r.to_artefact_id === activeCase.id
    );

    const relatedIds = new Set(
      caseRelationships.map(r =>
        r.from_artefact_id === activeCase.id ? r.to_artefact_id : r.from_artefact_id
      )
    );

    // Filter artefacts by type
    const signals = artefacts.filter(
      a => a.artefact_type === 'dwd_signal' &&
           (relatedIds.has(a.id) || a.custom_fields?.case_id === activeCase.id)
    );
    const adjustments = artefacts.filter(
      a => a.artefact_type === 'dwd_adjustment' &&
           (relatedIds.has(a.id) || a.custom_fields?.case_id === activeCase.id)
    );
    const learnings = artefacts.filter(
      a => a.artefact_type === 'dwd_learning' &&
           (relatedIds.has(a.id) || a.custom_fields?.case_id === activeCase.id)
    );

    // Build signal-to-adjustment relationships
    const signalToAdjustments = {};
    signals.forEach(s => {
      signalToAdjustments[s.id] = [];
    });

    // Find relationships between signals and adjustments
    relationships.forEach(r => {
      if (r.relationship_type === 'signal_triggers_adjustment' ||
          r.relationship_type === 'addresses' ||
          r.relationship_type === 'responds_to') {
        if (signalToAdjustments[r.from_artefact_id]) {
          const adj = adjustments.find(a => a.id === r.to_artefact_id);
          if (adj) signalToAdjustments[r.from_artefact_id].push(adj);
        }
        if (signalToAdjustments[r.to_artefact_id]) {
          const adj = adjustments.find(a => a.id === r.from_artefact_id);
          if (adj) signalToAdjustments[r.to_artefact_id].push(adj);
        }
      }
    });

    // Build adjustment-to-learning relationships
    const adjustmentToLearnings = {};
    adjustments.forEach(a => {
      adjustmentToLearnings[a.id] = [];
    });

    relationships.forEach(r => {
      if (r.relationship_type === 'adjustment_produces_learning' ||
          r.relationship_type === 'produces' ||
          r.relationship_type === 'generates') {
        if (adjustmentToLearnings[r.from_artefact_id]) {
          const lrn = learnings.find(l => l.id === r.to_artefact_id);
          if (lrn) adjustmentToLearnings[r.from_artefact_id].push(lrn);
        }
        if (adjustmentToLearnings[r.to_artefact_id]) {
          const lrn = learnings.find(l => l.id === r.from_artefact_id);
          if (lrn) adjustmentToLearnings[r.to_artefact_id].push(lrn);
        }
      }
    });

    // Also check custom_fields for relationships
    adjustments.forEach(adj => {
      const signalId = adj.custom_fields?.signal_id || adj.custom_fields?.addresses_signal;
      if (signalId && signalToAdjustments[signalId]) {
        if (!signalToAdjustments[signalId].find(a => a.id === adj.id)) {
          signalToAdjustments[signalId].push(adj);
        }
      }
    });

    learnings.forEach(lrn => {
      const adjId = lrn.custom_fields?.adjustment_id || lrn.custom_fields?.from_adjustment;
      if (adjId && adjustmentToLearnings[adjId]) {
        if (!adjustmentToLearnings[adjId].find(l => l.id === lrn.id)) {
          adjustmentToLearnings[adjId].push(lrn);
        }
      }
    });

    // Build trace chains
    const chains = signals.map(signal => {
      const signalAdjustments = signalToAdjustments[signal.id] || [];
      const chain = {
        signal,
        adjustments: signalAdjustments.map(adj => ({
          adjustment: adj,
          learnings: adjustmentToLearnings[adj.id] || [],
        })),
        hasAdjustment: signalAdjustments.length > 0,
        hasLearning: signalAdjustments.some(adj =>
          (adjustmentToLearnings[adj.id] || []).length > 0
        ),
      };
      return chain;
    });

    // Calculate coverage metrics
    const signalsWithAdjustments = chains.filter(c => c.hasAdjustment).length;
    const adjustmentsWithLearnings = Object.values(adjustmentToLearnings)
      .filter(ls => ls.length > 0).length;

    const coverage = {
      signalsTotal: signals.length,
      signalsAddressed: signalsWithAdjustments,
      signalCoverage: signals.length > 0
        ? Math.round((signalsWithAdjustments / signals.length) * 100)
        : 0,
      adjustmentsTotal: adjustments.length,
      adjustmentsWithLearnings,
      learningCoverage: adjustments.length > 0
        ? Math.round((adjustmentsWithLearnings / adjustments.length) * 100)
        : 0,
      learningsTotal: learnings.length,
    };

    // Include orphaned adjustments and learnings
    const orphanedAdjustments = adjustments.filter(
      adj => !Object.values(signalToAdjustments).flat().find(a => a.id === adj.id)
    );
    const orphanedLearnings = learnings.filter(
      lrn => !Object.values(adjustmentToLearnings).flat().find(l => l.id === lrn.id)
    );

    return {
      signals,
      chains,
      coverage,
      orphanedAdjustments,
      orphanedLearnings,
      adjustments,
      learnings,
    };
  }, [activeCase, artefacts, relationships]);

  if (!activeCase) {
    return (
      <div className="dwd-trace-matrix">
        <EmptyState
          icon={GridOnIcon}
          iconColor="#8b5cf6"
          title="No Case Selected"
          description="Select a work situation to view the trace matrix"
        />
      </div>
    );
  }

  const { chains, coverage, orphanedAdjustments, orphanedLearnings } = traceData;

  return (
    <div className="dwd-trace-matrix">
      {/* Header */}
      <ViewHeader
        icon={GridOnIcon}
        iconColor="#8b5cf6"
        title="Trace Matrix"
        subtitle={activeCase.name}
        description="Track relationships from signals through adjustments to learnings"
      />

      {/* Coverage Summary */}
      <div className="dwd-trace-matrix__coverage">
        <div className="dwd-coverage-card">
          <div className="dwd-coverage-card__icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <WarningIcon />
          </div>
          <div className="dwd-coverage-card__content">
            <span className="dwd-coverage-card__value">{coverage.signalsAddressed}/{coverage.signalsTotal}</span>
            <span className="dwd-coverage-card__label">Signals Addressed</span>
          </div>
          <div className={`dwd-coverage-card__badge ${coverage.signalCoverage >= 80 ? 'good' : coverage.signalCoverage >= 50 ? 'warning' : 'danger'}`}>
            {coverage.signalCoverage}%
          </div>
        </div>

        <div className="dwd-coverage-card">
          <div className="dwd-coverage-card__icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <TuneIcon />
          </div>
          <div className="dwd-coverage-card__content">
            <span className="dwd-coverage-card__value">{coverage.adjustmentsWithLearnings}/{coverage.adjustmentsTotal}</span>
            <span className="dwd-coverage-card__label">With Learnings</span>
          </div>
          <div className={`dwd-coverage-card__badge ${coverage.learningCoverage >= 80 ? 'good' : coverage.learningCoverage >= 50 ? 'warning' : 'danger'}`}>
            {coverage.learningCoverage}%
          </div>
        </div>

        <div className="dwd-coverage-card">
          <div className="dwd-coverage-card__icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <LightbulbIcon />
          </div>
          <div className="dwd-coverage-card__content">
            <span className="dwd-coverage-card__value">{coverage.learningsTotal}</span>
            <span className="dwd-coverage-card__label">Total Learnings</span>
          </div>
        </div>
      </div>

      {/* Trace Chains */}
      <div className="dwd-trace-matrix__chains">
        <h3>Signal → Adjustment → Learning Chains</h3>

        {chains.length === 0 ? (
          <EmptyState
            icon={WarningIcon}
            iconColor="#ef4444"
            title="No Signals"
            description="No signals recorded for this case"
            actionLabel="Add Signal"
            onAction={() => onCreateArtefact?.('dwd_signal')}
          />
        ) : (
          <div className="dwd-trace-chains">
            {chains.map(chain => (
              <div
                key={chain.signal.id}
                className={`dwd-trace-chain ${!chain.hasAdjustment ? 'dwd-trace-chain--gap' : ''}`}
              >
                {/* Signal */}
                <div
                  className="dwd-trace-node dwd-trace-node--signal"
                  onClick={() => onSelectArtefact?.(chain.signal)}
                >
                  <WarningIcon fontSize="small" />
                  <span className="dwd-trace-node__name">{chain.signal.name}</span>
                  {!chain.hasAdjustment && (
                    <span className="dwd-trace-node__gap">
                      <ErrorOutlineIcon fontSize="small" />
                      No adjustment
                    </span>
                  )}
                </div>

                {/* Adjustments */}
                {chain.adjustments.length > 0 && (
                  <>
                    <ArrowForwardIcon className="dwd-trace-arrow" />
                    <div className="dwd-trace-adjustments">
                      {chain.adjustments.map(({ adjustment, learnings }) => (
                        <div key={adjustment.id} className="dwd-trace-adjustment-group">
                          <div
                            className="dwd-trace-node dwd-trace-node--adjustment"
                            onClick={() => onSelectArtefact?.(adjustment)}
                            style={{ borderLeftColor: STATUS_COLORS[adjustment.custom_fields?.adjustment_status] || '#9ca3af' }}
                          >
                            <TuneIcon fontSize="small" />
                            <span className="dwd-trace-node__name">{adjustment.name}</span>
                            <span
                              className="dwd-trace-node__status"
                              style={{ color: STATUS_COLORS[adjustment.custom_fields?.adjustment_status] || '#9ca3af' }}
                            >
                              {adjustment.custom_fields?.adjustment_status || 'proposed'}
                            </span>
                          </div>

                          {/* Learnings */}
                          {learnings.length > 0 ? (
                            <>
                              <ArrowForwardIcon className="dwd-trace-arrow dwd-trace-arrow--small" />
                              <div className="dwd-trace-learnings">
                                {learnings.map(learning => (
                                  <div
                                    key={learning.id}
                                    className="dwd-trace-node dwd-trace-node--learning"
                                    onClick={() => onSelectArtefact?.(learning)}
                                  >
                                    <LightbulbIcon fontSize="small" />
                                    <span className="dwd-trace-node__name">{learning.name}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="dwd-trace-gap">
                              <span>No learning captured</span>
                              <button
                                className="dwd-trace-gap__action"
                                onClick={() => onCreateArtefact?.('dwd_learning')}
                              >
                                <AddIcon fontSize="small" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Add adjustment action for unaddressed signals */}
                {!chain.hasAdjustment && (
                  <button
                    className="dwd-trace-add"
                    onClick={() => onCreateArtefact?.('dwd_adjustment')}
                    title="Create adjustment for this signal"
                  >
                    <AddIcon fontSize="small" />
                    <span>Add Adjustment</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orphaned Items */}
      {(orphanedAdjustments.length > 0 || orphanedLearnings.length > 0) && (
        <div className="dwd-trace-matrix__orphans">
          <h3>
            <ErrorOutlineIcon />
            Unlinked Items
          </h3>
          <p>These items are not connected to a trace chain</p>

          {orphanedAdjustments.length > 0 && (
            <div className="dwd-orphan-group">
              <h4>Adjustments without linked signals</h4>
              <div className="dwd-orphan-list">
                {orphanedAdjustments.map(adj => (
                  <div
                    key={adj.id}
                    className="dwd-orphan-item"
                    onClick={() => onSelectArtefact?.(adj)}
                  >
                    <TuneIcon fontSize="small" style={{ color: '#10b981' }} />
                    <span>{adj.name}</span>
                    <span
                      className="dwd-orphan-item__status"
                      style={{ color: STATUS_COLORS[adj.custom_fields?.adjustment_status] || '#9ca3af' }}
                    >
                      {adj.custom_fields?.adjustment_status || 'proposed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orphanedLearnings.length > 0 && (
            <div className="dwd-orphan-group">
              <h4>Learnings without linked adjustments</h4>
              <div className="dwd-orphan-list">
                {orphanedLearnings.map(lrn => (
                  <div
                    key={lrn.id}
                    className="dwd-orphan-item"
                    onClick={() => onSelectArtefact?.(lrn)}
                  >
                    <LightbulbIcon fontSize="small" style={{ color: '#06b6d4' }} />
                    <span>{lrn.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="dwd-trace-matrix__legend">
        <h4>Status Legend</h4>
        <div className="dwd-legend-items">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="dwd-legend-item">
              <span className="dwd-legend-dot" style={{ backgroundColor: color }} />
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
