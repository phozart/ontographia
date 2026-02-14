// components/spaces/gtm/campaigns/DependencyGantt.js
// Campaign dependency Gantt chart visualization

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FlagIcon from '@mui/icons-material/Flag';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventIcon from '@mui/icons-material/Event';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

const ITEM_TYPES = {
  campaign: { label: 'Campaign', icon: CampaignIcon, color: '#47453F' },
  milestone: { label: 'Milestone', icon: FlagIcon, color: '#C9A227' },
  event: { label: 'Event', icon: EventIcon, color: '#5B8A6A' }
};

const DEPENDENCY_TYPES = {
  blocks: { label: 'Blocks', color: '#A54D4D', dash: false },
  informs: { label: 'Informs', color: '#9C9A94', dash: true },
  requires: { label: 'Requires', color: '#47453F', dash: false }
};

const ZOOM_LEVELS = {
  day: { label: 'Day', days: 1, width: 40 },
  week: { label: 'Week', days: 7, width: 120 },
  month: { label: 'Month', days: 30, width: 200 }
};

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDaysBetween(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function DependencyGantt({
  items = [],
  dependencies = [],
  onAddDependency,
  onRemoveDependency,
  onItemClick,
  onItemUpdate
}) {
  const [viewStart, setViewStart] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - 7);
    return today;
  });
  const [zoom, setZoom] = useState('week');
  const [selectedItem, setSelectedItem] = useState(null);
  const [drawingDependency, setDrawingDependency] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const zoomConfig = ZOOM_LEVELS[zoom];
  const viewDays = zoom === 'day' ? 30 : zoom === 'week' ? 12 * 7 : 6 * 30;
  const viewEnd = addDays(viewStart, viewDays);

  // Calculate timeline headers
  const timelineHeaders = useMemo(() => {
    const headers = [];
    let current = new Date(viewStart);

    if (zoom === 'day') {
      while (current <= viewEnd) {
        headers.push({
          date: new Date(current),
          label: formatDate(current),
          isToday: current.toDateString() === new Date().toDateString()
        });
        current = addDays(current, 1);
      }
    } else if (zoom === 'week') {
      while (current <= viewEnd) {
        headers.push({
          date: new Date(current),
          label: `W${getWeekNumber(current)}`,
          sublabel: formatDate(current),
          isToday: false
        });
        current = addDays(current, 7);
      }
    } else {
      while (current <= viewEnd) {
        headers.push({
          date: new Date(current),
          label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          isToday: false
        });
        current.setMonth(current.getMonth() + 1);
      }
    }

    return headers;
  }, [viewStart, viewEnd, zoom]);

  // Calculate item positions
  const itemPositions = useMemo(() => {
    return items.map((item, index) => {
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate || item.startDate);

      const startOffset = getDaysBetween(viewStart, startDate);
      const duration = getDaysBetween(startDate, endDate) || 1;

      const left = (startOffset / viewDays) * 100;
      const width = (duration / viewDays) * 100;

      return {
        ...item,
        index,
        left: Math.max(0, left),
        width: Math.min(100 - Math.max(0, left), width),
        top: index * 48 + 8,
        visible: left + width > 0 && left < 100
      };
    });
  }, [items, viewStart, viewDays]);

  // Calculate dependency lines
  const dependencyLines = useMemo(() => {
    return dependencies.map(dep => {
      const source = itemPositions.find(p => p.id === dep.sourceId);
      const target = itemPositions.find(p => p.id === dep.targetId);

      if (!source || !target) return null;

      const sourceX = source.left + source.width;
      const sourceY = source.top + 20;
      const targetX = target.left;
      const targetY = target.top + 20;

      // Create a curved path
      const midX = (sourceX + targetX) / 2;

      return {
        ...dep,
        path: `M ${sourceX}% ${sourceY} C ${midX}% ${sourceY}, ${midX}% ${targetY}, ${targetX}% ${targetY}`,
        sourceX,
        sourceY,
        targetX,
        targetY
      };
    }).filter(Boolean);
  }, [dependencies, itemPositions]);

  const handlePrevious = useCallback(() => {
    const days = zoom === 'day' ? 7 : zoom === 'week' ? 28 : 30;
    setViewStart(prev => addDays(prev, -days));
  }, [zoom]);

  const handleNext = useCallback(() => {
    const days = zoom === 'day' ? 7 : zoom === 'week' ? 28 : 30;
    setViewStart(prev => addDays(prev, days));
  }, [zoom]);

  const handleToday = useCallback(() => {
    const today = new Date();
    today.setDate(today.getDate() - 7);
    setViewStart(today);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (zoom === 'month') setZoom('week');
    else if (zoom === 'week') setZoom('day');
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    if (zoom === 'day') setZoom('week');
    else if (zoom === 'week') setZoom('month');
  }, [zoom]);

  const handleItemMouseDown = useCallback((item, e) => {
    if (e.shiftKey) {
      setDrawingDependency({ sourceId: item.id, sourceType: item.type });
    } else {
      setSelectedItem(item.id);
      if (onItemClick) onItemClick(item);
    }
  }, [onItemClick]);

  const handleItemMouseUp = useCallback((item) => {
    if (drawingDependency && drawingDependency.sourceId !== item.id) {
      setShowAddModal({
        sourceId: drawingDependency.sourceId,
        sourceType: drawingDependency.sourceType,
        targetId: item.id,
        targetType: item.type
      });
    }
    setDrawingDependency(null);
  }, [drawingDependency]);

  const handleAddDependency = useCallback((type) => {
    if (showAddModal && onAddDependency) {
      onAddDependency({
        id: Date.now().toString(),
        sourceId: showAddModal.sourceId,
        sourceType: showAddModal.sourceType,
        targetId: showAddModal.targetId,
        targetType: showAddModal.targetType,
        dependencyType: type,
        lagDays: 0
      });
    }
    setShowAddModal(false);
  }, [showAddModal, onAddDependency]);

  const handleRemoveDependency = useCallback((depId) => {
    if (onRemoveDependency) {
      onRemoveDependency(depId);
    }
  }, [onRemoveDependency]);

  // Today marker position
  const todayPosition = useMemo(() => {
    const today = new Date();
    const offset = getDaysBetween(viewStart, today);
    return (offset / viewDays) * 100;
  }, [viewStart, viewDays]);

  return (
    <div className="dependency-gantt">
      <div className="gantt-header">
        <div className="gantt-title">
          <AccountTreeIcon />
          Campaign Dependencies
        </div>

        <div className="gantt-controls">
          <div className="gantt-zoom">
            <button
              className="gantt-zoom-btn"
              onClick={handleZoomOut}
              disabled={zoom === 'month'}
              title="Zoom out"
            >
              <ZoomOutIcon fontSize="small" />
            </button>
            <span className="gantt-zoom-label">{zoomConfig.label}</span>
            <button
              className="gantt-zoom-btn"
              onClick={handleZoomIn}
              disabled={zoom === 'day'}
              title="Zoom in"
            >
              <ZoomInIcon fontSize="small" />
            </button>
          </div>

          <div className="gantt-nav">
            <button className="gantt-nav-btn" onClick={handlePrevious}>
              <ChevronLeftIcon fontSize="small" />
            </button>
            <button className="gantt-today-btn" onClick={handleToday}>
              <TodayIcon fontSize="small" />
              Today
            </button>
            <button className="gantt-nav-btn" onClick={handleNext}>
              <ChevronRightIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      <div className="gantt-hint">
        <span>Shift + drag from one item to another to create a dependency</span>
      </div>

      <div className="gantt-container" ref={containerRef}>
        {/* Timeline header */}
        <div className="gantt-timeline-header">
          <div className="gantt-row-labels-spacer" />
          <div className="gantt-timeline-cells">
            {timelineHeaders.map((header, i) => (
              <div
                key={i}
                className={`gantt-timeline-cell ${header.isToday ? 'today' : ''}`}
                style={{ width: `${100 / timelineHeaders.length}%` }}
              >
                <span className="gantt-timeline-label">{header.label}</span>
                {header.sublabel && (
                  <span className="gantt-timeline-sublabel">{header.sublabel}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chart area */}
        <div className="gantt-chart-area">
          {/* Row labels */}
          <div className="gantt-row-labels">
            {items.map((item, index) => {
              const typeConfig = ITEM_TYPES[item.type] || ITEM_TYPES.campaign;
              const Icon = typeConfig.icon;

              return (
                <div
                  key={item.id}
                  className={`gantt-row-label ${selectedItem === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedItem(item.id)}
                >
                  <Icon fontSize="small" style={{ color: typeConfig.color }} />
                  <span className="gantt-row-name">{item.name}</span>
                </div>
              );
            })}
          </div>

          {/* Bars area */}
          <div className="gantt-bars-area">
            {/* Grid lines */}
            <div className="gantt-grid">
              {timelineHeaders.map((_, i) => (
                <div
                  key={i}
                  className="gantt-grid-line"
                  style={{ left: `${(i / timelineHeaders.length) * 100}%` }}
                />
              ))}
            </div>

            {/* Today marker */}
            {todayPosition >= 0 && todayPosition <= 100 && (
              <div
                className="gantt-today-marker"
                style={{ left: `${todayPosition}%` }}
              />
            )}

            {/* Dependency lines */}
            <svg className="gantt-dependency-svg" ref={svgRef}>
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#9C9A94" />
                </marker>
                <marker
                  id="arrowhead-blocks"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#A54D4D" />
                </marker>
              </defs>
              {dependencyLines.map(dep => {
                const depConfig = DEPENDENCY_TYPES[dep.dependencyType] || DEPENDENCY_TYPES.blocks;
                return (
                  <g key={dep.id} className="gantt-dependency-line">
                    <path
                      d={dep.path}
                      fill="none"
                      stroke={depConfig.color}
                      strokeWidth="2"
                      strokeDasharray={depConfig.dash ? '4,4' : 'none'}
                      markerEnd={`url(#arrowhead${dep.dependencyType === 'blocks' ? '-blocks' : ''})`}
                    />
                    <circle
                      cx={`${dep.sourceX}%`}
                      cy={dep.sourceY}
                      r="4"
                      fill={depConfig.color}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Bars */}
            {itemPositions.filter(p => p.visible).map(item => {
              const typeConfig = ITEM_TYPES[item.type] || ITEM_TYPES.campaign;
              const isMilestone = item.type === 'milestone';

              return (
                <div
                  key={item.id}
                  className={`gantt-bar ${item.type} ${selectedItem === item.id ? 'selected' : ''}`}
                  style={{
                    left: `${item.left}%`,
                    width: isMilestone ? '16px' : `${item.width}%`,
                    top: `${item.top}px`,
                    backgroundColor: isMilestone ? 'transparent' : typeConfig.color
                  }}
                  onMouseDown={(e) => handleItemMouseDown(item, e)}
                  onMouseUp={() => handleItemMouseUp(item)}
                >
                  {isMilestone ? (
                    <div
                      className="gantt-milestone-diamond"
                      style={{ backgroundColor: typeConfig.color }}
                    />
                  ) : (
                    <span className="gantt-bar-label">{item.name}</span>
                  )}
                </div>
              );
            })}

            {/* Row backgrounds */}
            {items.map((_, index) => (
              <div
                key={index}
                className="gantt-row-bg"
                style={{ top: `${index * 48}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="gantt-legend">
        <div className="gantt-legend-section">
          <span className="gantt-legend-title">Item Types:</span>
          {Object.entries(ITEM_TYPES).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="gantt-legend-item">
                <Icon fontSize="small" style={{ color: config.color }} />
                <span>{config.label}</span>
              </div>
            );
          })}
        </div>
        <div className="gantt-legend-section">
          <span className="gantt-legend-title">Dependencies:</span>
          {Object.entries(DEPENDENCY_TYPES).map(([key, config]) => (
            <div key={key} className="gantt-legend-item">
              <span
                className="gantt-legend-line"
                style={{
                  backgroundColor: config.color,
                  borderStyle: config.dash ? 'dashed' : 'solid'
                }}
              />
              <span>{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add dependency modal */}
      {showAddModal && (
        <div className="gantt-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="gantt-modal" onClick={e => e.stopPropagation()}>
            <h3>Create Dependency</h3>
            <p className="gantt-modal-desc">
              Select the relationship type:
            </p>
            <div className="gantt-modal-options">
              {Object.entries(DEPENDENCY_TYPES).map(([key, config]) => (
                <button
                  key={key}
                  className="gantt-dep-option"
                  onClick={() => handleAddDependency(key)}
                >
                  <span
                    className="gantt-dep-color"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="gantt-dep-label">{config.label}</span>
                  <span className="gantt-dep-desc">
                    {key === 'blocks' && 'Target cannot start until source completes'}
                    {key === 'informs' && 'Target should consider source output'}
                    {key === 'requires' && 'Target needs source as prerequisite'}
                  </span>
                </button>
              ))}
            </div>
            <button
              className="gantt-modal-cancel"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Dependencies list */}
      {dependencies.length > 0 && (
        <div className="gantt-dependencies-list">
          <h4>Active Dependencies ({dependencies.length})</h4>
          <div className="gantt-dep-items">
            {dependencies.map(dep => {
              const source = items.find(i => i.id === dep.sourceId);
              const target = items.find(i => i.id === dep.targetId);
              const depConfig = DEPENDENCY_TYPES[dep.dependencyType] || DEPENDENCY_TYPES.blocks;

              if (!source || !target) return null;

              return (
                <div key={dep.id} className="gantt-dep-item">
                  <span className="gantt-dep-source">{source.name}</span>
                  <span
                    className="gantt-dep-arrow"
                    style={{ color: depConfig.color }}
                  >
                    → {depConfig.label.toLowerCase()} →
                  </span>
                  <span className="gantt-dep-target">{target.name}</span>
                  <button
                    className="gantt-dep-remove"
                    onClick={() => handleRemoveDependency(dep.id)}
                    title="Remove dependency"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
