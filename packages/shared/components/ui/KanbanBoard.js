/**
 * KanbanBoard - Draggable column-based board
 *
 * Reusable component for displaying items in columns
 * with drag-and-drop support.
 *
 * @module components/ui/KanbanBoard
 */

import { useState, useCallback } from 'react';
import styles from './ui.module.css';

/**
 * KanbanBoard Component
 *
 * @param {Array} columns - Column definitions: { id, title, color, items }
 * @param {function} onItemMove - Handler when item moves: (itemId, fromColumn, toColumn) => void
 * @param {function} onItemClick - Handler when item clicked: (item) => void
 * @param {function} renderItem - Custom item renderer: (item, column) => ReactNode
 * @param {function} renderColumnHeader - Custom column header renderer: (column) => ReactNode
 * @param {boolean} allowDrag - Enable drag and drop (default: true)
 */
export function KanbanBoard({
  columns = [],
  onItemMove,
  onItemClick,
  renderItem,
  renderColumnHeader,
  allowDrag = true,
  className = '',
}) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragStart = useCallback((e, item, columnId) => {
    if (!allowDrag) return;
    setDraggedItem({ item, fromColumn: columnId });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  }, [allowDrag]);

  const handleDragOver = useCallback((e, columnId) => {
    if (!allowDrag || !draggedItem) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  }, [allowDrag, draggedItem]);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e, toColumnId) => {
    if (!allowDrag || !draggedItem) return;
    e.preventDefault();

    const { item, fromColumn } = draggedItem;

    if (fromColumn !== toColumnId && onItemMove) {
      onItemMove(item.id, fromColumn, toColumnId, item);
    }

    setDraggedItem(null);
    setDragOverColumn(null);
  }, [allowDrag, draggedItem, onItemMove]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverColumn(null);
  }, []);

  const handleItemClick = useCallback((item) => {
    if (onItemClick) {
      onItemClick(item);
    }
  }, [onItemClick]);

  return (
    <div className={`${styles.kanbanBoard} ${className}`.trim()}>
      {columns.map((column) => {
        const isOver = dragOverColumn === column.id;
        const itemCount = column.items?.length || 0;

        return (
          <div
            key={column.id}
            className={`${styles.kanbanColumn} ${isOver ? styles.dragOver : ''}`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div
              className={styles.kanbanColumnHeader}
              style={{ borderTopColor: column.color || 'var(--border)' }}
            >
              {renderColumnHeader ? (
                renderColumnHeader(column)
              ) : (
                <>
                  <span className={styles.kanbanColumnTitle}>{column.title}</span>
                  <span className={styles.kanbanColumnCount}>{itemCount}</span>
                </>
              )}
            </div>

            {/* Column Items */}
            <div className={styles.kanbanColumnItems}>
              {column.items?.map((item) => {
                const isDragging = draggedItem?.item.id === item.id;

                return (
                  <div
                    key={item.id}
                    className={`${styles.kanbanItem} ${isDragging ? styles.dragging : ''}`}
                    draggable={allowDrag}
                    onDragStart={(e) => handleDragStart(e, item, column.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleItemClick(item)}
                  >
                    {renderItem ? (
                      renderItem(item, column)
                    ) : (
                      <KanbanCard item={item} />
                    )}
                  </div>
                );
              })}

              {/* Empty state */}
              {itemCount === 0 && (
                <div className={styles.kanbanColumnEmpty}>
                  No items
                </div>
              )}

              {/* Drop indicator */}
              {isOver && (
                <div className={styles.kanbanDropIndicator}>
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * KanbanCard - Default card component for items
 */
export function KanbanCard({
  item,
  showStatus = true,
  showMeta = true,
  onClick,
}) {
  return (
    <div className={styles.kanbanCard} onClick={onClick}>
      {/* Title */}
      <div className={styles.kanbanCardTitle}>
        {item.title || item.name}
      </div>

      {/* Description */}
      {item.description && (
        <div className={styles.kanbanCardDescription}>
          {item.description.substring(0, 80)}
          {item.description.length > 80 ? '...' : ''}
        </div>
      )}

      {/* Status badge */}
      {showStatus && item.status && (
        <div className={styles.kanbanCardStatus}>
          <span
            className={styles.kanbanCardStatusBadge}
            style={{ backgroundColor: item.statusColor || 'var(--text-muted)' }}
          >
            {item.status}
          </span>
        </div>
      )}

      {/* Meta info */}
      {showMeta && (
        <div className={styles.kanbanCardMeta}>
          {item.owner && (
            <span className={styles.kanbanCardOwner}>{item.owner}</span>
          )}
          {item.date && (
            <span className={styles.kanbanCardDate}>{item.date}</span>
          )}
          {item.confidence && (
            <span className={styles.kanbanCardConfidence}>
              {item.confidence}% confidence
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      {item.progress !== undefined && (
        <div className={styles.kanbanCardProgress}>
          <div
            className={styles.kanbanCardProgressBar}
            style={{ width: `${item.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * AssumptionBoard - Pre-configured Kanban for assumption validation
 */
export function AssumptionBoard({
  assumptions = [],
  onAssumptionMove,
  onAssumptionClick,
  className = '',
}) {
  // Group assumptions by status
  const columns = [
    {
      id: 'unvalidated',
      title: 'Unvalidated',
      color: '#f59e0b',
      items: assumptions.filter(a => a.status === 'unvalidated'),
    },
    {
      id: 'testing',
      title: 'Testing',
      color: '#3b82f6',
      items: assumptions.filter(a => a.status === 'testing'),
    },
    {
      id: 'validated',
      title: 'Validated',
      color: '#22c55e',
      items: assumptions.filter(a => a.status === 'validated'),
    },
    {
      id: 'invalidated',
      title: 'Invalidated',
      color: '#ef4444',
      items: assumptions.filter(a => a.status === 'invalidated'),
    },
  ];

  const handleMove = (itemId, fromColumn, toColumn) => {
    if (onAssumptionMove) {
      onAssumptionMove(itemId, toColumn);
    }
  };

  return (
    <KanbanBoard
      columns={columns}
      onItemMove={handleMove}
      onItemClick={onAssumptionClick}
      renderItem={(item) => (
        <KanbanCard
          item={{
            ...item,
            title: item.statement || item.title,
            confidence: item.confidence === 'high' ? 80 : item.confidence === 'medium' ? 50 : 20,
          }}
        />
      )}
      className={className}
    />
  );
}

/**
 * IssueBoard - Pre-configured Kanban for issue tracking
 */
export function IssueBoard({
  issues = [],
  onIssueMove,
  onIssueClick,
  className = '',
}) {
  // Group issues by status
  const columns = [
    {
      id: 'open',
      title: 'Open',
      color: '#ef4444',
      items: issues.filter(i => i.status === 'open'),
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      color: '#f59e0b',
      items: issues.filter(i => i.status === 'in_progress'),
    },
    {
      id: 'escalated',
      title: 'Escalated',
      color: '#8b5cf6',
      items: issues.filter(i => i.status === 'escalated'),
    },
    {
      id: 'resolved',
      title: 'Resolved',
      color: '#22c55e',
      items: issues.filter(i => ['resolved', 'closed'].includes(i.status)),
    },
  ];

  const handleMove = (itemId, fromColumn, toColumn) => {
    if (onIssueMove) {
      onIssueMove(itemId, toColumn);
    }
  };

  return (
    <KanbanBoard
      columns={columns}
      onItemMove={handleMove}
      onItemClick={onIssueClick}
      renderItem={(item) => (
        <KanbanCard
          item={{
            ...item,
            statusColor: item.urgency === 'critical' ? '#ef4444' : item.urgency === 'high' ? '#f59e0b' : undefined,
          }}
        />
      )}
      className={className}
    />
  );
}

export default KanbanBoard;
