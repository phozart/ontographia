// components/ui/ListView.js
// Shared list view components

import styles from './ui.module.css';

/**
 * ListView - Container for list-style content
 */
export function ListView({ children, className = '' }) {
  return (
    <div className={`${styles.listView} ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * ListViewHeader - Column headers for list view
 */
ListView.Header = function ListViewHeader({ columns, className = '' }) {
  const gridCols = columns.map(c => c.width || '1fr').join(' ');

  return (
    <div
      className={`${styles.listViewHeader} ${className}`.trim()}
      style={{ gridTemplateColumns: gridCols }}
    >
      {columns.map((col, i) => (
        <span key={i}>{col.label}</span>
      ))}
    </div>
  );
};

/**
 * ListViewBody - Container for list rows
 */
ListView.Body = function ListViewBody({ children }) {
  return <div className={styles.listViewBody}>{children}</div>;
};

/**
 * ListRow - Individual row in list view
 */
export function ListRow({
  columns,
  selected = false,
  onClick,
  children,
  className = '',
}) {
  // If columns is provided, use grid layout
  // Otherwise, just render children in a flex container
  const gridCols = columns ? columns.map(c => c.width || '1fr').join(' ') : undefined;

  return (
    <div
      className={`${styles.listRow} ${selected ? styles.selected : ''} ${className}`.trim()}
      style={gridCols ? { gridTemplateColumns: gridCols } : undefined}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Sub-components for list row content
ListRow.Date = function ListRowDate({ children, className = '' }) {
  return <span className={`${styles.listRowDate} ${className}`.trim()}>{children}</span>;
};

ListRow.Content = function ListRowContent({ children, className = '' }) {
  return <div className={`${styles.listRowContent} ${className}`.trim()}>{children}</div>;
};

ListRow.Title = function ListRowTitle({ children, className = '' }) {
  return <span className={`${styles.listRowTitle} ${className}`.trim()}>{children}</span>;
};

ListRow.Subtitle = function ListRowSubtitle({ children, className = '' }) {
  return <span className={`${styles.listRowSubtitle} ${className}`.trim()}>{children}</span>;
};

/**
 * ListContainer - Full list container with header and content area
 */
export function ListContainer({ children, className = '' }) {
  return (
    <div className={`${styles.listContainer} ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * Timeline - Timeline view container
 */
export function Timeline({ children, className = '' }) {
  return (
    <div className={`${styles.timeline} ${className}`.trim()}>
      {children}
    </div>
  );
}

Timeline.Group = function TimelineGroup({ label, count, children }) {
  return (
    <div className={styles.timelineGroup}>
      <div className={styles.timelineGroupHeader}>
        <h3>{label}</h3>
        {count !== undefined && (
          <span className={styles.timelineGroupCount}>
            {count} item{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className={styles.timelineItems}>
        {children}
      </div>
    </div>
  );
};

/**
 * ContentArea - Generic scrollable content area
 */
export function ContentArea({ children, className = '' }) {
  return (
    <div className={`${styles.contentArea} ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * Placeholder - Loading/placeholder state
 */
export function Placeholder({ children }) {
  return (
    <div className={styles.placeholder}>
      <div className={styles.placeholderContent}>
        {children}
      </div>
    </div>
  );
}
