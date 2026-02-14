// components/dwd/views/AdjustmentLog.js
// DWD Adjustment Log - View and manage adjustments (interventions)

import { useState, useMemo, useEffect, useRef } from 'react';
import { useDWD } from '../DWDContext';
import GuidancePanel from '../shared/GuidancePanel';
import QuickStartCard from '../shared/QuickStartCard';
import { ADJUSTMENT_LOG_GUIDANCE } from '../../../../lib/dwd-guidance';

// MUI Icons
import TuneIcon from '@mui/icons-material/Tune';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import ReplayIcon from '@mui/icons-material/Replay';
import UndoIcon from '@mui/icons-material/Undo';

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

  // Undo toast state
  const [undoToast, setUndoToast] = useState(null);

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

  // Timer ref for undo toast auto-dismiss
  const undoTimerRef = useRef(null);

  // Clear undo toast on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedItem) return;

    const currentStatus = draggedItem.custom_fields?.adjustment_status || 'proposed';
    if (currentStatus === newStatus) {
      setDraggedItem(null);
      return;
    }

    // Store previous state for undo
    const previousStatus = currentStatus;
    const adjustmentId = draggedItem.id;
    const adjustmentName = draggedItem.name;

    // Update the adjustment status
    try {
      await updateArtefact(adjustmentId, {
        ...draggedItem,
        custom_fields: {
          ...draggedItem.custom_fields,
          adjustment_status: newStatus,
        },
      });

      // Show undo toast
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }

      setUndoToast({
        adjustmentId,
        adjustmentName,
        previousStatus,
        newStatus,
      });

      // Auto-dismiss after 5 seconds
      undoTimerRef.current = setTimeout(() => {
        setUndoToast(null);
      }, 5000);
    } catch (error) {
      console.error('Failed to update adjustment status:', error);
    }

    setDraggedItem(null);
  };

  // Undo status change
  const handleUndo = async () => {
    if (!undoToast) return;

    try {
      const adjustment = adjustments.find(a => a.id === undoToast.adjustmentId);
      if (adjustment) {
        await updateArtefact(undoToast.adjustmentId, {
          ...adjustment,
          custom_fields: {
            ...adjustment.custom_fields,
            adjustment_status: undoToast.previousStatus,
          },
        });
      }
    } catch (error) {
      console.error('Failed to undo status change:', error);
    }

    // Clear the toast
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    setUndoToast(null);
  };

  return (
    <div className="dwd-adjustment-log">
      {/* Guidance Panel */}
      {showGuidance && (
        <GuidancePanel
          guidance={ADJUSTMENT_LOG_GUIDANCE}
          onClose={() => setShowGuidance(false)}
        />
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
      {isEmpty && (
        <QuickStartCard
          quickStart={ADJUSTMENT_LOG_GUIDANCE.quickStart}
          onCreate={onCreateArtefact}
        />
      )}

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

      {/* Undo Toast */}
      {undoToast && (
        <div className="dwd-undo-toast">
          <span className="dwd-undo-toast__message">
            Moved "{undoToast.adjustmentName}" to {undoToast.newStatus}
          </span>
          <button className="dwd-undo-toast__btn" onClick={handleUndo}>
            <UndoIcon fontSize="small" />
            Undo
          </button>
          <button
            className="dwd-undo-toast__dismiss"
            onClick={() => setUndoToast(null)}
          >
            ×
          </button>
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
