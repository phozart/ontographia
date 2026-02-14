// components/ba/EnhancedKanban.js
// Enhanced Kanban Board with WIP Limits, Swimlanes, and Metrics
// BABOK Agile View with cycle time tracking

import { useState, useMemo, useCallback } from 'react';
import { useArtefacts, ARTEFACT_TYPES, ARTEFACT_STATUS } from '../../ArtefactContext';

// MUI Icons
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import TimelineIcon from '@mui/icons-material/Timeline';
import SpeedIcon from '@mui/icons-material/Speed';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// ============ DEFAULT COLUMNS ============
const DEFAULT_COLUMNS = [
  { id: 'backlog', name: 'Backlog', status: 'Backlog', wipLimit: 0, color: '#94a3b8' },
  { id: 'ready', name: 'Ready', status: 'Ready', wipLimit: 10, color: '#3b82f6' },
  { id: 'in-progress', name: 'In Progress', status: 'In Progress', wipLimit: 5, color: '#f59e0b' },
  { id: 'review', name: 'Review', status: 'Review', wipLimit: 3, color: '#8b5cf6' },
  { id: 'done', name: 'Done', status: 'Done', wipLimit: 0, color: '#22c55e' },
];

// ============ KANBAN CARD ============
function KanbanCard({ item, onDragStart, onDragEnd, onClick }) {
  const typeDef = ARTEFACT_TYPES[item.artefactType];

  // Calculate days in current status (mock - would need actual tracking)
  const daysInStatus = useMemo(() => {
    if (item.statusChangedAt) {
      const days = Math.floor((Date.now() - new Date(item.statusChangedAt).getTime()) / (1000 * 60 * 60 * 24));
      return days;
    }
    return Math.floor(Math.random() * 10); // Mock data
  }, [item.statusChangedAt]);

  const isAging = daysInStatus > 5;
  const isCritical = daysInStatus > 10;

  return (
    <div
      className={`kanban-card ${isAging ? 'aging' : ''} ${isCritical ? 'critical' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(item)}
    >
      <div className="card-header">
        <span className="card-type" style={{ backgroundColor: typeDef?.color }}>
          {typeDef?.icon}
        </span>
        <span className="card-id">{item.requirementId || item.id.slice(0, 8)}</span>
        {item.storyPoints && (
          <span className="story-points">{item.storyPoints} pts</span>
        )}
      </div>

      <h4 className="card-title">{item.name}</h4>

      {item.assignee && (
        <div className="card-assignee">
          <span className="assignee-avatar">{item.assignee[0]}</span>
          <span className="assignee-name">{item.assignee}</span>
        </div>
      )}

      <div className="card-footer">
        {item.priority && (
          <span className={`priority-badge ${item.priority.toLowerCase()}`}>
            {item.priority}
          </span>
        )}
        <span className={`days-badge ${isAging ? 'aging' : ''} ${isCritical ? 'critical' : ''}`}>
          <AccessTimeIcon fontSize="small" />
          {daysInStatus}d
        </span>
      </div>

      <div className="drag-handle">
        <DragIndicatorIcon fontSize="small" />
      </div>
    </div>
  );
}

// ============ KANBAN COLUMN ============
function KanbanColumn({ column, items, onDragStart, onDragEnd, onDragOver, onDrop, onCardClick, swimlane }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const isOverWip = column.wipLimit > 0 && items.length > column.wipLimit;
  const isAtWip = column.wipLimit > 0 && items.length === column.wipLimit;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    setIsDragOver(false);
    onDrop(e, column.status, swimlane);
  };

  return (
    <div
      className={`kanban-column ${isDragOver ? 'drag-over' : ''} ${isOverWip ? 'over-wip' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header" style={{ borderTopColor: column.color }}>
        <h3>{column.name}</h3>
        <div className="column-meta">
          <span className={`item-count ${isOverWip ? 'over' : ''} ${isAtWip ? 'at-limit' : ''}`}>
            {items.length}
            {column.wipLimit > 0 && ` / ${column.wipLimit}`}
          </span>
          {isOverWip && (
            <WarningIcon className="wip-warning" style={{ color: '#ef4444' }} />
          )}
        </div>
      </div>

      <div className="column-body">
        {items.length === 0 ? (
          <div className="empty-column">
            <span>No items</span>
          </div>
        ) : (
          items.map(item => (
            <KanbanCard
              key={item.id}
              item={item}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============ SWIMLANE ============
function Swimlane({ epic, columns, items, onDragStart, onDragEnd, onDragOver, onDrop, onCardClick }) {
  const [collapsed, setCollapsed] = useState(false);

  // Group items by status
  const itemsByStatus = useMemo(() => {
    const grouped = {};
    columns.forEach(col => {
      grouped[col.status] = items.filter(item => item.status === col.status);
    });
    return grouped;
  }, [items, columns]);

  const totalItems = items.length;
  const doneItems = itemsByStatus['Done']?.length || 0;
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className={`kanban-swimlane ${collapsed ? 'collapsed' : ''}`}>
      <div className="swimlane-header" onClick={() => setCollapsed(!collapsed)}>
        <button className="collapse-btn">
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </button>
        <span className="swimlane-icon">{ARTEFACT_TYPES.Epic?.icon || '📦'}</span>
        <h4>{epic?.name || 'Unassigned'}</h4>
        <div className="swimlane-meta">
          <span className="item-count">{totalItems} items</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      </div>

      {!collapsed && (
        <div className="swimlane-body">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              items={itemsByStatus[column.status] || []}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onCardClick={onCardClick}
              swimlane={epic?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ METRICS PANEL ============
function MetricsPanel({ items, columns }) {
  const metrics = useMemo(() => {
    // Calculate metrics
    const byStatus = {};
    columns.forEach(col => {
      byStatus[col.status] = items.filter(i => i.status === col.status).length;
    });

    const inProgress = byStatus['In Progress'] || 0;
    const done = byStatus['Done'] || 0;
    const total = items.length;

    // Mock cycle time data
    const avgCycleTime = 4.2; // days
    const throughput = 3.5; // items per week

    return {
      total,
      inProgress,
      done,
      avgCycleTime,
      throughput,
      byStatus,
    };
  }, [items, columns]);

  return (
    <div className="metrics-panel">
      <h4>
        <TrendingUpIcon fontSize="small" />
        Metrics
      </h4>

      <div className="metrics-grid">
        <div className="metric">
          <span className="metric-value">{metrics.total}</span>
          <span className="metric-label">Total Items</span>
        </div>
        <div className="metric">
          <span className="metric-value">{metrics.inProgress}</span>
          <span className="metric-label">In Progress</span>
        </div>
        <div className="metric">
          <span className="metric-value">{metrics.done}</span>
          <span className="metric-label">Completed</span>
        </div>
        <div className="metric">
          <span className="metric-value">{metrics.avgCycleTime}d</span>
          <span className="metric-label">Avg Cycle Time</span>
        </div>
        <div className="metric">
          <span className="metric-value">{metrics.throughput}/wk</span>
          <span className="metric-label">Throughput</span>
        </div>
      </div>

      {/* Simple cumulative flow representation */}
      <div className="cumulative-flow">
        <h5>Status Distribution</h5>
        <div className="flow-bars">
          {columns.map(col => {
            const count = metrics.byStatus[col.status] || 0;
            const pct = metrics.total > 0 ? (count / metrics.total) * 100 : 0;
            return (
              <div key={col.id} className="flow-bar" style={{ width: `${pct}%`, backgroundColor: col.color }} title={`${col.name}: ${count}`}>
                {pct > 10 && <span>{count}</span>}
              </div>
            );
          })}
        </div>
        <div className="flow-legend">
          {columns.map(col => (
            <div key={col.id} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: col.color }} />
              <span>{col.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ WIP SETTINGS MODAL ============
function WipSettingsModal({ columns, onSave, onClose }) {
  const [editColumns, setEditColumns] = useState(columns);

  const handleWipChange = (columnId, value) => {
    setEditColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, wipLimit: parseInt(value) || 0 } : col
      )
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="wip-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>WIP Limit Settings</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-body">
          <p className="settings-info">
            Set Work-in-Progress limits for each column. Set to 0 for no limit.
            WIP limits help prevent bottlenecks and improve flow.
          </p>

          <div className="wip-settings-list">
            {editColumns.map(col => (
              <div key={col.id} className="wip-setting-row">
                <span className="column-color" style={{ backgroundColor: col.color }} />
                <span className="column-name">{col.name}</span>
                <input
                  type="number"
                  min="0"
                  value={col.wipLimit}
                  onChange={(e) => handleWipChange(col.id, e.target.value)}
                />
                <span className="limit-label">{col.wipLimit === 0 ? 'No limit' : 'items max'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => { onSave(editColumns); onClose(); }} className="btn-primary">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN ENHANCED KANBAN ============
export default function EnhancedKanban({ projectId }) {
  const { artefacts, updateArtefact } = useArtefacts();

  // State
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'swimlanes'
  const [filterType, setFilterType] = useState('all');
  const [showMetrics, setShowMetrics] = useState(true);
  const [showWipSettings, setShowWipSettings] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Filter kanban items (Stories, Features)
  const kanbanItems = useMemo(() => {
    const kanbanTypes = ['Story', 'Feature', 'Task'];
    return artefacts.filter(a => {
      if (!kanbanTypes.includes(a.artefactType)) return false;
      if (filterType !== 'all' && a.artefactType !== filterType) return false;
      return true;
    });
  }, [artefacts, filterType]);

  // Get Epics for swimlanes
  const epics = useMemo(() => {
    return artefacts.filter(a => a.artefactType === 'Epic');
  }, [artefacts]);

  // Group items by Epic for swimlanes
  const itemsByEpic = useMemo(() => {
    const grouped = { unassigned: [] };
    epics.forEach(epic => {
      grouped[epic.id] = [];
    });

    kanbanItems.forEach(item => {
      const epicId = item.epicId || item.parentId;
      if (epicId && grouped[epicId]) {
        grouped[epicId].push(item);
      } else {
        grouped.unassigned.push(item);
      }
    });

    return grouped;
  }, [kanbanItems, epics]);

  // Group items by status for board view
  const itemsByStatus = useMemo(() => {
    const grouped = {};
    columns.forEach(col => {
      grouped[col.status] = kanbanItems.filter(item => item.status === col.status);
    });
    return grouped;
  }, [kanbanItems, columns]);

  // Drag handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus, swimlane) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Update the item's status
    await updateArtefact(draggedItem.id, {
      ...draggedItem,
      status: newStatus,
      statusChangedAt: new Date().toISOString(),
    });

    setDraggedItem(null);
  };

  const handleCardClick = (item) => {
    // Could open detail panel or modal
    console.log('Card clicked:', item);
  };

  return (
    <div className="enhanced-kanban-view">
      {/* Header */}
      <div className="kanban-header">
        <div className="header-title">
          <ViewKanbanIcon style={{ fontSize: 28, color: '#3b82f6' }} />
          <div>
            <h2>Kanban Board</h2>
            <p>Visualize workflow with WIP limits and swimlanes</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={viewMode === 'board' ? 'active' : ''}
              onClick={() => setViewMode('board')}
              title="Board View"
            >
              <ViewColumnIcon fontSize="small" />
              Board
            </button>
            <button
              className={viewMode === 'swimlanes' ? 'active' : ''}
              onClick={() => setViewMode('swimlanes')}
              title="Swimlanes"
            >
              <ViewStreamIcon fontSize="small" />
              Swimlanes
            </button>
          </div>

          <div className="filter-group">
            <FilterListIcon fontSize="small" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="Story">Stories</option>
              <option value="Feature">Features</option>
              <option value="Task">Tasks</option>
            </select>
          </div>

          <button
            className={`toggle-btn ${showMetrics ? 'active' : ''}`}
            onClick={() => setShowMetrics(!showMetrics)}
            title="Toggle Metrics"
          >
            <TimelineIcon fontSize="small" />
          </button>

          <button
            className="settings-btn"
            onClick={() => setShowWipSettings(true)}
            title="WIP Settings"
          >
            <SettingsIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`kanban-content ${showMetrics ? 'with-metrics' : ''}`}>
        <div className="kanban-board-container">
          {viewMode === 'board' ? (
            /* Standard Board View */
            <div className="kanban-board">
              {columns.map(column => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  items={itemsByStatus[column.status] || []}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          ) : (
            /* Swimlanes View */
            <div className="kanban-swimlanes">
              {/* Column Headers */}
              <div className="swimlane-columns-header">
                <div className="swimlane-label-placeholder" />
                {columns.map(col => (
                  <div key={col.id} className="column-header-cell" style={{ borderTopColor: col.color }}>
                    <span>{col.name}</span>
                    {col.wipLimit > 0 && <span className="wip-badge">WIP: {col.wipLimit}</span>}
                  </div>
                ))}
              </div>

              {/* Epic Swimlanes */}
              {epics.map(epic => (
                <Swimlane
                  key={epic.id}
                  epic={epic}
                  columns={columns}
                  items={itemsByEpic[epic.id] || []}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onCardClick={handleCardClick}
                />
              ))}

              {/* Unassigned Swimlane */}
              {itemsByEpic.unassigned.length > 0 && (
                <Swimlane
                  epic={null}
                  columns={columns}
                  items={itemsByEpic.unassigned}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onCardClick={handleCardClick}
                />
              )}

              {epics.length === 0 && itemsByEpic.unassigned.length === 0 && (
                <div className="empty-swimlanes">
                  <ViewStreamIcon style={{ fontSize: 48, opacity: 0.3 }} />
                  <h3>No Items to Display</h3>
                  <p>Create Stories or Features and assign them to Epics to use swimlanes.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metrics Panel */}
        {showMetrics && (
          <MetricsPanel items={kanbanItems} columns={columns} />
        )}
      </div>

      {/* WIP Settings Modal */}
      {showWipSettings && (
        <WipSettingsModal
          columns={columns}
          onSave={setColumns}
          onClose={() => setShowWipSettings(false)}
        />
      )}
    </div>
  );
}
