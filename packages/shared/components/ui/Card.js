// components/ui/Card.js
// Shared Card component for displaying items

import styles from './ui.module.css';

/**
 * Card - Base card component for displaying content items
 *
 * @param {boolean} selected - Selected state
 * @param {boolean} warning - Warning state (e.g., needs attention)
 * @param {function} onClick - Click handler
 * @param {ReactNode} children - Card content
 */
export function Card({
  selected = false,
  warning = false,
  onClick,
  className = '',
  children,
  ...props
}) {
  const cardClasses = [
    styles.card,
    selected && styles.selected,
    warning && styles.warning,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

// Sub-components for card structure
Card.Header = function CardHeader({ children, className = '' }) {
  return <div className={`${styles.cardHeader} ${className}`.trim()}>{children}</div>;
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`${styles.cardBody} ${className}`.trim()}>{children}</div>;
};

Card.Date = function CardDate({ children, className = '' }) {
  return <span className={`${styles.cardDate} ${className}`.trim()}>{children}</span>;
};

Card.Badge = function CardBadge({ children, color, bgColor, className = '' }) {
  return (
    <div
      className={`${styles.cardBadge} ${className}`.trim()}
      style={{ backgroundColor: bgColor, color }}
    >
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className = '' }) {
  return <h4 className={`${styles.cardTitle} ${className}`.trim()}>{children}</h4>;
};

Card.Subtitle = function CardSubtitle({ children, color, className = '' }) {
  return (
    <div className={`${styles.cardSubtitle} ${className}`.trim()} style={{ color }}>
      {children}
    </div>
  );
};

Card.Section = function CardSection({ label, children, className = '' }) {
  return (
    <div className={`${styles.cardSection} ${className}`.trim()}>
      {label && <strong>{label}</strong>}
      {typeof children === 'string' ? <p>{children}</p> : children}
    </div>
  );
};

Card.Hint = function CardHint({ children, className = '' }) {
  return <div className={`${styles.cardHint} ${className}`.trim()}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return <div className={`${styles.cardFooter} ${className}`.trim()}>{children}</div>;
};

Card.Meta = function CardMeta({ children, className = '' }) {
  return <div className={`${styles.cardMeta} ${className}`.trim()}>{children}</div>;
};

Card.Progress = function CardProgress({ value, className = '' }) {
  const color = value > 70 ? '#22c55e' : value > 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className={`${styles.cardProgress} ${className}`.trim()}>
      <div className={styles.cardProgressBar}>
        <div
          className={styles.cardProgressFill}
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span>{value}%</span>
    </div>
  );
};

Card.TimelineMarker = function CardTimelineMarker({ color, children, className = '' }) {
  return (
    <div
      className={`${styles.timelineMarker} ${className}`.trim()}
      style={{ backgroundColor: color }}
    >
      {children}
    </div>
  );
};
