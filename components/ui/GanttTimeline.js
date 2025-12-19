/**
 * GanttTimeline - Horizontal bar chart with dependencies
 *
 * Reusable component for displaying project timelines
 * with milestones, deliverables, and dependency arrows.
 *
 * @module components/ui/GanttTimeline
 */

import { useMemo, useState } from 'react';
import styles from './ui.module.css';

/**
 * Calculate the position and width of a bar based on dates
 */
function calculateBarPosition(startDate, endDate, timelineStart, timelineEnd) {
  const totalDays = (timelineEnd - timelineStart) / (1000 * 60 * 60 * 24);
  const startDays = (startDate - timelineStart) / (1000 * 60 * 60 * 24);
  const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

  return {
    left: (startDays / totalDays) * 100,
    width: Math.max((durationDays / totalDays) * 100, 1), // Minimum 1% width
  };
}

/**
 * Generate time scale markers
 */
function generateTimeScale(startDate, endDate, interval = 'week') {
  const markers = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    markers.push({
      date: new Date(current),
      label: formatDateLabel(current, interval),
    });

    // Increment based on interval
    switch (interval) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
      default:
        current.setDate(current.getDate() + 7);
    }
  }

  return markers;
}

/**
 * Format date label based on interval
 */
function formatDateLabel(date, interval) {
  const options = {
    day: { month: 'short', day: 'numeric' },
    week: { month: 'short', day: 'numeric' },
    month: { month: 'short', year: '2-digit' },
  };
  return date.toLocaleDateString('en-US', options[interval] || options.week);
}

/**
 * GanttTimeline Component
 *
 * @param {Array} items - Array of timeline items: { id, name, startDate, endDate, type, status, progress, dependencies }
 * @param {Date} startDate - Timeline start date (optional, calculated from items)
 * @param {Date} endDate - Timeline end date (optional, calculated from items)
 * @param {string} interval - Time scale interval: 'day', 'week', 'month'
 * @param {boolean} showDependencies - Show dependency arrows
 * @param {boolean} showProgress - Show progress bars
 * @param {boolean} showToday - Show today marker
 * @param {function} onItemClick - Handler when item clicked
 * @param {function} renderItem - Custom item renderer
 */
