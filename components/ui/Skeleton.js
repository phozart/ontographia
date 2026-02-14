// components/ui/Skeleton.js
// Reusable skeleton loading components for consistent loading states
// Task X-006: Create loading skeleton patterns

import styles from './ui.module.css';

/**
 * Base Skeleton component with shimmer animation
 * @param {Object} props
 * @param {string} [props.variant='rectangular'] - Shape: 'rectangular', 'circular', 'text'
 * @param {string|number} [props.width] - Width (defaults to 100%)
 * @param {string|number} [props.height] - Height (required for rectangular/circular)
 * @param {string} [props.className] - Additional CSS classes
 */
export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style = {},
}) {
  const baseClass = styles.skeleton;
  const variantClass = styles[`skeleton${variant.charAt(0).toUpperCase() + variant.slice(1)}`];

  return (
    <div
      className={`${baseClass} ${variantClass || ''} ${className}`}
      style={{
        width: width || (variant === 'circular' ? height : '100%'),
        height: height || (variant === 'text' ? '1em' : undefined),
        ...style,
      }}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

/**
 * Text skeleton - multiple lines of text
 * @param {Object} props
 * @param {number} [props.lines=3] - Number of lines
 * @param {string} [props.gap='8px'] - Gap between lines
 * @param {string} [props.lastLineWidth='60%'] - Width of last line
 */
export function TextSkeleton({ lines = 3, gap = '8px', lastLineWidth = '60%' }) {
  return (
    <div className={styles.skeletonText} style={{ gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height="1em"
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton - mimics a card layout
 * @param {Object} props
 * @param {boolean} [props.showImage=false] - Show image placeholder
 * @param {boolean} [props.showActions=true] - Show action buttons
 */
export function CardSkeleton({ showImage = false, showActions = true }) {
  return (
    <div className={styles.skeletonCard}>
      {showImage && (
        <Skeleton variant="rectangular" height={160} />
      )}
      <div className={styles.skeletonCardContent}>
        <div className={styles.skeletonCardHeader}>
          <Skeleton variant="text" height="1.25em" width="70%" />
          <Skeleton variant="circular" width={24} height={24} />
        </div>
        <TextSkeleton lines={2} />
        {showActions && (
          <div className={styles.skeletonCardActions}>
            <Skeleton variant="rectangular" height={32} width={80} />
            <Skeleton variant="rectangular" height={32} width={80} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * List skeleton - mimics a list view
 * @param {Object} props
 * @param {number} [props.rows=5] - Number of rows
 * @param {boolean} [props.showAvatar=false] - Show avatar placeholder
 * @param {boolean} [props.showActions=false] - Show action buttons
 */
export function ListSkeleton({ rows = 5, showAvatar = false, showActions = false }) {
  return (
    <div className={styles.skeletonList}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.skeletonListRow}>
          {showAvatar && (
            <Skeleton variant="circular" width={40} height={40} />
          )}
          <div className={styles.skeletonListContent}>
            <Skeleton variant="text" height="1em" width={`${60 + (i % 3) * 10}%`} />
            <Skeleton variant="text" height="0.875em" width={`${40 + (i % 4) * 10}%`} />
          </div>
          {showActions && (
            <Skeleton variant="rectangular" height={28} width={60} />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Table skeleton - mimics a data table
 * @param {Object} props
 * @param {number} [props.rows=5] - Number of rows
 * @param {number} [props.columns=4] - Number of columns
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className={styles.skeletonTable}>
      <div className={styles.skeletonTableHeader}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height="0.875em" width="80%" />
        ))}
      </div>
      <div className={styles.skeletonTableBody}>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className={styles.skeletonTableRow}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                variant="text"
                height="1em"
                width={`${50 + ((rowIdx + colIdx) % 4) * 12}%`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form skeleton - mimics a form layout
 * @param {Object} props
 * @param {number} [props.fields=4] - Number of form fields
 * @param {boolean} [props.showButton=true] - Show submit button
 */
export function FormSkeleton({ fields = 4, showButton = true }) {
  return (
    <div className={styles.skeletonForm}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className={styles.skeletonFormField}>
          <Skeleton variant="text" height="0.875em" width={`${80 + (i % 3) * 5}px`} />
          <Skeleton variant="rectangular" height={40} />
        </div>
      ))}
      {showButton && (
        <div className={styles.skeletonFormActions}>
          <Skeleton variant="rectangular" height={40} width={120} />
        </div>
      )}
    </div>
  );
}

/**
 * Navigator skeleton - mimics the left navigation
 * @param {Object} props
 * @param {number} [props.groups=3] - Number of nav groups
 * @param {number} [props.itemsPerGroup=4] - Items per group
 */
export function NavigatorSkeleton({ groups = 3, itemsPerGroup = 4 }) {
  return (
    <div className={styles.skeletonNavigator}>
      {Array.from({ length: groups }).map((_, groupIdx) => (
        <div key={groupIdx} className={styles.skeletonNavGroup}>
          <Skeleton variant="text" height="0.875em" width="60%" />
          <div className={styles.skeletonNavItems}>
            {Array.from({ length: itemsPerGroup }).map((_, itemIdx) => (
              <Skeleton
                key={itemIdx}
                variant="text"
                height="2em"
                width={`${70 + (itemIdx % 3) * 10}%`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard skeleton - mimics a dashboard with cards
 * @param {Object} props
 * @param {number} [props.statCards=4] - Number of stat cards
 * @param {number} [props.contentCards=2] - Number of content cards
 */
export function DashboardSkeleton({ statCards = 4, contentCards = 2 }) {
  return (
    <div className={styles.skeletonDashboard}>
      <div className={styles.skeletonStatCards}>
        {Array.from({ length: statCards }).map((_, i) => (
          <div key={i} className={styles.skeletonStatCard}>
            <Skeleton variant="text" height="2em" width="50%" />
            <Skeleton variant="text" height="0.875em" width="70%" />
          </div>
        ))}
      </div>
      <div className={styles.skeletonContentCards}>
        {Array.from({ length: contentCards }).map((_, i) => (
          <CardSkeleton key={i} showImage={false} showActions={false} />
        ))}
      </div>
    </div>
  );
}

/**
 * Kanban skeleton - mimics a kanban board
 * @param {Object} props
 * @param {number} [props.columns=3] - Number of columns
 * @param {number} [props.cardsPerColumn=3] - Cards per column
 */
export function KanbanSkeleton({ columns = 3, cardsPerColumn = 3 }) {
  return (
    <div className={styles.skeletonKanban}>
      {Array.from({ length: columns }).map((_, colIdx) => (
        <div key={colIdx} className={styles.skeletonKanbanColumn}>
          <div className={styles.skeletonKanbanHeader}>
            <Skeleton variant="text" height="1em" width="60%" />
            <Skeleton variant="circular" width={24} height={24} />
          </div>
          <div className={styles.skeletonKanbanCards}>
            {Array.from({ length: cardsPerColumn }).map((_, cardIdx) => (
              <div key={cardIdx} className={styles.skeletonKanbanCard}>
                <Skeleton variant="text" height="1em" width="80%" />
                <Skeleton variant="text" height="0.875em" width="60%" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Page skeleton - full page loading state
 * @param {Object} props
 * @param {'list'|'dashboard'|'form'|'detail'} [props.layout='list'] - Layout type
 */
export function PageSkeleton({ layout = 'list' }) {
  return (
    <div className={styles.skeletonPage}>
      {/* Header skeleton */}
      <div className={styles.skeletonPageHeader}>
        <div className={styles.skeletonPageHeaderLeft}>
          <Skeleton variant="circular" width={32} height={32} />
          <div>
            <Skeleton variant="text" height="1.25em" width={200} />
            <Skeleton variant="text" height="0.875em" width={150} />
          </div>
        </div>
        <div className={styles.skeletonPageHeaderRight}>
          <Skeleton variant="rectangular" height={36} width={100} />
        </div>
      </div>

      {/* Content based on layout */}
      <div className={styles.skeletonPageContent}>
        {layout === 'list' && <ListSkeleton rows={8} showAvatar />}
        {layout === 'dashboard' && <DashboardSkeleton />}
        {layout === 'form' && <FormSkeleton fields={6} />}
        {layout === 'detail' && (
          <>
            <CardSkeleton showImage />
            <TextSkeleton lines={6} />
          </>
        )}
      </div>
    </div>
  );
}

export default {
  Skeleton,
  TextSkeleton,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  FormSkeleton,
  NavigatorSkeleton,
  DashboardSkeleton,
  KanbanSkeleton,
  PageSkeleton,
};