export function GanttTimeline({
  items = [],
  startDate,
  endDate,
  interval = 'week',
  showDependencies = true,
  showProgress = true,
  showToday = true,
  onItemClick,
  renderItem,
  className = '',
}) {
  const [hoveredItem, setHoveredItem] = useState(null);

  // Calculate timeline bounds
  const bounds = useMemo(() => {
    if (items.length === 0) {
      const now = new Date();
      return {
        start: startDate || now,
        end: endDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      };
    }

    let minDate = startDate ? new Date(startDate) : null;
    let maxDate = endDate ? new Date(endDate) : null;

    items.forEach(item => {
      const itemStart = new Date(item.startDate || item.planned_start || item.date);
      const itemEnd = new Date(item.endDate || item.planned_end || item.date);

      if (!minDate || itemStart < minDate) minDate = itemStart;
      if (!maxDate || itemEnd > maxDate) maxDate = itemEnd;
    });

    // Add padding
    const padding = (maxDate - minDate) * 0.05;
    return {
      start: new Date(minDate.getTime() - padding),
      end: new Date(maxDate.getTime() + padding),
    };
  }, [items, startDate, endDate]);

  // Generate time scale
  const timeScale = useMemo(() => {
    return generateTimeScale(bounds.start, bounds.end, interval);
  }, [bounds, interval]);

  // Calculate today position
  const todayPosition = useMemo(() => {
    const today = new Date();
    if (today < bounds.start || today > bounds.end) return null;

    const totalDays = (bounds.end - bounds.start) / (1000 * 60 * 60 * 24);
    const todayDays = (today - bounds.start) / (1000 * 60 * 60 * 24);
    return (todayDays / totalDays) * 100;
  }, [bounds]);

  // Group items by type/row
  const groupedItems = useMemo(() => {
    // For now, keep items in their original order
    return items.map((item, index) => ({
      ...item,
      rowIndex: index,
    }));
  }, [items]);

  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <div className={`${styles.ganttTimeline} ${className}`.trim()}>
      {/* Header with time scale */}
      <div className={styles.ganttHeader}>
        <div className={styles.ganttLabelsHeader}>Items</div>
        <div className={styles.ganttTimelineHeader}>
          {timeScale.map((marker, idx) => {
            const totalDays = (bounds.end - bounds.start) / (1000 * 60 * 60 * 24);
            const markerDays = (marker.date - bounds.start) / (1000 * 60 * 60 * 24);
            const position = (markerDays / totalDays) * 100;

            return (
              <div
                key={idx}
                className={styles.ganttTimeMarker}
                style={{ left: `${position}%` }}
              >
                {marker.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Body with rows */}
      <div className={styles.ganttBody}>
        {/* Row labels */}
        <div className={styles.ganttLabels}>
          {groupedItems.map((item) => (
            <div
              key={item.id}
              className={styles.ganttLabelRow}
              onClick={() => handleItemClick(item)}
            >
              <span className={styles.ganttLabelIcon}>
                {item.type === 'milestone' ? '◆' : '▬'}
              </span>
              <span className={styles.ganttLabelText} title={item.name}>
                {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline bars */}
        <div className={styles.ganttBars}>
          {/* Grid lines */}
          <div className={styles.ganttGrid}>
            {timeScale.map((marker, idx) => {
              const totalDays = (bounds.end - bounds.start) / (1000 * 60 * 60 * 24);
              const markerDays = (marker.date - bounds.start) / (1000 * 60 * 60 * 24);
              const position = (markerDays / totalDays) * 100;

              return (
                <div
                  key={idx}
                  className={styles.ganttGridLine}
                  style={{ left: `${position}%` }}
                />
              );
            })}
          </div>

          {/* Today marker */}
          {showToday && todayPosition !== null && (
            <div
              className={styles.ganttTodayMarker}
              style={{ left: `${todayPosition}%` }}
              title="Today"
            />
          )}

          {/* Bars */}
          {groupedItems.map((item) => {
            const itemStart = new Date(item.startDate || item.planned_start || item.date);
            const itemEnd = new Date(item.endDate || item.planned_end || item.date || itemStart);

            const position = calculateBarPosition(itemStart, itemEnd, bounds.start, bounds.end);
            const isHovered = hoveredItem === item.id;
            const isMilestone = item.type === 'milestone';
            const progress = item.progress || 0;

            // Status colors
            const statusColors = {
              not_started: '#94a3b8',
              in_progress: '#3b82f6',
              completed: '#22c55e',
              blocked: '#ef4444',
              at_risk: '#f59e0b',
              upcoming: '#8b5cf6',
              achieved: '#22c55e',
              missed: '#ef4444',
            };

            const barColor = statusColors[item.status] || '#3b82f6';

            return (
              <div
                key={item.id}
                className={styles.ganttBarRow}
              >
                {isMilestone ? (
                  // Milestone (diamond shape)
                  <div
                    className={`${styles.ganttMilestone} ${isHovered ? styles.hovered : ''}`}
                    style={{
                      left: `${position.left}%`,
                      backgroundColor: barColor,
                    }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => handleItemClick(item)}
                    title={`${item.name} - ${itemStart.toLocaleDateString()}`}
                  />
                ) : (
                  // Regular bar
                  <div
                    className={`${styles.ganttBar} ${isHovered ? styles.hovered : ''}`}
                    style={{
                      left: `${position.left}%`,
                      width: `${position.width}%`,
                      backgroundColor: barColor,
                    }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => handleItemClick(item)}
                    title={`${item.name} - ${itemStart.toLocaleDateString()} to ${itemEnd.toLocaleDateString()}`}
                  >
                    {/* Progress overlay */}
                    {showProgress && progress > 0 && (
                      <div
                        className={styles.ganttBarProgress}
                        style={{ width: `${progress}%` }}
                      />
                    )}

                    {/* Bar label (if wide enough) */}
                    {position.width > 10 && (
                      <span className={styles.ganttBarLabel}>
                        {item.name.substring(0, Math.floor(position.width / 3))}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Dependencies (arrows) */}
          {showDependencies && (
            <svg className={styles.ganttDependencies}>
              {groupedItems.map((item) => {
                if (!item.dependencies || item.dependencies.length === 0) return null;

                return item.dependencies.map((depId) => {
                  const depItem = groupedItems.find(i => i.id === depId);
                  if (!depItem) return null;

                  // Calculate arrow positions
                  const fromEnd = new Date(depItem.endDate || depItem.planned_end || depItem.date);
                  const toStart = new Date(item.startDate || item.planned_start || item.date);

                  const fromPos = calculateBarPosition(fromEnd, fromEnd, bounds.start, bounds.end);
                  const toPos = calculateBarPosition(toStart, toStart, bounds.start, bounds.end);

                  const fromY = (depItem.rowIndex + 0.5) * 40; // 40px row height
                  const toY = (item.rowIndex + 0.5) * 40;

                  return (
                    <g key={`${depId}-${item.id}`}>
                      <line
                        x1={`${fromPos.left}%`}
                        y1={fromY}
                        x2={`${toPos.left}%`}
                        y2={toY}
                        stroke="var(--text-muted)"
                        strokeWidth="1"
                        strokeDasharray="4,2"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                });
              })}

              {/* Arrow marker definition */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="6"
                  markerHeight="6"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-muted)" />
                </marker>
              </defs>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ProjectTimeline - Pre-configured Gantt for project milestones and deliverables
 */
export function ProjectTimeline({
  milestones = [],
  deliverables = [],
  onItemClick,
  className = '',
}) {
  // Combine and sort items
  const items = useMemo(() => {
    const combined = [
      ...milestones.map(m => ({
        ...m,
        type: 'milestone',
        name: m.name || m.title,
        startDate: m.planned_date || m.date,
        endDate: m.planned_date || m.date,
      })),
      ...deliverables.map(d => ({
        ...d,
        type: 'deliverable',
        name: d.name || d.title,
        startDate: d.planned_start,
        endDate: d.planned_end,
      })),
    ];

    // Sort by start date
    return combined.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [milestones, deliverables]);

  return (
    <GanttTimeline
      items={items}
      interval="week"
      showDependencies
      showProgress
      showToday
      onItemClick={onItemClick}
      className={className}
    />
  );
}

export default GanttTimeline;
